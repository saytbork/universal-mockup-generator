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

describe('wine v4 token guard', () => {
  test('does not emit forbidden legacy tokens', () => {
    const v2State = toStudioV2State(buildWineState());
    const prompt = generateStudioPromptV2({ ...(v2State as any), wineEngineVersion: 4 });

    const forbiddenTokens = [
      'STUDIO_ULTRA_REAL_GUARDRAIL',
      'WORLD_OVERRIDE_MODE',
      'INVALIDATE_PREVIOUS_WORLD_TOKENS',
      'WINE_WORLD_AUTHORITY',
      'WINE_LIGHTING_AUTHORITY',
      'STUDIO_COMPOSITION_MODEL',
      'COMPOSITION_OVERRIDE',
      'STUDIO_PRODUCT_MOTION',
      'FRAME_EDGE_POLICY',
      'PHOTO_TYPE',
    ];

    for (const token of forbiddenTokens) {
      expect(prompt).not.toContain(token);
    }
  });
});
