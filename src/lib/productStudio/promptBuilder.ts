/**
 * PRODUCT STUDIO PROMPT BUILDER
 * 
 * Converts ProductStudioState → final prompt string.
 * ZERO human language. Product photography ONLY.
 */

import type { ProductStudioState, ProductAsset } from './state';

// ============================================================================
// FORBIDDEN LANGUAGE
// ============================================================================

const FORBIDDEN_TERMS = [
    'person', 'people', 'human', 'model', 'woman', 'man', 'girl', 'boy',
    'face', 'body', 'skin', 'hand', 'hands', 'finger', 'fingers', 'arm', 'arms',
    'selfie', 'ugc', 'lifestyle', 'candid', 'influencer', 'creator',
    'phone', 'smartphone', 'iphone', 'android', 'front camera',
    'holding', 'gripping', 'touching',
];

// Exception: "cropped hand" is allowed when handsHolding is true
const ALLOWED_EXCEPTIONS = ['cropped hand', 'cropped wrist'];

export function validateNoHumanLanguage(prompt: string, allowCroppedHand: boolean): void {
    const lower = prompt.toLowerCase();

    for (const term of FORBIDDEN_TERMS) {
        if (lower.includes(term)) {
            // Check if it's an allowed exception
            const isException = allowCroppedHand && ALLOWED_EXCEPTIONS.some(ex => lower.includes(ex));
            if (!isException) {
                console.error(`[ProductStudio] FORBIDDEN TERM DETECTED: "${term}"`);
                throw new Error(`Product prompt contains forbidden human language: "${term}"`);
            }
        }
    }
}

// ============================================================================
// THEME MAPPINGS
// ============================================================================

const THEME_PROMPTS: Record<ProductStudioState['creativeTheme'], string> = {
    ingredient_color_story: 'surrounded by natural ingredients, organic textures, botanical elements matching product formulation',
    clinical_minimal: 'clinical precision, pharmaceutical aesthetic, sterile white environment, medical-grade presentation',
    premium_luxury: 'luxury editorial styling, high-end materials, gold accents, velvet surfaces, premium brand positioning',
    fresh_bright: 'vibrant colors, fresh citrus elements, water droplets, energetic morning light',
    dark_dramatic: 'dramatic shadows, moody lighting, dark luxe aesthetic, editorial contrast',
    playful_pop: 'bold graphic colors, playful geometric shapes, pop art influence, energetic composition',
    tech_clean: 'futuristic clean lines, metallic surfaces, tech-forward aesthetic, precision engineering look',
};

const CREATIVITY_INTENSITY: Record<ProductStudioState['creativityLevel'], number> = {
    off: 0,
    subtle: 0.3,
    bold: 0.7,
    max: 1.0,
};

// ============================================================================
// CAMERA MAPPINGS
// ============================================================================

const CAMERA_SYSTEM_PROMPTS: Record<ProductStudioState['cameraSystem'], string> = {
    dslr_mirrorless: 'shot on professional DSLR camera, sharp focus, shallow depth of field',
    macro: 'macro lens photography, extreme detail, texture-focused',
    telephoto: 'telephoto compression, flattened perspective, isolated subject',
};

const ANGLE_PROMPTS: Record<ProductStudioState['angle'], string> = {
    eye_level: 'eye-level product shot, straight-on perspective',
    '45_hero': '45-degree hero angle, dynamic product presentation',
    top_down: 'top-down flat lay, overhead perspective',
    low_angle: 'low angle power shot, imposing presence',
    high_angle: 'high angle overview, comprehensive view',
    detail_closeup: 'extreme close-up detail shot, texture emphasis',
};

const DISTANCE_PROMPTS: Record<ProductStudioState['distance'], string> = {
    wide: 'wide shot, environmental context visible',
    standard: 'standard framing, product fills frame appropriately',
    tight: 'tight crop, product dominates frame',
    macro: 'macro distance, extreme detail visible',
};

const FRAMING_PROMPTS: Record<ProductStudioState['framing'], string> = {
    centered_hero: 'centered composition, hero product placement',
    rule_of_thirds: 'rule of thirds composition, balanced asymmetry',
    left_negative: 'product positioned left, negative space on right for copy',
    right_negative: 'product positioned right, negative space on left for copy',
    grid_ready: 'grid-ready composition, social media optimized',
};

// ============================================================================
// LIGHTING MAPPINGS
// ============================================================================

const LIGHTING_PROMPTS: Record<ProductStudioState['lighting'], string> = {
    natural_soft: 'soft natural window light, gentle shadows',
    studio_key: 'professional studio key lighting, controlled shadows',
    dramatic: 'dramatic directional lighting, strong contrast',
    flat: 'flat even lighting, minimal shadows, e-commerce ready',
    backlit: 'backlit rim lighting, glowing edges',
    golden_hour: 'warm golden hour light, honeyed tones',
};

// ============================================================================
// PROP DENSITY
// ============================================================================

