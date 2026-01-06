/**
 * CANONICAL PROMPTS - Premium Studio v1
 * 
 * Deterministic prompts for each SceneType.
 * No creativity, no interpretation.
 */

import type { PremiumStudioInput, SceneType } from './schema';

// ============================================================================
// SCENE TYPE DESCRIPTIONS
// ============================================================================

const SCENE_DESCRIPTIONS: Record<SceneType, string> = {
    studio_branding:
        'Professional studio product photography. Clean background, product as hero. ' +
        'Commercial quality, brand-level execution. No environment, no lifestyle context.',

    editorial_product:
        'Editorial product photography with controlled styling. Abstract or stylized background. ' +
        'Magazine-quality aesthetic. Curated props if present. No domestic environment.',

    lifestyle_real:
        'Lifestyle product photography in real-world environment. Natural lighting, authentic setting. ' +
        'Product integrated naturally into scene. No face as protagonist.',

    ugc_phone:
        'User-generated content style. Smartphone camera aesthetic. Person present with product. ' +
        'Natural imperfections, authentic feel. Real environment, casual composition.',

    bundle_hero:
        'Bundle/kit product photography. Multiple products with clear visual hierarchy. ' +
        'Hero product prominent. Organized layout, balanced composition.'
};

// ============================================================================
// PROMPT BUILDERS
// ============================================================================

function buildProductSection(input: PremiumStudioInput): string {
    const { product } = input;
    const parts: string[] = [];

    parts.push(`PRODUCT: ${product.category.replace(/_/g, ' ')}`);
    parts.push(`Packaging: ${product.packaging.replace(/_/g, ' ')}`);
    parts.push(`Primary color: ${product.primaryColor}`);

    if (product.accentColor) {
        parts.push(`Accent color: ${product.accentColor}`);
    }
    if (product.contentColor) {
        parts.push(`Content color: ${product.contentColor}`);
    }

    parts.push(`Scale: ${product.scale}`);
    parts.push('Product appearance must remain exactly as uploaded. No modifications.');

    return parts.join('. ');
}

function buildEnvironmentSection(input: PremiumStudioInput): string {
    if (!input.environment) return '';

    const { macro, microPlace, customDescription } = input.environment;

    if (macro === 'custom' && customDescription) {
        return `ENVIRONMENT: ${customDescription}. Natural, lived-in appearance.`;
    }

    return `ENVIRONMENT: ${macro.replace(/_/g, ' ')} - ${microPlace.replace(/_/g, ' ')}. ` +
        'Real domestic environment, not stylized. Natural imperfections acceptable.';
}

function buildLightingSection(input: PremiumStudioInput): string {
    const lightingMap: Record<string, string> = {
        natural_light: 'Natural daylight, soft and even',
        sunny_day: 'Bright sunlight with natural shadows',
        golden_hour: 'Warm golden hour light, soft highlights',
        overcast: 'Diffused overcast light, no harsh shadows',
        cozy_indoors: 'Warm indoor ambient lighting',
        ring_light: 'Ring light illumination, even face lighting',
        mood_lighting: 'Atmospheric mood lighting, subtle shadows',
        night_mode: 'Low light, warm indoor tones',
        flash_photo: 'Direct flash, slight harsh shadows acceptable',
        studio_soft: 'Soft studio lighting, controlled highlights',
        studio_dramatic: 'Dramatic studio lighting, defined shadows'
    };

    return `LIGHTING: ${lightingMap[input.lighting] || input.lighting}. Product-safe, realistic.`;
}

function buildBundleSection(input: PremiumStudioInput): string {
    if (!input.bundle) return '';

    const { type, products, layout, spacing } = input.bundle;
    const heroProduct = products.find(p => p.isHero);

    return `BUNDLE: ${type} bundle with ${products.length} products. ` +
        `Layout: ${layout}. Spacing: ${spacing}. ` +
        `Hero product: ${heroProduct?.product.category.replace(/_/g, ' ')} in prominent position. ` +
        'Clear visual hierarchy. Supporting products complement hero.';
}

function buildPersonSection(input: PremiumStudioInput): string {
    if (!input.person) return '';

    const { interaction, showFace, showHands } = input.person;

    return `PERSON: ${interaction.replace(/_/g, ' ')}. ` +
        `Face: ${showFace ? 'visible' : 'not prominent or cropped'}. ` +
        `Hands: ${showHands ? 'visible interacting with product' : 'not shown'}. ` +
        'Natural, authentic appearance.';
}

function buildCameraSection(input: PremiumStudioInput): string {
    const camera = input.camera || { angle: 'eye_level', distance: 'medium' };

    let cameraType = 'Professional camera';
    if (input.sceneType === 'ugc_phone') {
        cameraType = 'Smartphone camera';
    }

    return `CAMERA: ${cameraType}. ` +
        `Angle: ${camera.angle.replace(/_/g, ' ')}. ` +
        `Distance: ${camera.distance.replace(/_/g, ' ')}. ` +
        `Aspect ratio: ${input.aspectRatio}.`;
}

function buildConstraints(input: PremiumStudioInput): string {
    const constraints: string[] = [
        'No extra objects beyond those specified',
        'No text overlays or watermarks',
        'No branding modifications'
    ];

    if (input.sceneType === 'studio_branding') {
        constraints.push('No environment elements');
        constraints.push('No people or hands');
        constraints.push('Clean, uncluttered background');
    }

    if (input.sceneType === 'editorial_product') {
        constraints.push('No domestic/real environment');
        constraints.push('No people');
        constraints.push('Abstract or minimal backdrop only');
    }

    if (input.sceneType === 'lifestyle_real') {
        constraints.push('No face as main subject');
        constraints.push('No artificial/studio look');
    }

    if (input.sceneType === 'ugc_phone') {
        constraints.push('No professional camera look');
        constraints.push('No over-polished aesthetic');
        constraints.push('Minor imperfections acceptable');
    }

    if (input.sceneType === 'bundle_hero') {
        constraints.push('All products must be visible');
        constraints.push('Hero product must be most prominent');
        constraints.push('No overlapping that hides products');
    }

    return 'CONSTRAINTS: ' + constraints.join('. ') + '.';
}

