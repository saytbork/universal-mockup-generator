// Solo para testing estructural
export function __buildSegmentsForTest(state: StudioUIState) {
  const authority = resolveStudioAuthority(state);
  const modifiers = getAllowedStudioModifiers(authority, state);
  const protectionLayer = buildProtectionLayer(authority, state);
  const coffeeStructuralBlock = buildCoffeeIndustryLayer(authority, state);
  const coffeeBlocks = [
    buildIntent(authority, state),
    buildWorld(authority, state.world, state),
    buildCameraOverrides(state),
    buildComposition(authority, state),
    buildMotion(authority, state),
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
  const withWineEngine = isWineReferenceCategory ? injectWineEngine(coffeeBlocks, state) : coffeeBlocks;
  const sanitizedParts = sanitizePromptParts(withWineEngine);
  const segments: any[] = [];
  segments.push({ type: 'guardrail', content: coffeeStructuralBlock });
  for (const part of sanitizedParts) {
    segments.push({ type: 'guardrail', content: part });
  }
  return segments;
}
import { buildCoffeeIndustryLayer, buildIntent, buildWorld, buildCameraOverrides, buildComposition, buildMotion, buildPhysics, buildModifiers, buildLighting, buildMaterials, buildPackaging, buildGeometry, buildAdvancedOverrideParts, buildProtectionLayer, injectWineEngine, sanitizePromptParts, finalizePromptFromSegments, resolveStudioAuthority, getAllowedStudioModifiers } from '../index';
import type { StudioUIState } from '../index';

export const coffeePipeline = {
  build(state: StudioUIState): string {
    const authority = resolveStudioAuthority(state);
    const modifiers = getAllowedStudioModifiers(authority, state);
    const protectionLayer = buildProtectionLayer(authority, state);
    const coffeeStructuralBlock = buildCoffeeIndustryLayer(authority, state);
    const coffeeBlocks = [
      buildIntent(authority, state),
      buildWorld(authority, state.world, state),
      buildCameraOverrides(state),
      buildComposition(authority, state),
      buildMotion(authority, state),
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
    const withWineEngine = isWineReferenceCategory ? injectWineEngine(coffeeBlocks, state) : coffeeBlocks;
    const sanitizedParts = sanitizePromptParts(withWineEngine);
    const segments: any[] = [];
  segments.push({ type: 'guardrail', content: coffeeStructuralBlock });
    for (const part of sanitizedParts) {
      segments.push({ type: 'guardrail', content: part });
    }
  // eslint-disable-next-line no-console
  console.log('COFFEE SEGMENTS LENGTH BEFORE FINALIZE:', segments.length);
  const finalPrompt = finalizePromptFromSegments(segments, authority);
  return finalPrompt;
  }
};
