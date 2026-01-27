import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { getGuideBySlug } from './src/content/guides';
import { applySeo } from './src/lib/seo';

const GuideArticlePage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const guide = getGuideBySlug(slug);

    useEffect(() => {
        if (!guide) return;
        applySeo({
            title: guide.seo.title,
            description: guide.seo.description,
            canonical: `https://perfectmockup.com/guides/${guide.slug}`,
            ogImage: guide.heroImage.url
                ? (guide.heroImage.url.startsWith('http') ? guide.heroImage.url : `https://perfectmockup.com${guide.heroImage.url}`)
                : undefined,
        });
    }, [guide]);

    if (!guide) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
                <div className="text-center space-y-4">
                    <p className="text-gray-600">Guide not found.</p>
                    <Link to="/guides" className="text-indigo-600 font-bold hover:underline">Back to Guides</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white pb-20">
            {/* Navigation */}
            <nav className="sticky top-0 z-40 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-100 dark:border-white/5">
                <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link to="/guides" className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back to Guides
                    </Link>
                    <div className="text-[10px] uppercase font-black tracking-widest text-indigo-600 dark:text-indigo-400">
                        {guide.category}
                    </div>
                </div>
            </nav>

            {/* Hero Header */}
            <header className="max-w-4xl mx-auto px-6 pt-12 text-center space-y-6">
                <h1 className="text-4xl sm:text-6xl font-black leading-tight tracking-tight">
                    {guide.title}
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
                    {guide.subtitle}
                </p>
            </header>

            {/* Hero Visual */}
            <div className="max-w-5xl mx-auto px-6 mt-12">
                <div className="aspect-[21/9] w-full bg-gray-100 dark:bg-white/5 rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 relative group">
                    {guide.heroImage.url ? (
                        <img
                            src={guide.heroImage.url}
                            alt={guide.heroImage.alt}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm font-medium italic p-12 text-center border-4 border-dashed border-gray-100 dark:border-white/5 m-4 rounded-xl">
                            {guide.heroImage.prompt}
                        </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 scale-95 group-hover:scale-100">
                        <div className="bg-white/90 backdrop-blur-sm dark:bg-black/90 px-6 py-3 rounded-xl shadow-2xl border border-white/20 text-xs font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                            Generated with Perfect Mockup
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Sections */}
            <article className="max-w-3xl mx-auto px-6 mt-20 space-y-16">
                {guide.sections.map((section, idx) => (
                    <section key={idx} className="space-y-6 group">
                        <div className="flex items-start gap-4">
                            <span className="text-4xl font-black text-indigo-600/20 dark:text-indigo-400/10 group-hover:text-indigo-600/40 transition-colors uppercase tabular-nums">
                                {(idx + 1).toString().padStart(2, '0')}
                            </span>
                            <div className="space-y-4">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                                    {section.heading}
                                </h2>
                                <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                                    {section.body}
                                </p>
                            </div>
                        </div>

                        {section.imagePrompt && (
                            <div className="ml-14 rounded-xl border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 p-8 text-center">
                                <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-600 mb-4">Content Visual Prompt</p>
                                <p className="text-sm italic text-gray-500 dark:text-gray-400 font-medium">
                                    "{section.imagePrompt}"
                                </p>
                            </div>
                        )}
                    </section>
                ))}

                {/* Closing CTA Card */}
                <div className="pt-12">
                    <div className="rounded-xl bg-indigo-600 p-12 text-center space-y-8 shadow-2xl shadow-indigo-600/20 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent)]" />

                        <div className="relative space-y-4">
                            <h3 className="text-3xl font-black text-white leading-tight">
                                {guide.cta.title}
                            </h3>
                            <p className="text-indigo-100 text-lg font-medium opacity-80">
                                {guide.cta.text}
                            </p>
                        </div>

                        <div className="relative flex justify-center">
                            <Link
                                to="/login"
                                className="inline-flex items-center justify-center rounded-xl bg-white text-indigo-600 px-10 py-5 font-black text-lg transition-transform hover:scale-[1.05] active:scale-95 shadow-xl shadow-black/10"
                            >
                                {guide.cta.button}
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </Link>
                        </div>
                    </div>
                </div>
            </article>

            {/* Secondary Navigation */}
            <footer className="max-w-4xl mx-auto px-6 mt-32 border-t border-gray-100 dark:border-white/5 pt-12 flex items-center justify-between">
                <Link to="/guides" className="text-sm font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> All Guides
                </Link>
                <div className="flex items-center gap-6">
                    <Link to="/blog" className="text-sm font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white">Blog</Link>
                    <Link to="/app" className="text-sm font-bold text-indigo-600">Try App</Link>
                </div>
            </footer>
        </div>
    );
};

export default GuideArticlePage;
