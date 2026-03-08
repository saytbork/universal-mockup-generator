/**
 * PRODUCT STUDIO STORE
 * Zustand store with complete defaults - v2
 */

import { create } from 'zustand';
import { extractDominantColors } from './colorExtractor';
import { applyCanonicalPhysicalForMotion } from './motionCoherence';
import { PHOTO_MODE_SCHEMAS } from './photoModeSchema';
import { getPhotoModeCapabilities } from './capabilityResolver';
import type {
    ProductStudioState,
    ProductAsset,
    ProductDefinition,
    ProductType,
    PhysicalDefinition,
    ProductStateMotion,
    CapsulesPhysical,
    GummiesPhysical,
    DropsPhysical,
    PowderPhysical,
    SkincarePhysical,
    DevicePhysical,
    CustomPhysical,
    EnvironmentMacro,
    MicroPlace,
    Lighting,
    BundleDefinition,
    BundleModeV2,
    BundleLayout,
    BundleSpacing,
    PrebuiltBundle,
    SceneType,
    PresetTier,
    CompositionMode,
    SurfaceBase,
    ProductScale,
    ProductSpacing,
    LightStyle,
    NegativeSpace,
    BrandPreset,
    BrandPresetId,
    OutputQualityProfile,
    ControlTier,
    ProductMode,
    BrandPalette,
    EnvironmentContext,
    PhotoModeConfigPatch,
    PhotoMode,
    PhotoModeConfig,
    ProductPlacement,
    IndustryProfile,
    VisualProfile,
    WineAction,
    WineLightingTone,
    WineMoodModifier,
    WinePourStyle,
    WineStyleArchetype,
    CoffeeAction,
    CoffeeMode,
    CoffeeLightingTone,
    CoffeeMoodModifier,
    CoffeeSteamLevel,
    PhysicalFormFactor,
    PhysicalPresence,
    ProductState,
    ProductInteraction,
} from './types';
import { validateAndCorrectCapabilities } from './productCapabilities';
import { isWinePrestigeMode, WINE_ACTION_OPTIONS, WINE_POUR_STYLE_OPTIONS, getWineArchetypePatch, isActionPourCompatible } from './winePrestige';
import { resolveIndustryProfileModule } from '../productStudioV2/industryProfiles/registry';

const VISUAL_STYLE_SELECTIONS = new Set([
    'Clinical Lab Counter',
    'Minimal Bathroom Vanity',
    'Dark Premium Studio',
    'Tech Clean Studio',
    'Brand Campaign',
    'Creator Premium Simulation',
    'Soft Wellness Morning',
    'Outdoor Energy Boost',
    'Sunlit Stone Editorial',
    'Golden Sunset Backlit',
    'Bathroom Daylight Clean',
    'Sky Float Minimal',
    'Wet Rock Ripples',
    'Sand Palm Shadows',
    'Botanical Water Garden',
    'Warm Window Wood',
]);

// ============================================================================
// DEFAULT PHYSICAL BY TYPE
// ============================================================================

const DEFAULT_COLOR = { hex: '#FFFFFF', semanticName: 'white' };

const DEFAULT_CAPSULES: CapsulesPhysical = {
    capsuleStyle: 'veggie',
    capsuleContentColor: { hex: '#F5DEB3', semanticName: 'beige' },
    quantity: 2,
    layout: 'grouped',
    glassOfWater: false,
    spoon: false,
};

const DEFAULT_GUMMIES: GummiesPhysical = {
    gummyColor: { hex: '#FF6B6B', semanticName: 'coral' },
    shape: 'bear',
    quantity: 5,
    bowl: false,
    plate: false,
};

const DEFAULT_DROPS: DropsPhysical = {
    liquidColorMode: 'amber',
    liquidCustomColor: DEFAULT_COLOR,
    dropperState: 'closed',
    interactionMode: 'sublingual',
    glass: false,
    teaCup: false,
    minimalSpoon: false,
};

const DEFAULT_POWDER: PowderPhysical = {
    powderColor: { hex: '#98FB98', semanticName: 'pale green' },
    texture: 'fine',
    presentation: 'in-scoop',
    mixMode: 'water',
    cupOrMug: true,
    scoop: true,
    spoon: false,
};

const DEFAULT_SKINCARE: SkincarePhysical = {
    subtype: 'serum',
    texture: 'glossy',
    color: { hex: '#E6E6FA', semanticName: 'lavender' },
    dispersion: 'drop',
    towel: false,
    sink: false,
    minimalSurfaceOnly: true,
};

const DEFAULT_DEVICE: DevicePhysical = {
    material: 'plastic',
    color: DEFAULT_COLOR,
    scale: 'medium',
};

const DEFAULT_CUSTOM: CustomPhysical = {
    material: 'mixed',
    color: DEFAULT_COLOR,
    scale: 'medium',
    propsAutoBlocked: true,
};

const normalizeSplashShotConfig = (
    splashShot: PhotoModeConfig['splashShot']
): PhotoModeConfig['splashShot'] => {
    const motionIntensity = String(splashShot.motionIntensity || '').trim();
    const splashAdMode = motionIntensity === 'Explosive';
    if (splashAdMode) {
        if (splashShot.productStability === 'Fully grounded') return splashShot;
        return {
            ...splashShot,
            productStability: 'Fully grounded',
        };
    }
    const dynamicSplashMode = motionIntensity === 'Dynamic';
    if (!dynamicSplashMode) return splashShot;
    if (splashShot.productStability !== 'Fully grounded') return splashShot;
    return {
        ...splashShot,
        productStability: 'Slight interaction',
    };
};

const mapQualityProfileToVisualIntent = (
    profile: OutputQualityProfile
): ProductStudioState['visualIntent'] => {
    return profile === 'ecommerce-conversion' ? 'conversion' : 'campaign';
};

export function getDefaultPhysical(type: ProductType): PhysicalDefinition {
    switch (type) {
        case 'capsules':
            return { kind: 'capsules', v: { ...DEFAULT_CAPSULES } };
        case 'gummies':
            return { kind: 'gummies', v: { ...DEFAULT_GUMMIES } };
        case 'drops':
            return { kind: 'drops', v: { ...DEFAULT_DROPS } };
        case 'powder':
            return { kind: 'powder', v: { ...DEFAULT_POWDER } };
        case 'skincare':
            return { kind: 'skincare', v: { ...DEFAULT_SKINCARE } };
        case 'device':
            return { kind: 'device', v: { ...DEFAULT_DEVICE } };
        case 'custom':
            return { kind: 'custom', v: { ...DEFAULT_CUSTOM } };
        case 'dummy':
        default:
            return { kind: 'dummy', v: {} };
    }
}

// ============================================================================
// DEFAULT MICRO PLACE BY ENVIRONMENT
// ============================================================================

export function getDefaultMicroPlace(env: EnvironmentMacro): MicroPlace {
    const map: Record<EnvironmentMacro, MicroPlace> = {
        'kitchen': 'countertop',
        'living-room': 'coffee-table',
        'bedroom': 'nightstand',
        'bathroom': 'vanity',
        'workspace': 'desk-surface',
        'hallway': 'console-table',
        'home-gym': 'bench',
        'balcony-indoor-terrace': 'table',
        'cgmp-facility': 'conveyor-belt',
        'urban-exterior': 'concrete-ledge',
        'natural-exterior': 'rock',
        'parking-lot': 'car-hood',
        'backyard-patio': 'outdoor-table',
        'street-corner': 'sidewalk-edge',
        'studio': 'neutral-surface',
        'custom': 'neutral-surface',
    };
    return map[env] || 'neutral-surface';
}

// ============================================================================
// ENVIRONMENT + LIGHTING COMPATIBILITY
// ============================================================================

const NIGHT_MODE_ENVS: EnvironmentMacro[] = ['urban-exterior', 'street-corner', 'parking-lot'];
const FLASH_PHOTO_ENVS: EnvironmentMacro[] = ['urban-exterior', 'street-corner', 'parking-lot'];
const RING_LIGHT_ENVS: EnvironmentMacro[] = ['studio', 'workspace', 'kitchen', 'living-room', 'bedroom', 'bathroom', 'cgmp-facility'];

export function enforceValidLighting(lighting: Lighting, env: EnvironmentMacro): Lighting {
    if (lighting === 'night-mode' && !NIGHT_MODE_ENVS.includes(env)) {
        return 'clinical-softbox';
    }
    if (lighting === 'flash-photo' && !FLASH_PHOTO_ENVS.includes(env)) {
        return 'clinical-softbox';
    }
    if (lighting === 'ring-light' && !RING_LIGHT_ENVS.includes(env)) {
        return 'clinical-softbox';
    }
    if (lighting === 'golden-hour' && env === 'bathroom') {
        return 'natural-light';
    }
    return lighting;
}

// ============================================================================
// PRODUCT TYPE ENVIRONMENT CONSTRAINTS
// ============================================================================

const POWDER_BLOCKED_ENVS: EnvironmentMacro[] = ['bedroom'];
const SKINCARE_PREFERRED_ENVS: EnvironmentMacro[] = ['bathroom', 'studio'];
const DROPS_OPEN_BLOCKED_ENVS: EnvironmentMacro[] = ['street-corner', 'parking-lot', 'urban-exterior'];

export function enforceValidEnvironment(
    env: EnvironmentMacro,
    productType: ProductType,
    dropsState?: string
): EnvironmentMacro {
    if (productType === 'powder' && POWDER_BLOCKED_ENVS.includes(env)) {
        return 'kitchen';
    }
    if (productType === 'skincare' && !SKINCARE_PREFERRED_ENVS.includes(env) && env !== 'studio') {
        return 'bathroom';
    }
    if (productType === 'drops' && dropsState === 'open-resting' && DROPS_OPEN_BLOCKED_ENVS.includes(env)) {
        return 'kitchen';
    }
    return env;
}

// ============================================================================
// INTERPRETATION NOTES (UI - Inline)
// ============================================================================

const INTERPRETATION_MESSAGES = {
    macroInteraction:
        'Two-hand interaction is not compatible with macro framing. Interaction adjusted automatically.',
    openedCannotFloat:
        'Opened containers cannot float. Motion constrained to a grounded state.',
    photoStudioIgnoresEnvironment:
        'Photo Studio mode uses abstract set styling. Real environments are ignored.',
    interactionSimplified:
        'Only one interaction mode is allowed. Interaction simplified for physical coherence.',
    cameraOverridesFraming:
        'Selected camera system overrides framing guides for optical realism.',
    neutralHandsNoIdentity:
        'Hands treated as neutral anatomical elements without human identity.',
    macroTexturesNoAerial:
        'Overhead/flatlay camera is disabled for macro textures. Camera adjusted automatically.',
    photoModeForcesInteraction:
        'Photo Mode constraints adjusted interaction to avoid contradictions.',
    heldRequiresInteraction:
        'Held placement requires a hand interaction. State was normalized automatically.',
} as const;

function withInterpretationNote(
    state: ProductStudioState,
    key: string,
    message: string
): Pick<ProductStudioState, 'interpretationNotes'> {
    return {
        interpretationNotes: {
            ...(state.interpretationNotes || {}),
            [key]: { message, ts: Date.now() },
        },
    };
}

