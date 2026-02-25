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
  test('served mode contains only priority blocks and exact wording', () => {
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

    // Order: WINE_CONFIG_RESOLVED then SERVE_VOLUME_CONSERVATION_LOCK_V3
    const idxConfig = prompt.indexOf('WINE_CONFIG_RESOLVED:');
    const idxVolume = prompt.indexOf('SERVE_VOLUME_CONSERVATION_LOCK_V3:');
    expect(idxConfig).toBeGreaterThanOrEqual(0);
    expect(idxVolume).toBeGreaterThan(idxConfig);

    // Phrase must be exact
    expect(prompt).toContain('The liquid level must be visually around the middle of the bottle height');

    // Ensure no residual granular tokens
    expect(prompt).not.toContain('glassFillLevel');
    expect(prompt).not.toContain('%');
    expect(prompt).not.toContain('ml');
  });
});
