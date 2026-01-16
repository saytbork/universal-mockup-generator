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

import type { ExpertRole, Step3Values, ExpertAttire } from '../../components/LifestyleStep3';
import type { CustomClothes, FormulationStoryOptions, IdentityLock, PromptOptions, UGCRealModeLayerSet, SceneOrderChaosLevel } from './types';
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
    'Dynamic Mid-Action': 'dynamic mid-action pose with physique in motion, natural momentum visible in limbs, weight shifted to one side',
    'Over-the-Shoulder': 'over-the-shoulder pose with back partially visible to camera, head turned toward lens, one shoulder prominent',
    'Leaned-In Close': 'leaning forward into frame, shoulders pushed forward, upper torso closer to camera, intimate proximity to lens',
    'Hands-Only Crop': 'cropped composition showing only hands and forearms, fingers visible in tactile interaction',
    'Face Frame Hero': 'hands positioned near face, fingers framing chin or cheeks, face as central focal point',
    'Grounded Lounge': 'grounded seated or reclined position, posture low and relaxed, weight supported by surface',
    'Offer-to-Lens Reach': 'arm extended toward camera lens, product held outward, posture leaning slightly forward in offering gesture'
};

const normalizeKey = (value?: string) =>
    value
        ? value
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/-+/g, '-')
        : '';

const OUTDOOR_ENVIRONMENT_LABELS = new Set([
    'Urban Exterior',
    'Natural Exterior',
    'Parking Lot',
    'Backyard / Patio',
    'Street Corner',
]);

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

const generateIdentitySeed = (): string => {
    if (typeof globalThis !== 'undefined') {
        const runtimeCrypto = (globalThis as typeof globalThis & { crypto?: Crypto }).crypto;
        if (runtimeCrypto?.randomUUID) {
            return runtimeCrypto.randomUUID();
        }
    }
    const randomComponent = Math.random().toString(36).slice(2, 10);
    return `${Date.now().toString(36)}-${randomComponent}`;
};

/**
 * Generate a non-semantic identity variation token.
 * This token breaks latent convergence without describing traits.
 * Format: XXXXXX-YYYYYY (alphanumeric, uppercase)
 */
const generateIdentityVariationToken = (): string => {
    const timestamp = Date.now().toString(36).slice(-6);
    const random = Math.random().toString(36).substring(2, 8);
    return `${timestamp}-${random}`.toUpperCase();
};

/**
 * Generate a persistent identity key for locked mode.
 */
const generateIdentityKey = (): string => {
    return generateIdentitySeed();
};

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

// ============================================================================
// BACKGROUND VARIATION SYSTEM
// ============================================================================

/** Background variation pools per environment */
const BACKGROUND_VARIATION_POOLS: Record<string, string[]> = {
    'Living Room': [
        'modern_living_couch_view',
        'cozy_living_bookshelf',
        'living_room_window_light',
        'living_room_corner_plants'
    ],
    'Kitchen': [
        'kitchen_countertop_morning',
        'kitchen_island_bright',
        'kitchen_window_herbs',
        'kitchen_sink_area'
    ],
    'Bathroom': [
        'bathroom_vanity_mirror',
        'bathroom_shower_tiles',
        'bathroom_sink_morning',
        'bathroom_window_steam'
    ],
    'Bedroom': [
        'bedroom_bed_morning',
        'bedroom_dresser_mirror',
        'bedroom_window_light',
        'bedroom_corner_cozy'
    ],
    'Home Office': [
        'office_desk_minimal',
        'office_bookshelf_bg',
        'office_window_light',
        'office_corner_plants'
    ],
    'Café': [
        'cafe_window_seat',
        'cafe_counter_bar',
        'cafe_corner_booth',
        'cafe_outdoor_patio'
    ],
    'Outdoors': [
        'outdoor_park_trees',
        'outdoor_street_urban',
        'outdoor_garden_green',
        'outdoor_balcony_city'
    ],
    'default': [
        'neutral_background_a',
        'neutral_background_b',
        'neutral_background_c'
    ]
};

