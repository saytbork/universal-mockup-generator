import React, { useState, useEffect, useCallback } from 'react';
import {
  User,
  Smartphone,
  Shirt,
  Home,
  MapPin,
  Utensils,
  Waves,
  Mountain,
  Building2,
  Sun,
  Camera,
  Layers,
  Edit3
} from 'lucide-react';
import { LIGHTING_OPTIONS, CAMERA_OPTIONS } from '../../constants';
import AccordionSection from './shared/AccordionSection';
import type {
  Step3Values,
  ProductTypeOption,
  ProductScaleOption,
  ProductCountOption,
  ProductViewPreset,
  ExpertRole,
  ExpertAttire,
  BadgePreference,
} from '@/types/step3Types';

interface SceneBuilderLifestyleProps {
  onValuesChange?: (values: Step3Values) => void;
  onCanGenerateChange?: (canGenerate: boolean) => void;
  hasModelReference?: boolean;
}

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

// ASPECT RATIO - Output Format
const ASPECT_RATIO_OPTIONS = ['1:1 (Square)', '4:5 (Portrait)', '9:16 (Story)'];

const SIDE_PLACEMENT_OPTIONS = ['Left', 'Center', 'Right'];

// FORMULATION STORY
const LAB_VIBE_OPTIONS = ['Clean Lab', 'Moody Lab', 'Warm Studio'];

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
  productType: null,
  productCount: null,
  productScale: null,
  isBundle: false,
  productViewPreset: null,
  productViewCustomText: null,
  productCompositionPreset: null,
  ecommerceAlignment: null,
  reserveBlankSpace: false,
  productEnvironment: null,
  backgroundColorHint: null,
  productLighting: null,
  productOutputFormat: null,
  productInteractionEditorial: null,

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
  productMode: false,
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
enforceSingleSelectLayers(initialValues);
const SceneBuilderLifestyle: React.FC<SceneBuilderLifestyleProps> = ({
  onValuesChange,
  onCanGenerateChange,
  hasModelReference = false,
}) => {
  const [openAccordionId, setOpenAccordionId] = useState<string | null>('creator');
  const [openUgcLayerId, setOpenUgcLayerId] = useState<UGCLayerField | null>(null);
  const [touchedSections, setTouchedSections] = useState<Set<string>>(new Set());
  const [values, setValues] = useState<Step3Values>(initialValues);

  const toggleSection = (section: string) => {
    setOpenAccordionId(prev => (prev === section ? null : section));
  };

  const markSectionTouched = (section: string) => {
    setTouchedSections(prev => {
      const next = new Set(prev);
      next.add(section);
      return next;
    });
  };

  const updateValue = useCallback(<K extends keyof Step3Values>(key: K, value: Step3Values[K]) => {
    console.log('[SCENE LIFESTYLE UPDATE]', key, value, values);
    setValues(prev => {
      const newValues = { ...prev, [key]: value };

      if (key === 'ugcRealMode' && value === false) {
        ALL_UGC_LAYER_FIELDS.forEach(layer => {
          (newValues as any)[layer] = [];
        });
      }

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

  const ageSliderProgress = Math.min(Math.max(((values.age - 18) / 72) * 100, 0), 100);
  const handleAgeSliderChange = (nextValue: number) => {
    updateValue('age', nextValue);
    markSectionTouched('creator');
  };

  const hasAnyUgcLayerSelection = USER_CONTROLLED_UGC_FIELDS.some(field => {
    const selections = values[field] as string[] | undefined;
    return Array.isArray(selections) && selections.length > 0;
  });

  const isUGCMode = values.ugcRealMode;
  const isPersonDisabled = values.noPerson;

  useEffect(() => {
    console.log('[SCENE LIFESTYLE EMIT]', values);
    onValuesChange?.(values);
  }, [values, onValuesChange]);

  useEffect(() => {
    onCanGenerateChange?.(true);
  }, [onCanGenerateChange]);

  useEffect(() => {
    if (hasModelReference && (values.ugcRealMode || values.creatorPreset)) {
      setValues(prev => {
        const next = { ...prev, ugcRealMode: false, creatorPreset: null };
        ALL_UGC_LAYER_FIELDS.forEach(layer => {
          (next as any)[layer] = [];
        });
        enforceSingleSelectLayers(next);
        return next;
      });
    }
  }, [hasModelReference, values.ugcRealMode, values.creatorPreset]);

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
    const shouldDisablePerson = values.formulationStoryEnabled;
    if (values.noPerson !== shouldDisablePerson) {
      updateValue('noPerson', shouldDisablePerson);
    }
  }, [values.formulationStoryEnabled, values.noPerson, updateValue]);

  useEffect(() => {
    if (values.ugcRealMode && values.formulationStoryEnabled) {
      updateValue('formulationStoryEnabled', false);
    }
  }, [values.ugcRealMode, values.formulationStoryEnabled, updateValue]);

  const environmentSection = (
    <AccordionSection
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

        <div className="pt-3 space-y-2">
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
                  markSectionTouched('environment');
                }}
                className={getPillClass(values.sceneOrderChaos === option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>
    </AccordionSection>
  );
  const lightingSection = (
    <AccordionSection
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
    </AccordionSection>
  );
  const heroPersonaBlock = (
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
  );
  const cameraContent = (
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
  );
  const cameraSection = (
    <AccordionSection
      icon={Camera}
      title="Camera & Framing"
      tooltip="How the scene is captured"
      isOpen={openAccordionId === 'camera'}
      onToggle={() => toggleSection('camera')}
      isTouched={touchedSections.has('camera')}
    >
      {cameraContent}
    </AccordionSection>
  );
  const rawDomesticSection = (
    <AccordionSection
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
                      <AccordionSection
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
                      </AccordionSection>
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
                </div>
              </>
            )}

          </div>
        </div>
      </div>
    </AccordionSection>
  );
  const customClothesSection = (
    <AccordionSection
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
    </AccordionSection>
  );
  const formulationStorySection = (
    <AccordionSection
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
    </AccordionSection>
  );
  const outputFormatSection = (
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
  );
  return (
    <div className="w-full max-w-2xl mx-auto space-y-4 p-4">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <p className="text-xs uppercase tracking-widest text-indigo-300">Step 3</p>
        <h2 className="text-2xl font-bold text-gray-200">Scene Builder</h2>
        <p className="text-sm text-gray-400">Define how the scene looks, feels, and behaves visually.</p>
      </div>

      <AccordionSection
        icon={User}
        title="Creator / Person"
        tooltip="Define the person in your scene"
        isOpen={openAccordionId === 'creator'}
        onToggle={() => toggleSection('creator')}
        isRequired={!isPersonDisabled}
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
      </AccordionSection>

      {rawDomesticSection}
      {customClothesSection}
      {environmentSection}
      {lightingSection}
      {heroPersonaBlock}
      {!isUGCMode && cameraSection}
      {formulationStorySection}
      {outputFormatSection}
    </div>
  );
};

export default SceneBuilderLifestyle;
