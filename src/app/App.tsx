import { Header } from '@/app/components/Header';
import { Hero } from '@/app/components/Hero';
import { About } from '@/app/components/About';
import { Mission } from '@/app/components/Mission';
import { Programs } from '@/app/components/Programs';
import { Donate } from '@/app/components/Donate';
import { Contact } from '@/app/components/Contact';
import { Footer } from '@/app/components/Footer';

export default function App() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <Hero />
        <About />
        <Mission />
        <Programs />
        <Donate />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
