import type { IndustryProfile } from '@/lib/productStudio/types';

export enum MaterialState {
  FOAM = 'foam',
  CREAM = 'cream',
  GEL = 'gel',
  POWDER = 'powder',
}

export type StudioCreativeIntent =
  | 'conversion'
  | 'luxury'
  | 'clinical'
  | 'campaign';

export type StudioWorld =
  | 'studio'
  | 'underwater'
  | 'splash-tank'
  | 'beach-daylight'
  | 'water-surface';

export type StudioMotion =
  | 'static'
  | 'opened'
  | 'spilled'
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
  industryProfile: IndustryProfile;
  creativeIntent?: StudioCreativeIntent;
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
  environment?: string;
  environmentPreset?: string;
  environmentMode?: string;
  lighting?: string;
  lightingPreset?: string;
  lightingMode?: string;
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
  wineServeMode?: 'bottle-only' | 'served' | 'pouring';
  wineBottleFillMode?: 'just-opened' | 'partially-served';
  wineType?: string;
  carbonationLevel?: string;
  wineBottleState?: string;
  wineGlassMode?: string;
  wineGlassType?: string;
  wineClosureType?: string;
  wineColor?: 'red' | 'white' | 'rose';
  wineStyle?: 'still' | 'sparkling';
  sparklingIntensity?: 'None' | 'Subtle' | 'Visible';
  wineServeAmount?: string;
  serveVolumeMode?: string;
  wineEngineVersion?: number;
  wineEnvironment?: string;
  wineMicroVariation?: any;
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
  packagingType?: string;
  physicalPresence?: string;
  placementContext?: string;
  groundingMode?: string;
  interaction?: string;
  interactionProfile?: string;
  splashMedium?: string;
  motionIntensity?: string;
  freezeMoment?: string;
  productStability?: string;
  macroTightness?: string;
  dropletMode?: string;
  dropletDensity?: string;
  highlightControl?: string;
  packagingBehavior?: string;
  specialEffect?: string;
  visualStyle?: string;
  visualStyleCategory?: 'studio' | 'brand' | 'lifestyle';
  atmosphereMode?: string;
  lightingTemperatureProfile?: string;
  shadowProfile?: string;
  contrastProfile?: string;
  compositionProfile?: string;
  bundle?: {
    enabled: boolean;
    primaryProductId?: string;
  };
  // ── Menu option injections ──────────────────────────────────────────────────
  /** Basic lighting selector: natural-light | overcast | cozy-indoors | ring-light */
  basicLighting?: string;
  /** Viewpoint: eye-level | top-down | human-pov | suspended | display-view */
  viewpoint?: string;
  /** Physical placement: surface | held | supported | air-suspended */
  physicalPlacement?: string;
  /** Surface material for grounded/support-based placements. */
  physicalSurfaceType?: 'None' | 'Wood' | 'Stone' | 'Marble';
  /** Physical Presence — container material: plastic | metal | glass | rubber | mixed */
  productMaterial?: string;
  /** Physical Presence — product color descriptor (free text) */
  productColor?: string;
  /** Physical Presence — product form scale: small | medium | large */
  productFormScale?: string;
  /** Photo Mode dynamic sub-settings from photoModeConfig.dynamic (key→value pairs) */
  photoModeDynamicSettings?: Record<string, string>;
  /** Foam & Texture root controls from UI store */
  textureType?: string;
  textureDensity?: string;
  focusDistance?: string;
  cleanliness?: string;
  /** Canonical physical material state for material-driven photo modes (Foam/Cream/Gel/Powder). */
  materialState?: MaterialState;
  /** Full physical definition object from state.definition.physical — used by buildProductPhysical */
  productPhysicalDef?: {
    kind: string;
    v: Record<string, unknown>;
  };
  /** contextPreset value — used by buildWorld for studio environment context */
  contextPresetValue?: string;
  /** Ingredient objects text for Ingredient Stack / Ingredient Flat Lay modes (from state.props) */
  ingredientObjects?: string;
  /** Ingredient layout mode: grounded | top-view | auto */
  ingredientLayout?: string;
  /** Composition alignment hint from Studio UI. */
  alignment?: 'left' | 'center' | 'right' | 'centered' | 'left-space' | 'right-space' | string;

  // ── Brand palette / background color injection ──────────────────────────────
  /** Source of palette for background resolution: 'Use product label colors' | 'Brand Colors' | 'Custom' */
  productPaletteSource?: 'Use product label colors' | 'Brand Colors' | 'Custom';
  /** Primary extracted/brand color (hex) */
  productPaletteA?: string;
  /** Secondary extracted/brand color (hex) */
  productPaletteB?: string;
  /** Tertiary extracted/brand color (hex) */
  productPaletteC?: string;
  /** Brand system palette — used when productPaletteSource === 'Brand Colors' */
  brandPalette?: {
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
  };
  /** Hero Landing Page config subset needed by V2 background resolver */
  photoModeConfig?: {
    heroLandingPage?: {
      backgroundType?: 'Solid' | 'Gradient';
      legacyColorPopHero?: boolean;
      surfaceType?: 'None' | 'Wood' | 'Stone' | 'Marble';
      gradientStyle?: 'Soft' | 'Radial' | 'Vertical' | string;
      negativeSpace?: 'Tight' | 'Balanced' | 'Spacious' | string;
      contrastLevel?: 'Soft' | 'High' | string;
    };
  };
  /**
   * Product orientation control.
   * When rotationEnabled is false (default), the product axis is locked upright.
   * When rotationEnabled is true, rotationAngle (degrees) is applied as a tilt.
   */
  rotationEnabled?: boolean;
  /** Explicit tilt angle in degrees. Only applied when rotationEnabled = true. */
  rotationAngle?: number;
  /**
   * Product orientation mode.
   * "upright" (default) — vertical axis locked to gravity; no tilt permitted.
   * "free"              — orientation is unrestricted (used with rotationEnabled = true).
   */
  productOrientation?: 'upright' | 'free';

  /**
   * Resolved palette computed by buildPalette (runs first in the pipeline).
   * All downstream builders (buildStudioBackground, buildWorld) should read from here
   * instead of re-deriving from productPaletteA/B/C or brandPalette directly.
   *
   * source:
   *   "product" — derived from productPaletteA/B/C (product label extraction)
   *   "brand"   — derived from brandPalette.primaryColor/secondaryColor/accentColor
   *   "custom"  — user-entered custom colors (productPaletteSource === 'Custom')
   *   "neutral" — no palette data available; neutral light-gray fallback
   */
  resolvedPalette?: {
    primary: string;
    secondary: string;
    tertiary: string;
    source: 'product' | 'brand' | 'custom' | 'neutral';
  };
}
