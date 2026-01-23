/**
 * BATCH EXPANDER
 * 
 * Takes 1 valid UIState and expands it to N valid UIStates
 * with controlled variation along specified axes.
 * 
 * All outputs are guaranteed to pass validateUIState.
 */

import type { UIState } from './uiContractBuilder';
import { validateUIState } from './uiContractBuilder';
import type {
    BatchSpec,
    VariationAxis
} from './batchSpec';
import {
    VARIATION_VALUES,
    SCENE_BATCH_RULES,
    validateBatchSpec,
    PRESET_BATCH_CONFIG
} from './batchSpec';
import type { PresetId } from './presets';

// ============================================================================
// GALLERY ITEM (output of batch expansion)
// ============================================================================

export interface GalleryItem {
    /** Unique ID for this render */
    id: string;

    /** Batch this belongs to */
    batchId: string;

    /** Index in batch (0-based) */
    index: number;

    /** The expanded UIState */
    uiState: UIState;

    /** What changed from base */
    deltas: Record<VariationAxis, string>;

    /** Original preset (if any) */
    presetId?: PresetId;

    /** Timestamp */
    createdAt: number;
}

export interface BatchResult {
    batchId: string;
    baseState: UIState;
    items: GalleryItem[];
    variationAxes: VariationAxis[];
    createdAt: number;
}

// ============================================================================
// BATCH EXPANDER
// ============================================================================

function generateId(): string {
    return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Generate all combinations for given axes and values
 */
function generateCombinations(
    axes: VariationAxis[],
    axisValues: Record<VariationAxis, string[]>
): Record<VariationAxis, string>[] {
    if (axes.length === 0) return [{} as Record<VariationAxis, string>];

    const [first, ...rest] = axes;
    const values = axisValues[first] || VARIATION_VALUES[first];
    const restCombinations = generateCombinations(rest, axisValues);

    const result: Record<VariationAxis, string>[] = [];
    for (const value of values) {
        for (const restCombo of restCombinations) {
            result.push({ ...restCombo, [first]: value });
        }
    }

    return result;
}

/**
 * Apply deltas to base UIState
 */
function applyDeltas(
    base: UIState,
    deltas: Record<VariationAxis, string>
): UIState {
    const result = { ...base };

    if (deltas.angle) result.angle = deltas.angle;
    if (deltas.distance) result.distance = deltas.distance;
    if (deltas.framing) result.framing = deltas.framing;
    if (deltas.lighting) result.lighting = deltas.lighting;
    if (deltas.aspectRatio) result.aspectRatio = deltas.aspectRatio;

    return result;
}

/**
 * Expand a batch specification into gallery items
 */
export function expandBatch(spec: BatchSpec): BatchResult {
    const validation = validateBatchSpec(spec);

    if (!validation.valid) {
        throw new Error(`Invalid batch spec: ${validation.errors.join(', ')}`);
    }

    const batchId = generateId();
    const sceneType = spec.baseState.sceneType!;
    const rules = SCENE_BATCH_RULES[sceneType];

    // Get effective axis values
    const axisValues: Record<VariationAxis, string[]> = {} as any;
    for (const axis of spec.variationAxes) {
        axisValues[axis] = spec.axisValues?.[axis] || VARIATION_VALUES[axis];
    }

    // Generate all combinations
    const allCombinations = generateCombinations(spec.variationAxes, axisValues);

    // Limit to requested quantity
    const effectiveQuantity = Math.min(
        spec.quantity,
        rules.maxBatchSize,
        allCombinations.length
    );

    // Select combinations (deterministic: first N)
    const selectedCombinations = allCombinations.slice(0, effectiveQuantity);

    // Create gallery items
    const items: GalleryItem[] = selectedCombinations.map((deltas, index) => {
        const uiState = applyDeltas(spec.baseState, deltas);

        // Validate each expanded state
        const stateValidation = validateUIState(uiState);
        if (!stateValidation.valid) {
            throw new Error(`Expanded state ${index} invalid: ${stateValidation.errors.join(', ')}`);
        }

        return {
            id: generateId(),
            batchId,
            index,
            uiState,
            deltas,
            presetId: spec.presetId,
            createdAt: Date.now()
        };
    });

    return {
        batchId,
        baseState: spec.baseState,
        items,
        variationAxes: spec.variationAxes,
        createdAt: Date.now()
    };
}

// ============================================================================
// BATCH HELPERS
// ============================================================================

/**
 * Create a batch spec from a preset with default variations
 */
export function createBatchFromPreset(
    presetId: PresetId,
    baseState: UIState,
    quantity: number
): BatchSpec {
    const config = PRESET_BATCH_CONFIG[presetId];

    if (!config.supportsBatch) {
        throw new Error(`Preset "${presetId}" does not support batch generation`);
    }

    const effectiveQuantity = Math.min(quantity, config.maxQuantity);

    return {
        baseState,
        quantity: effectiveQuantity,
        variationAxes: config.defaultAxes,
        presetId
    };
}

/**
 * Get maximum batch size for a preset
 */
export function getMaxBatchSize(presetId: PresetId): number {
    return PRESET_BATCH_CONFIG[presetId].maxQuantity;
}

/**
 * Check if a preset supports batching
 */
export function presetSupportsBatch(presetId: PresetId): boolean {
    return PRESET_BATCH_CONFIG[presetId].supportsBatch;
}

/**
 * Get available variation axes for a preset
 */
export function getAvailableAxes(presetId: PresetId): VariationAxis[] {
    const config = PRESET_BATCH_CONFIG[presetId];
    const allAxes: VariationAxis[] = ['angle', 'distance', 'framing', 'lighting', 'aspectRatio'];
    return allAxes.filter(axis => !config.lockedAxes.includes(axis));
}
