import React, { useState, useEffect } from 'react';
import {
  SlidersHorizontal, User, Palette, Activity, Scissors, Smile, Eye, Sparkles,
  Clock, Sun, Camera, Rotate3d, Layout, Hand, Smartphone, Shirt, Layers, Film,
  Home, MapPin, Coffee, Utensils, Car, Waves, Mountain, Building2, Edit3
} from 'lucide-react';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface LifestyleStep3Props {
  isProductMode?: boolean;
  onValuesChange?: (values: Step3Values) => void;
}

export interface Step3Values {
  // Creator/Person
  age: number;
  noPerson: boolean;
  gender: 'Male' | 'Female' | 'Non specific';
  skinTone: 'Light' | 'Medium' | 'Olive' | 'Brown' | 'Dark';
  bodyType: 'Slim' | 'Average' | 'Athletic' | 'Curvy' | 'Plus size';
  hair: string;
  facialExpression: string;
  eyeDirection: string;

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

  // Wardrobe
  wardrobe: string;

  // Background
  preserveEnvironment: boolean;
  backgroundBlur: boolean;
  allowMessiness: boolean;
  noArtificialProps: boolean;

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
const AGE_PRESETS = [
  { label: '18–25', value: 21 },
  { label: '26–35', value: 30 },
  { label: '36–45', value: 40 },
  { label: '46–60', value: 53 },
  { label: '60–75', value: 67 },
  { label: '75+', value: 80 },
];

const GENDER_OPTIONS = ['Male', 'Female', 'Non specific'];
const SKIN_TONE_OPTIONS = ['Light', 'Medium', 'Olive', 'Brown', 'Dark'];
const BODY_TYPE_OPTIONS = ['Slim', 'Average', 'Athletic', 'Curvy', 'Plus size'];
const HAIR_OPTIONS = ['Short', 'Medium', 'Long', 'Curly', 'Straight', 'Gray', 'Bald'];
const EXPRESSION_OPTIONS = ['Neutral', 'Soft smile', 'Happy', 'Confident', 'Relaxed', 'Candid'];
const EYE_DIRECTION_OPTIONS = ['Looking at camera', 'Looking at product', 'Looking away naturally'];

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
  { value: 'Bathroom', icon: Home },
  { value: 'Home Office', icon: Home },
  { value: 'Laundry Room', icon: Home },
  { value: 'Home Studio Chaos', icon: Home },
  { value: 'Entryway', icon: Home },
];

const ENVIRONMENT_OUTDOOR = [
  { value: 'Café', icon: Coffee },
  { value: 'Outdoors', icon: Mountain },
  { value: 'In the Car', icon: Car },
  { value: 'Beach', icon: Waves },
  { value: 'Garden Party', icon: Sparkles },
  { value: 'Rooftop', icon: Building2 },
  { value: 'Poolside', icon: Waves },
  { value: 'Farmer\'s Market', icon: MapPin },
  { value: 'Wellness Spa', icon: Sparkles },
  { value: 'Mountain Cabin', icon: Mountain },
];

const ENVIRONMENT_HOSPITALITY = [
  { value: 'Boutique Hotel', icon: Building2 },
];

const ENVIRONMENT_URBAN = [
  { value: 'Subway Platform', icon: Building2 },
];

const TIME_OF_DAY = ['Morning', 'Afternoon', 'Golden hour', 'Evening', 'Night'];
const LIGHTING_STYLES = ['Natural daylight', 'Soft window light', 'Golden hour warm', 'Indoor ambient', 'Overcast soft', 'Low light cinematic'];
const MOOD_OPTIONS = ['Casual everyday', 'Calm and relaxed', 'Happy and energetic', 'Cozy', 'Wellness focused', 'Authentic UGC', 'Candid, unposed'];
const SHOT_TYPES = ['Close up', 'Medium shot', 'Full body', 'Over the shoulder', 'POV', 'Selfie style'];
const CAMERA_ANGLES = ['Eye level', 'Slightly above', 'Slightly below', '3/4 angle'];
const FRAMING_OPTIONS = ['Centered', 'Rule of thirds', 'Off center lifestyle'];
const PRODUCT_INTERACTIONS = ['Holding product', 'Using product', 'Product on table', 'Product in hand casually', 'Product in background', 'Product secondary'];
const WARDROBE_OPTIONS = ['Casual', 'Athleisure', 'Wellness outfit', 'Streetwear', 'Home wear', 'Seasonal adaptive'];
const ASPECT_RATIOS = ['1:1', '4:5', '16:9', '9:16'];

