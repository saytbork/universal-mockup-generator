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
  test('keeps required block ordering', () => {
    const v2State = toStudioV2State(buildWineState());
    const prompt = generateStudioPromptV2({ ...(v2State as any), wineEngineVersion: 4 });

    const orderedBlocks = [
      'WINE_ENGINE:',
      'WINE_PROFILE:',
      'COLOR_ACCURACY:',
      'GEOMETRY_INTEGRITY:',
      'LIQUID_TRANSFER_PHYSICS:',
      'CARBONATION_BEHAVIOR:',
      'CLOSURE_GEOMETRY:',
      'COMPOSITION:',
      'WINE_ENVIRONMENT:',
      'WINE_LIGHTING:',
      'MATERIALS:',
      'PHYSICAL_REALISM:',
    ];

    let prev = -1;
    for (const block of orderedBlocks) {
      const idx = prompt.indexOf(block);
      expect(idx).toBeGreaterThanOrEqual(0);
      expect(idx).toBeGreaterThan(prev);
      prev = idx;
    }

    const closureStart = prompt.indexOf('CLOSURE_GEOMETRY:');
    const closureEndCandidates = [
      prompt.indexOf('COMPOSITION:'),
      prompt.indexOf('WINE_ENVIRONMENT:'),
    ].filter((n) => n > closureStart);
    const closureEnd = Math.min(...closureEndCandidates);
    const closureBlock = prompt.slice(closureStart, closureEnd);

    expect(closureBlock).toContain('Physically coherent geometry preserved.');
    expect(closureBlock).not.toContain('realistic pry-state behavior');
    expect(closureBlock).not.toContain('thread geometry');
    expect(closureBlock).not.toContain('extraction-state');
    expect(closureBlock).not.toContain('seated state');
  });
});
