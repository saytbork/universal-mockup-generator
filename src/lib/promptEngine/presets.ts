/**
 * DECLARATIVE PRESETS
 * 
 * Presets are deterministic UI state generators.
 * 
 * WHAT PRESETS ARE:
 * - Predefined UI state configurations
 * - Always produce valid input for uiContractBuilder
 * - Never generate prompts directly
 * - Shortcut for users to get valid configurations
 * 
 * WHAT PRESETS ARE NOT:
 * - Not prompt templates
 * - Not creative suggestions
 * - Not bypasses for the deterministic engine
 * - Not customizable beyond their defined parameters
 * 
 * FLOW:
 * Preset → UIState → uiContractBuilder → deterministicPromptBuilder
 */

import type { SceneType } from './sceneTypes';
import type { UIState } from './uiContractBuilder';

// ============================================================================
// PRESET TYPES
// ============================================================================

export interface PresetConfig {
    id: string;
    name: string;
    description: string;
    category: PresetCategory;
    tier: 'basic' | 'pro';
    icon: string;

    // The UI state this preset generates
    uiState: Partial<UIState>;

    // What the user CAN customize
    editableFields: (keyof UIState)[];

    // What is LOCKED and cannot be changed
    lockedFields: (keyof UIState)[];
}

export type PresetCategory =
    | 'ecommerce'      // PDP, ads, catalog
    | 'social'         // Stories, posts, UGC
    | 'editorial'      // Magazine, lookbook
    | 'studio'         // Packshots, hero shots
    | 'bundle';        // Multi-product

export type PresetId =
    | 'hero_packshot'
    | 'pdp_ecommerce'
    | 'lifestyle_hero'
    | 'ugc_testimonial'
    | 'bundle_cross_sell'
    | 'editorial_flat_lay'
    | 'story_ad'
    | 'social_square'
    | 'quick_studio'
    | 'premium_editorial';

// ============================================================================
// PRESET REGISTRY
// ============================================================================

