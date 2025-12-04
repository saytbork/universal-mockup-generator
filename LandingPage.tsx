import React, { useState, useCallback, useEffect } from 'react';
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

type GalleryEntry = {
  id: string;
  imageUrl: string;
  plan?: string;
  createdAt?: string | number | Date;
};

const getGalleryPlanLabel = (plan?: string) => {
  if (!plan) return 'Community creation';
  const normalized = plan.toLowerCase();
  if (normalized === 'free') return 'Free plan';
  if (normalized === 'invitation') return 'Invitation plan';
  if (normalized === 'creator') return 'Creator plan';
  if (normalized === 'studio') return 'Studio plan';
  return plan;
};

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

const NAV_LINKS = [
  { label: 'Features', target: '#features' },
  { label: 'Steps', target: '#steps' },
  { label: 'Pricing', target: '#pricing' },
  { label: 'Gallery', target: '#gallery' },
];

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
  const [galleryImages, setGalleryImages] = useState<GalleryEntry[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(true);
  const [activeMode, setActiveMode] = useState('lifestyle');
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
      const res = await fetch('/api/auth?action=login', {
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
    let mounted = true;
    const fetchGallery = async () => {
      try {
        const response = await fetch('/api/galleryHandler?action=list');
        if (!response.ok) {
          throw new Error(`Gallery fetch failed with ${response.status}`);
        }
        const data = (await response.json()) as { images?: GalleryEntry[] };
        if (!mounted) return;
        const images = Array.isArray(data?.images) ? data.images : [];
        setGalleryImages(images);
      } catch (error) {
        console.error('Community gallery fetch failed', error);
        if (mounted) {
          setGalleryImages([]);
        }
      } finally {
        if (mounted) {
          setGalleryLoading(false);
        }
      }
    };
    fetchGallery();
    return () => {
      mounted = false;
    };
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

  return (
    <>
       
      {/* Access gate modal removed; flow now uses direct login and magic link */}
    </>
  );
};

export default LandingPage;
