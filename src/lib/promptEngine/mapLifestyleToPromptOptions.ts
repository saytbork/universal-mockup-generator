/**
 * Map LifestyleStep3 Scene Builder state to PromptOptions for PromptEngine
 * COMPLETE SEMANTIC INJECTION - All UI controls mapped to physical, observable language
 * 
 * ARCHITECTURE:
 * Step 3 UI → SceneState → mapLifestyleToPromptOptions → PromptEngine → Final Prompt
 * 
 * RULES:
 * - Every control MUST produce observable visual differences
 * - NO abstract adjectives (calm, happy, etc.)
 * - ALL descriptors must be physical, observable, photographic
 * - ALL mappings logged for debugging
 */

import type { ExpertRole, Step3Values, ExpertAttire } from '@/components/LifestyleStep3';
import type { CustomClothes, FormulationStoryOptions, IdentityLock, PromptOptions, UGCRealModeLayerSet } from './types';
import { mapProductModeToPromptOptions } from './mapProductModeToPromptOptions';
import { APPEARANCE_SEMANTIC_MAP } from './semanticMaps/appearance';

// ============================================================================
// SEMANTIC MAPPING TABLES - PHYSICAL, OBSERVABLE LANGUAGE ONLY
// ============================================================================

/**
 * POSE → Physical body position and spatial orientation
 */
const POSE_SEMANTIC_MAP: Record<string, string> = {
    'Relaxed Portrait': 'relaxed upright portrait stance, shoulders natural and level, weight evenly balanced on both feet, spine straight but not rigid',
    'Dynamic Mid-Action': 'dynamic mid-action pose with body in motion, natural momentum visible in limbs, weight shifted to one side',
    'Over-the-Shoulder': 'over-the-shoulder pose with back partially visible to camera, head turned toward lens, one shoulder prominent',
    'Leaned-In Close': 'leaning forward into frame, shoulders pushed forward, upper body closer to camera, intimate proximity to lens',
    'Hands-Only Crop': 'cropped composition showing only hands and forearms, fingers visible in tactile interaction',
    'Face Frame Hero': 'hands positioned near face, fingers framing chin or cheeks, face as central focal point',
    'Grounded Lounge': 'grounded seated or reclined position, body low and relaxed, weight supported by surface',
    'Offer-to-Lens Reach': 'arm extended toward camera lens, product held outward, body leaning slightly forward in offering gesture'
};

const normalizeKey = (value?: string) =>
    value
        ? value
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/-+/g, '-')
        : '';

function buildCustomClothesDescriptor(sceneState: Step3Values): CustomClothes | undefined {
    if (!sceneState.customClothesEnabled) {
        return undefined;
    }

    const fields = {
        garmentType: sceneState.customClothesGarmentType?.trim() || undefined,
        primaryColor: sceneState.customClothesPrimaryColor?.trim() || undefined,
        fit: sceneState.customClothesFit?.trim() || undefined,
        style: sceneState.customClothesStyle?.trim() || undefined,
        material: sceneState.customClothesMaterial?.trim() || undefined,
        customDetail: sceneState.customClothesDetail?.trim() || undefined
    };

    const hasValue = Object.values(fields).some(Boolean);
    return hasValue ? { enabled: true, ...fields } : undefined;
}

const SCENE_ORDER_MESSY_VARIATIONS = [
    'scattered magazines, half-folded laundry, and an open skincare pouch create believable clutter',
    'the countertop holds forgotten coffee mugs, open product caps, and casually draped towels',
    'chairs and stools have jackets tossed over them, with personal items layered across surfaces',
    'makeup brushes, notebooks, and unopened deliveries overlap each other in soft disarray'
];

const SCENE_ORDER_CHAOTIC_VARIATIONS = [
    'multiple surfaces are overwhelmed with stacked products, toppled props, and hurriedly placed bags',
    'drawers are left ajar, blankets spill off seating, and accessories scatter across the floor',
    'there are overlapping clothes, tangled cords, and runaway packaging tumbling into frame',
    'the space shows open suitcases, spilled tote bags, and scattered samples fighting for space'
];

const SCENE_ORDER_RANDOM_VARIATIONS = [
    'a surprising mix of overturned boxes, mismatched decor, and abandoned tripods collide in frame',
    'last-minute props, delivery parcels, and wardrobe pieces collide unpredictably throughout the environment',
    'snacks, cables, notes, and beauty tools are strewn everywhere, hinting at a frantic creative session',
    'the set looks like it was frozen mid-chaos with repositioned lights, stools, and scattered clothing layers'
];

const pickRandomDescriptor = (list: string[]) => list[Math.floor(Math.random() * list.length)];

function buildSceneOrderChaosDescriptor(value?: string): string | null {
    const key = normalizeKey(value);
    if (!key) return null;
    switch (key) {
        case 'clean':
            return 'Every surface is carefully organized, spotless, and staged for a tidy lifestyle set';
        case 'normal':
            return 'The space feels lived-in yet balanced, with light clutter that still reads intentional';
        case 'messy':
            return pickRandomDescriptor(SCENE_ORDER_MESSY_VARIATIONS);
        case 'chaotic':
            return pickRandomDescriptor(SCENE_ORDER_CHAOTIC_VARIATIONS);
        case 'randomized-chaos': {
            const combined = [
                ...SCENE_ORDER_MESSY_VARIATIONS,
                ...SCENE_ORDER_CHAOTIC_VARIATIONS,
                ...SCENE_ORDER_RANDOM_VARIATIONS
            ];
            return pickRandomDescriptor(combined);
        }
        default:
            return null;
    }
}

function mapSkinRealism(value?: string): string | null {
    switch (normalizeKey(value)) {
        case 'raw':
        case 'raw-real':
        case 'rawreal':
            return 'raw, unretouched skin with gentle natural variation and minimal emphasis on pores';
        case 'natural':
            return 'natural, believable skin texture with subtle variation, no plastic look';
        case 'soft-retouch':
        case 'softretouch':
            return 'lightly retouched skin with minimal smoothing, still realistic and human';
        default:
            return null;
    }
}

function mapAppearanceLevel(value?: string): string | null {
    switch (normalizeKey(value)) {
        case 'regular':
            return 'regular everyday professional appearance';
        case 'well-groomed':
            return 'well-groomed but authentic professional appearance';
        case 'styled':
            return 'styled but believable appearance, intentionally prepared';
        case 'messy':
        case 'messy-just-woke-up':
            return 'slightly messy, just woke up look with natural dishevelment';
        case 'running-late':
            return 'running-late appearance with minor imperfections in hair and clothing';
        default:
            return null;
    }
}

/**
 * PROPS → Scene objects and lifestyle accessories
 */
const PROPS_SEMANTIC_MAP: Record<string, string> = {
    'None': '',
    'Smartphone / Tech': 'smartphone or tech device naturally placed in scene as lifestyle prop',
    'Coffee / Beverage': 'coffee cup or beverage container visible in scene, steam or condensation if appropriate',
    'Notebook / Journal': 'notebook or journal as lifestyle prop, possibly open with visible pages',
    'Makeup Tool': 'makeup brush or beauty tool visible in scene',
    'Shopping Tote': 'cloth shopping tote bag as lifestyle prop, suggesting everyday errands'
};

const FORMULATION_LAB_VIBE_MAP: Record<string, FormulationStoryOptions['labVibe']> = {
    'Clean Lab': 'modern_clinical_lab',
    'Moody Lab': 'r_and_d_studio',
    'Warm Studio': 'apothecary_lab'
};

