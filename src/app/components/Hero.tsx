import { ArrowRight } from 'lucide-react';
import logo from '@/assets/b717e63ee79afbfd57ade082f9965799919c63ab.png';

export function Hero() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="home" className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center text-center">
          <img src={logo} alt="Foundation Logo" className="h-32 w-32 mb-8" />
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#1a4d5d] mb-6">
            Timothy & Ruth Oyelakun Foundation
          </h1>
          <p className="text-xl sm:text-2xl text-gray-600 mb-8 max-w-3xl">
            Honoring a legacy of love, compassion, and service to humanity
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => scrollToSection('about')}
              className="bg-[#8b3a3a] text-white px-8 py-4 rounded-full hover:bg-[#6d2d2d] transition-colors flex items-center justify-center gap-2"
            >
              Learn More
              <ArrowRight size={20} />
            </button>
            <button 
              onClick={() => scrollToSection('donate')}
              className="border-2 border-[#1a4d5d] text-[#1a4d5d] px-8 py-4 rounded-full hover:bg-[#1a4d5d] hover:text-white transition-colors"
            >
              Support Our Mission
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
