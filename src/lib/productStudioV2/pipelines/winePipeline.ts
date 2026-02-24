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
