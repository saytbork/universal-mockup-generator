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
} from './types';

import {
    BASE_STUDIO,
    PHOTO_MODE_PRESETS,
    SURFACE_PRESETS,
    COMPOSITION_PRESETS,
    SCALE_PRESETS,
    SPACING_PRESETS,
    NEGATIVE_SPACE_PRESETS,
    LENS_PRESETS,
    CAMERA_ANGLE_PRESETS,
    CAMERA_DISTANCE_PRESETS,
    LIGHTING_PRESETS,
    FINISH_PRESETS,
    SHADOW_PRESETS,
    INTERACTION_PRESETS,
} from '../promptEngine/studioPresets';

// ============================================================================
// FORBIDDEN TERMS VALIDATION
// ============================================================================

const FORBIDDEN_TERMS = [
    'person', 'people', 'model', 'selfie', 'phone', 'lifestyle',
    'identity', 'influencer', 'creator', 'portrait',
    'human', 'woman', 'man', 'girl', 'boy', 'body',
    'ugc', 'user-generated', 'candid', 'hand', 'hands', 'face',
];

export function validatePrompt(prompt: string): void {
    const lower = prompt.toLowerCase();
    for (const term of FORBIDDEN_TERMS) {
        const regex = new RegExp(`\\b${term}\\b`, 'i');
        if (regex.test(lower)) {
            console.error(`[PROMPT BLOCKED] "${term}" found in: ...${prompt.slice(0, 100)}...`);
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

// ============================================================================
// PRODUCT BUILDER
// ============================================================================

function buildProductDescription(def: ProductDefinition, productName: string): string {
    const parts: string[] = [];

    parts.push(`Professional product photography of ${productName}`);

    const { physical } = def;

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
        'thirds': 'rule of thirds composition',
        'asymmetrical': 'asymmetrical editorial composition',
        'flatlay': 'flat lay top-down composition',
        'pedestal': 'pedestal product presentation',
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
    // Studio mode: no environment, controlled base only
    // If strict studio options are used, environment is suppressed
    if (state.sceneType === 'studio-branding' || state.blankSpaceEnabled || state.environmentContext === null) {
        return '';
    }

    const parts: string[] = [];

    // Editorial mode: abstracted environment
    if (state.sceneType === 'editorial-product') {
        parts.push('editorial setting with stylized surface');
        parts.push(`product placed on ${state.microPlace.replace(/-/g, ' ')}`);
        parts.push('abstracted environment, no specific room context');
    }
    // Lifestyle-real/UGC mode: full environment
    else if (state.sceneType === 'lifestyle-real' || state.sceneType === 'ugc-phone') {
        const envText = state.environmentMacro === 'custom' && state.customEnvironmentText
            ? state.customEnvironmentText
            : state.environmentMacro.replace(/-/g, ' ');

        parts.push(`${envText} setting`);

        const microText = state.microPlace === 'custom' && state.customMicroPlaceText
            ? state.customMicroPlaceText
            : state.microPlace.replace(/-/g, ' ');

        parts.push(`product placed on ${microText}`);
    }

    // Lighting is now separate step 6
    return parts.join(', ');
}

// ============================================================================
// LIGHTING BUILDER (Step 6)
// ============================================================================

function buildLighting(state: ProductStudioState): string {
    const lightingMap: Record<string, string> = {
        'natural-light': 'soft natural lighting',
        'sunny-day': 'bright sunny daylight',
        'golden-hour': 'warm golden hour light',
        'overcast': 'soft overcast diffused light',
        'cozy-indoors': 'cozy warm indoor lighting',
        'ring-light': 'ring light illumination',
        'mood-lighting': 'atmospheric mood lighting',
        'night-mode': 'night mode low-light',
        'flash-photo': 'flash photography lighting',
        'clinical-softbox': 'clinical softbox studio lighting',
    };

    return `${lightingMap[state.lighting] || 'professional lighting'}, soft shadows, controlled highlights, clean reflections, no harsh cinematic contrast`;
}

// ============================================================================
// CAMERA BUILDER (Step 8)
// ============================================================================

function buildCamera(state: ProductStudioState): string {
    const parts: string[] = [];

    parts.push(`shot on professional ${state.cameraSystem.toUpperCase()} camera`);

    const angleMap = {
        'front': 'straight-on front view',
        '45': '45-degree hero angle',
        'top': 'top-down flat lay perspective',
    };
    parts.push(angleMap[state.angle]);

    const distanceMap = {
        'macro': 'macro close-up detail',
        'close': 'close-up framing',
        'medium': 'standard framing, full product visible', // Enforce full visibility
    };
    parts.push(distanceMap[state.distance]);

    if (state.rotation === 'slight') {
        parts.push('slight intentional rotation');
    }

    // Framing is handled in Composition/Art Direction now, but camera technicals stay here
    parts.push('product-first framing');
    parts.push('no accidental cropping');
    parts.push('background separation without blur abuse');

    return parts.join(', ');
}

// ============================================================================
// SCENE TYPE BUILDER (Step 1)
// ============================================================================

function buildSceneType(state: ProductStudioState): string {
    const map: Record<SceneType, string> = {
        'studio-branding': 'Clean studio product photography',
        'editorial-product': 'High-end editorial product shot',
        'lifestyle-real': 'Authentic lifestyle product photography',
        'ugc-phone': 'iPhone photo of product' // Though blocked, we map it just in case
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
    if (state.photoMode && PHOTO_MODE_PRESETS[state.photoMode]) {
        return `PHOTO_MODE: ${PHOTO_MODE_PRESETS[state.photoMode]}`;
    }
    return '';
}

function buildBackground(state: ProductStudioState): string {
    // 1. Explicit Hex/Custom Background (Prioritized)
    if (state.backgroundColor) {
        return `BACKGROUND: Custom studio background. Primary color: ${state.backgroundColor}. No physical walls, no rooms, no scenery.`;
    }

    // 2. Fallback to generic if no hex
    return '';
}

function buildShadow(state: ProductStudioState): string {
    if (state.shadow && SHADOW_PRESETS[state.shadow]) {
        return SHADOW_PRESETS[state.shadow];
    }
    return '';
}

// ============================================================================
// CREATIVITY BUILDER
// ============================================================================

function buildCreativity(state: ProductStudioState): string {
    if (state.blankSpaceEnabled) return '';

    const parts: string[] = [];

    // 0. Props Injection (Ingredient Stack Support)
    // Only inject props if in Ingredient Stack mode OR if density is explicitly set
    const isIngredientStack = state.photoMode === 'Ingredient Stack';
    if (state.props && (isIngredientStack || state.propDensity !== 'none')) {
        parts.push(`PROPS/INGREDIENTS: ${state.props}. Arranged naturally around the product.`);
    }

    // Creativity Level 0Check = Off
    if (state.creativityLevel === 0 && !isIngredientStack) return parts.join(' ');

    // 1. Creative Theme (Expanded)
    const themeMap: Record<CreativeTheme, string> = {
        'clinical-minimal': 'clinical minimal aesthetic, clean lines, medical precision',
        'premium-clean': 'premium clean aesthetic, luxury feel, refined elegance',
        'bold-graphic': 'bold graphic style, strong colors, visual impact',
        'ingredient-color': 'ingredient-focused color story, vibrant fresh tones',
        'fresh-bright': 'fresh and bright daylight aesthetic, airy atmosphere',
        'dark-dramatic': 'dark dramatic mood, high contrast, luxury noir feel',
        'playful-pop': 'playful pop-art aesthetic, vibrant energy',
        'tech-clean': 'tech-focused clean aesthetic, futuristic minimalism',
    };
    parts.push(themeMap[state.creativeTheme]);

    // 2. Light Style (Creative Lighting)
    const lightStyleMap: Record<LightStyle, string> = {
        'soft': 'soft diffused creative lighting',
        'clinical': 'crisp clinical evenly lit',
        'contrast': 'high contrast artistic lighting',
        'shadow-play': 'gentle artistic shadow play',
    };
    parts.push(lightStyleMap[state.lightStyle]);

    const paletteMap: Record<PaletteSource, string> = {
        'brand': 'colors derived from product branding',
        'warm-neutral': 'warm neutral palette, beige and creams',
        'cool-neutral': 'cool neutral palette, slate and silver',
        'complementary': 'complementary accent colors',
        'custom': 'custom defined palette',
    };
    parts.push(paletteMap[state.paletteSource]);

    // 4. Props
    if (state.propDensity !== 'none' && state.selectedProps.length > 0) {
        const densityMap: Record<PropDensity, string> = {
            'none': '',
            'low': 'minimal minimal props',
            'medium': 'moderate prop styling',
            'dense': 'rich dense prop styling',
        };
        parts.push(densityMap[state.propDensity] || '');
        parts.push(`props: ${state.selectedProps.join(', ')}`);
        parts.push('props are secondary and slightly out of focus');
        parts.push('no branded props, no readable text on props');
    }

    return parts.filter(Boolean).join(', ');
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
    parts.push('neutral seamless background');
    parts.push('asymmetrical product placement');

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
        '4:5': 'portrait 4:5 aspect ratio',
        '16:9': 'landscape 16:9 aspect ratio',
    };
    return map[state.aspectRatio];
}

function buildNegativeConstraints(): string {
    return 'no living subjects, no biological forms, no digital devices, no user content, product only, inanimate objects only, clean composition, commercial standard, high resolution, sharp focus';
}

function buildQualityBar(): string {
    return 'real ecommerce hero image, premium supplement or skincare brand campaign, ultra clean, high resolution, commercial-ready, no ambiguity, art-directed, brand-safe';
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

    // 1. Scene Type
    segments.push(buildSceneType(state));

    // 1. Product Definition (Source of Truth)
    segments.push(buildProductDescription(state.definition, product.name));

    // 2. Scene Type (Defines Logic) - Explicitly first in list but logically secondary to product
    segments.push(buildSceneType(state));

    // 3. Environment + Micro Place (When allowed)
    if (!state.blankSpaceEnabled) {
        const environment = buildEnvironment(state);
        if (environment) segments.push(environment);
    }

    // 4. Composition & Art Direction (Key for Olly/AG1)
    segments.push(buildComposition(state));
    // 4b. Photo Mode (NEW)
    segments.push(buildPhotoMode(state));
    // 4c. Background (NEW - Hex Support)
    segments.push(buildBackground(state));
    // 4d. Shadow (NEW)
    segments.push(buildShadow(state));

    // 5. Creativity System (Includes Props)
    if (!state.blankSpaceEnabled) {
        const creativity = buildCreativity(state);
        if (creativity) segments.push(creativity);
    }

    // 6. Props (Handled in Creativity)

    // 7. Lighting (Product Safe)
    if (!state.blankSpaceEnabled) {
        segments.push(buildLighting(state));
    }

    // 8. Camera & Framing
    segments.push(buildCamera(state));

    // 9. Bundle Logic (N/A)

    // 10. Negative Constraints (Strict)
    segments.push(buildNegativeConstraints());

    // 11. Final Quality Bar
    segments.push(buildQualityBar());

    // Aspect ratio technical
    segments.push(buildAspectRatio(state));

    // Ecommerce - now merged into composition and negative space
    // keeping blank space enforcement if needed
    if (state.blankSpaceEnabled) {
        // Double down on white background if strictly needed for ecommerce
        segments.push('neutral seamless background');
    }

    return segments.filter(Boolean).join(', ');
}

function assembleBundlePrompt(state: ProductStudioState): string {
    const segments: string[] = [];

    // 1. Scene Type
    segments.push(buildSceneType(state));

    // 1. Product Definition (Primary)
    const primary = state.products.find(p => p.id === state.bundle.primaryProductId);
    if (primary) {
        segments.push(buildProductDescription(state.definition, primary.name));
    }

    // 2. Scene Type
    segments.push(buildSceneType(state));

    // 9. Bundle Logic (If Applicable) - Placed early to define subject
    segments.push(buildBundleComposition(state));

    // 3. Environment
    if (!state.blankSpaceEnabled) {
        const environment = buildEnvironment(state);
        if (environment) segments.push(environment);
    }

    // 4. Composition
    segments.push(buildComposition(state));
    // 4b. Photo Mode (NEW)
    segments.push(buildPhotoMode(state));
    // 4c. Background (NEW - Hex Support)
    segments.push(buildBackground(state));
    // 4d. Shadow (NEW)
    segments.push(buildShadow(state));

    // 5. Creativity
    if (!state.blankSpaceEnabled) {
        const creativity = buildCreativity(state);
        if (creativity) segments.push(creativity);
    }

    // 7. Lighting
    if (!state.blankSpaceEnabled) {
        segments.push(buildLighting(state));
    }

    // 8. Camera
    segments.push(buildCamera(state));

    // 10. Negative Constraints
    segments.push(buildNegativeConstraints());

    // 11. Final Quality Bar
    segments.push(buildQualityBar());

    segments.push(buildAspectRatio(state));

    if (state.blankSpaceEnabled) {
        segments.push('neutral seamless background');
    }

    return segments.filter(Boolean).join(', ');
}

// ============================================================================
// NEGATIVE PROMPT
// ============================================================================

function buildNegativePrompt(): string {
    return [
        'blurry', 'low quality', 'distorted', 'watermark', 'text overlay',
        'cartoon', 'illustration', 'drawing', 'anime',
        'oversaturated', 'underexposed', 'overexposed',
    ].join(', ');
}

// ============================================================================
// GENERATE JOBS
// ============================================================================

export function generateProductJobs(state: ProductStudioState): ProductGenerationJob[] {
    // Mandatory state logging
    console.log('[PRODUCT STUDIO STATE]', state);

    if (state.products.length === 0) {
        console.warn('[ProductStudio] No products to generate');
        return [];
    }

    console.log('[BUNDLE STATE]', JSON.stringify(state.bundle, null, 2));
    console.log('[SCENE TYPE]', state.sceneType);

    // Bundle mode: ONE image only
    if (state.bundle.enabled) {
        validateBundleState(state);

        const prompt = assembleBundlePrompt(state);
        validatePrompt(prompt);

        console.log(`[FINAL PRODUCT PROMPT] Bundle:`, prompt);

        return [{
            productId: state.bundle.primaryProductId!,
            productName: `Bundle: ${state.bundle.mode}`,
            prompt,
            negativePrompt: buildNegativePrompt(),
            aspectRatio: state.aspectRatio,
            bundleId: state.bundle.selectedBundleId || 'custom',
            sceneType: state.sceneType,
        }];
    }

    // Standard mode: one image per product
    const jobs: ProductGenerationJob[] = [];

    for (const product of state.products) {
        const prompt = assembleSingleProductPrompt(state, product);
        validatePrompt(prompt);

        console.log(`[FINAL PRODUCT PROMPT] ${product.name}:`, prompt);

        jobs.push({
            productId: product.id,
            productName: product.name,
            prompt,
            negativePrompt: buildNegativePrompt(),
            aspectRatio: state.aspectRatio,
            sceneType: state.sceneType,
        });
    }

    return jobs;
}

// ============================================================================
// SINGLE PRODUCT PREVIEW
// ============================================================================

export function generatePreviewPrompt(state: ProductStudioState): string | null {
    if (state.bundle.enabled) {
        const prompt = assembleBundlePrompt(state);
        validatePrompt(prompt);
        return prompt;
    }

    const activeProduct = state.products.find(p => p.id === state.activeProductId);
    if (!activeProduct) return null;

    const prompt = assembleSingleProductPrompt(state, activeProduct);
    validatePrompt(prompt);

    return prompt;
}
