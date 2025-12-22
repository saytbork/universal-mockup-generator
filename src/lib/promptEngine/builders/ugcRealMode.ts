/**
 * UGC Real Mode Builder
 * Enforces authentic user-generated content rules
 * HIGHEST PRIORITY when ugcRealModeActive === true
 * 
 * HARD OVERRIDES:
 * - Human-first composition (person is main subject)
 * - Force lifestyle mode
 * - Force selfie logic when enabled
 * - Block studio/editorial vocabulary
 * - Mandatory product interaction
 */

import type { PromptOptions, PromptBuilder } from '../types';
import { buildUGCCaptureSituationText } from '../ugcCaptureSituation';

export class UGCRealModeBuilder implements PromptBuilder {
    build(options: PromptOptions): string {
        const { ugcRealModeActive, personDetails, personIncluded } = options;
        const age = personDetails?.age || 0;

        if (!ugcRealModeActive) {
            return '';
        }

        const captureLayerActive = !!options.ugcCaptureSituation;
        const captureStyleBase = String((options as any).ugcCaptureStyleBase || '');
        const wantsProppedSurfaceStyle = captureStyleBase.includes('propped-surface');
        const productInteractionSource =
            (personDetails?.productInteraction ||
                (options as any).productInteraction ||
                '') as string;
        const normalizedInteraction = productInteractionSource.toLowerCase();
        const interactionImpliesHolding = /holding|grip/.test(normalizedInteraction);
        const isAge80Plus = age >= 80;
        const isAge85Plus = age >= 85;
        let allowProppedSurface = wantsProppedSurfaceStyle && !interactionImpliesHolding && !isAge85Plus;
        if (wantsProppedSurfaceStyle && !allowProppedSurface) {
            console.warn('[UGC REAL MODE] Propped-surface capture blocked due to handheld or age rules');
        }
        const enforceHandheldOnly = !allowProppedSurface || interactionImpliesHolding || isAge85Plus;

        const applyCameraInvalidation = () => {
            const overrideTarget = options as any;
            overrideTarget.cameraShot = 'SELFIE_CLOSE';
            delete overrideTarget.cameraAngle;
            delete overrideTarget.framing;
            delete overrideTarget.perspective;
            delete overrideTarget.placementStyle;
            delete overrideTarget.placementCamera;
            delete overrideTarget.proLens;
            delete overrideTarget.proLightingRig;
            delete overrideTarget.proPostTreatment;
            delete overrideTarget.compositionMode;
            delete overrideTarget.personPose;
            delete overrideTarget.pose;
            delete overrideTarget.mediumShot;
        };

        if (ugcRealModeActive && captureLayerActive) {
            applyCameraInvalidation();
        }

        console.log('[UGC REAL MODE] Building with hard overrides');
        const parts: string[] = [];

        // ========================================================================
        // MANDATORY COMPOSITION OVERRIDE - This MUST come first
        // ========================================================================
        parts.push(`
UGC REAL MODE OVERRIDE - HIGHEST PRIORITY:
This image must follow authentic user-generated content rules.
Prioritize realism over aesthetics.
Avoid editorial, hero, luxury, studio, or polished compositions.
Natural human imperfections are REQUIRED.
Smartphone-quality aesthetic with computational photography characteristics.
        `.trim().replace(/\s+/g, ' '));

        // ========================================================================
        // HUMAN-FIRST COMPOSITION (NOT NEGOTIABLE)
        // ========================================================================
        if (personIncluded) {
            const compositionLines = [
                'HUMAN-FIRST COMPOSITION (MANDATORY):',
                'The person is the main subject of the image.',
                'Person takes visual priority over product.'
            ];

            if (allowProppedSurface) {
                compositionLines.push(
                    'Product may rest on a real household surface (counter, vanity, desk) with organic supports.',
                    'Hands can hover nearby or adjust props but do NOT have to grip the product.',
                    'Surface contact must look casual, slightly crooked, and never like a studio prop display.'
                );
            } else {
                compositionLines.push(
                    'Person must interact directly with the product using a relaxed, natural grip.',
                    'NO table placement. NO surface placement. NO floating product.'
                );
            }

            compositionLines.push(
                'NO hero product framing. NO editorial product showcase.',
                'Frame the scene as if captured by the person or a friend with a smartphone.'
            );

            if (enforceHandheldOnly) {
                compositionLines.push(
                    'Capture stays handheld and slightly imperfect—no tripods, no propped phones, micro shake is welcome.'
                );
            }

            parts.push(compositionLines.join(' ').replace(/\s+/g, ' ').trim());
        }

        // ========================================================================
        // AGE REALISM OVERRIDE for 70+
        // ========================================================================
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
        if (isAge80Plus) {
            parts.push(`
AGE 80+ LIGHTING REALISM:
No graduated or balanced illumination. Lighting must remain uneven, mixed ambient light with imperfect falloff. Avoid wording that implies controlled, aesthetic, or studio lighting.
            `.trim().replace(/\s+/g, ' '));
        }
        if (isAge85Plus) {
            parts.push(`
AGE 85+ CAPTURE OVERRIDE:
Only handheld capture is allowed. Ban propped-surface staging and lean into slightly off-center framing to avoid symmetry.
            `.trim().replace(/\s+/g, ' '));
        }

        // ========================================================================
        // SELFIE POV - Physical camera position
        // ========================================================================
        if (personDetails?.selfieType && personDetails.selfieType !== 'None') {
            parts.push(`
CAMERA POV: ${personDetails.selfieType}
            `.trim().replace(/\s+/g, ' '));
        }

        // ========================================================================
        // HERO PERSONA - Semantic character description
        // ========================================================================
        if (options.heroPersona || personDetails?.heroPersona) {
            const persona = options.heroPersona || personDetails?.heroPersona;
            parts.push(`
CREATOR PERSONA: ${persona}
            `.trim().replace(/\s+/g, ' '));
        }

        // ========================================================================
        // BLOCKED VOCABULARY - These terms must NOT appear
        // ========================================================================
        parts.push(`
BLOCKED VOCABULARY (DO NOT USE):
- "hero shot", "hero framing", "product hero"
- "editorial", "editorial lighting", "editorial composition"
- "studio", "studio lighting", "controlled studio"
- "commercial", "advertising", "campaign"
- "luxury", "premium", "high-end" (in composition context)
- "perfectly composed", "precise arrangement"
        `.trim().replace(/\s+/g, ' '));

        // ========================================================================
        // REQUIRED VOCABULARY - These concepts MUST be present
        // ========================================================================
        parts.push(`
REQUIRED UGC CHARACTERISTICS:
- Authentic, candid, real-world feeling
- Slight imperfections in framing or lighting
- Natural hand positioning (not posed)
- Smartphone-like depth of field
- Real environment (not styled set)
        `.trim().replace(/\s+/g, ' '));

        if (options.ugcCaptureSituation) {
            parts.push(buildUGCCaptureSituationText(options.ugcCaptureSituation));
            const handText = `
The phone is held in one hand, completely outside the frame.
Only one hand may be visible in the image.
The visible hand is the free hand and holds the product naturally.
The hand holding the phone is never visible.
`.trim();
            const proppedSurfaceGuidance = `
Surface placement: the product rests on a real household surface with improvised props. The phone stays handheld just outside the frame. Hands may steady props but should not grip the product unless necessary.
`.trim();
            parts.push(allowProppedSurface ? proppedSurfaceGuidance : handText);
        } else {
            console.warn('[UGC CAPTURE SITUATION] Missing selection, skipping injection');
        }

        if (captureLayerActive) {
            parts.push(
                'All camera angle, shot type, framing, and composition rules are invalid. The capture situation fully defines the geometry of the image.'
            );
        }

        const handheldConstraints = `
This image is a real smartphone selfie.
The phone is held at arm’s length.
The arm holding the phone must never be visible.
The hand holding the product may be visible with a small portion of forearm.
Only one arm may be partially visible, and only to support the product.
`.trim();
        const proppedSurfaceConstraints = `
This image is a real smartphone capture. The phone stays handheld outside the frame while the product is supported by a lived-in surface. Show imperfect contact, slight tilt, and nearby objects that prove an improvised prop stack. Hands may appear to adjust or steady items but are not required to grip the product.
`.trim();
        parts.push(allowProppedSurface ? proppedSurfaceConstraints : handheldConstraints);

        const humanText = `
The person must look like a real human captured by a smartphone.
No mannequin, doll, CGI, avatar, or synthetic appearance.
Natural skin texture is required, including visible pores, minor blemishes, uneven tone, and natural facial asymmetry.
This must not look like a render, stock photo, studio portrait, or AI-generated human.
`.trim();
        parts.push(humanText);

        const walkingText = `
Walking, handheld motion is a selfie perspective while walking.
Slight camera instability and imperfect crop.
Smartphone selfie.
Arm holding the phone remains completely outside the frame.
`.trim();
        parts.push(walkingText);

        const result = parts.filter(Boolean).join(' ').trim();
        console.log('[UGC REAL MODE OUTPUT]', result.substring(0, 200) + '...');
        return result;
    }
}
