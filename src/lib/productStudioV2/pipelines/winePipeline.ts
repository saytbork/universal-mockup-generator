import { applyWineDeterministicStateMachine, resolveDeterministicWineConfig, resolveWineEngineVersion, buildWineTruthLayerV4, buildWineTruthLayer, buildWineEnvironment, buildWineLighting, buildWorld, buildLighting, buildWineMaterials, buildWineModifiers, buildWineMinimalGuardrail, buildWineRealismCore, sanitizeWineV4Prompt, dedupeWineStructuralTokens, sanitizePromptLexicalGuard, finalizePromptFromSegments, buildIntent, buildCameraOverrides, buildComposition, resolveStudioAuthority } from '../index';
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
  const winePhysicsBlock = wineEngineVersion >= 4
    ? buildWineTruthLayerV4(wineEffectiveState, resolvedWineConfig)
    : buildWineTruthLayer(wineEffectiveState, resolvedWineConfig);
  segments.push({ type: 'physics', content: winePhysicsBlock });
  segments.push({ type: 'guardrail', content: buildWineRealismCore() });
  if (hasWineEnvironment) {
    segments.push({ type: 'world', content: buildWineEnvironment(wineEffectiveState) });
  }
  segments.push({ type: 'guardrail', content: buildWineMaterials(resolvedWineConfig?.serveState) });
  segments.push({ type: 'guardrail', content: buildWineMinimalGuardrail() });
  return segments;
}

export const winePipeline = {
  build(state: StudioUIState): string {
    const wineEffectiveState = applyWineDeterministicStateMachine(state);
    const resolvedWineConfig = resolveDeterministicWineConfig(wineEffectiveState);
    const wineEngineVersion = resolveWineEngineVersion(wineEffectiveState);
    const hasWineEnvironment = Boolean(String(state.wineEnvironmentVariation || '').trim());

    // ── Strict hierarchy — one of each, no duplicates ─────────────────────
    // [0] Engine status / intent
    // [1] Physical product + label locks  (IMMUTABLE — never overridden)
    // [2] Realism core                    (camera, light, env, materials, grade, ban-list)
    // [3] Camera overrides (only if state has explicit camera)
    // [4] Composition (only if state has explicit composition)
    // [5] Environment context             (depth/surface only — no lighting redefinition)
    // [6] Materials
    // [7] Modifiers (neutral — WINE_MOOD eliminated)
    // [8] Physical realism guardrail
    //
    // REMOVED from this pipeline:
    //   ✗ WINE_AESTHETIC_PROFILE   (synthetic bias layering)
    //   ✗ WINE_MOOD tokens         (Film Grain / Terroir Tone / Reflection Layer)
    //   ✗ _archetypeNarrative      (visual-style override conflicting with realism core)
    //   ✗ Duplicate lighting       (environment and lighting both called → conflict)

    const segments: any[] = [];

    // [0] Intent
    segments.push({ type: 'guardrail', content: buildIntent(resolveStudioAuthority(wineEffectiveState), state) });

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

    // [4] Composition — only if explicit composition state is set
    const compositionOverride = buildComposition(resolveStudioAuthority(wineEffectiveState), state);
    if (compositionOverride) {
      segments.push({ type: 'composition', content: compositionOverride });
    }

    // [5] Environment context (surface, depth-field only — no light source redefinition)
    // Only injected if user explicitly set wineEnvironmentVariation.
    // We do NOT inject buildWineLighting here — that would conflict with LIGHT_SOURCE in [2].
    if (hasWineEnvironment) {
      segments.push({ type: 'world', content: buildWineEnvironment(wineEffectiveState) });
    }

    // [6] Materials
    segments.push({ type: 'guardrail', content: buildWineMaterials(resolvedWineConfig?.serveState) });

    // [7] Modifiers (returns '' — WINE_MOOD eliminated)
    const modifiers = buildWineModifiers(wineEffectiveState);
    if (modifiers) {
      segments.push({ type: 'guardrail', content: modifiers });
    }

    // [8] Physical realism guardrail
    segments.push({ type: 'guardrail', content: buildWineMinimalGuardrail() });

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
