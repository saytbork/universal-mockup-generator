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

        // UGC DEGRADATION LOGIC & HELPERS
        const isUGC = options.ugcRealModeActive;

        // Blocked terms that cause CGI/Doll look
        const BLOCKED_IDENTITY_TERMS = [
            'ultra-realistic', 'cinematic', 'beauty dish', 'three-point lighting',
            'macro lens', 'perfect symmetry', 'flawless skin', 'high-gloss retouch',
            'editorial face', 'studio lighting', 'professional retouching',
            'perfect complexion', 'hyper-detailed', '8k', 'unreal engine',
            'silky', 'glossy', 'voluminous', 'styled', 'sculpted', 'salon',
            'beauty finish', 'cinematic hair', 'perfect waves', 'uniform texture',
            'soft hair shader', 'ai smooth hair', 'portrait polish'
        ];

        // Helper to sanitize parts
        const sanitizePart = (text: string) => {
            if (!isUGC) return text;
            let cleanText = text;
            BLOCKED_IDENTITY_TERMS.forEach(term => {
                const regex = new RegExp(`\\b${term}\\b`, 'gi');
                cleanText = cleanText.replace(regex, '');
            });
            return cleanText.replace(/\s+/g, ' ').trim();
        };

        const parts: string[] = [];
        const age = personDetails?.age || 30;
        const ageGroupLabel = age >= 75 ? 'elder' : 'adult';

        // 1. PHYSICAL IDENTITY (Standard or Reference Override)
        if (hasModelReference) {
            parts.push(`
MODEL REFERENCE OVERRIDE:
Use the uploaded model reference image as the single source of truth for the person's appearance.
Do not alter or reinterpret age, gender, ethnicity, facial structure, skin texture, hair, or expression.
Do not beautify, rejuvenate, stylize, or idealize the face.
Match the person exactly as shown in the reference image.
The model reference overrides any synthetic identity description.
            `.trim().replace(/\s+/g, ' '));
        } else {
            // AGE ANCHOR for 70+ (CRITICAL)
            if (age >= 70) {
                parts.push(`
AGE ANCHOR: The subject MUST visually read as approximately ${age} years old.
Facial structure, skin laxity, eye area, neck, hands, posture, and overall presence must be consistent with a real ${age}-year-old ${ageGroupLabel}.
Do NOT make the person appear younger.
Avoid youthful facial proportions, smooth skin, or middle-aged appearance.
                `.trim().replace(/\s+/g, ' '));
            }

            if (age >= 75) {
                parts.push(`
ELDER REALISM: Deep-set crow's feet, softened jawline definition, gentle jowls, and age spots on face and hands are expected.
Hair should skew gray, silver, or white with natural softness unless explicitly overridden.
Hands must show visible veins and knuckle definition, and muscles should feel relaxed rather than toned.
Skin carries micro wrinkles around the mouth, eyes, and neck with authentic sag, not harsh texture or stylized pores.
                `.trim().replace(/\s+/g, ' '));
            }

            // IDENTITY BLOCK - Core attributes
            const identityParts: string[] = [];

            // Age - ALWAYS numeric, elder group for 75+
            const ageLabel = `${age}-year-old ${ageGroupLabel}`;
            identityParts.push(ageLabel);

            // Gender - use allowed selections verbatim
            if (personDetails?.gender) {
                identityParts.push(sanitizePart(personDetails.gender));
            }

            // Ethnicity - inject verbatim
            if (personDetails?.ethnicity && personDetails.ethnicity !== 'Prefer not to specify') {
                identityParts.push(personDetails.ethnicity);
            }

            // Body Type - use the exact selection
            if (personDetails?.bodyType) {
                identityParts.push(sanitizePart(`${personDetails.bodyType} build`));
            }

            // Skin Tone - inject the selected option exactly
            if (personDetails?.skinTone) {
                identityParts.push(sanitizePart(personDetails.skinTone));
            }

            // Skin Realism + Appearance - UGC Override logic
            if (isUGC) {
                // FORCE RAW SKIN IN UGC MODE
                identityParts.push('real human appearance, everyday skin texture, minor unevenness, natural asymmetry, no cosmetic retouching');
            } else {
                const skinDescriptor = personDetails?.skinRealism;
                const appearanceDescriptor = personDetails?.personAppearance;
                const appearancePieces: string[] = [];

                if (skinDescriptor) {
                    appearancePieces.push(skinDescriptor);
                }
                if (appearanceDescriptor) {
                    appearancePieces.push(appearanceDescriptor);
                }

                if (appearancePieces.length > 0) {
                    appearancePieces.push('real human presence, no stock photo, no over-retouching');
                    const appearanceBlock = appearancePieces.filter(Boolean).join('. ');
                    const formattedBlock = appearanceBlock.endsWith('.')
                        ? appearanceBlock
                        : `${appearanceBlock}.`;
                    identityParts.push(sanitizePart(formattedBlock));
                } else {
                    identityParts.push('realistic skin texture appropriate for their age');
                }
            }

            // Eye Color
            if (personDetails?.eyeColor) {
                identityParts.push(sanitizePart(personDetails.eyeColor));
            }

            // Hair
            if (personDetails?.hairLength || personDetails?.hairTexture || personDetails?.hairColor) {
                const hairParts = [
                    personDetails?.hairLength,
                    personDetails?.hairTexture,
                    personDetails?.hairColor
                ].filter(Boolean);
                if (hairParts.length > 0) {
                    identityParts.push(sanitizePart(`${hairParts.join(' ')} hair`));
                }
            }

            if (age >= 80) {
                parts.push(`
HAIR REALISM OVERRIDE:
Hair must appear eighty-plus years old with collapsed volume, irregular thinning, uneven strand density, and a visibly fragile hairline. Strands cling to skin, ears, and clothing with real contact, random flyaways, and slight scalp visibility. The capture is from a casual smartphone, so fine edges fall slightly soft, some strands break or vanish from compression, and there is zero sense of salon styling or clean silhouette—reject any appearance of healthy, plush, or aesthetic hair.
                `.trim().replace(/\s+/g, ' '));
            }

            // Join core identity
            if (identityParts.length > 0) {
                parts.push(identityParts.join(', '));
            }
        }

        // EXPRESSION
        if (personDetails?.facialExpression) {
            parts.push(`FACIAL EXPRESSION: ${sanitizePart(personDetails.facialExpression)}`);
        }

        // EYE DIRECTION
        if (personDetails?.eyeDirection) {
            const eyeMap: Record<string, string> = {
                'Looking at camera': 'eyes directed straight into camera lens with focused engaging gaze',
                'Looking at product': 'eyes clearly directed toward the product with attentive focus',
                'Looking away naturally': 'eyes directed off-camera at natural angle, authentic candid gaze'
            };
            const mapped = eyeMap[personDetails.eyeDirection] || personDetails.eyeDirection;
            parts.push(sanitizePart(mapped));
        }

        // POSE
        if (personDetails?.personPose) {
            parts.push(sanitizePart(personDetails.personPose));
        }

        // SCENE MOOD
        if (personDetails?.personMood) {
            parts.push(`SCENE MOOD: ${sanitizePart(personDetails.personMood)}`);
        }

        // WARDROBE
        if (personDetails?.wardrobeStyle) {
            parts.push(`wearing ${sanitizePart(personDetails.wardrobeStyle)}`);
        }

        // PRODUCT INTERACTION
        if (personDetails?.productInteraction) {
            parts.push(sanitizePart(personDetails.productInteraction));
        }

        // SELFIE TYPE
        if (personDetails?.selfieType) {
            parts.push(sanitizePart(personDetails.selfieType));
        }

        // PROPS
        if (personDetails?.personProps) {
            parts.push(sanitizePart(personDetails.personProps));
        }

        // *** CRITICAL ANTI-DOLL CONSTRAINT FOR UGC ***
        if (isUGC) {
            parts.push('The person must look like a real unedited smartphone photo of a real human. Avoid CGI, 3D render, synthetic human, mannequin, doll-like appearance at all costs.');
        }

        const result = parts.filter(Boolean).join('. ').trim();
        console.log('[IDENTITY BUILDER OUTPUT]', result);
        return result;
    }
}
