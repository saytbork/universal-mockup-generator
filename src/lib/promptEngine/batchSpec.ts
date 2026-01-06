/**
 * BATCH SPECIFICATION
 * 
 * Defines rules for deterministic multi-render generation.
 * 
 * WHAT BATCH DOES:
 * - Takes 1 valid UIState
 * - Produces N valid UIStates with controlled variation
 * - All outputs pass through validateUIState
 * - All outputs pass through deterministicPromptBuilder without ABORT
 * 
 * WHAT BATCH DOES NOT DO:
 * - Does not touch the engine
 * - Does not create new prompts directly
 * - Does not "invent" combinations
 * - Does not bypass validation
 */

import type { SceneType } from './sceneTypes';
import type { UIState } from './uiContractBuilder';
import type { PresetId } from './presets';

// ============================================================================
// VARIATION AXES
// ============================================================================

/**
 * Axes that can vary within a batch.
 * Each axis has discrete allowed values per sceneType.
 */
export type VariationAxis =
    | 'angle'
    | 'distance'
    | 'framing'
    | 'lighting'
    | 'aspectRatio';

/**
 * Allowed values for each variation axis
 */
export const VARIATION_VALUES: Record<VariationAxis, string[]> = {
    angle: ['eye level', 'slight top-down', 'top-down', 'low angle', 'three-quarter'],
    distance: ['close', 'medium-close', 'medium', 'medium-wide', 'wide'],
    framing: ['centered', 'rule of thirds', 'off-center', 'full scene', 'tight crop'],
    lighting: ['natural window light', 'golden hour', 'soft ambient', 'natural soft light', 'indoor ambient'],
    aspectRatio: ['1:1', '4:5', '9:16', '16:9', '3:4']
};

// ============================================================================
// SCENE TYPE BATCH RULES
// ============================================================================

/**
 * Per-sceneType rules for what can vary in a batch
 */
export interface SceneBatchRules {
    maxBatchSize: number;
    allowedAxes: VariationAxis[];
    lockedAxes: VariationAxis[];
    defaultVariations: VariationAxis[];
}

export const SCENE_BATCH_RULES: Record<SceneType, SceneBatchRules> = {
    studio_packshot: {
        maxBatchSize: 6,
        allowedAxes: ['angle', 'distance', 'framing'],
        lockedAxes: ['lighting'],  // Must stay consistent for packshots
        defaultVariations: ['angle', 'framing']
    },
    editorial_product: {
        maxBatchSize: 12,
        allowedAxes: ['angle', 'distance', 'framing', 'lighting', 'aspectRatio'],
        lockedAxes: [],
        defaultVariations: ['angle', 'framing', 'lighting']
    },
    lifestyle_product: {
        maxBatchSize: 8,
        allowedAxes: ['angle', 'distance', 'framing', 'lighting', 'aspectRatio'],
        lockedAxes: [],
        defaultVariations: ['angle', 'lighting']
    },
    ugc_phone: {
        maxBatchSize: 6,
        allowedAxes: ['angle', 'distance', 'framing'],
        lockedAxes: ['lighting'],  // UGC lighting should be consistent
        defaultVariations: ['angle', 'framing']
    },
    ecommerce_blank_space: {
        maxBatchSize: 4,
        allowedAxes: ['aspectRatio'],  // Very limited variation
        lockedAxes: ['angle', 'distance', 'framing', 'lighting'],
        defaultVariations: ['aspectRatio']
    },
    bundle_kit: {
        maxBatchSize: 6,
        allowedAxes: ['angle', 'distance', 'framing'],
        lockedAxes: ['lighting'],
        defaultVariations: ['angle']
    }
};

// ============================================================================
// BATCH SPEC TYPES
// ============================================================================

/**
 * Specification for a batch generation
 */
export interface BatchSpec {
    /** Base UI state (must be valid) */
    baseState: UIState;

    /** Number of renders to generate */
    quantity: number;

    /** Axes to vary (must be in allowedAxes for sceneType) */
    variationAxes: VariationAxis[];

    /** Optional: specific values per axis (otherwise uses all allowed) */
    axisValues?: Partial<Record<VariationAxis, string[]>>;

    /** Optional: preset this batch is based on */
    presetId?: PresetId;
}

/**
 * Result of batch validation
 */
