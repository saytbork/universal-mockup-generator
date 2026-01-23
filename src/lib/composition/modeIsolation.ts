/**
 * CREATION MODE ISOLATION
 * 
 * When creationMode = bg_replace:
 * - No environment
 * - No room
 * - No timeOfDay storytelling
 * - No lifestyle clutter
 * 
 * Lifestyle becomes POSE + EXPRESSION ONLY.
 */

import type { CreationMode } from './constraints';

// ============================================================================
// BG-REPLACE STRIPPED FIELDS
// ============================================================================

export const BG_REPLACE_STRIPPED = [
    'environment',
    'room',
    'timeOfDay',
    'location',
    'setting',
    'scene',
    'atmosphere',
    'lifestyle_context',
    'domestic_clutter',
    'background_description'
];

// ============================================================================
// ALLOWED IN BG-REPLACE
// ============================================================================

export const BG_REPLACE_ALLOWED = [
    'subject',
    'product',
    'pose',
    'expression',
    'clothing',
    'placement',
    'shotType',
    'cameraAngle',
    'background_color',
    'background_neutral'
];

// ============================================================================
// STRIP FUNCTION
// ============================================================================

export interface PromptFields {
    [key: string]: string | undefined;
}

export function stripForBgReplace(fields: PromptFields): PromptFields {
    const result: PromptFields = {};

    for (const [key, value] of Object.entries(fields)) {
        if (!BG_REPLACE_STRIPPED.includes(key)) {
            result[key] = value;
        }
    }

    return result;
}

// ============================================================================
// MODE CHECK
// ============================================================================

export function shouldStripEnvironment(mode: CreationMode): boolean {
    return mode === 'bg_replace';
}

export function getModeBehavior(mode: CreationMode): {
    includeEnvironment: boolean;
    includeTimeOfDay: boolean;
    includeLifestyleContext: boolean;
    compositonOnly: boolean;
} {
    switch (mode) {
        case 'bg_replace':
            return {
                includeEnvironment: false,
                includeTimeOfDay: false,
                includeLifestyleContext: false,
                compositonOnly: true
            };
        case 'product_studio':
            return {
                includeEnvironment: false,
                includeTimeOfDay: false,
                includeLifestyleContext: false,
                compositonOnly: false
            };
        case 'lifestyle_ugc':
        default:
            return {
                includeEnvironment: true,
                includeTimeOfDay: true,
                includeLifestyleContext: true,
                compositonOnly: false
            };
    }
}
