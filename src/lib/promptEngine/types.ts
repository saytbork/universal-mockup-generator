/**
 * PromptEngine v2 - Type Definitions
 * Comprehensive types for modular prompt generation
 */

export interface ProductAsset {
    id: string;
    label?: string;
    heightValue?: number;
    heightUnit: 'cm' | 'in';
    base64?: string;
    mimeType?: string;
}

export interface PersonIdentity {
    ageGroup?: string;
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

export interface PromptOptions {
    // Core
    contentStyle: 'ugc' | 'product' | '';
    creationMode: 'lifestyle' | 'studio' | 'aesthetic' | 'bg-replace' | 'ecom-blank';
    aspectRatio: string;
    camera: string;

    // Scene
    setting: string;
    lighting: string;
    perspective: string;
    environmentOrder: string;
    productPlane: string;

    // Person
    ageGroup: string;
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
    selfieType?: string;

    // Product
    productAssets?: ProductAsset[];
    heightNotes?: string;
    isMultiProductPackaging?: boolean;
    bundleLabels?: string[];

    // Special Modes
    isHeroLandingMode?: boolean;
    heroBackground?: string;
    heroAlignment?: string;
    heroScale?: number;
    heroShadow?: string;

    compositionMode?: string;
    bgColor?: string;
    sidePlacement?: 'left' | 'right';

    formulationExpertEnabled?: boolean;
    formulationExpertName?: string;
    formulationExpertRole?: string;
    formulationLabStyle?: string;
    formulationExpertPreset?: string;

    // Real Mode
    realModeActive?: boolean;
    realModePreset?: string;

    // Identity
    modelReference?: ModelReference;
    identityLock?: PersonIdentity;
    personIncluded?: boolean;

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
