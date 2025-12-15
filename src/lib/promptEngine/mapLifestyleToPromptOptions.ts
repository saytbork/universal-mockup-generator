/**
 * Map LifestyleStep3 Scene Builder state to PromptOptions for PromptEngine
 * This is the bridge between UI state and prompt generation
 */

import type { Step3Values } from '@/components/LifestyleStep3';
import type { PromptOptions } from './types';

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
 * NO defaults invented here - only explicit mappings from UI
 */
export function mapLifestyleToPromptOptions(
    lifestyleState: Step3Values,
    existingOptions: Partial<PromptOptions> = {}
): Partial<PromptOptions> {
    const mapped: Partial<PromptOptions> = { ...existingOptions };

    // Creator/Person settings
    const personIncluded = !lifestyleState.noPerson;
    mapped.personIncluded = personIncluded;

    if (personIncluded) {
        // Initialize personDetails if needed
        if (!mapped.personDetails) {
            mapped.personDetails = {};
        }

        // Age → ageGroup
        mapped.ageGroup = ageToGroup(lifestyleState.age);
        if (mapped.personDetails) {
            mapped.personDetails.ageGroup = mapped.ageGroup;
        }

        // Gender
        const genderMap: Record<string, string> = {
            'Male': 'male',
            'Female': 'female',
            'Non specific': undefined as any
        };
        if (lifestyleState.gender && lifestyleState.gender !== 'Non specific') {
            mapped.gender = genderMap[lifestyleState.gender];
            if (mapped.personDetails) {
                mapped.personDetails.gender = mapped.gender;
            }
        }

        // Skin Tone
        const skinToneMap: Record<string, string> = {
            'Light': 'light',
            'Medium': 'medium',
            'Olive': 'olive',
            'Brown': 'tan',
            'Dark': 'deep'
        };
        mapped.skinTone = skinToneMap[lifestyleState.skinTone] || 'medium';
        if (mapped.personDetails) {
            mapped.personDetails.skinTone = mapped.skinTone;
        }

        // Body Type → personAppearance
        const bodyTypeMap: Record<string, string> = {
            'Slim': 'slim build',
            'Average': 'average build',
            'Athletic': 'athletic and fit',
            'Curvy': 'curvy',
            'Plus size': 'plus-size'
        };
        mapped.personAppearance = bodyTypeMap[lifestyleState.bodyType];

        // Hair
        mapped.hairStyle = lifestyleState.hair.toLowerCase();
        if (mapped.personDetails) {
            mapped.personDetails.hairStyle = mapped.hairStyle;
        }

        // Facial Expression → personExpression
        const expressionMap: Record<string, string> = {
            'Neutral': 'neutral',
            'Soft smile': 'soft smile',
            'Happy': 'happy and joyful',
            'Confident': 'confident',
            'Relaxed': 'relaxed and calm',
            'Candid': 'candid natural expression'
        };
        mapped.personExpression = expressionMap[lifestyleState.facialExpression];
        if (mapped.personDetails) {
            mapped.personDetails.personExpression = mapped.personExpression;
        }

        // Eye Direction
        const eyeMap: Record<string, string> = {
            'Looking at camera': 'looking directly at camera',
            'Looking at product': 'looking at the product',
            'Looking away naturally': 'looking away naturally'
        };
        if (mapped.personDetails) {
            mapped.personDetails.eyeDirection = lifestyleState.eyeDirection as any;
        }

        // Wardrobe
        const wardrobeMap: Record<string, string> = {
            'Casual': 'casual everyday wear',
            'Athleisure': 'athleisure',
            'Wellness outfit': 'wellness-focused outfit',
            'Streetwear': 'streetwear',
            'Home wear': 'comfortable home wear',
            'Seasonal adaptive': 'seasonally appropriate'
        };
        mapped.wardrobeStyle = wardrobeMap[lifestyleState.wardrobe];
        if (mapped.personDetails) {
            mapped.personDetails.wardrobeStyle = mapped.wardrobeStyle;
        }
    } else {
        // No person
        mapped.ageGroup = 'no person';
        mapped.personIncluded = false;
    }

    // Environment / Location
    if (lifestyleState.environment === 'Custom' && lifestyleState.customEnvironment) {
        mapped.setting = lifestyleState.customEnvironment;
        mapped.microLocation = lifestyleState.customEnvironment;
    } else {
        const envMap: Record<string, string> = {
            'Living Room': 'cozy living room',
            'Kitchen': 'modern kitchen',
            'Bedroom': 'bedroom',
            'Bathroom': 'bathroom vanity',
            'Home Office': 'home office',
            'Laundry Room': 'laundry room',
            'Home Studio Chaos': 'home studio with authentic chaos',
            'Entryway': 'entryway',
            'Café': 'coffee shop',
            'Outdoors': 'natural outdoor setting',
            'In the Car': 'inside car',
            'Beach': 'beach',
            'Garden Party': 'garden party',
            'Rooftop': 'rooftop',
            'Poolside': 'poolside',
            'Farmer\'s Market': 'farmer\'s market',
            'Wellness Spa': 'wellness spa',
            'Mountain Cabin': 'mountain cabin',
            'Boutique Hotel': 'boutique hotel room',
            'Subway Platform': 'subway platform'
        };
        mapped.setting = envMap[lifestyleState.environment] || lifestyleState.environment.toLowerCase();
        mapped.microLocation = mapped.setting;
    }

    // Time of Day → influences lighting
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
    const timeDescriptor = timeMap[lifestyleState.timeOfDay];
    const lightingDescriptor = lightingMap[lifestyleState.lightingStyle] || lifestyleState.lightingStyle.toLowerCase();
    mapped.lighting = [timeDescriptor, lightingDescriptor].filter(Boolean).join(', ');

    // Mood / Vibe → personMood
    const moodMap: Record<string, string> = {
        'Calm & Serene': 'calm and serene vibe',
        'Joyful & High-Energy': 'joyful and high-energy',
        'Confident & Editorial': 'confident editorial tone',
        'Playful & Candid': 'playful and candid',
        'Hustle & Juggle': 'hustle-focused energy',
        'Stressed but Determined': 'stressed but determined focus',
        'Calm and relaxed': 'calm and peaceful',
        'Happy and energetic': 'happy and energetic',
        'Cozy': 'cozy and comfortable',
        'Wellness focused': 'wellness-focused zen',
        'Authentic UGC': 'authentic creator vibe',
        'Candid, unposed': 'candid unposed'
    };
    mapped.personMood = moodMap[lifestyleState.mood] || lifestyleState.mood;

    // Shot Type → camera distance
    const shotMap: Record<string, string> = {
        'Close-up': 'close-up',
        'Medium': 'medium',
        'Full body': 'full-body',
        'Product focus': 'product focus',
        'Environmental': 'environmental'
    };
    mapped.cameraShot = shotMap[lifestyleState.shotType] as any;
    mapped.camera = 'smartphone'; // Default for lifestyle

    // Camera Angle
    const angleMap: Record<string, string> = {
        'Eye level': 'eye-level',
        'Slightly above': 'slightly-above',
        'Slightly below': 'slightly-below',
        'Dutch angle': 'dutch angle'
    };
    mapped.cameraAngle = angleMap[lifestyleState.cameraAngle] as any;

    // Framing → perspective
    const framingMap: Record<string, string> = {
        'Centered': 'centered',
        'Rule of thirds': 'rule-of-thirds',
        'Off-center': 'off-center',
        'Spontaneous': 'spontaneous composition'
    };
    mapped.perspective = framingMap[lifestyleState.framing];

    // Product Interaction
    const interactionMap: Record<string, string> = {
        'Holding': 'holding the product naturally',
        'Using': 'using the product',
        'Showing to Camera': 'showing the product to camera',
        'Unboxing': 'unboxing the product',
        'Applying': 'applying the product',
        'Placing on Surface': 'placing the product on surface'
    };
    mapped.productInteraction = interactionMap[lifestyleState.productInteraction];
    if (mapped.personDetails) {
        mapped.personDetails.productInteraction = mapped.productInteraction;
    }

    // Selfie Type
    if (mapped.personDetails) {
        mapped.personDetails.selfieType = lifestyleState.selfieType;
    }

    // Pose
    if (lifestyleState.pose) {
        if (!mapped.personDetails) {
            mapped.personDetails = {};
        }
        mapped.personDetails.personPose = lifestyleState.pose;
    }

    // Mood assignment to person details
    if (mapped.personDetails) {
        mapped.personDetails.personMood = mapped.personMood;
    }

    // UGC Real Mode
    if (lifestyleState.ugcRealMode) {
        mapped.realModeActive = true;
        mapped.ugcRealityPreset = 'authentic-ugc';
    }

    // Camera rules rely on perspective/time mapping
    if (mapped.personDetails) {
        mapped.personDetails.eyeDirection = lifestyleState.eyeDirection as any;
    }

    // Background Behavior
    // These influence the final prompt but don't have direct PromptOptions fields
    // Could be used in special modes or passed as flags

    // Advanced Pro Options
    // These would integrate with identity/continuity systems

    // Aspect Ratio
    mapped.aspectRatio = lifestyleState.aspectRatio;

    // Content Style & Creation Intent
    mapped.creationIntent = lifestyleState.creationIntent;
    if (lifestyleState.creationIntent === 'ugc') {
        mapped.contentStyle = personIncluded ? 'ugc' : 'product';
    } else {
        mapped.contentStyle = 'product';
    }

    const creationModeMap: Record<string, PromptOptions['creationMode']> = {
        'Lifestyle UGC': 'lifestyle',
        'Studio Hero': 'studio',
        'Aesthetic Builder': 'aesthetic',
        'Background Replace': 'bg-replace',
        'Ecommerce Blank Space': 'ecom-blank'
    };
    mapped.creationMode = creationModeMap[lifestyleState.creationMode] || 'lifestyle';

    // Ecommerce builder settings
    mapped.compositionMode = lifestyleState.compositionMode;
    const placement = lifestyleState.sidePlacement?.toLowerCase() || 'center';
    mapped.sidePlacement = placement as PromptOptions['sidePlacement'];
    mapped.bgColor = lifestyleState.ecommerceBackgroundColor;

    // Formulation story details
    mapped.formulationExpertEnabled = lifestyleState.formulationStoryEnabled;
    mapped.formulationExpertName = lifestyleState.formulationName;
    mapped.formulationExpertRole = lifestyleState.formulationRole;
    mapped.formulationLabStyle = lifestyleState.formulationLabVibe;
    mapped.formulationExpertPreset = lifestyleState.formulationPreset;

    return mapped;
}
