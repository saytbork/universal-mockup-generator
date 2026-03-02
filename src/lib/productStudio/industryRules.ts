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
  wine: {
    productStateWhitelist: ['static', 'opened'],
    interactionWhitelist: [
      'none',
      'holding',
      'two-hand-hold',
      'presenting',
      'cheers',
    ],
    // Wine-exclusive Photo Modes — ONLY these appear in wine UI
    allowedPhotoModes: [
      'Hero Landing Page',
      'Wine Macro Label',
      'Bottle + Glass',
      'Editorial Table',
      'Winery Scene',
    ],
    // Macro Dew Label is FORBIDDEN for wine — supplement-only mode
    // DO NOT add 'Macro Dew Label' here under any circumstances
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
  supplements: {
    productStateWhitelist: ['static', 'opened', 'dispensed', 'falling', 'spilled', 'pouring'],
    interactionWhitelist: [
      'none',
      'passive-presence',
      'cropped-hand',
      'supported-hold',
      'holding',
      'two-hand-hold',
      'presenting',
      'framed-presentation',
      'applying-opening',
      'capsule-display',
      'resting-interaction',
    ],
    // Supplement-exclusive macro modes — not available for wine
    allowedPhotoModes: [
      'Hero Landing Page',
      'Color Pop Hero',
      'Ingredient Stack',
      'Ingredient Flat Lay',
      'Routine Carousel',
      'Macro Dew Label',
    ],
  },
  beauty: {
    productStateWhitelist: ['static'],
    interactionWhitelist: [
      'none',
      'passive-presence',
      'cropped-hand',
      'supported-hold',
      'holding',
      'two-hand-hold',
      'presenting',
      'framed-presentation',
      'applying-opening',
      'resting-interaction',
    ],
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
  luxury: {
    interactionWhitelist: [
      'none',
      'passive-presence',
      'cropped-hand',
      'supported-hold',
      'holding',
      'two-hand-hold',
      'presenting',
      'framed-presentation',
      'resting-interaction',
    ],
  },
  tech: {
    interactionWhitelist: [
      'none',
      'passive-presence',
      'cropped-hand',
      'supported-hold',
      'holding',
      'two-hand-hold',
      'presenting',
      'framed-presentation',
      'applying-opening',
      'resting-interaction',
    ],
  },
  general: {
    interactionWhitelist: [
      'none',
      'passive-presence',
      'cropped-hand',
      'supported-hold',
      'holding',
      'two-hand-hold',
      'presenting',
      'framed-presentation',
      'applying-opening',
      'resting-interaction',
    ],
  },
};
