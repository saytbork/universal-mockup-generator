/**
 * GTM DEMO INPUTS
 * 
 * 12 ready-to-run inputs for landing page, demos, and marketing.
 * Each input is production-ready and demonstrates premium quality.
 */

import type { PremiumStudioInput } from '../../src/lib/premiumStudio/schema';

// ============================================================================
// STUDIO / BRANDING (3 renders)
// ============================================================================

/** DEMO 1: Supplement capsules - Classic bottle hero */
export const DEMO_STUDIO_SUPPLEMENT: PremiumStudioInput = {
    sceneType: 'studio_branding',
    product: {
        category: 'supplement_capsule',
        packaging: 'bottle_plastic',
        primaryColor: 'matte black',
        accentColor: 'gold',
        contentColor: 'amber capsules',
        scale: 'medium'
    },
    lighting: 'studio_soft',
    aspectRatio: '1:1'
};

/** DEMO 2: Skincare serum - Luxury dropper */
export const DEMO_STUDIO_SKINCARE: PremiumStudioInput = {
    sceneType: 'studio_branding',
    product: {
        category: 'skincare_serum',
        packaging: 'dropper',
        primaryColor: 'frosted glass',
        accentColor: 'rose gold',
        contentColor: 'golden liquid',
        scale: 'medium'
    },
    lighting: 'studio_dramatic',
    aspectRatio: '4:5'
};

/** DEMO 3: Beverage - Premium can */
export const DEMO_STUDIO_BEVERAGE: PremiumStudioInput = {
    sceneType: 'studio_branding',
    product: {
        category: 'beverage',
        packaging: 'can',
        primaryColor: 'matte navy',
        accentColor: 'silver',
        scale: 'medium'
    },
    lighting: 'studio_soft',
    aspectRatio: '1:1'
};

// ============================================================================
// EDITORIAL PRODUCT (3 renders)
// ============================================================================

/** DEMO 4: Skincare editorial - Magazine style */
export const DEMO_EDITORIAL_SKINCARE: PremiumStudioInput = {
    sceneType: 'editorial_product',
    product: {
        category: 'skincare_cream',
        packaging: 'jar_glass',
        primaryColor: 'white',
        accentColor: 'sage green',
        scale: 'medium'
    },
    lighting: 'golden_hour',
    aspectRatio: '4:5'
};

/** DEMO 5: Supplement powder - Editorial flat lay style */
export const DEMO_EDITORIAL_POWDER: PremiumStudioInput = {
    sceneType: 'editorial_product',
    product: {
        category: 'supplement_powder',
        packaging: 'pouch',
        primaryColor: 'kraft paper',
        accentColor: 'forest green',
        contentColor: 'matcha green',
        scale: 'large'
    },
    lighting: 'natural_light',
    camera: { angle: 'top_down', distance: 'medium' },
    aspectRatio: '1:1'
};

/** DEMO 6: Gummy vitamins - Playful editorial */
export const DEMO_EDITORIAL_GUMMY: PremiumStudioInput = {
    sceneType: 'editorial_product',
    product: {
        category: 'supplement_gummy',
        packaging: 'jar_plastic',
        primaryColor: 'clear',
        contentColor: 'multi-color gummies',
        scale: 'medium'
    },
    lighting: 'mood_lighting',
    aspectRatio: '1:1'
};

// ============================================================================
// LIFESTYLE REAL (4 renders)
// ============================================================================

/** DEMO 7: Morning routine - Kitchen counter */
export const DEMO_LIFESTYLE_KITCHEN: PremiumStudioInput = {
    sceneType: 'lifestyle_real',
    product: {
        category: 'supplement_powder',
        packaging: 'jar_plastic',
        primaryColor: 'matte black',
        accentColor: 'electric green',
        contentColor: 'green powder',
        scale: 'large'
    },
    environment: {
        macro: 'kitchen',
        microPlace: 'kitchen_counter'
    },
    lighting: 'natural_light',
    aspectRatio: '4:5'
};

/** DEMO 8: Self-care - Bathroom vanity */
export const DEMO_LIFESTYLE_BATHROOM: PremiumStudioInput = {
    sceneType: 'lifestyle_real',
    product: {
        category: 'skincare_serum',
        packaging: 'dropper',
        primaryColor: 'amber glass',
        accentColor: 'wood',
        contentColor: 'golden oil',
        scale: 'small'
    },
    environment: {
        macro: 'bathroom',
        microPlace: 'bathroom_counter'
    },
    lighting: 'cozy_indoors',
    aspectRatio: '4:5'
};

