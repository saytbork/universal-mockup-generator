import { beforeEach, describe, expect, it } from 'vitest';
import { DEFAULT_PRODUCT_STUDIO_STATE, useProductStudioStore } from '../../productStudio/store';
import { toStudioV2State } from '../../productStudio/promptRouter';
import { generateStudioPromptV2 } from '../index';

function resetStudioStore() {
  useProductStudioStore.setState({
    ...useProductStudioStore.getState(),
    ...structuredClone(DEFAULT_PRODUCT_STUDIO_STATE),
  });
}

describe('photo mode / visual style exclusivity', () => {
  beforeEach(() => {
    resetStudioStore();
  });

  it('clears any existing photo mode when a visual style is selected', () => {
    const store = useProductStudioStore.getState();

    store.setPhotoMode('Splash Shot');
    useProductStudioStore.getState().setVisualStyle('Brand Campaign');

    const next = useProductStudioStore.getState();
    expect(next.visualStyle).toBe('Brand Campaign');
    expect(next.photoMode).toBeUndefined();
    expect(next.specialEffects).toEqual([]);
  });

  it('clears any existing visual style when a photo mode is selected', () => {
    const store = useProductStudioStore.getState();

    store.setVisualStyle('Wet Rock Ripples');
    useProductStudioStore.getState().setPhotoMode('Acrylic Blocks');

    const next = useProductStudioStore.getState();
    expect(next.photoMode).toBe('Acrylic Blocks');
    expect(next.visualStyle).toBeUndefined();
    expect(next.specialEffects).toEqual([]);
  });

  it('stale splash specialEffects do not survive into a visual-style-only V2 prompt', () => {
    const mapped = toStudioV2State({
      ...structuredClone(DEFAULT_PRODUCT_STUDIO_STATE),
      photoMode: undefined,
      visualStyle: 'Brand Campaign',
      specialEffects: ['Splash Shot'],
      stateMotion: 'static',
      industryProfile: 'supplements',
      visualProfile: 'default',
      qualityProfile: 'ecommerce-conversion',
      definition: { type: 'skincare' } as any,
      products: [],
      activeProductId: null,
    } as any);

    const prompt = generateStudioPromptV2(mapped);

    expect(prompt).not.toContain('STUDIO_MODIFIER_SPLASH:');
    expect(prompt).not.toContain('STUDIO_PHYSICS_MODEL:');
  });
});
