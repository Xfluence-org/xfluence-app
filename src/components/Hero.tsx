import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from './ui/badge';

const Hero = () => {
  const navigate = useNavigate();
  
  // Image arrays for shuffling functionality
  const heroImages = [
    "/lovable-uploads/1b6b9dee-e5bf-4834-81d6-9ff6cf1ed994.png",
    "/lovable-uploads/e921a15f-22ba-42d3-840a-9568f01d4eb6.png",
    "/lovable-uploads/13ad78f3-7e52-42bf-80fc-e2cf8f5585c1.png",
    "/lovable-uploads/c9acc983-77f8-4de0-b798-3e8ef038295d.png",
    "/lovable-uploads/8429852c-3cc1-4b53-ab16-1f8196c4f701.png",
    "/lovable-uploads/74c9bc19-9dbb-45fa-95ec-5c0755a37373.png",
    "/lovable-uploads/84ff2ed5-b518-4c79-83d1-8eda724c6ced.png",
    "/lovable-uploads/952f8b94-5fc0-4c36-be50-bae5f557b637.png",
    "/lovable-uploads/85880b75-32f9-4ec0-8b40-84d1ca1b580f.png",
    "/lovable-uploads/aabe7527-0cf1-4319-bbec-b39064ea1f80.png",
    "/lovable-uploads/4c828b3d-c753-4782-a180-ca4938e68974.png"
  ];

  const [currentImageIndexes, setCurrentImageIndexes] = useState({
    leftStack: 0,
    rightStack: Math.floor(heroImages.length / 2)
  });

  // Shuffle images every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndexes(prev => ({
        leftStack: (prev.leftStack + 1) % heroImages.length,
        rightStack: (prev.rightStack + 1) % heroImages.length
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, [heroImages.length]);

  return (
    <section className="min-h-screen grid-background flex flex-col items-center justify-center px-3 sm:px-6 pt-16 sm:pt-20">
      <div className="max-w-6xl mx-auto text-center w-full">
        {/* Main Title */}
        <h1 className="font-inter font-bold text-2xl xs:text-3xl sm:text-4xl md:text-6xl lg:text-7xl text-gray-900 leading-tight mb-4 sm:mb-6 animate-fade-in-up px-2" style={{animationDelay: '0.1s'}}>
          <span className="block xs:inline">Unlock Viral Growth</span>{' '}
          <span className="block xs:inline">with Your</span><br className="hidden xs:block" />
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent block xs:inline">AI Marketing Agent</span>
        </h1>
        
        {/* Subheadline */}
        <div className="mb-6 sm:mb-8 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
          <p className="font-inter text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 mb-4 sm:mb-6 px-3 sm:px-2 max-w-4xl mx-auto leading-relaxed">
            Finds Influencers. Analyzes Reels for Viral Tweaks. Creates & Optimizes Campaigns — with an agentic chatbot—save <span className="font-semibold text-blue-600">70% time, 50% cost</span> and boost <span className="font-semibold text-green-600">ROI by 30%+</span>.
          </p>
        </div>

        {/* Audience Tags */}
        <div className="flex flex-wrap justify-center gap-1.5 xs:gap-2 sm:gap-3 mb-6 sm:mb-8 animate-fade-in-up px-3" style={{animationDelay: '0.3s'}}>
          <Badge className="bg-blue-50 text-blue-700 border-blue-200 px-2 xs:px-3 py-1.5 xs:py-2 text-xs xs:text-sm font-medium">
            For Brands
          </Badge>
          <Badge className="bg-purple-50 text-purple-700 border-purple-200 px-2 xs:px-3 py-1.5 xs:py-2 text-xs xs:text-sm font-medium">
            For Startups
          </Badge>
          <Badge className="bg-green-50 text-green-700 border-green-200 px-2 xs:px-3 py-1.5 xs:py-2 text-xs xs:text-sm font-medium">
            For Agencies
          </Badge>
          <Badge className="bg-orange-50 text-orange-700 border-orange-200 px-2 xs:px-3 py-1.5 xs:py-2 text-xs xs:text-sm font-medium">
            For Creators
          </Badge>
        </div>

        {/* Primary CTA */}
        <div className="mb-8 sm:mb-12 animate-fade-in-up px-3" style={{animationDelay: '0.4s'}}>
          <button 
            onClick={() => navigate('/auth?mode=signup')}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 xs:px-6 sm:px-8 py-3 xs:py-4 rounded-xl xs:rounded-2xl font-inter font-bold text-sm xs:text-base sm:text-lg hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl w-full xs:w-auto max-w-sm xs:max-w-none mx-auto block xs:inline-block"
          >
            <span className="block xs:hidden">Get Started Free</span>
            <span className="hidden xs:block">Get Started Free - No Credit Card Required</span>
          </button>
        </div>

        {/* Hero Image with two side-by-side stacks - Auto-shuffling - Mobile optimized */}
        <div className="relative flex justify-center items-center gap-2 xs:gap-3 sm:gap-6 md:gap-8 mb-8 sm:mb-16 md:mb-20 animate-scale-in px-2" style={{animationDelay: '0.5s'}}>
          {/* Left Stack */}
          <div className="relative">
            {/* Back card */}
            <div className="absolute w-32 h-40 xs:w-40 xs:h-48 sm:w-56 sm:h-64 md:w-64 md:h-72 lg:w-72 lg:h-80 bg-gradient-to-br from-purple-400 to-pink-400 rounded-xl xs:rounded-2xl shadow-lg transform rotate-3 xs:rotate-6 sm:rotate-12 animate-float-delayed-2 overflow-hidden">
              <img 
                src={heroImages[(currentImageIndexes.leftStack + 2) % heroImages.length]}
                alt="Content creator" 
                className="w-full h-full object-cover transition-all duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-purple-400/20 to-transparent"></div>
            </div>
            
            {/* Front card */}
            <div className="relative w-32 h-40 xs:w-40 xs:h-48 sm:w-56 sm:h-64 md:w-64 md:h-72 lg:w-72 lg:h-80 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-xl xs:rounded-2xl shadow-xl transform -rotate-2 xs:-rotate-3 sm:-rotate-6 animate-float overflow-hidden">
              <img 
                src={heroImages[currentImageIndexes.leftStack]}
                alt="Content creators" 
                className="w-full h-full object-cover transition-all duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-400/20 to-transparent"></div>
            </div>
          </div>

          {/* Right Stack */}
          <div className="relative">
            {/* Back card */}
            <div className="absolute w-32 h-40 xs:w-40 xs:h-48 sm:w-56 sm:h-64 md:w-64 md:h-72 lg:w-72 lg:h-80 bg-gradient-to-br from-green-400 to-teal-400 rounded-xl xs:rounded-2xl shadow-lg transform -rotate-3 xs:-rotate-6 sm:-rotate-12 animate-float-delayed overflow-hidden">
              <img 
                src={heroImages[(currentImageIndexes.rightStack + 2) % heroImages.length]}
                alt="Content creator" 
                className="w-full h-full object-cover transition-all duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-green-400/20 to-transparent"></div>
            </div>
            
            {/* Front card */}
            <div className="relative w-32 h-40 xs:w-40 xs:h-48 sm:w-56 sm:h-64 md:w-64 md:h-72 lg:w-72 lg:h-80 bg-gradient-to-br from-orange-400 to-red-400 rounded-xl xs:rounded-2xl shadow-xl transform rotate-2 xs:rotate-3 sm:rotate-6 animate-float-delayed-2 overflow-hidden">
              <img 
                src={heroImages[currentImageIndexes.rightStack]}
                alt="Content creators" 
                className="w-full h-full object-cover transition-all duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-orange-400/20 to-transparent"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;