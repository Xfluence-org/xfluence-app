import React from 'react';

const ValueProps = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-bold text-4xl md:text-5xl text-black mb-4">
            Why Choose Xfluence?
          </h2>
          <p className="text-xl text-gray-600">
            Quantifiable results that transform your marketing
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="mb-6">
              <span className="inline-block bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium uppercase tracking-wide">
                VIRALITY & ENGAGEMENT
              </span>
            </div>
            <h3 className="font-bold text-2xl text-black mb-4">
              Virality & Engagement
            </h3>
            <p className="text-gray-600 leading-relaxed">
              AI analyzes videos/audio for tweaks, breaks down niches/tasks—boost engagement 40%
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="mb-6">
              <span className="inline-block bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium uppercase tracking-wide">
                CAMPAIGN & CONTENT STRATEGY OPTIMIZATION
              </span>
            </div>
            <h3 className="font-bold text-2xl text-black mb-4">
              Campaign & Content Strategy Optimization
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Build campaigns, AI chatbot for queries, real-time alerts—cut planning time 60%
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="mb-6">
              <span className="inline-block bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium uppercase tracking-wide">
                FIND AND MANAGE INFLUENCERS
              </span>
            </div>
            <h3 className="font-bold text-2xl text-black mb-4">
              Find and Manage Influencers
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Find nano, micro and macro influencers, optimize in real-time—improve ROI 30%
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ValueProps;