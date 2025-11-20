

import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { GoogleGenAI, Modality } from "@google/genai";
import { MockupOptions, OptionCategory, Option } from './types';
import { 
  CONTENT_STYLE_OPTIONS,
  PLACEMENT_STYLE_OPTIONS,
  PLACEMENT_CAMERA_OPTIONS,
  LIGHTING_OPTIONS, SETTING_OPTIONS, AGE_GROUP_OPTIONS, CAMERA_OPTIONS, 
  PERSPECTIVE_OPTIONS, SELFIE_TYPE_OPTIONS, ETHNICITY_OPTIONS,
  GENDER_OPTIONS, ASPECT_RATIO_OPTIONS, ENVIRONMENT_ORDER_OPTIONS, PERSON_APPEARANCE_OPTIONS,
  PRODUCT_MATERIAL_OPTIONS, PRODUCT_INTERACTION_OPTIONS, REALISM_OPTIONS,
  PERSON_POSE_OPTIONS, WARDROBE_STYLE_OPTIONS, PERSON_MOOD_OPTIONS,
  PERSON_PROP_OPTIONS, MICRO_LOCATION_OPTIONS, MICRO_LOCATION_NONE_VALUE, PERSON_EXPRESSION_OPTIONS, HAIR_STYLE_OPTIONS,
  CREATOR_PRESETS, PROP_BUNDLES, PRO_LENS_OPTIONS, PRO_LIGHTING_RIG_OPTIONS, PRO_POST_TREATMENT_OPTIONS, PRO_LOOK_PRESETS, PRODUCT_PLANE_OPTIONS, SUPPLEMENT_PHOTO_PRESETS, HERO_PERSON_PRESETS,
  HAIR_COLOR_OPTIONS, EYE_COLOR_OPTIONS, SKIN_TONE_OPTIONS, HeroLandingAlignment, HeroLandingShadowStyle, DOWNLOAD_CREDIT_CONFIG, HIGH_RES_UNAVAILABLE_MESSAGE
} from './constants';
import type { CreatorPreset, DownloadResolution, HeroPosePreset, PropBundle, ProLookPreset, SupplementPhotoPreset } from './constants';
import BundleSelector from './src/bundles/components/BundleSelector';
import CustomBundleBuilder from './src/bundles/components/CustomBundleBuilder';
import RecommendedBundle from './src/bundles/components/RecommendedBundle';
import { ALL_PRODUCT_IDS, PRODUCT_MEDIA_LIBRARY, ProductId, ProductMediaLibrary } from './src/bundles/bundles.config';
import UGCRealModePanel from './components/UGCRealModePanel';
import {
  UGC_CLOTHING_PRESETS,
  UGC_REALITY_PRESETS,
  UGC_HERO_PERSONA_PRESETS,
  UGC_EXPRESSION_PRESETS,
  UGC_OFF_CENTER_OPTIONS,
  UGC_SPONTANEOUS_FRAMING_OPTIONS,
  UGC_REAL_MODE_BASE_PROMPT,
} from './src/data/ugcPresets';

