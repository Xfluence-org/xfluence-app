import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="mb-8">
          <a 
            href="mailto:xfluence@xfluence.org" 
            className="text-gray-300 hover:text-white text-lg transition-colors"
          >
            xfluence@xfluence.org
          </a>
        </div>
        
        <div className="mb-8">
          <p className="text-gray-400 text-lg">
            Your Strategy. Amplified by AI.
          </p>
        </div>
        
        <div className="text-gray-500 text-sm">
          © 2026 Xfluence. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;