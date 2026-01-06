/**
 * Hard Fail Validation - Conditions that MUST abort generation
 */

import type { DeterministicPromptInput, SceneType } from '../sceneTypes';
import { getSceneTypeRules, isLightingAllowed, isEnvironmentAllowed, areHandsAllowed } from '../sceneTypeRules';

export interface ValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
}

export function checkHardFails(input: Partial<DeterministicPromptInput>): string[] {
    const errors: string[] = [];

    // HARD FAIL 1: Missing sceneType
    if (!input.sceneType) {
        errors.push('HARD FAIL: sceneType is required but missing. ABORT.');
        return errors;
    }

    const sceneType = input.sceneType as SceneType;
    const rules = getSceneTypeRules(sceneType);

    // HARD FAIL 2: Environment where forbidden
    if (!isEnvironmentAllowed(sceneType)) {
        const hasEnvironment = input.environment?.macroEnvironment || input.environment?.microPlace;
        if (hasEnvironment) {
            errors.push(`HARD FAIL: Environment is FORBIDDEN for sceneType="${sceneType}". ABORT.`);
        }
    }

    // HARD FAIL 3: Hands where not allowed
    if (!areHandsAllowed(sceneType) && input.productSetup?.handsAllowed === true) {
        errors.push(`HARD FAIL: handsAllowed=true is FORBIDDEN for sceneType="${sceneType}". ABORT.`);
    }

    // HARD FAIL 4: Lighting contradiction
    if (input.lighting?.lightingStyle) {
        if (!isLightingAllowed(sceneType, input.lighting.lightingStyle)) {
            errors.push(`HARD FAIL: Lighting "${input.lighting.lightingStyle}" contradicts sceneType="${sceneType}". ABORT.`);
        }
    }

    // HARD FAIL 5: Ecommerce misuse
    if (input.ecommerce?.enabled === true && sceneType !== 'ecommerce_blank_space') {
        errors.push(`HARD FAIL: ecommerce.enabled=true requires sceneType="ecommerce_blank_space". ABORT.`);
    }

    // HARD FAIL 6: Creativity level violations (STRICT per sceneType)
    if (input.creativity) {
        // studio_packshot: creativity MUST be 0 or Off
        if (sceneType === 'studio_packshot' && input.creativity.level > 0) {
            errors.push(`HARD FAIL: For sceneType="studio_packshot", creativity level MUST be 0 or Off. Found: ${input.creativity.level}. ABORT.`);
        }
        // ugc_phone: max level = 3
        if (sceneType === 'ugc_phone' && input.creativity.level > 3) {
            errors.push(`HARD FAIL: For sceneType="ugc_phone", creativity level MUST be <= 3. Found: ${input.creativity.level}. ABORT.`);
        }
        // ecommerce_blank_space: max level = 2, no theme/palette
        if (sceneType === 'ecommerce_blank_space') {
            if (input.creativity.level > 2 || input.creativity.theme || input.creativity.paletteSource) {
                errors.push(`HARD FAIL: For sceneType="ecommerce_blank_space", creativity level MUST be <= 2, theme and paletteSource MUST be empty. ABORT.`);
            }
        }
    }

    // HARD FAIL 7: Missing productType
    if (!input.productSetup?.productType) {
        errors.push(`HARD FAIL: productSetup.productType is required. ABORT.`);
    }

    // HARD FAIL 8: Quantity > 1 only for bundle_kit OR editorial_product
    if (input.compositionRules?.quantity && input.compositionRules.quantity > 1) {
        if (sceneType !== 'bundle_kit' && sceneType !== 'editorial_product') {
            errors.push(`HARD FAIL: quantity > 1 is ONLY allowed for sceneType="bundle_kit" or "editorial_product". Current: "${sceneType}" with quantity=${input.compositionRules.quantity}. ABORT.`);
        }
    }

    // HARD FAIL 9: bundle_kit requires quantity > 1
    if (sceneType === 'bundle_kit' && input.compositionRules?.quantity === 1) {
        errors.push(`HARD FAIL: sceneType="bundle_kit" requires quantity > 1. ABORT.`);
    }

    // HARD FAIL 10: Camera system validation for UGC
    if (sceneType === 'ugc_phone' && input.camera?.cameraSystem) {
        const studioLenses = ['DSLR', 'medium format', 'cinema camera', 'professional', 'studio'];
        const normalized = input.camera.cameraSystem.toLowerCase();
        if (studioLenses.some(lens => normalized.includes(lens.toLowerCase()))) {
            errors.push(`HARD FAIL: For sceneType="ugc_phone", camera "${input.camera.cameraSystem}" contradicts UGC authenticity. Use "smartphone" only. ABORT.`);
        }
    }

    return errors;
}

export function checkWarnings(input: Partial<DeterministicPromptInput>): string[] {
    const warnings: string[] = [];
    if (!input.sceneType) return warnings;
    const sceneType = input.sceneType as SceneType;

    if (input.creativity?.level && input.creativity.level >= 7) {
        warnings.push(`WARNING: High creativity level (${input.creativity.level}) may produce unpredictable results.`);
    }

    if (sceneType === 'ugc_phone' && input.camera?.framing === 'centered') {
        warnings.push(`WARNING: Centered framing is unusual for ugc_phone. Consider imperfect framing for authenticity.`);
    }

    if (sceneType === 'bundle_kit' && input.compositionRules?.quantity && input.compositionRules.quantity > 6) {
        warnings.push(`WARNING: ${input.compositionRules.quantity} products in bundle may create cluttered composition.`);
    }

    return warnings;
}

export function validateInput(input: Partial<DeterministicPromptInput>): ValidationResult {
    const errors = checkHardFails(input);
    const warnings = errors.length === 0 ? checkWarnings(input) : [];
    return { valid: errors.length === 0, errors, warnings };
}
