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
  test('V3: serveState=served maps to clearly-partially-consumed and volume lock placed after config', () => {
    const state = baseState();
    const prompt = buildWineTruthLayer(state, {
      closureType: 'from-reference',
      bottleState: 'open',
      serveState: 'served',
      bottleFillState: 'clearly-partially-consumed'
    } as any);

    // config appears first
    const idxConfig = prompt.indexOf('WINE_CONFIG_RESOLVED:');
    const idxVolume = prompt.indexOf('SERVED_STATE_LOCK_V4:');
    expect(idxConfig).toBeGreaterThanOrEqual(0);
    expect(idxVolume).toBeGreaterThan(idxConfig);

    // new V4 phrasing should be present
    expect(prompt).toContain('The liquid surface is at the midpoint of the bottle body');

    // mapping must be explicit in resolved config block
    expect(prompt).toContain('bottleFillState=clearly-partially-consumed');
  });

  test('V3: serveState=none maps to retail-full', () => {
    const state = baseState();
    const prompt = buildWineTruthLayer(state, {
      closureType: 'from-reference',
      bottleState: 'sealed',
      serveState: 'none',
      bottleFillState: 'retail-full'
    } as any);

    expect(prompt).toContain('bottleFillState=retail-full');
  });

  test('V4: serveState=served includes VOLUME_LOCK early and appropriate phrasing', () => {
    const state = baseState();
    const prompt = buildWineTruthLayerV4(state, {
      closureType: 'from-reference',
      bottleState: 'open',
      serveState: 'served',
      bottleFillState: 'clearly-partially-consumed'
    } as any);

    expect(prompt.indexOf('WINE_CONFIG_RESOLVED:')).toBeGreaterThan(-1);
    expect(prompt.indexOf('VOLUME_LOCK:')).toBeGreaterThan(prompt.indexOf('WINE_CONFIG_RESOLVED:'));
    expect(prompt).toContain('Bottle must appear clearly and visibly lower than standard retail fill height');
  });
});
