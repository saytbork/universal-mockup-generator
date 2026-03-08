import { describe, expect, it } from 'vitest';
import { toStudioV2State } from '../../productStudio/promptRouter';
import { generateStudioPromptV2 } from '../index';
import type { ProductStudioState } from '../../productStudio/types';
import { DEFAULT_PRODUCT_STUDIO_STATE } from '../../productStudio/store';

function makeWineHeroState(overrides: Partial<ProductStudioState> = {}): ProductStudioState {
  return {
    ...structuredClone(DEFAULT_PRODUCT_STUDIO_STATE),
    industryProfile: 'wine',
    visualProfile: 'wine',
    photoMode: 'Hero Landing Page',
    contextPreset: 'Vineyard Golden Hour',
    definition: { type: 'custom' } as ProductStudioState['definition'],
    ...overrides,
  } as ProductStudioState;
}

describe('wine hero landing isolation', () => {
  it('uses wine world builder instead of generic editorial hero scene', () => {
    const mapped = toStudioV2State(makeWineHeroState());
    const prompt = generateStudioPromptV2(mapped);

    expect(prompt).toContain('WINE_ENVIRONMENT: vineyard.');
    expect(prompt).toContain('SCENE_STYLE: wine editorial photography.');
    expect(prompt).not.toContain('PHOTO_MODE_SCENE: Clean studio hero composition.');
    expect(prompt).not.toContain('Product isolated for hero landing page.');
  });

  it('ignores stale glass state for wine hero landing', () => {
    const mapped = toStudioV2State(
      makeWineHeroState({
        wineGlassMode: 'filled' as any,
        wineBottleState: undefined,
      })
    );
    const prompt = generateStudioPromptV2(mapped);

    expect(mapped.wineGlassMode).toBe('none');
    expect(mapped.wineBottleState).toBe('sealed');
    expect(prompt).not.toContain('WINE_GLASS:');
    expect(prompt).toContain('NO_GLASS:');
    expect(prompt).toContain('serveState=none');
  });
});
