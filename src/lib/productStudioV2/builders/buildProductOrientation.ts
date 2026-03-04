import type { StudioUIState } from '../types/studioTypes.ts';

/**
 * buildProductOrientation
 *
 * Global vertical-axis safety system.
 * Enforces upright product orientation by default; emits a user-rotation
 * override only when rotationEnabled === true.
 *
 * Design contract:
 *   productOrientation = "upright" (default) OR rotationEnabled = false/unset
 *     → PRODUCT_ORIENTATION_LOCK + VERTICAL_AXIS_ALIGNMENT + CAMERA_ROLL_LOCK
 *
 *   rotationEnabled = true
 *     → USER_ROTATION_OVERRIDE (no lock blocks — tilt is intentional)
 *
 * This builder operates independently of buildGeometry's inline orientation
 * blocks. The two layers reinforce each other at different positions in the
 * prompt, preventing the model from introducing lean at any rendering stage.
 *
 * Wine prestige mode and advanced controls bypass this module entirely because
 * those pipelines manage orientation through their own authority systems.
 */
export function buildProductOrientation(state?: StudioUIState): string {
  // Wine prestige and advanced controls manage orientation independently
  if (state?.winePrestigeMode || state?.advancedControls) return '';

  const rotationEnabled = Boolean(state?.rotationEnabled);
  // productOrientation = "free" only when the field is explicitly set to "free"
  // AND rotationEnabled is true. An explicit "free" alone without rotationEnabled
  // does NOT unlock tilt — both signals must agree.
  const orientationFree =
    rotationEnabled && state?.productOrientation === 'free';

  if (rotationEnabled && orientationFree) {
    // User has explicitly unlocked rotation — emit override instead of lock
    const rotationAngle = Number(state?.rotationAngle ?? 0);
    return [
      `USER_ROTATION_OVERRIDE: Product rotation has been intentionally enabled by the user. Apply ${rotationAngle}° tilt to the product axis exactly as specified. Preserve label readability at the selected angle. All geometry proportion constraints remain in force.`,
    ].join(' ');
  }

  // Default path — lock product upright at all times
  return [
    'PRODUCT_ORIENTATION_LOCK: The product must remain perfectly upright with its vertical axis aligned to gravity. The base must remain horizontal. No tilt. No lean. No diagonal orientation. The product center axis must remain perpendicular to the ground plane. The label plane must face the camera directly.',
    'VERTICAL_AXIS_ALIGNMENT: The bottle neck must align vertically with gravity. The product base must sit level relative to the ground surface. No angular offset relative to the vertical axis. No perspective-induced tilt correction required — the product is genuinely upright.',
    'CAMERA_ROLL_LOCK: Camera roll must remain 0 degrees. The horizon must remain perfectly level. Do not apply Dutch angle. Do not tilt the camera frame. The camera optical axis must remain perpendicular to the ground plane.',
  ].join(' ');
}
