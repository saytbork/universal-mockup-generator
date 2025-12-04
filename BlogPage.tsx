import React from 'react';
import { Link } from 'react-router-dom';
import { getAllBlogArticles } from './src/content/blog';

const BlogPage: React.FC = () => {
  const posts = getAllBlogArticles();
  return (
    <div className="bg-gray-950 text-white min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-20 space-y-12">
        <div className="space-y-3">
          <h1 className="text-4xl font-bold">BoostUGC Blog</h1>
          <p className="text-gray-300">Guides, tutorials and AI insights for creators and brands.</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {posts.map(post => (
            <div
              key={post.slug}
              className="rounded-2xl border border-white/10 bg-gray-900/60 p-6 space-y-3"
            >
              <h2 className="text-2xl font-semibold">{post.title}</h2>
              <p className="text-gray-300 leading-relaxed">{post.subtitle}</p>
              <Link
                to={`/blog/${post.slug}`}
                className="inline-flex items-center justify-center bg-black text-white px-4 py-2 rounded-md hover:bg-black/90 text-sm"
              >
                Read Article
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlogPage;
