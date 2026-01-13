/**
 * Identity Builder - Person identity and appearance (OPTIMIZED)
 * Uses token-based identity control instead of semantic variations
 */

import type { PromptOptions, PromptBuilder } from '../types';

// ============================================================================
// CORE CONSTANTS (KEPT)
// ============================================================================

const PERSONAL_ADDON_BASE_RULE = `
PERSONAL ADD-ONS: Accessories must look incidental and worn-in. Common jewelry only, matte metals, slight wear, casual piercings. Glasses are OPTIONAL; if present, they are everyday glasses with minor glare. Natural facial hair, short natural nails. Tattoos are optional and ONLY appear on exposed skin (never through clothing); if sleeves/wardrobe cover the arms, omit tattoos entirely. Nothing styled or trendy.
`.trim().replace(/\s+/g, ' ');

const IDENTITY_CONTRACT_TEXT = `
This subject must be a unique individual. Do not reuse or approximate any previous face or physique. Each render represents a different real human. Avoid generic or stock-photo proportions.
`.trim().replace(/\s+/g, ' ');

const ANTI_DOLL_CONSTRAINT = `
The person must look like a real unedited smartphone photo of a real human. Avoid CGI, 3D render, synthetic human, mannequin, or doll-like appearance.
`.trim().replace(/\s+/g, ' ');

// ============================================================================
// BLOCKED TERMS (CGI/Doll prevention)
// ============================================================================

const BLOCKED_IDENTITY_TERMS = [
    'ultra-realistic', 'cinematic', 'beauty dish', 'three-point lighting',
    'macro lens', 'perfect symmetry', 'flawless skin', 'high-gloss retouch',
    'editorial face', 'studio lighting', 'professional retouching',
    'hyper-detailed', '8k', 'unreal engine', 'silky', 'glossy',
    'beauty finish', 'cinematic hair', 'perfect waves'
];

const sanitizePart = (text: string, isUgcMode: boolean): string => {
    if (!isUgcMode) return text;
    let cleanText = text;
    BLOCKED_IDENTITY_TERMS.forEach(term => {
        const regex = new RegExp(`\\b${term}\\b`, 'gi');
        cleanText = cleanText.replace(regex, '');
    });
    return cleanText.replace(/\s+/g, ' ').trim();
};

// ============================================================================
// IDENTITY BUILDER CLASS
// ============================================================================

export class IdentityBuilder implements PromptBuilder {
    private hashToken(input: string): number {
        // FNV-1a 32-bit
        let hash = 0x811c9dc5;
        for (let i = 0; i < input.length; i++) {
            hash ^= input.charCodeAt(i);
            hash = Math.imul(hash, 0x01000193);
        }
        return hash >>> 0;
    }

    private pick<T>(arr: T[], seed: number, offset: number): T {
        const idx = (seed + offset) % arr.length;
        return arr[idx];
    }

    private buildFaceSignature(seedKey: string): string {
        const seed = this.hashToken(seedKey);

        const faceShape = [
            'oval face',
            'round face',
            'square face',
            'heart-shaped face',
            'long face',
            'diamond-shaped face',
        ];
        const jaw = [
            'soft jawline',
            'defined jawline',
            'strong jawline',
            'tapered jawline',
            'broad jaw',
            'narrow jaw',
        ];
        const cheekbones = [
            'subtle cheekbones',
            'high cheekbones',
            'pronounced cheekbones',
            'flat cheekbones',
        ];
        const eyes = [
            'almond-shaped eyes',
            'round eyes',
            'deep-set eyes',
            'wide-set eyes',
            'close-set eyes',
            'hooded eyelids',
        ];
        const brows = [
            'straight brows',
            'arched brows',
            'thick brows',
            'thin brows',
            'soft natural brows',
        ];
        const nose = [
            'straight nose bridge',
            'slightly curved nose bridge',
            'prominent nose bridge',
            'small nose',
            'wide nose',
            'narrow nose',
        ];
        const lips = [
            'thin lips',
            'full lips',
            'wide mouth',
            'narrow mouth',
            'defined cupid’s bow',
        ];
        const forehead = [
            'low forehead',
            'average forehead',
            'high forehead',
        ];
        const hairline = [
            'straight hairline',
            'widow’s peak hairline',
            'rounded hairline',
            'slightly receding hairline',
        ];

        const parts = [
            this.pick(faceShape, seed, 1),
            this.pick(jaw, seed, 2),
            this.pick(cheekbones, seed, 3),
            this.pick(eyes, seed, 4),
            this.pick(brows, seed, 5),
            this.pick(nose, seed, 6),
            this.pick(lips, seed, 7),
            this.pick(forehead, seed, 8),
            this.pick(hairline, seed, 9),
        ];
        return parts.join(', ');
    }

