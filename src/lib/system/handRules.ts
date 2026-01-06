/**
 * HAND RULES — FINAL VERSION
 * 
 * Critical enforcement per scene type and intent.
 */

import type { SceneType } from '../premiumStudio/schema';
import type { LifestyleIntent } from '../lifestyle/lifestyleIntent';

// ============================================================================
// HAND POLICY
// ============================================================================

export type HandPermission =
    | 'forbidden'           // Never
    | 'secondary_only'      // Only if subtle, not protagonist
    | 'natural_real'        // Natural, with texture/imperfections
    | 'single_cropped';     // One hand only, cropped POV

export interface HandRules {
    permission: HandPermission;
    maxHands: 0 | 1 | 2;
    imperfectionsRequired: boolean;
    tooltip: string;
}

// ============================================================================
// SCENE TYPE RULES
// ============================================================================

export const SCENE_HAND_RULES: Record<SceneType, HandRules> = {
    studio_branding: {
        permission: 'forbidden',
        maxHands: 0,
        imperfectionsRequired: false,
        tooltip: 'Studio branding does not include hands. Product is sole hero.'
    },
    editorial_product: {
        permission: 'secondary_only',
        maxHands: 1,
        imperfectionsRequired: false,
        tooltip: 'Hands may appear as sculptural elements, never grasping or posed.'
    },
    lifestyle_real: {
        permission: 'natural_real',
        maxHands: 2,
        imperfectionsRequired: true,
        tooltip: 'Hands must be natural and real. Visible texture, realistic lighting.'
    },
    ugc_phone: {
        permission: 'single_cropped',
        maxHands: 1,
        imperfectionsRequired: true,
        tooltip: 'One hand only. Real imperfections mandatory. No plastic hands.'
    },
    bundle_hero: {
        permission: 'forbidden',
        maxHands: 0,
        imperfectionsRequired: false,
        tooltip: 'Bundle compositions do not include hands. Products define hierarchy.'
    }
};

// ============================================================================
// LIFESTYLE INTENT OVERRIDES
// ============================================================================

export const INTENT_HAND_RULES: Record<LifestyleIntent, Partial<HandRules>> = {
    contextual: {
        permission: 'secondary_only',
        maxHands: 1
    },
    narrative: {
        permission: 'natural_real',
        maxHands: 2
    },
    pov: {
        permission: 'single_cropped',
        maxHands: 1,
        imperfectionsRequired: true
    }
};

// ============================================================================
// HELPERS
// ============================================================================

export function getHandRules(
    sceneType: SceneType,
    lifestyleIntent?: LifestyleIntent
): HandRules {
    const baseRules = SCENE_HAND_RULES[sceneType];

    if (sceneType === 'lifestyle_real' && lifestyleIntent) {
        const intentOverride = INTENT_HAND_RULES[lifestyleIntent];
        return {
            ...baseRules,
            ...intentOverride
        };
    }

    return baseRules;
}

export function areHandsAllowed(
    sceneType: SceneType,
    lifestyleIntent?: LifestyleIntent
): boolean {
    const rules = getHandRules(sceneType, lifestyleIntent);
    return rules.permission !== 'forbidden';
}

export const HANDS_CORRECTIVE_TOOLTIP =
    'Hands are allowed only when they reinforce realism, not staging.';
