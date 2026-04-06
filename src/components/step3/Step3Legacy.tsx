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
} from '../../../constants';
import type { UGCCaptureSituationId } from '../../lib/promptEngine/ugcCaptureSituation';
import EcommerceStep3, { type EcommerceGenerationSettings, type EcommerceSlotGenerationMeta } from '../EcommerceStep3';
import type { EcommerceSlotKey, EcommerceSlotsConfig } from '@/lib/ecommerceOverlay/types';
import { Chip } from '../ui/Chip';
import { AccordionSection } from '../ui/AccordionSection';
import { TogglePillButton, getTogglePillClass } from '../ui/TogglePillButton';
import { SwitchToggle } from '../ui/SwitchToggle';
import ChipSelectGroup from '../ChipSelectGroup';
import { useProductStudioStore, PREBUILT_BUNDLES, BRAND_PRESETS } from '@/lib/productStudio/store';
import type { ProductStudioState, CameraAngle, CameraDistance, CameraRotation, CameraFraming, CreativeTheme, PaletteSource, PropDensity, BlankSpaceSide, EnvironmentMacro, Lighting, ProductType, ProductPlacement, MicroPlace, CompositionMode, SurfaceBase, ProductScale, ProductSpacing, LightStyle, NegativeSpace, IngredientStackLayout, ProductStateMotion, PhotoMode, VisualStyle, OutputQualityProfile, IndustryProfile } from '@/lib/productStudio/types';
import { validateProductStudioState } from '@/lib/productStudio/validator';
import { getPlacementOptionsForContext, resolvePlacement } from '@/lib/productStudio/placementResolver';
import { resolvePhysicsCoherence } from '@/lib/productStudio/physicsCoherenceResolver';
import { normalizeOption } from '../../system/normalizeOptions';
import { PHOTO_MODE_SCHEMAS } from '@/lib/productStudio/photoModeSchema';
import { VISUAL_STYLE_SCHEMAS } from '@/lib/productStudio/visualStyleSchema';
import type { EnvironmentPhotoModeSchema } from '@/lib/productStudio/types';
import {
  WINE_ENVIRONMENT_PRESETS,
  isWinePrestigeMode,
} from '@/lib/productStudio/winePrestige';
import { industryRules } from '@/lib/productStudio/industryRules';
import { resolveCoffeeIndustryIntent } from '@/lib/productStudio/resolveCoffeeIntent';
import { getResolvedAllowedInteractions, getResolvedAllowedMotions } from '@/lib/productStudio/capabilityResolver';
import { applyIndustryProfileSoft } from '@/lib/productStudio/applyIndustryProfileSoft';
import { industryModuleRegistry } from '@/components/industry-modules/industryModuleRegistry';
import { resetIndustryFields } from '@/utils/resetIndustryFields';
import StudioStep3Layout from './StudioStep3';
import LifestyleStep3Layout from './LifestyleStep3';
import CreativeDirectionBlock from './blocks/studio/CreativeDirectionBlock';
import PhysicalPresenceBlock from './blocks/studio/PhysicalPresenceBlock';
import MotionInteractionBlock from './blocks/studio/MotionInteractionBlock';
import WorldAtmosphereBlock from './blocks/studio/WorldAtmosphereBlock';
import ProductCharacterBlock from './blocks/studio/ProductCharacterBlock';
import CinematographyBlock from './blocks/studio/CinematographyBlock';
import CommerceLayerBlock from './blocks/studio/CommerceLayerBlock';
import StudioOutputBlock from './blocks/studio/OutputBlock';
import MoodBlock from './blocks/lifestyle/MoodBlock';
import WorldBlock from './blocks/lifestyle/WorldBlock';
import HumanContextBlock from './blocks/lifestyle/HumanContextBlock';
import CaptureBlock from './blocks/lifestyle/CaptureBlock';
import LifestyleOutputBlock from './blocks/lifestyle/OutputBlock';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

function InterpretationNote({ message }: { message: string }) {
  return (
    <div className="mt-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-[11px] text-gray-600">
      <div className="text-xs font-black text-gray-500">
        Interpretation Note
      </div>
      <div>{message}</div>
    </div>
  );
}

function WineBottleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 3h4" />
      <path d="M11 3v4l-2 3v8a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-8l-2-3V3" />
      <path d="M9 13h6" />
    </svg>
  );
}

type IndustryChipConfig = {
  value: IndustryProfile;
  label: string;
  subtitle: string;
  description: string;
  activeClassName: string;
  inactiveClassName: string;
  subtitleClassName: string;
  icon: React.ReactNode;
};

const INDUSTRY_CHIP_CONFIGS: IndustryChipConfig[] = [
  {
    value: 'supplements',
    label: 'Supplements',
    subtitle: 'Clinical and conversion-safe',
    description: 'Clinical, conversion-focused, product-safe controls',
    activeClassName: '!border-emerald-600 !bg-emerald-600 !text-white',
    inactiveClassName:
      '!border-emerald-200 !bg-emerald-50/70 !text-emerald-800 hover:!border-emerald-300 dark:!border-emerald-500/30 dark:!bg-emerald-500/10 dark:!text-emerald-200',
    subtitleClassName: 'text-emerald-700 dark:text-emerald-200/80',
    icon: <Box className="h-4 w-4 shrink-0" />,
  },
  {
    value: 'wine',
    label: 'Wine Prestige',
    subtitle: 'Pours, cellars, and bottle scenes',
    description: 'Bottle setups, pours, cellar scenes, prestige styling',
    activeClassName: '!border-rose-700 !bg-rose-700 !text-white',
    inactiveClassName:
      '!border-rose-200 !bg-rose-50/70 !text-rose-900 hover:!border-rose-300 dark:!border-rose-500/30 dark:!bg-rose-500/10 dark:!text-rose-200',
    subtitleClassName: 'text-rose-800 dark:text-rose-200/80',
    icon: <WineBottleIcon />,
  },
  {
    value: 'coffee',
    label: 'Coffee Ritual',
    subtitle: 'Steam, rituals, and warm styling',
    description: 'Ritual scenes, steam, pours, and warm surfaces',
    activeClassName: '!border-amber-700 !bg-amber-700 !text-white',
    inactiveClassName:
      '!border-amber-200 !bg-amber-50/70 !text-amber-900 hover:!border-amber-300 dark:!border-amber-500/30 dark:!bg-amber-500/10 dark:!text-amber-200',
    subtitleClassName: 'text-amber-800 dark:text-amber-200/80',
    icon: <Coffee className="h-4 w-4 shrink-0" />,
  },
];

const SETTINGS_CARD_CLASS = 'rounded-2xl border border-gray-200 bg-white p-5 space-y-5';

function PropertySettingsCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className={SETTINGS_CARD_CLASS}>
      <div>
        <p className="text-xs font-black text-[var(--lifestyle-accent)] uppercase mb-2">
          {title}
        </p>
        <p className="text-[11px] text-gray-500 mb-4">{description}</p>
      </div>
      {children}
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
    <div className={SETTINGS_CARD_CLASS}>
      <div>
        <p className="text-xs font-black text-[var(--lifestyle-accent)] uppercase mb-2">
          {schema.label} Atmosphere
        </p>
        <p className="text-[11px] text-gray-500 mb-4">{schema.description}</p>
      </div>

      {subOptions.map((option) => {
        const currentSelection = dynamicConfig[option.key] || option.values[0];

        return (
          <div key={option.key} className="space-y-2">
            <p className="text-xs text-gray-500 font-semibold">
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
          <p className="text-xs text-gray-500 font-semibold">
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
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-[12px] text-gray-700 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-100"
          />
          <p className="text-xs text-gray-500">
            Adds optional custom ingredients/props on top of the mode defaults.
          </p>
        </div>
      )}

      {schema.constraints.length > 0 && (
        <div className="mt-4 pt-4 ">
          <p className="text-[9px] uppercase text-gray-400 mb-2">
            AI Constraints
          </p>
          <ul className="space-y-1">
            {schema.constraints.map((c, i) => (
              <li key={i} className="text-xs text-gray-500 flex items-start gap-2">
                <span className="text-gray-400 mt-0.5">•</span>
                {c}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

const PHOTO_MODE_WITH_MANUAL_SETTINGS = new Set<PhotoMode>([
  'Hero Landing Page',
  'Ingredient Stack',
  'Ingredient Flat Lay',
  'Acrylic Blocks',
  'Splash Shot',
  'Foam & Texture',
  'Routine Carousel',
]);

function hasRenderableSchemaSettings(schema?: EnvironmentPhotoModeSchema | null): boolean {
  if (!schema) return false;
  return schema.subOptions.length > 0 || schema.constraints.length > 0;
}

const LUXURY_UI_ALLOWED_CAMERA_TYPES = ['DSLR / mirrorless camera', 'Medium format studio camera'] as const;
const LUXURY_UI_ALLOWED_SHOT_TYPES = ['Close', 'Medium'] as const;
const LUXURY_UI_ALLOWED_COMPOSITIONS = ['product-first', 'balanced'] as const;
const LUXURY_UI_ALLOWED_ANGLES = ['Eye level', 'Slightly above eye level', 'Slightly below eye level'] as const;

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
export interface LifestyleStep3Props {
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

const LIFESTYLE_STUDIO_LEAK_KEYS = new Set<string>([
  'handsHolding',
  'productStudioInteraction',
  'productType',
  'productTypeCustom',
  'productPackaging',
  'productScale',
  'productCount',
  'productGrouping',
  'productCreativityLevel',
  'productCreativeTheme',
  'productPaletteSource',
  'productPaletteA',
  'productPaletteB',
  'productPaletteC',
  'productPropDensity',
  'productPropsSelected',
  'productCameraSystem',
  'productCameraAngle',
  'productCameraDistance',
  'productCameraRotation',
  'productFramingGuide',
  'productUseCase',
  'productLayout',
  'productHeadline',
  'productSubheadline',
  'productBullets',
  'productBulletIcons',
  'preserveEnvironment',
  'backgroundBlur',
  'ecommerceBackgroundColor',
  'ecommerceBackgroundMode',
  'ecommerceGradientStart',
  'ecommerceGradientEnd',
  'ecommerceGradientAngle',
]);

const getLifestyleStudioLeakKeys = (payload: Step3Values): string[] =>
  Object.keys(payload).filter((key) => {
    if (!key.startsWith('studio') && !LIFESTYLE_STUDIO_LEAK_KEYS.has(key)) return false;
    const value = (payload as unknown as Record<string, unknown>)[key];
    if (value === undefined || value === null) return false;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'boolean') return value === true;
    if (typeof value === 'number') return value !== 0;
    return String(value).trim().length > 0;
  });

const stripLifestyleStudioLeakKeys = (payload: Step3Values): Step3Values =>
  Object.fromEntries(
    Object.entries(payload).filter(
      ([key]) => !key.startsWith('studio') && !LIFESTYLE_STUDIO_LEAK_KEYS.has(key)
    )
  ) as Step3Values;

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
  gender: 'Female' | 'Male' | 'Mix' | 'Trans' | 'Non-binary' | 'Trans woman' | 'Trans man' | 'Gender non-conforming';
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

  // Lighting
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

const resolveStep3SceneType = (
  rawSceneType: Step3Values['sceneType'],
  normalizedCreationMode: ReturnType<typeof normalizeCreationModeForEmit>
): 'studio-branding' | 'lifestyle-real' => {
  if (rawSceneType === 'studio-branding' || rawSceneType === 'lifestyle-real') {
    return rawSceneType;
  }

  const inferredLifestyleScene =
    normalizedCreationMode === 'aesthetic' ||
    normalizedCreationMode === 'lifestyle' ||
    normalizedCreationMode === 'ugc';

  return inferredLifestyleScene ? 'lifestyle-real' : 'studio-branding';
};

const resolveStep3ContentStyle = (
  visualMode: Step3Values['visualMode'],
  sceneIntent: Step3Values['sceneIntent']
): 'ugc' | 'product' | 'brand' => {
  if (visualMode === 'ugc') {
    return 'ugc';
  }
  if (sceneIntent === 'ecommerce') {
    return 'product';
  }
  return 'brand';
};

const resolveStep3PersonIncluded = (noPerson: Step3Values['noPerson']): boolean => noPerson === false;

const resolveStep3EmitState = (
  values: Step3Values,
  normalizedCreationMode: ReturnType<typeof normalizeCreationModeForEmit>
) => {
  const sceneType = resolveStep3SceneType(values.sceneType, normalizedCreationMode);
  const contentStyle = resolveStep3ContentStyle(values.visualMode, values.sceneIntent);
  const personIncluded = resolveStep3PersonIncluded(values.noPerson);
  const isLuxuryVisualIntent = (values.visualIntent ?? 'editorial') === 'luxury';
  const forceNoMessiness =
    sceneType === 'lifestyle-real' &&
    (contentStyle === 'brand' || isLuxuryVisualIntent) &&
    values.ugcRealMode !== true;
  const forceHandsHolding =
    sceneType === 'lifestyle-real' &&
    values.productInteraction === 'holding' &&
    values.ugcRealMode !== true;

  return {
    sceneType,
    contentStyle,
    personIncluded,
    visualIntent: sceneType === 'lifestyle-real' ? (values.visualIntent ?? 'editorial') : undefined,
    allowMessiness: forceNoMessiness ? false : values.allowMessiness,
    handsHolding: forceHandsHolding,
  };
};

const mapStudioProductTypeToStep3Label = (kind: string | undefined): Step3Values['productType'] => {
  switch (String(kind || '').trim()) {
    case 'capsules':
      return 'Capsules';
    case 'gummies':
      return 'Gummies';
    case 'drops':
      return 'Drops';
    case 'powder':
      return 'Powder';
    case 'skincare':
      return 'Skincare';
    case 'device':
      return 'Device';
    case 'custom':
      return 'Custom';
    default:
      return 'Capsules';
  }
};

const mapStudioPackagingToStep3Label = (mode: string | undefined): Step3Values['productPackaging'] =>
  String(mode || '').trim() === 'with-box' ? 'With box' : 'Without box';

const mapStudioScaleToStep3Label = (scale: string | undefined): Step3Values['productScale'] => {
  switch (String(scale || '').trim()) {
    case 'small-handheld':
      return 'Small handheld';
    case 'large-object':
      return 'Large object';
    default:
      return 'Medium tabletop';
  }
};

const WINE_LIFESTYLE_PHOTO_MODES: PhotoMode[] = [
  'Social Table Served',
  'Outdoor Toast',
  'Hosting Pour',
  'Dinner Pairing',
  'Picnic Gathering',
  'Celebration Chill',
];

const resolveStep3UiMode = (
  sceneType: 'studio-branding' | 'lifestyle-real',
  isEcommerceMode: boolean
): { uiActiveEngine: 'studio' | 'lifestyle'; mode: 'studio' | 'lifestyle' } => {
  const uiActiveEngine: 'studio' | 'lifestyle' = sceneType === 'studio-branding' ? 'studio' : 'lifestyle';
  return {
    uiActiveEngine,
    mode: isEcommerceMode || uiActiveEngine === 'studio' ? 'studio' : 'lifestyle',
  };
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
  'text-xs font-medium text-gray-500 font-semibold leading-none';
const COLOR_PICKER_BUTTON_CLASS =
  'h-9 w-9 rounded-full border bg-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2';
const COLOR_PICKER_SWATCH_VISUAL_CLASS =
  'h-9 w-9 rounded-full border border-gray-200 bg-white transition-colors';
const COLOR_PICKER_HIDDEN_INPUT_CLASS =
  'absolute inset-0 cursor-pointer opacity-0';

// EXPANDED GENDER OPTIONS - Exact spec (6 options)
const GENDER_OPTIONS = ['Female', 'Male', 'Mix', 'Trans', 'Non-binary', 'Gender non-conforming'];

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

// Per-PhotoMode interaction allowlist for selective UI gating.
// Returns the set of interaction values that are ENABLED for the given photo mode.
// Returns null when no per-mode restriction applies (all options enabled).
function getPhotoModeInteractionAllowlist(photoMode: string): string[] | null {
  switch (photoMode) {
    case 'Ingredient Stack':
      // All interactions EXCEPT two-hand-hold
      return [
        'none',
        'passive-presence',
        'cropped-hand',
        'supported-hold',
        'holding',
        'presenting',
        'framed-presentation',
        'applying-opening',
        'capsule-display',
        'resting-interaction',
      ];
    case 'Ingredient Flat Lay':
      // Minimal set only
      return ['none', 'passive-presence', 'cropped-hand', 'resting-interaction'];
    default:
      return null; // no restriction
  }
}

// Product Interaction - universal-safe deterministic modes
const INTERACTION_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'holding', label: 'Holding product' },
  { value: 'showing', label: 'Showing to camera' },
  { value: 'foreground', label: 'Product in foreground' },
  { value: 'beside', label: 'Beside subject' },
  { value: 'background', label: 'Subtle background presence' },
];

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

const VISUAL_INTENT_TOOLTIPS: Record<string, string> = {
  ugc: 'Raw, spontaneous, handheld aesthetic with natural imperfections.',
  editorial: 'Stylized lifestyle scene with controlled framing and lighting.',
  brand: 'Commercial composition prioritizing product clarity and structure.',
  luxury: 'Refined framing, disciplined lighting, premium visual hierarchy.',
};

const PERSON_COUNT_TOOLTIPS: Record<string, string> = {
  single: 'One primary subject interacting with the product.',
  couple: 'Two coordinated subjects sharing the scene.',
  group: 'Three or more subjects. Composition may auto-adjust.',
};

const EYE_DIRECTION_TOOLTIPS: Record<string, string> = {
  'Looking at camera': 'Direct engagement creating intimacy and confidence.',
  'Looking at product': 'Focus shifts toward product interaction.',
  'Looking away naturally': 'Candid, lifestyle realism.',
};

const GENDER_TOOLTIPS: Record<string, string> = {
  Female: 'Female-presenting subject.',
  Male: 'Male-presenting subject.',
  Mix: 'Mixed-gender group. Only available when Person count is Group.',
};

const ETHNICITY_TOOLTIPS: Record<string, string> = {
  'Non-specific': 'Model ethnicity left neutral.',
  'White / European descent': 'Subject with European ancestry traits.',
  'Black / African descent': 'Subject with African ancestry traits.',
  'Latino / Hispanic': 'Subject with Latino heritage traits.',
  'Asian': 'Subject with East or Southeast Asian traits.',
  'Middle Eastern': 'Subject with Middle Eastern ancestry traits.',
  'South Asian': 'Subject with South Asian ancestry traits.',
  'Mixed': 'Mixed-ethnicity casting. Use this for diverse group composition.',
};

const CAMERA_TYPE_TOOLTIPS: Record<string, string> = {
  'DSLR / mirrorless camera': 'Professional camera with shallow depth of field and natural bokeh.',
  'Cinema camera rig': 'Filmic capture with cinematic tone and stabilized framing.',
  'Medium format studio camera': 'Ultra sharp detail and high tonal precision.',
};

const SHOT_TYPE_TOOLTIPS: Record<string, string> = {
  'Extreme close-up': 'Focus on texture and fine detail.',
  Close: 'Product and facial emphasis.',
  Medium: 'Balanced subject and environment framing.',
  Wide: 'Context-first framing.',
  'Full body': 'Complete subject visibility.',
};

const COMPOSITION_TOOLTIPS: Record<string, string> = {
  'product-first': 'Product dominates visual hierarchy.',
  balanced: 'Equal visual weight between subject and product.',
  'fifty-fifty': 'Symmetrical distribution of visual space.',
  'model-first': 'Subject dominates narrative focus.',
};

const CAMERA_ANGLE_TOOLTIPS: Record<string, string> = {
  'Eye level': 'Neutral, realistic perspective.',
  'Slightly above eye level': 'Soft authority and elegance.',
  'Slightly below eye level': 'Subtle empowerment framing.',
  'High angle': 'Emphasizes vulnerability or environment.',
  'Low angle': 'Creates dominance and strength.',
  'Top-down': 'Flat lay or graphic structural view.',
  'Bottom-up': 'Dramatic upward perspective.',
};

const LIGHTING_STYLE_TOOLTIPS: Record<string, string> = {
  'Natural Light': 'Soft window-style illumination.',
  'Sunny Day': 'High contrast direct sunlight.',
  'Golden Hour': 'Warm cinematic sunset glow.',
  Overcast: 'Soft diffused shadow lighting.',
  'Cozy Indoors': 'Warm ambient interior tone.',
  'Ring Light': 'Frontal vlogger-style lighting.',
  'Mood Lighting': 'Low-key dramatic shadows.',
  'Night Mode': 'Dark scene with artificial highlights.',
  'Flash Photo': 'Direct on-camera flash effect.',
};

const TIME_OF_DAY_TOOLTIPS: Record<string, string> = {
  Morning: 'Soft early daylight.',
  Midday: 'Bright overhead light.',
  Evening: 'Warm fading daylight.',
  Night: 'Low natural light, artificial illumination.',
};

const ENVIRONMENT_TOOLTIPS: Record<string, string> = {
  Kitchen: 'Domestic cooking environment.',
  'Living Room': 'Comfort-driven everyday setting.',
  Bedroom: 'Private interior setting.',
  Workspace: 'Productivity-focused environment.',
  'Urban Exterior': 'City setting with architectural depth.',
  'Natural Exterior': 'Outdoor landscape setting.',
  'Backyard / Patio': 'Casual outdoor relaxation space.',
  'Street Corner': 'Urban lifestyle context.',
  'Home Gym': 'Fitness and training setting.',
  Bathroom: 'Personal care interior.',
  Hallway: 'Transitional indoor space.',
  'Balcony / Indoor Terrace': 'Semi-outdoor lifestyle space.',
  'Parking Lot': 'Functional urban environment.',
};

const ASPECT_RATIO_TOOLTIPS: Record<string, string> = {
  '1:1 (Square)': 'Balanced square format for feeds.',
  '4:5 (Portrait)': 'Vertical format optimized for social posts.',
  '9:16 (Story)': 'Full vertical story format.',
  '16:9 (Landscape)': 'Wide cinematic frame.',
};

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
  const hasVisibleVisualStyleSettings = useCallback(
    (mode?: VisualStyle | null) => Boolean(mode && hasRenderableSchemaSettings(VISUAL_STYLE_SCHEMAS[mode])),
    []
  );
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
  // Removed duplicate isCreatorPro declaration here, managed near top.
  const initialValues: Step3Values = {
    sceneType: initialSceneIntent === 'ecommerce' ? 'studio-branding' : 'lifestyle-real',
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

    // Lighting - time of day kept only as legacy data, not active UI authority
    timeOfDay: 'Afternoon',
    lightingStyle: 'Natural Light',

    // Camera
    shotType: 'Medium',
    cameraType: 'DSLR / mirrorless camera',
    cameraAngle: 'Eye level',
    framing: 'Rule of thirds',
    productProminence: 'product-first',

    // Product Interaction
    productInteraction: 'holding',
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
  const [industryAutoAdjustNote, setIndustryAutoAdjustNote] = useState<string | null>(null);

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
  const industryProfile: IndustryProfile = productStore.industryProfile;
  const winePrestigeModeActive = isWinePrestigeMode(productStore as ProductStudioState);
  const wineIndustryActive = industryProfile === 'wine' || winePrestigeModeActive;
  const wineLifestylePhotoModeActive =
    wineIndustryActive && WINE_LIFESTYLE_PHOTO_MODES.includes(productStore.photoMode as PhotoMode);
  const wineLifestyleHandsRequired = productStore.photoMode === 'Hosting Pour';
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
    const autoAdjustments: string[] = [];

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

    productStore.setIndustryProfile(nextProfile);
    resetIndustryFields(nextProfile, productStore);

    if (softState.visualIntent && softState.visualIntent !== productStore.visualIntent) {
      productStore.setVisualIntent(softState.visualIntent as ProductStudioState['visualIntent']);
      autoAdjustments.push(`intent: ${softState.visualIntent}`);
    }
    if (
      softState.lighting &&
      softState.lighting !== productStore.lighting &&
      allowedStudioLightingValues.includes(softState.lighting as ProductStudioState['lighting'])
    ) {
      productStore.setLighting(softState.lighting as ProductStudioState['lighting']);
      autoAdjustments.push(`lighting: ${softState.lighting}`);
    }
    if (softState.composition && softState.composition !== productStore.composition) {
      productStore.setComposition(softState.composition as ProductStudioState['composition']);
      autoAdjustments.push(`composition: ${softState.composition}`);
    }

    // ── Photo mode stale-mode guard on industry switch ─────────────────────
    // When switching TO wine: clear any supplement-only modes (Macro Dew Label, etc.)
    // When switching FROM wine: clear any wine-only modes (Wine Macro Label, Bottle+Glass, etc.)
    const WINE_ONLY_MODES: PhotoMode[] = [
      'Wine Macro Label',
      'Bottle + Glass',
      'Bottle + Glass Pour',
      'Hands Pouring Wine',
      'Wine Lineup Comparison',
      'Editorial Bottle Tabletop',
      'Bottle In Hand Cutout',
      'Rose Tasting Table',
      'Editorial Table',
      'Winery Scene',
    ];
    const SUPPLEMENT_ONLY_MODES: PhotoMode[] = ['Macro Dew Label', 'Ingredient Stack', 'Ingredient Flat Lay'];
    const currentPhotoMode = productStore.photoMode as PhotoMode;
    if (nextProfile === 'wine' && SUPPLEMENT_ONLY_MODES.includes(currentPhotoMode)) {
      productStore.setPhotoMode('Hero Landing Page');
      autoAdjustments.push('shot type: Hero Landing Page');
    } else if (nextProfile !== 'wine' && WINE_ONLY_MODES.includes(currentPhotoMode)) {
      productStore.setPhotoMode('Hero Landing Page');
      autoAdjustments.push('shot type: Hero Landing Page');
    } else if (softState.photoMode && softState.photoMode !== productStore.photoMode) {
      productStore.setPhotoMode(softState.photoMode as ProductStudioState['photoMode']);
      autoAdjustments.push(`shot type: ${softState.photoMode}`);
    }
    if (softState.wineLightingTone && softState.wineLightingTone !== productStore.wineLightingTone) {
      productStore.setWineLightingTone(softState.wineLightingTone as ProductStudioState['wineLightingTone']);
      autoAdjustments.push(`wine lighting: ${softState.wineLightingTone}`);
    }
    if (typeof softState.rotation === 'number' && softState.rotation !== productStore.rotation) {
      productStore.setRotation(softState.rotation as ProductStudioState['rotation']);
      autoAdjustments.push(`rotation: ${softState.rotation}°`);
    }
    if (
      softState.cameraUiRotationLabel &&
      softState.cameraUiRotationLabel !== productStore.cameraUiRotationLabel
    ) {
      productStore.setCameraUiLabels({ rotation: softState.cameraUiRotationLabel });
    }
    setIndustryAutoAdjustNote(
      autoAdjustments.length > 0
        ? `Applied automatically for ${nextProfile}: ${autoAdjustments.join(' · ')}`
        : `Switched to ${nextProfile}. No additional defaults were needed.`
    );
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

  useEffect(() => {
    if (!isProductMode) return;
    if (productStore.sceneType !== 'studio-branding') {
      productStore.setSceneType('studio-branding');
    }
    if (productStore.mode !== 'studio') {
      productStore.setMode('studio');
    }
  }, [isProductMode, productStore]);

  // Derived state for Environment (Strict Rule: Studio = No Environment, Lifestyle = Always Environment)
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
      return ['#F9FAFB', '#F3F4F6', '#E5E7EB'];
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
          mappedValue = value; // Rotation values are already correct: 0 | 5 | 10 | 15
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
      if (key === 'sceneType') {
        console.log('[SCENETYPE UPDATE]', {
          sceneType: newValues.sceneType,
          isStudioEngine: newValues.sceneType === 'studio-branding',
          sceneIntent: newValues.sceneIntent,
          sourceFunction: 'Step3Legacy.updateValue',
        });
      }

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
    if (!isProductMode) return;
    if (!wineLifestyleHandsRequired) return;
    setValues(prev => {
      const next: Step3Values = {
        ...prev,
        handsHolding: true,
        productInteraction: 'holding',
      };
      enforceSingleSelectLayers(next);
      return next;
    });
  }, [isProductMode, wineLifestyleHandsRequired]);

  useEffect(() => {
    const normalizedCreationMode = normalizeCreationModeForEmit(values.creationMode);
    // ENGINE ISOLATION: sceneType is derived EXCLUSIVELY from values.sceneType.
    // productStore.sceneType is NEVER consulted here — it belongs to the V2 studio engine only.
    // If values.sceneType is absent, infer from the active creation flow instead of falling back to studio.
    console.log('[STEP3 EMIT SOURCE]', {
      fromValues: values.sceneType,
      fromStore: productStore.sceneType,
    });
    const emitState = resolveStep3EmitState(values, normalizedCreationMode);
    const sceneType = emitState.sceneType;
    console.log('[PHASE3 sceneType RESOLUTION]', {
      resolvedSceneType: sceneType,
      source:
        values.sceneType === 'studio-branding' || values.sceneType === 'lifestyle-real'
          ? 'values.sceneType only'
          : 'inferred from normalizedCreationMode',
    });
    const rawPayload: Step3Values = {
      ...values,
      creationMode: normalizedCreationMode,
      sceneType: emitState.sceneType,
      contentStyle: emitState.contentStyle,
      visualIntent: emitState.visualIntent,
      allowMessiness: emitState.allowMessiness,
      handsHolding: emitState.handsHolding,
      personIncluded: emitState.personIncluded,
    };
    let payload: Step3Values = rawPayload;

    if (isProductMode) {
      payload = {
        ...payload,
        creationMode: 'studio',
        creationIntent: 'product',
        sceneType: 'studio-branding',
        contentStyle: 'product',
        productType: mapStudioProductTypeToStep3Label(productStore.definition?.physical?.kind),
        productPackaging: mapStudioPackagingToStep3Label(productStore.packagingMode),
        productScale: mapStudioScaleToStep3Label(productStore.physicalScaleLabel),
        productCameraSystem: productStore.cameraUiSystemLabel || payload.productCameraSystem,
        productCameraAngle: productStore.cameraUiAngleLabel || payload.productCameraAngle,
        productCameraDistance: productStore.cameraUiDistanceLabel || payload.productCameraDistance,
        productCameraRotation: productStore.rotation,
        productFramingGuide: productStore.cameraUiFramingLabel || payload.productFramingGuide,
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
      } as Step3Values;
    }

    if (payload.sceneType === 'lifestyle-real') {
      const leakedStudioKeys = getLifestyleStudioLeakKeys(payload);
      if (leakedStudioKeys.length > 0) {
        console.warn('Studio state leak detected', {
          sceneType: payload.sceneType,
          leakedStudioKeys,
          sourceFunction: 'Step3Legacy.emitPayload',
        });
      }
      payload = {
        ...stripLifestyleStudioLeakKeys(payload),
        sceneType: 'lifestyle-real',
        sceneIntent: 'environment',
        creationIntent: payload.creationIntent,
        contentStyle: 'brand',
        visualIntent: payload.visualIntent ?? 'editorial',
        noPerson: payload.noPerson,
        personIncluded: payload.personIncluded,
        allowMessiness: payload.allowMessiness,
        handsHolding: emitState.handsHolding,
      } as Step3Values;
    }

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
  }, [values, onValuesChange, isProductMode, wineLifestyleHandsRequired, wineLifestylePhotoModeActive, productStore]);

  // PHASE 3.5: Sync productStore values to Step3Values for prompt injection
  useEffect(() => {
    if (!isProductMode) return;
    setValues(prev => {
      const next: Step3Values = {
        ...prev,
        productType: mapStudioProductTypeToStep3Label(productStore.definition?.physical?.kind),
        productPackaging: mapStudioPackagingToStep3Label(productStore.packagingMode),
        productScale: mapStudioScaleToStep3Label(productStore.physicalScaleLabel),
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
      };

      next.sceneType = 'studio-branding';
      next.sceneIntent = 'ecommerce';
      next.creationIntent = 'product';
      next.creationMode = 'studio';
      next.noPerson = true;
      next.personIncluded = false;
      next.handsHolding = wineLifestyleHandsRequired;
      next.productInteraction = wineLifestyleHandsRequired ? 'holding' : next.productInteraction;

      enforceSingleSelectLayers(next);
      return next;
    });
  }, [
    productStore.definition?.physical?.kind,
    productStore.packagingMode,
    productStore.physicalScaleLabel,
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
    isProductMode,
    wineLifestylePhotoModeActive,
    wineLifestyleHandsRequired,
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
  const isUGCMode = values.ugcRealMode === true;
  const hasUploadedProductAsset = productCount > 0;
  const visualIntentMode = (values.visualIntent ?? 'editorial');
  const isLuxuryIntent = visualIntentMode === 'luxury';
  const isEditorialIntent = visualIntentMode === 'editorial' && !isUGCMode;
  const isBrandIntent = visualIntentMode === 'brand' && !isUGCMode;
  const uiCreationMode = normalizeCreationModeForEmit(values.creationMode);
  const uiSceneType = resolveStep3SceneType(values.sceneType, uiCreationMode);
  const uiContentStyle = resolveStep3ContentStyle(values.visualMode, values.sceneIntent);
  const { uiActiveEngine, mode } = resolveStep3UiMode(uiSceneType, isEcommerceMode);
  const showVisualIntentControl =
    uiSceneType === 'lifestyle-real' && uiActiveEngine === 'lifestyle' && uiContentStyle !== 'product';
  const isLifestyleCompatibilityActive = uiSceneType === 'lifestyle-real' && values.ugcRealMode !== true;
  const cameraSectionLockedByUgc = isUGCMode;
  const accentTextClass = 'text-[var(--lifestyle-accent)]';
  // uiActiveEngine === 'studio' covers the isProductMode=false + studio-branding scene case,
  // ensuring the studio UI block (and its photo mode chips) always renders when the V2 engine is active.

  useEffect(() => {
    if (hasUploadedProductAsset) return;
    if (values.productInteraction === 'background') return;
    updateValue('productInteraction', 'background');
  }, [hasUploadedProductAsset, values.productInteraction, updateValue]);

  useEffect(() => {
    if (uiSceneType !== 'lifestyle-real') return;

    setValues((prev) => {
      const next: Step3Values = { ...prev };
      const intent = (next.visualIntent ?? 'editorial') as 'ugc' | 'editorial' | 'brand' | 'luxury';
      const currentComposition = String(next.productProminence || '').toLowerCase();
      const isProductFirst = currentComposition === 'product-first' || currentComposition === 'product first';

      if (next.ugcRealMode === true || intent === 'ugc') {
        if (next.personCount === 'group') {
          next.personCount = 'single';
          next.editSecondaryPerson = false;
        }
        const changed = next.personCount !== prev.personCount || next.editSecondaryPerson !== prev.editSecondaryPerson;
        return changed ? next : prev;
      }

      next.noPerson = false;
      next.personIncluded = true;

      if (intent === 'brand') {
        if (['Low angle', 'High angle', 'Top-down', 'Bottom-up'].includes(next.cameraAngle)) {
          next.cameraAngle = 'Eye level';
        }
        if (isProductFirst && next.shotType === 'Full body') {
          next.productProminence = 'balanced';
        }
        if (next.cameraType === 'Medium format studio camera' && next.shotType === 'Wide') {
          next.cameraType = 'DSLR / mirrorless camera';
        }
        if (next.personCount === 'group' && next.productProminence === 'product-first') {
          next.productProminence = 'balanced';
        }
        if (next.personCount === 'group' && next.shotType === 'Close') {
          next.shotType = 'Medium';
        }
        if (next.shotType === 'Extreme close-up') {
          next.shotType = 'Medium';
        }
      }

      if (intent === 'luxury') {
        if (!LUXURY_UI_ALLOWED_CAMERA_TYPES.includes(next.cameraType as (typeof LUXURY_UI_ALLOWED_CAMERA_TYPES)[number])) {
          next.cameraType = 'DSLR / mirrorless camera';
        }
        if (!LUXURY_UI_ALLOWED_SHOT_TYPES.includes(next.shotType as (typeof LUXURY_UI_ALLOWED_SHOT_TYPES)[number])) {
          next.shotType = 'Medium';
        }
        if (!LUXURY_UI_ALLOWED_COMPOSITIONS.includes(next.productProminence as (typeof LUXURY_UI_ALLOWED_COMPOSITIONS)[number])) {
          next.productProminence = 'balanced';
        }
        if (!LUXURY_UI_ALLOWED_ANGLES.includes(next.cameraAngle as (typeof LUXURY_UI_ALLOWED_ANGLES)[number])) {
          next.cameraAngle = 'Eye level';
        }
        if (next.personCount === 'group') {
          next.productProminence = 'balanced';
          next.shotType = 'Medium';
          next.cameraAngle = 'Eye level';
        }
        if (next.personCount === 'couple' && next.productProminence === 'product-first') {
          next.productProminence = 'balanced';
        }
        next.allowMessiness = false;
        next.ugcRealMode = false;
        next.sceneOrderChaos = 'Controlled' as any;
      }

      if (next.personCount !== 'group' && next.gender === 'Mix') {
        next.gender = 'Female';
      }
      if (!(next.personCount === 'group' && next.gender === 'Mix') && next.ethnicity === 'Mixed') {
        next.ethnicity = 'Non-specific';
      }
      if (next.personCount === 'group' && next.gender === 'Mix') {
        next.ethnicity = 'Mixed';
      }

      const changed =
        next.personCount !== prev.personCount ||
        next.gender !== prev.gender ||
        next.ethnicity !== prev.ethnicity ||
        next.editSecondaryPerson !== prev.editSecondaryPerson ||
        next.noPerson !== prev.noPerson ||
        next.personIncluded !== prev.personIncluded ||
        next.shotType !== prev.shotType ||
        next.cameraAngle !== prev.cameraAngle ||
        next.cameraType !== prev.cameraType ||
        next.productProminence !== prev.productProminence ||
        next.allowMessiness !== prev.allowMessiness ||
        next.ugcRealMode !== prev.ugcRealMode ||
        next.sceneOrderChaos !== prev.sceneOrderChaos;

      return changed ? next : prev;
    });
  }, [
    uiSceneType,
    values.ugcRealMode,
    values.visualIntent,
    values.personCount,
    values.shotType,
    values.cameraAngle,
    values.cameraType,
    values.productProminence,
  ]);

  // Scene Intent Handler: Enable Ecommerce Mode
  const enableEcommerce = useCallback(() => {
    console.log('[SCENE INTENT CHANGE] ecommerce');
    setValues(prev => {
      const next: Step3Values = {
        ...prev,
        sceneType: 'studio-branding',
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
        sceneType: 'lifestyle-real',
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
    if (isProductMode) {
      if (values.sceneType !== 'studio-branding') {
        updateValue('sceneType', 'studio-branding');
      }
      return;
    }
    if (values.sceneIntent === 'ecommerce') {
      if (values.sceneType !== 'studio-branding') {
        updateValue('sceneType', 'studio-branding');
      }
      return;
    }
    if (values.sceneType !== 'lifestyle-real') {
      updateValue('sceneType', 'lifestyle-real');
    }
  }, [isProductMode, values.sceneIntent, values.sceneType, updateValue]);

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
    if (mode === 'Hero Landing Page') return p === 'surface';
    if (mode === 'Acrylic Blocks') return p === 'supported';
    if (mode === 'Splash Shot') return p === 'surface';
    if (mode === 'Underwater Split') return p === 'air';
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
    <div
      className={embedded ? 'w-full space-y-5' : 'w-full max-w-2xl mx-auto space-y-5 p-5'}
      style={
        {
          '--lifestyle-accent': '#4f46e5',
          '--studio-accent': '#4f46e5',
        } as React.CSSProperties
      }
    >
      {!embedded && (
        <div className="flex flex-col gap-1">
          <p className="text-xs font-semibold text-gray-500">Step 3</p>
          <h2 className="text-2xl text-gray-900">{isEcommerceMode ? 'Product Builder' : 'Scene Builder'}</h2>
        </div>
      )}

      {mode === 'studio' && (
        <StudioStep3Layout>
          <CreativeDirectionBlock
            icon={Layers}
            title={wineIndustryActive ? 'Wine Setup' : 'Creative Style'}
            description={wineIndustryActive ? 'Core wine presets, shot type, and bottle presentation.' : 'Define the creative intent and tone.'}
            isOpen={openAccordionId === 'product-setup'}
            onToggle={() => toggleSection('product-setup')}
            required
            isTouched={touchedSections.has('product-setup')}
            variant="primary"
          >
            <div className="space-y-6">

              <div className={SECTION_GROUP_CLASS}>
                <p className={GROUP_LABEL_CLASS}>{wineIndustryActive ? 'EXPORT PROFILE' : 'OUTPUT PROFILE'}</p>
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
                <p className="text-xs text-gray-500 dark:text-white/50 mt-1">
                  Defines the global creative intent of the generated prompt.
                </p>
              </div>

              {/* ============================================================
                   1. INDUSTRY PROFILE — Defines everything that follows
                   ============================================================ */}
              {(productStore.sceneType === 'studio-branding' ||
                productStore.sceneType === 'editorial-product' ||
                productStore.sceneType === 'lifestyle-real' ||
                productStore.sceneType === 'studio-hero') && (
                  <>
                    <div className={SECTION_GROUP_CLASS}>
                      <p className="text-xs uppercase tracking-[0.35em] font-semibold text-gray-500 dark:text-white/40 mb-2">INDUSTRY PROFILE</p>
                      <div className="flex flex-wrap gap-2">
                        {INDUSTRY_CHIP_CONFIGS.map((chip) => {
                          const isSelected = industryProfile === chip.value;
                          return (
                            <Chip
                              key={chip.value}
                              selected={isSelected}
                              onClick={() => {
                                applyIndustryProfile(chip.value);
                                markSectionTouched('product-setup');
                              }}
                              description={chip.description}
                              className={isSelected ? chip.activeClassName : chip.inactiveClassName}
                            >
                              <span className="flex items-center gap-2">
                                {chip.icon}
                                <span className="flex flex-col items-start leading-tight">
                                  <span className="font-semibold">{chip.label}</span>
                                  <span className={`text-[10px] ${isSelected ? 'text-white/80' : chip.subtitleClassName}`}>
                                    {chip.subtitle}
                                  </span>
                                </span>
                              </span>
                            </Chip>
                          );
                        })}
                      </div>
                      {industryAutoAdjustNote && (
                        <InterpretationNote message={industryAutoAdjustNote} />
                      )}
                    </div>

                    {(() => {
                      const industryModules = industryModuleRegistry as Partial<
                        Record<IndustryProfile, React.ComponentType<any>>
                      >;
                      const ActiveIndustryModule = industryModules[industryProfile];
                      if (!ActiveIndustryModule) return null;

                      const modulePropsByIndustry: Record<IndustryProfile, Record<string, unknown>> = {
                        supplements: {},
                        wine: {},
                        coffee: {},
                      };

                      return <ActiveIndustryModule {...modulePropsByIndustry[industryProfile]} />;
                    })()}
                    {/* ─── 2. PHOTO MODE ─────────────────────────── */}

                    {/* ─── 4. PHYSICAL PLACEMENT ──────────────────── */}
                    {!wineIndustryActive && (
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
                      <p className="text-xs text-gray-500 dark:text-white/50 mt-2">
                        Placement is resolved contextually from Photo Type + Photo Mode to keep physical coherence.
                      </p>
                      {getInterpretationNote('placement') && (
                        <InterpretationNote message={getInterpretationNote('placement')!} />
                      )}
                      {placementCorrectionMessage && (
                        <InterpretationNote message={placementCorrectionMessage} />
                      )}

                      {placementResolution.resolvedPlacement !== 'held' && placementResolution.resolvedPlacement !== 'air' && (
                        <div className="mt-4 space-y-2">
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Surface</p>
                          <div className="flex flex-wrap gap-2">
                            {([
                              'None',
                              'Wood',
                              'Stone',
                              'Marble',
                            ] as const).map(v => (
                              <Chip
                                key={v}
                                selected={(productStore.photoModeConfig.heroLandingPage?.surfaceType || 'None') === v}
                                onClick={() => {
                                  productStore.setPhotoModeConfig({ heroLandingPage: { surfaceType: v } });
                                  markSectionTouched('product-setup');
                                }}
                              >
                                {v}
                              </Chip>
                            ))}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-white/50">
                            Global support surface for grounded studio scenes. Applies beyond Hero Landing when placement stays surface-based.
                          </p>
                        </div>
                      )}
                    </div>
                    )}

                    {/* ─── 5. PHOTO TYPE (technical — Studio vs Environment) ── */}
                    {!wineIndustryActive && (
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
                    )}

                    {/* ─── SCENE TYPE — Hidden in Product Studio ──── */}
                    {!isProductMode && (
                      <div className={SECTION_GROUP_CLASS}>
                        <p className={GROUP_LABEL_CLASS}>START WITH</p>
                        <div className="flex flex-wrap gap-2">
                          {(['studio-branding', 'editorial-product', 'lifestyle-real', 'ugc-phone'] as const).map(type => (
                            <Chip
                              key={type}
                              onClick={() => {
                                productStore.setSceneType(type);
                                if (type === 'studio-branding' || type === 'lifestyle-real') {
                                  updateValue('sceneType', type);
                                  console.log('[SCENETYPE UPDATE]', {
                                    sceneType: type,
                                    isStudioEngine: type === 'studio-branding',
                                    sceneIntent: values.sceneIntent,
                                    sourceFunction: 'Step3Legacy.sceneTypeChip.onClick',
                                  });
                                }
                                markSectionTouched('product-setup');
                              }}
                              selected={productStore.sceneType === type}
                            >
                              {type === 'studio-branding' ? 'Studio' :
                                type === 'editorial-product' ? 'Editorial' :
                                  type === 'lifestyle-real' ? 'Lifestyle' : 'UGC'}
                            </Chip>
                          ))}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-white/50 mt-1">
                          Choose Studio for product-first scenes, Lifestyle for real environments and action context, Editorial for campaign polish, or UGC for phone-native content.
                        </p>
                      </div>
                    )}

                    {/*  Photo Mode - ALWAYS visible (Hero lock bugfix) */}
                    {!wineIndustryActive && (
                      <>
                        {/* ═══════════════════════════════════════════════════════════
                          1. PHOTO MODE — What am I making?
                          Basic: 4 options | Pro: All options
                          ═══════════════════════════════════════════════════════════ */}
                        <div className={SECTION_GROUP_CLASS}>
                          <p className="text-xs font-extrabold text-gray-500 mb-2">
                            {wineIndustryActive
                              ? productStore.sceneType === 'lifestyle-real'
                                ? 'WINE LIFESTYLE'
                                : 'SHOT TYPE'
                              : 'PHOTO MODE'}
                          </p>
                          {(() => {
                            // ── WINE-EXCLUSIVE COMPOSITION OPTIONS ────────────────────────────
                            // These modes are only shown when industryProfile === 'wine'.
                            // Macro Dew Label is SUPPLEMENT-ONLY and must never appear here.
                            const wineStudioCompositionOptions: Array<{ label: string; mode: PhotoMode }> = [
                              { label: 'Hero Landing Page', mode: 'Hero Landing Page' },
                              { label: 'Wine Macro Label', mode: 'Wine Macro Label' },
                              { label: 'Bottle + Glass', mode: 'Bottle + Glass' },
                              { label: 'Bottle + Glass Pour', mode: 'Bottle + Glass Pour' },
                              { label: 'Hands Pouring Wine', mode: 'Hands Pouring Wine' },
                              { label: 'Wine Lineup Comparison', mode: 'Wine Lineup Comparison' },
                              { label: 'Editorial Bottle Tabletop', mode: 'Editorial Bottle Tabletop' },
                              { label: 'Bottle In Hand Cutout', mode: 'Bottle In Hand Cutout' },
                              { label: 'Rose Tasting Table', mode: 'Rose Tasting Table' },
                              { label: 'Editorial Table', mode: 'Editorial Table' },
                              { label: 'Winery Scene', mode: 'Winery Scene' },
                            ];
                            const wineLifestyleCompositionOptions: Array<{ label: string; mode: PhotoMode }> = [
                              { label: 'Social Table Served', mode: 'Social Table Served' },
                              { label: 'Outdoor Toast', mode: 'Outdoor Toast' },
                              { label: 'Hosting Pour', mode: 'Hosting Pour' },
                              { label: 'Dinner Pairing', mode: 'Dinner Pairing' },
                              { label: 'Picnic Gathering', mode: 'Picnic Gathering' },
                              { label: 'Celebration Chill', mode: 'Celebration Chill' },
                            ];

                            // ── SUPPLEMENT/GENERIC COMPOSITION OPTIONS ───────────────────────
                            // Macro Dew Label is supplement-only — never shown in wine mode.
                            const compositionOptions: Array<{ label: string; mode: PhotoMode }> = wineIndustryActive
                              ? productStore.sceneType === 'lifestyle-real'
                                ? wineLifestyleCompositionOptions
                                : wineStudioCompositionOptions
                              : [
                                  { label: 'Hero Landing Page', mode: 'Hero Landing Page' },
                                  { label: 'Ingredient Stack', mode: 'Ingredient Stack' },
                                  { label: 'Ingredient Flat Lay', mode: 'Ingredient Flat Lay' },
                                  { label: 'Routine Carousel', mode: 'Routine Carousel' },
                                  { label: 'Macro Dew Label', mode: 'Macro Dew Label' },
                                ];

                            const visualStyleOptions: Array<{ label: string; mode: VisualStyle }> = [
                              { label: 'Clinical Lab Counter', mode: 'Clinical Lab Counter' },
                              { label: 'Minimal Bathroom Vanity', mode: 'Minimal Bathroom Vanity' },
                              { label: 'Dark Premium Studio', mode: 'Dark Premium Studio' },
                              { label: 'Brand Campaign', mode: 'Brand Campaign' },
                              { label: 'Creator Premium Simulation', mode: 'Creator Premium Simulation' },
                              { label: 'Tech Clean Studio', mode: 'Tech Clean Studio' },
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
                              if (productStore.visualStyle) {
                                productStore.setVisualStyle(undefined);
                              }
                              productStore.setPhotoMode(mode);
                              const cleaned = stripLegacyEffectSegments(productStore.props);
                              if (cleaned !== productStore.props) productStore.setProps(cleaned);
                              markSectionTouched('product-setup');
                              scrollToPhotoModeSettings();
                            };

                            const applyVisualStyle = (mode: string) => {
                              productStore.setVisualStyle(mode);
                              markSectionTouched('product-setup');
                              if (hasVisibleVisualStyleSettings(mode as VisualStyle)) {
                                scrollToPhotoModeSettings();
                              }
                            };

                            const CHIP_TOOLTIPS: Partial<Record<PhotoMode | VisualStyle, string>> = {
                              'Hero Landing Page': 'Deterministic studio hero with copy-safe negative space (no props).',
                              'Ingredient Stack': 'Ingredients arranged around the product on a surface.',
                              'Ingredient Flat Lay': 'Top-down flat lay with controlled spacing.',
                              'Routine Carousel': 'Carousel-friendly product sequence styling.',
                              'Macro Dew Label': 'Macro close-up emphasizing label texture and detail.',
                              'Clinical Lab Counter': 'Clinical countertop with lab-grade cleanliness.',
                              'Minimal Bathroom Vanity': 'Clean bathroom counter vibe (minimal context).',
                              'Dark Premium Studio': 'Premium dark studio mood and contrast.',
                              'Brand Campaign': 'Campaign-grade studio polish and drama.',
                              'Creator Premium Simulation': 'Premium UGC-style realism with controlled capture.',
                              'Tech Clean Studio': 'Techy clean studio surfaces and clarity.',
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
                              'Caustic Light Ripples': 'Premium refracted light ripples and caustic reflections around the product.',
                              'Prism Rainbow Refractions': 'Controlled prism refractions with premium spectral highlights and clean readability.',
                              'Glass Refraction Panels': 'Elegant glass-panel refractions adding depth and optical distortion around the product.',
                              'Micro Mist Halo': 'Fine controlled mist halo for freshness, hydration, and cinematic depth separation.',
                              'Shadow Pattern Projection': 'Projected shadow shapes adding modern editorial lighting and graphic depth.',
                              'Gel Smear Editorial': 'Editorial gel smear accents (controlled).',
                              'Underwater Split': 'Split-style underwater look with clean physics.',
                              // Wine-exclusive tooltips
                              'Wine Macro Label': 'Extreme close-up of label region only. No full bottle. 100mm macro lens.',
                              'Bottle + Glass': 'Sealed bottle with filled wine glass at 3/4 angle.',
                              'Bottle + Glass Pour': 'Controlled premium pour from bottle into glass with elegant liquid motion.',
                              'Hands Pouring Wine': 'Hands-only hospitality pour. No faces, no full person.',
                              'Wine Lineup Comparison': 'Multiple wine bottles arranged as a clean brand or varietal lineup.',
                              'Editorial Bottle Tabletop': 'Premium still-life tabletop with restrained wine props and editorial balance.',
                              'Bottle In Hand Cutout': 'Single cropped hand holding the bottle against a clean commercial backdrop.',
                              'Rose Tasting Table': 'Bright tasting-table scene for rose/white wine without people.',
                              'Editorial Table': 'Premium tabletop editorial with controlled wine-appropriate props.',
                              'Winery Scene': 'Bottle in authentic cellar or barrel room environment.',
                              'Social Table Served': 'Bottle on a shared table with real hospitality context and product-first table action.',
                              'Outdoor Toast': 'Outdoor toast scene with natural daylight and a visible wine setup.',
                              'Hosting Pour': 'Wine being served in a real hosting moment with action-first framing.',
                              'Dinner Pairing': 'Bottle, glasses, and plated food in a premium dining context.',
                              'Picnic Gathering': 'Outdoor wine gathering with relaxed picnic cues and product-first context.',
                              'Celebration Chill': 'Cold-service wine celebration with social hospitality context.',
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
                              { label: 'Caustic Light Ripples', mode: 'Caustic Light Ripples' },
                              { label: 'Prism Rainbow Refractions', mode: 'Prism Rainbow Refractions' },
                              { label: 'Glass Refraction Panels', mode: 'Glass Refraction Panels' },
                              { label: 'Micro Mist Halo', mode: 'Micro Mist Halo' },
                              { label: 'Shadow Pattern Projection', mode: 'Shadow Pattern Projection' },
                              { label: 'Gel Smear Editorial', mode: 'Gel Smear Editorial' },
                              { label: 'Underwater Split', mode: 'Underwater Split' },
                            ];
                            const filteredSpecialEffectsOptions = wineIndustryActive
                              // In wine mode, only wine-appropriate special effects are shown
                              ? specialEffectsOptions.filter(({ mode }) =>
                                  mode === 'Cheers (Hands Clink)' ||
                                  mode === 'Condensation Droplets' ||
                                  mode === 'Fruit Garnish / Citrus Accents'
                                )
                              : specialEffectsOptions;
                            // In wine mode, compositionOptions is already gated to wine-exclusive modes.
                            // allowedPhotoModes filter applies on top for completeness.
                            const filteredCompositionOptions = compositionOptions.filter(({ mode }) =>
                              !activeIndustryRules?.allowedPhotoModes || activeIndustryRules.allowedPhotoModes.includes(mode)
                            );
                            const isAllowedVisualStyle = (mode: VisualStyle) =>
                              !activeIndustryRules?.allowedVisualStyles || activeIndustryRules.allowedVisualStyles.includes(mode);
                            const filteredIndustrySpecialEffectsOptions = filteredSpecialEffectsOptions.filter(({ mode }) =>
                              !activeIndustryRules?.allowedSpecialEffects || activeIndustryRules.allowedSpecialEffects.includes(mode)
                            );
                            const specialEffectsGroups: Array<{ label: string; modes: PhotoMode[] }> = [
                              {
                                label: 'Fresh / Hydration',
                                modes: [
                                  'Pool Water',
                                  'Ice Cubes',
                                  'Condensation Droplets',
                                  'Caustic Light Ripples',
                                  'Micro Mist Halo',
                                  'Underwater Split',
                                ],
                              },
                              {
                                label: 'Luxury / Editorial',
                                modes: [
                                  'Acrylic Blocks',
                                  'Glass Refraction Panels',
                                  'Prism Rainbow Refractions',
                                  'Floating Particles',
                                  'Gel Smear Editorial',
                                  'Shadow Pattern Projection',
                                ],
                              },
                              {
                                label: 'Bold / Campaign',
                                modes: [
                                  'Splash Shot',
                                  'Beach Foam Splash',
                                  'Cheers (Hands Clink)',
                                  'Foam & Texture',
                                  'Fruit Garnish / Citrus Accents',
                                  'Textured Bed / Scatter Base',
                                ],
                              },
                            ];
                            const visualStyleOverridesCoreSelection = Boolean(productStore.visualStyle);

                            return (
                              <div className="p-5 space-y-7">
                                <div className="space-y-4">
                                  <div>
                                    <p className={GROUP_LABEL_CLASS}>COMPOSITION</p>
                                    <p className="text-[11px] text-gray-500 mt-1">Choose how the product is framed and presented.</p>
                                  </div>
                                  <div className="flex flex-wrap gap-3">
                                    {filteredCompositionOptions.map(({ label, mode }) => (
                                      <Chip
                                        key={label}
                                        selected={productStore.photoMode === mode && !visualStyleOverridesCoreSelection}
                                        description={CHIP_TOOLTIPS[mode] || label}
                                        onClick={() => {
                                          applyPhotoMode(mode);
                                        }}
                                      >
                                        <span className="truncate max-w-full">{label}</span>
                                      </Chip>
                                    ))}
                                  </div>
                                  {getInterpretationNote('photoMode') && (
                                    <InterpretationNote message={getInterpretationNote('photoMode')!} />
                                  )}
                                  {getInterpretationNote('photoModeInteraction') && (
                                    <InterpretationNote message={getInterpretationNote('photoModeInteraction')!} />
                                  )}
                                </div>

                                {!isCoffeeIndustry && (
                                  <div className="space-y-4">
                                    <div>
                                      <p className={GROUP_LABEL_CLASS}>VISUAL STYLE</p>
                                      <p className="text-[11px] text-gray-500 mt-1">Overall aesthetic and brand mood.</p>
                                    </div>
                                    <div className="space-y-5">
                                      <div className="space-y-3">
                                        <p className="text-xs font-semibold text-gray-400 dark:text-white/40">Studio Worlds</p>
                                        <div className="flex flex-wrap gap-3">
                                          {visualStyleOptions.filter(x =>
                                            x.mode === 'Clinical Lab Counter' ||
                                            x.mode === 'Minimal Bathroom Vanity' ||
                                            x.mode === 'Dark Premium Studio' ||
                                            x.mode === 'Tech Clean Studio'
                                          ).filter(({ mode }) => isAllowedVisualStyle(mode)).map(({ label, mode }) => (
                                            <Chip
                                              key={label}
                                              selected={productStore.visualStyle === mode}
                                              description={CHIP_TOOLTIPS[mode] || label}
                                              onClick={() => {
                                                applyVisualStyle(mode);
                                              }}
                                            >
                                              <span className="truncate max-w-full">{label}</span>
                                            </Chip>
                                          ))}
                                        </div>
                                      </div>

                                      <div className="space-y-3">
                                        <p className="text-xs font-semibold text-gray-400 dark:text-white/40">Brand Worlds</p>
                                        <div className="flex flex-wrap gap-3">
                                          {visualStyleOptions.filter(x =>
                                            x.mode === 'Brand Campaign' ||
                                            x.mode === 'Creator Premium Simulation'
                                          ).filter(({ mode }) => isAllowedVisualStyle(mode)).map(({ label, mode }) => (
                                            <Chip
                                              key={label}
                                              selected={productStore.visualStyle === mode}
                                              description={CHIP_TOOLTIPS[mode] || label}
                                              onClick={() => {
                                                applyVisualStyle(mode);
                                              }}
                                            >
                                              <span className="truncate max-w-full">{label}</span>
                                            </Chip>
                                          ))}
                                        </div>
                                      </div>

                                      <div className="space-y-3">
                                        <p className="text-xs font-semibold text-gray-400 dark:text-white/40">Realism</p>
                                        <div className="flex flex-wrap gap-3">
                                          {visualStyleOptions.filter(x =>
                                            x.mode === 'Sunlit Stone Editorial' ||
                                            x.mode === 'Golden Sunset Backlit' ||
                                            x.mode === 'Bathroom Daylight Clean' ||
                                            x.mode === 'Warm Window Wood'
                                          ).filter(({ mode }) => isAllowedVisualStyle(mode)).map(({ label, mode }) => (
                                            <Chip
                                              key={label}
                                              selected={productStore.visualStyle === mode}
                                              description={CHIP_TOOLTIPS[mode] || label}
                                              onClick={() => {
                                                applyVisualStyle(mode);
                                              }}
                                            >
                                              <span className="truncate max-w-full">{label}</span>
                                            </Chip>
                                          ))}
                                        </div>
                                      </div>

                                      <div className="space-y-3">
                                        <p className="text-xs font-semibold text-gray-400 dark:text-white/40">Nature Elements</p>
                                        <div className="flex flex-wrap gap-3">
                                          {visualStyleOptions.filter(x =>
                                            x.mode === 'Sky Float Minimal' ||
                                            x.mode === 'Wet Rock Ripples' ||
                                            x.mode === 'Sand Palm Shadows' ||
                                            x.mode === 'Botanical Water Garden'
                                          ).filter(({ mode }) => isAllowedVisualStyle(mode)).map(({ label, mode }) => (
                                            <Chip
                                              key={label}
                                              selected={productStore.visualStyle === mode}
                                              description={CHIP_TOOLTIPS[mode] || label}
                                              onClick={() => {
                                                applyVisualStyle(mode);
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

                                <div className="space-y-4">
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
                                  <div className="space-y-4">
                                    <div>
                                      <p className={GROUP_LABEL_CLASS}>SPECIAL EFFECTS</p>
                                      <p className="text-[11px] text-gray-500 mt-1">Optional visual enhancements.</p>
                                    </div>
                                    <div className="space-y-5">
                                      {specialEffectsGroups.map((group) => {
                                        const options = filteredIndustrySpecialEffectsOptions.filter(({ mode }) =>
                                          group.modes.includes(mode)
                                        );

                                        if (options.length === 0) return null;

                                        return (
                                          <div key={group.label} className="space-y-3">
                                            <p className="text-xs font-semibold text-gray-400 dark:text-white/40">{group.label}</p>
                                            <div className="flex flex-wrap gap-3">
                                              {options.map(({ label, mode }) => (
                                                <Chip
                                                  key={label}
                                                  selected={productStore.photoMode === mode && !visualStyleOverridesCoreSelection}
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
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })()}

                          <div className="mt-8 space-y-5">
                            <div ref={photoModeSettingsRef} />
                            {productStore.visualStyle && VISUAL_STYLE_SCHEMAS[productStore.visualStyle] && (
                              <PhotoModeSettings
                                schema={VISUAL_STYLE_SCHEMAS[productStore.visualStyle]!}
                                productStore={productStore}
                                markSectionTouched={markSectionTouched}
                              />
                            )}
                            {productStore.photoMode === 'Hero Landing Page' && !productStore.visualStyle && (
                              <PropertySettingsCard
                                title="Hero Landing Page Atmosphere"
                                description="Deterministic studio hero with copy-safe negative space and controlled background behavior."
                              >
                                {(() => {
                                  const heroCfg = productStore.photoModeConfig.heroLandingPage;
                                  const isGradient = heroCfg.backgroundType === 'Gradient';
                                  const paletteSource = heroCfg.paletteSource;
                                  const isCustom = paletteSource === 'Custom';

                                  // ── Resolve active colors from store ──────────────────────
                                  const solidColor = normalizeHex(productStore.backgroundColor) ?? '#FFFFFF';
                                  const startColor = normalizeHex(productStore.gradientStart) ?? '#FFFFFF';
                                  const endColor = normalizeHex(productStore.gradientEnd) ?? '#FFFFFF';
                                  const midColor = normalizeHex(productStore.gradientMid) ?? '';
                                  const hasMid = Boolean(midColor);

                                  // ── Brand palette colors (store.palette.* system colors) ──
                                  const brandSystemSwatches = uniqHexes([
                                    (productStore as any)?.palette?.primaryColor,
                                    (productStore as any)?.palette?.secondaryColor,
                                    (productStore as any)?.palette?.accentColor,
                                  ]);

                                  // ── Auto-fill from palette source ─────────────────────────
                                  const applyColorSourceDefaults = (src: typeof paletteSource) => {
                                    if (src === 'Product label colors') {
                                      const swatches = heroLandingBrandSwatches;
                                      if (swatches.length > 0) {
                                        productStore.setBackgroundColor(swatches[0]);
                                        if (isGradient && swatches[1]) productStore.setGradientStart(swatches[0]);
                                        if (isGradient && swatches[1]) productStore.setGradientEnd(swatches[1]);
                                      }
                                    } else if (src === 'Neutral brand tones') {
                                      // Fill from brand system palette; fall back to neutral whites if none configured.
                                      const swatches = brandSystemSwatches.length > 0
                                        ? brandSystemSwatches
                                        : ['#F9FAFB', '#F3F4F6', '#E5E7EB'];
                                      productStore.setBackgroundColor(swatches[0]);
                                      if (isGradient) {
                                        productStore.setGradientStart(swatches[0]);
                                        productStore.setGradientEnd(swatches[1] ?? swatches[0]);
                                      }
                                    }
                                    // Custom: user controls colors directly — no auto-fill
                                  };

                                  // ── Inline color row component ────────────────────────────
                                  const ColorRow = ({
                                    label,
                                    value,
                                    onChange,
                                    readOnly,
                                  }: {
                                    label: string;
                                    value: string;
                                    onChange: (hex: string) => void;
                                    readOnly?: boolean;
                                  }) => {
                                    const [draft, setDraft] = React.useState<string | null>(null);
                                    const safeValue = normalizeHex(value) ?? '#FFFFFF';
                                    const displayDraft = draft ?? safeValue;

                                    const commitDraft = (raw: string) => {
                                      const hex = normalizeHex(raw);
                                      if (hex) { onChange(hex); }
                                      setDraft(null);
                                    };

                                    return (
                                      <div className="flex items-center gap-3">
                                        <span className="text-[11px] font-medium text-gray-500 w-16 shrink-0">{label}</span>
                                        <div className="flex items-center gap-2 flex-1">
                                          {/* Color swatch — rectangular, clickable */}
                                          <label
                                            className={[
                                              'relative flex h-8 w-12 shrink-0 cursor-pointer items-center justify-center rounded-md border transition-colors',
                                              readOnly
                                                ? 'cursor-default border-gray-200'
                                                : 'border-gray-300 hover:border-gray-400',
                                            ].join(' ')}
                                            style={{ backgroundColor: safeValue }}
                                            aria-label={`${label} color picker`}
                                          >
                                            {!readOnly && (
                                              <input
                                                type="color"
                                                value={safeValue}
                                                onChange={(e) => {
                                                  const hex = normalizeHex(e.target.value);
                                                  if (hex) { onChange(hex); setDraft(hex); }
                                                }}
                                                onBlur={() => setDraft(null)}
                                                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                                              />
                                            )}
                                          </label>
                                          {/* Hex input */}
                                          <input
                                            type="text"
                                            value={displayDraft}
                                            readOnly={readOnly}
                                            onChange={(e) => setDraft(e.target.value)}
                                            onBlur={(e) => commitDraft(e.target.value)}
                                            onKeyDown={(e) => {
                                              if (e.key === 'Enter') commitDraft((e.target as HTMLInputElement).value);
                                              if (e.key === 'Escape') setDraft(null);
                                            }}
                                            maxLength={7}
                                            placeholder="#FFFFFF"
                                            className={[
                                              'h-8 flex-1 rounded-md border px-2 font-mono text-[11px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1',
                                              readOnly
                                                ? 'cursor-default select-none border-gray-100 bg-gray-50 text-gray-400'
                                                : 'border-gray-200 bg-white focus:border-indigo-400 focus:ring-indigo-200',
                                            ].join(' ')}
                                            aria-label={`${label} hex value`}
                                          />
                                        </div>
                                      </div>
                                    );
                                  };

                                  return (
                                    <>
                                      {/* ── 1. BACKGROUND TYPE ───────────────────────────── */}
                                      <div className="space-y-2">
                                        <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Background Type</p>
                                        <div className="flex gap-2">
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

                                      {/* ── 2. COLOR SOURCE ───────────────────────────────── */}
                                      <div className="space-y-2">
                                        <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Color Source</p>
                                        <div className="flex flex-wrap gap-2">
                                          {([
                                            { value: 'Product label colors', label: 'Product palette' },
                                            { value: 'Neutral brand tones', label: 'Brand palette' },
                                            { value: 'Custom', label: 'Custom' },
                                          ] as const).map(({ value, label }) => (
                                            <Chip
                                              key={value}
                                              selected={paletteSource === value}
                                              onClick={() => {
                                                productStore.setPhotoModeConfig({ heroLandingPage: { paletteSource: value } });
                                                applyColorSourceDefaults(value);
                                                markSectionTouched('product-setup');
                                              }}
                                            >
                                              {label}
                                            </Chip>
                                          ))}
                                        </div>
                                        {paletteSource === 'Product label colors' && heroLandingBrandSwatches.length === 0 && (
                                          <p className="text-[11px] text-amber-600">
                                            No label colors detected yet. Upload a product image to auto-fill.
                                          </p>
                                        )}
                                        {paletteSource === 'Neutral brand tones' && brandSystemSwatches.length === 0 && (
                                          <p className="text-[11px] text-gray-500">
                                            Brand palette not found. Using neutral fallback tones.
                                          </p>
                                        )}
                                      </div>

                                      {/* ── 3. COLOR CONTROLS ─────────────────────────────── */}
                                      <div className="space-y-3">
                                        <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                                          Color Controls
                                        </p>

                                        {!isGradient ? (
                                          // Solid: single color row
                                          <ColorRow
                                            label="Color"
                                            value={solidColor}
                                            readOnly={!isCustom}
                                            onChange={(hex) => {
                                              productStore.setBackgroundColor(hex);
                                              markSectionTouched('product-setup');
                                            }}
                                          />
                                        ) : (
                                          // Gradient: two (or three) color rows
                                          <div className="space-y-2">
                                            <ColorRow
                                              label="Start color"
                                              value={startColor}
                                              readOnly={!isCustom}
                                              onChange={(hex) => {
                                                productStore.setGradientStart(hex);
                                                markSectionTouched('product-setup');
                                              }}
                                            />
                                            <ColorRow
                                              label="End color"
                                              value={endColor}
                                              readOnly={!isCustom}
                                              onChange={(hex) => {
                                                productStore.setGradientEnd(hex);
                                                markSectionTouched('product-setup');
                                              }}
                                            />

                                            {hasMid && (
                                              <div className="flex items-center gap-3">
                                                <div className="w-16 shrink-0" />
                                                <div className="flex flex-1 items-center gap-2">
                                                  <ColorRow
                                                    label="Mid color"
                                                    value={midColor}
                                                    readOnly={!isCustom}
                                                    onChange={(hex) => {
                                                      productStore.setGradientMid(hex);
                                                      markSectionTouched('product-setup');
                                                    }}
                                                  />
                                                  {isCustom && (
                                                    <button
                                                      type="button"
                                                      onClick={() => {
                                                        productStore.setGradientMid('');
                                                        markSectionTouched('product-setup');
                                                      }}
                                                      className="ml-auto shrink-0 text-[10px] text-gray-400 hover:text-gray-600 underline"
                                                      aria-label="Remove third color"
                                                    >
                                                      Remove
                                                    </button>
                                                  )}
                                                </div>
                                              </div>
                                            )}

                                            {!hasMid && isCustom && (
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  const suggested =
                                                    heroLandingBrandSwatches[2] ||
                                                    heroLandingBrandSwatches[1] ||
                                                    '#E5E7EB';
                                                  productStore.setGradientMid(suggested);
                                                  markSectionTouched('product-setup');
                                                }}
                                                className="ml-[4.5rem] text-[11px] font-medium text-indigo-500 hover:text-indigo-700"
                                              >
                                                + Add third color
                                              </button>
                                            )}
                                          </div>
                                        )}

                                        {/* Inline hint when palette source drives colors */}
                                        {paletteSource === 'Product label colors' && (
                                          <p className="text-[10px] text-gray-400 italic">
                                            Colors derived from product label palette.{' '}
                                            Switch to <strong>Custom</strong> to edit manually.
                                          </p>
                                        )}
                                        {paletteSource === 'Neutral brand tones' && (
                                          <p className="text-[10px] text-gray-400 italic">
                                            Using brand palette colors.{' '}
                                            Switch to <strong>Custom</strong> to edit manually.
                                          </p>
                                        )}
                                      </div>

                                      {/* ── 4. GRADIENT STYLE (gradient only) ─────────────── */}
                                      {isGradient && (
                                        <div className="space-y-2">
                                          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Gradient Style</p>
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

                                      {/* ── 5. NEGATIVE SPACE ─────────────────────────────── */}
                                      <div className="space-y-2">
                                        <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Negative Space</p>
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

                                      {/* ── 6. CONTRAST ───────────────────────────────────── */}
                                      <div className="space-y-2">
                                        <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Contrast</p>
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

                                    </>
                                  );
                                })()}
                              </PropertySettingsCard>
                            )}

                            {(productStore.photoMode === 'Ingredient Stack' || productStore.photoMode === 'Ingredient Flat Lay') && (
                              <PropertySettingsCard
                                title={`${productStore.photoMode} Atmosphere`}
                                description="Ingredient-led composition with controlled product readability and optional background override."
                              >
                                {/* CUSTOM INGREDIENTS INPUT */}
                                <div>
                                  <p className="text-xs text-gray-500 font-semibold mb-1">
                                    Ingredients <span className="text-red-400">*</span>
                                  </p>
                                  <input
                                    type="text"
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-[var(--lifestyle-accent)] focus:border-[var(--lifestyle-accent)] dark:bg-white/5 dark:border-white/10 dark:text-white"
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
                                      <p className="text-xs text-gray-500 font-semibold mb-1">Ingredient Focus</p>
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
                                      <p className="text-xs text-gray-500 font-semibold mb-1">Stack Style</p>
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
                                      <p className="text-xs text-gray-500 font-semibold mb-1">Ingredient Presence</p>
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
                                      <p className="text-xs text-gray-500 font-semibold mb-1">Label Priority</p>
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
                                          <p className="text-xs text-gray-500 font-semibold">Background</p>
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
                                            <p className="text-xs text-gray-500 font-semibold mb-1">Background Type</p>
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
                                              <p className="text-xs text-gray-500 font-semibold mb-1">Gradient Style</p>
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
                                            <p className="text-xs text-gray-500 font-semibold mb-1">Colors</p>
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
                                                    className="w-32 rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs font-mono text-gray-900 placeholder:text-gray-400 focus:border-[var(--lifestyle-accent)] focus:ring-1 focus:ring-[var(--lifestyle-accent)]"
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
                                                      className="w-32 rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs font-mono text-gray-900 placeholder:text-gray-400 focus:border-[var(--lifestyle-accent)] focus:ring-1 focus:ring-[var(--lifestyle-accent)]"
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
                                                      className="w-32 rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs font-mono text-gray-900 placeholder:text-gray-400 focus:border-[var(--lifestyle-accent)] focus:ring-1 focus:ring-[var(--lifestyle-accent)]"
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
                              </PropertySettingsCard>
                            )}

                            {productStore.photoMode === 'Acrylic Blocks' && (
                              <PropertySettingsCard
                                title="Acrylic Blocks Atmosphere"
                                description="Geometric acrylic support styling with controlled reflections and elevation."
                              >
                                <div>
                                  <p className="text-xs text-gray-500 font-semibold mb-1">Block Shape</p>
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
                                  <p className="text-xs text-gray-500 font-semibold mb-1">Material Finish</p>
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
                                  <p className="text-xs text-gray-500 font-semibold mb-1">Reflection Level</p>
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
                                  <p className="text-xs text-gray-500 font-semibold mb-1">Elevation</p>
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
                              </PropertySettingsCard>
                            )}

                            {productStore.photoMode === 'Splash Shot' && !wineIndustryActive && (
                              <PropertySettingsCard
                                title="Splash Shot Atmosphere"
                                description="High-speed liquid impact control with readable hero product and deterministic splash timing."
                              >
                                <div>
                                  <p className="text-xs text-gray-500 font-semibold mb-1">Splash Medium</p>
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
                                  <p className="text-xs text-gray-500 font-semibold mb-1">Motion Intensity</p>
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
                                  <p className="text-xs text-gray-500 font-semibold mb-1">Freeze Moment</p>
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
                                  <p className="text-xs text-gray-500 font-semibold mb-1">Product Stability</p>
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
                              </PropertySettingsCard>
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
                              <PropertySettingsCard
                                title="Foam & Texture Atmosphere"
                                description="Controlled texture accents with clean product readability and material-safe realism."
                              >
                                <div>
                                  <p className="text-xs text-gray-500 font-semibold mb-1">Texture Type</p>
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
                                  <p className="text-xs text-gray-500 font-semibold mb-1">Texture Density</p>
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
                                  <p className="text-xs text-gray-500 font-semibold mb-1">Focus Distance</p>
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
                                  <p className="text-xs text-gray-500 font-semibold mb-1">Cleanliness</p>
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
                              </PropertySettingsCard>
                            )}

                            {productStore.photoMode === 'Routine Carousel' && (
                              <PropertySettingsCard
                                title="Routine Carousel Atmosphere"
                                description="Multi-frame routine storytelling with consistent visual flow and hero-frame control."
                              >
                                <div>
                                  <p className="text-xs text-gray-500 font-semibold mb-1">Frame Count</p>
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
                                  <p className="text-xs text-gray-500 font-semibold mb-1">Routine Flow</p>
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
                                  <p className="text-xs text-gray-500 font-semibold mb-1">Consistency</p>
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
                                  <p className="text-xs text-gray-500 font-semibold mb-1">Hero Frame</p>
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
                              </PropertySettingsCard>
                            )}

                            {productStore.visualStyle === 'Clinical Lab Counter' && (
                              <PropertySettingsCard
                                title="Clinical Lab Counter Atmosphere"
                                description="Clinical trust cues with clean lab surface behavior and controlled authority level."
                              >
                                <div>
                                  <p className="text-xs text-gray-500 font-semibold mb-1">Clinical Tone</p>
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
                                  <p className="text-xs text-gray-500 font-semibold mb-1">Lab Elements</p>
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
                                  <p className="text-xs text-gray-500 font-semibold mb-1">Surface Type</p>
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
                                  <p className="text-xs text-gray-500 font-semibold mb-1">Trust Level</p>
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
                              </PropertySettingsCard>
                            )}

                            {productStore.photoMode === 'Golden Mist Aura' && (
                              <PropertySettingsCard
                                title="Golden Mist Aura Atmosphere"
                                description="Warm luminous mist with premium glow control and restrained contrast."
                              >
                                <div>
                                  <p className="text-xs text-gray-500 font-semibold mb-1">Glow Strength</p>
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
                                  <p className="text-xs text-gray-500 font-semibold mb-1">Mist Style</p>
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
                                  <p className="text-xs text-gray-500 font-semibold mb-1">Mood</p>
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
                                  <p className="text-xs text-gray-500 font-semibold mb-1">Contrast</p>
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
                              </PropertySettingsCard>
                            )}

                            {productStore.photoMode === 'Candy Gradient Lab' && (
                              <PropertySettingsCard
                                title="Candy Gradient Lab Atmosphere"
                                description="Gradient-driven lab styling with color structure and controlled playfulness."
                              >
                                <div>
                                  <p className="text-xs text-gray-500 font-semibold mb-1">Gradient Style</p>
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
                                  <p className="text-xs text-gray-500 font-semibold mb-1">Color Count</p>
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
                                  <p className="text-xs text-gray-500 font-semibold mb-1">Edge Style</p>
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
                                  <p className="text-xs text-gray-500 font-semibold mb-1">Playfulness</p>
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
                              </PropertySettingsCard>
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

              {mode !== 'studio' && (
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
                      className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-[var(--lifestyle-accent)] focus:ring-1 focus:ring-[var(--lifestyle-accent)]"
                      placeholder="Describe the product category (min 3 words)"
                    />
                  )}
                </div>
              )}

              {mode !== 'studio' && (
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
              )}
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
                      <div className="mt-3 pt-3 ">
                        <p className="text-[9px] uppercase text-gray-400 mb-2">ADVANCED</p>
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
                    {getInterpretationNote('composition') && (
                      <InterpretationNote message={getInterpretationNote('composition')!} />
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
                      <div className="space-y-5 pl-3 border-l-2 border-gray-300">
                        <div>
                          <p className="text-xs font-extrabold text-gray-500 mb-2">LENS</p>
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
                                  ? 'bg-[var(--lifestyle-accent)] text-white border-[var(--lifestyle-accent)]'
                                  : 'bg-white text-gray-500 border-gray-200 hover:border-[var(--lifestyle-accent)]'
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
                          <p className="text-xs font-extrabold text-gray-500 mb-2">LIGHTING RIG</p>
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
                                  ? 'bg-[var(--lifestyle-accent)] text-white border-[var(--lifestyle-accent)]'
                                  : 'bg-white text-gray-500 border-gray-200 hover:border-[var(--lifestyle-accent)]'
                                  }`}
                                style={{ transitionTimingFunction: 'cubic-bezier(0.23,1,0.32,1)' }}
                              >
                                {label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <p className="text-xs font-extrabold text-gray-500 mb-2">ACCENT / GEL LIGHT COLOR</p>
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
                                        ? 'bg-[var(--lifestyle-accent)] text-white border-[var(--lifestyle-accent)]'
                                        : 'bg-white text-gray-500 border-gray-200 hover:border-[var(--lifestyle-accent)]'
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
                              <p className="text-xs text-gray-500 font-semibold mb-2">Custom Gel Color</p>
                              <div className="flex items-center gap-3">
                                <button
                                  type="button"
                                  onClick={() => {
                                    productStore.setCustomLightColor('');
                                    markSectionTouched('product-setup');
                                  }}
                                  className={`${COLOR_PICKER_BUTTON_CLASS} ${
                                    !productStore.customLightColor
                                      ? 'border-[var(--lifestyle-accent)]'
                                      : 'border-gray-200 hover:border-gray-300'
                                  }`}
                                  style={{ background: '#FFFFFF' }}
                                  aria-label="No accent color"
                                />
                                <label
                                  className={`relative inline-block ${COLOR_PICKER_BUTTON_CLASS} cursor-pointer ${
                                    productStore.customLightColor
                                      ? 'border-[var(--lifestyle-accent)]'
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
                                  className="px-3 py-2 rounded-lg border border-gray-200 text-[11px] font-mono text-gray-700 focus:border-[var(--lifestyle-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--lifestyle-accent)] w-24"
                                />
                              </div>
                            </div>
                            {productStore.customLightColor && productStore.customLightColor !== '#FFFFFF' && (
                              <div>
                                <p className="text-xs text-gray-500 font-semibold mb-2">Gel Light Intensity</p>
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
                                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-600"
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
                          <p className="text-xs font-extrabold text-gray-500 mb-2">FINISH / TREATMENT</p>
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
                                  ? 'bg-[var(--lifestyle-accent)] text-white border-[var(--lifestyle-accent)]'
                                  : 'bg-white text-gray-500 border-gray-200 hover:border-[var(--lifestyle-accent)]'
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
                        <p className="text-[9px] uppercase text-gray-400 mb-2">PRODUCT POSITION</p>
                        <div className="flex gap-2">
                          {([
                            { key: 'center', label: 'Center' },
                            { key: 'left', label: 'Left' },
                            { key: 'right', label: 'Right' },
                          ] as const).map(({ key, label }) => (
                            <Chip
                              key={key}
                              onClick={() => {
                                productStore.setAlignment(key);
                                if (key === 'center') {
                                  productStore.setComposition('centered' as any);
                                  productStore.setNegativeSpace('none' as any);
                                } else {
                                  productStore.setComposition('asymmetrical' as any);
                                  productStore.setNegativeSpace('intentional' as any);
                                }
                                markSectionTouched('product-setup');
                              }}
                              selected={productStore.alignment === key || (key === 'center' && productStore.alignment === 'centered')}
                            >
                              {label}
                            </Chip>
                          ))}
                        </div>
                        <p className="text-[11px] text-gray-500 mt-2">
                          Controls where the product sits in the frame and how much copy-safe space remains beside it.
                        </p>
                      </div>

                      <div>
                        <p className="text-[9px] uppercase text-gray-400 mb-2">PROPS</p>
                        <input
                          type="text"
                          value={productStore.props}
                          onChange={(e) => {
                            productStore.setProps(e.target.value);
                            markSectionTouched('product-setup');
                          }}
                          placeholder="e.g., pineapple, lavender sprigs"
                          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[var(--lifestyle-accent)] focus:ring-2 focus:ring-[var(--lifestyle-accent)] transition-all duration-200"
                        />
                      </div>

                    </div>
                  </div>
                </>
              )}
            </div>
          </CreativeDirectionBlock>
        </StudioStep3Layout>
      )}

      {/* PHYSICAL PROPERTIES - Contextual per Product Type */}
      {
        mode === 'studio' && values.productType && !wineIndustryActive && (
          <PhysicalPresenceBlock
            icon={Layers}
            description="Physical product details and material options."
            isOpen={openAccordionId === 'physical-props'}
            onToggle={() => toggleSection('physical-props')}
            isTouched={touchedSections.has('physical-props')}
            variant="primary"
          >
            <div className="space-y-6">
              <p className="text-xs text-gray-500 dark:text-white/50">
                Configure the real, physical appearance of the product itself.
              </p>
              {/* CAPSULES PHYSICAL */}
              {values.productType === 'Capsules' && (
                <>
                  <div className={SECTION_GROUP_CLASS}>
                    <p className={GROUP_LABEL_CLASS}>CAPSULE SHELL</p>
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
                    <p className={GROUP_LABEL_CLASS}>FILL COLOR</p>
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
                    <p className={GROUP_LABEL_CLASS}>COUNT</p>
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
                    <p className={GROUP_LABEL_CLASS}>ARRANGEMENT</p>
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
                    <p className={GROUP_LABEL_CLASS}>SUPPORTING PROPS</p>
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
                        placeholder="e.g. orange, pink, indigo"
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
                    <p className={GROUP_LABEL_CLASS}>COUNT</p>
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
                    <p className={GROUP_LABEL_CLASS}>SUPPORTING PROPS</p>
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
                    <p className={GROUP_LABEL_CLASS}>DROPPER POSITION</p>
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
                    <p className={GROUP_LABEL_CLASS}>USE STYLE</p>
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
                      <p className={GROUP_LABEL_CLASS}>SUPPORTING PROPS</p>
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
                    <p className={GROUP_LABEL_CLASS}>PRESENTATION STYLE</p>
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
                    <p className={GROUP_LABEL_CLASS}>MIXING STYLE</p>
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
                    <p className={GROUP_LABEL_CLASS}>SUPPORTING PROPS</p>
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
          </PhysicalPresenceBlock>
      )}

      {(mode === 'studio' || uiActiveEngine === 'studio') && !wineIndustryActive && (
      <MotionInteractionBlock
        icon={Activity}
        title={wineIndustryActive ? 'Bottle Action' : 'Motion & Interaction'}
        description={wineIndustryActive ? 'Bottle state, pour, and serve behavior.' : 'What the product is doing.'}
        isOpen={openAccordionId === 'product-state-motion'}
        onToggle={() => toggleSection('product-state-motion')}
        isTouched={touchedSections.has('product-state-motion')}
        variant="primary"
      >
        <div className="space-y-6">
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
          <p className="text-xs text-gray-500 dark:text-white/50">
            Product State & Motion describe what the product is doing. Product Interaction describes what hands are doing.
          </p>

	          <div className={SECTION_GROUP_CLASS}>
	            <p className={GROUP_LABEL_CLASS}>{wineIndustryActive ? 'BOTTLE ACTION' : 'PRODUCT STATE & MOTION'}</p>
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
	            <p className="text-xs text-gray-500 dark:text-white/50 mt-2">
	              Physics rules: gravity downward only, no floating, irregular distribution, natural motion freeze.
	            </p>
	          </div>

              {(industryProfile === 'supplements' || industryProfile === 'coffee') && (
                <div className={SECTION_GROUP_CLASS}>
                  <p className={GROUP_LABEL_CLASS}>PRODUCT INTERACTION</p>
                  <p className="text-xs text-gray-500 dark:text-white/50 mb-2">
                    One interaction per scene.
                  </p>
                  {(() => {
                    const interactionAllowedByIndustry =
                      industryProfile === 'coffee'
                        ? activeIndustryRules?.interactionWhitelistByIntent?.[coffeeIntent] ?? ['none']
                        : activeIndustryRules?.interactionWhitelist ?? ['none'];
                    const resolvedInteractionOptions = getResolvedAllowedInteractions(
                      productStore.photoMode,
                      interactionAllowedByIndustry as ProductStudioState['interaction'][]
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
                      'passive-presence': {
                        label: 'Passive Presence',
                        detail: 'Product rests passively. Limbs may be present in background but don\'t touch product.',
                        stateValue: 'passive-presence',
                      },
                      'cropped-hand': {
                        label: 'Cropped Hand',
                        detail: 'Partially cropped hand enters frame from edge — only fingers or wrist visible.',
                        stateValue: 'cropped-hand',
                      },
                      'supported-hold': {
                        label: 'Supported Hold',
                        detail: 'Open palm supports product from below. Relaxed, no tight grip.',
                        stateValue: 'supported-hold',
                      },
                      holding: {
                        label: 'Holding',
                        detail: 'One hand holds the product naturally. No gesture.',
                        stateValue: 'holding',
                      },
                      'two-hand-hold': {
                        label: 'Two-Hand Hold',
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
                        detail: 'Hands frame the product edges without blocking label.',
                        stateValue: 'framed-presentation',
                      },
                      'applying-opening': {
                        label: 'Applying / Opening',
                        detail: 'One clear action: twist/open. No consumption.',
                        stateValue: 'applying-opening',
                      },
                      'capsule-display': {
                        label: 'Capsule Display',
                        detail: '2–4 capsules in open palm. Only available for Capsules.',
                        stateValue: 'capsule-display',
                      },
                      'resting-interaction': {
                        label: 'Resting Interaction',
                        detail: 'Product on surface. Hand rests nearby without gripping.',
                        stateValue: 'resting-interaction',
                      },
                    };
                    const photoModeAllowlist = getPhotoModeInteractionAllowlist(productStore.photoMode);
                    const visibleInteractionOptions = photoModeAllowlist !== null
                      ? (Object.entries(interactionOptionMap).map(([value, option]) => ({
                          value,
                          ...option,
                          gatedDisabled: false,
                        })))
                      : resolvedInteractionOptions.flatMap((value) => {
                          const option = interactionOptionMap[value];
                          return option ? [{ value, ...option, gatedDisabled: false }] : [];
                        });
                    const selectedInteractionValue = (productStore.interaction || 'none') as string;

                    return (
                      <>
                        <div className="flex flex-wrap gap-2">
                          {visibleInteractionOptions.map((option) => (
                            <Chip
                              key={option.value}
                              disabled={false}
                              onClick={() => {
                                productStore.setInteraction(option.stateValue);
                                productStore.setHandsHolding(option.stateValue !== 'none');
                                updateValue('productStudioInteraction', option.stateValue as any);
                                updateValue('handsHolding', option.stateValue !== 'none');
                                markSectionTouched('product-state-motion');
                              }}
                              selected={selectedInteractionValue === option.value}
                              description={option.detail}
                            >
                              {option.label}
                            </Chip>
                          ))}
                        </div>
                        <SelectedOptionFooter
                          options={visibleInteractionOptions.filter(o => !o.gatedDisabled).map((option) => ({
                            value: option.value,
                            label: option.label,
                            description: option.detail,
                          }))}
                          selectedValue={selectedInteractionValue}
                        />
                        {getInterpretationNote('interaction') && (
                          <InterpretationNote message={getInterpretationNote('interaction')!} />
                        )}
                      </>
                    );
                  })()}
                </div>
              )}
              </>
            );
          })()}
        </div>
      </MotionInteractionBlock>
      )}

      {mode === 'studio' && (
      <WorldAtmosphereBlock
        icon={Layers}
        title={wineIndustryActive ? 'Bundle / Lineup' : undefined}
        description="Build the world around the product."
        isOpen={openAccordionId === 'productStructure'}
        onToggle={() => toggleSection('productStructure')}
        isTouched={touchedSections.has('productStructure')}
        variant="primary"
      >
        <div className="space-y-6">
          <p className="text-xs text-gray-500 dark:text-white/50">
            {wineIndustryActive
              ? 'Define how multiple bottles are grouped and rendered together.'
              : 'Define how products are grouped, bundled, and positioned.'}
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

              {/* Prebuilt Bundles (only when bundle mode is enabled and product count is sufficient) */}
              {productStore.bundle.enabled && PREBUILT_BUNDLES.filter(bundle => productStore.products.length >= bundle.minProducts).map(bundle => {
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
                      productStore.selectPrebuiltBundle(bundle.id);
                      markSectionTouched('productStructure');
                    }}
                    selected={isSelected}
                  >
                    {label}
                  </Chip>
                );
              })}
            </div>
          </div>

          {/* BUNDLE CONTROLS - Only if enabled */}
          {productStore.bundle.enabled && (
            <div className="space-y-4 border-t border-gray-200/60 pt-6 dark:border-white/10">
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
      </WorldAtmosphereBlock>
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
            iconClassName="text-[var(--lifestyle-accent)] dark:text-gray-300"
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
        mode === 'studio' && (
          <ProductCharacterBlock
            icon={MapPin}
            title={wineIndustryActive ? 'Scene' : 'Scene & Environment'}
            description={wineIndustryActive ? 'Location, background mood, and scene lighting.' : 'Where the product is placed and lit.'}
            id="product-environment"
            isOpen={openAccordionId === 'product-environment'}
            onToggle={() => toggleSection('product-environment')}
            isTouched={touchedSections.has('product-environment')}
            variant="primary"
          >
            <div className="space-y-6">
              <p className="text-xs text-gray-500 dark:text-white/50">
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
                      <div className="rounded-xl border border-gray-200 bg-white p-3 text-sm text-gray-500 dark:border-white/10 dark:bg-white/5 dark:text-white/60">
                        Environment is disabled while Background Canvas is On (neutral background mode).
                      </div>
                    )}

                    <div className={isDisabled ? 'opacity-50' : ''}>
                      <div className="p-5 space-y-4">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className={GROUP_LABEL_CLASS}>{wineIndustryActive ? 'LOCATION' : 'MACRO ENVIRONMENT'}</p>
                            <p className="text-xs text-gray-500 dark:text-white/50 mt-1">Pick a setting. Keep it simple unless you need specific staging.</p>
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

                        <div className="space-y-4">
                          {PRODUCT_ENVIRONMENT_MACRO_GROUPS.filter(group => {
                            if (group.label === 'Home') return true;
                            return productEnvironmentShowAllMacros;
                          }).map(group => (
                            <div key={group.label} className="space-y-3">
                              <p className="text-xs font-semibold text-gray-400 dark:text-white/40">
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

                        <label className="block space-y-2">
                          <p className={GROUP_LABEL_CLASS}>CUSTOM ENVIRONMENT</p>
                          <p className="text-xs text-gray-500 dark:text-white/50">Add custom staging or override the selected environment.</p>
                          <input
                            value={productStore.customEnvironmentText || ''}
                            onChange={(e) => {
                              productStore.setCustomEnvironmentText(e.target.value);
                              markSectionTouched('product-environment');
                            }}
                            placeholder="e.g. modern kitchen countertop with professional lighting"
                            disabled={isDisabled}
                            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-[var(--lifestyle-accent)] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/40"
                          />
                        </label>
                      </div>

                      <div className="p-5 space-y-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className={GROUP_LABEL_CLASS}>{wineIndustryActive ? 'BACKGROUND DETAILS' : 'MICRO PLACE'}</p>
                            <p className="text-xs text-gray-500 dark:text-white/50 mt-1">{wineIndustryActive ? 'Optional refinement for the immediate scene and backdrop.' : 'Optional refinement for where the product sits.'}</p>
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
                          <p className="text-xs text-gray-500 dark:text-white/50 mt-2">Select a macro environment to refine micro placement.</p>
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
                              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-[var(--lifestyle-accent)] focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/40"
                            />
                          </label>
                        )}
                      </div>

                      <div className="p-5 space-y-4">
                        <div>
                          <p className={GROUP_LABEL_CLASS}>{wineIndustryActive ? 'SCENE LIGHTING' : 'LIGHTING'}</p>
                          <p className="text-xs text-gray-500 dark:text-white/50 mt-1">Product-safe lighting style</p>
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
                    {wineIndustryActive && productStore.photoMode === 'Winery Scene' && PHOTO_MODE_SCHEMAS['Winery Scene'] && (
                      <PhotoModeSettings
                        schema={PHOTO_MODE_SCHEMAS['Winery Scene']!}
                        productStore={productStore}
                        markSectionTouched={markSectionTouched}
                      />
                    )}
                  </div>
                );
              })()}
            </div>
          </ProductCharacterBlock>
        )
      }

      {(mode === 'studio' || uiActiveEngine === 'studio') && wineIndustryActive && (
      <MotionInteractionBlock
        icon={Activity}
        title="Bottle Action"
        description="Bottle state, pour, and serve behavior."
        isOpen={openAccordionId === 'product-state-motion'}
        onToggle={() => toggleSection('product-state-motion')}
        isTouched={touchedSections.has('product-state-motion')}
        variant="primary"
      >
        <div className="space-y-6">
          {(() => {
            const allOptions = [
              { value: 'static', label: 'Static', detail: 'Closed and stationary.' },
              { value: 'opened', label: 'Opened', detail: 'Open bottle. No motion.' },
              { value: 'pouring', label: 'Pouring', detail: 'Controlled pour with natural downward flow.' },
            ] as const;

            const allowedProductStates = getResolvedAllowedMotions(
              productStore.photoMode,
              industryProfile,
              productStore.definition.type,
              undefined
            );

            const visibleStateOptions = allOptions.filter((option) =>
              allowedProductStates.includes(option.value as ProductStateMotion)
            );

            return (
              <>
                <p className="text-xs text-gray-500 dark:text-white/50">
                  Control whether the bottle is static, opened, or actively pouring.
                </p>

                <div className={SECTION_GROUP_CLASS}>
                  <p className={GROUP_LABEL_CLASS}>BOTTLE ACTION</p>
                  <div className="flex flex-wrap gap-2">
                    {visibleStateOptions.map((option) => (
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
                    ))}
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
                </div>
              </>
            );
          })()}
        </div>
      </MotionInteractionBlock>
      )}

      {false && mode === 'studio' && industryProfile !== 'wine' && (
      <AccordionSection
        icon={Hand}
        title="Interaction & Motion"
        description={`Product interaction.\nOne interaction per scene.`}
        isOpen={openAccordionId === 'product-interaction'}
        onToggle={() => toggleSection('product-interaction')}
        isTouched={touchedSections.has('product-interaction')}
        variant="primary"
      >
        <div className="space-y-6">
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
            const photoModeAllowlist2 = getPhotoModeInteractionAllowlist(productStore.photoMode);
            const visibleInteractionOptions = photoModeAllowlist2 !== null
              // Per-mode gating: show ALL entries from interactionOptionMap, mark disallowed as disabled
              ? (Object.entries(interactionOptionMap).map(([value, option]) => ({
                  value,
                  ...option,
                  gatedDisabled: !(photoModeAllowlist2 as string[]).includes(value),
                })))
              : resolvedAllowedInteractions
                  .map((interactionId) => {
                    const option = interactionOptionMap[interactionId];
                    if (!option) return null;
                    return {
                      value: interactionId,
                      ...option,
                      gatedDisabled: false,
                    };
                  })
                  .filter(Boolean) as Array<{
                    value: string;
                    label: string;
                    detail: string;
                    stateValue: ProductStudioState['interaction'];
                    gatedDisabled: boolean;
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
                    disabled={option.gatedDisabled}
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
              options={visibleInteractionOptions.filter(o => !o.gatedDisabled).map((option) => ({
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
      {false && mode === 'studio' && (
      <AccordionSection
        icon={Eye}
        title="Capture System"
        description="Viewpoint and camera capture control."
        isOpen={openAccordionId === 'viewpoint-vantage'}
        onToggle={() => toggleSection('viewpoint-vantage')}
        isTouched={touchedSections.has('viewpoint-vantage')}
        variant="secondary"
      >
        <div className="space-y-6">
          <p className="text-xs text-gray-500 dark:text-white/50">
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

      {mode === 'studio' && (
      <CinematographyBlock
        icon={Camera}
        description="Camera system, angle, and framing."
        isOpen={openAccordionId === 'product-camera'}
        onToggle={() => toggleSection('product-camera')}
        isTouched={touchedSections.has('product-camera')}
        variant="primary"
        title="Camera"
      >
        <div className="space-y-6">
          {(() => {
	            return (
	              <>
	          <p className="text-xs text-gray-500 dark:text-white/50">Professional photography controls.</p>
              <div className={SECTION_GROUP_CLASS}>
                <p className={GROUP_LABEL_CLASS}>VIEWPOINT</p>
                <div className="flex flex-wrap gap-2">
                  {(['eye-level', 'top-down', 'human-pov', 'suspended', 'display-view'] as const).map(vp => (
                    <Chip
                      key={vp}
                      selected={productStore.viewpoint === vp}
                      onClick={() => {
                        productStore.setViewpoint(vp);
                        markSectionTouched('product-camera');
                      }}
                      disabled={false}
                    >
                      {vp.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                    </Chip>
                  ))}
                </div>
              </div>
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

          <div className="space-y-4">
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
                    disabled={false}
                    onClick={() => {
                      // Auto-switch to surface for flat lays
                      if (option === 'Top-down flat lay') {
                        productStore.setPlacement('surface');
                      }

                      updateValue('productCameraAngle', option as any);
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
                    disabled={false}
                    onClick={() => {
                      updateValue('productCameraDistance', option);
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

          <div className="space-y-4">
            <div className={SECTION_GROUP_CLASS}>
              <p className={GROUP_LABEL_CLASS}>ROTATION</p>
              <div className="flex flex-wrap gap-3">
                {([0, 5, 10, 15] as const).map(option => (
                  <Chip
                    key={option}
                    onClick={() => {
                      updateValue('productCameraRotation', option);
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
              {!isProductMode && (
                <div className={SECTION_GROUP_CLASS}>
                  <p className={GROUP_LABEL_CLASS}>LIGHTING</p>
                  <p className="text-xs text-gray-500 dark:text-white/50">
                    Lighting is currently derived from Photo Mode. Manual overrides will be available in v1.1.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Chip selected disabled>
                      {productStore.lightingRig || 'Auto (from Photo Mode)'}
                    </Chip>
                  </div>
                </div>
              )}
	              </>
	            );
	          })()}
        </div>
      </CinematographyBlock>
      )}

      {/* ============================================================================
           10 / LIGHTING (v1.0 SPEC PLACEHOLDER)
           Lighting is currently derived from Photo Mode.
           Manual overrides will be available in v1.1.
           ============================================================================ */}
      {false && mode === 'studio' && !isProductMode && (
      <AccordionSection
        icon={Sun}
        title="Capture System"
        description="Lighting behavior and mood."
        isOpen={openAccordionId === 'lighting'}
        onToggle={() => toggleSection('lighting')}
        isTouched={touchedSections.has('lighting')}
        variant="secondary"
      >
        <div className="space-y-6">
          <p className="text-xs text-gray-500 dark:text-white/50">
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

      {isProductMode && wineIndustryActive && (
        <div className="space-y-4">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.35em] font-semibold text-gray-500 dark:text-white/40">Output</p>
            <p className="text-xs text-gray-500 dark:text-white/50">Final aspect ratio and export framing.</p>
          </div>
          <AccordionSection
            icon={Layers}
            title="Export Format"
            description="Aspect ratio for the final image"
            isOpen={openAccordionId === 'output'}
            onToggle={() => toggleSection('output')}
            variant="secondary"
          >
            <div className={SECTION_GROUP_CLASS}>
              <p className="text-xs text-[var(--lifestyle-accent)]">ASPECT RATIO</p>
              <div className="flex flex-wrap items-center gap-2">
                {ASPECT_RATIO_OPTIONS.map(option => (
                  <Chip
                    key={option}
                    title={ASPECT_RATIO_TOOLTIPS[option] || option}
                    selected={values.aspectRatio === option}
                    onClick={() => { updateValue('aspectRatio', option); markSectionTouched('output'); }}
                  >
                    {option}
                  </Chip>
                ))}
              </div>
            </div>
          </AccordionSection>
        </div>
      )}

      {mode === 'studio' && (
      <CommerceLayerBlock
        icon={Building2}
        title="Content Overlay"
        description={`Overlay and commerce extension settings.`}
        isOpen={openAccordionId === 'ecommerce'}
        onToggle={() => toggleSection('ecommerce')}
        isActive
        variant="secondary"
        className="border-amber-200 bg-amber-50/60 dark:bg-amber-500/10"
      >
        <div className="space-y-6">
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

              <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-8 dark:bg-white/5 dark:border-white/10">
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-[0.35em] font-semibold text-gray-500 dark:text-white/40">Background</p>
                  <p className="text-xs text-gray-500 dark:text-white/50">Neutral color or gradient</p>
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
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-mono text-gray-900 placeholder:text-gray-400 focus:border-[var(--lifestyle-accent)] focus:ring-1 focus:ring-[var(--lifestyle-accent)]"
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
                          <span className="text-xs font-medium tracking-wide text-gray-500 w-10">{cfg.label}</span>
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
                              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-mono text-gray-900 placeholder:text-gray-400 focus:border-[var(--lifestyle-accent)] focus:ring-1 focus:ring-[var(--lifestyle-accent)]"
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
                <p className="text-xs font-semibold text-gray-500">Overlays</p>
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
      </CommerceLayerBlock>
      )}

      {
        mode === 'lifestyle' && (
          <LifestyleStep3Layout>
            <div className="space-y-6">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-[0.35em] font-semibold text-gray-500 dark:text-white/40">SUBJECT</p>
                <p className="text-xs text-gray-500 dark:text-white/50">Who is in the frame and how they relate to the product.</p>
              </div>
            {showVisualIntentControl && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500 dark:text-white/50">Choose the lifestyle creative direction.</p>
                </div>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {([
                      { value: 'ugc', label: 'UGC' },
                      { value: 'editorial', label: 'Editorial' },
                      { value: 'brand', label: 'Brand' },
                      { value: 'luxury', label: 'Luxury' },
                    ] as const).map((option) => (
                      <Chip
                        key={option.value}
                        title={VISUAL_INTENT_TOOLTIPS[option.value]}
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
                    <p className="mt-3 text-xs text-gray-500 dark:text-white/50">
                      Luxury enforces disciplined framing.
                    </p>
                  )}
                  {((values.visualIntent ?? 'editorial') === 'ugc' || isUGCMode) && (
                    <p className="mt-1 text-xs text-gray-500 dark:text-white/50">
                      Camera controlled by UGC mode.
                    </p>
                  )}
                </div>
              </div>
            )}
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-[0.35em] font-semibold text-gray-500 dark:text-white/40">Creator</p>
                <p className="text-xs text-gray-500 dark:text-white/50">Define subjects, count, and identity controls.</p>
              </div>

            {/* Creator / Person */}
            <div
              className={`group rounded-xl border border-gray-200/70 bg-white overflow-hidden dark:bg-white/5 dark:border-white/10 ${isCreatorPro ? 'is-pro' : ''}`}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-white/10">
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    Creator / Person
                  </p>
                  <p className="text-xs text-gray-500 dark:text-white/50">Define a realistic human subject for the scene</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-white/50">
                  <span>Pro</span>
                  <SwitchToggle
                    checked={isCreatorPro}
                    onCheckedChange={setIsCreatorPro}
                    aria-label="Enable creator pro mode"
                  />
                </div>
              </div>

              <div className="px-6 py-8 space-y-8">
                {isPersonDisabled ? (
                  <div className="rounded-xl border border-gray-200 bg-white p-5 text-sm text-gray-500 dark:border-white/10 dark:bg-black/20 dark:text-white/60">
                    Creator / Person controls are disabled in Product Mode.
                  </div>
                ) : (
                  <>
                    <section className="space-y-8">
                      <div className="flex items-center gap-2">
                        <p className={GROUP_LABEL_CLASS}>CORE IDENTITY</p>
                        {touchedSections.has('creator') && <Check className="w-4 h-4 text-[var(--lifestyle-accent)] dark:text-gray-300" />}
                      </div>

                      <div className="space-y-6">
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
                            ? (['Female', 'Male', 'Mix', 'Trans', 'Non-binary', 'Gender non-conforming'] as const)
                            : (['Female', 'Male', 'Mix'] as const)
                          ).map(option => {
                            const mixDisabled = option === 'Mix' && values.personCount !== 'group';
                            return (
                              <Chip
                                title={mixDisabled ? 'Mix is only available when Person count is Group.' : (GENDER_TOOLTIPS[option] || option)}
                                key={option}
                                onClick={() => {
                                  if (mixDisabled) return;
                                  updateValue('gender', option as any);
                                  if (option === 'Mix' && values.personCount === 'group') {
                                    updateValue('ethnicity', 'Mixed');
                                  } else if (values.ethnicity === 'Mixed') {
                                    updateValue('ethnicity', 'Non-specific');
                                  }
                                  markSectionTouched('creator');
                                }}
                                selected={values.gender === (option as any)}
                                size="md"
                                disabled={mixDisabled}
                                tooltip={mixDisabled ? 'Only available for Group.' : undefined}
                              >
                                {option}
                              </Chip>
                            );
                          })}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="space-y-1">
                          <span className="text-xs font-medium text-gray-600 dark:text-white/60">Person count</span>
                          <p className="text-[11px] text-gray-400 dark:text-white/40">Choose single creator, a couple, or a small group.</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Chip
                            title={PERSON_COUNT_TOOLTIPS.single}
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
                            title={PERSON_COUNT_TOOLTIPS.couple}
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
                            title={PERSON_COUNT_TOOLTIPS.group}
                            onClick={() => {
                              if (isUGCMode) return;
                              updateValue('personCount', 'group');
                              updateValue('editSecondaryPerson', false);
                              markSectionTouched('creator');
                            }}
                            selected={values.personCount === 'group'}
                            size="md"
                            disabled={isUGCMode}
                            tooltip={isUGCMode ? 'Group not compatible with UGC mode.' : undefined}
                          >
                            Group
                          </Chip>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <span className="text-xs text-gray-600 dark:text-white/60">Ethnicity</span>
                        <div className="flex flex-wrap gap-2">
                          {(() => {
                            const mixedGroupEthnicityLocked =
                              values.personCount === 'group' && values.gender === 'Mix';
                            return (isCreatorPro
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
                                'Mixed',
                              ] as const)
                            ).map(option => {
                              const optionDisabled =
                                mixedGroupEthnicityLocked && option !== 'Mixed';
                              return (
                                <Chip
                                  title={
                                    optionDisabled
                                      ? 'When Gender is Mix for a Group, Ethnicity is locked to Mix to avoid twin-like casting.'
                                      : (ETHNICITY_TOOLTIPS[option] || option)
                                  }
                                  key={option}
                                  onClick={() => {
                                    if (optionDisabled) return;
                                    updateValue('ethnicity', option);
                                    markSectionTouched('creator');
                                  }}
                                  selected={values.ethnicity === option}
                                  size="md"
                                  disabled={optionDisabled}
                                  tooltip={optionDisabled ? 'Locked to Mix for mixed groups.' : undefined}
                                >
                                  {option === 'Mixed' ? 'Mix' : option}
                                </Chip>
                              );
                            });
                          })()}
                        </div>
                      </div>
                      </div>
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
                              >
                                {option}
                              </Chip>
                            ))}
                          </div>
                        </div>
                    </section>

                    <section className="space-y-6">
                      <div className="space-y-3 border-t border-gray-200/60 pt-6 dark:border-white/10">
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
                      </div>

                      <div className="space-y-4 border-t border-gray-200/60 pt-6 dark:border-white/10">
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">Product Interaction</p>
                          <p className="text-xs text-gray-500 dark:text-white/50">Define how the subject engages with the product.</p>
                        </div>
                        <div className={`space-y-3 ${hasUploadedProductAsset ? '' : 'opacity-50'}`}>
                          <div className={`flex flex-wrap gap-2 ${hasUploadedProductAsset ? '' : 'pointer-events-none select-none'}`}>
                            {PRODUCT_INTERACTION_OPTIONS.map(option => (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() => {
                                  updateValue('productInteraction', option.value);
                                  markSectionTouched('productInteraction');
                                }}
                                className={getTogglePillClass(values.productInteraction === option.value)}
                                disabled={!hasUploadedProductAsset}
                              >
                                {option.label}
                              </button>
                            ))}
                          </div>
                          {!hasUploadedProductAsset && (
                            <p className="text-[11px] text-gray-500 dark:text-white/50">
                              Upload a product to enable Product Interaction.
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <span className="text-xs text-gray-600 dark:text-white/60">Eye direction</span>
                        <div className="flex flex-wrap gap-2">
                          {EYE_DIRECTION_OPTIONS.map(option => {
                            const active = values.eyeDirection === option;
                            return (
                              <Chip
                                title={EYE_DIRECTION_TOOLTIPS[option] || option}
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
                                    title={GENDER_TOOLTIPS[option] || option}
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
                                    title={ETHNICITY_TOOLTIPS[option] || option}
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
                                <div className="pt-3 dark:border-white/10" />

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

                    </section>
                    )}
                  </>
                )}
            </div>
            </div>
            </div>

            {/* Legacy Props Section (Restored for Lifestyle) */}
            <div className="space-y-6 border-t border-gray-200/60 pt-12 dark:border-white/10">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-[0.35em] font-semibold text-gray-500 dark:text-white/40">SCENE</p>
                <p className="text-xs text-gray-500 dark:text-white/50">Where the story happens.</p>
              </div>
              <div className="rounded-xl border border-gray-200/70 bg-white p-8 space-y-10 dark:bg-white/5 dark:border-white/10">
            {!isProductMode && (
              <div className="space-y-4">
                <div className="space-y-4">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">Props</p>
                  <p className="text-xs text-gray-500 dark:text-white/50">Add objects to the scene</p>
                </div>
                <div className="space-y-5">
                  <div className={SECTION_GROUP_CLASS}>
                    <p className={GROUP_LABEL_CLASS}>SCENE PROPS</p>
                    <p className="text-[11px] text-gray-500">Select props to include in the scene.</p>
                    <div className="flex flex-wrap gap-2">
                      {/* Note: Assuming generic props list or custom input since original list is missing from context */}
                      <div className="w-full">
                        <p className="text-xs font-semibold text-gray-700 mb-2">Custom props</p>
                        <textarea
                          value={values.customProps}
                          onChange={(e) => {
                            updateValue('customProps', e.target.value);
                            markSectionTouched('props');
                          }}
                          placeholder="e.g. coffee cup, laptop, yoga mat..."
                          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-[var(--lifestyle-accent)] focus:ring-1 focus:ring-[var(--lifestyle-accent)] min-h-[80px]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}


            {/* RAW DOMESTIC UGC */}
            {isUGCMode && (
              <div id="ugc-real-mode" className="space-y-5 border-t border-gray-200/60 pt-6 dark:border-white/10">
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
                        <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 space-y-2">
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <p className="text-xs text-[var(--lifestyle-accent)]">UGC Full Automation</p>
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
                            <div className="mt-2 rounded-lg bg-white/60 border border-gray-200 px-3 py-3 space-y-3">
                              <div>
                                <p className="text-xs text-[var(--lifestyle-accent)] mb-1">Active Mode</p>
                                <p className="text-xs text-gray-700">
                                  Full automation active. All controls below are disabled. Scene will be generated with maximum natural entropy.
                                </p>
                              </div>
                              
                              {/* Gender Preference (optional) */}
                              <div>
                                <p className="text-xs text-gray-600 mb-2">Gender Preference (Optional)</p>
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

                        <div className="space-y-2 border-t border-gray-200/60 pt-4 dark:border-white/10">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-xs text-gray-500 font-extrabold">IMPERFECTION LEVEL</p>
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
                                  <p className="text-xs text-gray-500">{section.title}</p>
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
            )}

            {/* Environment */}
            <div className="space-y-4 border-t border-gray-200/60 pt-6 dark:border-white/10">
              <div className="space-y-4">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Environment</p>
                <p className="text-xs text-gray-500 dark:text-white/50">Where the scene takes place</p>
              </div>
              <div className="space-y-3">
                {values.visualMode === 'ugc' && (
                  <div className="border-t border-gray-200/60 pt-3 text-xs text-gray-500 dark:border-white/10 dark:text-white/60">
                    Raw Domestic UGC still honors your environment choice—it just interprets it as incidental and unstaged. Pick any room; the engine keeps it messy, domestic, and low intent.
                  </div>
                )}
                <p className="text-xs font-semibold text-gray-700">Indoor</p>
                <div className="flex flex-wrap gap-2">
                  {ENVIRONMENT_INDOOR.map(env => (
                    <button
                      key={env.value}
                      type="button"
                      title={ENVIRONMENT_TOOLTIPS[env.value] || env.value}
                      onClick={() => { updateValue('environment', env.value); markSectionTouched('environment'); }}
                      className={`flex items-center gap-2 px-3 py-1.5 text-xs ${getTogglePillClass(values.environment === env.value)}`}
                    >
                      <env.icon className="w-4 h-4" />
                      <span>{env.value}</span>
                    </button>
                  ))}
                </div>

                {values.visualMode !== 'ugc' && (
                  <>
                    <p className="text-xs font-semibold text-gray-700 pt-2">Outdoor</p>
                    <div className="flex flex-wrap gap-2">
                      {ENVIRONMENT_OUTDOOR.map(env => (
                        <button
                          key={env.value}
                          type="button"
                          title={ENVIRONMENT_TOOLTIPS[env.value] || env.value}
                          onClick={() => { updateValue('environment', env.value); markSectionTouched('environment'); }}
                          className={`flex items-center gap-2 px-3 py-1.5 text-xs ${getTogglePillClass(values.environment === env.value)}`}
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
                  <p className="text-xs font-semibold text-gray-700 mb-2">Custom environment</p>
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
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-[var(--lifestyle-accent)] focus:ring-1 focus:ring-[var(--lifestyle-accent)]"
                  />
                </div>

              </div>
            </div>

            {/* Ritual Mode (Lifestyle-only) */}
            {!isProductMode && (
              <div className="space-y-4 border-t border-gray-200/60 pt-6 dark:border-white/10">
                <div className="space-y-4">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">Ritual Mode</p>
                  <p className="text-xs text-gray-500 dark:text-white/50">Lifestyle rituals + optional product-free renders</p>
                </div>
                <div className="space-y-5">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
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
                      <div className="border-t border-gray-200/60 pt-4 dark:border-white/10">
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-gray-500">Hide product (lifestyle-only)</p>
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

                      <div className="border-t border-gray-200/60 pt-4 dark:border-white/10">
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-gray-500">No objects (people + environment only)</p>
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
                          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-[var(--lifestyle-accent)] focus:ring-1 focus:ring-[var(--lifestyle-accent)]"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
              </div>
            </div>

            <section className="space-y-6 border-t border-gray-200/60 pt-12 dark:border-white/10">
              <header className="space-y-1">
                <p className="text-xs uppercase tracking-[0.35em] font-semibold text-gray-500 dark:text-white/40">CAPTURE</p>
                <p className="text-xs text-gray-500 dark:text-white/50">How the moment is filmed.</p>
              </header>
              <div className="mt-6 rounded-xl border border-gray-200/70 bg-white p-8 space-y-10 dark:bg-white/5 dark:border-white/10">
            {/* Lighting */}
              <div className="space-y-4">
                <div className="space-y-4">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">Lighting</p>
                </div>
              {values.visualMode === 'ugc' ? (
                <div className="border-t border-gray-200/60 pt-3 text-sm text-gray-600 dark:border-white/10 dark:text-white/60">
                  Lighting is locked to indifferent domestic fixtures with mixed temperatures, clipped highlights, and crushed shadows. Turn Raw Domestic UGC off to control lighting.
                </div>
              ) : (
                <div className="space-y-3">
                  {/* LIGHTING STYLE */}
                  <div className={SECTION_GROUP_CLASS}>
                    <div className="flex flex-wrap gap-2">
                      {LIGHTING_OPTIONS.map(option => (
                        <button
                          key={option.value}
                          type="button"
                          title={LIGHTING_STYLE_TOOLTIPS[option.label] || option.label}
                          onClick={() => { updateValue('lightingStyle', option.label); markSectionTouched('lighting'); }}
                          className={getTogglePillClass(values.lightingStyle === option.label)}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {
                <div className="space-y-4 border-t border-gray-200/60 pt-6 dark:border-white/10">
                <div className="space-y-4">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">Camera & Framing</p>
                </div>
                <div className="space-y-3">
                  <div className={SECTION_GROUP_CLASS}>
                    <div>
                      <p className="text-xs font-semibold text-gray-700">Camera type</p>
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
                              !LUXURY_UI_ALLOWED_CAMERA_TYPES.includes(option.label as (typeof LUXURY_UI_ALLOWED_CAMERA_TYPES)[number]);
                            const isDisabled = cameraSectionLockedByUgc || isLuxuryIncompatible;
                            return (
                            <Chip
                              key={option.value}
                              size="md"
                              selected={values.cameraType === option.label}
                              onClick={() => {
                                if (isDisabled) return;
                                updateValue('cameraType', option.label);
                                markSectionTouched('camera');
                              }}
                              title={isLuxuryIncompatible ? 'Not compatible with Luxury identity.' : (CAMERA_TYPE_TOOLTIPS[option.label] || option.label)}
                              disabled={isDisabled}
                            >
                              {option.label}
                            </Chip>
                            );
                          })}
                      </div>
                    </div>

                    <div className={SECTION_GROUP_CLASS}>
                      <p className="text-xs font-semibold text-gray-700">Shot type</p>
                      <div className="flex flex-wrap items-center gap-2">
                        {SHOT_TYPE_OPTIONS.map(option => {
                          const isLuxuryIncompatible =
                            isLuxuryIntent &&
                            isLifestyleCompatibilityActive &&
                            !LUXURY_UI_ALLOWED_SHOT_TYPES.includes(option as (typeof LUXURY_UI_ALLOWED_SHOT_TYPES)[number]);
                          const isDisabled = cameraSectionLockedByUgc || isLuxuryIncompatible;
                          return (
                          <Chip
                            key={option}
                            size="md"
                            selected={values.shotType === option}
                            onClick={() => {
                              if (isDisabled) return;
                              updateValue('shotType', option);
                              markSectionTouched('camera');
                            }}
                            title={isLuxuryIncompatible ? 'Not compatible with Luxury identity.' : (SHOT_TYPE_TOOLTIPS[option] || option)}
                            disabled={isDisabled}
                          >
                            {option}
                          </Chip>
                          );
                        })}
                      </div>
                    </div>

                    <div className={SECTION_GROUP_CLASS}>
                      <p className="text-xs font-semibold text-gray-700">Composition</p>
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
                            !LUXURY_UI_ALLOWED_COMPOSITIONS.includes(option.value as (typeof LUXURY_UI_ALLOWED_COMPOSITIONS)[number]);
                          const isDisabled = cameraSectionLockedByUgc || isLuxuryIncompatible;
                          return (
                          <Chip
                            key={option.value}
                            size="md"
                            selected={values.productProminence === option.value}
                            onClick={() => {
                              if (isDisabled) return;
                              updateValue('productProminence', option.value);
                              markSectionTouched('camera');
                            }}
                            title={isLuxuryIncompatible ? 'Not compatible with Luxury identity.' : (COMPOSITION_TOOLTIPS[option.value] || option.label)}
                            disabled={isDisabled}
                          >
                            {option.label}
                          </Chip>
                          );
                        })}
                      </div>
                    </div>

                    <div className={SECTION_GROUP_CLASS}>
                      <p className="text-xs font-semibold text-gray-700">Camera angle</p>
                      <div className="flex flex-wrap items-center gap-2">
                        {CAMERA_ANGLE_OPTIONS.map(option => {
                          const isLuxuryIncompatible =
                            isLuxuryIntent &&
                            isLifestyleCompatibilityActive &&
                            !LUXURY_UI_ALLOWED_ANGLES.includes(option as (typeof LUXURY_UI_ALLOWED_ANGLES)[number]);
                          const isDisabled = cameraSectionLockedByUgc || isLuxuryIncompatible;
                          return (
                          <Chip
                            key={option}
                            size="md"
                            selected={values.cameraAngle === option}
                            onClick={() => {
                              if (isDisabled) return;
                              updateValue('cameraAngle', option);
                              markSectionTouched('camera');
                            }}
                            title={isLuxuryIncompatible ? 'Not compatible with Luxury identity.' : (CAMERA_ANGLE_TOOLTIPS[option] || option)}
                            disabled={isDisabled}
                          >
                            {option}
                          </Chip>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
            }
              </div>
            </section>
            {/* BUNDLES SYSTEM - STRICTLY ISOLATED */}
            {/* Bundles are enabled ONLY when multiple products are uploaded. */}
            {/* Bundles control product grouping only. */}
            {/* Bundles must never affect modes, composition, or human presence. */}
            {
              isProductMode && productCount > 1 && (
                <div id="bundles" className="mt-6">
                  <div className="rounded-xl border border-gray-200/70 bg-white p-5 space-y-5">
                    <div className="flex flex-col gap-1">
                      <p className="text-xs text-[var(--lifestyle-accent)]">Bundles</p>
                      <p className="text-sm text-gray-500">
                        Quickly swap between curated packs, your own mix, or AI-recommended combos.
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button type="button" className="rounded-full border px-3 py-1 text-xs font-semibold transition-colors bg-[var(--lifestyle-accent)] text-white border-[var(--lifestyle-accent)]">
                        Pre-made Bundles
                      </button>
                      <button type="button" className="rounded-full border px-3 py-1 text-xs font-semibold transition-colors border-gray-200 bg-gray-50 text-gray-600 hover:border-[var(--lifestyle-accent)] hover:text-gray-900 dark:bg-white/5">
                        Custom Bundle Builder
                      </button>
                      <button type="button" className="rounded-full border px-3 py-1 text-xs font-semibold transition-colors border-gray-200 bg-gray-50 text-gray-600 hover:border-[var(--lifestyle-accent)] hover:text-gray-900 dark:bg-white/5">
                        Recommended Bundles
                      </button>
                    </div>

                    <div className="space-y-5">
                      <div className="flex flex-col gap-2">
                        <label className="text-xs text-gray-500">Pick a bundle</label>
                        <select className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-[var(--lifestyle-accent)] focus:outline-none">
                          <option value="essentials_trio">Core Essentials Trio</option>
                          <option value="daily_duo">Daily Duo Stack</option>
                          <option value="launch_showcase">Launch Showcase Set</option>
                          <option value="hero_lineup">Complete Hero Lineup</option>
                        </select>
                      </div>

                      <div className="rounded-xl border border-gray-200/70 bg-white p-5 space-y-3">
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

                      <button type="button" disabled className="w-full rounded-xl bg-[var(--lifestyle-accent)] text-white px-4 py-2 text-sm font-semibold text-white disabled:bg-white">
                        Generate Bundle Mockup
                      </button>
                    </div>
                  </div>
                </div>
              )
            }

          {/* HERO CANVAS (BACKGROUND REPLACEMENT) */}
          {/* Coexists with Lifestyle controls; applies only when enabled. */}
          <section className="space-y-6 border-t border-gray-200/60 pt-12 dark:border-white/10">
            <header className="space-y-1">
              <p className="text-xs uppercase tracking-[0.35em] font-semibold text-gray-500 dark:text-white/40">OUTPUT</p>
              <p className="text-xs text-gray-500 dark:text-white/50">Final polish and delivery format.</p>
            </header>
          <div className="mt-6 rounded-xl border border-gray-200/70 bg-white p-8 space-y-10 dark:bg-white/5 dark:border-white/10">
          <div className="space-y-4">
            <div className="space-y-4">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Hero</p>
              <p className="text-xs text-gray-500 dark:text-white/50">Neutral background + placement (Lifestyle)</p>
            </div>
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
                      <p className="text-xs text-[var(--lifestyle-accent)]">SIDE PLACEMENT</p>
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

                  <div className="space-y-5 border-t border-gray-200/60 pt-4 dark:border-white/10">
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-gray-500">Background</p>
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
                        <p className="text-xs font-medium tracking-wide text-gray-500">Solid background color</p>
                        <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-2.5 transition-colors hover:border-[var(--lifestyle-accent)]">
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
                              <p className="text-xs font-medium tracking-wide text-gray-500">{cfg.label}</p>
                              <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-2.5 transition-colors hover:border-[var(--lifestyle-accent)]">
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
                            className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-600 transition-colors hover:border-[var(--lifestyle-accent)] hover:text-gray-900"
                          >
                            Invert
                          </button>
                        </div>
                        <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white">
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
          </div>

          <div className="space-y-4 border-t border-gray-200/60 pt-6 dark:border-white/10">
            <div className="space-y-4">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Outfit Builder</p>
              <p className="text-xs text-gray-500 dark:text-white/50">Configure garments using structured controls.</p>
            </div>
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-900 dark:text-white">Enable outfit builder</span>
                <SwitchToggle
                  checked={values.customClothesEnabled}
                  aria-label="Enable outfit builder"
                  onCheckedChange={(next) => {
                    updateValue('customClothesEnabled', next);
                    markSectionTouched('customClothes');
                  }}
                />
              </div>

              {values.customClothesEnabled && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500">Garment type</label>
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
                    <label className="text-xs font-medium text-gray-500">Primary color</label>
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
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-gray-500">Custom color</p>
                        <p className="text-[11px] text-gray-500">Pick any hex color.</p>
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
                          className="w-[110px] rounded-xl border border-gray-200 bg-white px-2 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[var(--lifestyle-accent)] focus:ring-1 focus:ring-[var(--lifestyle-accent)]"
                        />
                        {isHexColor(values.customClothesPrimaryColor) && (
                          <button
                            type="button"
                            onClick={() => {
                              updateValue('customClothesPrimaryColor', '');
                              markSectionTouched('customClothes');
                            }}
                            className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:border-[var(--lifestyle-accent)]"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-500">Fit</label>
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
                    <label className="text-xs font-medium text-gray-500">Style</label>
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
                    <label className="text-xs font-medium text-gray-500">Material</label>
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
                    <label className="text-xs font-medium text-gray-500">Custom detail (optional)</label>
                    <input
                      type="text"
                      maxLength={100}
                      value={values.customClothesDetail}
                      onChange={(event) => {
                        updateValue('customClothesDetail', event.target.value.replace(/[\r\n]/g, ''));
                        markSectionTouched('customClothes');
                      }}
                      placeholder="small embroidered logo on the chest"
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-[var(--lifestyle-accent)] focus:ring-1 focus:ring-[var(--lifestyle-accent)]"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4 border-t border-gray-200/60 pt-6 dark:border-white/10">
            <div className="space-y-4">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Formulation Story</p>
              <p className="text-xs text-gray-500 dark:text-white/50">Align brand expert, research, and product goals</p>
            </div>
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
                    <label className="text-xs text-[var(--lifestyle-accent)]">Expert Name</label>
                    <input
                      type="text"
                      value={values.expertName}
                      onChange={(e) => { updateValue('expertName', e.target.value); markSectionTouched('formulationStory'); }}
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-[var(--lifestyle-accent)] focus:ring-1 focus:ring-[var(--lifestyle-accent)]"
                      placeholder="The name you enter here (e.g., 'Dr. Ali M.D') will be embroidered on the medical attire."
                    />
                  </div>

                  <div className={SECTION_GROUP_CLASS}>
                    <label className="text-xs text-[var(--lifestyle-accent)]">Expert Credentials</label>
                    <input
                      type="text"
                      value={values.expertCredentials}
                      onChange={(e) => { updateValue('expertCredentials', e.target.value); markSectionTouched('formulationStory'); }}
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-[var(--lifestyle-accent)] focus:ring-1 focus:ring-[var(--lifestyle-accent)]"
                      placeholder="e.g., Formulation Scientist, 12 years mixing botanicals"
                    />
                  </div>

                  <div className={SECTION_GROUP_CLASS}>
                    <p className="text-xs text-[var(--lifestyle-accent)]">Expert Role</p>
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
                        className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-[var(--lifestyle-accent)] focus:ring-1 focus:ring-[var(--lifestyle-accent)]"
                        placeholder="e.g., Board-Certified Toxicologist, Herbal Formulator, Lab Director"
                      />
                    )}
                  </div>

                  <div className={SECTION_GROUP_CLASS}>
                    <p className="text-xs text-[var(--lifestyle-accent)]">Medical Attire</p>
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
                    <p className="text-xs text-[var(--lifestyle-accent)]">Lab Vibe</p>
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
                        className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-[var(--lifestyle-accent)] focus:ring-1 focus:ring-[var(--lifestyle-accent)]"
                        placeholder="e.g., university research lab, clean home workbench, small apothecary corner"
                      />
                    )}
                  </div>

                  <div className={SECTION_GROUP_CLASS}>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <p className="text-xs text-[var(--lifestyle-accent)]">Product Visible</p>
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
          </div>
          </div>

      {/* Final Frame - LAST */}
      <div className="space-y-6 border-t border-gray-200/60 pt-12 dark:border-white/10">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.35em] font-semibold text-gray-500 dark:text-white/40">Final Frame</p>
          <p className="text-xs text-gray-500 dark:text-white/50">Final aspect ratio and delivery settings.</p>
        </div>
        <div className="rounded-xl border border-gray-200/70 bg-white p-8 dark:bg-white/5 dark:border-white/10">
          <div className="space-y-4">
            <p className="text-xs font-semibold text-gray-700">Aspect ratio</p>
            <div className="flex flex-wrap items-center gap-2">
              {ASPECT_RATIO_OPTIONS.map(option => (
                isProductMode ? (
                  <Chip
                    key={option}
                    title={ASPECT_RATIO_TOOLTIPS[option] || option}
                    selected={values.aspectRatio === option}
                    onClick={() => { updateValue('aspectRatio', option); markSectionTouched('output'); }}
                  >
                    {option}
                  </Chip>
                ) : (
                  <Chip
                    key={option}
                    title={ASPECT_RATIO_TOOLTIPS[option] || option}
                    selected={values.aspectRatio === option}
                    onClick={() => { updateValue('aspectRatio', option); markSectionTouched('output'); }}
                  >
                    {option}
                  </Chip>
                )
              ))}
            </div>
          </div>
        </div>
      </div>
          </section>
          </LifestyleStep3Layout>
        )
      }

      {isProductMode && !wineIndustryActive && (
        <div className="space-y-4">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.35em] font-semibold text-gray-500 dark:text-white/40">Output</p>
            <p className="text-xs text-gray-500 dark:text-white/50">Final aspect ratio and export framing.</p>
          </div>
          <AccordionSection
            icon={Layers}
            title="Export Format"
            description="Aspect ratio for the final image"
            isOpen={openAccordionId === 'output'}
            onToggle={() => toggleSection('output')}
            variant="secondary"
          >
            <div className={SECTION_GROUP_CLASS}>
              <p className="text-xs text-[var(--lifestyle-accent)]">ASPECT RATIO</p>
              <div className="flex flex-wrap items-center gap-2">
                {ASPECT_RATIO_OPTIONS.map(option => (
                  <Chip
                    key={option}
                    title={ASPECT_RATIO_TOOLTIPS[option] || option}
                    selected={values.aspectRatio === option}
                    onClick={() => { updateValue('aspectRatio', option); markSectionTouched('output'); }}
                  >
                    {option}
                  </Chip>
                ))}
              </div>
            </div>
          </AccordionSection>
        </div>
      )}

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
