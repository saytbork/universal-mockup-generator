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

export function validatePrompt(prompt: string, options?: { allowHands?: boolean }): void {
    const lower = prompt.toLowerCase();
    for (const term of FORBIDDEN_TERMS) {
        // Product Studio can optionally allow a cropped hand interaction.
        // When allowed, we only relax the "hand(s)" filter; people/faces/bodies remain blocked.
        if (options?.allowHands === true && (term === 'hand' || term === 'hands')) {
            continue;
        }
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
        const envText = macro === 'custom' && state.customEnvironmentText
            ? state.customEnvironmentText
            : macro.replace(/-/g, ' ');

        parts.push(`STUDIO SET: ${envText}-inspired set styling (abstract cues only, not a real location)`);

        const microText = micro === 'custom' && state.customMicroPlaceText
            ? state.customMicroPlaceText
            : micro.replace(/-/g, ' ');
        if (microText) {
            parts.push(`base surface cue: ${microText}`);
        }

        return parts.join(', ');
    }

    // Editorial mode: abstracted environment
    if (state.sceneType === 'editorial-product') {
        parts.push('editorial setting with stylized surface');
        if (micro) {
            parts.push(`product placed on ${micro.replace(/-/g, ' ')}`);
        }
        parts.push('abstracted environment, no specific room context');
    }
    // Lifestyle-real/UGC mode: full environment
    else if (state.sceneType === 'lifestyle-real' || state.sceneType === 'ugc-phone') {
        const envText = macro === 'custom' && state.customEnvironmentText
            ? state.customEnvironmentText
            : macro.replace(/-/g, ' ');

        parts.push(`${envText} setting`);

        const microText = micro === 'custom' && state.customMicroPlaceText
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
    // Pro photographer mode uses lighting rigs (preset-driven) across scene types.
    // This keeps the control decisive and prevents "it does nothing" confusion.
    if (state.proMode && state.lightingRig && LIGHTING_PRESETS[state.lightingRig]) {
        return `LIGHTING_RIG: ${LIGHTING_PRESETS[state.lightingRig]}`;
    }

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

function buildLens(state: ProductStudioState): string {
    if (!state.proMode) return '';
    if (!state.lens) return '';
    const preset = LENS_PRESETS[state.lens];
    return preset ? `LENS: ${preset}` : `LENS: ${state.lens}`;
}

function buildFinish(state: ProductStudioState): string {
    if (!state.proMode) return '';
    if (!state.finish) return '';
    const preset = FINISH_PRESETS[state.finish];
    return preset ? `FINISH: ${preset}` : `FINISH: ${state.finish}`;
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

function buildCustomHeroCue(state: ProductStudioState): string {
    const cue = state.customHeroCue?.trim();
    if (!cue) return '';
    return `HERO_CUE: ${cue}`;
}

function buildInteraction(state: ProductStudioState): string {
    const allowHands = state.interaction !== 'none' || state.handsHolding === true;
    if (!allowHands) return '';

    // Keep wording strictly "hand-only" (no heads/torso) and avoid any "lifestyle/people" phrasing.
    switch (state.interaction) {
        case 'cropped-hand':
            return 'INTERACTION: single cropped hand at the edge of frame lightly touching or presenting the product; hand-only crop, exclude any other anatomy outside the hand';
        case 'holding':
            return 'INTERACTION: single cropped hand holding the product with a natural grip; hand-only crop, exclude any other anatomy outside the hand';
        case 'presenting':
            return 'INTERACTION: single cropped hand presenting the product from the side; hand-only crop, exclude any other anatomy outside the hand';
        case 'applying':
            return 'INTERACTION: single cropped hand opening, dispensing, or applying the product; hand-only crop, exclude any other anatomy outside the hand';
        default:
            // Back-compat: if an older UI path toggles handsHolding without a specific interaction.
            if (state.handsHolding === true) {
                return 'INTERACTION: single cropped hand at the edge of frame lightly presenting the product; hand-only crop, exclude any other anatomy outside the hand';
            }
            return '';
    }
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
        // Avoid forbidden term "lifestyle" while still allowing real environments in product-only mode.
        'lifestyle-real': 'Real-world product photography',
        // Avoid forbidden term "phone" (kept for compatibility, but not intended for Product Studio UI)
        'ugc-phone': 'Casual snapshot of product'
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
    if (!state.photoMode) return '';
    const preset = PHOTO_MODE_PRESETS[state.photoMode];
    return preset ? `PHOTO_MODE: ${preset}` : `PHOTO_MODE: ${state.photoMode}`;
}

function buildBackground(state: ProductStudioState): string {
    // Real environments: avoid "studio background" contradictions.
    if (state.sceneType === 'lifestyle-real' || state.sceneType === 'ugc-phone') {
        const bg = normalizeHexOrEmpty(state.backgroundColor);
        const bgName = safeHexToColorName(bg);
        if (!bg || bg.toLowerCase() === '#ffffff' || bgName === 'white') return '';
        const accentName = safeHexToColorName(normalizeHexOrEmpty(state.accentColor));
        if (accentName && accentName !== 'white' && accentName !== 'neutral') {
            return `COLOR PALETTE: subtle ${bgName} accents with ${accentName} highlights.`;
        }
        return `COLOR PALETTE: subtle ${bgName} accents.`;
    }

    // Gradient background (ecommerce + studio)
    if (state.gradientEnabled) {
        const start = state.gradientStart?.trim() || '#ffffff';
        const end = state.gradientEnd?.trim() || '#f0f0f0';
        const angle = typeof state.gradientAngle === 'number' ? state.gradientAngle : 180;
        return `BACKGROUND: Smooth gradient backdrop from ${safeHexToColorName(start)} to ${safeHexToColorName(end)} at ${angle} degrees. Seamless, studio-clean.`;
    }

    // 1. Explicit Hex/Custom Background (Prioritized)
    {
        const color = normalizeHexOrEmpty(state.backgroundColor);
        const isDefaultWhite = !!color && color.toLowerCase() === '#ffffff';
        if (isDefaultWhite) {
            return 'BACKGROUND: Clean seamless studio backdrop in neutral white (no beige cast).';
        }
        if (color) {
            return `BACKGROUND: Clean seamless studio backdrop in ${safeHexToColorName(color)} tone.`;
        }
    }

    // 2. Fallback to generic if no hex
    return 'BACKGROUND: Clean seamless studio backdrop in neutral white (no beige cast).';
}

function buildShadow(state: ProductStudioState): string {
    if (!state.shadow) return '';

    const shadowKeyMap: Record<ProductStudioState['shadow'], keyof typeof SHADOW_PRESETS> = {
        'soft-drop': 'Soft Drop',
        'hard-drop': 'Hard Drop',
        'floating': 'Floating',
    };

    const presetKey = shadowKeyMap[state.shadow];
    return presetKey ? (SHADOW_PRESETS[presetKey] || '') : '';
}

// ============================================================================
// CREATIVITY BUILDER
// ============================================================================

function buildCreativity(state: ProductStudioState): string {
    if (state.blankSpaceEnabled) return '';

    const parts: string[] = [];
    const proRigActive = !!(state.proMode && state.lightingRig && LIGHTING_PRESETS[state.lightingRig]);

    // 0. Props Injection (Always honor explicit user input)
    const propsText = state.props?.trim();
    if (propsText) {
        parts.push(`PROPS: ${propsText}. Arrange as subtle set dressing around the product. No readable text/logos on props.`);
    }

    // Creativity Level 0Check = Off
    if (state.creativityLevel === 0) return parts.join(' ');

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
    // If Pro lighting rig is active, do NOT add a second competing lighting description here.
    if (!proRigActive) {
        const lightStyleMap: Record<LightStyle, string> = {
            'soft': 'soft diffused creative lighting',
            'clinical': 'crisp clinical evenly lit',
            'contrast': 'high contrast artistic lighting',
            'shadow-play': 'gentle artistic shadow play',
        };
        parts.push(lightStyleMap[state.lightStyle]);
    }

    const paletteMap: Record<PaletteSource, string> = {
        'brand': 'colors derived from the product packaging and label',
        'warm-neutral': 'warm neutral palette (creams and warm grays, no yellow/beige cast)',
        'cool-neutral': 'cool neutral palette, slate and silver',
        'complementary': 'complementary accent colors',
        'custom': 'custom defined palette (use selected background + accent colors)',
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
        parts.push('props are secondary and never steal focus');
        parts.push('no branded props, no readable text on props');
    }

    return parts.filter(Boolean).join(', ');
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

    // Background directive (solid/gradient)
    if (state.gradientEnabled) {
        const start = state.gradientStart?.trim() || '#ffffff';
        const end = state.gradientEnd?.trim() || '#f0f0f0';
        const angle = typeof state.gradientAngle === 'number' ? state.gradientAngle : 180;
        parts.push(`seamless gradient background from ${safeHexToColorName(start)} to ${safeHexToColorName(end)} at ${angle} degrees`);
    } else if (state.backgroundColor && state.backgroundColor.trim().toLowerCase() !== '#ffffff') {
        parts.push(`seamless solid background in ${safeHexToColorName(state.backgroundColor.trim())} tone`);
    } else {
        parts.push('neutral seamless background');
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
        '4:5': 'portrait 4:5 aspect ratio',
        '4:3': 'landscape 4:3 aspect ratio',
        '16:9': 'landscape 16:9 aspect ratio',
    };
    return map[state.aspectRatio];
}

function buildNegativeConstraints(state: ProductStudioState): string {
    const allowHands = state.interaction !== 'none' || state.handsHolding === true;

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
    const allowHands = state.interaction !== 'none' || state.handsHolding === true;
    if (allowHands) {
        return 'real ecommerce hero image, premium commercial product photography, ultra clean, high resolution, commercial-ready, no ambiguity, art-directed, brand-safe, product with a single cropped hand only, tack-sharp label';
    }
    return 'real ecommerce hero image, premium commercial product photography, ultra clean, high resolution, commercial-ready, no ambiguity, art-directed, brand-safe, inanimate objects only, tack-sharp label';
}

function buildIntegrityConstraints(): string {
    // Keep this free of forbidden human terms.
    return [
        'single product only (unless bundle mode)',
        'product must be fully assembled and physically plausible',
        'no duplicates of the product',
        'no broken, warped, melted, or deformed objects',
        'no floating parts, no separated components',
        'no partial or missing parts (cap, dropper, lid, label must be aligned and intact)',
    ].join(', ');
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
    segments.push(buildProductDescription(state, product));

    // 3. Environment + Micro Place (When allowed)
    if (!state.blankSpaceEnabled) {
        const environment = buildEnvironment(state);
        if (environment) segments.push(environment);
    }

    // 4. Composition & Art Direction (Key for Olly/AG1)
    // In Ecommerce Blank Space mode, composition is governed by `buildEcommerce()`.
    if (!state.blankSpaceEnabled) {
        segments.push(buildComposition(state));
    }
    // 4b. Photo Mode (NEW)
    segments.push(buildPhotoMode(state));
    // 4c. Background (NEW - Hex Support)
    if (!state.blankSpaceEnabled) {
        segments.push(buildBackground(state));
    }
    // 4d. Shadow (NEW)
    segments.push(buildShadow(state));
    // 4e. Studio Styling (NEW)
    segments.push(buildLens(state));
    segments.push(buildFinish(state));
    segments.push(buildAccentColor(state));
    if (!state.blankSpaceEnabled) {
        segments.push(buildAlignment(state));
    }
    segments.push(buildCustomHeroCue(state));

    // 5. Creativity System (Includes Props)
    if (!state.blankSpaceEnabled) {
        const creativity = buildCreativity(state);
        if (creativity) segments.push(creativity);
    }

    // 6. Props (Handled in Creativity)

    // 7. Lighting (Product Safe)
    segments.push(buildLighting(state));

    // 8. Camera & Framing
    segments.push(buildCamera(state));

    // 9. Interaction (optional cropped hand)
    segments.push(buildInteraction(state));

    // 9b. Ecommerce (Blank Space mode)
    if (state.blankSpaceEnabled) {
        segments.push(buildEcommerce(state));
    }

    // 11. Final Quality Bar
    segments.push(buildQualityBar(state));

    // 11b. Integrity / Artifact Guards
    segments.push(buildIntegrityConstraints());

    // Aspect ratio technical
    segments.push(buildAspectRatio(state));

    const finalPrompt = segments.filter(Boolean).join(', ');
    console.log('2. Generated Prompt Parts:', segments);
    console.log('3. FINAL PROMPT:', finalPrompt);
    console.groupEnd();

    return finalPrompt;
}

function assembleBundlePrompt(state: ProductStudioState): string {
    const segments: string[] = [];

    // 1. Scene Type
    segments.push(buildSceneType(state));

    // 1. Product Definition (Primary)
    const primary = state.products.find(p => p.id === state.bundle.primaryProductId);
    if (primary) {
        segments.push(buildProductDescription(state, primary));
    }

    // 9. Bundle Logic (If Applicable) - Placed early to define subject
    segments.push(buildBundleComposition(state));

    // 3. Environment
    if (!state.blankSpaceEnabled) {
        const environment = buildEnvironment(state);
        if (environment) segments.push(environment);
    }

    // 4. Composition
    if (!state.blankSpaceEnabled) {
        segments.push(buildComposition(state));
    }
    // 4b. Photo Mode (NEW)
    segments.push(buildPhotoMode(state));
    // 4c. Background (NEW - Hex Support)
    if (!state.blankSpaceEnabled) {
        segments.push(buildBackground(state));
    }
    // 4d. Shadow (NEW)
    segments.push(buildShadow(state));

    // 5. Creativity
    if (!state.blankSpaceEnabled) {
        const creativity = buildCreativity(state);
        if (creativity) segments.push(creativity);
    }

    // 7. Lighting
    segments.push(buildLighting(state));

    // 8. Camera
    segments.push(buildCamera(state));

    // 10. Negative Constraints
    // 11. Final Quality Bar
    segments.push(buildQualityBar(state));

    // 11b. Integrity / Artifact Guards
    segments.push(buildIntegrityConstraints());

    segments.push(buildAspectRatio(state));

    if (state.blankSpaceEnabled) {
        segments.push(buildEcommerce(state));
    }

    return segments.filter(Boolean).join(', ');
}

// ============================================================================
// NEGATIVE PROMPT
// ============================================================================

function buildNegativePrompt(state: ProductStudioState): string {
    const allowHands = state.interaction !== 'none' || state.handsHolding === true;
    const humanNegatives = allowHands
        ? ['person', 'people', 'face', 'body', 'full hand', 'multiple hands']
        : ['person', 'people', 'face', 'body', 'hand', 'hands'];

    return [
        ...humanNegatives,
        // Quality / artifacts
        'blurry', 'low quality', 'distorted', 'warped', 'deformed', 'melted', 'glitched',
        'broken object', 'broken glass', 'cracked', 'shattered', 'fragmented',
        'floating parts', 'separated parts', 'disconnected components', 'disembodied cap', 'detached dropper',
        'duplicate product', 'multiple bottles', 'extra caps', 'extra droppers',
        'cropped product', 'cut off', 'missing parts', 'tilted horizon',
        // Styling / safety
        'watermark', 'text overlay',
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
        validatePrompt(prompt, { allowHands: state.interaction !== 'none' || state.handsHolding === true });

        console.log(`[FINAL PRODUCT PROMPT] Bundle:`, prompt);

        return [{
            productId: state.bundle.primaryProductId!,
            productName: `Bundle: ${state.bundle.mode}`,
            prompt,
            negativePrompt: buildNegativePrompt(state),
            aspectRatio: state.aspectRatio,
            bundleId: state.bundle.selectedBundleId || 'custom',
            sceneType: state.sceneType,
        }];
    }

    // Standard mode: one image per product
    const jobs: ProductGenerationJob[] = [];

    for (const product of state.products) {
        const prompt = assembleSingleProductPrompt(state, product);
        validatePrompt(prompt, { allowHands: state.interaction !== 'none' || state.handsHolding === true });

        console.log(`[FINAL PRODUCT PROMPT] ${product.name}:`, prompt);

        jobs.push({
            productId: product.id,
            productName: product.name,
            prompt,
            negativePrompt: buildNegativePrompt(state),
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
        validatePrompt(prompt, { allowHands: state.interaction !== 'none' || state.handsHolding === true });
        return prompt;
    }

    const activeProduct = state.products.find(p => p.id === state.activeProductId);
    if (!activeProduct) return null;

    const prompt = assembleSingleProductPrompt(state, activeProduct);
    validatePrompt(prompt, { allowHands: state.interaction !== 'none' || state.handsHolding === true });

    return prompt;
}
