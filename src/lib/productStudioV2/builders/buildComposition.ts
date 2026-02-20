import type { StudioAuthorityBundle, StudioUIState } from '../types/studioTypes.ts';

function buildInteractionCompositionBias(interaction?: string): string[] {
  const value = String(interaction || '').trim();
  if (!value) return [];

  if (value === 'holding') {
    return [
      'INTERACTION_COMPOSITION_BIAS: slight human-axis shift enabled.',
      'INTERACTION_COMPOSITION_BIAS: strict centering reduced.',
    ];
  }

  if (value === 'two-hand-hold' || value === 'cheers') {
    return [
      'INTERACTION_COMPOSITION_BIAS: center stability enforced.',
      'INTERACTION_COMPOSITION_BIAS: environmental spread reduced.',
    ];
  }

  if (value === 'presenting') {
    return [
      'INTERACTION_COMPOSITION_BIAS: label-forward bias increased.',
      'INTERACTION_COMPOSITION_BIAS: foreground depth separation increased.',
    ];
  }

  if (value === 'framed-presentation') {
    return [
      'INTERACTION_COMPOSITION_BIAS: environmental negative space allowed.',
      'INTERACTION_COMPOSITION_BIAS: vertical dominance reduced.',
    ];
  }

  return [];
}

export function buildComposition(authority: StudioAuthorityBundle, state?: StudioUIState): string {
  const interactionBias = buildInteractionCompositionBias(state?.interaction);

  if (state?.winePrestigeMode) {
    const action = String(state.wineAction || 'static-presentation').trim();
    return [
      'STUDIO_COMPOSITION_MODEL: wine-premium.',
      `WINE_ACTION: ${action}.`,
      'COMPOSITION_OVERRIDE: Product First composition is mandatory.',
      'RULE_OF_THIRDS_DEFAULT: enabled.',
      'ASYMMETRICAL_BALANCE: allowed.',
      'NEGATIVE_SPACE_POLICY: elegant breathing room is mandatory.',
      action === 'static-presentation'
        ? 'BOTTLE_TILT_RULE: static presentation requires vertical bottle orientation (0° tilt, perfectly upright).'
        : 'BOTTLE_TILT_RULE: controlled pour supports gentle tilt in physically valid range.',
      'GLASS_PLACEMENT_RULE: glass may be foreground or midground with refined separation.',
      'BACKGROUND_SEPARATION: dark premium separation is allowed.',
      'CENTER_SYMMETRY_LOCK: disabled unless explicitly selected by user.',
    ].join(' ');
  }

  if (state?.visualProfile === 'coffee') {
    if (state.coffeeVariant === 'coffee-premium-minimal' || state.visualIntent === 'conversion') {
      return [
        'STUDIO_COMPOSITION_MODEL: coffee-premium-minimal.',
        'COFFEE_COMPOSITION_DOMINANCE: premium-minimal vertical coverage target 75–85%.',
        'COFFEE_LAYOUT_RULE: product-forward framing with clean contextual support and intentional negative space.',
        ...interactionBias,
      ].join(' ');
    }

    if (state.coffeeVariant === 'coffee-color-pop-luxury' || state.visualIntent === 'campaign') {
      return [
        'STUDIO_COMPOSITION_MODEL: coffee-color-pop-luxury.',
        'COFFEE_COMPOSITION_DOMINANCE: color-pop-luxury vertical coverage target 80–90%.',
        'COFFEE_LAYOUT_RULE: premium campaign framing with controlled contextual props and dominant foreground authority.',
        ...interactionBias,
      ].join(' ');
    }

    if (state.coffeeVariant === 'coffee-editorial-ritual' || state.visualIntent === 'editorial-ritual') {
      return [
        'STUDIO_COMPOSITION_MODEL: coffee-editorial-ritual.',
        'COFFEE_COMPOSITION_DOMINANCE: editorial-ritual vertical coverage target 60–70%.',
        'COFFEE_ENVIRONMENTAL_BREATHING: allowed with intentional negative space and ritual balance.',
        'COFFEE_LAYOUT_RULE: balanced ritual composition preserving product readability.',
        ...interactionBias,
      ].join(' ');
    }
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
    ? 'SPLASH_SPATIAL_POLICY: Allow natural side propagation from the impact vector with coherent splash spread.'
    : authority.permissions.allowHorizontalSpread
    ? heroMode
      ? 'HORIZONTAL_BALANCE: controlled.'
      : macroMode
        ? 'HORIZONTAL_BALANCE: controlled for macro framing.'
      : 'HORIZONTAL_BALANCE: open when needed for edge continuity.'
    : 'HORIZONTAL_BALANCE: constrained.';
  const verticalRule = authority.permissions.allowVerticalDominance
    ? 'VERTICAL_BALANCE: emphasized.'
    : heroMode
      ? 'VERTICAL_BALANCE: hero emphasis.'
      : macroMode
        ? 'VERTICAL_BALANCE: macro emphasis.'
      : 'VERTICAL_BALANCE: neutral.';

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
            ? 'FRAME_CONSTRAINT: Splash hero framing. Product fills most vertical frame (85–88% height) with controlled side margins.'
          : 'FRAME_CONSTRAINT: Hero framing. Product fills most vertical frame (85–92% height) with controlled side margins.'
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
    ...interactionBias,
  ].join(' ');
}
