import { applyWineDeterministicStateMachine, resolveDeterministicWineConfig, resolveWineEngineVersion, buildWineTruthLayerV4, buildWineTruthLayer, buildWineLighting, buildWorld, buildLighting, buildWineMaterials, buildWineModifiers, buildWineMinimalGuardrail, buildWineRealismCore, buildWineTextIntegrityConstraint, buildArtworkImmutability, sanitizeWineV4Prompt, dedupeWineStructuralTokens, sanitizePromptLexicalGuard, finalizePromptFromSegments, buildIntent, buildCameraOverrides, buildComposition, resolveStudioAuthority, buildPalette } from '../index';
import type { StudioUIState } from '../index';
import { assembleWineV4Prompt, resolveDefaultLuxuryTier, resolveCompositionForServeState, resolveCameraForCompositionMode, WINE_LIGHTING_RIGS, WINE_COMPOSITION_MODES, buildMicroVariationBlock } from '../../productStudio/winePrestige';
import type { WineEnvironmentV4, WineLuxuryIntensity, WineCompositionMode, WineMicroVariation } from '../../productStudio/types';
import { buildWineIndustryLayerV2 } from '../builders/buildWineIndustryLayerV2';

// For structural testing only
export function __buildSegmentsForTest(state: StudioUIState) {
  const wineEffectiveState = applyWineDeterministicStateMachine(state);
  // Ensure resolvedPalette exists before any world builder path that can call buildStudioBackground.
  buildPalette(wineEffectiveState);
  const resolvedWineConfig = resolveDeterministicWineConfig(wineEffectiveState);
  const wineEngineVersion = resolveWineEngineVersion(wineEffectiveState);
  const segments: any[] = [];
  segments.push({ type: 'guardrail', content: buildIntent(resolveStudioAuthority(wineEffectiveState), state) });
  segments.push({ type: 'guardrail', content: buildArtworkImmutability() });
  const winePhysicsBlock = wineEngineVersion >= 4
    ? buildWineTruthLayerV4(wineEffectiveState, resolvedWineConfig)
    : buildWineTruthLayer(wineEffectiveState, resolvedWineConfig);
  segments.push({ type: 'physics', content: winePhysicsBlock });
  segments.push({ type: 'guardrail', content: buildWineRealismCore() });
  segments.push({ type: 'world', content: buildWorld(resolveStudioAuthority(wineEffectiveState), wineEffectiveState.world, wineEffectiveState) });
  segments.push({ type: 'guardrail', content: buildWineMaterials(resolvedWineConfig?.serveState) });
  segments.push({ type: 'guardrail', content: buildWineMinimalGuardrail() });
  return segments;
}

