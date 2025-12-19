import type { PromptOptions } from '../types';
import { ProductBuilder } from './product';
import { ClothingBuilder } from './clothing';
import { buildCamera } from './camera';
import { buildEnvironment } from './environment';
import { buildLighting } from './lighting';
import { FormulationStoryBuilder } from './formulationStory';

export interface SceneNarrativeSections {
    creationIntent: string;
    creationMode: string;
    ugcRealMode: string;
    formulationStory?: string;
    ecommerceBuilder?: string;
    cameraFraming: string;
    environmentLightingMood: string;
    identity?: string;
}

const creationModeCopy: Record<string, string> = {
    lifestyle: 'Lifestyle environment with human presence. Natural interaction with the product.',
    studio: 'Studio-style hero shot. Controlled lighting and composition.',
    aesthetic: 'Aesthetic-focused composition. Design-forward styling.',
    'bg-replace': 'Background replaced while preserving subject realism.',
    'ecom-blank': 'Ecommerce blank-space composition. Designed for PDP and paid ads.'
};

const sidePlacementCopy: Record<string, string> = {
    left: 'Product positioned on the left side of the frame.',
    center: 'Product positioned near the center of the frame.',
    right: 'Product positioned on the right side of the frame.'
};

export class SceneNarrativeBuilder {
    private productBuilder = new ProductBuilder();
    private clothingBuilder = new ClothingBuilder();

    build(
        options: PromptOptions,
        extras: { identity?: string; constraints?: string } = {}
    ): SceneNarrativeSections {
        const creationIntent = this.buildCreationIntent(options);
        const creationMode = this.buildCreationMode(options);
        const ugcRealMode = this.buildUgcRealMode(options);
        const formulationStory = this.buildFormulationStory(options);
        const ecommerceBuilder = this.buildEcommerceBuilder(options);
        const cameraFraming = this.buildCameraFraming(options, extras.constraints);
        const environmentLightingMood = this.buildEnvironmentLightingMood(options);

        return {
            creationIntent,
            creationMode,
            ugcRealMode,
            formulationStory,
            ecommerceBuilder,
            cameraFraming,
            environmentLightingMood,
            identity: extras.identity
        };
    }

    private buildCreationIntent(options: PromptOptions): string {
        const clothingCopy = this.clothingBuilder.build(options);
        const productCopy = this.productBuilder.build(options);
        const parts: string[] = [];

        switch (options.creationIntent) {
            case 'product':
                parts.push(
                    'Product-focused commercial image.',
                    'Clean composition designed for ecommerce and ads.',
                    'No creator narrative.'
                );
                break;
            case 'brand':
                parts.push(
                    'Expert-led product narrative.',
                    'Scientific credibility and formulation trust.',
                    'The expert remains the primary subject.'
                );
                break;
            default:
                parts.push(
                    'UGC-style lifestyle scene.',
                    'Authentic, casual, real-world feeling.',
                    'Natural imperfections, candid composition.',
                    'Allowed creator presence.'
                );
        }

        if (clothingCopy) {
            parts.push(clothingCopy);
        }

        if (productCopy) {
            parts.push(productCopy);
        }

        return parts.filter(Boolean).join(' ');
    }

    private buildCreationMode(options: PromptOptions): string {
        if (options.sceneIntent === 'environment') {
            return 'Environment-first lifestyle composition with the product grounded in a natural space, avoiding hero or studio framing.';
        }
        const mode = options.creationMode;
        const copy = creationModeCopy[mode] || creationModeCopy.lifestyle;
        return copy;
    }

    private buildUgcRealMode(options: PromptOptions): string {
        if (options.realModeActive) {
            return 'UGC Real Mode active. Phone-like framing. Subtle real-world imperfections.';
        }

        return 'UGC Real Mode disabled. No selfie perspective. No creator narrative.';
    }

    private buildFormulationStory(options: PromptOptions): string | undefined {
        // FORMULATION STORY IS OPTIONAL - if disabled, skip entirely
        if (!options.formulationExpertEnabled || options.personIncluded === false) {
            return undefined;
        }

        // Use the properly imported FormulationStoryBuilder
        // Injects HUMAN TRAITS ONLY (no titles, no narrative, no UGC language)
        try {
            const formulationBuilder = new FormulationStoryBuilder();
            return formulationBuilder.build(options);
        } catch (error) {
            console.error('[CANONICAL SCENE] FormulationStoryBuilder error:', error);
            return undefined;
        }
    }

