import { beforeEach, describe, expect, it } from 'vitest';
import { useProductStudioStore, DEFAULT_PRODUCT_STUDIO_STATE } from '../../productStudio/store';
import { generateProductJobs } from '../../productStudio/builders';
import type { ProductAsset } from '../../productStudio/types';

const TEST_PRODUCT: ProductAsset = {
  id: 'wine-1',
  name: 'Wine Bottle',
  imageUrl: 'https://example.com/wine.png',
  palette: {
    dominant: '#6f1320',
    secondary: '#d8c1a2',
    accent: '#3a0d14',
  },
};

describe('wine store flow', () => {
  beforeEach(() => {
    useProductStudioStore.setState(structuredClone(DEFAULT_PRODUCT_STUDIO_STATE));
  });

  it('preserves wine module environment and micro-variation selections through generateProductJobs', () => {
    const store = useProductStudioStore.getState();

    store.addProduct(TEST_PRODUCT);
    store.setVisualProfile('wine');
    store.setPhotoMode('Hero Landing Page');
    store.setContextPreset('');
    store.setWineEnvironment('Marble Bar');
    store.setWineMicroVariation({
      season: 'autumn',
      dewOnGlass: true,
      microProps: 'cork-and-corkscrew',
    });

    const state = useProductStudioStore.getState();
    const jobs = generateProductJobs(state);
    const prompt = jobs[0]?.prompt ?? '';

    expect(state.industryProfile).toBe('wine');
    expect(state.visualProfile).toBe('wine-prestige');
    expect(state.wineEnvironment).toBe('Marble Bar');
    expect(state.wineMicroVariation).toMatchObject({
      season: 'autumn',
      dewOnGlass: true,
      microProps: 'cork-and-corkscrew',
    });

    expect(jobs).toHaveLength(1);
    expect(prompt).toContain('WINE_ENVIRONMENT: marble-bar.');
    expect(prompt).toContain('WINE_MICRO_VARIATION:');
    expect(prompt).toContain('autumn');
    expect(prompt).toContain('condensation');
    expect(prompt).toContain('corkscrew');
  });
});
