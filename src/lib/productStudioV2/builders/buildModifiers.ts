import type { StudioModifier } from '../modifiers/studioModifierRegistry.ts';
import { getStudioModifierDefinition } from '../modifiers/studioModifierRegistry.ts';

export function buildModifiers(modifiers: StudioModifier[]): string {
  if (modifiers.length === 0) {
    return 'STUDIO_MODIFIERS: none.';
  }

  const lines = modifiers.map((modifier) => {
    const definition = getStudioModifierDefinition(modifier);
    return `STUDIO_MODIFIER_${modifier.toUpperCase()}: ${definition.blocks.join(' ')}`;
  });

  return ['STUDIO_MODIFIERS:', ...lines].join(' ');
}
