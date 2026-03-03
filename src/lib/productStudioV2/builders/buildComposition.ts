import type { StudioAuthorityBundle, StudioUIState } from '../types/studioTypes.ts';

// ---------------------------------------------------------------------------
// Final composition authority resolver.
// Cinematography angle (when set) overrides the photo-mode base composition.
// Pure function — no mutations, no side effects.
// ---------------------------------------------------------------------------
function resolveFinalComposition(
  state: StudioUIState | undefined,
  baseComposition: string
): string {
  const raw = String(state?.cameraAngle || state?.angleOverride || '').trim();
  if (!raw) return baseComposition;

  const a = raw.toLowerCase();

  // flat-lay — checked first: "top-down", "top down", "flat lay", "flat-lay", "overhead"
  if (a.includes('flat') || (a.includes('top') && a.includes('down')) || a.includes('overhead')) {
    return 'flat-lay';
  }

  // hero-45 — "45", "hero"
  if (a.includes('45') || a.includes('hero')) {
    return 'hero-45';
  }

  // low-angle — requires 'low' + 'angle' to avoid firing on "slow", "glow", "below"
  if (a.includes('low') && a.includes('angle')) {
    return 'low-angle';
  }

  // high-angle — requires 'high' + 'angle' to avoid firing on "highlight", "high key"
  if (a.includes('high') && a.includes('angle')) {
    return 'high-angle';
  }

  // eye-level — "eye"
  if (a.includes('eye')) {
    return 'eye-level';
  }

  return baseComposition;
}

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
    return [
      'COMPOSITION:',
      'Product-first framing.',
      'Rule of thirds alignment.',
      'Bottle upright at 0° tilt unless pouring.',
      'Elegant negative space.',
    ].join(' ');
  }

  if (state?.visualProfile === 'coffee') {
    if (state.coffeeMoodProfile === 'coffee-cinematic-luxury' || state.coffeeVariant === 'coffee-cinematic-luxury') {
      return [
        'STUDIO_COMPOSITION_PROFILE: coffee-cinematic-luxury.',
        'COFFEE_COMPOSITION_DOMINANCE: 88–92%.',
        'COFFEE_PRODUCT_DOMINANCE_RATIO: 88–92%.',
        'COFFEE_LAYOUT_RULE: ritual framing. Hero dominance with ritual framing. Foreground authority. Controlled negative space. Depth layering foreground-mid-background.',
        'VERTICAL_SUBJECT_DOMINANCE: Strong.',
        'LATERAL_SPREAD: Controlled.',
        'NEGATIVE_SPACE_POLICY: Intentional minimal.',
        ...interactionBias,
      ].join(' ');
    }

    if (state.coffeeVariant === 'coffee-premium-minimal' || state.visualIntent === 'conversion') {
      return [
        'STUDIO_COMPOSITION_PROFILE: coffee-premium-minimal.',
        'COFFEE_COMPOSITION_DOMINANCE: premium-minimal vertical coverage target 75–85%.',
        'COFFEE_LAYOUT_RULE: product-forward framing with clean contextual support and intentional negative space.',
        ...interactionBias,
      ].join(' ');
    }

    if (state.coffeeVariant === 'coffee-color-pop-luxury' || state.visualIntent === 'campaign') {
      return [
        'STUDIO_COMPOSITION_PROFILE: coffee-color-pop-luxury.',
        'COFFEE_COMPOSITION_DOMINANCE: color-pop-luxury vertical coverage target 80–90%.',
        'COFFEE_LAYOUT_RULE: premium campaign framing with controlled contextual props and dominant foreground authority.',
        ...interactionBias,
      ].join(' ');
    }

    if (state.coffeeVariant === 'coffee-editorial-ritual' || state.visualIntent === 'editorial-ritual') {
      return [
        'STUDIO_COMPOSITION_PROFILE: coffee-editorial-ritual.',
        'COFFEE_COMPOSITION_DOMINANCE: editorial-ritual vertical coverage target 60–70%.',
        'COFFEE_ENVIRONMENTAL_BREATHING: allowed with intentional negative space and ritual balance.',
        'COFFEE_LAYOUT_RULE: balanced ritual composition preserving product readability.',
        ...interactionBias,
      ].join(' ');
    }
  }

  const heroMode = authority.composition === 'hero';
  const macroMode = authority.composition === 'macro';
  // finalComposition is resolved here so structural mode flags reflect the
  // cinematography-overridden profile — prevents PERSPECTIVE_LOCK / COMPOSITION_DIRECTIVE
  // conflicts when cinematography overrides the photo-mode base.
  const finalComposition = resolveFinalComposition(state, authority.composition);
  const ingredientStackMode = finalComposition === 'ingredient-stack';
  const flatLayMode = finalComposition === 'flat-lay';
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
    `STUDIO_COMPOSITION_PROFILE: ${finalComposition}.`,
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
