import { test, expect } from 'playwright/test';
import { shouldSendProductReferenceImages } from '../src/services/imageGenerationService';

test('Hide-product prompt disables product reference images', () => {
  const prompt =
    'CRITICAL: No product visible anywhere in frame (no packaging, no bottles, no jars, no labels, no supplement containers).';
  const products = [{ id: 'p1', base64: 'x', mimeType: 'image/png', name: 'p' }];

  expect(shouldSendProductReferenceImages(prompt, products as any)).toBe(false);
});

