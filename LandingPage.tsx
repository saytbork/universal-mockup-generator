import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles, Wand2, Camera, ShieldCheck, PlaySquare, Users, CheckCircle2, CreditCard, Zap, Layers, Image as ImageIcon, Gauge, ShoppingBag, Package, Users2, Building2, Instagram, Twitter, Youtube, Linkedin, ArrowRight
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
  checkoutUrl?: string; // legacy fallback
  monthlyUrl?: string;
  yearlyUrl?: string;
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
const DEFAULT_CREATOR_LINK = 'https://buy.stripe.com/14A28tb1Sgr0b2Y5HBeIw02';
const DEFAULT_CREATOR_YEARLY_LINK = 'https://buy.stripe.com/fZu5kF3zq1w62wsc5ZeIw00';
const DEFAULT_STUDIO_LINK = 'https://buy.stripe.com/7sYfZj1ricaKdb6da3eIw01';
const DEFAULT_STUDIO_YEARLY_LINK = 'https://buy.stripe.com/5kQfZjb1Sa2C6MI8TNeIw03';
const creatorMonthlyUrl =
  getEnv('VITE_STRIPE_LINK_CREATOR_MONTHLY') ??
  getEnv('VITE_STRIPE_LINK_CREATOR') ??
  DEFAULT_CREATOR_LINK;
const creatorYearlyUrl =
  getEnv('VITE_STRIPE_LINK_CREATOR_YEARLY') ??
  DEFAULT_CREATOR_YEARLY_LINK;
const studioMonthlyUrl =
  getEnv('VITE_STRIPE_LINK_STUDIO_MONTHLY') ??
  getEnv('VITE_STRIPE_LINK_STUDIO') ??
  DEFAULT_STUDIO_LINK;
const studioYearlyUrl =
  getEnv('VITE_STRIPE_LINK_STUDIO_YEARLY') ??
  DEFAULT_STUDIO_YEARLY_LINK;

const pricing: PricingPlan[] = [
  {
    name: 'Free',
    monthlyPrice: '$0',
    yearlyPrice: '$0',
    monthlyCaption: 'per month',
    yearlyCaption: 'per year',
    highlights: [
      '2 credits (one-time)',
      'Watermark',
      'Community support',
    ],
    cta: 'Get Started Free',
    isFree: true,
  },
  {
    name: 'Creator – Monthly',
    monthlyPrice: '$19',
    yearlyPrice: '$137',
    monthlyCaption: 'per month',
    yearlyCaption: 'per year',
    highlights: [
      '20 credits/month',
      '2 videos/month',
      'No watermark',
      'Standard support',
    ],
    cta: 'Continue to Registration',
    checkoutUrl: creatorMonthlyUrl,
    monthlyUrl: creatorMonthlyUrl,
    yearlyUrl: creatorYearlyUrl,
    badge: 'Most Popular',
    featured: true,
    metadata: { plan: 'creator', credits: 20 },
  },
  {
    name: 'Studio – Monthly',
    monthlyPrice: '$29',
    yearlyPrice: '$244',
    monthlyCaption: 'per month',
    yearlyCaption: 'per year',
    highlights: [
      '60 credits/month',
      '6 videos/month',
      'No watermark',
      'Priority support',
    ],
    cta: 'Continue to Registration',
    checkoutUrl: studioMonthlyUrl, // fallback
    monthlyUrl: studioMonthlyUrl,
    yearlyUrl: studioYearlyUrl,
    metadata: { plan: 'studio', credits: 60 },
  },
];

const paymentMethods = ['Visa', 'Mastercard', 'American Express', 'Apple Pay', 'Google Pay'];
const TRIAL_BYPASS_KEY = 'ugc-product-mockup-trial-bypass';
const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS || '')
  .split(',')
  .map(email => email.trim().toLowerCase())
  .filter(Boolean);
