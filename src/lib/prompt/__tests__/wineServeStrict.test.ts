import { describe, expect, test } from 'vitest';
import { buildWineTruthLayer } from '../../productStudioV2/wineConfigResolver';

function baseState() {
  return {
    motion: 'static',
    composition: 'hero',
    visualProfile: 'wine'
  } as any;
}

describe('strict serveState prompt', () => {
  test('served mode contains BOTTLE_PRESERVATION_LOCK + WINE_GLASS with open service bottle', () => {
    const state = baseState();
    const prompt = buildWineTruthLayer(state, {
      closureType: 'from-reference',
      bottleState: 'open',
      serveState: 'served',
      bottleFillState: 'clearly-partially-consumed'
    } as any);

    // Must not contain environment or lighting or composition
    expect(prompt).not.toContain('WINE_ENVIRONMENT');
    expect(prompt).not.toContain('WINE_LIGHTING');
    expect(prompt).not.toContain('composition');
    expect(prompt).not.toContain('STUDIO_LIGHTING_PROFILE');

    expect(prompt).toContain('BOTTLE_PRESERVATION_LOCK:');
    expect(prompt).toContain('WINE_GLASS:');
    expect(prompt).toContain('bottleState=open');
    expect(prompt).toContain('opened for service');

    expect(prompt).not.toContain('SERVED_STATE_LOCK_V4:');
    expect(prompt).not.toContain('Liquid line clearly at midpoint');
    expect(prompt).not.toContain('glassFillLevel');
    expect(prompt).not.toContain('ml');

    // Order: WINE_CONFIG_RESOLVED before BOTTLE_PRESERVATION_LOCK
    const idxConfig = prompt.indexOf('WINE_CONFIG_RESOLVED:');
    const idxPres = prompt.indexOf('BOTTLE_PRESERVATION_LOCK:');
    expect(idxConfig).toBeGreaterThanOrEqual(0);
    expect(idxPres).toBeGreaterThan(idxConfig);
  });
});
