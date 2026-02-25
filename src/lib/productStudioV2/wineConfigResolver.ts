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
  // CRITICAL: GEOMETRY_LOCK must allow liquid level changes when served
  const geometryBlock = serveState === 'served'
    ? 'GEOMETRY_LOCK: Bottle shape and label integrity preserved. Closure scale preserved. No warping. No stretching. CRITICAL: Liquid inside bottle MUST be visibly reduced to approximately half-full. A full or nearly-full bottle is INCORRECT and INVALID.'
    : 'GEOMETRY_LOCK: Preserve exact bottle proportions. Preserve closure scale. Preserve label integrity. No warping. No stretching.';
  const colorBlock = 'WINE_COLOR_LOCK: Liquid color must match reference exactly. No hue shift. No reinterpretation. No brightness drift. No environmental tint. Glass refraction must not shift chroma.';

  // If served, produce a minimal high-priority prompt containing ONLY the required safety blocks.
  if (serveState === 'served') {
    return [engineStatusBlock, configBlock, volumeLock, crownCapLock, structuralLock, geometryBlock, colorBlock, sparklingLock].filter(Boolean).join(' ');
  }

  return [
    engineStatusBlock,
    configBlock,
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

