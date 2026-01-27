import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen } from 'lucide-react';
import { getAllGuides } from './src/content/guides';
import { applySeo } from './src/lib/seo';

const GuidesPage: React.FC = () => {
  const guides = getAllGuides();

  useEffect(() => {
    applySeo({
      title: 'Guides & Tutorials | Perfect Mockup',
      description: 'Step-by-step guides for AI product photography, ecommerce visuals, and UGC-style content for Shopify and Amazon sellers.',
      canonical: 'https://perfectmockup.com/guides',
    });
  }, []);

  return (
    <div className="bg-white dark:bg-black text-gray-900 dark:text-white min-h-screen pb-24 transition-colors duration-500">
      <div className="max-w-6xl mx-auto px-6 py-20 space-y-16">
        {/* Header Section */}
        <div className="space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
            <BookOpen className="w-3.5 h-3.5" /> University
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.1]">
            Visual Production <br /> <span className="text-gray-400 dark:text-gray-600">Guides & Tutorials.</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 font-medium">
            Learn how to generate high-converting product shots and UGC content from scratch.
          </p>
        </div>

        {/* Guides Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {guides.map((guide, idx) => (
            <Link
              key={guide.slug}
              to={`/guides/${guide.slug}`}
              className="group relative flex flex-col rounded-xl border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 overflow-hidden transition-all duration-500 hover:bg-white dark:hover:bg-white/10 hover:border-indigo-100 dark:hover:border-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/5 hover:-translate-y-1"
            >
              {/* Hero Image */}
              <div className="aspect-[16/10] w-full bg-gray-100 dark:bg-white/5 p-0 flex flex-col justify-end border-b border-gray-100 dark:border-white/5 relative overflow-hidden">
                {guide.heroImage.url && (
                  <img
                    src={guide.heroImage.url}
                    alt={guide.heroImage.alt}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                <div className="absolute top-4 left-4 text-[10px] font-black uppercase tracking-widest text-white/80 drop-shadow-md">
                  {guide.category}
                </div>

                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white dark:bg-black border border-gray-100 dark:border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 scale-75 group-hover:scale-100 z-10 shadow-xl">
                  <ArrowRight className="w-5 h-5 text-indigo-600" />
                </div>

                <p className="relative p-6 text-[10px] font-mono text-white/60 dark:text-gray-300 line-clamp-2 italic leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  "{guide.heroImage.prompt}"
                </p>
              </div>

              <div className="flex-1 p-8 space-y-4">
                <span className="text-xs font-black text-indigo-600/40 dark:text-indigo-400/20 tabular-nums">
                  {(idx + 1).toString().padStart(2, '0')}
                </span>
                <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight">
                  {guide.title}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3 font-medium">
                  {guide.subtitle}
                </p>
                <div className="mt-auto pt-6 flex items-center gap-2 text-sm font-black text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity translate-x-[-10px] group-hover:translate-x-0">
                  Read Guide <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GuidesPage;
