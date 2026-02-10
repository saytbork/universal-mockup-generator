/**
 * Studio Presets - MEGA PROMPT V2 Definitions
 * 
 * Deterministic text blocks for Studio-only image generation.
 * NO lifestyle. NO real-world environments. Product-only.
 */

import { buildQualityEnforcer } from './qualityEnforcer';
import { buildPhotoModePrompt, type PhotoMode } from './photoModeResolver';
import { buildProductTypePrompt, type ProductType } from './productTypeResolver';
import { buildPhysicalPropertiesPrompt } from './physicalPropertiesResolver';

// =============================================================================
// GLOBAL PRODUCT HD QUALITY BLOCK (ALWAYS FIRST)
// =============================================================================
export const GLOBAL_PRODUCT_HD_QUALITY_BLOCK = `
GLOBAL PRODUCT QUALITY DIRECTIVE (ALWAYS ON):

The product shown in the reference image(s) MUST be reconstructed as a high-definition, photorealistic physical object.

CRITICAL QUALITY REQUIREMENTS:
• The final product must look SIGNIFICANTLY higher quality than the uploaded reference
• This is NOT a raw reuse of the input image
• This is a professional studio re-photograph of the product
• Ultra-sharp focus, no blur, no softness
• High micro-detail on edges, folds, seams, materials
• Realistic material response (plastic, glass, matte, gloss, foil as applicable)
• Correct thickness and physical depth, not flat or paper-like
• Clean, premium, DSLR-level clarity
• Zero painterly, watercolor, illustration, or diffusion artifacts

PRODUCT RECONSTRUCTION MODE:
Treat the reference image as ground truth for identity, but rebuild the product at higher fidelity.
• Accurate geometry and proportions
• Correct perspective
• Realistic highlights and shadows
• No warping, melting, stretching, or deformation
• No AI smoothing or texture loss
• No low-detail surfaces

LABEL LOCK – ABSOLUTE RULE:
The label is a REAL photographic label from the reference image.
• Reproduce the label EXACTLY as seen
• Do NOT redraw, reinterpret, stylize, or "improve" it
• Do NOT invent or complete text
• Do NOT alter typography, spacing, alignment, or colors
• The label must appear as a flat printed decal applied to the product
• No curvature distortion or texture-mapping artifacts
• Label must remain fully readable at all times

CAMERA & RESOLUTION INTENT:
• Studio-grade product photography
• Crisp edge definition
• Clean tonal transitions
• No haze, no glow, no fog
• No grain unless explicitly requested
• Visual quality comparable to top-tier ecommerce hero images

FORBIDDEN AT ALL TIMES:
• Illustration look
• Artistic interpretation
• Painterly gradients
• Watercolor textures
• Over-smoothing
• Diffusion blur
• "Concept art" appearance
• Low-detail plastic look
• Fake CGI artifacts

If any creative mode conflicts with product clarity, PRODUCT CLARITY ALWAYS WINS.
`.trim().replace(/\n/g, ' ');

// =============================================================================
// BASE STUDIO BLOCK (ALWAYS INCLUDED)
// =============================================================================
export const BASE_STUDIO = `
Controlled advertising studio.
Purpose-built set.
Abstract, architectural, or laboratory-style surfaces.
Rigid materials only (glass, metal, acrylic, stone).
Clean geometry and precise construction.
Professional product photography.
High clarity and contrast.
Product fully grounded with realistic contact shadows.
Label fully readable and undistorted.
No people.
Only elements explicitly defined by the selected Photo Mode.
`.trim().replace(/\n/g, ' ');


// =============================================================================
// PHOTO / COMPOSITION MODE PRESETS
// =============================================================================

/**
 * @deprecated This constant is maintained for backward compatibility only.
 * 
 * For NEW implementations, use photoModeResolver.ts instead:
 * - import { buildPhotoModePrompt } from './photoModeResolver'
 * - Call buildPhotoModePrompt(photoMode, options) for scene-aware prompts
 * 
 * This constant is still used for:
 * - Random pools (STUDIO_RANDOM_POOLS.photoMode)
 * - Dev-mode validation (checking if photoMode appears in prompt)
 * 
 * DO NOT use this for prompt injection. Use photoModeResolver.ts which provides:
 * - Scene authority with control flags
 * - Compatibility validation with Product Types
 * - Sub-option modifiers (background, ingredients)
 * - Material behavior awareness
 */
