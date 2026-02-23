import { resolveStudioAuthority } from './authority/studioAuthorityResolver.ts';
import { getAllowedStudioModifiers } from './modifiers/studioModifierRegistry.ts';
import { buildIntent } from './builders/buildIntent.ts';
import { buildWorld } from './builders/buildWorld.ts';
import { buildCoffeeIndustryLayer } from './builders/buildCoffeeIndustryLayer.ts';
import { buildComposition } from './builders/buildComposition.ts';
import { buildCameraOverrides } from './builders/buildCameraOverrides.ts';
import { buildMotion } from './builders/buildMotion.ts';
import { buildPhysics } from './builders/buildPhysics.ts';
import { buildModifiers } from './builders/buildModifiers.ts';
import { buildLighting } from './builders/buildLighting.ts';
import { buildMaterials } from './builders/buildMaterials.ts';
import { buildPackaging } from './builders/buildPackaging.ts';
import { buildUltraReal } from './builders/buildUltraReal.ts';
import { buildGeometry } from './builders/buildGeometry.ts';
import { assembleStudioPrompt } from './assembler/studioAssembler.ts';
import { validateStudioPrompt } from './assembler/studioValidator.ts';
import {
  buildWineTruthLayer,
  type ResolvedWineConfig,
} from './wineConfigResolver.ts';
import type { StudioAuthorityBundle, StudioUIState } from './types/studioTypes.ts';

const STRICT_GUARDRAILS = import.meta.env.VITE_STRICT_GUARDRAILS === 'true';

type PromptSegmentType =
  | 'physics'
  | 'world'
  | 'camera'
  | 'composition'
  | 'interaction'
  | 'guardrail'
  | 'output';

type PromptSegment = {
  type: PromptSegmentType;
  content: string;
};

const FORBIDDEN_TERMS = ['body', 'face'];

function buildProtectionLayer(authority: StudioAuthorityBundle, state?: StudioUIState): string[] {
  const isWineIndustry = String(state?.visualProfile || '').trim().toLowerCase() === 'wine';
  if (!STRICT_GUARDRAILS && !isWineIndustry) return [];
  return [buildUltraReal(authority)];
}

function sanitizePromptLexicalGuard(prompt: string): string {
  let next = String(prompt || '');
  for (const term of FORBIDDEN_TERMS) {
    const regex = new RegExp(`\\b${term}\\b`, 'gi');
    next = next.replace(regex, '');
  }
  return next.replace(/\s{2,}/g, ' ').trim();
}

function dedupeWineStructuralTokens(prompt: string): string {
  let next = String(prompt || '');
  const dropOncePrefixes = ['ROTATION:', 'FRAMING:'];
  for (const prefix of dropOncePrefixes) {
    const pattern = new RegExp(`${prefix}\\s*[^.]*\\.`, 'gi');
    next = next.replace(pattern, '');
  }

  const keepLastPrefixes = [
    'FRAME_EDGE_POLICY:',
    'WINE_WORLD_AUTHORITY:',
    'WINE_ENVIRONMENT_PRESET:',
    'WORLD_OVERRIDE_MODE:',
    'INVALIDATE_PREVIOUS_WORLD_TOKENS:',
  ];
  for (const prefix of keepLastPrefixes) {
    const escaped = prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`${escaped}\\s*[^.]*\\.`, 'g');
    const matches = next.match(pattern);
    if (!matches || matches.length < 2) continue;
    let seen = 0;
    const keepIndex = matches.length - 1;
    next = next.replace(pattern, (match) => {
      const keep = seen === keepIndex ? match : '';
      seen += 1;
      return keep;
    });
  }
  return next.replace(/\s{2,}/g, ' ').trim();
}

function pushSegment(segments: PromptSegment[], type: PromptSegmentType, content: string): void {
  const normalized = String(content || '').trim();
  if (!normalized) return;
  segments.push({ type, content: normalized });
}

function validateHumanPolicy(interactionLayer: string): void {
  const interaction = String(interactionLayer || '').trim().toLowerCase();
  if (!interaction) return;

  const forbiddenTerms = [
    'person',
    'people',
    'human',
    'model',
    'face',
    'body',
    'torso',
    'full figure',
    'woman',
    'man',
    'girl',
    'boy',
    'selfie',
    'ugc',
    'lifestyle',
  ];

  for (const term of forbiddenTerms) {
    const regex = new RegExp(`\\b${term.replace(/\s+/g, '\\s+')}\\b`, 'i');
    if (regex.test(interaction)) {
      throw new Error(`Studio interaction policy rejected forbidden human term: "${term}"`);
    }
  }
}