const INVITE_CODE = import.meta.env.VITE_INVITE_CODE || '713371';
const PLAN_STORAGE_KEY = 'ugc-plan-tier';
const IMAGE_COUNT_KEY = 'ugc-product-mockup-generator-credit-count';

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
  const [inviteCode, setInviteCode] = useState('');
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [heroEmail, setHeroEmail] = useState('');
  const [heroStatus, setHeroStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [heroMessage, setHeroMessage] = useState<string | null>(null);
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
    const checkoutUrl =
      billingCycle === 'monthly'
        ? plan.monthlyUrl ?? plan.checkoutUrl
        : plan.yearlyUrl ?? plan.checkoutUrl;
    setSelectedPlan({
      name: plan.name,
      price,
      cadence,
      highlights: plan.highlights,
      checkoutUrl,
      metadata: plan.metadata,
    });
    setCheckoutEmail('');
    setCheckoutError(null);
  };

  const handleCloseCheckout = () => {
    setSelectedPlan(null);
    setCheckoutEmail('');
  };

  const handleHeroMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!heroEmail.trim()) return;
    setHeroStatus('loading');
    setHeroMessage(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: heroEmail.trim() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Unable to send magic link');
      }
      setHeroStatus('success');
      setHeroMessage('Check your email for your magic link.');
    } catch (err: any) {
      setHeroStatus('error');
      setHeroMessage(err?.message || 'Could not send link.');
    }
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

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const localKey = 'ugc-free-gallery';
    const localItems = (() => {
      try {
        return JSON.parse(window.localStorage.getItem(localKey) || '[]') as { imageUrl: string; title: string; createdAt: number }[];
      } catch {
        return [];
      }
    })();
    setLocalGalleryItems(localItems.length ? localItems.map((item, idx) => ({ id: `local-${idx}`, ...item })) : []);
    setRemoteDisplayed([]);
    setRemoteIndex(0);

    const fetchGallery = async () => {
      try {
        const res = await fetch('/api/gallery', { method: 'GET' });
        if (!res.ok) throw new Error('bad status');
        const data = await res.json();
        const remoteItems = Array.isArray(data?.items) ? data.items : [];
        setRemoteGalleryItems(remoteItems);
      } catch {
        setRemoteGalleryItems([]);
      }
    };
    fetchGallery();
  }, []);

  const requireAccessCode = useCallback((event?: React.MouseEvent, route = '/login') => {
    event?.preventDefault();
    navigate(route);
  }, [navigate]);

  const handleCloseAccessGate = () => {
    setShowAccessGate(false);
    setPendingRoute(null);
    setLandingTrialInput('');
    setLandingTrialStatus('idle');
    setInviteCode('');
    setInviteError(null);
  };

  const [activeMode, setActiveMode] = useState('lifestyle');
  const modeSlides = [
    {
      id: 'lifestyle',
      title: 'Lifestyle UGC',
      desc: 'Real people + product in natural environments.',
      image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80',
    },
    {
      id: 'studio',
      title: 'Studio Hero',
      desc: 'Clean, bold hero shots for homepages.',
      image: 'https://images.unsplash.com/photo-1512499617640-c2f999098c01?auto=format&fit=crop&w=1200&q=80',
    },
    {
      id: 'aesthetic',
      title: 'Aesthetic Builder',
      desc: 'Curated props, palettes, and lighting for brand vibes.',
      image: 'https://images.unsplash.com/photo-1506617420156-8e4536971650?auto=format&fit=crop&w=1200&q=80',
    },
    {
      id: 'background',
      title: 'Background Replace',
      desc: 'Swap backgrounds while preserving product fidelity.',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80',
    },
  ];

  const [localGalleryItems, setLocalGalleryItems] = useState<{ id: string; imageUrl: string; title: string }[]>([]);
  const [remoteGalleryItems, setRemoteGalleryItems] = useState<{ id: string; imageUrl: string; title: string }[]>([]);
  const [remoteDisplayed, setRemoteDisplayed] = useState<{ id: string; imageUrl: string; title: string }[]>([]);
  const [remoteIndex, setRemoteIndex] = useState(0);
  const galleryItems = useMemo(
    () => [...localGalleryItems, ...remoteDisplayed],
    [localGalleryItems, remoteDisplayed]
  );
  const REMOTE_BATCH_SIZE = 4;

  const handleLoadMore = useCallback(() => {
    const capacity = Math.max(0, 20 - localGalleryItems.length);
    if (capacity <= 0 || remoteIndex >= remoteGalleryItems.length) {
      return;
    }
    const itemsToAdd: { id: string; imageUrl: string; title: string }[] = [];
    let nextIndex = remoteIndex;
    while (nextIndex < remoteGalleryItems.length && itemsToAdd.length < REMOTE_BATCH_SIZE) {
      itemsToAdd.push(remoteGalleryItems[nextIndex]);
      nextIndex += 1;
    }
    if (!itemsToAdd.length) return;
    setRemoteIndex(nextIndex);
    setRemoteDisplayed(prev => {
      const next = [...prev, ...itemsToAdd];
      while (next.length > capacity) {
        next.shift();
      }
      return next;
    });
  }, [localGalleryItems.length, remoteGalleryItems, remoteIndex]);

  return (
    <>
      <div className="min-h-screen bg-gray-950 text-gray-100">
        <div className="bg-gradient-to-br from-indigo-900/40 via-gray-950 to-gray-950">

          <header className="relative overflow-hidden py-12">
            <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ background: 'radial-gradient(circle at 20% 20%, rgba(79,70,229,0.35), transparent 55%)' }} />
            <div className="max-w-6xl mx-auto px-6 pt-8 pb-20 flex flex-col items-center text-center gap-12 relative">
              <div className="max-w-3xl space-y-6 animate-fade-up">
                <p className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-1 text-xs uppercase tracking-widest text-indigo-200/90">
                  <ShieldCheck className="w-3.5 h-3.5" /> BoostUGC · AI UGC Generator
                </p>
                <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight">
                  The Fastest AI Generator for UGC & Product Mockups
                </h1>
                <p className="text-lg text-gray-300">
                  Create high-quality lifestyle images and product-focused UGC in seconds. No photoshoots. No freelancers. Just upload your product and generate unlimited scenes.
                </p>
                <div className="flex flex-wrap justify-center gap-3 text-sm text-gray-300">
                  {[
                    { icon: <Sparkles className="w-4 h-4" />, label: 'Photorealistic AI Models' },
                    { icon: <ImageIcon className="w-4 h-4" />, label: 'Upload Any Product' },
                    { icon: <Layers className="w-4 h-4" />, label: 'Multiple Angles & Styles' },
                    { icon: <Gauge className="w-4 h-4" />, label: 'Generated in Seconds' },
                  ].map(item => (
                    <span key={item.label} className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1">
                      {item.icon}
                      {item.label}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 animate-fade-up delay-200">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center rounded-full bg-indigo-500 px-8 py-4 font-semibold text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-600 transition"
                >
                  Start Now
                </Link>
                <button
                  onClick={handleSmoothScroll('#pricing')}
                  className="inline-flex items-center justify-center rounded-full border border-white/20 px-8 py-4 font-semibold text-white/80 hover:border-indigo-400 hover:text-white transition"
                >
                  View Pricing
                </button>
              </div>
              <div className="w-full max-w-xl animate-fade-up delay-300">
                <form onSubmit={handleHeroMagicLink} className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 flex flex-col sm:flex-row gap-3 items-center shadow-lg shadow-indigo-900/30">
                  <input
                    type="email"
                    value={heroEmail}
                    onChange={(e) => setHeroEmail(e.target.value)}
                    placeholder="Enter your email for a magic link"
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                  <button
                    type="submit"
                    disabled={heroStatus === 'loading'}
                    className="w-full sm:w-auto whitespace-nowrap rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 px-5 py-3 text-sm font-semibold text-white shadow-lg hover:from-indigo-400 hover:to-purple-400 transition disabled:opacity-60"
                  >
                    {heroStatus === 'loading' ? 'Sending...' : 'Send Magic Link'}
                  </button>
                </form>
                {heroMessage && (
                  <p
                    className={`mt-2 text-sm ${
                      heroStatus === 'success' ? 'text-green-300' : 'text-rose-300'
                    }`}
                  >
                    {heroMessage}
                  </p>
                )}
              </div>
              <p className="text-sm text-gray-500 animate-fade-up delay-400">Free plan → 2 credits · No credit card required</p>
            </div>
          </header>
        </div>

        <section id="features" className="max-w-6xl mx-auto px-6 py-12 space-y-12">
          <div className="text-center space-y-3">
            <p className="text-xs uppercase tracking-[0.3em] text-indigo-200">Why BoostUGC</p>
            <h2 className="text-3xl text-white font-semibold">Why creators, brands and agencies choose BoostUGC</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                title: 'Realistic product rendering',
                desc: 'Understands shape, texture and materials for natural, high-quality results.',
                icon: <Package className="w-6 h-6 text-indigo-300" />,
              },
              {
                title: 'Unlimited lifestyle scenarios',
                desc: 'Generate scenes with people, kitchens, bedrooms, gyms, studios and more.',
                icon: <Users2 className="w-6 h-6 text-indigo-300" />,
              },
              {
                title: 'Works with any product',
                desc: 'Bottles, jars, boxes, cosmetics, supplements, tech, apparel, food and more.',
                icon: <ShoppingBag className="w-6 h-6 text-indigo-300" />,
              },
            ].map(card => (
              <div key={card.title} className="rounded-2xl border border-white/10 bg-gray-900/60 p-5 text-left space-y-2">
                <div className="flex items-center gap-2 text-sm text-indigo-200">{card.icon}<span>{card.title}</span></div>
                <p className="text-gray-300 text-sm leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="steps" className="max-w-6xl mx-auto px-6 py-12 space-y-10">
          <div className="text-center space-y-3">
            <p className="text-xs uppercase tracking-[0.3em] text-indigo-200">How it works</p>
            <h2 className="text-3xl text-white font-semibold">Create stunning UGC in 3 steps</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { title: '1. Upload your product', description: 'Jar, box, bottle or any product. We extract shape and materials.' },
              { title: '2. Choose your style', description: 'Lifestyle, studio, cinematic, minimal, aesthetic, or clean white hero background.' },
              { title: '3. Generate & download', description: 'Get 4K-quality images for Shopify, Amazon, funnels and ads.' },
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
                <p className="text-sm uppercase tracking-widest text-indigo-300">Community Gallery</p>
                <h2 className="text-3xl text-white font-semibold mt-2">Latest Creations From the Community</h2>
                <p className="text-gray-400 mt-3 max-w-2xl">
                  Images generated with the Free Plan appear here automatically.
                </p>
              </div>
              <Link
                to="/app"
                className="inline-flex items-center justify-center rounded-full bg-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-600 transition"
              >
                Generate Yours
              </Link>
            </div>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {galleryItems.map((item, index) => (
                <div
                  key={item.id}
                  className="group relative block overflow-hidden rounded-3xl border border-white/10 bg-gray-900/40 text-left"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="h-64 w-full object-cover transition duration-500 group-hover:scale-105 group-hover:opacity-90"
                    loading={index < 2 ? 'eager' : 'lazy'}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition flex items-end">
                    <p className="p-4 text-sm text-white">{item.title}</p>
                  </div>
                </div>
              ))}
              {galleryItems.length === 0 && (
                <div className="col-span-full rounded-3xl border border-white/10 bg-gray-900/40 p-6 text-gray-300 text-sm">
                  Gallery will update automatically when Free plan images are generated.
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-center">
              <button
                onClick={handleLoadMore}
                disabled={
                  remoteIndex >= remoteGalleryItems.length || Math.max(0, 20 - localGalleryItems.length) === 0
                }
                className="rounded-full border border-white/20 bg-gray-900/60 px-6 py-2 text-sm font-semibold text-white transition disabled:opacity-40 disabled:cursor-not-allowed hover:border-indigo-400 hover:text-white"
              >
                Load more...
              </button>
            </div>
          </section>

        <section id="workflow" className="bg-gray-900/40 border-y border-white/5">
          <div className="max-w-6xl mx-auto px-6 py-16 space-y-10">
            <div className="text-center space-y-3">
              <p className="text-sm uppercase tracking-widest text-indigo-300">Creation Modes</p>
              <h2 className="text-3xl text-white font-semibold">Four powerful creation modes</h2>
            </div>
            <div className="grid gap-6 lg:grid-cols-[320px,1fr] items-center">
              <div className="space-y-3">
                {modeSlides.map(mode => (
                  <button
                    key={mode.id}
                    onClick={() => setActiveMode(mode.id)}
                    className={`w-full text-left rounded-2xl border p-4 transition ${
                      activeMode === mode.id ? 'border-indigo-400 bg-indigo-500/10 text-white' : 'border-white/10 bg-white/5 text-gray-300'
                    }`}
                  >
                    <p className="font-semibold">{mode.title}</p>
                    <p className="text-sm text-gray-400 mt-1">{mode.desc}</p>
                  </button>
                ))}
              </div>
              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gray-900/60 p-4 min-h-[260px]">
                {modeSlides.map(mode => (
                  <div
                    key={mode.id}
                    className={`absolute inset-0 transition-all duration-500 ${
                      activeMode === mode.id ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
                    }`}
                  >
                    <img
                      src={`${mode.image}&auto=format&fit=crop&w=1200&q=80`}
                      alt={mode.title}
                      className="h-full w-full object-cover rounded-2xl"
                    />
                    <div className="absolute bottom-4 left-4 right-4 rounded-2xl bg-black/60 backdrop-blur px-4 py-3 text-sm">
                      <p className="text-white font-semibold">{mode.title}</p>
                      <p className="text-gray-200">{mode.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* AI UGC explainer */}
        <section className="w-full bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 py-24 border-t border-white/5">
          <div className="max-w-5xl mx-auto px-4 space-y-12 text-white">
            <div className="space-y-3">
              <h2 className="text-4xl font-bold">
                What Is AI UGC and Why It’s Changing eCommerce Forever?
              </h2>
              <p className="text-gray-300 leading-relaxed">
                AI-generated User Generated Content lets you skip photoshoots and creators while keeping visuals human and on-brand. With Gemini 2.5 Flash Image, you get realistic lighting, materials, and reflections tailored for commerce.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {[
                {
                  title: 'Speed & cost',
                  desc: 'Ship lifestyle shots and hero images in minutes, not days.',
                  icon: <Zap className="w-5 h-5 text-indigo-300" />,
                },
                {
                  title: 'Consistency',
                  desc: 'Keep every asset on-brand without depending on creators or studios.',
                  icon: <ShieldCheck className="w-5 h-5 text-indigo-300" />,
                },
                {
                  title: 'Unlimited tests',
                  desc: 'Generate variations for A/B tests—backgrounds, angles, props, and lighting.',
                  icon: <Sparkles className="w-5 h-5 text-indigo-300" />,
                },
              ].map(card => (
                <div key={card.title} className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-indigo-200">{card.icon}<span>{card.title}</span></div>
                  <p className="text-gray-200 text-sm leading-relaxed">{card.desc}</p>
                </div>
              ))}
            </div>

            <div className="space-y-6">
              <h3 className="text-2xl font-semibold">How eCommerce Brands Use AI UGC</h3>
              <p className="text-gray-300 leading-relaxed">
                Replace or supplement traditional content with lifestyle scenes, in-context product images, creator-style photos, hero shots, and secondary product images.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { title: 'Shopify Stores', desc: 'Lifestyle + hero visuals without models or photographers.' },
                  { title: 'Amazon Sellers', desc: 'A+ content, packshots, and lifestyle scenes that boost conversion.' },
                  { title: 'Social Media Creators', desc: 'UGC-style shots for TikTok, Instagram, Reels, and thumbnails.' },
                  { title: 'Agencies & Marketing Teams', desc: 'Produce unlimited branded assets for clients and campaigns.' },
                ].map(item => (
                  <div key={item.title} className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
                    <p className="font-semibold text-white">{item.title}</p>
                    <p className="text-gray-300 text-sm">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-2xl font-semibold">Why BoostUGC is different</h3>
              <ul className="list-disc pl-6 space-y-3 text-gray-300">
                <li>Photorealistic by default—no AI art artifacts.</li>
                <li>Realistic shadows, reflections, and product geometry tuned for eCommerce.</li>
                <li>Optimized for ads, landing pages, and product pages.</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-2xl font-semibold">Does AI UGC convert better?</h3>
              <p className="text-gray-300 leading-relaxed">
                Brands report higher add-to-cart, CTR, and ad performance with native, human-feeling visuals—and faster testing to find winning angles.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-2xl font-semibold">The future is AI-powered</h3>
              <p className="text-gray-300 leading-relaxed">
                As models improve, production shifts fully to AI-driven workflows. Stay ahead with studio-quality and lifestyle content at scale—no traditional shoots required.
              </p>
            </div>

            <div className="pt-2">
              <a
                href="/login"
                className="inline-flex items-center gap-2 bg-indigo-500 text-white px-6 py-3 rounded-md hover:bg-indigo-600 text-lg font-medium"
              >
                <Sparkles className="w-5 h-5" />
                Start Free Trial
              </a>
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
                    {(() => {
                      if (plan.isFree) {
                        return (
                          <Link
                            to="/login"
                            className="mt-auto w-full rounded-full border border-white/30 px-4 py-3 text-sm font-semibold text-white hover:border-indigo-300 text-center"
                          >
                            {plan.cta}
                          </Link>
                        );
                      }
                      const isYearly = billingCycle === 'yearly';
                      const targetUrl = isYearly
                        ? plan.yearlyUrl || plan.monthlyUrl || plan.checkoutUrl
                        : plan.monthlyUrl || plan.checkoutUrl || plan.yearlyUrl;
                      return (
                        <a
                          href={targetUrl || '#'}
                          className={`mt-auto w-full rounded-full px-4 py-3 text-sm font-semibold transition text-center ${
                            plan.featured
                              ? 'bg-white text-[#120A24] hover:bg-gray-100'
                              : 'bg-indigo-500 text-white hover:bg-indigo-400'
                          }`}
                        >
                          {plan.cta}
                        </a>
                      );
                    })()}
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
            <Link
              to="/login"
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

      </div>
      {/* Access gate modal removed; flow now uses direct login and magic link */}
    </>
  );
};

export default LandingPage;
