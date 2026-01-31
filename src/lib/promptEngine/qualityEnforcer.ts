/**
 * Quality Enforcer Module
 * 
 * TRANSVERSAL & ALWAYS ACTIVE
 * 
 * This module centralizes three critical quality directives:
 * 1. Global Quality Enforcers - HD commercial quality requirements
 * 2. Product Reconstruction Rule - Upgrade from low-quality input
 * 3. Label Lock - Absolute label fidelity
 * 
 * This module executes BEFORE any Photo Mode, Product Type, or Scene logic.
 * It is NEVER disabled and applies to ALL generation modes.
 */

// =============================================================================
// TYPES
// =============================================================================

export type InputQuality = 'low' | 'medium' | 'high' | 'auto';

export interface QualityEnforcerOptions {
    /**
     * Detected or specified input quality level.
     * - 'low': Aggressive reconstruction language
     * - 'high': Gentler fidelity language
     * - 'auto': Default (assumes low for safety)
     */
    inputQuality?: InputQuality;

    /**
     * Custom quality overrides (rare, for future extensibility).
     * Allows selective override of individual blocks.
     */
    customQualityOverrides?: Partial<QualityBlocks>;
}

interface QualityBlocks {
    globalQualityEnforcers: string;
    productReconstructionRule: string;
    labelLock: string;
}

// =============================================================================
// BLOCK 1: GLOBAL QUALITY ENFORCERS
// =============================================================================

const GLOBAL_QUALITY_ENFORCERS = `
ultra-high-definition commercial product photography,
extreme clarity and sharpness on product edges,
clean optical focus with no blur or softness on the product,
professional studio-grade lighting,
precise highlights and controlled shadows,
natural material rendering with real-world physics,
no noise, no grain unless explicitly requested,
no compression artifacts,
no low-resolution textures,
no raw camera look,
no amateur lighting,
no washed-out colors,
no flat AI lighting
`.trim().replace(/\n/g, ' ');

// =============================================================================
// BLOCK 2: PRODUCT RECONSTRUCTION RULE
// =============================================================================

/**
 * Build Product Reconstruction Rule based on input quality.
 * 
 * LOW/AUTO: Aggressive reconstruction language
 * HIGH: Gentler fidelity language
 */
function buildProductReconstructionRule(inputQuality: InputQuality): string {
    if (inputQuality === 'low' || inputQuality === 'auto') {
        return `
PRODUCT RECONSTRUCTION (CRITICAL):
If the product source image is blurry, low-resolution, or has amateur lighting,
reconstruct the product visually to match high-end commercial photography standards.
Preserve exact shape, proportions, label layout, and branding.
Upgrade lighting, sharpness, material definition, and realism.
Do not preserve amateur artifacts.
Do not preserve blur, noise, or flat lighting.
    `.trim().replace(/\n/g, ' ');
    }

    // For high-quality inputs, use gentler language
    return `
PRODUCT FIDELITY:
Maintain the product's high-quality appearance.
Preserve shape, proportions, label layout, and branding exactly.
Ensure professional lighting and material rendering.
  `.trim().replace(/\n/g, ' ');
}

// =============================================================================
// BLOCK 3: LABEL LOCK
// =============================================================================

const LABEL_LOCK = `
LABEL LOCK (CRITICAL):
The product label must match the reference image exactly.
Do NOT rewrite, invent, complete, or interpret label text.
Do NOT alter typography, font weight, spacing, or alignment.
Do NOT redraw or stylize the label.
The label must appear optically flat, clean, and high-resolution.
If the product rotates, the label rotates rigidly with it.
No warping, no perspective distortion, no curvature compensation.
Label must face the camera clearly and remain fully readable.
`.trim().replace(/\n/g, ' ');

// =============================================================================
// MAIN FUNCTION: BUILD QUALITY ENFORCER
// =============================================================================

/**
 * Build the complete quality enforcement block.
 * 
 * This is the PRIMARY EXPORT of this module.
 * 
 * @param options - Optional quality enforcer configuration
 * @returns Complete quality enforcement string to prepend to all prompts
 * 
 * @example
 * ```typescript
 * const qualityBlock = buildQualityEnforcer();
 * const finalPrompt = `${qualityBlock} ${photoModePrompt} ${restOfPrompt}`;
 * ```
 */
export function buildQualityEnforcer(options: QualityEnforcerOptions = {}): string {
    const inputQuality = options.inputQuality || 'auto';

    // Build blocks
    const blocks: QualityBlocks = {
        globalQualityEnforcers: GLOBAL_QUALITY_ENFORCERS,
        productReconstructionRule: buildProductReconstructionRule(inputQuality),
        labelLock: LABEL_LOCK,
    };

    // Apply custom overrides if provided (rare)
    if (options.customQualityOverrides) {
        Object.assign(blocks, options.customQualityOverrides);
    }

    // Concatenate in FIXED order (do not change)
    const parts = [
        blocks.globalQualityEnforcers,
        blocks.productReconstructionRule,
        blocks.labelLock,
    ];

    return parts
        .filter(Boolean)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
}

// =============================================================================
// NEGATIVE PROMPT ENHANCEMENT
// =============================================================================

/**
 * Build quality-related negative prompts.
 * 
 * These should be APPENDED to existing negative prompts in the pipeline.
 * 
 * @returns Comma-separated list of forbidden quality terms
 * 
 * @example
 * ```typescript
 * const existingNegatives = "distorted, blurry";
 * const qualityNegatives = buildQualityNegatives();
 * const finalNegatives = `${existingNegatives}, ${qualityNegatives}`;
 * ```
 */
export function buildQualityNegatives(): string {
    return [
        'illustration',
        'AI fantasy',
        'midjourney art look',
        'stock cliché',
        'hyperreal fake lighting',
        'cinematic movie still',
        'soft blurry product',
        'low-resolution product',
        'amateur product photo',
        'raw unprocessed look',
        'concept art',
        'digital painting',
        'painterly product',
    ].join(', ');
}

// =============================================================================
// UTILITY: DETECT INPUT QUALITY (FUTURE)
// =============================================================================

/**
 * Placeholder for future automatic quality detection.
 * 
 * Could analyze:
 * - Image resolution
 * - Blur metrics
 * - Lighting histogram
 * - Noise levels
 * 
 * @param imageData - Product image data (future implementation)
 * @returns Detected quality level
 */
export function detectInputQuality(imageData?: unknown): InputQuality {
    // TODO: Implement actual detection logic
    // For now, default to 'auto' (conservative, assumes low)
    return 'auto';
}
