import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Use Cases – BoostUGC AI UGC Generator",
  description:
    "Discover how BoostUGC helps Shopify stores, Amazon sellers, DTC brands, agencies, and creators produce high-converting UGC, product photos, and lifestyle images.",
};

const sections = [
  {
    title: "Shopify & DTC Brands",
    bullets: [
      "Create lifestyle photos for product pages",
      "Generate hero images for landing pages",
      "Improve conversion rates with realistic visuals",
    ],
  },
  {
    title: "Amazon FBA Sellers",
    bullets: [
      "Create packshots for main images",
      "Create lifestyle images for A+ content",
      "Improve page ranking with better visuals",
    ],
  },
  {
    title: "Social Media Creators",
    bullets: [
      "Generate UGC for Instagram, TikTok, YouTube thumbnails",
      "Create consistent brand-style content",
      "Save time vs creating content manually",
    ],
  },
  {
    title: "Agencies & Marketing Teams",
    bullets: [
      "Produce UGC campaigns at scale",
      "Rapid A/B testing of creative variations",
      "Unlimited styling possibilities",
    ],
  },
  {
    title: "Dropshipping Stores",
    bullets: [
      "Create high-quality photos without suppliers",
      "Build trust with realistic visuals",
      "Replace supplier images with branded content",
    ],
  },
];

export default function UseCasesPage() {
  return (
    <div className="bg-gray-950 text-white">
      <div className="max-w-5xl mx-auto px-4 py-20 space-y-12">
        <div className="space-y-3">
          <h1 className="text-4xl font-bold">Use Cases</h1>
          <p className="text-gray-300">
            How brands and creators use BoostUGC to generate high-converting content.
          </p>
        </div>

        <div className="space-y-10">
          {sections.map((section) => (
            <div key={section.title} className="space-y-2">
              <h2 className="text-2xl font-semibold">{section.title}</h2>
              <p className="text-gray-300">
                BoostUGC adapts to the workflow so you can ship visuals faster.
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-300">
                {section.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div>
          <Link
            href="/signup"
            className="inline-block bg-black text-white px-6 py-3 rounded-md hover:bg-black/90"
          >
            Start Free Trial
          </Link>
        </div>
      </div>
    </div>
  );
}
