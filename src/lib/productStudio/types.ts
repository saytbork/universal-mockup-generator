/**
 * PRODUCT STUDIO TYPES
 * Complete type definitions per specification
 */

// ============================================================================
// PRODUCT ASSET
// ============================================================================

export type ProductAsset = {
    id: string;
    name: string;
    imageUrl: string;
    base64?: string;
    mimeType?: string;
    heightValue?: number | null;
    heightUnit?: 'cm' | 'in';
    // Extracted palette from product image
    palette?: {
        dominant: string;    // Primary color extracted from product
        secondary: string;   // Secondary color extracted from product
        accent?: string;     // Optional accent color extracted from product
    };
};

// ============================================================================
// ENVIRONMENT CONTEXT — SINGLE SOURCE OF TRUTH
// ============================================================================

/**
 * CANONICAL environment representation.
 * Rules:
 * - null = Studio mode (no environment allowed)
 * - macro required for Lifestyle/UGC
 * - micro optional refinement
 */
export interface EnvironmentContext {
    macro?: string | null;  // Kitchen, Bathroom, Living Room, etc.
    micro?: string | null;  // Countertop, Sink, Mirror, etc.
}

// ============================================================================
// PRODUCT TYPES
// ============================================================================

export type ProductType = 'dummy' | 'capsules' | 'gummies' | 'drops' | 'powder' | 'skincare' | 'device' | 'custom';

export type ProductColor = {
    hex: string;
    semanticName: string;
};

// ============================================================================
// PHYSICAL DEFINITIONS BY TYPE
// ============================================================================

export type CapsulesPhysical = {
    capsuleStyle: 'veggie' | 'gel' | 'white-opaque' | 'colored';
    capsuleContentColor: ProductColor;
    quantity: 1 | 2 | 3 | 4 | 6;
    layout: 'scattered' | 'grouped' | 'stacked';
    glassOfWater: boolean;
    spoon: boolean;
};

export type GummiesPhysical = {
    gummyColor: ProductColor;
    shape: 'bear' | 'cube' | 'drop' | 'generic';
    quantity: 3 | 5 | 7 | 'handful';
    bowl: boolean;
    plate: boolean;
};

export type DropsPhysical = {
    liquidColorMode: 'amber' | 'transparent' | 'custom';
    liquidCustomColor: ProductColor;
    dropperState: 'closed' | 'open-resting' | 'drop-suspended';
    interactionMode: 'sublingual' | 'mixed';
    glass: boolean;
    teaCup: boolean;
    minimalSpoon: boolean;
};

export type PowderPhysical = {
    powderColor: ProductColor;
    texture: 'fine' | 'grainy';
    presentation: 'loose-pile' | 'in-scoop' | 'in-container-rim';
    mixMode: 'water' | 'tea' | 'coffee' | 'smoothie';
    cupOrMug: boolean;
    scoop: boolean;
    spoon: boolean;
};

export type SkincarePhysical = {
    subtype: 'cream' | 'serum' | 'shampoo' | 'cleanser';
    texture: 'glossy' | 'matte';
    color: ProductColor;
    dispersion: 'drop' | 'smear' | 'dollop';
    towel: boolean;
    sink: boolean;
    minimalSurfaceOnly: boolean;
};

export type DevicePhysical = {
    material: 'plastic' | 'metal' | 'glass' | 'rubber' | 'mixed';
    color: ProductColor;
    scale: 'small' | 'medium' | 'large';
};

export type CustomPhysical = {
    material: 'plastic' | 'metal' | 'glass' | 'rubber' | 'mixed';
    color: ProductColor;
    scale: 'small' | 'medium' | 'large';
    propsAutoBlocked: true;
};

export type DummyPhysical = Record<string, never>;

export type PhysicalDefinition =
    | { kind: 'capsules'; v: CapsulesPhysical }
    | { kind: 'gummies'; v: GummiesPhysical }
    | { kind: 'drops'; v: DropsPhysical }
    | { kind: 'powder'; v: PowderPhysical }
    | { kind: 'skincare'; v: SkincarePhysical }
    | { kind: 'device'; v: DevicePhysical }
    | { kind: 'custom'; v: CustomPhysical }
    | { kind: 'dummy'; v: DummyPhysical };

export type ProductDefinition = {
    type: ProductType;
    color: ProductColor;
    physical: PhysicalDefinition;
};

