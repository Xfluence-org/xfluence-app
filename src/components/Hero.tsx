import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
    <section className="min-h-screen grid-background flex flex-col items-center justify-center px-3 sm:px-6 pt-24 sm:pt-28">
      <div className="max-w-6xl mx-auto text-center w-full">
        {/* Main Title */}
        <h1 className="font-inter font-bold text-2xl xs:text-3xl sm:text-4xl md:text-6xl lg:text-7xl text-gray-900 leading-tight mb-4 sm:mb-6 animate-fade-in-up px-2" style={{animationDelay: '0.1s'}}>
          <span className="block xs:inline">Build Viral Content</span>{' '}
          <span className="block xs:inline">Campaigns in Minutes </span>
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent inline">with AI Agent</span>
        </h1>
        
        {/* Subheadline */}
        <div className="mb-6 sm:mb-8 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
          <p className="font-inter text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 mb-4 sm:mb-6 px-3 sm:px-2 max-w-4xl mx-auto leading-relaxed">
            AI analyzes reels, crafts viral strategies. Save <span className="font-semibold text-blue-600">50-70% time</span>, boost <span className="font-semibold text-green-600">ROI 30%+</span>.
          </p>
        </div>

        {/* Audience Tags */}
        <div className="flex flex-wrap justify-center gap-1.5 xs:gap-2 sm:gap-3 mb-6 sm:mb-8 animate-fade-in-up px-3" style={{animationDelay: '0.3s'}}>
          <span className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset bg-blue-50 text-blue-700 ring-blue-200">
            For Brands
          </span>
          <span className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset bg-green-50 text-green-700 ring-green-200">
            For Agencies
          </span>
          <span className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset bg-orange-50 text-orange-700 ring-orange-200">
            For Creators
          </span>
        </div>

        {/* Primary CTA */}
        <div className="mb-8 sm:mb-12 animate-fade-in-up px-3" style={{animationDelay: '0.4s'}}>
          <button 
            onClick={() => navigate('/auth?mode=signup')}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 xs:px-6 sm:px-8 py-3 xs:py-4 rounded-xl xs:rounded-2xl font-inter font-bold text-sm xs:text-base sm:text-lg hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl w-full xs:w-auto max-w-sm xs:max-w-none mx-auto block xs:inline-block"
          >
            <span className="block xs:hidden">Start for Free</span>
            <span className="hidden xs:block">Start for Free - No Credit Card Required</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;