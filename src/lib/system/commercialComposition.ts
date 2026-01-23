/**
 * COMMERCIAL COMPOSITION
 * 
 * Renamed from "Product Structure" to emphasize commercial intent.
 * This is NOT about quantity. It's about composition strategy.
 */

// ============================================================================
// TYPES
// ============================================================================

export type CommercialComposition =
    | 'hero_product'    // Single product, optimized for PDP
    | 'duo_offer'       // Bundle, designed for cross-sells
    | 'routine_system'; // Multi-step with hierarchy

// ============================================================================
// CONFIGURATION
// ============================================================================

export interface CompositionConfig {
    id: CommercialComposition;
    title: string;
    description: string;
    productCount: { min: number; max: number };
    hasHierarchy: boolean;
    tooltip: string;
}

export const COMMERCIAL_COMPOSITIONS: Record<CommercialComposition, CompositionConfig> = {
    hero_product: {
        id: 'hero_product',
        title: 'Hero Product',
        description: 'Single product. Maximum visual impact.',
        productCount: { min: 1, max: 1 },
        hasHierarchy: false,
        tooltip: 'Optimized for PDP hero images and ads.'
    },
    duo_offer: {
        id: 'duo_offer',
        title: 'Duo Offer',
        description: 'Two products. One leads, one supports.',
        productCount: { min: 2, max: 2 },
        hasHierarchy: true,
        tooltip: 'Designed for bundles and cross-sells.'
    },
    routine_system: {
        id: 'routine_system',
        title: 'Routine System',
        description: 'Multi-step with enforced visual hierarchy.',
        productCount: { min: 2, max: 5 },
        hasHierarchy: true,
        tooltip: 'Multi-step systems with enforced visual hierarchy.'
    }
};

export const COMPOSITION_BLOCK_TOOLTIP =
    'Commercial composition defines strategic grouping, not just product count.';

// ============================================================================
// UI HELPERS
// ============================================================================

export function getCompositionOptions(): CompositionConfig[] {
    return Object.values(COMMERCIAL_COMPOSITIONS);
}

export function getComposition(id: CommercialComposition): CompositionConfig {
    return COMMERCIAL_COMPOSITIONS[id];
}
