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
  coffeeMode?: 'studio' | 'ritual';
  coffeeMotion?: 'static' | 'controlled-pour';
  coffeeEnvironment?: string;
  coffeeLightingTone?: string;
  coffeeMood?: string;
  coffeeSteam?: 'none' | 'subtle' | 'visible';
  coffeeLiquidPhysics?: boolean;
  coffeeIndustryLayer?: boolean;
  coffeeVariant?:
    | 'coffee-editorial-ritual'
    | 'coffee-premium-minimal'
    | 'coffee-color-pop-luxury'
    | 'coffee-cinematic-luxury';
  coffeeMoodProfile?:
    | 'coffee-cinematic-luxury'
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
  coffeeLiquidPhysicsEnabled?: boolean;
  coffeeEspressoMode?: boolean;
  coffeeCompositionCoverage?: string;
  coffeePackagingIntent?:
    | 'pdp-clean'
    | 'premium-campaign'
    | 'dark-roast-luxury'
    | 'modern-minimal'
    | 'cold-brew-fresh'
    | 'bundle-hero';
  coffeeBeansScatter?: 'low' | 'medium' | 'high';
  coffeeCupAccent?: 'none' | 'side' | 'behind-small';
  coffeeEspressoSplash?: 'off' | 'controlled';
  coffeeIceMode?: 'off' | 'cold';
  coffeeSurfaceStyle?:
    | 'neutral-gradient'
    | 'dark-stone'
    | 'matte-wood'
    | 'concrete-minimal'
    | 'pure-white-pdp';
  coffeeTemperatureFeel?: 'warm-roast' | 'neutral-commercial' | 'cool-cold-brew';
  coffeeServeStyle?: 'cup-only' | 'cup-and-bag' | 'espresso-machine';
  productReferencePresent?: boolean;
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
  wineMoodProfile?: 'neutral' | 'prestige' | 'editorial' | 'ecommerce' | 'dark-luxury' | 'modern-minimal';
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
  wineType?: 'red' | 'white' | 'rosé' | 'sparkling-white' | 'sparkling-rosé';
  carbonationLevel?: 'none' | 'low' | 'medium' | 'high';
  wineBottleState?: 'sealed' | 'opened-with-cork-out' | 'opened-with-cork-nearby';
  wineGlassMode?: 'none' | 'empty' | 'filled';
  wineClosureType?: string;
  referenceProductCategory?: string;
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
  lensOverride?: string;
  lightingRigOverride?: string;
  finishOverride?: string;
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
