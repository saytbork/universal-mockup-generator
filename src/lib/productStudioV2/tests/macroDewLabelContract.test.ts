import { describe, expect, it } from 'vitest';
import { buildPhotoModeDynamic } from '../builders/buildPhotoModeDynamic';
import { __buildPromptForTest } from '../pipelines/genericPipeline';
import type { StudioUIState } from '../types/studioTypes';

function base(overrides: Record<string, unknown> = {}): StudioUIState {
  return {
    industryProfile: 'supplements',
    motion: 'static',
    composition: 'macro',
    creativeIntent: 'conversion',
    photoMode: 'Macro Dew Label',
    ...overrides,
  } as StudioUIState;
}

describe('Macro Dew Label contract', () => {
  it('extreme macro emits full macro contract', () => {
    const prompt = __buildPromptForTest(
      base({
        macroTightness: 'Extreme',
        dropletMode: 'Drops',
        dropletDensity: 'High',
        highlightControl: 'Balanced',
      })
    );

    expect(prompt).toContain('MACRO_DEW_LABEL_MODE: active.');
    expect(prompt).toContain('MACRO_TIGHTNESS: extreme.');
    expect(prompt).toContain('DROPLET_MODE: drops.');
    expect(prompt).toContain('DROPLET_DENSITY: high.');
    expect(prompt).toContain('HIGHLIGHT_CONTROL: balanced.');
    expect(prompt).toContain('STUDIO_CAMERA_DISTANCE: Macro.');
    expect(prompt).toContain('LENS_PROFILE: 100mm macro equivalent.');
    expect(prompt).toContain('STUDIO_FRAMING_GUIDE: Macro detail.');
    expect(prompt).toContain('STUDIO_COMPOSITION_PROFILE: macro-label.');

    expect(prompt).not.toContain('STUDIO_CAMERA_ANGLE: 45° hero.');
    expect(prompt).not.toContain('STUDIO_CAMERA_DISTANCE: Standard.');
    expect(prompt).not.toContain('LENS_PROFILE: 50mm equivalent.');
    expect(prompt).not.toContain('STUDIO_FRAMING_GUIDE: Centered hero.');
    expect(prompt).not.toContain('STUDIO_COMPOSITION_PROFILE: hero-45.');
  });

  it('tight mode normalizes correctly', () => {
    const prompt = __buildPromptForTest(base({ macroTightness: 'Tight' }));
    expect(prompt).toContain('MACRO_TIGHTNESS: tight.');
  });

  it('clean/wet/drops normalize correctly', () => {
    expect(__buildPromptForTest(base({ dropletMode: 'Clean' }))).toContain('DROPLET_MODE: clean.');
    expect(__buildPromptForTest(base({ dropletMode: 'Wet' }))).toContain('DROPLET_MODE: wet.');
    expect(__buildPromptForTest(base({ dropletMode: 'Drops' }))).toContain('DROPLET_MODE: drops.');
  });

  it('soft/balanced highlight normalize correctly', () => {
    expect(__buildPromptForTest(base({ highlightControl: 'Soft' }))).toContain('HIGHLIGHT_CONTROL: soft.');
    expect(__buildPromptForTest(base({ highlightControl: 'Balanced' }))).toContain('HIGHLIGHT_CONTROL: balanced.');
  });

  it('integrity validator does not throw for valid macro state', () => {
    const state = base({
      photoModeSettingMacroTightness: 'Extreme',
      photoModeSettingDropletMode: 'Drops',
      photoModeSettingDropletDensity: 'High',
      photoModeSettingHighlightControl: 'Balanced',
    });
    expect(() => __buildPromptForTest(state)).not.toThrow();
  });

  it('dynamic builder contract is never empty', () => {
    const contract = buildPhotoModeDynamic(base({ macroTightness: 'Extreme' }));
    expect(contract.trim().length).toBeGreaterThan(0);
  });
});
