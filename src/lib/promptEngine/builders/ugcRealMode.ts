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
        } else {
            console.warn('[UGC CAPTURE SITUATION] Missing selection, skipping injection');
        }

        const result = parts.filter(Boolean).join(' ').trim();
        console.log('[UGC REAL MODE OUTPUT]', result.substring(0, 200) + '...');
        return result;
    }
}
