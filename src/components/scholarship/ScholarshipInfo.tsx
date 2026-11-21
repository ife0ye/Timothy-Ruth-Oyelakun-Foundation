import { motion } from 'motion/react';
import type { ReactNode } from 'react';
import { ArrowDown, ArrowRight, Check, Download } from 'lucide-react';
import { SCHOLARSHIP } from '../../content';
import { EASE_OUT } from '../../lib/motion';
import { LineReveal, Reveal, Weave } from '../primitives';

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.9, ease: EASE_OUT, delay },
});

export function ScholarshipIntro() {
  return (
    <section id="home" className="relative overflow-hidden pt-28 sm:pt-32">
      <div className="mx-auto grid max-w-[100rem] items-end gap-14 px-5 pb-20 sm:px-8 lg:grid-cols-12 lg:gap-8 lg:pb-28 lg:pt-16">
        <div className="lg:col-span-7">
          <motion.p className="eyebrow mb-7 flex items-center gap-3 text-teal" {...fadeUp(0.1)}>
            <span className="h-px w-10 bg-teal/40" />
            Scholarship programme
          </motion.p>

          <LineReveal
            as="h1"
            immediate
            delay={0.15}
            className="display text-[clamp(3rem,7.2vw,6.6rem)] text-ink"
            lines={[
              'Help to finish',
              <em key="i" className="text-oxblood">
                what you started.
              </em>,
            ]}
          />

          <motion.p className="prose-body mt-8 max-w-[36rem] text-[1.2rem] leading-relaxed text-ink-soft" {...fadeUp(0.55)}>
            {SCHOLARSHIP.intro}
          </motion.p>

          <motion.div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4" {...fadeUp(0.7)}>
            <a href="#apply" className="btn-primary group">
              Start your application
              <ArrowDown size={18} className="transition-transform duration-300 group-hover:translate-y-0.5" />
            </a>
            <a href={SCHOLARSHIP.pdfPath} download className="link-underline inline-flex items-center gap-2 pb-0.5 font-medium text-ink">
              <Download size={16} />
              Download the PDF form
            </a>
          </motion.div>
        </div>

        <motion.aside
          aria-label="At a glance"
          className="relative overflow-hidden rounded-[1.75rem] bg-teal-deep p-7 text-paper sm:p-9 lg:col-span-4 lg:col-start-9"
          initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 1, ease: EASE_OUT, delay: 0.45 }}
        >
          <img
            src="/images/seal-128.webp"
            alt=""
            width={128}
            height={128}
            className="absolute -right-6 -top-6 size-28 rounded-full opacity-15"
          />
          <p className="eyebrow text-ochre-soft">At a glance</p>
          <dl className="mt-6 divide-y divide-paper/10">
            <Glance term="For">Nigerian students at public universities and polytechnics in Nigeria</Glance>
            <Glance term="Grades">Newly admitted, or a CGPA of 3.5 and above on a 5-point scale</Glance>
            <Glance term="Apply">Online on this page, or on paper at our office</Glance>
            {SCHOLARSHIP.deadline && <Glance term="Deadline">{SCHOLARSHIP.deadline}</Glance>}
          </dl>
        </motion.aside>
      </div>
      <Weave />
    </section>
  );
}

function Glance({ term, children }: { term: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[5.5rem_1fr] gap-4 py-4 first:pt-0 last:pb-0">
      <dt className="text-sm text-paper/55">{term}</dt>
      <dd className="leading-snug text-paper/90">{children}</dd>
    </div>
  );
}

