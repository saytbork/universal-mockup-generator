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
  if (photoMode === 'Editorial Table') {
    return 'SCENE_STYLE: wine editorial tabletop photography.';
  }
  if (photoMode === 'Winery Scene') {
    return 'SCENE_STYLE: wine cellar editorial photography.';
  }
  return 'SCENE_STYLE: wine editorial photography.';
}

