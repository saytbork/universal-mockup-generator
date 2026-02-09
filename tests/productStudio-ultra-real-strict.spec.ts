import { test, expect } from 'playwright/test';
import { mapSceneToPrompt } from '../src/lib/productStudio/mapSceneToPrompt';
import { DEFAULT_PRODUCT_STUDIO_STATE, useProductStudioStore } from '../src/lib/productStudio/store';

test.describe('ProductStudio Ultra Real Strict Mode', () => {
  test('is enabled by default and injects strict realism block', () => {
    const result = mapSceneToPrompt({
      ...DEFAULT_PRODUCT_STUDIO_STATE,
      sceneType: 'studio-branding',
      mode: 'studio',
      environmentContext: null,
      photoMode: 'Brand Campaign',
      ultraRealStrict: true,
    } as any);

    expect(result.prompt).toContain('ULTRA-REAL STRICT MODE: ON.');
    expect(result.prompt).toContain('no plastic-like texture response');
  });

  test('can be disabled via store action', () => {
    useProductStudioStore.setState({
      ...DEFAULT_PRODUCT_STUDIO_STATE,
      ultraRealStrict: true,
    });

    useProductStudioStore.getState().setUltraRealStrict(false);
    expect(useProductStudioStore.getState().ultraRealStrict).toBe(false);

    const result = mapSceneToPrompt({
      ...useProductStudioStore.getState(),
      sceneType: 'studio-branding',
      mode: 'studio',
      environmentContext: null,
      photoMode: 'Brand Campaign',
    } as any);

    expect(result.prompt).not.toContain('ULTRA-REAL STRICT MODE: ON.');
  });
});

