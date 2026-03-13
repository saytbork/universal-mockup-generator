/**
 * PRODUCT MODE PROMPT MAPPER
 * Stage 10 - Product Mode Vocabulary Injection
 * 
 * This mapper is EXCLUSIVELY for Product Mode.
 * It injects ONLY product-safe vocabulary.
 * NO UGC terminology allowed.
 */

import type { Step3Values } from '@/types/step3Types';
import type { PromptOptions } from './types';

/**
 * Product Mode vocabulary - NEVER use UGC terms
 */
const PRODUCT_VOCABULARY = {
    // Forbidden terms (never inject these)
    FORBIDDEN: [
        'selfie',
        'candid',
        'real life mess',
        'phone camera',
        'ugc',
        'creator',
        'person',
        'face',
        'emotion'
    ]
};

const PRODUCT_VIEW_DESCRIPTIONS: Record<Step3Values['productViewPreset'], string> = {
    front: 'Front-facing product shot, camera aligned straight-on.',
    top: 'Top-down product shot, camera positioned directly above.',
    perspective45: 'Three-quarter product view, rotated approximately 45 degrees.',
    highAngle: 'High-angle product shot, camera positioned above the product.',
    lowAngle: 'Low-angle product shot, camera positioned below the product.',
    detail: 'Close-up detail shot focusing on label or material texture.',
    backSide: 'Back-side product view showing the profile and edges.'
};

const PRODUCT_COMPOSITION_DESCRIPTIONS: Record<Step3Values['productCompositionPreset'], string> = {
    cleanStudio: 'Clean studio composition with minimal props and controlled framing.',
    editorialFlatLay: 'Editorial flat lay composition with precise item arrangement.',
    ingredientStory: 'Editorial composition including ingredient props to suggest formulation.',
    abstractBenefit: 'Abstract visual elements used to suggest product benefit without literal ingredients.',
    routineBundle: 'Routine bundle shot showing multiple products organized as a set.'
};

const PRODUCT_TYPE_INGREDIENT_HINTS: Partial<Record<NonNullable<Step3Values['productType']>, string>> = {
    capsules: 'Use supporting ingredient props that feel native to capsule supplements, such as open capsules, powder traces, or formulation materials arranged around the product.',
    gummies: 'Use supporting ingredient props that feel native to gummy supplements, such as gummies, fruit cues, or formulation materials arranged around the product.',
    drops: 'Use supporting ingredient props that feel native to liquid drops, such as droppers, liquid droplets, or formulation materials arranged around the product.',
    powder: 'Use supporting ingredient props that feel native to powders, such as scoops, powder texture, or formulation materials arranged around the product.',
    skincare: 'Use supporting ingredient props that feel native to skincare, such as cream texture, botanical elements, or formulation materials arranged around the product.',
    device: 'Use supporting props that explain the device context without introducing unrelated lifestyle clutter.',
    custom: 'Use supporting ingredient or formulation props arranged around the product.'
};

const ALIGNMENT_DESCRIPTIONS: Record<Step3Values['ecommerceAlignment'], string> = {
    left: 'Position the product toward the left side of the frame.',
    center: 'Center the product within the frame.',
    right: 'Position the product toward the right side of the frame.'
};

const ENVIRONMENT_DESCRIPTIONS: Record<Step3Values['productEnvironment'], string> = {
    solidColor: 'Solid color background suitable for ecommerce product photography.',
    softGradient: 'Soft gradient background with subtle tonal transitions.',
    studioSeamless: 'Seamless studio background with clean edges.',
    realSurface: 'Real surface background resembling a counter or shelf with texture.'
};

const INTERACTION_DESCRIPTIONS: Record<NonNullable<Step3Values['productInteractionEditorial']>, string> = {
    none: 'Product only, no hands or human elements.',
    handsHolding: 'Editorial hands holding the product, no faces visible.',
    handsOpening: 'Hands opening the product in a controlled editorial setup.',
    handsPlacing: 'Hands placing the product on a surface, editorial style.'
};

