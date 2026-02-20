import type { StudioAuthorityBundle, StudioUIState } from '../types/studioTypes.ts';

export function buildMaterials(authority: StudioAuthorityBundle, state?: StudioUIState): string {
  if (state?.winePrestigeMode) {
    return [
      'STUDIO_MATERIAL_MODEL: wine-glass-priority.',
      'GLASS_RENDERING: realistic refraction, micro-specular highlights, natural edge glow, subtle bottle-thickness distortion, and internal liquid density visibility.',
      'CORK_RENDERING: if cork is visible, preserve natural cork grain with subtle imperfections.',
      'INTEGRATION_RULE: product must feel naturally integrated on the surface with physically coherent contact shadows (never floating).',
    ].join(' ');
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
