export type StudioCreativeIntent =
  | 'conversion'
  | 'luxury'
  | 'clinical'
  | 'campaign';

export type StudioWorld =
  | 'studio'
  | 'underwater'
  | 'splash-tank'
  | 'beach-daylight';

export type StudioMotion =
  | 'static'
  | 'dispensed'
  | 'pouring'
  | 'falling';

export type StudioComposition =
  | 'hero'
  | 'flat-lay'
  | 'macro'
  | 'ingredient-stack'
  | 'carousel';

export interface StudioAuthorityBundle {
  creativeIntent: StudioCreativeIntent;
  world: StudioWorld;
  motion: StudioMotion;
  composition: StudioComposition;

  permissions: {
    allowSplash: boolean;
    allowAtmosphere: boolean;
    allowParticles: boolean;
    allowHorizontalSpread: boolean;
    allowVerticalDominance: boolean;
  };
}

export interface StudioUIState {
  creativeIntent: StudioCreativeIntent;
  world?: StudioWorld;
  motion: StudioMotion;
  composition: StudioComposition;
  lightingModelOverride?: string;
  aspectRatio?: '1:1' | '4:5' | '9:16' | '16:9' | string;
  photoMode?: string;
  subjectOrientation?: 'vertical' | 'horizontal' | 'square';
  fruitSubmerged?: boolean;
  requestedModifiers?: string[];
  customLightColor?: string;
  lightColorTemp?: string;
  accentLightIntensity?: number;
  splashAdMode?: boolean;
  splashFreezeMoment?: string;
  splashMotionIntensity?: string;
  winePrestigeMode?: boolean;
  winePrestigeV2Mode?: boolean;
  wineContextPreset?: string;
  wineLightingTone?: string;
  wineMoodModifier?: string;
  wineAction?: 'static-presentation' | 'controlled-pour';
  winePourStyle?: 'slow-ribbon' | 'mid-flow-elegance' | 'peak-glass-impact';
  bundle?: {
    enabled: boolean;
    primaryProductId?: string;
  };
}
