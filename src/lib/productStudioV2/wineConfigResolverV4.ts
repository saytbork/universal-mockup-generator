import type { StudioUIState } from './types/studioTypes.ts';
import type { ResolvedWineConfig } from './wineConfigResolver.ts';

export function buildWineTruthLayerV4(
  state: StudioUIState,
  config: ResolvedWineConfig
): string {
  const wineType = String(state.wineType || 'auto').trim();
  const closureType = String(config.closureType || 'from-reference').trim();
  const bottleState = String(config.bottleState || 'open').trim();
  const glassFillLevel = String(config.glassFillLevel || 'none').trim();
  const carbonationLevel = String(state.carbonationLevel || 'none').trim();

  return [
    'WINE_ENGINE: deterministic.',
    [
      'WINE_PROFILE:',
      `wineType=${wineType};`,
      `closureType=${closureType};`,
      `bottleState=${bottleState};`,
      `glassFillLevel=${glassFillLevel};`,
      `carbonationLevel=${carbonationLevel};`,
    ].join(' '),
    [
      'COLOR_ACCURACY:',
      'Exact liquid color match. No hue or chroma shift.',
    ].join(' '),
    [
      'GEOMETRY_INTEGRITY:',
      'Exact bottle proportions.',
      'Closure scale preserved.',
      'Label alignment preserved.',
      'No warping.',
    ].join(' '),
    [
      'LIQUID_TRANSFER_PHYSICS:',
      'Glass filled to declared level.',
      'Bottle level visibly reduced below sealed reference.',
      'Reduction clearly noticeable.',
      'Not factory-full.',
    ].join(' '),
    [
      'CARBONATION_BEHAVIOR:',
      'Extremely subtle micro-bubbles.',
      'No foam head.',
      'No soda turbulence.',
    ].join(' '),
    [
      'CLOSURE_GEOMETRY:',
      `closureType=${closureType}.`,
      'Physically coherent geometry preserved.',
      'Crown-cap includes detached pry-state when open.',
    ].join(' '),
  ].filter(Boolean).join(' ');
}
