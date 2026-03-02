import type { StudioAuthorityBundle, StudioUIState } from '../types/studioTypes.ts';

export function buildMotion(authority: StudioAuthorityBundle, state?: StudioUIState): string {
  const resolvedMotion = state?.motion || authority.motion;
  return `STUDIO_PRODUCT_MOTION: ${resolvedMotion}.`;
}
