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
  const volumeLock = buildServeVolumeConservationLockV3(bottleState, serveState, bottleFillState);
  const sparklingLock = buildSparklingPhysicsLockV3(isSparkling, carbonationLevel);
  const structuralLock = buildWineStructuralLockV3(Boolean(volumeLock), Boolean(sparklingLock), Boolean(crownCapLock));

  const engineStatusBlock = 'WINE_ENGINE_STATUS: active. deterministic.';
  const configBlock = `WINE_CONFIG_RESOLVED: wineType=${wineType}; closureType=${closureType}; bottleState=${bottleState}; serveState=${serveState}; bottleFillState=${bottleFillState}; carbonationLevel=${emittedCarbonationLevel};`;
  
  // CRITICAL: When served, use EXTREME repetition across multiple instructions
  // Single mention doesn't work - need to repeat in multiple contexts
  const liquidLevelBlock = serveState === 'served'
    ? `CRITICAL LIQUID LEVEL: The wine bottle liquid level is at 50% height (half-full/half-empty). The wine surface inside the bottle is visible at the middle point of the bottle body. Top half of bottle interior is empty air space. Bottom half contains wine liquid. This is a partially consumed bottle with significant liquid removed. The bottle is NOT full. The bottle is NOT at maximum capacity. Substantial amount of wine has been poured out.`
    : '';
  
  const geometryBlock = 'GEOMETRY_LOCK: Preserve bottle shape and label integrity. Preserve closure scale. No warping. No stretching.' + (serveState === 'served' ? ' LIQUID LEVEL: Visible at 50% bottle height.' : '');
  const colorBlock = 'WINE_COLOR_LOCK: Liquid color must match reference exactly. No hue shift. No reinterpretation. No brightness drift. No environmental tint. Glass refraction must not shift chroma.';

  // LABEL + GLASS PRESERVATION lock — only critical in served mode where the model tends
  // to regenerate the bottle body and strip label graphics or make glass opaque.
  // Glass behavior is wine-type aware:
  //   - white/rosé/sparkling → transparent glass (liquid color visible through walls)
  //   - red → dark tinted glass (deep green/black bottle, liquid NOT visible through walls)
  //   - auto → match reference exactly, no material change
  const wineColor = String((state as any).wineColor || 'auto').trim().toLowerCase();
  const glassLock = (() => {
    if (wineColor === 'red') {
      return 'GLASS_MATERIAL_LOCK: The bottle is made of dark tinted glass (deep green or near-black). The bottle body is NOT transparent. Do NOT render it as clear or translucent glass. Preserve the exact bottle color and opacity from the reference image.';
    }
    if (wineColor === 'white' || wineColor === 'rosé' || wineColor === 'rose' || wineColor === 'sparkling') {
      return 'GLASS_TRANSPARENCY_LOCK: The bottle is made of transparent or lightly tinted glass. The glass body must remain visually transparent, showing the liquid color through the glass walls. Do NOT render the bottle as opaque, frosted, ceramic, or plastic. The glass must show natural light refraction and translucency.';
    }
    // auto / unknown → just preserve from reference, no assumption
    return 'GLASS_MATERIAL_LOCK: Preserve the exact bottle glass material and color from the reference image. Do NOT change transparency, opacity, tint, or material type.';
  })();
  const labelGlassBlock = serveState === 'served'
    ? `LABEL_PRESERVATION_LOCK: The bottle label must be fully preserved exactly as in the reference image. Do NOT remove, fade, replace, or alter the label in any way. The label design, text, colors, and position must be identical to the reference. ${glassLock}`
    : '';

  // If served, produce a minimal high-priority prompt containing ONLY the required safety blocks.
  if (serveState === 'served') {
    return [engineStatusBlock, configBlock, liquidLevelBlock, volumeLock, crownCapLock, structuralLock, geometryBlock, labelGlassBlock, colorBlock, sparklingLock].filter(Boolean).join(' ');
  }

  return [
    engineStatusBlock,
    configBlock,
    liquidLevelBlock,
    // Volume lock must be placed immediately after the resolved config so image models
    // prioritize physical plausibility before styling or environment is injected.
    volumeLock,
    crownCapLock,
    structuralLock,
    geometryBlock,
    colorBlock,
    sparklingLock,
  ].filter(Boolean).join(' ');
}

function buildCrownCapRemovalLockV3(closureType: string, bottleState: 'sealed' | 'open'): string {
  if (closureType !== 'crown-cap' || bottleState !== 'open') return '';
  return [
    'CROWN_CAP_REMOVAL_LOCK_V3:',
    'Closure type: crimped metal crown-cap only.',
    'Neck lip must show smooth circular glass rim.',
    'No cork geometry.',
    'No screw-thread geometry.',
    'No foil remnants.',
    'No hybrid morphology allowed.',
    'Exactly one detached cap object.',
    'There must be at most one detached cap in the scene; if more than one cap is present the image is invalid.',
    'Detached cap must show crimp deformation consistent with pry removal.',
    'No partial ring artifacts.',
    'No duplicate closure.',
    'No duplicate closures.',
  ].join(' ');
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
      'If the bottle appears retail-full while a glass contains liquid, the image is incorrect.'
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
  hasCrownCapLock: boolean
): string {
  const apply: string[] = [];
  if (hasVolumeLock) apply.push('SERVE_VOLUME_CONSERVATION_LOCK_V3');
  if (hasSparklingLock) apply.push('SPARKLING_PHYSICS_LOCK_V3');
  if (hasCrownCapLock) apply.push('CROWN_CAP_REMOVAL_LOCK_V3');

  return [
    'WINE_STRUCTURAL_LOCK_V3:',
    apply.length > 0 ? `Apply: ${apply.join(', ')}.` : '',
    'Physical plausibility overrides aesthetics.',
    'No stylized beverage advertising behavior.',
    'If physical coherence between bottle, glass, closure and carbonation is not visually consistent, the result is incorrect.',
  ].filter(Boolean).join(' ');
}

