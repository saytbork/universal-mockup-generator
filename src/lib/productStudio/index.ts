/**
 * PRODUCT STUDIO MODULE
 * Public API v2
 */

// Types
export type {
    ProductAsset,
    ProductType,
    ProductColor,
    CapsulesPhysical,
    GummiesPhysical,
    DropsPhysical,
    PowderPhysical,
    SkincarePhysical,
    DevicePhysical,
    CustomPhysical,
    PhysicalDefinition,
    ProductDefinition,
    // 1️⃣ MODE
    ProductMode,
    ModeLocks,
    // 3️⃣ BRAND & PALETTE
    PaletteSourceType,
    BrandPalette,
    // Scene
    SceneType,
    EcommerceSlot,
    EcommercePdpLayout,
    EcommercePdpImageSide,
    EcommercePdpSafeZone,
    EcommercePdpConfig,
    EnvironmentMacro,
    MicroPlace,
    Lighting,
    CameraSystem,
    CameraAngle,
    CameraDistance,
    CameraRotation,
    CameraFraming,
    CreativeTheme,
    PaletteSource,
    PropDensity,
    BlankSpaceSide,
    AspectRatio,
    BundleModeV2,
    BundleLayout,
    BundleSpacing,
    BundleDefinition,
    PrebuiltBundle,
    PresetTier,
    ProductStudioState,
    ProductGenerationJob,
    GeneratedProductImage,
} from './types';

// MODE Lock Rules (Canonical)
export { MODE_LOCK_RULES } from './types';

// Store
export {
    useProductStudioStore,
    DEFAULT_PRODUCT_STUDIO_STATE,
    getDefaultPhysical,
    getDefaultMicroPlace,
    enforceValidLighting,
    enforceValidEnvironment,
    PREBUILT_BUNDLES,
    getRecommendedBundle,
    canUseBundle,
} from './store';

// Builders
export {
    validatePrompt,
    validateBundleState,
    generateProductJobs,
    generatePreviewPrompt,
} from './builders';

// Export
export type {
    ExportFormat,
    ExportOptions,
    OverlayConfig,
} from './export';

export {
    exportProductImage,
    exportImageOnly,
    exportWithOverlays,
} from './export';
