export type StudioCreativeIntent =
  | 'conversion'
  | 'luxury'
  | 'clinical'
  | 'campaign';

export type StudioWorld =
  | 'studio'
  | 'underwater'
  | 'splash-tank';

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
}
