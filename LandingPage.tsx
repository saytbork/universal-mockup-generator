import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles, Wand2, Camera, ShieldCheck, PlaySquare, Users, CheckCircle2, CreditCard
} from 'lucide-react';
import PlanCheckoutModal from './components/PlanCheckoutModal';

type PlanMetadata = {
  plan: 'creator' | 'studio';
  credits: number;
};

type PricingPlan = {
  name: string;
  monthlyPrice: string;
  yearlyPrice: string;
  monthlyCaption: string;
  yearlyCaption: string;
  highlights: string[];
  cta: string;
  badge?: string;
  featured?: boolean;
  isFree?: boolean;
  checkoutUrl?: string;
  contactEmail?: string;
  metadata?: PlanMetadata;
};

type CheckoutPlan = {
  name: string;
  price: string;
  cadence: string;
  highlights: string[];
  checkoutUrl?: string;
  metadata?: PlanMetadata;
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

type GalleryItem = { src: string; label: string };

const baseGallery: GalleryItem[] = [
  {
    src: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
    label: 'Beauty supplement hero · Soft studio light',
  },
  {
    src: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80',
    label: 'Creator selfie with healthy snack · Warm indoor',
  },
  {
    src: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=1200&q=80',
    label: 'Tabletop tech flatlay · Clean daylight',
  },
  {
    src: 'https://images.unsplash.com/photo-1512499385554-079eba9be8e9?auto=format&fit=crop&w=1200&q=80',
    label: 'Luxury skincare duo · Editorial shadows',
  },
  {
    src: 'https://images.unsplash.com/photo-1581338834647-b0fb40704e21?auto=format&fit=crop&w=1200&q=80',
    label: 'Fitness drink on-the-go · Outdoor lifestyle',
  },
];

// Rotate gallery every few days so the homepage feels fresh without manual updates.
const rotationPeriodDays = 3;
const rotationIndex = Math.floor(Date.now() / (rotationPeriodDays * 24 * 60 * 60 * 1000)) % baseGallery.length;
const galleryImages: GalleryItem[] = [
  ...baseGallery.slice(rotationIndex),
  ...baseGallery.slice(0, rotationIndex),
];

const getEnv = (key: string) => import.meta.env[key as keyof ImportMetaEnv] as string | undefined;
const DEFAULT_CREATOR_LINK = 'https://buy.stripe.com/test_8x2cN4ei61DxgsO5jUbV603';
const DEFAULT_STUDIO_LINK = 'https://buy.stripe.com/test_7sY5kCgqe6XR1xUbIibV602';
const creatorCheckoutUrl = getEnv('VITE_STRIPE_LINK_CREATOR') ?? DEFAULT_CREATOR_LINK;
const studioCheckoutUrl = getEnv('VITE_STRIPE_LINK_STUDIO') ?? DEFAULT_STUDIO_LINK;

const pricing: PricingPlan[] = [
  {
    name: 'Free',
    monthlyPrice: '$0',
    yearlyPrice: '$0',
    monthlyCaption: 'per month',
    yearlyCaption: 'per year',
    highlights: [
      '10 starter credits to test the platform.',
      'Fast Generation engine. Consumption: 1 credit.',
      'Watermarked exports (non-commercial use).',
      'Basic support via community and docs.',
    ],
    cta: 'Start Free',
    isFree: true,
  },
  {
    name: 'Creator',
    monthlyPrice: '$15',
    yearlyPrice: '$135',
    monthlyCaption: 'per month',
    yearlyCaption: 'per year (save 25%)',
    highlights: [
      '200 monthly credits for light production.',
      'Fast Generation engine. Consumption: 1 credit.',
      'No watermark + basic commercial license.',
      'No access to Photorealism PRO.',
    ],
    cta: 'Upgrade to Creator',
    checkoutUrl: creatorCheckoutUrl,
    badge: 'Most Popular',
    featured: true,
    metadata: { plan: 'creator', credits: 200 },
  },
  {
    name: 'Studio',
    monthlyPrice: '$29',
    yearlyPrice: '$261',
    monthlyCaption: 'per month',
    yearlyCaption: 'per year (save 25%)',
    highlights: [
      '400 monthly credits (best value).',
      'Photorealism PRO. Consumption: 3 credits.',
      'Priority render queue for faster results.',
      'Full commercial license with no restrictions.',
    ],
    cta: 'Upgrade to Studio',
    checkoutUrl: studioCheckoutUrl,
    metadata: { plan: 'studio', credits: 400 },
  },
];

const paymentMethods = ['Visa', 'Mastercard', 'American Express', 'Apple Pay', 'Google Pay'];
const TRIAL_BYPASS_KEY = 'ugc-product-mockup-trial-bypass';
const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS || '')
  .split(',')
  .map(email => email.trim().toLowerCase())
  .filter(Boolean);

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<CheckoutPlan | null>(null);
  const [checkoutEmail, setCheckoutEmail] = useState('');
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [landingTrialInput, setLandingTrialInput] = useState('');
  const [landingTrialStatus, setLandingTrialStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [showAccessGate, setShowAccessGate] = useState(false);
  const [pendingRoute, setPendingRoute] = useState<string | null>(null);
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
    const cadence = billingCycle === 'monthly' ? plan.monthlyCaption : `${plan.yearlyCaption} (annual)`;
    const price = billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
    setSelectedPlan({
      name: plan.name,
      price,
      cadence,
      highlights: plan.highlights,
      checkoutUrl: plan.checkoutUrl,
      metadata: plan.metadata,
    });
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
      setCheckoutError('Stripe payment link is not configured for this plan. Add VITE_STRIPE_LINK_CREATOR / VITE_STRIPE_LINK_STUDIO variables.');
      return;
    }
    try {
      const targetUrl = new URL(selectedPlan.checkoutUrl);
      if (checkoutEmail) {
        targetUrl.searchParams.set('prefilled_email', checkoutEmail);
      }
      if (selectedPlan.metadata) {
        targetUrl.searchParams.set(
          'client_reference_id',
          `${selectedPlan.metadata.plan}-${selectedPlan.metadata.credits}`
        );
      }
      window.open(targetUrl.toString(), '_blank', 'noopener,noreferrer');
      handleCloseCheckout();
    } catch (err) {
      console.error(err);
      setCheckoutError('Invalid Stripe payment link. Please verify the URL.');
    }
  };

  const handleBillingToggle = () => {
    setBillingCycle(prev => (prev === 'monthly' ? 'yearly' : 'monthly'));
  };

  const handleLandingCodeSubmit = (navigateOnSuccess = false) => {
    setLandingTrialStatus('error');
    if (navigateOnSuccess || pendingRoute) {
      setShowAccessGate(false);
      const destination = pendingRoute ?? '/app';
      setPendingRoute(null);
      navigate(destination);
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.localStorage.getItem(TRIAL_BYPASS_KEY) === 'true') {
      setLandingTrialStatus('success');
    }
  }, []);

  const requireAccessCode = useCallback((event?: React.MouseEvent, route = '/app') => {
    const hasBypass = typeof window !== 'undefined' && window.localStorage.getItem(TRIAL_BYPASS_KEY) === 'true';
    if (hasBypass) {
      navigate(route);
      return;
    }
    event?.preventDefault();
    setPendingRoute(route);
    setShowAccessGate(false);
    setLandingTrialInput('');
    setLandingTrialStatus('idle');
    navigate(route);
  }, [navigate]);

  const handleCloseAccessGate = () => {
    setShowAccessGate(false);
    setPendingRoute(null);
    setLandingTrialInput('');
    setLandingTrialStatus('idle');
  };

  return (
    <>
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
              <button
                type="button"
                onClick={requireAccessCode}
                className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 text-sm font-medium hover:border-indigo-400 transition"
              >
                Launch builder
              </button>
              <button
                type="button"
                onClick={requireAccessCode}
                className="md:hidden inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 text-sm font-medium hover:border-indigo-400 transition"
              >
                Start
              </button>
            </div>
          </nav>

          <header className="relative overflow-hidden py-12">
            <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ background: 'radial-gradient(circle at 20% 20%, rgba(79,70,229,0.35), transparent 55%)' }} />
            <div className="max-w-6xl mx-auto px-6 pt-8 pb-20 flex flex-col items-center text-center gap-12 relative">
              <div className="max-w-3xl space-y-6 animate-fade-up">
                <p className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-1 text-xs uppercase tracking-widest text-indigo-200/90">
                  <ShieldCheck className="w-3.5 h-3.5" /> BoostUGC · AI Product Studio
                </p>
                <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight">
                  BoostUGC: product mockups in minutes, no photo shoot needed.
                </h1>
                <p className="text-lg text-gray-300">
                  Personalize your models, pick characters and moods, and generate campaign-ready images with just a few clicks. Swap scenes, talent, and lighting without the studio time.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 animate-fade-up delay-200">
                <button
                  type="button"
                  onClick={requireAccessCode}
                  className="inline-flex items-center justify-center rounded-full bg-indigo-500 px-8 py-4 font-semibold text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-600 transition"
                >
                  Launch App
                </button>
                <button
                  onClick={handleSmoothScroll('#features')}
                  className="inline-flex items-center justify-center rounded-full border border-white/20 px-8 py-4 font-semibold text-white/80 hover:border-indigo-400 hover:text-white transition"
                >
                  View Product Tour
                </button>
              </div>
              <p className="text-sm text-gray-500 animate-fade-up delay-300">Free plan → 10 credits · No credit card required</p>
              <div className="w-full max-w-4xl animate-fade-up delay-400">
                <div className="rounded-2xl border border-white/10 bg-gray-900/70 p-5 text-left shadow-lg shadow-indigo-500/10">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-indigo-200">Access instructions</p>
                      <h3 className="text-lg font-semibold text-white mt-1">How to access the builder</h3>
                    </div>
                    <div className="rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-medium text-indigo-100">
                      Emails come from: amisaodesign@gmail.com
                    </div>
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-white/5 bg-gray-800/60 p-4">
                      <p className="text-sm font-semibold text-white">Option 1: Google</p>
                      <p className="text-sm text-gray-300 mt-1">Click “Launch App” and choose “Continue with Google” to enter instantly.</p>
                    </div>
                    <div className="rounded-xl border border-white/5 bg-gray-800/60 p-4">
                      <p className="text-sm font-semibold text-white">Option 2: Email with code</p>
                      <p className="text-sm text-gray-300 mt-1">Enter your email, we’ll send a 6-digit code from <span className="font-semibold text-indigo-100">amisaodesign@gmail.com</span>. Check spam/promotions.</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">If you don’t see the email in 1–2 minutes, resend the code or try Google. Admins defined in VITE_ADMIN_EMAILS bypass trial limits.</p>
                </div>
              </div>
            </div>
          </header>
        </div>

        <section id="steps" className="max-w-6xl mx-auto px-6 py-12 space-y-10">
          <div className="text-center space-y-3">
            <p className="text-xs uppercase tracking-[0.3em] text-indigo-200">How it works</p>
            <h2 className="text-3xl text-white font-semibold">Upload. Choose intent. Generate.</h2>
            <p className="text-gray-400">Three simple steps to go from raw product photo to UGC lifestyle or product placement content.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { title: '1. Choose intent', description: 'Pick UGC Lifestyle or Product Placement to set the tone.' },
              { title: '2. Upload & inspire', description: 'Drop your product and optional mood image to auto-tune settings.' },
              { title: '3. Customize & ship', description: 'Refine props, camera, people, or pro lighting—then export photo + video.' },
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
              <h2 className="text-3xl text-white font-semibold mt-2">Recent UGC + product mockups generated inside the app.</h2>
              <p className="text-gray-400 mt-3 max-w-2xl">
                Fresh, real mockups generated in the app—auto-rotated every few days so you always see what’s possible right now.
              </p>
            </div>
            <button
              type="button"
              onClick={requireAccessCode}
              className="inline-flex items-center justify-center rounded-full bg-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-600 transition"
            >
              Generate your own
            </button>
          </div>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {galleryImages.map((item, index) => (
              <button
                type="button"
                key={item.label}
                onClick={requireAccessCode}
                className="group relative block overflow-hidden rounded-3xl border border-white/10 bg-gray-900/40 text-left"
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
              </button>
            ))}
          </div>
        </section>

        <section id="features" className="max-w-6xl mx-auto px-6 py-16 space-y-12">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-sm uppercase tracking-widest text-indigo-300 mb-2">Built for marketing teams</p>
            <h2 className="text-3xl text-white font-semibold">Create UGC and product shots that sell</h2>
            <p className="mt-4 text-gray-400">
              A full workflow for founders, marketers, and creators who need launch-quality assets fast—whether it’s candid creator vibes or polished studio hero shots.
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
                Every step is optimized for real results—from your first mockup to A/B testing dozens of UGC and product placement variations.
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

        {/* Universal Mockup Generator – Pricing Section by Juan Amisano */}
        <section id="pricing" className="relative isolate mt-16 px-4 py-20 sm:px-6 lg:px-8">
          <div className="absolute inset-0 -z-10 rounded-[2.5rem] bg-gradient-to-b from-[#0A0A0F] to-[#111] opacity-95" />
          <div className="max-w-6xl mx-auto text-white space-y-12">
            <div className="text-center space-y-4">
              <p className="text-sm uppercase tracking-[0.4em] text-indigo-200">Pricing</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold">Choose the plan that fits your launch velocity</h2>
              <p className="text-base text-gray-400 max-w-2xl mx-auto">
                Scale authentic UGC visuals without wrangling freelancers. Flip to annual billing and save 20% for your team.
              </p>
              <div className="mt-6 flex justify-center">
                <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 shadow-lg shadow-purple-900/30">
                  <span className="text-sm text-gray-300">Billed monthly</span>
                  <label className="relative inline-flex cursor-pointer items-center" aria-label="Toggle between monthly and annual billing">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={billingCycle === 'yearly'}
                      onChange={handleBillingToggle}
                    />
                    <div className="h-6 w-12 rounded-full bg-gray-600 transition peer-checked:bg-indigo-500" />
                    <span className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow transition peer-checked:translate-x-6" />
                  </label>
                  <span className="text-sm text-gray-300">
                    Billed yearly <span className="ml-1 rounded-full bg-purple-600/30 px-2 py-0.5 text-xs text-purple-200">Save 20%</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {pricing.map(plan => {
                const isYearly = billingCycle === 'yearly';
                const cadenceLabel = isYearly ? plan.yearlyCaption : plan.monthlyCaption;
                const displayedPrice = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
                const baseCard =
                  'group relative rounded-3xl border p-6 flex flex-col gap-6 hover:scale-[1.01] transition duration-300';
                const cardClasses = plan.featured
                  ? `${baseCard} border-[#7E5BEF] bg-gradient-to-b from-[#1A1340] to-[#120A24] shadow-[0_20px_60px_rgba(126,91,239,0.35)]`
                  : `${baseCard} border-white/10 bg-white/5`;

                const ctaBase =
                  'mt-auto w-full rounded-full px-4 py-3 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500';
                const ctaClasses = plan.featured
                  ? `${ctaBase} bg-white text-[#120A24] hover:bg-gray-100`
                  : plan.isFree
                    ? `${ctaBase} border border-white/30 text-white hover:border-indigo-300`
                    : plan.contactEmail
                      ? `${ctaBase} border border-white/30 text-white hover:bg-white/10`
                      : `${ctaBase} bg-indigo-500 text-white hover:bg-indigo-400`;

                return (
                  <article key={plan.name} className={cardClasses}>
                    {plan.badge && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#7E5BEF] px-3 py-1 text-xs font-semibold text-white">
                        {plan.badge}
                      </span>
                    )}
                    <header className="space-y-2">
                      <p className="text-base font-semibold">{plan.name}</p>
                      <div aria-live="polite" className="flex items-baseline gap-1 text-4xl font-bold text-white">
                        {displayedPrice}
                        <span className="text-base font-medium text-gray-400">USD</span>
                      </div>
                      <p className="text-sm text-gray-400">{cadenceLabel}</p>
                      <p className="sr-only">
                        {displayedPrice} {cadenceLabel}
                      </p>
                    </header>
                    <ul className="space-y-3 text-sm text-gray-200">
                      {plan.highlights.map(item => (
                        <li key={item} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-300 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    {plan.isFree && (
                      <button
                        type="button"
                        onClick={requireAccessCode}
                        className={ctaClasses}
                        aria-label={`${plan.cta} plan`}
                      >
                        {plan.cta}
                      </button>
                    )}
                    {!plan.isFree && plan.contactEmail && (
                      <a
                        href={`mailto:${plan.contactEmail}`}
                        className={ctaClasses}
                        aria-label={`${plan.cta} via email`}
                      >
                        {plan.cta}
                      </a>
                    )}
                    {!plan.isFree && !plan.contactEmail && (
                      <button
                        type="button"
                        onClick={() => handleOpenCheckout(plan)}
                        className={ctaClasses}
                        aria-label={plan.cta}
                      >
                        {plan.cta}
                      </button>
                    )}
                  </article>
                );
              })}
            </div>
            <p className="text-center text-sm text-gray-400">
              REMINDER: 1 credit equals 1 image generated in Fast Mode. Images generated in Photorealism PRO Mode consume 3 credits per execution.
            </p>

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
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6 py-16 text-center border-t border-white/5">
          <p className="text-sm uppercase tracking-[0.3em] text-indigo-200">Ready to promote</p>
          <h2 className="mt-4 text-3xl text-white font-semibold">Launch with authentic-looking visuals today.</h2>
          <p className="mt-3 text-gray-400">
            Create an account with your email, connect your Gemini API key, upload your first product, and publish scroll-stopping results in minutes.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <button
              type="button"
              onClick={requireAccessCode}
              className="inline-flex items-center justify-center rounded-full bg-indigo-500 px-8 py-4 font-semibold text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-600 transition"
            >
              Generate Mockups Now
            </button>
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
      {showAccessGate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-gray-950 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-indigo-200">Beta Access</p>
                <h3 className="text-xl font-semibold text-white mt-1">Enter internal code</h3>
              </div>
              <button
                type="button"
                onClick={handleCloseAccessGate}
                className="text-gray-400 hover:text-white text-sm"
                aria-label="Close access code dialog"
              >
                Close
              </button>
            </div>
            <p className="text-sm text-gray-300 mb-4">
              Access is restricted. Sign in with an authorized account or contact the team to continue.
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default LandingPage;
