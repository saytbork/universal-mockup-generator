/**
 * PRODUCT STUDIO → PROMPT MAPPER
 * 
 * Maps Product Studio state to prompt engine input.
 * Enforces constraints and applies silent overrides.
 */

import type { ProductStudioState } from './state';
import { PRODUCT_STUDIO_ENVIRONMENTS } from './state';
import { injectCreativity } from '../creativity';
import { resolveComposition, resolveLighting, assemblePrompt } from '../composition';
import { CREATIVE_MODES } from '../creativity/modes';

// ============================================================================
// PROMPT GENERATION
// ============================================================================

export interface ProductStudioPromptResult {
    prompt: string;
    negativePrompt: string;
    overrides: string[];
    valid: boolean;
}

export function mapProductStudioToPrompt(
    state: ProductStudioState,
    productDescription: string
): ProductStudioPromptResult {
    const overrides: string[] = [];

    // 1. Get creative mode configuration
    const creativeConfig = CREATIVE_MODES[state.creativeMode];
    const creativityInjection = injectCreativity(state.creativeMode);

    // 2. Resolve composition with constraints
    const composition = resolveComposition({
        aspectRatio: state.aspectRatio,
        shotType: state.cameraShot,
        sidePlacement: state.sidePlacement,
        cameraAngle: state.cameraAngle,
        creationMode: 'product_studio'
    });
    overrides.push(...composition.overrides);

    // 3. Resolve lighting with time-of-day validation
    const lighting = resolveLighting({
        timeOfDay: state.timeOfDay,
        lightingStyle: state.lightingStyle
    });
    if (lighting.wasOverridden) {
        overrides.push(`lighting: ${state.lightingStyle} → ${lighting.lightingStyle}`);
    }

    // 4. Get environment prompt
    const envConfig = PRODUCT_STUDIO_ENVIRONMENTS.find(e => e.id === state.environment);
    const environmentPrompt = envConfig?.prompt || 'clean studio background';

    // 5. Build commercial composition prompt
    const compositionPrompt = getCommercialCompositionPrompt(state.commercialComposition, state.productCount);

    // 6. Assemble main prompt
    const parts: string[] = [];

    // Product description
    parts.push(`Professional product photography of ${productDescription}.`);

    // Composition
    parts.push(compositionPrompt);

    // HARD ENFORCEMENT: Side Placement (NON-NEGOTIABLE)
    if (composition.sidePlacement !== 'center') {
        const side = composition.sidePlacement;
        const opposite = side === 'left' ? 'right' : 'left';
        parts.push(`SUBJECT ANCHORING (NON-NEGOTIABLE): Subject must be positioned strictly in the ${side} third of the frame. Center placement is forbidden. ${opposite.charAt(0).toUpperCase() + opposite.slice(1)} side must remain clean negative space reserved for copy.`);
    } else {
        parts.push(composition.placementPrompt);
    }

    // Environment
    parts.push(`Set against ${environmentPrompt}.`);

    // Lighting (single description)
    const lightingDesc = getLightingDescription(lighting.lightingStyle);
    parts.push(lightingDesc);

    // Art direction injection
    parts.push(creativityInjection.compositionDirective);
    parts.push(creativityInjection.energyDirective);
    parts.push(creativityInjection.brandDirective);

    // HARD ENFORCEMENT: No hands for Product Studio
    parts.push('HANDS CONSTRAINT: No hands. No fingers. No human elements. Product only.');

    // 7. Build negative prompt
    const negativePrompt = buildNegativePrompt(state.creativeMode);

    // 8. Validate final prompt
    const finalPrompt = parts.join(' ');
    const valid = !finalPrompt.toLowerCase().includes('person holding');

    return {
        prompt: finalPrompt,
        negativePrompt,
        overrides,
        valid
    };
}

// ============================================================================
// HELPERS
// ============================================================================

function getCommercialCompositionPrompt(
    composition: ProductStudioState['commercialComposition'],
    productCount: number
): string {
    switch (composition) {
        case 'hero_product':
            return 'Single hero product as the sole visual focus. Maximum impact and clarity.';
        case 'duo_offer':
            return `Two products arranged with clear hierarchy. Primary product prominent, secondary product supporting.`;
        case 'routine_system':
            return `${productCount} products arranged as a routine system with enforced visual hierarchy and step-based layout.`;
    }
}

function getLightingDescription(style: string): string {
    const descriptions: Record<string, string> = {
        natural_light: 'Soft, even natural lighting.',
        sunny_day: 'Bright, direct lighting with clean shadows.',
        overcast: 'Soft, diffused lighting without harsh shadows.',
        golden_hour: 'Warm, golden-toned lighting.',
        mood_lighting: 'Atmospheric mood lighting.',
        cozy_indoors: 'Warm ambient indoor lighting.',
        night_mode: 'Low-light capture.',
        flash_photo: 'Direct flash lighting.',
        ring_light: 'Even ring light illumination.'
    };
    return descriptions[style] || 'Professional studio lighting.';
}

function buildNegativePrompt(creativeMode: string): string {
    const base = [
        'hands',
        'fingers',
        'people',
        'faces',
        'text',
        'watermarks',
        'logos',
        'low quality',
        'blurry',
        'amateur photography'
    ];

    // Add mode-specific negatives
    if (creativeMode === 'minimal_editorial') {
        base.push('clutter', 'busy background', 'multiple props');
    }
    if (creativeMode === 'scientific_clean') {
        base.push('organic elements', 'warm tones', 'lifestyle');
    }

    return base.join(', ');
}
