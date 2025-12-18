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

        if (!ugcRealModeActive) {
            return '';
        }

        if (ugcRealModeActive) {
            const overrideTarget = options as any;
            overrideTarget.cameraShot = 'SELFIE_CLOSE';
            delete overrideTarget.perspective;
            delete overrideTarget.personPose;
            delete overrideTarget.pose;
            delete overrideTarget.mediumShot;
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

        // ========================================================================
        // AGE REALISM OVERRIDE for 70+
        // ========================================================================
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
            parts.push(handText);
        } else {
            console.warn('[UGC CAPTURE SITUATION] Missing selection, skipping injection');
        }

        parts.push(
            'All camera angle, shot type, framing, and composition rules are invalid. The capture situation fully defines the geometry of the image.'
        );

        const constraintsText = `
This image is a real smartphone selfie.
The phone is held at arm’s length.
The arm holding the phone must never be visible.
The hand holding the product may be visible with a small portion of forearm.
Only one arm may be partially visible, and only to support the product.
`.trim();
        parts.push(constraintsText);

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

        if (options.ugcRealModeActive) {
            const prompt = options as any;
            prompt.cameraShot = 'SELFIE_CLOSE';
            // HARD OVERRIDES — UGC MUST KILL COMPOSITION
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
