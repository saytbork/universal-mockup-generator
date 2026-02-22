import type { StudioAuthorityBundle, StudioUIState } from '../types/studioTypes.ts';

export function buildIntent(authority: StudioAuthorityBundle, state?: StudioUIState): string {
  if (state?.winePrestigeMode) {
    return 'STUDIO_VISUAL_INTENT: wine-premium.';
  }
  return `STUDIO_VISUAL_INTENT: ${authority.creativeIntent}.`;
}