export interface BatchValidation {
    valid: boolean;
    errors: string[];
    warnings: string[];
    effectiveQuantity: number;
}

// ============================================================================
// BATCH SPEC VALIDATION
// ============================================================================

export function validateBatchSpec(spec: BatchSpec): BatchValidation {
    const errors: string[] = [];
    const warnings: string[] = [];

    const sceneType = spec.baseState.sceneType;
    if (!sceneType) {
        errors.push('Base state missing sceneType');
        return { valid: false, errors, warnings, effectiveQuantity: 0 };
    }

    const rules = SCENE_BATCH_RULES[sceneType];

    // Check quantity
    if (spec.quantity < 1) {
        errors.push('Batch quantity must be at least 1');
    }
    if (spec.quantity > rules.maxBatchSize) {
        warnings.push(`Quantity ${spec.quantity} exceeds max ${rules.maxBatchSize} for ${sceneType}, will be clamped`);
    }

    // Check axes
    for (const axis of spec.variationAxes) {
        if (rules.lockedAxes.includes(axis)) {
            errors.push(`Axis "${axis}" is locked for sceneType "${sceneType}"`);
        }
        if (!rules.allowedAxes.includes(axis)) {
            errors.push(`Axis "${axis}" is not allowed for sceneType "${sceneType}"`);
        }
    }

    // Check custom values
    if (spec.axisValues) {
        for (const [axis, values] of Object.entries(spec.axisValues)) {
            const allowedValues = VARIATION_VALUES[axis as VariationAxis];
            for (const value of values) {
                if (!allowedValues.includes(value)) {
                    errors.push(`Value "${value}" is not valid for axis "${axis}"`);
                }
            }
        }
    }

    const effectiveQuantity = Math.min(spec.quantity, rules.maxBatchSize);

    return {
        valid: errors.length === 0,
        errors,
        warnings,
        effectiveQuantity
    };
}

// ============================================================================
// PRESET BATCH RULES
// ============================================================================

/**
 * Per-preset batch configuration overrides
 */
export interface PresetBatchConfig {
    supportsBatch: boolean;
    maxQuantity: number;
    defaultAxes: VariationAxis[];
    lockedAxes: VariationAxis[];
}

export const PRESET_BATCH_CONFIG: Record<PresetId, PresetBatchConfig> = {
    hero_packshot: {
        supportsBatch: true,
        maxQuantity: 6,
        defaultAxes: ['angle', 'framing'],
        lockedAxes: ['lighting']
    },
    quick_studio: {
        supportsBatch: true,
        maxQuantity: 4,
        defaultAxes: ['angle'],
        lockedAxes: ['lighting', 'distance']
    },
    pdp_ecommerce: {
        supportsBatch: true,
        maxQuantity: 4,
        defaultAxes: ['aspectRatio'],
        lockedAxes: ['angle', 'framing', 'lighting']
    },
    lifestyle_hero: {
        supportsBatch: true,
        maxQuantity: 8,
        defaultAxes: ['angle', 'lighting'],
        lockedAxes: []
    },
    ugc_testimonial: {
        supportsBatch: true,
        maxQuantity: 6,
        defaultAxes: ['angle', 'framing'],
        lockedAxes: ['lighting']
    },
    story_ad: {
        supportsBatch: true,
        maxQuantity: 6,
        defaultAxes: ['angle'],
        lockedAxes: ['aspectRatio', 'lighting']
    },
    social_square: {
        supportsBatch: true,
        maxQuantity: 6,
        defaultAxes: ['angle', 'lighting'],
        lockedAxes: ['aspectRatio']
    },
    editorial_flat_lay: {
        supportsBatch: true,
        maxQuantity: 8,
        defaultAxes: ['lighting', 'framing'],
        lockedAxes: ['angle']  // Top-down is locked for flat lay
    },
    premium_editorial: {
        supportsBatch: true,
        maxQuantity: 12,
        defaultAxes: ['angle', 'lighting', 'framing'],
        lockedAxes: []
    },
    bundle_cross_sell: {
        supportsBatch: true,
        maxQuantity: 4,
        defaultAxes: ['angle'],
        lockedAxes: ['lighting', 'framing']
    }
};

export function getPresetBatchConfig(presetId: PresetId): PresetBatchConfig {
    return PRESET_BATCH_CONFIG[presetId];
}
