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
      <div className="bg-gray-50 text-gray-900 dark:bg-black dark:text-white min-h-screen flex flex-col">
        <div className="max-w-5xl mx-auto px-4 py-20">
          <p className="text-sm text-gray-600">Article not found.</p>
          <Link to="/blog" className="inline-flex mt-4 text-indigo-600">
            Back to blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 text-gray-900 dark:bg-black dark:text-white min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-12 space-y-10">
        <section className="blog-hero rounded-3xl border border-gray-200 bg-gray-50 p-8 space-y-4 shadow-md shadow-md shadow-indigo-500/20">
          <Link className="text-sm text-gray-900 underline" to="/blog">
            ← Back to blog
          </Link>
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.4em] text-indigo-600">Blog</p>
            <h1 className="text-4xl font-semibold leading-tight">{article.title}</h1>
            <p className="text-lg text-gray-900 max-w-3xl">{article.subtitle}</p>
          </div>
          <figure className="rounded-2xl border border-gray-200 bg-white overflow-hidden space-y-2">
            <div className="aspect-video w-full bg-gray-100 relative overflow-hidden" style={{ maxHeight: '550px' }}>
              <img
                src={article.heroImage.url || `/blog/heroes/${article.slug}.webp`}
                alt={article.heroImage.alt}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1000';
                }}
              />

            </div>

          </figure>
        </section>

        <section className="blog-body space-y-12">
          {article.sections.map(section => (
            <article key={section.heading} className="space-y-3">
              <h2 className="text-2xl font-semibold">{section.heading}</h2>
              <div
                className="space-y-2 text-gray-900 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: section.body }}
              />

            </article>
          ))}
          <div className="blog-cta rounded-3xl border border-gray-200 bg-gray-50 p-6 space-y-3">
            <h3 className="text-2xl font-semibold">{article.cta.title}</h3>
            <p className="text-gray-900 leading-relaxed">{article.cta.text}</p>
            <a
              className="inline-flex items-center justify-center rounded-full bg-indigo-600 text-white px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-600 text-white"
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
