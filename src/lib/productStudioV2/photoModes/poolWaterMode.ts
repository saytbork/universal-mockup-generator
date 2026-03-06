import type { StudioUIState } from '../types/studioTypes';
import { emitPhotoModeSettings, getDynamicSettings, PHOTO_MODE_ATMOSPHERE_FALLBACKS, sanitizePoolWaterSettings } from './shared';

export function buildPoolWaterMode(state?: StudioUIState): string {
  const settings = getDynamicSettings(state);
  const sanitized = sanitizePoolWaterSettings(settings);
  const controls = emitPhotoModeSettings(sanitized);
  const atmosphere = PHOTO_MODE_ATMOSPHERE_FALLBACKS['Pool Water'];
  return `${controls} PHOTO_MODE_ATMOSPHERE: ${atmosphere}`;
}
