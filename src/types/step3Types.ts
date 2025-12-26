import type { UGCCaptureSituationId } from '@/lib/promptEngine/ugcCaptureSituation';

export type ProductTypeOption = 'capsules' | 'gummies' | 'drops' | 'powder' | 'skincare' | 'device' | 'custom';
export type ProductScaleOption = 'small' | 'realistic' | 'hero';
export type ProductCountOption = 1 | 2 | 3 | 4;
export type ProductViewPreset =
  | 'front'
  | 'top'
  | 'perspective45'
  | 'highAngle'
  | 'lowAngle'
  | 'detail'
  | 'backSide';

export type ExpertRole =
  | 'doctor'
  | 'medical_professional'
  | 'clinical_researcher'
  | 'research_scientist'
  | 'functional_health_expert'
  | 'wellness_practitioner'
  | 'pharmacist'
  | 'nutritionist'
  | 'custom';

export type ExpertAttire =
  | 'white_medical_coat'
  | 'white_scrubs'
  | 'light_blue_scrubs'
  | 'burgundy_scrubs'
  | 'green_scrubs';

export type BadgePreference = 'name_only' | 'name_and_badge';

export interface Step3Values {
  // Creator/Person
  age: number; // Numeric age (18-90)
  noPerson: boolean;
  gender: 'Female' | 'Male' | 'Non-binary' | 'Trans woman' | 'Trans man' | 'Gender non-conforming';
  skinTone: string; // Now 7 refined options
  ethnicity: string;
  bodyType: 'Slim' | 'Average' | 'Curvy' | 'Plus size';
  hair: string; // DEPRECATED - keeping for backward compatibility

  // NEW: 3 Hair Dimensions
  hairLength: string;
  hairLengthCustom: string;
  hairTexture: string;
  hairTextureCustom: string;
  hairColor: string;
  hairState: 'natural' | 'bald';

  // Person Details - Expanded
  facialExpression: string;
  eyeDirection: string;
  eyeColor: string; // NEW
  appearanceLevel: string; // NEW
  pose: string; // NEW
  skinRealism: string; // NEW

  // Creator Presets
  creatorPreset: string | null;
  heroPersona: string; // Semantic persona description for prompt

  // Environment
  environment: string;
  customEnvironment: string;
  sceneOrderChaos: 'Clean' | 'Normal' | 'Messy' | 'Chaotic' | 'Randomized Chaos';
  ecommerceSidePlacementFlag: boolean;

  // Time & Lighting
  timeOfDay: string;
  lightingStyle: string;

  // Camera
  shotType: string;
  cameraType: string;
  cameraAngle: string;
  framing: string;

  // Product Interaction
  productInteraction: string;
  productUsageDescription: string;
  productStructure: 'single' | 'bundle' | 'routine';
  productType: ProductTypeOption | null;
  productTypeCustom: string;
  heroSku: string;
  packaging: 'withBox' | 'withoutBox';
  physicalScale: 'smallHandheld' | 'mediumTabletop' | 'largeObject';
  groupingStyle: 'aligned' | 'stacked' | 'scattered';
  primaryProductFocus: 'product1' | 'product2' | 'product3' | 'product4';
  productCount: ProductCountOption | null;
  productScale: ProductScaleOption | null;
  isBundle: boolean;
  productViewPreset: ProductViewPreset | null;
  productViewCustomText: string | null;
  productCompositionPreset:
    | 'cleanStudio'
    | 'editorialFlatLay'
    | 'ingredientStory'
    | 'abstractBenefit'
    | 'routineBundle'
    | 'comparisonLayout'
    | null;
  ecommerceAlignment: 'left' | 'center' | 'right' | null;
  reserveBlankSpace: boolean;
  ecommerceLayoutPreset:
    | 'centeredHero'
    | 'leftProductRightContent'
    | 'rightProductLeftContent'
    | 'bottomProductTopContent'
    | 'pdpSquareSafe'
    | 'adVerticalSafe'
    | null;
  ecommerceHeadline: string;
  ecommerceSubheadline: string;
  ecommerceBullets: Array<{
    text: string;
    icon: 'check' | 'science' | 'leaf' | 'quality' | 'guarantee' | null;
  }>;
  ecommerceCtaLabel: string;
  ecommerceImageType:
    | 'whatIsProduct'
    | 'howItWorks'
    | 'results'
    | 'differentiation'
    | 'socialProof'
    | 'backedUp'
    | null;
  productEnvironment:
    | 'solidColor'
    | 'softGradient'
    | 'studioSeamless'
    | 'realSurface'
    | null;
  backgroundColorHint: string | null;
  productLighting: 'softStudio' | 'naturalWindow' | 'controlledDirectional' | null;
  productOutputFormat: '1x1' | '4x5' | '16x9' | '9x16' | null;
  productInteractionEditorial:
    | 'none'
    | 'handsHolding'
    | 'handsOpening'
    | 'handsPlacing'
    | null;

