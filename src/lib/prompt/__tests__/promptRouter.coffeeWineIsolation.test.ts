import { describe, expect, test } from 'vitest';
import type { ProductStudioState } from '../../productStudio/types';
import { toStudioV2State } from '../../productStudio/promptRouter';
import { generateStudioPromptV2 } from '../../productStudioV2';

function buildCoffeeState(overrides: Partial<ProductStudioState> = {}): ProductStudioState {
  return {
    visualProfile: 'coffee',
    qualityProfile: 'ecommerce-conversion',
    visualIntent: 'conversion',
    definition: { type: 'custom' } as ProductStudioState['definition'],
    photoMode: 'Hero Landing Page',
    distance: 'standard',
    stateMotion: 'static',
    controlTier: 'basic',
    advancedModeEnabled: false,
    proMode: false,
    photoModeConfig: {
      splashShot: {
        motionIntensity: 'Static',
        freezeMoment: 'Peak',
      },
    } as unknown as ProductStudioState['photoModeConfig'],
    bundle: { enabled: false } as ProductStudioState['bundle'],
    aspectRatio: '1:1',
    cameraSystem: 'dslr_mirrorless',
    angle: '45_hero',
    rotation: 0,
    framing: 'centered_hero',
    cameraUiSystemLabel: '',
    cameraUiAngleLabel: '',
    cameraUiDistanceLabel: '',
    cameraUiRotationLabel: '',
    cameraUiFramingLabel: '',
    interaction: 'holding',
    category: 'Wine',
    contextPreset: 'Winery / Vineyard',
    ...overrides,
  } as ProductStudioState;
}

describe('coffee/wine hard isolation', () => {
  test('coffee prompt strips wine pipeline tokens completely', () => {
    const v2State = toStudioV2State(buildCoffeeState());
    const finalPrompt = generateStudioPromptV2(v2State);

    expect(v2State.visualProfile).toBe('coffee');
    expect(v2State.winePrestigeMode).toBeFalsy();
    expect(finalPrompt).not.toContain('wine-prestige');
    expect(finalPrompt).not.toContain('WINE_');
    expect(finalPrompt).not.toContain('wine-glass-priority');
  });
});
