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
    left: 'Product anchored on the left side of the frame, leaving the right side open for copy.',
    center: 'Product centered with balanced copy space on both sides.',
    right: 'Product anchored on the right side of the frame, leaving the left side open for copy.'
};

const INDOOR_ENVIRONMENTS = new Set([
    'Kitchen',
    'Living Room',
    'Bedroom',
    'Bathroom',
    'Workspace',
    'Hallway',
    'Home Gym',
    'Balcony / Indoor Terrace'
]);

const OUTDOOR_ENVIRONMENTS = new Set([
    'Urban Exterior',
    'Natural Exterior',
    'Parking Lot',
    'Backyard / Patio',
    'Street Corner'
]);

const formatEnvironmentPhrase = (environmentText?: string): string => {
    if (!environmentText?.trim()) {
        return '';
    }
    const normalized = environmentText.trim();
    const lower = normalized.toLowerCase();
    if (INDOOR_ENVIRONMENTS.has(normalized)) {
        return `inside a ${lower}`;
    }
    if (OUTDOOR_ENVIRONMENTS.has(normalized)) {
        return `outdoors on a ${lower}`;
    }
    return `in ${lower}`;
};

const HUMAN_REALISM_GUARD =
    'The person looks like a real human, candid and imperfect, with natural skin texture, subtle asymmetry, and a lived-in environment. Nothing looks 3D, CGI, rendered, or studio-polished.';

