// Visual percentage mapping helper
function resolveBottleVisualLevel(glassFillLevel: string): string {
  switch (glassFillLevel) {
    case 'quarter':
      return 'The bottle appears around 60 percent full, clearly lower than a standard retail full level.';
    case 'half':
      return 'The bottle appears clearly below half, around 45 percent full.';
    case 'three-quarters':
      return 'The bottle appears around 30 percent full.';
    default:
      return 'The bottle appears at normal retail fill level.';
  }
}
import type { StudioUIState } from './types/studioTypes.ts';
import { resolveWineStyleConsistency } from './wineHelpers/resolveWineStyleConsistency';
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
  const normalizedClosureType = closureType.toLowerCase();
  const wineColor = state.wineColor || 'red';
  const wineStyleRaw = state.wineStyle || 'still';
  const { wineStyle, sparkling } = resolveWineStyleConsistency(state);
  console.log('WINE_V4_INPUT_STATE', {
    wineType,
    bottleState,
    glassFillLevel,
    closureType,
    carbonationLevel,
    wineColor,
    wineStyle,
    sparkling
  });

  // PHASE 2: Normalization
  let normalizedGlassFill = typeof glassFillLevel === 'string' ? glassFillLevel.trim().toLowerCase() : 'none';
  let normalizedBottleState = typeof bottleState === 'string' ? bottleState.trim().toLowerCase() : 'sealed';
  let normalizedWineType = typeof wineType === 'string' ? wineType.trim().toLowerCase() : 'still';
  let normalizedCarbonation = typeof carbonationLevel === 'string' ? carbonationLevel.trim().toLowerCase() : 'none';
  let normalizedClosure = typeof closureType === 'string' ? closureType.trim().toLowerCase() : 'from-reference';
  if (normalizedGlassFill !== 'none') normalizedBottleState = 'open';

  // STEP 1: Engine header blocks
  const engineStatusBlock = 'WINE_ENGINE_STATUS: active. deterministic.';
  const configBlock = `WINE_CONFIG_RESOLVED: wineType=${wineType}; bottleState=${bottleState}; glassFillLevel=${glassFillLevel}; closureType=${closureType}; carbonationLevel=${carbonationLevel};`;

  // STEP 2: VOLUME_LOCK
  let volumeLockBlock = '';
  if (normalizedGlassFill !== 'none') {
    volumeLockBlock = 'VOLUME_LOCK: Glass contains liquid. Bottle liquid level must be visibly lower than unopened reference. Clear visible reduction required.';
  } else {
    volumeLockBlock = 'VOLUME_LOCK: No glass transfer. Bottle remains factory-full.';
  }

  // STEP 3: CLOSURE_LOCK
  let closureLockBlock = '';
  if (normalizedBottleState === 'open') {
    closureLockBlock = 'CLOSURE_LOCK: Bottle is open. No cap attached to bottle. Exactly one detached crown-cap visible on surface.';
  } else {
    closureLockBlock = 'CLOSURE_LOCK: Bottle is sealed. Closure attached. No detached closure visible.';
  }

  // PHASE 6: Carbonation strict logic (override sparkling logic)
  let carbonationBlock = '';
  if (wineStyle === 'sparkling') {
    carbonationBlock = 'CARBONATION_BEHAVIOR: Bubbles are present inside the liquid, originating from the base of the glass. No chaotic foam unless pouring.';
  } else {
    carbonationBlock = 'CARBONATION_BEHAVIOR: No carbonation, flat surface tension. Bubbles are explicitly forbidden.';
  }

  // STEP 4: Color and geometry locks
  let colorLock = '';
  switch (wineColor) {
    case 'red':
      colorLock = 'COLOR_LOCK: Liquid color is deep ruby or garnet tones.';
      break;
    case 'white':
      colorLock = 'COLOR_LOCK: Liquid color is pale straw or golden tones.';
      break;
    case 'rose':
      colorLock = 'COLOR_LOCK: Liquid color is blush or salmon tones.';
      break;
    default:
      colorLock = 'COLOR_LOCK: Liquid color matches reference.';
  }
  const geometryLock = 'GEOMETRY_LOCK: Preserve bottle proportions, closure scale, label integrity. Bottle upright.';

  // STEP 5: Physical description
  const physicalStateBlock = [
    'A single open wine bottle.',
    resolveBottleVisualLevel(normalizedGlassFill),
    `Next to it, one wine glass filled to approximately ${normalizedGlassFill}.`,
    'The liquid level in the bottle visibly reflects that wine has been poured into the glass.',
    'No closure attached to the bottle. Exactly one detached closure is visible.'
  ].join(' ');

  // STEP 6: Snapshot stability
  const STRICT_GUARDRAILS = typeof import.meta !== 'undefined' && typeof import.meta.env !== 'undefined' && import.meta.env.VITE_STRICT_GUARDRAILS === 'true';
  const isWineV4Snapshot = !STRICT_GUARDRAILS && state.visualProfile === 'wine' && Number(state.wineEngineVersion) >= 4;
  if (isWineV4Snapshot) {
    // Minimal snapshot: only required blocks, no styling, no environment, no lighting, no composition
    return [
      engineStatusBlock,
      configBlock,
      volumeLockBlock,
      closureLockBlock,
      colorLock,
      geometryLock,
      physicalStateBlock
    ].filter(Boolean).join(' ');
  }
  if (STRICT_GUARDRAILS) {
    // Minimal snapshot: only required blocks, no styling, no environment, no lighting, no composition
    return [
      engineStatusBlock,
      configBlock,
      volumeLockBlock,
      closureLockBlock,
      colorLock,
      geometryLock,
      physicalStateBlock
    ].filter(Boolean).join(' ');
  }
  // Full engine path: include styling, environment, lighting, composition as needed
  return [
    engineStatusBlock,
    configBlock,
    volumeLockBlock,
    closureLockBlock,
    colorLock,
    geometryLock,
    physicalStateBlock,
    carbonationBlock
  ].filter(Boolean).join(' ');
}
