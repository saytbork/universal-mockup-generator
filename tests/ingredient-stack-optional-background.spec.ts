import { test, expect } from 'playwright/test';
import { mapSceneToPrompt } from '../src/lib/productStudio/mapSceneToPrompt';
import { DEFAULT_PRODUCT_STUDIO_STATE } from '../src/lib/productStudio/store';

test.describe('Ingredient Stack optional background override', () => {
  test('disabled by default (no Background modifier)', () => {
    const result = mapSceneToPrompt({
      ...DEFAULT_PRODUCT_STUDIO_STATE,
      photoMode: 'Ingredient Stack',
      props: 'strawberries, mint leaves',
      photoModeConfig: {
        ...DEFAULT_PRODUCT_STUDIO_STATE.photoModeConfig,
        ingredientStack: {
          ...DEFAULT_PRODUCT_STUDIO_STATE.photoModeConfig.ingredientStack,
          backgroundEnabled: false,
        },
      },
    } as any);

    expect(result.prompt).not.toContain('Background:');
  });

  test('enabled + custom solid injects Background modifier', () => {
    const result = mapSceneToPrompt({
      ...DEFAULT_PRODUCT_STUDIO_STATE,
      photoMode: 'Ingredient Stack',
      props: 'strawberries, mint leaves',
      backgroundColor: '#12AB34',
      photoModeConfig: {
        ...DEFAULT_PRODUCT_STUDIO_STATE.photoModeConfig,
        ingredientStack: {
          ...DEFAULT_PRODUCT_STUDIO_STATE.photoModeConfig.ingredientStack,
          backgroundEnabled: true,
          backgroundType: 'Solid',
          colorSource: 'Custom Color',
        },
      },
    } as any);

    expect(result.prompt).toContain('Background: solid #12AB34');
  });
});

