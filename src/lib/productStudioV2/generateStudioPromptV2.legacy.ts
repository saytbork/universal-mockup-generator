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
import { buildWineTruthLayerV4 } from './wineConfigResolverV4.ts';
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

  const keepLastPrefixes = ['FRAME_EDGE_POLICY:'];
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
    return (
      key === 'STUDIO_WORLD' ||
      key === 'WINE_ENVIRONMENT_VARIATION' ||
      key === 'WINE_ENVIRONMENT_CONTEXT' ||
      key === 'WINE_ENVIRONMENT'
    );
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

// Backwards-compatible mapping: derive a binary serveState from older UI fields.
function resolveServeState(state: StudioUIState): 'none' | 'served' {
  const amount = normalizeWineValue((state as StudioUIState & { wineServeAmount?: string }).wineServeAmount);
  const glassMode = normalizeWineValue(state.wineGlassMode);
  const bottleState = normalizeWineValue(state.wineBottleState) === 'sealed' ? 'sealed' : 'open';

  if (bottleState === 'sealed') return 'none';
  if (glassMode === 'filled') return 'served';
  if (amount) return 'served';
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
  const serveState = resolveServeState(state);
  const bottleFillState = serveState === 'served' ? 'clearly-partially-consumed' : 'retail-full';

  return {
    closureType: resolveWineClosureType(state),
    bottleState,
    serveState,
    bottleFillState,
  };
}

function resolveWineEngineVersion(state: StudioUIState): number {
  const version = Number(state.wineEngineVersion || 3);
  return Number.isFinite(version) ? version : 3;
}

