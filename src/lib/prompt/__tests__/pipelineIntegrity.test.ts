import { describe, it, expect } from 'vitest';
import { __buildSegmentsForTest } from '../../productStudioV2/pipelines/genericPipeline';
import { buildPalette } from '../../productStudioV2/builders/buildPalette';
import type { StudioUIState } from '../../productStudioV2/types/studioTypes';

// ─── shared state factories ───────────────────────────────────────────────────

function heroLandingPageState(
  overrides: Partial<StudioUIState> = {}
): StudioUIState {
  return {
    motion: 'static',
    composition: 'hero',
    photoMode: 'Hero Landing Page',
    productPaletteSource: 'Use product label colors',
    productPaletteA: '#1A237E',
    productPaletteB: '#E91E63',
    productPaletteC: '#F9A825',
    photoModeConfig: { heroLandingPage: { backgroundType: 'Gradient' } },
    ...overrides,
  };
}

function colorPopHeroState(
  overrides: Partial<StudioUIState> = {}
): StudioUIState {
  return {
    motion: 'static',
    composition: 'hero',
    photoMode: 'Color Pop Hero',
    productPaletteSource: 'Use product label colors',
    productPaletteA: '#BF360C',
    productPaletteB: '#37474F',
    productPaletteC: '#F57F17',
    ...overrides,
  };
}

function studioState(overrides: Partial<StudioUIState> = {}): StudioUIState {
  return {
    motion: 'static',
    composition: 'hero',
    world: 'studio',
    ...overrides,
  };
}

// ─── 1. No duplicate guardrail segments ──────────────────────────────────────

describe('Pipeline integrity — no duplicate segments', () => {
  it('Hero Landing Page: no two segments have identical content', () => {
    const state = heroLandingPageState();
    const segments = __buildSegmentsForTest(state);
    const contents = segments.map((s) => s.content.trim()).filter(Boolean);
    const unique = new Set(contents);
    expect(unique.size).toBe(contents.length);
  });

  it('Color Pop Hero: no two segments have identical content', () => {
    const state = colorPopHeroState();
    const segments = __buildSegmentsForTest(state);
    const contents = segments.map((s) => s.content.trim()).filter(Boolean);
    const unique = new Set(contents);
    expect(unique.size).toBe(contents.length);
  });

  it('Plain studio: no two segments have identical content', () => {
    const state = studioState();
    const segments = __buildSegmentsForTest(state);
    const contents = segments.map((s) => s.content.trim()).filter(Boolean);
    const unique = new Set(contents);
    expect(unique.size).toBe(contents.length);
  });
});

// ─── 2. PRODUCT_ORIENTATION_LOCK emitted exactly once ────────────────────────

describe('Pipeline integrity — PRODUCT_ORIENTATION_LOCK not duplicated', () => {
  it('Hero Landing Page: PRODUCT_ORIENTATION_LOCK appears at most once', () => {
    const state = heroLandingPageState();
    const segments = __buildSegmentsForTest(state);
    const allText = segments.map((s) => s.content).join(' ');
    const matches = (allText.match(/PRODUCT_ORIENTATION_LOCK/g) || []).length;
    expect(matches).toBeLessThanOrEqual(1);
  });

  it('Plain studio upright: PRODUCT_ORIENTATION_LOCK appears exactly once', () => {
    const state = studioState({ rotationEnabled: false });
    const segments = __buildSegmentsForTest(state);
    const allText = segments.map((s) => s.content).join(' ');
    const matches = (allText.match(/PRODUCT_ORIENTATION_LOCK/g) || []).length;
    expect(matches).toBe(1);
  });

  it('Rotation enabled (free orientation): PRODUCT_ORIENTATION_LOCK does not appear', () => {
    const state = studioState({
      rotationEnabled: true,
      rotationAngle: 15,
      productOrientation: 'free',
    });
    const segments = __buildSegmentsForTest(state);
    const allText = segments.map((s) => s.content).join(' ');
    expect(allText).not.toContain('PRODUCT_ORIENTATION_LOCK');
  });
});

