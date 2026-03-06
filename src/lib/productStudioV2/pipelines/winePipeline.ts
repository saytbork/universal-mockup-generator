import { applyWineDeterministicStateMachine, resolveDeterministicWineConfig, resolveWineEngineVersion, buildWineTruthLayerV4, buildWineTruthLayer, buildWineLighting, buildWorld, buildLighting, buildWineMaterials, buildWineModifiers, buildWineMinimalGuardrail, buildWineRealismCore, buildWineTextIntegrityConstraint, buildArtworkImmutability, sanitizeWineV4Prompt, dedupeWineStructuralTokens, sanitizePromptLexicalGuard, finalizePromptFromSegments, buildIntent, buildCameraOverrides, buildComposition, resolveStudioAuthority } from '../index';
import type { StudioUIState } from '../index';
import { assembleWineV4Prompt, resolveDefaultLuxuryTier, resolveCompositionForServeState, resolveCameraForCompositionMode, WINE_LIGHTING_RIGS, WINE_COMPOSITION_MODES } from '../../productStudio/winePrestige';
import type { WineEnvironmentV4, WineLuxuryIntensity, WineCompositionMode, WineMicroVariation } from '../../productStudio/types';

// For structural testing only
export function __buildSegmentsForTest(state: StudioUIState) {
  const wineEffectiveState = applyWineDeterministicStateMachine(state);
  const resolvedWineConfig = resolveDeterministicWineConfig(wineEffectiveState);
  const wineEngineVersion = resolveWineEngineVersion(wineEffectiveState);
  const hasWineEnvironment = Boolean(String(state.wineEnvironmentVariation || '').trim());
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
    const photoMode = String((state as any).photoMode || '').trim();

    // RULE 3: Bottle + Glass forces serve state = served.
    // Pre-patch the state before the deterministic machine runs so that
    // resolveServeState() sees wineGlassMode='filled' and bottleState='open'.
    // This also prevents the Closed option from being effective when this mode is active.
    const stateForMachine: StudioUIState =
      photoMode === 'Bottle + Glass'
        ? { ...state, wineGlassMode: 'filled', wineBottleState: 'open' } as StudioUIState
        : state;

    const wineEffectiveState = applyWineDeterministicStateMachine(stateForMachine);
    const resolvedWineConfig = resolveDeterministicWineConfig(wineEffectiveState);
    const wineEngineVersion = resolveWineEngineVersion(wineEffectiveState);
    const hasWineEnvironment = Boolean(String(state.wineEnvironmentVariation || '').trim());

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

    // ── WINERY SCENE — Environment injection shortcut ─────────────────────
    // Forces stone-cellar environment if wineEnvironmentVariation not already set.
    const winerysceneActive = photoMode === 'Winery Scene';

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
        content: 'COMPOSITION: BOTTLE_AND_GLASS. Sealed bottle and filled wine glass. Three-quarter camera angle. Glass positioned at complementary angle. Label fully legible. No full pour-in-progress.',
      });
    } else {
      const compositionOverride = buildComposition(resolveStudioAuthority(wineEffectiveState), state);
      if (compositionOverride) {
        segments.push({ type: 'composition', content: compositionOverride });
      }
    }

    // [5] World ownership comes from world builder router.
    segments.push({
      type: 'world',
      content: buildWorld(resolveStudioAuthority(wineEffectiveState), wineEffectiveState.world, wineEffectiveState),
    });

    if (winerysceneActive && !hasWineEnvironment) {
      segments.push({ type: 'guardrail', content: 'SCENE_STYLE: wine editorial photography.' });
    } else if (hasWineEnvironment) {
      segments.push({ type: 'guardrail', content: 'SCENE_STYLE: wine editorial photography.' });
    }

    // [6] Photo Mode context block for Editorial Table
    if (photoMode === 'Editorial Table') {
      segments.push({
        type: 'guardrail',
        content: 'PHOTO_MODE: Editorial Table. Premium tabletop editorial composition. Authentic surface texture. Editorial balance. Minimal controlled wine-appropriate props. Bottle as focal point with subtle environmental depth.',
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