export const PRESETS: Record<PresetId, PresetConfig> = {

    // ────────────────────────────────────────────────────────────────────────
    // STUDIO CATEGORY
    // ────────────────────────────────────────────────────────────────────────

    hero_packshot: {
        id: 'hero_packshot',
        name: 'Hero Packshot',
        description: 'Clean product shot for homepage or main listing',
        category: 'studio',
        tier: 'basic',
        icon: 'box',
        uiState: {
            sceneType: 'studio_packshot',
            physicalScale: 'tabletop',
            lighting: 'soft studio light',
            creativityLevel: 0,
            camera: 'DSLR',
            angle: 'eye level',
            distance: 'medium',
            framing: 'centered',
            aspectRatio: '1:1'
        },
        editableFields: ['productType', 'packaging', 'productColor', 'aspectRatio'],
        lockedFields: ['sceneType', 'creativityLevel', 'handsAllowed']
    },

    quick_studio: {
        id: 'quick_studio',
        name: 'Quick Studio',
        description: 'Fast studio shot with minimal setup',
        category: 'studio',
        tier: 'basic',
        icon: 'bolt',
        uiState: {
            sceneType: 'studio_packshot',
            physicalScale: 'tabletop',
            lighting: 'soft studio light',
            creativityLevel: 0,
            camera: 'DSLR',
            angle: 'slight top-down',
            distance: 'close',
            framing: 'centered',
            aspectRatio: '4:5'
        },
        editableFields: ['productType', 'packaging', 'aspectRatio'],
        lockedFields: ['sceneType', 'creativityLevel', 'handsAllowed']
    },

    // ────────────────────────────────────────────────────────────────────────
    // ECOMMERCE CATEGORY
    // ────────────────────────────────────────────────────────────────────────

    pdp_ecommerce: {
        id: 'pdp_ecommerce',
        name: 'PDP Ecommerce',
        description: 'Product detail page with space for text overlay',
        category: 'ecommerce',
        tier: 'pro',
        icon: 'shopping-cart',
        uiState: {
            sceneType: 'ecommerce_blank_space',
            physicalScale: 'tabletop',
            lighting: 'even lighting',
            creativityLevel: 1,
            camera: 'DSLR',
            angle: 'eye level',
            distance: 'medium',
            framing: 'product with negative space',
            blankSpace: 'left',
            aspectRatio: '1:1'
        },
        editableFields: ['productType', 'packaging', 'blankSpace', 'aspectRatio'],
        lockedFields: ['sceneType', 'creativityLevel', 'handsAllowed']
    },

    // ────────────────────────────────────────────────────────────────────────
    // LIFESTYLE CATEGORY
    // ────────────────────────────────────────────────────────────────────────

    lifestyle_hero: {
        id: 'lifestyle_hero',
        name: 'Lifestyle Hero',
        description: 'Product in natural setting with context',
        category: 'editorial',
        tier: 'basic',
        icon: 'home',
        uiState: {
            sceneType: 'lifestyle_product',
            physicalScale: 'tabletop',
            handsAllowed: false,
            lighting: 'natural window light',
            creativityLevel: 4,
            camera: 'DSLR',
            angle: 'eye level',
            distance: 'medium',
            framing: 'environmental',
            aspectRatio: '4:5'
        },
        editableFields: ['productType', 'packaging', 'environment', 'place', 'handsAllowed', 'props', 'lighting', 'aspectRatio'],
        lockedFields: ['sceneType']
    },

    // ────────────────────────────────────────────────────────────────────────
    // SOCIAL / UGC CATEGORY
    // ────────────────────────────────────────────────────────────────────────

    ugc_testimonial: {
        id: 'ugc_testimonial',
        name: 'UGC Testimonial',
        description: 'Authentic phone-captured user content',
        category: 'social',
        tier: 'pro',
        icon: 'smartphone',
        uiState: {
            sceneType: 'ugc_phone',
            physicalScale: 'handheld',
            handsAllowed: true,
            lighting: 'natural window light',
            creativityLevel: 2,
            camera: 'smartphone',
            angle: 'selfie angle',
            distance: 'close',
            framing: 'off-center',
            aspectRatio: '9:16'
        },
        editableFields: ['productType', 'packaging', 'environment', 'place', 'lighting'],
        lockedFields: ['sceneType', 'camera', 'handsAllowed']
    },

    story_ad: {
        id: 'story_ad',
        name: 'Story Ad',
        description: 'Vertical format for Instagram/TikTok stories',
        category: 'social',
        tier: 'pro',
        icon: 'smartphone-call',
        uiState: {
            sceneType: 'ugc_phone',
            physicalScale: 'handheld',
            handsAllowed: true,
            lighting: 'indoor ambient',
            creativityLevel: 3,
            camera: 'smartphone',
            angle: 'eye level',
            distance: 'medium',
            framing: 'casual',
            aspectRatio: '9:16'
        },
        editableFields: ['productType', 'environment', 'place', 'lighting'],
        lockedFields: ['sceneType', 'camera', 'aspectRatio']
    },

    social_square: {
        id: 'social_square',
        name: 'Social Square',
        description: 'Square format for Instagram feed',
        category: 'social',
        tier: 'basic',
        icon: 'camera',
        uiState: {
            sceneType: 'lifestyle_product',
            physicalScale: 'tabletop',
            handsAllowed: false,
            lighting: 'natural window light',
            creativityLevel: 3,
            camera: 'DSLR',
            angle: 'slight top-down',
            distance: 'medium',
            framing: 'centered',
            aspectRatio: '1:1'
        },
        editableFields: ['productType', 'packaging', 'environment', 'place', 'props', 'lighting'],
        lockedFields: ['sceneType', 'aspectRatio']
    },

    // ────────────────────────────────────────────────────────────────────────
    // EDITORIAL CATEGORY
    // ────────────────────────────────────────────────────────────────────────

    editorial_flat_lay: {
        id: 'editorial_flat_lay',
        name: 'Editorial Flat Lay',
        description: 'Top-down styled composition with props',
        category: 'editorial',
        tier: 'pro',
        icon: 'sparkles',
        uiState: {
            sceneType: 'editorial_product',
            physicalScale: 'tabletop',
            handsAllowed: false,
            arrangement: 'flat lay',
            lighting: 'natural soft light',
            creativityLevel: 6,
            camera: 'medium format',
            angle: 'top-down',
            distance: 'wide',
            framing: 'full scene',
            aspectRatio: '1:1'
        },
        editableFields: ['productType', 'packaging', 'environment', 'place', 'props', 'creativityLevel', 'creativityTheme'],
        lockedFields: ['sceneType', 'angle']
    },

    premium_editorial: {
        id: 'premium_editorial',
        name: 'Premium Editorial',
        description: 'High-end magazine-style product shot',
        category: 'editorial',
        tier: 'pro',
        icon: 'gem',
        uiState: {
            sceneType: 'editorial_product',
            physicalScale: 'tabletop',
            handsAllowed: false,
            arrangement: 'staggered',
            lighting: 'golden hour',
            creativityLevel: 7,
            creativityTheme: 'luxury',
            camera: 'medium format',
            angle: 'slight top-down',
            distance: 'medium-close',
            framing: 'rule of thirds',
            aspectRatio: '4:5'
        },
        editableFields: ['productType', 'packaging', 'environment', 'place', 'props', 'creativityLevel', 'creativityTheme', 'lighting'],
        lockedFields: ['sceneType']
    },

    // ────────────────────────────────────────────────────────────────────────
    // BUNDLE CATEGORY
    // ────────────────────────────────────────────────────────────────────────

    bundle_cross_sell: {
        id: 'bundle_cross_sell',
        name: 'Bundle Cross-Sell',
        description: 'Multiple products grouped for upsell',
        category: 'bundle',
        tier: 'pro',
        icon: 'boxes',
        uiState: {
            sceneType: 'bundle_kit',
            physicalScale: 'tabletop',
            handsAllowed: false,
            quantity: 3,
            arrangement: 'grouped',
            lighting: 'natural soft light',
            creativityLevel: 3,
            camera: 'DSLR',
            angle: 'slight top-down',
            distance: 'wide',
            framing: 'full kit visible',
            aspectRatio: '16:9'
        },
        editableFields: ['productType', 'packaging', 'quantity', 'arrangement', 'environment', 'place', 'lighting', 'aspectRatio'],
        lockedFields: ['sceneType', 'handsAllowed']
    }
};

