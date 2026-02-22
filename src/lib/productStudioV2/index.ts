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
import type { StudioAuthorityBundle, StudioUIState } from './types/studioTypes.ts';

const STRICT_GUARDRAILS = import.meta.env.VITE_STRICT_GUARDRAILS === 'true';

function buildProtectionLayer(authority: StudioAuthorityBundle): string[] {
  if (!STRICT_GUARDRAILS) return [];
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

function stripPromptSentences(prompt: string, patterns: RegExp[]): string {
  let next = prompt;
  for (const pattern of patterns) {
    next = next.replace(pattern, '');
  }
  return next.replace(/\s{2,}/g, ' ').trim();
}

function applyAdvancedOverridePhase(prompt: string, state: StudioUIState): string {
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
    return prompt;
  }

  let nextPrompt = prompt;
  let resolvedLens = '';
  let resolvedLighting = '';
  let resolvedFinish = '';

  if (lensOverride) {
    nextPrompt = stripPromptSentences(nextPrompt, [
      /\bCOFFEE_LENS_BIAS:\s*[^.]*\.\s*/gi,
      /\bLENS_PROFILE:\s*[^.]*\.\s*/gi,
    ]);
    resolvedLens = lensOverride;
  }

  if (lightingRigOverride) {
    nextPrompt = stripPromptSentences(nextPrompt, [
      /\bLIGHTING:\s*[^.]*\.\s*/gi,
      /\bSTUDIO_LIGHTING_PROFILE:\s*[^.]*\.\s*/gi,
      /\bCOFFEE_LIGHTING_PROFILE:\s*[^.]*\.\s*/gi,
      /\bCOFFEE_LIGHTING_TEMPERATURE:\s*[^.]*\.\s*/gi,
      /\bCOFFEE_SHADOW_PROFILE:\s*[^.]*\.\s*/gi,
      /\bCOFFEE_CONTRAST_PROFILE:\s*[^.]*\.\s*/gi,
      /\bCOFFEE_LIGHTING_FINE:\s*[^.]*\.\s*/gi,
      /\bACCENT LIGHT GEL:\s*[^.]*\.\s*/gi,
      /\bACCENT_LIGHT_GEL:\s*[^.]*\.\s*/gi,
    ]);
    resolvedLighting = lightingRigOverride;
  }

  if (finishOverride) {
    nextPrompt = stripPromptSentences(nextPrompt, [
      /\bcinematicLook\s*=\s*[^.]*\.\s*/gi,
      /\bCOFFEE_FALLOFF_STYLE:\s*[^.]*\.\s*/gi,
      /\bCOFFEE_CONTRAST_PROFILE:\s*[^.]*\.\s*/gi,
      /\bCOLOR_GRADING:\s*[^.]*\.\s*/gi,
    ]);
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

  // Ensure advanced override block is injected only once.
  nextPrompt = nextPrompt.replace(/\bSTUDIO_ADVANCED_OVERRIDES:[\s\S]*?(?:\n\n|$)/gi, '').trim();
  if (advancedParts.length > 0) {
    nextPrompt = `${nextPrompt}\n\nSTUDIO_ADVANCED_OVERRIDES: ${advancedParts.join(' ')}`.trim();
  }

  console.log('[RESOLVED_LENS]', resolvedLens);
  console.log('[RESOLVED_LIGHTING]', resolvedLighting);
  console.log('[RESOLVED_FINISH]', resolvedFinish);

  return nextPrompt;
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
  const modifiers = getAllowedStudioModifiers(authority, state);
  const protectionLayer = buildProtectionLayer(authority);
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
    ];
    const finalPromptParts = isWineReferenceCategory ? injectWineEngine(coffeeBlocks, state) : coffeeBlocks;
    const prompt = assembleStudioPrompt(finalPromptParts);
    const basePrompt = coffeeStructuralBlock ? `${coffeeStructuralBlock}\n\n${prompt}` : prompt;
    const finalPrompt = applyAdvancedOverridePhase(basePrompt, state);
    if (!finalPrompt.startsWith('### COFFEE_PACKAGING_STRUCTURAL_PRIORITY_BLOCK')) {
      console.error('[COFFEE STRUCTURAL PREPEND FAILED]');
    }
    validateStudioPrompt(finalPrompt, authority);
    return finalPrompt;
  }

  if (isWineIndustry) {
    const wineBlocks = [
      buildIntent(authority, state),
      buildWorld(authority, effectiveState.world, state),
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
    const finalPromptParts = isWineReferenceCategory ? injectWineEngine(wineBlocks, state) : wineBlocks;
    const finalPrompt = applyAdvancedOverridePhase(assembleStudioPrompt(finalPromptParts), state);
    validateStudioPrompt(finalPrompt, authority);
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
  ];
  const finalPromptParts = isWineReferenceCategory ? injectWineEngine(studioBlocks, state) : studioBlocks;
  const finalPrompt = applyAdvancedOverridePhase(assembleStudioPrompt(finalPromptParts), state);
  validateStudioPrompt(finalPrompt, authority);
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
