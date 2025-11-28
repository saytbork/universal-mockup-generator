import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "BoostUGC Blog – AI UGC Guides & Tutorials",
  description:
    "Learn how to create UGC, lifestyle images, product photos, and mockups using AI. Expert guides for Shopify, Amazon, and creators.",
};

const posts = [
  {
    title: "How to create scroll-stopping UGC with AI",
    excerpt:
      "A quick playbook to generate lifestyle shots, product photos, and creator-style content without a studio.",
  },
  {
    title: "Shopify visuals that convert",
    excerpt:
      "Best practices to pair product photos, hero images, and lifestyle shots for higher add-to-cart rates.",
  },
  {
    title: "AI for Amazon listings",
    excerpt:
      "Packshots, A+ content, and lifestyle galleries that meet Amazon guidelines and stand out in search.",
  },
];

export default function BlogPage() {
  return (
    <div className="bg-gray-950 text-white">
      <div className="max-w-5xl mx-auto px-4 py-20 space-y-12">
        <div className="space-y-3">
          <h1 className="text-4xl font-bold">BoostUGC Blog</h1>
          <p className="text-gray-300">
            Guides, tutorials and AI insights for creators and brands.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {posts.map((post) => (
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
}