// ============================================================================
// UI COMPONENTS
// ============================================================================

const Tooltip: React.FC<{ text: string; children: React.ReactNode }> = ({ text, children }) => (
  <div className="group relative inline-block">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
      <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
        {text}
        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
          <div className="border-4 border-transparent border-t-gray-900"></div>
        </div>
      </div>
    </div>
  </div>
);

const SectionHeader: React.FC<{ icon: React.ElementType; title: string; tooltip: string }> = ({ icon: Icon, title, tooltip }) => (
  <div className="flex items-center gap-2 mb-3">
    <Tooltip text={tooltip}>
      <Icon className="w-5 h-5 text-indigo-400" />
    </Tooltip>
    <h3 className="text-sm font-semibold text-gray-200 uppercase tracking-wider">{title}</h3>
  </div>
);

const PillButton: React.FC<{
  label: string;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
}> = ({ label, selected, onClick, disabled }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150 border ${selected
        ? 'bg-indigo-500/30 border-indigo-400 text-white'
        : 'bg-gray-800/50 border-gray-700/50 text-gray-400 hover:border-gray-500 hover:text-gray-300'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
  >
    {label}
  </button>
);

const SliderWithPresets: React.FC<{
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  presets: Array<{ label: string; value: number }>;
  disabled?: boolean;
}> = ({ value, onChange, min, max, presets, disabled }) => (
  <div className="space-y-2">
    <div className="flex items-center gap-3">
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
        className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer 
                   [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 
                   [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-500
                   [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 
                   [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-indigo-500 [&::-moz-range-thumb]:border-0"
      />
      <span className="text-sm font-medium text-white min-w-[3ch] text-right">{value}</span>
    </div>
    <div className="flex gap-2 flex-wrap">
      {presets.map(preset => (
        <button
          key={preset.value}
          type="button"
          onClick={() => onChange(preset.value)}
          disabled={disabled}
          className="px-2 py-1 text-xs rounded bg-gray-800/30 border border-gray-700/50 text-gray-400 hover:border-indigo-500 hover:text-indigo-300 transition"
        >
          {preset.label}
        </button>
      ))}
    </div>
  </div>
);

const SwatchSelector: React.FC<{
  options: string[];
  selected: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}> = ({ options, selected, onChange, disabled }) => {
  const getSwatchColor = (tone: string) => {
    const colors: Record<string, string> = {
      'Light': 'bg-amber-100',
      'Medium': 'bg-amber-300',
      'Olive': 'bg-yellow-700',
      'Brown': 'bg-amber-800',
      'Dark': 'bg-amber-950',
    };
    return colors[tone] || 'bg-gray-500';
  };

  return (
    <div className="flex gap-2">
      {options.map(option => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          disabled={disabled}
          className={`w-10 h-10 rounded-full ${getSwatchColor(option)} border-2 transition ${selected === option ? 'border-indigo-400 scale-110' : 'border-gray-600 hover:border-gray-400'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          title={option}
        />
      ))}
    </div>
  );
};

const AccordionSection: React.FC<{
  icon: React.ElementType;
  title: string;
  tooltip: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}> = ({ icon, title, tooltip, isOpen, onToggle, children }) => (
  <div className="border-b border-gray-700/30">
    <button
      type="button"
      onClick={onToggle}
      className="w-full flex justify-between items-center py-3 px-2 text-left transition-colors hover:bg-white/[0.02] rounded-lg"
    >
      <div className="flex items-center gap-2">
        <Tooltip text={tooltip}>
          {React.createElement(icon, { className: "w-4 h-4 text-indigo-400" })}
        </Tooltip>
        <span className="text-sm font-medium text-gray-200">{title}</span>
      </div>
      <svg
        className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </button>
    <div
      className={`overflow-hidden transition-all duration-200 ${isOpen ? 'max-h-[500px] opacity-100 pb-4 px-2' : 'max-h-0 opacity-0'
        }`}
    >
      {children}
    </div>
  </div>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================
const LifestyleStep3: React.FC<LifestyleStep3Props> = ({ isProductMode = false, onValuesChange }) => {
  const [values, setValues] = useState<Step3Values>({
    // Creator/Person
    age: 30,
    noPerson: false,
    gender: 'Female',
    skinTone: 'Medium',
    bodyType: 'Average',
    hair: 'Medium',
    facialExpression: 'Soft smile',
    eyeDirection: 'Looking at camera',

    // Creator Presets
    creatorPreset: null,

    // Environment
    environment: 'Living Room',
    customEnvironment: '',

    // Time & Lighting
    timeOfDay: 'Afternoon',
    lightingStyle: 'Soft window light',

    // Mood
    mood: 'Casual everyday',

    // Camera
    shotType: 'Medium shot',
    cameraAngle: 'Eye level',
    framing: 'Centered',

    // Product Interaction
    productInteraction: 'Holding product',

    // Realism
    ugcRealMode: true,

    // Wardrobe
    wardrobe: 'Casual',

    // Background
    preserveEnvironment: true,
    backgroundBlur: false,
    allowMessiness: true,
    noArtificialProps: false,

    // Advanced Pro
    sameCreatorAcrossScenes: false,
    sceneContinuity: false,
    cinematicLook: false,
    storytellingConsistency: false,

    // Output
    aspectRatio: '1:1',
  });

  const [openSection, setOpenSection] = useState<string | null>('creator');
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    onValuesChange?.(values);
  }, [values, onValuesChange]);

  const updateValue = <K extends keyof Step3Values>(key: K, value: Step3Values[K]) => {
    setValues(prev => ({ ...prev, [key]: value }));
  };

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const isPersonDisabled = isProductMode || values.noPerson;

  return (
    <div className="w-full flex flex-col gap-3 p-4">
      {/* Header */}
      <div className="border-b border-gray-700 pb-3">
        <p className="text-xs uppercase tracking-widest text-indigo-300">Step 3</p>
        <h2 className="text-xl font-bold text-gray-200">Scene Builder</h2>
        <p className="text-sm text-gray-400 mt-1">Create authentic lifestyle moments</p>
      </div>

      {/* Pro Mode Toggle */}
      <div className="flex items-center justify-between p-2 rounded-lg bg-gray-900/40 border border-gray-800">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-white">BASIC</span>
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              checked={isPro}
              onChange={(e) => setIsPro(e.target.checked)}
              className="sr-only"
            />
            <div className={`relative h-6 w-11 rounded-full transition ${isPro ? 'bg-indigo-600' : 'bg-gray-700'}`}>
              <span
                className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow transition ${isPro ? 'translate-x-5' : ''
                  }`}
              />
            </div>
          </label>
          <span className={`text-sm font-medium ${isPro ? 'text-white' : 'text-gray-400'}`}>PRO</span>
        </div>
      </div>

      {/* Sections */}
      <div className="flex flex-col">
        {/* Section 1: Creator / Person */}
        <AccordionSection
          icon={User}
          title="Creator / Person"
          tooltip="Define who appears in your lifestyle shot"
          isOpen={openSection === 'creator'}
          onToggle={() => toggleSection('creator')}
        >
          <div className="flex flex-col gap-4">
            {/* No Person Toggle */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="noPerson"
                checked={values.noPerson}
                onChange={(e) => updateValue('noPerson', e.target.checked)}
                className="w-4 h-4 rounded border-gray-600 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="noPerson" className="text-sm text-gray-300">
                No person in scene
              </label>
            </div>

            {/* Age Slider */}
            {!isPersonDisabled && (
              <>
                <div>
                  <SectionHeader icon={SlidersHorizontal} title="Age" tooltip="Select the age range that best matches your creator" />
                  <SliderWithPresets
                    value={values.age}
                    onChange={(v) => updateValue('age', v)}
                    min={18}
                    max={85}
                    presets={AGE_PRESETS}
                    disabled={isPersonDisabled}
                  />
                </div>

                {/* Gender */}
                <div>
                  <SectionHeader icon={User} title="Gender" tooltip="Choose gender presentation" />
                  <div className="flex gap-2 flex-wrap">
                    {GENDER_OPTIONS.map(option => (
                      <PillButton
                        key={option}
                        label={option}
                        selected={values.gender === option}
                        onClick={() => updateValue('gender', option as any)}
                        disabled={isPersonDisabled}
                      />
                    ))}
                  </div>
                </div>

                {/* Skin Tone */}
                <div>
                  <SectionHeader icon={Palette} title="Skin Tone" tooltip="Select skin tone" />
                  <SwatchSelector
                    options={SKIN_TONE_OPTIONS}
                    selected={values.skinTone}
                    onChange={(v) => updateValue('skinTone', v as any)}
                    disabled={isPersonDisabled}
                  />
                </div>

                {/* Body Type */}
                <div>
                  <SectionHeader icon={Activity} title="Body Type" tooltip="Choose body type" />
                  <div className="flex gap-2 flex-wrap">
                    {BODY_TYPE_OPTIONS.map(option => (
                      <PillButton
                        key={option}
                        label={option}
                        selected={values.bodyType === option}
                        onClick={() => updateValue('bodyType', option as any)}
                        disabled={isPersonDisabled}
                      />
                    ))}
                  </div>
                </div>

                {/* Hair */}
                <div>
                  <SectionHeader icon={Scissors} title="Hair" tooltip="Select hair style" />
                  <div className="flex gap-2 flex-wrap">
                    {HAIR_OPTIONS.map(option => (
                      <PillButton
                        key={option}
                        label={option}
                        selected={values.hair === option}
                        onClick={() => updateValue('hair', option)}
                        disabled={isPersonDisabled}
                      />
                    ))}
                  </div>
                </div>

                {/* Facial Expression */}
                <div>
                  <SectionHeader icon={Smile} title="Facial Expression" tooltip="Choose natural expression" />
                  <div className="flex gap-2 flex-wrap">
                    {EXPRESSION_OPTIONS.map(option => (
                      <PillButton
                        key={option}
                        label={option}
                        selected={values.facialExpression === option}
                        onClick={() => updateValue('facialExpression', option)}
                        disabled={isPersonDisabled}
                      />
                    ))}
                  </div>
                </div>

                {/* Eye Direction */}
                <div>
                  <SectionHeader icon={Eye} title="Eye Direction" tooltip="Where the creator is looking" />
                  <div className="flex gap-2 flex-wrap">
                    {EYE_DIRECTION_OPTIONS.map(option => (
                      <PillButton
                        key={option}
                        label={option}
                        selected={values.eyeDirection === option}
                        onClick={() => updateValue('eyeDirection', option)}
                        disabled={isPersonDisabled}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </AccordionSection>

        {/* Section 2: Creator Presets */}
        {isPro && (
          <AccordionSection
            icon={Sparkles}
            title="Creator Presets"
            tooltip="Quick presets for common creator types"
            isOpen={openSection === 'presets'}
            onToggle={() => toggleSection('presets')}
          >
            <div className="grid grid-cols-2 gap-2">
              {CREATOR_PRESETS.map(preset => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => updateValue('creatorPreset', preset.id)}
                  className={`p-3 rounded-lg border transition ${values.creatorPreset === preset.id
                      ? 'bg-indigo-500/20 border-indigo-400 text-white'
                      : 'bg-gray-800/30 border-gray-700 text-gray-400 hover:border-gray-500'
                    }`}
                >
                  <preset.icon className="w-5 h-5 mx-auto mb-1" />
                  <p className="text-xs font-medium">{preset.label}</p>
                </button>
              ))}
            </div>
          </AccordionSection>
        )}

        {/* Section 3: Environment / Location */}
        <AccordionSection
          icon={MapPin}
          title="Environment / Location"
          tooltip="Where the scene takes place"
          isOpen={openSection === 'environment'}
          onToggle={() => toggleSection('environment')}
        >
          <div className="flex flex-col gap-3">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Indoor</p>
              <div className="grid grid-cols-2 gap-2">
                {ENVIRONMENT_INDOOR.map(env => (
                  <PillButton
                    key={env.value}
                    label={env.value}
                    selected={values.environment === env.value}
                    onClick={() => updateValue('environment', env.value)}
                  />
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Outdoor</p>
              <div className="grid grid-cols-2 gap-2">
                {ENVIRONMENT_OUTDOOR.map(env => (
                  <PillButton
                    key={env.value}
                    label={env.value}
                    selected={values.environment === env.value}
                    onClick={() => updateValue('environment', env.value)}
                  />
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Other</p>
              <div className="flex gap-2 flex-wrap">
                {[...ENVIRONMENT_HOSPITALITY, ...ENVIRONMENT_URBAN].map(env => (
                  <PillButton
                    key={env.value}
                    label={env.value}
                    selected={values.environment === env.value}
                    onClick={() => updateValue('environment', env.value)}
                  />
                ))}
                <PillButton
                  label="Custom Environment"
                  selected={values.environment === 'Custom'}
                  onClick={() => updateValue('environment', 'Custom')}
                />
              </div>
            </div>

            {values.environment === 'Custom' && (
              <input
                type="text"
                value={values.customEnvironment}
                onChange={(e) => updateValue('customEnvironment', e.target.value)}
                placeholder="e.g. Zoo, Airport, Gym, Office Lobby"
                className="w-full rounded-lg border border-gray-700/50 bg-gray-800/50 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-indigo-400 focus:outline-none"
              />
            )}
          </div>
        </AccordionSection>

        {/* Section 4: Time of Day */}
        <AccordionSection
          icon={Clock}
          title="Time of Day"
          tooltip="What time of day the scene takes place"
          isOpen={openSection === 'time'}
          onToggle={() => toggleSection('time')}
        >
          <div className="flex gap-2 flex-wrap">
            {TIME_OF_DAY.map(time => (
              <PillButton
                key={time}
                label={time}
                selected={values.timeOfDay === time}
                onClick={() => updateValue('timeOfDay', time)}
              />
            ))}
          </div>
        </AccordionSection>

        {/* Section 5: Lighting Style */}
        <AccordionSection
          icon={Sun}
          title="Lighting Style"
          tooltip="The quality and mood of lighting"
          isOpen={openSection === 'lighting'}
          onToggle={() => toggleSection('lighting')}
        >
          <div className="flex gap-2 flex-wrap">
            {LIGHTING_STYLES.map(style => (
              <PillButton
                key={style}
                label={style}
                selected={values.lightingStyle === style}
                onClick={() => updateValue('lightingStyle', style)}
              />
            ))}
          </div>
        </AccordionSection>

        {/* Section 6: Mood / Vibe */}
        <AccordionSection
          icon={Sparkles}
          title="Mood / Vibe"
          tooltip="The overall feeling of the scene"
          isOpen={openSection === 'mood'}
          onToggle={() => toggleSection('mood')}
        >
          <div className="flex gap-2 flex-wrap">
            {MOOD_OPTIONS.map(mood => (
              <PillButton
                key={mood}
                label={mood}
                selected={values.mood === mood}
                onClick={() => updateValue('mood', mood)}
              />
            ))}
          </div>
        </AccordionSection>

        {/* Section 7: Camera & Composition */}
        <AccordionSection
          icon={Camera}
          title="Camera & Composition"
          tooltip="How the shot is composed"
          isOpen={openSection === 'camera'}
          onToggle={() => toggleSection('camera')}
        >
          <div className="flex flex-col gap-4">
            <div>
              <SectionHeader icon={Camera} title="Shot Type" tooltip="The framing of the shot" />
              <div className="grid grid-cols-3 gap-2">
                {SHOT_TYPES.map(shot => (
                  <PillButton
                    key={shot}
                    label={shot}
                    selected={values.shotType === shot}
                    onClick={() => updateValue('shotType', shot)}
                  />
                ))}
              </div>
            </div>

            <div>
              <SectionHeader icon={Rotate3d} title="Angle" tooltip="Camera angle" />
              <div className="flex gap-2 flex-wrap">
                {CAMERA_ANGLES.map(angle => (
                  <PillButton
                    key={angle}
                    label={angle}
                    selected={values.cameraAngle === angle}
                    onClick={() => updateValue('cameraAngle', angle)}
                  />
                ))}
              </div>
            </div>

            <div>
              <SectionHeader icon={Layout} title="Framing" tooltip="Composition style" />
              <div className="flex gap-2 flex-wrap">
                {FRAMING_OPTIONS.map(frame => (
                  <PillButton
                    key={frame}
                    label={frame}
                    selected={values.framing === frame}
                    onClick={() => updateValue('framing', frame)}
                  />
                ))}
              </div>
            </div>
          </div>
        </AccordionSection>

        {/* Section 8: Product Interaction */}
        <AccordionSection
          icon={Hand}
          title="Product Interaction"
          tooltip="How the creator interacts with the product"
          isOpen={openSection === 'interaction'}
          onToggle={() => toggleSection('interaction')}
        >
          <div className="flex gap-2 flex-wrap">
            {PRODUCT_INTERACTIONS.map(interaction => (
              <PillButton
                key={interaction}
                label={interaction}
                selected={values.productInteraction === interaction}
                onClick={() => updateValue('productInteraction', interaction)}
              />
            ))}
          </div>
        </AccordionSection>

        {/* Section 9: UGC Real Mode */}
        <AccordionSection
          icon={Smartphone}
          title="UGC Real Mode"
          tooltip="Creates an authentic user generated content look"
          isOpen={openSection === 'realism'}
          onToggle={() => toggleSection('realism')}
        >
          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-700 bg-gray-800/30 cursor-pointer hover:border-indigo-500 transition">
              <input
                type="checkbox"
                checked={values.ugcRealMode}
                onChange={(e) => updateValue('ugcRealMode', e.target.checked)}
                className="w-5 h-5 rounded border-gray-600 text-indigo-600 focus:ring-indigo-500"
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-white">Enable UGC Real Mode</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Authentic phone quality, natural lighting, real skin texture
                </p>
              </div>
            </label>
          </div>
        </AccordionSection>

        {/* Section 10: Wardrobe */}
        <AccordionSection
          icon={Shirt}
          title="Wardrobe"
          tooltip="What the creator is wearing"
          isOpen={openSection === 'wardrobe'}
          onToggle={() => toggleSection('wardrobe')}
        >
          <div className="flex gap-2 flex-wrap">
            {WARDROBE_OPTIONS.map(option => (
              <PillButton
                key={option}
                label={option}
                selected={values.wardrobe === option}
                onClick={() => updateValue('wardrobe', option)}
                disabled={isPersonDisabled}
              />
            ))}
          </div>
        </AccordionSection>

        {/* Section 11: Background Behavior */}
        <AccordionSection
          icon={Layers}
          title="Background Behavior"
          tooltip="How the background should look"
          isOpen={openSection === 'background'}
          onToggle={() => toggleSection('background')}
        >
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={values.preserveEnvironment}
                onChange={(e) => updateValue('preserveEnvironment', e.target.checked)}
                className="w-4 h-4 rounded border-gray-600 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-300">Preserve natural environment</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={values.backgroundBlur}
                onChange={(e) => updateValue('backgroundBlur', e.target.checked)}
                className="w-4 h-4 rounded border-gray-600 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-300">Slight background blur</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={values.allowMessiness}
                onChange={(e) => updateValue('allowMessiness', e.target.checked)}
                className="w-4 h-4 rounded border-gray-600 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-300">Allow real world messiness</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={values.noArtificialProps}
                onChange={(e) => updateValue('noArtificialProps', e.target.checked)}
                className="w-4 h-4 rounded border-gray-600 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-300">No artificial props</span>
            </label>
          </div>
        </AccordionSection>

        {/* Section 12: Advanced Lifestyle (Pro) */}
        {isPro && (
          <AccordionSection
            icon={Film}
            title="Advanced Lifestyle"
            tooltip="Professional options for scene consistency"
            isOpen={openSection === 'advanced'}
            onToggle={() => toggleSection('advanced')}
          >
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={values.sameCreatorAcrossScenes}
                  onChange={(e) => updateValue('sameCreatorAcrossScenes', e.target.checked)}
                  className="w-4 h-4 rounded border-gray-600 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-300">Same creator across scenes</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={values.sceneContinuity}
                  onChange={(e) => updateValue('sceneContinuity', e.target.checked)}
                  className="w-4 h-4 rounded border-gray-600 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-300">Scene continuity</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={values.cinematicLook}
                  onChange={(e) => updateValue('cinematicLook', e.target.checked)}
                  className="w-4 h-4 rounded border-gray-600 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-300">Cinematic lifestyle look</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={values.storytellingConsistency}
                  onChange={(e) => updateValue('storytellingConsistency', e.target.checked)}
                  className="w-4 h-4 rounded border-gray-600 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-300">Storytelling consistency</span>
              </label>
            </div>
          </AccordionSection>
        )}

        {/* Output Settings */}
        <AccordionSection
          icon={Camera}
          title="Output Settings"
          tooltip="Image output specifications"
          isOpen={openSection === 'output'}
          onToggle={() => toggleSection('output')}
        >
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wider">Aspect Ratio</label>
            <div className="flex gap-2 mt-2">
              {ASPECT_RATIOS.map(ratio => (
                <PillButton
                  key={ratio}
                  label={ratio}
                  selected={values.aspectRatio === ratio}
                  onClick={() => updateValue('aspectRatio', ratio)}
                />
              ))}
            </div>
          </div>
        </AccordionSection>
      </div>
    </div>
  );
};

export default LifestyleStep3;
