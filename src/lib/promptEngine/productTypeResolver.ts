/**
 * Product Type Resolver Module
 * 
 * PHYSICAL NATURE - Layer 3 of Pipeline
 * 
 * This module defines the physical nature and material behavior of products.
 * Focuses EXCLUSIVELY on physics and material properties, never aesthetics or mood.
 * 
 * Pipeline Order:
 * 1. Quality Enforcer (foundation)
 * 2. Photo Mode Resolver (scene authority)
 * 3. Product Type Resolver (physical nature) ← THIS MODULE
 * 4. Physical Properties (fine-tuning)
 * 5. State/Interaction
 * 6. Camera
 * 
 * Product Type defines HOW THE PRODUCT EXISTS PHYSICALLY, not how it looks aesthetically.
 */

import type { PhotoModeCompat } from './photoModeResolver';

// =============================================================================
// TYPES
// =============================================================================

export type ProductType =
    | 'Capsules'
    | 'Drops'
    | 'Powder'
    | 'Skincare'
    | 'Beverage'
    | 'Device';

export interface ProductTypeOptions {
    // Validation context
    photoMode?: PhotoModeCompat;           // For compatibility checks

    // Physical modifiers (optional, future use)
    quantity?: number;               // Number of units
    containerType?: string;          // For beverages/liquids
    transparency?: 'opaque' | 'translucent' | 'transparent';
}

export interface MaterialFlags {
    isLiquid: boolean;               // Can pour/splash
    isGranular: boolean;             // Powder-like
    isRigid: boolean;                // Hard solid (device, capsule shell)
    canDeform: boolean;              // Soft material (cream, gel)
    hasTransparency: boolean;        // See-through capability
}

export interface ProductTypeResult {
    // Prompt sections
    physicalPrompt: string;          // Core physical nature prompt

    // Compatibility validation
    isValid: boolean;
    validationErrors: string[];

    // Material flags (for downstream use)
    materialFlags: MaterialFlags;
}

// =============================================================================
// PHYSICAL PROMPTS PER PRODUCT TYPE
// =============================================================================

const PRODUCT_TYPE_PHYSICAL_PROMPTS: Record<ProductType, string> = {
    'Capsules': `
    PRODUCT PHYSICAL NATURE: Capsules.
    Discrete solid units with individual gravity.
    Each capsule is a separate object with hard edges and defined geometry.
    Shell material: matte or semi-gloss finish, opaque or translucent.
    No liquid behavior, no deformation, no melting.
    Capsules may stack, scatter, or be arranged, but each remains a distinct unit.
    Realistic contact shadows where capsules touch surfaces or each other.
    Clean manufacturing finish with precise seams.
  `,

    'Drops': `
    PRODUCT PHYSICAL NATURE: Liquid/Drops.
    Viscous liquid with realistic surface tension and meniscus formation.
    Transparent or translucent with accurate refraction and light transmission.
    Can drip, pour, pool, or form droplets with realistic physics.
    Volume behaves according to gravity and container shape.
    Glossy highlights on liquid surface.
    No solid rigidity, no granular behavior.
    Realistic liquid dynamics frozen mid-action if in motion.
  `,

    'Powder': `
    PRODUCT PHYSICAL NATURE: Powder.
    Fine particulate matter with granular behavior.
    Individual particles visible at macro scale.
    Can appear grounded (settled pile with realistic slope and angle of repose) or airborne (fine dust particles).
    No cohesion or liquid-like flow.
    Settles naturally under gravity.
    Matte or slightly reflective particles depending on formulation.
    No clumping unless intentionally wetted.
  `,

    'Skincare': `
    PRODUCT PHYSICAL NATURE: Skincare (Cream/Gel).
    Semi-viscous material with soft deformation capability.
    Can spread, smear, or retain shape depending on consistency.
    Glossy or satin highlights on surface.
    May show micro-texture: bubbles, gel consistency, or cream peaks.
    Not rigid, not liquid, semi-solid state.
    Realistic interaction with applicators or skin if applicable.
    Smooth material transitions with no abrupt edges.
  `,

    'Beverage': `
    PRODUCT PHYSICAL NATURE: Beverage.
    Liquid volume contained in vessel (glass, bottle, can).
    Transparent or translucent liquid with accurate color and clarity.
    Container may show condensation on exterior if cold beverage.
    Liquid interacts realistically with container walls (meniscus at edges).
    Ice cubes allowed if contextually appropriate, with realistic refraction.
    No powder behavior, no cream-like consistency.
    Carbonation bubbles acceptable if applicable.
  `,

    'Device': `
    PRODUCT PHYSICAL NATURE: Device.
    Rigid solid object with precise hard-edge geometry.
    No deformation, no softness, no organic behavior.
    Materials: metallic, plastic, glass, composite with accurate material response.
    May include buttons, screens, ports, LEDs, or mechanical components.
    Clean manufacturing finish with sharp tolerances.
    No liquid, no powder, no cream-like behavior.
    Realistic reflections on metallic/glossy surfaces.
  `
};

// =============================================================================
// MATERIAL FLAGS PER PRODUCT TYPE
// =============================================================================

const MATERIAL_FLAGS: Record<ProductType, MaterialFlags> = {
    'Capsules': {
        isLiquid: false,
        isGranular: false,
        isRigid: true,
        canDeform: false,
        hasTransparency: true  // Shell can be translucent
    },

    'Drops': {
        isLiquid: true,
        isGranular: false,
        isRigid: false,
        canDeform: true,
        hasTransparency: true
    },

    'Powder': {
        isLiquid: false,
        isGranular: true,
        isRigid: false,
        canDeform: false,
        hasTransparency: false
    },

    'Skincare': {
        isLiquid: false,
        isGranular: false,
        isRigid: false,
        canDeform: true,
        hasTransparency: false
    },

    'Beverage': {
        isLiquid: true,
        isGranular: false,
        isRigid: false,
        canDeform: true,
        hasTransparency: true
    },

    'Device': {
        isLiquid: false,
        isGranular: false,
        isRigid: true,
        canDeform: false,
        hasTransparency: false
    }
};

