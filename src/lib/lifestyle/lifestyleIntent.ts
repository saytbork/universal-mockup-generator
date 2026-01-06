/**
 * LIFESTYLE INTENT SYSTEM
 * 
 * Defines creative direction for Lifestyle scenes.
 * Controls which options are available in downstream blocks.
 * 
 * ORDER IN UI:
 * 1. Lifestyle Intent (this block)
 * 2. Product Structure
 * 3. Creator / Person
 * 4. Product Interaction
 * 5. Camera & Framing
 * 6. Environment
 */

// ============================================================================
// LIFESTYLE INTENT TYPES
// ============================================================================

export type LifestyleIntent =
    | 'contextual'   // Product placed naturally in environment
    | 'narrative'    // Action-driven lifestyle moments
    | 'pov';         // First-person perspective

// ============================================================================
// TOOLTIPS
// ============================================================================

export interface IntentTooltip {
    title: string;
    line1: string;
    line2: string;
    line3: string;
}

export const LIFESTYLE_INTENT_TOOLTIPS: Record<LifestyleIntent, IntentTooltip> = {
    contextual: {
        title: 'Contextual Lifestyle',
        line1: 'Product placed naturally in a real environment.',
        line2: 'Calm, clean, trust-focused scenes.',
        line3: 'Best for PDPs, websites, editorial use.'
    },
    narrative: {
        title: 'Narrative Lifestyle',
        line1: 'Action-driven lifestyle moments.',
        line2: 'The product participates in a routine or story.',
        line3: 'Best for ads, campaigns, storytelling.'
    },
    pov: {
        title: 'POV Experience',
        line1: 'First-person perspective.',
        line2: 'Immersive, emotional, ad-first visuals.',
        line3: 'Not suitable for clean ecommerce.'
    }
};

// ============================================================================
// PERSON RULES PER INTENT
// ============================================================================

export interface PersonRules {
    enabled: boolean;
    faceAllowed: boolean;
    identityAllowed: boolean;
    emphasis: 'secondary' | 'primary' | 'implied';
    tooltip: string;
}

export const INTENT_PERSON_RULES: Record<LifestyleIntent, PersonRules> = {
    contextual: {
        enabled: true,
        faceAllowed: true,
        identityAllowed: true,
        emphasis: 'secondary',
        tooltip: 'Person visible but secondary to product and environment.'
    },
    narrative: {
        enabled: true,
        faceAllowed: true,
        identityAllowed: true,
        emphasis: 'primary',
        tooltip: 'Person fully enabled for storytelling.'
    },
    pov: {
        enabled: true,
        faceAllowed: false,
        identityAllowed: false,
        emphasis: 'implied',
        tooltip: 'No face. No identity. Only implied presence through hands.'
    }
};

// ============================================================================
// PRODUCT INTERACTION RULES PER INTENT
// ============================================================================

export type ProductInteraction =
    | 'presenting'
    | 'placed'
    | 'holding'
    | 'using'
    | 'hands_holding_cropped';

export interface InteractionRules {
    allowed: ProductInteraction[];
    default: ProductInteraction;
    tooltip: string;
}

export const INTENT_INTERACTION_RULES: Record<LifestyleIntent, InteractionRules> = {
    contextual: {
        allowed: ['presenting', 'placed'],
        default: 'placed',
        tooltip: 'Product is observed, not actively used.'
    },
    narrative: {
        allowed: ['holding', 'using'],
        default: 'using',
        tooltip: 'Product is part of an action or routine.'
    },
    pov: {
        allowed: ['hands_holding_cropped'],
        default: 'hands_holding_cropped',
        tooltip: 'Hands holding product, cropped first-person view only.'
    }
};

// ============================================================================
// CAMERA RULES PER INTENT
// ============================================================================

export type CameraType =
    | 'dslr_mirrorless'
    | 'cinema'
    | 'smartphone';

export type FramingStyle =
    | 'eye_level_stable'
    | 'medium_framing'
    | 'imperfect_framing';

export interface CameraRules {
    allowedCameras: CameraType[];
    defaultCamera: CameraType;
    framing: FramingStyle;
    tooltip: string;
}

export const INTENT_CAMERA_RULES: Record<LifestyleIntent, CameraRules> = {
    contextual: {
        allowedCameras: ['dslr_mirrorless'],
        defaultCamera: 'dslr_mirrorless',
        framing: 'eye_level_stable',
        tooltip: 'Professional camera, stable framing for clean ecommerce.'
    },
    narrative: {
        allowedCameras: ['dslr_mirrorless', 'cinema'],
        defaultCamera: 'dslr_mirrorless',
        framing: 'medium_framing',
        tooltip: 'Professional or cinematic camera for storytelling.'
    },
    pov: {
        allowedCameras: ['smartphone'],
        defaultCamera: 'smartphone',
        framing: 'imperfect_framing',
        tooltip: 'Smartphone only. Imperfect framing for authenticity.'
    }
};

// ============================================================================
// DEPTH RULES (CRITICAL FOR UGC)
// ============================================================================

export type DepthMode =
    | 'cinematic'      // Background separation, bokeh
    | 'natural'        // Some depth, not extreme
    | 'flat';          // Single plane, no separation

export interface DepthRules {
    mode: DepthMode;
    locked: boolean;
    tooltip: string;
}

export const INTENT_DEPTH_RULES: Record<LifestyleIntent, DepthRules> = {
    contextual: {
        mode: 'natural',
        locked: false,
        tooltip: 'Natural depth with subtle background presence.'
    },
    narrative: {
        mode: 'cinematic',
        locked: false,
        tooltip: 'Cinematic depth for storytelling emphasis.'
    },
    pov: {
        mode: 'flat',
        locked: true,
        tooltip: 'Flat depth locked. POV uses single-plane smartphone optics.'
    }
};

// ============================================================================
// VALIDATION
// ============================================================================

export interface IntentValidationResult {
    valid: boolean;
    errors: string[];
    appliedRules: {
        person: PersonRules;
        interaction: InteractionRules;
        camera: CameraRules;
        depth: DepthRules;
    };
}

export function validateLifestyleIntent(intent: LifestyleIntent): IntentValidationResult {
    return {
        valid: true,
        errors: [],
        appliedRules: {
            person: INTENT_PERSON_RULES[intent],
            interaction: INTENT_INTERACTION_RULES[intent],
            camera: INTENT_CAMERA_RULES[intent],
            depth: INTENT_DEPTH_RULES[intent]
        }
    };
}

// ============================================================================
// UI HELPERS
// ============================================================================

export function getIntentOptions() {
    return [
        { id: 'contextual' as LifestyleIntent, ...LIFESTYLE_INTENT_TOOLTIPS.contextual },
        { id: 'narrative' as LifestyleIntent, ...LIFESTYLE_INTENT_TOOLTIPS.narrative },
        { id: 'pov' as LifestyleIntent, ...LIFESTYLE_INTENT_TOOLTIPS.pov }
    ];
}

export function isInteractionAllowed(intent: LifestyleIntent, interaction: ProductInteraction): boolean {
    return INTENT_INTERACTION_RULES[intent].allowed.includes(interaction);
}

export function isCameraAllowed(intent: LifestyleIntent, camera: CameraType): boolean {
    return INTENT_CAMERA_RULES[intent].allowedCameras.includes(camera);
}
