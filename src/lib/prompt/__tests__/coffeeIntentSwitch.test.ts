import { describe, expect, test } from 'vitest';
import type { ProductStudioState } from '../../productStudio/types';
import { toStudioV2State } from '../../productStudio/promptRouter';

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
    ...overrides,
  } as ProductStudioState;
}

describe('coffee industry intent switch', () => {
  test('Hero Landing maps coffee to conversion intent', () => {
    const state = buildCoffeeState({ photoMode: 'Hero Landing Page' });
    const v2State = toStudioV2State(state);

    expect(v2State.visualIntent).toBe('conversion');
    expect(v2State.lightingTemperatureProfile).toBe('neutral-daylight');
    expect(v2State.compositionProfile).toBe('product-forward');
  });

  test('Golden Hour Lifestyle maps coffee to editorial intent', () => {
    const state = buildCoffeeState({ photoMode: 'Golden Hour Lifestyle' as any });
    const v2State = toStudioV2State(state);

    expect(v2State.visualIntent).toBe('editorial-ritual');
    expect(v2State.lightingTemperatureProfile).toBe('warm-ambient');
    expect(v2State.compositionProfile).toBe('ritual-balance');
  });

  test('returns fresh objects and avoids cross-call contamination', () => {
    const conversion = toStudioV2State(buildCoffeeState({ photoMode: 'Hero Landing Page' }));
    const editorial = toStudioV2State(buildCoffeeState({ photoMode: 'Golden Hour Lifestyle' as any }));

    expect(conversion).not.toBe(editorial);
    expect(conversion.visualIntent).toBe('conversion');
    expect(editorial.visualIntent).toBe('editorial-ritual');
  });
});
