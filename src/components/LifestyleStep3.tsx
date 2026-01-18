import React, { useState, useEffect, useCallback } from 'react';
import {
  SlidersHorizontal, User, Activity, Scissors, Smile, Eye, Sparkles,
  Sun, Camera, Rotate3d, Layout, Hand, Smartphone, Shirt, Layers, Film,
  Home, MapPin, Coffee, Utensils, Car, Waves, Mountain, Building2, Edit3, Heart, Check,
  AlertTriangle
} from 'lucide-react';
import {
  LIGHTING_OPTIONS,
  CAMERA_OPTIONS,
  CAMERA_ANGLE_OPTIONS as CONSTANT_CAMERA_ANGLE_OPTIONS // Use constant if needed or stick to local if it matches
} from '../../constants';
import type { UGCCaptureSituationId } from '../lib/promptEngine/ugcCaptureSituation';
import SmoothAccordion from './SmoothAccordion';
import EcommerceStep3, { type EcommerceGenerationSettings } from './EcommerceStep3';
import type { EcommerceSlotKey, EcommerceSlotsConfig } from '@/lib/ecommerceOverlay/types';
import { Chip } from './ui/Chip';
import { Toggle } from './ui/Toggle';
import { useProductStudioStore, PREBUILT_BUNDLES, BRAND_PRESETS } from '@/lib/productStudio/store';
import type { ProductStudioState, CameraAngle, CameraDistance, CameraRotation, CameraFraming, CreativeTheme, PaletteSource, PropDensity, BlankSpaceSide, EnvironmentMacro, Lighting, ProductType, MicroPlace, CompositionMode, SurfaceBase, ProductScale, ProductSpacing, LightStyle, NegativeSpace, IngredientStackLayout, ProductStateMotion } from '@/lib/productStudio/types';
import { validateProductStudioState } from '@/lib/productStudio/validator';
import { normalizeOption } from '../system/normalizeOptions';

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

  outputFormat: '1:1' | '4:5' | '9:16' | '16:9';
}
interface LifestyleStep3Props {
  isProductMode?: boolean;
  onValuesChange?: (values: Step3Values) => void;
  onCanGenerateChange?: (canGenerate: boolean) => void;
  hasModelReference?: boolean;
  productCount?: number;
  hasFirstGenerationComplete?: boolean;
  embedded?: boolean;
  ecommerceOverlay?: {
    selectedSlots: EcommerceSlotKey[];
    onSelectedSlotsChange: (next: EcommerceSlotKey[]) => void;
    slotsConfig: EcommerceSlotsConfig;
    onSlotsConfigChange: (next: EcommerceSlotsConfig) => void;
    slotBaseImages: Partial<Record<EcommerceSlotKey, string | null>>;
    settings: EcommerceGenerationSettings;
    onSettingsChange: (next: EcommerceGenerationSettings) => void;
  };
}

export interface Step3Values {
  // Creator/Person
  age: number; // Numeric age (18-90)
  noPerson: boolean;
  personCount: 'single' | 'couple' | 'group';
  coupleSex: 'same' | 'different';
  coupleStaging: string;
  editSecondaryPerson: boolean;
  secondaryAge: number;
  secondaryGender: string;
  secondaryEthnicity: string;
  secondarySkinTone: string;
  secondaryEyeColor: string;
  secondaryBodyType: string;
  secondaryHairLength: string;
  secondaryHairTexture: string;
  secondaryHairColor: string;
  gender: 'Female' | 'Male' | 'Trans' | 'Non-binary' | 'Trans woman' | 'Trans man' | 'Gender non-conforming';
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

  // Environment — CANONICAL SOURCE OF TRUTH
  environmentContext?: {
    macro?: string;  // Kitchen, Bathroom, Bedroom, etc.
    micro?: string;  // Countertop, Sink, Mirror, etc.
  } | null;  // null = Studio mode (no environment)

  // LEGACY (deprecated - migrate to environmentContext)
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
  productProminence: 'balanced' | 'product-first' | 'model-first' | 'fifty-fifty';

  // Product Interaction
  productInteraction: string;
  productUsageDescription: string;
  productStructure: 'single' | 'bundle' | 'routine';

  // Realism
  ugcRealMode: boolean;
  ugcImperfectionLevel: 'low' | 'medium' | 'high';
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

  // Ritual Mode (Lifestyle-only)
  ritualModeEnabled: boolean;
  ritualHideProduct: boolean;
  ritualNoObjects: boolean;
  ritualCoupleStaging: string;
  ritualPosture: string;
  ritualActivities: string[];
  ritualCustom: string;

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

  // ==========================================================================
  // PRODUCT MODE (Ecommerce Image Builder) — Product-only controls
  // These keys are ignored by Lifestyle/UGC mapping.
  // ==========================================================================
  productType?: 'Capsules' | 'Gummies' | 'Drops' | 'Powder' | 'Skincare' | 'Device' | 'Custom';
  productTypeCustom?: string;
  productPackaging?: 'With box' | 'Without box';
  productScale?: 'Small handheld' | 'Medium tabletop' | 'Large object';
  handsHolding: boolean;
  productStudioInteraction?: ProductStudioState['interaction'];
  productCount?: 1 | 2 | 3;
  productGrouping?: 'Aligned' | 'Stacked' | 'Scattered';

  productCreativityLevel?: 'Off' | 'Subtle' | 'Bold' | 'Max';
  productCreativeTheme?:
  | 'Ingredient Color Story'
  | 'Clinical Minimal'
  | 'Premium Luxury'
  | 'Fresh & Bright'
  | 'Dark & Dramatic'
  | 'Playful Pop'
  | 'Tech Clean';
  productPaletteSource?:
  | 'Use product label colors'
  | 'Warm neutrals'
  | 'Cool neutrals'
  | 'Complementary accent'
  | 'Custom palette';
  productPaletteA?: string;
  productPaletteB?: string;
  productPaletteC?: string;
  productPropDensity?: 'None' | 'Light' | 'Medium' | 'Dense';
  productPropsSelected?: string[];

  productCameraSystem?: 'DSLR / mirrorless' | 'Macro lens' | 'Telephoto compression';
  productCameraAngle?:
  | 'Eye level product'
  | '45° hero'
  | 'Top-down flat lay'
  | 'Low angle power'
  | 'High angle overview'
  | 'Detail close-up';
  productCameraDistance?: 'Wide' | 'Standard' | 'Tight' | 'Macro';
  productCameraRotation?: 0 | 5 | 10 | 15;
  productFramingGuide?:
  | 'Centered hero'
  | 'Rule of thirds'
  | 'Left aligned + negative space'
  | 'Right aligned + negative space'
  | 'Grid-ready';

  productUseCase?:
  | 'What is the product?'
  | 'How does it work?'
  | 'What results can I get?'
  | 'How is it different?'
  | 'Social proof'
  | 'Can you back it up?';
  productLayout?:
  | 'Centered hero (no text)'
  | 'Left product / right content'
  | 'Right product / left content'
  | 'Bottom product / top content'
  | 'PDP square safe'
  | 'Ad vertical safe';
  productHeadline?: string;
  productSubheadline?: string;
  productBullets?: string[];
  productBulletIcons?: string[];

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
  labVibeCustom: string;
  formulationProductVisible: boolean;

  // Advanced Pro
  sameCreatorAcrossScenes: boolean;
  sceneContinuity: boolean;
  cinematicLook: boolean;
  storytellingConsistency: boolean;

  // Output
  aspectRatio: string;
  seed: string;

