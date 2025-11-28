import Link from "next/link";

type GalleryItem = {
  id: string;
  imageUrl: string;
  title: string;
};

async function getGallery(): Promise<GalleryItem[]> {
  try {
    const base =
      process.env.NEXT_PUBLIC_BASE_URL ||
      (typeof window === "undefined" ? "http://localhost:3000" : "");
    const res = await fetch(`${base}/api/gallery`, {
      next: { revalidate: 30 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.items ?? [];
  } catch {
    return [];
  }
}

export default async function Home() {
  const gallery = await getGallery();

  const pricing = [
    {
      name: "Free",
      price: "0",
      cadence: "USD / month",
      perks: [
        "10 image credits",
        "Watermarked",
        "Non-commercial",
        "Images go to public gallery",
        "Support: Basic",
      ],
      cta: "Start Free Trial",
      href: "/signup",
      highlight: false,
    },
    {
      name: "Creator Monthly",
      price: "19",
      cadence: "USD / month",
      perks: [
        "20 image credits",
        "No watermark",
        "Commercial use",
        "Images are private",
        "Support: Standard",
      ],
      cta: "Choose Creator",
      href: "https://buy.stripe.com/test_cNi7sK2zogyrccy5jUbV609",
      highlight: true,
    },
    {
      name: "Creator Yearly",
      price: "137",
      cadence: "USD / year",
      perks: [
        "240 credits / year",
        "40 percent OFF",
        "Commercial use",
        "Private images",
      ],
      cta: "Choose Creator Yearly",
      href: "https://buy.stripe.com/test_4gM9ASei6dmf90mh2CbV608",
      highlight: false,
    },
    {
      name: "Studio Monthly",
      price: "29",
      cadence: "USD / month",
      perks: [
        "60 credits",
        "Commercial use",
        "Priority support",
        "Private images",
      ],
      cta: "Choose Studio",
      href: "https://buy.stripe.com/test_7sY5kCgqe6XR1xUbIibV602",
      highlight: false,
    },
    {
      name: "Studio Yearly",
      price: "244",
      cadence: "USD / year",
      perks: [
        "720 credits/year",
        "30 percent OFF",
        "Priority support",
        "Private images",
      ],
      cta: "Choose Studio Yearly",
      href: "https://buy.stripe.com/test_cNidR8a1Q6XR6Se8w6bV607",
      highlight: false,
    },
  ];

  return (
    <div className="bg-gray-950 text-white">
      <header className="max-w-6xl mx-auto px-6 py-12">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-600/20 via-gray-900 to-gray-950 p-8 sm:p-12 shadow-2xl">
          <div className="flex flex-col gap-6">
            <div className="inline-flex items-center gap-3 rounded-full border border-indigo-400/40 bg-indigo-400/10 px-4 py-2 text-sm text-indigo-100 w-fit">
              No credit card required
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
                Create Scroll-Stopping UGC and Product Mockups in Seconds
              </h1>
              <p className="text-lg text-gray-200 max-w-3xl">
                BoostUGC uses advanced AI to generate realistic product photos, lifestyle UGC, and hero landing images. Designed for eCommerce, creators and digital brands.
              </p>
              <p className="text-sm text-gray-400 max-w-3xl">
                BoostUGC is an AI-powered UGC generator that helps brands and creators produce high-quality lifestyle images, product photos and digital mockups instantly. Ideal for Shopify, Amazon, DTC brands, and social media creators.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-full bg-indigo-500 px-6 py-3 font-semibold text-white shadow-lg shadow-indigo-500/40 hover:bg-indigo-600 transition"
              >
                Start Free Trial
              </Link>
              <a
                href="#pricing"
                className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3 font-semibold text-white/80 hover:border-indigo-400 hover:text-white transition"
              >
                See Plans
              </a>
            </div>
          </div>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 py-12 space-y-4">
        <h2 className="text-2xl sm:text-3xl font-semibold">
          Latest Creations from Our Community
        </h2>
        <p className="text-gray-400 max-w-3xl">
          Free plan generations appear automatically in the BoostUGC public gallery, helping creators explore styles, find inspiration and test ideas.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {gallery.map((item) => (
            <div
              key={item.id}
              className="overflow-hidden rounded-2xl border border-white/10 bg-gray-900/60"
            >
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="h-56 w-full object-cover"
                />
                <span className="absolute bottom-2 left-2 rounded-full bg-black/70 px-3 py-1 text-xs">
                  Generated with BoostUGC
                </span>
              </div>
              <div className="p-4 text-sm text-gray-200">{item.title}</div>
            </div>
          ))}
          {gallery.length === 0 && (
            <div className="col-span-full rounded-2xl border border-white/10 bg-gray-900/50 p-6 text-gray-300">
              Gallery will appear here as soon as free generations are created.
            </div>
          )}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-12 space-y-6">
        <h2 className="text-2xl sm:text-3xl font-semibold">How BoostUGC Works</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            "Upload your product or use a sample.",
            "Select a mode (UGC Lifestyle, Product Photo, Hero Landing Page, Clean Packshot).",
            "AI generates photorealistic images instantly (Gemini 2.5 Flash Image AI).",
            "Download and publish anywhere.",
          ].map((text, idx) => (
            <div
              key={text}
              className="rounded-2xl border border-white/10 bg-gray-900/60 p-4"
            >
              <p className="text-sm text-indigo-200 mb-2">Step {idx + 1}</p>
              <p className="text-gray-100">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-12 space-y-6">
        <h2 className="text-2xl sm:text-3xl font-semibold">Four Powerful Creation Modes</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { title: "UGC Lifestyle", desc: "Creator-first angles, candid vibes, photorealistic by default." },
            { title: "Product Photo", desc: "Studio-like clarity with brand styling, photorealistic by default." },
            { title: "Hero Landing Page", desc: "Homepage heroes with bold lighting and depth, photorealistic by default." },
            { title: "Clean Packshot", desc: "E-commerce ready, crisp packshots, photorealistic by default." },
          ].map((card) => (
            <div
              key={card.title}
              className="rounded-2xl border border-white/10 bg-gray-900/60 p-4 space-y-2"
            >
              <p className="font-semibold">{card.title}</p>
              <p className="text-sm text-gray-300">{card.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="w-full bg-white py-24 border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-4 space-y-12">
          <h2 className="text-4xl font-bold text-gray-900">
            What Is AI UGC and Why It’s Changing eCommerce Forever?
          </h2>

          <p className="text-gray-600 leading-relaxed">
            AI UGC, or AI-generated User Generated Content, is content created
            using artificial intelligence instead of real creators or photographers.
            With advanced visual models like Google’s Gemini 2.5 Flash Image,
            brands can now generate realistic lifestyle photos, product mockups
            and hero landing images without the cost, time or logistics behind
            traditional photoshoots.
          </p>

          <p className="text-gray-600 leading-relaxed">
            AI UGC has exploded in adoption because it solves the biggest
            pain point in eCommerce: the constant need for fresh, branded
            content that looks natural and human. Whether for Shopify stores,
            Amazon listings, social media ads or DTC funnels, brands need
            realistic visuals that convert. BoostUGC delivers this instantly.
          </p>

          <h3 className="text-2xl font-semibold text-gray-900">
            Why AI UGC Works Better Than Traditional Content
          </h3>

          <ul className="list-disc pl-6 space-y-3 text-gray-700">
            <li>It’s faster and cheaper than photoshoots and UGC creators.</li>
            <li>It produces consistent brand visuals without depending on creators.</li>
            <li>You can generate unlimited variations for A/B testing.</li>
            <li>No coordination, shipping, scheduling or retakes.</li>
            <li>Perfect for small teams and large brands alike.</li>
            <li>Ideal for DTC, Shopify, Amazon, TikTok Ads and Instagram content.</li>
          </ul>

          <h3 className="text-2xl font-semibold text-gray-900">
            How eCommerce Brands Use AI UGC
          </h3>

          <p className="text-gray-600 leading-relaxed">
            Brands use AI UGC to replace or supplement traditional content.
            The most common use cases include lifestyle scenes, in-context product images,
            creator-style photos, hero shots for landing pages and product page secondary images.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <h4 className="font-semibold text-lg text-gray-900">Shopify Stores</h4>
              <p className="text-gray-600">
                Create lifestyle images for product pages and clean visuals for hero sections
                without hiring models or photographers.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-lg text-gray-900">Amazon Sellers</h4>
              <p className="text-gray-600">
                Generate A+ content images, packshots and lifestyle scenes that boost conversion.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-lg text-gray-900">Social Media Creators</h4>
              <p className="text-gray-600">
                Build UGC-style photos for TikTok, Instagram, Reels and YouTube thumbnails instantly.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-lg text-gray-900">Agencies & Marketing Teams</h4>
              <p className="text-gray-600">
                Create unlimited branded assets at scale for clients, campaigns and ads.
              </p>
            </div>
          </div>

          <h3 className="text-2xl font-semibold text-gray-900">
            Why BoostUGC Is Different From Other AI Tools
          </h3>

          <p className="text-gray-600 leading-relaxed">
            Unlike generic AI art tools, BoostUGC is built specifically for eCommerce.
            Every output is designed to look real, human and natural so that customers
            trust what they see. Models like Gemini 2.5 Flash Image produce photorealistic lighting,
            textures and product reflections that outperform generic AI platforms.
          </p>

          <ul className="list-disc pl-6 space-y-3 text-gray-700">
            <li>Every output is photorealistic by default.</li>
            <li>No AI “art-style” artifacts.</li>
            <li>Realistic shadows, reflections and product geometry.</li>
            <li>Optimized for eCommerce conversion rates.</li>
            <li>Perfect for ads, landing pages and product pages.</li>
          </ul>

          <h3 className="text-2xl font-semibold text-gray-900">
            Does AI UGC Convert Better Than Traditional Content?
          </h3>

          <p className="text-gray-600 leading-relaxed">
            Yes. Brands report an increase in add-to-cart rates, landing page CTR
            and ad performance when using lifestyle content that feels native
            and human. Because AI UGC allows unlimited experimentation, brands
            find the best-performing angles, colors, backgrounds and compositions
            in a fraction of the time.
          </p>

          <h3 className="text-2xl font-semibold text-gray-900">
            The Future of eCommerce Content Is AI-Powered
          </h3>

          <p className="text-gray-600 leading-relaxed">
            As AI models continue to improve, UGC creation will shift completely
            toward AI-driven workflows. BoostUGC allows you to stay ahead
            by producing studio-quality and lifestyle content at scale,
            removing the need for traditional photoshoots entirely.
          </p>

          <div className="pt-6">
            <a
              href="/signup"
              className="inline-block bg-black text-white px-6 py-3 rounded-md hover:bg-black/90 text-lg font-medium"
            >
              Start Free Trial
            </a>
          </div>
        </div>
      </section>

      <section id="pricing" className="max-w-6xl mx-auto px-6 py-16 space-y-8">
        <div className="space-y-2">
          <h2 className="text-3xl font-semibold">Simple Pricing for Creators & eCommerce Teams</h2>
          <p className="text-gray-400">Choose the plan that matches your launch velocity.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {pricing.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl border p-6 bg-gray-900/60 ${
                plan.highlight ? "border-indigo-400 shadow-lg shadow-indigo-500/30" : "border-white/10"
              }`}
            >
              <div className="flex items-baseline gap-2">
                <p className="text-xl font-semibold">{plan.name}</p>
              </div>
              <p className="mt-2 text-4xl font-bold">
                ${plan.price}
                <span className="text-base font-normal text-gray-400 ml-2">{plan.cadence}</span>
              </p>
              <ul className="mt-4 space-y-2 text-sm text-gray-200">
                {plan.perks.map((perk) => (
                  <li key={perk} className="flex items-start gap-2">
                    <span className="text-indigo-300">•</span> <span>{perk}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                {plan.href.startsWith("http") ? (
                  <a
                    href={plan.href}
                    className="inline-flex w-full items-center justify-center rounded-full bg-indigo-500 px-4 py-2 font-semibold text-white hover:bg-indigo-600 transition"
                  >
                    {plan.cta}
                  </a>
                ) : (
                  <Link
                    href={plan.href}
                    className="inline-flex w-full items-center justify-center rounded-full bg-indigo-500 px-4 py-2 font-semibold text-white hover:bg-indigo-600 transition"
                  >
                    {plan.cta}
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-white/10 bg-gray-950">
        <div className="max-w-6xl mx-auto px-6 py-10 space-y-6">
          <div>
            <p className="text-xl font-semibold">BoostUGC – AI UGC Generator</p>
            <p className="text-gray-400 mt-2 max-w-3xl">
              Create realistic UGC, lifestyle photos and product mockups powered by AI. Built for eCommerce brands, creators and agencies.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-3 text-sm text-gray-300">
            <div>
              <p className="font-semibold mb-2">Product</p>
              <ul className="space-y-1">
                <li><a href="#features" className="hover:text-white">Features</a></li>
                <li><a href="#gallery" className="hover:text-white">Gallery</a></li>
                <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
                <li><Link href="/signup" className="hover:text-white">Start Free Trial</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold mb-2">Company</p>
              <ul className="space-y-1">
                <li><a href="/about" className="hover:text-white">About</a></li>
                <li><a href="/blog" className="hover:text-white">Blog</a></li>
                <li><a href="mailto:support@boostugc.app" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold mb-2">Legal</p>
              <ul className="space-y-1">
                <li><a href="/terms" className="hover:text-white">Terms of Service</a></li>
                <li><a href="/privacy" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="/refund" className="hover:text-white">Refund Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-gray-500 border-t border-white/5 pt-4">
            <p>© 2025 BoostUGC. All rights reserved.</p>
            <p>Support: <a href="mailto:support@boostugc.app" className="text-indigo-300 hover:text-indigo-200">support@boostugc.app</a></p>
          </div>
        </div>
      </footer>
    </div>
  );
}
