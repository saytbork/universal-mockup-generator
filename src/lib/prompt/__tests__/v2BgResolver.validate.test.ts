import { describe, it, expect } from 'vitest';
import { buildStudioBackground } from '../../productStudioV2/builders/buildStudioBackground';
import type { StudioAuthorityBundle, StudioUIState } from '../../productStudioV2/types/studioTypes';

const authority: StudioAuthorityBundle = {
  creativeIntent: 'conversion',
  world: 'studio',
  motion: 'static',
  composition: 'hero',
  permissions: {
    allowSplash: false,
    allowAtmosphere: false,
    allowParticles: false,
    allowHorizontalSpread: true,
    allowVerticalDominance: true,
  },
};

function makeState(overrides: Partial<StudioUIState>): StudioUIState {
  return { motion: 'static', composition: 'hero', ...overrides };
}

describe('buildStudioBackground — V2 deterministic brand resolver', () => {
  it('Hero LP: label colors gradient → contains both hex codes', () => {
    const state = makeState({
      photoMode: 'Hero Landing Page',
      productPaletteSource: 'Use product label colors',
      productPaletteA: '#C0392B',
      productPaletteB: '#2980B9',
      productPaletteC: '#F1C40F',
      photoModeConfig: { heroLandingPage: { backgroundType: 'Gradient' } },
    });
    const result = buildStudioBackground(authority, state);
    expect(result).not.toBeNull();
    expect(result!.gradientEnabled).toBe(true);
    expect(result!.colorSource).toBe('label');
    expect(result!.backgroundString).toContain('#C0392B');
    expect(result!.backgroundString).toContain('#2980B9');
  });

  it('Hero LP: label colors solid → only primary, no gradient', () => {
    const state = makeState({
      photoMode: 'Hero Landing Page',
      productPaletteSource: 'Use product label colors',
      productPaletteA: '#C0392B',
      photoModeConfig: { heroLandingPage: { backgroundType: 'Solid' } },
    });
    const result = buildStudioBackground(authority, state);
    expect(result!.gradientEnabled).toBe(false);
    expect(result!.backgroundString).toContain('#C0392B');
  });

  it('Hero LP: brand system colors → uses brandPalette', () => {
    const state = makeState({
      photoMode: 'Hero Landing Page',
      productPaletteSource: 'Brand Colors',
      brandPalette: { primaryColor: '#7B1FA2', secondaryColor: '#4CAF50' },
      photoModeConfig: { heroLandingPage: { backgroundType: 'Gradient' } },
    });
    const result = buildStudioBackground(authority, state);
    expect(result!.colorSource).toBe('brand');
    expect(result!.primaryColor).toBe('#7B1FA2');
    expect(result!.backgroundString).toContain('#7B1FA2');
    expect(result!.backgroundString).toContain('#4CAF50');
  });

  it('Hero LP: fallback → #FFFFFF', () => {
    const state = makeState({ photoMode: 'Hero Landing Page' });
    const result = buildStudioBackground(authority, state);
    expect(result!.colorSource).toBe('fallback');
    expect(result!.primaryColor).toBe('#FFFFFF');
    expect(result!.backgroundString).toContain('#FFFFFF');
  });

  it('Color Pop Hero: always solid, primary only', () => {
    const state = makeState({
      photoMode: 'Color Pop Hero',
      productPaletteSource: 'Use product label colors',
      productPaletteA: '#C0392B',
      productPaletteB: '#2980B9',
    });
    const result = buildStudioBackground(authority, state);
    expect(result!.gradientEnabled).toBe(false);
    expect(result!.backgroundString).toContain('#C0392B');
    expect(result!.backgroundString).not.toContain('#2980B9');
  });

  it('Color Pop Hero: custom override → uses custom color', () => {
    const state = makeState({
      photoMode: 'Color Pop Hero',
      productPaletteSource: 'Custom',
      productPaletteA: '#00BCD4',
    });
    const result = buildStudioBackground(authority, state);
    expect(result!.colorSource).toBe('custom');
    expect(result!.backgroundString).toContain('#00BCD4');
    expect(result!.backgroundString).not.toContain('#C0392B');
  });

  it('other photo modes → returns null (not handled by this builder)', () => {
    const state = makeState({ photoMode: 'Dark Premium Studio' });
    expect(buildStudioBackground(authority, state)).toBeNull();
  });
});

// ─── normalizeSource robustness ───────────────────────────────────────────────

describe('buildStudioBackground — normalizeSource / source alias coverage', () => {
  it('V1 "Product label colors" alias resolves same as V2 "Use product label colors"', () => {
    // promptRouter always maps to V2 canonical, but if a raw V1 string leaks through the
    // normalizeSource helper must still resolve correctly.
    const withV2 = makeState({
      photoMode: 'Hero Landing Page',
      productPaletteSource: 'Use product label colors',
      productPaletteA: '#AA0000',
    });
    // Simulate the V1 raw string leaking through (cast to bypass TS)
    const withV1 = makeState({
      photoMode: 'Hero Landing Page',
      productPaletteSource: 'Product label colors' as never,
      productPaletteA: '#AA0000',
    });
    const r2 = buildStudioBackground(authority, withV2);
    const r1 = buildStudioBackground(authority, withV1);
    expect(r2!.colorSource).toBe('label');
    expect(r1!.colorSource).toBe('label');
    expect(r1!.primaryColor).toBe('#AA0000');
  });

  it('"Neutral brand tones" alias (V1 string leaking) resolves as custom with neutral palette', () => {
    // 'Neutral brand tones' is normalized to 'custom' by normalizeSource.
    // promptRouter populates productPaletteA/B/C with neutral whites before calling buildStudioBackground,
    // so pA will be '#FFFFFF'. Simulate that full path here.
    const state = makeState({
      photoMode: 'Hero Landing Page',
      productPaletteSource: 'Neutral brand tones' as never,
      productPaletteA: '#FFFFFF',
      productPaletteB: '#F3F4F6',
      productPaletteC: '#E5E7EB',
      photoModeConfig: { heroLandingPage: { backgroundType: 'Solid' } },
    });
    const result = buildStudioBackground(authority, state);
    expect(result).not.toBeNull();
    expect(result!.colorSource).toBe('custom');
    expect(result!.primaryColor).toBe('#FFFFFF');
    expect(result!.backgroundString).toContain('#FFFFFF');
  });
});

