/**
 * Photo Mode Resolver Module
 * 
 * SCENE AUTHORITY - Layer 2 of Pipeline
 * 
 * This module defines the 19 Photo Modes, controls compatibility matrix,
 * and governs what downstream blocks can/cannot do via control flags.
 * 
 * Pipeline Order:
 * 1. Quality Enforcer (foundation)
 * 2. Photo Mode Resolver (scene authority) ← THIS MODULE
 * 3. Product Type (physical nature)
 * 4. Physical Properties
 * 5. State/Interaction
 * 6. Camera
 * 
 * Photo Mode is SCENE AUTHORITY - if Photo Mode says something, no one else redefines it.
 */

// =============================================================================
// TYPES
// =============================================================================

export type PhotoMode =
    // Studio modes (13)
    | 'Hero Landing Page'
    | 'Color Pop Hero'
    | 'Ingredient Stack'
    | 'Ingredient Flat Lay'
    | 'Acrylic Blocks'
    | 'Glass Pedestal Studio'
    | 'Splash Shot'
    | 'Foam & Texture'
    | 'Routine Carousel'
    | 'Clinical Lab Counter'
    | 'Minimal Bathroom Vanity'
    | 'Dark Premium Studio'
    | 'Monochrome Brand World'
    // Lifestyle modes (6)
    | 'Luxury Editorial Tabletop'
    | 'Soft Wellness Morning'
    | 'Golden Hour Lifestyle'
    | 'Outdoor Energy Boost'
    | 'Pastel Picnic'
    | 'Candy Gradient Lab';

export type ProductType =
    | 'Capsules'
    | 'Drops'
    | 'Powder'
    | 'Skincare'
    | 'Beverage'
    | 'Gummies'
    | 'Device'
    | 'Applicator';

export type ProductState =
    | 'Static'
    | 'Opened'
    | 'Dispensing'
    | 'Pouring';

export interface PhotoModeOptions {
    // Sub-option modifiers (optional refinements)
    backgroundType?: 'solid' | 'gradient';
    paletteColors?: { primary?: string; secondary?: string; accent?: string };
    ingredientLayout?: 'auto' | 'grounded' | 'floating' | 'top-view';
    suggestedProps?: string;

    // Product type (for compatibility checks)
    productType?: ProductType;

    // State (for compatibility checks)
    productState?: ProductState;
}

export interface PhotoModeControlFlags {
    propsAllowed: boolean;           // Can use props/ingredients
    environmentAllowed: boolean;     // Can use real-world environment
    humansAllowed: boolean;          // Can include human elements
    motionAllowed: boolean;          // Can have motion/dynamic state
    bundlesAllowed: boolean;         // Can use product bundles
    cameraLocked: boolean;           // Camera settings are locked
}

export interface PhotoModeResult {
    // Prompt sections
    basePrompt: string;              // Core Photo Mode prompt
    modifiers: string;                // Sub-option modifiers (if any)

    // Control flags (govern downstream blocks)
    controlFlags: PhotoModeControlFlags;

    // Compatibility validation
    isValid: boolean;
    validationErrors: string[];
}

// =============================================================================
// PHOTO MODE BASE PROMPTS (19 Total)
// =============================================================================

