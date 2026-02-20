import { describe, expect, test } from 'vitest';
import type { ProductStudioState } from '../../productStudio/types';
import { toStudioV2State } from '../../productStudio/promptRouter';
import { generateStudioPromptV2 } from '../../productStudioV2';

function buildCoffeeState(overrides: Partial<ProductStudioState> = {}): ProductStudioState {
  return {
    visualProfile: 'coffee',
    qualityProfile: 'ecommerce-conversion',
    visualIntent: 'campaign',
    definition: { type: 'custom' } as ProductStudioState['definition'],
    photoMode: 'Hero Landing Page',
    distance: 'standard',
    stateMotion: 'spilled',
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
    interaction: 'capsule-display',
    ...overrides,
  } as ProductStudioState;
}

describe('coffee industry isolation', () => {
  test('injects coffee physical blocks and strips wine contamination', () => {
    const sourceState = buildCoffeeState();
    const before = structuredClone(sourceState);
    const first = toStudioV2State(sourceState);
    const second = toStudioV2State(sourceState);
    const prompt = generateStudioPromptV2(first);

    expect(first).not.toBe(second);
    expect(sourceState).toEqual(before);
    expect(first.visualIntent).toBe('campaign');
    expect(first.coffeeIndustryLayer).toBeTruthy();
    expect(first.interaction).toBe('none');
    expect(first.motion).toBe('static');

    expect(prompt).toContain('COFFEE_LIQUID_PHYSICS:');
    expect(prompt).toContain('COFFEE_MATERIAL_MODEL:');
    expect(prompt).toContain('COFFEE_ATMOSPHERIC_LAYER:');
    expect(prompt).toContain('COFFEE_COMPOSITION_PROFILE:');
    expect(prompt).not.toContain('WINE_');
    expect(prompt).not.toContain('wine-prestige');
    expect(prompt).not.toContain('wine-glass-priority');
  });

  test('campaign coffee allows controlled pouring motion', () => {
    const state = buildCoffeeState({
      stateMotion: 'pouring',
      interaction: 'holding',
    });
    const v2State = toStudioV2State(state);

    expect(v2State.visualIntent).toBe('campaign');
    expect(v2State.motion).toBe('pouring');
    expect(v2State.interaction).toBe('holding');
  });
});
