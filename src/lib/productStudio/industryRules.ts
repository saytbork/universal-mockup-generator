import type { IndustryProfile, ProductStateMotion } from './types';

export const industryRules: Record<
  IndustryProfile,
  {
    conversionPhotoModes?: string[];
    editorialPhotoModes?: string[];
    interactionWhitelist?: string[];
    interactionWhitelistByIntent?: Record<string, string[]>;
    productStateWhitelist?: ProductStateMotion[];
    productStateWhitelistByIntent?: Record<string, ProductStateMotion[]>;
    allowedPhotoModes?: string[];
    allowedProductTypes?: string[];
    allowedSpecialEffects?: string[];
    allowedVisualStyles?: string[];
  }
> = {
  supplements: {
    productStateWhitelist: ['static', 'opened', 'dispensed', 'falling', 'spilled', 'pouring'],
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
    productStateWhitelist: ['static', 'opened'],
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
    productStateWhitelist: ['static'],
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
    productStateWhitelist: ['static', 'dispensed', 'pouring'],
    productStateWhitelistByIntent: {
      conversion: ['static', 'dispensed'],
      'editorial-ritual': ['static', 'dispensed', 'pouring'],
      campaign: ['static', 'pouring'],
    },
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
      campaign: [
        'none',
        'holding',
        'two-hand-hold',
        'presenting',
      ],
    },
  },
  luxury: {},
  tech: {},
  general: {},
};
