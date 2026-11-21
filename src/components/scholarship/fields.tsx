import { AnimatePresence, motion } from 'motion/react';
import { ChevronDown, FileText, ImageIcon, Loader2, Paperclip, X } from 'lucide-react';
import { useRef, useState, type ReactNode } from 'react';
import { FILE_RULES, formatBytes, NIGERIAN_STATES, type AnswerKey } from '../../../shared/scholarship';
import { EASE_OUT } from '../../lib/motion';

export interface FieldProps {
  /** Prefix for element ids, so the form can focus the first field with a problem. */
  uid: string;
  name: AnswerKey;
  label: string;
  value: string;
  onChange: (name: AnswerKey, value: string) => void;
  error?: string;
  hint?: string;
  optional?: boolean;
  className?: string;
}

export const fieldId = (uid: string, name: string) => `${uid}-${name}`;

function Label({ htmlFor, label, optional }: { htmlFor?: string; label: string; optional?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="mb-2 flex items-baseline justify-between gap-3 text-sm font-medium text-ink-soft">
      {label}
      {optional && <span className="text-xs font-normal text-muted">Optional</span>}
    </label>
  );
}

function Help({ id, error, hint }: { id: string; error?: string; hint?: string }) {
  if (error) {
    return (
      <p id={`${id}-help`} className="pt-2 text-sm text-oxblood">
        {error}
      </p>
    );
  }
  if (hint) {
    return (
      <p id={`${id}-help`} className="pt-2 text-sm text-muted">
        {hint}
      </p>
    );
  }
  return null;
}

export function TextField({
  uid,
  name,
  label,
  value,
  onChange,
  error,
  hint,
  optional,
  className,
  type = 'text',
  inputMode,
  autoComplete,
  placeholder,
  max = 120,
  list,
  maxDate,
}: FieldProps & {
  type?: 'text' | 'email' | 'tel' | 'date';
  inputMode?: 'text' | 'email' | 'tel' | 'decimal';
  autoComplete?: string;
  placeholder?: string;
  max?: number;
  list?: string;
  maxDate?: string;
}) {
  const id = fieldId(uid, name);
  return (
    <div className={className}>
      <Label htmlFor={id} label={label} optional={optional} />
      <input
        id={id}
        name={name}
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        placeholder={placeholder}
        maxLength={type === 'date' ? undefined : max}
        max={maxDate}
        list={list}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error || hint ? `${id}-help` : undefined}
        className="field"
      />
      <Help id={id} error={error} hint={hint} />
    </div>
  );
}

export function TextArea({ uid, name, label, value, onChange, error, hint, className, max = 400 }: FieldProps & { max?: number }) {
  const id = fieldId(uid, name);
  return (
    <div className={className}>
      <Label htmlFor={id} label={label} />
      <textarea
        id={id}
        name={name}
        rows={3}
        maxLength={max}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error || hint ? `${id}-help` : undefined}
        className="field resize-y"
      />
      <Help id={id} error={error} hint={hint} />
    </div>
  );
}

export function SelectField({
  uid,
  name,
  label,
  value,
  onChange,
  error,
  hint,
  className,
  options,
  placeholder = 'Choose…',
}: FieldProps & { options: readonly string[] | readonly { value: string; label: string }[]; placeholder?: string }) {
  const id = fieldId(uid, name);
  const items = options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o));
  return (
    <div className={className}>
      <Label htmlFor={id} label={label} />
      <div className="relative">
        <select
          id={id}
          name={name}
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={error || hint ? `${id}-help` : undefined}
          className={`field appearance-none pr-11 ${value ? '' : 'text-muted'}`}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {items.map((item) => (
            <option key={item.value} value={item.value} className="text-ink">
              {item.label}
            </option>
          ))}
        </select>
        <ChevronDown aria-hidden size={18} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted" />
      </div>
      <Help id={id} error={error} hint={hint} />
    </div>
  );
}

