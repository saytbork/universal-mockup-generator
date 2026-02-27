import { applyWineDeterministicStateMachine, resolveDeterministicWineConfig, resolveWineEngineVersion, buildWineTruthLayerV4, buildWineTruthLayer, buildWineEnvironment, buildWineLighting, buildWorld, buildLighting, buildWineMaterials, buildWineModifiers, buildWineMinimalGuardrail, sanitizeWineV4Prompt, dedupeWineStructuralTokens, sanitizePromptLexicalGuard, finalizePromptFromSegments, buildIntent, buildCameraOverrides, buildComposition, resolveStudioAuthority } from '../index';
import type { StudioUIState } from '../index';
import { getWineAestheticProfile, buildWineAestheticSegment, assembleWineV4Prompt, getWineEnvironmentV4Spec, resolveDefaultLuxuryTier, resolveCompositionForServeState, resolveCameraForCompositionMode, WINE_LIGHTING_RIGS, WINE_COMPOSITION_MODES, ALL_WINE_ENVIRONMENTS_V4 } from '../../productStudio/winePrestige';
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
  segments.push({ type: 'camera', content: buildCameraOverrides(wineEffectiveState) });
  segments.push({ type: 'composition', content: buildComposition(resolveStudioAuthority(wineEffectiveState), state) });
  segments.push({ type: 'world', content: hasWineEnvironment ? buildWineEnvironment(wineEffectiveState) : buildWorld(resolveStudioAuthority(wineEffectiveState), wineEffectiveState.world, state) });
  segments.push({ type: 'world', content: hasWineEnvironment ? buildWineLighting(wineEffectiveState) : buildLighting(resolveStudioAuthority(wineEffectiveState), state) });
  segments.push({ type: 'guardrail', content: buildWineMaterials(resolvedWineConfig?.serveState) });
  segments.push({ type: 'guardrail', content: buildWineModifiers(wineEffectiveState) });
  segments.push({ type: 'guardrail', content: buildWineMinimalGuardrail() });
  return segments;
}

export const winePipeline = {
  build(state: StudioUIState): string {
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
    segments.push({ type: 'camera', content: buildCameraOverrides(wineEffectiveState) });
    segments.push({ type: 'composition', content: buildComposition(resolveStudioAuthority(wineEffectiveState), state) });
    segments.push({ type: 'world', content: hasWineEnvironment ? buildWineEnvironment(wineEffectiveState) : buildWorld(resolveStudioAuthority(wineEffectiveState), wineEffectiveState.world, state) });
    segments.push({ type: 'world', content: hasWineEnvironment ? buildWineLighting(wineEffectiveState) : buildLighting(resolveStudioAuthority(wineEffectiveState), state) });
    segments.push({ type: 'guardrail', content: buildWineMaterials(resolvedWineConfig?.serveState) });
    segments.push({ type: 'guardrail', content: buildWineModifiers(wineEffectiveState) });

    // Archetype + Aesthetic Profile (apply to both closed and served — bottle is always sealed)
    const _archetypeNarrative = String((wineEffectiveState as any).wineArchetypeNarrative || '').trim();
    if (_archetypeNarrative) {
      segments.push({ type: 'guardrail', content: _archetypeNarrative });
    }
    const _aestheticProfile = getWineAestheticProfile((wineEffectiveState as any).wineStyleArchetype ?? null);
    const _aestheticSegment = buildWineAestheticSegment(_aestheticProfile);
    if (_aestheticSegment) {
      segments.push({ type: 'guardrail', content: _aestheticSegment });
    }

    segments.push({ type: 'guardrail', content: buildWineMinimalGuardrail() });

    // eslint-disable-next-line no-console
    console.log('WINE SEGMENTS LENGTH BEFORE FINALIZE:', segments.length);

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

    // ── Layer 7+8: Archetype + Aesthetic ─────────────────────────────────
    const _archetypeNarrative = String((wineEffectiveState as any).wineArchetypeNarrative || '').trim();
    const _aestheticProfile = getWineAestheticProfile((wineEffectiveState as any).wineStyleArchetype ?? null);
    const _aestheticSegment = buildWineAestheticSegment(_aestheticProfile);

    // ── Assembly ──────────────────────────────────────────────────────────
    const rawPrompt = assembleWineV4Prompt({
      physicsBlock,
      labelBlock,
      luxuryTier,
      environment,
      lightingRig,
      cameraAngle,
      compositionMode: baseCompositionMode,
      microVariation,
      archetypeNarrative: _archetypeNarrative || undefined,
      aestheticSegment: _aestheticSegment || undefined,
    });

    return sanitizeWineV4Prompt(
      sanitizePromptLexicalGuard(
        dedupeWineStructuralTokens(rawPrompt)
      )
    );
  },
};