export const winePipeline = {
  build(state: StudioUIState): string {
    const photoMode = String(state.photoMode || '').trim();

    // RULE 3: Bottle + Glass forces serve state = served.
    // Pre-patch the state before the deterministic machine runs so that
    // resolveServeState() sees wineGlassMode='filled' and bottleState='open'.
    // This also prevents the Closed option from being effective when this mode is active.
    const servedGlassModes = new Set([
      'Bottle + Glass',
      'Bottle + Glass Pour',
      'Hands Pouring Wine',
      'Rose Tasting Table',
      'Social Table Served',
      'Outdoor Toast',
      'Hosting Pour',
      'Dinner Pairing',
      'Picnic Gathering',
      'Celebration Chill',
    ]);
    const activePourMode =
      photoMode === 'Bottle + Glass Pour' || photoMode === 'Hands Pouring Wine' || photoMode === 'Hosting Pour';
    const stateForMachine: StudioUIState = servedGlassModes.has(photoMode)
      ? {
          ...state,
          wineServeMode: activePourMode ? 'pouring' : 'served',
          wineBottleFillMode: activePourMode ? 'partially-served' : (state.wineBottleFillMode || 'partially-served'),
          wineGlassMode: 'filled',
          wineBottleState: activePourMode ? 'open' : state.wineBottleState || 'open',
          wineAction: activePourMode ? 'controlled-pour' : state.wineAction,
        } as StudioUIState
      : state;

    const wineEffectiveState = applyWineDeterministicStateMachine(stateForMachine);
    // Ensure resolvedPalette exists before any world builder path that can call buildStudioBackground.
    buildPalette(wineEffectiveState);
    const resolvedWineConfig = resolveDeterministicWineConfig(wineEffectiveState);
    const wineEngineVersion = resolveWineEngineVersion(wineEffectiveState);

    // ── WINE MACRO LABEL — Hard override path ─────────────────────────────
    // When Photo Mode === 'Wine Macro Label', the label region is the ONLY subject.
    // No full bottle. No environment. No glass. No fallback to hero.
    // FRAME_CONSTRAINT + COMPOSITION + CAMERA are all hard-overridden here.
    if (photoMode === 'Wine Macro Label') {
      const physicsBlock = wineEngineVersion >= 4
        ? buildWineTruthLayerV4(wineEffectiveState, resolvedWineConfig)
        : buildWineTruthLayer(wineEffectiveState, resolvedWineConfig);
      const macroSegments: any[] = [
        { type: 'guardrail', content: buildIntent(resolveStudioAuthority(wineEffectiveState), state) },
        { type: 'guardrail', content: buildArtworkImmutability() },
        { type: 'physics', content: physicsBlock },
        { type: 'world', content: buildWorld(resolveStudioAuthority(wineEffectiveState), wineEffectiveState.world, wineEffectiveState) },
        {
          type: 'guardrail',
          content: [
            'PHOTO_MODE: Wine Macro Label.',
            'FRAME_CONSTRAINT: Label region only. Bottle neck excluded. Bottle base excluded. No full bottle framing allowed.',
            'COMPOSITION: Label panel centered and dominant. Fills minimum 70% of frame. No environmental expansion. No negative-space copy zone.',
            'CAMERA: 100mm macro lens simulation. f/4 aperture. Ultra-high micro contrast. No wide framing. No environment in background.',
            'NEGATIVE_SPACE_POLICY: Minimal. Label is the complete subject.',
            'LABEL_MACRO_DETAIL: Maximum label typography fidelity. Paper/foil surface texture rendered at full micro resolution. No label blur on any text element.',
            'BAN: No glass addition. No full bottle render. No gradient background injection. No clinical-softbox bloom. No environment expansion. No hero mode fallback.',
            'PHYSICAL_REALISM: True macro optical behavior. Natural surface micro-texture. Controlled specular highlights on label material.',
          ].join(' '),
        },
        { type: 'guardrail', content: buildWineMinimalGuardrail() },
        // TEXT_INTEGRITY_CONSTRAINT is mandatory on all wine paths
        { type: 'guardrail', content: buildWineTextIntegrityConstraint() },
      ];
      return sanitizeWineV4Prompt(
        sanitizePromptLexicalGuard(
          dedupeWineStructuralTokens(finalizePromptFromSegments(macroSegments, resolveStudioAuthority(wineEffectiveState)))
        )
      );
    }

    // ── BOTTLE + GLASS — Served composition shortcut ──────────────────────
    // Routes to bottle-and-glass composition mode via winePipelineV4 composition logic.
    const bottleAndGlassMode = photoMode === 'Bottle + Glass';
    const bottleAndGlassPourMode = photoMode === 'Bottle + Glass Pour';
    const handsPouringMode = photoMode === 'Hands Pouring Wine';
    const lineupMode = photoMode === 'Wine Lineup Comparison';
    const editorialBottleTabletopMode = photoMode === 'Editorial Bottle Tabletop';
    const bottleInHandCutoutMode = photoMode === 'Bottle In Hand Cutout';
    const roseTastingTableMode = photoMode === 'Rose Tasting Table';
    const socialTableServedMode = photoMode === 'Social Table Served';
    const outdoorToastMode = photoMode === 'Outdoor Toast';
    const hostingPourMode = photoMode === 'Hosting Pour';
    const dinnerPairingMode = photoMode === 'Dinner Pairing';
    const picnicGatheringMode = photoMode === 'Picnic Gathering';
    const celebrationChillMode = photoMode === 'Celebration Chill';

    // ── WINERY SCENE — Environment injection shortcut ─────────────────────
    // Forces stone-cellar environment if wineEnvironmentVariation not already set.
    const winerysceneActive = photoMode === 'Winery Scene';
    const effectiveWineEnvironmentVariation = winerysceneActive
      ? 'dark-cellar'
      : String(state.wineEnvironmentVariation || '').trim();
    const hasWineEnvironment = Boolean(effectiveWineEnvironmentVariation);

    // ── Strict hierarchy — one of each, no duplicates ─────────────────────
    // [0] Engine status / intent
    // [1] Physical product + label locks  (IMMUTABLE — never overridden)
    // [2] Realism core                    (camera, light, env, materials, grade, ban-list)
    // [3] Camera overrides (only if state has explicit camera)
    // [4] Composition (only if state has explicit composition)
    // [5] Environment context             (depth/surface only — no lighting redefinition)
    // [6] Photo Mode context block        (for Editorial Table / Winery Scene / Bottle+Glass)
    // [7] Materials
    // [8] Modifiers (neutral — WINE_MOOD eliminated)
    // [9] Physical realism guardrail

    const segments: any[] = [];

    // [0] Intent
    segments.push({ type: 'guardrail', content: buildIntent(resolveStudioAuthority(wineEffectiveState), state) });

    // [0.5] Global artwork immutability — applies to all industries including wine
    segments.push({ type: 'guardrail', content: buildArtworkImmutability() });

    // [1] Physical + label (immutable)
    const winePhysicsBlock = wineEngineVersion >= 4
      ? buildWineTruthLayerV4(wineEffectiveState, resolvedWineConfig)
      : buildWineTruthLayer(wineEffectiveState, resolvedWineConfig);
    segments.push({ type: 'physics', content: winePhysicsBlock });

    // [2] Realism core — single authoritative block for camera/light/env/material/grade/bans
    segments.push({ type: 'guardrail', content: buildWineRealismCore() });

    // [3] Camera overrides — only if explicit camera state is set (guards against duplication)
    const cameraOverride = buildCameraOverrides(wineEffectiveState);
    if (cameraOverride) {
      segments.push({ type: 'camera', content: cameraOverride });
    }

    // [4] Composition — Bottle+Glass mode forces 3/4 angle with glass
    if (bottleAndGlassMode) {
      segments.push({
        type: 'composition',
        content: 'COMPOSITION: BOTTLE_AND_GLASS. Opened service bottle and filled wine glass. Three-quarter camera angle. Glass positioned at complementary angle. Label fully legible. Bottle fill level reflects poured service. No full pour-in-progress.',
      });
    } else if (bottleAndGlassPourMode) {
      segments.push({
        type: 'composition',
        content: 'COMPOSITION: BOTTLE_AND_GLASS_POUR. Bottle tilted for active hospitality pour. SUPPORT_REQUIREMENT: A visible cropped hand or forearm must be in frame physically supporting the bottle. No invisible support. No floating bottle. BOTTLE_TILT_PHYSICS: The bottle is rotated to a believable service angle, roughly in the range needed for wine to flow naturally without the bottle reading as weightless or mechanically posed. The visible hand or forearm must own the support and wrist angle. The mouth end is lower than the shoulder and aimed toward the receiving glass, while the base remains visually plausible and not excessively kicked upward. LIQUID_STREAM_PHYSICS: The liquid stream exits exclusively from the bottle mouth and front lip. The stream must follow a natural downward gravity arc — short, clean, and continuous into the wine glass opening. The stream is a narrow elegant ribbon, not a wide splash or chaotic burst. The stream contacts the glass rim or interior before terminating. SPATIAL_RELATIONSHIP: The bottle mouth must be visually positioned just above and slightly inward from the glass rim. The glass is upright on the surface and acts as the receiving vessel, not a side prop. The distance between bottle mouth and glass top is approximately 2–5cm. Label remains legible despite pour tilt. Never emit liquid from below the bottle rim, from the sidewall, or from any point other than the true mouth opening.',
      });
    } else if (handsPouringMode) {
      segments.push({
        type: 'composition',
        content: 'COMPOSITION: HANDS_POURING_WINE. Cropped hands-only hospitality service pour. No visible identity cues. No torso. Bottle and glass remain primary subjects with premium service framing. The wine stream must begin at the bottle mouth only, with continuous contact to the lip and neck opening.',
      });
    } else if (lineupMode) {
      segments.push({
        type: 'composition',
        content: 'COMPOSITION: WINE_LINEUP_COMPARISON. Multiple bottles arranged upright with clean spacing, balanced family-of-products rhythm, and clear varietal separation.',
      });
    } else if (bottleInHandCutoutMode) {
      segments.push({
        type: 'composition',
        content: 'COMPOSITION: BOTTLE_IN_HAND_CUTOUT. Single cropped hand holds the bottle against a clean backdrop. No visible identity cues. No torso. Label remains front-readable and dominant.',
      });
    } else if (roseTastingTableMode) {
      segments.push({
        type: 'composition',
        content: 'COMPOSITION: ROSE_TASTING_TABLE. Bright table-led editorial service scene with poured wine, elegant glass highlights, and refined seasonal accents. No people in frame.',
      });
    } else {
      const compositionOverride = buildComposition(resolveStudioAuthority(wineEffectiveState), state);
      if (compositionOverride) {
        segments.push({ type: 'composition', content: compositionOverride });
      }
    }

    segments.push({
      type: 'world',
      content: buildWorld(resolveStudioAuthority(wineEffectiveState), wineEffectiveState.world, wineEffectiveState),
    });

    const wineIndustryLayer = buildWineIndustryLayerV2(wineEffectiveState);
    if (wineIndustryLayer) {
      segments.push({ type: 'guardrail', content: wineIndustryLayer });
    }

    if (hasWineEnvironment) {
      segments.push({ type: 'guardrail', content: `WINE_ENVIRONMENT: ${effectiveWineEnvironmentVariation}.` });
    }

    if (wineEffectiveState.wineMicroVariation) {
      segments.push({
        type: 'guardrail',
        content: buildMicroVariationBlock(wineEffectiveState.wineMicroVariation),
      });
    }

    // [6] Photo Mode context block for Editorial Table
    if (photoMode === 'Editorial Table') {
      segments.push({
        type: 'guardrail',
        content: 'PHOTO_MODE: Editorial Table. Premium tabletop editorial composition. Authentic surface texture. Editorial balance. Minimal controlled wine-appropriate props. Bottle as focal point with subtle environmental depth. BOTTLE_UPRIGHT: The bottle stands perfectly vertical. No tilt. No lean. Camera angle does not imply bottle angle.',
      });
    } else if (winerysceneActive) {
      segments.push({
        type: 'guardrail',
        content: 'PHOTO_MODE: Winery Scene. Authentic winery or cellar setting with barrel-room or stone-cellar depth. Bottle remains the hero subject in the foreground. Real architectural depth, premium ambient atmosphere, and no generic studio fallback. BOTTLE_UPRIGHT: The bottle stands perfectly vertical. No tilt. No lean.',
      });
    } else if (photoMode === 'Hero Landing Page') {
      segments.push({
        type: 'guardrail',
        content: 'PHOTO_MODE: Hero Landing Page. Clean premium hero composition. 45° hero describes camera viewpoint only, never physical bottle lean. The bottle must remain perfectly upright with base level on the surface, vertical axis aligned to gravity, and no diagonal tilt or casual slant.',
      });
    } else if (bottleAndGlassMode) {
      segments.push({
        type: 'guardrail',
        content: 'PHOTO_MODE: Bottle + Glass. Premium served-bottle presentation with one filled wine glass beside the bottle. Opened service state only. No pour-in-progress. Label remains fully legible and dominant. BOTTLE_UPRIGHT: The bottle stands perfectly vertical beside the glass. No tilt.',
      });
    } else if (bottleAndGlassPourMode) {
      segments.push({
        type: 'guardrail',
        content: 'PHOTO_MODE: Bottle + Glass Pour. Controlled premium wine pour with physically coherent bottle tilt. HAND_REQUIREMENT: A visible cropped hand or forearm must support the bottle during the pour. Do not allow invisible support or off-frame suspension. BOTTLE_POUR_PHYSICS: The bottle is supported naturally and tilted only as much as needed for a real pour. It must not look suspended, crane-like, or mechanically frozen in space. The bottle mouth points downward toward the glass opening with a believable handoff distance and wrist angle. STREAM_PATH: The liquid exits from the bottle mouth only, following a short smooth downward gravity arc into the glass. The stream is a narrow elegant ribbon — never wide, explosive, or chaotic. The stream must not shoot horizontally, exit upward, or originate from the bottle body. GLASS_POSITION: The wine glass stands upright on the surface directly under the pour path and reads as the receiving vessel. The glass is partially filled. POUR_REALISM: This is premium hospitality photography. The pour reads as real wine service, not CGI. Bottle label remains visible despite the tilt angle. No impossible physics. No levitating bottle. No liquid appearing from anywhere other than the bottle mouth.',
      });
    } else if (handsPouringMode) {
      segments.push({
        type: 'guardrail',
        content: 'PHOTO_MODE: Hands Pouring Wine. Cropped hands-only service action. A visible cropped hand or forearm must support the bottle in frame at all times. No visible identity cues. No full person. Premium tasting-room or fine-dining mood with bottle and glass as the main subjects. The pour must begin at the true bottle mouth with a gravity-coherent stream path into the glass.',
      });
    } else if (lineupMode) {
      segments.push({
        type: 'guardrail',
        content: 'PHOTO_MODE: Wine Lineup Comparison. Multiple bottles shown as a refined brand-family lineup. Clean spacing. Premium shadow geometry. Color variation across bottles is desirable. BOTTLE_UPRIGHT: All bottles stand perfectly vertical. No tilt on any bottle.',
      });
      if ((wineEffectiveState as any)?.bundle?.enabled && String((wineEffectiveState as any)?.visualIntent || 'campaign').trim() === 'campaign') {
        segments.push({
          type: 'guardrail',
          content: 'CAMPAIGN_LINEUP_POLISH: The lineup must read as premium brand-campaign photography, not raw documentary capture. Keep the finish elevated, clean, and art-directed with refined tonal separation, sculpted bottle edge definition, polished but believable highlight control, and elegant shadow depth. Avoid gritty, flat, underlit, noisy, or harshly raw rendering. Sensor texture, if present, must stay extremely subtle and never become a visible stylistic effect.',
        });
      }
    } else if (editorialBottleTabletopMode) {
      segments.push({
        type: 'guardrail',
        content: 'PHOTO_MODE: Editorial Bottle Tabletop. Premium still-life tabletop. Stone, marble, or warm wood surfaces allowed. Props remain minimal and wine-appropriate. Think editorial still life rather than rigid catalog hero. The bottle may stand upright or rest at a subtle believable tabletop angle if the composition benefits from it. SURFACE_DISCIPLINE: Keep the styling tactile, asymmetrical, and photographed rather than showroom-clean.',
      });
    } else if (bottleInHandCutoutMode) {
      segments.push({
        type: 'guardrail',
        content: 'PHOTO_MODE: Bottle In Hand Cutout. Single cropped hand or forearm only. No visible identity cues. No torso. Minimal clean commercial backdrop. The feeling should match a real held-bottle lifestyle cutout, not a sterile e-commerce grip. Preserve believable hand support, finger pressure, and natural handheld angle.',
      });
    } else if (roseTastingTableMode) {
      segments.push({
        type: 'guardrail',
        content: 'PHOTO_MODE: Rose Tasting Table. Bright premium tasting-table scene for rose or white wine. Fresh glass highlights, refined floral or tasting accents, and no human subjects in frame. BOTTLE_UPRIGHT: The bottle stands perfectly vertical. No tilt.',
      });
    } else if (socialTableServedMode) {
      segments.push({
        type: 'guardrail',
        content: 'PHOTO_MODE: Social Table Served. Editorial shared-table wine scene. The bottle can be primary or secondary within a believable hosting setup, and the frame may be table-led rather than bottle-led. TABLE_LANGUAGE: Use believable olives, grapes, charcuterie, bread, small plates, or imperfect real hospitality cues only when they support the scene naturally. HUMAN_PRESENCE: Partial hands, cropped torsos, seated background presence, and soft out-of-focus guests are allowed when they support the social table moment. Facial features must never become tack-sharp focal subjects. Avoid portrait-led framing, but do not sterilize people out of the scene. HOSPITALITY_DISCIPLINE: The moment reads as authentic table service and editorial lifestyle photography, not staged CGI product theater. Overhead, three-quarter, and table-height compositions are all allowed. The bottle may stand upright or rest naturally within the spread.',
      });
    } else if (outdoorToastMode) {
      segments.push({
        type: 'guardrail',
        content: 'PHOTO_MODE: Outdoor Toast. Editorial outdoor wine moment with raised glasses, relaxed hospitality, and believable bottle presence. The glasses may take the foreground while the bottle sits on the table, in the lower frame, or softly secondary in the setup. HUMAN_PRESENCE: Hands, clinking glasses, cropped limbs, and partial seated bodies are allowed and desirable when they create a real toast moment. Facial features must stay secondary, soft, cropped, or outside focal priority. Avoid stiff group portraits, nightlife chaos, or influencer-pose energy. OUTDOOR_CONTEXT: Prefer lawn, terrace, picnic table, patio, or relaxed garden hospitality cues over scenic-cinematic backgrounds. Keep the moment intimate, sunlit, and real, like an actual outdoor lunch or afternoon toast.',
      });
    } else if (hostingPourMode) {
      segments.push({
        type: 'guardrail',
        content: 'PHOTO_MODE: Hosting Pour. Editorial hosting moment with active wine service. POUR_REALISM: The bottle is naturally supported for the pour and pours into the receiving glass with believable hospitality physics. HUMAN_PRESENCE: A visible cropped hand, arm, or forearm must support the bottle during the pour. Real service cues are required. No tack-sharp facial features should become the subject. Avoid face-led portrait framing, but do not strip the human action out of the scene. HOSTING_DISCIPLINE: Frame it like real service at a table, counter, bar, patio, or outdoor spread. The action may lead the image, with the bottle fully visible or partially cropped, as long as the support and pour feel real. No floating bottle. No robotic wrist angle. No theatrical liquid arc.',
      });
    } else if (dinnerPairingMode) {
      segments.push({
        type: 'guardrail',
        content: 'PHOTO_MODE: Dinner Pairing. Editorial dining scene with plated food, wine glasses, and tactile table context. FOOD_STYLING: Real dining cues only. No prop-styling overload. Use one or two credible plates, not a banquet spread. The bottle can be upright beside the setting, naturally integrated into the table, or slightly secondary to the dish-and-glass relationship. HUMAN_PRESENCE: Cropped diners, hands reaching, or soft seated presence are allowed when they support the hospitality scene. Any facial features must stay out of focus, cropped, or clearly secondary to the bottle and table moment. TABLE_REALISM: Linen, wood, ceramic, or stone surfaces are welcome if they feel photographed and slightly imperfect, never like a CG restaurant set.',
      });
    } else if (picnicGatheringMode) {
      segments.push({
        type: 'guardrail',
        content: 'PHOTO_MODE: Picnic Gathering. Editorial picnic wine scene with picnic cues, natural sunlight, and relaxed real-world context. PICNIC_LANGUAGE: Think blanket, low table, shared board, bread, fruit, simple serveware, and imperfect casual hosting. Avoid floral fantasy setups and wedding-styled decor. HUMAN_PRESENCE: Cropped guests, hands reaching, seated figures, and background presence are allowed when they create a believable picnic moment. No tack-sharp portrait facial features. Guests should register as a shared moment through gestures, crops, or soft background blur. LIFESTYLE_REALISM: No influencer fantasy styling. Keep the moment candid, premium, and believable. The bottle may be upright, casually placed, or resting within the spread rather than isolated as a hero packshot.',
      });
    } else if (celebrationChillMode) {
      segments.push({
        type: 'guardrail',
        content: 'PHOTO_MODE: Celebration Chill. Editorial fresh wine service scene with glasses and restrained hospitality action. FRESH_SERVICE_REALISM: Keep the service polished and premium, but dry, clean, and physically believable. No nightclub lighting, no fake frost glamour, no condensation styling, and no cold-prop theatrics. HUMAN_PRESENCE: Cropped guests, partial hands, and casual table interactions are allowed when they support the scene. Guests must remain secondary, soft, cropped, or outside focal priority rather than portrait subjects. SERVICE_CUES: Relaxed terrace hosting, elegant table service, or fresh hospitality context may appear. Avoid ice buckets, chilled sleeves, loose ice, puddles, wet stemware, or visibly soaked surfaces. The bottle can be focal or secondary, but should feel naturally embedded in the service ritual.',
      });
    }

    // [7] Materials
    segments.push({ type: 'guardrail', content: buildWineMaterials(resolvedWineConfig?.serveState) });

    // [8] Modifiers (returns '' — WINE_MOOD eliminated)
    const modifiers = buildWineModifiers(wineEffectiveState);
    if (modifiers) {
      segments.push({ type: 'guardrail', content: modifiers });
    }

    // [9] Physical realism guardrail
    segments.push({ type: 'guardrail', content: buildWineMinimalGuardrail() });

    // [10] TEXT_INTEGRITY_CONSTRAINT — terminal. Must be last before sanitize.
    // Overrides any text hints that may have leaked from upstream segments.
    // NEVER reorder this below sanitize.
    segments.push({ type: 'guardrail', content: buildWineTextIntegrityConstraint() });

    const prompt = sanitizeWineV4Prompt(
      sanitizePromptLexicalGuard(
        dedupeWineStructuralTokens(finalizePromptFromSegments(segments, resolveStudioAuthority(wineEffectiveState)))
      )
    );

    return prompt;
  }
};

