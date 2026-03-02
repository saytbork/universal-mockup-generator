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

describe('coffee interaction isolation', () => {
  test('coffee conversion rejects invalid interaction', () => {
    const v2State = toStudioV2State(
      buildCoffeeState({
        photoMode: 'Hero Landing Page',
        interaction: 'capsule-display',
      })
    );

    expect(v2State.visualIntent).toBe('conversion');
    expect(v2State.interaction).toBe('none');
  });

  test('coffee editorial allows framed presentation', () => {
    const v2State = toStudioV2State(
      buildCoffeeState({
        photoMode: 'Golden Hour Lifestyle' as any,
        interaction: 'framed-presentation',
      })
    );

    expect(v2State.visualIntent).toBe('editorial-ritual');
    expect(v2State.interaction).toBe('framed-presentation');
  });
});
