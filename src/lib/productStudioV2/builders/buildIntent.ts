import type { StudioAuthorityBundle } from '../types/studioTypes.ts';

export function buildIntent(authority: StudioAuthorityBundle): string {
  return `STUDIO_VISUAL_INTENT: ${authority.creativeIntent}.`;
}
