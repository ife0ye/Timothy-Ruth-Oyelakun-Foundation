import { PageShell } from '../components/PageShell';
import { Contact as ContactSection } from '../components/Contact';

export default function Contact() {
  return (
    <PageShell page="contact">
      <div className="pt-8 sm:pt-10">
        <ContactSection />
      </div>
    </PageShell>
  );
}
