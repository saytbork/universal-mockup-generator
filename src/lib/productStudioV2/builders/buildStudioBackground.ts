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
  const surfaceType = String(
    state.physicalSurfaceType || state.photoModeConfig?.heroLandingPage?.surfaceType || 'None'
  ).trim();
  const rawEnvironment = String(
    state.environmentPreset || state.environment || state.environmentMode || state.contextPresetValue || ''
  ).trim();
  const environmentMacro = rawEnvironment.split('::')[0]?.trim() || '';
  const surfaceRule = (() => {
    if (surfaceType === 'Wood') {
      return ' Product rests on a premium warm wood tabletop with subtle natural grain, controlled texture visibility, and clean contact shadow.';
    }
    if (surfaceType === 'Stone') {
      return ' Product rests on a refined natural stone surface with tactile mineral texture, grounded luxury, and crisp base contact.';
    }
    if (surfaceType === 'Marble') {
      return ' Product rests on a polished marble surface with restrained veining, premium reflectance control, and grounded base realism.';
    }
    return '';
  })();
  const environmentRule = (() => {
    if (!environmentMacro) return '';
    if (environmentMacro === 'Bathroom Vanity' || environmentMacro === 'Bathroom') {
      return ' Scene integrates refined vanity/countertop cues with premium bathroom surface realism while keeping the product isolated and dominant.';
    }
    if (environmentMacro === 'Kitchen Counter' || environmentMacro === 'Kitchen') {
      return ' Scene integrates clean countertop realism with restrained kitchen-adjacent spatial cues while preserving a premium product-first hero setup.';
    }
    if (environmentMacro === 'Nature Elements') {
      return ' Scene integrates natural stone, wood, and botanical surface cues with grounded organic material realism while preserving controlled hero isolation.';
    }
    if (environmentMacro === 'Stone Surface') {
      return ' Scene integrates a tactile mineral surface family with editorial stone realism and grounded premium placement cues.';
    }
    if (environmentMacro === 'Luxury Spa') {
      return ' Scene integrates calm spa-like architectural surfaces and elevated wellness material cues while maintaining strict product-first discipline.';
    }
    if (environmentMacro === 'Outdoor Pool') {
      return ' Scene integrates clean resort-like poolside surface cues and sunlit premium summer atmosphere while keeping the hero product sharply isolated.';
    }
    if (environmentMacro === 'Clean Lab') {
      return ' Scene integrates sterile clinical counter realism and precision laboratory surface cues while preserving clean conversion-focused hero readability.';
    }
    return ` Scene integrates ${environmentMacro.toLowerCase()} environmental cues with grounded surface realism while preserving strict hero isolation and product dominance.`;
  })();

  if (isColorPopHero || (isHeroLanding && legacyColorPopHero)) {
    gradientEnabled = false;
    backgroundString = `Color-pop hero studio composition. Solid dominant background color ${primary} with controlled radial tonal energy using ${secondary}. High-contrast silhouette separation, clean premium advertising framing, no environmental context, single-product focus.${surfaceRule}${environmentRule}`;
    return { backgroundString, colorSource, primaryColor: primary, gradientEnabled };
  }

  // Hero Landing Page — respect backgroundType from config
  const backgroundType = state.photoModeConfig?.heroLandingPage?.backgroundType;
  const wantsGradient =
    backgroundType === 'Gradient' ||
    (!backgroundType && secondary !== '');

  if (wantsGradient && secondary) {
    gradientEnabled = true;
    backgroundString = `Clean studio hero composition. Gradient derived from product palette blending ${primary}, ${secondary}, and ${tertiary}. Soft cinematic depth separation. Subtle atmospheric falloff behind product to enhance silhouette separation. Negative space balanced; copy-safe area reserved for overlays. Product isolated for hero landing page.${surfaceRule}${environmentRule}`;
  } else {
    gradientEnabled = false;
    backgroundString = `Clean studio hero composition. Seamless background matching dominant product color ${primary}. Soft tonal falloff behind the product. Subtle vignette for silhouette separation. Negative space balanced; copy-safe area reserved for overlays. Product isolated for hero landing page.${surfaceRule}${environmentRule}`;
  }

  return { backgroundString, colorSource, primaryColor: primary, gradientEnabled };
}
