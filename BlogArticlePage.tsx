import React, { useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getBlogArticleBySlug, BlogArticle } from './src/content/blog';

const setMetaDescription = (content: string) => {
  const meta = document.querySelector('meta[name="description"]');
  if (meta) {
    meta.setAttribute('content', content);
  }
};

const BlogArticlePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const article = useMemo<BlogArticle | null>(() => getBlogArticleBySlug(slug), [slug]);

  useEffect(() => {
    if (!article) return;
    document.title = article.seo.title;
    setMetaDescription(article.seo.description);
  }, [article]);

  if (!article) {
    return (
      <div className="bg-gray-950 text-white min-h-screen flex flex-col">
        <div className="max-w-5xl mx-auto px-4 py-20">
          <p className="text-sm text-gray-400">Article not found.</p>
          <Link to="/blog" className="inline-flex mt-4 text-indigo-300">
            Back to blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-950 text-white min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-12 space-y-10">
        <section className="blog-hero rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-500/30 to-purple-500/30 p-8 space-y-4">
          <Link className="text-sm text-gray-200 underline" to="/blog">
            ← Back to blog
          </Link>
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.4em] text-indigo-200">Blog</p>
            <h1 className="text-4xl font-semibold leading-tight">{article.title}</h1>
            <p className="text-lg text-gray-200 max-w-3xl">{article.subtitle}</p>
          </div>
          <figure className="rounded-2xl border border-white/10 bg-black/40 p-4 space-y-2">
            <p className="text-xs uppercase tracking-[0.35em] text-gray-400">Hero prompt</p>
            <p className="text-sm text-gray-200 leading-relaxed">{article.heroImage.prompt}</p>
            <figcaption className="text-[11px] uppercase tracking-[0.35em] text-gray-500">
              {article.heroImage.alt}
            </figcaption>
          </figure>
        </section>

        <section className="blog-body space-y-12">
          {article.sections.map(section => (
            <article key={section.heading} className="space-y-3">
              <h2 className="text-2xl font-semibold">{section.heading}</h2>
              <div
                className="space-y-2 text-gray-200 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: section.body }}
              />
              {section.imagePrompt ? (
                <figure className="rounded-2xl border border-white/10 bg-gray-900/60 p-4 space-y-2">
                  <p className="text-xs uppercase tracking-[0.35em] text-gray-400">Image prompt</p>
                  <p className="text-sm text-gray-200 leading-relaxed">{section.imagePrompt}</p>
                  {section.imageAlt && (
                    <figcaption className="text-[11px] uppercase tracking-[0.35em] text-gray-500">
                      {section.imageAlt}
                    </figcaption>
                  )}
                </figure>
              ) : null}
            </article>
          ))}
          <div className="blog-cta rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-500/20 to-indigo-500/20 p-6 space-y-3">
            <h3 className="text-2xl font-semibold">{article.cta.title}</h3>
            <p className="text-gray-200 leading-relaxed">{article.cta.text}</p>
            <a
              className="inline-flex items-center justify-center rounded-full bg-emerald-500/90 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400"
              href="/app"
            >
              {article.cta.button}
            </a>
          </div>
        </section>
      </div>
    </div>
  );
};

export default BlogArticlePage;
