import type { StudioUIState } from './types/studioTypes.ts';
import type { ResolvedWineConfig } from './wineConfigResolver.ts';

export function buildWineTruthLayerV4(
  state: StudioUIState,
  config: ResolvedWineConfig
): string {
  // PHASE 1: Debug trace
  const wineType = String(state.wineType || 'auto').trim();
  const closureType = String(config.closureType || 'from-reference').trim();
  const bottleState = String(config.bottleState || 'open').trim();
  const glassFillLevel = String(config.glassFillLevel || 'none').trim();
  const carbonationLevel = String(state.carbonationLevel || 'none').trim();
  console.log('WINE_V4_INPUT_STATE', {
    wineType,
    bottleState,
    glassFillLevel,
    closureType,
    carbonationLevel
  });

  // PHASE 2: Normalization
  let normalizedGlassFill =
    typeof glassFillLevel === 'string'
      ? glassFillLevel.trim().toLowerCase()
      : 'none';

  let normalizedBottleState =
    typeof bottleState === 'string'
      ? bottleState.trim().toLowerCase()
      : 'sealed';

  let normalizedWineType =
    typeof wineType === 'string'
      ? wineType.trim().toLowerCase()
      : 'still';

  let normalizedCarbonation =
    typeof carbonationLevel === 'string'
      ? carbonationLevel.trim().toLowerCase()
      : 'none';

  let normalizedClosure =
    typeof closureType === 'string'
      ? closureType.trim().toLowerCase()
      : 'from-reference';

  // PHASE 4: Auto-open bottle if glass has liquid
  if (normalizedGlassFill !== 'none') {
    normalizedBottleState = 'open';
  }

  // PHASE 3: Minimal volume and closure locks
  const volumeLock = `VOLUME_LOCK: Glass contains liquid. Bottle liquid level must be visibly lower than unopened reference. Bottle must not appear near full. Clear visible reduction required. If bottle appears full, result is incorrect.`;
  const closureLock = `CLOSURE_LOCK: Bottle is open. No cap attached to bottle. Exactly one detached crown-cap visible on surface. No duplicate caps. If bottle appears closed, result is incorrect.`;

  // PHASE 6: Carbonation strict logic
  if (normalizedWineType === 'still') {
    normalizedCarbonation = 'none';
  }
  let carbonationBlock = '';
  if (normalizedCarbonation === 'subtle') {
    carbonationBlock =
      'CARBONATION_BEHAVIOR: Extremely subtle micro-bubbles contained within liquid only. No foam head. No spray. No overflow.';
  } else if (normalizedCarbonation === 'visible') {
    carbonationBlock =
      'CARBONATION_BEHAVIOR: Clearly visible fine bubbles inside liquid only. No spray. No foam overflow.';
  }

  // Prompt assembly (order preserved)
  return [
    'WINE_ENGINE_STATUS: active. deterministic.',
    [
      'WINE_CONFIG_RESOLVED:',
      `wineType=${normalizedWineType};`,
      `closureType=${normalizedClosure};`,
      `bottleState=${normalizedBottleState};`,
      `glassFillLevel=${normalizedGlassFill};`,
      `carbonationLevel=${normalizedCarbonation};`,
    ].join(' '),
    volumeLock,
    closureLock,
    [
      'COLOR_LOCK:',
      'Liquid color must match reference exactly. No hue shift. No reinterpretation. No brightness drift. No environmental tint. Glass refraction must not shift chroma.',
    ].join(' '),
    [
      'GEOMETRY_LOCK:',
      'Preserve exact bottle proportions. Preserve closure scale. Preserve label integrity. No warping. No stretching. Bottle perfectly vertical. Zero roll. No tilt. Stable upright orientation.',
    ].join(' '),
    carbonationBlock,
  ].filter(Boolean).join(' ');
}
