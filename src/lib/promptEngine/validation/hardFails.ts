/**
 * Hard Fail Validation - Conditions that MUST abort generation
 */

import type { DeterministicPromptInput, SceneType } from '../sceneTypes';
import { getSceneTypeRules, isLightingAllowed, isEnvironmentAllowed, areHandsAllowed } from '../sceneTypeRules';
import { getSceneSchema } from '../../productStudio/photoModeSchema';

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

    // =========================================================================
    // v1.0 CONFLICT VALIDATION CHECKS (COMPLETE COVERAGE)
    // =========================================================================

    const photoMode = (input as any).photoMode || '';
    const placement = input.placement;
    const viewpoint = (input as any).viewpoint;
    const cameraAngle = input.camera?.angle;
    const productType = input.productSetup?.productType;
    const interaction = input.compositionRules?.interactionType;

    // HARD FAIL 11: PhotoMode × Placement (FULL SCHEMA ENFORCEMENT)
    // Validates ALL requiredPlacement constraints from photoModeSchema
    if (photoMode && placement) {
        const schema = getSceneSchema(photoMode);
        const required = schema?.requiredPlacement as string | undefined;
        if (required && required !== 'any' && placement !== required) {
            errors.push(`HARD FAIL: Photo Mode "${photoMode}" requires placement="${required}". Current placement="${placement}". ABORT.`);
        }
        // Air placement can only be used in modes that explicitly allow it (requiredPlacement='air' or 'any').
        if (placement === 'air' && required && required !== 'air' && required !== 'any') {
            errors.push(`HARD FAIL: Placement "air" is not compatible with Photo Mode "${photoMode}" (requiredPlacement="${required}"). ABORT.`);
        }
    }

    // HARD FAIL 12: ProductType × Interaction (COMPLETE)
    // Certain product types forbid certain interactions
    if (productType && interaction && interaction !== 'none') {
        const PRODUCT_TYPE_FORBIDDEN_INTERACTIONS: Record<string, string[]> = {
            'capsules': ['applying-opening', 'resting-interaction'],
            'gummies': ['applying-opening', 'resting-interaction', 'capsule-display'], // FIXED: added capsule-display
            'powder': ['capsule-display'],
            'drops': ['capsule-display'],
            'device': ['capsule-display', 'applying-opening'],
            'skincare': ['capsule-display'],
            'beverage': ['capsule-display', 'applying-opening'],
        };
        const forbidden = PRODUCT_TYPE_FORBIDDEN_INTERACTIONS[productType.toLowerCase()] || [];
        if (forbidden.includes(interaction)) {
            errors.push(`HARD FAIL: Interaction "${interaction}" is FORBIDDEN for Product Type "${productType}". ABORT.`);
        }
    }

    // HARD FAIL 13: Placement × Viewpoint (FULL MATRIX)
    // Physical logic: placement defines what viewpoints are possible
    if (placement && viewpoint) {
        const PLACEMENT_VIEWPOINT_RULES: Record<string, { allowed: string[]; reason: string }> = {
            'surface': {
                allowed: ['eye-level', 'top-down', 'display-view'],
                reason: 'Surface placement requires surface-compatible viewpoints'
            },
            'held': {
                allowed: ['human-pov', 'eye-level'],
                reason: 'Held objects must use human-level perspectives'
            },
            'supported': {
                allowed: ['eye-level', 'top-down', 'display-view'],
                reason: 'Supported objects can use display or observation viewpoints'
            },
            'air': {
                allowed: ['suspended', 'eye-level'],
                reason: 'Suspended objects cannot reference surface-based viewpoints'
            },
        };
        const rules = PLACEMENT_VIEWPOINT_RULES[placement];
        if (rules && !rules.allowed.includes(viewpoint)) {
            errors.push(`HARD FAIL: Viewpoint "${viewpoint}" is INVALID for placement="${placement}". ${rules.reason}. Allowed: ${rules.allowed.join(', ')}. ABORT.`);
        }
    }

    // HARD FAIL 14: Viewpoint × Camera (FULL MATRIX)
    // Camera angle must be physically compatible with viewpoint
    if (viewpoint && cameraAngle) {
        const VIEWPOINT_CAMERA_CONFLICTS: Record<string, { forbidden: string[]; reason: string }> = {
            'top-down': {
                forbidden: ['eye-level', 'low', 'front', '45-degree'],
                reason: 'Top-down viewpoint requires top/aerial camera angles only'
            },
            'eye-level': {
                forbidden: ['top', 'aerial', 'top-down'],
                reason: 'Eye-level viewpoint cannot use overhead camera angles'
            },
            'human-pov': {
                forbidden: ['top', 'aerial', 'top-down', 'low'],
                reason: 'Human POV requires natural eye-level or slight variations'
            },
            'suspended': {
                forbidden: ['top-down'],
                reason: 'Suspended view implies no surface reference for top-down'
            },
        };
        const conflicts = VIEWPOINT_CAMERA_CONFLICTS[viewpoint];
        if (conflicts && conflicts.forbidden.includes(cameraAngle)) {
            errors.push(`HARD FAIL: Camera angle "${cameraAngle}" conflicts with viewpoint "${viewpoint}". ${conflicts.reason}. ABORT.`);
        }
    }

    // HARD FAIL 15: Placement × Interaction (PHYSICAL ENFORCEMENT)
    // Interactions requiring hands must have compatible placement
    if (placement && interaction && interaction !== 'none') {
        const HAND_INTERACTIONS = [
            'holding', 'two-hand-hold', 'presenting', 'framed-presentation',
            'applying-opening', 'supported-hold', 'capsule-display'
        ];
        const isHandInteraction = HAND_INTERACTIONS.includes(interaction);

        // Hand interactions require 'held' or 'supported' placement
        if (isHandInteraction && placement !== 'held' && placement !== 'supported') {
            errors.push(`HARD FAIL: Interaction "${interaction}" requires hands, which conflicts with placement="${placement}". Hands require placement "held" or "supported". ABORT.`);
        }

        // Air placement forbids ALL interactions except 'none'
        if (placement === 'air') {
            errors.push(`HARD FAIL: Placement "air" (neutralized gravity) forbids ALL interactions. Current interaction: "${interaction}". ABORT.`);
        }
    }

    // HARD FAIL 16: Photo Mode × Person Presence (STUDIO VS LIFESTYLE)
    // Studio worlds forbid ALL person presence/interaction. lifestyle/UGC only.
    if (photoMode) {
        const schema = getSceneSchema(photoMode);
        if (schema && schema.allowsPersonPresence === false && interaction && interaction !== 'none') {
            errors.push(`HARD FAIL: Photo Mode "${photoMode}" is a STUDIO world and forbids person presence or interaction. Interaction="${interaction}" is INVALID. ABORT.`);
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
