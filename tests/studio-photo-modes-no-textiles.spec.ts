import { test, expect } from 'playwright/test';
import { mapSceneToPrompt } from '../src/lib/productStudio/mapSceneToPrompt';
import { DEFAULT_PRODUCT_STUDIO_STATE } from '../src/lib/productStudio/store';

const TEXTILE_TERMS = /\b(linen|textile|fabric|cloth|towel)\b/i;

test.describe('Studio Photo Modes - no textiles', () => {
  const studioPhotoModes = [
    'Minimal Bathroom Vanity',
    'Brand Campaign',
    'Luxury Editorial Tabletop',
    'Soft Wellness Morning',
    'Outdoor Energy Boost',
    'UGC Premium Simulation',
    'Dark Premium Studio',
    'Monochrome Brand',
    'Tech Clean Studio',
  ] as const;

  for (const photoMode of studioPhotoModes) {
    test(`${photoMode} does not inject textile terms or environment mega prompt`, () => {
      const result = mapSceneToPrompt({
        ...DEFAULT_PRODUCT_STUDIO_STATE,
        mode: 'studio',
        sceneType: 'studio-branding',
        photoMode,
        environmentContext: null,
        blankSpaceEnabled: false,
        props: '',
      } as any);

      expect(result.prompt).not.toMatch(TEXTILE_TERMS);
      expect(result.prompt).not.toContain('INSTRUCTIONS:');
    });
  }
});