const ROLE_LABELS: Record<ExpertRole, string> = {
    doctor: 'medical doctor / physician (MD)',
    medical_professional: 'medical professional',
    clinical_researcher: 'clinical researcher',
    research_scientist: 'research scientist',
    functional_health_expert: 'functional health expert',
    wellness_practitioner: 'wellness practitioner',
    pharmacist: 'pharmacist',
    nutritionist: 'nutritionist',
    custom: 'formulation expert'
};

const ATTIRE_DESCRIPTIONS: Record<ExpertAttire, string> = {
    white_medical_coat: 'a white medical coat over professional attire',
    white_scrubs: 'white medical scrubs',
    light_blue_scrubs: 'light blue scrubs',
    burgundy_scrubs: 'burgundy scrubs',
    green_scrubs: 'green scrubs'
};

const EXPERT_ROLE_FOCUS_MAP: Record<ExpertRole, FormulationStoryOptions['professionalFocus']> = {
    doctor: 'clinical_researcher',
    medical_professional: 'clinical_researcher',
    clinical_researcher: 'clinical_researcher',
    research_scientist: 'research_scientist',
    functional_health_expert: 'functional_health_expert',
    wellness_practitioner: 'wellness_practitioner',
    pharmacist: 'pharmacist',
    nutritionist: 'nutritionist',
    custom: 'custom'
};

const buildFormulationStoryOptions = (sceneState: Step3Values): FormulationStoryOptions | undefined => {
    if (!sceneState.formulationStoryEnabled) {
        return undefined;
    }
    const focus = EXPERT_ROLE_FOCUS_MAP[sceneState.expertRole] ?? 'custom';
    const labVibe = FORMULATION_LAB_VIBE_MAP[sceneState.labVibe] ?? 'none';
    return {
        professionalFocus: focus,
        expertName: sceneState.expertName?.trim() || undefined,
        roleCredentials: sceneState.expertCredentials?.trim() || undefined,
        labVibe,
        expertRole: sceneState.expertRole,
        expertRoleLabel: ROLE_LABELS[sceneState.expertRole] ?? 'medical expert',
        expertAttire: sceneState.expertAttire,
        expertAttireDescription: ATTIRE_DESCRIPTIONS[sceneState.expertAttire] ?? 'professional medical attire',
        badgePreference: sceneState.expertBadgePreference
    };
};

/**
 * CAMERA DEVICE → Physical capture characteristics and lens behavior
 */
const CAMERA_DEVICE_SEMANTIC_MAP: Record<string, string> = {
    'Intentional smartphone camera': 'captured with a modern smartphone’s rear camera, stabilized grip, intentional framing, no selfie distortion',
    'DSLR / mirrorless camera': 'captured with a professional DSLR or mirrorless body using premium glass, shallow depth of field, and crisp subject separation',
    'Cinema camera rig': 'captured on a cinema camera with controlled rigs, smooth motion, and filmic dynamic range',
    'Medium format studio camera': 'captured on a medium-format studio system with tethered capture for ultra-sharp detail and tonal accuracy',
    'Laptop webcam (pro setup)': 'captured through a laptop webcam in a professional setting, flat lighting, slight compression, intentional composition'
};

/**
 * SHOT TYPE → Physical camera framing (SIMPLIFIED)
 */
const SHOT_TYPE_SEMANTIC_MAP: Record<string, string> = {
    'Extreme close-up': 'extreme close-up framing emphasizing fine detail such as skin texture, fingertips, or specific product features',
    'Close': 'tight close-up showing face and upper shoulders with minimal background, focused on expression and product proximity',
    'Medium': 'medium framing from mid-torso up, balanced view of face, hands, and immediate environment',
    'Wide': 'wide framing capturing the person within their surroundings, showing more of the room or setting for context',
    'Full body': 'full-body framing from head to toe, including ground contact and environmental elements around the subject'
};

/**
 * CAMERA ANGLE → Physical camera position (SIMPLIFIED)
 */
const CAMERA_ANGLE_SEMANTIC_MAP: Record<string, string> = {
    'Eye level': 'camera positioned at natural eye level creating a neutral, balanced perspective',
    'Slightly above eye level': 'camera positioned just above eye level, angled gently downward for an approachable view',
    'Slightly below eye level': 'camera positioned just below eye level, angled subtly upward for added presence',
    'High angle': 'camera noticeably above the subject, angled down to emphasize vulnerability or environment',
    'Low angle': 'camera noticeably below the subject, angled up to emphasize stature or drama',
    'Top-down': 'camera positioned directly overhead, looking straight down for flat-lay or tabletop compositions',
    'Bottom-up': 'camera positioned low near ground, aiming sharply upward for dramatic height and foreground impact'
};

/**
 * FRAMING → Composition and spatial arrangement
 */
const FRAMING_SEMANTIC_MAP: Record<string, string> = {
    'Centered': 'centered symmetrical composition with subject positioned in exact middle of frame, balanced negative space',
    'Rule of thirds': 'rule-of-thirds composition with subject positioned at intersection points, intentional asymmetric balance',
    'Off-center': 'deliberately off-center asymmetric composition, subject pushed to one side for dynamic visual weight',
    'Spontaneous': 'spontaneous imperfect framing with natural cropping, slightly off-kilter authentic composition'
};

/**
 * TIME OF DAY → Physical light characteristics and atmosphere
 */
const TIME_SEMANTIC_MAP: Record<string, string> = {
    'Morning': 'early morning natural light with cool blue undertones, soft directional rays, fresh atmospheric quality',
    'Midday': 'bright midday sunlight with neutral white color temperature, strong overhead illumination, minimal shadows',
    'Afternoon': 'warm afternoon light with slight golden undertones, balanced illumination, medium-length shadows',
    'Golden Hour': 'golden hour sunlight with rich orange-amber color temperature, long dramatic shadows, warm glow on skin',
    'Evening': 'fading evening light with purple-blue undertones, warm indoor ambient mixing with cool exterior',
    'Night': 'nighttime lighting with artificial indoor warmth, deep shadows, limited light sources visible'
};

/**
 * LIGHTING STYLE → Physical light source behavior and shadow characteristics
 */
const LIGHTING_SEMANTIC_MAP: Record<string, string> = {
    'Natural window': 'natural window light entering from the side, soft directional quality with gentle shadow falloff, graduated illumination across face',
    'Soft diffused': 'soft diffused lighting with minimal harsh shadows, even illumination wrapping around subject, gentle gradations',
    'Direct sunlight': 'direct hard sunlight with strong contrast, defined crisp shadows, bright specular highlights on skin',
    'Indoor artificial': 'indoor artificial lighting with typical home color temperature, mixed light sources, realistic ambient',
    'Moody/dramatic': 'moody low-key dramatic lighting with deep shadows, selective illumination, strong light-to-dark ratio',
    'Phone flashlight': 'harsh direct phone flashlight illumination, uneven hot-spot exposure, realistic smartphone flash behavior'
};

/**
 * FACIAL EXPRESSION → Physical facial muscle states ONLY
 * Describes specific facial gestures, NOT scene energy or body language
 */
const FACIAL_EXPRESSION_MAP: Record<string, string> = {
    'Calm & Serene': 'calm, serene facial expression, relaxed and natural, no forced emotion',
    'Joyful & High-Energy': 'joyful, high-energy facial expression, vibrant, expressive, genuine emotion',
    'Confident & Editorial': 'confident, editorial-style expression, composed, self-assured, professional presence',
    'Playful & Candid': 'playful, candid facial expression, spontaneous and natural, real-life moment',
    'Hustle & Juggle': 'busy, focused expression, multitasking energy, real-life hustle moment',
    'Stressed but Determined': 'slightly stressed but determined expression, visible effort with inner strength'
};

