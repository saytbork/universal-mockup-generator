import { describe, expect, it } from 'vitest';
import { __buildPromptForTest } from '../pipelines/genericPipeline';
import type { StudioUIState } from '../types/studioTypes';
import { PHOTO_MODE_SCHEMAS } from '../../productStudio/photoModeSchema';

function base(overrides: Partial<StudioUIState> = {}): StudioUIState {
  return {
    industryProfile: 'supplements',
    motion: 'static',
    composition: 'hero',
    creativeIntent: 'conversion',
    photoMode: 'Hero Landing Page',
    ...overrides,
  } as StudioUIState;
}

describe('new special effects modes', () => {
  const modes = [
    'Caustic Light Ripples',
    'Prism Rainbow Refractions',
    'Glass Refraction Panels',
    'Micro Mist Halo',
    'Shadow Pattern Projection',
  ] as const;

  for (const mode of modes) {
    it(`${mode} has visible schema settings for the Step3 panel`, () => {
      const schema = PHOTO_MODE_SCHEMAS[mode];

      expect(schema).toBeDefined();
      expect(schema?.subOptions.length).toBeGreaterThan(0);
    });

    it(`${mode} emits scene context without splash physics`, () => {
      const prompt = __buildPromptForTest(base({ photoMode: mode }));

      expect(prompt).toContain('PHOTO_MODE_SCENE:');
      expect(prompt).not.toContain('STUDIO_PHYSICS_MODEL:');
      expect(prompt).toContain('STUDIO_MODIFIERS: none.');
    });
  }
});
