import React, { useState, useEffect, useCallback } from 'react';
import {
  SlidersHorizontal, User, Activity, Scissors, Smile, Eye, Sparkles,
  Sun, Camera, Rotate3d, Layout, Hand, Smartphone, Shirt, Layers, Film,
  Home, MapPin, Coffee, Utensils, Car, Waves, Mountain, Building2, Edit3, Heart
} from 'lucide-react';
import {
  LIGHTING_OPTIONS,
  CAMERA_OPTIONS,
  CAMERA_ANGLE_OPTIONS as CONSTANT_CAMERA_ANGLE_OPTIONS // Use constant if needed or stick to local if it matches
} from '../../constants';
import type { UGCCaptureSituationId } from '../lib/promptEngine/ugcCaptureSituation';
import SmoothAccordion from './SmoothAccordion';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

// **CANONICAL STATE** - SINGLE SOURCE OF TRUTH for Step 3 Scene Builder
export interface SceneState {
  mode: 'basic' | 'pro';

  ugcRealMode: boolean;

  identity: {
    age: number;
    gender: string;
  };

  ugcExpressions: string[];

  creationIntent:
  | 'lifestyle-ugc'
  | 'studio-hero'
  | 'aesthetic-builder'
  | 'background-replace'
  | 'ecommerce-blank-space';

  environment:
  | 'living-room'
  | 'kitchen'
  | 'bedroom'
  | 'coffee-shop'
  | 'office'
  | 'city-street'
  | 'park'
  | 'beach'
  | 'car-interior'
  | { custom: string }
  | null;

  timeLighting: {
    timeOfDay: string;
    lightingStyle: string;
  };

  ugcCaptureSituation?: UGCCaptureSituationId | null;

  camera: {
    shotType:
    | 'close-up'
    | 'medium'
    | 'full-body'
    | 'product-focus'
    | 'environmental';

    angle:
    | 'eye-level'
    | 'slightly-above'
    | 'slightly-below'
    | 'dutch-angle';

    framing:
    | 'centered'
    | 'rule-of-thirds'
    | 'off-center'
    | 'spontaneous';
  };

  ecommerce: {
    enabled: boolean;
    composition: 'blank-space' | null;
    sidePlacement: 'left' | 'center' | 'right' | null;
    backgroundColor: string | null;
  };

  formulationStory: {
    enabled: boolean;
    expertName: string;
    professionalFocus: string;
    labVibe: string;
  };

  outputFormat: '1:1' | '4:5' | '9:16';
}
interface LifestyleStep3Props {
  isProductMode?: boolean;
  onValuesChange?: (values: Step3Values) => void;
  onCanGenerateChange?: (canGenerate: boolean) => void;
  hasModelReference?: boolean;
  productCount?: number;
  hasFirstGenerationComplete?: boolean;
}

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

  // Formulation Story
  formulationExpertEnabled: boolean;
  formulationName: string;
  formulationRole: string;
  formulationCustomRole: string;
  formulationLabVibe: 'Clean Lab' | 'Moody Lab' | 'Warm Studio' | 'None';
  formulationPreset: string;
  formulationExpertAttire: ExpertAttire;
  formulationAttire: string;
  formulationBadgeEnabled: boolean;

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

  // Scene Intent Rule
  // Environment and Ecommerce are mutually exclusive
  // Only one can be active at any time
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
  seed: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================
// CONSTANTS
// ============================================================================

const AGE_SLIDER_CATEGORIES = [
  { min: 18, max: 25, label: 'Young adult', group: '18–25' },
  { min: 26, max: 35, label: 'Late 20s / early 30s', group: '26–35' },
  { min: 36, max: 45, label: 'Mid-age adult', group: '36–45' },
  { min: 46, max: 60, label: 'Mature adult', group: '46–60' },
  { min: 61, max: 75, label: 'Senior', group: '60–75' },
  { min: 76, max: 90, label: 'Senior', group: '75+' }
];

const getAgeCategory = (age: number) => {
  return AGE_SLIDER_CATEGORIES.find(category => age <= category.max) ?? AGE_SLIDER_CATEGORIES[AGE_SLIDER_CATEGORIES.length - 1];
};

const getPillClass = (isActive: boolean, _fullWidth = false) => {
  const base = 'rounded-full border px-2 py-1 text-xs transition';
  const active = 'border-indigo-400 bg-indigo-500/10 text-white';
  const inactive = 'border-gray-600 text-gray-300 hover:border-gray-500';
  return [base, isActive ? active : inactive].filter(Boolean).join(' ');
};

// EXPANDED GENDER OPTIONS - Exact spec (6 options)
const GENDER_OPTIONS = ['Female', 'Male', 'Trans', 'Non-binary', 'Gender non-conforming'];

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

const EXPERT_ROLE_OPTIONS: { label: string; value: ExpertRole }[] = [
  { label: 'Doctor / Physician (MD)', value: 'doctor' },
  { label: 'Medical Professional', value: 'medical_professional' },
  { label: 'Clinical Researcher', value: 'clinical_researcher' },
  { label: 'Research Scientist', value: 'research_scientist' },
  { label: 'Functional Health Expert', value: 'functional_health_expert' },
  { label: 'Wellness Practitioner', value: 'wellness_practitioner' },
  { label: 'Pharmacist', value: 'pharmacist' },
  { label: 'Nutritionist', value: 'nutritionist' },
  { label: 'Custom', value: 'custom' }
];

const EXPERT_ATTIRE_OPTIONS: { label: string; value: ExpertAttire }[] = [
  { label: 'White medical coat', value: 'white_medical_coat' },
  { label: 'White scrubs', value: 'white_scrubs' },
  { label: 'Light blue scrubs', value: 'light_blue_scrubs' },
  { label: 'Burgundy scrubs', value: 'burgundy_scrubs' },
  { label: 'Green scrubs', value: 'green_scrubs' }
];

const BADGE_PREFERENCE_OPTIONS: { label: string; value: BadgePreference; description: string }[] = [
  { label: 'Name only', value: 'name_only', description: 'Single embroidered name, no badge.' },
  { label: 'Name + badge', value: 'name_and_badge', description: 'Name with a small specialty badge opposite the pocket.' }
];
const SKIN_TONE_OPTIONS = [
  'Fair Cool',
  'Fair Warm',
  'Medium Neutral',
  'Olive',
  'Tan',
  'Deep Golden',
  'Deep Cool'
];
const ETHNICITY_OPTIONS = [
  'Black / African descent',
  'Latino / Hispanic',
  'White / European descent',
  'Asian',
  'Middle Eastern',
  'South Asian',
  'Mixed',
  'Non-specific'
];
// REDUCED BODY TYPE OPTIONS - Removed: Athletic, Muscular, Petite
const BODY_TYPE_OPTIONS = ['Slim', 'Average', 'Curvy', 'Plus size'];

// 3D Hair System
const HAIR_LENGTH_OPTIONS = ['Buzzcut', 'Short', 'Chin-length', 'Shoulder', 'Long', 'Very long'];
const HAIR_TEXTURE_OPTIONS = ['Straight', 'Wavy', 'Curly', 'Coily/Kinky', 'Locs'];
const HAIR_COLOR_OPTIONS = ['Black', 'Dark brown', 'Light brown', 'Blonde', 'Red', 'Gray/White', 'Unnatural (pink, blue, etc)'];

// SIMPLIFIED EXPRESSIONS - Removed: UGC Reality, Caffeinated Crash (confusing)
const EXPRESSION_OPTIONS = [
  'Calm & Serene',
  'Joyful & High-Energy',
  'Confident & Editorial',
  'Playful & Candid',
  'Hustle & Juggle',
  'Stressed but Determined'
];

const EYE_DIRECTION_OPTIONS = ['Looking at camera', 'Looking at product', 'Looking away naturally'];

// Eye Color
const EYE_COLOR_OPTIONS = ['Brown', 'Hazel', 'Green', 'Blue', 'Gray', 'Dark Amber'];

// Appearance Level
const APPEARANCE_LEVEL_OPTIONS = [
  'Regular',
  'Well-Groomed',
  'Styled',
  'Messy / Just Woke Up',
  'Running Late'
];

// Product Interaction - SIMPLIFIED per spec
const INTERACTION_OPTIONS = ['Holding', 'Using', 'Presenting', 'Unboxing / Open Box'];

// SKIN REALISM - 3 options only
const SKIN_REALISM_OPTIONS = [
  'Raw / Real',
  'Natural',
  'Soft Retouch'
];

const CUSTOM_CLOTHES_GARMENTS = ['t-shirt', 'hoodie', 'sweater', 'dress', 'blazer', 'jacket'];
const CUSTOM_CLOTHES_COLORS = ['black', 'white', 'beige', 'navy', 'olive', 'gray'];
const CUSTOM_CLOTHES_FITS = ['regular', 'slim', 'oversized'];
const CUSTOM_CLOTHES_STYLES = ['casual', 'streetwear', 'business casual', 'sporty'];
const CUSTOM_CLOTHES_MATERIALS = ['cotton', 'denim', 'knit', 'wool'];

