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

  // PHASE 3: Liquid transfer physics
  let liquidTransferBlock = '';
  if (normalizedGlassFill === 'none') {
    liquidTransferBlock =
      'LIQUID_TRANSFER_PHYSICS: Bottle fill level consistent with sealed state. No liquid transferred. Factory-full appearance preserved.';
  } else {
    liquidTransferBlock =
      'LIQUID_TRANSFER_PHYSICS: Glass filled to declared level. Bottle level visibly reduced proportionally. Reduction physically consistent with transfer. Bottle not factory-full.';
  }

  // PHASE 4: Bottle state enforcement
  let bottleStateBlock = '';
  if (normalizedBottleState === 'open') {
    bottleStateBlock =
      'BOTTLE_STATE: Bottle is open. No closure attached to bottle neck.';
  } else {
    bottleStateBlock =
      'BOTTLE_STATE: Bottle sealed. Closure correctly attached.';
  }

  // PHASE 5: Closure block (hard lock)
  const closureBlock =
    `CLOSURE_GEOMETRY: closureType=${normalizedClosure}. Preserve exact selected closure type. Do not substitute with any other closure design.`;

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
    'WINE_ENGINE: deterministic.',
    [
      'WINE_PROFILE:',
      `wineType=${normalizedWineType};`,
      `closureType=${normalizedClosure};`,
      `bottleState=${normalizedBottleState};`,
      `glassFillLevel=${normalizedGlassFill};`,
      `carbonationLevel=${normalizedCarbonation};`,
    ].join(' '),
    [
      'COLOR_ACCURACY:',
      'Exact liquid color match. No hue or chroma shift.',
    ].join(' '),
    // Insert bottle state block before geometry
    bottleStateBlock,
    [
      'GEOMETRY_INTEGRITY:',
      'Exact bottle proportions.',
      'Closure scale preserved.',
      'Label alignment preserved.',
      'No warping.',
    ].join(' '),
    liquidTransferBlock,
    carbonationBlock,
    closureBlock,
  ].filter(Boolean).join(' ');
}
