/**
 * CREATIVITY VALIDATION
 * 
 * Validates CreativeMode against SceneType.
 * Enforces compatibility rules.
 */

import type { CreativeMode } from './schema';
import type { SceneType } from '../premiumStudio/schema';
import { SCENE_CREATIVE_COMPATIBILITY, isCreativeModeCompatible, getDefaultCreativeMode } from './schema';

export interface CreativityValidationResult {
    valid: boolean;
    errors: string[];
    normalizedMode: CreativeMode | null;
}

/**
 * Validate and normalize creative mode for a scene type
 */
export function validateCreativity(
    sceneType: SceneType,
    requestedMode: CreativeMode | null
): CreativityValidationResult {
    const errors: string[] = [];

    // UGC has no creativity
    if (sceneType === 'ugc_phone') {
        if (requestedMode !== null) {
            return {
                valid: true,
                errors: [],
                normalizedMode: null // Force null for UGC
            };
        }
        return {
            valid: true,
            errors: [],
            normalizedMode: null
        };
    }

    // If no mode requested, use default
    if (requestedMode === null) {
        const defaultMode = getDefaultCreativeMode(sceneType);
        return {
            valid: true,
            errors: [],
            normalizedMode: defaultMode
        };
    }

    // Check compatibility
    if (!isCreativeModeCompatible(sceneType, requestedMode)) {
        const allowed = SCENE_CREATIVE_COMPATIBILITY[sceneType];
        const defaultMode = getDefaultCreativeMode(sceneType);

        errors.push(
            `CreativeMode "${requestedMode}" is not compatible with SceneType "${sceneType}". ` +
            `Allowed modes: ${allowed.join(', ')}. Defaulting to "${defaultMode}".`
        );

        return {
            valid: false,
            errors,
            normalizedMode: defaultMode
        };
    }

    // Valid
    return {
        valid: true,
        errors: [],
        normalizedMode: requestedMode
    };
}

/**
 * Check if creativity should be applied
 */
export function shouldApplyCreativity(sceneType: SceneType): boolean {
    return sceneType !== 'ugc_phone';
}

/**
 * Get UI-friendly mode list for a scene type
 */
export interface CreativeModeOption {
    id: CreativeMode;
    name: string;
    description: string;
    isDefault: boolean;
}

export function getCreativeModeOptions(sceneType: SceneType): CreativeModeOption[] {
    if (sceneType === 'ugc_phone') return [];

    const allowed = SCENE_CREATIVE_COMPATIBILITY[sceneType];
    const defaultMode = getDefaultCreativeMode(sceneType);

    const modeLabels: Record<CreativeMode, { name: string; description: string }> = {
        high_end_studio: {
            name: 'High-End Studio',
            description: 'Luxury balance with premium surfaces'
        },
        vibrant_brand_explosion: {
            name: 'Vibrant Brand',
            description: 'Bold energy with high chroma'
        },
        minimal_editorial: {
            name: 'Minimal Editorial',
            description: 'Refined framing with dramatic space'
        },
        natural_organic: {
            name: 'Natural Organic',
            description: 'Earthy authenticity with natural elements'
        },
        scientific_clean: {
            name: 'Scientific Clean',
            description: 'Clinical precision and sterility'
        },
        lifestyle_cinematic: {
            name: 'Lifestyle Cinematic',
            description: 'Aspirational storytelling with depth'
        },
        playful_bold: {
            name: 'Playful Bold',
            description: 'Energetic with confident colors'
        }
    };

    return allowed.map(mode => ({
        id: mode,
        name: modeLabels[mode].name,
        description: modeLabels[mode].description,
        isDefault: mode === defaultMode
    }));
}
