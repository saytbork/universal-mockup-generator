import { beforeEach, describe, expect, it } from 'vitest';
import { DEFAULT_PRODUCT_STUDIO_STATE, useProductStudioStore } from '../../productStudio/store';
import { generateProductJobs } from '../../productStudio/builders';
import type { ProductAsset } from '../../productStudio/types';

const TEST_PRODUCT_A: ProductAsset = {
  id: 'bundle-1',
  name: 'Bundle Product One',
  imageUrl: 'https://example.com/bundle-1.png',
  palette: {
    dominant: '#234567',
    secondary: '#d9d4c8',
    accent: '#112233',
  },
};

const TEST_PRODUCT_B: ProductAsset = {
  id: 'bundle-2',
  name: 'Bundle Product Two',
  imageUrl: 'https://example.com/bundle-2.png',
  palette: {
    dominant: '#6a4020',
    secondary: '#efe5d0',
    accent: '#2a1810',
  },
};

describe('generic bundle lineup prompt lock', () => {
  beforeEach(() => {
    useProductStudioStore.setState(structuredClone(DEFAULT_PRODUCT_STUDIO_STATE));
  });

  it('keeps lineup bundle prompts plural and never falls back to singular reference wording', () => {
    const store = useProductStudioStore.getState();

    store.addProduct(TEST_PRODUCT_A);
    store.addProduct(TEST_PRODUCT_B);
    store.setControlTier('pro');
    store.setBundleEnabled(true);
    store.setBundleMode('lineup');

    const state = useProductStudioStore.getState();
    const jobs = generateProductJobs(state);
    const prompt = jobs[0]?.prompt ?? '';

    expect(state.bundle.enabled).toBe(true);
    expect(state.bundle.mode).toBe('lineup');
    expect(jobs).toHaveLength(1);
    expect(prompt).toContain('BUNDLE: Exactly 2 products must appear in the scene.');
    expect(prompt).toContain('Use the uploaded product images as the exact products to place in the scene.');
    expect(prompt).toContain('Render the scene with premium commercial polish while keeping real photographic behavior.');
    expect(prompt).not.toContain('Use the uploaded product image as a visual guide for geometry, proportions, and label');
  });
});
