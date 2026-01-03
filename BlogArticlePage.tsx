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
      <div className="bg-bg text-textPrimary min-h-screen flex flex-col">
        <div className="max-w-5xl mx-auto px-4 py-20">
          <p className="text-sm text-textSecondary">Article not found.</p>
          <Link to="/blog" className="inline-flex mt-4 text-accent">
            Back to blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-bg text-textPrimary min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-12 space-y-10">
        <section className="blog-hero rounded-apple-xl border border-border bg-surfaceTint p-8 space-y-4 shadow-accent">
          <Link className="text-sm text-textPrimary underline" to="/blog">
            ← Back to blog
          </Link>
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.4em] text-accent">Blog</p>
            <h1 className="text-4xl font-semibold leading-tight">{article.title}</h1>
            <p className="text-lg text-textPrimary max-w-3xl">{article.subtitle}</p>
          </div>
          <figure className="rounded-apple border border-border bg-surface p-4 space-y-2">
            <p className="text-xs uppercase tracking-[0.35em] text-textSecondary">Hero prompt</p>
            <p className="text-sm text-textPrimary leading-relaxed">{article.heroImage.prompt}</p>
            <figcaption className="text-[11px] uppercase tracking-[0.35em] text-textMuted">
              {article.heroImage.alt}
            </figcaption>
          </figure>
        </section>

        <section className="blog-body space-y-12">
          {article.sections.map(section => (
            <article key={section.heading} className="space-y-3">
              <h2 className="text-2xl font-semibold">{section.heading}</h2>
              <div
                className="space-y-2 text-textPrimary leading-relaxed"
                dangerouslySetInnerHTML={{ __html: section.body }}
              />
              {section.imagePrompt ? (
                <figure className="rounded-apple border border-border bg-surface p-4 space-y-2">
                  <p className="text-xs uppercase tracking-[0.35em] text-textSecondary">Image prompt</p>
                  <p className="text-sm text-textPrimary leading-relaxed">{section.imagePrompt}</p>
                  {section.imageAlt && (
                    <figcaption className="text-[11px] uppercase tracking-[0.35em] text-textMuted">
                      {section.imageAlt}
                    </figcaption>
                  )}
                </figure>
              ) : null}
            </article>
          ))}
          <div className="blog-cta rounded-apple-xl border border-border bg-surfaceTint p-6 space-y-3">
            <h3 className="text-2xl font-semibold">{article.cta.title}</h3>
            <p className="text-textPrimary leading-relaxed">{article.cta.text}</p>
            <a
              className="inline-flex items-center justify-center rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent"
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
