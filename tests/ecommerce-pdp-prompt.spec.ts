import { test, expect } from 'playwright/test';
import { buildEcommercePdpPrompt } from '../src/lib/productStudio/prompt-builders/buildEcommercePdpPrompt';
import type { ProductAsset } from '../src/lib/productStudio/types';

const PRODUCT: ProductAsset = {
  id: 'p1',
  name: 'Product 1',
  imageUrl: 'https://example.com/p1.png',
};

test.describe('Ecommerce PDP Prompt Builder', () => {
  test('is deterministic and injects safe zone + slot', () => {
    const promptA = buildEcommercePdpPrompt({
      product: PRODUCT,
      slot: 'WHAT_DOES_IT_DO',
      layout: 'image-left-text-right',
      imageSide: 'left',
    });
    const promptB = buildEcommercePdpPrompt({
      product: PRODUCT,
      slot: 'WHAT_DOES_IT_DO',
      layout: 'image-left-text-right',
      imageSide: 'left',
    });

    expect(promptA).toBe(promptB);
    expect(promptA).toContain('You are generating an ecommerce PDP image canvas, not a finished ad.');
    expect(promptA).toContain("safeZone = { side: 'right', widthPercent: 40 }");
    expect(promptA).toContain('This image supports a benefits section.');
    expect(promptA).toContain('Composition must feel balanced and leave generous space for a bullet list.');
  });

  test('does not include old cinematic/editorial/randomization fragments', () => {
    const prompt = buildEcommercePdpPrompt({
      product: PRODUCT,
      slot: 'RESULTS',
      layout: 'image-right-text-left',
      imageSide: 'right',
    });

    const forbidden = [
      'RANDOMIZATION RULES',
      'High-end editorial',
      'No generic stock look',
      'Lens choice:',
      // Allow "No randomized camera angles." (part of the PDP base prompt).
      // Block the old pipeline's positive randomization phrasing.
      'Randomized camera angle:',
      'Randomized distance:',
      'studio-branding',
      'editorial-product',
      'lifestyle-real',
      'ugc-phone',
    ];

    for (const fragment of forbidden) {
      expect(prompt.toLowerCase()).not.toContain(fragment.toLowerCase());
    }
  });
});
