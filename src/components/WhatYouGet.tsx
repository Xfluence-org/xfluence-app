import React, { useEffect, useState } from 'react';
import { Settings, Users, Zap, TrendingUp, Play, MessageCircle } from 'lucide-react';

const WhatYouGet = () => {
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

    const element = document.getElementById('what-you-get-section');
    if (element) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, []);

  const features = [
    {
      icon: Settings,
      title: "AI-driven strategy & niche analysis",
      iconColor: "text-blue-500"
    },
    {
      icon: TrendingUp,
      title: "Real-time campaign optimization & alerts",
      iconColor: "text-blue-500"
    },
    {
      icon: Users,
      title: "Influencer discovery across platforms",
      iconColor: "text-blue-500"
    },
    {
      icon: Play,
      title: "Video/audio analysis for viral tweaks",
      iconColor: "text-blue-500"
    },
    {
      icon: Zap,
      title: "Full AI orchestration & automation",
      iconColor: "text-blue-500"
    },
    {
      icon: MessageCircle,
      title: "Chatbot for instant marketing answers",
      iconColor: "text-blue-500"
    }
  ];

  return (
    <section id="what-you-get-section" className="py-20 sm:py-32 px-4 sm:px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className={`text-center mb-16 transition-all duration-800 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="font-inter font-bold text-3xl sm:text-4xl md:text-5xl text-gray-900 mb-4">
            What You Get
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {features.map((feature, index) => (
            <div 
              key={index}
              className={`flex items-center space-x-4 transition-all duration-500 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{transitionDelay: `${index * 0.1}s`}}
            >
              <div className="flex-shrink-0">
                <feature.icon className={`w-6 h-6 ${feature.iconColor}`} />
              </div>
              <p className="font-inter text-lg text-gray-700">
                {feature.title}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhatYouGet;