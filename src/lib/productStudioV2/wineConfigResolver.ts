import type { StudioUIState } from './types/studioTypes.ts';

export type ServeState = 'none' | 'served';
export type BottleFillState = 'retail-full' | 'clearly-partially-consumed';

export type ResolvedWineConfig = {
  closureType: string;
  bottleState: 'sealed' | 'open';
  serveState?: ServeState;
  bottleFillState?: BottleFillState;
};

function resolveWineGlassDescriptor(state: StudioUIState): string {
  const requested = String((state as any).wineGlassType || 'auto').trim().toLowerCase();
  const wineType = String(state.wineType || 'auto').trim().toLowerCase();
  const closureType = String(state.wineClosureType || '').trim().toLowerCase();
  const isSparkling =
    wineType === 'sparkling-white' ||
    wineType === 'sparkling-rosé' ||
    wineType === 'sparkling-rose' ||
    closureType === 'cork-with-cage';

  if (requested === 'red-bowl') return 'a wide-bowl red wine glass';
  if (requested === 'white-stem') return 'a taller narrow white wine glass';
  if (requested === 'sparkling-flute') return 'a slender sparkling flute';
  if (isSparkling) return 'a slender sparkling flute';
  if (wineType === 'white' || wineType === 'rosé' || wineType === 'rose') {
    return 'a taller narrow white-wine style glass';
  }
  return 'a classic wine glass appropriate to the varietal';
}

/**
 * WINE TRUTH LAYER — simplified model
 *
 * CLOSED (serveState=none):
 *   Bottle sealed, retail-full, exactly as reference. No glass, no detached closure.
 *
 * SERVED (serveState=served):
 *   Bottle is opened for service and visibly below retail-full level.
 *   A wine glass filled with wine appears next to the bottle.
 *   The removed closure may appear on the surface when appropriate.
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
  const resolvedBottleState = serveState === 'served' ? 'open' : 'sealed';
  const configBlock = `WINE_CONFIG_RESOLVED: wineType=${wineType}; closureType=${closureType}; bottleState=${resolvedBottleState}; serveState=${serveState}; carbonationLevel=${carbonationLevel};`;

  // BOTTLE PRESERVATION — geometry and label remain locked, while service state may change opening/fill level.
  const bottlePreservationBlock = serveState === 'served'
    ? [
        'BOTTLE_PRESERVATION_LOCK: The wine bottle must appear exactly as in the reference image.',
        'The bottle is opened for service.',
        'The bottle remains visibly below retail-full level because wine has been poured into the glass.',
        'A removed closure or cork may rest on the surface when appropriate to the closure type.',
        'Do NOT reseal the bottle. Do NOT return the liquid to retail-full level.',
        'Do NOT deform, warp, or stretch the bottle silhouette or proportions.',
        'GEOMETRY_LOCK: Preserve exact bottle height-to-width ratio, shoulder curvature, neck length, and base width from the reference.',
        'BOTTLE_ORIENTATION: Bottle stands perfectly upright unless an explicit pour action is active.',
      ].join(' ')
    : [
        'BOTTLE_PRESERVATION_LOCK: The wine bottle must appear exactly as in the reference image.',
        'The bottle is sealed and closed. The closure is fully attached to the bottle neck.',
        'The bottle is filled to retail-full level.',
        'Do NOT open the bottle. Do NOT remove or detach the closure.',
        'Do NOT alter the liquid level. Do NOT add a half-empty appearance.',
        'Do NOT deform, warp, or stretch the bottle silhouette or proportions.',
        'GEOMETRY_LOCK: Preserve exact bottle height-to-width ratio, shoulder curvature, neck length, and base width from the reference.',
        'BOTTLE_ORIENTATION: Bottle stands perfectly upright. No tilt.',
      ].join(' ');

  // LABEL LOCK — separate block, placed independently for maximum model weight.
  // Gemini tends to re-generate or hallucinate label text when scene/environment changes.
  // Explicit text-level prohibition is required.
  // RULE: Label content must NEVER be described in prose anywhere else in the prompt.
  // The label is a photographic asset — not a generative element.
  const labelLock = [
    'LABEL_PRESERVATION_LOCK: The bottle label region must be preserved exactly as in the reference image.',
    'The label must NOT be regenerated, redrawn, reinterpreted, or approximated.',
    'Treat the label as a fixed photographic surface — not a generative element.',
    'Every word, letter, number, logo, graphic element, typographic style, spacing, alignment, color, and font must be PIXEL-IDENTICAL to the reference image.',
    'Do NOT rewrite, translate, paraphrase, or invent any text on the label.',
    'Do NOT change font, size, weight, spacing, color, or position of any label element.',
    'Do NOT replace, invent, or omit the brand name, product name, varietal, vintage year, or any other text.',
    'Do NOT derive label content from wineType, closureType, or any other state variable.',
    'If reproduction of label text is not achievable at full fidelity, preserve the reference image label region without any modification.',
    'The label is the highest-priority locked region in the image.',
  ].join(' ');

  // GLASS — only for served mode
  const glassBlock = serveState === 'served'
    ? `WINE_GLASS: ${resolveWineGlassDescriptor(state)} filled with wine to approximately 1/3 height is placed next to the bottle. The glass must be clearly visible in the frame. This is the only addition to the scene — everything else matches the reference exactly.`
    : 'NO_GLASS: No wine glass in the scene. No poured liquid. No extra props.';

  const sparklingLock = buildSparklingPhysicsLockV3(isSparkling, carbonationLevel);

  // labelLock appears twice: once after bottlePreservationBlock (early weight) and once
  // at the end (recency bias) — sandwiching the glass/sparkling content.
  // LABEL_FINAL_ANCHOR uses imperative restatement, not prose description of label content.
  const labelRepeat = [
    'LABEL_FINAL_ANCHOR:',
    'All text on the bottle — brand name, product name, varietal, vintage, and every other typographic element — must match the reference image exactly.',
    'No new text. No altered text. No invented text. No removed text.',
    'The label is a locked photographic region. Treat it as immutable.',
  ].join(' ');

  return [engineStatusBlock, configBlock, bottlePreservationBlock, labelLock, glassBlock, sparklingLock, labelRepeat].filter(Boolean).join(' ');
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
