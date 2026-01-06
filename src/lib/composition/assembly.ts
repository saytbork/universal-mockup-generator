/**
 * PROMPT ASSEMBLY
 * 
 * Final prompt must:
 * - Contain ZERO contradictions
 * - Contain only ONE lighting description
 * - Contain ONE clear composition instruction
 * - Enforce side placement physically
 * - Match aspect ratio behavior visually
 */

import type { ResolvedComposition, CompositionInput, CreationMode, AspectRatio } from './constraints';
import type { ResolvedLighting, LightingInput } from './lighting';
import { resolveComposition, getSidePlacementPrompt } from './constraints';
import { resolveLighting, getLightingPrompt } from './lighting';
import { getModeBehavior, stripForBgReplace, PromptFields } from './modeIsolation';

// ============================================================================
// FULL INPUT
// ============================================================================

export interface FullPromptInput {
    // Composition
    aspectRatio: AspectRatio;
    shotType: CompositionInput['shotType'];
    sidePlacement: CompositionInput['sidePlacement'];
    cameraAngle: CompositionInput['cameraAngle'];
    creationMode: CreationMode;

    // Lighting
    timeOfDay: LightingInput['timeOfDay'];
    lightingStyle: LightingInput['lightingStyle'];

    // Content
    subject?: string;
    product?: string;
    environment?: string;
    pose?: string;
    expression?: string;
}

// ============================================================================
// SHOT TYPE PROMPTS
// ============================================================================

const SHOT_TYPE_PROMPTS: Record<CompositionInput['shotType'], string> = {
    close_up: 'Close-up shot focusing on face and shoulders.',
    portrait: 'Portrait shot from chest up.',
    medium: 'Medium shot from waist up.',
    three_quarter: 'Three-quarter body shot.',
    full_body: 'Full body shot showing entire figure.'
};

// ============================================================================
// CAMERA ANGLE PROMPTS
// ============================================================================

const CAMERA_ANGLE_PROMPTS: Record<CompositionInput['cameraAngle'], string> = {
    eye_level: 'Camera at eye level.',
    slight_high: 'Camera slightly above eye level.',
    slight_low: 'Camera slightly below eye level.',
    bottom_up: 'Low angle camera looking up.',
    top_down: 'High angle camera looking down.'
};

// ============================================================================
// ASSEMBLY PIPELINE
// ============================================================================

export interface AssembledPrompt {
    valid: boolean;
    prompt: string;
    composition: ResolvedComposition;
    lighting: ResolvedLighting;
    overrides: string[];
}

export function assemblePrompt(input: FullPromptInput): AssembledPrompt {
    const overrides: string[] = [];

    // 1. Resolve composition (aspect ratio first)
    const composition = resolveComposition({
        aspectRatio: input.aspectRatio,
        shotType: input.shotType,
        sidePlacement: input.sidePlacement,
        cameraAngle: input.cameraAngle,
        creationMode: input.creationMode
    });
    overrides.push(...composition.overrides);

    // 2. Resolve lighting
    const lighting = resolveLighting({
        timeOfDay: input.timeOfDay,
        lightingStyle: input.lightingStyle
    });
    if (lighting.wasOverridden) {
        overrides.push(`lighting: ${input.lightingStyle} → ${lighting.lightingStyle}`);
    }

    // 3. Get mode behavior
    const modeBehavior = getModeBehavior(input.creationMode);

    // 4. Build prompt parts
    const parts: string[] = [];

    // Subject (always)
    if (input.subject) {
        parts.push(input.subject);
    }

    // Product (always)
    if (input.product) {
        parts.push(`holding ${input.product}`);
    }

    // Pose/Expression (always)
    if (input.pose) {
        parts.push(input.pose);
    }
    if (input.expression) {
        parts.push(input.expression);
    }

    // ONE composition instruction
    parts.push(SHOT_TYPE_PROMPTS[composition.shotType]);
    parts.push(CAMERA_ANGLE_PROMPTS[composition.cameraAngle]);

    // Physical side placement
    parts.push(composition.placementPrompt);

    // ONE lighting description
    parts.push(getLightingPrompt(lighting));

    // Environment (only if allowed by mode)
    if (modeBehavior.includeEnvironment && input.environment) {
        parts.push(`in ${input.environment}`);
    }

    // 5. Validate no contradictions
    const prompt = parts.filter(Boolean).join(' ');
    const valid = validateNoContradictions(prompt);

    return {
        valid,
        prompt,
        composition,
        lighting,
        overrides
    };
}

// ============================================================================
// VALIDATION
// ============================================================================

function validateNoContradictions(prompt: string): boolean {
    // Check for multiple lighting descriptions
    const lightingKeywords = ['light', 'lighting', 'glow', 'flash'];
    let lightingCount = 0;
    for (const kw of lightingKeywords) {
        const matches = prompt.toLowerCase().match(new RegExp(kw, 'g'));
        if (matches) lightingCount += matches.length;
    }

    // Allow up to 2 lighting-related words (one description)
    if (lightingCount > 3) return false;

    // Check for contradicting positions
    if (prompt.includes('left third') && prompt.includes('right third')) return false;
    if (prompt.includes('centered') && prompt.includes('third of the frame')) return false;

    return true;
}
