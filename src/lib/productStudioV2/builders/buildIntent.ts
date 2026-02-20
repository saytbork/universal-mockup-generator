import type { StudioAuthorityBundle, StudioUIState } from '../types/studioTypes.ts';

export function buildIntent(authority: StudioAuthorityBundle, state?: StudioUIState): string {
  if (state?.winePrestigeMode) {
    return [
      'STUDIO_VISUAL_INTENT: wine-prestige.',
      'WINE_PRESTIGE_PROFILE: sceneType=wine-prestige; contentStyle=premium; creationIntent=brand-prestige.',
      'WINE_PRESTIGE_NARRATIVE_BASE: Premium wine presentation. Atmosphere-driven composition. Emphasize depth, texture, silence, and material richness. The bottle is integrated naturally within a refined environment. Preserve exact label fidelity and geometry. Use cinematic lens compression and warm lateral lighting. Avoid commercial splash energy. Focus on elegance, mood, and premium brand perception.',
    ].join(' ');
  }
  return `STUDIO_VISUAL_INTENT: ${authority.creativeIntent}.`;
}
