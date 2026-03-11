import type { StudioAuthorityBundle, StudioUIState } from '../types/studioTypes';

export function buildWaterWorld(
  authority: StudioAuthorityBundle,
  state?: StudioUIState
): string {
  if (authority.world === 'water-surface') {
    return [
      'STUDIO_WORLD: pool water surface environment with clear turquoise water, sunlit caustics, and natural refraction.',
      'POOL_WATER_REALISM_LOCK: Water must behave like a real swimming pool photographed with a camera. No stylized splash arcs. No symmetric wave explosions. No water crowns. No liquid impact shapes. Surface disturbance must be minimal and physically plausible. Allow only small ripples caused by object displacement. Waterline must intersect the product naturally.',
      'WATER_OPTICS_REALISM: Use photographic refraction and reflection. Avoid CGI-style glassy water. Allow slight surface noise and natural light caustics.',
      'SPLASH_PATTERN_PROHIBITION: Do not generate splash arcs, droplets flying outward, crown splashes, or symmetric liquid bursts.',
    ].join(' ');
  }

  const photoMode = String(state?.photoMode || '').trim().toLowerCase();
  if (photoMode.includes('underwater')) {
    return 'STUDIO_WORLD: underwater environment with refraction-consistent optical depth.';
  }
  if (photoMode.includes('splash') || photoMode.includes('foam')) {
    return 'STUDIO_WORLD: open-air grounded splash environment with unconstrained surface collision realism.';
  }
  return 'STUDIO_WORLD: controlled water-adjacent environment.';
}
