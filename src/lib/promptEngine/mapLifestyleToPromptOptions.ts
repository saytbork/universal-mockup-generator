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

import type { Step3Values } from '@/components/LifestyleStep3';
import type { PromptOptions } from './types';
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

/**
 * APPEARANCE LEVEL → Grooming state and styling effort
 */
const APPEARANCE_SEMANTIC_MAP: Record<string, string> = {
    'Regular': 'regular everyday grooming with natural unstyled appearance, hair in its natural state without product',
    'Well-Groomed': 'well-groomed polished appearance with neat styled hair, clean skin, put-together presentation',
    'Styled': 'curated styled look with intentional fashion choices, hair deliberately arranged, makeup if applicable',
    'Messy / Just Woke Up': 'messy just-woke-up appearance with tousled bedhead hair, slightly puffy face, natural morning tiredness visible',
    'Running Late': 'rushed running-late appearance with quickly styled hair, slightly disheveled clothing, subtle stress in posture'
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

/**
 * Transform LifestyleStep3 UI state to PromptOptions
 * COMPLETE SEMANTIC INJECTION - Every control produces observable differences
 */
export function mapLifestyleToPromptOptions(
    sceneState: Step3Values,
    existingOptions: Partial<PromptOptions> = {}
): Partial<PromptOptions> {
    // MANDATORY LOGGING - Input state
    console.log('[MAP INPUT]', JSON.stringify(sceneState, null, 2));

    // ========================================================================
    // PRODUCT MODE ROUTING
    // ========================================================================
    const isProductMode = sceneState.creationIntent === 'product' ||
        sceneState.creationIntent === 'brand';

    if (isProductMode) {
        console.log('[MAP] Routing to Product Mode mapper');
        return mapProductModeToPromptOptions(sceneState, existingOptions);
    }

    // Initialize mapped options
    const mapped: Partial<PromptOptions> = { ...existingOptions };

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
        mapped.ugcRealityPreset = 'authentic-ugc';

        // Block studio/editorial vocabulary
        // These overrides propagate to builders
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
    const framingSemantic = FRAMING_SEMANTIC_MAP[sceneState.framing] || FRAMING_SEMANTIC_MAP['Centered'];
    mapped.perspective = framingSemantic;
    console.log('[MAP] framing:', sceneState.framing, '→', framingSemantic);

    // ========================================================================
    // ENVIRONMENT → Scene Context
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
    // PERSON SETTINGS → Complete Physical Semantic Mapping
    // ========================================================================
    const personIncluded = !sceneState.noPerson;
    mapped.personIncluded = personIncluded;

    if (personIncluded) {
        if (!mapped.personDetails) {
            mapped.personDetails = {};
        }

        // AGE - Numeric (18-90)
        mapped.personDetails.age = sceneState.age;
        console.log('[MAP] age:', sceneState.age);

        // GENDER
        if (sceneState.gender) {
            mapped.gender = sceneState.gender;
            mapped.personDetails.gender = sceneState.gender;
            console.log('[MAP] gender:', sceneState.gender);
        }

        // ETHNICITY → Physical Facial Features
        if (sceneState.ethnicity && sceneState.ethnicity !== 'Non-specific') {
            const ethnicityFacial = ETHNICITY_FACIAL_MAP[sceneState.ethnicity] || sceneState.ethnicity;
            mapped.ethnicity = ethnicityFacial;
            mapped.personDetails.ethnicity = ethnicityFacial;
            console.log('[MAP] ethnicity:', sceneState.ethnicity, '→', ethnicityFacial);
        }

        // BODY TYPE
        if (sceneState.bodyType) {
            mapped.personDetails.bodyType = sceneState.bodyType;
            console.log('[MAP] bodyType:', sceneState.bodyType);
        }

        // SKIN TONE
        if (sceneState.skinTone) {
            mapped.skinTone = sceneState.skinTone;
            mapped.personDetails.skinTone = sceneState.skinTone;
            console.log('[MAP] skinTone:', sceneState.skinTone);
        }

        // SKIN REALISM - Simplified options
        if (sceneState.skinRealism) {
            const skinRealismMap: Record<string, string> = {
                'Raw / Real': 'ultra-realistic skin texture with visible pores, fine lines, natural imperfections including minor blemishes',
                'Natural': 'natural skin texture with subtle imperfections, light clean appearance',
                'Soft Retouch': 'softly retouched skin with smooth gradations, subtle professional quality'
            };
            mapped.personDetails.skinRealism = skinRealismMap[sceneState.skinRealism] || sceneState.skinRealism;
            console.log('[MAP] skinRealism:', sceneState.skinRealism, '→', mapped.personDetails.skinRealism);
        }

        // EYE COLOR
        if (sceneState.eyeColor) {
            mapped.personDetails.eyeColor = `${sceneState.eyeColor.toLowerCase()} eyes with natural iris detail`;
            console.log('[MAP] eyeColor:', sceneState.eyeColor);
        }

        // HAIR - 3 Dimensions
        if (sceneState.hairLength) {
            mapped.personDetails.hairLength = sceneState.hairLength;
        }
        if (sceneState.hairTexture) {
            mapped.personDetails.hairTexture = sceneState.hairTexture;
        }
        if (sceneState.hairColor) {
            mapped.hairColor = sceneState.hairColor;
            mapped.personDetails.hairColor = sceneState.hairColor;
        }
        console.log('[MAP] hair:', sceneState.hairLength, sceneState.hairTexture, sceneState.hairColor);

        // FACIAL EXPRESSION → Physical Muscle States (SEPARATE from Scene Mood)
        if (sceneState.facialExpression) {
            const expressionFacial = FACIAL_EXPRESSION_MAP[sceneState.facialExpression] || sceneState.facialExpression;
            mapped.personDetails.facialExpression = expressionFacial;
            mapped.personExpression = expressionFacial;
            console.log('[MAP] facialExpression:', sceneState.facialExpression, '→', expressionFacial);
        }

        // EYE DIRECTION → Physical Gaze
        if (sceneState.eyeDirection) {
            const eyeDirectionSemantic = EYE_DIRECTION_SEMANTIC_MAP[sceneState.eyeDirection] || sceneState.eyeDirection;
            mapped.eyeDirection = sceneState.eyeDirection as any;
            mapped.personDetails.eyeDirection = sceneState.eyeDirection as any;
            console.log('[MAP] eyeDirection:', sceneState.eyeDirection, '→', eyeDirectionSemantic);
        }

        // POSE → Physical Body Position
        if (sceneState.pose) {
            const poseSemantic = POSE_SEMANTIC_MAP[sceneState.pose] || sceneState.pose;
            mapped.personPose = poseSemantic;
            mapped.personDetails.personPose = poseSemantic;
            console.log('[MAP] pose:', sceneState.pose, '→', poseSemantic);
        }

        // APPEARANCE LEVEL → Grooming State
        if (sceneState.appearanceLevel) {
            const appearanceSemantic = APPEARANCE_SEMANTIC_MAP[sceneState.appearanceLevel] || sceneState.appearanceLevel;
            mapped.personAppearance = appearanceSemantic;
            mapped.personDetails.personAppearance = appearanceSemantic;
            console.log('[MAP] appearanceLevel:', sceneState.appearanceLevel, '→', appearanceSemantic);
        }

        // SELFIE TYPE → Camera POV
        if (sceneState.selfieType && sceneState.selfieType !== 'None') {
            const selfieSemantic = SELFIE_TYPE_SEMANTIC_MAP[sceneState.selfieType] || sceneState.selfieType;
            mapped.selfieType = selfieSemantic;
            mapped.personDetails.selfieType = selfieSemantic;
            console.log('[MAP] selfieType:', sceneState.selfieType, '→', selfieSemantic);

            // SELFIE EXECUTION → Physical execution style (only for Front Camera Selfie)
            if (sceneState.selfieType === 'Front Camera Selfie' && (sceneState as any).selfieExecution) {
                const executionSemantic = SELFIE_EXECUTION_SEMANTIC_MAP[(sceneState as any).selfieExecution] || (sceneState as any).selfieExecution;
                mapped.selfieExecution = executionSemantic;
                console.log('[MAP] selfieExecution:', (sceneState as any).selfieExecution, '→', executionSemantic);
            }
        }

        // WARDROBE → Clothing Physical Description
        if (sceneState.wardrobe) {
            const wardrobeSemantic = WARDROBE_SEMANTIC_MAP[sceneState.wardrobe] || sceneState.wardrobe;
            mapped.wardrobeStyle = wardrobeSemantic;
            mapped.personDetails.wardrobeStyle = wardrobeSemantic;
            console.log('[MAP] wardrobe:', sceneState.wardrobe, '→', wardrobeSemantic);
        }

        // PRODUCT INTERACTION → Physical Hand Position
        if (sceneState.productInteraction) {
            const interactionSemantic = INTERACTION_SEMANTIC_MAP[sceneState.productInteraction] || sceneState.productInteraction;
            mapped.productInteraction = interactionSemantic;
            mapped.personDetails.productInteraction = interactionSemantic;
            console.log('[MAP] productInteraction:', sceneState.productInteraction, '→', interactionSemantic);
        }
    } else {
        mapped.personIncluded = false;
        console.log('[MAP] No person included');
    }

    // ========================================================================
    // SCENE MOOD → Atmosphere/Energy (SEPARATE from Facial Expression)
    // ========================================================================
    if (sceneState.mood) {
        const sceneMoodValue = SCENE_MOOD_MAP[sceneState.mood] || sceneState.mood;
        mapped.personMood = sceneMoodValue;  // Keep for backwards compat
        (mapped as any).sceneMood = sceneMoodValue;  // NEW: separate field
        if (mapped.personDetails) {
            mapped.personDetails.personMood = sceneMoodValue;
        }
        console.log('[MAP] sceneMood:', sceneState.mood, '→', sceneMoodValue);
    }

    // ========================================================================
    // HERO PERSONA → Complete Semantic Character Description (UGC)
    // ========================================================================
    if (sceneState.heroPersona) {
        mapped.heroPersona = sceneState.heroPersona;
        if (mapped.personDetails) {
            mapped.personDetails.heroPersona = sceneState.heroPersona;
        }
        console.log('[MAP] heroPersona:', sceneState.heroPersona);
    }

    // ========================================================================
    // PROPS → Scene Objects
    // ========================================================================
    if (sceneState.props && sceneState.props !== 'None') {
        const propsSemantic = sceneState.props === 'Custom' && sceneState.customProps
            ? sceneState.customProps
            : PROPS_SEMANTIC_MAP[sceneState.props] || '';
        mapped.personProps = propsSemantic;
        if (mapped.personDetails) {
            mapped.personDetails.personProps = propsSemantic;
        }
        console.log('[MAP] props:', sceneState.props, '→', propsSemantic);
    }

    // ========================================================================
    // FORMULATION STORY
    // ========================================================================
    mapped.formulationExpertEnabled = sceneState.formulationStoryEnabled;
    mapped.formulationExpertName = sceneState.formulationName;
    mapped.formulationExpertRole = sceneState.formulationRole;
    mapped.formulationLabStyle = sceneState.formulationLabVibe;
    mapped.formulationExpertPreset = sceneState.formulationPreset;

    // ========================================================================
    // CONTENT STYLE & CREATION INTENT
    // ========================================================================
    mapped.creationIntent = sceneState.creationIntent;
    mapped.contentStyle = sceneState.creationIntent === 'ugc' && personIncluded ? 'ugc' : 'product';

    // ========================================================================
    // INJECT STRUCTURAL RULES INTO OUTPUT
    // ========================================================================
    // These will be picked up by builders
    (mapped as any).creationModeStructural = creationModeStructural;
    (mapped as any).compositionModeStructural = compositionModeStructural;
    (mapped as any).cameraDeviceSemantic = cameraDeviceSemantic;

    // MANDATORY LOGGING - Complete output
    console.log('[MAP OUTPUT]', JSON.stringify(mapped, null, 2));

    return mapped;
}

