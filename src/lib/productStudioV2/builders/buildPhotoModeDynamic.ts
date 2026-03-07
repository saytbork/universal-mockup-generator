import type { StudioUIState } from '../types/studioTypes.ts';
import { buildHeroMode } from '../photoModes/heroMode';
import { resolvePhotoModeBuilder } from '../photoModes/router';
import { emitPhotoModeSettings, getDynamicSettings } from '../photoModes/shared';

type RoutineCarouselState = StudioUIState & {
  routineFrameCount?: string | number;
  frameCount?: string | number;
  carouselFrameCount?: string | number;
  routineFrames?: string | number;
  routineFlow?: string;
  flow?: string;
  carouselFlow?: string;
  routineConsistency?: string;
  consistency?: string;
  carouselConsistency?: string;
  routineHeroFrame?: string;
  heroFrame?: string;
  carouselHeroFrame?: string;
};

type MacroDewState = StudioUIState & {
  macroTightness?: string;
  photoModeSettingMacroTightness?: string;
  macroTightnessMode?: string;
  dewMacroTightness?: string;
  dropletMode?: string;
  photoModeSettingDropletMode?: string;
  dropletModeSetting?: string;
  dewDropletMode?: string;
  dropletDensity?: string;
  photoModeSettingDropletDensity?: string;
  dropletDensitySetting?: string;
  dewDropletDensity?: string;
  highlightControl?: string;
  photoModeSettingHighlightControl?: string;
  highlightControlSetting?: string;
  dewHighlightControl?: string;
};

function buildGenericDynamicContract(state?: StudioUIState): string {
  const photoMode = String(state?.photoMode || '').trim();
  const settings = getDynamicSettings(state);

  if (Object.keys(settings).length > 0) {
    return emitPhotoModeSettings(settings);
  }

  return buildHeroMode(photoMode);
}

function normalizeFrameCount(rawValues: Array<unknown>): '3' | '4' | '5' {
  for (const raw of rawValues) {
    const value = String(raw ?? '').trim();
    if (value === '3' || value === '4' || value === '5') return value;
    if (/^\d+$/.test(value)) {
      const numeric = Number(value);
      if (numeric <= 3) return '3';
      if (numeric === 4) return '4';
      if (numeric >= 5) return '5';
    }
  }
  return '3';
}

function normalizeRoutineFlow(rawValues: Array<unknown>): 'left-to-right' | 'circular' {
  for (const raw of rawValues) {
    const v = String(raw ?? '').trim().toLowerCase();
    if (!v) continue;
    if (v === 'circular') return 'circular';
    if (v.includes('left') || v.includes('right')) return 'left-to-right';
  }
  return 'left-to-right';
}

function normalizeConsistency(rawValues: Array<unknown>): 'same-background' | 'subtle-variation' {
  for (const raw of rawValues) {
    const v = String(raw ?? '').trim().toLowerCase();
    if (!v) continue;
    if (v.includes('subtle')) return 'subtle-variation';
    if (v.includes('same')) return 'same-background';
  }
  return 'same-background';
}

function normalizeHeroFrame(rawValues: Array<unknown>): 'first' | 'middle' | 'last' {
  for (const raw of rawValues) {
    const v = String(raw ?? '').trim().toLowerCase();
    if (!v) continue;
    if (v === 'middle' || v === 'center' || v === 'centre') return 'middle';
    if (v === 'last' || v === 'final') return 'last';
    if (v === 'first') return 'first';
  }
  return 'first';
}