// ============================================================================
// PRODUCT STATE & MOTION (Product-only)
// ============================================================================

export type ProductStateMotion = 'static' | 'opened' | 'spilled' | 'dispensed' | 'pouring' | 'falling';

// ============================================================================
// 1️⃣ MODE (ROOT BLOCKER)
// ============================================================================

export type ProductMode = 'studio' | 'editorial' | 'lifestyle-real' | 'ugc' | 'ecommerce';

/**
 * MODE LOCK RULES (CANONICAL)
 * Each mode enables/disables specific capabilities
 */
export type ModeLocks = {
    allowEnvironment: boolean;
    allowPersons: boolean;
    allowCreativeProps: boolean;
    allowScenicBackground: boolean;
};

export const MODE_LOCK_RULES: Record<ProductMode, ModeLocks> = {
    'studio': {
        allowEnvironment: false,
        allowPersons: false,
        allowCreativeProps: true,
        allowScenicBackground: false,
    },
    'editorial': {
        allowEnvironment: true,
        allowPersons: false,
        allowCreativeProps: true,
        allowScenicBackground: true,
    },
    'lifestyle-real': {
        allowEnvironment: true,
        allowPersons: true,
        allowCreativeProps: true,
        allowScenicBackground: true,
    },
    'ugc': {
        allowEnvironment: true,
        allowPersons: true,
        allowCreativeProps: true,
        allowScenicBackground: true,
    },
    'ecommerce': {
        allowEnvironment: false,
        allowPersons: false,
        allowCreativeProps: false,
        allowScenicBackground: false,
    },
};

// ============================================================================
// 3️⃣ BRAND & PALETTE (SINGLE COLOR AUTHORITY)
// ============================================================================

export type PaletteSourceType = 'auto' | 'brand-preset' | 'custom';

export type BrandPalette = {
    source: PaletteSourceType;
    primaryColor: string | null;
    secondaryColor: string | null;
    accentColor: string | null;
    brandPresetId: string | null;
};

// ============================================================================
// SCENE TYPE (Legacy - maps to MODE)
// ============================================================================

// NOTE: `ecommerce-pdp` is a NEW isolated pipeline. It must not inherit from existing scene pipelines.
export type SceneType = 'studio-branding' | 'editorial-product' | 'lifestyle-real' | 'ugc-phone' | 'ecommerce-pdp' | 'studio-hero';

// ============================================================================
// ECOMMERCE PDP IMAGE BUILDER (Isolated Pipeline)
// ============================================================================

export type EcommerceSlot =
    | 'WHAT_IS_IT'
    | 'WHAT_DOES_IT_DO'
    | 'HOW_IT_WORKS'
    | 'RESULTS'
    | 'DIFFERENTIATION'
    | 'GUARANTEE';

export type EcommercePdpLayout =
    | 'image-left-text-right'
    | 'image-right-text-left';

export type EcommercePdpImageSide = 'left' | 'right';

export type EcommercePdpSafeZone = {
    side: 'left' | 'right';
    widthPercent: 40;
};

export type EcommercePdpConfig = {
    slot: EcommerceSlot;
    layout: EcommercePdpLayout;
    imageSide: EcommercePdpImageSide;
    safeZone: EcommercePdpSafeZone;
};

// =============================================================================
// PHOTO MODE SYSTEM (PHASE 1 — LOCKED)
// =============================================================================

export type PhotoMode =
    // Studio modes
    | 'Hero Landing Page'
    | 'Color Pop Hero'
    | 'Ingredient Stack'
    | 'Ingredient Flat Lay'
    | 'Acrylic Blocks'
    | 'Glass Pedestal Studio'
    | 'Splash Shot'
    | 'Foam & Texture'
    | 'Routine Carousel'
    | 'Clinical Lab Counter'
    | 'Minimal Bathroom Vanity'
    | 'Dark Premium Studio'
    | 'Monochrome Brand'
    | 'Brand Campaign'
    | 'Creator Premium Simulation'
    | 'UGC Premium Simulation' // deprecated alias (backward compatibility)
    | 'Tech Clean Studio'
    // Lifestyle modes
    | 'Luxury Editorial Tabletop'
    | 'Soft Wellness Morning'
    | 'Golden Hour Lifestyle'
    | 'Outdoor Energy Boost'
    | 'Pastel Picnic'
    | 'Candy Gradient Lab'
    | 'Golden Mist Aura'
    // v2.1 realism modes
    | 'Sunlit Stone Editorial'
    | 'Golden Sunset Backlit'
    | 'Bathroom Daylight Clean'
    | 'Sky Float Minimal'
    | 'Wet Rock Ripples'
    | 'Hands Application Clean'
    | 'Underwater Split'
    | 'Sand Palm Shadows'
    | 'Botanical Water Garden'
    | 'Macro Dew Label'
    | 'Warm Window Wood'
    | 'Gel Smear Editorial'
    | 'Citrus Fresh Flat Lay'
    | 'Stones & Crystals Flat Lay'
    | 'Dried Citrus Earth'
    // Beverage/lifestyle effect variants (single-select Photo Modes)
    | 'Beach Foam Splash'
    | 'Pool Water'
    | 'Cheers (Hands Clink)'
    | 'Ice Cubes'
    | 'Condensation Droplets'
    | 'Fruit Garnish / Citrus Accents'
    | 'Textured Bed / Scatter Base'
    | 'Floating Particles';

