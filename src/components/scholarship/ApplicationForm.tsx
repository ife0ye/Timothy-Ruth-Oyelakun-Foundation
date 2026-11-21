import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowLeft, ArrowRight, Check, Loader2, Pencil, Send } from 'lucide-react';
import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode, type RefObject } from 'react';
import {
  CGPA_SCALES,
  DECLARATIONS,
  describeAnswers,
  DOCUMENT_KEYS,
  DOCUMENTS,
  documentRequired,
  EMPTY_ANSWERS,
  FILE_RULES,
  formatBytes,
  GENDERS,
  INSTITUTION_TYPES,
  LEVELS,
  SCHOLARSHIP_LIMITS,
  STEPS,
  validateAnswers,
  type AnswerKey,
  type DeclarationKey,
  type DocumentKey,
  type InstitutionType,
  type ScholarshipAnswers,
} from '../../../shared/scholarship';
import { SCHOLARSHIP } from '../../content';
import { ApiError, postForm } from '../../lib/api';
import { EASE_OUT } from '../../lib/motion';
import { shrinkImage } from '../../lib/shrinkImage';
import { AddressGroup, Checkbox, ChoiceField, DocumentSlot, fieldId, SelectField, TextField, type PickedFile } from './fields';

// Kept for this browser tab only, so a refresh or a dropped connection doesn't lose a half-finished
// form, but nothing lingers on a shared or café computer once the tab is closed.
const DRAFT_KEY = 'trof-scholarship-draft';

type Files = Record<DocumentKey, PickedFile[]>;
type Declarations = Record<DeclarationKey, boolean>;
type Phase =
  | { name: 'editing' }
  | { name: 'sending' }
  | { name: 'error'; message: string; offline: boolean }
  | { name: 'sent'; reference: string; email: string; confirmationSent: boolean };

const NO_FILES: Files = { olevel: [], transcript: [], admission: [], reference: [] };
const NO_DECLARATIONS: Declarations = { truthful: false, noLoan: false, consent: false };

function loadDraft(): { answers: ScholarshipAnswers; step: number } {
  try {
    const saved = JSON.parse(sessionStorage.getItem(DRAFT_KEY) ?? 'null') as { answers?: Partial<ScholarshipAnswers>; step?: number } | null;
    if (saved?.answers) {
      const answers = { ...EMPTY_ANSWERS };
      for (const key of Object.keys(EMPTY_ANSWERS) as AnswerKey[]) {
        if (typeof saved.answers[key] === 'string') answers[key] = saved.answers[key];
      }
      // Files can't be kept across a reload, so never resume past the documents step.
      return { answers, step: Math.min(Math.max(0, Number(saved.step) || 0), 4) };
    }
  } catch {
    /* storage unavailable or corrupt: start fresh */
  }
  return { answers: { ...EMPTY_ANSWERS }, step: 0 };
}

const todayIso = () => new Date().toISOString().slice(0, 10);
let nextFileId = 0;

