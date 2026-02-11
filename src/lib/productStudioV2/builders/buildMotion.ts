import type { StudioAuthorityBundle } from '../types/studioTypes.ts';

export function buildMotion(authority: StudioAuthorityBundle): string {
  return `STUDIO_PRODUCT_MOTION: ${authority.motion}.`;
}
