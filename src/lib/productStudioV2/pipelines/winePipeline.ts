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
  segments.push({ type: 'world', content: hasWineEnvironment ? buildWineLighting() : buildLighting(resolveStudioAuthority(wineEffectiveState), state) });
  segments.push({ type: 'guardrail', content: buildWineMaterials() });
  segments.push({ type: 'guardrail', content: buildWineModifiers(wineEffectiveState) });
  segments.push({ type: 'guardrail', content: buildWineMinimalGuardrail() });
  return segments;
}
import { applyWineDeterministicStateMachine, resolveDeterministicWineConfig, resolveWineEngineVersion, buildWineTruthLayerV4, buildWineTruthLayer, buildWineEnvironment, buildWineLighting, buildWorld, buildLighting, buildWineMaterials, buildWineModifiers, buildWineMinimalGuardrail, sanitizeWineV4Prompt, dedupeWineStructuralTokens, sanitizePromptLexicalGuard, finalizePromptFromSegments, buildIntent, buildCameraOverrides, buildComposition, resolveStudioAuthority } from '../index';
import type { StudioUIState } from '../index';

export const winePipeline = {
  build(state: StudioUIState): string {
    const wineEffectiveState = applyWineDeterministicStateMachine(state);
    const resolvedWineConfig = resolveDeterministicWineConfig(wineEffectiveState);
    const wineEngineVersion = resolveWineEngineVersion(wineEffectiveState);
    const hasWineEnvironment = Boolean(String(state.wineEnvironmentVariation || '').trim());
    const segments: any[] = [];
  segments.push({ type: 'guardrail', content: buildIntent(resolveStudioAuthority(wineEffectiveState), state) });
    let winePhysicsBlock = wineEngineVersion >= 4
      ? buildWineTruthLayerV4(wineEffectiveState, resolvedWineConfig)
      : buildWineTruthLayer(wineEffectiveState, resolvedWineConfig);

    // EARLY EXIT FOR SERVED MODE: if wine is in served state, return the minimal
    // wine truth block immediately before any global/world/styling injection.
    try {
      const serveStateVal = String((wineEffectiveState as any).serveState || resolvedWineConfig?.serveState || '').toLowerCase();
      if (String((wineEffectiveState as any).visualProfile || '').trim().toLowerCase() === 'wine' && serveStateVal === 'served') {
        // eslint-disable-next-line no-console
        console.log('[WINE SERVED MODE] early return activated');
        // STRICT PIPELINE LOG
        // Build augmented wine physics block with enforced base/serve object coherence locks
        let augmented = winePhysicsBlock;

        // Insert PHYSICAL_BASE_LOCK_V1 immediately after WINE_CONFIG_RESOLVED
        const physicalBase = 'PHYSICAL_BASE_LOCK_V1: Bottle must rest on a visible physical surface. No floating objects allowed. No mid-air bottle. No mid-air glass. All objects must cast coherent contact shadows. Surface contact must be visually evident.';
        augmented = augmented.replace(/(WINE_CONFIG_RESOLVED:[^;]*;)/, `$1 ${physicalBase}`);

        // Insert SERVE_OBJECT_COHERENCE_LOCK_V1 after SERVE_VOLUME_CONSERVATION_LOCK_V3
        const serveObjectLock = 'SERVE_OBJECT_COHERENCE_LOCK_V1: If serveState=served: Exactly one glass allowed. Glass liquid color must match bottle liquid. Bottle liquid must be reduced accordingly. If serveState=none: No glass allowed in scene.';
        augmented = augmented.replace(/(SERVE_VOLUME_CONSERVATION_LOCK_V3:[^.]*(?:\.|$))/s, `$1 ${serveObjectLock}`);

        // Hard validation: ensure no world/styling tokens present
        const forbidden = [
          'WINE_ENVIRONMENT',
          'PHOTO_MODE',
          'PACKAGING',
          'ADVANCED_CONTROLS',
          'COMPOSITION'
        ];
        const augmentedSan = sanitizePromptLexicalGuard(dedupeWineStructuralTokens(augmented));
        for (const token of forbidden) {
          if (augmentedSan.includes(token)) {
            // eslint-disable-next-line no-console
            console.error('[WINE SERVED STRICT PIPELINE ACTIVE] contamination detected', token);
            throw new Error('Wine served pipeline contamination detected');
          }
        }

        // eslint-disable-next-line no-console
        console.log('[WINE SERVED STRICT PIPELINE ACTIVE]');

        const final = sanitizeWineV4Prompt(augmentedSan);
        return final;
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[WINE SERVED MODE] early return detection error', err);
      throw err;
    }

    // Removed conditional appending of 'Bottle perfectly vertical...' for strict segment equality
    segments.push({ type: 'physics', content: winePhysicsBlock });
  segments.push({ type: 'camera', content: buildCameraOverrides(wineEffectiveState) });
  segments.push({ type: 'composition', content: buildComposition(resolveStudioAuthority(wineEffectiveState), state) });
  segments.push({ type: 'world', content: hasWineEnvironment ? buildWineEnvironment(wineEffectiveState) : buildWorld(resolveStudioAuthority(wineEffectiveState), wineEffectiveState.world, state) });
  segments.push({ type: 'world', content: hasWineEnvironment ? buildWineLighting() : buildLighting(resolveStudioAuthority(wineEffectiveState), state) });
  segments.push({ type: 'guardrail', content: buildWineMaterials() });
  segments.push({ type: 'guardrail', content: buildWineModifiers(wineEffectiveState) });
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
