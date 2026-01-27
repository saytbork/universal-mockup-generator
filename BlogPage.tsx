import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllBlogArticles } from './src/content/blog';
import { applySeo } from './src/lib/seo';

const BlogPage: React.FC = () => {
  const posts = getAllBlogArticles();

  useEffect(() => {
    applySeo({
      title: 'Blog | Perfect Mockup',
      description: 'Guides, tutorials, and AI insights for ecommerce product visuals, lifestyle scenes, and UGC-style ads.',
      canonical: 'https://perfectmockup.com/blog',
    });
  }, []);

  return (
    <div className="bg-gray-50 text-gray-900 dark:bg-black dark:text-white min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-20 space-y-12">
        <div className="space-y-3">
          <h1 className="text-4xl font-bold">Perfect Mockup Blog</h1>
          <p className="text-gray-600">Guides, tutorials and AI insights for creators and brands.</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {posts.map(post => (
            <Link
              key={post.slug}
              to={`/blog/${post.slug}`}
              className="group rounded-2xl border border-gray-200 bg-white overflow-hidden space-y-3 transition transform hover:-translate-y-1 hover:border-indigo-600 shadow-sm"
            >
              <div className="aspect-video w-full bg-gray-100 relative overflow-hidden">
                <img
                  src={post.heroImage.url || `/blog/heroes/${post.slug}.webp`}
                  alt={post.heroImage.alt}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6 pt-0 space-y-3">
                <h2 className="text-2xl font-semibold group-hover:text-indigo-600 transition-colors">{post.title}</h2>
                <p className="text-gray-600 leading-relaxed line-clamp-2">{post.subtitle}</p>
                <div className="inline-flex items-center text-indigo-600 font-medium pt-2">
                  Read Article →
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlogPage;
