/**
 * PromptEngine v2 - Type Definitions
 * Comprehensive types for modular prompt generation
 */

import type {
    CameraAngleKey,
    CameraDistanceKey,
    CameraMovementKey,
    CameraShotKey,
    EyeDirectionKey
} from './parameterMap.types';

export interface ProductAsset {
    id: string;
    label?: string;
    heightValue?: number;
    heightUnit: 'cm' | 'in';
    base64?: string;
    mimeType?: string;
}

export interface PersonIdentity {
    gender?: string;
    ethnicity?: string;
    skinTone?: string;
    hairType?: string;
    hairLength?: string;
    hairColor?: string;
    bodyType?: string;
}

export interface ModelReference {
    base64: string;
    mimeType?: string;
    notes?: string;
}

export interface PersonDetails {
    age?: number;                    // Numeric age 18-90
    gender?: string;
    genderPresentation?: 'masculine' | 'feminine' | 'neutral';
    ethnicity?: string;
    skinTone?: string;
    skinRealism?: string;             // Ultra realistic | Natural | Polished | Smooth
    eyeColor?: string;
    bodyType?: string;                // Slim | Average | Athletic | Curvy | Plus-size
    hairLength?: string;              // Bald | Buzz cut | Short | Shoulder | Long
    hairTexture?: string;             // Straight | Wavy | Curly | Coily
    hairColor?: string;
    hairStyle?: string;
    facialExpression?: string;        // Soft Smile | Full Smile | Serious Focus | etc.
    eyeDirection?: EyeDirectionKey;   // Looking at camera | at product | away
    personPose?: string;
    personMood?: string;
    personAppearance?: string;
    productInteraction?: ProductInteractionVariant;
    wardrobeStyle?: string;
    personProps?: string;
    microLocation?: string;
    personExpression?: string;
    selfieMode?: string;
    selfieType?: string;
    heroPersona?: string;             // Semantic UGC persona description
}

export interface IdentityLock {
    gender?: string;
    age?: number;
    skinTone?: string;
    ethnicity?: string;
    hairLength?: string;
    hairTexture?: string;
    hairColor?: string;
    hairState?: string;
}

export type ProfessionalFocus =
    | 'pulmonologist'
    | 'nutritionist'
    | 'dermatologist'
    | 'pharmacist'
    | 'clinical_researcher'
    | 'herbalist'
    | 'functional_health_expert'
    | 'wellness_practitioner'
    | 'research_scientist'
    | 'custom';

export type ExpertAttire =
    | 'white_medical_coat'
    | 'white_scrubs'
    | 'light_blue_scrubs'
    | 'burgundy_scrubs'
    | 'green_scrubs';

export type BadgePreference = 'name_only' | 'name_and_badge';

export interface FormulationStoryOptions {
    professionalFocus?: ProfessionalFocus;
    expertName?: string;
    roleCredentials?: string;
    labVibe?: 'modern_clinical_lab' | 'r_and_d_studio' | 'apothecary_lab' | 'none';
    expertRole?: string;
    expertRoleLabel?: string;
    expertAttire?: ExpertAttire;
    expertAttireDescription?: string;
    badgePreference?: BadgePreference;
}

export type CustomClothes = {
    enabled: boolean;
    garmentType?: string;
    primaryColor?: string;
    fit?: string;
    style?: string;
    material?: string;
    customDetail?: string;
};

export type SceneOrderChaosLevel = 'clean' | 'normal' | 'messy' | 'chaotic' | 'randomized-chaos';

export type ProductInteractionVariant =
    | 'Holding'
    | 'Using'
    | 'Presenting'
    | 'Unboxing / Open Box'
    | 'none'
    | 'handsHolding'
    | 'handsOpening'
    | 'handsPlacing';

export interface UGCRealModeLayerSet {
    captureBase?: string[];
    cameraOperator?: string[];
    bodyPhonePosition?: string[];
    motionStability?: string[];
    framingImperfections?: string[];
    awkwardContext?: string[];
}

export interface PromptOptions {
    // Core
    contentStyle: 'ugc' | 'product' | '';
    productMode?: boolean;
    creationIntent?: 'ugc' | 'product' | 'brand';
    creationMode: 'lifestyle' | 'studio' | 'aesthetic' | 'bg-replace' | 'ecom-blank';
    aspectRatio: string;
    camera: string;
    cameraDistance?: CameraDistanceKey;
    cameraAngle?: CameraAngleKey;
    cameraShot?: CameraShotKey;
    cameraMovement?: CameraMovementKey;

    // Scene
    setting: string;
    lighting: string;
    perspective: string;
    environmentOrder: string;
    sceneOrderChaos?: SceneOrderChaosLevel;
    sceneOrderChaosDescriptor?: string;
    productPlane: string;
    placementStyle?: string;
    placementCamera?: string;
    sceneEnvironmentDescriptor?: string;