function isMacroFraming(state: ProductStudioState, next?: { distance?: ProductStudioState['distance']; angle?: ProductStudioState['angle'] }): boolean {
    const distance = next?.distance ?? state.distance;
    const angle = next?.angle ?? state.angle;
    return distance === 'macro' || angle === 'detail_closeup';
}

function isInteractionIncompatibleWithMacro(interaction: ProductStudioState['interaction']): boolean {
    return new Set<ProductStudioState['interaction']>([
        'two-hand-hold',
        'holding',
        'supported-hold',
        'presenting',
        'framed-presentation',
        'applying-opening',
        'capsule-display',
    ]).has(interaction);
}

const HAND_INTERACTIONS = new Set<ProductStudioState['interaction']>([
    'supported-hold',
    'holding',
    'two-hand-hold',
    'presenting',
    'framed-presentation',
    'applying-opening',
    'capsule-display',
    'resting-interaction',
]);

function interactionNeedsHands(interaction: ProductStudioState['interaction']): boolean {
    return HAND_INTERACTIONS.has(interaction);
}

function getPhotoModeAllowedInteractions(photoMode: PhotoMode): ProductStudioState['interaction'][] | null {
    const schema = PHOTO_MODE_SCHEMAS[photoMode];
    const { interactionCapability } = getPhotoModeCapabilities(photoMode, schema);
    if (interactionCapability === 'none') return ['none'];
    return null;
}

function getFallbackInteraction(allowed: ProductStudioState['interaction'][] | null): ProductStudioState['interaction'] {
    if (!allowed || allowed.length === 0) return 'none';
    if (allowed.includes('none')) return 'none';
    return allowed[0];
}

function reinterpretMacroInteraction(state: ProductStudioState): ProductStudioState['interaction'] {
    // Deterministic: macro prioritizes label legibility (remove hands), detail-closeup can keep passive hands.
    return state.distance === 'macro' ? 'none' : 'passive-presence';
}

function getAllowedMotionsForPhotoMode(photoMode: PhotoMode): ProductStateMotion[] | null {
  // Keep this aligned with promptEngine/photoModeResolver.ts compatibility map.
  if (photoMode === 'Hero Landing Page') return ['static', 'opened'];
  if (photoMode === 'Splash Shot') return ['dispensed', 'pouring'];
  if (photoMode === 'Foam & Texture') return ['static', 'opened'];
  if (photoMode === 'Beach Foam Splash') return ['static', 'opened'];
  if (photoMode === 'Pool Water') return ['static', 'opened'];
  if (photoMode === 'Textured Bed / Scatter Base') return ['static'];
    return null;
}

function getFallbackMotionForPhotoMode(photoMode: PhotoMode): ProductStateMotion {
    const allowed = getAllowedMotionsForPhotoMode(photoMode);
    if (!allowed || allowed.length === 0) return 'static';
    return allowed.includes('static') ? 'static' : allowed[0];
}

function isTelephotoCompressionLens(lens: string): boolean {
    return /\bcompression\b/i.test(lens) || /\b70-200mm\b/i.test(lens);
}

function isMacroLens(lens: string): boolean {
    return /\bmacro\b/i.test(lens);
}

function isTiltShiftLens(lens: string): boolean {
    return /\btilt-?shift\b/i.test(lens);
}

// ============================================================================
// PRE-BUILT BUNDLES
// ============================================================================

export const PREBUILT_BUNDLES: PrebuiltBundle[] = [
    {
        id: 'essentials_trio',
        name: 'Core Essentials Trio',
        minProducts: 3,
        maxProducts: 3,
        layout: 'pyramid',
        spacing: 'compact',
    },
    {
        id: 'daily_duo',
        name: 'Daily Duo Stack',
        minProducts: 2,
        maxProducts: 2,
        layout: 'lineal',
        spacing: 'airy',
    },
    {
        id: 'launch_showcase',
        name: 'Launch Showcase Set',
        minProducts: 3,
        maxProducts: 4,
        layout: 'organic-cluster',
        spacing: 'airy',
    },
    {
        id: 'hero_lineup',
        name: 'Complete Hero Lineup',
        minProducts: 3,
        maxProducts: 5,
        layout: 'lineal',
        spacing: 'compact',
    },
];

// ============================================================================
// BRAND PRESETS (LOOK SYSTEMS)
// ============================================================================

export const BRAND_PRESETS: BrandPreset[] = [
    {
        id: 'ag1-style',
        label: 'Clean Clinical Trust',
        description: 'Bright, sterile, high-clarity studio for trust and precision.',
        config: {
            sceneType: 'studio-branding',
            creativityLevel: 1,
            creativeTheme: 'clinical-minimal',
            lightStyle: 'clinical',
            paletteSource: 'brand',
            propDensity: 'none',
            photoMode: 'Hero Landing Page',
            visualStyle: 'Clinical Lab Counter',
            proMode: true,
            lens: '50mm Product Prime',
            lightingRig: 'Softbox Wrap',
            finish: 'Clinical Lab Polish',
            bundle: { enabled: false, mode: 'off', layout: 'lineal', spacing: 'compact', primaryProductId: null, secondaryProductIds: [], selectedBundleId: null },
        },
    },
    {
        id: 'ritual-style',
        label: 'Warm Editorial Wellness',
        description: 'Warm gradients, clean props, premium editorial polish.',
        config: {
            sceneType: 'studio-branding',
            creativityLevel: 1,
            creativeTheme: 'fresh-bright',
            lightStyle: 'soft',
            paletteSource: 'brand',
            propDensity: 'low',
            photoMode: 'Hero Landing Page',
            visualStyle: 'Sunlit Stone Editorial',
            gradientEnabled: true,
            gradientAngle: 180,
            proMode: true,
            lens: '50mm Product Prime',
            lightingRig: 'Gradient Cyclorama',
            finish: 'Film Grain Luxury',
            bundle: { enabled: false, mode: 'off', layout: 'lineal', spacing: 'compact', primaryProductId: null, secondaryProductIds: [], selectedBundleId: null },
        },
    },
    {
        id: 'olly-style',
        label: 'Vibrant Color Pop Studio',
        description: 'High-chroma color blocking, playful props, punchy highlights.',
        config: {
            creativeTheme: 'playful-pop',
            paletteSource: 'brand',
            creativityLevel: 2,
            lightStyle: 'contrast',
            propDensity: 'medium',
            photoMode: 'Hero Landing Page',
            gradientEnabled: true,
            gradientAngle: 135,
            proMode: true,
            lens: '50mm Product Prime',
            lightingRig: 'Prism Spotlight Duo',
            finish: 'Vibrant Color Pop',
        },
    },
    {
        id: 'luxury-minimal',
        label: 'Luxury Minimal',
        description: 'Minimal, premium, controlled contrast and clean reflections.',
        config: {
            sceneType: 'studio-branding',
            creativityLevel: 1,
            creativeTheme: 'premium-clean',
            lightStyle: 'shadow-play',
            paletteSource: 'cool-neutral',
            propDensity: 'none',
            photoMode: 'Hero Landing Page',
            gradientEnabled: false,
            proMode: true,
            lens: '70-200mm Compression',
            lightingRig: 'Hard Edge Gels',
            finish: 'Film Grain Luxury',
            bundle: { enabled: false, mode: 'off', layout: 'lineal', spacing: 'compact', primaryProductId: null, secondaryProductIds: [], selectedBundleId: null },
        },
    },
];


export function getRecommendedBundle(productCount: number): PrebuiltBundle | null {
    if (productCount === 2) return PREBUILT_BUNDLES.find(b => b.id === 'daily_duo') || null;
    if (productCount === 3) return PREBUILT_BUNDLES.find(b => b.id === 'essentials_trio') || null;
    if (productCount >= 4) return PREBUILT_BUNDLES.find(b => b.id === 'hero_lineup') || null;
    return null;
}

export function canUseBundle(bundle: PrebuiltBundle, productCount: number): boolean {
    return productCount >= bundle.minProducts && productCount <= bundle.maxProducts;
}

// ============================================================================
// DEFAULT STATE
// ============================================================================

const DEFAULT_DEFINITION: ProductDefinition = {
    type: 'dummy',
    color: DEFAULT_COLOR,
    physical: { kind: 'dummy', v: {} },
};

const DEFAULT_BUNDLE: BundleDefinition = {
    enabled: false,
    mode: 'off',
    selectedBundleId: null,
    primaryProductId: null,
    secondaryProductIds: [],
    layout: 'lineal',
    spacing: 'compact',
};

const DEFAULT_PALETTE: BrandPalette = {
    source: 'auto',
    primaryColor: null,
    secondaryColor: null,
    accentColor: null,
    brandPresetId: null,
};

type HeroLandingAutoFlags = {
    backgroundType: boolean;
};

const DEFAULT_PHOTO_MODE_CONFIG: PhotoModeConfig = {
    heroLandingPage: {
        backgroundType: 'Solid',
        gradientStyle: 'Soft',
        colorSource: 'Brand Colors',
        paletteSource: 'Product label colors',
        negativeSpace: 'Balanced',
        contrastLevel: 'Soft',
    },
    colorPopHero: {
        backgroundType: 'Solid',
        gradientStyle: 'Soft',
        colorSource: 'Brand Colors',
        saturationLevel: 'Moderate',
        contrastStrategy: 'Soft',
        negativeSpace: 'Balanced',
    },
    ingredientStack: {
        ingredientFocus: 'Key active only',
        stackStyle: 'Surround',
        ingredientPresence: 'Balanced',
        labelPriority: 'Always readable',
        backgroundEnabled: false,
        backgroundType: 'Solid',
        gradientStyle: 'Soft',
        colorSource: 'Brand Colors',
    },
    acrylicBlocks: {
        blockShape: 'Rectangular',
        materialFinish: 'Clear',
        reflectionLevel: 'Balanced',
        elevation: 'Grounded',
    },
    splashShot: {
        splashMedium: 'Liquid',
        motionIntensity: 'Dynamic',
        freezeMoment: 'Mid-splash',
        productStability: 'Slight interaction',
    },
    foamAndTexture: {
        materialState: 'foam',
        textureType: 'Foam',
        textureDensity: 'Light',
        focusDistance: 'Macro',
        cleanliness: 'Pristine',
    },
    routineCarousel: {
        frameCount: 3,
        routineFlow: 'Left → Right',
        consistency: 'Same background',
        heroFrame: 'First',
    },
    clinicalLabCounter: {
        clinicalTone: 'Soft clinical',
        labElements: 'Minimal',
        surfaceType: 'White lab',
        trustLevel: 'Friendly',
    },
    goldenMistAura: {
        glowStrength: 'Subtle',
        mistStyle: 'Backlit',
        mood: 'Calm',
        contrast: 'Soft',
    },
    candyGradientLab: {
        gradientStyle: 'Candy pastel',
        colorCount: 'Duo',
        edgeStyle: 'Soft blend',
        playfulness: 'Controlled',
    },
    ingredientFlatLay: {},
    glassPedestalStudio: {},
    minimalBathroomVanity: {},
    darkPremiumStudio: {},
    monochromeBrandWorld: {},
    brandCampaignWorld: {},
    ugcPremiumSimulation: {},
    techCleanStudio: {},
    luxuryEditorialTabletop: {},
    softWellnessMorning: {},
    goldenHourLifestyle: {},
    outdoorEnergyBoost: {},
    pastelPicnic: {},
    dynamic: {},
};

