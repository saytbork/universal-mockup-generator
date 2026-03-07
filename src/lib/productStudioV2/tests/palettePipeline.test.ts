/**
 * palettePipeline.test.ts
 *
 * Validates the full palette pipeline contract:
 *   buildPalette → buildStudioBackground
 *
 * Tests:
 *   1. Product with strong label color → Hero background = label color
 *   2. Product with single color → secondary/tertiary derived automatically
 *   3. Product palette always preferred over brand palette
 *   4. extractProductPalette never returns null paletteA (buildPalette fallback)
 *   5. Neutral fallback when NO palette data at all
 *   6. Custom source tier respected (between brand and neutral)
 *   7. [BG_COLOR_USED] log always fires
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { buildPalette } from '../builders/buildPalette';
import { buildStudioBackground } from '../builders/buildStudioBackground';
import type { StudioAuthorityBundle, StudioUIState } from '../types/studioTypes';

// ── Fixtures ─────────────────────────────────────────────────────────────────

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

function makeHeroState(overrides: Partial<StudioUIState> = {}): StudioUIState {
  const state: StudioUIState = {
    motion: 'static',
    composition: 'hero',
    photoMode: 'Hero Landing Page',
    ...overrides,
  };
  buildPalette(state);
  return state;
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('Palette Pipeline — Product with strong label color', () => {
  it('Hero background uses the extracted product dominant color', () => {
    const state = makeHeroState({
      productPaletteA: '#c7423a',
      productPaletteB: '#a92f29',
      productPaletteC: '#f0b1a8',
      photoModeConfig: { heroLandingPage: { backgroundType: 'Solid' } },
    });

    expect(state.resolvedPalette!.source).toBe('product');
    expect(state.resolvedPalette!.primary).toBe('#c7423a');

    const bg = buildStudioBackground(authority, state);
    expect(bg).not.toBeNull();
    expect(bg!.colorSource).toBe('product');
    expect(bg!.primaryColor).toBe('#c7423a');
    expect(bg!.backgroundString).toContain('#c7423a');
    // Must never produce a white or neutral background
    expect(bg!.backgroundString).not.toContain('#ffffff');
    expect(bg!.backgroundString).not.toContain('#FFFFFF');
    expect(bg!.backgroundString).not.toContain('#f9fafb');
  });
});

describe('Palette Pipeline — Product with single color (secondary/tertiary derived)', () => {
  it('Derives secondary and tertiary via lighten/darken when only A is provided', () => {
    const state = makeHeroState({
      productPaletteA: '#c7423a',
      // No B or C provided
      photoModeConfig: { heroLandingPage: { backgroundType: 'Gradient' } },
    });

    expect(state.resolvedPalette!.source).toBe('product');
    expect(state.resolvedPalette!.primary).toBe('#c7423a');

    // Secondary and tertiary must be derived (not empty, not equal to #f9fafb)
    expect(state.resolvedPalette!.secondary).toBeTruthy();
    expect(state.resolvedPalette!.secondary).not.toBe('#f9fafb');
    expect(state.resolvedPalette!.tertiary).toBeTruthy();
    expect(state.resolvedPalette!.tertiary).not.toBe('#f9fafb');

    // Different from primary (lighten/darken shift the value)
    expect(state.resolvedPalette!.secondary).not.toBe('#c7423a');
    expect(state.resolvedPalette!.tertiary).not.toBe('#c7423a');

    const bg = buildStudioBackground(authority, state);
    expect(bg!.gradientEnabled).toBe(true);
    expect(bg!.colorSource).toBe('product');
    // Gradient string contains primary
    expect(bg!.backgroundString).toContain('#c7423a');
  });
});

describe('Palette Pipeline — Product palette always beats brand palette', () => {
  it('Uses product colors even when brandPalette is also set', () => {
    const state = makeHeroState({
      productPaletteA: '#c7423a',
      productPaletteB: '#a92f29',
      productPaletteC: '#f0b1a8',
      brandPalette: { primaryColor: '#1a237e', secondaryColor: '#283593', accentColor: '#3949ab' },
      photoModeConfig: { heroLandingPage: { backgroundType: 'Solid' } },
    });

    // Product wins
    expect(state.resolvedPalette!.source).toBe('product');
    expect(state.resolvedPalette!.primary).toBe('#c7423a');

    const bg = buildStudioBackground(authority, state);
    expect(bg!.colorSource).toBe('product');
    expect(bg!.primaryColor).toBe('#c7423a');
    // Brand blue must not appear
    expect(bg!.backgroundString).not.toContain('#1a237e');
  });

  it('Falls back to brand palette when no product palette', () => {
    const state = makeHeroState({
      brandPalette: { primaryColor: '#1a237e', secondaryColor: '#283593', accentColor: '#3949ab' },
      photoModeConfig: { heroLandingPage: { backgroundType: 'Solid' } },
    });

    expect(state.resolvedPalette!.source).toBe('brand');
    expect(state.resolvedPalette!.primary).toBe('#1a237e');

    const bg = buildStudioBackground(authority, state);
    expect(bg!.colorSource).toBe('brand');
    expect(bg!.backgroundString).toContain('#1a237e');
  });
});

describe('Palette Pipeline — extractProductPalette never returns null paletteA', () => {
  it('buildPalette always writes resolvedPalette even with no input', () => {
    // Simulate worst case: no product palette, no brand palette
    const state: StudioUIState = { motion: 'static', composition: 'hero' };
    buildPalette(state);

    // Must always have a resolved palette
    expect(state.resolvedPalette).toBeDefined();
    expect(state.resolvedPalette!.primary).toBeTruthy();

    // Neutral fallback must be gray, never pure white
    expect(state.resolvedPalette!.primary).not.toBe('#ffffff');
    expect(state.resolvedPalette!.source).toBe('neutral');
  });

  it('buildPalette with productPaletteA set always resolves to product source', () => {
    const state: StudioUIState = {
      motion: 'static',
      composition: 'hero',
      productPaletteA: '#c7423a',
    };
    buildPalette(state);

    expect(state.resolvedPalette!.source).toBe('product');
    expect(state.resolvedPalette!.primary).toBe('#c7423a');
    // primary is never null
    expect(state.resolvedPalette!.primary).not.toBeNull();
    expect(state.resolvedPalette!.primary).not.toBe('');
  });
});

describe('Palette Pipeline — Custom source tier', () => {
  it('Custom productPaletteSource uses A/B/C colors but bypasses product priority', () => {
    const state: StudioUIState = {
      motion: 'static',
      composition: 'hero',
      productPaletteSource: 'Custom',
      productPaletteA: '#2a9d8f',
      productPaletteB: '#264653',
    };
    buildPalette(state);

    // Custom sits between brand and neutral — brand wins over custom if brand is set
    expect(state.resolvedPalette!.primary).toBe('#2a9d8f');
  });

  it('Brand palette wins over custom colors', () => {
    const state: StudioUIState = {
      motion: 'static',
      composition: 'hero',
      productPaletteSource: 'Custom',
      productPaletteA: '#2a9d8f',
      brandPalette: { primaryColor: '#e63946' },
    };
    buildPalette(state);

    // Brand beats custom
    expect(state.resolvedPalette!.source).toBe('brand');
    expect(state.resolvedPalette!.primary).toBe('#e63946');
  });
});

describe('Palette Pipeline — [BG_COLOR_USED] log fires', () => {
  let logSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
  });

  it('buildPalette emits [BG_COLOR_USED] with the resolved primary color', () => {
    const state: StudioUIState = {
      motion: 'static',
      composition: 'hero',
      productPaletteA: '#c7423a',
    };
    buildPalette(state);

    const calls = logSpy.mock.calls.map(args => args[0]);
    const bgLog = calls.find(c => typeof c === 'string' && c.startsWith('[BG_COLOR_USED]'));
    expect(bgLog).toBeDefined();
    expect(bgLog).toContain('#c7423a');
  });

  it('buildStudioBackground emits [BG_COLOR_USED] with primary', () => {
    const state = makeHeroState({ productPaletteA: '#c7423a' });

    // Reset spy after makeHeroState (which called buildPalette)
    logSpy.mockClear();

    buildStudioBackground(authority, state);

    const calls = logSpy.mock.calls.map(args => args[0]);
    const bgLog = calls.find(c => typeof c === 'string' && c.startsWith('[BG_COLOR_USED]'));
    expect(bgLog).toBeDefined();
    expect(bgLog).toContain('#c7423a');
  });
});

describe('Palette Pipeline — Gradient uses product palette', () => {
  it('Hero Gradient contains all three product palette hex codes', () => {
    const state = makeHeroState({
      productPaletteA: '#c7423a',
      productPaletteB: '#a92f29',
      productPaletteC: '#f0b1a8',
      photoModeConfig: { heroLandingPage: { backgroundType: 'Gradient' } },
    });

    const bg = buildStudioBackground(authority, state);
    expect(bg!.gradientEnabled).toBe(true);
    expect(bg!.backgroundString).toContain('#c7423a');
    expect(bg!.backgroundString).toContain('#a92f29');
    expect(bg!.backgroundString).toContain('#f0b1a8');

    // Log verification
    expect(bg!.backgroundString).toContain('product palette');
  });
});
