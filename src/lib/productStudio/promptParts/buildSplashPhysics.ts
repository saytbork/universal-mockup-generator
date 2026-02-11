import type { AuthorityResolution } from './authorityResolver';

const normalize = (value: unknown): string => String(value || '').trim().toLowerCase();

export function isSplashPhysicsContext(photoMode: string, authority: AuthorityResolution): boolean {
  const mode = normalize(photoMode);
  const modeTriggered =
    mode.includes('splash') ||
    mode.includes('pool water') ||
    mode.includes('foam') ||
    mode.includes('underwater');
  return modeTriggered || authority.environment === 'underwater' || authority.environment === 'splash-tank';
}

export function buildSplashPhysicsModel(authority: AuthorityResolution): string {
  if (authority.visualIntent === 'clinical') return '';
  if (authority.motion === 'static') return '';

  return [
    'SPLASH_PHYSICS_MODEL:',
    'Liquid origin must be physically defined as one of: product displacement, surface impact plane, or controlled environmental force.',
    'Directional vector must be tied to liquid source motion. No floating or random mid-air droplets without vector continuation.',
    'Collision Resolution: liquid must obey solid surface collision. No liquid may overlap or penetrate object geometry. Droplets and stream must deflect or wrap around as physics would dictate.',
    'Gravity Consistency: all droplets follow downward gravitational arcs. No suspension or upward drift without a force source. Splash dispersal must reduce with height and distance.',
    'Surface Interaction: define impact plane (studio surface, water surface, or pool edge). Splash energy must dissipate on contact with realistic flattening and rebound behavior.',
    'Foam and Droplet Coherence: foam remains grouped with liquid mass. No amorphous CGI blobs. Droplet size variation limited by physical tension parameters.',
    'Spread Limitations: maximum realistic displacement range from origin must be respected. No radial explosion. No unbounded environmental flooding.',
    'Environmental Boundaries: splash must not create neutral side fill bands. Water and atmosphere must interact with object surfaces using physically coherent shadows and reflections.',
  ].join(' ');
}

