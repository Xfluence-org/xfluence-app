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
      title: "AI-Powered Influencer Discovery",
      emoji: "🔍",
      description: "Find the perfect influencers across all platforms with advanced AI matching algorithms."
    },
    {
      icon: Target,
      title: "Viral Content Analysis",
      emoji: "🎯",
      description: "Analyze content performance and get AI-powered recommendations for viral growth."
    },
    {
      icon: Bot,
      title: "Automated Campaign Management",
      emoji: "🤖",
      description: "Streamline your entire campaign workflow with intelligent automation tools."
    },
    {
      icon: BarChart3,
      title: "Real-time Performance Tracking",
      emoji: "📊",
      description: "Monitor campaign performance with comprehensive analytics and real-time insights."
    },
    {
      icon: Lightbulb,
      title: "Smart Budget Optimization",
      emoji: "💡",
      description: "Optimize your marketing spend with AI-driven budget allocation strategies."
    },
    {
      icon: MessageCircle,
      title: "Agentic Chatbot Assistant",
      emoji: "💬",
      description: "Get instant answers and strategic guidance from your AI marketing assistant."
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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