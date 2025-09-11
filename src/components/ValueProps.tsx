import React, { useEffect, useState } from 'react';
import { Zap, DollarSign, TrendingUp } from 'lucide-react';

const ValueProps = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    const element = document.getElementById('value-props-section');
    if (element) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, []);

  const benefits = [
    {
      icon: Zap,
      title: "AI Video Content Analysis",
      screenshot: "/lovable-uploads/c14bfb63-379b-4cac-8cac-269a8a1b3850.png"
    },
    {
      icon: DollarSign,
      title: "AI Marketing Assistant",
      screenshot: "/lovable-uploads/0cddfdaa-33de-428e-a4df-9b253a76aa6b.png"
    },
    {
      icon: TrendingUp,
      title: "Content Strategy Intelligence",
      screenshot: "/lovable-uploads/c14bfb63-379b-4cac-8cac-269a8a1b3850.png"
    }
  ];

  return (
    <section id="value-props-section" className="py-20 sm:py-32 px-4 sm:px-6 bg-gray-50">
      <div className="max-w-4xl mx-auto text-center">
        <div className={`transition-all duration-800 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="font-inter font-bold text-3xl sm:text-4xl md:text-5xl text-gray-900 mb-6">
            Why Choose XFLUENCE?
          </h2>
          <p className="font-inter text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Simply share your goals and brand vision → Get exact edits to maximize reach!
          </p>
          
          <div className="bg-white rounded-2xl p-8 sm:p-12 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl mb-6 mx-auto">
              <Zap className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="font-inter font-bold text-2xl sm:text-3xl text-gray-900 mb-4">
              AI-Powered Content Intelligence
            </h3>
            <p className="font-inter text-lg text-gray-600 mb-8">
              Discover advanced video analysis, marketing assistance, and content strategy tools designed to maximize your reach and engagement.
            </p>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
              <p className="font-inter font-semibold text-blue-800 text-lg">
                🚀 Much more to explore when you sign up!
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ValueProps;