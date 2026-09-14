import { animate, AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowRight, Loader2, Lock, RotateCcw } from 'lucide-react';
import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import {
  checkAmount,
  CURRENCIES,
  CURRENCY_CODES,
  EMAIL_PATTERN,
  formatMoney,
  LIMITS,
  TX_REF_PATTERN,
  type CurrencyCode,
} from '../../shared/donation';
import { getJson, postJson } from '../lib/api';
import { EASE_OUT } from '../lib/motion';
import { ContactLink } from './ContactLink';
import { LineReveal, Reveal, Weave } from './primitives';

type Outcome =
  | { kind: 'checking' }
  | { kind: 'successful'; amount: number; currency: CurrencyCode }
  | { kind: 'pending' }
  | { kind: 'failed' }
  | { kind: 'cancelled' };

const POINTS: { title: string; body: React.ReactNode }[] = [
  { title: 'Any amount helps', body: 'Large or small, every gift reaches someone in a hard season.' },
  { title: 'Give from anywhere', body: 'Pay in naira or your own currency through a secure checkout.' },
  {
    title: 'Give regularly',
    body: (
      <>
        Want to give monthly? Write to <ContactLink onDark kind="email" className="text-paper underline decoration-paper/40 underline-offset-4 hover:decoration-paper" /> and we&apos;ll set it up with you.
      </>
    ),
  },
];

function defaultCurrency(): CurrencyCode {
  const locale = navigator.language || '';
  if (/-NG$/i.test(locale)) return 'NGN';
  if (/-GB$/i.test(locale)) return 'GBP';
  if (/-CA$/i.test(locale)) return 'CAD';
  if (/-(DE|FR|IE|IT|ES|NL|BE|PT|AT|FI)$/i.test(locale)) return 'EUR';
  if (/-US$/i.test(locale)) return 'USD';
  return 'NGN';
}

