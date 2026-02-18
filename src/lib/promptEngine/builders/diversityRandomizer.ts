/**
 * DIVERSITY RANDOMIZER FOR UGC/LIFESTYLE
 * Generates unique human variations to prevent "AI Clone Syndrome"
 * 
 * PROBLEM: 1000 users = 1000 similar faces (symmetrical, front-facing, generic ethnicity)
 * SOLUTION: Inject controlled randomness in facial structure, angles, accessories, clothing
 */

// ============================================================================
// FACIAL DIVERSITY POOLS
// ============================================================================

export const FACE_SHAPES = [
    'oval face',
    'round face',
    'square face',
    'heart-shaped face',
    'long rectangular face',
    'diamond-shaped face',
    'triangular face',
    'oblong face'
];

export const JAW_LINES = [
    'soft rounded jawline',
    'defined angular jawline',
    'strong square jawline',
    'tapered V-shaped jawline',
    'broad jaw',
    'narrow delicate jaw',
    'slightly asymmetric jaw'
];

export const CHEEKBONES = [
    'subtle flat cheekbones',
    'high prominent cheekbones',
    'sharp defined cheekbones',
    'soft rounded cheeks',
    'hollow cheeks',
    'full cheeks'
];

export const EYE_SHAPES = [
    'almond-shaped eyes',
    'round eyes',
    'deep-set eyes',
    'wide-set eyes',
    'close-set eyes',
    'hooded eyelids',
    'upturned eyes',
    'downturned eyes',
    'monolid eyes'
];

export const BROW_SHAPES = [
    'straight brows',
    'arched brows',
    'thick bushy brows',
    'thin brows',
    'soft natural brows',
    'angular brows',
    'low-set brows'
];

export const NOSE_TYPES = [
    'straight nose bridge',
    'slightly curved nose bridge',
    'prominent nose bridge',
    'button nose',
    'wide nose',
    'narrow nose',
    'aquiline nose',
    'upturned nose',
    'flat nose bridge'
];

export const LIP_TYPES = [
    'thin lips',
    'full lips',
    'wide mouth',
    'narrow mouth',
    'defined cupid\'s bow',
    'asymmetric lips',
    'small mouth'
];

export const FOREHEAD_TYPES = [
    'low forehead',
    'average forehead',
    'high forehead',
    'prominent forehead'
];

export const HAIRLINES = [
    'straight hairline',
    'widow\'s peak hairline',
    'rounded hairline',
    'slightly receding hairline',
    'uneven hairline',
    'M-shaped hairline'
];

// ============================================================================
// ETHNICITY DIVERSITY (for "Non-specific" selection)
// ============================================================================

export const ETHNICITY_POOL = [
    'Mediterranean descent',
    'Northern European descent',
    'Eastern European descent',
    'Southeast Asian descent',
    'East Asian descent',
    'South Asian descent',
    'West African descent',
    'North African descent',
    'Caribbean descent',
    'Latin American descent',
    'Middle Eastern descent',
    'Mixed heritage (Asian-European)',
    'Mixed heritage (African-European)',
    'Mixed heritage (Latin-Asian)',
    'Polynesian descent'
];

// ============================================================================
// CAMERA ANGLE DIVERSITY (EXAGGERATED & AWKWARD for authentic UGC)
// ============================================================================
// Based on real UGC examples: unflattering angles, accidental tilts, bad framing

export const CAMERA_ANGLES = [
    'extreme low angle, phone held below chin pointing up (double chin visible)',
    'extreme high angle, phone held way above head looking down',
    'awkward side angle, arm extended to the side with off-center framing',
    'Dutch angle, phone tilted 15-25 degrees (obvious accidental tilt)',
    'too-close selfie, face cropped awkwardly at forehead',
    'arm-extended mirror selfie, phone partially covering face',
    'propped phone on surface, slightly too low angle looking up',
    'one-handed selfie with visible phone wobble in framing',
    'sitting down holding phone at chest level pointing up',
    'lying down angle, face from above with pillow/bed visible',
    'bathroom counter selfie, phone leaning against mirror',
    'car selfie, awkward arm reach with steering wheel visible',
    'under-chin angle showing nostrils and unflattering neck',
    'extreme side profile, only 60% of face visible in frame',
    'looking down at phone, top of head prominent in frame'
];

// ============================================================================
// ACCESSORY RANDOMIZATION (minimal, casual, everyday items)
// ============================================================================

export const ACCESSORY_SETS = [
    'no visible accessories or jewelry',
    'basic stud earrings, dull metal',
    'small hoop earrings, tarnished',
    'multiple cheap ear piercings',
    'simple chain necklace, worn daily',
    'old glasses with smudges on lenses',
    'nose ring, basic stud',
    'eyebrow piercing, simple',
    'hair scrunchie on wrist',
    'plastic hair claw clip holding hair',
    'phone case visible in background',
    'old smartwatch or fitness tracker',
    'no makeup, completely bare face'
];

