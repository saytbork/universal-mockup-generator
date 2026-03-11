import { describe, expect, it } from 'vitest';
import { __buildPromptForTest, __validateFinalPromptForTest } from '../pipelines/genericPipeline';
import type { StudioUIState } from '../types/studioTypes';

function baseState(overrides: Partial<StudioUIState> = {}): StudioUIState {
  return {
    industryProfile: 'supplements',
    photoMode: 'Hero Landing Page',
    motion: 'static',
    composition: 'hero',
    creativeIntent: 'conversion',
    ...overrides,
  } as StudioUIState;
}

describe('prompt integrity duplicate blocks', () => {
  it('throws for identical normalized blocks split by double newline', () => {
    const prompt = [
      'STUDIO_WORLD: studio.',
      'STUDIO_WORLD:   studio.',
    ].join('\n\n');

    expect(() => __validateFinalPromptForTest(prompt, baseState())).toThrow(
      '[PIPELINE_INTEGRITY_FAILURE:DUPLICATE_NORMALIZED_BLOCK]'
    );
  });

  it('does not throw for near-duplicate blocks with different text', () => {
    const prompt = [
      'STUDIO_WORLD: studio.',
      'STUDIO_WORLD: studio with haze.',
    ].join('\n\n');

    expect(() => __validateFinalPromptForTest(prompt, baseState())).not.toThrow();
  });

  it('accepts splash prompt assembled through pipeline', () => {
    const splashState = baseState({
      photoMode: 'Splash Shot',
      motion: 'pouring',
      requestedModifiers: ['splash'],
    });

    const prompt = __buildPromptForTest(splashState);
    expect(() => __validateFinalPromptForTest(prompt, splashState)).not.toThrow();
  });
});

