// Solo para testing estructural
import type { IndustryProfile } from '@/lib/productStudio/types';

function injectCoffeeEngine(parts: string[], _state: StudioUIState): string[] {
  return parts;
}

function validateIndustrySegments(prompt: string, industry: IndustryProfile): void {
  const wineTokens = /\b(WINE_|CLOSURE_|GLASS_|DECANTER_)/;
  const coffeeTokens = /\b(COFFEE_|STEAM_|CREMA_)/;

  if (industry !== 'wine' && wineTokens.test(prompt)) {
    throw new Error('[INDUSTRY LEAK] wine tokens detected');
  }

  if (industry !== 'coffee' && coffeeTokens.test(prompt)) {
    throw new Error('[INDUSTRY LEAK] coffee tokens detected');
  }
}

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
    buildPhotoModeDynamic(state),
    buildLighting(authority, state),
    buildMaterials(authority, state),
    buildProductPhysical(state),
    buildGeometry(authority, state),
    buildProductOrientation(state),
    buildIngredients(state),
    ...protectionLayer,
    ...buildAdvancedOverrideParts(state),
  ];
  const industry = state.industryProfile;
  let industryInjected = studioBlocks;

  switch (industry) {
    case 'supplements':
      break;
    case 'wine':
      industryInjected = injectWineEngine(industryInjected, state);
      break;
    case 'coffee':
      industryInjected = injectCoffeeEngine(industryInjected, state);
      break;
    default: {
      const neverCheck: never = industry;
      throw new Error(`[INDUSTRY UNHANDLED] ${neverCheck}`);
    }
  }

  const sanitizedParts = sanitizePromptParts(industryInjected);
  const segments: any[] = [];
  for (const part of sanitizedParts) {
    segments.push({ type: 'guardrail', content: part });
  }
  // Temporary diagnostics for isolation validation.
  // eslint-disable-next-line no-console
  console.log('[INDUSTRY ACTIVE]', state.industryProfile);
  // eslint-disable-next-line no-console
  console.log('[ACTIVE BUILDERS]', segments.map(s => s.type));
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
      buildPhotoModeDynamic(state),
      buildLighting(authority, state),
      buildMaterials(authority, state),
      buildProductPhysical(state),
      buildGeometry(authority, state),
      buildProductOrientation(state),
      buildIngredients(state),
      ...protectionLayer,
      ...buildAdvancedOverrideParts(state),
    ];
    const industry = state.industryProfile;
    let industryInjected = studioBlocks;

    switch (industry) {
      case 'supplements':
        break;
      case 'wine':
        industryInjected = injectWineEngine(industryInjected, state);
        break;
      case 'coffee':
        industryInjected = injectCoffeeEngine(industryInjected, state);
        break;
      default: {
        const neverCheck: never = industry;
        throw new Error(`[INDUSTRY UNHANDLED] ${neverCheck}`);
      }
    }

    const sanitizedParts = sanitizePromptParts(industryInjected);
    const segments: any[] = [];
    for (const part of sanitizedParts) {
      segments.push({ type: 'guardrail', content: part });
    }
    // Temporary diagnostics for isolation validation.
    // eslint-disable-next-line no-console
    console.log('[INDUSTRY ACTIVE]', state.industryProfile);
    // eslint-disable-next-line no-console
    console.log('[ACTIVE BUILDERS]', segments.map(s => s.type));
    const finalPrompt = finalizePromptFromSegments(segments, authority);
    validateIndustrySegments(finalPrompt, state.industryProfile);
    return finalPrompt;
  }
};
