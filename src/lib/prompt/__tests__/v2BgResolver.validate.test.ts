import { describe, it, expect } from 'vitest';
import { buildPalette } from '../../productStudioV2/builders/buildPalette';
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

/** Build a StudioUIState, run buildPalette to populate resolvedPalette, then return the state. */
function makeState(overrides: Partial<StudioUIState>): StudioUIState {
  const state: StudioUIState = { motion: 'static', composition: 'hero', ...overrides };
  buildPalette(state);
  return state;
}

// ─── Core contract: resolvedPalette is the single source of truth ─────────────

describe('buildStudioBackground — V2 resolvedPalette contract', () => {
  it('Hero LP: product palette gradient → contains all three hex codes, colorSource=product', () => {
    const state = makeState({
      photoMode: 'Hero Landing Page',
      productPaletteA: '#C0392B',
      productPaletteB: '#2980B9',
      productPaletteC: '#F1C40F',
      photoModeConfig: { heroLandingPage: { backgroundType: 'Gradient' } },
    });
    const result = buildStudioBackground(authority, state);
    expect(result).not.toBeNull();
    expect(result!.gradientEnabled).toBe(true);
    expect(result!.colorSource).toBe('product');
    expect(result!.backgroundString).toContain('#c0392b');
    expect(result!.backgroundString).toContain('#2980b9');
    expect(result!.backgroundString).toContain('#f1c40f');
    expect(result!.backgroundString).not.toContain('#FFFFFF');
  });

  it('Hero LP: product palette solid → only primary in output, colorSource=product', () => {
    const state = makeState({
      photoMode: 'Hero Landing Page',
      productPaletteA: '#C0392B',
      photoModeConfig: { heroLandingPage: { backgroundType: 'Solid' } },
    });
    const result = buildStudioBackground(authority, state);
    expect(result!.gradientEnabled).toBe(false);
    expect(result!.colorSource).toBe('product');
    expect(result!.backgroundString).toContain('#c0392b');
    expect(result!.backgroundString).not.toContain('#FFFFFF');
  });

  it('Hero LP: only productPaletteA → secondary/tertiary derived, still no #FFFFFF', () => {
    const state = makeState({
      photoMode: 'Hero Landing Page',
      productPaletteA: '#C0392B',
      // productPaletteB/C absent → derived by buildPalette
      photoModeConfig: { heroLandingPage: { backgroundType: 'Gradient' } },
    });
    const result = buildStudioBackground(authority, state);
    expect(result!.colorSource).toBe('product');
    expect(result!.primaryColor).toBe('#c0392b');
    expect(result!.backgroundString).not.toContain('#FFFFFF');
    expect(result!.backgroundString).not.toContain('#ffffff');
    // gradient enabled — secondary was derived by buildPalette
    expect(result!.gradientEnabled).toBe(true);
  });

  it('Hero LP: brand palette (no product) → colorSource=brand, brand colors in output', () => {
    const state = makeState({
      photoMode: 'Hero Landing Page',
      brandPalette: { primaryColor: '#7B1FA2', secondaryColor: '#4CAF50', accentColor: '#FF9800' },
      photoModeConfig: { heroLandingPage: { backgroundType: 'Gradient' } },
    });
    const result = buildStudioBackground(authority, state);
    expect(result!.colorSource).toBe('brand');
    expect(result!.primaryColor).toBe('#7b1fa2');
    expect(result!.backgroundString).toContain('#7b1fa2');
    expect(result!.backgroundString).not.toContain('#FFFFFF');
  });

  it('Hero LP: no palette anywhere → neutral-gray fallback, colorSource=neutral, never #FFFFFF', () => {
    const state = makeState({ photoMode: 'Hero Landing Page' });
    const result = buildStudioBackground(authority, state);
    expect(result!.colorSource).toBe('neutral');
    expect(result!.primaryColor).toBe('#f9fafb');
    expect(result!.backgroundString).toContain('#f9fafb');
    expect(result!.backgroundString).not.toContain('#FFFFFF');
  });

  it('Color Pop Hero: always solid, primary only, no secondary in output', () => {
    const state = makeState({
      photoMode: 'Color Pop Hero',
      productPaletteA: '#C0392B',
      productPaletteB: '#2980B9',
    });
    const result = buildStudioBackground(authority, state);
    expect(result!.gradientEnabled).toBe(false);
    expect(result!.colorSource).toBe('product');
    expect(result!.backgroundString).toContain('#c0392b');
    expect(result!.backgroundString).not.toContain('#2980b9');
  });

  it('Color Pop Hero: no palette → neutral-gray, no #FFFFFF', () => {
    const state = makeState({ photoMode: 'Color Pop Hero' });
    const result = buildStudioBackground(authority, state);
    expect(result!.colorSource).toBe('neutral');
    expect(result!.primaryColor).toBe('#f9fafb');
    expect(result!.backgroundString).not.toContain('#FFFFFF');
  });

  it('other photo modes → returns null (not handled by this builder)', () => {
    const state = makeState({ photoMode: 'Dark Premium Studio' });
    expect(buildStudioBackground(authority, state)).toBeNull();
  });
});

// ─── Invariant guard ──────────────────────────────────────────────────────────

describe('buildStudioBackground — invariant guard', () => {
  it('throws if resolvedPalette is missing (buildPalette not called)', () => {
    // Bypass makeState helper — do NOT call buildPalette
    const state: StudioUIState = {
      motion: 'static',
      composition: 'hero',
      photoMode: 'Hero Landing Page',
      productPaletteA: '#C0392B',
    };
    expect(() => buildStudioBackground(authority, state)).toThrow(
      '[buildStudioBackground] Invariant violation'
    );
  });
});

// ─── Product palette always beats brand ───────────────────────────────────────

describe('buildStudioBackground — product always beats brand', () => {
  it('product + brand both present → product wins, brand colors absent from output', () => {
    const state = makeState({
      photoMode: 'Hero Landing Page',
      productPaletteA: '#C0392B',
      productPaletteB: '#2980B9',
      productPaletteC: '#F1C40F',
      brandPalette: { primaryColor: '#7B1FA2', secondaryColor: '#4CAF50' },
      photoModeConfig: { heroLandingPage: { backgroundType: 'Gradient' } },
    });
    const result = buildStudioBackground(authority, state);
    expect(result!.colorSource).toBe('product');
    expect(result!.backgroundString).toContain('#c0392b');
    expect(result!.backgroundString).not.toContain('#7b1fa2');
    expect(result!.backgroundString).not.toContain('#4caf50');
  });
});

// ─── Neutral brand tones path (via buildPalette derivation) ──────────────────

describe('buildStudioBackground — neutral brand tones path', () => {
  it('neutral-gray palette produces neutral gradient with no #FFFFFF', () => {
    // Simulates buildPalette resolving to neutral grays (no product, no brand)
    const state = makeState({
      photoMode: 'Hero Landing Page',
      photoModeConfig: { heroLandingPage: { backgroundType: 'Gradient' } },
    });
    const result = buildStudioBackground(authority, state);
    expect(result!.colorSource).toBe('neutral');
    expect(result!.gradientEnabled).toBe(true);
    expect(result!.backgroundString).toContain('#f9fafb');
    expect(result!.backgroundString).toContain('#f3f4f6');
    expect(result!.backgroundString).toContain('#e5e7eb');
    expect(result!.backgroundString).not.toContain('#FFFFFF');
  });
});