function applyWineDeterministicStateMachine(state: StudioUIState): StudioUIState {
  const config = resolveDeterministicWineConfig(state);
  const wineBottleState = config.bottleState === 'sealed' ? 'sealed' : 'opened-with-cork-nearby';
  const wineGlassMode =
    config.serveState === 'none'
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

function buildWineEnvironment(state: StudioUIState): string {
  const variation = String(state.wineEnvironmentVariation || '').trim();
  if (!variation) return '';

  const narrativeMap: Record<string, string> = {
    vineyard:
      'Golden vineyard at sunset. Soft warm edge light. Background out of focus.',
    'dark-cellar':
      'Aged oak cellar. Soft warm edge light. Background out of focus.',
    'marble-bar':
      'Luxury marble bar scene. Soft warm edge light. Background out of focus.',
    'minimal-gradient':
      'Minimal gradient backdrop. Soft warm edge light. Background out of focus.',
    'black-studio':
      'Black studio scene. Soft warm edge light. Background out of focus.',
    'modern-kitchen':
      'Modern kitchen environment. Soft warm edge light. Background out of focus.',
    'luxury-dining':
      'Fine dining setting. Soft warm edge light. Background out of focus.',
    'moody-backlight':
      'Moody backlit scene. Soft warm edge light. Background out of focus.',
    'sunlit-table':
      'Sunlit table scene. Soft warm edge light. Background out of focus.',
    'architectural-shadow':
      'Architectural shadow scene. Soft warm edge light. Background out of focus.',
  };

  const narrative = narrativeMap[variation] || narrativeMap['black-studio'];
  return `WINE_ENVIRONMENT: ${narrative}`;
}

function buildWineLighting(): string {
  return [
    'WINE_LIGHTING:',
    'Warm lateral key light.',
    'Soft falloff.',
    'Controlled glass highlights.',
  ].join(' ');
}

function buildWineModifiers(state: StudioUIState): string {
  const mood = String(state.wineMoodModifier || '').trim();
  if (!mood || mood === 'None') return '';
  return `WINE_MOOD: ${mood}.`;
}

function buildWineMinimalGuardrail(): string {
  return [
    'PHYSICAL_REALISM:',
    'Coherent optics.',
    'Material integrity.',
    'Gravity consistency.',
  ].join(' ');
}

function buildWineMaterials(): string {
  return [
    'MATERIALS:',
    'Real glass.',
    'Natural liquid translucency.',
    'Label fidelity.',
  ].join(' ');
}

function sanitizeWineV4Prompt(prompt: string): string {
  return String(prompt || '')
    .replace(/STUDIO_VISUAL_INTENT:[^.]*\./gi, ' ')
    .replace(/STUDIO_CAMERA_SYSTEM:[^.]*\./gi, ' ')
    .replace(/STUDIO_CAMERA_DISTANCE:[^.]*\./gi, ' ')
    .replace(/LENS_PROFILE:[^.]*\./gi, ' ')
    .replace(/DISTORTION:[^.]*\./gi, ' ')
    .replace(/DEPTH_STYLE:[^.]*\./gi, ' ')
    .replace(/STUDIO_FRAMING_GUIDE:[^.]*\./gi, ' ')
    .replace(/STUDIO_CAMERA_\s*/g, ' ')
    .replace(/STUDIO_PRODUCT_MOTION:[^.]*\./gi, ' ')
    .replace(/STUDIO_MODIFIERS:\s*wine-prestige\./gi, ' ')
    .replace(/STUDIO_COMPOSITION_MODEL:[^.]*\./gi, ' ')
    .replace(/FRAME_EDGE_POLICY:[^.]*\./gi, ' ')
    .replace(/PHOTO_TYPE:[^.]*\./gi, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export function generateStudioPromptV2_legacy(state: StudioUIState): string {
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
  // eslint-disable-next-line no-console
  console.log('LEGACY AUTHORITY:', JSON.stringify(authority));
  // eslint-disable-next-line no-console
  console.log('LEGACY SEGMENTS STRUCTURE:', JSON.stringify(segments, null, 2));
  const finalPrompt = finalizePromptFromSegments(segments, authority);
  // eslint-disable-next-line no-console
  console.log('LEGACY FINALIZE RESULT LENGTH:', finalPrompt.length);
    if (coffeeStructuralBlock && !finalPrompt.startsWith('### COFFEE_PACKAGING_STRUCTURAL_PRIORITY_BLOCK')) {
      console.error('[COFFEE STRUCTURAL PREPEND FAILED]');
    }
    return finalPrompt;
  }

  if (isWineIndustry) {
    const wineEffectiveState = applyWineDeterministicStateMachine(state);
    const resolvedWineConfig = resolveDeterministicWineConfig(wineEffectiveState);
    const wineEngineVersion = resolveWineEngineVersion(wineEffectiveState);
    const hasWineEnvironment = Boolean(String(state.wineEnvironmentVariation || '').trim());
    const segments: PromptSegment[] = [];
    pushSegment(segments, 'guardrail', buildIntent(authority, state));
    pushSegment(
      segments,
      'physics',
      wineEngineVersion >= 4
        ? buildWineTruthLayerV4(wineEffectiveState, resolvedWineConfig)
        : buildWineTruthLayer(wineEffectiveState, resolvedWineConfig)
    );
    pushSegment(segments, 'camera', buildCameraOverrides(effectiveState));
    pushSegment(segments, 'composition', buildComposition(authority, state));
    pushSegment(
      segments,
      'world',
      hasWineEnvironment
        ? buildWineEnvironment(wineEffectiveState)
        : buildWorld(authority, effectiveState.world, state)
    );
    pushSegment(
      segments,
      'world',
      hasWineEnvironment
        ? buildWineLighting()
        : buildLighting(authority, state)
    );
    pushSegment(segments, 'guardrail', buildWineMaterials());
    pushSegment(segments, 'guardrail', buildWineModifiers(wineEffectiveState));
    pushSegment(segments, 'guardrail', buildWineMinimalGuardrail());
    const finalPrompt = sanitizeWineV4Prompt(
      sanitizePromptLexicalGuard(
        dedupeWineStructuralTokens(finalizePromptFromSegments(segments, authority))
      )
    );
    const wineCount = (finalPrompt.match(/WINE_ENGINE_STATUS|WINE_ENGINE:/g) || []).length;
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
  // eslint-disable-next-line no-console
  console.log('LEGACY AUTHORITY:', JSON.stringify(authority));
  // eslint-disable-next-line no-console
  console.log('LEGACY SEGMENTS STRUCTURE:', JSON.stringify(segments, null, 2));
  const finalPrompt = finalizePromptFromSegments(segments, authority);
  // eslint-disable-next-line no-console
  console.log('LEGACY FINALIZE RESULT LENGTH:', finalPrompt.length);
  return finalPrompt;
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
