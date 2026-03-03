

import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MockupOptions, OptionCategory, Option } from './types';
import { Info, Moon, Sun } from 'lucide-react';
import Logo from './src/components/Logo';
import {
  CONTENT_STYLE_OPTIONS,
  CREATION_MODE_OPTIONS,
  PLACEMENT_STYLE_OPTIONS,
  PLACEMENT_CAMERA_OPTIONS,
  LIGHTING_OPTIONS, SETTING_OPTIONS, AGE_GROUP_OPTIONS, CAMERA_OPTIONS,
  PERSPECTIVE_OPTIONS, SELFIE_TYPE_OPTIONS, ETHNICITY_OPTIONS,
  GENDER_OPTIONS, ASPECT_RATIO_OPTIONS, ENVIRONMENT_ORDER_OPTIONS, PERSON_APPEARANCE_OPTIONS,
  PRODUCT_MATERIAL_OPTIONS, PRODUCT_INTERACTION_OPTIONS, REALISM_OPTIONS,
  PERSON_POSE_OPTIONS, WARDROBE_STYLE_OPTIONS, PERSON_MOOD_OPTIONS,
  PERSON_PROP_OPTIONS, MICRO_LOCATION_OPTIONS, MICRO_LOCATION_NONE_VALUE, PERSON_EXPRESSION_OPTIONS, HAIR_STYLE_OPTIONS,
  CREATOR_PRESETS, PROP_BUNDLES, PRO_LENS_OPTIONS, PRO_LIGHTING_RIG_OPTIONS, PRO_POST_TREATMENT_OPTIONS, PRO_LOOK_PRESETS, PRODUCT_PLANE_OPTIONS, SUPPLEMENT_PHOTO_PRESETS, HERO_PERSON_PRESETS, HERO_PERSON_DESCRIPTION_PRESETS,
  HAIR_COLOR_OPTIONS, EYE_COLOR_OPTIONS, SKIN_TONE_OPTIONS, HeroLandingAlignment, HeroLandingShadowStyle, DOWNLOAD_CREDIT_CONFIG, HIGH_RES_UNAVAILABLE_MESSAGE, SKIN_REALISM_OPTIONS,
  COMPOSITION_MODE_OPTIONS, SIDE_PLACEMENT_OPTIONS,
  CAMERA_SHOT_OPTIONS, CAMERA_ANGLE_OPTIONS, CAMERA_DISTANCE_OPTIONS,
  getOptionValueByLabel
} from './constants';
import type { CreatorPreset, DownloadResolution, HeroPosePreset, PropBundle, ProLookPreset, SupplementPhotoPreset } from './constants';
import BundleSelector from './src/bundles/components/BundleSelector';
import CustomBundleBuilder from './src/bundles/components/CustomBundleBuilder';
import RecommendedBundle from './src/bundles/components/RecommendedBundle';
import { ALL_PRODUCT_IDS, PRODUCT_MEDIA_LIBRARY, ProductId, ProductMediaLibrary } from './src/bundles/bundles.config';
import UGCRealModePanel from './components/UGCRealModePanel';
import {
  UGC_CLOTHING_PRESETS,
  UGC_EXPRESSION_PRESETS,
  UGC_OFF_CENTER_OPTIONS,
  UGC_SPONTANEOUS_FRAMING_OPTIONS,
  UGC_REAL_MODE_BASE_PROMPT,
} from './src/data/ugcPresets';
import { normalizeOptions } from './src/system/normalizeOptions';
import { promptEngine } from './src/lib/promptEngine';
import { mapLifestyleToPromptOptions } from './src/lib/promptEngine/mapLifestyleToPromptOptions';
import { mapProductModeToPromptOptions } from './src/lib/promptEngine/mapProductModeToPromptOptions';
import { createGenerationLog, installGenerationLogBridge, updateGenerationLog } from './src/lib/debug/generationLog';
import LifestyleStep3, { type Step3Values } from "@/components/LifestyleStep3";
import { type EcommerceGenerationSettings } from '@/components/EcommerceStep3';
import type { EcommerceSlotKey, EcommerceSlotsConfig } from '@/lib/ecommerceOverlay/types';
import { loadEcommerceSlotsConfig, saveEcommerceSlotsConfig } from '@/lib/ecommerceOverlay/storage';
import { ECOMMERCE_SLOT_REQUIRED_BLANK_SPACE } from '@/lib/ecommerceOverlay/templates';
import { PLAN_CONFIG, type PlanTier } from './src/constants/planConfig';
import { addLocalGalleryEntry, pruneLocalGallery } from './src/services/localGallery';
// PHASE 2: ProductStudio direct generation
import {
  useProductStudioStore,
  generateProductJobs,
  validatePrompt,
  type EcommerceSlot as EcommercePdpSlot,
  type EcommercePdpLayout,
  type EcommercePdpImageSide,
  type EcommercePdpSafeZone,
} from '@/lib/productStudio';
import { addProductWithPalette } from '@/lib/productStudio/store';
import { isStudioV2Enabled } from '@/lib/productStudio/promptRouter';



type UGCRealModeSettings = {
  isEnabled: boolean;
  selectedClothingPresetIds: string[];
  clothingUpload: File | null;
  clothingPreview: string | null;
  selectedExpressionId: string | null;
  blurAmount: number;
  grainAmount: number;
  lowResolution: boolean;
  imperfectLighting: boolean;
  offFocus: boolean;
  tiltedPhone: boolean;
  offCenterId: string;
  framingId: string;
};

const PRODUCT_DEFAULT_ASPECT_RATIO = '1:1' as const;
const ECOMMERCE_PDP_ASPECT_RATIO = '1:1' as const;

type EcommercePdpGenerationMeta = {
  sceneType: 'ecommerce-pdp';
  slot: EcommercePdpSlot;
  layout: EcommercePdpLayout;
  imageSide: EcommercePdpImageSide;
  safeZone: EcommercePdpSafeZone;
};

const createDefaultUGCRealSettings = (): UGCRealModeSettings => ({
  isEnabled: false,
  selectedClothingPresetIds: [],
  clothingUpload: null,
  clothingPreview: null,
  selectedExpressionId: null,
  blurAmount: 20,
  grainAmount: 25,
  lowResolution: false,
  imperfectLighting: true,
  offFocus: false,
  tiltedPhone: false,
  offCenterId: UGC_OFF_CENTER_OPTIONS[2]?.id ?? 'center-loose',
  framingId: UGC_SPONTANEOUS_FRAMING_OPTIONS[0]?.id ?? 'arm-length',
});

const cloneUGCRealSettings = (settings?: UGCRealModeSettings): UGCRealModeSettings => ({
  isEnabled: settings?.isEnabled ?? false,
  selectedClothingPresetIds: [...(settings?.selectedClothingPresetIds ?? [])],
  clothingUpload: settings?.clothingUpload ?? null,
  clothingPreview: settings?.clothingPreview ?? null,
  selectedExpressionId: settings?.selectedExpressionId ?? null,
  blurAmount: settings?.blurAmount ?? 20,
  grainAmount: settings?.grainAmount ?? 25,
  lowResolution: settings?.lowResolution ?? false,
  imperfectLighting: settings?.imperfectLighting ?? true,
  offFocus: settings?.offFocus ?? false,
  tiltedPhone: settings?.tiltedPhone ?? false,
  offCenterId: settings?.offCenterId ?? UGC_OFF_CENTER_OPTIONS[2]?.id ?? 'center-loose',
  framingId: settings?.framingId ?? UGC_SPONTANEOUS_FRAMING_OPTIONS[0]?.id ?? 'arm-length',
});

type StoryboardScene = {
  id: string;
  label: string;
  options: MockupOptions;
  proMode: boolean;
  supplementPreset: string;
  supplementPromptCue: string | null;
  supplementBackgroundColor: string;
  supplementAccentColor: string;
  supplementFlavorNotes: string;
  includeSupplementHand: boolean;
  heroPosePreset: string;
  heroPosePromptCue: string | null;
  supplementCustomPrompt: string;
  heroProductAlignment: HeroLandingAlignment;
  heroProductScale: number;
  heroShadowStyle: HeroLandingShadowStyle;
  ugcRealSettings: UGCRealModeSettings;
  formulationExpertEnabled: boolean;
  formulationExpertPreset: string;
  formulationExpertName: string;
  formulationExpertRole: string;
  formulationLabStyle: string;
  formulationExpertProfession: string;
  personIdentityPackage: PersonIdentityPackage;
  modelReferenceNotes: string;
};

type ModelReferenceData = {
  base64: string;
  mimeType: string;
};

type PersonDetails = {
  ageGroup?: string;
  gender?: string;
  ethnicity?: string;
  skinTone?: string;
  hairType?: string;
  hairLength?: string;
  hairColor?: string;
  facialHair?: string;
  bodyType?: string;
  wardrobe?: string;
  pose?: string;
};

type PersonIdentityPackage = {
  modelReferenceBase64?: string;
  modelReferenceMime?: string;
  identityLock: boolean;
  personDetails?: PersonDetails;
};

const DEFAULT_PERSON_DETAILS: PersonDetails = {
  hairType: '',
  hairLength: '',
  facialHair: '',
  bodyType: '',
};

const CONFLICTING_IDENTITY_PHRASES = [
  'new person',
  'random model',
  'different talent',
  'sample diversity',
  'younger looking',
  'someone else',
  'another person',
  'new creator',
];

const removeConflictingIdentityPhrases = (text: string): string => {
  let next = text;
  for (const phrase of CONFLICTING_IDENTITY_PHRASES) {
    const regexp = new RegExp(phrase, 'gi');
    next = next.replace(regexp, '');
  }
  next = next.replace(/\s{2,}/g, ' ');
  return next.trim();
};

const pickPersonDetails = (options: MockupOptions): PersonDetails => ({
  ageGroup: options.ageGroup,
  gender: options.gender,
  ethnicity: options.ethnicity,
  skinTone: options.skinTone,
  hairType: (options as any).hairType ?? '',
  hairLength: (options as any).hairLength ?? '',
  hairColor: options.hairColor,
  facialHair: (options as any).facialHair ?? '',
  bodyType: (options as any).bodyType ?? '',
  wardrobe: options.wardrobeStyle ?? options.wardrobe,
  pose: options.personPose ?? options.pose,
});

const buildActiveProductFromAsset = (asset: ProductAsset): ActiveProduct | null => {
  if (!asset.base64 || !asset.mimeType) {
    return null;
  }
  const heightCm = (() => {
    if (asset.heightValue === null || asset.heightValue === undefined) return undefined;
    const value = Number(asset.heightValue);
    if (!Number.isFinite(value) || value <= 0) return undefined;
    return asset.heightUnit === 'in' ? value * 2.54 : value;
  })();
  return {
    id: asset.id,
    base64: asset.base64,
    mimeType: asset.mimeType,
    name: asset.label || 'Product',
    heightCm,
  };
};

const createPersonIdentityPackage = (options: MockupOptions, overrides?: Partial<PersonIdentityPackage>): PersonIdentityPackage => ({
  identityLock: overrides?.identityLock ?? false,
  modelReferenceBase64: overrides?.modelReferenceBase64,
  modelReferenceMime: overrides?.modelReferenceMime,
  personDetails: overrides?.personDetails ?? pickPersonDetails(options),
});

const clonePersonIdentityPackage = (packageData: PersonIdentityPackage): PersonIdentityPackage => ({
  identityLock: packageData.identityLock,
  modelReferenceBase64: packageData.modelReferenceBase64,
  modelReferenceMime: packageData.modelReferenceMime,
  personDetails: packageData.personDetails ? { ...packageData.personDetails } : undefined,
});

const IDENTITY_LOCKED_CATEGORIES: Set<OptionCategory> = new Set([
  'ageGroup',
  'gender',
  'ethnicity',
  'skinTone',
  'hairColor',
  'hairStyle',
  'personPose',
  'wardrobeStyle',
  'wardrobe',
  'pose',
]);

const identityPackageToProfile = (packageData: PersonIdentityPackage): Partial<MockupOptions> => {
  const details = packageData.personDetails;
  if (!details) {
    return {};
  }
  const profile: Partial<MockupOptions> = {};
  if (details.ageGroup) profile.ageGroup = details.ageGroup;
  if (details.gender) profile.gender = details.gender;
  if (details.ethnicity) profile.ethnicity = details.ethnicity;
  if (details.skinTone) profile.skinTone = details.skinTone;
  if (details.hairColor) profile.hairColor = details.hairColor;
  if (details.wardrobe) {
    profile.wardrobe = details.wardrobe;
    profile.wardrobeStyle = details.wardrobe;
  }
  if (details.pose) {
    profile.personPose = details.pose;
    profile.pose = details.pose;
  }
  return profile;
};

type ProductAsset = {
  id: string;
  label: string;
  file: File;
  previewUrl: string;
  createdAt: number;
  heightValue: number | null;
  heightUnit: 'cm' | 'in';
  base64?: string;
  mimeType?: string;
  imageUrl?: string;
};

type ImageVariant = {
  url: string;
  width: number;
  height: number;
};

type ActiveProduct = {
  id: string;
  base64: string;
  mimeType: string;
  name: string;
  heightCm?: number;
  heightValue?: number | null;
  heightUnit?: 'cm' | 'in';
};

type GoogleCredentialResponse = {
  credential?: string;
};

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (config: { client_id: string; callback: (response: GoogleCredentialResponse) => void; auto_select?: boolean }) => void;
          prompt: () => void;
          renderButton: (element: HTMLElement, options: { theme?: string; size?: string; width?: number; shape?: string }) => void;
        };
      };
    };
  }
}

const makeSceneId = () => Math.random().toString(36).slice(2, 9);

const cloneOptions = (source: MockupOptions): MockupOptions => {
  const cloned = JSON.parse(JSON.stringify(source)) as MockupOptions;
  if (!cloned.skinRealism) {
    cloned.skinRealism = SKIN_REALISM_OPTIONS[0].value;
  }
  return cloned;
};

const syncCharacterFields = (options: MockupOptions): MockupOptions => {
  const next = { ...options };
  next.creatorPreset = next.creatorPreset ?? '';
  next.appearanceLevel = next.appearanceLevel || next.personAppearance || '';
  next.mood = next.mood || next.personMood || '';
  next.pose = next.pose || next.personPose || '';
  next.interaction2 = next.interaction2 || next.productInteraction || '';
  next.wardrobe = next.wardrobe || next.wardrobeStyle || '';
  const propValue = next.props || next.personProps;
  const isCustomProp =
    propValue && !PERSON_PROP_OPTIONS.some(option => option.value === propValue);
  next.props = propValue || '';
  next.customProp = isCustomProp ? propValue : '';
  const microValue = next.microLocation;
  const isCustomMicroLocation =
    microValue && !MICRO_LOCATION_OPTIONS.some(option => option.value === microValue);
  next.customMicroLocation = isCustomMicroLocation ? microValue : '';
  next.expression = next.expression || next.personExpression || '';
  next.hairstyle = next.hairstyle || next.hairStyle || '';
  next.hairColor = next.hairColor || '';
  next.skinTone = next.skinTone || '';
  next.eyeColor = next.eyeColor || '';
  next.skinRealism = next.skinRealism || '';
  return next;
};

const getSectionId = (title: string) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const cleanDescription = (text = '') =>
  String(text)
    .replace(/messy|ugly|bad|wrong|imperfect|grainy|blurry|raw iphone/gi, '')
    .replace(/reference|see above|see image|inspired by/gi, '')
    .replace(/pinterest|tiktok|instagram/gi, '')
    .replace(/url\([^)]*\)/gi, '')
    .trim();

const SMARTPHONE_PROP_VALUE =
  PERSON_PROP_OPTIONS.find(option => option.label.toLowerCase().includes('smartphone'))?.value ??
  PERSON_PROP_OPTIONS[0].value;
const FLASH_LIGHTING_VALUE =
  LIGHTING_OPTIONS.find(option => option.label === 'Flash Photo')?.value ?? LIGHTING_OPTIONS[0].value;
const HANDS_ONLY_POSE_VALUE =
  PERSON_POSE_OPTIONS.find(option => option.label === 'Hands-Only Crop')?.value ?? PERSON_POSE_OPTIONS[0].value;

type SelfieMeta = {
  narrative: string;
  enforceSplitHands?: boolean;
  hidePhone?: boolean;
  hideFace?: boolean;
};

const SELFIE_DIRECTIONS: Record<string, SelfieMeta> = {
  'None': {
    narrative: 'Treat it like a normal lifestyle shot with both hands available for the product.',
  },
  "Arm's Length Selfie": {
    narrative: 'Hold the phone at arm’s length so the opposite hand can hero the product near the lens.',
    enforceSplitHands: true,
  },
  'Mirror Selfie (phone visible)': {
    narrative: 'Face a mirror, letting the phone partially cover the face while the reflection shows both creator and product.',
    enforceSplitHands: true,
  },
  'One-hand product selfie': {
    narrative: 'Use the same hand to grip both phone and product, keeping them ultra close to the camera for a playful POV.',
  },
  'Overhead in-bed selfie': {
    narrative: 'Lie down while extending the phone straight above the face; rest the product on the body or pillow for cozy vibes.',
    enforceSplitHands: true,
  },
  'Low-angle hero selfie': {
    narrative: 'Place the camera below the chin pointing upward for a dramatic hero shot, offering the product toward the lens.',
    enforceSplitHands: true,
  },
  'Back camera POV': {
    narrative: 'Frame it like the viewer is the phone— only hands and product in a tight crop, with the face out of frame.',
    hidePhone: true,
    hideFace: true,
  },
};

const getSelfieLabel = (value: string) =>
  SELFIE_TYPE_OPTIONS.find(option => option.value === value)?.label ?? SELFIE_TYPE_OPTIONS[0].label;

type CompositionMode = 'balanced' | 'product-first' | 'model-first' | 'fifty-fifty';
const COMPOSITION_BLOCKS: Record<CompositionMode, string> = {
  balanced: `
Place the person and the product in the same visual plane.
Keep both naturally in focus with medium distance.
Avoid pushing the person into deep background.
Avoid oversized or floating product overlays.
`,
  'product-first': `
Product slightly closer to the camera but still physically integrated in the hand.
Keep the person in mid-ground, not heavily blurred.
Maintain flat focus across the frame; no background separation, no bokeh. Avoid shallow consumer blur effects.
`,
  'model-first': `
Keep the person in the foreground with clear focus and prominence.
Product held naturally in hand, slightly behind the person but still readable.
Avoid exaggerated product enlargement or foreground dominance.
`,
  'fifty-fifty': `
Place the person’s face and the product both in the foreground.
Tight framing where both elements share prominence equally.
No superimposition or unrealistic scale differences.
Natural lighting consistency on both elements.
`,
};

const HERO_LANDING_PRESET_VALUE = 'hero-landing';
const FORMULATION_EXPERT_PRESETS = [
  {
    value: 'respiratory-doctor',
    label: 'Respiratory Doctor',
    role: 'pulmonologist and lead formulator',
    suggestedName: 'Dr. Sofia Reyes',
    prompt:
      'Dress the doctor in a crisp lab coat with a name badge, reviewing charts beside the product with compassionate authority.',
  },
  {
    value: 'clinical-researcher',
    label: 'Clinical Researcher',
    role: 'clinical researcher overseeing trials',
    suggestedName: 'Dr. Malik Herrera',
    prompt:
      'Show the researcher surrounded by clipboards, microscopes, and annotated results to emphasize rigorous testing.',
  },
  {
    value: 'herbal-formulator',
    label: 'Herbal Formulator',
    role: 'master herbalist behind the blend',
    suggestedName: 'Dr. Aria Park',
    prompt:
      'Portray them with botanical samples, mortar and pestle, and a calm confidence that sells holistic science.',
  },
];
const FORMULATION_LAB_OPTIONS: Option[] = [
  { label: 'Modern Clinical Lab', value: 'a modern clinical lab bench with glassware and stainless surfaces' },
  { label: 'R&D Studio', value: 'a warm R&D studio with sketches, ingredient jars, and soft daylight' },
  { label: 'Apothecary Lab', value: 'an apothecary-inspired lab with botanicals, droppers, and amber bottles' },
];
const FORMULATION_PROFESSIONS = [
  { value: 'pulmonologist', label: 'Pulmonologist' },
  { value: 'nutritionist', label: 'Nutritionist' },
  { value: 'dermatologist', label: 'Dermatologist' },
  { value: 'pharmacist', label: 'Pharmacist' },
  { value: 'clinical-researcher', label: 'Clinical Researcher' },
  { value: 'herbalist', label: 'Herbalist' },
  { value: 'custom', label: 'Custom' },
];
const FORMULATION_PRESET_LOOKUP = FORMULATION_EXPERT_PRESETS.reduce(
  (acc, preset) => ({ ...acc, [preset.value]: preset }),
  {} as Record<string, (typeof FORMULATION_EXPERT_PRESETS)[number]>
);
const FORMULATION_PROFESSION_LOOKUP = FORMULATION_PROFESSIONS.reduce(
  (acc, profession) => ({ ...acc, [profession.value]: profession }),
  {} as Record<string, (typeof FORMULATION_PROFESSIONS)[number]>
);
const HERO_LANDING_META = SUPPLEMENT_PHOTO_PRESETS.find(option => option.value === HERO_LANDING_PRESET_VALUE);
const HERO_ALIGNMENT_OPTIONS: { label: string; value: HeroLandingAlignment }[] = [
  { label: 'Left', value: 'left' },
  { label: 'Center', value: 'center' },
  { label: 'Right', value: 'right' },
];
const HERO_ALIGNMENT_TEXT: Record<HeroLandingAlignment, string> = {
  left: 'Anchor the hero product on the left edge with whitespace on the right for typography and CTAs.',
  center: 'Keep the hero perfectly centered with symmetrical negative space.',
  right: 'Push the product toward the right edge so the left side stays clean for messaging.',
};
const HERO_SHADOW_OPTIONS: { label: string; value: HeroLandingShadowStyle }[] = [
  { label: 'Soft drop shadow', value: 'softDrop' },
  { label: 'Hard drop shadow', value: 'hardDrop' },
  { label: 'Floating shadow', value: 'floating' },
];
const HERO_SHADOW_TEXT: Record<HeroLandingShadowStyle, string> = {
  softDrop: 'Use a soft drop shadow that gently feathers to keep it premium.',
  hardDrop: 'Use a crisp, graphic drop shadow for bold contrast.',
  floating: 'Make it feel like the product floats with a faint contact glow instead of a traditional shadow.',
};

const PERSON_COUNT_OPTIONS: Option[] = [
  { label: 'Single', value: 'single', tooltip: 'One person in the scene.' },
  { label: 'Couple', value: 'couple', tooltip: 'Two people in the scene.' },
];

const COUPLE_SEX_OPTIONS: Option[] = [
  { label: 'Same sex', value: 'same', tooltip: 'Two people of the same sex.' },
  { label: 'Different sex', value: 'different', tooltip: 'Two people of different sexes.' },
];

const DEFAULT_AGE_GROUP =
  AGE_GROUP_OPTIONS.find(option => option.label === '26-35')?.value ?? AGE_GROUP_OPTIONS[0].value;

const createDefaultOptions = (): MockupOptions => ({
  contentStyle: 'ugc',
  placementStyle: PLACEMENT_STYLE_OPTIONS[0].value,
  placementCamera: PLACEMENT_CAMERA_OPTIONS[0].value,
  lighting: LIGHTING_OPTIONS[0].value,
  // CRITICAL: Default environment for Lifestyle mode (when UGC is not active)
  // When app loads, UGC is OFF by default, so we need Kitchen as the default environment
  // When UGC activates, handleUGCRealModeToggle will clear this to '' (Random / Auto)
  setting: SETTING_OPTIONS[2].value, // 'Kitchen' - will be cleared when UGC activates
  ageGroup: DEFAULT_AGE_GROUP,
  camera: CAMERA_OPTIONS[0].value,
  cameraShot: CAMERA_SHOT_OPTIONS[0].value,
  cameraAngle: CAMERA_ANGLE_OPTIONS[2].value, // 'straight' as default
  cameraDistance: CAMERA_DISTANCE_OPTIONS[2].value, // 'medium' as default
  perspective: PERSPECTIVE_OPTIONS[0].value,
  selfieType: SELFIE_TYPE_OPTIONS[0].value,
  ethnicity: ETHNICITY_OPTIONS[0].value,
  gender: GENDER_OPTIONS[0].value,
  aspectRatio: ASPECT_RATIO_OPTIONS[0].value,
  environmentOrder: ENVIRONMENT_ORDER_OPTIONS[0].value,
  productPlane: PRODUCT_PLANE_OPTIONS[0].value,
  personAppearance: PERSON_APPEARANCE_OPTIONS[0].value,
  productMaterial: PRODUCT_MATERIAL_OPTIONS[0].value,
  productInteraction: PRODUCT_INTERACTION_OPTIONS[0].value,
  realism: REALISM_OPTIONS[1].value,
  personPose: PERSON_POSE_OPTIONS[0].value,
  wardrobeStyle: WARDROBE_STYLE_OPTIONS[0].value,
  personMood: PERSON_MOOD_OPTIONS[0].value,
  personProps: PERSON_PROP_OPTIONS[0].value,
  microLocation: MICRO_LOCATION_NONE_VALUE,
  personExpression: PERSON_EXPRESSION_OPTIONS[0].value,
  hairStyle: HAIR_STYLE_OPTIONS[0].value,
  hairColor: HAIR_COLOR_OPTIONS[0].value,
  eyeColor: EYE_COLOR_OPTIONS[0].value,
  skinTone: SKIN_TONE_OPTIONS[0].value,
  proLens: PRO_LENS_OPTIONS[0].value,
  proLightingRig: PRO_LIGHTING_RIG_OPTIONS[0].value,
  proPostTreatment: PRO_POST_TREATMENT_OPTIONS[0].value,
  skinRealism: SKIN_REALISM_OPTIONS[0].value,
  creatorPreset: CREATOR_PRESETS[0].value,
  appearanceLevel: PERSON_APPEARANCE_OPTIONS[0].value,
  mood: PERSON_MOOD_OPTIONS[0].value,
  pose: PERSON_POSE_OPTIONS[0].value,
  interaction2: PRODUCT_INTERACTION_OPTIONS[0].value,
  wardrobe: WARDROBE_STYLE_OPTIONS[0].value,
  props: PERSON_PROP_OPTIONS[0].value,
  customProp: '',
  customMicroLocation: '',
  expression: PERSON_EXPRESSION_OPTIONS[0].value,
  hairstyle: HAIR_STYLE_OPTIONS[0].value,
  compositionMode: COMPOSITION_MODE_OPTIONS[0].value,
  creationMode: 'lifestyle',
  sidePlacement: 'right',
  bgColor: '#FFFFFF',
  personCount: 'single',
  coupleSex: 'different',
});
import ImageUploader, { ImageUploaderHandle } from './components/ImageUploader';
import GeneratedImage from './components/GeneratedImage';
import Accordion from './components/Accordion';
import ModelReferencePanel from './components/ModelReferencePanel';
import ChipSelectGroup from './components/ChipSelectGroup';

import OnboardingOverlay from './components/OnboardingOverlay';
import ModeTierToggle from './components/ModeTierToggle';

import { useAuth } from './src/contexts/AuthContext';

const describeAgeGroup = (ageGroup: string, gender: string) => {
  const genderNoun =
    gender === 'female'
      ? 'woman'
      : gender === 'male'
        ? 'man'
        : `${gender} person`;

  switch (ageGroup) {
    case '18-25':
      return `a Gen-Z ${genderNoun} aged 18-25 with smooth skin and youthful energy`;
    case '13-17':
      return `a teenage ${genderNoun} aged 13-17 with expressive eyes and youthful posture`;
    case '6-12':
      return `a kid ${genderNoun} aged 6-12 with playful energy and smaller proportions`;
    case '26-35':
      return `a Millennial ${genderNoun} aged 26-35 with subtle laugh lines and confident posture`;
    case '36-45':
      return `a mature ${genderNoun} aged 36-45 with gentle signs of aging and poised energy`;
    case '46-60':
      return `an experienced ${genderNoun} aged 46-60 with visible fine lines and seasoned presence`;
    case '60-75':
      return `an older ${genderNoun} aged 60-75 with softened skin texture and silver hair details`;
    case '75+':
      return `an elderly ${genderNoun}, 75+, with pronounced wrinkles, age spots on the hands, and white or silver hair`;
    default:
      return `a ${genderNoun} aged ${ageGroup}`;
  }
};

type MoodSuggestion = {
  moodLabel: string;
  lightingLabel: string;
  settingLabel: string;
  placementStyleLabel: string;
  placementCameraLabel: string;
};

const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const clean = hex.replace('#', '').trim();
  if (clean.length !== 6) return null;
  const value = Number.parseInt(clean, 16);
  if (Number.isNaN(value)) return null;
  return {
    r: (value >> 16) & 0xff,
    g: (value >> 8) & 0xff,
    b: value & 0xff,
  };
};

const rgbToHex = (r: number, g: number, b: number) =>
  `#${[r, g, b]
    .map(channel => Math.max(0, Math.min(255, Math.round(channel))).toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase()}`;

const extractPaletteFromImage = async (file: File, maxColors = 6): Promise<string[]> => {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas context unavailable.');
  }

  const targetSize = 48;
  canvas.width = targetSize;
  canvas.height = targetSize;
  ctx.drawImage(bitmap, 0, 0, targetSize, targetSize);

  const { data } = ctx.getImageData(0, 0, targetSize, targetSize);
  const counts = new Map<string, number>();
  const step = 4;
  for (let i = 0; i < data.length; i += step) {
    const alpha = data[i + 3] ?? 0;
    if (alpha < 200) continue;
    const r = data[i] ?? 0;
    const g = data[i + 1] ?? 0;
    const b = data[i + 2] ?? 0;

    const quant = (value: number) => Math.round(value / 32) * 32;
    const color = rgbToHex(quant(r), quant(g), quant(b));
    counts.set(color, (counts.get(color) ?? 0) + 1);
  }

  const palette = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxColors)
    .map(([color]) => color);

  if (!palette.length) {
    throw new Error('No palette colors detected.');
  }
  return palette;
};

const deriveMoodSuggestions = (palette: string[]): MoodSuggestion => {
  const rgbs = palette.map(hexToRgb).filter(Boolean) as Array<{ r: number; g: number; b: number }>;
  const avg = rgbs.reduce(
    (acc, rgb) => ({ r: acc.r + rgb.r, g: acc.g + rgb.g, b: acc.b + rgb.b }),
    { r: 0, g: 0, b: 0 }
  );
  const count = Math.max(1, rgbs.length);
  const r = avg.r / count;
  const g = avg.g / count;
  const b = avg.b / count;
  const brightness = (r + g + b) / 3;
  const warmth = r - b;

  if (brightness < 90) {
    return {
      moodLabel: 'Moody & Cinematic',
      lightingLabel: 'Mood Lighting',
      settingLabel: 'Boutique Hotel',
      placementStyleLabel: 'Luxury Editorial',
      placementCameraLabel: 'Cinema Camera',
    };
  }

  if (warmth > 35) {
    return {
      moodLabel: 'Warm & Cozy',
      lightingLabel: 'Golden Hour',
      settingLabel: 'Living Room',
      placementStyleLabel: 'Nature Elements',
      placementCameraLabel: 'Cinema Camera',
    };
  }

  if (warmth < -35) {
    return {
      moodLabel: 'Cool & Clean',
      lightingLabel: 'Overcast',
      settingLabel: 'Home Office',
      placementStyleLabel: 'On-White Studio',
      placementCameraLabel: 'Macro Lens',
    };
  }

  return {
    moodLabel: 'Bright & Natural',
    lightingLabel: 'Natural Light',
    settingLabel: 'Kitchen',
    placementStyleLabel: 'Lifestyle Flatlay',
    placementCameraLabel: 'Product Tabletop Rig',
  };
};

const LOCAL_STORAGE_KEY = 'ugc-product-mockup-generator-api-key';
const EMAIL_STORAGE_KEY = 'ugc-product-mockup-generator-user-email';
const IMAGE_COUNT_KEY = 'ugc-product-mockup-generator-credit-count';
const VIDEO_ACCESS_KEY = 'ugc-product-mockup-generator-video-access';
const TRIAL_BYPASS_KEY = 'ugc-product-mockup-trial-bypass';
const LOCAL_GALLERY_CACHE_KEY = 'ugc-free-gallery';
const DEFAULT_ADMIN_EMAILS = ['juanamisano@gmail.com', 'boostugc@gmail.com'];
const ADMIN_EMAILS = Array.from(
  new Set(
    `${import.meta.env.VITE_ADMIN_EMAILS || ''},${DEFAULT_ADMIN_EMAILS.join(',')}`
      .split(',')
      .map(email => email.trim().toLowerCase())
      .filter(Boolean)
  )
);
const VIDEO_SECRET_CODE = import.meta.env.VITE_VIDEO_ACCESS_CODE || '';
const ONBOARDING_DISMISSED_KEY = 'ugc-onboarding-hidden';
const TALENT_PROFILE_STORAGE_KEY = 'ugc-saved-talent-profile';
const SIMPLE_MODE_KEY = 'ugc-simple-mode';
const GOAL_WIZARD_KEY = 'ugc-goal-wizard-dismissed';
const PLAN_STORAGE_KEY = 'ugc-plan-tier';
const VIDEO_COUNT_KEY = 'ugc-video-generation-count';
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '';
const EMAIL_VERIFICATION_ENABLED = import.meta.env.VITE_EMAIL_VERIFICATION === 'true';
// Model normalization removed. Image models must be passed exactly as written.
const normalizeGeminiModel = (raw?: string) => raw || '';

const GEMINI_IMAGE_MODEL = normalizeGeminiModel('gemini-2.5-flash-image') || 'gemini-2.5-flash-image';
const GOOGLE_MODEL = import.meta.env.VITE_GOOGLE_MODEL ?? '';

const VIDEO_CREDIT_COST = 15;

const PLAN_UNLOCK_CODES: Record<string, PlanTier> = {
  CREATOR15: 'creator',
  CREATOR150: 'creator',
  STUDIO29: 'studio',
  STUDIO290: 'studio',
};
const TESTER_UPGRADE_CODE = import.meta.env.VITE_TESTER_CODE || '8714';
const TRIAL_BYPASS_CODE = '8714';

const PERSON_FIELD_KEYS = [
  'ageGroup',
  'personAppearance',
  'personMood',
  'personPose',
  'wardrobeStyle',
  'productInteraction',
  'gender',
  'ethnicity',
  'selfieType',
  'personProps',
  'microLocation',
  'personExpression',
  'hairStyle',
  'hairColor',
  'eyeColor',
  'skinTone',
  'skinRealism',
  'creatorPreset',
  'appearanceLevel',
  'mood',
  'pose',
  'interaction2',
  'wardrobe',
  'props',
  'customProp',
  'customMicroLocation',
  'expression',
  'hairstyle',
] as const satisfies readonly (keyof MockupOptions)[];

