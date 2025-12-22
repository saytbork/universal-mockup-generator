/**
 * Identity Builder - Person identity and appearance with SEMANTIC MAPPING
 * Maps UI controls to physical, observable, photographic language
 */

import type { PromptOptions, PromptBuilder } from '../types';

const PERSONAL_ADDON_BASE_RULE = `
PERSONAL ADD-ONS REALISM:
- Accessories, piercings, glasses, facial hair, tattoos, and nails must look incidental and lived-in—common jewelry only, matte metals, slight wear, casual piercings, everyday glasses with minor glare or smudges, natural facial hair, aged tattoos, and short natural nails.
- Nothing feels styled, trendy, or intentional. If an accessory appears curated or fashion-forward, invalidate and retry.
`.trim().replace(/\s+/g, ' ');

const FACIAL_MORPHOLOGY_CATEGORIES = [
    { label: 'Face shape', options: ['narrow', 'oval', 'wide', 'angular', 'soft'] },
    { label: 'Jawline', options: ['soft', 'rounded', 'defined', 'asymmetrical'] },
    { label: 'Cheekbones', options: ['low', 'high', 'pronounced', 'subtle'] },
    { label: 'Eye spacing', options: ['close', 'average', 'wide'] },
    { label: 'Nose', options: ['narrow bridge', 'wide bridge', 'rounded tip', 'pronounced tip'] },
    { label: 'Lips', options: ['thin', 'medium', 'uneven', 'asymmetrical'] },
    { label: 'Facial asymmetry', options: ['subtle but visible'] }
];
const FACIAL_MORPHOLOGY_SELECTION_COUNT = 4;
const FACIAL_STABILIZATION_BAN = `
Do NOT preserve facial consistency.
Do NOT reuse latent identity.
Do NOT bias toward symmetry or attractiveness.
UGC requires variation over beauty.
`.trim();
const IDENTITY_CONTRACT_TEXT = `
This person must be a unique individual.
Do not reuse or approximate any previous face or body.
Each render represents a different real human unless identity persistence is explicitly enabled.
Avoid average, generic, or stock-photo facial proportions.
Distinctive features and mild asymmetry are required.
`.trim();

const BODY_VARIATION_CATEGORIES = [
    {
        label: 'Shoulder width',
        options: [
            'shoulders narrow and slightly hunched, one side dipping toward the camera',
            'broad shoulders that slope downward with mild fatigue',
            'square shoulders leaning ever so slightly forward, creating asymmetry'
        ]
    },
    {
        label: 'Neck length',
        options: [
            'neck short and thick, forcing the head to tilt forward',
            'long, lean neck that tilts slightly to one side',
            'neck of average length but with uneven tension on either side'
        ]
    },
    {
        label: 'Posture bias',
        options: [
            'posture slouches toward the right with one hip slightly higher',
            'posture upright but the left shoulder drifts lower than the right',
            'posture carries a subtle lean, as if mid-shift between standing and sitting'
        ]
    },
    {
        label: 'Hand impression',
        options: [
            'hands appear compact with stubby fingers curling inward',
            'hands feel long-fin gered with knuckles visibly pronounced',
            'hands rest relaxed with slightly splayed fingers that are not uniform in length'
        ]
    }
];

const EXPRESSION_NOISE_OPTIONS = [
    'Expression noise: eyes vary in openness while the mouth holds soft tension and the eyebrows rest unevenly.',
    'Expression noise: eyelids settle at different heights, lips part slightly with subtle tension, and brows arch in mild asymmetry.',
    'Expression noise: gaze drifts just off camera, mouth corners vary, and the brow line softens on one side.',
    'Expression noise: eyelids flicker open, mouth stretches into a strained neutral, and eyebrows dip unevenly.'
];

const GENERIC_IDENTITY_KEYWORDS = /(generic|identical|same person|same creator)/i;

const ensureIdentitySeed = (seed?: string): string =>
    seed || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

const createSeededRandom = (seed?: string): (() => number) => {
    if (!seed) {
        return Math.random;
    }
    let hash = 0;
    for (let i = 0; i < seed.length; i += 1) {
        hash = (Math.imul(31, hash) + seed.charCodeAt(i)) >>> 0;
    }
    let state = hash || 1;
    return () => {
        state = (Math.imul(48271, state) + 1) % 2147483647;
        return state / 2147483647;
    };
};

