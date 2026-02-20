import type { IndustryProfile } from './types';

export const industryRules: Record<
  IndustryProfile,
  {
    allowedIntents?: string[];
    conversionPhotoModes?: string[];
    editorialPhotoModes?: string[];
    interactionWhitelist?: string[];
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
    allowedIntents: ['conversion', 'editorial-ritual'],
    conversionPhotoModes: [
      'hero-landing',
      'color-pop-hero',
      'ingredient-stack',
    ],
    editorialPhotoModes: [
      'golden-hour-lifestyle',
      'soft-wellness-morning',
      'editorial-table',
    ],
    interactionWhitelist: [
      'none',
      'holding',
      'two-hand-hold',
      'presenting',
    ],
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