type UGCRealModeSettings = {
  isEnabled: boolean;
  selectedRealityPresetId: string;
  selectedHeroPersonaIds: string[];
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

const createDefaultUGCRealSettings = (): UGCRealModeSettings => ({
  isEnabled: false,
  selectedRealityPresetId: UGC_REALITY_PRESETS[0]?.id ?? '',
  selectedHeroPersonaIds: [],
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
  selectedRealityPresetId: settings?.selectedRealityPresetId ?? UGC_REALITY_PRESETS[0]?.id ?? '',
  selectedHeroPersonaIds: [...(settings?.selectedHeroPersonaIds ?? [])],
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
};

type ProductAsset = {
  id: string;
  label: string;
  file: File;
  previewUrl: string;
  createdAt: number;
  heightValue: number | null;
  heightUnit: 'cm' | 'in';
};

type ImageVariant = {
  url: string;
  width: number;
  height: number;
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

const cloneOptions = (source: MockupOptions): MockupOptions =>
  JSON.parse(JSON.stringify(source));

const getSectionId = (title: string) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

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

const DEFAULT_AGE_GROUP =
  AGE_GROUP_OPTIONS.find(option => option.label === '26-35')?.value ?? AGE_GROUP_OPTIONS[0].value;

const createDefaultOptions = (): MockupOptions => ({
  contentStyle: '',
  placementStyle: PLACEMENT_STYLE_OPTIONS[0].value,
  placementCamera: PLACEMENT_CAMERA_OPTIONS[0].value,
  lighting: LIGHTING_OPTIONS[0].value,
  setting: SETTING_OPTIONS[0].value,
  ageGroup: DEFAULT_AGE_GROUP,
  camera: CAMERA_OPTIONS[0].value,
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
});
import ImageUploader, { ImageUploaderHandle } from './components/ImageUploader';
import GeneratedImage from './components/GeneratedImage';
import VideoGenerator from './components/VideoGenerator';
import Accordion from './components/Accordion';
import ChipSelectGroup from './components/ChipSelectGroup';
import ImageEditor from './components/ImageEditor';
import ModelReferencePanel from './components/ModelReferencePanel';
import MoodReferencePanel from './components/MoodReferencePanel';
import OnboardingOverlay from './components/OnboardingOverlay';

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

const LOCAL_STORAGE_KEY = 'ugc-product-mockup-generator-api-key';
const EMAIL_STORAGE_KEY = 'ugc-product-mockup-generator-user-email';
const IMAGE_COUNT_KEY = 'ugc-product-mockup-generator-credit-count';
const VIDEO_ACCESS_KEY = 'ugc-product-mockup-generator-video-access';
const TRIAL_BYPASS_KEY = 'ugc-product-mockup-trial-bypass';
const DEFAULT_ADMIN_EMAILS = ['juanamisano@gmail.com'];
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

type PlanTier = 'free' | 'creator' | 'studio';

const PLAN_CONFIG: Record<
  PlanTier,
  {
    label: string;
    description: string;
    creditLimit: number;
    allowStudio: boolean;
    allowCaption: boolean;
  }
> = {
  free: {
    label: 'Free',
    description: '10 credits · watermarked exports · community support',
    creditLimit: 10,
    allowStudio: false,
    allowCaption: false,
  },
  creator: {
    label: 'Creator',
    description: '200 credits · no watermark · basic commercial license',
    creditLimit: 200,
    allowStudio: true,
    allowCaption: true,
  },
  studio: {
    label: 'Studio',
    description: '400 credits · priority rendering queue · full commercial license',
    creditLimit: 400,
    allowStudio: true,
    allowCaption: true,
  },
};

const VIDEO_CREDIT_COST = 15;

const PLAN_UNLOCK_CODES: Record<string, PlanTier> = {
  CREATOR15: 'creator',
  CREATOR150: 'creator',
  STUDIO29: 'studio',
  STUDIO290: 'studio',
};

const PERSON_FIELD_KEYS: OptionCategory[] = [
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
] as OptionCategory[];

const applyPersonProfileToOptions = (
  base: MockupOptions,
  profile: Partial<MockupOptions>
): MockupOptions => {
  const updated = { ...base };
  PERSON_FIELD_KEYS.forEach(key => {
    if (profile[key] !== undefined) {
      updated[key] = profile[key] as string;
    }
  });
  return updated;
};

const PRO_FIELD_KEYS: OptionCategory[] = [
  'proLens',
  'proLightingRig',
  'proPostTreatment',
] as OptionCategory[];

const CREATOR_PRESET_OPTIONS: Option[] = CREATOR_PRESETS.map(({ label, value }) => ({
  label,
  value,
}));

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
  const fromVite = import.meta.env.VITE_GEMINI_API_KEY;
  if (fromVite) {
    return fromVite.trim();
  }
  const fromProcess = process.env.API_KEY;
  return fromProcess ? fromProcess.trim() : undefined;
};

const fileToBase64 = (file: File): Promise<{base64: string, mimeType: string}> => {
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

const App: React.FC = () => {
  const location = useLocation();
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
    };
  }
  const [options, setOptions] = useState<MockupOptions>(() => cloneOptions(initialSceneRef.current!.options));
  const [storyboardScenes, setStoryboardScenes] = useState<StoryboardScene[]>(() => [initialSceneRef.current!]);
  const [activeSceneId, setActiveSceneId] = useState<string>(initialSceneRef.current!.id);

  const [uploadedImageFile, setUploadedImageFile] = useState<File | null>(null);
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);
  const [productAssets, setProductAssets] = useState<ProductAsset[]>([]);
  const [activeProductId, setActiveProductId] = useState<string | null>(null);
  const [isMultiProductPackaging, setIsMultiProductPackaging] = useState(false);
  const [modelReferenceFile, setModelReferenceFile] = useState<File | null>(null);
  const [modelReferencePreview, setModelReferencePreview] = useState<string | null>(null);
  const [modelReferenceNotes, setModelReferenceNotes] = useState('');
  const [activeSupplementPreset, setActiveSupplementPreset] = useState('none');
  const [supplementPresetCue, setSupplementPresetCue] = useState<string | null>(null);
  const [supplementBackgroundColor, setSupplementBackgroundColor] = useState('');
  const [supplementAccentColor, setSupplementAccentColor] = useState('');
  const [supplementFlavorNotes, setSupplementFlavorNotes] = useState('');
  const [supplementCustomPrompt, setSupplementCustomPrompt] = useState('');
  const [includeSupplementHand, setIncludeSupplementHand] = useState(false);
  const [activeHeroPosePreset, setActiveHeroPosePreset] = useState('none');
  const [heroPosePromptCue, setHeroPosePromptCue] = useState<string | null>(null);
  const [heroProductAlignment, setHeroProductAlignment] = useState<HeroLandingAlignment>('center');
  const [heroProductScale, setHeroProductScale] = useState(1);
  const [heroShadowStyle, setHeroShadowStyle] = useState<HeroLandingShadowStyle>('softDrop');
  const [ugcRealSettings, setUgcRealSettings] = useState<UGCRealModeSettings>(() => createDefaultUGCRealSettings());
  const [formulationExpertEnabled, setFormulationExpertEnabled] = useState(false);
  const [formulationExpertPreset, setFormulationExpertPreset] = useState(FORMULATION_EXPERT_PRESETS[0].value);
  const [formulationExpertName, setFormulationExpertName] = useState('');
  const [formulationExpertRole, setFormulationExpertRole] = useState(FORMULATION_EXPERT_PRESETS[0].role);
  const [formulationLabStyle, setFormulationLabStyle] = useState(FORMULATION_LAB_OPTIONS[0].value);
  const [formulationExpertProfession, setFormulationExpertProfession] = useState('custom');
  const [activeBundleTab, setActiveBundleTab] = useState<'premade' | 'custom' | 'recommended'>('premade');
  const [recommendedBaseProduct, setRecommendedBaseProduct] = useState<ProductId>(ALL_PRODUCT_IDS[0]);
  const [lastBundleSelection, setLastBundleSelection] = useState<ProductId[] | null>(null);
  const availableProductIds = useMemo<ProductId[]>(
    () => ALL_PRODUCT_IDS.slice(0, Math.min(productAssets.length, ALL_PRODUCT_IDS.length)),
    [productAssets.length]
  );
  const availableProductIdSet = useMemo(() => new Set<ProductId>(availableProductIds), [availableProductIds]);
  const productMediaLibrary = useMemo<ProductMediaLibrary>(() => {
    const dynamic: ProductMediaLibrary = { ...PRODUCT_MEDIA_LIBRARY };
    availableProductIds.forEach((productId, index) => {
      const asset = productAssets[index];
      if (!asset) return;
      dynamic[productId] = {
        label: asset.label || `Product ${index + 1}`,
        imageUrl: asset.previewUrl,
      };
    });
    return dynamic;
  }, [availableProductIds, productAssets]);
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
  const [imageError, setImageError] = useState<string | null>(null);
  const [editPrompt, setEditPrompt] = useState('');
  const [apiKey, setApiKey] = useState<string>(envApiKey ?? '');
  const [manualApiKey, setManualApiKey] = useState('');
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);
  const [isUsingStoredKey, setIsUsingStoredKey] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isGoogleScriptLoaded, setIsGoogleScriptLoaded] = useState(false);
  const [googleAuthError, setGoogleAuthError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginStep, setLoginStep] = useState<'email' | 'code'>('email');
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [isRequestingCode, setIsRequestingCode] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [codeSentTimestamp, setCodeSentTimestamp] = useState<number | null>(null);
  const [creditUsage, setCreditUsage] = useState(0); // tracks credits spent
  const [videoGenerationCount, setVideoGenerationCount] = useState(0);
  const [hasVideoAccess, setHasVideoAccess] = useState(false);
  const [videoAccessInput, setVideoAccessInput] = useState('');
  const [videoAccessError, setVideoAccessError] = useState<string | null>(null);
  const [moodImagePreview, setMoodImagePreview] = useState<string | null>(null);
  const [moodPalette, setMoodPalette] = useState<string[]>([]);
  const [moodSummary, setMoodSummary] = useState<string | null>(null);
  const [moodPromptCue, setMoodPromptCue] = useState<string | null>(null);
  const [isMoodProcessing, setIsMoodProcessing] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [activeTalentPreset, setActiveTalentPreset] = useState('custom');
  const [isProPhotographer, setIsProPhotographer] = useState(false);
  const [activeProPreset, setActiveProPreset] = useState<string>('custom');
  const [savedTalentProfile, setSavedTalentProfile] = useState<Partial<MockupOptions> | null>(null);
  const [talentToast, setTalentToast] = useState<'idle' | 'saved' | 'applied'>('idle');
  const [generatedCopy, setGeneratedCopy] = useState<string | null>(null);
  const [isCopyLoading, setIsCopyLoading] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);
  const [planTier, setPlanTier] = useState<PlanTier>('free');
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [planCodeInput, setPlanCodeInput] = useState('');
  const [planCodeError, setPlanCodeError] = useState<string | null>(null);
  const [planNotice, setPlanNotice] = useState<string | null>(null);
  const [isSimpleMode, setIsSimpleMode] = useState(true);
  const [showGoalWizard, setShowGoalWizard] = useState(false);
  const [goalWizardStep, setGoalWizardStep] = useState(1);
  const [goalWizardData, setGoalWizardData] = useState({
    goal: 'ugc',
    vibe: 'warm',
    preset: 'beauty_creator',
  });
  const [isTalentLinkedAcrossScenes, setIsTalentLinkedAcrossScenes] = useState(false);
  const [linkedTalentProfile, setLinkedTalentProfile] = useState<Partial<MockupOptions> | null>(null);
  const activeProductAsset = useMemo(
    () => productAssets.find(asset => asset.id === activeProductId) ?? null,
    [productAssets, activeProductId]
  );
  const intentRef = useRef<HTMLDivElement>(null);
  const uploadRef = useRef<HTMLDivElement>(null);
  const customizeRef = useRef<HTMLDivElement>(null);
  const trialInputRef = useRef<HTMLInputElement>(null);
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const googleInitRef = useRef(false);
  const uploaderRef = useRef<ImageUploaderHandle | null>(null);
  const isDevBypass = useMemo(() => {
    if (!import.meta.env.DEV) return false;
    const params = new URLSearchParams(location.search);
    return params.has('dev');
  }, [location.search]);
  const isAdmin = useMemo(
    () => ADMIN_EMAILS.includes(userEmail.trim().toLowerCase()),
    [userEmail]
  );
  const isFreeUser = !isAdmin && planTier === 'free';
  const [hasTrialBypass, setHasTrialBypass] = useState(false);
  const [trialCodeInput, setTrialCodeInput] = useState('');
  const [trialCodeError, setTrialCodeError] = useState<string | null>(null);
  const isTrialBypassActive = hasTrialBypass || isDevBypass;
  const hasSelectedIntent = Boolean(options.contentStyle);
  const hasUploadedProduct = Boolean(activeProductAsset);
  const canUseMood = hasUploadedProduct;
  const contentStyleValue = hasSelectedIntent ? options.contentStyle : CONTENT_STYLE_OPTIONS[0].value;
  const isProductPlacement = contentStyleValue === 'product';
  const hasModelReference = Boolean(modelReferenceFile);
  const isPersonOptionsDisabled = isProductPlacement || options.ageGroup === 'no person' || hasModelReference;
  const personControlsDisabled = isPersonOptionsDisabled;
  const personInScene = !isPersonOptionsDisabled;
  const personPropNoneValue = PERSON_PROP_OPTIONS[0].value;
  const microLocationDefault = MICRO_LOCATION_NONE_VALUE;
  const isHeroLandingMode = activeSupplementPreset === HERO_LANDING_PRESET_VALUE;
  const currentPlan = PLAN_CONFIG[planTier];
  const planCreditLimit = currentPlan.creditLimit;
  const planVideoLimit = Math.floor(planCreditLimit / VIDEO_CREDIT_COST);
  const canUseStudioFeatures = currentPlan.allowStudio || isTrialBypassActive;
  const canUseCaptionAssistant = false;
  const remainingCredits = Math.max(planCreditLimit - creditUsage, 0);
  const remainingVideos = Math.max(planVideoLimit - videoGenerationCount, 0);
  const isTrialLocked = !isTrialBypassActive && creditUsage >= planCreditLimit;
  const hasPlanVideoAccess = planVideoLimit > 0 || hasVideoAccess || isTrialBypassActive;
  const isVideoLimitReached = !isTrialBypassActive && planVideoLimit > 0 && videoGenerationCount >= planVideoLimit;
  const showCaptionAssistant = false;
  useEffect(() => {
    if ((!personInScene || isProductPlacement) && ugcRealSettings.isEnabled) {
      persistUgcRealSettings(prev => ({ ...prev, isEnabled: false }));
    }
  }, [personInScene, isProductPlacement, ugcRealSettings.isEnabled, persistUgcRealSettings]);

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
  const [isKeySelected, setIsKeySelected] = useState(Boolean(envApiKey));

  // State to manage which accordion is currently open
  const [openAccordion, setOpenAccordion] = useState<string | null>('Scene & Environment');
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
      order.push('UGC Real Mode');
    }
    return order;
  }, [isProductPlacement]);
  const activePresetMeta = useMemo(() => CREATOR_PRESET_LOOKUP[activeTalentPreset], [activeTalentPreset]);
  const hasSavedTalent = Boolean(savedTalentProfile);
  useEffect(() => {
    if (isProductPlacement && openAccordion === 'Person Details') {
      setOpenAccordion('Product Details');
    }
    if (isProductPlacement && openAccordion === 'UGC Real Mode') {
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

    const storedEmail = window.localStorage.getItem(EMAIL_STORAGE_KEY);
    if (storedEmail) {
      setUserEmail(storedEmail);
      setIsLoggedIn(true);
      setEmailInput(storedEmail);
    }

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

    if (window.localStorage.getItem(TRIAL_BYPASS_KEY) === 'true') {
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
    if (!isAdmin && planTier !== 'free') {
      setPlanTier('free');
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(PLAN_STORAGE_KEY, 'free');
      }
    }
  }, [isAdmin, planTier]);

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
    if (!isPersonOptionsDisabled || activeHeroPosePreset === 'none') {
      return;
    }
    setActiveHeroPosePreset('none');
    setHeroPosePromptCue(null);
  }, [isPersonOptionsDisabled, activeHeroPosePreset]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.localStorage.getItem(ONBOARDING_DISMISSED_KEY) === 'true') {
      setShowOnboarding(false);
    }
  }, []);

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
              options: cloneOptions(options),
              proMode: isProPhotographer,
              supplementPreset: activeSupplementPreset,
              supplementPromptCue: supplementPresetCue,
              supplementBackgroundColor,
              supplementAccentColor,
              supplementFlavorNotes,
              includeSupplementHand,
              heroPosePreset: activeHeroPosePreset,
              heroPosePromptCue,
              supplementCustomPrompt,
              heroProductAlignment,
              heroProductScale,
              heroShadowStyle,
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
    activeHeroPosePreset,
    heroPosePromptCue,
    supplementCustomPrompt,
    heroProductAlignment,
    heroProductScale,
    heroShadowStyle,
    ugcRealSettings,
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
      setOptions(cloneOptions(fallback.options));
      setIsProPhotographer(fallback.proMode);
      setActiveSupplementPreset(fallback.supplementPreset ?? 'none');
      setSupplementPresetCue(fallback.supplementPromptCue ?? null);
      setSupplementBackgroundColor(fallback.supplementBackgroundColor ?? '');
      setSupplementAccentColor(fallback.supplementAccentColor ?? '');
      setSupplementFlavorNotes(fallback.supplementFlavorNotes ?? '');
      setIncludeSupplementHand(fallback.includeSupplementHand ?? false);
      setSupplementCustomPrompt(fallback.supplementCustomPrompt ?? '');
      setActiveHeroPosePreset(fallback.heroPosePreset ?? 'none');
      setHeroPosePromptCue(fallback.heroPosePromptCue ?? null);
      setHeroProductAlignment(fallback.heroProductAlignment ?? 'center');
      setHeroProductScale(fallback.heroProductScale ?? 1);
      setHeroShadowStyle(fallback.heroShadowStyle ?? 'softDrop');
    }
  }, [storyboardScenes, activeSceneId]);

  useEffect(() => {
    setGeneratedCopy(null);
    setCopyError(null);
  }, [generatedImageUrl]);

  useEffect(() => {
    if (activeProductAsset) {
      setUploadedImageFile(activeProductAsset.file);
      setUploadedImagePreview(activeProductAsset.previewUrl);
    } else {
      setUploadedImageFile(null);
      setUploadedImagePreview(null);
      setIsMultiProductPackaging(false);
    }
  }, [activeProductAsset]);

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
    const resolvedKey = apiKey || envApiKey;
    if (!resolvedKey) {
      notify('Please configure your Gemini API key to continue.');
      requireNewApiKey();
      return null;
    }
    return resolvedKey;
  }, [apiKey, envApiKey, requireNewApiKey]);

  const toggleSimpleMode = useCallback(() => {
    setIsSimpleMode(prev => {
      if (prev && !canUseStudioFeatures) {
        setPlanNotice('Upgrade to Creator or Studio to unlock Studio Mode.');
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
              <ChipSelectGroup label="Age Group" options={AGE_GROUP_OPTIONS} selectedValue={options.ageGroup} onChange={(value) => handleOptionChange('ageGroup', value, 'Person Details')} disabled={isProductPlacement} />
              {isProductPlacement && <p className="text-xs text-gray-500">Person options are disabled for product placement shots.</p>}
            <div className={`rounded-2xl border border-white/10 bg-gray-900/40 p-4 space-y-3 ${personControlsDisabled ? 'opacity-50' : ''}`}>
              <ChipSelectGroup label="Creator Preset" options={CREATOR_PRESET_OPTIONS} selectedValue={activeTalentPreset} onChange={(value) => handlePresetSelect(value)} disabled={personControlsDisabled} />
              {activePresetMeta?.description && <p className="text-xs text-gray-400">{activePresetMeta.description}</p>}
              <div className="flex flex-wrap gap-2 text-xs">
                <button type="button" onClick={handleSaveTalentProfile} disabled={personControlsDisabled} className="inline-flex items-center rounded-full border border-white/20 px-3 py-1 font-semibold text-white/80 hover:border-indigo-400 hover:text-white transition disabled:opacity-60">
                  Save as My Talent
                </button>
                <button type="button" onClick={handleApplySavedTalent} disabled={personControlsDisabled || !hasSavedTalent} className="inline-flex items-center rounded-full border border-white/20 px-3 py-1 font-semibold text-white/80 hover:border-indigo-400 hover:text-white transition disabled:opacity-60">
                  Apply saved talent
                </button>
              </div>
              {talentToast === 'saved' && <p className="text-xs text-emerald-300">Talent saved for future scenes.</p>}
              {talentToast === 'applied' && <p className="text-xs text-emerald-300">Saved talent applied.</p>}
              <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-3 space-y-2">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-indigo-200">Link talent across scenes</p>
                    <p className="text-xs text-gray-400">Keep this same creator for morning / afternoon / night shots.</p>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center gap-2">
                    <input type="checkbox" className="sr-only" checked={isTalentLinkedAcrossScenes} onChange={handleTalentLinkToggle} disabled={personControlsDisabled} />
                    <div className={`relative h-5 w-10 rounded-full transition ${isTalentLinkedAcrossScenes ? 'bg-indigo-500' : 'bg-gray-700'} ${personControlsDisabled ? 'opacity-50' : ''}`}>
                      <span className={`absolute left-1 top-1 block h-3 w-3 rounded-full bg-white shadow transition ${isTalentLinkedAcrossScenes ? 'translate-x-4' : ''}`} />
                    </div>
                    <span className={`text-xs font-semibold ${isTalentLinkedAcrossScenes ? 'text-indigo-200' : 'text-gray-500'}`}>
                      {isTalentLinkedAcrossScenes ? 'Active' : 'Off'}
                    </span>
                  </label>
                </div>
                {personControlsDisabled && <p className="text-[11px] text-gray-500">Enable people in this scene to sync the talent across your storyboard.</p>}
                {isTalentLinkedAcrossScenes && !personControlsDisabled && (
                  <p className="text-[11px] text-indigo-200">
                    Any tweak you make to the person instantly updates every other scene that still features them.
                  </p>
                )}
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
            <ChipSelectGroup label="Eye Color" options={EYE_COLOR_OPTIONS} selectedValue={options.eyeColor} onChange={(value) => handleOptionChange('eyeColor', value, 'Person Details')} disabled={personControlsDisabled} />
            <ChipSelectGroup label="Selfie Type" options={SELFIE_TYPE_OPTIONS} selectedValue={options.selfieType} onChange={(value) => handleOptionChange('selfieType', value, 'Person Details')} disabled={personControlsDisabled} />
            {!personControlsDisabled && (
              <p className="text-[11px] text-gray-500">
                Tip: selfie styles mimic how the creator is actually holding the phone (mirror, arm-length, low-angle). Choose the angle you want viewers to feel.
              </p>
            )}
            {!personControlsDisabled && !ugcRealSettings.isEnabled && (
              <div className="rounded-2xl border border-white/15 bg-black/30 p-4 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-indigo-200">Hero person presets</p>
                    <p className="text-[11px] text-gray-400">Quickly stage face-frame, offer-to-lens, or grounded lounge poses inspired by modern supplement shoots.</p>
                  </div>
                  <button type="button" onClick={() => handleHeroPosePresetSelect('none')} className={`rounded-full border px-3 py-1 text-[11px] ${activeHeroPosePreset === 'none' ? 'border-white/30 text-gray-200' : 'border-white/15 text-gray-400 hover:border-indigo-400 hover:text-white'}`}>
                    Custom
                  </button>
                </div>
                <div className="space-y-2">
                  {HERO_PERSON_PRESETS.map(preset => (
                    <button key={preset.value} type="button" onClick={() => handleHeroPosePresetSelect(preset.value)} className={`w-full rounded-xl border px-3 py-2 text-left transition ${activeHeroPosePreset === preset.value ? 'border-indigo-400 bg-indigo-500/10 text-white' : 'border-white/15 text-gray-200 hover-border-indigo-400 hover:text-white'}`}>
                      <p className="text-sm font-semibold">{preset.label}</p>
                      <p className="text-[11px] text-gray-400 mt-1">{preset.description}</p>
                    </button>
                  ))}
                </div>
                {activeHeroPosePreset !== 'none' && (
                  <p className="text-[11px] text-indigo-200">Pose + camera notes are baked into the prompt. You can still tweak any field above.</p>
                )}
              </div>
            )}
            {!personControlsDisabled && renderFormulationStoryPanel('ugc')}
            {!personControlsDisabled && (
              <div className="rounded-2xl border border-dashed border-white/20 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-indigo-200 mb-3">Prop bundles</p>
                <div className="flex flex-wrap gap-2">
                  {PROP_BUNDLES.map(bundle => (
                    <button key={bundle.label} type="button" onClick={() => handlePropBundleSelect(bundle.settings)} className="rounded-full border border-white/20 px-3 py-1 text-xs text-white/80 hover:border-indigo-400 hover:text-white transition">
                      {bundle.label}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-gray-400 mt-2">Tap any bundle to pre-fill props, micro-location, and mood.</p>
              </div>
            )}
            <div className="rounded-2xl border border-white/10 bg-gray-900/50 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-indigo-200 mb-2">Talent preview</p>
              <div className="flex flex-wrap gap-2 text-xs text-gray-300">
                <span className="rounded-full bg-white/5 px-3 py-1">{options.gender}</span>
                <span className="rounded-full bg-white/5 px-3 py-1">{options.ageGroup}</span>
                <span className="rounded-full bg-white/5 px-3 py-1">{options.personMood}</span>
                <span className="rounded-full bg-white/5 px-3 py-1">{options.personPose}</span>
                <span className="rounded-full bg-white/5 px-3 py-1">{options.wardrobeStyle}</span>
                <span className="rounded-full bg-white/5 px-3 py-1">{options.skinTone}</span>
                <span className="rounded-full bg-white/5 px-3 py-1">{options.hairColor}</span>
                <span className="rounded-full bg-white/5 px-3 py-1">{options.eyeColor}</span>
              </div>
              <p className="text-[11px] text-gray-400 mt-2">
                {options.personExpression} · {options.hairStyle} · {options.personProps}
              </p>
            </div>
            </div>
          </Accordion>
        </div>
      )}
      {!isProductPlacement && (
        <div id={getSectionId('UGC Real Mode')}>
          <Accordion
            title="UGC Real Mode"
            isOpen={openAccordion === 'UGC Real Mode'}
            onToggle={() => handleToggleAccordion('UGC Real Mode')}
            disabled={personControlsDisabled}
          >
            <UGCRealModePanel
              disabled={personControlsDisabled}
              enabled={ugcRealSettings.isEnabled}
              onToggle={handleUGCRealModeToggle}
              clothingPresets={UGC_CLOTHING_PRESETS}
              selectedClothingPresetIds={ugcRealSettings.selectedClothingPresetIds}
              onToggleClothingPreset={handleClothingPresetToggle}
              onUploadClothing={handleCustomClothesUpload}
              onClearClothing={handleClearCustomClothes}
              clothingPreview={ugcRealSettings.clothingPreview}
              realityPresets={UGC_REALITY_PRESETS}
              selectedRealityPresetId={ugcRealSettings.selectedRealityPresetId}
              onSelectRealityPreset={handleSelectRealityPreset}
              heroPersonaPresets={UGC_HERO_PERSONA_PRESETS}
              selectedHeroPersonaIds={ugcRealSettings.selectedHeroPersonaIds}
              onToggleHeroPersona={handleHeroPersonaToggle}
              expressionPresets={UGC_EXPRESSION_PRESETS}
              selectedExpressionId={ugcRealSettings.selectedExpressionId}
              onSelectExpression={handleUGCExpressionSelect}
              blur={ugcRealSettings.blurAmount}
              grain={ugcRealSettings.grainAmount}
              onBlurChange={handleBlurChange}
              onGrainChange={handleGrainChange}
              lowResolution={ugcRealSettings.lowResolution}
              onLowResolutionToggle={handleLowResolutionToggle}
              imperfectLighting={ugcRealSettings.imperfectLighting}
              onImperfectLightingToggle={handleImperfectLightingToggle}
              offFocus={ugcRealSettings.offFocus}
              onOffFocusToggle={handleOffFocusToggle}
              tiltedPhone={ugcRealSettings.tiltedPhone}
              onTiltedPhoneToggle={handleTiltedPhoneToggle}
              offCenterOptions={UGC_OFF_CENTER_OPTIONS}
              selectedOffCenterId={ugcRealSettings.offCenterId}
              onSelectOffCenter={handleOffCenterSelect}
              framingOptions={UGC_SPONTANEOUS_FRAMING_OPTIONS}
              selectedFramingId={ugcRealSettings.framingId}
              onSelectFraming={handleFramingSelect}
            />
          </Accordion>
        </div>
      )}
    </>
  );

  const renderBundlesSection = () => (
    <div id={getSectionId('Bundles')} className="mt-6">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-4">
        <div className="flex flex-col gap-1">
          <p className="text-xs uppercase tracking-[0.3em] text-indigo-200">Bundles</p>
          <p className="text-sm text-gray-400">Quickly swap between curated packs, your own mix, or AI-recommended combos.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {BUNDLE_TABS.map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveBundleTab(tab.id)}
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                activeBundleTab === tab.id ? 'border-indigo-400 bg-indigo-500/10 text-white' : 'border-white/15 text-gray-300 hover:border-indigo-400 hover:text-white'
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
            visibleProductIds={availableProductIds}
          />
        )}
        {activeBundleTab === 'custom' && (
          <CustomBundleBuilder
            onGenerate={generateMockup}
            productMediaLibrary={productMediaLibrary}
            visibleProductIds={availableProductIds}
          />
        )}
        {activeBundleTab === 'recommended' && (
          <div className="space-y-4">
            {availableProductIds.length === 0 ? (
              <p className="text-xs text-amber-200">Upload at least one product photo to view recommendations.</p>
            ) : (
              <>
                <div className="flex flex-col gap-2">
                  <label className="text-xs uppercase tracking-[0.3em] text-gray-400">Anchor product</label>
                  <select
                    value={recommendedBaseProduct}
                    onChange={event => setRecommendedBaseProduct(event.target.value as ProductId)}
                    className="rounded-lg border border-white/15 bg-gray-900/60 px-3 py-2 text-sm text-white focus:border-indigo-400 focus:outline-none"
                  >
                    {availableProductIds.map(productId => (
                      <option key={productId} value={productId}>
                        {productMediaLibrary[productId]?.label || PRODUCT_MEDIA_LIBRARY[productId].label}
                      </option>
                    ))}
                  </select>
                </div>
                <RecommendedBundle
                  productId={recommendedBaseProduct}
                  onGenerate={generateMockup}
                  productMediaLibrary={productMediaLibrary}
                  visibleProductIds={availableProductIds}
                />
              </>
            )}
          </div>
        )}
        {lastBundleSelection && lastBundleSelection.some(id => availableProductIdSet.has(id)) && (
          <div className="rounded-2xl border border-white/10 bg-gray-900/40 p-3 space-y-2">
            <p className="text-xs uppercase tracking-[0.3em] text-indigo-200">Last bundle sent</p>
            <div className="flex flex-wrap gap-2 text-xs">
              {lastBundleSelection
                .filter(productId => availableProductIdSet.has(productId))
                .map(productId => (
                  <span
                    key={`${productId}-last`}
                    className="rounded-full border border-white/20 px-3 py-1 text-gray-100"
                  >
                    {productMediaLibrary[productId]?.label || PRODUCT_MEDIA_LIBRARY[productId].label}
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
    setOptions(cloneOptions(scene.options));
    setIsProPhotographer(scene.proMode);
    setActiveSupplementPreset(scene.supplementPreset ?? 'none');
    setSupplementPresetCue(scene.supplementPromptCue ?? null);
    setSupplementBackgroundColor(scene.supplementBackgroundColor ?? '');
    setSupplementAccentColor(scene.supplementAccentColor ?? '');
    setSupplementFlavorNotes(scene.supplementFlavorNotes ?? '');
    setIncludeSupplementHand(scene.includeSupplementHand ?? false);
    setSupplementCustomPrompt(scene.supplementCustomPrompt ?? '');
    setActiveHeroPosePreset(scene.heroPosePreset ?? 'none');
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
  }, [storyboardScenes]);

  const handleAddScene = useCallback(() => {
    if (storyboardScenes.length >= 4) return;
    let sceneOptions = cloneOptions(options);
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
      heroPosePreset: activeHeroPosePreset,
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
    activeHeroPosePreset,
    heroPosePromptCue,
    supplementCustomPrompt,
    heroProductAlignment,
    heroProductScale,
    heroShadowStyle,
  ]);

  const handleDuplicateScene = useCallback(() => {
    const scene = storyboardScenes.find(s => s.id === activeSceneId);
    if (!scene || storyboardScenes.length >= 4) return;
    let duplicatedOptions = cloneOptions(scene.options);
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
        setOptions(cloneOptions(nextScene.options));
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
    setOptions(prev => ({ ...prev, ...profile }));
    setSelectedCategories(prev => {
      const next = new Set(prev);
      PERSON_FIELD_KEYS.forEach(key => {
        if (profile[key] !== undefined) {
          next.add(key);
        }
      });
      return next;
    });
  }, [setOptions, setSelectedCategories]);

  const handlePresetSelect = useCallback((value: string) => {
    setActiveTalentPreset(value);
    if (value === 'custom') {
      return;
    }
    const preset = CREATOR_PRESET_LOOKUP[value];
    if (!preset) return;
    applyTalentProfile(preset.settings);
  }, [applyTalentProfile]);

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
    setOptions(prev => ({ ...prev, ...bundleValue }));
    setSelectedCategories(prev => {
      const next = new Set(prev);
      Object.keys(bundleValue).forEach(key => next.add(key as OptionCategory));
      return next;
    });
    setActiveTalentPreset('custom');
  }, []);

const renderFormulationStoryPanel = (context: 'product' | 'ugc') => (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-indigo-200">Formulation story</p>
          <p className="text-xs text-gray-400">
            {context === 'product'
              ? 'Highlight the doctor or researcher behind the formula to build trust.'
              : 'Let your UGC creator double as the doctor/scientist formulating the blend.'}
          </p>
        </div>
        <label className="flex items-center gap-2 text-xs text-gray-400">
          <span>{formulationExpertEnabled ? 'Active' : 'Off'}</span>
          <button
            type="button"
            onClick={() => setFormulationExpertEnabled(prev => !prev)}
            className={`relative h-5 w-10 rounded-full transition ${formulationExpertEnabled ? 'bg-indigo-500' : 'bg-gray-700'}`}
          >
            <span className={`absolute left-1 top-1 block h-3 w-3 rounded-full bg-white shadow transition ${formulationExpertEnabled ? 'translate-x-5' : ''}`} />
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
                className={`rounded-full border px-3 py-1 text-xs transition ${
                  formulationExpertPreset === preset.value
                    ? 'border-amber-300 bg-amber-500/10 text-white'
                    : 'border-white/15 text-gray-300 hover:border-indigo-400 hover:text-white'
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
                className={`rounded-full border px-3 py-1 text-xs transition ${
                  formulationExpertProfession === option.value
                    ? 'border-amber-300 bg-amber-500/10 text-white'
                    : 'border-white/15 text-gray-300 hover:border-indigo-400 hover:text-white'
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
                className="rounded-md border border-white/10 bg-black/20 px-2 py-1 text-sm text-white focus:border-indigo-400 focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs uppercase tracking-widest text-gray-500">Role / credentials</label>
              <input
                type="text"
                value={formulationExpertRole}
                onChange={event => setFormulationExpertRole(event.target.value)}
                placeholder="e.g., pulmonologist & lead formulator"
                className="rounded-md border border-white/10 bg-black/20 px-2 py-1 text-sm text-white focus:border-indigo-400 focus:outline-none"
              />
            </div>
          </div>
          <ChipSelectGroup
            label="Lab vibe"
            options={FORMULATION_LAB_OPTIONS}
            selectedValue={formulationLabStyle}
            onChange={value => setFormulationLabStyle(value)}
          />
          <p className="text-[11px] text-gray-400">We’ll mention their research, lab setup, and why the formula feels trustworthy. Ensure this expert looks like a real human, photographed with natural imperfections.</p>
        </div>
      )}
    </div>
  );

  const handleUGCRealModeToggle = useCallback(
    (value: boolean) => {
      persistUgcRealSettings(prev => ({ ...prev, isEnabled: value }));
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
    (file: File) => {
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

  const handleSelectRealityPreset = useCallback(
    (id: string) => {
      persistUgcRealSettings(prev => ({ ...prev, selectedRealityPresetId: id }));
    },
    [persistUgcRealSettings]
  );

  const handleHeroPersonaToggle = useCallback(
    (id: string) => {
      persistUgcRealSettings(prev => {
        const exists = prev.selectedHeroPersonaIds.includes(id);
        const nextIds = exists
          ? prev.selectedHeroPersonaIds.filter(item => item !== id)
          : [...prev.selectedHeroPersonaIds, id];
        return { ...prev, selectedHeroPersonaIds: nextIds };
      });
    },
    [persistUgcRealSettings]
  );

  const handleUGCExpressionSelect = useCallback(
    (id: string | null) => {
      persistUgcRealSettings(prev => ({ ...prev, selectedExpressionId: id }));
    },
    [persistUgcRealSettings]
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
    const [, base64Data = ''] = sourceUrl.split(',');
    const mimeMatch = sourceUrl.match(/^data:(.*?);base64,/);
    const mimeType = mimeMatch?.[1] ?? 'image/png';
    try {
      const response = await fetch('/api/upscale-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64Data, mimeType }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.imageBase64) {
        throw new Error(data?.error || 'Could not reach the super-resolution service.');
      }
      const upscaleUrl = `data:${data.mimeType || 'image/png'};base64,${data.imageBase64}`;
      const fourKImage = await loadImageFromUrl(upscaleUrl);
      setFourKVariant({
        url: upscaleUrl,
        width: fourKImage.naturalWidth,
        height: fourKImage.naturalHeight,
      });
      const twoK = await scaleImageToLongEdge(upscaleUrl, 2048);
      setTwoKVariant(twoK);
    } catch (error) {
      console.error('Super-resolution failed, falling back to local scaling.', error);
      try {
        const fallbackFourK = await scaleImageToLongEdge(sourceUrl, 3840);
        setFourKVariant(fallbackFourK);
        const fallbackTwoK = await scaleImageToLongEdge(fallbackFourK.url, 2048);
        setTwoKVariant(fallbackTwoK);
        setHiResError('Super-resolution service unavailable. Using local upscale.');
      } catch (fallbackError) {
        console.error('Local upscale fallback failed.', fallbackError);
        setHiResError(HIGH_RES_UNAVAILABLE_MESSAGE);
      }
    } finally {
      setIsPreparingHiRes(false);
    }
  }, []);

  const handleDownloadCreditCharge = useCallback(
    (resolution: DownloadResolution): { ok: boolean; message?: string } => {
      if (isTrialBypassActive) {
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
    [isTrialBypassActive, remainingCredits]
  );

  const handleHeroPosePresetSelect = useCallback((value: string) => {
    if (value === 'none') {
      setActiveHeroPosePreset('none');
      setHeroPosePromptCue(null);
      return;
    }
    const preset = HERO_PERSON_PRESET_LOOKUP[value];
    if (!preset) return;
    setActiveHeroPosePreset(value);
    setHeroPosePromptCue(preset.promptCue);
    setOptions(prev => ({ ...prev, ...preset.settings }));
    setSelectedCategories(prev => {
      const next = new Set(prev);
      Object.keys(preset.settings).forEach(key => next.add(key as OptionCategory));
      return next;
    });
    setActiveTalentPreset('custom');
  }, []);
  const handleTalentLinkToggle = useCallback(() => {
    if (isTalentLinkedAcrossScenes) {
      setIsTalentLinkedAcrossScenes(false);
      setLinkedTalentProfile(null);
      return;
    }
    if (isProductPlacement || options.ageGroup === 'no person') {
      return;
    }
    const profile = getTalentProfileFromOptions();
    setLinkedTalentProfile(profile);
    setIsTalentLinkedAcrossScenes(true);
    syncTalentAcrossScenes(profile, activeSceneId);
  }, [
    isTalentLinkedAcrossScenes,
    isProductPlacement,
    options.ageGroup,
    getTalentProfileFromOptions,
    syncTalentAcrossScenes,
    activeSceneId,
  ]);

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
    setOptions(prev => ({ ...prev, ...preset.settings }));
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
  }, [activeSceneId, setOptions, setSelectedCategories]);

  const handlePlanTierSelect = useCallback(
    (tier: PlanTier) => {
      if (!isAdmin && tier !== 'free') {
        setPlanCodeError('Only admins can change plans.');
        return;
      }
      setPlanTier(tier);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(PLAN_STORAGE_KEY, tier);
      }
      if (!PLAN_CONFIG[tier].allowStudio && !isSimpleMode) {
        setIsSimpleMode(true);
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(SIMPLE_MODE_KEY, 'true');
        }
      }
      setPlanNotice(null);
      setPlanCodeInput('');
      setPlanCodeError(null);
      setShowPlanModal(false);
    },
    [isAdmin, isSimpleMode]
  );

  const handlePlanCodeSubmit = useCallback(() => {
    if (!isAdmin) {
      setPlanCodeError('Only admins can apply access codes.');
      return;
    }
    const trimmed = planCodeInput.trim();
    if (!trimmed) {
      setPlanCodeError('Enter the access code provided after checkout.');
      return;
    }
    const tier = PLAN_UNLOCK_CODES[trimmed];
    if (!tier) {
      setPlanCodeError('Invalid code. Please double-check your email receipt.');
      return;
    }
    handlePlanTierSelect(tier);
    setPlanCodeInput('');
    setPlanCodeError(null);
  }, [planCodeInput, handlePlanTierSelect, isAdmin]);

  const handleProPhotographerToggle = useCallback(() => {
    setIsProPhotographer(prev => !prev);
    if (isProPhotographer) {
      setActiveProPreset('custom');
    }
  }, [isProPhotographer]);

  const applyProPreset = useCallback((presetSettings: ProLookPreset['settings']) => {
    setOptions(prev => ({ ...prev, ...presetSettings }));
    setSelectedCategories(prev => {
      const next = new Set(prev);
      Object.keys(presetSettings).forEach(key => next.add(key as OptionCategory));
      return next;
    });
  }, []);

  const handleProPresetSelect = useCallback((value: string) => {
    setActiveProPreset(value);
    if (value === 'custom') return;
    const preset = PRO_LOOK_PRESETS.find(item => item.value === value);
    if (preset) {
      applyProPreset(preset.settings);
    }
  }, [applyProPreset]);

  const buildCopyPrompt = useCallback(
    (sceneOptions: MockupOptions) => {
      const style = sceneOptions.contentStyle === 'product' ? 'product placement' : 'UGC lifestyle';
      return `You are a copywriter for a modern DTC brand. Write one short social caption (max 30 words) describing a ${sceneOptions.productMaterial} product captured as ${style} in a ${sceneOptions.setting} with ${sceneOptions.lighting}. Mention the mood "${sceneOptions.personMood}" and end with a friendly CTA.`;
    },
    []
  );

  const handleGenerateCopy = useCallback(async () => {
    setCopyError(null);
    setIsCopyLoading(true);
    try {
      const resolvedApiKey = getActiveApiKeyOrNotify(message => setCopyError(message));
      if (!resolvedApiKey) {
        setIsCopyLoading(false);
        return;
      }
      const ai = new GoogleGenAI({ apiKey: resolvedApiKey });
      const prompt = buildCopyPrompt(options);
      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: [{ text: prompt }],
      });
      const text =
        response.candidates?.[0]?.content?.parts
          ?.map(part => part.text ?? '')
          .join('')
          .trim() ?? '';
      if (text) {
        setGeneratedCopy(text);
      } else {
        setCopyError('Could not craft a caption. Try again.');
      }
    } catch (error) {
      setCopyError(String(error));
    } finally {
      setIsCopyLoading(false);
    }
  }, [buildCopyPrompt, getActiveApiKeyOrNotify, options]);

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
    setOptions(prev => ({
      ...prev,
      contentStyle: goalWizardData.goal === 'product' ? 'product' : 'ugc',
      setting: vibe.setting,
      lighting: vibe.lighting,
      environmentOrder: vibe.environmentOrder,
    }));
    if (goalWizardData.goal !== 'product' && preset) {
      setActiveTalentPreset(goalWizardData.preset);
      applyTalentProfile(preset.settings);
    } else {
      setActiveTalentPreset('custom');
      setOptions(prev => ({
        ...prev,
        ageGroup: AGE_GROUP_OPTIONS[0].value,
        gender: GENDER_OPTIONS[0].value,
      }));
    }
    handleGoalWizardSkip();
  }, [goalWizardData, applyTalentProfile, handleGoalWizardSkip]);

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
    setOptions(prev => {
      const updated = { ...prev };
      updated.lighting = getOptionValueByLabel(LIGHTING_OPTIONS, suggestion.lightingLabel);
      updated.setting = getOptionValueByLabel(SETTING_OPTIONS, suggestion.settingLabel);
      if (prev.contentStyle === 'product') {
        updated.placementStyle = getOptionValueByLabel(PLACEMENT_STYLE_OPTIONS, suggestion.placementStyleLabel);
        updated.placementCamera = getOptionValueByLabel(PLACEMENT_CAMERA_OPTIONS, suggestion.placementCameraLabel);
      }
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
  }, [options.contentStyle]);

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

  const handleModelReferenceUpload = useCallback((file: File) => {
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
  }, []);

  const handleClearModelReference = useCallback(() => {
    setModelReferenceFile(null);
    setModelReferenceNotes('');
    setModelReferencePreview(prev => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  }, []);

  const resetVerificationFlow = useCallback(() => {
    setLoginStep('email');
    setVerificationCode('');
    setVerificationError(null);
    setIsRequestingCode(false);
    setIsVerifyingCode(false);
    setCodeSentTimestamp(null);
  }, []);

  const completeLogin = useCallback((rawEmail: string) => {
    const trimmed = rawEmail.trim();
    if (!trimmed) return;
    resetVerificationFlow();
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(EMAIL_STORAGE_KEY, trimmed);
    }
    setUserEmail(trimmed);
    setEmailInput(trimmed);
    setIsLoggedIn(true);
    setEmailError(null);
  }, [resetVerificationFlow]);

  const handleEmailChange = useCallback((value: string) => {
    setEmailInput(value);
    if (emailError) {
      setEmailError(null);
    }
    if (loginStep !== 'email') {
      setLoginStep('email');
      setVerificationCode('');
      setVerificationError(null);
    }
  }, [emailError, loginStep]);

  const handleSendVerificationCode = useCallback(async () => {
    const trimmed = emailInput.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      setEmailError('Enter a valid email address to continue.');
      setLoginStep('email');
      return;
    }
    const normalized = trimmed.toLowerCase();
    if (ADMIN_EMAILS.includes(normalized)) {
      completeLogin(trimmed);
      setHasTrialBypass(true);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(TRIAL_BYPASS_KEY, 'true');
      }
      return;
    }
    setEmailInput(trimmed);
    setIsRequestingCode(true);
    setVerificationError(null);
    try {
      const response = await fetch('/api/request-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.error || 'Could not send verification email.');
      }
      setLoginStep('code');
      setCodeSentTimestamp(Date.now());
      setVerificationCode('');
    } catch (error) {
      setVerificationError(error instanceof Error ? error.message : 'Could not send verification email.');
    } finally {
      setIsRequestingCode(false);
    }
  }, [completeLogin, emailInput]);

  const handleVerificationSubmit = useCallback(async () => {
    const trimmed = emailInput.trim();
    if (!trimmed) {
      setLoginStep('email');
      setVerificationError('Re-enter your email to get a verification code.');
      return;
    }
    if (!verificationCode.trim()) {
      setVerificationError('Enter the verification code we sent to your email.');
      return;
    }
    setIsVerifyingCode(true);
    setVerificationError(null);
    try {
      const response = await fetch('/api/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed, code: verificationCode.trim() }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.verified) {
        throw new Error(data?.error || 'Invalid code. Try again.');
      }
      completeLogin(trimmed);
    } catch (error) {
      setVerificationError(error instanceof Error ? error.message : 'Could not verify the code.');
    } finally {
      setIsVerifyingCode(false);
    }
  }, [completeLogin, emailInput, verificationCode]);

  const handleVerificationCodeChange = useCallback((value: string) => {
    const digitsOnly = value.replace(/[^0-9]/g, '').slice(0, 6);
    setVerificationCode(digitsOnly);
    if (verificationError) {
      setVerificationError(null);
    }
  }, [verificationError]);

  const handleEmailSubmit = useCallback(() => {
    if (loginStep === 'code') {
      handleVerificationSubmit();
      return;
    }
    handleSendVerificationCode();
  }, [handleSendVerificationCode, handleVerificationSubmit, loginStep]);

  const handleGoogleCredential = useCallback((credential?: string) => {
    if (!credential) {
      setGoogleAuthError('Google sign-in failed. Please try again.');
      return;
    }
    try {
      const payload = JSON.parse(
        atob(
          credential
            .split('.')[1]
            .replace(/-/g, '+')
            .replace(/_/g, '/')
        )
      );
      const email = typeof payload.email === 'string' ? payload.email : null;
      if (!email) {
        setGoogleAuthError('Google account is missing a public email.');
        return;
      }
      setGoogleAuthError(null);
      completeLogin(email);
    } catch (error) {
      console.error(error);
      setGoogleAuthError('Could not verify Google response. Please try again.');
    }
  }, [completeLogin]);

  const handleBackToEmailLogin = useCallback(() => {
    setLoginStep('email');
    setVerificationCode('');
    setVerificationError(null);
  }, []);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || typeof window === 'undefined') return;
    const scriptId = 'google-identity-services';
    const existing = document.getElementById(scriptId);
    if (existing) {
      setIsGoogleScriptLoaded(true);
      return;
    }
    const script = document.createElement('script');
    script.id = scriptId;
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => setIsGoogleScriptLoaded(true);
    script.onerror = () =>
      setGoogleAuthError('Google Sign-In failed to load. Check your network connection or ad blockers.');
    document.head.appendChild(script);
    return () => {
      script.onload = null;
      script.onerror = null;
    };
  }, []);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !isGoogleScriptLoaded || googleInitRef.current) return;
    const googleId = window.google?.accounts?.id;
    if (!googleId) return;
    googleId.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response: GoogleCredentialResponse) => handleGoogleCredential(response.credential),
    });
    if (googleButtonRef.current) {
      googleButtonRef.current.innerHTML = '';
      googleId.renderButton(googleButtonRef.current, {
        theme: 'outline',
        size: 'large',
        width: 320,
        shape: 'pill',
      });
    }
    googleInitRef.current = true;
  }, [GOOGLE_CLIENT_ID, handleGoogleCredential, isGoogleScriptLoaded]);


  const handleSelectKey = async () => {
    if (typeof window === 'undefined') {
      return;
    }
    const aiStudioInstance = (window as typeof window & { aistudio?: AiStudioApi }).aistudio;
    if (!aiStudioInstance) {
      return;
    }
    await aiStudioInstance.openSelectKey();
    setIsKeySelected(true);
  };

  const handleToggleAccordion = (title: string) => {
    setOpenAccordion(current => (current === title ? null : title));
  };

  const handleOptionChange = (category: OptionCategory, value: string, accordionTitle: string) => {
    const newOptions = { ...options, [category]: value };
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
    if (category === 'ageGroup' && value === 'no person') {
      setActiveTalentPreset('custom');
    }
    if (category === 'contentStyle') {
      advanceOnboardingFromStep(1);
    } else if (stepThreeCategories.has(category)) {
      advanceOnboardingFromStep(3);
    }

    setOptions(newOptions);
    setSelectedCategories(updatedSelectedCategories);
  
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
      ],
    };
    
    let requiredCategories = accordionCategoryMap[accordionTitle];
    if (!requiredCategories) return;
  
    // If 'Person Details' is the current accordion and 'no person' is selected,
    // then only 'ageGroup' is required to advance.
    if (accordionTitle === 'Person Details' && newOptions.ageGroup === 'no person') {
      requiredCategories = ['ageGroup'];
    }
  
    if (PERSON_FIELD_KEYS.includes(category) && activeTalentPreset !== 'custom') {
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
    setOptions(defaultOptions);
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
    setActiveHeroPosePreset('none');
    setHeroPosePromptCue(null);
    setHeroProductAlignment('center');
    setHeroProductScale(1);
    setHeroShadowStyle('softDrop');
  }, [resetOutputs, activeProductAsset]);

  const handleLogout = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(EMAIL_STORAGE_KEY);
      window.localStorage.removeItem(VIDEO_ACCESS_KEY);
    }
    handleReset();
    resetVerificationFlow();
    setUserEmail('');
    setEmailInput('');
    setIsLoggedIn(false);
    setHasVideoAccess(false);
    setVideoAccessInput('');
    setVideoAccessError(null);
    setMoodPalette([]);
    setMoodSummary(null);
      setMoodImagePreview(prev => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
  }, [handleReset, resetVerificationFlow]);

  const handleImageUpload = useCallback(async (files: File[]) => {
    const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

    if (!files.length) return;

    resetOutputs();
    setImageError(null);
    setGeneratedCopy(null);
    setCopyError(null);

    for (const file of files) {
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        setImageError('Unsupported file type. Please upload a PNG, JPEG, or WebP image.');
        continue;
      }

      const finalFile = file;
      const previewUrl = URL.createObjectURL(file);

      const assetId = makeSceneId();
      const assetLabel = `Product ${productAssets.length + 1}`;
      setProductAssets(prev => [
        ...prev,
        {
          id: assetId,
          label: assetLabel,
          file: finalFile,
          previewUrl,
          createdAt: Date.now(),
          heightValue: null,
          heightUnit: 'cm',
        },
      ]);
      setActiveProductId(assetId);
    }
    advanceOnboardingFromStep(2);
  }, [resetOutputs, advanceOnboardingFromStep, productAssets.length]);

  const handleProductAssetSelect = useCallback(
    (assetId: string) => {
      if (assetId === activeProductId) return;
      const asset = productAssets.find(item => item.id === assetId);
      if (!asset) return;
      setActiveProductId(assetId);
      resetOutputs();
    },
    [activeProductId, productAssets, resetOutputs]
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
        const next = prev.filter(asset => asset.id !== assetId);
        setActiveProductId(prevActive => {
          if (prevActive === assetId) {
            return next[0]?.id ?? null;
          }
          return prevActive;
        });
        return next;
      });
      resetOutputs();
    },
    [resetOutputs]
  );
  
  const handleLibraryAddClick = useCallback(() => {
    uploaderRef.current?.openFileDialog();
  }, []);
  
  const constructPrompt = (bundleProductsOverride?: ProductId[] | null): string => {
    const currentStyle = contentStyleValue;
    const isUgcStyle = currentStyle !== 'product';
    const personIncluded = isUgcStyle && options.ageGroup !== 'no person';
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

    const getInteractionDescription = (interaction: string): string => {
      switch (interaction) {
        case 'holding it naturally':
          return 'holding the product naturally and comfortably.';
        case 'using it':
          return 'using the product naturally as intended.';
        case 'showing to camera':
          return 'showing the product close to the camera.';
        case 'unboxing it':
          return 'unboxing the product with excitement.';
        case 'applying it':
          return 'applying the product to their skin or body.';
        case 'placing on surface':
          return 'placing the product carefully on a nearby surface.';
        default:
          return `interacting with the product in a way that is ${interaction}.`;
      }
    };

    const bundleProductsForPrompt = bundleProductsOverride ?? bundleSelectionRef.current;
    let prompt = `Create an ultra-realistic, authentic ${isUgcStyle ? 'UGC lifestyle' : 'product placement'} photo with a ${options.aspectRatio} aspect ratio. `;
    prompt += isUgcStyle
      ? `The shot should feel candid, emotional, and cinematic, as if taken by a real person with a ${options.camera}. Embrace believable imperfections—slight motion blur, a little lens smudge, off-center framing, uneven window light—so it reads as everyday life rather than a polished model shoot. `
      : `The shot should feel refined and advertising-ready, with deliberate staging captured on a ${options.camera}. `;

    if (isHeroLandingMode) {
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
      prompt += `The scene is a ${options.setting}, illuminated by ${options.lighting}. The overall environment has a ${options.environmentOrder} feel. The photo is shot from a ${options.perspective}, embracing the chosen camera style and its natural characteristics. Frame the composition so the product lives in ${options.productPlane}. `;
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
    prompt += `The focus is on the provided product, which has a ${options.productMaterial} finish. Render only a single instance of this product. Never duplicate or mirror it. Use the uploaded product cutout exactly as provided—keep the entire silhouette, every label, and every edge visible with no cropping or re-interpretation. Integrate the real photo seamlessly into the new environment so it looks composited but untouched. Ensure its material, reflections, and shadows are rendered realistically according to the environment. Do not alter the product's design or branding. `;
    if (heightNotes) {
      prompt += `Respect real-world scale: ${heightNotes}. Adjust hands, props, and camera distance so the item visibly matches that measurement.`;
    }
    if (formulationExpertEnabled) {
      const preset = FORMULATION_PRESET_LOOKUP[formulationExpertPreset];
      const expertName = (formulationExpertName || preset?.suggestedName || 'Dr. Ana Ruiz').trim();
      const expertRole = (formulationExpertRole || preset?.role || 'lead formulator').trim();
      const professionLabel = formulationExpertProfession === 'custom'
        ? expertRole
        : (FORMULATION_PROFESSION_LOOKUP[formulationExpertProfession]?.label ?? expertRole);
      prompt += ` Feature ${expertName}, a ${professionLabel}, present in ${formulationLabStyle} beside the hero product.`;
      if (preset?.prompt) {
        prompt += ` ${preset.prompt}`;
      }
      prompt += ' Their face must look photorealistic and human—no CGI, animation, or plastic skin. Keep real pores, imperfect lighting, and shallow depth of field like an editorial portrait.';
      prompt += ' Make it obvious they created the formula based on cited clinical research—include subtle clipboard notes, lab coat details, and a respectful nod to science-backed development.';
    }
    if (realModeActive) {
      prompt += ` ${UGC_REAL_MODE_BASE_PROMPT}.`;
      const realityPreset = UGC_REALITY_PRESETS.find(item => item.id === ugcRealSettings.selectedRealityPresetId);
      if (realityPreset) {
        prompt += ` ${realityPreset.prompt}`;
      }
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
      prompt += ` ${supplementPresetCue}`;
    }
    if (supplementBackgroundColor.trim()) {
      prompt += ` Set the hero backdrop color to ${supplementBackgroundColor}, matching the brand palette.`;
    }
    if (supplementAccentColor.trim()) {
      prompt += ` Add secondary accents or props in ${supplementAccentColor} to create contrast.`;
    }
    if (supplementFlavorNotes.trim()) {
      prompt += ` Include supporting ingredients/props inspired by: ${supplementFlavorNotes.trim()}.`;
    }
    if (includeSupplementHand) {
      prompt += ' Add a cropped human hand interacting with the product in a natural, candid way, with modern nail polish and minimal retouch. The hand must be real (no 3D or mannequin look).';
    }
    if (supplementCustomPrompt.trim()) {
      prompt += ` ${supplementCustomPrompt.trim()}`;
    }
    if (!isUgcStyle) {
      prompt += ` No people should appear in the frame. Style the set like a premium product placement shoot with thoughtful props, surfaces, and depth, highlighting the product as the hero. Use a ${options.placementCamera} approach and style the scene as ${options.placementStyle}. `;
      if (isProPhotographer) {
        prompt += ` Professional setup details: ${options.proLens ?? PRO_LENS_OPTIONS[0].value}, lighting rig ${options.proLightingRig ?? PRO_LIGHTING_RIG_OPTIONS[0].value}, and finishing treatment ${options.proPostTreatment ?? PRO_POST_TREATMENT_OPTIONS[0].value}. `;
      }
    }
    if (options.realism) {
      prompt += ` ${options.realism}`;
    }
    if (moodPromptCue) {
      prompt += ` ${moodPromptCue}`;
    }

    if (personIncluded) {
        const ageNarrative = describeAgeGroup(options.ageGroup, options.gender);
        const poseEmphasizesHands = options.personPose.toLowerCase().includes('hand');
        const isHandCloseUp = options.selfieType === 'close-up shot of a hand holding the product' || poseEmphasizesHands;
        if (hasModelReference) {
          prompt += 'Use the uploaded model reference image as the only on-camera talent. Reproduce their face, hair, skin tone, outfit, and proportions exactly—no replacements, no face swaps, and no invented hairstyles or accessories.';
          if (modelReferenceNotes.trim()) {
            prompt += ` Follow this direction for the model: ${modelReferenceNotes.trim()}.`;
          }
          prompt += ' Keep them as the sole person in frame and do not alter their look beyond the provided note.';
        } else {
          prompt += `The photo features ${ageNarrative}, of ${options.ethnicity} ethnicity, showcasing ${options.personAppearance}. `;
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
        prompt += `They are dressed in ${options.wardrobeStyle}, matching the scene's palette. Their pose is ${options.personPose}, projecting ${options.personMood}. `;
        if (realModeActive) {
          if (ugcRealSettings.selectedClothingPresetIds.length) {
            const clothingText = ugcRealSettings.selectedClothingPresetIds
              .map(id => UGC_CLOTHING_PRESETS.find(item => item.id === id)?.prompt)
              .filter(Boolean)
              .join(' ');
            if (clothingText) {
              prompt += ` ${clothingText}`;
            }
          }
          if (ugcRealSettings.clothingUpload) {
            prompt += ' Match the outfit to the uploaded clothing reference image so fabrics, drape, and color story stay true to reality.';
          }
        }
        prompt += `They have ${options.skinTone}, ${options.eyeColor}, and ${options.hairColor}. `;
        if (expressionOverride) {
          prompt += ` ${expressionOverride.prompt}`;
        } else {
          prompt += `Their facial expression shows ${options.personExpression}. `;
        }
        prompt += `Their hair is styled as ${options.hairStyle}. `;
        }
        if (realModeActive && ugcRealSettings.selectedHeroPersonaIds.length) {
          const personaText = ugcRealSettings.selectedHeroPersonaIds
            .map(id => UGC_HERO_PERSONA_PRESETS.find(item => item.id === id)?.prompt)
            .filter(Boolean)
            .join(' ');
          if (personaText) {
            prompt += ` ${personaText}`;
          }
        }
        if (options.personProps !== personPropNoneValue) {
            prompt += `Add supporting props such as ${options.personProps} to reinforce the lifestyle context. `;
        }
        if (options.microLocation !== microLocationDefault) {
            prompt += `Place them within ${options.microLocation} to ground the scene. `;
        }
        if (isHandCloseUp || selfieMeta?.hideFace || isHandsOnlyPose) {
            prompt += `The shot is a tactile close-up of their hands ${getInteractionDescription(options.productInteraction)} Keep the crop near the torso or closer so attention stays on the product and touch. `;
            if (selfieMeta?.hideFace) {
              prompt += 'Do not show their face—only forearms, hands, and the product should be visible, mimicking a back-camera POV. ';
            }
        } else {
            prompt += `The person is ${getInteractionDescription(options.productInteraction)} Their face and upper body are visible, and the interaction looks unposed and authentic. `;
            if (options.selfieType !== 'none') {
                prompt += `The style is a ${options.selfieType}. `;
            }
        }
        if (selfieMeta) {
          prompt += ` ${selfieMeta.narrative} `;
          if (requiresSplitHands) {
            prompt += 'Keep the smartphone in one hand and the product in the opposite hand so both hero objects stay visible simultaneously, with the phone-holding arm fully extended into frame like a true selfie. ';
          }
        } else if (hasSmartphoneProp) {
          prompt += 'Include a modern smartphone prop in their free hand so it complements but never hides the product. ';
        }
        if (selfieMeta?.hidePhone) {
          prompt += 'Do not render a smartphone anywhere in frame—imply the selfie by the arm extension and body posture only.';
        }
        if (isFlashLighting && !selfieMeta?.hidePhone) {
          prompt += 'Use a bright on-camera flash that reflects on their face (or hands if the face is cropped out) and bounces off the phone, casting crisp, short shadows for that candid flash look. ';
        }
        if (heroPosePromptCue) {
          prompt += ` ${heroPosePromptCue}`;
        }
        if (realModeActive) {
          if (ugcRealSettings.imperfectLighting) {
            prompt += ' Let the lighting stay imperfect with hotspots, hard falloff, and visible shadows on the wall.';
          }
          if (ugcRealSettings.lowResolution) {
            prompt += ' Simulate a low-resolution phone capture with pixel softness and slight chroma noise.';
          }
          if (ugcRealSettings.offFocus) {
            prompt += ' Allow focus to breathe and slip, keeping only part of the face/product tack sharp.';
          }
          if (ugcRealSettings.tiltedPhone) {
            prompt += ' Keep the camera horizon slightly tilted as if the phone was captured quickly.';
          }
          const offCenterPreset = UGC_OFF_CENTER_OPTIONS.find(option => option.id === ugcRealSettings.offCenterId);
          if (offCenterPreset) {
            prompt += ` ${offCenterPreset.prompt}`;
          }
          const framingPreset = UGC_SPONTANEOUS_FRAMING_OPTIONS.find(option => option.id === ugcRealSettings.framingId);
          if (framingPreset) {
            prompt += ` ${framingPreset.prompt}`;
          }
          if (ugcRealSettings.blurAmount > 0 || ugcRealSettings.grainAmount > 0) {
            prompt += ` Add roughly ${ugcRealSettings.blurAmount}% focus blur and ${ugcRealSettings.grainAmount}% grain to mimic raw smartphone texture.`;
          }
        }
    }
    
    prompt += ' Deliver the render at ultra-high fidelity: native 4K resolution (minimum 3840px on the long edge) so it still looks razor sharp when downscaled to 2K for alternate exports.';
    prompt += ` Final image must be high-resolution and free of any watermarks, text, or artificial elements. It should feel like a captured moment, not a staged ad.`;

    return prompt;
  }

  const getImageCreditCost = useCallback(
    (opts: MockupOptions) => {
      if (contentStyleValue === 'product') {
        return 1;
      }
      if (opts.ageGroup === 'no person') {
        return 2;
      }
      return isSimpleMode ? 3 : 4;
    },
    [contentStyleValue, isSimpleMode]
  );

  const handleGenerateClick = async (bundleProducts?: ProductId[]) => {
    bundleSelectionRef.current = bundleProducts ?? null;
    if (isTrialLocked) {
      setImageError(`You reached the ${currentPlan.label} limit (${planCreditLimit} credits). Upgrade your plan to keep generating scenes.`);
      return;
    }
    if (!productAssets.length) {
      setImageError("Please upload a product image first.");
      return;
    }
    const personIncluded = !isProductPlacement && options.ageGroup !== 'no person';
    const realModeActive = ugcRealSettings.isEnabled && !isProductPlacement && personIncluded;
    if (modelReferenceFile && !personIncluded) {
      setImageError('Turn on a person in this scene (UGC Lifestyle + non "No Person" age) before using your model reference.');
      return;
    }

    const creditCost = getImageCreditCost(options);
    if (!isTrialBypassActive && creditCost > remainingCredits) {
      setImageError('Not enough credits for this generation. Upgrade your plan.');
      return;
    }

    resetOutputs();
    setGeneratedCopy(null);
    setCopyError(null);
    setIsImageLoading(true);

    try {
      const resolvedApiKey = getActiveApiKeyOrNotify(setImageError);
      if (!resolvedApiKey) {
        setIsImageLoading(false);
        return;
      }
      const ai = new GoogleGenAI({ apiKey: resolvedApiKey });
      const orderedAssets = productAssets
        .slice()
        .sort((a, b) => {
          if (a.id === activeProductId) return -1;
          if (b.id === activeProductId) return 1;
          return a.createdAt - b.createdAt;
        });
      const productInlineParts = [];
      for (const asset of orderedAssets) {
        const { base64, mimeType } = await fileToBase64(asset.file);
        productInlineParts.push({ inlineData: { data: base64, mimeType } });
      }
      if (modelReferenceFile && personIncluded) {
        const { base64, mimeType } = await fileToBase64(modelReferenceFile);
        productInlineParts.push({ inlineData: { data: base64, mimeType } });
      }
      if (realModeActive && ugcRealSettings.clothingUpload) {
        const { base64, mimeType } = await fileToBase64(ugcRealSettings.clothingUpload);
        productInlineParts.push({ inlineData: { data: base64, mimeType } });
      }
      const finalPrompt = constructPrompt(bundleSelectionRef.current);
      
      const aspectRatio = options?.aspectRatio || '1:1';
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [...productInlineParts, {text: finalPrompt}] },
        config: {
          responseModalities: [Modality.IMAGE],
          imageConfig: {
            aspectRatio,
          },
        },
      });

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const finalUrl = `data:image/png;base64,${part.inlineData.data}`;
          setGeneratedImageUrl(finalUrl);
          runHiResPipeline(finalUrl);
          const newCount = creditUsage + creditCost;
          setCreditUsage(newCount);
          if (typeof window !== 'undefined') {
            window.localStorage.setItem(IMAGE_COUNT_KEY, String(newCount));
          }
          return; // Exit after finding the image
        }
      }

      throw new Error("Image generation failed or returned no images.");
    } catch (err) {
      console.error(err);
      // Fix: Safely convert unknown error type to string.
      let errorMessage = String(err);
      try {
        const errorJson = JSON.parse(errorMessage);
        if (errorJson.error && errorJson.error.message) {
            errorMessage = String(errorJson.error.message);
        }
      } catch (parseError) {
        // Not a JSON string, use original message
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
      bundleSelectionRef.current = null;
    }
  };

  const generateMockup = useCallback(
    (bundleProducts: string[]) => {
      const sanitized = bundleProducts.filter((product): product is ProductId =>
        availableProductIdSet.has(product as ProductId)
      );
      if (sanitized.length) {
        setLastBundleSelection(sanitized);
        handleGenerateClick(sanitized);
        return;
      }
      setPlanNotice('Upload matching product photos for this bundle.');
      handleGenerateClick();
    },
    [handleGenerateClick, availableProductIdSet]
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
      const resolvedApiKey = getActiveApiKeyOrNotify(setImageError);
      if (!resolvedApiKey) {
        setIsImageLoading(false);
        return;
      }
      const ai = new GoogleGenAI({ apiKey: resolvedApiKey });
      const base64Image = generatedImageUrl.split(',')[1];

      const aspectRatio = options?.aspectRatio || '1:1';
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { inlineData: { data: base64Image, mimeType: 'image/png' } },
            { text: prompt.trim() },
          ],
        },
        config: {
          responseModalities: [Modality.IMAGE],
          imageConfig: {
            aspectRatio,
          },
        },
      });

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const editedUrl = `data:image/png;base64,${part.inlineData.data}`;
          setGeneratedImageUrl(editedUrl);
          runHiResPipeline(editedUrl);
          if (editOptions?.clearManual) {
            setEditPrompt('');
          }
          return;
        }
      }

      throw new Error("Image edit failed or returned no images.");
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
  }, [generatedImageUrl, getActiveApiKeyOrNotify, handleApiKeyInvalid, runHiResPipeline, options.aspectRatio]);

  const handleEditImage = useCallback(async () => {
    await applyImageEdit(editPrompt, { clearManual: true });
  }, [applyImageEdit, editPrompt]);

  const handleGenerateVideo = async () => {
    if (!hasPlanVideoAccess) {
        setVideoError("Your current plan does not include video generation. Upgrade to Creator or Studio to unlock this feature.");
        return;
    }
    if (!generatedImageUrl) {
        setVideoError("An image must be generated first.");
        return;
    }
    if (!isTrialBypassActive && planVideoLimit > 0 && !hasVideoAccess && isVideoLimitReached) {
        setVideoError("You reached your video credit limit. Upgrade your plan for more exports.");
        return;
    }
    
    const videoCost = VIDEO_CREDIT_COST;
    if (!isTrialBypassActive && videoCost > remainingCredits) {
      setVideoError("Not enough credits for video generation.");
      return;
    }

    setIsVideoLoading(true);
    setVideoError(null);
    setGeneratedVideoUrl(null);

    try {
      const resolvedApiKey = getActiveApiKeyOrNotify(message => setVideoError(message));
      if (!resolvedApiKey) {
        setIsVideoLoading(false);
        return;
      }
      const ai = new GoogleGenAI({ apiKey: resolvedApiKey });
      const base64Image = generatedImageUrl.split(',')[1];

      const getVideoAspectRatio = (): '16:9' | '9:16' => {
        if (options.aspectRatio === '1:1') return '9:16'; // VEO doesn't support 1:1, default to vertical
        return options.aspectRatio as '16:9' | '9:16';
      };

      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: videoPrompt,
        image: {
          imageBytes: base64Image,
          mimeType: 'image/png',
        },
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: getVideoAspectRatio(),
        }
      });
      
      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({operation: operation});
      }

      if (operation.error) {
        throw new Error(operation.error.message || 'Video generation failed with an unknown error.');
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        const response = await fetch(`${downloadLink}&key=${resolvedApiKey}`);
        const blob = await response.blob();
        setGeneratedVideoUrl(URL.createObjectURL(blob));
        if (!isTrialBypassActive) {
          setCreditUsage(count => {
            const next = count + videoCost;
            if (typeof window !== 'undefined') {
              window.localStorage.setItem(IMAGE_COUNT_KEY, String(next));
            }
            return next;
          });
        }
        if (!isTrialBypassActive && planVideoLimit > 0 && !hasVideoAccess) {
          setVideoGenerationCount(count => count + 1);
        }
      } else {
        throw new Error("Video generation completed but no download link was provided.");
      }

    } catch (err) {
        console.error(err);
        let errorMessage = err instanceof Error ? err.message : String(err);

        try {
            const errorJson = JSON.parse(errorMessage);
            if (errorJson.error && errorJson.error.message) {
                errorMessage = String(errorJson.error.message);
            }
        } catch (parseError) {
            // ignore
        }
        
        if (errorMessage.includes("Requested entity was not found")) {
            setVideoError("Your API Key is invalid. Please select a valid key to continue.");
            handleApiKeyInvalid();
        } else if (errorMessage.toLowerCase().includes("quota")) {
            setVideoError("API quota exceeded. Please select a different API key, or check your current key's plan and billing details.");
            handleApiKeyInvalid();
        } else {
            setVideoError(errorMessage);
        }
    } finally {
        setIsVideoLoading(false);
    }
  };
 

  const renderLoginScreen = () => (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-gray-900/70 border border-gray-800 rounded-2xl p-8 text-center shadow-2xl space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-indigo-300 mb-2">Access Required</p>
          <h1 className="text-3xl font-bold">Log in to continue</h1>
          <p className="mt-3 text-sm text-gray-400">
            Enter your work email so we can enforce plan limits and send occasional product updates.
          </p>
        </div>
        {GOOGLE_CLIENT_ID ? (
          <>
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-widest text-gray-500">Sign in with Google</p>
              <div className="flex justify-center">
                <div ref={googleButtonRef} className="inline-flex justify-center" />
              </div>
              {!isGoogleScriptLoaded && (
                <p className="text-xs text-gray-500 text-center">Loading Google Sign-In…</p>
              )}
            </div>
            <div className="flex items-center gap-2 text-gray-600 text-xs">
              <span className="flex-1 border-t border-white/10" />
              <span>or continue with email</span>
              <span className="flex-1 border-t border-white/10" />
            </div>
          </>
        ) : (
          <p className="text-xs text-gray-500">
            Add <code className="text-[11px] bg-black/30 px-1 rounded">VITE_GOOGLE_CLIENT_ID</code> to enable Google sign-in.
          </p>
        )}
        <div className="space-y-4 text-left w-full">
          {loginStep === 'email' ? (
            <>
              <label className="text-xs uppercase tracking-widest text-gray-500">Work email</label>
              <input
                type="email"
                placeholder="you@company.com"
                value={emailInput}
                onChange={(event) => handleEmailChange(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    handleEmailSubmit();
                  }
                }}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              {emailError && <p className="text-sm text-red-400">{emailError}</p>}
              {googleAuthError && <p className="text-sm text-red-400">{googleAuthError}</p>}
              <button
                onClick={handleEmailSubmit}
                disabled={isRequestingCode}
                className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-900/60 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out shadow-lg"
              >
                {isRequestingCode ? 'Sending code…' : 'Send verification code'}
              </button>
            </>
          ) : (
            <>
              <div className="text-sm text-gray-400 space-y-1">
                <p>We sent a 6-digit code to <span className="text-white">{emailInput}</span>.</p>
                <button
                  type="button"
                  onClick={handleBackToEmailLogin}
                  className="text-xs text-indigo-300 hover:text-indigo-200 underline"
                >
                  Change email
                </button>
              </div>
              <label className="text-xs uppercase tracking-widest text-gray-500">Verification code</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="123456"
                value={verificationCode}
                onChange={(event) => handleVerificationCodeChange(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    handleEmailSubmit();
                  }
                }}
                className="w-full tracking-[0.5em] text-center text-2xl rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              {verificationError && <p className="text-sm text-red-400">{verificationError}</p>}
              {!verificationError && codeSentTimestamp && (
                <p className="text-xs text-gray-500">
                  Code sent {new Date(codeSentTimestamp).toLocaleTimeString()}. Check your inbox (and spam) for the email.
                </p>
              )}
              <button
                onClick={handleEmailSubmit}
                disabled={isVerifyingCode || verificationCode.length < 4}
                className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-900/60 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out shadow-lg"
              >
                {isVerifyingCode ? 'Verifying…' : 'Verify code'}
              </button>
              <button
                type="button"
                onClick={handleSendVerificationCode}
                disabled={isRequestingCode}
                className="w-full rounded-full border border-white/20 px-4 py-2 text-sm text-gray-200 hover:border-indigo-400 hover:text-white transition disabled:opacity-50"
              >
                {isRequestingCode ? 'Sending…' : 'Resend code'}
              </button>
            </>
          )}
        </div>
        <p className="text-xs text-gray-500 text-center">
          By logging in you agree to receive product emails. Unsubscribe anytime.
        </p>
      </div>
    </div>
  );

  const renderApiKeyScreen = () => (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-gray-900/70 border border-gray-800 rounded-2xl p-8 text-center shadow-2xl space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-indigo-300 mb-2">Connect Gemini API</p>
          <h1 className="text-3xl font-bold">Bring your API key</h1>
          <p className="mt-3 text-sm text-gray-400">
            Paste a Gemini API key to run generations locally. You can also select one from AI Studio if available.
          </p>
        </div>
        {isAiStudioAvailable && (
          <button
            onClick={handleSelectKey}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-lg"
          >
            Select API Key from AI Studio
          </button>
        )}
        <div className="space-y-3 text-left">
          <label className="text-xs uppercase tracking-widest text-gray-500">Gemini API key</label>
          <input
            type="password"
            placeholder="AI... or ya29..."
            value={manualApiKey}
            onChange={(event) => handleManualApiKeyChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                handleManualApiKeySubmit();
              }
            }}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          {apiKeyError && <p className="text-sm text-red-400">{apiKeyError}</p>}
        </div>
        <button
          onClick={handleManualApiKeySubmit}
          disabled={!manualApiKey.trim()}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-900/40 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out shadow-lg"
        >
          Save API Key
        </button>
        <p className="text-xs text-gray-500">
          Keys are stored locally in this browser only. Review{' '}
          <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="text-indigo-300 underline">
            Gemini API billing
          </a>.
        </p>
      </div>
    </div>
  );


  if (!isLoggedIn) {
    return renderLoginScreen();
  }

  if (!isKeySelected) {
    return renderApiKeyScreen();
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto relative">
        {isTrialLocked && (
          <div className="fixed inset-0 z-40 flex flex-col justify-center items-center bg-gray-950/90 backdrop-blur-xl px-6 text-center">
            <h2 className="text-2xl font-bold mb-4 text-white">You reached the {currentPlan.label} limit</h2>
            <p className="mb-6 text-gray-300 max-w-lg">
              This plan includes {planCreditLimit} credits. Upgrade to unlock more scenes. Admin users are auto-unlocked when signed in.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md mb-4">
              <button
                onClick={() => (window.location.href = '/#pricing')}
                className="flex-1 rounded-full bg-indigo-500 px-6 py-3 font-semibold text-white hover:bg-indigo-400 transition"
              >
                View pricing
              </button>
              <button
                onClick={() => setShowPlanModal(true)}
                className="flex-1 rounded-full border border-white/20 px-6 py-3 font-semibold text-white/80 hover:border-indigo-400 hover:text-white transition"
              >
                Change plan
              </button>
            </div>
            <p className="mt-4 text-xs text-gray-500">Need help? Contact the product team.</p>
          </div>
        )}
        <OnboardingOverlay
          visible={shouldShowOnboarding}
          currentStep={onboardingStep}
          steps={onboardingStepsMeta}
          onNext={handleOnboardingNext}
          onSkip={skipOnboarding}
        />
        {showGoalWizard && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 px-4">
            <div className="w-full max-w-3xl rounded-3xl border border-white/10 bg-gray-950 p-6 md:p-10 shadow-2xl space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-indigo-200">Quick start wizard</p>
                  <h3 className="text-2xl md:text-3xl font-semibold text-white mt-2">Let’s set up your scene</h3>
                </div>
                <button onClick={handleGoalWizardSkip} className="text-sm text-gray-400 hover:text-white">Skip</button>
              </div>
              <p className="text-sm text-gray-400">Step {goalWizardStep} / 3</p>
              {goalWizardStep === 1 && (
                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    { value: 'ugc', title: 'UGC Lifestyle', description: 'Creators interacting with your product in real life.' },
                    { value: 'product', title: 'Product Placement', description: 'Stylized hero shots without people.' },
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => handleGoalWizardSelect('goal', option.value)}
                      className={`rounded-2xl border p-4 text-left transition ${goalWizardData.goal === option.value ? 'border-indigo-400 bg-indigo-500/10 text-white' : 'border-white/10 bg-white/5 text-gray-300'}`}
                    >
                      <p className="text-lg font-semibold">{option.title}</p>
                      <p className="text-sm text-gray-400 mt-2">{option.description}</p>
                    </button>
                  ))}
                </div>
              )}
              {goalWizardStep === 2 && (
                <div className="grid gap-3 md:grid-cols-3">
                  {GOAL_VIBE_OPTIONS.map(option => (
                    <button
                      key={option.value}
                      onClick={() => handleGoalWizardSelect('vibe', option.value)}
                      className={`rounded-2xl border p-4 text-left transition ${goalWizardData.vibe === option.value ? 'border-indigo-400 bg-indigo-500/10 text-white' : 'border-white/10 bg-white/5 text-gray-300'}`}
                    >
                      <p className="text-base font-semibold">{option.label}</p>
                      <p className="text-sm text-gray-400 mt-2">{option.description}</p>
                    </button>
                  ))}
                </div>
              )}
              {goalWizardStep === 3 && (
                <div className="grid gap-3 md:grid-cols-2">
                  {CREATOR_PRESETS.filter(preset => preset.value !== 'custom').map(preset => (
                    <button
                      key={preset.value}
                      onClick={() => handleGoalWizardSelect('preset', preset.value)}
                      className={`rounded-2xl border p-4 text-left transition ${goalWizardData.preset === preset.value ? 'border-indigo-400 bg-indigo-500/10 text-white' : 'border-white/10 bg-white/5 text-gray-300'}`}
                    >
                      <p className="text-base font-semibold">{preset.label}</p>
                      <p className="text-sm text-gray-400 mt-2">{preset.description}</p>
                    </button>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <button onClick={goalWizardStep === 1 ? handleGoalWizardSkip : handleGoalWizardBack} className="text-sm text-gray-400 hover:text-white">
                  {goalWizardStep === 1 ? 'Skip wizard' : 'Back'}
                </button>
                {goalWizardStep < 3 ? (
                  <button onClick={handleGoalWizardNext} className="rounded-full bg-indigo-500 px-6 py-2 text-sm font-semibold text-white hover:bg-indigo-400 transition">
                    Next
                  </button>
                ) : (
                  <button onClick={handleGoalWizardComplete} className="rounded-full bg-emerald-500 px-6 py-2 text-sm font-semibold text-white hover:bg-emerald-400 transition">
                    Apply &amp; build
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
        {showPlanModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
            <div className="w-full max-w-3xl rounded-3xl border border-white/10 bg-gray-950 p-6 md:p-8 shadow-2xl space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-indigo-200">Manage plan</p>
                  <h3 className="text-2xl font-semibold text-white mt-1">Choose what fits your launch</h3>
                </div>
                <button onClick={() => { setShowPlanModal(false); setPlanCodeInput(''); setPlanCodeError(null); setPlanNotice(null); }} className="text-sm text-gray-400 hover:text-white">
                  Close
                </button>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {Object.entries(PLAN_CONFIG).map(([tier, config]) => (
                  <button
                    key={tier}
                    onClick={() => handlePlanTierSelect(tier as PlanTier)}
                    className={`rounded-2xl border p-4 text-left transition ${planTier === tier ? 'border-indigo-400 bg-indigo-500/10 text-white' : 'border-white/10 bg-white/5 text-gray-300'}`}
                  >
                    <p className="text-lg font-semibold">{config.label}</p>
                    <p className="text-sm text-gray-400 mt-1">{config.description}</p>
                    <p className="text-xs mt-2">
                      {planTier === tier ? 'Current plan' : 'Select plan'}
                    </p>
                  </button>
                ))}
              </div>
              <div className="space-y-2 text-left">
                <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Have an upgrade code?</p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={planCodeInput}
                    onChange={(e) => {
                      setPlanCodeInput(e.target.value);
                      if (planCodeError) setPlanCodeError(null);
                    }}
                    placeholder="Enter the code from your receipt"
                    className="flex-1 rounded-lg border border-white/10 bg-gray-900 px-3 py-2 text-white focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                  />
                  <button
                    type="button"
                    onClick={handlePlanCodeSubmit}
                    className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-400 transition"
                  >
                    Apply
                  </button>
                </div>
                {planCodeError && <p className="text-xs text-red-300">{planCodeError}</p>}
              </div>
            </div>
          </div>
        )}

        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">
            Universal AI Mockup Generator
          </h1>
          <p className="mt-2 text-lg text-gray-400">
            Generate photo-realistic UGC-style images for your products in seconds.
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs text-gray-400">
            <span className="rounded-full border border-white/20 px-3 py-1 text-white/90">
              Plan: {currentPlan.label}
            </span>
            <span>
              {remainingCredits} credits left
              {planVideoLimit > 0 ? ` · ${Math.max(remainingVideos, 0)} video credits left` : ''}
              {isTrialBypassActive ? ' · Admin bypass active' : ''}
            </span>
            <button
              onClick={() => {
                setPlanNotice(null);
                setShowPlanModal(true);
              }}
              className="inline-flex items-center justify-center rounded-full border border-white/20 px-4 py-2 text-white/80 hover:border-indigo-400 hover:text-white transition"
            >
              Manage plan
            </button>
          </div>
          {planNotice && <p className="mt-2 text-xs text-rose-300">{planNotice}</p>}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            {isKeySelected && isUsingStoredKey && (
              <button
                onClick={handleApiKeyInvalid}
                className="inline-flex items-center justify-center rounded-lg border border-gray-600 px-4 py-2 text-sm font-semibold text-gray-200 hover:bg-gray-800 transition"
              >
                Change API Key
              </button>
            )}
            <button
              onClick={handleReplayOnboarding}
              disabled={isTrialLocked}
              className={`inline-flex items-center justify-center rounded-lg border border-indigo-500/60 text-sm font-semibold px-4 py-2 transition ${isTrialLocked ? 'text-indigo-300/30 border-indigo-500/20 cursor-not-allowed' : 'text-indigo-200 hover:bg-indigo-500/10'}`}
            >
              Replay guided tour
            </button>
          </div>
          {isLoggedIn && (
            <>
              <div className="mt-4 flex flex-col sm:flex-row gap-3 items-center justify-center text-sm text-gray-400">
                <span>Signed in as {userEmail}</span>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center justify-center rounded-full border border-gray-600 px-3 py-1 font-semibold text-gray-200 hover:bg-gray-800 transition"
                >
                  Switch account
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-400">{currentPlan.description}</p>
            </>
          )}
          <div className="mt-6 flex items-center justify-center gap-4 text-xs text-gray-400">
            <span className={isSimpleMode ? 'text-white' : ''}>Simple Mode</span>
            <label
              className={`relative inline-flex cursor-pointer items-center ${!canUseStudioFeatures ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={!isSimpleMode}
                onChange={toggleSimpleMode}
                disabled={!canUseStudioFeatures}
                aria-label="Toggle studio mode"
              />
              <div
                className={`relative h-6 w-11 rounded-full transition ${
                  !isSimpleMode ? 'bg-indigo-500' : 'bg-gray-700'
                }`}
              >
                <span
                  className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow transition ${
                    !isSimpleMode ? 'translate-x-5' : ''
                  }`}
                />
              </div>
            </label>
            <span className={!isSimpleMode ? 'text-white' : ''}>Studio Mode</span>
          </div>
        </header>

        <main className="flex flex-col gap-8">
        {(!isSimpleMode && canUseStudioFeatures) && (
            <div className="rounded-3xl border border-white/5 bg-white/5 p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-indigo-200">Storyboard</p>
                  <p className="text-sm text-gray-400">Queue variations and switch scenes without rebuilding settings.</p>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={handleAddScene}
                    disabled={storyboardScenes.length >= 4}
                    className="rounded-full border border-white/20 px-3 py-1 text-white/80 hover:border-indigo-400 hover:text-white transition disabled:opacity-40"
                  >
                    + Add scene
                  </button>
                  <button
                    type="button"
                    onClick={handleDuplicateScene}
                    disabled={storyboardScenes.length >= 4}
                    className="rounded-full border border-white/20 px-3 py-1 text-white/80 hover:border-indigo-400 hover:text-white transition disabled:opacity-40"
                  >
                    Duplicate
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                {storyboardScenes.map(scene => (
                  <div
                    key={scene.id}
                    className={`rounded-2xl border px-4 py-3 flex items-center gap-3 ${scene.id === activeSceneId ? 'border-indigo-400 bg-indigo-500/10 text-white' : 'border-white/10 bg-white/5 text-gray-300'}`}
                  >
                    <button onClick={() => handleSceneSelect(scene.id)} className="font-semibold">
                      {scene.label}
                    </button>
                    {storyboardScenes.length > 1 && (
                      <button
                        onClick={() => handleSceneDelete(scene.id)}
                        className="text-xs text-gray-400 hover:text-red-300"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-black/20 p-4 text-xs text-gray-300">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="uppercase tracking-[0.3em] text-indigo-200">Same person</p>
                    <p className="text-gray-400 mt-1">Keep a single creator across every scene automatically.</p>
                  </div>
                  <label className={`relative inline-flex cursor-pointer items-center ${isTalentLinkedAcrossScenes ? 'text-white' : ''}`}>
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={isTalentLinkedAcrossScenes}
                      onChange={handleTalentLinkToggle}
                      aria-label="Use the same person in all storyboard scenes"
                    />
                    <div
                      className={`relative h-5 w-10 rounded-full transition ${
                        isTalentLinkedAcrossScenes ? 'bg-indigo-500' : 'bg-gray-700'
                      }`}
                    >
                      <span
                        className={`absolute left-1 top-1 block h-3 w-3 rounded-full bg-white shadow transition ${
                          isTalentLinkedAcrossScenes ? 'translate-x-4' : ''
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
            <div className="grid gap-6 lg:grid-cols-3">
                <div ref={intentRef} className="bg-gray-800/50 p-6 rounded-lg shadow-lg border border-gray-700 flex flex-col gap-4 h-full">
                <div className="flex flex-col gap-1">
                  <p className="text-xs uppercase tracking-widest text-indigo-300">Step 1</p>
                  <h2 className="text-2xl font-bold text-gray-200">Choose Content Intent</h2>
                  <p className="text-sm text-gray-400">
                    {isProductPlacement
                      ? 'Product Placement focuses on stylized scenes with zero people so the product stays hero.'
                      : 'UGC Lifestyle enables authentic creator vibes, including people interacting with the product.'}
                  </p>
                </div>
                <ChipSelectGroup
                  label="Content Style"
                  options={CONTENT_STYLE_OPTIONS}
                  selectedValue={options.contentStyle}
                  onChange={(value) => handleOptionChange('contentStyle', value, 'Content Intent')}
                />
              </div>
              <div ref={uploadRef} className="bg-gray-800/50 p-6 rounded-lg shadow-lg border border-gray-700 flex flex-col gap-4 h-full">
                <div className="flex flex-col gap-1">
                  <p className="text-xs uppercase tracking-widest text-indigo-300">Step 2</p>
                  <h2 className="text-2xl font-bold text-gray-200">
                    {hasUploadedProduct ? 'Product Photo Ready' : 'Add Your Product Photo'}
                  </h2>
                  <p className="text-sm text-gray-400">
                    {hasUploadedProduct
                      ? 'This product image will be reused for both UGC and Product Placement. Upload again only if you want to replace it.'
                      : 'Upload a transparent PNG, JPG, or WebP of your product to anchor every scene.'}
                  </p>
                </div>
                <ImageUploader
                  ref={uploaderRef}
                  onImageUpload={handleImageUpload}
                  uploadedImagePreview={uploadedImagePreview}
                  disabled={!hasSelectedIntent}
                  lockedMessage="Select Step 1 first to unlock uploads."
                />
                {productAssets.length > 0 && (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <p className="text-xs uppercase tracking-[0.35em] text-indigo-200">Product library</p>
                        <span className="rounded-full border border-white/20 px-2 py-0.5 text-[11px] text-white/80">
                          {productAssets.length}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleLibraryAddClick}
                        className="inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-1 text-[11px] text-gray-200 hover:border-indigo-400 hover:text-white transition"
                      >
                        + Add photo
                      </button>
                    </div>
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                      {productAssets.map(asset => (
                        <div
                          key={asset.id}
                          className={`rounded-xl border px-3 py-3 space-y-3 ${asset.id === activeProductId ? 'border-indigo-400 bg-indigo-500/5' : 'border-white/10 bg-black/20'}`}
                        >
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => handleProductAssetSelect(asset.id)}
                              className={`flex flex-col text-left text-xs font-semibold ${asset.id === activeProductId ? 'text-white' : 'text-gray-300'}`}
                            >
                              <span>{asset.label || 'Untitled product'}</span>
                              <span className="text-[10px] text-gray-400">{Math.round(asset.file.size / 1024)} KB</span>
                            </button>
                            <div className="relative">
                              <img src={asset.previewUrl} alt={asset.label} className="h-20 w-20 rounded-md object-cover border border-white/10" />
                              <button
                                type="button"
                                onClick={() => handleProductAssetDelete(asset.id)}
                                className="absolute -right-2 -top-2 rounded-full bg-black/80 p-1 text-[10px] uppercase tracking-widest text-rose-300 hover:bg-rose-500/40"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                            <input
                              type="text"
                              value={asset.label}
                              onChange={event => handleProductAssetLabelChange(asset.id, event.target.value)}
                              className="flex-1 rounded-md border border-white/10 bg-black/20 px-2 py-1 text-xs text-white focus:border-indigo-400 focus:outline-none"
                              placeholder="Name this product"
                            />
                            <div className="flex flex-col gap-1 text-xs text-gray-300">
                              <input
                                type="number"
                                min="0"
                                step="0.1"
                                value={asset.heightValue ?? ''}
                                onChange={event => handleProductHeightChange(asset.id, event.target.value)}
                                className="w-full rounded-md border border-white/10 bg-black/20 px-2 py-1 text-white focus:border-indigo-400 focus:outline-none"
                                placeholder="Height"
                              />
                              <select
                                value={asset.heightUnit}
                                onChange={event => handleProductHeightUnitChange(asset.id, event.target.value as 'cm' | 'in')}
                                className="rounded-md border border-white/10 bg-black/20 px-2 py-1 text-white focus:border-indigo-400 focus:outline-none"
                              >
                                <option value="cm">cm</option>
                                <option value="in">in</option>
                              </select>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleProductAssetSelect(asset.id)}
                              className={`rounded-full border px-3 py-1 text-[11px] ${asset.id === activeProductId ? 'border-indigo-400 text-white' : 'border-white/20 text-gray-300 hover:border-indigo-400 hover:text-white'}`}
                            >
                              Use
                            </button>
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={handleLibraryAddClick}
                        className="w-full rounded-xl border border-dashed border-white/20 bg-black/10 px-3 py-3 text-left text-xs text-gray-400 hover:border-indigo-400 hover:text-white transition"
                      >
                        <p className="text-sm font-semibold text-white">+ Add another photo</p>
                        <p className="text-[11px] text-gray-500">Drop a batch of files or tap to keep building your library.</p>
                      </button>
                    </div>
                  </div>
                )}
              </div>
              {/* MoodReferencePanel temporarily hidden per request */}
              <div className="flex flex-col gap-3">
                <ModelReferencePanel
                  onFileSelect={handleModelReferenceUpload}
                  previewUrl={modelReferencePreview}
                  notes={modelReferenceNotes}
                  onNotesChange={setModelReferenceNotes}
                  onClear={handleClearModelReference}
                  disabled={!hasUploadedProduct || isProductPlacement}
                  lockedMessage={
                    !hasUploadedProduct
                      ? "Upload your product image first to attach a model."
                      : 'Model references are only available in UGC Lifestyle scenes with a person enabled. Switch out of Product Placement and pick an age group to unlock this.'
                  }
                />
                {hasUploadedProduct && !personInScene && !isProductPlacement && (
                  <p className="text-xs text-amber-300">
                    Model references only apply when this scene uses UGC Lifestyle with a person selected. Switch off Product Placement and choose an age so the same talent can carry across your morning/afternoon/night shots.
                  </p>
                )}
              </div>
            </div>
          <fieldset disabled={!hasUploadedProduct || isTrialLocked} className="contents">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Controls Column */}
              <div ref={customizeRef} className={`lg:col-span-1 bg-gray-800/50 p-6 rounded-lg shadow-lg border border-gray-700 flex flex-col max-h-[calc(100vh-12rem)] ${!hasUploadedProduct ? 'opacity-60' : ''}`}>
                <div className="mb-4 border-b border-gray-600 pb-3 flex-shrink-0">
                  <p className="text-xs uppercase tracking-widest text-indigo-300">Step 3</p>
                  <h2 className="text-2xl font-bold text-gray-200">Customize Your Mockup</h2>
                </div>
                
                <div className={`flex-grow overflow-y-auto custom-scrollbar -mr-4 pr-4 ${!hasUploadedProduct ? 'pointer-events-none' : ''}`}>
                  <div id={getSectionId('Scene & Environment')}>
                    <Accordion 
                      title="Scene & Environment" 
                      isOpen={openAccordion === 'Scene & Environment'} 
                      onToggle={() => handleToggleAccordion('Scene & Environment')}
                    >
                      <div className="space-y-4">
                        <ChipSelectGroup
                          label="Location / Setting"
                          options={SETTING_OPTIONS}
                          selectedValue={options.setting}
                          onChange={(value) => handleOptionChange('setting', value, 'Scene & Environment')}
                          allowCustom
                          customLabel="Custom setting"
                          customPlaceholder="Describe the location"
                        />
                        <ChipSelectGroup
                          label="Environment Order"
                          options={ENVIRONMENT_ORDER_OPTIONS}
                          selectedValue={options.environmentOrder}
                          onChange={(value) => handleOptionChange('environmentOrder', value, 'Scene & Environment')}
                          allowCustom
                          customLabel="Custom environment"
                          customPlaceholder="Describe the vibe"
                        />
                      </div>
                    </Accordion>
                  </div>
                  {isProductPlacement && (
                    <div id={getSectionId('Product Details')}>
                      <Accordion
                        title="Product Details"
                        isOpen={openAccordion === 'Product Details'}
                        onToggle={() => handleToggleAccordion('Product Details')}
                      >
                        <div className="space-y-4">
                          <ChipSelectGroup
                            label="Product Material"
                            options={PRODUCT_MATERIAL_OPTIONS}
                            selectedValue={options.productMaterial}
                            onChange={(value) => handleOptionChange('productMaterial', value, 'Product Details')}
                            allowCustom
                            customLabel="Custom material"
                            customPlaceholder="Describe the finish"
                          />
                          <ChipSelectGroup
                            label="Product Plane"
                            options={PRODUCT_PLANE_OPTIONS}
                            selectedValue={options.productPlane}
                            onChange={(value) => handleOptionChange('productPlane', value, 'Product Details')}
                            allowCustom
                            customLabel="Custom composition"
                            customPlaceholder="Describe the depth placement"
                          />
                          <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-3 text-xs text-gray-300">
                            <div className="flex items-center justify-between gap-2">
                              <div>
                                <p className="uppercase tracking-[0.3em] text-indigo-200">Packaging kit</p>
                                <p className="text-gray-400 mt-1">Keep the entire box and inserts visible in every render.</p>
                              </div>
                              <label className="relative inline-flex cursor-pointer items-center gap-2">
                                <input
                                  type="checkbox"
                                  className="sr-only"
                                  checked={isMultiProductPackaging}
                                  onChange={event => setIsMultiProductPackaging(event.target.checked)}
                                  aria-label="Packaging contains multiple products"
                                />
                                <div
                                  className={`relative h-5 w-10 rounded-full transition ${
                                    isMultiProductPackaging ? 'bg-indigo-500' : 'bg-gray-700'
                                  }`}
                                >
                                  <span
                                    className={`absolute left-1 top-1 block h-3 w-3 rounded-full bg-white shadow transition ${
                                      isMultiProductPackaging ? 'translate-x-4' : ''
                                    }`}
                                  />
                                </div>
                                <span className={`text-xs font-semibold ${isMultiProductPackaging ? 'text-indigo-200' : 'text-gray-500'}`}>
                                  {isMultiProductPackaging ? 'Active' : 'Off'}
                                </span>
                              </label>
                            </div>
                          </div>
                          <div className="rounded-2xl border border-white/10 bg-black/20 p-4 space-y-2">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div>
                                <p className="text-xs uppercase tracking-[0.35em] text-indigo-200">Supplement photo modes</p>
                                <p className="text-[11px] text-gray-400">Preset palettes inspired by Olly, AG1, Seed, Armra, and more.</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleSupplementPresetSelect('none')}
                                className="rounded-full border border-white/15 px-3 py-1 text-xs text-gray-300 hover:border-indigo-400 hover:text-white"
                              >
                                Clear
                              </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {SUPPLEMENT_PHOTO_PRESETS.map(preset => (
                                <button
                                  key={preset.value}
                                  type="button"
                                  onClick={() => handleSupplementPresetSelect(preset.value)}
                                  className={`rounded-full border px-3 py-1 text-xs transition ${
                                    activeSupplementPreset === preset.value
                                      ? 'border-indigo-400 bg-indigo-500/10 text-white'
                                      : 'border-white/15 text-gray-300 hover:border-indigo-400 hover:text-white'
                                  }`}
                                >
                                  {preset.label}
                                </button>
                              ))}
                            </div>
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                              <div className="flex flex-col gap-1">
                                <label className="text-xs uppercase tracking-widest text-gray-500">Background color</label>
                                <input
                                  type="text"
                                  value={supplementBackgroundColor}
                                  onChange={event => setSupplementBackgroundColor(event.target.value)}
                                  placeholder="e.g., #FFB347 or pastel peach"
                                  className="rounded-lg border border-white/10 bg-gray-900 px-3 py-2 text-sm text-white focus:border-indigo-400 focus:outline-none"
                                />
                              </div>
                              <div className="flex flex-col gap-1">
                                <label className="text-xs uppercase tracking-widest text-gray-500">Accent color / props</label>
                          <input
                                type="text"
                                value={supplementAccentColor}
                                onChange={event => setSupplementAccentColor(event.target.value)}
                                placeholder="e.g., teal acrylic cube"
                                className="rounded-lg border border-white/10 bg-gray-900 px-3 py-2 text-sm text-white focus:border-indigo-400 focus:outline-none"
                              />
                            </div>
                          </div>
                          {isHeroLandingMode && (
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                              <div className="flex flex-col gap-1">
                                <label className="text-xs uppercase tracking-widest text-gray-500">Product alignment</label>
                                <div className="flex flex-wrap gap-2">
                                  {HERO_ALIGNMENT_OPTIONS.map(option => (
                                    <button
                                      key={option.value}
                                      type="button"
                                      onClick={() => setHeroProductAlignment(option.value)}
                                      className={`rounded-full border px-3 py-1 text-xs transition ${heroProductAlignment === option.value ? 'border-indigo-400 bg-indigo-500/10 text-white' : 'border-white/15 text-gray-300 hover:border-indigo-400 hover:text-white'}`}
                                    >
                                      {option.label}
                                    </button>
                                  ))}
                                </div>
                              </div>
                              <div className="flex flex-col gap-1">
                                <label className="text-xs uppercase tracking-widest text-gray-500">Product scale</label>
                                <input
                                  type="number"
                                  min="0.5"
                                  max="2"
                                  step="0.05"
                                  value={heroProductScale}
                                  onChange={event => {
                                    const value = Number.parseFloat(event.target.value);
                                    if (Number.isNaN(value)) return;
                                    setHeroProductScale(Math.max(0.3, Math.min(3, value)));
                                  }}
                                  className="rounded-lg border border-white/10 bg-gray-900 px-3 py-2 text-sm text-white focus:border-indigo-400 focus:outline-none"
                                />
                                <p className="text-[11px] text-gray-500">1 = original sizing. Increase for bolder hero presence.</p>
                              </div>
                              <div className="flex flex-col gap-1 sm:col-span-2">
                                <label className="text-xs uppercase tracking-widest text-gray-500">Shadow style</label>
                                <div className="flex flex-wrap gap-2">
                                  {HERO_SHADOW_OPTIONS.map(option => (
                                    <button
                                      key={option.value}
                                      type="button"
                                      onClick={() => setHeroShadowStyle(option.value)}
                                      className={`rounded-full border px-3 py-1 text-xs transition ${heroShadowStyle === option.value ? 'border-indigo-400 bg-indigo-500/10 text-white' : 'border-white/15 text-gray-300 hover:border-indigo-400 hover:text-white'}`}
                                    >
                                      {option.label}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                          {renderFormulationStoryPanel('product')}
                          <div className="flex flex-col gap-2">
                            <label className="text-xs uppercase tracking-widest text-gray-500">Flavor / ingredient props</label>
                              <textarea
                                value={supplementFlavorNotes}
                                onChange={event => setSupplementFlavorNotes(event.target.value)}
                                placeholder="e.g., pineapple, lavender sprigs, gummy vitamins"
                                className="rounded-lg border border-white/10 bg-gray-900 px-3 py-2 text-sm text-white focus:border-indigo-400 focus:outline-none"
                                rows={2}
                              />
                            </div>
                            <div className="flex flex-col gap-2">
                              <label className="text-xs uppercase tracking-widest text-gray-500">Custom hero cue</label>
                              <textarea
                                value={supplementCustomPrompt}
                                onChange={event => setSupplementCustomPrompt(event.target.value)}
                                placeholder="e.g., have a manicured hand toss gummies mid-air beside the bottle"
                                className="rounded-lg border border-white/10 bg-gray-900 px-3 py-2 text-sm text-white focus:border-indigo-400 focus:outline-none"
                                rows={2}
                              />
                              <p className="text-[11px] text-gray-500">We append this line directly to the prompt so you can call out extra beats (hands, props, typography, etc.).</p>
                            </div>
                            <label className="flex items-center gap-2 text-xs text-gray-300">
                              <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-gray-600 bg-gray-900 text-indigo-500 focus:ring-indigo-400"
                                checked={includeSupplementHand}
                                onChange={event => setIncludeSupplementHand(event.target.checked)}
                              />
                              Include a cropped hand interacting with the product
                            </label>
                          </div>
                          <ChipSelectGroup
                            label="Studio Setup"
                            options={PLACEMENT_STYLE_OPTIONS}
                            selectedValue={options.placementStyle}
                            onChange={(value) => handleOptionChange('placementStyle', value, 'Product Details')}
                          />
                          <ChipSelectGroup
                            label="Hero Camera Rig"
                            options={PLACEMENT_CAMERA_OPTIONS}
                            selectedValue={options.placementCamera}
                            onChange={(value) => handleOptionChange('placementCamera', value, 'Product Details')}
                          />
                          <div className="rounded-2xl border border-white/10 bg-gray-900/40 p-4 space-y-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs uppercase tracking-[0.3em] text-indigo-200">Pro photographer mode</p>
                                <p className="text-xs text-gray-400">Unlock lens + lighting controls for hero product shoots.</p>
                              </div>
                              <label className="relative inline-flex cursor-pointer items-center gap-2">
                                <input
                                  type="checkbox"
                                  className="sr-only"
                                  checked={isProPhotographer}
                                  onChange={handleProPhotographerToggle}
                                />
                                <div
                                  className={`relative h-5 w-10 rounded-full transition ${
                                    isProPhotographer ? 'bg-indigo-500' : 'bg-gray-700'
                                  }`}
                                >
                                  <span
                                    className={`absolute left-1 top-1 block h-3 w-3 rounded-full bg-white shadow transition ${
                                      isProPhotographer ? 'translate-x-4' : ''
                                    }`}
                                  />
                                </div>
                                <span className={`text-xs font-semibold ${isProPhotographer ? 'text-indigo-200' : 'text-gray-500'}`}>
                                  {isProPhotographer ? 'Active' : 'Off'}
                                </span>
                              </label>
                            </div>
                            {isProPhotographer && (
                              <div className="space-y-3">
                                <div className="flex flex-wrap gap-2">
                                  {PRO_LOOK_PRESETS.map(preset => (
                                    <button
                                      key={preset.value}
                                      type="button"
                                      onClick={() => handleProPresetSelect(preset.value)}
                                      className={`rounded-full border px-3 py-1 text-xs transition ${activeProPreset === preset.value ? 'border-indigo-400 bg-indigo-500/10 text-white' : 'border-white/15 text-gray-300 hover:border-indigo-400 hover:text-white'}`}
                                    >
                                      {preset.label}
                                    </button>
                                  ))}
                                  <button
                                    type="button"
                                    onClick={() => handleProPresetSelect('custom')}
                                    className={`rounded-full border px-3 py-1 text-xs transition ${activeProPreset === 'custom' ? 'border-indigo-400 bg-indigo-500/10 text-white' : 'border-white/15 text-gray-300 hover:border-indigo-400 hover:text-white'}`}
                                  >
                                    Custom build
                                  </button>
                                </div>
                                <ChipSelectGroup
                                  label="Lens"
                                  options={PRO_LENS_OPTIONS}
                                  selectedValue={options.proLens ?? ''}
                                  onChange={(value) => handleOptionChange('proLens', value, 'Product Details')}
                                  allowCustom
                                  customLabel="Custom lens"
                                  customPlaceholder="Describe the lens setup"
                                />
                                <ChipSelectGroup
                                  label="Lighting Rig"
                                  options={PRO_LIGHTING_RIG_OPTIONS}
                                  selectedValue={options.proLightingRig ?? ''}
                                  onChange={(value) => handleOptionChange('proLightingRig', value, 'Product Details')}
                                  allowCustom
                                  customLabel="Custom rig"
                                  customPlaceholder="Describe the lighting rig"
                                />
                                <ChipSelectGroup
                                  label="Finish / Treatment"
                                  options={PRO_POST_TREATMENT_OPTIONS}
                                  selectedValue={options.proPostTreatment ?? ''}
                                  onChange={(value) => handleOptionChange('proPostTreatment', value, 'Product Details')}
                                  allowCustom
                                  customLabel="Custom finish"
                                  customPlaceholder="Describe the post treatment"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </Accordion>
                    </div>
                  )}
                  <div id={getSectionId('Photography')}>
                    <Accordion 
                      title="Photography" 
                      isOpen={openAccordion === 'Photography'}
                      onToggle={() => handleToggleAccordion('Photography')}
                    >
                      <div className="space-y-4">
                        <ChipSelectGroup label="Lighting" options={LIGHTING_OPTIONS} selectedValue={options.lighting} onChange={(value) => handleOptionChange('lighting', value, 'Photography')} />
                        <ChipSelectGroup label="Camera Type" options={CAMERA_OPTIONS} selectedValue={options.camera} onChange={(value) => handleOptionChange('camera', value, 'Photography')} />
                        <ChipSelectGroup label="Aspect Ratio" options={ASPECT_RATIO_OPTIONS} selectedValue={options.aspectRatio} onChange={(value) => handleOptionChange('aspectRatio', value, 'Photography')} />
                        {!isSimpleMode && (
                          <>
                            <ChipSelectGroup label="Perspective" options={PERSPECTIVE_OPTIONS} selectedValue={options.perspective} onChange={(value) => handleOptionChange('perspective', value, 'Photography')} />
                            <ChipSelectGroup label="Realism / Imperfections" options={REALISM_OPTIONS} selectedValue={options.realism} onChange={(value) => handleOptionChange('realism', value, 'Photography')} />
                          </>
                        )}
                      </div>
                    </Accordion>
                  </div>
                  {renderPersonDetailsSection()}
                  {renderBundlesSection()}
                </div>
                <div className="mt-8 flex-shrink-0">
                  <button 
                    onClick={() => handleGenerateClick()}
                    disabled={isImageLoading || !uploadedImageFile}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-900/50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-lg"
                  >
                    {isImageLoading ? 'Generating...' : 'Generate Mockup'}
                  </button>
                </div>
              </div>
              
              {/* Visuals Column */}
              <div className="lg:col-span-2 flex flex-col gap-8">
                <GeneratedImage
                  imageUrl={generatedImageUrl}
                  fourKVariant={fourKVariant}
                  twoKVariant={twoKVariant}
                  isHiResProcessing={isPreparingHiRes}
                  hiResError={hiResError}
                  isImageLoading={isImageLoading}
                  imageError={imageError}
                  onReset={handleReset}
                  isFreeUser={isFreeUser}
                  downloadCreditConfig={DOWNLOAD_CREDIT_CONFIG}
                  onChargeDownloadCredits={handleDownloadCreditCharge}
                />
                {generatedImageUrl && (
                  <ImageEditor
                    editPrompt={editPrompt}
                    onPromptChange={e => setEditPrompt(e.target.value)}
                    onEditImage={handleEditImage}
                    isEditing={isImageLoading}
                  />
                )}
                {generatedImageUrl && (
                  <VideoGenerator
                    videoPrompt={videoPrompt}
                    onPromptChange={e => setVideoPrompt(e.target.value)}
                    onGenerateVideo={handleGenerateVideo}
                    isVideoLoading={isVideoLoading}
                    videoError={videoError}
                    generatedVideoUrl={generatedVideoUrl}
                    isGenerating={isVideoLoading || isImageLoading}
                    hasAccess={hasPlanVideoAccess}
                    lockMessage={planVideoLimit === 0 ? 'Upgrade to Creator or Studio to unlock video generation.' : undefined}
                    showAccessCodeField={planVideoLimit === 0}
                    remainingVideos={planVideoLimit > 0 ? remainingVideos : null}
                    planLabel={currentPlan.label}
                    accessCode={videoAccessInput}
                    onAccessCodeChange={handleVideoAccessCodeChange}
                    onAccessSubmit={handleVideoAccessSubmit}
                    accessError={videoAccessError}
                  />
                )}
              </div>
            </div>
          </fieldset>
        </main>
      </div>
    </div>
  );
};

export default App;
