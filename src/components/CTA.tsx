import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CTA = () => {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    const element = document.getElementById('cta-section');
    if (element) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section id="cta-section" className="py-20 sm:py-32 px-4 sm:px-6 bg-gradient-to-br from-blue-50 to-purple-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-200 rounded-full animate-float"></div>
        <div className="absolute bottom-20 right-10 w-24 h-24 bg-purple-200 rounded-full animate-float-delayed"></div>
        <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-cyan-200 rounded-full animate-float-delayed-2"></div>
      </div>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <div className={`transition-all duration-800 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="font-inter font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-gray-900 mb-6 sm:mb-8 px-4">
            Launch Viral Campaigns Today
          </h2>
          
          <p className="font-inter text-base sm:text-lg md:text-xl text-gray-600 mb-8 sm:mb-12 px-4 max-w-2xl mx-auto leading-relaxed">
            Join thousands of brands and creators who are already using AI to scale their influence and drive real results.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4">
            <button 
              onClick={() => navigate('/auth?mode=signup')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-inter font-bold text-sm sm:text-base md:text-lg hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl w-full sm:w-auto max-w-sm sm:max-w-none"
            >
              Sign Up Free
            </button>
            
            <button 
              onClick={() => navigate('/auth')}
              className="border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:text-gray-900 px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-inter font-semibold text-sm sm:text-base md:text-lg transition-all duration-300 w-full sm:w-auto max-w-sm sm:max-w-none"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;