import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import logo from '@/assets/b717e63ee79afbfd57ade082f9965799919c63ab.png';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setIsMenuOpen(false);
    }
  };

  return (
    <header className="fixed top-0 w-full bg-white/95 backdrop-blur-sm shadow-sm z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Timothy & Ruth Oyelakun Foundation" className="h-16 w-16" />
            <div className="hidden sm:block">
              <div className="text-lg font-semibold text-[#1a4d5d]">Timothy & Ruth Oyelakun</div>
              <div className="text-sm text-[#8b3a3a]">Foundation</div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => scrollToSection('home')} className="text-gray-700 hover:text-[#1a4d5d] transition-colors">
              Home
            </button>
            <button onClick={() => scrollToSection('about')} className="text-gray-700 hover:text-[#1a4d5d] transition-colors">
              About
            </button>
            <button onClick={() => scrollToSection('mission')} className="text-gray-700 hover:text-[#1a4d5d] transition-colors">
              Our Mission
            </button>
            <button onClick={() => scrollToSection('programs')} className="text-gray-700 hover:text-[#1a4d5d] transition-colors">
              Programs
            </button>
            <button onClick={() => scrollToSection('contact')} className="text-gray-700 hover:text-[#1a4d5d] transition-colors">
              Contact
            </button>
            <button 
              onClick={() => scrollToSection('donate')}
              className="bg-[#8b3a3a] text-white px-6 py-2 rounded-full hover:bg-[#6d2d2d] transition-colors"
            >
              Donate
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-700"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col gap-4">
              <button onClick={() => scrollToSection('home')} className="text-gray-700 hover:text-[#1a4d5d] transition-colors text-left">
                Home
              </button>
              <button onClick={() => scrollToSection('about')} className="text-gray-700 hover:text-[#1a4d5d] transition-colors text-left">
                About
              </button>
              <button onClick={() => scrollToSection('mission')} className="text-gray-700 hover:text-[#1a4d5d] transition-colors text-left">
                Our Mission
              </button>
              <button onClick={() => scrollToSection('programs')} className="text-gray-700 hover:text-[#1a4d5d] transition-colors text-left">
                Programs
              </button>
              <button onClick={() => scrollToSection('contact')} className="text-gray-700 hover:text-[#1a4d5d] transition-colors text-left">
                Contact
              </button>
              <button 
                onClick={() => scrollToSection('donate')}
                className="bg-[#8b3a3a] text-white px-6 py-2 rounded-full hover:bg-[#6d2d2d] transition-colors text-center"
              >
                Donate
              </button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
