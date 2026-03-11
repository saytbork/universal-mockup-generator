import { describe, expect, it } from 'vitest';
import { __buildPromptForTest } from '../pipelines/genericPipeline';
import type { StudioUIState } from '../types/studioTypes';
import { toStudioV2State } from '../../productStudio/promptRouter';

function base(overrides: Record<string, unknown> = {}): StudioUIState {
  return {
    industryProfile: 'supplements',
    motion: 'static',
    composition: 'macro',
    creativeIntent: 'conversion',
    photoMode: 'Macro Dew Label',
    macroTightness: 'Extreme',
    dropletDensity: 'Balanced',
    highlightControl: 'Balanced',
    ...overrides,
  } as StudioUIState;
}

describe('Macro Dew Label clean mode regression', () => {
  it('Clean mode remains dry and never leaks droplet-heavy language', () => {
    const prompt = __buildPromptForTest(
      base({
        dropletMode: 'Clean',
      })
    );

    expect(prompt).toContain('DROPLET_MODE: clean.');
    expect(prompt).toContain('SURFACE_WETNESS_RULE: dry-clean.');

    expect(prompt).not.toContain('DROPLET_MODE: drops.');
    expect(prompt.toLowerCase()).not.toContain('dew droplets attached');
    expect(prompt.toLowerCase()).not.toContain('visible droplets');
    expect(prompt.toLowerCase()).not.toContain('condensation beads');
    expect(prompt.toLowerCase()).not.toContain('droplet-defined');
  });

  it('Wet mode emits subtle wetness contract', () => {
    const prompt = __buildPromptForTest(base({ dropletMode: 'Wet' }));
    expect(prompt).toContain('DROPLET_MODE: wet.');
    expect(prompt).toContain('SURFACE_WETNESS_RULE: subtle-wet.');
  });

  it('Drops mode emits droplet-defined contract', () => {
    const prompt = __buildPromptForTest(base({ dropletMode: 'Drops' }));
    expect(prompt).toContain('DROPLET_MODE: drops.');
    expect(prompt).toContain('SURFACE_WETNESS_RULE: droplet-defined.');
  });

  it('legacy photo mode Color Pop Hero normalizes to Hero Landing Page', () => {
    const mapped = toStudioV2State({
      photoMode: 'Color Pop Hero',
      products: [{ id: 'p1', name: 'Test Product', palette: { dominant: '#C0392B' } }],
      activeProductId: 'p1',
      palette: { source: 'auto', primaryColor: '#7B1FA2', secondaryColor: '#4CAF50', accentColor: '#FF9800', brandPresetId: null },
      definition: { type: 'bottle', physical: { kind: 'dummy', v: {} } },
      stateMotion: 'static',
      aspectRatio: '1:1',
    } as any);

    expect(mapped.photoMode).toBe('Hero Landing Page');
  });

  it('legacy visual style Monochrome Brand is cleared', () => {
    const mapped = toStudioV2State({
      photoMode: 'Hero Landing Page',
      visualStyle: 'Monochrome Brand',
      products: [{ id: 'p1', name: 'Test Product', palette: { dominant: '#C0392B' } }],
      activeProductId: 'p1',
      palette: { source: 'auto', primaryColor: '#7B1FA2', secondaryColor: '#4CAF50', accentColor: '#FF9800', brandPresetId: null },
      definition: { type: 'bottle', physical: { kind: 'dummy', v: {} } },
      stateMotion: 'static',
      aspectRatio: '1:1',
    } as any);

    expect(mapped.visualStyle).toBeUndefined();
  });
});
