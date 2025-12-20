/**
 * UGC Real Mode Builder
 * Enforces authentic user-generated content rules
 * HIGHEST PRIORITY when ugcRealModeActive === true
 *
 * HARD OVERRIDES:
 * - Human-first composition (person is main subject)
 * - Force lifestyle mode
 * - Block studio/editorial vocabulary
 * - Mandatory product interaction
 */

import type { PromptOptions, PromptBuilder } from '../types';

const ECOM_SIDE_TEXT: Record<string, string> = {
    left: 'Product anchored along the left edge, leaving intentional copy space to the right.',
    center: 'Product centered with equal copy space on both sides.',
    right: 'Product anchored along the right edge, leaving intentional copy space to the left.'
};

export class UGCRealModeBuilder implements PromptBuilder {
    private injectLayer(parts: string[], label: string, entries?: string[]) {
        if (!entries || entries.length === 0) return;
        entries.forEach(entry => {
            const trimmed = entry?.trim();
            if (trimmed) {
                parts.push(`${label}: ${trimmed}`);
            }
        });
    }

    build(options: PromptOptions): string {
        const { ugcRealModeActive, personDetails, personIncluded } = options;

        if (!ugcRealModeActive) {
            return '';
        }

        const overrideTarget = options as any;
        overrideTarget.cameraShot = 'SELFIE_CLOSE';
        delete overrideTarget.perspective;
        delete overrideTarget.personPose;
        delete overrideTarget.pose;
        delete overrideTarget.mediumShot;
        console.log('[UGC REAL MODE] Building with layered overrides');

        const parts: string[] = [];

        parts.push(`
UGC REAL MODE OVERRIDE - HIGHEST PRIORITY:
This image must follow authentic user-generated content rules.
Prioritize realism over aesthetics.
Avoid editorial, hero, luxury, studio, or polished compositions.
Natural human imperfections are REQUIRED.
Smartphone-quality aesthetic with computational photography characteristics.
        `.trim().replace(/\s+/g, ' '));

        if (personIncluded) {
            parts.push(`
HUMAN-FIRST COMPOSITION (MANDATORY):
The person is the main subject of the image.
Person takes visual priority over product.
Person MUST be holding the product with their hand - natural grip, relaxed fingers.
NO table placement. NO surface placement. NO floating product.
NO hero product framing. NO editorial product showcase.
Frame the scene as if captured by the person or a friend with a smartphone.
            `.trim().replace(/\s+/g, ' '));
        }

        const age = personDetails?.age || 0;
        if (age >= 70) {
            parts.push(`
AGE REALISM OVERRIDE (70+):
The subject's advanced age of ${age} must remain visually dominant even in casual UGC style.
Do NOT beautify, rejuvenate, or smooth skin.
Do NOT use youthful proportions or middle-aged features.
Age-appropriate skin texture, posture, and presence REQUIRED.
Smartphone camera characteristics must adapt to the age, not the opposite.
            `.trim().replace(/\s+/g, ' '));
        }

        if (options.heroPersona || personDetails?.heroPersona) {
            const persona = options.heroPersona || personDetails?.heroPersona;
            parts.push(`
CREATOR PERSONA: ${persona}
            `.trim().replace(/\s+/g, ' '));
        }

        parts.push(`
BLOCKED VOCABULARY (DO NOT USE):
- "hero shot", "hero framing", "product hero"
- "editorial", "editorial lighting", "editorial composition"
- "studio", "studio lighting", "controlled studio"
- "commercial", "advertising", "campaign"
- "luxury", "premium", "high-end" (in composition context)
- "perfectly composed", "precise arrangement"
        `.trim().replace(/\s+/g, ' '));

        parts.push(`
REQUIRED UGC CHARACTERISTICS:
- Authentic, candid, real-world feeling
- Slight imperfections in framing or lighting
- Natural hand positioning (not posed)
- Smartphone-like depth of field
- Real environment (not styled set)
        `.trim().replace(/\s+/g, ' '));

        if (options.sceneOrderChaosDescriptor) {
            parts.push(`Scene order: ${options.sceneOrderChaosDescriptor}.`);
        }

        if (options.ecommerceSidePlacementFlag) {
            const placementCopy =
                options.ecommerceSidePlacementDescriptor ||
                ECOM_SIDE_TEXT[options.ecommerceSidePlacement || ''] ||
                (options.sidePlacement ? `Product placed to the ${options.sidePlacement} side.` : '');
            if (placementCopy) {
                parts.push(`Ecommerce placement: ${placementCopy}`);
            }
        }

        const layers = options.ugcRealModeLayers ?? {
            captureBase: options.ugcCaptureStyleBase,
            cameraOperator: options.ugcCameraOperator,
            bodyPhonePosition: options.ugcBodyPhonePosition,
            motionStability: options.ugcMotionStability,
            framingImperfections: options.ugcFramingImperfections,
            awkwardContext: options.ugcAwkwardContext
        };

        this.injectLayer(parts, 'UGC capture style', layers.captureBase);
        this.injectLayer(parts, 'Camera & operator', layers.cameraOperator);
        this.injectLayer(parts, 'Body + phone position', layers.bodyPhonePosition);
        this.injectLayer(parts, 'Motion & stability', layers.motionStability);
        this.injectLayer(parts, 'Framing imperfections', layers.framingImperfections);
        this.injectLayer(parts, 'Awkward context', layers.awkwardContext);

        parts.push(
            'All camera angle, shot type, framing, and composition rules are invalid. The selected capture layers fully define the geometry of the image.'
        );

        const constraintsText = `
This image is a real smartphone capture.
The phone is held at arm’s length.
The arm holding the phone must never be visible.
The hand holding the product may be visible with a small portion of forearm.
Only one arm may be partially visible, and only to support the product.
`.trim();
        parts.push(constraintsText);

        const humanText = `
The person must look like a real human captured by a smartphone.
No mannequin, doll, CGI, avatar, or synthetic appearance.
Natural skin texture is required, soft and even with minimal pore emphasis, gentle tonal variation, and honest asymmetry.
This must not look like a render, stock photo, studio portrait, or AI-generated human.
`.trim();
        parts.push(humanText);

        const humanStateText = `
UGC HUMAN STATE:
The face shows real fatigue and lived-in details such as subtle under-eye bags, soft eye shadows, and natural expression lines around the eyes and mouth.
Expressions feel tired, distracted, or slightly drained instead of posed.
Do NOT exaggerate pores, harsh texture, or macro-style skin detail—keep the skin continuous and smartphone-smooth while the fatigue sells the realism.
        `.trim().replace(/\s+/g, ' ');
        parts.push(humanStateText);

        const smartphoneFailureText = `
SMARTPHONE FAILURE CHARACTERISTICS:
Slight softness from low-resolution capture, minor focus bleed from autofocus hunting, and uneven or mixed lighting are expected.
Framing may be off-center or slightly crooked, with imperfect headroom and in-the-moment composition.
These optical flaws must replace any attempt to add heavy skin texture or polished studio control.
        `.trim().replace(/\s+/g, ' ');
        parts.push(smartphoneFailureText);

        const walkingText = `
Walking, handheld motion is a selfie perspective while walking.
Slight camera instability and imperfect crop.
Smartphone capture with the arm holding the phone remaining completely outside the frame.
`.trim();
        parts.push(walkingText);

        if (options.ugcRealModeActive) {
            const prompt = options as any;
            prompt.cameraShot = 'SELFIE_CLOSE';
            delete prompt.cameraAngle;
            delete prompt.framing;
            delete prompt.perspective;
            delete prompt.placementStyle;
            delete prompt.placementCamera;
            delete prompt.proLens;
            delete prompt.proLightingRig;
            delete prompt.proPostTreatment;
            delete prompt.compositionMode;
        }

        const result = parts.filter(Boolean).join(' ').trim();
        console.log('[UGC REAL MODE OUTPUT]', result.substring(0, 200) + '...');
        return result;
    }
}
