import type { EyeDirectionKey } from './src/lib/promptEngine/parameterMap.types';

export interface MockupOptions {
  contentStyle: string;
  placementStyle: string;
  placementCamera: string;
  lighting: string;
  setting: string;
  ageGroup: string;
  camera: string;
  cameraShot: string;
  cameraAngle: string;
  cameraDistance: string;
  perspective: string;
  selfieType: string;
  ethnicity: string;
  gender: string;
  aspectRatio: string;
  environmentOrder: string;
  productPlane: string;
  personAppearance: string;
  hairColor: string;
  eyeColor: string;
  skinTone: string;
  productMaterial: string;
  productInteraction: string;
  realism: string;
  personPose: string;
  wardrobeStyle: string;
  personMood: string;
  personProps: string;
  microLocation: string;
  personExpression: string;
  hairStyle: string;
  eyeDirection?: EyeDirectionKey;
  proLens?: string;
  proLightingRig?: string;
  proPostTreatment?: string;
  skinRealism: string;
  creatorPreset?: string;
  appearanceLevel?: string;
  mood?: string;
  pose?: string;
  interaction2?: string;
  wardrobe?: string;
  props?: string;
  customProp?: string;
  customMicroLocation?: string;
  expression?: string;
  hairstyle?: string;
  compositionMode?: string;
  creationMode?: string;
  sidePlacement?: string;
  bgColor?: string;
}

export type OptionCategory = keyof MockupOptions;

export interface Option {
  label: string;
  value: string;
  tooltip?: string;
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
  maps?: {
    uri: string;
    title: string;
  };
}

export type SceneStructure = {
  structureType:
  | 'geometric_blocks'
  | 'editorial_architecture'
  | 'flat_surface'
  | 'natural_tabletop';

  geometry:
  | 'rectangular'
  | 'mixed'
  | 'organic';

  blockCount:
  | 'none'
  | 'few'
  | 'multiple';

  blockScale:
  | 'uniform'
  | 'varied';

  layout:
  | 'stacked'
  | 'stepped'
  | 'intersecting'
  | 'flat';

  edgeStyle:
  | 'sharp'
  | 'soft';

  material: {
    type:
    | 'matte_acrylic'
    | 'translucent_acrylic'
    | 'resin'
    | 'natural_stone'
    | 'matte_plastic'
    | 'foam_composite';
    reflectivity: 'low' | 'medium' | 'high';
  };

  scale: {
    type:
    | 'product_dominant'
    | 'equal'
    | 'base_dominant';
    ratio: string; // e.g. "product=1.0, base=0.6"
  };

  cameraLock:
  | 'eye_level_pedestal'
  | 'top_down_flatlay'
  | 'slightly_elevated_editorial';
};

export type ColorSystem = {
  mode:
  | 'solid_blocks'
  | 'neutral_surface'
  | 'ingredient_driven';

  paletteType:
  | 'primary'
  | 'warm'
  | 'cool'
  | 'monochrome';

  saturation:
  | 'low'
  | 'medium'
  | 'high';

  allowGradients: false;
};

export type VisualGrammar = {
  visualWeight: 'product-dominant' | 'balanced' | 'environment-support';
  hierarchyRule: 'single-hero' | 'primary-secondary' | 'equal-set';
  rhythm: 'static' | 'modular' | 'offset';
  symmetry: 'strict' | 'soft' | 'none';
  silenceLevel: 'high' | 'medium' | 'low';
  negativeSpaceRole: 'functional' | 'editorial' | 'none';
  focalDiscipline: 'locked-center' | 'rule-of-thirds' | 'free-but-contained';
};
