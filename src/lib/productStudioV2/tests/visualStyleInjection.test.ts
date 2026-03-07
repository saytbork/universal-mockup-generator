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

describe('Visual Style injection', () => {
  it('Clinical Lab Counter emits studio visual style contract', () => {
    const prompt = __buildPromptForTest(
      base({
        visualStyle: 'Clinical Lab Counter',
        visualStyleCategory: 'studio',
      })
    );
    expect(prompt).toContain('VISUAL_STYLE_MODE: active.');
    expect(prompt).toContain('VISUAL_STYLE_CATEGORY: studio.');
    expect(prompt).toContain('VISUAL_STYLE_NAME: clinical-lab-counter.');
    expect(prompt).toContain('VISUAL_STYLE_SCENE:');
  });

  it('Dark Premium Studio normalizes to studio category and name', () => {
    const prompt = __buildPromptForTest(base({ visualStyle: 'Dark Premium Studio', visualStyleCategory: 'studio' }));
    expect(prompt).toContain('VISUAL_STYLE_CATEGORY: studio.');
    expect(prompt).toContain('VISUAL_STYLE_NAME: dark-premium-studio.');
    expect(prompt).toContain('VISUAL_STYLE_SCENE:');
  });

  it('Brand Campaign normalizes to brand category', () => {
    const prompt = __buildPromptForTest(base({ visualStyle: 'Brand Campaign', visualStyleCategory: 'brand' }));
    expect(prompt).toContain('VISUAL_STYLE_CATEGORY: brand.');
    expect(prompt).toContain('VISUAL_STYLE_NAME: brand-campaign.');
  });

  it('Soft Wellness Morning normalizes to lifestyle category', () => {
    const prompt = __buildPromptForTest(base({ visualStyle: 'Soft Wellness Morning', visualStyleCategory: 'lifestyle' }));
    expect(prompt).toContain('VISUAL_STYLE_CATEGORY: lifestyle.');
    expect(prompt).toContain('VISUAL_STYLE_NAME: soft-wellness-morning.');
  });

  it('Outdoor Energy Boost normalizes to lifestyle category', () => {
    const prompt = __buildPromptForTest(base({ visualStyle: 'Outdoor Energy Boost', visualStyleCategory: 'lifestyle' }));
    expect(prompt).toContain('VISUAL_STYLE_CATEGORY: lifestyle.');
    expect(prompt).toContain('VISUAL_STYLE_NAME: outdoor-energy-boost.');
  });

  it('integrity validator does not throw when visual style is selected', () => {
    expect(() =>
      __buildPromptForTest(base({ visualStyle: 'Dark Premium Studio', visualStyleCategory: 'studio' }))
    ).not.toThrow();
  });

  it('no visual style selected does not require visual style block', () => {
    const prompt = __buildPromptForTest(base({ visualStyle: undefined }));
    expect(prompt).not.toContain('VISUAL_STYLE_MODE: active.');
    expect(prompt).not.toContain('VISUAL_STYLE_NAME:');
  });
});