const STUDIO_PHOTO_MODE_PROMPTS: Record<string, string> = {
    'Hero Landing Page': `
    hero product photography,
    clean high-end studio composition,
    minimalist commercial aesthetic,
    large intentional negative space for copy,
    product isolated as the sole focal point,
    luxury ecommerce advertising style
  `,

    'Color Pop Hero': `
    bold color pop studio photography,
    high-saturation background derived from brand colors,
    modern DTC advertising aesthetic,
    smooth cyclorama with controlled contrast
  `,

    'Ingredient Stack': `
    ingredient-focused product photography,
    editorial exploded ingredient stack,
    clear separation and depth planes,
    scientific yet premium visual language
  `,

    'Ingredient Flat Lay': `
    overhead ingredient flat lay photography,
    editorial wellness composition,
    clean material textures and spacing,
    top-down perspective with controlled shadows
  `,

    'Acrylic Blocks': `
    high-end studio photography using acrylic blocks,
    geometric premium composition,
    controlled reflections and refractions,
    museum-like luxury aesthetic
  `,

    'Glass Pedestal Studio': `
    premium editorial product photography,
    product elevated on sculptural glass pedestal,
    museum-like luxury composition,
    controlled reflections and transparency
  `,

    'Splash Shot': `
    high-speed splash photography,
    realistic liquid physics frozen mid-action,
    premium skincare and beverage advertising style,
    controlled water dynamics
  `,

    'Foam & Texture': `
    macro texture-focused photography,
    sensory material detail emphasis,
    editorial beauty aesthetic,
    controlled foam and gel elements
  `,

    'Routine Carousel': `
    multi-step routine presentation,
    clear visual hierarchy,
    ecommerce carousel-ready composition,
    repeatable styling across SKUs
  `,

    'Clinical Lab Counter': `
    clinical laboratory product photography,
    scientific trust-driven environment,
    precise and minimal composition,
    sterile counter surfaces and subtle equipment
  `,

    'Minimal Bathroom Vanity': `
    minimal bathroom vanity photography,
    clean countertop with subtle bathroom context,
    soft natural light through window,
    premium spa-like aesthetic
  `,

    'Dark Premium Studio': `
    dark premium studio photography,
    low-key lighting with dramatic shadows,
    luxury high-contrast composition,
    moody editorial aesthetic
  `,

    'Monochrome Brand World': `
    monochrome brand world photography,
    single-color abstraction using brand color,
    editorial tonal composition,
    controlled monochromatic gradient
  `
};

const LIFESTYLE_PHOTO_MODE_PROMPTS: Record<string, string> = {
    'Luxury Editorial Tabletop': `
    luxury editorial tabletop photography,
    premium surface with curated styling,
    aspirational lifestyle context,
    controlled depth of field
  `,

    'Soft Wellness Morning': `
    soft wellness morning photography,
    gentle natural light through window,
    calm bedroom or kitchen counter,
    aspirational wellness routine aesthetic
  `,

    'Golden Hour Lifestyle': `
    golden hour lifestyle photography,
    warm sunset light with natural glow,
    outdoor or window-lit environment,
    aspirational brand-safe composition
  `,

    'Outdoor Energy Boost': `
    outdoor energy boost photography,
    bright natural sunlight with greenery bokeh,
    clean outdoor surface,
    fresh vibrant lifestyle aesthetic
  `,

    'Pastel Picnic': `
    pastel picnic photography,
    soft outdoor blanket with warm golden-hour light,
    gentle lens flare and background bokeh,
    curated picnic props and fresh fruit
  `,

    'Candy Gradient Lab': `
    candy gradient lab photography,
    playful premium gradient background,
    modern reflections and clean geometric forms,
    high saturation with controlled polish
  `
};

// =============================================================================
// CONTROL FLAGS PER PHOTO MODE
// =============================================================================

