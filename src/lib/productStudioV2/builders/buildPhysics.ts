import type { StudioAuthorityBundle, StudioUIState } from '../types/studioTypes.ts';
import { studioMotionIsDynamic } from '../authority/studioAuthorityResolver.ts';

export function buildPhysics(authority: StudioAuthorityBundle, state?: StudioUIState): string {
  if (!authority.permissions.allowSplash) return '';
  if (!studioMotionIsDynamic(authority.motion)) return '';
  const splashAdMode = Boolean(state?.splashAdMode);
  const splashAdPeakMode =
    splashAdMode && String(state?.splashFreezeMoment || '').trim() === 'Peak';

  if (splashAdMode) {
    return [
      'STUDIO_PHYSICS_MODEL:',
      'SPLASH_AD_PROFILE: active.',
      'Liquid origin = base impact + angular displacement vector.',
      'HARD ASSERTION: ProductStability must be Fully grounded for explosive splash.',
      'Enforce gravity vector consistency across all droplets.',
      'Enforce collision coherence against solid geometry.',
      'Forbid floating droplets.',
      'Forbid geometry penetration.',
      'Allow asymmetric lateral propagation.',
      'Allow controlled chaotic droplet fragmentation and irregular edge breakup.',
      'Allow secondary droplet separation with natural kinetic decay over distance.',
      splashAdPeakMode
        ? 'FreezeMoment=Peak: raise splash height potential up to 15% frame height and prioritize volumetric contrast.'
        : 'Maintain natural kinetic decay with no forced compression framing.',
      'Do not apply radial bounding or over-restrict lateral spread.',
      'Visual priority: kinetic authority, directional dominance, volumetric contrast, and energy hierarchy while preserving product readability.',
    ].join(' ');
  }

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
