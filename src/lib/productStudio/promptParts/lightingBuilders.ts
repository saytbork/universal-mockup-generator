import type { PhotoModeKey } from './sceneBuilders';
import type { Randomizer } from './randomizationRules';

export type LightingOverride = {
  text: string;
};

export type LightingBuildOptions = {
  override?: LightingOverride;
};

export function buildLighting(mode: PhotoModeKey, randomizer: Randomizer, options: LightingBuildOptions = {}): string {
  const base = [
    'Editorial or cinematic lighting with clear direction and realistic shadows.',
    'Controlled highlights and realistic shadow falloff.'
  ];

  const modeSpecific: Partial<Record<PhotoModeKey, string[]>> = {
    HERO_NEUTRAL: [
      'Soft directional key light with controlled falloff.',
      'Secondary bounce light for depth and dimensionality.'
    ],
    COLOR_POP_HERO: [
      'Punchy lighting with strong color separation.',
      'Highlights emphasize palette contrast without flattening the scene.'
    ],
    INGREDIENT_STACK: [
      'Soft directional light that reveals ingredient textures.',
      'Natural shadow depth with subtle rim separation.'
    ],
    ACRYLIC_BLOCKS: [
      'Controlled studio lighting with soft reflections on acrylic edges.',
      'Clean specular highlights and crisp shadow definition.'
    ],
    SPLASH_SHOT: [
      'High-speed lighting with frozen motion and crisp droplets.',
      'Directional highlights reveal fluid movement.'
    ],
    TILE_AND_SPA: [
      'Warm diffused light with gentle steam interaction.',
      'Soft reflections across tile surfaces.'
    ],
    FOAM_AND_TEXTURE: [
      'Directional light grazing textures for dimensional detail.',
      'Soft highlights that keep the product label readable.'
    ],
    ROUTINE_CAROUSEL: [
      'Natural daylight with gentle bounce fill.',
      'Consistent, repeatable lighting for sequence harmony.'
    ],
    PASTEL_PICNIC: [
      'Diffused daylight with warm pastel glow.',
      'Soft shadows and gentle highlight roll-off.'
    ],
    SUNRISE_WELLNESS_COUNTER: [
      'Warm sunrise light with long soft shadows.',
      'Subtle rim light for depth.'
    ],
    CLINICAL_LAB_COUNTER: [
      'Clean professional lighting, cool and precise.',
      'Soft directional key with controlled reflections.'
    ],
    GOLDEN_MIST_AURA: [
      'Golden ambient light with subtle glow.',
      'Directional key light maintains clarity through mist.'
    ],
    OUTDOOR_ENERGY_BOOST: [
      'Strong natural daylight with crisp shadow edges.',
      'High-energy highlights with realistic falloff.'
    ],
    CROWN_WELLNESS_VANITY: [
      'Luxury vanity lighting with soft specular highlights.',
      'Controlled reflections on metallic accents.'
    ],
    CANDY_GRADIENT_LAB: [
      'Creative lighting with controlled gradient spill.',
      'Balanced color separation without flattening the scene.'
    ]
  };

  const selections = modeSpecific[mode] ?? [];
  const chosen = selections.length > 0 ? randomizer.pick(selections) : '';
  if (options.override?.text) {
    return [base.join(' '), options.override.text].filter(Boolean).join(' ');
  }

  return [base.join(' '), chosen].filter(Boolean).join(' ');
}
