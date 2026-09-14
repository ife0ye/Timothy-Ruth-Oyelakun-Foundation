import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { ArrowUp } from 'lucide-react';
import { useRef } from 'react';
import { NAV, ORG } from '../content';

export function Footer() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end end'] });
  // The names rise into view as the page comes to rest.
  const y = useTransform(scrollYProgress, [0, 1], [reduce ? '0%' : '45%', '0%']);

  return (
    <footer ref={ref} className="relative overflow-hidden bg-teal-night text-paper">
      <div className="mx-auto max-w-[88rem] px-5 pt-20 sm:px-8">
        <div className="grid gap-12 border-b border-paper/10 pb-14 md:grid-cols-12">
          <div className="md:col-span-5">
            <div className="flex items-center gap-4">
              <img src="/images/seal-128.webp" alt="" width={56} height={56} loading="lazy" className="size-14 rounded-full" />
              <p className="font-serif text-xl leading-tight">
                Timothy &amp; Ruth Oyelakun
                <span className="eyebrow mt-1 block text-[0.65rem] text-ochre-soft">Foundation</span>
              </p>
            </div>
            <p className="prose-body mt-6 max-w-sm text-paper/65">
              Continuing a legacy of compassion, service and love for the people who need it most.
            </p>
          </div>

          <nav aria-label="Footer" className="md:col-span-3 md:col-start-7">
            <p className="eyebrow mb-4 text-paper/45">Explore</p>
            <ul className="space-y-2.5">
              {[...NAV, { id: 'donate', label: 'Donate' }].map((item) => (
                <li key={item.id}>
                  <a href={`#${item.id}`} className="link-underline text-paper/80 transition-colors hover:text-paper">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="md:col-span-3">
            <p className="eyebrow mb-4 text-paper/45">Reach us</p>
            <ul className="space-y-2.5 text-paper/80">
              <li>
                <a href={`mailto:${ORG.email}`} className="link-underline hover:text-paper">
                  {ORG.email}
                </a>
              </li>
              <li>
                <a href={ORG.phoneHref} className="link-underline hover:text-paper">
                  {ORG.phoneDisplay}
                </a>
              </li>
              <li className="text-paper/60">Ogbomoso, Oyo State, Nigeria</li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col-reverse items-start justify-between gap-4 py-6 text-sm text-paper/55 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} {ORG.name}. All rights reserved.</p>
          <a href="#home" className="press group inline-flex items-center gap-2 rounded-full border border-paper/15 px-4 py-2 text-paper/80 hover:border-paper/40 hover:text-paper">
            Back to top
            <ArrowUp size={14} className="transition-transform duration-300 group-hover:-translate-y-0.5" />
          </a>
        </div>
      </div>

      <div aria-hidden className="pointer-events-none select-none overflow-hidden">
        <motion.p
          style={{ y }}
          className="display -mb-[0.2em] whitespace-nowrap text-center text-[14.5vw] italic leading-none text-paper/[0.07]"
        >
          Timothy &amp; Ruth
        </motion.p>
      </div>
    </footer>
  );
}
