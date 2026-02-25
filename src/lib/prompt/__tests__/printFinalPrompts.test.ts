import { test } from 'vitest';
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

test('print final prompt strings for forensic analysis', () => {
  const state = baseState();

  const v3None = buildWineTruthLayer(state, {
    closureType: 'from-reference',
    bottleState: 'sealed',
    serveState: 'none',
    bottleFillState: 'retail-full'
  } as any);

  const v3Served = buildWineTruthLayer(state, {
    closureType: 'from-reference',
    bottleState: 'open',
    serveState: 'served',
    bottleFillState: 'clearly-partially-consumed'
  } as any);

  const v4None = buildWineTruthLayerV4(state, {
    closureType: 'from-reference',
    bottleState: 'sealed',
    serveState: 'none',
    bottleFillState: 'retail-full'
  } as any);

  const v4Served = buildWineTruthLayerV4(state, {
    closureType: 'from-reference',
    bottleState: 'open',
    serveState: 'served',
    bottleFillState: 'clearly-partially-consumed'
  } as any);

  // Print the prompts for forensic analysis
  // eslint-disable-next-line no-console
  console.log('\n--- V3 NONE ---\n' + v3None + '\n');
  // eslint-disable-next-line no-console
  console.log('\n--- V3 SERVED ---\n' + v3Served + '\n');
  // eslint-disable-next-line no-console
  console.log('\n--- V4 NONE ---\n' + v4None + '\n');
  // eslint-disable-next-line no-console
  console.log('\n--- V4 SERVED ---\n' + v4Served + '\n');
});
