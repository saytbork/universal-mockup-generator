/**
 * Map LifestyleStep3 state to PromptOptions for PromptEngine
 * This is the bridge between UI state and prompt generation
 */

import type { Step3Values } from '@/components/LifestyleStep3';
import type { PromptOptions } from './types';

/**
 * Transform LifestyleStep3 UI state to PromptOptions
 * NO defaults invented here - only explicit mappings from UI
 */
export function mapLifestyleToPromptOptions(
    lifestyleState: Step3Values,
    existingOptions: Partial<PromptOptions> = {}
): Partial<PromptOptions> {
    const mapped: Partial<PromptOptions> = { ...existingOptions };

    // Scene settings
    if (lifestyleState.microLocation) {
        const locationMap: Record<string, string> = {
            'Kitchen set': 'kitchen counter',
            'Bathroom vanity': 'bathroom vanity',
            'Living room': 'cozy living room',
            'Neutral soft': 'none',
            'Outdoor patio': 'outdoor terrace'
        };
        mapped.microLocation = locationMap[lifestyleState.microLocation] || lifestyleState.microLocation;
        mapped.setting = locationMap[lifestyleState.microLocation] || lifestyleState.microLocation;
    }

    // Photography / Camera settings
    if (lifestyleState.lighting) {
        const lightingMap: Record<string, string> = {
            'Soft': 'soft natural',
            'Hard': 'direct sunlight',
            'Studio': 'studio lighting'
        };
        mapped.lighting = lightingMap[lifestyleState.lighting] || lifestyleState.lighting;
    }

    if (lifestyleState.shotType) {
        const shotMap: Record<string, string> = {
            'Portrait': 'portrait',
            'Flat lay': 'flat-lay',
            'Straight on': 'straight-on',
            'Dutch angle': 'dutch-angle',
            'Low angle': 'low-angle',
            'High angle': 'high-angle'
        };
        mapped.cameraAngle = shotMap[lifestyleState.shotType] as any;
    }

    // Person settings
    const personIncluded = !!(lifestyleState.personType && lifestyleState.personType !== 'No person');
    mapped.personIncluded = personIncluded;

    if (personIncluded) {
        // Initialize personDetails if not exists
        if (!mapped.personDetails) {
            mapped.personDetails = {};
        }

        // Map person type to gender
        if (lifestyleState.personType) {
            const personTypeLower = lifestyleState.personType.toLowerCase();
            if (personTypeLower === 'woman') {
                mapped.personDetails.gender = 'female';
                mapped.gender = 'female';
            } else if (personTypeLower === 'man') {
                mapped.personDetails.gender = 'male';
                mapped.gender = 'male';
            }
        }

        // Age group
        if (lifestyleState.ageGroup) {
            const ageMap: Record<string, string> = {
                'Teen': '18-25',
                'Adult': '26-35',
                'Senior': '46-60'
            };
            const mappedAge = ageMap[lifestyleState.ageGroup] || '26-35';
            mapped.personDetails.ageGroup = mappedAge;
            mapped.ageGroup = mappedAge;
        }

        // Skin tone
        if (lifestyleState.skinTone) {
            const skinMap: Record<string, string> = {
                'Light': 'light',
                'Medium': 'medium',
                'Tan': 'tan',
                'Deep': 'deep'
            };
            const mappedSkin = skinMap[lifestyleState.skinTone] || lifestyleState.skinTone;
            mapped.personDetails.skinTone = mappedSkin;
            mapped.skinTone = mappedSkin;
        }

        // Ethnicity
        if (lifestyleState.ethnicity) {
            const ethnicityLower = lifestyleState.ethnicity.toLowerCase();
            mapped.personDetails.ethnicity = ethnicityLower;
            mapped.ethnicity = ethnicityLower;
        }

        // Wardrobe
        if (lifestyleState.wardrobe) {
            const wardrobeMap: Record<string, string> = {
                'Casual': 'casual',
                'Sporty': 'sporty',
                'Elegant': 'business casual',
                'Neutral': 'plain white tee',
                'Colorful': 'colorful'
            };
            const mappedWardrobe = wardrobeMap[lifestyleState.wardrobe] || lifestyleState.wardrobe;
            mapped.personDetails.wardrobeStyle = mappedWardrobe;
            mapped.wardrobeStyle = mappedWardrobe;
        }

        // Product interaction
        if (lifestyleState.productInteraction) {
            const interactionMap: Record<string, string> = {
                'Holding product': 'holding it naturally',
                'Using product': 'using it',
                'Placing product': 'placing on surface',
                'Near product': 'showing to camera'
            };
            const mappedInteraction = interactionMap[lifestyleState.productInteraction] || lifestyleState.productInteraction;
            mapped.personDetails.productInteraction = mappedInteraction;
            mapped.productInteraction = mappedInteraction;
        }
    } else {
        // No person selected
        mapped.ageGroup = 'no person';
        mapped.personIncluded = false;
    }

    // Props
    if (lifestyleState.propBundle) {
        mapped.personProps = lifestyleState.propBundle.toLowerCase();
    }

    // Aspect ratio
    if (lifestyleState.aspectRatio) {
        mapped.aspectRatio = lifestyleState.aspectRatio;
    }

    // Story mode (formulation expert)
    if (lifestyleState.storyMode && lifestyleState.storyMode !== 'None') {
        mapped.formulationExpertEnabled = true;
        mapped.formulationExpertPreset = lifestyleState.storyMode.toLowerCase();
    }

    // Set content style to UGC if person is included
    if (personIncluded) {
        mapped.contentStyle = 'ugc';
    }

    // Set creation mode to lifestyle
    mapped.creationMode = 'lifestyle';

    // Set default camera if not set
    if (!mapped.camera) {
        mapped.camera = 'smartphone';
    }

    // Set default perspective if not set
    if (!mapped.perspective) {
        mapped.perspective = 'natural';
    }

    return mapped;
}