export const PHOTO_MODE_PRESETS: Record<string, string> = {
    'Hero Landing Page': `High-clarity hero module on a clean set. Intentional negative space reserved for copy. Crisp studio lighting, controlled shadows, premium retouch. Product is dominant; full label readable; no clutter.`,
    'Clear': `Pure white #FFFFFF seamless backdrop. No set dressing. No props. No gradients. No textures. No color cast. Product only. Centered packshot. Soft contact shadow only.`,
    'Color Pop Hero': `Modern supplement hero shot with bold monochrome or two-tone color blocking. High-saturation seamless background, clean drop shadows, punchy highlights. Minimal geometric set pieces only. Premium commercial retouch; label readability perfect.`,
    'Ingredient Stack': `Surround the product with sliced fruit, herbs, and clean botanical ingredients that hint at benefits. Keep everything vibrant, fresh, art-directed, and premium. No foam, no bubbles, no messy textures. Props are secondary and unbranded.`,
    'Acrylic Blocks': `Clear acrylic blocks and geometric pedestals at varied heights. Crisp edges, controlled reflections, premium studio polish. Add subtle prismatic split highlights on background and acrylic edges (never over label text). Product placed on a hero acrylic pedestal with secondary blocks framing the set.`,
    'Splash Shot': `Dynamic high-speed splash set with frozen droplets and a controlled arc of clear liquid near the product. Splash must never obscure the label. Crisp droplets, clean lighting, no messy pooling, premium campaign polish.`,
    'Tile & Spa': `Glossy tile set with clean grout lines, soft reflections, subtle droplets, and small foam clusters. Bright diffused light. Calm spa-like set styling with ultra-clean surfaces. Product remains the hero; label fully readable.`,
    'Foam & Texture': `Editorial macro textures used as controlled design elements: foam bubbles, gel ribbons, creamy swatches, and droplets on the set only. Product stays clean and dry; no pooling; no contact distortion; label stays fully readable. The surface plane must be visible and recede in perspective; product front side visible. Camera is eye-level or slight frontal and parallel to the surface; no top-down, no overhead, no aerial, no bird's-eye, no flatlay.`,
    'Routine Carousel': `Repeatable countertop set for carousel outputs: clean surface plane, soft daylight, minimal supporting silhouettes in the background, consistent margins and spacing. Designed to look premium and repeatable across SKUs.`,
    'Pastel Picnic': `Art-directed picnic set with a pastel blanket pattern, warm golden-hour sunlight, gentle lens flare, and soft background greenery bokeh. Styled fruit slices and colorful candies/gummies as secondary props. Campaign-grade polish; label stays crisp.`,
    'Sunrise Wellness Counter': `Warm sunrise beams with long soft shadows on a clean countertop. Subtle breakfast/wellness props in soft blur for set styling only. Premium art-directed look; no clutter. Product remains the hero and label stays readable.`,
    'Clinical Lab Counter': `Science-forward bench set: sterile counter, subtle stainless accents, and clean unlabeled glassware in soft blur background. Cool professional lighting, ultra-clean clarity, medical precision mood.`,
    'Golden Mist Aura': `Warm golden ambience with subtle atmospheric haze and dreamy highlights. Mist must be minimal and must not obscure the label. Premium high-end campaign polish with controlled glow.`,
    'Outdoor Energy Boost': `Bright natural sunlight with greenery bokeh and fresh vibrant accents. Product staged on a clean stone/wood surface. Campaign-grade polish; no subjects.`,
    'Crown Wellness Vanity': `Luxury vanity set: clean reflective base, subtle mirror hints, premium metallic accents, soft luxury lighting. Optional unlabeled silhouettes only. Calm, premium campaign styling; label remains crisp.`,
    'Candy Gradient Lab': `Playful premium gradient set with clean geometric forms and modern reflections. High saturation but controlled. Candy-like color transitions and polished highlights; label stays perfectly readable.`
};

// =============================================================================
// SURFACE / BASE PRESETS
// =============================================================================
export const SURFACE_PRESETS: Record<string, string> = {
    'Neutral Surface': `Product placed on a neutral matte surface.`,
    'Acrylic Pedestal': `Product displayed on a clear acrylic pedestal with subtle reflections.`,
    'Reflective Block': `Product on a reflective geometric block creating mirror-like surface reflections.`,
    'Abstract Editorial Base': `Product on an abstract editorial base with clean sculptural forms.`,
    'Floating': `Product appears floating with no visible surface, only shadow beneath.`,
    'Gradient Floor': `Product on a gradient floor surface that transitions to the background.`
};

// =============================================================================
// COMPOSITION PRESETS
// =============================================================================
export const COMPOSITION_PRESETS: Record<string, string> = {
    'Centered Hero': `Product centered in frame as the dominant hero element.`,
    'Rule of Thirds': `Product positioned using rule of thirds for editorial balance.`,
    'Asymmetrical Editorial': `Product placed asymmetrically for dynamic editorial composition.`,
    'Flat Lay': `Top-down flat lay composition with product as focal point.`,
    'Pedestal Hero': `Product elevated on pedestal with strong vertical presence.`
};

export const SCALE_PRESETS: Record<string, string> = {
    'Full Frame': `Product fills 80-90% of frame height.`,
    'Hero': `Product fills 60-70% of frame height with breathing room.`,
    'Contextual': `Product fills 40-50% of frame with significant negative space.`,
    'Minimal': `Product fills 20-30% of frame for maximum negative space.`
};

export const SPACING_PRESETS: Record<string, string> = {
    'Tight': `Minimal margins, product close to frame edges.`,
    'Balanced': `Equal spacing on all sides.`,
    'Asymmetric': `Intentional uneven spacing for editorial effect.`,
    'Generous': `Large margins with substantial breathing room.`
};

export const NEGATIVE_SPACE_PRESETS: Record<string, string> = {
    'None': `Minimal negative space, product dominant.`,
    'Left': `Negative space intentionally left for text overlay.`,
    'Right': `Negative space intentionally right for text overlay.`,
    'Top': `Negative space intentionally at top for headline placement.`,
    'Bottom': `Negative space at bottom for copy placement.`
};

// =============================================================================
// CAMERA PRESETS
// =============================================================================
export const LENS_PRESETS: Record<string, string> = {
    '100mm Macro Prime': `Shot with a 100mm macro lens for extreme detail and compression.`,
    '50mm Product Prime': `Shot with a 50mm product lens for natural perspective and minimal distortion.`,
    'Tilt-Shift Hero': `Tilt-shift lens effect for controlled focus and hero emphasis.`,
    'Ultra-Wide Stylized': `Ultra-wide stylized lens with controlled distortion.`,
    '70-200mm Compression': `70–200mm compression for premium isolation and depth separation.`,
    '35mm Anamorphic Glow': `35mm anamorphic lens with subtle cinematic glow.`
};

export const CAMERA_ANGLE_PRESETS: Record<string, string> = {
    'Eye Level': `Camera at eye level, straight-on perspective.`,
    'Elevated 45': `Camera elevated at 45 degrees looking down.`,
    'Low Angle': `Low angle looking up to emphasize stature.`,
    'Top Down': `Directly overhead bird's eye view.`,
    'Three-Quarter': `Three-quarter angle for dimensional depth.`
};