type PersonFieldKey = (typeof PERSON_FIELD_KEYS)[number];

const isPersonFieldKey = (key: OptionCategory): key is PersonFieldKey =>
  (PERSON_FIELD_KEYS as readonly string[]).includes(key);

const applyPersonProfileToOptions = (
  base: MockupOptions,
  profile: Partial<MockupOptions>
): MockupOptions => {
  const updated: MockupOptions = { ...base };
  PERSON_FIELD_KEYS.forEach(key => {
    const nextValue = profile[key];
    if (nextValue !== undefined) {
      updated[key] = nextValue;
    }
  });
  return updated;
};

const PRO_FIELD_KEYS: OptionCategory[] = [
  'proLens',
  'proLightingRig',
  'proPostTreatment',
] as OptionCategory[];

const CREATOR_PRESET_LOOKUP: Record<string, CreatorPreset> = CREATOR_PRESETS.reduce(
  (acc, preset) => {
    acc[preset.value] = preset;
    return acc;
  },
  {} as Record<string, CreatorPreset>
);

const HERO_PERSON_PRESET_LOOKUP: Record<string, HeroPosePreset> = HERO_PERSON_PRESETS.reduce(
  (acc, preset) => {
    acc[preset.value] = preset;
    return acc;
  },
  {} as Record<string, HeroPosePreset>
);

const GOAL_VIBE_OPTIONS = [
  {
    value: 'warm',
    label: 'Warm Lifestyle',
    description: 'Golden hour, cozy home vibes.',
    setting: SETTING_OPTIONS[0].value,
    lighting: LIGHTING_OPTIONS[2].value,
    environmentOrder: ENVIRONMENT_ORDER_OPTIONS[1].value,
  },
  {
    value: 'clean',
    label: 'Clean Studio',
    description: 'Minimal, product-first aesthetic.',
    setting: SETTING_OPTIONS[9].value,
    lighting: LIGHTING_OPTIONS[0].value,
    environmentOrder: ENVIRONMENT_ORDER_OPTIONS[0].value,
  },
  {
    value: 'outdoor',
    label: 'Outdoor Energy',
    description: 'Sunlit, on-the-go creator feel.',
    setting: SETTING_OPTIONS[12].value,
    lighting: LIGHTING_OPTIONS[1].value,
    environmentOrder: ENVIRONMENT_ORDER_OPTIONS[2].value,
  },
];

const GOAL_WIZARD_GOAL_OPTIONS = [
  {
    value: 'ugc',
    label: 'UGC Lifestyle',
    description: 'Creators interacting with your product in real life.',
  },
  {
    value: 'product',
    label: 'Product Placement',
    description: 'Stylized hero shots without people.',
  },
];

const BUNDLE_TABS = [
  { id: 'premade', label: 'Pre-made Bundles' },
  { id: 'custom', label: 'Custom Bundle Builder' },
  { id: 'recommended', label: 'Recommended Bundles' },
] as const;

type AiStudioApi = {
  hasSelectedApiKey: () => Promise<boolean>;
  openSelectKey: () => Promise<void>;
};

const getEnvApiKey = (): string | undefined => {
  const fromProcess = process.env.API_KEY;
  return fromProcess ? fromProcess.trim() : undefined;
};

const fileToBase64 = (file: File): Promise<{ base64: string, mimeType: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const [mimeType, base64] = result.split(';base64,');
      resolve({ base64, mimeType: mimeType.replace('data:', '') });
    };
    reader.onerror = (error) => reject(error);
  });
};

const loadImageFromUrl = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Could not load source image for scaling.'));
    img.src = url;
  });

const scaleImageToLongEdge = async (sourceUrl: string, targetLongEdge: number): Promise<ImageVariant> => {
  if (typeof window === 'undefined') {
    throw new Error('Scaling is unavailable in this environment.');
  }
  const img = await loadImageFromUrl(sourceUrl);
  const longEdge = Math.max(img.naturalWidth, img.naturalHeight);
  if (!longEdge) {
    throw new Error('Source image has invalid dimensions.');
  }
  const scale = targetLongEdge / longEdge;
  const width = Math.max(1, Math.round(img.naturalWidth * scale));
  const height = Math.max(1, Math.round(img.naturalHeight * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas context is unavailable for scaling.');
  }
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, width, height);
  const url = canvas.toDataURL('image/png');
  return { url, width, height };
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const downscaleDataUrlToJpeg = async (
  dataUrl: string,
  opts: { maxLongEdge: number; quality: number }
): Promise<{ base64: string; mimeType: string }> => {
  const img = await loadImageFromUrl(dataUrl);
  const longEdge = Math.max(img.naturalWidth, img.naturalHeight);
  if (!longEdge) {
    throw new Error('Source image has invalid dimensions.');
  }
  const scale = Math.min(1, opts.maxLongEdge / longEdge);
  const width = Math.max(1, Math.round(img.naturalWidth * scale));
  const height = Math.max(1, Math.round(img.naturalHeight * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas context is unavailable for scaling.');
  }
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, width, height);
  const url = canvas.toDataURL('image/jpeg', opts.quality);
  const [, base64] = url.split(';base64,');
  return { base64, mimeType: 'image/jpeg' };
};

const parseAspectRatio = (ratio: string): { w: number; h: number } | null => {
  const raw = String(ratio || '').trim();
  const match = raw.match(/^(\d+(?:\.\d+)?)\s*:\s*(\d+(?:\.\d+)?)$/);
  if (!match) return null;
  const w = Number(match[1]);
  const h = Number(match[2]);
  if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) return null;
  return { w, h };
};

const letterboxDataUrlToAspectRatio = async (
  dataUrl: string,
  targetAspectRatio: string,
  opts: { maxLongEdge: number; background: string | null; mimeType: 'image/png' | 'image/jpeg'; quality?: number }
): Promise<{ base64: string; mimeType: string }> => {
  const parsed = parseAspectRatio(targetAspectRatio);
  if (!parsed) {
    const [, base64] = String(dataUrl).split(';base64,');
    return { base64: base64 ?? '', mimeType: opts.mimeType };
  }
  const img = await loadImageFromUrl(dataUrl);
  const imgW = img.naturalWidth;
  const imgH = img.naturalHeight;
  if (!imgW || !imgH) {
    const [, base64] = String(dataUrl).split(';base64,');
    return { base64: base64 ?? '', mimeType: opts.mimeType };
  }

  const targetRatio = parsed.w / parsed.h;
  const imgRatio = imgW / imgH;
  let canvasW = imgW;
  let canvasH = imgH;
  if (imgRatio > targetRatio) {
    canvasW = imgW;
    canvasH = Math.round(canvasW / targetRatio);
  } else {
    canvasH = imgH;
    canvasW = Math.round(canvasH * targetRatio);
  }

  const scale = Math.min(1, opts.maxLongEdge / Math.max(canvasW, canvasH));
  const outW = Math.max(1, Math.round(canvasW * scale));
  const outH = Math.max(1, Math.round(canvasH * scale));
  const drawW = Math.max(1, Math.round(imgW * scale));
  const drawH = Math.max(1, Math.round(imgH * scale));

  const canvas = document.createElement('canvas');
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    const [, base64] = String(dataUrl).split(';base64,');
    return { base64: base64 ?? '', mimeType: opts.mimeType };
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  if (opts.background) {
    ctx.fillStyle = opts.background;
    ctx.fillRect(0, 0, outW, outH);
  } else {
    ctx.clearRect(0, 0, outW, outH);
  }

  const x = Math.round((outW - drawW) / 2);
  const y = Math.round((outH - drawH) / 2);
  ctx.drawImage(img, x, y, drawW, drawH);

  const out =
    opts.mimeType === 'image/jpeg'
      ? canvas.toDataURL('image/jpeg', typeof opts.quality === 'number' ? opts.quality : 0.96)
      : canvas.toDataURL('image/png');
  const [, base64] = out.split(';base64,');
  return { base64: base64 ?? '', mimeType: opts.mimeType };
};

const coverCropDataUrlToAspectRatio = async (
  dataUrl: string,
  targetAspectRatio: string,
  opts: { maxLongEdge: number; background: string | null; mimeType: 'image/png' | 'image/jpeg'; quality?: number }
): Promise<{ base64: string; mimeType: string }> => {
  const parsed = parseAspectRatio(targetAspectRatio);
  if (!parsed) {
    const [, base64] = String(dataUrl).split(';base64,');
    return { base64: base64 ?? '', mimeType: opts.mimeType };
  }
  const img = await loadImageFromUrl(dataUrl);
  const imgW = img.naturalWidth;
  const imgH = img.naturalHeight;
  if (!imgW || !imgH) {
    const [, base64] = String(dataUrl).split(';base64,');
    return { base64: base64 ?? '', mimeType: opts.mimeType };
  }

  const targetRatio = parsed.w / parsed.h;
  const imgRatio = imgW / imgH;

  // Crop a centered rectangle from the source image so it exactly matches the target ratio.
  let cropW = imgW;
  let cropH = imgH;
  let cropX = 0;
  let cropY = 0;
  if (imgRatio > targetRatio) {
    cropH = imgH;
    cropW = Math.round(cropH * targetRatio);
    cropX = Math.round((imgW - cropW) / 2);
  } else if (imgRatio < targetRatio) {
    cropW = imgW;
    cropH = Math.round(cropW / targetRatio);
    cropY = Math.round((imgH - cropH) / 2);
  }

  const scale = Math.min(1, opts.maxLongEdge / Math.max(cropW, cropH));
  const outW = Math.max(1, Math.round(cropW * scale));
  const outH = Math.max(1, Math.round(cropH * scale));

  const canvas = document.createElement('canvas');
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    const [, base64] = String(dataUrl).split(';base64,');
    return { base64: base64 ?? '', mimeType: opts.mimeType };
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  if (opts.background) {
    ctx.fillStyle = opts.background;
    ctx.fillRect(0, 0, outW, outH);
  } else {
    ctx.clearRect(0, 0, outW, outH);
  }

  ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, outW, outH);

  const out =
    opts.mimeType === 'image/jpeg'
      ? canvas.toDataURL('image/jpeg', typeof opts.quality === 'number' ? opts.quality : 0.96)
      : canvas.toDataURL('image/png');
  const [, base64] = out.split(';base64,');
  return { base64: base64 ?? '', mimeType: opts.mimeType };
};

// Preserve full content while filling extra space by extending edge pixels.
// This avoids black bars and avoids cropping for product studio outputs.
const extendEdgesToAspectRatio = async (
  dataUrl: string,
  targetAspectRatio: string,
  opts: { maxLongEdge: number; mimeType: 'image/png' | 'image/jpeg'; quality?: number }
): Promise<{ base64: string; mimeType: string }> => {
  const parsed = parseAspectRatio(targetAspectRatio);
  if (!parsed) {
    const [, base64] = String(dataUrl).split(';base64,');
    return { base64: base64 ?? '', mimeType: opts.mimeType };
  }

  const img = await loadImageFromUrl(dataUrl);
  const imgW = img.naturalWidth;
  const imgH = img.naturalHeight;
  if (!imgW || !imgH) {
    const [, base64] = String(dataUrl).split(';base64,');
    return { base64: base64 ?? '', mimeType: opts.mimeType };
  }

  const targetRatio = parsed.w / parsed.h;
  const imgRatio = imgW / imgH;
  let canvasW = imgW;
  let canvasH = imgH;
  if (imgRatio > targetRatio) {
    canvasW = imgW;
    canvasH = Math.round(canvasW / targetRatio);
  } else {
    canvasH = imgH;
    canvasW = Math.round(canvasH * targetRatio);
  }

  const scale = Math.min(1, opts.maxLongEdge / Math.max(canvasW, canvasH));
  const outW = Math.max(1, Math.round(canvasW * scale));
  const outH = Math.max(1, Math.round(canvasH * scale));
  const drawW = Math.max(1, Math.round(imgW * scale));
  const drawH = Math.max(1, Math.round(imgH * scale));
  const x = Math.round((outW - drawW) / 2);
  const y = Math.round((outH - drawH) / 2);

  const canvas = document.createElement('canvas');
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    const [, base64] = String(dataUrl).split(';base64,');
    return { base64: base64 ?? '', mimeType: opts.mimeType };
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Draw center image.
  ctx.drawImage(img, x, y, drawW, drawH);

  // Fill vertical pads by stretching top/bottom edge rows.
  if (y > 0) {
    ctx.drawImage(img, 0, 0, imgW, 1, x, 0, drawW, y);
    ctx.drawImage(img, 0, imgH - 1, imgW, 1, x, y + drawH, drawW, outH - (y + drawH));
  }

  // Fill horizontal pads by stretching left/right edge columns.
  if (x > 0) {
    ctx.drawImage(img, 0, 0, 1, imgH, 0, y, x, drawH);
    ctx.drawImage(img, imgW - 1, 0, 1, imgH, x + drawW, y, outW - (x + drawW), drawH);
  }

  // Fill corners with nearest corner pixel to avoid transparent gaps.
  if (x > 0 && y > 0) {
    ctx.drawImage(img, 0, 0, 1, 1, 0, 0, x, y);
    ctx.drawImage(img, imgW - 1, 0, 1, 1, x + drawW, 0, outW - (x + drawW), y);
    ctx.drawImage(img, 0, imgH - 1, 1, 1, 0, y + drawH, x, outH - (y + drawH));
    ctx.drawImage(
      img,
      imgW - 1,
      imgH - 1,
      1,
      1,
      x + drawW,
      y + drawH,
      outW - (x + drawW),
      outH - (y + drawH)
    );
  }

  const out =
    opts.mimeType === 'image/jpeg'
      ? canvas.toDataURL('image/jpeg', typeof opts.quality === 'number' ? opts.quality : 0.96)
      : canvas.toDataURL('image/png');
  const [, base64] = out.split(';base64,');
  return { base64: base64 ?? '', mimeType: opts.mimeType };
};

const trimBlackBarsDataUrl = async (
  dataUrl: string,
  opts: { mimeType: 'image/png' | 'image/jpeg'; background: string | null; quality?: number }
): Promise<string> => {
  const img = await loadImageFromUrl(dataUrl);
  const imgW = img.naturalWidth;
  const imgH = img.naturalHeight;
  if (!imgW || !imgH) return dataUrl;

  const canvas = document.createElement('canvas');
  canvas.width = imgW;
  canvas.height = imgH;
  const ctx = canvas.getContext('2d');
  if (!ctx) return dataUrl;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  if (opts.background) {
    ctx.fillStyle = opts.background;
    ctx.fillRect(0, 0, imgW, imgH);
  } else {
    ctx.clearRect(0, 0, imgW, imgH);
  }
  ctx.drawImage(img, 0, 0, imgW, imgH);

  const pixels = ctx.getImageData(0, 0, imgW, imgH).data;
  const stride = imgW * 4;

  const isBarRow = (y: number): boolean => {
    const rowStart = y * stride;
    let sum = 0;
    let sumSq = 0;
    let count = 0;
    let darkCount = 0;
    for (let x = 0; x < imgW; x += 1) {
      const i = rowStart + x * 4;
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      const a = pixels[i + 3];
      // Treat near-transparent as padding.
      if (a <= 8) {
        sum += 0;
        sumSq += 0;
        count += 1;
        continue;
      }
      // Luma approximation
      const luma = (r * 0.2126 + g * 0.7152 + b * 0.0722) * (a / 255);
      sum += luma;
      sumSq += luma * luma;
      count += 1;
      if (luma <= 24) darkCount += 1;
    }
    if (!count) return false;
    const mean = sum / count;
    const variance = Math.max(0, sumSq / count - mean * mean);
    const darkShare = darkCount / count;
    // "Bar" = uniformly very dark, mostly transparent, or dark textured row.
    return (mean <= 14 && variance <= 60) || darkShare >= 0.985 || (mean <= 30 && darkShare >= 0.92);
  };

  const isBarCol = (x: number): boolean => {
    let sum = 0;
    let sumSq = 0;
    let count = 0;
    let darkCount = 0;
    for (let y = 0; y < imgH; y += 1) {
      const i = y * stride + x * 4;
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      const a = pixels[i + 3];
      if (a <= 8) {
        sum += 0;
        sumSq += 0;
        count += 1;
        continue;
      }
      const luma = (r * 0.2126 + g * 0.7152 + b * 0.0722) * (a / 255);
      sum += luma;
      sumSq += luma * luma;
      count += 1;
      if (luma <= 24) darkCount += 1;
    }
    if (!count) return false;
    const mean = sum / count;
    const variance = Math.max(0, sumSq / count - mean * mean);
    const darkShare = darkCount / count;
    return (mean <= 14 && variance <= 60) || darkShare >= 0.985 || (mean <= 30 && darkShare >= 0.92);
  };

  const maxTrimY = Math.floor(imgH * 0.35);
  const maxTrimX = Math.floor(imgW * 0.35);

  let top = 0;
  while (top < maxTrimY && isBarRow(top)) top += 1;
  let bottom = imgH - 1;
  while (bottom > imgH - 1 - maxTrimY && isBarRow(bottom)) bottom -= 1;
  let left = 0;
  while (left < maxTrimX && isBarCol(left)) left += 1;
  let right = imgW - 1;
  while (right > imgW - 1 - maxTrimX && isBarCol(right)) right -= 1;

  const cropW = Math.max(1, right - left + 1);
  const cropH = Math.max(1, bottom - top + 1);

  // No meaningful trim.
  if (cropW === imgW && cropH === imgH) return dataUrl;
  // Safety: never collapse the image too far.
  if (cropW < imgW * 0.5 || cropH < imgH * 0.5) return dataUrl;

  const outCanvas = document.createElement('canvas');
  outCanvas.width = cropW;
  outCanvas.height = cropH;
  const outCtx = outCanvas.getContext('2d');
  if (!outCtx) return dataUrl;
  outCtx.imageSmoothingEnabled = true;
  outCtx.imageSmoothingQuality = 'high';
  if (opts.background) {
    outCtx.fillStyle = opts.background;
    outCtx.fillRect(0, 0, cropW, cropH);
  } else {
    outCtx.clearRect(0, 0, cropW, cropH);
  }
  outCtx.drawImage(img, left, top, cropW, cropH, 0, 0, cropW, cropH);

  return opts.mimeType === 'image/jpeg'
    ? outCanvas.toDataURL('image/jpeg', typeof opts.quality === 'number' ? opts.quality : 0.96)
    : outCanvas.toDataURL('image/png');
};

/**
 * GEMINI FIX: Normalize product to target aspect ratio with light neutral padding
 * This prevents distortion by showing the model the "intended space" around the product
 * Uses a very light gray background instead of transparency for better model comprehension
 * 
 * @param dataUrl - Product image data URL
 * @param targetAspectRatio - Target output aspect ratio (e.g., "1:1", "4:5")
 * @param relativeHeight - Scale factor based on real-world height (0.0 to 1.0, where 1.0 = tallest product)
 * @param opts - Canvas and quality options
 */
const normalizeProductWithTransparentPadding = async (
  dataUrl: string,
  targetAspectRatio: string,
  relativeHeight: number,
  opts: { maxLongEdge: number; mimeType: 'image/png' | 'image/jpeg'; quality?: number }
): Promise<{ base64: string; mimeType: string }> => {
  const parsed = parseAspectRatio(targetAspectRatio);
  if (!parsed) {
    const [, base64] = String(dataUrl).split(';base64,');
    return { base64: base64 ?? '', mimeType: opts.mimeType };
  }

  const img = await loadImageFromUrl(dataUrl);
  const imgW = img.naturalWidth;
  const imgH = img.naturalHeight;
  if (!imgW || !imgH) {
    const [, base64] = String(dataUrl).split(';base64,');
    return { base64: base64 ?? '', mimeType: opts.mimeType };
  }

  const targetRatio = parsed.w / parsed.h;
  
  // Create canvas with target aspect ratio
  let canvasW: number;
  let canvasH: number;
  if (targetRatio >= 1) {
    // Landscape or square
    canvasW = opts.maxLongEdge;
    canvasH = Math.round(canvasW / targetRatio);
  } else {
    // Portrait
    canvasH = opts.maxLongEdge;
    canvasW = Math.round(canvasH * targetRatio);
  }

  const canvas = document.createElement('canvas');
  canvas.width = canvasW;
  canvas.height = canvasH;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    const [, base64] = String(dataUrl).split(';base64,');
    return { base64: base64 ?? '', mimeType: opts.mimeType };
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  
  // GEMINI STRATEGY: Instead of pure transparency, use a very light neutral background
  // This gives the model a "hint" that this space should be filled with environment
  // Pure transparency may confuse the model's composition logic
  ctx.fillStyle = '#F8F8F8'; // Very light gray, almost white
  ctx.fillRect(0, 0, canvasW, canvasH);

  // Calculate product dimensions maintaining aspect ratio
  const imgRatio = imgW / imgH;
  
  // Apply relative height scaling (based on cm/in values)
  const displayHeight = canvasH * Math.min(relativeHeight, 0.95); // Max 95% of canvas height
  const displayWidth = displayHeight * imgRatio;

  // Center horizontally, align to bottom (product sits on "surface")
  const x = (canvasW - displayWidth) / 2;
  const y = canvasH - displayHeight - (canvasH * 0.05); // 5% padding from bottom

  ctx.drawImage(img, x, y, displayWidth, displayHeight);

  // Return as JPEG with light background (no transparency needed)
  const out = canvas.toDataURL('image/jpeg', 0.95);
  const [, base64] = out.split(';base64,');
  return { base64: base64 ?? '', mimeType: 'image/jpeg' };
};

const maybeDownscaleInlineImage = async (
  base64: string,
  mimeType: string,
  opts: { maxLongEdge: number; maxBase64Length: number; quality: number }
): Promise<{ base64: string; mimeType: string }> => {
  if (!base64) return { base64, mimeType };
  if (base64.length <= opts.maxBase64Length) return { base64, mimeType };
  const dataUrl = `data:${mimeType};base64,${base64}`;
  return downscaleDataUrlToJpeg(dataUrl, { maxLongEdge: opts.maxLongEdge, quality: opts.quality });
};

