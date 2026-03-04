import type { StudioUIState } from '../types/studioTypes.ts';

/**
 * Per-photo-mode atmosphere descriptors emitted when no user dynamic settings are present.
 * These restore the visual richness layer that dynamic settings would otherwise provide.
 * Keyed by exact photoMode string (case-sensitive, must match PHOTO_MODE_SCENE_MAP keys).
 */
const PHOTO_MODE_ATMOSPHERE_FALLBACKS: Record<string, string> = {
  'Hero Landing Page':
    'Subtle gradient background derived from brand palette. Soft atmospheric falloff behind the product. Controlled vignette separation to emphasize product silhouette. Clean premium studio atmosphere suitable for ecommerce hero banners.',
  'Color Pop Hero':
    'Bold color field derived from primary palette color. Radial gradient energy field behind the product. Strong silhouette contrast between product and background. High-impact advertising style studio lighting.',
  'Pool Water':
    'Product positioned near clear swimming pool water surface. Sunlight refracting through water creating natural caustic patterns on pool floor and product base. Subtle ripples and reflective highlights around the product. Clean turquoise water environment with realistic refraction, wet reflections, and natural light dispersion.',
};

/**
 * Injects Photo Mode dynamic sub-settings (macroTightness, dropletMode, etc.)
 * into the V2 prompt. These come from the user's per-Photo-Mode controls in the UI.
 * Each key→value pair is emitted as a PHOTO_MODE_SETTING_<KEY>: <value> block.
 * Last-selection-wins: if the same key appears multiple times, the last write wins (guaranteed
 * by the Record<string,string> deduplication in toStudioV2State).
 *
 * When no user settings exist, emits a per-mode atmosphere fallback to preserve visual richness.
 */
export function buildPhotoModeDynamic(state?: StudioUIState): string {
  const settings = state?.photoModeDynamicSettings;
  const photoMode = String(state?.photoMode || '').trim();
  // eslint-disable-next-line no-console
  console.log('[DEBUG][buildPhotoModeDynamic] EXECUTED. photoMode=', photoMode, '| photoModeDynamicSettings=', JSON.stringify(settings));

  if (!settings || typeof settings !== 'object') {
    // No user-set UI controls — emit atmosphere fallback for modes that need it
    const fallback = PHOTO_MODE_ATMOSPHERE_FALLBACKS[photoMode];
    if (fallback) {
      const result = `PHOTO_MODE_ATMOSPHERE: ${fallback}`;
      // eslint-disable-next-line no-console
      console.log('[DEBUG][buildPhotoModeDynamic] emitted (atmosphere fallback):', JSON.stringify(result));
      return result;
    }
    return '';
  }

  const entries = Object.entries(settings).filter(([, v]) => String(v).trim());
  if (entries.length === 0) {
    // Settings object present but empty — same fallback logic
    const fallback = PHOTO_MODE_ATMOSPHERE_FALLBACKS[photoMode];
    if (fallback) {
      const result = `PHOTO_MODE_ATMOSPHERE: ${fallback}`;
      // eslint-disable-next-line no-console
      console.log('[DEBUG][buildPhotoModeDynamic] emitted (atmosphere fallback, empty settings):', JSON.stringify(result));
      return result;
    }
    return '';
  }

  const parts = entries.map(([key, value]) => {
    const safeKey = key.toUpperCase().replace(/\s+/g, '_').replace(/[^A-Z0-9_]/g, '');
    const safeValue = String(value).trim();
    return `PHOTO_MODE_SETTING_${safeKey}: ${safeValue}.`;
  });

  const result = `PHOTO_MODE_DYNAMIC_CONTROLS: ${parts.join(' ')}`;
  // eslint-disable-next-line no-console
  console.log('[DEBUG][buildPhotoModeDynamic] emitted:', JSON.stringify(result));
  return result;
}