// ─── label-source fallback chain ──────────────────────────────────────────────

describe('buildStudioBackground — label-source cascade to brand when pA is empty', () => {
  it('label source + no productPaletteA + brandPalette present → cascades to brand, not white', () => {
    // Reproduces the real bug: label extraction pending, brandPalette set via promptRouter.
    const state = makeState({
      photoMode: 'Hero Landing Page',
      productPaletteSource: 'Use product label colors',
      // productPaletteA intentionally absent (extraction pending)
      brandPalette: { primaryColor: '#3B0764', secondaryColor: '#7E22CE' },
      photoModeConfig: { heroLandingPage: { backgroundType: 'Solid' } },
    });
    const result = buildStudioBackground(authority, state);
    expect(result).not.toBeNull();
    expect(result!.colorSource).toBe('brand');
    expect(result!.primaryColor).toBe('#3B0764');
    expect(result!.backgroundString).toContain('#3B0764');
    // Must NOT fall through to white
    expect(result!.primaryColor).not.toBe('#FFFFFF');
  });

  it('label source + no productPaletteA + no brandPalette → fallback to white', () => {
    // Only when truly no colors exist anywhere do we go to white.
    const state = makeState({
      photoMode: 'Hero Landing Page',
      productPaletteSource: 'Use product label colors',
    });
    const result = buildStudioBackground(authority, state);
    expect(result!.colorSource).toBe('fallback');
    expect(result!.primaryColor).toBe('#FFFFFF');
  });

  it('brand source + no brandPalette → fallback to white', () => {
    const state = makeState({
      photoMode: 'Hero Landing Page',
      productPaletteSource: 'Brand Colors',
      // no brandPalette
    });
    const result = buildStudioBackground(authority, state);
    expect(result!.colorSource).toBe('fallback');
    expect(result!.primaryColor).toBe('#FFFFFF');
  });

  it('custom source + no productPaletteA → fallback to white', () => {
    const state = makeState({
      photoMode: 'Hero Landing Page',
      productPaletteSource: 'Custom',
      // no productPaletteA
    });
    const result = buildStudioBackground(authority, state);
    expect(result!.colorSource).toBe('fallback');
    expect(result!.primaryColor).toBe('#FFFFFF');
  });

  it('undefined source → fallback to white', () => {
    const state = makeState({ photoMode: 'Hero Landing Page' });
    const result = buildStudioBackground(authority, state);
    expect(result!.colorSource).toBe('fallback');
    expect(result!.primaryColor).toBe('#FFFFFF');
  });
});

// ─── promptRouter integration: 'Neutral brand tones' full path ────────────────

describe('buildStudioBackground — promptRouter "Neutral brand tones" full path simulation', () => {
  it('after promptRouter maps Neutral brand tones → Custom + neutral whites, resolver returns custom/white', () => {
    // Simulates the exact state that promptRouter.ts produces for paletteSource='Neutral brand tones':
    //   productPaletteSource='Custom', productPaletteA='#FFFFFF', productPaletteB='#F3F4F6', productPaletteC='#E5E7EB'
    const state = makeState({
      photoMode: 'Hero Landing Page',
      productPaletteSource: 'Custom',
      productPaletteA: '#FFFFFF',
      productPaletteB: '#F3F4F6',
      productPaletteC: '#E5E7EB',
      photoModeConfig: { heroLandingPage: { backgroundType: 'Solid' } },
    });
    const result = buildStudioBackground(authority, state);
    expect(result).not.toBeNull();
    expect(result!.colorSource).toBe('custom');
    // Primary is white (as designed — neutral brand tones IS white-neutral)
    expect(result!.primaryColor).toBe('#FFFFFF');
    // No white fallback confusion — colorSource MUST be 'custom', not 'fallback'
    expect(result!.colorSource).not.toBe('fallback');
  });

  it('Neutral brand tones + Gradient backgroundType → gradient enabled with neutral stops', () => {
    const state = makeState({
      photoMode: 'Hero Landing Page',
      productPaletteSource: 'Custom',
      productPaletteA: '#FFFFFF',
      productPaletteB: '#F3F4F6',
      productPaletteC: '#E5E7EB',
      photoModeConfig: { heroLandingPage: { backgroundType: 'Gradient' } },
    });
    const result = buildStudioBackground(authority, state);
    expect(result!.gradientEnabled).toBe(true);
    expect(result!.backgroundString).toContain('#FFFFFF');
    expect(result!.backgroundString).toContain('#F3F4F6');
  });
});
