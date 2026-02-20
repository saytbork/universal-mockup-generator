import { getWineEnvironmentNarrative } from '../../productStudio/winePrestige';
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
  if (state?.winePrestigeMode) {
    const preset = String(state.wineContextPreset || '').trim() || 'Dark Luxury Studio';
    return [
      'STUDIO_WORLD: wine-prestige refined environment.',
      getWineEnvironmentNarrative(preset),
      'WINE_ENVIRONMENT_LOCK: isolate from ecommerce compression worlds, splash tank worlds, and generic studio fallback worlds.',
    ].join(' ');
  }
  if (!explicitWorld && authority.world !== 'beach-daylight') return '';
  return `STUDIO_WORLD: ${WORLD_LABELS[authority.world]}.`;
}
