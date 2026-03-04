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
