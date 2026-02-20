import type { StudioAuthorityBundle, StudioUIState } from '../types/studioTypes.ts';

export function buildMaterials(authority: StudioAuthorityBundle, state?: StudioUIState): string {
  if (state?.winePrestigeMode) {
    const whiteWineSignal = `${String(state.wineContextPreset || '')} ${String(state.wineMoodModifier || '')} ${String(state.photoMode || '')}`
      .toLowerCase()
      .includes('white');
    return [
      'STUDIO_MATERIAL_MODEL: wine-glass-priority.',
      'GLASS_RENDERING: realistic refraction, micro-specular highlights, natural edge glow, subtle bottle-thickness distortion, and internal liquid density visibility.',
      whiteWineSignal
        ? 'LIQUID_RENDERING: pale golden translucency, increased internal glow, lower opacity density, realistic meniscus at glass contact, and refractive distortion coherence.'
        : 'LIQUID_RENDERING: deep burgundy translucency, light absorption at the core, edge luminosity near the liquid surface, slight meniscus at glass contact, and realistic refractive distortion.',
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
