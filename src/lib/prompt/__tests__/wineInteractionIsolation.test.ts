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
    interaction: 'holding',
    category: 'Wine',
    contextPreset: 'Oak Barrel Cellar',
    wineAction: 'controlled-pour',
    ...overrides,
  } as ProductStudioState;
}

describe('wine interaction isolation', () => {
  test('wine prompt excludes interaction/framing/hand tokens and locks static action', () => {
    const sourceState = buildWineState();
    const first = toStudioV2State(sourceState);
    const second = toStudioV2State(sourceState);
    const finalPrompt = generateStudioPromptV2(first);

    expect(first).not.toBe(second);
    expect(sourceState.interaction).toBe('holding');
    expect(first.interaction).toBe('none');
    expect(first.wineAction).toBe('static-presentation');

    expect(finalPrompt).toContain('COMPOSITION:');
    expect(finalPrompt).not.toContain('STUDIO_PRODUCT_MOTION:');
    expect(finalPrompt).not.toContain('INTERACTION_');
    expect(finalPrompt).not.toContain('HAND_');
    expect(finalPrompt).not.toContain('FRAMING_BIAS');
  });

  test('winery scene overrides stale pour state and stays bottle-only', () => {
    const state = buildWineState({
      photoMode: 'Winery Scene',
      wineAction: 'controlled-pour',
      wineServeMode: 'pouring',
      wineBottleFillMode: 'partially-served',
      wineGlassMode: 'filled',
    });

    const mapped = toStudioV2State(state);

    expect(mapped.photoMode).toBe('Winery Scene');
    expect(mapped.wineServeMode).toBe('bottle-only');
    expect(mapped.wineAction).toBe('static-presentation');
    expect(mapped.wineGlassMode).toBe('none');
    expect(mapped.wineBottleState).toBe('sealed');
  });
});
