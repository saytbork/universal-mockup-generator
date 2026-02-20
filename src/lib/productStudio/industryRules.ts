import type { IndustryProfile } from './types';

export const industryRules: Record<
  IndustryProfile,
  {
    allowedPhotoModes?: string[];
    allowedProductTypes?: string[];
    allowedSpecialEffects?: string[];
    allowedVisualStyles?: string[];
  }
> = {
  supplements: {},
  wine: {
    allowedPhotoModes: [
      'Hero Landing Page',
      'Color Pop Hero',
      'Macro Dew Label',
    ],
    allowedProductTypes: ['Custom'],
    allowedSpecialEffects: [
      'Cheers (Hands Clink)',
      'Condensation Droplets',
      'Fruit Garnish / Citrus Accents',
    ],
    allowedVisualStyles: [
      'Dark Premium Studio',
      'Monochrome Brand',
      'Brand Campaign',
      'Sunlit Stone Editorial',
      'Golden Sunset Backlit',
      'Botanical Water Garden',
    ],
  },
  beauty: {},
  coffee: {},
  luxury: {},
  tech: {},
  general: {},
};