function buildRoutineCarouselContract(state?: StudioUIState): string {
  const carouselState = (state || {}) as RoutineCarouselState;
  const settings = carouselState.photoModeDynamicSettings || {};

  const frameCount = normalizeFrameCount([
    carouselState.routineFrameCount,
    carouselState.frameCount,
    carouselState.carouselFrameCount,
    carouselState.routineFrames,
    settings.routineFrameCount,
    settings.frameCount,
    settings.carouselFrameCount,
    settings.routineFrames,
  ]);
  const routineFlow = normalizeRoutineFlow([
    carouselState.routineFlow,
    carouselState.flow,
    carouselState.carouselFlow,
    settings.routineFlow,
    settings.flow,
    settings.carouselFlow,
  ]);
  const consistency = normalizeConsistency([
    carouselState.routineConsistency,
    carouselState.consistency,
    carouselState.carouselConsistency,
    settings.routineConsistency,
    settings.consistency,
    settings.carouselConsistency,
  ]);
  const heroFrame = normalizeHeroFrame([
    carouselState.routineHeroFrame,
    carouselState.heroFrame,
    carouselState.carouselHeroFrame,
    settings.routineHeroFrame,
    settings.heroFrame,
    settings.carouselHeroFrame,
  ]);

  return [
    'PHOTO_MODE_DYNAMIC_CONTROLS:',
    'ROUTINE_CAROUSEL_MODE: active.',
    `FRAME_COUNT: ${frameCount}.`,
    `ROUTINE_FLOW: ${routineFlow}.`,
    `CONSISTENCY: ${consistency}.`,
    `HERO_FRAME: ${heroFrame}.`,
    'CAROUSEL_STRUCTURE: Generate a coherent routine sequence in one composite carousel layout. Each frame must show the same product with strict geometry and artwork consistency. Frames must read as a connected product-use or product-presence sequence, not as unrelated scenes.',
    'FRAME_LAYOUT_RULE: Render as a true multi-panel carousel composition. Do not collapse into a single hero image. All frames must remain visible in the final image.',
    'FRAME_CONSISTENCY_RULE: If CONSISTENCY = same-background, keep background and lighting architecture consistent across all frames. If CONSISTENCY = subtle-variation, allow only minor background or prop variation while preserving the same visual family.',
    'FLOW_RULE: If ROUTINE_FLOW = left-to-right, sequence must read clearly from left panel to right panel. If ROUTINE_FLOW = circular, composition must imply cyclical repetition or routine loop.',
    'HERO_FRAME_RULE: If HERO_FRAME = first, strongest emphasis in frame 1. If HERO_FRAME = middle, strongest emphasis in center frame. If HERO_FRAME = last, strongest emphasis in final frame.',
  ].join(' ');
}

function normalizeMacroTightness(rawValues: Array<unknown>): 'tight' | 'extreme' {
  for (const raw of rawValues) {
    const value = String(raw ?? '').trim().toLowerCase();
    if (!value) continue;
    if (value === 'extreme') return 'extreme';
    if (value === 'tight') return 'tight';
  }
  return 'extreme';
}

function normalizeDropletMode(rawValues: Array<unknown>): 'clean' | 'wet' | 'drops' {
  for (const raw of rawValues) {
    const value = String(raw ?? '').trim().toLowerCase();
    if (!value) continue;
    if (value === 'clean') return 'clean';
    if (value === 'wet') return 'wet';
    if (value === 'drops') return 'drops';
  }
  return 'drops';
}

function normalizeDropletDensity(rawValues: Array<unknown>): 'low' | 'balanced' | 'high' {
  for (const raw of rawValues) {
    const value = String(raw ?? '').trim().toLowerCase();
    if (!value) continue;
    if (value === 'low') return 'low';
    if (value === 'balanced') return 'balanced';
    if (value === 'high') return 'high';
  }
  return 'balanced';
}

function normalizeHighlightControl(rawValues: Array<unknown>): 'soft' | 'balanced' {
  for (const raw of rawValues) {
    const value = String(raw ?? '').trim().toLowerCase();
    if (!value) continue;
    if (value === 'soft') return 'soft';
    if (value === 'balanced') return 'balanced';
  }
  return 'balanced';
}

