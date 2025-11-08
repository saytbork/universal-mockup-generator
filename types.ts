export interface MockupOptions {
  contentStyle: string;
  placementStyle: string;
  placementCamera: string;
  lighting: string;
  setting: string;
  ageGroup: string;
  camera: string;
  iso: string;
  perspective: string;
  selfieType: string;
  ethnicity: string;
  gender: string;
  aspectRatio: string;
  environmentOrder: string;
  personAppearance: string;
  productMaterial: string;
  productInteraction: string;
  realism: string;
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
