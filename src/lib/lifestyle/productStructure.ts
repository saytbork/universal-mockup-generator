/**
 * PRODUCT STRUCTURE
 * 
 * Defines how products are grouped and visually prioritized.
 * This is a structural block, not decorative.
 * 
 * ORDER IN UI:
 * After: Lifestyle Intent
 * Before: Creator / Person
 */

// ============================================================================
// TYPES
// ============================================================================

export type ProductStructure =
    | 'single'    // One product, hero focus
    | 'bundle'    // 2-3 products, one primary
    | 'routine';  // Multi-product step sequence

// ============================================================================
// CONFIGURATION
// ============================================================================

export interface ProductStructureConfig {
    id: ProductStructure;
    title: string;
    description: string;
    productCount: { min: number; max: number };
    hasHero: boolean;
    tooltip: string;
}

export const PRODUCT_STRUCTURES: Record<ProductStructure, ProductStructureConfig> = {
    single: {
        id: 'single',
        title: 'Single Product',
        description: 'One product. Clean hero focus.',
        productCount: { min: 1, max: 1 },
        hasHero: true,
        tooltip: 'One product as the sole focus. Maximum visual clarity.'
    },
    bundle: {
        id: 'bundle',
        title: 'Bundle (2–3 products)',
        description: 'One primary product, others supporting.',
        productCount: { min: 2, max: 3 },
        hasHero: true,
        tooltip: 'Primary product with 1-2 supporting items. Clear hierarchy maintained.'
    },
    routine: {
        id: 'routine',
        title: 'Routine (Multi-product)',
        description: 'Step-based product set arranged together.',
        productCount: { min: 2, max: 5 },
        hasHero: false,
        tooltip: 'Products shown as a sequence or routine. No single hero.'
    }
};

export const PRODUCT_STRUCTURE_BLOCK_TOOLTIP =
    'Product Structure defines how items are grouped and visually prioritized.';

// ============================================================================
// UI HELPERS
// ============================================================================

export function getProductStructureOptions(): ProductStructureConfig[] {
    return Object.values(PRODUCT_STRUCTURES);
}

export function getProductStructure(id: ProductStructure): ProductStructureConfig {
    return PRODUCT_STRUCTURES[id];
}