export function Donate() {
  const [outcome, setOutcome] = useState<Outcome | null>(null);

  // Donors come back from Flutterwave with ?status=…&tx_ref=… in the URL.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const txRef = params.get('tx_ref');
    const status = params.get('status');
    if (!txRef || !TX_REF_PATTERN.test(txRef)) return;

    window.history.replaceState(null, '', `${window.location.pathname}#donate`);
    requestAnimationFrame(() => document.getElementById('donate')?.scrollIntoView());

    if (status === 'cancelled') {
      setOutcome({ kind: 'cancelled' });
      return;
    }

    setOutcome({ kind: 'checking' });
    getJson<{ status: string; amount?: number; currency?: CurrencyCode }>(
      `/api/donations/verify?tx_ref=${encodeURIComponent(txRef)}`,
    )
      .then((res) => {
        if (res.status === 'successful' && res.amount && res.currency) {
          setOutcome({ kind: 'successful', amount: res.amount, currency: res.currency });
        } else if (res.status === 'failed') {
          setOutcome({ kind: 'failed' });
        } else {
          setOutcome({ kind: 'pending' });
        }
      })
      .catch(() => setOutcome({ kind: 'pending' }));
  }, []);

  return (
    <section id="donate" className="relative overflow-hidden bg-teal-night text-paper">
      <Weave />
      <div className="mx-auto grid max-w-[88rem] gap-16 px-5 py-24 sm:px-8 sm:py-32 lg:grid-cols-12 lg:gap-8 lg:py-36">
        <div className="lg:col-span-5">
          <Reveal>
            <p className="eyebrow mb-5 text-ochre-soft">Donate</p>
          </Reveal>
          <LineReveal className="display text-[clamp(3rem,6vw,5.6rem)]" lines={['Give in', <em key="e">their name.</em>]} />
          <Reveal delay={0.1}>
            <p className="prose-body mt-8 max-w-[30rem] text-lg leading-relaxed text-paper/75">
              Timothy and Ruth gave quietly and generously. A gift today helps pay a school fee, a hospital bill or the
              first stock for a small business, and keeps that habit of kindness alive.
            </p>
          </Reveal>

          <ul className="mt-12 space-y-7">
            {POINTS.map((point, i) => (
              <Reveal as="li" key={point.title} delay={0.05 * i} className="flex gap-5">
                <span className="mt-2.5 size-2 shrink-0 rotate-45 bg-ochre" aria-hidden />
                <span>
                  <span className="block font-semibold text-paper">{point.title}</span>
                  <span className="mt-1 block text-paper/65">{point.body}</span>
                </span>
              </Reveal>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-6 lg:col-start-7">
          <Reveal>
            <div className="relative rounded-[2rem] bg-paper p-6 text-ink shadow-[0_40px_120px_-30px_rgba(0,0,0,0.6)] sm:p-10">
              <AnimatePresence mode="wait" initial={false}>
                {outcome ? (
                  <motion.div
                    key="outcome"
                    initial={{ opacity: 0, filter: 'blur(6px)' }}
                    animate={{ opacity: 1, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, filter: 'blur(6px)' }}
                    transition={{ duration: 0.3 }}
                  >
                    <OutcomePanel outcome={outcome} onReset={() => setOutcome(null)} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0, filter: 'blur(6px)' }}
                    animate={{ opacity: 1, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, filter: 'blur(6px)' }}
                    transition={{ duration: 0.3 }}
                  >
                    <DonationForm />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Reveal>
          <p className="mt-6 flex items-start justify-center gap-2.5 text-center text-sm text-paper/60">
            <Lock size={15} className="mt-0.5 shrink-0" />
            Payments are processed by Flutterwave. Your card details never touch our website.
          </p>
        </div>
      </div>
    </section>
  );
}

function DonationForm() {
  const id = useId();
  const [currency, setCurrency] = useState<CurrencyCode>('NGN');
  const [preset, setPreset] = useState<number | 'other'>(CURRENCIES.NGN.presets[1]);
  const [custom, setCustom] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const customRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const initial = defaultCurrency();
    setCurrency(initial);
    setPreset(CURRENCIES[initial].presets[1]);
  }, []);

  // If the donor comes back from checkout with the browser's back button, re-enable the form.
  useEffect(() => {
    const onShow = (e: PageTransitionEvent) => e.persisted && setSubmitting(false);
    window.addEventListener('pageshow', onShow);
    return () => window.removeEventListener('pageshow', onShow);
  }, []);

  const rule = CURRENCIES[currency];
  const amount = preset === 'other' ? Number(custom.replace(/,/g, '')) : preset;
  const validAmount = checkAmount(amount, currency) === null;

  const chooseCurrency = (code: CurrencyCode) => {
    setCurrency(code);
    if (preset !== 'other') setPreset(CURRENCIES[code].presets[1]);
    setErrors((e) => ({ ...e, amount: '' }));
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    const amountError = checkAmount(amount, currency);
    if (amountError) next.amount = amountError;
    if (!name.trim()) next.name = 'Please tell us your name.';
    if (!EMAIL_PATTERN.test(email.trim())) next.email = 'Please enter a valid email address.';
    setErrors(next);
    if (Object.keys(next).length) {
      const first = next.amount ? (preset === 'other' ? customRef.current : null) : document.getElementById(`${id}-${next.name ? 'name' : 'email'}`);
      first?.focus();
      return;
    }

    setSubmitting(true);
    try {
      const { link } = await postJson<{ link: string }>('/api/donations/create', {
        amount,
        currency,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
      });
      window.location.assign(link);
    } catch (error) {
      setErrors({ form: error instanceof Error ? error.message : 'Something went wrong. Please try again.' });
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-muted">Your gift</p>
          <p className="heading mt-2 text-[clamp(2.6rem,6vw,3.6rem)] tabular-nums leading-none text-ink" aria-live="polite">
            <AnimatedAmount value={validAmount ? amount : 0} currency={currency} />
          </p>
        </div>
      </div>

      <fieldset className="mt-8">
        <legend className="mb-3 text-sm font-medium text-ink-soft">Currency</legend>
        <div className="flex flex-wrap gap-1 rounded-full bg-paper-2 p-1">
          {CURRENCY_CODES.map((code) => (
            <label key={code} className="relative flex-1 cursor-pointer">
              <input
                type="radio"
                name={`${id}-currency`}
                value={code}
                checked={currency === code}
                onChange={() => chooseCurrency(code)}
                className="peer sr-only"
              />
              {currency === code && (
                <motion.span
                  layoutId={`${id}-currency-pill`}
                  className="absolute inset-0 rounded-full bg-ink shadow-sm"
                  transition={{ type: 'spring', bounce: 0.15, duration: 0.45 }}
                />
              )}
              <span className="relative block rounded-full px-3 py-2 text-center text-sm font-semibold text-ink-soft transition-colors duration-200 peer-checked:text-paper peer-focus-visible:outline-2 peer-focus-visible:outline-oxblood">
                {code}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-6">
        <legend className="mb-3 text-sm font-medium text-ink-soft">Amount</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {[...rule.presets, 'other' as const].map((value) => {
            const checked = preset === value;
            return (
              <label key={`${currency}-${value}`} className={`relative cursor-pointer ${value === 'other' ? 'col-span-2 sm:col-span-1' : ''}`}>
                <input
                  type="radio"
                  name={`${id}-amount`}
                  checked={checked}
                  onChange={() => {
                    setPreset(value);
                    setErrors((e) => ({ ...e, amount: '' }));
                    if (value === 'other') requestAnimationFrame(() => customRef.current?.focus());
                  }}
                  className="peer sr-only"
                />
                <span className="press block rounded-2xl border border-line bg-paper px-2 py-3.5 text-center font-semibold tabular-nums text-ink transition-colors hover:border-ink/40 peer-checked:border-oxblood peer-checked:bg-oxblood peer-checked:text-paper peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-oxblood">
                  {value === 'other' ? 'Other' : formatMoney(value, currency)}
                </span>
              </label>
            );
          })}
        </div>

        <AnimatePresence initial={false}>
          {preset === 'other' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: EASE_OUT }}
              className="overflow-hidden"
            >
              <label htmlFor={`${id}-custom`} className="sr-only">
                Custom amount in {rule.label}
              </label>
              <div className="relative mt-3">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-muted">{rule.symbol}</span>
                <input
                  ref={customRef}
                  id={`${id}-custom`}
                  inputMode="decimal"
                  autoComplete="off"
                  placeholder={`Minimum ${formatMoney(rule.min, currency)}`}
                  value={custom}
                  onChange={(e) => setCustom(e.target.value.replace(/[^\d.,]/g, '').slice(0, 14))}
                  aria-invalid={Boolean(errors.amount)}
                  aria-describedby={errors.amount ? `${id}-amount-error` : undefined}
                  className="field font-semibold tabular-nums"
                  style={{ paddingLeft: `${1.6 + rule.symbol.length * 0.55}rem` }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <FieldError id={`${id}-amount-error`} message={errors.amount} />
      </fieldset>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Field id={`${id}-name`} label="Full name" error={errors.name}>
          <input
            id={`${id}-name`}
            autoComplete="name"
            maxLength={LIMITS.name}
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? `${id}-name-error` : undefined}
            className="field"
          />
        </Field>
        <Field id={`${id}-email`} label="Email" hint="for your receipt" error={errors.email}>
          <input
            id={`${id}-email`}
            type="email"
            autoComplete="email"
            maxLength={LIMITS.email}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? `${id}-email-error` : undefined}
            className="field"
          />
        </Field>
        <div className="sm:col-span-2">
          <Field id={`${id}-phone`} label="Phone" hint="optional">
            <input
              id={`${id}-phone`}
              type="tel"
              autoComplete="tel"
              maxLength={LIMITS.phone}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="field"
            />
          </Field>
        </div>
      </div>

      <AnimatePresence>
        {errors.form && (
          <motion.p
            role="alert"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-6 rounded-xl bg-oxblood/10 px-4 py-3 text-sm text-oxblood-deep"
          >
            {errors.form}
          </motion.p>
        )}
      </AnimatePresence>

      <button type="submit" disabled={submitting} className="btn-primary mt-8 w-full py-4 text-[1.05rem] disabled:cursor-wait disabled:opacity-80">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={submitting ? 'loading' : 'idle'}
            className="flex items-center gap-2.5"
            initial={{ opacity: 0, filter: 'blur(4px)', y: 6 }}
            animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
            exit={{ opacity: 0, filter: 'blur(4px)', y: -6 }}
            transition={{ duration: 0.18 }}
          >
            {submitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Opening secure checkout…
              </>
            ) : (
              <>
                Donate{validAmount ? ` ${formatMoney(amount, currency)}` : ''}
                <ArrowRight size={18} />
              </>
            )}
          </motion.span>
        </AnimatePresence>
      </button>
    </form>
  );
}

function AnimatedAmount({ value, currency }: { value: number; currency: CurrencyCode }) {
  const ref = useRef<HTMLSpanElement>(null);
  const current = useRef(value);
  const reduce = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduce) {
      el.textContent = formatMoney(value, currency);
      current.current = value;
      return;
    }
    // Always count from what's on screen right now, so rapid changes never jump.
    const controls = animate(current.current, value, {
      duration: 0.6,
      ease: EASE_OUT,
      onUpdate: (v) => {
        current.current = v;
        el.textContent = formatMoney(Math.round(v), currency);
      },
      onComplete: () => {
        el.textContent = formatMoney(value, currency);
      },
    });
    return () => controls.stop();
  }, [value, currency, reduce]);

  return <span ref={ref}>{formatMoney(value, currency)}</span>;
}

