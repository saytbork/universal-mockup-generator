import { describe, expect, test } from 'vitest';
import type { ProductStudioState } from '../../productStudio/types';
import { toStudioV2State } from '../../productStudio/promptRouter';

function buildState(overrides: Partial<ProductStudioState> = {}): ProductStudioState {
  return {
    visualProfile: 'default',
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
    interaction: 'none',
    ...overrides,
  } as ProductStudioState;
}

describe('industry interaction isolation', () => {
  test('wine rejects supplements interaction', () => {
    const v2State = toStudioV2State(
      buildState({
        visualProfile: 'wine',
        interaction: 'capsule-display',
      })
    );
    expect(v2State.interaction).toBe('none');
  });

  test('supplements rejects wine interaction', () => {
    const v2State = toStudioV2State(
      buildState({
        visualProfile: 'default',
        interaction: 'cheers' as any,
      })
    );
    expect(v2State.interaction).toBe('none');
  });

  test('returns fresh object per call', () => {
    const first = toStudioV2State(buildState({ visualProfile: 'default', interaction: 'holding' }));
    const second = toStudioV2State(buildState({ visualProfile: 'default', interaction: 'holding' }));
    expect(first).not.toBe(second);
  });
});
