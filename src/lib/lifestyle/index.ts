/**
 * LIFESTYLE MODULE — PUBLIC API
 */

// Lifestyle Intent
export type {
    LifestyleIntent,
    IntentTooltip,
    PersonRules,
    ProductInteraction,
    InteractionRules,
    CameraType,
    FramingStyle,
    CameraRules,
    DepthMode,
    DepthRules,
    IntentValidationResult
} from './lifestyleIntent';

export {
    LIFESTYLE_INTENT_TOOLTIPS,
    INTENT_PERSON_RULES,
    INTENT_INTERACTION_RULES,
    INTENT_CAMERA_RULES,
    INTENT_DEPTH_RULES,
    validateLifestyleIntent,
    getIntentOptions,
    isInteractionAllowed,
    isCameraAllowed
} from './lifestyleIntent';

// Product Structure
export type { ProductStructure, ProductStructureConfig } from './productStructure';
export {
    PRODUCT_STRUCTURES,
    PRODUCT_STRUCTURE_BLOCK_TOOLTIP,
    getProductStructureOptions,
    getProductStructure
} from './productStructure';

// Raw Domestic UGC
export type { RawUGCStyle, RawUGCConfig, UGCDepthRules } from './rawDomesticUGC';
export {
    RAW_UGC_STYLES,
    UGC_DEPTH_RULES,
    UGC_LOCKED_CONTROLS,
    UGC_LOCKED_TOOLTIP,
    RAW_UGC_INTRO_TEXT,
    getRawUGCStyles,
    activateRawUGCMode,
    injectUGCDepthRules
} from './rawDomesticUGC';

// Prompt Injection
export type { LifestyleInjection } from './injection';
export { injectLifestyleIntent, injectRawDomesticUGC } from './injection';

// Enforcement (camera, depth, hands)
export type { CameraType as EnforcedCameraType, DepthStyle, SceneType as EnforcedSceneType } from './enforcement';
export {
    enforceCamera,
    enforceDepth,
    UGC_FORBIDDEN_KEYWORDS,
    stripForbiddenFromPrompt,
    getMaxHands,
    getHandsConstraint
} from './enforcement';

