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
  const heroConfig = state.photoModeConfig?.heroLandingPage;
  const gradientStyle = String(heroConfig?.gradientStyle || '').trim();
  const contrastLevel = String(heroConfig?.contrastLevel || '').trim();

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
  const environmentDrivenHero = isHeroLanding && Boolean(environmentMacro) && !legacyColorPopHero;
  const surfaceRule = (() => {
    if (surfaceType === 'Wood') {
      return ' The entire visible ground plane is a premium warm wood surface with subtle natural grain and controlled texture visibility. No pedestal, no separate platform, and no isolated base object under the product.';
    }
    if (surfaceType === 'Stone') {
      return ' The entire visible ground plane is a rigid natural stone surface with continuous mineral texture, cool dense material response, and crisp grounded contact under the product. No pedestal, no separate slab object, no raised platform, no textile weave, no felt, no carpet pile, and no soft fabric interpretation.';
    }
    if (surfaceType === 'Marble') {
      return ' The entire visible ground plane is a polished marble surface with restrained continuous veining and premium reflectance control. No pedestal, no separate platform, and no isolated marble block under the product.';
    }
    return '';
  })();
  const environmentRule = (() => {
    if (!environmentMacro) return '';
    if (environmentMacro === 'Bathroom Vanity' || environmentMacro === 'Bathroom') {
      return ' Scene integrates refined vanity and sink-zone architecture with real countertop continuity, while keeping the product as the dominant foreground subject.';
    }
    if (environmentMacro === 'Kitchen Counter' || environmentMacro === 'Kitchen') {
      return ' Scene integrates clean kitchen countertop realism with believable domestic depth and restrained surrounding cues while keeping the product dominant in the foreground.';
    }
    if (environmentMacro === 'Nature Elements') {
      return ' Scene integrates natural stone, wood, and botanical material cues as part of the actual scene, with the product remaining the dominant foreground hero.';
    }
    if (environmentMacro === 'Stone Surface') {
      return ' Scene integrates a tactile mineral surface family across the visible scene with grounded premium placement realism.';
    }
    if (environmentMacro === 'Luxury Spa') {
      return ' Scene integrates calm spa-like architecture and elevated wellness surface cues while keeping the product as the dominant hero subject.';
    }
    if (environmentMacro === 'Outdoor Pool') {
      return ' Scene integrates authentic poolside architecture, deck surfaces, water adjacency, and sunlit summer atmosphere with the product anchored as the dominant foreground subject.';
    }
    if (environmentMacro === 'Clean Lab') {
      return ' Scene integrates sterile clinical counter realism and precision laboratory spatial cues while preserving conversion-grade product readability.';
    }
    return ` Scene integrates ${environmentMacro.toLowerCase()} as real environmental context with grounded spatial realism, while keeping the product as the dominant foreground hero subject.`;
  })();
  const gradientStyleRule = (() => {
    if (!gradientStyle) {
      return '';
    }
    if (gradientStyle === 'Radial') {
      return ' Use a radial tonal bloom centered behind the product for silhouette lift while keeping the scene photographic and non-CGI.';
    }
    if (gradientStyle === 'Vertical') {
      return ' Use a vertical tonal transition with natural top-to-bottom falloff, avoiding artificial graphic banding.';
    }
    return ' Use a soft diffused tonal transition with natural photographic falloff and no hard gradient banding.';
  })();
  const contrastRule = (() => {
    if (contrastLevel === 'Soft') {
      return ' Keep overall scene contrast soft and controlled, with gentle transitions and restrained shadow density.';
    }
    if (contrastLevel === 'High') {
      return ' Keep overall scene contrast crisp and elevated, with cleaner separation and stronger tonal hierarchy while preserving label readability.';
    }
    return '';
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
    backgroundString = environmentDrivenHero
      ? `Contextual environmental hero composition. Gradient palette derived from ${primary}, ${secondary}, and ${tertiary} shapes the overall scene tonality while preserving a real environment around the product.${gradientStyleRule}${contrastRule} The product remains the dominant foreground subject with crisp readability, but the surrounding environment must be visibly present, spatially coherent, and integrated into the full scene. Controlled background depth, architecture, material context, and environmental activity are allowed when explicitly requested by the selected environment.${surfaceRule}${environmentRule}`
      : `Clean studio hero composition. Gradient derived from product palette blending ${primary}, ${secondary}, and ${tertiary}.${gradientStyleRule}${contrastRule} Soft cinematic depth separation. Subtle atmospheric falloff behind product to enhance silhouette separation. Negative space balanced; copy-safe area reserved for overlays. Product isolated for hero landing page.${surfaceRule}${environmentRule}`;
  } else {
    gradientEnabled = false;
    backgroundString = environmentDrivenHero
      ? `Contextual environmental hero composition. Scene tonality is anchored by dominant background color ${primary}, but the background must resolve as a real environment rather than a seamless studio wall.${contrastRule} The product remains the dominant foreground subject with clean readability, while the surrounding environment, architecture, surfaces, and contextual activity are visibly integrated into the scene when explicitly requested.${surfaceRule}${environmentRule}`
      : `Clean studio hero composition. Seamless background matching dominant product color ${primary}.${contrastRule} Soft tonal falloff behind the product. Subtle vignette for silhouette separation. Negative space balanced; copy-safe area reserved for overlays. Product isolated for hero landing page.${surfaceRule}${environmentRule}`;
  }

  return { backgroundString, colorSource, primaryColor: primary, gradientEnabled };
}
