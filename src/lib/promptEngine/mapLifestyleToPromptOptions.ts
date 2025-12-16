/**
 * Map LifestyleStep3 Scene Builder state to PromptOptions for PromptEngine
 * REBUILT FROM SCRATCH - Phase 4 of Step 3 Scene Builder Reconstruction
 * This is the bridge between UI state and prompt generation
 * 
 * PRODUCT MODE INTEGRATION:
 * - Routes to mapProductModeToPromptOptions when creationIntent === 'product'
 * - Ensures no UGC contamination in Product Mode
 */

import type { Step3Values } from '@/components/LifestyleStep3';
import type { PromptOptions } from './types';
import { mapProductModeToPromptOptions } from './mapProductModeToPromptOptions';

/**
 * Convert age number to age group string for PromptEngine
 */
const ageToGroup = (age: number): string => {
    if (age >= 75) return '75+';
    if (age >= 60) return '60-75';
    if (age >= 46) return '46-60';
    if (age >= 36) return '36-45';
    if (age >= 26) return '26-35';
    return '18-25';
};

/**
 * Transform LifestyleStep3 UI state to PromptOptions
 * MANDATORY LOGGING on input and output
 * REAL INJECTION of camera, environment, ecommerce blank space rules
 */
export function mapLifestyleToPromptOptions(
    sceneState: Step3Values,
    existingOptions: Partial<PromptOptions> = {}
): Partial<PromptOptions> {
    // MANDATORY LOG - Input
    console.log('[MAP INPUT]', sceneState);

    // ========================================================================
    // PRODUCT MODE ROUTING (Stage 10) - FIXED
    // ========================================================================
    // CRITICAL FIX: Only route to Product Mode when creationIntent is EXPLICITLY 'product' or 'brand'
    // DO NOT route based on noPerson - Lifestyle mode can have noPerson for product-only shots
    const isProductMode = sceneState.creationIntent === 'product' ||
        sceneState.creationIntent === 'brand';

    if (isProductMode) {
        console.log('[MAP] Routing to Product Mode mapper');
        return mapProductModeToPromptOptions(sceneState, existingOptions);
    }

    // Continue with Lifestyle/UGC mapping
    const mapped: Partial<PromptOptions> = { ...existingOptions };

    // ========================================================================
    // CAMERA → PHYSICAL COMPOSITION LANGUAGE
    // ========================================================================

    // Shot Type → framing/distance
    const shotTypeMap: Record<string, string> = {
        'Close-up': 'close-up framing focused on face and upper torso',
        'Medium': 'medium shot framing from waist up, balanced composition',
        'Full body': 'full-body shot showing entire person and surroundings',
        'Product focus': 'tight product-focused framing with person secondary',
        'Environmental': 'wide environmental shot emphasizing setting and context'
    };
    mapped.cameraShot = shotTypeMap[sceneState.shotType] as any || 'medium shot framing from waist up';

    // Camera Angle → perspective  
    const angleMap: Record<string, string> = {
        'Eye level': 'camera at natural eye level, neutral perspective',
        'Slightly above': 'camera positioned slightly above eye level, subtle downward angle',
        'Slightly below': 'camera positioned slightly below eye level, subtle upward angle',
        'Dutch angle': 'camera tilted at subtle dutch angle for dynamic composition'
    };
    mapped.cameraAngle = angleMap[sceneState.cameraAngle] as any || 'camera at natural eye level';

    // Framing → composition style
    const framingMap: Record<string, string> = {
        'Centered': 'centered symmetrical composition, subject in middle of frame',
        'Rule of thirds': 'rule-of-thirds composition with subject off-center for visual balance',
        'Off-center': 'intentionally off-center asymmetric composition for dynamic feel',
        'Spontaneous': 'spontaneous imperfect natural framing, slightly cropped edges, unplanned authentic composition'
    };
    mapped.perspective = framingMap[sceneState.framing] || 'centered composition';

    // ========================================================================
    // ENVIRONMENT → Scene Context
    // ========================================================================

    if (sceneState.environment === 'Custom' && sceneState.customEnvironment) {
        mapped.setting = sceneState.customEnvironment;
        mapped.microLocation = sceneState.customEnvironment;
    } else if (sceneState.environment && sceneState.environment !== '') {
        const envMap: Record<string, string> = {
            'Living Room': 'cozy living room with natural materials',
            'Kitchen': 'modern kitchen with counter space',
            'Bedroom': 'bedroom with soft bedding',
            'Coffee Shop': 'coffee shop with warm ambiance',
            'Office': 'minimal office workspace',
            'City Street': 'urban city street',
            'Park': 'outdoor park with greenery',
            'Beach': 'beach with natural light',
            'Car Interior': 'inside car interior',
        };
        mapped.setting = envMap[sceneState.environment] || sceneState.environment.toLowerCase();
        mapped.microLocation = mapped.setting;
    } else {
        // No environment
        mapped.setting = '';
        mapped.microLocation = '';
    }

    // ========================================================================
    // OUTPUT FORMAT → Aspect Ratio Control
    // ========================================================================

    const aspectRatioMap: Record<string, string> = {
        '1:1 (Square)': '1:1',
        '4:5 (Portrait)': '4:5',
        '9:16 (Story)': '9:16'
    };
    mapped.aspectRatio = aspectRatioMap[sceneState.aspectRatio] || '1:1';

    // ========================================================================
    // ECOMMERCE BLANK SPACE → Studio Mode Injection
    // ========================================================================

    const isEcommerceBlankSpace = sceneState.creationMode === 'Ecommerce Blank Space';

    if (isEcommerceBlankSpace) {
        console.log('[MAP] Ecommerce Blank Space mode - injecting studio rules');

        // REMOVE ALL environment language
        mapped.setting = '';
        mapped.microLocation = '';

        // Inject solid background
        mapped.bgColor = sceneState.ecommerceBackgroundColor || '#FFFFFF';

        // Inject negative space composition
        mapped.compositionMode = sceneState.compositionMode || 'Blank Space';
        mapped.sidePlacement = (sceneState.sidePlacement?.toLowerCase() || 'center') as any;

        // Force studio lighting mode
        mapped.lighting = 'studio lighting with soft shadows';

        // Set creation mode
        mapped.creationMode = 'ecom-blank';
    } else {
        // Normal lifestyle mode
        mapped.creationMode = 'lifestyle';

        // =====================================================================
        // TIME OF DAY → SEMANTIC LIGHTING & ATMOSPHERE
        // =====================================================================
        const timeMap: Record<string, string> = {
            'Morning': 'soft early morning natural light, fresh atmosphere, cool tones',
            'Midday': 'bright midday light with neutral color temperature, strong even illumination',
            'Afternoon': 'warm afternoon light, balanced shadows, gentle natural warmth',
            'Golden Hour': 'golden hour sunlight with warm orange-amber glow, long soft shadows',
            'Evening': 'soft fading evening light, warm indoor ambient tones, subtle shadows',
            'Night': 'low ambient nighttime lighting, indoor artificial warmth, deeper shadows'
        };

        // =====================================================================
        // LIGHTING STYLE → PHYSICAL LIGHT BEHAVIOR
        // =====================================================================
        const lightingMap: Record<string, string> = {
            'Natural window': 'natural window light from the side, soft directional illumination, gentle falloff',
            'Soft diffused': 'soft diffused lighting with minimal harsh shadows, even gentle illumination',
            'Direct sunlight': 'direct natural sunlight with strong contrast, defined shadows, bright highlights',
            'Indoor artificial': 'indoor artificial lighting with realistic color temperature, typical home ambiance',
            'Moody/dramatic': 'moody low-key dramatic lighting with deeper shadows, selective illumination',
            'Phone flashlight': 'harsh direct phone flashlight illumination, uneven exposure, realistic phone camera lighting'
        };

        const timeDescriptor = timeMap[sceneState.timeOfDay] || 'natural daylight';
        const lightingDescriptor = lightingMap[sceneState.lightingStyle] || sceneState.lightingStyle?.toLowerCase() || 'natural light';

        // Combine time + lighting for complete lighting narrative
        mapped.lighting = [timeDescriptor, lightingDescriptor].filter(Boolean).join(', ');
    }

    // ========================================================================
    // Person Settings - COMPLETE SEMANTIC MAPPING
    // ========================================================================

    const personIncluded = !sceneState.noPerson;
    mapped.personIncluded = personIncluded;

    if (personIncluded) {
        if (!mapped.personDetails) {
            mapped.personDetails = {};
        }

        // **AGE - NUMERIC** (CRITICAL)
        mapped.personDetails.age = sceneState.age;  // 18-90
        mapped.ageGroup = ageToGroup(sceneState.age);
        mapped.personDetails.ageGroup = mapped.ageGroup;

        // **GENDER** - Extended options
        if (sceneState.gender) {
            mapped.gender = sceneState.gender;
            mapped.personDetails.gender = sceneState.gender;
        }

        // **ETHNICITY**
        if (sceneState.ethnicity && sceneState.ethnicity !== 'Prefer not to specify') {
            if (sceneState.customEthnicity) {
                // Custom ethnicity
                mapped.ethnicity = `ethnicity described as: ${sceneState.customEthnicity}`;
                mapped.personDetails.ethnicity = `ethnicity described as: ${sceneState.customEthnicity}`;
            } else {
                mapped.ethnicity = sceneState.ethnicity;
                mapped.personDetails.ethnicity = sceneState.ethnicity;
            }
        }

        // **BODY TYPE**
        if (sceneState.bodyType) {
            mapped.personDetails.bodyType = sceneState.bodyType;
        }

        // **SKIN TONE**
        if (sceneState.skinTone) {
            mapped.skinTone = sceneState.skinTone;
            mapped.personDetails.skinTone = sceneState.skinTone;
        }

        // **SKIN REALISM**
        if (sceneState.skinRealism) {
            mapped.personDetails.skinRealism = sceneState.skinRealism;
        }

        // **EYE COLOR**
        if (sceneState.eyeColor) {
            mapped.personDetails.eyeColor = sceneState.eyeColor;
        }

        // **HAIR** - Separate properties
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

        // **FACIAL EXPRESSION** - Semantic mapping
        if (sceneState.facialExpression) {
            mapped.personDetails.facialExpression = sceneState.facialExpression;
        }

        // **EYE DIRECTION** - Gaze mapping
        if (sceneState.eyeDirection) {
            mapped.eyeDirection = sceneState.eyeDirection as any;
            mapped.personDetails.eyeDirection = sceneState.eyeDirection as any;
        }

        // **SELFIE TYPE** - POV mapping
        if (sceneState.selfieType && sceneState.selfieType !== 'None') {
            mapped.selfieType = sceneState.selfieType;
            mapped.personDetails.selfieType = sceneState.selfieType;
        }

        // **WARDROBE**
        if (sceneState.wardrobe) {
            const wardrobeMap: Record<string, string> = {
                'Casual Streetwear': 'casual streetwear',
                'Athleisure Set': 'athleisure',
                'Minimal Luxe': 'minimal luxe',
                'Cozy Knitwear': 'cozy knitwear',
                'Bold Color Pop': 'bold color pop',
                'Errand-Day Layers': 'errand-day layers'
            };
            mapped.wardrobeStyle = wardrobeMap[sceneState.wardrobe] || sceneState.wardrobe.toLowerCase();
            mapped.personDetails.wardrobeStyle = mapped.wardrobeStyle;
        }

        // **PRODUCT INTERACTION**
        if (sceneState.productInteraction) {
            const interactionMap: Record<string, string> = {
                'Holding': 'holding the product naturally',
                'Using': 'using the product',
                'Showing to Camera': 'showing the product to camera',
                'Unboxing': 'unboxing the product',
                'Applying': 'applying the product',
                'Placing on Surface': 'placing the product on surface'
            };
            mapped.productInteraction = interactionMap[sceneState.productInteraction];
            mapped.personDetails.productInteraction = mapped.productInteraction;
        }
    } else {
        // No person
        mapped.ageGroup = 'no person';
        mapped.personIncluded = false;
    }

    // ========================================================================
    // MOOD → BODY LANGUAGE & POSTURE (NOT ADJECTIVES)
    // ========================================================================

    const moodMap: Record<string, string> = {
        'Calm & Serene': 'relaxed posture with peaceful atmosphere, natural shoulders, gentle breathing, serene body language',
        'Joyful & High-Energy': 'energetic posture with lively candid movement, upbeat body language, spontaneous joyful presence',
        'Confident & Editorial': 'upright confident posture with composed presence, open chest, self-assured body language',
        'Playful & Candid': 'loose playful body language with spontaneous natural moment, casual relaxed positioning',
        'Hustle & Juggle': 'busy everyday posture with multitasking vibe, active engaged body language, real-life energy',
        'Stressed but Determined': 'visible effort in body language with focused determined posture, subtle tension with resolve'
    };
    mapped.personMood = moodMap[sceneState.mood] || sceneState.mood;

    if (mapped.personDetails) {
        mapped.personDetails.personMood = mapped.personMood;
    }

    // ========================================================================
    // UGC Real Mode
    // ========================================================================

    if (sceneState.ugcRealMode) {
        mapped.ugcRealModeActive = true;
        mapped.realModeActive = true;
        mapped.ugcRealityPreset = 'authentic-ugc';
    }

    // ========================================================================
    // Formulation Story
    // ========================================================================

    mapped.formulationExpertEnabled = sceneState.formulationStoryEnabled;
    mapped.formulationExpertName = sceneState.formulationName;
    mapped.formulationExpertRole = sceneState.formulationRole;
    mapped.formulationLabStyle = sceneState.formulationLabVibe;
    mapped.formulationExpertPreset = sceneState.formulationPreset;

    // ========================================================================
    // Content Style & Creation Intent
    // ========================================================================

    mapped.creationIntent = sceneState.creationIntent;
    if (sceneState.creationIntent === 'ugc') {
        mapped.contentStyle = personIncluded ? 'ugc' : 'product';
    } else {
        mapped.contentStyle = 'product';
    }

    // Camera default
    mapped.camera = 'smartphone';

    // MANDATORY LOG - Output
    console.log('[MAP OUTPUT]', mapped);

    return mapped;
}
