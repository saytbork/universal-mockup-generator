import React, { useState } from 'react';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface LifestyleStep3Props {
  isProductMode?: boolean;
  onValuesChange?: (values: Step3Values) => void;
}

interface Step3Values {
  sceneType: string;
  microLocation: string;
  lighting: string;
  shotType: string;
  personType: string;
  skinTone: string;
  ageGroup: string;
  ethnicity: string;
  talentNotes: string;
  wardrobe: string;
  productInteraction: string;
  propBundle: string;
  storyMode: string;
  aspectRatio: string;
  resolution: string;
  variations: string;
  seed: string;
}

// ============================================================================
// CHIP OPTIONS (Human-readable labels)
// ============================================================================
const SCENE_TYPES = ['Close up', 'Medium', 'Wide', 'Aesthetic soft', 'High contrast'];
const MICRO_LOCATIONS = ['Kitchen set', 'Bathroom vanity', 'Living room', 'Neutral soft', 'Outdoor patio'];
const LIGHTING_OPTIONS = ['Soft', 'Hard', 'Studio'];
const SHOT_TYPES = ['Portrait', 'Flat lay', 'Straight on', 'Dutch angle', 'Low angle', 'High angle'];
const PERSON_TYPES = ['Woman', 'Man', 'Couple', 'Family', 'No person'];
const SKIN_TONES = ['Light', 'Medium', 'Tan', 'Deep'];
const AGE_GROUPS = ['Teen', 'Adult', 'Senior'];
const ETHNICITIES = ['Black', 'Asian', 'Latino', 'White', 'Mixed'];
const WARDROBE_OPTIONS = ['Casual', 'Sporty', 'Elegant', 'Neutral', 'Colorful'];
const INTERACTION_OPTIONS = ['Holding product', 'Using product', 'Placing product', 'Near product'];
const PROP_BUNDLES = ['Clean', 'Kitchen', 'Bathroom', 'Beauty', 'Nature'];
const STORY_MODES = ['None', 'Chemist', 'Doctor', 'Lab'];
const ASPECT_RATIOS = ['1:1', '4:5', '16:9', '9:16'];
const RESOLUTIONS = ['Standard', '2K', '4K'];
const VARIATIONS = ['1', '2', '4'];

// ============================================================================
// CHIP COMPONENT
// ============================================================================
interface ChipProps {
  label: string;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
}

