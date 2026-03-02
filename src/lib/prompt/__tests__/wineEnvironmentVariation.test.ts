import { describe, expect, test } from 'vitest';
import type { ProductStudioState } from '../../productStudio/types';
import { toStudioV2State } from '../../productStudio/promptRouter';
import { generateStudioPromptV2 } from '../../productStudioV2';

function buildWineState(overrides: Partial<ProductStudioState> = {}): ProductStudioState {
  return {
    visualProfile: 'wine',
    qualityProfile: 'luxury-brand',
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
    interaction: 'none',
    contextPreset: '',
    ...overrides,
  } as ProductStudioState;
}

describe('wine environment variation', () => {
  test('randomizes environment when user did not select one', () => {
    const first = toStudioV2State(buildWineState());
    const second = toStudioV2State(buildWineState());
    expect(first.wineEnvironmentVariation).toBeTruthy();
    expect(second.wineEnvironmentVariation).toBeTruthy();
    expect(first.wineEnvironmentVariation).not.toBe(second.wineEnvironmentVariation);
  });

  test('injects wine physics and no hardcoded vineyard/85mm lock', () => {
    const v2State = toStudioV2State(buildWineState({ contextPreset: '' }));
    const prompt = generateStudioPromptV2(v2State);

  expect(prompt).toContain('deterministic.');
  expect(prompt).toContain('WINE_ENGINE_STATUS:');
    expect(prompt).toContain('WINE_ENVIRONMENT:');
    // WINE_LIGHTING: was replaced by LIGHT_SOURCE: inside REAL_WORLD_PHOTOGRAPHY_MODE block
    expect(prompt).toContain('LIGHT_SOURCE:');
    expect(prompt).not.toContain('WINE_ENVIRONMENT: Vineyard Golden Hour');
    expect(prompt).not.toContain('Render with 85mm premium telephoto prime optical behavior');
  });
});
