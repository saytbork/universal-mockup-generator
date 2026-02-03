import type { PhotoModeKey } from './sceneBuilders';
import type { Randomizer } from './randomizationRules';

export function buildMaterials(mode: PhotoModeKey, randomizer: Randomizer): string {
  if (mode === 'INGREDIENT_STACK') {
    return [
      'Neutral studio support surface only.',
      'Surface exists purely for physical grounding.',
      'No narrative material, no wood, no marble, no warm stone, no textured editorial backgrounds.'
    ].join(' ');
  }

  const base = 'Natural textures, organic imperfections, and true-to-scale materials.';

  const modeSpecific: Partial<Record<PhotoModeKey, string[]>> = {
    HERO_NEUTRAL: [
      'Matte plaster, stone, or ceramic surfaces with subtle grain.',
      'Soft textile accents with refined weave texture.'
    ],
    COLOR_POP_HERO: [
      'Glossy lacquer panels paired with matte surfaces for contrast.',
      'Polished acrylic surfaces with clean reflections.'
    ],
    INGREDIENT_STACK: [
      'Fresh organic ingredients with natural moisture and realistic texture.',
      'Botanical elements with real scale and surface contact.'
    ],
    ACRYLIC_BLOCKS: [
      'Real acrylic with visible thickness, refraction, and edge highlights.',
      'Polished surfaces with crisp specular detail.'
    ],
    SPLASH_SHOT: [
      'Real liquid physics with clear surface tension and droplets.',
      'Clean surfaces that show reflections and contact wetness.'
    ],
    FOAM_AND_TEXTURE: [
      'Foam, gel, or cream textures with realistic micro-bubbles.',
      'Surface detail visible without obscuring the product.'
    ],
    ROUTINE_CAROUSEL: [
      'Everyday materials like linen, ceramic, and brushed wood.',
      'Clean, believable household textures.'
    ],
    CLINICAL_LAB_COUNTER: [
      'Sterile lab materials: stainless, glass, and matte polymers.',
      'Clean, precise surfaces with minimal wear.'
    ],
    GOLDEN_MIST_AURA: [
      'Soft atmospheric particles with warm light scattering.',
      'Refined surfaces that hold golden highlights.'
    ],
    CANDY_GRADIENT_LAB: [
      'Polished acrylics and coated surfaces with gradient reflections.',
      'Clean lab materials with experimental color finishes.'
    ]
  };

  const picks = modeSpecific[mode];
  if (!picks || picks.length === 0) return base;
  return [base, randomizer.pick(picks)].join(' ');
}