const PROP_DENSITY_PROMPTS: Record<ProductStudioState['propDensity'], string> = {
    none: 'clean isolated product, no props or decorations',
    minimal: 'minimal styling props, subtle accents',
    moderate: 'moderate prop styling, complementary elements',
    rich: 'rich prop environment, abundant styling elements',
};

// ============================================================================
// ECOMMERCE BLANK SPACE
// ============================================================================

function buildEcommerceBlankSpace(state: ProductStudioState): string {
    if (!state.blankSpaceEnabled) return '';

    const side = state.blankSpaceSide;
    const bgColor = state.gradientEnabled
        ? `gradient background from ${state.gradientStart} to ${state.gradientEnd} at ${state.gradientAngle} degrees`
        : `solid ${state.backgroundColor} background`;

    const placement = side === 'center'
        ? 'product centered in frame'
        : `product positioned strictly in the ${side} third of frame, ${side === 'left' ? 'right' : 'left'} side must remain clean negative space reserved for marketing copy`;

    return `ECOMMERCE LAYOUT (NON-NEGOTIABLE): ${bgColor}, ${placement}, clean separation between product and negative space, e-commerce ready composition`;
}

// ============================================================================
// MAIN BUILDER
// ============================================================================

export interface ProductPromptResult {
    prompt: string;
    negativePrompt: string;
    productId: string;
    productLabel: string;
}

export function buildProductPrompt(state: ProductStudioState, product: ProductAsset): ProductPromptResult {
    const segments: string[] = [];

    // Core product description
    segments.push(`Professional product photography of ${product.label || 'cosmetic product'}`);
    segments.push(`${state.productType} packaging, ${state.packaging} material, ${state.physicalScale} size`);

    // Camera
    segments.push(CAMERA_SYSTEM_PROMPTS[state.cameraSystem]);
    segments.push(ANGLE_PROMPTS[state.angle]);
    segments.push(DISTANCE_PROMPTS[state.distance]);
    if (state.rotation > 0) {
        segments.push(`${state.rotation} degree rotation`);
    }
    segments.push(FRAMING_PROMPTS[state.framing]);

    // Lighting
    segments.push(LIGHTING_PROMPTS[state.lighting]);

    // Ecommerce blank space OR creative environment
    if (state.blankSpaceEnabled) {
        segments.push(buildEcommerceBlankSpace(state));
    } else {
        // Creative theme
        if (state.creativityLevel !== 'off') {
            const intensity = CREATIVITY_INTENSITY[state.creativityLevel];
            if (intensity > 0) {
                segments.push(THEME_PROMPTS[state.creativeTheme]);
            }
        }

        // Environment
        if (state.customEnvironment) {
            segments.push(`environment: ${state.customEnvironment}`);
        } else if (state.environment && state.environment !== 'studio') {
            segments.push(`${state.environment} setting`);
        }

        // Props
        if (state.propDensity !== 'none') {
            segments.push(PROP_DENSITY_PROMPTS[state.propDensity]);
            if (state.selectedProps.length > 0) {
                segments.push(`styling props: ${state.selectedProps.join(', ')}`);
            }
        }
    }

    // Hands (only cropped, only if enabled)
    if (state.handsHolding) {
        segments.push('cropped hand or wrist visible at edge of frame holding product naturally');
    }

    // Quality markers
    segments.push('commercial product photography, high resolution, sharp focus, professional lighting');

    // Aspect ratio enforcement
    const aspectMap: Record<string, string> = {
        '1:1': 'square 1:1 aspect ratio composition',
        '4:5': 'portrait 4:5 aspect ratio composition',
        '9:16': 'vertical 9:16 aspect ratio composition',
        '16:9': 'landscape 16:9 aspect ratio composition',
        '3:4': 'portrait 3:4 aspect ratio composition',
    };
    segments.push(aspectMap[state.aspectRatio] || 'square composition');

    const prompt = segments.filter(Boolean).join(', ');

    // Validate no human language
    validateNoHumanLanguage(prompt, state.handsHolding);

    // Negative prompt
    const negativePrompt = [
        'person', 'people', 'human', 'model', 'face', 'body', 'full hand', 'multiple hands',
        'selfie', 'phone', 'smartphone', 'lifestyle', 'candid', 'ugc',
        'blurry', 'low quality', 'distorted', 'watermark', 'text overlay',
        'cartoon', 'illustration', 'drawing', 'anime',
    ].join(', ');

    return {
        prompt,
        negativePrompt,
        productId: product.id,
        productLabel: product.label,
    };
}

// ============================================================================
// MULTI-PRODUCT BATCH
// ============================================================================

export function buildAllProductPrompts(state: ProductStudioState): ProductPromptResult[] {
    if (state.products.length === 0) {
        console.warn('[ProductStudio] No products to generate');
        return [];
    }

    return state.products.map(product => buildProductPrompt(state, product));
}
