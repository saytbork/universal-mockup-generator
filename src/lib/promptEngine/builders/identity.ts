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
            'perfect complexion', 'hyper-detailed', '8k', 'unreal engine'
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
                    identityParts.push(sanitizePart(mapped));
                }
            }

            // Ethnicity - with physical features
            if (personDetails?.ethnicity && personDetails.ethnicity !== 'Prefer not to specify') {
                identityParts.push(sanitizePart(personDetails.ethnicity));
            }

            // Body Type
            if (personDetails?.bodyType) {
                identityParts.push(sanitizePart(`${personDetails.bodyType.toLowerCase()} build`));
            }

            // Skin Tone
            if (personDetails?.skinTone) {
                const skinMap: Record<string, string> = {
                    'Very Fair': 'very fair',
                    'Fair': 'fair',
                    'Fair Cool': 'fair with cool undertones',
                    'Fair Warm': 'fair with warm undertones',
                    'Medium': 'medium',
                    'Medium Neutral': 'medium with neutral undertones',
                    'Olive': 'olive',
                    'Tan': 'tan',
                    'Brown': 'brown',
                    'Deep Golden': 'deep with golden undertones',
                    'Deep Brown': 'deep brown',
                    'Deep Cool': 'deep with cool undertones',
                    'Very Deep': 'very deep'
                };
                const mappedSkin = skinMap[personDetails.skinTone] || personDetails.skinTone.toLowerCase();
                identityParts.push(`${mappedSkin} skin`);
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
                    personDetails?.hairLength?.toLowerCase(),
                    personDetails?.hairTexture?.toLowerCase(),
                    personDetails?.hairColor?.toLowerCase()
                ].filter(Boolean);
                if (hairParts.length > 0) {
                    identityParts.push(sanitizePart(`${hairParts.join(' ')} hair`));
                }
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
