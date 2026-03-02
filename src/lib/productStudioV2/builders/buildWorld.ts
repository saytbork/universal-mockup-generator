import type { StudioAuthorityBundle, StudioUIState } from '../types/studioTypes.ts';

const WORLD_LABELS: Record<StudioAuthorityBundle['world'], string> = {
  studio: 'controlled studio environment with bounded physical set interactions',
  underwater: 'underwater environment with refraction-consistent optical depth',
  'splash-tank': 'splash tank environment with bounded liquid containment',
  'beach-daylight': 'sunlit tropical shoreline environment with turquoise water and clean white sand',
};

export function buildWorld(
  authority: StudioAuthorityBundle,
  explicitWorld?: StudioAuthorityBundle['world'],
  state?: StudioUIState
): string {
  if (!explicitWorld && authority.world !== 'beach-daylight') return '';
  return `STUDIO_WORLD: ${WORLD_LABELS[authority.world]}.`;
}