function buildMacroDewLabelContract(state?: StudioUIState): string {
  const macroState = (state || {}) as MacroDewState;
  const settings = macroState.photoModeDynamicSettings || {};

  const tightness = normalizeMacroTightness([
    macroState.macroTightness,
    macroState.photoModeSettingMacroTightness,
    macroState.macroTightnessMode,
    macroState.dewMacroTightness,
    settings.macroTightness,
    settings.photoModeSettingMacroTightness,
    settings.macroTightnessMode,
    settings.dewMacroTightness,
  ]);
  const dropletMode = normalizeDropletMode([
    macroState.dropletMode,
    macroState.photoModeSettingDropletMode,
    macroState.dropletModeSetting,
    macroState.dewDropletMode,
    settings.dropletMode,
    settings.photoModeSettingDropletMode,
    settings.dropletModeSetting,
    settings.dewDropletMode,
  ]);
  const dropletDensity = normalizeDropletDensity([
    macroState.dropletDensity,
    macroState.photoModeSettingDropletDensity,
    macroState.dropletDensitySetting,
    macroState.dewDropletDensity,
    settings.dropletDensity,
    settings.photoModeSettingDropletDensity,
    settings.dropletDensitySetting,
    settings.dewDropletDensity,
  ]);
  const highlightControl = normalizeHighlightControl([
    macroState.highlightControl,
    macroState.photoModeSettingHighlightControl,
    macroState.highlightControlSetting,
    macroState.dewHighlightControl,
    settings.highlightControl,
    settings.photoModeSettingHighlightControl,
    settings.highlightControlSetting,
    settings.dewHighlightControl,
  ]);

  return [
    'PHOTO_MODE_DYNAMIC_CONTROLS:',
    'MACRO_DEW_LABEL_MODE: active.',
    `MACRO_TIGHTNESS: ${tightness}.`,
    `DROPLET_MODE: ${dropletMode}.`,
    `DROPLET_DENSITY: ${dropletDensity}.`,
    `HIGHLIGHT_CONTROL: ${highlightControl}.`,
    'MACRO_CAPTURE_RULE: True macro proximity is mandatory. No medium framing. No wide framing. The primary label area must dominate the frame while remaining fully legible.',
    'LABEL_FIDELITY_RULE: Label typography fidelity is critical. No blur on key label text. No character reinterpretation. No text drift under droplet distortion.',
    'DEW_PHYSICS_RULE: Droplets must be physically plausible. Droplets must follow gravity and surface adhesion. No decorative fake splash behavior. No random condensation haze.',
    'OPTICAL_MACRO_RULE: Real macro magnification behavior. Shallow depth limited to non-text peripheral zones only. Primary label text plane must remain sharp.',
  ].join(' ');
}

export function buildPhotoModeDynamic(state?: StudioUIState): string {
  const photoMode = String(state?.photoMode || '').trim();
  if (photoMode === 'Routine Carousel') {
    // eslint-disable-next-line no-console
    console.log('[PHOTO MODE BUILDER RESOLVED]', 'buildRoutineCarouselContract');
    const contract = buildRoutineCarouselContract(state);
    // eslint-disable-next-line no-console
    console.log('[PHOTO MODE CONTRACT GENERATED]', JSON.stringify(contract));
    return contract;
  }
  if (photoMode === 'Macro Dew Label') {
    // eslint-disable-next-line no-console
    console.log('[PHOTO MODE BUILDER RESOLVED]', 'buildMacroDewLabelContract');
    const contract = buildMacroDewLabelContract(state);
    // eslint-disable-next-line no-console
    console.log('[PHOTO MODE CONTRACT GENERATED]', JSON.stringify(contract));
    return contract;
  }

  const builder = resolvePhotoModeBuilder(photoMode);

  // eslint-disable-next-line no-console
  console.log('[PHOTO MODE BUILDER RESOLVED]', builder ? builder.name || photoMode : 'buildGenericDynamicContract');

  let contract = builder ? builder(state) : buildGenericDynamicContract(state);
  if (photoMode === 'Wine Macro Label' && !/INTERACTION_MODE:/i.test(contract)) {
    contract = ['INTERACTION_MODE: label-inspection.', contract].filter(Boolean).join(' ');
  }

  // eslint-disable-next-line no-console
  console.log('[PHOTO MODE CONTRACT GENERATED]', JSON.stringify(contract));

  return contract;
}
