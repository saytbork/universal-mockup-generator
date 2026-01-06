/**
 * CREATIVITY v2 — ART DIRECTION ENGINE
 * 
 * CreativeMode is a FIRST-CLASS CONTROLLER that governs:
 * - Composition (product position, camera bias, layering, negative space)
 * - Enrichment (textures, surfaces, materials, elements)
 * - Visual Energy (chromatic intensity, contrast, density, tone)
 * - Brand Language (implicit visual signals)
 * 
 * HIERARCHY:
 * 1. SceneType (what is allowed)
 * 2. CreativeMode (how it looks, feels, communicates)
 * 3. Product / Environment / Bundle (content)
 * 
 * Premium Studio v1 remains LOCKED. This layer injects art direction
 * WITHOUT breaking determinism.
 */

import type { SceneType } from './schema';

// ============================================================================
// CREATIVE MODES
// ============================================================================

export type CreativeMode =
    | 'high_end_studio'
    | 'vibrant_brand_explosion'
    | 'minimal_editorial'
    | 'natural_organic'
    | 'scientific_clean'
    | 'lifestyle_cinematic'
    | 'playful_bold';

// ============================================================================
// COMPOSITION RULES
// ============================================================================

export type ProductPosition =
    | 'centered'
    | 'offset_left'
    | 'offset_right'
    | 'rule_of_thirds'
    | 'diagonal'
    | 'bottom_weighted';

export type CameraBias =
    | 'perfect_symmetry'
    | 'subtle_asymmetry'
    | 'dynamic_imbalance'
    | 'editorial_tension';

export type LayeringStrategy =
    | 'single_plane'
    | 'foreground_emphasis'
    | 'depth_layers'
    | 'atmospheric_depth';

export type NegativeSpace =
    | 'minimal'
    | 'balanced'
    | 'generous'
    | 'dramatic';

export interface CompositionRules {
    productPosition: ProductPosition;
    cameraBias: CameraBias;
    layering: LayeringStrategy;
    negativeSpace: NegativeSpace;
    hierarchyOrder: string[]; // What draws eye: first, second, third
}

// ============================================================================
// ENRICHMENT ELEMENTS
// ============================================================================

export type EnrichmentType =
    | 'texture_surface'
    | 'material_contrast'
    | 'natural_element'
    | 'abstract_graphic'
    | 'color_plane'
    | 'light_artifact'
    | 'shadow_play';

export interface EnrichmentElement {
    type: EnrichmentType;
    purpose: 'contrast' | 'depth' | 'rhythm' | 'framing' | 'brand_signal';
    intensity: 'subtle' | 'present' | 'prominent';
}

export interface EnrichmentRules {
    allowed: EnrichmentElement[];
    forbidden: string[];
    maxElements: number;
    intentionRequired: boolean;
}

// ============================================================================
// VISUAL ENERGY
// ============================================================================

export type ChromaticIntensity =
    | 'muted'
    | 'natural'
    | 'saturated'
    | 'vibrant'
    | 'explosive';

export type ContrastLevel =
    | 'soft'
    | 'balanced'
    | 'defined'
    | 'dramatic';

export type VisualDensity =
    | 'minimal'
    | 'clean'
    | 'balanced'
    | 'rich'
    | 'layered';

export type EmotionalTone =
    | 'calm'
    | 'refined'
    | 'confident'
    | 'bold'
    | 'playful'
    | 'scientific'
    | 'premium'
    | 'aspirational';

export interface VisualEnergy {
    chromatic: ChromaticIntensity;
    contrast: ContrastLevel;
    density: VisualDensity;
    tone: EmotionalTone;
}

// ============================================================================
// BRAND LANGUAGE
// ============================================================================

export type BrandSignal =
    | 'luxury'
    | 'clean'
    | 'natural'
    | 'scientific'
    | 'vibrant'
    | 'editorial'
    | 'bold'
    | 'playful'
    | 'premium'
    | 'approachable';

export interface BrandLanguage {
    primarySignal: BrandSignal;
    secondarySignals: BrandSignal[];
    avoidSignals: BrandSignal[];
}

// ============================================================================
// COMPLETE CREATIVE MODE CONFIG
// ============================================================================

export interface CreativeModeConfig {
    id: CreativeMode;
    name: string;
    description: string;
    composition: CompositionRules;
    enrichment: EnrichmentRules;
    energy: VisualEnergy;
    brand: BrandLanguage;
    compatibleSceneTypes: SceneType[];
    useCase: string[];
}

// ============================================================================
// SCENE TYPE COMPATIBILITY
// ============================================================================

export const SCENE_CREATIVE_COMPATIBILITY: Record<SceneType, CreativeMode[]> = {
    studio_branding: [
        'high_end_studio',
        'minimal_editorial',
        'vibrant_brand_explosion',
        'scientific_clean'
    ],
    editorial_product: [
        'minimal_editorial',
        'high_end_studio',
        'natural_organic'
    ],
    lifestyle_real: [
        'lifestyle_cinematic',
        'natural_organic'
    ],
    ugc_phone: [], // Creativity LIMITED for UGC
    bundle_hero: [
        'high_end_studio',
        'vibrant_brand_explosion'
    ]
};

export function isCreativeModeCompatible(
    sceneType: SceneType,
    creativeMode: CreativeMode
): boolean {
    const allowed = SCENE_CREATIVE_COMPATIBILITY[sceneType];
    return allowed.includes(creativeMode);
}

export function getCompatibleModes(sceneType: SceneType): CreativeMode[] {
    return SCENE_CREATIVE_COMPATIBILITY[sceneType];
}

export function getDefaultCreativeMode(sceneType: SceneType): CreativeMode | null {
    const compatible = SCENE_CREATIVE_COMPATIBILITY[sceneType];
    if (compatible.length === 0) return null; // UGC has no creativity
    return compatible[0];
}