export const DEFAULT_PRODUCT_STUDIO_STATE: ProductStudioState = {
    products: [],
    activeProductId: null,

    // 1️⃣ MODE (ROOT BLOCKER)
    mode: 'studio',

    // 2️⃣ PRODUCT DEFINITION
    definition: DEFAULT_DEFINITION,
    handsHolding: false,
    packagingMode: 'without-box',
    physicalScaleLabel: 'medium-tabletop',
    stateMotion: 'static',

    // 3️⃣ BRAND & PALETTE (SINGLE COLOR AUTHORITY)
    palette: DEFAULT_PALETTE,

    // 4️⃣ ENVIRONMENT — CANONICAL (null = Studio mode)
    environmentContext: null,

    // LEGACY FIELDS — DO NOT USE
    sceneType: 'studio-branding',
    surface: 'neutral',
    environmentMacro: 'studio',
    microPlace: 'neutral-surface',
    customEnvironmentText: '',
    customMicroPlaceText: '',
    ambientLighting: 'clinical-softbox',

    // 5️⃣ CREATIVE DIRECTION
    category: '',
    contextPreset: '',
    visualStyle: undefined,
    visualProfile: 'default',
    industryProfile: 'supplements',
    wineLightingTone: 'Warm Lateral',
    wineMoodModifier: 'None',
    wineAction: 'static-presentation',
    winePourStyle: 'mid-flow-elegance',
    wineGlassType: 'auto',
    wineStyleArchetype: null,
    coffeeMode: 'studio',
    coffeeAction: 'static',
    coffeeLightingTone: 'auto',
    coffeeMoodModifier: 'coffee-cinematic-luxury',
    coffeeSteamLevel: 'auto',
    coffeeLiquidPhysics: true,
    visualIntent: 'conversion',
    energyLevel: 'low',
    creativityLevel: 1,
    creativeTheme: 'clinical-minimal',
    propDensity: 'none',
    selectedProps: [],
    negativeSpace: 'none',
    composition: 'centered',
    scale: 'dominant',
    spacing: 'balanced',
    lightStyle: 'soft',

    // 6️⃣ CAMERA & FRAMING
    cameraSystem: 'dslr_mirrorless',
    angle: '45_hero',
    distance: 'standard',
    rotation: 0,
    framing: 'centered_hero',
    cameraUiSystemLabel: 'DSLR / mirrorless',
    cameraUiAngleLabel: '45° hero',
    cameraUiDistanceLabel: 'Standard',
    cameraUiRotationLabel: '0°',
    cameraUiFramingLabel: 'Centered hero',

    // 7️⃣ OUTPUT & EXPORT
    aspectRatio: '4:3',
    blankSpaceEnabled: false,
    blankSpaceSide: 'right',

    // ECOMMERCE PDP (Isolated Pipeline)
    ecommercePdp: null,

    // BUNDLE (Sub-system)
    bundle: DEFAULT_BUNDLE,

    // PRODUCT STUDIO UI CONTROLS (NEW)
    interpretationNotes: {},
    controlTier: 'basic',
    advancedModeEnabled: false,
    qualityProfile: 'ecommerce-conversion',
    ultraRealStrict: true,
    photoMode: 'Hero Landing Page',
    photoModeConfig: DEFAULT_PHOTO_MODE_CONFIG,
    splashStyle: 'Basic',
    // Hero Landing Page fallback safety: clean white solid background (user can still choose gradient manually).
    backgroundColor: '#FFFFFF',
    accentColor: '#204020',
    colorLocks: {
        background: false,
        accent: false,
        gradientStart: false,
        gradientEnd: false,
        gradientMid: false,
    },
    heroLandingAuto: {
        backgroundType: true,
    },
    alignment: 'center',
    shadow: 'soft-drop',
    gradientEnabled: false,
    gradientStart: '#FFFFFF',
    gradientEnd: '#FFFFFF',
    gradientMid: '',
    gradientAngle: 180,
    props: '',
    ingredientLayout: 'grounded',
    interaction: 'none',
    proMode: false,
    placement: 'surface',
    viewpoint: 'eye-level',
    lens: '50mm Product Prime',
    lightingRig: 'Softbox Wrap',
    lightColorTemp: 'Neutral (5000K)',
    customLightColor: '',
    accentLightIntensity: 50, // Default 50% intensity
    finish: 'High-Gloss Commercial',

    // LEGACY (To be removed)
    ecommerceMode: false,
    paletteSource: 'brand',
    lighting: 'clinical-softbox',
    presetTier: 'basic',

    // UNIFIED PRODUCT BEHAVIOR (optional fields — undefined = not yet set by user)
    physicalFormFactor: undefined,
    physicalPresence: undefined,
    productState: undefined,
    productInteraction: undefined,
};

// ============================================================================
// CLEANUP INSTRUMENTATION — TEMPORARY (remove after usage mapping)
// ============================================================================
// Track which fields are READ (called via getters/actions)
// This helps identify dead fields that are never accessed

const CLEANUP_READ_TRACKER: Record<string, number> = {};

export function trackFieldRead(fieldName: string): void {
    if (typeof window !== 'undefined' && (window as any).__DEV_MODE__) {
        CLEANUP_READ_TRACKER[fieldName] = (CLEANUP_READ_TRACKER[fieldName] || 0) + 1;
        console.log(`[CLEANUP-INSTRUMENT] FIELD READ: ${fieldName} (count: ${CLEANUP_READ_TRACKER[fieldName]})`);
    }
}

export function getReadTrackerReport(): Record<string, number> {
    return { ...CLEANUP_READ_TRACKER };
}

// Expose to window for dev console access
if (typeof window !== 'undefined') {
    (window as any).__CLEANUP_READ_TRACKER__ = CLEANUP_READ_TRACKER;
    (window as any).__getCleanupReport__ = getReadTrackerReport;
}

// ============================================================================
// STORE ACTIONS
// ============================================================================

type ProductStudioActions = {
    // Products (mutable metadata)
    updateProductName: (id: string, name: string) => void;
    updateProductHeight: (id: string, heightValue: number | null, heightUnit: 'cm' | 'in') => void;
    // Products
    addProduct: (product: ProductAsset) => void;
    removeProduct: (id: string) => void;
    setActiveProduct: (id: string | null) => void;
    // updateProductName / updateProductHeight are above (metadata sync)

    // 1️⃣ MODE (ROOT BLOCKER)
    setMode: (mode: ProductMode) => void;

    // 2️⃣ PRODUCT DEFINITION
    setProductType: (type: ProductType) => void;
    setProductColor: (hex: string, semanticName: string) => void;
    setPhysicalProperty: (key: string, value: any) => void;
    setPhysicalColor: (colorKey: string, hex: string) => void;
    setPhysicalColorName: (colorKey: string, name: string) => void;
    updatePhysical: <K extends PhysicalDefinition['kind']>(
        kind: K,
        updates: Partial<Extract<PhysicalDefinition, { kind: K }>['v']>
    ) => void;
    setHandsHolding: (enabled: boolean) => void;
    setPackagingMode: (mode: ProductStudioState['packagingMode']) => void;
    setPhysicalScaleLabel: (scale: ProductStudioState['physicalScaleLabel']) => void;

    // 3️⃣ BRAND & PALETTE
    setPalette: (updates: Partial<BrandPalette>) => void;

    // Scene Type (Legacy)
    setSceneType: (sceneType: SceneType) => void;

    // Creativity
    setCategory: (category: string) => void;
    setContextPreset: (preset: string) => void;
    setVisualStyle: (visualStyle: string | undefined) => void;
    setIndustryProfile: (profile: IndustryProfile) => void;
    setVisualProfile: (profile: VisualProfile) => void;
    setWineAction: (action: WineAction) => void;
    setWinePourStyle: (style: WinePourStyle) => void;
    setWineLightingTone: (tone: WineLightingTone) => void;
    setWineMoodModifier: (modifier: WineMoodModifier) => void;
    setWineStyleArchetype: (archetype: WineStyleArchetype | null) => void;
    setCoffeeAction: (action: CoffeeAction) => void;
    setCoffeeMode: (mode: CoffeeMode) => void;
    setCoffeeLightingTone: (tone: CoffeeLightingTone) => void;
    setCoffeeMoodModifier: (modifier: CoffeeMoodModifier) => void;
    setCoffeeSteamLevel: (level: CoffeeSteamLevel) => void;
    setCoffeeLiquidPhysics: (enabled: boolean) => void;
    setVisualIntent: (intent: ProductStudioState['visualIntent']) => void;
    setEnergyLevel: (level: ProductStudioState['energyLevel']) => void;
    setCreativityLevel: (level: 0 | 1 | 2 | 3) => void;
    setCreativeTheme: (theme: ProductStudioState['creativeTheme']) => void;
    setPaletteSource: (source: ProductStudioState['paletteSource']) => void;
    setPropDensity: (density: ProductStudioState['propDensity']) => void;
    setSelectedProps: (props: string[]) => void;
    setComposition: (composition: CompositionMode) => void;
    setSurface: (surface: SurfaceBase) => void;
    setScale: (scale: ProductScale) => void;
    setSpacing: (spacing: ProductSpacing) => void;
    setLightStyle: (style: LightStyle) => void;
    setNegativeSpace: (space: NegativeSpace) => void;

    // Camera
    setCameraSystem: (system: ProductStudioState['cameraSystem']) => void;
    setAngle: (angle: ProductStudioState['angle']) => void;
    setDistance: (distance: ProductStudioState['distance']) => void;
    setRotation: (rotation: ProductStudioState['rotation']) => void;
    setFraming: (framing: ProductStudioState['framing']) => void;
    setCameraUiLabels: (labels: Partial<{
        cameraSystem: string;
        angle: string;
        distance: string;
        rotation: string;
        framing: string;
    }>) => void;

    // Environment — CANONICAL SETTER
    /** Only use this for environment changes */
    setEnvironmentContext: (ctx: EnvironmentContext | null) => void;

    // DEPRECATED LEGACY SETTERS — DO NOT USE
    /** @deprecated Use setEnvironmentContext instead */
    setEnvironmentMacro: (env: EnvironmentMacro) => void;
    /** @deprecated Use setEnvironmentContext instead */
    setMicroPlace: (place: MicroPlace) => void;
    /** @deprecated Use setEnvironmentContext instead */
    setCustomEnvironmentText: (text: string) => void;
    /** @deprecated Use setEnvironmentContext instead */
    setCustomMicroPlaceText: (text: string) => void;
    setLighting: (lighting: Lighting) => void;

    // Ecommerce
    setBlankSpaceEnabled: (enabled: boolean) => void;
    setBlankSpaceSide: (side: ProductStudioState['blankSpaceSide']) => void;
    setAspectRatio: (ratio: ProductStudioState['aspectRatio']) => void;

    // Bundles v2
    setBundleEnabled: (enabled: boolean) => void;
    setBundleMode: (mode: BundleModeV2) => void;
    selectPrebuiltBundle: (bundleId: string) => void;
    setBundleLayout: (layout: BundleLayout) => void;
    setBundleSpacing: (spacing: BundleSpacing) => void;
    applyRecommendedBundle: () => void;

    // Preset
    setPresetTier: (tier: PresetTier) => void;
    applyBasicPreset: () => void;
    applyProPreset: () => void;
    applyBrandPreset: (presetId: BrandPresetId) => void;

    // Product Studio UI Controls (NEW)
    setControlTier: (tier: ControlTier) => void;
    setAdvancedModeEnabled: (enabled: boolean) => void;
    setQualityProfile: (profile: OutputQualityProfile) => void;
    setUltraRealStrict: (enabled: boolean) => void;
    setPhotoMode: (mode: PhotoMode) => void;
    setPhotoModeConfig: (patch: PhotoModeConfigPatch) => void;
    setSplashStyle: (style: ProductStudioState['splashStyle']) => void;
    setBackgroundColor: (color: string) => void;
    setAccentColor: (color: string) => void;
    setAlignment: (alignment: ProductStudioState['alignment']) => void;
    setShadow: (shadow: 'soft-drop' | 'hard-drop' | 'floating') => void;
    setGradientEnabled: (enabled: boolean) => void;
    setGradientStart: (color: string) => void;
    setGradientEnd: (color: string) => void;
    setGradientMid: (color: string) => void;
    setGradientAngle: (angle: number) => void;
    setProps: (props: string) => void;
    setIngredientLayout: (layout: ProductStudioState['ingredientLayout']) => void;
    setInteraction: (interaction: ProductStudioState['interaction']) => void;
    setStateMotion: (motion: ProductStateMotion) => void;
    setProMode: (enabled: boolean) => void;
    setPlacement: (placement: ProductPlacement) => void;

    // Unified Product Behavior
    setPhysicalFormFactor: (formFactor: PhysicalFormFactor) => void;
    setPhysicalPresence: (presence: PhysicalPresence) => void;
    setProductState: (state: ProductState) => void;
    setProductInteraction: (interaction: ProductInteraction) => void;
    setViewpoint: (viewpoint: string) => void;
    setLens: (lens: string) => void;
    setLightingRig: (rig: string) => void;
    setLightColorTemp: (temp: string) => void;
    setCustomLightColor: (color: string) => void;
    setAccentLightIntensity: (intensity: number) => void;
    setFinish: (finish: string) => void;
    updatePhotoModeSubSetting: (mode: PhotoMode, category: string, value: string) => void;

    // Reset
    /** Clears only `products` (and disables bundle), preserving all user-selected settings. */
    resetProducts: () => void;
    reset: () => void;
};

