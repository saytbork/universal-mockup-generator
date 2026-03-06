import { PHOTO_MODE_ATMOSPHERE_FALLBACKS } from './shared';

export function buildHeroMode(photoMode: string): string {
  const atmosphere = PHOTO_MODE_ATMOSPHERE_FALLBACKS[photoMode];
  return atmosphere ? `PHOTO_MODE_ATMOSPHERE: ${atmosphere}` : '';
}
