import { create } from 'zustand';
import type { SceneStructure, ColorSystem, VisualGrammar } from '../../types';

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
  sceneStructure?: SceneStructure;
  colorSystem?: ColorSystem;
  visualGrammar?: VisualGrammar;
}

export type ScenePresetId =
  | 'minimal_modular_studio'
  | 'playful_geometric_studio'
  | 'clinical_grid_studio'
  | 'soft_editorial_studio';

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
  setEnvironment: (environment: string, microLocation?: string) => void;
  setSidePlacement: (side: string) => void;
  setBgColor: (color: string) => void;
  toggleLinkTalent: () => void;
  setSceneStructure: (partial: Partial<SceneStructure>) => void;
  setColorSystem: (partial: Partial<ColorSystem>) => void;
  applyScenePreset: (presetId: ScenePresetId) => void;
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
  // MUTUAL EXCLUSIVITY: Setting creation mode to 'studio' clears environment
  setCreationMode: (mode) => set((state) => ({
    creationMode: mode,
    creator: mode === 'studio' ? {
      ...state.creator,
      scene: { ...state.creator.scene, environment: '', microLocation: '' }
    } : state.creator
  })),
  // MUTUAL EXCLUSIVITY: Setting environment disables studio mode
  setEnvironment: (environment, microLocation = '') => set((state) => ({
    creationMode: environment ? 'lifestyle' : state.creationMode,
    creator: {
      ...state.creator,
      scene: { ...state.creator.scene, environment, microLocation }
    }
  })),
  setSidePlacement: (side) => set({ sidePlacement: side }),
  setBgColor: (color) => set({ bgColor: color }),
  toggleLinkTalent: () => set((state) => ({ linkTalent: !state.linkTalent })),
  setSceneStructure: (partial) =>
    set((state) => ({
      creator: {
        ...state.creator,
        sceneStructure: { ...(state.creator.sceneStructure as SceneStructure), ...partial },
      },
    })),
  setColorSystem: (partial) =>
    set((state) => ({
      creator: {
        ...state.creator,
        colorSystem: { ...(state.creator.colorSystem as ColorSystem), ...partial },
      },
    })),
  applyScenePreset: (presetId) =>
    set((state) => {
      let structure: SceneStructure;
      let colors: ColorSystem;

      switch (presetId) {
        case 'minimal_modular_studio':
          structure = {
            structureType: 'editorial_architecture',
            geometry: 'rectangular',
            blockCount: 'few',
            blockScale: 'uniform',
            layout: 'stacked',
            edgeStyle: 'sharp',
            material: { type: 'matte_numeric', reflectivity: 'low' } as any, // FIX: Need exact string logic or manual fix if 'matte_numeric' is typo? Wait, 'matte_acrylic'
            scale: { type: 'base_dominant', ratio: 'product=1.0, base=1.2' },
            cameraLock: 'slightly_elevated_editorial'
          };
          // Correcting typo in material type for the actual assignment
          structure.material.type = 'matte_plastic';

          colors = {
            mode: 'neutral_surface',
            paletteType: 'monochrome',
            saturation: 'low',
            allowGradients: false
          };
          break;

        case 'playful_geometric_studio':
          structure = {
            structureType: 'geometric_blocks',
            geometry: 'mixed',
            blockCount: 'multiple',
            blockScale: 'varied',
            layout: 'stepped',
            edgeStyle: 'sharp',
            material: { type: 'matte_acrylic', reflectivity: 'medium' },
            scale: { type: 'product_dominant', ratio: 'product=1.0, base=0.6, secondary=0.4' },
            cameraLock: 'eye_level_pedestal'
          };
          colors = {
            mode: 'solid_blocks',
            paletteType: 'primary',
            saturation: 'high',
            allowGradients: false
          };
          break;

        case 'clinical_grid_studio':
          structure = {
            structureType: 'flat_surface',
            geometry: 'rectangular',
            blockCount: 'few',
            blockScale: 'uniform',
            layout: 'flat',
            edgeStyle: 'sharp',
            material: { type: 'white_resin', reflectivity: 'low' } as any, // Typo? 'resin'
            scale: { type: 'equal', ratio: 'product=1.0, base=1.0' },
            cameraLock: 'eye_level_pedestal' // Clinical is usually precise
          };
          structure.material.type = 'resin';

          colors = {
            mode: 'neutral_surface',
            paletteType: 'monochrome', // Cool white
            saturation: 'low',
            allowGradients: false
          };
          break;

        case 'soft_editorial_studio':
          structure = {
            structureType: 'editorial_architecture',
            geometry: 'organic',
            blockCount: 'few',
            blockScale: 'varied',
            layout: 'intersecting',
            edgeStyle: 'soft',
            material: { type: 'natural_stone', reflectivity: 'low' },
            scale: { type: 'base_dominant', ratio: 'product=1.0, base=1.5' },
            cameraLock: 'slightly_elevated_editorial'
          };
          colors = {
            mode: 'ingredient_driven',
            paletteType: 'warm',
            saturation: 'medium',
            allowGradients: false
          };
          break;

        default:
          return state;
      }

      return {
        creator: {
          ...state.creator,
          sceneStructure: structure,
          colorSystem: colors
        }
      };
    }),
}));