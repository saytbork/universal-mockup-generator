import { describe, expect, it } from 'vitest';
import { buildPhotoModeDynamic } from '../builders/buildPhotoModeDynamic';
import { __buildOrderedSegmentsForTest, __buildPromptForTest } from '../pipelines/genericPipeline';
import type { StudioUIState } from '../types/studioTypes';

function base(overrides: Record<string, unknown> = {}): StudioUIState {
  return {
    industryProfile: 'supplements',
    motion: 'static',
    composition: 'hero',
    creativeIntent: 'conversion',
    photoMode: 'Hero Landing Page',
    ...overrides,
  } as StudioUIState;
}

function normalizedSegments(state: StudioUIState): string[] {
  return __buildOrderedSegmentsForTest(state)
    .map((segment) => segment.content.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
}

describe('Studio mini matrix smoke', () => {
  const scenes: Array<{ id: string; state: StudioUIState }> = [
    { id: 'hero', state: base({ photoMode: 'Hero Landing Page' }) },
    {
      id: 'visual-style-dark-premium',
      state: base({ photoMode: 'Hero Landing Page', visualStyle: 'Dark Premium Studio', visualStyleCategory: 'studio' }),
    },
    {
      id: 'macro-dew-label',
      state: base({
        photoMode: 'Macro Dew Label',
        composition: 'macro',
        macroTightness: 'Extreme',
        dropletMode: 'Drops',
        dropletDensity: 'High',
        highlightControl: 'Balanced',
      }),
    },
    { id: 'foam', state: base({ photoMode: 'Foam & Texture', textureType: 'Foam' }) },
    { id: 'textured-bed', state: base({ photoMode: 'Textured Bed / Scatter Base', ingredientObjects: 'matcha powder' as any }) },
    { id: 'gel-smear', state: base({ photoMode: 'Gel Smear Editorial' }) },
    { id: 'pool-water', state: base({ photoMode: 'Pool Water' }) },
    { id: 'splash', state: base({ photoMode: 'Splash Shot', motion: 'pouring', requestedModifiers: ['splash'] }) },
    {
      id: 'wine-macro',
      state: base({
        industryProfile: 'wine',
        photoMode: 'Wine Macro Label',
        composition: 'macro',
        wineEngineVersion: 4,
        wineBottleState: 'sealed',
        wineGlassMode: 'none',
        wineClosureType: 'from-reference',
      }),
    },
    {
      id: 'routine-carousel',
      state: base({
        photoMode: 'Routine Carousel',
        composition: 'carousel',
        routineFrameCount: 3,
        routineFlow: 'Left → Right',
        routineConsistency: 'Same background',
        routineHeroFrame: 'First',
      }),
    },
    { id: 'ingredient-flat-lay', state: base({ photoMode: 'Ingredient Flat Lay', composition: 'flat-lay' }) },
  ];

  for (const scene of scenes) {
    it(`scene ${scene.id} generates deterministic non-empty prompt`, () => {
      const prompt = __buildPromptForTest(scene.state);
      expect(prompt.trim().length).toBeGreaterThan(0);

      const lines = normalizedSegments(scene.state);
      const unique = new Set(lines);
      expect(unique.size).toBe(lines.length);

      expect(prompt).not.toContain('buildEnvironmentBlock(');
      expect(prompt).not.toContain('resolveEnvironment(');

      if (scene.id === 'splash') {
        expect(prompt).toContain('STUDIO_PHYSICS_MODEL:');
      }

      if (scene.id === 'wine-macro') {
        expect(prompt).toContain('APPLICATION_ZONE: front label.');
      }

      if (scene.id === 'routine-carousel') {
        expect(prompt).toContain('ROUTINE_CAROUSEL_MODE: active.');
        expect(buildPhotoModeDynamic(scene.state)).not.toBe('');
      }

      if (scene.id === 'macro-dew-label') {
        expect(prompt).toContain('MACRO_DEW_LABEL_MODE: active.');
        expect(prompt).toContain('STUDIO_CAMERA_DISTANCE: Macro.');
        expect(buildPhotoModeDynamic(scene.state)).not.toBe('');
      }

      if (scene.id === 'visual-style-dark-premium') {
        expect(prompt).toContain('VISUAL_STYLE_MODE: active.');
        expect(prompt).toContain('VISUAL_STYLE_NAME: dark-premium-studio.');
      }

    });
  }

  it('Nature Elements case contains all 4 realism anchors', () => {
    const prompt = __buildPromptForTest(base({ environmentPreset: 'Nature Elements' }));
    expect(prompt).toContain('NATURAL_MATERIAL_REALISM:');
    expect(prompt).toContain('NO_SYNTHETIC_RENDERING:');
    expect(prompt).toContain('SURFACE_MICRODETAIL:');
    expect(prompt).toContain('PHOTOGRAPHIC_LIGHT_RESPONSE:');
  });
});
