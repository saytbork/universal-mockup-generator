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
    blocks: ['Requires dynamic splash authority and deterministic collision physics. Use premium ad-grade splash styling with one dominant directional flow, crisp droplet edge acuity, and clear hero readability.'],
  },
  condensation: {
    requires: (authority) => authority.world !== 'underwater',
    blocks: ['Apply controlled condensation on product-facing surfaces only, with premium specular sparkle and disciplined droplet distribution (no random foggy mess).'],
  },
  texturedBed: {
    requires: (authority) => authority.world !== 'underwater',
    blocks: ['Product must be partially embedded into a dense premium textured ingredient bed (coffee beans, seeds, crystals, sand, stones), not just surrounded by sparse scatter. Use a true top-down flat lay camera (90° overhead) with clean premium styling. The bed should wrap around the product contact area with visible compression and physically plausible contact/occlusion shadows, making the product feel seated inside the material. Container surface, cap, pump, and label must remain clean and dry: no drips, no residue, no foam streaks, no liquid trails, and no decorative add-ons attached to the product. If PHOTO_MODE_FEATURES includes depthLevel, follow it as the embedding intensity target while preserving full label readability. Keep the label zone clear and fully readable.'],
  },
  ice: {
    requires: () => true,
    blocks: ['Use physically plausible ice geometry with melt-aware contact zones and clean ad-grade translucency/refraction.'],
  },
  fruit: {
    requires: (authority, state) => authority.world !== 'underwater' || Boolean(state.fruitSubmerged),
    blocks: ['Fresh citrus slices (orange, lemon, lime, or grapefruit) arranged around the product in a natural premium flat lay composition. Citrus must show realistic fresh-cut texture with visible pulp segments and natural juice. Use top-down or slightly angled perspective. Soft natural directional light. Product remains hero with citrus as supporting visual element.'],
  },
  foam: {
    requires: (authority) => authority.world !== 'underwater' || authority.permissions.allowSplash,
    blocks: ['Foam must remain mass-coherent and attached to liquid flow vectors, with premium texture definition and controlled micro-bubble detail.'],
  },
  particles: {
    requires: (authority) => authority.permissions.allowParticles,
    blocks: ['Particles allowed only as bounded atmospheric depth cues with cinematic depth layering and no noisy haze wash.'],
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
  if (state.winePrestigeMode) {
    return [];
  }

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
