import type { StudioAuthorityBundle, StudioUIState } from '../types/studioTypes';

export function buildWineWorld(
  _authority: StudioAuthorityBundle,
  state?: StudioUIState
): string {
  const photoMode = String(state?.photoMode || '').trim();
  const secondaryHumanRealism =
    'Any incidental visible human presence must read as real photographed adult anatomy with unretouched skin texture and authentic hospitality capture. Faces are allowed only if they remain secondary, softly defocused, partially cropped, or clearly behind the action. No portrait priority. No porcelain skin, no doll-face smoothness, no mannequin features, no waxy beauty-retouch finish, and no CGI guest rendering.';
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
    return `SCENE_STYLE: real product-lifestyle shared-table wine photography with hospitality context, tactile food cues, action-first framing, and strong bottle readability. Human presence stays incidental: cropped hands, forearms, shoulders, partial torsos, or softly defocused background guests only. No portrait subjects. ${secondaryHumanRealism} The moment should feel like authentic table service, not stock lifestyle staging.`;
  }
  if (photoMode === 'Outdoor Toast') {
    return `SCENE_STYLE: real product-lifestyle outdoor wine photography with toast energy, natural daylight, relaxed premium hospitality, and believable picnic-or-terrace action context. Human presence should read as a toast moment, not a portrait: glasses and hands may take focus, while any faces or bodies remain secondary, soft, cropped, or behind the action. ${secondaryHumanRealism}`;
  }
  if (photoMode === 'Hosting Pour') {
    return `SCENE_STYLE: real product-lifestyle hosting wine photography with active pour service and authentic hospitality framing rooted in table realism rather than showroom styling. Human presence stays service-led and cropped or backgrounded. No host portrait framing. ${secondaryHumanRealism}`;
  }
  if (photoMode === 'Dinner Pairing') {
    return `SCENE_STYLE: real product-lifestyle wine dinner-pairing photography with tactile plated-food context, premium table texture, and refined hospitality atmosphere that still keeps the bottle commercially legible. Any diners, if present, remain incidental, partial, softly defocused, or backgrounded rather than portrait subjects. ${secondaryHumanRealism}`;
  }
  if (photoMode === 'Picnic Gathering') {
    return `SCENE_STYLE: real product-lifestyle picnic wine photography with relaxed outdoor hospitality cues, simple shareable food, and premium natural light grounded in believable casual service context. Guests should read as a shared moment through crops, gestures, or soft background presence, never as portrait figures. ${secondaryHumanRealism}`;
  }
  if (photoMode === 'Celebration Chill') {
    return `SCENE_STYLE: real product-lifestyle fresh wine hospitality photography with restrained action context, premium table service realism, and clean dry materials. Human presence stays secondary, cropped, or softly backgrounded. ${secondaryHumanRealism} No ice-bucket theatrics, no condensation glamour, and no wet-surface gimmicks.`;
  }
  return 'SCENE_STYLE: real wine bottle photography with natural optical behavior and product-first fidelity.';
}