// ============================================================================
// PRESET HELPERS
// ============================================================================

export function getPreset(id: PresetId): PresetConfig {
    return PRESETS[id];
}

export function getPresetUIState(id: PresetId): Partial<UIState> {
    return PRESETS[id].uiState;
}

export function getPresetsByCategory(category: PresetCategory): PresetConfig[] {
    return Object.values(PRESETS).filter(p => p.category === category);
}

export function getPresetsByTier(tier: 'basic' | 'pro'): PresetConfig[] {
    return Object.values(PRESETS).filter(p =>
        tier === 'pro' || p.tier === 'basic'
    );
}

export function getAllPresets(): PresetConfig[] {
    return Object.values(PRESETS);
}

export function isFieldEditable(presetId: PresetId, field: keyof UIState): boolean {
    return PRESETS[presetId].editableFields.includes(field);
}

export function isFieldLocked(presetId: PresetId, field: keyof UIState): boolean {
    return PRESETS[presetId].lockedFields.includes(field);
}

/**
 * Apply user customizations to a preset
 * Only editable fields are applied, locked fields are ignored
 */
export function applyCustomizationsToPreset(
    presetId: PresetId,
    customizations: Partial<UIState>
): UIState {
    const preset = PRESETS[presetId];
    const base = { ...preset.uiState } as UIState;

    for (const [key, value] of Object.entries(customizations)) {
        if (preset.editableFields.includes(key as keyof UIState)) {
            (base as any)[key] = value;
        }
        // Silently ignore locked fields
    }

    return base;
}

// ============================================================================
// PRESET CATEGORIES FOR UI
// ============================================================================

export const PRESET_CATEGORIES: { id: PresetCategory; label: string; icon: string }[] = [
    { id: 'studio', label: 'Studio', icon: 'box' },
    { id: 'ecommerce', label: 'Ecommerce', icon: 'shopping-cart' },
    { id: 'social', label: 'Social', icon: 'smartphone' },
    { id: 'editorial', label: 'Editorial', icon: 'sparkles' },
    { id: 'bundle', label: 'Bundle', icon: 'boxes' }
];