function Field({ id, label, hint, error, children }: { id: string; label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 flex items-baseline gap-2 text-sm font-medium text-ink-soft">
        {label}
        {hint && <span className="text-xs font-normal text-muted">{hint}</span>}
      </label>
      {children}
      <FieldError id={`${id}-error`} message={error} />
    </div>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  return (
    <AnimatePresence initial={false}>
      {message && (
        <motion.p
          id={id}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2, ease: EASE_OUT }}
          className="overflow-hidden pt-2 text-sm text-oxblood"
        >
          {message}
        </motion.p>
      )}
    </AnimatePresence>
  );
}

function OutcomePanel({ outcome, onReset }: { outcome: Outcome; onReset: () => void }) {
  if (outcome.kind === 'checking') {
    return (
      <div className="flex min-h-[26rem] flex-col items-center justify-center text-center" role="status">
        <Loader2 size={28} className="animate-spin text-teal" />
        <p className="mt-5 text-lg text-ink-soft">Confirming your donation with Flutterwave…</p>
      </div>
    );
  }

  const copy = {
    successful: {
      title: 'Thank you.',
      body:
        outcome.kind === 'successful'
          ? `We've received your gift of ${formatMoney(outcome.amount, outcome.currency)}. A receipt is on its way to your inbox. Timothy and Ruth's work goes on because of people like you.`
          : '',
    },
    pending: {
      title: 'Almost there.',
      body: (
        <>
          Your payment is still being processed. Flutterwave will email your receipt as soon as it completes. If it doesn&apos;t arrive within a day, write to{' '}
          <ContactLink kind="email" className="text-ink underline decoration-ink/30 underline-offset-4 hover:decoration-ink" />.
        </>
      ),
    },
    failed: {
      title: 'That didn’t go through.',
      body: 'The payment was not completed. You can try again, perhaps with a different card or payment method.',
    },
    cancelled: {
      title: 'No problem.',
      body: 'You left the checkout before paying, so nothing was charged. You are welcome to try again whenever you are ready.',
    },
  }[outcome.kind];

  return (
    <div className="flex min-h-[26rem] flex-col items-center justify-center text-center" role="status">
      {outcome.kind === 'successful' && (
        <motion.img
          src="/images/seal-256.webp"
          alt=""
          width={112}
          height={112}
          className="size-28 rounded-full"
          initial={{ scale: 1.6, rotate: -20, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ type: 'spring', bounce: 0.4, duration: 0.8, delay: 0.1 }}
        />
      )}
      <h3 className="heading mt-8 text-[2.8rem] text-ink">{copy.title}</h3>
      <p className="prose-body mt-4 max-w-sm text-lg leading-relaxed text-ink-soft">{copy.body}</p>
      <button type="button" onClick={onReset} className="press mt-10 inline-flex items-center gap-2 rounded-full border border-line px-6 py-3 font-semibold text-ink hover:border-ink/40">
        <RotateCcw size={16} />
        {outcome.kind === 'successful' ? 'Make another gift' : 'Try again'}
      </button>
    </div>
  );
}
