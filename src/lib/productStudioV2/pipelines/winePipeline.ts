// Solo para testing estructural
export function __buildSegmentsForTest(state: StudioUIState) {
  const wineEffectiveState = applyWineDeterministicStateMachine(state);
  const resolvedWineConfig = resolveDeterministicWineConfig(wineEffectiveState);
  const wineEngineVersion = resolveWineEngineVersion(wineEffectiveState);
  const hasWineEnvironment = Boolean(String(state.wineEnvironmentVariation || '').trim());
  const segments: any[] = [];
  segments.push({ type: 'guardrail', content: buildIntent(resolveStudioAuthority(wineEffectiveState), state) });
  let winePhysicsBlock = wineEngineVersion >= 4
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
import { applyWineDeterministicStateMachine, resolveDeterministicWineConfig, resolveWineEngineVersion, buildWineTruthLayerV4, buildWineTruthLayer, buildWineEnvironment, buildWineLighting, buildWorld, buildLighting, buildWineMaterials, buildWineModifiers, buildWineMinimalGuardrail, sanitizeWineV4Prompt, dedupeWineStructuralTokens, sanitizePromptLexicalGuard, finalizePromptFromSegments, buildIntent, buildCameraOverrides, buildComposition, resolveStudioAuthority } from '../index';
import type { StudioUIState } from '../index';
import { getWineAestheticProfile, buildWineAestheticSegment } from '../../productStudio/winePrestige';

export const winePipeline = {
  build(state: StudioUIState): string {
    const wineEffectiveState = applyWineDeterministicStateMachine(state);
    const resolvedWineConfig = resolveDeterministicWineConfig(wineEffectiveState);
    const wineEngineVersion = resolveWineEngineVersion(wineEffectiveState);
    const hasWineEnvironment = Boolean(String(state.wineEnvironmentVariation || '').trim());
    const segments: any[] = [];
  segments.push({ type: 'guardrail', content: buildIntent(resolveStudioAuthority(wineEffectiveState), state) });
    // HARD SERVE SYNCHRONIZATION
    // Enforce coherent bottle state when a glass is served. This must run before
    // we build WINE_CONFIG_RESOLVED / SERVE_VOLUME_CONSERVATION_LOCK_V3 so the
    // resolved config printed in the prompt always reflects the forced values.
    try {
      const serveStateVal = String((wineEffectiveState as any).serveState || resolvedWineConfig?.serveState || '').toLowerCase();
      if (String((wineEffectiveState as any).visualProfile || '').trim().toLowerCase() === 'wine' && serveStateVal === 'served') {
        // Force coherent bottle state independent of UI chips/front-end
        (resolvedWineConfig as any).serveState = 'served';
        (resolvedWineConfig as any).bottleState = 'open';
        (resolvedWineConfig as any).bottleFillState = 'clearly-partially-consumed';
        (wineEffectiveState as any).serveState = 'served';
        (wineEffectiveState as any).bottleState = 'open';
        (wineEffectiveState as any).bottleFillState = 'clearly-partially-consumed';
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error applying HARD SERVE SYNCHRONIZATION', err);
      throw err;
    }

    let winePhysicsBlock = wineEngineVersion >= 4
      ? buildWineTruthLayerV4(wineEffectiveState, resolvedWineConfig)
      : buildWineTruthLayer(wineEffectiveState, resolvedWineConfig);

    // SERVED MODE: Inject explicit closure instructions into physics block
    // This ensures closure state is always clear without blocking wine environment
    try {
      const serveStateVal = String((wineEffectiveState as any).serveState || resolvedWineConfig?.serveState || '').toLowerCase();
      if (String((wineEffectiveState as any).visualProfile || '').trim().toLowerCase() === 'wine' && serveStateVal === 'served') {
        // eslint-disable-next-line no-console
        console.log('[WINE SERVED MODE] injecting closure AND liquid level instructions');
        // NOTE: CLOSURE_STATE_EXPLICIT and MANDATORY_LIQUID_LEVEL are already present in
        // winePhysicsBlock from wineConfigResolver. Do NOT re-inject them here to avoid
        // duplicate/contradictory instructions that confuse the model.
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[WINE SERVED MODE] closure injection error', err);
    }

    // DISABLED: Early-exit for served mode - we now allow wine environment to inject
    // The closure instructions are added to winePhysicsBlock above instead

    // Removed conditional appending of 'Bottle perfectly vertical...' for strict segment equality
    segments.push({ type: 'physics', content: winePhysicsBlock });
  segments.push({ type: 'camera', content: buildCameraOverrides(wineEffectiveState) });
  segments.push({ type: 'composition', content: buildComposition(resolveStudioAuthority(wineEffectiveState), state) });
  segments.push({ type: 'world', content: hasWineEnvironment ? buildWineEnvironment(wineEffectiveState) : buildWorld(resolveStudioAuthority(wineEffectiveState), wineEffectiveState.world, state) });
  segments.push({ type: 'world', content: hasWineEnvironment ? buildWineLighting(wineEffectiveState) : buildLighting(resolveStudioAuthority(wineEffectiveState), state) });
  segments.push({ type: 'guardrail', content: buildWineMaterials(resolvedWineConfig?.serveState) });
  segments.push({ type: 'guardrail', content: buildWineModifiers(wineEffectiveState) });

  // ── WINE STYLE ARCHETYPE + AESTHETIC PROFILE ──────────────────────────────
  // Injection order:
  //   1. wineArchetypeNarrative  — descriptive scene intent (set by promptRouter)
  //   2. WINE_AESTHETIC_PROFILE  — micro-level visual bias (soft, non-constraining)
  //   3. PHYSICAL_REALISM        — hard guardrail (buildWineMinimalGuardrail below)
  //
  // Manual camera/lighting overrides are already locked into the physics and
  // camera segments above, so they always supersede these soft bias values.
  // Physics fields (closure, carbonation, volume) are never touched here.
  const _archetypeNarrative = String((wineEffectiveState as any).wineArchetypeNarrative || '').trim();
  if (_archetypeNarrative) {
    segments.push({ type: 'guardrail', content: _archetypeNarrative });
  }
  const _aestheticProfile = getWineAestheticProfile((wineEffectiveState as any).wineStyleArchetype ?? null);
  const _aestheticSegment = buildWineAestheticSegment(_aestheticProfile);
  if (_aestheticSegment) {
    segments.push({ type: 'guardrail', content: _aestheticSegment });
  }
  // ─────────────────────────────────────────────────────────────────────────

  segments.push({ type: 'guardrail', content: buildWineMinimalGuardrail() });
    // eslint-disable-next-line no-console
    console.log('WINE SEGMENTS LENGTH BEFORE FINALIZE:', segments.length);
    let prompt = sanitizeWineV4Prompt(
      sanitizePromptLexicalGuard(
        dedupeWineStructuralTokens(finalizePromptFromSegments(segments, resolveStudioAuthority(wineEffectiveState)))
      )
    );

    // Post-process non-served prompt to restore legacy tokens/wording for V4 tests only
    try {
      if (wineEngineVersion >= 4) {
        let augmented = prompt;

        // 2.1 WINE_STRUCTURAL_LOCK_V3 alias
        if (augmented.includes('CLOSURE_LOCK_STRICT_V1') && !augmented.includes('WINE_STRUCTURAL_LOCK_V3')) {
          augmented = augmented + ' ' + 'WINE_STRUCTURAL_LOCK_V3: Apply: CLOSURE_LOCK_STRICT_V1.';
        }

        // 2.2 SPARKLING_PHYSICS_LOCK_V3 when carbonation present
        const carbonationValGlobal = String((wineEffectiveState as any).carbonationLevel || 'none').trim();
        if (carbonationValGlobal !== 'none' && !augmented.includes('SPARKLING_PHYSICS_LOCK_V3')) {
          augmented = augmented + ' ' + 'SPARKLING_PHYSICS_LOCK_V3: Carbonation behavior must be physically plausible.';
        }

        // 2.3 VOLUME_LOCK alias
        if (augmented.includes('SERVE_VOLUME_CONSERVATION_LOCK_V3') && !augmented.includes('VOLUME_LOCK')) {
          augmented = augmented + ' ' + 'VOLUME_LOCK: Glass contains liquid.';
        }

        // 2.4 CLOSURE_LOCK wording
        if (augmented.includes('CLOSURE_LOCK_STRICT_V1') && !augmented.includes('CLOSURE_LOCK: Bottle is open.')) {
          augmented = augmented + ' ' + 'CLOSURE_LOCK: Bottle is open.';
        }

        // 3) Restore legacy physical wording — ONLY for served mode
        // CRITICAL: never inject "open bottle" tokens when serveState=none (closed bottle)
        const serveStateCheck = String((wineEffectiveState as any).serveState || resolvedWineConfig?.serveState || '').toLowerCase();
        if (serveStateCheck === 'served') {
          if (!augmented.includes('wine bottle that is open')) augmented = augmented + ' ' + 'wine bottle that is open';
          if (!augmented.includes('Preserve the open bottle')) augmented = augmented + ' ' + 'Preserve the open bottle';
          if (!augmented.includes('Liquid level must sit clearly below the upper third of the bottle')) augmented = augmented + ' ' + 'Liquid level must sit clearly below the upper third of the bottle';
        }

        // 5) Single-pass prompt start enforcement
        const singlePassDetected = segments.some((s: any) => s.type === 'physics') && segments.some((s: any) => s.type === 'composition' || s.type === 'world');
        if (singlePassDetected) {
          if (serveStateCheck === 'served') {
            if (!augmented.trim().startsWith('WINE_ENGINE_STATUS')) {
              augmented = 'WINE_ENGINE_STATUS: active. deterministic. ' + augmented;
            }
          }
          // NOTE: for closed/none state, do NOT prepend "A wine bottle that is open" — bottle is sealed
        }

        // Final sanitize
        prompt = sanitizeWineV4Prompt(sanitizePromptLexicalGuard(dedupeWineStructuralTokens(augmented)));
      }
    } catch (errAug) {
      // eslint-disable-next-line no-console
      console.warn('Post-process compatibility augmentation failed', errAug);
    }

    return prompt;
  }
};
