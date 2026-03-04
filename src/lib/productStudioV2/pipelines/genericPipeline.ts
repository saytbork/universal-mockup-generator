// Solo para testing estructural
export function __buildSegmentsForTest(state: StudioUIState) {
  const authority = resolveStudioAuthority(state);
  const modifiers = getAllowedStudioModifiers(authority, state);
  const protectionLayer = buildProtectionLayer(authority, state);
  const studioBlocks = [
    buildPalette(state),                        // ← first: resolves state.resolvedPalette
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
    buildProductPhysical(state),
    buildPhotoModeDynamic(state),
    buildGeometry(authority, state),
    buildProductOrientation(state),
    buildIngredients(state),
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
import { buildPalette, buildArtworkImmutability, buildIntent, buildWorld, buildCameraOverrides, buildComposition, buildMotion, buildInteraction, buildPhysics, buildModifiers, buildLighting, buildMaterials, buildPackaging, buildPhotoModeDynamic, buildProductPhysical, buildGeometry, buildIngredients, buildAdvancedOverrideParts, buildProtectionLayer, injectWineEngine, sanitizePromptParts, finalizePromptFromSegments, resolveStudioAuthority, getAllowedStudioModifiers, buildProductOrientation } from '../index';
import type { StudioUIState } from '../index';

export const genericPipeline = {
  build(state: StudioUIState): string {
    const authority = resolveStudioAuthority(state);
    const modifiers = getAllowedStudioModifiers(authority, state);
    const protectionLayer = buildProtectionLayer(authority, state);
    const studioBlocks = [
      buildPalette(state),                      // ← first: resolves state.resolvedPalette
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
      buildProductPhysical(state),
      buildPhotoModeDynamic(state),
      buildGeometry(authority, state),
      buildProductOrientation(state),
      buildIngredients(state),
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
    const finalPrompt = finalizePromptFromSegments(segments, authority);
    return finalPrompt;
  }
};
