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
      <div className="max-w-7xl mx-auto">
        <div className={`text-center mb-16 transition-all duration-800 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="font-inter font-bold text-3xl sm:text-4xl md:text-5xl text-gray-900 mb-4">
            Why Choose XFLUENCE?
          </h2>
          <p className="font-inter text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Simply share your goals and brand vision → Get exact edits to maximize reach!
          </p>
        </div>

        <div className="space-y-12">
          {benefits.map((benefit, index) => (
            <div 
              key={index}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-8 items-center transition-all duration-800 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              } ${index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''}`}
              style={{transitionDelay: `${index * 0.2}s`}}
            >
              {/* Screenshot */}
              <div className={`${index % 2 === 1 ? 'lg:col-start-2' : ''}`}>
                <div className="bg-white rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300">
                  <img 
                    src={benefit.screenshot} 
                    alt={benefit.title}
                    className="w-full h-auto rounded-lg"
                  />
                </div>
              </div>
              
              {/* Content */}
              <div className={`${index % 2 === 1 ? 'lg:col-start-1' : ''}`}>
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg mb-6">
                    <benefit.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-inter font-bold text-2xl text-gray-900 mb-4">
                    {benefit.title}
                  </h3>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ValueProps;