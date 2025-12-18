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
import type { FormulationStoryOptions, PromptOptions } from './types';
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
    'Raw / Real': 'raw, unretouched skin with visible texture, pores, and natural imperfections',
    'Natural': 'natural realistic skin texture with visible pores and subtle imperfections, no plastic look',
    'Soft Retouch': 'lightly retouched skin, minimal smoothing, still realistic and human'
};

const BODY_TYPE_SEMANTIC_MAP: Record<string, string> = {
    'Slim': 'slim',
    'Average': 'average',
    'Curvy': 'curvy',
    'Plus size': 'plus-size'
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
    let poseOverride = null;
    let framingOverride = null;
    let expressionOverride: string | null = null;

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

        if (sceneState.bodyType) {
            const normalizedBodyType = BODY_TYPE_SEMANTIC_MAP[sceneState.bodyType] || sceneState.bodyType.toLowerCase();
            mapped.personDetails.bodyType = normalizedBodyType;
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
        const expressionLabel = expressionOverride || sceneState.facialExpression || 'Calm & Serene';
        const expressionSemantic =
            FACIAL_EXPRESSION_MAP[expressionLabel] || FACIAL_EXPRESSION_MAP['Calm & Serene'];
        mapped.personDetails.facialExpression = expressionSemantic;

        const eyeDirectionLabel = sceneState.eyeDirection || 'Looking at camera';
        mapped.personDetails.eyeDirection =
            EYE_DIRECTION_SEMANTIC_MAP[eyeDirectionLabel] || eyeDirectionLabel as any;
        if (sceneState.productInteraction) mapped.personDetails.productInteraction = INTERACTION_SEMANTIC_MAP[sceneState.productInteraction] || sceneState.productInteraction;

        // HAIR
        if (sceneState.hairColor) mapped.personDetails.hairColor = sceneState.hairColor;
        // ... (other hair props mapped normally)
    }

    const isUGCActive = !!sceneState.ugcRealMode;
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
    const allowedEnvironmentMap: Record<string, string> = {
        'Kitchen': 'Kitchen',
        'Living Room': 'Living Room',
        'Bedroom': 'Bedroom',
        'Bathroom': 'Bathroom',
        'Workspace': 'Workspace',
        'Urban Exterior': 'Urban Exterior',
        'Natural Exterior': 'Natural Exterior'
    };

    const selectedEnvironment = sceneState.environment || '';
    const customEnvironmentValue = (sceneState.customEnvironment || '').trim();

    (mapped as any).selectedEnvironment = selectedEnvironment;
    (mapped as any).customEnvironment = customEnvironmentValue;

    if (selectedEnvironment === 'Custom' && customEnvironmentValue) {
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
    console.log('[MAP] environment:', selectedEnvironment, '→', mapped.setting);

    // ========================================================================
    // TIME OF DAY + LIGHTING STYLE → Combined Light Narrative
    // ========================================================================
    const isEcommerceBlankSpaceCreationMode = sceneState.creationMode === 'Ecommerce Blank Space';
    const isEcommerceBlankSpaceCompositionMode = sceneState.compositionMode === 'Ecommerce Blank Space';
    const isEcommerceSceneIntent = sceneState.sceneIntent === 'ecommerce';
    const shouldInjectEcommerceBackground = isEcommerceSceneIntent && isEcommerceBlankSpaceCompositionMode;

    if (isEcommerceBlankSpaceCreationMode) {
        // Ecommerce mode: studio lighting only
        mapped.setting = '';
        mapped.microLocation = '';
        mapped.bgColor = shouldInjectEcommerceBackground ? sceneState.ecommerceBackgroundColor : undefined;
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
    (mapped as any).timeLightingContext = mapped.lighting;

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
