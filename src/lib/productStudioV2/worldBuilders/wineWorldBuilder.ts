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
  if (photoMode === 'Social Table Served') {
    return 'SCENE_STYLE: real product-lifestyle shared-table wine photography with hospitality context, tactile food cues, action-first framing, and strong bottle readability. The moment should feel like authentic table service, not stock lifestyle staging.';
  }
  if (photoMode === 'Outdoor Toast') {
    return 'SCENE_STYLE: real product-lifestyle outdoor wine photography with toast energy, natural daylight, relaxed premium hospitality, and believable picnic-or-terrace action context.';
  }
  if (photoMode === 'Hosting Pour') {
    return 'SCENE_STYLE: real product-lifestyle hosting wine photography with active pour service and authentic hospitality framing rooted in table realism rather than showroom styling.';
  }
  if (photoMode === 'Dinner Pairing') {
    return 'SCENE_STYLE: real product-lifestyle wine dinner-pairing photography with tactile plated-food context, premium table texture, and refined hospitality atmosphere that still keeps the bottle commercially legible.';
  }
  if (photoMode === 'Picnic Gathering') {
    return 'SCENE_STYLE: real product-lifestyle picnic wine photography with relaxed outdoor hospitality cues, simple shareable food, and premium natural light grounded in believable casual service context.';
  }
  if (photoMode === 'Celebration Chill') {
    return 'SCENE_STYLE: real product-lifestyle fresh wine hospitality photography with restrained action context, premium table service realism, and clean dry materials. No ice-bucket theatrics, no condensation glamour, and no wet-surface gimmicks.';
  }
  return 'SCENE_STYLE: real wine bottle photography with natural optical behavior and product-first fidelity.';
}
