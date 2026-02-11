import type { StudioAuthorityBundle } from '../types/studioTypes.ts';

export function buildUltraReal(authority: StudioAuthorityBundle): string {
  return [
    'STUDIO_ULTRA_REAL_GUARDRAIL:',
    `Intent=${authority.creativeIntent}; World=${authority.world}; Motion=${authority.motion}.`,
    'Enforce: physically coherent optics, realistic refraction, material response integrity, collision integrity, gravity consistency, no CGI artifacts, no surreal distortions, and label legibility priority.',
  ].join(' ');
}
