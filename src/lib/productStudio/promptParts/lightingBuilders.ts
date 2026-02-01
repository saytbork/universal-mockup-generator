import type { PhotoModeKey } from './sceneBuilders';
import type { Randomizer } from './randomizationRules';

export type LightingOverride = {
  text: string;
};

export type LightingBuildOptions = {
  override?: LightingOverride;
};

export function buildLighting(mode: PhotoModeKey, randomizer: Randomizer, options: LightingBuildOptions = {}): string {
  if (mode === 'INGREDIENT_STACK') {
    const fixed = [
      'Clean studio lighting.',
      'Soft directional key.',
      'Even illumination to preserve ingredient legibility.',
      'No dramatic shadows. No cinematic mood.'
    ].join(' ');
    if (options.override?.text) {
      return [fixed, options.override.text].filter(Boolean).join(' ');
    }
    return fixed;
  }

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
    FOAM_AND_TEXTURE: [
      'Directional light grazing textures for dimensional detail.',
      'Soft highlights that keep the product label readable.'
    ],
    ROUTINE_CAROUSEL: [
      'Natural daylight with gentle bounce fill.',
      'Consistent, repeatable lighting for sequence harmony.'
    ],
    CLINICAL_LAB_COUNTER: [
      'Clean professional lighting, cool and precise.',
      'Soft directional key with controlled reflections.'
    ],
    GOLDEN_MIST_AURA: [
      'Golden ambient light with subtle glow.',
      'Directional key light maintains clarity through mist.'
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
