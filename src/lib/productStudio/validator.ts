import type { ProductStudioState, EnvironmentMacro, Lighting, ProductType, MicroPlace } from './types';

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
    // But strict check: if sceneType is NOT studio-branding, env is required.
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

const INTERIOR_LIGHTING: Lighting[] = ['cozy-indoors', 'ring-light', 'mood-lighting', 'flash-photo'];
const EXTERIOR_LIGHTING: Lighting[] = ['natural-light', 'sunny-day', 'golden-hour', 'overcast', 'night-mode', 'flash-photo'];

const INTERIOR_ENVS: EnvironmentMacro[] = ['kitchen', 'living-room', 'bedroom', 'bathroom', 'workspace', 'hallway', 'home-gym', 'balcony-indoor-terrace', 'studio'];
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

    return errors;
}

// ============================================================================
// 4. PRODUCT STATE & MOTION (STRICT)
// ============================================================================

function validateProductStateMotion(state: ProductStudioState): string[] {
    const errors: string[] = [];
    const motion = String(state.stateMotion || 'static');

    const type = state.definition.type;
    const allowedByType: Record<string, string[]> = {
        capsules: ['static', 'opened', 'falling', 'spilled'],
        gummies: ['static', 'opened', 'falling', 'spilled'],
        drops: ['static', 'opened', 'dispensed'],
        powder: ['static', 'opened', 'pouring', 'dispensed'],
    };

    const allowed = allowedByType[type] ?? ['static'];
    if (!allowed.includes(motion)) {
        errors.push(`Product State & Motion "${motion}" is not allowed for Product Type "${type}".`);
    }

    return errors;
}

// ============================================================================
// 5. PRODUCT STATE × PRODUCT INTERACTION (STRICT MATRIX)
// ============================================================================

function validateMotionInteractionCompatibility(state: ProductStudioState): string[] {
    const errors: string[] = [];
    const motion = String(state.stateMotion || 'static');
    const interaction = String(state.interaction || 'none');

    // Hard force rules (must validate even if UI/store tries to coerce):
    if (interaction === 'capsule-display' && motion !== 'static') {
        errors.push('Capsule Display requires Product State & Motion = Static.');
    }
    if (interaction === 'applying-opening' && motion !== 'opened') {
        errors.push('Applying / Opening requires Product State & Motion = Opened.');
    }

    // Motion vs interaction matrix
    if (motion === 'pouring' || motion === 'falling') {
        if (!(interaction === 'none' || interaction === 'cropped-hand')) {
            errors.push('Pouring/Falling motion is only compatible with Product Interaction = None or Cropped Hand.');
        }
    }

    if (motion === 'spilled' || motion === 'dispensed') {
        const allowed = new Set(['none', 'cropped-hand', 'resting-interaction', 'supported-hold']);
        if (!allowed.has(interaction)) {
            errors.push('Spilled/Dispensed motion disables Holding and Presentation interaction modes.');
        }
    }

    if (motion === 'opened') {
        const allowed = new Set([
            'none',
            'cropped-hand',
            'supported-hold',
            'holding',
            'two-hand-hold',
            'applying-opening',
        ]);
        if (!allowed.has(interaction)) {
            errors.push('Opened state is not compatible with Presenting, Framed Presentation, or Capsule Display.');
        }
    }

    if (motion === 'static') {
        if (interaction === 'applying-opening') {
            errors.push('Static state is not compatible with Applying / Opening. Use Opened state instead.');
        }
    }

    // Product-type constraints
    if (interaction === 'capsule-display' && state.definition.type !== 'capsules') {
        errors.push('Capsule Display requires Product Type = Capsules.');
    }

    // Camera compatibility (existing hard rule carried over)
    if (interaction === 'two-hand-hold' && state.distance === 'macro') {
        errors.push('Two-Hand Hold is not compatible with Macro distance. Use Tight/Close framing instead.');
    }

    return errors;
}

// ============================================================================
// 6. FORBIDDEN LANGUAGE (STRICT)
// ============================================================================

const FORBIDDEN_TERMS = ['person', 'people', 'model', 'face', 'selfie', 'phone', 'lifestyle'];
const ALLOWED_EXCEPTION = 'cropped fingers at frame edge holding product';

function validateForbiddenLanguage(state: ProductStudioState): string[] {
    const errors: string[] = [];

    // We scan custom inputs, as they are the only source of free text
    const inputsToScan = [
        state.customEnvironmentText,
        state.customMicroPlaceText,
        // Also check if any custom props could sneak this in (though selectedProps is list of IDs/names)
        ...state.selectedProps
    ];

    const lowerException = ALLOWED_EXCEPTION.toLowerCase();

    inputsToScan.forEach(text => {
        if (!text) return;
        const lower = text.toLowerCase();

        // If exact exception match, allowed (though rarely matches perfectly in a sentence mix, strict check)
        if (lower.includes(lowerException)) return;

        FORBIDDEN_TERMS.forEach(term => {
            if (lower.includes(term)) {
                // If the term is part of the exception (e.g. "fingers" not in list but "hand" is?)
                // "hand" is in forbidden. Exception has "fingers". "hand" not in exception.
                // "holding" is in exception.
                errors.push(`Forbidden term detected: "${term}". Human elements are strictly blocked in Product Studio.`);
            }
        });
    });

    return errors;
}

// ============================================================================
// MAIN VALIDATOR
// ============================================================================

export function validateProductStudioState(state: ProductStudioState): ValidationResult {
    const errors: string[] = [
        ...validateProductEnvironment(state),
        ...validateLighting(state),
        ...validateBundle(state),
        ...validateProductStateMotion(state),
        ...validateMotionInteractionCompatibility(state),
        ...validateForbiddenLanguage(state)
    ];

    return {
        valid: errors.length === 0,
        errors,
        warnings: []
    };
}
