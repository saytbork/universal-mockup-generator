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
    expect(prompt).toContain('SCENE_STYLE: hyper-real professional wine advertising photography.');
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

  it('keeps wine hero surfaces clean and premium', () => {
    const mapped = toStudioV2State(makeWineHeroState({ contextPreset: 'Dark Luxury Studio' }));
    const prompt = generateStudioPromptV2(mapped);

    expect(prompt).not.toContain('Tiny dust particles');
    expect(prompt).not.toContain('surface scuffs');
    expect(prompt).not.toContain('cleaning marks');
    expect(prompt).toContain('No visible dust, salt, residue, or debris.');
    expect(prompt).toContain('Clean premium tabletop or set surface.');
  });

  it('treats 45 hero as camera viewpoint, not bottle tilt', () => {
    const mapped = toStudioV2State(makeWineHeroState());
    const prompt = generateStudioPromptV2(mapped);

    expect(prompt).toContain('PHOTO_MODE: Hero Landing Page.');
    expect(prompt).toContain('45° hero describes camera viewpoint only, never physical bottle lean.');
    expect(prompt).toContain('The bottle must remain perfectly upright');
  });
});
