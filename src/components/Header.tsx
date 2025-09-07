import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/80 backdrop-blur-md border-b border-gray-200' 
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        <div className="font-inter font-bold text-lg sm:text-xl text-gray-900">
          XFLUENCE
        </div>
        
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate('/auth')}
            className="text-gray-600 hover:text-gray-900 px-3 sm:px-4 py-2 font-inter font-medium transition-colors text-sm sm:text-base"
          >
            Sign In
          </button>
          <button 
            onClick={() => navigate('/auth?mode=signup')}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 sm:px-6 py-2 rounded-lg font-inter font-medium transition-all duration-300 hover:scale-105 text-sm sm:text-base"
          >
            Get Started
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;