  // Realism
  ugcRealMode: boolean;
  ugcCaptureSituation: UGCCaptureSituationId | null;
  ugcCaptureStyleBase: string[];
  ugcCameraOperator: string[];
  ugcBodyPhonePosition: string[];
  ugcMotionStability: string[];
  ugcFramingImperfections: string[];
  ugcAwkwardContext: string[];
  elderlyRealismGuard: boolean;
  elderlyRealismDescriptor: string;
  elderlyRealismGuardActive: boolean;
  elderlyRealismGuardLabel: string;

  // Selfie Mode (Unified System)
  selfieMode: string;

  // Wardrobe
  wardrobe: string;

  // Props - NEW
  props: string;
  customProps: string;

  // Custom Clothes
  customClothesEnabled: boolean;
  customClothesGarmentType: string;
  customClothesPrimaryColor: string;
  customClothesFit: string;
  customClothesStyle: string;
  customClothesMaterial: string;
  customClothesDetail: string;

  // Creation Intent / Modes
  creationIntent: 'ugc' | 'product' | 'brand';
  creationMode: string;
  compositionMode: string;
  sidePlacement: string;
  ecommerceBackgroundColor: string;
  ecommerceBackgroundMode: 'white' | 'gradient';
  ecommerceGradientStart: string;
  ecommerceGradientEnd: string;
  ecommerceGradientAngle: '45' | '90' | '180';
  productMode: boolean;

  // Scene Intent Rule
  sceneIntent: 'environment' | 'ecommerce';

  // Background
  preserveEnvironment: boolean;
  backgroundBlur: boolean;
  allowMessiness: boolean;
  noArtificialProps: boolean;

  // Formulation Story
  formulationStoryEnabled: boolean;
  expertRole: ExpertRole;
  expertName: string;
  expertCredentials: string;
  expertAttire: ExpertAttire;
  expertBadgePreference: BadgePreference;
  labVibe: string;

  // Advanced Pro
  sameCreatorAcrossScenes: boolean;
  sceneContinuity: boolean;
  cinematicLook: boolean;
  storytellingConsistency: boolean;

  // Output
  aspectRatio: string;
}

export type ProductValues = Pick<Step3Values,
  | 'productInteraction'
  | 'productUsageDescription'
  | 'productStructure'
  | 'productType'
  | 'productTypeCustom'
  | 'heroSku'
  | 'packaging'
  | 'physicalScale'
  | 'groupingStyle'
  | 'primaryProductFocus'
  | 'productCount'
  | 'productScale'
  | 'isBundle'
  | 'productViewPreset'
  | 'productViewCustomText'
  | 'productCompositionPreset'
  | 'ecommerceAlignment'
  | 'reserveBlankSpace'
  | 'ecommerceLayoutPreset'
  | 'ecommerceHeadline'
  | 'ecommerceSubheadline'
  | 'ecommerceBullets'
  | 'ecommerceCtaLabel'
  | 'ecommerceImageType'
  | 'productEnvironment'
  | 'backgroundColorHint'
  | 'productLighting'
  | 'productOutputFormat'
  | 'productInteractionEditorial'
  | 'compositionMode'
  | 'sidePlacement'
  | 'ecommerceBackgroundColor'
  | 'ecommerceBackgroundMode'
  | 'ecommerceGradientStart'
  | 'ecommerceGradientEnd'
  | 'ecommerceGradientAngle'
  | 'cameraType'
  | 'shotType'
  | 'cameraAngle'
>;
