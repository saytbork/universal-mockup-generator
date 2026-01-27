import React, { useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { applySeo } from './src/lib/seo';
import { getGuideBySlug } from './src/content/guides';

const toTitle = (slug: string) =>
  slug
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

type ComparisonKey = 'photoroom' | 'midjourney';

const comparisonData: Record<ComparisonKey, {
  tool: string;
  comparison: {
    photorealism: string;
    ugcQuality: string;
    productMockups: string;
    ecommerceFocus: string;
    price: string;
  };
  relatedGuides: string[];
}> = {
  photoroom: {
    tool: 'Photoroom',
    comparison: {
      photorealism: 'Medium',
      ugcQuality: 'Good backgrounds',
      productMockups: 'Basic',
      ecommerceFocus: 'General',
      price: 'Paid',
    },
    relatedGuides: ['ai-product-mockups', 'shopify-product-images-ai'],
  },
  midjourney: {
    tool: 'Midjourney',
    comparison: {
      photorealism: 'High (manual prompting)',
      ugcQuality: 'Varies by prompt',
      productMockups: 'Not dedicated',
      ecommerceFocus: 'General',
      price: 'Paid',
    },
    relatedGuides: ['ai-product-mockups', 'ai-ugc-for-ads'],
  },
};

export default function ComparisonSlugPage() {
  const { slug } = useParams<{ slug: string }>();
  const name = useMemo(() => (slug ? toTitle(slug) : ''), [slug]);
  const comparison = useMemo(() => {
    if (!slug) return null;
    const key = slug.toLowerCase() as ComparisonKey;
    return comparisonData[key] ?? null;
  }, [slug]);
  const relatedGuides = useMemo(() => {
    if (!comparison) return [];
    return comparison.relatedGuides.map((s) => getGuideBySlug(s)).filter(Boolean);
  }, [comparison]);

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
      <div className="max-w-5xl mx-auto px-4 py-20 space-y-10">
        <div className="space-y-3">
          <Link to="/comparisons" className="text-sm text-indigo-600 hover:underline">
            Comparisons
          </Link>
          <h1 className="text-4xl font-bold">Perfect Mockup vs {comparison?.tool ?? name}</h1>
        </div>

        {!comparison ? (
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
            <p className="text-sm text-gray-600">This comparison page is not available.</p>
          </div>
        ) : (
          <>
            <div className="rounded-3xl border border-gray-200 bg-gray-50 overflow-hidden">
              <table className="w-full border-collapse text-sm text-gray-900">
                <thead className="bg-gray-50 text-gray-900">
                  <tr>
                    <th className="px-5 py-4 text-left">Dimension</th>
                    <th className="px-5 py-4 text-left">Perfect Mockup</th>
                    <th className="px-5 py-4 text-left">{comparison.tool}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="px-5 py-4 font-semibold text-gray-900">Photorealism</td>
                    <td className="px-5 py-4 text-gray-900">High (Gemini 2.5 Flash Image)</td>
                    <td className="px-5 py-4 text-gray-900">{comparison.comparison.photorealism}</td>
                  </tr>
                  <tr>
                    <td className="px-5 py-4 font-semibold text-gray-900">UGC quality</td>
                    <td className="px-5 py-4 text-gray-900">UGC-first, consistent</td>
                    <td className="px-5 py-4 text-gray-900">{comparison.comparison.ugcQuality}</td>
                  </tr>
                  <tr>
                    <td className="px-5 py-4 font-semibold text-gray-900">Product mockups</td>
                    <td className="px-5 py-4 text-gray-900">Yes, eCommerce-ready</td>
                    <td className="px-5 py-4 text-gray-900">{comparison.comparison.productMockups}</td>
                  </tr>
                  <tr>
                    <td className="px-5 py-4 font-semibold text-gray-900">eCommerce focus</td>
                    <td className="px-5 py-4 text-gray-900">Built for eCommerce</td>
                    <td className="px-5 py-4 text-gray-900">{comparison.comparison.ecommerceFocus}</td>
                  </tr>
                  <tr>
                    <td className="px-5 py-4 font-semibold text-gray-900">Price</td>
                    <td className="px-5 py-4 text-gray-900">Free + paid plans</td>
                    <td className="px-5 py-4 text-gray-900">{comparison.comparison.price}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {relatedGuides.length > 0 && (
              <section className="rounded-2xl border border-gray-200 bg-gray-50 p-6 space-y-3">
                <p className="text-xs uppercase tracking-[0.2em] text-gray-500 font-extrabold">Related guides</p>
                <div className="space-y-2">
                  {relatedGuides.map((g) => (
                    <Link key={g!.slug} to={`/guides/${g!.slug}`} className="block text-indigo-600 font-semibold hover:underline">
                      {g!.title}
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
