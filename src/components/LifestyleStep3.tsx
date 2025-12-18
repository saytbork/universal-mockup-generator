import React, { useState, useEffect, useCallback } from 'react';
import {
  SlidersHorizontal, User, Activity, Scissors, Smile, Eye, Sparkles,
  Sun, Camera, Rotate3d, Layout, Hand, Smartphone, Shirt, Layers, Film,
  Home, MapPin, Coffee, Utensils, Car, Waves, Mountain, Building2, Edit3, Heart, Check
} from 'lucide-react';
import {
  LIGHTING_OPTIONS,
  CAMERA_OPTIONS,
  CAMERA_ANGLE_OPTIONS as CONSTANT_CAMERA_ANGLE_OPTIONS // Use constant if needed or stick to local if it matches
} from '../../constants';
import {
  UGCCaptureSituationOptions,
  type UGCCaptureSituationId,
  type UGCCaptureSituationOption,
  type UGCCaptureCategory
} from '../lib/promptEngine/ugcCaptureSituation';

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

  // Selfie Mode (Unified System)
  selfieMode: string;

  // Wardrobe
  wardrobe: string;

  // Props - NEW
  props: string;
  customProps: string;

  // Creation Intent / Modes
  creationIntent: 'ugc' | 'product' | 'brand';
  creationMode: string;
  compositionMode: string;
  sidePlacement: string;
  ecommerceBackgroundColor: string;

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

const UGC_CAPTURE_ORDER: UGCCaptureCategory[] = ['body', 'motion', 'framing', 'context'];

const UGC_CAPTURE_CATEGORY_LABELS: Record<UGCCaptureCategory, string> = {
  body: 'Body & Phone Position',
  motion: 'Motion & Stability',
  framing: 'Framing Imperfections',
  context: 'Contextual Awkwardness'
};

const UGC_CAPTURE_CATEGORY_DESCRIPTIONS: Record<UGCCaptureCategory, string> = {
  body: 'Select how the phone and body are positioned during the shot.',
  motion: 'Capture the stabilization or wobble while the person moves.',
  framing: 'Highlight the imperfect framing glitches common in real selfies.',
  context: 'Add distracting elements or settings that feel raw and unplanned.'
};

const UGC_CAPTURE_OPTIONS_BY_CATEGORY: Record<UGCCaptureCategory, UGCCaptureSituationOption[]> = {
  body: [],
  motion: [],
  framing: [],
  context: []
};

UGCCaptureSituationOptions.forEach(option => {
  UGC_CAPTURE_OPTIONS_BY_CATEGORY[option.category].push(option);
});

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

// SELFIE MODE - Unified Exclusive Enum
const SELFIE_MODE_OPTIONS = [
  "Front camera, arm's length",
  "Front camera, close face",
  "Front camera, upper body",
  "Mirror selfie",
  "Back camera handheld",
  "Third-person phone shot",
  "Casual angled selfie",
  "Friend holding phone",
  "Table propped phone",
  "Laptop webcam"
];

// TIME & LIGHTING - per final spec
const TIME_OF_DAY_OPTIONS = ['Morning', 'Midday', 'Evening', 'Night'];
// LIGHTING_STYLE_OPTIONS removed in favor of imported LIGHTING_OPTIONS

// SHOT TYPE - Simplified to 3 options
const SHOT_TYPE_OPTIONS = ['Close', 'Medium', 'Wide'];

// CAMERA ANGLE - Simplified
const CAMERA_ANGLE_OPTIONS = ['Eye level', 'Above', 'Below'];

// Product Interaction alias
const PRODUCT_INTERACTION_OPTIONS = INTERACTION_OPTIONS;

// ASPECT RATIO - Output Format
const ASPECT_RATIO_OPTIONS = ['1:1 (Square)', '4:5 (Portrait)', '9:16 (Story)'];

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
interface AccordionSectionProps {
  icon: React.ElementType;
  title: string;
  tooltip: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  isRequired?: boolean;
  isTouched?: boolean;
}

