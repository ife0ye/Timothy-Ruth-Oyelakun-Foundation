import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { useLayoutEffect, useRef, useState } from 'react';
import { PROGRAMS, type Program } from '../content';
import { useMediaQuery } from '../lib/motion';
import { LineReveal, Reveal } from './primitives';

const TONES: Record<Program['tone'], string> = {
  teal: 'bg-teal-deep text-paper [--accent:var(--color-ochre-soft)] [--body:color-mix(in_oklab,var(--color-paper)_78%,transparent)]',
  sand: 'bg-paper-3 text-ink [--accent:var(--color-oxblood)] [--body:var(--color-ink-soft)]',
  oxblood: 'bg-oxblood text-paper [--accent:var(--color-ochre-soft)] [--body:color-mix(in_oklab,var(--color-paper)_80%,transparent)]',
  paper: 'bg-paper text-ink ring-1 ring-line [--accent:var(--color-teal)] [--body:var(--color-ink-soft)]',
  ochre: 'bg-ochre-soft text-ink [--accent:var(--color-oxblood-deep)] [--body:var(--color-ink-soft)]',
};

const INTRO = {
  eyebrow: 'Programs',
  lines: ['Five ways their', 'love keeps working.'],
  body: 'Targeted initiatives that meet real needs in our community, each one shaped by the causes Timothy and Ruth cared about most.',
};

export function Programs() {
  const wide = useMediaQuery('(min-width: 1024px)');
  const reduce = useReducedMotion();
  return wide && !reduce ? <PinnedPrograms /> : <StackedPrograms />;
}

function PinnedPrograms() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0);

  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const measure = () => setDistance(Math.max(0, track.scrollWidth - window.innerWidth));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  // Vertical scrolling drives the horizontal track while the section stays pinned.
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] });
  const x = useTransform(scrollYProgress, (v) => -v * distance);
  const bar = useSpring(scrollYProgress, { stiffness: 200, damping: 40 });

  return (
    <section ref={sectionRef} id="programs" className="relative" style={{ height: `calc(100vh + ${distance}px)` }}>
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        <motion.div ref={trackRef} style={{ x }} className="flex w-max items-stretch gap-6 pl-[max(2rem,calc((100vw-88rem)/2+2rem))] pr-[8vw]">
          <div className="flex w-[30rem] shrink-0 flex-col justify-center pr-10">
            <Reveal>
              <p className="eyebrow mb-5 text-oxblood">{INTRO.eyebrow}</p>
            </Reveal>
            <LineReveal className="heading text-[clamp(2.6rem,4.2vw,4rem)] text-ink" lines={INTRO.lines} />
            <Reveal delay={0.1}>
              <p className="prose-body mt-6 text-lg leading-relaxed text-ink-soft">{INTRO.body}</p>
              <p className="eyebrow mt-10 flex items-center gap-3 text-muted">
                Keep scrolling <ArrowRight size={14} />
              </p>
            </Reveal>
          </div>

          {PROGRAMS.map((program, i) => (
            <ProgramCard key={program.title} program={program} index={i} className="h-[min(36rem,70vh)] w-[min(25rem,30vw)]" />
          ))}

          <div className="flex w-[24rem] shrink-0 flex-col justify-center pl-8">
            <p className="heading text-[2.2rem] text-ink">Every programme is funded by people who care.</p>
            <a href="#donate" className="btn-primary group mt-8 self-start">
              Fund this work
              <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
            </a>
          </div>
        </motion.div>

        <div className="mx-auto mt-10 h-px w-[min(88rem,calc(100vw-4rem))] bg-line">
          <motion.div className="h-full origin-left bg-ink" style={{ scaleX: bar }} />
        </div>
      </div>
    </section>
  );
}

function StackedPrograms() {
  return (
    <section id="programs" className="px-5 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto max-w-[88rem]">
        <Reveal>
          <p className="eyebrow mb-5 text-oxblood">{INTRO.eyebrow}</p>
        </Reveal>
        <LineReveal className="heading text-[clamp(2.4rem,7vw,4rem)] text-ink" lines={INTRO.lines} />
        <Reveal delay={0.1}>
          <p className="prose-body mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">{INTRO.body}</p>
        </Reveal>

        <ul className="mt-14 grid gap-4 sm:grid-cols-2">
          {PROGRAMS.map((program, i) => (
            <Reveal as="li" key={program.title} delay={0.04 * (i % 2)}>
              <ProgramCard program={program} index={i} className="min-h-[22rem]" />
            </Reveal>
          ))}
        </ul>

        <Reveal className="mt-12">
          <a href="#donate" className="btn-primary group">
            Fund this work
            <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
          </a>
        </Reveal>
      </div>
    </section>
  );
}

function ProgramCard({ program, index, className = '' }: { program: Program; index: number; className?: string }) {
  const Icon = program.icon;
  return (
    <article
      className={`group relative flex h-full shrink-0 flex-col overflow-hidden rounded-[1.75rem] p-7 sm:p-8 ${TONES[program.tone]} ${className}`}
    >
      <div className="flex items-start justify-between">
        <span className="font-serif text-[4.5rem] italic leading-[0.8] tracking-[-0.04em] text-[var(--accent)]">
          0{index + 1}
        </span>
        <span className="grid size-12 place-items-center rounded-full border border-current/15 transition-transform duration-500 ease-[var(--ease-out)] group-hover:rotate-[-12deg] group-hover:scale-110">
          <Icon size={22} strokeWidth={1.6} />
        </span>
      </div>
      <div className="mt-auto pt-12">
        <h3 className="heading text-[1.95rem]">{program.title}</h3>
        <p className="prose-body mt-4 leading-relaxed text-[var(--body)]">{program.description}</p>
      </div>
    </article>
  );
}
