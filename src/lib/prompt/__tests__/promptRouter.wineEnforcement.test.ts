import { describe, expect, test } from 'vitest';
import type { ProductStudioState } from '../../productStudio/types';
import { toStudioV2State } from '../../productStudio/promptRouter';

function buildState(overrides: Partial<ProductStudioState> = {}): ProductStudioState {
  return {
    visualProfile: 'wine',
    qualityProfile: 'ecommerce-conversion',
    visualIntent: 'conversion',
    definition: { type: 'capsules' } as ProductStudioState['definition'],
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
    ...overrides,
  } as ProductStudioState;
}

describe('promptRouter wine enforcement', () => {
  test('forces Custom product type when visualProfile is wine', () => {
    const state = buildState({
      visualProfile: 'wine',
      definition: { type: 'capsules' } as ProductStudioState['definition'],
    });

    const v2State = toStudioV2State(state);

    expect(v2State.productType).toBe('Custom');
  });
});
