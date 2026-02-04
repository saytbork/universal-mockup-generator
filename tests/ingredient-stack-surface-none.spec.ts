import { test, expect } from 'playwright/test';
import { mapSceneToPrompt } from '../src/lib/productStudio/mapSceneToPrompt';
import { DEFAULT_PRODUCT_STUDIO_STATE } from '../src/lib/productStudio/store';

test('Ingredient Stack surfaceType None yields seamless solid plane and omits "surface type: None"', () => {
  const result = mapSceneToPrompt({
    ...DEFAULT_PRODUCT_STUDIO_STATE,
    photoMode: 'Ingredient Stack',
    props: 'strawberries, mint leaves',
    backgroundColor: '#112233',
    photoModeConfig: {
      ...DEFAULT_PRODUCT_STUDIO_STATE.photoModeConfig,
      ingredientStack: {
        ...DEFAULT_PRODUCT_STUDIO_STATE.photoModeConfig.ingredientStack,
        backgroundEnabled: true,
        backgroundType: 'Solid',
        colorSource: 'Custom Color',
      },
      dynamic: {
        'Ingredient Stack': {
          surfaceType: 'None',
        },
      },
    },
  } as any);

  expect(result.prompt).toContain('Background: solid #112233');
  expect(result.prompt).toContain('INGREDIENTS: strawberries, mint leaves.');
  expect(result.prompt).toContain('Surface: seamless solid-color plane');
  expect(result.prompt.toLowerCase()).not.toContain('surface type: none');
  expect(result.prompt).not.toContain('Secondary props:');
  expect(result.prompt).not.toContain('Vary props and micro-environment accents');
  expect(result.prompt).not.toContain('environment details');
  expect(result.prompt).toContain('Ingredients are arranged naturally around the product.');
  expect(result.prompt).toContain('All ingredients rest on the same surface as the product.');
  expect(result.prompt.toLowerCase()).not.toContain('stack');
  expect(result.prompt.toLowerCase()).not.toContain('vertical stacking');
  expect(result.prompt.toLowerCase()).not.toContain('hierarchy');
  expect(result.prompt.toLowerCase()).not.toContain('layout style:');
});
