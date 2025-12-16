/**
 * UGC Real Mode Builder
 * Enforces authentic user-generated content rules
 * HIGHEST PRIORITY when ugcRealModeActive === true
 */

import type { PromptOptions, PromptBuilder } from '../types';

export class UGCRealModeBuilder implements PromptBuilder {
    build(options: PromptOptions): string {
        const { ugcRealModeActive, personDetails } = options;

        if (!ugcRealModeActive) {
            return '';
        }

        const parts: string[] = [];

        // MANDATORY OVERRIDE - This MUST come first
        parts.push(`
This image MUST follow authentic user-generated content rules.
Prioritize realism over aesthetics.
Avoid editorial, hero, luxury, studio, or polished compositions.
Natural human imperfections are REQUIRED.
        `.trim().replace(/\s+/g, ' '));

        // UGC COMPOSITION OVERRIDE
        parts.push(`
UGC COMPOSITION OVERRIDE:
Human-first composition.
The person is the main subject.
The person MUST be holding the product with their hand.
No table placement. No surface placement.
No hero product framing. No editorial composition.
        `.trim().replace(/\s+/g, ' '));

        // Age realism override for 70+
        const age = personDetails?.age || 0;
        if (age >= 70) {
            parts.push(`
Age realism override: The subject's advanced age must remain visually dominant even in UGC style.
Do not beautify, rejuvenate, or modernize facial features.
Smartphone realism must adapt to the age, not the opposite.
            `.trim().replace(/\s+/g, ' '));
        }

        // Selfie POV if available
        if (personDetails?.selfieType) {
            const selfieMap: Record<string, string> = {
                "Arm's Length Selfie": "selfie taken at arm's length, natural front-camera perspective",
                "Classic Arm Selfie (phone not visible)": "selfie perspective taken at arm's length, forearm partially visible in frame, phone not visible, natural front-camera distortion",
                "Mirror Selfie (phone visible)": "mirror selfie with phone clearly visible in reflection",
                "One-hand product selfie": "one-hand selfie holding product, natural smartphone angle",
                "Overhead in-bed selfie": "overhead selfie taken from above while lying down",
                "Low-angle hero selfie": "low-angle selfie from below, empowering perspective",
                "Back camera POV": "back camera perspective, arm's length or slightly extended"
            };

            const selfieInstruction = selfieMap[personDetails.selfieType];
            if (selfieInstruction) {
                parts.push(selfieInstruction);
            }
        }

        return parts.filter(Boolean).join(' ').trim();
    }
}
