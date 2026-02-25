import { describe, expect, test } from 'vitest';
import { buildWineTruthLayer } from '../../productStudioV2/wineConfigResolver';
import type { StudioUIState } from '../../productStudioV2';

function buildState(overrides: Partial<StudioUIState> = {}): StudioUIState {
  return {
    wineType: 'auto',
    carbonationLevel: 'none',
    ...overrides,
  } as StudioUIState;
}

describe('wine engine v3 matrix', () => {
  test('sparkling-white + crown-cap + open + glass half emits V3 locks', () => {
    const prompt = buildWineTruthLayer(
      buildState({ wineType: 'sparkling-white', carbonationLevel: 'high' }),
      { closureType: 'crown-cap', bottleState: 'open', glassFillLevel: 'half' }
    );

    expect(prompt).toContain('WINE_STRUCTURAL_LOCK_V3:');
    expect(prompt).toContain('SERVE_VOLUME_CONSERVATION_LOCK_V3:');
    expect(prompt).toContain('SPARKLING_PHYSICS_LOCK_V3:');
    expect(prompt).toContain('CROWN_CAP_REMOVAL_LOCK_V3:');
    expect(prompt).toContain('carbonationLevel=natural;');
  });

  test('sparkling-white + crown-cap + open + glass three-quarters keeps subtle sparkling without volume lock', () => {
    const prompt = buildWineTruthLayer(
      buildState({ wineType: 'sparkling-white', carbonationLevel: 'high' }),
      { closureType: 'crown-cap', bottleState: 'open', glassFillLevel: 'three-quarters' }
    );

    expect(prompt).toContain('SPARKLING_PHYSICS_LOCK_V3:');
    expect(prompt).toContain('CROWN_CAP_REMOVAL_LOCK_V3:');
    // With the simplified rule any non-empty glass should enforce the volume lock
    expect(prompt).toContain('SERVE_VOLUME_CONSERVATION_LOCK_V3:');
  });

  test('still-white + natural-cork + open + glass half excludes crown/sparkling locks', () => {
    const prompt = buildWineTruthLayer(
      buildState({ wineType: 'white', carbonationLevel: 'none' }),
      { closureType: 'natural-cork', bottleState: 'open', glassFillLevel: 'half' }
    );

    expect(prompt).toContain('SERVE_VOLUME_CONSERVATION_LOCK_V3:');
    expect(prompt).not.toContain('SPARKLING_PHYSICS_LOCK_V3:');
    expect(prompt).not.toContain('CROWN_CAP_REMOVAL_LOCK_V3:');
  });

  test('still-white + screw-cap + sealed excludes open-state locks', () => {
    const prompt = buildWineTruthLayer(
      buildState({ wineType: 'white', carbonationLevel: 'none' }),
      { closureType: 'screw-cap', bottleState: 'sealed', glassFillLevel: 'none' }
    );

    expect(prompt).not.toContain('SERVE_VOLUME_CONSERVATION_LOCK_V3:');
    expect(prompt).not.toContain('SPARKLING_PHYSICS_LOCK_V3:');
    expect(prompt).not.toContain('CROWN_CAP_REMOVAL_LOCK_V3:');
  });

  test('sparkling-rose + open + glass empty keeps subtle sparkling lock', () => {
    const prompt = buildWineTruthLayer(
      buildState({ wineType: 'sparkling-rosé', carbonationLevel: 'medium' }),
      { closureType: 'from-reference', bottleState: 'open', glassFillLevel: 'none' }
    );

    expect(prompt).toContain('SPARKLING_PHYSICS_LOCK_V3:');
    expect(prompt).not.toContain('SERVE_VOLUME_CONSERVATION_LOCK_V3:');
  });
});
