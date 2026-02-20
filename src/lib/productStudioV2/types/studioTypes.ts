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
  | 'opened'
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
  advancedControls?: boolean;
  visualProfile?: string;
  visualIntent?: string;
  coffeeIndustryLayer?: boolean;
  coffeeVariant?: 'coffee-editorial-ritual' | 'coffee-premium-minimal' | 'coffee-color-pop-luxury';
  coffeeMoodProfile?:
    | 'ritual-editorial'
    | 'premium-minimal'
    | 'color-pop-luxury'
    | 'dark-architectural'
    | 'morning-natural'
    | 'modern-commercial';
  coffeeEnvironmentVariation?:
    | 'warm-wood-table'
    | 'stone-counter'
    | 'black-studio'
    | 'minimal-gradient'
    | 'sunlit-window'
    | 'modern-cafe'
    | 'dark-concrete'
    | 'architectural-shadow'
    | 'linen-surface'
    | 'marble-bar';
  autoRandomizeCoffeeEnvironment?: boolean;
  coffeeTemperatureProfile?: 'hot' | 'cold';
  coffeeSteamVisibility?: 'none' | 'subtle' | 'medium' | 'high';
  coffeeEspressoMode?: boolean;
  coffeeCompositionCoverage?: string;
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
  wineMoodProfile?: 'prestige' | 'editorial' | 'ecommerce' | 'dark-luxury' | 'modern-minimal';
  wineEnvironmentVariation?:
    | 'vineyard'
    | 'dark-cellar'
    | 'marble-bar'
    | 'minimal-gradient'
    | 'black-studio'
    | 'modern-kitchen'
    | 'luxury-dining'
    | 'moody-backlight'
    | 'sunlit-table'
    | 'architectural-shadow';
  autoRandomizeWineEnvironment?: boolean;
  wineAction?: 'static-presentation' | 'controlled-pour';
  winePourStyle?: 'slow-ribbon' | 'mid-flow-elegance' | 'peak-glass-impact';
  cameraSystem?: string;
  cameraAngle?: string;
  cameraDistance?: string;
  cameraRotation?: string;
  framingGuide?: string;
  cameraSystemOverride?: string;
  angleOverride?: string;
  distanceOverride?: string;
  rotationOverride?: string;
  framingGuideOverride?: string;
  productType?: string;
  interaction?: string;
  packagingBehavior?: string;
  specialEffect?: string;
  visualStyle?: string;
  lightingTemperatureProfile?: string;
  shadowProfile?: string;
  contrastProfile?: string;
  compositionProfile?: string;
  bundle?: {
    enabled: boolean;
    primaryProductId?: string;
  };
}