const PHOTO_MODE_CONTROL_FLAGS: Record<string, PhotoModeControlFlags> = {
    'Hero Landing Page': {
        propsAllowed: false,
        environmentAllowed: false,
        humansAllowed: false,
        motionAllowed: false,
        bundlesAllowed: false,
        cameraLocked: true
    },

    'Color Pop Hero': {
        propsAllowed: false,
        environmentAllowed: false,
        humansAllowed: false,
        motionAllowed: false,
        bundlesAllowed: true,
        cameraLocked: false
    },

    'Ingredient Stack': {
        propsAllowed: true,          // REQUIRES ingredients
        environmentAllowed: false,
        humansAllowed: false,
        motionAllowed: false,
        bundlesAllowed: false,
        cameraLocked: false
    },

    'Ingredient Flat Lay': {
        propsAllowed: true,
        environmentAllowed: false,
        humansAllowed: false,
        motionAllowed: false,
        bundlesAllowed: false,
        cameraLocked: true           // Locked to top-down
    },

    'Acrylic Blocks': {
        propsAllowed: false,
        environmentAllowed: false,
        humansAllowed: false,
        motionAllowed: false,
        bundlesAllowed: false,
        cameraLocked: false
    },

    'Glass Pedestal Studio': {
        propsAllowed: false,
        environmentAllowed: false,
        humansAllowed: false,
        motionAllowed: false,
        bundlesAllowed: false,
        cameraLocked: false
    },

    'Splash Shot': {
        propsAllowed: false,
        environmentAllowed: false,
        humansAllowed: false,
        motionAllowed: true,         // Dynamic splash
        bundlesAllowed: false,
        cameraLocked: false
    },

    'Foam & Texture': {
        propsAllowed: true,          // Texture elements allowed
        environmentAllowed: false,
        humansAllowed: false,
        motionAllowed: false,
        bundlesAllowed: false,
        cameraLocked: false
    },

    'Routine Carousel': {
        propsAllowed: true,
        environmentAllowed: false,
        humansAllowed: false,
        motionAllowed: false,
        bundlesAllowed: true,
        cameraLocked: false
    },

    'Clinical Lab Counter': {
        propsAllowed: true,          // Lab equipment allowed as props
        environmentAllowed: false,
        humansAllowed: false,
        motionAllowed: false,
        bundlesAllowed: false,
        cameraLocked: false
    },

    'Minimal Bathroom Vanity': {
        propsAllowed: true,
        environmentAllowed: true,    // Bathroom context
        humansAllowed: false,
        motionAllowed: false,
        bundlesAllowed: true,
        cameraLocked: false
    },

    'Dark Premium Studio': {
        propsAllowed: false,
        environmentAllowed: false,
        humansAllowed: false,
        motionAllowed: false,
        bundlesAllowed: false,
        cameraLocked: false
    },

    'Monochrome Brand World': {
        propsAllowed: false,
        environmentAllowed: false,
        humansAllowed: false,
        motionAllowed: false,
        bundlesAllowed: false,
        cameraLocked: false
    },

    // Lifestyle modes
    'Luxury Editorial Tabletop': {
        propsAllowed: true,
        environmentAllowed: true,
        humansAllowed: true,
        motionAllowed: false,
        bundlesAllowed: true,
        cameraLocked: false
    },

    'Soft Wellness Morning': {
        propsAllowed: true,
        environmentAllowed: true,
        humansAllowed: true,
        motionAllowed: false,
        bundlesAllowed: true,
        cameraLocked: false
    },

    'Golden Hour Lifestyle': {
        propsAllowed: true,
        environmentAllowed: true,
        humansAllowed: true,
        motionAllowed: false,
        bundlesAllowed: true,
        cameraLocked: false
    },

    'Outdoor Energy Boost': {
        propsAllowed: true,
        environmentAllowed: true,
        humansAllowed: true,
        motionAllowed: false,
        bundlesAllowed: true,
        cameraLocked: false
    },

    'Pastel Picnic': {
        propsAllowed: true,
        environmentAllowed: true,
        humansAllowed: true,
        motionAllowed: false,
        bundlesAllowed: true,
        cameraLocked: false
    },

    'Candy Gradient Lab': {
        propsAllowed: false,
        environmentAllowed: false,
        humansAllowed: false,
        motionAllowed: false,
        bundlesAllowed: false,
        cameraLocked: false
    }
};

// =============================================================================
// COMPATIBILITY MATRIX
// =============================================================================

const PHOTO_MODE_PRODUCT_TYPE_COMPATIBILITY: Record<string, {
    forbiddenProductTypes: ProductType[];
}> = {
    'Splash Shot': {
        forbiddenProductTypes: ['Capsules', 'Gummies', 'Powder'],
        // Splash only works with liquid-containing products
    },

    'Ingredient Stack': {
        forbiddenProductTypes: ['Device', 'Applicator'],
        // Ingredients don't make sense for devices
    },

    'Ingredient Flat Lay': {
        forbiddenProductTypes: ['Device', 'Applicator'],
    },

    'Foam & Texture': {
        forbiddenProductTypes: ['Device', 'Applicator'],
    },

    // Most modes have no restrictions - default to empty array
};

