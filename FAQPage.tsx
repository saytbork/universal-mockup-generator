import React, { useEffect } from 'react';
import { applySeo } from './src/lib/seo';

const faqs = [
  {
    q: 'What is AI UGC?',
    a: 'AI-generated User Generated Content created without real creators using advanced AI models.',
  },
  {
    q: 'Can I use the images commercially?',
    a: 'Yes, all paid plans allow full commercial use.',
  },
  {
    q: 'Are the images photorealistic?',
    a: 'Yes, Perfect Mockup uses Google Gemini 2.5 Flash Image for realistic results.',
  },
  {
    q: 'How many images does 1 credit generate?',
    a: 'One image = one credit.',
  },
  {
    q: 'Does the free plan watermark images?',
    a: 'Yes, free images include a watermark and go to the public gallery.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes, instantly through your dashboard.',
  },
];

const FAQPage: React.FC = () => {
  useEffect(() => {
    applySeo({
      title: 'FAQ | Perfect Mockup',
      description: 'Frequently asked questions about Perfect Mockup: credits, commercial use, photorealism, and AI UGC.',
      canonical: 'https://perfectmockup.com/faq',
    });
  }, []);

  return (
    <div className="bg-gray-50 text-gray-900 dark:bg-black dark:text-white min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-20 space-y-12">
        <div className="space-y-3">
          <h1 className="text-4xl font-bold">Frequently Asked Questions</h1>
          <p className="text-gray-600">Everything you need to know about Perfect Mockup.</p>
        </div>

        <div className="space-y-6">
          {faqs.map(item => (
            <div
              key={item.q}
              className="rounded-2xl border border-gray-200 bg-gray-50 p-5 space-y-2"
            >
              <h2 className="text-2xl font-semibold">{item.q}</h2>
              <p className="text-gray-600 leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQPage;
