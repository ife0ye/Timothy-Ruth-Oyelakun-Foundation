import { animate } from 'motion';

// A calm ease-in-out: eases away from the start and settles gently at the destination.
const EASE_GENTLE = [0.45, 0, 0.2, 1] as const;

let current: { stop: () => void } | null = null;

function headerOffset(): number {
  return parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
}

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Scrolls to a section at an unhurried pace; longer distances take a little longer, within limits. */
export function scrollToSection(id: string): void {
  const target = document.getElementById(id);
  if (!target) return;

  const start = window.scrollY;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const end = id === 'home' ? 0 : Math.min(maxScroll, Math.max(0, target.getBoundingClientRect().top + start - headerOffset()));
  const distance = Math.abs(end - start);

  current?.stop();
  window.history.pushState(null, '', `#${id}`);

  const finish = () => {
    // Move keyboard and screen-reader focus to the section without scrolling again.
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  };

  if (prefersReducedMotion() || distance < 2) {
    window.scrollTo(0, end);
    finish();
    return;
  }

  const duration = Math.min(1.8, Math.max(0.9, distance / 1600));

  // The visitor taking over (wheel, touch, keys) always wins over the animation.
  const cancelEvents = ['wheel', 'touchstart', 'keydown', 'pointerdown'] as const;
  const cancel = () => current?.stop();
  const cleanup = () => cancelEvents.forEach((type) => window.removeEventListener(type, cancel));
  cancelEvents.forEach((type) => window.addEventListener(type, cancel, { passive: true }));

  const controls = animate(start, end, {
    duration,
    ease: EASE_GENTLE,
    onUpdate: (y) => window.scrollTo(0, y),
    onComplete: () => {
      cleanup();
      finish();
    },
  });

  current = {
    stop: () => {
      controls.stop();
      cleanup();
      current = null;
    },
  };
}

/** Routes every in-page "#section" link through the gentle scroll. Returns an uninstall function. */
export function installSectionLinks(): () => void {
  const onClick = (event: MouseEvent) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = (event.target as Element | null)?.closest?.('a[href^="#"]');
    const id = link?.getAttribute('href')?.slice(1);
    if (!id || !document.getElementById(id)) return;
    event.preventDefault();
    // Let any open menu close and release the page before scrolling.
    requestAnimationFrame(() => scrollToSection(id));
  };

  document.addEventListener('click', onClick);
  return () => document.removeEventListener('click', onClick);
}
