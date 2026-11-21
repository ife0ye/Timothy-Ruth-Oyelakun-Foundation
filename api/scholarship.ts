import { assertSameOrigin, cleanText, clientIp, handleError, HttpError, json, rateLimit } from './_lib/http.js';
import { emailConfigured, escapeHtml, htmlRows, htmlSections, sendEmail, type Attachment } from './_lib/email.js';
import {
  ADDRESS_KEYS,
  ANSWER_KEYS,
  DECLARATIONS,
  describeAnswers,
  DOCUMENT_KEYS,
  DOCUMENTS,
  documentRequired,
  EMPTY_ANSWERS,
  FILE_RULES,
  formatBytes,
  SCHOLARSHIP_LIMITS,
  validateAnswers,
  type DeclarationKey,
  type ScholarshipAnswers,
} from '../shared/scholarship.js';

// A real applicant takes minutes over this form; anything faster is a bot.
const MIN_FILL_MS = 15_000;
// Vercel refuses bodies above 4.5 MB before this code runs; this catches anything that slips past.
const MAX_BODY_BYTES = 4_600_000;

const REF_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/** Where applications go: CONTACT_TO_EMAIL (info@trofng.org), unless SCHOLARSHIP_TO_EMAIL overrides it. */
function recipients(): string[] {
  const configured = (process.env.SCHOLARSHIP_TO_EMAIL ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const list = configured.length ? configured : [process.env.CONTACT_TO_EMAIL!];
  return [...new Set(list.map((s) => s.toLowerCase()))];
}

/** A short reference an applicant can read out over the phone, e.g. TROF-S-2611-K7Q2M. */
function makeReference(now = new Date()): string {
  const yymm = `${String(now.getUTCFullYear()).slice(2)}${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
  const random = crypto.getRandomValues(new Uint8Array(5));
  const code = Array.from(random, (b) => REF_ALPHABET[b % REF_ALPHABET.length]).join('');
  return `TROF-S-${yymm}-${code}`;
}

/** Identifies a file by its first bytes rather than trusting the name or the browser's label. */
function sniff(bytes: Uint8Array): string | null {
  const ascii = (from: number, to: number) => String.fromCharCode(...bytes.subarray(from, to));
  if (ascii(0, 4) === '%PDF') return 'pdf';
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'jpg';
  if (bytes[0] === 0x89 && ascii(1, 4) === 'PNG') return 'png';
  if (ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WEBP') return 'webp';
  if (ascii(4, 8) === 'ftyp' && ['heic', 'heix', 'heim', 'heis', 'hevc', 'mif1', 'msf1'].includes(ascii(8, 12))) return 'heic';
  return null;
}

function readAnswers(raw: Record<string, unknown>): ScholarshipAnswers {
  const answers = { ...EMPTY_ANSWERS };
  for (const key of ANSWER_KEYS) {
    const multiline = ADDRESS_KEYS.includes(key);
    const max = multiline ? SCHOLARSHIP_LIMITS.address : key.toLowerCase().includes('email') ? SCHOLARSHIP_LIMITS.email : SCHOLARSHIP_LIMITS.short;
    answers[key] = cleanText(raw[key], max, { multiline });
  }
  answers.email = answers.email.toLowerCase();
  return answers;
}

export async function POST(request: Request): Promise<Response> {
  try {
    assertSameOrigin(request);
    rateLimit(`scholarship:${clientIp(request)}`, 6, 30 * 60_000);

    if (Number(request.headers.get('content-length') ?? 0) > MAX_BODY_BYTES) {
      throw new HttpError(413, `Your documents are too large. Together they must be under ${formatBytes(FILE_RULES.totalBytes)}.`);
    }
    if (!(request.headers.get('content-type') ?? '').includes('multipart/form-data')) throw new HttpError(415, 'Expected a form upload.');

    let form: FormData;
    let data: Record<string, unknown>;
    try {
      form = await request.formData();
      const parsed: unknown = JSON.parse(String(form.get('data') ?? ''));
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error();
      data = parsed as Record<string, unknown>;
    } catch {
      throw new HttpError(400, 'Malformed request.');
    }

    // Bots fill hidden fields and submit instantly. Pretend success so they don't adapt.
    const elapsed = Date.now() - Number(data.startedAt);
    if (cleanText(data.website, 200) || !Number.isFinite(elapsed) || elapsed < MIN_FILL_MS) {
      return json({ ok: true, reference: makeReference(), confirmationSent: false });
    }

    const answers = readAnswers((data.answers ?? {}) as Record<string, unknown>);
    const problems = Object.values(validateAnswers(answers));
    if (problems.length) throw new HttpError(400, problems[0]!);

    const declarations = (data.declarations ?? {}) as Record<string, unknown>;
    for (const key of Object.keys(DECLARATIONS) as DeclarationKey[]) {
      if (declarations[key] !== true) throw new HttpError(400, 'Please tick every declaration before submitting.');
    }

    // Supporting documents
    const reference = makeReference();
    const attachments: Attachment[] = [];
    const fileList: [string, string][] = [];
    let total = 0;

    for (const key of DOCUMENT_KEYS) {
      const files = form.getAll(key).filter((v): v is File => typeof v === 'object' && v !== null && 'arrayBuffer' in v);
      const label = DOCUMENTS[key].label;
      if (!files.length && documentRequired(key, answers.admission)) throw new HttpError(400, `Please attach your ${label.toLowerCase()}.`);
      if (files.length > FILE_RULES.perDocument) throw new HttpError(400, `Please attach at most ${FILE_RULES.perDocument} files for your ${label.toLowerCase()}.`);

      const names: string[] = [];
      for (const [i, file] of files.entries()) {
        total += file.size;
        if (total > FILE_RULES.totalBytes + 64_000) {
          throw new HttpError(413, `Your documents are too large. Together they must be under ${formatBytes(FILE_RULES.totalBytes)}.`);
        }
        const bytes = new Uint8Array(await file.arrayBuffer());
        const ext = bytes.length ? sniff(bytes) : null;
        if (!ext) throw new HttpError(400, `“${cleanText(file.name, 80)}” isn't a PDF or photo we can open. Please use PDF, JPG or PNG.`);

        const filename = `${reference}-${key}${files.length > 1 ? `-${i + 1}` : ''}.${ext}`;
        attachments.push({ filename, content: Buffer.from(bytes).toString('base64') });
        names.push(`${filename} (${formatBytes(file.size)})`);
      }
      fileList.push([label, names.length ? names.join('\n') : 'Not attached (newly admitted)']);
    }

    if (!emailConfigured()) {
      console.error('[scholarship] email is not configured');
      return json({ error: 'Our application service is offline right now. Please download the PDF form and email it to us instead.' }, 503);
    }

    const sections = describeAnswers(answers);
    const plain = (rows: [string, string][]) => rows.map(([k, v]) => `${k}: ${v}`).join('\n');
    const intro = `New scholarship application from ${answers.fullName}. Reference: ${reference}.`;

    await sendEmail({
      to: recipients(),
      subject: `Scholarship application: ${answers.fullName} (${reference})`,
      replyTo: answers.email,
      attachments,
      timeout: 25_000,
      text: [
        intro,
        ...sections.map((s) => `${s.title.toUpperCase()}\n${plain(s.rows)}`),
        `DOCUMENTS ATTACHED\n${plain(fileList)}`,
        'The applicant ticked every declaration on the form.',
      ].join('\n\n'),
      html:
        `<p style="font:15px/1.5 -apple-system,Segoe UI,sans-serif;color:#10262d">${escapeHtml(intro)}</p>` +
        htmlSections([...sections, { title: 'Documents attached', rows: fileList }]) +
        `<p style="font:14px/1.5 -apple-system,Segoe UI,sans-serif;color:#5b6b6f;margin-top:24px">The applicant ticked every declaration on the form:</p>` +
        htmlRows(Object.values(DECLARATIONS).map((text) => ['✓', text])),
    });

    // A receipt for the applicant. It carries no text they typed, so it can't be used to send spam.
    let confirmationSent = false;
    try {
      const lines = [
        'Thank you for applying for the Timothy & Ruth Oyelakun Foundation scholarship.',
        `We have received your application and documents. Your reference is ${reference}. Please quote it if you contact us.`,
        'The foundation may contact you, your parent or guardian, or your referee to verify the information you gave.',
        'Timothy & Ruth Oyelakun Foundation, Ogbomoso, Oyo State',
      ];
      await sendEmail({
        to: answers.email,
        subject: `We received your scholarship application (${reference})`,
        replyTo: process.env.CONTACT_TO_EMAIL,
        text: lines.join('\n\n'),
        html: lines.map((l) => `<p style="font:15px/1.6 -apple-system,Segoe UI,sans-serif;color:#10262d">${escapeHtml(l)}</p>`).join(''),
      });
      confirmationSent = true;
    } catch (error) {
      console.error('[scholarship] confirmation email failed', error instanceof Error ? error.message : error);
    }

    return json({ ok: true, reference, confirmationSent });
  } catch (error) {
    return handleError(error, 'scholarship');
  }
}
