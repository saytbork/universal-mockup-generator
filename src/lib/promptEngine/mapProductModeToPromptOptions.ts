/**
 * PRODUCT MODE PROMPT MAPPER
 * Stage 10 - Product Mode Vocabulary Injection
 * 
 * This mapper is EXCLUSIVELY for Product Mode.
 * It injects ONLY product-safe vocabulary.
 * NO UGC terminology allowed.
 */

import type { ProductStudioStep3Values } from '@/lib/productStudio/state';
import type { PromptOptions } from './types';

export type SceneState = ProductStudioStep3Values & {
    visualStyle?: string;
    productStateMotion?: string;
    specialEffects?: string[] | string;
    lighting?: string;
    viewpoint?: string;
    productAssets?: { id: string }[];
};

const normalizeSidePlacement = (raw?: string): 'left' | 'center' | 'right' => {
    const lower = String(raw || '').toLowerCase();
    if (lower.includes('left')) return 'left';
    if (lower.includes('right')) return 'right';
    return 'center';
};

const clampHex = (value: string | undefined, fallback: string): string => {
    const normalized = String(value || '').trim();
    return /^#[0-9a-f]{6}$/i.test(normalized) ? normalized : fallback;
};

const sanitizeProductCopy = (value: string): string => {
    const raw = String(value || '').trim();
    if (!raw) return '';
    return raw
        .replace(/\b(lifestyle|ugc|user-generated|selfie|phone|creator|person|people|human|identity|ethnicity|age|face)\b/gi, '')
        .replace(/\s+/g, ' ')
        .trim();
};

const normalizeAspectRatio = (value?: string): string => {
    const raw = String(value || '').trim();
    if (!raw) return '1:1';

    // Accept raw ratios directly (Product Studio uses these).
    const normalized = raw.replace(/\s+/g, '');
    const allowed = new Set(['1:1', '4:5', '9:16', '16:9', '3:4']);
    if (allowed.has(normalized)) return normalized;

    // Accept UI labels used by other builders.
    const labelMap: Record<string, string> = {
        '1:1 (Square)': '1:1',
        '4:5 (Portrait)': '4:5',
        '9:16 (Story)': '9:16',
        '16:9 (Landscape)': '16:9',
        '3:4 (Portrait)': '3:4'
    };
    return labelMap[raw] || '1:1';
};

const mapProductCameraDistance = (
    distance?: ProductStudioStep3Values['productCameraDistance']
): NonNullable<PromptOptions['cameraDistance']> => {
    switch (distance) {
        case 'Wide':
            return 'wide';
        case 'Tight':
            return 'close';
        case 'Macro':
            return 'macro';
        case 'Standard':
        default:
            return 'medium';
    }
};

const mapProductCameraAngle = (angle?: ProductStudioStep3Values['productCameraAngle']): string | undefined => {
    switch (angle) {
        case 'Eye level product':
            return 'camera positioned at product eye level with a neutral perspective';
        case '45 degree hero':
            return '45° hero angle, slightly above the product looking down';
        case 'Top-down flat lay':
            return 'top-down flat lay, camera directly overhead';
        case 'Low angle power':
            return 'low angle view looking slightly upward at the product';
        case 'High angle overview':
            return 'high angle overview looking down at the product';
        case 'Detail close-up':
            return 'detail close-up angle emphasizing materials and label detail';
        default:
            return undefined;
    }
};

const mapProductShotType = (
    distance?: ProductStudioStep3Values['productCameraDistance'],
    angle?: ProductStudioStep3Values['productCameraAngle']
): string | undefined => {
    if (angle === 'Top-down flat lay') {
        return 'flat lay product shot with clean spacing';
    }
    switch (distance) {
        case 'Wide':
            return 'wide product composition with generous negative space';
        case 'Standard':
            return 'standard product framing showing the full product clearly';
        case 'Tight':
            return 'tight hero close-up emphasizing label and texture';
        case 'Macro':
            return 'macro detail close-up showing fine material detail';
        default:
            return undefined;
    }
};

