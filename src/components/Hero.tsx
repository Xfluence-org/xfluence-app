import React, { useState } from 'react';
import { Search, Zap, CreditCard, Shield, MessageCircle, Users } from 'lucide-react';

const Hero = () => {
  const [email, setEmail] = useState('');
  const [selectedType, setSelectedType] = useState('Brand');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isSubmitting) return;

    setIsSubmitting(true);
    
    try {
      const response = await fetch('https://formspree.io/f/xpqqjvka', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          userType: selectedType,
          source: 'hero_waitlist',
          timestamp: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        setIsSubmitted(true);
        setEmail('');
      } else {
        throw new Error('Failed to submit');
      }
    } catch (error) {
      window.location.href = `mailto:xfluence@xfluence.org?subject=Waitlist Signup - ${selectedType}&body=Please add me to the waitlist: ${email}`;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-inter font-bold text-4xl sm:text-5xl md:text-6xl text-gray-900 mb-6 leading-tight">
            The Network for<br />
            Creator Campaigns
          </h1>
          
          <p className="text-lg sm:text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Where brands, agencies, and creators find the right partners for every campaign.
          </p>

          {/* User Type Tabs */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex bg-white rounded-lg p-1 shadow-sm border border-gray-200">
              {[
                { key: 'Brands', label: 'For Brands', color: 'text-blue-600' },
                { key: 'Agencies', label: 'For Agencies', color: 'text-green-600' },
                { key: 'Creators', label: 'For Creators', color: 'text-orange-600' }
              ].map((type) => (
                <button
                  key={type.key}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${type.color}`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* User Type Selection */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex bg-white rounded-lg p-1 shadow-sm border border-gray-200">
              {['Brand', 'Agency', 'Creator'].map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-6 py-2 text-sm font-medium rounded-md transition-all ${
                    selectedType === type
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Waitlist Form */}
          {!isSubmitted ? (
            <div className="max-w-md mx-auto">
              <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
                <div className="flex gap-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                  <button
                    type="submit"
                    onClick={handleWaitlistSubmit}
                    disabled={isSubmitting || !email}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Joining...' : 'Join Waitlist'}
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-4 text-center">
                  No credit card required
                </p>
              </div>
            </div>
          ) : (
            <div className="max-w-md mx-auto bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-800 mb-2">Welcome to the waitlist!</h3>
              <p className="text-green-700">We'll notify you when Xfluence launches.</p>
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Xfluence Section */}
      <section className="py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-inter font-bold text-3xl sm:text-4xl text-gray-900 mb-4">
              Why Choose Xfluence?
            </h2>
            <p className="text-lg text-gray-600">
              A marketplace built for everyone in the creator economy
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* For Brands */}
            <div className="text-center">
              <div className="bg-gray-50 rounded-lg p-8 h-full">
                <span className="inline-block bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-medium mb-6">
                  BRANDS
                </span>
                <h3 className="font-semibold text-xl text-gray-900 mb-4">For Brands</h3>
                <p className="text-gray-600 leading-relaxed">
                  Find verified creators who match your brand voice. Browse portfolios, check engagement rates, and hire directly.
                </p>
              </div>
            </div>

            {/* For Agencies */}
            <div className="text-center">
              <div className="bg-gray-50 rounded-lg p-8 h-full">
                <span className="inline-block bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-sm font-medium mb-6">
                  AGENCIES
                </span>
                <h3 className="font-semibold text-xl text-gray-900 mb-4">For Agencies</h3>
                <p className="text-gray-600 leading-relaxed">
                  Manage multiple campaigns and creators in one place. Scale your influencer partnerships efficiently.
                </p>
              </div>
            </div>

            {/* For Creators */}
            <div className="text-center">
              <div className="bg-gray-50 rounded-lg p-8 h-full">
                <span className="inline-block bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm font-medium mb-6">
                  CREATORS
                </span>
                <h3 className="font-semibold text-xl text-gray-900 mb-4">For Creators</h3>
                <p className="text-gray-600 leading-relaxed">
                  Get discovered by brands looking for your niche. Set your rates, showcase your work, and grow your business.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What You Get Section */}
      <section className="py-20 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-inter font-bold text-3xl sm:text-4xl text-gray-900 mb-4">
              What You Get
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-x-12 gap-y-8">
            {[
              { icon: Search, text: "Discover creators by niche & audience" },
              { icon: Shield, text: "Verified profiles & engagement data" },
              { icon: Zap, text: "Fast matching in hours, not weeks" },
              { icon: MessageCircle, text: "Direct communication with creators" },
              { icon: CreditCard, text: "Secure payments & contracts" },
              { icon: Users, text: "Manage all partnerships in one place" }
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="bg-blue-100 p-2 rounded-lg flex-shrink-0">
                  <item.icon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{item.text}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Hero;