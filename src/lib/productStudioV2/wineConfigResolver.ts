import type { StudioUIState } from './types/studioTypes.ts';

export type ServeState = 'none' | 'served';
export type BottleFillState = 'retail-full' | 'clearly-partially-consumed';

export type ResolvedWineConfig = {
  closureType: string;
  bottleState: 'sealed' | 'open';
  serveState?: ServeState;
  bottleFillState?: BottleFillState;
};

export function buildWineTruthLayer(
  state: StudioUIState,
  config: ResolvedWineConfig
): string {
  const wineType = String(state.wineType || 'auto').trim();
  const closureType = String(config.closureType || 'from-reference').trim();
  const carbonationLevel = String(state.carbonationLevel || 'none').trim();

  // Derive serveState from config (with backwards compat for glassFillLevel)
  const serveState: ServeState = (config as any).serveState
    ? (config as any).serveState
    : (typeof (config as any).glassFillLevel !== 'undefined' && (config as any).glassFillLevel !== 'none')
    ? 'served'
    : 'none';

  // HARD ENFORCEMENT: if serveState='served', bottle MUST be open (override config.bottleState if needed)
  const bottleState: 'sealed' | 'open' = serveState === 'served' ? 'open' : config.bottleState;

  const bottleFillState: BottleFillState = (config as any).bottleFillState
    ? (config as any).bottleFillState
    : serveState === 'served'
    ? 'clearly-partially-consumed'
    : 'retail-full';

  const isSparkling =
    wineType === 'sparkling-white' ||
    wineType === 'sparkling-rosé' ||
    wineType === 'sparkling-rose';

  const emittedCarbonationLevel =
    wineType === 'sparkling-white' && carbonationLevel === 'high' ? 'natural' : carbonationLevel;

  const crownCapLock = buildCrownCapRemovalLockV3(closureType, bottleState);
  const sparklingLock = buildSparklingPhysicsLockV3(isSparkling, carbonationLevel);

  const engineStatusBlock = 'WINE_ENGINE_STATUS: active. deterministic.';
  const configBlock = `WINE_CONFIG_RESOLVED: wineType=${wineType}; closureType=${closureType}; bottleState=${bottleState}; serveState=${serveState}; bottleFillState=${bottleFillState}; carbonationLevel=${emittedCarbonationLevel};`;

  // SERVED_STATE_LOCK_V4: Single authoritative fill+closure state block.
  // Replaces all previous CRITICAL LIQUID LEVEL / SERVE_VOLUME_CONSERVATION_LOCK_V3 /
  // FILL_LEVEL_OVERRIDE fragments — one source of truth, no repetition.
  // Short-form deterministic phrasing: reduces semantic noise, improves model compliance.
  const servedStateLock = serveState === 'served'
    ? 'SERVED_STATE_LOCK_V4: This is a served wine scene. ' +
      'Bottle is open. No closure attached to neck. ' +
      'LIQUID_LEVEL: Bottle is 50% full. Liquid line clearly at midpoint of bottle height. Top half empty air. Bottom half wine. ' +
      'CLOSURE_COUNT: Exactly one detached closure lies flat on the surface near the bottle base. No second closure anywhere in the frame. ' +
      'GLASS_STATE: A wine glass is present, filled with wine to 1/3 height. ' +
      'INVALID: Full retail bottle, closure on neck, or missing glass are all invalid renders.'
    : '';

  const geometryBlock = 'GEOMETRY_LOCK: The bottle silhouette, proportions, shoulder angle, neck length, and base width MUST exactly match the reference image. Do NOT substitute a generic Bordeaux or Burgundy bottle shape. Preserve the exact bottle geometry from the reference — including neck-to-width ratio, shoulder curvature, and overall height-to-width ratio. No warping. No stretching. No shape substitution. Preserve closure scale. Label must remain in its exact position and size.' +
    ' BOTTLE_ORIENTATION: The bottle must stand perfectly upright and vertical. No tilt, no lean, no diagonal placement. Bottle base flat on surface.';
  const colorBlock = 'WINE_COLOR_LOCK: Liquid color must match reference exactly. No hue shift. No reinterpretation. No brightness drift. No environmental tint. Glass refraction must not shift chroma.';

  // SERVED SCENE COMPOSITION: always require a wine glass with liquid when served
  const servedGlassBlock = serveState === 'served'
    ? 'SERVED_SCENE_MANDATORY: A wine glass containing poured liquid MUST be present in the scene next to the bottle. The glass must be clearly visible, filled with wine to approximately 1/3 height. The glass and bottle must both be in the frame. This is non-negotiable — a served scene without a visible wine glass is invalid.'
    : '';

  // LABEL + GLASS PRESERVATION lock — only critical in served mode where the model tends
  // to regenerate the bottle body and strip label graphics or make glass opaque.
  // Glass behavior is wine-type aware:
  //   - white/rosé/sparkling → transparent glass (liquid color visible through walls)
  //   - red → dark tinted glass (deep green/black bottle, liquid NOT visible through walls)
  //   - auto → match reference exactly, no material change
  const wineColor = String((state as any).wineColor || 'auto').trim().toLowerCase();
  const glassLock = (() => {
    if (wineColor === 'red') {
      return 'GLASS_MATERIAL_LOCK: The bottle is made of dark tinted glass (deep green or near-black). The bottle exterior is NOT transparent. Do NOT render it as clear or translucent glass. Preserve the exact bottle color and opacity from the reference image.';
    }
    if (wineColor === 'white' || wineColor === 'rosé' || wineColor === 'rose' || wineColor === 'sparkling') {
      return 'GLASS_TRANSPARENCY_LOCK: The bottle is made of transparent or lightly tinted glass. The glass exterior must remain visually transparent, showing the liquid color through the glass walls. Do NOT render the bottle as opaque, frosted, ceramic, or plastic. The glass must show natural light refraction and translucency.';
    }
    // auto / unknown → just preserve from reference, no assumption
    return 'GLASS_MATERIAL_LOCK: Preserve the exact bottle glass material and color from the reference image. Do NOT change transparency, opacity, tint, or material type.';
  })();
  const labelGlassBlock = serveState === 'served'
    ? `LABEL_PRESERVATION_LOCK: The bottle label must be fully preserved exactly as in the reference image. Do NOT remove, fade, replace, or alter the label in any way. The label design, text, colors, and position must be identical to the reference. ${glassLock}`
    : '';

  // SERVED mode: single physics block, no structural lock forward-reference.
  // ORDER: state lock (most violated) → closure → glass → geometry → label → color → sparkling
  if (serveState === 'served') {
    return [engineStatusBlock, configBlock, servedStateLock, crownCapLock, servedGlassBlock, geometryBlock, labelGlassBlock, colorBlock, sparklingLock].filter(Boolean).join(' ');
  }

  // None / closed: sealed bottle, retail-full, no glass — hard rules to prevent model from adding props
  const closedBottleBlock = 'CLOSED_BOTTLE_LOCK: The bottle is sealed and closed. The closure (cap, cork, or screw top) is fully attached to the bottle neck. The bottle appears at retail-full level — filled to the top. No wine glass in the scene. No detached closure. No poured liquid. The bottle is in its original unopened presentation state.';

  return [
    engineStatusBlock,
    configBlock,
    closedBottleBlock,
    crownCapLock,
    sparklingLock,
  ].filter(Boolean).join(' ');
}

