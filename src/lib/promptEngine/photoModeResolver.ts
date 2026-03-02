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

import { PHOTO_MODE_SCHEMAS } from '../productStudio/photoModeSchema';
import type { PhotoMode as ProductStudioPhotoMode } from '../productStudio/types';

export type PhotoMode = ProductStudioPhotoMode;

const PHOTO_MODE_FORBIDDEN_TERMS = [
    'human',
    'person',
    'people',
    'hands',
    'hand',
    'ugc',
    'lifestyle',
    'selfie',
    'model',
    'holding',
    'presenting',
    'grip',
    'mannequin',
    'active grip'
];

const stripUgcToken = (text: string): string =>
    text.replace(/\bugc\b/gi, '').replace(/\s+/g, ' ').trim();

const findForbiddenPhotoModeTerm = (text: string): string | null => {
    const lower = text.toLowerCase();
    for (const term of PHOTO_MODE_FORBIDDEN_TERMS) {
        const escaped = term.replace(/\s+/g, '\\s+');
        const regex = new RegExp(`(?<![\\w-])${escaped}(?![\\w-])`, 'i');
        if (regex.test(lower)) return term;
    }
    return null;
};

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
    backgroundEnabled?: boolean;
    backgroundType?: 'solid' | 'gradient';
    paletteColors?: { primary?: string; secondary?: string; accent?: string };
    gradientStyle?: 'Soft' | 'Radial' | 'Vertical';
    ingredientLayout?: 'auto' | 'grounded' | 'floating' | 'top-view';
    suggestedProps?: string;

    // Product type (for compatibility checks)
    productType?: ProductType;

    // State (for compatibility checks)
    productState?: ProductState;

    // Schema-driven dynamic settings
    dynamicSettings?: Record<string, string>;
    constraints?: string[];
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
// PHOTO MODE BASE PROMPTS (MIGRATED TO PHOTO_MODE_SCHEMAS)
// =============================================================================

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
    'Beach Foam Splash': {
        propsAllowed: true,
        environmentAllowed: true,
        humansAllowed: false,
        motionAllowed: true,
        bundlesAllowed: false,
        cameraLocked: false
    },
    'Pool Water': {
        propsAllowed: true,
        environmentAllowed: true,
        humansAllowed: false,
        motionAllowed: false,
        bundlesAllowed: false,
        cameraLocked: false
    },
    'Cheers (Hands Clink)': {
        propsAllowed: false,
        environmentAllowed: true,
        humansAllowed: true,
        motionAllowed: true,
        bundlesAllowed: false,
        cameraLocked: false
    },
    'Ice Cubes': {
        propsAllowed: true,
        environmentAllowed: false,
        humansAllowed: false,
        motionAllowed: false,
        bundlesAllowed: false,
        cameraLocked: false
    },
    'Condensation Droplets': {
        propsAllowed: true,
        environmentAllowed: false,
        humansAllowed: false,
        motionAllowed: false,
        bundlesAllowed: false,
        cameraLocked: false
    },
    'Fruit Garnish / Citrus Accents': {
        propsAllowed: true,
        environmentAllowed: false,
        humansAllowed: false,
        motionAllowed: false,
        bundlesAllowed: false,
        cameraLocked: false
    },
    'Textured Bed / Scatter Base': {
        propsAllowed: true,
        environmentAllowed: false,
        humansAllowed: false,
        motionAllowed: false,
        bundlesAllowed: false,
        cameraLocked: false
    },
    'Floating Particles': {
        propsAllowed: false,
        environmentAllowed: false,
        humansAllowed: false,
        motionAllowed: false,
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
        propsAllowed: false,
        environmentAllowed: false,
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

    'Monochrome Brand': {
        propsAllowed: false,
        environmentAllowed: false,
        humansAllowed: false,
        motionAllowed: false,
        bundlesAllowed: false,
        cameraLocked: false
    },
    'Brand Campaign': {
        propsAllowed: false,
        environmentAllowed: false,
        humansAllowed: false,
        motionAllowed: false,
        bundlesAllowed: true,
        cameraLocked: false
    },
    'Creator Premium Simulation': {
        propsAllowed: false,
        environmentAllowed: false,
        humansAllowed: true,
        motionAllowed: false,
        bundlesAllowed: true,
        cameraLocked: false
    },
    'UGC Premium Simulation': {
        propsAllowed: false,
        environmentAllowed: false,
        humansAllowed: true,
        motionAllowed: false,
        bundlesAllowed: true,
        cameraLocked: false
    },
    'Tech Clean Studio': {
        propsAllowed: false,
        environmentAllowed: false,
        humansAllowed: false,
        motionAllowed: false,
        bundlesAllowed: true,
        cameraLocked: false
    },

    'Luxury Editorial Tabletop': {
        propsAllowed: false,
        environmentAllowed: false,
        humansAllowed: false,
        motionAllowed: false,
        bundlesAllowed: true,
        cameraLocked: false
    },

    // Lifestyle atmosphere modes
    'Soft Wellness Morning': {
        propsAllowed: false,
        environmentAllowed: false,
        humansAllowed: false,
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
        propsAllowed: false,
        environmentAllowed: false,
        humansAllowed: false,
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
    },

    // v2.1 realism modes
    'Sunlit Stone Editorial': {
        propsAllowed: false,
        environmentAllowed: true,
        humansAllowed: false,
        motionAllowed: false,
        bundlesAllowed: true,
        cameraLocked: false
    },
    'Golden Sunset Backlit': {
        propsAllowed: false,
        environmentAllowed: true,
        humansAllowed: false,
        motionAllowed: false,
        bundlesAllowed: true,
        cameraLocked: false
    },
    'Bathroom Daylight Clean': {
        propsAllowed: false,
        environmentAllowed: true,
        humansAllowed: false,
        motionAllowed: false,
        bundlesAllowed: true,
        cameraLocked: false
    },
    'Sky Float Minimal': {
        propsAllowed: false,
        environmentAllowed: true,
        humansAllowed: false,
        motionAllowed: false,
        bundlesAllowed: false,
        cameraLocked: false
    },
    'Wet Rock Ripples': {
        propsAllowed: false,
        environmentAllowed: true,
        humansAllowed: false,
        motionAllowed: true,
        bundlesAllowed: false,
        cameraLocked: false
    },
    'Hands Application Clean': {
        propsAllowed: false,
        environmentAllowed: true,
        humansAllowed: true,
        motionAllowed: true,
        bundlesAllowed: false,
        cameraLocked: false
    },
    'Underwater Split': {
        propsAllowed: false,
        environmentAllowed: true,
        humansAllowed: false,
        motionAllowed: true,
        bundlesAllowed: false,
        cameraLocked: false
    },
    'Sand Palm Shadows': {
        propsAllowed: false,
        environmentAllowed: true,
        humansAllowed: false,
        motionAllowed: false,
        bundlesAllowed: true,
        cameraLocked: false
    },
    'Botanical Water Garden': {
        propsAllowed: false,
        environmentAllowed: true,
        humansAllowed: false,
        motionAllowed: true,
        bundlesAllowed: false,
        cameraLocked: false
    },
    'Macro Dew Label': {
        propsAllowed: false,
        environmentAllowed: false,
        humansAllowed: false,
        motionAllowed: false,
        bundlesAllowed: false,
        cameraLocked: true
    },
    'Warm Window Wood': {
        propsAllowed: false,
        environmentAllowed: true,
        humansAllowed: false,
        motionAllowed: false,
        bundlesAllowed: true,
        cameraLocked: false
    },
    'Gel Smear Editorial': {
        propsAllowed: true,
        environmentAllowed: false,
        humansAllowed: false,
        motionAllowed: false,
        bundlesAllowed: false,
        cameraLocked: false
    },
    'Citrus Fresh Flat Lay': {
        propsAllowed: true,
        environmentAllowed: false,
        humansAllowed: false,
        motionAllowed: false,
        bundlesAllowed: false,
        cameraLocked: true
    },
    'Stones & Crystals Flat Lay': {
        propsAllowed: true,
        environmentAllowed: false,
        humansAllowed: false,
        motionAllowed: false,
        bundlesAllowed: false,
        cameraLocked: true
    },
    'Dried Citrus Earth': {
        propsAllowed: true,
        environmentAllowed: false,
        humansAllowed: false,
        motionAllowed: false,
        bundlesAllowed: false,
        cameraLocked: true
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

    'Beach Foam Splash': {
        // Water scene carries the motion; avoid conflicting "product contents stream" behavior.
        allowedStates: ['Static', 'Opened'],
    },

    'Pool Water': {
        // Keep product stable/readable in water contexts.
        allowedStates: ['Static', 'Opened'],
    },

    // Most modes allow all states - default to all
};

// =============================================================================
// SUB-OPTION MODIFIERS
// =============================================================================

function buildBackgroundModifier(
    photoMode: PhotoMode,
    backgroundEnabled?: boolean,
    backgroundType?: 'solid' | 'gradient',
    paletteColors?: { primary?: string; secondary?: string; accent?: string },
    gradientStyle?: 'Soft' | 'Radial' | 'Vertical'
): string {
    const supportsBackground =
        photoMode === 'Hero Landing Page' ||
        photoMode === 'Color Pop Hero' ||
        photoMode === 'Monochrome Brand' ||
        (photoMode === 'Ingredient Stack' && backgroundEnabled === true);
    if (supportsBackground) {
        if (backgroundType === 'gradient' && paletteColors?.primary && paletteColors?.secondary) {
            const styleText =
                gradientStyle === 'Radial'
                    ? 'radial gradient'
                    : gradientStyle === 'Vertical'
                        ? 'vertical gradient'
                        : 'soft gradient';
            return `Background: ${styleText} from ${paletteColors.primary} to ${paletteColors.secondary}.`;
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
    if (photoMode === 'Ingredient Stack' && suggestedProps) {
        return [
            `INGREDIENTS: ${suggestedProps}.`,
            'Ingredients are arranged naturally around the product.',
            'No tower-like ingredient arrangements.',
            'All ingredients rest on the same surface as the product.',
            'Each ingredient has its own grounded contact point.',
            'No floating ingredients. No lab-style ordering.'
        ].join(' ');
    }
    if (photoMode === 'Ingredient Flat Lay' && suggestedProps) {
        const layoutHints: Record<string, string> = {
            auto: 'Arrange in a clean, controlled layout around the product.',
            grounded: 'All ingredients must rest on the same surface as the product. No floating ingredients. Realistic contact shadows.',
            floating: 'Ingredients float around the product at varied depths. No ingredients resting on a surface.',
            'top-view': 'Flat lay top-down arrangement with ingredients placed around the product on a clean surface.'
        };

        return `INGREDIENTS: ${suggestedProps}. ${layoutHints[ingredientLayout || 'auto']}`;
    }
    if (photoMode === 'Ingredient Flat Lay' && !suggestedProps) {
        return [
            'FLAT LAY STRUCTURE: top-down controlled layout on a clean real surface.',
            'No floating objects.',
            'Maintain clear product hierarchy and label readability.'
        ].join(' ');
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

    // Ingredient Flat Lay can run without explicit ingredient list.
    // If no ingredients are provided, the resolver injects flat-lay structure cues.

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

const PHOTO_MODE_MEGA_PROMPT = `
Treat each Photo Mode as a configurable environment, not a flat style.
For each selected environment:
- Apply its environment mood as a base
- Respect lighting, surface, and camera constraints
- Do NOT alter product geometry or label

Do not invent settings outside the provided schema.
If a setting is missing, do not assume it.
The final output must look like a real professional photoshoot,
never like a digital illustration or mockup.
`;

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

    // Step 2: Get schema and base prompt
    const schema = PHOTO_MODE_SCHEMAS[photoMode];
    let basePrompt = schema?.basePrompt || '';

    if (!basePrompt) {
        console.warn(`[Photo Mode] No base prompt found for "${photoMode}"`);
    }

    // Step 3: Build modifiers
    const modifierParts: string[] = [];

    // Background modifier
    if (options.backgroundType || options.paletteColors) {
        const bgMod = buildBackgroundModifier(
            photoMode,
            options.backgroundEnabled,
            options.backgroundType,
            options.paletteColors,
            options.gradientStyle
        );
        if (bgMod) modifierParts.push(bgMod);
    }

    // Ingredient modifier (Ingredient Stack / Flat Lay only)
    if (options.suggestedProps) {
        const ingredientMod = buildIngredientModifier(photoMode, options.suggestedProps, options.ingredientLayout);
        if (ingredientMod) modifierParts.push(ingredientMod);
    }

    // Dynamic schema settings modifier
    if (options.dynamicSettings) {
        Object.entries(options.dynamicSettings).forEach(([category, value]) => {
            const normalizedCategory = String(category || '').trim();
            const normalizedValue = String(value || '').trim();
            if (!normalizedCategory || !normalizedValue) return;

            if (normalizedCategory === 'surfaceType' && normalizedValue === 'None') {
                modifierParts.push('Surface: seamless solid-color plane (flat color field).');
                return;
            }

            if (photoMode === 'Beach Foam Splash' && normalizedCategory === 'shoreline') {
                const shoreline = normalizedValue.toLowerCase();
                if (shoreline === 'backwash') {
                    modifierParts.push(
                        'Shoreline: Backwash receding flow over wet compact sand. Product must be firmly grounded on wet sand (never floating, never submerged), with thin retreating foam wrapping only around the base.'
                    );
                    return;
                }
                if (shoreline === 'wave break') {
                    modifierParts.push(
                        'Shoreline: Wave break contact near the product. Product must remain planted on wet sand while the breaking wave/foam crosses around the base; no open-water floating look.'
                    );
                    return;
                }
                if (shoreline === 'foam line') {
                    modifierParts.push(
                        'Shoreline: Foam line kiss at the sand edge. Product stays grounded on wet sand with a light foam contour near the base only.'
                    );
                    return;
                }
            }

            if (photoMode === 'Beach Foam Splash' && normalizedCategory === 'spray') {
                const spray = normalizedValue.toLowerCase();
                if (spray === 'high') {
                    modifierParts.push(
                        'Spray profile: controlled and directional only; allow just a few crisp micro-droplets near the base and behind the product, never jet-like streams crossing the label.'
                    );
                    return;
                }
                if (spray === 'medium') {
                    modifierParts.push(
                        'Spray profile: subtle premium droplets close to the base, with clean separation and no chaotic splash arcs.'
                    );
                    return;
                }
                if (spray === 'low') {
                    modifierParts.push(
                        'Spray profile: minimal micro-droplets only, mostly confined to the base contact zone.'
                    );
                    return;
                }
            }

            if (photoMode === 'Pool Water' && normalizedCategory === 'waterLevel') {
                const waterLevel = normalizedValue.toLowerCase();
                if (waterLevel === 'out of water (pool edge)') {
                    modifierParts.push(
                        'Water level: Out of water on pool edge. Product is fully outside the water, firmly grounded on the pool coping/deck edge, with the pool water clearly visible behind or beside it. No submerged portion and no floating look.'
                    );
                    return;
                }
                if (waterLevel === 'surface') {
                    modifierParts.push(
                        'Water level: Surface contact. Product is at the water surface with realistic meniscus and contact behavior.'
                    );
                    return;
                }
                if (waterLevel === 'half') {
                    modifierParts.push(
                        'Water level: Half-submerged. Product intersects the waterline at mid-height with physically coherent refraction and reflections.'
                    );
                    return;
                }
                if (waterLevel === 'split') {
                    modifierParts.push(
                        'Water level: Split composition across the waterline with realistic above/below-water optical behavior.'
                    );
                    return;
                }
            }

            if (photoMode === 'Splash Shot' && normalizedCategory === 'motionIntensity') {
                const intensity = normalizedValue.toLowerCase();
                if (intensity === 'explosive') {
                    modifierParts.push(
                        'Splash intensity: energetic but controlled. Keep one dominant splash sheet and secondary droplets only; avoid chaotic multi-directional bursts.'
                    );
                    return;
                }
                if (intensity === 'dynamic') {
                    modifierParts.push(
                        'Splash intensity: dynamic and clean. Maintain a single directional splash path with readable product silhouette.'
                    );
                    return;
                }
            }

            if (photoMode === 'Splash Shot' && normalizedCategory === 'freezeMoment') {
                const freeze = normalizedValue.toLowerCase();
                if (freeze === 'peak') {
                    modifierParts.push(
                        'Freeze timing: capture at peak shape with crisp droplet separation and no motion smear.'
                    );
                    return;
                }
                if (freeze === 'mid-splash') {
                    modifierParts.push(
                        'Freeze timing: mid-action with coherent liquid geometry and clean edge detail.'
                    );
                    return;
                }
            }

            if (photoMode === 'Splash Shot' && normalizedCategory === 'productStability') {
                const stability = normalizedValue.toLowerCase();
                if (stability === 'fully grounded') {
                    modifierParts.push(
                        'Product stability: clearly grounded and physically supported with stable contact shadows.'
                    );
                    return;
                }
                if (stability === 'slight interaction') {
                    modifierParts.push(
                        'Product stability: slight liquid interaction is allowed, but label plane remains unobstructed and readable.'
                    );
                    return;
                }
            }

            if (photoMode === 'Underwater Split' && normalizedCategory === 'waterlineHeight') {
                const level = normalizedValue.toLowerCase();
                if (level === 'mid') {
                    modifierParts.push(
                        'Waterline height: mid-split across the product body. Keep a clear above/below separation with strong meniscus realism at center height.'
                    );
                    return;
                }
                if (level === 'upper-mid') {
                    modifierParts.push(
                        'Waterline height: upper-mid split so more of the product remains underwater while the cap/upper section stays in bright air; maintain coherent waterline curvature.'
                    );
                    return;
                }
            }

            if (photoMode === 'Underwater Split' && normalizedCategory === 'bubbleDensity') {
                const density = normalizedValue.toLowerCase();
                if (density === 'low') {
                    modifierParts.push(
                        'Bubble density: low and premium. Use sparse micro-bubbles near submerged edges only; no chaotic bubble clouds.'
                    );
                    return;
                }
                if (density === 'balanced') {
                    modifierParts.push(
                        'Bubble density: balanced. Add crisp medium-density bubbles around submerged contour zones with clean separation and readable silhouette.'
                    );
                    return;
                }
            }

            if (photoMode === 'Underwater Split' && normalizedCategory === 'aquaTone') {
                const tone = normalizedValue.toLowerCase();
                if (tone === 'light blue') {
                    modifierParts.push(
                        'Aqua tone: clear light-blue water with bright daylight transmission and soft cyan caustic accents.'
                    );
                    return;
                }
                if (tone === 'cyan blue') {
                    modifierParts.push(
                        'Aqua tone: vivid cyan-blue water with luminous clarity, bright caustics, and no dark green cast.'
                    );
                    return;
                }
            }

            if (photoMode === 'Gel Smear Editorial' && normalizedCategory === 'smearWidth') {
                const width = normalizedValue.toLowerCase();
                if (width === 'narrow') {
                    modifierParts.push(
                        'Smear width: narrow and disciplined. Use a thin editorial gel stroke as a supporting accent, never dominating frame hierarchy.'
                    );
                    return;
                }
                if (width === 'balanced') {
                    modifierParts.push(
                        'Smear width: balanced. Medium gel band with clear edge definition and controlled spread around the product base zone.'
                    );
                    return;
                }
                if (width === 'wide') {
                    modifierParts.push(
                        'Smear width: wide. Broad gel sweep with premium control, keeping clean negative space and fully readable label.'
                    );
                    return;
                }
            }

            if (photoMode === 'Gel Smear Editorial' && normalizedCategory === 'surfaceTone') {
                const tone = normalizedValue.toLowerCase();
                if (tone === 'cool gray') {
                    modifierParts.push(
                        'Surface tone: cool gray editorial base with neutral-cool reflectance and clean contrast separation.'
                    );
                    return;
                }
                if (tone === 'neutral stone') {
                    modifierParts.push(
                        'Surface tone: neutral stone material look with subtle tactile variation and grounded premium realism.'
                    );
                    return;
                }
            }

            if (photoMode === 'Gel Smear Editorial' && normalizedCategory === 'textureGloss') {
                const gloss = normalizedValue.toLowerCase();
                if (gloss === 'soft') {
                    modifierParts.push(
                        'Texture gloss: soft satin finish with restrained highlights and smooth roll-off.'
                    );
                    return;
                }
                if (gloss === 'glossy') {
                    modifierParts.push(
                        'Texture gloss: glossy wet finish with crisp specular highlights and controlled reflections.'
                    );
                    return;
                }
            }

            modifierParts.push(`${normalizedCategory.replace(/([A-Z])/g, ' $1').toLowerCase()}: ${normalizedValue}`);
        });
    }

    // Ingredient Stack is a SCIENTIFIC MODE for CURATED ingredients only.
    // User-defined ingredients must ALWAYS use editorial surround layout.
    // Mixing these two is a hard error.
    const isDynamicIngredients =
        photoMode === 'Ingredient Stack' &&
        options.suggestedProps != null &&
        options.suggestedProps.trim().length > 0;

    // Add constraints from options and schema
    // For dynamic Ingredient Stack usage, do NOT inject schema constraints (avoid scientific/stack leakage).
    const allConstraints = isDynamicIngredients
        ? (options.constraints || [])
        : [...(options.constraints || []), ...(schema?.constraints || [])];
    if (allConstraints.length > 0) {
        modifierParts.push(`Strict Constraints: ${allConstraints.join('. ')}`);
    }

    let finalModifiers = modifierParts.join(', ');

    if (photoMode === 'UGC Premium Simulation' || photoMode === 'Creator Premium Simulation') {
        basePrompt = stripUgcToken(basePrompt);
        finalModifiers = stripUgcToken(finalModifiers);
    }

    // Add Mega Prompt instructions if it's an environment mode or has environment flags
    const isEnvironmentMode = schema?.scope === 'environment' || PHOTO_MODE_CONTROL_FLAGS[photoMode]?.environmentAllowed;
    const finalBasePrompt = isEnvironmentMode
        ? `${basePrompt}\nINSTRUCTIONS:\n${PHOTO_MODE_MEGA_PROMPT}`
        : basePrompt;

    const forbiddenTerm = findForbiddenPhotoModeTerm(`${finalBasePrompt} ${finalModifiers}`);
    if (forbiddenTerm) {
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
            validationErrors: [`Photo Mode "${photoMode}" contains forbidden term "${forbiddenTerm}"`]
        };
    }

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
        basePrompt: finalBasePrompt.trim(),
        modifiers: finalModifiers.trim(),
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
        'Splash Shot',
        'Foam & Texture',
        'Routine Carousel',
        'Clinical Lab Counter',
        'Minimal Bathroom Vanity',
        'Dark Premium Studio',
        'Monochrome Brand',
        'Brand Campaign',
        'Creator Premium Simulation',
        'Tech Clean Studio',
        'Soft Wellness Morning',
        'Outdoor Energy Boost',
        'Beach Foam Splash',
        'Pool Water',
        'Cheers (Hands Clink)',
        'Ice Cubes',
        'Condensation Droplets',
        'Fruit Garnish / Citrus Accents',
        'Textured Bed / Scatter Base',
        'Floating Particles',
        // v2.1 realism modes
        'Sunlit Stone Editorial',
        'Golden Sunset Backlit',
        'Bathroom Daylight Clean',
        'Sky Float Minimal',
        'Wet Rock Ripples',
        'Hands Application Clean',
        'Underwater Split',
        'Sand Palm Shadows',
        'Botanical Water Garden',
        'Macro Dew Label',
        'Warm Window Wood',
        'Gel Smear Editorial',
        'Citrus Fresh Flat Lay',
        'Stones & Crystals Flat Lay',
        'Dried Citrus Earth'
    ];
}

/**
 * Check if a Photo Mode is a Studio mode (vs Lifestyle mode).
 */
export function isStudioMode(photoMode: PhotoMode): boolean {
    return PHOTO_MODE_SCHEMAS[photoMode]?.scope === 'studio';
}
