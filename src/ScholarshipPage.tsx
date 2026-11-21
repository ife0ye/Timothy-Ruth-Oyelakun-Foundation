import { MotionConfig } from 'motion/react';
import { useEffect } from 'react';
import { installSectionLinks } from './lib/smoothScroll';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { LineReveal, Reveal } from './components/primitives';
import { Eligibility, Requirements, ScholarshipIntro } from './components/scholarship/ScholarshipInfo';
import { ApplicationForm } from './components/scholarship/ApplicationForm';

export default function ScholarshipPage() {
  useEffect(() => installSectionLinks(), []);

  return (
    <MotionConfig reducedMotion="user">
      <a
        href="#main"
        className="fixed left-4 top-4 z-[100] -translate-y-24 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-paper transition-transform focus:translate-y-0"
      >
        Skip to content
      </a>
      <Header page="scholarship" />
      <main id="main">
        <ScholarshipIntro />
        <Eligibility />

        <section id="apply" className="px-5 py-24 sm:px-8 sm:py-32 lg:py-40">
          <div className="mx-auto max-w-[100rem]">
            <div className="max-w-2xl">
              <Reveal>
                <p className="eyebrow mb-5 text-oxblood">Apply</p>
              </Reveal>
              <LineReveal className="heading text-[clamp(2.4rem,4.4vw,3.9rem)] text-ink" lines={['Your application,', 'in six short steps.']} />
              <Reveal delay={0.1}>
                <p className="prose-body mt-6 text-lg leading-relaxed text-ink-soft">
                  Have your documents and your referee's details ready before you start. Everything you send goes straight to the
                  foundation.
                </p>
              </Reveal>
            </div>

            <div className="mt-14 grid gap-8 lg:grid-cols-12 lg:gap-8">
              <div className="lg:col-span-8 lg:col-start-5 lg:row-start-1">
                <Reveal>
                  <ApplicationForm />
                </Reveal>
              </div>
              <div className="lg:col-span-4 lg:row-start-1">
                <div className="lg:sticky lg:top-28">
                  <Requirements />
                </div>
              </div>
            </div>

            <Reveal className="mt-16 max-w-3xl border-t border-line pt-8">
              <p className="prose-body italic leading-relaxed text-ink-soft">
                Only complete applications with all supporting documents will be considered. The Timothy &amp; Ruth Oyelakun Foundation
                reserves the right to verify all information provided and to request additional information if necessary.
              </p>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer page="scholarship" />
    </MotionConfig>
  );
}
