import { describe, expect, test } from 'vitest';
import type { ProductStudioState } from '../../productStudio/types';
import { toStudioV2State } from '../../productStudio/promptRouter';
import { generateStudioPromptV2 } from '../../productStudioV2';

function buildCoffeeState(overrides: Partial<ProductStudioState> = {}): ProductStudioState {
  return {
    visualProfile: 'coffee',
    qualityProfile: 'ecommerce-conversion',
    visualIntent: 'campaign',
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
    contextPreset: '',
    ...overrides,
  } as ProductStudioState;
}

describe('coffee environment variation', () => {
  test('randomizes coffee environment across consecutive generations', () => {
    const first = toStudioV2State(buildCoffeeState());
    const second = toStudioV2State(buildCoffeeState());

    expect(first.coffeeEnvironmentVariation).toBeTruthy();
    expect(second.coffeeEnvironmentVariation).toBeTruthy();
    expect(first.coffeeEnvironmentVariation).not.toBe(second.coffeeEnvironmentVariation);
  });

  test('injects coffee physics blocks without wine contamination or hardcoded warm wood', () => {
    const state = toStudioV2State(buildCoffeeState({ contextPreset: '' }));
    const prompt = generateStudioPromptV2(state);

    expect(prompt).toContain('COFFEE_LIQUID_PHYSICS:');
    expect(prompt).toContain('COFFEE_ENVIRONMENT_VARIATION:');
    expect(prompt).not.toContain('WINE_');
    expect(prompt).not.toContain('warm wood ritual');
    expect(prompt).not.toContain('WINE_ENVIRONMENT: Vineyard Golden Hour');
  });
});
