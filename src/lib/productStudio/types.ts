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
};

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

export type SceneType = 'studio-branding' | 'editorial-product' | 'lifestyle-real' | 'ugc-phone';

// ============================================================================
// ENVIRONMENT
// ============================================================================

export type EnvironmentMacro =
    | 'kitchen' | 'living-room' | 'bedroom' | 'bathroom' | 'workspace'
    | 'hallway' | 'home-gym' | 'balcony-indoor-terrace'
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
    | 'neutral-surface'
    | 'custom';

export type Lighting =
    | 'natural-light' | 'sunny-day' | 'golden-hour' | 'overcast'
    | 'cozy-indoors' | 'ring-light' | 'mood-lighting'
    | 'night-mode' | 'flash-photo' | 'clinical-softbox';

// ============================================================================
// CAMERA
// ============================================================================

export type CameraSystem = 'dslr' | 'mirrorless';
export type CameraAngle = 'front' | '45' | 'top';
export type CameraDistance = 'macro' | 'close' | 'medium';
export type CameraRotation = 'none' | 'slight';
export type CameraFraming = 'centered' | 'rule-of-thirds';

// ============================================================================
// CREATIVITY
// ============================================================================

export type CreativeTheme = 'clinical-minimal' | 'premium-clean' | 'bold-graphic' | 'ingredient-color' | 'fresh-bright' | 'dark-dramatic' | 'playful-pop' | 'tech-clean';
export type PaletteSource = 'brand' | 'warm-neutral' | 'cool-neutral' | 'complementary' | 'custom';
export type PropDensity = 'none' | 'low' | 'medium' | 'dense';

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
export type AspectRatio = '1:1' | '4:5' | '16:9';

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

    // ========================================================================
    // 3️⃣ BRAND & PALETTE (SINGLE COLOR AUTHORITY)
    // ========================================================================
    palette: BrandPalette;

    // ========================================================================
    // 4️⃣ SCENE & SURFACE (PHYSICAL CONTEXT)
    // ========================================================================
    sceneType: SceneType;  // Legacy - maps from mode
    surface: SurfaceBase;
    environmentMacro: EnvironmentMacro;
    microPlace: MicroPlace;
    customEnvironmentText: string;
    customMicroPlaceText: string;
    ambientLighting: Lighting;

    // ========================================================================
    // 5️⃣ CREATIVE DIRECTION (AESTHETICS ONLY)
    // ========================================================================
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

    // ========================================================================
    // 7️⃣ OUTPUT & EXPORT
    // ========================================================================
    aspectRatio: AspectRatio;
    blankSpaceEnabled: boolean;
    blankSpaceSide: BlankSpaceSide;

    // ========================================================================
    // BUNDLE (Sub-system)
    // ========================================================================
    bundle: BundleDefinition;

    // ========================================================================
    // PRODUCT STUDIO UI CONTROLS (NEW)
    // ========================================================================
    photoMode: string;
    backgroundColor: string;
    accentColor: string;
    alignment: 'left' | 'center' | 'right';
    shadow: 'soft-drop' | 'hard-drop' | 'floating';
    props: string;
    customHeroCue: string;
    interaction: 'none' | 'cropped-hand';
    proMode: boolean;
    lens: string;
    lightingRig: string;
    finish: string;

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
