import { industryPresets } from './industryPresets';
import { industryRules } from './industryRules';
import type { IndustryProfile } from './types';

type SoftState = {
  visualIntent?: string;
  lighting?: string;
  composition?: string;
  photoMode?: string;
  visualStyle?: string;
  wineLightingTone?: string;
  tilt?: number;
  rotation?: number;
  cameraUiRotationLabel?: string;
};

const PRESET_WORLD_TO_VISUAL_STYLE: Record<string, string> = {
  'clinical-lab-counter': 'Clinical Lab Counter',
  'dark-luxury-studio': 'Dark Premium Studio',
  'warm-window-editorial': 'Warm Window Wood',
};

const INDUSTRY_VISUAL_INTENT_ALLOWED: Record<IndustryProfile, string[]> = {
  supplements: ['conversion', 'campaign'],
  wine: ['campaign'],
  coffee: ['campaign', 'conversion'],
};

const INDUSTRY_LIGHTING_ALLOWED: Record<IndustryProfile, string[]> = {
  supplements: ['clinical-softbox', 'natural-light', 'overcast', 'cozy-indoors', 'ring-light'],
  wine: ['warm-lateral', 'golden-ambient', 'cellar-dramatic', 'candle-intimate'],
  coffee: ['natural-light', 'cozy-indoors', 'overcast'],
};

const PRESET_VISUAL_INTENT_FALLBACK: Record<IndustryProfile, string> = {
  supplements: 'conversion',
  wine: 'campaign',
  coffee: 'campaign',
};

const normalize = (value: unknown): string => String(value ?? '').trim();

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
  const allowedPhotoModes = Array.isArray(rules?.allowedPhotoModes) ? rules.allowedPhotoModes : [];
  const photoModeInvalidByIndustry =
    allowedPhotoModes.length > 0 && (!currentPhotoMode || !allowedPhotoModes.includes(currentPhotoMode));
  if (photoModeInvalidByIndustry) {
    nextState.photoMode = (
      allowedPhotoModes[0] ||
      currentPhotoMode
    ) as T['photoMode'];
  }

  const currentVisualStyle = normalize(nextState.visualStyle);
  const preferredVisualStyle = PRESET_WORLD_TO_VISUAL_STYLE[preset.world];
  const allowedVisualStyles = Array.isArray(rules?.allowedVisualStyles) ? rules.allowedVisualStyles : [];
  const visualStyleInvalidByIndustry =
    allowedVisualStyles.length > 0 && currentVisualStyle && !allowedVisualStyles.includes(currentVisualStyle);
  if (visualStyleInvalidByIndustry) {
    nextState.visualStyle = (
      (preferredVisualStyle && allowedVisualStyles.includes(preferredVisualStyle) ? preferredVisualStyle : allowedVisualStyles[0]) ||
      ''
    ) as T['visualStyle'];
  } else if (!currentVisualStyle && preferredVisualStyle) {
    nextState.visualStyle = preferredVisualStyle as T['visualStyle'];
  }

  return nextState as T;
}