const Chip: React.FC<ChipProps> = ({ label, selected, onClick, disabled }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150 border
      ${selected
        ? 'bg-indigo-500/30 border-indigo-400 text-white'
        : 'bg-gray-800/50 border-gray-700/50 text-gray-400 hover:border-gray-500 hover:text-gray-300'}
      ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    `}
  >
    {label}
  </button>
);

// ============================================================================
// CHIP GROUP COMPONENT
// ============================================================================
interface ChipGroupProps {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const ChipSelect: React.FC<ChipGroupProps> = ({ label, options, value, onChange, disabled }) => (
  <div className="flex flex-col gap-2">
    <label className="text-xs text-gray-400 uppercase tracking-wider">{label}</label>
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <Chip
          key={option}
          label={option}
          selected={value === option}
          onClick={() => onChange(option)}
          disabled={disabled}
        />
      ))}
    </div>
  </div>
);

// ============================================================================
// ACCORDION SECTION COMPONENT (One-at-a-time)
// ============================================================================
interface SectionProps {
  id: string;
  title: string;
  isOpen: boolean;
  onToggle: (id: string) => void;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ id, title, isOpen, onToggle, children }) => (
  <div className="border-b border-gray-700/30 last:border-b-0">
    <button
      type="button"
      onClick={() => onToggle(id)}
      className="w-full flex justify-between items-center py-3 px-2 text-left transition-colors hover:bg-white/[0.02] rounded-lg"
    >
      <span className="text-sm font-medium text-gray-200">{title}</span>
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
      className={`overflow-hidden transition-all duration-200 ${isOpen ? 'max-h-[500px] opacity-100 pb-4 px-2' : 'max-h-0 opacity-0'}`}
    >
      {children}
    </div>
  </div>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================
const LifestyleStep3: React.FC<LifestyleStep3Props> = ({
  isProductMode = false,
  onValuesChange
}) => {
  // Mode state
  const [isProMode, setIsProMode] = useState(false);

  // Accordion state (one-at-a-time)
  const [openSection, setOpenSection] = useState<string | null>('scene');

  // Form values
  const [values, setValues] = useState<Step3Values>({
    sceneType: '',
    microLocation: '',
    lighting: '',
    shotType: '',
    personType: '',
    skinTone: '',
    ageGroup: '',
    ethnicity: '',
    talentNotes: '',
    wardrobe: '',
    productInteraction: '',
    propBundle: '',
    storyMode: 'None',
    aspectRatio: '1:1',
    resolution: 'Standard',
    variations: '1',
    seed: '',
  });

  // Determine if UGC mode (opposite of Product mode)
  const isUGCMode = !isProductMode;

  // Handle section toggle (one-at-a-time)
  const handleSectionToggle = (sectionId: string) => {
    setOpenSection(prev => prev === sectionId ? null : sectionId);
  };

  // Handle value change
  const updateValue = <K extends keyof Step3Values>(key: K, value: Step3Values[K]) => {
    const newValues = { ...values, [key]: value };
    setValues(newValues);
    onValuesChange?.(newValues);
  };

  // Randomize seed
  const randomizeSeed = () => {
    const randomSeed = Math.floor(Math.random() * 999999999).toString();
    updateValue('seed', randomSeed);
  };

  return (
    <div className="w-full flex flex-col gap-3 p-4">
      {/* Step 3 Header */}
      <div className="border-b border-gray-700 pb-3">
        <p className="text-xs uppercase tracking-widest text-indigo-300">Step 3</p>
        <h2 className="text-xl font-bold text-gray-200">Customize Your Mockup</h2>
      </div>

      {/* BASIC/PRO Toggle */}
      <div className="flex items-center justify-between p-2 rounded-lg bg-gray-900/40 border border-gray-800">
        <div className="flex items-center gap-3">
          <span className={`text-sm font-medium ${!isProMode ? 'text-white' : 'text-gray-400'}`}>BASIC</span>
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              className="sr-only"
              checked={isProMode}
              onChange={() => setIsProMode(prev => !prev)}
            />
            <div className={`relative h-6 w-11 rounded-full transition ${isProMode ? 'bg-indigo-500' : 'bg-gray-700'}`}>
              <span className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow transition ${isProMode ? 'translate-x-5' : ''}`} />
            </div>
          </label>
          <span className={`text-sm font-medium ${isProMode ? 'text-white' : 'text-gray-400'}`}>PRO</span>
        </div>
      </div>

      {/* Accordion Sections */}
      <div className="flex flex-col">

        {/* SECTION 1: Scene Setup (Always visible) */}
        <Section id="scene" title="Scene Setup" isOpen={openSection === 'scene'} onToggle={handleSectionToggle}>
          <div className="flex flex-col gap-4">
            <ChipSelect
              label="Scene Type"
              options={SCENE_TYPES}
              value={values.sceneType}
              onChange={(v) => updateValue('sceneType', v)}
            />
            <ChipSelect
              label="Micro Location"
              options={MICRO_LOCATIONS}
              value={values.microLocation}
              onChange={(v) => updateValue('microLocation', v)}
            />
          </div>
        </Section>

        {/* SECTION 2: Photography Settings (PRO ONLY) */}
        {isProMode && (
          <Section id="photography" title="Photography Settings" isOpen={openSection === 'photography'} onToggle={handleSectionToggle}>
            <div className="flex flex-col gap-4">
              <ChipSelect
                label="Lighting"
                options={LIGHTING_OPTIONS}
                value={values.lighting}
                onChange={(v) => updateValue('lighting', v)}
              />
              <ChipSelect
                label="Shot Type"
                options={SHOT_TYPES}
                value={values.shotType}
                onChange={(v) => updateValue('shotType', v)}
              />
            </div>
          </Section>
        )}

        {/* SECTION 3: Person Settings (UGC ONLY) */}
        {isUGCMode && (
          <Section id="person" title="Person Settings" isOpen={openSection === 'person'} onToggle={handleSectionToggle}>
            <div className="flex flex-col gap-4">
              <ChipSelect
                label="Person Type"
                options={PERSON_TYPES}
                value={values.personType}
                onChange={(v) => updateValue('personType', v)}
              />
              <ChipSelect
                label="Skin Tone"
                options={SKIN_TONES}
                value={values.skinTone}
                onChange={(v) => updateValue('skinTone', v)}
              />
              <ChipSelect
                label="Age Group"
                options={AGE_GROUPS}
                value={values.ageGroup}
                onChange={(v) => updateValue('ageGroup', v)}
              />
              <ChipSelect
                label="Ethnicity"
                options={ETHNICITIES}
                value={values.ethnicity}
                onChange={(v) => updateValue('ethnicity', v)}
              />
            </div>
          </Section>
        )}

        {/* SECTION 4: Talent Reference (UGC ONLY) */}
        {isUGCMode && (
          <Section id="talent" title="Talent Reference" isOpen={openSection === 'talent'} onToggle={handleSectionToggle}>
            <div className="flex flex-col gap-3">
              <div className="rounded-lg border border-dashed border-gray-600 p-4 text-center text-gray-500 text-sm">
                <p>Upload talent photo</p>
                <p className="text-xs mt-1">JPG, PNG, WebP</p>
              </div>
              <textarea
                className="w-full rounded-lg border border-gray-700/50 bg-gray-800/50 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-indigo-400 focus:outline-none"
                placeholder="Notes about the talent..."
                rows={2}
                value={values.talentNotes}
                onChange={(e) => updateValue('talentNotes', e.target.value)}
              />
            </div>
          </Section>
        )}

        {/* SECTION 5: Wardrobe (UGC ONLY) */}
        {isUGCMode && (
          <Section id="wardrobe" title="Wardrobe" isOpen={openSection === 'wardrobe'} onToggle={handleSectionToggle}>
            <ChipSelect
              label="Style"
              options={WARDROBE_OPTIONS}
              value={values.wardrobe}
              onChange={(v) => updateValue('wardrobe', v)}
            />
          </Section>
        )}

        {/* SECTION 6: Product Interaction (UGC ONLY) */}
        {isUGCMode && (
          <Section id="interaction" title="Product Interaction" isOpen={openSection === 'interaction'} onToggle={handleSectionToggle}>
            <ChipSelect
              label="Interaction"
              options={INTERACTION_OPTIONS}
              value={values.productInteraction}
              onChange={(v) => updateValue('productInteraction', v)}
            />
          </Section>
        )}

        {/* SECTION 7: Prop Bundles (Always visible) */}
        <Section id="props" title="Prop Bundles" isOpen={openSection === 'props'} onToggle={handleSectionToggle}>
          <ChipSelect
            label="Props"
            options={PROP_BUNDLES}
            value={values.propBundle}
            onChange={(v) => updateValue('propBundle', v)}
          />
        </Section>

        {/* SECTION 8: Story Mode (PRO ONLY) */}
        {isProMode && (
          <Section id="story" title="Story Mode" isOpen={openSection === 'story'} onToggle={handleSectionToggle}>
            <ChipSelect
              label="Mode"
              options={STORY_MODES}
              value={values.storyMode}
              onChange={(v) => updateValue('storyMode', v)}
            />
          </Section>
        )}

        {/* SECTION 9: Output Settings (Always visible) */}
        <Section id="output" title="Output Settings" isOpen={openSection === 'output'} onToggle={handleSectionToggle}>
          <div className="flex flex-col gap-4">
            <ChipSelect
              label="Aspect Ratio"
              options={ASPECT_RATIOS}
              value={values.aspectRatio}
              onChange={(v) => updateValue('aspectRatio', v)}
            />
            <ChipSelect
              label="Resolution"
              options={RESOLUTIONS}
              value={values.resolution}
              onChange={(v) => updateValue('resolution', v)}
            />
            <ChipSelect
              label="Variations"
              options={VARIATIONS}
              value={values.variations}
              onChange={(v) => updateValue('variations', v)}
            />
            <div className="flex flex-col gap-2">
              <label className="text-xs text-gray-400 uppercase tracking-wider">Seed</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="flex-1 rounded-lg border border-gray-700/50 bg-gray-800/50 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-indigo-400 focus:outline-none"
                  placeholder="Enter seed or randomize"
                  value={values.seed}
                  onChange={(e) => updateValue('seed', e.target.value)}
                />
                <button
                  type="button"
                  onClick={randomizeSeed}
                  className="px-3 py-2 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-medium hover:bg-indigo-500/30 transition"
                >
                  Randomize
                </button>
              </div>
            </div>
          </div>
        </Section>

      </div>
    </div>
  );
};

export default LifestyleStep3;
