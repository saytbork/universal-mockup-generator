import { describe, it, expect } from 'vitest';
import { toStudioV2State } from '../../productStudio/promptRouter';
import { buildPalette } from '../../productStudioV2/builders/buildPalette';
import { buildStudioBackground } from '../../productStudioV2/builders/buildStudioBackground';
import { resolveStudioAuthority } from '../../productStudioV2/authority/studioAuthorityResolver';

/**
 * Integration: confirms palette fields survive toStudioV2State() → buildPalette → buildStudioBackground.
 * Regression guard for: background resolving to white when product palette exists.
 * New contract: buildPalette MUST run before buildStudioBackground; resolvedPalette is the only
 * source of truth for background colors.
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

describe('toStudioV2State palette propagation → buildPalette → buildStudioBackground', () => {
  it('Hero Landing Page: product label colors reach background, colorSource=product', () => {
    const state = baseState({ photoMode: 'Hero Landing Page' });
    const v2State = toStudioV2State(state);

    expect(v2State.productPaletteA).toBe('#C0392B');
    expect(v2State.productPaletteB).toBe('#2980B9');
    expect(v2State.productPaletteC).toBe('#F1C40F');

    buildPalette(v2State);
    expect(v2State.resolvedPalette?.source).toBe('product');
    expect(v2State.resolvedPalette?.primary).toBe('#c0392b');

    const authority = resolveStudioAuthority(v2State);
    const result = buildStudioBackground(authority, v2State);
    expect(result).not.toBeNull();
    expect(result!.colorSource).toBe('product');
    expect(result!.backgroundString).toContain('#c0392b');
    expect(result!.primaryColor).toBe('#c0392b');
    expect(result!.backgroundString).not.toContain('#FFFFFF');
  });

  it('REGRESSION: dominant missing but secondary/accent present → promotes product color instead of neutral fallback', () => {
    const state = baseState({
      photoMode: 'Hero Landing Page',
      products: [
        {
          id: 'p1',
          name: 'Test Product',
          palette: {
            dominant: '',
            secondary: '#C7423A',
            accent: '#A92F29',
          },
        },
      ],
    });
    const v2State = toStudioV2State(state);

    // Bridge logic promotes any valid extracted color into A.
    expect(v2State.productPaletteA).toBe('#C7423A');
    buildPalette(v2State);
    expect(v2State.resolvedPalette?.source).toBe('product');
    expect(v2State.resolvedPalette?.primary).toBe('#c7423a');
  });

  it('Hero Landing Page: gradient mode produces gradientEnabled=true with product colors', () => {
    const state = baseState({ photoMode: 'Hero Landing Page' });
    const v2State = toStudioV2State(state);
    buildPalette(v2State);
    const authority = resolveStudioAuthority(v2State);
    const result = buildStudioBackground(authority, v2State);
    expect(result!.gradientEnabled).toBe(true);
    expect(result!.backgroundString).toContain('#c0392b');
    expect(result!.backgroundString).toContain('#2980b9');
    expect(result!.backgroundString).not.toContain('#FFFFFF');
  });

  it('Color Pop Hero: solid (no gradient), primary as background, secondary for radial energy', () => {
    const state = baseState({
      photoMode: 'Color Pop Hero',
      photoModeConfig: {
        heroLandingPage: { backgroundType: 'Solid', paletteSource: 'Product label colors' },
      },
    });
    const v2State = toStudioV2State(state);
    buildPalette(v2State);
    const authority = resolveStudioAuthority(v2State);
    const result = buildStudioBackground(authority, v2State);
    expect(result!.colorSource).toBe('product');
    expect(result!.gradientEnabled).toBe(false);
    expect(result!.primaryColor).toBe('#c0392b');
    // Primary must appear in background string
    expect(result!.backgroundString).toContain('#c0392b');
    // Secondary appears for radial energy (new behavior per Part 4 spec)
    expect(result!.backgroundString).toContain('#2980b9');
    expect(result!.backgroundString).not.toContain('#FFFFFF');
  });

  it('Hero Landing Page: no product palette + no brand forwarded by promptRouter → neutral fallback', () => {
    // toStudioV2State does NOT forward brandPalette to v2State.
    // When products is empty and no label palette exists, buildPalette falls to neutral-gray.
    const state = baseState({
      photoMode: 'Hero Landing Page',
      products: [],
      activeProductId: null,
      photoModeConfig: {
        heroLandingPage: { backgroundType: 'Gradient', paletteSource: 'Brand Colors' },
      },
    });
    const v2State = toStudioV2State(state);
    expect(v2State.productPaletteA).toBeUndefined();
    buildPalette(v2State);
    // No product palette, no brandPalette forwarded → neutral
    expect(v2State.resolvedPalette?.source).toBe('neutral');
    expect(v2State.resolvedPalette?.primary).toBe('#f9fafb');
    const authority = resolveStudioAuthority(v2State);
    const result = buildStudioBackground(authority, v2State);
    expect(result!.colorSource).toBe('neutral');
    expect(result!.primaryColor).toBe('#f9fafb');
    expect(result!.backgroundString).not.toContain('#FFFFFF');
  });

  it('REGRESSION: no palette in state → neutral-gray fallback, NOT #FFFFFF, NOT a crash', () => {
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
    buildPalette(v2State);
    const authority = resolveStudioAuthority(v2State);
    const result = buildStudioBackground(authority, v2State);
    expect(result!.colorSource).toBe('neutral');
    expect(result!.primaryColor).toBe('#f9fafb');
    expect(result!.backgroundString).not.toContain('#FFFFFF');
  });
});
