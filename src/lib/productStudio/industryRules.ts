import type { IndustryProfile } from './types';

export const industryRules: Record<
  IndustryProfile,
  {
    interactions?: string[];
    allowedPhotoModes?: string[];
    allowedProductTypes?: string[];
    allowedSpecialEffects?: string[];
    allowedVisualStyles?: string[];
  }
> = {
  supplements: {
    interactions: [
      'none',
      'capsuleDisplay',
      'applyingOpening',
      'holding',
      'supportedHold',
    ],
  },
  wine: {
    interactions: [
      'none',
      'holdingBottle',
      'glassForeground',
      'pouringWine',
      'cheers',
    ],
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
  beauty: {
    interactions: ['none'],
  },
  coffee: {
    interactions: [
      'none',
      'cupHold',
      'pouringEspresso',
      'steam',
      'beansScatter',
      'spoonStir',
    ],
  },
  luxury: {},
  tech: {},
  general: {},
};
