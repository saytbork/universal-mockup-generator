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

/** Maps viewpoint selector values to natural-language directives. */
const VIEWPOINT_MAP: Record<string, string> = {
  'eye-level': 'eye-level straight-on — camera at product mid-height, parallel to ground',
  'top-down': 'top-down overhead — camera directly above product, 90° looking down',
  'human-pov': 'human point-of-view — slight downward angle as seen by a standing person',
  'suspended': 'suspended floating — camera slightly below product equator, looking upward',
  'display-view': 'display-optimized — slight elevated front angle for shelf/display legibility',
};

export function buildCameraOverrides(state?: StudioUIState): string {
  const cameraSystem = String(
    state?.cameraSystem ||
    state?.cameraSystemOverride ||
    'DSLR / mirrorless'
  ).trim();
  const angle = String(
    state?.cameraAngle ||
    state?.angleOverride ||
    '45° hero'
  ).trim();
  const distance = String(
    state?.cameraDistance ||
    state?.distanceOverride ||
    'Standard'
  ).trim();
  const rotation = String(
    state?.cameraRotation ||
    state?.rotationOverride ||
    '0°'
  ).trim();
  const framingGuide = String(
    state?.framingGuide ||
    state?.framingGuideOverride ||
    'Centered hero'
  ).trim();
  const viewpoint = String(state?.viewpoint || '').trim().toLowerCase();

  const lensProfile = resolveLensProfile(distance);
  const distortion = resolveDistortion(distance);
  const depthStyle = resolveDepthStyle(distance, cameraSystem);

  const parts = [
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
  ];

  // Viewpoint injection — last-selection-wins, overrides implicit angle when specified
  if (viewpoint && VIEWPOINT_MAP[viewpoint]) {
    parts.push(`STUDIO_VIEWPOINT: ${VIEWPOINT_MAP[viewpoint]}.`);
  }

  return parts.join(' ');
}
