import { describe, expect, it } from 'vitest';
import { toStudioV2State } from '../../productStudio/promptRouter';
import { generateStudioPromptV2 } from '../index';
import type { ProductStudioState, PhotoMode } from '../../productStudio/types';
import { DEFAULT_PRODUCT_STUDIO_STATE } from '../../productStudio/store';

function makeWineState(photoMode: PhotoMode, overrides: Partial<ProductStudioState> = {}): ProductStudioState {
  return {
    ...structuredClone(DEFAULT_PRODUCT_STUDIO_STATE),
    industryProfile: 'wine',
    visualProfile: 'wine',
    photoMode,
    contextPreset: 'Dark Luxury Studio',
    definition: { type: 'custom' } as ProductStudioState['definition'],
    ...overrides,
  } as ProductStudioState;
}

describe('wine concept modes', () => {
  it('keeps bottle + glass composition aligned with served-open wine physics', () => {
    const mapped = toStudioV2State(makeWineState('Bottle + Glass'));
    const prompt = generateStudioPromptV2(mapped);

    expect(mapped.wineGlassMode).toBe('filled');
    expect(mapped.wineBottleState).toBe('opened-with-cork-nearby');
    expect(prompt).toContain('bottleState=open; serveState=served;');
    expect(prompt).toContain('COMPOSITION: BOTTLE_AND_GLASS. Opened service bottle and filled wine glass.');
    expect(prompt).toContain('PHOTO_MODE: Bottle + Glass.');
    expect(prompt).not.toContain('Sealed bottle and filled wine glass.');
  });

  it('maps bottle + glass pour to controlled pour wine state', () => {
    const mapped = toStudioV2State(makeWineState('Bottle + Glass Pour'));
    const prompt = generateStudioPromptV2(mapped);

    expect(mapped.wineAction).toBe('controlled-pour');
    expect(mapped.wineGlassMode).toBe('filled');
    expect(mapped.wineBottleState).toBe('opened-with-cork-nearby');
    expect(prompt).toContain('SCENE_STYLE: hyper-real professional wine advertising photography with controlled hospitality pour motion.');
    expect(prompt).toContain('BOTTLE_TILT_PHYSICS:');
    expect(prompt).toContain('LIQUID_STREAM_PHYSICS:');
    expect(prompt).toContain('Never emit liquid from below the bottle rim');
  });

  it('renders lineup comparison as wine-family comparison instead of hero fallback', () => {
    const mapped = toStudioV2State(makeWineState('Wine Lineup Comparison'));
    const prompt = generateStudioPromptV2(mapped);

    expect(prompt).toContain('SCENE_STYLE: hyper-real professional wine advertising lineup photography with clean varietal spacing and brand-family balance.');
    expect(prompt).toContain('PHOTO_MODE: Wine Lineup Comparison.');
    expect(prompt).not.toContain('PHOTO_MODE_SCENE: Clean studio hero composition.');
  });

  it('forces winery scene environment ownership and emits dedicated winery scene guidance', () => {
    const mapped = toStudioV2State(makeWineState('Winery Scene', { contextPreset: 'Dark Luxury Studio' }));
    const prompt = generateStudioPromptV2(mapped);

    expect(mapped.wineEnvironmentVariation).toBe('dark-cellar');
    expect(prompt).toContain('WINE_ENVIRONMENT: dark-cellar.');
    expect(prompt).toContain('PHOTO_MODE: Winery Scene.');
    expect(prompt).toContain('SCENE_STYLE: hyper-real luxury wine advertising photography in an authentic cellar environment.');
    expect(prompt).not.toContain('WINE_ENVIRONMENT: black-studio.');
  });

  it('uses explicit sparkling flute guidance when selected for served wine scenes', () => {
    const mapped = toStudioV2State(
      makeWineState('Bottle + Glass Pour', {
        wineType: 'sparkling-white',
        wineGlassType: 'sparkling-flute' as any,
      })
    );
    const prompt = generateStudioPromptV2(mapped);

    expect(prompt).toContain('a slender sparkling flute');
  });

  it('renders bottle in hand cutout as cropped-hand wine concept', () => {
    const mapped = toStudioV2State(makeWineState('Bottle In Hand Cutout'));
    const prompt = generateStudioPromptV2(mapped);

    expect(prompt).toContain('SCENE_STYLE: hyper-real professional wine advertising cutout photography with minimal backdrop.');
    expect(prompt).toContain('PHOTO_MODE: Bottle In Hand Cutout.');
    expect(prompt).toContain('Single cropped hand or forearm only.');
    expect(prompt).toContain('No torso.');
  });
});
