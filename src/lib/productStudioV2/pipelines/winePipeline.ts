import { applyWineDeterministicStateMachine, resolveDeterministicWineConfig, resolveWineEngineVersion, buildWineTruthLayerV4, buildWineTruthLayer, buildWineLighting, buildWorld, buildLighting, buildWineMaterials, buildWineModifiers, buildWineMinimalGuardrail, buildWineRealismCore, buildWineTextIntegrityConstraint, buildArtworkImmutability, sanitizeWineV4Prompt, dedupeWineStructuralTokens, sanitizePromptLexicalGuard, finalizePromptFromSegments, buildIntent, buildCameraOverrides, buildComposition, resolveStudioAuthority, buildPalette } from '../index';
import type { StudioUIState } from '../index';
import { assembleWineV4Prompt, resolveDefaultLuxuryTier, resolveCompositionForServeState, resolveCameraForCompositionMode, WINE_LIGHTING_RIGS, WINE_COMPOSITION_MODES } from '../../productStudio/winePrestige';
import type { WineEnvironmentV4, WineLuxuryIntensity, WineCompositionMode, WineMicroVariation } from '../../productStudio/types';

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
    ]);
    const activePourMode = photoMode === 'Bottle + Glass Pour' || photoMode === 'Hands Pouring Wine';
    const stateForMachine: StudioUIState = servedGlassModes.has(photoMode)
      ? {
          ...state,
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
        content: 'COMPOSITION: BOTTLE_AND_GLASS_POUR. Bottle actively pours into a wine glass. Three-quarter camera angle. Elegant liquid ribbon. Controlled motion only. The liquid stream must originate at the true bottle mouth and inner lip, connected continuously to the neck opening. Never emit liquid from below the bottle rim, sidewall, label area, or glass body. Label remains legible throughout.',
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

    if (hasWineEnvironment) {
      segments.push({ type: 'guardrail', content: `WINE_ENVIRONMENT: ${effectiveWineEnvironmentVariation}.` });
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
        content: 'PHOTO_MODE: Bottle + Glass Pour. Controlled premium wine pour. Elegant hospitality motion. Continuous liquid ribbon into glass. No explosive splash. The pour must originate from the bottle mouth and front lip exactly as real wine service behaves. Never start the stream below the rim or from the underside of the bottle opening. Bottle label remains visible.',
      });
    } else if (handsPouringMode) {
      segments.push({
        type: 'guardrail',
        content: 'PHOTO_MODE: Hands Pouring Wine. Cropped hands-only service action. No visible identity cues. No full person. Premium tasting-room or fine-dining mood with bottle and glass as the main subjects. The pour must begin at the true bottle mouth with a gravity-coherent stream path into the glass.',
      });
    } else if (lineupMode) {
      segments.push({
        type: 'guardrail',
        content: 'PHOTO_MODE: Wine Lineup Comparison. Multiple bottles shown as a refined brand-family lineup. Clean spacing. Premium shadow geometry. Color variation across bottles is desirable. BOTTLE_UPRIGHT: All bottles stand perfectly vertical. No tilt on any bottle.',
      });
    } else if (editorialBottleTabletopMode) {
      segments.push({
        type: 'guardrail',
        content: 'PHOTO_MODE: Editorial Bottle Tabletop. Premium still-life tabletop. Stone, marble, or warm wood surfaces allowed. Props remain minimal and wine-appropriate. Bottle remains the hero subject. BOTTLE_UPRIGHT: The bottle stands perfectly vertical. No tilt.',
      });
    } else if (bottleInHandCutoutMode) {
      segments.push({
        type: 'guardrail',
        content: 'PHOTO_MODE: Bottle In Hand Cutout. Single cropped hand or forearm only. No visible identity cues. No torso. Minimal clean commercial backdrop. Bottle label remains fully visible and product-led.',
      });
    } else if (roseTastingTableMode) {
      segments.push({
        type: 'guardrail',
        content: 'PHOTO_MODE: Rose Tasting Table. Bright premium tasting-table scene for rose or white wine. Fresh glass highlights, refined floral or tasting accents, and no human subjects in frame. BOTTLE_UPRIGHT: The bottle stands perfectly vertical. No tilt.',
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
