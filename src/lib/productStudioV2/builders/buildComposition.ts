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
      ? 'INGREDIENT_STACK_PERSPECTIVE_LOCK: Camera must be front-facing or 45° hero angle. Eye-level or slight 10–20° downward tilt maximum. Absolutely NO top-down view. Absolutely NO overhead camera. Absolutely NO flat lay composition. Product must show visible front label plane. Product height must be visible in perspective. Cap and vertical product geometry must be visible. Surface horizon line must be visible behind product. Ingredients must sit on same physical surface plane as product. Ingredients must not form circular flat lay pattern. Depth separation required between foreground and background. Shallow depth of field allowed. Overhead symmetry forbidden. FLAT_LAY_FORBIDDEN: If camera angle > 35° downward tilt, regenerate composition. COMPOSITION_DIRECTIVE: Product positioned upright at eye-level or 45° hero angle. Camera height aligned with product mid-section. Visible front label plane. Ingredients arranged around base perimeter on same horizontal surface plane, viewed from front perspective. Surface horizon line visible. No overhead geometry compression. CAMERA_POSITION_LOCK: Camera physically placed in front of product at tabletop height. Viewer must see front face of label. Viewer must see depth behind product.'
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
      ? 'CRITICAL_COMPOSITION_GUARD: If the composition resembles a flat lay, overhead table shot, or top-down ingredient layout, this output is invalid and must be regenerated with front-facing perspective.'
      : '',
  ].join(' ');
}