function finalizePromptFromSegments(
  segments: PromptSegment[],
  authority: StudioAuthorityBundle
): string {
  const interactionLayer = segments
    .filter((segment) => segment.type === 'interaction')
    .map((segment) => segment.content)
    .join(' ');
  validateHumanPolicy(interactionLayer);

  const contents = segments.map((segment) => segment.content).filter(Boolean);

  const validationPrompt = assembleStudioPrompt(contents);
  const sanitizedValidationPrompt = sanitizeFinalPromptOutput(validationPrompt);
  validateStudioPrompt(sanitizedValidationPrompt, authority);

  const finalPrompt = contents.join(' ').replace(/\s{2,}/g, ' ').trim();
  return sanitizeFinalPromptOutput(finalPrompt);
}

function injectWineEngine(parts: string[], state: StudioUIState): string[] {
  const next = [...parts];
  next.push('LIQUID_ENGINE: active');
  // Avoid forbidden term "model" in Product Studio prompts.
  next.push('LIQUID_PHYSICS_SYSTEM: deterministic');

  const wineAction = String(state.wineAction || '').trim().toLowerCase();
  if (wineAction === 'controlled-pour' || wineAction === 'controlled pour') {
    next.push('LIQUID_FLOW: gravitational arc');
    next.push('GLASS_VOLUME_CONSERVATION: enforced');
    next.push('MENISCUS: visible');
    next.push('HEADSPACE: realistic');
  }

  const glassMode = String((state as any).wineGlassMode || '').trim().toLowerCase();
  if (glassMode === 'filled') {
    next.push('GLASS_LIQUID_SYNC: bottle-consistent');
  }

  const closureType = String((state as any).wineClosureType || '').trim().toLowerCase();
  if (closureType && closureType !== 'from-reference' && closureType !== 'from reference') {
    next.push('CAP_PRESERVATION: strict');
  }

  return next;
}

function buildAdvancedOverrideParts(state: StudioUIState): string[] {
  const lensOverride = String(state.lensOverride || '').trim();
  const lightingRigOverride = String(state.lightingRigOverride || '').trim();
  const finishOverride = String(state.finishOverride || '').trim();
  const gelColor = String(state.customLightColor || '').trim().toUpperCase();
  const gelIntensity = Number(state.accentLightIntensity ?? 50);
  const hasAccentGel = Boolean(gelColor && gelColor !== '#FFFFFF' && /^#[0-9A-F]{6}$/.test(gelColor));
  const advancedOverrideActive = Boolean(
    state.advancedControls && (lensOverride || lightingRigOverride || finishOverride || hasAccentGel)
  );

  console.log('[ADVANCED_OVERRIDE_ACTIVE]', advancedOverrideActive);
  if (!advancedOverrideActive) {
    console.log('[RESOLVED_LENS]', '');
    console.log('[RESOLVED_LIGHTING]', '');
    console.log('[RESOLVED_FINISH]', '');
    return [];
  }

  let resolvedLens = '';
  let resolvedLighting = '';
  let resolvedFinish = '';

  if (lensOverride) {
    resolvedLens = lensOverride;
  }

  if (lightingRigOverride) {
    resolvedLighting = lightingRigOverride;
  }

  if (finishOverride) {
    resolvedFinish = finishOverride;
  }

  const advancedParts: string[] = [];
  if (resolvedLens) {
    advancedParts.push(`LENS_PROFILE: ${resolvedLens}.`);
  }
  if (resolvedLighting) {
    advancedParts.push(`STUDIO_LIGHTING_PROFILE: ${resolvedLighting}.`);
  }
  if (hasAccentGel && resolvedLighting && !/\bnatural-light\b/i.test(resolvedLighting)) {
    advancedParts.push(`ACCENT_LIGHT_GEL: ${gelColor} at ${gelIntensity}% attached to resolved lighting.`);
  }
  if (resolvedFinish) {
    advancedParts.push(`STUDIO_FINISH_PROFILE: ${resolvedFinish}.`);
  }

  const forbiddenKeys = new Set([
    'STUDIO_WORLD',
    'STUDIO_VISUAL_INTENT',
    'WINE_TYPE',
    'WINE_LIQUID_PHYSICS',
    'WINE_ENVIRONMENT_VARIATION',
    'WINE_ENVIRONMENT_CONTEXT',
  ]);
  for (const part of advancedParts) {
    const key = getPartKey(part);
    if (forbiddenKeys.has(key)) {
      throw new Error(`[ADVANCED_OVERRIDE_INVALID] Advanced overrides cannot inject ${key}`);
    }
  }

  console.log('[RESOLVED_LENS]', resolvedLens);
  console.log('[RESOLVED_LIGHTING]', resolvedLighting);
  console.log('[RESOLVED_FINISH]', resolvedFinish);

  return advancedParts;
}

function getPartKey(part: string): string {
  const idx = part.indexOf(':');
  if (idx <= 0) return part.trim().slice(0, 48);
  return part.slice(0, idx).trim().toUpperCase();
}

function countEnvironmentBlocks(parts: string[]): number {
  return parts.filter((part) => {
    const key = getPartKey(part);
    return key === 'STUDIO_WORLD' || key === 'WINE_ENVIRONMENT_VARIATION' || key === 'WINE_ENVIRONMENT_CONTEXT';
  }).length;
}

function sanitizePromptParts(parts: string[]): string[] {
  const output: string[] = [];
  const seen = new Set<string>();

  for (const raw of parts) {
    const part = String(raw || '').trim();
    if (!part) continue;
    const key = getPartKey(part);

    const dedupeKey = key || part;
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);
    output.push(part);
  }

  if (countEnvironmentBlocks(output) > 1) {
    throw new Error('Multiple environment injectors detected');
  }

  return output;
}

