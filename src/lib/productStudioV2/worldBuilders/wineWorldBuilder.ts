import type { StudioAuthorityBundle, StudioUIState } from '../types/studioTypes';

export function buildWineWorld(
  _authority: StudioAuthorityBundle,
  state?: StudioUIState
): string {
  const photoMode = String(state?.photoMode || '').trim();
  if (photoMode === 'Wine Macro Label') {
    return 'SCENE_STYLE: real macro wine bottle photography with label-detail precision and natural optical behavior.';
  }
  if (photoMode === 'Bottle + Glass') {
    return 'SCENE_STYLE: real wine bottle and glass photography with clean service presentation.';
  }
  if (photoMode === 'Bottle + Glass Pour') {
    return 'SCENE_STYLE: real wine hospitality photography with controlled pour motion.';
  }
  if (photoMode === 'Hands Pouring Wine') {
    return 'SCENE_STYLE: real hospitality wine photography with cropped-hands service framing.';
  }
  if (photoMode === 'Wine Lineup Comparison') {
    return 'SCENE_STYLE: real wine lineup photography with clean varietal spacing and brand-family balance.';
  }
  if (photoMode === 'Editorial Bottle Tabletop') {
    return 'SCENE_STYLE: real editorial bottle tabletop photography with natural material response.';
  }
  if (photoMode === 'Bottle In Hand Cutout') {
    return 'SCENE_STYLE: real cutout wine bottle photography with minimal backdrop and natural capture response.';
  }
  if (photoMode === 'Rose Tasting Table') {
    return 'SCENE_STYLE: real bright wine tasting-table photography with restrained styling.';
  }
  if (photoMode === 'Editorial Table') {
    return 'SCENE_STYLE: real editorial wine tabletop photography.';
  }
  if (photoMode === 'Winery Scene') {
    return 'SCENE_STYLE: real wine photography in an authentic cellar or winery environment.';
  }
  return 'SCENE_STYLE: real wine bottle photography with natural optical behavior and product-first fidelity.';
}
