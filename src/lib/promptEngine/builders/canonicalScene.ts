import type { PromptOptions } from '../types';
import { ProductBuilder } from './product';
import { ClothingBuilder } from './clothing';
import { buildCamera } from './camera';
import { buildEnvironment } from './environment';
import { buildLighting } from './lighting';

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
        if (!options.formulationExpertEnabled) {
            return undefined;
        }

        const name = options.formulationExpertName || 'the expert';
        const role = options.formulationExpertRole || 'formulation specialist';
        const labStyle = options.formulationLabStyle || 'realistic lab environment';

        return [
            'Formulation story active.',
            'Expert-led narrative focused on trust and credibility.',
            `Featuring ${name}, a ${role}, in ${labStyle}.`,
            'The expert appears human, photoreal, and imperfect.',
            'UGC Real Mode disabled.',
            'Expert remains the primary subject.'
        ].join(' ');
    }

    private buildEcommerceBuilder(options: PromptOptions): string | undefined {
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

        return parts.join(' ');
    }

    private buildEnvironmentLightingMood(options: PromptOptions): string {
        const environmentText = buildEnvironment({
            environmentOrder: options.environmentOrder,
            sceneEnvironment: (options as any).sceneEnvironment || options.setting
        });
        const lightingText = buildLighting({
            lighting: options.lighting,
            sceneLighting: (options as any).sceneLighting
        });
        const mood = options.personMood ? `Mood: ${options.personMood}.` : '';
        const parts = [
            environmentText ? `Environment: ${environmentText}.` : '',
            lightingText ? `Lighting: ${lightingText}.` : '',
            mood
        ].filter(Boolean);

        return parts.join(' ');
    }
}
