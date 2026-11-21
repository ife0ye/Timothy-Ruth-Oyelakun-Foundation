import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { ArrowRight, Check, GraduationCap, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { EASE_OUT } from '../lib/motion';
import { LineReveal, Reveal } from './primitives';

const FEATURE_ID = 'scholarship-feature';
const CRITERIA = ['Public universities & polytechnics', 'Newly admitted through UTME or Direct Entry', 'Or a CGPA of 3.5 and above'];

/** The home page's invitation to the scholarship programme. */
export function ScholarshipFeature() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const cardY = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [60, -60]);

  return (
    <section ref={ref} id={FEATURE_ID} className="px-5 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto max-w-[100rem]">
        <div className="relative overflow-hidden rounded-[2.25rem] bg-teal-night text-paper">
          <div className="grid items-center gap-14 p-7 py-12 sm:p-12 lg:grid-cols-12 lg:gap-8 lg:p-16 xl:p-20">
            <div className="lg:col-span-7">
              <Reveal>
                <p className="eyebrow mb-6 flex items-center gap-3 text-ochre-soft">
                  <span className="relative flex size-2">
                    <span className="absolute inset-0 animate-ping rounded-full bg-ochre/60" />
                    <span className="relative size-2 rounded-full bg-ochre" />
                  </span>
                  Now open · Scholarship programme
                </p>
              </Reveal>
              <LineReveal
                className="display text-[clamp(2.8rem,5.6vw,5.4rem)]"
                lines={[
                  'Help to finish',
                  <em key="e" className="text-ochre-soft">
                    what you started.
                  </em>,
                ]}
              />
              <Reveal delay={0.1}>
                <p className="prose-body mt-7 max-w-[34rem] text-lg leading-relaxed text-paper/75">
                  In Timothy and Ruth&apos;s name, the foundation offers scholarships to indigent Nigerian students who show academic
                  excellence and a commitment to making a positive impact in their communities.
                </p>
              </Reveal>
              <Reveal delay={0.15}>
                <ul className="mt-8 flex flex-wrap gap-2">
                  {CRITERIA.map((item) => (
                    <li key={item} className="flex items-center gap-2 rounded-full border border-paper/15 px-3.5 py-1.5 text-sm text-paper/85">
                      <Check size={14} className="text-ochre-soft" />
                      {item}
                    </li>
                  ))}
                </ul>
              </Reveal>
              <Reveal delay={0.2} className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
                <a href="/scholarship" className="btn-primary group">
                  Apply for a scholarship
                  <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
                </a>
                <a href="/scholarship#eligibility" className="link-underline pb-0.5 font-medium text-paper/85 hover:text-paper">
                  See who can apply
                </a>
              </Reveal>
            </div>

            <motion.div style={{ y: cardY }} className="relative mx-auto mb-4 w-full max-w-[18.5rem] sm:max-w-[24rem] lg:col-span-4 lg:col-start-9 lg:mb-0 lg:max-w-[26rem]">
              <ApplicationCard />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

const FIELDS = [
  { label: 'Name', width: '72%' },
  { label: 'Institution', width: '88%' },
  { label: 'Course of study', width: '60%' },
  { label: 'CGPA', width: '28%' },
];

/** An illustrated application that fills itself in as it scrolls into view. */
function ApplicationCard() {
  const base = 0.35;
  return (
    <motion.div initial="empty" whileInView="filled" viewport={{ once: true, margin: '0px 0px -20% 0px' }} className="relative" aria-hidden>
      {/* A second sheet behind, for depth. */}
      <div className="absolute inset-0 translate-x-3 translate-y-3 rotate-[4deg] rounded-[1.25rem] bg-paper-3/90" />
      <div className="relative rotate-[-2.5deg] rounded-[1.25rem] bg-[#fdfcf8] p-6 text-ink shadow-[0_30px_80px_-20px_rgba(0,0,0,0.55)] sm:p-7">
        <div className="flex items-center gap-3 border-b border-line pb-5">
          <img src="/images/seal-128.webp" alt="" width={44} height={44} loading="lazy" className="size-11 rounded-full" />
          <div className="leading-tight">
            <p className="font-serif text-[1.15rem]">Scholarship application</p>
            <p className="eyebrow mt-1 text-[0.58rem] text-oxblood">Timothy &amp; Ruth Oyelakun Foundation</p>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          {FIELDS.map((field, i) => (
            <div key={field.label}>
              <p className="text-[0.7rem] font-medium uppercase tracking-[0.12em] text-muted">{field.label}</p>
              <div className="mt-1.5 h-9 rounded-lg border border-line bg-paper px-3 py-3">
                <motion.div
                  className="h-full origin-left rounded-full bg-ink/15"
                  style={{ width: field.width }}
                  variants={{ empty: { scaleX: 0 }, filled: { scaleX: 1 } }}
                  transition={{ duration: 0.6, ease: EASE_OUT, delay: base + i * 0.28 }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-6 gap-1.5">
          {Array.from({ length: 6 }, (_, i) => (
            <span key={i} className="h-1.5 overflow-hidden rounded-full bg-ink/10">
              <motion.span
                className="block h-full origin-left rounded-full bg-teal"
                variants={{ empty: { scaleX: 0 }, filled: { scaleX: 1 } }}
                transition={{ duration: 0.35, ease: EASE_OUT, delay: base + i * 0.2 }}
              />
            </span>
          ))}
        </div>

        <motion.div
          className="absolute -bottom-5 -right-4 grid size-24 rotate-[-12deg] place-items-center rounded-full border-2 border-dashed border-oxblood/70 bg-[#fdfcf8] text-oxblood shadow-[0_10px_30px_-10px_rgba(0,0,0,0.4)] sm:-right-6"
          variants={{ empty: { scale: 1.6, opacity: 0 }, filled: { scale: 1, opacity: 1 } }}
          transition={{ type: 'spring', bounce: 0.2, duration: 0.5, delay: base + FIELDS.length * 0.28 + 0.25 }}
        >
          <span className="text-center leading-none">
            <Check size={22} className="mx-auto" strokeWidth={2.5} />
            <span className="eyebrow mt-1.5 block text-[0.55rem]">Received</span>
          </span>
        </motion.div>
      </div>
    </motion.div>
  );
}

const DISMISS_KEY = 'trof-scholarship-nudge-dismissed';

/**
 * A small floating pointer to the scholarship page. It appears once the visitor has scrolled
 * past the opening, steps aside while the scholarship section itself or the footer is on
 * screen, and stays away for the visit once dismissed.
 */
export function ScholarshipNudge() {
  const [dismissed, setDismissed] = useState(() => {
    try {
      return sessionStorage.getItem(DISMISS_KEY) === '1';
    } catch {
      return false;
    }
  });
  const [past, setPast] = useState(false);
  const [covered, setCovered] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (y) => setPast(y > window.innerHeight * 0.85));

  useEffect(() => {
    const targets = [document.getElementById(FEATURE_ID), document.querySelector('footer')].filter((el): el is HTMLElement => Boolean(el));
    const visible = new Set<Element>();
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) visible.add(entry.target);
        else visible.delete(entry.target);
      }
      setCovered(visible.size > 0);
    });
    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const dismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem(DISMISS_KEY, '1');
    } catch {
      /* storage unavailable: it just comes back on the next page load */
    }
  };

  const show = past && !covered && !dismissed;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:pb-6">
      <AnimatePresence>
        {show && (
          <motion.div
            // Frosted dark glass over the page, with a faint lit top edge. It materialises (blur and
            // scale together) and leaves the way it came, on a critically damped spring.
            className="pointer-events-auto flex items-center gap-1.5 rounded-full bg-ink/80 p-1.5 text-paper shadow-[0_18px_40px_-12px_rgba(10,40,49,0.55),inset_0_1px_0_rgba(250,248,242,0.12)] backdrop-blur-xl backdrop-saturate-150 reduce-transparency:bg-ink reduce-transparency:backdrop-blur-none"
            initial={{ opacity: 0, y: 24, scale: 0.96, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: 24, scale: 0.96, filter: 'blur(8px)', transition: { type: 'spring', bounce: 0, duration: 0.3 } }}
            transition={{ type: 'spring', bounce: 0, duration: 0.45 }}
          >
            <a href="/scholarship" className="press group flex items-center gap-3 rounded-full py-0.5 pl-0.5 pr-3 sm:pr-4">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-ochre text-ink">
                <GraduationCap size={18} />
              </span>
              <span className="text-[0.95rem] font-semibold">
                <span className="sm:hidden">Scholarships now open</span>
                <span className="hidden sm:inline">Scholarship applications are open</span>
              </span>
              <span className="hidden text-[0.95rem] text-paper/55 sm:inline">Apply online</span>
              <ArrowRight size={16} className="shrink-0 transition-transform duration-300 group-hover:translate-x-0.5" />
            </a>
            <button
              type="button"
              onClick={dismiss}
              aria-label="Hide scholarship notice"
              className="press grid size-10 shrink-0 place-items-center rounded-full text-paper/60 hover:bg-paper/10 hover:text-paper"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
