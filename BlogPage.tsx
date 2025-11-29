import React from 'react';

const posts = [
  {
    title: 'How to Create Scroll-Stopping UGC With AI',
    excerpt:
      'A practical framework to generate lifestyle shots, product photos, and creator-style content without a studio.',
  },
  {
    title: 'Shopify Product Photos: AI Tactics to Increase Conversion',
    excerpt:
      'How to pair product, hero, and lifestyle images to boost add-to-cart and lower bounce rate on Shopify.',
  },
  {
    title: 'Amazon Listing Images With AI: A+ Content That Ranks',
    excerpt:
      'Packshots, A+ modules, and lifestyle galleries that meet Amazon guidelines and improve CTR.',
  },
  {
    title: 'DTC Ad Creatives: AI UGC That Scales Winning Angles',
    excerpt:
      'Use AI to find new hooks, backgrounds, and props for Meta/TikTok ads without expensive reshoots.',
  },
  {
    title: 'Background Replacement for eCommerce: Clean, Fast, On-Brand',
    excerpt:
      'Swap busy backdrops for clean, branded scenes while preserving product fidelity and reflections.',
  },
  {
    title: 'Cinematic Lifestyle Shots With AI: Lighting, Props, and Mood',
    excerpt:
      'Dial in cinematic vibes—soft light, depth, and realistic props—to make AI UGC feel human and premium.',
  },
  {
    title: 'AI Product Mockups for Launch Pages: Hero Images That Convert',
    excerpt:
      'Build homepage heroes and landing visuals that highlight materials, textures, and brand color cues.',
  },
  {
    title: 'A/B Testing AI UGC: Find Your Best Performing Scenes',
    excerpt:
      'A simple process to iterate on angles, colors, and backgrounds to quickly identify winning creatives.',
  },
  {
    title: 'AI Photography for Supplements and Beauty Brands',
    excerpt:
      'Use AI to render jars, bottles, and droppers with true-to-life materials and lifestyle staging.',
  },
  {
    title: 'Building a UGC Content Engine With AI and Firebase',
    excerpt:
      'Connect AI generation with Firebase auth and credits to deliver UGC at scale for your users.',
  },
];

const BlogPage: React.FC = () => {
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
              key={post.title}
              className="rounded-2xl border border-white/10 bg-gray-900/60 p-6 space-y-3"
            >
              <h2 className="text-2xl font-semibold">{post.title}</h2>
              <p className="text-gray-300 leading-relaxed">{post.excerpt}</p>
              <a
                href="#"
                className="inline-block bg-black text-white px-4 py-2 rounded-md hover:bg-black/90 text-sm"
              >
                Read More
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlogPage;
