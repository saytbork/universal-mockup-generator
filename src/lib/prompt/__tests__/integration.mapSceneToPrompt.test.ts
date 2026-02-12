import { describe, it, expect } from 'vitest';
import { mapSceneToPrompt } from '../../productStudio/mapSceneToPrompt';
import { DEFAULT_PRODUCT_STUDIO_STATE } from '../../productStudio/store';
import type { ProductStudioState } from '../../productStudio/types';

const makeState = (overrides: Partial<ProductStudioState> = {}): ProductStudioState => {
  const base = structuredClone(DEFAULT_PRODUCT_STUDIO_STATE) as ProductStudioState;
  return {
    ...base,
    ...overrides,
  };
};

describe('mapSceneToPrompt integration', () => {
  it('generates Hero Landing Page prompt', () => {
    const state = makeState({
      photoMode: 'Hero Landing Page',
      sceneType: 'studio-branding',
      qualityProfile: 'ecommerce-conversion',
    });
    const result = mapSceneToPrompt(state);
    expect(result.prompt.length).toBeGreaterThan(0);
  });

  it('generates Ingredient Stack with atmosphere and physics safety', () => {
    const state = makeState({
      photoMode: 'Ingredient Stack',
      sceneType: 'studio-branding',
      props: 'mint | lemon',
      qualityProfile: 'ecommerce-conversion',
      specialEffects: [],
    });
    const result = mapSceneToPrompt(state);
    expect(result.prompt).toContain('ATMOSPHERE_RESOLUTION:');
    expect(result.prompt).toContain('PHYSICS_RULES');
    expect(result.prompt).toContain('no floating without shadow anchor');
  });

  it('generates Underwater Split with coherent waterline behavior', () => {
    const state = makeState({
      photoMode: 'Underwater Split',
      sceneType: 'editorial-product',
      environmentContext: { macro: 'natural-exterior', micro: 'rock' },
      qualityProfile: 'ecommerce-conversion',
      lighting: 'natural-light',
      specialEffects: [],
    });
    const result = mapSceneToPrompt(state);
    expect(result.prompt).toContain('ATMOSPHERE_RESOLUTION:');
    expect(result.prompt.toLowerCase()).toContain('waterline');
    expect(result.prompt).toContain('contact shadow');
  });

  it('generates Beach Foam Splash with splash physics and no critical break', () => {
    const state = makeState({
      photoMode: 'Beach Foam Splash',
      sceneType: 'editorial-product',
      environmentContext: { macro: 'natural-exterior', micro: 'rock' },
      qualityProfile: 'ecommerce-conversion',
      specialEffects: ['Splash Shot', 'Foam'],
    });
    const result = mapSceneToPrompt(state);
    expect(result.prompt.toLowerCase()).toContain('gravity arc');
    expect(result.prompt).toContain('PHYSICS_RULES');
  });

  it('generates Clinical Lab Counter without critical validation errors', () => {
    const state = makeState({
      photoMode: 'Clinical Lab Counter',
      sceneType: 'studio-branding',
      qualityProfile: 'clinical',
      lighting: 'clinical-softbox',
      specialEffects: [],
    });
    const result = mapSceneToPrompt(state);
    expect(result.prompt).toContain('ATMOSPHERE_RESOLUTION:');
    expect(result.prompt).toContain('label protection');
    expect(result.prompt).toContain('no floating without shadow anchor');
  });
});
