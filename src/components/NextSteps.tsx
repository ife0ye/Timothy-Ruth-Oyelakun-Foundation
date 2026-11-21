import { ArrowUpRight } from 'lucide-react';
import { LineReveal, Reveal } from './primitives';

const STEPS = [
  {
    href: '/donate',
    eyebrow: 'Donate',
    title: 'Give in their name.',
    body: 'A gift helps pay a school fee, a hospital bill or the first stock for a small business.',
    tone: 'bg-oxblood text-paper [--sub:color-mix(in_oklab,var(--color-paper)_78%,transparent)] [--eyebrow:var(--color-ochre-soft)]',
  },
  {
    href: '/contact',
    eyebrow: 'Contact',
    title: 'Write to us, call, or visit.',
    body: 'Questions about our work, a partnership, or someone who needs help? We would love to hear from you.',
    tone: 'bg-paper-2 text-ink [--sub:var(--color-ink-soft)] [--eyebrow:var(--color-oxblood)]',
  },
];

/** Where the home page hands visitors on: giving, or getting in touch. */
export function NextSteps() {
  return (
    <section aria-label="Get involved" className="px-5 pb-20 sm:px-8 sm:pb-24 lg:pb-28">
      <div className="mx-auto max-w-[100rem]">
        <Reveal>
          <p className="eyebrow mb-5 text-oxblood">Get involved</p>
        </Reveal>
        <LineReveal className="heading text-[clamp(2.4rem,4.4vw,3.9rem)] text-ink" lines={['Two ways to', 'stand with us.']} />

        <ul className="mt-8 grid gap-4 md:grid-cols-2">
          {STEPS.map((step, i) => (
            <Reveal as="li" key={step.href} delay={0.06 * i}>
              <a
                href={step.href}
                className={`group relative block h-full overflow-hidden rounded-[1.75rem] p-6 transition-transform duration-200 ease-[var(--ease-out)] active:scale-[0.985] sm:p-8 ${step.tone}`}
              >
                {/* Pinned to the corner so it doesn't push the title away from its label. */}
                <span className="absolute right-5 top-5 grid size-10 place-items-center rounded-full border border-current/20 transition-transform duration-300 ease-[var(--ease-out)] group-hover:rotate-45 sm:right-7 sm:top-7">
                  <ArrowUpRight size={18} />
                </span>
                <p className="eyebrow pr-14 text-[var(--eyebrow)]">{step.eyebrow}</p>
                <p className="heading mt-2 pr-12 text-[clamp(2rem,3vw,2.6rem)]">{step.title}</p>
                <p className="prose-body mt-3 max-w-md leading-relaxed text-[var(--sub)]">{step.body}</p>
              </a>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
