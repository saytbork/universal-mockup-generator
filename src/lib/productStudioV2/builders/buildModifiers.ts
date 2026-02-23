import type { StudioModifier } from '../modifiers/studioModifierRegistry.ts';
import { getStudioModifierDefinition } from '../modifiers/studioModifierRegistry.ts';
import type { StudioUIState } from '../types/studioTypes.ts';

export function buildModifiers(modifiers: StudioModifier[], state?: StudioUIState): string {
  if (state?.winePrestigeMode) {
    const rawMood = String(state.wineMoodModifier || '').trim();
    const mood = rawMood === 'Deep Burgundy Contrast Boost' ? 'Deep Contrast Boost' : rawMood;
    const winePrestigeV2Mode = Boolean(state.winePrestigeV2Mode);
    const pourStyle = String(state.winePourStyle || 'mid-flow-elegance').trim();
    const maybeMood = (() => {
      if (!mood || mood === 'None') return '';
      if (mood === 'Deep Contrast Boost') {
        return 'WINE_PRESTIGE_MODIFIER: Deep Contrast Boost. Contrast applies to environment/material separation only. Product and liquid color must remain reference-accurate.';
      }
      return `WINE_PRESTIGE_MODIFIER: ${mood}.`;
    })();
    const v2PourModel = winePrestigeV2Mode
      ? [
          'WINE_POUR_MODEL:',
          'Origin: bottle neck.',
          'Flow type: laminar fluid stream.',
          'Continuous ribbon flow.',
          'No fragmentation unless impact occurs.',
          'Gravity vector strict.',
          'Viscosity slightly elevated.',
          'Surface tension visible.',
          'When stream hits glass: internal wave formation with micro splash inside glass only.',
          'No external droplets. No chaotic splash. No outward explosion.',
          `POUR_STYLE: ${pourStyle}.`,
          pourStyle === 'peak-glass-impact'
            ? 'Peak glass impact mode: allow internal glass turbulence only, never external splash.'
            : '',
        ]
          .filter(Boolean)
          .join(' ')
      : '';

    return ['STUDIO_MODIFIERS: wine-prestige.', maybeMood, v2PourModel].filter(Boolean).join(' ');
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