function sanitizeFinalPromptOutput(finalPrompt: string): string {
  const sanitized = finalPrompt.replace(/\bidentity\b/gi, 'integrity');
  if (/\bidentity\b/i.test(sanitized)) {
    console.error('[PROMPT SANITIZATION ERROR] identity token still present after replacement');
    throw new Error('Prompt output still contains forbidden token: identity');
  }
  return sanitized;
}

function normalizeWineValue(value: unknown): string {
  return String(value || '').trim().toLowerCase();
}

function resolveWineGlassFillLevel(state: StudioUIState): ResolvedWineConfig['glassFillLevel'] {
  const amount = normalizeWineValue((state as StudioUIState & { wineServeAmount?: string }).wineServeAmount);
  if (amount === 'taste') return 'quarter';
  if (amount === 'generous') return 'three-quarters';
  if (normalizeWineValue(state.wineGlassMode) === 'filled') return 'half';
  return 'none';
}

function resolveWineClosureType(state: StudioUIState): string {
  const normalized = normalizeWineValue(state.wineClosureType);
  if (!normalized || normalized === 'from-reference' || normalized === 'from reference') return 'from-reference';
  if (normalized.includes('crown')) return 'crown-cap';
  if (normalized.includes('screw')) return 'screw-cap';
  if (normalized.includes('synthetic')) return 'synthetic-closure';
  if (normalized.includes('cork')) return 'natural-cork';
  return 'from-reference';
}

function resolveDeterministicWineConfig(state: StudioUIState): ResolvedWineConfig {
  const bottleState = normalizeWineValue(state.wineBottleState) === 'sealed' ? 'sealed' : 'open';
  const glassMode = normalizeWineValue(state.wineGlassMode);
  const glassFillLevel =
    bottleState === 'sealed'
      ? 'none'
      : glassMode === 'none'
        ? 'none'
        : resolveWineGlassFillLevel(state);

  return {
    closureType: resolveWineClosureType(state),
    bottleState,
    glassFillLevel,
  };
}

function applyWineDeterministicStateMachine(state: StudioUIState): StudioUIState {
  const config = resolveDeterministicWineConfig(state);
  const wineBottleState = config.bottleState === 'sealed' ? 'sealed' : 'opened-with-cork-nearby';
  const wineGlassMode =
    config.glassFillLevel === 'none'
      ? normalizeWineValue(state.wineGlassMode) === 'none'
        ? 'none'
        : 'empty'
      : 'filled';

  return {
    ...state,
    wineBottleState,
    wineGlassMode,
  };
}