/** Background descriptor text for each variation ID */
const BACKGROUND_DESCRIPTORS: Record<string, string> = {
    'modern_living_couch_view': 'background shows a modern sectional sofa with subtle throw pillows and a low coffee table',
    'cozy_living_bookshelf': 'background reveals a warm bookshelf arrangement with books and decorative objects',
    'living_room_window_light': 'background features large windows with natural light streaming in, soft curtains visible',
    'living_room_corner_plants': 'background shows indoor plants in ceramic pots near a corner with ambient lighting',
    'kitchen_countertop_morning': 'background displays clean marble countertops with morning light, minimal appliances',
    'kitchen_island_bright': 'background reveals a kitchen island with pendant lights and fresh produce',
    'kitchen_window_herbs': 'background shows kitchen window with potted herbs and natural daylight',
    'kitchen_sink_area': 'background features the sink area with dish rack and everyday kitchen items',
    'bathroom_vanity_mirror': 'background shows the vanity area with mirror reflection and ambient lighting',
    'bathroom_shower_tiles': 'background reveals tiled shower area with glass door, clean and modern',
    'bathroom_sink_morning': 'background displays bathroom sink with toiletries and morning light',
    'bathroom_window_steam': 'background shows frosted bathroom window with subtle steam ambiance',
    'bedroom_bed_morning': 'background reveals unmade bed with rumpled sheets and morning atmosphere',
    'bedroom_dresser_mirror': 'background shows bedroom dresser with mirror and personal items',
    'bedroom_window_light': 'background features bedroom window with soft curtains and natural light',
    'bedroom_corner_cozy': 'background displays cozy bedroom corner with throw blanket and soft textures',
    'office_desk_minimal': 'background shows minimal desk setup with laptop and stationery',
    'office_bookshelf_bg': 'background reveals organized bookshelf with books and plants',
    'office_window_light': 'background features office window with city or nature view',
    'office_corner_plants': 'background shows workspace corner with indoor plants and warm lighting',
    'cafe_window_seat': 'background reveals café window seat with street view and ambient lighting',
    'cafe_counter_bar': 'background shows coffee bar counter with equipment and menu boards',
    'cafe_corner_booth': 'background displays cozy café booth with exposed brick and soft lighting',
    'cafe_outdoor_patio': 'background features outdoor café patio with tables and string lights',
    'outdoor_park_trees': 'background shows park setting with trees and natural greenery',
    'outdoor_street_urban': 'background reveals urban street with buildings and pedestrians',
    'outdoor_garden_green': 'background displays garden with flowers and lush green plants',
    'outdoor_balcony_city': 'background shows balcony with city skyline view',
    'neutral_background_a': 'background features soft neutral tones with subtle depth',
    'neutral_background_b': 'background shows clean backdrop with gentle shadows',
    'neutral_background_c': 'background displays minimal setting with natural gradation'
};

/**
 * Select a background variation that differs from the last used one.
 * Returns null if environment has no defined pool.
 */
function selectBackgroundVariation(
    environment: string,
    lastBackgroundId: string | null | undefined
): string | null {
    const pool = BACKGROUND_VARIATION_POOLS[environment] || BACKGROUND_VARIATION_POOLS['default'];
    if (!pool || pool.length === 0) return null;

    // Filter out the last used background
    const available = lastBackgroundId
        ? pool.filter(id => id !== lastBackgroundId)
        : pool;

    // If pool exhausted (only had one item), allow repetition
    if (available.length === 0) {
        return pool[Math.floor(Math.random() * pool.length)];
    }

    return available[Math.floor(Math.random() * available.length)];
}

/**
 * Get the descriptor text for a background variation ID.
 */
function getBackgroundDescriptor(variationId: string | undefined): string | null {
    if (!variationId) return null;
    return BACKGROUND_DESCRIPTORS[variationId] || null;
}

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
    'Intentional smartphone camera': 'captured with a modern smartphone camera, stabilized grip, intentional framing, no selfie distortion',
    'DSLR / mirrorless camera': 'captured with a professional DSLR or mirrorless camera using premium glass, deep depth of field (f/8–f/11), and crisp detail',
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
    'Full body': 'full-length framing from head to toe, including ground contact and environmental elements around the subject'
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
    'Stressed but Determined': 'slightly stressed but determined expression, visible effort with inner strength',
    'Relieved / Recovered': 'relieved, recovered expression with a soft exhale, unclenched jaw, shoulders dropped, slight tired smile, calmer eyes'
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
    "Front camera, arm's length": "hyperrealistic and imperfect UGC front-camera selfie, basic phone camera quality, person holding phone at arm length, arm visible positioned as if holding the device but phone is not visible, short distance, slight natural selfie distortion, flat focus across entire frame, everything sharp foreground to background, authentic daily life look",
    "Front camera, close face": "close-up hyperrealistic front-camera selfie with natural imperfections, face dominant in frame, basic mobile sensor look, arm visible in foreground as if holding phone but phone itself is invisible, flat focus with everything sharp, casual handheld selfie feel",
    "Front camera, upper body": "hyperrealistic front-camera selfie showing upper torso, basic mobile quality, arm extended as if holding phone but phone invisible, flat focus across entire frame, everything in focus, casual daily life style",
    "Mirror selfie": "mirror selfie, phone reflected in mirror, camera held in hand, person looking at mirror reflection, medium distance, flat focus on mirror surface and reflection, everything sharp, bathroom or bedroom environment, authentic mirror selfie quality",
    "Back camera handheld": "handheld rear smartphone camera photo, basic sensor quality, arm visible in frame holding the perspective but phone invisible, natural arm-extended framing, flat focus throughout, everything sharp, authentic UGC handheld aesthetic",
    "Third-person phone shot": "photo taken by another person using a phone, subject not holding camera, casual friend perspective, basic mobile photo quality, flat focus throughout, everything sharp, authentic lifestyle UGC feel",
    "Casual angled selfie": "imperfectly angled hyperrealistic selfie, high-angle casual perspective, arm extended upward as if holding phone but phone invisible, basic camera sensor, flat focus throughout, everything sharp, spontaneous casual composition",
    "Friend holding phone": "candid selfie taken by a friend or second person, interaction with lens, basic phone photo quality, flat focus throughout, everything sharp, authentic UGC buddy shot",
    "Table propped phone": "selfie taken from a phone propped on a table, slightly low angle, self-timer aesthetic, flat focus throughout frame, everything sharp, authentic home-capture vibe",
    "Laptop webcam": "laptop webcam capture, basic low-resolution sensor look, screen glow reflection, flat focus across entire scene, authentic remote-work aesthetic"
};

