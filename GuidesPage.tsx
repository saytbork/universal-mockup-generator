import React from 'react';
import { Link } from 'react-router-dom';
import { getAllGuideArticles } from './src/content/guides';

const GuidesPage: React.FC = () => {
  const guides = getAllGuideArticles();
  return (
    <div className="bg-gray-950 text-white min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-20 space-y-12">
        <div className="space-y-3">
          <h1 className="text-4xl font-bold">Guides & Tutorials</h1>
          <p className="text-gray-300">Learn how to create high-converting visuals using AI.</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {guides.map(guide => (
            <div
              key={guide.slug}
              className="rounded-2xl border border-white/10 bg-gray-900/60 overflow-hidden"
            >
              {guide.heroImage.src && (
                <img
                  src={guide.heroImage.src}
                  alt={guide.heroImage.alt}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-6 space-y-3">
                <h2 className="text-2xl font-semibold">{guide.title}</h2>
                <p className="text-gray-300 leading-relaxed">{guide.subtitle}</p>
                <Link
                  to={`/guides/${guide.slug}`}
                  className="inline-flex items-center justify-center bg-black text-white px-4 py-2 rounded-md hover:bg-black/90 text-sm"
                >
                  Read Guide
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GuidesPage;
