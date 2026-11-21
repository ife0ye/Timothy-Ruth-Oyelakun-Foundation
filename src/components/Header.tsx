import { AnimatePresence, LayoutGroup, motion, useMotionValueEvent, useScroll, useSpring } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { DONATE_LINK as DONATE, NAV, navHref, ORG, type Page } from '../content';
import { EASE_DRAWER, EASE_OUT } from '../lib/motion';

const SECTION_IDS = ['home', ...NAV.filter((n) => !n.path).map((n) => n.id)];

export function Header({ page = 'home' }: { page?: Page }) {
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string>(page);
  const homeHref = page === 'home' ? '#home' : '/';
  const menuButton = useRef<HTMLButtonElement>(null);

  const { scrollY, scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 260, damping: 40, restDelta: 0.001 });

  // Tuck the bar away while reading down; bring it back the moment the reader scrolls up.
  useMotionValueEvent(scrollY, 'change', (y) => {
    const previous = scrollY.getPrevious() ?? 0;
    setScrolled(y > 12);
    setHidden(y > previous && y > 520);
  });

  useEffect(() => {
    // Other pages have a single fixed highlight; only the home page tracks its sections.
    if (page !== 'home') return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id);
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    for (const id of SECTION_IDS) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [page]);

  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    root.style.overflow = 'hidden';
    // The open menu covers the page, so keyboard and screen-reader users stay inside it: the page
    // behind becomes inert, and focus moves to the first menu link.
    const behind = [document.getElementById('main'), document.querySelector('footer'), document.querySelector('a[href="#main"]')].filter((el): el is HTMLElement => Boolean(el));
    behind.forEach((el) => (el.inert = true));
    const frame = requestAnimationFrame(() => document.querySelector<HTMLElement>('#mobile-menu a')?.focus());
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      cancelAnimationFrame(frame);
      root.style.overflow = '';
      behind.forEach((el) => (el.inert = false));
      window.removeEventListener('keydown', onKey);
      menuButton.current?.focus();
    };
  }, [open]);

  const showBar = !hidden || open;

  return (
    <>
      <header
        className="fixed inset-x-0 top-0 z-50 transition-transform duration-300"
        style={{
          transform: showBar ? 'translateY(0)' : 'translateY(-100%)',
          transitionTimingFunction: 'var(--ease-drawer)',
        }}
      >
        <div
          className={`relative transition-[background-color,box-shadow,backdrop-filter] duration-300 ${
            scrolled && !open
              ? 'bg-paper/80 shadow-[0_1px_0_var(--color-line)] backdrop-blur-xl backdrop-saturate-150 reduce-transparency:bg-paper reduce-transparency:backdrop-blur-none'
              : 'bg-transparent'
          }`}
        >
          <nav aria-label="Main" className="mx-auto flex h-[4.5rem] max-w-[100rem] items-center justify-between px-5 sm:px-8">
            <a href={homeHref} className="press flex items-center gap-3 rounded-full" onClick={() => setOpen(false)}>
              <img src="/images/seal-128.webp" alt="" width={44} height={44} className="size-11 rounded-full" />
              <span className="leading-tight">
                <span className="block font-serif text-[1.05rem] tracking-[-0.01em] text-ink">Timothy &amp; Ruth Oyelakun</span>
                <span className="eyebrow block text-[0.62rem] text-oxblood">Foundation</span>
              </span>
            </a>

            <LayoutGroup id="nav">
              <ul className="hidden items-center gap-1 lg:flex">
                {NAV.map((item) => (
                  <li key={item.id}>
                    <a
                      href={navHref(item, page)}
                      aria-current={active === item.id ? (item.path ? 'page' : 'true') : undefined}
                      className="relative block rounded-full px-4 py-2 text-[0.95rem] text-ink-soft transition-colors duration-200 hover:text-ink aria-[current]:text-ink"
                    >
                      {active === item.id && (
                        <motion.span
                          layoutId="nav-dot"
                          className="absolute bottom-0.5 left-1/2 size-1 -translate-x-1/2 rounded-full bg-oxblood"
                          transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
                        />
                      )}
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </LayoutGroup>

            <div className="flex items-center gap-2">
              <a href={navHref(DONATE, page)} aria-current={page === 'donate' ? 'page' : undefined} className="btn-primary hidden px-5 py-2.5 text-[0.95rem] sm:inline-flex" onClick={() => setOpen(false)}>
                Donate
              </a>
              <button
                ref={menuButton}
                type="button"
                className="press relative grid size-11 place-items-center rounded-full lg:hidden"
                aria-expanded={open}
                aria-controls="mobile-menu"
                aria-label={open ? 'Close menu' : 'Open menu'}
                onClick={() => setOpen((v) => !v)}
              >
                <span
                  className="absolute h-[1.5px] w-5 bg-ink transition-transform duration-300"
                  style={{ transform: open ? 'rotate(45deg)' : 'translateY(-4px)', transitionTimingFunction: 'var(--ease-out)' }}
                />
                <span
                  className="absolute h-[1.5px] w-5 bg-ink transition-transform duration-300"
                  style={{ transform: open ? 'rotate(-45deg)' : 'translateY(4px)', transitionTimingFunction: 'var(--ease-out)' }}
                />
              </button>
            </div>
          </nav>

          <motion.div
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-px origin-left bg-oxblood/70"
            style={{ scaleX: progress, opacity: scrolled && !open ? 1 : 0 }}
          />
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            className="fixed inset-0 z-40 flex flex-col bg-paper px-6 pb-10 pt-28 lg:hidden"
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={{ clipPath: 'inset(0 0 100% 0)', transition: { duration: 0.35, ease: EASE_DRAWER } }}
            transition={{ duration: 0.55, ease: EASE_DRAWER }}
          >
            <ul className="flex flex-col">
              {[...NAV, DONATE].map((item, i) => (
                <motion.li
                  key={item.id}
                  className="border-b border-line"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: EASE_OUT, delay: 0.12 + i * 0.05 }}
                >
                  <a
                    href={navHref(item, page)}
                    aria-current={item.path && active === item.id ? 'page' : undefined}
                    onClick={() => setOpen(false)}
                    className="heading flex items-baseline justify-between py-4 text-[2.4rem] text-ink"
                  >
                    {item.label}
                    <span className="font-sans text-sm text-muted">0{i + 1}</span>
                  </a>
                </motion.li>
              ))}
            </ul>
            <motion.div
              className="mt-auto space-y-1 text-ink-soft"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.4 }}
            >
              <a className="block" href={`mailto:${ORG.email}`}>
                {ORG.email}
              </a>
              <a className="block" href={ORG.phoneHref}>
                {ORG.phoneDisplay}
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