const SKIN_REALISM_SEMANTIC_MAP: Record<string, string> = {
    'Raw / Real': 'smooth continuous smartphone-captured skin with natural tonal shifts and gentle asymmetry, no pore emphasis or exaggerated texture',
    'Natural': 'believable skin appearance with soft falloff and subtle variation, realistic but never plastic or overly detailed',
    'Soft Retouch': 'lightly smoothed skin with minimal retouching, still human but without artificial pore detail or render-like finish'
};

/**
 * EYE DIRECTION → Physical gaze vector and eye position
 */
const EYE_DIRECTION_SEMANTIC_MAP: Record<string, string> = {
    'Looking at camera': 'eyes directed straight into camera lens, pupils centered in iris, direct engaging eye contact with viewer',
    'Looking at product': 'eyes clearly directed downward toward product in hands, focused attentive gaze on item',
    'Looking away naturally': 'eyes directed off-camera at natural angle, distracted authentic gaze, candid non-posed eye position'
};

/**
 * WARDROBE → Clothing style physical description
 */
const WARDROBE_SEMANTIC_MAP: Record<string, string> = {
    'Casual Streetwear': 'casual streetwear clothing with relaxed fit, contemporary urban style, comfortable everyday items',
    'Athleisure Set': 'athleisure athletic wear with performance fabrics, sporty comfortable styling',
    'Minimal Luxe': 'minimal luxe fashion with high-quality simple pieces, understated premium materials',
    'Cozy Knitwear': 'cozy knitwear with visible knit texture, warm comfortable layering',
    'Bold Color Pop': 'outfit with bold color elements, vibrant saturated hues creating visual interest',
    'Errand-Day Layers': 'practical layered outfit for errands, functional casual combination'
};

/**
 * PRODUCT INTERACTION → Physical hand and body relationship to product
 */
const INTERACTION_SEMANTIC_MAP: Record<string, string> = {
    'Holding': 'hands naturally gripping product with relaxed fingers, product stable in palm or between hands',
    'Using': 'hands actively using product in natural application, demonstrating real product function',
    'Presenting': 'product extended toward camera with natural wrist motion, label visible without forced styling',
    'Unboxing / Open Box': 'hands opening packaging or revealing the product inside with natural curiosity',
    'Showing to Camera': 'product held outward toward camera lens, hand angled to display product label or design',
    'Unboxing': 'hands in process of opening product packaging, revealing contents with natural excitement',
    'Applying': 'hands applying product to skin or surface with natural spreading or dabbing motion',
    'Placing on Surface': 'hands lowering product onto surface, fingers releasing grip, natural placement motion'
};

const normalizeSingleSelectLayer = (entries: string[] | undefined | null, fieldName: string): string[] => {
    if (!Array.isArray(entries)) {
        return [];
    }
    const filtered = entries.filter(Boolean);
    if (filtered.length <= 1) {
        return filtered;
    }
    console.error(`[MAP] Invalid multi-select detected for ${fieldName}; using the first entry only.`, filtered);
    return [filtered[0]];
};

const PROPPED_SURFACE_ID = 'propped-surface';
const SURFACE_OPERATOR_ID = 'surface-staged';
const DEFAULT_HANDHELD_CAPTURE = 'torso-level-handheld';
const DEFAULT_HANDHELD_OPERATOR = 'self-held';
const DEFAULT_HAIR_COLOR = 'Dark brown';
const AWKWARD_CONTEXT_ENVIRONMENT_MAP: Record<string, string> = {
    'bathroom-set': 'Bathroom sink counter with towels, mirror streaks, and toiletries crowding the edges.',
    'car-interior': 'Cramped car interior with seatbelt, dashboard clutter, and windshield reflections creeping into frame.',
    'bedroom-corner': 'Bedroom corner with visible pillows, wrinkled sheets, and bedside clutter spilling into the shot.',
    'cluttered-desk': 'Messy desk overflowing with snacks, cables, open packaging, and random paperwork.'
};

const appendOnce = (base: string, addition: string): string => {
    if (!addition) return base;
    if (base.includes(addition)) return base;
    const trimmed = base.trim();
    const needsPeriod = trimmed && !/[.!?]$/.test(trimmed);
    const prefix = needsPeriod ? `${trimmed}.` : trimmed;
    return `${prefix ? `${prefix} ` : ''}${addition}`.trim();
};

const enforceElderLightingProfile = (text: string, age: number): string => {
    if (!text || age < 80) {
        return text;
    }

    let result = text
        .replace(/graduated illumination/gi, 'patchy illumination with uneven falloff')
        .replace(/\bcontrolled\b/gi, 'imperfect')
        .replace(/\baesthetic\b/gi, 'imperfect');

    if (age >= 85) {
        result = result
            .replace(/\bbalanced\b/gi, 'lopsided')
            .replace(/\beven\b/gi, 'irregular');
    } else {
        result = result
            .replace(/\bbalanced\b/gi, 'uneven')
            .replace(/\beven\b/gi, 'uneven');
    }

    result = appendOnce(
        result,
        'Lighting stays uneven, mixed-temperature, and imperfect like window spill colliding with household lamps.'
    );

    if (age >= 85) {
        result = appendOnce(
            result,
            'No balanced or even cues—illumination feels lopsided, off-kilter, and asymmetrical.'
        );
    }

    return result.trim();
};

/**
 * CREATION MODE → Structural composition rules
 */
const CREATION_MODE_STRUCTURAL_MAP: Record<string, string> = {
    'Lifestyle UGC': 'lifestyle UGC composition: human-first framing, authentic environment visible, natural imperfections allowed, smartphone-quality aesthetic',
    'Studio Hero': 'studio hero composition: controlled professional lighting, clean minimal background, product and person precisely arranged',
    'Aesthetic Builder': 'aesthetic-focused composition: design-forward styling with curated props, intentional color palette, editorial quality',
    'Background Replace': 'background replacement mode: subject isolated and preserved, new environment composited behind, seamless integration',
    'Ecommerce Blank Space': 'ecommerce blank-space layout: solid or gradient background, heavy negative space for text overlays, commercial framing'
};

/**
 * COMPOSITION MODE → Layout intent and spatial arrangement
 */
const COMPOSITION_MODE_STRUCTURAL_MAP: Record<string, string> = {
    'Lifestyle Showcase': 'lifestyle showcase layout: balanced subject and environment, natural contextual composition',
    'Editorial Spread': 'editorial spread layout: design-forward with intentional negative space, magazine-style arrangement',
    'Blank Space': 'blank space layout: heavy negative space on designated side, optimized for text and graphic overlays'
};

/**
 * CAMERA ORIGIN / CAPTURE STYLE → Physical camera position, holder, distance, narrative
 */
const SELFIE_TYPE_SEMANTIC_MAP: Record<string, string> = {
    'Front Camera Selfie': 'front-facing smartphone camera, person holding phone at arm length, partially visible arm, short distance, slight selfie distortion, authentic UGC testimonial feel',
    'Mirror Selfie': 'phone reflected in mirror, camera visible in hand, person looking at mirror not lens, medium distance, bathroom or bedroom aesthetic, lifestyle authenticity',
    'Back Camera Handheld': 'rear smartphone camera held by person or another, higher quality less distortion, natural arm-extended framing, cleaner lifestyle aesthetic while remaining real',
    'Third-Person Phone Shot': 'phone held by another person, subject not holding camera, casual friend or partner perspective, still UGC feel but not selfie, medium to full body framing possible'
};

