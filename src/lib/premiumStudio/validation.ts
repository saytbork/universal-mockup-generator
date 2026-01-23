/**
 * PREMIUM STUDIO VALIDATION RULES
 * 
 * Hard rules for input validation.
 * If any rule fails → ABORT.
 */

import type {
    PremiumStudioInput,
    SceneType,
    ProductCategory,
    MacroEnvironment,
    LightingStyle,
    BundleConfig
} from './schema';
import { SCENE_TYPE_RULES } from './schema';

// ============================================================================
// VALIDATION RESULT
// ============================================================================

export interface ValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
}

// ============================================================================
// PRODUCT → ENVIRONMENT COMPATIBILITY
// ============================================================================

/**
 * Some products don't make sense in certain environments
 */
const PRODUCT_ENVIRONMENT_BLOCKS: Record<ProductCategory, MacroEnvironment[]> = {
    supplement_powder: ['bedroom', 'bathroom'],  // Powder = kitchen/workspace
    supplement_capsule: [],
    supplement_gummy: [],
    supplement_liquid: [],
    skincare_serum: ['kitchen', 'home_gym'],     // Skincare = bathroom/bedroom
    skincare_cream: ['kitchen', 'home_gym'],
    skincare_cleanser: ['kitchen', 'home_gym', 'workspace'],
    beverage: ['bathroom', 'bedroom'],
    food: ['bathroom', 'bedroom'],
    other: []
};

// ============================================================================
// LIGHTING COMPATIBILITY
// ============================================================================

/**
 * Some lighting styles are incompatible with scene types
 */
function isLightingCompatible(sceneType: SceneType, lighting: LightingStyle): boolean {
    const rules = SCENE_TYPE_RULES[sceneType];
    return rules.allowedLighting.includes(lighting);
}

// ============================================================================
// BUNDLE RULES
// ============================================================================

function validateBundle(bundle: BundleConfig): string[] {
    const errors: string[] = [];

    // Rule: 2-5 products
    if (bundle.products.length < 2) {
        errors.push('Bundle must have at least 2 products');
    }
    if (bundle.products.length > 5) {
        errors.push('Bundle cannot have more than 5 products');
    }

    // Rule: Exactly 1 hero
    const heroCount = bundle.products.filter(p => p.isHero).length;
    if (heroCount !== 1) {
        errors.push(`Bundle must have exactly 1 hero product, found ${heroCount}`);
    }

    // Rule: Positions must be sequential
    const positions = bundle.products.map(p => p.position).sort();
    for (let i = 0; i < positions.length; i++) {
        if (positions[i] !== i + 1) {
            errors.push('Bundle product positions must be sequential starting from 1');
            break;
        }
    }

    // Rule: Type matches count
    if (bundle.type === 'duo' && bundle.products.length !== 2) {
        errors.push('Duo bundle must have exactly 2 products');
    }
    if (bundle.type === 'trio' && bundle.products.length !== 3) {
        errors.push('Trio bundle must have exactly 3 products');
    }
    if (bundle.type === 'kit' && bundle.products.length < 3) {
        errors.push('Kit bundle must have at least 3 products');
    }

    return errors;
}

// ============================================================================
// MAIN VALIDATOR
// ============================================================================

export function validatePremiumInput(input: PremiumStudioInput): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const rules = SCENE_TYPE_RULES[input.sceneType];

    // ─────────────────────────────────────────────────────────────────────────
    // RULE 1: Environment requirements
    // ─────────────────────────────────────────────────────────────────────────

    if (rules.requiresEnvironment && !input.environment) {
        errors.push(`SceneType "${input.sceneType}" requires environment`);
    }

    if (!rules.allowsEnvironment && input.environment) {
        errors.push(`SceneType "${input.sceneType}" does not allow environment`);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // RULE 2: Environment MicroPlace required
    // ─────────────────────────────────────────────────────────────────────────

    if (input.environment && !input.environment.microPlace) {
        errors.push('MicroPlace is required when environment is set');
    }

    // ─────────────────────────────────────────────────────────────────────────
    // RULE 3: Product → Environment compatibility
    // ─────────────────────────────────────────────────────────────────────────

    if (input.environment) {
        const blockedEnvironments = PRODUCT_ENVIRONMENT_BLOCKS[input.product.category];
        if (blockedEnvironments.includes(input.environment.macro)) {
            errors.push(
                `Product "${input.product.category}" is not compatible with environment "${input.environment.macro}"`
            );
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // RULE 4: Lighting compatibility
    // ─────────────────────────────────────────────────────────────────────────

    if (!isLightingCompatible(input.sceneType, input.lighting)) {
        errors.push(
            `Lighting "${input.lighting}" is not compatible with sceneType "${input.sceneType}"`
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // RULE 5: Bundle requirements
    // ─────────────────────────────────────────────────────────────────────────

    if (rules.requiresBundle && !input.bundle) {
        errors.push(`SceneType "${input.sceneType}" requires bundle configuration`);
    }

    if (!rules.allowsBundle && input.bundle) {
        errors.push(`SceneType "${input.sceneType}" does not allow bundle`);
    }

    if (input.bundle) {
        const bundleErrors = validateBundle(input.bundle);
        errors.push(...bundleErrors);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // RULE 6: Person requirements (UGC)
    // ─────────────────────────────────────────────────────────────────────────

    if (rules.requiresPerson && !input.person) {
        errors.push(`SceneType "${input.sceneType}" requires person configuration`);
    }

    if (!rules.allowsPerson && input.person) {
        errors.push(`SceneType "${input.sceneType}" does not allow person`);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // RULE 7: UGC camera must be phone (implicit, no DSLR)
    // ─────────────────────────────────────────────────────────────────────────

    // This is enforced at prompt level, not input validation

    // ─────────────────────────────────────────────────────────────────────────
    // WARNINGS (non-blocking)
    // ─────────────────────────────────────────────────────────────────────────

    if (input.sceneType === 'lifestyle_real' && input.environment?.macro === 'custom') {
        warnings.push('Custom environment may produce less consistent results');
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings
    };
}

// ============================================================================
// QUICK CHECKS (for UI)
// ============================================================================

export function canHaveEnvironment(sceneType: SceneType): boolean {
    return SCENE_TYPE_RULES[sceneType].allowsEnvironment;
}

export function canHaveBundle(sceneType: SceneType): boolean {
    return SCENE_TYPE_RULES[sceneType].allowsBundle;
}

export function canHavePerson(sceneType: SceneType): boolean {
    return SCENE_TYPE_RULES[sceneType].allowsPerson;
}

export function getAllowedLighting(sceneType: SceneType): LightingStyle[] {
    return SCENE_TYPE_RULES[sceneType].allowedLighting;
}

export function isProductEnvironmentCompatible(
    category: ProductCategory,
    macro: MacroEnvironment
): boolean {
    return !PRODUCT_ENVIRONMENT_BLOCKS[category].includes(macro);
}
