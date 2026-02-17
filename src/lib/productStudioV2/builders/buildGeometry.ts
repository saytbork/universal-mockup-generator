import type { StudioAuthorityBundle } from '../types/studioTypes.ts';

/**
 * GEMINI FIX: Build geometry lock instruction to prevent product distortion
 * Uses optical/physical language to enforce rigid proportions
 */
export function buildGeometry(authority: StudioAuthorityBundle): string {
  // Product references are pre-normalized to target aspect ratio with light padding
  // Model must respect these exact proportions without geometric distortion
  return `GEOMETRY_LOCK: Product references are provided in normalized frames matching the output aspect ratio. Each product maintains its exact intended width-to-height ratio. Render the scene as if using a 50mm prime lens with zero optical distortion. Fill any empty canvas space with environmental context (surfaces, backgrounds, props, atmospheric lighting effects), NEVER by stretching, compressing, or warping the product geometry. Maintain rigid orthographic proportions for all products shown.`;
}
