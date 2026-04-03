import { describe, expect, it } from 'vitest';
import { DEFAULT_PRODUCT_STUDIO_STATE, useProductStudioStore } from '../../productStudio/store';
import type { ProductAsset } from '../../productStudio/types';

const TEST_PRODUCTS: ProductAsset[] = [
  { id: 'wine-1', name: 'Wine Bottle 1', imageUrl: 'https://example.com/wine-1.png' },
  { id: 'wine-2', name: 'Wine Bottle 2', imageUrl: 'https://example.com/wine-2.png' },
];

describe('wine photo mode state normalization', () => {
  it('normalizes bottle + glass into served-open wine state', () => {
    useProductStudioStore.setState({
      ...structuredClone(DEFAULT_PRODUCT_STUDIO_STATE),
      industryProfile: 'wine',
      visualProfile: 'wine',
      photoMode: 'Hero Landing Page',
      wineServeMode: 'bottle-only',
      wineBottleFillMode: 'just-opened',
      wineGlassMode: 'none',
      wineBottleState: 'sealed',
      wineAction: 'static-presentation',
    });

    useProductStudioStore.getState().setPhotoMode('Bottle + Glass');

    const state = useProductStudioStore.getState();
    expect(state.wineServeMode).toBe('served');
    expect(state.wineBottleFillMode).toBe('just-opened');
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
      wineServeMode: 'pouring',
      wineBottleFillMode: 'partially-served',
      wineGlassMode: 'filled',
      wineBottleState: 'opened-with-cork-nearby',
      wineAction: 'controlled-pour',
    });

    useProductStudioStore.getState().setPhotoMode('Winery Scene');

    const state = useProductStudioStore.getState();
    expect(state.wineServeMode).toBe('bottle-only');
    expect(state.wineBottleFillMode).toBe('just-opened');
    expect(state.wineGlassMode).toBe('none');
    expect(state.wineBottleState).toBe('sealed');
    expect(state.wineAction).toBe('static-presentation');
  });

  it('normalizes wine lineup comparison into bottle-only bundle lineup', () => {
    useProductStudioStore.setState({
      ...structuredClone(DEFAULT_PRODUCT_STUDIO_STATE),
      industryProfile: 'wine',
      visualProfile: 'wine',
      products: TEST_PRODUCTS,
      activeProductId: TEST_PRODUCTS[0].id,
      photoMode: 'Bottle + Glass',
      wineServeMode: 'served',
      wineBottleFillMode: 'partially-served',
      wineGlassMode: 'filled',
      wineBottleState: 'opened-with-cork-nearby',
      wineAction: 'static-presentation',
    });

    useProductStudioStore.getState().setPhotoMode('Wine Lineup Comparison');

    const state = useProductStudioStore.getState();
    expect(state.wineServeMode).toBe('bottle-only');
    expect(state.wineGlassMode).toBe('none');
    expect(state.wineBottleState).toBe('sealed');
    expect(state.bundle.enabled).toBe(true);
    expect(state.bundle.mode).toBe('lineup');
    expect(state.bundle.primaryProductId).toBe(TEST_PRODUCTS[0].id);
    expect(state.bundle.secondaryProductIds).toEqual([TEST_PRODUCTS[1].id]);
  });

  it('normalizes hosting pour into a pouring wine lifestyle state', () => {
    useProductStudioStore.setState({
      ...structuredClone(DEFAULT_PRODUCT_STUDIO_STATE),
      industryProfile: 'wine',
      visualProfile: 'wine',
      sceneType: 'studio-branding',
      photoMode: 'Hero Landing Page',
      wineServeMode: 'bottle-only',
      wineBottleFillMode: 'just-opened',
      wineGlassMode: 'none',
      wineBottleState: 'sealed',
      wineAction: 'static-presentation',
    });

    useProductStudioStore.getState().setPhotoMode('Hosting Pour');

    const state = useProductStudioStore.getState();
    expect(state.sceneType).toBe('lifestyle-real');
    expect(state.mode).toBe('lifestyle-real');
    expect(state.wineServeMode).toBe('pouring');
    expect(state.wineBottleFillMode).toBe('partially-served');
    expect(state.wineGlassMode).toBe('filled');
    expect(state.wineBottleState).toBe('opened-with-cork-nearby');
    expect(state.wineAction).toBe('controlled-pour');
  });
});
