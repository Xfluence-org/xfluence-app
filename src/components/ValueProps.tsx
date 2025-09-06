import React, { useEffect, useState } from 'react';
import { Card, CardContent } from './ui/card';
import { TrendingUp, Users, Zap, Target } from 'lucide-react';

const ValueProps = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById('value-props-section');
    if (element) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, []);

  const valueProps = [
    {
      icon: TrendingUp,
      title: "10x Faster Growth",
      description: "Accelerate your influence marketing campaigns with AI-powered automation and optimization"
    },
    {
      icon: Users,
      title: "Perfect Matches",
      description: "Find and connect with influencers who align perfectly with your brand and audience"
    },
    {
      icon: Zap,
      title: "Real-time Insights",
      description: "Get instant analytics and performance metrics to optimize your campaigns on the fly"
    },
    {
      icon: Target,
      title: "Higher ROI",
      description: "Maximize your marketing spend with data-driven decisions and predictive analytics"
    }
  ];

  return (
    <section id="value-props-section" className="py-20 sm:py-32 px-4 sm:px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className={`text-center mb-16 transition-all duration-800 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="font-inter font-bold text-3xl sm:text-4xl md:text-5xl text-gray-900 mb-4">
            Why Choose XFLUENCE?
          </h2>
          <p className="font-inter text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            Transform your marketing strategy with the power of AI and data-driven insights
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {valueProps.map((prop, index) => (
            <Card 
              key={index} 
              className={`group hover:shadow-xl transition-all duration-300 hover:scale-105 border-0 bg-gradient-to-br from-white to-gray-50 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ animationDelay: `${0.1 + index * 0.1}s` }}
            >
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <prop.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-inter font-bold text-xl text-gray-900 mb-3">
                  {prop.title}
                </h3>
                <p className="font-inter text-gray-600 leading-relaxed">
                  {prop.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ValueProps;