function buildWineWorldOverride(state: StudioUIState): string {
  const preset = String(state.wineEnvironmentVariation || '').trim();

  if (!preset) {
    return '';
  }

  return [
    'WINE_WORLD_AUTHORITY: absolute.',
    `WINE_ENVIRONMENT_PRESET: ${preset}.`,
    'WORLD_OVERRIDE_MODE: HARD_REPLACEMENT.',
    'INVALIDATE_PREVIOUS_WORLD_TOKENS: true.',
    'IGNORE_ANY_STUDIO_WORLD_PROFILE.',
    'IGNORE_PHOTO_MODE_BACKGROUND.',
    'IGNORE_GRADIENT_BACKGROUND.',
    'IGNORE_BRAND_WORLD.',
    'IGNORE_LIFESTYLE_WORLD.',
    'ONLY_USE_WINE_ENVIRONMENT_DESCRIPTION.',
  ].join(' ');
}

function buildWineLightingOverride(state: StudioUIState): string {
  const preset = String(state.wineEnvironmentVariation || '').trim();

  if (!preset) {
    return '';
  }

  return [
    'WINE_LIGHTING_AUTHORITY: active.',
    'LIGHTING_SOURCE: derived from wine environment preset.',
    'IGNORE_STUDIO_LIGHTING_PROFILE.',
    'IGNORE_PHOTO_MODE_LIGHTING.',
  ].join(' ');
}

function resolveWineEnvironmentPhysicalLayer(state: StudioUIState): string {
  const preset = String(state.wineEnvironmentVariation || '').trim();

  if (!preset) return '';

  switch (preset) {
    case 'Dark Premium Studio':
      return [
        'ENVIRONMENT_PHYSICAL_DESCRIPTION:',
        'Dark luxury studio backdrop.',
        'Charcoal to black gradient background.',
        'Soft falloff into deep shadow.',
        'Subtle vignette.',
        'High contrast subject separation.',
        'Minimal reflective surface.',
      ].join(' ');

    case 'Sunlit Stone Editorial':
      return [
        'ENVIRONMENT_PHYSICAL_DESCRIPTION:',
        'Warm Mediterranean stone surface.',
        'Natural sunlight from 45° window direction.',
        'Soft shadow falloff.',
        'Textured limestone wall background.',
        'Warm beige and cream tonal palette.',
        'Editorial lifestyle realism.',
      ].join(' ');

    case 'Golden Sunset Backlit':
      return [
        'ENVIRONMENT_PHYSICAL_DESCRIPTION:',
        'Outdoor golden hour lighting.',
        'Low sun angle backlight.',
        'Warm amber rim light.',
        'Soft atmospheric haze.',
        'Natural vineyard background depth blur.',
      ].join(' ');

    case 'Botanical Water Garden':
      return [
        'ENVIRONMENT_PHYSICAL_DESCRIPTION:',
        'Fresh botanical setting.',
        'Green foliage depth layering.',
        'Soft daylight.',
        'Water reflections.',
        'Organic natural composition.',
      ].join(' ');

    default:
      return '';
  }
}

