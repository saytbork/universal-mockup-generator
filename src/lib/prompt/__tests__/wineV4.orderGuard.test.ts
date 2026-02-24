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
    stateMotion: 'opened' as any,
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
    contextPreset: 'Vineyard Golden Hour',
    wineType: 'sparkling' as any,
    wineClosureType: 'crown-cap',
    wineBottleState: 'opened-with-cork-nearby' as any,
    wineGlassMode: 'filled' as any,
    carbonationLevel: 'subtle' as any,
    wineEngineVersion: 4,
    ...overrides,
  } as ProductStudioState;
}

describe('wine v4 order guard', () => {
  test('keeps required block ordering (strict logic)', () => {
    const v2State = toStudioV2State(buildWineState());
    const prompt = generateStudioPromptV2({ ...(v2State as any), wineEngineVersion: 4 });

    // Enforce only relative order relationships
    const idxEngine = prompt.indexOf('WINE_ENGINE:');
    const idxProfile = prompt.indexOf('WINE_PROFILE:');
    const idxBottle = prompt.indexOf('BOTTLE_STATE:');
    const idxGeometry = prompt.indexOf('GEOMETRY_INTEGRITY:');
    const idxLiquid = prompt.indexOf('LIQUID_TRANSFER_PHYSICS:');
    const idxClosure = prompt.indexOf('CLOSURE_GEOMETRY:');

    expect(idxEngine).toBeGreaterThanOrEqual(0);
    expect(idxProfile).toBeGreaterThan(idxEngine);
    expect(idxBottle).toBeGreaterThan(idxProfile);
    expect(idxGeometry).toBeGreaterThan(idxBottle);
    expect(idxLiquid).toBeGreaterThan(idxGeometry);
    expect(idxClosure).toBeGreaterThan(idxLiquid);

    // If carbonation block is present, it must be after LIQUID_TRANSFER_PHYSICS and before CLOSURE_GEOMETRY
    if (prompt.includes('CARBONATION_BEHAVIOR:')) {
      const carbonationIdx = prompt.indexOf('CARBONATION_BEHAVIOR:');
      expect(carbonationIdx).toBeGreaterThan(idxLiquid);
      expect(carbonationIdx).toBeLessThan(idxClosure);
    }

    // Closure block must not contain legacy phrases
    const closureStart = prompt.indexOf('CLOSURE_GEOMETRY:');
    const closureEnd = prompt.length;
    const closureBlock = prompt.slice(closureStart, closureEnd);
    expect(closureBlock).not.toMatch(/pry-state|thread|extraction-state|seated state/i);
  });
});
