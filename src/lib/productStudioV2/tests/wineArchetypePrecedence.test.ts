import { describe, expect, it, afterEach } from 'vitest';
import { useProductStudioStore, DEFAULT_PRODUCT_STUDIO_STATE } from '../../productStudio/store';

describe('wine archetype precedence', () => {
  afterEach(() => {
    useProductStudioStore.setState(structuredClone(DEFAULT_PRODUCT_STUDIO_STATE));
  });

  it('does not override winery-scene environment with archetype defaults', () => {
    useProductStudioStore.setState({
      ...structuredClone(DEFAULT_PRODUCT_STUDIO_STATE),
      industryProfile: 'wine',
      visualProfile: 'wine',
      photoMode: 'Winery Scene',
      contextPreset: 'Oak Barrel Cellar',
    });

    useProductStudioStore.getState().setWineStyleArchetype('Minimal Editorial Studio');

    const state = useProductStudioStore.getState();
    expect(state.contextPreset).toBe('Oak Barrel Cellar');
    expect(state.wineStyleArchetype).toBe('Minimal Editorial Studio');
  });

  it('treats existing context preset as manual override over archetype defaults', () => {
    useProductStudioStore.setState({
      ...structuredClone(DEFAULT_PRODUCT_STUDIO_STATE),
      industryProfile: 'wine',
      visualProfile: 'wine',
      photoMode: 'Hero Landing Page',
      contextPreset: 'Vineyard Golden Hour',
    });

    useProductStudioStore.getState().setWineStyleArchetype('Ultra Minimal Black Luxury');

    const state = useProductStudioStore.getState();
    expect(state.contextPreset).toBe('Vineyard Golden Hour');
    expect(state.wineLightingTone).toBe('Warm Lateral');
  });
});