// ============================================================================
// OVERALL CASUAL APPEARANCE (authentically messy, ungroomed look)
// ============================================================================

export const OVERALL_APPEARANCE = [
    'just woke up, visibly tired with pillow marks on face',
    'mid-day casual, slightly disheveled',
    'end of day exhausted, makeup smudged or faded',
    'post-workout sweaty with hair stuck to forehead',
    'lounging at home, maximum comfort mode',
    'sick day appearance, pale and tired',
    'late night vibe, puffy eyes and messy hair',
    'no-effort Sunday look, completely natural',
    'working from home casual, top half only presentable',
    'rushed morning, forgot to brush hair',
    'lazy weekend energy, hasn\'t showered yet',
    'casual and unkempt, zero grooming'
];

// ============================================================================
// LIGHTING & ENVIRONMENT (bad lighting, cluttered backgrounds)
// ============================================================================

export const LIGHTING_ENVIRONMENT = [
    'harsh overhead bedroom light, yellow tint',
    'dim natural light through window, underexposed',
    'bright bathroom lighting, washed out skin',
    'mixed lighting, warm and cool tones clashing',
    'single lamp lighting, one side of face darker',
    'phone flashlight visible in mirror reflection',
    'backlit from window, face slightly shadowed',
    'fluorescent kitchen lighting, greenish cast',
    'evening mood lighting, amber/orange glow',
    'ring light visible in glasses reflection',
    'natural daylight but overcast, flat lighting',
    'nighttime with bedside lamp, very warm tone'
];

// ============================================================================
// BACKGROUND ELEMENTS (messy, casual home environment)
// ============================================================================

export const BACKGROUND_ELEMENTS = [
    'unmade bed visible in background',
    'clothes pile on chair or floor',
    'bathroom mirror with toothpaste spots',
    'cluttered nightstand with random items',
    'kitchen counter with dishes in sink',
    'bedroom wall with posters or photos',
    'blurry TV or laptop screen in background',
    'laundry basket visible',
    'pet bed or cat tower in corner',
    'bookshelf with messy arrangement',
    'closet partially open with clothes visible',
    'window with blinds half open',
    'plain wall, no decoration',
    'car interior (driver seat or passenger)',
    'bathroom shower curtain visible behind'
];

// ============================================================================
// CASUAL UGC WARDROBE (super casual, wrinkled, lived-in)
// ============================================================================

export const CASUAL_WARDROBE = [
    'oversized hoodie, faded and wrinkled',
    'plain t-shirt, clearly slept in',
    'old sweatshirt with stretched neck',
    'flannel shirt, unbuttoned and rumpled',
    'sports bra or tank top, very casual',
    'loose pajama top, worn look',
    'workout clothes, not fresh',
    'old band t-shirt, faded logo',
    'zip-up hoodie, half zipped',
    'baggy t-shirt with stains',
    'worn thermal long sleeve',
    'robe or loungewear visible',
    'no bra visible under loose shirt',
    'hair tie on wrist, casual athleisure'
];

// ============================================================================
// SKIN TEXTURE DIVERSITY (real unfiltered skin, visible imperfections)
// ============================================================================

export const SKIN_TEXTURE_VARIATIONS = [
    'visible large pores on nose, cheeks, and forehead',
    'active breakouts, small pimples on chin and forehead',
    'old acne scars, textured skin',
    'freckles and sun spots across nose and cheeks',
    'uneven skin tone, redness around nose',
    'dark circles under eyes, tired look',
    'oily T-zone with visible shine',
    'dry flaky patches on cheeks',
    'visible mole or beauty mark',
    'slight facial redness, natural blush',
    'under-eye bags, realistic',
    'forehead lines visible even at rest'
];

// ============================================================================
// FACIAL HAIR RANDOMIZATION (for male/masculine presentations)
// ============================================================================

export const FACIAL_HAIR_OPTIONS = [
    'clean shaven',
    'light stubble (1-2 days growth)',
    'short beard, natural',
    'full beard, trimmed',
    'goatee, casual',
    'mustache only',
    'patchy facial hair, uneven',
    '5 o\'clock shadow'
];

// ============================================================================
// HAIR STYLING RANDOMIZATION (messy, undone, no-effort look)
// ============================================================================

export const HAIR_STYLING = [
    'completely unstyled, natural bedhead',
    'greasy unwashed hair, slicked look',
    'messy bun, falling apart',
    'half-up ponytail, very loose and casual',
    'tucked behind ears, oily roots visible',
    'side part, frizzy and unkempt',
    'center part with visible roots (different color)',
    'hair clips holding hair back, messy',
    'pulled back in loose low ponytail',
    'air-dried with no product, frizz everywhere',
    'tangled ends, needs brushing',
    'hat hair, flattened on one side'
];

