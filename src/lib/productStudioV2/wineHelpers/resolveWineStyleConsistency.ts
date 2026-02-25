import type { StudioUIState } from '../types/studioTypes';

/**
 * Resolves wineStyle and sparkling consistency for strict simulation.
 * - champagne wire cork → sparkling
 * - sparkling style → sparkling >= 'Subtle'
 * - still style → sparkling = 'None'
 */
export function resolveWineStyleConsistency(state: StudioUIState): {
  wineStyle: 'still' | 'sparkling';
  sparkling: 'None' | 'Subtle' | 'Visible';
} {
  // Deterministic normalization
  const closure = String(state.wineClosureType || '').toLowerCase();
  let wineStyle: 'still' | 'sparkling';
  let sparklingIntensity: 'None' | 'Subtle' | 'Visible';

  // Champagne wire cork always forces sparkling
  if (closure === 'champagne wire cork') {
    wineStyle = 'sparkling';
    sparklingIntensity = state.sparklingIntensity && state.sparklingIntensity !== 'None' ? state.sparklingIntensity : 'Subtle';
  }
  // SparklingIntensity present (not None) forces sparkling
  else if (state.sparklingIntensity && state.sparklingIntensity !== 'None') {
    wineStyle = 'sparkling';
    sparklingIntensity = state.sparklingIntensity;
  }
  // Default wineStyle if undefined
  else if (!state.wineStyle) {
    wineStyle = 'still';
    sparklingIntensity = 'None';
  }
  // Still forces sparklingIntensity None
  else if (state.wineStyle === 'still') {
    wineStyle = 'still';
    sparklingIntensity = 'None';
  }
  // Sparkling forces sparklingIntensity at least Subtle
  else if (state.wineStyle === 'sparkling') {
    wineStyle = 'sparkling';
    sparklingIntensity = state.sparklingIntensity && state.sparklingIntensity !== 'None' ? state.sparklingIntensity : 'Subtle';
  }
  else {
    wineStyle = 'still';
    sparklingIntensity = 'None';
  }

  // Enforce impossible states
  if (wineStyle === 'still' && sparklingIntensity !== 'None') {
    sparklingIntensity = 'None';
  }
  if (wineStyle === 'sparkling' && sparklingIntensity === 'None') {
    sparklingIntensity = 'Subtle';
  }

  return { wineStyle, sparklingIntensity };
}
