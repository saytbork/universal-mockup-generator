import type { StudioUIState } from '../types/studioTypes.ts';

export function buildCameraOverrides(state?: StudioUIState): string {
  if (!state?.advancedControls) return '';

  const cameraSystem = String(state.cameraSystemOverride || '').trim() || 'DSLR / mirrorless camera system';
  const angle = String(state.angleOverride || '').trim() || '45° hero';
  const distance = String(state.distanceOverride || '').trim() || 'Standard';
  const rotation = String(state.rotationOverride || '').trim() || '0°';
  const framingGuide = String(state.framingGuideOverride || '').trim() || 'Centered hero';

  return [
    `CAMERA_SYSTEM_OVERRIDE: ${cameraSystem}.`,
    `ANGLE_OVERRIDE: ${angle}.`,
    `DISTANCE_OVERRIDE: ${distance}.`,
    `ROTATION_OVERRIDE: ${rotation}.`,
    `FRAMING_GUIDE_OVERRIDE: ${framingGuide}.`,
  ].join(' ');
}
