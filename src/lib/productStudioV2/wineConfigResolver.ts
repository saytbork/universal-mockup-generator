import type { StudioUIState } from './types/studioTypes.ts';

export type ServeState = 'none' | 'served' | 'pouring';
export type BottleFillState = 'retail-full' | 'just-opened' | 'clearly-partially-consumed';

export type ResolvedWineConfig = {
  closureType: string;
  bottleState: 'sealed' | 'open';
  serveState?: ServeState;
  bottleFillState?: BottleFillState;
};

function resolveWinePhotoMode(state: StudioUIState): string {
  return String(state.photoMode || '').trim();
}

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

function buildServedWineGlassBlock(state: StudioUIState): string {
  const descriptor = resolveWineGlassDescriptor(state);
  const photoMode = resolveWinePhotoMode(state);

  switch (photoMode) {
    case 'Bottle + Glass':
      return `WINE_GLASS: ${descriptor} filled with wine to approximately 1/3 height is placed beside the bottle as a clean served presentation. The glass must be clearly visible in the frame. No pour-in-progress.`;
    case 'Editorial Table':
      return `WINE_GLASS: ${descriptor} filled with wine to approximately 1/3 height appears within a restrained editorial tabletop arrangement. Minimal wine-appropriate tabletop context may appear, but the bottle remains the hero subject.`;
    case 'Winery Scene':
      return `WINE_GLASS: ${descriptor} filled with wine to approximately 1/3 height may appear near the bottle within an authentic cellar or tasting-room service context. Keep the environment real and secondary to bottle fidelity.`;
    case 'Rose Tasting Table':
      return `WINE_GLASS: ${descriptor} filled with wine to approximately 1/3 height appears within a bright tasting-table setup. Fresh tasting accents and refined tabletop cues may appear, but the bottle remains commercially dominant.`;
    case 'Social Table Served':
      return `WINE_GLASS: ${descriptor} filled with wine to approximately 1/3 height appears within a believable shared-table service scene. One or more glasses, restrained food cues, and real hospitality context may appear, but the bottle remains the readable hero subject.`;
    case 'Outdoor Toast':
      return `WINE_GLASS: ${descriptor} filled with wine to approximately 1/3 height appears within a real outdoor toast setup. One or more glasses, raised-toast context, and relaxed garden or terrace hospitality cues may appear, while the bottle remains visible and premium.`;
    case 'Dinner Pairing':
      return `WINE_GLASS: ${descriptor} filled with wine to approximately 1/3 height appears within a real dining setup. One or two credible plated-food cues and tactile table materials may appear, but the bottle remains legible and product-first.`;
    case 'Picnic Gathering':
      return `WINE_GLASS: ${descriptor} filled with wine to approximately 1/3 height appears within a relaxed picnic service scene. Simple serveware, bread, fruit, board, blanket, or low-table cues may appear, but the bottle remains clearly readable.`;
    case 'Celebration Chill':
      return `WINE_GLASS: ${descriptor} filled with wine to approximately 1/3 height appears within a chilled hospitality setup. Restrained cold-service cues such as an ice bucket, chilled sleeve, or cool tabletop service may appear, while the bottle remains the premium focal point.`;
    default:
      return `WINE_GLASS: ${descriptor} filled with wine to approximately 1/3 height is placed next to the bottle. The glass must be clearly visible in the frame.`;
  }
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
 *
 * POURING (serveState=pouring):
 *   Bottle is opened and actively pouring into the receiving glass.
 *   The bottle must read as naturally supported, never levitating.
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
    : String((state as unknown as Record<string, unknown>).wineAction || '').trim() === 'controlled-pour'
      ? 'pouring'
      : (typeof (config as any).glassFillLevel !== 'undefined' && (config as any).glassFillLevel !== 'none')
        ? 'served'
        : 'none';

  const isSparkling =
    wineType === 'sparkling-white' ||
    wineType === 'sparkling-rosé' ||
    wineType === 'sparkling-rose';
  const bottleFillState = (config as any).bottleFillState === 'just-opened'
    ? 'just-opened'
    : (config as any).bottleFillState === 'retail-full'
      ? 'retail-full'
      : 'clearly-partially-consumed';

  const engineStatusBlock = 'WINE_ENGINE_STATUS: active. deterministic.';
  const resolvedBottleState = serveState === 'none' ? 'sealed' : 'open';
  const configBlock = `WINE_CONFIG_RESOLVED: wineType=${wineType}; closureType=${closureType}; bottleState=${resolvedBottleState}; serveState=${serveState}; carbonationLevel=${carbonationLevel};`;

  // BOTTLE PRESERVATION — geometry and label remain locked, while service state may change opening/fill level.
  // For pour modes (wineAction='controlled-pour'), the bottle is physically tilted by design.
  // For all other served modes (Bottle+Glass, Editorial Table, Winery Scene, etc.), the bottle
  // must remain perfectly upright — no "unless" ambiguity.
  const isPourAction =
    serveState === 'pouring' ||
    String((state as unknown as Record<string, unknown>).wineAction || '').trim() === 'controlled-pour';
  const bottlePreservationBlock = serveState !== 'none'
    ? [
        'BOTTLE_PRESERVATION_LOCK: The wine bottle must appear exactly as in the reference image.',
        'The bottle is opened for service.',
        bottleFillState === 'just-opened'
          ? 'The bottle remains near retail-full level with only a subtle reduction from first service. It should read as freshly opened, not substantially depleted.'
          : 'The bottle remains visibly below retail-full level because wine has been poured into the glass.',
        'CLOSURE_RULE: Exactly ONE removed closure exists in the scene — it rests on the surface (beside or near the bottle base). The closure is NOT attached to the bottle neck. There is NO closure on the bottle neck. There is NO duplicate closure. Do NOT show a capped or sealed bottle neck.',
        bottleFillState === 'just-opened'
          ? 'Do NOT reseal the bottle. Do NOT show a fully retail-full bottle. The fill should read as freshly opened service with only minimal depletion.'
          : 'Do NOT reseal the bottle. Do NOT return the liquid to retail-full level.',
        'Do NOT deform, warp, or stretch the bottle silhouette or proportions.',
        'GEOMETRY_LOCK: Preserve exact bottle height-to-width ratio, shoulder curvature, neck length, and base width from the reference.',
        isPourAction
          ? 'BOTTLE_ORIENTATION: Bottle is supported from off-frame or by a cropped hand and held at a believable serving angle for active wine service. The bottle must not appear to levitate. The punt/base stays lower than the shoulder line and the whole bottle rotates as a single rigid object from a natural wrist or hand position. The mouth sits slightly above the receiving glass rim with the neck angled downward just enough for a controlled pour. The pour stream exits from the true bottle mouth only.'
          : 'BOTTLE_ORIENTATION: Bottle stands perfectly upright. No tilt. No lean. No diagonal. The vertical axis is perpendicular to the ground plane. Camera angle does not imply bottle angle.',
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
    'LABEL_GEOMETRY_LOCK: The label surface must remain flat, undistorted, and non-warped regardless of bottle orientation or tilt angle. Do NOT apply perspective warp, barrel distortion, or any geometric deformation to the label area. The label panel reads as a flat rectangle on the bottle surface in all orientations.',
    'The label is the highest-priority locked region in the image.',
  ].join(' ');

  // GLASS — only for served mode
  const glassBlock = serveState !== 'none'
    ? isPourAction
      ? `WINE_GLASS: ${resolveWineGlassDescriptor(state)} stands upright directly beneath or just beside the bottle mouth as the receiving glass for the pour. The glass is partially filled and remains clearly visible in frame. The stream must land inside the glass opening, never beside it.`
      : buildServedWineGlassBlock(state)
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