export interface EnvironmentPhotoModeSchema {
    id: string;
    label: string;
    scope: 'environment' | 'studio';
    description: string;
    basePrompt: string; // The core Photo Mode prompt segments
    subOptions: {
        key: string;
        label: string;
        values: string[];
    }[];
    constraints: string[];
    /** Required placement for this Photo Mode. Hard-fail if mismatched. */
    requiredPlacement?: 'surface' | 'held' | 'supported' | 'air' | 'any';
    /** Interaction capability for this Photo Mode (capability layer; does not define industry authority). */
    interactionCapability?: 'none' | 'optional' | 'required';
    /** Motion capability for this Photo Mode (capability layer; does not define industry authority). */
    stateMotionCapability?: 'static-only' | 'limited' | 'extended';
    /** @deprecated Use interactionCapability + resolver hierarchy. */
    allowedInteractions?: ('none' | 'passive-presence' | 'cropped-hand' | 'supported-hold' | 'holding' | 'two-hand-hold' | 'presenting' | 'framed-presentation' | 'applying-opening' | 'capsule-display' | 'resting-interaction')[];
    /** 
     * Studio worlds: false (no persons, no hands, no presence)
     * Lifestyle/UGC worlds: true (persons allowed with valid placement/interaction)
     */
    allowsPersonPresence?: boolean;
}

export type HeroLandingPageBackgroundType = 'Solid' | 'Gradient';
export type HeroLandingPageGradientStyle = 'Soft' | 'Radial' | 'Vertical';
export type HeroLandingPageColorSource = 'Brand Colors' | 'Custom Color';
export type HeroLandingPagePaletteSource = 'Product label colors' | 'Neutral brand tones' | 'Custom';
export type HeroLandingPageNegativeSpace = 'Tight' | 'Balanced' | 'Spacious';
export type HeroLandingPageContrastLevel = 'Soft' | 'High';

export type ColorPopHeroBackgroundType = 'Solid' | 'Gradient';
export type ColorPopHeroGradientStyle = 'Soft' | 'Radial' | 'Vertical';
export type ColorPopHeroColorSource = 'Brand Colors' | 'Product Label Colors' | 'Custom Color';
export type ColorPopHeroSaturationLevel = 'Moderate' | 'High';
export type ColorPopHeroContrastStrategy = 'Soft' | 'High';
export type ColorPopHeroNegativeSpace = 'Tight' | 'Balanced' | 'Spacious';

export type IngredientStackIngredientFocus = 'Key active only' | 'Full formula';
export type IngredientStackStackStyle = 'Surround' | 'Split composition';
export type IngredientStackIngredientPresence = 'Subtle' | 'Balanced' | 'Hero';
export type IngredientStackLabelPriority = 'Always readable' | 'Secondary to ingredients';
export type IngredientStackBackgroundType = 'Solid' | 'Gradient';
export type IngredientStackGradientStyle = 'Soft' | 'Radial' | 'Vertical';
export type IngredientStackColorSource = 'Brand Colors' | 'Custom Color';

export type AcrylicBlocksBlockShape = 'Rectangular' | 'Cylindrical' | 'Mixed geometry';
export type AcrylicBlocksMaterialFinish = 'Clear' | 'Frosted' | 'Smoked';
export type AcrylicBlocksReflectionLevel = 'Minimal' | 'Balanced' | 'Glossy';
export type AcrylicBlocksElevation = 'Grounded' | 'Floating illusion';