// ============================================================================
// WINE PIPELINE V4 — ENTERPRISE MULTI-LAYER ASSEMBLY
// ============================================================================
// Drop-in upgrade path from winePipeline. Uses all v4 environment/lighting/
// camera/luxury/micro-variation layers. Physical product layer is identical
// (same buildWineTruthLayer / buildWineTruthLayerV4 — immutability preserved).
//
// Usage:
//   winePipelineV4.build(state, v4Options)
//
// v4Options all have safe defaults — calling without options degrades gracefully
// to single-hero / dark-luxury-studio / sculptural-studio / ultra-premium.
// ============================================================================

export type WinePipelineV4Options = {
  /** Override environment selection. Defaults to 'Dark Luxury Studio'. */
  environment?: WineEnvironmentV4;
  /** Override luxury tier. Defaults to auto-resolved from environment prestige. */
  luxuryTier?: WineLuxuryIntensity;
  /** Override composition mode. Defaults to 'single-hero' or 'bottle-and-glass' for served. */
  compositionMode?: WineCompositionMode;
  /** Override lighting rig key. Defaults to 'sculptural-studio-luxury'. */
  lightingRig?: keyof typeof WINE_LIGHTING_RIGS;
  /** Optional micro variation enrichment. */
  microVariation?: WineMicroVariation;
};

