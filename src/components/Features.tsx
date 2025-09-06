import React, { useEffect, useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Bot, Search, BarChart3, MessageSquare, Shield, Smartphone } from 'lucide-react';

const Features = () => {
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

    const element = document.getElementById('features-section');
    if (element) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, []);

  const features = [
    {
      icon: Bot,
      title: "AI Marketing Agent",
      description: "Your personal AI assistant that handles campaign strategy, content optimization, and performance tracking automatically"
    },
    {
      icon: Search,
      title: "Smart Influencer Discovery",
      description: "Find the perfect influencers for your brand using advanced AI matching algorithms and audience analysis"
    },
    {
      icon: BarChart3,
      title: "Real-time Analytics",
      description: "Track campaign performance with comprehensive analytics and insights to optimize your marketing ROI"
    },
    {
      icon: MessageSquare,
      title: "Automated Communication",
      description: "Streamline influencer outreach and management with automated messaging and relationship building tools"
    },
    {
      icon: Shield,
      title: "Brand Safety",
      description: "Ensure your brand reputation with AI-powered content moderation and influencer vetting systems"
    },
    {
      icon: Smartphone,
      title: "Mobile-First Platform",
      description: "Manage your campaigns on the go with our fully responsive mobile platform and native app experience"
    }
  ];

  return (
    <section id="features-section" className="py-20 sm:py-32 px-4 sm:px-6 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto">
        <div className={`text-center mb-16 transition-all duration-800 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="font-inter font-bold text-3xl sm:text-4xl md:text-5xl text-gray-900 mb-4">
            Powerful Features
          </h2>
          <p className="font-inter text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to scale your influence marketing campaigns and drive real business results
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className={`group hover:shadow-xl transition-all duration-300 hover:scale-105 border-0 bg-white ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ animationDelay: `${0.1 + index * 0.1}s` }}
            >
              <CardContent className="p-6">
                <div className="w-12 h-12 mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-inter font-bold text-xl text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="font-inter text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;