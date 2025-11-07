import React, { useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, Wand2, Camera, ShieldCheck, PlaySquare, Users, CheckCircle2, ArrowRight, Mail, Trophy, Rocket, CreditCard 
} from 'lucide-react';
import PlanCheckoutModal from './components/PlanCheckoutModal';

type PricingPlan = {
  name: string;
  price: string;
  cadence: string;
  badge: string;
  icon: typeof Sparkles;
  highlights: string[];
  cta: string;
  featured?: boolean;
  isFree?: boolean;
  checkoutUrl?: string;
};

const features = [
  {
    title: 'Mockups in seconds',
    description: 'Upload your product and spin up on-brand UGC scenes that are ready to publish.',
    icon: Sparkles,
  },
  {
    title: 'Full creative control',
    description: 'Dial in camera, lighting, materials, talent, and 40+ pro-level parameters.',
    icon: Wand2,
  },
  {
    title: 'Campaign-ready output',
    description: 'Export stills or generate vertical and horizontal video cuts for ads.',
    icon: PlaySquare,
  },
];

const steps = [
  { title: '1. Upload your product', detail: 'Drag any PNG/JPG/WebP and the app preps it automatically.' },
  { title: '2. Pick the environment', detail: 'Select locations, camera types, people, interactions, and styles.' },
  { title: '3. Generate & refine', detail: 'Produce mockups, tweak with edit prompts, and spin up video clips.' },
];

const galleryImages = [
  {
    src: 'https://images.unsplash.com/photo-1519681393784-d120267933ba',
    label: 'Lifestyle skincare flatlay · Golden hour',
  },
  {
    src: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e',
    label: 'Creator selfie with beverage product',
  },
  {
    src: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab',
    label: 'Home office setup · Minimal tech mockup',
  },
  {
    src: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
    label: 'Headphones hero shot · Studio lighting',
  },
];

const getEnv = (key: string) => import.meta.env[key as keyof ImportMetaEnv] as string | undefined;

const pricing: PricingPlan[] = [
  {
    name: 'Free Launch',
    price: '$0',
    cadence: 'per month',
    badge: 'Email required',
    icon: Mail,
    highlights: [
      '10 image generations/month',
      'Watermarked exports',
      'Community support',
    ],
    cta: 'Start free',
    isFree: true,
  },
  {
    name: 'Growth (Popular)',
    price: '$39',
    cadence: 'per month',
    badge: 'Most teams pick this',
    icon: Trophy,
    highlights: [
      '200 image generations + 10 videos',
      'Priority rendering queue',
      'Commercial usage license',
    ],
    cta: 'Upgrade to Growth',
    featured: true,
    checkoutUrl: getEnv('VITE_STRIPE_LINK_GROWTH'),
  },
  {
    name: 'Premium Studio',
    price: '$89',
    cadence: 'per month',
    badge: 'Full production access',
    icon: Rocket,
    highlights: [
      '600 image generations + 30 videos',
      'Custom style templates & collaboration',
      'Dedicated support + roadmap input',
    ],
    cta: 'Talk to sales',
    checkoutUrl: getEnv('VITE_STRIPE_LINK_PREMIUM'),
  },
];

const paymentMethods = ['Visa', 'Mastercard', 'American Express', 'Apple Pay', 'Google Pay'];