const PHOTO_MODE_STATE_COMPATIBILITY: Record<string, {
    allowedStates: ProductState[];
}> = {
    'Hero Landing Page': {
        allowedStates: ['Static', 'Opened'],  // No motion
    },

    'Splash Shot': {
        allowedStates: ['Dispensing', 'Pouring'],  // Requires motion
    },

    'Foam & Texture': {
        allowedStates: ['Static', 'Opened'],
    },

    'Dark Premium Studio': {
        allowedStates: ['Static', 'Opened'],
    },

    // Most modes allow all states - default to all
};

// =============================================================================
// SUB-OPTION MODIFIERS
// =============================================================================

function buildBackgroundModifier(
    photoMode: PhotoMode,
    backgroundType?: 'solid' | 'gradient',
    paletteColors?: { primary?: string; secondary?: string; accent?: string }
): string {
    if (photoMode === 'Hero Landing Page' || photoMode === 'Color Pop Hero' || photoMode === 'Monochrome Brand World') {
        if (backgroundType === 'gradient' && paletteColors?.primary && paletteColors?.secondary) {
            return `Background: smooth gradient from ${paletteColors.primary} to ${paletteColors.secondary}.`;
        }
        if (backgroundType === 'solid' && paletteColors?.primary) {
            return `Background: solid ${paletteColors.primary}.`;
        }
    }
    return '';
}

function buildIngredientModifier(
    photoMode: PhotoMode,
    suggestedProps?: string,
    ingredientLayout?: 'auto' | 'grounded' | 'floating' | 'top-view'
): string {
    if ((photoMode === 'Ingredient Stack' || photoMode === 'Ingredient Flat Lay') && suggestedProps) {
        const layoutHints: Record<string, string> = {
            auto: 'Arrange in a clean, controlled layout around the product.',
            grounded: 'All ingredients must rest on the same surface as the product. No floating ingredients. Realistic contact shadows.',
            floating: 'Ingredients float around the product at varied depths. No ingredients resting on a surface.',
            'top-view': 'Flat lay top-down arrangement with ingredients placed around the product on a clean surface.'
        };

        return `INGREDIENTS: ${suggestedProps}. ${layoutHints[ingredientLayout || 'auto']}`;
    }
    return '';
}

// =============================================================================
// VALIDATION LOGIC
// =============================================================================

