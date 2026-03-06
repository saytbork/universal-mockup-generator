import { describe, expect, it } from 'vitest';
import { genericPipeline } from '../pipelines/genericPipeline';
import type { StudioUIState } from '../types/studioTypes';

function baseState(overrides: Partial<StudioUIState> = {}): StudioUIState {
  return {
    industryProfile: 'supplements',
    photoMode: 'Hero Landing Page',
    motion: 'static',
    composition: 'hero',
    creativeIntent: 'conversion',
    ...overrides,
  } as StudioUIState;
}

describe('Studio protected baseline snapshot', () => {
  it('Hero Landing Page prompt', () => {
    const prompt = genericPipeline.build(baseState({ photoMode: 'Hero Landing Page' }));
    expect(prompt).toMatchSnapshot();
  });

  it('Splash Shot prompt', () => {
    const prompt = genericPipeline.build(
      baseState({
        photoMode: 'Splash Shot',
        motion: 'pouring',
        requestedModifiers: ['splash'],
      })
    );
    expect(prompt).toMatchSnapshot();
  });

  it('Nature Elements prompt', () => {
    const prompt = genericPipeline.build(
      baseState({
        photoMode: 'Hero Landing Page',
        environmentPreset: 'Nature Elements',
      })
    );
    expect(prompt).toMatchSnapshot();
  });

  it('Wine Macro Label prompt', () => {
    const prompt = genericPipeline.build(
      baseState({
        industryProfile: 'wine',
        photoMode: 'Wine Macro Label',
        composition: 'macro',
        wineEngineVersion: 4,
        wineBottleState: 'sealed',
        wineGlassMode: 'none',
        wineClosureType: 'from-reference',
      })
    );
    expect(prompt).toMatchSnapshot();
  });
});

