import { MotionConfig } from 'motion/react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Story } from './components/Story';
import { Mission } from './components/Mission';
import { Programs } from './components/Programs';
import { Donate } from './components/Donate';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <a
        href="#main"
        className="fixed left-4 top-4 z-[100] -translate-y-24 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-paper transition-transform focus:translate-y-0"
      >
        Skip to content
      </a>
      <Header />
      <main id="main">
        <Hero />
        <Story />
        <Mission />
        <Programs />
        <Donate />
        <Contact />
      </main>
      <Footer />
    </MotionConfig>
  );
}
