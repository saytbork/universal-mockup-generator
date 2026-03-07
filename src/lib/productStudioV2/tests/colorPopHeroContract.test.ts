import { describe, expect, it } from 'vitest';
import { buildPhotoModeDynamic } from '../builders/buildPhotoModeDynamic';
import { __buildPromptForTest } from '../pipelines/genericPipeline';
import type { StudioUIState } from '../types/studioTypes';
import { toStudioV2State } from '../../productStudio/promptRouter';

function base(overrides: Record<string, unknown> = {}): StudioUIState {
  return {
    industryProfile: 'supplements',
    motion: 'static',
    composition: 'hero',
    creativeIntent: 'conversion',
    photoMode: 'Color Pop Hero',
    ...overrides,
  } as StudioUIState;
}

describe('Color Pop Hero contract', () => {
  it('emits dedicated color pop hero contract', () => {
    const prompt = __buildPromptForTest(base());

    expect(prompt).toContain('COLOR_POP_HERO_MODE: active.');
    expect(prompt).toContain('COLOR_POP_HERO_CONTRACT:');
    expect(prompt).toContain('SILHOUETTE_RULE:');
    expect(prompt).toContain('BACKGROUND_RULE:');
    expect(prompt).toContain('STUDIO_COMPOSITION_PROFILE: color-pop-hero.');

    expect(prompt).not.toContain('VISUAL_STYLE_MODE:');
    expect(prompt).not.toContain('VISUAL_STYLE_NAME:');
    expect(prompt.toLowerCase()).not.toContain('kitchen');
    expect(prompt.toLowerCase()).not.toContain('bathroom');
    expect(prompt.toLowerCase()).not.toContain('vanity');
    expect(prompt.toLowerCase()).not.toContain('creator');
    expect(prompt.toLowerCase()).not.toContain('campaign environment');
  });

  it('router mapping keeps Color Pop Hero as photo mode and not visual style', () => {
    const mapped = toStudioV2State({
      photoMode: 'Color Pop Hero',
      products: [{ id: 'p1', name: 'Test Product', palette: { dominant: '#C0392B' } }],
      activeProductId: 'p1',
      palette: { source: 'auto', primaryColor: '#7B1FA2', secondaryColor: '#4CAF50', accentColor: '#FF9800', brandPresetId: null },
      definition: { type: 'bottle', physical: { kind: 'dummy', v: {} } },
      stateMotion: 'static',
      aspectRatio: '1:1',
    } as any);

    expect(mapped.photoMode).toBe('Color Pop Hero');
    expect(mapped.visualStyle).toBeUndefined();
    expect(mapped.visualStyleCategory).toBeUndefined();
  });

  it('dynamic builder contract is not empty', () => {
    expect(buildPhotoModeDynamic(base()).trim().length).toBeGreaterThan(0);
  });
});
