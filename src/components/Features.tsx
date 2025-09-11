import React, { useEffect, useState } from 'react';
import { Search, Target, Bot, BarChart3, Lightbulb, MessageCircle } from 'lucide-react';

const Features = () => {
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

    const element = document.getElementById('features-section');
    if (element) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, []);

  const features = [
    {
      icon: Search,
      title: "Analyzes reels for viral campaigns",
      emoji: "🔍",
      description: "AI decodes what makes content viral and applies insights to your campaigns."
    },
    {
      icon: Target,
      title: "Optimizes with real-time alerts",
      emoji: "🎯",
      description: "Smart optimization that adapts and alerts you to maximize performance."
    },
    {
      icon: Bot,
      title: "Generates trend-based strategies",
      emoji: "🤖",
      description: "Creates viral strategies based on current trends and niche insights."
    },
    {
      icon: BarChart3,
      title: "Automates approvals & tracking",
      emoji: "📊",
      description: "Streamlines the entire workflow from approval to performance tracking."
    }
  ];

  return (
    <section id="features-section" className="py-20 sm:py-32 px-4 sm:px-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className={`text-center mb-16 transition-all duration-800 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="font-inter font-bold text-3xl sm:text-4xl md:text-5xl text-gray-900 mb-4">
            Powerful Features
          </h2>
          <p className="font-inter text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to scale your influence marketing with AI
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className={`bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-500 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{transitionDelay: `${index * 0.1}s`}}
            >
              <div className="flex items-center mb-4">
                <span className="text-2xl mr-3">{feature.emoji}</span>
                <feature.icon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-inter font-bold text-lg text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="font-inter text-gray-600 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;