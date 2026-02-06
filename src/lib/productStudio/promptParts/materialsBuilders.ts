import type { PhotoModeKey } from './sceneBuilders';
import type { Randomizer } from './randomizationRules';

export function buildMaterials(mode: PhotoModeKey, randomizer: Randomizer): string {
  if (mode === 'INGREDIENT_STACK') {
    return [
      'Neutral studio support surface only.',
      'Surface exists purely for physical grounding.',
      'No narrative material, no wood, no marble, no textured editorial backgrounds.'
    ].join(' ');
  }

  const base = 'Premium real-world materials with true scale, tactile realism, and controlled surface behavior.';

  const modeSpecific: Partial<Record<PhotoModeKey, string[]>> = {
    HERO_NEUTRAL: [
      'Matte plaster, stone, or concrete surfaces with subtle grain and commercial-grade finish.',
      'Rigid studio accents only: glass, metal, acrylic, and stone.'
    ],
    COLOR_POP_HERO: [
      'Glossy lacquer panels paired with matte surfaces for contrast.',
      'Polished acrylic surfaces with clean reflections.'
    ],
    BRAND_CAMPAIGN: [
      'Luxury architectural materials: honed stone, brushed metal, and premium coated panels.',
      'Flagship campaign finishes with disciplined reflectance and upscale depth.'
    ],
    UGC_PREMIUM_SIM: [
      'Premium real-world materials with tiny believable imperfections and tactile truth.',
      'Controlled non-perfect surfaces that read authentic without losing polish.'
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
      'Studio-safe materials only: glass, acrylic, stone, and coated metal surfaces.',
      'Clean, rigid materials with controlled reflections and no soft props.'
    ],
    CLINICAL_LAB_COUNTER: [
      'Sterile lab materials: stainless, glass, and matte polymers.',
      'Clean, precise surfaces with minimal wear and premium production polish.'
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

export function buildMaterialsWithProfile(
  mode: PhotoModeKey,
  randomizer: Randomizer,
  profile: 'luxury-brand' | 'ecommerce-conversion' | 'editorial' = 'luxury-brand'
): string {
  const base = buildMaterials(mode, randomizer);
  const profileText = profile === 'ecommerce-conversion'
    ? 'Material priority: clean, distraction-free surfaces that support conversion-focused readability.'
    : profile === 'editorial'
      ? 'Material priority: tactile editorial textures with controlled brand-safe stylization.'
      : 'Material priority: premium luxury finishes with refined tactile realism.';
  return `${base} ${profileText}`.trim();
}
