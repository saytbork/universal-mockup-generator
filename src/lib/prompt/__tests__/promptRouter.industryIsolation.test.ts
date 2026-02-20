import { describe, expect, test } from 'vitest';
import type { ProductStudioState } from '../../productStudio/types';
import { toStudioV2State } from '../../productStudio/promptRouter';

function buildBaseState(overrides: Partial<ProductStudioState> = {}): ProductStudioState {
  return {
    visualProfile: 'default',
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
    contextPreset: 'Oak Barrel Cellar',
    wineLightingTone: 'Golden Ambient',
    wineMoodModifier: 'Terroir Mood Tone',
    wineAction: 'controlled-pour',
    winePourStyle: 'slow-ribbon',
    ...overrides,
  } as ProductStudioState;
}

describe('promptRouter industry isolation', () => {
  test('non-wine profile does not materialize wine fields in V2 state', () => {
    const state = buildBaseState({ visualProfile: 'default' });

    const v2State = toStudioV2State(state);

    expect(v2State).not.toHaveProperty('wineContextPreset');
    expect(v2State).not.toHaveProperty('wineLightingTone');
    expect(v2State).not.toHaveProperty('wineMoodModifier');
    expect(v2State).not.toHaveProperty('wineAction');
    expect(v2State).not.toHaveProperty('winePourStyle');

    const secondCall = toStudioV2State(state);
    expect(secondCall).not.toBe(v2State);
  });

  test('wine profile assigns wine fields in V2 state', () => {
    const state = buildBaseState({
      visualProfile: 'wine',
      wineLightingTone: 'Golden Ambient',
    });

    const v2State = toStudioV2State(state);

    expect(v2State).toHaveProperty('wineLightingTone');
    expect(v2State.wineLightingTone).toBe('Golden Ambient');
  });
});
