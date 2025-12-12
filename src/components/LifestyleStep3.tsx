import React, { useEffect, useState } from 'react';
import { Camera, Eye, FileText, Flask, Hand, Image, Settings, Shirt, Sparkles, Box, User } from 'lucide-react';
import ChipGroup from './ChipGroup';
import SliderControl from './SliderControl';

const panelBaseClass = 'rounded-lg border border-neutral-700 bg-neutral-900/60 p-4 mt-6 mb-4';

const LifestyleSchema = {
  scene: ['indoor', 'outdoor', 'studio', 'kitchen', 'living_room'],
  microLocation: ['tabletop', 'countertop', 'sofa', 'near_window', 'bathroom_vanity'],
  photography: ['close_up', 'medium', 'wide', 'aesthetic_soft', 'high_contrast'],
  person: ['woman', 'man', 'couple', 'family', 'no_person'],
  wardrobe: ['casual', 'sporty', 'elegant', 'neutral', 'colorful'],
  productInteraction: ['holding_product', 'using_product', 'placing_product', 'next_to_product'],
  talentReference: ['none', 'reference_image'],
  ugcRealityMode: ['on', 'off'],
  propsBundle: ['clean', 'kitchen_set', 'bathroom_set', 'beauty_set'],
  formulationStory: ['none', 'chemist', 'doctor', 'lab'],
};

type IconComponent = React.ComponentType<React.SVGProps<SVGSVGElement>>;

const SectionHeader: React.FC<{ icon: IconComponent; title: string; description: string }> = ({
  icon: Icon,
  title,
  description,
}) => (
  <div className="flex flex-col mb-3">
    <div className="flex items-center gap-2">
      <Icon className="w-4 h-4 text-indigo-400" />
      <h3 className="text-sm font-semibold tracking-wide text-gray-200 mb-1">{title}</h3>
    </div>
    <p className="text-xs text-gray-400 leading-relaxed">{description}</p>
  </div>
);

const sectionWrapperClass =
  'p-4 rounded-lg bg-gray-900/40 border border-gray-800 shadow-sm transition-all duration-300 ease-out hover:border-gray-700';

interface LifestyleStep3Props {
  onPromptChange?: (prompt: string) => void;
}

const humanize = (value?: string) => (value ? value.replace(/_/g, ' ') : '');

type LifestyleState = {
  scene: string;
  photography: string;
  person: string;
  talentReference: string;
  wardrobe: string;
  productInteraction: string;
  ugcRealityMode: boolean;
  propsBundle: string;
  formulationStory: string;
  talentPreview: string;
  microLocation: string;
  imperfectionIntensity: number;
  blur: number;
  grain: number;
  phoneTilt: number;
  offCenter: number;
  cameraDistance: number;
  depthOfField: number;
  lightingSoftness: number;
  contrastBoost: number;
};

const defaultLifestyleState: LifestyleState = {
  scene: '',
  photography: '',
  person: '',
  talentReference: '',
  wardrobe: '',
  productInteraction: '',
  ugcRealityMode: false,
  propsBundle: '',
  formulationStory: 'none',
  talentPreview: '',
  microLocation: '',
  imperfectionIntensity: 50,
  blur: 30,
  grain: 30,
  phoneTilt: 0,
  offCenter: 0,
  cameraDistance: 50,
  depthOfField: 50,
  lightingSoftness: 50,
  contrastBoost: 50,
};

const buildSceneBlock = (l: LifestyleState) => {
  const parts = [];
  if (l.scene) {
    parts.push(`Scene set to ${humanize(l.scene)}.`);
  }
  if (l.microLocation) {
    parts.push(`Micro-location focuses on ${humanize(l.microLocation)} surfaces.`);
  }
  return parts.join(' ');
};

const buildPhotographyBlock = (l: LifestyleState) => {
  const parts = [];
  if (l.photography) {
    parts.push(`Photography style is ${humanize(l.photography)}.`);
  }
  parts.push(`Camera distance ${l.cameraDistance}/100.`);
  parts.push(`Depth of field ${l.depthOfField}/100.`);
  parts.push(`Lighting softness ${l.lightingSoftness}/100.`);
  parts.push(`Contrast boost ${l.contrastBoost}/100.`);
  return parts.join(' ');
};

const buildPersonBlock = (l: LifestyleState) => {
  if (!l.person) {
    return '';
  }
  return `Person type noted as ${humanize(l.person)}.`;
};

const buildWardrobeBlock = (l: LifestyleState) => {
  if (!l.wardrobe) {
    return '';
  }
  return `Wardrobe leans toward ${humanize(l.wardrobe)} aesthetics.`;
};

const buildInteractionBlock = (l: LifestyleState) => {
  if (!l.productInteraction) {
    return '';
  }
  return `Product interaction follows ${humanize(l.productInteraction)} staging.`;
};

