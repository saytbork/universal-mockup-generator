import React, { useEffect } from 'react';
import LandingPage from './LandingPage';
import { applySeo } from './src/lib/seo';

export default function PricingPage() {
  useEffect(() => {
    applySeo({
      title: 'Pricing | Perfect Mockup',
      description: 'Plans and credits for generating premium ecommerce product visuals, lifestyle scenes, and UGC-style ads.',
      canonical: 'https://perfectmockup.com/pricing',
    });
    const el = document.getElementById('pricing');
    if (el) {
      el.scrollIntoView({ block: 'start' });
    } else {
      window.location.hash = '#pricing';
    }
  }, []);

  return <LandingPage disableSeo />;
}