/** DEMO 9: Focus time - Workspace */
export const DEMO_LIFESTYLE_WORKSPACE: PremiumStudioInput = {
    sceneType: 'lifestyle_real',
    product: {
        category: 'supplement_capsule',
        packaging: 'bottle_plastic',
        primaryColor: 'white',
        accentColor: 'blue',
        scale: 'medium'
    },
    environment: {
        macro: 'workspace',
        microPlace: 'desk'
    },
    lighting: 'natural_light',
    aspectRatio: '16:9'
};

/** DEMO 10: Outdoor wellness - Patio */
export const DEMO_LIFESTYLE_OUTDOOR: PremiumStudioInput = {
    sceneType: 'lifestyle_real',
    product: {
        category: 'beverage',
        packaging: 'bottle_glass',
        primaryColor: 'clear',
        contentColor: 'pink kombucha',
        scale: 'medium'
    },
    environment: {
        macro: 'backyard_patio',
        microPlace: 'outdoor_table'
    },
    lighting: 'sunny_day',
    aspectRatio: '1:1'
};

// ============================================================================
// UGC / PHONE (2 renders)
// ============================================================================

/** DEMO 11: Hand holding product - Authentic UGC */
export const DEMO_UGC_HOLDING: PremiumStudioInput = {
    sceneType: 'ugc_phone',
    product: {
        category: 'skincare_serum',
        packaging: 'dropper',
        primaryColor: 'minimalist white',
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
};

/** DEMO 12: Product in use - Story format */
export const DEMO_UGC_USING: PremiumStudioInput = {
    sceneType: 'ugc_phone',
    product: {
        category: 'supplement_gummy',
        packaging: 'jar_plastic',
        primaryColor: 'clear',
        contentColor: 'colorful gummies',
        scale: 'small'
    },
    environment: {
        macro: 'kitchen',
        microPlace: 'breakfast_table'
    },
    person: {
        interaction: 'using_product',
        showFace: false,
        showHands: true
    },
    lighting: 'cozy_indoors',
    aspectRatio: '9:16'
};

// ============================================================================
// BUNDLE / KIT HERO (2 renders)
// ============================================================================

/** DEMO 13: Skincare trio - Studio bundle */
export const DEMO_BUNDLE_SKINCARE: PremiumStudioInput = {
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
                    accentColor: 'gold',
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
};

/** DEMO 14: Supplement duo - Clean bundle */
export const DEMO_BUNDLE_SUPPLEMENT: PremiumStudioInput = {
    sceneType: 'bundle_hero',
    product: {
        category: 'supplement_capsule',
        packaging: 'bottle_plastic',
        primaryColor: 'matte black',
        scale: 'medium'
    },
    bundle: {
        type: 'duo',
        layout: 'linear',
        spacing: 'airy',
        products: [
            {
                product: {
                    category: 'supplement_capsule',
                    packaging: 'bottle_plastic',
                    primaryColor: 'matte black',
                    accentColor: 'orange',
                    scale: 'medium'
                },
                isHero: true,
                position: 1
            },
            {
                product: {
                    category: 'supplement_powder',
                    packaging: 'jar_plastic',
                    primaryColor: 'matte black',
                    accentColor: 'green',
                    contentColor: 'green powder',
                    scale: 'large'
                },
                isHero: false,
                position: 2
            }
        ]
    },
    lighting: 'natural_light',
    aspectRatio: '16:9'
};

// ============================================================================
// EXPORT ALL DEMOS
// ============================================================================

export const GTM_DEMOS = {
    // Studio (3)
    DEMO_STUDIO_SUPPLEMENT,
    DEMO_STUDIO_SKINCARE,
    DEMO_STUDIO_BEVERAGE,

    // Editorial (3)
    DEMO_EDITORIAL_SKINCARE,
    DEMO_EDITORIAL_POWDER,
    DEMO_EDITORIAL_GUMMY,

    // Lifestyle (4)
    DEMO_LIFESTYLE_KITCHEN,
    DEMO_LIFESTYLE_BATHROOM,
    DEMO_LIFESTYLE_WORKSPACE,
    DEMO_LIFESTYLE_OUTDOOR,

    // UGC (2)
    DEMO_UGC_HOLDING,
    DEMO_UGC_USING,

    // Bundle (2)
    DEMO_BUNDLE_SKINCARE,
    DEMO_BUNDLE_SUPPLEMENT
};

export const GTM_DEMO_LIST = Object.entries(GTM_DEMOS).map(([key, input]) => ({
    id: key,
    sceneType: input.sceneType,
    productCategory: input.product.category,
    aspectRatio: input.aspectRatio
}));
