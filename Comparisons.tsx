import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Gauge, ShieldCheck, Star, ArrowRight } from 'lucide-react';
import { applySeo } from './src/lib/seo';

const rows = [
  {
    tool: 'Perfect Mockup',
    photorealism: 'High (Gemini 2.5 Flash Image)',
    quality: 'UGC-first, consistent',
    mockups: 'Yes, eCommerce-ready',
    focus: 'Built for eCommerce',
    price: 'Free + paid plans',
  },
  {
    tool: 'Photoroom',
    photorealism: 'Medium',
    quality: 'Good backgrounds',
    mockups: 'Basic',
    focus: 'General',
    price: 'Paid',
  },
  {
    tool: 'Recraft',
    photorealism: 'Medium',
    quality: 'Illustrative focus',
    mockups: 'Limited',
    focus: 'Mixed',
    price: 'Paid',
  },
  {
    tool: 'ShotDrop',
    photorealism: 'Medium',
    quality: 'UGC focused',
    mockups: 'Some',
    focus: 'UGC',
    price: 'Paid',
  },
  {
    tool: 'Midjourney',
    photorealism: 'High (manual prompting)',
    quality: 'Varies by prompt',
    mockups: 'Not dedicated',
    focus: 'General',
    price: 'Paid',
  },
  {
    tool: 'Canva AI',
    photorealism: 'Medium',
    quality: 'General use',
    mockups: 'Basic',
    focus: 'Design general',
    price: 'Freemium',
  },
];

const Comparisons: React.FC = () => {
  useEffect(() => {
    applySeo({
      title: 'Perfect Mockup vs Competitors | Comparisons',
      description: 'Compare Perfect Mockup with other AI tools for ecommerce product visuals, lifestyle scenes, and UGC-style ads.',
      canonical: 'https://perfectmockup.com/comparisons',
    });
  }, []);

  return (
    <div className="bg-gray-50 text-gray-900 dark:bg-black dark:text-white min-h-screen">
      <div className="relative max-w-5xl mx-auto px-4 py-20 space-y-12">
        <div className="absolute inset-0 blur-3xl opacity-40 pointer-events-none" style={{ background: 'radial-gradient(circle at 20% 20%, var(--accent-glow), transparent 40%)' }} />
        <div className="relative space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-600 bg-indigo-600 text-white px-4 py-1 text-xs uppercase tracking-[0.2em] text-indigo-600">
            <Sparkles className="w-4 h-4" /> Head-to-head
          </div>
          <h1 className="text-4xl font-bold">Perfect Mockup vs Competitors</h1>
          <p className="text-gray-600">Why brands choose Perfect Mockup for photorealistic UGC.</p>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-gray-200 bg-gray-50 shadow-md shadow-md shadow-indigo-500/20">
          <div className="absolute inset-0 bg-gradient-to-br from-accentSoft via-transparent to-surfaceTint pointer-events-none" />
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm text-gray-900">
              <thead className="bg-gray-50 text-gray-900">
                <tr>
                  <th className="px-5 py-4 text-left">Tool</th>
                  <th className="px-5 py-4 text-left">Photorealism</th>
                  <th className="px-5 py-4 text-left">UGC Quality</th>
                  <th className="px-5 py-4 text-left">Product Mockups</th>
                  <th className="px-5 py-4 text-left">eCommerce Focus</th>
                  <th className="px-5 py-4 text-left">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map(row => (
                  <tr key={row.tool} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-4 font-semibold text-gray-900">{row.tool}</td>
                    <td className="px-5 py-4 text-gray-900">{row.photorealism}</td>
                    <td className="px-5 py-4 text-gray-900">{row.quality}</td>
                    <td className="px-5 py-4 text-gray-900">{row.mockups}</td>
                    <td className="px-5 py-4 text-gray-900">{row.focus}</td>
                    <td className="px-5 py-4 text-gray-900">{row.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="relative grid gap-4 md:grid-cols-3">
          {[
            { title: 'Photorealistic engine', desc: 'Gemini 2.5 Flash Image for lifelike lighting and materials.', icon: <ShieldCheck className="w-5 h-5" /> },
            { title: 'eCommerce-first', desc: 'Defaults for mockups, UGC, and product photography that convert.', icon: <Gauge className="w-5 h-5" /> },
            { title: 'Consistency at scale', desc: 'Replace manual content with fast, repeatable AI visuals.', icon: <Star className="w-5 h-5" /> },
          ].map(card => (
            <div key={card.title} className="rounded-2xl border border-gray-200 bg-gray-50 p-5 space-y-2">
              <div className="inline-flex items-center gap-2 text-indigo-600">
                {card.icon}
                <span className="text-sm">{card.title}</span>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>

        <div className="relative">
          <Link
            to="/app"
            className="inline-flex items-center gap-2 rounded-full bg-indigo-600 text-white px-6 py-3 text-sm font-semibold text-white shadow-md shadow-md shadow-indigo-500/20 hover:bg-indigo-600 text-white transition"
          >
            Start Free Trial <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Comparisons;
