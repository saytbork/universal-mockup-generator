import { describe, expect, test } from 'vitest';
import { generateStudioPromptV2 } from '../../productStudioV2';
import type { StudioUIState } from '../../productStudioV2/types/studioTypes';

const baseWineState: StudioUIState = {
  creativeIntent: 'luxury',
  motion: 'static',
  composition: 'hero',
  winePrestigeMode: true,
};

describe('Studio V2 wine tilt rules', () => {
  test('enforces compact composition guidance in static presentation', () => {
    const prompt = generateStudioPromptV2({
      ...baseWineState,
      wineAction: 'static-presentation',
    });

    expect(prompt).toContain('COMPOSITION:');
    expect(prompt).toContain('Bottle upright at 0° tilt unless pouring.');
    expect(prompt).not.toContain('BOTTLE_TILT_RULE:');
  });

  test('keeps compact composition block even if controlled pour is requested', () => {
    const prompt = generateStudioPromptV2({
      ...baseWineState,
      wineAction: 'controlled-pour',
      winePrestigeV2Mode: true,
    });

    expect(prompt).toContain('COMPOSITION:');
    expect(prompt).toContain('Bottle upright at 0° tilt unless pouring.');
    expect(prompt).not.toContain('WINE_ACTION:');
  });
});
