import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, ShoppingBag, Truck, Users2, Building2, CheckCircle2 } from 'lucide-react';

const sections = [
  {
    title: 'Shopify & DTC Brands',
    bullets: [
      'Create lifestyle photos for product pages',
      'Generate hero images for landing pages',
      'Improve conversion rates with realistic visuals',
    ],
  },
  {
    title: 'Amazon FBA Sellers',
    bullets: [
      'Create packshots for main images',
      'Create lifestyle images for A+ content',
      'Improve page ranking with better visuals',
    ],
  },
  {
    title: 'Social Media Creators',
    bullets: [
      'Generate UGC for Instagram, TikTok, YouTube thumbnails',
      'Create consistent brand-style content',
      'Save time vs creating content manually',
    ],
  },
  {
    title: 'Agencies & Marketing Teams',
    bullets: [
      'Produce UGC campaigns at scale',
      'Rapid A/B testing of creative variations',
      'Unlimited styling possibilities',
    ],
  },
  {
    title: 'Dropshipping Stores',
    bullets: [
      'Create high-quality photos without suppliers',
      'Build trust with realistic visuals',
      'Replace supplier images with branded content',
    ],
  },
];

const UseCases: React.FC = () => {
  return (
    <div className="bg-bg text-gray-900 min-h-screen">
      <div className="relative max-w-5xl mx-auto px-4 py-20 space-y-12">
        <div className="absolute inset-0 blur-3xl opacity-40 pointer-events-none" style={{ background: 'radial-gradient(circle at 20% 20%, var(--accent-glow), transparent 45%)' }} />
        <div className="relative space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-600 bg-indigo-50 px-4 py-1 text-xs uppercase tracking-[0.2em] text-indigo-600">
            <Sparkles className="w-4 h-4" /> Use Cases
          </div>
          <h1 className="text-4xl font-bold">How brands and creators ship high-converting visuals</h1>
          <p className="text-gray-600">BoostUGC adapts to every workflow—Shopify, Amazon, agencies, creators, and dropshippers.</p>
        </div>

        <div className="relative grid gap-6 md:grid-cols-2">
          {sections.map(section => (
            <div key={section.title} className="rounded-2xl border border-gray-200 bg-gray-50 p-5 space-y-3">
              <div className="flex items-center gap-2 text-indigo-600 text-sm">
                {section.title.includes('Shopify') && <ShoppingBag className="w-5 h-5" />}
                {section.title.includes('Amazon') && <Truck className="w-5 h-5" />}
                {section.title.includes('Creators') && <Users2 className="w-5 h-5" />}
                {section.title.includes('Agencies') && <Building2 className="w-5 h-5" />}
                {!['Shopify', 'Amazon', 'Creators', 'Agencies'].some(label => section.title.includes(label)) && <Sparkles className="w-5 h-5" />}
                <span className="font-semibold text-gray-900">{section.title}</span>
              </div>
              <ul className="space-y-2 text-gray-600 text-sm">
                {section.bullets.map(b => (
                  <li key={b} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 mt-0.5" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="relative">
          <Link
            to="/app"
            className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 hover:bg-indigo-700 transition"
          >
            Start Free Trial <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UseCases;
