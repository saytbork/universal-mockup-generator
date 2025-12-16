/**
 * Identity Builder - Person identity and appearance with SEMANTIC MAPPING
 * Maps UI controls to physical, observable, photographic language
 */

import type { PromptOptions, PromptBuilder } from '../types';

export class IdentityBuilder implements PromptBuilder {
    build(options: PromptOptions): string {
        const { personIncluded, hasModelReference, personDetails, contentStyle } = options;

        // Don't build identity if no person or if product-only mode
        if (!personIncluded || contentStyle === 'product') {
            return '';
        }

        // MODEL REFERENCE OVERRIDE - Takes absolute priority
        if (hasModelReference) {
            return `
MODEL REFERENCE OVERRIDE:
Use the uploaded model reference image as the single source of truth for the person's appearance.
Do not alter or reinterpret age, gender, ethnicity, facial structure, skin texture, hair, or expression.
Do not beautify, rejuvenate, stylize, or idealize the face.
Match the person exactly as shown in the reference image.
The model reference overrides any synthetic identity description.
            `.trim().replace(/\s+/g, ' ');
        }

        const parts: string[] = [];
        const age = personDetails?.age || 30;

        // AGE ANCHOR for 70+ (CRITICAL)
        if (age >= 70) {
            parts.push(`
AGE ANCHOR: The subject MUST visually read as approximately ${age} years old.
Facial structure, skin laxity, eye area, neck, hands, posture, and overall presence must be consistent with a real ${age}-year-old adult.
Do NOT make the person appear younger.
Avoid youthful facial proportions, smooth skin, or middle-aged appearance.
            `.trim().replace(/\s+/g, ' '));
        }

        // IDENTITY BLOCK - Core attributes
        const identityParts: string[] = [];

        // Age - ALWAYS numeric
        identityParts.push(`${age}-year-old adult`);

        // Gender - soft descriptor
        if (personDetails?.gender) {
            const genderMap: Record<string, string> = {
                'Female': 'female-presenting adult',
                'Male': 'male-presenting adult',
                'Non-binary': 'non-binary presenting adult, balanced gender expression',
                'They / Them': 'person with neutral gender presentation',
                'Androgynous': 'androgynous appearance with blended masculine and feminine traits',
                'Gender non-conforming': 'gender non-conforming presentation',
            };
            const mapped = genderMap[personDetails.gender];
            if (mapped) {
                identityParts.push(mapped);
            }
        }

        // Ethnicity
        if (personDetails?.ethnicity && personDetails.ethnicity !== 'Prefer not to specify') {
            if (personDetails.ethnicity.startsWith('ethnicity described as:')) {
                // Custom ethnicity
                identityParts.push(personDetails.ethnicity);
            } else {
                identityParts.push(`of ${personDetails.ethnicity} appearance`);
            }
        }

        // Body Type
        if (personDetails?.bodyType) {
            identityParts.push(`${personDetails.bodyType.toLowerCase()} build`);
        }

        // Skin Tone (avoid duplication)
        if (personDetails?.skinTone) {
            const skinMap: Record<string, string> = {
                'Very Fair': 'very fair',
                'Fair': 'fair',
                'Medium': 'medium',
                'Olive': 'olive',
                'Tan': 'tan',
                'Brown': 'brown',
                'Deep Brown': 'deep brown',
                'Very Deep': 'very deep'
            };
            const mappedSkin = skinMap[personDetails.skinTone] || personDetails.skinTone.toLowerCase();
            identityParts.push(`${mappedSkin} skin`); // NO "skin tone" duplication
        }

        // Skin Realism
        if (personDetails?.skinRealism) {
            const realismMap: Record<string, string> = {
                'Ultra realistic': 'realistic skin texture with visible pores, fine lines, and natural imperfections',
                'Natural': 'natural skin texture with subtle imperfections',
                'Polished': 'polished skin with minimal visible texture',
                'Smooth': 'smooth skin with very subtle texture'
            };
            const mapped = realismMap[personDetails.skinRealism];
            if (mapped) {
                identityParts.push(mapped);
            }
        } else {
            // Default realistic skin
            identityParts.push('realistic skin texture appropriate for their age');
        }

        // Eye Color
        if (personDetails?.eyeColor) {
            identityParts.push(`${personDetails.eyeColor.toLowerCase()} eyes`);
        }

        // Hair
        if (personDetails?.hairLength && personDetails?.hairTexture && personDetails?.hairColor) {
            identityParts.push(`${personDetails.hairLength.toLowerCase()} ${personDetails.hairTexture.toLowerCase()} ${personDetails.hairColor.toLowerCase()} hair`);
        }

        // Join core identity
        if (identityParts.length > 0) {
            parts.push(identityParts.join(', '));
        }

        // EXPRESSION - Map to visual facial cues
        if (personDetails?.facialExpression) {
            const expressionMap: Record<string, string> = {
                'Soft Smile': 'soft relaxed smile, lips slightly curved, natural facial tension',
                'Full Smile': 'broad genuine smile, teeth visible, expressive eyes',
                'Serious Focus': 'neutral serious expression, focused eyes, relaxed mouth',
                'Excited Surprise': 'wide eyes, raised eyebrows, mouth slightly open in surprise',
                'Stressed but Hopeful': 'subtle facial tension, tired eyes with a gentle hopeful expression',
                'Caffeinated Crash': 'slightly exhausted expression, heavy eyelids, casual fatigue',
                'Real-Life Calm': 'calm everyday expression, natural relaxed face',
                'UGC Reality': 'imperfect natural facial expression, candid non-posed look'
            };
            const mapped = expressionMap[personDetails.facialExpression];
            if (mapped) {
                parts.push(mapped);
            }
        }

        // EYE DIRECTION - Map to gaze behavior
        if (personDetails?.eyeDirection) {
            const eyeMap: Record<string, string> = {
                'Looking at camera': 'eyes looking directly into the camera lens',
                'Looking at product': 'eyes clearly directed toward the product',
                'Looking away naturally': 'eyes looking slightly off-camera, distracted natural gaze'
            };
            const mapped = eyeMap[personDetails.eyeDirection];
            if (mapped) {
                parts.push(mapped);
            }
        }

        return parts.filter(Boolean).join('. ').trim();
    }
}
