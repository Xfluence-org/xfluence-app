import React, { useEffect, useState } from 'react';
import { Mail, ExternalLink } from 'lucide-react';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToWaitlist = () => {
    const heroSection = document.querySelector('section');
    if (heroSection) {
      heroSection.scrollIntoView({ behavior: 'smooth' });
      // Focus on email input after scroll
      setTimeout(() => {
        const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement;
        if (emailInput) emailInput.focus();
      }, 500);
    }
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm' 
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        <div className="font-inter font-bold text-lg sm:text-xl text-gray-900">
          XFLUENCE
          <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
            Coming Soon
          </span>
        </div>
        
        <div className="flex items-center space-x-3 sm:space-x-4">
          <a 
            href="mailto:hello@xfluence.com?subject=Partnership Inquiry"
            className="text-gray-600 hover:text-gray-900 px-2 sm:px-3 py-2 font-inter font-medium transition-colors text-sm sm:text-base hidden sm:flex items-center"
          >
            <ExternalLink className="w-4 h-4 mr-1" />
            Contact
          </a>
          <button 
            onClick={scrollToWaitlist}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 sm:px-6 py-2 rounded-lg font-inter font-medium transition-all duration-300 hover:scale-105 text-sm sm:text-base flex items-center"
          >
            <Mail className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="hidden xs:inline">Join Waitlist</span>
            <span className="xs:hidden">Join</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;