export function ApplicationForm() {
  const uid = useId().replace(/:/g, '');
  const reduce = useReducedMotion();
  const [initial] = useState(loadDraft);
  const [step, setStep] = useState(initial.step);
  const [direction, setDirection] = useState(1);
  const [answers, setAnswers] = useState<ScholarshipAnswers>(initial.answers);
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [files, setFiles] = useState<Files>(NO_FILES);
  const [busy, setBusy] = useState<Partial<Record<DocumentKey, boolean>>>({});
  const [declarations, setDeclarations] = useState<Declarations>(NO_DECLARATIONS);
  const [phase, setPhase] = useState<Phase>({ name: 'editing' });
  const [honeypot, setHoneypot] = useState('');
  const startedAt = useRef(Date.now());
  const top = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const moved = useRef(false);

  useEffect(() => {
    try {
      if (phase.name === 'sent') sessionStorage.removeItem(DRAFT_KEY);
      else sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ answers, step }));
    } catch {
      /* storage unavailable: the form still works, it just won't survive a reload */
    }
  }, [answers, step, phase.name]);

  // After moving between steps, bring the top of the form into view and give it focus.
  useEffect(() => {
    if (!moved.current) return;
    const box = top.current?.getBoundingClientRect();
    if (box && box.top < 0) top.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    heading.current?.focus({ preventScroll: true });
  }, [step, phase.name, reduce]);

  const update = (name: AnswerKey, value: string) => {
    setAnswers((a) => {
      const next = { ...a, [name]: value };
      // A level from the other kind of institution no longer applies.
      if (name === 'institutionType' && !LEVELS[value as InstitutionType]?.includes(a.level)) next.level = '';
      return next;
    });
    if (errors[name]) setErrors((e) => ({ ...e, [name]: undefined }));
    if (phase.name === 'error') setPhase({ name: 'editing' });
  };

  const totalBytes = DOCUMENT_KEYS.reduce((sum, key) => sum + files[key].reduce((s, f) => s + f.file.size, 0), 0);
  const overLimit = totalBytes > FILE_RULES.totalBytes;

  const addFiles = async (key: DocumentKey, picked: File[]) => {
    setErrors((e) => ({ ...e, [key]: undefined }));
    const room = FILE_RULES.perDocument - files[key].length;
    const accepted = picked.filter((f) => f.type in FILE_RULES.types || /\.(pdf|jpe?g|png|webp|heic|heif)$/i.test(f.name));
    if (accepted.length < picked.length) {
      setErrors((e) => ({ ...e, [key]: 'Please use PDF files or photos (JPG or PNG).' }));
    }
    if (accepted.length > room) {
      setErrors((e) => ({ ...e, [key]: `You can attach up to ${FILE_RULES.perDocument} files here.` }));
    }
    const toAdd = accepted.slice(0, Math.max(0, room));
    if (!toAdd.length) return;

    setBusy((b) => ({ ...b, [key]: true }));
    const prepared = await Promise.all(toAdd.map((f) => shrinkImage(f).catch(() => f)));
    setBusy((b) => ({ ...b, [key]: false }));
    setFiles((current) => ({
      ...current,
      [key]: [...current[key], ...prepared.map((file) => ({ id: `f${nextFileId++}`, file }))].slice(0, FILE_RULES.perDocument),
    }));
  };

  const removeFile = (key: DocumentKey, id: string) => {
    setFiles((current) => ({ ...current, [key]: current[key].filter((f) => f.id !== id) }));
    setErrors((e) => ({ ...e, total: undefined }));
  };

  /** Problems on the given step, keyed by the id of the element to focus. */
  const problemsOn = (index: number): Record<string, string> => {
    const id = STEPS[index]!.id;
    const found: Record<string, string> = {};
    if (index < 4) {
      const all = validateAnswers(answers);
      for (const key of STEPS[index]!.keys as readonly AnswerKey[]) if (all[key]) found[key] = all[key]!;
    } else if (id === 'documents') {
      for (const key of DOCUMENT_KEYS) {
        if (documentRequired(key, answers.admission) && !files[key].length) found[key] = `Please attach your ${DOCUMENTS[key].label.toLowerCase()}.`;
      }
      if (overLimit) found.total = `Together your files come to ${formatBytes(totalBytes)}, over the ${formatBytes(FILE_RULES.totalBytes)} limit. Remove a file or use smaller photos.`;
    } else {
      for (const key of Object.keys(DECLARATIONS) as DeclarationKey[]) if (!declarations[key]) found[key] = 'Please tick this to continue.';
    }
    return found;
  };

  const focusFirst = (problems: Record<string, string>) => {
    const first = Object.keys(problems)[0];
    if (!first) return;
    const target = first === 'total' ? `${uid}-total` : fieldId(uid, first);
    requestAnimationFrame(() => document.getElementById(target)?.focus());
  };

  const goTo = (index: number) => {
    moved.current = true;
    setDirection(index > step ? 1 : -1);
    setErrors({});
    setStep(index);
  };

  const next = () => {
    const problems = problemsOn(step);
    setErrors(problems);
    if (Object.keys(problems).length) return focusFirst(problems);
    goTo(step + 1);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (step < STEPS.length - 1) return next();

    // Check every step again in case something changed after it was passed.
    for (let i = 0; i < STEPS.length; i++) {
      const problems = problemsOn(i);
      if (Object.keys(problems).length) {
        if (i !== step) goTo(i);
        setErrors(problems);
        return focusFirst(problems);
      }
    }

    setPhase({ name: 'sending' });
    const body = new FormData();
    body.append('data', JSON.stringify({ answers, declarations, startedAt: startedAt.current, website: honeypot }));
    for (const key of DOCUMENT_KEYS) {
      if (key === 'transcript' && !documentRequired(key, answers.admission) && !files[key].length) continue;
      for (const { file } of files[key]) body.append(key, file, file.name);
    }

    try {
      const result = await postForm<{ reference: string; confirmationSent: boolean }>('/api/scholarship', body);
      moved.current = true;
      setPhase({ name: 'sent', reference: result.reference, email: answers.email.trim(), confirmationSent: result.confirmationSent });
    } catch (error) {
      setPhase({
        name: 'error',
        message: error instanceof Error ? error.message : 'Something went wrong.',
        offline: error instanceof ApiError && error.status === 503,
      });
    }
  };

  if (phase.name === 'sent') return <Sent {...phase} headingRef={heading} />;

  const current = STEPS[step]!;
  const continuing = answers.admission === 'continuing';
  const levels = LEVELS[answers.institutionType as InstitutionType];
  const field = { uid, values: answers, onChange: update };
  const common = (name: AnswerKey) => ({ uid, name, value: answers[name], onChange: update, error: errors[name] });

  return (
    <div ref={top} className="scroll-mt-28 rounded-[2rem] bg-paper-2 p-5 sm:p-10">
      <Progress step={step} />

      <form onSubmit={submit} noValidate className="mt-8">
        {/* Hidden from people; bots tend to fill it in. */}
        <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
          <label htmlFor={`${uid}-website`}>Leave this empty</label>
          <input id={`${uid}-website`} tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
        </div>

        <AnimatePresence mode="wait" initial={false} custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={{
              enter: (d: number) => ({ opacity: 0, x: reduce ? 0 : d * 28 }),
              shown: { opacity: 1, x: 0 },
              leave: (d: number) => ({ opacity: 0, x: reduce ? 0 : d * -28 }),
            }}
            initial="enter"
            animate="shown"
            exit="leave"
            transition={{ duration: 0.28, ease: EASE_OUT }}
          >
            <h3 ref={heading} tabIndex={-1} className="heading text-[clamp(1.8rem,3vw,2.3rem)] text-ink outline-none">
              {current.title}
            </h3>

            {current.id === 'personal' && (
              <div className="mt-7 grid gap-5 sm:grid-cols-2">
                <TextField {...common('fullName')} label="Full name" hint="As it appears on your school records." autoComplete="name" className="sm:col-span-2" />
                <TextField {...common('dateOfBirth')} label="Date of birth" type="date" autoComplete="bday" maxDate={todayIso()} />
                <ChoiceField {...common('gender')} label="Gender" options={GENDERS.map((g) => ({ value: g, label: g }))} />
                <AddressGroup {...field} errors={errors} keys={{ address: 'address', lga: 'lga', state: 'stateOfOrigin' }} whose="Your" />
                <TextField {...common('phone')} label="Phone number" type="tel" inputMode="tel" autoComplete="tel" placeholder="0803 123 4567" max={SCHOLARSHIP_LIMITS.phone} />
                <TextField
                  {...common('email')}
                  label="Email address"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  hint="We'll send your confirmation here."
                  max={SCHOLARSHIP_LIMITS.email}
                />
              </div>
            )}

            {current.id === 'academic' && (
              <div className="mt-7 grid gap-5 sm:grid-cols-2">
                <ChoiceField
                  {...common('admission')}
                  label="Which describes you?"
                  className="sm:col-span-2"
                  columns={3}
                  options={[
                    { value: 'utme', label: 'Newly admitted', detail: 'Through UTME' },
                    { value: 'direct-entry', label: 'Newly admitted', detail: 'Through Direct Entry' },
                    { value: 'continuing', label: 'Already studying', detail: 'At least one session completed' },
                  ]}
                />
                <ChoiceField
                  {...common('institutionType')}
                  label="Type of institution"
                  className="sm:col-span-2"
                  options={Object.entries(INSTITUTION_TYPES).map(([value, label]) => ({ value, label }))}
                />
                <TextField {...common('institution')} label="Institution" placeholder="e.g. Ladoke Akintola University of Technology" className="sm:col-span-2" />
                <TextField {...common('course')} label="Course of study" />
                <SelectField
                  {...common('level')}
                  label="Current level of study"
                  options={levels ?? []}
                  placeholder={levels ? 'Choose your level' : 'Choose the type of institution first'}
                />

                <AnimatePresence initial={false}>
                  {continuing && (
                    <motion.div
                      className="sm:col-span-2"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: EASE_OUT }}
                    >
                      <div className="grid gap-5 pt-1 sm:grid-cols-2">
                        <TextField
                          {...common('cgpa')}
                          label="CGPA"
                          inputMode="decimal"
                          placeholder="e.g. 3.72"
                          max={SCHOLARSHIP_LIMITS.cgpa}
                          hint={`At least ${CGPA_SCALES[answers.cgpaScale as '5' | '4']?.min.toFixed(2) ?? '3.50'} is needed.`}
                        />
                        <ChoiceField
                          {...common('cgpaScale')}
                          label="Grading scale"
                          options={(['5', '4'] as const).map((value) => ({ value, label: `${CGPA_SCALES[value].max.toFixed(1)}-point`, detail: `CGPA ${CGPA_SCALES[value].label}` }))}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {current.id === 'parent' && (
              <div className="mt-7 grid gap-5 sm:grid-cols-2">
                <TextField {...common('parentName')} label="Full name" autoComplete="off" />
                <TextField {...common('parentTitle')} label="Title" placeholder="e.g. Mr, Mrs, Dr, Chief" list={`${uid}-titles`} />
                <TextField {...common('parentEducation')} label="Educational background" placeholder="e.g. SSCE, OND, B.Sc." />
                <TextField {...common('parentOccupation')} label="Occupation" />
                <AddressGroup {...field} errors={errors} keys={{ address: 'parentAddress', lga: 'parentLga', state: 'parentState' }} whose="Their" />
                <TextField {...common('parentPhone')} label="Phone number" type="tel" inputMode="tel" placeholder="0803 123 4567" max={SCHOLARSHIP_LIMITS.phone} />
                <TextField {...common('parentEmail')} label="Email address" type="email" inputMode="email" optional max={SCHOLARSHIP_LIMITS.email} />
              </div>
            )}

            {current.id === 'referee' && (
              <div className="mt-7 grid gap-5 sm:grid-cols-2">
                <p className="prose-body -mt-2 leading-relaxed text-ink-soft sm:col-span-2">
                  Someone who knows you well, such as a teacher, lecturer, school principal or religious leader. They also write
                  your letter of recommendation.
                </p>
                <TextField {...common('refereeName')} label="Full name" autoComplete="off" />
                <TextField {...common('refereeTitle')} label="Title or position" placeholder="e.g. Rev., Principal, Dr" list={`${uid}-titles`} />
                <AddressGroup {...field} errors={errors} keys={{ address: 'refereeAddress', lga: 'refereeLga', state: 'refereeState' }} whose="Their" />
                <TextField {...common('refereePhone')} label="Phone number" type="tel" inputMode="tel" placeholder="0803 123 4567" max={SCHOLARSHIP_LIMITS.phone} />
                <TextField {...common('refereeEmail')} label="Email address" type="email" inputMode="email" optional max={SCHOLARSHIP_LIMITS.email} />
              </div>
            )}

            {current.id === 'documents' && (
              <div className="mt-7 space-y-3">
                <p className="prose-body mb-5 leading-relaxed text-ink-soft">
                  Attach a PDF or a clear photo of each. If a document has more than one page, add up to {FILE_RULES.perDocument} files.
                </p>
                {DOCUMENT_KEYS.map((key) => (
                  <DocumentSlot
                    key={key}
                    id={fieldId(uid, key)}
                    label={DOCUMENTS[key].label}
                    hint={DOCUMENTS[key].hint}
                    required={documentRequired(key, answers.admission)}
                    files={files[key]}
                    busy={Boolean(busy[key])}
                    error={errors[key]}
                    onAdd={(picked) => addFiles(key, picked)}
                    onRemove={(id) => removeFile(key, id)}
                  />
                ))}
                <SizeMeter id={`${uid}-total`} used={totalBytes} error={errors.total} />
              </div>
            )}

            {current.id === 'review' && (
              <Review answers={answers} files={files} onEdit={goTo}>
                <fieldset className="mt-10 rounded-2xl bg-paper p-5 ring-1 ring-line sm:p-6">
                  <legend className="sr-only">Declarations</legend>
                  <p className="mb-3 px-1 font-medium text-ink">Before you submit</p>
                  {(Object.keys(DECLARATIONS) as DeclarationKey[]).map((key) => (
                    <Checkbox
                      key={key}
                      id={fieldId(uid, key)}
                      checked={declarations[key]}
                      invalid={Boolean(errors[key])}
                      onChange={(checked) => {
                        setDeclarations((d) => ({ ...d, [key]: checked }));
                        if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
                      }}
                    >
                      {DECLARATIONS[key]}
                    </Checkbox>
                  ))}
                  {(Object.keys(DECLARATIONS) as DeclarationKey[]).some((k) => errors[k]) && (
                    <p className="px-1 pt-2 text-sm text-oxblood">Please tick each box to submit your application.</p>
                  )}
                </fieldset>
              </Review>
            )}
          </motion.div>
        </AnimatePresence>

        <datalist id={`${uid}-titles`}>
          {['Mr', 'Mrs', 'Miss', 'Ms', 'Dr', 'Prof', 'Chief', 'Pastor', 'Rev.', 'Alhaji', 'Alhaja', 'Engr.'].map((t) => (
            <option key={t} value={t} />
          ))}
        </datalist>

        <AnimatePresence>
          {phase.name === 'error' && (
            <motion.div
              role="alert"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: EASE_OUT }}
              className="mt-8 rounded-xl bg-oxblood/10 px-4 py-3 text-sm leading-relaxed text-oxblood-deep"
            >
              {phase.message}{' '}
              {phase.offline && (
                <a className="font-semibold underline" href={SCHOLARSHIP.pdfPath} download>
                  Download the PDF form
                </a>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-10 flex flex-col-reverse gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
          {step > 0 ? (
            <button
              type="button"
              onClick={() => goTo(step - 1)}
              disabled={phase.name === 'sending'}
              className="press inline-flex items-center justify-center gap-2 rounded-full px-5 py-3.5 font-semibold text-ink-soft hover:bg-paper-3 hover:text-ink disabled:opacity-50"
            >
              <ArrowLeft size={18} />
              Back
            </button>
          ) : (
            <p className="text-sm text-muted">Takes about 15 minutes. Your answers are kept if you refresh the page.</p>
          )}
          <button
            type="submit"
            disabled={phase.name === 'sending' || Object.values(busy).some(Boolean)}
            className="btn-primary py-4 disabled:cursor-wait disabled:opacity-80"
          >
            {phase.name === 'sending' ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Sending your application…
              </>
            ) : step === STEPS.length - 1 ? (
              <>
                Submit application
                <Send size={17} />
              </>
            ) : (
              <>
                Continue
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

function Progress({ step }: { step: number }) {
  return (
    <div>
      <p className="flex items-baseline justify-between gap-4 text-sm">
        <span className="eyebrow text-oxblood">
          Step {step + 1} of {STEPS.length}
        </span>
        {step < STEPS.length - 1 && <span className="text-muted">Next: {STEPS[step + 1]!.title}</span>}
      </p>
      <ol className="mt-4 grid grid-cols-6 gap-1.5" aria-label="Progress">
        {STEPS.map((s, i) => (
          <li key={s.id} className="h-1.5 overflow-hidden rounded-full bg-ink/10" aria-current={i === step ? 'step' : undefined}>
            <span className="sr-only">
              {s.title}
              {i < step ? ' (done)' : ''}
            </span>
            <motion.span
              aria-hidden
              className="block h-full origin-left rounded-full bg-teal"
              initial={false}
              animate={{ scaleX: i <= step ? 1 : 0 }}
              transition={{ duration: 0.45, ease: EASE_OUT }}
            />
          </li>
        ))}
      </ol>
    </div>
  );
}

function SizeMeter({ id, used, error }: { id: string; used: number; error?: string }) {
  const share = Math.min(1, used / FILE_RULES.totalBytes);
  const over = used > FILE_RULES.totalBytes;
  return (
    <div id={id} tabIndex={-1} className="rounded-2xl px-1 pt-3 outline-none">
      <div className="flex items-baseline justify-between text-sm">
        <span className="text-muted">Total upload</span>
        <span className={`tabular-nums ${over ? 'font-semibold text-oxblood' : 'text-ink-soft'}`}>
          {formatBytes(used)} of {formatBytes(FILE_RULES.totalBytes)}
        </span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink/10">
        <motion.div
          className={`h-full origin-left rounded-full ${over ? 'bg-oxblood' : 'bg-teal'}`}
          initial={false}
          animate={{ scaleX: used ? Math.max(0.02, share) : 0 }}
          transition={{ duration: 0.4, ease: EASE_OUT }}
        />
      </div>
      {error && <p className="pt-3 text-sm text-oxblood">{error}</p>}
    </div>
  );
}

function Review({
  answers,
  files,
  onEdit,
  children,
}: {
  answers: ScholarshipAnswers;
  files: Files;
  onEdit: (step: number) => void;
  children: ReactNode;
}) {
  const sections = describeAnswers(answers);
  const documentRows: [string, string][] = DOCUMENT_KEYS.filter((k) => files[k].length).map((k) => [
    DOCUMENTS[k].label,
    files[k].map((f) => f.file.name).join(', '),
  ]);

  return (
    <div className="mt-7">
      <p className="prose-body leading-relaxed text-ink-soft">Check your answers. You can change anything before you submit.</p>
      <div className="mt-6 space-y-3">
        {[...sections, { title: 'Documents', rows: documentRows }].map((section, i) => (
          <section key={section.title} className="rounded-2xl bg-paper p-5 ring-1 ring-line sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <h4 className="font-semibold text-ink">{section.title}</h4>
              <button
                type="button"
                onClick={() => onEdit(i)}
                className="press inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold text-teal hover:bg-teal/[0.07]"
                aria-label={`Change ${section.title.toLowerCase()}`}
              >
                <Pencil size={13} />
                Change
              </button>
            </div>
            <dl className="mt-3 grid gap-x-6 gap-y-2 text-[0.95rem] sm:grid-cols-[11rem_1fr]">
              {section.rows.map(([term, value]) => (
                <div key={term} className="contents">
                  <dt className="text-muted">{term}</dt>
                  <dd className="mb-2 whitespace-pre-line break-words text-ink sm:mb-0">{value}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
      {children}
    </div>
  );
}

function Sent({
  reference,
  email,
  confirmationSent,
  headingRef,
}: {
  reference: string;
  email: string;
  confirmationSent: boolean;
  headingRef: RefObject<HTMLHeadingElement | null>;
}) {
  useEffect(() => headingRef.current?.focus({ preventScroll: true }), [headingRef]);

  return (
    <motion.div
      className="flex min-h-[32rem] flex-col items-center justify-center rounded-[2rem] bg-paper-2 px-6 py-14 text-center sm:px-10"
      initial={{ opacity: 0, filter: 'blur(6px)' }}
      animate={{ opacity: 1, filter: 'blur(0px)' }}
      transition={{ duration: 0.4 }}
      role="status"
    >
      <motion.span
        className="grid size-16 place-items-center rounded-full bg-teal text-paper"
        initial={{ scale: 0.6 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', bounce: 0.45, duration: 0.6 }}
      >
        <Check size={28} />
      </motion.span>
      <h3 ref={headingRef} tabIndex={-1} className="heading mt-8 text-[2.4rem] text-ink outline-none">
        Application received.
      </h3>
      <p className="mt-3 max-w-md text-lg leading-relaxed text-ink-soft">Thank you for applying. Your reference number is</p>
      <p className="mt-4 rounded-xl bg-paper px-5 py-3 font-mono text-[1.35rem] font-semibold tracking-wider text-ink ring-1 ring-line">{reference}</p>
      <p className="mt-4 max-w-md text-ink-soft">
        Please write it down or take a screenshot.
        {confirmationSent && (
          <>
            {' '}
            We've also emailed it to <span className="font-medium text-ink">{email}</span>.
          </>
        )}
      </p>
      <p className="mt-8 max-w-md border-t border-line pt-6 text-sm leading-relaxed text-muted">
        The foundation may contact you, your parent or guardian, or your referee to verify the information you gave.
      </p>
    </motion.div>
  );
}
