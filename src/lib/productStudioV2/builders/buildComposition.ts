import type { StudioAuthorityBundle, StudioUIState } from '../types/studioTypes.ts';

export function buildComposition(authority: StudioAuthorityBundle, state?: StudioUIState): string {
  if (state?.winePrestigeMode) {
    const winePrestigeV2Mode = Boolean(state.winePrestigeV2Mode);
    const wineAction = String(state.wineAction || 'static-presentation').trim();
    const isDynamicWineAction = wineAction === 'controlled-pour' || wineAction === 'pour';
    const pourStyle = String(state.winePourStyle || 'mid-flow-elegance').trim();
    return [
      'STUDIO_COMPOSITION_MODEL: wine-prestige.',
      'CAMERA SYSTEM OVERRIDE (SAFE VERSION): LENS_PROFILE = "short telephoto premium prime (85–100mm equivalent)"; DISTORTION = 0; DEPTH_STYLE = "cinematic optical falloff"; BACKGROUND_BLUR = "natural optical depth, not artificial blur".',
      winePrestigeV2Mode ? `POUR_STYLE: ${pourStyle}.` : 'WINE_ACTION: static-presentation.',
      'COMPOSITION_OVERRIDE: Product First composition is mandatory.',
      'RULE_OF_THIRDS_DEFAULT: enabled.',
      'ASYMMETRICAL_BALANCE: allowed.',
      'NEGATIVE_SPACE_POLICY: elegant breathing room is mandatory.',
      isDynamicWineAction
        ? 'BOTTLE_TILT_RULE: dynamic pour action allows controlled bottle tilt between 5° and 12° max.'
        : 'BOTTLE_TILT_RULE: static presentation requires vertical bottle orientation (0° tilt, perfectly upright).',
      'GLASS_PLACEMENT_RULE: glass may be foreground or midground with refined separation.',
      'BACKGROUND_SEPARATION: dark premium separation is allowed.',
      'CENTER_SYMMETRY_LOCK: disabled unless explicitly selected by user.',
      'FRAME_CONSTRAINT: vertical product coverage target 75–80%. Never apply ecommerce compression framing.',
      'CAMERA_RESTRICTIONS: top-down camera forbidden. ultra-wide lens forbidden. orthographic look forbidden.',
      'CROP_RESTRICTIONS: aggressive crop forbidden.',
    ].join(' ');
  }

  const heroMode = authority.composition === 'hero';
  const macroMode = authority.composition === 'macro';
  const ingredientStackMode = authority.composition === 'ingredient-stack';
  const flatLayMode = authority.composition === 'flat-lay';
  const splashMode =
    authority.world === 'splash-tank' ||
    authority.world === 'beach-daylight' ||
    authority.world === 'underwater';
  const splashAdMode = Boolean(state?.splashAdMode);
  
  // BUNDLE MODE DETECTION: Check if bundle is enabled with product references
  // When bundle mode is active, use relaxed framing (not tight 85-92%)
  const hasBundleReference = Boolean(state?.bundle?.enabled && state.bundle.primaryProductId);
  
  const spreadRule = splashMode
    ? 'LATERAL_SPREAD: Allow natural side propagation from the impact vector; no artificial clipping.'
    : authority.permissions.allowHorizontalSpread
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
    splashAdMode ? 'SPLASH_AD_COMPOSITION_OVERRIDE: Product First composition is mandatory.' : '',
    splashAdMode ? 'SYMMETRY_LOCK: Disabled. Do not force centered symmetry.' : '',
    splashAdMode && !heroMode
      ? 'FRAME_CONSTRAINT: SPLASH_AD framing. Product vertical coverage must remain within 75–80% to preserve breathing room for lateral energy.'
      : '',
    heroMode
      ? hasBundleReference
        ? 'FRAME_CONSTRAINT: Close-up framing without altering proportions. Products maintain exact aspect ratios.'
        : splashAdMode
          ? 'FRAME_CONSTRAINT: SPLASH_AD framing. Product vertical coverage must remain within 75–80% to preserve breathing room for lateral energy.'
          : splashMode
            ? 'FRAME_CONSTRAINT: Tight hero framing for splash mode. The product must fill most of the vertical frame (85–88% height coverage). Minimal side margins while preserving splash readability.'
          : 'FRAME_CONSTRAINT: Tight hero framing. The product must fill most of the vertical frame (85–92% height coverage). Minimal side margins. No excessive lateral negative space.'
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
    splashMode
      ? 'SPLASH_SPREAD_POLICY: Keep one dominant directional flow and allow physically coherent lateral spread.'
      : authority.permissions.allowVerticalDominance
        ? 'No lateral splash expansion allowed.'
        : 'Lateral splash expansion follows world constraints.',
    splashAdMode ? 'SPLASH_AD_FRAMING_LOCK: Do not apply ecommerce-style compression framing.' : '',
    splashAdMode ? 'SPLASH_AD_DIRECTIONALITY: Asymmetric dominant splash direction is required.' : '',
    ingredientStackMode
      ? 'CRITICAL_COMPOSITION_GUARD: If composition resembles flat lay, overhead layout, or top-down table shot, regenerate using front-facing perspective.'
      : '',
  ].join(' ');
}
