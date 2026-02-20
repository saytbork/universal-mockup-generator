import type { StudioAuthorityBundle, StudioUIState } from '../types/studioTypes.ts';

export function buildMotion(authority: StudioAuthorityBundle, state?: StudioUIState): string {
  if (state?.winePrestigeMode) return '';
  return `STUDIO_PRODUCT_MOTION: ${authority.motion}.`;
}
