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

describe('promptRouter interaction isolation', () => {
  test('supplements blocks wine-only interaction', () => {
    const state = buildState({
      visualProfile: 'default',
      interaction: 'pouringWine' as any,
    });

    const v2State = toStudioV2State(state);

    expect(v2State.interaction).toBe('none');
  });

  test('wine blocks supplements-only interaction', () => {
    const state = buildState({
      visualProfile: 'wine',
      interaction: 'capsuleDisplay' as any,
      definition: { type: 'custom' } as ProductStudioState['definition'],
    });

    const v2State = toStudioV2State(state);

    expect(v2State.interaction).toBe('none');
  });

  test('coffee allows whitelisted coffee interaction', () => {
    const state = buildState({
      visualProfile: 'coffee',
      interaction: 'holding' as any,
    });

    const v2State = toStudioV2State(state);

    expect(v2State.interaction).toBe('holding');
  });

  test('returns a fresh V2 object each call', () => {
    const state = buildState({ visualProfile: 'coffee', interaction: 'holding' as any });
    const first = toStudioV2State(state);
    const second = toStudioV2State(state);
    expect(first).not.toBe(second);
  });
});
