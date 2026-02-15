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
      ? 'COMPOSITION_DIRECTIVE: Professional editorial product photography composition. Camera at eye-level height (photographer standing, camera at chest/eye level pointing straight at product). Product centered in frame. Ingredients placed around product in circular/halo arrangement on same tabletop surface. Similar to wellness magazine editorial, cosmetics catalog, or Goop/Into The Gloss product features. STRICT CAMERA ANGLE: Horizontal straight-on view OR gentle 10-15° downward tilt (as if photographer standing and tilting camera slightly down toward table). ABSOLUTELY PROHIBITED: overhead camera, top-down view, flat-lay angle, bird-eye view, 45°+ downward angle, aerial perspective. INGREDIENT_INTERPRETATION LOCK: Render ONLY raw natural ingredients (fresh herbs, botanicals, whole fruits, spices, plant matter, oils in amber dropper bottles). FORBIDDEN: packaged cosmetic products, supplement bottles, secondary branded containers. "cinnamon oil extract" = cinnamon bark sticks + small amber dropper bottle with oil, NOT another packaged cinnamon oil product. Ingredients are styling props, NOT additional products to sell.'
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
  ].join(' ');
}
