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

    if (sceneState.ugcRealMode) {
        console.error('[INVALID STATE BLOCKED] UGC Real Mode cannot run in product mode');
        throw new Error('Invalid state: ugcRealMode in product mode');
    }
    if (sceneState.noPerson === false) {
        console.error('[INVALID STATE BLOCKED] Person cannot be enabled in product mode');
        throw new Error('Invalid state: person enabled in product mode');
    }
    if (sceneState.selfieMode && sceneState.selfieMode !== 'None') {
        console.error('[INVALID STATE BLOCKED] Selfie mode cannot run in product mode');
        throw new Error('Invalid state: selfie mode in product mode');
    }
    if ((existingOptions.productAssets?.length || 0) > 1 && sceneState.selfieMode && sceneState.selfieMode !== 'None') {
        console.error('[INVALID STATE BLOCKED] Selfie cannot be used with multi-product');
        throw new Error('Invalid state: selfie + multi-product');
    }

    const mapped: Partial<PromptOptions> = {
        ...existingOptions,
        ugcStyle: existingOptions.ugcStyle ?? 'optimized'
    };

    // Force Product Mode flags
    mapped.contentStyle = 'product';
    mapped.creationMode = 'ecom-blank';
    mapped.personIncluded = false;
    mapped.sceneIntent = 'ecommerce';
    mapped.compositionMode = 'Ecommerce Blank Space';
    mapped.ecommerceBlankSpaceMode = true;
    if (sceneState.ecommerceBackgroundMode === 'gradient') {
        const angle = parseInt(sceneState.ecommerceGradientAngle || '90', 10) || 90;
        mapped.bgGradient = {
            startColor: sceneState.ecommerceGradientStart || '#f7f7f7',
            endColor: sceneState.ecommerceGradientEnd || '#d9d9d9',
            angle
        };
        delete mapped.bgColor;
    } else {
        mapped.bgColor = (sceneState.ecommerceBackgroundColor || '#FFFFFF').toUpperCase();
        delete mapped.bgGradient;
    }

    mapped.setting = '';
    mapped.microLocation = '';
    mapped.environmentOrder = '';
    mapped.perspective = '';
    mapped.productPlane = '';
    mapped.placementStyle = undefined;
    mapped.personDetails = undefined;
    mapped.identityLock = undefined;
    mapped.personIdentity = undefined;
    mapped.gender = undefined;
    mapped.ethnicity = undefined;
    mapped.skinTone = undefined;
    mapped.hairColor = undefined;
    mapped.hairStyle = undefined;
    mapped.personPose = undefined;
    mapped.personMood = undefined;
    mapped.personAppearance = undefined;
    mapped.productInteraction = undefined;
    mapped.wardrobeStyle = undefined;
    mapped.personProps = undefined;
    mapped.microLocation = undefined;
    mapped.personExpression = undefined;
    mapped.selfieMode = undefined;
    mapped.selfieType = 'None';
    mapped.ugcRealModeActive = false;
    mapped.ugcRealModeLayers = undefined;
    mapped.ugcCaptureStyleBase = undefined;
    mapped.ugcCameraOperator = undefined;
    mapped.ugcBodyPhonePosition = undefined;
    mapped.ugcMotionStability = undefined;
    mapped.ugcFramingImperfections = undefined;
    mapped.ugcAwkwardContext = undefined;
    mapped.ugcSelfieDominant = false;

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
