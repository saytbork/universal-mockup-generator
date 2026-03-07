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
    // All photo modes are allowed for supplements — no restriction
    allowedPhotoModes: [
      'Hero Landing Page',
      'Color Pop Hero',
      'Ingredient Stack',
      'Ingredient Flat Lay',
      'Acrylic Blocks',
      'Glass Pedestal Studio',
      'Splash Shot',
      'Beach Foam Splash',
      'Pool Water',
      'Cheers (Hands Clink)',
      'Ice Cubes',
      'Condensation Droplets',
      'Fruit Garnish / Citrus Accents',
      'Textured Bed / Scatter Base',
      'Floating Particles',
      'Foam & Texture',
      'Routine Carousel',
      'Luxury Editorial Tabletop',
      'Candy Gradient Lab',
      'Golden Mist Aura',
      'Macro Dew Label',
      'Gel Smear Editorial',
      'Citrus Fresh Flat Lay',
      'Stones & Crystals Flat Lay',
      'Dried Citrus Earth',
      'Golden Hour Lifestyle',
      'Pastel Picnic',
      'Hands Application Clean',
      'Underwater Split',
    ],
    allowedVisualStyles: [
      'Clinical Lab Counter',
      'Minimal Bathroom Vanity',
      'Dark Premium Studio',
      'Tech Clean Studio',
      'Brand Campaign',
      'Creator Premium Simulation',
      'Soft Wellness Morning',
      'Outdoor Energy Boost',
      'Sunlit Stone Editorial',
      'Golden Sunset Backlit',
      'Bathroom Daylight Clean',
      'Sky Float Minimal',
      'Wet Rock Ripples',
      'Sand Palm Shadows',
      'Botanical Water Garden',
      'Warm Window Wood',
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
};
