import type { StudioAuthorityBundle, StudioUIState } from '../types/studioTypes.ts';

/**
 * GEMINI FIX: Build geometry lock instruction to prevent product distortion
 * Uses optical/physical language to enforce rigid proportions
 */
export function buildGeometry(authority: StudioAuthorityBundle, state?: StudioUIState): string {
  if (state?.winePrestigeMode) {
    return 'GEOMETRY_LOCK: Product references are provided in normalized frames matching the output aspect ratio. Each product maintains exact width-to-height ratio, proportions, and label geometry. Preserve proportions independent of selected lens profile. Never stretch, compress, warp, or alter geometry. Preserve strict label/text fidelity and reference integrity.';
  }
  if (state?.advancedControls) {
    return 'GEOMETRY_LOCK: Product references are provided in normalized frames matching the output aspect ratio. Each product maintains its exact intended width-to-height ratio. Preserve proportions independent of selected lens profile. Maintain rigid orthographic proportions for all products shown. Fill any empty canvas space with environmental context (surfaces, backgrounds, props, atmospheric lighting effects), NEVER by stretching, compressing, or warping the product geometry.';
  }
  // Product references are pre-normalized to target aspect ratio with light padding
  // Model must respect these exact proportions without geometric distortion
  return `GEOMETRY_LOCK: Product references are provided in normalized frames matching the output aspect ratio. Each product maintains its exact intended width-to-height ratio. Preserve proportions independent of selected lens profile. Fill any empty canvas space with environmental context (surfaces, backgrounds, props, atmospheric lighting effects), NEVER by stretching, compressing, or warping the product geometry. Maintain rigid orthographic proportions for all products shown.`;
}
