/**
 * SYSTEM MODULE — PUBLIC API
 * 
 * Central authority for Perfect Mockup.
 */

// System Rules
export type { CreativeAuthority, BlockVisibility } from './rules';
export {
    SCENE_CREATIVE_AUTHORITY,
    LIFESTYLE_CREATIVITY_MATRIX,
    getCreativityForLifestyleIntent,
    PRODUCT_STUDIO_DEFAULTS,
    UGC_SYSTEM_RULES,
    UGC_VALIDATION_RULE,
    PRODUCT_STUDIO_BLOCK_ORDER,
    LIFESTYLE_BLOCK_ORDER,
    CORRECTIVE_TOOLTIPS,
    getCreativityVisibility,
    QUALITY_TEST
} from './rules';

// Commercial Composition
export type { CommercialComposition, CompositionConfig } from './commercialComposition';
export {
    COMMERCIAL_COMPOSITIONS,
    COMPOSITION_BLOCK_TOOLTIP,
    getCompositionOptions,
    getComposition
} from './commercialComposition';

// Hand Rules (Final)
export type { HandPermission, HandRules } from './handRules';
export {
    SCENE_HAND_RULES,
    INTENT_HAND_RULES,
    getHandRules,
    areHandsAllowed,
    HANDS_CORRECTIVE_TOOLTIP
} from './handRules';
