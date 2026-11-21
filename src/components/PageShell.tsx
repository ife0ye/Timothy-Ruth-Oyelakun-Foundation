import { MotionConfig } from 'motion/react';
import { useEffect, type ReactNode } from 'react';
import type { Page } from '../content';
import { installSectionLinks } from '../lib/smoothScroll';
import { Footer } from './Footer';
import { Header } from './Header';

/** The frame every page shares: skip link, header, footer and motion settings. */
export function PageShell({ page, children }: { page: Page; children: ReactNode }) {
  useEffect(() => installSectionLinks(), []);

  return (
    <MotionConfig reducedMotion="user">
      <a
        href="#main"
        className="fixed left-4 top-4 z-[100] -translate-y-24 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-paper transition-transform focus:translate-y-0"
      >
        Skip to content
      </a>
      <Header page={page} />
      <main id="main">{children}</main>
      <Footer page={page} />
    </MotionConfig>
  );
}