// ============================================================================
// NEGATIVE PROMPT BUILDERS
// ============================================================================

function buildNegativePrompt(sceneType: SceneType): string {
    const base = [
        'deformed product', 'warped packaging', 'incorrect label', 'blurry text',
        'watermark', 'signature', 'ai artifacts', 'floating objects',
        'cartoon style', '3d render', 'duplicate objects'
    ];

    const sceneSpecific: Record<SceneType, string[]> = {
        studio_branding: [
            'hands', 'people', 'environment', 'lifestyle elements',
            'domestic setting', 'phone camera look', 'amateur photography'
        ],
        editorial_product: [
            'hands', 'people', 'real environment', 'domestic setting',
            'cluttered background', 'amateur photography'
        ],
        lifestyle_real: [
            'face as main subject', 'portrait style', 'studio backdrop',
            'artificial lighting', 'over-polished', 'commercial perfection'
        ],
        ugc_phone: [
            'professional camera', 'studio lighting', 'perfect symmetry',
            'commercial polish', 'HDR look', 'bokeh', 'depth of field blur',
            'portrait mode', 'professional photography'
        ],
        bundle_hero: [
            'hands', 'people', 'single product only', 'overlapping products',
            'hidden products', 'messy arrangement', 'cluttered layout'
        ]
    };

    return [...base, ...sceneSpecific[sceneType]].join(', ');
}

// ============================================================================
// MAIN PROMPT GENERATOR
// ============================================================================

export interface PromptResult {
    prompt: string;
    negativePrompt: string;
}

export function generatePremiumPrompt(input: PremiumStudioInput): PromptResult {
    const sections: string[] = [];

    // 1. Scene type
    sections.push(`High-resolution product photography.\n\nSCENE TYPE: ${SCENE_DESCRIPTIONS[input.sceneType]}`);

    // 2. Product
    sections.push(buildProductSection(input));

    // 3. Bundle (if applicable)
    const bundleSection = buildBundleSection(input);
    if (bundleSection) sections.push(bundleSection);

    // 4. Environment (if applicable)
    const envSection = buildEnvironmentSection(input);
    if (envSection) sections.push(envSection);

    // 5. Person (if applicable)
    const personSection = buildPersonSection(input);
    if (personSection) sections.push(personSection);

    // 6. Lighting
    sections.push(buildLightingSection(input));

    // 7. Camera
    sections.push(buildCameraSection(input));

    // 8. Constraints
    sections.push(buildConstraints(input));

    return {
        prompt: sections.join('\n\n'),
        negativePrompt: buildNegativePrompt(input.sceneType)
    };
}

// ============================================================================
// CANONICAL EXAMPLES
// ============================================================================

export const CANONICAL_EXAMPLES: Record<SceneType, PremiumStudioInput> = {
    studio_branding: {
        sceneType: 'studio_branding',
        product: {
            category: 'supplement_capsule',
            packaging: 'bottle_plastic',
            primaryColor: 'white',
            accentColor: 'orange',
            scale: 'medium'
        },
        lighting: 'studio_soft',
        aspectRatio: '1:1'
    },

    editorial_product: {
        sceneType: 'editorial_product',
        product: {
            category: 'skincare_serum',
            packaging: 'dropper',
            primaryColor: 'amber',
            contentColor: 'golden',
            scale: 'medium'
        },
        lighting: 'golden_hour',
        aspectRatio: '4:5'
    },

    lifestyle_real: {
        sceneType: 'lifestyle_real',
        product: {
            category: 'supplement_powder',
            packaging: 'jar_plastic',
            primaryColor: 'black',
            accentColor: 'green',
            scale: 'large'
        },
        environment: {
            macro: 'kitchen',
            microPlace: 'kitchen_counter'
        },
        lighting: 'natural_light',
        aspectRatio: '4:5'
    },

    ugc_phone: {
        sceneType: 'ugc_phone',
        product: {
            category: 'supplement_gummy',
            packaging: 'jar_plastic',
            primaryColor: 'clear',
            contentColor: 'multi-color',
            scale: 'small'
        },
        environment: {
            macro: 'bathroom',
            microPlace: 'bathroom_counter'
        },
        person: {
            interaction: 'holding_product',
            showFace: false,
            showHands: true
        },
        lighting: 'natural_light',
        aspectRatio: '9:16'
    },

    bundle_hero: {
        sceneType: 'bundle_hero',
        product: {
            category: 'skincare_serum',
            packaging: 'dropper',
            primaryColor: 'white',
            scale: 'medium'
        },
        bundle: {
            type: 'trio',
            layout: 'pyramid',
            spacing: 'balanced',
            products: [
                {
                    product: {
                        category: 'skincare_serum',
                        packaging: 'dropper',
                        primaryColor: 'white',
                        scale: 'medium'
                    },
                    isHero: true,
                    position: 1
                },
                {
                    product: {
                        category: 'skincare_cream',
                        packaging: 'jar_glass',
                        primaryColor: 'white',
                        scale: 'medium'
                    },
                    isHero: false,
                    position: 2
                },
                {
                    product: {
                        category: 'skincare_cleanser',
                        packaging: 'pump',
                        primaryColor: 'white',
                        scale: 'large'
                    },
                    isHero: false,
                    position: 3
                }
            ]
        },
        lighting: 'studio_soft',
        aspectRatio: '16:9'
    }
};
