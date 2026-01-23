/**
 * PRODUCT STUDIO MAPPER
 * 
 * Maps LifestyleStep3 values → ProductStudioState
 * Bridges existing UI to new unified state.
 */

import type { ProductStudioState } from './state';
import { DEFAULT_PRODUCT_STUDIO_STATE } from './state';

// ============================================================================
// VALUE MAPPINGS
// ============================================================================

const CREATIVITY_LEVEL_MAP: Record<string, ProductStudioState['creativityLevel']> = {
    'Off': 'off',
    'Subtle': 'subtle',
    'Bold': 'bold',
    'Max': 'max',
};

const THEME_MAP: Record<string, ProductStudioState['creativeTheme']> = {
    'Ingredient Color Story': 'ingredient_color_story',
    'Clinical Minimal': 'clinical_minimal',
    'Premium Luxury': 'premium_luxury',
    'Fresh & Bright': 'fresh_bright',
    'Dark & Dramatic': 'dark_dramatic',
    'Playful Pop': 'playful_pop',
    'Tech Clean': 'tech_clean',
};

const PALETTE_MAP: Record<string, ProductStudioState['paletteSource']> = {
    'Use product label colors': 'product_label',
    'Warm neutrals': 'warm_neutrals',
    'Cool neutrals': 'cool_neutrals',
    'Complementary accent': 'complementary',
    'Custom palette': 'custom',
};

const CAMERA_SYSTEM_MAP: Record<string, ProductStudioState['cameraSystem']> = {
    'DSLR / mirrorless': 'dslr_mirrorless',
    'Macro lens': 'macro',
    'Telephoto compression': 'telephoto',
};

const ANGLE_MAP: Record<string, ProductStudioState['angle']> = {
    'Eye level product': 'eye_level',
    '45° hero': '45_hero',
    'Top-down flat lay': 'top_down',
    'Low angle power': 'low_angle',
    'High angle overview': 'high_angle',
    'Detail close-up': 'detail_closeup',
};

const DISTANCE_MAP: Record<string, ProductStudioState['distance']> = {
    'Wide': 'wide',
    'Standard': 'standard',
    'Tight': 'tight',
    'Macro': 'macro',
};

const FRAMING_MAP: Record<string, ProductStudioState['framing']> = {
    'Centered hero': 'centered_hero',
    'Rule of thirds': 'rule_of_thirds',
    'Left aligned + negative space': 'left_negative',
    'Right aligned + negative space': 'right_negative',
    'Grid-ready': 'grid_ready',
};

const LIGHTING_MAP: Record<string, ProductStudioState['lighting']> = {
    'natural': 'natural_soft',
    'studio': 'studio_key',
    'dramatic': 'dramatic',
    'flat': 'flat',
    'backlit': 'backlit',
    'golden_hour': 'golden_hour',
    'Soft Natural': 'natural_soft',
    'Studio Light': 'studio_key',
    'Dramatic': 'dramatic',
    'Flat': 'flat',
    'Backlit': 'backlit',
    'Golden Hour': 'golden_hour',
};

const SIDE_PLACEMENT_MAP: Record<string, ProductStudioState['blankSpaceSide']> = {
    'Left': 'left',
    'Center': 'center',
    'Right': 'right',
};

const SCALE_MAP: Record<string, ProductStudioState['physicalScale']> = {
    'Travel': 'travel',
    'Standard': 'standard',
    'Large': 'large',
    'Jumbo': 'jumbo',
};

// ============================================================================
// MAIN MAPPER
// ============================================================================

export interface Step3ProductValues {
    // From existing Step3Values
    productCreativityLevel?: string;
    productCreativeTheme?: string;
    productPaletteSource?: string;
    productPropDensity?: string;
    productPropsSelected?: string[];
    productCameraSystem?: string;
    productCameraAngle?: string;
    productCameraDistance?: string;
    productCameraRotation?: number;
    productFramingGuide?: string;
    environment?: string;
    customEnvironment?: string;
    lightingStyle?: string;
    ecommerceSidePlacementFlag?: boolean;
    sidePlacement?: string;
    ecommerceBackgroundMode?: string;
    ecommerceBackgroundColor?: string;
    ecommerceGradientStart?: string;
    ecommerceGradientEnd?: string;
    ecommerceGradientAngle?: string | number;
    productScale?: string;
    handsHolding?: boolean;
    aspectRatio?: string;
}

export interface ProductAssetInput {
    id: string;
    label: string;
    previewUrl: string;
    base64: string;
    mimeType: string;
    heightValue?: number;
    heightUnit?: 'cm' | 'in';
}

export function mapStep3ToProductStudio(
    values: Step3ProductValues,
    products: ProductAssetInput[],
    activeProductId: string | null
): ProductStudioState {
    const state: ProductStudioState = {
        ...DEFAULT_PRODUCT_STUDIO_STATE,

        // Products
        products: products.map(p => ({
            ...p,
            heightUnit: p.heightUnit || 'cm',
        })),
        activeProductId,

        // Product Setup
        physicalScale: SCALE_MAP[values.productScale || ''] || 'standard',
        handsHolding: values.handsHolding ?? false,

        // Creativity
        creativityLevel: CREATIVITY_LEVEL_MAP[values.productCreativityLevel || ''] || 'subtle',
        creativeTheme: THEME_MAP[values.productCreativeTheme || ''] || 'clinical_minimal',
        paletteSource: PALETTE_MAP[values.productPaletteSource || ''] || 'product_label',
        propDensity: (values.productPropDensity?.toLowerCase() as ProductStudioState['propDensity']) || 'minimal',
        selectedProps: values.productPropsSelected || [],

        // Camera
        cameraSystem: CAMERA_SYSTEM_MAP[values.productCameraSystem || ''] || 'dslr_mirrorless',
        angle: ANGLE_MAP[values.productCameraAngle || ''] || '45_hero',
        distance: DISTANCE_MAP[values.productCameraDistance || ''] || 'standard',
        rotation: (values.productCameraRotation || 0) as 0 | 5 | 10 | 15,
        framing: FRAMING_MAP[values.productFramingGuide || ''] || 'centered_hero',

        // Environment
        environment: values.environment || 'studio',
        customEnvironment: values.customEnvironment || '',
        lighting: LIGHTING_MAP[values.lightingStyle || ''] || 'studio_key',

        // Ecommerce
        ecommerceMode: values.ecommerceSidePlacementFlag ?? false,
        blankSpaceEnabled: values.ecommerceSidePlacementFlag ?? false,
        blankSpaceSide: SIDE_PLACEMENT_MAP[values.sidePlacement || ''] || 'center',
        backgroundColor: values.ecommerceBackgroundColor || '#ffffff',
        gradientEnabled: values.ecommerceBackgroundMode === 'gradient',
        gradientStart: values.ecommerceGradientStart || '#ffffff',
        gradientEnd: values.ecommerceGradientEnd || '#f0f0f0',
        gradientAngle: typeof values.ecommerceGradientAngle === 'number'
            ? values.ecommerceGradientAngle
            : parseInt(String(values.ecommerceGradientAngle) || '180', 10),

        // Output
        aspectRatio: (values.aspectRatio as ProductStudioState['aspectRatio']) || '1:1',
    };

    return state;
}
