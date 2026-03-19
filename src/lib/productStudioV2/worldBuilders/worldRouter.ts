import type { StudioAuthorityBundle, StudioUIState } from '../types/studioTypes';
import { buildEnvironmentWorld } from './environmentWorldBuilder';
import { buildStudioWorld } from './studioWorldBuilder';
import { buildWaterWorld } from './waterWorldBuilder';
import { buildEditorialWorld } from './editorialWorldBuilder';
import { buildWineWorld } from './wineWorldBuilder';

type WorldBuilderFn = (
  authority: StudioAuthorityBundle,
  state?: StudioUIState,
  explicitWorld?: StudioAuthorityBundle['world']
) => string;

const WINE_PHOTO_MODES = new Set([
  'Wine Macro Label',
  'Bottle + Glass',
  'Bottle + Glass Pour',
  'Hands Pouring Wine',
  'Wine Lineup Comparison',
  'Editorial Bottle Tabletop',
  'Bottle In Hand Cutout',
  'Rose Tasting Table',
  'Editorial Table',
  'Winery Scene',
  'Social Table Served',
  'Outdoor Toast',
  'Hosting Pour',
  'Dinner Pairing',
  'Picnic Gathering',
  'Celebration Chill',
]);

export function resolveWorldBuilder(
  authority: StudioAuthorityBundle,
  state?: StudioUIState,
  _explicitWorld?: StudioAuthorityBundle['world']
): { name: string; builder: WorldBuilderFn } {
  const photoMode = String(state?.photoMode || '').trim();
  const industryProfile = String(state?.industryProfile || '').trim().toLowerCase();
  const environment = String(
    state?.environment || state?.environmentPreset || state?.environmentMode || state?.contextPresetValue || ''
  ).trim().toLowerCase();

  if (industryProfile === 'wine') {
    return { name: 'buildWineWorld', builder: buildWineWorld };
  }

  if (WINE_PHOTO_MODES.has(photoMode)) {
    return { name: 'buildWineWorld', builder: buildWineWorld };
  }

  if (photoMode === 'Pool Water' || authority.world === 'water-surface' || authority.world === 'underwater') {
    return { name: 'buildWaterWorld', builder: buildWaterWorld };
  }

  if (photoMode === 'Luxury Editorial Tabletop' || photoMode === 'Sunlit Stone Editorial') {
    return { name: 'buildEditorialWorld', builder: buildEditorialWorld };
  }

  if (!photoMode && (environment.includes('bathroom vanity') || environment.includes('vanity') || environment.includes('bathroom'))) {
    return { name: 'buildEnvironmentWorld', builder: buildEnvironmentWorld };
  }

  if (photoMode) {
    return { name: 'buildEditorialWorld', builder: buildEditorialWorld };
  }

  return { name: 'buildStudioWorld', builder: buildStudioWorld };
}
