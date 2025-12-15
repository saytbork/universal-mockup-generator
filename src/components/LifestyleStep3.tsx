import React, { useState, useEffect } from 'react';
import {
  SlidersHorizontal, User, Palette, Activity, Scissors, Smile, Eye, Sparkles,
  Clock, Sun, Camera, Rotate3d, Layout, Hand, Smartphone, Shirt, Layers, Film,
  Home, MapPin, Coffee, Utensils, Car, Waves, Mountain, Building2, Edit3, Heart, Check
} from 'lucide-react';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface LifestyleStep3Props {
  isProductMode?: boolean;
  onValuesChange?: (values: Step3Values) => void;
  onCanGenerateChange?: (canGenerate: boolean) => void;
}

export interface Step3Values {
  // Creator/Person
  age: number; // DEPRECATED - use ageGroup
  ageGroup: string; // NEW: explicit age chips
  noPerson: boolean;
  gender: 'Male' | 'Female';
  skinTone: string; // Now 7 refined options
  ethnicity: string;
  bodyType: 'Slim' | 'Average' | 'Athletic' | 'Curvy' | 'Plus size';
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

  // Environment
  environment: string;
  customEnvironment: string;

  // Time & Lighting
  timeOfDay: string;
  lightingStyle: string;

  // Mood
  mood: string;

  // Camera
  shotType: string;
  cameraAngle: string;
  framing: string;

  // Product Interaction
  productInteraction: string;

  // Realism
  ugcRealMode: boolean;

  // Selfie Type (for UGC framing)
  selfieType: string;

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

  // Background
  preserveEnvironment: boolean;
  backgroundBlur: boolean;
  allowMessiness: boolean;
  noArtificialProps: boolean;

