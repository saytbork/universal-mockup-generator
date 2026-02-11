import type { StudioAuthorityBundle } from '../types/studioTypes.ts';

const WORLD_LABELS: Record<StudioAuthorityBundle['world'], string> = {
  studio: 'controlled studio environment with bounded physical set interactions',
  underwater: 'underwater environment with refraction-consistent optical depth',
  'splash-tank': 'splash tank environment with bounded liquid containment',
};

export function buildWorld(authority: StudioAuthorityBundle): string {
  return `STUDIO_WORLD: ${WORLD_LABELS[authority.world]}.`;
}
