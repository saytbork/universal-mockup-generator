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
    interaction: 'none',
    contextPreset: 'Black Studio',
    ...overrides,
  } as ProductStudioState;
}

function buildCoffeeState(overrides: Partial<ProductStudioState> = {}): ProductStudioState {
  return {
    visualProfile: 'coffee-premium',
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
    contextPreset: 'Black Studio',
    ...overrides,
  } as ProductStudioState;
}

describe('wine truth layer enforcement', () => {
  test('injects a single authoritative wine truth layer', () => {
    const source = buildWineState({
      wineType: 'sparkling-white' as any,
      wineBottleState: 'opened-with-cork-nearby' as any,
      wineClosureType: 'screw-cap',
      wineGlassMode: 'filled' as any,
    });
    const v2State = toStudioV2State(source);
    const prompt = generateStudioPromptV2(v2State);

    const engineStatusIndex = prompt.indexOf('WINE_ENGINE_STATUS:');
    expect(engineStatusIndex).toBeGreaterThanOrEqual(0);

    expect(prompt).toContain('WINE_CONFIG_RESOLVED:');
    expect(prompt).toContain('WINE_COLOR_LOCK: Liquid color must match reference exactly.');
    expect(prompt).toContain('SERVE_VOLUME_CONSERVATION_LOCK_V3:');
    expect(prompt).toContain('SPARKLING_PHYSICS_LOCK_V3:');
    expect(prompt).toContain('WINE_STRUCTURAL_LOCK_V3:');
    expect(prompt).toContain('GEOMETRY_LOCK: Preserve exact bottle proportions.');
    expect(prompt).not.toContain('WINE_TRUTH_LOCK:');
    expect(prompt).not.toContain('PRODUCT_WINE_COLOR_LOCK:');
    expect(prompt).not.toContain('LIQUID_MATCH_RULE:');
    expect(prompt).not.toContain('LIQUID_ABSOLUTE_LOCK:');
    expect(prompt).not.toContain('CLOSURE_TRANSFER_RULE:');
    expect(prompt).not.toContain('VOLUME_CONSISTENCY_RULE:');
    expect(prompt).not.toContain('SERVE_RATIO_LOCK:');
    expect(prompt).not.toContain('SPARKLING_PHYSICS_PROFILE:');
    expect(prompt).not.toContain('NECK_CLEARANCE_RULE:');
    expect(prompt).not.toContain('SCREW_CAP_BEHAVIOR:');
    expect(prompt).toContain('STUDIO_ULTRA_REAL_GUARDRAIL:');
  });

  test('does not leak wine truth layer into coffee profile', () => {
    const v2State = toStudioV2State(buildCoffeeState());
    const prompt = generateStudioPromptV2(v2State);

    expect(prompt).not.toContain('WINE_CONFIG_RESOLVED:');
    expect(prompt).not.toContain('WINE_COLOR_LOCK:');
    expect(prompt).not.toContain('WINE_ENGINE_STATUS:');
  });
});
