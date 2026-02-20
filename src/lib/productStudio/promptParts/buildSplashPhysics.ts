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

type SplashPhysicsOptions = {
  splashAdMode?: boolean;
  freezeMoment?: string;
};

export function buildSplashPhysicsModel(authority: AuthorityResolution, options: SplashPhysicsOptions = {}): string {
  if (authority.visualIntent === 'clinical') return '';
  if (authority.motion === 'static') return '';
  const splashAdMode = options.splashAdMode === true;
  const splashAdPeakMode = splashAdMode && String(options.freezeMoment || '').trim() === 'Peak';

  if (splashAdMode) {
    return [
      'SPLASH_PHYSICS_MODEL:',
      'SPLASH_AD_PROFILE: active.',
      'Liquid origin = base impact + angular displacement vector.',
      'Product stability is forced to Fully grounded for explosive splash authority.',
      'Collision coherence: liquid obeys solid geometry with physically coherent deflection and wrap behavior.',
      'Gravity vector consistency is mandatory across droplets and sheets.',
      'Forbid floating droplets without force continuation.',
      'Forbid geometry penetration.',
      'Allow asymmetric lateral propagation with one dominant splash direction.',
      'Allow controlled chaotic droplet fragmentation, irregular edge breakup, and secondary droplet separation.',
      splashAdPeakMode
        ? 'FreezeMoment=Peak: increase fragmentation allowance, raise splash height ceiling up to 15% frame height, and prioritize volumetric contrast while preserving hero readability.'
        : 'Maintain splash height with natural kinetic decay; no forced compression framing.',
      'Kinetic decay follows natural distance falloff only; do not impose radial bounding or over-restrict lateral spread.',
    ].join(' ');
  }

  return [
    'SPLASH_PHYSICS_MODEL:',
    'Liquid origin must be physically defined as one of: product displacement, surface impact plane, or controlled environmental force.',
    'Directional vector must be tied to liquid source motion. No floating or random mid-air droplets without vector continuation.',
    'Impact-driven splash requires product stability: Slight interaction (never fully grounded).',
    'Collision Resolution: liquid must obey solid surface collision. No liquid may overlap or penetrate object geometry. Droplets and stream must deflect or wrap around as physics would dictate.',
    'Gravity Consistency: all droplets follow downward gravitational arcs. No suspension or upward drift without a force source. Splash dispersal must reduce with height and distance.',
    'Vertical Displacement Limit: allow controlled lift up to 10% of frame height from the impact origin.',
    'Flow Direction Rule: keep one dominant directional splash flow with coherent secondary droplets.',
    'Surface Interaction: define impact plane (studio surface, water surface, or pool edge). Splash energy must dissipate on contact with realistic flattening and rebound behavior.',
    'Foam and Droplet Coherence: foam remains grouped with liquid mass. No amorphous CGI blobs. Droplet size variation limited by physical tension parameters.',
    'Spread Limitations: maximum realistic displacement range from origin must be respected. No radial explosion. No unbounded environmental flooding. Lateral spread should remain physically plausible and must not be artificially over-restricted.',
    'Environmental Boundaries: splash must not create neutral side fill bands. Water and atmosphere must interact with object surfaces using physically coherent shadows and reflections.',
  ].join(' ');
}
