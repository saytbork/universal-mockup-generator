import type { StudioAuthorityBundle, StudioUIState } from '../types/studioTypes.ts';

export function buildMaterials(authority: StudioAuthorityBundle, state?: StudioUIState): string {
  if (state?.visualProfile === 'coffee') {
    return [
      'STUDIO_MATERIAL_MODEL: coffee-ceramic-priority.',
      'COFFEE_MATERIAL_RESPONSE: matte porcelain reflection rolloff with controlled soft highlights.',
      'COFFEE_LIQUID_SURFACE: dark core absorption with soft surface diffusion and meniscus coherence.',
      'COFFEE_GLASS_GUARD: no wine-style glass refraction priority and no cork rendering logic.',
    ].join(' ');
  }

  if (state?.winePrestigeMode) {
    return 'STUDIO_MATERIAL_MODEL: premium wine materials with controlled reflections and strict geometry-preserving integration.';
  }

  const materialModel = (() => {
    if (authority.world === 'beach-daylight') {
      return 'natural Caribbean shoreline materials: clean white sand grain, turquoise shallows, sea-foam edge behavior, and physically coherent wet contact zones';
    }
    if (authority.world === 'underwater') {
      return 'submerged materials with coherent caustics, depth haze, and water-contact realism';
    }
    if (authority.creativeIntent === 'clinical') {
      return 'sterile controlled surfaces with contamination-free reflectance and high legibility';
    }
    if (authority.creativeIntent === 'luxury' || authority.creativeIntent === 'campaign') {
      return 'premium tactile materials with controlled atmospheric layering and optical realism';
    }
    return 'clean conversion-grade surfaces optimized for label clarity and edge integrity';
  })();

  return `STUDIO_MATERIAL_MODEL: ${materialModel}.`;
}
