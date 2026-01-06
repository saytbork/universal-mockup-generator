/**
 * HAND RULES & HUMAN PRESENCE
 * 
 * Critical rules for hands and human presence per SceneType.
 * This prevents plastic hands, unnatural poses, and mode contamination.
 */

import type { SceneType } from '../premiumStudio/schema';
import type { CreativeMode } from './schema';

// ============================================================================
// HAND & HUMAN POLICY TYPES
// ============================================================================

export type HandPolicy =
    | 'forbidden'           // Never show hands
    | 'secondary_sculptural' // Only as secondary, sculptural element
    | 'natural_real'        // Real, natural, with texture and imperfections
    | 'required_imperfect'; // Must be present, must have imperfections

export type HumanPolicy =
    | 'forbidden'           // No humans at all
    | 'partial_only'        // Hands/arms only, no face
    | 'allowed_secondary'   // Can appear but not protagonist
    | 'required_authentic'; // Must be present, must look real

export interface HumanPresenceRules {
    hands: HandPolicy;
    humans: HumanPolicy;
    handRequirements: string[];
    humanRequirements: string[];
    forbidden: string[];
}

// ============================================================================
// SCENE TYPE HUMAN RULES
// ============================================================================

export const SCENE_HUMAN_RULES: Record<SceneType, HumanPresenceRules> = {
    studio_branding: {
        hands: 'forbidden',
        humans: 'forbidden',
        handRequirements: [],
        humanRequirements: [],
        forbidden: [
            'hands', 'fingers', 'arms', 'people', 'faces',
            'body parts', 'human silhouettes', 'skin'
        ]
    },

    editorial_product: {
        hands: 'secondary_sculptural',
        humans: 'forbidden',
        handRequirements: [
            'If hands present: sculptural, elegant, not grasping',
            'If hands present: soft focus, secondary to product',
            'If hands present: clean nails, neutral skin tone'
        ],
        humanRequirements: [],
        forbidden: [
            'full humans', 'faces', 'posed hands', 'grabbing hands',
            'plastic looking hands', 'unrealistic skin'
        ]
    },

    lifestyle_real: {
        hands: 'natural_real',
        humans: 'partial_only',
        handRequirements: [
            'Natural skin texture visible',
            'Realistic lighting on skin',
            'Hands doing something natural: using, preparing, applying',
            'Never "holding for camera"',
            'Imperfections acceptable: veins, freckles, nail variations'
        ],
        humanRequirements: [
            'No face as main subject',
            'Arms/hands only for interaction',
            'Natural, unposed positioning'
        ],
        forbidden: [
            'plastic hands', 'mannequin hands', 'posed grip',
            'face as protagonist', 'model pose', 'camera-aware pose'
        ]
    },

    ugc_phone: {
        hands: 'required_imperfect',
        humans: 'required_authentic',
        handRequirements: [
            'MUST have visible imperfections',
            'Real skin texture mandatory',
            'Natural nail state (not perfect manicure)',
            'Authentic grip, not product-photography grip',
            'Phone-camera quality hand rendering'
        ],
        humanRequirements: [
            'Person must feel real, not model',
            'Casual, authentic positioning',
            'May or may not show face',
            'Natural clothing/accessories acceptable'
        ],
        forbidden: [
            'perfect hands', 'studio-lit skin', 'mannequin quality',
            'posed product photography', 'timestamps', 'UI overlays',
            'app watermarks', 'screenshot aesthetic'
        ]
    },

    bundle_hero: {
        hands: 'forbidden',
        humans: 'forbidden',
        handRequirements: [],
        humanRequirements: [],
        forbidden: [
            'hands', 'people', 'human elements',
            'anything that competes with product hierarchy'
        ]
    }
};

// ============================================================================
// CREATIVE MODE HAND OVERRIDES
// ============================================================================

export interface CreativeModeHandOverride {
    allowHands: boolean;
    handNote: string;
}

export const CREATIVE_MODE_HAND_RULES: Record<CreativeMode, CreativeModeHandOverride> = {
    high_end_studio: {
        allowHands: false,
        handNote: 'High-end studio mode prioritizes product hero. No hands.'
    },
    vibrant_brand_explosion: {
        allowHands: false,
        handNote: 'Vibrant brand mode is about color and energy, not human interaction.'
    },
    minimal_editorial: {
        allowHands: false,
        handNote: 'Minimal editorial focuses on negative space and product. Hands break purity.'
    },
    natural_organic: {
        allowHands: true,
        handNote: 'May include hands if natural and interacting with product organically.'
    },
    scientific_clean: {
        allowHands: false,
        handNote: 'Scientific mode requires clinical sterility. No human elements.'
    },
    lifestyle_cinematic: {
        allowHands: true,
        handNote: 'Hands welcomed for storytelling. Must be natural, cinematic quality.'
    },
    playful_bold: {
        allowHands: false,
        handNote: 'Playful mode is about visual energy, not human presence.'
    }
};

// ============================================================================
// HAND DIRECTIVE GENERATION
// ============================================================================

export function buildHandDirective(
    sceneType: SceneType,
    creativeMode: CreativeMode | null
): string {
    const sceneRules = SCENE_HUMAN_RULES[sceneType];
    const modeOverride = creativeMode ? CREATIVE_MODE_HAND_RULES[creativeMode] : null;

    const parts: string[] = [];

    // Policy
    const policyMap: Record<HandPolicy, string> = {
        forbidden: 'HANDS: Strictly forbidden. No hands, fingers, or arm elements in frame.',
        secondary_sculptural: 'HANDS: Only if absolutely necessary, and only as elegant, secondary, sculptural elements. Never grasping or posed.',
        natural_real: 'HANDS: If present, must be natural and real. Visible skin texture, realistic lighting, natural interaction.',
        required_imperfect: 'HANDS: Required. Must show imperfections: real skin texture, natural nails, authentic grip.'
    };
    parts.push(policyMap[sceneRules.hands]);

    // Human policy
    const humanMap: Record<HumanPolicy, string> = {
        forbidden: 'HUMANS: No human presence whatsoever.',
        partial_only: 'HUMANS: Partial only (hands/arms). No face as protagonist.',
        allowed_secondary: 'HUMANS: May appear as secondary element, not protagonist.',
        required_authentic: 'HUMANS: Required. Must look authentic, not model-perfect.'
    };
    parts.push(humanMap[sceneRules.humans]);

    // Requirements
    if (sceneRules.handRequirements.length > 0) {
        parts.push(`Hand requirements: ${sceneRules.handRequirements.join('. ')}`);
    }

    // Forbidden
    if (sceneRules.forbidden.length > 0) {
        parts.push(`AVOID: ${sceneRules.forbidden.join(', ')}`);
    }

    // Mode override note
    if (modeOverride && !modeOverride.allowHands) {
        parts.push(`Creative mode note: ${modeOverride.handNote}`);
    }

    return parts.join('\n');
}

// ============================================================================
// VALIDATION
// ============================================================================

export function canHaveHands(sceneType: SceneType, creativeMode: CreativeMode | null): boolean {
    const sceneRules = SCENE_HUMAN_RULES[sceneType];
    const modeRules = creativeMode ? CREATIVE_MODE_HAND_RULES[creativeMode] : null;

    // Scene must allow hands
    if (sceneRules.hands === 'forbidden') return false;

    // Mode must also allow hands (if creative mode is set)
    if (modeRules && !modeRules.allowHands) return false;

    return true;
}

export function getHandPolicy(sceneType: SceneType): HandPolicy {
    return SCENE_HUMAN_RULES[sceneType].hands;
}
