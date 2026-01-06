/**
 * CREATIVE MODE DEFINITIONS
 * 
 * Each mode is a complete art direction preset with:
 * - Composition rules
 * - Enrichment elements
 * - Visual energy
 * - Brand language
 * 
 * These are opinionated, senior-level presets.
 * NO sliders. NO free text. NO ambiguity.
 */

import type { CreativeModeConfig, CreativeMode } from './schema';

// ============================================================================
// HIGH END STUDIO
// ============================================================================

export const HIGH_END_STUDIO: CreativeModeConfig = {
    id: 'high_end_studio',
    name: 'High-End Studio',
    description: 'Luxury studio photography with intentional asymmetry and premium surfaces',

    composition: {
        productPosition: 'offset_right',
        cameraBias: 'subtle_asymmetry',
        layering: 'depth_layers',
        negativeSpace: 'generous',
        hierarchyOrder: ['product', 'surface_texture', 'light_gradient']
    },

    enrichment: {
        allowed: [
            { type: 'texture_surface', purpose: 'depth', intensity: 'subtle' },
            { type: 'material_contrast', purpose: 'contrast', intensity: 'present' },
            { type: 'shadow_play', purpose: 'depth', intensity: 'subtle' },
            { type: 'light_artifact', purpose: 'brand_signal', intensity: 'subtle' }
        ],
        forbidden: ['clutter', 'random props', 'lifestyle noise', 'text', 'graphics'],
        maxElements: 3,
        intentionRequired: true
    },

    energy: {
        chromatic: 'natural',
        contrast: 'defined',
        density: 'clean',
        tone: 'premium'
    },

    brand: {
        primarySignal: 'luxury',
        secondarySignals: ['premium', 'clean'],
        avoidSignals: ['playful', 'approachable']
    },

    compatibleSceneTypes: ['studio_branding', 'editorial_product', 'bundle_hero'],
    useCase: ['hero images', 'luxury PDP', 'brand campaigns', 'homepage hero']
};

// ============================================================================
// VIBRANT BRAND EXPLOSION
// ============================================================================

export const VIBRANT_BRAND_EXPLOSION: CreativeModeConfig = {
    id: 'vibrant_brand_explosion',
    name: 'Vibrant Brand Explosion',
    description: 'Bold, joyful energy with dynamic composition and high chroma. OLLY-level vibrancy.',

    composition: {
        productPosition: 'diagonal',
        cameraBias: 'dynamic_imbalance',
        layering: 'foreground_emphasis',
        negativeSpace: 'minimal',
        hierarchyOrder: ['product', 'color_energy', 'graphic_elements']
    },

    enrichment: {
        allowed: [
            { type: 'color_plane', purpose: 'brand_signal', intensity: 'prominent' },
            { type: 'abstract_graphic', purpose: 'rhythm', intensity: 'present' },
            { type: 'light_artifact', purpose: 'contrast', intensity: 'prominent' }
        ],
        forbidden: ['muted colors', 'corporate neutrals', 'clutter', 'lifestyle noise'],
        maxElements: 4,
        intentionRequired: true
    },

    energy: {
        chromatic: 'explosive',
        contrast: 'dramatic',
        density: 'rich',
        tone: 'playful'
    },

    brand: {
        primarySignal: 'vibrant',
        secondarySignals: ['bold', 'playful'],
        avoidSignals: ['scientific', 'luxury']
    },

    compatibleSceneTypes: ['studio_branding', 'bundle_hero'],
    useCase: ['social ads', 'brand explosion', 'hero sections', 'email banners']
};

// ============================================================================
// MINIMAL EDITORIAL
// ============================================================================

export const MINIMAL_EDITORIAL: CreativeModeConfig = {
    id: 'minimal_editorial',
    name: 'Minimal Editorial',
    description: 'Refined editorial framing with strong negative space and tonal contrast',

    composition: {
        productPosition: 'rule_of_thirds',
        cameraBias: 'editorial_tension',
        layering: 'single_plane',
        negativeSpace: 'dramatic',
        hierarchyOrder: ['negative_space', 'product', 'surface']
    },

    enrichment: {
        allowed: [
            { type: 'texture_surface', purpose: 'contrast', intensity: 'subtle' },
            { type: 'shadow_play', purpose: 'depth', intensity: 'present' }
        ],
        forbidden: ['color splashes', 'graphics', 'multiple props', 'clutter'],
        maxElements: 2,
        intentionRequired: true
    },

    energy: {
        chromatic: 'muted',
        contrast: 'balanced',
        density: 'minimal',
        tone: 'refined'
    },

    brand: {
        primarySignal: 'editorial',
        secondarySignals: ['clean', 'premium'],
        avoidSignals: ['vibrant', 'playful']
    },

    compatibleSceneTypes: ['studio_branding', 'editorial_product'],
    useCase: ['skincare hero', 'premium supplements', 'magazine layouts', 'lookbooks']
};

// ============================================================================
// NATURAL ORGANIC
// ============================================================================

export const NATURAL_ORGANIC: CreativeModeConfig = {
    id: 'natural_organic',
    name: 'Natural Organic',
    description: 'Earthy, authentic aesthetic with natural elements and warm materiality',

    composition: {
        productPosition: 'centered',
        cameraBias: 'subtle_asymmetry',
        layering: 'depth_layers',
        negativeSpace: 'balanced',
        hierarchyOrder: ['product', 'natural_elements', 'surface']
    },

    enrichment: {
        allowed: [
            { type: 'natural_element', purpose: 'brand_signal', intensity: 'present' },
            { type: 'texture_surface', purpose: 'depth', intensity: 'present' },
            { type: 'material_contrast', purpose: 'contrast', intensity: 'subtle' }
        ],
        forbidden: ['plastic', 'artificial colors', 'corporate elements', 'tech'],
        maxElements: 3,
        intentionRequired: true
    },

    energy: {
        chromatic: 'natural',
        contrast: 'soft',
        density: 'balanced',
        tone: 'calm'
    },

    brand: {
        primarySignal: 'natural',
        secondarySignals: ['clean', 'approachable'],
        avoidSignals: ['scientific', 'bold']
    },

    compatibleSceneTypes: ['editorial_product', 'lifestyle_real'],
    useCase: ['organic products', 'wellness', 'sustainable brands', 'ingredient stories']
};

