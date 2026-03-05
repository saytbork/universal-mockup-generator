import type { StudioUIState } from '../types/studioTypes.ts';

const HEX_RE = /^#[0-9a-f]{3,8}$/i;

function isValidHex(v: unknown): v is string {
  return typeof v === 'string' && HEX_RE.test(v.trim());
}

function normalizeHex(v: unknown): string {
  if (typeof v !== 'string') return '';
  let h = v.trim();
  if (!h) return '';
  if (!h.startsWith('#')) h = `#${h}`;
  return isValidHex(h) ? h.toLowerCase() : '';
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
 * amount = 12 -> 12% closer to pure white.
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
 * buildPalette — resolves the canonical 3-color palette used by V2.
 *
 * Priority rule:
 *   1. productPalette (product is always the visual source of truth)
 *   2. brandPalette (derived from product when available; used only when no product palette)
 *   3. neutral-gray (#f9fafb / #f3f4f6 / #e5e7eb) — never pure white
 *
 * Missing secondary/tertiary slots are derived via lighten()/darken() from primary.
 *
 * Side-effect:
 *   Writes state.resolvedPalette = { primary, secondary, tertiary, source }.
 */
export function buildPalette(state: StudioUIState): string {
  const pA = normalizeHex(state.productPaletteA);
  const pB = normalizeHex(state.productPaletteB);
  const pC = normalizeHex(state.productPaletteC);
  const bpA = normalizeHex(state.brandPalette?.primaryColor);
  const bpB = normalizeHex(state.brandPalette?.secondaryColor);
  const bpC = normalizeHex(state.brandPalette?.accentColor);

  let source: 'product' | 'brand' | 'neutral';
  let primary: string;
  let secondary: string;
  let tertiary: string;

  if (pA) {
    source = 'product';
    primary = pA;
    secondary = pB || lighten(pA, 15);
    tertiary = pC || darken(pA, 15);
  } else if (bpA) {
    source = 'brand';
    primary = bpA;
    secondary = bpB || lighten(bpA, 15);
    tertiary = bpC || darken(bpA, 15);
  } else {
    source = 'neutral';
    primary = '#f9fafb';
    secondary = '#f3f4f6';
    tertiary = '#e5e7eb';
  }

  // Guard: product palette must never resolve to pure white
  if (pA && primary === '#ffffff') {
    throw new Error(
      `[buildPalette] Invariant violation: product dominant color resolved to white (${primary}). ` +
      'Background must use extracted product dominant color.'
    );
  }

  state.resolvedPalette = { primary, secondary, tertiary, source };

  // eslint-disable-next-line no-console
  console.log(
    '[buildPalette]\n' +
    `source=${source}\n` +
    `primary=${primary}\n` +
    `secondary=${secondary}\n` +
    `tertiary=${tertiary}`
  );

  return '';
}
