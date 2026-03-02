/**
 * ARTWORK_IMMUTABILITY — global single-source-of-truth block.
 *
 * Applies to every industry: wine, coffee, supplements, beauty, beverage,
 * boxes, tubes, jars, and any other product with printed artwork.
 *
 * Injected immediately after buildIntent in every pipeline (generic, coffee, wine).
 * Must NOT contain threat language, override declarations, or authority claims.
 * Must be descriptive and directive only.
 *
 * Companion blocks (e.g. LABEL_PRESERVATION_LOCK in wine, LABEL_LOCK in
 * qualityEnforcer) remain and are not replaced — they operate at the physics
 * and geometry level. This block operates at the semantic/content level.
 */
export function buildArtworkImmutability(): string {
  return [
    'ARTWORK_IMMUTABILITY:',
    'Preserve the product artwork exactly as in the reference image.',
    'Do not modify printed text.',
    'Do not reinterpret typography.',
    'Do not regenerate characters.',
    'Do not correct spelling.',
    'Do not substitute proper nouns.',
    'Do not rewrite geographic names.',
    'Do not alter brand names.',
    'All printed elements must remain visually identical to the source reference.',
    'No invented wording.',
    'No semantic correction.',
    'No typographic enhancement.',
  ].join(' ');
}
