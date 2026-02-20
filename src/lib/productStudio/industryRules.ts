import type { IndustryProfile } from './types';

export const industryRules: Record<
  IndustryProfile,
  {
    conversionPhotoModes?: string[];
    editorialPhotoModes?: string[];
    interactionWhitelist?: string[];
    interactionWhitelistByIntent?: Record<string, string[]>;
    allowedPhotoModes?: string[];
    allowedProductTypes?: string[];
    allowedSpecialEffects?: string[];
    allowedVisualStyles?: string[];
  }
> = {
  supplements: {
    interactionWhitelist: [
      'none',
      'holding',
      'two-hand-hold',
      'presenting',
      'capsule-display',
      'applying-opening',
    ],
  },
  wine: {
    interactionWhitelist: [
      'none',
      'holding',
      'two-hand-hold',
      'presenting',
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
    interactionWhitelist: ['none'],
  },
  coffee: {
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
    interactionWhitelistByIntent: {
      conversion: [
        'none',
        'holding',
        'two-hand-hold',
        'presenting',
      ],
      'editorial-ritual': [
        'none',
        'holding',
        'two-hand-hold',
        'framed-presentation',
      ],
    },
  },
  luxury: {},
  tech: {},
  general: {},
};
