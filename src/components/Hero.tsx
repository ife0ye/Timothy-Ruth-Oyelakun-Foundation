import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react';
import { ArrowDown, ArrowRight } from 'lucide-react';
import { useRef, type PointerEvent } from 'react';
import { EASE_OUT, useFinePointer } from '../lib/motion';
import { LineReveal, Weave } from './primitives';

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const fine = useFinePointer();

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const printY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 140]);
  const copyY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -60]);
  const sealRotate = useTransform(scrollYProgress, [0, 1], [-14, reduce ? -14 : 160]);

  // The photograph tilts toward the pointer like a print held in the hand.
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const rotateX = useSpring(tiltX, { stiffness: 150, damping: 18 });
  const rotateY = useSpring(tiltY, { stiffness: 150, damping: 18 });

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!fine || reduce) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    tiltX.set(py * -10);
    tiltY.set(px * 12);
  };
  const onPointerLeave = () => {
    tiltX.set(0);
    tiltY.set(0);
  };

  return (
    <section ref={ref} id="home" className="relative overflow-hidden pt-28 sm:pt-32">
      <div className="mx-auto grid max-w-[88rem] items-center gap-14 px-5 pb-20 sm:px-8 lg:min-h-[calc(100svh-8rem)] lg:grid-cols-12 lg:gap-8 lg:pb-24">
        <motion.div style={{ y: copyY }} className="lg:col-span-7">
          <motion.p
            className="eyebrow mb-7 flex items-center gap-3 text-teal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            <span className="h-px w-10 bg-teal/40" />
            A family foundation · Ogbomoso, Nigeria
          </motion.p>

          <LineReveal
            as="h1"
            immediate
            delay={0.15}
            className="display text-[clamp(3.1rem,7.6vw,7rem)] text-ink"
            lines={[
              'A legacy of love,',
              <em key="i" className="text-oxblood">
                carried forward.
              </em>,
            ]}
          />

          <motion.p
            className="prose-body mt-8 max-w-[34rem] text-[1.2rem] leading-relaxed text-ink-soft"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE_OUT, delay: 0.55 }}
          >
            The Timothy &amp; Ruth Oyelakun Foundation continues the way they lived: standing beside the less privileged
            with healthcare, education, enterprise and community.
          </motion.p>

          <motion.div
            className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE_OUT, delay: 0.7 }}
          >
            <a href="#donate" className="btn-primary group">
              Give in their name
              <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
            </a>
            <a href="#story" className="link-underline pb-0.5 font-medium text-ink">
              Read their story
            </a>
          </motion.div>
        </motion.div>

        <motion.div style={{ y: printY }} className="relative mx-auto w-full max-w-[30rem] lg:col-span-5 lg:mr-0">
          <div className="[perspective:1200px]" onPointerMove={onPointerMove} onPointerLeave={onPointerLeave}>
            <motion.figure
              style={{ rotateX, rotateY }}
              initial={{ opacity: 0, y: 40, rotate: 0 }}
              animate={{ opacity: 1, y: 0, rotate: -2.5 }}
              transition={{ duration: 1.3, ease: EASE_OUT, delay: 0.2 }}
              className="relative rounded-[3px] bg-[#fdfcf8] p-3 pb-16 shadow-[0_1px_1px_rgba(16,38,45,0.08),0_12px_24px_-8px_rgba(16,38,45,0.18),0_48px_80px_-24px_rgba(16,38,45,0.28)] sm:p-4 sm:pb-20"
            >
              <div className="grain relative overflow-hidden bg-teal-night">
                {/* The photograph "develops" once, like a print in the tray. */}
                <motion.picture
                  className="block"
                  initial={{ filter: 'blur(14px) sepia(1) brightness(1.7) contrast(0.6)' }}
                  animate={{ filter: 'blur(0px) sepia(0) brightness(1) contrast(1)', transitionEnd: { filter: 'none' } }}
                  transition={{ duration: 2.4, ease: EASE_OUT, delay: 0.35 }}
                >
                  <source srcSet="/images/founders.avif" type="image/avif" />
                  <source srcSet="/images/founders.webp" type="image/webp" />
                  <img
                    src="/images/founders.jpg"
                    alt="Timothy and Ruth Oyelakun standing together in traditional aso-oke attire"
                    width={820}
                    height={566}
                    fetchPriority="high"
                    className="aspect-[820/566] w-full object-cover"
                  />
                </motion.picture>
              </div>
              <figcaption className="absolute inset-x-4 bottom-4 flex items-end justify-between sm:inset-x-5 sm:bottom-6">
                <span className="font-serif text-[1.35rem] italic leading-none text-ink/85">Timothy &amp; Ruth</span>
                <span className="eyebrow text-[0.6rem] text-muted">In loving memory</span>
              </figcaption>
            </motion.figure>
          </div>

          <motion.img
            src="/images/seal-256.webp"
            alt=""
            width={112}
            height={112}
            style={{ rotate: sealRotate }}
            initial={{ opacity: 0, scale: 1.3 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', bounce: 0.35, duration: 0.8, delay: 1.5 }}
            className="absolute -right-4 -top-10 size-24 rounded-full shadow-[0_10px_30px_-10px_rgba(16,38,45,0.45)] sm:-right-8 sm:size-28"
          />
        </motion.div>
      </div>

      <motion.a
        href="#story"
        aria-label="Scroll to their story"
        className="absolute bottom-10 left-1/2 hidden -translate-x-1/2 text-muted lg:block"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: reduce ? 0 : [0, 6, 0] }}
        transition={{ opacity: { delay: 1.8 }, y: { duration: 2.2, repeat: Infinity, ease: 'easeInOut', delay: 1.8 } }}
      >
        <ArrowDown size={20} />
      </motion.a>

      <Weave />
    </section>
  );
}