export const winePipelineV4 = {
  build(state: StudioUIState, options: WinePipelineV4Options = {}): string {
    const wineEffectiveState = applyWineDeterministicStateMachine(state);
    const resolvedWineConfig = resolveDeterministicWineConfig(wineEffectiveState);
    const wineEngineVersion = resolveWineEngineVersion(wineEffectiveState);

    // ── Layer 0+1: Physical state + label (immutable) ─────────────────────
    const physicsBlock = wineEngineVersion >= 4
      ? buildWineTruthLayerV4(wineEffectiveState, resolvedWineConfig)
      : buildWineTruthLayer(wineEffectiveState, resolvedWineConfig);

    // labelBlock is embedded in physicsBlock via buildWineTruthLayer —
    // pass empty string to avoid duplication in assembleWineV4Prompt.
    const labelBlock = '';

    // ── Layer 2: Luxury tier ──────────────────────────────────────────────
    const environment: WineEnvironmentV4 = options.environment ?? 'Dark Luxury Studio';
    const luxuryTier: WineLuxuryIntensity = options.luxuryTier ?? resolveDefaultLuxuryTier(environment);

    // ── Layer 3: Environment ──────────────────────────────────────────────
    // (passed via environment param above)

    // ── Layer 4: Lighting ─────────────────────────────────────────────────
    const lightingRig: keyof typeof WINE_LIGHTING_RIGS = options.lightingRig ?? 'sculptural-studio-luxury';

    // ── Layer 5: Camera + Composition ─────────────────────────────────────
    const serveState = resolvedWineConfig?.serveState ?? 'none';
    const baseCompositionMode: WineCompositionMode = options.compositionMode
      ?? resolveCompositionForServeState('single-hero', serveState);

    // Camera angle: derive from composition mode
    const rawCamera = WINE_COMPOSITION_MODES[baseCompositionMode].cameraAngle;
    const cameraAngle = resolveCameraForCompositionMode(rawCamera, baseCompositionMode);

    // ── Layer 6: Micro variation ──────────────────────────────────────────
    const microVariation = options.microVariation ?? null;

    // ── Assembly ──────────────────────────────────────────────────────────
    // NOTE: archetypeNarrative and aestheticSegment are intentionally omitted.
    // They introduced WINE_AESTHETIC_PROFILE / glow / film-grain / reflection-layer
    // tokens that conflict with REAL_WORLD_PHOTOGRAPHY_MODE.
    // The realism core (injected by winePipeline.build via buildWineRealismCore)
    // is the single authoritative aesthetic/material/lighting authority.
    const rawPrompt = assembleWineV4Prompt({
      physicsBlock,
      labelBlock,
      luxuryTier,
      environment,
      lightingRig,
      cameraAngle,
      compositionMode: baseCompositionMode,
      microVariation,
    });

    return sanitizeWineV4Prompt(
      sanitizePromptLexicalGuard(
        dedupeWineStructuralTokens(rawPrompt)
      )
    );
  },
};
