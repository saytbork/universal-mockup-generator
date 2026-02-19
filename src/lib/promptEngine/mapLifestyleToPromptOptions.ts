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
import type {
    CustomClothes,
    FormulationStoryOptions,
    IdentityLock,
    PersonDetails,
    PromptOptions,
    SceneOrderChaosLevel,
    UGCRealModeLayerSet
} from './types';
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

const isNoEnvironmentSelection = (value?: string | null): boolean => {
    const normalized = String(value ?? '').trim().toLowerCase();
    return normalized === '' || normalized === 'none' || normalized === 'null';
};

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
    'Warm Studio': 'apothecary_lab',
    'None': 'none'
};

const ROLE_LABELS: Record<ExpertRole, string> = {
    none: '',
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
    none: 'regular clothing in neutral tones (beige, white, black, gray, or brown). No medical uniform, no scrubs, no lab coat.',
    white_medical_coat: 'a white medical coat over professional attire',
    white_scrubs: 'white medical scrubs',
    light_blue_scrubs: 'light blue scrubs',
    burgundy_scrubs: 'burgundy scrubs',
    green_scrubs: 'green scrubs'
};

const EXPERT_ROLE_FOCUS_MAP: Record<ExpertRole, FormulationStoryOptions['professionalFocus']> = {
    none: 'custom',
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
    const isCustom = sceneState.labVibe === 'Custom';
    const labVibe = isCustom ? 'none' : (FORMULATION_LAB_VIBE_MAP[sceneState.labVibe] ?? 'none');
    const labVibeCustom = isCustom ? (sceneState.labVibeCustom?.trim() || undefined) : undefined;

    const roleLabel =
        sceneState.expertRole === 'custom'
            ? (sceneState.expertRoleCustom?.trim() || 'formulation expert')
            : (ROLE_LABELS[sceneState.expertRole] ?? 'medical expert');

    const attireDescription =
        sceneState.expertAttire === 'none'
            ? ATTIRE_DESCRIPTIONS.none
            : (ATTIRE_DESCRIPTIONS[sceneState.expertAttire] ?? 'professional medical attire');

    return {
        professionalFocus: focus,
        expertName: sceneState.expertName?.trim() || undefined,
        roleCredentials: sceneState.expertCredentials?.trim() || undefined,
        labVibe,
        labVibeCustom,
        expertRole: sceneState.expertRole,
        expertRoleLabel: roleLabel || undefined,
        expertAttire: sceneState.expertAttire === 'none' ? undefined : sceneState.expertAttire,
        expertAttireDescription: attireDescription,
        badgePreference: sceneState.expertBadgePreference
    };
};

/**
 * CAMERA DEVICE → Physical capture characteristics and lens behavior
 */
const CAMERA_DEVICE_SEMANTIC_MAP: Record<string, string> = {
    'Intentional smartphone camera': 'captured with a modern smartphone camera (tiny sensor, wide fixed lens), flat focus across the entire frame, everything sharp foreground to background, no portrait mode, no background blur',
    'DSLR / mirrorless camera': 'captured with a professional DSLR or mirrorless camera using premium glass, deep depth of field (f/8–f/11), and crisp detail',
    'Cinema camera rig': 'captured on a cinema camera with controlled rigs, smooth motion, and filmic dynamic range',
    'Medium format studio camera': 'captured on a medium-format studio system with tethered capture for ultra-sharp detail and tonal accuracy',
    'Laptop webcam (pro setup)': 'captured through a laptop webcam in a professional setting, flat lighting, slight compression, intentional composition'
};

const PRODUCT_PROMINENCE_CONFIG: Record<
    'balanced' | 'product-first' | 'model-first' | 'fifty-fifty',
    { placementStyle: string; productPlane: string }
> = {
    balanced: {
        placementStyle:
            'Balanced placement: product and person share attention while the environment supports the moment without stealing focus.',
        productPlane:
            'Balanced plane: keep both the face and the product in focus at the same time; the product label must be tack sharp and fully readable. Avoid heavy background blur that hides the product; avoid tiny product-in-frame compositions.',
    },
    'product-first': {
        placementStyle:
            'Product-forward placement: the product is the primary hero in the foreground while the environment remains visible as context.',
        productPlane:
            'Foreground product-first placement closest to the camera lens; product and label must be tack sharp and fully readable; do not let the product fall into the background. Scale requirement: product must be large enough that label text reads clearly (avoid tiny product-in-frame compositions). The product sits closer to the camera than the face; the face must not obscure or dominate the product.',
    },
    'model-first': {
        placementStyle:
            'Person-forward placement: the person is the hero while the product remains clearly visible and believable within the scene.',
        productPlane:
            'Person-forward plane: keep the person prominent without pushing the product into a second plane. Keep the product on the same visual plane and tack sharp with a fully readable label; never place it in deep background or out of focus.',
    },
    'fifty-fifty': {
        placementStyle:
            'Equal emphasis placement: person and product share prominence with tight, intentional framing.',
        productPlane:
            'Equal emphasis plane: place the product and the face in the foreground together. Tight framing where both elements share prominence. Keep both the face and the product label tack sharp and readable; avoid compositing or unrealistic scale differences.',
    },
};

/**
 * SHOT TYPE → Physical camera framing (SIMPLIFIED)
 */
const SHOT_TYPE_SEMANTIC_MAP: Record<string, string> = {
    'Extreme close-up': 'extreme close-up framing emphasizing fine detail such as skin texture, fingertips, or specific product features',
    'Close': 'tight close-up showing face and upper shoulders with minimal background, focused on expression and product proximity',
    'Medium': 'medium framing from mid-torso up, balanced view of face, hands, and immediate environment',
    'Wide': 'wide framing capturing the person within their surroundings, showing more of the room or setting for context',
    'Full body': 'extended framing from waist to top of head (3/4 body), showing full torso, arms, and upper environment; feet and floor may be excluded to keep product properly sized'
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

const LIFESTYLE_9X16_VERTICAL_FILL_RULE =
    'VERTICAL FILL RULE (CRITICAL): The subject must occupy at least 85–90% of the vertical frame height. The head should be positioned close to the top edge of the frame. Feet may be partially cropped if necessary. No excessive empty space above or below the subject.';

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
    'Holding': 'hands naturally holding the product in the FOREGROUND, closer to the camera lens than the face. Product is the primary subject; label faces camera and stays fully readable. Do not place the product behind the person.',
    'Using': 'hands actively using the product while keeping the product in the FOREGROUND and fully readable. Product remains the primary subject; no blur or defocus on the product/label.',
    'Presenting': 'product extended toward camera with natural wrist motion, held closest to lens. Product is the primary subject; label faces camera and stays fully readable without forced styling.',
    'Unboxing / Open Box': 'hands opening packaging or revealing the product inside with natural curiosity',
    'Showing to Camera': 'product held outward toward camera lens, hand angled to display product label or design',
    'Unboxing': 'hands in process of opening product packaging, revealing contents with natural excitement',
    'Applying': 'hands applying product to skin or surface with natural spreading or dabbing motion',
    'Placing on Surface': 'hands lowering product onto surface, fingers releasing grip, natural placement motion'
};

