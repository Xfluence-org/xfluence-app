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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-inter font-bold text-4xl sm:text-5xl md:text-6xl text-gray-900 mb-6">
            The Network for<br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Creator Campaigns
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Where brands, agencies, and creators find the right partners for every campaign.
          </p>

          {/* User Type Tabs */}
          <div className="flex justify-center mb-8">
            <div className="flex bg-white/80 backdrop-blur-sm rounded-xl p-1 shadow-lg border border-white/20">
              {['For Brands', 'For Agencies', 'For Creators'].map((type, index) => {
                const typeKey = type.replace('For ', '');
                const colors = [
                  'text-blue-600 bg-blue-50 border-blue-200',
                  'text-emerald-600 bg-emerald-50 border-emerald-200',
                  'text-purple-600 bg-purple-50 border-purple-200'
                ];
                const activeColors = [
                  'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg',
                  'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg',
                  'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg'
                ];
                return (
                  <button
                    key={type}
                    onClick={() => setSelectedType(typeKey)}
                    className={`px-6 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                      selectedType === typeKey
                        ? activeColors[index]
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
          </div>

          {/* User Type Selection */}
          <div className="flex justify-center mb-8">
            <div className="flex bg-white/80 backdrop-blur-sm rounded-xl p-1 shadow-lg border border-white/20">
              {['Brand', 'Agency', 'Creator'].map((type, index) => {
                const gradients = [
                  'from-blue-500 to-blue-600',
                  'from-emerald-500 to-emerald-600',
                  'from-purple-500 to-purple-600'
                ];
                return (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      selectedType === type
                        ? `bg-gradient-to-r ${gradients[index]} text-white shadow-md`
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Waitlist Form */}
          {!isSubmitted ? (
            <div className="max-w-md mx-auto">
              <form onSubmit={handleWaitlistSubmit} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
                <div className="flex gap-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/90 backdrop-blur-sm"
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting || !email}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-xl"
                  >
                    {isSubmitting ? 'Joining...' : 'Join Waitlist'}
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-4 text-center">
                  No credit card required
                </p>
              </form>
            </div>
          ) : (
            <div className="max-w-md mx-auto bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8 shadow-xl">
              <h3 className="text-lg font-semibold text-green-800 mb-2">Welcome to the waitlist!</h3>
              <p className="text-green-700">We'll notify you when Xfluence launches.</p>
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Xfluence Section */}
      <section className="py-20 px-4 sm:px-6 bg-white/60 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-inter font-bold text-3xl sm:text-4xl text-gray-900 mb-4">
              Why Choose <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Xfluence?</span>
            </h2>
            <p className="text-lg text-gray-600">
              A marketplace built for everyone in the creator economy
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* For Brands */}
            <div className="text-center group">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 mb-6 border border-blue-100 hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <span className="inline-block bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-6 shadow-lg">
                  FOR BRANDS
                </span>
                <h3 className="font-semibold text-xl text-gray-900 mb-4">For Brands</h3>
                <p className="text-gray-600">
                  Find verified creators who match your brand voice. Browse portfolios, check engagement rates, and hire directly.
                </p>
              </div>
            </div>

            {/* For Agencies */}
            <div className="text-center group">
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-8 mb-6 border border-emerald-100 hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <span className="inline-block bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-6 shadow-lg">
                  FOR AGENCIES
                </span>
                <h3 className="font-semibold text-xl text-gray-900 mb-4">For Agencies</h3>
                <p className="text-gray-600">
                  Manage multiple campaigns and creators in one place. Scale your influencer partnerships efficiently.
                </p>
              </div>
            </div>

            {/* For Creators */}
            <div className="text-center group">
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-8 mb-6 border border-purple-100 hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <span className="inline-block bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-6 shadow-lg">
                  FOR CREATORS
                </span>
                <h3 className="font-semibold text-xl text-gray-900 mb-4">For Creators</h3>
                <p className="text-gray-600">
                  Get discovered by brands looking for your niche. Set your rates, showcase your work, and grow your business.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What You Get Section */}
      <section className="py-20 px-4 sm:px-6 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-inter font-bold text-3xl sm:text-4xl text-gray-900 mb-4">
              What You <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Get</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              { icon: Search, text: "Discover creators by niche & audience", color: "blue" },
              { icon: Shield, text: "Verified profiles & engagement data", color: "emerald" },
              { icon: Zap, text: "Fast matching in hours, not weeks", color: "purple" },
              { icon: MessageCircle, text: "Direct communication with creators", color: "blue" },
              { icon: CreditCard, text: "Secure payments & contracts", color: "emerald" },
              { icon: Users, text: "Manage all partnerships in one place", color: "purple" }
            ].map((item, index) => {
              const colorClasses = {
                blue: "bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600 border-blue-200",
                emerald: "bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-600 border-emerald-200",
                purple: "bg-gradient-to-br from-purple-100 to-purple-200 text-purple-600 border-purple-200"
              };
              
              return (
                <div key={index} className="flex items-start gap-4 group">
                  <div className={`p-3 rounded-xl border shadow-sm group-hover:shadow-md transition-all duration-300 ${colorClasses[item.color as keyof typeof colorClasses]}`}>
                    <item.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">{item.text}</h3>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Hero;