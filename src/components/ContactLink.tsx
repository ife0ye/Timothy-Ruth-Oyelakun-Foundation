import { AnimatePresence, motion } from 'motion/react';
import { Check, Copy, Mail, Phone } from 'lucide-react';
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { ORG } from '../content';
import { EASE_OUT, useFinePointer } from '../lib/motion';

type Kind = 'email' | 'phone';

const OPEN_DELAY = 120;
const CLOSE_DELAY = 180;

const MENU_TONES = {
  // Dark menu for light sections, light menu for dark sections, so it always stands out.
  light: { panel: 'bg-ink text-paper', copy: 'text-paper/85 hover:bg-paper/10 hover:text-paper', arrow: 'bg-ink' },
  dark: { panel: 'bg-paper text-ink', copy: 'text-ink/80 hover:bg-ink/5 hover:text-ink', arrow: 'bg-paper' },
};

/**
 * An email address or phone number that is a normal link on touch screens, and on desktop
 * also reveals a small menu on hover or keyboard focus: send email / call, or copy.
 */
export function ContactLink({
  kind,
  className = '',
  children,
  onDark = false,
}: {
  kind: Kind;
  className?: string;
  children?: ReactNode;
  /** Set when the link sits on a dark background. */
  onDark?: boolean;
}) {
  const tone = MENU_TONES[onDark ? 'dark' : 'light'];
  const fine = useFinePointer();
  const menuId = useId();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const openTimer = useRef<number>(undefined);
  const closeTimer = useRef<number>(undefined);
  const copiedTimer = useRef<number>(undefined);

  const value = kind === 'email' ? ORG.email : ORG.phoneDisplay;
  const href = kind === 'email' ? `mailto:${ORG.email}` : ORG.phoneHref;
  const copyValue = kind === 'email' ? ORG.email : ORG.phoneHref.replace('tel:', '');

  useEffect(
    () => () => {
      window.clearTimeout(openTimer.current);
      window.clearTimeout(closeTimer.current);
      window.clearTimeout(copiedTimer.current);
    },
    [],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const show = (delay = OPEN_DELAY) => {
    window.clearTimeout(closeTimer.current);
    window.clearTimeout(openTimer.current);
    openTimer.current = window.setTimeout(() => setOpen(true), delay);
  };
  const hide = (delay = CLOSE_DELAY) => {
    window.clearTimeout(openTimer.current);
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => {
      setOpen(false);
      setCopied(false);
    }, delay);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(copyValue);
      setCopied(true);
      window.clearTimeout(copiedTimer.current);
      copiedTimer.current = window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard blocked; the link itself still works */
    }
  };

  const link = (
    <a href={href} className={className} aria-describedby={fine && open ? menuId : undefined}>
      {children ?? value}
    </a>
  );

  if (!fine) return link;

  return (
    <span
      className="relative inline-block"
      onPointerEnter={() => show()}
      onPointerLeave={() => hide()}
      onFocus={() => show(0)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) hide(0);
      }}
    >
      {link}
      <AnimatePresence>
        {open && (
          <motion.span
            id={menuId}
            role="group"
            aria-label={kind === 'email' ? 'Email options' : 'Phone options'}
            // Grows out of the link it belongs to.
            className="absolute bottom-full left-1/2 z-30 block origin-bottom -translate-x-1/2 pb-2.5"
            initial={{ opacity: 0, scale: 0.96, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 2, transition: { duration: 0.12 } }}
            transition={{ duration: 0.18, ease: EASE_OUT }}
          >
            <span className={`flex items-center gap-1 whitespace-nowrap ${tone.panel} rounded-full p-1 text-[0.8rem] font-semibold shadow-[0_12px_32px_-8px_rgba(0,0,0,0.45)]`}>
              <a href={href} className="press flex items-center gap-1.5 rounded-full bg-oxblood px-3.5 py-1.5 text-paper hover:bg-oxblood-deep">
                {kind === 'email' ? <Mail size={14} /> : <Phone size={14} />}
                {kind === 'email' ? 'Send email' : 'Call'}
              </a>
              <button
                type="button"
                onClick={copy}
                className={`press flex items-center gap-1.5 rounded-full px-3 py-1.5 ${tone.copy}`}
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={copied ? 'done' : 'copy'}
                    className="flex items-center gap-1.5"
                    initial={{ opacity: 0, filter: 'blur(3px)' }}
                    animate={{ opacity: 1, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, filter: 'blur(3px)' }}
                    transition={{ duration: 0.12 }}
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? 'Copied' : 'Copy'}
                  </motion.span>
                </AnimatePresence>
              </button>
              <span aria-live="polite" className="sr-only">
                {copied ? `${value} copied` : ''}
              </span>
            </span>
            <span aria-hidden className={`absolute bottom-1 left-1/2 size-3 -translate-x-1/2 rotate-45 rounded-[2px] ${tone.arrow}`} />
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
