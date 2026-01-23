/**
 * UX MODULE — PUBLIC API
 */

export type { UIContext, BlockId, BlockConfig } from './config';
export {
    PRODUCT_STUDIO_BLOCKS,
    PRODUCT_STUDIO_HIDDEN,
    LIFESTYLE_BLOCKS,
    RAW_UGC_BLOCKS,
    RAW_UGC_LOCKED,
    MANDATORY_COPY,
    ALL_TOOLTIPS,
    getBlocksForContext,
    isBlockVisible,
    isBlockLocked,
    getTooltip
} from './config';

// Polish & Final Copy
export {
    CREATIVITY_UX,
    COMPOSITION_UX,
    LIFESTYLE_INTENT_UX,
    RAW_UGC_UX,
    DISABLED_COPY,
    HANDS_UX,
    PRODUCT_STUDIO_UX,
    TOOLTIP_RULES,
    QUALITY_TEST
} from './polish';