const UGC_HAND_SAFETY_RULE =
    'HAND SAFETY (CRITICAL): Avoid any complex finger poses. No interlaced fingers, no fingertip-to-fingertip framing, no symmetric “triangle grip”. If hands appear, show at most one hand, keep fingers mostly hidden behind the product, allow partial crop, and keep a relaxed natural grip. Hands must be anatomically correct (5 fingers), natural proportions, no deformations.';

const LIFESTYLE_HAND_SAFETY_RULE = [
    'LIFESTYLE HAND SAFETY (CRITICAL):',
    'Maximum one hand visible.',
    'Never show two hands.',
    'Only relaxed natural grip.',
    'No symmetric poses.',
    'No triangle grip.',
    'No fingertip-to-fingertip framing.',
    'Hand may be partially cropped.',
    'Hands must be anatomically correct (5 fingers).',
    'No extra fingers.',
    'No missing fingers.',
    'No twisted joints.',
    'No CGI, doll, or AI hands.',
].join(' ');

function isHandInteractionLabel(label: string): boolean {
    const normalized = String(label || '').trim().toLowerCase();
    return (
        normalized === 'holding' ||
        normalized === 'presenting' ||
        normalized === 'showing to camera' ||
        normalized === 'placing on surface' ||
        normalized === 'using' ||
        normalized === 'applying' ||
        normalized === 'unboxing' ||
        normalized === 'unboxing / open box'
    );
}

