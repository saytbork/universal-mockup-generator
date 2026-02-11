import type { StudioAuthorityBundle } from '../types/studioTypes.ts';
import { studioMotionIsDynamic } from '../authority/studioAuthorityResolver.ts';

export function buildPhysics(authority: StudioAuthorityBundle): string {
  if (!authority.permissions.allowSplash) return '';
  if (!studioMotionIsDynamic(authority.motion)) return '';

  return [
    'STUDIO_PHYSICS_MODEL:',
    'Define liquid origin explicitly (product displacement OR impact plane OR directional force).',
    'Enforce gravity vector consistency across all droplets.',
    'Enforce collision response against all solid geometry.',
    'Forbid mid-air droplet suspension.',
    'Forbid geometry penetration.',
    'Enforce bounded radial displacement.',
    'Enforce decay of kinetic energy with distance.',
    'Require coherent mass grouping of foam and liquid.',
  ].join(' ');
}
