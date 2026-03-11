import type { StudioAuthorityBundle, StudioUIState } from '../types/studioTypes';

export function buildWineWorld(
  _authority: StudioAuthorityBundle,
  state?: StudioUIState
): string {
  const photoMode = String(state?.photoMode || '').trim();
  if (photoMode === 'Wine Macro Label') {
    return 'SCENE_STYLE: hyper-real luxury wine advertising macro photography with label-detail precision.';
  }
  if (photoMode === 'Bottle + Glass') {
    return 'SCENE_STYLE: hyper-real professional wine advertising photography with bottle-and-glass service presentation.';
  }
  if (photoMode === 'Bottle + Glass Pour') {
    return 'SCENE_STYLE: hyper-real professional wine advertising photography with controlled hospitality pour motion.';
  }
  if (photoMode === 'Hands Pouring Wine') {
    return 'SCENE_STYLE: hyper-real professional wine advertising photography with cropped-hands hospitality service framing.';
  }
  if (photoMode === 'Wine Lineup Comparison') {
    return 'SCENE_STYLE: hyper-real professional wine advertising lineup photography with clean varietal spacing and brand-family balance.';
  }
  if (photoMode === 'Editorial Bottle Tabletop') {
    return 'SCENE_STYLE: hyper-real luxury wine advertising still-life tabletop photography.';
  }
  if (photoMode === 'Bottle In Hand Cutout') {
    return 'SCENE_STYLE: hyper-real professional wine advertising cutout photography with minimal backdrop.';
  }
  if (photoMode === 'Rose Tasting Table') {
    return 'SCENE_STYLE: hyper-real bright wine advertising photography with premium tasting-table styling.';
  }
  if (photoMode === 'Editorial Table') {
    return 'SCENE_STYLE: hyper-real professional wine advertising tabletop photography.';
  }
  if (photoMode === 'Winery Scene') {
    return 'SCENE_STYLE: hyper-real luxury wine advertising photography in an authentic cellar environment.';
  }
  return 'SCENE_STYLE: hyper-real professional wine advertising photography.';
}