function validatePhotoModeCompatibility(
    photoMode: PhotoMode,
    options: PhotoModeOptions
): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check Product Type compatibility
    const typeCompatibility = PHOTO_MODE_PRODUCT_TYPE_COMPATIBILITY[photoMode];
    if (typeCompatibility && options.productType) {
        if (typeCompatibility.forbiddenProductTypes.includes(options.productType)) {
            errors.push(`Photo Mode "${photoMode}" is incompatible with Product Type "${options.productType}"`);
        }
    }

    // CRITICAL: Ingredient Stack REQUIRES ingredients
    if (photoMode === 'Ingredient Stack' && !options.suggestedProps) {
        errors.push('BLOCKING: Ingredient Stack requires ingredients. Execution blocked.');
    }

    // Ingredient Flat Lay also requires ingredients
    if (photoMode === 'Ingredient Flat Lay' && !options.suggestedProps) {
        errors.push('BLOCKING: Ingredient Flat Lay requires ingredients. Execution blocked.');
    }

    // Check State compatibility
    const stateCompat = PHOTO_MODE_STATE_COMPATIBILITY[photoMode];
    if (stateCompat && options.productState) {
        if (!stateCompat.allowedStates.includes(options.productState)) {
            errors.push(`Photo Mode "${photoMode}" does not allow Product State "${options.productState}"`);
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

// =============================================================================
// MAIN FUNCTION: BUILD PHOTO MODE PROMPT
// =============================================================================

/**
 * Build Photo Mode prompt with base + modifiers + control flags.
 * 
 * This is the PRIMARY EXPORT of this module.
 * 
 * @param photoMode - The selected Photo Mode
 * @param options - Optional configuration and validation inputs
 * @returns PhotoModeResult with base prompt, modifiers, control flags, and validation status
 * 
 * @example
 * ```typescript
 * const result = buildPhotoModePrompt('Hero Landing Page', {
 *   backgroundType: 'solid',
 *   paletteColors: { primary: '#FF0000' }
 * });
 * 
 * if (result.isValid) {
 *   const finalPrompt = `${qualityEnforcer} ${result.basePrompt} ${result.modifiers}`;
 * }
 * ```
 */
export function buildPhotoModePrompt(
    photoMode: PhotoMode,
    options: PhotoModeOptions = {}
): PhotoModeResult {
    // Step 1: Validate compatibility
    const validation = validatePhotoModeCompatibility(photoMode, options);

    if (!validation.isValid) {
        console.error('[Photo Mode] Validation failed:', validation.errors);
        return {
            basePrompt: '',
            modifiers: '',
            controlFlags: PHOTO_MODE_CONTROL_FLAGS[photoMode] || {
                propsAllowed: false,
                environmentAllowed: false,
                humansAllowed: false,
                motionAllowed: false,
                bundlesAllowed: false,
                cameraLocked: true
            },
            isValid: false,
            validationErrors: validation.errors
        };
    }

    // Step 2: Get base prompt
    const basePrompt = STUDIO_PHOTO_MODE_PROMPTS[photoMode] ||
        LIFESTYLE_PHOTO_MODE_PROMPTS[photoMode] ||
        '';

    if (!basePrompt) {
        console.warn(`[Photo Mode] No base prompt found for "${photoMode}"`);
    }

    // Step 3: Build modifiers
    const modifierParts: string[] = [];

    // Background modifier
    if (options.backgroundType || options.paletteColors) {
        const bgMod = buildBackgroundModifier(photoMode, options.backgroundType, options.paletteColors);
        if (bgMod) modifierParts.push(bgMod);
    }

    // Ingredient modifier
    if (options.suggestedProps) {
        const ingredMod = buildIngredientModifier(photoMode, options.suggestedProps, options.ingredientLayout);
        if (ingredMod) modifierParts.push(ingredMod);
    }

    const modifiers = modifierParts.join(' ');

    // Step 4: Get control flags
    const controlFlags = PHOTO_MODE_CONTROL_FLAGS[photoMode] || {
        propsAllowed: false,
        environmentAllowed: false,
        humansAllowed: false,
        motionAllowed: false,
        bundlesAllowed: false,
        cameraLocked: true
    };

    // Step 5: Return result
    return {
        basePrompt: basePrompt.trim().replace(/\s+/g, ' '),
        modifiers: modifiers.trim().replace(/\s+/g, ' '),
        controlFlags,
        isValid: true,
        validationErrors: []
    };
}

// =============================================================================
// UTILITY: GET ALL PHOTO MODES
// =============================================================================

/**
 * Get list of all available Photo Modes.
 * Useful for UI dropdowns and validation.
 */
export function getAllPhotoModes(): PhotoMode[] {
    return [
        // Studio modes
        'Hero Landing Page',
        'Color Pop Hero',
        'Ingredient Stack',
        'Ingredient Flat Lay',
        'Acrylic Blocks',
        'Glass Pedestal Studio',
        'Splash Shot',
        'Foam & Texture',
        'Routine Carousel',
        'Clinical Lab Counter',
        'Minimal Bathroom Vanity',
        'Dark Premium Studio',
        'Monochrome Brand World',
        // Lifestyle modes
        'Luxury Editorial Tabletop',
        'Soft Wellness Morning',
        'Golden Hour Lifestyle',
        'Outdoor Energy Boost',
        'Pastel Picnic',
        'Candy Gradient Lab'
    ];
}

/**
 * Check if a Photo Mode is a Studio mode (vs Lifestyle mode).
 */
export function isStudioMode(photoMode: PhotoMode): boolean {
    return photoMode in STUDIO_PHOTO_MODE_PROMPTS;
}
