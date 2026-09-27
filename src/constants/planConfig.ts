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
  }
> = {
  free: {
    label: 'Free',
    description: '1 free image · watermark · comunidad · sin videos',
    creditLimit: 1,
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
  },
  studio: {
    label: 'Studio',
    description: '60 credits + 6 videos/mes · sin marca · soporte priority',
    creditLimit: 60,
    allowStudio: true,
    allowCaption: true,
    priceLabel: '$29/mo',
  },
};