  // Formulation Story
  formulationStoryEnabled: boolean;
  formulationPreset: string;
  formulationName: string;
  formulationRole: string;
  formulationLabVibe: string;

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
// Age Group - Explicit chips
const AGE_GROUP_OPTIONS = [
  '6–12',
  '13–17',
  '18–25',
  '26–35',
  '36–45',
  '46–60',
  '60–75',
  '75+',
  'No Person'
];

const GENDER_OPTIONS = ['Male', 'Female'];

// Refined Skin Tone (7 options)
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
const BODY_TYPE_OPTIONS = ['Slim', 'Average', 'Athletic', 'Curvy', 'Plus size'];

// 3D Hair System
const HAIR_LENGTH_OPTIONS = ['Buzzcut', 'Short', 'Chin-length', 'Shoulder', 'Long', 'Very long'];
const HAIR_TEXTURE_OPTIONS = ['Straight', 'Wavy', 'Curly', 'Coily/Kinky', 'Locs'];
const HAIR_COLOR_OPTIONS = ['Black', 'Dark brown', 'Light brown', 'Blonde', 'Red', 'Gray/White', 'Unnatural (pink, blue, etc)'];

// Expression - Expanded options
const EXPRESSION_OPTIONS = [
  'Soft Smile',
  'Full Smile',
  'Serious Focus',
  'Excited Surprise',
  'Stressed but Hopeful',
  'Caffeinated Crash',
  'Real-Life Calm',
  'UGC Reality'
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

// Pose
const POSE_OPTIONS = [
  'Relaxed Portrait',
  'Dynamic Mid-Action',
  'Over-the-Shoulder',
  'Leaned-In Close',
  'Hands-Only Crop',
  'Face Frame Hero',
  'Grounded Lounge',
  'Offer-to-Lens Reach'
];

// Interaction (Product)
const INTERACTION_OPTIONS = [
  'Holding',
  'Using',
  'Showing to Camera',
  'Unboxing',
  'Applying',
  'Placing on Surface'
];

// Wardrobe Presets
const WARDROBE_PRESET_OPTIONS = [
  'Casual Streetwear',
  'Athleisure Set',
  'Minimal Luxe',
  'Cozy Knitwear',
  'Bold Color Pop',
  'Errand-Day Layers',
  'Custom'
];

// Props
const PROPS_OPTIONS = [
  'None',
  'Smartphone / Tech',
  'Coffee / Beverage',
  'Notebook / Journal',
  'Makeup Tool',
  'Shopping Tote',
  'Custom'
];

// Skin Realism
const SKIN_REALISM_OPTIONS = [
  'Real Raw Photo',
  'Natural Clean Retouch',
  'Beauty Editorial Soft Skin'
];

// Selfie Type - Exact spec options
const SELFIE_TYPE_OPTIONS = [
  'None',
  'Arm\'s Length Selfie',
  'Mirror Selfie (phone visible)',
  'One-hand product selfie',
  'Overhead in-bed selfie',
  'Low-angle hero selfie',
  'Back camera POV'
];

const CREATOR_PRESETS = [
  { id: 'beauty', label: 'Beauty Creator', icon: Sparkles },
  { id: 'wellness', label: 'Wellness Coach', icon: Heart },
  { id: 'fitness', label: 'Fitness Creator', icon: Activity },
  { id: 'everyday', label: 'Everyday Hustler', icon: Coffee },
  { id: 'streetwear', label: 'Streetwear Reviewer', icon: Shirt },
  { id: 'custom', label: 'Custom Build', icon: Edit3 },
];

const ENVIRONMENT_INDOOR = [
  { value: 'Living Room', icon: Home },
  { value: 'Kitchen', icon: Utensils },
  { value: 'Bedroom', icon: Home },
  { value: 'Coffee Shop', icon: Coffee },
  { value: 'Office', icon: Building2 },
];

const ENVIRONMENT_OUTDOOR = [
  { value: 'City Street', icon: Building2 },
  { value: 'Park', icon: Mountain },
  { value: 'Beach', icon: Waves },
  { value: 'Car Interior', icon: Car },
];

const TIME_OF_DAY_OPTIONS = ['Morning', 'Midday', 'Afternoon', 'Golden Hour', 'Evening', 'Night'];
const LIGHTING_STYLE_OPTIONS = ['Natural window', 'Soft diffused', 'Direct sunlight', 'Indoor artificial', 'Moody/dramatic', 'Phone flashlight'];
// Mood - Expanded options
const MOOD_OPTIONS = [
  'Calm & Serene',
  'Joyful & High-Energy',
  'Confident & Editorial',
  'Playful & Candid',
  'Hustle & Juggle',
  'Stressed but Determined'
];
const SHOT_TYPE_OPTIONS = ['Close-up', 'Medium', 'Full body', 'Product focus', 'Environmental'];
const CAMERA_ANGLE_OPTIONS = ['Eye level', 'Slightly above', 'Slightly below', 'Dutch angle'];
const FRAMING_OPTIONS = ['Centered', 'Rule of thirds', 'Off-center', 'Spontaneous'];
const PRODUCT_INTERACTION_OPTIONS = INTERACTION_OPTIONS; // Use the same
const ASPECT_RATIO_OPTIONS = ['1:1 (Square)', '4:5 (Portrait)', '9:16 (Story)'];

const AGE_GROUP_CHIP_OPTIONS = AGE_GROUP_OPTIONS.filter(option => option !== 'No Person');

const CREATION_INTENT_OPTIONS = [
  { value: 'ugc', label: 'UGC Intent', description: 'Authentic creator moments' },
  { value: 'product', label: 'Product / Ecommerce Intent', description: 'Product-first ecommerce' },
  { value: 'brand', label: 'Brand Expert Intent', description: 'Expert-led narratives' }
];

const CREATION_MODE_OPTIONS = [
  'Lifestyle UGC',
  'Studio Hero',
  'Aesthetic Builder',
  'Background Replace',
  'Ecommerce Blank Space'
];

const COMPOSITION_MODE_OPTIONS = ['Lifestyle Showcase', 'Editorial Spread', 'Blank Space'];
const SIDE_PLACEMENT_OPTIONS = ['Left', 'Center', 'Right'];
const ECOMMERCE_BACKGROUND_COLORS = ['#0f172a', '#161b31', '#1f2937', '#111827', '#0b1220'];

const FORMULATION_PRESETS = ['Clinical Research', 'Lifestyle Study', 'Functional Science'];
const LAB_VIBE_OPTIONS = ['Clean Lab', 'Moody Lab', 'Warm Studio'];

const FINAL_OUTPUT_BACKGROUND_FLAGS: Array<{ key: 'preserveEnvironment' | 'backgroundBlur' | 'allowMessiness' | 'noArtificialProps'; label: string }> = [
  { key: 'preserveEnvironment', label: 'Preserve environment details' },
  { key: 'backgroundBlur', label: 'Background blur (portrait)' },
  { key: 'allowMessiness', label: 'Allow realistic messiness' },
  { key: 'noArtificialProps', label: 'No artificial props' }
];

const FINAL_OUTPUT_ADVANCED_FLAGS: Array<{ key: 'sameCreatorAcrossScenes' | 'sceneContinuity' | 'cinematicLook' | 'storytellingConsistency'; label: string }> = [
  { key: 'sameCreatorAcrossScenes', label: 'Same creator across scenes' },
  { key: 'sceneContinuity', label: 'Scene continuity' },
  { key: 'cinematicLook', label: 'Cinematic look' },
  { key: 'storytellingConsistency', label: 'Storytelling consistency' }
];

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
        <div className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </div>
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
const LifestyleStep3: React.FC<LifestyleStep3Props> = ({ isProductMode = false, onValuesChange, onCanGenerateChange }) => {
  const [isPro, setIsPro] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>('creator');
  const [touchedSections, setTouchedSections] = useState<Set<string>>(new Set());

  const initialValues: Step3Values = {
    // Creator/Person
    age: 30, // DEPRECATED - keeping for backward compatibility
    ageGroup: '26–35', // NEW: explicit age group
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
    facialExpression: 'Soft Smile', // UGC Rule: friendly default
    eyeDirection: 'Looking at camera', // UGC Rule: eye contact
    eyeColor: 'Brown', // NEW
    appearanceLevel: 'Regular', // NEW
    pose: 'Relaxed Portrait', // UGC Rule: natural pose
    skinRealism: 'Real Raw Photo', // NEW - UGC default

    // Creator Presets
    creatorPreset: null,

    // Environment - UGC Rule: must have table/surface for product
    environment: 'Kitchen', // Kitchen has table/counter surface by default
    customEnvironment: '',

    // Time & Lighting
    timeOfDay: 'Midday',
    lightingStyle: 'Natural window',

    // Mood
    mood: 'Calm & Serene', // Updated to new options

    // Camera
    shotType: 'Medium',
    cameraAngle: 'Eye level',
    framing: 'Centered',

    // Product Interaction
    productInteraction: 'Holding', // UGC Rule: product in hand

    // Realism
    ugcRealMode: true, // UGC Rule: ALWAYS ON by default

    // Selfie Type
    selfieType: 'One-hand product selfie', // UGC Rule: NEVER 'None', product in hand

    // Wardrobe
    wardrobe: 'Casual Streetwear', // Updated to preset options

    // Props - NEW
    props: 'None',
    customProps: '',

    // Creation Intent / Modes
    creationIntent: 'ugc',
    creationMode: CREATION_MODE_OPTIONS[0],
    compositionMode: COMPOSITION_MODE_OPTIONS[0],
    sidePlacement: SIDE_PLACEMENT_OPTIONS[1],
    ecommerceBackgroundColor: ECOMMERCE_BACKGROUND_COLORS[0],

    // Background
    preserveEnvironment: false,
    backgroundBlur: false,
    allowMessiness: true,
    noArtificialProps: true,

    // Formulation Story
    formulationStoryEnabled: false,
    formulationPreset: FORMULATION_PRESETS[0],
    formulationName: '',
    formulationRole: '',
    formulationLabVibe: LAB_VIBE_OPTIONS[0],

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
    setOpenSection(openSection === section ? null : section);
  };

  const markSectionTouched = (section: string) => {
    setTouchedSections(prev => {
      const newSet = new Set(prev);
      newSet.add(section);
      return newSet;
    });
  };

  const updateValue = <K extends keyof Step3Values>(key: K, value: Step3Values[K]) => {
    setValues(prev => ({ ...prev, [key]: value }));
  };

  const toggleBooleanFlag = <K extends keyof Step3Values>(key: K) => {
    const current = values[key];
    if (typeof current === 'boolean') {
      updateValue(key, (!current) as Step3Values[K]);
    }
  };

  useEffect(() => {
    if (onValuesChange) {
      onValuesChange(values);
    }
  }, [values, onValuesChange]);

  const isPersonDisabled = values.noPerson;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 pb-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold text-gray-200">Scene Builder</h2>
        <p className="text-sm text-gray-400">Create authentic lifestyle moments</p>
      </div>

      {/* Basic/Pro Toggle */}
      <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-gray-800/50 border border-gray-700">
        <span className={`text-sm font-medium ${!isPro ? 'text-white' : 'text-gray-400'}`}>BASIC</span>
        <button
          type="button"
          onClick={() => setIsPro(!isPro)}
          className={`relative w-12 h-6 rounded-full transition ${isPro ? 'bg-indigo-600' : 'bg-gray-600'}`}
        >
          <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${isPro ? 'translate-x-6' : ''}`} />
        </button>
        <span className={`text-sm font-medium ${isPro ? 'text-white' : 'text-gray-400'}`}>PRO</span>
      </div>

      {/* Creator / Person */}
      <AccordionSection
        icon={User}
        title="Creator / Person"
        tooltip="Define the person in your scene"
        isOpen={openSection === 'creator'}
        onToggle={() => toggleSection('creator')}
        isRequired={!isProductMode}
        isTouched={touchedSections.has('creator')}
      >
        <div className="flex flex-col gap-4">
          <button
            type="button"
            onClick={() => { updateValue('noPerson', !values.noPerson); markSectionTouched('creator'); }}
            className={`w-full rounded-lg border px-3 py-2.5 text-sm transition ${values.noPerson
              ? 'border-amber-400 bg-amber-500/10 text-white'
              : 'border-gray-600 bg-gray-800/30 text-gray-300 hover:border-gray-500'
              }`}
          >
            {values.noPerson ? '✓ No person in scene' : 'Include person in scene'}
          </button>

          {!isPersonDisabled && (
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs uppercase tracking-wider text-indigo-200">
                  <span>Age</span>
                  <span className="text-xs text-gray-300">Age: {values.age} years</span>
                </div>
                <input
                  type="range"
                  min={18}
                  max={90}
                  value={values.age}
                  onChange={(e) => { updateValue('age', Number(e.target.value)); markSectionTouched('creator'); }}
                  className="w-full accent-indigo-400"
                />
                <div className="flex flex-wrap gap-2">
                  {AGE_GROUP_CHIP_OPTIONS.map(option => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => { updateValue('ageGroup', option); markSectionTouched('creator'); }}
                      className={`rounded-full border px-3 py-1 text-xs transition ${values.ageGroup === option
                        ? 'border-indigo-400 bg-indigo-500/10 text-white'
                        : 'border-gray-600 text-gray-300 hover:border-gray-500'
                        }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wider text-indigo-200">GENDER</p>
                <div className="flex gap-2">
                  {GENDER_OPTIONS.map(option => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => { updateValue('gender', option as any); markSectionTouched('creator'); }}
                      className={`flex-1 rounded-lg border px-3 py-2 text-xs transition ${values.gender === option
                        ? 'border-indigo-400 bg-indigo-500/10 text-white'
                        : 'border-gray-600 text-gray-300 hover:border-gray-500'
                        }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wider text-indigo-200">ETHNICITY</p>
                <div className="grid grid-cols-2 gap-2">
                  {ETHNICITY_OPTIONS.map(option => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => { updateValue('ethnicity', option); markSectionTouched('creator'); }}
                      className={`rounded-lg border px-2 py-2 text-xs transition ${values.ethnicity === option
                        ? 'border-indigo-400 bg-indigo-500/10 text-white'
                        : 'border-gray-600 text-gray-300 hover:border-gray-500'
                        }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wider text-indigo-200">SKIN TONE</p>
                <div className="grid grid-cols-2 gap-2">
                  {SKIN_TONE_OPTIONS.map(option => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => { updateValue('skinTone', option); markSectionTouched('creator'); }}
                      className={`rounded-lg border px-2 py-2 text-xs transition ${values.skinTone === option
                        ? 'border-indigo-400 bg-indigo-500/10 text-white'
                        : 'border-gray-600 text-gray-300 hover:border-gray-500'
                        }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wider text-indigo-200">EYE COLOR</p>
                <div className="grid grid-cols-3 gap-2">
                  {EYE_COLOR_OPTIONS.map(option => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => { updateValue('eyeColor', option); markSectionTouched('creator'); }}
                      className={`rounded-lg border px-2 py-2 text-xs transition ${values.eyeColor === option
                        ? 'border-indigo-400 bg-indigo-500/10 text-white'
                        : 'border-gray-600 text-gray-300 hover:border-gray-500'
                        }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wider text-indigo-200">BODY TYPE</p>
                <div className="flex gap-2">
                  {BODY_TYPE_OPTIONS.map(option => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => { updateValue('bodyType', option as any); markSectionTouched('creator'); }}
                      className={`flex-1 rounded-lg border px-2 py-1.5 text-xs transition ${values.bodyType === option
                        ? 'border-indigo-400 bg-indigo-500/10 text-white'
                        : 'border-gray-600 text-gray-300 hover:border-gray-500'
                        }`}
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
                    className={`rounded-full px-3 py-1 text-xs transition ${values.hairState === 'bald'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-400'
                      : 'bg-gray-700/50 text-gray-400 border border-gray-600 hover:border-gray-500'
                      }`}
                  >
                    {values.hairState === 'bald' ? 'Bald' : 'Has hair'}
                  </button>
                </div>

                {values.hairState === 'natural' && (
                  <>
                    <div className="space-y-1.5">
                      <p className="text-xs text-gray-400">Length</p>
                      <div className="grid grid-cols-3 gap-1.5">
                        {HAIR_LENGTH_OPTIONS.map(option => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => { updateValue('hairLength', option); markSectionTouched('creator'); }}
                            className={`rounded border px-2 py-1 text-xs transition ${values.hairLength === option
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
                      <div className="grid grid-cols-3 gap-1.5">
                        {HAIR_TEXTURE_OPTIONS.map(option => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => { updateValue('hairTexture', option); markSectionTouched('creator'); }}
                            className={`rounded border px-2 py-1 text-xs transition ${values.hairTexture === option
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
                      <div className="grid grid-cols-2 gap-1.5">
                        {HAIR_COLOR_OPTIONS.map(option => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => { updateValue('hairColor', option); markSectionTouched('creator'); }}
                            className={`rounded border px-2 py-1 text-xs transition ${values.hairColor === option
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

              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wider text-indigo-200">FACIAL EXPRESSION</p>
                <div className="grid grid-cols-3 gap-2">
                  {EXPRESSION_OPTIONS.map(option => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => { updateValue('facialExpression', option); markSectionTouched('creator'); }}
                      className={`rounded-lg border px-2 py-1.5 text-xs transition ${values.facialExpression === option
                        ? 'border-indigo-400 bg-indigo-500/10 text-white'
                        : 'border-gray-600 text-gray-300 hover:border-gray-500'
                        }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wider text-indigo-200">EYE DIRECTION</p>
                <div className="flex gap-2">
                  {EYE_DIRECTION_OPTIONS.map(option => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => { updateValue('eyeDirection', option); markSectionTouched('creator'); }}
                      className={`flex-1 rounded-lg border px-2 py-1.5 text-xs transition ${values.eyeDirection === option
                        ? 'border-indigo-400 bg-indigo-500/10 text-white'
                        : 'border-gray-600 text-gray-300 hover:border-gray-500'
                        }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              {isProductMode && (
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-wider text-indigo-200">PRODUCT INTERACTION</p>
                  <div className="grid grid-cols-2 gap-2">
                    {PRODUCT_INTERACTION_OPTIONS.map(option => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => { updateValue('productInteraction', option); markSectionTouched('creator'); }}
                        className={`rounded-lg border px-2 py-2 text-xs transition ${values.productInteraction === option
                          ? 'border-indigo-400 bg-indigo-500/10 text-white'
                          : 'border-gray-600 text-gray-300 hover:border-gray-500'
                          }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </AccordionSection>

      {/* Output Format */}
      <AccordionSection
        icon={Layout}
        title="Output Format"
        tooltip="Aspect ratio for the final image"
        isOpen={openSection === 'output'}
        onToggle={() => toggleSection('output')}
      >
        <div className="grid grid-cols-3 gap-2">
          {ASPECT_RATIO_OPTIONS.map(option => (
            <button
              key={option}
              type="button"
              onClick={() => { updateValue('aspectRatio', option); markSectionTouched('output'); }}
              className={`rounded-lg border px-2 py-2 text-xs transition ${values.aspectRatio === option
                ? 'border-indigo-400 bg-indigo-500/10 text-white'
                : 'border-gray-600 text-gray-300 hover:border-gray-500'
                }`}
            >
              {option}
            </button>
          ))}
        </div>
      </AccordionSection>

      {/* Environment */}
      <AccordionSection
        icon={Home}
        title="Environment"
        tooltip="Where the scene takes place"
        isOpen={openSection === 'environment'}
        onToggle={() => toggleSection('environment')}
        isRequired={true}
        isTouched={touchedSections.has('environment')}
      >
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-wider text-indigo-200">INDOOR</p>
          <div className="grid grid-cols-3 gap-2">
            {ENVIRONMENT_INDOOR.map(env => (
              <button
                key={env.value}
                type="button"
                onClick={() => { updateValue('environment', env.value); markSectionTouched('environment'); }}
                className={`flex flex-col items-center gap-1 rounded-lg border p-3 transition ${values.environment === env.value
                  ? 'border-indigo-400 bg-indigo-500/10'
                  : 'border-gray-600 hover:border-gray-500'
                  }`}
              >
                <env.icon className="w-5 h-5 text-gray-300" />
                <span className="text-xs text-gray-300">{env.value}</span>
              </button>
            ))}
          </div>

          <p className="text-xs uppercase tracking-wider text-indigo-200 pt-2">OUTDOOR</p>
          <div className="grid grid-cols-3 gap-2">
            {ENVIRONMENT_OUTDOOR.map(env => (
              <button
                key={env.value}
                type="button"
                onClick={() => { updateValue('environment', env.value); markSectionTouched('environment'); }}
                className={`flex flex-col items-center gap-1 rounded-lg border p-3 transition ${values.environment === env.value
                  ? 'border-indigo-400 bg-indigo-500/10'
                  : 'border-gray-600 hover:border-gray-500'
                  }`}
              >
                <env.icon className="w-5 h-5 text-gray-300" />
                <span className="text-xs text-gray-300">{env.value}</span>
              </button>
            ))}
          </div>
        </div>
      </AccordionSection>

      {/* Time & Lighting */}
      <AccordionSection
        icon={Sun}
        title="Time & Lighting"
        tooltip="Control the lighting and time of day"
        isOpen={openSection === 'lighting'}
        onToggle={() => toggleSection('lighting')}
        isTouched={touchedSections.has('lighting')}
      >
        <div className="space-y-3">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wider text-indigo-200">TIME OF DAY</p>
            <div className="grid grid-cols-3 gap-2">
              {TIME_OF_DAY_OPTIONS.map(option => (
                <button
                  key={option}
                  type="button"
                  onClick={() => { updateValue('timeOfDay', option); markSectionTouched('lighting'); }}
                  className={`rounded-lg border px-2 py-1.5 text-xs transition ${values.timeOfDay === option
                    ? 'border-indigo-400 bg-indigo-500/10 text-white'
                    : 'border-gray-600 text-gray-300 hover:border-gray-500'
                    }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wider text-indigo-200">LIGHTING STYLE</p>
            <div className="grid grid-cols-2 gap-2">
              {LIGHTING_STYLE_OPTIONS.map(option => (
                <button
                  key={option}
                  type="button"
                  onClick={() => { updateValue('lightingStyle', option); markSectionTouched('lighting'); }}
                  className={`rounded-lg border px-2 py-1.5 text-xs transition ${values.lightingStyle === option
                    ? 'border-indigo-400 bg-indigo-500/10 text-white'
                    : 'border-gray-600 text-gray-300 hover:border-gray-500'
                    }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>
      </AccordionSection>

      {/* Mood */}
      <AccordionSection
        icon={Palette}
        title="Mood"
        tooltip="Overall feeling of the scene"
        isOpen={openSection === 'mood'}
        onToggle={() => toggleSection('mood')}
        isTouched={touchedSections.has('mood')}
      >
        <div className="grid grid-cols-3 gap-2">
          {MOOD_OPTIONS.map(option => (
            <button
              key={option}
              type="button"
              onClick={() => { updateValue('mood', option); markSectionTouched('mood'); }}
              className={`rounded-lg border px-2 py-2 text-xs transition ${values.mood === option
                ? 'border-indigo-400 bg-indigo-500/10 text-white'
                : 'border-gray-600 text-gray-300 hover:border-gray-500'
                }`}
            >
              {option}
            </button>
          ))}
        </div>
      </AccordionSection>

      {/* UGC Real Mode */}
      <AccordionSection
        icon={Smartphone}
        title="UGC Real Mode"
        tooltip="Creates an authentic user generated content look"
        isOpen={openSection === 'realism'}
        onToggle={() => toggleSection('realism')}
      >
        <div className="flex flex-col gap-3">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wider text-indigo-200">UGC Mode</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  updateValue('ugcRealMode', false);
                  updateValue('selfieType', 'None');
                }}
                className={`flex-1 rounded-lg border px-3 py-2 text-xs transition ${!values.ugcRealMode
                  ? 'border-indigo-400 bg-indigo-500/10 text-white'
                  : 'border-gray-600 text-gray-300 hover:border-gray-500'
                  }`}
              >
                OFF
              </button>
              <button
                type="button"
                onClick={() => {
                  updateValue('ugcRealMode', true);
                  if (values.selfieType === 'None') {
                    updateValue('selfieType', 'Standard selfie');
                    updateValue('facialExpression', 'Soft smile');
                    updateValue('eyeDirection', 'Looking at camera');
                  }
                }}
                className={`flex-1 rounded-lg border px-3 py-2 text-xs transition ${values.ugcRealMode
                  ? 'border-amber-300 bg-amber-500/10 text-white'
                  : 'border-gray-600 text-gray-300 hover:border-gray-500'
                  }`}
              >
                ON
              </button>
            </div>
          </div>

          {values.ugcRealMode && (
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wider text-indigo-200">SELFIE TYPE</p>
              <div className="grid grid-cols-2 gap-2">
                {SELFIE_TYPE_OPTIONS.map(option => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => updateValue('selfieType', option)}
                    className={`rounded-lg border px-2 py-2 text-xs transition ${values.selfieType === option
                      ? 'border-amber-300 bg-amber-500/10 text-white'
                      : 'border-gray-600 text-gray-300 hover:border-gray-500'
                      }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </AccordionSection>

      {/* Camera & Framing */}
      <AccordionSection
        icon={Camera}
        title="Camera & Framing"
        tooltip="How the scene is captured"
        isOpen={openSection === 'camera'}
        onToggle={() => toggleSection('camera')}
        isTouched={touchedSections.has('camera')}
      >
        <div className="space-y-3">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wider text-indigo-200">SHOT TYPE</p>
            <div className="grid grid-cols-3 gap-2">
              {SHOT_TYPE_OPTIONS.map(option => (
                <button
                  key={option}
                  type="button"
                  onClick={() => { updateValue('shotType', option); markSectionTouched('camera'); }}
                  className={`rounded-lg border px-2 py-1.5 text-xs transition ${values.shotType === option
                    ? 'border-indigo-400 bg-indigo-500/10 text-white'
                    : 'border-gray-600 text-gray-300 hover:border-gray-500'
                    }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wider text-indigo-200">CAMERA ANGLE</p>
            <div className="grid grid-cols-2 gap-2">
              {CAMERA_ANGLE_OPTIONS.map(option => (
                <button
                  key={option}
                  type="button"
                  onClick={() => { updateValue('cameraAngle', option); markSectionTouched('camera'); }}
                  className={`rounded-lg border px-2 py-1.5 text-xs transition ${values.cameraAngle === option
                    ? 'border-indigo-400 bg-indigo-500/10 text-white'
                    : 'border-gray-600 text-gray-300 hover:border-gray-500'
                    }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wider text-indigo-200">FRAMING</p>
            <div className="grid grid-cols-2 gap-2">
              {FRAMING_OPTIONS.map(option => (
                <button
                  key={option}
                  type="button"
                  onClick={() => { updateValue('framing', option); markSectionTouched('camera'); }}
                  className={`rounded-lg border px-2 py-1.5 text-xs transition ${values.framing === option
                    ? 'border-indigo-400 bg-indigo-500/10 text-white'
                    : 'border-gray-600 text-gray-300 hover:border-gray-500'
                    }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>
      </AccordionSection>

      {/* Creation Intent */}
      <AccordionSection
        icon={Sparkles}
        title="Creation Intent"
        tooltip="Creation Intent powers the builder logic"
        isOpen={openSection === 'creationIntent'}
        onToggle={() => toggleSection('creationIntent')}
      >
        <div className="space-y-3">
          <div className="rounded-2xl border border-indigo-500/30 bg-indigo-500/10 p-3 text-sm text-gray-200">
            Creation Intent governs how the scene behaves—UGC, ecommerce, or the expert-led brand tone.
          </div>
          <div className="flex flex-wrap gap-2">
            {CREATION_INTENT_OPTIONS.map(option => (
              <button
                key={option.value}
                type="button"
                onClick={() => { updateValue('creationIntent', option.value as Step3Values['creationIntent']); markSectionTouched('creationIntent'); }}
                className={`rounded-full border px-4 py-2 text-xs transition ${values.creationIntent === option.value
                  ? 'border-indigo-400 bg-indigo-500/10 text-white'
                  : 'border-gray-600 text-gray-300 hover:border-gray-500'
                  }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </AccordionSection>

      {/* Creation Modes */}
      <AccordionSection
        icon={Activity}
        title="Creation Modes"
        tooltip="Switch between lifestyle, studio, or ecommerce intent"
        isOpen={openSection === 'creationModes'}
        onToggle={() => toggleSection('creationModes')}
      >
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wider text-indigo-200">Switch between modes</p>
          <div className="flex flex-wrap gap-2">
            {CREATION_MODE_OPTIONS.map(option => (
              <button
                key={option}
                type="button"
                onClick={() => { updateValue('creationMode', option); markSectionTouched('creationModes'); }}
                className={`rounded-full border px-4 py-2 text-xs transition ${values.creationMode === option
                  ? 'border-indigo-400 bg-indigo-500/10 text-white'
                  : 'border-gray-600 text-gray-300 hover:border-gray-500'
                  }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </AccordionSection>

      {/* Ecommerce Image Builder (Pro) */}
      {isPro && (
        <AccordionSection
          icon={Building2}
          title="Ecommerce Image Builder (Pro)"
          tooltip="Pro controls for ecommerce composition"
          isOpen={openSection === 'ecommerceBuilder'}
          onToggle={() => toggleSection('ecommerceBuilder')}
        >
          <div className="space-y-3">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wider text-indigo-200">Composition Mode</p>
              <div className="flex flex-wrap gap-2">
                {COMPOSITION_MODE_OPTIONS.map(option => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => { updateValue('compositionMode', option); markSectionTouched('ecommerceBuilder'); }}
                    className={`rounded-full border px-3 py-1.5 text-xs transition ${values.compositionMode === option
                      ? 'border-indigo-400 bg-indigo-500/10 text-white'
                      : 'border-gray-600 text-gray-300 hover:border-gray-500'
                      }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wider text-indigo-200">Side Placement</p>
              <div className="flex gap-2">
                {SIDE_PLACEMENT_OPTIONS.map(option => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => { updateValue('sidePlacement', option); markSectionTouched('ecommerceBuilder'); }}
                    className={`flex-1 rounded-full border px-3 py-1.5 text-xs transition ${values.sidePlacement === option
                      ? 'border-indigo-400 bg-indigo-500/10 text-white'
                      : 'border-gray-600 text-gray-300 hover:border-gray-500'
                      }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wider text-indigo-200">Background Color</p>
              <div className="flex flex-wrap gap-2">
                {ECOMMERCE_BACKGROUND_COLORS.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => { updateValue('ecommerceBackgroundColor', color); markSectionTouched('ecommerceBuilder'); }}
                    className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition ${values.ecommerceBackgroundColor === color
                      ? 'border-indigo-400 bg-indigo-500/10 text-white'
                      : 'border-gray-600 text-gray-300 hover:border-gray-500'
                      }`}
                  >
                    <span className="inline-flex h-4 w-4 rounded-full border border-gray-600" style={{ backgroundColor: color }} />
                    {color}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </AccordionSection>
      )}

      {/* Formulation Story */}
      {isPro && (
        <AccordionSection
          icon={Edit3}
          title="Formulation Story"
          tooltip="Align brand expert, research, and product goals"
          isOpen={openSection === 'formulationStory'}
          onToggle={() => toggleSection('formulationStory')}
        >
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => {
                updateValue('formulationStoryEnabled', !values.formulationStoryEnabled);
                markSectionTouched('formulationStory');
              }}
              className={`w-full rounded-xl border px-4 py-2 text-sm font-medium transition ${values.formulationStoryEnabled
                ? 'border-amber-300 bg-amber-500/10 text-white'
                : 'border-gray-600 text-gray-300 hover:border-gray-500'
                }`}
            >
              Formulation Story {values.formulationStoryEnabled ? 'ON' : 'OFF'}
            </button>

            {values.formulationStoryEnabled && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-wider text-indigo-200">Presets</p>
                  <div className="flex flex-wrap gap-2">
                    {FORMULATION_PRESETS.map(option => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => { updateValue('formulationPreset', option); markSectionTouched('formulationStory'); }}
                        className={`rounded-full border px-3 py-1.5 text-xs transition ${values.formulationPreset === option
                          ? 'border-indigo-400 bg-indigo-500/10 text-white'
                          : 'border-gray-600 text-gray-300 hover:border-gray-500'
                          }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-indigo-200">Expert Name</label>
                  <input
                    type="text"
                    value={values.formulationName}
                    onChange={(e) => { updateValue('formulationName', e.target.value); markSectionTouched('formulationStory'); }}
                    className="w-full rounded-lg border border-gray-600 bg-gray-800/50 px-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    placeholder="e.g., Dr. Maya Collins"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-indigo-200">Expert Role</label>
                  <input
                    type="text"
                    value={values.formulationRole}
                    onChange={(e) => { updateValue('formulationRole', e.target.value); markSectionTouched('formulationStory'); }}
                    className="w-full rounded-lg border border-gray-600 bg-gray-800/50 px-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    placeholder="e.g., Clinical researcher"
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-wider text-indigo-200">Lab Vibe</p>
                  <div className="flex flex-wrap gap-2">
                    {LAB_VIBE_OPTIONS.map(option => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => { updateValue('formulationLabVibe', option); markSectionTouched('formulationStory'); }}
                        className={`rounded-full border px-3 py-1.5 text-xs transition ${values.formulationLabVibe === option
                          ? 'border-indigo-400 bg-indigo-500/10 text-white'
                          : 'border-gray-600 text-gray-300 hover:border-gray-500'
                          }`}
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
      )}

      {/* Final Output */}
      <AccordionSection
        icon={Layers}
        title="Final Output"
        tooltip="Wrap up wardrobe, props, and background behavior"
        isOpen={openSection === 'finalOutput'}
        onToggle={() => toggleSection('finalOutput')}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wider text-indigo-200">Wardrobe</p>
            <input
              type="text"
              value={values.wardrobe}
              onChange={(e) => { updateValue('wardrobe', e.target.value); markSectionTouched('finalOutput'); }}
              placeholder="e.g., Casual hoodie, white tee..."
              className="w-full rounded-lg border border-gray-600 bg-gray-800/50 px-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
            <div className="flex flex-wrap gap-2 pt-2">
              {WARDROBE_PRESET_OPTIONS.map(option => (
                <button
                  key={option}
                  type="button"
                  onClick={() => { updateValue('wardrobe', option); markSectionTouched('finalOutput'); }}
                  className={`rounded-full border px-3 py-1 text-xs transition ${values.wardrobe === option
                    ? 'border-indigo-400 bg-indigo-500/10 text-white'
                    : 'border-gray-600 text-gray-300 hover:border-gray-500'
                    }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wider text-indigo-200">Props</p>
            <input
              type="text"
              value={values.props}
              onChange={(e) => { updateValue('props', e.target.value); markSectionTouched('finalOutput'); }}
              placeholder="Describe props or items in scene"
              className="w-full rounded-lg border border-gray-600 bg-gray-800/50 px-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
            <input
              type="text"
              value={values.customProps}
              onChange={(e) => { updateValue('customProps', e.target.value); markSectionTouched('finalOutput'); }}
              placeholder="Custom props notes"
              className="w-full rounded-lg border border-gray-600 bg-gray-800/50 px-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wider text-indigo-200">Background Controls</p>
            <div className="grid gap-2">
              {FINAL_OUTPUT_BACKGROUND_FLAGS.map(flag => {
                const isActive = values[flag.key] as boolean;
                return (
                  <button
                    key={flag.key}
                    type="button"
                    onClick={() => {
                      toggleBooleanFlag(flag.key);
                      markSectionTouched('finalOutput');
                    }}
                    className={`flex items-center justify-between rounded-xl border px-4 py-2 text-xs transition ${isActive
                      ? 'border-indigo-400 bg-indigo-500/10 text-white'
                      : 'border-gray-600 text-gray-300 hover:border-gray-500'
                      }`}
                  >
                    <span>{flag.label}</span>
                    <span className="text-[10px] uppercase tracking-wider text-indigo-200">{isActive ? 'On' : 'Off'}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wider text-indigo-200">Advanced (Pro)</p>
            <div className="grid gap-2">
              {FINAL_OUTPUT_ADVANCED_FLAGS.map(flag => {
                const isActive = values[flag.key] as boolean;
                return (
                  <button
                    key={flag.key}
                    type="button"
                    onClick={() => {
                      toggleBooleanFlag(flag.key);
                      markSectionTouched('finalOutput');
                    }}
                    className={`flex items-center justify-between rounded-xl border px-4 py-2 text-xs transition ${isActive
                      ? 'border-indigo-400 bg-indigo-500/10 text-white'
                      : 'border-gray-600 text-gray-300 hover:border-gray-500'
                      }`}
                  >
                    <span>{flag.label}</span>
                    <span className="text-[10px] uppercase tracking-wider text-indigo-200">{isActive ? 'On' : 'Off'}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </AccordionSection>
    </div>
  );
};

export default LifestyleStep3;
