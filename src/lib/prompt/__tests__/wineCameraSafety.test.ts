import { describe, expect, test } from 'vitest';
import type { ProductStudioState } from '../../productStudio/types';
import { toStudioV2State } from '../../productStudio/promptRouter';

function buildWineState(overrides: Partial<ProductStudioState> = {}): ProductStudioState {
  return {
    visualProfile: 'wine',
    qualityProfile: 'luxury-brand',
    visualIntent: 'campaign',
    definition: { type: 'custom' } as ProductStudioState['definition'],
    photoMode: 'Hero Landing Page',
    distance: 'wide',
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
    cameraSystem: 'macro',
    angle: 'top_down',
    rotation: 0,
    framing: 'centered_hero',
    cameraUiSystemLabel: '',
    cameraUiAngleLabel: '',
    cameraUiDistanceLabel: '',
    cameraUiRotationLabel: '',
    cameraUiFramingLabel: '',
    interaction: 'none',
    category: 'Wine',
    contextPreset: 'Oak Barrel Cellar',
    ...overrides,
  } as ProductStudioState;
}

describe('wine camera safety', () => {
  test('keeps top-down when cork removal is inactive', () => {
    const state = buildWineState({ stateMotion: 'static' });
    const v2State = toStudioV2State(state);

    expect(v2State.cameraAngle).toBe('Top-down flat lay');
  });

  test('clamps top-down only during cork-removal actions', () => {
    const state = buildWineState({ stateMotion: 'opened' });
    const v2State = toStudioV2State(state);

    expect(v2State.cameraAngle).toBe('High angle');
    expect(v2State.cameraDistance).toBe('Wide');
  });
});