  // ==========================================================================
  // PRODUCT STUDIO FIELDS — Injected into prompt engine
  // ==========================================================================
  studioPhotoMode?: string;
  studioAlignment?: string;
  studioShadow?: string;
  studioProps?: string;
  studioIngredientLayout?: IngredientStackLayout;
  studioInteraction?: string;
  studioLens?: string;
  studioLightingRig?: string;
  studioFinish?: string;
  studioBackgroundColor?: string;
  studioAccentColor?: string;
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

const SECTION_GROUP_CLASS =
  'space-y-3';
const GROUP_LABEL_CLASS =
  'text-[10px] uppercase tracking-[0.2em] text-gray-500 font-extrabold mb-1';

const getPillClass = (isActive: boolean, fullWidth = false) => {
  const base = `rounded-full px-4 py-2 text-xs font-semibold border transition-colors ${fullWidth ? 'w-full text-center' : ''}`;
  const active =
    'bg-indigo-600 text-white border-indigo-600  shadow-indigo-500/20 ' +
    'dark:bg-indigo-500 dark:border-indigo-500';
  const inactive =
    'bg-white text-gray-600 border-gray-200 hover:border-indigo-600 ' +
    'dark:bg-white/5 dark:text-white/60 dark:border-white/10 dark:hover:border-white/30 dark:backdrop-blur-[20px] dark:backdrop-saturate-[180%]';
  return `${base} ${isActive ? active : inactive}`.trim();
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

const isHexColor = (value: string) => /^#[0-9a-fA-F]{6}$/.test(value.trim());
const normalizeHexColor = (value: string) => {
  const v = value.trim();
  if (!v) return '';
  if (v.startsWith('#') && v.length === 7 && /^[0-9a-fA-F]+$/.test(v.slice(1))) return v.toUpperCase();
  if (!v.startsWith('#') && v.length === 6 && /^[0-9a-fA-F]+$/.test(v)) return `#${v.toUpperCase()}`;
  return value;
};

const RITUAL_ACTIVITY_OPTIONS = [
  'Meditation',
  'Breathwork',
  'Yoga',
  'Running',
  'Strength training',
  'Stretching',
  'Digestive relief',
  'Morning routine',
  'Journaling',
  'Hydration / water intake',
  'Smoothie prep',
  'Meal prep',
  'Nature walk',
  'Cold plunge',
  'Sauna',
  'Skincare routine',
  'Sleep wind-down',
];

const RITUAL_COUPLE_STAGING_OPTIONS = [
  'Together (side-by-side)',
  'Together (one behind the other)',
  'Facing each other',
  'Separated (different areas)',
];

const RITUAL_POSTURE_OPTIONS = [
  'Auto',
  'Seated',
  'Standing',
  'Walking',
  'Lying down',
  'Kneeling',
];

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
    description: 'Choose how the phone is held.',
    icon: Camera,
    options: [
      {
        id: 'torso-level-handheld',
        label: 'Torso-level handheld',
        detail: 'Torso height, slight downward drift. Never centered.'
      },
      {
        id: 'high-angle',
        label: 'High-angle vantage',
        detail: 'Camera above eye level with awkward tilt.'
      },
      {
        id: 'close-face',
        label: 'Close face framing',
        detail: 'Tight, imperfect facial crop. Feels too close.'
      },
      {
        id: 'propped-surface',
        label: 'Propped on surface',
        detail: 'Phone resting on a counter with subtle wobble.'
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
const ASPECT_RATIO_OPTIONS = ['1:1 (Square)', '4:5 (Portrait)', '9:16 (Story)', '16:9 (Landscape)'];

const GRADIENT_ANGLE_OPTIONS: Array<'45' | '90' | '180'> = ['45', '90', '180'];


const SIDE_PLACEMENT_OPTIONS = ['Left', 'Center', 'Right'];

// FORMULATION STORY
const LAB_VIBE_OPTIONS = ['Clean Lab', 'Moody Lab', 'Warm Studio', 'None', 'Custom'];

// CREATIVITY V1 CONSTANTS
const COMPOSITION_MODE_V1_OPTIONS = [
  { value: 'centered', label: 'Centered Hero', description: 'Classic product-first framing.' },
  { value: 'thirds', label: 'Rule of Thirds', description: 'Dynamic, professional placement.' },
  { value: 'asymmetrical', label: 'Asymmetrical', description: 'Editorial, modern balance.' },
  { value: 'flatlay', label: 'Flat Lay', description: 'Top-down organizational view.' },
  { value: 'pedestal', label: 'Pedestal', description: 'Elevated, premium presentation.' },
];

const SURFACE_BASE_OPTIONS = [
  { value: 'neutral', label: 'Neutral Surface', description: 'Clean tabletop base that keeps attention on the pack.' },
  { value: 'pedestal', label: 'Geometric Pedestal', description: 'Structured hero lift for a premium, elevated feel.' },
  { value: 'acrylic', label: 'Reflective Acrylic', description: 'Modern reflections and highlights for a studio polish.' },
  { value: 'stone', label: 'Natural Stone', description: 'Organic, tactile surface that adds grounded luxury.' },
  { value: 'abstract', label: 'Abstract Editorial', description: 'Stylized base elements for a fashion/editorial vibe.' },
];

const PRODUCT_SCALE_OPTIONS: { value: ProductScale; label: string }[] = [
  { value: 'dominant', label: 'Dominant' },
  { value: 'balanced', label: 'Balanced' },
  { value: 'oversized', label: 'Oversized' },
];

const PRODUCT_SPACING_OPTIONS: { value: ProductSpacing; label: string }[] = [
  { value: 'compact', label: 'Compact' },
  { value: 'balanced', label: 'Balanced' },
  { value: 'airy', label: 'Airy' },
];

const LIGHT_STYLE_OPTIONS_V1 = [
  { value: 'soft', label: 'Soft Diffused', description: 'Even, flattering light with smooth transitions and minimal harshness.' },
  { value: 'clinical', label: 'Crisp Clinical', description: 'Clean, high-clarity lighting that reads “lab/studio” and product-forward.' },
  { value: 'contrast', label: 'High Contrast', description: 'Punchier shadows and highlights for bold, dramatic separation.' },
  { value: 'shadow-play', label: 'Kind Gentle Shadow', description: 'Artful shadow shaping without looking harsh or overly stylized.' },
];

const NEGATIVE_SPACE_OPTIONS: { value: NegativeSpace; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'subtle', label: 'Subtle' },
  { value: 'intentional', label: 'Intentional' },
  { value: 'heavy', label: 'Heavy' },
];

const PALETTE_SOURCE_OPTIONS_V1: { value: PaletteSource; label: string }[] = [
  { value: 'brand', label: 'Product Label Colors' },
  { value: 'warm-neutral', label: 'Warm Neutrals' },
  { value: 'cool-neutral', label: 'Cool Neutrals' },
  { value: 'complementary', label: 'Complementary Accent' },
  { value: 'custom', label: 'Custom Palette' },
];

const CREATIVE_THEME_OPTIONS_V1: { value: CreativeTheme; label: string }[] = [
  { value: 'clinical-minimal', label: 'Clinical Minimal' },
  { value: 'ingredient-color', label: 'Ingredient Color Story' },
  { value: 'premium-clean', label: 'Premium Luxury' },
  { value: 'fresh-bright', label: 'Fresh & Bright' },
  { value: 'dark-dramatic', label: 'Dark & Dramatic' },
  { value: 'playful-pop', label: 'Playful Pop' },
  { value: 'tech-clean', label: 'Tech Clean' },
  { value: 'bold-graphic', label: 'Bold Graphic' },
];

const PROP_DENSITY_OPTIONS: { value: PropDensity; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'low', label: 'Light' },
  { value: 'medium', label: 'Medium' },
  { value: 'dense', label: 'Dense' },
];

// ============================================================================
// HELPER COMPONENTS
// ============================================================================
type LabeledOption = { value: string; label: string; description?: string };

const SelectedOptionFooter: React.FC<{ options: LabeledOption[]; selectedValue: string | null | undefined }> = ({
  options,
  selectedValue,
}) => {
  if (!selectedValue) return null;
  const selected = options.find(option => option.value === selectedValue);
  if (!selected?.description) return null;
  return <p className="text-[11px] text-gray-500 mt-1">{selected.description}</p>;
};

const SelectedTooltipFooter: React.FC<{ selectedValue: string | null | undefined }> = ({ selectedValue }) => {
  if (!selectedValue) return null;
  const normalized = normalizeOption({ label: selectedValue, value: selectedValue });
  if (!normalized.tooltip) return null;
  return <p className="text-[11px] text-gray-500 mt-1">{normalized.tooltip}</p>;
};

const footerOptionsFromLabelValue = (options: Array<{ label: string; value: string }>): LabeledOption[] =>
  options.map(option => ({ value: option.label, label: option.label, description: option.value }));
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
  embedded = false,
  ecommerceOverlay,
}: LifestyleStep3Props) => {
  const initialSceneIntent: Step3Values['sceneIntent'] = isProductMode ? 'ecommerce' : 'environment';
  const [openAccordionId, setOpenAccordionId] = useState<string | null>(
    initialSceneIntent === 'ecommerce' ? 'product-setup' : 'creator'
  );
  const [openUgcLayerId, setOpenUgcLayerId] = useState<UGCLayerField | null>(null);
  const [touchedSections, setTouchedSections] = useState<Set<string>>(new Set());
  // Removed duplicate isCreatorPro declaration here, managed near top.
		  const initialValues: Step3Values = {
		    // Creator/Person
		    age: 30, // Numeric age
		    noPerson: initialSceneIntent === 'ecommerce', // UGC Rule: person MUST be present by default
		    personCount: 'single',
		    coupleSex: 'different',
		    coupleStaging: 'Together (side-by-side)',
		    editSecondaryPerson: false,
	        secondaryAge: 30,
		    secondaryGender: '',
		    secondaryEthnicity: '',
		    secondarySkinTone: '',
	    secondaryEyeColor: '',
	    secondaryBodyType: '',
	    secondaryHairLength: '',
	    secondaryHairTexture: '',
	    secondaryHairColor: '',
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

    // Environment - CANONICAL SOURCE (environmentContext)
    // null = Studio/Ecommerce mode (no environment)
    environmentContext: initialSceneIntent === 'ecommerce' ? null : { macro: 'Kitchen', micro: 'Countertop' },

    // LEGACY - kept for backward compatibility
    environment: initialSceneIntent === 'ecommerce' ? '' : 'Kitchen', // Kitchen has table/counter surface by default
    customEnvironment: '',
    sceneOrderChaos: 'Normal',
    // Ecommerce canvas (neutral background + negative space) is optional and toggle-driven.
    ecommerceSidePlacementFlag: false,

    // Time & Lighting - simplified
    timeOfDay: 'Afternoon',
    lightingStyle: 'Natural',

    // Camera
    shotType: 'Medium',
    cameraType: 'DSLR / mirrorless camera',
    cameraAngle: 'Eye level',
    framing: 'Rule of thirds',
    productProminence: 'product-first',

    // Product Interaction
    productInteraction: 'Holding',
    productUsageDescription: '',
    productStructure: 'single',

    // Realism
    ugcRealMode: false,
    ugcImperfectionLevel: 'medium',
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

    // Ritual Mode
    ritualModeEnabled: false,
    ritualHideProduct: false,
    ritualNoObjects: false,
    ritualCoupleStaging: 'Together (side-by-side)',
    ritualPosture: 'Auto',
    ritualActivities: [],
    ritualCustom: '',

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
    creationIntent: initialSceneIntent === 'ecommerce' ? 'product' : 'ugc',
    creationMode: 'Lifestyle UGC',
    compositionMode: '', // Toggle-driven (Ecommerce Blank Space)
    sidePlacement: SIDE_PLACEMENT_OPTIONS[1],
    ecommerceBackgroundColor: '#ffffff',
    ecommerceBackgroundMode: 'white',
    ecommerceGradientStart: '#f7f7f7',
    ecommerceGradientEnd: '#d9d9d9',
    ecommerceGradientAngle: '90',

    // Scene Intent Rule - Default: Environment/Lifestyle mode active
    sceneIntent: initialSceneIntent,

    // ==========================================================================
    // PRODUCT MODE DEFAULTS (only used when sceneIntent === 'ecommerce')
    // ==========================================================================
    productType: 'Capsules',
    productTypeCustom: '',
	    productPackaging: 'Without box',
	    productScale: 'Medium tabletop',
	    handsHolding: false,
	    productStudioInteraction: 'none',
	    productCount: 1,
	    productGrouping: 'Aligned',

    productCreativityLevel: 'Off',
    productCreativeTheme: 'Clinical Minimal',
    productPaletteSource: 'Use product label colors',
    productPaletteA: '#FFFFFF',
    productPaletteB: '#F7F7F7',
    productPaletteC: '#111827',
    productPropDensity: 'None',
    productPropsSelected: [],

    productCameraSystem: 'DSLR / mirrorless',
    productCameraAngle: '45° hero',
    productCameraDistance: 'Standard',
    productCameraRotation: 0,
    productFramingGuide: 'Centered hero',

    productUseCase: 'What is the product?',
    productLayout: 'Centered hero (no text)',
    productHeadline: '',
    productSubheadline: '',
    productBullets: [],
    productBulletIcons: [],

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
    labVibeCustom: '',
    formulationProductVisible: true,

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
  const [activePaletteSlot, setActivePaletteSlot] = useState<'productPaletteA' | 'productPaletteB' | 'productPaletteC'>(
    'productPaletteA'
  );
  const [productCreativeAdvancedOpen, setProductCreativeAdvancedOpen] = useState(false);

  // New strict states
  const [isCreatorPro, setIsCreatorPro] = useState(false);

  // ============================================================================
  // PHASE 3: PRODUCT STUDIO STORE (SINGLE SOURCE OF TRUTH FOR PRODUCT MODE)
  // ============================================================================
  const productStore = useProductStudioStore();

  // Derived state for Environment (Strict Rule: Studio = No Environment, Lifestyle = Always Environment)
  // Product Studio must NEVER show Lifestyle/UGC sections.
  // Keep all "environment/lifestyle" UI strictly disabled when `isProductMode` is true.
  const isEnvironmentMode = !isProductMode;

  // Sync Product UI controls to ProductStudioStore when isProductMode === true
  const updateProductStudioValue = useCallback(<K extends keyof ProductStudioState>(
    key: K,
    value: ProductStudioState[K]
  ) => {
    if (!isProductMode) return;
    console.log('[PRODUCT STUDIO UPDATE]', key, value);

    // Map to ProductStudioStore actions
    switch (key) {
      case 'creativeTheme':
        productStore.setCreativeTheme(value as ProductStudioState['creativeTheme']);
        break;
      case 'creativityLevel':
        productStore.setCreativityLevel(value as ProductStudioState['creativityLevel']);
        break;
      case 'paletteSource':
        productStore.setPaletteSource(value as ProductStudioState['paletteSource']);
        break;
      case 'propDensity':
        productStore.setPropDensity(value as ProductStudioState['propDensity']);
        break;
      case 'selectedProps':
        productStore.setSelectedProps(value as string[]);
        break;
      case 'cameraSystem':
        productStore.setCameraSystem(value as ProductStudioState['cameraSystem']);
        break;
      case 'angle':
        productStore.setAngle(value as ProductStudioState['angle']);
        break;
      case 'distance':
        productStore.setDistance(value as ProductStudioState['distance']);
        break;
      case 'rotation':
        productStore.setRotation(value as ProductStudioState['rotation']);
        break;
      case 'framing':
        productStore.setFraming(value as ProductStudioState['framing']);
        break;
      case 'environmentMacro':
        {
          const macro = value as EnvironmentMacro;
          // Micro place is optional; do not auto-select a micro location when choosing a macro environment.
          productStore.setEnvironmentContext(macro === 'studio' ? null : { macro, micro: null });
        }
        break;
      case 'microPlace':
        productStore.setMicroPlace(value as ProductStudioState['microPlace']);
        break;
      case 'customEnvironmentText':
        productStore.setCustomEnvironmentText(value as string);
        break;
      case 'lighting':
        productStore.setLighting(value as ProductStudioState['lighting']);
        break;
      case 'blankSpaceEnabled':
        productStore.setBlankSpaceEnabled(value as boolean);
        break;
      case 'blankSpaceSide':
        productStore.setBlankSpaceSide(value as ProductStudioState['blankSpaceSide']);
        break;
      case 'aspectRatio':
        productStore.setAspectRatio(value as ProductStudioState['aspectRatio']);
        break;
      default:
        console.warn('[PRODUCT STUDIO] Unhandled key:', key);
    }
  }, [isProductMode, productStore]);

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

    // PHASE 3: Sync Product controls to ProductStudioStore when in Product mode
    if (isProductMode) {
      // Some Product Studio actions are NOT 1:1 mapped to `ProductStudioState` keys.
      // Handle them explicitly so the prompt builders receive the correct canonical state.
      if (key === 'productType') {
        const typeMap: Record<string, ProductType> = {
          'Capsules': 'capsules',
          'Gummies': 'gummies',
          'Drops': 'drops',
          'Powder': 'powder',
          'Skincare': 'skincare',
          'Device': 'device',
          'Custom': 'custom',
        };
        const mappedType = typeMap[value as string];
        if (mappedType) {
          productStore.setProductType(mappedType);
        }
      }
      if (key === 'productPackaging') {
        const next = value === 'With box' ? 'with-box' : 'without-box';
        productStore.setPackagingMode(next);
      }
      if (key === 'productScale') {
        const map: Record<string, 'small-handheld' | 'medium-tabletop' | 'large-object'> = {
          'Small handheld': 'small-handheld',
          'Medium tabletop': 'medium-tabletop',
          'Large object': 'large-object',
        };
        productStore.setPhysicalScaleLabel(map[value as string] ?? 'medium-tabletop');
      }

      const productKeyMap: Record<string, keyof ProductStudioState> = {
        'productCreativityLevel': 'creativityLevel',
        'productCreativeTheme': 'creativeTheme',
        'productPaletteSource': 'paletteSource',
        'productPropDensity': 'propDensity',
        'productPropsSelected': 'selectedProps',
        'productCameraSystem': 'cameraSystem',
        'productCameraAngle': 'angle',
        'productCameraDistance': 'distance',
        'productCameraRotation': 'rotation',
        'productFramingGuide': 'framing',
        'environment': 'environmentMacro',
        'customEnvironment': 'customEnvironmentText',
        'lightingStyle': 'lighting',
        'ecommerceSidePlacementFlag': 'blankSpaceEnabled',
        'sidePlacement': 'blankSpaceSide',
        'aspectRatio': 'aspectRatio',
      };

      const productKey = productKeyMap[key as string];
      if (productKey) {
        // Map values from Step3Values format to ProductStudioState format
        let mappedValue: any = value;

        // Handle specific mappings
        if (key === 'productCreativityLevel') {
          const levelMap: Record<string, 0 | 1 | 2 | 3> = { 'Off': 0, 'Subtle': 1, 'Bold': 2, 'Max': 3 };
          mappedValue = levelMap[value as string] ?? 1;
        } else if (key === 'productCreativeTheme') {
          const themeMap: Record<string, CreativeTheme> = {
            'Clinical Minimal': 'clinical-minimal',
            'Premium Luxury': 'premium-clean',
            'Ingredient Color Story': 'ingredient-color',
            'Fresh & Bright': 'fresh-bright',
            'Dark & Dramatic': 'dark-dramatic',
            'Playful Pop': 'playful-pop',
            'Tech Clean': 'tech-clean',
          };
          mappedValue = themeMap[value as string] ?? 'clinical-minimal';
        } else if (key === 'productPaletteSource') {
          const paletteMap: Record<string, PaletteSource> = {
            'Use product label colors': 'brand',
            'Warm neutrals': 'warm-neutral',
            'Cool neutrals': 'cool-neutral',
            'Complementary accent': 'complementary',
            'Custom palette': 'custom',
          };
          mappedValue = paletteMap[value as string] ?? 'warm-neutral';
        } else if (key === 'productPropDensity') {
          const densityMap: Record<string, PropDensity> = {
            'None': 'none',
            'Light': 'low',
            'Medium': 'medium',
            'Dense': 'dense',
          };
          mappedValue = densityMap[value as string] ?? 'none';
        } else if (key === 'productCameraSystem') {
          mappedValue = value === 'Macro lens' ? 'mirrorless' : 'dslr';
        } else if (key === 'productCameraAngle') {
          const angleMap: Record<string, CameraAngle> = {
            'Eye level product': 'front',
            '45° hero': '45',
            'Top-down flat lay': 'top',
            'Low angle power': 'front',
            'High angle overview': '45',
            'Detail close-up': 'front',
          };
          mappedValue = angleMap[value as string] ?? '45';
        } else if (key === 'productCameraDistance') {
          const distMap: Record<string, CameraDistance> = {
            'Wide': 'medium',
            'Standard': 'medium',
            'Tight': 'close',
            'Macro': 'macro',
          };
          mappedValue = distMap[value as string] ?? 'medium';
        } else if (key === 'productCameraRotation') {
          mappedValue = (value as number) > 0 ? 'slight' : 'none';
        } else if (key === 'productFramingGuide') {
          const framingMap: Record<string, CameraFraming> = {
            'Centered hero': 'centered',
            'Rule of thirds': 'rule-of-thirds',
            'Left aligned + negative space': 'rule-of-thirds',
            'Right aligned + negative space': 'rule-of-thirds',
            'Grid-ready': 'centered',
          };
          mappedValue = framingMap[value as string] ?? 'centered';
        } else if (key === 'environment') {
          const envMap: Record<string, EnvironmentMacro> = {
            'Kitchen': 'kitchen',
            'Living Room': 'living-room',
            'Bedroom': 'bedroom',
            'Bathroom': 'bathroom',
            'Workspace': 'workspace',
            'Hallway': 'hallway',
            'Home Gym': 'home-gym',
            'Balcony / Indoor Terrace': 'balcony-indoor-terrace',
            'Urban Exterior': 'urban-exterior',
            'Natural Exterior': 'natural-exterior',
            'Parking Lot': 'parking-lot',
            'Backyard / Patio': 'backyard-patio',
            'Street Corner': 'street-corner',
          };
          mappedValue = envMap[value as string] ?? 'studio';
        } else if (key === 'sidePlacement') {
          const sideMap: Record<string, BlankSpaceSide> = {
            'Left': 'left',
            'Center': 'right',
            'Right': 'right',
          };
          mappedValue = sideMap[value as string] ?? 'right';
        } else if (key === 'aspectRatio') {
          const ratioMap: Record<string, '1:1' | '4:5' | '9:16' | '16:9'> = {
            '1:1 (Square)': '1:1',
            '4:5 (Portrait)': '4:5',
            '9:16 (Story)': '9:16',
            '16:9 (Landscape)': '16:9',
          };
          mappedValue = ratioMap[value as string] ?? '1:1';
        }

        updateProductStudioValue(productKey, mappedValue);
      }
    }

    setValues(prev => {
      const newValues = { ...prev, [key]: value };

      // CANONICAL SYNC: When legacy environment is updated, sync to environmentContext
      if (key === 'environment' && value) {
        const nextEnvironment = String(value as string).trim();
        if (nextEnvironment === 'Custom') {
          const custom = String(newValues.customEnvironment || '').trim();
          newValues.environmentContext = { macro: custom || 'Custom', micro: 'Countertop' };
        } else {
          newValues.environmentContext = { macro: nextEnvironment, micro: 'Countertop' };
        }
        console.log('[STEP3] Synced environment to environmentContext:', newValues.environmentContext);
      }

      if (key === 'customEnvironment') {
        const custom = String(value as string).trim();
        if (custom) {
          newValues.environment = 'Custom';
          newValues.environmentContext = { macro: custom, micro: 'Countertop' };
        } else if (newValues.environment === 'Custom') {
          newValues.environment = 'Kitchen';
          newValues.environmentContext = { macro: 'Kitchen', micro: 'Countertop' };
        }
        console.log('[STEP3] Synced customEnvironment to environmentContext:', newValues.environmentContext);
      }

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
  }, [values, hasModelReference, isProductMode, updateProductStudioValue]);

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
    if (isProductMode) {
      productStore.setGradientEnabled(true);
      if (key === 'ecommerceGradientStart') productStore.setGradientStart(color);
      if (key === 'ecommerceGradientEnd') productStore.setGradientEnd(color);
    }
    markSectionTouched('ecommerce');
  }, [updateValue, markSectionTouched, isProductMode, productStore]);

  const invertGradient = useCallback(() => {
    const start = isProductMode ? productStore.gradientStart : values.ecommerceGradientStart;
    const end = isProductMode ? productStore.gradientEnd : values.ecommerceGradientEnd;
    updateValue('ecommerceGradientStart', end);
    updateValue('ecommerceGradientEnd', start);
    if (isProductMode) {
      productStore.setGradientEnabled(true);
      productStore.setGradientStart(end);
      productStore.setGradientEnd(start);
    }
    markSectionTouched('ecommerce');
  }, [isProductMode, productStore, values.ecommerceGradientStart, values.ecommerceGradientEnd, updateValue, markSectionTouched]);

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

  // PHASE 3.5: Sync productStore values to Step3Values for prompt injection
  useEffect(() => {
    setValues(prev => ({
      ...prev,
      studioPhotoMode: productStore.photoMode,
      studioAlignment: productStore.alignment,
      studioShadow: productStore.shadow,
      studioProps: productStore.props,
      studioIngredientLayout: productStore.ingredientLayout,
      studioInteraction: productStore.interaction,
      studioLens: productStore.lens,
      studioLightingRig: productStore.lightingRig,
      studioFinish: productStore.finish,
      studioBackgroundColor: productStore.backgroundColor,
      studioAccentColor: productStore.accentColor,
    }));
  }, [
    productStore.photoMode,
    productStore.alignment,
    productStore.shadow,
    productStore.props,
    productStore.ingredientLayout,
    productStore.interaction,
    productStore.lens,
    productStore.lightingRig,
    productStore.finish,
    productStore.backgroundColor,
    productStore.accentColor,
  ]);


  // PHASE 7: STRIX VALIDATION (Hard Block)
  const validationResult = validateProductStudioState(productStore);

  useEffect(() => {
    if (onCanGenerateChange) {
      // If validation fails, BLOCK generation
      if (!validationResult.valid && isProductMode) {
        onCanGenerateChange(false);
      } else {
        onCanGenerateChange(true);
      }
    }
  }, [onCanGenerateChange, validationResult.valid, isProductMode]);

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
  // Derived from sceneIntent - no longer computed independently
  const isEcommerceMode = isProductMode || values.sceneIntent === 'ecommerce';
  // const isEnvironmentMode = values.sceneIntent === 'environment'; // REDUNDANT: Derived from productStore.sceneType now
  const isUGCMode = values.ugcRealMode;

  // Scene Intent Handler: Enable Ecommerce Mode
  const enableEcommerce = useCallback(() => {
    console.log('[SCENE INTENT CHANGE] ecommerce');
    setValues(prev => {
      const next: Step3Values = {
        ...prev,
        sceneIntent: 'ecommerce',
        creationIntent: 'product',
        ugcRealMode: false,
        noPerson: true,
        environmentContext: null,  // Studio/Ecommerce = no environment
        environment: '',
        customEnvironment: '',
        heroPersona: '',
        cameraType: '',
        shotType: '',
        framing: '',
        compositionMode: '',
        ugcCaptureStyleBase: [],
        ugcCameraOperator: [],
        ugcBodyPhonePosition: [],
        ugcMotionStability: [],
        ugcFramingImperfections: [],
        ugcAwkwardContext: [],
        ecommerceBackgroundColor: prev.ecommerceBackgroundColor || '#ffffff',
        ecommerceBackgroundMode: (prev.ecommerceBackgroundMode || 'white') as any,
        ecommerceGradientStart: prev.ecommerceGradientStart || '#f7f7f7',
        ecommerceGradientEnd: prev.ecommerceGradientEnd || '#d9d9d9',
        ecommerceGradientAngle: (prev.ecommerceGradientAngle || '90') as any,
        sidePlacement: prev.sidePlacement || SIDE_PLACEMENT_OPTIONS[1],
        ecommerceSidePlacementFlag: false,
      };
      enforceSingleSelectLayers(next);
      return next;
    });
  }, []);

  // If this instance is mounted as Product Mode, lock scene intent to ecommerce.
  useEffect(() => {
    if (!isProductMode) return;
    if (values.sceneIntent !== 'ecommerce') {
      enableEcommerce();
    }
  }, [isProductMode, values.sceneIntent, enableEcommerce]);



  // Scene Intent Handler: Enable Environment Mode
  const enableEnvironment = useCallback(() => {
    console.log('[SCENE INTENT CHANGE] environment');
    setValues(prev => {
      const next: Step3Values = {
        ...prev,
        sceneIntent: 'environment',
        compositionMode: '',
      };
      enforceSingleSelectLayers(next);
      return next;
    });
  }, []);

  const exitEcommerceToEnvironment = useCallback(() => {
    console.log('[SCENE INTENT CHANGE] exit ecommerce -> environment');
    setValues(prev => {
      if (prev.sceneIntent !== 'ecommerce') return prev;
      const next: Step3Values = {
        ...prev,
        sceneIntent: 'environment',
        creationIntent: 'ugc',
        ugcRealMode: false,
        noPerson: false,
        environmentContext: { macro: prev.environment || 'Kitchen', micro: 'Countertop' },  // Restore environment
        environment: prev.environment || 'Kitchen',
        compositionMode: '',
        ecommerceSidePlacementFlag: false,
        sidePlacement: SIDE_PLACEMENT_OPTIONS[1],
        cameraType: prev.cameraType || 'Intentional smartphone camera',
        shotType: prev.shotType || 'Medium',
        cameraAngle: prev.cameraAngle || 'Eye level',
        framing: prev.framing || 'Rule of thirds',
      };
      enforceSingleSelectLayers(next);
      return next;
    });
    setOpenAccordionId('creator');
  }, []);

  useEffect(() => {
    if (values.ugcRealMode && values.sceneIntent !== 'environment') {
      enableEnvironment();
    }
  }, [values.ugcRealMode, values.sceneIntent, enableEnvironment]);

  // When App toggles out of Product Placement, force this builder back to environment mode.
  useEffect(() => {
    if (isProductMode) return;
    if (values.sceneIntent === 'ecommerce') {
      exitEcommerceToEnvironment();
    }
  }, [isProductMode, values.sceneIntent, exitEcommerceToEnvironment]);

  useEffect(() => {
    if (values.sceneIntent === 'ecommerce') {
      setOpenUgcLayerId(null);
    }
  }, [values.sceneIntent]);

  // HARD RULE: Custom Environment → switches to Environment intent
  useEffect(() => {
    if (isProductMode) return;
    if (values.customEnvironment && values.sceneIntent === 'ecommerce') {
      console.log('[HARD RULE] Custom Environment set - switching to Environment intent');
      enableEnvironment();
    }
  }, [isProductMode, values.customEnvironment, values.sceneIntent, enableEnvironment]);

  useEffect(() => {
    if (!values.ecommerceBackgroundColor) {
      updateValue('ecommerceBackgroundColor', '#ffffff');
    }
  }, [values.ecommerceBackgroundColor, updateValue]);

  const PRODUCT_TYPE_OPTIONS: Array<NonNullable<Step3Values['productType']>> = [
    'Capsules',
    'Gummies',
    'Drops',
    'Powder',
    'Skincare',
    'Device',
    'Custom'
  ];

  const ENVIRONMENT_MACRO_OPTIONS: EnvironmentMacro[] = [
    'kitchen', 'living-room', 'bedroom', 'bathroom', 'workspace',
    'hallway', 'home-gym', 'balcony-indoor-terrace',
    'urban-exterior', 'natural-exterior', 'parking-lot',
    'backyard-patio', 'street-corner', 'custom'
  ];

  const PRODUCT_ENVIRONMENT_MICRO_OPTIONS: MicroPlace[] = [
    'countertop',
    'kitchen-island',
    'sink-ledge',
    'dining-table',
  ];

  const PRODUCT_ENVIRONMENT_LIGHTING_OPTIONS: Array<{ label: string; value: ProductStudioState['lighting'] }> = [
    { label: 'Natural Light', value: 'natural-light' },
    { label: 'Sunny Day', value: 'sunny-day' },
    { label: 'Golden Hour', value: 'golden-hour' },
    { label: 'Overcast', value: 'overcast' },
    { label: 'Cozy Indoors', value: 'cozy-indoors' },
    { label: 'Ring Light', value: 'ring-light' },
    { label: 'Mood Lighting', value: 'mood-lighting' },
    { label: 'Night Mode', value: 'night-mode' },
    { label: 'Flash Photo', value: 'flash-photo' },
  ];


  const PRODUCT_PROP_SUGGESTIONS: Record<NonNullable<Step3Values['productType']>, string[]> = {
    Capsules: [
      'neutral acrylic blocks',
      'clean glass vial shapes (no labels)',
      'subtle powder dust (generic, unbranded)',
      'simple botanical leaf shapes (generic)',
      'minimal lab glass silhouettes (generic)',
      'soft shadow cards'
    ],
    Gummies: [
      'rounded acrylic blocks',
      'color gel sheets',
      'simple citrus slices (generic)',
      'soft candy-like shapes (generic)',
      'matte geometric spheres',
      'playful color chips'
    ],
    Drops: [
      'clear droppers (unbranded)',
      'glass refraction blocks',
      'water ripple texture',
      'translucent acrylic',
      'soft caustic reflections',
      'minimal glass cylinders'
    ],
    Powder: [
      'ceramic bowl (unbranded)',
      'small scoop (unbranded)',
      'linen texture',
      'fine powder plume (subtle)',
      'paper backdrop cards',
      'matte stone slab'
    ],
    Skincare: [
      'ceramic tiles',
      'water droplets (generic)',
      'soft steam hint (very subtle)',
      'spa stones (minimal)',
      'frosted acrylic',
      'clean towels (no patterns)'
    ],
    Device: [
      'brushed metal plates',
      'grid paper (no text)',
      'matte black acrylic',
      'minimal geometric frames',
      'soft technical line motifs (no text)',
      'neutral cable shapes (generic)'
    ],
    Custom: [
      'neutral acrylic blocks',
      'paper backdrop cards',
      'matte geometric shapes',
      'soft shadow cards',
      'abstract color blocks',
      'unbranded glass shapes'
    ]
  };

  const productSuggestedProps =
    PRODUCT_PROP_SUGGESTIONS[(values.productType || 'Capsules') as NonNullable<Step3Values['productType']>] ||
    PRODUCT_PROP_SUGGESTIONS.Capsules;

  // Note: Ecommerce canvas is not a sceneIntent; do not switch modes from compositionMode.

  // ========================================================================
  // PRODUCT MODE VALIDATION (Stage 11)
  // ========================================================================

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
    const shouldDisablePerson = values.sceneIntent === 'ecommerce';
    if (values.noPerson !== shouldDisablePerson) {
      updateValue('noPerson', shouldDisablePerson);
    }
  }, [values.sceneIntent, values.noPerson, updateValue]);

  useEffect(() => {
    if (!values.formulationStoryEnabled) return;
    if (values.sceneIntent === 'ecommerce') return;

    if (values.noPerson) {
      console.log('[FORMULATION STORY] Forcing person enabled (noPerson=false)');
      updateValue('noPerson', false);
    }
  }, [values.formulationStoryEnabled, values.sceneIntent, values.noPerson, updateValue]);

  useEffect(() => {
    if (values.ugcRealMode && values.formulationStoryEnabled) {
      updateValue('formulationStoryEnabled', false);
    }
  }, [values.ugcRealMode, values.formulationStoryEnabled, updateValue]);
  return (
    <div className={embedded ? 'w-full space-y-4' : 'w-full max-w-2xl mx-auto space-y-4 p-4'}>
      {!embedded && (
        <div className="flex flex-col gap-1">
          <p className="text-xs uppercase tracking-widest text-indigo-600">Step 3</p>
          <h2 className="text-2xl font-bold text-gray-900">{isEcommerceMode ? 'Product Builder' : 'Scene Builder'}</h2>
          <p className="text-sm text-gray-500">
            {isEcommerceMode
              ? 'Product-only ecommerce controls: pro camera, controlled background, and layout-safe composition.'
              : 'Define how the scene looks, feels, and behaves visually.'}
          </p>
        </div>
      )}

      {isEcommerceMode && (
        <>
          <SmoothAccordion
            icon={Layers}
            title="01 / Product Setup"
            tooltip="Define the product context. This determines what the system is allowed to generate."
            isOpen={openAccordionId === 'product-setup'}
            onToggle={() => toggleSection('product-setup')}
            isRequired
            isTouched={touchedSections.has('product-setup')}
            variant="primary"
          >
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Define the product context. This determines what the system is allowed to generate.
              </p>

              {/* PHOTO TYPE — Mutually exclusive modes to avoid prompt conflicts */}
              <div className={SECTION_GROUP_CLASS}>
                <p className={GROUP_LABEL_CLASS}>PHOTO TYPE</p>
                <p className="text-[11px] text-gray-500 mt-1">
                  Choose how the product is staged. Studio and Environment never mix.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Chip
                    onClick={() => {
                      productStore.setEnvironmentContext(null);
                      markSectionTouched('product-setup');
                    }}
                    selected={productStore.environmentContext == null}
                  >
                    Photo Studio
                  </Chip>
                  <Chip
                    onClick={() => {
                      // Default to a safe, common environment if none selected yet.
                      productStore.setEnvironmentContext({ macro: 'kitchen', micro: 'countertop' });
                      markSectionTouched('product-setup');
                    }}
                    selected={productStore.environmentContext != null}
                    disabled={productStore.blankSpaceEnabled === true}
                    className={productStore.blankSpaceEnabled ? 'opacity-50 cursor-not-allowed' : undefined}
                  >
                    Environment
                  </Chip>
                </div>
                <p className="text-[11px] text-gray-500 mt-1">
                  Photo Studio uses controlled sets. Environment places the product in a real-world setting.
                </p>
              </div>

              {/* SCENE TYPE — Hidden in Product Studio (product-only mode) */}
              {!isProductMode && (
                <div className={SECTION_GROUP_CLASS}>
                  <p className={GROUP_LABEL_CLASS}>SCENE TYPE</p>
                  <div className="flex flex-wrap gap-2">
                    {(['studio-branding', 'editorial-product', 'lifestyle-real', 'ugc-phone'] as const).map(type => (
                      <Chip
                        key={type}
                        onClick={() => {
                          productStore.setSceneType(type);
                          markSectionTouched('product-setup');
                        }}
                        selected={productStore.sceneType === type}
                      >
                        {type === 'studio-branding' ? 'Studio' :
                          type === 'editorial-product' ? 'Editorial' :
                            type === 'lifestyle-real' ? 'Lifestyle Real' : 'UGC'}
                      </Chip>
                    ))}
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Studio: neutral background. Editorial: stylized. Lifestyle Real: full environment. UGC: phone capture.
                  </p>
                </div>
              )}

              {/* PRESET TIER — Always visible first */}
              <div className={SECTION_GROUP_CLASS}>
                <p className={GROUP_LABEL_CLASS}>PRESET TIER</p>
                <div className="flex gap-2">
                  {(['basic', 'pro'] as const).map(tier => (
                    <Chip
                      key={tier}
                      onClick={() => {
                        productStore.setPresetTier(tier);
                        markSectionTouched('product-setup');
                      }}
                      selected={productStore.presetTier === tier}
                    >
                      {tier === 'basic' ? 'Basic' : 'Pro'}
                    </Chip>
                  ))}
                </div>
                <p className="text-[11px] text-gray-500 mt-1">
                  Pro unlocks advanced bundle modes and full prop density.
                </p>
              </div>

              {/* ============================================================
                   PRODUCT STUDIO CONTROLS (Studio Mode Only)
                   Basic/Pro Visibility System
                   ============================================================ */}
              {(productStore.sceneType === 'studio-branding' ||
                productStore.sceneType === 'editorial-product' ||
                productStore.sceneType === 'lifestyle-real') && (
                <>
                  {productStore.environmentContext == null && (
                    <>
                      {/* ═══════════════════════════════════════════════════════════
                          1. PHOTO MODE — What am I making?
                          Basic: 4 options | Pro: All options
                          ═══════════════════════════════════════════════════════════ */}
                      <div className={SECTION_GROUP_CLASS}>
                        <p className="text-[10px] uppercase tracking-[0.2em] font-extrabold text-gray-500 mb-2">PHOTO MODE</p>
                        <div className="flex flex-wrap gap-2">
                          {(productStore.presetTier === 'basic'
                            ? ['Hero Landing Page', 'Clear', 'Color Pop Hero', 'Ingredient Stack']
                            : [
                              'Hero Landing Page', 'Clear', 'Color Pop Hero', 'Ingredient Stack',
                              'Acrylic Blocks', 'Splash Shot',
                              'Tile & Spa', 'Foam & Texture', 'Routine Carousel', 'Pastel Picnic',
                              'Face Pop Close-Up', 'Sunrise Wellness Counter', 'Clinical Lab Counter',
                              'Golden Mist Aura', 'Outdoor Energy Boost', 'Crown Wellness Vanity',
                              'Candy Gradient Lab'
                            ]
                          ).map(mode => (
                            <button
                              key={mode}
                              title={mode}
                              onClick={() => {
                                productStore.setPhotoMode(mode);
                                markSectionTouched('product-setup');
                              }}
                              className={`px-4 py-2 rounded-xl text-[10px] font-bold border transition-all duration-300 ${productStore.photoMode === mode
                                ? 'bg-indigo-600 text-white border-indigo-600'
                                : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                                }`}
                              style={{ transitionTimingFunction: 'cubic-bezier(0.23,1,0.32,1)' }}
                            >
                              {mode}
                            </button>
                          ))}
                        </div>

                        {/* Ingredient Input — Only visible when Ingredient Stack is selected */}
                        {productStore.photoMode === 'Ingredient Stack' && (
                          <div className="mt-3 animate-in fade-in slide-in-from-top-2 duration-300">
                            <label className="text-[10px] uppercase tracking-[0.15em] text-gray-500 font-semibold block mb-1">
                              Ingredients to show
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. turmeric, ginger, vitamin C capsules"
                              value={productStore.props || ''}
                              onChange={(e) => {
                                productStore.setProps(e.target.value);
                                markSectionTouched('product-setup');
                              }}
                              className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 placeholder:text-gray-400"
                            />
                            <p className="text-[9px] text-gray-400 mt-1">These ingredients will appear as props around your product</p>

                            <div className="mt-3">
                              <label className="text-[10px] uppercase tracking-[0.15em] text-gray-500 font-semibold block mb-1">
                                Ingredient layout
                              </label>
                              <div className="flex flex-wrap gap-2">
                                {(
                                  [
                                    { value: 'auto', label: 'Auto' },
                                    { value: 'grounded', label: 'On base' },
                                    { value: 'floating', label: 'Floating' },
                                    { value: 'top-view', label: 'Top view' },
                                  ] as const
                                ).map(({ value, label }) => (
                                  <Chip
                                    key={value}
                                    selected={productStore.ingredientLayout === value}
                                    onClick={() => {
                                      productStore.setIngredientLayout(value);
                                      markSectionTouched('product-setup');
                                    }}
                                  >
                                    {label}
                                  </Chip>
                                ))}
                              </div>
                              <p className="text-[9px] text-gray-400 mt-1">
                                “On base” prevents floating ingredients. “Floating” makes powders airy (no piles). “Top view” works best with Top Down camera.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* STUDIO WARNING */}
                      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                        <p className="text-[11px] text-amber-700 font-medium">
                          Photo Studio uses controlled sets (no real-world location context).
                        </p>
                      </div>
                    </>
                  )}

                  {/* ═══════════════════════════════════════════════════════════
                      2. PRODUCT CONTEXT — What is the product?
                      Always visible in both Basic and Pro
                      ═══════════════════════════════════════════════════════════ */}
                  <div className={SECTION_GROUP_CLASS}>
                    <p className={GROUP_LABEL_CLASS}>PRODUCT IDENTITY</p>
                    <p className="text-[11px] text-gray-500 mt-1">
                      What the product is, physically and commercially.
                    </p>
                  </div>

                  <div className={SECTION_GROUP_CLASS}>
                    <p className={GROUP_LABEL_CLASS}>PRODUCT TYPE</p>
                    <div className="flex flex-wrap gap-2">
                      {PRODUCT_TYPE_OPTIONS.map(option => (
                        <Chip
                          key={option}
                          onClick={() => {
                            updateValue('productType', option as any);
                            markSectionTouched('product-setup');
                          }}
                          selected={
                            ({
                              Capsules: 'capsules',
                              Gummies: 'gummies',
                              Drops: 'drops',
                              Powder: 'powder',
                              Skincare: 'skincare',
                              Device: 'device',
                              Custom: 'custom',
                            } as const)[option] === productStore.definition.type
                          }
                        >
                          {option}
                        </Chip>
                      ))}
                    </div>
                    {values.productType === 'Custom' && (
                      <input
                        type="text"
                        value={values.productTypeCustom || ''}
                        onChange={e => {
                          updateValue('productTypeCustom', e.target.value);
                          markSectionTouched('product-setup');
                        }}
                        className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-500"
                        placeholder="Describe the product category (min 3 words)"
                      />
                    )}
                  </div>

                  <div className={SECTION_GROUP_CLASS}>
                    <p className={GROUP_LABEL_CLASS}>PACKAGING</p>
                    <div className="flex gap-2">
                      {(['Without box', 'With box'] as const).map(option => (
                        <Chip
                          key={option}
                          onClick={() => {
                            updateValue('productPackaging', option);
                            markSectionTouched('product-setup');
                          }}
                          selected={
                            option === 'With box'
                              ? productStore.packagingMode === 'with-box'
                              : productStore.packagingMode === 'without-box'
                          }
                        >
                          {option}
                        </Chip>
                      ))}
                    </div>
                  </div>

                  <div className={SECTION_GROUP_CLASS}>
                    <p className={GROUP_LABEL_CLASS}>PHYSICAL SCALE</p>
                    <div className="flex flex-wrap gap-2">
                      {(['Small handheld', 'Medium tabletop', 'Large object'] as const).map(option => (
                        <Chip
                          key={option}
                          onClick={() => {
                            updateValue('productScale', option);
                            markSectionTouched('product-setup');
                          }}
                          selected={
                            (option === 'Small handheld' && productStore.physicalScaleLabel === 'small-handheld') ||
                            (option === 'Medium tabletop' && productStore.physicalScaleLabel === 'medium-tabletop') ||
                            (option === 'Large object' && productStore.physicalScaleLabel === 'large-object')
                          }
                        >
                          {option}
                        </Chip>
                      ))}
                    </div>
                  </div>

                  <div className={SECTION_GROUP_CLASS}>
                    <p className={GROUP_LABEL_CLASS}>COMPOSITION BASICS</p>
                    <p className="text-[11px] text-gray-500 mt-1">
                      High-level layout decisions before creative styling.
                    </p>
                  </div>

                  {/* ═══════════════════════════════════════════════════════════
                      3. COMPOSITION — How is it framed?
                      Basic: Centered, Left + space, Right + space
                      ═══════════════════════════════════════════════════════════ */}
                  <div className={SECTION_GROUP_CLASS}>
                    <p className={GROUP_LABEL_CLASS}>COMPOSITION</p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { key: 'centered', label: 'Centered' },
                        { key: 'left-space', label: 'Left + space' },
                        { key: 'right-space', label: 'Right + space' }
                      ].map(({ key, label }) => (
                        <Chip
                          key={key}
                          onClick={() => {
                            productStore.setAlignment(key as any);
                            // Keep prompt coherent: alignment drives composition + negative space.
                            if (key === 'centered') {
                              productStore.setComposition('centered' as any);
                              productStore.setNegativeSpace('none' as any);
                            } else {
                              productStore.setComposition('asymmetrical' as any);
                              productStore.setNegativeSpace('intentional' as any);
                            }
                            markSectionTouched('product-setup');
                          }}
                          selected={productStore.alignment === key || (key === 'centered' && productStore.alignment === 'center')}
                        >
                          {label}
                        </Chip>
                      ))}
                    </div>

                    {/* ADVANCED COMPOSITION — Pro only extension */}
                    {productStore.presetTier === 'pro' && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-[9px] uppercase tracking-[0.15em] text-gray-400 mb-2">ADVANCED</p>
                        <div className="flex flex-wrap gap-2">
                          {[
                            { key: 'rule-of-thirds', label: 'Rule of thirds' },
                            { key: 'asymmetrical', label: 'Asymmetrical' },
                            { key: 'flat-lay', label: 'Flat lay' },
                            { key: 'pedestal', label: 'Pedestal' }
                          ].map(({ key, label }) => (
                            <Chip
                              key={key}
                              onClick={() => {
                                const compositionMap: Record<string, CompositionMode> = {
                                  'rule-of-thirds': 'thirds',
                                  'asymmetrical': 'asymmetrical',
                                  'flat-lay': 'flatlay',
                                  'pedestal': 'pedestal',
                                };
                                const mapped = compositionMap[key];
                                if (mapped) {
                                  productStore.setComposition(mapped);
                                  productStore.setNegativeSpace('none');
                                }
                                markSectionTouched('product-setup');
                              }}
                              selected={
                                (key === 'rule-of-thirds' && productStore.composition === 'thirds') ||
                                (key === 'asymmetrical' && productStore.composition === 'asymmetrical') ||
                                (key === 'flat-lay' && productStore.composition === 'flatlay') ||
                                (key === 'pedestal' && productStore.composition === 'pedestal')
                              }
                            >
                              {label}
                            </Chip>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ═══════════════════════════════════════════════════════════
                      4. APPEARANCE — How does it look?
                      Background + Shadow always visible
                      ═══════════════════════════════════════════════════════════ */}
                  <div className={SECTION_GROUP_CLASS}>
                    <p className={GROUP_LABEL_CLASS}>BACKGROUND</p>
                    <div className="flex gap-6">
                      {/* Background Color */}
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <input
                            type="color"
                            value={/^#[0-9a-fA-F]{6}$/.test(productStore.backgroundColor || '') ? productStore.backgroundColor : '#ffffff'}
                            onChange={(e) => {
                              productStore.setBackgroundColor(e.target.value);
                              markSectionTouched('product-setup');
                            }}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <div
                            className="w-9 h-9 rounded-full border-2 border-gray-200 cursor-pointer transition-all duration-200 hover:scale-110 hover:border-gray-400"
                            style={{ backgroundColor: (/^#[0-9a-fA-F]{6}$/.test(productStore.backgroundColor || '') ? productStore.backgroundColor : '#ffffff') }}
                          />
                        </div>
                        <input
                          type="text"
                          value={productStore.backgroundColor || '#ffffff'}
                          onChange={(e) => {
                            productStore.setBackgroundColor(e.target.value);
                            markSectionTouched('product-setup');
                          }}
                          placeholder="#ffffff"
                          className="w-20 px-2 py-1 text-xs font-mono bg-white border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        <span className="text-[10px] text-gray-400">BG</span>
                      </div>

                      {/* Accent Color */}
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <input
                            type="color"
                            value={/^#[0-9a-fA-F]{6}$/.test(productStore.accentColor || '') ? productStore.accentColor : '#6366f1'}
                            onChange={(e) => {
                              productStore.setAccentColor(e.target.value);
                              markSectionTouched('product-setup');
                            }}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <div
                            className="w-9 h-9 rounded-full border-2 border-gray-200 cursor-pointer transition-all duration-200 hover:scale-110 hover:border-gray-400"
                            style={{ backgroundColor: (/^#[0-9a-fA-F]{6}$/.test(productStore.accentColor || '') ? productStore.accentColor : '#6366f1') }}
                          />
                        </div>
                        <input
                          type="text"
                          value={productStore.accentColor || '#6366f1'}
                          onChange={(e) => {
                            productStore.setAccentColor(e.target.value);
                            markSectionTouched('product-setup');
                          }}
                          placeholder="#6366f1"
                          className="w-20 px-2 py-1 text-xs font-mono bg-white border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        <span className="text-[10px] text-gray-400">Accent</span>
                      </div>
                    </div>
                  </div>

                  <div className={SECTION_GROUP_CLASS}>
                    <p className={GROUP_LABEL_CLASS}>SHADOW STYLE</p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { key: 'soft-drop', label: 'Soft' },
                        { key: 'hard-drop', label: 'Hard' },
                        { key: 'floating', label: 'Floating' }
                      ].map(({ key, label }) => (
                        <Chip
                          key={key}
                          onClick={() => {
                            productStore.setShadow(key as 'soft-drop' | 'hard-drop' | 'floating');
                            markSectionTouched('product-setup');
                          }}
                          selected={productStore.shadow === key}
                        >
                          {label}
                        </Chip>
                      ))}
                    </div>
                  </div>

                  {/* ═══════════════════════════════════════════════════════════
                      5. PRO ONLY — Advanced Controls
                      Hidden in Basic mode, revealed progressively in Pro
                      ═══════════════════════════════════════════════════════════ */}
                  {productStore.presetTier === 'pro' && (
                    <>
                      {/* PRO PHOTOGRAPHER MODE */}
                      <div className={SECTION_GROUP_CLASS}>
                        <div className="flex items-center justify-between gap-3 mb-3">
                          <div>
                            <p className={GROUP_LABEL_CLASS}>PRO PHOTOGRAPHER MODE</p>
                          </div>
                          <Toggle
                            checked={productStore.proMode}
                            onCheckedChange={(next) => {
                              productStore.setProMode(next);
                              markSectionTouched('product-setup');
                            }}
                            aria-label="Pro photographer mode"
                          />
                        </div>

                        <div
                          className={`overflow-hidden transition-all duration-500 ${productStore.proMode ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
                            }`}
                          style={{ transitionTimingFunction: 'cubic-bezier(0.23,1,0.32,1)' }}
                        >
                          <div className="space-y-4 pl-3 border-l-2 border-indigo-300">
                            <div>
                              <p className="text-[10px] uppercase tracking-[0.2em] font-extrabold text-gray-500 mb-2">LENS</p>
                              <div className="flex flex-wrap gap-2">
                                {[
                                  '100mm Macro Prime', '50mm Product Prime', 'Tilt-Shift Hero',
                                  'Ultra-Wide Stylized', 'Cinema Zoom', '70-200mm Compression',
                                  '35mm Anamorphic Glow'
                                ].map(lens => (
                                  <button
                                    key={lens}
                                    onClick={() => {
                                      productStore.setLens(lens);
                                      markSectionTouched('product-setup');
                                    }}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all duration-300 ${productStore.lens === lens
                                      ? 'bg-indigo-600 text-white border-indigo-600'
                                      : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                                      }`}
                                    style={{ transitionTimingFunction: 'cubic-bezier(0.23,1,0.32,1)' }}
                                  >
                                    {lens}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div>
                              <p className="text-[10px] uppercase tracking-[0.2em] font-extrabold text-gray-500 mb-2">LIGHTING RIG</p>
                              <div className="flex flex-wrap gap-2">
                                {([
                                  { value: 'Three-Point Beauty', label: '3-Point Beauty Dish' },
                                  { value: 'Softbox Wrap', label: 'Softbox Wrap' },
                                  { value: 'Hard Edge Gels', label: 'Hard Edge Gels' },
                                  { value: 'Backlit Acrylic', label: 'Backlit Acrylic' },
                                  { value: 'High-Speed Splash Rig', label: 'High-Speed Splash Rig' },
                                  { value: 'Gradient Cyclorama', label: 'Gradient Cyclorama' },
                                  { value: 'Prism Spotlight Duo', label: 'Prism Spotlight Duo' },
                                ] as const).map(({ value, label }) => (
                                  <button
                                    key={value}
                                    onClick={() => {
                                      productStore.setLightingRig(value);
                                      markSectionTouched('product-setup');
                                    }}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all duration-300 ${productStore.lightingRig === value
                                      ? 'bg-indigo-600 text-white border-indigo-600'
                                      : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                                      }`}
                                    style={{ transitionTimingFunction: 'cubic-bezier(0.23,1,0.32,1)' }}
                                  >
                                    {label}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div>
                              <p className="text-[10px] uppercase tracking-[0.2em] font-extrabold text-gray-500 mb-2">FINISH / TREATMENT</p>
                              <div className="flex flex-wrap gap-2">
                                {[
                                  'High-Gloss Commercial', 'Film Grain Luxury', 'Matte Editorial',
                                  'Hyperreal CGI Blend', 'Clinical Lab Polish', 'Vibrant Color Pop'
                                ].map(finish => (
                                  <button
                                    key={finish}
                                    onClick={() => {
                                      productStore.setFinish(finish);
                                      markSectionTouched('product-setup');
                                    }}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all duration-300 ${productStore.finish === finish
                                      ? 'bg-indigo-600 text-white border-indigo-600'
                                      : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                                      }`}
                                    style={{ transitionTimingFunction: 'cubic-bezier(0.23,1,0.32,1)' }}
                                  >
                                    {finish}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* CREATIVE DIRECTION — All creativity controls unified */}
                      <div className={SECTION_GROUP_CLASS}>
                        <p className={GROUP_LABEL_CLASS}>CREATIVE DIRECTION</p>
                        <div className="space-y-3">
                          <div>
                            <p className="text-[9px] uppercase tracking-[0.15em] text-gray-400 mb-2">CREATIVITY LEVEL</p>
                            <div className="flex gap-2">
                              {([0, 1, 2, 3] as const).map(level => (
                                <Chip
                                  key={level}
                                  onClick={() => {
                                    productStore.setCreativityLevel(level);
                                    markSectionTouched('product-setup');
                                  }}
                                  selected={productStore.creativityLevel === level}
                                >
                                  {level === 0 ? 'Locked' : level === 1 ? 'Low' : level === 2 ? 'Medium' : 'High'}
                                </Chip>
                              ))}
                            </div>
                          </div>

                          <div>
                            <p className="text-[9px] uppercase tracking-[0.15em] text-gray-400 mb-2">PROPS</p>
                            <input
                              type="text"
                              value={productStore.props}
                              onChange={(e) => {
                                productStore.setProps(e.target.value);
                                markSectionTouched('product-setup');
                              }}
                              placeholder="e.g., pineapple, lavender sprigs"
                              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
                            />
                          </div>

                        </div>
                      </div>
                    </>
                  )}

                </>
              )}
            </div>
          </SmoothAccordion>

          {/* PHYSICAL PROPERTIES - Contextual per Product Type */}
          {values.productType && (
            <SmoothAccordion
              icon={Layers}
              title="02 / Physical Properties"
              tooltip="Configure the real, physical appearance of the product itself."
              isOpen={openAccordionId === 'physical-props'}
              onToggle={() => toggleSection('physical-props')}
              isTouched={touchedSections.has('physical-props')}
              variant="primary"
            >
              <div className="space-y-4">
                <p className="text-sm text-gray-500">
                  Configure the real, physical appearance of the product itself.
                </p>
                {/* CAPSULES PHYSICAL */}
                {values.productType === 'Capsules' && (
                  <>
                    <div className={SECTION_GROUP_CLASS}>
                      <p className={GROUP_LABEL_CLASS}>CAPSULE STYLE</p>
                      <div className="flex flex-wrap gap-2">
                        {(['veggie', 'gel', 'white-opaque', 'colored'] as const).map(style => (
                          <Chip
                            key={style}
                            onClick={() => {
                              productStore.setPhysicalProperty('capsuleStyle', style);
                              markSectionTouched('physical-props');
                            }}
                            selected={(productStore.definition.physical as any)?.v?.capsuleStyle === style}
                          >
                            {style === 'veggie' ? 'Veggie' : style === 'gel' ? 'Gel' : style === 'white-opaque' ? 'White Opaque' : 'Colored'}
                          </Chip>
                        ))}
                      </div>
                    </div>

                    <div className={SECTION_GROUP_CLASS}>
                      <p className={GROUP_LABEL_CLASS}>CAPSULE CONTENT COLOR</p>
                      <div className="flex items-center gap-4">
                        <label className="relative">
                          <span
                            className="block h-10 w-10 rounded-full border-2 border-gray-200 cursor-pointer "
                            style={{ background: (productStore.definition.physical as any)?.v?.capsuleContentColor?.hex || '#FFFFFF' }}
                          />
                          <input
                            type="color"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            value={(productStore.definition.physical as any)?.v?.capsuleContentColor?.hex || '#FFFFFF'}
                            onChange={e => {
                              productStore.setPhysicalColor('capsuleContentColor', e.target.value);
                              markSectionTouched('physical-props');
                            }}
                          />
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. beige, brown, green"
                          value={(productStore.definition.physical as any)?.v?.capsuleContentColor?.semanticName || ''}
                          onChange={e => {
                            productStore.setPhysicalColorName('capsuleContentColor', e.target.value);
                            markSectionTouched('physical-props');
                          }}
                          className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                        />
                      </div>
                    </div>

                    <div className={SECTION_GROUP_CLASS}>
                      <p className={GROUP_LABEL_CLASS}>QUANTITY</p>
                      <div className="flex gap-2">
                        {([1, 2, 3, 4, 6] as const).map(qty => (
                          <Chip
                            key={qty}
                            onClick={() => {
                              productStore.setPhysicalProperty('quantity', qty);
                              markSectionTouched('physical-props');
                            }}
                            selected={(productStore.definition.physical as any)?.v?.quantity === qty}
                          >
                            {qty}
                          </Chip>
                        ))}
                      </div>
                    </div>

                    <div className={SECTION_GROUP_CLASS}>
                      <p className={GROUP_LABEL_CLASS}>LAYOUT</p>
                      <div className="flex gap-2">
                        {(['scattered', 'grouped', 'stacked'] as const).map(layout => (
                          <Chip
                            key={layout}
                            onClick={() => {
                              productStore.setPhysicalProperty('layout', layout);
                              markSectionTouched('physical-props');
                            }}
                            selected={(productStore.definition.physical as any)?.v?.layout === layout}
                          >
                            {layout.charAt(0).toUpperCase() + layout.slice(1)}
                          </Chip>
                        ))}
                      </div>
                    </div>

                    <div className={SECTION_GROUP_CLASS}>
                      <p className={GROUP_LABEL_CLASS}>OPTIONAL PROPS</p>
                      <div className="flex gap-2">
                        <Chip
                          onClick={() => {
                            productStore.setPhysicalProperty('glassOfWater', !(productStore.definition.physical as any)?.v?.glassOfWater);
                            markSectionTouched('physical-props');
                          }}
                          selected={(productStore.definition.physical as any)?.v?.glassOfWater}
                        >
                          Glass of Water
                        </Chip>
                        <Chip
                          onClick={() => {
                            productStore.setPhysicalProperty('spoon', !(productStore.definition.physical as any)?.v?.spoon);
                            markSectionTouched('physical-props');
                          }}
                          selected={(productStore.definition.physical as any)?.v?.spoon}
                        >
                          Spoon
                        </Chip>
                      </div>
                    </div>
                  </>
                )}

                {/* GUMMIES PHYSICAL */}
                {values.productType === 'Gummies' && (
                  <>
                    <div className={SECTION_GROUP_CLASS}>
                      <p className={GROUP_LABEL_CLASS}>GUMMY COLOR</p>
                      <div className="flex items-center gap-4">
                        <label className="relative">
                          <span
                            className="block h-10 w-10 rounded-full border-2 border-gray-200 cursor-pointer "
                            style={{ background: (productStore.definition.physical as any)?.v?.gummyColor?.hex || '#FF6B6B' }}
                          />
                          <input
                            type="color"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            value={(productStore.definition.physical as any)?.v?.gummyColor?.hex || '#FF6B6B'}
                            onChange={e => {
                              productStore.setPhysicalColor('gummyColor', e.target.value);
                              markSectionTouched('physical-props');
                            }}
                          />
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. orange, pink, purple"
                          value={(productStore.definition.physical as any)?.v?.gummyColor?.semanticName || ''}
                          onChange={e => {
                            productStore.setPhysicalColorName('gummyColor', e.target.value);
                            markSectionTouched('physical-props');
                          }}
                          className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                        />
                      </div>
                    </div>

                    <div className={SECTION_GROUP_CLASS}>
                      <p className={GROUP_LABEL_CLASS}>SHAPE</p>
                      <div className="flex gap-2">
                        {(['bear', 'cube', 'drop', 'generic'] as const).map(shape => (
                          <Chip
                            key={shape}
                            onClick={() => {
                              productStore.setPhysicalProperty('shape', shape);
                              markSectionTouched('physical-props');
                            }}
                            selected={(productStore.definition.physical as any)?.v?.shape === shape}
                          >
                            {shape.charAt(0).toUpperCase() + shape.slice(1)}
                          </Chip>
                        ))}
                      </div>
                    </div>

                    <div className={SECTION_GROUP_CLASS}>
                      <p className={GROUP_LABEL_CLASS}>QUANTITY</p>
                      <div className="flex gap-2">
                        {([3, 5, 7, 'handful'] as const).map(qty => (
                          <Chip
                            key={qty}
                            onClick={() => {
                              productStore.setPhysicalProperty('quantity', qty);
                              markSectionTouched('physical-props');
                            }}
                            selected={(productStore.definition.physical as any)?.v?.quantity === qty}
                          >
                            {qty === 'handful' ? 'Handful' : qty}
                          </Chip>
                        ))}
                      </div>
                    </div>

                    <div className={SECTION_GROUP_CLASS}>
                      <p className={GROUP_LABEL_CLASS}>OPTIONAL PROPS</p>
                      <div className="flex gap-2">
                        <Chip
                          onClick={() => {
                            productStore.setPhysicalProperty('bowl', !(productStore.definition.physical as any)?.v?.bowl);
                            markSectionTouched('physical-props');
                          }}
                          selected={(productStore.definition.physical as any)?.v?.bowl}
                        >
                          Bowl
                        </Chip>
                        <Chip
                          onClick={() => {
                            productStore.setPhysicalProperty('plate', !(productStore.definition.physical as any)?.v?.plate);
                            markSectionTouched('physical-props');
                          }}
                          selected={(productStore.definition.physical as any)?.v?.plate}
                        >
                          Plate
                        </Chip>
                      </div>
                    </div>
                  </>
                )}

                {/* DROPS PHYSICAL */}
                {values.productType === 'Drops' && (
                  <>
                    <div className={SECTION_GROUP_CLASS}>
                      <p className={GROUP_LABEL_CLASS}>LIQUID COLOR</p>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {(['amber', 'transparent', 'custom'] as const).map(mode => (
                          <Chip
                            key={mode}
                            onClick={() => {
                              productStore.setPhysicalProperty('liquidColorMode', mode);
                              markSectionTouched('physical-props');
                            }}
                            selected={(productStore.definition.physical as any)?.v?.liquidColorMode === mode}
                          >
                            {mode.charAt(0).toUpperCase() + mode.slice(1)}
                          </Chip>
                        ))}
                      </div>
                      {(productStore.definition.physical as any)?.v?.liquidColorMode === 'custom' && (
                        <div className="flex items-center gap-4 mt-2">
                          <label className="relative">
                            <span
                              className="block h-10 w-10 rounded-full border-2 border-gray-200 cursor-pointer "
                              style={{ background: (productStore.definition.physical as any)?.v?.liquidCustomColor?.hex || '#FFD700' }}
                            />
                            <input
                              type="color"
                              className="absolute inset-0 opacity-0 cursor-pointer"
                              value={(productStore.definition.physical as any)?.v?.liquidCustomColor?.hex || '#FFD700'}
                              onChange={e => {
                                productStore.setPhysicalColor('liquidCustomColor', e.target.value);
                                markSectionTouched('physical-props');
                              }}
                            />
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. golden, green, clear"
                            value={(productStore.definition.physical as any)?.v?.liquidCustomColor?.semanticName || ''}
                            onChange={e => {
                              productStore.setPhysicalColorName('liquidCustomColor', e.target.value);
                              markSectionTouched('physical-props');
                            }}
                            className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                          />
                        </div>
                      )}
                    </div>

                    <div className={SECTION_GROUP_CLASS}>
                      <p className={GROUP_LABEL_CLASS}>DROPPER STATE</p>
                      <div className="flex flex-wrap gap-2">
                        {(['closed', 'open-resting', 'drop-suspended'] as const).map(state => (
                          <Chip
                            key={state}
                            onClick={() => {
                              productStore.setPhysicalProperty('dropperState', state);
                              markSectionTouched('physical-props');
                            }}
                            selected={(productStore.definition.physical as any)?.v?.dropperState === state}
                          >
                            {state === 'closed' ? 'Closed' : state === 'open-resting' ? 'Open Resting' : 'Drop Suspended'}
                          </Chip>
                        ))}
                      </div>
                    </div>

                    <div className={SECTION_GROUP_CLASS}>
                      <p className={GROUP_LABEL_CLASS}>INTERACTION MODE</p>
                      <div className="flex gap-2">
                        {(['sublingual', 'mixed'] as const).map(mode => (
                          <Chip
                            key={mode}
                            onClick={() => {
                              productStore.setPhysicalProperty('interactionMode', mode);
                              markSectionTouched('physical-props');
                            }}
                            selected={(productStore.definition.physical as any)?.v?.interactionMode === mode}
                          >
                            {mode === 'sublingual' ? 'Sublingual (dropper only)' : 'Mixed (glass/tea/water)'}
                          </Chip>
                        ))}
                      </div>
                    </div>

                    {(productStore.definition.physical as any)?.v?.interactionMode === 'mixed' && (
                      <div className={SECTION_GROUP_CLASS}>
                        <p className={GROUP_LABEL_CLASS}>ALLOWED PROPS</p>
                        <div className="flex gap-2">
                          <Chip
                            onClick={() => {
                              productStore.setPhysicalProperty('glass', !(productStore.definition.physical as any)?.v?.glass);
                              markSectionTouched('physical-props');
                            }}
                            selected={(productStore.definition.physical as any)?.v?.glass}
                          >
                            Glass
                          </Chip>
                          <Chip
                            onClick={() => {
                              productStore.setPhysicalProperty('teaCup', !(productStore.definition.physical as any)?.v?.teaCup);
                              markSectionTouched('physical-props');
                            }}
                            selected={(productStore.definition.physical as any)?.v?.teaCup}
                          >
                            Tea Cup
                          </Chip>
                          <Chip
                            onClick={() => {
                              productStore.setPhysicalProperty('minimalSpoon', !(productStore.definition.physical as any)?.v?.minimalSpoon);
                              markSectionTouched('physical-props');
                            }}
                            selected={(productStore.definition.physical as any)?.v?.minimalSpoon}
                          >
                            Minimal Spoon
                          </Chip>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* POWDER PHYSICAL */}
                {values.productType === 'Powder' && (
                  <>
                    <div className={SECTION_GROUP_CLASS}>
                      <p className={GROUP_LABEL_CLASS}>POWDER COLOR</p>
                      <div className="flex items-center gap-4">
                        <label className="relative">
                          <span
                            className="block h-10 w-10 rounded-full border-2 border-gray-200 cursor-pointer "
                            style={{ background: (productStore.definition.physical as any)?.v?.powderColor?.hex || '#F5F5DC' }}
                          />
                          <input
                            type="color"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            value={(productStore.definition.physical as any)?.v?.powderColor?.hex || '#F5F5DC'}
                            onChange={e => {
                              productStore.setPhysicalColor('powderColor', e.target.value);
                              markSectionTouched('physical-props');
                            }}
                          />
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. white, beige, green"
                          value={(productStore.definition.physical as any)?.v?.powderColor?.semanticName || ''}
                          onChange={e => {
                            productStore.setPhysicalColorName('powderColor', e.target.value);
                            markSectionTouched('physical-props');
                          }}
                          className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                        />
                      </div>
                    </div>

                    <div className={SECTION_GROUP_CLASS}>
                      <p className={GROUP_LABEL_CLASS}>TEXTURE</p>
                      <div className="flex gap-2">
                        {(['fine', 'grainy'] as const).map(tex => (
                          <Chip
                            key={tex}
                            onClick={() => {
                              productStore.setPhysicalProperty('texture', tex);
                              markSectionTouched('physical-props');
                            }}
                            selected={(productStore.definition.physical as any)?.v?.texture === tex}
                          >
                            {tex.charAt(0).toUpperCase() + tex.slice(1)}
                          </Chip>
                        ))}
                      </div>
                    </div>

                    <div className={SECTION_GROUP_CLASS}>
                      <p className={GROUP_LABEL_CLASS}>PRESENTATION</p>
                      <div className="flex flex-wrap gap-2">
                        {(['loose-pile', 'in-scoop', 'in-container-rim'] as const).map(pres => (
                          <Chip
                            key={pres}
                            onClick={() => {
                              productStore.setPhysicalProperty('presentation', pres);
                              markSectionTouched('physical-props');
                            }}
                            selected={(productStore.definition.physical as any)?.v?.presentation === pres}
                          >
                            {pres === 'loose-pile' ? 'Loose Pile' : pres === 'in-scoop' ? 'In Scoop' : 'Container Rim'}
                          </Chip>
                        ))}
                      </div>
                    </div>

                    <div className={SECTION_GROUP_CLASS}>
                      <p className={GROUP_LABEL_CLASS}>MIX MODE</p>
                      <div className="flex flex-wrap gap-2">
                        {(['water', 'tea', 'coffee', 'smoothie'] as const).map(mode => (
                          <Chip
                            key={mode}
                            onClick={() => {
                              productStore.setPhysicalProperty('mixMode', mode);
                              markSectionTouched('physical-props');
                            }}
                            selected={(productStore.definition.physical as any)?.v?.mixMode === mode}
                          >
                            {mode.charAt(0).toUpperCase() + mode.slice(1)}
                          </Chip>
                        ))}
                      </div>
                    </div>

                    <div className={SECTION_GROUP_CLASS}>
                      <p className={GROUP_LABEL_CLASS}>PROPS</p>
                      <div className="flex gap-2">
                        <Chip
                          onClick={() => {
                            productStore.setPhysicalProperty('cupOrMug', !(productStore.definition.physical as any)?.v?.cupOrMug);
                            markSectionTouched('physical-props');
                          }}
                          selected={(productStore.definition.physical as any)?.v?.cupOrMug}
                        >
                          Cup/Mug
                        </Chip>
                        <Chip
                          onClick={() => {
                            productStore.setPhysicalProperty('scoop', !(productStore.definition.physical as any)?.v?.scoop);
                            markSectionTouched('physical-props');
                          }}
                          selected={(productStore.definition.physical as any)?.v?.scoop}
                        >
                          Scoop
                        </Chip>
                        <Chip
                          onClick={() => {
                            productStore.setPhysicalProperty('spoon', !(productStore.definition.physical as any)?.v?.spoon);
                            markSectionTouched('physical-props');
                          }}
                          selected={(productStore.definition.physical as any)?.v?.spoon}
                        >
                          Spoon
                        </Chip>
                      </div>
                    </div>
                  </>
                )}

                {/* SKINCARE PHYSICAL */}
                {values.productType === 'Skincare' && (
                  <>
                    <div className={SECTION_GROUP_CLASS}>
                      <p className={GROUP_LABEL_CLASS}>SUBTYPE</p>
                      <div className="flex flex-wrap gap-2">
                        {(['cream', 'serum', 'shampoo', 'cleanser'] as const).map(sub => (
                          <Chip
                            key={sub}
                            onClick={() => {
                              productStore.setPhysicalProperty('subtype', sub);
                              markSectionTouched('physical-props');
                            }}
                            selected={(productStore.definition.physical as any)?.v?.subtype === sub}
                          >
                            {sub.charAt(0).toUpperCase() + sub.slice(1)}
                          </Chip>
                        ))}
                      </div>
                    </div>

                    <div className={SECTION_GROUP_CLASS}>
                      <p className={GROUP_LABEL_CLASS}>TEXTURE</p>
                      <div className="flex gap-2">
                        {(['glossy', 'matte'] as const).map(tex => (
                          <Chip
                            key={tex}
                            onClick={() => {
                              productStore.setPhysicalProperty('texture', tex);
                              markSectionTouched('physical-props');
                            }}
                            selected={(productStore.definition.physical as any)?.v?.texture === tex}
                          >
                            {tex.charAt(0).toUpperCase() + tex.slice(1)}
                          </Chip>
                        ))}
                      </div>
                    </div>

                    <div className={SECTION_GROUP_CLASS}>
                      <p className={GROUP_LABEL_CLASS}>PRODUCT COLOR</p>
                      <div className="flex items-center gap-4">
                        <label className="relative">
                          <span
                            className="block h-10 w-10 rounded-full border-2 border-gray-200 cursor-pointer "
                            style={{ background: (productStore.definition.physical as any)?.v?.color?.hex || '#FFFFFF' }}
                          />
                          <input
                            type="color"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            value={(productStore.definition.physical as any)?.v?.color?.hex || '#FFFFFF'}
                            onChange={e => {
                              productStore.setPhysicalColor('color', e.target.value);
                              markSectionTouched('physical-props');
                            }}
                          />
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. white, cream, clear"
                          value={(productStore.definition.physical as any)?.v?.color?.semanticName || ''}
                          onChange={e => {
                            productStore.setPhysicalColorName('color', e.target.value);
                            markSectionTouched('physical-props');
                          }}
                          className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                        />
                      </div>
                    </div>

                    <div className={SECTION_GROUP_CLASS}>
                      <p className={GROUP_LABEL_CLASS}>DISPERSION</p>
                      <div className="flex gap-2">
                        {(['drop', 'smear', 'dollop'] as const).map(disp => (
                          <Chip
                            key={disp}
                            onClick={() => {
                              productStore.setPhysicalProperty('dispersion', disp);
                              markSectionTouched('physical-props');
                            }}
                            selected={(productStore.definition.physical as any)?.v?.dispersion === disp}
                          >
                            {disp.charAt(0).toUpperCase() + disp.slice(1)}
                          </Chip>
                        ))}
                      </div>
                    </div>

                    <div className={SECTION_GROUP_CLASS}>
                      <p className={GROUP_LABEL_CLASS}>PROPS</p>
                      <div className="flex gap-2">
                        <Chip
                          onClick={() => {
                            productStore.setPhysicalProperty('towel', !(productStore.definition.physical as any)?.v?.towel);
                            markSectionTouched('physical-props');
                          }}
                          selected={(productStore.definition.physical as any)?.v?.towel}
                        >
                          Towel
                        </Chip>
                        <Chip
                          onClick={() => {
                            productStore.setPhysicalProperty('sink', !(productStore.definition.physical as any)?.v?.sink);
                            markSectionTouched('physical-props');
                          }}
                          selected={(productStore.definition.physical as any)?.v?.sink}
                        >
                          Sink
                        </Chip>
                        <Chip
                          onClick={() => {
                            productStore.setPhysicalProperty('minimalSurfaceOnly', !(productStore.definition.physical as any)?.v?.minimalSurfaceOnly);
                            markSectionTouched('physical-props');
                          }}
                          selected={(productStore.definition.physical as any)?.v?.minimalSurfaceOnly}
                        >
                          Minimal Surface Only
                        </Chip>
                      </div>
                    </div>
                  </>
                )}

                {/* DEVICE / CUSTOM PHYSICAL */}
                {(values.productType === 'Device' || values.productType === 'Custom') && (
                  <>
                    <div className={SECTION_GROUP_CLASS}>
                      <p className={GROUP_LABEL_CLASS}>MATERIAL</p>
                      <div className="flex flex-wrap gap-2">
                        {(['plastic', 'metal', 'glass', 'rubber', 'mixed'] as const).map(mat => (
                          <Chip
                            key={mat}
                            onClick={() => {
                              productStore.setPhysicalProperty('material', mat);
                              markSectionTouched('physical-props');
                            }}
                            selected={(productStore.definition.physical as any)?.v?.material === mat}
                          >
                            {mat.charAt(0).toUpperCase() + mat.slice(1)}
                          </Chip>
                        ))}
                      </div>
                    </div>

                    <div className={SECTION_GROUP_CLASS}>
                      <p className={GROUP_LABEL_CLASS}>PRODUCT COLOR</p>
                      <div className="flex items-center gap-4">
                        <label className="relative">
                          <span
                            className="block h-10 w-10 rounded-full border-2 border-gray-200 cursor-pointer "
                            style={{ background: (productStore.definition.physical as any)?.v?.color?.hex || '#333333' }}
                          />
                          <input
                            type="color"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            value={(productStore.definition.physical as any)?.v?.color?.hex || '#333333'}
                            onChange={e => {
                              productStore.setPhysicalColor('color', e.target.value);
                              markSectionTouched('physical-props');
                            }}
                          />
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. black, white, silver"
                          value={(productStore.definition.physical as any)?.v?.color?.semanticName || ''}
                          onChange={e => {
                            productStore.setPhysicalColorName('color', e.target.value);
                            markSectionTouched('physical-props');
                          }}
                          className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                        />
                      </div>
                    </div>

                    <div className={SECTION_GROUP_CLASS}>
                      <p className={GROUP_LABEL_CLASS}>SCALE</p>
                      <div className="flex gap-2">
                        {(['small', 'medium', 'large'] as const).map(scale => (
                          <Chip
                            key={scale}
                            onClick={() => {
                              productStore.setPhysicalProperty('scale', scale);
                              markSectionTouched('physical-props');
                            }}
                            selected={(productStore.definition.physical as any)?.v?.scale === scale}
                          >
                            {scale.charAt(0).toUpperCase() + scale.slice(1)}
                          </Chip>
                        ))}
                      </div>
                    </div>

                    <p className="text-[11px] text-gray-500 mt-2">
                      Device/Custom: Automatic props disabled. Only color, scale, and material configurable.
                    </p>
                  </>
                )}
              </div>
            </SmoothAccordion>
          )}

          <SmoothAccordion
            icon={Activity}
            title="03 / Product State & Motion"
            tooltip="Describe what the product is doing. Product-only—no human implied."
            isOpen={openAccordionId === 'product-state-motion'}
            onToggle={() => toggleSection('product-state-motion')}
            isTouched={touchedSections.has('product-state-motion')}
            variant="primary"
          >
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Product State & Motion describe what the product is doing. Product Interaction describes what hands are doing.
              </p>

              <div className={SECTION_GROUP_CLASS}>
                <p className={GROUP_LABEL_CLASS}>PRODUCT STATE & MOTION</p>
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      { value: 'static', label: 'Static', detail: 'Closed and stationary.' },
                      { value: 'opened', label: 'Opened', detail: 'Open container. No motion.' },
                      { value: 'spilled', label: 'Spilled', detail: 'Contents spilled on surface.' },
                      { value: 'dispensed', label: 'Dispensed', detail: 'Controlled amount released.' },
                      { value: 'pouring', label: 'Pouring', detail: 'Stream falling downward.' },
                      { value: 'falling', label: 'Falling', detail: 'Discrete items falling mid-air.' },
                    ] as const
                  ).map(option => {
                    const type = productStore.definition.type;
                    const allowedByType = (() => {
                      switch (type) {
                        case 'capsules':
                          return (
                            option.value === 'static' ||
                            option.value === 'opened' ||
                            option.value === 'spilled' ||
                            option.value === 'dispensed' ||
                            option.value === 'falling'
                          );
                        case 'gummies':
                          return (
                            option.value === 'static' ||
                            option.value === 'opened' ||
                            option.value === 'spilled' ||
                            option.value === 'dispensed' ||
                            option.value === 'falling'
                          );
                        case 'drops':
                          return option.value === 'static' || option.value === 'opened' || option.value === 'spilled' || option.value === 'dispensed';
                        case 'powder':
                          return option.value === 'static' || option.value === 'opened' || option.value === 'spilled' || option.value === 'pouring' || option.value === 'dispensed';
                        default:
                          return option.value === 'static';
                      }
                    })();

                    return (
                      <Chip
                        key={option.value}
                        onClick={() => {
                          if (!allowedByType) return;
                          productStore.setStateMotion(option.value as ProductStateMotion);
                          markSectionTouched('product-state-motion');
                        }}
                        selected={productStore.stateMotion === (option.value as ProductStateMotion)}
                        disabled={!allowedByType}
                        className="whitespace-normal"
                      >
                        <span className="flex flex-col items-start text-left leading-tight">
                          <span className="font-bold">{option.label}</span>
                          <span className="text-[10px] font-medium opacity-70">{option.detail}</span>
                        </span>
                      </Chip>
                    );
                  })}
                </div>
                <p className="text-[11px] text-gray-500 mt-2">
                  Physics rules: gravity downward only, no floating, irregular distribution, natural motion freeze.
                </p>
              </div>
            </div>
          </SmoothAccordion>

          <SmoothAccordion
            icon={Layers}
            title="04 / Product Structure"
            tooltip="Define how products are grouped, bundled, and positioned."
            isOpen={openAccordionId === 'productStructure'}
            onToggle={() => toggleSection('productStructure')}
            isTouched={touchedSections.has('productStructure')}
            variant="primary"
          >
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Define how products are grouped, bundled, and positioned.
              </p>
              {/* BUNDLE PRESETS (Mode: Single/Duo/Trio/Kit) */}
              <div className={SECTION_GROUP_CLASS}>
                <div className="flex items-center justify-between">
                  <p className={GROUP_LABEL_CLASS}>BUNDLE MODE</p>
                  <Toggle
                    checked={productStore.bundle.enabled}
                    onCheckedChange={(next) => {
                      productStore.setBundleEnabled(next);
                      markSectionTouched('productStructure');
                    }}
                    aria-label="Bundle mode"
                  />
                </div>

                <div className="flex flex-wrap gap-2 mt-2">
                  {/* Single Option */}
                  <Chip
                    onClick={() => {
                      productStore.setBundleEnabled(false);
                      markSectionTouched('productStructure');
                    }}
                    selected={!productStore.bundle.enabled}
                  >
                    Single
                  </Chip>

                  {/* Prebuilt Bundles */}
                  {PREBUILT_BUNDLES.map(bundle => {
                    const isDisabled = productStore.products.length < bundle.minProducts;
                    const isSelected = productStore.bundle.enabled && productStore.bundle.selectedBundleId === bundle.id;
                    // Mapping specific IDs to labels as per request
                    let label = bundle.name;
                    if (bundle.id === 'daily_duo') label = 'Duo';
                    if (bundle.id === 'essentials_trio') label = 'Trio';
                    if (bundle.id === 'hero_lineup') label = 'Kit';

                    return (
                      <Chip
                        key={bundle.id}
                        onClick={() => {
                          if (isDisabled) return;
                          productStore.selectPrebuiltBundle(bundle.id);
                          markSectionTouched('productStructure');
                        }}
                        selected={isSelected}
                        disabled={isDisabled}
                        className={isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                      >
                        {label}
                      </Chip>
                    );
                  })}
                </div>
                {productStore.products.length < 2 && (
                  <p className="text-[11px] text-amber-600 mt-1">
                    Upload at least 2 products to enable Bundle modes.
                  </p>
                )}
              </div>

              {/* BUNDLE CONTROLS - Only if enabled */}
              {productStore.bundle.enabled && (
                <div className="space-y-4 pt-4 border-t border-gray-100">
                  {/* STYLE / MODE */}
                  <div className={SECTION_GROUP_CLASS}>
                    <p className={GROUP_LABEL_CLASS}>BUNDLE ARRANGEMENT</p>
                    <div className="flex flex-wrap gap-2">
                      {(['hero', 'lineup', 'editorial-cluster'] as const).map(mode => (
                        <Chip
                          key={mode}
                          onClick={() => {
                            productStore.setBundleMode(mode);
                            markSectionTouched('productStructure');
                          }}
                          selected={productStore.bundle.mode === mode}
                        >
                          {mode === 'hero' ? 'Hero' : mode === 'lineup' ? 'Lineup' : 'Editorial Cluster'}
                        </Chip>
                      ))}
                    </div>
                    <p className="text-[11px] text-gray-500 mt-1">
                      {productStore.bundle.mode === 'hero' && 'Primary product featured prominently.'}
                      {productStore.bundle.mode === 'lineup' && 'Products arranged in an equal row.'}
                      {productStore.bundle.mode === 'editorial-cluster' && 'Artistic, organic grouping.'}
                    </p>
                  </div>

                  {/* SPACING */}
                  <div className={SECTION_GROUP_CLASS}>
                    <p className={GROUP_LABEL_CLASS}>BUNDLE SPACING</p>
                    <div className="flex gap-2">
                      {(['compact', 'airy'] as const).map(spacing => (
                        <Chip
                          key={spacing}
                          onClick={() => {
                            productStore.setBundleSpacing(spacing);
                            markSectionTouched('productStructure');
                          }}
                          selected={productStore.bundle.spacing === spacing}
                        >
                          {spacing === 'compact' ? 'Compact' : 'Airy'}
                        </Chip>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </SmoothAccordion>


          {/* BRAND LOOK SYSTEM */}
          <SmoothAccordion
            icon={Layers}
            title="05 / Brand Look System"
            tooltip="Apply a brand-wide visual baseline (defaults)"
            isOpen={openAccordionId === 'brand-look'}
            onToggle={() => toggleSection('brand-look')}
            isTouched={touchedSections.has('brand-look')}
            iconClassName="text-purple-600 dark:text-purple-300"
            variant="secondary"
          >
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Start here for speed or brand consistency. Brand Look sets defaults—you can override later.
              </p>
              <div className={SECTION_GROUP_CLASS}>
                <p className={GROUP_LABEL_CLASS}>APPLY PRESET</p>
                <div className="flex flex-wrap gap-2">
                  {BRAND_PRESETS.map(preset => (
                    <Chip
                      key={preset.id}
                      onClick={() => {
                        productStore.applyBrandPreset(preset.id);
                        markSectionTouched('brand-look');
                        setOpenAccordionId('product-creativity');
                      }}
                      selected={false}
                    >
                      {preset.label}
                    </Chip>
                  ))}
                </div>
              </div>
            </div>
          </SmoothAccordion>

          <SmoothAccordion
            icon={Sparkles}
            title="06 / Creative Direction"
            tooltip="Primary visual decisions. Safe to experiment."
            isOpen={openAccordionId === 'product-creativity'}
            onToggle={() => toggleSection('product-creativity')}
            isTouched={touchedSections.has('product-creativity')}
            iconClassName="text-indigo-600 dark:text-indigo-300"
            variant="secondary"
          >
            <div className="space-y-6">
              <p className="text-sm text-gray-500">
                These choices shape the mood without breaking realism.
              </p>

              {/* CREATIVITY LEVEL */}
              <div className={SECTION_GROUP_CLASS}>
                <p className={GROUP_LABEL_CLASS}>CREATIVITY LEVEL</p>
                <div className="flex gap-2">
                  {([0, 1, 2, 3] as const).map(level => (
                    <Chip
                      key={level}
                      onClick={() => {
                        productStore.setCreativityLevel(level);
                        markSectionTouched('product-creativity');
                      }}
                      selected={productStore.creativityLevel === level}
                    >
                      {level === 0 ? 'Off' : level === 1 ? 'Subtle' : level === 2 ? 'Bold' : 'Max'}
                    </Chip>
                  ))}
                </div>
              </div>

              {productStore.creativityLevel > 0 && (
                <>
                  {/* CORE */}
                  <div className={SECTION_GROUP_CLASS}>
                    <p className={GROUP_LABEL_CLASS}>CORE</p>
                    <p className="text-[11px] text-gray-500 mt-1">
                      Primary visual decisions. Safe to experiment.
                    </p>
                  </div>

                  {/* CREATIVE THEME */}
                  <div className={SECTION_GROUP_CLASS}>
                    <p className={GROUP_LABEL_CLASS}>CREATIVE THEME</p>
                    <div className="flex flex-wrap gap-2">
                      {CREATIVE_THEME_OPTIONS_V1.map(opt => (
                        <Chip
                          key={opt.value}
                          onClick={() => {
                            productStore.setCreativeTheme(opt.value);
                            markSectionTouched('product-creativity');
                          }}
                          selected={productStore.creativeTheme === opt.value}
                        >
                          {opt.label}
                        </Chip>
                      ))}
                    </div>
                    <SelectedOptionFooter options={CREATIVE_THEME_OPTIONS_V1} selectedValue={productStore.creativeTheme} />
                  </div>

                  {/* LIGHT STYLE */}
                  <div className={SECTION_GROUP_CLASS}>
                    <p className={GROUP_LABEL_CLASS}>LIGHT STYLE</p>
                    <div className="flex flex-wrap gap-2">
                      {LIGHT_STYLE_OPTIONS_V1.map(opt => (
                        <Chip
                          key={opt.value}
                          onClick={() => {
                            productStore.setLightStyle(opt.value as LightStyle);
                            markSectionTouched('product-creativity');
                          }}
                          selected={productStore.lightStyle === opt.value}
                        >
                          {opt.label}
                        </Chip>
                      ))}
                    </div>
                    <SelectedOptionFooter options={LIGHT_STYLE_OPTIONS_V1} selectedValue={productStore.lightStyle} />
                  </div>

                  {/* PROP DENSITY */}
                  <div className={SECTION_GROUP_CLASS}>
                    <p className={GROUP_LABEL_CLASS}>PROP DENSITY</p>
                    <div className="flex flex-wrap gap-2">
                      {PROP_DENSITY_OPTIONS.map(opt => (
                        <Chip
                          key={opt.value}
                          onClick={() => {
                            productStore.setPropDensity(opt.value);
                            markSectionTouched('product-creativity');
                          }}
                          selected={productStore.propDensity === opt.value}
                        >
                          {opt.label}
                        </Chip>
                      ))}
                    </div>
                    <SelectedOptionFooter
                      options={[
                        { value: 'none', label: 'None', description: 'No supporting props; product stays the only subject.' },
                        { value: 'low', label: 'Light', description: 'A few subtle props for context without distraction.' },
                        { value: 'medium', label: 'Medium', description: 'Balanced styling with clear supporting elements.' },
                        { value: 'dense', label: 'Dense', description: 'Full set styling; maximal context and texture.' },
                      ]}
                      selectedValue={productStore.propDensity}
                    />
                  </div>

                  {/* ADVANCED (collapsed by default) */}
                  <div className={SECTION_GROUP_CLASS}>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className={GROUP_LABEL_CLASS}>ADVANCED</p>
                        <p className="text-[11px] text-gray-500 mt-1">
                          Fine-tune the scene. Optional.
                        </p>
                      </div>
                      <Toggle
                        checked={productCreativeAdvancedOpen}
                        onCheckedChange={(next) => {
                          setProductCreativeAdvancedOpen(next);
                        }}
                        aria-label="Creative Direction advanced controls"
                      />
                    </div>
                  </div>

                  {productCreativeAdvancedOpen && (
                    <>
                      {/* COMPOSITION MODE */}
                      <div className={SECTION_GROUP_CLASS}>
                        <p className={GROUP_LABEL_CLASS}>COMPOSITION MODE</p>
                        <div className="flex flex-wrap gap-2">
                          {COMPOSITION_MODE_V1_OPTIONS.map(opt => (
                            <div key={opt.value} className="relative group">
                              <Chip
                                onClick={() => {
                                  productStore.setComposition(opt.value as CompositionMode);
                                  markSectionTouched('product-creativity');
                                }}
                                selected={productStore.composition === opt.value}
                              >
                                {opt.label}
                              </Chip>
                            </div>
                          ))}
                        </div>
                        <SelectedOptionFooter options={COMPOSITION_MODE_V1_OPTIONS} selectedValue={productStore.composition} />
                      </div>

                      {/* SURFACE / BASE */}
                      <div className={SECTION_GROUP_CLASS}>
                        <p className={GROUP_LABEL_CLASS}>SURFACE / BASE</p>
                        <div className="flex flex-wrap gap-2">
                          {SURFACE_BASE_OPTIONS.map(opt => (
                            <Chip
                              key={opt.value}
                              onClick={() => {
                                productStore.setSurface(opt.value as SurfaceBase);
                                markSectionTouched('product-creativity');
                              }}
                              selected={productStore.surface === opt.value}
                            >
                              {opt.label}
                            </Chip>
                          ))}
                        </div>
                        <SelectedOptionFooter options={SURFACE_BASE_OPTIONS} selectedValue={productStore.surface} />
                      </div>

                      {/* SCALE & SPACING */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className={SECTION_GROUP_CLASS}>
                          <p className={GROUP_LABEL_CLASS}>SCALE</p>
                          <div className="flex flex-col gap-2">
                            {PRODUCT_SCALE_OPTIONS.map(opt => (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => {
                                  productStore.setScale(opt.value);
                                  markSectionTouched('product-creativity');
                                }}
                                className={getPillClass(productStore.scale === opt.value, true)}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                          <SelectedOptionFooter
                            options={[
                              { value: 'dominant', label: 'Dominant', description: 'Product fills the frame and reads as the hero.' },
                              { value: 'balanced', label: 'Balanced', description: 'Natural scale with room for accents and styling.' },
                              { value: 'oversized', label: 'Oversized', description: 'Bigger-than-life hero emphasis for impact.' },
                            ]}
                            selectedValue={productStore.scale}
                          />
                        </div>
                        <div className={SECTION_GROUP_CLASS}>
                          <p className={GROUP_LABEL_CLASS}>SPACING</p>
                          <div className="flex flex-col gap-2">
                            {PRODUCT_SPACING_OPTIONS.map(opt => (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => {
                                  productStore.setSpacing(opt.value);
                                  markSectionTouched('product-creativity');
                                }}
                                className={getPillClass(productStore.spacing === opt.value, true)}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                          <SelectedOptionFooter
                            options={[
                              { value: 'compact', label: 'Compact', description: 'Tighter composition with minimal breathing room.' },
                              { value: 'balanced', label: 'Balanced', description: 'Comfortable spacing that still feels product-first.' },
                              { value: 'airy', label: 'Airy', description: 'More breathing room for a premium, spacious layout.' },
                            ]}
                            selectedValue={productStore.spacing}
                          />
                        </div>
                      </div>

                      {/* NEGATIVE SPACE */}
                      <div className={SECTION_GROUP_CLASS}>
                        <p className={GROUP_LABEL_CLASS}>NEGATIVE SPACE INTENT</p>
                        <div className="flex flex-wrap gap-2">
                          {NEGATIVE_SPACE_OPTIONS.map(opt => (
                            <Chip
                              key={opt.value}
                              onClick={() => {
                                productStore.setNegativeSpace(opt.value);
                                markSectionTouched('product-creativity');
                              }}
                              selected={productStore.negativeSpace === opt.value}
                            >
                              {opt.label}
                            </Chip>
                          ))}
                        </div>
                        <SelectedOptionFooter
                          options={[
                            { value: 'none', label: 'None', description: 'Fills the frame with the product and set dressing.' },
                            { value: 'subtle', label: 'Subtle', description: 'A little breathing room without feeling empty.' },
                            { value: 'intentional', label: 'Intentional', description: 'Clear copy/CTA room with a deliberate layout.' },
                            { value: 'heavy', label: 'Heavy', description: 'Lots of open space for strong typography or ads.' },
                          ]}
                          selectedValue={productStore.negativeSpace}
                        />
                      </div>

                      {/* PALETTE SOURCE */}
                      <div className={SECTION_GROUP_CLASS}>
                        <p className={GROUP_LABEL_CLASS}>PALETTE SOURCE</p>
                        <div className="flex flex-wrap gap-2">
                          {PALETTE_SOURCE_OPTIONS_V1.map(opt => (
                            <Chip
                              key={opt.value}
                              onClick={() => {
                                productStore.setPaletteSource(opt.value);
                                markSectionTouched('product-creativity');
                              }}
                              selected={productStore.paletteSource === opt.value}
                            >
                              {opt.label}
                            </Chip>
                          ))}
                        </div>
                        <SelectedOptionFooter
                          options={[
                            { value: 'brand', label: 'Product Label Colors', description: 'Pulls tones from the pack/label for brand consistency.' },
                            { value: 'warm-neutral', label: 'Warm Neutrals', description: 'Creams, sands, and warm grays for softness and warmth.' },
                            { value: 'cool-neutral', label: 'Cool Neutrals', description: 'Cool grays and whites for a crisp, modern feel.' },
                            { value: 'complementary', label: 'Complementary Accent', description: 'Adds an accent color that contrasts the pack tastefully.' },
                            { value: 'custom', label: 'Custom Palette', description: 'Use your own palette (manual colors).' },
                          ]}
                          selectedValue={productStore.paletteSource}
                        />
                      </div>

                      {/* SUGGESTED PROPS */}
                      <div className={SECTION_GROUP_CLASS}>
                        <p className={GROUP_LABEL_CLASS}>SUGGESTED PROPS</p>
                        <p className="text-[11px] text-gray-500">Optional. Product-safe suggestions based on Product Type.</p>
                        <div className="flex flex-wrap gap-2">
                          {productSuggestedProps.map(prop => {
                            const selected = productStore.selectedProps.includes(prop);
                            return (
                              <Chip
                                key={prop}
                                onClick={() => {
                                  const current = productStore.selectedProps;
                                  const next = selected ? current.filter(x => x !== prop) : [...current, prop];
                                  productStore.setSelectedProps(next);
                                  markSectionTouched('product-creativity');
                                }}
                                selected={selected}
                              >
                                {prop}
                              </Chip>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </SmoothAccordion>

          {/* PRODUCT STUDIO — ENVIRONMENT (single source of truth: productStore.environmentContext) */}
          {productStore.environmentContext != null && (
          <SmoothAccordion
            icon={MapPin}
            title="07 / Environment"
            tooltip="Place the product into a real setting. Product-only, no people."
            isOpen={openAccordionId === 'product-environment'}
            onToggle={() => toggleSection('product-environment')}
            isTouched={touchedSections.has('product-environment')}
            variant="primary"
          >
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Place the product into a real setting. Product-only, no people.
              </p>
              {(() => {
              const selectedMacro =
                (productStore.environmentContext?.macro as EnvironmentMacro | null | undefined)
                ?? (productStore.environmentMacro && productStore.environmentMacro !== 'studio' ? productStore.environmentMacro : null);

              const selectedMicro =
                (productStore.environmentContext?.micro as MicroPlace | null | undefined)
                ?? (productStore.microPlace && productStore.microPlace !== 'neutral-surface' ? productStore.microPlace : null);

              const isDisabled = Boolean(values.ecommerceSidePlacementFlag || productStore.blankSpaceEnabled);

              return (
                <div className="space-y-4">
                  {isDisabled && (
                    <div className="rounded-xl border border-gray-200 bg-white p-3 text-gray-500 text-sm">
                      Environment is disabled while Background Canvas is On (neutral background mode).
                    </div>
                  )}

                  <div className={isDisabled ? 'opacity-50 pointer-events-none' : ''}>
                    <div className={SECTION_GROUP_CLASS}>
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className={GROUP_LABEL_CLASS}>MACRO ENVIRONMENT</p>
                          <p className="text-[11px] text-gray-500 mt-1">Choose a setting to match lighting + surfaces</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            productStore.setEnvironmentContext(null);
                            markSectionTouched('product-environment');
                          }}
                          className="text-[11px] font-semibold text-gray-500 hover:text-gray-900"
                        >
                          Clear
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-2 mt-2">
                        {ENVIRONMENT_MACRO_OPTIONS.map(env => (
                          <Chip
                            key={env}
                            onClick={() => {
                              productStore.setEnvironmentContext({ macro: env, micro: null });
                              markSectionTouched('product-environment');
                            }}
                            selected={selectedMacro === env}
                          >
                            {env === 'custom'
                              ? 'Custom'
                              : env.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
                            }
                          </Chip>
                        ))}
                      </div>

                      {selectedMacro === 'custom' && (
                        <label className="block space-y-1 mt-3">
                          <p className="text-[11px] uppercase tracking-wide text-gray-500">Custom environment</p>
                          <input
                            value={productStore.customEnvironmentText || ''}
                            onChange={(e) => {
                              productStore.setCustomEnvironmentText(e.target.value);
                              markSectionTouched('product-environment');
                            }}
                            placeholder="e.g. modern kitchen countertop"
                            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-indigo-600 focus:outline-none"
                          />
                        </label>
                      )}
                    </div>

                    <div className={SECTION_GROUP_CLASS}>
                      <p className={GROUP_LABEL_CLASS}>MICRO PLACE</p>
                      <div className="flex flex-wrap gap-2">
                        <Chip
                          onClick={() => {
                            const macro = (selectedMacro ?? 'kitchen') as EnvironmentMacro;
                            productStore.setEnvironmentContext({ macro, micro: null });
                            markSectionTouched('product-environment');
                          }}
                          selected={!selectedMicro}
                        >
                          Optional
                        </Chip>
                        {PRODUCT_ENVIRONMENT_MICRO_OPTIONS.map(place => (
                          <Chip
                            key={place}
                            onClick={() => {
                              const macro = (selectedMacro ?? 'kitchen') as EnvironmentMacro;
                              productStore.setEnvironmentContext({ macro, micro: place });
                              markSectionTouched('product-environment');
                            }}
                            selected={selectedMicro === place}
                          >
                            {place.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                          </Chip>
                        ))}
                      </div>
                    </div>

                    <div className={SECTION_GROUP_CLASS}>
                      <div>
                        <p className={GROUP_LABEL_CLASS}>LIGHTING</p>
                        <p className="text-[11px] text-gray-500 mt-1">Product-safe lighting style</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {PRODUCT_ENVIRONMENT_LIGHTING_OPTIONS.map(option => (
                          <Chip
                            key={option.value}
                            onClick={() => {
                              productStore.setLighting(option.value);
                              markSectionTouched('product-environment');
                            }}
                            selected={productStore.lighting === option.value}
                          >
                            {option.label}
                          </Chip>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
              })()}
            </div>
          </SmoothAccordion>
          )}

          <SmoothAccordion
            icon={Hand}
            title="08 / Product Interaction"
            tooltip="Hands and interaction are treated as controlled visual elements, not decoration."
            isOpen={openAccordionId === 'product-interaction'}
            onToggle={() => toggleSection('product-interaction')}
            isTouched={touchedSections.has('product-interaction')}
            variant="primary"
          >
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Define how the product is physically interacted with.<br />
                This affects realism, trust, and narrative tone.
              </p>

              <div className={SECTION_GROUP_CLASS}>
                <p className={GROUP_LABEL_CLASS}>PRODUCT INTERACTION</p>
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      { value: 'none', label: 'None', detail: 'No hands. No skin. No human shadows.' },
                      { value: 'passive-presence', label: 'Passive Presence', detail: 'Hands visible in frame, not touching the product.' },
                      { value: 'cropped-hand', label: 'Cropped Hand', detail: 'Partial hand for scale only. No grip. No action.' },
                      { value: 'supported-hold', label: 'Supported Hold', detail: 'Product rests on an open palm. No pressure.' },
                      { value: 'holding', label: 'Holding', detail: 'One hand holds the product naturally. No gesture.' },
                      { value: 'two-hand-hold', label: 'Two-Hand Hold', detail: 'Both hands hold the product centered. Calm and careful.' },
                      { value: 'presenting', label: 'Presenting', detail: 'Shown to camera with label readable. No push to lens.' },
                      { value: 'framed-presentation', label: 'Framed Presentation', detail: 'Hands frame the product editorially. No offer-to-lens.' },
                      { value: 'applying-opening', label: 'Applying / Opening', detail: 'One clear action: twist/open. No consumption.' },
                      { value: 'capsule-display', label: 'Capsule Display', detail: '2–4 capsules in palm + bottle visible. No pouring.' },
                      { value: 'resting-interaction', label: 'Resting Interaction', detail: 'Product rests against hand/wrist. Passive contact.' },
                    ] as const
                  ).map(option => {
                    const disabled =
                      option.value === 'capsule-display' && productStore.definition.type !== 'capsules';
                    return (
                      <Chip
                        key={option.value}
	                        onClick={() => {
	                          if (disabled) return;
	                          productStore.setInteraction(option.value as any);
	                          productStore.setHandsHolding(option.value !== 'none');
	                          updateValue('productStudioInteraction', option.value as any);
	                          updateValue('handsHolding', option.value !== 'none');
	                          markSectionTouched('product-interaction');
	                        }}
	                        selected={productStore.interaction === (option.value as any)}
	                        disabled={disabled}
                        className="whitespace-normal"
                      >
                        <span className="flex flex-col items-start text-left leading-tight">
                          <span className="font-bold">{option.label}</span>
                          <span className="text-[10px] font-medium opacity-70">{option.detail}</span>
                        </span>
                      </Chip>
                    );
                  })}
                </div>
                {productStore.definition.type !== 'capsules' && (
                  <p className="text-[11px] text-gray-500 mt-2">
                    Capsule Display is only available when Product Type is Capsules.
                  </p>
                )}
              </div>
            </div>
          </SmoothAccordion>

          <SmoothAccordion
            icon={Camera}
            title="09 / Camera & Framing"
            tooltip="Professional product photography controls"
            isOpen={openAccordionId === 'product-camera'}
            onToggle={() => toggleSection('product-camera')}
            isTouched={touchedSections.has('product-camera')}
            variant="primary"
          >
            <div className="space-y-4">
              <p className="text-sm text-gray-500">Professional photography controls.</p>
              <div className={SECTION_GROUP_CLASS}>
                <p className={GROUP_LABEL_CLASS}>CAMERA SYSTEM</p>
                <div className="flex flex-wrap gap-2">
                  {(['DSLR / mirrorless', 'Macro lens', 'Telephoto compression'] as const).map(option => (
                    <Chip
                      key={option}
                      onClick={() => {
                        updateValue('productCameraSystem', option);
                        // Keep ProductStudio prompt camera system stable (used in product-only engine).
                        // This UI is descriptive; actual camera personality is driven by angle/distance/rig presets.
                        markSectionTouched('product-camera');
                      }}
                      selected={values.productCameraSystem === option}
                    >
                      {option}
                    </Chip>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className={SECTION_GROUP_CLASS}>
                  <p className={GROUP_LABEL_CLASS}>ANGLE</p>
                  <div className="flex flex-wrap gap-2">
                    {(
                      [
                        'Eye level product',
                        '45° hero',
                        'Top-down flat lay',
                        'Low angle power',
                        'High angle overview',
                        'Detail close-up',
                      ] as const
                    ).map(option => (
                      <Chip
                        key={option}
                        onClick={() => {
                          updateValue('productCameraAngle', option as any);
                          const angleMap: Record<string, ProductStudioState['angle']> = {
                            'Eye level product': 'front',
                            '45° hero': '45',
                            'Top-down flat lay': 'top',
                            'Low angle power': 'front',
                            'High angle overview': '45',
                            'Detail close-up': '45',
                          };
                          const mapped = angleMap[option];
                          if (mapped) productStore.setAngle(mapped);
                          markSectionTouched('product-camera');
                        }}
                        selected={values.productCameraAngle === option}
                      >
                        {option}
                      </Chip>
                    ))}
                  </div>
                </div>

                <div className={SECTION_GROUP_CLASS}>
                  <p className={GROUP_LABEL_CLASS}>DISTANCE</p>
                  <div className="flex flex-wrap gap-2">
                    {(['Wide', 'Standard', 'Tight', 'Macro'] as const).map(option => (
                      <Chip
                        key={option}
                        onClick={() => {
                          updateValue('productCameraDistance', option);
                          const distanceMap: Record<string, ProductStudioState['distance']> = {
                            Wide: 'medium',
                            Standard: 'medium',
                            Tight: 'close',
                            Macro: 'macro',
                          };
                          const mapped = distanceMap[option];
                          if (mapped) productStore.setDistance(mapped);
                          markSectionTouched('product-camera');
                        }}
                        selected={values.productCameraDistance === option}
                      >
                        {option}
                      </Chip>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className={SECTION_GROUP_CLASS}>
                  <p className={GROUP_LABEL_CLASS}>ROTATION</p>
                  <div className="flex flex-wrap gap-2">
                    {([0, 5, 10, 15] as const).map(option => (
                      <Chip
                        key={option}
                        onClick={() => {
                          updateValue('productCameraRotation', option);
                          productStore.setRotation(option === 0 ? 'none' : 'slight');
                          markSectionTouched('product-camera');
                        }}
                        selected={values.productCameraRotation === option}
                      >
                        {option}°
                      </Chip>
                    ))}
                  </div>
                </div>

                <div className={SECTION_GROUP_CLASS}>
                  <p className={GROUP_LABEL_CLASS}>FRAMING GUIDE</p>
                  <div className="flex flex-wrap gap-2">
                    {(
                      [
                        'Centered hero',
                        'Rule of thirds',
                        'Left aligned + negative space',
                        'Right aligned + negative space',
                        'Grid-ready',
                      ] as const
                    ).map(option => (
                      <Chip
                        key={option}
                        onClick={() => {
                          updateValue('productFramingGuide', option as any);
                          if (option === 'Rule of thirds') {
                            productStore.setFraming('rule-of-thirds');
                          } else if (option === 'Centered hero') {
                            productStore.setFraming('centered');
                          }
                          markSectionTouched('product-camera');
                        }}
                        selected={values.productFramingGuide === option}
                      >
                        {option}
                      </Chip>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </SmoothAccordion>

          <SmoothAccordion
            icon={Building2}
            title="10 / Ecommerce Image Builder (BETA)"
            tooltip="Generate ecommerce-ready images with layout-safe space (experimental)"
            isOpen={openAccordionId === 'ecommerce'}
            onToggle={() => toggleSection('ecommerce')}
            isActive
            variant="secondary"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold tracking-wide text-amber-800">
                  BETA
                </span>
                <p className="text-sm text-gray-500">Some preview features are experimental.</p>
              </div>
              <div className={SECTION_GROUP_CLASS}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className={GROUP_LABEL_CLASS}>BACKGROUND CANVAS</p>
                    <p className="text-[11px] text-gray-500 mt-1">Neutral background + negative space (optional)</p>
                  </div>
                  <Toggle
                    checked={values.ecommerceSidePlacementFlag}
                    onCheckedChange={(next) => {
                      updateValue('ecommerceSidePlacementFlag', next);
                      updateValue('compositionMode', next ? 'Ecommerce Blank Space' : '');
                      markSectionTouched('ecommerce');
                    }}
                    aria-label="Background canvas"
                  />
                </div>
                {values.ecommerceSidePlacementFlag !== true && (
                  <p className="text-[11px] text-gray-500">
                    Turn this off to use Product Builder Creativity (studio/aesthetic) instead of a neutral blank-space layout.
                  </p>
                )}
              </div>

              {values.ecommerceSidePlacementFlag === true && (
                <>
                  <div className={SECTION_GROUP_CLASS}>
                    <div>
                      <p className={GROUP_LABEL_CLASS}>SIDE PLACEMENT</p>
                      <p className="text-[11px] text-gray-500 mt-1">Product anchor position</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {SIDE_PLACEMENT_OPTIONS.map(option => (
                        <Chip
                          key={option}
                          onClick={() => {
                            updateValue('sidePlacement', option);
                            markSectionTouched('ecommerce');
                          }}
                          selected={values.sidePlacement === option}
                        >
                          {option}
                        </Chip>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-5 rounded-xl border border-gray-200 bg-white p-4">
                    <div className="space-y-1">
                      <p className="text-xs uppercase tracking-widest text-indigo-600">Background</p>
                      <p className="text-sm text-gray-600">Neutral color or gradient</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Chip
                        selected={isProductMode ? productStore.gradientEnabled === false : values.ecommerceBackgroundMode === 'white'}
                        onClick={() => {
                          updateValue('ecommerceBackgroundMode', 'white');
                          if (isProductMode) {
                            productStore.setGradientEnabled(false);
                          }
                          markSectionTouched('ecommerce');
                        }}
                      >
                        Solid
                      </Chip>
                      <Chip
                        selected={isProductMode ? productStore.gradientEnabled === true : values.ecommerceBackgroundMode === 'gradient'}
                        onClick={() => {
                          updateValue('ecommerceBackgroundMode', 'gradient');
                          if (isProductMode) {
                            productStore.setGradientEnabled(true);
                          }
                          markSectionTouched('ecommerce');
                        }}
                      >
                        Gradient
                      </Chip>
                    </div>

                    {(isProductMode ? productStore.gradientEnabled === false : values.ecommerceBackgroundMode === 'white') ? (
                      <div className="flex items-center gap-4">
                        {/* Circular color swatch */}
                        <label className="relative">
                          <span
                            className="block h-10 w-10 rounded-full border-2 border-gray-200 cursor-pointer "
                            style={{ background: (isProductMode ? productStore.backgroundColor : values.ecommerceBackgroundColor) || '#ffffff' }}
                          />
                          <input
                            type="color"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            value={(isProductMode ? productStore.backgroundColor : values.ecommerceBackgroundColor) || '#ffffff'}
                            onChange={(e) => {
                              updateValue('ecommerceBackgroundColor', e.target.value);
                              if (isProductMode) {
                                productStore.setGradientEnabled(false);
                                productStore.setBackgroundColor(e.target.value);
                              }
                              markSectionTouched('ecommerce');
                            }}
                          />
                        </label>
                        {/* HEX input */}
                        <div className="flex-1">
                          <input
                            type="text"
                            value={(((isProductMode ? productStore.backgroundColor : values.ecommerceBackgroundColor) || '#FFFFFF') as string).toUpperCase()}
                            onChange={e => {
                              const hex = e.target.value.toUpperCase();
                              if (/^#[0-9A-F]{0,6}$/i.test(hex) || hex === '') {
                                updateValue('ecommerceBackgroundColor', hex);
                                if (isProductMode) {
                                  productStore.setGradientEnabled(false);
                                  productStore.setBackgroundColor(hex);
                                }
                                markSectionTouched('ecommerce');
                              }
                            }}
                            onBlur={e => {
                              const hex = e.target.value.toUpperCase();
                              if (!/^#[0-9A-F]{6}$/i.test(hex)) {
                                updateValue('ecommerceBackgroundColor', '#FFFFFF');
                                if (isProductMode) {
                                  productStore.setGradientEnabled(false);
                                  productStore.setBackgroundColor('#FFFFFF');
                                }
                              }
                            }}
                            placeholder="#FFFFFF"
                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-mono text-gray-900 placeholder:text-gray-400 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-4">
                          {(
                            [
                              { key: 'ecommerceGradientStart', label: 'Start' },
                              { key: 'ecommerceGradientEnd', label: 'End' }
                            ] as const
                          ).map(cfg => (
                            <div key={cfg.key} className="flex items-center gap-4">
                              <span className="text-[11px] uppercase tracking-wide text-gray-500 w-10">{cfg.label}</span>
                              {/* Circular color swatch */}
                              <label className="relative">
                                <span
                                  className="block h-10 w-10 rounded-full border-2 border-gray-200 cursor-pointer "
                                  style={{
                                    background: (
                                      isProductMode
                                        ? (cfg.key === 'ecommerceGradientStart' ? productStore.gradientStart : productStore.gradientEnd)
                                        : (values as any)[cfg.key]
                                    ) || '#ffffff'
                                  }}
                                />
                                <input
                                  type="color"
                                  className="absolute inset-0 opacity-0 cursor-pointer"
                                  value={(
                                    isProductMode
                                      ? (cfg.key === 'ecommerceGradientStart' ? productStore.gradientStart : productStore.gradientEnd)
                                      : (values as any)[cfg.key]
                                  ) || '#ffffff'}
                                  onChange={(e) => {
                                    updateValue(cfg.key as any, e.target.value as any);
                                    if (isProductMode) {
                                      productStore.setGradientEnabled(true);
                                      if (cfg.key === 'ecommerceGradientStart') productStore.setGradientStart(e.target.value);
                                      if (cfg.key === 'ecommerceGradientEnd') productStore.setGradientEnd(e.target.value);
                                    }
                                    markSectionTouched('ecommerce');
                                  }}
                                />
                              </label>
                              {/* HEX input */}
                              <div className="flex-1">
                                <input
                                  type="text"
                                  value={(((
                                    isProductMode
                                      ? (cfg.key === 'ecommerceGradientStart' ? productStore.gradientStart : productStore.gradientEnd)
                                      : (values as any)[cfg.key]
                                  ) || '#FFFFFF') as string).toUpperCase()}
                                  onChange={e => {
                                    const hex = e.target.value.toUpperCase();
                                    if (/^#[0-9A-F]{0,6}$/i.test(hex) || hex === '') {
                                      updateValue(cfg.key as any, hex as any);
                                      if (isProductMode) {
                                        productStore.setGradientEnabled(true);
                                        if (cfg.key === 'ecommerceGradientStart') productStore.setGradientStart(hex);
                                        if (cfg.key === 'ecommerceGradientEnd') productStore.setGradientEnd(hex);
                                      }
                                      markSectionTouched('ecommerce');
                                    }
                                  }}
                                  onBlur={e => {
                                    const hex = e.target.value.toUpperCase();
                                    if (!/^#[0-9A-F]{6}$/i.test(hex)) {
                                      updateValue(cfg.key as any, '#FFFFFF' as any);
                                      if (isProductMode) {
                                        productStore.setGradientEnabled(true);
                                        if (cfg.key === 'ecommerceGradientStart') productStore.setGradientStart('#FFFFFF');
                                        if (cfg.key === 'ecommerceGradientEnd') productStore.setGradientEnd('#FFFFFF');
                                      }
                                    }
                                  }}
                                  placeholder="#FFFFFF"
                                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-mono text-gray-900 placeholder:text-gray-400 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-500"
                                />
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          {GRADIENT_ANGLE_OPTIONS.map(angle => (
                            <Chip
                              key={angle}
                              onClick={() => {
                                updateValue('ecommerceGradientAngle', String(angle) as any);
                                if (isProductMode) {
                                  productStore.setGradientEnabled(true);
                                  productStore.setGradientAngle(Number(angle));
                                }
                                markSectionTouched('ecommerce');
                              }}
                              selected={isProductMode ? productStore.gradientAngle === Number(angle) : String(values.ecommerceGradientAngle) === String(angle)}
                            >
                              {angle}°
                            </Chip>
                          ))}
                          <Chip selected={false} onClick={invertGradient}>
                            Invert
                          </Chip>
                        </div>

                        <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white">
                          <div
                            className="h-20 w-full"
                            style={{
                              background: isProductMode
                                ? `linear-gradient(${productStore.gradientAngle}deg, ${productStore.gradientStart}, ${productStore.gradientEnd})`
                                : `linear-gradient(${values.ecommerceGradientAngle}deg, ${values.ecommerceGradientStart}, ${values.ecommerceGradientEnd})`
                            }}
                          />
                          <div className="absolute inset-0 ring-1 ring-borderSubtle" />
                        </div>
                      </>
                    )}
                  </div>
                </>
              )}

              {ecommerceOverlay && (
                <div className="space-y-3 rounded-2xl border border-gray-200 bg-white p-4">
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-widest text-indigo-600">Overlays</p>
                    <p className="text-sm text-gray-600">Text + icons are rendered by the app (not the image model).</p>
                  </div>
                  <EcommerceStep3
                    embedded
                    selectedSlots={ecommerceOverlay.selectedSlots}
                    onSelectedSlotsChange={ecommerceOverlay.onSelectedSlotsChange}
                    slotsConfig={ecommerceOverlay.slotsConfig}
                    onSlotsConfigChange={ecommerceOverlay.onSlotsConfigChange}
                    slotBaseImages={ecommerceOverlay.slotBaseImages}
                    settings={ecommerceOverlay.settings}
                    onSettingsChange={ecommerceOverlay.onSettingsChange}
                  />
                </div>
              )}
            </div>
          </SmoothAccordion>
        </>
      )
      }

      {
        isEnvironmentMode && (
          <>
            {/* Creator / Person */}
            <div
              className={`group rounded-2xl border border-gray-200 bg-white overflow-hidden dark:bg-white/5 dark:border-white/10 dark:backdrop-blur-[20px] dark:backdrop-saturate-[180%] ${isCreatorPro ? 'is-pro' : ''}`}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-white/10">
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    Creator / Person
                    <span className="text-xs text-gray-400 ml-1 dark:text-white/40">required</span>
                  </p>
                  <p className="text-xs text-gray-500 dark:text-white/50">Define a realistic human subject for the scene</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreatorPro(prev => !prev)}
                  className="flex items-center gap-2 text-xs text-gray-500 dark:text-white/50"
                >
                  Pro
                  <span
                    className={`relative inline-flex h-5 w-9 items-center rounded-full border border-gray-200 transition-colors ${isCreatorPro
                      ? 'bg-indigo-600 border-indigo-600 dark:bg-indigo-500 dark:border-indigo-500'
                      : 'bg-gray-200 border-gray-200 dark:bg-white/10 dark:border-white/10'
                      }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${isCreatorPro ? 'translate-x-4' : 'translate-x-0'} dark:border-white/10`}
                    />
                  </span>
                </button>
              </div>

              <div className="px-4 py-6 space-y-10 bg-gray-50 dark:bg-white/5">
                {isPersonDisabled ? (
                  <div className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-500 dark:border-white/10 dark:bg-black/20 dark:text-white/60">
                    Creator / Person controls are disabled in Product Mode.
                  </div>
                ) : (
                  <>
                    <section className="space-y-6">
                      <div className="flex items-center gap-2">
                        <p className="text-[11px] uppercase tracking-[0.3em] text-gray-400 font-semibold dark:text-white/40">Core identity</p>
                        {touchedSections.has('creator') && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-300" />}
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-600 dark:text-white/60">
	                            {values.personCount !== 'single' ? 'Age (Person A)' : 'Age'}
                          </span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{values.age}</span>
                        </div>
                        <input
                          type="range"
                          min={18}
                          max={90}
                          step={1}
                          value={values.age}
                          onChange={(event) => handleAgeSliderChange(Number(event.target.value))}
                          className="scene-age-slider w-full"
                          style={{ ['--progress' as any]: `${ageSliderProgress}%` }}
                        />
                      </div>

	                      <div className="space-y-2">
	                        <span className="text-xs text-gray-600 dark:text-white/60">
	                          {values.personCount === 'couple' ? 'Primary gender' : 'Gender'}
	                        </span>
	                        <div className="flex flex-wrap gap-2">
	                          {(['Female', 'Male'] as const).map(option => {
	                            const active = values.gender === option;
	                            return (
	                              <Chip
	                                key={option}
	                                onClick={() => { updateValue('gender', option); markSectionTouched('creator'); }}
	                                selected={active}
	                                size="md"
	                              >
	                                {option}
	                              </Chip>
	                            );
	                          })}
	                        </div>
	                      </div>

	                      <div className="space-y-2">
	                        <div className="flex items-center justify-between gap-3">
	                          <div>
	                            <span className="text-xs text-gray-600 dark:text-white/60">Person count</span>
	                            <p className="text-[11px] text-gray-400 dark:text-white/40">
	                              {values.personCount === 'couple' ? (
	                                <>
	                                  Person A and Person B both appear in-frame.
	                                  <br />
	                                  Configure Person B identity below and choose Couple staging.
	                                </>
	                              ) : values.personCount === 'group' ? (
	                                '3–5 people in-frame. Person A uses these settings; others are derived automatically with distinct identities.'
	                              ) : (
	                                'Choose single creator, a couple, or a small group.'
	                              )}
	                            </p>
	                          </div>
	                        </div>
		                        <div className="flex flex-wrap gap-2">
		                          <Chip
		                            onClick={() => {
		                              updateValue('personCount', 'single');
		                              updateValue('editSecondaryPerson', false);
		                              markSectionTouched('creator');
		                            }}
		                            selected={values.personCount === 'single'}
		                            size="md"
		                          >
		                            Single
		                          </Chip>
		                          <Chip
		                            onClick={() => {
		                              updateValue('personCount', 'couple');
		                              updateValue('editSecondaryPerson', true);
		                              if (!values.coupleStaging) updateValue('coupleStaging', 'Together (side-by-side)');
		                              if (!values.secondaryAge || values.secondaryAge === 30) updateValue('secondaryAge', Math.min(90, Math.max(18, values.age + 2)));
		                              markSectionTouched('creator');
		                            }}
		                            selected={values.personCount === 'couple'}
		                            size="md"
		                          >
		                            Couple
		                          </Chip>
		                          <Chip
		                            onClick={() => {
		                              updateValue('personCount', 'group');
		                              updateValue('editSecondaryPerson', false);
		                              markSectionTouched('creator');
		                            }}
		                            selected={values.personCount === 'group'}
		                            size="md"
		                          >
		                            Group
		                          </Chip>
		                        </div>
		                        {values.personCount === 'couple' && (
		                          <div className="space-y-2">
		                            <span className="text-xs text-gray-600 dark:text-white/60">Sex pairing</span>
	                            <div className="flex flex-wrap gap-2">
	                              <Chip
	                                onClick={() => {
	                                  updateValue('coupleSex', 'same');
	                                  markSectionTouched('creator');
	                                }}
	                                selected={values.coupleSex === 'same'}
	                                size="md"
	                              >
	                                Same sex
	                              </Chip>
	                              <Chip
	                                onClick={() => {
	                                  updateValue('coupleSex', 'different');
	                                  markSectionTouched('creator');
	                                }}
	                                selected={values.coupleSex === 'different'}
	                                size="md"
	                              >
	                                Different sex
	                              </Chip>
	                            </div>
		                          </div>
		                        )}

		                        {values.personCount === 'couple' && (
		                          <div className="space-y-2">
		                            <span className="text-xs text-gray-600 dark:text-white/60">Couple staging</span>
		                            <div className="flex flex-wrap gap-2">
		                              {RITUAL_COUPLE_STAGING_OPTIONS.map(option => (
		                                <Chip
		                                  key={option}
		                                  onClick={() => {
		                                    updateValue('coupleStaging', option);
		                                    markSectionTouched('creator');
		                                  }}
		                                  selected={values.coupleStaging === option}
		                                  size="md"
		                                >
		                                  {option}
		                                </Chip>
		                              ))}
		                            </div>
		                          </div>
		                        )}

                        <div className="space-y-2">
                          <span className="text-xs text-gray-600 dark:text-white/60">Eye direction</span>
                          <div className="flex flex-wrap gap-2">
                            {EYE_DIRECTION_OPTIONS.map(option => {
                              const active = values.eyeDirection === option;
                              return (
                                <button
                                  key={option}
                                  type="button"
                                  onClick={() => { updateValue('eyeDirection', option); markSectionTouched('creator'); }}
                                  className={`px-3 h-8 rounded-full border text-xs transition-colors ${active
                                    ? 'bg-indigo-600 text-white border-indigo-600 dark:border-white/10 dark:bg-indigo-500 dark:border-indigo-500 dark:text-white'
                                    : 'bg-white border-gray-200 text-gray-600 hover:border-indigo-600 dark:border-white/10 dark:bg-white/5 dark:text-white/60 dark:hover:border-white/30'
                                    }`}
                                >
                                  {option}
                                </button>
                              );
                            })}
                          </div>
                        </div>

		                        {values.personCount === 'couple' && (
		                          <div className="pt-2">
		                            <div className="flex items-center justify-between gap-3">
		                              <div>
		                                <p className="text-xs text-gray-600 dark:text-white/60">Person B settings</p>
		                                <p className="text-[11px] text-gray-400 dark:text-white/40">
		                                  Toggle on to edit Person B. If left off, Person B will be derived automatically.
		                                </p>
		                              </div>
		                              <Toggle
		                                checked={values.editSecondaryPerson}
		                                title={values.editSecondaryPerson ? 'Editing Person B is enabled' : 'Enable editing Person B'}
	                                aria-label="Enable editing Person B"
	                                onCheckedChange={(next) => {
	                                  updateValue('editSecondaryPerson', next);
	                                  markSectionTouched('creator');
	                                  if (next) {
	                                    const primary = String(values.gender || '').toLowerCase();
	                                    const derivedGender =
	                                      values.coupleSex === 'same'
	                                        ? values.gender
	                                        : (primary.includes('female') ? 'Male' : primary.includes('male') ? 'Female' : '');
	                                    if (!values.secondaryGender && derivedGender) updateValue('secondaryGender', derivedGender as any);
	                                    if (!values.secondaryEthnicity && values.ethnicity) updateValue('secondaryEthnicity', values.ethnicity as any);
	                                    if (!values.secondarySkinTone && values.skinTone) updateValue('secondarySkinTone', values.skinTone as any);
	                                    if (!values.secondaryEyeColor && values.eyeColor) updateValue('secondaryEyeColor', values.eyeColor as any);
	                                    if (!values.secondaryHairColor && values.hairColor) updateValue('secondaryHairColor', values.hairColor as any);
	                                    if (!values.secondaryHairLength && values.hairLength) updateValue('secondaryHairLength', values.hairLength as any);
	                                    if (!values.secondaryHairTexture && values.hairTexture) updateValue('secondaryHairTexture', values.hairTexture as any);
	                                    if (!values.secondaryBodyType && values.bodyType) updateValue('secondaryBodyType', values.bodyType as any);
	                                  }
	                                }}
	                              />
		                            </div>
		                          </div>
		                        )}
	                      </div>

		                      {values.personCount === 'couple' && values.editSecondaryPerson && (
		                        <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-4 dark:bg-black/20 dark:border-white/10">
		                          <p className="text-[11px] uppercase tracking-[0.3em] text-gray-400 font-semibold dark:text-white/40">
		                            Person B (Secondary)
		                          </p>
                              <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <span className="text-xs text-gray-600 dark:text-white/60">Age</span>
                                  <span className="text-sm font-medium text-gray-900 dark:text-white">{values.secondaryAge}</span>
                                </div>
                                <input
                                  type="range"
                                  min={18}
                                  max={90}
                                  step={1}
                                  value={values.secondaryAge}
                                  onChange={(event) => { updateValue('secondaryAge', Number(event.target.value)); markSectionTouched('creator'); }}
                                  className="scene-age-slider w-full"
                                  style={{ ['--progress' as any]: `${Math.round(((values.secondaryAge - 18) / (90 - 18)) * 100)}%` }}
                                />
                              </div>
	                          <div className="space-y-2">
	                            <span className="text-xs text-gray-600 dark:text-white/60">Gender</span>
	                            <div className="flex flex-wrap gap-2">
	                              {(['Female', 'Male'] as const).map(option => (
	                                <Chip
	                                  key={option}
	                                  onClick={() => { updateValue('secondaryGender', option); markSectionTouched('creator'); }}
	                                  selected={values.secondaryGender === option}
	                                  tooltip={`Person B: ${option}`}
	                                  size="md"
	                                >
	                                  {option}
	                                </Chip>
	                              ))}
	                            </div>
	                          </div>
	                          <div className="space-y-2">
	                            <span className="text-xs text-gray-600 dark:text-white/60">Ethnicity</span>
	                            <div className="flex flex-wrap gap-2">
	                              {(
	                                [
	                                  'Non-specific',
	                                  'White / European descent',
	                                  'Black / African descent',
	                                  'Latino / Hispanic',
	                                ] as const
	                              ).map(option => {
	                                const active = values.secondaryEthnicity === option;
	                                return (
	                                  <button
	                                    key={option}
	                                    type="button"
	                                    onClick={() => { updateValue('secondaryEthnicity', option); markSectionTouched('creator'); }}
	                                    className={`px-3 h-8 rounded-full border text-xs transition-colors ${active ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border-gray-200 text-gray-600 hover:border-indigo-600'} dark:border-white/10 ${active ? 'dark:bg-indigo-500 dark:border-indigo-500 dark:text-white' : 'dark:bg-white/5 dark:text-white/60 dark:hover:border-white/30'}`}
	                                  >
	                                    {option}
	                                  </button>
	                                );
	                              })}
	                            </div>
	                          </div>
	                          <div className="space-y-2">
	                            <span className="text-xs text-gray-600 dark:text-white/60">Skin tone</span>
	                            <div className="flex flex-wrap gap-2">
	                              {SKIN_TONE_OPTIONS.map(option => {
	                                const active = values.secondarySkinTone === option;
	                                return (
	                                  <button
	                                    key={option}
	                                    type="button"
	                                    onClick={() => { updateValue('secondarySkinTone', option); markSectionTouched('creator'); }}
	                                    className={`px-3 h-8 rounded-full border text-xs transition-colors ${active
	                                      ? 'bg-indigo-600 text-white border-indigo-600 dark:border-white/10 dark:bg-indigo-500 dark:border-indigo-500 dark:text-white'
	                                      : 'bg-white border-gray-200 text-gray-600 hover:border-indigo-600 dark:border-white/10 dark:bg-white/5 dark:text-white/60 dark:hover:border-white/30'
	                                      }`}
	                                  >
	                                    {option}
	                                  </button>
	                                );
	                              })}
	                            </div>
	                          </div>
	                          <div className="space-y-2">
	                            <span className="text-xs text-gray-600 dark:text-white/60">Eye color</span>
	                            <div className="flex gap-2 flex-wrap">
	                              {EYE_COLOR_OPTIONS.map(option => {
	                                const active = values.secondaryEyeColor === option;
	                                return (
	                                  <button
	                                    key={option}
	                                    type="button"
	                                    onClick={() => { updateValue('secondaryEyeColor', option); markSectionTouched('creator'); }}
	                                    className={`h-8 px-3 rounded-full border text-xs transition-colors ${active
	                                      ? 'bg-indigo-600 text-white border-indigo-600 dark:border-white/10 dark:bg-indigo-500 dark:border-indigo-500 dark:text-white'
	                                      : 'bg-white border-gray-200 text-gray-600 hover:border-indigo-600 dark:border-white/10 dark:bg-white/5 dark:text-white/60 dark:hover:border-white/30'
	                                      }`}
	                                  >
	                                    {option}
	                                  </button>
	                                );
	                              })}
	                            </div>
	                          </div>
	                          <div className="space-y-2">
	                            <span className="text-xs text-gray-600 dark:text-white/60">Hair</span>
	                            <div className="grid grid-cols-3 gap-2">
	                              {(['Short', 'Shoulder', 'Long'] as const).map(option => {
	                                const active = values.secondaryHairLength === option;
	                                return (
	                                  <button
	                                    key={option}
	                                    type="button"
	                                    onClick={() => { updateValue('secondaryHairLength', option); markSectionTouched('creator'); }}
	                                    className={`px-3 h-8 rounded-full border text-xs transition-colors ${active ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border-gray-200 text-gray-600 hover:border-indigo-600'} dark:border-white/10 ${active ? 'dark:bg-indigo-500 dark:border-indigo-500 dark:text-white' : 'dark:bg-white/5 dark:text-white/60 dark:hover:border-white/30'}`}
	                                  >
	                                    {option}
	                                  </button>
	                                );
	                              })}
	                            </div>
	                            <div className="flex flex-wrap gap-2">
	                              {[...HAIR_TEXTURE_OPTIONS, 'Custom'].map(option => {
	                                const active = values.secondaryHairTexture === option;
	                                const label = option === 'Coily/Kinky' ? 'Coily / Kinky' : option;
	                                return (
	                                  <button
	                                    key={option}
	                                    type="button"
	                                    onClick={() => { updateValue('secondaryHairTexture', option); markSectionTouched('creator'); }}
	                                    className={`px-3 h-8 rounded-full border text-xs transition-colors ${active ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border-gray-200 text-gray-600 hover:border-indigo-600'} dark:border-white/10 ${active ? 'dark:bg-indigo-500 dark:border-indigo-500 dark:text-white' : 'dark:bg-white/5 dark:text-white/60 dark:hover:border-white/30'}`}
	                                  >
	                                    {label}
	                                  </button>
	                                );
	                              })}
	                            </div>
	                            <div className="flex flex-wrap gap-2">
	                              {HAIR_COLOR_OPTIONS.map(option => {
	                                const active = values.secondaryHairColor === option;
	                                return (
	                                  <button
	                                    key={option}
	                                    type="button"
	                                    onClick={() => { updateValue('secondaryHairColor', option); markSectionTouched('creator'); }}
	                                    className={`px-3 h-8 rounded-full border text-xs transition-colors ${active ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border-gray-200 text-gray-600 hover:border-indigo-600'} dark:border-white/10 ${active ? 'dark:bg-indigo-500 dark:border-indigo-500 dark:text-white' : 'dark:bg-white/5 dark:text-white/60 dark:hover:border-white/30'}`}
	                                  >
	                                    {option}
	                                  </button>
	                                );
	                              })}
	                            </div>
		                          </div>
		                        </div>
		                      )}

	                      <div className="space-y-2">
	                        <span className="text-xs text-gray-600 dark:text-white/60">Ethnicity</span>
	                        <div className="flex flex-wrap gap-2">
	                          {(
	                            [
                              'Non-specific',
                              'White / European descent',
                              'Black / African descent',
                              'Latino / Hispanic',
                            ] as const
                          ).map(option => {
                            const active = values.ethnicity === option;
                            return (
                              <button
                                key={option}
                                type="button"
                                onClick={() => { updateValue('ethnicity', option); markSectionTouched('creator'); }}
                                className={`px-3 h-8 rounded-full border text-xs transition-colors ${active
                                  ? 'bg-indigo-600 text-white border-indigo-600 dark:border-white/10 dark:bg-indigo-500 dark:border-indigo-500 dark:text-white'
                                  : 'bg-white border-gray-200 text-gray-600 hover:border-indigo-600 dark:border-white/10 dark:bg-white/5 dark:text-white/60 dark:hover:border-white/30'
                                  }`}
                              >
                                {option}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </section>

                    <section className="space-y-6">
                      <p className="text-[11px] uppercase tracking-[0.3em] text-gray-400 font-semibold dark:text-white/40">Appearance</p>

                      <div className="space-y-2">
                        <span className="text-xs text-gray-600 dark:text-white/60">Hair length</span>
                        <div className="grid grid-cols-3 gap-2">
                          {(['Short', 'Shoulder', 'Long'] as const).map(option => {
                            const active = values.hairLength === option;
                            return (
                              <button
                                key={option}
                                type="button"
                                onClick={() => { updateValue('hairLength', option); markSectionTouched('creator'); }}
                                className={`h-8 rounded-full border text-xs transition-colors ${active
                                  ? 'bg-indigo-600 text-white border-indigo-600 dark:border-white/10 dark:bg-indigo-500 dark:border-indigo-500 dark:text-white'
                                  : 'bg-white border-gray-200 text-gray-600 hover:border-indigo-600 dark:border-white/10 dark:bg-white/5 dark:text-white/60 dark:hover:border-white/30'
                                  }`}
                              >
                                {option}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                    </section>

                    <section className="space-y-4">
                      <p className="text-[11px] uppercase tracking-[0.3em] text-gray-400 font-semibold dark:text-white/40">Facial expression</p>
                      <div className="grid grid-cols-2 gap-2">
                        {(['Calm & Serene', 'Joyful & High-Energy'] as const).map(option => {
                          const active = values.facialExpression === option;
                          return (
                            <button
                              key={option}
                              type="button"
                              onClick={() => { updateValue('facialExpression', option); markSectionTouched('creator'); }}
                              className={`h-9 rounded-full border text-xs font-medium transition-colors ${active
                                ? 'bg-indigo-600 text-white border-indigo-600 dark:border-white/10 dark:bg-indigo-500 dark:border-indigo-500'
                                : 'bg-white border-gray-200 text-gray-600 hover:border-indigo-600 dark:border-white/10 dark:bg-white/5 dark:text-white/60 dark:hover:border-white/30'
                                }`}
                            >
                              {option}
                            </button>
                          );
                        })}
                      </div>
                    </section>

                    <section className="space-y-10 overflow-hidden transition-all duration-300 max-h-0 opacity-0 group-[.is-pro]:max-h-[4000px] group-[.is-pro]:opacity-100">
                      <p className="text-[11px] uppercase tracking-[0.3em] text-gray-400 font-semibold dark:text-white/40">Advanced controls</p>

                      <div className="space-y-2">
                        <span className="text-xs text-gray-600 dark:text-white/60">Gender (extended)</span>
                        <div className="flex flex-wrap gap-2">
                          {(['Trans', 'Non-binary', 'Gender non-conforming'] as const).map(option => {
                            const active = values.gender === (option as any);
                            return (
                              <button
                                key={option}
                                type="button"
                                onClick={() => { updateValue('gender', option as any); markSectionTouched('creator'); }}
                                className={`px-3 h-8 rounded-full border text-xs transition-colors ${active
                                  ? 'bg-indigo-600 text-white border-indigo-600 dark:border-white/10 dark:bg-indigo-500 dark:border-indigo-500 dark:text-white'
                                  : 'bg-white border-gray-200 text-gray-600 hover:border-indigo-600 dark:border-white/10 dark:bg-white/5 dark:text-white/60 dark:hover:border-white/30'
                                  }`}
                              >
                                {option}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <span className="text-xs text-gray-600 dark:text-white/60">Ethnicity (extended)</span>
                        <div className="flex flex-wrap gap-2">
                          {(['Asian', 'Middle Eastern', 'South Asian', 'Mixed'] as const).map(option => {
                            const active = values.ethnicity === option;
                            return (
                              <button
                                key={option}
                                type="button"
                                onClick={() => { updateValue('ethnicity', option); markSectionTouched('creator'); }}
                                className={`px-3 h-8 rounded-full border text-xs transition-colors ${active
                                  ? 'bg-indigo-600 text-white border-indigo-600 dark:border-white/10 dark:bg-indigo-500 dark:border-indigo-500 dark:text-white'
                                  : 'bg-white border-gray-200 text-gray-600 hover:border-indigo-600 dark:border-white/10 dark:bg-white/5 dark:text-white/60 dark:hover:border-white/30'
                                  }`}
                              >
                                {option}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <span className="text-xs text-gray-600 dark:text-white/60">Skin tone</span>
                        <div className="flex flex-wrap gap-2">
                          {SKIN_TONE_OPTIONS.map(option => {
                            const active = values.skinTone === option;
                            return (
                              <button
                                key={option}
                                type="button"
                                onClick={() => { updateValue('skinTone', option); markSectionTouched('creator'); }}
                                className={`px-3 h-8 rounded-full border text-xs transition-colors ${active
                                  ? 'bg-indigo-600 text-white border-indigo-600 dark:border-white/10 dark:bg-indigo-500 dark:border-indigo-500 dark:text-white'
                                  : 'bg-white border-gray-200 text-gray-600 hover:border-indigo-600 dark:border-white/10 dark:bg-white/5 dark:text-white/60 dark:hover:border-white/30'
                                  }`}
                              >
                                {option}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <span className="text-xs text-gray-600 dark:text-white/60">Eye color</span>
                        <div className="flex gap-2 flex-wrap">
                          {EYE_COLOR_OPTIONS.map(option => {
                            const active = values.eyeColor === option;
                            return (
                              <button
                                key={option}
                                type="button"
                                onClick={() => { updateValue('eyeColor', option); markSectionTouched('creator'); }}
                                className={`h-8 px-3 rounded-full border text-xs transition-colors ${active
                                  ? 'bg-indigo-600 text-white border-indigo-600 dark:border-white/10 dark:bg-indigo-500 dark:border-indigo-500 dark:text-white'
                                  : 'bg-white border-gray-200 text-gray-600 hover:border-indigo-600 dark:border-white/10 dark:bg-white/5 dark:text-white/60 dark:hover:border-white/30'
                                  }`}
                              >
                                {option}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <span className="text-xs text-gray-600 dark:text-white/60">Body type</span>
                        <div className="flex flex-wrap gap-2">
                          {BODY_TYPE_OPTIONS.map(option => {
                            const active = values.bodyType === option;
                            return (
                              <button
                                key={option}
                                type="button"
                                onClick={() => { updateValue('bodyType', option as Step3Values['bodyType']); markSectionTouched('creator'); }}
                                className={`px-3 h-8 rounded-full border text-xs transition-colors ${active
                                  ? 'bg-indigo-600 text-white border-indigo-600 dark:border-white/10 dark:bg-indigo-500 dark:border-indigo-500 dark:text-white'
                                  : 'bg-white border-gray-200 text-gray-600 hover:border-indigo-600 dark:border-white/10 dark:bg-white/5 dark:text-white/60 dark:hover:border-white/30'
                                  }`}
                              >
                                {option}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <span className="text-xs text-gray-600 dark:text-white/60">Hair state</span>
                        <div className="flex flex-wrap gap-2">
                          {(
                            [
                              { label: 'Has hair', value: 'natural' },
                              { label: 'Bald', value: 'bald' },
                            ] as const
                          ).map(option => {
                            const active = values.hairState === option.value;
                            return (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() => { updateValue('hairState', option.value); markSectionTouched('creator'); }}
                                className={`px-3 h-8 rounded-full border text-xs transition-colors ${active
                                  ? 'bg-indigo-600 text-white border-indigo-600 dark:border-white/10 dark:bg-indigo-500 dark:border-indigo-500 dark:text-white'
                                  : 'bg-white border-gray-200 text-gray-600 hover:border-indigo-600 dark:border-white/10 dark:bg-white/5 dark:text-white/60 dark:hover:border-white/30'
                                  }`}
                              >
                                {option.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {values.hairState === 'natural' && (
                        <>
                          <div className="space-y-2">
                            <span className="text-xs text-gray-600 dark:text-white/60">Hair length (advanced)</span>
                            <div className="flex flex-wrap gap-2">
                              {(['Buzzcut', 'Chin-length', 'Very long'] as const).map(option => {
                                const active = values.hairLength === option;
                                return (
                                  <button
                                    key={option}
                                    type="button"
                                    onClick={() => { updateValue('hairLength', option); markSectionTouched('creator'); }}
                                    className={`px-3 h-8 rounded-full border text-xs transition-colors ${active
                                      ? 'bg-indigo-600 text-white border-indigo-600 dark:border-white/10 dark:bg-indigo-500 dark:border-indigo-500 dark:text-white'
                                      : 'bg-white border-gray-200 text-gray-600 hover:border-indigo-600 dark:border-white/10 dark:bg-white/5 dark:text-white/60 dark:hover:border-white/30'
                                      }`}
                                  >
                                    {option}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <span className="text-xs text-gray-600 dark:text-white/60">Hair texture</span>
                            <div className="flex flex-wrap gap-2">
                              {[...HAIR_TEXTURE_OPTIONS, 'Custom'].map(option => {
                                const active = values.hairTexture === option;
                                const label = option === 'Coily/Kinky' ? 'Coily / Kinky' : option;
                                return (
                                  <button
                                    key={option}
                                    type="button"
                                    onClick={() => { updateValue('hairTexture', option); markSectionTouched('creator'); }}
                                    className={`px-3 h-8 rounded-full border text-xs transition-colors ${active
                                      ? 'bg-indigo-600 text-white border-indigo-600 dark:border-white/10 dark:bg-indigo-500 dark:border-indigo-500 dark:text-white'
                                      : 'bg-white border-gray-200 text-gray-600 hover:border-indigo-600 dark:border-white/10 dark:bg-white/5 dark:text-white/60 dark:hover:border-white/30'
                                      }`}
                                  >
                                    {label}
                                  </button>
                                );
                              })}
                            </div>
                            {values.hairTexture === 'Custom' && (
                              <div className="pt-2">
                                <input
                                  type="text"
                                  value={values.hairTextureCustom}
                                  onChange={(event) => { updateValue('hairTextureCustom', event.target.value); markSectionTouched('creator'); }}
                                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 dark:border-white/10 dark:bg-white/5 dark:text-white"
                                  placeholder="Describe hair texture..."
                                />
                              </div>
                            )}
                          </div>

                          <div className="space-y-2">
                            <span className="text-xs text-gray-600 dark:text-white/60">Hair color</span>
                            <div className="flex flex-wrap gap-2">
                              {HAIR_COLOR_OPTIONS.map(option => {
                                const active = values.hairColor === option;
                                return (
                                  <button
                                    key={option}
                                    type="button"
                                    onClick={() => { updateValue('hairColor', option); markSectionTouched('creator'); }}
                                    className={`px-3 h-8 rounded-full border text-xs transition-colors ${active
                                      ? 'bg-indigo-600 text-white border-indigo-600 dark:border-white/10 dark:bg-indigo-500 dark:border-indigo-500 dark:text-white'
                                      : 'bg-white border-gray-200 text-gray-600 hover:border-indigo-600 dark:border-white/10 dark:bg-white/5 dark:text-white/60 dark:hover:border-white/30'
                                      }`}
                                  >
                                    {option}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </>
                      )}

                      <div className="space-y-2">
                        <span className="text-xs text-gray-600 dark:text-white/60">Facial expression (advanced)</span>
                        <div className="flex flex-wrap gap-2">
                          {(
                            [
                              'Confident & Editorial',
                              'Playful & Candid',
                              'Hustle & Juggle',
                              'Stressed but Determined',
                              'Relieved / Recovered',
                            ] as const
                          ).map(option => {
                            const active = values.facialExpression === option;
                            return (
                              <button
                                key={option}
                                type="button"
                                onClick={() => { updateValue('facialExpression', option); markSectionTouched('creator'); }}
                                className={`px-3 h-8 rounded-full border text-xs transition-colors ${active
                                  ? 'bg-indigo-600 text-white border-indigo-600 dark:border-white/10 dark:bg-indigo-500 dark:border-indigo-500'
                                  : 'bg-white border-gray-200 text-gray-600 hover:border-indigo-600 dark:border-white/10 dark:bg-white/5 dark:text-white/60 dark:hover:border-white/30'
                                  }`}
                              >
                                {option}
                              </button>
                            );
                          })}
                        </div>
                      </div>

	                      <div className={`flex items-center justify-between pt-4 ${(!hasFirstGenerationComplete || hasModelReference) ? 'opacity-50' : ''}`}>
	                        <div>
	                          <p className="text-xs text-gray-600 dark:text-white/60">Keep same person</p>
	                          <p className="text-[11px] text-gray-400 dark:text-white/40">Locks identity across renders (available after first generation)</p>
	                        </div>
	                        <Toggle
	                          checked={values.sameCreatorAcrossScenes}
	                          disabled={!hasFirstGenerationComplete || hasModelReference}
	                          onCheckedChange={(next) => {
	                            if (!hasFirstGenerationComplete || hasModelReference) return;
	                            updateValue('sameCreatorAcrossScenes', next);
	                            markSectionTouched('creator');
	                          }}
	                          aria-label="Keep same person"
	                        />
                      </div>
                    </section>
                  </>
                )}
              </div>
            </div>

            {/* Legacy version kept for reference (disabled) */}
            {false && (
              <SmoothAccordion
                icon={User}
                title="Creator / Person"
                tooltip="Define the person in your scene"
                isOpen={openAccordionId === 'creator'}
                onToggle={() => toggleSection('creator')}
                isRequired
                isTouched={touchedSections.has('creator')}
                variant="primary"
                ui="tokens"
              >
                {isPersonDisabled ? (
                  <div className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-500 dark:border-white/10 dark:bg-black/20 dark:text-white/60">
                    Creator / Person controls are disabled in Product Mode.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Core */}
                    <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-6 dark:border-white/10 dark:bg-white/5">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-semibold text-gray-900 dark:text-white">Age</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{values.age}</span>
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
                            ['--progress' as any]: `${ageSliderProgress}%`,
                          }}
                        />
                      </div>

                      <div className="space-y-2">
                        <span className="text-xs font-semibold text-gray-900 dark:text-white">Gender</span>
                        <div className="flex flex-wrap gap-2">
                          <Chip
                            selected={values.gender === 'Female'}
                            onClick={() => { updateValue('gender', 'Female' as any); markSectionTouched('creator'); }}
                            size="md"
                          >
                            Female
                          </Chip>
                          <Chip
                            selected={values.gender === 'Male'}
                            onClick={() => { updateValue('gender', 'Male' as any); markSectionTouched('creator'); }}
                            size="md"
                          >
                            Male
                          </Chip>
                        </div>
                      </div>

	                      <div className="space-y-2">
	                        <span className="text-xs font-semibold text-gray-900 dark:text-white">People</span>
	                        {values.ugcRealMode && (
	                          <p className="text-[11px] text-gray-500 dark:text-white/40">
	                            Raw Domestic UGC: multiple people are supported, but results may be less consistent.
	                          </p>
	                        )}
	                        <div className="flex flex-wrap gap-2">
	                          <Chip
	                            selected={values.personCount === 'single'}
	                            onClick={() => {
	                              updateValue('personCount', 'single');
	                              updateValue('editSecondaryPerson', false);
	                              markSectionTouched('creator');
	                            }}
	                            size="md"
	                          >
	                            Single
	                          </Chip>
	                          <Chip
	                            selected={values.personCount === 'couple'}
	                            onClick={() => {
	                              updateValue('personCount', 'couple');
	                              updateValue('editSecondaryPerson', true);
	                              if (!values.coupleStaging) updateValue('coupleStaging', 'Together (side-by-side)');
	                              if (!values.secondaryAge || values.secondaryAge === 30) updateValue('secondaryAge', Math.min(90, Math.max(18, values.age + 2)));
	                              markSectionTouched('creator');
	                            }}
	                            size="md"
	                          >
	                            Couple
	                          </Chip>
	                          <Chip
	                            selected={values.personCount === 'group'}
	                            onClick={() => {
	                              updateValue('personCount', 'group');
	                              updateValue('editSecondaryPerson', false);
	                              markSectionTouched('creator');
	                            }}
	                            size="md"
	                          >
	                            Group
	                          </Chip>
	                        </div>
	                        {values.personCount === 'couple' && (
	                          <div className="flex flex-wrap gap-2">
	                            <Chip
                              selected={values.coupleSex === 'same'}
                              onClick={() => {
                                updateValue('coupleSex', 'same');
                                markSectionTouched('creator');
                              }}
                              tooltip="Couple: same sex"
                              size="md"
                            >
                              Same sex
                            </Chip>
                            <Chip
                              selected={values.coupleSex === 'different'}
                              onClick={() => {
                                updateValue('coupleSex', 'different');
                                markSectionTouched('creator');
                              }}
                              tooltip="Couple: different sex"
                              size="md"
                            >
                              Different sex
	                            </Chip>
	                          </div>
	                        )}
	                        {values.personCount === 'couple' && (
	                          <div className="flex flex-wrap gap-2 pt-1">
	                            {RITUAL_COUPLE_STAGING_OPTIONS.map(option => (
	                              <Chip
	                                key={option}
	                                selected={values.coupleStaging === option}
	                                onClick={() => {
	                                  updateValue('coupleStaging', option);
	                                  markSectionTouched('creator');
	                                }}
	                                size="md"
	                              >
	                                {option}
	                              </Chip>
	                            ))}
	                          </div>
	                        )}
	                      </div>

                      <div className="space-y-2">
                        <span className="text-xs font-semibold text-gray-900 dark:text-white">Ethnicity</span>
                        <div className="flex flex-wrap gap-2">
                          {(
                            [
                              'Non-specific',
                              'White / European descent',
                              'Black / African descent',
                              'Latino / Hispanic',
                            ] as const
                          ).map(option => {
                            const active = values.ethnicity === option;
                            return (
                              <button
                                key={option}
                                type="button"
                                onClick={() => { updateValue('ethnicity', option); markSectionTouched('creator'); }}
                                className={`px-3 h-8 rounded-full border text-xs transition-colors ${active ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border-gray-200 text-gray-600 hover:border-indigo-600'} dark:border-white/10 ${active ? 'dark:bg-indigo-500 dark:border-indigo-500 dark:text-white' : 'dark:bg-white/5 dark:text-white/60 dark:hover:border-white/30'}`}
                              >
                                {option}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <span className="text-xs font-semibold text-gray-900 dark:text-white">Hair length</span>
                        <div className="grid grid-cols-3 gap-2">
                          {(['Short', 'Shoulder', 'Long'] as const).map(option => {
                            const active = values.hairLength === option;
                            return (
                              <button
                                key={option}
                                type="button"
                                onClick={() => { updateValue('hairLength', option); markSectionTouched('creator'); }}
                                className={`h-8 rounded-full border text-xs transition-colors ${active ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border-gray-200 text-gray-600 hover:border-indigo-600'} dark:border-white/10 ${active ? 'dark:bg-indigo-500 dark:border-indigo-500 dark:text-white' : 'dark:bg-white/5 dark:text-white/60 dark:hover:border-white/30'}`}
                              >
                                {option}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <span className="text-xs font-semibold text-gray-900 dark:text-white">Facial expression</span>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => { updateValue('facialExpression', 'Calm & Serene'); markSectionTouched('creator'); }}
                            className={`h-9 rounded-full border text-xs font-medium transition-colors ${values.facialExpression === 'Calm & Serene' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border-gray-200 text-gray-600 hover:border-indigo-600'} dark:border-white/10 ${values.facialExpression === 'Calm & Serene' ? 'dark:bg-indigo-500 dark:border-indigo-500' : 'dark:bg-white/5 dark:text-white/60 dark:hover:border-white/30'}`}
                          >
                            Calm &amp; Serene
                          </button>
                          <button
                            type="button"
                            onClick={() => { updateValue('facialExpression', 'Joyful & High-Energy'); markSectionTouched('creator'); }}
                            className={`h-9 rounded-full border text-xs font-medium transition-colors ${values.facialExpression === 'Joyful & High-Energy'
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'bg-white border-gray-200 text-gray-600 hover:border-indigo-600'
                              } dark:border-white/10 ${values.facialExpression === 'Joyful & High-Energy'
                                ? 'dark:bg-indigo-500 dark:border-indigo-500 dark:text-white'
                                : 'dark:bg-white/5 dark:text-white/60 dark:hover:border-white/30'
                              }`}
                          >
                            Joyful &amp; High-Energy
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Advanced */}
                    <div
                      className="rounded-xl border border-gray-200 bg-white dark:border-white/10 dark:bg-white/5"
                      data-person-pro-wrapper
                    >
                      <div className="border-t border-gray-100 px-4 py-3 bg-white">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-indigo-600 font-extrabold">
                          Advanced identity controls
                        </p>
                      </div>
                      <div className="px-4 py-4 space-y-6">
                        {/* SECTION 1 – Extended Identity */}
                        <section className="space-y-4">
                          <p className="text-[11px] uppercase tracking-[0.2em] text-gray-500">SECTION 1 – EXTENDED IDENTITY</p>

                          <div className="space-y-2">
                            <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400">GENDER</p>
                            <div className="flex flex-wrap gap-2">
                              {(['Trans', 'Non-binary', 'Gender non-conforming'] as const).map(option => (
                                <button
                                  key={option}
                                  type="button"
                                  onClick={() => { updateValue('gender', option as any); markSectionTouched('creator'); }}
                                  className="px-3 h-8 rounded-full border border-gray-200 bg-white text-xs font-semibold text-gray-600 transition-colors hover:border-indigo-600 dark:border-white/10 dark:bg-white/5 dark:text-white/60 dark:hover:border-white/30"
                                >
                                  {option}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400">ETHNICITY</p>
                            <div className="flex flex-wrap gap-2">
                              {(['Asian', 'Middle Eastern', 'South Asian', 'Mixed'] as const).map(option => (
                                <button
                                  key={option}
                                  type="button"
                                  onClick={() => { updateValue('ethnicity', option); markSectionTouched('creator'); }}
                                  className="px-3 h-8 rounded-full border border-gray-200 bg-white text-xs font-semibold text-gray-600 transition-colors hover:border-indigo-600 dark:border-white/10 dark:bg-white/5 dark:text-white/60 dark:hover:border-white/30"
                                >
                                  {option}
                                </button>
                              ))}
                            </div>
                          </div>
                        </section>

                        <div className="border-t border-gray-100"></div>

                        {/* SECTION 2 – Physical Appearance */}
                        <section className="space-y-4 pt-4">
                          <p className="text-[11px] uppercase tracking-[0.2em] text-gray-500">SECTION 2 – PHYSICAL APPEARANCE</p>

                          <div className="space-y-2">
                            <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400">SKIN TONE</p>
                            <div className="flex flex-wrap gap-2">
                              {SKIN_TONE_OPTIONS.map(option => (
                                <button
                                  key={option}
                                  type="button"
                                  onClick={() => { updateValue('skinTone', option); markSectionTouched('creator'); }}
                                  className="px-3 h-8 rounded-full border border-gray-200 bg-white text-xs font-semibold text-gray-600 transition-colors hover:border-indigo-600 dark:border-white/10 dark:bg-white/5 dark:text-white/60 dark:hover:border-white/30"
                                >
                                  {option}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400">EYE COLOR</p>
                            <div className="flex flex-wrap gap-2">
                              {EYE_COLOR_OPTIONS.map(option => (
                                <button
                                  key={option}
                                  type="button"
                                  onClick={() => { updateValue('eyeColor', option); markSectionTouched('creator'); }}
                                  className="px-3 h-8 rounded-full border border-gray-200 bg-white text-xs font-semibold text-gray-600 transition-colors hover:border-indigo-600 dark:border-white/10 dark:bg-white/5 dark:text-white/60 dark:hover:border-white/30"
                                >
                                  {option}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400">BODY TYPE</p>
                            <div className="flex flex-wrap gap-2">
                              {BODY_TYPE_OPTIONS.map(option => (
                                <button
                                  key={option}
                                  type="button"
                                  onClick={() => { updateValue('bodyType', option as Step3Values['bodyType']); markSectionTouched('creator'); }}
                                  className="px-3 h-8 rounded-full border border-gray-200 bg-white text-xs font-semibold text-gray-600 transition-colors hover:border-indigo-600 dark:border-white/10 dark:bg-white/5 dark:text-white/60 dark:hover:border-white/30"
                                >
                                  {option}
                                </button>
                              ))}
                            </div>
                          </div>
                        </section>

                        <div className="border-t border-gray-100"></div>

                        {/* SECTION 3 – Hair Details */}
                        <section className="space-y-4 pt-4">
                          <p className="text-[11px] uppercase tracking-[0.2em] text-gray-500">SECTION 3 – HAIR DETAILS</p>

                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs text-gray-600">Hair</p>
                                <p className="text-[11px] text-gray-400">
                                  {values.hairState === 'bald' ? 'Bald' : 'Has hair'}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  updateValue('hairState', values.hairState === 'bald' ? 'natural' : 'bald');
                                  markSectionTouched('creator');
                                }}
                                className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${values.hairState === 'bald'
                                  ? 'bg-amber-500/10 text-amber-700 border-amber-200'
                                  : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-600 hover:text-gray-900'
                                  } dark:border-white/10 ${values.hairState === 'bald'
                                    ? 'dark:bg-amber-500/10 dark:text-amber-200 dark:border-amber-400/30'
                                    : 'dark:bg-white/5 dark:text-white/60 dark:hover:border-white/30 dark:hover:text-white'
                                  }`}
                              >
                                {values.hairState === 'bald' ? 'Has hair' : 'Bald'}
                              </button>
                            </div>

                            {values.hairState === 'natural' && (
                              <div className="space-y-3">
                                <div className="space-y-2">
                                  <p className="text-xs text-gray-500">Length (advanced)</p>
                                  <div className="flex flex-wrap gap-2">
                                    {(['Buzzcut', 'Chin-length', 'Very long'] as const).map(option => (
                                      <button
                                        key={option}
                                        type="button"
                                        onClick={() => {
                                          updateValue('hairLength', option);
                                          updateValue('hairLengthCustom', '');
                                          markSectionTouched('creator');
                                        }}
                                        className="px-3 h-8 rounded-full border border-gray-200 bg-white text-xs font-semibold text-gray-600 transition-colors hover:border-indigo-600 dark:border-white/10 dark:bg-white/5 dark:text-white/60 dark:hover:border-white/30"
                                      >
                                        {option}
                                      </button>
                                    ))}
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <p className="text-xs text-gray-500">Texture</p>
                                  <div className="flex flex-wrap gap-2">
                                    {[...HAIR_TEXTURE_OPTIONS, 'Custom'].map(option => (
                                      <button
                                        key={option}
                                        type="button"
                                        onClick={() => {
                                          updateValue('hairTexture', option);
                                          if (option !== 'Custom' && values.hairTextureCustom) {
                                            updateValue('hairTextureCustom', '');
                                          }
                                          markSectionTouched('creator');
                                        }}
                                        className="px-3 h-8 rounded-full border border-gray-200 bg-white text-xs font-semibold text-gray-600 transition-colors hover:border-indigo-600 dark:border-white/10 dark:bg-white/5 dark:text-white/60 dark:hover:border-white/30"
                                      >
                                        {option}
                                      </button>
                                    ))}
                                  </div>
                                  {values.hairTexture === 'Custom' && (
                                    <input
                                      value={values.hairTextureCustom}
                                      onChange={(event) => {
                                        updateValue('hairTextureCustom', event.target.value);
                                        markSectionTouched('creator');
                                      }}
                                      placeholder="Describe hair texture..."
                                      className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/40 dark:focus:border-white/30"
                                    />
                                  )}
                                </div>

                                <div className="space-y-2">
                                  <p className="text-xs text-gray-500">Color</p>
                                  <div className="flex flex-wrap gap-2">
                                    {HAIR_COLOR_OPTIONS.map(option => (
                                      <button
                                        key={option}
                                        type="button"
                                        onClick={() => { updateValue('hairColor', option); markSectionTouched('creator'); }}
                                        className="px-3 h-8 rounded-full border border-gray-200 bg-white text-xs font-semibold text-gray-600 transition-colors hover:border-indigo-600 dark:border-white/10 dark:bg-white/5 dark:text-white/60 dark:hover:border-white/30"
                                      >
                                        {option}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </section>

                        <div className="border-t border-gray-100"></div>

                        {/* SECTION 4 – Emotional Nuance */}
                        <section className="space-y-3 pt-4">
                          <p className="text-[11px] uppercase tracking-[0.2em] text-gray-500">SECTION 4 – EMOTIONAL NUANCE</p>
                          <div className="space-y-2">
                            <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400">ADVANCED FACIAL EXPRESSIONS</p>
                            <div className="flex flex-wrap gap-2">
                              {['Confident & Editorial', 'Playful & Candid', 'Hustle & Juggle', 'Stressed but Determined'].map(option => (
                                <button
                                  key={option}
                                  type="button"
                                  onClick={() => { updateValue('facialExpression', option); markSectionTouched('creator'); }}
                                  className="px-3 h-8 rounded-full border border-gray-200 bg-white text-xs font-semibold text-gray-600 transition-colors hover:border-indigo-600 dark:border-white/10 dark:bg-white/5 dark:text-white/60 dark:hover:border-white/30"
                                >
                                  {option}
                                </button>
                              ))}
                            </div>
                          </div>
                        </section>

                        <div className="border-t border-gray-100"></div>

                        {/* SECTION 5 – Gaze & Persistence */}
                        <section className="space-y-4 pt-4">
                          <p className="text-[11px] uppercase tracking-[0.2em] text-gray-500">SECTION 5 – GAZE &amp; PERSISTENCE</p>

                          <div className="space-y-3">
                            <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400">EYE DIRECTION</p>
                            <div className="flex flex-wrap gap-2">
                              {EYE_DIRECTION_OPTIONS.map(option => (
                                <button
                                  key={option}
                                  type="button"
                                  onClick={() => { updateValue('eyeDirection', option); markSectionTouched('creator'); }}
                                  className="px-3 h-8 rounded-full border border-gray-200 bg-white text-xs font-semibold text-gray-600 transition-colors hover:border-indigo-600 dark:border-white/10 dark:bg-white/5 dark:text-white/60 dark:hover:border-white/30"
                                >
                                  {option}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs text-gray-600 dark:text-white/60">Keep same person</p>
                              <p className="text-[11px] text-gray-400 dark:text-white/40">
                                {hasModelReference
                                  ? 'Disabled while Model Reference is active'
                                  : hasFirstGenerationComplete
                                    ? (values.sameCreatorAcrossScenes ? 'Same person across generations' : 'Different person each generation')
                                    : 'Available after first generation'}
                              </p>
                            </div>
                            <Toggle
                              checked={values.sameCreatorAcrossScenes}
                              disabled={!hasFirstGenerationComplete || hasModelReference}
                              aria-label="Keep same person"
                              onCheckedChange={(next) => {
                                updateValue('sameCreatorAcrossScenes', next);
                                markSectionTouched('creator');
                              }}
                            />
                          </div>
                        </section>
                      </div>
                    </div>
                  </div>
                )}
              </SmoothAccordion>
            )}

            {/* Legacy Props Section (Restored for Lifestyle) */}
            {!isProductMode && (
              <SmoothAccordion
                icon={Sparkles}
                title="Props"
                tooltip="Add objects to the scene"
                isOpen={openAccordionId === 'props'}
                onToggle={() => toggleSection('props')}
                isTouched={touchedSections.has('props')}
                variant="primary"
              >
                <div className="space-y-4">
                  <div className={SECTION_GROUP_CLASS}>
                    <p className={GROUP_LABEL_CLASS}>SCENE PROPS</p>
                    <p className="text-[11px] text-gray-500">Select props to include in the scene.</p>
                    <div className="flex flex-wrap gap-2">
                      {/* Note: Assuming generic props list or custom input since original list is missing from context */}
                      <div className="w-full">
                        <p className="text-xs uppercase tracking-wider text-indigo-600 mb-2">CUSTOM PROPS</p>
                        <textarea
                          value={values.customProps}
                          onChange={(e) => {
                            updateValue('customProps', e.target.value);
                            markSectionTouched('props');
                          }}
                          placeholder="e.g. coffee cup, laptop, yoga mat..."
                          className="w-full rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-500 min-h-[80px]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </SmoothAccordion>
            )}


            {/* RAW DOMESTIC UGC */}
            <SmoothAccordion
              icon={Smartphone}
              title="Raw Domestic UGC"
              tooltip="Careless front-camera capture at home"
              isOpen={openAccordionId === 'realism'}
              onToggle={() => toggleSection('realism')}
              isTouched={hasAnyUgcLayerSelection}
              isActive={values.ugcRealMode}
              variant="expert"
            >
              <div id="ugc-real-mode">
                <div className="pt-2 pb-4 px-2">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Raw Domestic UGC</p>
                        <p className="text-xs text-gray-500">Careless front-camera capture at home</p>
                      </div>
                      <Toggle
                        checked={values.ugcRealMode}
                        aria-label="Enable Raw Domestic UGC"
                        onCheckedChange={(newValue) => {
                          updateValue('ugcRealMode', newValue);
                          if (newValue) {
                            updateValue('ugcImperfectionLevel', 'high');
                            updateValue('personCount', 'single');
                            updateValue('editSecondaryPerson', false);
                            updateValue('formulationStoryEnabled', false);
                            updateValue('facialExpression', 'Soft Smile');
                            updateValue('eyeDirection', 'Looking at camera');
                          }
                        }}
                      />
                    </div>

                    {values.ugcRealMode && (
                      <>
                        <p className="text-xs text-gray-500 mt-2 mb-4">
                          Pro controls are locked. The system handles everything automatically.
                        </p>
                        <div className="rounded-2xl border border-gray-200 bg-white p-4 space-y-2">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-extrabold">IMPERFECTION LEVEL</p>
                              <p className="text-[11px] text-gray-500 mt-1">How “ugly” the phone capture looks (noise/compression/focus mistakes).</p>
                            </div>
                            <div className="flex flex-wrap justify-end gap-2">
                              {(['low', 'medium', 'high'] as const).map(level => (
                                <button
                                  key={level}
                                  type="button"
                                  onClick={() => updateValue('ugcImperfectionLevel', level)}
                                  className={getPillClass(values.ugcImperfectionLevel === level)}
                                  title={level === 'high' ? 'Heaviest compression/noise, rolling shutter wobble, harsh mixed lighting' : level === 'medium' ? 'Noticeable compression/noise, minor motion blur' : 'Subtle imperfections only'}
                                >
                                  {level === 'low' ? 'Low' : level === 'medium' ? 'Medium' : 'High'}
                                </button>
                              ))}
                            </div>
                          </div>
                          <p className="text-[11px] text-gray-500">
                            Tip: use <span className="font-semibold">High</span> to match real “random selfie” ugliness. Use <span className="font-semibold">Low</span> if it gets too messy.
                          </p>
                        </div>
                        <div className="space-y-4">
                          {RAW_DOMESTIC_CAPTURE_SECTIONS.map(section => {
                            const currentSelections = (values[section.field] as string[]) || [];
                            return (
                              <div key={section.field} className="space-y-3">
                                <div>
                                  <p className="text-xs uppercase tracking-wider text-gray-500">{section.title}</p>
                                  <p className="text-xs text-gray-500 mt-1">{section.description}</p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {section.options.map(option => (
                                    <Chip
                                      key={option.id}
                                      selected={currentSelections.includes(option.id)}
                                      tooltip={option.detail}
                                      onClick={() => toggleUGCLayerSelection(section.field, option.id)}
                                      size="md"
                                    >
                                      {option.label}
                                    </Chip>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
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
              variant="primary"
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
                <SelectedOptionFooter
                  options={[
                    { value: 'Holding', label: 'Holding', description: 'Simple hero hold—product is visible and stable in-hand.' },
                    { value: 'Using', label: 'Using', description: 'Natural usage moment (apply, drink, spray, etc.).' },
                    { value: 'Presenting', label: 'Presenting', description: 'Creator displays the product clearly toward camera.' },
                    { value: 'Unboxing / Open Box', label: 'Unboxing / Open Box', description: 'Packaging interaction—opening or reveal moment.' },
                  ]}
                  selectedValue={values.productInteraction}
                />
                {values.productInteraction === 'Using' && (
                  <div className="mt-2">
                    <textarea
                      value={values.productUsageDescription}
                      onChange={(event) => {
                        updateValue('productUsageDescription', event.target.value);
                        markSectionTouched('productInteraction');
                      }}
                      placeholder="Describe what the person is naturally doing with the product"
                      className="w-full rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-500 resize-none"
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
              variant="expert"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-3 py-2">
                  <div>
                    <p className="text-sm text-gray-900">Enable outfit customization</p>
                    <p className="text-[11px] text-gray-500">Describe garments with text-only controls.</p>
                  </div>
                  <Toggle
                    checked={values.customClothesEnabled}
                    aria-label="Enable outfit customization"
                    onCheckedChange={(next) => {
                      updateValue('customClothesEnabled', next);
                      markSectionTouched('customClothes');
                    }}
                  />
                </div>

                {values.customClothesEnabled && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-[11px] uppercase tracking-wider text-gray-500">Garment type</label>
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
                      <label className="text-[11px] uppercase tracking-wider text-gray-500">Primary color</label>
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
                      <div className="mt-3 flex flex-wrap items-center gap-3 rounded-2xl border border-gray-200 bg-white px-3 py-2">
                        <div className="min-w-0">
                          <p className="text-[11px] uppercase tracking-wider text-gray-500">Custom color</p>
                          <p className="text-[11px] text-gray-500">Pick any hex color (e.g. #FFAA00).</p>
                        </div>
                        <div className="ml-auto flex items-center gap-2">
                          <input
                            type="color"
                            aria-label="Custom clothes color picker"
                            value={isHexColor(values.customClothesPrimaryColor) ? values.customClothesPrimaryColor : '#000000'}
                            onChange={(e) => {
                              updateValue('customClothesPrimaryColor', e.target.value.toUpperCase());
                              markSectionTouched('customClothes');
                            }}
                            className="h-9 w-9 cursor-pointer rounded-lg border border-gray-200 bg-white p-0"
                          />
                          <input
                            type="text"
                            inputMode="text"
                            maxLength={7}
                            placeholder="#000000"
                            value={isHexColor(values.customClothesPrimaryColor) ? values.customClothesPrimaryColor : ''}
                            onChange={(e) => {
                              const next = normalizeHexColor(e.target.value);
                              updateValue('customClothesPrimaryColor', next);
                              markSectionTouched('customClothes');
                            }}
                            className="w-[110px] rounded-xl border border-gray-200 bg-white px-2 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-500"
                          />
                          {isHexColor(values.customClothesPrimaryColor) && (
                            <button
                              type="button"
                              onClick={() => {
                                updateValue('customClothesPrimaryColor', '');
                                markSectionTouched('customClothes');
                              }}
                              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:border-indigo-600"
                            >
                              Clear
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] uppercase tracking-wider text-gray-500">Fit</label>
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
                      <label className="text-[11px] uppercase tracking-wider text-gray-500">Style</label>
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
                      <label className="text-[11px] uppercase tracking-wider text-gray-500">Material</label>
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
                      <label className="text-[11px] uppercase tracking-wider text-gray-500">Custom detail (optional)</label>
                      <input
                        type="text"
                        maxLength={100}
                        value={values.customClothesDetail}
                        onChange={(event) => {
                          updateValue('customClothesDetail', event.target.value.replace(/[\r\n]/g, ''));
                          markSectionTouched('customClothes');
                        }}
                        placeholder="small embroidered logo on the chest"
                        className="w-full rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                )}
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
              variant="primary"
            >
              <div className="space-y-3">
                {values.ugcRealMode && (
                  <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-xs text-gray-500">
                    Raw Domestic UGC still honors your environment choice—it just interprets it as incidental and unstaged. Pick any room; the engine keeps it messy, domestic, and low intent.
                  </div>
                )}
                {!values.ugcRealMode && (
                  <div className="rounded-2xl border border-gray-200 bg-white px-3 py-2 text-[11px] text-gray-600">
                    Environment describes location context only. Lighting, cleanliness, and overall polish remain engine-controlled—changing this won’t upgrade quality or staging.
                  </div>
                )}

                <p className="text-xs uppercase tracking-wider text-indigo-600">INDOOR</p>
                <div className="flex flex-wrap gap-2">
                  {ENVIRONMENT_INDOOR.map(env => (
                    <button
                      key={env.value}
                      type="button"
                      onClick={() => { updateValue('environment', env.value); markSectionTouched('environment'); }}
                      className={`flex items-center gap-2 ${getPillClass(values.environment === env.value)}`}
                    >
                      <env.icon className="w-4 h-4" />
                      <span>{env.value}</span>
                    </button>
                  ))}
                </div>

                {!values.ugcRealMode && (
                  <>
                    <p className="text-xs uppercase tracking-wider text-indigo-600 pt-2">OUTDOOR</p>
                    <div className="flex flex-wrap gap-2">
                      {ENVIRONMENT_OUTDOOR.map(env => (
                        <button
                          key={env.value}
                          type="button"
                          onClick={() => { updateValue('environment', env.value); markSectionTouched('environment'); }}
                          className={`flex items-center gap-2 ${getPillClass(values.environment === env.value)}`}
                        >
                          <env.icon className="w-4 h-4" />
                          <span>{env.value}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {/* CUSTOM ENVIRONMENT */}
                <div className="pt-3">
                  <p className="text-xs uppercase tracking-wider text-indigo-600 mb-2">CUSTOM ENVIRONMENT</p>
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
                    className="w-full rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

              </div>
            </SmoothAccordion>

            {/* Ritual Mode (Lifestyle-only) */}
            {!isProductMode && (
              <SmoothAccordion
                icon={Activity}
                title="Ritual Mode"
                tooltip="Lifestyle rituals + optional product-free renders"
                isOpen={openAccordionId === 'ritual'}
                onToggle={() => toggleSection('ritual')}
                isTouched={touchedSections.has('ritual')}
                isActive={values.ritualModeEnabled}
                variant="primary"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Ritual Mode</p>
                      <p className="text-xs text-gray-500">Generate wellness / lifestyle rituals. Optionally hide the product completely.</p>
                    </div>
                    <Toggle
                      checked={values.ritualModeEnabled}
                      aria-label="Enable Ritual Mode"
                      onCheckedChange={(next) => {
                        updateValue('ritualModeEnabled', next);
                        if (!next) {
                          updateValue('ritualHideProduct', false);
                          updateValue('ritualNoObjects', false);
                          updateValue('ritualCoupleStaging', 'Together (side-by-side)');
                          updateValue('ritualPosture', 'Auto');
                          updateValue('ritualActivities', []);
                          updateValue('ritualCustom', '');
                        }
                        markSectionTouched('ritual');
                      }}
                    />
                  </div>

                  {values.ritualModeEnabled && (
                    <>
                      <div className="rounded-2xl border border-gray-200 bg-white p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-[11px] uppercase tracking-wider text-gray-500">Hide product (lifestyle-only)</p>
                            <p className="text-[11px] text-gray-500">No product visible in the final image. Product upload becomes optional.</p>
                          </div>
                          <Toggle
                            checked={values.ritualHideProduct}
                            aria-label="Hide product in Ritual Mode"
                            onCheckedChange={(next) => {
                              updateValue('ritualHideProduct', next);
                              markSectionTouched('ritual');
                            }}
                          />
                        </div>
                      </div>

                      <div className="rounded-2xl border border-gray-200 bg-white p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-[11px] uppercase tracking-wider text-gray-500">No objects (people + environment only)</p>
                            <p className="text-[11px] text-gray-500">Avoid props and handheld items; focus on people and the environment.</p>
                          </div>
                          <Toggle
                            checked={values.ritualNoObjects}
                            aria-label="Disable objects in Ritual Mode"
                            onCheckedChange={(next) => {
                              updateValue('ritualNoObjects', next);
                              markSectionTouched('ritual');
                            }}
                          />
                        </div>
                      </div>

                      {values.personCount === 'couple' && (
                        <div className={SECTION_GROUP_CLASS}>
                          <p className={GROUP_LABEL_CLASS}>COUPLE STAGING</p>
                          <p className="text-[11px] text-gray-500">How the couple is positioned in the frame.</p>
                          <div className="flex flex-wrap gap-2">
                            {RITUAL_COUPLE_STAGING_OPTIONS.map(option => (
                              <button
                                key={option}
                                type="button"
                                onClick={() => {
                                  updateValue('ritualCoupleStaging', option);
                                  markSectionTouched('ritual');
                                }}
                                className={getPillClass(values.ritualCoupleStaging === option)}
                              >
                                {option}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className={SECTION_GROUP_CLASS}>
                        <p className={GROUP_LABEL_CLASS}>POSTURE</p>
                        <p className="text-[11px] text-gray-500">Guide the body posture for the ritual.</p>
                        <div className="flex flex-wrap gap-2">
                          {RITUAL_POSTURE_OPTIONS.map(option => (
                            <button
                              key={option}
                              type="button"
                              onClick={() => {
                                updateValue('ritualPosture', option);
                                markSectionTouched('ritual');
                              }}
                              className={getPillClass(values.ritualPosture === option)}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className={SECTION_GROUP_CLASS}>
                        <p className={GROUP_LABEL_CLASS}>RITUAL ACTIVITIES</p>
                        <p className="text-[11px] text-gray-500">Pick one or more.</p>
                        <div className="flex flex-wrap gap-2">
                          {RITUAL_ACTIVITY_OPTIONS.map(option => {
                            const active = values.ritualActivities.includes(option);
                            return (
                              <button
                                key={option}
                                type="button"
                                onClick={() => {
                                  const next = active
                                    ? values.ritualActivities.filter(item => item !== option)
                                    : [...values.ritualActivities, option];
                                  updateValue('ritualActivities', next);
                                  markSectionTouched('ritual');
                                }}
                                className={getPillClass(active)}
                              >
                                {option}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className={SECTION_GROUP_CLASS}>
                        <p className={GROUP_LABEL_CLASS}>CUSTOM RITUAL (OPTIONAL)</p>
                        <input
                          type="text"
                          value={values.ritualCustom}
                          onChange={(e) => {
                            updateValue('ritualCustom', e.target.value.replace(/[\r\n]/g, ''));
                            markSectionTouched('ritual');
                          }}
                          maxLength={120}
                          placeholder="e.g., pilates class, post-run stretching, cold brew + supplements..."
                          className="w-full rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                    </>
                  )}
                </div>
              </SmoothAccordion>
            )}
            {/* Time & Lighting */}
            <SmoothAccordion
              icon={Sun}
              title="Time & Lighting"
              tooltip="Control the lighting and time of day"
              isOpen={openAccordionId === 'lighting'}
              onToggle={() => toggleSection('lighting')}
              isTouched={touchedSections.has('lighting')}
              variant="primary"
            >
              {values.ugcRealMode ? (
                <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600">
                  Lighting is locked to indifferent domestic fixtures with mixed temperatures, clipped highlights, and crushed shadows. Turn Raw Domestic UGC off to control time or lighting.
                </div>
              ) : (
                <div className="space-y-3">
                  {/* TIME OF DAY */}
                  <div className={SECTION_GROUP_CLASS}>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-indigo-600">TIME OF DAY</p>
                      <p className="text-[11px] text-gray-500 mt-1">Set the temporal context</p>
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
                    <SelectedOptionFooter
                      options={[
                        { value: 'Morning', label: 'Morning', description: 'Fresh, day-start energy with softer daylight.' },
                        { value: 'Midday', label: 'Midday', description: 'Bright, clean light with higher clarity and contrast.' },
                        { value: 'Evening', label: 'Evening', description: 'Warm, cozy mood with softer falloff and ambience.' },
                        { value: 'Night', label: 'Night', description: 'Low-light atmosphere with practicals, lamps, or city glow.' },
                      ]}
                      selectedValue={values.timeOfDay}
                    />
                  </div>

                  {/* LIGHTING STYLE */}
                  <div className={SECTION_GROUP_CLASS}>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-indigo-600">LIGHTING STYLE</p>
                      <p className="text-[11px] text-gray-500 mt-1">Select the lighting quality</p>
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
                    <SelectedOptionFooter options={footerOptionsFromLabelValue(LIGHTING_OPTIONS)} selectedValue={values.lightingStyle} />
                  </div>
                </div>
              )}
            </SmoothAccordion>

            <details className="rounded-2xl border border-gray-200 bg-white transition-colors overflow-hidden">
              <summary className="cursor-pointer list-none p-4 flex items-center justify-between text-xs uppercase tracking-widest text-gray-500">
                <span>Advanced · Hero Personas</span>
                <span className="text-xs text-gray-500">+</span>
              </summary>
              <div className="p-4 pt-0 space-y-3">
                <p className="text-xs uppercase tracking-[0.3em] text-indigo-600">Hero personas</p>
                <div className="flex flex-col gap-2">
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
                      className={`w-full text-left px-3 py-2 rounded-2xl border text-sm transition-colors ${values.heroPersona === persona.label
                        ? 'bg-indigo-600 text-white border-indigo-600 text-white  shadow-indigo-500/20 scale-105 duration-500'
                        : 'bg-white border-gray-200 text-gray-900 hover:border-indigo-600 hover:text-gray-900'
                        }`}
                    >
                      {persona.label}
                    </button>
                  ))}
                </div>
              </div>
            </details>

            {
              !isUGCMode && (
                <SmoothAccordion
                  icon={Camera}
                  title="Camera & Framing"
                  tooltip="How the scene is captured"
                  isOpen={openAccordionId === 'camera'}
                  onToggle={() => toggleSection('camera')}
                  isTouched={touchedSections.has('camera')}
                  variant="primary"
                >
                  <div className="space-y-3">
                    <div className={SECTION_GROUP_CLASS}>
                      <div>
                        <p className="text-xs uppercase tracking-wider text-indigo-600">CAMERA TYPE</p>
                        <p className="text-[11px] text-gray-500 mt-1">Select the capture device aesthetic</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {CAMERA_OPTIONS
                          .filter(option =>
                            option.label !== 'Intentional smartphone camera' &&
                            option.label !== 'Laptop webcam (pro setup)'
                          )
                          .map(option => (
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
                      <SelectedOptionFooter
                        options={footerOptionsFromLabelValue(
                          CAMERA_OPTIONS.filter(option =>
                            option.label !== 'Intentional smartphone camera' &&
                            option.label !== 'Laptop webcam (pro setup)'
                          )
                        )}
                        selectedValue={values.cameraType}
                      />
                    </div>

                    <div className={SECTION_GROUP_CLASS}>
                      <p className="text-xs uppercase tracking-wider text-indigo-600">SHOT TYPE</p>
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
                      <SelectedOptionFooter
                        options={[
                          { value: 'Extreme close-up', label: 'Extreme close-up', description: 'Ultra-tight detail shot (texture, label, hands).' },
                          { value: 'Close', label: 'Close', description: 'Tight framing with clear subject focus and some context.' },
                          { value: 'Medium', label: 'Medium', description: 'Balanced framing—subject plus environment reads naturally.' },
                          { value: 'Wide', label: 'Wide', description: 'More environment and story; subject is smaller in frame.' },
                          { value: 'Full body', label: 'Full body', description: 'Shows full figure and action with the product.' },
                        ]}
                        selectedValue={values.shotType}
                      />
                    </div>

                    <div className={SECTION_GROUP_CLASS}>
                      <p className="text-xs uppercase tracking-wider text-indigo-600">COMPOSITION</p>
                      <div className="flex flex-wrap gap-2">
                        {(
                          [
                            { value: 'product-first', label: 'Product First' },
                            { value: 'balanced', label: 'Balanced' },
                            { value: 'fifty-fifty', label: 'Fifty / Fifty' },
                            { value: 'model-first', label: 'Model First' },
                          ] as const
                        ).map(option => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                              updateValue('productProminence', option.value);
                              markSectionTouched('camera');
                            }}
                            className={getPillClass(values.productProminence === option.value)}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                      <p className="text-[11px] text-gray-500 mt-1">
                        {{
                          balanced: 'Balanced share between product and person.',
                          'product-first': 'Product is the hero; person supports the story.',
                          'model-first': 'Person is the hero; product is secondary but visible.',
                          'fifty-fifty': 'Equal emphasis on person and product.',
                        }[values.productProminence] ?? ''}
                      </p>
                    </div>

                    <div className={SECTION_GROUP_CLASS}>
                      <p className="text-xs uppercase tracking-wider text-indigo-600">CAMERA ANGLE</p>
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
                      <SelectedOptionFooter
                        options={[
                          { value: 'Eye level', label: 'Eye level', description: 'Natural, most realistic perspective.' },
                          { value: 'Slightly above eye level', label: 'Slightly above eye level', description: 'Flattering, casual “friend taking photo” vibe.' },
                          { value: 'Slightly below eye level', label: 'Slightly below eye level', description: 'Slightly more heroic presence; can feel more posed.' },
                          { value: 'High angle', label: 'High angle', description: 'Looks down on the scene; lighter, more playful feel.' },
                          { value: 'Low angle', label: 'Low angle', description: 'Looks up; stronger, more dramatic stance.' },
                          { value: 'Top-down', label: 'Top-down', description: 'Flatlay / overhead perspective for routines and surfaces.' },
                          { value: 'Bottom-up', label: 'Bottom-up', description: 'Upward perspective; use sparingly for stylized impact.' },
                        ]}
                        selectedValue={values.cameraAngle}
                      />
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
                  <div className="rounded-2xl border border-gray-200 bg-white p-4 space-y-4">
                    <div className="flex flex-col gap-1">
                      <p className="text-xs uppercase tracking-[0.3em] text-indigo-600">Bundles</p>
                      <p className="text-sm text-gray-500">
                        Quickly swap between curated packs, your own mix, or AI-recommended combos.
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button type="button" className="rounded-full border px-3 py-1 text-xs font-semibold transition-colors bg-indigo-600 text-white border-indigo-600  shadow-indigo-500/20 scale-105 duration-500">
                        Pre-made Bundles
                      </button>
                      <button type="button" className="rounded-full border px-3 py-1 text-xs font-semibold transition-colors border-gray-200 bg-white text-gray-600 hover:border-indigo-600 hover:text-gray-900">
                        Custom Bundle Builder
                      </button>
                      <button type="button" className="rounded-full border px-3 py-1 text-xs font-semibold transition-colors border-gray-200 bg-white text-gray-600 hover:border-indigo-600 hover:text-gray-900">
                        Recommended Bundles
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-xs uppercase tracking-[0.3em] text-gray-500">Pick a bundle</label>
                        <select className="rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-600 focus:outline-none">
                          <option value="essentials_trio">Core Essentials Trio</option>
                          <option value="daily_duo">Daily Duo Stack</option>
                          <option value="launch_showcase">Launch Showcase Set</option>
                          <option value="hero_lineup">Complete Hero Lineup</option>
                        </select>
                      </div>

                      <div className="rounded-2xl border border-gray-200 bg-white p-4 space-y-3">
                        <p className="text-sm font-semibold text-gray-900">Core Essentials Trio</p>
                        <p className="text-xs text-gray-500">Add another product to enable bundles.</p>

                        <div className="flex flex-wrap gap-3">
                          <div className="w-28 text-center text-xs text-gray-600">
                            <div className="relative h-28 w-full overflow-hidden rounded-2xl border border-gray-200 bg-white">
                              <img className="h-full w-full object-cover opacity-60" />
                              <div className="absolute inset-0 flex items-center justify-center bg-white text-[10px] font-semibold text-gray-500">
                                Upload to fill
                              </div>
                            </div>
                            <p className="mt-1 text-[11px]">Product 1</p>
                          </div>
                        </div>
                      </div>

                      <button type="button" disabled className="w-full rounded-xl bg-indigo-600 text-white px-4 py-2 text-sm font-semibold text-white disabled:bg-white">
                        Generate Bundle Mockup
                      </button>
                    </div>
                  </div>
                </div>
              )
            }

          </>
        )
      }

      {/* HERO CANVAS (BACKGROUND REPLACEMENT) */}
      {/* Coexists with Lifestyle controls; applies only when enabled. */}
      {
        isEnvironmentMode && (
          <SmoothAccordion
            icon={Building2}
            title="Hero"
            tooltip="Neutral background + placement (Lifestyle)"
            isOpen={openAccordionId === 'ecommerce'}
            onToggle={() => toggleSection('ecommerce')}
            isActive={values.ecommerceSidePlacementFlag}
            variant="expert"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-900">Enable hero canvas</span>
                <Toggle
                  checked={values.ecommerceSidePlacementFlag}
                  aria-label="Enable hero canvas"
                  onCheckedChange={(next) => {
                    updateValue('ecommerceSidePlacementFlag', next);
                    markSectionTouched('ecommerce');
                  }}
                />
              </div>

              {values.ecommerceSidePlacementFlag && (
                <>
                  <div className={SECTION_GROUP_CLASS}>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-indigo-600">SIDE PLACEMENT</p>
                      <p className="text-[11px] text-gray-500 mt-1">Subject anchor position</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {SIDE_PLACEMENT_OPTIONS.map(option => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => {
                            updateValue('sidePlacement', option);
                            markSectionTouched('ecommerce');
                          }}
                          className={getPillClass(values.sidePlacement === option)}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-5 rounded-2xl border border-gray-200 bg-white p-4">
                    <div className="space-y-1">
                      <p className="text-xs uppercase tracking-widest text-indigo-600">Background</p>
                      <p className="text-sm text-gray-600">Neutral color or gradient</p>
                    </div>
                    <div className="inline-flex rounded-full border border-gray-200 bg-white p-1">
                      {(['white', 'gradient'] as Step3Values['ecommerceBackgroundMode'][]).map(mode => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => { updateValue('ecommerceBackgroundMode', mode); markSectionTouched('ecommerce'); }}
                          className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${values.ecommerceBackgroundMode === mode
                            ? 'bg-white text-gray-900'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                          {mode === 'white' ? 'Solid' : 'Gradient'}
                        </button>
                      ))}
                    </div>
                    {values.ecommerceBackgroundMode === 'white' ? (
                      <div className="space-y-2">
                        <p className="text-[11px] uppercase tracking-wide text-gray-500">Solid background color</p>
                        <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-2.5 transition-colors hover:border-indigo-600">
                          <label className="relative h-10 w-10 shrink-0 cursor-pointer">
                            <div
                              className="h-10 w-10 rounded-full ring-1 ring-borderSubtle"
                              style={{ background: values.ecommerceBackgroundColor }}
                            />
                            <input
                              type="color"
                              value={values.ecommerceBackgroundColor}
                              onChange={(e) => {
                                updateValue('ecommerceBackgroundColor', e.target.value);
                                markSectionTouched('ecommerce');
                              }}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                          </label>
                          <input
                            type="text"
                            value={values.ecommerceBackgroundColor}
                            onChange={(e) => {
                              updateValue('ecommerceBackgroundColor', e.target.value);
                              markSectionTouched('ecommerce');
                            }}
                            className="w-full bg-transparent text-sm text-gray-900 focus:outline-none"
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { key: 'ecommerceGradientStart', label: 'Start color', value: values.ecommerceGradientStart },
                            { key: 'ecommerceGradientEnd', label: 'End color', value: values.ecommerceGradientEnd }
                          ].map(cfg => (
                            <div key={cfg.key} className="space-y-2">
                              <p className="text-[11px] uppercase tracking-wide text-gray-500">{cfg.label}</p>
                              <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-2.5 transition-colors hover:border-indigo-600">
                                <label className="relative h-10 w-10 shrink-0 cursor-pointer">
                                  <div
                                    className="h-10 w-10 rounded-full ring-1 ring-borderSubtle"
                                    style={{ background: cfg.value }}
                                  />
                                  <input
                                    type="color"
                                    value={cfg.value}
                                    onChange={(e) => handleGradientColorChange(cfg.key as 'ecommerceGradientStart' | 'ecommerceGradientEnd', e.target.value)}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                  />
                                </label>
                                <input
                                  type="text"
                                  value={cfg.value}
                                  onChange={(e) => handleGradientColorChange(cfg.key as 'ecommerceGradientStart' | 'ecommerceGradientEnd', e.target.value)}
                                  className="w-full bg-transparent text-sm text-gray-900 focus:outline-none"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center gap-3">
                          <select
                            value={values.ecommerceGradientAngle}
                            onChange={(e) => { updateValue('ecommerceGradientAngle', e.target.value as Step3Values['ecommerceGradientAngle']); markSectionTouched('ecommerce'); }}
                            className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-900 focus:outline-none"
                          >
                            {GRADIENT_ANGLE_OPTIONS.map(angle => (
                              <option key={angle} value={angle}>{angle}°</option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={invertGradient}
                            className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-600 transition-colors hover:border-indigo-600 hover:text-gray-900"
                          >
                            Invert
                          </button>
                        </div>
                        <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white">
                          <div
                            className="h-20 w-full"
                            style={{
                              background: `linear-gradient(${values.ecommerceGradientAngle}deg, ${values.ecommerceGradientStart}, ${values.ecommerceGradientEnd})`
                            }}
                          />
                          <div className="absolute inset-0 ring-1 ring-borderSubtle" />
                        </div>
                      </>
                    )}
                  </div>
                </>
              )}

            </div>
          </SmoothAccordion>
        )
      }

      {
        isEnvironmentMode && (
          <SmoothAccordion
            icon={Edit3}
            title="Formulation Story"
            tooltip="Align brand expert, research, and product goals"
            isOpen={openAccordionId === 'formulationStory'}
            onToggle={() => toggleSection('formulationStory')}
            isActive={values.formulationStoryEnabled}
            variant="expert"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-900">Enable Formulation Story</span>
                <Toggle
                  checked={values.formulationStoryEnabled}
                  aria-label="Enable formulation story"
                  onCheckedChange={(next) => {
                    updateValue('formulationStoryEnabled', next);
                    markSectionTouched('formulationStory');
                  }}
                />
              </div>

              {values.formulationStoryEnabled && (
                <div className="space-y-3">
                  <div className={SECTION_GROUP_CLASS}>
                    <label className="text-xs uppercase tracking-wider text-indigo-600">Expert Name</label>
                    <input
                      type="text"
                      value={values.expertName}
                      onChange={(e) => { updateValue('expertName', e.target.value); markSectionTouched('formulationStory'); }}
                      className="w-full rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-500"
                      placeholder="The name you enter here (e.g., 'Dr. Ali M.D') will be embroidered on the medical attire."
                    />
                  </div>

                  <div className={SECTION_GROUP_CLASS}>
                    <label className="text-xs uppercase tracking-wider text-indigo-600">Expert Credentials</label>
                    <input
                      type="text"
                      value={values.expertCredentials}
                      onChange={(e) => { updateValue('expertCredentials', e.target.value); markSectionTouched('formulationStory'); }}
                      className="w-full rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-500"
                      placeholder="e.g., Formulation Scientist, 12 years mixing botanicals"
                    />
                  </div>

                  <div className={SECTION_GROUP_CLASS}>
                    <p className="text-xs uppercase tracking-wider text-indigo-600">Expert Role</p>
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

                  <div className={SECTION_GROUP_CLASS}>
                    <p className="text-xs uppercase tracking-wider text-indigo-600">Medical Attire</p>
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

                  <div className={SECTION_GROUP_CLASS}>
                    <p className="text-xs uppercase tracking-wider text-indigo-600">Lab Vibe</p>
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
                    {values.labVibe === 'Custom' && (
                      <input
                        type="text"
                        value={values.labVibeCustom}
                        onChange={(e) => { updateValue('labVibeCustom', e.target.value); markSectionTouched('formulationStory'); }}
                        className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-500"
                        placeholder="e.g., university research lab, clean home workbench, small apothecary corner"
                      />
                    )}
                  </div>

                  <div className={SECTION_GROUP_CLASS}>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <p className="text-xs uppercase tracking-wider text-indigo-600">Product Visible</p>
                        <p className="text-[11px] text-gray-500">Toggle off to generate a formulation scene without the product in-frame.</p>
                      </div>
                      <Toggle
                        checked={values.formulationProductVisible}
                        aria-label="Product visible"
                        onCheckedChange={(next) => {
                          updateValue('formulationProductVisible', next);
                          markSectionTouched('formulationStory');
                        }}
                      />
                    </div>
                  </div>

                </div>
              )}
            </div>
          </SmoothAccordion>
        )
      }

      {/* Output Format - LAST */}
      <SmoothAccordion
        icon={Layers}
        title="Output Format"
        tooltip="Aspect ratio for the final image"
        isOpen={openAccordionId === 'output'}
        onToggle={() => toggleSection('output')}
        variant="secondary"
      >
        <div className={SECTION_GROUP_CLASS}>
          <p className="text-xs uppercase tracking-wider text-indigo-600">ASPECT RATIO</p>
          <div className="flex flex-wrap items-center gap-2">
            {ASPECT_RATIO_OPTIONS.map(option => (
              isProductMode ? (
                <Chip
                  key={option}
                  selected={values.aspectRatio === option}
                  onClick={() => { updateValue('aspectRatio', option); markSectionTouched('output'); }}
                >
                  {option}
                </Chip>
              ) : (
                <button
                  key={option}
                  type="button"
                  onClick={() => { updateValue('aspectRatio', option); markSectionTouched('output'); }}
                  className={getPillClass(values.aspectRatio === option)}
                >
                  {option}
                </button>
              )
            ))}
          </div>
        </div>
      </SmoothAccordion>

      {/* VALIADTION ERRORS (Hard Block) */}
      {
        isProductMode && !validationResult.valid && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 space-y-2 mt-4">
            <div className="flex items-center gap-2 text-red-700 font-semibold text-sm uppercase tracking-wide">
              <AlertTriangle className="w-5 h-5" />
              <span>Validation Errors</span>
            </div>
            <ul className="list-disc list-inside text-sm text-red-600 space-y-1">
              {validationResult.errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )
      }

      {/* VALIDATION WARNINGS (Soft) */}
      {
        isProductMode && validationResult.valid && validationResult.warnings.length > 0 && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 space-y-2 mt-4">
            <div className="flex items-center gap-2 text-amber-800 font-semibold text-sm uppercase tracking-wide">
              <AlertTriangle className="w-5 h-5" />
              <span>Interpretation Notes</span>
            </div>
            <ul className="list-disc list-inside text-sm text-amber-800 space-y-1">
              {validationResult.warnings.map((warn, i) => (
                <li key={i}>{warn}</li>
              ))}
            </ul>
          </div>
        )
      }

    </div >
  );
};

export default LifestyleStep3;
