import type { StudioAuthorityBundle, StudioUIState } from '../types/studioTypes';

export function buildWineWorld(
  _authority: StudioAuthorityBundle,
  state?: StudioUIState
): string {
  const photoMode = String(state?.photoMode || '').trim();
  if (photoMode === 'Wine Macro Label') {
    return 'SCENE_STYLE: wine macro label-detail photography.';
  }
  if (photoMode === 'Bottle + Glass') {
    return 'SCENE_STYLE: wine bottle-plus-glass editorial photography.';
  }
  if (photoMode === 'Bottle + Glass Pour') {
    return 'SCENE_STYLE: wine pouring editorial photography with controlled hospitality motion.';
  }
  if (photoMode === 'Hands Pouring Wine') {
    return 'SCENE_STYLE: cropped-hands wine service photography with premium hospitality framing.';
  }
  if (photoMode === 'Wine Lineup Comparison') {
    return 'SCENE_STYLE: wine lineup comparison photography with clean varietal spacing and brand-family balance.';
  }
  if (photoMode === 'Editorial Bottle Tabletop') {
    return 'SCENE_STYLE: wine editorial still-life tabletop photography.';
  }
  if (photoMode === 'Bottle In Hand Cutout') {
    return 'SCENE_STYLE: wine hand-held commercial cutout photography with minimal backdrop.';
  }
  if (photoMode === 'Rose Tasting Table') {
    return 'SCENE_STYLE: bright wine tasting-table editorial photography.';
  }
  if (photoMode === 'Editorial Table') {
    return 'SCENE_STYLE: wine editorial tabletop photography.';
  }
  if (photoMode === 'Winery Scene') {
    return 'SCENE_STYLE: wine cellar editorial photography.';
  }
  return 'SCENE_STYLE: wine editorial photography.';
}