    // Person
    personDetails?: PersonDetails;
    genderPresentation?: 'masculine' | 'feminine' | 'neutral';
    identityLock?: IdentityLock;
    gender?: string;
    ethnicity?: string;
    skinTone?: string;
    hairColor?: string;
    hairStyle?: string;
    personPose?: string;
    personMood?: string;
    personAppearance?: string;
    productInteraction?: ProductInteractionVariant;
    wardrobeStyle?: string;
    personProps?: string;
    microLocation?: string;
    personExpression?: string;
    selfieMode?: string;      // Unified Selfie Mode
    selfieType?: string;      // Legacy
    eyeDirection?: EyeDirectionKey;

    // Product
    productAssets?: ProductAsset[];
    heightNotes?: string;
    isMultiProductPackaging?: boolean;
    bundleLabels?: string[];
    productMaterial?: string;
    addHands?: boolean;
    clothingPreset?: string;
    clothingQuickPreset?: string;
    customClothes?: CustomClothes;
    productType?: 'capsules' | 'gummies' | 'drops' | 'powder' | 'skincare' | 'device';
    productCount?: 1 | 2 | 3 | 4;
    productScale?: 'small' | 'realistic' | 'hero';
    productViewPreset?: 'front' | 'top' | 'perspective45' | 'highAngle' | 'lowAngle' | 'detail' | 'backSide';
    productViewCustomText?: string;
    productCompositionPreset?: 'cleanStudio' | 'editorialFlatLay' | 'ingredientStory' | 'abstractBenefit' | 'routineBundle';
    ecommerceAlignment?: 'left' | 'center' | 'right';
    reserveBlankSpace?: boolean;
    productEnvironment?: 'solidColor' | 'softGradient' | 'studioSeamless' | 'realSurface';
    backgroundColorHint?: string;
    productLighting?: 'softStudio' | 'naturalWindow' | 'controlledDirectional';
    productOutputFormat?: '1x1' | '4x5' | '16x9';
    isBundle?: boolean;
    // Special Modes
    isHeroLandingMode?: boolean;
    heroBackground?: string;
    heroAlignment?: string;
    heroScale?: number;
    heroShadow?: string;
    supplementPresetCue?: string;
    supplementBackgroundColor?: string;
    supplementAccentColor?: string;
    supplementFlavorNotes?: string;
    includeSupplementHand?: boolean;
    supplementCustomPrompt?: string;
    moodPromptCue?: string;

    compositionMode?: string;
    bgColor?: string;
    bgGradient?: {
        startColor: string;
        endColor: string;
        angle?: number;
    };
    sidePlacement?: 'left' | 'center' | 'right';
    ecommerceSidePlacement?: 'left' | 'center' | 'right';
    ecommerceSidePlacementDescriptor?: string;
    ecommerceSidePlacementFlag?: boolean;
    productStructure?: 'single' | 'bundle' | 'routine';
    sceneIntent?: 'environment' | 'ecommerce';
    ecommerceBlankSpaceMode?: boolean;

    formulationExpertEnabled?: boolean;
    formulationExpertName?: string;
    formulationExpertRole?: string;
    formulationLabStyle?: string;
    formulationExpertPreset?: string;
    formulationStory?: FormulationStoryOptions;

    // Real Mode
    realModeActive?: boolean;
    ugcStyle?: 'optimized' | 'natural';
    naturalUgcActive?: boolean;

    // Identity
    hasModelReference?: boolean;      // Model reference uploaded
    modelReference?: ModelReference;
    identityLock?: PersonIdentity;
    personIncluded?: boolean;
    sameCreatorAcrossScenes?: boolean;
    identitySeed?: string;

    // UGC Real Mode
    ugcRealModeActive?: boolean;      // UGC Real Mode toggle
    heroPersona?: string;             // Semantic UGC persona description
    ugcCaptureSituation?: string | null; // Selected UGC capture situation
    ugcCaptureStyleBase?: string[];
    ugcCameraOperator?: string[];
    ugcBodyPhonePosition?: string[];
    ugcMotionStability?: string[];
    ugcFramingImperfections?: string[];
    ugcAwkwardContext?: string[];
    ugcRealModeLayers?: UGCRealModeLayerSet;
    rawDomesticUgcActive?: boolean;
    elderlyRealismGuard?: boolean;
    elderlyRealismDescriptor?: string;
    elderlyRealismGuardActive?: boolean;
    elderlyRealismGuardLabel?: string;

    // Composition
    compositionIntro?: string;
    identityBlock?: string;
}

export interface PromptBuilder {
    build(options: PromptOptions): string;
    validate?(options: PromptOptions): ValidationResult;
}

export interface ValidationResult {
    valid: boolean;
    errors?: string[];
    warnings?: string[];
}

export interface PromptSegment {
    name: string;
    content: string;
    priority: number;
}
