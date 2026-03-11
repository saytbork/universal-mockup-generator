import type { StudioAuthorityBundle, StudioUIState } from '../types/studioTypes.ts';

export interface StudioBackgroundResolution {
  backgroundString: string;
  /** Mirrors resolvedPalette.source — 'product' | 'brand' | 'custom' | 'neutral'. */
  colorSource: 'product' | 'brand' | 'custom' | 'neutral';
  primaryColor: string;
  gradientEnabled: boolean;
}

/**
 * Deterministic background resolver for V2 engine.
 * Handles Hero Landing Page and Color Pop Hero (legacy compatibility).
 *
 * Single source of truth: state.resolvedPalette (populated by buildPalette earlier
 * in the pipeline). This function does NOT perform any palette fallback logic —
 * that responsibility belongs exclusively to buildPalette.
 *
 * Throws if called before buildPalette has run (resolvedPalette missing).
 */
export function buildStudioBackground(
  _authority: StudioAuthorityBundle,
  state: StudioUIState
): StudioBackgroundResolution | null {
  const photoMode = String(state.photoMode || '').trim();
  const legacyColorPopHero = Boolean(state.photoModeConfig?.heroLandingPage?.legacyColorPopHero);

  const isHeroLanding = photoMode === 'Hero Landing Page';
  const isColorPopHero = photoMode === 'Color Pop Hero';
  if (!isHeroLanding && !isColorPopHero) {
    return null;
  }

  const palette = state.resolvedPalette;
  if (!palette) {
    throw new Error(
      '[buildStudioBackground] Invariant violation: called before palette resolution. ' +
      'buildPalette must run before buildStudioBackground in the pipeline.'
    );
  }

  const primary = palette.primary;
  const secondary = palette.secondary;
  const tertiary = palette.tertiary;
  const colorSource = palette.source;

  // eslint-disable-next-line no-console
  console.log('[V2_BG_RESOLVER]', { primary, secondary, tertiary });
  // eslint-disable-next-line no-console
  console.log(`[BG_COLOR_USED] ${primary}`);

  let backgroundString: string;
  let gradientEnabled = false;

  if (isColorPopHero || (isHeroLanding && legacyColorPopHero)) {
    gradientEnabled = false;
    backgroundString = `Color-pop hero studio composition. Solid dominant background color ${primary} with controlled radial tonal energy using ${secondary}. High-contrast silhouette separation, clean premium advertising framing, no environmental context, single-product focus.`;
    return { backgroundString, colorSource, primaryColor: primary, gradientEnabled };
  }

  // Hero Landing Page — respect backgroundType from config
  const backgroundType = state.photoModeConfig?.heroLandingPage?.backgroundType;
  const wantsGradient =
    backgroundType === 'Gradient' ||
    (!backgroundType && secondary !== '');

  if (wantsGradient && secondary) {
    gradientEnabled = true;
    backgroundString = `Clean studio hero composition. Gradient derived from product palette blending ${primary}, ${secondary}, and ${tertiary}. Soft cinematic depth separation. Subtle atmospheric falloff behind product to enhance silhouette separation. Negative space balanced; copy-safe area reserved for overlays. Product isolated for hero landing page.`;
  } else {
    gradientEnabled = false;
    backgroundString = `Clean studio hero composition. Seamless background matching dominant product color ${primary}. Soft tonal falloff behind the product. Subtle vignette for silhouette separation. Negative space balanced; copy-safe area reserved for overlays. Product isolated for hero landing page.`;
  }

  return { backgroundString, colorSource, primaryColor: primary, gradientEnabled };
}