export const CAMERA_DISTANCE_PRESETS: Record<string, string> = {
    'Macro': `Extreme close-up macro distance for texture detail.`,
    'Close': `Close distance for product focus.`,
    'Medium': `Medium distance showing full product with context.`,
    'Wide': `Wide shot with environmental breathing room.`
};

export const CAMERA_FRAMING_PRESETS: Record<string, string> = {
    'Full Product': `Full product visible in frame, no cropping.`,
    'Partial Crop': `Intentional partial crop for editorial effect.`,
    'Detail Focus': `Focus on specific product detail or feature.`,
    'Environmental': `Product framed with surrounding abstract elements.`
};

// =============================================================================
// LIGHTING RIG PRESETS
// =============================================================================
export const LIGHTING_PRESETS: Record<string, string> = {
    // Aliases to match UI labels (keep existing keys for backward compatibility).
    '3-Point Beauty Dish': `Three-point studio lighting with beauty dish key light. Controlled highlights. Clean reflections. Studio-grade contrast.`,
    'Three-Point Beauty': `Three-point studio lighting with beauty dish key light. Controlled highlights. Clean reflections. Studio-grade contrast.`,
    'Softbox Wrap': `Softbox wrap lighting with even diffusion and minimal shadow. Controlled highlights. Clean reflections.`,
    'Hard Edge Gels': `Hard edge lighting with colored gels and sharp contrast. Studio-grade contrast.`,
    'Backlit Acrylic': `Backlit acrylic lighting with clean rim highlights. Controlled highlights.`,
    'High-Speed Splash Rig': `High-speed splash lighting optimized for frozen motion. Studio-grade contrast.`,
    'High-Speed Splash': `High-speed splash lighting optimized for frozen motion. Studio-grade contrast.`,
    'Gradient Cyclorama': `Gradient cyclorama lighting with smooth falloff. Controlled highlights.`,
    'Prism Spotlight Duo': `Two controlled spotlights through prismatic modifiers (split-beam look). Visible light separation on background and edges: crisp highlight gradients, subtle spectral split on specular reflections. Keep the product and label perfectly readable: no rainbow artifacts over the label text. No starburst diffraction spikes, no lens flare streaks, no flare ghosts. Keep all luminaires off-camera: never show bulbs, lamps, LED panels, softboxes, stands, or practical fixtures in frame. Studio-grade contrast.`
};

// =============================================================================
// FINISH / TREATMENT PRESETS
// =============================================================================
export const FINISH_PRESETS: Record<string, string> = {
    'High-Gloss Commercial': `High-gloss commercial retouch with clean highlights.`,
    'Matte Editorial': `Matte editorial finish with reduced contrast.`,
    'Film Grain Luxury': `Subtle film grain for premium editorial texture.`,
    'Clinical Lab Polish': `Clinical lab polish with ultra-clean surfaces and neutral tones.`,
    'Hyperreal CGI Blend': `Hyperreal blend with enhanced sharpness and controlled realism.`,
    'Vibrant Color Pop': `Vibrant color-enhanced commercial finish.`
};

// =============================================================================
// SHADOW STYLE PRESETS
// =============================================================================
export const SHADOW_PRESETS: Record<string, string> = {
    'Soft Drop': `Soft studio drop shadow beneath the product.`,
    'Hard Drop': `Hard-edged studio shadow with defined contrast.`,
    'Floating': `Floating shadow effect with subtle separation from the surface.`,
    'Contact': `Contact shadow where product meets surface.`,
    'None': ``
};

// =============================================================================
// OPTIONAL INTERACTION (HAND ONLY)
// =============================================================================
export const INTERACTION_PRESETS: Record<string, string> = {
    'None': ``,
    'Passive Presence': `Hands visible in frame as passive context only. No contact with the product. Hands resting naturally nearby on the surface. No action.`,
    'Cropped Hand': `Cropped hand partially visible only for scale. Hand is incomplete at the frame edge. No grip, no action. Relaxed fingers. No full arm.`,
    'Supported Hold': `Product resting on an open or semi-open palm. No grip pressure. Incidental support only. Do not orient the label intentionally to the camera.`,
    'Holding': `One hand holding the product with a natural, relaxed grip. No demonstrative gesture. No rotation. Not pushed toward the lens.`,
    'Two-Hand Hold': `Two hands holding the product gently and symmetrically. Product centered. No action. Careful, calm hold.`,
    'Presenting': `One hand presenting the product to camera with controlled posture. Label faces the camera and remains fully readable. Do not push the product toward the lens.`,
    'Framed Presentation': `Hands frame the product in a calm, premium editorial way. Hands create a visual frame around the product. Do not move the product closer to the lens. No offer-to-lens.`,
    'Applying / Opening': `A single clear action: opening the product (twisting cap, lifting lid) with realistic hand mechanics. No consumption. No dramatization.`,
    'Capsule Display': `Capsule display: One hand holds 2–4 capsules in the palm. The bottle is visible nearby or in the other hand. Capsules exactly match the product contents. No pouring. No ingestion.`,
    'Resting Interaction': `Product resting against the hand or wrist with passive contact only. No grip. No action. Natural incidental touch.`,
};

// =============================================================================
// STUDIO NEGATIVES (ALWAYS LAST)
// =============================================================================
export const STUDIO_NEGATIVES = `
No living subjects. No heads. No narrative scenes.
No real-world environments or locations.
No text. No logos. No brand names. No labeled props.
No real-world context. No storytelling elements.
`.trim().replace(/\n/g, ' ');