// ============================================================================
// SCIENTIFIC CLEAN
// ============================================================================

export const SCIENTIFIC_CLEAN: CreativeModeConfig = {
    id: 'scientific_clean',
    name: 'Scientific Clean',
    description: 'Clinical precision with technical credibility and controlled sterility',

    composition: {
        productPosition: 'centered',
        cameraBias: 'perfect_symmetry',
        layering: 'single_plane',
        negativeSpace: 'generous',
        hierarchyOrder: ['product', 'precision', 'white_space']
    },

    enrichment: {
        allowed: [
            { type: 'light_artifact', purpose: 'depth', intensity: 'subtle' },
            { type: 'texture_surface', purpose: 'contrast', intensity: 'subtle' }
        ],
        forbidden: ['organic elements', 'warm tones', 'lifestyle', 'clutter'],
        maxElements: 2,
        intentionRequired: true
    },

    energy: {
        chromatic: 'muted',
        contrast: 'defined',
        density: 'minimal',
        tone: 'scientific'
    },

    brand: {
        primarySignal: 'scientific',
        secondarySignals: ['clean', 'premium'],
        avoidSignals: ['playful', 'natural']
    },

    compatibleSceneTypes: ['studio_branding'],
    useCase: ['clinical products', 'pharma', 'tech supplements', 'medical devices']
};

// ============================================================================
// LIFESTYLE CINEMATIC
// ============================================================================

export const LIFESTYLE_CINEMATIC: CreativeModeConfig = {
    id: 'lifestyle_cinematic',
    name: 'Lifestyle Cinematic',
    description: 'Aspirational storytelling with cinematic depth and atmospheric environments',

    composition: {
        productPosition: 'rule_of_thirds',
        cameraBias: 'dynamic_imbalance',
        layering: 'atmospheric_depth',
        negativeSpace: 'balanced',
        hierarchyOrder: ['story_moment', 'product', 'environment']
    },

    enrichment: {
        allowed: [
            { type: 'light_artifact', purpose: 'framing', intensity: 'present' },
            { type: 'texture_surface', purpose: 'depth', intensity: 'subtle' },
            { type: 'shadow_play', purpose: 'depth', intensity: 'present' }
        ],
        forbidden: ['studio look', 'flat lighting', 'artificial', 'posed'],
        maxElements: 3,
        intentionRequired: true
    },

    energy: {
        chromatic: 'natural',
        contrast: 'balanced',
        density: 'layered',
        tone: 'aspirational'
    },

    brand: {
        primarySignal: 'premium',
        secondarySignals: ['natural', 'approachable'],
        avoidSignals: ['clinical', 'scientific']
    },

    compatibleSceneTypes: ['lifestyle_real'],
    useCase: ['homepage storytelling', 'about pages', 'lifestyle campaigns', 'brand films']
};

// ============================================================================
// PLAYFUL BOLD
// ============================================================================

export const PLAYFUL_BOLD: CreativeModeConfig = {
    id: 'playful_bold',
    name: 'Playful Bold',
    description: 'Energetic, approachable aesthetic with confident colors and dynamic framing',

    composition: {
        productPosition: 'diagonal',
        cameraBias: 'dynamic_imbalance',
        layering: 'foreground_emphasis',
        negativeSpace: 'minimal',
        hierarchyOrder: ['product', 'color_energy', 'movement']
    },

    enrichment: {
        allowed: [
            { type: 'color_plane', purpose: 'brand_signal', intensity: 'prominent' },
            { type: 'abstract_graphic', purpose: 'rhythm', intensity: 'present' },
            { type: 'light_artifact', purpose: 'contrast', intensity: 'present' }
        ],
        forbidden: ['muted tones', 'corporate', 'clinical', 'flat'],
        maxElements: 4,
        intentionRequired: true
    },

    energy: {
        chromatic: 'vibrant',
        contrast: 'defined',
        density: 'balanced',
        tone: 'bold'
    },

    brand: {
        primarySignal: 'bold',
        secondarySignals: ['playful', 'approachable'],
        avoidSignals: ['luxury', 'scientific']
    },

    compatibleSceneTypes: ['studio_branding', 'bundle_hero'],
    useCase: ['youth brands', 'active lifestyle', 'social content', 'email']
};

// ============================================================================
// MODE REGISTRY
// ============================================================================

export const CREATIVE_MODES: Record<CreativeMode, CreativeModeConfig> = {
    high_end_studio: HIGH_END_STUDIO,
    vibrant_brand_explosion: VIBRANT_BRAND_EXPLOSION,
    minimal_editorial: MINIMAL_EDITORIAL,
    natural_organic: NATURAL_ORGANIC,
    scientific_clean: SCIENTIFIC_CLEAN,
    lifestyle_cinematic: LIFESTYLE_CINEMATIC,
    playful_bold: PLAYFUL_BOLD
};

export function getCreativeMode(mode: CreativeMode): CreativeModeConfig {
    return CREATIVE_MODES[mode];
}

export function getAllCreativeModes(): CreativeModeConfig[] {
    return Object.values(CREATIVE_MODES);
}
