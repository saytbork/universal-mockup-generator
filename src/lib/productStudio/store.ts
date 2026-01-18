/**
 * PRODUCT STUDIO STORE
 * Zustand store with complete defaults - v2
 */

import { create } from 'zustand';
import { extractDominantColors } from './colorExtractor';
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
    ProductMode,
    BrandPalette,
    EnvironmentContext,
} from './types';


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
const RING_LIGHT_ENVS: EnvironmentMacro[] = ['studio', 'workspace', 'kitchen', 'living-room', 'bedroom', 'bathroom'];

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
            photoMode: 'Clinical Lab Counter',
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
            photoMode: 'Sunrise Wellness Counter',
            gradientEnabled: true,
            gradientAngle: 180,
            proMode: true,
            lens: '50mm Product Prime',
            lightingRig: 'Gradient Cyclorama',
            finish: 'Matte Editorial',
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
            photoMode: 'Candy Gradient Lab',
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
    cameraSystem: 'dslr',
    angle: '45',
    distance: 'medium',
    rotation: 'none',
    framing: 'centered',

    // 7️⃣ OUTPUT & EXPORT
    aspectRatio: '4:3',
    blankSpaceEnabled: false,
    blankSpaceSide: 'right',

    // BUNDLE (Sub-system)
    bundle: DEFAULT_BUNDLE,

    // PRODUCT STUDIO UI CONTROLS (NEW)
    photoMode: 'Hero Landing Page',
    backgroundColor: '#ffffff',
    accentColor: '#6366f1',
    colorLocks: {
        background: false,
        accent: false,
        gradientStart: false,
        gradientEnd: false,
    },
    alignment: 'center',
    shadow: 'soft-drop',
    gradientEnabled: false,
    gradientStart: '#ffffff',
    gradientEnd: '#f0f0f0',
    gradientAngle: 180,
    props: '',
    ingredientLayout: 'grounded',
    interaction: 'none',
    proMode: false,
    lens: '50mm Product Prime',
    lightingRig: 'Softbox Wrap',
    finish: 'High-Gloss Commercial',

    // LEGACY (To be removed)
    ecommerceMode: false,
    paletteSource: 'brand',
    lighting: 'clinical-softbox',
    presetTier: 'basic',
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
    setPhotoMode: (mode: string) => void;
    setBackgroundColor: (color: string) => void;
    setAccentColor: (color: string) => void;
    setAlignment: (alignment: ProductStudioState['alignment']) => void;
    setShadow: (shadow: 'soft-drop' | 'hard-drop' | 'floating') => void;
    setGradientEnabled: (enabled: boolean) => void;
    setGradientStart: (color: string) => void;
    setGradientEnd: (color: string) => void;
    setGradientAngle: (angle: number) => void;
    setProps: (props: string) => void;
    setIngredientLayout: (layout: ProductStudioState['ingredientLayout']) => void;
    setInteraction: (interaction: ProductStudioState['interaction']) => void;
    setStateMotion: (motion: ProductStateMotion) => void;
    setProMode: (enabled: boolean) => void;
    setLens: (lens: string) => void;
    setLightingRig: (rig: string) => void;
    setFinish: (finish: string) => void;

    // Reset
    /** Clears only `products` (and disables bundle), preserving all user-selected settings. */
    resetProducts: () => void;
    reset: () => void;
};

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

            return { ...state, ...updates };
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
                updates.environmentMacro = 'studio';
                updates.microPlace = 'neutral-surface';
            }

            // Map mode to sceneType (legacy compatibility)
            const modeToSceneType: Record<typeof mode, SceneType> = {
                'studio': 'studio-branding',
                'editorial': 'editorial-product',
                'lifestyle-real': 'lifestyle-real',
                'ugc': 'ugc-phone',
                'ecommerce': 'studio-branding',
            };
            updates.sceneType = modeToSceneType[mode];

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
                capsules: ['static', 'opened', 'falling', 'spilled'],
                gummies: ['static', 'opened', 'falling', 'spilled'],
                drops: ['static', 'opened', 'dispensed'],
                powder: ['static', 'opened', 'pouring', 'dispensed'],
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
        set((state) => {
            let newBundle = state.bundle;
            // lifestyle-real forces bundle off
            if (sceneType === 'lifestyle-real' && state.bundle.enabled) {
                newBundle = { ...state.bundle, enabled: false };
            }
            // blankSpaceEnabled forces studio
            const effectiveSceneType = state.blankSpaceEnabled ? 'studio-branding' : sceneType;
            return {
                sceneType: effectiveSceneType,
                bundle: newBundle,
                // studio forces neutral-surface
                microPlace: effectiveSceneType === 'studio-branding' ? 'neutral-surface' : state.microPlace,
            };
        }),

    // Creativity
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
    setComposition: (composition) => set({ composition }),
    setSurface: (surface) => set({ surface }),
    setScale: (scale) => set({ scale }),
    setSpacing: (spacing) => set({ spacing }),
    setLightStyle: (lightStyle) => set({ lightStyle }),
    setNegativeSpace: (negativeSpace) => set({ negativeSpace }),

    // Camera
    setCameraSystem: (system) => set({ cameraSystem: system }),
    setAngle: (angle) => set({ angle }),
    setDistance: (distance) => set({ distance }),
    setRotation: (rotation) => set({ rotation }),
    setFraming: (framing) => set({ framing }),

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
                    mode: 'studio',
                    sceneType: 'studio-branding',
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

            const requestedMacro = (ctx.macro ?? 'kitchen') as EnvironmentMacro;
            const validatedMacro = enforceValidEnvironment(
                requestedMacro,
                state.definition.type,
                state.definition.physical.kind === 'drops' ? state.definition.physical.v.dropperState : undefined
            );

            const hasMicro = Object.prototype.hasOwnProperty.call(ctx, 'micro');
            const requestedMicro = (hasMicro ? ctx.micro : undefined) as unknown as MicroPlace | null | undefined;
            const validatedMicro = requestedMicro ? requestedMicro : null;

            const validatedLighting = enforceValidLighting(state.lighting, validatedMacro);

            return {
                environmentContext: { macro: validatedMacro, micro: validatedMicro },
                environmentMacro: validatedMacro,
                microPlace: validatedMicro ?? 'neutral-surface',
                lighting: validatedLighting,
                mode: validatedMacro === 'studio' ? 'studio' : 'lifestyle-real',
                sceneType: validatedMacro === 'studio' ? 'studio-branding' : 'lifestyle-real',
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

            if (isRealEnvironment && state.mode === 'studio') {
                updates.mode = 'lifestyle-real';
                updates.sceneType = 'lifestyle-real';
                console.log('[ProductStudio] UI LOCK: Real environment selected → Studio Creative disabled');
            }

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
                updates.mode = 'lifestyle-real';
                updates.sceneType = 'lifestyle-real';
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
            sceneType: enabled ? 'studio-branding' : state.sceneType,
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
                    primaryProductId: enabled ? primaryId : null,
                    secondaryProductIds: enabled ? secondaryIds : [],
                },
            };
        }),

    setBundleMode: (mode) =>
        set((state) => {
            // Basic tier restricts bundle modes
            if (state.presetTier === 'basic' && mode !== 'off' && mode !== 'hero') {
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
                    sceneType: 'studio-branding',
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
            sceneType: 'studio-branding',
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
    setPhotoMode: (mode) =>
        set((state) => {
            const nextMode = String(mode ?? '');
            const active = state.products.find(p => p.id === state.activeProductId) ?? state.products[0];
            const palette = active?.palette;

            // "Clear" means: pure white, no set dressing, no creative styling blocks.
            if (nextMode === 'Clear') {
                return {
                    photoMode: nextMode,
                    backgroundColor: '#FFFFFF',
                    gradientEnabled: false,
                    props: '',
                    ingredientLayout: 'grounded',
                    selectedProps: [],
                    propDensity: 'none',
                    creativityLevel: 0,
                    paletteSource: 'custom',
                    // lock white background so palette extraction doesn't override it
                    colorLocks: { ...state.colorLocks, background: true },
                };
            }

            const next: Partial<ProductStudioState> = { photoMode: nextMode };

            // Photo-mode defaults (only when user hasn't explicitly locked those colors).
            // These defaults are meant to *support* the look, but remain editable.
            const canSetBg = !state.colorLocks.background;
            const canSetAccent = !state.colorLocks.accent;
            const canSetG1 = !state.colorLocks.gradientStart;
            const canSetG2 = !state.colorLocks.gradientEnd;

            const dominant = palette?.dominant;
            const secondary = palette?.secondary;

            const isGradientMode = [
                'Candy Gradient Lab',
                'Sunrise Wellness Counter',
                'Golden Mist Aura',
                'Pastel Picnic',
                'Outdoor Energy Boost',
            ].includes(nextMode);

            if (isGradientMode) {
                next.gradientEnabled = true;
                if (canSetG1 && dominant) next.gradientStart = dominant;
                if (canSetG2 && secondary) next.gradientEnd = secondary;
            }

            const isColorPop = nextMode === 'Color Pop Hero';
            if (isColorPop) {
                next.gradientEnabled = false;
                if (canSetBg && dominant) next.backgroundColor = dominant;
                if (canSetAccent && secondary) next.accentColor = secondary;
            }

            // Keep other modes neutral by default (no forced white injection).
            return next;
        }),
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
    setShadow: (shadow) => set({ shadow }),
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
            const nextInteraction = interaction;

            // Force rules (engine-level):
            // - Capsule Display => motion must be Static
            // - Applying / Opening => motion must be Opened
            let nextMotion: ProductStateMotion = state.stateMotion;
            if (nextInteraction === 'capsule-display') nextMotion = 'static';
            if (nextInteraction === 'applying-opening') nextMotion = 'opened';

            const isAllowedByMotion = (motion: ProductStateMotion, candidate: ProductStudioState['interaction']) => {
                if (motion === 'pouring' || motion === 'falling') return candidate === 'none' || candidate === 'cropped-hand';
                if (motion === 'spilled' || motion === 'dispensed') {
                    return (
                        candidate === 'none' ||
                        candidate === 'cropped-hand' ||
                        candidate === 'resting-interaction' ||
                        candidate === 'supported-hold'
                    );
                }
                if (motion === 'opened') {
                    return (
                        candidate === 'none' ||
                        candidate === 'cropped-hand' ||
                        candidate === 'supported-hold' ||
                        candidate === 'holding' ||
                        candidate === 'two-hand-hold' ||
                        candidate === 'applying-opening'
                    );
                }
                // static
                return candidate !== 'applying-opening';
            };

            let effectiveInteraction: ProductStudioState['interaction'] = nextInteraction;
            if (!isAllowedByMotion(nextMotion, effectiveInteraction)) {
                if (nextMotion === 'pouring' || nextMotion === 'falling') effectiveInteraction = 'none';
                else if (nextMotion === 'opened') effectiveInteraction = 'holding';
                else effectiveInteraction = 'none';
            }

            return {
                interaction: effectiveInteraction,
                handsHolding: effectiveInteraction !== 'none',
                stateMotion: nextMotion,
            };
        }),
    setStateMotion: (motion) =>
        set((state) => {
            const nextMotion = motion;

            const coerceInteractionForMotion = (candidate: ProductStudioState['interaction']) => {
                if (nextMotion === 'pouring' || nextMotion === 'falling') {
                    return candidate === 'cropped-hand' ? 'cropped-hand' : 'none';
                }
                if (nextMotion === 'spilled' || nextMotion === 'dispensed') {
                    const allowed: ProductStudioState['interaction'][] = [
                        'none',
                        'cropped-hand',
                        'resting-interaction',
                        'supported-hold',
                    ];
                    return allowed.includes(candidate) ? candidate : 'none';
                }
                if (nextMotion === 'opened') {
                    const allowed: ProductStudioState['interaction'][] = [
                        'none',
                        'cropped-hand',
                        'supported-hold',
                        'holding',
                        'two-hand-hold',
                        'applying-opening',
                    ];
                    return allowed.includes(candidate) ? candidate : 'none';
                }
                // static
                if (candidate === 'applying-opening') return 'none';
                return candidate;
            };

            // Force rules:
            // - Capsule Display => motion must be Static
            // - Applying / Opening => motion must be Opened
            let effectiveMotion = nextMotion;
            const currentInteraction = state.interaction;
            if (currentInteraction === 'capsule-display') effectiveMotion = 'static';
            if (currentInteraction === 'applying-opening') effectiveMotion = 'opened';

            const effectiveInteraction = coerceInteractionForMotion(currentInteraction);

            return {
                stateMotion: effectiveMotion,
                interaction: effectiveInteraction,
                handsHolding: effectiveInteraction !== 'none',
            };
        }),
    setProMode: (enabled) => set({ proMode: enabled }),
    setLens: (lens) => set({ lens }),
    setLightingRig: (rig) => set({ lightingRig: rig }),
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
