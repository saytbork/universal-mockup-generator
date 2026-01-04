import React from 'react';

const guides = [
  'How to Generate UGC with AI',
  'How to Create AI Lifestyle Images',
  'How to Build Shopify Photos with AI',
  'How to Create eCommerce Packshots',
  'AI for Amazon Listing Images',
  'AI Photography Tips for Beginners',
];

const GuidesPage: React.FC = () => {
  return (
    <div className="bg-bg text-gray-900 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-20 space-y-12">
        <div className="space-y-3">
          <h1 className="text-4xl font-bold">Guides & Tutorials</h1>
          <p className="text-gray-600">Learn how to create high-converting visuals using AI.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {guides.map(guide => (
            <div
              key={guide}
              className="rounded-2xl border border-gray-200 bg-whiteTint p-5"
            >
              <h2 className="text-2xl font-semibold">{guide}</h2>
              <p className="text-gray-600 leading-relaxed mt-2">
                Step-by-step instructions coming soon. Save this guide to start faster.
              </p>
              <a
                href="#"
                className="inline-block bg-white text-gray-900 px-4 py-2 rounded-2xl border border-gray-200 hover:bg-whiteTint text-sm mt-4 transition-colors"
              >
                Read Guide
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GuidesPage;
