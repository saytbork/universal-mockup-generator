import { beforeEach, describe, expect, it } from 'vitest';
import { useProductStudioStore, DEFAULT_PRODUCT_STUDIO_STATE } from '../../productStudio/store';
import { generateProductJobs } from '../../productStudio/builders';
import type { ProductAsset } from '../../productStudio/types';

const TEST_PRODUCT: ProductAsset = {
  id: 'wine-1',
  name: 'Wine Bottle',
  imageUrl: 'https://example.com/wine.png',
  palette: {
    dominant: '#6f1320',
    secondary: '#d8c1a2',
    accent: '#3a0d14',
  },
};

const TEST_PRODUCT_2: ProductAsset = {
  id: 'wine-2',
  name: 'Wine Bottle Reserve',
  imageUrl: 'https://example.com/wine-2.png',
  palette: {
    dominant: '#203040',
    secondary: '#d7d1c3',
    accent: '#6f1320',
  },
};

describe('wine store flow', () => {
  beforeEach(() => {
    useProductStudioStore.setState(structuredClone(DEFAULT_PRODUCT_STUDIO_STATE));
  });

  it('preserves wine module environment and micro-variation selections through generateProductJobs', () => {
    const store = useProductStudioStore.getState();

    store.addProduct(TEST_PRODUCT);
    store.setVisualProfile('wine');
    store.setPhotoMode('Hero Landing Page');
    store.setContextPreset('');
    store.setWineEnvironment('Marble Bar');
    store.setWineMicroVariation({
      season: 'autumn',
      dewOnGlass: true,
      microProps: 'cork-and-corkscrew',
    });

    const state = useProductStudioStore.getState();
    const jobs = generateProductJobs(state);
    const prompt = jobs[0]?.prompt ?? '';

    expect(state.industryProfile).toBe('wine');
    expect(state.visualProfile).toBe('wine-prestige');
    expect(state.wineServeMode).toBe('bottle-only');
    expect(state.wineEnvironment).toBe('Marble Bar');
    expect(state.wineMicroVariation).toMatchObject({
      season: 'autumn',
      dewOnGlass: true,
      microProps: 'cork-and-corkscrew',
    });

    expect(jobs).toHaveLength(1);
    expect(prompt).toContain('WINE_ENVIRONMENT: marble-bar.');
    expect(prompt).toContain('WINE_ENVIRONMENT_CONTEXT: background context: real hospitality bar backdrop with restrained depth and believable reflections; surface: dark marble or polished stone.');
    expect(prompt).toContain('WINE_MICRO_VARIATION:');
    expect(prompt).toContain('autumn');
    expect(prompt).toContain('condensation');
    expect(prompt).toContain('corkscrew');
  });

  it('uses a single bundle prompt for wine lineup comparison instead of per-product served prompts', () => {
    const store = useProductStudioStore.getState();

    store.addProduct(TEST_PRODUCT);
    store.addProduct(TEST_PRODUCT_2);
    store.setVisualProfile('wine');
    store.setPhotoMode('Bottle + Glass');

    useProductStudioStore.setState({
      wineServeMode: 'served',
      wineBottleFillMode: 'partially-served',
      wineGlassMode: 'filled',
    });

    store.setPhotoMode('Wine Lineup Comparison');

    const state = useProductStudioStore.getState();
    const jobs = generateProductJobs(state);
    const prompt = jobs[0]?.prompt ?? '';

    expect(state.bundle.enabled).toBe(true);
    expect(state.bundle.mode).toBe('lineup');
    expect(state.wineServeMode).toBe('bottle-only');
    expect(jobs).toHaveLength(1);
    expect(prompt).toContain('PHOTO_MODE: Wine Lineup Comparison.');
    expect(prompt).toContain('BUNDLE: Exactly 2 products must appear in the scene.');
    expect(prompt).toContain('Use the uploaded product images as visual guides for geometry, proportions, and label');
    expect(prompt).not.toContain('Use the uploaded product image as a visual guide for geometry, proportions, and label');
    expect(prompt).toContain('NO_GLASS: No wine glass in the scene.');
    expect(prompt).not.toContain('WINE_GLASS:');
  });

  it('keeps contextual wine service modes inside studio scene type while preserving wine prompt routing', () => {
    const store = useProductStudioStore.getState();

    store.addProduct(TEST_PRODUCT);
    store.setVisualProfile('wine');
    store.setPhotoMode('Social Table Served');

    const socialState = useProductStudioStore.getState();
    const socialPrompt = generateProductJobs(socialState)[0]?.prompt ?? '';

    expect(socialState.sceneType).toBe('studio-branding');
    expect(socialState.mode).toBe('studio');
    expect(socialPrompt).toContain('PHOTO_MODE: Social Table Served.');
    expect(socialPrompt).toContain('WINE_ENVIRONMENT_VARIATION: luxury-dining.');

    store.setPhotoMode('Hosting Pour');

    const pourState = useProductStudioStore.getState();
    const pourPrompt = generateProductJobs(pourState)[0]?.prompt ?? '';

    expect(pourState.photoMode).toBe('Hosting Pour');
    expect(pourState.sceneType).toBe('studio-branding');
    expect(pourState.mode).toBe('studio');
    expect(pourPrompt).toContain('WINE_ENVIRONMENT_VARIATION: modern-kitchen.');
    expect(pourPrompt).toContain('Editorial hosting moment with active wine service.');
    expect(pourPrompt).toContain('The pour must show a visible cropped hand or forearm physically supporting the bottle.');
    expect(pourPrompt).not.toContain('The scene must contain only the product and environmental elements. No people, no visible human anatomical elements, no human presence unless explicitly defined by Product Interaction.');
  });

  it('prefers manual wine environment over stale context preset when building wine prompts', () => {
    const store = useProductStudioStore.getState();

    store.addProduct(TEST_PRODUCT);
    store.setVisualProfile('wine');
    store.setPhotoMode('Editorial Bottle Tabletop');
    store.setContextPreset('Dark Luxury Studio');
    store.setWineEnvironment('Marble Bar');

    const state = useProductStudioStore.getState();
    const prompt = generateProductJobs(state)[0]?.prompt ?? '';

    expect(state.contextPreset).toBe('Dark Luxury Studio');
    expect(state.wineEnvironment).toBe('Marble Bar');
    expect(prompt).toContain('WINE_ENVIRONMENT_VARIATION: marble-bar.');
    expect(prompt).not.toContain('WINE_ENVIRONMENT_VARIATION: black-studio.');
  });

  it('prefers manual wine environment over lifestyle photo-mode auto overrides', () => {
    const store = useProductStudioStore.getState();

    store.addProduct(TEST_PRODUCT);
    store.setVisualProfile('wine');
    store.setWineEnvironment('Marble Bar');
    store.setPhotoMode('Outdoor Toast');

    const state = useProductStudioStore.getState();
    const prompt = generateProductJobs(state)[0]?.prompt ?? '';

    expect(state.wineEnvironment).toBe('Marble Bar');
    expect(prompt).toContain('WINE_ENVIRONMENT_VARIATION: marble-bar.');
    expect(prompt).not.toContain('WINE_ENVIRONMENT_VARIATION: sunlit-table.');
  });
});