const LIGHTING_DESCRIPTIONS: Record<Step3Values['productLighting'], string> = {
    softStudio: 'Soft, diffused studio lighting for product clarity.',
    naturalWindow: 'Natural window-like lighting without lifestyle context.',
    controlledDirectional: 'Controlled directional lighting to emphasize form and texture.'
};

const OUTPUT_FORMAT_DESCRIPTIONS: Record<Step3Values['productOutputFormat'], string> = {
    '1x1': 'Square output framing (1:1 aspect ratio).',
    '4x5': 'Vertical output framing (4:5 aspect ratio).',
    '16x9': 'Landscape output framing (16:9 aspect ratio).'
};

/**
 * Map Product Mode state to PromptOptions
 * RULES:
 * - Only inject Product vocabulary
 * - Never inject UGC terms
 * - Never reference people/faces/emotions
 */
export function mapProductModeToPromptOptions(
    sceneState: Step3Values,
    existingOptions: Partial<PromptOptions> = {}
): Partial<PromptOptions> {
    console.log('[PRODUCT MODE MAP INPUT]', sceneState);

    if (!sceneState.productViewPreset) {
        throw new Error('Product View selection is required when Product Mode is enabled.');
    }
    if (!sceneState.productCompositionPreset) {
        throw new Error('Product Composition preset is required when Product Mode is enabled.');
    }

    const mapped: Partial<PromptOptions> = { ...existingOptions };

    const interactionSelection = sceneState.productInteractionEditorial ?? 'none';
    if (
        existingOptions.productAssets &&
        existingOptions.productAssets.length > 1 &&
        interactionSelection !== 'none'
    ) {
        throw new Error('Hands-based interactions are blocked when multiple product assets are present.');
    }

    // Force Product Mode flags
    mapped.contentStyle = 'product';
    mapped.creationMode = 'studio'; // Product mode uses studio creation mode
    mapped.personIncluded = false;
    mapped.productMode = true;
    mapped.personDetails = undefined;
    mapped.identityLock = undefined;
    mapped.gender = undefined;
    mapped.ethnicity = undefined;
    mapped.skinTone = undefined;
    mapped.hairColor = undefined;
    mapped.hairStyle = undefined;
    mapped.personPose = undefined;
    mapped.personMood = undefined;
    mapped.personAppearance = undefined;
    mapped.microLocation = undefined;
    mapped.selfieMode = undefined;
    mapped.selfieType = undefined;
    mapped.eyeDirection = undefined;
    mapped.ugcRealModeActive = false;
    mapped.realModeActive = false;
    mapped.ugcCaptureSituation = undefined;
    mapped.ugcCaptureStyleBase = undefined;
    mapped.ugcCameraOperator = undefined;
    mapped.ugcBodyPhonePosition = undefined;
    mapped.ugcMotionStability = undefined;
    mapped.ugcFramingImperfections = undefined;
    mapped.ugcAwkwardContext = undefined;
    mapped.ugcRealModeLayers = undefined;
    mapped.rawDomesticUgcActive = undefined;
    mapped.sceneOrderChaos = undefined;
    mapped.sceneOrderChaosDescriptor = undefined;
    mapped.perspective = undefined;
    mapped.personProps = undefined;

    // ========================================================================
    // PRODUCT VIEW (Stage 1)
    // ========================================================================

    const viewDescription = PRODUCT_VIEW_DESCRIPTIONS[sceneState.productViewPreset];
    const viewCustomText = sceneState.productViewCustomText?.trim();
    mapped.camera = [viewDescription, viewCustomText].filter(Boolean).join(' ');

    // ========================================================================
    // PRODUCT COMPOSITION (Stage 2)
    // ========================================================================

    mapped.compositionMode = PRODUCT_COMPOSITION_DESCRIPTIONS[sceneState.productCompositionPreset] ?? '';

    // ========================================================================
    // ECOMMERCE LAYOUT (Stage 3)
    // ========================================================================

    const alignmentSentence = ALIGNMENT_DESCRIPTIONS[sceneState.ecommerceAlignment ?? null];
    const alignmentPieces = [];
    if (alignmentSentence) {
        alignmentPieces.push(alignmentSentence);
    }
    if (sceneState.reserveBlankSpace) {
        alignmentPieces.push('Reserve clean negative space opposite the product for UI overlays.');
    }
    mapped.ecommerceSidePlacementDescriptor = alignmentPieces.join(' ');

    // ========================================================================
    // ENVIRONMENT & CUSTOM ADDITIONS (Stage 5 & 7)
    // ========================================================================

    const sceneDescriptors: string[] = [];
    if (sceneState.productEnvironment) {
        const envSentence = ENVIRONMENT_DESCRIPTIONS[sceneState.productEnvironment];
        if (envSentence) {
            sceneDescriptors.push(envSentence);
        }
    }
    const colorHint = sceneState.backgroundColorHint?.trim();
    if (colorHint) {
        sceneDescriptors.push(`Background color or tone hint: ${colorHint}.`);
    }

    const customAdditionSentences: string[] = [];
    const accentProps = sceneState.props?.trim();
    if (accentProps) {
        customAdditionSentences.push(`Accent colors or props: ${accentProps}.`);
    }
    const ingredientHint = sceneState.productUsageDescription?.trim();
    if (ingredientHint) {
        customAdditionSentences.push(`Ingredient or flavor props: ${ingredientHint}.`);
    } else if (sceneState.productCompositionPreset === 'ingredientStory') {
        const defaultIngredientHint = sceneState.productType
            ? PRODUCT_TYPE_INGREDIENT_HINTS[sceneState.productType]
            : 'Use visible ingredient or formulation props arranged around the product to make the formula story explicit.';
        if (defaultIngredientHint) {
            customAdditionSentences.push(defaultIngredientHint);
        }
    }
    const heroCue = sceneState.customProps?.trim();
    if (heroCue) {
        customAdditionSentences.push(`Hero visual cue: ${heroCue}.`);
    }

    const interactionSentence = INTERACTION_DESCRIPTIONS[interactionSelection];

    mapped.sceneOrderChaosDescriptor = [
        ...sceneDescriptors,
        ...customAdditionSentences,
        interactionSentence
    ]
        .filter(Boolean)
        .join(' ');

    // ========================================================================
    // LIGHTING + OUTPUT FORMAT (Stages 8 & 9)
    // ========================================================================

    const lightingSentence = sceneState.productLighting ? LIGHTING_DESCRIPTIONS[sceneState.productLighting] : '';
    const outputSentence =
        sceneState.productOutputFormat ? OUTPUT_FORMAT_DESCRIPTIONS[sceneState.productOutputFormat] : '';
    mapped.lighting = [lightingSentence, outputSentence].filter(Boolean).join(' ');

    // ========================================================================
    // OUTPUT FORMAT (Stage 8 - fallback)
    // ========================================================================

    mapped.aspectRatio = sceneState.productOutputFormat ? sceneState.productOutputFormat.replace('x', ':') : mapped.aspectRatio || '1:1';

    // ========================================================================
    // VALIDATION - Block all UGC state (Stage 11)
    // ========================================================================

    mapped.selfieType = 'None';
    mapped.personExpression = undefined;
    mapped.personPose = undefined;

    console.log('[PRODUCT MODE MAP OUTPUT]', mapped);

    return mapped;
}

/**
 * Validate that no forbidden UGC terms appear in prompt
 */
export function validateProductModePrompt(prompt: string): boolean {
    const lowerPrompt = prompt.toLowerCase();

    for (const forbidden of PRODUCT_VOCABULARY.FORBIDDEN) {
        if (lowerPrompt.includes(forbidden.toLowerCase())) {
            console.error(`[PRODUCT MODE VALIDATION FAILED] Forbidden term detected: "${forbidden}"`);
            return false;
        }
    }

    return true;
}