/**
 * SELFIE EXECUTION → Physical execution style (only for Front Camera Selfie)
 */
const SELFIE_EXECUTION_SEMANTIC_MAP: Record<string, string> = {
    "Arm's length selfie": "arm's length front camera selfie, handheld smartphone, phone not visible in frame, classic UGC composition",
    'Close face selfie': 'close-up front camera selfie, intimate framing, face dominant in frame, casual handheld feel',
    'Upper body selfie': 'front camera selfie showing head and upper torso, clean framing, casual creator style',
    'Casual angled selfie': 'front camera selfie with slight tilt, imperfect angle, spontaneous casual composition'
};

// ============================================================================
// MAIN MAPPER FUNCTION
// ============================================================================

// ============================================================================
// MACROS & PRIORITY DEFINITIONS
// ============================================================================

// HERO PERSONA MACROS - Strict behavioral overrides
const HERO_PERSONA_MACROS: Record<string, any> = {
    'The Busy Mom': {
        expression: 'Hustle & Juggle',
        wardrobe: 'comfortable casual everyday wear, functional clothing, slightly disheveled realism',
        pose: 'natural mid-action candid movement',
        framing: 'spontaneous imperfect framing'
    },
    'The Fitness Enthusiast': {
        expression: 'Joyful & High-Energy',
        wardrobe: 'modern activewear, moisture-wicking fabric, athletic styling',
        pose: 'mid-workout movement or post-exercise recovery pose',
        framing: 'dynamic angled composition'
    },
    'The Skincare Obsessed': {
        expression: 'Calm & Serene',
        wardrobe: 'minimal clean loungewear, soft fabrics, neutral tones',
        environment: 'Bathroom', // Hint for environment
        pose: 'focused self-care application intent'
    },
    'The Minimalist': {
        expression: 'Confident & Editorial',
        wardrobe: 'high-quality minimal solid colors, structured simple silhouette',
        environment: 'Modern Living Room', // Hint
        pose: 'still composed architectural posture'
    },
    'The Trendsetter': {
        expression: 'Playful & Candid',
        wardrobe: 'bold statement outfit, layers, current fashion trends',
        pose: 'confident styled candid pose',
        framing: 'editorial spontaneous framing'
    }
};

// ============================================================================
// MAIN MAPPER FUNCTION
// ============================================================================

/**
 * Transform LifestyleStep3 UI state to PromptOptions
 * COMPLETE SEMANTIC INJECTION - With STRICT Priority Rules
 */
