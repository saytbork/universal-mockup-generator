import { resolveStudioAuthority } from './authority/studioAuthorityResolver.ts';
import { getAllowedStudioModifiers } from './modifiers/studioModifierRegistry.ts';
import { buildIntent } from './builders/buildIntent.ts';
import { buildWorld } from './builders/buildWorld.ts';
import { buildCoffeeIndustryLayer } from './builders/buildCoffeeIndustryLayer.ts';
import { buildWineIndustryLayerV2 } from './builders/buildWineIndustryLayerV2.ts';
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
  applyWineDeterministicStateMachine,
  buildWineConfigResolvedBlock,
  buildWineEngineStatusBlock,
  buildWineTruthLockBlock,
  resolveDeterministicWineConfig,
} from './wineConfigResolver.ts';
import type { StudioAuthorityBundle, StudioUIState } from './types/studioTypes.ts';

const STRICT_GUARDRAILS = import.meta.env.VITE_STRICT_GUARDRAILS === 'true';

function buildProtectionLayer(authority: StudioAuthorityBundle, state?: StudioUIState): string[] {
  const isWineIndustry = String(state?.visualProfile || '').trim().toLowerCase() === 'wine';
  if (!STRICT_GUARDRAILS && !isWineIndustry) return [];
  return [buildUltraReal(authority)];
}

function injectWineEngine(parts: string[], state: StudioUIState): string[] {
  const next = [...parts];
  next.push('LIQUID_ENGINE: active');
  next.push('LIQUID_PHYSICS_MODEL: deterministic');

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
    const prompt = assembleStudioPrompt(sanitizedParts);
    const basePrompt = coffeeStructuralBlock ? `${coffeeStructuralBlock}\n\n${prompt}` : prompt;
    const finalPrompt = basePrompt;
    if (!finalPrompt.startsWith('### COFFEE_PACKAGING_STRUCTURAL_PRIORITY_BLOCK')) {
      console.error('[COFFEE STRUCTURAL PREPEND FAILED]');
    }
    const sanitizedFinalPrompt = sanitizeFinalPromptOutput(finalPrompt);
    validateStudioPrompt(sanitizedFinalPrompt, authority);
    return sanitizedFinalPrompt;
  }

  if (isWineIndustry) {
    const wineEffectiveState = applyWineDeterministicStateMachine(state);
    const resolvedWineConfig = resolveDeterministicWineConfig(wineEffectiveState);
    const wineBlocks = [
      buildIntent(authority, state),
      buildWorld(authority, effectiveState.world, state),
      buildWineEngineStatusBlock(),
      buildWineTruthLockBlock(wineEffectiveState, resolvedWineConfig),
      buildWineConfigResolvedBlock(wineEffectiveState, resolvedWineConfig),
      buildWineIndustryLayerV2(state),
      buildCameraOverrides(effectiveState),
      buildComposition(authority, state),
      buildMotion(authority, state),
      winePrestigeMode ? '' : buildPhysics(authority, state),
      buildModifiers(modifiers, state),
      buildLighting(authority, state),
      buildMaterials(authority, state),
      buildPackaging(state),
      buildGeometry(authority, state),
      ...protectionLayer,
    ];
    const finalPrompt = assembleStudioPrompt(wineBlocks);
    const sanitizedFinalPrompt = sanitizeFinalPromptOutput(finalPrompt);
    validateStudioPrompt(sanitizedFinalPrompt, authority);
    return sanitizedFinalPrompt;
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
  const finalPrompt = assembleStudioPrompt(sanitizedParts);
  const sanitizedFinalPrompt = sanitizeFinalPromptOutput(finalPrompt);
  validateStudioPrompt(sanitizedFinalPrompt, authority);
  return sanitizedFinalPrompt;
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