/** A set of large, tappable choices. Easier on a phone than a dropdown when there are only a few. */
export function ChoiceField({
  uid,
  name,
  label,
  value,
  onChange,
  error,
  hint,
  className,
  options,
  columns = 2,
}: FieldProps & { options: { value: string; label: string; detail?: string }[]; columns?: 2 | 3 }) {
  const id = fieldId(uid, name);
  return (
    <fieldset className={className} aria-describedby={error || hint ? `${id}-help` : undefined}>
      <legend className="mb-2 text-sm font-medium text-ink-soft">{label}</legend>
      <div className={`grid gap-2.5 ${columns === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
        {options.map((option, i) => {
          const checked = value === option.value;
          return (
            <label
              key={option.value}
              className={`press relative flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3.5 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-oxblood ${
                checked ? 'border-teal bg-teal/[0.06]' : error ? 'border-oxblood/60 bg-paper' : 'border-line bg-paper hover:border-ink/25'
              }`}
            >
              <input
                // The first option carries the id so validation can focus the group.
                id={i === 0 ? id : undefined}
                type="radio"
                name={`${uid}-${name}`}
                value={option.value}
                checked={checked}
                onChange={() => onChange(name, option.value)}
                aria-invalid={Boolean(error)}
                className="sr-only"
              />
              <span
                aria-hidden
                className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border transition-colors ${checked ? 'border-teal bg-teal' : 'border-ink/25 bg-paper'}`}
              >
                <motion.span
                  className="size-2 rounded-full bg-paper"
                  initial={false}
                  animate={{ scale: checked ? 1 : 0 }}
                  transition={{ type: 'spring', bounce: 0.4, duration: 0.3 }}
                />
              </span>
              <span className="leading-snug">
                <span className="block font-medium text-ink">{option.label}</span>
                {option.detail && <span className="mt-0.5 block text-sm text-muted">{option.detail}</span>}
              </span>
            </label>
          );
        })}
      </div>
      <Help id={id} error={error} hint={hint} />
    </fieldset>
  );
}

/** Contact address, LGA and state of origin, as the paper form asks for them. */
export function AddressGroup({
  uid,
  keys,
  values,
  errors,
  onChange,
  whose,
}: {
  uid: string;
  keys: { address: AnswerKey; lga: AnswerKey; state: AnswerKey };
  values: Record<AnswerKey, string>;
  errors: Partial<Record<AnswerKey, string>>;
  onChange: (name: AnswerKey, value: string) => void;
  whose: 'Your' | 'Their';
}) {
  return (
    <>
      <TextArea
        uid={uid}
        name={keys.address}
        label="Contact address"
        value={values[keys.address]}
        onChange={onChange}
        error={errors[keys.address]}
        className="sm:col-span-2"
      />
      <TextField
        uid={uid}
        name={keys.lga}
        label="LGA of origin"
        placeholder="e.g. Ogbomoso North"
        value={values[keys.lga]}
        onChange={onChange}
        error={errors[keys.lga]}
      />
      <SelectField
        uid={uid}
        name={keys.state}
        label="State of origin"
        placeholder={`${whose} state of origin`}
        options={NIGERIAN_STATES}
        value={values[keys.state]}
        onChange={onChange}
        error={errors[keys.state]}
      />
    </>
  );
}

