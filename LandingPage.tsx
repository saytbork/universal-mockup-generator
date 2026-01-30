import React, { useCallback, useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, CreditCard, ShieldCheck, ShoppingBag, Users2, Zap, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import PlanCheckoutModal from './components/PlanCheckoutModal';
import TestimonialsSection from './components/TestimonialsSection';
import { getAllBlogArticles } from './src/content/blog';

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

const getEnv = (key: string) => (import.meta as any).env?.[key] as string | undefined;
const DEFAULT_CREATOR_LINK = 'https://buy.stripe.com/14A28tb1Sgr0b2Y5HBeIw02';
const DEFAULT_CREATOR_YEARLY_LINK = 'https://buy.stripe.com/fZu5kF3zq1w62wsc5ZeIw00';
const DEFAULT_STUDIO_LINK = 'https://buy.stripe.com/7sYfZj1ricaKdb6da3eIw01';
const DEFAULT_STUDIO_YEARLY_LINK = 'https://buy.stripe.com/5kQfZjb1Sa2C6MI8TNeIw03';
const creatorMonthlyUrl =
  getEnv('VITE_STRIPE_LINK_CREATOR_MONTHLY') ??
  getEnv('VITE_STRIPE_LINK_CREATOR') ??
  DEFAULT_CREATOR_LINK;
const creatorYearlyUrl = getEnv('VITE_STRIPE_LINK_CREATOR_YEARLY') ?? DEFAULT_CREATOR_YEARLY_LINK;
const studioMonthlyUrl =
  getEnv('VITE_STRIPE_LINK_STUDIO_MONTHLY') ??
  getEnv('VITE_STRIPE_LINK_STUDIO') ??
  DEFAULT_STUDIO_LINK;
const studioYearlyUrl = getEnv('VITE_STRIPE_LINK_STUDIO_YEARLY') ?? DEFAULT_STUDIO_YEARLY_LINK;

const pricing: PricingPlan[] = [
  {
    name: 'Free',
    monthlyPrice: '$0',
    yearlyPrice: '$0',
    monthlyCaption: 'per month',
    yearlyCaption: 'per year',
    highlights: ['2 credits (one-time)', 'Watermark', 'Community support'],
    cta: 'Get Started Free',
    isFree: true,
  },
  {
    name: 'Creator – Monthly',
    monthlyPrice: '$19',
    yearlyPrice: '$137',
    monthlyCaption: 'per month',
    yearlyCaption: 'per year',
    highlights: ['20 credits/month', '2 videos/month', 'No watermark', 'Standard support'],
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
    highlights: ['60 credits/month', '6 videos/month', 'No watermark', 'Priority support'],
    cta: 'Continue to Registration',
    checkoutUrl: studioMonthlyUrl, // fallback
    monthlyUrl: studioMonthlyUrl,
    yearlyUrl: studioYearlyUrl,
    metadata: { plan: 'studio', credits: 60 },
  },
];

const paymentMethods = ['Visa', 'Mastercard', 'American Express', 'Apple Pay', 'Google Pay'];

// Note: This component must clearly communicate ecommerce use cases (PDPs, ads, marketplaces).
// Do NOT frame this as influencer or creator-only UGC.
type ProofSlide = {
  id: string;
  productImage: string;
  realImage: string;
  productAlt: string;
  realAlt: string;
};

const PROOF_SLIDES: ProofSlide[] = [
  {
    id: '01-supplement',
    productImage: '/slider/01-product.jpg',
    realImage: '/slider/01-real.jpg',
    productAlt: 'Supplement bottle packshot on white background',
    realAlt: 'Person in a kitchen holding the same supplement bottle',
  },
  {
    id: '02-beverage',
    productImage: '/slider/02-product.jpg',
    realImage: '/slider/02-real.jpg',
    productAlt: 'Just Bubbles sparkling water can on wooden table',
    realAlt: 'Hand opening Just Bubbles can with colorful studio background',
  },
  {
    id: '03-food',
    productImage: '/slider/03-product.jpg',
    realImage: '/slider/03-real.jpg',
    productAlt: 'Snack pouch product shot on a clean surface',
    realAlt: 'Snack pouch on a lived-in table with hands nearby',
  },
  {
    id: '04-pet',
    productImage: '/slider/04-product.jpg',
    realImage: '/slider/04-real.jpg',
    productAlt: 'Pet product packshot on a neutral set',
    realAlt: 'Pet product used in a home environment setting',
  },
  {
    id: '05-health',
    productImage: '/slider/05-product.jpg',
    realImage: '/slider/05-real.jpg',
    productAlt: 'Health product packshot on white background',
    realAlt: 'Everyday person using the health product at home',
  },
  {
    id: '06-generic',
    productImage: '/slider/06-product.jpg',
    realImage: '/slider/06-real.jpg',
    productAlt: 'Generic ecommerce product shot',
    realAlt: 'Same product in a simple lifestyle context',
  },
];

// --- Advantage Grid Animation Components ---

const WeeksToMinutes = () => {
  const steps = ["Studio booking", "Talent", "Shoot", "Retouch", "Revisions"];
  return (
    <div className="relative h-24 w-full overflow-hidden flex flex-col justify-center">
      <div className="relative h-full">
        {steps.map((step, i) => (
          <motion.div
            key={step}
            variants={{
              initial: { opacity: 0.2, y: 0 },
              animate: {
                opacity: 0,
                y: -30,
                transition: { delay: i * 0.08, duration: 0.2, ease: [0.4, 0, 0.2, 1] }
              }
            }}
            className="text-[10px] uppercase font-bold tracking-widest text-gray-400 dark:text-gray-500 mb-1"
          >
            {step}
          </motion.div>
        ))}
        <motion.div
          className="absolute inset-x-0 top-0 pt-2"
          variants={{
            initial: { opacity: 0, y: 20 },
            animate: {
              opacity: 1,
              y: 0,
              transition: { delay: 0.5, duration: 0.3, ease: "easeOut" }
            }
          }}
        >
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">Generate → Launch-Ready</span>
            <div className="flex-1 h-0.5 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-indigo-600 dark:bg-indigo-400"
                variants={{
                  initial: { width: "0%" },
                  animate: { width: "100%", transition: { delay: 0.6, duration: 0.4 } }
                }}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const VisualSystem = () => {
  const channels = ["PDP", "Ads", "Amazon", "Social"];
  return (
    <div className="relative w-full h-48 flex items-center justify-center pointer-events-none">
      {/* Center Node */}
      <motion.div
        className="w-20 h-20 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-bold text-white text-center p-2 z-10 shadow-xl shadow-indigo-600/40"
        variants={{
          initial: { scale: 0.8, opacity: 0 },
          animate: { scale: 1, opacity: 1, transition: { duration: 0.4, ease: "easeOut" } }
        }}
      >
        Visual<br />System
      </motion.div>

      {/* Channels */}
      {channels.map((name, i) => {
        const positions = [
          { x: -85, y: -50 },
          { x: 85, y: -50 },
          { x: -85, y: 50 },
          { x: 85, y: 50 }
        ];
        const pos = positions[i];
        return (
          <React.Fragment key={name}>
            <motion.div
              className="absolute bg-white dark:bg-white/10 border border-gray-100 dark:border-white/20 px-3 py-1.5 rounded-lg text-[10px] font-black tracking-tighter shadow-sm"
              style={{ x: pos.x, y: pos.y }}
              variants={{
                initial: { opacity: 0, scale: 0.8 },
                animate: {
                  opacity: 1,
                  scale: 1,
                  transition: { delay: 0.4 + i * 0.08, duration: 0.3, ease: "easeOut" },
                  color: "#6366f1"
                }
              }}
            >
              {name}
            </motion.div>
            <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
              <motion.line
                x1="50%" y1="50%"
                x2={`calc(50% + ${pos.x}px)`} y2={`calc(50% + ${pos.y}px)`}
                stroke="#6366f1"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                variants={{
                  initial: { pathLength: 0, opacity: 0 },
                  animate: {
                    pathLength: 1,
                    opacity: 0.3,
                    transition: { delay: 0.3 + i * 0.08, duration: 0.5 }
                  }
                }}
              />
            </svg>
          </React.Fragment>
        );
      })}
    </div>
  );
};

const AntiRandomness = () => (
  <div className="relative w-full h-32 flex items-center justify-center overflow-hidden">
    <div className="relative">
      <motion.div
        className="text-5xl font-extrabold text-white/5 italic tracking-tighter"
        variants={{
          initial: { opacity: 0.5 },
          animate: { opacity: 0, transition: { delay: 0.5, duration: 0.2 } }
        }}
      >
        RANDOM
        <motion.div
          className="absolute top-1/2 left-[-10%] w-[120%] h-0.5 bg-red-500/30"
          variants={{
            initial: { scaleX: 0 },
            animate: { scaleX: 1, transition: { delay: 0.2, duration: 0.3 } }
          }}
        />
      </motion.div>
      <motion.div
        className="absolute inset-0 flex items-center justify-center text-indigo-400 font-bold tracking-widest text-3xl"
        variants={{
          initial: { opacity: 0, scale: 0.9, filter: "blur(12px)" },
          animate: {
            opacity: 1,
            scale: 1,
            filter: "blur(0px)",
            transition: { delay: 0.8, duration: 0.4, ease: "easeOut" }
          }
        }}
      >
        SYSTEM
        <motion.div
          className="absolute inset-0 bg-indigo-500/10 blur-3xl rounded-full"
          variants={{
            initial: { opacity: 0 },
            animate: { opacity: 1, transition: { delay: 1.0, duration: 0.6 } }
          }}
        />
      </motion.div>
    </div>
  </div>
);

const ScaleCatalog = () => (
  <div className="relative h-24 w-full flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-black/20 rounded-xl border border-gray-100 dark:border-white/5 shadow-inner">
    <div className="flex flex-col items-center">
      <motion.div
        className="text-2xl font-bold text-gray-300 dark:text-gray-700"
        variants={{
          initial: { opacity: 1, y: 0 },
          animate: { opacity: 0, y: -25, transition: { delay: 0.4, duration: 0.2 } }
        }}
      >
        1 SKU
      </motion.div>
      <motion.div
        className="absolute text-2xl font-bold text-gray-400"
        variants={{
          initial: { opacity: 0, y: 25 },
          animate: {
            opacity: [0, 1, 0],
            y: [25, 0, -25],
            transition: { delay: 0.55, duration: 0.4, times: [0, 0.5, 1] }
          }
        }}
      >
        10 SKUs
      </motion.div>
      <motion.div
        className="absolute text-2xl font-bold text-indigo-600 dark:text-indigo-400"
        variants={{
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0, transition: { delay: 0.9, duration: 0.3, ease: "easeOut" } }
        }}
      >
        100 SKUs
      </motion.div>
    </div>
  </div>
);

const BeforeAfterSlider: React.FC<{ slides: ProofSlide[] }> = ({ slides }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll animation
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let animationId: number;
    let scrollSpeed = 0.5;

    const scroll = () => {
      if (el.scrollLeft >= el.scrollWidth / 2) {
        el.scrollLeft = 0;
      } else {
        el.scrollLeft += scrollSpeed;
      }
      animationId = requestAnimationFrame(scroll);
    };

    animationId = requestAnimationFrame(scroll);

    const handleMouseEnter = () => { scrollSpeed = 0; };
    const handleMouseLeave = () => { scrollSpeed = 0.5; };
    el.addEventListener('mouseenter', handleMouseEnter);
    el.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      cancelAnimationFrame(animationId);
      el.removeEventListener('mouseenter', handleMouseEnter);
      el.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div className="relative w-full overflow-hidden">
      <div
        ref={scrollRef}
        className="flex gap-8 overflow-x-auto scrollbar-hide py-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* Duplicate for seamless loop */}
        {[...slides, ...slides].map((slide, index) => (
          <div
            key={`${slide.id}-${index}`}
            className="flex-shrink-0 flex gap-1"
          >
            {/* Before Image */}
            <div className="w-[180px] sm:w-[220px] lg:w-[260px]">
              <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-900">
                <img
                  src={slide.productImage}
                  alt={slide.productAlt}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute bottom-3 left-3">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-white/90 text-gray-700 backdrop-blur-sm">
                    Before
                  </span>
                </div>
              </div>
            </div>
            {/* After Image */}
            <div className="w-[180px] sm:w-[220px] lg:w-[260px]">
              <div className="relative aspect-[3/4] rounded-xl overflow-hidden">
                <img
                  src={slide.realImage}
                  alt={slide.realAlt}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute bottom-3 left-3">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-indigo-600 text-white">
                    After
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};


type LandingPageProps = {
  disableSeo?: boolean;
};

const LandingPage: React.FC<LandingPageProps> = ({ disableSeo = false }) => {
  const [activePreview, setActivePreview] = useState<
    'product' | 'ugc' | 'editorial' | 'background' | 'aesthetic'
  >('product');
  const [selectedPlan, setSelectedPlan] = useState<CheckoutPlan | null>(null);
  const [checkoutEmail, setCheckoutEmail] = useState('');
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [activeStep, setActiveStep] = useState(0);
  const [isHoveringSteps, setIsHoveringSteps] = useState(false);
  const [beforeAfterValues, setBeforeAfterValues] = useState<Record<string, number>>(() =>
    Object.fromEntries(beforeAfterSlides.map(slide => [slide.id, 50]))
  );
  const [beforeAfterView, setBeforeAfterView] = useState<Record<string, 'before' | 'after'>>(() =>
    Object.fromEntries(beforeAfterSlides.map(slide => [slide.id, 'after']))
  );
  const seo = {
    title: 'AI Product & Lifestyle Mockups for Ecommerce Brands | Perfect Mockup',
    description:
      'Generate premium product visuals, lifestyle scenes, and UGC-style ads in minutes. Built for ecommerce brands, growth teams, and product launches.',
    url: 'https://perfectmockup.com/',
    image: 'https://perfectmockup.com/preview.png',
  };
  const faqItems = [
    {
      question: 'What is Perfect Mockup?',
      answer:
        'Perfect Mockup is an AI product visual generator that creates premium product photography, lifestyle scenes, and UGC-style ads without photoshoots.',
    },
    {
      question: 'Can I use my existing product image?',
      answer:
        'Yes. Upload your existing product image and the system integrates it into professional micro-environments while preserving label accuracy.',
    },
    {
      question: 'How fast can I generate new visuals?',
      answer:
        'Most scenes generate in minutes. You can iterate quickly across product shots, lifestyle, and ad-ready variations.',
    },
    {
      question: 'Does Perfect Mockup replace a studio shoot?',
      answer:
        'It replaces many routine shoots by generating premium, campaign-ready scenes. You still own the output and can use it for ads, landing pages, and ecommerce.',
    },
    {
      question: 'What types of visuals can I create?',
      answer:
        'Product studio shots, lifestyle UGC, editorial lifestyle, background replacement, and branded ad assets with consistent styling.',
    },
  ];
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        name: 'Perfect Mockup',
        url: 'https://perfectmockup.com/',
        logo: 'https://perfectmockup.com/img/logos/colorlogo.svg',
      },
      {
        '@type': 'WebSite',
        name: 'Perfect Mockup',
        url: 'https://perfectmockup.com/',
      },
      {
        '@type': 'FAQPage',
        mainEntity: faqItems.map(item => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        })),
      },
    ],
  };

  const steps = [
    {
      title: 'Step 1 — Upload your product',
      description: 'Use your existing product image. No perfect photography required.',
      icon: <ShoppingBag className="w-5 h-5" />,
    },
    {
      title: 'Step 2 — Choose how it’s seen',
      description: 'Product (Studio) or Lifestyle. UGC or Editorial when lifestyle is selected.',
      icon: <Zap className="w-5 h-5" />,
    },
    {
      title: 'Step 3 — Generate mockups',
      description: 'Instant visuals ready for ecommerce, ads and social.',
      icon: <Users2 className="w-5 h-5" />,
    },
  ];

  useEffect(() => {
    if (isHoveringSteps) return;
    const interval = setInterval(() => {
      setActiveStep(current => (current + 1) % steps.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isHoveringSteps, steps.length]);

  useEffect(() => {
    if (disableSeo) return;
    document.title = seo.title;
    const setMeta = (key: string, content: string, attr: 'name' | 'property' = 'name') => {
      let element = document.querySelector(`meta[${attr}='${key}']`) as HTMLMetaElement | null;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attr, key);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };
    const setLink = (rel: string, href: string) => {
      let element = document.querySelector(`link[rel='${rel}']`) as HTMLLinkElement | null;
      if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', rel);
        document.head.appendChild(element);
      }
      element.setAttribute('href', href);
    };
    setMeta('description', seo.description);
    setMeta('og:title', seo.title, 'property');
    setMeta('og:description', seo.description, 'property');
    setMeta('og:url', seo.url, 'property');
    setMeta('og:image', seo.image, 'property');
    setMeta('twitter:title', seo.title);
    setMeta('twitter:description', seo.description);
    setMeta('twitter:image', seo.image);
    setLink('canonical', seo.url);
  }, [disableSeo, seo.title, seo.description, seo.url, seo.image]);

  const previewModes = [
    {
      id: 'product',
      title: 'Product (Studio)',
      description: 'Clean, professional product mockups. No people. No distractions.',
      image: '/images/home/Studio-Hero.webp',
    },
    {
      id: 'ugc',
      title: 'Lifestyle (UGC)',
      description: 'Natural, real-world scenes designed to feel authentic and conversion-focused.',
      image: '/images/home/Lifestyle-UGC.webp',
    },
    {
      id: 'editorial',
      title: 'Lifestyle (Editorial)',
      description: 'Curated, premium lifestyle visuals for brand storytelling and campaigns.',
      image: '/images/home/Lifestyle-editorial.webp',
    },
    {
      id: 'background',
      title: 'Background Replace',
      description: 'Replace backgrounds cleanly while preserving product details.',
      image: '/images/home/Background-Replace.webp',
    },
    {
      id: 'aesthetic',
      title: 'Aesthetic Builder',
      description: 'Create premium creative directions for ecommerce visuals.',
      image: '/images/home/Aesthetic-Builder.webp',
    },
  ] as const;

  const activePreviewMode = previewModes.find(mode => mode.id === activePreview) ?? previewModes[0];

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

  const handleBillingToggle = () => {
    setBillingCycle(prev => (prev === 'monthly' ? 'yearly' : 'monthly'));
  };

  const handleOpenCheckout = (plan: PricingPlan) => {
    const cadence = billingCycle === 'monthly' ? plan.monthlyCaption : `${plan.yearlyCaption} (annual)`;
    const price = billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
    const checkoutUrl =
      billingCycle === 'monthly' ? plan.monthlyUrl ?? plan.checkoutUrl : plan.yearlyUrl ?? plan.checkoutUrl;
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

  const handleConfirmCheckout = () => {
    if (!selectedPlan) return;
    if (!selectedPlan.checkoutUrl) {
      setCheckoutError(
        'Stripe payment link is not configured for this plan. Add VITE_STRIPE_LINK_CREATOR / VITE_STRIPE_LINK_STUDIO variables.'
      );
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

  const blogArticles = getAllBlogArticles().slice(0, 4);

  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-black dark:text-white transition-colors duration-500 overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <header className="relative min-h-[85vh] flex flex-col justify-center overflow-hidden border-b border-gray-100 dark:border-white/5 bg-white dark:bg-black">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.08),transparent_50%)] animate-pulse" />
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
              x: [0, 100, 0],
              y: [0, -50, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full"
          />
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.4, 0.2],
              x: [0, -120, 0],
              y: [0, 80, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-blue-500/10 blur-[120px] rounded-full"
          />
        </div>

        {/* Minimalist Background Grid */}
        <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.07]">
          <div className="h-full w-full" style={{ backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 flex flex-col items-center">
          {/* Factual Trust Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-wrap justify-center gap-x-8 gap-y-3 mb-12"
          >
            {[
              "Built for ecommerce product pages",
              "Product Mode and UGC Mode separated",
              "Consistent outputs at scale"
            ].map(statement => (
              <div key={statement} className="flex items-center gap-2 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500/50" />
                {statement}
              </div>
            ))}
          </motion.div>

          {/* SaaS Headline & Mechanism */}
          <div className="max-w-6xl mx-auto text-center space-y-8">
            <motion.h1
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
              className="text-5xl sm:text-7xl font-bold text-gray-900 dark:text-white leading-[1.05] tracking-tight text-balance"
            >
              Create Ecommerce-Ready Product Visuals <br className="hidden md:block" />
              <span className="text-indigo-600 dark:text-indigo-400">
                & Controlled UGC in Minutes.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed font-medium text-balance"
            >
              Generate consistent product shots and controlled UGC-style visuals for product pages, ads, and conversion funnels. No photoshoots. No agencies. No guessing.
            </motion.p>
          </div>

          {/* Focused Production CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12 w-full"
          >
            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-indigo-600 text-white px-10 py-5 font-bold text-sm transition-all hover:bg-indigo-700 shadow-xl shadow-indigo-600/20 hover:shadow-indigo-600/30 hover:-translate-y-0.5 active:scale-[0.98]"
            >
              Create Your First Product Shot
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
            <button
              onClick={handleSmoothScroll('#pricing')}
              className="relative w-full sm:w-auto inline-flex items-center justify-center px-8 py-5 font-bold text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors group"
            >
              View Plans
              <span className="absolute left-0 right-0 -bottom-1 h-0.5 origin-left scale-x-0 bg-indigo-600 dark:bg-indigo-400 transition-transform duration-300 group-hover:scale-x-100" />
            </button>
          </motion.div>
        </div>
      </header>

      {/* Before/After Slider Section */}
      <section className="relative bg-white dark:bg-black py-20 sm:py-28">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
          className="text-center space-y-4 mb-12 px-6"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-indigo-600 dark:text-indigo-400 font-semibold">
            The Transformation
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
            From product image to{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-indigo-400 dark:to-blue-400 bg-clip-text text-transparent">
              real-world magic
            </span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Upload your product photo. Get stunning lifestyle visuals ready for PDPs, ads, and social.
          </p>
        </motion.div>

        {/* Full-width Before/After Slider */}
        <BeforeAfterSlider slides={PROOF_SLIDES} />
      </section>

      <section className="bg-[#fafafa] dark:bg-white/[0.02]">
        <div className="max-w-6xl mx-auto px-6 py-24 space-y-10">
          <div className="text-center space-y-3">
            <p className="text-xs uppercase tracking-[0.3em] text-indigo-600">What you can create</p>
            <h2 className="text-3xl text-gray-900 dark:text-white font-semibold text-balance">Create the visuals your product needs to sell</h2>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {[
              {
                title: 'Product (Studio)',
                description:
                  'Clean, professional product mockups. No people. No distractions. Just your product, perfectly presented.',
                uses: ['Product pages', 'Marketplaces', 'Catalogs', 'Ads requiring clean shots'],
              },
              {
                title: 'Lifestyle (UGC)',
                description:
                  'Natural, real-world scenes with people interacting with your product. Designed to feel authentic and conversion-focused.',
                uses: ['Social ads', 'PDP galleries', 'Influencer-style content'],
              },
              {
                title: 'Lifestyle (Editorial)',
                description: 'Curated, premium lifestyle visuals for brand storytelling and campaigns.',
                uses: ['Launches', 'Brand pages', 'High-end campaigns'],
              },
            ].map(card => (
              <div
                key={card.title}
                className="rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 p-6 text-left space-y-4 hover:bg-indigo-50/30 dark:hover:bg-indigo-500/5 transition-colors duration-300"
              >
                <div className="space-y-2">
                  <p className="text-gray-900 dark:text-white text-lg font-semibold">{card.title}</p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{card.description}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-widest text-gray-500 dark:text-gray-500">Use for</p>
                  <ul className="space-y-2 text-sm text-gray-900 dark:text-gray-300">
                    {card.uses.map(item => (
                      <li key={item} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white dark:bg-black">
        <div className="max-w-6xl mx-auto px-6 py-16 space-y-10">
          <div className="text-center space-y-3">
            <p className="text-xs uppercase tracking-[0.3em] text-indigo-600">Preview</p>
            <h2 className="text-3xl text-gray-900 font-semibold text-balance">See what you can create</h2>
            <p className="text-gray-600 max-w-3xl mx-auto mt-3">
              Choose Product or Lifestyle to match your goal. UGC feels authentic. Editorial feels premium.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[340px,1fr] items-start lg:items-stretch">
            <div className="space-y-3">
              {previewModes.map(mode => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setActivePreview(mode.id)}
                  className={`w-full text-left rounded-xl border p-4 transition-all duration-300 ${activePreview === mode.id
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/20'
                    : 'border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/10'
                    }`}
                >
                  <p className={`font-semibold transition-colors ${activePreview === mode.id ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{mode.title}</p>
                  <p className={`text-sm mt-1 transition-colors ${activePreview === mode.id ? 'text-white/80' : 'text-gray-600 dark:text-gray-400'}`}>
                    {mode.description}
                  </p>
                </button>
              ))}
            </div>

            <div className="relative overflow-hidden rounded-xl border border-gray-100 bg-white min-h-[320px] sm:min-h-[420px] lg:min-h-0 lg:h-full">
              <img
                src={activePreviewMode.image}
                alt={activePreviewMode.title}
                className="h-full w-full object-cover"
                loading="lazy"
              />
              <div className="absolute bottom-4 left-4 right-4 rounded-xl bg-white/90 backdrop-blur-sm border border-gray-100 px-4 py-3 text-sm">
                <p className="text-gray-900 font-semibold">{activePreviewMode.title}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <TestimonialsSection />

      <section id="how-it-works" className="bg-[#fafafa] dark:bg-white/[0.02] overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 py-20 space-y-12">
          <div className="text-center space-y-3">
            <p className="text-xs uppercase tracking-[0.3em] text-indigo-600">How it works</p>
            <h2 className="text-3xl sm:text-4xl text-gray-900 font-bold tracking-tight text-balance">From product to visuals in minutes</h2>
          </div>

          <div className="grid gap-12 lg:grid-cols-2 items-center">
            {/* Left Side: Step Cards */}
            <div
              className="space-y-4"
              onMouseEnter={() => setIsHoveringSteps(true)}
              onMouseLeave={() => setIsHoveringSteps(false)}
            >
              {steps.map((step, index) => {
                const isActive = activeStep === index;
                return (
                  <button
                    key={index}
                    onClick={() => setActiveStep(index)}
                    className={`w-full text-left p-6 rounded-xl border transition-all duration-500 relative overflow-hidden group ${isActive
                      ? 'bg-white dark:bg-white/10 border-indigo-100 dark:border-indigo-500/30'
                      : 'bg-transparent border-transparent hover:bg-gray-50 dark:hover:bg-white/5'
                      }`}
                  >
                    {isActive && (
                      <div className="absolute bottom-0 left-0 h-1 bg-indigo-600 animate-[progress_5s_linear_infinite]" />
                    )}
                    <div className="flex gap-4">
                      <div className={`mt-1 flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-500 ${isActive ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-gray-500 group-hover:bg-gray-200 dark:group-hover:bg-white/10'
                        }`}>
                        {step.icon}
                      </div>
                      <div className="space-y-1">
                        <h3 className={`text-lg font-bold transition-colors duration-500 ${isActive ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                          {step.title}
                        </h3>
                        <p className={`text-sm leading-relaxed transition-colors duration-500 ${isActive ? 'text-gray-600 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'}`}>
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right Side: Visual Sandbox */}
            <div className="relative aspect-square sm:aspect-video lg:aspect-square bg-white dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10 overflow-hidden shadow-inner">
              {/* Visual Step 1: Upload */}
              <div className={`absolute inset-0 p-8 flex flex-col items-center justify-center transition-all duration-700 ${activeStep === 0 ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-95 pointer-events-none'
                }`}>
                <div className="w-full max-w-sm aspect-square bg-white border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-4 relative overflow-hidden group">
                  <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 animate-bounce">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <p className="text-sm font-semibold text-gray-900">Drop your product photo here</p>
                  <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  {/* Simulated pulse effect */}
                  <div className="absolute inset-x-8 bottom-8 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600 w-full origin-left animate-[loading_2s_ease-in-out_infinite]" />
                  </div>
                </div>
              </div>

              {/* Visual Step 2: Choose */}
              <div className={`absolute inset-0 p-8 flex flex-col items-center justify-center transition-all duration-700 ${activeStep === 1 ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-95 pointer-events-none'
                }`}>
                <div className="w-full max-w-sm space-y-6">
                  <div className="bg-white p-4 rounded-xl border border-gray-100 grid grid-cols-2 gap-3">
                    <div className="aspect-square rounded-2xl bg-indigo-600 flex flex-col items-center justify-center text-white gap-2 border-4 border-indigo-200">
                      <Zap className="w-8 h-8" />
                      <span className="text-xs font-bold uppercase tracking-widest text-white/90">Lifestyle</span>
                    </div>
                    <div className="aspect-square rounded-2xl bg-gray-50 flex flex-col items-center justify-center text-gray-400 gap-2 grayscale">
                      <ShoppingBag className="w-8 h-8" />
                      <span className="text-xs font-bold uppercase tracking-widest">Studio</span>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between">
                    <span className="text-xs font-bold tracking-widest uppercase text-gray-400">Atmosphere</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map(i => <div key={i} className={`w-6 h-6 rounded-lg ${i === 1 ? 'bg-indigo-600' : 'bg-gray-100'}`} />)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Visual Step 3: Generate */}
              <div className={`absolute inset-0 p-8 flex flex-col items-center justify-center transition-all duration-700 ${activeStep === 2 ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-95 pointer-events-none'
                }`}>
                <div className="w-full max-w-sm aspect-square relative rounded-xl overflow-hidden group">
                  <img
                    src="/images/home/Lifestyle-UGC.webp"
                    alt="UGC Mockup"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-6">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                      <span className="text-xs font-bold text-white uppercase tracking-widest">Visual Generated</span>
                    </div>
                  </div>
                  {/* Scanner animation */}
                  <div className="absolute inset-x-0 top-0 h-1 bg-indigo-400 shadow-lg shadow-indigo-400/50 animate-[scan_3s_ease-in-out_infinite]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bento: Product vs Lifestyle */}
      <section className="bg-white dark:bg-black py-24 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 space-y-16">
          <div className="text-center space-y-4">
            <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] uppercase font-bold tracking-[0.2em] border border-indigo-100/50">
              Core Philosophy
            </span>
            <h2 className="text-4xl md:text-5xl text-gray-900 font-bold tracking-tight text-balance">Two modes. One visual system.</h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg leading-relaxed">
              Product and Lifestyle never mix. You always control the intent before generating.
            </p>
          </div>

          <div className="grid lg:grid-cols-12 gap-6 h-full lg:h-[480px]">
            {/* Studio Mode Card */}
            <div className="lg:col-span-12 xl:col-span-5 bg-gray-900 rounded-xl overflow-hidden relative group border border-gray-800">
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
              <img
                src="/images/home/Studio-Hero.webp"
                alt="Studio Mode"
                className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-x-0 bottom-0 p-8 z-20 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                  <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-[0.2em]">PDP Ready</span>
                </div>
                <h3 className="text-2xl font-bold text-white text-balance">Product (Studio)</h3>
                <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
                  Use when clarity and control matter. Perfect for marketplaces, catalogs, and clean e-commerce listings.
                </p>
              </div>
            </div>

            {/* Lifestyle Mode Card */}
            <div className="lg:col-span-12 xl:col-span-7 bg-indigo-600 rounded-xl overflow-hidden relative group border border-indigo-500">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900/60 to-indigo-500/20 z-10" />
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
              <img
                src="/images/home/Lifestyle-UGC.webp"
                alt="Lifestyle Mode"
                className="absolute inset-0 w-full h-full object-cover opacity-50 blur-[2px] group-hover:blur-0 transition-all duration-700"
              />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] aspect-video bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl z-20 overflow-hidden group/mini">
                <div className="absolute inset-0 p-6 flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                    <div className="px-3 py-1.5 bg-white rounded-lg text-gray-900 text-[10px] font-bold inline-flex items-center gap-2 shadow-sm">
                      <Users2 className="w-3.5 h-3.5 text-indigo-600" />
                      AI Intent Analysis
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[10px] text-white/60 font-medium font-mono">Control: UGC Alpha</span>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map(i => <div key={i} className="w-1 h-3 bg-indigo-400 rounded-full" />)}
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 grid grid-cols-2 gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                    <div className="space-y-2">
                      {[
                        { label: 'Person', value: 'Woman, 25-30' },
                        { label: 'Expression', value: 'Natural Smile' },
                        { label: 'Action', value: 'Holding Product' }
                      ].map(tag => (
                        <div key={tag.label} className="bg-black/20 border border-white/10 p-2 rounded-lg backdrop-blur-sm">
                          <p className="text-[8px] text-white/40 uppercase font-bold tracking-widest">{tag.label}</p>
                          <p className="text-[10px] text-white font-medium">{tag.value}</p>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-2 translate-y-4">
                      {[
                        { label: 'Lighting', value: 'Golden Hour' },
                        { label: 'Focus', value: 'Product First' },
                        { label: 'Mood', value: 'Authentic' }
                      ].map(tag => (
                        <div key={tag.label} className="bg-indigo-500/20 border border-indigo-400/20 p-2 rounded-lg backdrop-blur-sm">
                          <p className="text-[8px] text-white/40 uppercase font-bold tracking-widest">{tag.label}</p>
                          <p className="text-[10px] text-white font-medium">{tag.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute inset-x-0 bottom-0 p-8 z-30 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  <span className="text-[10px] text-white/80 font-bold uppercase tracking-[0.2em]">Conversion Focus</span>
                </div>
                <h3 className="text-2xl font-bold text-white text-balance">Lifestyle (UGC & Editorial)</h3>
                <p className="text-indigo-100 text-sm leading-relaxed max-w-md">
                  Use when context and emotion drive conversion. Choose UGC for authenticity or Editorial for brand polish.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bento: The Advantage Grid */}
      {/* Why Perfect Mockup: Advantage Grid */}
      <section className="bg-[#fafafa] dark:bg-white/[0.02] py-24 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 space-y-16">
          <div className="text-center space-y-4">
            <span className="text-indigo-600 dark:text-indigo-400 text-[10px] font-bold uppercase tracking-[0.3em]">Why Perfect Mockup</span>
            <h2 className="text-4xl md:text-5xl text-gray-900 dark:text-white font-bold tracking-tight text-balance">
              Built as a Visual System, Not a Generator
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed font-medium">
              Designed for ecommerce teams that need speed, consistency, and control.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Card 1: Time */}
            <motion.div
              initial="initial"
              whileHover="animate"
              whileInView="animate"
              viewport={{ once: true, amount: 0.5 }}
              className="bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 p-8 flex flex-col justify-between group min-h-[320px] shadow-sm"
            >
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white text-balance">From Weeks to Minutes</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                  Skip studios, scheduling, talent, and retouching. Generate launch-ready visuals the moment your product is ready.
                </p>
              </div>
              <WeeksToMinutes />
            </motion.div>

            {/* Card 2: System (Large) */}
            <motion.div
              initial="initial"
              whileHover="animate"
              whileInView="animate"
              viewport={{ once: true, amount: 0.5 }}
              className="md:col-span-2 bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 p-8 flex flex-col md:flex-row gap-8 items-center min-h-[320px] shadow-sm"
            >
              <div className="flex-1 space-y-4">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-balance">One Visual System. Every Channel.</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                  The same product logic drives visuals across product pages, ads, marketplaces, and paid social, so nothing drifts off-spec.
                </p>
                <div className="pt-6 border-t border-gray-100 dark:border-white/10">
                  <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em]">Change the rules once. Update everything.</p>
                </div>
              </div>
              <div className="flex-1 w-full flex items-center justify-center">
                <VisualSystem />
              </div>
            </motion.div>

            {/* Card 3: Control (Large Dark) */}
            <motion.div
              initial="initial"
              whileHover="animate"
              whileInView="animate"
              viewport={{ once: true, amount: 0.5 }}
              className="md:col-span-2 bg-gray-900 dark:bg-white/[0.03] rounded-2xl p-8 flex flex-col md:flex-row gap-8 items-center min-h-[320px] border border-gray-800 dark:border-white/10 shadow-2xl"
            >
              <div className="flex-1 space-y-4">
                <div className="inline-flex px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[9px] font-bold uppercase tracking-widest mb-2">
                  SYSTEM CORE
                </div>
                <h3 className="text-2xl font-bold text-white text-balance">Decisions In. Not Randomness Out.</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Perfect Mockup uses structured inputs, strict modes, and composition rules so every image matches its ecommerce use case.
                </p>
              </div>
              <div className="flex-1 w-full flex items-center justify-center">
                <AntiRandomness />
              </div>
            </motion.div>

            {/* Card 4: Scale */}
            <motion.div
              initial="initial"
              whileHover="animate"
              whileInView="animate"
              viewport={{ once: true, amount: 0.5 }}
              className="bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 p-8 flex flex-col justify-between min-h-[320px] shadow-sm"
            >
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white text-balance">Built to Scale With Your Catalog</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                  From your first SKU to hundreds of products, generate consistent visuals without increasing production overhead.
                </p>
              </div>
              <ScaleCatalog />
            </motion.div>
          </div>

          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xs font-medium text-gray-500/80 dark:text-gray-400/50 uppercase tracking-widest">
              Product visuals and UGC-style visuals are generated using separate modes to keep outputs ecommerce-safe.
            </p>
          </div>
        </div>
      </section>

      {/* Sophisticated Audience Cluster */}
      <section className="bg-white dark:bg-black py-24">
        <div className="max-w-6xl mx-auto px-6 space-y-12">
          <div className="text-center space-y-4">
            <span className="text-indigo-600 text-[10px] font-bold uppercase tracking-[0.3em]">Perfect for Teams</span>
            <h2 className="text-3xl font-bold text-gray-900 text-balance">Designed for the modern ecommerce ecosystem</h2>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-4 max-w-4xl mx-auto">
            {[
              { label: 'DTC Brands', weight: 'font-extrabold', size: 'text-2xl', color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-100' },
              { label: 'Founders', weight: 'font-semibold', size: 'text-xl', color: 'text-gray-900', bg: 'bg-gray-50 border-gray-200' },
              { label: 'Marketing Teams', weight: 'font-bold', size: 'text-lg', color: 'text-indigo-600/80', bg: 'bg-indigo-50/50 border-indigo-100/50' },
              { label: 'Creative Agencies', weight: 'font-medium', size: 'text-2xl', color: 'text-gray-900', bg: 'bg-gray-50 border-gray-200' },
              { label: 'Performance Marketers', weight: 'font-bold', size: 'text-xl', color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-100' },
              { label: 'UX Designers', weight: 'font-normal', size: 'text-lg', color: 'text-gray-400', bg: 'bg-transparent border-gray-100' },
              { label: 'Store Managers', weight: 'font-semibold', size: 'text-lg', color: 'text-gray-900', bg: 'bg-gray-50 border-gray-200' },
            ].map((item, i) => (
              <div
                key={item.label}
                className={`px-6 py-4 rounded-full border transition-all hover:scale-105 cursor-default flex items-center gap-3 ${item.bg} ${item.color} ${item.weight} ${item.size}`}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                {item.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#fafafa] dark:bg-white/[0.02]">
        <div className="max-w-6xl mx-auto px-6 py-24 space-y-10">
          <div className="text-center space-y-3">
            <p className="text-xs uppercase tracking-[0.3em] text-indigo-600 dark:text-indigo-400">Resources</p>
            <h2 className="text-3xl text-gray-900 dark:text-white font-semibold text-balance">Latest from our Blog</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mt-3">
              Insights, guides, and tactics to help you win with AI-driven visuals.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {blogArticles.map(article => (
              <Link
                key={article.slug}
                to={`/blog/${article.slug}`}
                className="group flex flex-col rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:bg-gray-50 dark:hover:bg-white/10"
              >
                <div className="aspect-video w-full bg-gray-100 dark:bg-black/20 relative overflow-hidden">
                  <img
                    src={article.heroImage.url || `/blog/heroes/${article.slug}.webp`}
                    alt={article.heroImage.alt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <div className="flex-1 p-5 space-y-3">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white leading-tight transition-colors duration-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                    {article.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                    {article.subtitle}
                  </p>
                  <div className="mt-auto pt-4 flex items-center gap-1 text-sm font-medium text-indigo-600 dark:text-indigo-400">
                    Read article <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              to="/blog"
              className="inline-flex items-center justify-center rounded-full border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/10 transition-all duration-300"
            >
              View All Articles
            </Link>
          </div>
        </div>
      </section>

      <section id="faq" className="bg-white dark:bg-black py-24 border-b border-gray-100 dark:border-white/5">
        <div className="max-w-5xl mx-auto px-6 space-y-12">
          <div className="text-center space-y-3">
            <p className="text-xs uppercase tracking-[0.3em] text-indigo-600">FAQ</p>
            <h2 className="text-3xl sm:text-4xl text-gray-900 dark:text-white font-bold tracking-tight text-balance">
              Answers for ecommerce teams
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Clear guidance on how Perfect Mockup works and where it fits in your launch stack.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {faqItems.map((item) => (
              <div
                key={item.question}
                className="rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 p-6 space-y-3"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{item.question}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="bg-white dark:bg-black relative isolate py-24 px-6 border-b border-gray-100 dark:border-white/5">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <span className="text-indigo-600 text-[10px] font-bold uppercase tracking-[0.3em]">Scalable Pricing</span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight text-balance">Plans built for launch velocity</h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg leading-relaxed">
              Scale your visuals as your products and campaigns grow. No hidden fees.
            </p>

            <div className="mt-8 flex justify-center">
              <div className="relative inline-flex items-center p-1 bg-gray-100/50 rounded-full border border-gray-200/50 min-w-[420px] isolation-auto h-12">
                {/* Sliding background */}
                <div
                  className={`absolute inset-y-1 w-[calc(50%-4px)] rounded-full transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) shadow-md ${billingCycle === 'monthly' ? 'left-1 bg-white' : 'left-[50%] bg-indigo-600'
                    }`}
                />
                <button
                  onClick={() => billingCycle === 'yearly' && handleBillingToggle()}
                  className={`flex-1 relative z-10 px-6 h-full rounded-full text-[12px] font-bold transition-colors duration-300 flex items-center justify-center whitespace-nowrap ${billingCycle === 'monthly' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                  Billed monthly
                </button>
                <button
                  onClick={() => billingCycle === 'monthly' && handleBillingToggle()}
                  className={`flex-1 relative z-10 px-6 h-full rounded-full text-[12px] font-bold transition-colors duration-300 flex items-center justify-center gap-3 whitespace-nowrap ${billingCycle === 'yearly' ? 'text-white' : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                  Billed yearly
                  <span className={`px-2 py-0.5 rounded-md text-[10px] uppercase font-black tracking-wider transition-all duration-300 ${billingCycle === 'yearly' ? 'bg-white/20 text-white' : 'bg-indigo-100 text-indigo-600 shadow-sm'
                    }`}>
                    Save 20%
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {pricing.map(plan => {
              const isYearly = billingCycle === 'yearly';
              const cadenceLabel = isYearly ? plan.yearlyCaption : plan.monthlyCaption;
              const displayedPrice = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
              const isFeatured = plan.featured;

              return (
                <article
                  key={plan.name}
                  className={`relative rounded-xl p-8 flex flex-col gap-8 transition-all duration-500 ease-out border ${isFeatured
                    ? 'bg-gray-900 border-gray-800 scale-[1.02] z-10'
                    : 'bg-white dark:bg-white/5 border-gray-100 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10'
                    }`}
                >
                  {isFeatured && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full ring-4 ring-white">
                      Most Popular
                    </div>
                  )}

                  <header className="space-y-4">
                    <p className={`text-sm font-bold uppercase tracking-widest ${isFeatured ? 'text-indigo-400' : 'text-gray-500'}`}>
                      {plan.name}
                    </p>
                    <div className="flex items-baseline gap-1">
                      <span className={`text-5xl font-extrabold tracking-tight ${isFeatured ? 'text-white' : 'text-gray-900'}`}>
                        {displayedPrice}
                      </span>
                      <span className={`text-sm font-medium ${isFeatured ? 'text-gray-400' : 'text-gray-500'}`}>
                        / {isYearly ? 'year' : 'mo'}
                      </span>
                    </div>
                    <p className={`text-xs font-medium leading-relaxed ${isFeatured ? 'text-indigo-200/50' : 'text-gray-400'}`}>
                      {cadenceLabel}
                    </p>
                  </header>

                  <ul className="space-y-4 flex-1">
                    {plan.highlights.map(item => (
                      <li key={item} className="flex items-start gap-3">
                        <CheckCircle2 className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isFeatured ? 'text-indigo-400' : 'text-indigo-600'}`} />
                        <span className={`text-sm ${isFeatured ? 'text-gray-300' : 'text-gray-600'}`}>{item}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="pt-4 mt-auto">
                    {(() => {
                      const targetUrl = isYearly
                        ? plan.yearlyUrl || plan.monthlyUrl || plan.checkoutUrl
                        : plan.monthlyUrl || plan.checkoutUrl || plan.yearlyUrl;

                      if (plan.isFree) {
                        return (
                          <Link
                            to="/login"
                            className="block w-full text-center px-6 py-4 rounded-xl border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white font-bold text-sm hover:bg-gray-50 dark:hover:bg-white/10 transition-colors"
                          >
                            {plan.cta}
                          </Link>
                        );
                      }

                      return (
                        <a
                          href={targetUrl || '#'}
                          className={`block w-full text-center px-6 py-4 rounded-xl font-bold text-sm transition ${isFeatured
                            ? 'bg-white text-gray-900 hover:bg-gray-100'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700'
                            }`}
                        >
                          {plan.cta}
                        </a>
                      );
                    })()}
                  </div>
                </article>
              );
            })}
          </div>

          <p className="text-center text-sm text-gray-600">
            1 credit equals 1 image generation in Fast Mode. PRO mode consumes 3 credits per execution.
          </p>

          {selectedPlan && (
            <PlanCheckoutModal
              plan={selectedPlan}
              email={checkoutEmail}
              onEmailChange={setCheckoutEmail}
              onClose={handleCloseCheckout}
              onConfirm={handleConfirmCheckout}
              disabledReason={
                !selectedPlan.checkoutUrl
                  ? 'Stripe payment link missing. Configure VITE_STRIPE_LINK variables.'
                  : checkoutError
              }
            />
          )}

          <div className="flex flex-col items-center gap-3 text-sm text-gray-600">
            <div className="inline-flex items-center gap-2 text-gray-600 font-medium">
              <CreditCard className="w-4 h-4 text-indigo-600" />
              Payments processed by Stripe
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {paymentMethods.map(method => (
                <span
                  key={method}
                  className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs text-gray-600"
                >
                  {method}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gray-900 dark:bg-white/[0.03] py-24 text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-4xl md:text-5xl text-white font-bold tracking-tight text-balance">
            Launch Products with Visuals That Convert
          </h2>
          <p className="mt-6 text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Create ecommerce-ready product and lifestyle mockups for ads, product pages, and social. No photoshoots required.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-xl bg-indigo-600 text-white px-10 py-5 font-bold text-sm transition-all hover:bg-indigo-700 shadow-xl shadow-indigo-600/20 hover:shadow-indigo-600/30 hover:-translate-y-0.5 active:scale-[0.98]"
            >
              Start Creating Mockups
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
            <button
              onClick={handleSmoothScroll('#pricing')}
              className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-10 py-5 font-bold text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-all"
            >
              View Pricing
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;

function BeforeAfterCard({
  slide,
  value,
  view,
  onChange,
  onViewChange,
}: {
  slide: BeforeAfterSlide;
  value: number;
  view: 'before' | 'after';
  onChange: (next: number) => void;
  onViewChange: (next: 'before' | 'after') => void;
}) {
  const safeValue = Math.max(0, Math.min(100, value));
  return (
    <div className="rounded-3xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-3 md:p-4">
      <div className="md:hidden space-y-3">
        <div className="flex items-center justify-center gap-2">
          {(['before', 'after'] as const).map(option => (
            <button
              key={option}
              type="button"
              onClick={() => onViewChange(option)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                view === option
                  ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                  : 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300'
              }`}
            >
              {option === 'before' ? 'Before' : 'After'}
            </button>
          ))}
        </div>
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-gray-100 dark:bg-white/10">
          <img
            src={view === 'before' ? slide.before : slide.after}
            alt={slide.alt}
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
            draggable={false}
          />
          <span className="absolute left-3 top-3 rounded-full bg-white/85 px-3 py-1 text-[10px] font-semibold text-gray-700 uppercase tracking-widest">
            {view === 'before' ? 'Before' : 'After'}
          </span>
        </div>
      </div>
      <div className="hidden md:block">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-gray-100 dark:bg-white/10">
          <img
            src={slide.before}
            alt={slide.alt}
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
            draggable={false}
          />
          <div className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${safeValue}%` }}>
            <img
              src={slide.after}
              alt={slide.alt}
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
              draggable={false}
            />
          </div>
          <div className="pointer-events-none absolute inset-y-0" style={{ left: `${safeValue}%` }}>
            <div className="absolute inset-y-0 -translate-x-1/2 w-[2px] bg-white/90" />
            <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 h-10 w-10 rounded-full border border-white bg-gray-900/40 backdrop-blur-sm" />
          </div>
          <div className="absolute left-3 top-3 rounded-full bg-white/85 px-3 py-1 text-[10px] font-semibold text-gray-700 uppercase tracking-widest">
            Before
          </div>
          <div className="absolute right-3 top-3 rounded-full bg-white/85 px-3 py-1 text-[10px] font-semibold text-gray-700 uppercase tracking-widest">
            After
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={safeValue}
            onChange={(event) => onChange(Number(event.target.value))}
            aria-label="Before and after comparison"
            className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
          />
        </div>
      </div>
    </div>
  );
}
