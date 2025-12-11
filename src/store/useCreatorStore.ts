import { create } from 'zustand';

interface CreatorScene {
  type: string;
  environment: string;
  microLocation: string;
  mood: string;
}

interface CreatorPerson {
  type: string;
  gender: string;
  age: number;
  skinTone: string;
  ethnicity: string;
  bodyType: string;
  hairType: string;
}

interface CreatorWardrobe {
  style: string;
}

interface CreatorInteraction {
  type: string;
}

interface CreatorProps {
  bundle: string;
  extended: string;
}

interface CreatorOutput {
  aspectRatio: string;
  resolution: string;
  variations: string;
  seed: string;
}

interface CreatorCamera {
  lighting: string;
  shot: string;
  depth: string;
  lens: string;
  distance: string;
  angle: string;
  focus: string;
}

interface CreatorTalent {
  image: string;
  notes: string;
}

interface CreatorStory {
  mood: string;
  narrativeStyle: string;
  text: string;
}

interface Creator {
  scene: CreatorScene;
  person: CreatorPerson;
  wardrobe: CreatorWardrobe;
  interaction: CreatorInteraction;
  props: CreatorProps;
  output: CreatorOutput;
  camera: CreatorCamera;
  talent: CreatorTalent;
  story: CreatorStory;
  proMode: boolean;
}

interface CreatorStore {
  creator: Creator;
  setCreator: (creator: Creator) => void;
  preset: string;
  creationMode: string;
  sidePlacement: string;
  bgColor: string;
  linkTalent: boolean;
  setPreset: (preset: string) => void;
  setCreationMode: (mode: string) => void;
  setSidePlacement: (side: string) => void;
  setBgColor: (color: string) => void;
  toggleLinkTalent: () => void;
}

const defaultCreator: Creator = {
  scene: { type: '', environment: '', microLocation: '', mood: '' },
  person: { type: '', gender: '', age: 30, skinTone: '', ethnicity: '', bodyType: '', hairType: '' },
  wardrobe: { style: '' },
  interaction: { type: '' },
  props: { bundle: '', extended: '' },
  output: { aspectRatio: '1:1', resolution: 'Standard', variations: '1', seed: '' },
  camera: { lighting: '', shot: '', depth: '', lens: '', distance: 'Medium', angle: '', focus: '' },
  talent: { image: '', notes: '' },
  story: { mood: '', narrativeStyle: '', text: '' },
  proMode: false,
};

export const useCreatorStore = create<CreatorStore>((set) => ({
  creator: defaultCreator,
  setCreator: (creator) => set({ creator }),
  preset: 'custom',
  creationMode: 'lifestyle',
  sidePlacement: 'right',
  bgColor: '#FFFFFF',
  linkTalent: false,
  setPreset: (preset) => set({ preset }),
  setCreationMode: (mode) => set({ creationMode: mode }),
  setSidePlacement: (side) => set({ sidePlacement: side }),
  setBgColor: (color) => set({ bgColor: color }),
  toggleLinkTalent: () => set((state) => ({ linkTalent: !state.linkTalent })),
}));
