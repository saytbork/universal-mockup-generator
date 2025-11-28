import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Guides – BoostUGC AI Tutorials",
  description:
    "Step-by-step guides to creating UGC, product photos, lifestyle images and hero visuals using BoostUGC and AI.",
};

const guides = [
  "How to Generate UGC with AI",
  "How to Create AI Lifestyle Images",
  "How to Build Shopify Photos with AI",
  "How to Create eCommerce Packshots",
  "AI for Amazon Listing Images",
  "AI Photography Tips for Beginners",
];

export default function GuidesPage() {
  return (
    <div className="bg-gray-950 text-white">
      <div className="max-w-5xl mx-auto px-4 py-20 space-y-12">
        <div className="space-y-3">
          <h1 className="text-4xl font-bold">Guides & Tutorials</h1>
          <p className="text-gray-300">
            Learn how to create high-converting visuals using AI.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {guides.map((guide) => (
            <div
              key={guide}
              className="rounded-2xl border border-white/10 bg-gray-900/60 p-5"
            >
              <h2 className="text-2xl font-semibold">{guide}</h2>
              <p className="text-gray-300 leading-relaxed mt-2">
                Step-by-step instructions coming soon. Save this guide to start faster.
              </p>
              <a
                href="#"
                className="inline-block bg-black text-white px-4 py-2 rounded-md hover:bg-black/90 text-sm mt-4"
              >
                Read Guide
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