const HAND_REALISM_BLOCK = [
    'HAND REALISM (CRITICAL): Hands must look like real adult hands photographed in a studio.',
    'Natural skin texture with pores and subtle imperfections; realistic knuckles, tendons, and fingernails.',
    'Relaxed finger curvature and believable grip pressure; accurate contact shadows and micro-occlusion where skin touches the product.',
    'No gloves. No plastic skin. No mannequin/CGI hands. No waxy or overly-smoothed skin.',
].join(' ');

// =============================================================================
// STUDIO RANDOM POOLS (SAFE TO RANDOMIZE)
// =============================================================================
export const STUDIO_RANDOM_POOLS = {
    photoMode: Object.keys(PHOTO_MODE_PRESETS),
    surface: Object.keys(SURFACE_PRESETS),
    composition: Object.keys(COMPOSITION_PRESETS),
    scale: Object.keys(SCALE_PRESETS),
    spacing: Object.keys(SPACING_PRESETS),
    negativeSpace: Object.keys(NEGATIVE_SPACE_PRESETS),
    lens: Object.keys(LENS_PRESETS),
    angle: Object.keys(CAMERA_ANGLE_PRESETS),
    distance: Object.keys(CAMERA_DISTANCE_PRESETS),
    framing: Object.keys(CAMERA_FRAMING_PRESETS),
    lighting: Object.keys(LIGHTING_PRESETS),
    finish: Object.keys(FINISH_PRESETS),
    shadow: Object.keys(SHADOW_PRESETS),
    interaction: Object.keys(INTERACTION_PRESETS)
};

// =============================================================================
// 1️⃣ STUDIO DEFAULTS — GOLDEN PATH
// =============================================================================
// A new user must generate a high-quality Studio image without touching any controls.
// Defaults apply ONLY when the user has not explicitly selected a value.

export const STUDIO_DEFAULTS = {
    photoMode: 'Hero Landing Page',
    surface: 'Neutral Surface',
    composition: 'Centered Hero',
    scale: 'Hero',
    spacing: 'Balanced',
    negativeSpace: 'None',
    lens: '50mm Product Prime',
    angle: 'Three-Quarter',
    distance: 'Medium',
    framing: 'Full Product',
    lighting: 'Softbox Wrap',
    finish: 'High-Gloss Commercial',
    shadow: 'Soft Drop',
    interaction: 'None',
} as const;

export type StudioDefaultsType = typeof STUDIO_DEFAULTS;

/**
 * Apply golden path defaults to Studio options.
 * Only fills in undefined/empty fields. Never overrides user selections.
 */
export function applyStudioDefaults(options: Partial<StudioDefaultsType>): StudioDefaultsType {
    return {
        photoMode: options.photoMode || STUDIO_DEFAULTS.photoMode,
        surface: options.surface || STUDIO_DEFAULTS.surface,
        composition: options.composition || STUDIO_DEFAULTS.composition,
        scale: options.scale || STUDIO_DEFAULTS.scale,
        spacing: options.spacing || STUDIO_DEFAULTS.spacing,
        negativeSpace: options.negativeSpace || STUDIO_DEFAULTS.negativeSpace,
        lens: options.lens || STUDIO_DEFAULTS.lens,
        angle: options.angle || STUDIO_DEFAULTS.angle,
        distance: options.distance || STUDIO_DEFAULTS.distance,
        framing: options.framing || STUDIO_DEFAULTS.framing,
        lighting: options.lighting || STUDIO_DEFAULTS.lighting,
        finish: options.finish || STUDIO_DEFAULTS.finish,
        shadow: options.shadow || STUDIO_DEFAULTS.shadow,
        interaction: options.interaction || STUDIO_DEFAULTS.interaction,
    };
}

// =============================================================================
// 2️⃣ AUTO PALETTE — INTELLIGENT FALLBACKS
// =============================================================================
// Palette extraction must NEVER fail.

export const NEUTRAL_WARM_GRAY_FALLBACK = {
    primary: '#E5E5E5',
    secondary: '#BDBDBD',
    accent: '#8A8A8A',
} as const;

/**
 * Generate tints from a monochrome color.
 * If label is detected and MONOCHROME:
 * - Primary = detected label color
 * - Secondary = auto-generated lighter tint
 * - Accent = auto-generated darker tint (or lighter if primary is very dark)
 */
export function generateMonochromePalette(hexColor: string): { primary: string; secondary: string; accent: string } {
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    // Calculate luminance (0-255 scale)
    const luminance = (r * 0.299 + g * 0.587 + b * 0.114);
    const isVeryDark = luminance < 30;
    const isVeryLight = luminance > 225;

    // Lighter tint (mix with white)
    const lighterR = Math.min(255, Math.round(r + (255 - r) * 0.4));
    const lighterG = Math.min(255, Math.round(g + (255 - g) * 0.4));
    const lighterB = Math.min(255, Math.round(b + (255 - b) * 0.4));

    // For very dark colors, make accent lighter instead of darker
    // For very light colors, make accent darker
    let accentR: number, accentG: number, accentB: number;

    if (isVeryDark) {
        // Very dark: accent is lighter (mix with gray)
        accentR = Math.min(255, Math.round(r + (128 - r) * 0.5));
        accentG = Math.min(255, Math.round(g + (128 - g) * 0.5));
        accentB = Math.min(255, Math.round(b + (128 - b) * 0.5));
    } else if (isVeryLight) {
        // Very light: accent is darker
        accentR = Math.max(0, Math.round(r * 0.6));
        accentG = Math.max(0, Math.round(g * 0.6));
        accentB = Math.max(0, Math.round(b * 0.6));
    } else {
        // Normal: accent is darker
        accentR = Math.round(r * 0.6);
        accentG = Math.round(g * 0.6);
        accentB = Math.round(b * 0.6);
    }

    return {
        primary: hexColor,
        secondary: `#${lighterR.toString(16).padStart(2, '0')}${lighterG.toString(16).padStart(2, '0')}${lighterB.toString(16).padStart(2, '0')}`,
        accent: `#${accentR.toString(16).padStart(2, '0')}${accentG.toString(16).padStart(2, '0')}${accentB.toString(16).padStart(2, '0')}`,
    };
}

