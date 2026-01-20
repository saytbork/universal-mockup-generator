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
    productInteraction?: string;
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
    expertPreset?: 'respiratory_doctor' | 'clinical_researcher' | 'herbal_formulator' | 'custom';
    expertName?: string;
    roleCredentials?: string;
    labVibe?: 'modern_clinical_lab' | 'r_and_d_studio' | 'apothecary_lab' | 'none';
    /** Freeform override for lab/location set dressing (used when Lab Vibe is Custom). */
    labVibeCustom?: string;
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

export interface UGCRealModeLayerSet {
    captureBase?: string[];
    cameraOperator?: string[];
    bodyPhonePosition?: string[];
    motionStability?: string[];
    framingImperfections?: string[];
    awkwardContext?: string[];
}

export type UGCImperfectionLevel = 'low' | 'medium' | 'high';

export interface PromptOptions {
    // Core
    contentStyle: 'ugc' | 'product' | '';
    creationIntent?: 'ugc' | 'product' | 'brand';
    ugcStyle?: 'optimized' | 'natural' | 'raw';
    creationMode: 'lifestyle' | 'studio' | 'aesthetic' | 'bg-replace' | 'ecom-blank' | 'ugc_selfie';
    aspectRatio: string;
    camera: string;
    cameraType?: string;
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
    skinRealism?: string;
    creationModeStructural?: string;
    compositionModeStructural?: string;
    cameraDeviceSemantic?: string;

    // Person
    personDetails?: PersonDetails;
    genderPresentation?: 'masculine' | 'feminine' | 'neutral';
    identityLock?: IdentityLock;
    identity?: {
        faceSignature?: string;
        facialEmbedding?: string;
        personSeed?: string;
    };
    gender?: string;
    ethnicity?: string;
    skinTone?: string;
    hairColor?: string;
    hairStyle?: string;
    personPose?: string;
    personMood?: string;
    personAppearance?: string;
    productInteraction?: string;
    wardrobeStyle?: string;
    personProps?: string;
    microLocation?: string;
    personExpression?: string;
    selfieMode?: string;      // Unified Selfie Mode
    selfieType?: string;      // Legacy
    personCount?: 'single' | 'couple' | 'group';
    coupleSex?: 'same' | 'different';
    coupleStaging?: string;
    secondaryPersonDetails?: Partial<PersonDetails>;
    eyeDirection?: EyeDirectionKey;
    seed?: string;

    // Product
    productAssets?: ProductAsset[];
    heightNotes?: string;
    isMultiProductPackaging?: boolean;
    bundleLabels?: string[];
    productMaterial?: string;
    addHands?: boolean;
    studioInteraction?: string;
    clothingPreset?: string;
    clothingQuickPreset?: string;
    customClothes?: CustomClothes;
    // Special Modes
    isHeroLandingMode?: boolean;
    heroBackground?: string;
    heroAlignment?: string;
    heroScale?: number;
    heroShadow?: string;
    coreSceneNarrative?: string;

    compositionMode?: string;
    framing?: string;
    allowHeadroom?: boolean;
    allowTorso?: boolean;
    allowEnvironmentProminence?: boolean;
    allowSceneComposition?: boolean;
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

    // Ritual Mode (Lifestyle-only)
    ritualModeActive?: boolean;
    ritualHideProduct?: boolean;
    ritualNoObjects?: boolean;
    ritualCoupleStaging?: string;
    ritualPosture?: string;
    ritualActivities?: string[];
    ritualCustom?: string;

    /** When true, the scene must contain no visible product packaging anywhere in frame. */
    forceHideProduct?: boolean;

    formulationExpertEnabled?: boolean;
    formulationExpertName?: string;
    formulationExpertRole?: string;
    formulationLabStyle?: string;
    formulationExpertPreset?: string;
    formulationStory?: FormulationStoryOptions;
    formulationName?: string;
    formulationRole?: string;
    formulationCustomRole?: string;
    formulationLabVibe?: 'modern_clinical_lab' | 'r_and_d_studio' | 'apothecary_lab' | 'none';
    formulationPreset?: string;
    formulationExpertAttire?: ExpertAttire;
    formulationAttire?: string;
    formulationBadgeEnabled?: boolean;

    // Real Mode
    realModeActive?: boolean;

    // Identity
    hasModelReference?: boolean;      // Model reference uploaded
    modelReferenceLockAccessories?: boolean; // Preserve glasses/headwear/etc from model reference
    modelReference?: ModelReference;
    personIdentity?: PersonIdentity; // Renamed from duplicate identityLock
    personIncluded?: boolean;
    sameCreatorAcrossScenes?: boolean;
    identitySeed?: string;
    identityMode?: 'auto' | 'locked';       // auto = different person each render, locked = same person
    identityKey?: string;                   // Internal key for locked mode (persisted)
    identityVariationToken?: string;        // Token for auto mode (regenerated each render)

    // UGC Real Mode
    ugcRealModeActive?: boolean;      // UGC Real Mode toggle
    ugcSelfieDominant?: boolean;      // Derived: UGC selfie pipeline dominance
    heroPersona?: string;             // Semantic UGC persona description
    ugcCaptureSituation?: string | null; // Selected UGC capture situation
    ugcImperfectionLevel?: UGCImperfectionLevel;
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

    // Background Variation (internal, auto-managed)
    backgroundVariationMode?: 'auto' | 'locked';
    backgroundVariationId?: string;
    lastBackgroundId?: string;

    compositionIntro?: string;
    identityBlock?: string;
    sceneStructure?: import('../../../types').SceneStructure;
    colorSystem?: import('../../../types').ColorSystem;
    visualGrammar?: import('../../../types').VisualGrammar;
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