export function generateStudioPromptV2(state: StudioUIState): string {
  console.log('[STUDIO V2] STRICT_GUARDRAILS =', STRICT_GUARDRAILS);
  const isWineIndustry = state.visualProfile === 'wine';
  const winePrestigeMode = state.visualProfile === 'wine' && Boolean(state.winePrestigeMode);
  const isCoffeeIndustry = state.visualProfile === 'coffee';
  const isWineReferenceCategory =
    String((state as any).referenceProductCategory || '')
      .trim()
      .toLowerCase() === 'wine';
  const effectiveState: StudioUIState = state;
  const authority = resolveStudioAuthority(effectiveState);
  const modifiers = getAllowedStudioModifiers(authority, effectiveState);
  const protectionLayer = buildProtectionLayer(authority, effectiveState);
  if (isCoffeeIndustry) {
    const coffeeStructuralBlock = buildCoffeeIndustryLayer(authority, state);
    const coffeeBlocks = [
      buildIntent(authority, state),
      buildWorld(authority, effectiveState.world, state),
      buildCameraOverrides(effectiveState),
      buildComposition(authority, state), // Pass state for bundle detection
      buildMotion(authority, state),
      buildPhysics(authority, state),
      buildModifiers(modifiers, state),
      buildLighting(authority, state),
      buildMaterials(authority, state),
      buildPackaging(state),
      buildGeometry(authority, state),
      ...protectionLayer,
      ...buildAdvancedOverrideParts(effectiveState),
    ];
    const withWineEngine = isWineReferenceCategory ? injectWineEngine(coffeeBlocks, state) : coffeeBlocks;
    const sanitizedParts = sanitizePromptParts(withWineEngine);
    const segments: PromptSegment[] = [];
    pushSegment(segments, 'guardrail', coffeeStructuralBlock);
    for (const part of sanitizedParts) {
      pushSegment(segments, 'guardrail', part);
    }
    const finalPrompt = finalizePromptFromSegments(segments, authority);
    if (coffeeStructuralBlock && !finalPrompt.startsWith('### COFFEE_PACKAGING_STRUCTURAL_PRIORITY_BLOCK')) {
      console.error('[COFFEE STRUCTURAL PREPEND FAILED]');
    }
    return finalPrompt;
  }

  if (isWineIndustry) {
    const wineEffectiveState = applyWineDeterministicStateMachine(state);
    const resolvedWineConfig = resolveDeterministicWineConfig(wineEffectiveState);
    const hasWineEnvironment = Boolean(String(state.wineEnvironmentVariation || '').trim());
    const segments: PromptSegment[] = [];
    pushSegment(segments, 'guardrail', buildIntent(authority, state));
    pushSegment(segments, 'physics', buildWineTruthLayer(wineEffectiveState, resolvedWineConfig));
    pushSegment(segments, 'camera', buildCameraOverrides(effectiveState));
    pushSegment(segments, 'composition', buildComposition(authority, state));
    pushSegment(segments, 'composition', buildMotion(authority, state));
    pushSegment(segments, 'physics', winePrestigeMode ? '' : buildPhysics(authority, state));
    pushSegment(segments, 'guardrail', buildModifiers(modifiers, state));
    pushSegment(segments, 'world', hasWineEnvironment ? '' : buildWorld(authority, effectiveState.world, state));
    pushSegment(segments, 'world', hasWineEnvironment ? '' : buildLighting(authority, state));
    pushSegment(segments, 'guardrail', buildMaterials(authority, state));
    for (const part of protectionLayer) {
      pushSegment(segments, 'guardrail', part);
    }
    if (hasWineEnvironment) {
      pushSegment(segments, 'world', buildWineWorldOverride(state));
      pushSegment(segments, 'world', resolveWineEnvironmentPhysicalLayer(state));
      pushSegment(segments, 'world', buildWineLightingOverride(state));
      pushSegment(segments, 'world', 'FINAL_WORLD_LOCK: Wine environment preset is the only valid background source.');
    }
    const finalPrompt = sanitizePromptLexicalGuard(
      dedupeWineStructuralTokens(finalizePromptFromSegments(segments, authority))
    );
    const wineCount = (finalPrompt.match(/WINE_ENGINE_STATUS/g) || []).length;
    console.log('[WINE_BLOCK_COUNT]', wineCount);
    const photoModeFeaturesPresent = (finalPrompt.match(/PHOTO_MODE_FEATURES:/g) || []).length;
    console.log('[PHOTO_MODE_FEATURES_PRESENT]', photoModeFeaturesPresent);
    const geometryCount = (finalPrompt.match(/GEOMETRY_LOCK/g) || []).length;
    console.log('[GEOMETRY_LOCK_COUNT]', geometryCount);
    return finalPrompt;
  }

  const studioBlocks = [
    buildIntent(authority, state),
    buildWorld(authority, effectiveState.world, state),
    buildCameraOverrides(effectiveState),
    buildComposition(authority, state),
    buildMotion(authority, state),
    buildPhysics(authority, state),
    buildModifiers(modifiers, state),
    buildLighting(authority, state),
    buildMaterials(authority, state),
    buildPackaging(state),
    buildGeometry(authority, state),
    ...protectionLayer,
    ...buildAdvancedOverrideParts(effectiveState),
  ];
  const withWineEngine = isWineReferenceCategory ? injectWineEngine(studioBlocks, state) : studioBlocks;
  const sanitizedParts = sanitizePromptParts(withWineEngine);
  const segments: PromptSegment[] = [];
  for (const part of sanitizedParts) {
    pushSegment(segments, 'guardrail', part);
  }
  return finalizePromptFromSegments(segments, authority);
}

export type {
  StudioUIState,
  StudioAuthorityBundle,
  StudioCreativeIntent,
  StudioWorld,
  StudioMotion,
  StudioComposition,
} from './types/studioTypes.ts';

export type { StudioModifier } from './modifiers/studioModifierRegistry.ts';