const shouldApplyHumanRealismGuard = (options: PromptOptions): boolean => {
    const isNonUGC = !options.ugcRealModeActive && options.contentStyle !== 'ugc';
    return isNonUGC && (options.creationMode === 'lifestyle' || options.formulationExpertEnabled);
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
            return [
                'UGC Real Mode active. Phone-like framing. Subtle real-world imperfections.',
                'This is raw, real user-generated content. Do not correct framing, lighting, posture, or composition. Allow awkward angles, uneven headroom, off-center subjects, partial cropping, and accidental framing. Lighting may be harsh, dim, mixed, or unbalanced, including shadows or color casts. Facial expressions should feel natural, tired, distracted, or mid-moment rather than posed or aspirational. The product may be held awkwardly, partially obscured, tilted, or off-axis. Minor motion blur, handheld shake, and casual instability are acceptable. Imperfections are intentional and must not be fixed. The final image should feel spontaneous, unplanned, and slightly broken, like a real moment captured without aesthetic intent.'
            ].join(' ');
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
        if (
            options.sceneIntent === 'environment' ||
            options.ugcRealModeActive ||
            !options.ecommerceSidePlacementFlag
        ) {
            return undefined;
        }

        const placement =
            options.ecommerceSidePlacementDescriptor ||
            (options.sidePlacement && sidePlacementCopy[options.sidePlacement]) ||
            'Product positioned near the center of the frame.';
        const copySpace =
            options.sidePlacement === 'center'
                ? 'Maintain even negative space on both sides so copy can wrap naturally.'
                : options.sidePlacement
                ? `Reserve large, clean negative space on the ${
                      options.sidePlacement === 'left' ? 'right' : 'left'
                  } side for text overlays.`
                : '';

        return [placement, copySpace].filter(Boolean).join(' ');
    }

    private buildCameraFraming(options: PromptOptions, constraints?: string): string {
        const cameraText = buildCamera({
            camera: options.camera,
            cameraType: (options as any).cameraType,
            placementCamera: (options as any).placementCamera
        });
        const parts: string[] = [];
        const suppressCameraDescriptors = !!options.ugcRealModeActive;

        if (cameraText) {
            parts.push(`Camera: ${cameraText}.`);
        }
        if (!suppressCameraDescriptors && options.cameraAngle) {
            parts.push(`Camera angle: ${options.cameraAngle}.`);
        }
        if (!suppressCameraDescriptors && options.perspective) {
            parts.push(`Framing: ${options.perspective}.`);
        }
        if (!suppressCameraDescriptors && options.cameraShot) {
            parts.push(`Shot type: ${options.cameraShot}.`);
        }
        if (constraints) {
            parts.push(constraints);
        }

        if (options.contentStyle !== 'ugc' && !options.ugcRealModeActive) {
            parts.push(
                'This scene is captured using professional-grade camera equipment only, such as DSLR or mirrorless cameras, cinema cameras, or medium format systems. Framing and shot selection are intentional and precise, with a clearly defined shot type and camera angle. The camera is fully stabilized, either on a tripod or controlled rig, with smooth, deliberate movement if any. Lighting is studio-grade or professionally controlled, producing clean exposure, accurate colors, and natural depth. The image must not resemble user-generated content in any way. Exclude all casual, handheld, selfie-based, phone-captured, webcam-style, or amateur artifacts.'
            );
            parts.push(
                'Camera movement, if present, is intentional, minimal, and professionally executed. The camera remains fully stabilized using tripods, sliders, gimbals, or controlled rigs, with smooth and deliberate motion only when it serves the scene. Exclude all handheld shake, walking motion, body-mounted movement, phone wobble, accidental drift, or jitter commonly associated with user-generated content. The scene must feel composed, steady, and editorial at all times.'
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
            sceneLighting: (options as any).sceneLighting,
            personDetails: options.personDetails,
            ugcRealMode: options.ugcRealModeActive
        });

        // Inject structural rules from mapper
        const creationModeStructural = (options as any).creationModeStructural || '';
        const compositionModeStructural = (options as any).compositionModeStructural || '';
        const cameraDeviceSemantic = (options as any).cameraDeviceSemantic || '';

        const environmentPhrase = formatEnvironmentPhrase(environmentText);
        const narrativeParts = [
            creationModeStructural ? `Creation: ${creationModeStructural}.` : '',
            compositionModeStructural ? `Composition: ${compositionModeStructural}.` : '',
            cameraDeviceSemantic ? `Camera: ${cameraDeviceSemantic}.` : '',
            environmentPhrase ? `Environment: ${environmentPhrase}.` : '',
            options.sceneOrderChaosDescriptor ? `Scene order: ${options.sceneOrderChaosDescriptor}.` : '',
            lightingText ? `Lighting: ${lightingText}.` : ''
        ].filter(Boolean);

        const ugcEnvironmentDescriptor = (options as any).sceneEnvironmentDescriptor;
        if (options.ugcRealModeActive && ugcEnvironmentDescriptor) {
            narrativeParts.push(ugcEnvironmentDescriptor);
        }

        if (options.elderlyRealismGuardActive) {
            const descriptor =
                options.elderlyRealismDescriptor?.trim() ||
                'Elderly realism guard: advanced age must remain visually dominant with natural skin texture, posture, and lived-in cues.';
            narrativeParts.push(descriptor);
        }

        if (options.contentStyle !== 'ugc' && !options.ugcRealModeActive) {
            narrativeParts.push(
                'The environment is intentionally selected and professionally appropriate. Scenes take place in clean, controlled, and visually coherent settings suitable for editorial, lifestyle, or ecommerce use, such as studios, curated interiors, or well-composed outdoor locations. The environment must feel deliberate and brand-safe, with no association to casual personal spaces or accidental capture contexts. Exclude all user-generated environments or situations, including bedrooms, bathrooms, car interiors, mirrors, beds, couches, or any setting that implies a selfie, phone capture, or informal personal moment. The environment should support a polished, professional narrative without human capture artifacts.'
            );
        }


        if (options.contentStyle !== 'ugc' && !options.ugcRealModeActive) {
            narrativeParts.push(
                'Lighting is professionally designed and intentionally controlled. The scene uses studio-grade or well-managed natural lighting with balanced exposure, consistent color temperature, and soft, dimensional shadows. Illumination enhances clarity, depth, and material detail without harsh overhead light, uneven shadows, or mixed lighting sources. Exclude all phone-based lighting, on-camera flash, bathroom or ceiling lights, low-quality ambient light, or any casual, uncontrolled illumination commonly associated with user-generated content.'
            );
        }

        console.log('[SCENE NARRATIVE] Environment/Lighting/Mood:', narrativeParts.join(' ').substring(0, 200) + '...');
        const shouldInjectLifestyleRealism =
            !options.ugcRealModeActive &&
            options.contentStyle !== 'ugc' &&
            options.creationMode === 'lifestyle';

        if (shouldInjectLifestyleRealism) {
            narrativeParts.push(
                'Lifestyle Realism Enforcement',
                'This is a real-life lifestyle photograph, not user-generated content.',
                'The scene must feel real, human, and intentionally composed.',
                'Lighting is natural and believable, clean and balanced, not studio-perfect.',
                'Human skin shows subtle natural variation and soft texture, no smoothing, no plastic or CGI appearance.',
                'Posture and hand positioning include slight natural imperfection, avoid symmetry or mannequin-like alignment.',
                'Facial expression is relaxed and natural, not posed or model-like.',
                'The product is held naturally as part of everyday life, not centered or hero-framed.',
                'Camera capture is intentional and stable, not handheld, not selfie-based.',
                'Avoid render look, avoid artificial perfection, avoid hyper-polished surfaces.'
            );
        }

        if (options.contentStyle !== 'ugc' && !options.ugcRealModeActive) {
            narrativeParts.push(
                'Final quality check. The scene must present a fully professional, editorial-grade result. If any conflicting cues appear, prioritize professional camera equipment, controlled lighting, stabilized motion, and deliberate environments. Suppress or override any residual casual, handheld, selfie-based, phone-captured, webcam-like, or user-generated signals. The final image should be brand-safe, visually consistent, and suitable for commercial or editorial use.'
            );
        }

        return narrativeParts.join(' ');
    }
}
