import React, { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, CreditCard, ShieldCheck, ShoppingBag, Users2, Zap } from 'lucide-react';
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

const getEnv = (key: string) => import.meta.env[key as keyof ImportMetaEnv] as string | undefined;
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

const LandingPage: React.FC = () => {
  const [activePreview, setActivePreview] = useState<
    'product' | 'ugc' | 'editorial' | 'background' | 'aesthetic'
  >('product');
  const [selectedPlan, setSelectedPlan] = useState<CheckoutPlan | null>(null);
  const [checkoutEmail, setCheckoutEmail] = useState('');
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

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

  return (
    <div className="min-h-screen bg-bg text-gray-900">
      <div className="bg-gray-50">
        <nav className="relative z-10 max-w-6xl mx-auto px-6 py-8 flex items-center justify-between">
          <div className="text-sm font-semibold uppercase tracking-[0.3em] text-gray-900">Perfect Mockup</div>
        </nav>

        <header className="relative overflow-hidden pb-16">
          <div
            className="absolute inset-0 opacity-30 pointer-events-none"
            style={{
              background:
                'radial-gradient(circle at 20% 20%, var(--accent-glow), transparent 55%)',
            }}
          />
          <div className="max-w-6xl mx-auto px-6 pt-6 pb-10 flex flex-col items-center text-center gap-10 relative">
            <div className="max-w-3xl space-y-6">
              <p className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-1 text-xs uppercase tracking-widest text-indigo-600">
                <ShieldCheck className="w-3.5 h-3.5" /> A visual mockup system for ecommerce brands
              </p>
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight">
                Product &amp; Lifestyle Mockups for Ecommerce Brands
              </h1>
              <p className="text-lg text-gray-600">
                Create studio-ready product visuals and lifestyle scenes without photoshoots. From clean product shots to
                UGC-style content, fully controlled.
              </p>
              <p className="text-sm text-gray-600">
                No freelancers. No creative chaos. Just visuals built to convert.
              </p>
              <div className="flex flex-wrap justify-center gap-3 text-sm text-gray-600">
                {[
                  'Built for ecommerce, not designers',
                  'Product and lifestyle visuals in one system',
                  'Ready for PDPs, ads and launches',
                  'Consistent results at scale',
                ].map(item => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1"
                  >
                    <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-8 py-4 font-semibold text-white shadow-md shadow-md shadow-indigo-500/20 hover:bg-indigo-600 transition"
              >
                Start Creating Mockups
              </Link>
              <button
                onClick={handleSmoothScroll('#pricing')}
                className="inline-flex items-center justify-center rounded-full border border-gray-200 px-8 py-4 font-semibold text-gray-600 hover:border-indigo-600 hover:text-gray-900 transition"
              >
                View Pricing
              </button>
            </div>
          </div>
        </header>
      </div>

      <main>
        <section className="max-w-6xl mx-auto px-6 py-14 space-y-10">
          <div className="text-center space-y-3">
            <p className="text-xs uppercase tracking-[0.3em] text-indigo-600">What you can create</p>
            <h2 className="text-3xl text-gray-900 font-semibold">Create the visuals your product needs to sell</h2>
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
                className="rounded-2xl border border-gray-200 bg-gray-50 p-6 text-left space-y-4"
              >
                <div className="space-y-2">
                  <p className="text-gray-900 text-lg font-semibold">{card.title}</p>
                  <p className="text-gray-600 text-sm leading-relaxed">{card.description}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-widest text-gray-500">Use for</p>
                  <ul className="space-y-2 text-sm text-gray-900">
                    {card.uses.map(item => (
                      <li key={item} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-gray-50 border-y border-gray-200">
          <div className="max-w-6xl mx-auto px-6 py-16 space-y-10">
            <div className="text-center space-y-3">
              <p className="text-xs uppercase tracking-[0.3em] text-indigo-600">Preview</p>
              <h2 className="text-3xl text-gray-900 font-semibold">See what you can create</h2>
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
                    className={`w-full text-left rounded-2xl border p-4 transition ${
                      activePreview === mode.id
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-indigo-600'
                    }`}
                  >
                    <p className="font-semibold">{mode.title}</p>
                    <p className="text-sm text-gray-600 mt-1">{mode.description}</p>
                  </button>
                ))}
              </div>

              <div className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white min-h-[320px] sm:min-h-[420px] lg:min-h-0 lg:h-full">
                <img
                  src={activePreviewMode.image}
                  alt={activePreviewMode.title}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
	                <div className="absolute bottom-4 left-4 right-4 rounded-2xl bg-gray-50 px-4 py-3 text-sm">
	                  <p className="text-gray-900 font-semibold">{activePreviewMode.title}</p>
	                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 py-14 space-y-10">
          <div className="text-center space-y-3">
            <p className="text-xs uppercase tracking-[0.3em] text-indigo-600">How it works</p>
            <h2 className="text-3xl text-gray-900 font-semibold">From product to visuals in minutes</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                title: 'Step 1 — Upload your product',
                description: 'Use your existing product image. No perfect photography required.',
              },
              {
                title: 'Step 2 — Choose how it’s seen',
                description: 'Product (Studio) or Lifestyle. UGC or Editorial when lifestyle is selected.',
              },
              {
                title: 'Step 3 — Generate mockups',
                description: 'Instant visuals ready for ecommerce, ads and social.',
              },
            ].map((card, index) => (
              <div
                key={card.title}
                className="rounded-2xl border border-gray-200 bg-gray-50 p-5 text-left transition transform hover:-translate-y-1 hover:border-indigo-600"
                style={{ animationDelay: `${0.1 * (index + 1)}s` }}
              >
                <p className="text-xs uppercase tracking-widest text-gray-500">{card.title}</p>
                <p className="mt-3 text-gray-600">{card.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-gray-50 border-y border-gray-200">
          <div className="max-w-6xl mx-auto px-6 py-16 space-y-10">
            <div className="text-center space-y-3">
              <p className="text-xs uppercase tracking-[0.3em] text-indigo-600">Product vs lifestyle</p>
              <h2 className="text-3xl text-gray-900 font-semibold">Two modes. One visual system.</h2>
              <p className="text-gray-600 max-w-3xl mx-auto mt-3">
                Product and Lifestyle never mix. You always control the intent before generating.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 text-left space-y-3">
                <p className="text-gray-900 text-lg font-semibold">Product (Studio)</p>
                <p className="text-gray-600 text-sm">
                  Use when clarity and control matter. Perfect for PDPs, marketplaces and catalogs.
                </p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 text-left space-y-3">
                <p className="text-gray-900 text-lg font-semibold">Lifestyle</p>
                <p className="text-gray-600 text-sm">
                  Use when context and emotion drive conversion. Choose UGC for authenticity or Editorial for polish.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 py-14 space-y-10">
          <div className="text-center space-y-3">
            <p className="text-xs uppercase tracking-[0.3em] text-indigo-600">Why brands use Perfect Mockup</p>
            <h2 className="text-3xl text-gray-900 font-semibold">Built for product brands that move fast</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              'Faster launches without photoshoots',
              'Consistent visuals across channels',
              'No dependency on freelancers',
              'Clear separation between product and lifestyle visuals',
              'Scales from one SKU to full catalogs',
            ].map(item => (
              <div
                key={item}
                className="rounded-2xl border border-gray-200 bg-gray-50 p-5 flex items-start gap-3"
              >
                <Zap className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                <p className="text-gray-900 text-sm leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 py-14 space-y-10">
          <div className="text-center space-y-3">
            <p className="text-xs uppercase tracking-[0.3em] text-indigo-600">Why Perfect Mockup is different</p>
            <h2 className="text-3xl text-gray-900 font-semibold">Not another image generator</h2>
            <p className="text-gray-600 max-w-3xl mx-auto mt-3">
              Perfect Mockup is a visual decision system, not a random generator.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              'Intent comes before generation',
              'Product and lifestyle are never confused',
              'Visuals are designed for commerce outcomes',
              'Built specifically for ecommerce workflows',
            ].map(item => (
              <div
                key={item}
                className="rounded-2xl border border-gray-200 bg-gray-50 p-5 flex items-start gap-3"
              >
                <CheckCircle2 className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                <p className="text-gray-900 text-sm leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 py-14 space-y-10">
          <div className="text-center space-y-3">
            <p className="text-xs uppercase tracking-[0.3em] text-indigo-600">Who it’s for</p>
            <h2 className="text-3xl text-gray-900 font-semibold">Designed for ecommerce teams</h2>
          </div>
          <div className="flex flex-wrap justify-center gap-3 text-sm text-gray-600">
            {[
              { label: 'DTC brands', icon: <ShoppingBag className="w-4 h-4" /> },
              { label: 'Ecommerce founders', icon: <Zap className="w-4 h-4" /> },
              { label: 'Marketing teams', icon: <Users2 className="w-4 h-4" /> },
              { label: 'Performance marketers', icon: <Zap className="w-4 h-4" /> },
              { label: 'Agencies working with product brands', icon: <Users2 className="w-4 h-4" /> },
            ].map(item => (
              <span
                key={item.label}
                className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2"
              >
                {item.icon}
                {item.label}
              </span>
            ))}
          </div>
        </section>

        <section id="pricing" className="relative isolate mt-10 px-4 py-20 sm:px-6 lg:px-8">
          <div className="absolute inset-0 -z-10 rounded-3xl bg-gray-50" />
          <div className="max-w-6xl mx-auto text-gray-900 space-y-12">
            <div className="text-center space-y-4">
              <p className="text-sm uppercase tracking-[0.4em] text-indigo-600">Pricing</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold">Plans built for launch velocity</h2>
              <p className="text-base text-gray-600 max-w-2xl mx-auto">
                Scale your visuals as your products and campaigns grow.
              </p>
              <div className="mt-6 flex justify-center">
                <div className="inline-flex items-center gap-3 rounded-full border border-gray-200 bg-gray-50 px-4 py-2 shadow-md shadow-md shadow-indigo-500/20">
                  <span className="text-sm text-gray-600">Billed monthly</span>
                  <label
                    className="relative inline-flex cursor-pointer items-center"
                    aria-label="Toggle between monthly and annual billing"
                  >
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={billingCycle === 'yearly'}
                      onChange={handleBillingToggle}
                    />
                    <div className="h-6 w-12 rounded-full bg-gray-50 transition peer-checked:bg-indigo-600" />
                    <span className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow transition peer-checked:translate-x-6" />
                  </label>
                  <span className="text-sm text-gray-600">
                    Billed yearly{' '}
                    <span className="ml-1 rounded-full bg-indigo-600 px-2 py-0.5 text-xs text-indigo-600">
                      Save 20%
                    </span>
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
                  ? `${baseCard} border-indigo-600 bg-gray-50 shadow-md shadow-md shadow-indigo-500/20`
                  : `${baseCard} border-gray-200 bg-gray-50`;

                return (
                  <article key={plan.name} className={cardClasses}>
                    {plan.badge && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white">
                        {plan.badge}
                      </span>
                    )}
                    <header className="space-y-2">
                      <p className="text-base font-semibold">{plan.name}</p>
                      <div aria-live="polite" className="flex items-baseline gap-1 text-4xl font-bold text-gray-900">
                        {displayedPrice}
                        <span className="text-base font-medium text-gray-600">USD</span>
                      </div>
                      <p className="text-sm text-gray-600">{cadenceLabel}</p>
                      <p className="sr-only">
                        {displayedPrice} {cadenceLabel}
                      </p>
                    </header>
                    <ul className="space-y-3 text-sm text-gray-900">
                      {plan.highlights.map(item => (
                        <li key={item} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    {(() => {
                      if (plan.isFree) {
                        return (
                          <Link
                            to="/login"
                            className="mt-auto w-full rounded-full border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-900 hover:border-indigo-600 text-center"
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
                              ? 'bg-white text-gray-900 hover:bg-gray-50'
                              : 'bg-indigo-600 text-white hover:bg-indigo-600'
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

        <section className="max-w-4xl mx-auto px-6 py-16 text-center border-t border-gray-200">
          <p className="text-sm uppercase tracking-[0.3em] text-indigo-600">Final CTA</p>
          <h2 className="mt-4 text-3xl text-gray-900 font-semibold">Launch products with visuals that convert</h2>
          <p className="mt-3 text-gray-600">
            Create product and lifestyle mockups ready for ecommerce, ads and social. No photoshoots required.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-8 py-4 font-semibold text-white shadow-md shadow-md shadow-indigo-500/20 hover:bg-indigo-600 transition"
            >
              Start Creating Mockups
            </Link>
            <button
              onClick={handleSmoothScroll('#pricing')}
              className="inline-flex items-center justify-center rounded-full border border-gray-200 px-8 py-4 font-semibold text-gray-600 hover:border-indigo-600 hover:text-gray-900 transition"
            >
              View Pricing
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default LandingPage;
