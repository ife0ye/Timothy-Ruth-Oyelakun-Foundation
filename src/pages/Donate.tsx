import { PageShell } from '../components/PageShell';
import { Donate as DonateSection } from '../components/Donate';
import { Weave } from '../components/primitives';

export default function Donate() {
  return (
    <PageShell page="donate">
      {/* Room for the header to sit on paper before the dark section begins. */}
      <div aria-hidden className="h-24 sm:h-28" />
      <DonateSection />
      <Weave />
    </PageShell>
  );
}
