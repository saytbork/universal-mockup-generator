/**
 * Deterministic Prompt Architecture - Type Definitions
 * 
 * INPUT CONTRACT: The system receives a structured object with these keys.
 * sceneType is the ROOT CONTROLLER - if missing, generation is blocked.
 */

// =============================================================================
// SCENE TYPES (ROOT CONTROLLER)
// =============================================================================

export type SceneType =
    | 'studio_packshot'
    | 'editorial_product'
    | 'lifestyle_product'
    | 'ugc_phone'
    | 'ecommerce_blank_space'
    | 'bundle_kit';

// =============================================================================
// PRODUCT SETUP
// =============================================================================

export interface ProductSetup {
    productType: string;
    packaging?: string;
    physicalScale?: string;
    productContentColor?: string;
    handsAllowed?: boolean;
}

// =============================================================================
// COMPOSITION RULES (PHYSICAL LOGIC)
// =============================================================================

export interface CompositionRules {
    quantity: number;
    arrangement: string;
    interactionType: 'none' | 'passive-presence' | 'cropped-hand' | 'supported-hold' | 'holding' | 'two-hand-hold' | 'presenting' | 'framed-presentation' | 'applying-opening' | 'capsule-display' | 'resting-interaction';
    interactionObjects: string[];
}

// =============================================================================
// ENVIRONMENT (CONDITIONAL)
// =============================================================================

export interface EnvironmentConfig {
    macroEnvironment?: string;
    microPlace?: string;
}

// =============================================================================
// LIGHTING
// =============================================================================

export interface LightingConfig {
    lightingStyle: string;
}

// =============================================================================
// CREATIVITY (STYLE MODULATOR)
// =============================================================================

export interface CreativityConfig {
    level: number;
    theme?: string;
    paletteSource?: string;
    propDensity?: string;
}

// =============================================================================
// CAMERA & FRAMING
// =============================================================================

export interface CameraConfig {
    cameraSystem: string;
    angle: string;
    distance: string;
    rotation?: string;
    framing?: string;
}

// =============================================================================
// ECOMMERCE MODE (OVERRIDE)
// =============================================================================

export interface EcommerceConfig {
    enabled: boolean;
    blankSpacePosition?: 'left' | 'right' | 'top' | 'bottom';
    overlaySafeArea?: boolean;
}

// =============================================================================
// OUTPUT FORMAT
// =============================================================================

export interface OutputFormatConfig {
    aspectRatio?: string;
    resolution?: string;
}

// =============================================================================
// MASTER INPUT CONTRACT
// =============================================================================

export interface DeterministicPromptInput {
    sceneType: SceneType;
    productSetup: ProductSetup;
    compositionRules: CompositionRules;
    placement?: import('../productStudio/types').ProductPlacement;
    environment: EnvironmentConfig;
    lighting: LightingConfig;
    creativity: CreativityConfig;
    camera: CameraConfig;
    ecommerce: EcommerceConfig;
    outputFormat: OutputFormatConfig;
}

// =============================================================================
// OUTPUT CONTRACT
// =============================================================================

export interface DeterministicPromptResult {
    prompt: string;
    negativePrompt: string;
    validationStatus: 'pass' | 'fail';
    validationErrors?: string[];
    validationWarnings?: string[];
}
