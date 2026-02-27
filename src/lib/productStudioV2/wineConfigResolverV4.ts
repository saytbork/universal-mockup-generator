import type { StudioUIState } from './types/studioTypes.ts';
import { buildWineTruthLayer, type ResolvedWineConfig } from './wineConfigResolver.ts';

/**
 * V4 Wine Truth Layer — same simplified model as V3.
 * Bottle is always sealed/closed. Served mode only adds a glass.
 */
export function buildWineTruthLayerV4(
  state: StudioUIState,
  config: ResolvedWineConfig
): string {
  return buildWineTruthLayer(state, config);
}