    private buildEcommerceBuilder(options: PromptOptions): string | undefined {
        if (options.sceneIntent === 'environment') {
            return undefined;
        }
        const isEcommerceIntent = options.creationIntent === 'product' || options.creationIntent === 'brand';
        const isEcomBlank = options.creationMode === 'ecom-blank';

        if (!isEcommerceIntent && !isEcomBlank) {
            return undefined;
        }

        const composition = options.compositionMode
            ? `Blank-space layout optimized for text and UI overlays with ${options.compositionMode}.`
            : 'Blank-space layout optimized for text and UI overlays.';
        const placement =
            options.sidePlacement && sidePlacementCopy[options.sidePlacement]
                ? sidePlacementCopy[options.sidePlacement]
                : 'Product positioned near the center of the frame.';
        const bgColor = options.bgColor ? `Clean solid background color ${options.bgColor}.` : '';

        return [composition, placement, bgColor].filter(Boolean).join(' ');
    }

    private buildCameraFraming(options: PromptOptions, constraints?: string): string {
        const cameraText = buildCamera({
            camera: options.camera,
            cameraType: (options as any).cameraType,
            placementCamera: (options as any).placementCamera
        });
        const parts: string[] = [];

        if (cameraText) {
            parts.push(`Camera: ${cameraText}.`);
        }
        if (options.cameraAngle) {
            parts.push(`Camera angle: ${options.cameraAngle}.`);
        }
        if (options.perspective) {
            parts.push(`Framing: ${options.perspective}.`);
        }
        if (options.cameraShot) {
            parts.push(`Shot type: ${options.cameraShot}.`);
        }
        if (constraints) {
            parts.push(constraints);
        }

        if (options.contentStyle !== 'ugc' && !options.ugcRealModeActive) {
            parts.push(
                'This scene is captured using professional-grade camera equipment only, such as DSLR or mirrorless cameras, cinema cameras, or medium format systems. Framing and shot selection are intentional and precise, with a clearly defined shot type and camera angle. The camera is fully stabilized, either on a tripod or controlled rig, with smooth, deliberate movement if any. Lighting is studio-grade or professionally controlled, producing clean exposure, accurate colors, and natural depth. The image must not resemble user-generated content in any way. Exclude all casual, handheld, selfie-based, phone-captured, webcam-style, or amateur artifacts.'
            );
        }

        return parts.join(' ');
    }

    private buildEnvironmentLightingMood(options: PromptOptions): string {
        const isEcommerceBlankSpaceMode =
            options.ecommerceBlankSpaceMode ||
            options.sceneIntent === 'ecommerce' ||
            options.creationMode === 'ecom-blank';

        if (isEcommerceBlankSpaceMode) {
            const text =
                'Pure white background (#FFFFFF) with extremely neutral studio lighting, flat even illumination, and a minimal contact shadow straight under the product. No environment, no lifestyle storytelling.';
            console.log('[SCENE NARRATIVE] Ecommerce Blank Space enforced lighting:', text);
            return text;
        }

        const environmentText = buildEnvironment({
            environmentOrder: options.environmentOrder,
            sceneEnvironment: (options as any).sceneEnvironment || options.setting,
            customEnvironment: (options as any).customEnvironment
        });
        const lightingText = buildLighting({
            lighting: options.lighting,
            sceneLighting: (options as any).sceneLighting
        });

        // Inject structural rules from mapper
        const creationModeStructural = (options as any).creationModeStructural || '';
        const compositionModeStructural = (options as any).compositionModeStructural || '';
        const cameraDeviceSemantic = (options as any).cameraDeviceSemantic || '';

        const narrativeParts = [
            creationModeStructural ? `Creation: ${creationModeStructural}.` : '',
            compositionModeStructural ? `Composition: ${compositionModeStructural}.` : '',
            cameraDeviceSemantic ? `Camera: ${cameraDeviceSemantic}.` : '',
            environmentText ? `Environment: ${environmentText}.` : '',
            lightingText ? `Lighting: ${lightingText}.` : ''
        ].filter(Boolean);

        if (options.contentStyle !== 'ugc' && !options.ugcRealModeActive) {
            narrativeParts.push(
                'Lighting is professionally designed and intentionally controlled. The scene uses studio-grade or well-managed natural lighting with balanced exposure, consistent color temperature, and soft, dimensional shadows. Illumination enhances clarity, depth, and material detail without harsh overhead light, uneven shadows, or mixed lighting sources. Exclude all phone-based lighting, on-camera flash, bathroom or ceiling lights, low-quality ambient light, or any casual, uncontrolled illumination commonly associated with user-generated content.'
            );
        }

        console.log('[SCENE NARRATIVE] Environment/Lighting/Mood:', narrativeParts.join(' ').substring(0, 200) + '...');
        return narrativeParts.join(' ');
    }
}
