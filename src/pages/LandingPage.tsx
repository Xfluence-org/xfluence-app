import React from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import ValueProps from '../components/ValueProps';
import CTA from '../components/CTA';
import Footer from '../components/Footer';
import SmoothScroll from '../components/SmoothScroll';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <SmoothScroll sectionId="hero-section">
        <Hero />
      </SmoothScroll>
      <SmoothScroll sectionId="value-props-scroll" delay={100}>
        <ValueProps />
      </SmoothScroll>
      <SmoothScroll sectionId="cta-scroll" delay={100}>
        <CTA />
      </SmoothScroll>
      <Footer />
    </div>
  );
};

export default LandingPage;