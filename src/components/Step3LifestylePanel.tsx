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