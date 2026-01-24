import { Heart } from 'lucide-react';
import logo from '@/assets/b717e63ee79afbfd57ade082f9965799919c63ab.png';

export function Footer() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <footer className="bg-[#1a4d5d] text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img src={logo} alt="Foundation Logo" className="h-16 w-16" />
              <div>
                <div className="text-lg font-semibold">Timothy & Ruth Oyelakun</div>
                <div className="text-sm text-blue-200">Foundation</div>
              </div>
            </div>
            <p className="text-blue-100 mb-4">
              Continuing a legacy of compassion, service, and love. Together, we can make a lasting 
              difference in the lives of those who need it most.
            </p>
          </div>

          <div className="md:text-right">
            <h4 className="font-bold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => scrollToSection('home')} className="text-blue-100 hover:text-white transition-colors">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('about')} className="text-blue-100 hover:text-white transition-colors">
                  About Us
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('programs')} className="text-blue-100 hover:text-white transition-colors">
                  Programs
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('contact')} className="text-blue-100 hover:text-white transition-colors">
                  Contact
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-blue-700 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-blue-100 text-sm text-center sm:text-left">
            © {new Date().getFullYear()} Timothy & Ruth Oyelakun Foundation. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-sm text-blue-100">
            Made with <Heart size={16} className="text-[#8b3a3a]" fill="currentColor" /> in memory of Timothy & Ruth
          </div>
        </div>
      </div>
    </footer>
  );
}
