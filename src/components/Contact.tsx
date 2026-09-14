import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, ArrowUpRight, Check, Copy, Loader2 } from 'lucide-react';
import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { EMAIL_PATTERN, LIMITS } from '../../shared/donation';
import { MAPS_URL, OFFICE_HOURS, ORG } from '../content';
import { ApiError, postJson } from '../lib/api';
import { EASE_OUT } from '../lib/motion';
import { LineReveal, Reveal } from './primitives';

export function Contact() {
  return (
    <section id="contact" className="px-5 py-24 sm:px-8 sm:py-32 lg:py-40">
      <div className="mx-auto grid max-w-[88rem] gap-16 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-5">
          <Reveal>
            <p className="eyebrow mb-5 text-oxblood">Contact</p>
          </Reveal>
          <LineReveal className="heading text-[clamp(2.4rem,4.4vw,3.9rem)] text-ink" lines={['Write to us,', 'call, or visit.']} />
          <Reveal delay={0.1}>
            <p className="prose-body mt-6 max-w-md text-lg leading-relaxed text-ink-soft">
              Questions about our work, a partnership, or someone who needs help? We would love to hear from you.
            </p>
          </Reveal>

          <dl className="mt-12 divide-y divide-line border-y border-line">
            <Reveal className="grid grid-cols-[6rem_1fr] gap-4 py-5">
              <dt className="text-sm text-muted">Email</dt>
              <dd className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <a href={`mailto:${ORG.email}`} className="link-underline font-medium text-ink">
                  {ORG.email}
                </a>
                <CopyButton value={ORG.email} />
              </dd>
            </Reveal>
            <Reveal className="grid grid-cols-[6rem_1fr] gap-4 py-5">
              <dt className="text-sm text-muted">Phone</dt>
              <dd>
                <a href={ORG.phoneHref} className="link-underline font-medium tabular-nums text-ink">
                  {ORG.phoneDisplay}
                </a>
              </dd>
            </Reveal>
            <Reveal className="grid grid-cols-[6rem_1fr] gap-4 py-5">
              <dt className="text-sm text-muted">Visit</dt>
              <dd>
                <address className="not-italic leading-relaxed text-ink">
                  {ORG.addressLines.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </address>
                <a
                  href={MAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group mt-3 inline-flex items-center gap-1 text-sm font-semibold text-teal"
                >
                  Get directions
                  <ArrowUpRight size={15} className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </a>
              </dd>
            </Reveal>
          </dl>

          <Reveal className="mt-8">
            <OfficeHours />
          </Reveal>
        </div>

        <div className="lg:col-span-6 lg:col-start-7">
          <Reveal>
            <ContactForm />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable; the mailto link still works */
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      className="press inline-flex items-center gap-1.5 rounded-full bg-paper-2 px-3 py-1 text-xs font-semibold text-ink-soft hover:bg-paper-3"
      aria-live="polite"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={copied ? 'done' : 'copy'}
          className="inline-flex items-center gap-1.5"
          initial={{ opacity: 0, scale: 0.9, filter: 'blur(3px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, scale: 0.9, filter: 'blur(3px)' }}
          transition={{ duration: 0.15 }}
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? 'Copied' : 'Copy'}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}

function lagosNow() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: ORG.timeZone,
    weekday: 'short',
    hour: 'numeric',
    minute: 'numeric',
    hourCycle: 'h23',
  }).formatToParts(new Date());
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'));
  return { day, hour: Number(get('hour')) + Number(get('minute')) / 60 };
}

const fmtHour = (h: number) => `${((h + 11) % 12) + 1}:00 ${h < 12 ? 'AM' : 'PM'}`;
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function OfficeHours() {
  const [now, setNow] = useState(lagosNow);

  useEffect(() => {
    const t = window.setInterval(() => setNow(lagosNow()), 60_000);
    return () => window.clearInterval(t);
  }, []);

  const today = OFFICE_HOURS.find((row) => row.days.includes(now.day));
  const isOpen = Boolean(today?.open != null && today.close != null && now.hour >= today.open && now.hour < today.close);

  let status: string;
  if (isOpen && today?.close != null) {
    status = `Open now · until ${fmtHour(today.close)}`;
  } else {
    // Find the next opening time, starting later today.
    status = 'Closed';
    for (let offset = 0; offset < 7; offset++) {
      const day = (now.day + offset) % 7;
      const row = OFFICE_HOURS.find((r) => r.days.includes(day));
      if (row?.open == null || (offset === 0 && now.hour >= row.open)) continue;
      status = `Closed · opens ${offset === 0 ? 'today' : offset === 1 ? 'tomorrow' : DAY_NAMES[day]} at ${fmtHour(row.open)}`;
      break;
    }
  }

  return (
    <div className="rounded-2xl bg-paper-2 p-6">
      <div className="flex items-center justify-between gap-4">
        <p className="font-semibold text-ink">Office hours</p>
        <p className="flex items-center gap-2 text-sm text-ink-soft">
          <span className="relative flex size-2">
            {isOpen && <span className="absolute inset-0 animate-ping rounded-full bg-teal/50" />}
            <span className={`relative size-2 rounded-full ${isOpen ? 'bg-teal' : 'bg-muted/60'}`} />
          </span>
          {status}
        </p>
      </div>
      <ul className="mt-4 space-y-1.5 text-[0.95rem]">
        {OFFICE_HOURS.map((row) => {
          const current = row === today;
          return (
            <li key={row.label} className={`flex justify-between ${current ? 'font-semibold text-ink' : 'text-ink-soft'}`}>
              <span>{row.label}</span>
              <span className="tabular-nums">{row.open == null || row.close == null ? 'Closed' : `${fmtHour(row.open)} – ${fmtHour(row.close)}`}</span>
            </li>
          );
        })}
      </ul>
      <p className="mt-4 text-xs text-muted">Times shown in West Africa Time (Lagos).</p>
    </div>
  );
}

type FormState = { phase: 'idle' | 'sending' } | { phase: 'sent'; email: string } | { phase: 'error'; message: string; offline: boolean };

function ContactForm() {
  const id = useId();
  const startedAt = useRef(Date.now());
  const [state, setState] = useState<FormState>({ phase: 'idle' });
  const [values, setValues] = useState({ name: '', email: '', subject: '', message: '', website: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = (key: keyof typeof values) => (e: { target: { value: string } }) => {
    setValues((v) => ({ ...v, [key]: e.target.value }));
    if (errors[key]) setErrors((err) => ({ ...err, [key]: '' }));
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!values.name.trim()) next.name = 'Please tell us your name.';
    if (!EMAIL_PATTERN.test(values.email.trim())) next.email = 'Please enter a valid email address.';
    if (!values.subject.trim()) next.subject = 'Please add a subject.';
    if (values.message.trim().length < 10) next.message = 'Please write a little more.';
    setErrors(next);
    const firstInvalid = Object.keys(next)[0];
    if (firstInvalid) {
      document.getElementById(`${id}-${firstInvalid}`)?.focus();
      return;
    }

    setState({ phase: 'sending' });
    try {
      await postJson('/api/contact', { ...values, startedAt: startedAt.current });
      setState({ phase: 'sent', email: values.email.trim() });
    } catch (error) {
      setState({
        phase: 'error',
        message: error instanceof Error ? error.message : 'Something went wrong.',
        offline: error instanceof ApiError && error.status === 503,
      });
    }
  };

  return (
    <div className="relative overflow-hidden rounded-[2rem] bg-paper-2 p-6 sm:p-10">
      <AnimatePresence mode="wait" initial={false}>
        {state.phase === 'sent' ? (
          <motion.div
            key="sent"
            className="flex min-h-[32rem] flex-col items-center justify-center text-center"
            initial={{ opacity: 0, filter: 'blur(6px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            transition={{ duration: 0.35 }}
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
            <h3 className="heading mt-8 text-[2.4rem] text-ink">Message sent.</h3>
            <p className="mt-3 max-w-sm text-lg text-ink-soft">
              Thank you for writing. We will reply to <span className="font-medium text-ink">{state.email}</span> as soon as we can.
            </p>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={submit}
            noValidate
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, filter: 'blur(6px)' }}
            transition={{ duration: 0.25 }}
          >
            <h3 className="heading text-[2rem] text-ink">Send a message</h3>

            {/* Hidden from people; bots tend to fill it in. */}
            <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
              <label htmlFor={`${id}-website`}>Leave this empty</label>
              <input id={`${id}-website`} tabIndex={-1} autoComplete="off" value={values.website} onChange={update('website')} />
            </div>

            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              <TextField id={`${id}-name`} label="Name" autoComplete="name" max={LIMITS.name} value={values.name} onChange={update('name')} error={errors.name} />
              <TextField id={`${id}-email`} label="Email" type="email" autoComplete="email" max={LIMITS.email} value={values.email} onChange={update('email')} error={errors.email} />
              <div className="sm:col-span-2">
                <TextField id={`${id}-subject`} label="Subject" max={LIMITS.subject} value={values.subject} onChange={update('subject')} error={errors.subject} />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor={`${id}-message`} className="mb-2 flex justify-between text-sm font-medium text-ink-soft">
                  Message
                  <span className="font-normal tabular-nums text-muted">
                    {values.message.length > LIMITS.message * 0.8 ? `${values.message.length} / ${LIMITS.message}` : ''}
                  </span>
                </label>
                <textarea
                  id={`${id}-message`}
                  rows={6}
                  maxLength={LIMITS.message}
                  value={values.message}
                  onChange={update('message')}
                  aria-invalid={Boolean(errors.message)}
                  className="field resize-y bg-paper"
                />
                {errors.message && <p className="pt-2 text-sm text-oxblood">{errors.message}</p>}
              </div>
            </div>

            <AnimatePresence>
              {state.phase === 'error' && (
                <motion.p
                  role="alert"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2, ease: EASE_OUT }}
                  className="mt-6 rounded-xl bg-oxblood/10 px-4 py-3 text-sm text-oxblood-deep"
                >
                  {state.message}{' '}
                  {state.offline && (
                    <a className="font-semibold underline" href={`mailto:${ORG.email}?subject=${encodeURIComponent(values.subject)}`}>
                      Email {ORG.email}
                    </a>
                  )}
                </motion.p>
              )}
            </AnimatePresence>

            <button type="submit" disabled={state.phase === 'sending'} className="btn-primary mt-8 w-full py-4 disabled:cursor-wait disabled:opacity-80 sm:w-auto">
              {state.phase === 'sending' ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Sending…
                </>
              ) : (
                <>
                  Send message
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

function TextField({
  id,
  label,
  error,
  max,
  type = 'text',
  autoComplete,
  value,
  onChange,
}: {
  id: string;
  label: string;
  error?: string;
  max: number;
  type?: string;
  autoComplete?: string;
  value: string;
  onChange: (e: { target: { value: string } }) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-ink-soft">
        {label}
      </label>
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        maxLength={max}
        value={value}
        onChange={onChange}
        aria-invalid={Boolean(error)}
        className="field bg-paper"
      />
      {error && <p className="pt-2 text-sm text-oxblood">{error}</p>}
    </div>
  );
}
