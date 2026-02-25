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
        // Sanitize similarly to the normal finalize path but return only the wine physics block.
        const final = sanitizeWineV4Prompt(sanitizePromptLexicalGuard(dedupeWineStructuralTokens(winePhysicsBlock)));
        return final;
      }
    } catch (err) {
      // non-fatal — fall through to normal behavior
      // eslint-disable-next-line no-console
      console.error('[WINE SERVED MODE] early return detection error', err);
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