export function mapLifestyleToPromptOptions(
    sceneState: Step3Values,
    existingOptions: Partial<PromptOptions> = {},
    hasModelReference: boolean = false
): Partial<PromptOptions> {
    // MANDATORY LOGGING - Input state
    console.log('[MAP INPUT]', JSON.stringify(sceneState, null, 2));

    // ========================================================================
    // PRIORITY 1: PRODUCT MODE EXIT
    // ========================================================================
    const isProductMode = sceneState.creationIntent === 'product' ||
        sceneState.creationIntent === 'brand';

    if (isProductMode) {
        return mapProductModeToPromptOptions(sceneState, existingOptions);
    }

    // Initialize mapped options
    const mapped: Partial<PromptOptions> = {
        ...existingOptions,
        hasModelReference
    };

    // Initialize Person Details
    if (!mapped.personDetails) mapped.personDetails = {};
    const personIncluded = !sceneState.noPerson;
    mapped.personIncluded = personIncluded;

    const sceneIntent = sceneState.sceneIntent || 'environment';
    mapped.sceneIntent = sceneIntent;
    const isEnvironmentSceneIntent = sceneIntent === 'environment';
    const isEcommerceSceneIntent = sceneIntent === 'ecommerce';
    const rawCreationMode = (sceneState.creationMode || '').toLowerCase();
    const isCreationModeEcommerceBlank =
        rawCreationMode === 'ecommerce blank space' || rawCreationMode === 'ecom-blank';
    const isCompositionModeEcommerceBlank = sceneState.compositionMode === 'Ecommerce Blank Space';
    const isEcommerceBlankSpaceActive =
        isEcommerceSceneIntent || isCreationModeEcommerceBlank || isCompositionModeEcommerceBlank;
    const isUGCRealMode = !!sceneState.ugcRealMode;
    const personAge = sceneState.age || 0;
    const is80Plus = isUGCRealMode && personAge >= 80;
    const is85Plus = isUGCRealMode && personAge >= 85;
    const hairColorSelection = (sceneState.hairColor || '').trim();
    const hasExplicitHairColor = Boolean(hairColorSelection && hairColorSelection !== DEFAULT_HAIR_COLOR);
    const wantsGradientBackground = sceneState.ecommerceBackgroundMode === 'gradient';
    const gradientAngleValue = parseInt(sceneState.ecommerceGradientAngle || '90', 10) || 90;
    const gradientConfig = {
        startColor: sceneState.ecommerceGradientStart || '#f7f7f7',
        endColor: sceneState.ecommerceGradientEnd || '#d9d9d9',
        angle: gradientAngleValue
    };
    const ugcHouseholdLighting =
        'Lighting is accidental and imperfect. Overhead domestic bulbs dominate the scene. Mixed color temperatures cause uneven skin tones. Some areas are slightly overexposed while others fall into shadow. No effort is made to correct lighting mistakes.';


    // ========================================================================
    // PRIORITY 2: CUSTOM CLOTHES (ABSOLUTE OVERRIDE)
    // ========================================================================
    const customClothes = buildCustomClothesDescriptor(sceneState);
    const hasCustomClothes = Boolean(customClothes);
    if (customClothes) {
        mapped.customClothes = customClothes;
    }

    // ========================================================================
    // PRIORITY 3: HERO PERSONAS (SEMANTIC MACRO)
    // ========================================================================
    const heroPersona = sceneState.heroPersona;
    let poseOverride = null;
    let framingOverride = null;
    let expressionOverride: string | null = null;
    let wardrobeOverride: string | null = null;

    if (heroPersona && HERO_PERSONA_MACROS[heroPersona]) {
        console.log(`[PRIORITY 2] Hero Persona Active: ${heroPersona} - Applying MACROS`);
        const macro = HERO_PERSONA_MACROS[heroPersona];

        if (macro.expression) {
            expressionOverride = macro.expression;
        }
        // Apply Pose Override
        poseOverride = macro.pose;
        mapped.personPose = poseOverride;
        mapped.personDetails.personPose = poseOverride;

        // Apply Framing Override (if exists) only when environment intent is not locked
        if (!isEnvironmentSceneIntent && macro.framing) {
            framingOverride = macro.framing;
            mapped.perspective = framingOverride;
        }

        // Apply Wardrobe Override (ONLY if Custom Clothes NOT active)
        if (!hasCustomClothes && macro.wardrobe) {
            console.log('[PRIORITY 3] Applying Hero Persona Wardrobe');
            wardrobeOverride = macro.wardrobe;
            mapped.wardrobeStyle = wardrobeOverride;
            mapped.personDetails.wardrobeStyle = wardrobeOverride;
        }
    }


    // ========================================================================
    // PRIORITY 4: MANUAL INPUTS (Apply only if not overridden)
    // ========================================================================

    if (personIncluded) {
        // AGE, GENDER, ETHNICITY (Always respect unless Model Ref)
        mapped.personDetails.age = sceneState.age;
        const genderValue = (sceneState.gender || '').trim();
        if (genderValue) {
            mapped.personDetails.gender = genderValue;
        }
        const normalizedGenderValue = genderValue.toLowerCase();
        let genderPresentation: 'masculine' | 'feminine' | 'neutral' | undefined =
            ((sceneState as any).genderPresentation || '').trim().toLowerCase() as any;
        if (!genderPresentation) {
            if (normalizedGenderValue === 'male') {
                genderPresentation = 'masculine';
            } else if (normalizedGenderValue === 'female') {
                genderPresentation = 'feminine';
            }
        }
        if (
            isUGCRealMode &&
            normalizedGenderValue === 'trans' &&
            genderPresentation !== 'masculine' &&
            genderPresentation !== 'feminine'
        ) {
            genderPresentation = 'neutral';
        }
        if (genderPresentation) {
            (mapped as any).genderPresentation = genderPresentation;
            mapped.personDetails.genderPresentation = genderPresentation;
        }
        if (sceneState.ethnicity && sceneState.ethnicity !== 'Prefer not to specify') {
            mapped.personDetails.ethnicity = sceneState.ethnicity;
        }
        if (sceneState.bodyType) {
            mapped.personDetails.bodyType = sceneState.bodyType;
        }
        if (sceneState.skinTone) {
            mapped.personDetails.skinTone = sceneState.skinTone;
        }

        // POSE (Manual if no Override)
        if (!poseOverride && sceneState.pose) {
            const pose = POSE_SEMANTIC_MAP[sceneState.pose] || sceneState.pose;
            mapped.personPose = pose;
            mapped.personDetails.personPose = pose;
        }

        // WARDROBE (Manual if no Override)
        if (!wardrobeOverride && sceneState.wardrobe) {
            const ward = WARDROBE_SEMANTIC_MAP[sceneState.wardrobe] || sceneState.wardrobe;
            mapped.wardrobeStyle = ward;
            mapped.personDetails.wardrobeStyle = ward;
        }

        // APPEARANCE (Manual input)
        const appearanceDescriptor = mapAppearanceLevel(sceneState.appearanceLevel);
        if (appearanceDescriptor) {
            mapped.personAppearance = appearanceDescriptor;
            mapped.personDetails.personAppearance = appearanceDescriptor;
        }

        const skinDescriptor = mapSkinRealism(sceneState.skinRealism);
        if (skinDescriptor) {
            mapped.personDetails.skinRealism = skinDescriptor;
        }

        // OTHER PERSON DETAILS (Non-conflicting)
        const expressionLabel = expressionOverride || sceneState.facialExpression || 'Calm & Serene';
        const expressionSemantic =
            FACIAL_EXPRESSION_MAP[expressionLabel] || FACIAL_EXPRESSION_MAP['Calm & Serene'];
        mapped.personDetails.facialExpression = expressionSemantic;

        const eyeDirectionLabel = sceneState.eyeDirection || 'Looking at camera';
        mapped.personDetails.eyeDirection =
            EYE_DIRECTION_SEMANTIC_MAP[eyeDirectionLabel] || eyeDirectionLabel as any;
        if (sceneState.productInteraction) {
            const interactionBase = INTERACTION_SEMANTIC_MAP[sceneState.productInteraction] || sceneState.productInteraction;
            const interactionParts = [interactionBase];
            if (sceneState.productInteraction === 'Using' && sceneState.productUsageDescription) {
                interactionParts.push(sceneState.productUsageDescription.trim());
            }
            mapped.personDetails.productInteraction = interactionParts.filter(Boolean).join(' ');
        }
        mapped.productStructure = sceneState.productStructure || 'single';
        if (sceneState.eyeColor) mapped.personDetails.eyeColor = sceneState.eyeColor;

        // HAIR
        const hairState = sceneState.hairState || 'natural';
        if (hairState === 'bald') {
            mapped.personDetails.hairLength = 'bald / clean-shaven head';
            delete mapped.personDetails.hairTexture;
            delete mapped.personDetails.hairColor;
        } else {
            if (sceneState.hairLength) mapped.personDetails.hairLength = sceneState.hairLength;
            if (sceneState.hairTexture) mapped.personDetails.hairTexture = sceneState.hairTexture;
            const hairColorValue = sceneState.hairColor?.trim();
            if (hairColorValue) {
                let resolvedHairColor = sceneState.hairColor;
                if (is85Plus && !hasExplicitHairColor) {
                    resolvedHairColor =
                        'gray-white hair with dominant salt-and-pepper variation, collapsed volume, sparse uneven density';
                }
                mapped.personDetails.hairColor = resolvedHairColor;
            } else if (is85Plus) {
                mapped.personDetails.hairColor =
                    'gray-white hair with dominant salt-and-pepper variation, collapsed volume, sparse uneven density';
            }
        }
        // ... (other hair props mapped normally)

        const identityLock: IdentityLock = {
            gender: sceneState.gender || mapped.personDetails.gender,
            age: sceneState.age,
            skinTone: sceneState.skinTone || mapped.personDetails.skinTone,
            ethnicity: sceneState.ethnicity || mapped.personDetails.ethnicity,
            hairColor: mapped.personDetails.hairColor || sceneState.hairColor,
            hairTexture: mapped.personDetails.hairTexture || sceneState.hairTexture,
            hairLength: mapped.personDetails.hairLength || sceneState.hairLength,
            hairState
        };
        (mapped as any).identityLock = identityLock;
    }

    const isUGCActive = isUGCRealMode;
    const isFormulationActive = !!sceneState.formulationStoryEnabled;

    if (!isUGCActive) {
        const skinLabel = sceneState.skinRealism || 'Natural';
        const skinSemantic =
            SKIN_REALISM_SEMANTIC_MAP[skinLabel] || SKIN_REALISM_SEMANTIC_MAP['Natural'];
        mapped.skinRealism = skinSemantic;
        mapped.personDetails.skinRealism = skinSemantic;

        let appearanceLabel = sceneState.appearanceLevel;
        if (!appearanceLabel) {
            appearanceLabel = isFormulationActive ? 'Well-Groomed' : 'Regular';
        }
        const appearanceSemantic =
            APPEARANCE_SEMANTIC_MAP[appearanceLabel] || APPEARANCE_SEMANTIC_MAP['Regular'];

        if (!mapped.personDetails.personAppearance) {
            mapped.personDetails.personAppearance = appearanceSemantic;
        }
        if (!mapped.personAppearance) {
            mapped.personAppearance = appearanceSemantic;
        }
    } else {
        delete mapped.skinRealism;
    }

    // FRAMING/PERSPECTIVE (Manual if no Override)
    if (!sceneState.ugcRealMode && !framingOverride && sceneState.framing) {
        mapped.perspective = FRAMING_SEMANTIC_MAP[sceneState.framing] || sceneState.framing;
    }


    // ========================================================================
    // STRUCTURAL & ENVIRONMENT (Standard Mapping)
    // ========================================================================

    // ========================================================================
    // CREATION MODE → Structural Rules (FIRST - affects everything downstream)
    // ========================================================================
    let creationModeKey = sceneState.creationMode || 'Lifestyle UGC';

    // OVERRIDE: If Composition Mode is 'Ecommerce Blank Space', force creation mode
    // This allows Ecommerce Builder to work without UI state sync complexity
    if (sceneState.compositionMode === 'Ecommerce Blank Space' && !isEnvironmentSceneIntent) {
        creationModeKey = 'Ecommerce Blank Space';
    }

    if (isEnvironmentSceneIntent) {
        creationModeKey = 'Lifestyle UGC';
    }

    const creationModeStructural = isEnvironmentSceneIntent
        ? 'Environment-first lifestyle composition keeping the product grounded within the lived-in room.'
        : isEcommerceBlankSpaceActive
            ? 'Ecommerce blank-space layout with pure white background (#FFFFFF), heavy negative space for UX overlays, and no environmental narrative.'
            : CREATION_MODE_STRUCTURAL_MAP[creationModeKey] || CREATION_MODE_STRUCTURAL_MAP['Lifestyle UGC'];

    // Map to internal creation mode
    const creationModeInternalMap: Record<string, 'lifestyle' | 'studio' | 'aesthetic' | 'bg-replace' | 'ecom-blank'> = {
        'Lifestyle UGC': 'lifestyle',
        'Studio Hero': 'studio',
        'Aesthetic Builder': 'aesthetic',
        'Background Replace': 'bg-replace',
        'Ecommerce Blank Space': 'ecom-blank'
    };
    mapped.creationMode = creationModeInternalMap[creationModeKey] || 'lifestyle';
    mapped.creationModeStructural = creationModeStructural;
    console.log('[MAP] creationMode:', creationModeKey, '→', mapped.creationMode, '→', creationModeStructural);

    // ========================================================================
    // COMPOSITION MODE → Layout Intent
    // ========================================================================
    const rawCompositionModeKey = sceneState.compositionMode || 'Lifestyle Showcase';
    const compositionModeKey = isEnvironmentSceneIntent ? 'Lifestyle Showcase' : rawCompositionModeKey;
    const compositionModeStructural = isEnvironmentSceneIntent
        ? 'Environment-first layout with human-first framing and contextual surroundings.'
        : isEcommerceBlankSpaceActive
            ? 'Ecommerce blank-space arrangement with white void for product and copy, no lifestyle embellishments.'
            : COMPOSITION_MODE_STRUCTURAL_MAP[rawCompositionModeKey] || '';
    mapped.compositionMode = compositionModeKey;
    mapped.compositionModeStructural = compositionModeStructural;
    console.log('[MAP] compositionMode:', compositionModeKey, '→', compositionModeStructural);

    if (isEnvironmentSceneIntent) {
        mapped.placementStyle = 'Lifestyle placement with the product integrated in the environment, not hero-focused.';
        mapped.productPlane = 'Mid-ground contextual placement within the room or space.';
        mapped.placementCamera = sceneState.cameraType || mapped.placementCamera;
    }

    // ========================================================================
    // UGC REAL MODE → HARD OVERRIDES (Highest Priority)
    // ========================================================================
    if (sceneState.ugcRealMode) {
        console.log('[MAP] UGC Real Mode ACTIVE - applying hard overrides');

        // FORCE lifestyle mode
        mapped.creationMode = 'lifestyle';
        mapped.ugcRealModeActive = true;
        mapped.realModeActive = true;
        mapped.ugcCaptureSituation = sceneState.ugcCaptureSituation || null;
    } else {
        mapped.ugcCaptureSituation = null;
    }

    let normalizedCaptureBase = normalizeSingleSelectLayer(sceneState.ugcCaptureStyleBase, 'ugcCaptureStyleBase');
    let normalizedCameraOperator = normalizeSingleSelectLayer(sceneState.ugcCameraOperator, 'ugcCameraOperator');
    const normalizedBodyPhone = normalizeSingleSelectLayer(sceneState.ugcBodyPhonePosition, 'ugcBodyPhonePosition');
    const normalizedMotion = normalizeSingleSelectLayer(sceneState.ugcMotionStability, 'ugcMotionStability');
    const normalizedFraming = normalizeSingleSelectLayer(sceneState.ugcFramingImperfections, 'ugcFramingImperfections');
    const normalizedAwkward = normalizeSingleSelectLayer(sceneState.ugcAwkwardContext, 'ugcAwkwardContext');
    const awkwardEnvironmentOverride =
        sceneState.ugcRealMode && normalizedAwkward.length > 0
            ? AWKWARD_CONTEXT_ENVIRONMENT_MAP[normalizedAwkward[0]] || null
            : null;

    const productInteractionLabel = (sceneState.productInteraction || '').trim();
    const captureBaseSelection = normalizedCaptureBase[0];
    const operatorSelection = normalizedCameraOperator[0];
    const hasProppedSurface = captureBaseSelection === PROPPED_SURFACE_ID;
    const isHoldingProduct = productInteractionLabel === 'Holding';

    if (isUGCRealMode && normalizedCaptureBase.length === 0) {
        throw new Error('Raw Domestic UGC requires a capture style selection.');
    }

    if (hasProppedSurface && isHoldingProduct) {
        console.warn('[MAP] Blocking propped-surface when product interaction is Holding.');
        normalizedCaptureBase =
            is85Plus || isHoldingProduct ? [DEFAULT_HANDHELD_CAPTURE] : [];
    }

    if (is85Plus && hasProppedSurface) {
        console.warn(`[MAP] Forcing handheld capture for age ${personAge}.`);
        normalizedCaptureBase = [DEFAULT_HANDHELD_CAPTURE];
    }

    if (is85Plus && normalizedCaptureBase.length === 0) {
        console.log('[MAP] No capture base provided for 85+ UGC request. Forcing handheld default.');
        normalizedCaptureBase = [DEFAULT_HANDHELD_CAPTURE];
    }

    if (
        is85Plus &&
        (!operatorSelection || operatorSelection === SURFACE_OPERATOR_ID)
    ) {
        console.log('[MAP] Age 85+ requires handheld operator. Forcing self-held camera operator.');
        normalizedCameraOperator = [DEFAULT_HANDHELD_OPERATOR];
    }

    mapped.ugcCaptureStyleBase = normalizedCaptureBase;
    mapped.ugcCameraOperator = normalizedCameraOperator;
    mapped.ugcBodyPhonePosition = normalizedBodyPhone;
    mapped.ugcMotionStability = normalizedMotion;
    mapped.ugcFramingImperfections = normalizedFraming;
    mapped.ugcAwkwardContext = normalizedAwkward;

    const ugcLayerSet: UGCRealModeLayerSet = {
        captureBase: normalizedCaptureBase,
        cameraOperator: normalizedCameraOperator,
        bodyPhonePosition: normalizedBodyPhone,
        motionStability: normalizedMotion,
        framingImperfections: normalizedFraming,
        awkwardContext: normalizedAwkward
    };
    mapped.ugcRealModeLayers = ugcLayerSet;

    mapped.elderlyRealismGuard = sceneState.elderlyRealismGuard;
    mapped.elderlyRealismDescriptor = sceneState.elderlyRealismDescriptor;
    mapped.elderlyRealismGuardActive = sceneState.elderlyRealismGuardActive;
    mapped.elderlyRealismGuardLabel = sceneState.elderlyRealismGuardLabel;

    // ========================================================================
    // CAMERA → Physical Composition Language
    // ========================================================================

    if (isUGCRealMode) {
        mapped.rawDomesticUgcActive = true;
        mapped.camera = 'Front-facing smartphone camera with tiny sensor limitations';
        mapped.cameraDeviceSemantic =
            'Front-facing phone camera with tiny sensor, face-priority autofocus hunting, limited dynamic range, clipped highlights, crushed shadows, wobbling handheld geometry.';
        console.log('[MAP] camera: raw domestic front camera enforced');
    } else {
        const defaultCameraLabel = 'Intentional smartphone camera';
        const cameraDevice = (sceneState as any).cameraType || defaultCameraLabel;
        const cameraDeviceSemantic = CAMERA_DEVICE_SEMANTIC_MAP[cameraDevice] || CAMERA_DEVICE_SEMANTIC_MAP[defaultCameraLabel];
        const effectiveCameraSemantic = isEnvironmentSceneIntent
            ? 'Handheld smartphone perspective capturing real spatial depth, emphasizing the surrounding environment.'
            : cameraDeviceSemantic;
        mapped.camera = cameraDevice;
        mapped.cameraDeviceSemantic = effectiveCameraSemantic;
        console.log('[MAP] camera:', cameraDevice, '→', effectiveCameraSemantic);
    }

    if (!sceneState.ugcRealMode) {
        // Shot Type
        const shotTypeSemantic = SHOT_TYPE_SEMANTIC_MAP[sceneState.shotType] || SHOT_TYPE_SEMANTIC_MAP['Medium'];
        mapped.cameraShot = shotTypeSemantic as any;
        console.log('[MAP] shotType:', sceneState.shotType, '→', shotTypeSemantic);

        // Camera Angle
        const cameraAngleSemantic = CAMERA_ANGLE_SEMANTIC_MAP[sceneState.cameraAngle] || CAMERA_ANGLE_SEMANTIC_MAP['Eye level'];
        mapped.cameraAngle = cameraAngleSemantic as any;
        console.log('[MAP] cameraAngle:', sceneState.cameraAngle, '→', cameraAngleSemantic);

        // Framing
        // This was already handled by PRIORITY 3/4, but if not set, use default
        if (!mapped.perspective) {
            const framingSemantic = FRAMING_SEMANTIC_MAP[sceneState.framing] || FRAMING_SEMANTIC_MAP['Centered'];
            mapped.perspective = framingSemantic;
        }
        console.log('[MAP] framing:', sceneState.framing, '→', mapped.perspective);
    } else {
        delete mapped.cameraShot;
        delete mapped.cameraAngle;
        delete mapped.perspective;
    }

    // ========================================================================
    // ENVIRONMENT → Scene Context (Restored Full Logic)
    // ========================================================================
    if (isEcommerceBlankSpaceActive) {
        (mapped as any).selectedEnvironment = '';
        (mapped as any).customEnvironment = '';
        mapped.setting = '';
        mapped.microLocation = '';
        (mapped as any).sceneEnvironment = '';
        (mapped as any).customEnvironment = '';
        console.log('[MAP] environment: Ecommerce Blank Space active - environment suppressed');
    } else if (!awkwardEnvironmentOverride) {
        const allowedEnvironmentMap: Record<string, string> = {
            'Kitchen': 'Kitchen',
            'Living Room': 'Living Room',
            'Bedroom': 'Bedroom',
            'Bathroom': 'Bathroom',
            'Workspace': 'Workspace',
            'Hallway': 'Hallway',
            'Home Gym': 'Home Gym',
            'Balcony / Indoor Terrace': 'Balcony / Indoor Terrace',
            'Urban Exterior': 'Urban Exterior',
            'Natural Exterior': 'Natural Exterior',
            'Parking Lot': 'Parking Lot',
            'Backyard / Patio': 'Backyard / Patio',
            'Street Corner': 'Street Corner'
        };

        const incidentalFallbacks = [
            'Kitchen',
            'Living Room',
            'Bedroom',
            'Bathroom',
            'Workspace',
            'Hallway',
            'Balcony / Indoor Terrace',
            'Backyard / Patio',
            'Street Corner'
        ];

        const selectedEnvironment = sceneState.environment || '';
        const customEnvironmentValue = (sceneState.customEnvironment || '').trim();

        (mapped as any).selectedEnvironment = selectedEnvironment;
        (mapped as any).customEnvironment = customEnvironmentValue;

        const resolveEnvironmentLabel = (): { label: string; description: string } => {
            if (selectedEnvironment === 'Custom' && customEnvironmentValue) {
                return {
                    label: customEnvironmentValue,
                    description: `${customEnvironmentValue} captured incidentally with lived-in clutter and zero staging.`
                };
            }
            const mappedLabel = allowedEnvironmentMap[selectedEnvironment];
            if (mappedLabel) {
                return {
                    label: mappedLabel,
                    description: `${mappedLabel} captured incidentally with lived-in domestic clutter and no deliberate styling.`
                };
            }
            if (customEnvironmentValue) {
                return {
                    label: customEnvironmentValue,
                    description: `${customEnvironmentValue} captured incidentally with lived-in clutter and no staging.`
                };
            }
            const fallbackLabel =
                incidentalFallbacks[Math.floor(Math.random() * incidentalFallbacks.length)] ||
                'Bedroom';
            return {
                label: fallbackLabel,
                description: `${fallbackLabel} captured incidentally with lived-in domestic clutter and no deliberate styling.`
            };
        };

        if (isUGCRealMode) {
            const { label, description } = resolveEnvironmentLabel();
            mapped.setting = label;
            mapped.microLocation = label;
            (mapped as any).sceneEnvironment = label;
            mapped.environmentOrder = label;
            (mapped as any).sceneEnvironmentDescriptor = description;
        } else if (selectedEnvironment === 'Custom' && customEnvironmentValue) {
            mapped.setting = customEnvironmentValue;
            mapped.microLocation = customEnvironmentValue;
        } else if (allowedEnvironmentMap[selectedEnvironment]) {
            const envLabel = allowedEnvironmentMap[selectedEnvironment];
            mapped.setting = envLabel;
            mapped.microLocation = envLabel;
        } else {
            mapped.setting = '';
            mapped.microLocation = '';
        }

        (mapped as any).sceneEnvironment = mapped.setting;
        mapped.environmentOrder = mapped.setting;

        console.log('[MAP] environment:', selectedEnvironment, '→', mapped.setting);
    } else if (awkwardEnvironmentOverride && !isUGCRealMode) {
        mapped.setting = awkwardEnvironmentOverride;
        mapped.microLocation = awkwardEnvironmentOverride;
        (mapped as any).sceneEnvironment = awkwardEnvironmentOverride;
        mapped.environmentOrder = awkwardEnvironmentOverride;
        (mapped as any).selectedEnvironment = 'Awkward Context Override';
        (mapped as any).customEnvironment = awkwardEnvironmentOverride;
        mapped.sceneIntent = 'environment';
        console.log('[MAP] Awkward context override →', awkwardEnvironmentOverride);
    }

    const sceneOrderChaosValue = isUGCRealMode ? 'Messy' : (sceneState.sceneOrderChaos || 'Normal');
    mapped.sceneOrderChaos = sceneOrderChaosValue;
    const sceneOrderChaosDescriptor = buildSceneOrderChaosDescriptor(sceneOrderChaosValue);
    if (sceneOrderChaosDescriptor) {
        (mapped as any).sceneOrderChaosDescriptor = sceneOrderChaosDescriptor;
    }

    // ========================================================================
    // TIME OF DAY + LIGHTING STYLE → Combined Light Narrative
    // ========================================================================
    if (isEcommerceBlankSpaceActive) {
        if (wantsGradientBackground) {
            mapped.bgGradient = {
                startColor: gradientConfig.startColor,
                endColor: gradientConfig.endColor,
                angle: gradientConfig.angle
            };
            delete mapped.bgColor;
        } else {
            mapped.bgColor = '#FFFFFF';
            delete mapped.bgGradient;
        }
        mapped.lighting =
            wantsGradientBackground
                ? 'Gradient ecommerce backdrop with even studio lighting and gentle reflections.'
                : 'Pure white background (#FFFFFF) with neutral studio lighting, flat even illumination, and only a subtle contact shadow directly beneath the product.';
        (mapped as any).timeLightingContext = mapped.lighting;
        console.log('[MAP] Ecommerce Blank Space lighting enforced:', mapped.lighting);
    } else {
        const timeSemantic = TIME_SEMANTIC_MAP[sceneState.timeOfDay] || TIME_SEMANTIC_MAP['Midday'];
        const lightingSemantic = LIGHTING_SEMANTIC_MAP[sceneState.lightingStyle] || LIGHTING_SEMANTIC_MAP['Natural window'];
        mapped.lighting = `${timeSemantic}, ${lightingSemantic}`;
        (mapped as any).timeLightingContext = mapped.lighting;
        console.log('[MAP] lighting:', sceneState.timeOfDay, '+', sceneState.lightingStyle, '→', mapped.lighting);
    }

    if (sceneState.ugcRealMode && !isEcommerceBlankSpaceActive) {
        mapped.lighting = ugcHouseholdLighting;
        (mapped as any).timeLightingContext = mapped.lighting;
    }

    if (is80Plus && mapped.lighting) {
        mapped.lighting = enforceElderLightingProfile(mapped.lighting, personAge);
        (mapped as any).timeLightingContext = mapped.lighting;
    }

    mapped.ecommerceBlankSpaceMode = isEcommerceBlankSpaceActive;

    if (mapped.creationMode === 'lifestyle') {
        delete (mapped as any).proLens;
        delete (mapped as any).proLightingRig;
        delete (mapped as any).proPostTreatment;

        const lifestyleLightingBan = /(studio|ring light|three-point|beauty dish|controlled lighting|macro|flash photo)/i;
        if (mapped.lighting && lifestyleLightingBan.test(mapped.lighting)) {
            mapped.lighting = 'natural ambient lifestyle lighting with imperfect falloff';
            (mapped as any).timeLightingContext = mapped.lighting;
        }
    }

    mapped.sidePlacement = mapped.sidePlacement || (sceneState.sidePlacement?.toLowerCase() || 'center') as any;
    mapped.ecommerceSidePlacementFlag = sceneState.ecommerceSidePlacementFlag;

    // ========================================================================
    // OUTPUT FORMAT → Aspect Ratio
    // ========================================================================
    const aspectRatioMap: Record<string, string> = {
        '1:1 (Square)': '1:1',
        '4:5 (Portrait)': '4:5',
        '9:16 (Story)': '9:16'
    };
    mapped.aspectRatio = aspectRatioMap[sceneState.aspectRatio] || '1:1';
    console.log('[MAP] aspectRatio:', sceneState.aspectRatio, '→', mapped.aspectRatio);

    // ========================================================================
    // FORMULATION STORY (Restored)
    // ========================================================================
    mapped.formulationExpertEnabled = sceneState.formulationStoryEnabled;
    mapped.formulationExpertName = sceneState.formulationName;
    const roleValue = sceneState.formulationRole === 'Custom'
        ? sceneState.formulationCustomRole
        : sceneState.formulationRole;
    mapped.formulationExpertRole = roleValue ? roleValue.trim() : '';
    mapped.formulationLabStyle = sceneState.formulationLabVibe;
    mapped.formulationExpertPreset = sceneState.formulationPreset;
    mapped.formulationExpertAttire = sceneState.formulationAttire;
    mapped.formulationBadgeEnabled = sceneState.formulationBadgeEnabled;
    mapped.formulationStory = buildFormulationStoryOptions(sceneState);
    (mapped as any).formulationTone =
        (sceneState as any).formulationTone || 'calm, grounded, everyday';

    // ========================================================================
    // CONTENT STYLE & CREATION INTENT
    // ========================================================================
    mapped.creationIntent = sceneState.creationIntent;
    mapped.contentStyle = sceneState.creationIntent === 'ugc' && personIncluded ? 'ugc' : 'product';

    // ========================================================================
    // SELFIE MODE (Restored Logic)
    // ========================================================================

    // RULE 1: SELFIE × MULTI-PRODUCT EXCLUSION
    const matchesMultiProduct = existingOptions && existingOptions.productAssets && existingOptions.productAssets.length > 1;

    if (matchesMultiProduct) {
        // HARD OVERRIDE - FORCE DISABLE SELFIE
        console.log('[RULE 1] Multi-product scene detected - DISABLING all selfie modes');
        mapped.selfieMode = 'None'; // or undefined/null if preferred, but 'None' is semantic here
        if (mapped.personDetails) {
            mapped.personDetails.selfieMode = undefined;
            mapped.personDetails.selfieType = undefined;
        }
        mapped.selfieType = undefined; // Legacy

        // Also ensure Step 3 value doesn't sneak in
    } else if (sceneState.selfieMode && sceneState.selfieMode !== 'None') {
        const selfieSemantic = (
            // @ts-ignore
            SELFIE_TYPE_SEMANTIC_MAP[sceneState.selfieMode] ||
            // @ts-ignore
            sceneState.selfieMode
        );

        mapped.selfieMode = selfieSemantic;
        mapped.personDetails.selfieMode = selfieSemantic;
        mapped.selfieType = selfieSemantic; // Legacy
        mapped.personDetails.selfieType = selfieSemantic; // Legacy

        console.log('[MAP] selfieMode:', sceneState.selfieMode, '→', selfieSemantic);
    }

    // ========================================================================
    // FINAL SAFETY CHECKS & CONFLICT RESOLUTION (Priority 8)
    // ========================================================================

    // Rule: UGC Real Mode overrides everything
    if (sceneState.ugcRealMode) {
        // Block cinema cameras if they slipped through
        const proCameras = [
            'DSLR / mirrorless camera',
            'Cinema camera rig',
            'Medium format studio camera',
            'Laptop webcam (pro setup)'
        ];
        if (proCameras.includes(mapped.camera || '')) {
            console.log('[SAFETY] Downgrading Pro Camera in UGC Mode');
            mapped.camera = defaultCameraLabel;
        }
    }

    // Rule: Selfie Mode overrides Camera Position
    if (mapped.selfieMode && mapped.selfieMode !== 'None') {
        // Force third-person OFF if selfie is active (except for "Third-person phone shot")
        if (mapped.selfieMode.includes('Third-person')) {
            // Allow
        } else {
            // Ensure camera is consistent with selfie
            mapped.cameraShot = 'closeUp' as any; // Selfies are generally close
        }
    }

    if (isEnvironmentSceneIntent) {
        delete mapped.bgColor;
        delete (mapped as any).ageGroup;
        mapped.creationMode = mapped.creationMode || 'lifestyle';
        mapped.creationModeStructural = mapped.creationModeStructural || 'Environment-first lifestyle composition keeping the product grounded within the lived-in room.';
        mapped.cameraDeviceSemantic = mapped.cameraDeviceSemantic || 'Handheld smartphone perspective capturing real spatial depth, emphasizing the surrounding environment.';
    }

    // MANDATORY LOGGING - Complete output
    console.log('[MAP OUTPUT]', JSON.stringify(mapped, null, 2));

    return mapped;
}
