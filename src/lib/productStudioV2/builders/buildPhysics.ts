import type { StudioAuthorityBundle } from '../types/studioTypes.ts';
import { studioMotionIsDynamic } from '../authority/studioAuthorityResolver.ts';

export function buildPhysics(authority: StudioAuthorityBundle): string {
  if (!authority.permissions.allowSplash) return '';
  if (!studioMotionIsDynamic(authority.motion)) return '';

  return [
    'STUDIO_PHYSICS_MODEL:',
    'Define liquid origin explicitly (product displacement OR impact plane OR directional force).',
    'Impact-driven splash requires product stability: Slight interaction (never fully grounded).',
    'Enforce gravity vector consistency across all droplets.',
    'Enforce collision response against all solid geometry.',
    'Forbid mid-air droplet suspension.',
    'Forbid geometry penetration.',
    'Allow controlled vertical displacement up to 10% of frame height.',
    'Enforce a single dominant directional splash flow with coherent secondary droplets.',
    'Do not over-restrict lateral spread; allow physically plausible side propagation.',
    'Enforce bounded radial displacement.',
    'Enforce decay of kinetic energy with distance.',
    'Require coherent mass grouping of foam and liquid.',
  ].join(' ');
}
