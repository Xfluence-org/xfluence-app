import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from './ui/badge';

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="min-h-screen bg-white flex flex-col items-center justify-center px-6 pt-20">
      <div className="max-w-6xl mx-auto text-center w-full">
        {/* Main Title */}
        <h1 className="font-bold text-4xl md:text-6xl text-black leading-tight mb-6 max-w-4xl mx-auto">
          Unlock Viral Growth<br />
          with Your<br />
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">AI Marketing Agent</span>
        </h1>
        
        {/* Subheadline */}
        <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-5xl mx-auto leading-relaxed">
          Finds Influencers. Analyzes Reels for Viral Tweaks. Creates & Optimizes Campaigns — with an agentic chatbot—save <span className="font-semibold text-blue-600">70% time, 50% cost</span> and boost <span className="font-semibold text-green-600">ROI by 30%+</span>.
        </p>

        {/* Audience Tags */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <Badge className="bg-blue-50 text-blue-700 border-blue-200 px-4 py-2 text-sm font-medium rounded-full">
            For Brands
          </Badge>
          <Badge className="bg-purple-50 text-purple-700 border-purple-200 px-4 py-2 text-sm font-medium rounded-full">
            For Startups
          </Badge>
          <Badge className="bg-green-50 text-green-700 border-green-200 px-4 py-2 text-sm font-medium rounded-full">
            For Agencies
          </Badge>
          <Badge className="bg-orange-50 text-orange-700 border-orange-200 px-4 py-2 text-sm font-medium rounded-full">
            For Creators
          </Badge>
        </div>

        {/* Primary CTA */}
        <div className="mb-16">
          <button 
            onClick={() => navigate('/auth?mode=signup')}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:scale-105 transition-all duration-300 shadow-xl"
          >
            Start Free Trial
          </button>
        </div>

        {/* Hero Images */}
        <div className="flex justify-center items-center gap-8 max-w-4xl mx-auto">
          <div className="w-80 h-96 rounded-3xl overflow-hidden shadow-2xl">
            <img 
              src="/lovable-uploads/1b6b9dee-e5bf-4834-81d6-9ff6cf1ed994.png"
              alt="Content creators" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="w-80 h-96 rounded-3xl overflow-hidden shadow-2xl">
            <img 
              src="/lovable-uploads/e921a15f-22ba-42d3-840a-9568f01d4eb6.png"
              alt="Content creator" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;