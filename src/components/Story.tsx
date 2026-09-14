import { motion } from 'motion/react';
import { EASE_OUT } from '../lib/motion';
import { LineReveal, Reveal, ScrubText } from './primitives';

export function Story() {
  return (
    <section id="story" className="relative px-5 py-24 sm:px-8 sm:py-32 lg:py-40">
      <div className="mx-auto max-w-[100rem]">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-32">
              <Reveal>
                <p className="eyebrow mb-5 text-oxblood">In loving memory</p>
              </Reveal>
              <LineReveal
                className="heading text-[clamp(2.4rem,4.4vw,3.9rem)] text-ink"
                lines={['Timothy', <>&amp; Ruth Oyelakun</>]}
              />
              <StoryPhoto />
            </div>
          </div>

          <div className="space-y-8 lg:col-span-7 lg:col-start-6">
            <Reveal>
              <p className="prose-body text-[1.3rem] leading-[1.65] text-ink sm:text-[1.45rem]">
                Throughout their lives, Timothy and Ruth Oyelakun were known for compassion, generosity and a deep
                commitment to uplifting the less privileged. The foundation was established to honour those lives,
                and to keep their example working.
              </p>
            </Reveal>
            <Reveal delay={0.05}>
              <p className="prose-body max-w-[40rem] text-lg leading-[1.75] text-ink-soft">
                Today we provide aid and grants in healthcare, education, business empowerment and community
                development, so that people facing hardship have access to essential services and a real chance to
                move forward.
              </p>
            </Reveal>
          </div>
        </div>

        <div className="mt-24 border-t border-line pt-16 sm:mt-32 sm:pt-24">
          <ScrubText
            className="heading mx-auto max-w-[62rem] text-[clamp(1.9rem,4.1vw,3.6rem)] leading-[1.14] text-ink"
            text="Though they are no longer with us, their spirit lives on through every scholarship awarded, every medical bill paid, every business empowered and every community project completed."
          />
          <Reveal className="mx-auto mt-10 flex max-w-[62rem] items-center gap-4">
            <span className="h-px w-12 bg-oxblood" />
            <p className="font-serif text-lg italic text-ink-soft">
              A testament to their belief in the dignity and potential of every human being.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/** The photograph unveils top to bottom as it scrolls into view, then settles. */
function StoryPhoto() {
  return (
    <figure className="mt-10 max-w-md">
      <motion.div
        className="overflow-hidden rounded-2xl bg-teal-night"
        initial={{ clipPath: 'inset(0 0 100% 0)' }}
        whileInView={{ clipPath: 'inset(0 0 0% 0)' }}
        viewport={{ once: true, margin: '0px 0px -15% 0px' }}
        transition={{ duration: 1.2, ease: EASE_OUT }}
      >
        <motion.picture
          className="block"
          initial={{ scale: 1.15 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true, margin: '0px 0px -15% 0px' }}
          transition={{ duration: 1.6, ease: EASE_OUT }}
        >
          <source srcSet="/images/founders.avif" type="image/avif" />
          <source srcSet="/images/founders.webp" type="image/webp" />
          <img
            src="/images/founders.jpg"
            alt="Timothy and Ruth Oyelakun"
            width={820}
            height={566}
            loading="lazy"
            decoding="async"
            className="aspect-[820/566] w-full object-cover"
          />
        </motion.picture>
      </motion.div>
      <figcaption className="mt-3 text-sm text-muted">Timothy and Ruth Oyelakun, Ogbomoso</figcaption>
    </figure>
  );
}
