import type { StudioModifier } from '../modifiers/studioModifierRegistry.ts';
import { getStudioModifierDefinition } from '../modifiers/studioModifierRegistry.ts';
import type { StudioUIState } from '../types/studioTypes.ts';

export function buildModifiers(modifiers: StudioModifier[], state?: StudioUIState): string {
  if (state?.winePrestigeMode) {
    const mood = String(state.wineMoodModifier || '').trim();
    return mood && mood !== 'None'
      ? `STUDIO_MODIFIERS: wine-prestige. WINE_PRESTIGE_MODIFIER: ${mood}.`
      : 'STUDIO_MODIFIERS: wine-prestige.';
  }

  if (modifiers.length === 0) {
    return 'STUDIO_MODIFIERS: none.';
  }

  const hyperProEffectsArtDirection =
    'STUDIO_EFFECTS_ART_DIRECTION: Hyper-professional commercial finish required. Effects must feel intentionally art-directed with clean energy, controlled depth layering, premium contrast architecture, and strict hero-product readability.';

  const lines = modifiers.map((modifier) => {
    const definition = getStudioModifierDefinition(modifier);
    return `STUDIO_MODIFIER_${modifier.toUpperCase()}: ${definition.blocks.join(' ')}`;
  });

  return ['STUDIO_MODIFIERS:', hyperProEffectsArtDirection, ...lines].join(' ');
}
