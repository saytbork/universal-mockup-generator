import { describe, expect, it } from 'vitest';
import { __buildPromptForTest } from '../pipelines/genericPipeline';
import type { StudioUIState } from '../types/studioTypes';
import { toStudioV2State } from '../../productStudio/promptRouter';

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

describe('combinable dimensions architecture', () => {
  it('A) Hero + Sunlit Stone Editorial + Natural Light combine', () => {
    const prompt = __buildPromptForTest(
      base({
        photoMode: 'Hero Landing Page',
        visualStyle: 'Sunlit Stone Editorial',
        visualStyleCategory: 'lifestyle',
        lighting: 'natural-light',
      })
    );

    expect(prompt).toContain('PHOTO_MODE_SCENE:');
    expect(prompt).toContain('VISUAL_STYLE_MODE: active.');
    expect(prompt).toContain('VISUAL_STYLE_NAME: sunlit-stone-editorial.');
    expect(prompt).toContain('STUDIO_LIGHTING_PROFILE:');
  });

  it('B) Hero + Soft Wellness Morning + Ring Light combine', () => {
    const prompt = __buildPromptForTest(
      base({
        photoMode: 'Hero Landing Page',
        visualStyle: 'Soft Wellness Morning',
        visualStyleCategory: 'lifestyle',
        lighting: 'ring-light',
      })
    );

    expect(prompt).toContain('VISUAL_STYLE_NAME: soft-wellness-morning.');
    expect(prompt).toContain('STUDIO_LIGHTING_PROFILE:');
  });

  it('C) Macro + Bathroom Daylight Clean + Overcast + Clean droplet mode combine without leaks', () => {
    const prompt = __buildPromptForTest(
      base({
        photoMode: 'Macro Dew Label',
        composition: 'macro',
        visualStyle: 'Bathroom Daylight Clean',
        visualStyleCategory: 'lifestyle',
        environmentPreset: 'Bathroom Vanity',
        lighting: 'overcast-natural',
        dropletMode: 'Clean',
        macroTightness: 'Extreme',
        dropletDensity: 'Balanced',
        highlightControl: 'Balanced',
      })
    );

    expect(prompt).toContain('MACRO_DEW_LABEL_MODE: active.');
    expect(prompt).toContain('VISUAL_STYLE_NAME: bathroom-daylight-clean.');
    expect(prompt).toContain('ENVIRONMENT_STYLE_MODE: active.');
    expect(prompt).toContain('DROPLET_MODE: clean.');
    expect(prompt).toContain('SURFACE_WETNESS_RULE: dry-clean.');
    expect(prompt.toLowerCase()).not.toContain('visible droplets');
  });

  it('D) Splash + Warm Window Wood + Natural Light combine without enclosure language', () => {
    const prompt = __buildPromptForTest(
      base({
        photoMode: 'Splash Shot',
        motion: 'pouring',
        requestedModifiers: ['splash'],
        visualStyle: 'Warm Window Wood',
        visualStyleCategory: 'lifestyle',
        lighting: 'natural-light',
      })
    );

    expect(prompt).toContain('INTERACTION_MODE: liquid impact.');
    expect(prompt).toContain('IMPACT_ORIGIN:');
    expect(prompt).toContain('VISUAL_STYLE_NAME: warm-window-wood.');
    expect(prompt.toLowerCase()).not.toContain('tank');
    expect(prompt.toLowerCase()).not.toContain('bowl');
    expect(prompt.toLowerCase()).not.toContain('hollow ring');
  });

  it('E) Photo mode + environment + visual style all survive together', () => {
    const prompt = __buildPromptForTest(
      base({
        photoMode: 'Hero Landing Page',
        environmentPreset: 'Stone Surface',
        visualStyle: 'Outdoor Energy Boost',
        visualStyleCategory: 'lifestyle',
        lighting: 'sunny-day',
      })
    );

    expect(prompt).toContain('PHOTO_MODE_SCENE:');
    expect(prompt).toContain('ENVIRONMENT_STYLE_MODE: active.');
    expect(prompt).toContain('VISUAL_STYLE_MODE: active.');
  });

  it('F) legacy value safety normalizes without cross-dimension corruption', () => {
    const colorPopMapped = toStudioV2State({
      photoMode: 'Color Pop Hero',
      products: [{ id: 'p1', name: 'Test Product', palette: { dominant: '#C0392B' } }],
      activeProductId: 'p1',
      palette: { source: 'auto', primaryColor: '#7B1FA2', secondaryColor: '#4CAF50', accentColor: '#FF9800', brandPresetId: null },
      definition: { type: 'bottle', physical: { kind: 'dummy', v: {} } },
      stateMotion: 'static',
      aspectRatio: '1:1',
    } as any);
    expect(colorPopMapped.photoMode).toBe('Hero Landing Page');

    const monochromeMapped = toStudioV2State({
      photoMode: 'Hero Landing Page',
      visualStyle: 'Monochrome Brand',
      products: [{ id: 'p1', name: 'Test Product', palette: { dominant: '#C0392B' } }],
      activeProductId: 'p1',
      palette: { source: 'auto', primaryColor: '#7B1FA2', secondaryColor: '#4CAF50', accentColor: '#FF9800', brandPresetId: null },
      definition: { type: 'bottle', physical: { kind: 'dummy', v: {} } },
      stateMotion: 'static',
      aspectRatio: '1:1',
    } as any);
    expect(monochromeMapped.visualStyle).toBeUndefined();
  });

  it('G) studio prompt rejects forbidden human language outside hands-only rules', () => {
    expect(() =>
      __buildPromptForTest(
        base({
          photoMode: 'Hero Landing Page',
          visualStyle: 'Brand Campaign',
          visualStyleCategory: 'brand',
          environmentPreset: 'Studio Minimal',
        } as any)
      )
    ).not.toThrow();
  });
});