const mapProductFraming = (
    framing?: ProductStudioStep3Values['productFramingGuide'],
    rotationDegrees?: ProductStudioStep3Values['productCameraRotation']
): { perspective?: string; forcedSidePlacement?: 'left' | 'right' } => {
    const rotationSuffix =
        typeof rotationDegrees === 'number' && rotationDegrees > 0
            ? ` with an intentional ${rotationDegrees}° camera rotation`
            : '';

    switch (framing) {
        case 'Centered hero':
            return { perspective: `centered hero composition with clean margins${rotationSuffix}` };
        case 'Rule of thirds':
            return { perspective: `rule-of-thirds composition with intentional spacing${rotationSuffix}` };
        case 'Left aligned + negative space':
            return {
                perspective: `product aligned left with large clean negative space to the right${rotationSuffix}`,
                forcedSidePlacement: 'left'
            };
        case 'Right aligned + negative space':
            return {
                perspective: `product aligned right with large clean negative space to the left${rotationSuffix}`,
                forcedSidePlacement: 'right'
            };
        case 'Grid-ready':
            return { perspective: `grid-ready centered framing with consistent margins${rotationSuffix}` };
        default:
            return rotationSuffix ? { perspective: `intentional studio framing${rotationSuffix}` } : {};
    }
};

/**
 * Map Product Mode state to PromptOptions
 * RULES:
 * - Only inject Product vocabulary
 * - Never inject UGC terms
 * - Never reference people/faces/emotions
 */
