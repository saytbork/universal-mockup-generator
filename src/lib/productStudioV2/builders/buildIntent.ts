import type { StudioAuthorityBundle, StudioUIState } from '../types/studioTypes.ts';

export function buildIntent(authority: StudioAuthorityBundle, state?: StudioUIState): string {
  if (state?.winePrestigeMode || state?.visualProfile === 'wine') {
    const wineIntent = String(state?.wineMoodProfile || state?.wineMoodModifier || 'prestige')
      .trim()
      .toLowerCase();
    return `STUDIO_VISUAL_INTENT: wine-${wineIntent}.`;
  }
  return `STUDIO_VISUAL_INTENT: ${authority.creativeIntent}.`;
}
