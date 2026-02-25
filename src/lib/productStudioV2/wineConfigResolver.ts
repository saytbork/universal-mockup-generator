import type { StudioUIState } from './types/studioTypes.ts';

export type WineGlassFillLevel = 'none' | 'quarter' | 'half' | 'three-quarters';

export type ResolvedWineConfig = {
  closureType: string;
  bottleState: 'sealed' | 'open';
  glassFillLevel: WineGlassFillLevel;
};

export function buildWineTruthLayer(
  state: StudioUIState,
  config: ResolvedWineConfig
): string {
  const wineType = String(state.wineType || 'auto').trim();
  const closureType = String(config.closureType || 'from-reference').trim();
  const carbonationLevel = String(state.carbonationLevel || 'none').trim();
  const fillLevel = config.glassFillLevel;
  const bottleState = config.bottleState;

  const isSparkling =
    wineType === 'sparkling-white' ||
    wineType === 'sparkling-rosé' ||
    wineType === 'sparkling-rose';
  const emittedCarbonationLevel =
    wineType === 'sparkling-white' && carbonationLevel === 'high'
      ? 'natural'
      : carbonationLevel;

  const crownCapLock = buildCrownCapRemovalLockV3(closureType, bottleState);
  const volumeLock = buildServeVolumeConservationLockV3(bottleState, fillLevel);
  const sparklingLock = buildSparklingPhysicsLockV3(isSparkling, carbonationLevel);
  const structuralLock = buildWineStructuralLockV3(Boolean(volumeLock), Boolean(sparklingLock), Boolean(crownCapLock));

  return [
    'WINE_ENGINE_STATUS: active. deterministic.',
    `WINE_CONFIG_RESOLVED: wineType=${wineType}; closureType=${closureType}; bottleState=${bottleState}; glassFillLevel=${fillLevel}; carbonationLevel=${emittedCarbonationLevel};`,
    'WINE_COLOR_LOCK: Liquid color must match reference exactly. No hue shift. No reinterpretation. No brightness drift. No environmental tint. Glass refraction must not shift chroma.',
    volumeLock,
    sparklingLock,
    crownCapLock,
    structuralLock,
    'GEOMETRY_LOCK: Preserve exact bottle proportions. Preserve closure scale. Preserve label integrity. No warping. No stretching.',
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
    'Detached cap must show crimp deformation consistent with pry removal.',
    'No partial ring artifacts.',
    'No duplicate closure.',
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
  fillLevel: WineGlassFillLevel
): string {
  if (!(bottleState === 'open' && fillLevel === 'half')) return '';
  return [
    'SERVE_VOLUME_CONSERVATION_LOCK_V3:',
    'When bottleState=open AND glassFillLevel=half:',
  'Glass contains approximately 150ml equivalent.',
  'Bottle liquid level must decrease by at least 15% of total bottle height when glassFillLevel=half.',
    'Bottle must show visible measurable reduction.',
    'Liquid level must drop below retail reference height by realistic fraction.',
    'Bottle cannot appear near factory-full.',
    'Volume change must be physically coherent.',
    'No symbolic reduction.',
    'If glass contains liquid and bottle appears almost full, result is invalid.',
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
