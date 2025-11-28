import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ – BoostUGC",
  description:
    "Frequently asked questions about BoostUGC, AI UGC generation, product mockups, pricing, credits and plans.",
};

const faqs = [
  {
    q: "What is AI UGC?",
    a: "AI-generated User Generated Content created without real creators using advanced AI models.",
  },
  {
    q: "Can I use the images commercially?",
    a: "Yes, all paid plans allow full commercial use.",
  },
  {
    q: "Are the images photorealistic?",
    a: "Yes, BoostUGC uses Google Gemini 2.5 Flash Image for realistic results.",
  },
  {
    q: "How many images does 1 credit generate?",
    a: "One image = one credit.",
  },
  {
    q: "Does the free plan watermark images?",
    a: "Yes, free images include a watermark and go to the public gallery.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes, instantly through your dashboard.",
  },
];

export default function FAQPage() {
  return (
    <div className="bg-gray-950 text-white">
      <div className="max-w-5xl mx-auto px-4 py-20 space-y-12">
        <div className="space-y-3">
          <h1 className="text-4xl font-bold">Frequently Asked Questions</h1>
          <p className="text-gray-300">
            Everything you need to know about BoostUGC.
          </p>
        </div>

        <div className="space-y-6">
          {faqs.map((item) => (
            <div
              key={item.q}
              className="rounded-2xl border border-white/10 bg-gray-900/60 p-5 space-y-2"
            >
              <h2 className="text-2xl font-semibold">{item.q}</h2>
              <p className="text-gray-300 leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
