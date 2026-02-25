// Map visual bottle fill state to deterministic phrases (binary visual model)
function resolveBottleVisualLevel(_bottleFillState: string): string {
  // Intentionally neutral: VOLUME phrasing must live only inside VOLUME_LOCK
  return '';
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
  
  // Backwards-compat: accept older "glassFillLevel" if present and derive serveState
  const serveState: 'none' | 'served' = (config as any).serveState
    ? (config as any).serveState
    : (typeof (config as any).glassFillLevel !== 'undefined' && (config as any).glassFillLevel !== 'none')
    ? 'served'
    : 'none';
  
  // HARD ENFORCEMENT: if serveState='served', bottle MUST be open (override config.bottleState if needed)
  const bottleState = serveState === 'served' ? 'open' : String(config.bottleState || 'open').trim();
  
  const bottleFillState = (config as any).bottleFillState
    ? (config as any).bottleFillState
    : serveState === 'served'
    ? 'clearly-partially-consumed'
    : 'retail-full';
  const carbonationLevel = String(state.carbonationLevel || 'none').trim();
  const normalizedClosureType = closureType.toLowerCase();
  const wineColor = state.wineColor || 'red';
  const wineStyleRaw = state.wineStyle || 'still';
  const { wineStyle, sparkling } = resolveWineStyleConsistency(state);
  console.log('WINE_V4_INPUT_STATE', {
    wineType,
    bottleState,
    serveState,
    closureType,
    carbonationLevel,
    wineColor,
    wineStyle,
    sparkling
  });

  // PHASE 2: Normalization — derive deterministic visual states
  let normalizedBottleState = typeof bottleState === 'string' ? bottleState.trim().toLowerCase() : 'sealed';
  let normalizedWineType = typeof wineType === 'string' ? wineType.trim().toLowerCase() : 'still';
  let normalizedCarbonation = typeof carbonationLevel === 'string' ? carbonationLevel.trim().toLowerCase() : 'none';
  let normalizedClosure = typeof closureType === 'string' ? closureType.trim().toLowerCase() : 'from-reference';

  // If serveState indicates served we treat the bottle as open for visual purposes
  if (serveState === 'served') normalizedBottleState = 'open';

  // STEP 1: Engine header blocks
  const engineStatusBlock = 'WINE_ENGINE_STATUS: active. deterministic.';
  const configBlock = `WINE_CONFIG_RESOLVED: wineType=${wineType}; bottleState=${bottleState}; serveState=${serveState}; bottleFillState=${bottleFillState}; closureType=${closureType}; carbonationLevel=${carbonationLevel};`;

  // STEP 2: VOLUME_LOCK (visual-state driven, no numeric language)
  let volumeLockBlock = '';
  if (serveState === 'served') {
    volumeLockBlock = 'VOLUME_LOCK: Bottle must appear clearly and visibly lower than standard retail fill height. Liquid level must sit well below the upper third of the bottle. Bottle must not resemble a newly opened retail product.';
  } else {
    volumeLockBlock = 'VOLUME_LOCK: Bottle appears in standard retail-full condition.';
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
  // CRITICAL: When served, use simple natural language (Gemini recommendation)
  // Complex technical LOCKS confuse the AI - simple human language works better
  const liquidLevelBlock = serveState === 'served'
    ? 'The wine bottle is half-empty with the wine level at the middle height of the bottle.'
    : '';
  
  const geometryLock = 'GEOMETRY_LOCK: Preserve bottle proportions, closure scale, label integrity. Bottle upright.';
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

  // STEP 5: Physical description (neutral — no volume statements here)
  const physicalStateBlock = [
    'A single wine bottle.',
    serveState === 'served' ? 'Next to it, one wine glass contains served liquid.' : 'No glass served.',
    normalizedBottleState === 'open' ? 'No closure attached to the bottle. Exactly one detached closure is visible.' : 'Closure attached to bottle.'
  ].filter(Boolean).join(' ');

  // STEP 6: Snapshot stability
  const STRICT_GUARDRAILS = typeof import.meta !== 'undefined' && typeof import.meta.env !== 'undefined' && import.meta.env.VITE_STRICT_GUARDRAILS === 'true';
  const isWineV4Snapshot = !STRICT_GUARDRAILS && state.visualProfile === 'wine' && Number(state.wineEngineVersion) >= 4;
  if (isWineV4Snapshot) {
    // Minimal snapshot: order prioritizes liquid level override, volume, closure, geometry, then color
    return [
      engineStatusBlock,
      configBlock,
      liquidLevelBlock,
      volumeLockBlock,
      closureLockBlock,
      geometryLock,
      colorLock,
      physicalStateBlock
    ].filter(Boolean).join(' ');
  }
  if (STRICT_GUARDRAILS) {
    return [
      engineStatusBlock,
      configBlock,
      liquidLevelBlock,
      volumeLockBlock,
      closureLockBlock,
      geometryLock,
      colorLock,
      physicalStateBlock
    ].filter(Boolean).join(' ');
  }
  // Full engine path: same ordering, include carbonation last
  return [
    engineStatusBlock,
    configBlock,
    liquidLevelBlock,
    volumeLockBlock,
    closureLockBlock,
    geometryLock,
    colorLock,
    physicalStateBlock,
    carbonationBlock
  ].filter(Boolean).join(' ');
}
