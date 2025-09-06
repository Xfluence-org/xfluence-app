import React from 'react';
import { Brain, Search, Zap, TrendingUp, MessageCircle, BarChart } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: Brain,
      title: "AI-driven strategy & niche analysis",
      color: "text-blue-600"
    },
    {
      icon: TrendingUp,
      title: "Real-time campaign optimization & alerts",
      color: "text-blue-600"
    },
    {
      icon: Search,
      title: "Influencer discovery across platforms",
      color: "text-blue-600"
    },
    {
      icon: BarChart,
      title: "Video/audio analysis for viral tweaks",
      color: "text-blue-600"
    },
    {
      icon: Zap,
      title: "Full AI orchestration & automation",
      color: "text-blue-600"
    },
    {
      icon: MessageCircle,
      title: "Chatbot for instant marketing answers",
      color: "text-blue-600"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-bold text-4xl md:text-5xl text-black mb-8">
            What You Get
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center space-x-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              <p className="text-lg text-gray-900 font-medium">
                {feature.title}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;