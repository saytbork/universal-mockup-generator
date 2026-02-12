import { describe, it, expect } from 'vitest';
import { mapSceneToPrompt } from '../../productStudio/mapSceneToPrompt';
import { DEFAULT_PRODUCT_STUDIO_STATE } from '../../productStudio/store';
import type { ProductStudioState } from '../../productStudio/types';

const makeState = (overrides: Partial<ProductStudioState> = {}): ProductStudioState => {
  const base = structuredClone(DEFAULT_PRODUCT_STUDIO_STATE) as ProductStudioState;
  return { ...base, ...overrides };
};

const assertCoreBlocks = (prompt: string) => {
  expect(prompt).toContain('ATMOSPHERE_RESOLUTION:');
  expect(prompt).toContain('PHYSICS_RULES');
  expect(prompt).toContain('BACKGROUND_ISOLATION');
  expect(prompt.match(/ATMOSPHERE_RESOLUTION:/g)?.length).toBe(1);
  expect(prompt.match(/PHYSICS_RULES/g)?.length).toBe(1);
  const ingredientCount = prompt.match(/INGREDIENT_RESOLUTION:/g)?.length ?? 0;
  expect(ingredientCount === 0 || ingredientCount === 1).toBe(true);
};

describe('full engine integration', () => {
  it('Hero Landing Page', () => {
    const result = mapSceneToPrompt(
      makeState({
        photoMode: 'Hero Landing Page',
        sceneType: 'editorial-product',
        environmentContext: { macro: 'natural-exterior', micro: 'rock' },
        qualityProfile: 'ecommerce-conversion',
      })
    );
    assertCoreBlocks(result.prompt);
  });

  it('Ingredient Stack', () => {
    const result = mapSceneToPrompt(
      makeState({
        photoMode: 'Ingredient Stack',
        sceneType: 'studio-branding',
        props: 'mint | lemon',
        qualityProfile: 'ecommerce-conversion',
      })
    );
    assertCoreBlocks(result.prompt);
  });

  it('Underwater Split', () => {
    const result = mapSceneToPrompt(
      makeState({
        photoMode: 'Underwater Split',
        sceneType: 'editorial-product',
        qualityProfile: 'luxury-brand',
        lighting: 'natural-light',
        environmentContext: { macro: 'natural-exterior', micro: 'rock' },
        specialEffects: ['Underwater Split'],
      })
    );
    assertCoreBlocks(result.prompt);
  });

  it('Beach Foam Splash', () => {
    const result = mapSceneToPrompt(
      makeState({
        photoMode: 'Beach Foam Splash',
        sceneType: 'editorial-product',
        qualityProfile: 'ecommerce-conversion',
        environmentContext: { macro: 'natural-exterior', micro: 'rock' },
        specialEffects: [],
      })
    );
    assertCoreBlocks(result.prompt);
  });

  it('Clinical Lab Counter', () => {
    const result = mapSceneToPrompt(
      makeState({
        photoMode: 'Clinical Lab Counter',
        sceneType: 'studio-branding',
        qualityProfile: 'clinical',
        lighting: 'clinical-softbox',
      })
    );
    assertCoreBlocks(result.prompt);
  });

  it('Minimal Bathroom Vanity', () => {
    const result = mapSceneToPrompt(
      makeState({
        photoMode: 'Minimal Bathroom Vanity',
        sceneType: 'editorial-product',
        qualityProfile: 'ecommerce-conversion',
        environmentContext: { macro: 'bathroom', micro: 'vanity' },
      })
    );
    assertCoreBlocks(result.prompt);
  });

  it('Dark Premium Studio', () => {
    const result = mapSceneToPrompt(
      makeState({
        photoMode: 'Dark Premium Studio',
        sceneType: 'studio-branding',
        qualityProfile: 'luxury-brand',
      })
    );
    assertCoreBlocks(result.prompt);
  });

  it('Monochrome Brand', () => {
    const result = mapSceneToPrompt(
      makeState({
        photoMode: 'Monochrome Brand',
        sceneType: 'studio-branding',
        qualityProfile: 'ecommerce-conversion',
      })
    );
    assertCoreBlocks(result.prompt);
  });

  it('Soft Wellness Morning', () => {
    const result = mapSceneToPrompt(
      makeState({
        photoMode: 'Soft Wellness Morning',
        sceneType: 'editorial-product',
        qualityProfile: 'luxury-brand',
        environmentContext: { macro: 'natural-exterior', micro: 'picnic-table' },
      })
    );
    assertCoreBlocks(result.prompt);
  });
});