const buildPropsBlock = (l: LifestyleState) => {
  if (!l.propsBundle) {
    return '';
  }
  return `Props bundle selection: ${humanize(l.propsBundle)}.`;
};

const buildFormulationBlock = (l: LifestyleState) => {
  if (!l.formulationStory || l.formulationStory === 'none') {
    return '';
  }
  return `Formulation story guided by ${humanize(l.formulationStory)} expertise.`;
};

const buildTalentReferenceBlock = (l: LifestyleState) => {
  if (!l.talentReference) {
    return '';
  }
  return `Talent reference notes: ${l.talentReference.trim()}.`;
};

const buildUgcRealityBlock = (l: LifestyleState) => {
  if (!l.ugcRealityMode) {
    return '';
  }
  const parts = [
    'UGC reality mode is active.',
    `Imperfection intensity ${l.imperfectionIntensity}/100.`,
    `Blur ${l.blur}/100.`,
    `Grain ${l.grain}/100.`,
    `Phone tilt ${l.phoneTilt} degrees.`,
    `Off-center shift ${l.offCenter}/100.`,
  ];
  return parts.join(' ');
};

const buildLifestylePrompt = (l: LifestyleState) => {
  const parts = [
    buildSceneBlock(l),
    buildPhotographyBlock(l),
    buildPersonBlock(l),
    buildWardrobeBlock(l),
    buildInteractionBlock(l),
    buildPropsBlock(l),
    buildFormulationBlock(l),
    buildTalentReferenceBlock(l),
    buildUgcRealityBlock(l),
  ].filter(Boolean);

  return parts.join(' ').trim();
};

