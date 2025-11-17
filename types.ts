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
}

export type OptionCategory = keyof MockupOptions;

export interface Option {
  label: string;
  value: string;
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
