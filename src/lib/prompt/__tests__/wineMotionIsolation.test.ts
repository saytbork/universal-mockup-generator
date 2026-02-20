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
    stateMotion: 'pouring',
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
    category: 'Wine',
    contextPreset: 'Oak Barrel Cellar',
    ...overrides,
  } as ProductStudioState;
}

describe('wine motion isolation', () => {
  test('wine pouring input resolves to static motion and strips dynamic wording', () => {
    const source = buildWineState({ stateMotion: 'pouring' });
    const first = toStudioV2State(source);
    const second = toStudioV2State(source);
    const prompt = generateStudioPromptV2(first);

    expect(source.stateMotion).toBe('pouring');
    expect(first.motion).toBe('static');
    expect(first.wineAction).toBe('static-presentation');
    expect(first).not.toBe(second);

    expect(prompt).toContain('WINE_ACTION: static-presentation');
    expect(prompt).not.toMatch(/\bPOUR(?:ING)?\b/i);
    expect(prompt).not.toMatch(/\bSPILL(?:ED|ING)?\b/i);
    expect(prompt).not.toMatch(/\bFALL(?:ING)?\b/i);
    expect(prompt).not.toMatch(/\bDISPENS(?:E|ED|ING)\b/i);
  });
});