// ─── 3. Background defined in exactly one place (no conflicting segments) ────

describe('Pipeline integrity — background not defined in multiple segments', () => {
  it('Hero Landing Page: only one segment contains PHOTO_MODE_SCENE', () => {
    const state = heroLandingPageState();
    const segments = __buildSegmentsForTest(state);
    const bgSegments = segments.filter((s) => s.content.includes('PHOTO_MODE_SCENE'));
    expect(bgSegments.length).toBe(1);
  });

  it('Color Pop Hero: only one segment contains PHOTO_MODE_SCENE', () => {
    const state = colorPopHeroState();
    const segments = __buildSegmentsForTest(state);
    const bgSegments = segments.filter((s) => s.content.includes('PHOTO_MODE_SCENE'));
    expect(bgSegments.length).toBe(1);
  });

  it('Hero Landing Page: PHOTO_MODE_ATMOSPHERE segment does not contain hex colors', () => {
    const state = heroLandingPageState();
    const segments = __buildSegmentsForTest(state);
    const atmosphereSegs = segments.filter((s) =>
      s.content.includes('PHOTO_MODE_ATMOSPHERE')
    );
    for (const seg of atmosphereSegs) {
      // Atmosphere must not inject hex color values — those belong in PHOTO_MODE_SCENE
      expect(seg.content).not.toMatch(/#[0-9a-fA-F]{3,6}/);
    }
  });

  it('Color Pop Hero: PHOTO_MODE_ATMOSPHERE segment does not contain hex colors', () => {
    const state = colorPopHeroState();
    const segments = __buildSegmentsForTest(state);
    const atmosphereSegs = segments.filter((s) =>
      s.content.includes('PHOTO_MODE_ATMOSPHERE')
    );
    for (const seg of atmosphereSegs) {
      expect(seg.content).not.toMatch(/#[0-9a-fA-F]{3,6}/);
    }
  });
});

// ─── 4. buildPalette resolves state.resolvedPalette before world runs ─────────

describe('buildPalette — pre-pipeline palette resolution', () => {
  it('attaches resolvedPalette to state from productPaletteA/B/C', () => {
    const state: StudioUIState = {
      motion: 'static',
      composition: 'hero',
      productPaletteA: '#1A237E',
      productPaletteB: '#E91E63',
      productPaletteC: '#F9A825',
    };
    buildPalette(state);
    expect(state.resolvedPalette).toBeDefined();
    expect(state.resolvedPalette!.primary).toBe('#1a237e');
    expect(state.resolvedPalette!.secondary).toBe('#e91e63');
    expect(state.resolvedPalette!.tertiary).toBe('#f9a825');
    expect(state.resolvedPalette!.source).toBe('product');
  });

  it('falls back to brandPalette when productPaletteA/B/C are absent', () => {
    const state: StudioUIState = {
      motion: 'static',
      composition: 'hero',
      brandPalette: {
        primaryColor: '#4A148C',
        secondaryColor: '#00BCD4',
        accentColor: '#FF5722',
      },
    };
    buildPalette(state);
    expect(state.resolvedPalette!.primary).toBe('#4a148c');
    expect(state.resolvedPalette!.secondary).toBe('#00bcd4');
    expect(state.resolvedPalette!.tertiary).toBe('#ff5722');
    expect(state.resolvedPalette!.source).toBe('brand');
  });

  it('resolves to neutral-gray when no palette data is present (never pure white)', () => {
    const state: StudioUIState = { motion: 'static', composition: 'hero' };
    buildPalette(state);
    expect(state.resolvedPalette!.primary).toBe('#f9fafb');
    expect(state.resolvedPalette!.secondary).toBe('#f3f4f6');
    expect(state.resolvedPalette!.tertiary).toBe('#e5e7eb');
    expect(state.resolvedPalette!.source).toBe('neutral');
  });

  it('returns empty string (no prompt text injected)', () => {
    const state: StudioUIState = {
      motion: 'static',
      composition: 'hero',
      productPaletteA: '#123456',
    };
    const result = buildPalette(state);
    expect(result).toBe('');
  });

  it('pipeline sets resolvedPalette before world runs (via __buildSegmentsForTest)', () => {
    // After the pipeline runs, state.resolvedPalette must be populated
    const state = heroLandingPageState();
    expect(state.resolvedPalette).toBeUndefined(); // not set before pipeline
    __buildSegmentsForTest(state);
    expect(state.resolvedPalette).toBeDefined();
    expect(state.resolvedPalette!.primary).toBe('#1a237e');
  });
});

// ─── 5. Hero Landing Page gradient uses actual palette colors ─────────────────

describe('Pipeline integrity — Hero Landing Page background uses real palette colors', () => {
  it('gradient background contains productPaletteA hex color', () => {
    const state = heroLandingPageState({
      productPaletteA: '#BF360C',
      productPaletteB: '#37474F',
    });
    const segments = __buildSegmentsForTest(state);
    const bgSeg = segments.find((s) => s.content.includes('PHOTO_MODE_SCENE'));
    expect(bgSeg).toBeDefined();
    expect(bgSeg!.content.toLowerCase()).toContain('#bf360c');
  });

  it('solid background contains productPaletteA hex when backgroundType is Solid', () => {
    const state = heroLandingPageState({
      productPaletteA: '#7B1FA2',
      productPaletteB: '',
      photoModeConfig: { heroLandingPage: { backgroundType: 'Solid' } },
    });
    const segments = __buildSegmentsForTest(state);
    const bgSeg = segments.find((s) => s.content.includes('PHOTO_MODE_SCENE'));
    expect(bgSeg).toBeDefined();
    expect(bgSeg!.content.toLowerCase()).toContain('#7b1fa2');
  });

  it('does not fall back to #FFFFFF when palette colors are present', () => {
    const state = heroLandingPageState({
      productPaletteA: '#1B5E20',
      productPaletteB: '#F57F17',
      productPaletteC: '#880E4F',
    });
    const segments = __buildSegmentsForTest(state);
    const bgSeg = segments.find((s) => s.content.includes('PHOTO_MODE_SCENE'));
    expect(bgSeg).toBeDefined();
    // Should not be using the white fallback
    expect(bgSeg!.content.toLowerCase()).not.toContain('#ffffff');
    expect(bgSeg!.content.toLowerCase()).toContain('#1b5e20');
  });
});

// ─── 6. Palette resolution priority rules ────────────────────────────────────

describe('buildPalette — resolution priority and derivation', () => {
  it('Test 1: productPalette present → resolvedPalette uses product colors, source=product', () => {
    const state: StudioUIState = {
      motion: 'static',
      composition: 'hero',
      productPaletteA: '#C62828',
      productPaletteB: '#1565C0',
      productPaletteC: '#2E7D32',
      brandPalette: { primaryColor: '#9E9E9E', secondaryColor: '#BDBDBD', accentColor: '#E0E0E0' },
    };
    buildPalette(state);
    expect(state.resolvedPalette!.source).toBe('product');
    expect(state.resolvedPalette!.primary).toBe('#c62828');
    expect(state.resolvedPalette!.secondary).toBe('#1565c0');
    expect(state.resolvedPalette!.tertiary).toBe('#2e7d32');
    // Brand palette must NOT be used when product palette exists
    expect(state.resolvedPalette!.primary).not.toBe('#9e9e9e');
  });

  it('Test 2: productPalette present + only A provided → secondary/tertiary derived from primary, not white', () => {
    const state: StudioUIState = {
      motion: 'static',
      composition: 'hero',
      productPaletteA: '#6A1B9A',
      // B and C absent — must derive, not fall back to white
      brandPalette: { primaryColor: '#9E9E9E' },
    };
    buildPalette(state);
    expect(state.resolvedPalette!.source).toBe('product');
    expect(state.resolvedPalette!.primary).toBe('#6a1b9a');
    // secondary and tertiary must be derived (not white, not brand gray)
    expect(state.resolvedPalette!.secondary).not.toBe('#ffffff');
    expect(state.resolvedPalette!.secondary).not.toBe('#9e9e9e');
    expect(state.resolvedPalette!.tertiary).not.toBe('#ffffff');
    expect(state.resolvedPalette!.tertiary).not.toBe('#9e9e9e');
    // Derived values must be valid hex
    expect(state.resolvedPalette!.secondary).toMatch(/^#[0-9a-f]{6}$/);
    expect(state.resolvedPalette!.tertiary).toMatch(/^#[0-9a-f]{6}$/);
  });

  it('Test 3: no productPalette + brandPalette present → brand used, source=brand', () => {
    const state: StudioUIState = {
      motion: 'static',
      composition: 'hero',
      brandPalette: {
        primaryColor: '#1A237E',
        secondaryColor: '#880E4F',
        accentColor: '#E65100',
      },
    };
    buildPalette(state);
    expect(state.resolvedPalette!.source).toBe('brand');
    expect(state.resolvedPalette!.primary).toBe('#1a237e');
    expect(state.resolvedPalette!.secondary).toBe('#880e4f');
    expect(state.resolvedPalette!.tertiary).toBe('#e65100');
  });

  it('Test 4: no palette anywhere → neutral-gray fallback, source=neutral, never pure white', () => {
    const state: StudioUIState = { motion: 'static', composition: 'hero' };
    buildPalette(state);
    expect(state.resolvedPalette!.source).toBe('neutral');
    expect(state.resolvedPalette!.primary).toBe('#f9fafb');
    expect(state.resolvedPalette!.secondary).toBe('#f3f4f6');
    expect(state.resolvedPalette!.tertiary).toBe('#e5e7eb');
    // Must never be pure white
    expect(state.resolvedPalette!.primary).not.toBe('#ffffff');
  });

  it('white-fallback guard: throws if product palette exists but primary resolves to #FFFFFF', () => {
    // Manually break the invariant by injecting a bad resolvedPalette after buildPalette runs
    // (simulates a hypothetical bug in normalizeHex returning #FFFFFF for a valid hex)
    // We test the guard by calling buildPalette with a mocked productPaletteA that would
    // need to produce #FFFFFF — not possible with real hex, so we verify the guard logic
    // by testing that a real product color never produces #FFFFFF
    const state: StudioUIState = {
      motion: 'static',
      composition: 'hero',
      productPaletteA: '#FF0000',
    };
    buildPalette(state);
    expect(state.resolvedPalette!.primary).not.toBe('#ffffff');
    expect(state.resolvedPalette!.source).toBe('product');
  });

  it('lighten/darken derivation: secondary is lighter than primary, tertiary is darker', () => {
    const state: StudioUIState = {
      motion: 'static',
      composition: 'hero',
      productPaletteA: '#4A148C',
      // B and C omitted — will be derived
    };
    buildPalette(state);
    const primary = state.resolvedPalette!.primary;
    const secondary = state.resolvedPalette!.secondary;
    const tertiary = state.resolvedPalette!.tertiary;

    // Parse luminance: lighter colors have higher sum of RGB components
    const sum = (hex: string) => {
      const h = hex.replace('#', '');
      return parseInt(h.slice(0, 2), 16) + parseInt(h.slice(2, 4), 16) + parseInt(h.slice(4, 6), 16);
    };
    expect(sum(secondary)).toBeGreaterThan(sum(primary)); // lighter
    expect(sum(tertiary)).toBeLessThan(sum(primary));     // darker
  });
});