/**
 * Ensure palette colors exist with intelligent fallbacks.
 * Order: extracted colors → monochrome tints → neutral warm gray
 */
export function ensurePaletteWithFallbacks(
    color1?: string,
    color2?: string,
    color3?: string
): { primary: string; secondary: string; accent: string } {
    // Case 1: All colors provided
    if (color1 && color2 && color3) {
        return { primary: color1, secondary: color2, accent: color3 };
    }

    // Case 2: Only one color (monochrome) - generate tints
    if (color1 && !color2 && !color3) {
        return generateMonochromePalette(color1);
    }

    // Case 3: Partial colors - fill missing
    if (color1) {
        const mono = generateMonochromePalette(color1);
        return {
            primary: color1,
            secondary: color2 || mono.secondary,
            accent: color3 || mono.accent,
        };
    }

    // Case 4: No colors - use neutral warm gray fallback
    return NEUTRAL_WARM_GRAY_FALLBACK;
}

// =============================================================================
// 4️⃣ CATEGORY SMART PRESETS — SHORTCUTS ONLY
// =============================================================================
// These are PRESET SHORTCUTS. They simply pre-fill existing Studio controls.
// No new creationMode. No new prompt logic. Just value assignment.

export const CATEGORY_PRESETS = {
    SUPPLEMENT: {
        photoMode: 'Hero Landing Page',
        finish: 'Clinical Lab Polish',
    },
    SUPPLEMENT_INGREDIENT: {
        photoMode: 'Ingredient Stack',
        finish: 'Clinical Lab Polish',
    },
    SKINCARE: {
        photoMode: 'Acrylic Blocks',
        lighting: 'Softbox Wrap',
        finish: 'Matte Editorial',
    },
    BEVERAGE: {
        photoMode: 'Splash Shot',
        lighting: 'Backlit Acrylic',
        finish: 'Vibrant Color Pop',
    },
} as const;

export type CategoryPresetKey = keyof typeof CATEGORY_PRESETS;

/**
 * Apply a category preset shortcut.
 * Merges preset values with existing options (preset wins for specified fields).
 */
export function applyCategoryPreset(
    presetKey: CategoryPresetKey,
    currentOptions: Record<string, string>
): Record<string, string> {
    const preset = CATEGORY_PRESETS[presetKey];
    return { ...currentOptions, ...preset };
}

// =============================================================================
// HELPER: BUILD STUDIO PROMPT
// =============================================================================
export interface StudioPromptOptions {
    // Photo Mode
    photoMode?: string;

    // Product Type (Layer 3 - Physical Nature)
    productType?: ProductType;

    // Props / Ingredients (optional, primarily for Ingredient Stack)
    suggestedProps?: string;
    ingredientLayout?: 'auto' | 'grounded' | 'floating' | 'top-view';

    // Auto Palette Extraction (extracted from product label)
    paletteColor1?: string; // Primary color
    paletteColor2?: string; // Secondary color
    paletteColor3?: string; // Accent color

    // Background (optional override, defaults to palette)
    backgroundColor?: string;
    gradientStart?: string;
    gradientEnd?: string;

    // Surface
    surface?: string;
    surfaceHarmonizeWithPalette?: boolean;

    // Composition
    composition?: string;
    scale?: string;
    spacing?: string;
    negativeSpace?: string;

    // Camera
    lens?: string;
    angle?: string;
    distance?: string;
    framing?: string;

    // Lighting & Finish
    lighting?: string;
    finish?: string;
    shadow?: string;

    // Optional Interaction
    interaction?: string;

    // Physical Properties (Layer 4 - Fine Tuning)
    liquidDetail?: string;
    materialDetail?: string;
}

