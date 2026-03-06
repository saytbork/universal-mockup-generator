import {
  buildPalette,
  buildArtworkImmutability,
  buildIntent,
  buildWorld,
  buildCameraOverrides,
  buildComposition,
  buildMotion,
  buildInteraction,
  buildPhysics,
  buildModifiers,
  buildPhotoModeDynamic,
  buildLighting,
  buildMaterials,
  buildProductPhysical,
  buildGeometry,
  buildIngredients,
  buildAdvancedOverrideParts,
  buildProtectionLayer,
  sanitizePromptParts,
  finalizePromptFromSegments,
  resolveStudioAuthority,
  getAllowedStudioModifiers,
  buildProductOrientation,
} from '../index';
import type { StudioUIState } from '../index';
import { resolveIndustryProfileModule } from '../industryProfiles/registry';

function buildIndustrySegments(state: StudioUIState, base: string[]): string[] {
  const profile = resolveIndustryProfileModule(state.industryProfile);
  return [...base, ...profile.truthLayer(state), ...profile.compositionRules(state)];
}

function finalizeWithIndustryValidation(prompt: string, state: StudioUIState): string {
  const profile = resolveIndustryProfileModule(state.industryProfile);
  const sanitized = profile.sanitizePrompt ? profile.sanitizePrompt(prompt) : prompt;
  if (profile.validatePrompt) profile.validatePrompt(sanitized);
  return sanitized;
}

export function __buildSegmentsForTest(state: StudioUIState) {
  const authority = resolveStudioAuthority(state);
  const modifiers = getAllowedStudioModifiers(authority, state);
  const protectionLayer = buildProtectionLayer(authority, state);
  const profile = resolveIndustryProfileModule(state.industryProfile);

  const studioBlocks = [
    buildPalette(state),
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
    buildProductPhysical(state, profile),
    buildGeometry(authority, state),
    buildProductOrientation(state),
    buildIngredients(state),
    ...protectionLayer,
    ...buildAdvancedOverrideParts(state),
  ];

  const industryInjected = buildIndustrySegments(state, studioBlocks);
  const sanitizedParts = sanitizePromptParts(industryInjected);
  const segments: any[] = [];

  for (const part of sanitizedParts) {
    segments.push({ type: 'guardrail', content: part });
  }

  // eslint-disable-next-line no-console
  console.log('[INDUSTRY ACTIVE]', state.industryProfile);
  // eslint-disable-next-line no-console
  console.log('[ACTIVE BUILDERS]', segments.map((s) => s.type));
  return segments;
}

export const genericPipeline = {
  build(state: StudioUIState): string {
    const authority = resolveStudioAuthority(state);
    const modifiers = getAllowedStudioModifiers(authority, state);
    const protectionLayer = buildProtectionLayer(authority, state);
    const profile = resolveIndustryProfileModule(state.industryProfile);

    const studioBlocks = [
      buildPalette(state),
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
      buildProductPhysical(state, profile),
      buildGeometry(authority, state),
      buildProductOrientation(state),
      buildIngredients(state),
      ...protectionLayer,
      ...buildAdvancedOverrideParts(state),
    ];

    const industryInjected = buildIndustrySegments(state, studioBlocks);
    const sanitizedParts = sanitizePromptParts(industryInjected);
    const segments: any[] = [];

    for (const part of sanitizedParts) {
      segments.push({ type: 'guardrail', content: part });
    }

    // eslint-disable-next-line no-console
    console.log('[INDUSTRY ACTIVE]', state.industryProfile);
    // eslint-disable-next-line no-console
    console.log('[ACTIVE BUILDERS]', segments.map((s) => s.type));

    const finalPrompt = finalizePromptFromSegments(segments, authority);
    return finalizeWithIndustryValidation(finalPrompt, state);
  },
};
