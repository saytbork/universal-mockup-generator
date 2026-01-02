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
  const [selectedPlan, setSelectedPlan] = useState<CheckoutPlan | null>(null);
  const [checkoutEmail, setCheckoutEmail] = useState('');
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

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
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="bg-gradient-to-br from-indigo-900/40 via-gray-950 to-gray-950">
        <nav className="relative z-10 max-w-6xl mx-auto px-6 py-8 flex items-center justify-between">
          <div className="text-sm font-semibold uppercase tracking-[0.3em] text-white">Perfect Mockup</div>
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="px-5 py-2.5 text-xs uppercase tracking-widest font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-full transition shadow-lg shadow-indigo-500/20"
            >
              Sign in
            </Link>
          </div>
        </nav>

        <header className="relative overflow-hidden pb-16">
          <div
            className="absolute inset-0 opacity-30 pointer-events-none"
            style={{
              background:
                'radial-gradient(circle at 20% 20%, rgba(79,70,229,0.35), transparent 55%)',
            }}
          />
          <div className="max-w-6xl mx-auto px-6 pt-6 pb-10 flex flex-col items-center text-center gap-10 relative">
            <div className="max-w-3xl space-y-6">
              <p className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-1 text-xs uppercase tracking-widest text-indigo-200/90">
                <ShieldCheck className="w-3.5 h-3.5" /> A visual mockup system for ecommerce brands
              </p>
              <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight">
                Product &amp; Lifestyle Mockups for Ecommerce Brands
              </h1>
              <p className="text-lg text-gray-300">
                Create studio-ready product visuals and lifestyle scenes without photoshoots. From clean product shots to
                UGC-style content, fully controlled.
              </p>
              <p className="text-sm text-gray-400">
                No freelancers. No creative chaos. Just visuals built to convert.
              </p>
              <div className="flex flex-wrap justify-center gap-3 text-sm text-gray-300">
                {[
                  'Built for ecommerce, not designers',
                  'Product and lifestyle visuals in one system',
                  'Ready for PDPs, ads and launches',
                  'Consistent results at scale',
                ].map(item => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-full bg-indigo-500 px-8 py-4 font-semibold text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-600 transition"
              >
                Start Creating Mockups
              </Link>
              <button
                onClick={handleSmoothScroll('#pricing')}
                className="inline-flex items-center justify-center rounded-full border border-white/20 px-8 py-4 font-semibold text-white/80 hover:border-indigo-400 hover:text-white transition"
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
            <p className="text-xs uppercase tracking-[0.3em] text-indigo-200">What you can create</p>
            <h2 className="text-3xl text-white font-semibold">Create the visuals your product needs to sell</h2>
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
                className="rounded-2xl border border-white/10 bg-gray-900/60 p-6 text-left space-y-4"
              >
                <div className="space-y-2">
                  <p className="text-white text-lg font-semibold">{card.title}</p>
                  <p className="text-gray-300 text-sm leading-relaxed">{card.description}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-widest text-gray-500">Use for</p>
                  <ul className="space-y-2 text-sm text-gray-200">
                    {card.uses.map(item => (
                      <li key={item} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-300 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 py-14 space-y-10">
          <div className="text-center space-y-3">
            <p className="text-xs uppercase tracking-[0.3em] text-indigo-200">How it works</p>
            <h2 className="text-3xl text-white font-semibold">From product to visuals in minutes</h2>
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
                className="rounded-2xl border border-white/5 bg-gray-900/60 p-5 text-left transition transform hover:-translate-y-1 hover:border-indigo-400"
                style={{ animationDelay: `${0.1 * (index + 1)}s` }}
              >
                <p className="text-xs uppercase tracking-widest text-gray-500">{card.title}</p>
                <p className="mt-3 text-gray-300">{card.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-gray-900/40 border-y border-white/5">
          <div className="max-w-6xl mx-auto px-6 py-16 space-y-10">
            <div className="text-center space-y-3">
              <p className="text-xs uppercase tracking-[0.3em] text-indigo-200">Product vs lifestyle</p>
              <h2 className="text-3xl text-white font-semibold">Two modes. One visual system.</h2>
              <p className="text-gray-400 max-w-3xl mx-auto mt-3">
                Product and Lifestyle never mix. You always control the intent before generating.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-gray-900/60 p-6 text-left space-y-3">
                <p className="text-white text-lg font-semibold">Product (Studio)</p>
                <p className="text-gray-300 text-sm">
                  Use when clarity and control matter. Perfect for PDPs, marketplaces and catalogs.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-gray-900/60 p-6 text-left space-y-3">
                <p className="text-white text-lg font-semibold">Lifestyle</p>
                <p className="text-gray-300 text-sm">
                  Use when context and emotion drive conversion. Choose UGC for authenticity or Editorial for polish.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 py-14 space-y-10">
          <div className="text-center space-y-3">
            <p className="text-xs uppercase tracking-[0.3em] text-indigo-200">Why brands use Perfect Mockup</p>
            <h2 className="text-3xl text-white font-semibold">Built for product brands that move fast</h2>
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
                className="rounded-2xl border border-white/10 bg-gray-900/60 p-5 flex items-start gap-3"
              >
                <Zap className="w-5 h-5 text-indigo-300 mt-0.5 flex-shrink-0" />
                <p className="text-gray-200 text-sm leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 py-14 space-y-10">
          <div className="text-center space-y-3">
            <p className="text-xs uppercase tracking-[0.3em] text-indigo-200">Why Perfect Mockup is different</p>
            <h2 className="text-3xl text-white font-semibold">Not another image generator</h2>
            <p className="text-gray-400 max-w-3xl mx-auto mt-3">
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
                className="rounded-2xl border border-white/10 bg-gray-900/60 p-5 flex items-start gap-3"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-300 mt-0.5 flex-shrink-0" />
                <p className="text-gray-200 text-sm leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 py-14 space-y-10">
          <div className="text-center space-y-3">
            <p className="text-xs uppercase tracking-[0.3em] text-indigo-200">Who it’s for</p>
            <h2 className="text-3xl text-white font-semibold">Designed for ecommerce teams</h2>
          </div>
          <div className="flex flex-wrap justify-center gap-3 text-sm text-gray-300">
            {[
              { label: 'DTC brands', icon: <ShoppingBag className="w-4 h-4" /> },
              { label: 'Ecommerce founders', icon: <Zap className="w-4 h-4" /> },
              { label: 'Marketing teams', icon: <Users2 className="w-4 h-4" /> },
              { label: 'Performance marketers', icon: <Zap className="w-4 h-4" /> },
              { label: 'Agencies working with product brands', icon: <Users2 className="w-4 h-4" /> },
            ].map(item => (
              <span
                key={item.label}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2"
              >
                {item.icon}
                {item.label}
              </span>
            ))}
          </div>
        </section>

        <section id="pricing" className="relative isolate mt-10 px-4 py-20 sm:px-6 lg:px-8">
          <div className="absolute inset-0 -z-10 rounded-[2.5rem] bg-gradient-to-b from-[#0A0A0F] to-[#111] opacity-95" />
          <div className="max-w-6xl mx-auto text-white space-y-12">
            <div className="text-center space-y-4">
              <p className="text-sm uppercase tracking-[0.4em] text-indigo-200">Pricing</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold">Plans built for launch velocity</h2>
              <p className="text-base text-gray-400 max-w-2xl mx-auto">
                Scale your visuals as your products and campaigns grow.
              </p>
              <div className="mt-6 flex justify-center">
                <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 shadow-lg shadow-purple-900/30">
                  <span className="text-sm text-gray-300">Billed monthly</span>
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
                    <div className="h-6 w-12 rounded-full bg-gray-600 transition peer-checked:bg-indigo-500" />
                    <span className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow transition peer-checked:translate-x-6" />
                  </label>
                  <span className="text-sm text-gray-300">
                    Billed yearly{' '}
                    <span className="ml-1 rounded-full bg-purple-600/30 px-2 py-0.5 text-xs text-purple-200">
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

            <div className="flex flex-col items-center gap-3 text-sm text-gray-400">
              <div className="inline-flex items-center gap-2 text-white/80 font-medium">
                <CreditCard className="w-4 h-4 text-indigo-300" />
                Payments processed by Stripe
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {paymentMethods.map(method => (
                  <span
                    key={method}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-gray-300"
                  >
                    {method}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6 py-16 text-center border-t border-white/5">
          <p className="text-sm uppercase tracking-[0.3em] text-indigo-200">Final CTA</p>
          <h2 className="mt-4 text-3xl text-white font-semibold">Launch products with visuals that convert</h2>
          <p className="mt-3 text-gray-400">
            Create product and lifestyle mockups ready for ecommerce, ads and social. No photoshoots required.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-full bg-indigo-500 px-8 py-4 font-semibold text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-600 transition"
            >
              Start Creating Mockups
            </Link>
            <button
              onClick={handleSmoothScroll('#pricing')}
              className="inline-flex items-center justify-center rounded-full border border-white/20 px-8 py-4 font-semibold text-white/80 hover:border-indigo-400 hover:text-white transition"
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

