export type PlanTier = 'free' | 'creator' | 'studio';

export const PLAN_CONFIG: Record<
  PlanTier,
  {
    label: string;
    description: string;
    creditLimit: number;
    allowStudio: boolean;
    allowCaption: boolean;
    priceLabel: string;
    stripeUrl?: string;
  }
> = {
  free: {
    label: 'Free',
    description: '2 credits · watermark · comunidad · sin videos',
    creditLimit: 2,
    allowStudio: false,
    allowCaption: false,
    priceLabel: '$0',
  },
  creator: {
    label: 'Creator',
    description: '20 credits + 2 videos/mes · sin marca · soporte standard',
    creditLimit: 20,
    allowStudio: true,
    allowCaption: true,
    priceLabel: '$19/mo',
    stripeUrl: 'https://buy.stripe.com/14A28tb1Sgr0b2Y5HBeIw02',
  },
  studio: {
    label: 'Studio',
    description: '60 credits + 6 videos/mes · sin marca · soporte priority',
    creditLimit: 60,
    allowStudio: true,
    allowCaption: true,
    priceLabel: '$29/mo',
    stripeUrl: 'https://buy.stripe.com/7sYfZj1ricaKdb6da3eIw01',
  },
};

