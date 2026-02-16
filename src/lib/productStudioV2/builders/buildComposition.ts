import type { StudioAuthorityBundle } from '../types/studioTypes.ts';

export function buildComposition(authority: StudioAuthorityBundle): string {
  const heroMode = authority.composition === 'hero';
  const macroMode = authority.composition === 'macro';
  const ingredientStackMode = authority.composition === 'ingredient-stack';
  const flatLayMode = authority.composition === 'flat-lay';
  
  const spreadRule = authority.permissions.allowHorizontalSpread
    ? heroMode
      ? 'LATERAL_SPREAD: Restricted.'
      : macroMode
        ? 'LATERAL_SPREAD: Restricted for macro framing.'
      : 'Horizontal spread is permitted when needed for edge continuity.'
    : 'Horizontal spread is disabled.';
  const verticalRule = authority.permissions.allowVerticalDominance
    ? 'Vertical subject dominance is enabled.'
    : heroMode
      ? 'VERTICAL_SUBJECT_DOMINANCE: Strong.'
      : macroMode
        ? 'VERTICAL_SUBJECT_DOMINANCE: Strong for macro close-up.'
      : 'Vertical subject dominance is not forced.';

  return [
    `STUDIO_COMPOSITION_MODEL: ${authority.composition}.`,
    heroMode
      ? 'FRAME_CONSTRAINT: Tight hero framing. The product must fill most of the vertical frame (85–92% height coverage). Minimal side margins. No excessive lateral negative space.'
      : '',
    macroMode
      ? 'FRAME_CONSTRAINT: True macro close-up. Product label and adjacent bottle surface must dominate frame with minimal side margins. No medium/wide composition.'
      : '',
    ingredientStackMode
      ? 'INGREDIENT_STACK_PERSPECTIVE_LOCK: Camera must be front-facing or 45° hero angle. Camera tilt must not exceed 20° downward. Top-down view strictly forbidden. Overhead camera strictly forbidden. Flat lay composition strictly forbidden. Front label surface must be fully visible. Full product height must be visible in perspective. Cap and vertical product geometry must be visible. Background plane must be visible behind product. Ingredients must sit on same physical surface plane as product. Ingredients must not form circular top-view arrangement. Depth separation required between foreground and background. Overhead symmetry forbidden. FLAT_LAY_FORBIDDEN: If camera angle exceeds 30° downward tilt, regenerate composition. COMPOSITION_DIRECTIVE: Product upright on horizontal surface. Camera positioned directly in front of product or at 45° hero angle. Front label surface clearly visible. Ingredients arranged around product base on same surface plane. Background plane visible. No overhead compression. CAMERA_POSITION_LOCK: Camera physically positioned in front of product at horizontal alignment. Front label surface must be fully visible. Depth behind product must be visible.'
      : '',
    flatLayMode
      ? 'COMPOSITION_DIRECTIVE: Top-down flat lay composition. Product and ingredients arranged on a single surface viewed from directly above (90° overhead). Clean grid-like or organized radial placement.'
      : '',
    'FRAME_EDGE_POLICY: Maintain real scene continuity to all four edges. No white lateral padding, no pillarbox/letterbox bars, no mirrored edge extension, no duplicated side strips, and no synthetic side-fill bands.',
    heroMode
      ? 'NEGATIVE_SPACE_POLICY: Controlled and minimal.'
      : '',
    spreadRule,
    verticalRule,
    authority.permissions.allowVerticalDominance
      ? 'No lateral splash expansion allowed.'
      : 'Lateral splash expansion follows world constraints.',
    ingredientStackMode
      ? 'CRITICAL_COMPOSITION_GUARD: If composition resembles flat lay, overhead layout, or top-down table shot, regenerate using front-facing perspective.'
      : '',
  ].join(' ');
}
