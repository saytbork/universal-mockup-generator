/**
 * Identity Builder - Person identity and appearance (OPTIMIZED)
 * Uses token-based identity control instead of semantic variations
 * V2: Enhanced with diversity randomization to prevent "AI Clone Syndrome"
 */

import type { PromptOptions, PromptBuilder, PersonDetails } from '../types';
import { DiversityRandomizer, createDiversitySeed } from './diversityRandomizer';
import { isUgcModeActive } from '../types';

// ============================================================================
// CORE CONSTANTS (KEPT)
// ============================================================================

const PERSONAL_ADDON_BASE_RULE = `
PERSONAL ADD-ONS: Accessories must look incidental and worn-in. Common jewelry only, matte metals, slight wear, casual piercings. Glasses are OPTIONAL; if present, they are everyday glasses with minor glare. Natural facial hair, short natural nails. Tattoos are optional and ONLY appear on exposed skin (never through clothing); if sleeves/wardrobe cover the arms, omit tattoos entirely. Nothing styled or trendy.
`.trim().replace(/\s+/g, ' ');

const IDENTITY_CONTRACT_TEXT = `
This subject must be a unique individual. Do not reuse or approximate any previous face or physique. Each render represents a different real individual. Avoid generic or stock-photo proportions.
`.trim().replace(/\s+/g, ' ');

const ANTI_DOLL_CONSTRAINT = `
CRITICAL REALISM REQUIREMENT (NON-NEGOTIABLE): This MUST be a real unedited photo of a real human being, NOT a 3D render, CGI model, digital avatar, or AI-generated perfect face. REJECT: porcelain skin, flawless complexion, symmetrical features, doll-like appearance, mannequin face, synthetic smoothness, video game character, animated look, plastic appearance, wax figure, beauty filter, Instagram filter, FaceTune, professional retouching, airbrushing. MANDATORY: visible skin pores, natural skin texture, minor blemishes, subtle asymmetry, real human imperfections, natural skin tone variation, authentic facial structure. This is a REAL PERSON captured with a smartphone camera, not a computer-generated image.
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
            modelReferenceLockAccessories,
            personDetails,
            contentStyle,
            creationIntent,
            ugcRealModeActive
        } = options;

        // Skip if no person or product-only mode
        if (!personIncluded || contentStyle === 'product') {
            return '';
        }

        // CRITICAL: Use centralized helper to check UGC mode
        // Automatically excludes UGC if Ritual Mode or Formulation Story are active
        const isUgcMode = isUgcModeActive(options);
        
        const parts: string[] = [];
        const age = personDetails?.age || 30;
        const ageGroupLabel = age >= 75 ? 'elder' : 'adult';
        const personCount = options.personCount;
        const isCouple = personCount === 'couple';
        const primarySubjectNoun = personCount && personCount !== 'single' ? 'PRIMARY SUBJECT' : 'Subject';
        const primaryHairColorSpecified = Boolean(personDetails?.hairColor);

        // ====================================================================
        // CRITICAL: ANTI-DOLL CONSTRAINT (ALWAYS FIRST - ALL MODES)
        // ====================================================================
        // Apply anti-doll protection in ALL modes when person is included
        // Prevents CGI/synthetic/porcelain appearance in both UGC and Lifestyle modes
        parts.push(ANTI_DOLL_CONSTRAINT);
        parts.push(`
SKIN REALISM (CRITICAL - NON-NEGOTIABLE): REAL authentic human skin texture with visible pores, natural surface variation, minor imperfections, uneven tone, natural shadows and highlights, subtle facial asymmetry, natural expression lines. MANDATORY: NO smoothing, NO beauty filter, NO retouching, NO porcelain finish, NO synthetic appearance, NO 3D render look, NO AI-generated perfection, NO doll-like skin, NO CGI smoothness, NO plastic appearance, NO wax figure look, NO video game character. This MUST look like a real person photographed naturally with a smartphone. REJECT any artificial skin perfection. The face must have natural human texture and imperfections visible at all times.
        `.trim().replace(/\s+/g, ' '));

        // ====================================================================
        // MODEL REFERENCE OVERRIDE (highest priority)
        // ====================================================================
        if (hasModelReference) {
            parts.push(`
