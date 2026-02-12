import { resolveStudioAuthority } from './authority/studioAuthorityResolver.ts';
import { getAllowedStudioModifiers } from './modifiers/studioModifierRegistry.ts';
import { buildIntent } from './builders/buildIntent.ts';
import { buildWorld } from './builders/buildWorld.ts';
import { buildComposition } from './builders/buildComposition.ts';
import { buildMotion } from './builders/buildMotion.ts';
import { buildPhysics } from './builders/buildPhysics.ts';
import { buildModifiers } from './builders/buildModifiers.ts';
import { buildLighting } from './builders/buildLighting.ts';
import { buildMaterials } from './builders/buildMaterials.ts';
import { buildUltraReal } from './builders/buildUltraReal.ts';
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
  const authority = resolveStudioAuthority(state);
  const modifiers = getAllowedStudioModifiers(authority, state);
  const protectionLayer = buildProtectionLayer(authority);

  const blocks = [
    buildIntent(authority),
    buildWorld(authority),
    buildComposition(authority),
    buildMotion(authority),
    buildPhysics(authority),
    buildModifiers(modifiers),
    buildLighting(authority, state),
    buildMaterials(authority),
    ...protectionLayer,
  ];

  const prompt = assembleStudioPrompt(blocks);
  validateStudioPrompt(prompt, authority);
  return prompt;
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
