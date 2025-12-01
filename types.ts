export interface MockupOptions {
  contentStyle: string;
  placementStyle: string;
  placementCamera: string;
  lighting: string;
  setting: string;
  ageGroup: string;
  camera: string;
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
