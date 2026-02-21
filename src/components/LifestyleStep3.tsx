import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  SlidersHorizontal, User, Activity, Scissors, Smile, Eye, Sparkles,
  Sun, Camera, Rotate3d, Layout, Hand, Smartphone, Shirt, Layers, Film,
  Home, MapPin, Coffee, Utensils, Car, Waves, Mountain, Building2, Edit3, Heart, Check,
  AlertTriangle, Box
} from 'lucide-react';
import {
  LIGHTING_OPTIONS,
  CAMERA_OPTIONS,
  CAMERA_ANGLE_OPTIONS as CONSTANT_CAMERA_ANGLE_OPTIONS // Use constant if needed or stick to local if it matches
} from '../../constants';
import type { UGCCaptureSituationId } from '../lib/promptEngine/ugcCaptureSituation';
import EcommerceStep3, { type EcommerceGenerationSettings, type EcommerceSlotGenerationMeta } from './EcommerceStep3';
import type { EcommerceSlotKey, EcommerceSlotsConfig } from '@/lib/ecommerceOverlay/types';
import { Chip } from './ui/Chip';
import { AccordionSection } from './ui/AccordionSection';
import { TogglePillButton, getTogglePillClass } from './ui/TogglePillButton';
import { SwitchToggle } from './ui/SwitchToggle';
import ChipSelectGroup from './ChipSelectGroup';
import { useProductStudioStore, PREBUILT_BUNDLES, BRAND_PRESETS } from '@/lib/productStudio/store';
import type { ProductStudioState, CameraAngle, CameraDistance, CameraRotation, CameraFraming, CreativeTheme, PaletteSource, PropDensity, BlankSpaceSide, EnvironmentMacro, Lighting, ProductType, ProductPlacement, MicroPlace, CompositionMode, SurfaceBase, ProductScale, ProductSpacing, LightStyle, NegativeSpace, IngredientStackLayout, ProductStateMotion, PhotoMode, OutputQualityProfile, IndustryProfile } from '@/lib/productStudio/types';
import { validateProductStudioState } from '@/lib/productStudio/validator';
import { getPlacementOptionsForContext, resolvePlacement } from '@/lib/productStudio/placementResolver';
import { resolvePhysicsCoherence } from '@/lib/productStudio/physicsCoherenceResolver';
import { normalizeOption } from '../system/normalizeOptions';
import { PHOTO_MODE_SCHEMAS } from '@/lib/productStudio/photoModeSchema';
import type { EnvironmentPhotoModeSchema } from '@/lib/productStudio/types';
import {
  WINE_ENVIRONMENT_PRESETS,
  isWinePrestigeMode,
} from '@/lib/productStudio/winePrestige';
import { industryRules } from '@/lib/productStudio/industryRules';
import { resolveCoffeeIndustryIntent } from '@/lib/productStudio/resolveCoffeeIntent';
import { getPhotoModeCameraCapability, getResolvedAllowedInteractions, getResolvedAllowedMotions } from '@/lib/productStudio/capabilityResolver';
import { applyIndustryProfileSoft } from '@/lib/productStudio/applyIndustryProfileSoft';
import { industryModuleRegistry } from '@/components/industry-modules/industryModuleRegistry';
import { resetIndustryFields } from '@/utils/resetIndustryFields';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

function InterpretationNote({ message }: { message: string }) {
  return (
    <div className="mt-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-[11px] text-gray-600">
      <div className="text-xs font-black tracking-[0.25em] text-gray-500">
        Interpretation Note
      </div>
      <div>{message}</div>
    </div>
  );
}

