import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CTA = () => {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/auth?mode=signup');
  };

  return (
    <section className="py-20 bg-gradient-to-br from-blue-600 to-purple-700 text-white">
      <div className="max-w-4xl mx-auto text-center px-6">
        <h2 className="font-bold text-4xl md:text-5xl mb-6">
          Ready to Supercharge Your Marketing?
        </h2>
        
        <p className="text-xl mb-12 opacity-90">
          Join the AI marketing revolution and start seeing results in days, not months
        </p>
        
        <div className="bg-white rounded-3xl p-8 max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-6 py-4 rounded-2xl border border-gray-200 text-gray-900 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <button
              type="submit"
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:scale-105 transition-all duration-300 shadow-lg whitespace-nowrap"
            >
              Start Free
            </button>
          </form>
          <p className="text-gray-500 mt-4 text-sm">
            No credit card required
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTA;