/**
 * PRODUCT STUDIO PROMPT BUILDERS v2
 * Deterministic prompt generation for Product-only mode
 * With SceneType + BundleMode v2 + Environment enforcement
 */

import type {
    ProductStudioState,
    ProductAsset,
    ProductDefinition,
    ProductGenerationJob,
    BundleLayout,
    BundleSpacing,
    SceneType,
    BundleModeV2,
    PresetTier,
    ProductColor,
    CompositionMode,
    SurfaceBase,
    ProductScale,
    ProductSpacing,
    LightStyle,
    NegativeSpace,
    CreativeTheme,
    PaletteSource,
    PropDensity,
    CameraSystem,
    CameraAngle,
    CameraDistance,
    CameraFraming,
} from './types';

import { routeStudioScenePrompt } from './promptRouter';
import { applyCanonicalPhysicalForMotion } from './motionCoherence';
import { buildEcommercePdpPrompt } from './prompt-builders/buildEcommercePdpPrompt';
import { PHOTO_MODE_SCHEMAS } from './photoModeSchema';

// ============================================================================
// FORBIDDEN TERMS VALIDATION
// ============================================================================

const FORBIDDEN_TERMS = [
    'person', 'people', 'model', 'selfie', 'phone', 'lifestyle',
    'identity', 'influencer', 'creator', 'portrait',
    'human', 'woman', 'man', 'girl', 'boy', 'body',
    'ugc', 'user-generated', 'candid', 'hand', 'hands', 'face',
];

const REQUIRED_CLOSING_PHRASE =
    'The scene must contain only the product and environmental elements. No people, no visible human anatomical elements, no human presence unless explicitly defined by Product Interaction.';

const STRIP_TERMS_WHEN_NO_INTERACTION = [
    'hand',
    'hands',
    'holding',
    'presenting',
    'person',
    'people',
    'human'
];

const SANITIZE_ALWAYS = [
    'creator',
    'identity',
    'influencer',
    'ugc',
    'user-generated',
    'lifestyle',
    'phone',
    'selfie',
    'portrait',
    'model',
];

function stripTermsFromText(text: string, terms: string[]): string {
    let next = text;
    for (const term of terms) {
        const regex = new RegExp(`\\b${term}\\b`, 'gi');
        next = next.replace(regex, '');
    }
    return next
        .replace(/\s+/g, ' ')
        .replace(/,\s*,/g, ',')
        .replace(/\s+\./g, '.')
        .trim();
}

function stripForbiddenTermsExceptClosing(prompt: string, terms: string[]): string {
    if (prompt.includes(REQUIRED_CLOSING_PHRASE)) {
        const parts = prompt.split(REQUIRED_CLOSING_PHRASE);
        const head = stripTermsFromText(parts[0] ?? '', terms);
        return `${head.trim()} ${REQUIRED_CLOSING_PHRASE}`.trim();
    }
    return stripTermsFromText(prompt, terms);
}

function appendClosingPhrase(prompt: string): string {
    if (prompt.includes(REQUIRED_CLOSING_PHRASE)) return prompt;
    const trimmed = prompt.trim();
    const spacer = trimmed.endsWith('.') ? ' ' : '. ';
    return `${trimmed}${spacer}${REQUIRED_CLOSING_PHRASE}`.trim();
}

function sanitizePromptBeforeValidation(prompt: string, options?: { allowHands?: boolean }): string {
    if (import.meta.env.VITE_STRICT_STATE_PROMPT !== 'false') return prompt;
    const terms = [...SANITIZE_ALWAYS];
    if (options?.allowHands !== true) {
        terms.push('hand', 'hands');
    }
    const sanitized = stripForbiddenTermsExceptClosing(prompt, terms);
    return sanitized.replace(/\s+/g, ' ').replace(/\s+,/g, ',').trim();
}

export function validatePrompt(prompt: string, options?: { allowHands?: boolean }): void {
    const lower = prompt.toLowerCase();
    const scrubbed = lower.split(REQUIRED_CLOSING_PHRASE.toLowerCase()).join(' ');
    console.log('[VALIDATION_TARGET] full prompt:', prompt);
    console.log('[VALIDATION_TARGET] scrubbed (closing phrase removed):', scrubbed);
    for (const term of FORBIDDEN_TERMS) {
        // Product Studio can optionally allow a cropped hand interaction.
        // When allowed, we only relax the "hand(s)" filter; people/faces/bodies remain blocked.
        if (options?.allowHands === true && (term === 'hand' || term === 'hands')) {
            continue;
        }
        const escaped = term.replace(/\s+/g, '\\s+');
        const regex = new RegExp(`(?<![\\w-])${escaped}(?![\\w-])`, 'i');
        if (regex.test(scrubbed)) {
            console.error(`[PROMPT BLOCKED] "${term}" found in FULL scrubbed string:`, scrubbed);
            throw new Error(`Prompt contains forbidden term: "${term}"`);
        }
    }
}

// ============================================================================
// BUNDLE VALIDATION
// ============================================================================

export function validateBundleState(state: ProductStudioState): void {
    if (!state.bundle.enabled) return;

    if (state.products.length < 2) {
        throw new Error('[BUNDLE ERROR] Cannot generate bundle with < 2 products');
    }

    if (!state.bundle.primaryProductId) {
        throw new Error('[BUNDLE ERROR] Primary product not set');
    }

    // lifestyle-real cannot have bundles
    if (state.sceneType === 'lifestyle-real') {
        throw new Error('[BUNDLE ERROR] Bundles not allowed in lifestyle-real mode');
    }
}

// ============================================================================
// COLOR VALIDATION
// ============================================================================

// ============================================================================
// REFERENCE PRODUCT DETECTION & CATEGORY STRIP (Gemini/GPT Recommendations)
// ============================================================================

/**
 * Detects if user uploaded actual product images (not generative mode).
 * When true, we MUST NOT describe product semantically (no PRODUCT_TYPE, no PHYSICAL_PROPERTIES).
 * This prevents the model from activating category priors (e.g., "Capsules" → white bottle).
 */
function hasReferenceProductImage(state: ProductStudioState): boolean {
    if (Array.isArray(state.products) && state.products.length > 0) {
        for (const product of state.products) {
            if (!product) continue;
            // Check all possible image fields
            if (typeof product.base64 === 'string' && product.base64.trim().length > 0) return true;
            if (typeof (product as any).imageUrl === 'string' && (product as any).imageUrl.trim().length > 0) return true;
            if (typeof (product as any).url === 'string' && (product as any).url.trim().length > 0) return true;
            if (typeof (product as any).src === 'string' && (product as any).src.trim().length > 0) return true;
            if (typeof (product as any).previewUrl === 'string' && (product as any).previewUrl.trim().length > 0) return true;
        }
    }
    
    // BUNDLE MODE FIX: Check if bundle is enabled with products
    // Even if individual product objects aren't available, if bundle is enabled
    // and has product IDs, assume reference images exist (user uploaded them)
    if (state.bundle?.enabled && state.bundle.primaryProductId) {
        return true; // Bundle mode requires uploaded product references
    }
    
    return false;
}

/**
 * Strips category priors from prompt when reference image exists.
 * Removes: PRODUCT_TYPE, PHYSICAL_PROPERTIES, semantic descriptors, and aggressive frame constraints.
 * This forces the model to treat the product as "pixel-truth" instead of "semantic category".
 */
function stripCategoryPriorsFromPrompt(prompt: string): string {
    return prompt
        // Remove semantic category descriptors
        .replace(/\bPRODUCT_TYPE:[^\n.]*[.\n]?/gi, ' ')
        .replace(/\bPHYSICAL_PROPERTIES:[^\n.]*[.\n]?/gi, ' ')
        .replace(/\bsupplement bottle\b/gi, ' ')
        .replace(/\bcapsule container\b/gi, ' ')
        .replace(/\bpill bottle\b/gi, ' ')
        .replace(/\bcosmetic jar\b/gi, ' ')
        .replace(/\bpackaging type\b/gi, ' ')
        // Replace aggressive frame constraint with proportional version
        .replace(/The product must fill(?: most of)?(?: the)? vertical frame(?: height)? \((?:75.?80|85.?(?:92|88))%[^)]*\)\.?/gi, 
                 'Close-up framing without altering object proportions.')
        .replace(/(?:Tight hero framing(?: for splash mode)?|SPLASH_AD framing)\. The product must fill(?: most of)?(?: the)? vertical frame(?: height)? \((?:75.?80|85.?(?:92|88))%[^)]*\)\./gi,
                 'Close-up framing without altering object proportions.')
        // Cleanup
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Prepends HARD LOCK block at the very beginning (token positioning).
 * When the model reads preservation rules FIRST, it establishes context for everything that follows.
 */
const REFERENCE_PRODUCT_HARD_LOCK = 
    'REFERENCE PRODUCT LOCK: The uploaded product image is the single source of truth. ' +
    'Reproduce the exact same object with zero redesign. ' +
    'Preserve exact geometry, silhouette, cap shape, cap color, neck height, proportions, ' +
    'material finish, surface texture, label layout, typography, alignment, and color relationships. ' +
    'Do not reinterpret. Do not regenerate. Do not restyle. Do not substitute category defaults. ' +
    'Do not improve or redesign packaging. The product must remain pixel-faithful to the reference image. ' +
    'GEOMETRY PRESERVATION: Do not stretch, scale, elongate, inflate, compress, morph, or reshape ' +
    'the object to satisfy framing constraints. If size adjustment is required, simulate camera proximity only. Never modify proportions.';

// ============================================================================
// COLOR VALIDATION (original content continues here)
// ============================================================================

function validateProductColor(color: { hex: string; semanticName: string }, productId: string, field: string): void {
    if (!color.semanticName || color.semanticName === 'neutral' || color.semanticName === '') {
        console.warn(`[COLOR] ${field} using neutral default for ${productId}`);
    }
}

function getColorDescription(color: { hex: string; semanticName: string }): string {
    if (!color.semanticName || color.semanticName === 'neutral' || color.semanticName === 'white') {
        return 'neutral-toned';
    }
    return color.semanticName;
}

function safeHexToColorName(hexRaw: string | null | undefined): string {
    const hex = String(hexRaw || '').trim().toLowerCase();
    if (!hex.startsWith('#')) return 'neutral';
    const value = hex.length === 4
        ? `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`
        : hex;
    const m = /^#([0-9a-f]{6})$/.exec(value);
    if (!m) return 'neutral';
    const int = parseInt(m[1], 16);
    const r = (int >> 16) & 255;
    const g = (int >> 8) & 255;
    const b = int & 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;
    const l = (max + min) / 2 / 255;

    if (delta < 12) {
        if (l > 0.92) return 'white';
        if (l < 0.10) return 'black';
        if (l < 0.22) return 'charcoal';
        if (l < 0.45) return 'gray';
        return 'light gray';
    }

    let h = 0;
    if (max === r) h = ((g - b) / delta) % 6;
    else if (max === g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;
    h = Math.round(h * 60);
    if (h < 0) h += 360;

    const prefix = l > 0.78 ? 'light ' : (l < 0.28 ? 'deep ' : '');
    if (h < 15 || h >= 345) return `${prefix}red`.trim();
    if (h < 45) return `${prefix}orange`.trim();
    if (h < 70) return `${prefix}yellow`.trim();
    if (h < 160) return `${prefix}green`.trim();
    if (h < 200) return `${prefix}teal`.trim();
    if (h < 250) return `${prefix}blue`.trim();
    if (h < 290) return `${prefix}indigo`.trim();
    if (h < 330) return `${prefix}purple`.trim();
    return `${prefix}pink`.trim();
}

// ============================================================================
// PRODUCT BUILDER
// ============================================================================

function buildProductDescription(state: ProductStudioState, product: ProductAsset): string {
    const parts: string[] = [];

    parts.push(`Professional product photography of ${product.name}`);

    // Optional: incorporate known physical height (from Product Gallery) to guide scale realism.
    const heightValueRaw = (product as any)?.heightValue as number | null | undefined;
    const heightUnit = ((product as any)?.heightUnit as 'cm' | 'in' | undefined) ?? 'cm';
    if (typeof heightValueRaw === 'number' && Number.isFinite(heightValueRaw) && heightValueRaw > 0) {
        const cm = heightUnit === 'in' ? heightValueRaw * 2.54 : heightValueRaw;
        const rounded = Math.round(cm * 10) / 10;
        parts.push(`approximately ${rounded} cm tall`);
    }

    if (state.packagingMode === 'with-box') {
        parts.push('product shown with outer box packaging included');
    }

    const scaleMap: Record<ProductStudioState['physicalScaleLabel'], string> = {
        'small-handheld': 'small handheld-sized product',
        'medium-tabletop': 'medium tabletop-sized product',
        'large-object': 'large object-sized product',
    };
    parts.push(scaleMap[state.physicalScaleLabel]);

    const { physical } = state.definition;

    switch (physical.kind) {
        case 'capsules': {
            const v = physical.v;
            const colorDesc = getColorDescription(v.capsuleContentColor);
            parts.push(`${v.capsuleStyle} capsules with ${colorDesc} contents`);
            parts.push(`${v.quantity} capsules in ${v.layout} arrangement`);
            if (v.glassOfWater) parts.push('glass of water nearby');
            if (v.spoon) parts.push('small spoon as prop');
            break;
        }
        case 'gummies': {
            const v = physical.v;
            const colorDesc = getColorDescription(v.gummyColor);
            parts.push(`${v.shape}-shaped gummies in ${colorDesc} color`);
            parts.push(v.quantity === 'handful' ? 'handful of gummies' : `${v.quantity} gummies`);
            if (v.bowl) parts.push('small bowl');
            if (v.plate) parts.push('plate surface');
            break;
        }
        case 'drops': {
            const v = physical.v;
            // Use custom color semanticName if mode is custom, otherwise use mode name
            const liquidColorDesc = v.liquidColorMode === 'custom'
                ? getColorDescription(v.liquidCustomColor)
                : v.liquidColorMode;
            parts.push(`dropper bottle with ${liquidColorDesc} liquid`);
            parts.push(`dropper ${v.dropperState.replace('-', ' ')}`);
            if (v.interactionMode === 'mixed') {
                if (v.glass) parts.push('glass nearby');
                if (v.teaCup) parts.push('tea cup nearby');
                if (v.minimalSpoon) parts.push('minimal spoon');
            }
            break;
        }
        case 'powder': {
            const v = physical.v;
            const colorDesc = getColorDescription(v.powderColor);
            parts.push(`${v.texture} powder with ${colorDesc} color`);
            parts.push(`powder ${v.presentation.replace(/-/g, ' ')}`);
            parts.push(`${v.mixMode} preparation context`);
            if (v.cupOrMug) parts.push('cup or mug');
            if (v.scoop) parts.push('measuring scoop');
            if (v.spoon) parts.push('spoon');
            break;
        }
        case 'skincare': {
            const v = physical.v;
            const colorDesc = getColorDescription(v.color);
            parts.push(`${v.subtype} product with ${v.texture} texture in ${colorDesc} tone`);
            if (v.dispersion === 'drop') {
                parts.push('product drop visible on surface');
            } else if (v.dispersion === 'smear') {
                parts.push('product smear texture visible');
            } else if (v.dispersion === 'dollop') {
                parts.push('product dollop on surface');
            }
            if (v.towel) parts.push('soft towel');
            if (v.sink) parts.push('bathroom sink context');
            if (v.minimalSurfaceOnly) parts.push('clean minimal surface');
            break;
        }
        case 'device': {
            const v = physical.v;
            const colorDesc = getColorDescription(v.color);
            parts.push(`${v.scale} ${v.material} device in ${colorDesc} finish`);
            break;
        }
        case 'custom': {
            const v = physical.v;
            const colorDesc = getColorDescription(v.color);
            parts.push(`${v.scale} product in ${v.material} material with ${colorDesc} color`);
            break;
        }
        case 'dummy':
        default:
            parts.push('product packaging');
    }

    return parts.filter(Boolean).join(', ');
}

// ============================================================================
// BUNDLE BUILDER v2
// ============================================================================

function buildBundleComposition(state: ProductStudioState): string {
    if (!state.bundle.enabled) return '';

    const parts: string[] = [];
    const { mode, layout, spacing, primaryProductId, secondaryProductIds } = state.bundle;

    // Get product names
    const primary = state.products.find(p => p.id === primaryProductId);
    const secondaryCount = secondaryProductIds.length;

    parts.push('PRODUCT BUNDLE COMPOSITION (STRICT)');
    parts.push(`featuring ${secondaryCount + 1} products arranged together`);

    if (primary) {
        parts.push(`primary product (${primary.name}) positioned as visual anchor`);
    }

    // Mode-specific composition
    const modeDescriptions: Record<BundleModeV2, string> = {
        'off': '',
        'hero': 'hero arrangement with primary product prominently featured, secondary products supporting',
        'lineup': 'linear lineup arrangement, products in row formation with equal emphasis',
        'editorial-cluster': 'editorial organic cluster, artistically arranged grouping',
    };
    if (mode !== 'off') {
        parts.push(modeDescriptions[mode]);
    }

    // Layout description
    const layoutMap: Record<BundleLayout, string> = {
        'lineal': 'secondary products arranged in linear formation beside primary',
        'pyramid': 'secondary products arranged in pyramid formation with primary at apex',
        'organic-cluster': 'secondary products arranged in organic cluster around primary',
    };
    parts.push(layoutMap[layout]);

    // Spacing description
    const spacingMap: Record<BundleSpacing, string> = {
        'compact': 'compact spacing between products for cohesive grouping',
        'airy': 'airy spacing between products for breathing room',
    };
    parts.push(spacingMap[spacing]);

    const productsWithHeight = state.products
        .map((p) => {
            const raw = (p as any)?.heightValue as number | null | undefined;
            const unit = ((p as any)?.heightUnit as 'cm' | 'in' | undefined) ?? 'cm';
            if (typeof raw !== 'number' || !Number.isFinite(raw) || raw <= 0) return null;
            const cm = unit === 'in' ? raw * 2.54 : raw;
            const rounded = Math.round(cm * 10) / 10;
            return `${p.name || 'product'} ~${rounded} cm`;
        })
        .filter((v): v is string => Boolean(v));
    if (productsWithHeight.length > 0) {
        parts.push(`CRITICAL SCALE REQUIREMENT: Preserve exact real-world height proportions between all products. ${productsWithHeight.join('; ')}. A ${productsWithHeight[0]?.split('~')[1] || ''} product MUST appear visibly taller/smaller than other products according to their specified heights. DO NOT render all products at equal size.`);
    }

    parts.push('clear visual hierarchy with primary product dominant');
    parts.push('professional ecommerce multi-product photography');

    return parts.join(', ');
}



// ============================================================================
// COMPOSITION & ART DIRECTION BUILDER (Step 4)
// ============================================================================

function buildComposition(state: ProductStudioState): string {
    const parts: string[] = [];

    // 1. Composition Mode (User Control)
    const compMap: Record<CompositionMode, string> = {
        'centered': 'centered hero composition',
        'thirds': 'rule of thirds composition; place the product near a thirds intersection with intentional breathing room',
        'asymmetrical': 'asymmetrical editorial composition; intentional offset balance and negative space',
        'flatlay': 'flat lay top-down composition; overhead camera viewpoint and flat surface plane clearly visible',
        'pedestal': 'pedestal product presentation; product elevated on a base with grounded contact shadow',
    };
    parts.push(compMap[state.composition]);

    // 2. Surface / Base (User Control - Overrides environment surface effectively or compliments it)
    const surfaceMap: Record<SurfaceBase, string> = {
        'neutral': 'clean neutral surface',
        'pedestal': 'geometric pedestal base',
        'acrylic': 'reflective acrylic base',
        'stone': 'natural stone slab base',
        'abstract': 'abstract architectural base',
    };
    parts.push(surfaceMap[state.surface]);

    // 3. Scale (User Control)
    const scaleMap: Record<ProductScale, string> = {
        'dominant': 'product dominates frame',
        'balanced': 'balanced product-to-frame ratio',
        'oversized': 'oversized product presence',
    };
    parts.push(scaleMap[state.scale]);

    // 4. Spacing (User Control)
    const spacingMap: Record<ProductSpacing, string> = {
        'compact': 'compact visual arrangement',
        'balanced': 'balanced visual breathing room',
        'airy': 'airy extensive negative space',
    };
    parts.push(spacingMap[state.spacing]);

    // 5. Negative Space Intent (If not ecommerce blank space)
    if (!state.blankSpaceEnabled && state.negativeSpace !== 'none') {
        const negMap: Record<NegativeSpace, string> = {
            'none': '',
            'subtle': 'subtle negative space for airiness',
            'intentional': 'intentional negative space for copy',
            'heavy': 'heavy minimal negative space',
        };
        parts.push(negMap[state.negativeSpace]);
    }

    // 6. Framing Technicals (keep existing if needed, but driven by composition now)
    // Legacy mapping: keeping some "Framing" references if they don't conflict, 
    // but strictly speaking 'state.framing' might be redundant now if 'composition' takes over.
    // We will trust the new 'composition' field as primary.

    return parts.join(', ');
}

// ============================================================================
// ENVIRONMENT BUILDER (SCENE-AWARE)
// ============================================================================

function buildEnvironment(state: ProductStudioState): string {
    // Ecommerce blank space: environment is irrelevant.
    if (state.blankSpaceEnabled) return '';

    const parts: string[] = [];
    const hasCtx = state.environmentContext !== null;
    const macroRaw = (hasCtx ? (state.environmentContext?.macro ?? '') : state.environmentMacro) as any;
    const microRaw = (hasCtx && Object.prototype.hasOwnProperty.call(state.environmentContext as any, 'micro'))
        ? ((state.environmentContext as any)?.micro ?? '')
        : state.microPlace;

    const macro = typeof macroRaw === 'string' ? macroRaw : '';
    const micro = typeof microRaw === 'string' ? microRaw : '';

    if (!macro || macro === 'studio') {
        return '';
    }

    // Studio branding: treat environment controls as "set styling" cues (abstract, not a real room).
    if (state.sceneType === 'studio-branding') {
        const envText =
            macro === 'cgmp-facility'
                ? 'cGMP dietary supplement manufacturing facility (clean-room production line, stainless steel equipment, filling and packaging stations)'
                : macro === 'custom' && state.customEnvironmentText
                    ? state.customEnvironmentText
                    : macro.replace(/-/g, ' ');

        parts.push(`STUDIO SET: ${envText}-inspired set styling (abstract cues only, not a real location)`);

        const microText =
            micro === 'conveyor-belt'
                ? 'stainless steel conveyor belt'
                : micro === 'filling-line'
                    ? 'stainless steel filling line'
                    : micro === 'custom' && state.customMicroPlaceText
                        ? state.customMicroPlaceText
                        : micro.replace(/-/g, ' ');
        if (microText) {
            parts.push(`base surface cue: ${microText}`);
        }

        return parts.join(', ');
    }

    // Editorial mode: abstracted environment
    if (state.sceneType === 'editorial-product') {
        if (macro === 'cgmp-facility') {
            parts.push('manufacturing facility set with clean stainless steel production surfaces');
        } else {
            parts.push('editorial setting with stylized surface');
        }
        if (micro) {
            const microText =
                micro === 'conveyor-belt'
                    ? 'stainless steel conveyor belt'
                    : micro === 'filling-line'
                        ? 'stainless steel filling line'
                        : micro.replace(/-/g, ' ');
            parts.push(`product placed on ${microText}`);
        }
        parts.push('abstracted environment, no specific room context');
        if (macro === 'cgmp-facility') {
            parts.push('in-process packaging cues: empty line, clean machinery, no visible workers');
        }
    }
    // Lifestyle-real/UGC mode: full environment
    else if (state.sceneType === 'lifestyle-real' || state.sceneType === 'ugc-phone') {
        if (macro === 'cgmp-facility') {
            parts.push(
                'cGMP dietary supplement manufacturing facility setting: clean stainless steel filling line, conveyor belts, guide rails, hopper/nozzle filling heads, spotless clean-room surfaces, industrial production context'
            );
            parts.push(
                'In-process packaging moment: multiple unlabeled amber bottles may appear in the background on the conveyor for context, but only ONE hero product has the exact uploaded label and it must remain perfectly readable'
            );
            parts.push('No staff or operators visible in frame');
        } else {
            const envText =
                macro === 'custom' && state.customEnvironmentText
                    ? state.customEnvironmentText
                    : macro.replace(/-/g, ' ');
            parts.push(`${envText} setting`);
        }

        const microText =
            micro === 'conveyor-belt'
                ? 'stainless steel conveyor belt'
                : micro === 'filling-line'
                    ? 'stainless steel filling line'
                    : micro === 'custom' && state.customMicroPlaceText
                        ? state.customMicroPlaceText
                        : micro.replace(/-/g, ' ');

        if (microText) {
            parts.push(`product placed on ${microText}`);
        }
    }

    // Lighting is now separate step 6
    return parts.join(', ');
}

// ============================================================================
// LIGHTING BUILDER (Step 6)
// ============================================================================

function buildLighting(state: ProductStudioState): string {
    return '';
}

function buildLens(state: ProductStudioState): string {
    return '';
}

function buildFinish(state: ProductStudioState): string {
    return '';
}

function buildAccentColor(state: ProductStudioState): string {
    // Only inject if user deviated from default accent
    const accent = normalizeHexOrEmpty(state.accentColor);
    if (!accent) return '';
    const isDefault = accent.toLowerCase() === '#6366f1';
    if (isDefault) return '';
    return `ACCENT: ${safeHexToColorName(accent)}`;
}

function buildAlignment(state: ProductStudioState): string {
    if (!state.alignment) return '';

    const alignment = String(state.alignment);
    const map: Record<string, string> = {
        'center': 'product centered in frame',
        'centered': 'product centered in frame',
        'left': 'product aligned left in frame',
        'right': 'product aligned right in frame',
        'left-space': 'product aligned left, intentional negative space on right for overlays',
        'right-space': 'product aligned right, intentional negative space on left for overlays',
    };

    return `ALIGNMENT: ${map[alignment] || alignment}`;
}

// ============================================================================
// PRODUCT STATE & MOTION (Product-only)
// ============================================================================

function buildStateMotion(state: ProductStudioState): string {
    const motion = String(state.stateMotion || 'static');
    const { physical } = state.definition;
    const placement = String(state.placement || 'surface');

    const placementText = (() => {
        if (placement === 'supported') {
            return 'Product resting on a visible stand or tray support with grounded contact shadows.';
        }
        if (placement === 'air') {
            return 'Product suspended in controlled air placement with physically plausible anchor shadows and no visible rig.';
        }
        if (placement === 'held') {
            return 'Product held by hands with realistic grip pressure and contact shadows.';
        }
        return 'Product resting on a surface with grounded shadows.';
    })();

    if (motion === 'static') {
        return [
            'PRODUCT_STATE_MOTION: Static.',
            'Product fully assembled.',
            'Cap present and attached.',
            'Contents fully contained.',
            placementText,
            'No motion.',
        ].join(' ');
    }

    if (motion === 'opened') {
        return [
            'PRODUCT_STATE_MOTION: Opened.',
            placement === 'air'
                ? 'Container is open and suspended in controlled air placement.'
                : placement === 'supported'
                    ? 'Container is open and resting on a visible stand or tray support.'
                    : 'Container is open and resting on a surface.',
            'Cap removed and NOT visible anywhere in frame.',
            'Contents remain contained (no mid-air, no spilling).',
            'No motion.',
        ].join(' ');
    }

    // Motion physics (applies to any non-static motion)
    const physics = [
        'gravity downward only',
        'no floating motion',
        'irregular spacing and organic distribution',
        'natural mid-action freeze (no symmetry)',
    ].join(', ');

    const capRule = 'Cap removed and NOT visible anywhere in frame.';

    if (motion === 'falling') {
        if (physical.kind === 'capsules') {
            const v = physical.v;
            const colorDesc = getColorDescription(v.capsuleContentColor);
            return [
                'PRODUCT_STATE_MOTION: Falling.',
                'Container is open and tilted mouth-down.',
                capRule,
                'Contents actively falling due to gravity.',
                `${v.capsuleStyle} capsules with ${colorDesc} contents actively falling in mid-air.`,
                `${physics}.`,
                'Shadows must anchor container and falling contents.',
            ].join(' ');
        }
        if (physical.kind === 'gummies') {
            const v = physical.v;
            const colorDesc = getColorDescription(v.gummyColor);
            return [
                'PRODUCT_STATE_MOTION: Falling.',
                'Container is open and tilted mouth-down.',
                capRule,
                'Contents actively falling due to gravity.',
                `${v.shape}-shaped gummies in ${colorDesc} color actively falling in mid-air.`,
                `${physics}.`,
                'Shadows must anchor container and falling contents.',
            ].join(' ');
        }
        // Fallback wording (validator should prevent this case)
        return [
            'PRODUCT_STATE_MOTION: Falling.',
            'Container is open and tilted mouth-down.',
            capRule,
            'Contents actively falling due to gravity.',
            `Contents actively falling in mid-air. ${physics}.`,
        ].join(' ');
    }

    if (motion === 'pouring') {
        if (physical.kind === 'powder') {
            const v = physical.v;
            const colorDesc = getColorDescription(v.powderColor);
            return [
                'PRODUCT_STATE_MOTION: Pouring.',
                'Container is open and tilted.',
                capRule,
                `Releasing a controlled stream of ${v.texture} powder in ${colorDesc} tone downward.`,
                'Powder falls naturally; no smoke or mist effect.',
                `${physics}.`,
                'Surface exists below with grounded shadows.',
            ].join(' ');
        }
        return [
            'PRODUCT_STATE_MOTION: Pouring.',
            'Container is open and tilted.',
            capRule,
            `Contents releasing downward due to gravity. ${physics}.`,
        ].join(' ');
    }

    if (motion === 'dispensed') {
        if (physical.kind === 'drops') {
            const v = physical.v;
            const liquidColorDesc = v.liquidColorMode === 'custom'
                ? getColorDescription(v.liquidCustomColor)
                : v.liquidColorMode;
            return [
                'PRODUCT_STATE_MOTION: Dispensed.',
                'Container open, stabilized angle (controlled dispensing).',
                capRule,
                `A single ${liquidColorDesc} droplet releases from the dropper tip.`,
                'Realistic surface tension; no streams, no splashes.',
                `${physics}.`,
            ].join(' ');
        }
        if (physical.kind === 'powder') {
            const v = physical.v;
            const colorDesc = getColorDescription(v.powderColor);
            return [
                'PRODUCT_STATE_MOTION: Dispensed.',
                'Container open, stabilized angle (controlled dispensing).',
                capRule,
                `A controlled amount of ${v.texture} powder in ${colorDesc} tone is dispensed onto the surface.`,
                'Powder is at rest on the surface (post-dispense).',
                `Grounded shadows and realistic weight. ${physics}.`,
            ].join(' ');
        }
        return [
            'PRODUCT_STATE_MOTION: Dispensed.',
            'Container open, stabilized angle (controlled dispensing).',
            capRule,
            `A controlled amount of contents is released in an ordered cluster. ${physics}.`,
        ].join(' ');
    }

    if (motion === 'spilled') {
        return [
            'PRODUCT_STATE_MOTION: Spilled.',
            'A visible surface MUST exist (tabletop, studio plinth, or countertop).',
            'Container resting on a surface, tipped on its side.',
            'Container touches the surface with clear contact shadow (fully grounded).',
            'Orientation is horizontal or slightly tilted.',
            'Mouth is open.',
            'Contents spilled onto the surface.',
            'Gravity-resolved distribution.',
            'Grounded contact shadows.',
            'All contents must rest on the surface plane (no mid-air capsules).',
            'No airborne items. No items suspended off the surface plane.',
            'LABEL GEOMETRY LOCK (CRITICAL): Even when the container is tipped, preserve the exact label geometry and typography from the reference. No warped label, no stretched text, no sheared artwork, no curved or melted typography. The label must remain perfectly readable.',
            // Cap handling: allow either out-of-frame or resting nearby on the surface.
            'Cap removed; it may be visible nearby resting on the surface, or fully outside frame.',
        ].join(' ');
    }

    return '';
}

function buildInteraction(state: ProductStudioState): string {
    const allowHands = state.interaction !== 'none';
    if (!allowHands) return '';

    const interactionKey = String(state.interaction || '').trim();
    const presetKey = (() => {
        switch (interactionKey) {
            case 'passive-presence':
                return 'Passive Presence';
            case 'cropped-hand':
                return 'Cropped Hand';
            case 'supported-hold':
                return 'Supported Hold';
            case 'holding':
                return 'Holding';
            case 'two-hand-hold':
                return 'Two-Hand Hold';
            case 'presenting':
                return 'Presenting';
            case 'framed-presentation':
                return 'Framed Presentation';
            case 'applying-opening':
                return 'Applying / Opening';
            case 'capsule-display':
                return 'Capsule Display';
            case 'resting-interaction':
                return 'Resting Interaction';
            // Back-compat for older persisted values
            case 'applying':
                return 'Applying / Opening';
            default:
                return '';
        }
    })();

    if (!presetKey) {
        if (state.handsHolding === true) {
            return [
                'PRODUCT_INTERACTION: Cropped Hand.',
                'Hands and interaction are treated as controlled visual elements, not decoration.',
                'Only one interaction mode is allowed. No hybrid interactions.'
            ].join(' ');
        }
        return '';
    }

    const presetMap: Record<string, string> = {
        'Passive Presence': 'Hands visible in frame as passive context only. No contact with the product. Hands resting naturally nearby on the surface.',
        'Cropped Hand': 'Cropped hand partially visible only for scale. Hand is incomplete at the frame edge. No grip, no action.',
        'Supported Hold': 'Product resting on an open or semi-open palm. No grip pressure. Incidental support only.',
        'Holding': 'One hand holding the product with a natural, relaxed grip. No demonstrative gesture.',
        'Two-Hand Hold': 'Two hands holding the product gently and symmetrically. No action. Calm hold.',
        'Presenting': 'One hand presenting the product to camera with controlled posture. Label faces the camera and remains fully readable.',
        'Framed Presentation': 'Hands frame the product in a calm, premium editorial way. Hands create a visual frame around the product.',
        'Applying / Opening': 'A single clear action: opening the product with realistic hand mechanics. No consumption.',
        'Capsule Display': 'One hand holds 2–4 capsules in the palm. The bottle is visible nearby or in the other hand.',
        'Resting Interaction': 'Product resting against the hand or wrist with passive contact only. No grip. Natural incidental touch.',
    };

    const preset = presetMap[presetKey] || '';
    return [
        `PRODUCT_INTERACTION: ${presetKey}.`,
        preset,
        'Hands and interaction are treated as controlled visual elements, not decoration.',
        'Only one interaction mode is allowed. No hybrid interactions.',
        'Hands must look natural and relaxed. No stiff fingers. No theatrical gestures.',
        'HAND REALISM (CRITICAL): natural skin texture, realistic knuckles and fingernails, believable grip pressure, correct contact shadows and micro-occlusion where skin touches the product.',
        'No mannequin hands. No plastic/rubber look. No CGI hand artifacts.',
        'Product is always the visual hero. Hands never overpower the product.'
    ]
        .filter(Boolean)
        .join(' ');
}

// ============================================================================
// CAMERA BUILDER (Step 8) - COMPREHENSIVE CONTROLS
// ============================================================================

function buildCamera(state: ProductStudioState): string {
    if (state.photoMode === 'Hero Landing Page') return '';

    const parts: string[] = [];

    // CAMERA SYSTEM (DSLR / Macro / Telephoto)
    const cameraSystemMap: Record<CameraSystem, string> = {
        dslr_mirrorless: 'shot on professional DSLR/mirrorless camera, sharp focus, shallow depth of field',
        macro: 'macro lens photography, extreme close-up detail, texture-focused, minimal depth of field',
        telephoto: 'telephoto compression lens, flattened perspective, isolated subject, compressed spatial layers',
    };
    parts.push(cameraSystemMap[state.cameraSystem]);

    // ANGLE (Eye level / 45° / Top-down / Low / High / Detail)
    const angleMap: Record<CameraAngle, string> = {
        eye_level: 'eye-level product angle, straight-on perspective at natural viewing height',
        '45_hero': '45-degree hero angle, dynamic elevated product presentation',
        top_down: 'top-down flat lay angle, direct overhead perspective',
        low_angle: 'low angle power shot, camera positioned below product looking upward, imposing presence',
        high_angle: 'high angle overview, camera positioned above looking downward, comprehensive view',
        detail_closeup: 'extreme close-up detail angle, texture and material emphasis',
    };
    parts.push(angleMap[state.angle]);

    // DISTANCE (Wide / Standard / Tight / Macro)
    const distanceMap: Record<CameraDistance, string> = {
        wide: 'wide camera distance, environmental context visible, product in setting',
        standard: 'standard camera distance, product fills frame appropriately with breathing room',
        tight: 'tight camera distance, product dominates frame with minimal background',
        macro: 'macro camera distance, extreme detail visible, surface textures emphasized',
    };
    parts.push(distanceMap[state.distance]);

    // ROTATION (0° / 5° / 10° / 15°)
    const rotation = Number(state.rotation);
    if (rotation > 0) {
        parts.push(`${rotation}° intentional product rotation for dynamic presentation`);
    }

    // FRAMING GUIDE (Centered / Rule of thirds / Left/Right negative space / Grid-ready)
    const framingMap: Record<CameraFraming, string> = {
        centered_hero: 'centered hero framing, product positioned in center with symmetrical composition',
        rule_of_thirds: 'rule of thirds framing, product positioned at thirds intersection for balanced asymmetry',
        left_negative: 'left-aligned framing, product positioned on left with intentional negative space on right for text overlay',
        right_negative: 'right-aligned framing, product positioned on right with intentional negative space on left for text overlay',
        grid_ready: 'grid-ready framing, social media optimized composition with flexible crop zones',
    };
    parts.push(framingMap[state.framing]);

    // Camera technicals
    parts.push('professional product photography framing');
    parts.push('no accidental cropping of product');
    parts.push('clean background separation');

    return parts.join(', ');
}

// ============================================================================
// SCENE TYPE BUILDER (Step 1)
// ============================================================================

function buildSceneType(state: ProductStudioState): string {
    const map: Record<SceneType, string> = {
        'studio-branding': 'Clean studio product photography',
        'editorial-product': 'High-end editorial product shot',
        // Avoid forbidden term "lifestyle" while still allowing real environments in product-only mode.
        'lifestyle-real': 'Real-world product photography',
        // Avoid forbidden term "phone" (kept for compatibility, but not intended for Product Studio UI)
        'ugc-phone': 'Casual snapshot of product',
        // Ecommerce PDP is a separate pipeline; this label should not be reused as a prompt foundation.
        'ecommerce-pdp': 'Ecommerce PDP image canvas',
        // Hero Landing Page exclusive sceneType
        'studio-hero': 'Studio hero landing page composition'
    };
    return map[state.sceneType];

}

// ============================================================================
// CREATIVITY BUILDER
// ============================================================================

// ============================================================================
// NEW BUILDERS (Synced with Studio Presets)
// ============================================================================

function buildPhotoMode(state: ProductStudioState): string {
    return '';
}

function buildSplashShot(state: ProductStudioState): string {
    return '';
}

function buildMacroTextureCameraBlock(state: ProductStudioState): string {
    return '';
}

function buildBackground(state: ProductStudioState): string {
    return '';
}

function buildShadow(state: ProductStudioState): string {
    return '';
}

// ============================================================================
// CREATIVITY BUILDER
// ============================================================================

function buildCreativity(state: ProductStudioState): string {
    return '';
}

function normalizeHexOrEmpty(input: string | undefined | null): string {
    const value = String(input ?? '').trim();
    if (!value) return '';
    if (/^#[0-9a-fA-F]{6}$/.test(value)) return value;
    return '';
}

// ============================================================================
// ECOMMERCE BUILDER (WITH BUNDLE SUPPORT)
// ============================================================================

function buildEcommerce(state: ProductStudioState): string {
    if (!state.blankSpaceEnabled) {
        return '';
    }

    const parts: string[] = [];

    parts.push('ECOMMERCE COMPOSITION (STRICT)');
    parts.push('asymmetrical product placement');

    // Background directive (Hero Background Engine)
    if (state.gradientEnabled) {
        const start = normalizeHexOrEmpty(state.gradientStart) || normalizeHexOrEmpty(state.backgroundColor) || '#F6F7FB';
        const end = normalizeHexOrEmpty(state.gradientEnd) || start;
        const angle = typeof state.gradientAngle === 'number' ? state.gradientAngle : 180;
        parts.push(`hero background gradient using exact hex ${start.toUpperCase()} and ${end.toUpperCase()} at ${angle} degrees; no texture, no noise`);
    } else {
        const color = normalizeHexOrEmpty(state.backgroundColor) || '#F6F7FB';
        parts.push(`hero background solid using exact hex ${color.toUpperCase()}; flat color; no texture, no noise`);
    }

    // Handle bundle positioning with ecommerce
    if (state.bundle.enabled) {
        const bundleSideMap = {
            'left': 'bundle grouped on right third, explicit negative space on left side for marketing overlays',
            'right': 'bundle grouped on left third, explicit negative space on right side for marketing overlays',
        };
        parts.push(bundleSideMap[state.blankSpaceSide]);
    } else {
        const sideMap = {
            'left': 'product positioned on right third, explicit negative space on left side for marketing overlays',
            'right': 'product positioned on left third, explicit negative space on right side for marketing overlays',
        };
        parts.push(sideMap[state.blankSpaceSide]);
    }

    parts.push('designed for ecommerce overlays, overlays added in post');
    parts.push('clean separation between product and negative space');

    return parts.join(', ');
}

// ============================================================================
// FINAL ASSEMBLER - DETERMINISTIC ORDER
// ============================================================================

function buildAspectRatio(state: ProductStudioState): string {
    const map = {
        '1:1': 'square 1:1 aspect ratio',
        '4:5': 'vertical 4:5 aspect ratio',
        '3:4': 'vertical 3:4 aspect ratio',
        '9:16': 'vertical 9:16 aspect ratio',
        '4:3': 'landscape 4:3 aspect ratio',
        '16:9': 'landscape 16:9 aspect ratio',
    };
    const aspectRatioDesc = map[state.aspectRatio];
    
    // GEMINI FIX: Use optical/physical language to prevent distortion
    // Product references are provided in normalized frames with their exact intended aspect ratio
    return `${aspectRatioDesc}. GEOMETRY LOCK: Each product reference is provided in its exact intended aspect ratio within a normalized frame. DO NOT alter the width-to-height ratio of the subjects. The scene must be rendered as if using a 50mm prime lens with zero distortion. Any empty space in the output must be filled with environmental context (background, surfaces, props, lighting), NEVER by stretching or compressing the product geometry. Maintain rigid orthographic proportions for all products.`;
}

function buildNegativeConstraints(state: ProductStudioState): string {
    const allowHands = state.interaction !== 'none';

    if (allowHands) {
        // Must NOT include forbidden human terms ("people", "person", "face", "body", "human", etc).
        // "hand" is only allowed when `allowHands` is true (validated upstream).
        return [
            'product only',
            'single cropped hand and partial forearm at the edge of frame is allowed',
            'no heads, no torsos, no full figure',
            'hand must be anatomically correct (five fingers), realistic proportions, no deformities',
            'no animals, no digital devices, no user content',
            'clean composition, commercial standard, high resolution',
            'deep depth of field (no shallow DOF), product and hand on the same focus plane',
            'no blur on product, no soft-focus label',
            'no warped or unreadable label typography',
        ].join(', ');
    }

    return [
        'product only, inanimate objects only',
        'no animals, no digital devices, no user content',
        'clean composition, commercial standard, high resolution',
        'deep depth of field (no shallow DOF), tack-sharp product',
        'no blur on product, no soft-focus label',
        'no warped or unreadable label typography',
    ].join(', ');
}

function buildQualityBar(state: ProductStudioState): string {
    const allowHands = state.interaction !== 'none';
    if (allowHands) {
        const interaction = String(state.interaction || '').trim();
        const handsDescriptor = (() => {
            switch (interaction) {
                case 'two-hand-hold':
                    return 'product held with two hands only (no head, no torso), tack-sharp label';
                case 'framed-presentation':
                    return 'product framed by hands only (no head, no torso), tack-sharp label';
                case 'capsule-display':
                    return 'product with capsules displayed in hand (no head, no torso), tack-sharp label';
                case 'passive-presence':
                    return 'product with passive hands in frame (no contact), tack-sharp label';
                case 'cropped-hand':
                    return 'product with cropped hand for scale only, tack-sharp label';
                default:
                    return 'product with a natural hand interaction, tack-sharp label';
            }
        })();
        return `real ecommerce hero image, premium commercial product photography, ultra clean, high resolution, commercial-ready, no ambiguity, art-directed, brand-safe, ${handsDescriptor}`;
    }
    return 'real ecommerce hero image, premium commercial product photography, ultra clean, high resolution, commercial-ready, no ambiguity, art-directed, brand-safe, inanimate objects only, tack-sharp label';
}

function buildIntegrityConstraints(state: ProductStudioState): string {
    // Keep this free of forbidden human terms.
    const motion = String(state.stateMotion || 'static');
    const isStatic = motion === 'static';
    const base = [
        'single product only (unless bundle mode)',
        isStatic
            ? 'product must be fully assembled and physically plausible'
            : 'product must be physically plausible for the selected PRODUCT_STATE_MOTION (no hybrid states)',
        'no duplicates of the product',
        'no broken, warped, melted, or deformed objects',
        'no floating parts, no separated components',
        isStatic
            ? 'no partial or missing parts (cap/lid closed, label aligned and intact)'
            : 'no partial or missing structural parts (label, threads, neck/collar, and opening must be intact). Cap/closure may be removed per motion and must not appear unless motion is Static.',
        'no letterbox or pillarbox bars',
        'no mirrored edge extension, no duplicated side strips, no blurred side-fill bands',
        'scene content must fill the full requested aspect ratio edge-to-edge (no fake padding or border-like filler)',
    ];

    if (state.aspectRatio === '1:1') {
        base.push(
            'square integrity lock: render native 1:1 composition with true scene detail to all four edges (top, bottom, left, right)',
            'no narrow centered subject with synthetic side expansion, no vertical edge cloning, no blurred lateral padding'
        );
    }

    return base.join(', ');
}

function enforceMotionPromptCoherence(prompt: string, state: ProductStudioState): string {
    const motion = String(state.stateMotion || 'static');
    if (!(motion === 'falling' || motion === 'spilled')) return prompt;

    let next = prompt;
    const forbiddenBase = [
        'Product fully assembled.',
        'Cap present and attached.',
        'Contents fully contained.',
        'PRODUCT_STATE_MOTION: Static.',
        'PRODUCT_STATE_MOTION: Opened.',
        'PRODUCT_STATE_MOTION: Dispensed.',
        'PRODUCT_STATE_MOTION: Pouring.',
    ];
    const forbidden = motion === 'falling'
        ? [...forbiddenBase, 'PRODUCT_STATE_MOTION: Spilled.']
        : [...forbiddenBase, 'PRODUCT_STATE_MOTION: Falling.'];
    for (const phrase of forbidden) {
        next = next.split(phrase).join('');
    }

    const required = motion === 'falling'
        ? [
            'Container is open and tilted mouth-down.',
            'Cap removed and NOT visible anywhere in frame.',
            'Contents actively falling due to gravity.',
        ]
        : [
            'Container resting on a surface, tipped on its side.',
            'Contents spilled onto the surface.',
            'Gravity-resolved distribution.',
            'Grounded contact shadows.',
        ];
    for (const phrase of required) {
        if (!next.includes(phrase)) {
            next = `${next}, ${phrase}`;
        }
    }

    if (motion === 'spilled') {
        // Enforce "no airborne/levitating" language by removing the banned terms entirely.
        const bannedTerms = [
            'floating',
            'mid-air',
            'falling through space',
            'suspended',
            'levitating',
        ];
        for (const t of bannedTerms) {
            const re = new RegExp(`\\b${t.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\\\$&')}\\b`, 'gi');
            next = next.replace(re, '');
        }
    }

    return next
        .replace(/\(\s*no\s*\)/gi, '')
        .replace(/\(\s*\)/g, '')
        .replace(/\s+/g, ' ')
        .replace(/,\s*,/g, ',')
        .trim();
}

// ============================================================================
// LABEL LOCK (CRITICAL)
// ============================================================================

function buildLabelLock(): string {
    return [
        'LABEL LOCK (CRITICAL): The product label is a real photographic label from the reference image and must be reproduced exactly as seen.',
        'Do not rewrite, invent, complete, or retype label text.',
        'Do not redraw label artwork; do not change typography, font weight, spacing, or alignment.',
        'Do not warp, curve, stretch, distort, or texture-map the label.',
        'If the bottle rotates, the label rotates rigidly with it and preserves original proportions.',
        'Natural perspective from camera angle is allowed, but avoid extreme oblique views that reduce readability.',
    ].join(' ');
}

function buildProductDesignLock(state: ProductStudioState): string {
    const placement = String(state.placement || 'surface');
    const placementRule =
        placement === 'supported'
            ? 'Supported placement rule: support can touch the product, but product geometry and silhouette must stay unchanged.'
            : placement === 'air'
                ? 'Air placement rule: suspension effect must not bend, stretch, squash, or redesign the product geometry.'
                : 'Surface/held placement rule: contact points must not deform packaging structure or printed artwork.';

    return [
        'PRODUCT DESIGN LOCK (CRITICAL): Reproduce the uploaded product design exactly.',
        'Do not redesign packaging shape, bottle geometry, cap proportions, neck/collar dimensions, or silhouette.',
        'Do not alter brand artwork, logo shapes, iconography, printed patterns, or label composition.',
        'Preserve exact color relationships, material finish character, and packaging proportions from the reference.',
        'No warping, bulging, melted edges, stretched labels, altered aspect ratios, or invented design variants.',
        placementRule,
    ].join(' ');
}

function resolveVisualIntentFromQualityProfile(
    qualityProfile: ProductStudioState['qualityProfile']
): ProductStudioState['visualIntent'] {
    return qualityProfile === 'ecommerce-conversion' ? 'conversion' : 'campaign';
}

const STRICT_STATE_PROMPT = import.meta.env.VITE_STRICT_STATE_PROMPT !== 'false';
const ENABLE_PROTECTION_LIGHT = import.meta.env.VITE_PROMPT_PROTECTION_LIGHT === 'true';
const ENABLE_STRICT_PACKAGING_LOCK = import.meta.env.VITE_PROMPT_STRICT_PACKAGING_LOCK === 'true';
const ALLOW_EMPTY_WORLD_IN_STRICT = true;

function normalizePromptSegments(parts: string[]): string[] {
    const out: string[] = [];
    const seen = new Set<string>();
    for (const raw of parts) {
        const value = String(raw || '').trim();
        if (!value) continue;
        if (seen.has(value)) continue;
        seen.add(value);
        out.push(value);
    }
    return out;
}

function buildPhotoModeFeatureParts(state: ProductStudioState): string[] {
    const mode = String(state.photoMode || '').trim();
    if (!mode) return [];

    const cfg = state.photoModeConfig;
    const features: string[] = [];

    if (mode === 'Hero Landing Page') {
        const v = cfg.heroLandingPage;
        features.push(
            `backgroundType=${v.backgroundType}`,
            `gradientStyle=${v.gradientStyle}`,
            `colorSource=${v.colorSource}`,
            `paletteSource=${v.paletteSource}`,
            `negativeSpace=${v.negativeSpace}`,
            `contrastLevel=${v.contrastLevel}`
        );
    } else if (mode === 'Color Pop Hero') {
        const v = cfg.colorPopHero;
        features.push(
            `backgroundType=${v.backgroundType}`,
            `gradientStyle=${v.gradientStyle}`,
            `colorSource=${v.colorSource}`,
            `saturationLevel=${v.saturationLevel}`,
            `contrastStrategy=${v.contrastStrategy}`,
            `negativeSpace=${v.negativeSpace}`
        );
    } else if (mode === 'Ingredient Stack') {
        const v = cfg.ingredientStack;
        features.push(
            `ingredientFocus=${v.ingredientFocus}`,
            `stackStyle=${v.stackStyle}`,
            `ingredientPresence=${v.ingredientPresence}`,
            `labelPriority=${v.labelPriority}`,
            `backgroundEnabled=${String(v.backgroundEnabled)}`,
            `backgroundType=${v.backgroundType}`,
            `gradientStyle=${v.gradientStyle}`,
            `colorSource=${v.colorSource}`
        );
    } else if (mode === 'Ingredient Flat Lay') {
        const v = cfg.ingredientFlatLay || {};
        Object.entries(v).forEach(([key, value]) => {
            features.push(`${key}=${String(value)}`);
        });
    } else if (mode === 'Acrylic Blocks') {
        const v = cfg.acrylicBlocks;
        features.push(
            `blockShape=${v.blockShape}`,
            `materialFinish=${v.materialFinish}`,
            `reflectionLevel=${v.reflectionLevel}`,
            `elevation=${v.elevation}`
        );
    } else if (mode === 'Splash Shot') {
        const motionIntensity = String(cfg.splashShot.motionIntensity || '').trim();
        const splashAdMode = motionIntensity === 'Explosive';
        const dynamicSplashMode = motionIntensity === 'Dynamic';
        const productStability =
            splashAdMode
                ? 'Fully grounded'
                : dynamicSplashMode && cfg.splashShot.productStability === 'Fully grounded'
                    ? 'Slight interaction'
                    : cfg.splashShot.productStability;
        features.push(
            `splashMedium=${cfg.splashShot.splashMedium}`,
            `motionIntensity=${motionIntensity || cfg.splashShot.motionIntensity}`,
            `freezeMoment=${cfg.splashShot.freezeMoment}`,
            `productStability=${productStability}`,
            `splashAdProfile=${splashAdMode ? 'SPLASH_AD' : 'Standard Splash'}`,
            `maxVerticalDisplacement=${
                splashAdMode && cfg.splashShot.freezeMoment === 'Peak'
                    ? '15% frame height'
                    : '10% frame height'
            }`,
            'splashFlow=single dominant directional flow'
        );
    } else if (mode === 'Foam & Texture') {
        const v = cfg.foamAndTexture;
        features.push(
            `textureType=${v.textureType}`,
            `textureDensity=${v.textureDensity}`,
            `focusDistance=${v.focusDistance}`,
            `cleanliness=${v.cleanliness}`
        );
    } else if (mode === 'Routine Carousel') {
        const v = cfg.routineCarousel;
        features.push(
            `frameCount=${String(v.frameCount)}`,
            `routineFlow=${v.routineFlow}`,
            `consistency=${v.consistency}`,
            `heroFrame=${v.heroFrame}`
        );
    } else if (mode === 'Clinical Lab Counter') {
        const v = cfg.clinicalLabCounter;
        features.push(
            `clinicalTone=${v.clinicalTone}`,
            `labElements=${v.labElements}`,
            `surfaceType=${v.surfaceType}`,
            `trustLevel=${v.trustLevel}`
        );
    } else if (mode === 'Golden Mist Aura') {
        const v = cfg.goldenMistAura;
        features.push(
            `glowStrength=${v.glowStrength}`,
            `mistStyle=${v.mistStyle}`,
            `mood=${v.mood}`,
            `contrast=${v.contrast}`
        );
    } else if (mode === 'Candy Gradient Lab') {
        const v = cfg.candyGradientLab;
        features.push(
            `gradientStyle=${v.gradientStyle}`,
            `colorCount=${v.colorCount}`,
            `edgeStyle=${v.edgeStyle}`,
            `playfulness=${v.playfulness}`
        );
    } else if (mode === 'Hands Application Clean') {
        const dynamicHands = cfg.dynamic?.['Hands Application Clean'] || {};
        const handPose = String(dynamicHands.handPose || '').trim();
        const skinLighting = String(dynamicHands.skinLighting || '').trim();
        const cropStyle = String(dynamicHands.cropStyle || '').trim();
        const handPoseLower = handPose.toLowerCase();
        const effectiveInteraction =
            handPoseLower === 'applying' || handPoseLower === 'opening'
                ? 'applying-opening'
                : handPoseLower === 'holding'
                    ? 'holding'
                    : state.interaction;
        const effectiveMotion =
            handPoseLower === 'applying' || handPoseLower === 'opening'
                ? 'dispensed'
                : state.stateMotion;

        features.push(
            `interaction=${effectiveInteraction}`,
            `placement=${state.placement}`,
            `stateMotion=${effectiveMotion}`
        );
        if (handPose) features.push(`handPose=${handPose}`);
        if (skinLighting) features.push(`skinLighting=${skinLighting}`);
        if (cropStyle) features.push(`cropStyle=${cropStyle}`);
    } else if (mode === 'Macro Dew Label') {
        features.push(
            `distance=${state.distance}`,
            `angle=${state.angle}`,
            `framing=${state.framing}`,
            `lens=${state.lens || ''}`.trim()
        );
    }

    const dynamic = cfg.dynamic?.[mode];
    if (dynamic) {
        Object.entries(dynamic).forEach(([key, value]) => {
            const normalized = String(value || '').trim();
            if (normalized) features.push(`${key}=${normalized}`);
        });
    }

    return features
        .map((entry) => String(entry || '').trim())
        .filter(Boolean);
}

function buildIngredientStackBackgroundLock(state: ProductStudioState): string {
    if (state.photoMode !== 'Ingredient Stack') return '';
    const cfg = state.photoModeConfig?.ingredientStack;
    if (!cfg || cfg.backgroundEnabled !== true) return '';

    const backgroundType = String(cfg.backgroundType || '').trim();
    if (backgroundType === 'Solid') {
        const solid = String(state.backgroundColor || '').trim();
        if (!solid) return '';
        return `INGREDIENT_STACK_BACKGROUND_LOCK: Background override active. Use SOLID background only with exact color ${solid}. Lock this background color; do not auto-replace, do not neutralize, do not drift.`;
    }

    if (backgroundType === 'Gradient') {
        const start = String(state.gradientStart || '').trim();
        const end = String(state.gradientEnd || '').trim();
        const mid = String(state.gradientMid || '').trim();
        const angle = typeof state.gradientAngle === 'number' ? state.gradientAngle : 180;
        if (!start || !end) return '';
        const midSegment = mid ? ` with optional midpoint ${mid}` : '';
        return `INGREDIENT_STACK_BACKGROUND_LOCK: Background override active. Use GRADIENT background only from ${start} to ${end}${midSegment} at ${angle} degrees. Lock this gradient; do not auto-replace, do not neutralize, do not drift.`;
    }

    return '';
}

function buildPhysicalPropertiesParts(state: ProductStudioState): string[] {
    const definition = state.definition;
    if (!definition || !definition.physical) return [];

    const parts: string[] = [];
    const colorName = String(definition.color?.semanticName || '').trim();
    if (colorName) {
        parts.push(`baseColor=${colorName}`);
    }

    switch (definition.physical.kind) {
        case 'capsules': {
            const v = definition.physical.v;
            parts.push(
                `capsuleStyle=${v.capsuleStyle}`,
                `capsuleContentColor=${String(v.capsuleContentColor?.semanticName || '') || String(v.capsuleContentColor?.hex || '')}`,
                `quantity=${String(v.quantity)}`,
                `layout=${v.layout}`,
                `glassOfWater=${String(v.glassOfWater)}`,
                `spoon=${String(v.spoon)}`
            );
            break;
        }
        case 'gummies': {
            const v = definition.physical.v;
            parts.push(
                `shape=${v.shape}`,
                `gummyColor=${String(v.gummyColor?.semanticName || '') || String(v.gummyColor?.hex || '')}`,
                `quantity=${String(v.quantity)}`,
                `bowl=${String(v.bowl)}`,
                `plate=${String(v.plate)}`
            );
            break;
        }
        case 'drops': {
            const v = definition.physical.v;
            parts.push(
                `liquidColorMode=${v.liquidColorMode}`,
                `liquidCustomColor=${String(v.liquidCustomColor?.semanticName || '') || String(v.liquidCustomColor?.hex || '')}`,
                `dropperState=${v.dropperState}`,
                `interactionMode=${v.interactionMode}`,
                `glass=${String(v.glass)}`,
                `teaCup=${String(v.teaCup)}`,
                `minimalSpoon=${String(v.minimalSpoon)}`
            );
            break;
        }
        case 'powder': {
            const v = definition.physical.v;
            parts.push(
                `powderColor=${String(v.powderColor?.semanticName || '') || String(v.powderColor?.hex || '')}`,
                `texture=${v.texture}`,
                `presentation=${v.presentation}`,
                `mixMode=${v.mixMode}`,
                `cupOrMug=${String(v.cupOrMug)}`,
                `scoop=${String(v.scoop)}`,
                `spoon=${String(v.spoon)}`
            );
            break;
        }
        case 'skincare': {
            const v = definition.physical.v;
            parts.push(
                `subtype=${v.subtype}`,
                `texture=${v.texture}`,
                `color=${String(v.color?.semanticName || '') || String(v.color?.hex || '')}`,
                `dispersion=${v.dispersion}`,
                `towel=${String(v.towel)}`,
                `sink=${String(v.sink)}`,
                `minimalSurfaceOnly=${String(v.minimalSurfaceOnly)}`
            );
            break;
        }
        case 'device': {
            const v = definition.physical.v;
            parts.push(
                `material=${v.material}`,
                `color=${String(v.color?.semanticName || '') || String(v.color?.hex || '')}`,
                `scale=${v.scale}`
            );
            break;
        }
        case 'custom': {
            const v = definition.physical.v;
            parts.push(
                `material=${v.material}`,
                `color=${String(v.color?.semanticName || '') || String(v.color?.hex || '')}`,
                `scale=${v.scale}`,
                `propsAutoBlocked=${String(v.propsAutoBlocked)}`
            );
            break;
        }
        case 'dummy':
        default:
            break;
    }

    return parts
        .map((entry) => String(entry || '').trim())
        .filter(Boolean);
}

function isHeroPhotoMode(mode: string): boolean {
    const normalized = String(mode || '').trim().toLowerCase();
    if (!normalized) return false;
    if (normalized.includes('ingredient stack')) return false;
    return normalized.includes('hero');
}

function isSplashPhotoMode(mode: string): boolean {
    const normalized = String(mode || '').trim().toLowerCase();
    if (!normalized) return false;
    return (
        normalized.includes('splash') ||
        normalized.includes('foam') ||
        normalized.includes('pool water') ||
        normalized.includes('underwater')
    );
}

function resolveHandsApplicationHandPose(state: ProductStudioState): string {
    if (state.photoMode !== 'Hands Application Clean') return '';
    return String(state.photoModeConfig?.dynamic?.['Hands Application Clean']?.handPose || '').trim();
}

function resolveEffectiveInteraction(state: ProductStudioState): ProductStudioState['interaction'] {
    if (state.photoMode !== 'Hands Application Clean') return state.interaction;
    const handPose = resolveHandsApplicationHandPose(state).toLowerCase();
    if (handPose === 'applying' || handPose === 'opening') return 'applying-opening';
    if (handPose === 'holding') return 'holding';
    return state.interaction;
}

function resolveEffectiveMotion(state: ProductStudioState): ProductStudioState['stateMotion'] {
    if (state.photoMode !== 'Hands Application Clean') return state.stateMotion;
    const handPose = resolveHandsApplicationHandPose(state).toLowerCase();
    if (handPose === 'applying' || handPose === 'opening') return 'dispensed';
    return state.stateMotion;
}

function buildMacroDewLabelSemanticParts(state: ProductStudioState): string[] {
    if (state.photoMode !== 'Macro Dew Label') return [];
    const dynamic = state.photoModeConfig?.dynamic?.['Macro Dew Label'] || {};
    const macroTightness = String(dynamic.macroTightness || '').trim().toLowerCase();
    const dropletMode = String(dynamic.dropletMode || '').trim().toLowerCase();
    const dropletDensity = String(dynamic.dropletDensity || '').trim();
    const highlightControl = String(dynamic.highlightControl || '').trim();

    const parts: string[] = [
        'MACRO_FRAME_CONSTRAINT: True macro proximity is mandatory. First-plan close-up only. No medium framing. No wide framing.',
        'MACRO_LABEL_PRIORITY: Primary label area must dominate the frame while remaining fully legible.',
        'MACRO_SUBJECT_SCOPE: Show label plus adjacent bottle surface only. Product must fill most of the frame with minimal side margins.',
        'LATERAL_SPREAD: Restricted for macro.',
        'NEGATIVE_SPACE_POLICY: Minimal in macro mode.',
    ];

    if (macroTightness === 'extreme') {
        parts.push('MACRO_TIGHTNESS: Extreme. Ultra-tight close-up; label and nearby bottle texture dominate the frame.');
    } else if (macroTightness === 'tight') {
        parts.push('MACRO_TIGHTNESS: Tight. Strong close-up with label as principal subject.');
    }

    if (dropletMode === 'clean') {
        parts.push('DROPLET_POLICY: Clean. No droplets on label or bottle. Surface must be clean and dry.');
    } else if (dropletMode === 'wet') {
        parts.push('DROPLET_POLICY: Wet. Subtle moisture film only; no isolated beads crossing key label text.');
    } else if (dropletMode === 'drops') {
        const densitySegment = dropletDensity ? ` with density ${dropletDensity}` : '';
        parts.push(`DROPLET_POLICY: Drops${densitySegment}. Physically plausible droplets only, no random CGI beads.`);
    }

    if (highlightControl) {
        parts.push(`HIGHLIGHT_CONTROL: ${highlightControl}. Keep label text sharp and readable with controlled specular behavior.`);
    }

    return parts;
}

function buildHandsApplicationSemanticParts(state: ProductStudioState): string[] {
    if (state.photoMode !== 'Hands Application Clean') return [];
    const dynamicHands = state.photoModeConfig?.dynamic?.['Hands Application Clean'] || {};
    const handPose = String(dynamicHands.handPose || '').trim().toLowerCase();
    const skinLighting = String(dynamicHands.skinLighting || '').trim().toLowerCase();
    const cropStyle = String(dynamicHands.cropStyle || '').trim().toLowerCase();

    const parts: string[] = [];
    
    // PRODUCT PRESERVATION LOCK - Must come FIRST for token positioning
    const hasReference = hasReferenceProductImage(state);
    if (hasReference) {
        parts.push('PRODUCT_PRESERVATION_LOCK: The EXACT product from reference image MUST be shown in hands. Preserve ALL product features: cap shape, cap color, cap material (transparent/opaque/metallic), pump mechanism, bottle shape, bottle color, label design, closure type. If cap is transparent in reference, keep it transparent. If cap is metallic silver, keep it metallic silver. If cap is matte black, keep it matte black. Do NOT regenerate, recolor, or redesign any product element. Hands interact with THIS SPECIFIC PRODUCT, not a generic version.');
    }

    if (handPose === 'applying') {
        parts.push('HANDS_ACTION: Applying gesture only. Product dispensing onto skin or fingers. Clear product-to-skin application moment with realistic contact and pressure. Product formula visible on skin/fingertips.');
    } else if (handPose === 'opening') {
        parts.push('HANDS_ACTION: Opening gesture only. Hand removing/twisting cap from bottle. Cap/closure manipulation is visible; no application smear. Cap must remain attached to hand or bottle, NOT disappear.');
    } else if (handPose === 'holding') {
        parts.push('HANDS_ACTION: Holding gesture only. Clean hold presentation with stable grip and no exaggerated motion.');
    }

    if (skinLighting === 'soft natural') {
        parts.push('SKIN_LIGHTING: Soft natural skin light with gentle falloff and realistic tone transitions.');
    } else if (skinLighting === 'neutral studio') {
        parts.push('SKIN_LIGHTING: Neutral studio skin light with balanced exposure and clean texture fidelity.');
    }

    if (cropStyle === 'tight') {
        parts.push('CROP_STYLE: Tight crop. Hands and product occupy most of the frame with minimal empty margins.');
    } else if (cropStyle === 'medium') {
        parts.push('CROP_STYLE: Medium crop. Hands and product remain dominant with controlled breathing room.');
    }

    return parts;
}

function buildTexturedBedSemanticParts(state: ProductStudioState): string[] {
    if (state.photoMode !== 'Textured Bed / Scatter Base') return [];

    const dynamic = state.photoModeConfig?.dynamic?.['Textured Bed / Scatter Base'] || {};
    const depthLevel = String(dynamic.depthLevel || '').trim().toLowerCase();

    const parts: string[] = [
        'TEXTURED_BED_DEPTH_POLICY: Product must feel physically seated inside the ingredient bed with visible contact compression and realistic occlusion around the lower area.',
        'TEXTURED_BED_VISIBILITY_LOCK: Keep cap and primary label text clearly visible and sharp. Occlusion must support depth perception without blocking core brand readability.',
    ];

    if (depthLevel === 'subtle') {
        parts.push('TEXTURED_BED_DEPTH: Subtle embed. Ingredient bed lightly wraps the base; approximately 8-18% of lower product area may be occluded.');
        parts.push('TEXTURED_BED_FOREGROUND: Minimal foreground overlap. Keep scene clean with light depth layering only.');
    } else if (depthLevel === 'immersive') {
        parts.push('TEXTURED_BED_DEPTH: Immersive embed. Ingredient bed strongly wraps the base; approximately 30-45% of lower product area may be occluded.');
        parts.push('TEXTURED_BED_FOREGROUND: Allow controlled near-camera ingredient elements for stronger depth, but never cover core label text.');
    } else {
        parts.push('TEXTURED_BED_DEPTH: Balanced embed. Ingredient bed clearly wraps the base; approximately 18-30% of lower product area may be occluded.');
        parts.push('TEXTURED_BED_FOREGROUND: Subtle-to-medium foreground layering is allowed for premium depth without clutter.');
    }

    return parts;
}

function buildCheersHandsRealismParts(state: ProductStudioState): string[] {
    if (state.photoMode !== 'Cheers (Hands Clink)') return [];

    return [
        'CHEERS_HANDS_REALISM_LOCK: Real hands only. Natural skin texture and tone variation must be visible.',
        'CHEERS_HANDS_ANATOMY_LOCK: Exactly five fingers per hand, realistic knuckle articulation, and believable thumb placement on the container.',
        'CHEERS_HANDS_CONTACT_LOCK: Grip pressure and contact shadows must be physically coherent where fingers touch the product.',
        'CHEERS_HANDS_NEGATIVE: No doll-like hands, no mannequin-like hands, no waxy skin, no plastic skin, and no CGI hand artifacts.',
    ];
}

function buildCoreSceneLayer(state: ProductStudioState, scenePrompt: string): string[] {
    const core: string[] = [];
    const effectiveInteraction = resolveEffectiveInteraction(state);
    const effectiveMotion = resolveEffectiveMotion(state);
    if (scenePrompt) core.push(scenePrompt);
    if (state.qualityProfile) core.push(`OUTPUT_PROFILE: ${state.qualityProfile}`);
    if (state.sceneType) {
        const photoType = state.sceneType === 'studio-branding' || state.sceneType === 'studio-hero'
            ? 'Photo Studio'
            : 'Environment';
        core.push(`PHOTO_TYPE: ${photoType}`);
    }
    core.push(
        'FRAME_EDGE_POLICY: Edge-to-edge real scene content across all borders. No white side fill, no artificial padding, no pillarbox/letterbox bars, no mirrored edge extension, no duplicated side panels, and no blurred lateral bands.'
    );
    const explicitEnvironment = String((state as any).environment || '').trim();
    const explicitWorld = String((state as any).world || '').trim();
    if (STRICT_STATE_PROMPT) {
        console.log('STRICT_MODE: world injection controlled:', explicitEnvironment || explicitWorld || '');
    }
    if (!ALLOW_EMPTY_WORLD_IN_STRICT || explicitEnvironment || explicitWorld) {
        if (explicitEnvironment) core.push(`STUDIO_WORLD: ${explicitEnvironment}`);
        else if (explicitWorld) core.push(`STUDIO_WORLD: ${explicitWorld}`);
    }
    if (state.placement) core.push(`PHYSICAL_PLACEMENT: ${state.placement}`);
    if (state.photoMode) core.push(`PHOTO_MODE: ${state.photoMode}`);
    
    // GEMINI/GPT FIX: Relax frame constraint when reference product exists to prevent morphing
    const hasReference = hasReferenceProductImage(state);
    if (isHeroPhotoMode(state.photoMode)) {
        const splashMode = isSplashPhotoMode(state.photoMode);
        const splashMotionIntensity = String(state.photoModeConfig?.splashShot?.motionIntensity || '').trim();
        const splashAdMode = splashMode && splashMotionIntensity === 'Explosive';
        if (hasReference) {
            // Proportional framing - don't force % coverage that causes stretching
            core.push('FRAME_CONSTRAINT: Close-up framing without altering object proportions. Minimal side margins. No excessive lateral negative space.');
        } else {
            // Original aggressive constraint (OK for generative mode)
            core.push(
                splashAdMode
                    ? 'FRAME_CONSTRAINT: SPLASH_AD framing. The product must fill 75–80% of vertical frame height to preserve lateral splash energy.'
                    : splashMode
                        ? 'FRAME_CONSTRAINT: Tight hero framing for splash mode. The product must fill most of the vertical frame (85–88% height coverage). Minimal side margins while preserving splash readability.'
                    : 'FRAME_CONSTRAINT: Tight hero framing. The product must fill most of the vertical frame (85–92% height coverage). Minimal side margins. No excessive lateral negative space.'
            );
        }
        core.push('VERTICAL_SUBJECT_DOMINANCE: Strong.');
        core.push(
            splashMode
                ? 'LATERAL_SPREAD: allow natural side propagation from splash impact; avoid artificial clipping.'
                : 'LATERAL_SPREAD: Restricted.'
        );
        core.push('NEGATIVE_SPACE_POLICY: Controlled and minimal.');
    }
    if (state.composition) core.push(`COMPOSITION: ${state.composition}`);
    const featureParts = buildPhotoModeFeatureParts(state);
    if (featureParts.length > 0) {
        core.push(`PHOTO_MODE_FEATURES: ${featureParts.join('; ')}`);
    }
    const macroSemanticParts = buildMacroDewLabelSemanticParts(state);
    if (macroSemanticParts.length > 0) core.push(...macroSemanticParts);
    const handsSemanticParts = buildHandsApplicationSemanticParts(state);
    if (handsSemanticParts.length > 0) core.push(...handsSemanticParts);
    const texturedBedSemanticParts = buildTexturedBedSemanticParts(state);
    if (texturedBedSemanticParts.length > 0) core.push(...texturedBedSemanticParts);
    const cheersHandsRealismParts = buildCheersHandsRealismParts(state);
    if (cheersHandsRealismParts.length > 0) core.push(...cheersHandsRealismParts);
    const ingredientStackBackgroundLock = buildIngredientStackBackgroundLock(state);
    if (ingredientStackBackgroundLock) core.push(ingredientStackBackgroundLock);
    const explicitIngredients = Array.isArray((state as any).ingredients)
        ? ((state as any).ingredients as unknown[])
            .map((entry) => String(entry || '').trim())
            .filter(Boolean)
        : [];
    if (explicitIngredients.length > 0) {
        core.push(`INGREDIENT_LIST: ${explicitIngredients.join(', ')}`);
    }
    if (
        explicitIngredients.length > 0 &&
        (state.photoMode === 'Ingredient Stack' || state.photoMode === 'Ingredient Flat Lay')
    ) {
        core.push(
            'INGREDIENT_VISUALIZATION: Each ingredient listed must be visually represented exactly as named. Do NOT substitute with common cosmetic ingredients. Do NOT hallucinate hyaluronic acid, vitamin C, retinol, etc unless explicitly provided. Only use ingredients provided in INGREDIENT_LIST.'
        );
    }
    if (Array.isArray(state.specialEffects) && state.specialEffects.length > 0) {
        const effects = state.specialEffects.map((entry) => String(entry || '').trim()).filter(Boolean);
        if (effects.length > 0) core.push(`SPECIAL_EFFECTS: ${effects.join(', ')}`);
    }
    
    // GEMINI/GPT FIX: Only emit PRODUCT_TYPE when NO reference image (generative mode)
    // When reference exists, semantic descriptors activate category priors (e.g., "Capsules" → white bottle)
    // Use hasReference already declared above
    if (!hasReference && state.definition?.type) {
        const rawType = String(state.definition.type || '').trim();
        const uiType = rawType ? `${rawType.charAt(0).toUpperCase()}${rawType.slice(1)}` : '';
        core.push(`PRODUCT_TYPE: ${uiType || rawType}`);
    }
    
    // GEMINI/GPT FIX: Only emit PHYSICAL_PROPERTIES when NO reference image
    if (!hasReference) {
        const physicalProperties = buildPhysicalPropertiesParts(state);
        if (physicalProperties.length > 0) {
            core.push(`PHYSICAL_PROPERTIES: ${physicalProperties.join('; ')}`);
        }
    }
    if (state.packagingMode) core.push(`PACKAGING: ${state.packagingMode}`);
    if (state.physicalScaleLabel) core.push(`PHYSICAL_SCALE: ${state.physicalScaleLabel}`);
    if (Array.isArray(state.selectedProps) && state.selectedProps.length > 0) {
        const selectedProps = state.selectedProps.map((entry) => String(entry || '').trim()).filter(Boolean);
        if (selectedProps.length > 0) core.push(`PROPS: ${selectedProps.join(', ')}`);
    } else if (String(state.props || '').trim()) {
        core.push(`PROPS: ${String(state.props).trim()}`);
    }
    
    // INGREDIENT INTERPRETATION - Simple version
    // INGREDIENT_RULE: Only for modes with natural ingredients or ice cubes around product
    if (state.photoMode === 'Ingredient Stack' || state.photoMode === 'Ingredient Flat Lay' || state.photoMode === 'Ice Cubes') {
        core.push('INGREDIENT_RULE: Show natural raw ingredients only (herbs, fruits, spices). NOT packaged products or bottles. ONE product + ingredients around it.');
    }
    
    const advancedControlsOn =
        String((state as any).controlTier || '').trim().toLowerCase() === 'pro' ||
        Boolean((state as any).advancedModeEnabled) ||
        Boolean((state as any).proMode);
    core.push(`ADVANCED_CONTROLS: ${advancedControlsOn ? 'on' : 'off'}`);
    
    // CRITICAL: Only inject advanced overrides when toggle is ON
    // When toggle is OFF, all pro controls (lens, lighting rig, gel color, finish, viewpoint) are disabled
    if (advancedControlsOn) {
        if (String(state.lens || '').trim()) {
            core.push(`LENS_OVERRIDE: ${String(state.lens).trim()}`);
        }
        if (String(state.lightingRig || '').trim()) {
            core.push(`LIGHTING_RIG_OVERRIDE: ${String(state.lightingRig).trim()}`);
            // CRITICAL: Lighting equipment must NEVER be physically visible in the frame
            core.push(`LIGHTING_EQUIPMENT_POLICY: Studio lights, spotlights, ring lights, softboxes, and all lighting hardware must remain OFF-CAMERA and invisible. Only their lighting effects (highlights, shadows, reflections) should appear on the product and scene. Do not render visible light sources, light stands, or lighting equipment in the frame.`);
        }
        
        // Accent/gel light color override
        const customColor = String((state as any).customLightColor || '').trim().toUpperCase();
        const intensity = Number((state as any).accentLightIntensity ?? 50);
        if (customColor && customColor !== '#FFFFFF' && /^#[0-9A-F]{6}$/.test(customColor)) {
            const intensityDesc = intensity <= 20 ? 'subtle' : intensity <= 40 ? 'moderate' : intensity <= 60 ? 'strong' : intensity <= 80 ? 'dramatic' : 'intense';
            core.push(`ACCENT_LIGHT_GEL: ${customColor} at ${intensity}% intensity (${intensityDesc}). CRITICAL: Use external OFF-CAMERA studio lights with colored gels positioned to graze the product edges, creating ${intensityDesc} colored reflections and refractions on metallic/glossy surfaces. The colored light reflects OFF the product surface (not from within). The product itself does NOT contain LEDs, neon, or any light-emitting materials. No glowing edges. No light emanating from the product. Only natural reflection and refraction of the external colored light source on the product's surface materials. The light sources themselves must remain invisible and off-camera.`);
        }
        
        if (String(state.finish || '').trim()) {
            core.push(`FINISH_OVERRIDE: ${String(state.finish).trim()}`);
        }
        
        // VIEWPOINT_OVERRIDE: Only add if Camera & Framing controls are NOT explicitly set
        // Camera Angle selection should take priority over viewpoint in Pro Mode
        const hasCameraAngleControl = Boolean(String((state as any).angle || '').trim());
        if (!hasCameraAngleControl && String(state.viewpoint || '').trim()) {
            core.push(`VIEWPOINT_OVERRIDE: ${String(state.viewpoint).trim()}`);
        }
    }
    if (state.photoMode === 'Hands Application Clean') {
        core.push('HANDS_APPLICATION_CONSTRAINTS: Hands must be anatomically correct.');
        core.push('HANDS_APPLICATION_CONSTRAINTS: No exaggerated gestures.');
        core.push('HANDS_APPLICATION_CONSTRAINTS: No facial subject required.');
        
        // Inject user-selected Hand Pose, Skin Lighting, and Crop Style from photoModeConfig
        const dynamicHands = (state as any).photoModeConfig?.dynamic?.['Hands Application Clean'] || {};
        const handPose = String(dynamicHands.handPose || '').trim();
        const skinLighting = String(dynamicHands.skinLighting || '').trim();
        const cropStyle = String(dynamicHands.cropStyle || '').trim();
        
        // Hand Pose: Applying, Opening, Holding
        if (handPose) {
            const handPoseLower = handPose.toLowerCase();
            if (handPoseLower === 'applying') {
                core.push('HAND_POSE: Hands actively applying product to skin. Natural application gesture with fingers spreading or massaging product onto skin surface. Product should be visibly touching or being worked into the skin.');
            } else if (handPoseLower === 'opening') {
                core.push('HAND_POSE: Hands opening or unscrewing the product container. Fingers positioned to twist cap or pump dispenser. Action-oriented moment capturing the opening gesture.');
            } else if (handPoseLower === 'holding') {
                core.push('HAND_POSE: Hands gently holding the product in a display presentation. Clean, simple grip showing the product clearly. Not applying - just presenting the product to camera.');
            }
        }
        
        // Skin Lighting: Soft natural, Neutral studio
        if (skinLighting) {
            const skinLightingLower = skinLighting.toLowerCase();
            if (skinLightingLower === 'soft natural' || skinLightingLower === 'soft-natural') {
                core.push('SKIN_LIGHTING: Soft natural window light on hands and skin. Gentle diffused illumination with subtle shadows. Warm, organic light quality that feels residential and authentic.');
            } else if (skinLightingLower === 'neutral studio' || skinLightingLower === 'neutral-studio') {
                core.push('SKIN_LIGHTING: Neutral studio lighting on hands and skin. Clean, even illumination with controlled shadows. Professional commercial light quality optimized for product clarity and skin tone accuracy.');
            }
        }
        
        // Crop Style: Tight, Medium
        if (cropStyle) {
            const cropStyleLower = cropStyle.toLowerCase();
            if (cropStyleLower === 'tight') {
                core.push('CROP_STYLE: Tight crop focusing closely on hands and product interaction. Minimal background visible. Product and hands fill most of the frame for intimate detail.');
            } else if (cropStyleLower === 'medium') {
                core.push('CROP_STYLE: Medium crop showing hands, product, and moderate surrounding context. Balanced framing with some background environment visible for editorial feel.');
            }
        }
    }
    if (state.lighting) core.push(`LIGHTING: ${state.lighting}`);
    if (effectiveMotion) core.push(`MOTION: ${effectiveMotion}`);
    if (effectiveInteraction && effectiveInteraction !== 'none') core.push(`INTERACTION: ${effectiveInteraction}`);
    return core;
}

function buildProtectionLightLayer(): string[] {
    if (!ENABLE_PROTECTION_LIGHT) return [];
    return [
        'Basic physical coherence: realistic gravity and contact behavior.',
        'Packaging assembled and physically intact.',
        'Label remains legible without extreme distortion.',
    ];
}

function buildStrictPackagingLayer(): string[] {
    if (!ENABLE_STRICT_PACKAGING_LOCK) return [];
    return ['Strict packaging lock: preserve exact product geometry and design fidelity.'];
}

/**
 * FINAL PROMPT ASSEMBLY ORDER (MANDATORY):
 * 1. Scene Type
 * 2. ProductBuilder
 * 3. BundleBuilder (if enabled)
 * 4. EnvironmentBuilder
 * 5. Lighting
 * 6. CameraBuilder  
 * 7. Creativity
 * 8. EcommerceBuilder
 * 9. Aspect Ratio
 * 10. Negative constraints
 */
function assembleSingleProductPrompt(state: ProductStudioState, product: ProductAsset): string {
    const segments: string[] = [];
    console.log('>> PRO_MODE_ACTIVE =', String((state as any).controlTier || '').trim().toLowerCase() === 'pro');
    const visualIntent = String(state.visualIntent || 'conversion');
    const controlTier = String((state as any).controlTier || 'basic');
    const conversionSquareOptimized =
        visualIntent === 'conversion' && String(state.aspectRatio || '') === '1:1';
    console.log('VISUAL_INTENT_ACTIVE =', visualIntent);
    console.log('CONTROL_TIER_ACTIVE =', controlTier);
    console.log('CONVERSION_SQUARE_OPTIMIZED =', conversionSquareOptimized);
    // Studio engine router:
    // - USE_STUDIO_V2=true  -> ProductStudioV2
    // - otherwise           -> legacy mapSceneToPrompt
    const sceneResult = routeStudioScenePrompt(state, product);

    if (STRICT_STATE_PROMPT) {
        const finalParts = normalizePromptSegments([
            ...buildCoreSceneLayer(state, sceneResult.prompt),
            ...buildProtectionLightLayer(),
            ...buildStrictPackagingLayer(),
        ]);
        const finalPrompt = finalParts.join(' ');
        console.log('2. Generated Prompt Parts:', finalParts);
        console.log('3. FINAL PROMPT:', finalPrompt);
        console.groupEnd();
        return finalPrompt;
    }

    segments.push(sceneResult.prompt);
    segments.push(buildProductDescription(state, product));

    if (state.interaction !== 'none') {
        segments.push(buildInteraction(state));
    }

    segments.push(buildLabelLock());
    segments.push(buildProductDesignLock(state));
    segments.push(buildStateMotion(state));
    segments.push(buildIntegrityConstraints(state));
    segments.push(buildAspectRatio(state));

    let finalPrompt = enforceMotionPromptCoherence(segments.filter(Boolean).join(' '), state);
    finalPrompt = appendClosingPhrase(finalPrompt);
    if (state.interaction === 'none') {
        finalPrompt = stripForbiddenTermsExceptClosing(finalPrompt, STRIP_TERMS_WHEN_NO_INTERACTION);
    }
    
    // GEMINI/GPT FIX PATCH 3: When reference product exists, strip category priors and prepend HARD LOCK
    if (hasReferenceProductImage(state)) {
        finalPrompt = stripCategoryPriorsFromPrompt(finalPrompt);
        finalPrompt = `${REFERENCE_PRODUCT_HARD_LOCK} ${finalPrompt}`;
    }
    
    console.log('2. Generated Prompt Parts:', segments);
    console.log('3. FINAL PROMPT:', finalPrompt);
    console.groupEnd();

    return finalPrompt;
}

function assembleBundlePrompt(state: ProductStudioState): string {
    const segments: string[] = [];
    console.log('>> PRO_MODE_ACTIVE =', String((state as any).controlTier || '').trim().toLowerCase() === 'pro');
    const primary = state.products.find(p => p.id === state.bundle.primaryProductId) ?? null;
    const visualIntent = String(state.visualIntent || 'conversion');
    const controlTier = String((state as any).controlTier || 'basic');
    const conversionSquareOptimized =
        visualIntent === 'conversion' && String(state.aspectRatio || '') === '1:1';
    console.log('VISUAL_INTENT_ACTIVE =', visualIntent);
    console.log('CONTROL_TIER_ACTIVE =', controlTier);
    console.log('CONVERSION_SQUARE_OPTIMIZED =', conversionSquareOptimized);
    // Studio engine router:
    // - USE_STUDIO_V2=true  -> ProductStudioV2
    // - otherwise           -> legacy mapSceneToPrompt
    const sceneResult = routeStudioScenePrompt(state, primary ?? undefined);

    if (STRICT_STATE_PROMPT) {
        // Build bundle info string with product count and details
        const bundleInfo = state.bundle.enabled ? (() => {
            const productCount = 1 + (state.bundle.secondaryProductIds?.length || 0);
            const allProducts = [
                state.products.find(p => p.id === state.bundle.primaryProductId),
                ...((state.bundle.secondaryProductIds || []).map(id => state.products.find(p => p.id === id)).filter(Boolean))
            ].filter(Boolean);
            const productLabels = allProducts.map(p => (p as any)?.name || (p as any)?.productName || 'supplement bottle').join(', ');
            
            // CRITICAL: Include height information for scale preservation
            const productsWithHeight = allProducts
                .map((p) => {
                    const raw = (p as any)?.heightValue as number | null | undefined;
                    const unit = ((p as any)?.heightUnit as 'cm' | 'in' | undefined) ?? 'cm';
                    if (typeof raw !== 'number' || !Number.isFinite(raw) || raw <= 0) return null;
                    const cm = unit === 'in' ? raw * 2.54 : raw;
                    const rounded = Math.round(cm * 10) / 10;
                    return `${(p as any)?.name || (p as any)?.productName || 'product'} ~${rounded}cm`;
                })
                .filter((v): v is string => Boolean(v));
            
            const scaleInstruction = productsWithHeight.length > 0
                ? ` CRITICAL SCALE REQUIREMENT: Preserve exact real-world height proportions between all products. ${productsWithHeight.join('; ')}. Products MUST appear proportionally sized according to their specified heights. DO NOT render all products at equal size.`
                : '';
            
            return `BUNDLE: Exactly ${productCount} products must appear in the scene. Products: ${productLabels}. Mode: ${state.bundle.mode}. Layout: ${state.bundle.layout}.${scaleInstruction} CRITICAL: Show ALL ${productCount} products from the reference images provided - do not mix, blend, or invent products. Each product must be clearly visible, distinct, and match its reference image exactly. Do not merge multiple products into one or create hybrid versions.`;
        })() : '';
        
        const finalParts = normalizePromptSegments([
            ...buildCoreSceneLayer(state, sceneResult.prompt),
            bundleInfo,
            ...buildProtectionLightLayer(),
            ...buildStrictPackagingLayer(),
        ]);
        return finalParts.join(' ');
    }

    segments.push(sceneResult.prompt);
    if (primary) {
        segments.push(buildProductDescription(state, primary));
    }

    if (state.interaction !== 'none') {
        segments.push(buildInteraction(state));
    }

    if (primary) {
        segments.push(buildLabelLock());
        segments.push(buildProductDesignLock(state));
    }
    segments.push(buildStateMotion(state));
    segments.push(buildBundleComposition(state));

    segments.push(buildIntegrityConstraints(state));
    segments.push(buildAspectRatio(state));

    let finalPrompt = enforceMotionPromptCoherence(segments.filter(Boolean).join(' '), state);
    finalPrompt = appendClosingPhrase(finalPrompt);
    if (state.interaction === 'none') {
        finalPrompt = stripForbiddenTermsExceptClosing(finalPrompt, STRIP_TERMS_WHEN_NO_INTERACTION);
    }
    
    // GEMINI/GPT FIX PATCH 3: When reference product exists, strip category priors and prepend HARD LOCK
    if (hasReferenceProductImage(state)) {
        finalPrompt = stripCategoryPriorsFromPrompt(finalPrompt);
        finalPrompt = `${REFERENCE_PRODUCT_HARD_LOCK} ${finalPrompt}`;
    }
    
    return finalPrompt;
}

// ============================================================================
// NEGATIVE PROMPT
// ============================================================================

function buildNegativePrompt(state: ProductStudioState): string {
    const interaction = String(state.interaction || 'none');
    const allowHands = interaction !== 'none';
    const motion = String(state.stateMotion || 'static');
    const isSplashShot = state.photoMode === 'Splash Shot';
    const splashStyle = state.photoMode === 'Splash Shot' ? (state.splashStyle ?? 'Basic') : null;
    const macroTexturesActive = state.photoMode === 'Foam & Texture';
    const placement = String(state.placement || 'surface');

    const noInteractionBlock = allowHands
        ? []
        : [
            'no humans',
            'no people',
            'no hands',
            'no holding',
            'no presenting',
            'no skin',
            'no real-world usage context',
            'no ugc',
            'no human presence'
        ];

    const humanNegativesBase = ['person', 'people', 'head', 'face', 'body', 'torso', 'full figure', 'model'];
    const handsNegatives = (() => {
        if (!allowHands) return ['hand', 'hands', 'fingers'];
        if (interaction === 'cropped-hand') return ['full arm', 'full person'];
        // Most interactions are hand-only; block other human framing.
        return ['arms', 'shoulders', 'neck'];
    })();

    const interactionSpecific = (() => {
        // Enforce single-hand intent where explicitly specified.
        if (interaction === 'holding' || interaction === 'supported-hold' || interaction === 'presenting') {
            return ['two hands', 'both hands', 'multiple hands'];
        }
        return [];
    })();

    const capIntegrityNegatives = (() => {
        if (motion === 'static') return ['missing cap', 'open container', 'cap removed'];
        if (motion === 'spilled') {
            return [
                'attached cap',
                'cap sealed',
                'sealed container releasing contents',
                'cap floating',
                'cap levitating',
            ];
        }
        return ['cap visible', 'cap in frame', 'cap on surface', 'attached cap', 'sealed container releasing contents'];
    })();

    const spilledSurfaceNegatives =
        motion === 'spilled'
            ? [
                'floating capsules',
                'capsules in mid-air',
                'capsules suspended',
                'levitating capsules',
                'airborne capsules',
                'capsules flying',
                'capsules bouncing in air',
                'capsules above surface',
                'no surface',
                'surface missing',
                'capsules not touching surface',
                'detached shadows',
                'floating shadows',
            ]
            : [];

    return [
        ...noInteractionBlock,
        ...humanNegativesBase,
        ...handsNegatives,
        ...interactionSpecific,
        ...(macroTexturesActive
            ? ['top-down', 'overhead', 'aerial', 'bird’s-eye', "bird's-eye", 'flat lay', 'flatlay']
            : []),
        // Container / cap integrity
        ...capIntegrityNegatives,
        ...spilledSurfaceNegatives,
        // Interaction safety / realism
        'eating', 'drinking', 'swallowing', 'ingestion',
        'hands pouring product',
        'pouring capsules', 'pouring pills',
        'floating capsules',
        'symmetrical motion',
        'magical particles',
        ...(splashStyle === 'Advanced' ? ['smoke'] : ['mist', 'smoke']),
        ...(splashStyle ? [] : ['exaggerated splash']),
        ...(isSplashShot
            ? [
                'muddy water',
                'dirty liquid',
                'chaotic circular splash',
                'label obscured by splash',
                'foam explosion',
                'messy puddle clutter',
              ]
            : []),
        'floating hands', 'stiff fingers', 'mannequin hands', 'plastic hands', 'rubber hands', 'cgi hands',
        'distracting jewelry', 'oversized jewelry',
        // Quality / artifacts
        'blurry', 'low quality', 'distorted', 'warped', 'deformed', 'melted', 'glitched',
        // Label integrity
        'redrawn label', 'rewritten label', 'invented label text', 'altered typography',
        'warped label', 'curved label', 'stretched label', 'crooked label', 'misaligned label', 'mismatched label proportions',
        'label as texture', 'label texture', 'label distortion', 'label perspective warp',
        // Packaging / design integrity
        'rebranded packaging', 'new logo', 'altered logo', 'new artwork', 'different bottle shape', 'changed cap shape',
        'changed packaging proportions', 'packaging redesign',
        'broken object', 'broken glass', 'cracked', 'shattered', 'fragmented',
        ...(placement === 'air'
            ? ['detached fragments', 'separated parts', 'disconnected components', 'disembodied cap', 'detached dropper']
            : ['floating detached fragments', 'separated parts', 'disconnected components', 'disembodied cap', 'detached dropper']),
        'duplicate product', 'multiple bottles', 'extra caps', 'extra droppers',
        'cropped product', 'cut off', 'missing parts', 'tilted horizon',
        // Styling / safety
        'watermark', 'text overlay',
        'letterbox bars', 'pillarbox bars', 'black bars', 'side bars',
        'mirrored edges', 'mirrored side extension', 'duplicated side panels',
        'blurred side fill', 'edge smearing', 'frame padding illusion',
        'cartoon', 'illustration', 'drawing', 'anime',
        'oversaturated', 'underexposed', 'overexposed',
    ].join(', ');
}

// ============================================================================
// GENERATE JOBS
// ============================================================================

export function generateProductJobs(state: ProductStudioState): ProductGenerationJob[] {
    if (state.sceneType === 'ecommerce-pdp') {
        const pdp = state.ecommercePdp;
        if (!pdp) {
            throw new Error('[ECOMMERCE PDP] Missing ecommercePdp config.');
        }
        if (state.bundle.enabled) {
            throw new Error('[ECOMMERCE PDP] Bundles are not supported.');
        }
        if (state.products.length === 0) {
            console.warn('[ECOMMERCE PDP] No products to generate');
            return [];
        }

        // Mandatory state logging
        console.log('[PRODUCT STUDIO STATE][ECOMMERCE PDP]', { sceneType: state.sceneType, ecommercePdp: pdp });

        const jobs: ProductGenerationJob[] = [];
        for (const product of state.products) {
            const prompt = buildEcommercePdpPrompt({
                product,
                slot: pdp.slot,
                layout: pdp.layout,
                imageSide: pdp.imageSide,
            });

            // NOTE: Do NOT run ProductStudio validatePrompt here:
            // The PDP prompt explicitly contains negative instructions like "Do NOT include people/hands",
            // and the legacy validator would false-positive on those words.

            jobs.push({
                productId: product.id,
                productName: product.name,
                prompt,
                negativePrompt:
                    'text, logo, watermark, badges, icons, UI, typography, people, hands, faces, props in negative space, gradients, dramatic shadows',
                aspectRatio: '1:1',
                sceneType: state.sceneType,
            });
        }

        return jobs;
    }

    const normalizedState = normalizeProductStudioStateForPrompt(state);
    // Mandatory state logging
    console.log('[PRODUCT STUDIO STATE]', normalizedState);

    if (normalizedState.products.length === 0) {
        console.warn('[ProductStudio] No products to generate');
        return [];
    }

    console.log('[BUNDLE STATE]', JSON.stringify(normalizedState.bundle, null, 2));
    console.log('[SCENE TYPE]', normalizedState.sceneType);

    // Bundle mode: ONE image only
    if (normalizedState.bundle.enabled) {
        validateBundleState(normalizedState);

        let prompt = assembleBundlePrompt(normalizedState);
        prompt = sanitizePromptBeforeValidation(prompt, { allowHands: normalizedState.interaction !== 'none' });
        validatePrompt(prompt, { allowHands: normalizedState.interaction !== 'none' });

        console.log(`[FINAL PRODUCT PROMPT] Bundle:`, prompt);

        return [{
            productId: normalizedState.bundle.primaryProductId!,
            productName: `Bundle: ${normalizedState.bundle.mode}`,
            prompt,
            negativePrompt: buildNegativePrompt(normalizedState),
            aspectRatio: normalizedState.aspectRatio,
            bundleId: normalizedState.bundle.selectedBundleId || 'custom',
            sceneType: normalizedState.sceneType,
        }];
    }

    // Standard mode: one image per product
    const jobs: ProductGenerationJob[] = [];

    for (const product of normalizedState.products) {
        let prompt = assembleSingleProductPrompt(normalizedState, product);
        prompt = sanitizePromptBeforeValidation(prompt, { allowHands: normalizedState.interaction !== 'none' });
        validatePrompt(prompt, { allowHands: normalizedState.interaction !== 'none' });

        console.log(`[FINAL PRODUCT PROMPT] ${product.name}:`, prompt);

        jobs.push({
            productId: product.id,
            productName: product.name,
            prompt,
            negativePrompt: buildNegativePrompt(normalizedState),
            aspectRatio: normalizedState.aspectRatio,
            sceneType: normalizedState.sceneType,
        });
    }

    return jobs;
}

function normalizeProductStudioStateForPrompt(state: ProductStudioState): ProductStudioState {
    const next: ProductStudioState = { ...state };
    if (STRICT_STATE_PROMPT) {
        next.handsHolding = next.interaction !== 'none';
        return next;
    }
    // Keep effective state strict: output profile is authoritative for visual intent.
    next.visualIntent = resolveVisualIntentFromQualityProfile(next.qualityProfile);
    const normalizedControlTier =
        String((next as any).controlTier || '').trim().toLowerCase() === 'pro' ? 'pro' : 'basic';
    (next as any).controlTier = normalizedControlTier;
    if (normalizedControlTier !== 'pro') {
        (next as any).advancedModeEnabled = false;
        next.proMode = false;
    } else {
        const advancedEnabled = Boolean((next as any).advancedModeEnabled);
        (next as any).advancedModeEnabled = advancedEnabled;
        next.proMode = advancedEnabled;
    }
    // Back-compat for older persisted interaction values.
    if ((next as any).interaction === 'applying') {
        (next as any).interaction = 'applying-opening';
    }

    // Interpretation-first coercion (never refuse on conflicts; resolve to a physically plausible snapshot).
    const type = next.definition.type;
    const allowedMotionsByType: Record<string, ProductStudioState['stateMotion'][]> = {
        capsules: ['static', 'opened', 'spilled', 'dispensed', 'falling'],
        gummies: ['static', 'opened', 'spilled', 'dispensed', 'falling'],
        drops: ['static', 'opened', 'spilled', 'dispensed'],
        powder: ['static', 'opened', 'spilled', 'dispensed', 'pouring'],
    };
    const allowed = allowedMotionsByType[type] ?? ['static'];
    if (!allowed.includes(next.stateMotion)) {
        // Nearest intent mapping (do not block):
        const fallback: Record<string, ProductStudioState['stateMotion']> = {
            pouring: type === 'powder' ? 'pouring' : 'falling',
            falling: type === 'drops' || type === 'powder' ? 'dispensed' : 'falling',
            dispensed: allowed.includes('dispensed') ? 'dispensed' : 'falling',
            spilled: allowed.includes('spilled') ? 'spilled' : 'dispensed',
            opened: allowed.includes('opened') ? 'opened' : 'static',
            static: 'static',
        };
        next.stateMotion = fallback[String(next.stateMotion)] ?? 'static';
    }

    // Container state rules:
    // - Static => cap attached
    // - Non-static => cap removed and NOT visible (handled via positive + negative prompts)

    // Interaction reinterpretation for motion (do not refuse):
    const motion = String(next.stateMotion || 'static');
    const interaction = String(next.interaction || 'none');
    if (motion === 'falling') {
        if (!(interaction === 'none' || interaction === 'cropped-hand')) {
            next.interaction = 'cropped-hand';
        }
    } else if (motion === 'spilled') {
        // Post-spill moment: allow passive hands in-frame (no contact) or a cropped hand for scale.
        // If the user chose an incompatible "hold" interaction, reinterpret to a physically plausible passive presence.
        if (!(interaction === 'none' || interaction === 'cropped-hand' || interaction === 'passive-presence')) {
            next.interaction = 'passive-presence';
        }
    }

    // Force rules (still deterministic):
    if (next.interaction === 'capsule-display') {
        next.stateMotion = 'static';
    }
    if (next.interaction === 'applying-opening') {
        next.stateMotion = 'opened';
    }

    // Photo Mode schema coherence (placement + interaction).
    const schema = PHOTO_MODE_SCHEMAS[next.photoMode];
    const requiredPlacement = schema?.requiredPlacement;
    if (requiredPlacement && requiredPlacement !== 'any' && next.placement !== requiredPlacement) {
        next.placement = requiredPlacement;
    }

    if (schema?.allowsPersonPresence === false && next.interaction !== 'none') {
        next.interaction = 'none';
    }

    const allowedInteractions = schema?.allowedInteractions && schema.allowedInteractions.length > 0
        ? [...schema.allowedInteractions] as ProductStudioState['interaction'][]
        : null;
    if (allowedInteractions && !allowedInteractions.includes(next.interaction)) {
        next.interaction = allowedInteractions.includes('none')
            ? 'none'
            : allowedInteractions[0];
    }

    if (next.placement === 'air' && next.interaction !== 'none') {
        next.interaction = 'none';
    }

    // Motion-placement coherence: keep user-selected motion whenever possible.
    // Only coerce when the pair is physically contradictory.
    if (next.stateMotion === 'spilled' && next.placement === 'air') {
        // Spilled requires a visible support plane.
        next.placement = requiredPlacement && requiredPlacement !== 'any' && requiredPlacement !== 'air'
            ? requiredPlacement
            : 'surface';
    }

    const handInteractions = new Set<ProductStudioState['interaction']>([
        'supported-hold',
        'holding',
        'two-hand-hold',
        'presenting',
        'framed-presentation',
        'applying-opening',
        'capsule-display',
        'resting-interaction',
    ]);

    if (handInteractions.has(next.interaction)) {
        if (next.placement !== 'held' && next.placement !== 'supported') {
            next.placement = 'held';
        }
    }

    if (next.placement === 'held' && next.interaction === 'none') {
        next.placement = requiredPlacement && requiredPlacement !== 'any' && requiredPlacement !== 'held'
            ? requiredPlacement
            : 'surface';
    }

    next.handsHolding = next.interaction !== 'none';

    // Hard canonical physical coherence for motion (silent auto-correct).
    // Motion overrides any persisted physical sub-states that can contradict motion.
    next.definition = applyCanonicalPhysicalForMotion(next.definition, next.stateMotion);

    // Photo Mode conflict rules:
    // "Clear" is disabled by the Hero Background Engine and should never reach this layer.

    return next;
}

// ============================================================================
// SINGLE PRODUCT PREVIEW
// ============================================================================

export function generatePreviewPrompt(state: ProductStudioState): string | null {
    const normalizedState = normalizeProductStudioStateForPrompt(state);
    if (normalizedState.bundle.enabled) {
        let prompt = assembleBundlePrompt(normalizedState);
        prompt = sanitizePromptBeforeValidation(prompt, { allowHands: normalizedState.interaction !== 'none' });
        validatePrompt(prompt, { allowHands: normalizedState.interaction !== 'none' });
        return prompt;
    }

    const activeProduct = normalizedState.products.find(p => p.id === normalizedState.activeProductId);
    if (!activeProduct) return null;

    let prompt = assembleSingleProductPrompt(normalizedState, activeProduct);
    prompt = sanitizePromptBeforeValidation(prompt, { allowHands: normalizedState.interaction !== 'none' });
    validatePrompt(prompt, { allowHands: normalizedState.interaction !== 'none' });

    return prompt;
}
