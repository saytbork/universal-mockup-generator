import type { StudioAuthorityBundle } from '../types/studioTypes';

export function buildStudioWorld(authority: StudioAuthorityBundle): string {
  if (authority.world !== 'studio') {
    return `STUDIO_WORLD: ${authority.world}.`;
  }
  return 'STUDIO_WORLD: clean studio environment. BACKGROUND_CONTEXT: seamless neutral studio background with soft gradient depth. No gray borders, no empty canvas corners — fill the entire frame edge-to-edge with the studio environment.';
}

