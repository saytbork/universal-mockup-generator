/**
 * Identity Builder - Person identity and appearance
 */

import type { PromptOptions, PromptBuilder } from '../types';
import { parameterMap } from '../parameterMap';

export class IdentityBuilder implements PromptBuilder {
    build(options: PromptOptions): string {
        const {
            personIncluded,
            modelReference,
            identityLock,
            compositionIntro,
            identityBlock,
            eyeDirection,
            contentStyle,
        } = options;

        if (!personIncluded || contentStyle === 'product') {
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

        if (eyeDirection) {
            const mappedEyeDirection = parameterMap.eyeDirection[eyeDirection];
            if (mappedEyeDirection) {
                prompt += `${mappedEyeDirection} `;
            }
        }

        const personDetails = options.personDetails || {
            ageGroup: (options as any).ageGroup,
            gender: (options as any).gender,
            ethnicity: (options as any).ethnicity,
            skinTone: (options as any).skinTone,
            hairColor: (options as any).hairColor,
            hairStyle: (options as any).hairStyle,
            personPose: (options as any).personPose,
            personMood: (options as any).personMood,
            personAppearance: (options as any).personAppearance,
            productInteraction: (options as any).productInteraction,
            wardrobeStyle: (options as any).wardrobeStyle,
            personProps: (options as any).personProps,
            microLocation: (options as any).microLocation,
            personExpression: (options as any).personExpression,
            selfieType: (options as any).selfieType,
        };

        const details: string[] = [];

        if (personDetails.ageGroup && personDetails.ageGroup !== 'no person') {
            details.push(parameterMap.ageGroup?.[personDetails.ageGroup] ?? personDetails.ageGroup);
        }
        if (personDetails.gender) {
            details.push(`gender: ${personDetails.gender}`);
        }
        if (personDetails.ethnicity) {
            details.push(`ethnicity: ${personDetails.ethnicity}`);
        }
        if (personDetails.personAppearance) {
            details.push(personDetails.personAppearance);
        }
        if (personDetails.personMood) {
            details.push(parameterMap.mood?.[personDetails.personMood] ?? personDetails.personMood);
        }
        if (personDetails.personExpression) {
            details.push(parameterMap.expression?.[personDetails.personExpression] ?? personDetails.personExpression);
        }
        if (personDetails.personPose) {
            details.push(parameterMap.pose?.[personDetails.personPose] ?? personDetails.personPose);
        }
        if (personDetails.productInteraction) {
            details.push(parameterMap.interaction?.[personDetails.productInteraction] ?? personDetails.productInteraction);
        }
        if (personDetails.wardrobeStyle) {
            details.push(parameterMap.wardrobe?.[personDetails.wardrobeStyle] ?? personDetails.wardrobeStyle);
        }
        if (personDetails.personProps) {
            details.push(personDetails.personProps);
        }
        if (personDetails.microLocation) {
            details.push(parameterMap.microLocation?.[personDetails.microLocation] ?? personDetails.microLocation);
        }
        if (personDetails.selfieType) {
            details.push(parameterMap.selfieType?.[personDetails.selfieType] ?? personDetails.selfieType);
        }

        if (details.length > 0) {
            prompt += ` Person details: ${details.filter(Boolean).join(', ')}.`;
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
