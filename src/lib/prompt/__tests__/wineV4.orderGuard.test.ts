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

    // New block order assertions
    const idxEngine = prompt.indexOf('WINE_ENGINE_STATUS:');
    const idxConfig = prompt.indexOf('WINE_CONFIG_RESOLVED:');
    const idxVolume = prompt.indexOf('VOLUME_LOCK:');
    const idxClosure = prompt.indexOf('CLOSURE_LOCK:');
    const idxGeometry = prompt.indexOf('GEOMETRY_LOCK:');
    const idxColor = prompt.indexOf('COLOR_LOCK:');

    expect(idxEngine).toBeGreaterThanOrEqual(0);
    expect(idxConfig).toBeGreaterThan(idxEngine);
    expect(idxVolume).toBeGreaterThan(idxConfig);
    expect(idxClosure).toBeGreaterThan(idxVolume);
    expect(idxGeometry).toBeGreaterThan(idxClosure);
    expect(idxColor).toBeGreaterThan(idxGeometry);
  });
});