function resolveUgcInteractionSemantic(label: string, usage?: string): string {
    const normalized = String(label || '').trim();
    const base = (() => {
        switch (normalized) {
            case 'Holding':
            case 'Presenting':
            case 'Showing to Camera':
                // UGC should not look like a centered hero presentation; also reduces hand failure rate.
                return 'Product is placed on a nearby surface within the environment (bench, shelf, floor mat edge). No hands in frame. Product remains clearly visible and readable but not forced into a centered presentation pose.';
            case 'Placing on Surface':
                return 'Hands briefly place the product onto a nearby surface, then hands exit the frame. Keep the gesture simple and partially cropped.';
            case 'Using':
            case 'Applying':
                return 'Hands interact naturally while keeping the gesture simple and partially cropped. Avoid complex finger articulation; product remains visible.';
            case 'Unboxing':
            case 'Unboxing / Open Box':
                return 'Packaging is partially opened with minimal hand visibility; keep hands mostly out of frame and avoid complex finger poses.';
            default:
                return INTERACTION_SEMANTIC_MAP[normalized] || normalized;
        }
    })();

    const parts = [base];
    if (normalized === 'Using' && usage?.trim()) {
        parts.push(usage.trim());
    }
    parts.push(UGC_HAND_SAFETY_RULE);
    return parts.filter(Boolean).join(' ');
}

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
    'Product First': 'product-first composition: product is the hero with person supporting the story, product as primary focus',
    'Balanced': 'balanced composition: equal attention to product and person, harmonious visual weight',
    'Fifty / Fifty': 'fifty-fifty composition: equal visual weight given to product and model with tight framing',
    'Model First': 'model-first composition: person is the hero with product naturally integrated into the lifestyle moment',
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

    const creationModeRaw = String(sceneState.creationMode || '').trim().toLowerCase();
    const contentStyleRaw = String((sceneState as any).contentStyle || '').trim().toLowerCase();
    const personIncludedSignal =
        (sceneState as any).personIncluded === true ||
        sceneState.noPerson === false;
    const forceLifestyleEngine =
        creationModeRaw === 'aesthetic' ||
        contentStyleRaw === 'ugc' ||
        personIncludedSignal === true;

    if (!forceLifestyleEngine && sceneState.ugcRealMode && sceneState.sceneIntent === 'ecommerce') {
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
    if (!forceLifestyleEngine && sceneState.noPerson === false && sceneState.sceneIntent === 'ecommerce') {
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

    const activeEngine =
        !forceLifestyleEngine && sceneState.sceneIntent === 'ecommerce'
            ? 'studio'
            : 'lifestyle';
    console.log('[ENGINE ACTIVE]', activeEngine);

    if (activeEngine === 'studio') {
        console.log('[PRODUCT MODE ACTIVE]');
        return mapProductModeToPromptOptions(sceneState);
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
        ugcStyle: existingOptions.ugcStyle ?? 'optimized',
        placement: sceneState.placement,
    };

    // Formulation Story can optionally hide the product entirely (scene-only).
    if (sceneState.formulationStoryEnabled && sceneState.formulationProductVisible === false) {
        (mapped as any).forceHideProduct = true;
    }
    const forceHideProductRequested = (mapped as any).forceHideProduct === true;
    const hasUploadedProductAsset = (existingOptions.productAssets?.length ?? 0) > 0;
    const ritualHideProductRequested =
        (sceneState as any).ritualModeEnabled === true && Boolean((sceneState as any).ritualHideProduct);

    // Ritual Mode (Lifestyle-only)
    if ((sceneState as any).ritualModeEnabled === true) {
        (mapped as any).ritualModeActive = true;
        (mapped as any).ritualHideProduct = Boolean((sceneState as any).ritualHideProduct);
        (mapped as any).ritualNoObjects = Boolean((sceneState as any).ritualNoObjects);
        (mapped as any).ritualCoupleStaging = String((sceneState as any).ritualCoupleStaging ?? '').trim() || undefined;
        (mapped as any).ritualPosture = String((sceneState as any).ritualPosture ?? '').trim() || undefined;
        const activities = Array.isArray((sceneState as any).ritualActivities) ? (sceneState as any).ritualActivities : [];
        (mapped as any).ritualActivities = activities.filter((v: any) => typeof v === 'string' && v.trim());
        (mapped as any).ritualCustom = String((sceneState as any).ritualCustom ?? '').trim() || undefined;
    } else {
        (mapped as any).ritualModeActive = false;
        (mapped as any).ritualHideProduct = false;
        (mapped as any).ritualNoObjects = false;
        (mapped as any).ritualCoupleStaging = undefined;
        (mapped as any).ritualPosture = undefined;
        (mapped as any).ritualActivities = [];
        (mapped as any).ritualCustom = undefined;
    }
    const ugcStyleKey = String(mapped.ugcStyle ?? 'optimized').toLowerCase();
    mapped.sameCreatorAcrossScenes = sceneState.sameCreatorAcrossScenes;
    
    // ========================================================================
    // UGC FULL AUTOMATION MODE (Maximum entropy: ignores ALL manual controls)
    // ========================================================================
    // ONLY active when:
    // 1. UGC Real Mode is ON
    // 2. No Model Reference (Model Reference always wins)
    // 3. User explicitly enabled Full Automation
    mapped.randomFullAutomationActive =
        Boolean(sceneState.isRandomFullAutomationEnabled) &&
        Boolean(sceneState.ugcRealMode) &&
        !hasModelReference;
    
    // Set alias for identity builder
    mapped.fullAutomationMode = mapped.randomFullAutomationActive;
    
    // Pass gender preference for Full Automation mode
    if (mapped.randomFullAutomationActive) {
        mapped.fullAutomationGenderPreference = sceneState.fullAutomationGenderPreference || 'any';
    }
    
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
    mapped.coupleSex = mapped.personCount === 'couple' ? (sceneState.coupleSex || 'different') : undefined;
    (mapped as any).coupleStaging =
        mapped.personCount === 'couple' ? String((sceneState as any).coupleStaging ?? '').trim() || undefined : undefined;
    // Couple semantics:
    // - Person A uses all explicit UI controls
    // - Person B can be explicitly configured (basic identity), otherwise it is derived automatically
    // - Age coherence: default Person B age = Person A age ± random(2–6), never > 8, never below 18.
    const isCouple = mapped.personCount === 'couple';
    const isNoPerson = Boolean((sceneState as any).noPerson);
    if (isCouple && isNoPerson) {
        throw new Error('COUPLE VALIDATION: Person count is Couple but noPerson is enabled.');
    }

    const hashString = (input: string): number => {
        let hash = 5381;
        for (let i = 0; i < input.length; i++) {
            hash = ((hash << 5) + hash) ^ input.charCodeAt(i);
        }
        return hash >>> 0;
    };

    const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

    const deriveCoupleSecondaryAge = (primaryAge: number, token: string) => {
        const h = hashString(`${token}::secondary-age`);
        const offset = 2 + (h % 5); // 2–6
        const sign = ((h >> 3) & 1) === 0 ? -1 : 1;
        const minAge = 18;
        const maxAge = 90;
        const raw = primaryAge + sign * offset;
        // Avoid teen/elder mismatch and out-of-range
        const clamped = clamp(raw, minAge, maxAge);
        // Ensure delta is within 2–6 and not >8
        const delta = Math.abs(clamped - primaryAge);
        if (delta < 2) return clamp(primaryAge + 2, minAge, maxAge);
        if (delta > 8) return clamp(primaryAge + 6, minAge, maxAge);
        return clamped;
    };

    if (isCouple) {
        const primaryAgeRaw = (sceneState as any).age;
        const primaryAge =
            typeof primaryAgeRaw === 'number' && Number.isFinite(primaryAgeRaw) ? Number(primaryAgeRaw) : 30;
        const token = String(mapped.identityVariationToken || mapped.identityKey || mapped.seed || 'couple');
        const derivedSecondaryAge = deriveCoupleSecondaryAge(primaryAge, token);

        const primaryGender = String((sceneState as any).gender || '').trim();
        const coupleSex = mapped.coupleSex || 'different';
        const derivedSecondaryGender = (() => {
            const g = primaryGender.toLowerCase();
            if (!primaryGender) return null;
            if (coupleSex === 'same') return primaryGender;
            if (coupleSex !== 'different') return null;
            if (g.includes('female')) return 'Male';
            if (g.includes('male')) return 'Female';
            return null;
        })();

        const editSecondaryPerson = Boolean((sceneState as any).editSecondaryPerson);
        const secondaryAgeRaw = (sceneState as any).secondaryAge;
        const secondaryAgeExplicit =
            typeof secondaryAgeRaw === 'number' && Number.isFinite(secondaryAgeRaw) ? Number(secondaryAgeRaw) : null;
        const secondaryAge = editSecondaryPerson && typeof secondaryAgeExplicit === 'number' ? secondaryAgeExplicit : derivedSecondaryAge;
        mapped.secondaryAgeDerived = !editSecondaryPerson;

        const secondaryGenderRaw = String((sceneState as any).secondaryGender ?? '').trim();
        const secondaryGender = editSecondaryPerson && secondaryGenderRaw ? secondaryGenderRaw : derivedSecondaryGender;

        const primaryEthnicity = String((sceneState as any).ethnicity ?? '').trim();
        const primarySkinTone = String((sceneState as any).skinTone ?? '').trim();
        const primaryEyeColor = String((sceneState as any).eyeColor ?? '').trim();
        const primaryBodyType = String((sceneState as any).bodyType ?? '').trim();
        const primaryHairLength = String((sceneState as any).hairLength ?? '').trim();
        const primaryHairTexture = String((sceneState as any).hairTexture ?? '').trim();
        const primaryHairColor = String((sceneState as any).hairColor ?? '').trim();

        const secondaryPersonDetails: Partial<PersonDetails> = {
            age: secondaryAge,
            ...(secondaryGender ? { gender: secondaryGender } : {}),
        };

        if (editSecondaryPerson) {
            const secondaryEthnicity = String((sceneState as any).secondaryEthnicity ?? '').trim() || primaryEthnicity || undefined;
            const secondarySkinTone = String((sceneState as any).secondarySkinTone ?? '').trim() || primarySkinTone || undefined;
            const secondaryEyeColor = String((sceneState as any).secondaryEyeColor ?? '').trim() || primaryEyeColor || undefined;
            const secondaryBodyType = String((sceneState as any).secondaryBodyType ?? '').trim() || primaryBodyType || undefined;
            const secondaryHairLength = String((sceneState as any).secondaryHairLength ?? '').trim() || primaryHairLength || undefined;
            const secondaryHairTexture = String((sceneState as any).secondaryHairTexture ?? '').trim() || primaryHairTexture || undefined;
            const secondaryHairColor = String((sceneState as any).secondaryHairColor ?? '').trim() || primaryHairColor || undefined;

            if (secondaryEthnicity) secondaryPersonDetails.ethnicity = secondaryEthnicity;
            if (secondarySkinTone) secondaryPersonDetails.skinTone = secondarySkinTone;
            if (secondaryEyeColor) secondaryPersonDetails.eyeColor = secondaryEyeColor;
            if (secondaryBodyType) secondaryPersonDetails.bodyType = secondaryBodyType;
            if (secondaryHairLength) secondaryPersonDetails.hairLength = secondaryHairLength;
            if (secondaryHairTexture) secondaryPersonDetails.hairTexture = secondaryHairTexture;
            if (secondaryHairColor) secondaryPersonDetails.hairColor = secondaryHairColor;
        }

        (mapped as any).secondaryPersonDetails = secondaryPersonDetails;
    } else {
        (mapped as any).secondaryPersonDetails = undefined;
        mapped.secondaryAgeDerived = undefined;
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

        // POSE (Manual)
        if (sceneState.pose) {
            const pose = POSE_SEMANTIC_MAP[sceneState.pose] || sceneState.pose;
            mapped.personPose = pose;
            mapped.personDetails.personPose = pose;
        }

        // WARDROBE (Manual)
        if (sceneState.wardrobe) {
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
        const expressionLabel = sceneState.facialExpression || 'Calm & Serene';
        const expressionSemantic =
            FACIAL_EXPRESSION_MAP[expressionLabel] || FACIAL_EXPRESSION_MAP['Calm & Serene'];
        mapped.personDetails.facialExpression = expressionSemantic;

    const eyeDirectionLabel = sceneState.eyeDirection || 'Looking at camera';
    // Expose the UI label for legacy/lifestyle builders that read top-level eyeDirection.
    mapped.eyeDirection = eyeDirectionLabel as any;
    mapped.personDetails.eyeDirection =
        EYE_DIRECTION_SEMANTIC_MAP[eyeDirectionLabel] || eyeDirectionLabel as any;
    if (!forceHideProductRequested && sceneState.productInteraction) {
            const interactionText = isUGCRealMode
                ? resolveUgcInteractionSemantic(sceneState.productInteraction, sceneState.productUsageDescription)
                : (() => {
                    const interactionBase =
                        INTERACTION_SEMANTIC_MAP[sceneState.productInteraction] || sceneState.productInteraction;
                    const interactionParts = [interactionBase];
                    if (sceneState.productInteraction === 'Using' && sceneState.productUsageDescription) {
                        interactionParts.push(sceneState.productUsageDescription.trim());
                    }
                    if (isHandInteractionLabel(sceneState.productInteraction)) {
                        interactionParts.push(LIFESTYLE_HAND_SAFETY_RULE);
                    }
                    return interactionParts.filter(Boolean).join(' ');
                })();
        if (mapped.personCount === 'couple') {
            mapped.personDetails.productInteraction = [
                'COUPLE INTERACTION RULE: Only Person A interacts actively with the product.',
                'Person B remains supportive and passive (no contact with the product).',
                    `Person A: ${interactionText}.`
                ].join(' ');
            } else {
                mapped.personDetails.productInteraction = interactionText;
            }
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

    // FRAMING/PERSPECTIVE (Manual)
    if (!sceneState.ugcRealMode && sceneState.framing) {
        mapped.perspective = FRAMING_SEMANTIC_MAP[sceneState.framing] || sceneState.framing;
    }


    // ========================================================================
    // STRUCTURAL & ENVIRONMENT (Standard Mapping)
    // ========================================================================

    // ========================================================================
    // CREATION MODE → Structural Rules (FIRST - affects everything downstream)
    // ========================================================================
    const creationModeKey = sceneState.creationMode || 'Aesthetic Builder';

    const productProminenceKey =
        ((sceneState as any).productProminence as
            | 'balanced'
            | 'product-first'
            | 'model-first'
            | 'fifty-fifty'
            | undefined) ?? 'product-first';

    const creationModeStructural = isEnvironmentSceneIntent
        ? hasUploadedProductAsset && !ritualHideProductRequested && !forceHideProductRequested
            ? ({
                balanced: 'Lifestyle composition in a real environment with balanced emphasis between person and product.',
                'product-first': 'Lifestyle composition in a real environment with the product as the hero (product-first).',
                'model-first': 'Lifestyle composition in a real environment with the person as the hero while the product remains clearly visible.',
                'fifty-fifty': 'Lifestyle composition in a real environment with equal emphasis on person and product.',
            } as const)[productProminenceKey] ??
            'Lifestyle composition in a real environment with the product clearly visible.'
            : 'Environment-first lifestyle composition keeping the product grounded within the lived-in room.'
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
    mapped.creationMode = creationModeInternalMap[creationModeKey] || 'aesthetic';
    mapped.creationModeStructural = creationModeStructural;
    console.log('[MAP] creationMode:', creationModeKey, '→', mapped.creationMode, '→', creationModeStructural);

    // ========================================================================
    // COMPOSITION MODE → Layout Intent
    // ========================================================================
    const rawCompositionModeKey = sceneState.compositionMode || 'Lifestyle Showcase';
    const compositionModeKey = isEnvironmentSceneIntent ? 'Lifestyle Showcase' : rawCompositionModeKey;
    
    // RITUAL MODE OVERRIDE: Action-first composition
    const ritualModeActive = (mapped as any).ritualModeActive === true;
    
    const compositionModeStructural = ritualModeActive
        ? ritualHideProductRequested
            ? 'Ritual action-first composition: focus on the wellness activity and environment. No product visible.'
            : 'Ritual action-first composition: focus on the wellness activity; if product appears, it must be naturally integrated and incidental to the ritual scene.'
        : isEnvironmentSceneIntent
        ? hasUploadedProductAsset && !ritualHideProductRequested && !forceHideProductRequested
            ? ({
                balanced: 'Balanced framing: product and person share attention; environment supports the moment without stealing focus.',
                'product-first': 'Product-first framing: product in the foreground hero position; person supports the story; environment stays contextual.',
                'model-first': 'Person-first framing: person in the foreground hero position; product remains clearly visible and readable but secondary.',
                'fifty-fifty': 'Equal emphasis framing: tight composition where face and product share prominence equally.',
            } as const)[productProminenceKey] ??
            'Product visible framing: keep product readable and present.'
            : 'Environment-first layout with human-first framing and contextual surroundings.'
        : isEcommerceBlankSpaceActive
            ? 'Ecommerce blank-space arrangement with white void for product and copy, no lifestyle embellishments.'
            : COMPOSITION_MODE_STRUCTURAL_MAP[rawCompositionModeKey] || '';
    mapped.compositionMode = compositionModeKey;
    mapped.compositionModeStructural = compositionModeStructural;
    console.log('[MAP] compositionMode:', compositionModeKey, '→', compositionModeStructural);

    if (isEnvironmentSceneIntent) {
        if (forceHideProductRequested || ritualHideProductRequested) {
            mapped.placementStyle = 'Lifestyle placement with the person integrated in the environment.';
            mapped.productPlane =
                'Person-first framing with realistic environment context. Keep the subject tack sharp with grounded contact shadows. No product packaging in frame.';
        } else if (ritualModeActive) {
            mapped.placementStyle = 'Ritual-focused placement with the action as the primary visual element.';
            mapped.productPlane =
                'Action-first composition. If product appears, it must be naturally placed in the background or mid-ground, secondary to the ritual activity. Keep the ritual action sharp and clearly visible.';
        } else {
            mapped.placementStyle = 'Lifestyle placement with the product integrated in the environment, not hero-focused.';
            mapped.productPlane =
                'Mid-ground contextual placement within the room or space. Keep the product and label tack sharp and fully readable; keep both the face and the product in focus at the same time. Do not blur or defocus the product.';
        }
        mapped.placementCamera = sceneState.cameraType || mapped.placementCamera;
    }

    // ========================================================================
    // UGC REAL MODE → HARD OVERRIDES (Highest Priority)
    // ========================================================================
    const lifestyleUgcMode = creationModeKey === 'Lifestyle UGC';
    if ((sceneState.ugcRealMode || lifestyleUgcMode) && !forceHideProductRequested) {
        console.log('[MAP] UGC Real Mode ACTIVE - applying hard overrides');

        mapped.ugcRealModeActive = true;
        mapped.realModeActive = true;
        mapped.ugcCaptureSituation = sceneState.ugcCaptureSituation || null;
        mapped.ugcImperfectionLevel = sceneState.ugcImperfectionLevel || (lifestyleUgcMode ? 'medium' : 'high');
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
        hasUploadedProductAsset &&
        !ritualHideProductRequested &&
        !forceHideProductRequested &&
        isEnvironmentSceneIntent &&
        (productInteractionLabel === 'Presenting' ||
            productInteractionLabel === 'Holding' ||
            normalizedPoseKey === 'offer-to-lens-reach');
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

    // IMPORTANT:
    // Only attach `ugcRealModeLayers` (and related layer fields) when Raw Domestic UGC is actually active.
    // Otherwise other builders (e.g. camera) treat the presence of this object as UGC-real-active and degrade optics.
    if (sceneState.ugcRealMode) {
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
    } else {
        delete (mapped as any).ugcCaptureStyleBase;
        delete (mapped as any).ugcCameraOperator;
        delete (mapped as any).ugcBodyPhonePosition;
        delete (mapped as any).ugcMotionStability;
        delete (mapped as any).ugcFramingImperfections;
        delete (mapped as any).ugcAwkwardContext;
        delete (mapped as any).ugcRealModeLayers;
    }

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
        const isUgcIntent =
            mapped.creationIntent === 'ugc' ||
            sceneState.creationIntent === 'ugc';
        const defaultCameraLabel = 'DSLR / mirrorless camera';
        const cameraDevice = (sceneState as any).cameraType || defaultCameraLabel;
        const cameraDeviceSemantic = CAMERA_DEVICE_SEMANTIC_MAP[cameraDevice] || CAMERA_DEVICE_SEMANTIC_MAP[defaultCameraLabel];
        const shouldForceEnvironmentSmartphone =
            isEnvironmentSceneIntent && (ugcStyleKey === 'natural' || ugcStyleKey === 'raw');
        let effectiveCameraSemantic = shouldForceEnvironmentSmartphone
            ? 'Handheld smartphone perspective capturing natural perspective, emphasizing the surrounding environment.'
            : cameraDeviceSemantic;

        if (isUgcIntent) {
            // UGC should not read like portrait mode / shallow-DOF capture.
            const ugcCameraLabel = 'Intentional smartphone camera';
            mapped.camera = ugcCameraLabel;
            effectiveCameraSemantic = CAMERA_DEVICE_SEMANTIC_MAP[ugcCameraLabel] || effectiveCameraSemantic;
        } else {
            mapped.camera = cameraDevice;
        }

        // ANTI-DOLL FIX: Strip cinematic language when person is included
        // Cinema/filmic aesthetic conflicts with raw/real person appearance
        const personIncluded = !sceneState.noPerson && sceneState.personIncluded !== false;
        if (personIncluded && effectiveCameraSemantic) {
            effectiveCameraSemantic = effectiveCameraSemantic
                .replace(/cinema camera rig/gi, 'natural camera capture')
                .replace(/cinematic/gi, 'natural')
                .replace(/filmic dynamic range/gi, 'natural tonal range')
                .replace(/filmic color science/gi, 'natural color rendition')
                .replace(/controlled rigs/gi, 'steady capture')
                .replace(/smooth motion/gi, 'natural movement');
            console.log('[ANTI-DOLL] Stripped cinematic language for person-included scene');
        }

        if (foregroundProductFocusRequested) {
            // Avoid semantics that encourage focusing on the face/background when the product must be foreground.
            effectiveCameraSemantic = effectiveCameraSemantic
                .replace(/crisp subject separation/gi, 'crisp overall clarity');
            effectiveCameraSemantic +=
                ' Focus priority: lock focus on the product in the foreground; the product label must be tack sharp and fully readable. Avoid heavy background blur.';
        }
        mapped.cameraDeviceSemantic = effectiveCameraSemantic;
        console.log('[MAP] camera:', mapped.camera, '→', effectiveCameraSemantic);
    }

    // For environment-first scenes, the default is mid-ground contextual placement.
    // However, if the user is explicitly presenting the product toward camera, force product-forward framing.
    if (foregroundProductFocusRequested) {
        mapped.placementStyle = PRODUCT_PROMINENCE_CONFIG['product-first'].placementStyle;
        mapped.productPlane = PRODUCT_PROMINENCE_CONFIG['product-first'].productPlane;
    } else if (hasUploadedProductAsset && !ritualHideProductRequested && !forceHideProductRequested) {
        const key =
            (sceneState as any).productProminence || ('product-first' as const);
        const config =
            PRODUCT_PROMINENCE_CONFIG[key as keyof typeof PRODUCT_PROMINENCE_CONFIG] ??
            PRODUCT_PROMINENCE_CONFIG['product-first'];
        mapped.placementStyle = config.placementStyle;
        mapped.productPlane = config.productPlane;
    }

    if (!sceneState.ugcRealMode) {
        // Shot Type
        const isEcommerceCanvasOverlayActive = sceneState.ecommerceSidePlacementFlag === true;
        const productProminenceKey =
            ((sceneState as any).productProminence as 'balanced' | 'product-first' | 'model-first' | 'fifty-fifty' | undefined) ??
            ('product-first' as const);

        // In bg-replace canvas overlay, wide shots consistently shrink the product and defeat "Product First".
        // Force tighter shot types based on the user's composition intent.
        const effectiveShotTypeKey = forceHideProductRequested
            ? 'Medium'
            : isEcommerceCanvasOverlayActive
                ? productProminenceKey === 'model-first'
                    ? 'Medium'
                    : 'Close'
                : (sceneState.shotType || 'Medium');

        const shotTypeSemantic =
            SHOT_TYPE_SEMANTIC_MAP[effectiveShotTypeKey] ||
            SHOT_TYPE_SEMANTIC_MAP['Medium'];
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

    const buildUgcEnvironmentDescriptor = (macro: string, isCustom: boolean): string => {
        if (isCustom) {
            return `${macro} captured incidentally with lived-in clutter and no deliberate styling.`;
        }
        switch (macro) {
            case 'Kitchen':
                return 'Kitchen captured incidentally: lived-in countertop clutter, dish rack, everyday items; unstaged and low intent.';
            case 'Living Room':
                return 'Living Room captured incidentally: couch and coffee table visible, casual clutter, unstaged and low intent.';
            case 'Bedroom':
                return 'Bedroom captured incidentally: rumpled bedding or dresser items visible, lived-in clutter, unstaged and low intent.';
            case 'Bathroom':
                return 'Bathroom captured incidentally: vanity sink and toiletries visible, lived-in clutter, unstaged and low intent.';
            case 'Workspace':
                return 'Workspace captured incidentally: desk surface, laptop or papers, cable clutter, unstaged and low intent.';
            case 'Hallway':
                return 'Hallway captured incidentally: entryway shoes/jackets, lived-in clutter, unstaged and low intent.';
            case 'Home Gym':
                return 'Home Gym captured incidentally: real home exercise equipment visible (dumbbells, resistance bands, yoga mat), slightly messy and unstaged.';
            case 'Balcony / Indoor Terrace':
                return 'Balcony / Indoor Terrace captured incidentally: railing, small seating area or plants, unstaged and low intent.';
            default:
                return `${macro} captured incidentally with lived-in domestic clutter and no deliberate styling.`;
        }
    };

    const generateRandomUgcEnvironment = (): { macro: string; micro: string; descriptor: string } => {
        const ugcEnvironments = [
            { macro: 'Kitchen', micro: 'Countertop' },
            { macro: 'Living Room', micro: 'Coffee table' },
            { macro: 'Bedroom', micro: 'Dresser' },
            { macro: 'Bathroom', micro: 'Vanity sink' },
            { macro: 'Workspace', micro: 'Desk' },
            { macro: 'Hallway', micro: 'Entryway' },
            { macro: 'Home Gym', micro: 'Workout area' },
            { macro: 'Balcony / Indoor Terrace', micro: 'Balcony seating area' },
        ] as const;
        const picked = ugcEnvironments[Math.floor(Math.random() * ugcEnvironments.length)] || ugcEnvironments[0];
        return {
            macro: picked.macro,
            micro: picked.micro,
            descriptor: buildUgcEnvironmentDescriptor(picked.macro, false),
        };
    };

    const DEFAULT_MICRO_BY_MACRO: Record<string, string> = {
        'Kitchen': 'Countertop',
        'Living Room': 'Coffee table',
        'Bedroom': 'Dresser',
        'Bathroom': 'Vanity sink',
        'Workspace': 'Desk',
        'Hallway': 'Entryway',
        'Home Gym': 'Workout area',
        'Balcony / Indoor Terrace': 'Balcony seating area',
    };

    if (envContext === null) {
        // Studio mode: HARD NULL - no environment allowed
        (mapped as any).selectedEnvironment = '';
        (mapped as any).customEnvironment = '';
        mapped.setting = '';
        mapped.microLocation = '';
        (mapped as any).sceneEnvironment = '';
        mapped.environmentOrder = '';
        delete (mapped as any).sceneEnvironmentDescriptor;
        console.log('[MAP] environmentContext === null (Studio mode) - environment fully suppressed');
    } else if (envContext && envContext.macro) {
        // Lifestyle/UGC: Use environmentContext as source of truth
        const macro = String(envContext.macro || '').trim();
        const micro = envContext.micro || '';
        const hasNoEnvironment = isNoEnvironmentSelection(macro);

        if (hasNoEnvironment) {
            (mapped as any).selectedEnvironment = 'none';
            (mapped as any).customEnvironment = '';

            if (isUGCRealMode) {
                const ugcEnvironment = generateRandomUgcEnvironment();
                mapped.setting = ugcEnvironment.macro;
                mapped.microLocation = ugcEnvironment.micro;
                (mapped as any).sceneEnvironment = ugcEnvironment.macro;
                mapped.environmentOrder = ugcEnvironment.macro;
                (mapped as any).sceneEnvironmentDescriptor = ugcEnvironment.descriptor;
                console.log('[MAP] UGC system environment:', ugcEnvironment);
            } else {
                mapped.setting = '';
                mapped.microLocation = '';
                (mapped as any).sceneEnvironment = '';
                mapped.environmentOrder = '';
                delete (mapped as any).sceneEnvironmentDescriptor;
                console.log('[MAP] environmentContext macro is none - environment suppressed');
            }
        } else {

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

            const normalizedMicro = micro.trim();
            const shouldReplaceCountertop =
                normalizedMicro === 'Countertop' && macro !== 'Kitchen';
            const resolvedMicro =
                isCustomMacro
                    ? ''
                    : shouldReplaceCountertop || !normalizedMicro
                        ? (DEFAULT_MICRO_BY_MACRO[macro] ?? '')
                        : normalizedMicro;
            mapped.microLocation = resolvedMicro;
            (mapped as any).sceneEnvironment = macro;
            mapped.environmentOrder = macro;
            (mapped as any).selectedEnvironment = isCustomMacro ? 'Custom' : macro;
            (mapped as any).customEnvironment = isCustomMacro ? macro : '';

            if (isUGCRealMode) {
                // UGC Mode: User-selected environment takes priority over randomization
                // No restrictions - user can select any environment including outdoor
                // This allows user to override the default indoor randomization if desired
                (mapped as any).sceneEnvironmentDescriptor = buildUgcEnvironmentDescriptor(macro, isCustomMacro);
            }

            console.log('[MAP] environmentContext:', { macro, micro }, '→ setting:', mapped.setting);
        }
    } else if (awkwardEnvironmentOverride && !isUGCRealMode) {
        mapped.setting = awkwardEnvironmentOverride;
        mapped.microLocation = awkwardEnvironmentOverride;
        (mapped as any).sceneEnvironment = awkwardEnvironmentOverride;
        mapped.environmentOrder = awkwardEnvironmentOverride;
        (mapped as any).selectedEnvironment = 'Awkward Context Override';
        (mapped as any).customEnvironment = awkwardEnvironmentOverride;
        mapped.sceneIntent = 'environment';
        console.log('[MAP] Awkward context override →', awkwardEnvironmentOverride);
    } else {
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
        const noEnvironmentSelected = isNoEnvironmentSelection(selectedEnvironment);

        // UGC Mode: User-selected environment always takes priority
        // No validation errors - user can override randomization with any environment
        // If user selects outdoor environment in UGC, respect their choice
        
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

        if (noEnvironmentSelected) {
            if (isUGCRealMode) {
                const ugcEnvironment = generateRandomUgcEnvironment();
                mapped.setting = ugcEnvironment.macro;
                mapped.microLocation = ugcEnvironment.micro;
                (mapped as any).sceneEnvironment = ugcEnvironment.macro;
                mapped.environmentOrder = ugcEnvironment.macro;
                (mapped as any).sceneEnvironmentDescriptor = ugcEnvironment.descriptor;
                console.log('[MAP] UGC system environment (legacy path):', ugcEnvironment);
            } else {
                mapped.setting = '';
                mapped.microLocation = '';
                (mapped as any).sceneEnvironment = '';
                mapped.environmentOrder = '';
                delete (mapped as any).sceneEnvironmentDescriptor;
            }
        } else if (isUGCRealMode) {
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
    }

    // ========================================================================
    // RITUAL MODE → HERO CANVAS OVERRIDE (Neutral background + placement)
    // ========================================================================
    // Ritual hero scenes should not inject a literal environment/location even if the user had one selected.
    // CanonicalScene will add the neutral hero canvas language; we must suppress setting/micro so other builders don't re-add rooms.
    if ((mapped as any).ritualModeActive === true && sceneState.ecommerceSidePlacementFlag === true) {
        mapped.setting = '';
        mapped.microLocation = '';
        (mapped as any).sceneEnvironment = '';
        mapped.environmentOrder = '';
        (mapped as any).selectedEnvironment = '';
        (mapped as any).customEnvironment = '';
    }

    // ========================================================================
    // RANDOM CHARACTER MODE → ENVIRONMENT OVERRIDE
    // ========================================================================
    // When Random Character is ON, clear all environment selections.
    // Let DiversityRandomizer in identity.ts generate fully random domestic locations.
    if (mapped.randomCharacterActive) {
        mapped.setting = '';
        mapped.microLocation = '';
        (mapped as any).sceneEnvironment = '';
        mapped.environmentOrder = '';
        (mapped as any).selectedEnvironment = '';
        (mapped as any).customEnvironment = '';
        console.log('[MAP] Random Character ON → environment cleared for full randomization');
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

    const isLifestyleAdvertising =
        sceneState.creationMode === 'lifestyle' && personIncluded;
    if (isLifestyleAdvertising) {
        const settingLabel = String(
            mapped.setting ||
                mapped.sceneEnvironment ||
                mapped.environmentOrder ||
                mapped.microLocation ||
                ''
        ).trim();
        const settingPhrase = settingLabel
            ? `The ${settingLabel} is styled as an editorial luxury interior or premium campaign set with clean surfaces, intentional styling, and no clutter.`
            : 'The environment is styled as an editorial luxury set with premium finishes and curated geometry.';

        mapped.lifestyleAdvertisingProfile =
            'The person must appear as a real advertising model with polished presentation, natural believable features, and campaign-ready grooming; not casual, not domestic, not documentary.';
        mapped.lifestyleWardrobeRules =
            'Wardrobe must be premium, clean, intact, and well-fitted; fabrics must appear new, structured, and high-quality; no torn, worn, distressed, frayed, stretched, damaged, or aged garments; no casual homewear, sloppy knits, or everyday worn clothing; styling must resemble a luxury brand advertising campaign.';
        mapped.lifestyleEnvironmentInterpretation = settingPhrase;
        mapped.lifestyleHardRestrictions =
            'Hard restrictions (Lifestyle Advertising): Do NOT depict damaged clothing, distressed fabrics, or signs of wear; do NOT depict domestic realism, casual everyday appearance, or unstyled wardrobe; do NOT produce UGC-like or documentary visuals. If any of these appear, the generation is invalid.';
        (mapped as any).disableUgcSemantics = true;
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

        const ritualHeroCanvasActive = (mapped as any).ritualModeActive === true;
        const ritualBg =
            String((sceneState as any).studioBackgroundColor || '')
                .trim() ||
            String((sceneState as any).ecommerceBackgroundColor || '')
                .trim() ||
            '#FFFFFF';

        if (!ritualHeroCanvasActive && sceneState.ecommerceBackgroundMode === 'gradient') {
            const angle = parseInt(sceneState.ecommerceGradientAngle || '90', 10) || 90;
            mapped.bgGradient = {
                startColor: sceneState.ecommerceGradientStart || '#f7f7f7',
                endColor: sceneState.ecommerceGradientEnd || '#d9d9d9',
                angle
            };
            delete mapped.bgColor;
        } else {
            mapped.bgColor = (ritualHeroCanvasActive ? ritualBg : (sceneState.ecommerceBackgroundColor || '#FFFFFF')).toUpperCase();
            delete mapped.bgGradient;
        }

        mapped.creationModeStructural =
            'Background replacement mode: preserve the subject and replace the original environment with a neutral hero canvas.';
        mapped.compositionModeStructural =
            'Blank-space layout on a neutral canvas; environment selection is used only as a styling reference (not depicted as a room).';

        // Hero canvas still needs explicit composition intent (product vs person prominence).
        // Use canvas-safe phrasing (no room/environment cues).
        const productProminenceKey =
            ((sceneState as any).productProminence as
                | 'balanced'
                | 'product-first'
                | 'model-first'
                | 'fifty-fifty'
                | undefined) ?? 'product-first';
        const canvasProminenceConfig: Record<
            'balanced' | 'product-first' | 'model-first' | 'fifty-fifty',
            { placementStyle: string; productPlane: string }
        > = {
            balanced: {
                placementStyle:
                    'Balanced hero placement on a neutral background: person and product share attention with clean negative space.',
                productPlane:
                    'Balanced plane on neutral canvas: keep both the face and the product label tack sharp and fully readable. Avoid heavy blur; avoid tiny product-in-frame compositions.',
            },
            'product-first': {
                placementStyle:
                    'Product-first hero placement on a neutral background: product is the primary hero; person supports the story with clean negative space.',
                productPlane:
                    'Foreground product-first plane on neutral canvas: product and label must be tack sharp and fully readable; product sits closer to camera than the face; face must not obscure or dominate the product.',
            },
            'model-first': {
                placementStyle:
                    'Person-first hero placement on a neutral background: person is the hero while the product remains clearly visible and readable.',
                productPlane:
                    'Person-forward plane on neutral canvas: keep the person prominent without pushing the product into deep background. Keep product on the same visual plane and tack sharp with a fully readable label.',
            },
            'fifty-fifty': {
                placementStyle:
                    'Fifty/fifty hero placement on a neutral background: person and product share equal prominence with tight, intentional framing.',
                productPlane:
                    'Equal emphasis plane on neutral canvas: place the face and product together in the foreground; keep both tack sharp and readable; avoid compositing or unrealistic scale differences.',
            },
        };
        if (!forceHideProductRequested && !ritualHideProductRequested) {
            const cfg =
                canvasProminenceConfig[productProminenceKey as keyof typeof canvasProminenceConfig] ??
                canvasProminenceConfig['product-first'];
            mapped.placementStyle = cfg.placementStyle;
            mapped.productPlane = cfg.productPlane;
        }

        // Scene order / chaos is an environment signal; suppress for canvas
        delete mapped.sceneOrderChaos;
        delete (mapped as any).sceneOrderChaosDescriptor;

        // Keep the selected environment as a styling reference (do not force-reset it),
        // but suppress environment variation systems that would re-introduce room cues.
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
    // LIFESTYLE 9:16 → Vertical Fill Override (non-UGC only)
    // ========================================================================
    // Prevent composition conflicts that shrink the subject vertically in portrait.
    // Scope: Lifestyle (non-UGC) only. Do not touch UGC behavior.
    const isLifestyleNonUgc9x16 =
        isEnvironmentSceneIntent &&
        mapped.aspectRatio === '9:16' &&
        sceneState.ugcRealMode !== true &&
        mapped.ugcRealModeActive !== true;

    if (isLifestyleNonUgc9x16) {
        // Remove any strict head-to-toe requirement.
        const shot = String(mapped.cameraShot || '').trim();
        if (/(head\s*to\s*toe|full[- ]length)/i.test(shot)) {
            mapped.cameraShot =
                'vertical portrait framing with strong vertical fill; feet may be partially cropped if necessary; no full-length framing requirement' as any;
        }

        // Prevent "balanced negative space" from being interpreted as top/bottom headroom in 9:16.
        const perspective = String(mapped.perspective || '').trim();
        if (perspective) {
            mapped.perspective = perspective
                .replace(/balanced negative space/gi, 'balanced lateral negative space (left/right) only; minimal headroom');
        }

        (mapped as any).verticalFillRule = LIFESTYLE_9X16_VERTICAL_FILL_RULE;
    }

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
    const explicitContentStyle = String((sceneState as any).contentStyle || '').trim();
    if (explicitContentStyle) {
        mapped.contentStyle = explicitContentStyle as any;
    }

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
        captureBaseId === 'low-angle' ||
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
    if (sceneState.studioIngredientLayout && isIngredientStack) {
        (mapped as any).studioIngredientLayout = sceneState.studioIngredientLayout;
        (mapped as any).ingredientLayout = sceneState.studioIngredientLayout;
    }
    if (sceneState.studioInteraction) {
        (mapped as any).studioInteraction = sceneState.studioInteraction;
    }
    if (sceneState.studioLens) {
        (mapped as any).studioLens = sceneState.studioLens;
    }
    if (sceneState.studioLightingRig) {
        (mapped as any).studioLightingRig = sceneState.studioLightingRig;
        // PromptEngine Studio fast-path reads `studioLighting`; treat Lighting Rig as the decisive studio lighting preset.
        (mapped as any).studioLighting = sceneState.studioLightingRig;
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
            ingredientLayout: sceneState.studioIngredientLayout,
            lens: sceneState.studioLens,
            lightingRig: sceneState.studioLightingRig,
            finish: sceneState.studioFinish,
            backgroundColor: sceneState.studioBackgroundColor,
            accentColor: sceneState.studioAccentColor,
        });
        console.log('[MAP OUTPUT]', JSON.stringify(mapped, null, 2));
    }
    console.log('[FINAL SCENETYPE]', (mapped as any).sceneType ?? (sceneState as any).sceneType ?? 'undefined');
    console.log('[FINAL CREATIONMODE]', mapped.creationMode ?? sceneState.creationMode ?? 'undefined');
    console.log('[FINAL CONTENTSTYLE]', mapped.contentStyle ?? (sceneState as any).contentStyle ?? 'undefined');

    return mapped;
}
