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

import type { ExpertRole, Step3Values } from '@/components/LifestyleStep3';
import type { FormulationStoryOptions, PromptOptions } from './types';
import { mapProductModeToPromptOptions } from './mapProductModeToPromptOptions';

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

function mapSkinRealism(value?: string): string | null {
    switch (normalizeKey(value)) {
        case 'raw':
        case 'raw-real':
        case 'rawreal':
            return 'raw, unretouched skin with visible texture, pores, and natural imperfections';
        case 'natural':
            return 'natural realistic skin texture with visible pores and subtle imperfections, no plastic look';
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

const EXPERT_ROLE_FOCUS_MAP: Record<ExpertRole, FormulationStoryOptions['professionalFocus']> = {
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
        labVibe
    };
};

/**
 * CAMERA DEVICE → Physical capture characteristics and lens behavior
 */
const CAMERA_DEVICE_SEMANTIC_MAP: Record<string, string> = {
    'Modern Smartphone': 'captured with modern smartphone camera, slight computational sharpening, natural perspective compression',
    'Front Selfie Cam': 'front-facing selfie camera perspective with subtle wide-angle distortion near frame edges, typical selfie framing',
    'Sony Handycam Hi8': 'vintage Sony Hi8 camcorder aesthetic with softer focus, warmer color cast, period-appropriate grain',
    'Disposable Film Camera': 'disposable film camera aesthetic with visible grain, slight color shift, flash if indoor',
    'Polaroid OneStep': 'Polaroid instant camera aesthetic with soft dreamy tones, slight vignette, characteristic color palette',
    'DSLR/Mirrorless': 'professional DSLR quality with shallow depth of field, creamy bokeh in background, precise focus',
    'Laptop Webcam': 'laptop webcam quality with flat front lighting, eye-level angle, typical video call framing',
    'Cinema Camera Rig': 'cinema camera quality with film-like color grading, wide dynamic range, cinematic depth',
    'Medium Format Studio Camera': 'medium format studio camera with exceptional detail, subtle depth, commercial quality',
    'Sony FX3': 'Sony FX3 cinema camera with modern filmic look, smooth gradations, professional video quality'
};

/**
 * ETHNICITY → Physical facial structure and feature descriptors
 * Maps to observable physical characteristics, not cultural labels
 */
const ETHNICITY_FACIAL_MAP: Record<string, string> = {
    'Black / African descent': 'person of African descent with characteristic facial bone structure, fuller lips, broader nose bridge, textured hair',
    'Latino / Hispanic': 'person of Latino heritage with warm olive to brown skin tones, varied facial features typical of Latin American ancestry',
    'White / European descent': 'person of European descent with characteristic facial structure, varied skin tones from fair to olive',
    'Asian': 'person of East Asian or Southeast Asian descent with characteristic facial features including epicanthic fold, varied skin tones',
    'Middle Eastern': 'person of Middle Eastern descent with characteristic facial structure, olive to brown skin tones, defined features',
    'South Asian': 'person of South Asian descent with characteristic facial structure, medium to deep brown skin tones',
    'Mixed': 'person of mixed ethnic heritage with blended facial features from multiple ancestries',
    'Non-specific': 'person with ambiguous ethnic presentation'
};

/**
 * SHOT TYPE → Physical camera framing (SIMPLIFIED)
 */
const SHOT_TYPE_SEMANTIC_MAP: Record<string, string> = {
    'Close': 'close-up framing showing face and upper shoulders, tight composition focused on facial details',
    'Medium': 'medium shot framing from waist up, showing upper body, arms, and face with balanced negative space',
    'Wide': 'wide shot showing full body and surrounding environment, complete spatial context'
};

/**
 * CAMERA ANGLE → Physical camera position (SIMPLIFIED)
 */
const CAMERA_ANGLE_SEMANTIC_MAP: Record<string, string> = {
    'Eye level': 'camera positioned at natural eye level creating neutral perspective, subject appears at equal height to viewer',
    'Above': 'camera positioned above eye level angled downward, subject appears approachable and slightly smaller',
    'Below': 'camera positioned below eye level angled upward, subject appears more powerful and dominant'
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
 * SCENE MOOD → Overall atmosphere and energy (NOT body/facial details)
 * Describes the global feeling of the scene, not physical muscle states
 */
const SCENE_MOOD_MAP: Record<string, string> = {
    'Calm & Serene': 'calm serene atmosphere, low emotional intensity, peaceful pacing',
    'Joyful & High-Energy': 'energetic joyful mood, lively movement, upbeat presence',
    'Confident & Editorial': 'confident composed mood, editorial presence, controlled energy',
    'Playful & Candid': 'playful candid mood, spontaneous energy, informal feel',
    'Hustle & Juggle': 'busy dynamic mood, multitasking energy, purposeful movement',
    'Stressed but Determined': 'stressed yet determined mood, visible tension with resolve'
};

/**
 * FACIAL EXPRESSION → Physical facial muscle states ONLY
 * Describes specific facial gestures, NOT scene energy or body language
 */
const FACIAL_EXPRESSION_MAP: Record<string, string> = {
    'Soft Smile': 'soft subtle smile, relaxed facial muscles',
    'Full Smile': 'full smile, teeth visible, lifted cheeks',
    'Serious Focus': 'neutral serious expression, focused eyes',
    'Excited Surprise': 'widened eyes, open mouth, surprised expression',
    'Stressed but Hopeful': 'slight tension in brow, hopeful eyes',
    'Real-Life Calm': 'neutral calm face, everyday relaxed expression'
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
    'Showing to Camera': 'product held outward toward camera lens, hand angled to display product label or design',
    'Unboxing': 'hands in process of opening product packaging, revealing contents with natural excitement',
    'Applying': 'hands applying product to skin or surface with natural spreading or dabbing motion',
    'Placing on Surface': 'hands lowering product onto surface, fingers releasing grip, natural placement motion'
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
        mood: 'practical, multitasking energy',
        wardrobe: 'comfortable casual everyday wear, functional clothing, slightly disheveled realism',
        pose: 'natural mid-action candid movement',
        framing: 'spontaneous imperfect framing'
    },
    'The Fitness Enthusiast': {
        mood: 'energized focused athletic intensity',
        wardrobe: 'modern activewear, moisture-wicking fabric, athletic styling',
        pose: 'mid-workout movement or post-exercise recovery pose',
        framing: 'dynamic angled composition'
    },
    'The Skincare Obsessed': {
        mood: 'calm ritualistic clean atmosphere',
        wardrobe: 'minimal clean loungewear, soft fabrics, neutral tones',
        environment: 'Bathroom', // Hint for environment
        pose: 'focused self-care application intent'
    },
    'The Minimalist': {
        mood: 'intentional calm composed presence',
        wardrobe: 'high-quality minimal solid colors, structured simple silhouette',
        environment: 'Modern Living Room', // Hint
        pose: 'still composed architectural posture'
    },
    'The Trendsetter': {
        mood: 'confident editorial cool, effortless styleiness',
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


    // ========================================================================
    // PRIORITY 2: CUSTOM CLOTHES (ABSOLUTE OVERRIDE)
    // ========================================================================
    const hasCustomClothes = !!existingOptions.clothingReference;
    let wardrobeOverride = null;

    if (hasCustomClothes) {
        console.log('[PRIORITY 1] Custom Clothes Detected - NUKING conflicting wardrobe settings');
        const constraint = "The person is wearing the exact outfit from the uploaded clothing reference image. Do not redesign, reinterpret, restyle, or invent clothing.";
        wardrobeOverride = constraint;
        mapped.wardrobeStyle = constraint;
        mapped.personDetails.wardrobeStyle = constraint;
        // Block Appearance Level from inventing style conflicts
        mapped.personAppearance = "neutral grooming matching reference";
        mapped.personDetails.personAppearance = "neutral grooming matching reference";
    }

    // ========================================================================
    // PRIORITY 3: HERO PERSONAS (SEMANTIC MACRO)
    // ========================================================================
    const heroPersona = sceneState.heroPersona;
    let moodOverride = null;
    let poseOverride = null;
    let framingOverride = null;

    if (heroPersona && HERO_PERSONA_MACROS[heroPersona]) {
        console.log(`[PRIORITY 2] Hero Persona Active: ${heroPersona} - Applying MACROS`);
        const macro = HERO_PERSONA_MACROS[heroPersona];

        // Apply Mood Override
        moodOverride = macro.mood;
        (mapped as any).sceneMood = moodOverride;
        mapped.personMood = moodOverride;
        mapped.personDetails.personMood = moodOverride;

        // Apply Pose Override
        poseOverride = macro.pose;
        mapped.personPose = poseOverride;
        mapped.personDetails.personPose = poseOverride;

        // Apply Framing Override (if exists)
        if (macro.framing) {
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
        if (sceneState.gender) mapped.personDetails.gender = sceneState.gender;
        if (sceneState.ethnicity) {
            const eth = ETHNICITY_FACIAL_MAP[sceneState.ethnicity] || sceneState.ethnicity;
            mapped.personDetails.ethnicity = eth;
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

        // APPEARANCE (Manual if not nuked by Custom Clothes)
        if (!hasCustomClothes) {
            const appearanceDescriptor = mapAppearanceLevel(sceneState.appearanceLevel);
            if (appearanceDescriptor) {
                mapped.personAppearance = appearanceDescriptor;
                mapped.personDetails.personAppearance = appearanceDescriptor;
            }
        }

        const skinDescriptor = mapSkinRealism(sceneState.skinRealism);
        if (skinDescriptor) {
            mapped.personDetails.skinRealism = skinDescriptor;
        }

        // OTHER PERSON DETAILS (Non-conflicting)
        if (sceneState.facialExpression) mapped.personDetails.facialExpression = FACIAL_EXPRESSION_MAP[sceneState.facialExpression] || sceneState.facialExpression;
        if (sceneState.eyeDirection) mapped.personDetails.eyeDirection = EYE_DIRECTION_SEMANTIC_MAP[sceneState.eyeDirection] || sceneState.eyeDirection as any;
        if (sceneState.productInteraction) mapped.personDetails.productInteraction = INTERACTION_SEMANTIC_MAP[sceneState.productInteraction] || sceneState.productInteraction;

        // HAIR
        if (sceneState.hairColor) mapped.personDetails.hairColor = sceneState.hairColor;
        // ... (other hair props mapped normally)
    }

    // MOOD (Manual if no Override)
    if (!moodOverride && sceneState.mood) {
        const mood = SCENE_MOOD_MAP[sceneState.mood] || sceneState.mood;
        (mapped as any).sceneMood = mood;
        mapped.personDetails.personMood = mood;
    }

    // FRAMING/PERSPECTIVE (Manual if no Override)
    if (!framingOverride && sceneState.framing) {
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
    if (sceneState.compositionMode === 'Ecommerce Blank Space') {
        creationModeKey = 'Ecommerce Blank Space';
    }

    const creationModeStructural = CREATION_MODE_STRUCTURAL_MAP[creationModeKey] || CREATION_MODE_STRUCTURAL_MAP['Lifestyle UGC'];

    // Map to internal creation mode
    const creationModeInternalMap: Record<string, 'lifestyle' | 'studio' | 'aesthetic' | 'bg-replace' | 'ecom-blank'> = {
        'Lifestyle UGC': 'lifestyle',
        'Studio Hero': 'studio',
        'Aesthetic Builder': 'aesthetic',
        'Background Replace': 'bg-replace',
        'Ecommerce Blank Space': 'ecom-blank'
    };
    mapped.creationMode = creationModeInternalMap[creationModeKey] || 'lifestyle';
    console.log('[MAP] creationMode:', creationModeKey, '→', mapped.creationMode, '→', creationModeStructural);

    // ========================================================================
    // COMPOSITION MODE → Layout Intent
    // ========================================================================
    const compositionModeKey = sceneState.compositionMode || 'Lifestyle Showcase';
    const compositionModeStructural = COMPOSITION_MODE_STRUCTURAL_MAP[compositionModeKey] || '';
    mapped.compositionMode = compositionModeKey;
    console.log('[MAP] compositionMode:', compositionModeKey, '→', compositionModeStructural);

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

    // ========================================================================
    // CAMERA → Physical Composition Language
    // ========================================================================

    // Camera Device Type
    const cameraDevice = (sceneState as any).cameraType || 'Modern Smartphone';
    const cameraDeviceSemantic = CAMERA_DEVICE_SEMANTIC_MAP[cameraDevice] || CAMERA_DEVICE_SEMANTIC_MAP['Modern Smartphone'];
    mapped.camera = cameraDevice;
    console.log('[MAP] camera:', cameraDevice, '→', cameraDeviceSemantic);

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

    // ========================================================================
    // ENVIRONMENT → Scene Context (Restored Full Logic)
    // ========================================================================
    if (sceneState.environment === 'Custom' && sceneState.customEnvironment) {
        mapped.setting = sceneState.customEnvironment;
        mapped.microLocation = sceneState.customEnvironment;
    } else if (sceneState.environment && sceneState.environment !== '') {
        const envMap: Record<string, string> = {
            'Living Room': 'cozy living room interior with soft furnishings, natural materials, warm textures',
            'Kitchen': 'modern kitchen with counter space, appliances visible, functional realistic environment',
            'Bedroom': 'bedroom interior with soft bedding, natural bedroom lighting, personal space',
            'Coffee Shop': 'coffee shop interior with warm ambient lighting, casual public atmosphere',
            'Office': 'minimal office workspace with desk, professional but personal environment',
            'City Street': 'urban city street exterior with buildings, pavement, urban textures',
            'Park': 'outdoor park with greenery, natural daylight, trees and grass visible',
            'Beach': 'beach setting with sand, water visible, bright natural sunlight',
            'Car Interior': 'inside car interior with dashboard visible, realistic vehicle environment'
        };
        mapped.setting = envMap[sceneState.environment] || sceneState.environment.toLowerCase();
        mapped.microLocation = mapped.setting;
    } else {
        mapped.setting = '';
        mapped.microLocation = '';
    }
    console.log('[MAP] environment:', sceneState.environment, '→', mapped.setting);

    // ========================================================================
    // TIME OF DAY + LIGHTING STYLE → Combined Light Narrative
    // ========================================================================
    const isEcommerceBlankSpace = sceneState.creationMode === 'Ecommerce Blank Space';

    if (isEcommerceBlankSpace) {
        // Ecommerce mode: studio lighting only
        mapped.setting = '';
        mapped.microLocation = '';
        mapped.bgColor = sceneState.ecommerceBackgroundColor || '#FFFFFF';
        mapped.sidePlacement = (sceneState.sidePlacement?.toLowerCase() || 'center') as any;
        mapped.lighting = 'controlled studio lighting with soft even shadows, neutral color temperature, product-grade illumination';
        console.log('[MAP] Ecommerce Blank Space mode - studio lighting applied');
    } else {
        // Lifestyle mode: combine time + lighting
        const timeSemantic = TIME_SEMANTIC_MAP[sceneState.timeOfDay] || TIME_SEMANTIC_MAP['Midday'];
        const lightingSemantic = LIGHTING_SEMANTIC_MAP[sceneState.lightingStyle] || LIGHTING_SEMANTIC_MAP['Natural window'];
        mapped.lighting = `${timeSemantic}, ${lightingSemantic}`;
        console.log('[MAP] lighting:', sceneState.timeOfDay, '+', sceneState.lightingStyle, '→', mapped.lighting);
    }

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
    const formulationStoryOptions = buildFormulationStoryOptions(sceneState);
    mapped.formulationStory = formulationStoryOptions;
    mapped.formulationExpertEnabled = Boolean(formulationStoryOptions);
    mapped.formulationExpertName = sceneState.expertName;
    mapped.formulationExpertRole = sceneState.expertCredentials;
    mapped.formulationLabStyle = sceneState.labVibe;
    mapped.formulationExpertPreset = undefined;

    if (formulationStoryOptions) {
        mapped.ugcRealModeActive = false;
        mapped.realModeActive = false;
        mapped.ugcCaptureSituation = null;
        mapped.selfieMode = 'None';
        if (mapped.personDetails) {
            mapped.personDetails.selfieMode = undefined;
            mapped.personDetails.selfieType = undefined;
        }
    }

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
        const proCameras = ['Sony FX3', 'Cinema Camera Rig', 'Medium Format Studio Camera'];
        if (proCameras.includes(mapped.camera || '')) {
            console.log('[SAFETY] Downgrading Pro Camera in UGC Mode');
            mapped.camera = 'Modern Smartphone';
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

    // MANDATORY LOGGING - Complete output
    console.log('[MAP OUTPUT]', JSON.stringify(mapped, null, 2));

    return mapped;
}