const normalizeHex = (input: string | null | undefined): string | null => {
    const raw = String(input ?? '').trim();
    if (!raw) return null;
    const upper = raw.toUpperCase();
    if (/^#[0-9A-F]{6}$/.test(upper)) return upper;
    return null;
};

const uniqHexes = (colors: Array<string | null | undefined>): string[] => {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const c of colors) {
        const hex = normalizeHex(c);
        if (!hex) continue;
        if (seen.has(hex)) continue;
        seen.add(hex);
        out.push(hex);
    }
    return out;
};

function resolveHeroLandingBrandColors(state: ProductStudioState): { colors: string[]; source: 'label' | 'brand' | 'neutral' | 'none' } {
    const heroCfg = state.photoModeConfig.heroLandingPage;
    const activeProduct =
        state.products.find(p => p.id === state.activeProductId) ??
        state.products[0] ??
        null;

    if (heroCfg.paletteSource === 'Neutral brand tones') {
        return { colors: ['#FFFFFF', '#F3F4F6', '#E5E7EB'], source: 'neutral' };
    }

    if (heroCfg.paletteSource === 'Custom') {
        // Custom means "user is driving"; do not impose a palette here.
        return { colors: [], source: 'none' };
    }

    const labelColors = uniqHexes([
        activeProduct?.palette?.dominant,
        activeProduct?.palette?.secondary,
        activeProduct?.palette?.accent,
    ]);
    if (labelColors.length > 0) {
        return { colors: labelColors, source: 'label' };
    }

    const brandSystemColors = uniqHexes([
        state.palette.primaryColor,
        state.palette.secondaryColor,
        state.palette.accentColor,
    ]);
    if (brandSystemColors.length > 0) {
        return { colors: brandSystemColors, source: 'brand' };
    }

    return { colors: [], source: 'none' };
}

// Background color resolution moved to resolveStudioBackgroundColor (mapSceneToPrompt.ts)
// Do not reintroduce automatic background mutation here.
function applyHeroLandingBackgroundDefaults(state: ProductStudioState): Partial<ProductStudioState> {
    if (state.photoMode !== 'Hero Landing Page') return {};

    // Defensive: photoModeConfig might be undefined when switching between modes
    if (!state.photoModeConfig?.heroLandingPage) {
        console.warn('[Hero] photoModeConfig is undefined, skipping Hero defaults');
        return {};
    }

    // Only preserve structural config — no background field mutations.
    // backgroundColor, gradientEnabled, gradientStart, gradientEnd, gradientMid, gradientAngle
    // are resolved exclusively by resolveStudioBackgroundColor in mapSceneToPrompt.ts.
    return {};
}

// ============================================================================
// CREATE STORE
// ============================================================================

