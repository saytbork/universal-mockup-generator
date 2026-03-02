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
  // New model: bottle is ALWAYS sealed/closed. served only adds WINE_GLASS.
  // SERVED_STATE_LOCK_V4 and CROWN_CAP_REMOVAL_LOCK_V3 no longer emitted.

  test('sparkling-white + crown-cap + served emits BOTTLE_PRESERVATION_LOCK + WINE_GLASS + SPARKLING', () => {
    const prompt = buildWineTruthLayer(
      buildState({ wineType: 'sparkling-white', carbonationLevel: 'high' }),
      { closureType: 'crown-cap', bottleState: 'open', serveState: 'served', bottleFillState: 'clearly-partially-consumed' }
    );

    expect(prompt).toContain('BOTTLE_PRESERVATION_LOCK:');
    expect(prompt).toContain('WINE_GLASS:');
    expect(prompt).toContain('SPARKLING_PHYSICS_LOCK_V3:');
    expect(prompt).not.toContain('SERVED_STATE_LOCK_V4:');
    expect(prompt).not.toContain('CROWN_CAP_REMOVAL_LOCK_V3:');
  });

  test('sparkling-white + crown-cap + served keeps sparkling lock', () => {
    const prompt = buildWineTruthLayer(
      buildState({ wineType: 'sparkling-white', carbonationLevel: 'high' }),
      { closureType: 'crown-cap', bottleState: 'open', serveState: 'served', bottleFillState: 'clearly-partially-consumed' }
    );

    expect(prompt).toContain('SPARKLING_PHYSICS_LOCK_V3:');
    expect(prompt).toContain('WINE_GLASS:');
    expect(prompt).not.toContain('SERVED_STATE_LOCK_V4:');
  });

  test('still-white + natural-cork + served: no sparkling lock, has WINE_GLASS', () => {
    const prompt = buildWineTruthLayer(
      buildState({ wineType: 'white', carbonationLevel: 'none' }),
      { closureType: 'natural-cork', bottleState: 'open', serveState: 'served', bottleFillState: 'clearly-partially-consumed' }
    );

    expect(prompt).toContain('BOTTLE_PRESERVATION_LOCK:');
    expect(prompt).toContain('WINE_GLASS:');
    expect(prompt).not.toContain('SERVED_STATE_LOCK_V4:');
    expect(prompt).not.toContain('SPARKLING_PHYSICS_LOCK_V3:');
    expect(prompt).not.toContain('CROWN_CAP_REMOVAL_LOCK_V3:');
  });

  test('still-white + screw-cap + sealed: no glass, BOTTLE_PRESERVATION_LOCK present', () => {
    const prompt = buildWineTruthLayer(
      buildState({ wineType: 'white', carbonationLevel: 'none' }),
      { closureType: 'screw-cap', bottleState: 'sealed', serveState: 'none', bottleFillState: 'retail-full' }
    );

    expect(prompt).toContain('BOTTLE_PRESERVATION_LOCK:');
    expect(prompt).not.toContain('WINE_GLASS:');
    expect(prompt).not.toContain('SERVE_VOLUME_CONSERVATION_LOCK_V3:');
    expect(prompt).not.toContain('SPARKLING_PHYSICS_LOCK_V3:');
    expect(prompt).not.toContain('CROWN_CAP_REMOVAL_LOCK_V3:');
  });

  test('sparkling-rose + open emits sparkling lock without WINE_GLASS when serveState=none', () => {
    const prompt = buildWineTruthLayer(
      buildState({ wineType: 'sparkling-rosé', carbonationLevel: 'medium' }),
      { closureType: 'from-reference', bottleState: 'open', serveState: 'none', bottleFillState: 'retail-full' }
    );

    expect(prompt).toContain('SPARKLING_PHYSICS_LOCK_V3:');
    expect(prompt).not.toContain('WINE_GLASS:');
    expect(prompt).not.toContain('SERVE_VOLUME_CONSERVATION_LOCK_V3:');
  });
});