const shuffleArray = <T,>(items: T[], random: () => number): T[] => {
    const array = [...items];
    for (let i = array.length - 1; i > 0; i -= 1) {
        const j = Math.floor(random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

const sample = <T,>(items: T[], random: () => number): T =>
    items[Math.floor(random() * items.length)];

const buildFacialMorphologyVariation = (random: () => number): string => {
    const shuffled = shuffleArray(FACIAL_MORPHOLOGY_CATEGORIES, random);
    const selection = shuffled.slice(0, FACIAL_MORPHOLOGY_SELECTION_COUNT);
    const descriptor = selection
        .map(category => `${category.label}: ${sample(category.options, random)}`)
        .join('; ');
    if (GENERIC_IDENTITY_KEYWORDS.test(descriptor)) {
        return buildFacialMorphologyVariation(random);
    }
    return descriptor;
};

const buildBodyVariation = (random: () => number): string =>
    BODY_VARIATION_CATEGORIES.map(category => {
        const option = sample(category.options, random);
        return `${category.label} ${option}`;
    }).join('; ');

const buildExpressionNoise = (random: () => number): string =>
    sample(EXPRESSION_NOISE_OPTIONS, random);

export class IdentityBuilder implements PromptBuilder {
    build(options: PromptOptions): string {
        const {
            personIncluded,
            hasModelReference,
            personDetails,
            contentStyle,
            sameCreatorAcrossScenes
        } = options;

        // Don't build identity if no person or if product-only mode
        if (!personIncluded || contentStyle === 'product') {
            return '';
        }

        // UGC DEGRADATION LOGIC & HELPERS
        const isRawUgc = options.ugcRealModeActive;
        const isUgcMode =
            options.contentStyle === 'ugc' ||
            options.creationIntent === 'ugc' ||
            isRawUgc;
        const identitySeed = ensureIdentitySeed(options.identitySeed);
        const randomNumber = createSeededRandom(identitySeed);

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
            if (!isUgcMode) return text;
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
        const isAge80Plus = age >= 80;

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
Hair should skew gray, silver, or white with visible thinning and irregular texture unless explicitly overridden.
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
            if (isUgcMode) {
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
            if (!isAge80Plus && (personDetails?.hairLength || personDetails?.hairTexture || personDetails?.hairColor)) {
                const hairParts = [
                    personDetails?.hairLength,
                    personDetails?.hairTexture,
                    personDetails?.hairColor
                ].filter(Boolean);
                if (hairParts.length > 0) {
                    identityParts.push(sanitizePart(`${hairParts.join(' ')} hair`));
                }
            }

            if (isAge80Plus) {
                parts.push(`
HAIR REALISM OVERRIDE (80+):
Hair must appear physically aged, thinning, and irregular with uneven density and collapsed volume.
Strands are weak, fragile, and inconsistently shaped.
Scalp visibility is normal and expected.
Hairline is uneven and imperfect.
Hair does not form a clean silhouette or aesthetic shape.
Strands rest against skin, ears, and clothing with visible compression and gravity effects.
Flyaway hairs are sparse, random, and unintentional.
There is no sense of styling, grooming, softness, or visual beauty.
                `.trim().replace(/\s+/g, ' '));
                parts.push(`
SMARTPHONE HAIR CAPTURE:
Fine hair edges may appear partially soft, broken, or missing due to smartphone autofocus and compression.
Some strands may disappear or clip irregularly.
No clean edges, no haloing, no painterly rendering.
Hair imperfections must come from capture failure, not artistic styling.
                `.trim().replace(/\s+/g, ' '));
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

            const shouldVaryIdentity =
                isUgcMode &&
                !hasModelReference &&
                sameCreatorAcrossScenes !== true;

            if (shouldVaryIdentity) {
                const morphologyVariation = buildFacialMorphologyVariation(randomNumber);
                const bodyVariation = buildBodyVariation(randomNumber);
                const expressionNoise = buildExpressionNoise(randomNumber);
                parts.push(`FACIAL MORPHOLOGY VARIATION: ${morphologyVariation}.`);
                parts.push(`BODY VARIATION: ${bodyVariation}.`);
                parts.push(`EXPRESSION NOISE: ${expressionNoise}.`);
            }

            if (!hasModelReference) {
                parts.push(FACIAL_STABILIZATION_BAN);
            }

            if (isUgcMode) {
                parts.push(IDENTITY_CONTRACT_TEXT);
            }

            parts.push(PERSONAL_ADDON_BASE_RULE);
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
        if (isUgcMode) {
            parts.push('The person must look like a real unedited smartphone photo of a real human. Avoid CGI, 3D render, synthetic human, mannequin, doll-like appearance at all costs.');
        }

        const result = parts.filter(Boolean).join('. ').trim();
        console.log('[IDENTITY BUILDER OUTPUT]', result);
        return result;
    }
}
