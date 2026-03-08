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
  it('maps bottle + glass pour to controlled pour wine state', () => {
    const mapped = toStudioV2State(makeWineState('Bottle + Glass Pour'));
    const prompt = generateStudioPromptV2(mapped);

    expect(mapped.wineAction).toBe('controlled-pour');
    expect(mapped.wineGlassMode).toBe('filled');
    expect(mapped.wineBottleState).toBe('opened-with-cork-nearby');
    expect(prompt).toContain('SCENE_STYLE: wine pouring editorial photography with controlled hospitality motion.');
  });

  it('renders lineup comparison as wine-family comparison instead of hero fallback', () => {
    const mapped = toStudioV2State(makeWineState('Wine Lineup Comparison'));
    const prompt = generateStudioPromptV2(mapped);

    expect(prompt).toContain('SCENE_STYLE: wine lineup comparison photography with clean varietal spacing and brand-family balance.');
    expect(prompt).toContain('PHOTO_MODE: Wine Lineup Comparison.');
    expect(prompt).not.toContain('PHOTO_MODE_SCENE: Clean studio hero composition.');
  });

  it('renders bottle in hand cutout as cropped-hand wine concept', () => {
    const mapped = toStudioV2State(makeWineState('Bottle In Hand Cutout'));
    const prompt = generateStudioPromptV2(mapped);

    expect(prompt).toContain('SCENE_STYLE: wine hand-held commercial cutout photography with minimal backdrop.');
    expect(prompt).toContain('PHOTO_MODE: Bottle In Hand Cutout.');
    expect(prompt).toContain('Single cropped hand or forearm only.');
    expect(prompt).toContain('No torso.');
  });
});
