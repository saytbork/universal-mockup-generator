import { test, expect } from 'playwright/test';
import { mapSceneToPrompt } from '../src/lib/productStudio/mapSceneToPrompt';
import { DEFAULT_PRODUCT_STUDIO_STATE } from '../src/lib/productStudio/store';

test.describe('ProductStudio Environment Injection', () => {
  test('Environment mode injects macro/micro into scene prompt', () => {
    const result = mapSceneToPrompt({
      ...DEFAULT_PRODUCT_STUDIO_STATE,
      blankSpaceEnabled: false,
      environmentContext: { macro: 'kitchen', micro: 'countertop' },
      customEnvironmentText: '',
      customMicroPlaceText: '',
      photoMode: 'Pastel Picnic',
      props: '',
      ingredientLayout: 'auto',
      lighting: 'overcast',
    } as any);

    expect(result.prompt).toContain('Kitchen interior setting');
    expect(result.prompt).toContain('Product placed on a countertop');
    expect(result.prompt).toContain('Overcast daylight');
  });
});
