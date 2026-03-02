import { industryPresets } from './industryPresets';
import { industryRules } from './industryRules';
import type { IndustryProfile } from './types';

type SoftState = {
  visualIntent?: string;
  lighting?: string;
  composition?: string;
  photoMode?: string;
  wineLightingTone?: string;
  tilt?: number;
  rotation?: number;
  cameraUiRotationLabel?: string;
};

const PRESET_WORLD_TO_PHOTO_MODE: Record<string, string> = {
  'clinical-lab-counter': 'Clinical Lab Counter',
  'dark-luxury-studio': 'Dark Premium Studio',
  'warm-window-editorial': 'Warm Window Wood',
};

const INDUSTRY_VISUAL_INTENT_ALLOWED: Record<IndustryProfile, string[]> = {
  supplements: ['conversion', 'campaign'],
  wine: ['campaign'],
  coffee: ['campaign', 'conversion'],
  beauty: ['campaign', 'conversion'],
  luxury: ['campaign', 'conversion'],
  tech: ['conversion', 'campaign'],
  general: ['conversion', 'campaign'],
};

const INDUSTRY_LIGHTING_ALLOWED: Record<IndustryProfile, string[]> = {
  supplements: ['clinical-softbox', 'natural-light', 'overcast', 'cozy-indoors', 'ring-light'],
  wine: ['warm-lateral', 'golden-ambient', 'cellar-dramatic', 'candle-intimate'],
  coffee: ['natural-light', 'cozy-indoors', 'overcast'],
  beauty: ['natural-light', 'clinical-softbox', 'overcast', 'cozy-indoors'],
  luxury: ['cozy-indoors', 'natural-light', 'overcast'],
  tech: ['clinical-softbox', 'natural-light', 'overcast'],
  general: ['natural-light', 'clinical-softbox', 'overcast', 'cozy-indoors'],
};

const PRESET_VISUAL_INTENT_FALLBACK: Record<IndustryProfile, string> = {
  supplements: 'conversion',
  wine: 'campaign',
  coffee: 'campaign',
  beauty: 'campaign',
  luxury: 'campaign',
  tech: 'conversion',
  general: 'conversion',
};

const normalize = (value: unknown): string => String(value ?? '').trim();

const parseRotationLabel = (value: string | undefined): number | undefined => {
  const match = String(value ?? '').trim().match(/^(-?\d+)\s*°$/);
  if (!match) return undefined;
  const parsed = Number(match[1]);
  return Number.isFinite(parsed) ? parsed : undefined;
};

export function applyIndustryProfileSoft<T extends SoftState>(
  currentState: T,
  newProfile: IndustryProfile
): T {
  const nextState = { ...currentState };
  const rules = industryRules[newProfile];
  const preset = industryPresets[newProfile];

  const currentVisualIntent = normalize(nextState.visualIntent);
  if (
    !currentVisualIntent ||
    !INDUSTRY_VISUAL_INTENT_ALLOWED[newProfile].includes(currentVisualIntent)
  ) {
    nextState.visualIntent = PRESET_VISUAL_INTENT_FALLBACK[newProfile] as T['visualIntent'];
  }

  const currentLighting = normalize(nextState.lighting).toLowerCase();
  if (!currentLighting || !INDUSTRY_LIGHTING_ALLOWED[newProfile].includes(currentLighting)) {
    nextState.lighting = preset.lighting as T['lighting'];
  }
  const wantsWineLighting = newProfile === 'wine';
  if (wantsWineLighting) {
    const currentWineLightingTone = normalize(nextState.wineLightingTone).toLowerCase();
    if (
      !currentWineLightingTone ||
      !['warm lateral', 'golden ambient', 'cellar dramatic', 'candle intimate'].includes(currentWineLightingTone)
    ) {
      nextState.wineLightingTone = 'Warm Lateral' as T['wineLightingTone'];
    }
  }

  const currentComposition = normalize(nextState.composition).toLowerCase();
  const allowedCompositions = ['centered', 'thirds', 'asymmetrical', 'flatlay', 'pedestal', 'balanced'];
  if (!currentComposition || !allowedCompositions.includes(currentComposition)) {
    nextState.composition = preset.composition as T['composition'];
  }

  const currentPhotoMode = normalize(nextState.photoMode);
  const preferredPhotoMode = PRESET_WORLD_TO_PHOTO_MODE[preset.world];
  const allowedPhotoModes = Array.isArray(rules?.allowedPhotoModes) ? rules.allowedPhotoModes : [];
  const photoModeInvalidByIndustry =
    allowedPhotoModes.length > 0 && (!currentPhotoMode || !allowedPhotoModes.includes(currentPhotoMode));
  if (photoModeInvalidByIndustry) {
    nextState.photoMode = (
      (preferredPhotoMode && allowedPhotoModes.includes(preferredPhotoMode) ? preferredPhotoMode : allowedPhotoModes[0]) ||
      currentPhotoMode
    ) as T['photoMode'];
  } else if (!currentPhotoMode && preferredPhotoMode) {
    nextState.photoMode = preferredPhotoMode as T['photoMode'];
  }

  const currentTilt =
    typeof nextState.tilt === 'number'
      ? nextState.tilt
      : parseRotationLabel(nextState.cameraUiRotationLabel) ?? nextState.rotation;

  if (newProfile === 'wine') {
    if (currentTilt === 0 || currentTilt === undefined) {
      if (Object.prototype.hasOwnProperty.call(nextState, 'tilt')) {
        nextState.tilt = preset.tilt as T['tilt'];
      }
      if (Object.prototype.hasOwnProperty.call(nextState, 'rotation')) {
        nextState.rotation = 5 as T['rotation'];
      }
      nextState.cameraUiRotationLabel = `${preset.tilt}°` as T['cameraUiRotationLabel'];
    }
  } else {
    if ((typeof currentTilt === 'number' && currentTilt !== 0) || normalize(nextState.cameraUiRotationLabel)) {
      if (Object.prototype.hasOwnProperty.call(nextState, 'tilt')) {
        nextState.tilt = 0 as T['tilt'];
      }
      if (Object.prototype.hasOwnProperty.call(nextState, 'rotation')) {
        nextState.rotation = 0 as T['rotation'];
      }
      nextState.cameraUiRotationLabel = '0°' as T['cameraUiRotationLabel'];
    }
  }

  return nextState as T;
}