export type SplashShotSplashMedium = 'Liquid' | 'Powder' | 'Mist';
export type SplashShotMotionIntensity = 'Subtle' | 'Dynamic' | 'Explosive';
export type SplashShotFreezeMoment = 'Early' | 'Mid-splash' | 'Peak';
export type SplashShotProductStability = 'Fully grounded' | 'Slight interaction';

export type FoamAndTextureTextureType = 'Foam' | 'Cream' | 'Gel' | 'Powder';
export type FoamAndTextureTextureDensity = 'Light' | 'Rich' | 'Dense';
export type FoamAndTextureFocusDistance = 'Macro' | 'Close';
export type FoamAndTextureCleanliness = 'Pristine' | 'Natural imperfections';

export type RoutineCarouselFrameCount = 3 | 4 | 5;
export type RoutineCarouselRoutineFlow = 'Left → Right' | 'Circular';
export type RoutineCarouselConsistency = 'Same background' | 'Subtle variation';
export type RoutineCarouselHeroFrame = 'First' | 'Middle' | 'Last';

export type ClinicalLabCounterClinicalTone = 'Soft clinical' | 'Crisp lab';
export type ClinicalLabCounterLabElements = 'Minimal' | 'Standard';
export type ClinicalLabCounterSurfaceType = 'White lab' | 'Neutral lab';
export type ClinicalLabCounterTrustLevel = 'Friendly' | 'Professional' | 'High authority';

export type GoldenMistAuraGlowStrength = 'Subtle' | 'Warm' | 'Radiant';
export type GoldenMistAuraMistStyle = 'Backlit' | 'Surround';
export type GoldenMistAuraMood = 'Calm' | 'Luxurious';
export type GoldenMistAuraContrast = 'Soft' | 'Cinematic';

export type CandyGradientLabGradientStyle = 'Candy pastel' | 'Bold candy';
export type CandyGradientLabColorCount = 'Duo' | 'Trio';
export type CandyGradientLabEdgeStyle = 'Soft blend' | 'Sharp transition';
export type CandyGradientLabPlayfulness = 'Controlled' | 'Fun' | 'Loud';

export type PhotoModeConfig = {
    heroLandingPage: {
        backgroundType: HeroLandingPageBackgroundType;
        gradientStyle: HeroLandingPageGradientStyle;
        colorSource: HeroLandingPageColorSource;
        paletteSource: HeroLandingPagePaletteSource;
        negativeSpace: HeroLandingPageNegativeSpace;
        contrastLevel: HeroLandingPageContrastLevel;
    };
    colorPopHero: {
        backgroundType: ColorPopHeroBackgroundType;
        gradientStyle: ColorPopHeroGradientStyle;
        colorSource: ColorPopHeroColorSource;
        saturationLevel: ColorPopHeroSaturationLevel;
        contrastStrategy: ColorPopHeroContrastStrategy;
        negativeSpace: ColorPopHeroNegativeSpace;
    };
    ingredientStack: {
        ingredientFocus: IngredientStackIngredientFocus;
        stackStyle: IngredientStackStackStyle;
        ingredientPresence: IngredientStackIngredientPresence;
        labelPriority: IngredientStackLabelPriority;
        /** Optional background override for Ingredient Stack only. */
        backgroundEnabled: boolean;
        backgroundType: IngredientStackBackgroundType;
        gradientStyle: IngredientStackGradientStyle;
        colorSource: IngredientStackColorSource;
    };
    acrylicBlocks: {
        blockShape: AcrylicBlocksBlockShape;
        materialFinish: AcrylicBlocksMaterialFinish;
        reflectionLevel: AcrylicBlocksReflectionLevel;
        elevation: AcrylicBlocksElevation;
    };
    splashShot: {
        splashMedium: SplashShotSplashMedium;
        motionIntensity: SplashShotMotionIntensity;
        freezeMoment: SplashShotFreezeMoment;
        productStability: SplashShotProductStability;
    };
    foamAndTexture: {
        textureType: FoamAndTextureTextureType;
        textureDensity: FoamAndTextureTextureDensity;
        focusDistance: FoamAndTextureFocusDistance;
        cleanliness: FoamAndTextureCleanliness;
    };
    routineCarousel: {
        frameCount: RoutineCarouselFrameCount;
        routineFlow: RoutineCarouselRoutineFlow;
        consistency: RoutineCarouselConsistency;
        heroFrame: RoutineCarouselHeroFrame;
    };
    clinicalLabCounter: {
        clinicalTone: ClinicalLabCounterClinicalTone;
        labElements: ClinicalLabCounterLabElements;
        surfaceType: ClinicalLabCounterSurfaceType;
        trustLevel: ClinicalLabCounterTrustLevel;
    };
    goldenMistAura: {
        glowStrength: GoldenMistAuraGlowStrength;
        mistStyle: GoldenMistAuraMistStyle;
        mood: GoldenMistAuraMood;
        contrast: GoldenMistAuraContrast;
    };
    candyGradientLab: {
        gradientStyle: CandyGradientLabGradientStyle;
        colorCount: CandyGradientLabColorCount;
        edgeStyle: CandyGradientLabEdgeStyle;
        playfulness: CandyGradientLabPlayfulness;
    };
    // New placeholder configs for missing modes to satisfy type system if needed
    ingredientFlatLay?: Record<string, any>;
    glassPedestalStudio?: Record<string, any>;
    minimalBathroomVanity?: Record<string, any>;
    darkPremiumStudio?: Record<string, any>;
    monochromeBrandWorld?: Record<string, any>;
    brandCampaignWorld?: Record<string, any>;
    ugcPremiumSimulation?: Record<string, any>;
    techCleanStudio?: Record<string, any>;
    luxuryEditorialTabletop?: Record<string, any>;
    softWellnessMorning?: Record<string, any>;
    goldenHourLifestyle?: Record<string, any>;
    outdoorEnergyBoost?: Record<string, any>;
    pastelPicnic?: Record<string, any>;
    // Schema-driven dynamic configuration
    dynamic?: Record<string, Record<string, string>>;
};

