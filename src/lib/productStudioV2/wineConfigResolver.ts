import type { StudioUIState } from './types/studioTypes.ts';

export type ServeState = 'none' | 'served';
export type BottleFillState = 'retail-full' | 'clearly-partially-consumed';

export type ResolvedWineConfig = {
  closureType: string;
  bottleState: 'sealed' | 'open';
  // New binary serve state (preferred)
  serveState?: ServeState;
  // Derived visual bottle fill state (preferred)
  bottleFillState?: BottleFillState;
};

export function buildWineTruthLayer(
  state: StudioUIState,
  config: ResolvedWineConfig
): string {
  const wineType = String(state.wineType || 'auto').trim();
  const closureType = String(config.closureType || 'from-reference').trim();
  const carbonationLevel = String(state.carbonationLevel || 'none').trim();
  // Backwards-compat: support old "glassFillLevel" if present by deriving serveState.
  const bottleState = config.bottleState;
  const serveState: ServeState = (config as any).serveState
    ? (config as any).serveState
    : (typeof (config as any).glassFillLevel !== 'undefined' && (config as any).glassFillLevel !== 'none')
    ? 'served'
    : 'none';

  // Deterministic derived bottle visual state per architecture rules
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
    wineType === 'sparkling-white' && carbonationLevel === 'high'
      ? 'natural'
      : carbonationLevel;

  const closureLock = buildClosureLockStrictV1(closureType, bottleState);
  const volumeLock = buildServeVolumeConservationLockV3(bottleState, serveState, bottleFillState);
  const sparklingLock = buildSparklingPhysicsLockV3(isSparkling, carbonationLevel);
  const structuralLock = buildWineStructuralLockV3(Boolean(volumeLock), Boolean(sparklingLock), Boolean(closureLock));

  const engineStatusBlock = 'WINE_ENGINE_STATUS: active. deterministic.';
  const configBlock = `WINE_CONFIG_RESOLVED: wineType=${wineType}; closureType=${closureType}; bottleState=${bottleState}; serveState=${serveState}; bottleFillState=${bottleFillState}; carbonationLevel=${emittedCarbonationLevel};`;
  const geometryBlock = 'GEOMETRY_LOCK: Preserve exact bottle proportions. Preserve closure scale. Preserve label integrity. No warping. No stretching.';
  const colorBlock = 'WINE_COLOR_LOCK: Liquid color must match reference exactly. No hue shift. No reinterpretation. No brightness drift. No environmental tint. Glass refraction must not shift chroma.';

  // If served, produce a minimal high-priority prompt containing ONLY the required safety blocks.
  if (serveState === 'served') {
    return [engineStatusBlock, configBlock, volumeLock, closureLock, geometryBlock, colorBlock].filter(Boolean).join(' ');
  }

  return [
    engineStatusBlock,
    configBlock,
    // Volume lock must be placed immediately after the resolved config so image models
    // prioritize physical plausibility before styling or environment is injected.
  volumeLock,
  closureLock,
    structuralLock,
    geometryBlock,
    colorBlock,
    sparklingLock,
  ].filter(Boolean).join(' ');
}

function buildClosureLockStrictV1(closureType: string, bottleState: 'sealed' | 'open'): string {
  // Centralized strict closure rules applied to all closure types.
  const parts: string[] = [];
  parts.push('CLOSURE_LOCK_STRICT_V1: Exactly one closure state allowed.');
  if (bottleState === 'open') {
    parts.push('If bottleState=open: Bottle neck must be visibly open.');
    parts.push('No cap attached.');
    parts.push('No secondary cap.');
    parts.push('No ghost cap.');
    parts.push('At most one detached cap object in scene.');
  } else {
    parts.push('If bottleState=sealed: Exactly one closure attached.');
    parts.push('No detached cap allowed.');
  }
  parts.push('Multiple closures invalidate image.');
  return parts.join(' ');
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

  // Strong visual-state driven language — no numeric percentages or ml references
  if (bottleFillState === 'clearly-partially-consumed') {
    return [
      'SERVE_VOLUME_CONSERVATION_LOCK_V3:',
      'Bottle must appear clearly partially consumed.',
      'The visible liquid line must intersect the lower half of the front label area.',
      'If the liquid level appears above the central label zone, the image is invalid.',
      'The liquid meniscus must be visibly aligned with the reduced fill state relative to the label position.',
      'Label placement must remain fixed; only the liquid level moves downward.',
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
  hasClosureLock: boolean
): string {
  const apply: string[] = [];
  if (hasVolumeLock) apply.push('SERVE_VOLUME_CONSERVATION_LOCK_V3');
  if (hasSparklingLock) apply.push('SPARKLING_PHYSICS_LOCK_V3');
  if (hasClosureLock) apply.push('CLOSURE_LOCK_STRICT_V1');

  return [
    'WINE_STRUCTURAL_LOCK_V3:',
    apply.length > 0 ? `Apply: ${apply.join(', ')}.` : '',
    'Physical plausibility overrides aesthetics.',
    'No stylized beverage advertising behavior.',
    'If physical coherence between bottle, glass, closure and carbonation is not visually consistent, the result is incorrect.',
  ].filter(Boolean).join(' ');
}
