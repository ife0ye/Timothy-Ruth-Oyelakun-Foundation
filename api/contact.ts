import { assertSameOrigin, cleanText, clientIp, handleError, HttpError, json, rateLimit, readJson } from './_lib/http.js';
import { emailConfigured, htmlRows, sendEmail } from './_lib/email.js';
import { EMAIL_PATTERN, LIMITS } from '../shared/donation.js';

const MIN_FILL_MS = 2500;

export async function POST(request: Request): Promise<Response> {
  try {
    assertSameOrigin(request);
    rateLimit(`contact:${clientIp(request)}`, 5, 15 * 60_000);

    const body = await readJson(request);

    // Bots fill hidden fields and submit instantly. Pretend success so they don't adapt.
    const honeypot = cleanText(body.website, 200);
    const elapsed = Date.now() - Number(body.startedAt);
    if (honeypot || !Number.isFinite(elapsed) || elapsed < MIN_FILL_MS) {
      return json({ ok: true });
    }

    const name = cleanText(body.name, LIMITS.name);
    const email = cleanText(body.email, LIMITS.email).toLowerCase();
    const subject = cleanText(body.subject, LIMITS.subject);
    const message = cleanText(body.message, LIMITS.message, { multiline: true });

    if (!name) throw new HttpError(400, 'Please tell us your name.');
    if (!EMAIL_PATTERN.test(email)) throw new HttpError(400, 'Please enter a valid email address.');
    if (!subject) throw new HttpError(400, 'Please add a subject.');
    if (message.length < 10) throw new HttpError(400, 'Please write a little more in your message.');

    if (!emailConfigured()) {
      console.error('[contact] email is not configured');
      return json({ error: 'Our message service is offline. Please email us directly.' }, 503);
    }

    const rows: [string, string][] = [
      ['From', `${name} <${email}>`],
      ['Subject', subject],
      ['Message', message],
    ];
    await sendEmail({
      to: process.env.CONTACT_TO_EMAIL!,
      subject: `Website message: ${subject}`,
      text: rows.map(([k, v]) => `${k}: ${v}`).join('\n\n'),
      html: htmlRows(rows),
      replyTo: email,
    });

    return json({ ok: true });
  } catch (error) {
    return handleError(error, 'contact');
  }
}