export type PhotoModeConfigPatch = {
    heroLandingPage?: Partial<PhotoModeConfig['heroLandingPage']>;
    colorPopHero?: Partial<PhotoModeConfig['colorPopHero']>;
    ingredientStack?: Partial<PhotoModeConfig['ingredientStack']>;
    acrylicBlocks?: Partial<PhotoModeConfig['acrylicBlocks']>;
    splashShot?: Partial<PhotoModeConfig['splashShot']>;
    foamAndTexture?: Partial<PhotoModeConfig['foamAndTexture']>;
    routineCarousel?: Partial<PhotoModeConfig['routineCarousel']>;
    clinicalLabCounter?: Partial<PhotoModeConfig['clinicalLabCounter']>;
    goldenMistAura?: Partial<PhotoModeConfig['goldenMistAura']>;
    candyGradientLab?: Partial<PhotoModeConfig['candyGradientLab']>;
    ingredientFlatLay?: Partial<Record<string, any>>;
    glassPedestalStudio?: Partial<Record<string, any>>;
    minimalBathroomVanity?: Partial<Record<string, any>>;
    darkPremiumStudio?: Partial<Record<string, any>>;
    monochromeBrandWorld?: Partial<Record<string, any>>;
    brandCampaignWorld?: Partial<Record<string, any>>;
    ugcPremiumSimulation?: Partial<Record<string, any>>;
    techCleanStudio?: Partial<Record<string, any>>;
    luxuryEditorialTabletop?: Partial<Record<string, any>>;
    softWellnessMorning?: Partial<Record<string, any>>;
    goldenHourLifestyle?: Partial<Record<string, any>>;
    outdoorEnergyBoost?: Partial<Record<string, any>>;
    pastelPicnic?: Partial<Record<string, any>>;
};

// ============================================================================
// ENVIRONMENT
// ============================================================================

export type EnvironmentMacro =
    | 'kitchen' | 'living-room' | 'bedroom' | 'bathroom' | 'workspace'
    | 'hallway' | 'home-gym' | 'balcony-indoor-terrace'
    | 'cgmp-facility'
    | 'urban-exterior' | 'natural-exterior' | 'parking-lot'
    | 'backyard-patio' | 'street-corner' | 'studio'
    | 'custom';

