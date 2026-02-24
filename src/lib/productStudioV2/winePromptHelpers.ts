import type { StudioUIState } from './types/studioTypes';

export function isWineStrictSimulation(state: StudioUIState): boolean {
  return (
    state.visualProfile === 'wine' &&
    (state.wineEngineVersion ?? 0) >= 4 &&
    state.wineGlassMode !== 'none'
  );
}

export function buildWinePhysicalPrompt(state: StudioUIState): string {
  return [
    'A wine bottle that is open.',
    'The liquid level in the bottle is visibly reduced compared to a full, unopened bottle.',
    'There is no closure attached to the bottle.',
    'Exactly one detached closure (crown-cap or cork) is present near the bottle.',
    'A glass is partially filled with wine.',
    'No duplicate closures are present.'
  ].join(' ');
}

export function buildWineStylingPrompt(state: StudioUIState): string {
  return [
    'Preserve the open bottle, reduced liquid level, detached closure, and partially filled glass as in the base image.',
    'Apply professional studio lighting and a clean background.',
    'Use hero composition and product-forward framing.',
    'Show the brand label clearly.',
    'No changes to the physical state of the bottle, glass, or closure.'
  ].join(' ');
}

export function buildWineSinglePassPrompt(state: StudioUIState): string {
  return [
    // Physical state first
    'A wine bottle that is open.',
    'The liquid level in the bottle is visibly reduced compared to a full, unopened bottle.',
    'There is no closure attached to the bottle.',
    'Exactly one detached closure (crown-cap or cork) is present near the bottle.',
    'A glass is partially filled with wine.',
    'No duplicate closures are present.',
    // Styling after
    'Professional studio lighting and a clean background.',
    'Hero composition and product-forward framing.',
    'Brand label is clearly visible.',
    'Do not alter the physical state described above.'
  ].join(' ');
}
