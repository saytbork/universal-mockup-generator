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

export function generateStudioPromptV2(state: StudioUIState): string {
  console.log('[STUDIO V2] STRICT_GUARDRAILS =', STRICT_GUARDRAILS);
  const winePrestigeMode = state.visualProfile === 'wine' && Boolean(state.winePrestigeMode);
  const isCoffeeIndustry = state.visualProfile === 'coffee';
  const effectiveState: StudioUIState = state;
  const authority = resolveStudioAuthority(effectiveState);
  const modifiers = getAllowedStudioModifiers(authority, state);
  const protectionLayer = buildProtectionLayer(authority);
  const coffeeStructuralBlock = isCoffeeIndustry ? buildCoffeeIndustryLayer(authority, state) : '';

  const blocks = [
    buildIntent(authority, state),
    buildWorld(authority, effectiveState.world, state),
    buildWineIndustryLayerV2(state),
    buildCameraOverrides(effectiveState),
    buildComposition(authority, state), // Pass state for bundle detection
    buildMotion(authority, state),
    winePrestigeMode ? '' : buildPhysics(authority, state),
    buildModifiers(modifiers, state),
    buildLighting(authority, state),
    buildMaterials(authority, state),
    buildPackaging(state),
    buildGeometry(authority, state),
    ...protectionLayer,
  ];

  const prompt = assembleStudioPrompt(blocks);
  const finalPrompt =
    isCoffeeIndustry && coffeeStructuralBlock
      ? `${coffeeStructuralBlock}\n\n${prompt}`
      : prompt;
  if (isCoffeeIndustry) {
    if (!finalPrompt.startsWith('### COFFEE_PACKAGING_STRUCTURAL_PRIORITY_BLOCK')) {
      console.error('[COFFEE STRUCTURAL PREPEND FAILED]');
    }
  }
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
