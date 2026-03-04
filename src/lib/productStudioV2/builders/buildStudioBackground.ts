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

  const source = state.productPaletteSource;
  const pA = sanitizeHex(state.productPaletteA);
  const pB = sanitizeHex(state.productPaletteB);
  const pC = sanitizeHex(state.productPaletteC);

  const brandPrimary = sanitizeHex(state.brandPalette?.primaryColor);
  const brandSecondary = sanitizeHex(state.brandPalette?.secondaryColor);
  const brandAccent = sanitizeHex(state.brandPalette?.accentColor);

  let colorSource: StudioBackgroundResolution['colorSource'] = 'fallback';
  let primary = '#FFFFFF';
  let secondary = '';
  let tertiary = '';

  if (source === 'Use product label colors' && pA) {
    colorSource = 'label';
    primary = pA;
    secondary = pB || '';
    tertiary = pC || '';
  } else if (source === 'Brand Colors' && brandPrimary) {
    colorSource = 'brand';
    primary = brandPrimary;
    secondary = brandSecondary || '';
    tertiary = brandAccent || '';
  } else if (source === 'Custom' && pA) {
    colorSource = 'custom';
    primary = pA;
    secondary = pB || '';
    tertiary = pC || '';
  } else {
    colorSource = 'fallback';
    primary = '#FFFFFF';
  }

  let backgroundString: string;
  let gradientEnabled = false;

  if (photoMode === 'Color Pop Hero') {
    // Always solid, primary only
    gradientEnabled = false;
    backgroundString = `Vivid solid color-field studio background in ${primary}. High-contrast product silhouette against the brand color. Bold, clean, product fully centered. No random palette guessing. Color derived from brand palette only.`;
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
        backgroundString = `Clean studio hero composition. Soft three-color gradient background blending ${stops[0]}, ${stops[1]}, and ${stops[2]}. No environment, no props, no setting. Subtle studio gradient only. Negative space balanced; copy-safe area reserved for overlays. Product isolated for hero landing page.`;
      } else {
        backgroundString = `Clean studio hero composition. Soft gradient background blending ${stops[0]} and ${stops[1]}. No environment, no props, no setting. Subtle studio gradient only. Negative space balanced; copy-safe area reserved for overlays. Product isolated for hero landing page.`;
      }
    } else {
      gradientEnabled = false;
      backgroundString = `Clean studio hero composition. Seamless solid background in color ${primary}. No environment, no props, no setting. Flat studio background with subtle depth only. Negative space balanced; copy-safe area reserved for overlays. Product isolated for hero landing page.`;
    }
  }

  // eslint-disable-next-line no-console
  console.log('[V2_BG_RESOLVER] photoMode=', photoMode, '| colorSource=', colorSource, '| resolved=', JSON.stringify({ primary, secondary, tertiary, gradientEnabled, backgroundString }));

  return { backgroundString, colorSource, primaryColor: primary, gradientEnabled };
}
