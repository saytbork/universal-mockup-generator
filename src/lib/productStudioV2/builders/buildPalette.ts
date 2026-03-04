import type { StudioUIState } from '../types/studioTypes.ts';

const HEX_RE = /^#[0-9a-f]{3,8}$/i;

function isValidHex(v: unknown): v is string {
  return typeof v === 'string' && HEX_RE.test(v.trim());
}

function normalize(v: unknown): string {
  return isValidHex(v) ? (v as string).trim().toLowerCase() : '';
}

/**
 * buildPalette — resolves the canonical 3-color palette used by the pipeline.
 *
 * Resolution priority:
 *   1. productPaletteA/B/C   (product label extraction or manual custom input)
 *   2. brandPalette.primaryColor / secondaryColor / accentColor
 *   3. '#ffffff' fallback for any slot that cannot be resolved
 *
 * Side-effect: attaches `state.resolvedPalette` so all downstream builders
 * (buildStudioBackground, buildWorld) can consume a single authoritative value
 * instead of re-deriving independently.
 *
 * Returns '' — this is a side-effect-only stage with no prompt text.
 */
export function buildPalette(state: StudioUIState): string {
  const a = normalize(state.productPaletteA);
  const b = normalize(state.productPaletteB);
  const c = normalize(state.productPaletteC);

  const bpA = normalize(state.brandPalette?.primaryColor);
  const bpB = normalize(state.brandPalette?.secondaryColor);
  const bpC = normalize(state.brandPalette?.accentColor);

  const primary   = a   || bpA || '#ffffff';
  const secondary = b   || bpB || primary;
  const tertiary  = c   || bpC || secondary;

  // Attach to state so downstream builders have a single authoritative source.
  (state as StudioUIState).resolvedPalette = { primary, secondary, tertiary };

  return '';
}