const App: React.FC = () => {
  const GEMINI_DISABLED = false; // Gemini must stay enabled for direct image generation
  const location = useLocation();
  const { user, emailUser, isGuest, signInWithGoogle, logout } = useAuth();
  const isLoggedIn = !!user || !!emailUser || isGuest;
  const envApiKey = getEnvApiKey();
  const initialSceneRef = useRef<StoryboardScene | null>(null);
  const bundleSelectionRef = useRef<ProductId[] | null>(null);
  if (!initialSceneRef.current) {
    initialSceneRef.current = {
      id: makeSceneId(),
      label: 'Scene 1',
      options: createDefaultOptions(),
      proMode: false,
      supplementPreset: 'none',
      supplementPromptCue: null,
      supplementBackgroundColor: '',
      supplementAccentColor: '',
      supplementFlavorNotes: '',
      includeSupplementHand: false,
      heroPosePreset: 'none',
      heroPosePromptCue: null,
      supplementCustomPrompt: '',
      heroProductAlignment: 'center',
      heroProductScale: 1,
      heroShadowStyle: 'softDrop',
      ugcRealSettings: createDefaultUGCRealSettings(),
      formulationExpertEnabled: false,
      formulationExpertPreset: FORMULATION_EXPERT_PRESETS[0].value,
      formulationExpertName: '',
      formulationExpertRole: FORMULATION_EXPERT_PRESETS[0].role,
      formulationLabStyle: FORMULATION_LAB_OPTIONS[0].value,
      formulationExpertProfession: 'custom',
      personIdentityPackage: createPersonIdentityPackage(createDefaultOptions()),
      modelReferenceNotes: '',
    };
  }
  const [options, setOptions] = useState<MockupOptions>(() => syncCharacterFields(cloneOptions(initialSceneRef.current!.options)));
  const hasSelectedIntent = Boolean(options.contentStyle);
  const contentStyleValue = hasSelectedIntent ? options.contentStyle : CONTENT_STYLE_OPTIONS[0].value;
  const isProductPlacement = contentStyleValue === 'product';
  const applyOptionsUpdate = useCallback(
    (updater: React.SetStateAction<MockupOptions>) => {
      setOptions(prev => {
        const next = typeof updater === 'function' ? (updater as (prev: MockupOptions) => MockupOptions)(prev) : updater;
        return syncCharacterFields(next);
      });
    },
    []
  );
  const [storyboardScenes, setStoryboardScenes] = useState<StoryboardScene[]>(() => [initialSceneRef.current!]);
  const [activeSceneId, setActiveSceneId] = useState<string>(initialSceneRef.current!.id);

  const [uploadedImageFile, setUploadedImageFile] = useState<File | null>(null);
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);
  const [productAssets, setProductAssets] = useState<ProductAsset[]>([]);
  const [activeProducts, setActiveProducts] = useState<ActiveProduct[]>([]);
  const [isMultiProductPackaging, setIsMultiProductPackaging] = useState(false);
  const [modelReferenceFile, setModelReferenceFile] = useState<File | null>(null);
  const [modelReferencePreview, setModelReferencePreview] = useState<string | null>(null);
  const [modelReferenceNotes, setModelReferenceNotes] = useState('');
  const [modelReferenceLockAccessories, setModelReferenceLockAccessories] = useState(true);
  const [personIdentityPackage, setPersonIdentityPackage] = useState<PersonIdentityPackage>(() =>
    createPersonIdentityPackage(createDefaultOptions())
  );
  const [identitySourceSceneId, setIdentitySourceSceneId] = useState<string>(initialSceneRef.current!.id);
  const [compositionMode, setCompositionMode] = useState<CompositionMode>('balanced');
  const [activeSupplementPreset, setActiveSupplementPreset] = useState('none');
  const [supplementPresetCue, setSupplementPresetCue] = useState<string | null>(null);
  const [supplementBackgroundColor, setSupplementBackgroundColor] = useState('');
  const [supplementAccentColor, setSupplementAccentColor] = useState('');
  const [supplementFlavorNotes, setSupplementFlavorNotes] = useState('');
  const [supplementCustomPrompt, setSupplementCustomPrompt] = useState('');
  const [includeSupplementHand, setIncludeSupplementHand] = useState(false);
  const [selectedHeroPreset, setSelectedHeroPreset] = useState('face-frame-hero');
  const [customHeroDescription, setCustomHeroDescription] = useState('');
  const [heroPosePromptCue, setHeroPosePromptCue] = useState<string | null>(null);
  const [heroProductAlignment, setHeroProductAlignment] = useState<HeroLandingAlignment>('center');
  const [heroProductScale, setHeroProductScale] = useState(1);
  const [heroShadowStyle, setHeroShadowStyle] = useState<HeroLandingShadowStyle>('softDrop');
  const [step, setStep] = useState(1);
  const [scene, setScene] = useState('studio');
  const [camera, setCamera] = useState('front');
  const [lighting, setLighting] = useState('soft');
  const [lifestylePrompt, setLifestylePrompt] = useState('');
  const [ugcRealSettings, setUgcRealSettings] = useState<UGCRealModeSettings>(() => createDefaultUGCRealSettings());
  const [formulationExpertEnabled, setFormulationExpertEnabled] = useState(false);
  const [formulationExpertPreset, setFormulationExpertPreset] = useState(FORMULATION_EXPERT_PRESETS[0].value);
  const [formulationExpertName, setFormulationExpertName] = useState('');
  const [formulationExpertRole, setFormulationExpertRole] = useState(FORMULATION_EXPERT_PRESETS[0].role);
  const [formulationLabStyle, setFormulationLabStyle] = useState(FORMULATION_LAB_OPTIONS[0].value);
  const [formulationExpertProfession, setFormulationExpertProfession] = useState('custom');
  const [activeBundleTab, setActiveBundleTab] = useState<'premade' | 'custom' | 'recommended'>('premade');
  const [recommendedBaseProduct, setRecommendedBaseProduct] = useState<ProductId>(ALL_PRODUCT_IDS[0] || 'product_1');
  const [lastBundleSelection, setLastBundleSelection] = useState<ProductId[] | null>(null);
  const availableProductIds = useMemo<ProductId[]>(
    () => productAssets.map((_, index) => `product_${index + 1}` as ProductId),
    [productAssets]
  );
  const activeProductIds = useMemo<ProductId[]>(
    () => activeProducts.map(product => product.id as ProductId),
    [activeProducts]
  );
  const normalizedCreatorPresetOptions = useMemo(
    () =>
      normalizeOptions(
        CREATOR_PRESETS.map(preset => ({
          label: preset.label,
          value: preset.value,
          tooltip: preset.description,
        }))
      ),
    []
  );
  const normalizedGoalWizardGoals = useMemo(() => normalizeOptions(GOAL_WIZARD_GOAL_OPTIONS), []);
  const normalizedGoalVibeOptions = useMemo(() => normalizeOptions(GOAL_VIBE_OPTIONS), []);
  const normalizedCreatorWizardPresets = useMemo(() => normalizeOptions(CREATOR_PRESETS), []);
  const normalizedSupplementPresets = useMemo(() => normalizeOptions(SUPPLEMENT_PHOTO_PRESETS), []);
  const normalizedHeroPersonPresets = useMemo(
    () =>
      normalizeOptions(
        HERO_PERSON_DESCRIPTION_PRESETS.map(preset => ({
          label: preset.label,
          value: preset.id,
          description: preset.description,
        }))
      ),
    []
  );
  const availableProductIdSet = useMemo(() => new Set<ProductId>(availableProductIds), [availableProductIds]);
  const normalizedProductAssets = useMemo(
    () =>
      productAssets.map(asset => ({
        id: asset.id,
        label: asset.label,
        imageUrl: (asset as any).imageUrl ?? asset.previewUrl ?? (asset as any).url ?? null,
      })),
    [productAssets]
  );
  const productMediaLibrary = useMemo<ProductMediaLibrary>(() => {
    if (!normalizedProductAssets.length) {
      return PRODUCT_MEDIA_LIBRARY;
    }
    return normalizedProductAssets.reduce<ProductMediaLibrary>((acc, asset, index) => {
      const productId = `product_${index + 1}` as ProductId;
      const entry = {
        label: asset.label || `Product ${index + 1}`,
        imageUrl: asset.imageUrl,
      };
      acc[productId] = entry;
      return acc;
    }, {});
  }, [normalizedProductAssets]);
  useEffect(() => {
    installGenerationLogBridge();
  }, []);

  useEffect(() => {
    setActiveProducts(prev => {
      const next = prev.flatMap(product => {
        const asset = productAssets.find(assetItem => assetItem.id === product.id);
        if (!asset) return [];
        const heightValue = asset.heightValue ?? null;
        const heightUnit = asset.heightUnit ?? 'cm';
        const heightCm =
          heightValue != null && Number.isFinite(Number(heightValue)) && Number(heightValue) > 0
            ? (heightUnit === 'in' ? Number(heightValue) * 2.54 : Number(heightValue))
            : undefined;
        const updatedProduct: ActiveProduct = {
          ...product,
          name: asset.label || product.name,
          base64: asset.base64 ?? product.base64,
          mimeType: asset.mimeType ?? product.mimeType,
          heightValue,
          heightUnit,
          ...(heightCm != null ? { heightCm } : {}),
        };
        return [updatedProduct];
      });
      const isSame =
        next.length === prev.length &&
        next.every((item, index) => item.name === prev[index]?.name && item.heightCm === prev[index]?.heightCm);
      if (isSame) {
        if (!next.length && productAssets.length) {
          const fallback = buildActiveProductFromAsset(productAssets[0]);
          return fallback ? [fallback] : [];
        }
        return prev;
      }
      if (!next.length && productAssets.length) {
        const fallback = buildActiveProductFromAsset(productAssets[0]);
        return fallback ? [fallback] : [];
      }
      return next;
    });
  }, [isProductPlacement, productAssets]);

  // PHASE 5: Sync productAssets to ProductStudioStore for Product mode
  useEffect(() => {
    if (!isProductPlacement) return;

    const store = useProductStudioStore.getState();
    const currentProducts = store.products;

    // Only sync if products have changed
    const productIds = productAssets.map(a => a.id);
    const currentIds = currentProducts.map(p => p.id);
    const needsSync = productIds.length !== currentIds.length ||
      !productIds.every((id, i) => id === currentIds[i]);

    if (!needsSync) return;

    let canceled = false;
    (async () => {
      // Rebuild products in store (with palette extraction) WITHOUT wiping user-selected settings.
      store.resetProducts();
      for (const asset of productAssets) {
        if (canceled) return;
        if (!asset.base64 || !asset.mimeType) continue;
        await addProductWithPalette({
          id: asset.id,
          name: asset.label || 'Product',
          imageUrl: asset.previewUrl || '',
          base64: asset.base64,
          mimeType: asset.mimeType,
          heightValue: asset.heightValue,
          heightUnit: asset.heightUnit,
        });
      }
      if (canceled) return;
      console.log('[PRODUCT STUDIO SYNC] Products synced:', useProductStudioStore.getState().products.length);
    })();

    return () => {
      canceled = true;
    };
  }, [isProductPlacement, productAssets]);

  // Keep ProductStudioStore metadata (name + height) in sync without resetting user settings.
  useEffect(() => {
    if (!isProductPlacement) return;
    const store = useProductStudioStore.getState();
    for (const asset of productAssets) {
      const product = store.products.find(p => p.id === asset.id);
      if (!product) continue;
      const nextName = asset.label || 'Product';
      if (product.name !== nextName) {
        store.updateProductName(asset.id, nextName);
      }
      const nextHeightValue = asset.heightValue ?? null;
      const nextHeightUnit = asset.heightUnit ?? 'cm';
      const currentHeightValue = (product as any).heightValue ?? null;
      const currentHeightUnit = (product as any).heightUnit ?? 'cm';
      if (currentHeightValue !== nextHeightValue || currentHeightUnit !== nextHeightUnit) {
        store.updateProductHeight(asset.id, nextHeightValue, nextHeightUnit);
      }
    }
  }, [isProductPlacement, productAssets]);
  useEffect(() => {
    if (!availableProductIds.length) return;
    if (!availableProductIds.includes(recommendedBaseProduct)) {
      setRecommendedBaseProduct(availableProductIds[0]);
    }
  }, [availableProductIds, recommendedBaseProduct]);
  const persistUgcRealSettings = useCallback(
    (updater: (prev: UGCRealModeSettings) => UGCRealModeSettings) => {
      setUgcRealSettings(prev => {
        const next = updater(prev);
        setStoryboardScenes(prevScenes =>
          prevScenes.map(scene => (scene.id === activeSceneId ? { ...scene, ugcRealSettings: next } : scene))
        );
        return next;
      });
    },
    [activeSceneId]
  );
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [fourKVariant, setFourKVariant] = useState<ImageVariant | null>(null);
  const [twoKVariant, setTwoKVariant] = useState<ImageVariant | null>(null);
  const [isPreparingHiRes, setIsPreparingHiRes] = useState(false);
  const [hiResError, setHiResError] = useState<string | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [isGeneratingSequence, setIsGeneratingSequence] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [editPrompt, setEditPrompt] = useState('');
  const [apiKey, setApiKey] = useState<string>(envApiKey ?? '');
  const [manualApiKey, setManualApiKey] = useState('');
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);
  const [isUsingStoredKey, setIsUsingStoredKey] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [inviteUsed, setInviteUsed] = useState(false);
  const [remoteCredits, setRemoteCredits] = useState<number | null>(null);
  const [remotePlanTier, setRemotePlanTier] = useState<PlanTier | null>(null);
  useEffect(() => {
    const nextEmail = user?.email || emailUser || '';
    setUserEmail(nextEmail);
  }, [user?.email, emailUser]);

  useEffect(() => {
    let active = true;
    if (!userEmail) {
      setInviteUsed(false);
      setRemoteCredits(null);
      setRemotePlanTier(null);
      return () => {
        active = false;
      };
    }
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/user?action=me');
        if (!res.ok) {
          if (active) {
            setRemoteCredits(0);
            setRemotePlanTier('free');
          }
          return;
        }
        const data = await res.json();
        if (active) {
          setInviteUsed(Boolean(data.inviteUsed));
          const credits = Number(data.remaining_credits ?? data.credits ?? 0);
          setRemoteCredits(Number.isFinite(credits) ? credits : 0);
          const rawPlan = String(data.plan ?? 'free')
            .trim()
            .toLowerCase();
          if (rawPlan === 'creator' || rawPlan === 'studio' || rawPlan === 'free') {
            setRemotePlanTier(rawPlan);
          } else {
            setRemotePlanTier('free');
          }
        }
      } catch (error) {
        console.error('Unable to fetch user profile for gallery', error);
        if (active) {
          setRemoteCredits(0);
          setRemotePlanTier('free');
        }
      }
    };
    fetchProfile();
    return () => {
      active = false;
    };
  }, [userEmail]);

  const [creditUsage, setCreditUsage] = useState(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('guest_credit_usage')) {
      return parseInt(localStorage.getItem('guest_credit_usage') || '0', 10);
    }
    return 0;
  }); // tracks credits spent

  useEffect(() => {
    if (isGuest) {
      localStorage.setItem('guest_credit_usage', creditUsage.toString());
    }
  }, [creditUsage, isGuest]);
  const [videoGenerationCount, setVideoGenerationCount] = useState(0);
  const [hasVideoAccess, setHasVideoAccess] = useState(false);
  const [videoAccessInput, setVideoAccessInput] = useState('');
  const [videoAccessError, setVideoAccessError] = useState<string | null>(null);
  const [moodImagePreview, setMoodImagePreview] = useState<string | null>(null);
  const [moodPalette, setMoodPalette] = useState<string[]>([]);
  const [moodSummary, setMoodSummary] = useState<string | null>(null);
  const [moodPromptCue, setMoodPromptCue] = useState<string | null>(null);
  const [isMoodProcessing, setIsMoodProcessing] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(1);

  // LifestyleStep3 state for PromptEngine
  const [lifestyleStep3Values, setLifestyleStep3Values] = useState<Step3Values | null>(null);
  const [hasFirstGenerationComplete, setHasFirstGenerationComplete] = useState(false);

  const [ecommerceSelectedSlots, setEcommerceSelectedSlots] = useState<EcommerceSlotKey[]>([]);
  const [ecommerceSlotsConfig, setEcommerceSlotsConfig] = useState<EcommerceSlotsConfig>(() => loadEcommerceSlotsConfig());
  const [ecommerceSlotBaseImages, setEcommerceSlotBaseImages] = useState<Partial<Record<EcommerceSlotKey, string | null>>>({});
  const [ecommerceSlotGenerationMeta, setEcommerceSlotGenerationMeta] = useState<
    Partial<Record<EcommerceSlotKey, EcommercePdpGenerationMeta>>
  >({});
  const [ecommerceGenerationSettings, setEcommerceGenerationSettings] = useState<EcommerceGenerationSettings>({
    reserveBlankSpace: false,
    blankSpaceDirection: 'right',
    viewFraming: 'centered',
  });

  useEffect(() => {
    saveEcommerceSlotsConfig(ecommerceSlotsConfig);
  }, [ecommerceSlotsConfig]);
  const [activeTalentPreset, setActiveTalentPreset] = useState('custom');
  const [isProPhotographer, setIsProPhotographer] = useState(false);
  const [activeProPreset, setActiveProPreset] = useState<string>('custom');
  const [savedTalentProfile, setSavedTalentProfile] = useState<Partial<MockupOptions> | null>(null);
  const [talentToast, setTalentToast] = useState<'idle' | 'saved' | 'applied'>('idle');
  const [generatedCopy, setGeneratedCopy] = useState<string | null>(null);
  const [isCopyLoading, setIsCopyLoading] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);
  const [planTier, setPlanTier] = useState<PlanTier>(() => {
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem(PLAN_STORAGE_KEY) as PlanTier | null;
      if (saved === 'creator' || saved === 'studio' || saved === 'free') return saved;
    }
    return 'free';
  });
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [planCodeInput, setPlanCodeInput] = useState('');
  const [planCodeError, setPlanCodeError] = useState<string | null>(null);
  const [planNotice, setPlanNotice] = useState<string | null>(null);
  const [isSimpleMode, setIsSimpleMode] = useState(true);
  // modeTier removed (unused)
  const [showGoalWizard, setShowGoalWizard] = useState(false);
  const [goalWizardStep, setGoalWizardStep] = useState(1);
  const [goalWizardData, setGoalWizardData] = useState({
    goal: 'ugc',
    vibe: 'warm',
    preset: 'beauty_creator',
  });
  const [isTalentLinkedAcrossScenes, setIsTalentLinkedAcrossScenes] = useState(false);
  const [linkedTalentProfile, setLinkedTalentProfile] = useState<Partial<MockupOptions> | null>(null);
  const [isRandomCharacterEnabled, setIsRandomCharacterEnabled] = useState(false);
  const heroProductId = activeProducts[0]?.id ?? productAssets[0]?.id ?? null;
  const activeProductAsset = useMemo(
    () => productAssets.find(asset => asset.id === heroProductId) ?? null,
    [productAssets, heroProductId]
  );
  const intentRef = useRef<HTMLDivElement>(null);
  const uploadRef = useRef<HTMLDivElement>(null);
  const customizeRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const trialInputRef = useRef<HTMLInputElement>(null);
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const googleInitRef = useRef(false);
  const identityContinuityRef = useRef<{ identityKey?: string; identitySeed?: string } | null>(null);
  const lastAspectRatioRef = useRef<string>('1:1');
  const uploaderRef = useRef<ImageUploaderHandle | null>(null);
  const isDevBypass = useMemo(() => {
    // Local dev should never be blocked by credit limits.
    return Boolean(import.meta.env.DEV);
  }, []);
  const isAdmin = useMemo(() => {
    const normalized = userEmail.trim().toLowerCase();
    return (
      ADMIN_EMAILS.includes(normalized) ||
      normalized === 'boostugc@gmail.com' ||
      normalized.endsWith('@amisano-design.com')
    );
  }, [userEmail]);
  const resolvedPlanTier = useMemo<PlanTier>(() => {
    if (!isGuest && remotePlanTier) return remotePlanTier;
    return planTier;
  }, [isGuest, remotePlanTier, planTier]);
  const isFreeUser = !isAdmin && resolvedPlanTier === 'free';
  const [hasTrialBypass, setHasTrialBypass] = useState(false);
  const [trialCodeInput, setTrialCodeInput] = useState('');
  const [trialCodeError, setTrialCodeError] = useState<string | null>(null);
  const isTrialBypassActive = hasTrialBypass || isDevBypass || isAdmin;
  const hasUploadedProduct = activeProducts.length > 0 || productAssets.length > 0;
  const ritualNoProductMode =
    !isProductPlacement &&
    lifestyleStep3Values?.ritualModeEnabled === true &&
    lifestyleStep3Values?.ritualHideProduct === true;
  const formulationNoProductMode =
    !isProductPlacement &&
    lifestyleStep3Values?.formulationStoryEnabled === true &&
    lifestyleStep3Values?.formulationProductVisible === false;
  const hideProductMode = ritualNoProductMode || formulationNoProductMode;
  const [isGenerateBarVisible, setIsGenerateBarVisible] = useState(true);
  const generateBarInactivityTimerRef = useRef<number | null>(null);
  const clearGenerateBarInactivityTimer = useCallback(() => {
    if (generateBarInactivityTimerRef.current !== null && typeof window !== 'undefined') {
      window.clearTimeout(generateBarInactivityTimerRef.current);
      generateBarInactivityTimerRef.current = null;
    }
  }, []);
  const showGenerateBar = useCallback(() => {
    setIsGenerateBarVisible(true);
  }, []);
  const scheduleGenerateBarAutoHide = useCallback(() => {
    if (typeof window === 'undefined') return;
    clearGenerateBarInactivityTimer();
    generateBarInactivityTimerRef.current = window.setTimeout(() => {
      setIsGenerateBarVisible(false);
    }, 2600);
  }, [clearGenerateBarInactivityTimer]);
  const bumpGenerateBarActivity = useCallback(() => {
    showGenerateBar();
    scheduleGenerateBarAutoHide();
  }, [scheduleGenerateBarAutoHide, showGenerateBar]);
  const canUseMood = hasUploadedProduct;
  const [lifestyleTone, setLifestyleTone] = useState<'ugc' | 'editorial'>('ugc');
  const toggleTheme = useCallback(() => {
    const root = document.documentElement;
    const nextIsDark = !root.classList.contains('dark');
    root.classList.toggle('dark', nextIsDark);
    document.body.classList.toggle('dark', nextIsDark);
    root.style.colorScheme = nextIsDark ? 'dark' : 'light';
    try {
      localStorage.setItem('theme', nextIsDark ? 'dark' : 'light');
    } catch {
      // ignore
    }
  }, []);
  const hasModelReference = Boolean(modelReferenceFile || personIdentityPackage.modelReferenceBase64);
  const resolveOutputAspectRatio = useCallback(() => {
    const label = lifestyleStep3Values?.aspectRatio;
    if (label) {
      const map: Record<string, string> = {
        '1:1 (Square)': '1:1',
        '4:5 (Portrait)': '4:5',
        '9:16 (Story)': '9:16',
        '16:9 (Landscape)': '16:9',
      };
      if (map[label]) return map[label];
    }
    if (typeof options.aspectRatio === 'string' && options.aspectRatio.trim()) {
      const normalized = options.aspectRatio.trim();
      const allowed = new Set(['1:1', '4:5', '9:16', '16:9', '3:4', '4:3']);
      if (allowed.has(normalized)) return normalized;
    }
    if (isProductPlacement) {
      const productRatio = String(useProductStudioStore.getState().aspectRatio || '').trim();
      if (productRatio) return productRatio;
    }
    return lastAspectRatioRef.current || '1:1';
  }, [isProductPlacement, lifestyleStep3Values?.aspectRatio, options.aspectRatio]);
  const selectedOutputAspectRatio = useMemo(() => {
    return resolveOutputAspectRatio();
  }, [resolveOutputAspectRatio]);
  useEffect(() => {
    const shouldKeepVisible = isImageLoading || (!hasUploadedProduct && !hideProductMode);
    if (shouldKeepVisible) {
      showGenerateBar();
      clearGenerateBarInactivityTimer();
      return;
    }
    bumpGenerateBarActivity();
    return () => {
      clearGenerateBarInactivityTimer();
    };
  }, [bumpGenerateBarActivity, clearGenerateBarInactivityTimer, hasUploadedProduct, hideProductMode, isImageLoading, showGenerateBar]);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleActivity = () => {
      if (isImageLoading || (!hasUploadedProduct && !hideProductMode)) {
        showGenerateBar();
        clearGenerateBarInactivityTimer();
        return;
      }
      bumpGenerateBarActivity();
    };
    window.addEventListener('mousemove', handleActivity, { passive: true });
    window.addEventListener('scroll', handleActivity, { passive: true });
    window.addEventListener('touchstart', handleActivity, { passive: true });
    window.addEventListener('keydown', handleActivity);
    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('scroll', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      window.removeEventListener('keydown', handleActivity);
    };
  }, [bumpGenerateBarActivity, clearGenerateBarInactivityTimer, hasUploadedProduct, hideProductMode, isImageLoading, showGenerateBar]);
  useEffect(() => {
    if (!hasModelReference) {
      setCompositionMode('balanced');
      setModelReferenceNotes('');
      setModelReferenceLockAccessories(true);
    }
  }, [hasModelReference]);
  const primarySceneId = storyboardScenes[0]?.id ?? identitySourceSceneId;
  const isActiveScenePrimary = activeSceneId === primarySceneId;
  const samePersonControlsDisabled = isTalentLinkedAcrossScenes && !isActiveScenePrimary;
  const isPersonOptionsDisabled =
    isProductPlacement || options.ageGroup === 'no person' || hasModelReference || samePersonControlsDisabled;
  const personControlsDisabled = isPersonOptionsDisabled;
  const personInScene = !isPersonOptionsDisabled;
  const personPropNoneValue = PERSON_PROP_OPTIONS[0].value;
  const microLocationDefault = MICRO_LOCATION_NONE_VALUE;
  const isHeroLandingMode = activeSupplementPreset === HERO_LANDING_PRESET_VALUE;
  const currentPlan = PLAN_CONFIG[resolvedPlanTier];
  const modeLabel = isProductPlacement ? 'Product (Studio)' : 'Lifestyle';
  const hasWatermark = isFreeUser;
  const shouldRequireLogin = !isLoggedIn;
  const loginGateActive = shouldRequireLogin;
  const planCreditLimit = isGuest ? 2 : currentPlan.creditLimit;
  const planVideoLimit = Math.floor(planCreditLimit / VIDEO_CREDIT_COST);
  const hasVideoExports = planVideoLimit > 0;
  const canUseStudioFeatures = currentPlan.allowStudio || isTrialBypassActive;
  const canUseCaptionAssistant = false;
  const isUsingRemoteCredits = !isGuest && Boolean(userEmail.trim());
  const isAnonymousTrialMode = !userEmail.trim();
  const shouldTrackLocalCredits = !isUsingRemoteCredits && !isAnonymousTrialMode;
  const remainingCredits = isTrialBypassActive
    ? 999_999
    : isAnonymousTrialMode
      ? 999_999
      : Math.max(
        isUsingRemoteCredits ? (remoteCredits ?? planCreditLimit) : planCreditLimit - creditUsage,
        0
      );
  const remainingVideos = Math.max(planVideoLimit - videoGenerationCount, 0);
  const isTrialLocked = !isTrialBypassActive && !isAnonymousTrialMode && remainingCredits <= 0;
  const hasPlanVideoAccess = planVideoLimit > 0 || hasVideoAccess || isTrialBypassActive;
  const isVideoLimitReached = !isTrialBypassActive && planVideoLimit > 0 && videoGenerationCount >= planVideoLimit;
  const showCaptionAssistant = false;
  useEffect(() => {
    if (!isTrialBypassActive && !isAnonymousTrialMode && remainingCredits <= 0) {
      setShowPlanModal(true);
      setPlanNotice(
        isGuest
          ? "You’ve used your 2 free credits. Sign in to keep your history and unlock more credits."
          : 'You are out of credits. Upgrade your plan to keep generating.'
      );
    }
  }, [isTrialBypassActive, remainingCredits, isGuest, isAnonymousTrialMode]);
  useEffect(() => {
    if ((!personInScene || isProductPlacement) && ugcRealSettings.isEnabled) {
      persistUgcRealSettings(prev => ({ ...prev, isEnabled: false }));
    }
  }, [personInScene, isProductPlacement, ugcRealSettings.isEnabled, persistUgcRealSettings]);

  useEffect(() => {
    if (!isTalentLinkedAcrossScenes) return;
    if (!storyboardScenes.length) return;
    setIdentitySourceSceneId(storyboardScenes[0].id);
  }, [isTalentLinkedAcrossScenes, storyboardScenes]);

  useEffect(() => {
    setStoryboardScenes(prev => {
      let updated = false;
      const next = prev.map(scene => {
        if (scene.id !== activeSceneId) return scene;
        const shouldUpdate =
          scene.formulationExpertEnabled !== formulationExpertEnabled ||
          scene.formulationExpertPreset !== formulationExpertPreset ||
          scene.formulationExpertName !== formulationExpertName ||
          scene.formulationExpertRole !== formulationExpertRole ||
          scene.formulationLabStyle !== formulationLabStyle ||
          scene.formulationExpertProfession !== formulationExpertProfession;
        if (!shouldUpdate) return scene;
        updated = true;
        return {
          ...scene,
          formulationExpertEnabled,
          formulationExpertPreset,
          formulationExpertName,
          formulationExpertRole,
          formulationLabStyle,
          formulationExpertProfession,
        };
      });
      return updated ? next : prev;
    });
  }, [
    activeSceneId,
    formulationExpertEnabled,
    formulationExpertPreset,
    formulationExpertName,
    formulationExpertRole,
    formulationLabStyle,
    formulationExpertProfession,
  ]);
  const scrollToSection = useCallback((title: string) => {
    const element = document.getElementById(getSectionId(title));
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [GOOGLE_CLIENT_ID]);
  const shouldShowOnboarding = showOnboarding && !isTrialLocked;
  const stepThreeCategories = useMemo<Set<OptionCategory>>(
    () =>
      new Set<OptionCategory>([
        'productMaterial',
        'setting',
        'environmentOrder',
        'productPlane',
        'placementStyle',
        'placementCamera',
        'lighting',
        'camera',
        'perspective',
        'aspectRatio',
        'realism',
        'ageGroup',
        'personAppearance',
        'personPose',
        'wardrobeStyle',
        'personMood',
        'personProps',
        'microLocation',
        'personExpression',
        'hairStyle',
        'hairColor',
        'eyeColor',
        'skinTone',
        'skinRealism',
        'proLens',
        'proLightingRig',
        'proPostTreatment',
        'productInteraction',
        'gender',
        'ethnicity',
        'selfieType',
      ]),
    []
  );
  const onboardingStepsMeta = useMemo(
    () => [
      {
        title: 'Choose Content Intent',
        description: 'Pick between authentic UGC or a polished placement. This unlocks the rest of the builder.',
        ref: intentRef,
      },
      {
        title: 'Upload your product',
        description: 'Drop your product photo once—we’ll reuse it for every variation unless you replace it.',
        ref: uploadRef,
      },
      {
        title: 'Customize the vibe',
        description: 'Dial in scene, camera, realism, and people details before generating or editing.',
        ref: customizeRef,
      },
    ],
    []
  );

  // State for video generation
  const [videoPrompt, setVideoPrompt] = useState('');
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [isAiStudioAvailable, setIsAiStudioAvailable] = useState(false);
  const [isKeySelected, setIsKeySelected] = useState(true); // Always bypass Gemini key gate

  // State to manage which accordion is currently open
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<Set<OptionCategory>>(new Set());
  const accordionOrder = useMemo(() => {
    const order: string[] = [];
    order.push('Content Intent');
    order.push('Scene & Environment');
    if (isProductPlacement) {
      order.push('Product Details');
    }
    order.push('Photography');
    if (!isProductPlacement) {
      order.push('Person Details');
    }
    return order;
  }, [isProductPlacement]);
  const activePresetMeta = useMemo(() => CREATOR_PRESET_LOOKUP[activeTalentPreset], [activeTalentPreset]);
  const hasSavedTalent = Boolean(savedTalentProfile);
  useEffect(() => {
    if (isProductPlacement && openAccordion === 'Person Details') {
      setOpenAccordion('Product Details');
    }
    if (!isProductPlacement && openAccordion === 'Product Details') {
      setOpenAccordion('Person Details');
    }
  }, [isProductPlacement, openAccordion]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const aiStudioInstance = (window as typeof window & { aistudio?: AiStudioApi }).aistudio;
    setIsAiStudioAvailable(Boolean(aiStudioInstance));



    const storedCount = window.localStorage.getItem(IMAGE_COUNT_KEY);
    if (storedCount) {
      const parsed = Number.parseInt(storedCount, 10);
      if (!Number.isNaN(parsed)) {
        setCreditUsage(parsed);
      }
    }

    const storedVideoAccess = window.localStorage.getItem(VIDEO_ACCESS_KEY);
    if (storedVideoAccess === 'granted') {
      setHasVideoAccess(true);
    }

    const storedVideoCount = window.localStorage.getItem(VIDEO_COUNT_KEY);
    if (storedVideoCount) {
      const parsedVideo = Number.parseInt(storedVideoCount, 10);
      if (!Number.isNaN(parsedVideo)) {
        setVideoGenerationCount(parsedVideo);
      }
    }

    const storedPlan = window.localStorage.getItem(PLAN_STORAGE_KEY) as PlanTier | null;
    if (storedPlan) {
      const legacyMap: Record<string, PlanTier> = {
        growth: 'studio',
        enterprise: 'studio',
        starter: 'free',
        agency: 'studio',
      };
      const normalized = (legacyMap[storedPlan] ?? storedPlan) as PlanTier;
      if (PLAN_CONFIG[normalized]) {
        setPlanTier(normalized);
      }
    }

    const storedTrialBypass = window.localStorage.getItem(TRIAL_BYPASS_KEY);
    if (storedTrialBypass === 'true' || storedTrialBypass === 'code') {
      setHasTrialBypass(true);
    }

    const storedKey = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedKey) {
      setApiKey(storedKey);
      setManualApiKey(storedKey);
      setIsKeySelected(true);
      setIsUsingStoredKey(true);
      return;
    }

    if (envApiKey) {
      setIsKeySelected(true);
      return;
    }

    const checkAiStudioSelection = async () => {
      if (aiStudioInstance && await aiStudioInstance.hasSelectedApiKey()) {
        setIsKeySelected(true);
      }
    };

    const storedSimpleMode = window.localStorage.getItem(SIMPLE_MODE_KEY);
    if (storedSimpleMode !== null) {
      setIsSimpleMode(storedSimpleMode === 'true');
    }
    if (window.localStorage.getItem(GOAL_WIZARD_KEY) !== 'true') {
      setShowGoalWizard(true);
    }

    checkAiStudioSelection();
  }, [envApiKey]);

  useEffect(() => {
    if (isAdmin) return;
    if (typeof window !== 'undefined') {
      const storedTrialBypass = window.localStorage.getItem(TRIAL_BYPASS_KEY);
      if (storedTrialBypass === 'code') {
        setHasTrialBypass(true);
        return;
      }
      window.localStorage.removeItem(TRIAL_BYPASS_KEY);
    }
    setHasTrialBypass(false);
  }, [isAdmin]);

  useEffect(() => {
    return () => {
      if (moodImagePreview) {
        URL.revokeObjectURL(moodImagePreview);
      }
    };
  }, [moodImagePreview]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storedTalent = window.localStorage.getItem(TALENT_PROFILE_STORAGE_KEY);
    if (storedTalent) {
      try {
        const parsed = JSON.parse(storedTalent) as Partial<MockupOptions>;
        setSavedTalentProfile(parsed);
      } catch {
        // ignore invalid data
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (talentToast === 'idle') return;
    const timeout = window.setTimeout(() => setTalentToast('idle'), 2200);
    return () => window.clearTimeout(timeout);
  }, [talentToast]);

  useEffect(() => {
    if (!isPersonOptionsDisabled || selectedHeroPreset === 'custom') {
      return;
    }
    setSelectedHeroPreset('custom');
    setHeroPosePromptCue(null);
  }, [isPersonOptionsDisabled, selectedHeroPreset]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.localStorage.getItem(ONBOARDING_DISMISSED_KEY) === 'true') {
      setShowOnboarding(false);
    }
  }, []);

  useEffect(() => {
    setPersonIdentityPackage(prev => ({
      ...prev,
      personDetails: pickPersonDetails(options),
    }));
  }, [options]);



  useEffect(() => {
    if (!isAdmin) return;
    setHasTrialBypass(true);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(TRIAL_BYPASS_KEY, 'true');
    }
  }, [isAdmin]);

  useEffect(() => {
    setStoryboardScenes(prev =>
      prev.map(scene =>
        scene.id === activeSceneId
          ? {
            ...scene,
            options: syncCharacterFields(cloneOptions(options)),
            proMode: isProPhotographer,
            supplementPreset: activeSupplementPreset,
            supplementPromptCue: supplementPresetCue,
            supplementBackgroundColor,
            supplementAccentColor,
            supplementFlavorNotes,
            includeSupplementHand,
            heroPosePreset: selectedHeroPreset,
            heroPosePromptCue,
            supplementCustomPrompt,
            heroProductAlignment,
            heroProductScale,
            heroShadowStyle,
            personIdentityPackage: clonePersonIdentityPackage(personIdentityPackage),
            modelReferenceNotes,
          }
          : scene
      )
    );
  }, [
    options,
    activeSceneId,
    isProPhotographer,
    activeSupplementPreset,
    supplementPresetCue,
    supplementBackgroundColor,
    supplementAccentColor,
    supplementFlavorNotes,
    includeSupplementHand,
    selectedHeroPreset,
    heroPosePromptCue,
    supplementCustomPrompt,
    heroProductAlignment,
    heroProductScale,
    heroShadowStyle,
    ugcRealSettings,
    personIdentityPackage,
    modelReferenceNotes,
  ]);

  useEffect(() => {
    if (!showOnboarding || isTrialLocked) return;
    const current = onboardingStepsMeta[onboardingStep - 1]?.ref.current;
    if (current) {
      current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [showOnboarding, onboardingStep, onboardingStepsMeta, isTrialLocked]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(VIDEO_COUNT_KEY, String(videoGenerationCount));
  }, [videoGenerationCount]);

  useEffect(() => {
    if (!storyboardScenes.find(scene => scene.id === activeSceneId) && storyboardScenes.length) {
      const fallback = storyboardScenes[0];
      setActiveSceneId(fallback.id);
      applyOptionsUpdate(() => cloneOptions(fallback.options));
      setIsProPhotographer(fallback.proMode);
      setActiveSupplementPreset(fallback.supplementPreset ?? 'none');
      setSupplementPresetCue(fallback.supplementPromptCue ?? null);
      setSupplementBackgroundColor(fallback.supplementBackgroundColor ?? '');
      setSupplementAccentColor(fallback.supplementAccentColor ?? '');
      setSupplementFlavorNotes(fallback.supplementFlavorNotes ?? '');
      setIncludeSupplementHand(fallback.includeSupplementHand ?? false);
      setSupplementCustomPrompt(fallback.supplementCustomPrompt ?? '');
      const nextHeroPreset =
        fallback.heroPosePreset && fallback.heroPosePreset !== 'none'
          ? fallback.heroPosePreset
          : 'custom';
      setSelectedHeroPreset(nextHeroPreset);
      setHeroPosePromptCue(fallback.heroPosePromptCue ?? null);
      setHeroProductAlignment(fallback.heroProductAlignment ?? 'center');
      setHeroProductScale(fallback.heroProductScale ?? 1);
      setHeroShadowStyle(fallback.heroShadowStyle ?? 'softDrop');
    }
  }, [activeSceneId, applyOptionsUpdate, storyboardScenes]);

  useEffect(() => {
    setGeneratedCopy(null);
    setCopyError(null);
  }, [generatedImageUrl]);

  useEffect(() => {
    if (activeProductAsset) {
      setUploadedImageFile(activeProductAsset.file);
      setUploadedImagePreview(activeProductAsset.previewUrl);
      return;
    }
    // Avoid false "no upload" states during mode switches; fall back to first asset if available.
    if (productAssets.length) {
      setUploadedImageFile(productAssets[0].file);
      setUploadedImagePreview(productAssets[0].previewUrl);
      return;
    }
    setUploadedImageFile(null);
    setUploadedImagePreview(null);
    setIsMultiProductPackaging(false);
  }, [activeProductAsset, productAssets]);

  useEffect(() => {
    if (!isProductPlacement) return;
    if (openAccordion === 'Person Details') {
      setOpenAccordion('Scene & Environment');
    }
  }, [isProductPlacement, openAccordion]);

  useEffect(() => {
    if (contentStyleValue !== 'product' && isProPhotographer) {
      setIsProPhotographer(false);
      setActiveProPreset('custom');
    }
  }, [contentStyleValue, isProPhotographer]);

  const removeStoredApiKey = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
    setIsUsingStoredKey(false);
  }, []);

  const requireNewApiKey = useCallback(() => {
    setApiKey('');
    setManualApiKey('');
    setIsKeySelected(false);
  }, []);

  const handleApiKeyInvalid = useCallback(() => {
    if (isUsingStoredKey) {
      removeStoredApiKey();
    }
    requireNewApiKey();
  }, [isUsingStoredKey, removeStoredApiKey, requireNewApiKey]);

  const handleManualApiKeySubmit = useCallback(() => {
    const trimmed = manualApiKey.trim();
    if (!trimmed) {
      setApiKeyError('Please enter a valid Gemini API key.');
      return;
    }

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(LOCAL_STORAGE_KEY, trimmed);
    }

    setApiKey(trimmed);
    setIsKeySelected(true);
    setApiKeyError(null);
    setIsUsingStoredKey(true);
  }, [manualApiKey]);

  const handleManualApiKeyChange = useCallback((value: string) => {
    setManualApiKey(value);
    if (apiKeyError) {
      setApiKeyError(null);
    }
  }, [apiKeyError]);

  const getActiveApiKeyOrNotify = useCallback((notify: (message: string) => void): string | null => {
    if (GEMINI_DISABLED) {
      return null;
    }
    const resolvedKey = apiKey || envApiKey;
    if (!resolvedKey) {
      notify('Please add your access key to continue.');
      requireNewApiKey();
      return null;
    }
    return resolvedKey;
  }, [apiKey, envApiKey, requireNewApiKey, GEMINI_DISABLED]);

  const toggleSimpleMode = useCallback(() => {
    setIsSimpleMode(prev => {
      if (prev && !canUseStudioFeatures) {
        setPlanNotice('Upgrade your plan to unlock advanced controls.');
        setShowPlanModal(true);
        return prev;
      }
      const next = !prev;
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(SIMPLE_MODE_KEY, String(next));
      }
      return next;
    });
  }, [canUseStudioFeatures]);

  const syncTalentAcrossScenes = useCallback(
    (profile: Partial<MockupOptions>, sourceSceneId?: string) => {
      setStoryboardScenes(prev =>
        prev.map(scene => {
          const skipScene = sourceSceneId ? scene.id === sourceSceneId : false;
          if (skipScene) return scene;
          const sceneHasTalent =
            scene.options.contentStyle !== 'product' && scene.options.ageGroup !== 'no person';
          if (!sceneHasTalent) return scene;
          const mergedOptions = applyPersonProfileToOptions(scene.options, profile);
          return { ...scene, options: mergedOptions };
        })
      );
    },
    []
  );

  const syncIdentityPackageAcrossScenes = useCallback((packageData: PersonIdentityPackage) => {
    setStoryboardScenes(prev =>
      prev.map(scene => ({
        ...scene,
        personIdentityPackage: clonePersonIdentityPackage(packageData),
      }))
    );
  }, []);

  const renderPersonDetailsSection = () => (
    <>
      {isProductPlacement ? null : (
        <div id={getSectionId('Person Details')}>
          <Accordion
            title="Person Details"
            isOpen={openAccordion === 'Person Details'}
            onToggle={() => handleToggleAccordion('Person Details')}
          >
            <div className="space-y-4">
              <ChipSelectGroup label="Age Group" options={AGE_GROUP_OPTIONS} selectedValue={options.ageGroup} onChange={(value) => handleOptionChange('ageGroup', value, 'Person Details')} disabled={personControlsDisabled} />
              <ChipSelectGroup
                label="People"
                options={PERSON_COUNT_OPTIONS}
                selectedValue={options.personCount ?? 'single'}
                onChange={(value) => handleOptionChange('personCount', value, 'Person Details')}
                disabled={personControlsDisabled}
              />
              {(options.personCount ?? 'single') === 'couple' && (
                <ChipSelectGroup
                  label="Couple"
                  options={COUPLE_SEX_OPTIONS}
                  selectedValue={options.coupleSex ?? 'different'}
                  onChange={(value) => handleOptionChange('coupleSex', value, 'Person Details')}
                  disabled={personControlsDisabled}
                />
              )}
              {isProductPlacement && <p className="text-xs text-gray-500">Person options are disabled for product placement shots.</p>}
              <div className={`rounded-2xl border border-gray-200 bg-gray-100 p-4 space-y-3 ${personControlsDisabled ? 'opacity-50' : ''} dark:bg-white/5 dark:border-white/10 dark:backdrop-blur-[20px] dark:backdrop-saturate-[180%]`}>
                <ChipSelectGroup label="Creator Preset" options={normalizedCreatorPresetOptions} selectedValue={activeTalentPreset} onChange={(value) => handlePresetSelect(value)} disabled={personControlsDisabled} />
                {activePresetMeta?.description && <p className="text-xs text-gray-600 dark:text-white/60">{activePresetMeta.description}</p>}
                <div className="flex flex-wrap gap-2 text-xs">
                  <button type="button" onClick={handleSaveTalentProfile} disabled={personControlsDisabled} className="inline-flex items-center rounded-full border border-gray-200 px-3 py-1 font-semibold text-gray-600 hover:border-indigo-600 hover:text-gray-900 transition disabled:opacity-60 dark:border-white/10 dark:text-white/60 dark:hover:border-white/30 dark:hover:text-white">
                    Save as My Talent
                  </button>
                  <button type="button" onClick={handleApplySavedTalent} disabled={personControlsDisabled || !hasSavedTalent} className="inline-flex items-center rounded-full border border-gray-200 px-3 py-1 font-semibold text-gray-600 hover:border-indigo-600 hover:text-gray-900 transition disabled:opacity-60 dark:border-white/10 dark:text-white/60 dark:hover:border-white/30 dark:hover:text-white">
                    Apply saved talent
                  </button>
                </div>
                {talentToast === 'saved' && <p className="text-xs text-indigo-600">Talent saved for future scenes.</p>}
                {talentToast === 'applied' && <p className="text-xs text-indigo-600">Saved talent applied.</p>}
                <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 space-y-2 dark:bg-white/5 dark:border-white/10 dark:backdrop-blur-[20px] dark:backdrop-saturate-[180%]">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-indigo-600 dark:text-indigo-300">Link talent across scenes</p>
                      <p className="text-xs text-gray-600 dark:text-white/60">Keep this same creator for morning / afternoon / night shots.</p>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center gap-2">
                      <input type="checkbox" className="sr-only" checked={isTalentLinkedAcrossScenes} onChange={handleTalentLinkToggle} disabled={personControlsDisabled} />
                      <div
                        className={`relative h-5 w-10 rounded-full border border-gray-200 transition ${isTalentLinkedAcrossScenes ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-gray-200'} ${personControlsDisabled ? 'opacity-50' : ''} dark:border-white/10 ${isTalentLinkedAcrossScenes ? 'dark:bg-indigo-500 dark:border-indigo-500' : 'dark:bg-white/10'}`}
                      >
                        <span className={`absolute left-1 top-1 block h-3 w-3 rounded-full bg-white border border-gray-200 transition ${isTalentLinkedAcrossScenes ? 'translate-x-4' : ''} dark:border-white/10`} />
                      </div>
                      <span className={`text-xs font-semibold ${isTalentLinkedAcrossScenes ? 'text-indigo-600' : 'text-gray-500'} ${isTalentLinkedAcrossScenes ? 'dark:text-indigo-300' : 'dark:text-white/50'}`}>
                        {isTalentLinkedAcrossScenes ? 'Active' : 'Off'}
                      </span>
                    </label>
                  </div>
                  {/* No persistent explanatory copy; use tooltips only. */}
                </div>
              </div>
              <ChipSelectGroup label="Appearance Level" options={PERSON_APPEARANCE_OPTIONS} selectedValue={options.personAppearance} onChange={(value) => handleOptionChange('personAppearance', value, 'Person Details')} disabled={personControlsDisabled} />
              <ChipSelectGroup label="Mood" options={PERSON_MOOD_OPTIONS} selectedValue={options.personMood} onChange={(value) => handleOptionChange('personMood', value, 'Person Details')} disabled={personControlsDisabled} />
              <ChipSelectGroup label="Pose" options={PERSON_POSE_OPTIONS} selectedValue={options.personPose} onChange={(value) => handleOptionChange('personPose', value, 'Person Details')} disabled={personControlsDisabled} />
              <ChipSelectGroup label="Interaction" options={PRODUCT_INTERACTION_OPTIONS} selectedValue={options.productInteraction} onChange={(value) => handleOptionChange('productInteraction', value, 'Person Details')} disabled={personControlsDisabled} />
              <ChipSelectGroup label="Wardrobe" options={WARDROBE_STYLE_OPTIONS} selectedValue={options.wardrobeStyle} onChange={(value) => handleOptionChange('wardrobeStyle', value, 'Person Details')} disabled={personControlsDisabled} />
              <ChipSelectGroup label="Props" options={PERSON_PROP_OPTIONS} selectedValue={options.personProps} onChange={(value) => handleOptionChange('personProps', value, 'Person Details')} disabled={personControlsDisabled} allowCustom customLabel="Custom prop" customPlaceholder="Describe a prop the person is holding" />
              <ChipSelectGroup label="Micro Location" options={MICRO_LOCATION_OPTIONS} selectedValue={options.microLocation} onChange={(value) => handleOptionChange('microLocation', value, 'Person Details')} disabled={personControlsDisabled} allowCustom customLabel="Custom micro-location" customPlaceholder="Describe a precise spot in the environment" />
              <ChipSelectGroup label="Person Expression" options={PERSON_EXPRESSION_OPTIONS} selectedValue={options.personExpression} onChange={(value) => handleOptionChange('personExpression', value, 'Person Details')} disabled={personControlsDisabled} />
              <ChipSelectGroup label="Gender" options={GENDER_OPTIONS} selectedValue={options.gender} onChange={(value) => handleOptionChange('gender', value, 'Person Details')} disabled={personControlsDisabled} />
              <ChipSelectGroup label="Ethnicity" options={ETHNICITY_OPTIONS} selectedValue={options.ethnicity} onChange={(value) => handleOptionChange('ethnicity', value, 'Person Details')} disabled={personControlsDisabled} />
              <ChipSelectGroup label="Hair Style" options={HAIR_STYLE_OPTIONS} selectedValue={options.hairStyle} onChange={(value) => handleOptionChange('hairStyle', value, 'Person Details')} disabled={personControlsDisabled} />
              <ChipSelectGroup label="Hair Color" options={HAIR_COLOR_OPTIONS} selectedValue={options.hairColor} onChange={(value) => handleOptionChange('hairColor', value, 'Person Details')} disabled={personControlsDisabled} />
              <ChipSelectGroup label="Skin Tone" options={SKIN_TONE_OPTIONS} selectedValue={options.skinTone} onChange={(value) => handleOptionChange('skinTone', value, 'Person Details')} disabled={personControlsDisabled} />
              <ChipSelectGroup label="Skin Realism" options={SKIN_REALISM_OPTIONS} selectedValue={options.skinRealism} onChange={(value) => handleOptionChange('skinRealism', value, 'Person Details')} disabled={personControlsDisabled} />
              <ChipSelectGroup label="Eye Color" options={EYE_COLOR_OPTIONS} selectedValue={options.eyeColor} onChange={(value) => handleOptionChange('eyeColor', value, 'Person Details')} disabled={personControlsDisabled} />
              <ChipSelectGroup label="Selfie Type" options={SELFIE_TYPE_OPTIONS} selectedValue={options.selfieType} onChange={(value) => handleOptionChange('selfieType', value, 'Person Details')} disabled={personControlsDisabled} />
              {!personControlsDisabled && !ugcRealSettings.isEnabled && (
                <div className="rounded-2xl border border-gray-200 bg-gray-100 p-4 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-indigo-600">Hero person presets</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {normalizedHeroPersonPresets.map(preset => {
                      const isActive = selectedHeroPreset === preset.value;
                      return (
                        <button
                          key={preset.value}
                          type="button"
                          onClick={() => handleHeroPosePresetSelect(preset.value)}
                          className={`w-full rounded-xl border px-3 py-2 text-left transition ${isActive
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-md shadow-indigo-500/20 scale-105 duration-500'
                            : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-indigo-600 hover:text-gray-900'
                            }`}
                        >
                          <div className="flex items-center gap-1 relative group text-sm font-semibold">
                            <span>{preset.label}</span>
                            {preset.tooltip && (
                              <span className="text-xs text-gray-600 cursor-pointer group-hover:text-gray-900">
                                ⓘ
                                <div className="absolute left-0 top-4 z-50 hidden group-hover:block bg-white text-gray-900 text-xs p-2 rounded-2xl border border-gray-200 shadow-sm w-44">
                                  {preset.tooltip}
                                </div>
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-gray-600 mt-1">{preset.description}</p>
                        </button>
                      );
                    })}
                  </div>
                  {selectedHeroPreset === 'custom' && (
                    <textarea
                      className="mt-3 w-full rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-indigo-600 focus:outline-none"
                      placeholder="Describe your own hero pose or product interaction..."
                      value={customHeroDescription}
                      onChange={(event) => setCustomHeroDescription(event.target.value)}
                      rows={3}
                    />
                  )}
                  {selectedHeroPreset !== 'custom' && (
                    <p className="text-[11px] text-indigo-600">
                      Pose + camera notes are baked into the prompt. You can still tweak any field above.
                    </p>
                  )}
                </div>
              )}
              {!personControlsDisabled && renderFormulationStoryPanel('ugc')}
              {!personControlsDisabled && (
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-indigo-600 mb-3">Prop bundles</p>
                  <div className="flex flex-wrap gap-2">
                    {PROP_BUNDLES.map(bundle => (
                      <button key={bundle.label} type="button" onClick={() => handlePropBundleSelect(bundle.settings)} className="rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-600 hover:border-indigo-600 hover:text-gray-900 transition">
                        {bundle.label}
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-gray-600 mt-2">Tap any bundle to pre-fill props, micro-location, and mood.</p>
                </div>
              )}
              <div className="rounded-2xl border border-gray-200 bg-gray-100 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-indigo-600 mb-2">Talent preview</p>
                <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                  <span className="rounded-full bg-gray-50 px-3 py-1">{options.gender}</span>
                  <span className="rounded-full bg-gray-50 px-3 py-1">{options.ageGroup}</span>
                  <span className="rounded-full bg-gray-50 px-3 py-1">{options.personMood}</span>
                  <span className="rounded-full bg-gray-50 px-3 py-1">{options.personPose}</span>
                  <span className="rounded-full bg-gray-50 px-3 py-1">{options.wardrobeStyle}</span>
                  <span className="rounded-full bg-gray-50 px-3 py-1">{options.skinTone}</span>
                  <span className="rounded-full bg-gray-50 px-3 py-1">{options.hairColor}</span>
                  <span className="rounded-full bg-gray-50 px-3 py-1">{options.eyeColor}</span>
                </div>
                <p className="text-[11px] text-gray-600 mt-2">
                  {options.personExpression} · {options.hairStyle} · {options.personProps}
                </p>
              </div>
            </div>
          </Accordion>
        </div>
      )}
    </>
  );

  const renderBundlesSection = () => (
    <div id={getSectionId('Bundles')} className="mt-6">
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 space-y-4">
        <div className="flex flex-col gap-1">
          <p className="text-xs uppercase tracking-[0.3em] text-indigo-600">Bundles</p>
          <p className="text-sm text-gray-600">Quickly swap between curated packs, your own mix, or AI-recommended combos.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {BUNDLE_TABS.map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveBundleTab(tab.id)}
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${activeBundleTab === tab.id ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-md shadow-indigo-500/20 scale-105 duration-500' : 'border-gray-200 bg-gray-100 text-gray-600 hover:border-indigo-600 hover:text-gray-900'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {activeBundleTab === 'premade' && (
          <BundleSelector
            onGenerate={generateMockup}
            productMediaLibrary={productMediaLibrary}
            visibleProductIds={activeProductIds}
            activeProductCount={activeProducts.length}
          />
        )}
        {activeBundleTab === 'custom' && (
          <CustomBundleBuilder
            onGenerate={generateMockup}
            productMediaLibrary={productMediaLibrary}
            visibleProductIds={activeProductIds}
          />
        )}
        {activeBundleTab === 'recommended' && (
          <div className="space-y-4">
            {availableProductIds.length === 0 ? (
              <p className="text-xs text-gray-500">Upload at least one product photo to view recommendations.</p>
            ) : (
              <>
                <div className="flex flex-col gap-2">
                  <label className="text-xs uppercase tracking-[0.3em] text-gray-600">Anchor product</label>
                  <select
                    value={recommendedBaseProduct}
                    onChange={event => setRecommendedBaseProduct(event.target.value as ProductId)}
                    className="rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-600 focus:outline-none"
                  >
                    {availableProductIds.map(productId => (
                      <option key={productId} value={productId}>
                        {productMediaLibrary[productId]?.label || PRODUCT_MEDIA_LIBRARY[productId]?.label || productId}
                      </option>
                    ))}
                  </select>
                </div>
                <RecommendedBundle
                  productId={recommendedBaseProduct}
                  onGenerate={generateMockup}
                  productMediaLibrary={productMediaLibrary}
                  visibleProductIds={activeProductIds}
                />
              </>
            )}
          </div>
        )}
        {lastBundleSelection && lastBundleSelection.some(id => availableProductIdSet.has(id)) && (
          <div className="rounded-2xl border border-gray-200 bg-gray-100 p-3 space-y-2">
            <p className="text-xs uppercase tracking-[0.3em] text-indigo-600">Last bundle sent</p>
            <div className="flex flex-wrap gap-2 text-xs">
              {lastBundleSelection
                .filter(productId => availableProductIdSet.has(productId))
                .map(productId => (
                  <span
                    key={`${productId}-last`}
                    className="rounded-full border border-gray-200 px-3 py-1 text-gray-900"
                  >
                    {productMediaLibrary[productId]?.label || PRODUCT_MEDIA_LIBRARY[productId]?.label || productId}
                  </span>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const handleSceneSelect = useCallback((sceneId: string) => {
    const scene = storyboardScenes.find(scene => scene.id === sceneId);
    if (!scene) return;
    setActiveSceneId(sceneId);
    applyOptionsUpdate(() => cloneOptions(scene.options));
    setIsProPhotographer(scene.proMode);
    setActiveSupplementPreset(scene.supplementPreset ?? 'none');
    setSupplementPresetCue(scene.supplementPromptCue ?? null);
    setSupplementBackgroundColor(scene.supplementBackgroundColor ?? '');
    setSupplementAccentColor(scene.supplementAccentColor ?? '');
    setSupplementFlavorNotes(scene.supplementFlavorNotes ?? '');
    setIncludeSupplementHand(scene.includeSupplementHand ?? false);
    setSupplementCustomPrompt(scene.supplementCustomPrompt ?? '');
    const sceneHeroPreset =
      scene.heroPosePreset && scene.heroPosePreset !== 'none' ? scene.heroPosePreset : 'custom';
    setSelectedHeroPreset(sceneHeroPreset);
    setHeroPosePromptCue(scene.heroPosePromptCue ?? null);
    setHeroProductAlignment(scene.heroProductAlignment ?? 'center');
    setHeroProductScale(scene.heroProductScale ?? 1);
    setHeroShadowStyle(scene.heroShadowStyle ?? 'softDrop');
    setUgcRealSettings(cloneUGCRealSettings(scene.ugcRealSettings));
    setFormulationExpertEnabled(scene.formulationExpertEnabled ?? false);
    setFormulationExpertPreset(scene.formulationExpertPreset ?? FORMULATION_EXPERT_PRESETS[0].value);
    setFormulationExpertName(scene.formulationExpertName ?? '');
    setFormulationExpertRole(scene.formulationExpertRole ?? FORMULATION_EXPERT_PRESETS[0].role);
    setFormulationLabStyle(scene.formulationLabStyle ?? FORMULATION_LAB_OPTIONS[0].value);
    setFormulationExpertProfession(scene.formulationExpertProfession ?? 'custom');
    setGeneratedCopy(null);
    setCopyError(null);
    setPersonIdentityPackage(clonePersonIdentityPackage(scene.personIdentityPackage));
    setModelReferenceNotes(scene.modelReferenceNotes ?? '');
  }, [applyOptionsUpdate, storyboardScenes]);

  const handleAddScene = useCallback(() => {
    if (storyboardScenes.length >= 4) return;
    let sceneOptions = syncCharacterFields(cloneOptions(options));
    if (isTalentLinkedAcrossScenes && linkedTalentProfile) {
      sceneOptions = applyPersonProfileToOptions(sceneOptions, linkedTalentProfile);
    }
    const newScene: StoryboardScene = {
      id: makeSceneId(),
      label: `Scene ${storyboardScenes.length + 1}`,
      options: sceneOptions,
      proMode: isProPhotographer,
      supplementPreset: activeSupplementPreset,
      supplementPromptCue: supplementPresetCue,
      supplementBackgroundColor,
      supplementAccentColor,
      supplementFlavorNotes,
      includeSupplementHand,
      heroPosePreset: selectedHeroPreset,
      heroPosePromptCue,
      supplementCustomPrompt,
      heroProductAlignment,
      heroProductScale,
      heroShadowStyle,
      ugcRealSettings: cloneUGCRealSettings(ugcRealSettings),
      formulationExpertEnabled,
      formulationExpertPreset,
      formulationExpertName,
      formulationExpertRole,
      formulationLabStyle,
      formulationExpertProfession,
      personIdentityPackage: clonePersonIdentityPackage(personIdentityPackage),
      modelReferenceNotes,
    };
    setStoryboardScenes(prev => [...prev, newScene]);
    setActiveSceneId(newScene.id);
    if (isTalentLinkedAcrossScenes && linkedTalentProfile) {
      syncTalentAcrossScenes(linkedTalentProfile, newScene.id);
    }
  }, [
    storyboardScenes.length,
    options,
    isProPhotographer,
    isTalentLinkedAcrossScenes,
    linkedTalentProfile,
    syncTalentAcrossScenes,
    activeSupplementPreset,
    supplementPresetCue,
    supplementBackgroundColor,
    supplementAccentColor,
    supplementFlavorNotes,
    includeSupplementHand,
    selectedHeroPreset,
    heroPosePromptCue,
    supplementCustomPrompt,
    heroProductAlignment,
    heroProductScale,
    heroShadowStyle,
  ]);

  const handleDuplicateScene = useCallback(() => {
    const scene = storyboardScenes.find(s => s.id === activeSceneId);
    if (!scene || storyboardScenes.length >= 4) return;
    let duplicatedOptions = syncCharacterFields(cloneOptions(scene.options));
    if (isTalentLinkedAcrossScenes && linkedTalentProfile) {
      duplicatedOptions = applyPersonProfileToOptions(duplicatedOptions, linkedTalentProfile);
    }
    const newScene: StoryboardScene = {
      id: makeSceneId(),
      label: `${scene.label} copy`,
      options: duplicatedOptions,
      proMode: scene.proMode,
      supplementPreset: scene.supplementPreset,
      supplementPromptCue: scene.supplementPromptCue,
      supplementBackgroundColor: scene.supplementBackgroundColor,
      supplementAccentColor: scene.supplementAccentColor,
      supplementFlavorNotes: scene.supplementFlavorNotes,
      includeSupplementHand: scene.includeSupplementHand,
      heroPosePreset: scene.heroPosePreset,
      heroPosePromptCue: scene.heroPosePromptCue,
      supplementCustomPrompt: scene.supplementCustomPrompt,
      heroProductAlignment: scene.heroProductAlignment ?? 'center',
      heroProductScale: scene.heroProductScale ?? 1,
      heroShadowStyle: scene.heroShadowStyle ?? 'softDrop',
      ugcRealSettings: cloneUGCRealSettings(scene.ugcRealSettings),
      formulationExpertEnabled: scene.formulationExpertEnabled,
      formulationExpertPreset: scene.formulationExpertPreset,
      formulationExpertName: scene.formulationExpertName,
      formulationExpertRole: scene.formulationExpertRole,
      formulationLabStyle: scene.formulationLabStyle,
      formulationExpertProfession: scene.formulationExpertProfession,
      personIdentityPackage: clonePersonIdentityPackage(scene.personIdentityPackage),
      modelReferenceNotes: scene.modelReferenceNotes,
    };
    setStoryboardScenes(prev => [...prev, newScene]);
    setActiveSceneId(newScene.id);
    if (isTalentLinkedAcrossScenes && linkedTalentProfile) {
      syncTalentAcrossScenes(linkedTalentProfile, newScene.id);
    }
  }, [
    storyboardScenes,
    activeSceneId,
    isTalentLinkedAcrossScenes,
    linkedTalentProfile,
    syncTalentAcrossScenes,
  ]);

  const handleDeleteScene = useCallback((sceneId: string) => {
    if (storyboardScenes.length <= 1) return;
    const filtered = storyboardScenes.filter(scene => scene.id !== sceneId);
    let nextActiveId = activeSceneId;
    if (sceneId === activeSceneId) {
      nextActiveId = filtered[0]?.id ?? activeSceneId;
      const nextScene = filtered[0];
      if (nextScene) {
        applyOptionsUpdate(() => cloneOptions(nextScene.options));
        setIsProPhotographer(nextScene.proMode);
        setActiveSupplementPreset(nextScene.supplementPreset ?? 'none');
        setSupplementPresetCue(nextScene.supplementPromptCue ?? null);
      }
    }
    setStoryboardScenes(filtered);
    setActiveSceneId(nextActiveId);
  }, [storyboardScenes, activeSceneId]);

  const getTalentProfileFromOptions = useCallback((sourceOptions: MockupOptions = options) => {
    const profile: Partial<MockupOptions> = {};
    PERSON_FIELD_KEYS.forEach((key) => {
      profile[key] = sourceOptions[key];
    });
    return profile;
  }, [options]);

  const applyTalentProfile = useCallback((profile?: Partial<MockupOptions> | null) => {
    if (!profile) return;
    const primarySceneId = storyboardScenes[0]?.id;
    const isPrimarySceneActive = primarySceneId ? activeSceneId === primarySceneId : true;
    const shouldLockIdentity = isTalentLinkedAcrossScenes && !isPrimarySceneActive;
    const filteredProfile = shouldLockIdentity
      ? (() => {
        const sanitized = { ...profile };
        IDENTITY_LOCKED_CATEGORIES.forEach(key => {
          if (key in sanitized) {
            delete (sanitized as Partial<MockupOptions>)[key];
          }
        });
        return sanitized;
      })()
      : profile;
    applyOptionsUpdate(prev => ({ ...prev, ...filteredProfile }));
    setSelectedCategories(prev => {
      const next = new Set(prev);
      PERSON_FIELD_KEYS.forEach(key => {
        if (filteredProfile[key] !== undefined) {
          next.add(key);
        }
      });
      return next;
    });
  }, [applyOptionsUpdate, setSelectedCategories, isTalentLinkedAcrossScenes, activeSceneId, storyboardScenes]);

  const handlePresetSelect = useCallback((value: string) => {
    setActiveTalentPreset(value);
    applyOptionsUpdate(prev => ({ ...prev, creatorPreset: value }));
    if (value === 'custom') {
      return;
    }
    const preset = CREATOR_PRESET_LOOKUP[value];
    if (!preset) return;
    applyTalentProfile(preset.settings);
  }, [applyOptionsUpdate, applyTalentProfile]);

  const handleSaveTalentProfile = useCallback(() => {
    if (isProductPlacement || options.ageGroup === 'no person') return;
    const profile = getTalentProfileFromOptions();
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(TALENT_PROFILE_STORAGE_KEY, JSON.stringify(profile));
    }
    setSavedTalentProfile(profile);
    setTalentToast('saved');
  }, [getTalentProfileFromOptions, isProductPlacement, options.ageGroup]);

  const handleApplySavedTalent = useCallback(() => {
    if (!savedTalentProfile) return;
    applyTalentProfile(savedTalentProfile);
    setActiveTalentPreset('custom');
    setTalentToast('applied');
  }, [applyTalentProfile, savedTalentProfile]);

  const handlePropBundleSelect = useCallback((bundleValue: PropBundle['settings']) => {
    applyOptionsUpdate(prev => ({ ...prev, ...bundleValue }));
    setSelectedCategories(prev => {
      const next = new Set(prev);
      Object.keys(bundleValue).forEach(key => next.add(key as OptionCategory));
      return next;
    });
    setActiveTalentPreset('custom');
  }, [applyOptionsUpdate]);

  const renderFormulationStoryPanel = (context: 'product' | 'ugc') => (
    <div className="rounded-2xl border border-gray-200 bg-gray-100 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-indigo-600">Formulation story</p>
          <p className="text-xs text-gray-600">
            {context === 'product'
              ? 'Highlight the doctor or researcher behind the formula to build trust.'
              : 'Let your UGC creator double as the doctor/scientist formulating the blend.'}
          </p>
        </div>
        <label className="flex items-center gap-2 text-xs text-gray-600">
          <span>{formulationExpertEnabled ? 'Active' : 'Off'}</span>
          <button
            type="button"
            onClick={() => setFormulationExpertEnabled(prev => !prev)}
            className={`relative h-5 w-10 rounded-full transition ${formulationExpertEnabled ? 'bg-indigo-600 text-white' : 'bg-gray-50'}`}
          >
            <span className={`absolute left-1 top-1 block h-3 w-3 rounded-full bg-white border border-gray-200 transition ${formulationExpertEnabled ? 'translate-x-5' : ''}`} />
          </button>
        </label>
      </div>
      {formulationExpertEnabled && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {FORMULATION_EXPERT_PRESETS.map(preset => (
              <button
                key={preset.value}
                type="button"
                onClick={() => handleFormulationPresetSelect(preset.value)}
                className={`rounded-full border px-3 py-1 text-xs transition ${formulationExpertPreset === preset.value
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-md shadow-indigo-500/20 scale-105 duration-500'
                  : 'border-gray-200 bg-gray-100 text-gray-600 hover:border-indigo-600 hover:text-gray-900'
                  }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {FORMULATION_PROFESSIONS.map(option => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleFormulationProfessionSelect(option.value)}
                className={`rounded-full border px-3 py-1 text-xs transition ${formulationExpertProfession === option.value
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-md shadow-indigo-500/20 scale-105 duration-500'
                  : 'border-gray-200 bg-gray-100 text-gray-600 hover:border-indigo-600 hover:text-gray-900'
                  }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label className="text-xs uppercase tracking-widest text-gray-500">Expert name</label>
              <input
                type="text"
                value={formulationExpertName}
                onChange={event => setFormulationExpertName(event.target.value)}
                placeholder="e.g., Dr. Sofia Reyes"
                className="rounded-2xl border border-gray-200 bg-white px-2 py-1 text-sm text-gray-900 focus:border-indigo-600 focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs uppercase tracking-widest text-gray-500">Role / credentials</label>
              <input
                type="text"
                value={formulationExpertRole}
                onChange={event => setFormulationExpertRole(event.target.value)}
                placeholder="e.g., pulmonologist & lead formulator"
                className="rounded-2xl border border-gray-200 bg-white px-2 py-1 text-sm text-gray-900 focus:border-indigo-600 focus:outline-none"
              />
            </div>
          </div>
          <ChipSelectGroup
            label="Lab vibe"
            options={FORMULATION_LAB_OPTIONS}
            selectedValue={formulationLabStyle}
            onChange={value => setFormulationLabStyle(value)}
          />
          <p className="text-[11px] text-gray-600">We’ll mention their research, lab setup, and why the formula feels trustworthy. Ensure this expert looks like a real human, photographed with natural imperfections.</p>
        </div>
      )}
    </div>
  );

  const handleUGCRealModeToggle = useCallback(
    (value: boolean) => {
      persistUgcRealSettings(prev => ({ ...prev, isEnabled: value }));
      // When UGC is activated, clear environment to allow random selection
      // When UGC is deactivated, restore default environment (Kitchen)
      if (value) {
        setOptions(prev => ({ ...prev, setting: '' })); // Random / Auto for UGC
      } else {
        setOptions(prev => ({ ...prev, setting: SETTING_OPTIONS[2].value })); // Kitchen for Lifestyle
      }
    },
    [persistUgcRealSettings]
  );

  const handleClothingPresetToggle = useCallback(
    (id: string) => {
      persistUgcRealSettings(prev => {
        const exists = prev.selectedClothingPresetIds.includes(id);
        const nextPresets = exists
          ? prev.selectedClothingPresetIds.filter(item => item !== id)
          : [...prev.selectedClothingPresetIds, id];
        return { ...prev, selectedClothingPresetIds: nextPresets };
      });
    },
    [persistUgcRealSettings]
  );

  const handleCustomClothesUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      const previewUrl = URL.createObjectURL(file);
      persistUgcRealSettings(prev => {
        if (prev.clothingPreview && prev.clothingPreview !== previewUrl) {
          URL.revokeObjectURL(prev.clothingPreview);
        }
        return { ...prev, clothingUpload: file, clothingPreview: previewUrl };
      });
    },
    [persistUgcRealSettings]
  );

  const handleClearCustomClothes = useCallback(() => {
    persistUgcRealSettings(prev => {
      if (prev.clothingPreview) {
        URL.revokeObjectURL(prev.clothingPreview);
      }
      return { ...prev, clothingUpload: null, clothingPreview: null };
    });
  }, [persistUgcRealSettings]);

  const handleUGCExpressionSelect = useCallback(
    (id: string | null) => {
      persistUgcRealSettings(prev => ({ ...prev, selectedExpressionId: id }));
      applyOptionsUpdate(prev => ({ ...prev, expression: id ?? '' }));
    },
    [applyOptionsUpdate, persistUgcRealSettings]
  );

  const handleFormulationPresetSelect = useCallback(
    (value: string) => {
      setFormulationExpertPreset(value);
      const preset = FORMULATION_PRESET_LOOKUP[value];
      if (preset) {
        setFormulationExpertRole(preset.role);
        if (!formulationExpertName.trim()) {
          setFormulationExpertName(preset.suggestedName ?? '');
        }
      }
    },
    [formulationExpertName]
  );

  const handleFormulationProfessionSelect = useCallback(
    (value: string) => {
      setFormulationExpertProfession(value);
      if (value === 'custom') return;
      const profession = FORMULATION_PROFESSION_LOOKUP[value];
      if (profession) {
        setFormulationExpertRole(profession.label);
      }
    },
    []
  );

  const handleBlurChange = useCallback(
    (value: number) => {
      persistUgcRealSettings(prev => ({ ...prev, blurAmount: Math.max(0, Math.min(100, value)) }));
    },
    [persistUgcRealSettings]
  );

  const handleGrainChange = useCallback(
    (value: number) => {
      persistUgcRealSettings(prev => ({ ...prev, grainAmount: Math.max(0, Math.min(100, value)) }));
    },
    [persistUgcRealSettings]
  );

  const handleLowResolutionToggle = useCallback(
    (value: boolean) => {
      persistUgcRealSettings(prev => ({ ...prev, lowResolution: value }));
    },
    [persistUgcRealSettings]
  );

  const handleImperfectLightingToggle = useCallback(
    (value: boolean) => {
      persistUgcRealSettings(prev => ({ ...prev, imperfectLighting: value }));
    },
    [persistUgcRealSettings]
  );

  const handleOffFocusToggle = useCallback(
    (value: boolean) => {
      persistUgcRealSettings(prev => ({ ...prev, offFocus: value }));
    },
    [persistUgcRealSettings]
  );

  const handleTiltedPhoneToggle = useCallback(
    (value: boolean) => {
      persistUgcRealSettings(prev => ({ ...prev, tiltedPhone: value }));
    },
    [persistUgcRealSettings]
  );

  const handleOffCenterSelect = useCallback(
    (id: string) => {
      persistUgcRealSettings(prev => ({ ...prev, offCenterId: id }));
    },
    [persistUgcRealSettings]
  );

  const handleFramingSelect = useCallback(
    (id: string) => {
      persistUgcRealSettings(prev => ({ ...prev, framingId: id }));
    },
    [persistUgcRealSettings]
  );

  const runHiResPipeline = useCallback(async (sourceUrl: string) => {
    if (typeof window === 'undefined') return;
    setIsPreparingHiRes(true);
    setHiResError(null);
    setFourKVariant(null);
    setTwoKVariant(null);
    try {
      const twoK = await scaleImageToLongEdge(sourceUrl, 2048);
      setTwoKVariant(twoK);
      const fourK = await scaleImageToLongEdge(sourceUrl, 3840);
      setFourKVariant(fourK);
    } catch (error) {
      console.error('Local upscale failed.', error);
      setHiResError(HIGH_RES_UNAVAILABLE_MESSAGE);
    } finally {
      setIsPreparingHiRes(false);
    }
  }, []);

  const handleDownloadCreditCharge = useCallback(
    (resolution: DownloadResolution): { ok: boolean; message?: string } => {
      if (isTrialBypassActive || isAnonymousTrialMode) {
        return { ok: true };
      }
      const cost =
        resolution === '4k'
          ? DOWNLOAD_CREDIT_CONFIG.downloadCost4K
          : resolution === '2k'
            ? DOWNLOAD_CREDIT_CONFIG.downloadCost2K
            : DOWNLOAD_CREDIT_CONFIG.original;
      if (cost > remainingCredits) {
        return {
          ok: false,
          message: 'Not enough credits available for this download. Upgrade your plan to unlock more credits.',
        };
      }
      setCreditUsage(prev => {
        const next = prev + cost;
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(IMAGE_COUNT_KEY, String(next));
        }
        return next;
      });
      return { ok: true };
    },
    [isTrialBypassActive, isAnonymousTrialMode, remainingCredits]
  );

  const handleHeroPosePresetSelect = useCallback((value: string) => {
    if (value === 'none') {
      setSelectedHeroPreset('custom');
      setHeroPosePromptCue(null);
      return;
    }
    setSelectedHeroPreset(value);
    setActiveTalentPreset('custom');
    if (value === 'custom') {
      setHeroPosePromptCue(null);
      return;
    }
    const preset = HERO_PERSON_PRESET_LOOKUP[value];
    if (!preset) {
      setHeroPosePromptCue(null);
      return;
    }
    setHeroPosePromptCue(preset.promptCue);
    applyOptionsUpdate(prev => ({ ...prev, ...preset.settings }));
    setSelectedCategories(prev => {
      const next = new Set(prev);
      Object.keys(preset.settings).forEach(key => next.add(key as OptionCategory));
      return next;
    });
  }, [applyOptionsUpdate]);
  const handleTalentLinkToggle = useCallback(() => {
    if (isTalentLinkedAcrossScenes) {
      setIsTalentLinkedAcrossScenes(false);
      setLinkedTalentProfile(null);
      setPersonIdentityPackage(prev => ({
        ...prev,
        identityLock: false,
      }));
      return;
    }
    if (isProductPlacement || options.ageGroup === 'no person') {
      return;
    }
    const sourceSceneId = storyboardScenes[0]?.id ?? activeSceneId;
    const sourceScene = storyboardScenes.find(scene => scene.id === sourceSceneId);
    const baseIdentity = sourceScene?.personIdentityPackage ?? personIdentityPackage;
    const sharedPackage = clonePersonIdentityPackage(baseIdentity);
    sharedPackage.identityLock = true;
    setIdentitySourceSceneId(sourceSceneId);
    setPersonIdentityPackage(sharedPackage);
    syncIdentityPackageAcrossScenes(sharedPackage);
    const profile = identityPackageToProfile(sharedPackage);
    setLinkedTalentProfile(profile);
    syncTalentAcrossScenes(profile, sourceSceneId);
    if (Object.keys(profile).length) {
      applyOptionsUpdate(prev => applyPersonProfileToOptions(prev, profile));
    }
    setIsTalentLinkedAcrossScenes(true);
  }, [
    isTalentLinkedAcrossScenes,
    isProductPlacement,
    options.ageGroup,
    storyboardScenes,
    activeSceneId,
    personIdentityPackage,
    syncIdentityPackageAcrossScenes,
    syncTalentAcrossScenes,
    applyOptionsUpdate,
  ]);

  const handleRandomCharacterToggle = useCallback(() => {
    setIsRandomCharacterEnabled(prev => !prev);
  }, []);

  const randomizeCharacterParameters = useCallback(() => {
    if (!isRandomCharacterEnabled) return;
    
    // Random selection helpers
    const pickRandom = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
    
    // Helper: Check if user specified this field (not default/empty/non-specific)
    const isUserSpecified = (value: string | undefined, nonSpecificValues: string[] = ['', 'Non-specific', 'Prefer not to specify']): boolean => {
      return Boolean(value && !nonSpecificValues.includes(value));
    };
    
    // Build random character parameters - ONLY randomize fields user did NOT specify
    const randomUpdates: Partial<MockupOptions> = {};
    
    // Age: Only randomize if user did not select specific age
    if (!isUserSpecified(options.ageGroup, ['', 'no person'])) {
      randomUpdates.ageGroup = pickRandom(AGE_GROUP_OPTIONS.filter(opt => opt.value !== 'no person')).value;
    }
    
    // Gender: Only randomize if user did not select specific gender
    if (!isUserSpecified(options.gender, ['', 'Non-specific', 'Prefer not to specify'])) {
      randomUpdates.gender = pickRandom(GENDER_OPTIONS).value;
    }
    
    // Ethnicity: Only randomize if user did not select specific ethnicity
    if (!isUserSpecified(options.ethnicity, ['', 'Non-specific', 'Prefer not to specify'])) {
      randomUpdates.ethnicity = pickRandom(ETHNICITY_OPTIONS).value;
    }
    
    // Hair Style: Only randomize if user did not select specific style
    if (!isUserSpecified(options.hairStyle, [''])) {
      randomUpdates.hairStyle = pickRandom(HAIR_STYLE_OPTIONS).value;
    }
    
    // Hair Color: Only randomize if user did not select specific color
    if (!isUserSpecified(options.hairColor, [''])) {
      randomUpdates.hairColor = pickRandom(HAIR_COLOR_OPTIONS).value;
    }
    
    // Skin Tone: Only randomize if user did not select specific tone
    if (!isUserSpecified(options.skinTone, ['', 'Non-specific'])) {
      randomUpdates.skinTone = pickRandom(SKIN_TONE_OPTIONS).value;
    }
    
    // Eye Color: Only randomize if user did not select specific color
    if (!isUserSpecified(options.eyeColor, [''])) {
      randomUpdates.eyeColor = pickRandom(EYE_COLOR_OPTIONS).value;
    }
    
    // Person Appearance: Only randomize if user did not select specific appearance
    if (!isUserSpecified(options.personAppearance, [''])) {
      randomUpdates.personAppearance = pickRandom(PERSON_APPEARANCE_OPTIONS).value;
    }
    
    // Person Mood: Only randomize if user did not select specific mood
    if (!isUserSpecified(options.personMood, [''])) {
      randomUpdates.personMood = pickRandom(PERSON_MOOD_OPTIONS).value;
    }
    
    // Wardrobe Style: Only randomize if user did not select specific wardrobe
    if (!isUserSpecified(options.wardrobeStyle, [''])) {
      randomUpdates.wardrobeStyle = pickRandom(WARDROBE_STYLE_OPTIONS).value;
    }
    
    // Apply randomized parameters ONLY for fields that were not user-specified
    if (Object.keys(randomUpdates).length > 0) {
      applyOptionsUpdate(prev => ({ ...prev, ...randomUpdates }));
    }
    
    // Force new identity variation token to ensure different face
    setPersonIdentityPackage(prev => ({
      ...prev,
      identityLock: false,
      identityVariationToken: undefined, // This will trigger a new random face
    }));
  }, [isRandomCharacterEnabled, applyOptionsUpdate, options]);

  useEffect(() => {
    if (!isTalentLinkedAcrossScenes) return;
    if (isProductPlacement || options.ageGroup === 'no person') return;
    const currentProfile = getTalentProfileFromOptions();
    const hasChanges = PERSON_FIELD_KEYS.some(
      key => currentProfile[key] !== linkedTalentProfile?.[key]
    );
    if (!hasChanges) return;
    setLinkedTalentProfile(currentProfile);
    syncTalentAcrossScenes(currentProfile, activeSceneId);
  }, [
    isTalentLinkedAcrossScenes,
    isProductPlacement,
    options.ageGroup,
    getTalentProfileFromOptions,
    linkedTalentProfile,
    syncTalentAcrossScenes,
    activeSceneId,
  ]);

  const handleSupplementPresetSelect = useCallback((value: string) => {
    if (value === 'none') {
      setActiveSupplementPreset('none');
      setSupplementPresetCue(null);
      setStoryboardScenes(prev =>
        prev.map(scene =>
          scene.id === activeSceneId ? { ...scene, supplementPreset: 'none', supplementPromptCue: null } : scene
        )
      );
      return;
    }
    const preset = SUPPLEMENT_PHOTO_PRESETS.find(option => option.value === value);
    if (!preset) return;
    applyOptionsUpdate(prev => ({ ...prev, ...preset.settings }));
    setSelectedCategories(prev => {
      const next = new Set(prev);
      Object.keys(preset.settings).forEach(key => next.add(key as OptionCategory));
      return next;
    });
    setActiveSupplementPreset(value);
    if (value === HERO_LANDING_PRESET_VALUE) {
      const defaults = preset.heroLandingConfig;
      setSupplementBackgroundColor(defaults?.backgroundColor ?? '#FFFFFF');
      setSupplementAccentColor(defaults?.accentColor ?? '');
      setHeroProductAlignment(defaults?.productAlignment ?? 'center');
      setHeroProductScale(defaults?.productScale ?? 1);
      setHeroShadowStyle(defaults?.shadowStyle ?? 'softDrop');
    }
    setSupplementPresetCue(preset.promptCue);
    setStoryboardScenes(prev =>
      prev.map(scene =>
        scene.id === activeSceneId
          ? { ...scene, supplementPreset: value, supplementPromptCue: preset.promptCue }
          : scene
      )
    );
  }, [activeSceneId, applyOptionsUpdate, setSelectedCategories]);

  const handlePlanTierSelect = useCallback(
    (tier: PlanTier) => {
      if (tier === 'free') {
        setPlanTier(tier);
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(PLAN_STORAGE_KEY, tier);
          window.localStorage.setItem(SIMPLE_MODE_KEY, 'true');
        }
        if (!PLAN_CONFIG[tier].allowStudio && !isSimpleMode) {
          setIsSimpleMode(true);
        }
        setPlanNotice(null);
        setPlanCodeInput('');
        setPlanCodeError(null);
        setShowPlanModal(false);
        return;
      }
      const targetUrl = PLAN_CONFIG[tier].stripeUrl;
      if (!targetUrl) return;
      try {
        const url = new URL(targetUrl);
        if (userEmail) {
          url.searchParams.set('prefilled_email', userEmail);
        } else {
          setPlanNotice(
            'You can check out now. To sync credits to your account, sign in with a magic link or Google first.'
          );
        }
        window.open(url.toString(), '_blank', 'noopener,noreferrer');
      } catch (err) {
        console.error(err);
        setPlanNotice('Could not open checkout. Please try again.');
      }
    },
    [isSimpleMode, userEmail]
  );

  const handlePlanCodeSubmit = useCallback(async () => {
    const trimmed = planCodeInput.trim();
    const normalized = trimmed.toUpperCase();
    if (!trimmed) {
      setPlanCodeError('Enter the access code provided after checkout.');
      return;
    }
    try {
      const res = await fetch('/api/credits?action=redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: trimmed }),
      });
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        if (typeof data?.remaining_credits === 'number') {
          setRemoteCredits(data.remaining_credits);
        }
        setPlanCodeInput('');
        setPlanCodeError(null);
        const bonus = typeof data?.bonus_credits === 'number' && data.bonus_credits > 0
          ? Math.floor(data.bonus_credits)
          : 10;
        setPlanNotice(`Access code applied: +${bonus} credits.`);
        setShowPlanModal(false);
        return;
      }
    } catch (err) {
      console.warn('Plan code redeem failed', err);
    }
    if (normalized === TRIAL_BYPASS_CODE || normalized === TESTER_UPGRADE_CODE.toUpperCase()) {
      setHasTrialBypass(true);
      setRemoteCredits(99999);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(TRIAL_BYPASS_KEY, 'code');
      }
      setPlanCodeInput('');
      setPlanCodeError(null);
      setPlanNotice('Access code applied: +99999 credits enabled.');
      setShowPlanModal(false);
      return;
    }
    const tier = PLAN_UNLOCK_CODES[normalized];
    if (!tier) {
      setPlanCodeError('Invalid code. Please double-check your email receipt.');
      return;
    }
    handlePlanTierSelect(tier);
    setPlanCodeInput('');
    setPlanCodeError(null);
  }, [planCodeInput, handlePlanTierSelect, setRemoteCredits]);

  const handleProPhotographerToggle = useCallback(() => {
    setIsProPhotographer(prev => !prev);
    if (isProPhotographer) {
      setActiveProPreset('custom');
    }
  }, [isProPhotographer]);

  const applyProPreset = useCallback((presetSettings: ProLookPreset['settings']) => {
    applyOptionsUpdate(prev => ({ ...prev, ...presetSettings }));
    setSelectedCategories(prev => {
      const next = new Set(prev);
      Object.keys(presetSettings).forEach(key => next.add(key as OptionCategory));
      return next;
    });
  }, [applyOptionsUpdate]);

  const handleProPresetSelect = useCallback((value: string) => {
    setActiveProPreset(value);
    if (value === 'custom') return;
    const preset = PRO_LOOK_PRESETS.find(item => item.value === value);
    if (preset) {
      applyProPreset(preset.settings);
    }
  }, [applyProPreset]);

  // Handler for LifestyleStep3 component 
  const handleLifestyleStep3Change = useCallback((values: Step3Values) => {
    // PHASE 3: MANDATORY LOG - Prove App receives sceneState
    console.log('[APP RECEIVED SCENESTATE]', values);
    console.log('[APP RECEIVED SCENESTATE FIELDS]', {
      sceneType: values.sceneType,
      creationMode: values.creationMode,
      contentStyle: values.contentStyle,
      personIncluded: values.personIncluded,
      sceneIntent: values.sceneIntent,
    });

    // Store values for PromptEngine - mapper handles all conversions
    setLifestyleStep3Values(values);
  }, []);


  const handleGenerateCopy = useCallback(async () => {
    setCopyError(null);
    setIsCopyLoading(true);
    setCopyError('Caption generation is disabled.');
    setIsCopyLoading(false);
  }, []);

  const handleGoalWizardSelect = useCallback((field: 'goal' | 'vibe' | 'preset', value: string) => {
    setGoalWizardData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleGoalWizardNext = useCallback(() => {
    setGoalWizardStep(step => Math.min(step + 1, 3));
  }, []);

  const handleGoalWizardBack = useCallback(() => {
    setGoalWizardStep(step => Math.max(step - 1, 1));
  }, []);

  const handleGoalWizardSkip = useCallback(() => {
    setShowGoalWizard(false);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(GOAL_WIZARD_KEY, 'true');
    }
  }, []);

  const handleGoalWizardComplete = useCallback(() => {
    const vibe = GOAL_VIBE_OPTIONS.find(option => option.value === goalWizardData.vibe) ?? GOAL_VIBE_OPTIONS[0];
    const preset = CREATOR_PRESET_LOOKUP[goalWizardData.preset];
    applyOptionsUpdate(prev => ({
      ...prev,
      contentStyle: goalWizardData.goal === 'product' ? 'product' : 'ugc',
      setting: vibe.setting,
      lighting: vibe.lighting,
      environmentOrder: vibe.environmentOrder,
    }));
    if (goalWizardData.goal !== 'product' && preset) {
      setActiveTalentPreset(goalWizardData.preset);
      applyOptionsUpdate(prev => ({ ...prev, creatorPreset: goalWizardData.preset }));
      applyTalentProfile(preset.settings);
    } else {
      setActiveTalentPreset('custom');
      applyOptionsUpdate(prev => ({
        ...prev,
        ageGroup: AGE_GROUP_OPTIONS[0].value,
        gender: GENDER_OPTIONS[0].value,
      }));
    }
    handleGoalWizardSkip();
  }, [applyOptionsUpdate, applyTalentProfile, goalWizardData, handleGoalWizardSkip]);

  const handleTrialCodeChange = useCallback((value: string) => {
    setTrialCodeInput(value);
    if (trialCodeError) {
      setTrialCodeError(null);
    }
  }, [trialCodeError]);

  const handleTrialCodeSubmit = useCallback(() => {
    setTrialCodeError('Request access from an admin to continue.');
  }, []);

  const skipOnboarding = useCallback(() => {
    setShowOnboarding(false);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(ONBOARDING_DISMISSED_KEY, 'true');
    }
  }, []);

  const advanceOnboardingFromStep = useCallback((step: number) => {
    if (!showOnboarding || onboardingStep !== step) return;
    if (step >= 3) {
      skipOnboarding();
    } else {
      setOnboardingStep(step + 1);
    }
  }, [showOnboarding, onboardingStep, skipOnboarding]);
  const handleOnboardingNext = useCallback(() => {
    advanceOnboardingFromStep(onboardingStep);
  }, [advanceOnboardingFromStep, onboardingStep]);

  const handleReplayOnboarding = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(ONBOARDING_DISMISSED_KEY);
    }
    setOnboardingStep(1);
    setShowOnboarding(true);
  }, []);

  useEffect(() => {
    if (isTrialLocked && trialInputRef.current) {
      trialInputRef.current.focus();
    }
  }, [isTrialLocked]);

  useEffect(() => {
    if (!isTrialLocked) return;
    const input = trialInputRef.current;
    if (!input) return;
    const position = trialCodeInput.length;
    requestAnimationFrame(() => {
      input.setSelectionRange(position, position);
    });
  }, [trialCodeInput, isTrialLocked]);

  const handleVideoAccessCodeChange = useCallback((value: string) => {
    setVideoAccessInput(value);
    if (videoAccessError) {
      setVideoAccessError(null);
    }
  }, [videoAccessError]);

  const handleVideoAccessSubmit = useCallback(() => {
    if (!VIDEO_SECRET_CODE) {
      setVideoAccessError('Video access codes are disabled. Contact the team to unlock this feature.');
      return;
    }
    if (videoAccessInput.trim() === VIDEO_SECRET_CODE) {
      setHasVideoAccess(true);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(VIDEO_ACCESS_KEY, 'granted');
      }
      setVideoAccessError(null);
    } else {
      setVideoAccessError('Invalid access code.');
    }
  }, [videoAccessInput]);

  const applyMoodInspiration = useCallback((palette: string[]) => {
    if (!palette.length) {
      setMoodSummary('Could not detect enough color data from the reference.');
      return;
    }
    const suggestion = deriveMoodSuggestions(palette);
    applyOptionsUpdate(prev => {
      const updated = { ...prev };
      updated.lighting = getOptionValueByLabel(LIGHTING_OPTIONS, suggestion.lightingLabel);
      updated.setting = getOptionValueByLabel(SETTING_OPTIONS, suggestion.settingLabel);
      if (prev.contentStyle === 'product') {
        updated.placementStyle = getOptionValueByLabel(PLACEMENT_STYLE_OPTIONS, suggestion.placementStyleLabel);
        updated.placementCamera = getOptionValueByLabel(PLACEMENT_CAMERA_OPTIONS, suggestion.placementCameraLabel);
      }
      updated.mood = suggestion.moodLabel;
      return updated;
    });
    setSelectedCategories(prev => {
      const next = new Set(prev);
      next.add('lighting');
      next.add('setting');
      if (options.contentStyle === 'product') {
        next.add('placementStyle');
        next.add('placementCamera');
      }
      return next;
    });
    setMoodSummary(`Mood hint: ${suggestion.moodLabel}. Tuned lighting to ${suggestion.lightingLabel} and scene to ${suggestion.settingLabel}.`);
    setMoodPromptCue(`Match the atmosphere of a ${suggestion.moodLabel} palette with ${suggestion.lightingLabel} lighting and details reminiscent of ${suggestion.settingLabel}.`);
  }, [applyOptionsUpdate, options.contentStyle]);

  const handleMoodImageUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setMoodSummary('Please upload an image file.');
      setMoodPromptCue(null);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setMoodSummary('Please keep inspiration images under 5MB.');
      setMoodPromptCue(null);
      return;
    }
    setIsMoodProcessing(true);
    setMoodSummary(null);
    setMoodPromptCue(null);
    setMoodPalette([]);
    setMoodImagePreview(prev => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    try {
      const palette = await extractPaletteFromImage(file);
      setMoodPalette(palette);
      applyMoodInspiration(palette);
    } catch (err) {
      console.error(err);
      setMoodSummary('We could not analyze that reference. Try another image.');
      setMoodPromptCue(null);
    } finally {
      setIsMoodProcessing(false);
    }
  }, [applyMoodInspiration]);

  const handleClearMood = useCallback(() => {
    setMoodImagePreview(prev => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setMoodPalette([]);
    setMoodSummary(null);
    setMoodPromptCue(null);
  }, []);

  const handleModelReferenceUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setImageError('Model reference must be an image file.');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setImageError('Please keep the model reference under 8MB.');
      return;
    }
    setModelReferenceFile(file);
    setModelReferencePreview(prev => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    try {
      const { base64, mimeType } = await fileToBase64(file);
      setPersonIdentityPackage(prev => ({
        ...prev,
        modelReferenceBase64: base64,
        modelReferenceMime: mimeType,
        identityLock: true,
      }));
    } catch (error) {
      console.error('Unable to encode model reference', error);
    }
  }, []);

  const handleClearModelReference = useCallback(() => {
    setModelReferenceFile(null);
    setModelReferenceNotes('');
    setModelReferencePreview(prev => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setPersonIdentityPackage(prev => ({
      ...prev,
      modelReferenceBase64: undefined,
      modelReferenceMime: undefined,
      identityLock: false,
    }));
  }, []);


  const handleToggleAccordion = (title: string) => {
    setOpenAccordion(current => (current === title ? null : title));
  };

  const handleOptionChange = (category: OptionCategory, value: string, accordionTitle: string) => {
    const newOptions = { ...options, [category]: value };
    const primarySceneId = storyboardScenes[0]?.id;
    const isPrimarySceneActive = primarySceneId ? activeSceneId === primarySceneId : true;
    if (isTalentLinkedAcrossScenes && !isPrimarySceneActive && IDENTITY_LOCKED_CATEGORIES.has(category)) {
      return;
    }
    const updatedSelectedCategories = new Set(selectedCategories).add(category);

    if (category === 'contentStyle') {
      if (value === 'product') {
        newOptions.ageGroup = 'no person';
        updatedSelectedCategories.add('ageGroup');
        newOptions.placementStyle = PLACEMENT_STYLE_OPTIONS[0].value;
        newOptions.placementCamera = PLACEMENT_CAMERA_OPTIONS[0].value;
        updatedSelectedCategories.add('placementStyle');
        updatedSelectedCategories.add('placementCamera');
        newOptions.personPose = PERSON_POSE_OPTIONS[0].value;
        newOptions.wardrobeStyle = WARDROBE_STYLE_OPTIONS[0].value;
        newOptions.personMood = PERSON_MOOD_OPTIONS[0].value;
        newOptions.personProps = PERSON_PROP_OPTIONS[0].value;
        newOptions.microLocation = MICRO_LOCATION_OPTIONS[0].value;
        newOptions.personExpression = PERSON_EXPRESSION_OPTIONS[0].value;
        newOptions.hairStyle = HAIR_STYLE_OPTIONS[0].value;
        setActiveTalentPreset('custom');
      }
      if (value !== 'product') {
        setIsProPhotographer(false);
        setActiveProPreset('custom');
        if (newOptions.ageGroup === 'no person') {
          newOptions.ageGroup = DEFAULT_AGE_GROUP;
          updatedSelectedCategories.add('ageGroup');
        }
      }
    }
    if (category === 'personAppearance') {
      const lowerValue = value.toLowerCase();
      const messyTriggers = ['messy', 'running late'];
      if (messyTriggers.some(trigger => lowerValue.includes(trigger))) {
        const chaoticValues = [
          'casually messy, spontaneous and authentic',
          'creative chaos with open notebooks, coffee cups, and props scattered everywhere',
          'post-launch hustle with packaging, shipping boxes, and marker scribbles left around',
        ];
        const randomEnv = chaoticValues[Math.floor(Math.random() * chaoticValues.length)];
        newOptions.environmentOrder = randomEnv;
        updatedSelectedCategories.add('environmentOrder');
      }
    }
    if (category === 'personAppearance') {
      newOptions.appearanceLevel = value;
    }
    if (category === 'personMood') {
      newOptions.mood = value;
    }
    if (category === 'personPose') {
      newOptions.pose = value;
    }
    if (category === 'wardrobeStyle') {
      newOptions.wardrobe = value;
    }
    if (category === 'productInteraction') {
      newOptions.interaction2 = value;
    }
    if (category === 'personProps') {
      newOptions.props = value;
      const isCustomProp = !PERSON_PROP_OPTIONS.some(option => option.value === value);
      newOptions.customProp = isCustomProp ? value : '';
    }
    if (category === 'microLocation') {
      newOptions.customMicroLocation = MICRO_LOCATION_OPTIONS.some(option => option.value === value) ? '' : value;
    }
    if (category === 'personExpression') {
      newOptions.expression = value;
    }
    if (category === 'hairStyle') {
      newOptions.hairstyle = value;
    }
    if (category === 'hairColor') {
      newOptions.hairColor = value;
    }
    if (category === 'skinTone') {
      newOptions.skinTone = value;
    }
    if (category === 'eyeColor') {
      newOptions.eyeColor = value;
    }
    if (category === 'ageGroup' && value === 'no person') {
      setActiveTalentPreset('custom');
    }
    if (category === 'contentStyle') {
      advanceOnboardingFromStep(1);
    } else if (stepThreeCategories.has(category)) {
      advanceOnboardingFromStep(3);
    }

    applyOptionsUpdate(() => newOptions);
    setSelectedCategories(updatedSelectedCategories);
    if (isPersonFieldKey(category)) {
      const updatedDetails = pickPersonDetails(newOptions);
      setPersonIdentityPackage(prev => {
        const updatedPackage = clonePersonIdentityPackage({
          ...prev,
          personDetails: updatedDetails,
        });
        if (isTalentLinkedAcrossScenes) {
          const profile = identityPackageToProfile(updatedPackage);
          setLinkedTalentProfile(profile);
          syncIdentityPackageAcrossScenes(updatedPackage);
          syncTalentAcrossScenes(profile, identitySourceSceneId);
        }
        return updatedPackage;
      });
    }

    const accordionCategoryMap: Record<string, OptionCategory[]> = {
      'Scene & Environment': ['setting', 'environmentOrder'],
      'Product Details': ['productMaterial', 'productPlane', 'placementStyle', 'placementCamera'],
      'Photography': ['lighting', 'camera', 'perspective', 'aspectRatio', 'realism'],
      'Person Details': [
        'ageGroup',
        'personAppearance',
        'personMood',
        'personPose',
        'wardrobeStyle',
        'personExpression',
        'hairStyle',
        'personProps',
        'microLocation',
        'productInteraction',
        'gender',
        'ethnicity',
        'selfieType',
        'hairColor',
        'eyeColor',
        'skinTone',
        'skinRealism',
      ],
    };

    let requiredCategories = accordionCategoryMap[accordionTitle];
    if (!requiredCategories) return;

    // If 'Person Details' is the current accordion and 'no person' is selected,
    // then only 'ageGroup' is required to advance.
    if (accordionTitle === 'Person Details' && newOptions.ageGroup === 'no person') {
      requiredCategories = ['ageGroup'];
    }

    if (isPersonFieldKey(category) && activeTalentPreset !== 'custom') {
      setActiveTalentPreset('custom');
    }
  };

  const resetOutputs = useCallback(() => {
    setGeneratedImageUrl(null);
    setFourKVariant(null);
    setTwoKVariant(null);
    setIsPreparingHiRes(false);
    setHiResError(null);
    setImageError(null);
    setGeneratedVideoUrl(null);
    setVideoError(null);
    setIsVideoLoading(false);
    setVideoPrompt('');
    setEditPrompt('');
  }, []);

  const handleReset = useCallback(() => {
    resetOutputs();
    const defaultOptions = createDefaultOptions();
    applyOptionsUpdate(() => defaultOptions);
    setSelectedCategories(new Set());
    setOpenAccordion('Scene & Environment');
    setActiveTalentPreset('custom');
    setIsProPhotographer(false);
    setActiveProPreset('custom');
    setGeneratedCopy(null);
    setIsCopyLoading(false);
    setCopyError(null);
    setMoodPalette([]);
    setMoodSummary(null);
    setMoodPromptCue(null);
    setIsMoodProcessing(false);
    setMoodImagePreview(prev => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setModelReferenceFile(null);
    setModelReferenceNotes('');
    setModelReferencePreview(prev => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setUploadedImageFile(activeProductAsset?.file ?? null);
    setUploadedImagePreview(activeProductAsset?.previewUrl ?? null);
    setActiveSupplementPreset('none');
    setSupplementPresetCue(null);
    setSupplementBackgroundColor('');
    setSupplementAccentColor('');
    setSupplementFlavorNotes('');
    setIncludeSupplementHand(false);
    setSupplementCustomPrompt('');
    setSelectedHeroPreset('custom');
    setCustomHeroDescription('');
    setHeroPosePromptCue(null);
    setHeroProductAlignment('center');
    setHeroProductScale(1);
    setHeroShadowStyle('softDrop');
  }, [activeProductAsset, applyOptionsUpdate, resetOutputs]);

  const handleLogout = useCallback(async () => {
    await logout();
    handleReset();
  }, [logout, handleReset]);


  const handleImageUpload = useCallback(
    async (files: File[]) => {
      const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

      if (!files.length) return;

      resetOutputs();
      setImageError(null);
      setGeneratedCopy(null);
      setCopyError(null);

      const validFiles = files.filter(file => ALLOWED_MIME_TYPES.includes(file.type));
      if (!validFiles.length) {
        setImageError('Unsupported file type. Please upload PNG, JPEG, or WebP images.');
        return;
      }

      const baseIndex = productAssets.length;
      const processedAssets: ProductAsset[] = [];
      const newActiveProducts: ActiveProduct[] = [];

      for (const file of validFiles) {
        try {
          const previewUrl = URL.createObjectURL(file);
          const { base64, mimeType } = await fileToBase64(file);
          const assetId = makeSceneId();
          const label = `Product ${baseIndex + processedAssets.length + 1}`;
          const asset: ProductAsset = {
            id: assetId,
            label,
            file,
            previewUrl,
            imageUrl: previewUrl,
            createdAt: Date.now(),
            heightValue: null,
            heightUnit: 'cm',
            base64,
            mimeType,
          };
          processedAssets.push(asset);
          const activeProduct = buildActiveProductFromAsset(asset);
          if (activeProduct) {
            newActiveProducts.push(activeProduct);
          }
        } catch (error) {
          console.error('Unable to read uploaded file', error);
          if (!imageError) {
            setImageError('We could not process one of the uploaded files.');
          }
        }
      }

      if (!processedAssets.length) {
        return;
      }

      setProductAssets(prev => [...prev, ...processedAssets]);
      setActiveProducts(prev => {
        const existingIds = new Set(prev.map(product => product.id));
        const additions = newActiveProducts.filter(product => !existingIds.has(product.id));
        const next = [...prev, ...additions];
        if (!next.length && processedAssets.length) {
          const fallback = buildActiveProductFromAsset(processedAssets[0]);
          if (fallback) {
            return [fallback];
          }
        }
        return next;
      });

      // ACTIVATE STEP 3
      setStep(3);

      advanceOnboardingFromStep(2);
    },
    [resetOutputs, advanceOnboardingFromStep, productAssets.length, imageError]
  );

  const handleProductAssetSelect = useCallback(
    (assetId: string) => {
      setActiveProducts(prev => {
        const isActive = prev.some(product => product.id === assetId);
        if (isActive) {
          if (prev.length <= 1) {
            return prev;
          }
          return prev.filter(product => product.id !== assetId);
        }
        const asset = productAssets.find(item => item.id === assetId);
        if (!asset) return prev;
        const nextProduct = buildActiveProductFromAsset(asset);
        if (!nextProduct) return prev;
        return [...prev, nextProduct];
      });
      resetOutputs();
    },
    [productAssets, resetOutputs]
  );

  const handleProductAssetLabelChange = useCallback((assetId: string, label: string) => {
    setProductAssets(prev =>
      prev.map(asset => (asset.id === assetId ? { ...asset, label: label || asset.label } : asset))
    );
  }, []);

  const handleProductHeightChange = useCallback((assetId: string, rawValue: string) => {
    setProductAssets(prev =>
      prev.map(asset => {
        if (asset.id !== assetId) return asset;
        const parsed = Number.parseFloat(rawValue);
        return {
          ...asset,
          heightValue: Number.isNaN(parsed) ? null : Math.max(0, parsed),
        };
      })
    );
  }, []);

  const handleProductHeightUnitChange = useCallback((assetId: string, unit: 'cm' | 'in') => {
    setProductAssets(prev =>
      prev.map(asset => (asset.id === assetId ? { ...asset, heightUnit: unit } : asset))
    );
  }, []);

  const handleProductAssetDelete = useCallback(
    (assetId: string) => {
      setProductAssets(prev => {
        const assetToRemove = prev.find(asset => asset.id === assetId);
        if (assetToRemove) {
          URL.revokeObjectURL(assetToRemove.previewUrl);
        }
        return prev.filter(asset => asset.id !== assetId);
      });
      setActiveProducts(prev => prev.filter(product => product.id !== assetId));
      resetOutputs();
    },
    [resetOutputs]
  );

  const handleLibraryAddClick = useCallback(() => {
    uploaderRef.current?.openFileDialog();
  }, []);

  const constructPrompt = (bundleProductsOverride?: ProductId[] | null): string => {
    const clean = (text: string = '') =>
      String(text)
        .replace(/http[^ ]+/g, '')
        .replace(/www\.[^ ]+/g, '')
        .replace(/reference/gi, '')
        .replace(/see/gi, '')
        .trim();
    const currentStyle = contentStyleValue;
    const isUgcStyle = currentStyle !== 'product';
    const personIncluded = isUgcStyle && (options.ageGroup !== 'no person' || hasModelReference);
    const selfieLabel = getSelfieLabel(options.selfieType);
    const selfieMeta = SELFIE_DIRECTIONS[selfieLabel];
    const requiresSplitHands = Boolean(selfieMeta?.enforceSplitHands);
    const hasSmartphoneProp = options.personProps === SMARTPHONE_PROP_VALUE;
    const isFlashLighting = options.lighting === FLASH_LIGHTING_VALUE;
    const isHandsOnlyPose = options.personPose === HANDS_ONLY_POSE_VALUE;
    const realModeActive = ugcRealSettings.isEnabled && !isProductPlacement && personIncluded;
    const expressionOverride = realModeActive && ugcRealSettings.selectedExpressionId
      ? UGC_EXPRESSION_PRESETS.find(item => item.id === ugcRealSettings.selectedExpressionId) ?? null
      : null;
    const cleanSetting = clean(options.setting);
    const cleanLighting = clean(options.lighting);
    const cleanEnvironmentOrder = clean(options.environmentOrder);
    const cleanProductPlane = clean(options.productPlane);
    const cleanProductMaterial = clean(options.productMaterial);
    const cleanCamera = clean(options.camera);
    const cleanPerspective = clean(options.perspective);
    const cleanProductInteraction = clean(options.productInteraction);
    const cleanPersonAppearance = clean(options.personAppearance);
    const cleanWardrobeStyle = clean(options.wardrobeStyle);
    const cleanPersonPose = clean(options.personPose);
    const cleanPersonMood = clean(options.personMood);
    const cleanPersonProps = clean(options.personProps);
    const cleanMicroLocation = clean(options.microLocation);
    const cleanPersonExpression = clean(options.personExpression);
    const cleanHairStyle = clean(options.hairStyle);
    const cleanHairColor = clean(options.hairColor);
    const cleanSkinTone = clean(options.skinTone);
    const cleanEyeColor = clean(options.eyeColor);
    const cleanSelfieType = clean(options.selfieType);
    const cleanRealism = clean(options.realism);
    const cleanSkinRealism = clean(options.skinRealism);
    const cleanPlacementStyle = clean(options.placementStyle);
    const cleanPlacementCamera = clean(options.placementCamera);
    const cleanProLens = clean(options.proLens ?? '');
    const cleanProLightingRig = clean(options.proLightingRig ?? '');
    const cleanProPostTreatment = clean(options.proPostTreatment ?? '');
    const cleanAspectRatio = clean(options.aspectRatio);
    const heroDescriptionPreset = HERO_PERSON_DESCRIPTION_PRESETS.find(
      preset => preset.id === selectedHeroPreset
    );
    const heroDescriptionSource =
      selectedHeroPreset === 'custom'
        ? customHeroDescription
        : heroDescriptionPreset?.description ?? '';
    const heroDescriptionText = clean(heroDescriptionSource);
    const identityPackage = personIdentityPackage;
    const identityHasModelReference = Boolean(identityPackage.modelReferenceBase64);
    const compositionIntro = COMPOSITION_BLOCKS[compositionMode] ?? '';
    const describeValue = (value?: string, fallback = 'unspecified') => clean(value || fallback);
    const identityBlock = identityHasModelReference
      ? `Use the uploaded model reference as the exact identity.
Do not change or alter the person's face, age, hair, skin tone, gender, or any physical attributes.
Preserve identity exactly. Do not stylize, enhance, beautify, or modify the appearance in any way.`
      : identityPackage.identityLock && identityPackage.personDetails
        ? `Use the following identity for the person in this scene.
This identity must remain exactly consistent across all scenes.
Do not alter or randomize the face, age, facial structure, or appearance.

Age group: ${describeValue(identityPackage.personDetails.ageGroup)}
Gender: ${describeValue(identityPackage.personDetails.gender)}
Ethnicity: ${describeValue(identityPackage.personDetails.ethnicity)}
Skin tone: ${describeValue(identityPackage.personDetails.skinTone)}
Hair: ${describeValue(identityPackage.personDetails.hairType, 'natural')}, ${describeValue(identityPackage.personDetails.hairLength, 'medium')}, ${describeValue(identityPackage.personDetails.hairColor)}
Facial hair: ${describeValue(identityPackage.personDetails.facialHair, 'natural')}
Body type: ${describeValue(identityPackage.personDetails.bodyType, 'balanced')}
Facial features: Do not alter or randomize.`
        : '';

    const getInteractionDescription = (interaction: string): string => {
      switch (interaction) {
        case 'holding it naturally':
          return clean('holding the product naturally and comfortably.');
        case 'using it':
          return clean('using the product naturally as intended.');
        case 'showing to camera':
          return clean('showing the product close to the camera.');
        case 'unboxing it':
          return clean('unboxing the product with excitement.');
        case 'applying it':
          return clean('applying the product to their skin or body.');
        case 'placing on surface':
          return clean('placing the product carefully on a nearby surface.');
        default:
          return clean(`interacting with the product in a way that is ${interaction}.`);
      }
    };

    const bundleProductsForPrompt = bundleProductsOverride ?? bundleSelectionRef.current;

    // CRITICAL: Image preservation constraints (only for lifestyle with uploaded image)
    const hasUploadedProduct = productAssets.length > 0;
    const preservationBlock = (hasUploadedProduct && isUgcStyle) ? `
CRITICAL IMAGE CONSTRAINTS:
Use the uploaded image as the primary immutable reference.
Do not redesign, reinterpret, or replace the scene.
Preserve subject, pose, framing, proportions and realism.
Preserve the exact uploaded product shape, proportions, colors, label layout, text and typography.
Do not modify branding. Do not rotate or mirror the product.
The uploaded image is the ground truth reference.
Only enhance lighting, background softness and lifestyle realism.
Do not invent new people, products, text or environments.

` : '';

    let prompt = preservationBlock + `Create an ultra-realistic, authentic ${isUgcStyle ? 'UGC lifestyle' : 'product placement'} photo with a ${cleanAspectRatio} aspect ratio. `;
    prompt = prompt
      .replace(/label design/gi, 'existing label preserved exactly')
      .replace(/redesign/gi, '')
      .replace(/re-imagine/gi, '')
      .replace(/new label/gi, '')
      .trim();
    prompt += isUgcStyle
      ? `The shot should feel candid, emotional, and cinematic, as if taken by a real person with a ${cleanCamera}. Embrace believable imperfections—slight motion blur, a little lens smudge, off-center framing, uneven window light—so it reads as everyday life rather than a polished model shoot. `
      : `The shot should feel refined and advertising-ready, with deliberate staging captured on a ${cleanCamera}. `;

    if (isHeroLandingMode && !hasModelReference) {
      const heroBackground =
        supplementBackgroundColor.trim() ||
        HERO_LANDING_META?.heroLandingConfig?.backgroundColor ||
        '#FFFFFF';
      prompt += `Design this as a seamless ecommerce hero module on a ${heroBackground} backdrop. Keep the set ultra minimal—no room environment, just a clean base plane and negative space perfect for landing pages. `;
      const heroAlignmentCopy = HERO_ALIGNMENT_TEXT[heroProductAlignment];
      prompt += `${heroAlignmentCopy} `;
      const scalePercent = Math.round(heroProductScale * 100);
      prompt += `Scale the product so it fills roughly ${scalePercent}% of the frame height without cropping labels. `;
      prompt += `${HERO_SHADOW_TEXT[heroShadowStyle]} `;
      const heroDefaults = HERO_LANDING_META?.heroLandingConfig;
      if (heroDefaults?.forcedLighting) {
        prompt += `Lighting must feel like ${heroDefaults.forcedLighting} studio conditions for consistent highlights. `;
      }
      if (heroDefaults?.forcedAngle) {
        prompt += `Frame it from a ${heroDefaults.forcedAngle} camera angle so packaging reads clearly. `;
      }
      if (heroDefaults?.noEnvironment) {
        prompt += 'Do not introduce furniture, backgrounds, or lifestyle props—just use subtle geometry or gradients to support the hero. ';
      }
      if (supplementAccentColor.trim()) {
        prompt += `Use ${supplementAccentColor.trim()} only for minimal accent bars or glass prisms—not full scenes—to keep the hero ultra clean. `;
      }
    } else {
      prompt += `The scene is a ${cleanSetting}, illuminated by ${cleanLighting}. The overall environment has a ${cleanEnvironmentOrder} feel. The photo is shot from a ${cleanPerspective}, embracing the chosen camera style and its natural characteristics. Frame the composition so the product lives in ${cleanProductPlane}. `;
    }

    const prefixParts: string[] = [];
    if (compositionIntro) {
      prefixParts.push(compositionIntro.trim());
    }
    if (identityBlock) {
      prefixParts.push(identityBlock.trim());
    }
    if (prefixParts.length) {
      prompt = `${prefixParts.join(' ')} ${prompt}`;
    }

    if (options.creationMode === 'lifestyle') {
      prompt += `
Photorealistic lifestyle UGC with real people and natural environments.
Natural lighting, candid mood, real skin texture and shadows.
Avoid perfect studio look.
`;
    }

    if (options.creationMode === 'studio') {
      prompt += `
Clean, high-end studio hero shot.
Soft gradient background, commercial lighting, crisp reflections.
Preserve exact product shape, label and colors.
No props or environments.
`;
    }

    if (options.creationMode === 'aesthetic') {
      prompt += `
Aesthetic styled scene with curated props.
Matching color palette, soft lighting and premium brand vibe.
Balanced, artistic composition.
`;
    }

    if (options.creationMode === 'bg-replace') {
      prompt += `
Replace the background while preserving exact product fidelity.
Clean edges, accurate colors, soft realistic shadow.
No product modifications.
`;
    }

    if (options.creationMode === 'ecom-blank') {
      prompt += `
Ecommerce layout with solid background color: ${options.bgColor}.
Product and person on the ${options.sidePlacement} side.
Large clean negative space on the opposite side.
Studio lighting, minimal shadows, no props or environments.
Preserve exact product fidelity.
`;
    }

    const formatHeightNumber = (num: number) => (Number.isInteger(num) ? num.toString() : num.toFixed(1));
    const describeHeight = (value: number, unit: 'cm' | 'in') => {
      if (unit === 'cm') {
        const inches = (value / 2.54).toFixed(1);
        return `${formatHeightNumber(value)} cm tall (about ${inches} in)`;
      }
      const centimeters = (value * 2.54).toFixed(1);
      return `${formatHeightNumber(value)} in tall (about ${centimeters} cm)`;
    };
    const heightNotes = productAssets
      .filter(asset => asset.heightValue)
      .map(asset => `${asset.label || 'product'} ${describeHeight(asset.heightValue!, asset.heightUnit)}`)
      .join('. ');
    prompt += `
Use the uploaded product image as the exact product to place in the scene.
Preserve:
- exact colors,
- exact label design,
- exact typography,
- exact cap shape,
- exact material,
- exact geometry,
- exact proportions.

Do not redesign, replace, or reinterpret the product.

Integrate it physically into the environment using "Active Insert Mode":
- match lighting to the room,
- adjust reflections on glass/plastic,
- add realistic soft shadows on surfaces,
- maintain physically correct highlights,
- preserve all printed elements clearly and accurately,
- keep edges and silhouette identical to the uploaded object.

The product must look naturally photographed inside this environment, not pasted or floating.
`;
    prompt += `
Integrate the product physically into the environment:
- match real lighting direction,
- match color temperature and contrast,
- generate accurate shadow casting under the jar/bottle,
- apply micro-occlusion where the hand touches the product,
- generate correct reflections on glass, plastic, or metal,
- preserve the exact design, size, colors, and branding of the uploaded product.
`;
    if (options.compositionMode === 'ecom-blank') {
      prompt += `
This image must use a pure solid background with the exact color: ${options.bgColor}.
Do NOT generate rooms, environments, furniture, props or scenery.
Keep the background perfectly uniform and flat.

Place the product and the person exclusively on the ${options.sidePlacement} side of the frame.
Leave large, clean negative space on the ${options.sidePlacement === 'left' ? 'right' : 'left'
        } side for text overlays.

Use soft studio lighting suitable for Amazon, Shopify and paid ads.
Do NOT add text, logos, watermarks or graphics.

Insert the uploaded product cleanly into the scene with:
- perfect edges,
- precise shape preservation,
- correct reflections,
- realistic soft shadows on the flat background,
- exact label, exact colors and exact proportions.

Maintain correct human anatomy at all times:
- natural hands,
- correct finger shape,
- proper wrist rotation,
- realistic arm connection to the body.
`;
    }
    if (heightNotes) {
      prompt += `Respect real-world scale: ${clean(heightNotes)}. Adjust hands, props, and camera distance so the item visibly matches that measurement.`;
    }
    if (formulationExpertEnabled) {
      const preset = FORMULATION_PRESET_LOOKUP[formulationExpertPreset];
      const expertName = (formulationExpertName || preset?.suggestedName || 'Dr. Ana Ruiz').trim();
      const expertRole = (formulationExpertRole || preset?.role || 'lead formulator').trim();
      const professionLabel = formulationExpertProfession === 'custom'
        ? expertRole
        : (FORMULATION_PROFESSION_LOOKUP[formulationExpertProfession]?.label ?? expertRole);
      const safeExpertName = clean(expertName);
      const safeExpertRole = clean(professionLabel);
      prompt += ` Feature ${safeExpertName}, a ${safeExpertRole}, present in ${clean(formulationLabStyle)} beside the hero product.`;
      if (preset?.prompt) {
        prompt += ` ${clean(preset.prompt)}`;
      }
      prompt += ' Their face must look photorealistic and human—no CGI, animation, or plastic skin. Keep real pores and imperfect lighting. Keep flat focus across the frame (no depth-of-field blur).';
      prompt += ' Make it obvious they created the formula based on cited clinical research—include subtle clipboard notes, lab coat details, and a respectful nod to science-backed development.';
    }
    if (realModeActive) {
      prompt += ` ${UGC_REAL_MODE_BASE_PROMPT}.`;
    }
    if (productAssets.length > 1) {
      prompt += ' There are multiple distinct product cutouts supplied. Arrange every unique product in the final scene, keeping each one fully visible and recognizable while avoiding any invented packaging. Treat them as a cohesive collection in the same frame.';
    } else if (isMultiProductPackaging) {
      prompt += ' This product photo shows a packaging kit that contains several items. Keep the box, lid, and every interior product fully visible—never crop away the inserts or swap them for a single bottle. Preserve the real-world packaging layout exactly as photographed.';
    }
    if (bundleProductsForPrompt?.length) {
      const bundleLabels = bundleProductsForPrompt
        .map(id => productMediaLibrary[id]?.label || PRODUCT_MEDIA_LIBRARY[id]?.label)
        .filter(Boolean);
      if (bundleLabels.length) {
        prompt += ` Treat this as a curated bundle featuring ${bundleLabels.join(', ')}. Arrange every uploaded product cutout to mimic that assortment so shoppers immediately read it as a kit. `;
      }
    }
    if (supplementPresetCue) {
      prompt += ` ${clean(supplementPresetCue)}`;
    }
    if (supplementBackgroundColor.trim()) {
      prompt += ` Set the hero backdrop color to ${supplementBackgroundColor}, matching the brand palette.`;
    }
    if (supplementAccentColor.trim()) {
      prompt += ` Add secondary accents or props in ${supplementAccentColor} to create contrast.`;
    }
    if (supplementFlavorNotes.trim()) {
      prompt += ` Include supporting ingredients/props inspired by: ${clean(supplementFlavorNotes.trim())}.`;
    }
    if (includeSupplementHand) {
      prompt += ' Add a cropped human hand interacting with the product in a natural, candid way, with modern nail polish and minimal retouch. The hand must be real (no 3D or mannequin look).';
    }
    if (supplementCustomPrompt.trim()) {
      prompt += ` ${clean(supplementCustomPrompt.trim())}`;
    }
    if (!isUgcStyle) {
      prompt += ` No people should appear in the frame. Style the set like a premium product placement shoot with thoughtful props, surfaces, and depth, highlighting the product as the hero. Use a ${cleanPlacementCamera} approach and style the scene as ${cleanPlacementStyle}. `;
      if (isProPhotographer) {
        prompt += ` Professional setup details: ${cleanProLens || PRO_LENS_OPTIONS[0].value}, lighting rig ${cleanProLightingRig || PRO_LIGHTING_RIG_OPTIONS[0].value}, and finishing treatment ${cleanProPostTreatment || PRO_POST_TREATMENT_OPTIONS[0].value}. `;
      }
    }
    if (options.realism) {
      prompt += ` ${cleanRealism}`;
    }
    if (moodPromptCue) {
      prompt += ` ${clean(moodPromptCue)}`;
    }

    if (personIncluded) {
      if (hasModelReference) {
        if (modelReferenceNotes.trim()) {
          prompt += ` Follow this direction for the model: ${clean(modelReferenceNotes.trim())}.`;
        }
        if (identityHasModelReference) {
          prompt += ' Treat the reference photo as ground truth for identity and styling.';
        }
        prompt += `
Scene:
${cleanSetting}
${cleanLighting}
${cleanCamera}

Product:
${cleanProductMaterial}
${cleanProductPlane}
${cleanPlacementStyle}
`;
      } else {
        if (options.creatorPreset) {
          prompt += `The overall creative persona is ${clean(options.creatorPreset)}. `;
        }
        if (options.appearanceLevel) {
          prompt += `Their grooming level is ${clean(options.appearanceLevel)}. `;
        }
        if (options.mood) {
          prompt += `The mood is ${clean(options.mood)}, expressed naturally and realistically. `;
        }
        if (options.pose) {
          prompt += `The pose is ${clean(options.pose)}. `;
        }
        if (options.expression) {
          prompt += `Their expression is ${clean(options.expression)}. `;
        }
        if (options.wardrobe) {
          prompt += `Their wardrobe style is ${clean(options.wardrobe)}. `;
        }
        if (options.hairstyle) {
          prompt += `Their hairstyle is ${clean(options.hairstyle)}. `;
        }
        if (options.hairColor) {
          prompt += `Their hair color is ${clean(options.hairColor)}. `;
          prompt += `Hair color: ${clean(options.hairColor)}. Do not override with age-based defaults. `;
        }
        prompt += 'Age-based defaults must NOT override hair color or appearance selections. Hair must always match the selected color, even for seniors. ';
        if (options.skinTone) {
          prompt += `Their skin tone is ${clean(options.skinTone)}. `;
        }
        if (options.eyeColor) {
          prompt += `Their eye color is ${clean(options.eyeColor)}. `;
        }
        if (options.microLocation) {
          prompt += `The micro-location is ${clean(options.microLocation)}. `;
        }
        if (options.customMicroLocation) {
          prompt += `Additional micro-location detail: ${clean(options.customMicroLocation)}. `;
        }
        if (options.interaction2) {
          prompt += `Interaction detail: ${clean(options.interaction2)}. `;
        }
        const ageNarrative = describeAgeGroup(options.ageGroup, options.gender);
        const poseEmphasizesHands = options.personPose.toLowerCase().includes('hand');
        const isHandCloseUp = options.selfieType === 'close-up shot of a hand holding the product' || poseEmphasizesHands;
        prompt += `The photo features ${clean(ageNarrative)}, of ${clean(options.ethnicity)} ethnicity, showcasing ${cleanPersonAppearance}. `;
        if (options.ageGroup === '13-17') {
          prompt += 'Capture a playful, teenage energy—youthful accessories, braces, or freckled details are welcome but keep it tasteful. ';
        }
        if (options.ageGroup === '6-12') {
          prompt += 'Ensure the child proportions, clothing, and demeanor read as pre-teen (no teens or adults). ';
        }
        if (options.ageGroup === '18-25') {
          prompt += 'Lean into a Gen-Z vibe with casual accessories, modern streetwear, and expressive gestures. ';
        }
        if (options.ageGroup === '26-35') {
          prompt += 'Make sure they read as a late-20s/early-30s creator with subtle sophistication and confidence. ';
        }
        if (options.ageGroup === '36-45') {
          prompt += 'Include hints of a mid-career adult (gentle laugh lines, poised posture, purposeful styling). ';
        }
        if (options.ageGroup === '46-60') {
          prompt += 'Show visible signs of maturity—defined laugh lines, sun freckles, or silver strands—while keeping them vibrant. ';
        }
        if (options.ageGroup === '60-75') {
          prompt += 'Represent an older adult with softened skin texture, salt-and-pepper hair, and calm confidence. ';
        }
        if (options.ageGroup === '75+') {
          prompt += 'Make the subject unmistakably senior with soft wrinkles, age spots on hands, slightly stooped posture, and silver or white hair texture. ';
        }
        prompt += `They are dressed in ${cleanWardrobeStyle}, matching the scene's palette. Their pose is ${cleanPersonPose}, projecting ${cleanPersonMood}. `;
        if (realModeActive) {
          if (ugcRealSettings.selectedClothingPresetIds.length) {
            const clothingText = ugcRealSettings.selectedClothingPresetIds
              .map(id => UGC_CLOTHING_PRESETS.find(item => item.id === id)?.prompt)
              .filter(Boolean)
              .join(' ');
            if (clothingText) {
              prompt += ` ${clean(clothingText)}`;
            }
          }
          if (ugcRealSettings.clothingUpload) {
            prompt += ' Match the outfit to the uploaded clothing reference image so fabrics, drape, and color story stay true to reality.';
          }
        }
        prompt += `They have ${cleanSkinTone}, ${cleanEyeColor}, and ${cleanHairColor}. `;
        if (expressionOverride) {
          prompt += ` ${clean(expressionOverride.prompt)}`;
        } else {
          prompt += `Their facial expression shows ${cleanPersonExpression}. `;
        }
        prompt += `Their hair is styled as ${cleanHairStyle}. `;
        prompt += ' Faces and hands must be fully realistic with natural skin texture, no distortions or 3D plastic look. Zero warped fingers, zero asymmetry, zero AI artifacts. ';
        if (options.skinRealism) {
          prompt += `Skin realism mode: ${clean(options.skinRealism)}. Render pores, micro shadows, and natural texture accordingly. `;
        }
        prompt += 'Pores, microtexture, and natural imperfections must be preserved according to the selected skin realism mode. ';
        if (options.props) {
          prompt += `Props present include ${clean(options.props)}. `;
        }
        if (options.customProp) {
          prompt += `Additional prop: ${clean(options.customProp)}. `;
        }
        if (options.personProps !== personPropNoneValue) {
          prompt += `Add supporting props such as ${cleanPersonProps} to reinforce the lifestyle context. `;
        }
        if (hasUploadedProduct && !hideProductMode) {
          prompt +=
            'PRODUCT FOCUS LOCK (CRITICAL): The product must always be the primary subject, on the front-most visual layer, and tack sharp; never in the background or out of focus. ';
        }
        if (!hasModelReference && options.productInteraction === 'showing to camera') {
          prompt += `Ensure the product is held close to the camera lens in the foreground, occupying the main focal plane with crisp sharpness. The person stays behind the product, slightly defocused or secondary in the frame. The product must NOT appear in the background and must always remain in the front-most visual layer. `;
        }
        if (options.microLocation !== microLocationDefault) {
          prompt += `Place them within ${cleanMicroLocation} to ground the scene. `;
        }
        if (isHandCloseUp || selfieMeta?.hideFace || isHandsOnlyPose) {
          prompt += `The shot is a tactile close-up of their hands ${getInteractionDescription(cleanProductInteraction)} Keep the crop near the torso or closer so attention stays on the product and touch. `;
          if (selfieMeta?.hideFace) {
            prompt += 'Do not show their face—only forearms, hands, and the product should be visible, mimicking a back-camera POV. ';
          }
        } else {
          prompt += `The person is ${getInteractionDescription(cleanProductInteraction)} Their face and upper body are visible, and the interaction looks unposed and authentic. `;
          if (options.selfieType !== 'none') {
            prompt += `The style is a ${cleanSelfieType}. `;
          }
        }
        if (selfieMeta) {
          prompt += ` ${clean(selfieMeta.narrative)} `;
          if (requiresSplitHands) {
            prompt += 'Keep the smartphone in one hand and the product in the opposite hand so both hero objects stay visible simultaneously, with the phone-holding arm fully extended into frame like a true selfie. ';
          }
        } else if (hasSmartphoneProp) {
          prompt += 'Include a modern smartphone prop in their free hand so it complements but never hides the product. ';
        }
        prompt += 'Hands must look fully human and photorealistic (no 3D artifacts). Skin texture, knuckles, and nails should be natural.';
        prompt += `
Ensure anatomically correct human arms and hands with:
- proper bone proportions,
- natural wrist rotation,
- realistic muscle tension,
- visible knuckles and joints,
- correct finger lengths,
- realistic grip around the product,
- correct connection to the body even if the shoulder is off-frame.
Hands must be photorealistic with subtle veins, micro-shadows, and true skin texture.
No warped, melted, or floating limbs.
`;
        if (selfieMeta?.hidePhone) {
          prompt += 'Do not render a smartphone anywhere in frame—imply the selfie by the arm extension and body posture only.';
        }
        if (isFlashLighting && !selfieMeta?.hidePhone) {
          prompt += 'Use a bright on-camera flash that reflects on their face (or hands if the face is cropped out) and bounces off the phone, casting crisp, short shadows for that candid flash look. ';
        }
        if (heroDescriptionText) {
          prompt += ` ${heroDescriptionText}`;
        }
        if (heroPosePromptCue) {
          prompt += ` ${clean(heroPosePromptCue)}`;
        }
        if (realModeActive) {
          if (ugcRealSettings.imperfectLighting) {
            prompt += ' Let the lighting stay imperfect with hotspots, hard falloff, and visible shadows on the wall.';
          }
          if (ugcRealSettings.lowResolution) {
            prompt += ' Simulate a low-resolution phone capture with pixel softness and slight chroma noise.';
          }
          if (ugcRealSettings.offFocus) {
            prompt += ' Keep focus stable: the product and label remain tack sharp at all times (no focus breathing on the product).';
          }
          if (ugcRealSettings.tiltedPhone) {
            prompt += ' Keep the camera horizon slightly tilted as if the phone was captured quickly.';
          }
          const offCenterPreset = UGC_OFF_CENTER_OPTIONS.find(option => option.id === ugcRealSettings.offCenterId);
          if (offCenterPreset) {
            prompt += ` ${clean(offCenterPreset.prompt)}`;
          }
          const framingPreset = UGC_SPONTANEOUS_FRAMING_OPTIONS.find(option => option.id === ugcRealSettings.framingId);
          if (framingPreset) {
            prompt += ` ${clean(framingPreset.prompt)}`;
          }
          if (ugcRealSettings.grainAmount > 0) {
            prompt += ` Add roughly ${ugcRealSettings.grainAmount}% grain to mimic raw smartphone texture (no focus blur on the product).`;
          }
          prompt += ' UGC Real Mode may add grain, lighting imperfections and organic feel to the scene, but must not degrade product clarity, readability or branding. ';
        }
      }
    }

    if (!hasModelReference) {
      prompt += `
Apply creator personality attributes selected by the user, including:
- Appearance Level
- Mood & Expression
- Pose Type
- Interaction Type
- Wardrobe Style
- Props
- Micro-location
- Skin Realism
- Eye Color
- Hair Style, Hair Color
- Selfie Type

Respect all these settings consistently.
`;
    }

    if (options.compositionMode === 'ecom-blank') {
      prompt += `
Create an ecommerce-style lifestyle image optimized for Amazon, Shopify and paid ads.

Follow these layout rules:
- Background must be a clean solid color: ${options.bgColor}
- Place the product and person on the ${options.sidePlacement} side of the frame.
- Leave large clean negative space on the opposite side for text overlays.
- Use soft, commercial studio lighting with minimal shadows.
- Keep the scene simple, minimal and premium.
- Do NOT add text, logos, graphics, icons or overlays.
- Maintain perfect product preservation: exact colors, label, shape and cap.
- Ensure perfect human anatomy: realistic hands, finger proportions, wrist angle and arm connection.
- Render in a photorealistic modern ecommerce style suitable for A+ content.
`;
    }
    if (options.compositionMode === 'ecom-blank') {
      prompt += `
If the model attempts to create a scene or environment, override it and force a solid background with the exact color ${options.bgColor}.
`;
    }
    prompt += ' Deliver the render at ultra-high fidelity: native 4K resolution (minimum 3840px on the long edge) so it still looks razor sharp when downscaled to 2K for alternate exports.';
    prompt += ` Final image must be high-resolution and free of any watermarks, text, or artificial elements. It should feel like a captured moment, not a staged ad.`;

    const finalPrompt = removeConflictingIdentityPhrases(prompt);

    // DEBUG: Log final prompt for validation
    console.log('[FINAL PROMPT GENERATED]:', {
      length: finalPrompt.length,
      isLifestyle: isUgcStyle,
      personIncluded,
      hasPreservation: hasUploadedProduct && isUgcStyle,
      mode: options.creationMode,
    });
    console.log('[Prompt Preview (first 800 chars)]:', finalPrompt.substring(0, 800));

    return finalPrompt;
  }

  const getImageCreditCost = useCallback(
    (opts: MockupOptions) => {
      if (contentStyleValue === 'product') {
        return 1;
      }
      if (opts.ageGroup === 'no person' && !hasModelReference) {
        return 2;
      }
      return isSimpleMode ? 3 : 4;
    },
    [contentStyleValue, isSimpleMode, modelReferenceFile]
  );

  const publishFreeGallery = useCallback((entry: {
    imageUrl: string;
    userId: string;
    plan?: string;
    compositionMode?: string;
    createdAt?: number;
  }) => {
    if (typeof window === 'undefined') return;
    const imageUrl = String(entry.imageUrl || '').trim();
    const userId = String(entry.userId || '').trim().toLowerCase();
    if (!imageUrl || !userId) return;
    if (imageUrl.toLowerCase().startsWith('data:')) return;

    try {
      const key = LOCAL_GALLERY_CACHE_KEY;
      const stored = window.localStorage.getItem(key);
      const parsed = stored ? JSON.parse(stored) : [];
      const existing = Array.isArray(parsed) ? parsed : [];
      const generateId = () => {
        if (window.crypto?.randomUUID) {
          return window.crypto.randomUUID();
        }
        return `local-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
      };

      const nextEntry = {
        id: generateId(),
        imageUrl,
        userId,
        plan: entry.plan ? String(entry.plan).toLowerCase() : 'free',
        compositionMode: entry.compositionMode,
        createdAt: typeof entry.createdAt === 'number' ? entry.createdAt : Date.now(),
      };

      const next = [nextEntry, ...existing]
        .filter(item => item && typeof item.imageUrl === 'string' && typeof item.userId === 'string')
        .slice(0, 120);
      window.localStorage.setItem(key, JSON.stringify(next));
    } catch (err) {
      console.warn('Failed to publish to local gallery cache', err);
    }
  }, []);

  const getImageDimensions = useCallback((url: string): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.onerror = () => {
        reject(new Error('Unable to measure image dimensions'));
      };
      img.src = url;
    });
  }, []);

  const reportGalleryEntry = useCallback(
    async (url: string) => {
      if (!url) return;
      const safeEmail = String(userEmail || '').trim();
      if (!safeEmail) return;
      const userId = safeEmail.toLowerCase();
      const plan = planTier;
      try {
        const { width, height } = await getImageDimensions(url);
        const response = await fetch('/api/galleryHandler?action=add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageUrl: url,
            userId,
            plan,
            meta: {
              width,
              height,
              modelReferenceUsed: Boolean(modelReferenceFile),
              productsUsed: Math.max(1, productAssets.length),
            },
          }),
        });
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data?.error || `Gallery add failed (${response.status})`);
        }
        const payload = await response.json().catch(() => ({} as any));
        const storedImageUrl = typeof payload?.imageUrl === 'string' ? payload.imageUrl : null;
        publishFreeGallery({
          imageUrl: storedImageUrl || url,
          userId,
          plan,
          compositionMode,
        });
      } catch (error) {
        console.warn('Failed to report gallery entry', error);
        publishFreeGallery({
          imageUrl: url,
          userId,
          plan,
          compositionMode,
        });
      }
    },
    [userEmail, planTier, modelReferenceFile, productAssets.length, getImageDimensions, publishFreeGallery, compositionMode]
  );

  const determineGalleryPlan = useCallback(() => {
    if (inviteUsed) return 'access';
    return planTier;
  }, [inviteUsed, planTier]);

  const getActiveProductsFromIds = useCallback(
    (ids: ProductId[]): ActiveProduct[] =>
      ids
        .map(id => {
          const idx = availableProductIds.indexOf(id);
          if (idx === -1) return null;
          const asset = productAssets[idx];
          if (!asset) return null;
          return buildActiveProductFromAsset(asset);
        })
        .filter((item): item is ActiveProduct => Boolean(item)),
    [availableProductIds, productAssets]
  );

  const computePromptHash = async (text: string) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await (globalThis.crypto?.subtle ?? (window as any).crypto.subtle).digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
  };

  const handleGenerateClick = useCallback(
    async (bundleProducts?: ProductId[], overrideActiveList?: ActiveProduct[], runMode: 'generate' | 'validate' = 'generate') => {
      let generationLogId: string | null = null;
      bundleSelectionRef.current = bundleProducts ?? null;
      
      // RANDOM CHARACTER: Randomize all person parameters before generation
      if (isRandomCharacterEnabled) {
        randomizeCharacterParameters();
      }
      
      if (isTrialLocked) {
        setImageError(`You reached the ${currentPlan.label} limit (${planCreditLimit} credits). Upgrade your plan to keep generating scenes.`);
        return;
      }
      const generationProductsRaw = overrideActiveList?.length ? overrideActiveList : activeProducts;
      const generationProducts = hideProductMode ? [] : generationProductsRaw;
      if (!generationProducts.length && !hideProductMode) {
        setImageError("Please upload a product image first.");
        return;
      }

      // ENGINE ROUTING: canonical flag — true for any studio-branding generation.
      // isProductPlacement = options.contentStyle === 'product' (set via the V1 toggle)
      // isStudioBrandingScene = sceneType emitted by Step3 is 'studio-branding' (V2 panel, isProductMode=false)
      // Both cases must use V2 generateProductJobs + ProductStudioStore as source of truth.
      const isStudioBrandingScene = lifestyleStep3Values?.sceneType === 'studio-branding';
      const isStudioEngine = isProductPlacement || isStudioBrandingScene;
      console.log('[APP isStudioEngine]', {
        'lifestyleStep3Values.sceneType': lifestyleStep3Values?.sceneType,
        isStudioBrandingScene,
        isProductPlacement,
        isStudioEngine,
      });

      const personIncluded = !isStudioEngine && (options.ageGroup !== 'no person' || !!modelReferenceFile);
      const realModeActive = ugcRealSettings.isEnabled && !isStudioEngine && personIncluded;

      const creditCost = getImageCreditCost(options);
      if (!isTrialBypassActive && creditCost > remainingCredits) {
        setImageError('Not enough credits for this generation. Upgrade your plan.');
        if (remainingCredits <= 0) {
          setShowPlanModal(true);
        }
        return;
      }

      resetOutputs();
      setGeneratedCopy(null);
      setCopyError(null);
      setIsImageLoading(true);
      setImageError(null);

      try {
        // Build PromptOptions from current state
        const shouldReuseIdentityKey =
          !isStudioEngine &&
          !hasModelReference &&
          lifestyleStep3Values?.sameCreatorAcrossScenes === true &&
          personIncluded === true &&
          Boolean(identityContinuityRef.current?.identityKey);

        const allowedProductCreationModes = new Set(['studio', 'aesthetic', 'bg-replace', 'ecom-blank']);
        const safeProductCreationMode =
          options.creationMode && allowedProductCreationModes.has(String(options.creationMode))
            ? options.creationMode
            : 'studio';

        const basePromptOptions: any = {
          ...options,
          sceneType: lifestyleStep3Values?.sceneType || (options as any).sceneType || (isStudioEngine ? 'studio-branding' : 'lifestyle-real'),
          modelReferenceLockAccessories,
          contentStyle: isStudioEngine ? 'product' : 'ugc',
          creationIntent: isStudioEngine ? 'product' : options.creationIntent,
          sceneIntent: isStudioEngine ? 'ecommerce' : options.sceneIntent,
          creationMode: isStudioEngine
            ? safeProductCreationMode
            : (options.creationMode || 'lifestyle'),
          ...(isStudioEngine
            ? {
              cameraType:
                options.cameraType &&
                  !String(options.cameraType).toLowerCase().includes('smartphone') &&
                  !String(options.cameraType).toLowerCase().includes('phone')
                  ? options.cameraType
                  : 'DSLR / mirrorless camera',
              compositionMode: undefined,
              compositionModeStructural: undefined,
              creationModeStructural: undefined,
            }
            : {}),
          personIncluded,
          productAssets: (hideProductMode ? [] : generationProducts).map(p => {
            const sourceAsset = productAssets.find(asset => asset.id === p.id);
            return {
              id: p.id,
              label: sourceAsset?.label ?? 'Product',
              base64: p.base64,
              mimeType: p.mimeType,
              heightValue: sourceAsset?.heightValue ?? null,
              heightUnit: sourceAsset?.heightUnit ?? 'cm',
            };
          }),
          ...(shouldReuseIdentityKey
            ? {
              identityKey: identityContinuityRef.current?.identityKey,
              identitySeed: identityContinuityRef.current?.identitySeed,
              identityMode: 'locked',
            }
            : {}),
        };

        // Ensure every render produces a different person by default (while keeping age/gender/etc),
        // unless the user explicitly enables "Same character" OR uses a Model Reference (which must lock identity).
        const shouldForceRandomIdentity =
          !isStudioEngine &&
          !hasModelReference &&
          lifestyleStep3Values?.sameCreatorAcrossScenes !== true &&
          personIncluded === true;
        if (shouldForceRandomIdentity && !shouldReuseIdentityKey) {
          const pickRandomOptionValue = (list: Option[], excludeValues: Set<string> = new Set()) => {
            const candidates = list
              .map(item => item?.value)
              .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
              .filter(value => !excludeValues.has(value));
            if (!candidates.length) return null;
            return candidates[Math.floor(Math.random() * candidates.length)];
          };
          const runtimeUuid =
            (typeof globalThis !== 'undefined' && (globalThis as any)?.crypto?.randomUUID)
              ? (globalThis as any).crypto.randomUUID()
              : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
          basePromptOptions.identityMode = 'auto';
          basePromptOptions.identityVariationToken = runtimeUuid;
          basePromptOptions.identityKey = undefined;
          basePromptOptions.identitySeed = runtimeUuid;

          // Make the "different person" perceptible by varying non-sensitive appearance traits
          // (without changing age unless the user changes it).
          // Only apply when the user hasn't explicitly chosen these controls.
          if (!selectedCategories.has('hairStyle')) {
            const nextHairStyle = pickRandomOptionValue(HAIR_STYLE_OPTIONS as any, new Set([options.hairStyle]));
            if (nextHairStyle) basePromptOptions.hairStyle = nextHairStyle;
          }
          if (!selectedCategories.has('hairColor')) {
            const nextHairColor = pickRandomOptionValue(HAIR_COLOR_OPTIONS as any, new Set([options.hairColor]));
            if (nextHairColor) basePromptOptions.hairColor = nextHairColor;
          }
          if (!selectedCategories.has('eyeColor')) {
            const nextEyeColor = pickRandomOptionValue(EYE_COLOR_OPTIONS as any, new Set([options.eyeColor]));
            if (nextEyeColor) basePromptOptions.eyeColor = nextEyeColor;
          }
        } else if (!shouldReuseIdentityKey) {
          // Avoid accidental carryover when the toggle is OFF.
          basePromptOptions.identityKey = undefined;
        }

        // If LifestyleStep3 values exist, map them to PromptOptions
        let promptOptions = basePromptOptions;
        let finalPrompt: string;

        // PHASE 2: PRODUCT MODE - Use ProductStudioStore directly, bypass legacy mapper
        // Route to V2 via the canonical isStudioEngine flag (hoisted at top of callback).
        if (isStudioEngine) {
          // Read directly from ProductStudioStore - SINGLE SOURCE OF TRUTH
          const productStateRaw = useProductStudioStore.getState();
          const productState = {
            ...productStateRaw,
            aspectRatio: (resolveOutputAspectRatio() || productStateRaw.aspectRatio || PRODUCT_DEFAULT_ASPECT_RATIO) as any
          };
          console.log('[PRODUCT STUDIO STATE]', productState);
          console.log('[ROUTE] studio-branding → V2 engine. isStudioEngine=', isStudioEngine, '(isProductPlacement=', isProductPlacement, ', isStudioBrandingScene=', isStudioBrandingScene, ')');

          // Generate jobs using Product-only builders
          const jobs = generateProductJobs(productState);

          if (jobs.length === 0) {
            setImageError('No products to generate. Please upload product images first.');
            setIsImageLoading(false);
            return;
          }

          // Use first job's prompt (single product or bundle)
          finalPrompt = jobs[0].prompt;

          // PHASE 7: HARDBLOCK VALIDATION - Check forbidden terms
          // Skip when V2 engine is active — V2 has its own internal validation policy
          // that correctly handles hands/interaction. Running V1 forbidden-terms check
          // on a V2 prompt incorrectly blocks hands even when interaction is active.
          if (!isStudioV2Enabled()) {
            try {
              validatePrompt(finalPrompt, { allowHands: productState.interaction !== 'none' || productState.handsHolding === true });
            } catch (validationError) {
              console.error('[PROMPT BLOCKED]', validationError);
              setImageError(`Generation blocked: ${(validationError as Error).message}`);
              setIsImageLoading(false);
              return;
            }
          }

          console.log('[FINAL PRODUCT PROMPT]', finalPrompt);

          // Product mode uses minimal prompt options
          promptOptions = {
            ...basePromptOptions,
            sceneType: 'studio-branding',
            contentStyle: 'product',
            creationIntent: 'product',
            sceneIntent: 'ecommerce',
            personIncluded: false,
            aspectRatio: resolveOutputAspectRatio(),
          };
        } else if (lifestyleStep3Values) {
          // LIFESTYLE/UGC MODE - Use legacy mapper (unchanged)
          promptOptions = mapLifestyleToPromptOptions(lifestyleStep3Values, basePromptOptions, hasModelReference);
          finalPrompt = promptEngine.build(promptOptions);
        } else {
          finalPrompt = promptEngine.build(promptOptions);
        }

        const keepSamePersonAcrossRenders =
          !isStudioEngine &&
          !hasModelReference &&
          lifestyleStep3Values?.sameCreatorAcrossScenes === true &&
          personIncluded === true;

        // If the user wants the same person, force reuse of the previously-minted identity
        // (prevents accidental reminting that makes the person change when the toggle is ON).
        if (keepSamePersonAcrossRenders && identityContinuityRef.current?.identityKey) {
          promptOptions = {
            ...promptOptions,
            identityMode: 'locked',
            identityVariationToken: undefined,
            identityKey: identityContinuityRef.current.identityKey,
            identitySeed: identityContinuityRef.current.identitySeed ?? promptOptions.identitySeed,
          };
        }

        // Product mode safety: force the model to keep the referenced product visible.
        if (isStudioEngine) {
          finalPrompt = [
            finalPrompt,
            'CRITICAL: The product shown in the reference image(s) MUST appear in the final image, clearly visible and not cropped out.',
            'Do NOT generate an empty scene/background; never omit the product.',
          ].join(' ');
        } else if (!hideProductMode && generationProducts.length > 0) {
          // Lifestyle/UGC safety: ensure the product is foregrounded and tack-sharp.
          // This prevents "nice portrait + blurry product" outputs when the user uploads a product reference.
          finalPrompt = [
            finalPrompt,
            'CRITICAL PRODUCT FOCUS: The product must be in the foreground and be the sharpest object in the image.',
            'The label/logo must be fully readable (no blur, no glare, no occlusion).',
            'Do NOT use shallow depth of field, bokeh, or background separation. Avoid shallow consumer blur effects. Keep a single-plane image with flat focus.',
            'If a person is present, they may be slightly less sharp than the product, but the product must be tack sharp.',
          ].join(' ');
        } else if (isProPhotographer) {
          const proBits = [options.proLens, options.proLightingRig, options.proPostTreatment].filter(Boolean);
          if (proBits.length) {
            finalPrompt = `${finalPrompt} PRO PHOTOGRAPHER OVERRIDES: ${proBits.join(' ')}.`;
          }
        }

        if (!isStudioEngine && personIncluded) {
          finalPrompt = [
            finalPrompt,
            'REALISM HARD RULE: Photorealistic real human photo. Absolutely no 3D/CGI, no cartoon, no illustration, no anime, no doll-like/plastic skin, no game-render look.',
          ].join(' ');
        }

        if (!isStudioEngine && hasModelReference) {
          finalPrompt = [
            finalPrompt,
            'MODEL REFERENCE PRIORITY (HIGHEST): Use the uploaded model reference as immutable identity ground truth.',
            'Match the same face, age, skin texture, proportions, and hair exactly. Do not substitute with another person.',
          ].join(' ');
        }

        // Persist continuity identity only when explicitly requested.
        // Otherwise "locked" mode would mint a new identityKey every click → different person.
        if (keepSamePersonAcrossRenders && promptOptions?.identityKey) {
          identityContinuityRef.current = {
            identityKey: promptOptions.identityKey,
            identitySeed: promptOptions.identitySeed,
          };
        }

        // MANDATORY LOGS - Prove injection works
        console.log('[SCENESTATE]', lifestyleStep3Values);
        console.log('[PROMPT OPTIONS FROM MAP]', promptOptions);

        const promptHash = await computePromptHash(finalPrompt);
        console.log('[UGC DEBUG] promptHash:', promptHash);
        console.log('[UGC DEBUG] promptPreview:', finalPrompt.slice(0, 300));

        // MANDATORY LOG - Final prompt string MUST show injected values
        console.log('[FINAL PROMPT STRING]', finalPrompt);

        const aspectRatio =
          isStudioEngine
            ? resolveOutputAspectRatio()
            : (promptOptions.aspectRatio || options.aspectRatio || '1:1');
        lastAspectRatioRef.current = aspectRatio;

        const resolvedApiKey = getActiveApiKeyOrNotify(setImageError);
        if (!resolvedApiKey) {
          return;
        }
        const resolvedUgcStyle = (promptOptions.ugcStyle ?? 'optimized').toLowerCase();
        const naturalMode = resolvedUgcStyle === 'natural';
        const rawMode = !!promptOptions.ugcRealModeActive;
        const isNaturalUgc = naturalMode || rawMode;
        
        // WINE SERVED MODE: Detect wine in served state for special handling
        // For Product Studio mode: read from ProductStudioStore
        // For Lifestyle mode: read from lifestyleStep3Values
        const productStateForWine = isStudioEngine ? useProductStudioStore.getState() : null;
        const wineVisualProfile = isStudioEngine 
          ? (productStateForWine as any)?.visualProfile 
          : (lifestyleStep3Values as any)?.visualProfile;
        // In Product Studio: serveState is derived from wineGlassMode='filled'
        // In Lifestyle: serveState is explicit
        const wineServeState = isStudioEngine
          ? ((productStateForWine as any)?.wineGlassMode === 'filled' ? 'served' : 'none')
          : (lifestyleStep3Values as any)?.serveState;
        const isWineServedMode = Boolean(
          (typeof wineVisualProfile === 'string' && wineVisualProfile.startsWith('wine')) && 
          wineServeState === 'served'
        );
        
        // WINE LIQUID OVERRIDE removed: SERVED_STATE_LOCK_V4 in the physics block is the
        // single source of truth for fill state. A prepended override before the structured
        // prompt creates duplicate semantic content that degrades model determinism.
        // The PHYSICS_FINAL_ANCHOR segment appended last in winePipeline handles recency bias.

        console.log('[WINE SERVED MODE DEBUG]', {
          isProductPlacement,
          visualProfile: wineVisualProfile,
          wineGlassMode: (productStateForWine as any)?.wineGlassMode,
          serveState: wineServeState,
          isWineServedMode,
          generationProductsLength: generationProducts.length,
          hideProductMode
        });
        
        // Always send product image - we'll control reference strength via imageStrength parameter
        const shouldSendProductImage = generationProducts.length > 0 && !hideProductMode;
        
        const identityInlinePart = personIdentityPackage.modelReferenceBase64
          ? {
            inlineData: {
              data: personIdentityPackage.modelReferenceBase64,
              mimeType: personIdentityPackage.modelReferenceMime ?? 'image/png',
            },
            reference: true,
          }
          : null;
        const hasHumanReference = Boolean(identityInlinePart || modelReferenceFile);
        const shouldIncludeHumanImage = personIncluded && (hasHumanReference || !isNaturalUgc);
        const requestParts: any[] = [];
        let humanReferenceAttached = false;
        let productReferencesAttached = 0;
        requestParts.push({ text: finalPrompt });

        // IMPORTANT: attach human/model reference BEFORE product references.
        // Gemini is sensitive to reference ordering; placing the model first improves identity adherence.
        if (shouldIncludeHumanImage) {
          if (identityInlinePart) {
            const sourceMime = String(identityInlinePart.inlineData?.mimeType ?? 'image/png');
            const normalized = await letterboxDataUrlToAspectRatio(
              `data:${sourceMime};base64,${identityInlinePart.inlineData.data}`,
              aspectRatio,
              {
                maxLongEdge: 2048,
                background: '#FFFFFF',
                mimeType: (sourceMime === 'image/jpeg' ? 'image/jpeg' : 'image/png') as 'image/jpeg' | 'image/png',
                quality: 0.96,
              }
            );
            requestParts.push({
              inlineData: { data: normalized.base64, mimeType: normalized.mimeType },
              reference: true,
            });
            humanReferenceAttached = true;
          } else if (modelReferenceFile) {
            const { base64: modelBase64, mimeType: modelMimeType } = await fileToBase64(modelReferenceFile);
            const normalized = await letterboxDataUrlToAspectRatio(
              `data:${modelMimeType};base64,${modelBase64}`,
              aspectRatio,
              {
                maxLongEdge: 2048,
                background: '#FFFFFF',
                mimeType: (modelMimeType === 'image/jpeg' ? 'image/jpeg' : 'image/png') as 'image/jpeg' | 'image/png',
                quality: 0.96,
              }
            );
            requestParts.push({
              inlineData: { data: normalized.base64, mimeType: normalized.mimeType },
              reference: true,
            });
            humanReferenceAttached = true;
          }
        }

        if (shouldSendProductImage) {
          const isMultiProductRequest = generationProducts.length > 1;
          const maxProductRefs = 5;
          const totalReferenceBudget = isStudioEngine ? 3_400_000 : 2_800_000;
          let totalAttachedReferenceBase64 = 0;

          for (const product of generationProducts.slice(0, maxProductRefs)) {
            // Calculate relative height scale for this product
            // Find the tallest product to use as reference (1.0)
            const allHeights = generationProducts.map(p => {
              const heightValue = (p as any).heightValue as number | null | undefined;
              const heightUnit = ((p as any).heightUnit as 'cm' | 'in' | undefined) ?? 'cm';
              if (typeof heightValue !== 'number' || !Number.isFinite(heightValue) || heightValue <= 0) {
                return null;
              }
              const cm = heightUnit === 'in' ? heightValue * 2.54 : heightValue;
              return cm;
            }).filter((h): h is number => h !== null);
            
            const maxHeight = allHeights.length > 0 ? Math.max(...allHeights) : null;
            const currentHeight = (() => {
              const heightValue = (product as any).heightValue as number | null | undefined;
              const heightUnit = ((product as any).heightUnit as 'cm' | 'in' | undefined) ?? 'cm';
              if (typeof heightValue !== 'number' || !Number.isFinite(heightValue) || heightValue <= 0) {
                return null;
              }
              return heightUnit === 'in' ? heightValue * 2.54 : heightValue;
            })();
            
            const relativeHeight = (maxHeight && currentHeight) ? (currentHeight / maxHeight) : 1.0;
            
            console.log(`[GEMINI FIX] Product: ${(product as any).name || 'product'}, Height: ${currentHeight}cm, Relative: ${relativeHeight.toFixed(2)}`);
            
            // GEMINI FIX: Normalize product with light neutral padding
            // Creates a canvas at the target aspect ratio with the product centered
            // Light gray background (#F8F8F8) shows the model the "intended space" to fill with environment
            // Prevents distortion by pre-formatting the reference to the output aspect ratio
            const normalized = await normalizeProductWithTransparentPadding(
              `data:${product.mimeType};base64,${product.base64}`,
              aspectRatio,
              relativeHeight,
              {
                maxLongEdge: isStudioEngine
                  ? (isMultiProductRequest ? 1440 : 2048)
                  : (isMultiProductRequest ? 1024 : 1536),
                mimeType: 'image/jpeg', // JPEG with light background
                quality: 0.96,
              }
            );
            
            let finalReference = normalized;

            // Keep total payload under serverless limits when multiple products are attached.
            if (isMultiProductRequest) {
              finalReference = await maybeDownscaleInlineImage(normalized.base64, normalized.mimeType, {
                maxLongEdge: isStudioEngine ? 1200 : 960,
                maxBase64Length: isStudioEngine ? 450_000 : 320_000,
                quality: 0.86,
              });
            }

            if (isMultiProductRequest && totalAttachedReferenceBase64 + finalReference.base64.length > totalReferenceBudget) {
              console.warn('[UGC PAYLOAD] Skipping product reference to stay within payload budget', {
                productId: product.id,
                currentTotal: totalAttachedReferenceBase64,
                candidateSize: finalReference.base64.length,
                budget: totalReferenceBudget,
              });
              continue;
            }

            requestParts.push({
              inlineData: { data: finalReference.base64, mimeType: finalReference.mimeType },
              reference: true,
            });
            productReferencesAttached += 1;
            totalAttachedReferenceBase64 += finalReference.base64.length;
          }
        }
        const payload = { parts: requestParts };
        if (hasModelReference && !humanReferenceAttached) {
          throw new Error('Model Reference is enabled but no human reference image was attached to the generation payload. Re-upload the model photo and try again.');
        }
        const partsOrder = requestParts.map((part: any, index: number) => {
          if (part?.text) return `${index}:text`;
          const mimeType = String(part?.inlineData?.mimeType || '');
          if (!mimeType) return `${index}:unknown`;
          if (index === 1 && humanReferenceAttached) return `${index}:human(${mimeType})`;
          return `${index}:product(${mimeType})`;
        });
        const payloadLog = {
          isNaturalUgc,
          productImageSent: shouldSendProductImage,
          productImagesAttached: productReferencesAttached,
          humanImageSent: shouldIncludeHumanImage && hasHumanReference,
          humanReferenceAttached,
          partsOrder,
          partsCount: requestParts.length,
        };
        console.log('[UGC PAYLOAD]', payloadLog);
        generationLogId = createGenerationLog({
          scope: runMode === 'validate' ? 'handleGenerateClick:validate' : 'handleGenerateClick',
          sceneType: String((promptOptions as any).sceneType || (options as any).sceneType || ''),
          mode: String(promptOptions.creationMode || options.creationMode || ''),
          aspectRatio,
          promptHash,
          promptPreview: finalPrompt.slice(0, 600),
          prompt: finalPrompt,
          payloadMeta: payloadLog,
          responseMeta: {
            isProductPlacement,
            hasModelReference,
            personIncluded,
            productCount: generationProducts.length,
          },
        });
        // IMPORTANT: preserveReferenceImage=true — bottle must be preserved exactly as reference.
        // This applies to both closed and served mode (served adds a glass but never modifies the bottle).
        const preserveReferenceImage = true;

        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(typeof window !== 'undefined' && window.localStorage.getItem(TRIAL_BYPASS_KEY) === 'code'
              ? { 'x-trial-bypass-code': TRIAL_BYPASS_CODE }
              : {}),
          },
          body: JSON.stringify({
            model: GEMINI_IMAGE_MODEL,
            parts: payload.parts,
            aspectRatio,
            preserveReferenceImage,
            apiKey: resolvedApiKey,
            debugMeta: {
              promptHash,
              sceneType: String((promptOptions as any).sceneType || (options as any).sceneType || ''),
              mode: String(promptOptions.creationMode || options.creationMode || ''),
              aspectRatio,
            },
          }),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          const message =
            response.status === 413
              ? 'Generation failed: too many/too large product references in one request. Try with fewer products or lower-size images.'
              : (typeof data?.error === 'string' ? data.error : 'Generation failed');
          if (generationLogId) {
            updateGenerationLog(generationLogId, {
              status: 'http_error',
              httpStatus: response.status,
              error: message,
              responseMeta: { responseBody: data },
            });
          }
          setImageError(message);
          if (data?.upgrade_required || data?.reason === 'trial_limit') {
            setShowPlanModal(true);
            setPlanNotice('Free trial limit reached. Sign in to remove watermark and continue generating.');
          }
          if ((response.status === 402 || response.status === 403) && remainingCredits <= 0) {
            setShowPlanModal(true);
          }
          return;
        }
        // Prefer imageBase64 for immediate display (avoids cross-origin Firebase CORS issues).
        // imageUrl is still used for gallery persistence and sharing.
        const imageUrl = typeof data?.imageUrl === 'string' ? data.imageUrl : '';
        const imageBase64 = typeof data?.imageBase64 === 'string' ? data.imageBase64 : '';
        const displayUrl = imageBase64
          ? `data:image/png;base64,${imageBase64}`
          : imageUrl;
        if (!displayUrl) {
          throw new Error('Image generation failed or returned no image.');
        }
        if (typeof data?.remaining_credits === 'number') {
          setRemoteCredits(data.remaining_credits);
        }

        // Use base64 data URL for immediate display (no CORS dependency on Firebase).
        // Use Firebase URL for gallery persistence and hi-res pipeline.
        setGeneratedImageUrl(displayUrl);
        setHasFirstGenerationComplete(true);  // Enable Keep Same Person toggle
        
        if (generationLogId) {
          updateGenerationLog(generationLogId, {
            status: 'success',
            responseMeta: {
              remainingCredits: typeof data?.remaining_credits === 'number' ? data.remaining_credits : undefined,
              imageUrl: imageUrl || displayUrl,
            },
          });
        }
        
        try {
          const galleryUserId = String(userEmail || 'guest').trim().toLowerCase() || 'guest';
          void addLocalGalleryEntry({
            userId: galleryUserId,
            imageUrl: imageUrl || displayUrl,
            createdAt: Date.now(),
            plan: resolvedPlanTier,
            aspectRatio,
          });
          void pruneLocalGallery(galleryUserId, 30, 120);
        } catch (e) {
          console.warn('Local gallery save failed', e);
        }
        
        void reportGalleryEntry(imageUrl || displayUrl);
        runHiResPipeline(imageUrl || displayUrl);
        
        if (!isTrialBypassActive) {
          if (shouldTrackLocalCredits) {
            const newCount = creditUsage + creditCost;
            setCreditUsage(newCount);
            if (typeof window !== 'undefined') {
              window.localStorage.setItem(IMAGE_COUNT_KEY, String(newCount));
            }
          }
        }
        // Firebase Storage URLs don't have localStorage quota issues
      } catch (err) {
        console.error(err);
        let errorMessage = '';
        if (err instanceof Error) {
          errorMessage = err.message;
        } else if (typeof err === 'string') {
          errorMessage = err;
        } else {
          try {
            errorMessage = JSON.stringify(err);
          } catch {
            errorMessage = String(err);
          }
        }

        if (errorMessage.includes('Requested entity was not found')) {
          setImageError('Your API Key is invalid. Please select a valid key to continue.');
          handleApiKeyInvalid();
        } else if (errorMessage.toLowerCase().includes('quota')) {
          setImageError("API quota exceeded. Please select a different API key, or check your current key's plan and billing details.");
          handleApiKeyInvalid();
        } else {
          setImageError(errorMessage);
        }
        if (generationLogId) {
          updateGenerationLog(generationLogId, {
            status: 'exception',
            error: errorMessage || 'Unknown generation exception',
          });
        }
      } finally {
        setIsImageLoading(false);
        bundleSelectionRef.current = null;
      }
    },
    [
      isRandomCharacterEnabled,
      randomizeCharacterParameters,
      activeProducts,
      planTier,
      planCreditLimit,
      isTrialLocked,
      productAssets.length,
      setIsImageLoading,
      resetOutputs,
      getImageCreditCost,
      remainingCredits,
      setShowPlanModal,
      setImageError,
      setGeneratedCopy,
      setCopyError,
      constructPrompt,
      personIdentityPackage,
      modelReferenceFile,
      runHiResPipeline,
      publishFreeGallery,
      determineGalleryPlan,
      hasModelReference,
      compositionMode,
      creditUsage,
      isAdmin,
      shouldTrackLocalCredits,
      resolvedPlanTier,
      handleApiKeyInvalid,
      normalizeGeminiModel(GOOGLE_MODEL ?? GEMINI_IMAGE_MODEL),
      setRemoteCredits,
      lifestylePrompt,
      lifestyleStep3Values,
      resolveOutputAspectRatio
    ]
  );

  const handleGenerateEcommerceClick = useCallback(async () => {
    bundleSelectionRef.current = null;
    if (isTrialLocked) {
      setImageError(`You reached the ${currentPlan.label} limit (${planCreditLimit} credits). Upgrade your plan to keep generating scenes.`);
      return;
    }

    const generationProducts = activeProducts;
    if (!generationProducts.length) {
      setImageError("Please upload a product image first.");
      return;
    }
    if (!ecommerceSelectedSlots.length) {
      setImageError('Select at least one Ecommerce slot before generating.');
      return;
    }

    const creditCost = getImageCreditCost(options);
    const projectedCost = creditCost * ecommerceSelectedSlots.length;
    if (!isTrialBypassActive && projectedCost > remainingCredits) {
      setImageError('Not enough credits for these slots. Reduce slots or upgrade your plan.');
      return;
    }

    resetOutputs();
    setGeneratedCopy(null);
    setCopyError(null);
    setIsImageLoading(true);
    setImageError(null);

    try {
      // Ecommerce overlays are a Product Studio feature; build prompts from the ProductStudioStore
      // (not from legacy PromptEngine mapping), so all selected Product Studio options inject.
      const baseProductStateRaw = useProductStudioStore.getState();
      console.log('[PRODUCT STUDIO STATE][ECOM]', baseProductStateRaw);

      // Ecommerce PDP Image Builder: force square canvases for overlays (hard rule).
      const aspectRatio = ECOMMERCE_PDP_ASPECT_RATIO;
      const resolvedApiKey = getActiveApiKeyOrNotify(setImageError);
      if (!resolvedApiKey) {
        return;
      }

      const mapSlotKeyToPdpSlot = (slotKey: EcommerceSlotKey): EcommercePdpSlot => {
        switch (slotKey) {
          case 'WHAT_IS_PRODUCT':
            return 'WHAT_IS_IT';
          case 'WHAT_DOES_IT_DO':
            return 'WHAT_DOES_IT_DO';
          case 'HOW_IT_WORKS_3_STEPS':
            return 'HOW_IT_WORKS';
          case 'RESULTS_TESTIMONIALS':
            return 'RESULTS';
          case 'DIFFERENTIATION':
            return 'DIFFERENTIATION';
          case 'BACK_IT_UP_GUARANTEE':
            return 'GUARANTEE';
          default:
            throw new Error(`Unsupported ecommerce slot: ${slotKey}`);
        }
      };

      let lastUrl: string | null = null;
      for (const slotKey of ecommerceSelectedSlots) {
        const requiredBlankDir = ECOMMERCE_SLOT_REQUIRED_BLANK_SPACE[slotKey] ?? 'right';

        // Locked layout system: only left/right layouts are supported.
        const safeZoneSide = (requiredBlankDir === 'left' ? 'left' : 'right') as EcommercePdpSafeZone['side'];
        const imageSide = (safeZoneSide === 'left' ? 'right' : 'left') as EcommercePdpImageSide;
        const layout: EcommercePdpLayout =
          imageSide === 'left' ? 'image-left-text-right' : 'image-right-text-left';
        const safeZone: EcommercePdpSafeZone = { side: safeZoneSide, widthPercent: 40 };

        const slotProductState: any = {
          ...baseProductStateRaw,
          // NEW ROOT PIPELINE (do not inherit from studio-branding / lifestyle / editorial)
          sceneType: 'ecommerce-pdp',
          mode: 'ecommerce',
          aspectRatio,
          // Force product-only canvas rules
          environmentContext: null,
          selectedProps: [],
          propDensity: 'none',
          creativityLevel: 0,
          handsHolding: false,
          interaction: 'none',
          stateMotion: 'static',
          // Safe-zone layout binding (mandatory)
          ecommercePdp: {
            slot: mapSlotKeyToPdpSlot(slotKey),
            layout,
            imageSide,
            safeZone,
          },
        };

        const jobs = generateProductJobs(slotProductState);
        if (!jobs.length) {
          throw new Error(`No Product Studio jobs generated for slot ${slotKey}.`);
        }
        const finalPrompt = jobs[0].prompt;

        // Ecommerce PDP prompt uses explicit negative rules ("Do NOT include people/hands/..."),
        // so ProductStudio's legacy validator would false-positive on those words.
        // Instead, assert we are NOT accidentally using the old cinematic/editorial/randomized builders.
        const promptGuard = [
          'RANDOMIZATION RULES',
          'High-end editorial',
          'cinematic look',
          'No generic stock look',
          'Lens choice:',
          // PDP base prompt includes "No randomized camera angles." — so only block the old
          // pipeline's positive randomization phrasing.
          'Randomized camera angle:',
          'Randomized distance:',
          'CAMERA: Randomized',
          'studio-branding',
        ];
        for (const fragment of promptGuard) {
          if (finalPrompt.toLowerCase().includes(fragment.toLowerCase())) {
            throw new Error(`[ECOMMERCE PDP BUG] Forbidden fragment detected in prompt: "${fragment}"`);
          }
        }
        if (!finalPrompt.includes(`safeZone = { side: '${safeZone.side}', widthPercent: ${safeZone.widthPercent} }`)) {
          throw new Error('[ECOMMERCE PDP BUG] Safe zone not injected into prompt.');
        }

        console.log('[ECOM SLOT]', slotKey, {
          promptPreview: finalPrompt.slice(0, 240),
          sceneType: slotProductState.sceneType,
          safeZone,
          layout,
          imageSide,
        });

        const productParts: any[] = [];
        // PDP canvases are designed for a single hero product. Use the first selected product as the reference image.
        for (const product of generationProducts.slice(0, 1)) {
          const resized = await maybeDownscaleInlineImage(product.base64, product.mimeType, {
            maxLongEdge: 2048,
            maxBase64Length: 4_000_000,
            quality: 0.96,
          });
          const normalized = await letterboxDataUrlToAspectRatio(
            `data:${resized.mimeType};base64,${resized.base64}`,
            aspectRatio,
            {
              maxLongEdge: 2048,
              background: '#FFFFFF',
              mimeType: (resized.mimeType === 'image/jpeg' ? 'image/jpeg' : 'image/png') as 'image/jpeg' | 'image/png',
              quality: 0.96,
            }
          );
          productParts.push({ inlineData: { data: normalized.base64, mimeType: normalized.mimeType }, reference: true });
        }

        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(typeof window !== 'undefined' && window.localStorage.getItem(TRIAL_BYPASS_KEY) === 'code'
              ? { 'x-trial-bypass-code': TRIAL_BYPASS_CODE }
              : {}),
          },
          body: JSON.stringify({
            model: GEMINI_IMAGE_MODEL,
            parts: [{ text: finalPrompt }, ...productParts],
            aspectRatio,
            // Keep Output Format aspect ratio (do not lock to the uploaded product image dimensions).
            preserveReferenceImage: false,
            apiKey: resolvedApiKey,
          }),
        });

        const responseData = await response.json().catch(() => ({}));
        if (!response.ok) {
          const message = typeof responseData?.error === 'string' ? responseData.error : 'Generation failed';
          setImageError(message);
          if (responseData?.upgrade_required || responseData?.reason === 'trial_limit') {
            setShowPlanModal(true);
            setPlanNotice('Free trial limit reached. Sign in to remove watermark and continue generating.');
          }
          if ((response.status === 402 || response.status === 403) && remainingCredits <= 0) {
            setShowPlanModal(true);
          }
          return;
        }
        if (typeof responseData?.remaining_credits === 'number') {
          setRemoteCredits(responseData.remaining_credits);
        }
        const encodedImage = typeof responseData?.imageBase64 === 'string' ? responseData.imageBase64 : '';
        if (!encodedImage) {
          throw new Error(`Image generation failed for slot ${slotKey}.`);
        }

        const finalUrl = `data:image/png;base64,${encodedImage}`;
        const normalizedOutput = await letterboxDataUrlToAspectRatio(finalUrl, aspectRatio, {
          maxLongEdge: 4096,
          background: null,
          mimeType: 'image/png',
        });
        const outputUrl = `data:${normalizedOutput.mimeType};base64,${normalizedOutput.base64}`;
        lastUrl = outputUrl;
        setEcommerceSlotBaseImages(prev => ({ ...prev, [slotKey]: outputUrl }));
        setEcommerceSlotGenerationMeta(prev => ({
          ...prev,
          [slotKey]: {
            sceneType: 'ecommerce-pdp',
            slot: slotProductState.ecommercePdp.slot,
            layout: slotProductState.ecommercePdp.layout,
            imageSide: slotProductState.ecommercePdp.imageSide,
            safeZone: slotProductState.ecommercePdp.safeZone,
          },
        }));
        setGeneratedImageUrl(outputUrl);
        try {
          const galleryUserId = String(userEmail || 'guest').trim().toLowerCase() || 'guest';
          void addLocalGalleryEntry({
            userId: galleryUserId,
            imageUrl: outputUrl,
            createdAt: Date.now(),
            plan: resolvedPlanTier,
            aspectRatio,
          });
          void pruneLocalGallery(galleryUserId, 30, 120);
        } catch (e) {
          console.warn('Local gallery save failed', e);
        }
        void reportGalleryEntry(outputUrl);
      }

      if (lastUrl) {
        runHiResPipeline(lastUrl);
      }

      if (!isTrialBypassActive) {
        if (shouldTrackLocalCredits) {
          setCreditUsage(prev => {
            const next = prev + projectedCost;
            if (typeof window !== 'undefined') {
              window.localStorage.setItem(IMAGE_COUNT_KEY, String(next));
            }
            return next;
          });
        }
      }
    } catch (err) {
      console.error(err);
      let errorMessage = '';
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      } else {
        try {
          errorMessage = JSON.stringify(err);
        } catch {
          errorMessage = String(err);
        }
      }
      setImageError(errorMessage);
    } finally {
      setIsImageLoading(false);
      bundleSelectionRef.current = null;
    }
  }, [
    activeProducts,
    ecommerceGenerationSettings.reserveBlankSpace,
    ecommerceSelectedSlots,
    getActiveApiKeyOrNotify,
    getImageCreditCost,
    isTrialBypassActive,
    isTrialLocked,
    currentPlan.label,
    planCreditLimit,
    remainingCredits,
    resetOutputs,
    options,
    runHiResPipeline,
    setShowPlanModal,
    reportGalleryEntry,
    isAdmin,
    setRemoteCredits,
    resolvedPlanTier,
  ]);

  const handleGenerateNarrativeSequenceClick = useCallback(async () => {
    if (isTrialLocked) {
      setImageError(`You reached the ${currentPlan.label} limit (${planCreditLimit} credits). Upgrade your plan to keep generating scenes.`);
      return;
    }

    const generationProducts = activeProducts;
    if (!generationProducts.length) {
      setImageError("Please upload a product image first.");
      return;
    }

    const creditCost = getImageCreditCost(options);
    const projectedCost = creditCost * 5; // 5 images in sequence
    if (!isTrialBypassActive && projectedCost > remainingCredits) {
      setImageError('Not enough credits for a 5-image narrative. Reduce slots or upgrade your plan.');
      return;
    }

    resetOutputs();
    setGeneratedCopy(null);
    setCopyError(null);
    setIsGeneratingSequence(true);
    setIsImageLoading(true);
    setImageError(null);

    try {
      const resolvedApiKey = getActiveApiKeyOrNotify(setImageError);
      if (!resolvedApiKey) return;

      const aspectRatio = resolveOutputAspectRatio();
      const productParts: any[] = [];
      for (const product of generationProducts) {
        const resized = await maybeDownscaleInlineImage(product.base64, product.mimeType, {
          maxLongEdge: 2048,
          maxBase64Length: 4_000_000,
          quality: 0.96,
        });
        const normalized = await letterboxDataUrlToAspectRatio(
          `data:${resized.mimeType};base64,${resized.base64}`,
          aspectRatio,
          {
            maxLongEdge: 2048,
            background: '#FFFFFF',
            mimeType: (resized.mimeType === 'image/jpeg' ? 'image/jpeg' : 'image/png') as 'image/jpeg' | 'image/png',
            quality: 0.96,
          }
        );
        productParts.push({ inlineData: { data: normalized.base64, mimeType: normalized.mimeType }, reference: true });
      }

      for (let i = 0; i < 5; i++) {
        // Update store with sequence index
        useProductStudioStore.setState({
          ecommerceSequenceActive: true,
          ecommerceSequenceIndex: i,
          mode: 'studio', // Force studio mode for narrative
        });

        const state = useProductStudioStore.getState();
        const jobs = generateProductJobs(state as any);
        const finalPrompt = jobs[0].prompt;

        console.log(`[ECOM SEQUENCE] Step ${i + 1}/5:`, finalPrompt.slice(0, 200));

        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(typeof window !== 'undefined' && window.localStorage.getItem(TRIAL_BYPASS_KEY) === 'code'
              ? { 'x-trial-bypass-code': TRIAL_BYPASS_CODE }
              : {}),
          },
          body: JSON.stringify({
            model: GEMINI_IMAGE_MODEL,
            parts: [{ text: finalPrompt }, ...productParts],
            aspectRatio,
            preserveReferenceImage: false,
            apiKey: resolvedApiKey,
          }),
        });

        const responseData = await response.json().catch(() => ({}));
        if (!response.ok) {
          if (responseData?.upgrade_required || responseData?.reason === 'trial_limit') {
            setShowPlanModal(true);
            setPlanNotice('Free trial limit reached. Sign in to remove watermark and continue generating.');
          }
          throw new Error(typeof responseData?.error === 'string' ? responseData.error : 'Generation failed');
        }

        if (typeof responseData?.remaining_credits === 'number') {
          setRemoteCredits(responseData.remaining_credits);
        }

        const encodedImage = typeof responseData?.imageBase64 === 'string' ? responseData.imageBase64 : '';
        if (encodedImage) {
          const finalUrl = `data:image/png;base64,${encodedImage}`;
          const normalizedOutput = await letterboxDataUrlToAspectRatio(finalUrl, aspectRatio, {
            maxLongEdge: 4096,
            background: null,
            mimeType: 'image/png',
          });
          const outputUrl = `data:${normalizedOutput.mimeType};base64,${normalizedOutput.base64}`;
          setGeneratedImageUrl(outputUrl);

          const galleryUserId = String(userEmail || 'guest').trim().toLowerCase() || 'guest';
          void addLocalGalleryEntry({
            userId: galleryUserId,
            imageUrl: outputUrl,
            createdAt: Date.now(),
            plan: resolvedPlanTier,
            aspectRatio,
          });
          void reportGalleryEntry(outputUrl);
          if (i === 4) runHiResPipeline(outputUrl);
        }
      }

      if (!isTrialBypassActive && shouldTrackLocalCredits) {
        setCreditUsage(prev => {
          const next = prev + projectedCost;
          if (typeof window !== 'undefined') {
            window.localStorage.setItem(IMAGE_COUNT_KEY, String(next));
          }
          return next;
        });
      }
    } catch (err) {
      console.error(err);
      setImageError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsGeneratingSequence(false);
      setIsImageLoading(false);
      // Reset sequence state in store
      useProductStudioStore.setState({
        ecommerceSequenceActive: false,
        ecommerceSequenceIndex: undefined
      });
    }
  }, [
    activeProducts,
    getActiveApiKeyOrNotify,
    getImageCreditCost,
    isTrialBypassActive,
    isTrialLocked,
    shouldTrackLocalCredits,
    currentPlan.label,
    planCreditLimit,
    remainingCredits,
    resetOutputs,
    options,
    runHiResPipeline,
    reportGalleryEntry,
    setRemoteCredits,
    resolvedPlanTier,
    userEmail,
    resolveOutputAspectRatio
  ]);

  const generateMockup = useCallback(
    (bundleProducts: string[]) => {
      const sanitized = bundleProducts.filter((product): product is ProductId =>
        availableProductIdSet.has(product as ProductId)
      );
      if (sanitized.length) {
        const overrideList = getActiveProductsFromIds(sanitized);
        if (overrideList.length) {
          setActiveProducts(overrideList);
        }
        setLastBundleSelection(sanitized);
        handleGenerateClick(sanitized, overrideList);
        return;
      }
      setPlanNotice('Upload matching product photos for this bundle.');
      handleGenerateClick();
    },
    [handleGenerateClick, availableProductIdSet, getActiveProductsFromIds]
  );

  const applyImageEdit = useCallback(async (prompt: string, editOptions?: { clearManual?: boolean }) => {
    if (!generatedImageUrl) {
      setImageError("Generate an image first.");
      return;
    }
    if (!prompt.trim()) {
      setImageError("Please describe what to edit.");
      return;
    }

    setIsImageLoading(true);
    setImageError(null);

    try {
      if (GEMINI_DISABLED) {
        setImageError('Image editing is disabled while Gemini is off.');
        return;
      }
      const resolvedApiKey = getActiveApiKeyOrNotify(setImageError);
      if (!resolvedApiKey) {
        setIsImageLoading(false);
        return;
      }
      const base64Image = generatedImageUrl.split(',')[1];

      const aspectRatio =
        isProductPlacement ? resolveOutputAspectRatio() : (lastAspectRatioRef.current || options.aspectRatio || '1:1');
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(typeof window !== 'undefined' && window.localStorage.getItem(TRIAL_BYPASS_KEY) === 'code'
            ? { 'x-trial-bypass-code': TRIAL_BYPASS_CODE }
            : {}),
        },
        body: JSON.stringify({
          model: GEMINI_IMAGE_MODEL,
          parts: [
            { inlineData: { data: base64Image, mimeType: 'image/png' } },
            { text: prompt.trim() },
          ],
          aspectRatio,
          preserveReferenceImage: isProductPlacement,
          apiKey: resolvedApiKey,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const message = typeof data?.error === 'string' ? data.error : 'Image edit failed';
        setImageError(message);
        if (data?.upgrade_required || data?.reason === 'trial_limit') {
          setShowPlanModal(true);
          setPlanNotice('Free trial limit reached. Sign in to remove watermark and continue generating.');
        }
        if ((response.status === 402 || response.status === 403) && remainingCredits <= 0) {
          setShowPlanModal(true);
        }
        return;
      }
      if (typeof data?.remaining_credits === 'number') {
        setRemoteCredits(data.remaining_credits);
      }
      const encodedImage = typeof data?.imageBase64 === 'string' ? data.imageBase64 : '';
      if (!encodedImage) {
        throw new Error('Image edit failed or returned no images.');
      }
      const editedUrl = `data:image/png;base64,${encodedImage}`;
      const cleanedEditedUrl = await trimBlackBarsDataUrl(editedUrl, { mimeType: 'image/png', background: null });
      const normalizedOutput = await extendEdgesToAspectRatio(cleanedEditedUrl, aspectRatio, {
        maxLongEdge: 4096,
        mimeType: 'image/png',
      });
      const outputUrl = `data:${normalizedOutput.mimeType};base64,${normalizedOutput.base64}`;
      setGeneratedImageUrl(outputUrl);
      try {
        const galleryUserId = String(userEmail || 'guest').trim().toLowerCase() || 'guest';
        void addLocalGalleryEntry({
          userId: galleryUserId,
          imageUrl: outputUrl,
          createdAt: Date.now(),
          plan: planTier,
          aspectRatio,
        });
        void pruneLocalGallery(galleryUserId, 30, 120);
      } catch (e) {
        console.warn('Local gallery save failed', e);
      }
      void reportGalleryEntry(outputUrl);
      runHiResPipeline(outputUrl);
      if (editOptions?.clearManual) {
        setEditPrompt('');
      }
      return;
    } catch (err) {
      console.error(err);
      let errorMessage = String(err);
      try {
        const errorJson = JSON.parse(errorMessage);
        if (errorJson.error && errorJson.error.message) {
          errorMessage = String(errorJson.error.message);
        }
      } catch {
        // not JSON
      }

      if (errorMessage.includes("Requested entity was not found")) {
        setImageError("Your API Key is invalid. Please select a valid key to continue.");
        handleApiKeyInvalid();
      } else if (errorMessage.toLowerCase().includes("quota")) {
        setImageError("API quota exceeded. Please select a different API key, or check your current key's plan and billing details.");
        handleApiKeyInvalid();
      } else {
        setImageError(errorMessage);
      }
    } finally {
      setIsImageLoading(false);
    }
  }, [
    generatedImageUrl,
    getActiveApiKeyOrNotify,
    handleApiKeyInvalid,
    isProductPlacement,
    options.aspectRatio,
    planTier,
    reportGalleryEntry,
    resolveOutputAspectRatio,
    runHiResPipeline,
    setRemoteCredits,
    setShowPlanModal,
    userEmail,
  ]);

  const handleEditImage = useCallback(async () => {
    await applyImageEdit(editPrompt, { clearManual: true });
  }, [applyImageEdit, editPrompt]);

  const handleGenerateVideo = async () => {
    setVideoError("Video generation is disabled.");
  };


  return (
    <>
      <div className="fixed inset-0 pointer-events-none z-[999999] bg-grain opacity-[0.035]" />
      <OnboardingOverlay
        visible={shouldShowOnboarding}
        currentStep={onboardingStep}
        steps={onboardingStepsMeta}
        onNext={handleOnboardingNext}
        onSkip={skipOnboarding}
      />

      {showGoalWizard && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-gray-50 dark:bg-black px-4">
          <div className="w-full max-w-3xl rounded-3xl border border-gray-200 bg-white/10 p-6 md:p-10 shadow-md shadow-md shadow-indigo-500/20 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-indigo-600">Quick start wizard</p>
                <h3 className="text-2xl md:text-3xl font-semibold text-gray-900 mt-2">Let’s set up your scene</h3>
              </div>
              <button onClick={handleGoalWizardSkip} className="text-sm text-gray-600 hover:text-gray-900">Skip</button>
            </div>
            <p className="text-sm text-gray-600">Step {goalWizardStep} / 3</p>
            {goalWizardStep === 1 && (
              <div className="grid gap-4 md:grid-cols-2">
                {normalizedGoalWizardGoals.map(option => (
                  <button
                    key={option.value}
                    onClick={() => handleGoalWizardSelect('goal', option.value)}
                    className={`rounded-2xl border p-4 text-left transition ${goalWizardData.goal === option.value ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-md shadow-indigo-500/20 scale-105 duration-500' : 'border-gray-200 bg-gray-100 text-gray-600'}`}
                  >
                    <div className="flex items-center gap-1 relative group">
                      <span className="text-lg font-semibold">{option.label}</span>
                      {option.tooltip && (
                        <span className="text-xs text-gray-600 cursor-pointer group-hover:text-gray-900">
                          ⓘ
                          <div className="absolute left-0 top-4 z-50 hidden group-hover:block bg-white text-gray-900 text-xs p-2 rounded-2xl border border-gray-200 shadow-sm w-44">
                            {option.tooltip}
                          </div>
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-2">{cleanDescription(option.description)}</p>
                  </button>
                ))}
              </div>
            )}
            {goalWizardStep === 2 && (
              <div className="grid gap-3 md:grid-cols-3">
                {normalizedGoalVibeOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => handleGoalWizardSelect('vibe', option.value)}
                    className={`rounded-2xl border p-4 text-left transition ${goalWizardData.vibe === option.value ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-md shadow-indigo-500/20 scale-105 duration-500' : 'border-gray-200 bg-gray-100 text-gray-600'}`}
                  >
                    <div className="flex items-center gap-1 relative group">
                      <span className="text-base font-semibold">{option.label}</span>
                      {option.tooltip && (
                        <span className="text-xs text-gray-600 cursor-pointer group-hover:text-gray-900">
                          ⓘ
                          <div className="absolute left-0 top-4 z-50 hidden group-hover:block bg-white text-gray-900 text-xs p-2 rounded-2xl border border-gray-200 shadow-sm w-44">
                            {option.tooltip}
                          </div>
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-2">{cleanDescription(option.description)}</p>
                  </button>
                ))}
              </div>
            )}
            {goalWizardStep === 3 && (
              <div className="grid gap-3 md:grid-cols-2">
                {normalizedCreatorWizardPresets
                  .filter(preset => preset.value !== 'custom')
                  .map(preset => (
                    <button
                      key={preset.value}
                      onClick={() => handleGoalWizardSelect('preset', preset.value)}
                      className={`rounded-2xl border p-4 text-left transition ${goalWizardData.preset === preset.value ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-md shadow-indigo-500/20 scale-105 duration-500' : 'border-gray-200 bg-gray-100 text-gray-600'}`}
                    >
                      <div className="flex items-center gap-1 relative group">
                        <span className="text-base font-semibold">{preset.label}</span>
                        {preset.tooltip && (
                          <span className="text-xs text-gray-600 cursor-pointer group-hover:text-gray-900">
                            ⓘ
                            <div className="absolute left-0 top-4 z-50 hidden group-hover:block bg-white text-gray-900 text-xs p-2 rounded-2xl border border-gray-200 shadow-sm w-44">
                              {preset.tooltip}
                            </div>
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-2">{cleanDescription(preset.description)}</p>
                    </button>
                  ))}
              </div>
            )}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <button onClick={goalWizardStep === 1 ? handleGoalWizardSkip : handleGoalWizardBack} className="text-sm text-gray-600 hover:text-gray-900">
                {goalWizardStep === 1 ? 'Skip wizard' : 'Back'}
              </button>
              {goalWizardStep < 3 ? (
                <button onClick={handleGoalWizardNext} className="rounded-full bg-indigo-600 text-white px-6 py-2 text-sm font-semibold text-white hover:bg-indigo-600 text-white transition">
                  Next
                </button>
              ) : (
                <button onClick={handleGoalWizardComplete} className="rounded-full bg-indigo-600 text-white px-6 py-2 text-sm font-semibold text-white hover:bg-indigo-600 text-white transition">
                  Apply &amp; build
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {showPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
          <div className="w-full max-w-5xl rounded-3xl border border-gray-200 bg-white/95 p-8 md:p-10 space-y-8">
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-indigo-600">Manage plan</p>
                <h3 className="text-3xl font-semibold text-gray-900 mt-2 leading-tight">Choose what fits your launch</h3>
              </div>
              <button onClick={() => { setShowPlanModal(false); setPlanCodeInput(''); setPlanCodeError(null); setPlanNotice(null); }} className="text-sm text-gray-600 hover:text-gray-900">
                Close
              </button>
            </div>

            {planNotice && (
              <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <span>{planNotice}</span>
                  {!userEmail && (
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        type="button"
                        onClick={() => signInWithGoogle()}
                        className="rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-900 hover:border-indigo-600 transition"
                      >
                        Continue with Google
                      </button>
                      <button
                        type="button"
                        onClick={() => { window.location.href = '/login'; }}
                        className="rounded-2xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition"
                      >
                        Get a magic link
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
            <div className="grid gap-5 md:grid-cols-2">
              {Object.entries(PLAN_CONFIG).map(([tier, config]) => (
                <button
                  key={tier}
                  onClick={() => handlePlanTierSelect(tier as PlanTier)}
                  className={`rounded-2xl border p-6 text-left transition-all duration-300 ${planTier === tier
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'border-gray-200 bg-white text-gray-900 hover:border-indigo-600 hover:bg-indigo-50/40'
                    }`}
                >
                  <p className="text-xl font-semibold flex items-center justify-between">
                    <span>{config.label}</span>
                    <span className={`text-base font-semibold ${planTier === tier ? 'text-white' : 'text-indigo-600'}`}>{config.priceLabel}</span>
                  </p>
                  <p className={`text-sm mt-3 leading-relaxed ${planTier === tier ? 'text-indigo-100' : 'text-gray-600'}`}>{config.description}</p>
                  <p className={`text-xs mt-4 font-medium ${planTier === tier ? 'text-white/90' : 'text-gray-600'}`}>
                    {planTier === tier ? 'Current plan' : 'Go to checkout'}
                  </p>
                </button>
              ))}
            </div>
            <div className="space-y-3 text-left pt-2">
              <p className="text-xs uppercase tracking-[0.35em] text-gray-500">Have an upgrade code?</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={planCodeInput}
                  onChange={(e) => {
                    setPlanCodeInput(e.target.value);
                    if (planCodeError) setPlanCodeError(null);
                  }}
                  placeholder="Enter the code from your receipt"
                  className="flex-1 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-500 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
                <button
                  type="button"
                  onClick={handlePlanCodeSubmit}
                  className="rounded-2xl bg-indigo-600 text-white px-6 py-3 text-sm font-semibold hover:bg-indigo-700 transition"
                >
                  Apply
                </button>
              </div>
              {planCodeError && <p className="text-xs text-gray-500">{planCodeError}</p>}
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-black dark:text-white p-4 sm:p-10 lg:p-16 pb-52 sm:pb-40">
        <div className="max-w-7xl mx-auto relative">
          <header className="relative mb-8 sm:mb-20 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col">
              <Logo variant="appHeader" />
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-8 w-full sm:w-auto">
              <button
                type="button"
                onClick={toggleTheme}
                className="h-10 w-10 aspect-square flex-none rounded-full border border-gray-200 bg-white text-gray-600 hover:text-indigo-600 transition flex items-center justify-center shadow-sm overflow-hidden p-0 dark:bg-white/5 dark:border-white/10 dark:text-white/70 dark:hover:text-white dark:backdrop-blur-[20px] dark:backdrop-saturate-[180%]"
                aria-label="Toggle theme"
              >
                <span className="animate-scale-icon flex items-center justify-center">
                  <Moon className="theme-icon-light" size={18} />
                  <Sun className="theme-icon-dark" size={18} />
                </span>
              </button>

              <div className="relative flex w-full max-w-[280px] items-center rounded-full bg-gray-100 p-1 shadow-inner dark:bg-white/10 dark:backdrop-blur-[20px] dark:backdrop-saturate-[180%]">
                <div
                  className={`absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-full bg-white shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] dark:bg-white ${isProductPlacement ? 'translate-x-full' : 'translate-x-0'}`}
                />
                <button
                  type="button"
                  onClick={() => handleOptionChange('contentStyle', 'ugc', 'Mode')}
                  className={`relative z-10 flex-1 px-3 sm:px-6 py-2 rounded-full text-[9px] sm:text-[10px] font-bold tracking-widest transition-colors duration-300 ${!isProductPlacement ? 'text-gray-900' : 'text-gray-500 hover:text-gray-600'} ${!isProductPlacement ? 'dark:text-black' : 'dark:text-white/60 dark:hover:text-white/80'}`}
                >
                  LIFESTYLE
                </button>
                <button
                  type="button"
                  onClick={() => handleOptionChange('contentStyle', 'product', 'Mode')}
                  className={`relative z-10 flex-1 px-3 sm:px-6 py-2 rounded-full text-[9px] sm:text-[10px] font-bold tracking-widest transition-colors duration-300 ${isProductPlacement ? 'text-gray-900' : 'text-gray-500 hover:text-gray-600'} ${isProductPlacement ? 'dark:text-black' : 'dark:text-white/60 dark:hover:text-white/80'}`}
                >
                  STUDIO
                </button>
              </div>
            </div>
          </header>

          <main className="flex flex-col gap-6">
            {(!isSimpleMode && canUseStudioFeatures && isDevBypass) && (
              <div className="rounded-3xl border border-gray-200 bg-white/10 p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.35em] text-indigo-600">Storyboard</p>
                    <p className="text-sm text-gray-600">Queue variations and switch scenes without rebuilding settings.</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <button
                      type="button"
                      onClick={handleAddScene}
                      disabled={storyboardScenes.length >= 4}
                      className="rounded-full border border-gray-200 px-3 py-1 text-gray-600 hover:border-indigo-600 hover:text-gray-900 transition disabled:opacity-40"
                    >
                      + Add scene
                    </button>
                    <button
                      type="button"
                      onClick={handleDuplicateScene}
                      disabled={storyboardScenes.length >= 4}
                      className="rounded-full border border-gray-200 px-3 py-1 text-gray-600 hover:border-indigo-600 hover:text-gray-900 transition disabled:opacity-40"
                    >
                      Duplicate
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  {storyboardScenes.map(scene => (
                    <div
                      key={scene.id}
                      className={`rounded-2xl border px-4 py-3 flex items-center gap-3 ${scene.id === activeSceneId ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-md shadow-indigo-500/20 scale-105 duration-500' : 'border-gray-200 bg-gray-50 text-gray-600'}`}
                    >
                      <button onClick={() => handleSceneSelect(scene.id)} className="font-semibold">
                        {scene.label}
                      </button>
                      {storyboardScenes.length > 1 && (
                        <button
                          onClick={() => handleDeleteScene(scene.id)}
                          className="text-xs text-gray-600 hover:text-gray-900"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex flex-col gap-2 rounded-2xl border border-gray-200 bg-gray-100 p-4 text-xs text-gray-600">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="uppercase tracking-[0.3em] text-indigo-600">Same person</p>
                      <p className="text-gray-600 mt-1">Keep a single creator across every scene automatically.</p>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={isTalentLinkedAcrossScenes}
                        onChange={handleTalentLinkToggle}
                        aria-label="Use the same person in all storyboard scenes"
                      />
                      <div
                        className={`relative h-5 w-10 rounded-full transition ${isTalentLinkedAcrossScenes ? 'bg-indigo-600 text-white' : 'bg-gray-50'
                          }`}
                      >
                        <span
                          className={`absolute left-1 top-1 block h-3 w-3 rounded-full bg-white border border-gray-200 transition ${isTalentLinkedAcrossScenes ? 'translate-x-4' : ''
                            }`}
                        />
                      </div>
                    </label>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Toggle once and any update to this scene’s person instantly syncs to the rest.
                  </p>
                </div>
              </div>
            )}

            <fieldset className="contents">
              <div className="grid gap-6 w-full grid-cols-1 lg:grid-cols-[420px_minmax(620px,1fr)] items-start">
                <div className="flex flex-col gap-6">
                  <div
                    ref={intentRef}
                    className="flex flex-col gap-6 transition-all"
                  >
                    <div className="flex flex-col gap-1">
                      <p className="text-[10px] uppercase tracking-[0.4em] text-indigo-600 font-bold">01 / Input Assets</p>
                    </div>

                    <div className="space-y-6">

                      <div className="bg-white rounded-xl p-8 border border-gray-200 text-center flex flex-col items-center justify-center min-h-[320px] relative transition-all hover:border-indigo-600/30 group dark:bg-white/5 dark:border-white/10 dark:hover:border-white/20 dark:backdrop-blur-[20px] dark:backdrop-saturate-[180%]">
                        <button
                          type="button"
                          onClick={() => {
                            uploaderRef.current?.openFileDialog();
                          }}
                          className="flex flex-col items-center gap-4 text-gray-500 group-hover:text-indigo-600 transition-colors dark:text-white/60 dark:group-hover:text-white"
                        >
                          <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-2xl font-light border border-gray-200 shadow-inner dark:bg-white/5 dark:border-white/10 dark:text-white/70">
                            +
                          </div>
                          <div className="flex flex-col gap-1">
                            <p className="text-xs font-bold tracking-[0.2em] text-gray-900 uppercase dark:text-white">Source Product</p>
                            <p className="text-[10px] text-gray-500 tracking-wider dark:text-white/50">CLICK TO BROWSE (MAX 5)</p>
                          </div>
                        </button>
                      </div>

                      <div className="sr-only" aria-hidden="true">
                        <ImageUploader
                          ref={uploaderRef}
                          onImageUpload={handleImageUpload}
                          uploadedImagePreview={uploadedImagePreview}
                          disabled={!hasSelectedIntent}
                          lockedMessage="Select a mode to start."
                        />
                      </div>

                      {productAssets.length > 0 && (
                        <div className="space-y-3">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <p className="text-xs uppercase tracking-[0.35em] text-gray-500 font-medium">Product gallery</p>
                              <span className="rounded-full bg-gray-100 border border-gray-200 px-2 py-0.5 text-[11px] text-gray-600">
                                {productAssets.length}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={handleLibraryAddClick}
                              className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-1.5 text-[11px] text-gray-700 font-medium hover:border-indigo-600 hover:text-indigo-600 transition"
                            >
                              + Add
                            </button>
                          </div>
                          <div className="flex gap-3 overflow-x-auto py-2 custom-scrollbar">
                            {productAssets.map(asset => {
                              const isActive = activeProducts.some(product => product.id === asset.id);
                              return (
                                <div
                                  key={asset.id}
                                  className={`flex-shrink-0 w-40 rounded-xl p-4 transition-all bg-white border ${isActive ? 'border-gray-200 ring-2 ring-gray-100' : 'border-gray-200 hover:border-gray-300'}`}
                                >
                                  <div className="relative mb-3">
                                    <img
                                      src={asset.previewUrl}
                                      alt={asset.label}
                                      className="h-24 w-full rounded-lg object-contain bg-gray-50"
                                    />
                                    <button
                                      type="button"
                                      onClick={(e) => { e.stopPropagation(); handleProductAssetDelete(asset.id); }}
                                      className="absolute -right-2 -top-2 rounded-full bg-white border border-gray-200 p-0.5 text-[9px] text-gray-400 hover:text-gray-600 hover:border-gray-400 w-5 h-5 flex items-center justify-center transition"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                  <input
                                    type="text"
                                    value={asset.label}
                                    onChange={event => handleProductAssetLabelChange(asset.id, event.target.value)}
                                    className="w-full rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-[11px] text-gray-900 focus:border-indigo-600 focus:outline-none mb-2 text-center placeholder:text-gray-400"
                                    placeholder="Product name"
                                  />
                                  <div className="flex gap-1">
                                    <input
                                      type="number"
                                      min="0"
                                      step="0.1"
                                      value={asset.heightValue ?? ''}
                                      onChange={event => handleProductHeightChange(asset.id, event.target.value)}
                                      className="flex-1 w-full rounded-lg border border-gray-200 bg-white px-2 py-1 text-[10px] text-gray-900 focus:border-indigo-600 focus:outline-none placeholder:text-gray-400"
                                      placeholder="H"
                                    />
                                    <div className="flex items-center gap-0.5">
                                      {(['cm', 'in'] as const).map(unit => (
                                        <button
                                          key={unit}
                                          type="button"
                                          onClick={(e) => { e.stopPropagation(); handleProductHeightUnitChange(asset.id, unit); }}
                                          className={`rounded-lg px-2 py-1 text-[10px] font-medium transition ${asset.heightUnit === unit ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                        >
                                          {unit}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); handleProductAssetSelect(asset.id); }}
                                    className={`w-full flex items-center justify-center rounded-full text-xs font-medium transition-all py-2 mt-3 ${isActive ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-indigo-600 hover:text-indigo-600'}`}
                                  >
                                    {isActive ? 'Active' : 'Use'}
                                  </button>
                                </div>
                              );
                            })}
                            <button
                              type="button"
                              onClick={handleLibraryAddClick}
                              className="flex-shrink-0 w-28 min-h-[180px] rounded-xl bg-gray-50 border-2 border-dashed border-gray-200 p-3 flex flex-col items-center justify-center text-center hover:border-indigo-400 hover:bg-indigo-50 transition"
                            >
                              <span className="text-2xl text-gray-400">+</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {!isProductPlacement && (
                        <details className="border border-gray-200 pt-3 group bg-white p-4 rounded-lg dark:bg-white/5 dark:border-white/10 dark:backdrop-blur-[20px] dark:backdrop-saturate-[180%]">
                          <summary className="cursor-pointer list-none flex items-center justify-between text-[11px] font-bold tracking-[0.2em] text-gray-500 hover:text-indigo-600 transition-colors">
                            <div className="flex items-center gap-3">
                              <span className="p-1.5 rounded-lg bg-gray-100 border border-gray-200 dark:bg-black/20 dark:border-white/10">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                              </span>
                              <div className="flex flex-col">
                                <span className="uppercase flex items-center gap-2">
                                  Model Reference {hasModelReference && <span className="text-success text-[14px]">✓</span>}
                                </span>
                                <span className="text-[9px] font-medium lowercase tracking-normal text-gray-500 group-hover:text-indigo-600">Upload model for exact facial match</span>
                              </div>
                            </div>
                            <span className="text-xs transition-transform group-open:rotate-180">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                            </span>
                          </summary>
                          <div className="mt-4 space-y-4">
                            <ModelReferencePanel
                              onFileSelect={handleModelReferenceUpload}
                              previewUrl={modelReferencePreview}
                              notes={modelReferenceNotes}
                              onNotesChange={setModelReferenceNotes}
                              onClear={handleClearModelReference}
                              lockAccessories={modelReferenceLockAccessories}
                              onLockAccessoriesChange={setModelReferenceLockAccessories}
                              disabled={!hasUploadedProduct}
                              lockedMessage="Upload a source product first to attach a model."
                            />
                          </div>
                        </details>
                      )}
                    </div>
                  </div>

                  <div
                    ref={uploadRef}
                    className="flex flex-col gap-6 transition-all"
                  >
                    <div className="flex flex-col gap-1">
                      <p className="text-[10px] uppercase tracking-[0.4em] text-indigo-600 font-bold">
                        02 / {isProductPlacement ? 'Product Studio' : 'Build Your Character'}
                      </p>
                    </div>
                    {!hasUploadedProduct && (
                      <div className="rounded-lg border border-gray-200 bg-white/70 px-3 py-2 text-[11px] text-gray-500 dark:bg-black/20 dark:border-white/10 dark:text-white/50">
                        Locked until previous step is complete
                      </div>
                    )}
                    <div className={hasUploadedProduct ? '' : 'opacity-50 pointer-events-none select-none'}>
                      <LifestyleStep3
                        key={isProductPlacement ? 'product-step3' : 'ugc-step3'}
                        embedded
                        isProductMode={isProductPlacement}
                        productCount={productAssets.length}
                        onValuesChange={handleLifestyleStep3Change}
                        onCanGenerateChange={() => {
                          // UI-only refactor: generation logic unchanged.
                        }}
                        hasModelReference={hasModelReference}
                        hasFirstGenerationComplete={hasFirstGenerationComplete}
                        ecommerceOverlay={
                          isProductPlacement
                            ? {
                              selectedSlots: ecommerceSelectedSlots,
                              onSelectedSlotsChange: setEcommerceSelectedSlots,
                              slotsConfig: ecommerceSlotsConfig,
                              onSlotsConfigChange: setEcommerceSlotsConfig,
                              slotBaseImages: ecommerceSlotBaseImages,
                              slotGenerationMeta: ecommerceSlotGenerationMeta,
                              settings: ecommerceGenerationSettings,
                              onSettingsChange: setEcommerceGenerationSettings,
                              onGenerateSequence: handleGenerateNarrativeSequenceClick,
                              isGeneratingSequence: isGeneratingSequence,
                            }
                            : undefined
                        }
                      />
                    </div>
                  </div>

                  <div
                    ref={customizeRef}
                    className="flex flex-col gap-6 transition-all"
                  >
                    <div className="flex flex-col gap-1">
                      <p className="text-[10px] uppercase tracking-[0.4em] text-indigo-600 font-bold">
                        03 / Generate
                      </p>
                    </div>
                    {!hasUploadedProduct && !hideProductMode && (
                      <div className="rounded-lg border border-gray-200 bg-white/70 px-3 py-2 text-[11px] text-gray-500 dark:bg-black/20 dark:border-white/10 dark:text-white/50">
                        Locked until previous step is complete
                      </div>
                    )}
                    {(() => {
                      const isGenerateDisabled = isImageLoading || (!hasUploadedProduct && !hideProductMode);
                      const generationRestrictionMessage = (() => {
                        if (!isGenerateDisabled) return '';
                        if (!hasUploadedProduct && !hideProductMode) return 'Upload a source product photo before generating.';
                        if (isImageLoading) return 'Generation is in progress; please wait.';
                        return '';
                      })();
                      return (
                        <div
                          className={`fixed inset-x-0 bottom-0 z-[120] px-3 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] sm:px-6 lg:px-10 transition-all duration-300 ease-out ${isGenerateBarVisible || isImageLoading || (!hasUploadedProduct && !hideProductMode)
                            ? 'opacity-100 translate-y-0'
                            : 'opacity-0 translate-y-6 pointer-events-none'} ${hasUploadedProduct || hideProductMode ? '' : 'opacity-50 pointer-events-none select-none'}`}
                        >
                          <div
                            className="pointer-events-auto mx-auto w-full max-w-4xl rounded-2xl border border-gray-200 bg-white/95 p-2.5 shadow-lg backdrop-blur-md dark:border-white/10 dark:bg-black/45"
                            onMouseEnter={showGenerateBar}
                            onMouseLeave={scheduleGenerateBarAutoHide}
                            onFocusCapture={showGenerateBar}
                            onBlurCapture={scheduleGenerateBarAutoHide}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                if (isProductPlacement && ecommerceSelectedSlots.length > 0) {
                                  handleGenerateEcommerceClick();
                                } else {
                                  handleGenerateClick();
                                }

                                if (typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches) {
                                  resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                }
                              }}
                              disabled={isGenerateDisabled}
                              title={generationRestrictionMessage && isGenerateDisabled ? generationRestrictionMessage : undefined}
                              className="w-full rounded-full bg-indigo-600 py-2.5 text-sm font-semibold tracking-tight text-white transition hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500 dark:disabled:bg-white/10 dark:disabled:text-white/50"
                            >
                              {isImageLoading ? 'Generating...' : 'Generate Mockup'}
                            </button>
                            {generationRestrictionMessage && isGenerateDisabled && (
                              <div className="mt-2 flex items-start gap-2 text-xs text-gray-500">
                                <Info size={14} />
                                <span>{generationRestrictionMessage}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                <div
                  ref={resultRef}
                  className="rounded-xl p-4 transition-all bg-white relative lg:sticky lg:top-4 flex flex-col gap-6 min-h-[360px] sm:min-h-[520px] dark:bg-white/5 dark:backdrop-blur-[20px] dark:backdrop-saturate-[180%]"
                >

                  <GeneratedImage
                    imageUrl={twoKVariant?.url ?? generatedImageUrl}
                    targetAspectRatio={selectedOutputAspectRatio}
                    fourKVariant={fourKVariant}
                    twoKVariant={twoKVariant}
                    isHiResProcessing={isPreparingHiRes}
                    hiResError={hiResError}
                    isImageLoading={isImageLoading}
                    imageError={imageError}
                    onReset={handleReset}
                    isFreeUser={isFreeUser}
                    isAnonymousTrial={isAnonymousTrialMode}
                    downloadCreditConfig={DOWNLOAD_CREDIT_CONFIG}
                    onChargeDownloadCredits={handleDownloadCreditCharge}
                    editPrompt={editPrompt}
                    onEditPromptChange={(e) => setEditPrompt(e.target.value)}
                    onEditImage={handleEditImage}
                    videoPrompt={videoPrompt}
                    onVideoPromptChange={(e) => setVideoPrompt(e.target.value)}
                    onGenerateVideo={handleGenerateVideo}
                    isVideoLoading={isVideoLoading}
                    videoError={videoError}
                    generatedVideoUrl={generatedVideoUrl}
                    hasPlanVideoAccess={hasPlanVideoAccess}
                    planVideoLimit={planVideoLimit}
                    remainingVideos={remainingVideos}
                    planLabel={currentPlan.label}
                    videoAccessCode={videoAccessInput}
                    onVideoAccessCodeChange={handleVideoAccessCodeChange}
                    onVideoAccessSubmit={handleVideoAccessSubmit}
                    videoAccessError={videoAccessError}
                  />
                </div>
              </div>
            </fieldset>
          </main>

          <div className="mt-12 sm:mt-20 border-t border-gray-200 pt-6 sm:pt-8 pb-10 sm:pb-12">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-[10px] font-black tracking-[0.3em] text-gray-500">
                <div className="flex items-center gap-2">
                  <span className="text-indigo-600">L-ENGINE</span> ACTIVE
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-success shadow-sm"></span>
                  SIMULATION STABLE
                </div>
                <div className="text-gray-500 Secondary">
                  READY
                </div>
              </div>

              <div className="flex items-center justify-start sm:justify-end gap-6">
                <Link
                  to="/dashboard"
                  className="text-[10px] font-black tracking-[0.3em] text-indigo-600 hover:text-indigo-600 transition"
                >
                  MY ACCOUNT
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div >

    </>
  );
};

export default App;
