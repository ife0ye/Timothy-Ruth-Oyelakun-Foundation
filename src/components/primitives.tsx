import { motion, useScroll, useTransform, type MotionValue } from 'motion/react';
import { useRef, type ElementType, type ReactNode } from 'react';
import { EASE_OUT } from '../lib/motion';

/**
 * A strip of narrow woven bands, after the striped aso-oke cloth Timothy and Ruth wear
 * in their photograph. Used as the site's recurring divider. It "weaves" in from the left.
 */
export function Weave({ className = '', delay = 0 }: { className?: string; delay?: number }) {
  return (
    <motion.div
      aria-hidden
      className={`h-3 w-full ${className}`}
      style={{
        backgroundImage:
          'repeating-linear-gradient(90deg, var(--color-teal) 0 14px, var(--color-paper-3) 14px 17px, var(--color-oxblood) 17px 25px, var(--color-ochre) 25px 28px, var(--color-teal-deep) 28px 40px, var(--color-paper-3) 40px 42px, var(--color-ochre-soft) 42px 48px, var(--color-oxblood-deep) 48px 52px)',
      }}
      initial={{ clipPath: 'inset(0 100% 0 0)' }}
      whileInView={{ clipPath: 'inset(0 0% 0 0)' }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ duration: 1.4, ease: EASE_OUT, delay }}
    />
  );
}

/** Fades and lifts content into place once, as it enters the viewport. */
export function Reveal({
  children,
  className,
  delay = 0,
  as = 'div',
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: 'div' | 'li' | 'p' | 'section';
}) {
  const Component = motion[as];
  return (
    <Component
      className={className}
      initial={{ opacity: 0, y: 28, filter: 'blur(6px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ duration: 0.9, ease: EASE_OUT, delay }}
    >
      {children}
    </Component>
  );
}

/** Headline lines rise out of a mask one after another. */
export function LineReveal({
  lines,
  as: Tag = 'h2',
  className,
  delay = 0,
  immediate = false,
}: {
  lines: ReactNode[];
  as?: ElementType;
  className?: string;
  delay?: number;
  immediate?: boolean;
}) {
  const trigger = immediate
    ? { animate: { y: '0%' } }
    : { whileInView: { y: '0%' }, viewport: { once: true, margin: '0px 0px -8% 0px' } };

  return (
    <Tag className={className}>
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden pb-[0.12em] -mb-[0.12em]">
          <motion.span
            className="block"
            initial={{ y: '105%' }}
            {...trigger}
            transition={{ duration: 1.05, ease: EASE_OUT, delay: delay + i * 0.09 }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}

/** Words darken one by one as the passage scrolls through the reading zone. */
export function ScrubText({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'end 0.5'] });
  const words = text.split(' ');

  return (
    <p ref={ref} className={className}>
      {words.map((word, i) => (
        <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]}>
          {word}
        </Word>
      ))}
    </p>
  );
}

function Word({ children, progress, range }: { children: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.18, 1]);
  return (
    <>
      <motion.span style={{ opacity }}>{children}</motion.span>{' '}
    </>
  );
}
