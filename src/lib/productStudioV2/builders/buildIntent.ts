import type { StudioAuthorityBundle, StudioUIState } from '../types/studioTypes.ts';

export function buildIntent(authority: StudioAuthorityBundle, state?: StudioUIState): string {
  if (state?.winePrestigeMode) {
    const winePrestigeV2Mode = Boolean(state.winePrestigeV2Mode);
    return [
      'STUDIO_VISUAL_INTENT: wine-prestige.',
      'WINE_PRESTIGE_PROFILE: sceneType=wine-prestige; contentStyle=premium; creationIntent=brand-prestige.',
      winePrestigeV2Mode ? 'WINE_PRESTIGE_VERSION: V2 Cinematic Pour Edition.' : 'WINE_PRESTIGE_VERSION: V1 Static Presentation.',
      'WINE_PRESTIGE_NARRATIVE_BASE: Premium wine presentation. Atmosphere-driven composition. Emphasize depth, texture, silence, and material richness. The bottle is integrated naturally within a refined environment. Preserve exact label fidelity and geometry. Use cinematic lens compression and warm lateral lighting. Avoid commercial splash energy. Focus on elegance, mood, and premium brand perception.',
      winePrestigeV2Mode
        ? 'WINE_PRESTIGE_V2_NARRATIVE: Premium wine presentation with controlled cinematic pouring action. Emphasize elegance, depth, and refined atmosphere. The wine flows smoothly from the bottle in a continuous ribbon with natural gravity-driven motion. No explosive splash behavior. Focus on material richness, glass refraction, liquid translucency, and warm lateral lighting. Preserve exact label fidelity and bottle geometry. The composition should feel sophisticated, intimate, and premium.'
        : '',
    ].join(' ');
  }
  return `STUDIO_VISUAL_INTENT: ${authority.creativeIntent}.`;
}
