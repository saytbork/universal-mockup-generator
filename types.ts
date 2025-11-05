export interface MockupOptions {
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