    build(options: PromptOptions): string {
        const {
            personIncluded,
            hasModelReference,
            personDetails,
            contentStyle,
            creationIntent,
            ugcRealModeActive
        } = options;

        // Skip if no person or product-only mode
        if (!personIncluded || contentStyle === 'product') {
            return '';
        }

        const isUgcMode = contentStyle === 'ugc' || creationIntent === 'ugc' || ugcRealModeActive;
        const parts: string[] = [];
        const age = personDetails?.age || 30;
        const ageGroupLabel = age >= 75 ? 'elder' : 'adult';

        // ====================================================================
        // MODEL REFERENCE OVERRIDE (highest priority)
        // ====================================================================
        if (hasModelReference) {
            parts.push(`
MODEL REFERENCE OVERRIDE:
Use the uploaded model reference as the single source of truth for appearance.
Do not alter age, gender, ethnicity, facial structure, skin, hair, or expression.
Match the person exactly as shown.
            `.trim().replace(/\s+/g, ' '));
        } else {
            // ================================================================
            // AGE ANCHOR (for 45+; stronger for 50+)
            // ================================================================
            if (age >= 50 && age < 70) {
                parts.push(`
AGE ANCHOR: Subject MUST visually read as ${age} years old.
Facial features must match a real ${age}-year-old adult: age-appropriate skin texture, subtle to moderate facial lines (forehead, crow's feet, smile lines), and mature facial structure.
Do NOT make the subject appear youthful (no teen/20s look).
                `.trim().replace(/\s+/g, ' '));
            } else if (age >= 45 && age < 50) {
                parts.push(`
AGE ANCHOR: Subject MUST visually read as ${age} years old.
Avoid a youthful teen/20s appearance; include age-appropriate skin texture and subtle facial lines.
                `.trim().replace(/\s+/g, ' '));
            } else if (age >= 70) {
                parts.push(`
AGE ANCHOR: Subject MUST visually read as ${age} years old.
Facial structure, skin laxity, eye area, neck, hands, and posture must match a real ${age}-year-old ${ageGroupLabel}.
Do NOT make the person appear younger.
                `.trim().replace(/\s+/g, ' '));
            }

            // ================================================================
            // ELDER REALISM (for 75+)
            // ================================================================
            if (age >= 75) {
                parts.push(`
ELDER REALISM: Deep crow's feet, softened jawline, gentle jowls, age spots on face and hands.
Hair skews gray/silver/white with thinning and irregular texture.
Hands show visible veins and knuckle definition.
Skin carries micro wrinkles around mouth, eyes, and neck with authentic sag.
                `.trim().replace(/\s+/g, ' '));
            }

            // ================================================================
            // CORE IDENTITY ATTRIBUTES
            // ================================================================
            const identityParts: string[] = [];

            // Ethnicity anchor (only when explicitly selected)
            if (
                personDetails?.ethnicity &&
                personDetails.ethnicity !== 'Prefer not to specify' &&
                personDetails.ethnicity !== 'Non-specific'
            ) {
                parts.push(
                    `ETHNICITY ANCHOR: Subject MUST visually read as ${personDetails.ethnicity}. Do not drift to a different ethnicity.`
                );
            }

            // Gender anchor
            if (personDetails?.gender) {
                parts.push(
                    `GENDER ANCHOR: Subject MUST visually read as ${sanitizePart(String(personDetails.gender), isUgcMode)}. Do not drift.`
                );
            }

            // Skin tone anchor
            if (personDetails?.skinTone) {
                parts.push(
                    `SKIN TONE ANCHOR: Subject MUST visually match ${sanitizePart(String(personDetails.skinTone), isUgcMode)}. Do not drift to a different skin tone.`
                );
            }

            // Eye color anchor
            if (personDetails?.eyeColor) {
                parts.push(
                    `EYE COLOR ANCHOR: Eyes MUST be ${sanitizePart(String(personDetails.eyeColor), isUgcMode)}. Do not drift.`
                );
            }

            // Age
            identityParts.push(`${age}-year-old ${ageGroupLabel}`);

            // Gender
            if (personDetails?.gender) {
                identityParts.push(sanitizePart(personDetails.gender, isUgcMode));
            }

            // Ethnicity
            if (personDetails?.ethnicity && personDetails.ethnicity !== 'Prefer not to specify') {
                identityParts.push(personDetails.ethnicity);
            }

            // Body Type
            if (personDetails?.bodyType) {
                const build = sanitizePart(`${personDetails.bodyType} build`, isUgcMode);
                identityParts.push(build);
                parts.push(`BUILD ANCHOR: Subject must have a ${build}. Do not drift to a very different build.`);
            }

            // Skin Tone
            if (personDetails?.skinTone) {
                identityParts.push(sanitizePart(personDetails.skinTone, isUgcMode));
            }

            // Skin Realism (UGC override)
            if (isUgcMode) {
                identityParts.push('real human appearance, everyday skin texture, natural asymmetry, no retouching');
            } else {
                identityParts.push('realistic skin texture appropriate for age');
            }

            // Eye Color
            if (personDetails?.eyeColor) {
                identityParts.push(sanitizePart(personDetails.eyeColor, isUgcMode));
            }

            // Hair (skip for 80+ in UGC)
            const isAge80Plus = age >= 80;
            if (!isAge80Plus && (personDetails?.hairLength || personDetails?.hairTexture || personDetails?.hairColor)) {
                const hairParts = [
                    personDetails?.hairLength,
                    personDetails?.hairTexture,
                    personDetails?.hairColor
                ].filter(Boolean);
                if (hairParts.length > 0) {
                    const hairText = sanitizePart(`${hairParts.join(' ')} hair`, isUgcMode);
                    identityParts.push(hairText);
                    parts.push(`HAIR ANCHOR: Hair MUST match: ${hairText}. Do not drift to a different hair length/texture/color.`);
                }
            }

            // Hair realism for 80+
            if (isAge80Plus) {
                parts.push(`
HAIR (80+): Physically aged, thinning, irregular density, collapsed volume.
Strands weak and fragile, scalp visibility normal, hairline uneven.
Captured by smartphone so fine edges may appear soft or broken.
                `.trim().replace(/\s+/g, ' '));
            }

            // Push core identity
            if (identityParts.length > 0) {
                parts.push(identityParts.join(', '));
            }

            // ================================================================
            // IDENTITY MODE CONTROL (token-based)
            // ================================================================
            const identityMode = options.identityMode || 'auto';
            const identityVariationToken = options.identityVariationToken;
            const identityKey = options.identityKey;

            const personCount = options.personCount;
            const coupleSex = options.coupleSex;
            const secondaryPersonDetails = (options as any).secondaryPersonDetails as Partial<PersonDetails> | undefined;

            if (personCount === 'couple') {
                const sexText =
                    coupleSex === 'same'
                        ? 'same-gender couple'
                        : coupleSex === 'different'
                            ? 'mixed-gender couple'
                            : 'couple';
                parts.push(`Two subjects in frame: ${sexText}. Both must look like real distinct individuals.`);

                // Avoid contradictions: if UI provides a single-person gender, treat it as PRIMARY only.
                // Secondary gender is derived from coupleSex when possible.
                const primaryGender = personDetails?.gender;
                const primaryGenderText = primaryGender ? sanitizePart(String(primaryGender), isUgcMode) : '';
                if (primaryGenderText) {
                    const otherGender = (() => {
                        if (coupleSex !== 'different') return primaryGenderText;
                        const g = primaryGenderText.toLowerCase();
                        if (g.includes('female') || g.includes('woman')) return 'Male';
                        if (g.includes('male') || g.includes('man')) return 'Female';
                        return ''; // non-binary/other → don't force
                    })();
                    if (otherGender) {
                        parts.push(`PRIMARY PERSON: ${primaryGenderText}. SECONDARY PERSON: ${sanitizePart(otherGender, isUgcMode)}. Secondary must have clearly different facial features.`);
                    } else {
                        parts.push(`PRIMARY PERSON: ${primaryGenderText}. SECONDARY PERSON: distinct individual with different facial features.`);
                    }
                } else {
                    parts.push('PRIMARY PERSON and SECONDARY PERSON must have clearly different facial features and identity.');
                }

                if (secondaryPersonDetails && Object.keys(secondaryPersonDetails).length) {
                    const secondaryBits: string[] = [];
                    if (secondaryPersonDetails.gender) secondaryBits.push(`gender ${sanitizePart(String(secondaryPersonDetails.gender), isUgcMode)}`);
                    if (secondaryPersonDetails.ethnicity) secondaryBits.push(sanitizePart(String(secondaryPersonDetails.ethnicity), isUgcMode));
                    if (secondaryPersonDetails.skinTone) secondaryBits.push(sanitizePart(String(secondaryPersonDetails.skinTone), isUgcMode));
                    if (secondaryPersonDetails.eyeColor) secondaryBits.push(sanitizePart(String(secondaryPersonDetails.eyeColor), isUgcMode));
                    if (secondaryPersonDetails.bodyType) secondaryBits.push(sanitizePart(String(secondaryPersonDetails.bodyType), isUgcMode));
                    const hairBits = [
                        secondaryPersonDetails.hairLength,
                        secondaryPersonDetails.hairTexture,
                        secondaryPersonDetails.hairColor,
                    ]
                        .map(v => (v ? String(v) : ''))
                        .filter(Boolean);
                    if (hairBits.length) secondaryBits.push(sanitizePart(`${hairBits.join(' ')} hair`, isUgcMode));
                    if (secondaryBits.length) {
                        parts.push(`SECONDARY PERSON DETAILS: ${secondaryBits.join(', ')}.`);
                    }
                }
            }

            if (identityMode === 'auto' && identityVariationToken) {
                parts.push(`[IDENTITY_VARIATION_TOKEN: ${identityVariationToken}]`);
                if (personCount === 'couple') {
                    parts.push(`FACE SIGNATURE A: ${this.buildFaceSignature(`${identityVariationToken}-A`)}`);
                    parts.push(`FACE SIGNATURE B: ${this.buildFaceSignature(`${identityVariationToken}-B`)}`);
                } else {
                    parts.push(`FACE SIGNATURE: ${this.buildFaceSignature(identityVariationToken)}`);
                }
                parts.push('This must be a different individual than any previously generated subject. Do not repeat facial identity.');
            } else if (identityMode === 'locked' && identityKey) {
                parts.push(`[IDENTITY_KEY: ${identityKey}]`);
                if (personCount === 'couple') {
                    parts.push(`FACE SIGNATURE A: ${this.buildFaceSignature(`${identityKey}-A`)}`);
                    parts.push(`FACE SIGNATURE B: ${this.buildFaceSignature(`${identityKey}-B`)}`);
                } else {
                    parts.push(`FACE SIGNATURE: ${this.buildFaceSignature(identityKey)}`);
                }
                parts.push('Same subject as previous generation. Maintain facial identity consistency.');
            }

            // Identity contract (only in auto mode)
            if (isUgcMode && identityMode !== 'locked') {
                parts.push(IDENTITY_CONTRACT_TEXT);
            }

            parts.push(PERSONAL_ADDON_BASE_RULE);
        }

        // ====================================================================
        // EXPRESSION & POSE
        // ====================================================================
        if (personDetails?.facialExpression) {
            parts.push(`EXPRESSION: ${sanitizePart(personDetails.facialExpression, isUgcMode)}`);
        }

        if (personDetails?.eyeDirection) {
            const eyeMap: Record<string, string> = {
                'Looking at camera': 'eyes directed at camera with focused gaze',
                'Looking at product': 'eyes directed toward product with attentive focus',
                'Looking away naturally': 'eyes off-camera at natural angle, candid gaze'
            };
            parts.push(sanitizePart(eyeMap[personDetails.eyeDirection] || personDetails.eyeDirection, isUgcMode));
        }

        if (personDetails?.personPose) {
            parts.push(sanitizePart(personDetails.personPose, isUgcMode));
        }

        if (personDetails?.personMood) {
            parts.push(`MOOD: ${sanitizePart(personDetails.personMood, isUgcMode)}`);
        }

        if (personDetails?.wardrobeStyle) {
            parts.push(`wearing ${sanitizePart(personDetails.wardrobeStyle, isUgcMode)}`);
        }

        if (personDetails?.productInteraction) {
            parts.push(sanitizePart(personDetails.productInteraction, isUgcMode));
        }

        if (personDetails?.selfieType) {
            const rawSelfieType = String(personDetails.selfieType || '').trim();
            const normalized = rawSelfieType.toLowerCase();
            const captureIds = new Set([
                'torso-level-handheld',
                'high-angle',
                'close-face',
                'propped-surface',
            ]);
            // In UGC we avoid leaking internal capture IDs into the prompt.
            if (!isUgcMode || !captureIds.has(normalized)) {
                parts.push(sanitizePart(rawSelfieType, isUgcMode));
            }
        }

        if (personDetails?.personProps) {
            parts.push(sanitizePart(personDetails.personProps, isUgcMode));
        }

        // Anti-doll constraint for UGC
        if (isUgcMode) {
            parts.push(ANTI_DOLL_CONSTRAINT);
        }

        const result = parts.filter(Boolean).join('. ').trim();
        console.log('[IDENTITY BUILDER OUTPUT]', result.substring(0, 200) + '...');
        return result;
    }
}
