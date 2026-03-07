import type { StudioUIState } from '../types/studioTypes.ts';

type MacroCameraState = StudioUIState & {
  macroTightness?: string;
  photoModeSettingMacroTightness?: string;
  macroTightnessMode?: string;
  dewMacroTightness?: string;
};

function resolveLensProfile(distance: string): string {
  const normalized = distance.toLowerCase();
  if (normalized.includes('macro')) return '100mm macro equivalent';
  if (normalized.includes('wide')) return '35mm equivalent';
  if (normalized.includes('tight')) return '85mm equivalent';
  return '50mm equivalent';
}

function resolveMacroTightness(state?: StudioUIState): 'tight' | 'extreme' {
  const s = (state || {}) as MacroCameraState;
  const settings = s.photoModeDynamicSettings || {};
  const candidates = [
    s.macroTightness,
    s.photoModeSettingMacroTightness,
    s.macroTightnessMode,
    s.dewMacroTightness,
    settings.macroTightness,
    settings.photoModeSettingMacroTightness,
    settings.macroTightnessMode,
    settings.dewMacroTightness,
  ];
  for (const candidate of candidates) {
    const value = String(candidate || '').trim().toLowerCase();
    if (value === 'tight') return 'tight';
    if (value === 'extreme') return 'extreme';
  }
  return 'extreme';
}

function resolveDistortion(distance: string): string {
  const normalized = distance.toLowerCase();
  if (normalized.includes('wide')) return 'mild barrel distortion risk (controlled)';
  if (normalized.includes('macro')) return 'near-zero distortion with macro field compression';
  if (normalized.includes('tight')) return 'minimal distortion with telephoto compression';
  return 'zero distortion baseline';
}

/** Maps viewpoint selector values to natural-language directives. */
const VIEWPOINT_MAP: Record<string, string> = {
  'eye-level': 'eye-level straight-on — camera at product mid-height, parallel to ground',
  'top-down': 'top-down overhead — camera directly above product, 90° looking down',
  'human-pov': 'handheld first-person product viewpoint — slight downward angle with natural operator perspective',
  'suspended': 'suspended floating — camera slightly below product equator, looking upward',
  'display-view': 'display-optimized — slight elevated front angle for shelf/display legibility',
};

export function buildCameraOverrides(state?: StudioUIState): string {
  const photoMode = String(state?.photoMode || '').trim();
  if (photoMode === 'Splash Shot') {
    return [
      'STUDIO_CAMERA_SYSTEM: DSLR / mirrorless camera system.',
      'CAMERA_STABILITY_LOCK: Camera roll must remain exactly 0 degrees. The horizon must remain level. Do not apply Dutch angle. Do not simulate camera tilt. The camera optical axis must remain perpendicular to the ground plane.',
      'STUDIO_CAMERA_ANGLE: Eye level.',
      'STUDIO_CAMERA_DISTANCE: Standard.',
      'LENS_PROFILE: 85mm equivalent.',
      'DISTORTION: minimal distortion with telephoto compression.',
      'STUDIO_CAMERA_ROTATION: 0°.',
      'ROTATION: 0°.',
      'STUDIO_FRAMING_GUIDE: Directional splash hero.',
      'FRAMING: Directional splash hero.',
      'STUDIO_VIEWPOINT: splash-impact composition with visible impact origin near product base.',
    ].join(' ');
  }
  if (photoMode === 'Macro Dew Label') {
    const tightness = resolveMacroTightness(state);
    const macroFramingRule =
      tightness === 'tight'
        ? 'MACRO_FRAMING_RULE: close macro framing with label dominant while retaining a small bottle context.'
        : 'MACRO_FRAMING_RULE: extreme macro framing where label area and adjacent material texture occupy most of the frame.';

    return [
      'STUDIO_CAMERA_SYSTEM: DSLR / mirrorless camera system.',
      'CAMERA_STABILITY_LOCK: Camera roll must remain exactly 0 degrees. The horizon must remain level. Do not apply Dutch angle. Do not simulate camera tilt. The camera optical axis must remain perpendicular to the ground plane.',
      'STUDIO_CAMERA_ANGLE: Macro close-up.',
      'STUDIO_CAMERA_DISTANCE: Macro.',
      'LENS_PROFILE: 100mm macro equivalent.',
      'DISTORTION: near-zero distortion with macro field compression.',
      'DEPTH_STYLE: natural photographic depth. Subtle background tonal separation allowed. Soft atmospheric falloff allowed. Gradual luminance transition across the background. No CGI-style flat gradient fields.',
      'STUDIO_CAMERA_ROTATION: 0°.',
      'ROTATION: 0°.',
      'STUDIO_FRAMING_GUIDE: Macro detail.',
      'FRAMING: Macro detail.',
      'STUDIO_VIEWPOINT: macro label-plane close-up.',
      macroFramingRule,
    ].join(' ');
  }

  const cameraSystem = String(state?.cameraSystem || state?.cameraSystemOverride || '').trim();
  const angle = String(state?.cameraAngle || state?.angleOverride || '').trim();
  const distance = String(state?.cameraDistance || state?.distanceOverride || '').trim();
  const rotation = String(state?.cameraRotation || state?.rotationOverride || '').trim();
  const framingGuide = String(state?.framingGuide || state?.framingGuideOverride || '').trim();
  const viewpoint = String(state?.viewpoint || '').trim().toLowerCase();

  if (!cameraSystem || !angle || !distance || !rotation || !framingGuide) return '';

  const lensProfile = resolveLensProfile(distance);
  const distortion = resolveDistortion(distance);

  const parts = [
    `STUDIO_CAMERA_SYSTEM: ${cameraSystem}.`,
    // V1 camera stability guardrail — camera must remain level at all times
    'CAMERA_STABILITY_LOCK: Camera roll must remain exactly 0 degrees. The horizon must remain level. Do not apply Dutch angle. Do not simulate camera tilt. The camera optical axis must remain perpendicular to the ground plane.',
    `STUDIO_CAMERA_ANGLE: ${angle}.`,
    `STUDIO_CAMERA_DISTANCE: ${distance}.`,
    `LENS_PROFILE: ${lensProfile}.`,
    `DISTORTION: ${distortion}.`,
    // V1 depth realism — natural photographic depth, no flat CGI rendering
    'DEPTH_STYLE: natural photographic depth. Subtle background tonal separation allowed. Soft atmospheric falloff allowed. Gradual luminance transition across the background. No CGI-style flat gradient fields.',
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
