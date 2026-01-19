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
import { applyCanonicalPhysicalForMotion } from './motionCoherence';

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
    const isPhotoStudio = state.sceneType === 'studio-branding';

    // Photo Studio: allow lighting rigs (preset-driven).
    // Also honor a selected (non-default) rig even if Pro Mode is toggled off later.
    if (isPhotoStudio) {
        const lightingRig = String(state.lightingRig || '').trim();
        const lightingRigPreset = lightingRig ? LIGHTING_PRESETS[lightingRig] : undefined;
        const isNonDefaultRig = lightingRig !== '' && lightingRig !== 'Softbox Wrap';
        if ((state.proMode || isNonDefaultRig) && lightingRigPreset) {
            return `LIGHTING_RIG: ${lightingRigPreset}`;
        }
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

// ============================================================================
// PRODUCT STATE & MOTION (Product-only)
// ============================================================================

function buildStateMotion(state: ProductStudioState): string {
    const motion = String(state.stateMotion || 'static');
    const { physical } = state.definition;

    if (motion === 'static') {
        return [
            'PRODUCT_STATE_MOTION: Static.',
            'Product fully assembled.',
            'Cap present and attached.',
            'Contents fully contained.',
            'Product resting on a surface with grounded shadows.',
            'No motion.',
        ].join(' ');
    }

    if (motion === 'opened') {
        return [
            'PRODUCT_STATE_MOTION: Opened.',
            'Container is open and resting on a surface.',
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
            'Container touches the surface (no floating).',
            'Orientation is horizontal or slightly tilted.',
            'Mouth is open.',
            'Contents spilled onto the surface.',
            'Gravity-resolved distribution.',
            'Grounded contact shadows.',
            'All contents must rest on the surface plane (no mid-air capsules).',
            'No levitation. No suspension. No airborne-only composition.',
            // Cap handling: allow either out-of-frame or resting nearby on the surface.
            'Cap removed; it may be visible nearby resting on the surface, or fully outside frame.',
        ].join(' ');
    }

    return '';
}

function buildInteraction(state: ProductStudioState): string {
    const allowHands = state.interaction !== 'none' || state.handsHolding === true;
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

    const preset = INTERACTION_PRESETS[presetKey] || '';
    return [
        `PRODUCT_INTERACTION: ${presetKey}.`,
        preset,
        'Hands and interaction are treated as controlled visual elements, not decoration.',
        'Only one interaction mode is allowed. No hybrid interactions.',
        'Hands must look natural and relaxed. No stiff fingers. No theatrical gestures.',
        'Product is always the visual hero. Hands never overpower the product.'
    ]
        .filter(Boolean)
        .join(' ');
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
    if (preset) {
        return `PHOTO_MODE (NON-NEGOTIABLE): ${state.photoMode}. ${preset}`;
    }
    return `PHOTO_MODE (NON-NEGOTIABLE): ${state.photoMode}.`;
}

function buildBackground(state: ProductStudioState): string {
    // Photo-mode hard rule: Clear means absolute pure white.
    if (state.photoMode === 'Clear') {
        return 'BACKGROUND: Pure solid white #FFFFFF seamless studio backdrop. Absolutely no tint, no beige/green cast, no gradient.';
    }

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
    // 1. Explicit background color only when user chose a non-white, or explicitly locked to white.
    // If the user never touched background and it remains default white, defer to PHOTO_MODE styling.
    const color = normalizeHexOrEmpty(state.backgroundColor);
    if (!color) return '';

    const isWhite = color.toLowerCase() === '#ffffff';
    if (isWhite && !state.colorLocks?.background) return '';
    if (isWhite) {
        return 'BACKGROUND: Pure solid white #FFFFFF seamless studio backdrop. Absolutely no tint, no beige/green cast, no gradient.';
    }
    return `BACKGROUND: Clean seamless studio backdrop in ${safeHexToColorName(color)} tone.`;
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
    const proRigActive = (() => {
        if (state.sceneType !== 'studio-branding') return false;
        const lightingRig = String(state.lightingRig || '').trim();
        const hasPreset = !!(lightingRig && LIGHTING_PRESETS[lightingRig]);
        const isNonDefaultRig = lightingRig !== '' && lightingRig !== 'Softbox Wrap';
        return hasPreset && (state.proMode || isNonDefaultRig);
    })();

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
    return [
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
    ].join(', ');
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
        next = next.replaceAll(phrase, '');
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

    return next.replace(/\s+/g, ' ').replace(/,\s*,/g, ',').trim();
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
    const isPhotoStudio = state.sceneType === 'studio-branding';

    // 1. Scene Type
    segments.push(buildSceneType(state));

    // 1. Product Definition (Source of Truth)
    segments.push(buildProductDescription(state, product));

    // 2. Product State & Motion (Product-only; no human implied)
    segments.push(buildStateMotion(state));

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
    // 4b–4e. Photo Studio styling blocks (mutually exclusive with Environment)
    if (isPhotoStudio) {
        segments.push(buildPhotoMode(state));
        if (!state.blankSpaceEnabled) {
            segments.push(buildBackground(state));
        }
        segments.push(buildShadow(state));
        segments.push(buildLens(state));
        segments.push(buildFinish(state));
        segments.push(buildAccentColor(state));
        if (!state.blankSpaceEnabled) {
            segments.push(buildAlignment(state));
        }
    }

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
    segments.push(buildIntegrityConstraints(state));

    // Aspect ratio technical
    segments.push(buildAspectRatio(state));

    const finalPrompt = enforceMotionPromptCoherence(segments.filter(Boolean).join(', '), state);
    console.log('2. Generated Prompt Parts:', segments);
    console.log('3. FINAL PROMPT:', finalPrompt);
    console.groupEnd();

    return finalPrompt;
}

function assembleBundlePrompt(state: ProductStudioState): string {
    const segments: string[] = [];
    const isPhotoStudio = state.sceneType === 'studio-branding';

    // 1. Scene Type
    segments.push(buildSceneType(state));

    // 1. Product Definition (Primary)
    const primary = state.products.find(p => p.id === state.bundle.primaryProductId);
    if (primary) {
        segments.push(buildProductDescription(state, primary));
    }

    // 2. Product State & Motion (Product-only; no human implied)
    segments.push(buildStateMotion(state));

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
    // 4b–4d. Photo Studio styling blocks (mutually exclusive with Environment)
    if (isPhotoStudio) {
        segments.push(buildPhotoMode(state));
        if (!state.blankSpaceEnabled) {
            segments.push(buildBackground(state));
        }
        segments.push(buildShadow(state));
    }

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
    segments.push(buildIntegrityConstraints(state));

    segments.push(buildAspectRatio(state));

    if (state.blankSpaceEnabled) {
        segments.push(buildEcommerce(state));
    }

    return enforceMotionPromptCoherence(segments.filter(Boolean).join(', '), state);
}

// ============================================================================
// NEGATIVE PROMPT
// ============================================================================

function buildNegativePrompt(state: ProductStudioState): string {
    const interaction = String(state.interaction || 'none');
    const allowHands = interaction !== 'none' || state.handsHolding === true;
    const motion = String(state.stateMotion || 'static');

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
        ...humanNegativesBase,
        ...handsNegatives,
        ...interactionSpecific,
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
        'mist', 'smoke',
        'exaggerated splash',
        'floating hands', 'stiff fingers', 'mannequin hands',
        'distracting jewelry', 'oversized jewelry',
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

        const prompt = assembleBundlePrompt(normalizedState);
        validatePrompt(prompt, { allowHands: normalizedState.interaction !== 'none' || normalizedState.handsHolding === true });

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
        const prompt = assembleSingleProductPrompt(normalizedState, product);
        validatePrompt(prompt, { allowHands: normalizedState.interaction !== 'none' || normalizedState.handsHolding === true });

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
    // Back-compat for older persisted interaction values.
    if ((next as any).interaction === 'applying') {
        (next as any).interaction = 'applying-opening';
    }

    // Interpretation-first coercion (never refuse on conflicts; resolve to a physically plausible snapshot).
    const type = next.definition.type;
    // Auto-correct to SPILLED_ON_SURFACE (canonical) when a surface is present to prevent aerial interpretations.
    const surfacePresent = next.blankSpaceEnabled === false;
    const discreteSurfaceSpillTypes = new Set(['capsules', 'gummies', 'powder']);
    if (
        surfacePresent &&
        discreteSurfaceSpillTypes.has(type) &&
        (next.stateMotion === 'falling' || next.stateMotion === 'dispensed' || next.stateMotion === 'spilled')
    ) {
        next.stateMotion = 'spilled';
    }
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
            falling: type === 'drops' ? 'dispensed' : 'falling',
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
        if (!(interaction === 'none' || interaction === 'cropped-hand')) {
            next.interaction = 'none';
        }
    }

    // Force rules (still deterministic):
    if (next.interaction === 'capsule-display') {
        next.stateMotion = 'static';
    }
    if (next.interaction === 'applying-opening') {
        next.stateMotion = 'opened';
    }
    next.handsHolding = next.interaction !== 'none';

    // Hard canonical physical coherence for motion (silent auto-correct).
    // Motion overrides any persisted physical sub-states that can contradict motion.
    next.definition = applyCanonicalPhysicalForMotion(next.definition, next.stateMotion);

    // Photo Mode conflict rules:
    // "Clear" is absolute: pure white studio, no set dressing or creative styling blocks.
    if (next.photoMode === 'Clear') {
        next.backgroundColor = '#FFFFFF';
        next.gradientEnabled = false;
        next.props = '';
        next.selectedProps = [];
        next.propDensity = 'none';
        next.creativityLevel = 0;
        next.paletteSource = 'custom';

        // Clear should not imply any environment/set cues.
        next.environmentContext = null;
        next.environmentMacro = 'studio';
        next.microPlace = 'neutral-surface';
    }

    return next;
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
