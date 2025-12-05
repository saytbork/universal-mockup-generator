/**
 * Identity Builder - Person identity and appearance
 */

import type { PromptOptions, PromptBuilder } from '../types';

export class IdentityBuilder implements PromptBuilder {
    build(options: PromptOptions): string {
        const {
            personIncluded,
            modelReference,
            identityLock,
            compositionIntro,
            identityBlock,
        } = options;

        if (!personIncluded) {
            return '';
        }

        let prompt = '';

        // Add composition intro if provided
        if (compositionIntro) {
            prompt += compositionIntro.trim() + ' ';
        }

        // Add identity block if provided
        if (identityBlock) {
            prompt += identityBlock.trim() + ' ';
        }

        // Model reference takes priority
        if (modelReference?.base64) {
            prompt += `
        Use the uploaded model reference as the exact identity.
        Do not alter face, facial structure, gender, age or skin tone.
      `.trim().replace(/\s+/g, ' ');

            if (modelReference.notes) {
                prompt += ` ${modelReference.notes.trim()}`;
            }
        }
        // Identity lock (persona settings)
        else if (identityLock) {
            prompt += this.buildIdentityLock(identityLock);
        }
        // Generic person
        else {
            prompt += `
        Render a photorealistic person.
        Real skin texture with pores and micro shadows.
        No CGI look.
        Perfect wrist, knuckle and finger proportions.
      `.trim().replace(/\s+/g, ' ');
        }

        return prompt;
    }

    private buildIdentityLock(identity: any): string {
        const parts = [];

        if (identity.ageGroup) parts.push(`Age group: ${identity.ageGroup}`);
        if (identity.gender) parts.push(`Gender: ${identity.gender}`);
        if (identity.ethnicity) parts.push(`Ethnicity: ${identity.ethnicity}`);
        if (identity.skinTone) parts.push(`Skin tone: ${identity.skinTone}`);
        if (identity.hairType && identity.hairLength && identity.hairColor) {
            parts.push(`Hair: ${identity.hairType}, ${identity.hairLength}, ${identity.hairColor}`);
        }
        if (identity.bodyType) parts.push(`Body type: ${identity.bodyType}`);

        if (parts.length === 0) {
            return '';
        }

        return `
      Render consistent identity:
      ${parts.join('. ')}.
      Facial features must never be randomized.
    `.trim().replace(/\s+/g, ' ');
    }
}
