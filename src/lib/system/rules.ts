/**
 * SYSTEM RULES — PERFECT MOCKUP
 * 
 * This file defines the central authority and hierarchy rules.
 * ALL modules must respect these rules.
 * 
 * PRINCIPLE: Creativity is the brain, not decoration.
 * GOAL: Every image must look like it was made by a top agency.
 */

import type { SceneType } from '../premiumStudio/schema';
import type { CreativeMode } from '../creativity/schema';
import type { LifestyleIntent } from '../lifestyle/lifestyleIntent';

// ============================================================================
// CREATIVE AUTHORITY (INTERNAL CONCEPT)
// ============================================================================

export type CreativeAuthority =
    | 'system_led'      // Product Studio: System controls creativity
    | 'collaborative'   // Lifestyle Narrative: User + System
    | 'system_enforced'; // UGC: System enforces realism, no creativity

export const SCENE_CREATIVE_AUTHORITY: Record<SceneType, CreativeAuthority> = {
    studio_branding: 'system_led',
    editorial_product: 'system_led',
    lifestyle_real: 'collaborative',
    ugc_phone: 'system_enforced',
    bundle_hero: 'system_led'
};

// ============================================================================
// LIFESTYLE INTENT → CREATIVITY MATRIX (MANDATORY)
// ============================================================================

export const LIFESTYLE_CREATIVITY_MATRIX: Record<LifestyleIntent, CreativeMode[] | null> = {
    contextual: ['natural_organic', 'minimal_editorial'],
    narrative: ['lifestyle_cinematic', 'high_end_studio'],
    pov: null // BLOCKED - POV = no creativity
};

export function getCreativityForLifestyleIntent(
    intent: LifestyleIntent
): { allowed: CreativeMode[] | null; blocked: boolean; defaultMode: CreativeMode | null } {
    const allowed = LIFESTYLE_CREATIVITY_MATRIX[intent];

    if (allowed === null) {
        return {
            allowed: null,
            blocked: true,
            defaultMode: null
        };
    }

    return {
        allowed,
        blocked: false,
        defaultMode: allowed[0]
    };
}

// ============================================================================
// PRODUCT STUDIO DEFAULTS (SYSTEM-LED)
// ============================================================================

export const PRODUCT_STUDIO_DEFAULTS = {
    creativeMode: 'high_end_studio' as CreativeMode,
    creativityVisible: true,
    creativityEditable: true
};

// ============================================================================
// UGC RULES (SYSTEM-ENFORCED)
// ============================================================================

export const UGC_SYSTEM_RULES = {
    creativity: null,
    creativityVisible: false,
    creativityEditable: false,
    depth: 'flat' as const,
    camera: 'smartphone' as const,
    lighting: 'ambient' as const,
    professionalControlsLocked: true
};

export const UGC_VALIDATION_RULE =
    'If it looks professional, it is not UGC.';

// ============================================================================
// BLOCK ORDER — PRODUCT STUDIO
// ============================================================================

export const PRODUCT_STUDIO_BLOCK_ORDER = [
    'creativity',           // Art Direction (always first, always visible)
    'commercial_composition', // Hero/Duo/Routine (renamed from Product Structure)
    'environment',          // Abstract/Studio/Editorial only
    'lighting',
    'camera_framing',
    'output_format'
];

// ============================================================================
// BLOCK ORDER — LIFESTYLE
// ============================================================================

export const LIFESTYLE_BLOCK_ORDER = [
    'lifestyle_intent',     // Contextual/Narrative/POV
    'commercial_composition', // Product grouping
    'creator_person',       // Conditional per intent
    'product_interaction',  // Conditional per intent
    'environment',
    'camera_framing',       // Conditional per intent
    'output_format'
];

// ============================================================================
// CORRECTIVE TOOLTIPS
// ============================================================================

export const CORRECTIVE_TOOLTIPS = {
    creativity: {
        block: 'This defines how your product looks, not where it is.',
        ugc_hidden: 'UGC does not use art direction. If it looks intentional, it is not UGC.'
    },

    lighting: {
        block: 'Lighting simulates realism. It does not increase quality or polish.'
    },

    hands: {
        block: 'Hands are allowed only when they reinforce realism, not staging.'
    },

    ugc: {
        global: 'If it looks professional, it is not UGC.',
        depth: 'UGC uses flat depth. Any background separation breaks authenticity.'
    },

    commercial_composition: {
        hero: 'Optimized for PDP hero images and ads.',
        duo: 'Designed for bundles and cross-sells.',
        routine: 'Multi-step systems with enforced visual hierarchy.'
    }
};

// ============================================================================
// VISIBILITY RULES
// ============================================================================

export interface BlockVisibility {
    visible: boolean;
    editable: boolean;
    reason?: string;
}

export function getCreativityVisibility(
    sceneType: SceneType,
    lifestyleIntent?: LifestyleIntent
): BlockVisibility {
    // UGC → hidden
    if (sceneType === 'ugc_phone') {
        return {
            visible: false,
            editable: false,
            reason: CORRECTIVE_TOOLTIPS.creativity.ugc_hidden
        };
    }

    // POV → hidden
    if (lifestyleIntent === 'pov') {
        return {
            visible: false,
            editable: false,
            reason: 'POV mode uses authentic capture. Art direction is disabled.'
        };
    }

    // Product Studio → always visible and active
    if (sceneType === 'studio_branding' || sceneType === 'editorial_product' || sceneType === 'bundle_hero') {
        return {
            visible: true,
            editable: true
        };
    }

    // Lifestyle (non-POV) → visible
    return {
        visible: true,
        editable: true
    };
}

// ============================================================================
// QUALITY TEST (INTERNAL RULE)
// ============================================================================

export const QUALITY_TEST =
    'Every image must look like it was created by a top agency with a senior photographer and art director, not by AI.';
