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
    // PRODUCT MODE ROUTING (Stage 10)
    // ========================================================================
    // If Product Mode is active, use dedicated Product mapper
    // This prevents UGC contamination and ensures Product-only vocabulary
    const isProductMode = sceneState.creationIntent === 'product' ||
        sceneState.creationIntent === 'brand' ||
        sceneState.noPerson === true;

    if (isProductMode) {
        console.log('[MAP] Routing to Product Mode mapper');
        return mapProductModeToPromptOptions(sceneState, existingOptions);
    }

    // Continue with Lifestyle/UGC mapping
    const mapped: Partial<PromptOptions> = { ...existingOptions };

    // ========================================================================
    // CAMERA VALUE TRANSLATIONS → Framing Language
    // ========================================================================

    // Shot Type → camera framing language
    const shotTypeMap: Record<string, string> = {
        'Close-up': 'close-up',
        'Medium': 'medium',
        'Full body': 'full-body',
        'Product focus': 'product-focus',
        'Environmental': 'environmental'
    };
    mapped.cameraShot = shotTypeMap[sceneState.shotType] as any || 'medium';

    // Camera Angle → perspective language
    const angleMap: Record<string, string> = {
        'Eye level': 'eye-level',
        'Slightly above': 'slightly-above',
        'Slightly below': 'slightly-below',
        'Dutch angle': 'dutch-angle'
    };
    mapped.cameraAngle = angleMap[sceneState.cameraAngle] as any || 'eye-level';

    // Framing → perspective/composition
    const framingMap: Record<string, string> = {
        'Centered': 'centered composition',
        'Rule of thirds': 'rule-of-thirds composition',
        'Off-center': 'off-center asymmetric composition',
        'Spontaneous': 'spontaneous natural framing'
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

        // Time of Day → lighting influences
        const timeMap: Record<string, string> = {
            'Morning': 'morning light',
            'Midday': 'midday light',
            'Afternoon': 'afternoon light',
            'Golden Hour': 'golden hour glow',
            'Evening': 'evening ambient light',
            'Night': 'night time lighting'
        };

        // Lighting Style
        const lightingMap: Record<string, string> = {
            'Natural window': 'natural window lighting',
            'Soft diffused': 'soft diffused light',
            'Direct sunlight': 'direct sunlight',
            'Indoor artificial': 'artificial indoor lighting',
            'Moody/dramatic': 'moody dramatic lighting',
            'Phone flashlight': 'phone flashlight illumination'
        };

        const timeDescriptor = timeMap[sceneState.timeOfDay];
        const lightingDescriptor = lightingMap[sceneState.lightingStyle] || sceneState.lightingStyle.toLowerCase();
        mapped.lighting = [timeDescriptor, lightingDescriptor].filter(Boolean).join(', ');
    }

    // ========================================================================
    // Person Settings
    // ========================================================================

    const personIncluded = !sceneState.noPerson;
    mapped.personIncluded = personIncluded;

    if (personIncluded) {
        if (!mapped.personDetails) {
            mapped.personDetails = {};
        }

        // Age → ageGroup
        mapped.ageGroup = ageToGroup(sceneState.age);
        if (mapped.personDetails) {
            mapped.personDetails.ageGroup = mapped.ageGroup;
        }

        // Gender
        const genderMap: Record<string, string> = {
            'Male': 'male',
            'Female': 'female'
        };
        if (sceneState.gender) {
            mapped.gender = genderMap[sceneState.gender];
            if (mapped.personDetails) {
                mapped.personDetails.gender = mapped.gender;
            }
        }

        // Skin Tone
        const skinToneMap: Record<string, string> = {
            'Fair Cool': 'fair cool',
            'Fair Warm': 'fair warm',
            'Medium Neutral': 'medium neutral',
            'Olive': 'olive',
            'Tan': 'tan',
            'Deep Golden': 'deep golden',
            'Deep Cool': 'deep cool'
        };
        mapped.skinTone = skinToneMap[sceneState.skinTone] || 'medium neutral';
        if (mapped.personDetails) {
            mapped.personDetails.skinTone = mapped.skinTone;
        }

        // ETHNICITY → Explicit Visual Facial Traits (CRITICAL FIX)
        const ethnicityMap: Record<string, string> = {
            'Asian': 'East Asian facial features with distinct East Asian bone structure, epicanthic folds, and characteristic East Asian appearance',
            'Black / African descent': 'African descent with rich deep skin tone, natural coily hair texture, and distinctive African facial features',
            'Latino / Hispanic': 'Latino Hispanic appearance with warm skin tone and characteristic Latin American facial features',
            'White / European descent': 'European Caucasian appearance with characteristic Western European facial structure',
            'Middle Eastern': 'Middle Eastern appearance with distinctive Mediterranean-Middle Eastern facial features',
            'South Asian': 'South Asian appearance with characteristic Indian subcontinent facial features',
            'Mixed': 'mixed ethnic heritage with blended facial characteristics',
            'Non-specific': ''
        };
        const ethnicityTrait = ethnicityMap[sceneState.ethnicity] || '';
        if (ethnicityTrait) {
            mapped.ethnicity = ethnicityTrait;
            if (mapped.personDetails) {
                mapped.personDetails.ethnicity = ethnicityTrait;
            }
            console.log('[ETHNICITY INJECTION]', sceneState.ethnicity, '→', ethnicityTrait);
        }

        // Body Type → personAppearance
        const bodyTypeMap: Record<string, string> = {
            'Slim': 'slim build',
            'Average': 'average build',
            'Athletic': 'athletic and fit',
            'Curvy': 'curvy',
            'Plus size': 'plus-size'
        };
        mapped.personAppearance = bodyTypeMap[sceneState.bodyType];

        // Facial Expression → personExpression
        const expressionMap: Record<string, string> = {
            'Soft Smile': 'soft smile',
            'Full Smile': 'full smile',
            'Serious Focus': 'serious focused',
            'Excited Surprise': 'excited surprise',
            'Stressed but Hopeful': 'stressed but hopeful',
            'Caffeinated Crash': 'caffeinated crash',
            'Real-Life Calm': 'real-life calm',
            'UGC Reality': 'ugc authentic expression'
        };
        mapped.personExpression = expressionMap[sceneState.facialExpression] || sceneState.facialExpression.toLowerCase();
        if (mapped.personDetails) {
            mapped.personDetails.personExpression = mapped.personExpression;
        }

        // Hair
        mapped.hairStyle = sceneState.hairLength.toLowerCase() + ' ' + sceneState.hairTexture.toLowerCase();
        if (mapped.personDetails) {
            mapped.personDetails.hairStyle = mapped.hairStyle;
            mapped.personDetails.hairColor = sceneState.hairColor;
        }

        // Wardrobe
        const wardrobeMap: Record<string, string> = {
            'Casual Streetwear': 'casual streetwear',
            'Athleisure Set': 'athleisure',
            'Minimal Luxe': 'minimal luxe',
            'Cozy Knitwear': 'cozy knitwear',
            'Bold Color Pop': 'bold color pop',
            'Errand-Day Layers': 'errand-day layers'
        };
        mapped.wardrobeStyle = wardrobeMap[sceneState.wardrobe] || sceneState.wardrobe.toLowerCase();
        if (mapped.personDetails) {
            mapped.personDetails.wardrobeStyle = mapped.wardrobeStyle;
        }

        // Pose
        if (sceneState.pose) {
            if (!mapped.personDetails) {
                mapped.personDetails = {};
            }
            mapped.personDetails.personPose = sceneState.pose;
        }

        // Product Interaction
        const interactionMap: Record<string, string> = {
            'Holding': 'holding the product naturally',
            'Using': 'using the product',
            'Showing to Camera': 'showing the product to camera',
            'Unboxing': 'unboxing the product',
            'Applying': 'applying the product',
            'Placing on Surface': 'placing the product on surface'
        };
        mapped.productInteraction = interactionMap[sceneState.productInteraction];
        if (mapped.personDetails) {
            mapped.personDetails.productInteraction = mapped.productInteraction;
        }
    } else {
        // No person
        mapped.ageGroup = 'no person';
        mapped.personIncluded = false;
    }

    // ========================================================================
    // Mood / Vibe
    // ========================================================================

    const moodMap: Record<string, string> = {
        'Calm & Serene': 'calm and serene vibe',
        'Joyful & High-Energy': 'joyful and high-energy',
        'Confident & Editorial': 'confident editorial tone',
        'Playful & Candid': 'playful and candid',
        'Hustle & Juggle': 'hustle-focused energy',
        'Stressed but Determined': 'stressed but determined focus'
    };
    mapped.personMood = moodMap[sceneState.mood] || sceneState.mood;

    if (mapped.personDetails) {
        mapped.personDetails.personMood = mapped.personMood;
    }

    // ========================================================================
    // UGC Real Mode
    // ========================================================================

    if (sceneState.ugcRealMode) {
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
