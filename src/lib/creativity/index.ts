/**
 * CREATIVITY v2 — PUBLIC API
 */

// Schema & Types
export type {
    CreativeMode,
    CompositionRules,
    EnrichmentRules,
    VisualEnergy,
    BrandLanguage,
    CreativeModeConfig,
    ProductPosition,
    CameraBias,
    LayeringStrategy,
    NegativeSpace,
    EnrichmentType,
    EnrichmentElement,
    ChromaticIntensity,
    ContrastLevel,
    VisualDensity,
    EmotionalTone,
    BrandSignal
} from './schema';

export {
    SCENE_CREATIVE_COMPATIBILITY,
    isCreativeModeCompatible,
    getCompatibleModes,
    getDefaultCreativeMode
} from './schema';

// Mode Definitions
export {
    HIGH_END_STUDIO,
    VIBRANT_BRAND_EXPLOSION,
    MINIMAL_EDITORIAL,
    NATURAL_ORGANIC,
    SCIENTIFIC_CLEAN,
    LIFESTYLE_CINEMATIC,
    PLAYFUL_BOLD,
    CREATIVE_MODES,
    getCreativeMode,
    getAllCreativeModes
} from './modes';

// Prompt Injection
export type { CreativityInjection } from './injection';
export { injectCreativity, injectUGCCreativity } from './injection';

// Validation
export type { CreativityValidationResult, CreativeModeOption } from './validation';
export {
    validateCreativity,
    shouldApplyCreativity,
    getCreativeModeOptions
} from './validation';

// Hand & Human Rules
export type {
    HandPolicy,
    HumanPolicy,
    HumanPresenceRules,
    CreativeModeHandOverride
} from './handRules';
export {
    SCENE_HUMAN_RULES,
    CREATIVE_MODE_HAND_RULES,
    buildHandDirective,
    canHaveHands,
    getHandPolicy
} from './handRules';

// Tooltips
export type { Tooltip } from './tooltips';
export {
    SCENE_TYPE_TOOLTIPS,
    CREATIVE_MODE_TOOLTIPS,
    ENVIRONMENT_TOOLTIPS,
    SCALE_TOOLTIPS,
    LIGHTING_TOOLTIPS,
    DISABLED_REASONS,
    getTooltip,
    getDisabledTooltip
} from './tooltips';

// POV Experience (Lifestyle Variant)
export type {
    LifestyleVariant,
    POVRules,
    POVValidationResult,
    POVInjection
} from './povExperience';
export {
    POV_EXPERIENCE_RULES,
    POV_ALLOWED_SCENE_TYPES,
    POV_BLOCKED_SCENE_TYPES,
    POV_ALLOWED_CREATIVE_MODES,
    POV_BLOCKED_CREATIVE_MODES,
    isPOVAllowedForSceneType,
    isPOVAllowedForCreativeMode,
    validatePOVExperience,
    injectPOVExperience,
    POV_TOOLTIP,
    getPOVDisabledReason
} from './povExperience';

