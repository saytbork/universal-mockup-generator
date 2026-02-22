import type { StudioAuthorityBundle, StudioUIState } from '../types/studioTypes.ts';

export function buildIntent(authority: StudioAuthorityBundle, state?: StudioUIState): string {
  if (state?.winePrestigeMode || state?.visualProfile === 'wine') {
    const wineMood = String(state?.wineMoodProfile || state?.wineMoodModifier || '')
      .trim()
      .toLowerCase();
    return wineMood === 'prestige'
      ? 'STUDIO_VISUAL_INTENT: wine-prestige.'
      : 'STUDIO_VISUAL_INTENT: wine-hero.';
  }
  return `STUDIO_VISUAL_INTENT: ${authority.creativeIntent}.`;
}
