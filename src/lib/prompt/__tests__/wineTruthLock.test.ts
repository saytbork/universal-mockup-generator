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

describe('wine truth lock enforcement', () => {
  test('injects WINE_TRUTH_LOCK right after WINE_ENGINE_STATUS and enforces strict guardrails', () => {
    const source = buildWineState({
      wineType: 'sparkling-white' as any,
      wineBottleState: 'opened-with-cork-nearby' as any,
      wineClosureType: 'screw-cap',
      wineGlassMode: 'filled' as any,
    });
    const v2State = toStudioV2State(source);
    const prompt = generateStudioPromptV2(v2State);

    const engineStatusIndex = prompt.indexOf('WINE_ENGINE_STATUS:');
    const truthLockIndex = prompt.indexOf('WINE_TRUTH_LOCK:');
    expect(engineStatusIndex).toBeGreaterThanOrEqual(0);
    expect(truthLockIndex).toBeGreaterThan(engineStatusIndex);

    expect(prompt).toContain('WINE_CONFIG_RESOLVED:');
    expect(prompt).toContain('PRODUCT_WINE_COLOR_LOCK: Bottle liquid color must match reference exactly.');
    expect(prompt).toContain('PRODUCT_CLOSURE_LOCK: Closure type must match detected reference closure.');
    expect(prompt).toContain('If screwcap -> same screwcap model only.');
    expect(prompt).toContain('LIQUID_MATCH_RULE: If glass is present, liquid color in glass MUST match bottle liquid exactly.');
    expect(prompt).toContain('LIQUID_ABSOLUTE_LOCK: Bottle liquid color must match reference exactly.');
    expect(prompt).toContain('CLOSURE_TRANSFER_RULE: Detect closure type from reference image.');
    expect(prompt).toContain('VOLUME_CONSISTENCY_RULE: If glassFillLevel != none:');
    expect(prompt).toContain('OPEN_STATE_COHERENCE: If bottleState = open-glass-served:');
    expect(prompt).toContain('CARBONATION_RULE: If carbonationLevel = high:');
    expect(prompt).toContain('STUDIO_ULTRA_REAL_GUARDRAIL:');
  });

  test('does not leak wine truth lock into coffee profile', () => {
    const v2State = toStudioV2State(buildCoffeeState());
    const prompt = generateStudioPromptV2(v2State);

    expect(prompt).not.toContain('WINE_TRUTH_LOCK:');
    expect(prompt).not.toContain('WINE_ENGINE_STATUS:');
  });
});