type UGCLayerField =
  | 'ugcCaptureStyleBase'
  | 'ugcCameraOperator'
  | 'ugcBodyPhonePosition'
  | 'ugcMotionStability'
  | 'ugcFramingImperfections'
  | 'ugcAwkwardContext';

interface UGCLayerOption {
  id: string;
  label: string;
  detail: string;
}

interface UGCLayerSection {
  field: UGCLayerField;
  title: string;
  tooltip: string;
  description: string;
  icon: React.ElementType;
  options: UGCLayerOption[];
}

const RAW_DOMESTIC_CAPTURE_SECTIONS: UGCLayerSection[] = [
  {
    field: 'ugcCaptureStyleBase',
    title: 'Camera & Capture Style',
    tooltip: 'Geometry is the only control exposed to the creator.',
    description: 'Pick how the front camera is positioned. Everything else is locked for careless, domestic capture.',
    icon: Camera,
    options: [
      {
        id: 'torso-level-handheld',
        label: 'Torso-level handheld',
        detail: 'Torso height, slight downward drift. Never centered. Device stays invisible.'
      },
      {
        id: 'high-angle',
        label: 'High-angle vantage',
        detail: 'Camera above eye level looking down across shoulders with awkward tilt.'
      },
      {
        id: 'close-face',
        label: 'Close face framing',
        detail: 'Tight, imperfect facial crop. Feels too close. Crops forehead/cheek/chin.'
      },
      {
        id: 'propped-surface',
        label: 'Propped on surface',
        detail: 'Front camera resting on a counter with subtle wobble caused by breathing.'
      }
    ]
  }
];

const USER_CONTROLLED_UGC_FIELDS: UGCLayerField[] = RAW_DOMESTIC_CAPTURE_SECTIONS.map(section => section.field);
const ALL_UGC_LAYER_FIELDS: UGCLayerField[] = [
  'ugcCaptureStyleBase',
  'ugcCameraOperator',
  'ugcBodyPhonePosition',
  'ugcMotionStability',
  'ugcFramingImperfections',
  'ugcAwkwardContext'
];
const SINGLE_SELECT_UGC_FIELDS: UGCLayerField[] = [
  'ugcCaptureStyleBase',
  'ugcCameraOperator',
  'ugcBodyPhonePosition',
  'ugcMotionStability',
  'ugcFramingImperfections',
  'ugcAwkwardContext'
];
const SINGLE_SELECT_UGC_FIELD_SET = new Set<UGCLayerField>(SINGLE_SELECT_UGC_FIELDS);

const enforceSingleSelectLayers = (draft: Step3Values) => {
  SINGLE_SELECT_UGC_FIELDS.forEach(field => {
    const current = draft[field];
    if (Array.isArray(current) && current.length > 1) {
      console.warn(`[UGC] Invalid multi-select detected for ${field}; collapsing to first entry`, current);
      draft[field] = [current[0]] as any;
    }
  });
};

// ENVIRONMENT OPTIONS - EXPANDED per spec
const ENVIRONMENT_INDOOR = [
  { value: 'Kitchen', icon: Utensils },
  { value: 'Living Room', icon: Home },
  { value: 'Bedroom', icon: Home },
  { value: 'Bathroom', icon: Home },
  { value: 'Workspace', icon: Home },
  { value: 'Hallway', icon: Building2 },
  { value: 'Home Gym', icon: Home },
  { value: 'Balcony / Indoor Terrace', icon: MapPin }
];

// OUTDOOR
const ENVIRONMENT_OUTDOOR = [
  { value: 'Urban Exterior', icon: Building2 },
  { value: 'Natural Exterior', icon: Mountain },
  { value: 'Parking Lot', icon: Building2 },
  { value: 'Backyard / Patio', icon: Waves },
  { value: 'Street Corner', icon: MapPin }
];

const SCENE_ORDER_CHAOS_OPTIONS: Step3Values['sceneOrderChaos'][] = [
  'Clean',
  'Normal',
  'Messy',
  'Chaotic',
  'Randomized Chaos'
];

// TIME & LIGHTING - per final spec
const TIME_OF_DAY_OPTIONS = ['Morning', 'Midday', 'Evening', 'Night'];
// LIGHTING_STYLE_OPTIONS removed in favor of imported LIGHTING_OPTIONS

// SHOT TYPE - Canonical professional set
const SHOT_TYPE_OPTIONS = ['Extreme close-up', 'Close', 'Medium', 'Wide', 'Full body'];

// CAMERA ANGLE - Canonical professional set
const CAMERA_ANGLE_OPTIONS = [
  'Eye level',
  'Slightly above eye level',
  'Slightly below eye level',
  'High angle',
  'Low angle',
  'Top-down',
  'Bottom-up'
];

// Product Interaction alias
const PRODUCT_INTERACTION_OPTIONS = INTERACTION_OPTIONS;

// ASPECT RATIO - Output Format
const ASPECT_RATIO_OPTIONS = ['1:1 (Square)', '4:5 (Portrait)', '9:16 (Story)'];

const GRADIENT_ANGLE_OPTIONS: Array<'45' | '90' | '180'> = ['45', '90', '180'];

// ECOMMERCE IMAGE BUILDER - definitivo
// Options: Ecommerce Blank Space (PDP, ads, hero) | Product Bundle / Routine (packs, kits)
const COMPOSITION_MODE_OPTIONS = ['Ecommerce Blank Space'];
const PRODUCT_STRUCTURE_OPTIONS = [
  { label: 'Single Product', value: 'single', description: 'One product, the hero, is presented.' },
  { label: 'Bundle (2–3 products)', value: 'bundle', description: 'Small set: one held, others placed nearby.' },
  { label: 'Routine (multi-product)', value: 'routine', description: 'Step-based set with multiple items arranged together.' }
];
const SIDE_PLACEMENT_OPTIONS = ['Left', 'Center', 'Right'];

// FORMULATION STORY
const LAB_VIBE_OPTIONS = ['Clean Lab', 'Moody Lab', 'Warm Studio'];

