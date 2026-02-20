import type { StudioUIState } from '../types/studioTypes.ts';

function resolveLensProfile(distance: string): string {
  const normalized = distance.toLowerCase();
  if (normalized.includes('macro')) return '100mm macro equivalent';
  if (normalized.includes('wide')) return '35mm equivalent';
  if (normalized.includes('tight')) return '85mm equivalent';
  return '50mm equivalent';
}

function resolveDistortion(distance: string): string {
  const normalized = distance.toLowerCase();
  if (normalized.includes('wide')) return 'mild barrel distortion risk (controlled)';
  if (normalized.includes('macro')) return 'near-zero distortion with macro field compression';
  if (normalized.includes('tight')) return 'minimal distortion with telephoto compression';
  return 'zero distortion baseline';
}

function resolveDepthStyle(distance: string, cameraSystem: string): string {
  const normalizedDistance = distance.toLowerCase();
  const normalizedSystem = cameraSystem.toLowerCase();
  if (normalizedDistance.includes('macro') || normalizedSystem.includes('macro')) {
    return 'micro depth isolation with controlled falloff';
  }
  if (normalizedDistance.includes('tight') || normalizedSystem.includes('telephoto')) {
    return 'compressed depth with cinematic optical falloff';
  }
  if (normalizedDistance.includes('wide')) {
    return 'deep perspective depth with broad scene context';
  }
  return 'balanced optical depth falloff';
}

export function buildCameraOverrides(state?: StudioUIState): string {
  const cameraSystem = String(state?.cameraSystem || state?.cameraSystemOverride || '').trim();
  const angle = String(state?.cameraAngle || state?.angleOverride || '').trim();
  const distance = String(state?.cameraDistance || state?.distanceOverride || '').trim();
  const rotation = String(state?.cameraRotation || state?.rotationOverride || '').trim();
  const framingGuide = String(state?.framingGuide || state?.framingGuideOverride || '').trim();

  if (!cameraSystem || !angle || !distance || !rotation || !framingGuide) return '';

  const lensProfile = resolveLensProfile(distance);
  const distortion = resolveDistortion(distance);
  const depthStyle = resolveDepthStyle(distance, cameraSystem);

  return [
    `STUDIO_CAMERA_SYSTEM: ${cameraSystem}.`,
    `STUDIO_CAMERA_ANGLE: ${angle}.`,
    `STUDIO_CAMERA_DISTANCE: ${distance}.`,
    `LENS_PROFILE: ${lensProfile}.`,
    `DISTORTION: ${distortion}.`,
    `DEPTH_STYLE: ${depthStyle}.`,
    `STUDIO_CAMERA_ROTATION: ${rotation}.`,
    `ROTATION: ${rotation}.`,
    `STUDIO_FRAMING_GUIDE: ${framingGuide}.`,
    `FRAMING: ${framingGuide}.`,
  ].join(' ');
}
