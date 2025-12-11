import React, { useState } from 'react';
import { useCreatorStore } from '@/store/useCreatorStore';

const SCENE_TYPES = ['Close up', 'Medium shot', 'Wide shot', 'Flat lay', 'Overhead top-down', 'Dutch angle', '45 degree hero angle', 'Cinematic composition', 'Lifestyle candid', 'Editorial aesthetic', 'Aesthetic soft', 'High contrast', 'Moody dramatic'];
const ENVIRONMENT_TYPES = ['Indoor', 'Outdoor', 'Studio', 'Natural environment', 'Urban', 'Cozy home', 'Luxury home', 'Minimalist home', 'Rustic cabin', 'Tropical', 'Mediterranean', 'Nordic clean'];
const MICRO_LOCATIONS = ['Kitchen counter', 'Kitchen island', 'Bathroom vanity', 'Bedroom bedside table', 'Bedroom dresser', 'Living room coffee table', 'Sofa scene', 'Dining table', 'Home office workspace', 'Garden table', 'Outdoor patio', 'Balcony', 'Poolside', 'Beach towel', 'Yoga mat', 'Car interior', 'Gym bench', 'Rock surface in nature'];
const SCENE_MOODS = ['Clean', 'Cozy', 'Warm', 'Fresh', 'Luxury', 'Minimalist', 'Natural', 'Aesthetic soft', 'Cinematic'];
const LIGHTING_OPTIONS = ['Soft diffusion', 'Hard contrast', 'Natural window light', 'Golden hour warm', 'Blue hour cool', 'Studio strobe', 'Softbox 45°', 'Backlit silhouette', 'Glow aesthetic', 'Moody cinematic'];
const SHOT_STYLES = ['Portrait lens', 'Macro close up', 'Ultra wide', 'Cinematic crop', 'Flat lay', 'Hero shot', 'Depth-of-field bokeh', 'Product beauty shot'];
const DEPTH_OF_FIELD = ['Deep focus', 'Shallow focus', 'Extreme macro', 'Smooth bokeh', 'Subject isolation'];
const CAMERA_ANGLES = ['Eye level', 'Low angle', 'High angle', '3/4 angle', 'Over-the-shoulder'];
const CAMERA_DISTANCE_LABELS = ['Extreme close-up', 'Close-up', 'Medium', 'Full body', 'Wide scene'];
const PERSON_TYPES = ['No person', 'Woman', 'Man', 'Couple', 'Family', 'Mom', 'Dad', 'Senior woman', 'Senior man', 'Teen girl', 'Teen boy', 'Child girl', 'Child boy'];
const GENDERS = ['Female', 'Male', 'Non-binary'];
const SKIN_TONES = ['Fair neutral', 'Fair warm', 'Light neutral', 'Light warm', 'Medium neutral', 'Medium warm', 'Olive', 'Tan', 'Deep', 'Rich deep', 'Ebony'];
const ETHNICITIES = ['Black / African', 'Afro-Latino', 'Latino / Hispanic', 'Caucasian', 'Asian', 'South Asian', 'Southeast Asian', 'Middle Eastern', 'Indigenous', 'Mixed'];
const BODY_TYPES = ['Slim', 'Average', 'Athletic', 'Curvy', 'Plus size', 'Muscular', 'Mature body', 'Teen body'];
const HAIR_TYPES = ['Straight', 'Wavy', 'Curly', 'Coily'];
const WARDROBE_STYLES = ['Casual', 'Sporty', 'Business casual', 'Elegant', 'Minimalist', 'Cozy winter', 'Summer wear', 'Loungewear', 'Trendy fashion', 'Neutral palette', 'Bright colors'];
const INTERACTION_TYPES = ['Holding', 'Using', 'Applying', 'Showing', 'Placing', 'Near product', 'Pouring', 'Drinking / consuming', 'Smelling'];
const PROP_BUNDLES_BASIC = ['Clean minimal', 'Kitchen cooking', 'Bathroom skincare', 'Beauty vanity', 'Nature greens', 'Fresh herbs', 'Citrus fruits', 'Tropical fruits', 'Books', 'Workspace tech', 'Yoga props'];
const PROP_BUNDLES_EXTENDED = ['Spa elements', 'Aromatherapy', 'Laundry fresh', 'Cozy blankets', 'Coffee ritual', 'Tea ritual', 'Fitness props'];
const EMOTIONAL_MOODS = ['Calm', 'Energetic', 'Focused', 'Relaxed', 'Happy warm', 'Cozy', 'Luxury calm', 'Fresh / clean'];
const NARRATIVE_STYLES = ['Aspirational lifestyle', 'Real people moment', 'Calm morning ritual', 'Healthy routine', 'Productivity moment', 'Evening wind-down'];
const ASPECT_RATIOS = ['1:1', '4:5', '3:4', '9:16', '16:9'];
const RESOLUTIONS = ['Standard', '2K', '4K'];
const VARIATIONS = ['1', '2', '4'];