export function Checkbox({
  id,
  checked,
  onChange,
  invalid,
  children,
}: {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  invalid?: boolean;
  children: ReactNode;
}) {
  return (
    <label htmlFor={id} className="flex cursor-pointer gap-3.5 rounded-xl px-1 py-2 text-ink-soft">
      <input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} aria-invalid={invalid} className="peer sr-only" />
      <span
        aria-hidden
        className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border transition-colors peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-oxblood ${
          checked ? 'border-teal bg-teal text-paper' : invalid ? 'border-oxblood bg-paper' : 'border-ink/30 bg-paper'
        }`}
      >
        <motion.svg viewBox="0 0 12 12" className="size-3" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
          <motion.path
            d="M2.5 6.2 5 8.5l4.5-5"
            initial={false}
            // Fade as well as draw: a zero-length path with round caps still shows a dot.
            animate={{ pathLength: checked ? 1 : 0, opacity: checked ? 1 : 0 }}
            transition={{ duration: 0.2, ease: EASE_OUT }}
          />
        </motion.svg>
      </span>
      <span className="leading-relaxed">{children}</span>
    </label>
  );
}

// ---------- Document uploads ----------

export interface PickedFile {
  id: string;
  file: File;
}

const ACCEPT = Object.keys(FILE_RULES.types).join(',');

export function DocumentSlot({
  id,
  label,
  hint,
  required,
  files,
  busy,
  error,
  onAdd,
  onRemove,
}: {
  id: string;
  label: string;
  hint: string;
  required: boolean;
  files: PickedFile[];
  busy: boolean;
  error?: string;
  onAdd: (files: File[]) => void;
  onRemove: (id: string) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const full = files.length >= FILE_RULES.perDocument;

  return (
    <div
      onDragOver={(e) => {
        if (full) return;
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        if (!full && e.dataTransfer.files.length) onAdd(Array.from(e.dataTransfer.files));
      }}
      className={`rounded-2xl border p-5 transition-colors sm:p-6 ${
        dragging ? 'border-teal bg-teal/[0.05]' : error ? 'border-oxblood/60 bg-paper' : 'border-line bg-paper'
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
        <div className="min-w-0">
          <p className="flex flex-wrap items-baseline gap-x-2.5 font-medium text-ink">
            {label}
            <span className={`text-xs font-normal ${required ? 'text-oxblood' : 'text-muted'}`}>{required ? 'Required' : 'Optional for you'}</span>
          </p>
          <p className="mt-1 text-sm text-muted">{hint}</p>
        </div>
        <button
          id={id}
          type="button"
          disabled={full || busy}
          onClick={() => input.current?.click()}
          aria-invalid={Boolean(error)}
          className="press inline-flex shrink-0 items-center gap-2 rounded-full bg-paper-2 px-4 py-2 text-sm font-semibold text-ink hover:bg-paper-3 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? <Loader2 size={15} className="animate-spin" /> : <Paperclip size={15} />}
          {busy ? 'Preparing…' : files.length ? 'Add another' : 'Choose file'}
        </button>
        <input
          ref={input}
          type="file"
          accept={ACCEPT}
          multiple
          className="sr-only"
          tabIndex={-1}
          aria-hidden
          onChange={(e) => {
            const picked = Array.from(e.target.files ?? []);
            e.target.value = '';
            if (picked.length) onAdd(picked);
          }}
        />
      </div>

      <AnimatePresence initial={false}>
        {files.length > 0 && (
          <motion.ul
            className="mt-4 space-y-2"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: EASE_OUT }}
          >
            <AnimatePresence initial={false}>
              {files.map(({ id: fileId, file }) => (
                <motion.li
                  key={fileId}
                  layout
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 12, transition: { duration: 0.15 } }}
                  transition={{ duration: 0.22, ease: EASE_OUT }}
                  className="flex items-center gap-3 rounded-xl bg-paper-2 py-2 pl-3 pr-1.5"
                >
                  {file.type === 'application/pdf' ? (
                    <FileText size={18} className="shrink-0 text-oxblood" />
                  ) : (
                    <ImageIcon size={18} className="shrink-0 text-teal" />
                  )}
                  <span className="min-w-0 flex-1 truncate text-sm text-ink">{file.name}</span>
                  <span className="shrink-0 text-xs tabular-nums text-muted">{formatBytes(file.size)}</span>
                  <button
                    type="button"
                    onClick={() => onRemove(fileId)}
                    aria-label={`Remove ${file.name}`}
                    className="press grid size-8 shrink-0 place-items-center rounded-full text-muted hover:bg-paper-3 hover:text-ink"
                  >
                    <X size={15} />
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ul>
        )}
      </AnimatePresence>

      {error && <p className="pt-3 text-sm text-oxblood">{error}</p>}
    </div>
  );
}
