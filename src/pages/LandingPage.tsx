import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, TrendingUp, Zap, Star, CheckCircle } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="px-6 py-4 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-[#1DDCD3] to-[#9d4edd] rounded-lg"></div>
          <h1 className="text-xl font-bold text-gray-900">Xfluence</h1>
        </div>
        <Button 
          onClick={handleGetStarted}
          variant="outline"
          className="border-gray-300 hover:bg-gray-50"
        >
          Sign In
        </Button>
      </header>

      {/* Hero Section */}
      <section className="px-6 py-20 max-w-7xl mx-auto">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
              Connect Brands with
              <span className="bg-gradient-to-r from-[#1DDCD3] to-[#9d4edd] bg-clip-text text-transparent"> Influencers</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              The ultimate platform for brands, agencies, and influencers to collaborate, 
              create campaigns, and drive meaningful engagement.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              onClick={handleGetStarted}
              size="lg"
              className="bg-gradient-to-r from-[#1DDCD3] to-[#9d4edd] hover:from-[#00D4C7] hover:to-[#a855f7] text-white px-8 py-6 text-lg rounded-full"
            >
              Get Started <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="px-8 py-6 text-lg rounded-full border-gray-300 hover:bg-gray-50"
            >
              Learn More
            </Button>
          </div>
        </div>

        {/* Hero Image/Visual */}
        <div className="mt-16 relative">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto flex items-center justify-center">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900">For Brands</h3>
                <p className="text-gray-600 text-sm">Find the perfect influencers for your campaigns</p>
              </div>
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto flex items-center justify-center">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900">For Agencies</h3>
                <p className="text-gray-600 text-sm">Manage multiple campaigns and clients efficiently</p>
              </div>
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-gradient-to-r from-[#1DDCD3] to-blue-500 rounded-full mx-auto flex items-center justify-center">
                  <Star className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900">For Influencers</h3>
                <p className="text-gray-600 text-sm">Discover opportunities and grow your brand</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-20 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold text-gray-900">Why Choose Xfluence?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to run successful influencer marketing campaigns
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-gradient-to-r from-[#1DDCD3] to-blue-500 rounded-lg flex items-center justify-center">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">AI-Powered Matching</h3>
              <p className="text-gray-600">
                Our advanced AI helps brands find the perfect influencers based on audience, engagement, and brand alignment.
              </p>
            </div>

            <div className="space-y-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Campaign Analytics</h3>
              <p className="text-gray-600">
                Track performance, measure ROI, and optimize your campaigns with detailed analytics and insights.
              </p>
            </div>

            <div className="space-y-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Streamlined Workflow</h3>
              <p className="text-gray-600">
                Manage everything from discovery to payment in one platform. Simplify your influencer marketing process.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 bg-gradient-to-r from-[#1DDCD3] to-[#9d4edd]">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl font-bold text-white">
            Ready to Transform Your Influencer Marketing?
          </h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Join thousands of brands, agencies, and influencers who trust Xfluence 
            to power their marketing campaigns.
          </p>
          <Button 
            onClick={handleGetStarted}
            size="lg"
            className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-6 text-lg rounded-full"
          >
            Start Your Journey <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-6 h-6 bg-gradient-to-r from-[#1DDCD3] to-[#9d4edd] rounded"></div>
            <span className="font-semibold">Xfluence</span>
          </div>
          <p className="text-gray-400">
            © 2024 Xfluence. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;