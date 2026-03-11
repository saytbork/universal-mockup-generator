import { describe, expect, it } from 'vitest';
import { __buildPromptForTest } from '../pipelines/genericPipeline';
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

describe('Environment + photo mode combination', () => {
  it('combines Macro Dew Label with environment contract', () => {
    const prompt = __buildPromptForTest(
      base({
        photoMode: 'Macro Dew Label',
        composition: 'macro',
        environmentPreset: 'Bathroom Vanity',
        macroTightness: 'Extreme',
        dropletMode: 'Clean',
        dropletDensity: 'Balanced',
        highlightControl: 'Balanced',
      })
    );

    expect(prompt).toContain('PHOTO_MODE_SCENE:');
    expect(prompt).toContain('ENVIRONMENT_STYLE_MODE: active.');
    expect(prompt).toContain('ENVIRONMENT_STYLE_NAME: bathroom-vanity.');
    expect(prompt).toContain('ENVIRONMENT_CONTEXT:');
    expect(prompt).toContain('MACRO_DEW_LABEL_MODE: active.');
  });

  it('combines Splash Shot with environment contract', () => {
    const prompt = __buildPromptForTest(
      base({
        photoMode: 'Splash Shot',
        environmentPreset: 'Nature Elements',
        motion: 'pouring',
        requestedModifiers: ['splash'],
      })
    );

    expect(prompt).toContain('PHOTO_MODE_SCENE:');
    expect(prompt).toContain('INTERACTION_MODE: liquid impact.');
    expect(prompt).toContain('ENVIRONMENT_STYLE_MODE: active.');
    expect(prompt).toContain('ENVIRONMENT_STYLE_NAME: nature-elements.');
    expect(prompt).toContain('ENVIRONMENT_CONTEXT:');
  });
});
