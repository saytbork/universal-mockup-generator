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

const isStudioLikeScene = (sceneType: ProductStudioState['sceneType']): boolean =>
    sceneType === 'studio-branding' || sceneType === 'ecommerce-pdp';

function validateProductEnvironment(state: ProductStudioState): string[] {
    const errors: string[] = [];

    // If we are in Studio mode, Environment is irrelevant/hidden. 
    // But strict check: if sceneType is NOT studio-branding, env is required.
    if (isStudioLikeScene(state.sceneType)) return errors;

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

const INTERIOR_ENVS: EnvironmentMacro[] = ['kitchen', 'living-room', 'bedroom', 'bathroom', 'workspace', 'hallway', 'home-gym', 'balcony-indoor-terrace', 'cgmp-facility', 'studio'];
const EXTERIOR_ENVS: EnvironmentMacro[] = ['urban-exterior', 'natural-exterior', 'parking-lot', 'backyard-patio', 'street-corner'];

function validateLighting(state: ProductStudioState): string[] {
    const errors: string[] = [];
    const { lighting, environmentMacro, sceneType } = state;

    // Rule: Ring Light only interior or studio
    if (lighting === 'ring-light') {
        if (!isStudioLikeScene(sceneType) && environmentMacro && !INTERIOR_ENVS.includes(environmentMacro)) {
            errors.push('Ring Light is only available for interior environments.');
        }
    }

    // Rule: Golden Hour never bathroom
    if (lighting === 'golden-hour' && environmentMacro === 'bathroom') {
        errors.push('Golden Hour lighting is not available in bathrooms.');
    }

    // Rule: Night Mode only exterior
    if (lighting === 'night-mode') {
        if (!isStudioLikeScene(sceneType) && environmentMacro && !EXTERIOR_ENVS.includes(environmentMacro)) {
            errors.push('Night Mode is only available for exterior environments.');
        }
    }

    // Rule: Flash Photo only urban / parking / street / studio or interiors
    // The user prompt said "Flash Photo only urban / parking / street". 
    // Let's stick strictly to that, perhaps allowing studio too as it's common.
    // "Validation: Flash → urban / parking / street"
    if (lighting === 'flash-photo') {
        const allowedFlashEnvs: EnvironmentMacro[] = ['urban-exterior', 'parking-lot', 'street-corner'];
        if (!isStudioLikeScene(sceneType) && environmentMacro && !allowedFlashEnvs.includes(environmentMacro)) {
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
        // Interpretation-first: we don't block; we warn/correct at build-time.
        capsules: ['static', 'opened', 'spilled', 'dispensed', 'falling'],
        gummies: ['static', 'opened', 'spilled', 'dispensed', 'falling'],
        drops: ['static', 'opened', 'spilled', 'dispensed'],
        powder: ['static', 'opened', 'spilled', 'dispensed', 'pouring'],
    };

    const allowed = allowedByType[type] ?? ['static'];
    if (!allowed.includes(motion)) {
        errors.push(`Product State & Motion "${motion}" is not typical for Product Type "${type}". It will be reinterpreted to a physically plausible motion.`);
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

    // Interpretation-first: conflicts are reinterpreted (do not block generation).
    // Keep only hard physics impossibilities as warnings here.
    if ((motion === 'falling' || motion === 'pouring' || motion === 'dispensed' || motion === 'spilled') && interaction === 'holding') {
        errors.push('Interaction "Holding" may be reinterpreted as a cropped hand or no hand to preserve physically plausible motion.');
    }

    // Product-type constraints
    if (interaction === 'capsule-display' && state.definition.type !== 'capsules') {
        errors.push('Capsule Display requires Product Type = Capsules. Interaction will be reinterpreted.');
    }

    // Camera compatibility (existing hard rule carried over)
    if (interaction === 'two-hand-hold' && state.distance === 'macro') {
        errors.push('Two-Hand Hold is not compatible with Macro distance. Interaction will be reinterpreted.');
    }

    return errors;
}

// ============================================================================
// 6. FORBIDDEN LANGUAGE (STRICT)
// ============================================================================

const FORBIDDEN_TERMS = ['person', 'people', 'model', 'face', 'selfie', 'phone', 'lifestyle'];
const ALLOWED_EXCEPTION = 'cropped fingers at frame edge holding product';

/**
 * Builds a whole-word regex that also excludes hyphenated compounds.
 * Standard \b treats '-' as a word boundary, so "model-based" would match \bmodel\b.
 * This pattern uses a negative lookahead and lookbehind for hyphens to prevent that.
 */
function buildWholeWordRegex(term: string): RegExp {
    const escaped = term.replace(/\s+/g, '\\s+');
    // Not preceded by a word char or hyphen, not followed by a word char or hyphen
    return new RegExp(`(?<![\\w-])${escaped}(?![\\w-])`, 'i');
}

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
            if (buildWholeWordRegex(term).test(lower)) {
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
    const hardErrors: string[] = [
        ...validateProductEnvironment(state),
        ...validateLighting(state),
        ...validateBundle(state),
        ...validateForbiddenLanguage(state)
    ];

    return {
        valid: hardErrors.length === 0,
        errors: hardErrors,
        warnings: [
            ...validateProductStateMotion(state),
            ...validateMotionInteractionCompatibility(state),
        ]
    };
}
