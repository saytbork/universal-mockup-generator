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

    // EARLY EXIT FOR SERVED MODE: if wine is in served state, return the minimal
    // wine truth block immediately before any global/world/styling injection.
    try {
      const serveStateVal = String((wineEffectiveState as any).serveState || resolvedWineConfig?.serveState || '').toLowerCase();
      // Recompute bottle state / fill state from resolved config (after hard sync)
      const bottleStateVal = String((resolvedWineConfig as any).bottleState || '').toLowerCase();
      const bottleFillVal = String((resolvedWineConfig as any).bottleFillState || '').toLowerCase();
      if (String((wineEffectiveState as any).visualProfile || '').trim().toLowerCase() === 'wine' && serveStateVal === 'served') {
        // eslint-disable-next-line no-console
        console.log('[WINE SERVED MODE] early return activated');
        // STRICT PIPELINE LOG
        // Extract individual blocks from the built winePhysicsBlock and reassemble in
        // the precise order required. PHYSICAL_BASE_LOCK_V1 must be a separate
        // segment immediately after WINE_CONFIG_RESOLVED.
        const physicalBase = 'PHYSICAL_BASE_LOCK_V1: Bottle must rest on a visible physical surface. No floating objects allowed. No mid-air bottle. No mid-air glass. All objects must cast coherent contact shadows. Surface contact must be visually evident.';
        const serveObjectLock = 'SERVE_OBJECT_COHERENCE_LOCK_V1: If serveState=served: Exactly one glass allowed. Glass liquid color must match bottle liquid. Bottle liquid must be reduced accordingly. If serveState=none: No glass allowed in scene.';

        // Extract engine and config blocks
        const engineMatch = winePhysicsBlock.match(/WINE_ENGINE_STATUS:[\s\S]*?(?=WINE_CONFIG_RESOLVED|$)/i);
        const engineBlock = engineMatch ? engineMatch[0].trim() : '';

        // Construct a deterministic WINE_CONFIG_RESOLVED line from the resolved config
        const wineTypeVal = String((wineEffectiveState as any).wineType || 'auto').trim();
        const closureTypeVal = String((resolvedWineConfig as any).closureType || 'from-reference').trim();
        const bottleStateValForced = String((resolvedWineConfig as any).bottleState || 'open').trim();
        const serveStateValForced = String((resolvedWineConfig as any).serveState || '').trim();
        const bottleFillValForced = String((resolvedWineConfig as any).bottleFillState || '').trim();
        const carbonationVal = String((wineEffectiveState as any).carbonationLevel || 'none').trim();

        const configBlock = `WINE_CONFIG_RESOLVED: wineType=${wineTypeVal}; closureType=${closureTypeVal}; bottleState=${bottleStateValForced}; serveState=${serveStateValForced}; bottleFillState=${bottleFillValForced}; carbonationLevel=${carbonationVal};`;

        // Immediately validate that the forced serveState was applied in the resolved config
        if (serveStateValForced !== 'served') {
          throw new Error('WINE_CONFIG_RESOLVED missing forced serveState');
        }

        // Extract remaining known blocks
        const serveVolumeMatch = winePhysicsBlock.match(/SERVE_VOLUME_CONSERVATION_LOCK_V3:[\s\S]*?(?=(CROWN_CAP_REMOVAL_LOCK_V3|CLOSURE_LOCK_STRICT_V1|WINE_STRUCTURAL_LOCK_V3|GEOMETRY_LOCK|WINE_COLOR_LOCK|$))/i);
        const closureMatch = winePhysicsBlock.match(/(CROWN_CAP_REMOVAL_LOCK_V3:|CLOSURE_LOCK_STRICT_V1:)[\s\S]*?(?=(WINE_STRUCTURAL_LOCK_V3|GEOMETRY_LOCK|WINE_COLOR_LOCK|$))/i);
        const structuralMatch = winePhysicsBlock.match(/WINE_STRUCTURAL_LOCK_V3:[\s\S]*?(?=(GEOMETRY_LOCK|WINE_COLOR_LOCK|$))/i);
        const geometryMatch = winePhysicsBlock.match(/GEOMETRY_LOCK:[\s\S]*?(?=(WINE_COLOR_LOCK|$))/i);
        const colorMatch = winePhysicsBlock.match(/WINE_COLOR_LOCK:[\s\S]*$/i);

        const parts: string[] = [];
        if (engineBlock) parts.push(engineBlock);
        parts.push(configBlock);
        // Append PHYSICAL_BASE_LOCK_V1 as its own block
        parts.push(physicalBase);
        if (serveVolumeMatch) parts.push(serveVolumeMatch[0].trim());
        // Followed by serve object coherence lock
        parts.push(serveObjectLock);
        if (closureMatch) parts.push(closureMatch[0].trim());
        if (structuralMatch) parts.push(structuralMatch[0].trim());
        if (geometryMatch) parts.push(geometryMatch[0].trim());
        if (colorMatch) parts.push(colorMatch[0].trim());

        const assembled = parts.filter(Boolean).join(' ');

        // Hard validation: ensure no world/styling tokens present
        const forbidden = [
          'WINE_ENVIRONMENT',
          'PHOTO_MODE',
          'PACKAGING',
          'ADVANCED_CONTROLS',
          'COMPOSITION'
        ];
        const assembledSan = sanitizePromptLexicalGuard(dedupeWineStructuralTokens(assembled));
        for (const token of forbidden) {
          if (assembledSan.includes(token)) {
            // eslint-disable-next-line no-console
            console.error('[WINE SERVED STRICT PIPELINE ACTIVE] contamination detected', token);
            throw new Error('Wine served pipeline contamination detected');
          }
        }

        // eslint-disable-next-line no-console
        console.log('[WINE SERVED STRICT PIPELINE ACTIVE]');

        const final = sanitizeWineV4Prompt(assembledSan);
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
