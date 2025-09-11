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
      title: "Viral Analysis",
      description: "Decodes reels for viral strategies in minutes."
    },
    {
      icon: DollarSign,
      title: "Smart Optimization",
      description: "Automates approvals, boosts ROI 30%+."
    },
    {
      icon: TrendingUp,
      title: "Trend Insights",
      description: "Unlocks niche trends for your brand."
    }
  ];

  return (
    <section id="value-props-section" className="py-20 sm:py-32 px-4 sm:px-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className={`text-center mb-16 transition-all duration-800 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="font-inter font-bold text-3xl sm:text-4xl md:text-5xl text-gray-900 mb-4">
            Why Choose XFLUENCE?
          </h2>
          <p className="font-inter text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Quantifiable results that transform your marketing
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div 
              key={index}
              className={`bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-500 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{transitionDelay: `${index * 0.1}s`}}
            >
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg mb-6">
                <benefit.icon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-inter font-bold text-xl text-gray-900 mb-4">
                {benefit.title}
              </h3>
              <p className="font-inter text-gray-600 leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ValueProps;