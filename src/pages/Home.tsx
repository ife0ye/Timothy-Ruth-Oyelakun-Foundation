import { PageShell } from '../components/PageShell';
import { Hero } from '../components/Hero';
import { Story } from '../components/Story';
import { Mission } from '../components/Mission';
import { Programs } from '../components/Programs';
import { ScholarshipFeature, ScholarshipNudge } from '../components/ScholarshipFeature';
import { NextSteps } from '../components/NextSteps';

export default function Home() {
  return (
    <PageShell page="home">
      <Hero />
      <Story />
      <Mission />
      <Programs />
      <ScholarshipFeature />
      <NextSteps />
      <ScholarshipNudge />
    </PageShell>
  );
}