const Chip: React.FC<{ label: string; selected: boolean; onClick: () => void }> = ({ label, selected, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150 border ${selected ? 'bg-indigo-500/30 border-indigo-400 text-white' : 'bg-gray-800/50 border-gray-700/50 text-gray-400 hover:border-gray-500 hover:text-gray-300'}`}
    >
        {label}
    </button>
);

const ChipGroup: React.FC<{ label: string; options: string[]; value: string; onChange: (v: string) => void }> = ({ label, options, value, onChange }) => (
    <div className="flex flex-col gap-2">
        <label className="text-xs text-gray-400 uppercase tracking-wider">{label}</label>
        <div className="flex flex-wrap gap-2">
            {options.map((opt) => (
                <Chip key={opt} label={opt} selected={value === opt} onClick={() => onChange(opt)} />
            ))}
        </div>
    </div>
);

const Section: React.FC<{ id: string; title: string; isOpen: boolean; onToggle: (id: string) => void; children: React.ReactNode }> = ({ id, title, isOpen, onToggle, children }) => (
    <div className="border-b border-gray-700/30 last:border-b-0">
        <button type="button" onClick={() => onToggle(id)} className="w-full flex justify-between items-center py-3 px-2 text-left transition-colors hover:bg-white/[0.02] rounded-lg">
            <span className="text-sm font-medium text-gray-200">{title}</span>
            <svg className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
        </button>
        <div className={`overflow-hidden transition-all duration-200 ${isOpen ? 'max-h-[800px] opacity-100 pb-4 px-2' : 'max-h-0 opacity-0'}`}>
            {children}
        </div>
    </div>
);

const Step3LifestylePanel: React.FC = () => {
    const creator = useCreatorStore((state) => state.creator);
    const setCreator = useCreatorStore((state) => state.setCreator);
    const [openSection, setOpenSection] = useState<string | null>('scene');

    const handleToggle = (id: string) => setOpenSection((prev) => (prev === id ? null : id));

    const updateScene = (key: string, value: string) => setCreator({ ...creator, scene: { ...creator.scene, [key]: value } });
    const updatePerson = (key: string, value: string | number) => setCreator({ ...creator, person: { ...creator.person, [key]: value } });
    const updateWardrobe = (style: string) => setCreator({ ...creator, wardrobe: { ...creator.wardrobe, style } });
    const updateInteraction = (type: string) => setCreator({ ...creator, interaction: { ...creator.interaction, type } });
    const updateProps = (key: string, value: string) => setCreator({ ...creator, props: { ...creator.props, [key]: value } });
    const updateOutput = (key: string, value: string) => setCreator({ ...creator, output: { ...creator.output, [key]: value } });
    const updateCamera = (key: string, value: string | number) => setCreator({ ...creator, camera: { ...creator.camera, [key]: value } });
    const updateTalent = (key: string, value: string) => setCreator({ ...creator, talent: { ...creator.talent, [key]: value } });
    const updateStory = (key: string, value: string) => setCreator({ ...creator, story: { ...creator.story, [key]: value } });
    const toggleProMode = () => setCreator({ ...creator, proMode: !creator.proMode });
    const randomizeSeed = () => updateOutput('seed', String(Math.floor(Math.random() * 999999) + 1));

    const isProMode = creator.proMode;

    return (
        <div className="w-full flex flex-col gap-3 p-4">
            <div className="border-b border-gray-700 pb-3">
                <p className="text-xs uppercase tracking-widest text-indigo-300">Step 3</p>
                <h2 className="text-xl font-bold text-gray-200">Customize Your Mockup</h2>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-gray-900/40 border border-gray-800">
                <div className="flex items-center gap-3">
                    <span className={`text-sm font-medium ${!isProMode ? 'text-white' : 'text-gray-400'}`}>BASIC</span>
                    <label className="relative inline-flex cursor-pointer items-center">
                        <input type="checkbox" className="sr-only" checked={isProMode} onChange={toggleProMode} />
                        <div className={`relative h-6 w-11 rounded-full transition ${isProMode ? 'bg-indigo-500' : 'bg-gray-700'}`}>
                            <span className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow transition ${isProMode ? 'translate-x-5' : ''}`} />
                        </div>
                    </label>
                    <span className={`text-sm font-medium ${isProMode ? 'text-white' : 'text-gray-400'}`}>PRO</span>
                </div>
            </div>
            <div className="flex flex-col">
                <Section id="scene" title="Scene Setup" isOpen={openSection === 'scene'} onToggle={handleToggle}>
                    <div className="flex flex-col gap-4">
                        <ChipGroup label="Scene Type" options={SCENE_TYPES} value={creator.scene?.type || ''} onChange={(v) => updateScene('type', v)} />
                        <ChipGroup label="Environment Type" options={ENVIRONMENT_TYPES} value={creator.scene?.environment || ''} onChange={(v) => updateScene('environment', v)} />
                        <ChipGroup label="Micro Location" options={MICRO_LOCATIONS} value={creator.scene?.microLocation || ''} onChange={(v) => updateScene('microLocation', v)} />
                        <ChipGroup label="Scene Mood" options={SCENE_MOODS} value={creator.scene?.mood || ''} onChange={(v) => updateScene('mood', v)} />
                    </div>
                </Section>
                {isProMode && (
                    <Section id="photography" title="Photography Settings" isOpen={openSection === 'photography'} onToggle={handleToggle}>
                        <div className="flex flex-col gap-4">
                            <ChipGroup label="Lighting" options={LIGHTING_OPTIONS} value={creator.camera?.lighting || ''} onChange={(v) => updateCamera('lighting', v)} />
                            <ChipGroup label="Shot Style" options={SHOT_STYLES} value={creator.camera?.shot || ''} onChange={(v) => updateCamera('shot', v)} />
                            <ChipGroup label="Depth of Field" options={DEPTH_OF_FIELD} value={creator.camera?.depth || ''} onChange={(v) => updateCamera('depth', v)} />
                            <ChipGroup label="Camera Angle" options={CAMERA_ANGLES} value={creator.camera?.angle || ''} onChange={(v) => updateCamera('angle', v)} />
                            <div className="flex flex-col gap-2">
                                <label className="text-xs text-gray-400 uppercase tracking-wider">Camera Distance</label>
                                <input type="range" min={0} max={4} step={1} value={CAMERA_DISTANCE_LABELS.indexOf(creator.camera?.distance || 'Medium')} onChange={(e) => updateCamera('distance', CAMERA_DISTANCE_LABELS[Number(e.target.value)])} className="w-full accent-indigo-500" />
                                <div className="flex justify-between text-[10px] text-gray-500">
                                    {CAMERA_DISTANCE_LABELS.map((l) => (<span key={l}>{l}</span>))}
                                </div>
                            </div>
                        </div>
                    </Section>
                )}
                <Section id="person" title="Person Settings" isOpen={openSection === 'person'} onToggle={handleToggle}>
                    <div className="flex flex-col gap-4">
                        <ChipGroup label="Person Type" options={PERSON_TYPES} value={creator.person?.type || ''} onChange={(v) => updatePerson('type', v)} />
                        <ChipGroup label="Gender" options={GENDERS} value={creator.person?.gender || ''} onChange={(v) => updatePerson('gender', v)} />
                        <div className="flex flex-col gap-2">
                            <label className="text-xs text-gray-400 uppercase tracking-wider">Age: {creator.person?.age || 30}</label>
                            <input type="range" min={5} max={90} step={1} value={creator.person?.age || 30} onChange={(e) => updatePerson('age', Number(e.target.value))} className="w-full accent-indigo-500" />
                        </div>
                        <ChipGroup label="Skin Tone" options={SKIN_TONES} value={creator.person?.skinTone || ''} onChange={(v) => updatePerson('skinTone', v)} />
                        <ChipGroup label="Ethnicity" options={ETHNICITIES} value={creator.person?.ethnicity || ''} onChange={(v) => updatePerson('ethnicity', v)} />
                        <ChipGroup label="Body Type" options={BODY_TYPES} value={creator.person?.bodyType || ''} onChange={(v) => updatePerson('bodyType', v)} />
                        <ChipGroup label="Hair Type" options={HAIR_TYPES} value={creator.person?.hairType || ''} onChange={(v) => updatePerson('hairType', v)} />
                    </div>
                </Section>
                <Section id="talent" title="Talent Reference" isOpen={openSection === 'talent'} onToggle={handleToggle}>
                    <div className="flex flex-col gap-3">
                        <div className="rounded-lg border border-dashed border-gray-600 p-4 text-center">
                            <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) { const r = new FileReader(); r.onload = () => updateTalent('image', r.result as string); r.readAsDataURL(f); } }} className="hidden" id="talent-upload" />
                            <label htmlFor="talent-upload" className="cursor-pointer text-sm text-gray-400 hover:text-indigo-400">Upload talent photo (JPG, PNG, WebP)</label>
                            {creator.talent?.image && <img src={creator.talent.image} alt="Talent" className="mt-2 h-20 w-20 rounded-lg object-cover mx-auto" />}
                        </div>
                        <textarea className="w-full rounded-lg border border-gray-700/50 bg-gray-800/50 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-indigo-400 focus:outline-none" placeholder="Notes about the talent..." rows={2} value={creator.talent?.notes || ''} onChange={(e) => updateTalent('notes', e.target.value)} />
                    </div>
                </Section>
                <Section id="wardrobe" title="Wardrobe" isOpen={openSection === 'wardrobe'} onToggle={handleToggle}>
                    <ChipGroup label="Style" options={WARDROBE_STYLES} value={creator.wardrobe?.style || ''} onChange={updateWardrobe} />
                </Section>
                <Section id="interaction" title="Product Interaction" isOpen={openSection === 'interaction'} onToggle={handleToggle}>
                    <ChipGroup label="Interaction Type" options={INTERACTION_TYPES} value={creator.interaction?.type || ''} onChange={(v) => updateInteraction(v)} />
                </Section>
                <Section id="props" title="Prop Bundles" isOpen={openSection === 'props'} onToggle={handleToggle}>
                    <div className="flex flex-col gap-4">
                        <ChipGroup label="Basic Props" options={PROP_BUNDLES_BASIC} value={creator.props?.bundle || ''} onChange={(v) => updateProps('bundle', v)} />
                        {isProMode && <ChipGroup label="Extended Props" options={PROP_BUNDLES_EXTENDED} value={creator.props?.extended || ''} onChange={(v) => updateProps('extended', v)} />}
                    </div>
                </Section>
                {isProMode && (
                    <Section id="story" title="Story Mode" isOpen={openSection === 'story'} onToggle={handleToggle}>
                        <div className="flex flex-col gap-4">
                            <ChipGroup label="Emotional Mood" options={EMOTIONAL_MOODS} value={creator.story?.mood || ''} onChange={(v) => updateStory('mood', v)} />
                            <ChipGroup label="Narrative Style" options={NARRATIVE_STYLES} value={creator.story?.narrativeStyle || ''} onChange={(v) => updateStory('narrativeStyle', v)} />
                            <div className="flex flex-col gap-2">
                                <label className="text-xs text-gray-400 uppercase tracking-wider">Narrative Text</label>
                                <textarea className="w-full rounded-lg border border-gray-700/50 bg-gray-800/50 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-indigo-400 focus:outline-none" placeholder="Describe the story or moment..." rows={3} value={creator.story?.text || ''} onChange={(e) => updateStory('text', e.target.value)} />
                            </div>
                        </div>
                    </Section>
                )}
                <Section id="output" title="Output Settings" isOpen={openSection === 'output'} onToggle={handleToggle}>
                    <div className="flex flex-col gap-4">
                        <ChipGroup label="Aspect Ratio" options={ASPECT_RATIOS} value={creator.output?.aspectRatio || ''} onChange={(v) => updateOutput('aspectRatio', v)} />
                        <ChipGroup label="Resolution" options={RESOLUTIONS} value={creator.output?.resolution || ''} onChange={(v) => updateOutput('resolution', v)} />
                        <ChipGroup label="Variations" options={VARIATIONS} value={creator.output?.variations || ''} onChange={(v) => updateOutput('variations', v)} />
                        <div className="flex flex-col gap-2">
                            <label className="text-xs text-gray-400 uppercase tracking-wider">Seed</label>
                            <div className="flex gap-2">
                                <input type="text" className="flex-1 rounded-lg border border-gray-700/50 bg-gray-800/50 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-indigo-400 focus:outline-none" placeholder="Enter seed" value={creator.output?.seed || ''} onChange={(e) => updateOutput('seed', e.target.value)} />
                                <button type="button" onClick={randomizeSeed} className="px-3 py-2 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-medium hover:bg-indigo-500/30 transition">Randomize</button>
                            </div>
                        </div>
                    </div>
                </Section>
            </div>
        </div>
    );
};

export default Step3LifestylePanel;
