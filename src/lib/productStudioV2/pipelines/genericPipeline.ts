// Solo para testing estructural
export function __buildSegmentsForTest(state: StudioUIState) {
  const authority = resolveStudioAuthority(state);
  const modifiers = getAllowedStudioModifiers(authority, state);
  const protectionLayer = buildProtectionLayer(authority, state);
  const studioBlocks = [
    buildIntent(authority, state),
    buildArtworkImmutability(),
    buildWorld(authority, state.world, state),
    buildCameraOverrides(state),
    buildComposition(authority, state),
    buildMotion(authority, state),
    buildInteraction(authority, state),
    buildPhysics(authority, state),
    buildModifiers(modifiers, state),
    buildLighting(authority, state),
    buildMaterials(authority, state),
    buildPackaging(state),
    buildGeometry(authority, state),
    ...protectionLayer,
    ...buildAdvancedOverrideParts(state),
  ];
  const isWineReferenceCategory = String((state as any).referenceProductCategory || '').trim().toLowerCase() === 'wine';
  const withWineEngine = isWineReferenceCategory ? injectWineEngine(studioBlocks, state) : studioBlocks;
  const sanitizedParts = sanitizePromptParts(withWineEngine);
  const segments: any[] = [];
  for (const part of sanitizedParts) {
    segments.push({ type: 'guardrail', content: part });
  }
  return segments;
}
import { buildArtworkImmutability, buildIntent, buildWorld, buildCameraOverrides, buildComposition, buildMotion, buildInteraction, buildPhysics, buildModifiers, buildLighting, buildMaterials, buildPackaging, buildGeometry, buildAdvancedOverrideParts, buildProtectionLayer, injectWineEngine, sanitizePromptParts, finalizePromptFromSegments, resolveStudioAuthority, getAllowedStudioModifiers } from '../index';
import type { StudioUIState } from '../index';

export const genericPipeline = {
  build(state: StudioUIState): string {
    const authority = resolveStudioAuthority(state);
    const modifiers = getAllowedStudioModifiers(authority, state);
    const protectionLayer = buildProtectionLayer(authority, state);
    const studioBlocks = [
      buildIntent(authority, state),
      buildArtworkImmutability(),
      buildWorld(authority, state.world, state),
      buildCameraOverrides(state),
      buildComposition(authority, state),
      buildMotion(authority, state),
      buildInteraction(authority, state),
      buildPhysics(authority, state),
      buildModifiers(modifiers, state),
      buildLighting(authority, state),
      buildMaterials(authority, state),
      buildPackaging(state),
      buildGeometry(authority, state),
      ...protectionLayer,
      ...buildAdvancedOverrideParts(state),
    ];
    const isWineReferenceCategory = String((state as any).referenceProductCategory || '').trim().toLowerCase() === 'wine';
    const withWineEngine = isWineReferenceCategory ? injectWineEngine(studioBlocks, state) : studioBlocks;
    const sanitizedParts = sanitizePromptParts(withWineEngine);
    const segments: any[] = [];
    for (const part of sanitizedParts) {
      segments.push({ type: 'guardrail', content: part });
    }
  // eslint-disable-next-line no-console
  console.log('GENERIC SEGMENTS LENGTH BEFORE FINALIZE:', segments.length);
  // eslint-disable-next-line no-console
  console.log('MODULAR AUTHORITY:', JSON.stringify(authority));
  // eslint-disable-next-line no-console
  console.log('MODULAR SEGMENTS STRUCTURE:', JSON.stringify(segments, null, 2));
  const finalPrompt = finalizePromptFromSegments(segments, authority);
  // eslint-disable-next-line no-console
  console.log('MODULAR FINALIZE RESULT LENGTH:', finalPrompt.length);
  return finalPrompt;
  }
};
