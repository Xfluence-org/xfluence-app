import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CTA = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');
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

  const handleStartFree = () => {
    if (email) {
      navigate(`/auth?mode=signup&email=${encodeURIComponent(email)}`);
    } else {
      navigate('/auth?mode=signup');
    }
  };

  return (
    <section id="cta-section" className="relative py-20 sm:py-32 px-4 sm:px-6 bg-gradient-to-br from-blue-600 to-purple-600 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full animate-float"></div>
        <div className="absolute bottom-20 right-10 w-16 h-16 bg-white/10 rounded-full animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/4 w-12 h-12 bg-white/10 rounded-full animate-float" style={{animationDelay: '4s'}}></div>
      </div>
      
      <div className="relative max-w-4xl mx-auto text-center">
        <div className={`transition-all duration-800 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="font-inter font-bold text-3xl sm:text-4xl md:text-5xl text-white mb-6">
            Ready to Supercharge Your Marketing?
          </h2>
          <p className="font-inter text-lg sm:text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Join the AI marketing revolution and start seeing results in days, not months
          </p>
          
          <div className="bg-white rounded-2xl p-8 max-w-md mx-auto shadow-2xl">
            <div className="flex flex-col space-y-4">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg font-inter text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button 
                onClick={handleStartFree}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-inter font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                Start Free
              </button>
              <p className="text-gray-500 text-sm">
                No credit card required
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;