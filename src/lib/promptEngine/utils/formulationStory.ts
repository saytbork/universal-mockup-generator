import type { FormulationStoryOptions } from '../types';
import {
  FORMULATION_PRESET_LOOKUP,
  FORMULATION_LAB_OPTIONS,
} from '@/data/formulationStory';

type FormulationSelection = {
  enabled?: boolean;
  preset?: string;
  professionalFocus?: string;
  expertName?: string;
  labStyle?: string;
};

const PRESET_MAP: Record<string, FormulationStoryOptions['expertPreset']> = {
  'respiratory-doctor': 'respiratory_doctor',
  'clinical-researcher': 'clinical_researcher',
  'herbal-formulator': 'herbal_formulator',
  custom: 'custom',
};

const PROFESSION_MAP: Record<string, FormulationStoryOptions['professionalFocus']> = {
  pulmonologist: 'pulmonologist',
  nutritionist: 'nutritionist',
  dermatologist: 'dermatologist',
  pharmacist: 'pharmacist',
  'clinical-researcher': 'clinical_researcher',
  herbalist: 'herbalist',
  custom: 'custom',
};

const LAB_VIBE_MAP: Record<string, FormulationStoryOptions['labVibe']> = {
  'a modern clinical lab bench with glassware and stainless surfaces': 'modern_clinical_lab',
  'a warm R&D studio with sketches, ingredient jars, and soft daylight': 'r_and_d_studio',
  'an apothecary-inspired lab with botanicals, droppers, and amber bottles': 'apothecary_lab',
};

export function buildFormulationStoryOptions(selection: FormulationSelection): FormulationStoryOptions | undefined {
  if (!selection.enabled) return undefined;

  const story: FormulationStoryOptions = {};

  if (selection.preset) {
    const preset = PRESET_MAP[selection.preset] ?? PRESET_MAP[selection.preset.replace(/-/g, '_')] ?? undefined;
    if (preset) {
      story.expertPreset = preset;
    }
  }

  if (selection.professionalFocus) {
    const focus =
      PROFESSION_MAP[selection.professionalFocus] ??
      PROFESSION_MAP[selection.professionalFocus.replace(/-/g, '_')] ??
      undefined;
    if (focus) {
      story.professionalFocus = focus;
    }
  }

  const expertName =
    selection.expertName?.trim() || FORMULATION_PRESET_LOOKUP[selection.preset ?? '']?.suggestedName;
  if (expertName) {
    story.expertName = expertName;
  }

  if (selection.labStyle) {
    const labKey =
      LAB_VIBE_MAP[selection.labStyle] ??
      LAB_VIBE_MAP[
        FORMULATION_LAB_OPTIONS.find(option => option.value === selection.labStyle)?.value ?? ''
      ];
    if (labKey) {
      story.labVibe = labKey;
    }
  }

  return story;
}
