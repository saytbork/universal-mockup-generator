/**
 * PRODUCT STUDIO MODULE — PUBLIC API
 */

// State
export type { ProductStudioState } from './state';
export {
    DEFAULT_PRODUCT_STUDIO_STATE,
    PRODUCT_STUDIO_ENVIRONMENTS,
    PRODUCT_STUDIO_UI_BLOCKS
} from './state';

// Mapper
export type { ProductStudioPromptResult } from './mapper';
export { mapProductStudioToPrompt } from './mapper';
