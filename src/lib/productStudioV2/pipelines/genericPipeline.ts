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

function resolveEnvironment(state: StudioUIState): string | null {
  const s = state as StudioUIState & {
    environment?: string;
    environmentPreset?: string;
    environmentMode?: string;
  };
  return (
    String(s.environment || '').trim() ||
    String(s.environmentPreset || '').trim() ||
    String(s.environmentMode || '').trim() ||
    String(s.contextPresetValue || '').trim() ||
    null
  );
}

function resolveLighting(state: StudioUIState): string | null {
  const s = state as StudioUIState & {
    lighting?: string;
    lightingPreset?: string;
    lightingMode?: string;
  };
  return (
    String(s.basicLighting || '').trim() ||
    String(s.lighting || '').trim() ||
    String(s.lightingPreset || '').trim() ||
    String(s.lightingMode || '').trim() ||
    null
  );
}

function buildEnvironmentBlock(environment: string): string {
  const raw = String(environment || '').trim();
  const normalized = raw.toLowerCase();
  if (normalized.includes('bathroom') && normalized.includes('vanity')) {
    return [
      'ENVIRONMENT_CONTEXT: luxury bathroom vanity.',
      'SURFACE_MATERIAL: marble sink.',
      'AMBIENT_CONTEXT: premium cosmetic bathroom interior.',
    ].join(' ');
  }
  return `ENVIRONMENT_CONTEXT: ${raw}.`;
}

function buildLightingBlock(lighting: string): string {
  const raw = String(lighting || '').trim();
  const normalized = raw.toLowerCase();
  if (normalized === 'sunny day' || normalized === 'natural-light' || normalized === 'natural light') {
    return [
      'LIGHTING_PROFILE: sunny day window light.',
      'LIGHT_DIRECTION: natural side illumination.',
      'SHADOW_STYLE: soft daylight shadows.',
    ].join(' ');
  }
  return `LIGHTING_PROFILE: ${raw}.`;
}

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
  const environment = resolveEnvironment(state);
  const lighting = resolveLighting(state);
  // eslint-disable-next-line no-console
  console.log('[STUDIO V2 STATE]', {
    ...state,
    environment: (state as any).environment,
    environmentPreset: (state as any).environmentPreset,
    lighting: (state as any).lighting,
    lightingPreset: (state as any).lightingPreset,
  });
  // eslint-disable-next-line no-console
  console.log('[ENVIRONMENT RESOLVED]', environment || '');
  // eslint-disable-next-line no-console
  console.log('[LIGHTING RESOLVED]', lighting || '');

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
    ...(environment ? [buildEnvironmentBlock(environment)] : []),
    ...(lighting ? [buildLightingBlock(lighting)] : []),
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
  // eslint-disable-next-line no-console
  console.log('[PROMPT PARTS COUNT]', sanitizedParts.length);
  return segments;
}

export const genericPipeline = {
  build(state: StudioUIState): string {
    const authority = resolveStudioAuthority(state);
    const modifiers = getAllowedStudioModifiers(authority, state);
    const protectionLayer = buildProtectionLayer(authority, state);
    const profile = resolveIndustryProfileModule(state.industryProfile);
    const environment = resolveEnvironment(state);
    const lighting = resolveLighting(state);
    // eslint-disable-next-line no-console
    console.log('[STUDIO V2 STATE]', {
      ...state,
      environment: (state as any).environment,
      environmentPreset: (state as any).environmentPreset,
      lighting: (state as any).lighting,
      lightingPreset: (state as any).lightingPreset,
    });
    // eslint-disable-next-line no-console
    console.log('[ENVIRONMENT RESOLVED]', environment || '');
    // eslint-disable-next-line no-console
    console.log('[LIGHTING RESOLVED]', lighting || '');

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
      ...(environment ? [buildEnvironmentBlock(environment)] : []),
      ...(lighting ? [buildLightingBlock(lighting)] : []),
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
    // eslint-disable-next-line no-console
    console.log('[PROMPT PARTS COUNT]', sanitizedParts.length);

    const finalPrompt = finalizePromptFromSegments(segments, authority);
    return finalizeWithIndustryValidation(finalPrompt, state);
  },
};
