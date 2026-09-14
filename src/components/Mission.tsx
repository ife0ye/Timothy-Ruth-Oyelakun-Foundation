import { motion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';
import { GUIDING } from '../content';
import { EASE_OUT } from '../lib/motion';
import { LineReveal, Reveal } from './primitives';

const VALUES = ['Compassion', 'Integrity', 'Service'];

export function Mission() {
  return (
    <section id="mission" className="relative bg-paper-2 px-5 py-24 sm:px-8 sm:py-32 lg:py-40">
      <div className="mx-auto max-w-[100rem]">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-32">
              <Reveal>
                <p className="eyebrow mb-5 text-oxblood">What guides us</p>
              </Reveal>
              <LineReveal
                className="heading text-[clamp(2.4rem,4.4vw,3.9rem)] text-ink"
                lines={['Meaningful action,', 'lasting impact.']}
              />
            </div>
          </div>

          <ol className="lg:col-span-7 lg:col-start-6">
            {GUIDING.map((item, i) => (
              <GuideRow key={item.label} index={i} label={item.label} text={item.text} />
            ))}
          </ol>
        </div>

        <div className="mt-24 flex flex-col items-center gap-y-1 sm:flex-row sm:flex-wrap sm:items-baseline sm:justify-center sm:gap-x-[3vw] sm:mt-32">
          {VALUES.map((word, i) => (
            <span key={word} className="flex items-baseline gap-[3vw]">
              <LineReveal
                as="span"
                delay={i * 0.12}
                className="display block text-[clamp(3rem,6.3vw,7.4rem)] text-teal"
                lines={[i === 1 ? <em key="e">{word}</em> : word]}
              />
              {i < VALUES.length - 1 && (
                <motion.span
                  aria-hidden
                  className="hidden size-[clamp(0.5rem,1vw,0.95rem)] rotate-45 bg-ochre sm:inline-block"
                  initial={{ scale: 0.4, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ type: 'spring', bounce: 0.4, duration: 0.7, delay: 0.3 + i * 0.12 }}
                />
              )}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function GuideRow({ index, label, text }: { index: number; label: string; text: string }) {
  const ref = useRef<HTMLLIElement>(null);
  // Each statement comes into full focus as it crosses the middle of the screen.
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.9', 'center 0.55'] });
  const opacity = useTransform(scrollYProgress, [0, 1], [0.25, 1]);
  const x = useTransform(scrollYProgress, [0, 1], [24, 0]);

  return (
    <motion.li
      ref={ref}
      style={{ opacity }}
      className="grid gap-4 border-t border-line py-10 first:border-t-0 first:pt-0 sm:grid-cols-[9rem_1fr] sm:gap-8 sm:py-14"
    >
      <p className="flex items-baseline gap-3 sm:flex-col sm:gap-1">
        <span className="font-sans text-sm tabular-nums text-muted">0{index + 1}</span>
        <span className="font-serif text-[1.75rem] italic leading-none text-oxblood">{label}</span>
      </p>
      <motion.p style={{ x }} transition={{ ease: EASE_OUT }} className="prose-body text-[1.25rem] leading-[1.6] text-ink sm:text-[1.4rem]">
        {text}
      </motion.p>
    </motion.li>
  );
}