function PhotoModeSettings({ schema, productStore, markSectionTouched }: {
  schema: EnvironmentPhotoModeSchema;
  productStore: any;
  markSectionTouched: (id: string) => void;
}) {
  const dynamicConfig = productStore.photoModeConfig.dynamic?.[schema.label as PhotoMode] || {};
  const supportsCustomIngredients =
    schema.label === 'Ingredient Stack' ||
    schema.label === 'Ingredient Flat Lay' ||
    schema.label === 'Citrus Fresh Flat Lay' ||
    schema.label === 'Stones & Crystals Flat Lay' ||
    schema.label === 'Dried Citrus Earth' ||
    schema.label === 'Beach Foam Splash' ||
    schema.label === 'Pool Water' ||
    schema.label === 'Ice Cubes' ||
    schema.label === 'Condensation Droplets' ||
    schema.label === 'Fruit Garnish / Citrus Accents' ||
    schema.label === 'Textured Bed / Scatter Base';
  const subOptions =
    schema.label === 'Ingredient Stack'
      ? schema.subOptions.filter(option => option.key !== 'layoutStyle' && option.key !== 'customIngredients')
      : schema.subOptions.filter(option => option.key !== 'customIngredients');

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 space-y-5">
        <div>
          <p className="text-xs font-black tracking-[0.2em] text-indigo-600 uppercase mb-2">
            {schema.label} Atmosphere
          </p>
          <p className="text-[11px] text-gray-500 mb-4">{schema.description}</p>
        </div>

        {subOptions.map((option) => {
          const currentSelection = dynamicConfig[option.key] || option.values[0];

          return (
            <div key={option.key} className="space-y-2">
              <p className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold">
                {option.label}
              </p>
              <div className="flex flex-wrap gap-2">
                {option.values.map((value) => (
                  <Chip
                    key={value}
                    selected={currentSelection === value}
                    onClick={() => {
                      productStore.updatePhotoModeSubSetting(schema.label as PhotoMode, option.key, value);
                      markSectionTouched('product-setup');
                    }}
                  >
                    {value}
                  </Chip>
                ))}
              </div>
            </div>
          );
        })}

        {supportsCustomIngredients && (
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold">
              Custom Ingredients
            </p>
            <input
              type="text"
              value={dynamicConfig.customIngredients || ''}
              onChange={(e) => {
                productStore.updatePhotoModeSubSetting(
                  schema.label as PhotoMode,
                  'customIngredients',
                  e.target.value
                );
                markSectionTouched('product-setup');
              }}
              placeholder="e.g., orange wedges, mint leaves, ice shards, coffee beans, sand + shells"
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-[12px] text-gray-700 placeholder:text-gray-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
            <p className="text-xs text-gray-500">
              Adds optional custom ingredients/props on top of the mode defaults.
            </p>
          </div>
        )}

        {schema.constraints.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-[9px] uppercase tracking-[0.1em] text-gray-400 mb-2">
              AI Constraints
            </p>
            <ul className="space-y-1">
              {schema.constraints.map((c, i) => (
                <li key={i} className="text-xs text-gray-500 flex items-start gap-2">
                  <span className="text-indigo-400 mt-0.5">•</span>
                  {c}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

const PHOTO_MODE_WITH_MANUAL_SETTINGS = new Set<PhotoMode>([
  'Hero Landing Page',
  'Color Pop Hero',
  'Ingredient Stack',
  'Ingredient Flat Lay',
  'Acrylic Blocks',
  'Splash Shot',
  'Foam & Texture',
  'Routine Carousel',
  'Clinical Lab Counter',
]);

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
    slotGenerationMeta: Partial<Record<EcommerceSlotKey, EcommerceSlotGenerationMeta>>;
    settings: EcommerceGenerationSettings;
    onSettingsChange: (next: EcommerceGenerationSettings) => void;
    onGenerateSequence?: () => void;
    isGeneratingSequence?: boolean;
  };
}

export interface Step3Values {
  sceneType?: 'studio-branding' | 'lifestyle-real';
  contentStyle?: 'ugc' | 'product' | 'brand';
  visualIntent?: 'ugc' | 'editorial' | 'brand' | 'luxury';
  visualMode?: 'default' | 'ugc' | 'ritual' | 'hero' | 'formulation';
  personIncluded?: boolean;
  placement?: ProductPlacement;
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

  // Identity Control
  isRandomFullAutomationEnabled?: boolean; // UGC Full Automation: maximum entropy (ignores ALL manual controls)
  fullAutomationGenderPreference?: 'any' | 'male' | 'female'; // Optional gender filter for Full Automation mode

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
  expertRoleCustom: string;
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

const normalizeCreationModeForEmit = (raw: string): 'aesthetic' | 'lifestyle' | 'ugc' | 'studio' | 'ecom-blank' => {
  const value = String(raw || '').trim().toLowerCase();
  if (value === 'aesthetic builder' || value === 'aesthetic') return 'aesthetic';
  if (value === 'lifestyle ugc' || value === 'lifestyle') return 'lifestyle';
  if (value === 'ugc') return 'ugc';
  if (value === 'studio hero' || value === 'studio') return 'studio';
  if (value === 'ecommerce blank space' || value === 'ecom-blank') return 'ecom-blank';
  return 'aesthetic';
};

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
  'text-[11px] uppercase tracking-[0.14em] text-gray-500 font-semibold leading-none';
const COLOR_PICKER_BUTTON_CLASS =
  'h-9 w-9 rounded-full border bg-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2';
const COLOR_PICKER_SWATCH_VISUAL_CLASS =
  'h-9 w-9 rounded-full border border-gray-200 bg-white transition-colors';
const COLOR_PICKER_HIDDEN_INPUT_CLASS =
  'absolute inset-0 cursor-pointer opacity-0';

// EXPANDED GENDER OPTIONS - Exact spec (6 options)
const GENDER_OPTIONS = ['Female', 'Male', 'Trans', 'Non-binary', 'Gender non-conforming'];

export type ExpertRole =
  | 'none'
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
  | 'none'
  | 'white_medical_coat'
  | 'white_scrubs'
  | 'light_blue_scrubs'
  | 'burgundy_scrubs'
  | 'green_scrubs';

export type BadgePreference = 'name_only' | 'name_and_badge';

const EXPERT_ROLE_OPTIONS: { label: string; value: ExpertRole }[] = [
  { label: 'None', value: 'none' },
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
  { label: 'None', value: 'none' },
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
        id: 'low-angle',
        label: 'Low-angle vantage',
        detail: 'Camera below eye level looking up, unflattering under-chin angle.'
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
  { id: 'none', label: 'None', value: 'none', icon: Box },
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
  const photoModeSettingsRef = useRef<HTMLDivElement | null>(null);
  const photoModeHintTimerRef = useRef<number | null>(null);
  const [photoModeHintVisible, setPhotoModeHintVisible] = useState(false);
  const [photoModeHintMode, setPhotoModeHintMode] = useState<PhotoMode | null>(null);
  const markSectionTouched = useCallback((section: string) => {
    setTouchedSections(prev => {
      const newSet = new Set(prev);
      newSet.add(section);
      return newSet;
    });
  }, []);
  const scrollToPhotoModeSettings = useCallback(() => {
    if (typeof window === 'undefined') return;
    window.requestAnimationFrame(() => {
      window.setTimeout(() => {
        photoModeSettingsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 40);
    });
  }, []);
  const showPhotoModeSettingsHint = useCallback((mode: PhotoMode) => {
    if (typeof window === 'undefined') return;
    setPhotoModeHintMode(mode);
    setPhotoModeHintVisible(true);
    if (photoModeHintTimerRef.current != null) {
      window.clearTimeout(photoModeHintTimerRef.current);
    }
    photoModeHintTimerRef.current = window.setTimeout(() => {
      setPhotoModeHintVisible(false);
    }, 2600);
  }, []);
  useEffect(() => {
    return () => {
      if (photoModeHintTimerRef.current != null && typeof window !== 'undefined') {
        window.clearTimeout(photoModeHintTimerRef.current);
      }
    };
  }, []);
  // Removed duplicate isCreatorPro declaration here, managed near top.
  const initialValues: Step3Values = {
    visualMode: 'default',
    visualIntent: initialSceneIntent === 'ecommerce' ? undefined : 'editorial',
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

    // Environment - CANONICAL SOURCE (environmentContext)
    // null = Studio/Ecommerce mode (no environment)
    environmentContext: initialSceneIntent === 'ecommerce' ? null : { macro: 'Kitchen', micro: 'Countertop' },

    // LEGACY - kept for backward compatibility
    environment: initialSceneIntent === 'ecommerce' ? '' : 'Kitchen', // Kitchen has table/counter surface by default
    customEnvironment: '',
    sceneOrderChaos: 'Normal',
    // Neutral background + placement (Lifestyle-only) is optional and toggle-driven.
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

    // Entropy Modes (Full Automation)
    isRandomFullAutomationEnabled: false,
    fullAutomationGenderPreference: 'any',

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
    creationIntent: initialSceneIntent === 'ecommerce' ? 'product' : 'brand',
    creationMode: initialSceneIntent === 'ecommerce' ? 'Lifestyle UGC' : 'Aesthetic Builder',
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
    expertRoleCustom: '',
    expertName: '',
    expertCredentials: '',
    // Keep legacy default (do not switch default just because we added a "None" option).
    expertAttire: 'white_medical_coat',
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
    formulationExpertAttire: 'white_medical_coat',
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
  const [industryPreviewFade, setIndustryPreviewFade] = useState(false);
  const industryPreviewFadeTimerRef = useRef<number | null>(null);

  // New strict states
  const [isCreatorPro, setIsCreatorPro] = useState(false);
  const [personBAdvancedOpen, setPersonBAdvancedOpen] = useState(false);
  const [productEnvironmentAdvancedOpen, setProductEnvironmentAdvancedOpen] = useState(false);
  const [productEnvironmentShowAllMacros, setProductEnvironmentShowAllMacros] = useState(false);
  const [placementCorrectionMessage, setPlacementCorrectionMessage] = useState<string | null>(null);

  // ============================================================================
  // PHASE 3: PRODUCT STUDIO STORE (SINGLE SOURCE OF TRUTH FOR PRODUCT MODE)
  // ============================================================================
  const productStore = useProductStudioStore();
  const winePrestigeModeActive = isWinePrestigeMode(productStore as ProductStudioState);
  const industryProfile: IndustryProfile =
    productStore.visualProfile === 'wine-prestige'
      ? 'wine'
      : productStore.visualProfile === 'default'
        ? 'supplements'
        : (productStore.visualProfile as IndustryProfile);
  const isCoffeeIndustry = industryProfile === 'coffee';
  const activeIndustryRules = industryRules[industryProfile];
  const allowedStudioLightingValues: ProductStudioState['lighting'][] = [
    'natural-light',
    'sunny-day',
    'golden-hour',
    'overcast',
    'cozy-indoors',
    'ring-light',
    'mood-lighting',
    'night-mode',
    'flash-photo',
    'clinical-softbox',
  ];
  const applyIndustryProfile = useCallback((nextProfile: IndustryProfile) => {
    const softState = applyIndustryProfileSoft(
      {
        visualIntent: productStore.visualIntent,
        lighting: productStore.lighting,
        composition: productStore.composition,
        photoMode: productStore.photoMode,
        wineLightingTone: productStore.wineLightingTone,
        rotation: productStore.rotation,
        cameraUiRotationLabel: productStore.cameraUiRotationLabel,
      },
      nextProfile
    );

    if (industryPreviewFadeTimerRef.current != null && typeof window !== 'undefined') {
      window.clearTimeout(industryPreviewFadeTimerRef.current);
    }
    setIndustryPreviewFade(true);
    if (typeof window !== 'undefined') {
      industryPreviewFadeTimerRef.current = window.setTimeout(() => {
        setIndustryPreviewFade(false);
        industryPreviewFadeTimerRef.current = null;
      }, 200);
    }

    if (nextProfile === 'wine') {
      productStore.setVisualProfile('wine-prestige');
      resetIndustryFields(nextProfile, productStore);
    } else if (nextProfile === 'coffee') {
      productStore.setVisualProfile('coffee');
      resetIndustryFields(nextProfile, productStore);
    } else {
      productStore.setVisualProfile('default');
      resetIndustryFields(nextProfile, productStore);
    }

    if (softState.visualIntent && softState.visualIntent !== productStore.visualIntent) {
      productStore.setVisualIntent(softState.visualIntent as ProductStudioState['visualIntent']);
    }
    if (
      softState.lighting &&
      softState.lighting !== productStore.lighting &&
      allowedStudioLightingValues.includes(softState.lighting as ProductStudioState['lighting'])
    ) {
      productStore.setLighting(softState.lighting as ProductStudioState['lighting']);
    }
    if (softState.composition && softState.composition !== productStore.composition) {
      productStore.setComposition(softState.composition as ProductStudioState['composition']);
    }
    if (softState.photoMode && softState.photoMode !== productStore.photoMode) {
      productStore.setPhotoMode(softState.photoMode as ProductStudioState['photoMode']);
    }
    if (softState.wineLightingTone && softState.wineLightingTone !== productStore.wineLightingTone) {
      productStore.setWineLightingTone(softState.wineLightingTone as ProductStudioState['wineLightingTone']);
    }
    if (typeof softState.rotation === 'number' && softState.rotation !== productStore.rotation) {
      productStore.setRotation(softState.rotation as ProductStudioState['rotation']);
    }
    if (
      softState.cameraUiRotationLabel &&
      softState.cameraUiRotationLabel !== productStore.cameraUiRotationLabel
    ) {
      productStore.setCameraUiLabels({ rotation: softState.cameraUiRotationLabel });
    }
  }, [productStore]);

  useEffect(() => {
    return () => {
      if (industryPreviewFadeTimerRef.current != null && typeof window !== 'undefined') {
        window.clearTimeout(industryPreviewFadeTimerRef.current);
      }
    };
  }, []);
  const interpretationNotes = productStore.interpretationNotes || {};
  const getInterpretationNote = (key: string): string | null => {
    const entry = (interpretationNotes as any)[key];
    if (!entry) return null;
    if (typeof entry.message !== 'string') return null;
    if (typeof entry.ts !== 'number') return null;
    return Date.now() - entry.ts < 4000 ? entry.message : null;
  };
  const placementPhotoType = productStore.environmentContext != null ? 'environment' : 'photo-studio';
  const placementOptions = getPlacementOptionsForContext(
    placementPhotoType,
    String(productStore.photoMode || '')
  );
  const placementResolution = resolvePlacement(
    placementPhotoType,
    String(productStore.photoMode || ''),
    productStore.placement || 'surface'
  );
  const physicsResolution = resolvePhysicsCoherence({
    ...(productStore as ProductStudioState),
    placement: placementResolution.resolvedPlacement,
  });
  const cameraAngleLabelFromState = (angle: ProductStudioState['angle']): string => {
    if (angle === 'detail_closeup') return 'Detail close-up';
    if (angle === 'top_down') return 'Top-down flat lay';
    if (angle === 'eye_level') return 'Eye level product';
    return '45° hero';
  };

  useEffect(() => {
    if (!isProductMode) return;
    if (!placementResolution.corrected) return;
    if (placementResolution.resolvedPlacement === productStore.placement) return;
    productStore.setPlacement(placementResolution.resolvedPlacement);
    setPlacementCorrectionMessage(
      `Placement auto-corrected to ${placementResolution.label} for the current Photo Type/Photo Mode context.`
    );
  }, [
    isProductMode,
    placementResolution.corrected,
    placementResolution.label,
    placementResolution.resolvedPlacement,
    productStore,
    productStore.placement,
    placementPhotoType,
  ]);

  useEffect(() => {
    if (!isProductMode) return;
    if (!physicsResolution.corrected) return;

    let didUpdate = false;

    if (
      physicsResolution.correctedPlacement &&
      physicsResolution.correctedPlacement !== productStore.placement
    ) {
      productStore.setPlacement(physicsResolution.correctedPlacement);
      didUpdate = true;
    }

    if (
      physicsResolution.correctedCameraAngle &&
      physicsResolution.correctedCameraAngle !== productStore.angle
    ) {
      productStore.setAngle(physicsResolution.correctedCameraAngle);
      productStore.setCameraUiLabels({ angle: cameraAngleLabelFromState(physicsResolution.correctedCameraAngle) });
      didUpdate = true;
    }

    if (!didUpdate) return;

    setPlacementCorrectionMessage('Camera angle auto-adjusted for physical coherence.');
  }, [
    isProductMode,
    physicsResolution.corrected,
    physicsResolution.correctedPlacement,
    physicsResolution.correctedCameraAngle,
    productStore,
    productStore.placement,
    productStore.angle,
  ]);

  useEffect(() => {
    if (!placementCorrectionMessage) return;
    const timer = window.setTimeout(() => setPlacementCorrectionMessage(null), 3500);
    return () => window.clearTimeout(timer);
  }, [placementCorrectionMessage]);

  useEffect(() => {
    if (!isProductMode) return;
    setValues(prev => ({
      ...prev,
      productCameraAngle: (() => {
        if (productStore.angle === 'detail_closeup') return 'Detail close-up';
        if (productStore.angle === 'top_down') return 'Top-down flat lay';
        if (productStore.angle === 'eye_level') return 'Eye level product';
        return '45° hero';
      })(),
      productCameraDistance: (() => {
        if (productStore.distance === 'macro') return 'Macro';
        if (productStore.distance === 'tight') return 'Tight';
        return 'Standard';
      })(),
      productFramingGuide: productStore.framing === 'rule_of_thirds' ? 'Rule of thirds' : 'Centered hero',
      productCameraRotation: productStore.rotation === 0 ? 0 : 5,
    }));
  }, [isProductMode, productStore.angle, productStore.distance, productStore.framing, productStore.rotation]);

  // Derived state for Environment (Strict Rule: Studio = No Environment, Lifestyle = Always Environment)
  // Product Studio must NEVER show Lifestyle/UGC sections.
  // Keep all "environment/lifestyle" UI strictly disabled when `isProductMode` is true.
  const isEnvironmentMode = !isProductMode;

  const normalizeHex = (value: unknown): string | null => {
    const raw = String(value ?? '').trim().toUpperCase();
    if (!raw) return null;
    if (/^#[0-9A-F]{6}$/.test(raw)) return raw;
    return null;
  };

  const uniqHexes = (values: Array<unknown>): string[] => {
    const out: string[] = [];
    const seen = new Set<string>();
    for (const v of values) {
      const hex = normalizeHex(v);
      if (!hex) continue;
      if (seen.has(hex)) continue;
      seen.add(hex);
      out.push(hex);
    }
    return out;
  };

  const heroLandingBrandSwatches = (() => {
    const paletteSource = productStore.photoModeConfig?.heroLandingPage?.paletteSource;
    if (paletteSource === 'Neutral brand tones') {
      return ['#FFFFFF', '#F3F4F6', '#E5E7EB'];
    }
    if (paletteSource === 'Custom') {
      return [];
    }
    const activeProduct =
      productStore.products.find(p => p.id === productStore.activeProductId) ??
      productStore.products[0] ??
      null;

    const labelColors = uniqHexes([
      (activeProduct as any)?.palette?.dominant,
      (activeProduct as any)?.palette?.secondary,
      (activeProduct as any)?.palette?.accent,
    ]);
    if (labelColors.length > 0) return labelColors;

    const brandSystemColors = uniqHexes([
      (productStore as any)?.palette?.primaryColor,
      (productStore as any)?.palette?.secondaryColor,
      (productStore as any)?.palette?.accentColor,
    ]);
    return brandSystemColors;
  })();

  // Hero Landing Page UI-only state (no store changes).
  const [heroGradientAssignTarget, setHeroGradientAssignTarget] = useState<'start' | 'end' | 'mid'>('start');
  const [heroHexEditingTarget, setHeroHexEditingTarget] = useState<null | 'solid' | 'start' | 'end' | 'mid'>(null);
  const [heroHexDraft, setHeroHexDraft] = useState('');

  const applyHeroHexToTarget = useCallback(() => {
    const hex = normalizeHex(heroHexDraft);
    if (!hex || !heroHexEditingTarget) return;
    productStore.setPhotoModeConfig({ heroLandingPage: { colorSource: 'Custom Color' } });
    if (heroHexEditingTarget === 'solid') productStore.setBackgroundColor(hex);
    if (heroHexEditingTarget === 'start') productStore.setGradientStart(hex);
    if (heroHexEditingTarget === 'end') productStore.setGradientEnd(hex);
    if (heroHexEditingTarget === 'mid') productStore.setGradientMid(hex);
    markSectionTouched('product-setup');
  }, [heroHexDraft, heroHexEditingTarget, normalizeHex, productStore, markSectionTouched]);

  const normalizeProductStudioAspectRatio = useCallback((raw: unknown): ProductStudioState['aspectRatio'] => {
    const value = String(raw ?? '').trim();
    const labelMap: Record<string, ProductStudioState['aspectRatio']> = {
      '1:1 (Square)': '1:1',
      '4:5 (Portrait)': '4:5',
      '3:4 (Portrait)': '3:4',
      '9:16 (Story)': '9:16',
      '16:9 (Landscape)': '16:9',
      '4:3 (Landscape)': '4:3',
    };
    if (labelMap[value]) return labelMap[value];

    const normalized = value.replace(/\s+/g, '');
    const allowed = new Set<ProductStudioState['aspectRatio']>(['1:1', '4:5', '3:4', '9:16', '4:3', '16:9']);
    if (allowed.has(normalized as ProductStudioState['aspectRatio'])) {
      return normalized as ProductStudioState['aspectRatio'];
    }
    return '1:1';
  }, []);

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
        productStore.setAspectRatio(normalizeProductStudioAspectRatio(value));
        break;
      default:
        console.warn('[PRODUCT STUDIO] Unhandled key:', key);
    }
  }, [isProductMode, normalizeProductStudioAspectRatio, productStore]);

  const toggleSection = (section: string) => {
    setOpenAccordionId(openAccordionId === section ? null : section);
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
          mappedValue = value === 'Macro lens' ? 'macro' : 'dslr_mirrorless';
        } else if (key === 'productCameraAngle') {
          const angleMap: Record<string, CameraAngle> = {
            'Eye level product': 'eye_level',
            '45° hero': '45_hero',
            'Top-down flat lay': 'top_down',
            'Low angle power': 'low_angle',
            'High angle overview': 'high_angle',
            'Detail close-up': 'detail_closeup',
          };
          mappedValue = angleMap[value as string] ?? '45_hero';
        } else if (key === 'productCameraDistance') {
          const distMap: Record<string, CameraDistance> = {
            'Wide': 'wide',
            'Standard': 'standard',
            'Tight': 'tight',
            'Macro': 'macro',
          };
          mappedValue = distMap[value as string] ?? 'standard';
        } else if (key === 'productCameraRotation') {
          mappedValue = (value as number) > 0 ? 5 : 0;
        } else if (key === 'productFramingGuide') {
          const framingMap: Record<string, CameraFraming> = {
            'Centered hero': 'centered_hero',
            'Rule of thirds': 'rule_of_thirds',
            'Left aligned + negative space': 'left_negative',
            'Right aligned + negative space': 'right_negative',
            'Grid-ready': 'grid_ready',
          };
          mappedValue = framingMap[value as string] ?? 'centered_hero';
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

      const resolveDefaultMicroForEnvironment = (macro: string): string => {
        switch (macro) {
          case 'Kitchen':
            return 'Countertop';
          case 'Living Room':
            return 'Coffee table';
          case 'Bedroom':
            return 'Dresser';
          case 'Bathroom':
            return 'Vanity sink';
          case 'Workspace':
            return 'Desk';
          case 'Hallway':
            return 'Entryway';
          case 'Home Gym':
            return 'Workout area';
          case 'Balcony / Indoor Terrace':
            return 'Balcony seating area';
          case 'Urban Exterior':
            return 'Sidewalk';
          case 'Natural Exterior':
            return 'Trail';
          case 'Parking Lot':
            return 'Parking area';
          case 'Backyard / Patio':
            return 'Patio seating';
          case 'Street Corner':
            return 'Street corner';
          default:
            return '';
        }
      };

      // CANONICAL SYNC: When legacy environment is updated, sync to environmentContext
      if (key === 'environment') {
        const nextEnvironment = String((value as string) || '').trim();
        if (!nextEnvironment || nextEnvironment === 'none') {
          newValues.environment = 'none';
          newValues.environmentContext = { macro: 'none', micro: '' };
          console.log('[STEP3] Environment deselected (none) - environmentContext suppressed');
          return newValues;
        }
        if (nextEnvironment === 'Custom') {
          const custom = String(newValues.customEnvironment || '').trim();
          const macro = custom || 'Custom';
          newValues.environmentContext = { macro, micro: resolveDefaultMicroForEnvironment(macro) };
        } else {
          newValues.environmentContext = {
            macro: nextEnvironment,
            micro: resolveDefaultMicroForEnvironment(nextEnvironment),
          };
        }
        console.log('[STEP3] Synced environment to environmentContext:', newValues.environmentContext);
      }

      if (key === 'customEnvironment') {
        const custom = String(value as string).trim();
        if (custom) {
          newValues.environment = 'Custom';
          newValues.environmentContext = { macro: custom, micro: resolveDefaultMicroForEnvironment(custom) };
        } else if (newValues.environment === 'Custom') {
          newValues.environment = 'none';
          newValues.environmentContext = { macro: 'none', micro: '' };
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

  const setVisualMode = useCallback((mode: NonNullable<Step3Values['visualMode']>) => {
    setValues(prev => {
      if (mode === 'ugc' && hasModelReference) {
        return { ...prev, visualMode: 'default', ugcRealMode: false };
      }

      const next: Step3Values = {
        ...prev,
        visualMode: mode,
        ugcRealMode: mode === 'ugc',
        ritualModeEnabled: mode === 'ritual',
        ecommerceSidePlacementFlag: mode === 'hero',
        formulationStoryEnabled: mode === 'formulation',
        formulationExpertEnabled: mode === 'formulation',
      };

      if (mode === 'ugc') {
        next.creationIntent = 'ugc';
        next.creationMode = 'Lifestyle UGC';
        next.environment = 'none';
        next.customEnvironment = '';
        next.environmentContext = { macro: 'none', micro: '' };
        next.ugcImperfectionLevel = 'high';
        next.personCount = 'single';
        next.editSecondaryPerson = false;
        next.facialExpression = 'Soft Smile';
        next.eyeDirection = 'Looking at camera';
        next.ritualHideProduct = false;
        next.ritualNoObjects = false;
        next.ritualActivities = [];
        next.ritualCustom = '';
        (next as any).sceneContinuity = false;
        (next as any).cinematicLook = false;
        (next as any).storytellingConsistency = false;
      } else {
        if (prev.visualMode === 'ugc') {
          ALL_UGC_LAYER_FIELDS.forEach(layer => {
            (next as any)[layer] = [];
          });
          if (next.environment === 'none') {
            next.environment = 'Kitchen';
            next.environmentContext = { macro: 'Kitchen', micro: 'Countertop' };
          }
        }
        if (next.creationIntent === 'ugc') {
          next.creationIntent = 'brand';
        }
        if (next.creationMode === 'Lifestyle UGC') {
          next.creationMode = 'Aesthetic Builder';
        }
      }

      if (mode !== 'ritual') {
        next.ritualHideProduct = false;
        next.ritualNoObjects = false;
        next.ritualCoupleStaging = 'Together (side-by-side)';
        next.ritualPosture = 'Auto';
        next.ritualActivities = [];
        next.ritualCustom = '';
      }

      if (mode !== 'hero') {
        next.sidePlacement = SIDE_PLACEMENT_OPTIONS[1];
      }

      if (mode !== 'formulation') {
        next.expertName = '';
        next.expertCredentials = '';
      }

      enforceSingleSelectLayers(next);
      return next;
    });
  }, [hasModelReference]);

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
    const normalizedCreationMode = normalizeCreationModeForEmit(values.creationMode);
    const sceneType: 'studio-branding' | 'lifestyle-real' =
      normalizedCreationMode === 'aesthetic' ||
        normalizedCreationMode === 'lifestyle' ||
        normalizedCreationMode === 'ugc'
        ? 'lifestyle-real'
        : 'studio-branding';
    const contentStyle: 'ugc' | 'product' | 'brand' =
      values.visualMode === 'ugc'
        ? 'ugc'
        : values.sceneIntent === 'ecommerce'
          ? 'product'
          : 'brand';
    const personIncluded = values.noPerson === false;
    const isLuxuryVisualIntent = (values.visualIntent ?? 'editorial') === 'luxury';
    const forceNoMessiness =
      sceneType === 'lifestyle-real' &&
      (contentStyle === 'brand' || isLuxuryVisualIntent) &&
      values.ugcRealMode !== true;
    const forceHandsHolding =
      sceneType === 'lifestyle-real' &&
      values.productInteraction === 'Holding' &&
      values.ugcRealMode !== true;
    const payload: Step3Values = {
      ...values,
      creationMode: normalizedCreationMode,
      sceneType,
      contentStyle,
      visualIntent: sceneType === 'lifestyle-real' ? (values.visualIntent ?? 'editorial') : undefined,
      allowMessiness: forceNoMessiness ? false : values.allowMessiness,
      handsHolding: forceHandsHolding ? true : values.handsHolding,
      personIncluded,
    };

    console.log('[STEP3 FINAL EMIT PAYLOAD]', JSON.stringify(payload, null, 2));
    console.log('[STEP3 FINAL EMIT FIELDS]', {
      sceneType: payload.sceneType,
      creationMode: payload.creationMode,
      contentStyle: payload.contentStyle,
      personIncluded: payload.personIncluded,
      sceneIntent: payload.sceneIntent,
    });
    if (onValuesChange) {
      onValuesChange(payload);
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
    if (hasModelReference && (values.visualMode === 'ugc' || values.creatorPreset || values.sameCreatorAcrossScenes)) {
      setValues((prev) => {
        const newValues: Step3Values = {
          ...prev,
          visualMode: 'default',
          ugcRealMode: false,
          creatorPreset: null,
          sameCreatorAcrossScenes: false,
        };
        ALL_UGC_LAYER_FIELDS.forEach(layer => {
          (newValues as any)[layer] = [];
        });
        enforceSingleSelectLayers(newValues);
        return newValues;
      });
    }
  }, [hasModelReference, values.visualMode, values.creatorPreset, values.sameCreatorAcrossScenes]);

  useEffect(() => {
    if (values.visualMode !== 'ugc') {
      setOpenUgcLayerId(null);
    }
  }, [values.visualMode]);

  useEffect(() => {
    if (values.visualMode === 'ugc' && (!values.ugcCaptureStyleBase || values.ugcCaptureStyleBase.length === 0)) {
      updateValue('ugcCaptureStyleBase', ['torso-level-handheld'] as Step3Values['ugcCaptureStyleBase']);
    }
  }, [values.visualMode, values.ugcCaptureStyleBase, updateValue]);

  // HARD RULE: UGC Real Mode cannot coexist with neutral background canvas overlay.
  useEffect(() => {
    if (values.visualMode !== 'ugc') return;
    if (values.ecommerceSidePlacementFlag) {
      updateValue('ecommerceSidePlacementFlag', false);
    }
  }, [values.visualMode, values.ecommerceSidePlacementFlag, updateValue]);

  // ============================================================================
  // SCENE INTENT - SINGLE SOURCE OF TRUTH
  // Environment and Ecommerce are mutually exclusive
  // Only one can be active at any time
  // ============================================================================

  // Derived from sceneIntent - no longer computed independently
  // Derived from sceneIntent - no longer computed independently
  const isEcommerceMode = isProductMode || values.sceneIntent === 'ecommerce';
  // const isEnvironmentMode = values.sceneIntent === 'environment'; // REDUNDANT: Derived from productStore.sceneType now
  const isUGCMode = values.visualMode === 'ugc';
  const visualIntentMode = (values.visualIntent ?? 'editorial');
  const isLuxuryIntent = visualIntentMode === 'luxury';
  const isBrandIntent = visualIntentMode === 'brand';
  const uiCreationMode = normalizeCreationModeForEmit(values.creationMode);
  const uiSceneType: 'studio-branding' | 'lifestyle-real' =
    uiCreationMode === 'aesthetic' || uiCreationMode === 'lifestyle' || uiCreationMode === 'ugc'
      ? 'lifestyle-real'
      : 'studio-branding';
  const uiContentStyle: 'ugc' | 'product' | 'brand' =
    values.visualMode === 'ugc'
      ? 'ugc'
      : values.sceneIntent === 'ecommerce'
        ? 'product'
        : 'brand';
  const uiActiveEngine: 'studio' | 'lifestyle' = uiSceneType === 'studio-branding' ? 'studio' : 'lifestyle';
  const showVisualIntentControl =
    uiSceneType === 'lifestyle-real' && uiActiveEngine === 'lifestyle' && uiContentStyle !== 'product';
  const isLifestyleCompatibilityActive = uiSceneType === 'lifestyle-real' && values.ugcRealMode !== true;
  const cameraSectionLockedByUgc = isUGCMode;
  const luxuryCameraTypeAllowed = new Set(['DSLR / mirrorless camera', 'Medium format studio camera']);
  const luxuryShotAllowed = new Set(['Close', 'Medium']);
  const luxuryCompositionAllowed = new Set(['product-first', 'balanced']);
  const luxuryAngleAllowed = new Set(['Eye level', 'Slightly above eye level', 'Slightly below eye level']);

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
    if (values.visualMode === 'ugc' && values.sceneIntent !== 'environment') {
      enableEnvironment();
    }
  }, [values.visualMode, values.sceneIntent, enableEnvironment]);

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

  // ============================================================================
  // GATING LOGIC (Placement as Mandatory Physics Decision)
  // ============================================================================
  const isInteractionAllowedFromPlacement = useCallback((interactionValue: string) => {
    const p = productStore.placement;
    if (p === 'held') {
      // Must be a human hold
      return !['none', 'passive-presence', 'cropped-hand'].includes(interactionValue);
    }
    // Surface, Supported, Air
    // Disallow active holds (where they are in the air)
    return ['none', 'passive-presence', 'cropped-hand', 'resting-interaction'].includes(interactionValue);
  }, [productStore.placement]);

  const isAngleAllowedFromPlacement = useCallback((angleValue: string) => {
    const p = productStore.placement;
    if (angleValue === 'top' || angleValue === 'Top-down flat lay') {
      return p === 'surface'; // Flat lay usually implies surface
    }
    return true;
  }, [productStore.placement]);

  const isPhotoModeAllowedFromPlacement = useCallback((mode: string) => {
    const p = productStore.placement;
    if (mode === 'Hero Landing Page' || mode === 'Minimal Bathroom Vanity') return p === 'surface';
    if (mode === 'Acrylic Blocks') return p === 'supported';
    if (mode === 'Splash Shot') return p === 'surface';
    if (mode === 'Underwater Split' || mode === 'Sky Float Minimal') return p === 'air';
    if (mode === 'Hands Application Clean') return p === 'held' || p === 'supported';
    return true;
  }, [productStore.placement]);

  const PRODUCT_TYPE_OPTIONS: Array<NonNullable<Step3Values['productType']>> = [
    'Capsules',
    'Gummies',
    'Drops',
    'Powder',
    'Skincare',
    'Device',
    'Custom'
  ];

  const PRODUCT_ENVIRONMENT_MACRO_GROUPS: Array<{ label: string; items: EnvironmentMacro[] }> = [
    {
      label: 'Home',
      items: [
        'kitchen',
        'living-room',
        'bedroom',
        'bathroom',
        'workspace',
        'hallway',
        'home-gym',
        'balcony-indoor-terrace',
      ],
    },
    { label: 'Industrial', items: ['cgmp-facility'] },
    {
      label: 'Outdoor',
      items: ['urban-exterior', 'street-corner', 'parking-lot', 'backyard-patio', 'natural-exterior'],
    },
    { label: 'Custom', items: ['custom'] },
  ];

  const PRODUCT_ENVIRONMENT_MICRO_BY_MACRO: Partial<Record<EnvironmentMacro, MicroPlace[]>> = {
    kitchen: ['countertop', 'kitchen-island', 'sink-ledge', 'dining-table'],
    'living-room': ['coffee-table', 'side-table', 'shelf'],
    bedroom: ['nightstand', 'dresser-top', 'side-table'],
    bathroom: ['vanity', 'sink-ledge', 'shower-shelf'],
    workspace: ['desk-surface', 'keyboard-side', 'notebook-area'],
    hallway: ['console-table', 'shelf'],
    'home-gym': ['bench', 'mat-edge', 'water-bottle-side'],
    'balcony-indoor-terrace': ['table', 'railing-ledge'],
    'cgmp-facility': ['conveyor-belt', 'filling-line'],
    'urban-exterior': ['concrete-ledge', 'low-wall', 'stairs'],
    'street-corner': ['sidewalk-edge', 'urban-bench', 'low-wall'],
    'parking-lot': ['car-hood', 'trunk-edge', 'concrete-ledge'],
    'backyard-patio': ['outdoor-table', 'chair-armrest', 'table'],
    'natural-exterior': ['rock', 'wooden-surface', 'picnic-table'],
    custom: ['custom'],
  };

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

  useEffect(() => {
    if (values.visualMode !== 'formulation') {
      return;
    }

    ALL_UGC_LAYER_FIELDS.forEach(layer => {
      updateValue(layer, []);
    });
  }, [values.visualMode, updateValue]);
  return (
    <div className={embedded ? 'w-full space-y-5' : 'w-full max-w-2xl mx-auto space-y-5 p-5'}>
      {!embedded && (
        <div className="flex flex-col gap-1">
          <p className="text-xs uppercase tracking-widest text-indigo-600">Step 3</p>
          <h2 className="text-2xl text-gray-900">{isEcommerceMode ? 'Product Builder' : 'Scene Builder'}</h2>
        </div>
      )}

      {isEcommerceMode && (
        <>
          <AccordionSection
            icon={Layers}
            title="01 / Product Setup"
            description={`Product setup.\nProduct basics.`}
            isOpen={openAccordionId === 'product-setup'}
            onToggle={() => toggleSection('product-setup')}
            required
            isTouched={touchedSections.has('product-setup')}
            variant="primary"
          >
            <div className="space-y-5">
              {/* PHOTO TYPE — Mutually exclusive modes to avoid prompt conflicts */}
              <div className={SECTION_GROUP_CLASS}>
                <p className={GROUP_LABEL_CLASS}>PHOTO TYPE</p>
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
                      productStore.setEnvironmentContext({
                        macro: (productStore.environmentContext?.macro as any) ?? 'kitchen',
                        micro: (productStore.environmentContext?.micro as any) ?? 'countertop',
                      });
                      markSectionTouched('product-setup');
                      setOpenAccordionId('product-environment');

                      // Mobile: after expanding, force-scroll to the top of the accordion (not the end of its content).
                      // Use 'auto' to avoid Safari/iOS smooth-scroll anchoring quirks during layout transitions.
                      const pinToTop = () => {
                        const container = document.getElementById('product-environment');
                        if (!container) return;
                        const top = container.getBoundingClientRect().top + window.scrollY - 12;
                        window.scrollTo({ top: Math.max(0, top), behavior: 'auto' });
                      };

                      requestAnimationFrame(() => {
                        pinToTop();
                        requestAnimationFrame(pinToTop);
                      });
                    }}
                    selected={productStore.environmentContext != null}
                  >
                    Environment
                  </Chip>
                </div>
              </div>

              <div className={SECTION_GROUP_CLASS}>
                <p className={GROUP_LABEL_CLASS}>OUTPUT PROFILE</p>
                <div className="flex flex-wrap gap-2">
                  {([
                    { id: 'luxury-brand', label: 'Luxury Campaign', desc: 'High-end campaign polish with premium materials and tonal depth.' },
                    { id: 'ecommerce-conversion', label: 'Conversion', desc: 'Max legibility and clean hierarchy for ads and PDP performance.' },
                    { id: 'clinical', label: 'Clinical', desc: 'Sterile precision, strict readability, and neutral product truth.' },
                  ] as const).map(opt => (
                    <Chip
                      key={opt.id}
                      onClick={() => {
                        productStore.setQualityProfile(opt.id as OutputQualityProfile);
                        markSectionTouched('product-setup');
                      }}
                      selected={productStore.qualityProfile === opt.id}
                      description={opt.desc}
                    >
                      {opt.label}
                    </Chip>
                  ))}
                </div>
                <p className="text-[11px] text-gray-500 mt-1">
                  Defines the global creative intent of the generated prompt.
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

              {/* PHYSICAL PLACEMENT — Contextual to Photo Type + Photo Mode */}
              <div className={SECTION_GROUP_CLASS}>
                <p className={GROUP_LABEL_CLASS}>PHYSICAL PLACEMENT</p>
                <div className="flex flex-wrap gap-2">
                  {placementOptions.map(opt => (
                    <Chip
                      key={opt.id}
                      onClick={() => {
                        if (!opt.enabled) return;
                        productStore.setPlacement(opt.id as any);
                        setPlacementCorrectionMessage(null);
                        markSectionTouched('product-setup');
                      }}
                      selected={placementResolution.resolvedPlacement === opt.id}
                      disabled={!opt.enabled}
                      description={opt.enabled ? opt.description : `${opt.description} ${opt.disabledReason || ''}`.trim()}
                    >
                      {opt.label}
                    </Chip>
                  ))}
                </div>
                <p className="text-[11px] text-gray-500 mt-2">
                  Placement is resolved contextually from Photo Type + Photo Mode to keep physical coherence.
                </p>
                {placementCorrectionMessage && (
                  <InterpretationNote message={placementCorrectionMessage} />
                )}
              </div>

              {/* ============================================================
                   PRODUCT STUDIO CONTROLS (Studio Mode Only)
                   Basic/Pro Visibility System
                   ============================================================ */}
              {(productStore.sceneType === 'studio-branding' ||
                productStore.sceneType === 'editorial-product' ||
                productStore.sceneType === 'lifestyle-real' ||
                productStore.sceneType === 'studio-hero') && (
                  <>
                    <div className={SECTION_GROUP_CLASS}>
                      <p className="text-xs uppercase tracking-[0.2em] font-extrabold text-gray-500 mb-2">INDUSTRY PROFILE</p>
                      <div className="flex flex-wrap gap-2">
                        <Chip
                          selected={industryProfile === 'supplements'}
                          onClick={() => {
                            applyIndustryProfile('supplements');
                            markSectionTouched('product-setup');
                          }}
                          description="Supplements industry defaults"
                        >
                          Supplements (Default)
                        </Chip>
                        <Chip
                          selected={industryProfile === 'wine'}
                          onClick={() => {
                            applyIndustryProfile(industryProfile === 'wine' ? 'supplements' : 'wine');
                            markSectionTouched('product-setup');
                          }}
                          description="Wine prestige industry module"
                        >
                          Wine Prestige
                        </Chip>
                        <Chip
                          selected={industryProfile === 'coffee'}
                          onClick={() => {
                            applyIndustryProfile('coffee');
                            markSectionTouched('product-setup');
                          }}
                          description="Coffee ritual industry defaults"
                        >
                          Coffee Ritual
                        </Chip>
                      </div>
                    </div>

                    {industryProfile === 'wine' && industryModuleRegistry.wine && (
                      <industryModuleRegistry.wine
                        wineAction={productStore.wineAction}
                        winePourStyle={productStore.winePourStyle}
                        contextPreset={productStore.contextPreset}
                        wineLightingTone={productStore.wineLightingTone}
                        wineMoodModifier={productStore.wineMoodModifier}
                        onWineActionChange={(action) => {
                          productStore.setWineAction(action);
                          markSectionTouched('product-setup');
                        }}
                        onWinePourStyleChange={(style) => {
                          productStore.setWinePourStyle(style);
                          markSectionTouched('product-setup');
                        }}
                        onContextPresetChange={(preset) => {
                          productStore.setContextPreset(preset);
                          markSectionTouched('product-setup');
                        }}
                        onWineLightingToneChange={(tone) => {
                          productStore.setWineLightingTone(tone as ProductStudioState['wineLightingTone']);
                          markSectionTouched('product-setup');
                        }}
                        onWineMoodModifierChange={(modifier) => {
                          productStore.setWineMoodModifier(modifier as ProductStudioState['wineMoodModifier']);
                          markSectionTouched('product-setup');
                        }}
                      />
                    )}

                    {industryProfile === 'coffee' && industryModuleRegistry.coffee && (
                      <industryModuleRegistry.coffee
                        coffeeAction={productStore.coffeeAction}
                        contextPreset={productStore.contextPreset}
                        coffeeLightingTone={productStore.coffeeLightingTone}
                        coffeeMoodModifier={productStore.coffeeMoodModifier}
                        coffeeSteamLevel={productStore.coffeeSteamLevel}
                        coffeeLiquidPhysics={productStore.coffeeLiquidPhysics}
                        propsValue={productStore.props}
                        onCoffeeActionChange={(action) => {
                          productStore.setCoffeeAction(action);
                          markSectionTouched('product-setup');
                        }}
                        onContextPresetChange={(preset) => {
                          productStore.setContextPreset(preset);
                          markSectionTouched('product-setup');
                        }}
                        onCoffeeLightingToneChange={(tone) => {
                          productStore.setCoffeeLightingTone(tone);
                          markSectionTouched('product-setup');
                        }}
                        onCoffeeMoodModifierChange={(modifier) => {
                          productStore.setCoffeeMoodModifier(modifier);
                          markSectionTouched('product-setup');
                        }}
                        onCoffeeSteamLevelChange={(level) => {
                          productStore.setCoffeeSteamLevel(level);
                          markSectionTouched('product-setup');
                        }}
                        onCoffeeLiquidPhysicsChange={(enabled) => {
                          productStore.setCoffeeLiquidPhysics(enabled);
                          markSectionTouched('product-setup');
                        }}
                        onPropsValueChange={(next) => {
                          productStore.setProps(next);
                          markSectionTouched('product-setup');
                        }}
                      />
                    )}

                    {/*  Photo Mode - ALWAYS visible (Hero lock bugfix) */}
                    {true && (
                      <>
                        {/* ═══════════════════════════════════════════════════════════
                          1. PHOTO MODE — What am I making?
                          Basic: 4 options | Pro: All options
                          ═══════════════════════════════════════════════════════════ */}
                        <div className={SECTION_GROUP_CLASS}>
                          <p className="text-xs uppercase tracking-[0.2em] font-extrabold text-gray-500 mb-2">PHOTO MODE</p>
                          {(() => {
                            const compositionOptions: Array<{ label: string; mode: PhotoMode }> = [
                              { label: 'Hero Landing Page', mode: 'Hero Landing Page' },
                              { label: 'Color Pop Hero', mode: 'Color Pop Hero' },
                              { label: 'Ingredient Stack', mode: 'Ingredient Stack' },
                              { label: 'Ingredient Flat Lay', mode: 'Ingredient Flat Lay' },
                              { label: 'Routine Carousel', mode: 'Routine Carousel' },
                              { label: 'Macro Dew Label', mode: 'Macro Dew Label' },
                            ];

                            const visualStyleOptions: Array<{ label: string; mode: PhotoMode }> = [
                              { label: 'Clinical Lab Counter', mode: 'Clinical Lab Counter' },
                              { label: 'Minimal Bathroom Vanity', mode: 'Minimal Bathroom Vanity' },
                              { label: 'Dark Premium Studio', mode: 'Dark Premium Studio' },
                              { label: 'Monochrome Brand', mode: 'Monochrome Brand' },
                              { label: 'Brand Campaign', mode: 'Brand Campaign' },
                              { label: 'Creator Premium Simulation', mode: 'Creator Premium Simulation' },
                              { label: 'Tech Clean Studio', mode: 'Tech Clean Studio' },
                              { label: 'Soft Wellness Morning', mode: 'Soft Wellness Morning' },
                              { label: 'Outdoor Energy Boost', mode: 'Outdoor Energy Boost' },
                              { label: 'Sunlit Stone Editorial', mode: 'Sunlit Stone Editorial' },
                              { label: 'Golden Sunset Backlit', mode: 'Golden Sunset Backlit' },
                              { label: 'Bathroom Daylight Clean', mode: 'Bathroom Daylight Clean' },
                              { label: 'Sky Float Minimal', mode: 'Sky Float Minimal' },
                              { label: 'Wet Rock Ripples', mode: 'Wet Rock Ripples' },
                              { label: 'Sand Palm Shadows', mode: 'Sand Palm Shadows' },
                              { label: 'Botanical Water Garden', mode: 'Botanical Water Garden' },
                              { label: 'Warm Window Wood', mode: 'Warm Window Wood' },
                            ];

                            const lightingOptions: Array<{ label: string; value: ProductStudioState['lighting'] }> = [
                              { label: 'Natural Light', value: 'natural-light' },
                              { label: 'Overcast', value: 'overcast' },
                              { label: 'Cozy Indoors', value: 'cozy-indoors' },
                              { label: 'Ring Light', value: 'ring-light' },
                            ];
                            const filteredLightingOptions = isCoffeeIndustry
                              ? lightingOptions.filter(
                                  ({ value }) =>
                                    value === 'natural-light' ||
                                    value === 'overcast' ||
                                    value === 'cozy-indoors'
                                )
                              : lightingOptions;

                            // Photo Mode is single-select across all groups.
                            // Clean up legacy "effects:" overlays so switching modes doesn't keep injecting modifiers.
                            const stripLegacyEffectSegments = (input: string): string => {
                              const parts = String(input ?? '')
                                .split('|')
                                .map((p) => p.trim())
                                .filter(Boolean);
                              const blocked = ['effects:', 'fruit:', 'bed:'];
                              return parts
                                .filter((p) => !blocked.some((b) => p.toLowerCase().startsWith(b)))
                                .join(' | ');
                            };

                            const applyPhotoMode = (mode: PhotoMode) => {
                              productStore.setPhotoMode(mode);
                              const cleaned = stripLegacyEffectSegments(productStore.props);
                              if (cleaned !== productStore.props) productStore.setProps(cleaned);
                              markSectionTouched('product-setup');
                              scrollToPhotoModeSettings();
                              showPhotoModeSettingsHint(mode);
                            };

                            const CHIP_TOOLTIPS: Partial<Record<PhotoMode, string>> = {
                              'Hero Landing Page': 'Deterministic studio hero with copy-safe negative space (no props).',
                              'Color Pop Hero': 'Bold studio hero driven by brand color.',
                              'Ingredient Stack': 'Ingredients arranged around the product on a surface.',
                              'Ingredient Flat Lay': 'Top-down flat lay with controlled spacing.',
                              'Routine Carousel': 'Carousel-friendly product sequence styling.',
                              'Macro Dew Label': 'Macro close-up emphasizing label texture and detail.',
                              'Clinical Lab Counter': 'Clinical countertop with lab-grade cleanliness.',
                              'Minimal Bathroom Vanity': 'Clean bathroom counter vibe (minimal context).',
                              'Dark Premium Studio': 'Premium dark studio mood and contrast.',
                              'Monochrome Brand': 'Monochrome brand-first studio look.',
                              'Brand Campaign': 'Campaign-grade studio polish and drama.',
                              'Creator Premium Simulation': 'Premium UGC-style realism with controlled capture.',
                              'Tech Clean Studio': 'Techy clean studio surfaces and clarity.',
                              'Soft Wellness Morning': 'Soft wellness lifestyle mood and light.',
                              'Outdoor Energy Boost': 'Outdoor energetic lifestyle context.',
                              'Sunlit Stone Editorial': 'Sunlit editorial realism on stone textures.',
                              'Golden Sunset Backlit': 'Golden backlight with controlled flare.',
                              'Bathroom Daylight Clean': 'Daylight bathroom realism, clean and minimal.',
                              'Sky Float Minimal': 'Airy minimal sky feel with clean silhouette.',
                              'Wet Rock Ripples': 'Wet stone with ripples and reflective highlights.',
                              'Sand Palm Shadows': 'Beachy shadow play with sand/palm cues.',
                              'Botanical Water Garden': 'Botanical + water freshness mood.',
                              'Warm Window Wood': 'Warm window light with wood tones.',
                              'Splash Shot': 'Classic high-speed splash with crisp droplets.',
                              'Beach Foam Splash': 'Near-shore foam/spray with premium control.',
                              'Pool Water': 'Pool ripples/caustics with refreshing droplets.',
                              'Cheers (Hands Clink)': 'Two-hand clink moment (hands only, no faces).',
                              'Acrylic Blocks': 'Geometric acrylic risers with refraction.',
                              'Foam & Texture': 'Foam/gel textures as controlled accents.',
                              'Ice Cubes': 'Chilled hero with realistic ice and meltwater.',
                              'Condensation Droplets': 'Cold condensation micro-droplets, label stays crisp.',
                              'Fruit Garnish / Citrus Accents': 'Fruit/citrus accents as secondary styling props.',
                              'Textured Bed / Scatter Base': 'Controlled scatter/bed around the base.',
                              'Floating Particles': 'Subtle atmosphere particles (premium, controlled).',
                              'Gel Smear Editorial': 'Editorial gel smear accents (controlled).',
                              'Underwater Split': 'Split-style underwater look with clean physics.',
                            };

                            const specialEffectsOptions: Array<{ label: string; mode: PhotoMode }> = [
                              { label: 'Splash Shot', mode: 'Splash Shot' },
                              { label: 'Beach Foam Splash', mode: 'Beach Foam Splash' },
                              { label: 'Pool Water', mode: 'Pool Water' },
                              { label: 'Cheers (Hands Clink)', mode: 'Cheers (Hands Clink)' },
                              { label: 'Acrylic Blocks', mode: 'Acrylic Blocks' },
                              { label: 'Foam & Texture', mode: 'Foam & Texture' },
                              { label: 'Ice Cubes', mode: 'Ice Cubes' },
                              { label: 'Condensation Droplets', mode: 'Condensation Droplets' },
                              { label: 'Fruit Garnish / Citrus Accents', mode: 'Fruit Garnish / Citrus Accents' },
                              { label: 'Textured Bed / Scatter Base', mode: 'Textured Bed / Scatter Base' },
                              { label: 'Floating Particles', mode: 'Floating Particles' },
                              { label: 'Gel Smear Editorial', mode: 'Gel Smear Editorial' },
                              { label: 'Underwater Split', mode: 'Underwater Split' },
                              { label: 'Wet Rock Ripples', mode: 'Wet Rock Ripples' },
                              // REMOVED: 'Botanical Water Garden' - already in Visual Style group (line 2439)
                            ];
                            const filteredSpecialEffectsOptions = winePrestigeModeActive
                              ? specialEffectsOptions.filter(({ mode }) =>
                                  mode !== 'Splash Shot' &&
                                  mode !== 'Beach Foam Splash' &&
                                  mode !== 'Pool Water' &&
                                  mode !== 'Underwater Split'
                                )
                              : specialEffectsOptions;
                            const filteredCompositionOptions = compositionOptions.filter(({ mode }) =>
                              !activeIndustryRules?.allowedPhotoModes || activeIndustryRules.allowedPhotoModes.includes(mode)
                            );
                            const isAllowedVisualStyle = (mode: PhotoMode) =>
                              !activeIndustryRules?.allowedVisualStyles || activeIndustryRules.allowedVisualStyles.includes(mode);
                            const filteredIndustrySpecialEffectsOptions = filteredSpecialEffectsOptions.filter(({ mode }) =>
                              !activeIndustryRules?.allowedSpecialEffects || activeIndustryRules.allowedSpecialEffects.includes(mode)
                            );

                            return (
                              <div className="p-5 space-y-7">
                                <div className="space-y-6">
                                  <div>
                                    <p className={GROUP_LABEL_CLASS}>COMPOSITION</p>
                                    <p className="text-[11px] text-gray-500 mt-1">Choose how the product is framed and presented.</p>
                                  </div>
                                  <div className="space-y-5">
                                    <div className="space-y-3">
                                      <p className="text-xs uppercase tracking-[0.14em] font-semibold text-gray-400 dark:text-white/40">Core</p>
                                      <div className="flex flex-wrap gap-3">
                                        {filteredCompositionOptions.map(({ label, mode }) => (
                                          <Chip
                                            key={label}
                                            selected={productStore.photoMode === mode}
                                            description={CHIP_TOOLTIPS[mode] || label}
                                            onClick={() => {
                                              applyPhotoMode(mode);
                                            }}
                                          >
                                            <span className="truncate max-w-full">{label}</span>
                                          </Chip>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {!isCoffeeIndustry && (
                                  <div className="space-y-6">
                                    <div>
                                      <p className={GROUP_LABEL_CLASS}>VISUAL STYLE</p>
                                      <p className="text-[11px] text-gray-500 mt-1">Overall aesthetic and brand mood.</p>
                                    </div>
                                    <div className="space-y-5">
                                      <div className="space-y-3">
                                        <p className="text-xs uppercase tracking-[0.14em] font-semibold text-gray-400 dark:text-white/40">Studio Worlds</p>
                                        <div className="flex flex-wrap gap-3">
                                          {visualStyleOptions.filter(x =>
                                            x.mode === 'Clinical Lab Counter' ||
                                            x.mode === 'Minimal Bathroom Vanity' ||
                                            x.mode === 'Dark Premium Studio' ||
                                            x.mode === 'Tech Clean Studio'
                                          ).filter(({ mode }) => isAllowedVisualStyle(mode)).map(({ label, mode }) => (
                                            <Chip
                                              key={label}
                                              selected={productStore.photoMode === mode}
                                              description={CHIP_TOOLTIPS[mode] || label}
                                              onClick={() => {
                                                applyPhotoMode(mode);
                                              }}
                                            >
                                              <span className="truncate max-w-full">{label}</span>
                                            </Chip>
                                          ))}
                                        </div>
                                      </div>

                                      <div className="space-y-3">
                                        <p className="text-xs uppercase tracking-[0.14em] font-semibold text-gray-400 dark:text-white/40">Brand Worlds</p>
                                        <div className="flex flex-wrap gap-3">
                                          {visualStyleOptions.filter(x =>
                                            x.mode === 'Monochrome Brand' ||
                                            x.mode === 'Brand Campaign' ||
                                            x.mode === 'Creator Premium Simulation'
                                          ).filter(({ mode }) => isAllowedVisualStyle(mode)).map(({ label, mode }) => (
                                            <Chip
                                              key={label}
                                              selected={productStore.photoMode === mode}
                                              description={CHIP_TOOLTIPS[mode] || label}
                                              onClick={() => {
                                                applyPhotoMode(mode);
                                              }}
                                            >
                                              <span className="truncate max-w-full">{label}</span>
                                            </Chip>
                                          ))}
                                        </div>
                                      </div>

                                      <div className="space-y-3">
                                        <p className="text-xs uppercase tracking-[0.14em] font-semibold text-gray-400 dark:text-white/40">Lifestyle Worlds</p>
                                        <div className="flex flex-wrap gap-3">
                                          {visualStyleOptions.filter(x =>
                                            x.mode === 'Soft Wellness Morning' ||
                                            x.mode === 'Outdoor Energy Boost'
                                          ).filter(({ mode }) => isAllowedVisualStyle(mode)).map(({ label, mode }) => (
                                            <Chip
                                              key={label}
                                              selected={productStore.photoMode === mode}
                                              description={CHIP_TOOLTIPS[mode] || label}
                                              onClick={() => {
                                                applyPhotoMode(mode);
                                              }}
                                            >
                                              <span className="truncate max-w-full">{label}</span>
                                            </Chip>
                                          ))}
                                        </div>
                                      </div>

                                      <div className="space-y-3">
                                        <p className="text-xs uppercase tracking-[0.14em] font-semibold text-gray-400 dark:text-white/40">Realism</p>
                                        <div className="flex flex-wrap gap-3">
                                          {visualStyleOptions.filter(x =>
                                            x.mode === 'Sunlit Stone Editorial' ||
                                            x.mode === 'Golden Sunset Backlit' ||
                                            x.mode === 'Bathroom Daylight Clean' ||
                                            x.mode === 'Warm Window Wood'
                                          ).filter(({ mode }) => isAllowedVisualStyle(mode)).map(({ label, mode }) => (
                                            <Chip
                                              key={label}
                                              selected={productStore.photoMode === mode}
                                              description={CHIP_TOOLTIPS[mode] || label}
                                              onClick={() => {
                                                applyPhotoMode(mode);
                                              }}
                                            >
                                              <span className="truncate max-w-full">{label}</span>
                                            </Chip>
                                          ))}
                                        </div>
                                      </div>

                                      <div className="space-y-3">
                                        <p className="text-xs uppercase tracking-[0.14em] font-semibold text-gray-400 dark:text-white/40">Nature Elements</p>
                                        <div className="flex flex-wrap gap-3">
                                          {visualStyleOptions.filter(x =>
                                            x.mode === 'Sky Float Minimal' ||
                                            x.mode === 'Wet Rock Ripples' ||
                                            x.mode === 'Sand Palm Shadows' ||
                                            x.mode === 'Botanical Water Garden'
                                          ).filter(({ mode }) => isAllowedVisualStyle(mode)).map(({ label, mode }) => (
                                            <Chip
                                              key={label}
                                              selected={productStore.photoMode === mode}
                                              description={CHIP_TOOLTIPS[mode] || label}
                                              onClick={() => {
                                                applyPhotoMode(mode);
                                              }}
                                            >
                                              <span className="truncate max-w-full">{label}</span>
                                            </Chip>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                <div className="space-y-6">
                                  <div>
                                    <p className={GROUP_LABEL_CLASS}>LIGHTING</p>
                                    <p className="text-[11px] text-gray-500 mt-1">Product-safe lighting style.</p>
                                  </div>
                                  <div className="flex flex-wrap gap-3">
                                    {filteredLightingOptions.map(({ label, value }) => (
                                      <Chip
                                        key={value}
                                        selected={productStore.lighting === value}
                                        description={
                                          value === 'natural-light'
                                            ? 'Soft natural light with realistic shadows.'
                                            : value === 'overcast'
                                              ? 'Diffused overcast light, low contrast.'
                                              : value === 'cozy-indoors'
                                                ? 'Warm indoor light with gentle falloff.'
                                                : 'Direct ring light with clean catchlights.'
                                        }
                                        onClick={() => {
                                          productStore.setLighting(value);
                                          markSectionTouched('product-setup');
                                        }}
                                      >
                                        <span className="truncate max-w-full">{label}</span>
                                      </Chip>
                                    ))}
                                  </div>
                                </div>

                                {!isCoffeeIndustry && (
                                  <div className="space-y-6">
                                    <div>
                                      <p className={GROUP_LABEL_CLASS}>SPECIAL EFFECTS</p>
                                      <p className="text-[11px] text-gray-500 mt-1">Optional visual enhancements.</p>
                                    </div>
                                    <div className="flex flex-wrap gap-3">
                                      {filteredIndustrySpecialEffectsOptions.map(({ label, mode }) => (
                                        <Chip
                                          key={label}
                                          selected={productStore.photoMode === mode}
                                          description={CHIP_TOOLTIPS[mode] || label}
                                          onClick={() => {
                                            applyPhotoMode(mode);
                                          }}
                                        >
                                          <span className="truncate max-w-full">{label}</span>
                                        </Chip>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })()}

                          <div className="mt-8 space-y-5">
                            <div ref={photoModeSettingsRef} />
                            {photoModeHintVisible && (
                              <div className="rounded-lg border border-indigo-200/80 bg-indigo-50/80 px-3 py-2 text-[11px] text-indigo-800">
                                <p className="font-semibold">You can adjust this option here: {photoModeHintMode || productStore.photoMode}</p>
                                <p className="text-indigo-700/90">This hint will auto-dismiss in a few seconds.</p>
                              </div>
                            )}
                            {productStore.photoMode === 'Hero Landing Page' && (
                              <div className="rounded-2xl border border-gray-200 bg-white p-5 space-y-5">
                                {(() => {
                                  const heroCfg = productStore.photoModeConfig.heroLandingPage;
                                  const bgType = heroCfg.backgroundType;
                                  const isGradient = bgType === 'Gradient';

                                  const dotBase = COLOR_PICKER_BUTTON_CLASS;
                                  const dotBorder = (isSelected: boolean) =>
                                    isSelected ? 'border-indigo-600' : 'border-gray-200 hover:border-gray-300';

                                  const getActiveTargetColor = (): string => {
                                    if (!isGradient) return normalizeHex(productStore.backgroundColor) ?? '#FFFFFF';
                                    if (heroGradientAssignTarget === 'start') return normalizeHex(productStore.gradientStart) ?? '#FFFFFF';
                                    if (heroGradientAssignTarget === 'end') return normalizeHex(productStore.gradientEnd) ?? '#FFFFFF';
                                    return normalizeHex(productStore.gradientMid) ?? '#FFFFFF';
                                  };

                                  const applyHeroColor = (hex: string) => {
                                    if (!isGradient) {
                                      productStore.setBackgroundColor(hex);
                                      markSectionTouched('product-setup');
                                      return;
                                    }
                                    if (heroGradientAssignTarget === 'start') productStore.setGradientStart(hex);
                                    if (heroGradientAssignTarget === 'end') productStore.setGradientEnd(hex);
                                    if (heroGradientAssignTarget === 'mid') productStore.setGradientMid(hex);
                                    markSectionTouched('product-setup');
                                  };

                                  const brandDots = heroLandingBrandSwatches.slice(0, 3);
                                  const hasThird = Boolean(normalizeHex(productStore.gradientMid));
                                  const thirdSmallBase = COLOR_PICKER_BUTTON_CLASS;

                                  return (
                                    <>
                                      <div className="space-y-5">
                                        <div className="space-y-5">
                                          <div>
                                            <p className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold mb-2">Background</p>
                                            <div className="flex flex-wrap gap-2">
                                              {(['Solid', 'Gradient'] as const).map(v => (
                                                <Chip
                                                  key={v}
                                                  selected={heroCfg.backgroundType === v}
                                                  onClick={() => {
                                                    productStore.setPhotoModeConfig({ heroLandingPage: { backgroundType: v } });
                                                    markSectionTouched('product-setup');
                                                  }}
                                                >
                                                  {v}
                                                </Chip>
                                              ))}
                                            </div>
                                          </div>

                                          {isGradient && (
                                            <div>
                                              <p className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold mb-2">Colors</p>
                                              <div className="flex items-center gap-4">
                                                <button
                                                  type="button"
                                                  onClick={() => setHeroGradientAssignTarget('start')}
                                                  className={`${dotBase} ${dotBorder(heroGradientAssignTarget === 'start')}`}
                                                  style={{ background: normalizeHex(productStore.gradientStart) ?? '#FFFFFF' }}
                                                  aria-label="Select Start gradient color"
                                                />
                                                <button
                                                  type="button"
                                                  onClick={() => setHeroGradientAssignTarget('end')}
                                                  className={`${dotBase} ${dotBorder(heroGradientAssignTarget === 'end')}`}
                                                  style={{ background: normalizeHex(productStore.gradientEnd) ?? '#FFFFFF' }}
                                                  aria-label="Select End gradient color"
                                                />

                                                {hasThird ? (
                                                  <div className="relative">
                                                    <button
                                                      type="button"
                                                      onClick={() => setHeroGradientAssignTarget('mid')}
                                                      className={`${thirdSmallBase} ${dotBorder(heroGradientAssignTarget === 'mid')}`}
                                                      style={{ background: normalizeHex(productStore.gradientMid) ?? '#FFFFFF' }}
                                                      aria-label="Select Third gradient color"
                                                    />
                                                    <button
                                                      type="button"
                                                      onClick={() => {
                                                        productStore.setGradientMid('');
                                                        markSectionTouched('product-setup');
                                                        if (heroGradientAssignTarget === 'mid') setHeroGradientAssignTarget('end');
                                                      }}
                                                      className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-white border border-gray-200 text-xs leading-none text-gray-600 hover:border-gray-300"
                                                      aria-label="Remove third gradient color"
                                                    >
                                                      ×
                                                    </button>
                                                  </div>
                                                ) : (
                                                  <button
                                                    type="button"
                                                    onClick={() => {
                                                      productStore.setPhotoModeConfig({ heroLandingPage: { colorSource: 'Brand Colors' } });
                                                      const suggested =
                                                        heroLandingBrandSwatches[2] ||
                                                        heroLandingBrandSwatches[1] ||
                                                        heroLandingBrandSwatches[0] ||
                                                        '#FFFFFF';
                                                      productStore.setGradientMid(suggested);
                                                      setHeroGradientAssignTarget('mid');
                                                      markSectionTouched('product-setup');
                                                    }}
                                                    className="h-9 w-9 rounded-full border border-gray-200 bg-white text-[12px] font-semibold text-gray-600 hover:border-gray-300"
                                                    aria-label="Add third gradient color"
                                                  >
                                                    +
                                                  </button>
                                                )}
                                              </div>
                                            </div>
                                          )}

                                          <div>
                                            <p className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold mb-2">Brand Colors</p>
                                            <div className="flex flex-wrap gap-2">
                                              {brandDots.length > 0 ? (
                                                brandDots.map(hex => {
                                                  const isSelected = isGradient
                                                    ? getActiveTargetColor() === hex
                                                    : normalizeHex(productStore.backgroundColor) === hex;
                                                  return (
                                                    <button
                                                      key={hex}
                                                      type="button"
                                                      onClick={() => {
                                                        productStore.setPhotoModeConfig({ heroLandingPage: { colorSource: 'Brand Colors' } });
                                                        applyHeroColor(hex);
                                                      }}
                                                      className={`${dotBase} ${dotBorder(isSelected)}`}
                                                      style={{ background: hex }}
                                                      aria-label={`Use brand color ${hex}`}
                                                    />
                                                  );
                                                })
                                              ) : (
                                                <p className="text-[11px] text-gray-500">No brand colors available.</p>
                                              )}
                                            </div>
                                          </div>

                                          <div>
                                            <p className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold mb-2">Custom Color</p>
                                            <div className="flex flex-wrap items-center gap-3">
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  productStore.setPhotoModeConfig({ heroLandingPage: { colorSource: 'Custom Color' } });
                                                  applyHeroColor('#FFFFFF');
                                                }}
                                                className={`${dotBase} ${dotBorder(getActiveTargetColor() === '#FFFFFF')}`}
                                                style={{ background: '#FFFFFF' }}
                                                aria-label="Set to white"
                                              />
                                              <label
                                                className={`relative inline-block ${dotBase} ${dotBorder(false)}`}
                                                style={{ background: getActiveTargetColor() }}
                                                aria-label="Pick a custom color"
                                              >
                                                <input
                                                  type="color"
                                                  value={getActiveTargetColor()}
                                                  onClick={() => {
                                                    const target = isGradient ? heroGradientAssignTarget : 'solid';
                                                    setHeroHexEditingTarget(target);
                                                    setHeroHexDraft(getActiveTargetColor());
                                                  }}
                                                  onChange={(e) => {
                                                    productStore.setPhotoModeConfig({ heroLandingPage: { colorSource: 'Custom Color' } });
                                                    applyHeroColor(e.target.value);
                                                    setHeroHexDraft(normalizeHex(e.target.value) ?? e.target.value);
                                                  }}
                                                  className={COLOR_PICKER_HIDDEN_INPUT_CLASS}
                                                  aria-label="Custom color picker"
                                                />
                                              </label>
                                              {isGradient && (
                                                <p className="text-[11px] text-gray-500">
                                                  Applies to: {heroGradientAssignTarget === 'start' ? 'Start' : heroGradientAssignTarget === 'end' ? 'End' : 'Third'}
                                                </p>
                                              )}
                                            </div>

                                            {heroHexEditingTarget && (
                                              <div className="mt-4 flex items-center gap-2">
                                                <input
                                                  type="text"
                                                  value={heroHexDraft}
                                                  onChange={(e) => setHeroHexDraft(e.target.value)}
                                                  onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                      applyHeroHexToTarget();
                                                      setHeroHexEditingTarget(null);
                                                    }
                                                    if (e.key === 'Escape') {
                                                      setHeroHexEditingTarget(null);
                                                    }
                                                  }}
                                                  onBlur={() => {
                                                    applyHeroHexToTarget();
                                                    setHeroHexEditingTarget(null);
                                                  }}
                                                  placeholder="#FFFFFF"
                                                  className="h-9 w-36 rounded-lg border border-gray-200 bg-white px-2 text-[11px] font-mono text-gray-900 placeholder:text-gray-400 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-500"
                                                  aria-label="Hex color"
                                                  autoFocus
                                                />
                                              </div>
                                            )}
                                          </div>

                                          {isGradient && (
                                            <div>
                                              <p className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold mb-2">Gradient Style</p>
                                              <div className="flex flex-wrap gap-2">
                                                {(['Soft', 'Radial', 'Vertical'] as const).map(v => (
                                                  <Chip
                                                    key={v}
                                                    selected={heroCfg.gradientStyle === v}
                                                    onClick={() => {
                                                      productStore.setPhotoModeConfig({ heroLandingPage: { gradientStyle: v } });
                                                      markSectionTouched('product-setup');
                                                    }}
                                                  >
                                                    {v}
                                                  </Chip>
                                                ))}
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      </div>

                                      <div className="h-px bg-gray-200 my-6" />

                                      <div className="space-y-5">
                                        <div>
                                          <p className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold mb-2">Palette Source</p>
                                          <div className="flex flex-wrap gap-2">
                                            {(['Product label colors', 'Neutral brand tones', 'Custom'] as const).map(v => (
                                              <Chip
                                                key={v}
                                                selected={heroCfg.paletteSource === v}
                                                onClick={() => {
                                                  productStore.setPhotoModeConfig({ heroLandingPage: { paletteSource: v } });
                                                  markSectionTouched('product-setup');
                                                }}
                                              >
                                                {v}
                                              </Chip>
                                            ))}
                                          </div>
                                        </div>

                                        <div>
                                          <p className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold mb-2">Negative Space</p>
                                          <div className="flex flex-wrap gap-2">
                                            {(['Tight', 'Balanced', 'Spacious'] as const).map(v => (
                                              <Chip
                                                key={v}
                                                selected={heroCfg.negativeSpace === v}
                                                onClick={() => {
                                                  productStore.setPhotoModeConfig({ heroLandingPage: { negativeSpace: v } });
                                                  markSectionTouched('product-setup');
                                                }}
                                              >
                                                {v}
                                              </Chip>
                                            ))}
                                          </div>
                                        </div>

                                        <div>
                                          <p className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold mb-2">Contrast Level</p>
                                          <div className="flex flex-wrap gap-2">
                                            {(['Soft', 'High'] as const).map(v => (
                                              <Chip
                                                key={v}
                                                selected={heroCfg.contrastLevel === v}
                                                onClick={() => {
                                                  productStore.setPhotoModeConfig({ heroLandingPage: { contrastLevel: v } });
                                                  markSectionTouched('product-setup');
                                                }}
                                              >
                                                {v}
                                              </Chip>
                                            ))}
                                          </div>
                                        </div>
                                      </div>
                                    </>
                                  );
                                })()}
                              </div>
                            )}

                            {productStore.photoMode === 'Color Pop Hero' && (
                              <div className="space-y-3">
                                <div>
                                  <p className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold mb-1">Background Type</p>
                                  <div className="flex flex-wrap gap-2">
                                    {(['Solid', 'Gradient'] as const).map(v => (
                                      <Chip
                                        key={v}
                                        selected={productStore.photoModeConfig.colorPopHero.backgroundType === v}
                                        onClick={() => {
                                          productStore.setPhotoModeConfig({ colorPopHero: { backgroundType: v } });
                                          markSectionTouched('product-setup');
                                        }}
                                      >
                                        {v}
                                      </Chip>
                                    ))}
                                  </div>
                                </div>

                                {productStore.photoModeConfig.colorPopHero.backgroundType === 'Gradient' && (
                                  <div>
                                    <p className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold mb-1">Gradient Style</p>
                                    <div className="flex flex-wrap gap-2">
                                      {(['Soft', 'Radial', 'Vertical'] as const).map(v => (
                                        <Chip
                                          key={v}
                                          selected={productStore.photoModeConfig.colorPopHero.gradientStyle === v}
                                          onClick={() => {
                                            productStore.setPhotoModeConfig({ colorPopHero: { gradientStyle: v } });
                                            markSectionTouched('product-setup');
                                          }}
                                        >
                                          {v}
                                        </Chip>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                <div>
                                  <p className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold mb-1">Color Source</p>
                                  <div className="flex flex-wrap gap-2">
                                    {(['Brand Colors', 'Product Label Colors', 'Custom Color'] as const).map(v => (
                                      <Chip
                                        key={v}
                                        selected={productStore.photoModeConfig.colorPopHero.colorSource === v}
                                        onClick={() => {
                                          productStore.setPhotoModeConfig({ colorPopHero: { colorSource: v } });
                                          markSectionTouched('product-setup');
                                        }}
                                      >
                                        {v}
                                      </Chip>
                                    ))}
                                  </div>
                                </div>

                                <div>
                                  <p className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold mb-1">Saturation Level</p>
                                  <div className="flex flex-wrap gap-2">
                                    {(['Moderate', 'High'] as const).map(v => (
                                      <Chip
                                        key={v}
                                        selected={productStore.photoModeConfig.colorPopHero.saturationLevel === v}
                                        onClick={() => {
                                          productStore.setPhotoModeConfig({ colorPopHero: { saturationLevel: v } });
                                          markSectionTouched('product-setup');
                                        }}
                                      >
                                        {v}
                                      </Chip>
                                    ))}
                                  </div>
                                </div>

                                <div>
                                  <p className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold mb-1">Contrast Strategy</p>
                                  <div className="flex flex-wrap gap-2">
                                    {(['Soft', 'High'] as const).map(v => (
                                      <Chip
                                        key={v}
                                        selected={productStore.photoModeConfig.colorPopHero.contrastStrategy === v}
                                        onClick={() => {
                                          productStore.setPhotoModeConfig({ colorPopHero: { contrastStrategy: v } });
                                          markSectionTouched('product-setup');
                                        }}
                                      >
                                        {v}
                                      </Chip>
                                    ))}
                                  </div>
                                </div>

                                <div>
                                  <p className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold mb-1">Negative Space</p>
                                  <div className="flex flex-wrap gap-2">
                                    {(['Tight', 'Balanced', 'Spacious'] as const).map(v => (
                                      <Chip
                                        key={v}
                                        selected={productStore.photoModeConfig.colorPopHero.negativeSpace === v}
                                        onClick={() => {
                                          productStore.setPhotoModeConfig({ colorPopHero: { negativeSpace: v } });
                                          markSectionTouched('product-setup');
                                        }}
                                      >
                                        {v}
                                      </Chip>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}

                            {(productStore.photoMode === 'Ingredient Stack' || productStore.photoMode === 'Ingredient Flat Lay') && (
                              <div className="space-y-3">
                                {/* CUSTOM INGREDIENTS INPUT */}
                                <div>
                                  <p className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold mb-1">
                                    Ingredients <span className="text-red-400">*</span>
                                  </p>
                                  <input
                                    type="text"
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-white/5 dark:border-white/10 dark:text-white"
                                    placeholder="e.g., strawberries, blueberries, mint leaves, honey"
                                    value={productStore.props || ''}
                                    onChange={(e) => {
                                      productStore.setProps(e.target.value);
                                      markSectionTouched('product-setup');
                                    }}
                                  />
                                  <p className="text-[9px] text-gray-500 mt-1">
                                    Describe the specific ingredients to show around the product
                                  </p>
                                </div>

                                {productStore.photoMode === 'Ingredient Stack' && (
                                  <>
                                    <div>
                                      <p className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold mb-1">Ingredient Focus</p>
                                      <div className="flex flex-wrap gap-2">
                                        {(['Key active only', 'Full formula'] as const).map(v => (
                                          <Chip
                                            key={v}
                                            selected={productStore.photoModeConfig.ingredientStack.ingredientFocus === v}
                                            onClick={() => {
                                              productStore.setPhotoModeConfig({ ingredientStack: { ingredientFocus: v } });
                                              markSectionTouched('product-setup');
                                            }}
                                          >
                                            {v}
                                          </Chip>
                                        ))}
                                      </div>
                                    </div>

                                    <div>
                                      <p className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold mb-1">Stack Style</p>
                                      <div className="flex flex-wrap gap-2">
                                        {(['Surround', 'Split composition'] as const).map(v => (
                                          <Chip
                                            key={v}
                                            selected={productStore.photoModeConfig.ingredientStack.stackStyle === v}
                                            onClick={() => {
                                              productStore.setPhotoModeConfig({ ingredientStack: { stackStyle: v } });
                                              markSectionTouched('product-setup');
                                            }}
                                          >
                                            {v}
                                          </Chip>
                                        ))}
                                      </div>
                                    </div>
                                    <div>
                                      <p className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold mb-1">Ingredient Presence</p>
                                      <div className="flex flex-wrap gap-2">
                                        {(['Subtle', 'Balanced', 'Hero'] as const).map(v => (
                                          <Chip
                                            key={v}
                                            selected={productStore.photoModeConfig.ingredientStack.ingredientPresence === v}
                                            onClick={() => {
                                              productStore.setPhotoModeConfig({ ingredientStack: { ingredientPresence: v } });
                                              markSectionTouched('product-setup');
                                            }}
                                          >
                                            {v}
                                          </Chip>
                                        ))}
                                      </div>
                                    </div>
                                    <div>
                                      <p className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold mb-1">Label Priority</p>
                                      <div className="flex flex-wrap gap-2">
                                        {(['Always readable', 'Secondary to ingredients'] as const).map(v => (
                                          <Chip
                                            key={v}
                                            selected={productStore.photoModeConfig.ingredientStack.labelPriority === v}
                                            onClick={() => {
                                              productStore.setPhotoModeConfig({ ingredientStack: { labelPriority: v } });
                                              markSectionTouched('product-setup');
                                            }}
                                          >
                                            {v}
                                          </Chip>
                                        ))}
                                      </div>
                                    </div>

                                    <div className="rounded-xl border border-gray-200 bg-white p-3 space-y-3">
                                      <div className="flex items-center justify-between gap-3">
                                        <div>
                                          <p className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold">Background</p>
                                          <p className="text-[11px] text-gray-600">Optional override (solid or gradient)</p>
                                        </div>
                                        <SwitchToggle
                                          checked={productStore.photoModeConfig.ingredientStack.backgroundEnabled}
                                          onCheckedChange={(next) => {
                                            productStore.setPhotoModeConfig({ ingredientStack: { backgroundEnabled: next } });
                                            markSectionTouched('product-setup');
                                          }}
                                          aria-label="Ingredient Stack background override"
                                        />
                                      </div>

                                      {productStore.photoModeConfig.ingredientStack.backgroundEnabled && (
                                        <div className="space-y-3">
                                          <div>
                                            <p className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold mb-1">Background Type</p>
                                            <div className="flex flex-wrap gap-2">
                                              {(['Solid', 'Gradient'] as const).map(v => (
                                                <Chip
                                                  key={v}
                                                  selected={productStore.photoModeConfig.ingredientStack.backgroundType === v}
                                                  onClick={() => {
                                                    productStore.setPhotoModeConfig({ ingredientStack: { backgroundType: v } });
                                                    markSectionTouched('product-setup');
                                                  }}
                                                >
                                                  {v}
                                                </Chip>
                                              ))}
                                            </div>
                                          </div>

                                          {productStore.photoModeConfig.ingredientStack.backgroundType === 'Gradient' && (
                                            <div>
                                              <p className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold mb-1">Gradient Style</p>
                                              <div className="flex flex-wrap gap-2">
                                                {(['Soft', 'Radial', 'Vertical'] as const).map(v => (
                                                  <Chip
                                                    key={v}
                                                    selected={productStore.photoModeConfig.ingredientStack.gradientStyle === v}
                                                    onClick={() => {
                                                      productStore.setPhotoModeConfig({ ingredientStack: { gradientStyle: v } });
                                                      markSectionTouched('product-setup');
                                                    }}
                                                  >
                                                    {v}
                                                  </Chip>
                                                ))}
                                              </div>
                                            </div>
                                          )}

                                          <div>
                                            <p className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold mb-1">Colors</p>
                                            <div className="flex flex-wrap gap-2">
                                              {(['Brand Colors', 'Custom Color'] as const).map(v => (
                                                <Chip
                                                  key={v}
                                                  selected={productStore.photoModeConfig.ingredientStack.colorSource === v}
                                                  onClick={() => {
                                                    productStore.setPhotoModeConfig({ ingredientStack: { colorSource: v } });
                                                    markSectionTouched('product-setup');
                                                  }}
                                                >
                                                  {v}
                                                </Chip>
                                              ))}
                                            </div>
                                          </div>

                                          {productStore.photoModeConfig.ingredientStack.colorSource === 'Custom Color' && (
                                            <>
                                              {productStore.photoModeConfig.ingredientStack.backgroundType === 'Solid' ? (
                                                <div className="flex items-center gap-3">
                                                  <span
                                                    className="block h-8 w-8 rounded-full border-2 border-gray-200"
                                                    style={{ background: (productStore.backgroundColor || '#ffffff') as any }}
                                                  />
                                                  <input
                                                    type="text"
                                                    value={String(productStore.backgroundColor || '#FFFFFF').toUpperCase()}
                                                    onChange={(e) => {
                                                      productStore.setGradientEnabled(false);
                                                      productStore.setBackgroundColor(e.target.value);
                                                      markSectionTouched('product-setup');
                                                    }}
                                                    placeholder="#FFFFFF"
                                                    className="w-32 rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs font-mono text-gray-900 placeholder:text-gray-400 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-500"
                                                  />
                                                </div>
                                              ) : (
                                                <div className="flex flex-wrap gap-3">
                                                  <div className="flex items-center gap-3">
                                                    <span
                                                      className="block h-8 w-8 rounded-full border-2 border-gray-200"
                                                      style={{ background: (productStore.gradientStart || '#ffffff') as any }}
                                                    />
                                                    <input
                                                      type="text"
                                                      value={String(productStore.gradientStart || '#FFFFFF').toUpperCase()}
                                                      onChange={(e) => {
                                                        productStore.setGradientEnabled(true);
                                                        productStore.setGradientStart(e.target.value);
                                                        markSectionTouched('product-setup');
                                                      }}
                                                      placeholder="#FFFFFF"
                                                      className="w-32 rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs font-mono text-gray-900 placeholder:text-gray-400 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-500"
                                                    />
                                                    <span className="text-xs text-gray-500">Start</span>
                                                  </div>
                                                  <div className="flex items-center gap-3">
                                                    <span
                                                      className="block h-8 w-8 rounded-full border-2 border-gray-200"
                                                      style={{ background: (productStore.gradientEnd || '#ffffff') as any }}
                                                    />
                                                    <input
                                                      type="text"
                                                      value={String(productStore.gradientEnd || '#FFFFFF').toUpperCase()}
                                                      onChange={(e) => {
                                                        productStore.setGradientEnabled(true);
                                                        productStore.setGradientEnd(e.target.value);
                                                        markSectionTouched('product-setup');
                                                      }}
                                                      placeholder="#FFFFFF"
                                                      className="w-32 rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs font-mono text-gray-900 placeholder:text-gray-400 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-500"
                                                    />
                                                    <span className="text-xs text-gray-500">End</span>
                                                  </div>
                                                </div>
                                              )}
                                            </>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </>
                                )}
                              </div>
                            )}

                            {productStore.photoMode === 'Acrylic Blocks' && (
                              <div className="space-y-3">
                                <div>
                                  <p className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold mb-1">Block Shape</p>
                                  <div className="flex flex-wrap gap-2">
                                    {(['Rectangular', 'Cylindrical', 'Mixed geometry'] as const).map(v => (
                                      <Chip
                                        key={v}
                                        selected={productStore.photoModeConfig.acrylicBlocks.blockShape === v}
                                        onClick={() => {
                                          productStore.setPhotoModeConfig({ acrylicBlocks: { blockShape: v } });
                                          markSectionTouched('product-setup');
                                        }}
                                      >
                                        {v}
                                      </Chip>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <p className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold mb-1">Material Finish</p>
                                  <div className="flex flex-wrap gap-2">
                                    {(['Clear', 'Frosted', 'Smoked'] as const).map(v => (
                                      <Chip
                                        key={v}
                                        selected={productStore.photoModeConfig.acrylicBlocks.materialFinish === v}
                                        onClick={() => {
                                          productStore.setPhotoModeConfig({ acrylicBlocks: { materialFinish: v } });
                                          markSectionTouched('product-setup');
                                        }}
                                      >
                                        {v}
                                      </Chip>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <p className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold mb-1">Reflection Level</p>
                                  <div className="flex flex-wrap gap-2">
                                    {(['Minimal', 'Balanced', 'Glossy'] as const).map(v => (
                                      <Chip
                                        key={v}
                                        selected={productStore.photoModeConfig.acrylicBlocks.reflectionLevel === v}
                                        onClick={() => {
                                          productStore.setPhotoModeConfig({ acrylicBlocks: { reflectionLevel: v } });
                                          markSectionTouched('product-setup');
                                        }}
                                      >
                                        {v}
                                      </Chip>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <p className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold mb-1">Elevation</p>
                                  <div className="flex flex-wrap gap-2">
                                    {(['Grounded', 'Floating illusion'] as const).map(v => (
                                      <Chip
                                        key={v}
                                        selected={productStore.photoModeConfig.acrylicBlocks.elevation === v}
                                        onClick={() => {
                                          productStore.setPhotoModeConfig({ acrylicBlocks: { elevation: v } });
                                          markSectionTouched('product-setup');
                                        }}
                                      >
                                        {v}
                                      </Chip>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}

                            {productStore.photoMode === 'Splash Shot' && !winePrestigeModeActive && (
                              <div className="space-y-3">
                                <div>
                                  <p className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold mb-1">Splash Medium</p>
                                  <div className="flex flex-wrap gap-2">
                                    {(['Liquid'] as const).map(v => (
                                      <Chip
                                        key={v}
                                        selected={productStore.photoModeConfig.splashShot.splashMedium === v}
                                        onClick={() => {
                                          productStore.setPhotoModeConfig({ splashShot: { splashMedium: v } });
                                          markSectionTouched('product-setup');
                                        }}
                                      >
                                        {v}
                                      </Chip>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <p className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold mb-1">Motion Intensity</p>
                                  <div className="flex flex-wrap gap-2">
                                    {(['Dynamic', 'Explosive'] as const).map(v => (
                                      <Chip
                                        key={v}
                                        selected={productStore.photoModeConfig.splashShot.motionIntensity === v}
                                        onClick={() => {
                                          productStore.setPhotoModeConfig({ splashShot: { motionIntensity: v } });
                                          markSectionTouched('product-setup');
                                        }}
                                      >
                                        {v}
                                      </Chip>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <p className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold mb-1">Freeze Moment</p>
                                  <div className="flex flex-wrap gap-2">
                                    {(['Mid-splash', 'Peak'] as const).map(v => (
                                      <Chip
                                        key={v}
                                        selected={productStore.photoModeConfig.splashShot.freezeMoment === v}
                                        onClick={() => {
                                          productStore.setPhotoModeConfig({ splashShot: { freezeMoment: v } });
                                          markSectionTouched('product-setup');
                                        }}
                                      >
                                        {v}
                                      </Chip>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <p className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold mb-1">Product Stability</p>
                                  <div className="flex flex-wrap gap-2">
                                    {(['Fully grounded', 'Slight interaction'] as const).map(v => (
                                      <Chip
                                        key={v}
                                        selected={productStore.photoModeConfig.splashShot.productStability === v}
                                        onClick={() => {
                                          productStore.setPhotoModeConfig({ splashShot: { productStability: v } });
                                          markSectionTouched('product-setup');
                                        }}
                                      >
                                        {v}
                                      </Chip>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* DYNAMIC SCHEMA SETTINGS */}
                            {PHOTO_MODE_SCHEMAS[productStore.photoMode] && !PHOTO_MODE_WITH_MANUAL_SETTINGS.has(productStore.photoMode as PhotoMode) && (
                              <PhotoModeSettings
                                schema={PHOTO_MODE_SCHEMAS[productStore.photoMode]!}
                                productStore={productStore}
                                markSectionTouched={markSectionTouched}
                              />
                            )}

                            {productStore.photoMode === 'Foam & Texture' && (
                              <div className="space-y-3">
                                <div>
                                  <p className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold mb-1">Texture Type</p>
                                  <div className="flex flex-wrap gap-2">
                                    {(['Foam', 'Cream', 'Gel', 'Powder'] as const).map(v => (
                                      <Chip
                                        key={v}
                                        selected={productStore.photoModeConfig.foamAndTexture.textureType === v}
                                        onClick={() => {
                                          productStore.setPhotoModeConfig({ foamAndTexture: { textureType: v } });
                                          markSectionTouched('product-setup');
                                        }}
                                      >
                                        {v}
                                      </Chip>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <p className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold mb-1">Texture Density</p>
                                  <div className="flex flex-wrap gap-2">
                                    {(['Light', 'Rich', 'Dense'] as const).map(v => (
                                      <Chip
                                        key={v}
                                        selected={productStore.photoModeConfig.foamAndTexture.textureDensity === v}
                                        onClick={() => {
                                          productStore.setPhotoModeConfig({ foamAndTexture: { textureDensity: v } });
                                          markSectionTouched('product-setup');
                                        }}
                                      >
                                        {v}
                                      </Chip>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <p className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold mb-1">Focus Distance</p>
                                  <div className="flex flex-wrap gap-2">
                                    {(['Macro', 'Close'] as const).map(v => (
                                      <Chip
                                        key={v}
                                        selected={productStore.photoModeConfig.foamAndTexture.focusDistance === v}
                                        onClick={() => {
                                          productStore.setPhotoModeConfig({ foamAndTexture: { focusDistance: v } });
                                          markSectionTouched('product-setup');
                                        }}
                                      >
                                        {v}
                                      </Chip>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <p className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold mb-1">Cleanliness</p>
                                  <div className="flex flex-wrap gap-2">
                                    {(['Pristine', 'Natural imperfections'] as const).map(v => (
                                      <Chip
                                        key={v}
                                        selected={productStore.photoModeConfig.foamAndTexture.cleanliness === v}
                                        onClick={() => {
                                          productStore.setPhotoModeConfig({ foamAndTexture: { cleanliness: v } });
                                          markSectionTouched('product-setup');
                                        }}
                                      >
                                        {v}
                                      </Chip>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}

                            {productStore.photoMode === 'Routine Carousel' && (
                              <div className="space-y-3">
                                <div>
                                  <p className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold mb-1">Frame Count</p>
                                  <div className="flex flex-wrap gap-2">
                                    {([3, 4, 5] as const).map(v => (
                                      <Chip
                                        key={v}
                                        selected={productStore.photoModeConfig.routineCarousel.frameCount === v}
                                        onClick={() => {
                                          productStore.setPhotoModeConfig({ routineCarousel: { frameCount: v } });
                                          markSectionTouched('product-setup');
                                        }}
                                      >
                                        {v}
                                      </Chip>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <p className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold mb-1">Routine Flow</p>
                                  <div className="flex flex-wrap gap-2">
                                    {(['Left → Right', 'Circular'] as const).map(v => (
                                      <Chip
                                        key={v}
                                        selected={productStore.photoModeConfig.routineCarousel.routineFlow === v}
                                        onClick={() => {
                                          productStore.setPhotoModeConfig({ routineCarousel: { routineFlow: v } });
                                          markSectionTouched('product-setup');
                                        }}
                                      >
                                        {v}
                                      </Chip>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <p className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold mb-1">Consistency</p>
                                  <div className="flex flex-wrap gap-2">
                                    {(['Same background', 'Subtle variation'] as const).map(v => (
                                      <Chip
                                        key={v}
                                        selected={productStore.photoModeConfig.routineCarousel.consistency === v}
                                        onClick={() => {
                                          productStore.setPhotoModeConfig({ routineCarousel: { consistency: v } });
                                          markSectionTouched('product-setup');
                                        }}
                                      >
                                        {v}
                                      </Chip>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <p className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold mb-1">Hero Frame</p>
                                  <div className="flex flex-wrap gap-2">
                                    {(['First', 'Middle', 'Last'] as const).map(v => (
                                      <Chip
                                        key={v}
                                        selected={productStore.photoModeConfig.routineCarousel.heroFrame === v}
                                        onClick={() => {
                                          productStore.setPhotoModeConfig({ routineCarousel: { heroFrame: v } });
                                          markSectionTouched('product-setup');
                                        }}
                                      >
                                        {v}
                                      </Chip>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}

                            {productStore.photoMode === 'Clinical Lab Counter' && (
                              <div className="space-y-3">
                                <div>
                                  <p className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold mb-1">Clinical Tone</p>
                                  <div className="flex flex-wrap gap-2">
                                    {(['Soft clinical', 'Crisp lab'] as const).map(v => (
                                      <Chip
                                        key={v}
                                        selected={productStore.photoModeConfig.clinicalLabCounter.clinicalTone === v}
                                        onClick={() => {
                                          productStore.setPhotoModeConfig({ clinicalLabCounter: { clinicalTone: v } });
                                          markSectionTouched('product-setup');
                                        }}
                                      >
                                        {v}
                                      </Chip>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <p className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold mb-1">Lab Elements</p>
                                  <div className="flex flex-wrap gap-2">
                                    {(['Minimal', 'Standard'] as const).map(v => (
                                      <Chip
                                        key={v}
                                        selected={productStore.photoModeConfig.clinicalLabCounter.labElements === v}
                                        onClick={() => {
                                          productStore.setPhotoModeConfig({ clinicalLabCounter: { labElements: v } });
                                          markSectionTouched('product-setup');
                                        }}
                                      >
                                        {v}
                                      </Chip>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <p className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold mb-1">Surface Type</p>
                                  <div className="flex flex-wrap gap-2">
                                    {(['White lab', 'Neutral lab'] as const).map(v => (
                                      <Chip
                                        key={v}
                                        selected={productStore.photoModeConfig.clinicalLabCounter.surfaceType === v}
                                        onClick={() => {
                                          productStore.setPhotoModeConfig({ clinicalLabCounter: { surfaceType: v } });
                                          markSectionTouched('product-setup');
                                        }}
                                      >
                                        {v}
                                      </Chip>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <p className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold mb-1">Trust Level</p>
                                  <div className="flex flex-wrap gap-2">
                                    {(['Friendly', 'Professional', 'High authority'] as const).map(v => (
                                      <Chip
                                        key={v}
                                        selected={productStore.photoModeConfig.clinicalLabCounter.trustLevel === v}
                                        onClick={() => {
                                          productStore.setPhotoModeConfig({ clinicalLabCounter: { trustLevel: v } });
                                          markSectionTouched('product-setup');
                                        }}
                                      >
                                        {v}
                                      </Chip>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}

                            {productStore.photoMode === 'Golden Mist Aura' && (
                              <div className="space-y-3">
                                <div>
                                  <p className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold mb-1">Glow Strength</p>
                                  <div className="flex flex-wrap gap-2">
                                    {(['Subtle', 'Warm', 'Radiant'] as const).map(v => (
                                      <Chip
                                        key={v}
                                        selected={productStore.photoModeConfig.goldenMistAura.glowStrength === v}
                                        onClick={() => {
                                          productStore.setPhotoModeConfig({ goldenMistAura: { glowStrength: v } });
                                          markSectionTouched('product-setup');
                                        }}
                                      >
                                        {v}
                                      </Chip>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <p className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold mb-1">Mist Style</p>
                                  <div className="flex flex-wrap gap-2">
                                    {(['Backlit', 'Surround'] as const).map(v => (
                                      <Chip
                                        key={v}
                                        selected={productStore.photoModeConfig.goldenMistAura.mistStyle === v}
                                        onClick={() => {
                                          productStore.setPhotoModeConfig({ goldenMistAura: { mistStyle: v } });
                                          markSectionTouched('product-setup');
                                        }}
                                      >
                                        {v}
                                      </Chip>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <p className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold mb-1">Mood</p>
                                  <div className="flex flex-wrap gap-2">
                                    {(['Calm', 'Luxurious'] as const).map(v => (
                                      <Chip
                                        key={v}
                                        selected={productStore.photoModeConfig.goldenMistAura.mood === v}
                                        onClick={() => {
                                          productStore.setPhotoModeConfig({ goldenMistAura: { mood: v } });
                                          markSectionTouched('product-setup');
                                        }}
                                      >
                                        {v}
                                      </Chip>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <p className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold mb-1">Contrast</p>
                                  <div className="flex flex-wrap gap-2">
                                    {(['Soft', 'Cinematic'] as const).map(v => (
                                      <Chip
                                        key={v}
                                        selected={productStore.photoModeConfig.goldenMistAura.contrast === v}
                                        onClick={() => {
                                          productStore.setPhotoModeConfig({ goldenMistAura: { contrast: v } });
                                          markSectionTouched('product-setup');
                                        }}
                                      >
                                        {v}
                                      </Chip>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}

                            {productStore.photoMode === 'Candy Gradient Lab' && (
                              <div className="space-y-3">
                                <div>
                                  <p className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold mb-1">Gradient Style</p>
                                  <div className="flex flex-wrap gap-2">
                                    {(['Candy pastel', 'Bold candy'] as const).map(v => (
                                      <Chip
                                        key={v}
                                        selected={productStore.photoModeConfig.candyGradientLab.gradientStyle === v}
                                        onClick={() => {
                                          productStore.setPhotoModeConfig({ candyGradientLab: { gradientStyle: v } });
                                          markSectionTouched('product-setup');
                                        }}
                                      >
                                        {v}
                                      </Chip>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <p className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold mb-1">Color Count</p>
                                  <div className="flex flex-wrap gap-2">
                                    {(['Duo', 'Trio'] as const).map(v => (
                                      <Chip
                                        key={v}
                                        selected={productStore.photoModeConfig.candyGradientLab.colorCount === v}
                                        onClick={() => {
                                          productStore.setPhotoModeConfig({ candyGradientLab: { colorCount: v } });
                                          markSectionTouched('product-setup');
                                        }}
                                      >
                                        {v}
                                      </Chip>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <p className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold mb-1">Edge Style</p>
                                  <div className="flex flex-wrap gap-2">
                                    {(['Soft blend', 'Sharp transition'] as const).map(v => (
                                      <Chip
                                        key={v}
                                        selected={productStore.photoModeConfig.candyGradientLab.edgeStyle === v}
                                        onClick={() => {
                                          productStore.setPhotoModeConfig({ candyGradientLab: { edgeStyle: v } });
                                          markSectionTouched('product-setup');
                                        }}
                                      >
                                        {v}
                                      </Chip>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <p className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold mb-1">Playfulness</p>
                                  <div className="flex flex-wrap gap-2">
                                    {(['Controlled', 'Fun', 'Loud'] as const).map(v => (
                                      <Chip
                                        key={v}
                                        selected={productStore.photoModeConfig.candyGradientLab.playfulness === v}
                                        onClick={() => {
                                          productStore.setPhotoModeConfig({ candyGradientLab: { playfulness: v } });
                                          markSectionTouched('product-setup');
                                        }}
                                      >
                                        {v}
                                      </Chip>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </>
                )}

              {!isCoffeeIndustry && (
                <>
              {/* ═══════════════════════════════════════════════════════════
                      2. PRODUCT CONTEXT — What is the product?
                      Always visible in both Basic and Pro
                      ═══════════════════════════════════════════════════════════ */}
              <div className={SECTION_GROUP_CLASS}>
                <p className={GROUP_LABEL_CLASS}>PRODUCT IDENTITY</p>
              </div>

              <div className={SECTION_GROUP_CLASS}>
                <p className={GROUP_LABEL_CLASS}>PRODUCT TYPE</p>
                <div className="flex flex-wrap gap-2">
                  {PRODUCT_TYPE_OPTIONS.filter(option =>
                    !activeIndustryRules?.allowedProductTypes || activeIndustryRules.allowedProductTypes.includes(option)
                  ).map(option => (
                    <Chip
                      key={option}
                      onClick={() => {
                        updateValue('productType', option as any);
                        const mapped = ({
                          Capsules: 'capsules',
                          Gummies: 'gummies',
                          Drops: 'drops',
                          Powder: 'powder',
                          Skincare: 'skincare',
                          Device: 'device',
                          Custom: 'custom',
                        } as const)[option];
                        if (mapped) productStore.setProductType(mapped);
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
                        productStore.setPackagingMode(option === 'With box' ? 'with-box' : 'without-box');
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
                {getInterpretationNote('shadow') && (
                  <InterpretationNote message={getInterpretationNote('shadow')!} />
                )}
              </div>

              <div className={SECTION_GROUP_CLASS}>
                <p className={GROUP_LABEL_CLASS}>PHYSICAL SCALE</p>
                <div className="flex flex-wrap gap-2">
                  {(['Small handheld', 'Medium tabletop', 'Large object'] as const).map(option => (
                    <Chip
                      key={option}
                      onClick={() => {
                        updateValue('productScale', option);
                        const mapped =
                          option === 'Small handheld'
                            ? 'small-handheld'
                            : option === 'Medium tabletop'
                              ? 'medium-tabletop'
                              : 'large-object';
                        productStore.setPhysicalScaleLabel(mapped);
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
                </>
              )}

              {/* ADVANCED CONTROLS — global control layer, decoupled from environment/photo type */}
              <div className={SECTION_GROUP_CLASS}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className={GROUP_LABEL_CLASS}>ADVANCED CONTROLS</p>
                    <p className="text-[11px] text-gray-500 mt-1">
                      Enables manual pro overrides (lens, rig, finish, camera micro-controls).
                    </p>
                  </div>
                  <SwitchToggle
                    checked={productStore.controlTier === 'pro'}
                    onCheckedChange={(next) => {
                      productStore.setControlTier(next ? 'pro' : 'basic');
                      productStore.setAdvancedModeEnabled(next);
                      markSectionTouched('product-setup');
                    }}
                    aria-label="Advanced controls"
                  />
                </div>
              </div>

              {/* Phase 1: Hide generic composition/lighting/props controls when Photo Mode is active. */}
              {productStore.environmentContext != null && (
                <>
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
                    {productStore.controlTier === 'pro' && (
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

                  {productStore.photoMode !== 'Hero Landing Page' ? (
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
                  ) : null}

                </>
              )}
              {/* ADVANCED CONTROLS DETAILS — global (not tied to Environment) */}
              {productStore.controlTier === 'pro' && (
                <>
                  <div className={SECTION_GROUP_CLASS}>
                    <div
                      className="overflow-hidden transition-all duration-500 max-h-[1000px] opacity-100"
                      style={{ transitionTimingFunction: 'cubic-bezier(0.23,1,0.32,1)' }}
                    >
                      <div className="space-y-5 pl-3 border-l-2 border-indigo-300">
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] font-extrabold text-gray-500 mb-2">LENS</p>
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
                                className={`px-3 py-1.5 rounded-lg text-xs border transition-all duration-300 ${productStore.lens === lens
                                  ? 'bg-indigo-600 text-white border-indigo-600'
                                  : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                                  }`}
                                style={{ transitionTimingFunction: 'cubic-bezier(0.23,1,0.32,1)' }}
                              >
                                {lens}
                              </button>
                            ))}
                          </div>
                          {getInterpretationNote('lens') && (
                            <InterpretationNote message={getInterpretationNote('lens')!} />
                          )}
                        </div>

                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] font-extrabold text-gray-500 mb-2">LIGHTING RIG</p>
                          <div className="flex flex-wrap gap-2">
                            {([
                              { value: '3-Point Beauty Dish', label: '3-Point Beauty Dish' },
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
                                className={`px-3 py-1.5 rounded-lg text-xs border transition-all duration-300 ${productStore.lightingRig === value
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
                          <p className="text-xs uppercase tracking-[0.2em] font-extrabold text-gray-500 mb-2">ACCENT / GEL LIGHT COLOR</p>
                          <div className="space-y-5">
                            <div>
                              <p className="text-xs text-gray-500 mb-2">Popular gel colors for edge/rim lighting:</p>
                              <div className="flex flex-wrap gap-2">
                                {[
                                  { label: 'Blue Gel', value: '#0066FF' },
                                  { label: 'Cyan Gel', value: '#00FFFF' },
                                  { label: 'Purple Gel', value: '#9966FF' },
                                  { label: 'Magenta Gel', value: '#FF00FF' },
                                  { label: 'Red Gel', value: '#FF0033' },
                                  { label: 'Orange Gel', value: '#FF6600' },
                                  { label: 'Green Gel', value: '#00FF66' },
                                  { label: 'Amber Gel', value: '#FFAA00' },
                                ].map(({ label, value }) => (
                                  <button
                                    key={value}
                                    onClick={() => {
                                      productStore.setCustomLightColor(value);
                                      productStore.setLightColorTemp('Neutral (5000K)');
                                      markSectionTouched('product-setup');
                                    }}
                                    className={`px-3 py-1.5 rounded-lg text-xs border transition-all duration-300 ${
                                      productStore.customLightColor === value
                                        ? 'bg-indigo-600 text-white border-indigo-600'
                                        : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                                    }`}
                                    style={{ transitionTimingFunction: 'cubic-bezier(0.23,1,0.32,1)' }}
                                  >
                                    <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: value }}></span>
                                    {label}
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div>
                              <p className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold mb-2">Custom Gel Color</p>
                              <div className="flex items-center gap-3">
                                <button
                                  type="button"
                                  onClick={() => {
                                    productStore.setCustomLightColor('');
                                    markSectionTouched('product-setup');
                                  }}
                                  className={`${COLOR_PICKER_BUTTON_CLASS} ${
                                    !productStore.customLightColor
                                      ? 'border-indigo-600'
                                      : 'border-gray-200 hover:border-gray-300'
                                  }`}
                                  style={{ background: '#FFFFFF' }}
                                  aria-label="No accent color"
                                />
                                <label
                                  className={`relative inline-block ${COLOR_PICKER_BUTTON_CLASS} cursor-pointer ${
                                    productStore.customLightColor
                                      ? 'border-indigo-600'
                                      : 'border-gray-200 hover:border-gray-300'
                                  }`}
                                  style={{ background: productStore.customLightColor || '#FFFFFF' }}
                                  aria-label="Pick a custom gel color"
                                >
                                  <input
                                    type="color"
                                    value={productStore.customLightColor || '#FFFFFF'}
                                    onChange={(e) => {
                                      productStore.setCustomLightColor(e.target.value.toUpperCase());
                                      markSectionTouched('product-setup');
                                    }}
                                    className={COLOR_PICKER_HIDDEN_INPUT_CLASS}
                                    aria-label="Custom gel color picker"
                                  />
                                </label>
                                <input
                                  type="text"
                                  placeholder="#0066FF"
                                  value={productStore.customLightColor || ''}
                                  onChange={(e) => {
                                    const val = e.target.value.toUpperCase();
                                    if (val === '' || /^#[0-9A-F]{0,6}$/.test(val)) {
                                      productStore.setCustomLightColor(val);
                                      markSectionTouched('product-setup');
                                    }
                                  }}
                                  className="px-3 py-2 rounded-lg border border-gray-200 text-[11px] font-mono text-gray-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-24"
                                />
                              </div>
                            </div>
                            {productStore.customLightColor && productStore.customLightColor !== '#FFFFFF' && (
                              <div>
                                <p className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold mb-2">Gel Light Intensity</p>
                                <div className="flex items-center gap-3">
                                  <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={productStore.accentLightIntensity}
                                    onChange={(e) => {
                                      productStore.setAccentLightIntensity(Number(e.target.value));
                                      markSectionTouched('product-setup');
                                    }}
                                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                  />
                                  <span className="text-[11px] font-mono text-gray-700 w-10 text-right">
                                    {productStore.accentLightIntensity}%
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] font-extrabold text-gray-500 mb-2">FINISH / TREATMENT</p>
                          <div className="flex flex-wrap gap-2">
                            {[
                              'High-Gloss Commercial', 'Film Grain Luxury',
                              'Hyperreal CGI Blend', 'Clinical Lab Polish', 'Vibrant Color Pop'
                            ].map(finish => (
                              <button
                                key={finish}
                                onClick={() => {
                                  productStore.setFinish(finish);
                                  markSectionTouched('product-setup');
                                }}
                                className={`px-3 py-1.5 rounded-lg text-xs border transition-all duration-300 ${productStore.finish === finish
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
            </div>
          </AccordionSection>
        </>
      )}

      {/* PHYSICAL PROPERTIES - Contextual per Product Type */}
      {
        isEcommerceMode && values.productType && (
          <AccordionSection
            icon={Layers}
            title="02 / Physical Properties"
            description="Configure the real, physical appearance of the product itself."
            isOpen={openAccordionId === 'physical-props'}
            onToggle={() => toggleSection('physical-props')}
            isTouched={touchedSections.has('physical-props')}
            variant="primary"
          >
            <div className="space-y-5">
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
                          className={`block ${COLOR_PICKER_SWATCH_VISUAL_CLASS} cursor-pointer`}
                          style={{ background: (productStore.definition.physical as any)?.v?.capsuleContentColor?.hex || '#FFFFFF' }}
                        />
                        <input
                          type="color"
                          className={COLOR_PICKER_HIDDEN_INPUT_CLASS}
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
                          className={`block ${COLOR_PICKER_SWATCH_VISUAL_CLASS} cursor-pointer`}
                          style={{ background: (productStore.definition.physical as any)?.v?.gummyColor?.hex || '#FF6B6B' }}
                        />
                        <input
                          type="color"
                          className={COLOR_PICKER_HIDDEN_INPUT_CLASS}
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
                            className={`block ${COLOR_PICKER_SWATCH_VISUAL_CLASS} cursor-pointer`}
                            style={{ background: (productStore.definition.physical as any)?.v?.liquidCustomColor?.hex || '#FFD700' }}
                          />
                          <input
                            type="color"
                            className={COLOR_PICKER_HIDDEN_INPUT_CLASS}
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
                          className={`block ${COLOR_PICKER_SWATCH_VISUAL_CLASS} cursor-pointer`}
                          style={{ background: (productStore.definition.physical as any)?.v?.powderColor?.hex || '#F5F5DC' }}
                        />
                        <input
                          type="color"
                          className={COLOR_PICKER_HIDDEN_INPUT_CLASS}
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
                          className={`block ${COLOR_PICKER_SWATCH_VISUAL_CLASS} cursor-pointer`}
                          style={{ background: (productStore.definition.physical as any)?.v?.color?.hex || '#FFFFFF' }}
                        />
                        <input
                          type="color"
                          className={COLOR_PICKER_HIDDEN_INPUT_CLASS}
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
                          className={`block ${COLOR_PICKER_SWATCH_VISUAL_CLASS} cursor-pointer`}
                          style={{ background: (productStore.definition.physical as any)?.v?.color?.hex || '#333333' }}
                        />
                        <input
                          type="color"
                          className={COLOR_PICKER_HIDDEN_INPUT_CLASS}
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
          </AccordionSection>
        )
      }

      {isEcommerceMode && (
      <AccordionSection
        icon={Activity}
        title="03 / Product State & Motion"
        description="Describe what the product is doing. Product-only—no human implied."
        isOpen={openAccordionId === 'product-state-motion'}
        onToggle={() => toggleSection('product-state-motion')}
        isTouched={touchedSections.has('product-state-motion')}
        variant="primary"
      >
        <div className="space-y-5">
          {(() => {
            const coffeeIntent = resolveCoffeeIndustryIntent(
              String(productStore.photoMode || ''),
              String(productStore.visualIntent || '')
            );
            const allOptions = [
              { value: 'static', label: 'Static', detail: 'Closed and stationary.' },
              { value: 'opened', label: 'Opened', detail: 'Open container. No motion.' },
              { value: 'spilled', label: 'Spilled', detail: 'Contents spilled on surface.' },
              { value: 'dispensed', label: 'Dispensed', detail: 'Controlled amount released.' },
              { value: 'pouring', label: 'Pouring', detail: 'Stream falling downward.' },
              { value: 'falling', label: 'Falling', detail: 'Discrete items falling mid-air.' },
            ] as const;

            const supplementsAllowedByType = (() => {
              const type = productStore.definition.type;
              const allowed = new Set<ProductStateMotion>(['static', 'opened', 'dispensed']);
              if (type === 'capsules') allowed.add('falling');
              if (type === 'powder') allowed.add('spilled');
              if (type === 'drops') allowed.add('pouring');
              return Array.from(allowed);
            })();

            const allowedProductStates =
              getResolvedAllowedMotions(
                productStore.photoMode,
                industryProfile,
                productStore.definition.type,
                industryProfile === 'coffee' ? coffeeIntent : undefined
              );

            const visibleStateOptions = allOptions.filter((option) =>
              allowedProductStates.includes(option.value as ProductStateMotion)
            );

            return (
              <>
          <p className="text-sm text-gray-500">
            Product State & Motion describe what the product is doing. Product Interaction describes what hands are doing.
          </p>

          <div className={SECTION_GROUP_CLASS}>
            <p className={GROUP_LABEL_CLASS}>PRODUCT STATE & MOTION</p>
            <div className="flex flex-wrap gap-2">
              {visibleStateOptions.map(option => {
                return (
                  <Chip
                    key={option.value}
                    onClick={() => {
                      productStore.setStateMotion(option.value as ProductStateMotion);
                      markSectionTouched('product-state-motion');
                    }}
                    selected={productStore.stateMotion === (option.value as ProductStateMotion)}
                    description={option.detail}
                  >
                    {option.label}
                  </Chip>
                );
              })}
            </div>
            <SelectedOptionFooter
              options={visibleStateOptions.map((option) => ({
                value: option.value,
                label: option.label,
                description: option.detail,
              }))}
              selectedValue={productStore.stateMotion}
            />
            {getInterpretationNote('stateMotion') && (
              <InterpretationNote message={getInterpretationNote('stateMotion')!} />
            )}
            <p className="text-[11px] text-gray-500 mt-2">
              Physics rules: gravity downward only, no floating, irregular distribution, natural motion freeze.
            </p>
          </div>
              </>
            );
          })()}
        </div>
      </AccordionSection>
      )}

      {isEcommerceMode && (
      <AccordionSection
        icon={Layers}
        title="04 / Product Composition"
        description="Define how products are grouped, bundled, and positioned."
        isOpen={openAccordionId === 'productStructure'}
        onToggle={() => toggleSection('productStructure')}
        isTouched={touchedSections.has('productStructure')}
        variant="primary"
      >
        <div className="space-y-5">
          <p className="text-sm text-gray-500">
            Define how products are grouped, bundled, and positioned.
          </p>
          {/* BUNDLE PRESETS (Mode: Single/Duo/Trio/Kit) */}
          <div className={SECTION_GROUP_CLASS}>
            <div className="flex items-center justify-between">
              <p className={GROUP_LABEL_CLASS}>BUNDLE MODE</p>
              <SwitchToggle
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
                if (bundle.id === 'launch_showcase') label = 'Launch Showcase Set';
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
            <div className="space-y-5 pt-4 border-t border-gray-100">
              {/* STYLE / MODE */}
              <div className={SECTION_GROUP_CLASS}>
                <p className={GROUP_LABEL_CLASS}>BUNDLE ARRANGEMENT</p>
                <div className="flex flex-wrap gap-2">
                  {(['hero', 'lineup', 'editorial-cluster'] as const).map(mode => {
                    // Only Hero is available in basic tier without Pro Mode
                    const isProModeActive = productStore.controlTier === 'pro' || productStore.advancedModeEnabled || productStore.proMode;
                    const isDisabled = mode !== 'hero' && productStore.presetTier === 'basic' && !isProModeActive;
                    
                    return (
                      <Chip
                        key={mode}
                        onClick={() => {
                          if (isDisabled) return;
                          productStore.setBundleMode(mode);
                          markSectionTouched('productStructure');
                        }}
                        selected={productStore.bundle.mode === mode}
                        disabled={isDisabled}
                        className={isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                      >
                        {mode === 'hero' ? 'Hero' : mode === 'lineup' ? 'Lineup' : 'Editorial Cluster'}
                      </Chip>
                    );
                  })}
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
      </AccordionSection>
      )}


      {/* Brand Look System intentionally hidden. */}

      {/* CREATIVE DIRECTION (Phase 1) */}
      {/* Photo Mode fully replaces Creative Direction whenever Photo Mode is active. */}
      {
        false && (
          <AccordionSection
            icon={Sparkles}
            title="Creative Direction"
            description="Primary visual decisions. Safe to experiment."
            isOpen={openAccordionId === 'product-creativity'}
            onToggle={() => toggleSection('product-creativity')}
            isTouched={touchedSections.has('product-creativity')}
            iconClassName="text-indigo-600 dark:text-indigo-300"
            variant="secondary"
          >
            <div className="space-y-5">
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
                      <SwitchToggle
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
                      <div className="flex flex-wrap gap-4">
                        <div className={SECTION_GROUP_CLASS}>
                          <p className={GROUP_LABEL_CLASS}>SCALE</p>
                          <div className="flex flex-col gap-2">
                            {PRODUCT_SCALE_OPTIONS.map(opt => (
                              <Chip
                                key={opt.value}
                                onClick={() => {
                                  productStore.setScale(opt.value);
                                  markSectionTouched('product-creativity');
                                }}
                                selected={productStore.scale === opt.value}
                                size="md"
                                className="w-full justify-center py-3 rounded-full text-[12px] font-semibold"
                              >
                                {opt.label}
                              </Chip>
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
                              <Chip
                                key={opt.value}
                                onClick={() => {
                                  productStore.setSpacing(opt.value);
                                  markSectionTouched('product-creativity');
                                }}
                                selected={productStore.spacing === opt.value}
                                size="md"
                                className="rounded-full py-3 text-[12px] font-semibold"
                              >
                                {opt.label}
                              </Chip>
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
                                size="xs"
                                className="w-full justify-center rounded-full"
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
          </AccordionSection>
        )
      }

      {/* PRODUCT STUDIO — ENVIRONMENT (single source of truth: productStore.environmentContext) */}
      {
        isEcommerceMode && (
          <AccordionSection
            icon={MapPin}
            title="05 / Environment Settings"
            description="Place the product into a real setting. Product-only, no people."
            id="product-environment"
            isOpen={openAccordionId === 'product-environment'}
            onToggle={() => toggleSection('product-environment')}
            isTouched={touchedSections.has('product-environment')}
            variant="primary"
          >
            <div className="space-y-7">
              <p className="text-base leading-relaxed text-gray-500 max-w-2xl">
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
                  <div className="space-y-7">
                    {isDisabled && (
                      <div className="rounded-xl border border-gray-200 bg-white p-3 text-sm text-gray-500 dark:border-white/10 dark:bg-white/5 dark:text-white/60">
                        Environment is disabled while Background Canvas is On (neutral background mode).
                      </div>
                    )}

                    <div className={isDisabled ? 'opacity-50' : ''}>
                      <div className="p-5 space-y-6">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className={GROUP_LABEL_CLASS}>MACRO ENVIRONMENT</p>
                            <p className="text-[11px] text-gray-500 mt-1">Pick a setting. Keep it simple unless you need specific staging.</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-3">
                              <span className="text-[11px] font-semibold text-gray-500 dark:text-white/50">More</span>
                              <SwitchToggle
                                checked={productEnvironmentShowAllMacros}
                                onCheckedChange={(next) => setProductEnvironmentShowAllMacros(next)}
                                aria-label="Show more environments"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                productStore.setEnvironmentContext(null);
                                markSectionTouched('product-environment');
                              }}
                              className="text-[11px] font-semibold text-gray-500 hover:text-gray-900 dark:text-white/50 dark:hover:text-white"
                            >
                              Clear
                            </button>
                          </div>
                        </div>

                        <div className="space-y-5">
                          {PRODUCT_ENVIRONMENT_MACRO_GROUPS.filter(group => {
                            if (group.label === 'Home') return true;
                            return productEnvironmentShowAllMacros;
                          }).map(group => (
                            <div key={group.label} className="space-y-3">
                              <p className="text-xs uppercase tracking-[0.14em] font-semibold text-gray-400 dark:text-white/40">
                                {group.label}
                              </p>
                              <div className="flex flex-wrap gap-3">
                                {group.items.map(env => (
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
                                      : env === 'cgmp-facility'
                                        ? 'cGMP Manufacturing Facility'
                                        : env.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
                                    }
                                  </Chip>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>

                        {selectedMacro === 'custom' && (
                          <label className="block space-y-2">
                            <p className={GROUP_LABEL_CLASS}>CUSTOM ENVIRONMENT</p>
                            <input
                              value={productStore.customEnvironmentText || ''}
                              onChange={(e) => {
                                productStore.setCustomEnvironmentText(e.target.value);
                                markSectionTouched('product-environment');
                              }}
                              placeholder="e.g. modern kitchen countertop"
                              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-indigo-600 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/40"
                            />
                          </label>
                        )}
                      </div>

                      <div className="p-5 space-y-6">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className={GROUP_LABEL_CLASS}>MICRO PLACE</p>
                            <p className="text-[11px] text-gray-500 mt-1">Optional refinement for where the product sits.</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-semibold text-gray-500 dark:text-white/50">Advanced</span>
                            <SwitchToggle
                              checked={productEnvironmentAdvancedOpen}
                              onCheckedChange={(next) => setProductEnvironmentAdvancedOpen(next)}
                              aria-label="Advanced environment controls"
                            />
                          </div>
                        </div>

                        {selectedMacro ? (
                          <div className="flex flex-wrap gap-3">
                            <Chip
                              onClick={() => {
                                const macro = (selectedMacro ?? 'kitchen') as EnvironmentMacro;
                                productStore.setEnvironmentContext({ macro, micro: null });
                                markSectionTouched('product-environment');
                              }}
                              selected={!selectedMicro}
                            >
                              Auto
                            </Chip>
                            {(PRODUCT_ENVIRONMENT_MICRO_BY_MACRO[selectedMacro] ?? ['neutral-surface']).map(place => (
                              <Chip
                                key={place}
                                onClick={() => {
                                  const macro = (selectedMacro ?? 'kitchen') as EnvironmentMacro;
                                  productStore.setEnvironmentContext({ macro, micro: place });
                                  markSectionTouched('product-environment');
                                }}
                                selected={selectedMicro === place}
                              >
                                {place === 'conveyor-belt'
                                  ? 'Conveyor belt'
                                  : place === 'filling-line'
                                    ? 'Filling line'
                                    : place.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
                                }
                              </Chip>
                            ))}
                            {productEnvironmentAdvancedOpen && (
                              <Chip
                                onClick={() => {
                                  const macro = (selectedMacro ?? 'kitchen') as EnvironmentMacro;
                                  productStore.setEnvironmentContext({ macro, micro: 'custom' });
                                  markSectionTouched('product-environment');
                                }}
                                selected={selectedMicro === 'custom'}
                              >
                                Custom
                              </Chip>
                            )}
                          </div>
                        ) : (
                          <p className="text-[11px] text-gray-500 mt-2">Select a macro environment to refine micro placement.</p>
                        )}

                        {productEnvironmentAdvancedOpen && selectedMicro === 'custom' && (
                          <label className="block space-y-2">
                            <p className={GROUP_LABEL_CLASS}>CUSTOM MICRO PLACE</p>
                            <input
                              value={productStore.customMicroPlaceText || ''}
                              onChange={(e) => {
                                productStore.setCustomMicroPlaceText(e.target.value);
                                markSectionTouched('product-environment');
                              }}
                              placeholder="e.g. stainless steel filling station"
                              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-indigo-600 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/40"
                            />
                          </label>
                        )}
                      </div>

                      <div className="p-5 space-y-6">
                        <div>
                          <p className={GROUP_LABEL_CLASS}>LIGHTING</p>
                          <p className="text-[11px] text-gray-500 mt-1">Product-safe lighting style</p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                          {(productEnvironmentAdvancedOpen
                            ? PRODUCT_ENVIRONMENT_LIGHTING_OPTIONS
                            : PRODUCT_ENVIRONMENT_LIGHTING_OPTIONS.filter(opt =>
                              opt.value === 'natural-light' ||
                              opt.value === 'overcast' ||
                              opt.value === 'cozy-indoors' ||
                              opt.value === 'ring-light'
                            )
                          ).map(option => (
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
          </AccordionSection>
        )
      }

      {isEcommerceMode && industryProfile !== 'wine' && (
      <AccordionSection
        icon={Hand}
        title="06 / Product Interaction"
        description={`Product interaction.\nOne interaction per scene.`}
        isOpen={openAccordionId === 'product-interaction'}
        onToggle={() => toggleSection('product-interaction')}
        isTouched={touchedSections.has('product-interaction')}
        variant="primary"
      >
        <div className="space-y-5">
          {(() => {
            const coffeeIntent = resolveCoffeeIndustryIntent(
              String(productStore.photoMode || ''),
              String(productStore.visualIntent || '')
            );
            const industryAllowedInteractions =
              industryProfile === 'coffee'
                ? activeIndustryRules?.interactionWhitelistByIntent?.[coffeeIntent] ?? ['none']
                : activeIndustryRules?.interactionWhitelist ?? ['none'];
            const resolvedAllowedInteractions = getResolvedAllowedInteractions(
              productStore.photoMode,
              industryAllowedInteractions as ProductStudioState['interaction'][]
            );
            const interactionOptionMap: Record<
              string,
              {
                label: string;
                detail: string;
                stateValue: ProductStudioState['interaction'];
              }
            > = {
              none: {
                label: 'None',
                detail: 'No hands. No skin. No human shadows.',
                stateValue: 'none',
              },
              'capsule-display': {
                label: 'Capsule Display',
                detail: '2–4 capsules in palm + bottle visible. No pouring.',
                stateValue: 'capsule-display',
              },
              'applying-opening': {
                label: 'Applying / Opening',
                detail: 'One clear action: twist/open. No consumption.',
                stateValue: 'applying-opening',
              },
              holding: {
                label: 'Holding',
                detail: 'One hand holds the product naturally. No gesture.',
                stateValue: 'holding',
              },
              'two-hand-hold': {
                label: 'Two-hand Hold',
                detail: 'Stable two-hand support with controlled framing.',
                stateValue: 'two-hand-hold',
              },
              presenting: {
                label: 'Presenting',
                detail: 'Hands present product clearly toward camera.',
                stateValue: 'presenting',
              },
              'framed-presentation': {
                label: 'Framed Presentation',
                detail: 'Environmental framing with premium product readability.',
                stateValue: 'framed-presentation',
              },
              cheers: {
                label: 'Cheers',
                detail: 'Two-glass cheers moment with clean composition.',
                stateValue: 'two-hand-hold',
              },
            };
            const visibleInteractionOptions = resolvedAllowedInteractions
              .map((interactionId) => {
                const option = interactionOptionMap[interactionId];
                if (!option) return null;
                return {
                  value: interactionId,
                  ...option,
                };
              })
              .filter(Boolean) as Array<{
                value: string;
                label: string;
                detail: string;
                stateValue: ProductStudioState['interaction'];
              }>;
            const selectedInteractionValue =
              visibleInteractionOptions.find((option) => option.stateValue === productStore.interaction)?.value || 'none';

            return (
              <>
          <div className={SECTION_GROUP_CLASS}>
            <p className={GROUP_LABEL_CLASS}>PRODUCT INTERACTION</p>
            <div className="flex flex-wrap gap-2">
              {visibleInteractionOptions.map(option => {
                return (
                  <Chip
                    key={option.value}
                    onClick={() => {
                      // Auto-switch to 'held' if selecting a holding interaction
                      if (option.stateValue !== 'none') {
                        productStore.setPlacement('held');
                      }

                      productStore.setInteraction(option.stateValue);
                      productStore.setHandsHolding(option.stateValue !== 'none');
                      updateValue('productStudioInteraction', option.stateValue as any);
                      updateValue('handsHolding', option.stateValue !== 'none');
                      markSectionTouched('product-interaction');
                    }}
                    selected={selectedInteractionValue === option.value}
                    description={option.detail}
                  >
                    {option.label}
                  </Chip>
                );
              })}
            </div>
            <SelectedOptionFooter
              options={visibleInteractionOptions.map((option) => ({
                value: option.value,
                label: option.label,
                description: option.detail,
              }))}
              selectedValue={selectedInteractionValue}
            />
            {getInterpretationNote('interaction') && (
              <InterpretationNote message={getInterpretationNote('interaction')!} />
            )}
          </div>
              </>
            );
          })()}
        </div>
      </AccordionSection>
      )}

      {/* ============================================================================
           07 / VIEWPOINT & VANTAGE (v1.0 SPEC PLACEHOLDER)
           Auto-configured based on Product Placement and Interaction.
           ============================================================================ */}
      {isEcommerceMode && (
      <AccordionSection
        icon={Eye}
        title="07 / Viewpoint & Vantage"
        description="Define the physical point of view relative to the product. This is NOT camera or lens."
        isOpen={openAccordionId === 'viewpoint-vantage'}
        onToggle={() => toggleSection('viewpoint-vantage')}
        isTouched={touchedSections.has('viewpoint-vantage')}
        variant="secondary"
      >
        <div className="space-y-5">
          <p className="text-sm text-gray-500">
            Determines whether the scene is viewed from eye-level, top-down, aerial, or product-level perspective.
          </p>
          <p className="text-xs text-amber-600 dark:text-amber-400">
            Auto-configured based on Product Placement and Interaction. Manual overrides coming in v1.1.
          </p>
          <div className={SECTION_GROUP_CLASS}>
            <p className={GROUP_LABEL_CLASS}>CURRENT VIEWPOINT</p>
            <div className="flex flex-wrap gap-2">
              {(['eye-level', 'top-down', 'human-pov', 'suspended', 'display-view'] as const).map(vp => (
                <Chip
                  key={vp}
                  selected={productStore.viewpoint === vp}
                  onClick={() => {
                    productStore.setViewpoint(vp);
                    markSectionTouched('viewpoint-vantage');
                  }}
                  disabled={!productStore.placement}
                >
                  {vp.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </Chip>
              ))}
            </div>
          </div>
        </div>
      </AccordionSection>
      )}

      {/* ============================================================================
           08 / PHOTO MODE
           Photo Mode is currently part of Product Setup (01). Per v1.0 spec, it should
           be positioned after Viewpoint & Vantage. This is a placeholder indicating 
           the conceptual position - actual Photo Mode controls remain in 01.
           ============================================================================ */}

      {isEcommerceMode && (
      <AccordionSection
        icon={Camera}
        title="08 / Camera & Framing"
        description="Professional product photography controls"
        isOpen={openAccordionId === 'product-camera'}
        onToggle={() => toggleSection('product-camera')}
        isTouched={touchedSections.has('product-camera')}
        variant="primary"
      >
        <div className="space-y-5">
          {(() => {
            const cameraCapability = getPhotoModeCameraCapability(productStore.photoMode);
            const isRestrictedCamera = cameraCapability === 'restricted';
            return (
              <>
          <p className="text-sm text-gray-500">Professional photography controls.</p>
          <div className={SECTION_GROUP_CLASS}>
            <p className={GROUP_LABEL_CLASS}>CAMERA SYSTEM</p>
            <div className="flex flex-wrap gap-3">
              {(['DSLR / mirrorless', 'Macro lens', 'Telephoto compression'] as const).map(option => (
                <Chip
                  key={option}
                  onClick={() => {
                    updateValue('productCameraSystem', option);
                    // Sync into ProductStudio store so prompt camera injection follows the UI selection.
                    if (option === 'DSLR / mirrorless') {
                      productStore.setCameraSystem('dslr_mirrorless');
                    } else {
                      productStore.setCameraSystem('macro');
                    }
                    productStore.setCameraUiLabels({ cameraSystem: option });
                    if (!productStore.advancedModeEnabled && option === 'Macro lens') {
                      productStore.setLens('100mm Macro Prime');
                    } else if (!productStore.advancedModeEnabled && option === 'Telephoto compression') {
                      productStore.setLens('70-200mm Compression');
                    }
                    markSectionTouched('product-camera');
                  }}
                  selected={values.productCameraSystem === option}
                >
                  {option}
                </Chip>
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <div className={SECTION_GROUP_CLASS}>
              <p className={GROUP_LABEL_CLASS}>ANGLE</p>
              <div className="flex flex-wrap gap-3">
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
                    disabled={isRestrictedCamera}
                    onClick={() => {
                      if (isRestrictedCamera) return;
                      // Auto-switch to surface for flat lays
                      if (option === 'Top-down flat lay') {
                        productStore.setPlacement('surface');
                      }

                      updateValue('productCameraAngle', option as any);
                      const angleMap: Record<string, ProductStudioState['angle']> = {
                        'Eye level product': 'eye_level',
                        '45° hero': '45_hero',
                        'Top-down flat lay': 'top_down',
                        'Low angle power': 'low_angle',
                        'High angle overview': 'high_angle',
                        'Detail close-up': 'detail_closeup',
                      };
                      const mapped = angleMap[option];
                      if (mapped) productStore.setAngle(mapped);
                      productStore.setCameraUiLabels({ angle: option });
                      markSectionTouched('product-camera');
                    }}
                    selected={values.productCameraAngle === option}
                  >
                    {option}
                  </Chip>
                ))}
              </div>
              {getInterpretationNote('angle') && (
                <InterpretationNote message={getInterpretationNote('angle')!} />
              )}
            </div>

            <div className={SECTION_GROUP_CLASS}>
              <p className={GROUP_LABEL_CLASS}>DISTANCE</p>
              <div className="flex flex-wrap gap-3">
                {(['Wide', 'Standard', 'Tight', 'Macro'] as const).map(option => (
                  <Chip
                    key={option}
                    disabled={isRestrictedCamera}
                    onClick={() => {
                      if (isRestrictedCamera) return;
                      updateValue('productCameraDistance', option);
                      const distanceMap: Record<string, ProductStudioState['distance']> = {
                        Wide: 'wide',
                        Standard: 'standard',
                        Tight: 'tight',
                        Macro: 'macro',
                      };
                      const mapped = distanceMap[option];
                      if (mapped) productStore.setDistance(mapped);
                      productStore.setCameraUiLabels({ distance: option });
                      markSectionTouched('product-camera');
                    }}
                    selected={values.productCameraDistance === option}
                  >
                    {option}
                  </Chip>
                ))}
              </div>
              {getInterpretationNote('distance') && (
                <InterpretationNote message={getInterpretationNote('distance')!} />
              )}
            </div>
          </div>

          <div className="space-y-5">
            <div className={SECTION_GROUP_CLASS}>
              <p className={GROUP_LABEL_CLASS}>ROTATION</p>
              <div className="flex flex-wrap gap-3">
                {([0, 5, 10, 15] as const).map(option => (
                  <Chip
                    key={option}
                    onClick={() => {
                      updateValue('productCameraRotation', option);
                      productStore.setRotation(option);
                      productStore.setCameraUiLabels({ rotation: `${option}°` });
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
              <div className="flex flex-wrap gap-3">
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
                        productStore.setFraming('rule_of_thirds');
                      } else if (option === 'Centered hero') {
                        productStore.setFraming('centered_hero');
                      } else if (option === 'Left aligned + negative space') {
                        productStore.setFraming('left_negative');
                      } else if (option === 'Right aligned + negative space') {
                        productStore.setFraming('right_negative');
                      } else if (option === 'Grid-ready') {
                        productStore.setFraming('grid_ready');
                      }
                      productStore.setCameraUiLabels({ framing: option });
                      markSectionTouched('product-camera');
                    }}
                    selected={values.productFramingGuide === option}
                  >
                    {option}
                  </Chip>
                ))}
              </div>
              {getInterpretationNote('framing') && (
                <InterpretationNote message={getInterpretationNote('framing')!} />
              )}
            </div>
          </div>
              </>
            );
          })()}
        </div>
      </AccordionSection>
      )}

      {/* ============================================================================
           10 / LIGHTING (v1.0 SPEC PLACEHOLDER)
           Lighting is currently derived from Photo Mode.
           Manual overrides will be available in v1.1.
           ============================================================================ */}
      {isEcommerceMode && !isProductMode && (
      <AccordionSection
        icon={Sun}
        title="10 / Lighting"
        description="Lighting behavior and mood. Currently derived from Photo Mode."
        isOpen={openAccordionId === 'lighting'}
        onToggle={() => toggleSection('lighting')}
        isTouched={touchedSections.has('lighting')}
        variant="secondary"
      >
        <div className="space-y-5">
          <p className="text-sm text-gray-500">
            Lighting is currently derived from Photo Mode.
          </p>
          <p className="text-xs text-amber-600 dark:text-amber-400">
            Manual overrides will be available in v1.1.
          </p>
          <div className={SECTION_GROUP_CLASS}>
            <p className={GROUP_LABEL_CLASS}>CURRENT LIGHTING</p>
            <div className="flex flex-wrap gap-2">
              <Chip selected disabled>
                {productStore.lightingRig || 'Auto (from Photo Mode)'}
              </Chip>
            </div>
          </div>
        </div>
      </AccordionSection>
      )}

      {isEcommerceMode && (
      <AccordionSection
        icon={Building2}
        title="09 / Ecommerce Image Builder (BETA)"
        description={`Ecommerce builder.\nBeta feature.`}
        isOpen={openAccordionId === 'ecommerce'}
        onToggle={() => toggleSection('ecommerce')}
        isActive
        variant="secondary"
      >
        <div className="space-y-5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs tracking-wide text-amber-800">
              BETA
            </span>
          </div>
          <div className={SECTION_GROUP_CLASS}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className={GROUP_LABEL_CLASS}>BACKGROUND CANVAS</p>
              </div>
              <SwitchToggle
                checked={values.ecommerceSidePlacementFlag}
                onCheckedChange={(next) => {
                  updateValue('ecommerceSidePlacementFlag', next);
                  updateValue('compositionMode', next ? 'Ecommerce Blank Space' : '');
                  markSectionTouched('ecommerce');
                }}
                aria-label="Background canvas"
              />
            </div>
          </div>

          {values.ecommerceSidePlacementFlag === true && (
            <>
              <div className={SECTION_GROUP_CLASS}>
                <div>
                  <p className={GROUP_LABEL_CLASS}>SIDE PLACEMENT</p>
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

              <div className="space-y-5 rounded-xl border border-gray-200 bg-white p-5">
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
                        className={`block ${COLOR_PICKER_SWATCH_VISUAL_CLASS} cursor-pointer`}
                        style={{ background: (isProductMode ? productStore.backgroundColor : values.ecommerceBackgroundColor) || '#ffffff' }}
                      />
                      <input
                        type="color"
                        className={COLOR_PICKER_HIDDEN_INPUT_CLASS}
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
                    <div className="space-y-5">
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
                              className={`block ${COLOR_PICKER_SWATCH_VISUAL_CLASS} cursor-pointer`}
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
                              className={COLOR_PICKER_HIDDEN_INPUT_CLASS}
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
            <div
              className={`space-y-3 rounded-2xl border border-gray-200 bg-white p-5 transition-opacity duration-200 ${industryPreviewFade ? 'opacity-70' : 'opacity-100'}`}
            >
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
                slotGenerationMeta={ecommerceOverlay.slotGenerationMeta}
                settings={ecommerceOverlay.settings}
                onSettingsChange={ecommerceOverlay.onSettingsChange}
                onGenerateSequence={ecommerceOverlay.onGenerateSequence}
                isGeneratingSequence={ecommerceOverlay.isGeneratingSequence}
              />
            </div>
          )}
        </div>
      </AccordionSection>
      )}

      {
        isEnvironmentMode && (
          <>
            {showVisualIntentControl && (
              <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden dark:bg-white/5 dark:border-white/10 dark:backdrop-blur-[20px] dark:backdrop-saturate-[180%]">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-white/10">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">Visual Intent</p>
                    <p className="text-xs text-gray-500 dark:text-white/50">Choose the lifestyle creative direction.</p>
                  </div>
                </div>
                <div className="px-4 py-5 bg-gray-50 dark:bg-white/5">
                  <div className="flex flex-wrap gap-2">
                    {([
                      { value: 'ugc', label: 'UGC' },
                      { value: 'editorial', label: 'Editorial' },
                      { value: 'brand', label: 'Brand' },
                      { value: 'luxury', label: 'Luxury' },
                    ] as const).map((option) => (
                      <Chip
                        key={option.value}
                        onClick={() => {
                          updateValue('visualIntent', option.value);
                          if (option.value === 'ugc') {
                            setVisualMode('ugc');
                          }
                          markSectionTouched('creator');
                        }}
                        selected={(values.visualIntent ?? 'editorial') === option.value}
                        size="md"
                      >
                        {option.label}
                      </Chip>
                    ))}
                  </div>
                  {isLuxuryIntent && (
                    <p className="mt-3 text-[11px] font-medium text-amber-700">
                      Luxury enforces disciplined framing.
                    </p>
                  )}
                </div>
              </div>
            )}

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
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-white/50">
                  <span>Pro</span>
                  <SwitchToggle
                    checked={isCreatorPro}
                    onCheckedChange={setIsCreatorPro}
                    size="sm"
                    aria-label="Enable creator pro mode"
                  />
                </div>
              </div>

              <div className="px-4 py-6 space-y-5 bg-gray-50 dark:bg-white/5">
                {isPersonDisabled ? (
                  <div className="rounded-xl border border-gray-200 bg-white p-5 text-sm text-gray-500 dark:border-white/10 dark:bg-black/20 dark:text-white/60">
                    Creator / Person controls are disabled in Product Mode.
                  </div>
                ) : (
                  <>
                    <section className="space-y-5">
                      <div className="flex items-center gap-2">
                        <p className={GROUP_LABEL_CLASS}>CORE IDENTITY</p>
                        {touchedSections.has('creator') && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-300" />}
                      </div>

                      <div>
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
                          {(isCreatorPro
                            ? (['Female', 'Male', 'Trans', 'Non-binary', 'Gender non-conforming'] as const)
                            : (['Female', 'Male'] as const)
                          ).map(option => (
                            <Chip
                              key={option}
                              onClick={() => { updateValue('gender', option as any); markSectionTouched('creator'); }}
                              selected={values.gender === (option as any)}
                              size="md"
                            >
                              {option}
                            </Chip>
                          ))}
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
                                <Chip
                                  key={option}
                                  onClick={() => { updateValue('eyeDirection', option); markSectionTouched('creator'); }}
                                  selected={active}
                                  size="md"
                                >
                                  {option}
                                </Chip>
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
                              <SwitchToggle
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
                        <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-5 dark:bg-black/20 dark:border-white/10">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">Person B (Secondary)</p>
                              <p className="text-[11px] text-gray-400 dark:text-white/40">
                                Keep Person B coherent and in-focus. Use Advanced only if you need tighter control.
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500 dark:text-white/50">Advanced</span>
                              <SwitchToggle
                                checked={personBAdvancedOpen}
                                onCheckedChange={(next) => setPersonBAdvancedOpen(next)}
                                aria-label="Toggle Person B advanced controls"
                              />
                            </div>
                          </div>

                          <div className="space-y-5">
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
                                {(isCreatorPro
                                  ? ([
                                    'Non-specific',
                                    'White / European descent',
                                    'Black / African descent',
                                    'Latino / Hispanic',
                                    'Asian',
                                    'Middle Eastern',
                                    'South Asian',
                                    'Mixed',
                                  ] as const)
                                  : ([
                                    'Non-specific',
                                    'White / European descent',
                                    'Black / African descent',
                                    'Latino / Hispanic',
                                  ] as const)
                                ).map(option => (
                                  <Chip
                                    key={option}
                                    onClick={() => { updateValue('secondaryEthnicity', option); markSectionTouched('creator'); }}
                                    selected={values.secondaryEthnicity === option}
                                    size="md"
                                  >
                                    {option}
                                  </Chip>
                                ))}
                              </div>
                            </div>

                            <div className="space-y-2">
                              <span className="text-xs text-gray-600 dark:text-white/60">Hair</span>
                              <div className="flex flex-wrap gap-2">
                                {(['Short', 'Shoulder', 'Long'] as const).map(option => (
                                  <Chip
                                    key={option}
                                    onClick={() => { updateValue('secondaryHairLength', option); markSectionTouched('creator'); }}
                                    selected={values.secondaryHairLength === option}
                                    size="md"
                                    className="w-full justify-center rounded-full py-2 text-[12px] font-semibold"
                                  >
                                    {option}
                                  </Chip>
                                ))}
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {HAIR_COLOR_OPTIONS.map(option => (
                                  <Chip
                                    key={option}
                                    onClick={() => { updateValue('secondaryHairColor', option); markSectionTouched('creator'); }}
                                    selected={values.secondaryHairColor === option}
                                    size="md"
                                  >
                                    {option}
                                  </Chip>
                                ))}
                              </div>
                            </div>

                            {personBAdvancedOpen && (
                              <>
                                <div className="pt-3 border-t border-gray-100 dark:border-white/10" />

                                <div className="space-y-2">
                                  <span className="text-xs text-gray-600 dark:text-white/60">Skin tone</span>
                                  <div className="flex flex-wrap gap-2">
                                    {SKIN_TONE_OPTIONS.map(option => (
                                      <Chip
                                        key={option}
                                        onClick={() => { updateValue('secondarySkinTone', option); markSectionTouched('creator'); }}
                                        selected={values.secondarySkinTone === option}
                                        size="md"
                                      >
                                        {option}
                                      </Chip>
                                    ))}
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <span className="text-xs text-gray-600 dark:text-white/60">Eye color</span>
                                  <div className="flex flex-wrap gap-2">
                                    {EYE_COLOR_OPTIONS.map(option => (
                                      <Chip
                                        key={option}
                                        onClick={() => { updateValue('secondaryEyeColor', option); markSectionTouched('creator'); }}
                                        selected={values.secondaryEyeColor === option}
                                        size="md"
                                      >
                                        {option}
                                      </Chip>
                                    ))}
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <span className="text-xs text-gray-600 dark:text-white/60">Hair texture</span>
                                  <div className="flex flex-wrap gap-2">
                                    {HAIR_TEXTURE_OPTIONS.map(option => (
                                      <Chip
                                        key={option}
                                        onClick={() => { updateValue('secondaryHairTexture', option); markSectionTouched('creator'); }}
                                        selected={values.secondaryHairTexture === option}
                                        size="md"
                                      >
                                        {option === 'Coily/Kinky' ? 'Coily / Kinky' : option}
                                      </Chip>
                                    ))}
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <span className="text-xs text-gray-600 dark:text-white/60">Body type</span>
                                  <div className="flex flex-wrap gap-2">
                                    {BODY_TYPE_OPTIONS.map(option => (
                                      <Chip
                                        key={option}
                                        onClick={() => { updateValue('secondaryBodyType', option as any); markSectionTouched('creator'); }}
                                        selected={values.secondaryBodyType === (option as any)}
                                        size="md"
                                      >
                                        {option}
                                      </Chip>
                                    ))}
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        <span className="text-xs text-gray-600 dark:text-white/60">Ethnicity</span>
                        <div className="flex flex-wrap gap-2">
                          {(isCreatorPro
                            ? ([
                              'Non-specific',
                              'White / European descent',
                              'Black / African descent',
                              'Latino / Hispanic',
                              'Asian',
                              'Middle Eastern',
                              'South Asian',
                              'Mixed',
                            ] as const)
                            : ([
                              'Non-specific',
                              'White / European descent',
                              'Black / African descent',
                              'Latino / Hispanic',
                            ] as const)
                          ).map(option => (
                            <Chip
                              key={option}
                              onClick={() => { updateValue('ethnicity', option); markSectionTouched('creator'); }}
                              selected={values.ethnicity === option}
                              size="md"
                            >
                              {option}
                            </Chip>
                          ))}
                        </div>
                      </div>
                      </div> {/* END: Core Identity wrapper */}
                    </section>

                    <section className="space-y-5">
                      <p className={GROUP_LABEL_CLASS}>APPEARANCE</p>

                      <div className="space-y-2">
                        <span className="text-xs text-gray-600 dark:text-white/60">Hair length</span>
                        <div className="flex flex-wrap gap-2">
                            {(isCreatorPro
                              ? (['Buzzcut', 'Short', 'Shoulder', 'Chin-length', 'Long', 'Very long'] as const)
                              : (['Short', 'Shoulder', 'Long'] as const)
                            ).map(option => (
                              <Chip
                                key={option}
                                onClick={() => { updateValue('hairLength', option as any); markSectionTouched('creator'); }}
                                selected={values.hairLength === (option as any)}
                                size="md"
                                className="rounded-full py-2 text-[12px] font-semibold"
                              >
                                {option}
                              </Chip>
                            ))}
                          </div>
                        </div>
                    </section>

                    <section className="space-y-5">
                      <p className={GROUP_LABEL_CLASS}>FACIAL EXPRESSION</p>
                      <div className="flex flex-wrap gap-2">
                        {(isCreatorPro
                          ? ([
                            'Calm & Serene',
                            'Joyful & High-Energy',
                            'Confident & Editorial',
                            'Playful & Candid',
                            'Hustle & Juggle',
                            'Stressed but Determined',
                            'Relieved / Recovered',
                          ] as const)
                          : (['Calm & Serene', 'Joyful & High-Energy'] as const)
                        ).map(option => (
                          <Chip
                            key={option}
                            onClick={() => { updateValue('facialExpression', option as any); markSectionTouched('creator'); }}
                            selected={values.facialExpression === (option as any)}
                            size="md"
                            className=""
                          >
                            {option}
                          </Chip>
                        ))}
                      </div>
                    </section>

                    {isCreatorPro && (
                    <section className="space-y-5">
                      <p className={GROUP_LABEL_CLASS}>DETAILS</p>

                      <div className="space-y-2">
                        <span className="text-xs text-gray-600 dark:text-white/60">Skin tone</span>
                        <div className="flex flex-wrap gap-2">
                          {SKIN_TONE_OPTIONS.map(option => (
                            <Chip
                              key={option}
                              onClick={() => { updateValue('skinTone', option); markSectionTouched('creator'); }}
                              selected={values.skinTone === option}
                              size="md"
                            >
                              {option}
                            </Chip>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <span className="text-xs text-gray-600 dark:text-white/60">Eye color</span>
                        <div className="flex flex-wrap gap-2">
                          {EYE_COLOR_OPTIONS.map(option => (
                            <Chip
                              key={option}
                              onClick={() => { updateValue('eyeColor', option); markSectionTouched('creator'); }}
                              selected={values.eyeColor === option}
                              size="md"
                            >
                              {option}
                            </Chip>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <span className="text-xs text-gray-600 dark:text-white/60">Body type</span>
                        <div className="flex flex-wrap gap-2">
                          {BODY_TYPE_OPTIONS.map(option => (
                            <Chip
                              key={option}
                              onClick={() => { updateValue('bodyType', option as Step3Values['bodyType']); markSectionTouched('creator'); }}
                              selected={values.bodyType === option}
                              size="md"
                            >
                              {option}
                            </Chip>
                          ))}
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
                              <Chip
                                key={option.value}
                                onClick={() => { updateValue('hairState', option.value); markSectionTouched('creator'); }}
                                selected={active}
                                size="md"
                              >
                                {option.label}
                              </Chip>
                            );
                          })}
                        </div>
                      </div>

                      {values.hairState === 'natural' && (
                        <>
                          <div className="space-y-2">
                            <span className="text-xs text-gray-600 dark:text-white/60">Hair texture</span>
                            <div className="flex flex-wrap gap-2">
                              {[...HAIR_TEXTURE_OPTIONS, 'Custom'].map(option => {
                                const active = values.hairTexture === option;
                                const label = option === 'Coily/Kinky' ? 'Coily / Kinky' : option;
                                return (
                                  <Chip
                                    key={option}
                                    onClick={() => { updateValue('hairTexture', option); markSectionTouched('creator'); }}
                                    selected={active}
                                    size="md"
                                  >
                                    {label}
                                  </Chip>
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
                              {HAIR_COLOR_OPTIONS.map(option => (
                                <Chip
                                  key={option}
                                  onClick={() => { updateValue('hairColor', option); markSectionTouched('creator'); }}
                                  selected={values.hairColor === option}
                                  size="md"
                                >
                                  {option}
                                </Chip>
                              ))}
                            </div>
                          </div>
                        </>
                      )}

                      <div className={`flex items-center justify-between pt-4 ${(!hasFirstGenerationComplete || hasModelReference) ? 'opacity-50' : ''}`}>
                        <div>
                          <p className="text-xs text-gray-600 dark:text-white/60">Keep same person</p>
                          <p className="text-[11px] text-gray-400 dark:text-white/40">
                            Locks identity across renders (available after first generation)
                          </p>
                        </div>
                        <SwitchToggle
                          checked={values.sameCreatorAcrossScenes || false}
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
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Legacy version kept for reference (disabled) */}
            {false && (
              <AccordionSection
                icon={User}
                title="Creator / Person"
                description="Define the person in your scene"
                isOpen={openAccordionId === 'creator'}
                onToggle={() => toggleSection('creator')}
                required
                isTouched={touchedSections.has('creator')}
                variant="primary"
                ui="tokens"
              >
                {isPersonDisabled ? (
                  <div className="rounded-xl border border-gray-200 bg-white p-5 text-sm text-gray-500 dark:border-white/10 dark:bg-black/20 dark:text-white/60">
                    Creator / Person controls are disabled in Product Mode.
                  </div>
                ) : (
                  <div className="space-y-5">
                    {/* Core */}
                    <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-5 dark:border-white/10 dark:bg-white/5">
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
                        {values.visualMode === 'ugc' && (
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
                              description="Couple: same sex"
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
                              description="Couple: different sex"
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
                        <div className="flex flex-wrap gap-2">
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
                        <div className="flex flex-wrap gap-2">
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
                        <p className="text-xs uppercase tracking-[0.2em] text-indigo-600 font-extrabold">
                          Advanced identity controls
                        </p>
                      </div>
                      <div className="px-4 py-4 space-y-5">
                        {/* SECTION 1 – Extended Identity */}
                        <section className="space-y-5">
                          <p className="text-[11px] uppercase tracking-[0.2em] text-gray-500">SECTION 1 – EXTENDED IDENTITY</p>

                          <div className="space-y-2">
                            <p className="text-xs uppercase tracking-[0.3em] text-gray-400">GENDER</p>
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
                            <p className="text-xs uppercase tracking-[0.3em] text-gray-400">ETHNICITY</p>
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
                        <section className="space-y-5 pt-4">
                          <p className="text-[11px] uppercase tracking-[0.2em] text-gray-500">SECTION 2 – PHYSICAL APPEARANCE</p>

                          <div className="space-y-2">
                            <p className="text-xs uppercase tracking-[0.3em] text-gray-400">SKIN TONE</p>
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
                            <p className="text-xs uppercase tracking-[0.3em] text-gray-400">EYE COLOR</p>
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
                            <p className="text-xs uppercase tracking-[0.3em] text-gray-400">BODY TYPE</p>
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
                        <section className="space-y-5 pt-4">
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
                            <p className="text-xs uppercase tracking-[0.3em] text-gray-400">ADVANCED FACIAL EXPRESSIONS</p>
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
                        <section className="space-y-5 pt-4">
                          <p className="text-[11px] uppercase tracking-[0.2em] text-gray-500">SECTION 5 – GAZE &amp; PERSISTENCE</p>

                          <div className="space-y-3">
                            <p className="text-xs uppercase tracking-[0.3em] text-gray-400">EYE DIRECTION</p>
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
                            <SwitchToggle
                              checked={values.sameCreatorAcrossScenes || false}
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
              </AccordionSection>
            )}

            {/* Legacy Props Section (Restored for Lifestyle) */}
            {!isProductMode && (
              <AccordionSection
                icon={Sparkles}
                title="Props"
                description="Add objects to the scene"
                isOpen={openAccordionId === 'props'}
                onToggle={() => toggleSection('props')}
                isTouched={touchedSections.has('props')}
                variant="primary"
              >
                <div className="space-y-5">
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
              </AccordionSection>
            )}


            {/* RAW DOMESTIC UGC */}
            <AccordionSection
              icon={Smartphone}
              title="Raw Domestic UGC"
              description="Careless front-camera capture at home"
              isOpen={openAccordionId === 'realism'}
              onToggle={() => toggleSection('realism')}
              isTouched={hasAnyUgcLayerSelection}
              isActive={values.visualMode === 'ugc'}
              variant="expert"
            >
              <div id="ugc-real-mode">
                <div className="pt-2 pb-4 px-2">
                  <div className="space-y-5">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Raw Domestic UGC</p>
                        <p className="text-xs text-gray-500">Careless front-camera capture at home</p>
                      </div>
                      <SwitchToggle
                        checked={values.visualMode === 'ugc'}
                        aria-label="Enable Raw Domestic UGC"
                        onCheckedChange={(newValue) => {
                          setVisualMode(newValue ? 'ugc' : 'default');
                        }}
                      />
                    </div>

                    {values.visualMode === 'ugc' && (
                      <>
                        {/* UGC Full Automation Toggle */}
                        <div className="rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-3 space-y-2">
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <p className="text-xs uppercase tracking-[0.3em] text-indigo-600">UGC Full Automation</p>
                              <p className="text-xs text-gray-600">
                                {hasModelReference
                                  ? 'Disabled while Model Reference is active (Model Reference always wins)'
                                  : 'Maximum entropy mode: Randomize EVERYTHING (person identity, camera, lighting, environment, props). Ignores ALL manual selections below.'}
                              </p>
                            </div>
                            <SwitchToggle
                              checked={values.isRandomFullAutomationEnabled || false}
                              disabled={hasModelReference}
                              aria-label="Enable UGC Full Automation"
                              onCheckedChange={(newValue) => {
                                updateValue('isRandomFullAutomationEnabled', newValue);
                                // If Full Automation is ON, force Keep Same Person OFF
                                if (newValue) {
                                  updateValue('sameCreatorAcrossScenes', false);
                                }
                              }}
                            />
                          </div>
                          {values.isRandomFullAutomationEnabled && (
                            <div className="mt-2 rounded-lg bg-white/60 border border-indigo-200 px-3 py-3 space-y-3">
                              <div>
                                <p className="text-xs uppercase tracking-wider text-indigo-600 mb-1">Active Mode</p>
                                <p className="text-xs text-gray-700">
                                  Full automation active. All controls below are disabled. Scene will be generated with maximum natural entropy.
                                </p>
                              </div>
                              
                              {/* Gender Preference (optional) */}
                              <div>
                                <p className="text-xs uppercase tracking-wider text-gray-600 mb-2">Gender Preference (Optional)</p>
                                <ChipSelectGroup
                                  options={[
                                    { value: 'any', label: 'Any (fully random)' },
                                    { value: 'male', label: 'Male' },
                                    { value: 'female', label: 'Female' }
                                  ]}
                                  selectedValue={values.fullAutomationGenderPreference || 'any'}
                                  onChange={(val: string) => {
                                    updateValue('fullAutomationGenderPreference', val as 'any' | 'male' | 'female');
                                    markSectionTouched('creator');
                                  }}
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="rounded-2xl border border-gray-200 bg-white p-5 space-y-2">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-xs uppercase tracking-[0.2em] text-gray-500 font-extrabold">IMPERFECTION LEVEL</p>
                            </div>
                            <div className="flex flex-wrap justify-end gap-2">
                              {(['low', 'medium', 'high'] as const).map(level => (
                                <button
                                  key={level}
                                  type="button"
                                  onClick={() => updateValue('ugcImperfectionLevel', level)}
                                  className={getTogglePillClass(values.ugcImperfectionLevel === level)}
                                  title={level === 'high' ? 'Heaviest compression/noise, rolling shutter wobble, harsh mixed lighting' : level === 'medium' ? 'Noticeable compression/noise, minor motion blur' : 'Subtle imperfections only'}
                                >
                                  {level === 'low' ? 'Low' : level === 'medium' ? 'Medium' : 'High'}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-5">
                          {RAW_DOMESTIC_CAPTURE_SECTIONS.map(section => {
                            const currentSelections = (values[section.field] as string[]) || [];
                            return (
                              <div key={section.field} className="space-y-3">
                                <div>
                                  <p className="text-xs uppercase tracking-wider text-gray-500">{section.title}</p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {section.options.map(option => (
                                    <Chip
                                      key={option.id}
                                      selected={currentSelections.includes(option.id)}
                                      description={option.detail}
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

            </AccordionSection>

            {/* Product Interaction */}
            {isEcommerceMode && (
            <AccordionSection
              icon={Hand}
              title="Product Interaction"
              description="Control how the creator handles the product"
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
                      className={getTogglePillClass(values.productInteraction === option)}
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
            </AccordionSection>
            )}

            <AccordionSection
              icon={Shirt}
              title="Custom Clothes"
              description="Optionally describe an outfit without uploading images."
              isOpen={openAccordionId === 'custom-clothes'}
              onToggle={() => toggleSection('custom-clothes')}
              isTouched={touchedSections.has('customClothes')}
              isActive={values.customClothesEnabled}
              variant="expert"
            >
              <div className="space-y-5">
                <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-3 py-2">
                  <div>
                    <p className="text-sm text-gray-900">Enable outfit customization</p>
                    <p className="text-[11px] text-gray-500">Describe garments with text-only controls.</p>
                  </div>
                  <SwitchToggle
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
                            className={getTogglePillClass(values.customClothesGarmentType === option)}
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
                            className={getTogglePillClass(values.customClothesPrimaryColor === option)}
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
                          <label className={`relative inline-block ${COLOR_PICKER_BUTTON_CLASS} cursor-pointer border-gray-200 hover:border-gray-300`}>
                            <span
                              className="block h-full w-full rounded-full"
                              style={{ background: isHexColor(values.customClothesPrimaryColor) ? values.customClothesPrimaryColor : '#000000' }}
                            />
                            <input
                              type="color"
                              aria-label="Custom clothes color picker"
                              value={isHexColor(values.customClothesPrimaryColor) ? values.customClothesPrimaryColor : '#000000'}
                              onChange={(e) => {
                                updateValue('customClothesPrimaryColor', e.target.value.toUpperCase());
                                markSectionTouched('customClothes');
                              }}
                              className={COLOR_PICKER_HIDDEN_INPUT_CLASS}
                            />
                          </label>
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
                            className={getTogglePillClass(values.customClothesFit === option)}
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
                            className={getTogglePillClass(values.customClothesStyle === option)}
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
                            className={getTogglePillClass(values.customClothesMaterial === option)}
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
            </AccordionSection>

            {/* Environment */}
            <AccordionSection
              icon={Home}
              title="Environment"
              description="Where the scene takes place"
              isOpen={openAccordionId === 'environment'}
              onToggle={() => toggleSection('environment')}
              required={true}
              isTouched={touchedSections.has('environment')}
              variant="primary"
            >
              <div className="space-y-3">
                {values.visualMode === 'ugc' && (
                  <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-xs text-gray-500">
                    Raw Domestic UGC still honors your environment choice—it just interprets it as incidental and unstaged. Pick any room; the engine keeps it messy, domestic, and low intent.
                  </div>
                )}
                {values.visualMode !== 'ugc' && (
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
                      className={`flex items-center gap-2 ${getTogglePillClass(values.environment === env.value)}`}
                    >
                      <env.icon className="w-4 h-4" />
                      <span>{env.value}</span>
                    </button>
                  ))}
                </div>

                {values.visualMode !== 'ugc' && (
                  <>
                    <p className="text-xs uppercase tracking-wider text-indigo-600 pt-2">OUTDOOR</p>
                    <div className="flex flex-wrap gap-2">
                      {ENVIRONMENT_OUTDOOR.map(env => (
                        <button
                          key={env.value}
                          type="button"
                          onClick={() => { updateValue('environment', env.value); markSectionTouched('environment'); }}
                          className={`flex items-center gap-2 ${getTogglePillClass(values.environment === env.value)}`}
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
            </AccordionSection>

            {/* Ritual Mode (Lifestyle-only) */}
            {!isProductMode && (
              <AccordionSection
                icon={Activity}
                title="Ritual Mode"
                description="Lifestyle rituals + optional product-free renders"
                isOpen={openAccordionId === 'ritual'}
                onToggle={() => toggleSection('ritual')}
                isTouched={touchedSections.has('ritual')}
                isActive={values.visualMode === 'ritual'}
                variant="primary"
              >
                <div className="space-y-5">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Ritual Mode</p>
                      <p className="text-xs text-gray-500">Generate wellness / lifestyle rituals. Optionally hide the product completely.</p>
                    </div>
                    <SwitchToggle
                      checked={values.visualMode === 'ritual'}
                      aria-label="Enable Ritual Mode"
                      onCheckedChange={(next) => {
                        setVisualMode(next ? 'ritual' : 'default');
                        markSectionTouched('ritual');
                      }}
                    />
                  </div>

                  {values.visualMode === 'ritual' && (
                    <>
                      <div className="rounded-2xl border border-gray-200 bg-white p-5">
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-[11px] uppercase tracking-wider text-gray-500">Hide product (lifestyle-only)</p>
                            <p className="text-[11px] text-gray-500">No product visible in the final image. Product upload becomes optional.</p>
                          </div>
                          <SwitchToggle
                            checked={values.ritualHideProduct}
                            aria-label="Hide product in Ritual Mode"
                            onCheckedChange={(next) => {
                              updateValue('ritualHideProduct', next);
                              markSectionTouched('ritual');
                            }}
                          />
                        </div>
                      </div>

                      <div className="rounded-2xl border border-gray-200 bg-white p-5">
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-[11px] uppercase tracking-wider text-gray-500">No objects (people + environment only)</p>
                            <p className="text-[11px] text-gray-500">Avoid props and handheld items; focus on people and the environment.</p>
                          </div>
                          <SwitchToggle
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
                                className={getTogglePillClass(values.ritualCoupleStaging === option)}
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
                              className={getTogglePillClass(values.ritualPosture === option)}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className={SECTION_GROUP_CLASS}>
                        <p className={GROUP_LABEL_CLASS}>RITUAL ACTIVITIES</p>
                        <p className="text-[11px] text-gray-500">Pick one.</p>
                        <div className="flex flex-wrap gap-2">
                          {RITUAL_ACTIVITY_OPTIONS.map(option => {
                            const active = values.ritualActivities.includes(option);
                            return (
                              <button
                                key={option}
                                type="button"
                                onClick={() => {
                                  // Single-select: always replace with selected option
                                  updateValue('ritualActivities', [option]);
                                  markSectionTouched('ritual');
                                }}
                                className={getTogglePillClass(active)}
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
              </AccordionSection>
            )}
            {/* Time & Lighting */}
            <AccordionSection
              icon={Sun}
              title="Time & Lighting"
              description="Control the lighting and time of day"
              isOpen={openAccordionId === 'lighting'}
              onToggle={() => toggleSection('lighting')}
              isTouched={touchedSections.has('lighting')}
              variant="primary"
            >
              {values.visualMode === 'ugc' ? (
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
                          className={getTogglePillClass(values.timeOfDay === option)}
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
                          className={getTogglePillClass(values.lightingStyle === option.label)}
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
            </AccordionSection>

            {
                <AccordionSection
                  icon={Camera}
                  title="Camera & Framing"
                  description="How the scene is captured"
                  helpTooltip={'Camera & Framing.\nUGC ignores camera aesthetics to preserve realism.'}
                  isOpen={openAccordionId === 'camera'}
                  onToggle={() => toggleSection('camera')}
                  isTouched={touchedSections.has('camera')}
                  variant="primary"
                >
                  <div className="space-y-3">
                    {cameraSectionLockedByUgc && (
                      <p className="text-[11px] font-medium text-amber-700">Camera controlled by UGC mode.</p>
                    )}
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
                          .map(option => {
                            const isLuxuryIncompatible =
                              isLuxuryIntent &&
                              isLifestyleCompatibilityActive &&
                              !luxuryCameraTypeAllowed.has(option.label);
                            const isDisabled = cameraSectionLockedByUgc || isLuxuryIncompatible;
                            return (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => {
                                if (isDisabled) return;
                                updateValue('cameraType', option.label);
                                markSectionTouched('camera');
                              }}
                              className={`${getTogglePillClass(values.cameraType === option.label)} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                              title={isLuxuryIncompatible ? 'Not compatible with Luxury identity.' : option.value}
                              disabled={isDisabled}
                            >
                              {option.label}
                            </button>
                            );
                          })}
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
                        {SHOT_TYPE_OPTIONS.map(option => {
                          const isLuxuryIncompatible =
                            isLuxuryIntent &&
                            isLifestyleCompatibilityActive &&
                            !luxuryShotAllowed.has(option);
                          const isDisabled = cameraSectionLockedByUgc || isLuxuryIncompatible;
                          return (
                          <button
                            key={option}
                            type="button"
                            onClick={() => {
                              if (isDisabled) return;
                              updateValue('shotType', option);
                              markSectionTouched('camera');
                            }}
                            className={`${getTogglePillClass(values.shotType === option)} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                            title={isLuxuryIncompatible ? 'Not compatible with Luxury identity.' : undefined}
                            disabled={isDisabled}
                          >
                            {option}
                          </button>
                          );
                        })}
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
                        ).map(option => {
                          const isLuxuryIncompatible =
                            isLuxuryIntent &&
                            isLifestyleCompatibilityActive &&
                            !luxuryCompositionAllowed.has(option.value);
                          const isDisabled = cameraSectionLockedByUgc || isLuxuryIncompatible;
                          return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                              if (isDisabled) return;
                              updateValue('productProminence', option.value);
                              markSectionTouched('camera');
                            }}
                            className={`${getTogglePillClass(values.productProminence === option.value)} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                            title={isLuxuryIncompatible ? 'Not compatible with Luxury identity.' : undefined}
                            disabled={isDisabled}
                          >
                            {option.label}
                          </button>
                          );
                        })}
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
                        {CAMERA_ANGLE_OPTIONS.map(option => {
                          const isLuxuryIncompatible =
                            isLuxuryIntent &&
                            isLifestyleCompatibilityActive &&
                            !luxuryAngleAllowed.has(option);
                          const isDisabled = cameraSectionLockedByUgc || isLuxuryIncompatible;
                          return (
                          <button
                            key={option}
                            type="button"
                            onClick={() => {
                              if (isDisabled) return;
                              updateValue('cameraAngle', option);
                              markSectionTouched('camera');
                            }}
                            className={`${getTogglePillClass(values.cameraAngle === option)} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                            title={isLuxuryIncompatible ? 'Not compatible with Luxury identity.' : undefined}
                            disabled={isDisabled}
                          >
                            {option}
                          </button>
                          );
                        })}
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
                </AccordionSection>
            }
            {/* BUNDLES SYSTEM - STRICTLY ISOLATED */}
            {/* Bundles are enabled ONLY when multiple products are uploaded. */}
            {/* Bundles control product grouping only. */}
            {/* Bundles must never affect modes, composition, or human presence. */}
            {
              isProductMode && productCount > 1 && (
                <div id="bundles" className="mt-6">
                  <div className="rounded-2xl border border-gray-200 bg-white p-5 space-y-5">
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

                    <div className="space-y-5">
                      <div className="flex flex-col gap-2">
                        <label className="text-xs uppercase tracking-[0.3em] text-gray-500">Pick a bundle</label>
                        <select className="rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-600 focus:outline-none">
                          <option value="essentials_trio">Core Essentials Trio</option>
                          <option value="daily_duo">Daily Duo Stack</option>
                          <option value="launch_showcase">Launch Showcase Set</option>
                          <option value="hero_lineup">Complete Hero Lineup</option>
                        </select>
                      </div>

                      <div className="rounded-2xl border border-gray-200 bg-white p-5 space-y-3">
                        <p className="text-sm font-semibold text-gray-900">Core Essentials Trio</p>
                        <p className="text-xs text-gray-500">
                          {productStore.products.length > 1
                            ? `${productStore.products.length} products available for bundle preview.`
                            : 'Add another product to enable bundles.'}
                        </p>

                        <div className="flex flex-wrap gap-3">
                          {productStore.products.slice(0, 5).map((product, index) => (
                            <div key={product.id} className="w-28 text-center text-xs text-gray-600">
                              <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-gray-200">
                                {product.imageUrl ? (
                                  <img
                                    src={product.imageUrl}
                                    alt={product.name || `Product ${index + 1}`}
                                    className="absolute inset-0 h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="absolute inset-0 flex items-center justify-center bg-white text-xs font-semibold text-gray-500">
                                    Upload to fill
                                  </div>
                                )}
                              </div>
                              <p className="mt-1 text-[11px]">{product.name || `Product ${index + 1}`}</p>
                            </div>
                          ))}
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
          <AccordionSection
            icon={Building2}
            title="Hero"
            description="Neutral background + placement (Lifestyle)"
            isOpen={openAccordionId === 'ecommerce'}
            onToggle={() => toggleSection('ecommerce')}
            isActive={values.visualMode === 'hero'}
            variant="expert"
          >
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-900">Enable hero canvas</span>
                <SwitchToggle
                  checked={values.visualMode === 'hero'}
                  aria-label="Enable hero canvas"
                  onCheckedChange={(next) => {
                    setVisualMode(next ? 'hero' : 'default');
                    markSectionTouched('ecommerce');
                  }}
                />
              </div>

              {values.visualMode === 'hero' && (
                <>
                  <div className={SECTION_GROUP_CLASS}>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-indigo-600">SIDE PLACEMENT</p>
                      <p className="text-[11px] text-gray-500 mt-1">Subject anchor position</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {SIDE_PLACEMENT_OPTIONS.map(option => (
                          <TogglePillButton
                            key={option}
                            active={values.sidePlacement === option}
                            onClick={() => {
                              updateValue('sidePlacement', option);
                              markSectionTouched('ecommerce');
                            }}
                          >
                            {option}
                          </TogglePillButton>
                        ))}
                    </div>
                  </div>

                  <div className="space-y-5 rounded-2xl border border-gray-200 bg-white p-5">
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
                          <label className="relative h-9 w-9 shrink-0 cursor-pointer">
                            <div
                              className="h-full w-full rounded-full ring-1 ring-borderSubtle"
                              style={{ background: values.ecommerceBackgroundColor }}
                            />
                            <input
                              type="color"
                              value={values.ecommerceBackgroundColor}
                              onChange={(e) => {
                                updateValue('ecommerceBackgroundColor', e.target.value);
                                markSectionTouched('ecommerce');
                              }}
                              className={COLOR_PICKER_HIDDEN_INPUT_CLASS}
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
                        <div className="flex flex-wrap gap-3">
                          {[
                            { key: 'ecommerceGradientStart', label: 'Start color', value: values.ecommerceGradientStart },
                            { key: 'ecommerceGradientEnd', label: 'End color', value: values.ecommerceGradientEnd }
                          ].map(cfg => (
                            <div key={cfg.key} className="space-y-2">
                              <p className="text-[11px] uppercase tracking-wide text-gray-500">{cfg.label}</p>
                              <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-2.5 transition-colors hover:border-indigo-600">
                                <label className="relative h-9 w-9 shrink-0 cursor-pointer">
                                  <div
                                    className="h-full w-full rounded-full ring-1 ring-borderSubtle"
                                    style={{ background: cfg.value }}
                                  />
                                  <input
                                    type="color"
                                    value={cfg.value}
                                    onChange={(e) => handleGradientColorChange(cfg.key as 'ecommerceGradientStart' | 'ecommerceGradientEnd', e.target.value)}
                              className={COLOR_PICKER_HIDDEN_INPUT_CLASS}
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
          </AccordionSection>
        )
      }

      {
        isEnvironmentMode && (
          <AccordionSection
            icon={Edit3}
            title="Formulation Story"
            description="Align brand expert, research, and product goals"
            isOpen={openAccordionId === 'formulationStory'}
            onToggle={() => toggleSection('formulationStory')}
            isActive={values.visualMode === 'formulation'}
            variant="expert"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-900">Enable Formulation Story</span>
                <SwitchToggle
                  checked={values.visualMode === 'formulation'}
                  aria-label="Enable formulation story"
                  onCheckedChange={(next) => {
                    setVisualMode(next ? 'formulation' : 'default');
                    markSectionTouched('formulationStory');
                  }}
                />
              </div>

              {values.visualMode === 'formulation' && (
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
                          onClick={() => {
                            updateValue('expertRole', option.value);
                            // Keep custom role text only when Custom is selected.
                            if (option.value !== 'custom') {
                              updateValue('expertRoleCustom', '');
                            }
                            markSectionTouched('formulationStory');
                          }}
                          className={getTogglePillClass(values.expertRole === option.value)}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                    {values.expertRole === 'custom' && (
                      <input
                        type="text"
                        value={values.expertRoleCustom}
                        onChange={(e) => {
                          updateValue('expertRoleCustom', e.target.value);
                          markSectionTouched('formulationStory');
                        }}
                        className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-500"
                        placeholder="e.g., Board-Certified Toxicologist, Herbal Formulator, Lab Director"
                      />
                    )}
                  </div>

                  <div className={SECTION_GROUP_CLASS}>
                    <p className="text-xs uppercase tracking-wider text-indigo-600">Medical Attire</p>
                    <div className="flex flex-wrap gap-2">
                      {EXPERT_ATTIRE_OPTIONS.map(option => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => { updateValue('expertAttire', option.value); markSectionTouched('formulationStory'); }}
                          className={getTogglePillClass(values.expertAttire === option.value)}
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
                          className={getTogglePillClass(values.labVibe === option)}
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
                      <SwitchToggle
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
          </AccordionSection>
        )
      }

      {/* Output Format - LAST */}
      <AccordionSection
        icon={Layers}
        title={isEcommerceMode ? "10 / Output Format" : "Output Format"}
        description="Aspect ratio for the final image"
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
                <TogglePillButton
                  key={option}
                  active={values.aspectRatio === option}
                  onClick={() => { updateValue('aspectRatio', option); markSectionTouched('output'); }}
                >
                  {option}
                </TogglePillButton>
              )
            ))}
          </div>
        </div>
      </AccordionSection>

      {/* VALIADTION ERRORS (Hard Block) */}
      {
        isProductMode && !validationResult.valid && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 space-y-2 mt-4">
            <div className="flex items-center gap-2 text-red-700 font-semibold text-sm uppercase tracking-wide">
              <AlertTriangle className="w-5 h-5" />
              <span>Validation Errors</span>
            </div>
            <ul className="list-disc list-inside text-sm text-red-600 space-y-1">
              {(Array.isArray(validationResult.errors) ? validationResult.errors : []).map((err, i) => (
                <li key={i}>{typeof err === 'string' ? err : JSON.stringify(err)}</li>
              ))}
            </ul>
          </div>
        )
      }

      {/* No persistent warning blocks; show contextual errors only. */}

    </div >
  );
};

export default LifestyleStep3;