export function mapProductModeToPromptOptions(
    sceneState: SceneState
): PromptOptions;
export function mapProductModeToPromptOptions(
    sceneState: SceneState,
    existingOptions: Partial<PromptOptions>
): PromptOptions;
export function mapProductModeToPromptOptions(
    sceneState: SceneState,
    existingOptions: Partial<PromptOptions> = {}
): PromptOptions {
    console.log('[MAP PRODUCT MODE INPUT]', sceneState);
    console.log('[PRODUCT STEP3 INPUT]', {
        sceneIntent: sceneState.sceneIntent,
        aspectRatio: sceneState.aspectRatio,
        sidePlacement: sceneState.sidePlacement,
        ecommerceBackgroundMode: sceneState.ecommerceBackgroundMode,
        ecommerceBackgroundColor: sceneState.ecommerceBackgroundColor,
        ecommerceGradientStart: sceneState.ecommerceGradientStart,
        ecommerceGradientEnd: sceneState.ecommerceGradientEnd,
        ecommerceGradientAngle: sceneState.ecommerceGradientAngle,
        productType: sceneState.productType,
        productTypeCustom: sceneState.productTypeCustom,
        handsHolding: sceneState.handsHolding,
        productCameraSystem: sceneState.productCameraSystem,
        productCameraAngle: sceneState.productCameraAngle,
        productCameraDistance: sceneState.productCameraDistance,
        productCameraRotation: sceneState.productCameraRotation,
        productFramingGuide: sceneState.productFramingGuide,
        productCreativityLevel: sceneState.productCreativityLevel,
        productCreativeTheme: sceneState.productCreativeTheme,
        productPaletteSource: sceneState.productPaletteSource,
        productPropDensity: sceneState.productPropDensity,
        productPropsSelected: sceneState.productPropsSelected
    });

    if (sceneState.ugcRealMode) {
        console.error('[INVALID STATE BLOCKED] UGC Real Mode cannot run in product mode');
        throw new Error('Invalid state: ugcRealMode in product mode');
    }
    if (sceneState.noPerson === false) {
        console.error('[INVALID STATE BLOCKED] Person cannot be enabled in product mode');
        throw new Error('Invalid state: person enabled in product mode');
    }
    if (sceneState.selfieMode && sceneState.selfieMode !== 'None') {
        console.error('[INVALID STATE BLOCKED] Selfie mode cannot run in product mode');
        throw new Error('Invalid state: selfie mode in product mode');
    }
    if (((sceneState.productAssets?.length || existingOptions.productAssets?.length || 0) > 1) && sceneState.selfieMode && sceneState.selfieMode !== 'None') {
        console.error('[INVALID STATE BLOCKED] Selfie cannot be used with multi-product');
        throw new Error('Invalid state: selfie + multi-product');
    }

    const mapped: Partial<PromptOptions> = {
        ...existingOptions
    };

    // Prevent any UGC contracts from leaking into Product prompts.
    // masterPrompt.ts appends UGC_CONTRACTS[ugcStyle] unconditionally.
    mapped.ugcStyle = 'optimized';

    const ecommerceCanvasActive = sceneState.ecommerceSidePlacementFlag === true;

    // Preserve state authority from explicit Step3 payload.
    const explicitContentStyle = String((sceneState as any).contentStyle || '').trim();
    if (explicitContentStyle) {
        mapped.contentStyle = explicitContentStyle as any;
    }
    const explicitCreationIntent = String((sceneState as any).creationIntent || '').trim();
    if (explicitCreationIntent) {
        mapped.creationIntent = explicitCreationIntent as any;
    }
    if (typeof (sceneState as any).personIncluded === 'boolean') {
        mapped.personIncluded = Boolean((sceneState as any).personIncluded);
    }
    const explicitSceneIntent = String((sceneState as any).sceneIntent || '').trim();
    if (explicitSceneIntent) {
        mapped.sceneIntent = explicitSceneIntent as any;
    }
    const productStudioInteractionRaw = String((sceneState as any).productStudioInteraction ?? '').trim();
    const productStudioInteraction =
        productStudioInteractionRaw || (sceneState.handsHolding === true ? 'holding' : 'none');
    (mapped as any).studioInteraction = productStudioInteraction || undefined;
    mapped.addHands = productStudioInteraction !== '' && productStudioInteraction !== 'none';

    // Ecommerce blank-space is optional and must be toggle-driven.
    // If disabled, Product mode should generate non-blank studio/aesthetic shots.
    if (ecommerceCanvasActive) {
        mapped.compositionMode = 'Ecommerce Blank Space';
        mapped.ecommerceBlankSpaceMode = true;
        mapped.ecommerceSidePlacementFlag = true;
        mapped.lighting =
            'neutral studio lighting with clean highlights, controlled reflections, and a minimal contact shadow; no environment context';
    } else {
        mapped.compositionMode = undefined;
        mapped.ecommerceBlankSpaceMode = false;
        mapped.ecommerceSidePlacementFlag = false;
        mapped.lighting =
            'soft studio lighting with clean highlights, controlled reflections, and gentle realistic shadows; product-only composition';
    }

    const explicitCreationMode = String((sceneState as any).creationMode || '').trim().toLowerCase();
    if (explicitCreationMode) {
        if (explicitCreationMode === 'ecommerce blank space' || explicitCreationMode === 'ecom-blank') {
            mapped.creationMode = 'ecom-blank';
        } else if (explicitCreationMode === 'aesthetic builder' || explicitCreationMode === 'aesthetic') {
            mapped.creationMode = 'aesthetic';
        } else if (explicitCreationMode === 'studio hero' || explicitCreationMode === 'studio') {
            mapped.creationMode = 'studio';
        } else if (explicitCreationMode === 'lifestyle ugc' || explicitCreationMode === 'lifestyle') {
            mapped.creationMode = 'lifestyle';
        } else if (explicitCreationMode === 'background replace' || explicitCreationMode === 'bg-replace') {
            mapped.creationMode = 'bg-replace';
        }
    }

    const resolvedWorld =
        sceneState.visualStyle !== undefined
            ? sceneState.visualStyle
            : 'controlled studio environment';
    const resolvedMotion =
        sceneState.productStateMotion !== undefined
            ? sceneState.productStateMotion
            : 'static';
    const resolvedModifiers =
        sceneState.specialEffects !== undefined
            ? (Array.isArray(sceneState.specialEffects)
                ? sceneState.specialEffects.filter(Boolean).join(', ')
                : String(sceneState.specialEffects))
            : 'none';
    const resolvedLightingModel =
        sceneState.lighting !== undefined
            ? sceneState.lighting
            : 'conversion softbox wrap';
    const resolvedComposition =
        sceneState.viewpoint !== undefined
            ? sceneState.viewpoint
            : 'hero';

    (mapped as any).studioWorld = resolvedWorld;
    (mapped as any).studioMotion = resolvedMotion;
    (mapped as any).studioModifiers = resolvedModifiers;
    (mapped as any).studioLightingModel = resolvedLightingModel;
    (mapped as any).studioCompositionModel = resolvedComposition;
    (mapped as any).studioLighting = resolvedLightingModel;
    (mapped as any).studioComposition = resolvedComposition;

    const sidePlacement = normalizeSidePlacement(sceneState.sidePlacement);
    mapped.sidePlacement = sidePlacement;
    mapped.ecommerceSidePlacement = sidePlacement;

    // Allow product camera/framing controls (product-only, pro)
    mapped.camera = 'DSLR / mirrorless camera';
    mapped.cameraType = 'DSLR / mirrorless camera';
    mapped.cameraDistance = mapProductCameraDistance(sceneState.productCameraDistance);
    mapped.cameraAngle = mapProductCameraAngle(sceneState.productCameraAngle) as any;
    mapped.cameraShot = mapProductShotType(sceneState.productCameraDistance, sceneState.productCameraAngle) as any;

    const framing = mapProductFraming(sceneState.productFramingGuide, sceneState.productCameraRotation);
    if (framing.forcedSidePlacement) {
        mapped.sidePlacement = framing.forcedSidePlacement;
        mapped.ecommerceSidePlacement = framing.forcedSidePlacement;
    }
    mapped.perspective = framing.perspective as any;

    // Background (solid or gradient) should only be injected when the Ecommerce background canvas toggle is enabled.
    if (ecommerceCanvasActive) {
        if (sceneState.ecommerceBackgroundMode === 'gradient') {
            const angle = parseInt(sceneState.ecommerceGradientAngle || '90', 10) || 90;
            mapped.bgGradient = {
                startColor: clampHex(sceneState.ecommerceGradientStart, '#f7f7f7'),
                endColor: clampHex(sceneState.ecommerceGradientEnd, '#d9d9d9'),
                angle
            };
            delete mapped.bgColor;
        } else {
            mapped.bgColor = clampHex(sceneState.ecommerceBackgroundColor, '#ffffff').toUpperCase();
            delete mapped.bgGradient;
        }
    } else {
        delete mapped.bgColor;
        delete mapped.bgGradient;
    }

    // Product classification inputs (do not change product; only contextual hints)
    (mapped as any).productType = sceneState.productType || 'Capsules';
    (mapped as any).productTypeCustom = sceneState.productTypeCustom || '';
    (mapped as any).productCreativityLevel = sceneState.productCreativityLevel || 'Off';
    (mapped as any).productCreativeTheme = sceneState.productCreativeTheme || 'Clinical Minimal';
    (mapped as any).productPaletteSource = sceneState.productPaletteSource || 'Use product label colors';
    (mapped as any).productPropDensity = sceneState.productPropDensity || 'None';
    (mapped as any).productPropsSelected = sceneState.productPropsSelected || [];

    // Creativity + styling descriptors must be explicit so they change the output deterministically.
    // Keep this product-safe (no UGC/lifestyle/selfie language).
    const creativityLevel = String(sceneState.productCreativityLevel || 'Off').trim();
    const creativeTheme = sanitizeProductCopy(String(sceneState.productCreativeTheme || '').trim());
    const propDensity = sanitizeProductCopy(String(sceneState.productPropDensity || '').trim());
    const paletteSource = sanitizeProductCopy(String(sceneState.productPaletteSource || '').trim());
    const selectedProps = (sceneState.productPropsSelected || [])
        .map(p => sanitizeProductCopy(String(p)))
        .filter(Boolean)
        .slice(0, 10);

    if (!ecommerceCanvasActive) {
        const creativityParts: string[] = [];
        if (creativityLevel && creativityLevel !== 'Off') {
            creativityParts.push(`Creativity level: ${creativityLevel}.`);
        }
        if (creativeTheme) {
            creativityParts.push(`Creative theme: ${creativeTheme}.`);
        }
        if (paletteSource) {
            creativityParts.push(`Palette: ${paletteSource}.`);
        }
        if (propDensity) {
            creativityParts.push(`Prop density: ${propDensity}.`);
        }
        if (selectedProps.length) {
            creativityParts.push(`Props: ${selectedProps.join(', ')}.`);
        }
        if (creativityParts.length) {
            mapped.compositionModeStructural = creativityParts.join(' ');
        }
    }

    // Environment is allowed ONLY when the Ecommerce background canvas is disabled.
    // This lets Product Mode place the product into a real setting (no people) using existing environment/lighting controls.
    if (ecommerceCanvasActive) {
        mapped.setting = '';
        mapped.environmentOrder = '';
        mapped.microLocation = '';
        delete (mapped as any).customEnvironment;
    } else {
        const resolvedEnvironment = (sceneState.customEnvironment || '').trim() || (sceneState.environment || '').trim();
        if (resolvedEnvironment) {
            mapped.setting = resolvedEnvironment;
        }
        const resolvedLighting = (sceneState.lightingStyle || '').trim();
        if (resolvedLighting) {
            mapped.lighting = resolvedLighting;
        }
    }

    mapped.placementStyle = undefined;
    // Ensure pro camera selection cannot be overridden by leftover UI fields.
    // `buildCamera()` prioritizes `cameraType` over `camera`, so we must clear it in Product Step 3.
    delete (mapped as any).cameraType;
    delete (mapped as any).placementCamera;
    mapped.personDetails = undefined;
    mapped.identityLock = undefined;
    mapped.personIdentity = undefined;
    mapped.gender = undefined;
    mapped.ethnicity = undefined;
    mapped.skinTone = undefined;
    mapped.hairColor = undefined;
    mapped.hairStyle = undefined;
    mapped.personPose = undefined;
    mapped.personMood = undefined;
    mapped.personAppearance = undefined;
    mapped.productInteraction = undefined;
    mapped.wardrobeStyle = undefined;
    mapped.personProps = undefined;
    mapped.microLocation = undefined;
    mapped.personExpression = undefined;
    mapped.selfieMode = undefined;
    mapped.selfieType = 'None';
    mapped.ugcRealModeActive = false;
    // Remove any raw UGC flags that downstream mappers/builders use (prevents "phone" degradation).
    delete (mapped as any).ugcRealMode;
    delete (mapped as any).ugcMode;
    mapped.ugcRealModeLayers = undefined;
    mapped.ugcCaptureStyleBase = undefined;
    mapped.ugcCameraOperator = undefined;
    mapped.ugcBodyPhonePosition = undefined;
    mapped.ugcMotionStability = undefined;
    mapped.ugcFramingImperfections = undefined;
    mapped.ugcAwkwardContext = undefined;
    mapped.ugcSelfieDominant = false;

    // ========================================================================
    // OUTPUT FORMAT (Stage 8)
    // ========================================================================

    mapped.aspectRatio = normalizeAspectRatio(sceneState.aspectRatio);

    // ========================================================================
    // VALIDATION - Block all UGC state (Stage 11)
    // ========================================================================

    // Clear any UGC contamination
    mapped.realModeActive = false;
    mapped.selfieType = 'None';
    mapped.personExpression = undefined;
    mapped.personPose = undefined;

    console.log('[PRODUCT STEP3 MAP OUT]', {
        contentStyle: mapped.contentStyle,
        creationIntent: mapped.creationIntent,
        creationMode: mapped.creationMode,
        sceneIntent: mapped.sceneIntent,
        compositionMode: mapped.compositionMode,
        ecommerceBlankSpaceMode: mapped.ecommerceBlankSpaceMode,
        sidePlacement: mapped.sidePlacement,
        bgColor: mapped.bgColor,
        bgGradient: mapped.bgGradient,
        camera: mapped.camera,
        cameraAngle: mapped.cameraAngle,
        cameraDistance: mapped.cameraDistance,
        cameraShot: mapped.cameraShot,
        perspective: mapped.perspective,
        addHands: mapped.addHands,
        studioInteraction: (mapped as any).studioInteraction,
        aspectRatio: mapped.aspectRatio
    });
    console.log('[FINAL SCENETYPE]', (mapped as any).sceneType ?? (sceneState as any).sceneType ?? 'undefined');
    console.log('[FINAL CREATIONMODE]', mapped.creationMode ?? (sceneState as any).creationMode ?? 'undefined');
    console.log('[FINAL CONTENTSTYLE]', mapped.contentStyle ?? (sceneState as any).contentStyle ?? 'undefined');

    const resolvedOptions: PromptOptions = {
        contentStyle: (mapped.contentStyle as PromptOptions['contentStyle']) || 'product',
        creationMode: (mapped.creationMode as PromptOptions['creationMode']) || 'studio',
        aspectRatio: mapped.aspectRatio || '1:1',
        camera: mapped.camera || 'DSLR / mirrorless camera',
        setting: mapped.setting || '',
        lighting: mapped.lighting || resolvedLightingModel,
        perspective: mapped.perspective || '',
        environmentOrder: mapped.environmentOrder || '',
        productPlane: mapped.productPlane || '',
        ...mapped,
    };

    console.log('[MAP PRODUCT MODE OUTPUT]', resolvedOptions);

    return resolvedOptions;
}

export function validateProductModePrompt(prompt: string): boolean {
    const forbidden = [
        'lifestyle',
        'ugc',
        'user-generated',
        'selfie',
        'phone',
        'creator',
        'person',
        'people',
        'human',
        'identity',
        'ethnicity',
        'age',
        'face'
    ];
    const lower = prompt.toLowerCase();
    const hit = forbidden.find(term => lower.includes(term));
    if (hit) {
        console.error(`[PRODUCT MODE VALIDATION FAILED] Forbidden term detected: "${hit}"`);
        return false;
    }

    return true;
}
