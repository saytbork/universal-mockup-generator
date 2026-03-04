import { describe, it, expect } from 'vitest';
import { toStudioV2State } from '../../productStudio/promptRouter';
import { buildStudioBackground } from '../../productStudioV2/builders/buildStudioBackground';
import { resolveStudioAuthority } from '../../productStudioV2/authority/studioAuthorityResolver';

/**
 * Integration: confirms palette fields survive toStudioV2State() and reach buildStudioBackground.
 * Regression guard for: "colorSource= fallback" when product palette exists.
 */

function baseState(overrides: Record<string, unknown> = {}) {
  return {
    products: [
      {
        id: 'p1',
        name: 'Test Product',
        palette: {
          dominant: '#C0392B',
          secondary: '#2980B9',
          accent: '#F1C40F',
        },
      },
    ],
    activeProductId: 'p1',
    palette: {
      source: 'auto',
      primaryColor: '#7B1FA2',
      secondaryColor: '#4CAF50',
      accentColor: '#FF9800',
      brandPresetId: null,
    },
    photoModeConfig: {
      heroLandingPage: {
        backgroundType: 'Gradient',
        paletteSource: 'Product label colors',
      },
    },
    definition: { type: 'bottle', physical: { kind: 'dummy', v: {} } },
    stateMotion: 'static',
    aspectRatio: '1:1',
    ...overrides,
  } as any;
}

describe('toStudioV2State palette propagation → buildStudioBackground', () => {
  it('Hero Landing Page: label colors reach buildStudioBackground', () => {
    const state = baseState({ photoMode: 'Hero Landing Page' });
    const v2State = toStudioV2State(state);

    expect(v2State.productPaletteSource).toBe('Use product label colors');
    expect(v2State.productPaletteA).toBe('#C0392B');
    expect(v2State.productPaletteB).toBe('#2980B9');
    expect(v2State.productPaletteC).toBe('#F1C40F');

    const authority = resolveStudioAuthority(v2State);
    const result = buildStudioBackground(authority, v2State);
    expect(result).not.toBeNull();
    expect(result!.colorSource).toBe('label');
    expect(result!.backgroundString).toContain('#C0392B');
    expect(result!.primaryColor).toBe('#C0392B');
  });

  it('Hero Landing Page: gradient mode produces gradientEnabled=true', () => {
    const state = baseState({ photoMode: 'Hero Landing Page' });
    const v2State = toStudioV2State(state);
    const authority = resolveStudioAuthority(v2State);
    const result = buildStudioBackground(authority, v2State);
    expect(result!.gradientEnabled).toBe(true);
    expect(result!.backgroundString).toContain('#C0392B');
    expect(result!.backgroundString).toContain('#2980B9');
  });

  it('Color Pop Hero: always solid, primary only', () => {
    const state = baseState({
      photoMode: 'Color Pop Hero',
      photoModeConfig: {
        heroLandingPage: { backgroundType: 'Solid', paletteSource: 'Product label colors' },
      },
    });
    const v2State = toStudioV2State(state);
    const authority = resolveStudioAuthority(v2State);
    const result = buildStudioBackground(authority, v2State);
    expect(result!.colorSource).toBe('label');
    expect(result!.gradientEnabled).toBe(false);
    expect(result!.backgroundString).toContain('#C0392B');
    expect(result!.backgroundString).not.toContain('#2980B9');
  });

  it('Hero Landing Page: Brand Colors source uses brandPalette, not label', () => {
    const state = baseState({
      photoMode: 'Hero Landing Page',
      photoModeConfig: {
        heroLandingPage: { backgroundType: 'Gradient', paletteSource: 'Brand Colors' },
      },
    });
    const v2State = toStudioV2State(state);
    expect(v2State.productPaletteSource).toBe('Brand Colors');
    expect(v2State.productPaletteA).toBe('#7B1FA2');
    const authority = resolveStudioAuthority(v2State);
    const result = buildStudioBackground(authority, v2State);
    expect(result!.colorSource).toBe('brand');
    expect(result!.primaryColor).toBe('#7B1FA2');
  });

  it('REGRESSION: no palette in state → fallback #FFFFFF, NOT a crash', () => {
    const state = {
      products: [],
      activeProductId: null,
      palette: { source: 'auto', primaryColor: null, secondaryColor: null, accentColor: null, brandPresetId: null },
      photoModeConfig: { heroLandingPage: { backgroundType: 'Solid', paletteSource: 'Product label colors' } },
      definition: { type: 'bottle', physical: { kind: 'dummy', v: {} } },
      stateMotion: 'static',
      aspectRatio: '1:1',
      photoMode: 'Color Pop Hero',
    } as any;
    const v2State = toStudioV2State(state);
    const authority = resolveStudioAuthority(v2State);
    const result = buildStudioBackground(authority, v2State);
    expect(result!.colorSource).toBe('fallback');
    expect(result!.primaryColor).toBe('#FFFFFF');
  });
});