function buildCrownCapRemovalLockV3(closureType: string, bottleState: 'sealed' | 'open'): string {
  if (bottleState !== 'open') return '';

  // For crown-cap: detailed crimp physics
  // NOTE: CAP_COUNT_LOCK intentionally removed — count is already authoritative in
  // SERVED_STATE_LOCK_V4 (CLOSURE_COUNT token). Two independent "one detached" mentions
  // cause the model to render two separate physical closure objects.
  if (closureType === 'crown-cap') {
    return [
      'CROWN_CAP_REMOVAL_LOCK_V3:',
      'Closure type: crimped metal crown-cap only.',
      'Neck lip must show smooth circular glass rim.',
      'No cork geometry.',
      'No screw-thread geometry.',
      'No foil remnants.',
      'No hybrid morphology allowed.',
      'Detached cap must show crimp deformation consistent with pry removal.',
      'CAP_PLACEMENT_PHYSICS: The detached crown cap MUST be lying flat on the surface (horizontal, face-up or face-down). A crown cap standing upright or on its edge is physically impossible due to gravity and is strictly forbidden. The cap rests flat on the table/surface near the bottle base.',
      'No partial ring artifacts.',
    ].join(' ');
  }

  // For any other closure type (from-reference, natural-cork, screw-cap, etc.) when open:
  // CLOSURE_COUNT is already enforced in SERVED_STATE_LOCK_V4 — do not repeat it here.
  return 'CLOSURE_LOCK_V3: The bottle is open. The closure (cork, cap, or stopper as shown in the reference) has been removed and is detached from the bottle. The detached closure MUST be lying flat on the surface horizontally, not standing upright. The bottle neck is open with no closure attached.';
}

