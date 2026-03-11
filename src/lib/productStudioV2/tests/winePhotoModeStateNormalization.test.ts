import { describe, expect, it } from 'vitest';
import { DEFAULT_PRODUCT_STUDIO_STATE, useProductStudioStore } from '../../productStudio/store';

describe('wine photo mode state normalization', () => {
  it('normalizes bottle + glass into served-open wine state', () => {
    useProductStudioStore.setState({
      ...structuredClone(DEFAULT_PRODUCT_STUDIO_STATE),
      industryProfile: 'wine',
      visualProfile: 'wine',
      photoMode: 'Hero Landing Page',
      wineGlassMode: 'none',
      wineBottleState: 'sealed',
      wineAction: 'static-presentation',
    });

    useProductStudioStore.getState().setPhotoMode('Bottle + Glass');

    const state = useProductStudioStore.getState();
    expect(state.wineGlassMode).toBe('filled');
    expect(state.wineBottleState).toBe('opened-with-cork-nearby');
    expect(state.wineAction).toBe('static-presentation');
  });

  it('normalizes winery scene back to sealed no-glass presentation', () => {
    useProductStudioStore.setState({
      ...structuredClone(DEFAULT_PRODUCT_STUDIO_STATE),
      industryProfile: 'wine',
      visualProfile: 'wine',
      photoMode: 'Bottle + Glass Pour',
      wineGlassMode: 'filled',
      wineBottleState: 'opened-with-cork-nearby',
      wineAction: 'controlled-pour',
    });

    useProductStudioStore.getState().setPhotoMode('Winery Scene');

    const state = useProductStudioStore.getState();
    expect(state.wineGlassMode).toBe('none');
    expect(state.wineBottleState).toBe('sealed');
    expect(state.wineAction).toBe('static-presentation');
  });
});