export const useProductStudioStore = create<ProductStudioState & ProductStudioActions>((set, get) => ({
    ...DEFAULT_PRODUCT_STUDIO_STATE,

    // Products
    addProduct: (product) =>
        set((state) => {
            if (state.products.length >= 5) {
                console.warn('[ProductStudio] Max 5 products');
                return state;
            }
            const newProducts = [...state.products, product];

            // Auto-set background/accent colors from product palette if at defaults
            const updates: Partial<ProductStudioState> = {
                products: newProducts,
                activeProductId: state.activeProductId ?? product.id,
                bundle: newProducts.length < 2 ? { ...state.bundle, enabled: false } : state.bundle,
            };

            // Auto-populate colors from product palette if user hasn't touched them
            if (product.palette) {
                const isBackgroundDefault = state.backgroundColor === '#ffffff' || state.backgroundColor === '#FFFFFF';
                const isAccentDefault = state.accentColor === '#6366f1' || state.accentColor === '#6366F1';
                const isGradientStartDefault = state.gradientStart === '#ffffff' || state.gradientStart === '#FFFFFF';
                const isGradientEndDefault =
                    state.gradientEnd === '#f0f0f0' ||
                    state.gradientEnd === '#F0F0F0' ||
                    state.gradientEnd === '#ffffff' ||
                    state.gradientEnd === '#FFFFFF';

                if (!state.colorLocks.accent && isAccentDefault && product.palette.secondary) {
                    updates.accentColor = product.palette.secondary;
                    console.log('[ProductStudio] Auto-set accentColor from palette:', product.palette.secondary);
                }
                if (!state.colorLocks.gradientStart && isGradientStartDefault && product.palette.dominant) {
                    updates.gradientStart = product.palette.dominant;
                    console.log('[ProductStudio] Auto-set gradientStart from palette:', product.palette.dominant);
                }
                if (!state.colorLocks.gradientEnd && isGradientEndDefault && product.palette.secondary) {
                    updates.gradientEnd = product.palette.secondary;
                    console.log('[ProductStudio] Auto-set gradientEnd from palette:', product.palette.secondary);
                }
            }

            const merged = { ...state, ...updates } as ProductStudioState;
            const heroUpdates = applyHeroLandingBackgroundDefaults(merged);
            return { ...merged, ...heroUpdates };
        }),

    removeProduct: (id) =>
        set((state) => {
            const filtered = state.products.filter((p) => p.id !== id);
            return {
                products: filtered,
                activeProductId: state.activeProductId === id ? (filtered[0]?.id ?? null) : state.activeProductId,
                bundle: filtered.length < 2 ? { ...state.bundle, enabled: false } : state.bundle,
            };
        }),

    setActiveProduct: (id) => set({ activeProductId: id }),

    updateProductName: (id, name) =>
        set((state) => ({
            products: state.products.map((p) => (p.id === id ? { ...p, name } : p)),
        })),

    updateProductHeight: (id, heightValue, heightUnit) =>
        set((state) => ({
            products: state.products.map((p) => (p.id === id ? { ...p, heightValue, heightUnit } : p)),
        })),

    // ========================================================================
    // 1️⃣ MODE (ROOT BLOCKER)
    // ========================================================================
    setMode: (mode) =>
        set((state) => {
            // Apply lock rules based on mode
            const updates: Partial<ProductStudioState> = { mode };

            // Clear environment if mode doesn't allow it
            if (mode === 'studio' || mode === 'ecommerce') {
                updates.environmentContext = null;
                updates.environmentMacro = 'studio';
                updates.microPlace = 'neutral-surface';
                updates.customEnvironmentText = '';
                updates.customMicroPlaceText = '';
            }

            console.log(`[ProductStudio] MODE set to: ${mode}`);
            return updates;
        }),

    // ========================================================================
    // 2️⃣ PRODUCT DEFINITION
    // ========================================================================
    setHandsHolding: (enabled) => set({ handsHolding: enabled }),
    setPackagingMode: (mode) => set({ packagingMode: mode }),
    setPhysicalScaleLabel: (scale) => set({ physicalScaleLabel: scale }),

    setProductType: (type) =>
        set((state) => {
            const nextPhysical = getDefaultPhysical(type);

            const allowedMotionsByType: Record<ProductType, ProductStateMotion[]> = {
                capsules: ['static', 'opened', 'spilled', 'dispensed', 'falling'],
                gummies: ['static', 'opened', 'spilled', 'dispensed', 'falling'],
                drops: ['static', 'opened', 'spilled', 'dispensed'],
                powder: ['static', 'opened', 'spilled', 'dispensed', 'pouring'],
                skincare: ['static'],
                device: ['static'],
                custom: ['static'],
                dummy: ['static'],
            };

            const allowed = allowedMotionsByType[type] ?? ['static'];
            const nextMotion = allowed.includes(state.stateMotion) ? state.stateMotion : 'static';

            // If product type changes away from capsules, Capsule Display is no longer valid.
            const nextInteraction =
                type !== 'capsules' && state.interaction === 'capsule-display' ? 'none' : state.interaction;

            return {
                definition: {
                    ...state.definition,
                    type,
                    physical: nextPhysical,
                },
                stateMotion: nextMotion,
                interaction: nextInteraction,
                handsHolding: nextInteraction !== 'none',
            };
        }),

    setProductColor: (hex, semanticName) =>
        set((state) => ({
            definition: {
                ...state.definition,
                color: { hex, semanticName },
            },
        })),

    updatePhysical: (kind, updates) =>
        set((state) => {
            if (state.definition.physical.kind !== kind) return state;
            return {
                definition: {
                    ...state.definition,
                    physical: {
                        ...state.definition.physical,
                        v: { ...state.definition.physical.v, ...updates },
                    } as PhysicalDefinition,
                },
            };
        }),

    setPhysicalProperty: (key, value) =>
        set((state) => ({
            definition: {
                ...state.definition,
                physical: {
                    ...state.definition.physical,
                    v: { ...state.definition.physical.v, [key]: value },
                } as PhysicalDefinition,
            },
        })),

    setPhysicalColor: (colorKey, hex) =>
        set((state) => {
            const currentV = state.definition.physical.v as any;
            const currentColor = currentV[colorKey] || { hex: '#FFFFFF', semanticName: '' };
            return {
                definition: {
                    ...state.definition,
                    physical: {
                        ...state.definition.physical,
                        v: {
                            ...currentV,
                            [colorKey]: { ...currentColor, hex },
                        },
                    } as PhysicalDefinition,
                },
            };
        }),

    setPhysicalColorName: (colorKey, name) =>
        set((state) => {
            const currentV = state.definition.physical.v as any;
            const currentColor = currentV[colorKey] || { hex: '#FFFFFF', semanticName: '' };
            return {
                definition: {
                    ...state.definition,
                    physical: {
                        ...state.definition.physical,
                        v: {
                            ...currentV,
                            [colorKey]: { ...currentColor, semanticName: name },
                        },
                    } as PhysicalDefinition,
                },
            };
        }),

    // ========================================================================
    // 3️⃣ BRAND & PALETTE (SINGLE COLOR AUTHORITY)
    // ========================================================================
    setPalette: (updates) =>
        set((state) => ({
            palette: { ...state.palette, ...updates },
        })),

    // Scene Type (Legacy)
    setSceneType: (sceneType) =>
        set(() => ({ sceneType })),

    // Creativity
    setCategory: (category) => set({ category: String(category || '').trim() }),
    setContextPreset: (preset) => set({ contextPreset: String(preset || '').trim() }),
    setVisualStyle: (visualStyle) =>
        set((state) => {
            const nextVisualStyle = (String(visualStyle || '').trim() || undefined) as ProductStudioState['visualStyle'];
            const shouldClearPhotoMode = !!nextVisualStyle && !!state.photoMode;

            return {
                visualStyle: nextVisualStyle,
                ...(shouldClearPhotoMode ? { photoMode: undefined } : {}),
                specialEffects: [],
            };
        }),
    setIndustryProfile: (profile) =>
        set((state) => {
            if (state.industryProfile === profile) {
                return { industryProfile: profile };
            }
            const previousProfileModule = resolveIndustryProfileModule(state.industryProfile);
            const nextProfileModule = resolveIndustryProfileModule(profile);
            return {
                ...(previousProfileModule.resetState?.() || {}),
                ...(nextProfileModule.resetState?.() || {}),
                industryProfile: profile,
            };
        }),
    setVisualProfile: (profile) =>
        set((state) => {
            const normalizedProfile = (
                profile === 'wine-prestige' || profile === 'wine'
                    ? 'wine'
                    : profile === 'coffee'
                        ? 'coffee'
                        : profile === 'supplements' || profile === 'default'
                            ? 'supplements'
                            : 'supplements'
            ) as 'supplements' | 'wine' | 'coffee';
            if (normalizedProfile === 'supplements') {
                return {
                    visualProfile: 'default',
                    industryProfile: 'supplements',
                    category: '',
                    contextPreset: '',
                    wineAction: 'static-presentation',
                    coffeeMode: 'studio',
                    coffeeAction: 'static',
                    coffeeMoodModifier: 'coffee-cinematic-luxury',
                };
            }
            if (normalizedProfile === 'coffee') {
                return {
                    visualProfile: 'coffee',
                    industryProfile: 'coffee',
                    coffeeMode: state.coffeeMode || 'studio',
                    coffeeAction: state.coffeeAction || 'static',
                    coffeeMoodModifier: state.coffeeMoodModifier || 'coffee-cinematic-luxury',
                };
            }
            return {
                visualProfile: 'wine-prestige',
                industryProfile: 'wine',
                category: state.category || 'Wine',
                contextPreset: state.contextPreset || '',
                wineAction: WINE_ACTION_OPTIONS.includes(state.wineAction as WineAction)
                    ? state.wineAction
                    : 'static-presentation',
                winePourStyle: WINE_POUR_STYLE_OPTIONS.includes(state.winePourStyle as WinePourStyle)
                    ? state.winePourStyle
                    : 'mid-flow-elegance',
                visualIntent: 'campaign',
                composition: state.composition === 'centered' ? 'thirds' : state.composition,
            };
        }),
    setWineAction: (action) =>
        set((state) => {
            const normalized: WineAction = action === 'controlled-pour' ? 'controlled-pour' : 'static-presentation';
            const next: Partial<ProductStudioState> = { wineAction: normalized };
            if (state.visualProfile === 'wine-prestige' && normalized === 'controlled-pour') {
                next.stateMotion = 'static';
            }
            return next;
        }),
    setWinePourStyle: (style) => set({
        winePourStyle: WINE_POUR_STYLE_OPTIONS.includes(style as WinePourStyle)
            ? style
            : 'mid-flow-elegance',
    }),
    setWineLightingTone: (tone) => set({ wineLightingTone: tone }),
    setWineMoodModifier: (modifier) => set({ wineMoodModifier: modifier }),
    setWineStyleArchetype: (archetype) =>
        set((state) => {
            if (!archetype) return { wineStyleArchetype: null };
            const patch = getWineArchetypePatch(archetype);
            if (!patch) return { wineStyleArchetype: null };
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { _archetypeNarrative, ambientLighting: _al, ...visualFields } = patch;
            const sceneOwnedWineEnvironmentModes: PhotoMode[] = ['Winery Scene'];
            const preserveManualContextPreset =
                Boolean(String(state.contextPreset || '').trim()) ||
                sceneOwnedWineEnvironmentModes.includes(state.photoMode as PhotoMode);
            if (preserveManualContextPreset) {
                delete (visualFields as Record<string, unknown>).contextPreset;
            }
            // For Action Pour Photography: only apply wineAction if physics allow it
            if (archetype === 'Action Pour Photography') {
                const pourOk = isActionPourCompatible({
                    wineBottleState: state.wineBottleState,
                    wineClosureType: state.wineClosureType,
                });
                if (!pourOk) {
                    delete (visualFields as Record<string, unknown>).wineAction;
                }
            }
            return {
                wineStyleArchetype: archetype,
                ...(visualFields as Partial<ProductStudioState>),
            };
        }),
    setCoffeeAction: (action) =>
        set({
            coffeeAction: action === 'controlled-pour' ? 'controlled-pour' : 'static',
            stateMotion: action === 'controlled-pour' ? 'pouring' : 'static',
        }),
    setCoffeeMode: (mode) =>
        set({
            coffeeMode: mode === 'ritual' ? 'ritual' : 'studio',
            visualIntent: mode === 'ritual' ? 'campaign' : 'conversion',
        }),
    setCoffeeLightingTone: (tone) => set({ coffeeLightingTone: tone }),
    setCoffeeMoodModifier: (modifier) => set({ coffeeMoodModifier: modifier }),
    setCoffeeSteamLevel: (level) => set({ coffeeSteamLevel: level }),
    setCoffeeLiquidPhysics: (enabled) => set({ coffeeLiquidPhysics: Boolean(enabled) }),
    setVisualIntent: (intent) => set({ visualIntent: intent }),
    setEnergyLevel: (energyLevel) => set({ energyLevel }),
    setCreativityLevel: (level) => set({ creativityLevel: level }),
    setCreativeTheme: (theme) => set({ creativeTheme: theme }),
    setPaletteSource: (source) => set({ paletteSource: source }),
    setPropDensity: (density) =>
        set((state) => {
            // Basic tier limits propDensity
            if (state.presetTier === 'basic' && density === 'medium') {
                return { propDensity: 'low' };
            }
            return { propDensity: density };
        }),
    setSelectedProps: (props) => set({ selectedProps: props }),
    setComposition: (composition) =>
        set((state) => {
            if (state.photoMode === 'Foam & Texture' && composition === 'flatlay') {
                return {
                    composition: 'centered',
                    ...withInterpretationNote(state, 'composition', INTERPRETATION_MESSAGES.macroTexturesNoAerial),
                };
            }
            return { composition };
        }),
    setSurface: (surface) => set({ surface }),
    setScale: (scale) => set({ scale }),
    setSpacing: (spacing) => set({ spacing }),
    setLightStyle: (lightStyle) => set({ lightStyle }),
    setNegativeSpace: (negativeSpace) => set({ negativeSpace }),

    // Camera
    setCameraSystem: (system) => set({ cameraSystem: system }),
    setAngle: (angle) =>
        set((state) => {
            const next: Partial<ProductStudioState> = { angle };
            if (state.photoMode === 'Foam & Texture' && (angle === 'top_down' || angle === 'detail_closeup')) {
                next.angle = 'eye_level';
                Object.assign(next, withInterpretationNote(state, 'angle', INTERPRETATION_MESSAGES.macroTexturesNoAerial));
            }
            if (isMacroFraming(state, { angle }) && isInteractionIncompatibleWithMacro(state.interaction)) {
                next.interaction = reinterpretMacroInteraction({ ...state, angle });
                next.handsHolding = next.interaction !== 'none';
                Object.assign(next, withInterpretationNote(state, 'angle', INTERPRETATION_MESSAGES.macroInteraction));
            }
            return next;
        }),
    setDistance: (distance) =>
        set((state) => {
            const next: Partial<ProductStudioState> = { distance };

            if (isMacroFraming(state, { distance }) && isInteractionIncompatibleWithMacro(state.interaction)) {
                next.interaction = reinterpretMacroInteraction({ ...state, distance });
                next.handsHolding = next.interaction !== 'none';
                Object.assign(next, withInterpretationNote(state, 'distance', INTERPRETATION_MESSAGES.macroInteraction));
            }

            // Telephoto compression cannot coexist with macro framing; prioritize distance + legibility.
            if (distance === 'macro' && isTelephotoCompressionLens(state.lens)) {
                next.lens = '100mm Macro Prime';
                Object.assign(next, withInterpretationNote(state, 'distance', INTERPRETATION_MESSAGES.cameraOverridesFraming));
            }

            return next;
        }),
    setRotation: (rotation) => set({ rotation }),
    setFraming: (framing) =>
        set((state) => {
            const next: Partial<ProductStudioState> = { framing };
            if (isTiltShiftLens(state.lens) && framing === 'rule_of_thirds') {
                next.framing = 'centered_hero';
                Object.assign(next, withInterpretationNote(state, 'framing', INTERPRETATION_MESSAGES.cameraOverridesFraming));
            }
            return next;
        }),
    setCameraUiLabels: (labels) =>
        set((state) => ({
            cameraUiSystemLabel: labels.cameraSystem ?? state.cameraUiSystemLabel,
            cameraUiAngleLabel: labels.angle ?? state.cameraUiAngleLabel,
            cameraUiDistanceLabel: labels.distance ?? state.cameraUiDistanceLabel,
            cameraUiRotationLabel: labels.rotation ?? state.cameraUiRotationLabel,
            cameraUiFramingLabel: labels.framing ?? state.cameraUiFramingLabel,
        })),

    // Environment — CANONICAL SETTER
    setEnvironmentContext: (ctx) => {
        set((state) => {
            if (ctx === null) {
                return {
                    environmentContext: null,
                    environmentMacro: 'studio',
                    microPlace: 'neutral-surface',
                    customEnvironmentText: '',
                    customMicroPlaceText: '',
                };
            }

            if (state.blankSpaceEnabled) {
                // Neutral background mode intentionally disables environments.
                return {
                    environmentContext: null,
                    environmentMacro: 'studio',
                    microPlace: 'neutral-surface',
                };
            }

            const requestedMacro = String(ctx.macro ?? 'kitchen').trim().toLowerCase() as EnvironmentMacro;
            const validatedMacro = enforceValidEnvironment(
                requestedMacro,
                state.definition.type,
                state.definition.physical.kind === 'drops' ? state.definition.physical.v.dropperState : undefined
            );

            const hasMicro = Object.prototype.hasOwnProperty.call(ctx, 'micro');
            const requestedMicro = hasMicro
                ? (ctx.micro == null ? null : String(ctx.micro).trim().toLowerCase())
                : undefined;
            const validatedMicro = (requestedMicro ? requestedMicro : null) as MicroPlace | null;

            const validatedLighting = enforceValidLighting(state.lighting, validatedMacro);

            return {
                environmentContext: { macro: validatedMacro, micro: validatedMicro },
                environmentMacro: validatedMacro,
                microPlace: validatedMicro ?? 'neutral-surface',
                lighting: validatedLighting,
            };
        });
    },

    // DEPRECATED LEGACY SETTERS — WARN AND SYNC
    setEnvironmentMacro: (env) =>
        set((state) => {
            console.warn('[ENV][LEGACY WRITE BLOCKED] setEnvironmentMacro is deprecated, use setEnvironmentContext');
            // Real environment detection
            const isRealEnvironment = env !== 'studio';

            // Validate environment
            const validEnv = enforceValidEnvironment(
                env,
                state.definition.type,
                state.definition.physical.kind === 'drops' ? state.definition.physical.v.dropperState : undefined
            );
            const validLighting = enforceValidLighting(state.lighting, validEnv);

            // MUTUAL EXCLUSIVITY: if real environment selected, disable Studio mode
            const updates: Partial<ProductStudioState> = {
                environmentMacro: validEnv,
                microPlace: getDefaultMicroPlace(validEnv),
                lighting: validLighting,
            };

            return updates;
        }),
    setMicroPlace: (place) => set({ microPlace: place }),
    setCustomEnvironmentText: (text) =>
        set((state) => {
            const trimmed = String(text || '').trim();
            const updates: Partial<ProductStudioState> = { customEnvironmentText: text };
            if (trimmed) {
                updates.environmentContext = { macro: 'custom', micro: state.environmentContext?.micro ?? null };
                updates.environmentMacro = 'custom';
            }
            return updates;
        }),
    setCustomMicroPlaceText: (text) =>
        set((state) => {
            const trimmed = String(text || '').trim();
            const updates: Partial<ProductStudioState> = { customMicroPlaceText: text };
            if (trimmed) {
                updates.environmentContext = { macro: state.environmentContext?.macro ?? state.environmentMacro, micro: 'custom' };
                updates.microPlace = 'custom';
            }
            return updates;
        }),
    setLighting: (lighting) =>
        set((state) => ({
            lighting: enforceValidLighting(lighting, state.environmentMacro),
        })),

    // Ecommerce
    setBlankSpaceEnabled: (enabled) =>
        set((state) => ({
            blankSpaceEnabled: enabled,
            microPlace: enabled ? 'neutral-surface' : state.microPlace,
            environmentContext: enabled ? null : state.environmentContext,
            environmentMacro: enabled ? 'studio' : state.environmentMacro,
        })),
    setBlankSpaceSide: (side) => set({ blankSpaceSide: side }),
    setAspectRatio: (ratio) => set({ aspectRatio: ratio }),

    // Bundles v2
    setBundleEnabled: (enabled) =>
        set((state) => {
            if (enabled && state.products.length < 2) {
                console.warn('[ProductStudio] Cannot enable bundle with < 2 products');
                return state;
            }
            if (enabled && state.sceneType === 'lifestyle-real') {
                console.warn('[ProductStudio] Cannot enable bundle in lifestyle-real mode');
                return state;
            }
            const primaryId = state.products[0]?.id || null;
            const secondaryIds = state.products.slice(1).map(p => p.id);
            return {
                bundle: {
                    ...state.bundle,
                    enabled,
                    mode: enabled ? (state.bundle.mode === 'off' ? 'hero' : state.bundle.mode) : 'off', // Auto-set to hero if currently off
                    primaryProductId: enabled ? primaryId : null,
                    secondaryProductIds: enabled ? secondaryIds : [],
                },
            };
        }),

    setBundleMode: (mode) =>
        set((state) => {
            // Only restrict in basic tier AND not in pro mode
            const isProModeActive = state.controlTier === 'pro' || state.advancedModeEnabled || state.proMode;
            if (state.presetTier === 'basic' && !isProModeActive && mode !== 'off' && mode !== 'hero') {
                return { bundle: { ...state.bundle, mode: 'hero' } };
            }
            return { bundle: { ...state.bundle, mode } };
        }),

    selectPrebuiltBundle: (bundleId) =>
        set((state) => {
            const bundle = PREBUILT_BUNDLES.find(b => b.id === bundleId);
            if (!bundle) return state;
            if (!canUseBundle(bundle, state.products.length)) {
                console.warn(`[ProductStudio] Cannot use ${bundleId}: need ${bundle.minProducts}-${bundle.maxProducts} products`);
                return state;
            }
            const primaryId = state.products[0]?.id || null;
            const secondaryIds = state.products.slice(1, bundle.maxProducts).map(p => p.id);
            return {
                bundle: {
                    ...state.bundle,
                    enabled: true,
                    mode: 'hero',
                    selectedBundleId: bundleId,
                    primaryProductId: primaryId,
                    secondaryProductIds: secondaryIds,
                    layout: bundle.layout,
                    spacing: bundle.spacing,
                },
            };
        }),

    setBundleLayout: (layout) =>
        set((state) => ({
            bundle: { ...state.bundle, layout },
        })),

    setBundleSpacing: (spacing) =>
        set((state) => ({
            bundle: { ...state.bundle, spacing },
        })),

    applyRecommendedBundle: () =>
        set((state) => {
            const recommended = getRecommendedBundle(state.products.length);
            if (!recommended) return state;
            const primaryId = state.products[0]?.id || null;
            const secondaryIds = state.products.slice(1).map(p => p.id);
            return {
                bundle: {
                    ...state.bundle,
                    enabled: true,
                    mode: 'hero',
                    selectedBundleId: recommended.id,
                    primaryProductId: primaryId,
                    secondaryProductIds: secondaryIds,
                    layout: recommended.layout,
                    spacing: recommended.spacing,
                },
            };
        }),

    // Preset
    setPresetTier: (tier) =>
        set((state) => {
            if (tier === 'basic') {
                // Apply basic tier restrictions
                return {
                    presetTier: tier,
                    propDensity: state.propDensity === 'medium' ? 'low' : state.propDensity,
                    bundle: state.bundle.mode !== 'off' && state.bundle.mode !== 'hero'
                        ? { ...state.bundle, mode: 'hero' }
                        : state.bundle,
                };
            }
            return { presetTier: tier };
        }),

    applyBasicPreset: () =>
        set({
            presetTier: 'basic',
            creativityLevel: 1,
            creativeTheme: 'clinical-minimal',
            propDensity: 'none',
            blankSpaceEnabled: true,
        }),

    applyProPreset: () =>
        set({
            presetTier: 'pro',
            creativityLevel: 2,
            creativeTheme: 'premium-clean',
            propDensity: 'low',
        }),

    applyBrandPreset: (presetId) =>
        set((state) => {
            const preset = BRAND_PRESETS.find((p) => p.id === presetId);
            if (!preset) return state;

            const newState = { ...state, ...preset.config };

            // For the "Vibrant Color Pop Studio" preset, auto-enable a duo layout when 2+ products exist.
            if (presetId === 'olly-style') {
                // Try to apply "Duo" if available
                if (state.products.length >= 2) {
                    // We can reuse selectPrebuiltBundle logic effectively
                    const duo = PREBUILT_BUNDLES.find(b => b.id === 'daily_duo');
                    if (duo) {
                        const primaryId = state.products[0]?.id || null;
                        const secondaryIds = state.products.slice(1, duo.maxProducts).map(p => p.id);
                        newState.bundle = {
                            ...state.bundle,
                            enabled: true,
                            mode: 'hero',
                            selectedBundleId: 'daily_duo',
                            primaryProductId: primaryId,
                            secondaryProductIds: secondaryIds,
                            layout: duo.layout,
                            spacing: duo.spacing
                        };
                    }
                }
            }

            return newState;
        }),

    // Product Studio UI Controls (NEW)
    setControlTier: (controlTier) =>
        set((state) => {
            const nextIsPro = controlTier === 'pro';
            console.log("ADVANCED_CONTROLS_ACTIVE =", nextIsPro);
            if (controlTier === 'basic') {
                return {
                    controlTier,
                    advancedModeEnabled: false,
                    proMode: false,
                };
            }
            return { controlTier };
        }),
    setAdvancedModeEnabled: (enabled) =>
        set((state) => {
            const nextEnabled = state.controlTier === 'pro' ? Boolean(enabled) : false;
            return {
                advancedModeEnabled: nextEnabled,
                // Keep legacy flag in sync for backward compatibility.
                proMode: nextEnabled,
            };
        }),
    setQualityProfile: (profile) =>
        set({
            qualityProfile: profile,
            visualIntent: mapQualityProfileToVisualIntent(profile),
        }),
    setUltraRealStrict: (enabled) => set({ ultraRealStrict: Boolean(enabled) }),
    setPhotoMode: (mode) =>
        set((state) => {
            console.log('[SET PHOTO MODE]', mode);
            const rawMode = String(mode ?? '').trim();
            const nextMode = rawMode === 'UGC Premium Simulation' ? 'Creator Premium Simulation' : rawMode;

            if (VISUAL_STYLE_SELECTIONS.has(nextMode)) {
                return {
                    visualStyle: nextMode as ProductStudioState['visualStyle'],
                };
            }

            // Phase 1 (locked): Photo Mode is the primary creative selector.
            // It maps to existing internal sceneType values and fully replaces Brand Look System.
            // NOTE: Keep this list in sync with PhotoMode union in types.ts and industryRules allowedPhotoModes.
            // Missing modes here cause setPhotoMode to silently coerce to 'Hero Landing Page'.
            const allowed: PhotoMode[] = [
                'Hero Landing Page',
                'Ingredient Stack',
                'Ingredient Flat Lay',
                'Acrylic Blocks',
                'Glass Pedestal Studio',
                'Splash Shot',
                'Foam & Texture',
                'Routine Carousel',
                'Luxury Editorial Tabletop',
                'Candy Gradient Lab',
                'Golden Mist Aura',
                'Golden Hour Lifestyle',
                'Pastel Picnic',
                'Hands Application Clean',
                'Underwater Split',
                'Macro Dew Label',
                'Gel Smear Editorial',
                'Citrus Fresh Flat Lay',
                'Stones & Crystals Flat Lay',
                'Dried Citrus Earth',
                'Beach Foam Splash',
                'Pool Water',
                'Cheers (Hands Clink)',
                'Ice Cubes',
                'Condensation Droplets',
                'Fruit Garnish / Citrus Accents',
                'Textured Bed / Scatter Base',
                'Floating Particles',
                'Caustic Light Ripples',
                'Prism Rainbow Refractions',
                'Glass Refraction Panels',
                'Micro Mist Halo',
                'Shadow Pattern Projection',
                // Wine-exclusive photo modes
                'Wine Macro Label',
                'Bottle + Glass',
                'Bottle + Glass Pour',
                'Hands Pouring Wine',
                'Wine Lineup Comparison',
                'Editorial Bottle Tabletop',
                'Bottle In Hand Cutout',
                'Rose Tasting Table',
                'Editorial Table',
                'Winery Scene',
            ];

            const resolvedMode: PhotoMode = allowed.includes(nextMode as PhotoMode) ? (nextMode as PhotoMode) : 'Hero Landing Page';
            const wineModeActive = isWinePrestigeMode(state);
            const splashBlockedInWineMode =
                wineModeActive &&
                (resolvedMode === 'Splash Shot' ||
                    resolvedMode === 'Beach Foam Splash' ||
                    resolvedMode === 'Pool Water');
            // Macro Dew Label is supplement-only — block it in wine engine
            const macroDewBlockedInWineMode = wineModeActive && resolvedMode === 'Macro Dew Label';
            const effectiveMode: PhotoMode = splashBlockedInWineMode || macroDewBlockedInWineMode
                ? 'Hero Landing Page'
                : resolvedMode;
            const hadEnvironmentEnabled = state.environmentContext != null;
            const alreadyInLifestyle = state.mode === 'lifestyle-real' && state.sceneType === 'lifestyle-real';
            // Preserve environment only when the user is already in Lifestyle mode.
            // This prevents any stale env state from forcing Studio -> Lifestyle on photo mode changes.
            const shouldUseEnvironment = hadEnvironmentEnabled && alreadyInLifestyle;
            const schema = PHOTO_MODE_SCHEMAS[effectiveMode];
            const allowedInteractions = getPhotoModeAllowedInteractions(effectiveMode);
            let resolvedPlacement: ProductPlacement = state.placement;
            let resolvedInteraction: ProductStudioState['interaction'] = state.interaction;
            let resolvedHandsHolding = state.handsHolding;
            const notes: Partial<ProductStudioState> = {};
            
            // CLEANUP: Clear props/ingredients when switching AWAY from ingredient modes
            // Only these 3 modes use ingredients field:
            const ingredientModes = ['Ingredient Stack', 'Ingredient Flat Lay', 'Ice Cubes'];
            const wasIngredientMode = ingredientModes.includes(state.photoMode);
            const isIngredientMode = ingredientModes.includes(effectiveMode);
            const shouldClearProps = wasIngredientMode && !isIngredientMode;


            if (schema?.allowsPersonPresence === false && resolvedInteraction !== 'none') {
                resolvedInteraction = 'none';
                resolvedHandsHolding = false;
                Object.assign(notes, withInterpretationNote(state, 'photoModeInteraction', INTERPRETATION_MESSAGES.photoModeForcesInteraction));
            }

            if (allowedInteractions && !allowedInteractions.includes(resolvedInteraction)) {
                resolvedInteraction = getFallbackInteraction(allowedInteractions);
                resolvedHandsHolding = resolvedInteraction !== 'none';
                Object.assign(notes, withInterpretationNote(state, 'photoModeInteraction', INTERPRETATION_MESSAGES.photoModeForcesInteraction));
            }

            if (resolvedPlacement === 'held' && resolvedInteraction === 'none') {
                const canUseHands = schema?.allowsPersonPresence !== false;
                const allowedHandInteraction = (allowedInteractions ?? []).find(interactionNeedsHands);
                if (canUseHands && allowedHandInteraction) {
                    resolvedInteraction = allowedHandInteraction;
                    resolvedHandsHolding = true;
                } else {
                    resolvedPlacement = 'surface';
                    Object.assign(notes, withInterpretationNote(state, 'placement', INTERPRETATION_MESSAGES.heldRequiresInteraction));
                }
            }

            if (resolvedPlacement === 'air' && resolvedInteraction !== 'none') {
                resolvedInteraction = 'none';
                resolvedHandsHolding = false;
                Object.assign(notes, withInterpretationNote(state, 'placement', INTERPRETATION_MESSAGES.photoModeForcesInteraction));
            }

            if (interactionNeedsHands(resolvedInteraction) && resolvedPlacement !== 'held' && resolvedPlacement !== 'supported') {
                resolvedPlacement = 'held';
            }

            const common: Partial<ProductStudioState> = {
                photoMode: effectiveMode,
                visualStyle: undefined,
                specialEffects: [],
                placement: resolvedPlacement,
                // Preserve environment once user enables it from PHOTO TYPE.
                environmentContext: shouldUseEnvironment
                    ? (state.environmentContext ?? { macro: 'kitchen', micro: getDefaultMicroPlace('kitchen') })
                    : null,
                handsHolding: resolvedHandsHolding,
                interaction: resolvedInteraction,
                // CLEANUP: Clear ingredients when leaving Ingredient Stack/Flat Lay modes
                ...(shouldClearProps ? { props: '', selectedProps: [] } : {}),
                ...notes,
            };

            // Keep motion coherent with photo mode compatibility matrix.
            const allowedMotions = getAllowedMotionsForPhotoMode(effectiveMode);
            if (allowedMotions && !allowedMotions.includes(state.stateMotion)) {
                common.stateMotion = getFallbackMotionForPhotoMode(effectiveMode);
                common.definition = applyCanonicalPhysicalForMotion(
                    state.definition,
                    common.stateMotion
                );
                Object.assign(common, withInterpretationNote(state, 'stateMotion', 'Photo Mode requires a different product motion. Motion was adjusted automatically.'));
            }

            if (effectiveMode === 'Hero Landing Page' && !shouldUseEnvironment) {
                const merged = {
                    ...common,
                    proMode: false,
                    // Hero Landing Page rules: bundles are not allowed.
                    bundle: { ...state.bundle, enabled: false },
                } as ProductStudioState;
                return {
                    ...merged,
                    ...applyHeroLandingBackgroundDefaults(merged),
                };
            }

            if (shouldUseEnvironment) {
                return {
                    ...common,
                    ...(splashBlockedInWineMode
                        ? withInterpretationNote(state, 'photoMode', 'Wine Prestige mode blocks Splash modes. Switched to Hero Landing Page while preserving visual style controls.')
                        : {}),
                };
            }

            return {
                ...common,
                ...(splashBlockedInWineMode
                    ? withInterpretationNote(state, 'photoMode', 'Wine Prestige mode blocks Splash modes. Switched to Hero Landing Page while preserving visual style controls.')
                    : {}),
            };
        }),
    updatePhotoModeSubSetting: (mode, category, value) =>
        set((state) => {
            const currentDynamic = state.photoModeConfig.dynamic || {};
            const modeConfig = currentDynamic[mode] || {};

            return {
                photoModeConfig: {
                    ...state.photoModeConfig,
                    dynamic: {
                        ...currentDynamic,
                        [mode]: {
                            ...modeConfig,
                            [category]: value
                        }
                    }
                }
            };
        }),
    setPhotoModeConfig: (patch) =>
        set((state) => {
            const nextHeroLandingPage = {
                ...state.photoModeConfig.heroLandingPage,
                ...(patch.heroLandingPage ?? {}),
            };
            const nextConfig: PhotoModeConfig = {
                heroLandingPage: nextHeroLandingPage,
                colorPopHero: {
                    ...state.photoModeConfig.colorPopHero,
                    ...(patch.colorPopHero ?? {}),
                },
                ingredientStack: {
                    ...state.photoModeConfig.ingredientStack,
                    ...(patch.ingredientStack ?? {}),
                },
                acrylicBlocks: {
                    ...state.photoModeConfig.acrylicBlocks,
                    ...(patch.acrylicBlocks ?? {}),
                },
                splashShot: normalizeSplashShotConfig({
                    ...state.photoModeConfig.splashShot,
                    ...(patch.splashShot ?? {}),
                }),
                foamAndTexture: {
                    ...(() => {
                        const base = state.photoModeConfig.foamAndTexture;
                        const incoming = patch.foamAndTexture ?? {};
                        const next = { ...base, ...incoming } as typeof base;
                        const textureType = String(next.textureType || '').trim().toLowerCase();
                        if (textureType === 'foam') next.materialState = 'foam';
                        else if (textureType === 'cream') next.materialState = 'cream';
                        else if (textureType === 'gel') next.materialState = 'gel';
                        else if (textureType === 'powder') next.materialState = 'powder';
                        return next;
                    })(),
                },
                routineCarousel: {
                    ...state.photoModeConfig.routineCarousel,
                    ...(patch.routineCarousel ?? {}),
                },
                clinicalLabCounter: {
                    ...state.photoModeConfig.clinicalLabCounter,
                    ...(patch.clinicalLabCounter ?? {}),
                },
                goldenMistAura: {
                    ...state.photoModeConfig.goldenMistAura,
                    ...(patch.goldenMistAura ?? {}),
                },
                candyGradientLab: {
                    ...state.photoModeConfig.candyGradientLab,
                    ...(patch.candyGradientLab ?? {}),
                },
            };

            const nextState: ProductStudioState = {
                ...state,
                photoModeConfig: nextConfig,
            } as ProductStudioState;

            // If user explicitly clicks Background Type in Hero mode, lock auto-selection.
            const heroAuto: HeroLandingAutoFlags = {
                backgroundType:
                    patch.heroLandingPage && Object.prototype.hasOwnProperty.call(patch.heroLandingPage, 'backgroundType')
                        ? false
                        : (state.heroLandingAuto?.backgroundType ?? true),
            };
            const withAuto: ProductStudioState = { ...nextState, heroLandingAuto: heroAuto } as ProductStudioState;

            // Apply derived hero background defaults when hero settings change (palette source, background type, etc).
            const heroDerived = applyHeroLandingBackgroundDefaults(withAuto);

            return {
                ...withAuto,
                ...heroDerived,
            };
        }),
    setSplashStyle: (style) =>
        set(() => ({
            splashStyle: style ?? 'Basic',
        })),
    setBackgroundColor: (color) =>
        set((state) => ({
            backgroundColor: String(color ?? ''),
            colorLocks: { ...state.colorLocks, background: true },
        })),
    setAccentColor: (color) =>
        set((state) => ({
            accentColor: String(color ?? ''),
            colorLocks: { ...state.colorLocks, accent: true },
        })),
    setAlignment: (alignment) => set({ alignment }),
    setShadow: (shadow) =>
        set((state) => {
            if (state.stateMotion === 'opened' && shadow === 'floating') {
                return {
                    shadow: 'soft-drop',
                    ...withInterpretationNote(state, 'shadow', INTERPRETATION_MESSAGES.openedCannotFloat),
                };
            }
            return { shadow };
        }),
    setGradientEnabled: (enabled) => set({ gradientEnabled: enabled }),
    setGradientStart: (color) =>
        set((state) => ({
            gradientStart: String(color ?? ''),
            colorLocks: { ...state.colorLocks, gradientStart: true },
        })),
    setGradientEnd: (color) =>
        set((state) => ({
            gradientEnd: String(color ?? ''),
            colorLocks: { ...state.colorLocks, gradientEnd: true },
        })),
    setGradientMid: (color) =>
        set((state) => ({
            gradientMid: String(color ?? ''),
            colorLocks: { ...state.colorLocks, gradientMid: true },
        })),
    setGradientAngle: (angle) => set({ gradientAngle: angle }),
    setProps: (props) =>
        set((state) => {
            const nextProps = String(props ?? '');
            const hasProps = nextProps.trim().length > 0;
            // If the user starts typing props, ensure they actually show up by not leaving density at "none".
            // We preserve explicit user choices if they've already picked a density.
            const nextDensity =
                hasProps && state.propDensity === 'none' ? 'low' : state.propDensity;
            return { props: nextProps, propDensity: nextDensity };
        }),
    setIngredientLayout: (layout) =>
        set({ ingredientLayout: (layout ?? 'auto') as ProductStudioState['ingredientLayout'] }),
    setInteraction: (interaction) =>
        set((state) => {
            const isCapsules = state.definition.type === 'capsules';
            let effectiveInteraction: ProductStudioState['interaction'] =
                interaction === 'capsule-display' && !isCapsules ? 'none' : interaction;

            // Rule 1: Macro framing cannot support active/gestural holds.
            if (isMacroFraming(state) && isInteractionIncompatibleWithMacro(effectiveInteraction)) {
                effectiveInteraction = reinterpretMacroInteraction(state);
                return {
                    interaction: effectiveInteraction,
                    handsHolding: effectiveInteraction !== 'none',
                    definition: applyCanonicalPhysicalForMotion(state.definition, state.stateMotion),
                    ...withInterpretationNote(state, 'interaction', INTERPRETATION_MESSAGES.macroInteraction),
                };
            }

            // Rule 4 (safety): never allow hybrid interaction flags.
            if (effectiveInteraction === 'none' && state.handsHolding === true) {
                return {
                    interaction: 'none',
                    handsHolding: false,
                    definition: applyCanonicalPhysicalForMotion(state.definition, state.stateMotion),
                    ...withInterpretationNote(state, 'interaction', INTERPRETATION_MESSAGES.interactionSimplified),
                };
            }

            const updates: Partial<ProductStudioState> = {
                interaction: effectiveInteraction,
                handsHolding: effectiveInteraction !== 'none',
                definition: applyCanonicalPhysicalForMotion(state.definition, state.stateMotion),
            };

            if (interactionNeedsHands(effectiveInteraction)) {
                updates.placement = 'held';
            }

            return updates;
        }),
    setStateMotion: (motion) =>
        set((state) => {
            const allowedMotions = getAllowedMotionsForPhotoMode(state.photoMode);
            const effectiveMotion =
                allowedMotions && !allowedMotions.includes(motion)
                    ? getFallbackMotionForPhotoMode(state.photoMode)
                    : motion;
            const next: Partial<ProductStudioState> = {
                stateMotion: effectiveMotion,
                definition: applyCanonicalPhysicalForMotion(state.definition, effectiveMotion),
            };
            if (effectiveMotion === 'opened' && state.shadow === 'floating') {
                next.shadow = 'soft-drop';
                Object.assign(next, withInterpretationNote(state, 'stateMotion', INTERPRETATION_MESSAGES.openedCannotFloat));
            }
            if (effectiveMotion !== motion) {
                Object.assign(next, withInterpretationNote(state, 'stateMotion', 'Selected Product State & Motion is incompatible with current Photo Mode. Motion was adjusted automatically.'));
            }
            return next;
        }),
    setProMode: (enabled) =>
        set(() => ({
            // Legacy compatibility only. Do not mutate controlTier/advancedModeEnabled here.
            proMode: Boolean(enabled),
        })),
    setViewpoint: (viewpoint) =>
        set((state) => {
            if (state.photoMode === 'Ingredient Flat Lay') {
                return { viewpoint: 'top-down' };
            }
            return { viewpoint };
        }),
    setPlacement: (placement) =>
        set((state) => {
            const schema = PHOTO_MODE_SCHEMAS[state.photoMode];
            const effectivePlacement: ProductPlacement = placement;
            const next: Partial<ProductStudioState> = { placement: effectivePlacement };

            // Auto-sync interaction based on placement physics
            if (effectivePlacement === 'held') {
                if (schema?.allowsPersonPresence === false) {
                    next.placement = 'surface';
                    next.interaction = 'none';
                    next.handsHolding = false;
                    Object.assign(next, withInterpretationNote(state, 'placement', INTERPRETATION_MESSAGES.heldRequiresInteraction));
                    return next;
                }
                // If moving to Held, ensure an interaction that involves hands is active
                if (!interactionNeedsHands(state.interaction)) {
                    next.interaction = 'holding';
                    next.handsHolding = true;
                }
            } else {
                // Surface, Supported, Air (Neutralized Gravity)
                // If moving away from Held, clear active holding interactions
                if (interactionNeedsHands(state.interaction)) {
                    next.interaction = 'none';
                    next.handsHolding = false;
                }
                if (effectivePlacement === 'air' && state.interaction !== 'none') {
                    next.interaction = 'none';
                    next.handsHolding = false;
                }
            }

            return next;
        }),

    // ── Unified Product Behavior setters ────────────────────────────────────

    setPhysicalFormFactor: (formFactor) =>
        set((state) => {
            // When form factor changes, auto-validate all dependent fields
            const presence = state.physicalPresence ?? 'surface';
            const productState = state.productState ?? 'static';
            const productInteraction = state.productInteraction ?? 'none';
            const { presence: correctedPresence, state: correctedState, interaction: correctedInteraction } =
                validateAndCorrectCapabilities(formFactor, {
                    presence,
                    state: productState,
                    interaction: productInteraction,
                });
            return {
                physicalFormFactor: formFactor,
                physicalPresence: correctedPresence,
                productState: correctedState,
                productInteraction: correctedInteraction,
            };
        }),

    setPhysicalPresence: (presence) =>
        set((state) => {
            const formFactor = state.physicalFormFactor;
            if (!formFactor) return { physicalPresence: presence };
            const productState = state.productState ?? 'static';
            const productInteraction = state.productInteraction ?? 'none';
            const { presence: correctedPresence, state: correctedState, interaction: correctedInteraction } =
                validateAndCorrectCapabilities(formFactor, {
                    presence,
                    state: productState,
                    interaction: productInteraction,
                });
            return {
                physicalPresence: correctedPresence,
                productState: correctedState,
                productInteraction: correctedInteraction,
            };
        }),

    setProductState: (productState) =>
        set((state) => {
            const formFactor = state.physicalFormFactor;
            if (!formFactor) return { productState };
            const presence = state.physicalPresence ?? 'surface';
            const productInteraction = state.productInteraction ?? 'none';
            const { presence: correctedPresence, state: correctedState, interaction: correctedInteraction } =
                validateAndCorrectCapabilities(formFactor, {
                    presence,
                    state: productState,
                    interaction: productInteraction,
                });
            return {
                physicalPresence: correctedPresence,
                productState: correctedState,
                productInteraction: correctedInteraction,
            };
        }),

    setProductInteraction: (productInteraction) =>
        set((state) => {
            const formFactor = state.physicalFormFactor;
            if (!formFactor) return { productInteraction };
            const presence = state.physicalPresence ?? 'surface';
            const productState = state.productState ?? 'static';
            const { presence: correctedPresence, state: correctedState, interaction: correctedInteraction } =
                validateAndCorrectCapabilities(formFactor, {
                    presence,
                    state: productState,
                    interaction: productInteraction,
                });
            return {
                physicalPresence: correctedPresence,
                productState: correctedState,
                productInteraction: correctedInteraction,
            };
        }),

    setLens: (lens) =>
        set((state) => {
            const next: Partial<ProductStudioState> = { lens };

            // Telephoto compression cannot coexist with macro framing.
            if (isTelephotoCompressionLens(lens) && state.distance === 'macro') {
                next.distance = 'tight';
                Object.assign(next, withInterpretationNote(state, 'lens', INTERPRETATION_MESSAGES.cameraOverridesFraming));
            }
            // Tilt-shift invalidates strict thirds.
            if (isTiltShiftLens(lens) && state.framing === 'rule_of_thirds') {
                next.framing = 'centered_hero';
                Object.assign(next, withInterpretationNote(state, 'lens', INTERPRETATION_MESSAGES.cameraOverridesFraming));
            }
            // Macro lens implies macro-safe optics if macro framing is selected.
            if (state.distance === 'macro' && !isMacroLens(lens) && isTelephotoCompressionLens(lens) === false) {
                // No-op: allow product primes; only compression is blocked.
            }

            return next;
        }),
    setLightingRig: (rig) => set({ lightingRig: rig }),
    setLightColorTemp: (temp) => set({ lightColorTemp: temp }),
    setCustomLightColor: (color) => set({ customLightColor: color }),
    setAccentLightIntensity: (intensity) => set({ accentLightIntensity: Math.max(0, Math.min(100, intensity)) }),
    setFinish: (finish) => set({ finish }),

    resetProducts: () =>
        set((state) => ({
            products: [],
            activeProductId: null,
            bundle: {
                ...state.bundle,
                enabled: false,
                mode: 'off',
                selectedBundleId: null,
                primaryProductId: null,
                secondaryProductIds: [],
            },
        })),

    // Reset
    reset: () => set(DEFAULT_PRODUCT_STUDIO_STATE),
}));

