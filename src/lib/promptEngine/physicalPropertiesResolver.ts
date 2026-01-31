/**
 * Physical Properties Resolver Module
 * 
 * PHYSICAL NATURE - Layer 4 of Pipeline
 * 
 * This module defines the physical attributes of the product,
 * such as material finish, visual scale, and material detail refinements.
 * 
 * Pipeline Order:
 * 1. Quality Enforcer (foundation)
 * 2. Photo Mode Resolver (scene authority)
 * 3. Product Type (physical nature)
 * 4. Physical Properties (material & scale) ← THIS MODULE
 * 5. State/Interaction
 * 6. Camera
 */

import { MaterialFlags } from './productTypeResolver';

// =============================================================================
// TYPES
// =============================================================================

export interface PhysicalPropertiesOptions {
    finish?: string;           // Matte, Glossy, Metallic, etc.
    scale?: string;            // 30ml, 50ml, Handheld, etc.
    materialDetail?: string;    // Frosted Glass, Amber Glass, etc.
    liquidDetail?: string;      // Transparent, Opaque, Viscous, etc.

    // Context from Layer 3
    materialFlags: MaterialFlags;
}

export interface PhysicalPropertiesResult {
    physicalPrompt: string;
    isValid: boolean;
    validationErrors: string[];
}

// =============================================================================
// MAPPINGS
// =============================================================================

const FINISH_MAPPINGS: Record<string, string> = {
    'Matte': 'non-reflective matte finish, soft-touch texture, diffuse surface highlights',
    'Glossy': 'high-gloss polished surface, sharp mirror-like reflections, premium specular highlights',
    'Metallic': 'brushed metallic sheen, anodized aluminum finish, realistic metal response',
    'Satin': 'semi-gloss satin finish, soft orbital highlights, refined surface luster',
    'Frosted': 'translucent frosted finish, diffused light transmission, soft tactile quality'
};

const LIQUID_DETAIL_MAPPINGS: Record<string, string> = {
    'Transparent': 'crystal clear transparent liquid with realistic refraction',
    'Opaque': 'dense opaque formulation, high color density, no light transmission',
    'Translucent': 'softly translucent liquid, partial light scattering, premium depth',
    'Viscous': 'thick viscous consistency, heavy droplet behavior, rich material density'
};

// =============================================================================
// MAIN FUNCTION
// =============================================================================

/**
 * Build Physical Properties prompt block.
 * 
 * @param options - Physical property selections and material flags
 * @returns PhysicalPropertiesResult
 */
export function buildPhysicalPropertiesPrompt(
    options: PhysicalPropertiesOptions
): PhysicalPropertiesResult {
    const parts: string[] = [];
    const errors: string[] = [];

    // 1. Resolve Finish
    if (options.finish && FINISH_MAPPINGS[options.finish]) {
        parts.push(`Finish: ${FINISH_MAPPINGS[options.finish]}.`);
    } else if (options.finish) {
        parts.push(`Finish: ${options.finish}.`);
    }

    // 2. Resolve Scale
    if (options.scale) {
        parts.push(`Scale: ${options.scale} proportions, visually accurate sizing.`);
    }

    // 3. Resolve Material Details (Liquid specific)
    if (options.materialFlags.isLiquid) {
        if (options.liquidDetail && LIQUID_DETAIL_MAPPINGS[options.liquidDetail]) {
            parts.push(`Material Detail: ${LIQUID_DETAIL_MAPPINGS[options.liquidDetail]}.`);
        } else if (options.liquidDetail) {
            parts.push(`Material Detail: ${options.liquidDetail}.`);
        }
    }

    // 4. Resolve Material Details (General)
    if (options.materialDetail) {
        parts.push(`Materiality: ${options.materialDetail}.`);
    }

    return {
        physicalPrompt: parts.join(' '),
        isValid: errors.length === 0,
        validationErrors: errors
    };
}