// Deprecated - unified into SELFIE_TYPE_SEMANTIC_MAP
const SELFIE_EXECUTION_SEMANTIC_MAP: Record<string, string> = {};

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
    // Logging (dev only)
    if (process.env.NODE_ENV === 'development') {
        console.log('[MAP INPUT]', JSON.stringify(sceneState, null, 2));
    }

    if (sceneState.ugcRealMode && sceneState.sceneIntent === 'ecommerce') {
        console.error('[INVALID STATE BLOCKED] UGC Real Mode cannot run in ecommerce sceneIntent');
        throw new Error('Invalid state: ugcRealMode + ecommerce sceneIntent');
    }
    if (sceneState.compositionMode === 'Ecommerce Blank Space' && sceneState.sceneIntent === 'environment') {
        console.error('[INVALID STATE BLOCKED] Ecommerce Blank Space cannot run in environment sceneIntent');
        throw new Error('Invalid state: Ecommerce Blank Space + environment sceneIntent');
    }
    if (sceneState.creationMode === 'Ecommerce Blank Space' && sceneState.sceneIntent === 'environment') {
        console.error('[INVALID STATE BLOCKED] Ecommerce Blank Space cannot run in environment sceneIntent (creationMode)');
        throw new Error('Invalid state: Ecommerce Blank Space + environment sceneIntent (creationMode)');
    }
    if (sceneState.noPerson === false && sceneState.sceneIntent === 'ecommerce') {
        console.error('[INVALID STATE BLOCKED] Person cannot be enabled in ecommerce sceneIntent');
        throw new Error('Invalid state: person enabled in ecommerce sceneIntent');
    }
    if (sceneState.formulationStoryEnabled && sceneState.noPerson) {
        console.error('[INVALID STATE BLOCKED] Formulation Story requires person enabled');
        throw new Error('Invalid state: formulation story enabled with noPerson=true');
    }

    // ========================================================================
    // DEV VALIDATION: Environment Mode Rules (Phase 6)
    // ========================================================================
    if (process.env.NODE_ENV === 'development') {
        const envContext = sceneState.environmentContext;
        const isStudioMode = sceneState.sceneIntent === 'ecommerce' || sceneState.creationMode === 'studio';

        if (isStudioMode && envContext !== null && envContext !== undefined) {
            console.error('[ENV][INVALID] Studio mode cannot have environment:', envContext);
        }

        if (!isStudioMode && (!envContext || !envContext.macro)) {
            console.warn('[ENV][WARN] Lifestyle/UGC mode requires environmentContext.macro');
        }

        // Warn on legacy field usage
        if (sceneState.environment && sceneState.environment !== '') {
            console.warn('[PROMPT][ENV][LEGACY FIELD IGNORED] sceneState.environment detected, use environmentContext instead');
        }
        if ((sceneState as any).setting && (sceneState as any).setting !== '') {
            console.warn('[PROMPT][ENV][LEGACY FIELD IGNORED] sceneState.setting detected, use environmentContext instead');
        }
    }

    if (sceneState.sceneIntent === 'ecommerce') {
        console.log('[PRODUCT MODE ACTIVE]');
        return mapProductModeToPromptOptions(sceneState, existingOptions);
    }

    // ========================================================================
    // PRIORITY 1: PRODUCT MODE EXIT
    // ========================================================================
    console.log('[LIFESTYLE MODE ACTIVE]');

    // Initialize mapped options
    const identityContinuityRequested = sceneState.sameCreatorAcrossScenes === true;
    const identitySeed =
        identityContinuityRequested && existingOptions.identitySeed
            ? existingOptions.identitySeed
            : generateIdentitySeed();
    const mapped: Partial<PromptOptions> = {
        ...existingOptions,
        hasModelReference,
        identitySeed,
        ugcStyle: existingOptions.ugcStyle ?? 'optimized'
    };

    // Ritual Mode (Lifestyle-only)
    if ((sceneState as any).ritualModeEnabled === true) {
        (mapped as any).ritualModeActive = true;
        (mapped as any).ritualHideProduct = Boolean((sceneState as any).ritualHideProduct);
        (mapped as any).ritualNoObjects = Boolean((sceneState as any).ritualNoObjects);
        const activities = Array.isArray((sceneState as any).ritualActivities) ? (sceneState as any).ritualActivities : [];
        (mapped as any).ritualActivities = activities.filter((v: any) => typeof v === 'string' && v.trim());
        (mapped as any).ritualCustom = String((sceneState as any).ritualCustom ?? '').trim() || undefined;
    } else {
        (mapped as any).ritualModeActive = false;
        (mapped as any).ritualHideProduct = false;
        (mapped as any).ritualNoObjects = false;
        (mapped as any).ritualActivities = [];
        (mapped as any).ritualCustom = undefined;
    }
    const ugcStyleKey = String(mapped.ugcStyle ?? 'optimized').toLowerCase();
    mapped.sameCreatorAcrossScenes = sceneState.sameCreatorAcrossScenes;
    if (!identityContinuityRequested) {
        delete (mapped as any).identityLock;
    }

    // ========================================================================
    // IDENTITY MODE CONTROL (auto = different person, locked = same person)
    // ========================================================================
    const identityMode = hasModelReference ? 'locked' : identityContinuityRequested ? 'locked' : 'auto';
    mapped.identityMode = identityMode;

    if (identityMode === 'auto') {
        // Always generate NEW token for each render (breaks latent convergence)
        mapped.identityVariationToken = generateIdentityVariationToken();
        mapped.identityKey = undefined;
        console.log('[MAP] Identity mode: AUTO → new token:', mapped.identityVariationToken);
    } else {
        // locked: persist or create identity key
        mapped.identityKey = existingOptions.identityKey || generateIdentityKey();
        mapped.identityVariationToken = undefined;
        console.log('[MAP] Identity mode: LOCKED → key:', mapped.identityKey);
    }

    // Initialize Person Details
    if (!mapped.personDetails) mapped.personDetails = {};
    const personIncluded = !sceneState.noPerson;
    mapped.personIncluded = personIncluded;
    mapped.personCount = sceneState.personCount || 'single';
    mapped.coupleSex = sceneState.coupleSex || 'different';
    // Secondary person (Person B) handling for Couple:
    // - Age is honored whenever it differs from Person A (even if Advanced is OFF).
    // - The rest of Person B attributes require Advanced (editSecondaryPerson) to avoid unintended overrides.
    const secondaryDetails = (() => {
        if ((sceneState as any).personCount !== 'couple') return null;
        const isExplicit = (sceneState as any).editSecondaryPerson === true;
        const details: any = {};
        const pick = (key: string, targetKey: string = key) => {
            const value = String(((sceneState as any)[key] ?? '')).trim();
            if (value) details[targetKey] = value;
        };
        const pickNumber = (key: string, targetKey: string = key) => {
            const value = (sceneState as any)[key];
            if (typeof value === 'number' && Number.isFinite(value)) details[targetKey] = value;
        };
        const primaryAge = typeof (sceneState as any).age === 'number' ? (sceneState as any).age : null;
        const secondaryAge = (sceneState as any).secondaryAge;
        if (typeof secondaryAge === 'number' && Number.isFinite(secondaryAge)) {
            if (primaryAge === null || secondaryAge !== primaryAge) {
                details.age = secondaryAge;
            }
        }

        if (!isExplicit) {
            return Object.keys(details).length ? details : null;
        }

        pick('secondaryGender', 'gender');
        pick('secondaryEthnicity', 'ethnicity');
        pick('secondarySkinTone', 'skinTone');
        pick('secondaryEyeColor', 'eyeColor');
        pick('secondaryBodyType', 'bodyType');
        pick('secondaryHairLength', 'hairLength');
        pick('secondaryHairTexture', 'hairTexture');
        pick('secondaryHairColor', 'hairColor');
        return Object.keys(details).length ? details : null;
    })();
    if (secondaryDetails) {
        (mapped as any).secondaryPersonDetails = secondaryDetails;
    }

    const sceneIntent = sceneState.sceneIntent as 'environment' | 'ecommerce';
    mapped.sceneIntent = sceneIntent;
    const isEnvironmentSceneIntent = sceneIntent === 'environment';
    const isEcommerceSceneIntent = sceneIntent === 'ecommerce';
    const rawCreationMode = (sceneState.creationMode || '').toLowerCase();
    const isCreationModeEcommerceBlank =
        rawCreationMode === 'ecommerce blank space' || rawCreationMode === 'ecom-blank';
    const isCompositionModeEcommerceBlank = sceneState.compositionMode === 'Ecommerce Blank Space';
    const isEcommerceBlankSpaceActive = isEcommerceSceneIntent;
    const isUGCRealMode = !!sceneState.ugcRealMode;
    if (isUGCRealMode) {
        mapped.personCount = 'single';
        mapped.coupleSex = undefined;
        (mapped as any).secondaryPersonDetails = undefined;
        // UGC selfie rule: never show two hands (phone hand must not appear).
        if (personIncluded && (sceneState.productInteraction || '').trim().toLowerCase() === 'holding') {
            mapped.productInteraction = 'holding the product with exactly one hand (only that hand visible)';
            mapped.personDetails.productInteraction = 'holding the product with exactly one hand (only that hand visible)';
        }
    }
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

        if (!hasCustomClothes && macro.wardrobe) {
            console.log('[PRIORITY 3] Applying Hero Persona Wardrobe');
            wardrobeOverride = macro.wardrobe;
            mapped.wardrobeStyle = wardrobeOverride || undefined;
            mapped.personDetails.wardrobeStyle = wardrobeOverride || undefined;
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
        if (
            sceneState.ethnicity &&
            sceneState.ethnicity !== 'Prefer not to specify' &&
            sceneState.ethnicity !== 'Non-specific'
        ) {
            mapped.personDetails.ethnicity = sceneState.ethnicity;
        } else {
            delete mapped.personDetails.ethnicity;
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

        const normalizedSkinRealism = normalizeKey(sceneState.skinRealism);
        const editorialSkinRealism =
            // For older ages, avoid auto-upgrading to soft retouch (it collapses perceived age).
            ugcStyleKey === 'optimized' &&
                !sceneState.ugcRealMode &&
                personAge < 60 &&
                (normalizedSkinRealism === 'raw' || normalizedSkinRealism === 'natural')
                ? 'soft-retouch'
                : sceneState.skinRealism;
        const skinDescriptor = mapSkinRealism(editorialSkinRealism);
        if (skinDescriptor) {
            mapped.personDetails.skinRealism = skinDescriptor;
        }

        // OTHER PERSON DETAILS (Non-conflicting)
        const expressionLabel = expressionOverride || sceneState.facialExpression || 'Calm & Serene';
        const expressionSemantic =
            FACIAL_EXPRESSION_MAP[expressionLabel] || FACIAL_EXPRESSION_MAP['Calm & Serene'];
        mapped.personDetails.facialExpression = expressionSemantic;

        const eyeDirectionLabel = sceneState.eyeDirection || 'Looking at camera';
        // Expose the UI label for legacy/lifestyle builders that read top-level eyeDirection.
        mapped.eyeDirection = eyeDirectionLabel as any;
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
        if (identityContinuityRequested) {
            (mapped as any).identityLock = identityLock;
        }
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
            ? 'Ecommerce blank-space layout with pure white background, heavy negative space for UX overlays, and no environmental narrative.'
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
        mapped.productPlane =
            'Mid-ground contextual placement within the room or space. Keep the product and label tack sharp and fully readable; keep both the face and the product within depth of field. Do not blur or defocus the product.';
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
        mapped.ugcImperfectionLevel = sceneState.ugcImperfectionLevel || 'high';
    } else {
        mapped.ugcCaptureSituation = null;
        mapped.ugcImperfectionLevel = undefined;
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
    const normalizedPoseKey = normalizeKey(sceneState.pose);
    const foregroundProductFocusRequested =
        !sceneState.ugcRealMode &&
        isEnvironmentSceneIntent &&
        (productInteractionLabel === 'Presenting' || normalizedPoseKey === 'offer-to-lens-reach');
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
            'Front-facing phone camera with tiny sensor, flat focus across the entire frame, no background blur, no portrait mode, limited dynamic range, clipped highlights, crushed shadows, wobbling handheld geometry.';
        console.log('[MAP] camera: raw domestic front camera enforced');
    } else {
        const defaultCameraLabel = 'DSLR / mirrorless camera';
        const cameraDevice = (sceneState as any).cameraType || defaultCameraLabel;
        const cameraDeviceSemantic = CAMERA_DEVICE_SEMANTIC_MAP[cameraDevice] || CAMERA_DEVICE_SEMANTIC_MAP[defaultCameraLabel];
        const shouldForceEnvironmentSmartphone =
            isEnvironmentSceneIntent && (ugcStyleKey === 'natural' || ugcStyleKey === 'raw');
        let effectiveCameraSemantic = shouldForceEnvironmentSmartphone
            ? 'Handheld smartphone perspective capturing natural perspective, emphasizing the surrounding environment.'
            : cameraDeviceSemantic;
        if (foregroundProductFocusRequested) {
            // Avoid semantics that encourage focusing on the face/background when the product must be foreground.
            effectiveCameraSemantic = effectiveCameraSemantic
                .replace(/shallow depth of field/gi, 'controlled depth of field')
                .replace(/crisp subject separation/gi, 'crisp overall clarity');
            effectiveCameraSemantic +=
                ' Focus priority: lock focus on the product in the foreground; the product label must be tack sharp and fully readable.';
        }
        mapped.camera = cameraDevice;
        mapped.cameraDeviceSemantic = effectiveCameraSemantic;
        console.log('[MAP] camera:', cameraDevice, '→', effectiveCameraSemantic);
    }

    // For environment-first scenes, the default is mid-ground contextual placement.
    // However, if the user is explicitly presenting the product toward camera, force product-forward framing.
    if (foregroundProductFocusRequested) {
        mapped.placementStyle =
            'Product-forward placement: the product is the primary hero in the foreground while the environment remains visible as context.';
        mapped.productPlane =
            'Foreground product-first placement closest to the camera lens; product and label must be tack sharp and fully readable; do not let the product fall into the background.';
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

    // CANONICAL SOURCE: environmentContext
    // Rule: If environmentContext === null → Studio mode, no environment
    // Rule: If environmentContext.macro → use that as environment source
    const envContext = sceneState.environmentContext;

    if (envContext === null) {
        // Studio mode: HARD NULL - no environment allowed
        (mapped as any).selectedEnvironment = '';
        (mapped as any).customEnvironment = '';
        mapped.setting = '';
        mapped.microLocation = '';
        (mapped as any).sceneEnvironment = '';
        mapped.environmentOrder = '';
        console.log('[MAP] environmentContext === null (Studio mode) - environment fully suppressed');
    } else if (envContext && envContext.macro) {
        // Lifestyle/UGC: Use environmentContext as source of truth
        const macro = envContext.macro;
        const micro = envContext.micro || macro;

        const allowedMacroSet = new Set([
            'Kitchen',
            'Living Room',
            'Bedroom',
            'Bathroom',
            'Workspace',
            'Hallway',
            'Home Gym',
            'Balcony / Indoor Terrace',
            'Urban Exterior',
            'Natural Exterior',
            'Parking Lot',
            'Backyard / Patio',
            'Street Corner',
        ]);
        const isCustomMacro = !allowedMacroSet.has(macro);

        mapped.setting = macro;
        // Avoid leaking indoor defaults (e.g. Countertop) into outdoor/custom environments.
        // If user didn't provide a meaningful micro-location, prefer leaving it blank.
        mapped.microLocation =
            isCustomMacro && (micro === 'Countertop' || micro === macro) ? '' : micro;
        (mapped as any).sceneEnvironment = macro;
        mapped.environmentOrder = macro;
        (mapped as any).selectedEnvironment = isCustomMacro ? 'Custom' : macro;
        (mapped as any).customEnvironment = isCustomMacro ? macro : '';

        console.log('[MAP] environmentContext:', { macro, micro }, '→ setting:', mapped.setting);
    } else if (isEcommerceBlankSpaceActive) {
        const ugcIndoorEnvironments = new Set([
            'Kitchen',
            'Living Room',
            'Bedroom',
            'Bathroom',
            'Workspace',
            'Hallway',
            'Home Gym',
            'Balcony / Indoor Terrace'
        ]);

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
            'Home Gym',
            'Balcony / Indoor Terrace'
        ];

        const selectedEnvironment = sceneState.environment || '';
        const customEnvironmentValue = (sceneState.customEnvironment || '').trim();

        if (
            isUGCRealMode &&
            selectedEnvironment &&
            selectedEnvironment !== 'Custom' &&
            !ugcIndoorEnvironments.has(selectedEnvironment)
        ) {
            console.error('[INVALID STATE BLOCKED] Outdoor environments are disabled in UGC');
            throw new Error('Invalid state: outdoor environment selected in UGC');
        }

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

    // ========================================================================
    // BACKGROUND VARIATION (auto mode by default)
    // ========================================================================
    const bgVariationMode = existingOptions.backgroundVariationMode || 'auto';
    mapped.backgroundVariationMode = bgVariationMode;

    if (bgVariationMode === 'auto' && mapped.setting) {
        const lastBgId = existingOptions.lastBackgroundId || null;
        const envKey =
            (sceneState.environment || '').trim() === 'Custom'
                ? mapped.setting
                : (sceneState.environment || mapped.setting);
        const newBgId = selectBackgroundVariation(envKey, lastBgId);
        if (newBgId) {
            mapped.backgroundVariationId = newBgId;
            mapped.lastBackgroundId = newBgId;
            const bgDescriptor = getBackgroundDescriptor(newBgId);
            if (bgDescriptor) {
                (mapped as any).backgroundVariationDescriptor = bgDescriptor;
            }
            console.log('[MAP] Background variation:', lastBgId, '→', newBgId);
        }
    } else if (bgVariationMode === 'locked' && existingOptions.backgroundVariationId) {
        // Keep locked background
        mapped.backgroundVariationId = existingOptions.backgroundVariationId;
        mapped.lastBackgroundId = existingOptions.backgroundVariationId;
    }

    const sceneOrderChaosValue = (!sceneState.ugcRealMode && ugcStyleKey === 'optimized'
        ? 'clean'
        : (sceneState.sceneOrderChaos || 'Normal').toLowerCase()) as SceneOrderChaosLevel;
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
                : 'Pure white background with neutral studio lighting, flat even illumination, and only a subtle contact shadow directly beneath the product.';
        (mapped as any).timeLightingContext = mapped.lighting;
        console.log('[MAP] Ecommerce Blank Space lighting enforced:', mapped.lighting);
    } else {
        const timeSemantic = TIME_SEMANTIC_MAP[sceneState.timeOfDay] || TIME_SEMANTIC_MAP['Midday'];
        const lightingStyleLabel = sceneState.lightingStyle || 'Natural window';
        const looksOutdoor = (() => {
            const s = String(mapped.setting || '').trim();
            if (!s) return false;
            if (OUTDOOR_ENVIRONMENT_LABELS.has(s)) return true;
            const lower = s.toLowerCase();
            return (
                lower.includes('park') ||
                lower.includes('beach') ||
                lower.includes('street') ||
                lower.includes('rooftop') ||
                lower.includes('patio') ||
                lower.includes('garden') ||
                lower.includes('trail') ||
                lower.includes('lake') ||
                lower.includes('mountain') ||
                lower.includes('forest')
            );
        })();

        let lightingSemantic =
            LIGHTING_SEMANTIC_MAP[lightingStyleLabel] || LIGHTING_SEMANTIC_MAP['Natural window'];
        if (looksOutdoor) {
            lightingSemantic = lightingSemantic
                .replace(/natural window light/gi, 'natural sunlight')
                .replace(/window light/gi, 'sunlight')
                .replace(/indoor artificial/gi, 'artificial lighting')
                .replace(/inside/gi, 'outdoors');
        }

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

    const isEcommerceCanvasActive =
        isEnvironmentSceneIntent &&
        sceneState.ecommerceSidePlacementFlag === true;

    if (isEcommerceSceneIntent) {
        mapped.sidePlacement = (sceneState.sidePlacement?.toLowerCase() || 'center') as any;
        mapped.ecommerceSidePlacementFlag = true;
    } else if (isEcommerceCanvasActive) {
        if (sceneState.ugcRealMode) {
            console.error('[INVALID STATE BLOCKED] Hero canvas cannot be used in UGC Real Mode');
            throw new Error('Invalid state: hero canvas + ugcRealMode');
        }

        const sidePlacementRaw = (sceneState.sidePlacement || 'Center').toLowerCase();
        const sidePlacement =
            sidePlacementRaw.includes('left') ? 'left' :
                sidePlacementRaw.includes('right') ? 'right' :
                    'center';

        mapped.sidePlacement = sidePlacement as any;
        mapped.ecommerceSidePlacementFlag = true;
        (mapped as any).ecommerceSidePlacement = sidePlacement;

        if (sceneState.ecommerceBackgroundMode === 'gradient') {
            const angle = parseInt(sceneState.ecommerceGradientAngle || '90', 10) || 90;
            mapped.bgGradient = {
                startColor: sceneState.ecommerceGradientStart || '#f7f7f7',
                endColor: sceneState.ecommerceGradientEnd || '#d9d9d9',
                angle
            };
            delete mapped.bgColor;
        } else {
            mapped.bgColor = (sceneState.ecommerceBackgroundColor || '#FFFFFF').toUpperCase();
            delete mapped.bgGradient;
        }

        mapped.creationMode = 'bg-replace';
        mapped.creationModeStructural =
            'Background replacement mode: preserve the subject and replace the original environment with a neutral hero canvas.';
        mapped.compositionModeStructural =
            'Blank-space layout on a neutral canvas; no environment context.';

        // Suppress environment-style placement hints when canvas is active
        delete mapped.placementStyle;
        delete mapped.productPlane;

        // Scene order / chaos is an environment signal; suppress for canvas
        delete mapped.sceneOrderChaos;
        delete (mapped as any).sceneOrderChaosDescriptor;

        // Suppress environment output when canvas is active (keep person + lighting)
        mapped.setting = '';
        mapped.microLocation = '';
        (mapped as any).sceneEnvironment = '';
        mapped.environmentOrder = '';
        delete (mapped as any).sceneEnvironmentDescriptor;
        delete (mapped as any).backgroundVariationDescriptor;
        delete mapped.backgroundVariationId;
        delete mapped.lastBackgroundId;
    } else {
        delete mapped.sidePlacement;
        delete mapped.ecommerceSidePlacementFlag;
        delete (mapped as any).ecommerceSidePlacement;
        delete mapped.bgColor;
        delete mapped.bgGradient;
    }

    // ========================================================================
    // OUTPUT FORMAT → Aspect Ratio
    // ========================================================================
    const aspectRatioMap: Record<string, string> = {
        '1:1 (Square)': '1:1',
        '4:5 (Portrait)': '4:5',
        '9:16 (Story)': '9:16',
        '16:9 (Landscape)': '16:9'
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
    mapped.formulationExpertAttire = sceneState.formulationAttire as ExpertAttire;
    mapped.formulationBadgeEnabled = sceneState.formulationBadgeEnabled;
    mapped.formulationStory = buildFormulationStoryOptions(sceneState);
    (mapped as any).formulationTone =
        (sceneState as any).formulationTone || 'calm, grounded, everyday';

    // ========================================================================
    // CONTENT STYLE & CREATION INTENT
    // ========================================================================
    mapped.creationIntent = sceneState.creationIntent;
    mapped.contentStyle = 'ugc';

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
        let selfieSemantic = (
            // @ts-ignore
            SELFIE_TYPE_SEMANTIC_MAP[sceneState.selfieMode] ||
            // @ts-ignore
            sceneState.selfieMode
        );

        // Inject camera tilt for UGC Real Mode selfies
        if (sceneState.ugcRealMode) {
            const tilts = [6, -6, 10, -10];
            // Use the seed for deterministic randomness if available
            const seedNum = parseInt(sceneState.seed || '0', 10) || Math.floor(Math.random() * 1000);
            const selectedTilt = tilts[seedNum % tilts.length];
            selfieSemantic = `${selfieSemantic}, imperfect camera tilt of ${selectedTilt} degrees for handheld realism`.replace(/\s+/g, ' ').trim();
            console.log('[MAP] UGC Selfie Tilt injected:', selectedTilt, 'degrees');
        }

        mapped.selfieMode = selfieSemantic;
        mapped.personDetails.selfieMode = selfieSemantic;
        mapped.selfieType = selfieSemantic; // Legacy
        mapped.personDetails.selfieType = selfieSemantic; // Legacy

        console.log('[MAP] selfieMode:', sceneState.selfieMode, '→', selfieSemantic);
    }

    const captureBaseId = normalizedCaptureBase[0];
    const captureBaseIsSelfie =
        captureBaseId === 'torso-level-handheld' ||
        captureBaseId === 'high-angle' ||
        captureBaseId === 'close-face' ||
        captureBaseId === 'propped-surface';
    const uiSelfieUnset = !sceneState.selfieMode || sceneState.selfieMode === 'None';
    if (!matchesMultiProduct && captureBaseIsSelfie && uiSelfieUnset) {
        mapped.selfieMode = captureBaseId;
        mapped.selfieType = captureBaseId;
        if (mapped.personDetails) {
            mapped.personDetails.selfieMode = captureBaseId;
            mapped.personDetails.selfieType = captureBaseId;
        }
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
            mapped.camera = 'Intentional smartphone camera';
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
        const isEcommerceCanvasOverlay =
            mapped.creationMode === 'bg-replace' &&
            mapped.ecommerceSidePlacementFlag === true &&
            (Boolean(mapped.bgColor) || Boolean(mapped.bgGradient));

        if (!isEcommerceCanvasOverlay) {
            delete mapped.bgColor;
            delete mapped.bgGradient;
        }
        delete (mapped as any).ageGroup;
        mapped.creationMode = mapped.creationMode || 'lifestyle';
        mapped.creationModeStructural =
            mapped.creationModeStructural ||
            'Environment-first lifestyle composition keeping the product grounded within the lived-in room.';
        mapped.cameraDeviceSemantic =
            mapped.cameraDeviceSemantic ||
            'Handheld smartphone perspective capturing natural perspective, emphasizing the surrounding environment.';
    }

    // ========================================================================
    // PRODUCT STUDIO FIELDS → Pass to PromptEngine
    // ========================================================================
    if (sceneState.studioPhotoMode) {
        (mapped as any).photoMode = sceneState.studioPhotoMode;
        (mapped as any).studioPhotoMode = sceneState.studioPhotoMode;
    }
    if (sceneState.studioAlignment) {
        (mapped as any).studioComposition = sceneState.studioAlignment;
    }
    if (sceneState.studioShadow) {
        (mapped as any).studioShadow = sceneState.studioShadow;
    }
    // RULE: Props ONLY enabled when photoMode === 'Ingredient Stack'
    const isIngredientStack = sceneState.studioPhotoMode === 'Ingredient Stack';
    if (sceneState.studioProps && isIngredientStack) {
        (mapped as any).studioProps = sceneState.studioProps;
        (mapped as any).suggestedProps = sceneState.studioProps;
    } else if (sceneState.studioProps && !isIngredientStack) {
        console.log('[MAP] Props ignored - only allowed with Ingredient Stack photoMode');
    }
    if (sceneState.studioCustomHeroCue) {
        (mapped as any).studioCustomHeroCue = sceneState.studioCustomHeroCue;
        (mapped as any).customHeroCue = sceneState.studioCustomHeroCue;
    }
    if (sceneState.studioInteraction) {
        (mapped as any).studioInteraction = sceneState.studioInteraction;
    }
    if (sceneState.studioLens) {
        (mapped as any).studioLens = sceneState.studioLens;
    }
    if (sceneState.studioLightingRig) {
        (mapped as any).studioLightingRig = sceneState.studioLightingRig;
    }
    if (sceneState.studioFinish) {
        (mapped as any).studioFinish = sceneState.studioFinish;
    }
    if (sceneState.studioBackgroundColor) {
        (mapped as any).backgroundColor = sceneState.studioBackgroundColor;
    }
    if (sceneState.studioAccentColor) {
        (mapped as any).paletteColor3 = sceneState.studioAccentColor;
    }
    if (process.env.NODE_ENV === 'development') {
        console.log('[MAP] Product Studio fields injected:', {
            photoMode: sceneState.studioPhotoMode,
            alignment: sceneState.studioAlignment,
            shadow: sceneState.studioShadow,
            props: sceneState.studioProps,
            lens: sceneState.studioLens,
            lightingRig: sceneState.studioLightingRig,
            finish: sceneState.studioFinish,
            backgroundColor: sceneState.studioBackgroundColor,
            accentColor: sceneState.studioAccentColor,
        });
        console.log('[MAP OUTPUT]', JSON.stringify(mapped, null, 2));
    }

    return mapped;
}
