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
      return `WINE_GLASS: ${descriptor} filled with wine to approximately 1/3 height appears within a restrained editorial tabletop arrangement. Minimal wine-appropriate tabletop context may appear, and the bottle may be foregrounded or integrated naturally into the composition.`;
    case 'Winery Scene':
      return `WINE_GLASS: ${descriptor} filled with wine to approximately 1/3 height may appear near the bottle within an authentic cellar or tasting-room service context. Keep the environment real, tactile, and photographically believable.`;
    case 'Rose Tasting Table':
      return `WINE_GLASS: ${descriptor} filled with wine to approximately 1/3 height appears within a bright tasting-table setup. Fresh tasting accents and refined tabletop cues may appear, with the bottle reading as premium but not rigidly isolated from the scene.`;
    case 'Social Table Served':
      return `WINE_GLASS: ${descriptor} filled with wine to approximately 1/3 height appears within a believable shared-table service scene. One or more glasses, restrained food cues, and real hospitality context may appear. The bottle may be primary, secondary, upright, or naturally resting within the table composition as long as the label fidelity is preserved when visible.`;
    case 'Outdoor Toast':
      return `WINE_GLASS: ${descriptor} filled with wine to approximately 1/3 height appears within a real outdoor toast setup. One or more glasses, raised-toast context, and relaxed garden or terrace hospitality cues may appear. The glasses may take the foreground while the bottle supports the moment from the table or background.`;
    case 'Dinner Pairing':
      return `WINE_GLASS: ${descriptor} filled with wine to approximately 1/3 height appears within a real dining setup. One or two credible plated-food cues and tactile table materials may appear. The bottle can stand, rest, or sit slightly secondary within the editorial food-and-table composition.`;
    case 'Picnic Gathering':
      return `WINE_GLASS: ${descriptor} filled with wine to approximately 1/3 height appears within a relaxed picnic service scene. Simple serveware, bread, fruit, board, blanket, or low-table cues may appear. The bottle may be upright on the spread, casually angled on the table, or integrated as one element of the shared picnic scene.`;
    case 'Celebration Chill':
      return `WINE_GLASS: ${descriptor} filled with wine to approximately 1/3 height appears within a fresh premium hospitality setup. Keep the glassware clean and dry-looking, with no visible condensation beads, water puddles, stray ice, or soaked table surfaces. The bottle should feel naturally present within the service ritual rather than isolated as a packshot.`;
    default:
      return `WINE_GLASS: ${descriptor} filled with wine to approximately 1/3 height is placed next to the bottle. The glass must be clearly visible in the frame.`;
  }
}

function resolveServedBottleOrientation(state: StudioUIState): string {
  const photoMode = resolveWinePhotoMode(state);

  switch (photoMode) {
    case 'Social Table Served':
      return 'BOTTLE_ORIENTATION: Bottle stands upright on the table or rests only if a clear physical support makes that placement obvious. No diagonal lay styling. No unsupported lean. No levitation. No impossible balancing.';
    case 'Outdoor Toast':
      return 'BOTTLE_ORIENTATION: Bottle may stand on the table, sit slightly behind the foreground glasses, or appear partially cropped as a supporting element within the toast scene. Keep placement real and stable. No levitation. No impossible angle.';
    case 'Dinner Pairing':
      return 'BOTTLE_ORIENTATION: Bottle stands upright beside the place setting or sits naturally within the dining composition with obvious surface support. No decorative lay angle. Placement must feel gravity-coherent and restaurant-real.';
    case 'Picnic Gathering':
      return 'BOTTLE_ORIENTATION: Bottle stands upright on the picnic spread or leans only against a clear real support. No random diagonal bottle placement. The bottle must never float or balance unnaturally.';
    case 'Celebration Chill':
      return 'BOTTLE_ORIENTATION: Bottle may stand upright in fresh table service or rest naturally within the hospitality composition. Keep the support logic obvious and physically real. Do not place the bottle in melting ice, inside a bucket, or in visibly wet service props unless explicitly requested.';
    case 'Editorial Table':
    case 'Rose Tasting Table':
      return 'BOTTLE_ORIENTATION: Bottle may stand upright or rest at a subtle believable editorial angle on the surface if the still-life composition benefits from it. No floating object behavior. No impossible tilt.';
    case 'Winery Scene':
      return 'BOTTLE_ORIENTATION: Bottle may stand upright on a barrel, tasting table, or cellar surface, or rest at a believable low editorial angle within the winery composition. Keep the placement physically supported and photographically real.';
    default:
      return 'BOTTLE_ORIENTATION: Bottle stands perfectly upright. No tilt. No lean. No diagonal. The vertical axis is perpendicular to the ground plane. Camera angle does not imply bottle angle.';
  }
}