// ============================================================================
// ASYNC HELPER: Add Product with Palette Extraction
// This is the ONLY entry point for adding products in the app
// ============================================================================

/**
 * Add a product with automatic palette extraction from the image.
 * RULE: Color extraction happens ONCE at product creation time.
 * RULE: If user hasn't touched colors, palette is used. Otherwise, user choice wins.
 */
export async function addProductWithPalette(
    product: Omit<ProductAsset, 'palette'>
): Promise<void> {
    const store = useProductStudioStore.getState();

    // Extract palette from product image
    const imageSource =
        product.base64
            ? (product.base64.startsWith('data:')
                ? product.base64
                : `data:${product.mimeType || 'image/png'};base64,${product.base64}`)
            : product.imageUrl;
    let palette: ProductAsset['palette'] = undefined;

    if (imageSource) {
        try {
            const colors = await extractDominantColors(imageSource);
            palette = {
                dominant: colors.dominant,
                secondary: colors.secondary,
                accent: colors.accent,
            };
            console.log('[addProductWithPalette] Extracted palette:', palette);
        } catch (error) {
            console.warn('[addProductWithPalette] Failed to extract palette:', error);
        }
    }

    // Create enriched product asset
    const enrichedProduct: ProductAsset = {
        ...product,
        palette,
    };

    // Add to store (store handles auto-setting colors if at defaults)
    store.addProduct(enrichedProduct);
}