export type MicroPlace =
    | 'countertop' | 'kitchen-island' | 'sink-ledge' | 'dining-table'
    | 'coffee-table' | 'side-table' | 'shelf'
    | 'nightstand' | 'dresser-top'
    | 'vanity' | 'shower-shelf'
    | 'desk-surface' | 'keyboard-side' | 'notebook-area'
    | 'console-table'
    | 'bench' | 'mat-edge' | 'water-bottle-side'
    | 'table' | 'railing-ledge'
    | 'outdoor-table' | 'chair-armrest'
    | 'concrete-ledge' | 'stairs' | 'low-wall'
    | 'sidewalk-edge' | 'urban-bench'
    | 'car-hood' | 'trunk-edge'
    | 'rock' | 'wooden-surface' | 'picnic-table'
    | 'conveyor-belt' | 'filling-line'
    | 'neutral-surface'
    | 'custom';

export type Lighting =
    | 'natural-light' | 'sunny-day' | 'golden-hour' | 'overcast'
    | 'cozy-indoors' | 'ring-light' | 'mood-lighting'
    | 'night-mode' | 'flash-photo' | 'clinical-softbox';

// ============================================================================
// CAMERA & FRAMING (COMPREHENSIVE CONTROLS)
// ============================================================================

export type CameraSystem = 'dslr_mirrorless' | 'macro' | 'telephoto';
export type CameraAngle = 'eye_level' | '45_hero' | 'top_down' | 'low_angle' | 'high_angle' | 'detail_closeup';
export type CameraDistance = 'wide' | 'standard' | 'tight' | 'macro';
export type CameraRotation = 0 | 5 | 10 | 15;
export type CameraFraming = 'centered_hero' | 'rule_of_thirds' | 'left_negative' | 'right_negative' | 'grid_ready';

// ============================================================================
// CREATIVITY
// ============================================================================

export type CreativeTheme = 'clinical-minimal' | 'premium-clean' | 'bold-graphic' | 'ingredient-color' | 'fresh-bright' | 'dark-dramatic' | 'playful-pop' | 'tech-clean';
export type PaletteSource = 'brand' | 'warm-neutral' | 'cool-neutral' | 'complementary' | 'custom';
export type PropDensity = 'none' | 'low' | 'medium' | 'dense';
export type VisualIntent = 'conversion' | 'campaign';
export type EnergyLevel = 'low' | 'medium' | 'high';
export type ControlTier = 'basic' | 'pro';
export type IndustryProfile =
    | 'supplements'
    | 'wine'
    | 'beauty'
    | 'coffee'
    | 'luxury'
    | 'tech'
    | 'general';
export type VisualProfile = 'default' | 'wine-prestige' | IndustryProfile;
export type WineEnvironmentPreset =
    | 'Vineyard Golden Hour'
    | 'Oak Barrel Cellar'
    | 'Fine Dining Table'
    | 'Dark Luxury Studio'
    | 'Winery / Vineyard';
export type WineLightingTone = 'Warm Lateral' | 'Golden Ambient' | 'Cellar Dramatic' | 'Candle Intimate';
export type WineMoodModifier =
    | 'None'
    | 'Vintage Film Grain'
    | 'Terroir Mood Tone'
    | 'Deep Burgundy Contrast Boost'
    | 'Soft Barrel Ambient Haze'
    | 'Elegant Reflection Layer';
export type WineAction = 'static-presentation' | 'controlled-pour';
export type WinePourStyle = 'slow-ribbon' | 'mid-flow-elegance' | 'peak-glass-impact';

// NEW CREATIVITY V1 TYPES
export type CompositionMode = 'centered' | 'thirds' | 'asymmetrical' | 'flatlay' | 'pedestal';
export type SurfaceBase = 'neutral' | 'pedestal' | 'acrylic' | 'stone' | 'abstract';
export type ProductScale = 'dominant' | 'balanced' | 'oversized';
export type ProductSpacing = 'compact' | 'balanced' | 'airy'; // Replaces BundleSpacing usage in Creativity? or Global?
export type LightStyle = 'soft' | 'clinical' | 'contrast' | 'shadow-play';
export type NegativeSpace = 'none' | 'subtle' | 'intentional' | 'heavy';

// ============================================================================
// ECOMMERCE
// ============================================================================

export type BlankSpaceSide = 'left' | 'right';
export type AspectRatio = '1:1' | '4:5' | '3:4' | '9:16' | '4:3' | '16:9';

// ============================================================================
// BUNDLES v2
// ============================================================================

export type BundleModeV2 = 'off' | 'hero' | 'lineup' | 'editorial-cluster';
export type BundleLayout = 'lineal' | 'pyramid' | 'organic-cluster';
export type BundleSpacing = 'compact' | 'airy';

