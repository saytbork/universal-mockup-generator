import { describe, it, expect } from 'vitest';
import { toStudioV2State } from '../../productStudio/promptRouter';
import { buildPalette } from '../../productStudioV2/builders/buildPalette';
import { buildStudioBackground } from '../../productStudioV2/builders/buildStudioBackground';
import { buildEnvironmentStyle } from '../../productStudioV2/builders/buildEnvironmentStyle';
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

  it('Hero Landing Page: custom palette source survives to V2 and bypasses product palette', () => {
    const state = baseState({
      photoMode: 'Hero Landing Page',
      backgroundColor: '#112233',
      gradientStart: '#112233',
      gradientEnd: '#445566',
      photoModeConfig: {
        heroLandingPage: {
          backgroundType: 'Gradient',
          paletteSource: 'Custom',
        },
      },
    });
    const v2State = toStudioV2State(state);

    expect(v2State.productPaletteSource).toBe('Custom');
    expect(v2State.productPaletteA).toBe('#112233');
    expect(v2State.productPaletteB).toBe('#445566');

    buildPalette(v2State);
    expect(v2State.resolvedPalette?.source).toBe('custom');
    expect(v2State.resolvedPalette?.primary).toBe('#112233');

    const authority = resolveStudioAuthority(v2State);
    const result = buildStudioBackground(authority, v2State);
    expect(result!.colorSource).toBe('custom');
    expect(result!.primaryColor).toBe('#112233');
    expect(result!.backgroundString).toContain('#112233');
    expect(result!.backgroundString).not.toContain('#c0392b');
  });

  it('Hero Landing Page: custom solid background ignores stale gradient colors', () => {
    const state = baseState({
      photoMode: 'Hero Landing Page',
      backgroundColor: '#FFFFFF',
      gradientStart: '#383838',
      gradientEnd: '#292a2a',
      gradientMid: '#303030',
      photoModeConfig: {
        heroLandingPage: {
          backgroundType: 'Solid',
          paletteSource: 'Custom',
        },
      },
    });
    const v2State = toStudioV2State(state);

    expect(v2State.productPaletteSource).toBe('Custom');
    expect(v2State.productPaletteA).toBe('#FFFFFF');
    expect(v2State.productPaletteB).toBeUndefined();
    expect(v2State.productPaletteC).toBeUndefined();

    buildPalette(v2State);
    expect(v2State.resolvedPalette?.source).toBe('custom');
    expect(v2State.resolvedPalette?.primary).toBe('#ffffff');

    const authority = resolveStudioAuthority(v2State);
    const result = buildStudioBackground(authority, v2State);
    expect(result!.colorSource).toBe('custom');
    expect(result!.primaryColor).toBe('#ffffff');
    expect(result!.backgroundString).toContain('#ffffff');
    expect(result!.backgroundString).not.toContain('#383838');
  });

  it('Hero Landing Page: brand palette source forwards brandPalette to V2', () => {
    const state = baseState({
      photoMode: 'Hero Landing Page',
      products: [],
      activeProductId: null,
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
          paletteSource: 'Neutral brand tones',
        },
      },
    });
    const v2State = toStudioV2State(state);

    expect(v2State.productPaletteSource).toBe('Brand Colors');
    expect(v2State.brandPalette?.primaryColor).toBe('#7B1FA2');
    expect(v2State.brandPalette?.secondaryColor).toBe('#4CAF50');

    buildPalette(v2State);
    expect(v2State.resolvedPalette?.source).toBe('brand');
    expect(v2State.resolvedPalette?.primary).toBe('#7b1fa2');

    const authority = resolveStudioAuthority(v2State);
    const result = buildStudioBackground(authority, v2State);
    expect(result!.colorSource).toBe('brand');
    expect(result!.primaryColor).toBe('#7b1fa2');
    expect(result!.backgroundString).toContain('#7b1fa2');
  });

  it('Hero Landing Page: surfaceType forwards to V2 background scene', () => {
    const state = baseState({
      photoMode: 'Hero Landing Page',
      photoModeConfig: {
        heroLandingPage: {
          backgroundType: 'Solid',
          paletteSource: 'Product label colors',
          surfaceType: 'Marble',
        },
      },
    });
    const v2State = toStudioV2State(state);

    expect(v2State.photoModeConfig?.heroLandingPage?.surfaceType).toBe('Marble');

    buildPalette(v2State);
    const authority = resolveStudioAuthority(v2State);
    const result = buildStudioBackground(authority, v2State);
    expect(result!.backgroundString).toContain('polished marble surface');
  });

  it('Hero Landing Page: custom environment and micro-place survive to V2 context', () => {
    const state = baseState({
      photoMode: 'Hero Landing Page',
      environmentContext: { macro: 'custom', micro: 'custom' },
      customEnvironmentText: 'modern kitchen countertop',
      customMicroPlaceText: 'travertine slab beside sink',
    });
    const v2State = toStudioV2State(state);

    expect(v2State.environmentPreset).toBe('modern kitchen countertop::travertine slab beside sink');

    const envBlock = buildEnvironmentStyle(v2State);

    expect(envBlock).toContain('ENVIRONMENT_STYLE_NAME: modern-kitchen-countertop.');
    expect(envBlock).toContain('modern kitchen countertop');
    expect(envBlock).toContain('travertine slab beside sink');
  });

  it('Hero Landing Page: environmentPreset also modifies PHOTO_MODE_SCENE', () => {
    const state = baseState({
      photoMode: 'Hero Landing Page',
      environmentContext: { macro: 'Nature Elements', micro: null },
    });
    const v2State = toStudioV2State(state);

    buildPalette(v2State);
    const authority = resolveStudioAuthority(v2State);
    const result = buildStudioBackground(authority, v2State);

    expect(result!.backgroundString).toContain('organic material realism');
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
