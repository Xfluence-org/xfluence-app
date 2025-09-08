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
      title: "Virality & Engagement",
      description: "AI analyzes videos/audio for tweaks, breaks down niches/tasks—boost engagement 40%",
      badge: "VIRALITY & ENGAGEMENT",
      badgeColor: "bg-blue-100 text-blue-700 border-blue-200"
    },
    {
      icon: DollarSign,
      title: "Campaign & Content Strategy Optimization",
      description: "Build campaigns, AI chatbot for queries, real-time alerts—cut planning time 60%",
      badge: "CAMPAIGN & CONTENT STRATEGY OPTIMIZATION",
      badgeColor: "bg-purple-100 text-purple-700 border-purple-200"
    },
    {
      icon: TrendingUp,
      title: "Find and Manage Influencers",
      description: "Find nano, micro and macro influencers, optimize in real-time—improve ROI 30%",
      badge: "FIND AND MANAGE INFLUENCERS",
      badgeColor: "bg-green-100 text-green-700 border-green-200"
    }
  ];

  return (
    <section id="value-props-section" className="py-20 sm:py-32 px-4 sm:px-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className={`text-center mb-16 transition-all duration-800 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="font-inter font-bold text-3xl sm:text-4xl md:text-5xl text-gray-900 mb-4">
            Why Choose Xfluence?
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
              <div className={`inline-flex items-center rounded-md px-3 py-1 text-xs font-medium mb-6 ${benefit.badgeColor}`}>
                {benefit.badge}
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