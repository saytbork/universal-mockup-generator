import type { StudioUIState } from '../types/studioTypes.ts';

export function buildCameraOverrides(state?: StudioUIState): string {
  const cameraSystem = String(state?.cameraSystem || state?.cameraSystemOverride || '').trim();
  const angle = String(state?.cameraAngle || state?.angleOverride || '').trim();
  const distance = String(state?.cameraDistance || state?.distanceOverride || '').trim();
  const rotation = String(state?.cameraRotation || state?.rotationOverride || '').trim();
  const framingGuide = String(state?.framingGuide || state?.framingGuideOverride || '').trim();

  if (!cameraSystem || !angle || !distance || !rotation || !framingGuide) return '';

  return [
    `STUDIO_CAMERA_SYSTEM: ${cameraSystem}.`,
    `STUDIO_CAMERA_ANGLE: ${angle}.`,
    `STUDIO_CAMERA_DISTANCE: ${distance}.`,
    `STUDIO_CAMERA_ROTATION: ${rotation}.`,
    `STUDIO_FRAMING_GUIDE: ${framingGuide}.`,
  ].join(' ');
}