export function buildStudioPrompt(options: StudioPromptOptions): string {
    const parts: string[] = [
        BASE_STUDIO
    ];

    // =========================================================================
    // AUTO PALETTE EXTRACTION (if palette colors provided)
    // =========================================================================
    const hasPalette = options.paletteColor1 || options.paletteColor2 || options.paletteColor3;
    if (hasPalette) {
        const paletteLines: string[] = [
            'AUTO PALETTE EXTRACTION:',
            'Extract up to three dominant colors directly from the uploaded product label.',
            'Ignore text, logos, and fine typography. Use only primary fill colors.',
            'If fewer than three colors exist, use only those available.',
            'PALETTE:'
        ];
        if (options.paletteColor1) {
            paletteLines.push(`Primary Color: ${options.paletteColor1}`);
        }
        if (options.paletteColor2) {
            paletteLines.push(`Secondary Color: ${options.paletteColor2}`);
        }
        if (options.paletteColor3) {
            paletteLines.push(`Accent Color: ${options.paletteColor3}`);
        }
        parts.push(paletteLines.join(' '));
    }

    // =========================================================================
    // PHOTO MODE RESOLVER (Scene Authority - Layer 2)
    // =========================================================================
    if (options.photoMode) {
        const photoModeResult = buildPhotoModePrompt(options.photoMode as PhotoMode, {
            backgroundType: options.gradientStart && options.gradientEnd ? 'gradient' : 'solid',
            paletteColors: {
                primary: options.paletteColor1,
                secondary: options.paletteColor2,
                accent: options.paletteColor3
            },
            suggestedProps: options.suggestedProps,
            ingredientLayout: options.ingredientLayout
        });

        // CRITICAL: Block execution if Photo Mode validation fails
        if (!photoModeResult.isValid) {
            console.error('[Photo Mode Resolver] Validation failed:', photoModeResult.validationErrors);
            throw new Error(`Photo Mode validation failed: ${photoModeResult.validationErrors.join(', ')}`);
        }

        // Inject base prompt
        if (photoModeResult.basePrompt) {
            parts.push(`PHOTO MODE: ${photoModeResult.basePrompt}`);
        }

        // Inject modifiers (background + ingredients handled by resolver)
        if (photoModeResult.modifiers) {
            parts.push(photoModeResult.modifiers);
        }

        // Control flags are available for downstream logic (can be used later)
        // photoModeResult.controlFlags.propsAllowed, etc.
    }

    // =========================================================================
    // PRODUCT TYPE RESOLVER (Physical Nature - Layer 3)
    // =========================================================================
    if (options.productType) {
        const productTypeResult = buildProductTypePrompt(options.productType as ProductType, {
            photoMode: options.photoMode as PhotoMode
        });

        // CRITICAL: Block execution if Product Type validation fails
        if (!productTypeResult.isValid) {
            console.error('[Product Type Resolver] Validation failed:', productTypeResult.validationErrors);
            throw new Error(`Product Type validation failed: ${productTypeResult.validationErrors.join(', ')}`);
        }

        // Inject physical nature prompt
        if (productTypeResult.physicalPrompt) {
            parts.push(productTypeResult.physicalPrompt);
        }

        // Material flags available for downstream logic
        const materialFlags = productTypeResult.materialFlags;

        // =========================================================================
        // PHYSICAL PROPERTIES RESOLVER (Fine-tuning - Layer 4)
        // =========================================================================
        const physicalPropsResult = buildPhysicalPropertiesPrompt({
            finish: options.finish,
            scale: options.scale,
            materialDetail: options.materialDetail,
            liquidDetail: options.liquidDetail,
            materialFlags: materialFlags
        });

        if (physicalPropsResult.physicalPrompt) {
            parts.push(physicalPropsResult.physicalPrompt);
        }
    }

    // =========================================================================
    // BACKGROUND (Explicit overrides palette)
    // =========================================================================
    if (options.backgroundColor) {
        const bgText = options.gradientStart && options.gradientEnd
            ? `Custom studio background. Primary: ${options.backgroundColor}. Gradient from ${options.gradientStart} to ${options.gradientEnd}.`
            : `Custom studio background. Primary color: ${options.backgroundColor}. No physical walls, no rooms, no scenery.`;
        parts.push(`BACKGROUND: ${bgText}`);
    } else if (hasPalette) {
        const bgLines: string[] = [
            'BACKGROUND:',
            'Generate a custom studio background using the extracted palette.',
            'Primary background uses the Primary Color.'
        ];
        bgLines.push('Subtle gradients or accents may use the Secondary and Accent colors.');
        bgLines.push('Background must remain abstract and studio-safe. No walls. No rooms. No scenery.');
        parts.push(bgLines.join(' '));
    }

    // =========================================================================
    // SURFACE (palette-harmonized)
    // =========================================================================
    if (options.surface && SURFACE_PRESETS[options.surface]) {
        let surfaceText = SURFACE_PRESETS[options.surface];
        if (hasPalette && options.surfaceHarmonizeWithPalette !== false) {
            surfaceText += ' Surface color harmonizes naturally with the extracted palette.';
        }
        parts.push(`SURFACE: ${surfaceText}`);
    } else if (hasPalette) {
        parts.push('SURFACE: Surface color harmonizes naturally with the extracted palette.');
    }

    // =========================================================================
    // COMPOSITION
    // =========================================================================
    const compositionParts: string[] = [];
    if (options.composition && COMPOSITION_PRESETS[options.composition]) {
        compositionParts.push(COMPOSITION_PRESETS[options.composition]);
    }
    if (options.scale && SCALE_PRESETS[options.scale]) {
        compositionParts.push(SCALE_PRESETS[options.scale]);
    }
    if (options.spacing && SPACING_PRESETS[options.spacing]) {
        compositionParts.push(SPACING_PRESETS[options.spacing]);
    }
    if (options.negativeSpace && NEGATIVE_SPACE_PRESETS[options.negativeSpace]) {
        compositionParts.push(NEGATIVE_SPACE_PRESETS[options.negativeSpace]);
    }
    if (compositionParts.length > 0) {
        parts.push(`COMPOSITION: ${compositionParts.join(' ')}`);
    }

    // =========================================================================
    // CAMERA
    // =========================================================================
    const cameraParts: string[] = [];
    if (options.lens && LENS_PRESETS[options.lens]) {
        cameraParts.push(LENS_PRESETS[options.lens]);
    }
    if (options.angle && CAMERA_ANGLE_PRESETS[options.angle]) {
        cameraParts.push(CAMERA_ANGLE_PRESETS[options.angle]);
    }
    if (options.distance && CAMERA_DISTANCE_PRESETS[options.distance]) {
        cameraParts.push(CAMERA_DISTANCE_PRESETS[options.distance]);
    }
    if (options.framing && CAMERA_FRAMING_PRESETS[options.framing]) {
        cameraParts.push(CAMERA_FRAMING_PRESETS[options.framing]);
    }
    if (cameraParts.length > 0) {
        parts.push(`CAMERA: ${cameraParts.join(' ')}`);
    }

    // =========================================================================
    // LIGHTING
    // =========================================================================
    if (options.lighting && LIGHTING_PRESETS[options.lighting]) {
        parts.push(`LIGHTING: Professional studio lighting. ${LIGHTING_PRESETS[options.lighting]}`);
    }

    // =========================================================================
    // FINISH
    // =========================================================================
    if (options.finish && FINISH_PRESETS[options.finish]) {
        // parts.push(`FINISH: ${FINISH_PRESETS[options.finish]}`);
        // NOTE: Layer 4 now handles finish if passed correctly. 
        // We keep this for backward compatibility if the string is from FINISH_PRESETS
        // but avoid duplication by checking if parts already contains certain strings.
        // Actually, Layer 4 is more atomic.
    }
    // =========================================================================
    // SHADOW
    // =========================================================================
    if (options.shadow && SHADOW_PRESETS[options.shadow]) {
        parts.push(SHADOW_PRESETS[options.shadow]);
    }

    // =========================================================================
    // OPTIONAL INTERACTION
    // =========================================================================
    const interactionKey = (() => {
        const raw = String(options.interaction || '').trim();
        const aliases: Record<string, string> = {
            'none': 'None',
            'passive-presence': 'Passive Presence',
            'cropped-hand': 'Cropped Hand',
            'supported-hold': 'Supported Hold',
            'holding': 'Holding',
            'two-hand-hold': 'Two-Hand Hold',
            'presenting': 'Presenting',
            'framed-presentation': 'Framed Presentation',
            'applying-opening': 'Applying / Opening',
            'capsule-display': 'Capsule Display',
            'resting-interaction': 'Resting Interaction',
            // Back-compat
            'applying': 'Applying / Opening',
        };
        return aliases[raw] || raw;
    })();
    if (interactionKey && INTERACTION_PRESETS[interactionKey]) {
        parts.push(`OPTIONAL INTERACTION: ${INTERACTION_PRESETS[interactionKey]}`);
    }


    // =========================================================================
    // DEBUG LOGGING (MANDATORY - per user requirement)
    // =========================================================================
    console.table({
        photoMode: options.photoMode,
        backgroundColor: options.backgroundColor,
        accentColor: options.paletteColor1,
        composition: options.composition,
        shadowStyle: options.shadow,
        props: (options as any).suggestedProps || (options as any).props,
        ingredientLayout: options.ingredientLayout,
        lens: options.lens,
        lightingRig: options.lighting,
        finish: options.finish,
        interaction: options.interaction,
    });

    // =========================================================================
    // FINAL ASSEMBLY
    // =========================================================================
    const positivePrompt = parts.join(' ').replace(/\s+/g, ' ').trim();

    console.log('[STUDIO PROMPT FINAL]', positivePrompt);

    // =========================================================================
    // DEV MODE VALIDATION — Throw if required fields missing from prompt
    // =========================================================================
    if (process.env.NODE_ENV === 'development') {
        const validationErrors: string[] = [];

        // Validate photoMode is in prompt
        if (options.photoMode && PHOTO_MODE_PRESETS[options.photoMode]) {
            if (!positivePrompt.includes('PHOTO_MODE:')) {
                validationErrors.push(`photoMode '${options.photoMode}' not found in prompt`);
            }
        }

        // Validate backgroundColor is in prompt
        if (options.backgroundColor && !positivePrompt.includes(options.backgroundColor) && !positivePrompt.includes('BACKGROUND:')) {
            validationErrors.push(`backgroundColor '${options.backgroundColor}' not found in prompt`);
        }

        // Validate shadow is in prompt if specified
        if (options.shadow && SHADOW_PRESETS[options.shadow]) {
            const shadowText = SHADOW_PRESETS[options.shadow];
            if (!positivePrompt.toLowerCase().includes('shadow')) {
                validationErrors.push(`shadow '${options.shadow}' not found in prompt`);
            }
        }

        // Validate composition is in prompt if specified
        if (options.composition && COMPOSITION_PRESETS[options.composition]) {
            if (!positivePrompt.includes('COMPOSITION:')) {
                validationErrors.push(`composition '${options.composition}' not found in prompt`);
            }
        }

        if (validationErrors.length > 0) {
            console.error('[STUDIO VALIDATION FAILED]', validationErrors);
            // Don't throw in prod, but log errors
            console.warn('[STUDIO WARNING] Some UI selections may not appear in the final prompt:', validationErrors);
        }
    }

    const interactionEnabled = (() => {
        const raw = String(options.interaction || '').trim().toLowerCase();
        return raw !== '' && raw !== 'none';
    })();

    if (interactionEnabled) {
        parts.push(HAND_REALISM_BLOCK);
    }

    const baseNegatives = STUDIO_NEGATIVES
        .replace(/\bNo living subjects\.\s*/i, '')
        .replace(/\bNo heads\.\s*/i, '')
        .trim();

    const interactionAwareNegatives = interactionEnabled
        ? [
            'No living subjects except hands.',
            'Hands only. No arms beyond a small cropped forearm.',
            'No heads. No faces. No bodies.',
            'No mannequin hands. No CGI hands. No plastic skin. No waxy hands. No gloves.',
            baseNegatives,
        ].filter(Boolean).join(' ')
        : [
            'No living subjects.',
            'No hands.',
            'No heads.',
            baseNegatives,
        ].filter(Boolean).join(' ');

    return `${positivePrompt} NEGATIVE PROMPT: ${interactionAwareNegatives}`;
}