const LandingPage: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [checkoutEmail, setCheckoutEmail] = useState('');
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const handleSmoothScroll = useCallback((selector: string) => {
    return (event: React.MouseEvent) => {
      event.preventDefault();
      const target = document.querySelector(selector);
      if (!target) return;
      const offset = 80;
      const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    };
  }, []);
  const handleOpenCheckout = (plan: PricingPlan) => {
    setSelectedPlan(plan);
    setCheckoutEmail('');
    setCheckoutError(null);
  };

  const handleCloseCheckout = () => {
    setSelectedPlan(null);
    setCheckoutEmail('');
  };

  const handleConfirmCheckout = () => {
    if (!selectedPlan) return;
    if (!selectedPlan.checkoutUrl) {
      setCheckoutError('Stripe payment link is not configured for this plan. Add VITE_STRIPE_LINK variables.');
      return;
    }
    try {
      const targetUrl = new URL(selectedPlan.checkoutUrl);
      if (checkoutEmail) {
        targetUrl.searchParams.set('prefilled_email', checkoutEmail);
      }
      window.open(targetUrl.toString(), '_blank', 'noopener,noreferrer');
      handleCloseCheckout();
    } catch (err) {
      console.error(err);
      setCheckoutError('Invalid Stripe payment link. Please verify the URL.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="bg-gradient-to-br from-indigo-900/40 via-gray-950 to-gray-950">
        <nav className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between text-sm">
          <div className="flex items-center gap-3 text-white text-xl font-semibold">
            <div className="p-2 rounded-xl bg-indigo-600/80 shadow-lg shadow-indigo-500/50">
              <Camera className="w-6 h-6" />
            </div>
            Universal Mockup Generator
          </div>
          <div className="hidden md:flex items-center gap-6 text-gray-300">
            <button onClick={handleSmoothScroll('#features')} className="hover:text-white transition">Features</button>
            <button onClick={handleSmoothScroll('#gallery')} className="hover:text-white transition">Gallery</button>
            <button onClick={handleSmoothScroll('#workflow')} className="hover:text-white transition">Workflow</button>
            <button onClick={handleSmoothScroll('#pricing')} className="hover:text-white transition">Pricing</button>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/app" className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 text-sm font-medium hover:border-indigo-400 transition">
              Launch builder
            </Link>
            <Link to="/app" className="md:hidden inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 text-sm font-medium hover:border-indigo-400 transition">
              Start
            </Link>
          </div>
        </nav>

        <header className="relative overflow-hidden py-12">
          <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ background: 'radial-gradient(circle at 20% 20%, rgba(79,70,229,0.35), transparent 55%)' }} />
          <div className="max-w-6xl mx-auto px-6 pt-8 pb-20 flex flex-col items-center text-center gap-12 relative">
            <div className="max-w-3xl space-y-6 animate-fade-up">
              <p className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-1 text-xs uppercase tracking-widest text-indigo-200/90">
                <ShieldCheck className="w-3.5 h-3.5" /> Pro-ready UGC Content
              </p>
              <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight">
                Create hyper-real UGC mockups for your products in minutes.
              </h1>
              <p className="text-lg text-gray-300">
                Upload your product, drop an inspiration mood, and let Gemini craft photo + video assets that feel authentically creator-made.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-up delay-200">
              <Link
                to="/app"
                className="inline-flex items-center justify-center rounded-full bg-indigo-500 px-8 py-4 font-semibold text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-600 transition"
              >
                Launch App
              </Link>
              <button
                onClick={handleSmoothScroll('#features')}
                className="inline-flex items-center justify-center rounded-full border border-white/20 px-8 py-4 font-semibold text-white/80 hover:border-indigo-400 hover:text-white transition"
              >
                View Product Tour
              </button>
            </div>
            <p className="text-sm text-gray-500 animate-fade-up delay-300">Free plan → 5 generations · No credit card required</p>
          </div>
        </header>
      </div>

      <section id="steps" className="max-w-6xl mx-auto px-6 py-12 space-y-10">
        <div className="text-center space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-indigo-200">How it works</p>
          <h2 className="text-3xl text-white font-semibold">Upload. Mood. Generate.</h2>
          <p className="text-gray-400">Three simple steps to go from raw product photo to polished UGC or product placement content.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {[
            { title: '1. Choose intent', description: 'Pick UGC Lifestyle or Product Placement to set the tone.' },
            { title: '2. Upload & inspire', description: 'Drop your product and optional mood image to auto-tune settings.' },
            { title: '3. Customize & ship', description: 'Refine props, camera, people, then export photo + video.' },
          ].map((card, index) => (
            <div
              key={card.title}
              className="rounded-2xl border border-white/5 bg-gray-900/60 p-5 text-left transition transform hover:-translate-y-1 hover:border-indigo-400 animate-fade-up"
              style={{ animationDelay: `${0.1 * (index + 1)}s` }}
            >
              <p className="text-xs uppercase tracking-widest text-gray-500">{card.title}</p>
              <p className="mt-2 text-white text-lg font-semibold">{card.description.split('.')[0]}</p>
              <p className="text-gray-400 mt-1">{card.description.split('.').slice(1).join('.')}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="gallery" className="max-w-6xl mx-auto px-6 py-14 space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-widest text-indigo-300">Live demo</p>
            <h2 className="text-3xl text-white font-semibold mt-2">Recent UGC mockups generated inside the app.</h2>
            <p className="text-gray-400 mt-3 max-w-2xl">
              These previews show the output of the free plan. Click any thumbnail to jump straight into the builder and recreate a similar style.
            </p>
          </div>
          <Link
            to="/app"
            className="inline-flex items-center justify-center rounded-full bg-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-600 transition"
          >
            Generate your own
          </Link>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {galleryImages.map((item, index) => (
            <Link
              to="/app"
              key={item.label}
              className="group relative block overflow-hidden rounded-3xl border border-white/10 bg-gray-900/40"
            >
              <img
                src={`${item.src}?auto=format&fit=crop&w=900&q=80`}
                alt={item.label}
                className="h-64 w-full object-cover transition duration-500 group-hover:scale-105 group-hover:opacity-90"
                loading={index < 2 ? 'eager' : 'lazy'}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition flex items-end">
                <p className="p-4 text-sm text-white">{item.label}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section id="features" className="max-w-6xl mx-auto px-6 py-16 space-y-12">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-sm uppercase tracking-widest text-indigo-300 mb-2">Built for marketing teams</p>
          <h2 className="text-3xl text-white font-semibold">Create content that feels like true UGC</h2>
          <p className="mt-4 text-gray-400">
            A full workflow for founders, marketers, and creators who need launch-quality assets fast.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map(feature => (
            <div key={feature.title} className="rounded-3xl border border-white/5 bg-gray-900/60 p-6 shadow-xl shadow-black/30">
              <feature.icon className="w-10 h-10 text-indigo-300" />
              <h3 className="mt-4 text-xl text-white font-semibold">{feature.title}</h3>
              <p className="mt-2 text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="workflow" className="bg-gray-900/40 border-y border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-16 grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <p className="text-sm uppercase tracking-widest text-indigo-300 mb-2">Workflow</p>
            <h2 className="text-3xl text-white font-semibold">From raw product shot to polished ads.</h2>
            <p className="mt-4 text-gray-400">
              Every step is optimized for real results—from your first mockup to A/B testing dozens of variations.
            </p>
            <div className="mt-8 space-y-6">
              {steps.map(step => (
                <div key={step.title} className="flex gap-4">
                  <CheckCircle2 className="w-6 h-6 text-indigo-300 flex-shrink-0" />
                  <div>
                    <p className="text-white font-medium">{step.title}</p>
                    <p className="text-gray-400 text-sm">{step.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-white/5 bg-gray-950/60 p-8 space-y-6">
            <div className="flex items-center gap-4">
              <Users className="w-10 h-10 text-indigo-300" />
              <div>
                <p className="text-white font-semibold">Built for lean teams</p>
                <p className="text-gray-400 text-sm">No photographers, no studios, no waiting.</p>
              </div>
            </div>
            <p className="text-gray-300 text-lg">
              “We launched a skincare line with the app and shipped lifestyle stills plus vertical reels the same afternoon. Perfect for founders who need to move fast.”
            </p>
            <div className="flex items-center gap-3 text-gray-400 text-sm">
              <Users className="w-5 h-5 text-indigo-300" />
              <span>UGC Launch beta testers</span>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="max-w-6xl mx-auto px-6 py-16 space-y-10">
        <div className="text-center max-w-3xl mx-auto">
          <p className="text-sm uppercase tracking-[0.3em] text-indigo-200 mb-4">Pricing</p>
          <h2 className="text-3xl text-white font-semibold">Three plans built for testing, scaling, and studios.</h2>
          <p className="mt-3 text-gray-400">
            Every workspace must register with a verified email before generating content. Plans are billed securely through Stripe with instant access after checkout.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {pricing.map(plan => (
            <div
              key={plan.name}
              className={`rounded-3xl border ${
                plan.featured ? 'border-indigo-400 bg-gradient-to-b from-indigo-900/40 to-gray-950' : 'border-white/5 bg-gray-900/50'
              } p-6 flex flex-col shadow-xl shadow-black/40`}
            >
              <div className="flex items-center gap-3">
                <plan.icon className={`w-8 h-8 ${plan.featured ? 'text-indigo-200' : 'text-indigo-300'}`} />
                <div>
                  <p className="text-white font-semibold">{plan.name}</p>
                  <p className="text-xs uppercase tracking-widest text-gray-400">{plan.badge}</p>
                </div>
              </div>
              <div className="mt-6">
                <span className="text-4xl font-bold text-white">{plan.price}</span>
                <span className="ml-2 text-sm text-gray-400">{plan.cadence}</span>
              </div>
              <ul className="mt-6 space-y-3 text-sm text-gray-300">
                {plan.highlights.map(item => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-300 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              {plan.isFree ? (
                <Link
                  to="/app"
                  className={`mt-8 inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition ${
                    plan.featured
                      ? 'bg-white text-gray-900 hover:bg-indigo-50'
                      : 'border border-white/20 text-white/90 hover:border-indigo-400'
                  }`}
                >
                  {plan.cta}
                </Link>
              ) : (
                <button
                  onClick={() => handleOpenCheckout(plan)}
                  className={`mt-8 inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition ${
                    plan.featured
                      ? 'bg-white text-gray-900 hover:bg-indigo-50'
                      : 'border border-white/20 text-white/90 hover:border-indigo-400'
                  }`}
                >
                  {plan.cta}
                </button>
              )}
            </div>
          ))}
        </div>
        {selectedPlan && (
          <PlanCheckoutModal
            plan={selectedPlan}
            email={checkoutEmail}
            onEmailChange={setCheckoutEmail}
            onClose={handleCloseCheckout}
            onConfirm={handleConfirmCheckout}
            disabledReason={!selectedPlan.checkoutUrl ? 'Stripe payment link missing. Configure VITE_STRIPE_LINK variables.' : checkoutError}
          />
        )}
        <div className="flex flex-col items-center gap-3 text-sm text-gray-400">
          <div className="inline-flex items-center gap-2 text-white/80 font-medium">
            <CreditCard className="w-4 h-4 text-indigo-300" />
            Payments processed by Stripe
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {paymentMethods.map(method => (
              <span key={method} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-gray-300">
                {method}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-16 text-center border-t border-white/5">
        <p className="text-sm uppercase tracking-[0.3em] text-indigo-200">Ready to promote</p>
        <h2 className="mt-4 text-3xl text-white font-semibold">Launch with authentic-looking visuals today.</h2>
        <p className="mt-3 text-gray-400">
          Create an account with your email, connect your Gemini API key, upload your first product, and publish scroll-stopping results in minutes.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
          <Link
            to="/app"
            className="inline-flex items-center justify-center rounded-full bg-indigo-500 px-8 py-4 font-semibold text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-600 transition"
          >
            Generate Mockups Now
          </Link>
          <a
            href="mailto:hola@universalugc.com"
            className="inline-flex items-center justify-center rounded-full border border-white/20 px-8 py-4 font-semibold text-white/80 hover:border-indigo-400 hover:text-white transition"
          >
            Request a guided demo
          </a>
        </div>
      </section>

      <footer className="border-t border-white/5 py-10 text-sm text-center text-gray-500">
        <div className="flex flex-col gap-3 items-center">
          <div className="flex items-center gap-2 text-white">
            <Camera className="w-5 h-5" />
            Universal Mockup Generator
          </div>
          <div className="flex flex-wrap justify-center gap-4 text-xs uppercase tracking-widest text-gray-400">
            <button onClick={handleSmoothScroll('#features')} className="hover:text-white transition">Features</button>
            <button onClick={handleSmoothScroll('#gallery')} className="hover:text-white transition">Gallery</button>
            <button onClick={handleSmoothScroll('#workflow')} className="hover:text-white transition">Workflow</button>
            <button onClick={handleSmoothScroll('#pricing')} className="hover:text-white transition">Pricing</button>
          </div>
          <p>© {new Date().getFullYear()} Universal Mockup Generator · Built in Buenos Aires</p>
          <p className="text-xs">
            Questions? <a className="text-indigo-300 hover:text-indigo-200" href="mailto:hola@universalugc.com">hola@universalugc.com</a>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