function buildWineHumanRealismLock(state: StudioUIState, serveState: ServeState): string {
  const photoMode = resolveWinePhotoMode(state);

  if (serveState === 'none') return '';

  const lifestyleHumanModes = new Set([
    'Bottle + Glass Pour',
    'Social Table Served',
    'Outdoor Toast',
    'Hosting Pour',
    'Dinner Pairing',
    'Picnic Gathering',
    'Celebration Chill',
    'Hands Pouring Wine',
    'Bottle In Hand Cutout',
  ]);

  if (!lifestyleHumanModes.has(photoMode)) return '';

  const handLedModes = new Set([
    'Bottle + Glass Pour',
    'Hosting Pour',
    'Hands Pouring Wine',
    'Bottle In Hand Cutout',
    'Outdoor Toast',
  ]);

  const parts = [
    'ULTRA_REAL_HUMAN_REALISM_LOCK: Any visible human presence must read as real photographed anatomy, never CGI, never mannequin-like, never beauty-rendered.',
    'Skin must preserve natural pore texture, fine lines, knuckle folds, nail beds, and believable tonal variation. No waxy skin. No plastic skin. No rubber fingers. No synthetic smoothing.',
    'ANATOMY_LOCK: Exactly five fingers per visible hand, believable thumb placement, natural finger taper, realistic joint spacing, and physically coherent wrist angles.',
    'CONTACT_LOCK: When hands touch the bottle or glass, show believable grip pressure, subtle skin compression, and correct contact shadows. NEGATIVE_HUMAN_RENDERING: No extra fingers. No fused fingers. No broken wrists. No duplicated limbs. No floating hands. No CGI guest rendering.',
    'BACKGROUND_HUMAN_REALISM: Any cropped guest, arm, torso fragment, shoulder, hand, or softly visible background face must read as optically photographed human presence with natural asymmetry, believable skin transitions, real pore texture, and unretouched hospitality realism. No showroom-perfect background people.',
    'FACE_SECONDARY_REALISM: If faces appear in wine lifestyle scenes, they must remain secondary, softly defocused, partially cropped, or clearly behind the action. Preserve natural eyelid shape, lip texture, skin grain, visible pore texture, subtle asymmetry, and real adult facial structure. No doll-face smoothness. No porcelain skin. No AI beauty-filter look. No airbrushed beauty-campaign skin. No glossy synthetic eyes. No mannequin facial rendering.',
  ];

  if (handLedModes.has(photoMode)) {
    parts.push('HAND_FOCUS_REALISM: A visible cropped hand or forearm must physically support the bottle. Hands must look optically captured with true skin texture, natural asymmetry, and commercial-photo realism rather than synthetic hero-hand illustration. No invisible support. No floating bottle.');
  }

  return parts.join(' ');
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
          : 'The bottle remains visibly below retail-full level, reading approximately half full or meaningfully served down. It must not read as nearly full.',
        'CLOSURE_RULE: Exactly ONE removed closure exists in the scene — it rests on the surface (beside or near the bottle base). The closure is NOT attached to the bottle neck. There is NO closure on the bottle neck. There is NO duplicate closure. Do NOT show a capped or sealed bottle neck.',
        bottleFillState === 'just-opened'
          ? 'Do NOT reseal the bottle. Do NOT show a fully retail-full bottle. The fill should read as freshly opened service with only minimal depletion.'
          : 'Do NOT reseal the bottle. Do NOT return the liquid to retail-full level. Do NOT let the bottle read as just-opened or nearly full.',
        'Do NOT deform, warp, or stretch the bottle silhouette or proportions.',
        'GEOMETRY_LOCK: Preserve exact bottle height-to-width ratio, shoulder curvature, neck length, and base width from the reference.',
        isPourAction
          ? 'BOTTLE_ORIENTATION: Bottle is physically supported by a visible cropped hand or forearm and held at a believable serving angle for active wine service. The support must be visible in frame. No invisible off-frame hold. The bottle must not appear to levitate. The punt/base stays lower than the shoulder line and the whole bottle rotates as a single rigid object from a natural wrist or hand position. The mouth sits slightly above the receiving glass rim with the neck angled downward just enough for a controlled pour. The pour stream exits from the true bottle mouth only.'
          : resolveServedBottleOrientation(state),
      ].join(' ')
    : [
        'BOTTLE_PRESERVATION_LOCK: The wine bottle must appear exactly as in the reference image.',
        'The bottle is sealed and closed. The closure is fully attached to the bottle neck.',
        'The bottle is filled to retail-full level.',
        'CLOSURE_RULE: No detached closure appears anywhere in the scene. No spare cork or cap on the table. No duplicate closure.',
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
    'Treat the label as a fixed photographic surface, not a generative element.',
    'Do NOT regenerate, rewrite, translate, paraphrase, invent, replace, omit, or reposition any label text or graphics.',
    'Typography, spacing, alignment, color, and printed artwork must remain pixel-identical to the reference image.',
    'If full-fidelity reproduction is not achievable, preserve the reference label region unchanged.',
    serveState !== 'none'
      ? 'LABEL_GEOMETRY_LOCK: Preserve the label as a rigid printed surface attached to the bottle. Natural cylindrical perspective, lens compression, and real bottle rotation are allowed. Do NOT bend, shear, melt, stretch, ripple, split, redraw, or semantically recompose the label. No abnormal warp beyond real bottle curvature and camera perspective.'
      : 'LABEL_GEOMETRY_LOCK: Keep the label flat, undistorted, and non-warped. No barrel distortion, geometric remapping, melted typography, or synthetic label deformation.',
  ].join(' ');

  // GLASS — only for served mode
  const glassBlock = serveState !== 'none'
    ? isPourAction
      ? `WINE_GLASS: ${resolveWineGlassDescriptor(state)} stands upright directly beneath or just beside the bottle mouth as the receiving glass for the pour. The glass is partially filled and remains clearly visible in frame. The stream must land inside the glass opening, never beside it.`
      : buildServedWineGlassBlock(state)
    : 'NO_GLASS: No wine glass in the scene. No poured liquid. No extra props.';
  const humanRealismLock = buildWineHumanRealismLock(state, serveState);

  const sparklingLock = buildSparklingPhysicsLockV3(isSparkling, carbonationLevel);

  // labelLock appears twice: once after bottlePreservationBlock (early weight) and once
  // at the end (recency bias) — sandwiching the glass/sparkling content.
  // LABEL_FINAL_ANCHOR uses imperative restatement, not prose description of label content.
  const labelRepeat = [
    'LABEL_FINAL_ANCHOR:',
    'All visible bottle text must match the reference image exactly. No new, altered, invented, or removed text.',
    serveState !== 'none'
      ? 'If the bottle is tilted for service, preserve only real cylindrical label perspective. Text and artwork must remain intact and rigid on the bottle surface.'
      : 'Keep the label rigid, front-faithful, and undeformed.',
  ].join(' ');

  return [engineStatusBlock, configBlock, bottlePreservationBlock, labelLock, glassBlock, humanRealismLock, sparklingLock, labelRepeat].filter(Boolean).join(' ');
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
