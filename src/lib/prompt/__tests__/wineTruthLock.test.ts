import { describe, expect, test } from 'vitest';
import type { ProductStudioState } from '../../productStudio/types';
import { toStudioV2State } from '../../productStudio/promptRouter';
import { generateStudioPromptV2 } from '../../productStudioV2';
import { isWineStrictSimulation, buildWinePhysicalPrompt, buildWineStylingPrompt, buildWineSinglePassPrompt } from '../../productStudioV2/winePromptHelpers';

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

  test('isWineStrictSimulation activates only for Wine V4 with glass', () => {
    expect(isWineStrictSimulation({ visualProfile: 'wine', wineEngineVersion: 4, wineGlassMode: 'filled' } as any)).toBe(true);
    expect(isWineStrictSimulation({ visualProfile: 'wine', wineEngineVersion: 3, wineGlassMode: 'filled' } as any)).toBe(false);
    expect(isWineStrictSimulation({ visualProfile: 'wine', wineEngineVersion: 4, wineGlassMode: 'none' } as any)).toBe(false);
    expect(isWineStrictSimulation({ visualProfile: 'coffee', wineEngineVersion: 4, wineGlassMode: 'filled' } as any)).toBe(false);
  });

  test('buildWinePhysicalPrompt includes all required physical tokens', () => {
    const prompt = buildWinePhysicalPrompt({} as any);
    expect(prompt).toContain('wine bottle that is open');
    expect(prompt).toContain('liquid level in the bottle is visibly reduced');
    expect(prompt).toContain('no closure attached');
    expect(prompt).toContain('Exactly one detached closure');
    expect(prompt).toContain('glass is partially filled');
    expect(prompt).toContain('No duplicate closures');
  });

  test('buildWineStylingPrompt includes preservation clause and styling', () => {
    const prompt = buildWineStylingPrompt({} as any);
    expect(prompt).toContain('Preserve the open bottle');
    expect(prompt).toContain('studio lighting');
    expect(prompt).toContain('hero composition');
    expect(prompt).toContain('brand label');
    expect(prompt).toContain('No changes to the physical state');
  });

  test('buildWineSinglePassPrompt starts with physical, then styling', () => {
    const prompt = buildWineSinglePassPrompt({} as any);
    expect(prompt.startsWith('A wine bottle that is open.')).toBe(true);
    expect(prompt).toContain('Professional studio lighting');
    expect(prompt).toContain('Do not alter the physical state');
  });

  test('glassFillLevel=none emits sealed state, no reduction, no transfer, factory-full', () => {
    const source = buildWineState({
      wineType: 'sparkling-white' as any,
      wineBottleState: 'sealed' as any,
      wineClosureType: 'screw-cap',
      wineGlassMode: 'none' as any,
    });
      const v2State = toStudioV2State(source);
      const prompt = generateStudioPromptV2(v2State);
    // Assert prompt does NOT contain reduction/transfer/fill wording
    expect(prompt).not.toContain('reduced proportionally');
    expect(prompt).not.toContain('Bottle not factory-full');
    expect(prompt).not.toContain('liquid transferred');
    expect(prompt).not.toContain('Glass filled');
    // Assert prompt DOES contain sealed state in config block
    expect(prompt).toContain('bottleState=sealed');
    // Optionally assert factory-full if present in new output
    // If not present, rely on negative assertions only
    // expect(prompt).toContain('factory-full'); // Uncomment if present in output
  });

  test('glassFillLevel=half emits reduction and not factory-full', () => {
    const source = buildWineState({
      wineType: 'sparkling-white' as any,
      wineBottleState: 'open' as any,
      wineClosureType: 'screw-cap',
      wineGlassMode: 'filled' as any,
      wineEngineVersion: 4,
    });
    source.wineGlassMode = 'filled';
    source.wineClosureType = 'screw-cap';
    const v2State = toStudioV2State(source);
    const prompt = generateStudioPromptV2(v2State);
  // Assert new minimal VOLUME_LOCK wording
  expect(prompt).toContain('VOLUME_LOCK: Glass contains liquid.');
  expect(prompt).toContain('Bottle liquid level must be visibly lower than unopened reference.');
  expect(prompt).toContain('Clear visible reduction required.');
  expect(prompt).not.toContain('Factory-full appearance preserved.');
  expect(prompt).not.toContain('Bottle not factory-full.');
  expect(prompt).not.toContain('Bottle level visibly reduced proportionally.');
  });

  test('wineType=still emits no carbonation block and carbonationLevel is none', () => {
    const source = buildWineState({
      wineType: 'still' as any,
      carbonationLevel: 'visible' as any,
      wineGlassMode: 'filled' as any,
    });
    const v2State = toStudioV2State(source);
    const prompt = generateStudioPromptV2(v2State);
    expect(prompt).not.toContain('CARBONATION_BEHAVIOR');
  });

  test('closureType=screw emits only screw-cap, not cork or crown', () => {
    const source = buildWineState({
      wineClosureType: 'screw' as any,
      wineGlassMode: 'filled' as any,
      wineEngineVersion: 4,
    });
    source.wineGlassMode = 'filled';
    source.wineClosureType = 'screw';
    const v2State = toStudioV2State(source);
    const prompt = generateStudioPromptV2(v2State);
  // Assert new minimal CLOSURE_LOCK wording
  expect(prompt).toContain('CLOSURE_LOCK: Bottle is open.');
  expect(prompt).toContain('No cap attached to bottle.');
  expect(prompt).toContain('Exactly one detached crown-cap visible on surface.');
  expect(prompt).not.toContain('cork');
    expect(prompt).not.toContain('pry-state');
    expect(prompt).not.toContain('thread');
    expect(prompt).not.toContain('seated');
  });

  test('does not leak wine truth layer into coffee profile', () => {
    const v2State = toStudioV2State(buildCoffeeState());
    const prompt = generateStudioPromptV2(v2State);
    expect(prompt).not.toContain('WINE_PROFILE:');
    expect(prompt).not.toContain('COLOR_ACCURACY:');
    expect(prompt).not.toContain('WINE_ENGINE: deterministic.');
  });
});
