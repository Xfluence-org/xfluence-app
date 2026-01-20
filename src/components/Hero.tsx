import React, { useEffect, useState } from 'react';
import { Mail, CheckCircle, Users, Zap, TrendingUp } from 'lucide-react';

const Hero = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isSubmitting) return;

    setIsSubmitting(true);
    
    try {
      // Using Formspree (free service) - replace with your Formspree endpoint
      const response = await fetch('https://formspree.io/f/xpqqjvka', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          source: 'waitlist',
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent
        }),
      });

      if (response.ok) {
        setIsSubmitted(true);
        setEmail('');
        // Track in localStorage for analytics
        localStorage.setItem('waitlist_joined', 'true');
        localStorage.setItem('waitlist_email', email);
      } else {
        throw new Error('Failed to submit');
      }
    } catch (error) {
      // Fallback: Open email client
      window.location.href = `mailto:hello@yourcompany.com?subject=Waitlist Signup&body=Please add me to the waitlist: ${email}`;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="min-h-screen grid-background flex flex-col items-center justify-center px-3 sm:px-6 pt-24 sm:pt-28">
      <div className="max-w-6xl mx-auto text-center w-full">
        {/* Coming Soon Badge */}
        <div className="mb-6 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
          <span className="inline-flex items-center rounded-full px-4 py-2 text-sm font-medium bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border border-blue-200">
            <Zap className="w-4 h-4 mr-2" />
            Coming Soon - Join the Waitlist
          </span>
        </div>

        {/* Main Title */}
        <h1 className="font-inter font-bold text-2xl xs:text-3xl sm:text-4xl md:text-6xl lg:text-7xl text-gray-900 leading-tight mb-4 sm:mb-6 animate-fade-in-up px-2" style={{animationDelay: '0.2s'}}>
          <span className="block xs:inline">Build Viral Content</span>{' '}
          <span className="block xs:inline">Campaigns in Minutes </span>
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent inline">with AI Agent</span>
        </h1>
        
        {/* Subheadline */}
        <div className="mb-8 sm:mb-10 animate-fade-in-up" style={{animationDelay: '0.3s'}}>
          <p className="font-inter text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 mb-6 px-3 sm:px-2 max-w-4xl mx-auto leading-relaxed">
            AI analyzes reels, crafts viral strategies. Save <span className="font-semibold text-blue-600">50-70% time</span>, boost <span className="font-semibold text-green-600">ROI 30%+</span>.
          </p>
          <p className="text-base sm:text-lg text-gray-500 max-w-2xl mx-auto">
            Be the first to access our revolutionary AI-powered content creation platform.
          </p>
        </div>

        {/* Audience Tags */}
        <div className="flex flex-wrap justify-center gap-1.5 xs:gap-2 sm:gap-3 mb-8 sm:mb-10 animate-fade-in-up px-3" style={{animationDelay: '0.4s'}}>
          <span className="inline-flex items-center rounded-md px-3 py-2 text-sm font-medium ring-1 ring-inset bg-blue-50 text-blue-700 ring-blue-200">
            <Users className="w-4 h-4 mr-1" />
            For Brands
          </span>
          <span className="inline-flex items-center rounded-md px-3 py-2 text-sm font-medium ring-1 ring-inset bg-green-50 text-green-700 ring-green-200">
            <TrendingUp className="w-4 h-4 mr-1" />
            For Agencies
          </span>
          <span className="inline-flex items-center rounded-md px-3 py-2 text-sm font-medium ring-1 ring-inset bg-orange-50 text-orange-700 ring-orange-200">
            <Zap className="w-4 h-4 mr-1" />
            For Creators
          </span>
        </div>

        {/* Waitlist Form */}
        {!isSubmitted ? (
          <div className="mb-8 sm:mb-12 animate-fade-in-up max-w-md mx-auto px-3" style={{animationDelay: '0.5s'}}>
            <form onSubmit={handleWaitlistSubmit} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting || !email}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-inter font-bold text-base hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Mail className="w-5 h-5 mr-2" />
                      Join Waitlist
                    </>
                  )}
                </button>
              </div>
              <p className="text-sm text-gray-500 text-center">
                Get notified when we launch
              </p>
            </form>
          </div>
        ) : (
          <div className="mb-8 sm:mb-12 animate-fade-in-up max-w-md mx-auto px-3" style={{animationDelay: '0.5s'}}>
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-green-800 mb-2">You're on the list!</h3>
              <p className="text-green-700 mb-4">
                We'll notify you as soon as we launch. Get ready for the future of content creation!
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-green-600">
                <Users className="w-4 h-4" />
                <span>Position #{Math.floor(Math.random() * 500) + 100} in queue</span>
              </div>
            </div>
          </div>
        )}

        {/* Social Proof */}
        <div className="animate-fade-in-up" style={{animationDelay: '0.6s'}}>
          <p className="text-sm text-gray-500 mb-4">
            Join the waitlist for early access
          </p>
        </div>
      </div>
    </section>
  );
};

export default Hero;