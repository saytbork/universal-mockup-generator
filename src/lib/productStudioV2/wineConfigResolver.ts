import type { StudioUIState } from './types/studioTypes.ts';

export type ServeState = 'none' | 'served';
export type BottleFillState = 'retail-full' | 'clearly-partially-consumed';

export type ResolvedWineConfig = {
  closureType: string;
  bottleState: 'sealed' | 'open';
  serveState?: ServeState;
  bottleFillState?: BottleFillState;
};

/**
 * WINE TRUTH LAYER — simplified model
 *
 * CLOSED (serveState=none):
 *   Bottle sealed, retail-full, exactly as reference. No glass, no detached closure.
 *
 * SERVED (serveState=served):
 *   Bottle sealed and closed, exactly as reference (same as closed).
 *   A wine glass filled with wine appears next to the bottle.
 *   The bottle is NOT opened, NOT half-empty, NO detached closure.
 *   The "served" state is communicated only by the glass — never by modifying the bottle.
 */
export function buildWineTruthLayer(
  state: StudioUIState,
  config: ResolvedWineConfig
): string {
  const wineType = String(state.wineType || 'auto').trim();
  const closureType = String(config.closureType || 'from-reference').trim();
  const carbonationLevel = String(state.carbonationLevel || 'none').trim();

  const serveState: ServeState = (config as any).serveState
    ? (config as any).serveState
    : (typeof (config as any).glassFillLevel !== 'undefined' && (config as any).glassFillLevel !== 'none')
    ? 'served'
    : 'none';

  const isSparkling =
    wineType === 'sparkling-white' ||
    wineType === 'sparkling-rosé' ||
    wineType === 'sparkling-rose';

  const engineStatusBlock = 'WINE_ENGINE_STATUS: active. deterministic.';
  const configBlock = `WINE_CONFIG_RESOLVED: wineType=${wineType}; closureType=${closureType}; bottleState=sealed; serveState=${serveState}; carbonationLevel=${carbonationLevel};`;

  // BOTTLE PRESERVATION — applies to both closed and served
  const bottlePreservationBlock = [
    'BOTTLE_PRESERVATION_LOCK: The wine bottle must appear exactly as in the reference image.',
    'The bottle is sealed and closed. The closure is fully attached to the bottle neck.',
    'The bottle is filled to retail-full level.',
    'Do NOT open the bottle. Do NOT remove or detach the closure.',
    'Do NOT alter the liquid level. Do NOT add a half-empty appearance.',
    'Do NOT deform, warp, or stretch the bottle silhouette or proportions.',
    'LABEL_LOCK: The label design, text, colors, logo, and position must be identical to the reference. Do NOT fade, replace, blur, or alter the label in any way.',
    'GEOMETRY_LOCK: Preserve exact bottle height-to-width ratio, shoulder curvature, neck length, and base width from the reference.',
    'BOTTLE_ORIENTATION: Bottle stands perfectly upright. No tilt.',
  ].join(' ');

  // GLASS — only for served mode
  const glassBlock = serveState === 'served'
    ? 'WINE_GLASS: A wine glass filled with wine to approximately 1/3 height is placed next to the bottle. The glass must be clearly visible in the frame. This is the only addition to the scene — everything else matches the reference exactly.'
    : 'NO_GLASS: No wine glass in the scene. No poured liquid. No extra props.';

  const sparklingLock = buildSparklingPhysicsLockV3(isSparkling, carbonationLevel);

  return [engineStatusBlock, configBlock, bottlePreservationBlock, glassBlock, sparklingLock].filter(Boolean).join(' ');
}

function buildSparklingPhysicsLockV3(isSparkling: boolean, carbonationLevel: string): string {
  if (!isSparkling || carbonationLevel === 'none') return '';
  return [
    'SPARKLING_PHYSICS_LOCK_V3:',
    'Carbonation visibility must be extremely subtle.',
    'Bubble diameter near microscopic scale.',
    'No continuous vertical bubble columns.',
    'Maximum 3 to 5 faint isolated trails inside glass only.',
    'No champagne-density. No soda turbulence. No foam head.',
  ].join(' ');
}