// ============================================================================
// HELPER COMPONENTS
// ============================================================================
// ============================================================================
// MAIN COMPONENT
// ============================================================================
const LifestyleStep3: React.FC<LifestyleStep3Props> = ({
  isProductMode = false,
  onValuesChange,
  onCanGenerateChange,
  hasModelReference = false,
  productCount = 0,
  hasFirstGenerationComplete = false,
}: LifestyleStep3Props) => {
  const [isPro, setIsPro] = useState(false);
  const [sceneMode, setSceneMode] = useState<'ugc' | 'product'>(isProductMode ? 'product' : 'ugc');
  const [openAccordionId, setOpenAccordionId] = useState<string | null>(isProductMode ? 'product-setup' : 'creator');
  const [openUgcLayerId, setOpenUgcLayerId] = useState<UGCLayerField | null>(null);
  const [touchedSections, setTouchedSections] = useState<Set<string>>(new Set());
  const initialValues: Step3Values = {
    // Creator/Person
    age: 30, // Numeric age
    noPerson: false, // UGC Rule: person MUST be present by default
    gender: 'Female',
    skinTone: 'Medium Neutral', // Refined options
    ethnicity: 'Non-specific',
    bodyType: 'Average',
    hair: 'Medium', // DEPRECATED

    // NEW: 3D Hair system
    hairLength: 'Shoulder',
    hairLengthCustom: '',
    hairTexture: 'Wavy',
    hairTextureCustom: '',
    hairColor: 'Dark brown',
    hairState: 'natural',

    // Person Details - Expanded
    facialExpression: 'Calm & Serene', // UGC Rule: friendly default
    eyeDirection: 'Looking at camera', // UGC Rule: eye contact
    eyeColor: 'Brown', // NEW
    appearanceLevel: 'Regular', // NEW
    pose: 'Relaxed Portrait', // UGC Rule: natural pose
    skinRealism: 'Raw / Real', // Simplified options

    // Creator Presets
    creatorPreset: null,
    heroPersona: '', // Empty = no persona selected

    // Environment - UGC Rule: must have table/surface for product
    environment: 'Kitchen', // Kitchen has table/counter surface by default
    customEnvironment: '',
    sceneOrderChaos: 'Normal',
    ecommerceSidePlacementFlag: false,

    // Time & Lighting - simplified
    timeOfDay: 'Afternoon',
    lightingStyle: 'Natural',

    // Camera
    shotType: 'Medium',
    cameraType: 'Intentional smartphone camera',
    cameraAngle: 'Eye level',
    framing: 'Rule of thirds',

    // Product Interaction
    productInteraction: 'Holding',
    productUsageDescription: '',
    productStructure: 'single',

    // Realism
    ugcRealMode: false,
    ugcCaptureSituation: null,
    ugcCaptureStyleBase: [],
    ugcCameraOperator: [],
    ugcBodyPhonePosition: [],
    ugcMotionStability: [],
    ugcFramingImperfections: [],
    ugcAwkwardContext: [],
    elderlyRealismGuard: false,
    elderlyRealismDescriptor: '',
    elderlyRealismGuardActive: false,
    elderlyRealismGuardLabel: '',

    // Selfie
    selfieMode: 'None',

    // Wardrobe
    wardrobe: '',

    // Props
    props: '',
    customProps: '',

    // Custom Clothes
    customClothesEnabled: false,
    customClothesGarmentType: '',
    customClothesPrimaryColor: '',
    customClothesFit: '',
    customClothesStyle: '',
    customClothesMaterial: '',
    customClothesDetail: '',

    // Creation Intent / Modes (simplified - removed legacy modes)
    creationIntent: 'ugc',
    creationMode: 'Lifestyle UGC',
    compositionMode: '', // Empty = not in ecommerce mode
    sidePlacement: SIDE_PLACEMENT_OPTIONS[1],
    ecommerceBackgroundColor: '#ffffff',
    ecommerceBackgroundMode: 'white',
    ecommerceGradientStart: '#f7f7f7',
    ecommerceGradientEnd: '#d9d9d9',
    ecommerceGradientAngle: '90',

    // Scene Intent Rule - Default: Environment/Lifestyle mode active
    sceneIntent: 'environment',

    // Background
    preserveEnvironment: false,
    backgroundBlur: false,
    allowMessiness: true,
    noArtificialProps: true,

    // Formulation Story (Legacy UI compatible)
    formulationStoryEnabled: false,
    expertRole: EXPERT_ROLE_OPTIONS[0].value,
    expertName: '',
    expertCredentials: '',
    expertAttire: EXPERT_ATTIRE_OPTIONS[0].value,
    expertBadgePreference: BADGE_PREFERENCE_OPTIONS[0].value,
    labVibe: LAB_VIBE_OPTIONS[0],

    // Formulation Story (New Prompting logic)
    formulationExpertEnabled: false,
    formulationName: '',
    formulationRole: '',
    formulationCustomRole: '',
    formulationLabVibe: 'None',
    formulationPreset: '',
    formulationExpertAttire: EXPERT_ATTIRE_OPTIONS[0].value,
    formulationAttire: '',
    formulationBadgeEnabled: false,

    // Advanced Pro
    sameCreatorAcrossScenes: false,
    sceneContinuity: false,
    cinematicLook: false,
    storytellingConsistency: false,

    // Output
    aspectRatio: '1:1 (Square)',

    // Internal
    seed: '',
  };
  enforceSingleSelectLayers(initialValues);

  const [values, setValues] = useState<Step3Values>(initialValues);

  const toggleSection = (section: string) => {
    setOpenAccordionId(openAccordionId === section ? null : section);
  };

  const markSectionTouched = (section: string) => {
    setTouchedSections(prev => {
      const newSet = new Set(prev);
      newSet.add(section);
      return newSet;
    });
  };

  const updateValue = useCallback(<K extends keyof Step3Values>(key: K, value: Step3Values[K]) => {
    // MANDATORY LOG on every update (Phase 3)
    console.log('[STEP3 UPDATE]', key, value, values);
    setValues(prev => {
      const newValues = { ...prev, [key]: value };

      if (key === 'ugcRealMode' && value === false) {
        ALL_UGC_LAYER_FIELDS.forEach(layer => {
          (newValues as any)[layer] = [];
        });
      }

      // SAFETY RULE: If hasModelReference is true, force UGC off and clear creator
      if (hasModelReference) {
        newValues.ugcRealMode = false;
        newValues.creatorPreset = null;
      }

      enforceSingleSelectLayers(newValues);

      return newValues;
    });
  }, [values, hasModelReference]);

  const toggleUGCLayerSelection = useCallback(
    (field: UGCLayerField, optionId: string) => {
      const current = (values[field] as string[]) || [];
      let next: string[];
      if (SINGLE_SELECT_UGC_FIELD_SET.has(field)) {
        next = current[0] === optionId ? [] : [optionId];
      } else {
        next = current.includes(optionId)
          ? current.filter(item => item !== optionId)
          : [...current, optionId];
      }
      updateValue(field, next as Step3Values[typeof field]);
    },
    [values, updateValue]
  );

  const toggleBooleanFlag = <K extends keyof Step3Values>(key: K) => {
    const current = values[key];
    if (typeof current === 'boolean') {
      updateValue(key, (!current) as Step3Values[K]);
    }
  };

  const handleGradientColorChange = useCallback((key: 'ecommerceGradientStart' | 'ecommerceGradientEnd', color: string) => {
    updateValue(key, color as any);
    markSectionTouched('bundles');
  }, [updateValue, markSectionTouched]);

  const invertGradient = useCallback(() => {
    const start = values.ecommerceGradientStart;
    const end = values.ecommerceGradientEnd;
    updateValue('ecommerceGradientStart', end);
    updateValue('ecommerceGradientEnd', start);
    markSectionTouched('bundles');
  }, [values.ecommerceGradientStart, values.ecommerceGradientEnd, updateValue, markSectionTouched]);

  const ageSliderProgress = Math.min(Math.max(((values.age - 18) / 72) * 100, 0), 100);
  const ageSliderLabel = getAgeCategory(values.age);
  const handleAgeSliderChange = (nextValue: number) => {
    updateValue('age', nextValue);
    markSectionTouched('creator');
  };

  const hasAnyUgcLayerSelection = USER_CONTROLLED_UGC_FIELDS.some(field => {
    const selections = values[field] as string[] | undefined;
    return Array.isArray(selections) && selections.length > 0;
  });

  // PHASE 3: Emit sceneState on EVERY change
  useEffect(() => {
    console.log('[STEP3 EMIT]', values);
    if (onValuesChange) {
      onValuesChange(values);
    }
  }, [values, onValuesChange]);

  useEffect(() => {
    if (onCanGenerateChange) {
      onCanGenerateChange(true);
    }
  }, [onCanGenerateChange]);

  const isPersonDisabled = values.noPerson;

  // Initial Safety Check for hasModelReference
  useEffect(() => {
    if (hasModelReference && (values.ugcRealMode || values.creatorPreset || values.sameCreatorAcrossScenes)) {
      setValues(prev => {
        const newValues = { ...prev, ugcRealMode: false, creatorPreset: null, sameCreatorAcrossScenes: false };
        ALL_UGC_LAYER_FIELDS.forEach(layer => {
          (newValues as any)[layer] = [];
        });
        enforceSingleSelectLayers(newValues);
        return newValues;
      });
    }
  }, [hasModelReference, values.ugcRealMode, values.creatorPreset, values.sameCreatorAcrossScenes]);

  useEffect(() => {
    if (!values.ugcRealMode) {
      setOpenUgcLayerId(null);
    }
  }, [values.ugcRealMode]);

  useEffect(() => {
    if (values.ugcRealMode && (!values.ugcCaptureStyleBase || values.ugcCaptureStyleBase.length === 0)) {
      updateValue('ugcCaptureStyleBase', ['torso-level-handheld'] as Step3Values['ugcCaptureStyleBase']);
    }
  }, [values.ugcRealMode, values.ugcCaptureStyleBase, updateValue]);

  // ============================================================================
  // SCENE INTENT - SINGLE SOURCE OF TRUTH
  // Environment and Ecommerce are mutually exclusive
  // Only one can be active at any time
  // ============================================================================

  // Derived from sceneIntent - no longer computed independently
  const isEcommerceMode = values.sceneIntent === 'ecommerce';
  const isEnvironmentMode = values.sceneIntent === 'environment';
  const isUGCMode = values.ugcRealMode;



  // Scene Intent Handler: Enable Environment Mode
  const enableEnvironment = useCallback(() => {
    console.log('[SCENE INTENT CHANGE] environment');
    setValues(prev => ({ ...prev, sceneIntent: 'environment' }));
  }, []);

  useEffect(() => {
    if (values.ugcRealMode && values.sceneIntent !== 'environment') {
      enableEnvironment();
    }
  }, [values.ugcRealMode, values.sceneIntent, enableEnvironment]);

  // Scene Intent Handler: Enable Ecommerce Mode
  const enableEcommerce = useCallback(() => {
    console.log('[SCENE INTENT CHANGE] ecommerce');
    setValues(prev => ({ ...prev, sceneIntent: 'ecommerce' }));
  }, []);

  useEffect(() => {
    if (values.sceneIntent === 'ecommerce') {
      setOpenUgcLayerId(null);
    }
    setValues(prev => {
      if (prev.sceneIntent === 'environment') {
        const next: Step3Values = {
          ...prev,
          compositionMode: '',
          ecommerceBackgroundColor: '#ffffff',
          ecommerceBackgroundMode: 'white' as const,
          ecommerceGradientStart: '#f7f7f7',
          ecommerceGradientEnd: '#d9d9d9',
          ecommerceGradientAngle: '90' as const,
          sidePlacement: SIDE_PLACEMENT_OPTIONS[1]
        };
        enforceSingleSelectLayers(next);
        return next;
      }

      const next: Step3Values = {
        ...prev,
        sceneIntent: 'ecommerce',
        ugcRealMode: false,
        noPerson: true,
        environment: '',
        customEnvironment: '',
        heroPersona: '',
        cameraType: '',
        shotType: '',
        framing: '',
        compositionMode: 'Ecommerce Blank Space',
        ugcCaptureStyleBase: [],
        ugcCameraOperator: [],
        ugcBodyPhonePosition: [],
        ugcMotionStability: [],
        ugcFramingImperfections: [],
        ugcAwkwardContext: [],
        ecommerceBackgroundColor: '#ffffff',
        ecommerceBackgroundMode: 'white' as const,
        ecommerceGradientStart: '#f7f7f7',
        ecommerceGradientEnd: '#d9d9d9',
        ecommerceGradientAngle: '90' as const
      };
      enforceSingleSelectLayers(next);
      return next;
    });
  }, [values.sceneIntent]);

  // HARD RULE: Custom Environment → switches to Environment intent
  useEffect(() => {
    if (values.customEnvironment && values.sceneIntent === 'ecommerce') {
      console.log('[HARD RULE] Custom Environment set - switching to Environment intent');
      enableEnvironment();
    }
  }, [values.customEnvironment, values.sceneIntent, enableEnvironment]);

  useEffect(() => {
    if (
      values.compositionMode === 'Ecommerce Blank Space' &&
      values.ecommerceBackgroundMode === 'white' &&
      values.ecommerceBackgroundColor !== '#ffffff'
    ) {
      updateValue('ecommerceBackgroundColor', '#ffffff');
    }
  }, [values.compositionMode, values.ecommerceBackgroundMode, values.ecommerceBackgroundColor, updateValue]);

  useEffect(() => {
    if (values.compositionMode === 'Ecommerce Blank Space' && values.sceneIntent !== 'ecommerce') {
      console.log('[SCENE INTENT CHANGE] ecommerce');
      setValues(prev => ({ ...prev, sceneIntent: 'ecommerce' }));
    }
  }, [values.compositionMode, values.sceneIntent]);

  // ========================================================================
  // PRODUCT MODE VALIDATION (Stage 11)
  // ========================================================================

  // Sync sceneMode with sceneIntent
  useEffect(() => {
    setSceneMode(values.sceneIntent === 'ecommerce' ? 'product' : 'ugc');
  }, [values.sceneIntent]);

  // Block and clear UGC state when Product Mode is active
  useEffect(() => {
    if (values.sceneIntent !== 'ecommerce') return;

    console.log('[PRODUCT MODE VALIDATION] Clearing UGC state');

    // Auto-clear UGC Real Mode
    if (values.ugcRealMode) {
      console.log('[PRODUCT MODE] Disabling UGC Real Mode');
      updateValue('ugcRealMode', false);
    }

    // Set creation intent to product
    if (values.creationIntent !== 'product') {
      console.log('[PRODUCT MODE] Setting creationIntent = product');
      updateValue('creationIntent', 'product');
    }
  }, [
    values.sceneIntent,
    values.ugcRealMode,
    values.noPerson,
    values.creationIntent,
    updateValue
  ]);

  useEffect(() => {
    if (!values.formulationStoryEnabled) {
      return;
    }

    if (values.ugcRealMode) {
      updateValue('ugcRealMode', false);
    }

    if (values.heroPersona) {
      updateValue('heroPersona', '');
    }

    ALL_UGC_LAYER_FIELDS.forEach(layer => {
      updateValue(layer, []);
    });
  }, [values.formulationStoryEnabled, values.ugcRealMode, values.heroPersona, updateValue]);

  useEffect(() => {
    const shouldDisablePerson = values.sceneIntent === 'ecommerce' || values.formulationStoryEnabled;
    if (values.noPerson !== shouldDisablePerson) {
      updateValue('noPerson', shouldDisablePerson);
    }
  }, [values.sceneIntent, values.formulationStoryEnabled, values.noPerson, updateValue]);

  useEffect(() => {
    if (values.ugcRealMode && values.formulationStoryEnabled) {
      updateValue('formulationStoryEnabled', false);
    }
  }, [values.ugcRealMode, values.formulationStoryEnabled, updateValue]);
  return (
    <div className="w-full max-w-2xl mx-auto space-y-4 p-4">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <p className="text-xs uppercase tracking-widest text-indigo-300">Step 3</p>
        <h2 className="text-2xl font-bold text-gray-200">Scene Builder</h2>
        <p className="text-sm text-gray-400">Define how the scene looks, feels, and behaves visually.</p>
      </div>

      {isEnvironmentMode && (
        <>

      {/* Creator / Person */}
      <SmoothAccordion
        icon={User}
        title="Creator / Person"
        tooltip="Define the person in your scene"
        isOpen={openAccordionId === 'creator'}
        onToggle={() => toggleSection('creator')}
        isRequired={isEnvironmentMode}
        isTouched={touchedSections.has('creator')}
      >
        <div className="flex flex-col gap-4">
          {isPersonDisabled ? (
            <div className="p-4 rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-100 text-sm">
              Formulation Story is enabled, so Creator / Person controls are temporarily disabled to prevent conflicting modes.
            </div>
          ) : (
            <>
              <div className="space-y-3 p-3 rounded-lg border border-gray-700 bg-gray-800/20">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-wider text-indigo-200">AGE</p>
                  <p className="text-sm text-white">{values.age}</p>
                </div>
                <input
                  type="range"
                  min={18}
                  max={90}
                  step={1}
                  value={values.age}
                  onChange={(event) => handleAgeSliderChange(Number(event.target.value))}
                  className="scene-age-slider w-full"
                  style={{
                    background: `linear-gradient(90deg, rgba(129,140,248,0.95) ${ageSliderProgress}%, rgba(31,41,55,0.5) ${ageSliderProgress}%)`
                  }}
                />
              </div>

              <div className="space-y-4">
                <div className="space-y-3 p-3 rounded-lg border border-gray-700 bg-gray-800/20">
                  <p className="text-xs uppercase tracking-wider text-indigo-200">GENDER</p>
                  <div className="flex flex-wrap gap-2">
                    {GENDER_OPTIONS.map(option => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => { updateValue('gender', option as any); markSectionTouched('creator'); }}
                        className={getPillClass(values.gender === option, true)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 p-3 rounded-lg border border-gray-700 bg-gray-800/20">
                  <p className="text-xs uppercase tracking-wider text-indigo-200">ETHNICITY</p>
                  <div className="flex flex-wrap items-center gap-2">
                    {ETHNICITY_OPTIONS.map(option => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => { updateValue('ethnicity', option); markSectionTouched('creator'); }}
                        className={getPillClass(values.ethnicity === option)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 p-3 rounded-lg border border-gray-700 bg-gray-800/20">
                  <p className="text-xs uppercase tracking-wider text-indigo-200">SKIN TONE</p>
                  <div className="flex flex-wrap items-center gap-2">
                    {SKIN_TONE_OPTIONS.map(option => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => { updateValue('skinTone', option); markSectionTouched('creator'); }}
                        className={getPillClass(values.skinTone === option)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 p-3 rounded-lg border border-gray-700 bg-gray-800/20">
                  <p className="text-xs uppercase tracking-wider text-indigo-200">EYE COLOR</p>
                  <div className="flex flex-wrap items-center gap-2">
                    {EYE_COLOR_OPTIONS.map(option => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => { updateValue('eyeColor', option); markSectionTouched('creator'); }}
                        className={getPillClass(values.eyeColor === option)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 p-3 rounded-lg border border-gray-700 bg-gray-800/20">
                  <p className="text-xs uppercase tracking-wider text-indigo-200">BODY TYPE</p>
                  <div className="flex flex-wrap gap-2">
                    {BODY_TYPE_OPTIONS.map(option => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => { updateValue('bodyType', option as any); markSectionTouched('creator'); }}
                        className={getPillClass(values.bodyType === option)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 p-3 rounded-lg border border-gray-700 bg-gray-800/20">
                  <div className="flex items-center justify-between">
                    <p className="text-xs uppercase tracking-wider text-indigo-200">HAIR</p>
                    <button
                      type="button"
                      onClick={() => {
                        updateValue('hairState', values.hairState === 'bald' ? 'natural' : 'bald');
                        markSectionTouched('creator');
                      }}
                      className={`rounded-full border px-2 py-1 text-xs transition ${values.hairState === 'bald'
                        ? 'border-indigo-400 bg-indigo-500/10 text-white'
                        : 'border-gray-600 text-gray-300 hover:border-gray-500'
                        }`}
                    >
                      {values.hairState === 'bald' ? 'Bald' : 'Has hair'}
                    </button>
                  </div>

                  {values.hairState === 'natural' && (
                    <>
                      <div className="space-y-1.5">
                        <p className="text-xs text-gray-400">Length</p>
                        <div className="flex flex-wrap items-center gap-2">
                          {HAIR_LENGTH_OPTIONS.map(option => (
                            <button
                              key={option}
                              type="button"
                              onClick={() => { updateValue('hairLength', option); markSectionTouched('creator'); }}
                              className={`rounded-full border px-2 py-1 text-xs transition ${values.hairLength === option
                                ? 'border-indigo-400 bg-indigo-500/10 text-white'
                                : 'border-gray-600 text-gray-300 hover:border-gray-500'
                                }`}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <p className="text-xs text-gray-400">Texture</p>
                        <div className="flex flex-wrap items-center gap-2">
                          {HAIR_TEXTURE_OPTIONS.map(option => (
                            <button
                              key={option}
                              type="button"
                              onClick={() => { updateValue('hairTexture', option); markSectionTouched('creator'); }}
                              className={`rounded-full border px-2 py-1 text-xs transition ${values.hairTexture === option
                                ? 'border-indigo-400 bg-indigo-500/10 text-white'
                                : 'border-gray-600 text-gray-300 hover:border-gray-500'
                                }`}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <p className="text-xs text-gray-400">Color</p>
                        <div className="flex flex-wrap items-center gap-2">
                          {HAIR_COLOR_OPTIONS.map(option => (
                            <button
                              key={option}
                              type="button"
                              onClick={() => { updateValue('hairColor', option); markSectionTouched('creator'); }}
                              className={`rounded-full border px-2 py-1 text-xs transition ${values.hairColor === option
                                ? 'border-indigo-400 bg-indigo-500/10 text-white'
                                : 'border-gray-600 text-gray-300 hover:border-gray-500'
                                }`}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="space-y-3 p-3 rounded-lg border border-gray-700 bg-gray-800/20">
                  <p className="text-xs uppercase tracking-wider text-indigo-200">FACIAL EXPRESSION</p>
                  <div className="flex flex-wrap items-center gap-2">
                    {EXPRESSION_OPTIONS.map(option => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => { updateValue('facialExpression', option); markSectionTouched('creator'); }}
                        className={getPillClass(values.facialExpression === option)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 p-3 rounded-lg border border-gray-700 bg-gray-800/20">
                  <p className="text-xs uppercase tracking-wider text-indigo-200">EYE DIRECTION</p>
                  <div className="flex flex-wrap gap-2">
                    {EYE_DIRECTION_OPTIONS.map(option => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => { updateValue('eyeDirection', option); markSectionTouched('creator'); }}
                        className={getPillClass(values.eyeDirection === option)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Keep Same Person Toggle - Identity Control */}
                <div className="space-y-3 p-3 rounded-lg border border-gray-700 bg-gray-800/20">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                      <p className="text-xs uppercase tracking-wider text-indigo-200">KEEP SAME PERSON</p>
                      {!hasFirstGenerationComplete && (
                        <span className="text-xs text-gray-500">Available after first generation</span>
                      )}
                      {hasFirstGenerationComplete && (
                        <span className="text-xs text-gray-500">
                          {values.sameCreatorAcrossScenes
                            ? 'Same person across generations'
                            : 'Different person each generation'}
                        </span>
                      )}
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={values.sameCreatorAcrossScenes}
                        onChange={(e) => {
                          updateValue('sameCreatorAcrossScenes', e.target.checked);
                          markSectionTouched('creator');
                        }}
                        disabled={!hasFirstGenerationComplete || hasModelReference}
                        className="sr-only peer"
                      />
                      <div className={`w-11 h-6 rounded-full transition-colors relative ${!hasFirstGenerationComplete || hasModelReference
                        ? 'bg-gray-800 cursor-not-allowed opacity-50'
                        : values.sameCreatorAcrossScenes
                          ? 'bg-indigo-600'
                          : 'bg-gray-600'
                        }`}>
                        <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full transition-transform ${!hasFirstGenerationComplete || hasModelReference
                          ? 'bg-gray-600'
                          : 'bg-white'
                          } ${values.sameCreatorAcrossScenes ? 'translate-x-5' : ''}`} />
                      </div>
                    </label>
                  </div>
                  {hasModelReference && hasFirstGenerationComplete && (
                    <p className="text-xs text-amber-400">
                      Model reference overrides identity control
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

      </SmoothAccordion>

      {/* RAW DOMESTIC UGC */}
      <SmoothAccordion
        icon={Smartphone}
        title="Raw Domestic UGC"
        tooltip="Careless front-camera capture with zero polish"
        isOpen={openAccordionId === 'realism'}
        onToggle={() => toggleSection('realism')}
        isTouched={hasAnyUgcLayerSelection}
        isActive={values.ugcRealMode}
      >
        <div id="ugc-real-mode">
          <div className="pt-2 pb-4 px-2">
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="text-xs uppercase tracking-wider text-indigo-200">Raw domestic capture</p>
                  <p className="text-sm text-gray-400">
                    Locks every pro control and simulates a bored creator using the front camera at home. You only pick the capture geometry.
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={values.ugcRealMode}
                  onClick={() => {
                    const newValue = !values.ugcRealMode;
                    updateValue('ugcRealMode', newValue);
                    if (newValue) {
                      updateValue('formulationStoryEnabled', false);
                      updateValue('facialExpression', 'Soft Smile');
                      updateValue('eyeDirection', 'Looking at camera');
                    }
                  }}
                  className={`relative shrink-0 h-6 w-11 rounded-full transition ${values.ugcRealMode ? 'bg-indigo-500' : 'bg-gray-600'}`}
                >
                  <span className={`absolute left-1 top-1 block h-4 w-4 rounded-full bg-white shadow transition ${values.ugcRealMode ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>

              {values.ugcRealMode && (
                <>
                  <div className="rounded-lg border border-amber-400/40 bg-amber-400/10 px-3 py-2 text-[12px] text-amber-100">
                    Front-camera physics only. Background, lighting, motion, and framing are engine-controlled. Environment, lighting, and camera panels are locked while this mode is on.
                  </div>
                  <div className="space-y-4">
                    {RAW_DOMESTIC_CAPTURE_SECTIONS.map(section => {
                      const currentSelections = (values[section.field] as string[]) || [];
                      return (
                        <SmoothAccordion
                          key={section.field}
                          icon={section.icon}
                          title={section.title}
                          tooltip={section.tooltip}
                          isOpen={openUgcLayerId === section.field}
                          onToggle={() =>
                            setOpenUgcLayerId(prev => (prev === section.field ? null : section.field))
                          }
                          isTouched={currentSelections.length > 0}
                          isActive={values.ugcRealMode}
                        >
                          <p className="text-xs text-gray-400">{section.description}</p>
                          <div className="mt-3 flex flex-wrap gap-3">
                            {section.options.map(option => (
                              <div key={option.id} className="flex flex-col gap-1 max-w-[220px]">
                                <button
                                  type="button"
                                  onClick={() => toggleUGCLayerSelection(section.field, option.id)}
                                  className={getPillClass(currentSelections.includes(option.id))}
                                >
                                  {option.label}
                                </button>
                                <p className="text-[10px] text-gray-500">{option.detail}</p>
                              </div>
                            ))}
                          </div>
                        </SmoothAccordion>
                      );
                    })}
                    <div className="space-y-4 rounded-2xl border border-gray-600 bg-gray-900/40 p-4">
                      <p className="text-xs uppercase tracking-[0.3em] text-indigo-200">Visual Fidelity</p>
                      <div className="space-y-3">
                        <div className="space-y-3 p-3 rounded-lg border border-gray-700 bg-gray-800/20">
                          <p className="text-xs uppercase tracking-[0.3em] text-indigo-200">Skin Realism</p>
                          <div className="flex flex-wrap items-center gap-2">
                            {SKIN_REALISM_OPTIONS.map(option => (
                              <button
                                key={option}
                                type="button"
                                onClick={() => {
                                  updateValue('skinRealism', option);
                                  markSectionTouched('realism');
                                }}
                                className={getPillClass(values.skinRealism === option)}
                              >
                                {option}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-3 p-3 rounded-lg border border-gray-700 bg-gray-800/20">
                          <p className="text-xs uppercase tracking-[0.3em] text-indigo-200">Appearance Level</p>
                          <div className="flex flex-wrap items-center gap-2">
                            {APPEARANCE_LEVEL_OPTIONS.map(option => (
                              <button
                                key={option}
                                type="button"
                                onClick={() => {
                                  updateValue('appearanceLevel', option);
                                  markSectionTouched('realism');
                                }}
                                className={getPillClass(values.appearanceLevel === option)}
                              >
                                {option}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* SCENE ORDER & CHAOS - Only in UGC */}
                    <div className="space-y-3 p-3 rounded-lg border border-gray-700 bg-gray-800/20">
                      <div>
                        <p className="text-xs uppercase tracking-wider text-indigo-200">SCENE ORDER & CHAOS</p>
                        <p className="text-[11px] text-gray-400">Control how tidy or chaotic the surroundings feel.</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {SCENE_ORDER_CHAOS_OPTIONS.map(option => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => {
                              updateValue('sceneOrderChaos', option);
                              markSectionTouched('realism');
                            }}
                            className={getPillClass(values.sceneOrderChaos === option)}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}

            </div>
          </div>
        </div>

      </SmoothAccordion>

      {/* Product Interaction */}
      <SmoothAccordion
        icon={Hand}
        title="Product Interaction"
        tooltip="Control how the creator handles the product"
        isOpen={openAccordionId === 'productInteraction'}
        onToggle={() => toggleSection('productInteraction')}
        isTouched={touchedSections.has('productInteraction')}
      >
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            {PRODUCT_INTERACTION_OPTIONS.map(option => (
              <button
                key={option}
                type="button"
                onClick={() => { updateValue('productInteraction', option); markSectionTouched('productInteraction'); }}
                className={getPillClass(values.productInteraction === option)}
              >
                {option}
              </button>
            ))}
          </div>
          {values.productInteraction === 'Using' && (
            <div className="mt-2">
              <textarea
                value={values.productUsageDescription}
                onChange={(event) => {
                  updateValue('productUsageDescription', event.target.value);
                  markSectionTouched('productInteraction');
                }}
                placeholder="Describe what the person is naturally doing with the product"
                className="w-full rounded-lg border border-gray-600 bg-gray-900/60 px-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
                rows={3}
              />
            </div>
          )}
        </div>
      </SmoothAccordion>

      <SmoothAccordion
        icon={Shirt}
        title="Custom Clothes"
        tooltip="Optionally describe an outfit without uploading images."
        isOpen={openAccordionId === 'custom-clothes'}
        onToggle={() => toggleSection('custom-clothes')}
        isTouched={touchedSections.has('customClothes')}
        isActive={values.customClothesEnabled}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-gray-700 bg-gray-900/40 px-3 py-2">
            <div>
              <p className="text-sm text-white">Enable outfit customization</p>
              <p className="text-[11px] text-gray-400">Describe garments with text-only controls.</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={values.customClothesEnabled}
              onClick={() => {
                updateValue('customClothesEnabled', !values.customClothesEnabled);
                markSectionTouched('customClothes');
              }}
              className={`relative h-6 w-11 rounded-full transition ${values.customClothesEnabled ? 'bg-indigo-500' : 'bg-gray-600'}`}
            >
              <span className={`absolute left-1 top-1 block h-4 w-4 rounded-full bg-white shadow transition ${values.customClothesEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>

          {values.customClothesEnabled && (
            <div className="space-y-3">
              <div>
                <label className="text-[11px] uppercase tracking-wider text-gray-400">Garment type</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {CUSTOM_CLOTHES_GARMENTS.map(option => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        updateValue('customClothesGarmentType', option);
                        markSectionTouched('customClothes');
                      }}
                      className={getPillClass(values.customClothesGarmentType === option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-gray-400">Primary color</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {CUSTOM_CLOTHES_COLORS.map(option => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        updateValue('customClothesPrimaryColor', option);
                        markSectionTouched('customClothes');
                      }}
                      className={getPillClass(values.customClothesPrimaryColor === option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-gray-400">Fit</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {CUSTOM_CLOTHES_FITS.map(option => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        updateValue('customClothesFit', option);
                        markSectionTouched('customClothes');
                      }}
                      className={getPillClass(values.customClothesFit === option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-gray-400">Style</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {CUSTOM_CLOTHES_STYLES.map(option => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        updateValue('customClothesStyle', option);
                        markSectionTouched('customClothes');
                      }}
                      className={getPillClass(values.customClothesStyle === option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-gray-400">Material</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {CUSTOM_CLOTHES_MATERIALS.map(option => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        updateValue('customClothesMaterial', option);
                        markSectionTouched('customClothes');
                      }}
                      className={getPillClass(values.customClothesMaterial === option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-gray-400">Custom detail (optional)</label>
                <input
                  type="text"
                  maxLength={100}
                  value={values.customClothesDetail}
                  onChange={(event) => {
                    updateValue('customClothesDetail', event.target.value.replace(/[\r\n]/g, ''));
                    markSectionTouched('customClothes');
                  }}
                  placeholder="small embroidered logo on the chest"
                  className="w-full rounded-lg border border-gray-600 bg-gray-800/50 px-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}
        </div>
      </SmoothAccordion>

      <SmoothAccordion
        icon={Layers}
        title="Product Structure"
        tooltip="Define how products are grouped and placed"
        isOpen={openAccordionId === 'productStructure'}
        onToggle={() => toggleSection('productStructure')}
        isTouched={touchedSections.has('productStructure')}
      >
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-wider text-indigo-200">Group & count</p>
          <div className="flex flex-wrap gap-2">
            {PRODUCT_STRUCTURE_OPTIONS.map(option => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  updateValue('productStructure', option.value as Step3Values['productStructure']);
                  markSectionTouched('productStructure');
                }}
                className={getPillClass(values.productStructure === option.value)}
              >
                <span className="flex flex-col text-left">
                  <span>{option.label}</span>
                  <span className="text-[10px] text-gray-400">{option.description}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </SmoothAccordion>

      {/* Environment */}
      <SmoothAccordion
        icon={Home}
        title="Environment"
        tooltip="Where the scene takes place"
        isOpen={openAccordionId === 'environment'}
        onToggle={() => toggleSection('environment')}
        isRequired={true}
        isTouched={touchedSections.has('environment')}
      >
        <div className="space-y-3">
          {values.ugcRealMode && (
            <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-xs text-amber-100">
              Raw Domestic UGC still honors your environment choice—it just interprets it as incidental and unstaged. Pick any room; the engine keeps it messy, domestic, and low intent.
            </div>
          )}
          {!values.ugcRealMode && (
            <div className="rounded-lg border border-gray-700 bg-gray-900/40 px-3 py-2 text-[11px] text-gray-300">
              Environment describes location context only. Lighting, cleanliness, and overall polish remain engine-controlled—changing this won’t upgrade quality or staging.
            </div>
          )}

          <p className="text-xs uppercase tracking-wider text-indigo-200">INDOOR</p>
          <div className="flex flex-wrap gap-2">
            {ENVIRONMENT_INDOOR.map(env => (
              <button
                key={env.value}
                type="button"
                onClick={() => { updateValue('environment', env.value); markSectionTouched('environment'); }}
                className={`flex items-center gap-2 rounded-full border px-2 py-1 text-xs transition ${values.environment === env.value
                  ? 'border-indigo-400 bg-indigo-500/10 text-white'
                  : 'border-gray-600 text-gray-300 hover:border-gray-500'
                  }`}
              >
                <env.icon className="w-4 h-4" />
                <span>{env.value}</span>
              </button>
            ))}
          </div>

          <p className="text-xs uppercase tracking-wider text-indigo-200 pt-2">OUTDOOR</p>
          <div className="flex flex-wrap gap-2">
            {ENVIRONMENT_OUTDOOR.map(env => (
              <button
                key={env.value}
                type="button"
                onClick={() => { updateValue('environment', env.value); markSectionTouched('environment'); }}
                className={`flex items-center gap-2 rounded-full border px-2 py-1 text-xs transition ${values.environment === env.value
                  ? 'border-indigo-400 bg-indigo-500/10 text-white'
                  : 'border-gray-600 text-gray-300 hover-border-gray-500'
                  }`}
              >
                <env.icon className="w-4 h-4" />
                <span>{env.value}</span>
              </button>
            ))}
          </div>

          {/* CUSTOM ENVIRONMENT */}
          <div className="pt-3">
            <p className="text-xs uppercase tracking-wider text-indigo-200 mb-2">CUSTOM ENVIRONMENT</p>
            <input
              type="text"
              value={values.customEnvironment}
              onChange={(e) => {
                updateValue('customEnvironment', e.target.value);
                if (e.target.value) {
                  updateValue('environment', 'Custom');
                }
                markSectionTouched('environment');
              }}
              placeholder="e.g., cozy cabin, rooftop terrace, yoga studio..."
              className="w-full rounded-lg border border-gray-600 bg-gray-800/50 px-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

        </div>
      </SmoothAccordion>
      {/* Time & Lighting */}
      <SmoothAccordion
        icon={Sun}
        title="Time & Lighting"
        tooltip="Control the lighting and time of day"
        isOpen={openAccordionId === 'lighting'}
        onToggle={() => toggleSection('lighting')}
        isTouched={touchedSections.has('lighting')}
      >
        {values.ugcRealMode ? (
          <div className="rounded-lg border border-gray-700 bg-gray-900/60 px-4 py-3 text-sm text-gray-300">
            Lighting is locked to indifferent domestic fixtures with mixed temperatures, clipped highlights, and crushed shadows. Turn Raw Domestic UGC off to control time or lighting.
          </div>
        ) : (
          <div className="space-y-3">
            {/* TIME OF DAY */}
            <div className="space-y-3 p-3 rounded-lg border border-gray-700 bg-gray-800/20">
              <div>
                <p className="text-xs uppercase tracking-wider text-indigo-200">TIME OF DAY</p>
                <p className="text-[11px] text-gray-400 mt-1">Set the temporal context</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {TIME_OF_DAY_OPTIONS.map(option => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => { updateValue('timeOfDay', option); markSectionTouched('lighting'); }}
                    className={getPillClass(values.timeOfDay === option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {/* LIGHTING STYLE */}
            <div className="space-y-3 p-3 rounded-lg border border-gray-700 bg-gray-800/20">
              <div>
                <p className="text-xs uppercase tracking-wider text-indigo-200">LIGHTING STYLE</p>
                <p className="text-[11px] text-gray-400 mt-1">Select the lighting quality</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {LIGHTING_OPTIONS.map(option => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => { updateValue('lightingStyle', option.label); markSectionTouched('lighting'); }}
                    className={getPillClass(values.lightingStyle === option.label)}
                    title={option.value}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </SmoothAccordion>


      <div className="rounded-2xl border border-white/10 bg-black/20 p-4 space-y-3">
        <p className="text-xs uppercase tracking-[0.3em] text-indigo-200">Hero personas</p>
        <div className="flex flex-col gap-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
          {[
            { label: 'The Busy Mom', semantic: 'busy mom managing household, natural home environment, multitasking moment, authentic daily routine' },
            { label: 'The Fitness Enthusiast', semantic: 'fitness-focused adult after workout, casual activewear, natural indoor or outdoor setting' },
            { label: 'The Skincare Obsessed', semantic: 'skincare-focused woman during daily routine, bathroom mirror, natural lighting' },
            { label: 'The Minimalist', semantic: 'minimalist person in clean home environment, neutral tones, simple lifestyle' },
            { label: 'The Trendsetter', semantic: 'trend-focused young adult in casual lifestyle moment, modern outfit, spontaneous feel' }
          ].map(persona => (
            <button
              key={persona.label}
              type="button"
              onClick={() => {
                updateValue('heroPersona', persona.semantic);
                if (persona.label === 'The Busy Mom') {
                  updateValue('facialExpression', 'Hustle & Juggle');
                  updateValue('appearanceLevel', 'Running Late');
                } else if (persona.label === 'The Fitness Enthusiast') {
                  updateValue('facialExpression', 'Joyful & High-Energy');
                  updateValue('appearanceLevel', 'Well-Groomed');
                } else if (persona.label === 'The Skincare Obsessed') {
                  updateValue('facialExpression', 'Calm & Serene');
                  updateValue('skinRealism', 'Raw / Real');
                } else if (persona.label === 'The Minimalist') {
                  updateValue('facialExpression', 'Confident & Editorial');
                  updateValue('appearanceLevel', 'Styled');
                } else if (persona.label === 'The Trendsetter') {
                  updateValue('facialExpression', 'Playful & Candid');
                  updateValue('appearanceLevel', 'Styled');
                }
              }}
              className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition ${values.heroPersona === persona.label
                ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                : 'border-gray-600 text-gray-200 hover:border-indigo-400 hover:bg-indigo-500/10'
                }`}
            >
              {persona.label}
            </button>
          ))}
        </div>
      </div>

      {
        !isUGCMode && (
          <SmoothAccordion
            icon={Camera}
            title="Camera & Framing"
            tooltip="How the scene is captured"
            isOpen={openAccordionId === 'camera'}
            onToggle={() => toggleSection('camera')}
            isTouched={touchedSections.has('camera')}
          >
            <div className="space-y-3">
              <div className="space-y-3 p-3 rounded-lg border border-gray-700 bg-gray-800/20">
                <div>
                  <p className="text-xs uppercase tracking-wider text-indigo-200">CAMERA TYPE</p>
                  <p className="text-[11px] text-gray-400 mt-1">Select the capture device aesthetic</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {CAMERA_OPTIONS.map(option => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => { updateValue('cameraType', option.label); markSectionTouched('camera'); }}
                      className={getPillClass(values.cameraType === option.label)}
                      title={option.value}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3 p-3 rounded-lg border border-gray-700 bg-gray-800/20">
                <p className="text-xs uppercase tracking-wider text-indigo-200">SHOT TYPE</p>
                <div className="flex flex-wrap items-center gap-2">
                  {SHOT_TYPE_OPTIONS.map(option => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => { updateValue('shotType', option); markSectionTouched('camera'); }}
                      className={getPillClass(values.shotType === option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3 p-3 rounded-lg border border-gray-700 bg-gray-800/20">
                <p className="text-xs uppercase tracking-wider text-indigo-200">CAMERA ANGLE</p>
                <div className="flex flex-wrap items-center gap-2">
                  {CAMERA_ANGLE_OPTIONS.map(option => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => { updateValue('cameraAngle', option); markSectionTouched('camera'); }}
                      className={getPillClass(values.cameraAngle === option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </SmoothAccordion>
        )
      }
      {/* BUNDLES SYSTEM - STRICTLY ISOLATED */}
      {/* Bundles are enabled ONLY when multiple products are uploaded. */}
      {/* Bundles control product grouping only. */}
      {/* Bundles must never affect modes, composition, or human presence. */}
      {
        productCount > 1 && (
          <div id="bundles" className="mt-6">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-4">
              <div className="flex flex-col gap-1">
                <p className="text-xs uppercase tracking-[0.3em] text-indigo-200">Bundles</p>
                <p className="text-sm text-gray-400">
                  Quickly swap between curated packs, your own mix, or AI-recommended combos.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button type="button" className="rounded-full border px-3 py-1 text-xs font-semibold transition border-indigo-400 bg-indigo-500/10 text-white">
                  Pre-made Bundles
                </button>
                <button type="button" className="rounded-full border px-3 py-1 text-xs font-semibold transition border-white/15 text-gray-300 hover:border-indigo-400 hover:text-white">
                  Custom Bundle Builder
                </button>
                <button type="button" className="rounded-full border px-3 py-1 text-xs font-semibold transition border-white/15 text-gray-300 hover:border-indigo-400 hover:text-white">
                  Recommended Bundles
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs uppercase tracking-[0.3em] text-gray-400">Pick a bundle</label>
                  <select className="rounded-lg border border-white/15 bg-gray-900/60 px-3 py-2 text-sm text-white focus:border-indigo-400 focus:outline-none">
                    <option value="essentials_trio">Core Essentials Trio</option>
                    <option value="daily_duo">Daily Duo Stack</option>
                    <option value="launch_showcase">Launch Showcase Set</option>
                    <option value="hero_lineup">Complete Hero Lineup</option>
                  </select>
                </div>

                <div className="rounded-2xl border border-white/10 bg-gray-900/60 p-4 space-y-3">
                  <p className="text-sm font-semibold text-white">Core Essentials Trio</p>
                  <p className="text-xs text-amber-200">Add another product to enable bundles.</p>

                  <div className="flex flex-wrap gap-3">
                    <div className="w-28 text-center text-xs text-gray-300">
                      <div className="relative h-28 w-full overflow-hidden rounded-xl border border-white/10 bg-black/20">
                        <img className="h-full w-full object-cover opacity-60" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-[10px] font-semibold text-amber-200">
                          Upload to fill
                        </div>
                      </div>
                      <p className="mt-1 text-[11px]">Product 1</p>
                    </div>
                  </div>
                </div>

                <button type="button" disabled className="w-full rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:bg-indigo-900/50">
                  Generate Bundle Mockup
                </button>
              </div>
            </div>
          </div>
        )
      }

        </>
      )}

      {/* ECOMMERCE IMAGE BUILDER */}
      {/* Mutually exclusive with UGC Real Mode */}
      {/* Side Placement and Background Color only render for 'Ecommerce Blank Space' */}
      {isEcommerceMode && (
        <SmoothAccordion
          icon={Building2}
          title="Ecommerce Image Builder"
          tooltip="PDP, ads, bundles, hero ecommerce visuals"
          isOpen={openAccordionId === 'bundles'}
          onToggle={() => toggleSection('bundles')}
        >
          <div className="space-y-4">
          {/* COMPOSITION MODE */}
          <div className="space-y-3 p-3 rounded-lg border border-gray-700 bg-gray-800/20">
            <div>
              <p className="text-xs uppercase tracking-wider text-indigo-200">COMPOSITION MODE</p>
              <p className="text-[11px] text-gray-400 mt-1">Select ecommerce composition style</p>
            </div>
            <div className="flex flex-col gap-2">
              {COMPOSITION_MODE_OPTIONS.map(option => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    // Toggle: if already selected, deselect and return to Environment
                    const newValue = values.compositionMode === option ? '' : option;
                    if (newValue) {
                      // Selecting an Ecommerce option → switch to Ecommerce intent
                      enableEcommerce();
                      updateValue('compositionMode', newValue);
                    } else {
                      // Deselecting → return to Environment intent
                      enableEnvironment();
                    }
                    markSectionTouched('bundles');
                    // Reset side placement when switching modes
                    if (newValue !== 'Ecommerce Blank Space') {
                      updateValue('sidePlacement', 'Center');
                    }
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition ${values.compositionMode === option
                    ? 'border-indigo-400 bg-indigo-500/10 text-white'
                    : 'border-gray-600 text-gray-300 hover:border-gray-500'
                    }`}
                >
                  <span className="font-medium">{option}</span>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {option === 'Ecommerce Blank Space'
                      ? 'PDP hero, ads, editorial product shots'
                      : 'Packs, routines, kits with multiple products'}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* SIDE PLACEMENT - Only for Ecommerce Blank Space */}
          {values.compositionMode === 'Ecommerce Blank Space' && (
            <div className="space-y-3 p-3 rounded-lg border border-gray-700 bg-gray-800/20">
              <div>
                <p className="text-xs uppercase tracking-wider text-indigo-200">SIDE PLACEMENT</p>
                <p className="text-[11px] text-gray-400 mt-1">Product anchor position for copy space</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {SIDE_PLACEMENT_OPTIONS.map(option => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => { updateValue('sidePlacement', option); markSectionTouched('bundles'); }}
                    className={getPillClass(values.sidePlacement === option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* BACKGROUND STYLE - Only for Ecommerce Blank Space */}
          {values.compositionMode === 'Ecommerce Blank Space' && (
            <div className="space-y-5 rounded-xl border border-white/10 bg-gradient-to-b from-gray-900/60 to-gray-900/30 p-4">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-widest text-indigo-300">Background</p>
                <p className="text-sm text-gray-300">Canvas style for product renders</p>
              </div>
              <div className="inline-flex rounded-full bg-gray-800/50 p-1">
                {(['white', 'gradient'] as Step3Values['ecommerceBackgroundMode'][]).map(mode => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => { updateValue('ecommerceBackgroundMode', mode); markSectionTouched('bundles'); }}
                    className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${values.ecommerceBackgroundMode === mode
                      ? 'bg-white text-black shadow'
                      : 'text-gray-300 hover:text-white'
                      }`}
                  >
                    {mode === 'white' ? 'Pure White' : 'Gradient'}
                  </button>
                ))}
              </div>
              {values.ecommerceBackgroundMode === 'white' ? (
                <div className="rounded-xl border border-white/15 bg-gray-900/60 px-3 py-3 text-sm text-gray-300">
                  Background locked to pure #FFFFFF for PDP hero compliance. No color overrides allowed.
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { key: 'ecommerceGradientStart', label: 'Start color', value: values.ecommerceGradientStart },
                      { key: 'ecommerceGradientEnd', label: 'End color', value: values.ecommerceGradientEnd }
                    ].map(cfg => (
                      <div key={cfg.key} className="space-y-2">
                        <p className="text-[11px] uppercase tracking-wide text-gray-400">{cfg.label}</p>
                        <label className="relative flex items-center gap-3 rounded-xl bg-gray-800/40 p-3 cursor-pointer hover:bg-gray-800/60 transition">
                          <div
                            className="h-10 w-10 rounded-lg ring-1 ring-white/20"
                            style={{ background: cfg.value }}
                          />
                          <input
                            type="text"
                            value={cfg.value}
                            onChange={(e) => handleGradientColorChange(cfg.key as 'ecommerceGradientStart' | 'ecommerceGradientEnd', e.target.value)}
                            className="w-full bg-transparent text-sm text-gray-200 focus:outline-none"
                          />
                          <input
                            type="color"
                            value={cfg.value}
                            onChange={(e) => handleGradientColorChange(cfg.key as 'ecommerceGradientStart' | 'ecommerceGradientEnd', e.target.value)}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                        </label>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-3">
                    <select
                      value={values.ecommerceGradientAngle}
                      onChange={(e) => { updateValue('ecommerceGradientAngle', e.target.value as Step3Values['ecommerceGradientAngle']); markSectionTouched('bundles'); }}
                      className="rounded-full bg-gray-800/60 px-3 py-1.5 text-sm text-gray-200 focus:outline-none"
                    >
                      {GRADIENT_ANGLE_OPTIONS.map(angle => (
                        <option key={angle} value={angle}>{angle}°</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={invertGradient}
                      className="rounded-full bg-gray-800/60 px-3 py-1.5 text-sm text-gray-300 hover:text-white transition"
                    >
                      Invert
                    </button>
                  </div>
                  <div className="relative overflow-hidden rounded-2xl border border-white/10">
                    <div
                      className="h-24 w-full"
                      style={{
                        background: `linear-gradient(${values.ecommerceGradientAngle}deg, ${values.ecommerceGradientStart}, ${values.ecommerceGradientEnd})`
                      }}
                    />
                    <div className="absolute inset-0 ring-1 ring-black/5" />
                  </div>
                </>
              )}
            </div>
          )}

          {/* Info when Bundle mode is active */}
          {values.compositionMode === 'Product Bundle / Routine' && (
            <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/10">
              <p className="text-xs text-amber-200">Bundle mode: Multiple products visible with balanced composition and clear hierarchy.</p>
            </div>
          )}
        </div >
      </SmoothAccordion>
      )}

      {isEnvironmentMode && (
        <SmoothAccordion
          icon={Edit3}
          title="Formulation Story"
          tooltip="Align brand expert, research, and product goals"
          isOpen={openAccordionId === 'formulationStory'}
          onToggle={() => toggleSection('formulationStory')}
          isActive={values.formulationStoryEnabled}
        >
          <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-200">Enable Formulation Story</span>
            <button
              type="button"
              role="switch"
              aria-checked={values.formulationStoryEnabled}
              onClick={() => {
                updateValue('formulationStoryEnabled', !values.formulationStoryEnabled);
                markSectionTouched('formulationStory');
              }}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${values.formulationStoryEnabled ? 'bg-indigo-500' : 'bg-gray-600'}`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${values.formulationStoryEnabled ? 'translate-x-5' : 'translate-x-0'}`}
              />
            </button>
          </div>

          {values.formulationStoryEnabled && (
            <div className="space-y-3">
              <div className="space-y-3 p-3 rounded-lg border border-gray-700 bg-gray-800/20">
                <label className="text-xs uppercase tracking-wider text-indigo-200">Expert Name</label>
                <input
                  type="text"
                  value={values.expertName}
                  onChange={(e) => { updateValue('expertName', e.target.value); markSectionTouched('formulationStory'); }}
                  className="w-full rounded-lg border border-gray-600 bg-gray-800/50 px-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  placeholder="The name you enter here (e.g., 'Dr. Ali M.D') will be embroidered on the medical attire."
                />
              </div>

              <div className="space-y-3 p-3 rounded-lg border border-gray-700 bg-gray-800/20">
                <label className="text-xs uppercase tracking-wider text-indigo-200">Expert Credentials</label>
                <input
                  type="text"
                  value={values.expertCredentials}
                  onChange={(e) => { updateValue('expertCredentials', e.target.value); markSectionTouched('formulationStory'); }}
                  className="w-full rounded-lg border border-gray-600 bg-gray-800/50 px-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  placeholder="e.g., Formulation Scientist, 12 years mixing botanicals"
                />
              </div>

              <div className="space-y-3 p-3 rounded-lg border border-gray-700 bg-gray-800/20">
                <p className="text-xs uppercase tracking-wider text-indigo-200">Expert Role</p>
                <div className="flex flex-wrap gap-2">
                  {EXPERT_ROLE_OPTIONS.map(option => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => { updateValue('expertRole', option.value); markSectionTouched('formulationStory'); }}
                      className={getPillClass(values.expertRole === option.value)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3 p-3 rounded-lg border border-gray-700 bg-gray-800/20">
                <p className="text-xs uppercase tracking-wider text-indigo-200">Medical Attire</p>
                <div className="flex flex-wrap gap-2">
                  {EXPERT_ATTIRE_OPTIONS.map(option => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => { updateValue('expertAttire', option.value); markSectionTouched('formulationStory'); }}
                      className={getPillClass(values.expertAttire === option.value)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3 p-3 rounded-lg border border-gray-700 bg-gray-800/20">
                <p className="text-xs uppercase tracking-wider text-indigo-200">Lab Vibe</p>
                <div className="flex flex-wrap gap-2">
                  {LAB_VIBE_OPTIONS.map(option => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => { updateValue('labVibe', option); markSectionTouched('formulationStory'); }}
                      className={getPillClass(values.labVibe === option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}
          </div>
        </SmoothAccordion>
      )}

      {/* Output Format - LAST */}
      <SmoothAccordion
        icon={Layers}
        title="Output Format"
        tooltip="Aspect ratio for the final image"
        isOpen={openAccordionId === 'output'}
        onToggle={() => toggleSection('output')}
      >
        <div className="space-y-3 p-3 rounded-lg border border-gray-700 bg-gray-800/20">
          <p className="text-xs uppercase tracking-wider text-indigo-200">ASPECT RATIO</p>
          <div className="flex flex-wrap items-center gap-2">
            {ASPECT_RATIO_OPTIONS.map(option => (
              <button
                key={option}
                type="button"
                onClick={() => { updateValue('aspectRatio', option); markSectionTouched('output'); }}
                className={getPillClass(values.aspectRatio === option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </SmoothAccordion>

    </div >
  );
};

export default LifestyleStep3;