MODEL REFERENCE OVERRIDE:
Use the uploaded model reference as the single source of truth for appearance.
Do not alter age, gender, ethnicity, facial structure, skin, hair, or expression.
Match the person exactly as shown.
CRITICAL: Preserve the REAL SKIN TEXTURE from the reference. Do not smooth, beautify, or render as CGI/doll-like.
            `.trim().replace(/\s+/g, ' '));

            if (modelReferenceLockAccessories !== false) {
                parts.push(`
ACCESSORY LOCK (NON-NEGOTIABLE):
Preserve all visible accessories exactly as in the reference. Do not add, remove, swap, or restyle any accessories.
If the reference includes any of the following, they MUST remain identical in the final render:
- eyewear (glasses/frames/lenses): same shape, thickness, color, tint, reflections, and fit on the face
- headwear (hat/cap/beanie): same type, color, texture, and placement
- head covering (scarf/bandana/headscarf): same coverage, pattern, fabric, and placement
- jewelry (earrings/necklace): keep if present; do not invent if absent
Do NOT remove glasses. Do NOT change frames. Do NOT remove or change head coverings. Do NOT hallucinate new accessories.
                `.trim().replace(/\s+/g, ' '));
            }
        } else {
            // ================================================================
            // AGE ANCHOR (CRITICAL - PREVENTS YOUTHFUL RENDERING)
            // ================================================================
            // PROBLEM: Model defaults to ages 20-35 unless explicitly constrained
            // SOLUTION: Strong age anchors for ALL age ranges with visible markers
            
            if (age >= 70) {
                parts.push(`
AGE ANCHOR (CRITICAL): ${primarySubjectNoun} MUST visually read as EXACTLY ${age} years old - NOT younger.
Facial structure, skin laxity, eye area, neck, hands, and posture must match a real ${age}-year-old ${ageGroupLabel}.
MANDATORY visible age markers: deep forehead lines, pronounced crow's feet, marionette lines, jowls, loose neck skin, age spots on hands/face, thinning eyebrows.
ABSOLUTELY NO youthful features, smooth skin, tight jawline, or any appearance under 65 years old.
                `.trim().replace(/\s+/g, ' '));
            } else if (age >= 60 && age < 70) {
                parts.push(`
AGE ANCHOR (CRITICAL): ${primarySubjectNoun} MUST visually read as EXACTLY ${age} years old - NOT younger, NOT like someone in their 40s or 50s.
MANDATORY visible age markers for someone in their 60s: visible forehead lines, crow's feet, smile lines (nasolabial folds), mild under-eye hollows, slight skin laxity around jaw/neck, age spots beginning to appear on hands.
Hands and neck MUST show age-appropriate texture: fine lines, subtle age spots, visible tendons/veins, looser skin texture.
REJECT: youthful skin, tight jawline, smooth forehead, or any appearance that reads as 40s-50s. This person is in their 60s and must look it.
                `.trim().replace(/\s+/g, ' '));
            } else if (age >= 50 && age < 60) {
                parts.push(`
AGE ANCHOR (CRITICAL): ${primarySubjectNoun} MUST visually read as EXACTLY ${age} years old - NOT younger, NOT like someone in their 30s or 40s.
MANDATORY visible age markers for someone in their 50s: moderate forehead lines, crow's feet, smile lines (nasolabial folds), beginning of under-eye bags, slight softening of jawline, mature facial structure with visible aging.
Skin texture must show age: NO smooth 20s/30s skin, NO tight youthful appearance, NO "anti-aging filter" look.
REJECT: youthful teen/20s/30s appearance, smooth skin, tight features. This person is in their 50s and must show visible aging.
                `.trim().replace(/\s+/g, ' '));
            } else if (age >= 45 && age < 50) {
                parts.push(`
AGE ANCHOR (CRITICAL): ${primarySubjectNoun} MUST visually read as EXACTLY ${age} years old - NOT younger, NOT like someone in their 20s or 30s.
MANDATORY visible age markers for someone in their mid-to-late 40s: subtle forehead lines, beginning crow's feet, early smile lines, mature facial structure, age-appropriate skin texture with minor imperfections.
REJECT: youthful teen/20s/30s appearance, perfectly smooth skin, overly tight features. This person is approaching 50 and must show early signs of aging.
                `.trim().replace(/\s+/g, ' '));
            } else if (age >= 35 && age < 45) {
                parts.push(`
