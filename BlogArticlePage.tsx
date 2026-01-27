import React, { useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getBlogArticleBySlug, BlogArticle } from './src/content/blog';
import { getGuideBySlug } from './src/content/guides';
import { applySeo } from './src/lib/seo';

const relatedGuideByBlogSlug: Record<string, string> = {
  'amazon-listing-images-ai': 'amazon-listing-images-ai-guide',
  'shopify-product-photos-ai-tactics': 'shopify-product-photos-ai-workflow',
  'how-to-create-scroll-stopping-ugc-with-ai': 'how-to-generate-ugc-with-ai',
  'dtc-ad-creatives-ai-ugc': 'how-to-generate-ugc-with-ai',
  'ab-testing-ai-ugc': 'how-to-generate-ugc-with-ai',
  'ugc-content-engine-ai-firebase': 'how-to-generate-ugc-with-ai',
  'cinematic-lifestyle-shots-ai': 'how-to-create-ai-lifestyle-images',
  'background-replacement-ecommerce': 'ecommerce-packshots-masterclass',
  'ai-product-mockups-launch-pages': 'ecommerce-packshots-masterclass',
  'ai-photography-supplements-beauty': 'how-to-create-ai-lifestyle-images',
};

const BlogArticlePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const article = useMemo<BlogArticle | null>(() => getBlogArticleBySlug(slug), [slug]);
  const relatedGuide = useMemo(() => {
    if (!slug) return null;
    const guideSlug = relatedGuideByBlogSlug[slug];
    if (!guideSlug) return null;
    return getGuideBySlug(guideSlug);
  }, [slug]);

  useEffect(() => {
    if (!article) return;
    applySeo({
      title: article.seo.title,
      description: article.seo.description,
      canonical: `https://perfectmockup.com/blog/${article.slug}`,
      ogImage: article.heroImage.url
        ? (article.heroImage.url.startsWith('http') ? article.heroImage.url : `https://perfectmockup.com${article.heroImage.url}`)
        : undefined,
      ogType: 'article',
    });
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': `https://perfectmockup.com/blog/${article.slug}`,
            },
            headline: article.title,
            description: article.seo.description,
            image: article.heroImage.url
              ? (article.heroImage.url.startsWith('http') ? article.heroImage.url : `https://perfectmockup.com${article.heroImage.url}`)
              : undefined,
            author: {
              '@type': 'Organization',
              name: 'Perfect Mockup',
              url: 'https://perfectmockup.com/',
            },
            publisher: {
              '@type': 'Organization',
              name: 'Perfect Mockup',
              url: 'https://perfectmockup.com/',
              logo: {
                '@type': 'ImageObject',
                url: 'https://perfectmockup.com/img/logos/colorlogo.svg',
              },
            },
          }),
        }}
      />
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

          {relatedGuide && (
            <section className="rounded-2xl border border-gray-200 bg-gray-50 p-6 space-y-2">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-500 font-extrabold">Related guide</p>
              <Link to={`/guides/${relatedGuide.slug}`} className="text-indigo-600 font-semibold hover:underline">
                {relatedGuide.title}
              </Link>
            </section>
          )}

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