export function Eligibility() {
  return (
    <section id="eligibility" className="bg-paper-2 px-5 py-24 sm:px-8 sm:py-32 lg:py-40">
      <div className="mx-auto grid max-w-[100rem] gap-14 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-32">
            <Reveal>
              <p className="eyebrow mb-5 text-oxblood">Eligibility</p>
            </Reveal>
            <LineReveal className="heading text-[clamp(2.4rem,4.4vw,3.9rem)] text-ink" lines={['Who can', 'apply.']} />
          </div>
        </div>

        <ol className="lg:col-span-7 lg:col-start-6">
          <Criterion index={0} label="You are">
            <p className="prose-body text-[1.25rem] leading-[1.6] text-ink sm:text-[1.4rem]">
              A citizen of Nigeria studying at a recognised public university or polytechnic in Nigeria.
            </p>
          </Criterion>

          <Criterion index={1} label="And either">
            <div className="relative grid gap-3 sm:grid-cols-2 sm:gap-4">
              <div className="rounded-2xl bg-paper p-6 ring-1 ring-line">
                <p className="font-serif text-[1.6rem] leading-tight text-ink">Newly admitted</p>
                <p className="prose-body mt-3 leading-relaxed text-ink-soft">
                  You have just been admitted through <strong className="font-semibold text-ink">UTME or Direct Entry</strong>.
                </p>
              </div>
              <span
                aria-hidden
                // Stacked on phones it sits in the gap between the cards; side by side it sits on the seam.
                className="eyebrow relative z-10 -my-6 mx-auto grid size-11 place-items-center rounded-full bg-ochre text-[0.65rem] text-ink ring-4 ring-paper-2 sm:absolute sm:left-1/2 sm:top-1/2 sm:my-0 sm:-translate-x-1/2 sm:-translate-y-1/2"
              >
                or
              </span>
              <div className="rounded-2xl bg-teal-deep p-6 text-paper">
                <p className="font-serif text-[1.6rem] leading-tight">Already studying</p>
                <p className="prose-body mt-3 leading-relaxed text-paper/80">
                  You have completed at least one session with a CGPA of{' '}
                  <strong className="font-semibold text-paper">3.5 or more on a 5-point scale</strong>: Second Class Upper, or its
                  equivalent at a polytechnic.
                </p>
              </div>
            </div>
          </Criterion>

          <Criterion index={2} label="Please note">
            <p className="prose-body rounded-2xl bg-oxblood/[0.07] px-6 py-5 text-[1.1rem] leading-relaxed text-oxblood-deep">
              The scholarship is withdrawn if you secure the Federal Government student loan (NELFUND).
            </p>
          </Criterion>
        </ol>
      </div>
    </section>
  );
}

function Criterion({ index, label, children }: { index: number; label: string; children: ReactNode }) {
  return (
    <Reveal
      as="li"
      className="grid gap-4 border-t border-line py-10 first:border-t-0 first:pt-0 last:pb-0 sm:grid-cols-[9rem_1fr] sm:gap-8 sm:py-12"
    >
      <p className="flex items-baseline gap-3 sm:flex-col sm:gap-1">
        <span className="font-sans text-sm tabular-nums text-muted">0{index + 1}</span>
        <span className="font-serif text-[1.75rem] italic leading-none text-oxblood">{label}</span>
      </p>
      <div>{children}</div>
    </Reveal>
  );
}

const NEEDS = [
  'This application form, completed',
  'Your O-level results',
  'Your academic transcript, if you have finished a session',
  'Proof of admission or enrolment',
  'A letter of recommendation from your referee',
];

export function Requirements() {
  return (
    <div className="space-y-4">
      <Reveal className="rounded-[1.5rem] bg-paper-2 p-6 sm:p-8">
        <p className="font-semibold text-ink">What you'll need</p>
        <ul className="mt-5 space-y-3">
          {NEEDS.map((item) => (
            <li key={item} className="flex gap-3 text-ink-soft">
              <span className="mt-1 grid size-5 shrink-0 place-items-center rounded-full bg-teal text-paper">
                <Check size={12} strokeWidth={3} />
              </span>
              <span className="leading-snug">{item}</span>
            </li>
          ))}
        </ul>
        <p className="mt-6 border-t border-line pt-5 text-sm leading-relaxed text-muted">
          Clear phone photos of your documents are fine. We shrink them before sending, so they upload quickly.
        </p>
      </Reveal>

      <Reveal delay={0.08} className="rounded-[1.5rem] p-6 ring-1 ring-line sm:p-8">
        <p className="font-semibold text-ink">Prefer paper?</p>
        <p className="prose-body mt-3 leading-relaxed text-ink-soft">
          Download the form, fill it in, and bring it with copies of your documents to our office:
        </p>
        <address className="mt-4 not-italic leading-relaxed text-ink">
          {SCHOLARSHIP.paperAddressLines.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </address>
        <p className="mt-4 leading-relaxed text-ink-soft">
          Or scan everything and email it to{' '}
          <a href={`mailto:${SCHOLARSHIP.paperEmail}`} className="break-all font-medium text-teal underline decoration-teal/30 underline-offset-4">
            {SCHOLARSHIP.paperEmail}
          </a>
          .
        </p>
        <a
          href={SCHOLARSHIP.pdfPath}
          download
          className="press group mt-6 inline-flex items-center gap-2 rounded-full border border-ink/15 px-5 py-2.5 text-[0.95rem] font-semibold text-ink hover:border-ink/40"
        >
          <Download size={16} />
          Download the PDF form
          <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-0.5" />
        </a>
      </Reveal>
    </div>
  );
}