// =============================================================================
// COMPATIBILITY MATRIX
// =============================================================================

const PRODUCT_TYPE_PHOTO_MODE_COMPATIBILITY: Record<ProductType, {
    incompatiblePhotoModes: PhotoModeCompat[];
}> = {
    'Capsules': {
        incompatiblePhotoModes: ['Splash Shot', 'Foam & Texture']
    },

    'Drops': {
        incompatiblePhotoModes: []  // Liquids are versatile
    },

    'Powder': {
        incompatiblePhotoModes: ['Splash Shot', 'Foam & Texture']
    },

    'Skincare': {
        incompatiblePhotoModes: []  // Creams/gels work with most modes
    },

    'Beverage': {
        incompatiblePhotoModes: ['Ingredient Stack', 'Ingredient Flat Lay', 'Foam & Texture']
    },

    'Device': {
        incompatiblePhotoModes: ['Ingredient Stack', 'Ingredient Flat Lay', 'Foam & Texture', 'Splash Shot']
    }
};

// =============================================================================
// VALIDATION LOGIC
// =============================================================================

function validateProductTypeCompatibility(
    productType: ProductType,
    options: ProductTypeOptions
): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check Photo Mode compatibility
    const compatibility = PRODUCT_TYPE_PHOTO_MODE_COMPATIBILITY[productType];
    if (options.photoMode && compatibility.incompatiblePhotoModes.includes(options.photoMode)) {
        errors.push(
            `BLOCKING: Product Type "${productType}" is incompatible with Photo Mode "${options.photoMode}"`
        );
    }

    // Specific validations with clear error messages
    if (productType === 'Capsules' && options.photoMode === 'Splash Shot') {
        errors.push('BLOCKING: Capsules cannot splash. Use "Drops" Product Type for Splash Shot.');
    }

    if (productType === 'Powder' && options.photoMode === 'Splash Shot') {
        errors.push('BLOCKING: Powder cannot splash. Use "Drops" Product Type for Splash Shot.');
    }

    if (productType === 'Device' && options.photoMode?.includes('Ingredient')) {
        errors.push('BLOCKING: Devices do not have ingredient compositions. Use a different Product Type.');
    }

    if (productType === 'Beverage' && options.photoMode?.includes('Ingredient')) {
        errors.push('BLOCKING: Beverages do not use ingredient stacks. Select a different Photo Mode.');
    }

    if ((productType === 'Capsules' || productType === 'Powder' || productType === 'Device') && options.photoMode === 'Foam & Texture') {
        errors.push(`BLOCKING: "${productType}" cannot produce foam or texture effects. Use "Skincare" Product Type.`);
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

// =============================================================================
// MAIN FUNCTION: BUILD PRODUCT TYPE PROMPT
// =============================================================================

/**
 * Build Product Type physical nature prompt with material flags.
 * 
 * This is the PRIMARY EXPORT of this module.
 * 
 * @param productType - The product type (Capsules, Drops, Powder, etc.)
 * @param options - Optional configuration and validation inputs
 * @returns ProductTypeResult with physical prompt, material flags, and validation status
 * 
 * @example
 * ```typescript
 * const result = buildProductTypePrompt('Capsules', {
 *   photoMode: 'Hero Landing Page'
 * });
 * 
 * if (result.isValid) {
 *   const finalPrompt = `${qualityEnforcer} ${photoMode} ${result.physicalPrompt}`;
 * }
 * ```
 */
export function buildProductTypePrompt(
    productType: ProductType,
    options: ProductTypeOptions = {}
): ProductTypeResult {
    // Step 1: Validate compatibility
    const validation = validateProductTypeCompatibility(productType, options);

    if (!validation.isValid) {
        console.error('[Product Type Resolver] Validation failed:', validation.errors);
        return {
            physicalPrompt: '',
            isValid: false,
            validationErrors: validation.errors,
            materialFlags: MATERIAL_FLAGS[productType]
        };
    }

    // Step 2: Get base physical prompt
    const physicalPrompt = PRODUCT_TYPE_PHYSICAL_PROMPTS[productType] || '';

    if (!physicalPrompt) {
        console.warn(`[Product Type Resolver] No physical prompt found for "${productType}"`);
    }

    // Step 3: Get material flags
    const materialFlags = MATERIAL_FLAGS[productType];

    // Step 4: Return result
    return {
        physicalPrompt: physicalPrompt.trim().replace(/\s+/g, ' '),
        isValid: true,
        validationErrors: [],
        materialFlags
    };
}

// =============================================================================
// UTILITY: GET ALL PRODUCT TYPES
// =============================================================================

/**
 * Get list of all available Product Types.
 * Useful for UI dropdowns and validation.
 */
export function getAllProductTypes(): ProductType[] {
    return [
        'Capsules',
        'Drops',
        'Powder',
        'Skincare',
        'Beverage',
        'Device'
    ];
}

/**
 * Check if a Product Type is liquid-based.
 */
export function isLiquidProductType(productType: ProductType): boolean {
    return MATERIAL_FLAGS[productType]?.isLiquid || false;
}

/**
 * Check if a Product Type is rigid.
 */
export function isRigidProductType(productType: ProductType): boolean {
    return MATERIAL_FLAGS[productType]?.isRigid || false;
}