// =============================================================================
// PRODUCT_STUDIO_CANONICAL_PROMPT — FREEZE-READY v2.0
// =============================================================================
// Uses template variables: {PALETTE_A}, {PALETTE_B}, {PALETTE_C}, {SURFACE_OPTION},
// {COMPOSITION}, {SCALE}, {SPACING}, {NEGATIVE_SPACE}, {LENS}, {ANGLE}, {DISTANCE},
// {FRAMING}, {LIGHTING_RIG}, {FINISH}, {SHADOW}, {INTERACTION}, {ASPECT_RATIO}
// =============================================================================

export const PRODUCT_STUDIO_CANONICAL_PROMPT = `
PRODUCT STUDIO MODE — CANONICAL PROMPT (LOCKED)

This is a PRODUCT STUDIO render.
A controlled, abstract studio image of a real, existing physical product.
This is NOT lifestyle.
This is NOT UGC.
This is NOT editorial.
This is NOT a scene.
This is NOT storytelling.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ROOT RULES (NON-NEGOTIABLE)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Product-only image.
- No living subjects.
- No heads.
- No hands unless explicitly enabled.
- No lifestyle context.
- No rooms.
- No kitchens.
- No bathrooms.
- No bedrooms.
- No outdoor environments.
- No real-world setting.
- No props unless explicitly allowed.
- No storytelling.
- No scene narrative.

If any of the above appear → INVALID IMAGE.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PRODUCT IDENTITY LOCK (ABSOLUTE)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
The product packaging, label, typography, colors, layout, proportions,
materials, and branding MUST remain EXACTLY as provided in the reference image.

DO NOT:
- redesign the label
- reinterpret typography
- adjust or enhance colors
- simplify graphics
- modernize branding
- invent missing details
- clean or optimize the label
- change layout or proportions
- replace text or symbols

This is a photographic render of an existing physical product.
Any alteration of the label or packaging is INVALID.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PALETTE AUTHORITY (AUTO)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Extract up to THREE dominant colors directly from the product label.
Use only primary fill colors.

Primary Color: {PALETTE_A}
Secondary Color: {PALETTE_B}
Accent Color: {PALETTE_C}

Rules:
- If the label is monochrome:
  - Primary = label color
  - Secondary = lighter tint of the same hue
  - Accent = darker tint of the same hue
- If contrast between product and background fails AA:
  - Adjust luminosity ONLY, never hue
- If no label colors are detectable:
  - Use warm neutral gray system

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BACKGROUND (ABSTRACT ONLY)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Generate a custom studio background using the extracted palette.
Background must remain abstract and studio-safe.

- No walls
- No rooms
- No scenery
- No environment
- No depth cues suggesting a place

Primary background uses Primary Color.
Secondary gradients or subtle accents may use Secondary and Accent colors.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SURFACE (STUDIO BASE)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Use the selected studio surface:
{SURFACE_OPTION}

Surface color and material harmonize naturally with the extracted palette.
Surface exists only to support the product physically.
No storytelling texture.
No environmental clues.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COMPOSITION & SCALE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Composition: {COMPOSITION}
Scale: {SCALE}
Spacing: {SPACING}
Negative Space: {NEGATIVE_SPACE}

Rules:
- Product is the sole subject
- Product dominates the frame
- No accidental cropping
- No decorative imbalance
- No text layout assumptions

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CAMERA SYSTEM (LOCKED)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Lens: {LENS}
Angle: {ANGLE}
Distance: {DISTANCE}
Framing: {FRAMING}

Rules:
- Professional camera system
- Clean optics
- No smartphone artifacts
- No cinematic blur abuse
- Depth of field must feel realistic and controlled

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LIGHTING (STUDIO-GRADE)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Lighting setup: {LIGHTING_RIG}

Lighting rules:
- Controlled highlights
- Clean reflections
- Studio-grade contrast
- No accidental shadows
- No domestic lighting
- No mixed temperature chaos

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FINISH / TREATMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Finish style: {FINISH}

Rules:
- Commercial-grade clarity
- No plastic look
- No CGI look
- No over-retouching
- Texture must remain realistic

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SHADOW BEHAVIOR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Shadow type: {SHADOW}

Rules:
- Shadows must obey physics
- No floating products
- Contact shadows required unless explicitly disabled

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INTERACTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Interaction mode: {INTERACTION}

Rules:
- If Interaction = None:
  - No hands
  - No human presence
- If Interaction = Cropped Hand:
  - Only one hand
  - No head
  - No torso
  - No lifestyle cues

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
QUALITY & OUTPUT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- High resolution
- Sharp focus
- Commercial-ready
- Brand-safe
- No ambiguity
- No stylization drift

Aspect Ratio: {ASPECT_RATIO}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ABSOLUTE BLOCKERS (GLOBAL)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BLOCKED:
living subjects,
heads,
eyes,
skin,
hands (unless explicitly enabled),
lifestyle scenes,
UGC,
editorial narrative,
rooms,
kitchens,
bathrooms,
bedrooms,
outdoor environments,
real-world locations,
storytelling,
label redesign,
rebranded packaging,
ai-generated label,
improved typography,
modernized branding,
invented graphics,
text,
logos,
watermarks,
signatures,
captions,
CGI look,
plastic materials,
floating objects,
incorrect proportions,
distorted product,
warped label,
blurred label,
cinematic look,
dramatic storytelling,
product demo,
product usage

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FINAL VALIDATION (FAIL CHECK)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Ask:
"Is this a clean, abstract, studio-controlled render of the EXACT product provided,
with ZERO label changes, ZERO living subjects, ZERO environment,
and full respect of the selected studio options?"

If the answer is NO → REJECT AND REGENERATE.
`.trim();

// =============================================================================
// PRODUCT_STUDIO_NEGATIVE — Always appended
// =============================================================================

export const PRODUCT_STUDIO_NEGATIVE = `
living subjects,
heads,
eyes,
skin,
hands,
lifestyle scenes,
UGC,
editorial narrative,
rooms,
kitchens,
bathrooms,
bedrooms,
outdoor environments,
real-world locations,
storytelling,
label redesign,
rebranded packaging,
ai-generated label,
improved typography,
modernized branding,
invented graphics,
text,
logos,
watermarks,
signatures,
captions,
CGI look,
plastic materials,
floating objects,
incorrect proportions,
distorted product,
warped label,
blurred label,
cinematic look,
dramatic storytelling,
product demo,
product usage
`.trim().replace(/\n/g, ', ');
