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
  });

  it('resolves #ffffff when no palette data is present', () => {
    const state: StudioUIState = { motion: 'static', composition: 'hero' };
    buildPalette(state);
    expect(state.resolvedPalette!.primary).toBe('#ffffff');
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