export type BundleDefinition = {
    enabled: boolean;
    mode: BundleModeV2;
    selectedBundleId: string | null;
    primaryProductId: string | null;
    secondaryProductIds: string[];
    layout: BundleLayout;
    spacing: BundleSpacing;
};

export type PrebuiltBundle = {
    id: string;
    name: string;
    minProducts: number;
    maxProducts: number;
    layout: BundleLayout;
    spacing: BundleSpacing;
};

// ============================================================================
// PRESET SYSTEM
// ============================================================================

export type PresetTier = 'basic' | 'pro';
export type OutputQualityProfile = 'luxury-brand' | 'ecommerce-conversion' | 'clinical';

// ============================================================================
// BRAND LOOK SYSTEMS (PRESETS)
// ============================================================================

export type BrandPresetId = 'ag1-style' | 'ritual-style' | 'olly-style' | 'luxury-minimal';

export type BrandPreset = {
    id: BrandPresetId;
    label: string;
    description: string;
    config: Partial<ProductStudioState>;
};

// ============================================================================
// PRODUCT STUDIO STATE (COMPLETE)
// ============================================================================


export type ProductPlacement = 'surface' | 'held' | 'supported' | 'air' | 'floating';
export type CustomIngredientCutStyle = 'whole' | 'sliced' | 'halved' | 'crushed' | 'powdered' | 'extract' | 'auto';
export type CustomIngredientFreshness = 'dry' | 'fresh' | 'wet' | 'condensed' | 'auto';
export type CustomIngredientDensity = 'minimal' | 'balanced' | 'abundant' | 'auto';
export type CustomIngredientPlacement = 'base' | 'surround' | 'background' | 'foreground' | 'auto';

export type CustomIngredient = {
    name: string;
    cutStyle?: CustomIngredientCutStyle;
    freshness?: CustomIngredientFreshness;
    density?: CustomIngredientDensity;
    placement?: CustomIngredientPlacement;
};