// ============================================================================
// SEEDED RANDOMIZER (deterministic but unique per user/session)
// ============================================================================

export class DiversityRandomizer {
    private seed: number;

    constructor(seedString: string) {
        // FNV-1a hash for deterministic randomization
        let hash = 0x811c9dc5;
        for (let i = 0; i < seedString.length; i++) {
            hash ^= seedString.charCodeAt(i);
            hash = Math.imul(hash, 0x01000193);
        }
        this.seed = hash >>> 0;
    }

    private pick<T>(array: T[], offset: number = 0): T {
        const index = (this.seed + offset) % array.length;
        return array[index];
    }

    private shouldInclude(probability: number, offset: number = 0): boolean {
        const threshold = ((this.seed + offset) % 100) / 100;
        return threshold < probability;
    }

    // ========================================================================
    // PUBLIC API
    // ========================================================================

    /**
     * Generates a unique facial structure description
     */
    getFacialStructure(): string {
        return [
            this.pick(FACE_SHAPES, 1),
            this.pick(JAW_LINES, 2),
            this.pick(CHEEKBONES, 3),
            this.pick(EYE_SHAPES, 4),
            this.pick(BROW_SHAPES, 5),
            this.pick(NOSE_TYPES, 6),
            this.pick(LIP_TYPES, 7),
            this.pick(FOREHEAD_TYPES, 8),
            this.pick(HAIRLINES, 9)
        ].join(', ');
    }

    /**
     * Returns a random camera angle (prevents front-facing repetition)
     */
    getCameraAngle(): string {
        return this.pick(CAMERA_ANGLES, 10);
    }

    /**
     * Returns random accessories (50% chance to include)
     */
    getAccessories(): string | null {
        if (this.shouldInclude(0.5, 11)) {
            return this.pick(ACCESSORY_SETS, 12);
        }
        return null;
    }

    /**
     * Returns random clothing choice
     */
    getClothing(): string {
        return this.pick(CASUAL_WARDROBE, 13);
    }

    /**
     * Returns skin texture variation (70% chance to include for realism)
     */
    getSkinTexture(): string | null {
        if (this.shouldInclude(0.7, 14)) {
            return this.pick(SKIN_TEXTURE_VARIATIONS, 15);
        }
        return null;
    }

    /**
     * Returns facial hair option (for male presentations)
     */
    getFacialHair(): string {
        return this.pick(FACIAL_HAIR_OPTIONS, 16);
    }

    /**
     * Returns hair styling variation
     */
    getHairStyling(): string {
        return this.pick(HAIR_STYLING, 17);
    }

    /**
     * Returns overall casual appearance (messy, ungroomed look)
     */
    getOverallAppearance(): string {
        return this.pick(OVERALL_APPEARANCE, 18);
    }

    /**
     * Returns lighting and environment for authentic UGC
     */
    getLightingEnvironment(): string {
        return this.pick(LIGHTING_ENVIRONMENT, 20);
    }

    /**
     * Returns casual background elements
     */
    getBackgroundElements(): string {
        return this.pick(BACKGROUND_ELEMENTS, 21);
    }

    /**
     * Returns a random ethnicity (when user selects "Non-specific")
     */
    getRandomEthnicity(): string {
        return this.pick(ETHNICITY_POOL, 19);
    }

    /**
     * Generates a complete random person descriptor
     */
    getFullRandomPerson(options?: {
        includeEthnicity?: boolean;
        includeFacialHair?: boolean;
        includeAccessories?: boolean;
    }): string {
        const parts: string[] = [];

        // Facial structure
        parts.push(this.getFacialStructure());

        // Camera angle
        parts.push(`Shot from: ${this.getCameraAngle()}`);

        // Ethnicity (if requested)
        if (options?.includeEthnicity) {
            parts.push(this.getRandomEthnicity());
        }

        // Skin texture
        const skinTexture = this.getSkinTexture();
        if (skinTexture) {
            parts.push(skinTexture);
        }

        // Facial hair (if requested)
        if (options?.includeFacialHair) {
            parts.push(this.getFacialHair());
        }

        // Accessories
        if (options?.includeAccessories) {
            const accessories = this.getAccessories();
            if (accessories) {
                parts.push(accessories);
            }
        }

        // Hair styling
        parts.push(`Hair: ${this.getHairStyling()}`);

        // Clothing
        parts.push(`Wearing: ${this.getClothing()}`);

        return parts.join('. ');
    }
}

// ============================================================================
// HELPER: Generate seed from user context
// ============================================================================

/**
 * Creates a unique seed from userId + timestamp + randomComponent
 * Ensures every generation is unique even for the same user
 */
export function createDiversitySeed(userId?: string, timestamp?: number): string {
    const user = userId || 'anonymous';
    const time = timestamp || Date.now();
    const random = Math.random().toString(36).substring(7);
    return `${user}-${time}-${random}`;
}
