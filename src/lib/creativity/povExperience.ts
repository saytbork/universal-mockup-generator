/**
 * POV EXPERIENCE — LIFESTYLE VARIANT
 * 
 * First-person perspective photography for immersive product experiences.
 * 
 * SCOPE:
 * - SceneType: lifestyle_real ONLY
 * - Default: OFF
 * 
 * VISUAL RULES:
 * - Camera: first-person POV, smartphone aesthetic
 * - Perspective: viewer sees through user's eyes
 * - Hands: exactly ONE hand allowed
 * - Hand must be realistic, imperfect
 * - No second hand, no face, no full body
 * - Product is being used, not staged
 */

import type { SceneType } from '../premiumStudio/schema';
import type { CreativeMode } from './schema';

// ============================================================================
// LIFESTYLE VARIANT TYPE
// ============================================================================

export type LifestyleVariant =
    | 'standard'      // Default lifestyle (no POV)
    | 'pov_experience'; // First-person perspective

// ============================================================================
// POV RULES
// ============================================================================

export interface POVRules {
    camera: string;
    perspective: string;
    handRule: string;
    forbidden: string[];
    productInteraction: string;
}

export const POV_EXPERIENCE_RULES: POVRules = {
    camera: 'First-person POV, smartphone-style optics, natural field of view',
    perspective: 'Viewer sees through the user\'s eyes. Immersive, experiential.',
    handRule: 'Exactly ONE hand visible. Realistic, imperfect. Natural grip or interaction.',
    forbidden: [
        'second hand',
        'both hands',
        'face',
        'full body',
        'posed product photography',
        'studio aesthetic',
        'plastic hands',
        'mannequin hands',
        'duplicated anatomy'
    ],
    productInteraction: 'Product is being actively used, not staged. Natural moment captured.'
};

// ============================================================================
// SCENE TYPE COMPATIBILITY
// ============================================================================

export const POV_ALLOWED_SCENE_TYPES: SceneType[] = ['lifestyle_real'];

export const POV_BLOCKED_SCENE_TYPES: SceneType[] = [
    'studio_branding',
    'editorial_product',
    'bundle_hero',
    'ugc_phone'
];

export function isPOVAllowedForSceneType(sceneType: SceneType): boolean {
    return POV_ALLOWED_SCENE_TYPES.includes(sceneType);
}

// ============================================================================
// CREATIVE MODE COMPATIBILITY
// ============================================================================

export const POV_ALLOWED_CREATIVE_MODES: CreativeMode[] = [
    'lifestyle_cinematic',
    'natural_organic'
];

export const POV_BLOCKED_CREATIVE_MODES: CreativeMode[] = [
    'high_end_studio',
    'scientific_clean',
    'minimal_editorial',
    'vibrant_brand_explosion',
    'playful_bold'
];

export function isPOVAllowedForCreativeMode(mode: CreativeMode): boolean {
    return POV_ALLOWED_CREATIVE_MODES.includes(mode);
}

// ============================================================================
// VALIDATION
// ============================================================================

export interface POVValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
}

export function validatePOVExperience(
    sceneType: SceneType,
    creativeMode: CreativeMode | null,
    povActive: boolean
): POVValidationResult {
    if (!povActive) {
        return { valid: true, errors: [], warnings: [] };
    }

    const errors: string[] = [];
    const warnings: string[] = [];

    // Check scene type
    if (!isPOVAllowedForSceneType(sceneType)) {
        errors.push(
            `POV Experience is only available for lifestyle_real. ` +
            `Current: ${sceneType}. POV blocked for: ${POV_BLOCKED_SCENE_TYPES.join(', ')}.`
        );
    }

    // Check creative mode
    if (creativeMode && !isPOVAllowedForCreativeMode(creativeMode)) {
        errors.push(
            `POV Experience requires compatible creative mode. ` +
            `Allowed: ${POV_ALLOWED_CREATIVE_MODES.join(', ')}. ` +
            `Current: ${creativeMode} is not compatible.`
        );
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings
    };
}

// ============================================================================
// PROMPT INJECTION
// ============================================================================

export interface POVInjection {
    cameraDirective: string;
    perspectiveDirective: string;
    handDirective: string;
    forbiddenDirective: string;
    fullInjection: string;
}

export function injectPOVExperience(): POVInjection {
    const rules = POV_EXPERIENCE_RULES;

    const cameraDirective = `CAMERA: ${rules.camera}`;
    const perspectiveDirective = `PERSPECTIVE: ${rules.perspective}`;
    const handDirective = `HANDS: ${rules.handRule}`;
    const forbiddenDirective = `STRICT AVOID: ${rules.forbidden.join(', ')}`;

    const fullInjection = [
        '',
        '--- POV EXPERIENCE ---',
        cameraDirective,
        perspectiveDirective,
        handDirective,
        `PRODUCT INTERACTION: ${rules.productInteraction}`,
        forbiddenDirective,
        '--- END POV ---'
    ].join('\n');

    return {
        cameraDirective,
        perspectiveDirective,
        handDirective,
        forbiddenDirective,
        fullInjection
    };
}

// ============================================================================
// UI HELPERS
// ============================================================================

export const POV_TOOLTIP = {
    title: 'POV Experience',
    description: 'Shows the product from a first-person perspective, as if viewed through the user\'s eyes.',
    whenToUse: 'Ideal for storytelling, premium lifestyle ads, and immersive brand content.',
    whenToAvoid: 'Not recommended for clean ecommerce, studio branding, or clinical positioning.'
};

export function getPOVDisabledReason(sceneType: SceneType): string | null {
    if (isPOVAllowedForSceneType(sceneType)) return null;

    const reasonMap: Record<SceneType, string> = {
        studio_branding: 'POV requires lifestyle context. Studio mode uses clean backgrounds.',
        editorial_product: 'POV is experiential, not editorial. Use standard editorial for magazine aesthetics.',
        bundle_hero: 'POV focuses on single-product interaction. Bundles require different composition.',
        ugc_phone: 'UGC already has its own authentic capture rules.',
        lifestyle_real: '' // Allowed
    };

    return reasonMap[sceneType];
}
