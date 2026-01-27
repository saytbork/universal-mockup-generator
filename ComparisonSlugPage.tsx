import React, { useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { applySeo } from './src/lib/seo';

const toTitle = (slug: string) =>
  slug
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

export default function ComparisonSlugPage() {
  const { slug } = useParams<{ slug: string }>();
  const name = useMemo(() => (slug ? toTitle(slug) : ''), [slug]);

  useEffect(() => {
    if (!slug) return;
    applySeo({
      title: `Perfect Mockup vs ${name} | Comparisons`,
      description: 'Compare Perfect Mockup with other AI tools for ecommerce product visuals, lifestyle scenes, and UGC-style ads.',
      canonical: `https://perfectmockup.com/comparisons/${slug}`,
    });
  }, [slug, name]);

  return (
    <div className="bg-gray-50 text-gray-900 dark:bg-black dark:text-white min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-20">
        <Link to="/comparisons" className="text-sm text-indigo-600 hover:underline">
          Comparisons
        </Link>
      </div>
    </div>
  );
}