const LifestyleStep3: React.FC<LifestyleStep3Props> = ({ onPromptChange }) => {
  const [lifestyle, setLifestyle] = useState<LifestyleState>(() => ({ ...defaultLifestyleState }));
  const [isProMode, setIsProMode] = useState(false);
  const isFormulationActive = lifestyle.formulationStory !== 'none';
  const isUgcRealityActive = lifestyle.ugcRealityMode === true;
  const isTalentReferenceActive = lifestyle.talentReference !== '';

  useEffect(() => {
    if (onPromptChange) {
      onPromptChange(buildLifestylePrompt(lifestyle));
    }
  }, [lifestyle, onPromptChange]);

  return (
    <div className="w-full flex flex-col gap-6 p-6 bg-neutral-900 rounded-xl border border-neutral-700 mt-8">
      <h2 className="text-2xl font-bold text-white">Step 3 — Lifestyle Customization</h2>
      <div className="flex items-center justify-between mb-4 p-3 rounded-lg bg-gray-900/40 border border-gray-800">
        <div>
          <h3 className="text-sm font-semibold text-gray-200 flex items-center gap-2">
            <Settings className="w-4 h-4 text-indigo-400" />
            Mode
          </h3>
          <p className="text-xs text-gray-400">Switch between Basic and Pro controls.</p>
        </div>
        <button
          onClick={() => setIsProMode(prev => !prev)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${isProMode ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300'
            }`}
        >
          {isProMode ? 'PRO' : 'BASIC'}
        </button>
      </div>

      <div className={panelBaseClass}>
        <SectionHeader
          icon={Image}
          title="Scene & Environment"
          description="Define where your lifestyle moment takes place and set the visual tone."
        />
        <div className={sectionWrapperClass}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <ChipGroup
                label="Scene Type"
                options={LifestyleSchema.scene}
                value={lifestyle.scene}
                onChange={(val) => setLifestyle(prev => ({ ...prev, scene: val }))}
              />
              <ChipGroup
                label="Micro-location"
                options={LifestyleSchema.microLocation}
                value={lifestyle.microLocation}
                onChange={(val) => setLifestyle(prev => ({ ...prev, microLocation: val }))}
              />
            </div>
            <div className="hidden md:block" />
          </div>
        </div>
      </div>

      <div className={panelBaseClass}>
        <SectionHeader
          icon={Camera}
          title="Photography"
          description="Control camera feel, framing, and subtle cinematic qualities."
        />
        <div className={sectionWrapperClass}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <ChipGroup
                label="Photography Style"
                options={LifestyleSchema.photography}
                value={lifestyle.photography}
                onChange={(val) => setLifestyle(prev => ({ ...prev, photography: val }))}
              />
              <div className="flex flex-col gap-2">
                <select className="w-full rounded bg-neutral-700 text-white" disabled>
                  <option>Lighting</option>
                </select>
                <select className="w-full rounded bg-neutral-700 text-white" disabled>
                  <option>Shot Type</option>
                </select>
              </div>
            </div>
            {isProMode ? (
              <div className="flex flex-col gap-3">
                <SliderControl
                  label="Camera Distance"
                  value={lifestyle.cameraDistance}
                  min={0}
                  max={100}
                  onChange={(val) => setLifestyle(prev => ({ ...prev, cameraDistance: val }))}
                />
                <SliderControl
                  label="Depth of Field"
                  value={lifestyle.depthOfField}
                  min={0}
                  max={100}
                  onChange={(val) => setLifestyle(prev => ({ ...prev, depthOfField: val }))}
                />
                <SliderControl
                  label="Lighting Softness"
                  value={lifestyle.lightingSoftness}
                  min={0}
                  max={100}
                  onChange={(val) => setLifestyle(prev => ({ ...prev, lightingSoftness: val }))}
                />
                <SliderControl
                  label="Contrast Boost"
                  value={lifestyle.contrastBoost}
                  min={0}
                  max={100}
                  onChange={(val) => setLifestyle(prev => ({ ...prev, contrastBoost: val }))}
                />
              </div>
            ) : (
              <div className="hidden md:block" />
            )}
          </div>
        </div>
      </div>

      <div className={panelBaseClass}>
        <SectionHeader
          icon={User}
          title="Person Details"
          description="Describe who appears in the shot and guide their emotional tone."
        />
        <div className={sectionWrapperClass}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <ChipGroup
                label="Person Type"
                options={LifestyleSchema.person}
                value={lifestyle.person}
                disabled={isFormulationActive}
                onChange={(val) => setLifestyle(prev => ({ ...prev, person: val }))}
              />
            </div>
            <div className="flex flex-col gap-3">
              <select className="w-full rounded bg-neutral-700 text-white" disabled>
                <option>Gender</option>
              </select>
              <select className="w-full rounded bg-neutral-700 text-white" disabled>
                <option>Ethnicity</option>
              </select>
              <select className="w-full rounded bg-neutral-700 text-white" disabled>
                <option>Skin Tone</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className={panelBaseClass}>
        <SectionHeader
          icon={FileText}
          title="Talent Reference"
          description="Provide guidance for talent shape, mood, or camera presence."
        />
        <div className={sectionWrapperClass}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs text-gray-400">Upload photo (JPG/PNG/WebP)</label>
              <div className="rounded border border-dashed border-neutral-600 p-4 text-sm text-gray-400">
                File upload placeholder
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <textarea
                className="w-full rounded bg-neutral-700 px-3 py-2 text-white"
                placeholder="Interaction notes"
                rows={2}
                value={lifestyle.talentReference}
                onChange={(e) => setLifestyle(prev => ({ ...prev, talentReference: e.target.value }))}
              />
              {isTalentReferenceActive && (
                <p className="text-xs text-gray-400 mt-1">Talent reference active</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className={panelBaseClass}>
        <SectionHeader
          icon={Shirt}
          title="Wardrobe"
          description="Choose how the talent should feel through clothing style and mood."
        />
        <div className={sectionWrapperClass}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <ChipGroup
                label="Wardrobe Presets"
                options={LifestyleSchema.wardrobe}
                value={lifestyle.wardrobe}
                disabled={isFormulationActive}
                onChange={(val) => setLifestyle(prev => ({ ...prev, wardrobe: val }))}
              />
            </div>
            <div className="flex flex-col gap-3">
              <div className="rounded border border-dashed border-neutral-600 p-4 text-sm text-gray-400">
                Custom outfit upload placeholder
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={panelBaseClass}>
        <SectionHeader
          icon={Hand}
          title="Product Interaction"
          description="Show how the talent relates to the product within the scene."
        />
        <div className={sectionWrapperClass}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <ChipGroup
                label="Interaction Style"
                options={LifestyleSchema.productInteraction}
                value={lifestyle.productInteraction}
                onChange={(val) => setLifestyle(prev => ({ ...prev, productInteraction: val }))}
              />
            </div>
            <div className="flex flex-col gap-3">
              <button className="w-full rounded bg-indigo-500 px-3 py-2 text-sm font-semibold text-white" disabled>
                Select Interaction Preset
              </button>
            </div>
          </div>
        </div>
      </div>

      {isProMode && (
        <div className={panelBaseClass}>
          <SectionHeader
            icon={Sparkles}
            title="UGC Reality Mode"
            description="Introduce subtle imperfections inspired by real smartphone captures."
          />
          <div className={sectionWrapperClass}>
            <label className="flex items-center gap-2 text-sm text-gray-300 mb-3">
              <input
                type="checkbox"
                checked={lifestyle.ugcRealityMode}
                onChange={(e) => setLifestyle(prev => ({ ...prev, ugcRealityMode: e.target.checked }))}
              />
              Toggle Reality Mode
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <p className="text-xs text-gray-400 leading-relaxed">
                  When turned on, each slider modulates smartphone-style authenticity.
                </p>
              </div>
              <div
                className={`transition-all duration-300 ease-out ${isUgcRealityActive ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
                  }`}
              >
                <div className="flex flex-col gap-3">
                  <SliderControl
                    label="Imperfection Intensity"
                    value={lifestyle.imperfectionIntensity}
                    min={0}
                    max={100}
                    onChange={(val) => setLifestyle(prev => ({ ...prev, imperfectionIntensity: val }))}
                  />
                  <SliderControl
                    label="Blur"
                    value={lifestyle.blur}
                    min={0}
                    max={100}
                    onChange={(val) => setLifestyle(prev => ({ ...prev, blur: val }))}
                  />
                  <SliderControl
                    label="Grain"
                    value={lifestyle.grain}
                    min={0}
                    max={100}
                    onChange={(val) => setLifestyle(prev => ({ ...prev, grain: val }))}
                  />
                  <SliderControl
                    label="Phone Tilt"
                    value={lifestyle.phoneTilt}
                    min={-15}
                    max={15}
                    onChange={(val) => setLifestyle(prev => ({ ...prev, phoneTilt: val }))}
                  />
                  <SliderControl
                    label="Off-center Shift"
                    value={lifestyle.offCenter}
                    min={0}
                    max={100}
                    onChange={(val) => setLifestyle(prev => ({ ...prev, offCenter: val }))}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={panelBaseClass}>
        <SectionHeader
          icon={Box}
          title="Prop Bundles"
          description="Add curated elements that reinforce the lifestyle context."
        />
        <div className={sectionWrapperClass}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap gap-2">
                {['Coffee Run', 'Desk Creator', 'Beauty Vanity', 'Premium Retail'].map(label => (
                  <button
                    key={label}
                    className="rounded-full border border-white/20 px-3 py-1 text-xs text-white"
                    disabled
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <ChipGroup
                label="Prop Selection"
                options={LifestyleSchema.propsBundle}
                value={lifestyle.propsBundle}
                onChange={(val) => setLifestyle(prev => ({ ...prev, propsBundle: val }))}
              />
            </div>
          </div>
        </div>
      </div>

      <div className={panelBaseClass}>
        <SectionHeader
          icon={Flask}
          title="Formulation Story"
          description="Frame your scene through expert-driven mood cues and visual emphasis."
        />
        <div className={sectionWrapperClass}>
          <label className="flex items-center gap-2 text-sm text-gray-300">
            <input
              type="checkbox"
              checked={lifestyle.formulationStory === 'enabled'}
              onChange={(e) => setLifestyle(prev => ({ ...prev, formulationStory: e.target.checked ? 'enabled' : '' }))}
            />
            Enable Expert Mode
          </label>
          <div className="rounded border border-dashed border-neutral-600 p-3 text-sm text-gray-400">
            Expert photo upload placeholder
          </div>
          <input className="w-full rounded bg-neutral-700 px-3 py-2 text-white" placeholder="Expert Name" disabled />
          <input className="w-full rounded bg-neutral-700 px-3 py-2 text-white" placeholder="Expert Credentials" disabled />
          <ChipGroup
            label="Formulation Story"
            options={LifestyleSchema.formulationStory}
            value={lifestyle.formulationStory}
            disabled={isFormulationActive}
            onChange={(val) => setLifestyle(prev => ({ ...prev, formulationStory: val }))}
          />
        </div>
      </div>

      <div className={panelBaseClass}>
        <SectionHeader
          icon={Eye}
          title="Talent Preview"
          description="See a quick synopsis of the identity cues."
        />
        <div className={sectionWrapperClass}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <textarea
                className="w-full rounded bg-neutral-800 px-3 py-2 text-white"
                rows={3}
                placeholder="Preview text based on selected values"
                value={lifestyle.talentPreview}
                onChange={(e) => setLifestyle(prev => ({ ...prev, talentPreview: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-xs text-gray-500">Talent cues update live as you select chips or sliders.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="text-xs text-gray-300 mt-4 p-4 rounded bg-gray-900 border border-gray-700 leading-relaxed">
        <strong>Final Lifestyle Prompt:</strong>
        <br />
        {buildLifestylePrompt(lifestyle)}
      </div>

      <div className={panelBaseClass}>
        <SectionHeader
          icon={Settings}
          title="Output Settings"
          description="Review how your final prompt will blend all creative decisions."
        />
        <div className={sectionWrapperClass}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <select className="w-full rounded bg-neutral-700 text-white" disabled>
                <option>Aspect Ratio</option>
              </select>
              <select className="w-full rounded bg-neutral-700 text-white" disabled>
                <option>Resolution</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <select className="w-full rounded bg-neutral-700 text-white" disabled>
                <option>Variations</option>
              </select>
              <input className="w-full rounded bg-neutral-700 px-3 py-2 text-white" placeholder="Seed (optional)" disabled />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LifestyleStep3;
