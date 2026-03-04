import type { StudioAuthorityBundle, StudioUIState } from '../types/studioTypes.ts';

export interface StudioBackgroundResolution {
  backgroundString: string;
  colorSource: 'label' | 'brand' | 'custom' | 'fallback';
  primaryColor: string;
  gradientEnabled: boolean;
}

/** Accepts #RGB and #RRGGBB only. Repairs missing '#'. Returns '' for malformed values. */
function sanitizeHex(raw: string | undefined): string {
  const s = String(raw || '').trim();
  if (/^#[0-9A-Fa-f]{3}$/.test(s) || /^#[0-9A-Fa-f]{6}$/.test(s)) return s;
  if (/^[0-9A-Fa-f]{3}$/.test(s) || /^[0-9A-Fa-f]{6}$/.test(s)) return `#${s}`;
  return '';
}

/**
 * Normalises any raw paletteSource string to the canonical V2 token.
 * Accepts both V1 HeroLandingPagePaletteSource values and V2 StudioUIState values.
 *
 * V1 type: 'Product label colors' | 'Neutral brand tones' | 'Custom'
 * V2 type: 'Use product label colors' | 'Brand Colors' | 'Custom'
 *
 * 'Neutral brand tones' resolves to 'Custom' (neutral whites provided as productPaletteA/B/C
 * by promptRouter — matches resolveHeroLandingBrandColors() in store.ts).
 */
function normalizeSource(
  raw: string | undefined
): 'label' | 'brand' | 'custom' | null {
  const s = String(raw || '').trim();
  if (
    s === 'Use product label colors' ||
    s === 'Product label colors' ||
    s === 'label'
  ) return 'label';
  if (
    s === 'Brand Colors' ||
    s === 'brand'
  ) return 'brand';
  if (
    s === 'Custom' ||
    s === 'custom' ||
    s === 'Neutral brand tones'   // mapped to Custom+neutral-whites by promptRouter
  ) return 'custom';
  return null;
}

/**
 * Deterministic brand background resolver for V2 engine.
 * Handles Hero Landing Page and Color Pop Hero ONLY.
 * Priority: product label colors → brand system colors → custom → #FFFFFF
 *
 * Do NOT use V1 store or mapSceneToPrompt. This is V2-only.
 */
export function buildStudioBackground(
  _authority: StudioAuthorityBundle,
  state: StudioUIState
): StudioBackgroundResolution | null {
  const photoMode = String(state.photoMode || '').trim();

  if (photoMode !== 'Hero Landing Page' && photoMode !== 'Color Pop Hero') {
    return null;
  }

  const rawSource = state.productPaletteSource;
  const normalizedSource = normalizeSource(rawSource);

  // Prefer the pre-resolved palette from buildPalette (first pipeline stage) if available.
  // This guarantees a single authoritative resolution point regardless of call order.
  const resolvedA = state.resolvedPalette?.primary;
  const resolvedB = state.resolvedPalette?.secondary;
  const resolvedC = state.resolvedPalette?.tertiary;

  const pA = sanitizeHex(resolvedA || state.productPaletteA);
  const pB = sanitizeHex(resolvedB || state.productPaletteB);
  const pC = sanitizeHex(resolvedC || state.productPaletteC);

  const brandPrimary = sanitizeHex(state.brandPalette?.primaryColor);
  const brandSecondary = sanitizeHex(state.brandPalette?.secondaryColor);
  const brandAccent = sanitizeHex(state.brandPalette?.accentColor);

  let colorSource: StudioBackgroundResolution['colorSource'] = 'fallback';
  let primary = '#FFFFFF';
  let secondary = '';
  let tertiary = '';

  if (normalizedSource === 'label') {
    if (pA) {
      // Label colors available — use them directly.
      colorSource = 'label';
      primary = pA;
      secondary = pB || '';
      tertiary = pC || '';
    } else if (brandPrimary) {
      // Label requested but not extracted yet — cascade to brand palette so we never show white.
      colorSource = 'brand';
      primary = brandPrimary;
      secondary = brandSecondary || '';
      tertiary = brandAccent || '';
    } else {
      colorSource = 'fallback';
      primary = '#FFFFFF';
    }
  } else if (normalizedSource === 'brand') {
    if (brandPrimary) {
      colorSource = 'brand';
      primary = brandPrimary;
      secondary = brandSecondary || '';
      tertiary = brandAccent || '';
    } else {
      colorSource = 'fallback';
      primary = '#FFFFFF';
    }
  } else if (normalizedSource === 'custom') {
    if (pA) {
      colorSource = 'custom';
      primary = pA;
      secondary = pB || '';
      tertiary = pC || '';
    } else {
      colorSource = 'fallback';
      primary = '#FFFFFF';
    }
  } else {
    colorSource = 'fallback';
    primary = '#FFFFFF';
  }

  // eslint-disable-next-line no-console
  console.log(
    '[V2_BG_RESOLVER] photoMode=', photoMode,
    '| rawSource=', rawSource,
    '| normalizedSource=', normalizedSource,
    '| colorSource=', colorSource,
    '| pA=', pA || '(empty)', '| pB=', pB || '(empty)', '| pC=', pC || '(empty)',
    '| brandPrimary=', brandPrimary || '(empty)',
    '| resolved=', JSON.stringify({ primary, secondary, tertiary })
  );

  let backgroundString: string;
  let gradientEnabled = false;

  if (photoMode === 'Color Pop Hero') {
    // Always solid, primary only — bold color field with radial energy and silhouette contrast
    gradientEnabled = false;
    backgroundString = `Bold color-field studio background in ${primary}. Radial gradient energy field behind the product with subtle luminosity falloff toward the edges. Strong silhouette contrast between product and background. High-impact advertising style studio lighting. Color derived from brand palette only. Product fully centered and dominant.`;
  } else {
    // Hero Landing Page — respect backgroundType from config
    const backgroundType = state.photoModeConfig?.heroLandingPage?.backgroundType;
    const wantsGradient =
      backgroundType === 'Gradient' ||
      (!backgroundType && secondary !== '');

    if (wantsGradient && secondary) {
      gradientEnabled = true;
      const stops = [primary, secondary, tertiary].filter(Boolean);
      if (stops.length === 3) {
        backgroundString = `Clean studio hero composition. Soft three-color gradient background blending ${stops[0]}, ${stops[1]}, and ${stops[2]}. Background gradient derived from palette colors with cinematic studio depth separation. Subtle atmospheric falloff behind product to enhance silhouette separation. Negative space balanced; copy-safe area reserved for overlays. Product isolated for hero landing page.`;
      } else {
        backgroundString = `Clean studio hero composition. Soft gradient background blending ${stops[0]} and ${stops[1]}. Background gradient derived from palette colors with cinematic studio depth separation. Subtle atmospheric falloff behind product to enhance silhouette separation. Negative space balanced; copy-safe area reserved for overlays. Product isolated for hero landing page.`;
      }
    } else {
      gradientEnabled = false;
      backgroundString = `Clean studio hero composition. Seamless solid background in color ${primary} with cinematic studio depth separation. Subtle atmospheric falloff behind product to enhance silhouette separation. Controlled vignette toward edges emphasizing product presence. Negative space balanced; copy-safe area reserved for overlays. Product isolated for hero landing page.`;
    }
  }

  return { backgroundString, colorSource, primaryColor: primary, gradientEnabled };
}
