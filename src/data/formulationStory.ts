import type { Option } from '@/types';

export interface FormulationExpertPreset {
  value: string;
  label: string;
  suggestedName?: string;
  prompt: string;
}

export interface FormulationProfessionOption {
  value: string;
  label: string;
}

export const FORMULATION_EXPERT_PRESETS: FormulationExpertPreset[] = [
  {
    value: 'respiratory-doctor',
    label: 'Respiratory Doctor',
    suggestedName: 'Dr. Sofia Reyes',
    prompt:
      'Dress the doctor in a crisp lab coat with a name badge, reviewing charts beside the product with compassionate authority.',
  },
  {
    value: 'clinical-researcher',
    label: 'Clinical Researcher',
    suggestedName: 'Dr. Malik Herrera',
    prompt:
      'Show the researcher surrounded by clipboards, microscopes, and annotated results to emphasize rigorous testing.',
  },
  {
    value: 'herbal-formulator',
    label: 'Herbal Formulator',
    suggestedName: 'Dr. Aria Park',
    prompt:
      'Portray them with botanical samples, mortar and pestle, and a calm confidence that sells holistic science.',
  },
];

export const FORMULATION_LAB_OPTIONS: Option[] = [
  { label: 'Modern Clinical Lab', value: 'a modern clinical lab bench with glassware and stainless surfaces' },
  { label: 'R&D Studio', value: 'a warm R&D studio with sketches, ingredient jars, and soft daylight' },
  { label: 'Apothecary Lab', value: 'an apothecary-inspired lab with botanicals, droppers, and amber bottles' },
];

export const FORMULATION_PROFESSIONS: FormulationProfessionOption[] = [
  { value: 'pulmonologist', label: 'Pulmonologist' },
  { value: 'nutritionist', label: 'Nutritionist' },
  { value: 'dermatologist', label: 'Dermatologist' },
  { value: 'pharmacist', label: 'Pharmacist' },
  { value: 'clinical-researcher', label: 'Clinical Researcher' },
  { value: 'herbalist', label: 'Herbalist' },
  { value: 'custom', label: 'Custom' },
];

export const FORMULATION_PRESET_LOOKUP = FORMULATION_EXPERT_PRESETS.reduce(
  (acc, preset) => ({ ...acc, [preset.value]: preset }),
  {} as Record<string, FormulationExpertPreset>
);
