import type { StudioAuthorityBundle, StudioUIState } from '../types/studioTypes.ts';

/**
 * GEMINI FIX: Build geometry lock instruction to prevent product distortion
 * Uses optical/physical language to enforce rigid proportions
 */
export function buildGeometry(authority: StudioAuthorityBundle, state?: StudioUIState): string {
  if (state?.winePrestigeMode) {
  return 'GEOMETRY_LOCK: Product references are provided in normalized frames matching the output aspect ratio. Each product maintains exact width-to-height ratio, proportions, and label geometry. Preserve proportions independent of selected lens profile. Never stretch, compress, warp, or alter geometry. Preserve strict label/text fidelity and reference integrity. Objects must obey gravity. No levitation. No floating product.';
  }
  if (state?.advancedControls) {
  return 'GEOMETRY_LOCK: Product references are provided in normalized frames matching the output aspect ratio. Each product maintains its exact intended width-to-height ratio. Preserve proportions independent of selected lens profile. Maintain rigid orthographic proportions for all products shown. Fill any empty canvas space with environmental context (surfaces, backgrounds, props, atmospheric lighting effects), NEVER by stretching, compressing, or warping the product geometry. Objects must obey gravity. No levitation. No floating product.';
  }
  // Product references are pre-normalized to target aspect ratio with light padding
  // Model must respect these exact proportions without geometric distortion
  const geometryLock = `GEOMETRY_LOCK: Product references are provided in normalized frames matching the output aspect ratio. Each product maintains its exact intended width-to-height ratio. Preserve proportions independent of selected lens profile. Fill any empty canvas space with environmental context (surfaces, backgrounds, props, atmospheric lighting effects), NEVER by stretching, compressing, or warping the product geometry. Maintain rigid orthographic proportions for all products shown. Objects must obey gravity. No levitation. No floating product.`;

  // Orientation lock: enforce perfectly upright product axis unless user explicitly enables tilt.
  const rotationEnabled = Boolean(state?.rotationEnabled);
  const rotationAngle = Number(state?.rotationAngle ?? 0);

  const orientationBlocks = rotationEnabled
    ? [
        `PRODUCT_ORIENTATION: User-defined rotation active. Apply ${rotationAngle}° tilt to the product axis. Preserve label readability. All other geometry constraints remain in force.`,
      ]
    : [
        'PRODUCT_ORIENTATION_LOCK: The product must remain perfectly upright with its vertical axis aligned to gravity. The base of the product must be horizontal and fully stable. Do not tilt, lean, or rotate the object. No diagonal orientation. No perspective lean. No stylized angle. The object must appear standing straight unless a user-defined rotation parameter explicitly overrides this rule.',
        'VERTICAL_AXIS_ALIGNMENT: The product center axis must remain perpendicular to the ground plane. The bottle neck must align vertically with gravity. The product must not appear angled relative to the water surface or ground.',
        'CAMERA_ORIENTATION_LOCK: Camera roll must remain 0 degrees. Horizon must remain perfectly level. Do not simulate Dutch angle or stylized camera tilt.',
      ];

  return [geometryLock, ...orientationBlocks].join(' ');
}