const AccordionSection: React.FC<AccordionSectionProps> = ({
  icon: Icon,
  title,
  tooltip,
  isOpen,
  onToggle,
  children,
  isRequired = false,
  isTouched = false
}) => {
  return (
    <div className="rounded-xl border border-gray-700 bg-gray-800/30 overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-700/20 transition"
      >
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 text-indigo-400" />
          <div className="text-left">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-white">{title}</p>
              {isRequired && !isTouched && (
                <span className="text-xs text-amber-400">*Required</span>
              )}
              {isTouched && (
                <Check className="w-4 h-4 text-green-400" />
              )}
            </div>
            <p className="text-xs text-gray-400">{tooltip}</p>
          </div>
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="p-4 border-t border-gray-700">
          {children}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
const LifestyleStep3: React.FC<LifestyleStep3Props> = ({
  isProductMode = false,
  onValuesChange,
  onCanGenerateChange,
  hasModelReference = false,
  productCount = 0,
}: LifestyleStep3Props) => {
  const [isPro, setIsPro] = useState(false);
  const [sceneMode, setSceneMode] = useState<'ugc' | 'product'>(isProductMode ? 'product' : 'ugc');
  const [openAccordionId, setOpenAccordionId] = useState<string | null>(isProductMode ? 'product-setup' : 'creator');
  const [touchedSections, setTouchedSections] = useState<Set<string>>(new Set());
  const [customClothesDragActive, setCustomClothesDragActive] = useState(false);

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

    // Time & Lighting - simplified
    timeOfDay: 'Afternoon',
    lightingStyle: 'Natural',

    // Camera
    shotType: 'Medium',
    cameraType: 'Modern Smartphone',
    cameraAngle: 'Eye level',
    framing: 'Rule of thirds',

    // Product Interaction
    productInteraction: 'Holding',
    productUsageDescription: '',
    productStructure: 'single',

    // Realism
    ugcRealMode: true,
    ugcCaptureSituation: null,

    // Selfie
    selfieMode: 'None',

    // Wardrobe
    wardrobe: '',

    // Props
    props: '',
    customProps: '',

    // Creation Intent / Modes (simplified - removed legacy modes)
    creationIntent: 'ugc',
    creationMode: 'Lifestyle UGC',
    compositionMode: '', // Empty = not in ecommerce mode
    sidePlacement: SIDE_PLACEMENT_OPTIONS[1],
    ecommerceBackgroundColor: '#ffffff',

    // Scene Intent Rule - Default: Environment/Lifestyle mode active
    sceneIntent: 'environment',

    // Background
    preserveEnvironment: false,
    backgroundBlur: false,
    allowMessiness: true,
    noArtificialProps: true,

    // Formulation Story
    formulationStoryEnabled: false,
    expertRole: EXPERT_ROLE_OPTIONS[0].value,
    expertName: '',
    expertCredentials: '',
    expertAttire: EXPERT_ATTIRE_OPTIONS[0].value,
    expertBadgePreference: BADGE_PREFERENCE_OPTIONS[0].value,
    labVibe: LAB_VIBE_OPTIONS[0],

    // Advanced Pro
    sameCreatorAcrossScenes: false,
    sceneContinuity: false,
    cinematicLook: false,
    storytellingConsistency: false,

    // Output
    aspectRatio: '1:1 (Square)',
  };

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
        newValues.ugcCaptureSituation = null;
      }

      // SAFETY RULE: If hasModelReference is true, force UGC off and clear creator
      if (hasModelReference) {
        newValues.ugcRealMode = false;
        newValues.creatorPreset = null;
      }

      return newValues;
    });
  }, [values, hasModelReference]);

  const toggleBooleanFlag = <K extends keyof Step3Values>(key: K) => {
    const current = values[key];
    if (typeof current === 'boolean') {
      updateValue(key, (!current) as Step3Values[K]);
    }
  };

  const ageSliderProgress = Math.min(Math.max(((values.age - 18) / 72) * 100, 0), 100);
  const ageSliderLabel = getAgeCategory(values.age);
  const handleAgeSliderChange = (nextValue: number) => {
    updateValue('age', nextValue);
    markSectionTouched('creator');
  };

  // PHASE 3: Emit sceneState on EVERY change
  useEffect(() => {
    console.log('[STEP3 EMIT]', values);
    if (onValuesChange) {
      onValuesChange(values);
    }
  }, [values, onValuesChange]);

  useEffect(() => {
    if (onCanGenerateChange) {
      const canGenerate = !(values.ugcRealMode && !values.ugcCaptureSituation);
      onCanGenerateChange(canGenerate);
    }
  }, [onCanGenerateChange, values.ugcCaptureSituation, values.ugcRealMode]);

  const isPersonDisabled = values.noPerson;

  // Initial Safety Check for hasModelReference
  useEffect(() => {
    if (hasModelReference && (values.ugcRealMode || values.creatorPreset)) {
      setValues(prev => ({
        ...prev,
        ugcRealMode: false,
        creatorPreset: null,
        ugcCaptureSituation: null
      }));
    }
  }, [hasModelReference, values.ugcRealMode, values.creatorPreset]);

  // ============================================================================
  // SCENE INTENT - SINGLE SOURCE OF TRUTH
  // Environment and Ecommerce are mutually exclusive
  // Only one can be active at any time
  // ============================================================================

  // Derived from sceneIntent - no longer computed independently
  const isEcommerceMode = values.sceneIntent === 'ecommerce';
  const isEnvironmentMode = values.sceneIntent === 'environment';



  // Scene Intent Handler: Enable Environment Mode
  const enableEnvironment = useCallback(() => {
    console.log('[SCENE INTENT] Switching to Environment mode');
    setValues(prev => ({
      ...prev,
      sceneIntent: 'environment',
      compositionMode: '',           // Clear ecommerce
      ugcRealMode: true,             // Enable environment mode
      sidePlacement: SIDE_PLACEMENT_OPTIONS[1], // Reset placement
      ecommerceBackgroundColor: '',
    }));
  }, []);

  // Scene Intent Handler: Enable Ecommerce Mode
  const enableEcommerce = useCallback(() => {
    console.log('[SCENE INTENT] Switching to Ecommerce mode');
    setValues(prev => ({
      ...prev,
      sceneIntent: 'ecommerce',
      ugcRealMode: false,            // Disable environment mode
      selfieMode: 'None',            // Clear UGC-specific values
      customEnvironment: '',         // Clear custom environment
      ugcCaptureSituation: null
    }));
  }, []);

  // HARD RULE: Custom Environment → switches to Environment intent
  useEffect(() => {
    if (values.customEnvironment && values.sceneIntent === 'ecommerce') {
      console.log('[HARD RULE] Custom Environment set - switching to Environment intent');
      enableEnvironment();
    }
  }, [values.customEnvironment, values.sceneIntent, enableEnvironment]);

  useEffect(() => {
    if (values.sceneIntent === 'environment') {
      if (values.compositionMode) {
        updateValue('compositionMode', '');
      }
      if (values.ecommerceBackgroundColor) {
        updateValue('ecommerceBackgroundColor', '');
      }
      if (values.sidePlacement !== SIDE_PLACEMENT_OPTIONS[1]) {
        updateValue('sidePlacement', SIDE_PLACEMENT_OPTIONS[1]);
      }
    }

    if (values.sceneIntent === 'ecommerce') {
      if (values.customEnvironment) {
        updateValue('customEnvironment', '');
      }
    }
  }, [
    values.sceneIntent,
    values.compositionMode,
    values.ecommerceBackgroundColor,
    values.sidePlacement,
    values.customEnvironment,
    updateValue
  ]);

  // ========================================================================
  // PRODUCT MODE VALIDATION (Stage 11)
  // ========================================================================

  // Sync sceneMode with isProductMode prop
  useEffect(() => {
    setSceneMode(isProductMode ? 'product' : 'ugc');
  }, [isProductMode]);

  // Block and clear UGC state when Product Mode is active
  useEffect(() => {
    if (!isProductMode) return;

    console.log('[PRODUCT MODE VALIDATION] Clearing UGC state');

    // Auto-clear UGC Real Mode
    if (values.ugcRealMode) {
      console.log('[PRODUCT MODE] Disabling UGC Real Mode');
      updateValue('ugcRealMode', false);
    }

    // Auto-clear selfie type
    if (values.selfieMode && values.selfieMode !== 'None') {
      console.log('[PRODUCT MODE] Clearing selfie mode');
      updateValue('selfieMode', 'None');
    }

    // Set creation intent to product
    if (values.creationIntent !== 'product') {
      console.log('[PRODUCT MODE] Setting creationIntent = product');
      updateValue('creationIntent', 'product');
    }
  }, [
    isProductMode,
    values.ugcRealMode,
    values.selfieMode,
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

    if (values.ugcCaptureSituation) {
      updateValue('ugcCaptureSituation', null);
    }

    if (values.selfieMode && values.selfieMode !== 'None') {
      updateValue('selfieMode', 'None');
    }

    if (values.heroPersona) {
      updateValue('heroPersona', '');
    }
  }, [
    values.formulationStoryEnabled,
    values.ugcRealMode,
    values.ugcCaptureSituation,
    values.selfieMode,
    values.noPerson,
    values.heroPersona,
    updateValue
  ]);

  useEffect(() => {
    const shouldDisablePerson = isProductMode || values.formulationStoryEnabled;
    if (values.noPerson !== shouldDisablePerson) {
      updateValue('noPerson', shouldDisablePerson);
    }
  }, [isProductMode, values.formulationStoryEnabled, values.noPerson, updateValue]);

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


      {/* Creator / Person */}
      <AccordionSection
        icon={User}
        title="Creator / Person"
        tooltip="Define the person in your scene"
        isOpen={openAccordionId === 'creator'}
        onToggle={() => toggleSection('creator')}
        isRequired={!isProductMode}
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
              </div>
            </>
          )}
        </div>

      </AccordionSection >

      {/* UGC REAL MODE */}
      {/* DO NOT SPLIT THIS BLOCK */}
      {/* All UGC controls must render inside this container */}
      <AccordionSection
        icon={Smartphone}
        title="UGC Real Mode"
        tooltip="Creates an authentic user generated content look"
        isOpen={openAccordionId === 'realism'}
        onToggle={() => toggleSection('realism')}
        isTouched={touchedSections.has('ugc')}
      >
        <div id="ugc-real-mode">
          <div className="pt-2 pb-4 px-2">
            <div className="space-y-4">
              {/* SHOT TYPE */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="text-xs uppercase tracking-wider text-indigo-200">UGC REAL MODE</p>
                  <p className="text-sm text-gray-400">Switch to a raw, imperfect creator workspace.</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={values.ugcRealMode}
                  onClick={() => {
                const newValue = !values.ugcRealMode;
                updateValue('ugcRealMode', newValue);
                if (!newValue) {
                  updateValue('selfieMode', 'None');
                } else {
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
                  {/* UGC CAPTURE SITUATION */}
                  <div className="space-y-3 p-3 rounded-lg border border-gray-700 bg-gray-800/20">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-indigo-200">UGC Capture Style</p>
                      <p className="text-[11px] text-gray-400 mt-1">
                        Casual handheld smartphone capture, imperfect framing, natural human mistakes, non-staged.
                      </p>
                    </div>
                    {UGC_CAPTURE_ORDER.map(category => (
                      <div key={category} className="space-y-2">
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.3em] text-gray-400">
                            {UGC_CAPTURE_CATEGORY_LABELS[category]}
                          </p>
                          <p className="text-[10px] text-gray-500">{UGC_CAPTURE_CATEGORY_DESCRIPTIONS[category]}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {UGC_CAPTURE_OPTIONS_BY_CATEGORY[category].map(option => (
                            <button
                              key={option.id}
                              type="button"
                              onClick={() => {
                                updateValue('ugcCaptureSituation', option.id);
                                markSectionTouched('ugc');
                              }}
                              className={getPillClass(values.ugcCaptureSituation === option.id)}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                    {!values.ugcCaptureSituation && (
                      <p className="text-[11px] text-rose-300">Please choose a real-life capture situation to continue.</p>
                    )}
                  </div>

                </>
              )}

            </div>
          </div>
        </div>

      </AccordionSection >

      {/* Product Interaction */}
      < AccordionSection
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
      </AccordionSection >

      {/* Custom Clothes Asset */}
      <div className="space-y-3 p-3 rounded-lg border border-gray-700 bg-gray-900/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-indigo-200">Custom Clothes</p>
            <p className="text-[11px] text-gray-400">Upload an outfit reference to guide how the garment should appear.</p>
          </div>
          {values.customClothingReference && (
            <button
              type="button"
              onClick={() => {
                updateValue('customClothingReference', '');
                markSectionTouched('customClothes');
              }}
              className="text-[11px] text-rose-300 hover:text-white"
            >
              Remove
            </button>
          )}
        </div>

        <div
          className={`relative h-32 w-full overflow-hidden rounded-2xl border-2 border-dashed ${customClothesDragActive ? 'border-indigo-400 bg-white/5' : 'border-gray-600 bg-black/30'}`}
          onDragOver={(event) => {
            event.preventDefault();
            setCustomClothesDragActive(true);
          }}
          onDragLeave={() => {
            setCustomClothesDragActive(false);
          }}
          onDrop={(event) => {
            event.preventDefault();
            setCustomClothesDragActive(false);
            const files = event.dataTransfer?.files;
            if (files?.length) {
              const file = files[0];
              const reader = new FileReader();
              reader.onload = () => {
                const result = reader.result;
                if (typeof result === 'string') {
                  updateValue('customClothingReference', result);
                  markSectionTouched('customClothes');
                }
              };
              reader.readAsDataURL(file);
            }
          }}
        >
          {values.customClothingReference ? (
            <>
              <img
                src={values.customClothingReference}
                alt="Clothing reference"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/40 text-[11px] text-white">
                Drop or click to replace
              </div>
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-1 text-center">
              <p className="text-sm text-white">Drag & drop or click to upload</p>
              <p className="text-[11px] text-gray-400">Like a product upload, this reference describes fabric, silhouette, and fit.</p>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = () => {
                const result = reader.result;
                if (typeof result === 'string') {
                  updateValue('customClothingReference', result);
                  markSectionTouched('customClothes');
                }
              };
              reader.readAsDataURL(file);
              event.target.value = '';
            }}
          />
        </div>
      </div>

      <AccordionSection
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
      </AccordionSection >

      {/* Environment */}
      < AccordionSection
        icon={Home}
        title="Environment"
        tooltip="Where the scene takes place"
        isOpen={openAccordionId === 'environment'}
        onToggle={() => toggleSection('environment')}
        isRequired={true}
        isTouched={touchedSections.has('environment')}
      >
        <div className="space-y-3">
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
                  : 'border-gray-600 text-gray-300 hover:border-gray-500'
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
      </AccordionSection >

      {/* Time & Lighting */}
      < AccordionSection
        icon={Sun}
        title="Time & Lighting"
        tooltip="Control the lighting and time of day"
        isOpen={openAccordionId === 'lighting'}
        onToggle={() => toggleSection('lighting')}
        isTouched={touchedSections.has('lighting')}
      >
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

          {/* LIGHTING STYLE - Updated to use LIGHTING_OPTIONS from constants */}
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
      </AccordionSection >

      
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

          <div className="space-y-3 p-3 rounded-lg border border-gray-700 bg-gray-800/20">
            <p className="text-xs uppercase tracking-[0.3em] text-indigo-200">Skin Realism</p>
            <div className="flex flex-wrap items-center gap-2">
              {SKIN_REALISM_OPTIONS.map(option => (
                <button
                  key={option}
                  type="button"
                  onClick={() => updateValue('skinRealism', option)}
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
                  onClick={() => updateValue('appearanceLevel', option)}
                  className={getPillClass(values.appearanceLevel === option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <AccordionSection
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

              {!hasModelReference && (
                <div className="space-y-3 p-3 rounded-lg border border-gray-700 bg-gray-800/20">
                  <div>
                    <label className="text-xs uppercase tracking-wider text-indigo-300">Selfie Mode</label>
                    <p className="text-[10px] text-gray-400">Exclusive capture styles</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => updateValue('selfieMode', 'None')}
                      className={getPillClass(values.selfieMode === 'None' || !values.selfieMode)}
                    >
                      None
                    </button>
                    {SELFIE_MODE_OPTIONS.map(mode => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => updateValue('selfieMode', mode)}
                        className={getPillClass(values.selfieMode === mode)}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </AccordionSection >
      {/* BUNDLES SYSTEM - STRICTLY ISOLATED */}
      {/* Bundles are enabled ONLY when multiple products are uploaded. */}
      {/* Bundles control product grouping only. */}
      {/* Bundles must never affect modes, composition, or human presence. */}
      {productCount > 1 && (
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
      )}

      {/* ECOMMERCE IMAGE BUILDER */}
      {/* Mutually exclusive with UGC Real Mode */}
      {/* Side Placement and Background Color only render for 'Ecommerce Blank Space' */}
      <AccordionSection
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

          {/* BACKGROUND COLOR - Only for Ecommerce Blank Space */}
          {values.compositionMode === 'Ecommerce Blank Space' && (
            <div className="space-y-3 p-3 rounded-lg border border-gray-700 bg-gray-800/20">
              <div>
                <p className="text-xs uppercase tracking-wider text-indigo-200">BACKGROUND COLOR</p>
                <p className="text-[11px] text-gray-400 mt-1">Solid color canvas (no gradients)</p>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={values.ecommerceBackgroundColor}
                  onChange={(e) => { updateValue('ecommerceBackgroundColor', e.target.value); markSectionTouched('bundles'); }}
                  className="h-10 w-14 cursor-pointer rounded-lg border border-gray-600 bg-transparent p-1"
                />
                <input
                  type="text"
                  value={values.ecommerceBackgroundColor}
                  onChange={(e) => { updateValue('ecommerceBackgroundColor', e.target.value); markSectionTouched('bundles'); }}
                  placeholder="#ffffff"
                  className="flex-1 rounded-full border border-gray-600 bg-gray-800/50 px-4 py-2 text-sm text-gray-200 placeholder-gray-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}

          {/* Info when Bundle mode is active */}
          {values.compositionMode === 'Product Bundle / Routine' && (
            <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/10">
              <p className="text-xs text-amber-200">Bundle mode: Multiple products visible with balanced composition and clear hierarchy.</p>
            </div>
          )}
        </div >
      </AccordionSection >

      {/* Formulation Story */}
      <AccordionSection
        icon={Edit3}
        title="Formulation Story"
        tooltip="Align brand expert, research, and product goals"
        isOpen={openAccordionId === 'formulationStory'}
        onToggle={() => toggleSection('formulationStory')}
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
      </AccordionSection>

      {/* Output Format - LAST */}
      <AccordionSection
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
      </AccordionSection>

    </div >
  );
};

export default LifestyleStep3;
