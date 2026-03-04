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
    buildProductPhysical(state),
    buildPhotoModeDynamic(state),
    buildGeometry(authority, state),
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
import { buildArtworkImmutability, buildIntent, buildWorld, buildCameraOverrides, buildComposition, buildMotion, buildInteraction, buildPhysics, buildModifiers, buildLighting, buildMaterials, buildPackaging, buildPhotoModeDynamic, buildProductPhysical, buildGeometry, buildIngredients, buildAdvancedOverrideParts, buildProtectionLayer, injectWineEngine, sanitizePromptParts, finalizePromptFromSegments, resolveStudioAuthority, getAllowedStudioModifiers } from '../index';
import type { StudioUIState } from '../index';

export const genericPipeline = {
  build(state: StudioUIState): string {
    const authority = resolveStudioAuthority(state);
    const modifiers = getAllowedStudioModifiers(authority, state);
    const protectionLayer = buildProtectionLayer(authority, state);
    // eslint-disable-next-line no-console
    console.log('[DEBUG][genericPipeline] PRE-buildWorld state snapshot:', JSON.stringify({
      photoMode: state.photoMode,
      photoModeConfig: (state as any).photoModeConfig,
      heroLandingPage: (state as any).photoModeConfig?.heroLandingPage,
      backgroundColor: (state as any).backgroundColor,
      gradientEnabled: (state as any).gradientEnabled,
      gradientStart: (state as any).gradientStart,
      gradientEnd: (state as any).gradientEnd,
      gradientMid: (state as any).gradientMid,
      gradientAngle: (state as any).gradientAngle,
      brandPalette: (state as any).brandPalette,
      extractedProductColors: (state as any).extractedProductColors,
    }));
    // eslint-disable-next-line no-console
    console.log('[DEBUG][genericPipeline] CALL ORDER: buildWorld → buildPhotoModeDynamic → buildLighting');
    const studioBlocks = [
      buildIntent(authority, state),
      buildArtworkImmutability(),
      ((): string => { /* eslint-disable-next-line no-console */ console.log('[DEBUG][genericPipeline] EXECUTING: buildWorld'); return buildWorld(authority, state.world, state); })(),
      buildCameraOverrides(state),
      buildComposition(authority, state),
      buildMotion(authority, state),
      buildInteraction(authority, state),
      buildPhysics(authority, state),
      buildModifiers(modifiers, state),
      ((): string => { /* eslint-disable-next-line no-console */ console.log('[DEBUG][genericPipeline] EXECUTING: buildLighting'); return buildLighting(authority, state); })(),
      buildMaterials(authority, state),
      buildProductPhysical(state),
      ((): string => { /* eslint-disable-next-line no-console */ console.log('[DEBUG][genericPipeline] EXECUTING: buildPhotoModeDynamic'); const r = buildPhotoModeDynamic(state); /* eslint-disable-next-line no-console */ console.log('[DEBUG][genericPipeline] buildPhotoModeDynamic emitted:', JSON.stringify(r)); return r; })(),
      buildGeometry(authority, state),
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
