import type { StudioAuthorityBundle } from '../types/studioTypes.ts';
import type { StudioUIState } from '../types/studioTypes.ts';

export type StudioModifier =
  | 'splash'
  | 'condensation'
  | 'texturedBed'
  | 'ice'
  | 'fruit'
  | 'foam'
  | 'particles'
  | 'acrylic';

type StudioModifierDefinition = {
  requires: (authority: StudioAuthorityBundle, state: StudioUIState) => boolean;
  blocks: string[];
};

const STUDIO_MODIFIER_ORDER: StudioModifier[] = [
  'splash',
  'condensation',
  'texturedBed',
  'ice',
  'fruit',
  'foam',
  'particles',
  'acrylic',
];

const STUDIO_MODIFIER_REGISTRY: Record<StudioModifier, StudioModifierDefinition> = {
  splash: {
    requires: (authority) => authority.permissions.allowSplash,
    blocks: ['Requires dynamic splash authority and deterministic collision physics.'],
  },
  condensation: {
    requires: (authority) => authority.world !== 'underwater',
    blocks: ['Apply controlled condensation on product-facing surfaces only.'],
  },
  texturedBed: {
    requires: (authority) => authority.world !== 'underwater',
    blocks: ['Product grounded on a premium textured scatter base at the bottom edge of frame. Use controlled natural scatter elements (coffee beans, seeds, crystals, sand, stones) arranged around the base of the product with intentional premium placement. Scatter must be minimal, bounded, and serve the composition—not dominate it. Maintain clean hero product focus with readable label. Apply realistic contact shadows between product and scatter base.'],
  },
  ice: {
    requires: () => true,
    blocks: ['Use physically plausible ice geometry with melt-aware contact zones.'],
  },
  fruit: {
    requires: (authority, state) => authority.world !== 'underwater' || Boolean(state.fruitSubmerged),
    blocks: ['Use realistic fruit garnish scale and physically grounded placement.'],
  },
  foam: {
    requires: (authority) => authority.world !== 'underwater' || authority.permissions.allowSplash,
    blocks: ['Foam must remain mass-coherent and attached to liquid flow vectors.'],
  },
  particles: {
    requires: (authority) => authority.permissions.allowParticles,
    blocks: ['Particles allowed only as bounded atmospheric depth cues.'],
  },
  acrylic: {
    requires: () => true,
    blocks: ['Acrylic surfaces require real refraction and edge-consistent reflections.'],
  },
};

export function getAllowedStudioModifiers(
  authority: StudioAuthorityBundle,
  state: StudioUIState
): StudioModifier[] {
  const requested = Array.isArray(state.requestedModifiers) ? state.requestedModifiers : [];
  const requestedSet = new Set(requested.map((entry) => String(entry).trim()).filter(Boolean));

  if (requestedSet.size === 0) {
    return [];
  }

  return STUDIO_MODIFIER_ORDER.filter((modifier) => {
    const definition = STUDIO_MODIFIER_REGISTRY[modifier];
    if (!definition.requires(authority, state)) return false;
    return requestedSet.has(modifier);
  });
}

export function getStudioModifierDefinition(modifier: StudioModifier): StudioModifierDefinition {
  return STUDIO_MODIFIER_REGISTRY[modifier];
}
