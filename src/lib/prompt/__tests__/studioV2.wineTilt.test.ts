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
  test('enforces upright bottle in static presentation', () => {
    const prompt = generateStudioPromptV2({
      ...baseWineState,
      wineAction: 'static-presentation',
    });

    expect(prompt).toContain('BOTTLE_TILT_RULE: static presentation requires vertical bottle orientation (0° tilt, perfectly upright).');
    expect(prompt).not.toContain('between 5° and 15°');
  });

  test('keeps upright bottle even if controlled pour is requested', () => {
    const prompt = generateStudioPromptV2({
      ...baseWineState,
      wineAction: 'controlled-pour',
      winePrestigeV2Mode: true,
    });

    expect(prompt).toContain('WINE_ACTION: static-presentation.');
    expect(prompt).toContain('BOTTLE_TILT_RULE: static presentation requires vertical bottle orientation (0° tilt, perfectly upright).');
    expect(prompt).not.toContain('between 5° and 12°');
  });
});
