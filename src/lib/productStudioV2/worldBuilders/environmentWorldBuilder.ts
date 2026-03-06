import type { StudioAuthorityBundle, StudioUIState } from '../types/studioTypes';

const WORLD_LABELS: Record<StudioAuthorityBundle['world'], string> = {
  studio: 'controlled studio environment with bounded physical set interactions',
  underwater: 'underwater environment with refraction-consistent optical depth',
  'splash-tank': 'splash tank environment with bounded liquid containment',
  'beach-daylight': 'sunlit tropical shoreline environment with turquoise water and clean white sand',
  'water-surface': 'pool water surface environment with clear turquoise water, sunlit caustics, and natural refraction',
};

const CONTEXT_PRESET_STUDIO_BACKGROUND: Record<string, string> = {
  'Dark Luxury Studio': 'deep dark background with subtle gradient depth and premium low-key atmosphere',
  'Clean White Studio': 'pure white seamless studio background with clean gradient and high-key commercial finish',
  'Warm Neutral Studio': 'warm neutral beige/cream background with soft studio lighting and premium lifestyle feel',
  'Soft Gray Studio': 'soft gray seamless background with controlled tonal rolloff and clean commercial finish',
  'Natural Light Window': 'natural window-lit background with soft warm daylight and airy lifestyle atmosphere',
  'Marble Surface': 'polished marble surface as base with clean studio background and premium material contrast',
  'Wood Surface': 'natural wood surface as base with warm lifestyle studio background',
  'Black Matte': 'matte black seamless background with minimal studio lighting and premium dark-mode finish',
};

export function buildEnvironmentWorld(
  authority: StudioAuthorityBundle,
  state?: StudioUIState
): string {
  const contextPreset = String(state?.contextPresetValue || state?.environment || state?.environmentPreset || '').trim();
  const backgroundDesc =
    (contextPreset && CONTEXT_PRESET_STUDIO_BACKGROUND[contextPreset]) ||
    (contextPreset ? `studio environment — ${contextPreset}` : '');

  if (backgroundDesc) {
    return [
      `STUDIO_WORLD: ${WORLD_LABELS['studio']}.`,
      `BACKGROUND_CONTEXT: ${backgroundDesc}. Fill the entire frame background with this scene — no gray voids, no empty canvas areas.`,
    ].join(' ');
  }

  return `STUDIO_WORLD: ${WORLD_LABELS[authority.world]}.`;
}

