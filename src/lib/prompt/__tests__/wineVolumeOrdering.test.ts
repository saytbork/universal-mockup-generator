import { describe, expect, test } from 'vitest';
import { buildWineTruthLayer } from '../../productStudioV2/wineConfigResolver';
import { buildWineTruthLayerV4 } from '../../productStudioV2/wineConfigResolverV4';
import type { StudioUIState } from '../../productStudioV2/types/studioTypes';

function baseState(): StudioUIState {
  return {
    motion: 'static',
    composition: 'hero',
    visualProfile: 'wine'
  } as unknown as StudioUIState;
}

describe('wine volume ordering and binary state', () => {
  // Served model: bottle opens for service and the fill level drops because wine was poured.

  test('V3: serveState=served has BOTTLE_PRESERVATION_LOCK + WINE_GLASS, config comes first', () => {
    const state = baseState();
    const prompt = buildWineTruthLayer(state, {
      closureType: 'from-reference',
      bottleState: 'open',
      serveState: 'served',
      bottleFillState: 'clearly-partially-consumed'
    } as any);

    const idxConfig = prompt.indexOf('WINE_CONFIG_RESOLVED:');
    const idxPres = prompt.indexOf('BOTTLE_PRESERVATION_LOCK:');
    expect(idxConfig).toBeGreaterThanOrEqual(0);
    expect(idxPres).toBeGreaterThan(idxConfig);

    expect(prompt).toContain('WINE_GLASS:');
    expect(prompt).toContain('bottleState=open');
    expect(prompt).not.toContain('SERVED_STATE_LOCK_V4:');
    expect(prompt).not.toContain('Liquid line clearly at midpoint');
  });

  test('V3: serveState=none has no WINE_GLASS, BOTTLE_PRESERVATION_LOCK present', () => {
    const state = baseState();
    const prompt = buildWineTruthLayer(state, {
      closureType: 'from-reference',
      bottleState: 'sealed',
      serveState: 'none',
      bottleFillState: 'retail-full'
    } as any);

    expect(prompt).toContain('BOTTLE_PRESERVATION_LOCK:');
    expect(prompt).not.toContain('WINE_GLASS:');
    expect(prompt).toContain('bottleState=sealed');
  });

  test('V4: serveState=served has BOTTLE_PRESERVATION_LOCK + WINE_GLASS with open bottle state', () => {
    const state = baseState();
    const prompt = buildWineTruthLayerV4(state, {
      closureType: 'from-reference',
      bottleState: 'open',
      serveState: 'served',
      bottleFillState: 'clearly-partially-consumed'
    } as any);

    expect(prompt.indexOf('WINE_CONFIG_RESOLVED:')).toBeGreaterThan(-1);
    expect(prompt).toContain('BOTTLE_PRESERVATION_LOCK:');
    expect(prompt).toContain('WINE_GLASS:');
    expect(prompt).toContain('bottleState=open');
    expect(prompt).not.toContain('Bottle must appear clearly and visibly lower than standard retail fill height');
  });
});
