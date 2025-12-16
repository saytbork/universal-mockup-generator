/**
 * PRODUCT MODE PROMPT MAPPER
 * Stage 10 - Product Mode Vocabulary Injection
 * 
 * This mapper is EXCLUSIVELY for Product Mode.
 * It injects ONLY product-safe vocabulary.
 * NO UGC terminology allowed.
 */

import type { Step3Values } from '@/components/LifestyleStep3';
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
    ],

    // Allowed terms (premium ecommerce only)
    ALLOWED: {
        composition: [
            'studio product photography',
            'editorial flat lay',
            'controlled lighting',
            'premium ecommerce aesthetic',
            'clean product studio',
            'ingredient story composition',
            'abstract benefit visual',
            'routine bundle shot'
        ],
        lighting: [
            'soft studio light',
            'natural window light',
            'controlled directional light'
        ],
        interaction: [
            'hands holding product',
            'hands pouring product',
            'hands opening product',
            'hands placing product',
            'product only, no hands'
        ]
    }
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

    const mapped: Partial<PromptOptions> = { ...existingOptions };

    // Force Product Mode flags
    mapped.contentStyle = 'product';
    mapped.creationMode = 'studio'; // Product mode uses studio creation mode
    mapped.personIncluded = false;
    mapped.ageGroup = 'no person';

    // ========================================================================
    // PRODUCT COMPOSITION (Stage 4)
    // ========================================================================

    // Composition presets map to specific prompt vocabulary
    const compositionPresetMap: Record<string, string> = {
        'Clean Product Studio': 'clean product studio with controlled lighting and soft shadows',
        'Editorial Flat Lay': 'editorial flat lay composition with precise arrangement',
        'Ingredient Story': 'ingredient story with product and natural elements',
        'Abstract Benefit Visual': 'abstract benefit visual with conceptual styling',
        'Routine / Bundle Shot': 'routine bundle shot showing multiple products together'
    };

    // ========================================================================
    // ENVIRONMENT & BACKGROUND (Stage 5)
    // ========================================================================

    // Product-safe environments only
    const environmentMap: Record<string, string> = {
        'Solid brand color': 'solid brand color background',
        'Soft gradient': 'soft gradient background',
        'Bathroom shelf': 'bathroom shelf surface',
        'Kitchen counter': 'kitchen counter surface',
        'Studio seamless': 'studio seamless white background'
    };

    // ========================================================================
    // PRODUCT INTERACTION (Stage 6 - NOT UGC)
    // ========================================================================

    // Hands-only interaction (editorial, not UGC)
    const interactionMap: Record<string, string> = {
        'No hands': 'product only composition with no hands visible',
        'Hands holding': 'hands holding product in editorial style, no face visible',
        'Hands pouring': 'hands pouring product in controlled demonstration, no face visible',
        'Hands opening': 'hands opening product in clean demonstration, no face visible',
        'Hands placing': 'hands placing product on surface, no face visible'
    };

    // ========================================================================
    // LIGHTING (Stage 7 - Simplified)
    // ========================================================================

    const lightingMap: Record<string, string> = {
        'Soft studio light': 'soft studio lighting with controlled highlights',
        'Natural window light': 'natural window light for realistic product photography',
        'Controlled directional light': 'controlled directional lighting with intentional shadows'
    };

    // ========================================================================
    // OUTPUT FORMAT (Stage 8)
    // ========================================================================

    const aspectRatioMap: Record<string, string> = {
        '1:1 (Square)': '1:1',
        '4:5 (Portrait)': '4:5',
        '9:16 (Story)': '9:16'
    };
    mapped.aspectRatio = aspectRatioMap[sceneState.aspectRatio] || '1:1';

    // ========================================================================
    // VALIDATION - Block all UGC state (Stage 11)
    // ========================================================================

    // Clear any UGC contamination
    mapped.realModeActive = false;
    mapped.selfieType = 'None';
    mapped.personExpression = undefined;
    mapped.personMood = undefined;
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
