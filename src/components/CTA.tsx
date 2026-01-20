import React, { useEffect, useState } from 'react';
import { Mail, CheckCircle, Clock, Star } from 'lucide-react';

const CTA = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    const element = document.getElementById('cta-section');
    if (element) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, []);

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
          source: 'cta_waitlist',
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent
        }),
      });

      if (response.ok) {
        setIsSubmitted(true);
        setEmail('');
      } else {
        throw new Error('Failed to submit');
      }
    } catch (error) {
      // Fallback: Open email client
      window.location.href = `mailto:hello@xfluence.com?subject=Waitlist Signup&body=Please add me to the waitlist: ${email}`;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="cta-section" className="py-20 sm:py-32 px-4 sm:px-6 bg-gradient-to-br from-blue-50 to-purple-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-200 rounded-full animate-float"></div>
        <div className="absolute bottom-20 right-10 w-24 h-24 bg-purple-200 rounded-full animate-float-delayed"></div>
        <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-cyan-200 rounded-full animate-float-delayed-2"></div>
      </div>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <div className={`transition-all duration-800 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="font-inter font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-gray-900 mb-6 sm:mb-8 px-4">
            Don't Miss the Launch
          </h2>
          
          <p className="font-inter text-base sm:text-lg md:text-xl text-gray-600 mb-8 sm:mb-10 px-4 max-w-2xl mx-auto leading-relaxed">
            Be among the first to experience the future of AI-powered content creation. Limited spots available for early access.
          </p>

          {/* Benefits */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10 px-4">
            <div className="flex flex-col items-center">
              <div className="bg-blue-100 p-3 rounded-full mb-3">
                <Star className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Early Access</h3>
              <p className="text-sm text-gray-600">Be among the first to try our platform</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-green-100 p-3 rounded-full mb-3">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Launch Updates</h3>
              <p className="text-sm text-gray-600">Get notified when we go live</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-purple-100 p-3 rounded-full mb-3">
                <Mail className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Exclusive Updates</h3>
              <p className="text-sm text-gray-600">Behind-the-scenes development news</p>
            </div>
          </div>
          
          {/* Waitlist Form */}
          {!isSubmitted ? (
            <div className="max-w-md mx-auto px-4">
              <form onSubmit={handleWaitlistSubmit} className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email for early access"
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
                        Secure My Spot
                      </>
                    )}
                  </button>
                </div>
                <p className="text-sm text-gray-500 text-center">
                  No spam, unsubscribe anytime.
                </p>
              </form>
            </div>
          ) : (
            <div className="max-w-md mx-auto px-4">
              <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-green-800 mb-2">Welcome to the waitlist!</h3>
                <p className="text-green-700">
                  You'll be among the first to know when we launch. Keep an eye on your inbox!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default CTA;