function buildSparklingPhysicsLockV3(isSparkling: boolean, carbonationLevel: string): string {
  if (!isSparkling || carbonationLevel === 'none') return '';
  return [
    'SPARKLING_PHYSICS_LOCK_V3:',
    'Carbonation visibility must be extremely subtle.',
    'Bubble diameter near microscopic scale.',
    'No continuous vertical bubble columns.',
    'Maximum 3 to 5 faint isolated trails inside glass only.',
    'Bottle interior carbonation barely perceptible.',
    'If bubbles are obvious at first glance, result is incorrect.',
    'No champagne-density.',
    'No soda turbulence.',
    'No foam head.',
    'No decorative sparkle effect.',
  ].join(' ');
}

function buildServeVolumeConservationLockV3(
  bottleState: 'sealed' | 'open',
  serveState: ServeState,
  bottleFillState: BottleFillState
): string {
  // Only apply when bottle is open and serveState indicates served
  if (!(bottleState === 'open' && serveState === 'served')) return '';

  if (bottleFillState === 'clearly-partially-consumed') {
    return [
      'SERVE_VOLUME_CONSERVATION_LOCK_V3:',
      'Bottle must appear clearly partially consumed.',
      'The liquid level must be visually around the middle of the bottle height.',
      'A near-full bottle is invalid.',
      'If the bottle appears retail-full while a glass contains liquid, the image is incorrect.',
      'FILL_LEVEL_OVERRIDE: The bottle is approximately half-empty. The liquid inside is only halfway up the bottle. Do NOT render a full, completely-filled, or unopened-looking bottle. This is the most important constraint — a full bottle is an incorrect render.',
    ].join(' ');
  }

  // retail-full case should not normally occur when serveState=served, but provide a clear
  // statement for completeness when serveState indicates none.
  return [
    'SERVE_VOLUME_CONSERVATION_LOCK_V3:',
    'When bottleFillState=retail-full:',
    'Bottle appears in standard retail-full condition.'
  ].join(' ');
}

function buildWineStructuralLockV3(
  hasVolumeLock: boolean,
  hasSparklingLock: boolean,
  closureLockToken: string
): string {
  const apply: string[] = [];
  if (hasVolumeLock) apply.push('SERVE_VOLUME_CONSERVATION_LOCK_V3');
  if (hasSparklingLock) apply.push('SPARKLING_PHYSICS_LOCK_V3');
  if (closureLockToken) apply.push(closureLockToken);

  return [
    'WINE_STRUCTURAL_LOCK_V3:',
    apply.length > 0 ? `Apply: ${apply.join(', ')}.` : '',
    'Physical plausibility overrides aesthetics.',
    'No stylized beverage advertising behavior.',
    'If physical coherence between bottle, glass, closure and carbonation is not visually consistent, the result is incorrect.',
  ].filter(Boolean).join(' ');
}

