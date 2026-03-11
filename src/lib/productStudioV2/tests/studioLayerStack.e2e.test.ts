import { describe, expect, it } from 'vitest';
import { DEFAULT_PRODUCT_STUDIO_STATE } from '../../productStudio/store';
import { toStudioV2State } from '../../productStudio/promptRouter';
import type { ProductStudioState } from '../../productStudio/types';
import { generateStudioPromptV2 } from '../index';

function makeState(overrides: Partial<ProductStudioState> = {}): ProductStudioState {
  const base = structuredClone(DEFAULT_PRODUCT_STUDIO_STATE) as ProductStudioState;

  return {
    ...base,
    industryProfile: 'supplements',
    visualProfile: 'default',
    qualityProfile: 'ecommerce-conversion',
    photoMode: 'Hero Landing Page',
    stateMotion: 'static',
    lighting: 'natural-light',
    ambientLighting: 'natural-light',
    aspectRatio: '4:3',
    definition: { type: 'skincare' } as ProductStudioState['definition'],
    products: [
      {
        id: 'p1',
        name: 'Test Product',
        palette: { dominant: '#C0392B' },
      } as ProductStudioState['products'][number],
    ],
    activeProductId: 'p1',
    palette: {
      source: 'auto',
      primaryColor: '#C0392B',
      secondaryColor: '#1F2937',
      accentColor: '#F59E0B',
      brandPresetId: null,
    },
    ...overrides,
  };
}

describe('studio layer stack e2e', () => {
  it('clears core photo mode when visual style is selected, while preserving environment and lighting', () => {
    const v2State = toStudioV2State(
      makeState({
        photoMode: 'Hero Landing Page',
        visualStyle: 'Sunlit Stone Editorial',
        contextPreset: 'Stone Surface',
        lighting: 'natural-light',
        ambientLighting: 'natural-light',
      })
    );

    const prompt = generateStudioPromptV2(v2State);

    expect(v2State.photoMode).toBeUndefined();
    expect(prompt).not.toContain('PHOTO_MODE_SCENE:');
    expect(prompt).toContain('ENVIRONMENT_CONTEXT:');
    expect(prompt).toContain('VISUAL_STYLE_SCENE:');
    expect(prompt).toContain('STUDIO_LIGHTING_PROFILE:');
  });

  it('clears Macro Dew Label when a visual style is selected, while preserving style, environment, and lighting', () => {
    const v2State = toStudioV2State(
      makeState({
        photoMode: 'Macro Dew Label',
        visualStyle: 'Bathroom Daylight Clean',
        contextPreset: 'Bathroom Vanity',
        lighting: 'overcast-natural',
        ambientLighting: 'overcast-natural',
        composition: 'centered',
        macroTightness: 'Extreme' as any,
        dropletMode: 'Clean' as any,
        dropletDensity: 'Balanced' as any,
        highlightControl: 'Balanced' as any,
      })
    );

    const prompt = generateStudioPromptV2(v2State);

    expect(v2State.photoMode).toBeUndefined();
    expect(prompt).not.toContain('MACRO_DEW_LABEL_MODE: active.');
    expect(prompt).toContain('ENVIRONMENT_CONTEXT:');
    expect(prompt).toContain('VISUAL_STYLE_SCENE:');
    expect(prompt).toContain('STUDIO_LIGHTING_PROFILE:');
  });

  it('keeps splash as a grounded event while preserving environment, style, and lighting', () => {
    const v2State = toStudioV2State(
      makeState({
        photoMode: 'Splash Shot',
        definition: { type: 'drops' } as ProductStudioState['definition'],
        visualStyle: 'Warm Window Wood',
        contextPreset: 'Stone Surface',
        lighting: 'natural-light',
        ambientLighting: 'natural-light',
        stateMotion: 'pouring',
        specialEffects: ['Splash Shot'] as any,
      })
    );

    const prompt = generateStudioPromptV2(v2State);

    expect(prompt).toContain('INTERACTION_MODE: liquid impact.');
    expect(prompt).toContain('IMPACT_ORIGIN: grounded base-adjacent surface collision.');
    expect(prompt).toContain('ENVIRONMENT_CONTEXT:');
    expect(prompt).toContain('VISUAL_STYLE_SCENE:');
    expect(prompt).toContain('STUDIO_LIGHTING_PROFILE:');
    expect(prompt.toLowerCase()).not.toContain('tank');
    expect(prompt.toLowerCase()).not.toContain('bowl');
    expect(prompt.toLowerCase()).not.toContain('splash tank environment');
    expect(prompt.toLowerCase()).not.toContain('bounded liquid containment');
    expect(prompt.toLowerCase()).not.toContain('hollow ring');
  });

  it('migrates legacy visual-style-in-photoMode without cross-layer corruption', () => {
    const v2State = toStudioV2State(
      makeState({
        photoMode: 'Wet Rock Ripples' as any,
        contextPreset: 'Stone Surface',
        lighting: 'natural-light',
        ambientLighting: 'natural-light',
      })
    );

    expect(v2State.photoMode).toBeUndefined();
    expect(v2State.visualStyle).toBe('Wet Rock Ripples');
    expect(v2State.visualStyleCategory).toBe('lifestyle');
  });
});
