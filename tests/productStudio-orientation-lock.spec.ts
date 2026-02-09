import { test, expect } from 'playwright/test';
import { generatePreviewPrompt } from '../src/lib/productStudio/builders';
import { DEFAULT_PRODUCT_STUDIO_STATE, getDefaultPhysical } from '../src/lib/productStudio/store';

function withSingleProduct(overrides: Record<string, any> = {}) {
  return {
    ...DEFAULT_PRODUCT_STUDIO_STATE,
    products: [
      {
        id: 'p1',
        name: 'Product 1',
        imageUrl: 'https://example.com/p1.png',
      },
    ],
    activeProductId: 'p1',
    ...overrides,
  } as any;
}

test.describe('ProductStudio orientation lock', () => {
  test('static/opened prompts lock upright orientation', () => {
    const staticPrompt = generatePreviewPrompt(withSingleProduct({ stateMotion: 'static' })) || '';
    const openedPrompt = generatePreviewPrompt(withSingleProduct({ stateMotion: 'opened' })) || '';

    expect(staticPrompt).toContain('ORIENTATION LOCK: Keep the product upright on its base.');
    expect(openedPrompt).toContain('ORIENTATION LOCK: Keep the product upright on its base.');
  });

  test('spilled prompt keeps horizontal orientation rule (no upright lock)', () => {
    const spilledPrompt = generatePreviewPrompt(withSingleProduct({
      photoMode: 'Wet Rock Ripples',
      definition: {
        type: 'capsules',
        physical: getDefaultPhysical('capsules'),
      },
      stateMotion: 'spilled',
    })) || '';

    expect(spilledPrompt).toContain('Orientation is horizontal or slightly tilted.');
    expect(spilledPrompt).not.toContain('Keep the product upright on its base');
  });
});
