import type { StudioUIState } from '../types/studioTypes';

export const PHOTO_MODE_ATMOSPHERE_FALLBACKS: Record<string, string> = {
  'Hero Landing Page':
    'Soft atmospheric depth separation behind the product. Subtle falloff from center to edges emphasizing silhouette. Copy-safe negative space preserved for overlay text.',
  'Pool Water':
    'Product positioned near clear swimming pool water surface. Sunlight refracting through water creating natural caustic patterns on pool floor and product base. Subtle ripples and reflective highlights around the product. Clean turquoise water environment with realistic refraction, wet reflections, and natural light dispersion.',
};

const POOL_WATER_FORBIDDEN_ENERGY = new Set(['splashy', 'violent', 'dynamic', 'energetic', 'turbulent']);

export function sanitizePoolWaterSettings(settings: Record<string, string>): Record<string, string> {
  const out = { ...settings };

  const energyKey = Object.keys(out).find((k) => k.toLowerCase() === 'waterenergy');
  if (energyKey) {
    if (POOL_WATER_FORBIDDEN_ENERGY.has(String(out[energyKey]).toLowerCase())) {
      out[energyKey] = 'Calm';
    }
  } else {
    out.waterEnergy = 'Calm';
  }

  const levelKey = Object.keys(out).find((k) => k.toLowerCase() === 'waterlevel');
  if (levelKey) {
    const val = String(out[levelKey]).toLowerCase();
    if (val === 'split' || val === 'impact' || val === 'submerged') {
      out[levelKey] = 'SurfaceContact';
    }
  } else {
    out.waterLevel = 'SurfaceContact';
  }

  return out;
}

export function emitPhotoModeSettings(settings: Record<string, string>): string {
  const parts = Object.entries(settings).map(([key, value]) => {
    const safeKey = key.toUpperCase().replace(/\s+/g, '_').replace(/[^A-Z0-9_]/g, '');
    const safeValue = String(value).trim();
    return `PHOTO_MODE_SETTING_${safeKey}: ${safeValue}.`;
  });
  return `PHOTO_MODE_DYNAMIC_CONTROLS: ${parts.join(' ')}`;
}

export function getDynamicSettings(state?: StudioUIState): Record<string, string> {
  const settings = state?.photoModeDynamicSettings;
  if (!settings || typeof settings !== 'object') return {};
  return Object.fromEntries(Object.entries(settings).filter(([, v]) => String(v).trim()));
}

export function withAtmosphere(base: string, photoMode: string): string {
  const atmosphere = PHOTO_MODE_ATMOSPHERE_FALLBACKS[photoMode];
  if (!atmosphere) return base;
  if (!base) return `PHOTO_MODE_ATMOSPHERE: ${atmosphere}`;
  return `${base} PHOTO_MODE_ATMOSPHERE: ${atmosphere}`;
}