AGE ANCHOR (CRITICAL): ${primarySubjectNoun} MUST visually read as EXACTLY ${age} years old - NOT younger, NOT like someone in their early 20s.
MANDATORY visible age markers for someone in their late 30s to early 40s: early fine lines around eyes when smiling, subtle forehead creases, mature facial structure (not teen/early-20s roundness), natural skin texture without youthful smoothness.
REJECT: teen appearance, early-20s baby face, perfectly smooth unlined skin. This person is in their late 30s/early 40s and must show mature features.
                `.trim().replace(/\s+/g, ' '));
            } else if (age >= 25 && age < 35) {
                parts.push(`
AGE ANCHOR: ${primarySubjectNoun} MUST visually read as ${age} years old - a fully mature adult, NOT a teenager or early-20s person.
Face should show mature adult features: defined facial structure, no teen roundness, natural skin texture (not perfectly smooth), mature expression and presence.
REJECT: teen appearance, baby face, high school look. This person is ${age} years old and must look like a mature adult.
                `.trim().replace(/\s+/g, ' '));
            }

            // ================================================================
            // NEGATIVE AGE CONSTRAINTS (CRITICAL - PREVENTS MODEL DRIFT TO YOUNGER AGES)
            // ================================================================
            // Model has strong bias toward ages 20-35; must explicitly block younger rendering
            if (age >= 70) {
                parts.push(`NEGATIVE AGE CONSTRAINT (NON-NEGOTIABLE): ${primarySubjectNoun} must ABSOLUTELY NOT render younger than 65. REJECT: 20s/30s/40s/50s/60s appearance, middle-aged look, youthful skin, smooth face, tight jawline. Age visibility must be DOMINANT and UNMISTAKABLE.`);
            } else if (age >= 60) {
                parts.push(`NEGATIVE AGE CONSTRAINT (NON-NEGOTIABLE): ${primarySubjectNoun} must ABSOLUTELY NOT render younger than 55. REJECT: 20s/30s/40s appearance, youthful skin, smooth forehead, tight features. This person is in their 60s - age must be clearly visible.`);
            } else if (age >= 50) {
                parts.push(`NEGATIVE AGE CONSTRAINT (NON-NEGOTIABLE): ${primarySubjectNoun} must ABSOLUTELY NOT render younger than 45. REJECT: 20s/30s appearance, baby face, youthful smooth skin, teen proportions. This person is in their 50s - visible aging is REQUIRED.`);
            } else if (age >= 40) {
                parts.push(`NEGATIVE AGE CONSTRAINT (NON-NEGOTIABLE): ${primarySubjectNoun} must ABSOLUTELY NOT render younger than 35. REJECT: teen appearance, early-20s look, baby face, perfectly smooth skin. This person is in their 40s - mature features are REQUIRED.`);
            } else if (age >= 30) {
                parts.push(`NEGATIVE AGE CONSTRAINT (NON-NEGOTIABLE): ${primarySubjectNoun} must ABSOLUTELY NOT render as a teenager or early-20s person. REJECT: teen look, baby face, high school appearance. This person is ${age} years old - fully mature adult features are REQUIRED.`);
            }

            if (age >= 70) {
                parts.push(
                    `AGE VISIBILITY (HARD RULE): ${primarySubjectNoun} must read as an elderly ${age}-year-old at a glance. If ambiguous, err older—never younger.`
                );
            }

            // ================================================================
            // ELDER REALISM (for 75+)
            // ================================================================
            if (age >= 75) {
                parts.push(`
