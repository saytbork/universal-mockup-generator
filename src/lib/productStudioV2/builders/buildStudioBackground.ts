import type { StudioAuthorityBundle, StudioUIState } from '../types/studioTypes.ts';

export interface StudioBackgroundResolution {
  backgroundString: string;
  /** Mirrors resolvedPalette.source — 'product' | 'brand' | 'neutral'. */
  colorSource: 'product' | 'brand' | 'neutral';
  primaryColor: string;
  gradientEnabled: boolean;
}

/**
 * Deterministic background resolver for V2 engine.
 * Handles Hero Landing Page and Color Pop Hero ONLY.
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

  if (photoMode !== 'Hero Landing Page' && photoMode !== 'Color Pop Hero') {
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

  let backgroundString: string;
  let gradientEnabled = false;

  if (photoMode === 'Color Pop Hero') {
    // Always solid, primary only — bold color field with radial energy and silhouette contrast
    gradientEnabled = false;
    backgroundString = `Bold color-field studio background in ${primary}. Radial gradient energy field behind the product with subtle luminosity falloff toward the edges. Strong silhouette contrast between product and background. High-impact advertising style studio lighting. Product fully centered and dominant.`;
  } else {
    // Hero Landing Page — respect backgroundType from config
    const backgroundType = state.photoModeConfig?.heroLandingPage?.backgroundType;
    const wantsGradient =
      backgroundType === 'Gradient' ||
      (!backgroundType && secondary !== '');

    if (wantsGradient && secondary) {
      gradientEnabled = true;
      backgroundString = `Clean studio hero composition. Soft three-color gradient background blending ${primary}, ${secondary}, and ${tertiary}. Background gradient derived from palette colors with cinematic studio depth separation. Subtle atmospheric falloff behind product to enhance silhouette separation. Negative space balanced; copy-safe area reserved for overlays. Product isolated for hero landing page.`;
    } else {
      gradientEnabled = false;
      backgroundString = `Clean studio hero composition. Seamless solid background in color ${primary} with cinematic studio depth separation. Subtle atmospheric falloff behind product to enhance silhouette separation. Controlled vignette toward edges emphasizing product presence. Negative space balanced; copy-safe area reserved for overlays. Product isolated for hero landing page.`;
    }
  }

  return { backgroundString, colorSource, primaryColor: primary, gradientEnabled };
}

