import { describe, expect, it } from 'vitest';
import { buildPhotoModeDynamic } from '../builders/buildPhotoModeDynamic';
import { __buildPromptForTest } from '../pipelines/genericPipeline';
import type { StudioUIState } from '../types/studioTypes';

function base(overrides: Record<string, unknown> = {}): StudioUIState {
  return {
    industryProfile: 'supplements',
    motion: 'static',
    composition: 'carousel',
    creativeIntent: 'conversion',
    photoMode: 'Routine Carousel',
    ...overrides,
  } as StudioUIState;
}

describe('Routine Carousel contract', () => {
  it('basic routine carousel emits real contract', () => {
    const state = base({
      routineFrameCount: 3,
      routineFlow: 'Left → Right',
      routineConsistency: 'Same background',
      routineHeroFrame: 'First',
    });
    const prompt = __buildPromptForTest(state);
    expect(prompt).toContain('ROUTINE_CAROUSEL_MODE: active.');
    expect(prompt).toContain('FRAME_COUNT: 3.');
    expect(prompt).toContain('ROUTINE_FLOW: left-to-right.');
    expect(prompt).toContain('CONSISTENCY: same-background.');
    expect(prompt).toContain('HERO_FRAME: first.');
    expect(prompt).toContain('CAROUSEL_STRUCTURE:');
  });

  it('circular flow normalizes correctly', () => {
    const prompt = __buildPromptForTest(base({ routineFlow: 'Circular' }));
    expect(prompt).toContain('ROUTINE_FLOW: circular.');
  });

  it('subtle variation consistency normalizes correctly', () => {
    const prompt = __buildPromptForTest(base({ routineConsistency: 'Subtle variation' }));
    expect(prompt).toContain('CONSISTENCY: subtle-variation.');
  });

  it('hero frame middle and last normalize correctly', () => {
    const middlePrompt = __buildPromptForTest(base({ routineHeroFrame: 'Middle' }));
    const lastPrompt = __buildPromptForTest(base({ routineHeroFrame: 'Last' }));
    expect(middlePrompt).toContain('HERO_FRAME: middle.');
    expect(lastPrompt).toContain('HERO_FRAME: last.');
  });

  it('integrity validator accepts valid carousel state', () => {
    const state = base({
      carouselFrameCount: '5',
      carouselFlow: 'Left → Right',
      carouselConsistency: 'Same background',
      carouselHeroFrame: 'First',
    });
    expect(() => __buildPromptForTest(state)).not.toThrow();
  });

  it('dynamic builder contract is never empty', () => {
    const state = base({ frameCount: 4, flow: 'Circular', consistency: 'Subtle variation', heroFrame: 'Middle' });
    expect(buildPhotoModeDynamic(state).trim().length).toBeGreaterThan(0);
  });
});