ELDER REALISM (${primarySubjectNoun}): Deep crow's feet, softened jawline, gentle jowls, age spots on face and hands.
Hands show visible veins and knuckle definition.
Skin carries micro wrinkles around mouth, eyes, and neck with authentic sag.
${primaryHairColorSpecified ? 'Hair color may be dyed; keep the explicitly selected hair color while preserving elder realism.' : 'Hair may skew gray/silver/white with thinning and irregular texture unless explicitly specified.'}
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

                const bodyTypeKey = String(personDetails.bodyType).trim().toLowerCase();
                const physiqueAnchor =
                    bodyTypeKey === 'slim'
                        ? 'PHYSIQUE DETAILS: Slim figure. Narrow waist and shoulders, lean arms and neck. Face is not round or full.'
                        : bodyTypeKey === 'curvy'
                            ? 'PHYSIQUE DETAILS: Curvy figure. Noticeable hip/waist curve, fuller thighs/arms. Face has gentle softness.'
                            : bodyTypeKey === 'plus size' || bodyTypeKey === 'plus-size' || bodyTypeKey === 'plus'
                                ? 'PHYSIQUE DETAILS: Plus-size figure. Fuller midsection and arms, thicker neck, softer jawline, fuller cheeks. Do NOT render a thin frame.'
                                : 'PHYSIQUE DETAILS: Average figure. Balanced proportions, neither extremely thin nor plus-size.';
                parts.push(physiqueAnchor);
            }

            // Skin Tone
            if (personDetails?.skinTone) {
                identityParts.push(sanitizePart(personDetails.skinTone, isUgcMode));
            }

            // Skin Realism (UGC override)
            if (isUgcMode) {
                identityParts.push('real subject appearance, everyday skin texture, natural asymmetry, no retouching');
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
            // DIVERSITY RANDOMIZATION (V2: Prevent AI Clone Syndrome)
            // ================================================================
            // Create unique seed for each generation to prevent repetitive faces
            const diversitySeed = createDiversitySeed(
                options.userId || 'user',
                options.timestamp || Date.now()
            );
            const randomizer = new DiversityRandomizer(diversitySeed);

            // ALWAYS randomize facial structure (user has no control over this)
            const facialStructure = randomizer.getFacialStructure();
            parts.push(`FACIAL STRUCTURE: ${facialStructure}`);

            // CAMERA ANGLE RANDOMIZATION: ONLY in UGC mode AND only if NOT already specified
            // Lifestyle mode uses professional camera setup from canonicalScene.ts
            // SKIP if Raw Domestic UGC is active (it has its own camera control)
            // SKIP if user explicitly selected a camera angle (respect user choice)
            const hasRawUgcCameraControl = Boolean(options.rawDomesticUgcActive);
            const userSpecifiedCameraAngle = Boolean(options.cameraAngle && options.cameraAngle.trim());
            if (isUgcMode && !hasRawUgcCameraControl && !userSpecifiedCameraAngle) {
                const cameraAngle = randomizer.getCameraAngle();
                parts.push(`CAMERA ANGLE: ${cameraAngle}`);
            }

            // ALWAYS randomize skin texture (prevents "porcelain doll" look)
            const skinTexture = randomizer.getSkinTexture();
            if (skinTexture) {
                parts.push(`SKIN TEXTURE: ${skinTexture}`);
            }

            // ALWAYS randomize hair styling (prevents "salon perfect" hair)
            const hairStyling = randomizer.getHairStyling();
            parts.push(`HAIR STYLING: ${hairStyling}`);

            // ALWAYS randomize overall appearance (authentically messy UGC vibe)
            if (isUgcMode) {
                const overallAppearance = randomizer.getOverallAppearance();
                parts.push(`OVERALL VIBE: ${overallAppearance}`);
            }

            // Randomize accessories only if not locked by model reference
            if (!hasModelReference) {
                const accessories = randomizer.getAccessories();
                if (accessories && accessories !== 'no visible accessories or jewelry') {
                    parts.push(`ACCESSORIES: ${accessories}`);
                }
            }

            // ALWAYS randomize clothing in UGC mode (even if user specified wardrobe)
            // User wardrobe becomes a "style direction" but we still add random variation
            // ONLY if user did NOT specify custom clothes (respect custom clothes completely)
            const hasCustomClothes = Boolean(options.customClothes && options.customClothes.enabled);
            if (isUgcMode && !hasCustomClothes) {
                const clothing = randomizer.getClothing();
                if (options.wardrobeStyle && options.wardrobeStyle.trim()) {
                    // User specified wardrobe: blend it with random casual clothing
                    parts.push(`CLOTHING BASE: ${sanitizePart(options.wardrobeStyle, isUgcMode)}, but ${clothing.toLowerCase()}`);
                } else {
                    // No user wardrobe: fully random
                    parts.push(`CLOTHING: ${clothing}`);
                }
            }

            // Randomize facial hair (for male/masculine presentations)
            const gender = (personDetails?.gender || '').toLowerCase();
            const isMasculinePresentation = 
                gender.includes('male') && !gender.includes('female');
            
            if (isMasculinePresentation && age >= 18 && age < 75) {
                const facialHair = randomizer.getFacialHair();
                parts.push(`FACIAL HAIR: ${facialHair}`);
            }

            // Randomize ethnicity ONLY when "Non-specific" was selected
            if (personDetails?.ethnicity === 'Non-specific') {
                const randomEthnicity = randomizer.getRandomEthnicity();
                parts.push(`ETHNICITY VARIATION: ${randomEthnicity} (unique per generation)`);
            }

            // UGC MODE: Lighting and Environment Randomization
            // UGC disables environment by default (authentic casual anywhere)
            // But user can optionally select a specific environment if needed
            if (isUgcMode) {
                const lighting = randomizer.getLightingEnvironment();
                parts.push(`LIGHTING: ${lighting}`);
                
                // Check if user explicitly selected an environment
                const customEnv = (options as any).customEnvironment;
                const hasUserEnvironment = Boolean(
                    (options.setting && options.setting.trim()) ||
                    (options.sceneEnvironment && options.sceneEnvironment.trim()) ||
                    (customEnv && String(customEnv).trim())
                );
                
                if (hasUserEnvironment) {
                    // User selected environment → use it but add random micro-location details
                    const backgroundElements = randomizer.getBackgroundElements();
                    parts.push(`ENVIRONMENT DETAILS: ${backgroundElements}`);
                } else {
                    // No user environment → fully randomize location (bedroom, bathroom, kitchen, etc.)
                    const backgroundElements = randomizer.getBackgroundElements();
                    parts.push(`ENVIRONMENT: ${backgroundElements}`);
                }
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
            const secondaryAgeDerived = Boolean((options as any).secondaryAgeDerived);

            if (personCount === 'couple') {
                const secondaryAge =
                    typeof (secondaryPersonDetails as any)?.age === 'number' &&
                        Number.isFinite((secondaryPersonDetails as any).age)
                        ? Number((secondaryPersonDetails as any).age)
                        : null;
                const secondaryHairColorSpecified = Boolean(secondaryPersonDetails?.hairColor);

                const sexText =
                    coupleSex === 'same'
                        ? 'same-gender couple'
                        : coupleSex === 'different'
                            ? 'mixed-gender couple'
                            : 'couple';
                parts.push(`Two subjects in frame: ${sexText}. Both must look like real distinct individuals.`);
                const coupleStaging = String((options as any).coupleStaging ?? '').trim();
                if (coupleStaging) {
                    parts.push(
                        sanitizePart(
                            `COUPLE STAGING: ${coupleStaging}. Both subjects must be clearly visible in-frame. Avoid a secondary subject that is blurred, out-of-focus, or treated like a meaningless background extra.`,
                            isUgcMode
                        )
                    );
                } else {
                    parts.push(
                        sanitizePart(
                            'COUPLE STAGING: Both subjects appear intentionally in-frame, positioned so they both read clearly and naturally. Avoid a secondary subject that is blurred or hidden in the background.',
                            isUgcMode
                        )
                    );
                }

                if (typeof secondaryAge === 'number') {
                    parts.push(
                        secondaryAgeDerived
                            ? `AGE COHERENCE (COUPLE): PRIMARY SUBJECT must read as ${age}. SECONDARY SUBJECT must read as ${secondaryAge}. Keep the age difference subtle and realistic (2–6 years; never more than 8). Never render teen + adult mismatch.`
                            : `AGE LOCK (COUPLE): PRIMARY SUBJECT must read as ${age}. SECONDARY SUBJECT must read as ${secondaryAge}. Respect these ages exactly as selected, even if the age gap is large. Never render teen + adult mismatch.`
                    );

                    const secondaryAgeGroupLabel = secondaryAge >= 75 ? 'elder' : 'adult';
                    if (secondaryAge >= 70) {
                        parts.push(
                            `SECONDARY AGE ANCHOR: SECONDARY SUBJECT MUST visually read as ${secondaryAge} years old. Facial structure, skin laxity, eye area, neck, hands, and posture must match a real ${secondaryAge}-year-old ${secondaryAgeGroupLabel}. Do NOT make the secondary subject appear younger. AGE VISIBILITY: must read clearly as elderly; if ambiguous, err older.`
                        );
                    } else if (secondaryAge >= 60) {
                        parts.push(
                            `SECONDARY AGE ANCHOR: SECONDARY SUBJECT MUST visually read as ${secondaryAge} years old. Include visible forehead lines, crow's feet, smile lines, mild under-eye hollows, and slight skin laxity around jaw/neck. Do NOT beautify or rejuvenate the secondary subject.`
                        );
                    } else if (secondaryAge >= 45) {
                        parts.push(
                            `SECONDARY AGE ANCHOR: SECONDARY SUBJECT MUST visually read as ${secondaryAge} years old. Avoid a youthful teen/20s appearance; include age-appropriate skin texture and subtle facial lines.`
                        );
                    }

                    if (secondaryAge >= 55) {
                        const secondaryNegativeAgeBand =
                            secondaryAge >= 70
                                ? 'no 20s/30s/40s/50s/60s appearance, no middle-aged look, no youthful skin'
                                : 'no 20s/30s/40s face, no youthful skin';
                        parts.push(`SECONDARY NEGATIVE AGE CONSTRAINT: SECONDARY SUBJECT must NOT render younger (${secondaryNegativeAgeBand}). Age visibility must remain dominant.`);
                    }

                    if (secondaryAge >= 75) {
                        parts.push(
                            `ELDER REALISM (SECONDARY SUBJECT): Deep crow's feet, softened jawline, gentle jowls, age spots on face and hands. Hands show visible veins and knuckle definition. Skin carries micro wrinkles around mouth, eyes, and neck with authentic sag. ${secondaryHairColorSpecified
                                ? 'Do not override explicitly selected hair color.'
                                : 'Hair skews gray/silver/white with thinning and irregular texture unless explicitly specified.'
                            }`
                        );
                    }
                }

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
                    if (typeof (secondaryPersonDetails as any).age === 'number') {
                        secondaryBits.push(`${(secondaryPersonDetails as any).age}-year-old adult`);
                    }
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

            if (personCount === 'group') {
                parts.push(
                    sanitizePart(
                        'GROUP MODE: 3–5 subjects in frame. Person A follows the selected identity controls. All additional people must be distinct real individuals (no cloned faces), derived automatically with coherent style and minor natural variation. All faces must be clearly visible and not blurred into the background. Only ONE person interacts actively with the product; others remain supportive and passive.',
                        isUgcMode
                    )
                );
            }

            if (identityMode === 'auto' && identityVariationToken) {
                parts.push(`[IDENTITY_VARIATION_TOKEN: ${identityVariationToken}]`);
                if (personCount === 'couple') {
                    parts.push(`FACE SIGNATURE A: ${this.buildFaceSignature(`${identityVariationToken}-A`)}`);
                    parts.push(`FACE SIGNATURE B: ${this.buildFaceSignature(`${identityVariationToken}-B`)}`);
                } else if (personCount === 'group') {
                    parts.push(`FACE SIGNATURE A: ${this.buildFaceSignature(`${identityVariationToken}-A`)}`);
                    parts.push(`FACE SIGNATURE B: ${this.buildFaceSignature(`${identityVariationToken}-B`)}`);
                    parts.push(`FACE SIGNATURE C: ${this.buildFaceSignature(`${identityVariationToken}-C`)}`);
                    parts.push(`FACE SIGNATURE D: ${this.buildFaceSignature(`${identityVariationToken}-D`)}`);
                } else {
                    parts.push(`FACE SIGNATURE: ${this.buildFaceSignature(identityVariationToken)}`);
                }
                parts.push('This must be a different individual than any previously generated subject. Do not repeat facial identity.');
            } else if (identityMode === 'locked' && identityKey) {
                parts.push(`[IDENTITY_KEY: ${identityKey}]`);
                if (personCount === 'couple') {
                    parts.push(`FACE SIGNATURE A: ${this.buildFaceSignature(`${identityKey}-A`)}`);
                    parts.push(`FACE SIGNATURE B: ${this.buildFaceSignature(`${identityKey}-B`)}`);
                } else if (personCount === 'group') {
                    parts.push(`FACE SIGNATURE A: ${this.buildFaceSignature(`${identityKey}-A`)}`);
                    parts.push(`FACE SIGNATURE B: ${this.buildFaceSignature(`${identityKey}-B`)}`);
                    parts.push(`FACE SIGNATURE C: ${this.buildFaceSignature(`${identityKey}-C`)}`);
                    parts.push(`FACE SIGNATURE D: ${this.buildFaceSignature(`${identityKey}-D`)}`);
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
            const eyeDirection = String(personDetails.eyeDirection);
            const isCouple = options.personCount === 'couple';
            const isGroup = options.personCount === 'group';

            if (isCouple) {
                if (eyeDirection === 'Looking at camera') {
                    parts.push(
                        sanitizePart(
                            'EYE DIRECTION (COUPLE): Only ONE subject may look at the camera. The other must look at the product or look away naturally. Never both looking at camera.',
                            isUgcMode
                        )
                    );
                } else if (eyeDirection === 'Looking at product') {
                    parts.push(
                        sanitizePart(
                            'EYE DIRECTION (COUPLE): Both subjects look at the product OR one looks at the product while the other looks at the first subject. Shared moment, not posed.',
                            isUgcMode
                        )
                    );
                } else if (eyeDirection === 'Looking away naturally') {
                    parts.push(
                        sanitizePart(
                            'EYE DIRECTION (COUPLE): Both subjects look away casually OR one looks away while the other looks at the product. Avoid direct eye contact between both subjects unless explicitly requested.',
                            isUgcMode
                        )
                    );
                } else {
                    parts.push(sanitizePart(String(eyeDirection), isUgcMode));
                }
            } else if (isGroup) {
                if (eyeDirection === 'Looking at camera') {
                    parts.push(
                        sanitizePart(
                            'EYE DIRECTION (GROUP): Only one or two subjects may look at the camera. The others must look at the product or look away naturally. Avoid everyone staring at camera at once.',
                            isUgcMode
                        )
                    );
                } else if (eyeDirection === 'Looking at product') {
                    parts.push(
                        sanitizePart(
                            'EYE DIRECTION (GROUP): Most subjects look at the product OR share attention naturally between the product and each other. Keep it candid, not posed.',
                            isUgcMode
                        )
                    );
                } else if (eyeDirection === 'Looking away naturally') {
                    parts.push(
                        sanitizePart(
                            'EYE DIRECTION (GROUP): Most subjects look away casually with natural variation. Some may glance at the product. Avoid everyone synchronizing in the same direction.',
                            isUgcMode
                        )
                    );
                } else {
                    parts.push(sanitizePart(String(eyeDirection), isUgcMode));
                }
            } else {
                const eyeMap: Record<string, string> = {
                    'Looking at camera': 'eyes directed at camera with focused gaze',
                    'Looking at product': 'eyes directed toward product with attentive focus',
                    'Looking away naturally': 'eyes off-camera at natural angle, candid gaze',
                };
                parts.push(sanitizePart(eyeMap[eyeDirection] || eyeDirection, isUgcMode));
            }
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
                'low-angle',
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

        // Anti-doll constraint for ALL modes with people (not just UGC)
        // This prevents CGI/doll-like faces in Lifestyle and Brand content too
        // Previously only applied to UGC mode, causing doll-face in Lifestyle
        parts.push(ANTI_DOLL_CONSTRAINT);

        const result = parts.filter(Boolean).join('. ').trim();
        console.log('[IDENTITY BUILDER OUTPUT]', result.substring(0, 200) + '...');
        return result;
    }
}
