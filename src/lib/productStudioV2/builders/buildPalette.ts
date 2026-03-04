import type { StudioUIState } from '../types/studioTypes.ts';

const HEX_RE = /^#[0-9a-f]{3,8}$/i;

function isValidHex(v: unknown): v is string {
  return typeof v === 'string' && HEX_RE.test(v.trim());
}

function normalizeHex(v: unknown): string {
  return isValidHex(v) ? (v as string).trim().toLowerCase() : '';
}

/**
 * Parse a normalized 6-char hex string (#rrggbb) into [r, g, b] 0–255.
 * Returns null for malformed input.
 */
function parseHex(hex: string): [number, number, number] | null {
  const h = hex.replace('#', '');
  if (h.length !== 6) return null;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
  return [r, g, b];
}

function toHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map(n => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0')).join('')}`;
}

/**
 * Lighten a hex color by mixing it toward white by `amount` (0–100).
 * amount = 12 → 12% closer to #FFFFFF.
 */
function lighten(hex: string, amount: number): string {
  const rgb = parseHex(hex);
  if (!rgb) return hex;
  const t = amount / 100;
  return toHex(
    rgb[0] + (255 - rgb[0]) * t,
    rgb[1] + (255 - rgb[1]) * t,
    rgb[2] + (255 - rgb[2]) * t,
  );
}

/**
 * Darken a hex color by mixing it toward black by `amount` (0–100).
 * amount = 12 → 12% closer to #000000.
 */
function darken(hex: string, amount: number): string {
  const rgb = parseHex(hex);
  if (!rgb) return hex;
  const t = amount / 100;
  return toHex(
    rgb[0] * (1 - t),
    rgb[1] * (1 - t),
    rgb[2] * (1 - t),
  );
}

/**
 * buildPalette — resolves the canonical 3-color palette used by the pipeline.
 *
 * Priority order (product is the visual source of truth):
 *
 *   1. productPaletteA/B/C  (product label extraction or manual custom input)
 *      Missing secondary/tertiary slots are derived from primary via lighten/darken
 *      so the gradient always feels visually cohesive with the product.
 *
 *   2. brandPalette.primaryColor / secondaryColor / accentColor
 *      Used only when NO product palette exists.
 *
 *   3. Neutral light-gray fallback (#F9FAFB / #F3F4F6 / #E5E7EB)
 *      Never white — neutral-gray reads better on hero canvases.
 *
 * Design invariant:
 *   If productPalette exists, resolvedPalette.primary MUST NOT be a pure-white fallback.
 *   A guard throws an error if this invariant is violated.
 *
 * Side-effect:
 *   Writes state.resolvedPalette = { primary, secondary, tertiary, source }
 *   All downstream builders must read ONLY state.resolvedPalette.
 *
 * Returns '' — this is a side-effect-only stage with no prompt text.
 */
export function buildPalette(state: StudioUIState): string {
  const pA = normalizeHex(state.productPaletteA);
  const pB = normalizeHex(state.productPaletteB);
  const pC = normalizeHex(state.productPaletteC);

  const bpA = normalizeHex(state.brandPalette?.primaryColor);
  const bpB = normalizeHex(state.brandPalette?.secondaryColor);
  const bpC = normalizeHex(state.brandPalette?.accentColor);

  let primary: string;
  let secondary: string;
  let tertiary: string;
  let source: 'product' | 'brand' | 'neutral';

  if (pA) {
    // ── Path 1: product palette is the source of truth ───────────────────────
    // Missing slots are derived from primary to guarantee visual coherence.
    source    = 'product';
    primary   = pA;
    secondary = pB || lighten(pA, 15);
    tertiary  = pC || darken(pA, 15);
  } else if (bpA) {
    // ── Path 2: brand system palette (no product palette present) ────────────
    source    = 'brand';
    primary   = bpA;
    secondary = bpB || lighten(bpA, 15);
    tertiary  = bpC || darken(bpA, 15);
  } else {
    // ── Path 3: neutral fallback — readable on any canvas, never pure white ──
    source    = 'neutral';
    primary   = '#f9fafb';
    secondary = '#f3f4f6';
    tertiary  = '#e5e7eb';
  }

  // ── Invariant guard ───────────────────────────────────────────────────────
  // If a product palette exists but we somehow resolved to pure white, the
  // pipeline has a bug that must surface immediately rather than silently
  // generating white backgrounds.
  if (pA && primary.replace('#', '').toLowerCase() === 'ffffff') {
    throw new Error(
      `[buildPalette] Invariant violation: product palette exists (${pA}) but resolved primary is #FFFFFF. ` +
      'Check normalizeHex and the priority chain.'
    );
  }

  // Attach to state — single authoritative source for all downstream builders.
  state.resolvedPalette = { primary, secondary, tertiary, source };

  // eslint-disable-next-line no-console
  console.log(
    '[buildPalette] source=', source,
    '| primary=', primary,
    '| secondary=', secondary,
    '| tertiary=', tertiary,
  );

  return '';
}
