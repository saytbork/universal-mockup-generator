import type { ProductStudioState, CameraAngle, CameraDistance, CameraRotation, CameraFraming, CreativeTheme, PaletteSource, PropDensity, BlankSpaceSide, EnvironmentMacro, Lighting, ProductType, MicroPlace } from '@/lib/productStudio/types';
// removed self import

// ============================================================================
// VALIDATION RESULT
// ============================================================================

export interface ValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
}

// ============================================================================
// 1. PRODUCT → ENVIRONMENT COMPATIBILITY
// ============================================================================

/**
 * Defines which environments are BLOCKED for specific product types.
 * This enforces logical consistency (e.g., no food in the bathroom).
 */
const BLOCKED_ENVIRONMENTS: Record<ProductType, EnvironmentMacro[]> = {
    'capsules': [], // Capsules are versatile
    'gummies': [],
    'drops': [],
    'powder': ['bedroom', 'bathroom'], // Powders are messy, usually kitchen/gym
    'skincare': ['kitchen', 'home-gym', 'urban-exterior', 'street-corner', 'parking-lot'], // Skincare usually bathroom/bedroom/vanity
    'device': [],
    'custom': [],
    'dummy': []
};

function validateProductEnvironment(state: ProductStudioState): string[] {
    const errors: string[] = [];

    // If we are in Studio mode, Environment is irrelevant/hidden.
    // But strict check: if sceneType is NOT studio, env is required.
    if (state.sceneType === 'studio-branding') return errors;

    // Use state.definition.type for correct type access
    const productType = state.definition.type;

    // Skip dummy/custom for now or treat as versatile
    if (productType === 'dummy' || productType === 'custom') return errors;

    const currentEnv = state.environmentMacro;
    if (!currentEnv) {
        errors.push('Environment is required for non-studio scenes.');
        return errors;
    }

    const blocked = BLOCKED_ENVIRONMENTS[productType];
    if (blocked && blocked.includes(currentEnv)) {
        // Format for user friendliness
        const niceEnv = currentEnv.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        errors.push(`The "${niceEnv}" environment is not suitable for ${productType} products.`);
    }

    return errors;
}

// ============================================================================
// 2. LIGHTING COMPATIBILITY
// ============================================================================

// Removed 'studio-soft' and 'studio-dramatic' if they are not in the Lighting type
const INTERIOR_LIGHTING: Lighting[] = ['cozy-indoors', 'ring-light', 'mood-lighting', 'flash-photo'];
const EXTERIOR_LIGHTING: Lighting[] = ['natural-light', 'sunny-day', 'golden-hour', 'overcast', 'night-mode', 'flash-photo'];

const INTERIOR_ENVS: EnvironmentMacro[] = ['kitchen', 'living-room', 'bedroom', 'bathroom', 'workspace', 'hallway', 'home-gym', 'balcony-indoor-terrace', 'cgmp-facility', 'studio'];
const EXTERIOR_ENVS: EnvironmentMacro[] = ['urban-exterior', 'natural-exterior', 'parking-lot', 'backyard-patio', 'street-corner'];

function validateLighting(state: ProductStudioState): string[] {
    const errors: string[] = [];
    const { lighting, environmentMacro, sceneType } = state;

    // Rule: Ring Light only interior or studio
    if (lighting === 'ring-light') {
        if (sceneType !== 'studio-branding' && environmentMacro && !INTERIOR_ENVS.includes(environmentMacro)) {
            errors.push('Ring Light is only available for interior environments.');
        }
    }

    // Rule: Golden Hour never bathroom
    if (lighting === 'golden-hour' && environmentMacro === 'bathroom') {
        errors.push('Golden Hour lighting is not available in bathrooms.');
    }

    // Rule: Night Mode only exterior
    if (lighting === 'night-mode') {
        if (sceneType !== 'studio-branding' && environmentMacro && !EXTERIOR_ENVS.includes(environmentMacro)) {
            errors.push('Night Mode is only available for exterior environments.');
        }
    }

    // Rule: Flash Photo only urban / parking / street / studio or interiors
    // The user prompt said "Flash Photo only urban / parking / street". 
    // Let's stick strictly to that, perhaps allowing studio too as it's common.
    // "Validation: Flash → urban / parking / street"
    if (lighting === 'flash-photo') {
        const allowedFlashEnvs: EnvironmentMacro[] = ['urban-exterior', 'parking-lot', 'street-corner'];
        if (sceneType !== 'studio-branding' && environmentMacro && !allowedFlashEnvs.includes(environmentMacro)) {
            // However, flash is often used indoors too? 
            // User instruction: "Flash Photo only urban / parking / street"
            // I will strictly enforce this override.
            errors.push('Flash Photo style is restricted to urban, parking lot, or street settings.');
        }
    }

    return errors;
}

// ============================================================================
// 3. BUNDLE RULES
// ============================================================================

function validateBundle(state: ProductStudioState): string[] {
    const errors: string[] = [];
    const { bundle, sceneType } = state;

    if (!bundle.enabled) return errors;

    // Rule: Bundles allowed only in studio, editorial, lifestyle
    // (Not UGC - user said "Bundles permitted only in: studio, editorial, lifestyle")
    if (['ugc-phone'].includes(sceneType)) {
        errors.push('Bundles are not available in UGC Phone mode.');
    }

    // Rule: Minimum 2 products (implicit in types but good to check state)
    // Logic mostly enforced by UI, but if state gets corrupted:
    // We assume the bundle logic itself (hero vs secondaries) is handled by the generation logic 
    // ensuring one hero.

    return errors;
}

// ============================================================================
// MAIN VALIDATOR
// ============================================================================

export function validateProductStudioState(state: ProductStudioState): ValidationResult {
    const errors: string[] = [
        ...validateProductEnvironment(state),
        ...validateLighting(state),
        ...validateBundle(state)
    ];

    return {
        valid: errors.length === 0,
        errors,
        warnings: []
    };
}