export type ProductStudioState = {
    products: ProductAsset[];
    activeProductId: string | null;

    // ========================================================================
    // 1️⃣ MODE (ROOT BLOCKER)
    // ========================================================================
    mode: ProductMode;

    // ========================================================================
    // 2️⃣ PRODUCT DEFINITION (PHYSICAL, NOT CREATIVE)
    // ========================================================================
    definition: ProductDefinition;
    handsHolding: boolean;
    packagingMode: 'without-box' | 'with-box';
    physicalScaleLabel: 'small-handheld' | 'medium-tabletop' | 'large-object';

    // ========================================================================
    // PRODUCT STATE & MOTION (Product-only, no human implied)
    // ========================================================================
    stateMotion: ProductStateMotion;

    // ========================================================================
    // 3️⃣ BRAND & PALETTE (SINGLE COLOR AUTHORITY)
    // ========================================================================
    palette: BrandPalette;

    // ========================================================================
    // 4️⃣ ENVIRONMENT — SINGLE SOURCE OF TRUTH
    // ========================================================================
    /**
     * CANONICAL environment field.
     * null = Studio mode (no environment)
     * { macro, micro } = Lifestyle/UGC
     */
    environmentContext: EnvironmentContext | null;

    // DEPRECATED LEGACY FIELDS — DO NOT USE
    // These exist only for backward compatibility, will be removed
    /** @deprecated Use environmentContext instead */
    sceneType: SceneType;
    /** @deprecated Use environmentContext instead */
    surface: SurfaceBase;
    /** @deprecated Use environmentContext.macro instead */
    environmentMacro: EnvironmentMacro;
    /** @deprecated Use environmentContext.micro instead */
    microPlace: MicroPlace;
    /** @deprecated Use environmentContext.macro instead */
    customEnvironmentText: string;
    /** @deprecated Use environmentContext.micro instead */
    customMicroPlaceText: string;
    ambientLighting: Lighting;

    // ========================================================================
    // 5️⃣ CREATIVE DIRECTION (AESTHETICS ONLY)
    // ========================================================================
    category: string;
    contextPreset: string;
    visualProfile: VisualProfile;
    wineLightingTone: WineLightingTone;
    wineMoodModifier: WineMoodModifier;
    wineAction: WineAction;
    winePourStyle: WinePourStyle;
    visualIntent: VisualIntent;
    energyLevel: EnergyLevel;
    creativityLevel: 0 | 1 | 2 | 3;
    creativeTheme: CreativeTheme;
    propDensity: PropDensity;
    selectedProps: string[];
    negativeSpace: NegativeSpace;
    composition: CompositionMode;
    scale: ProductScale;
    spacing: ProductSpacing;
    lightStyle: LightStyle;

    // ========================================================================
    // 6️⃣ CAMERA & FRAMING (OPTICS EXCLUSIVE)
    // ========================================================================
    cameraSystem: CameraSystem;
    angle: CameraAngle;
    distance: CameraDistance;
    rotation: CameraRotation;
    framing: CameraFraming;
    cameraUiSystemLabel: string;
    cameraUiAngleLabel: string;
    cameraUiDistanceLabel: string;
    cameraUiRotationLabel: string;
    cameraUiFramingLabel: string;

    // ========================================================================
    // 7️⃣ OUTPUT & EXPORT
    // ========================================================================
    aspectRatio: AspectRatio;
    blankSpaceEnabled: boolean;
    blankSpaceSide: BlankSpaceSide;

    // ========================================================================
    // ECOMMERCE PDP (Isolated Pipeline)
    // ========================================================================
    ecommercePdp: EcommercePdpConfig | null;

    // ========================================================================
    // BUNDLE (Sub-system)
    // ========================================================================
    bundle: BundleDefinition;

    // ========================================================================
    // PRODUCT STUDIO UI CONTROLS (NEW)
    // ========================================================================
    interpretationNotes: Partial<Record<string, { message: string; ts: number }>>;
    controlTier: ControlTier;
    advancedModeEnabled: boolean;
    qualityProfile: OutputQualityProfile;
    ultraRealStrict: boolean;
    photoMode: PhotoMode;
    photoModeConfig: PhotoModeConfig;
    splashStyle: 'Basic' | 'Intermediate' | 'Advanced';
    backgroundColor: string;
    accentColor: string;
    colorLocks: {
        background: boolean;
        accent: boolean;
        gradientStart: boolean;
        gradientEnd: boolean;
        gradientMid: boolean;
    };
    heroLandingAuto: {
        backgroundType: boolean;
    };
    alignment: 'left' | 'center' | 'right' | 'centered' | 'left-space' | 'right-space';
    shadow: 'soft-drop' | 'hard-drop' | 'floating';
    gradientEnabled: boolean;
    gradientStart: string;
    gradientEnd: string;
    /** Optional 3rd stop used by Hero Landing Page brand gradient (can be empty). */
    gradientMid: string;
    gradientAngle: number;
    props: string;
    customIngredients?: CustomIngredient[];
    specialEffects?: string[];
    /** Ingredient Stack only: controls whether ingredients float or rest on the base. */
    ingredientLayout: IngredientStackLayout;
    interaction:
    | 'none'
    | 'passive-presence'
    | 'cropped-hand'
    | 'supported-hold'
    | 'holding'
    | 'two-hand-hold'
    | 'presenting'
    | 'framed-presentation'
    | 'applying-opening'
    | 'capsule-display'
    | 'resting-interaction';
    proMode: boolean;
    placement: ProductPlacement;
    viewpoint: string;
    lens: string;
    lightingRig: string;
    lightColorTemp: string;
    customLightColor: string;
    accentLightIntensity: number; // 0-100, intensity of accent/gel lights
    finish: string;
    ecommerceSequenceActive?: boolean;
    ecommerceSequenceIndex?: number;

    // ========================================================================
    // LEGACY (To be removed)
    // ========================================================================
    ecommerceMode: boolean;
    paletteSource: PaletteSource;
    lighting: Lighting;
    presetTier: PresetTier;
};

// ============================================================================
// GENERATION JOB
// ============================================================================

export type ProductGenerationJob = {
    productId: string;
    productName: string;
    prompt: string;
    negativePrompt: string;
    aspectRatio: AspectRatio;
    bundleId?: string;
    sceneType?: SceneType;
};

export type GeneratedProductImage = {
    productId: string;
    bundleId?: string;
    sceneType?: SceneType;
    imageUrl: string;
    prompt: string;
    timestamp: number;
};

// =============================================================================
// INGREDIENT STACK (PHOTO MODE) OPTIONS
// =============================================================================

export type IngredientStackLayout = 'auto' | 'grounded' | 'floating' | 'top-view';
