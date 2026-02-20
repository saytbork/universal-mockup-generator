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

describe('coffee motion context', () => {
  test('editorial-ritual allows pouring motion', () => {
    const state = buildCoffeeState({
      photoMode: 'Golden Hour Lifestyle' as any,
      stateMotion: 'pouring',
    });
    const v2State = toStudioV2State(state);
    expect(v2State.visualIntent).toBe('editorial-ritual');
    expect(v2State.motion).toBe('pouring');
  });

  test('conversion forces pouring back to static', () => {
    const state = buildCoffeeState({
      photoMode: 'Hero Landing Page',
      stateMotion: 'pouring',
    });
    const first = toStudioV2State(state);
    const second = toStudioV2State(state);
    expect(first.visualIntent).toBe('conversion');
    expect(first.motion).toBe('static');
    expect(first).not.toBe(second);
    expect(state.stateMotion).toBe('pouring');
  });
});
