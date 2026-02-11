import type { StudioAuthorityBundle } from '../types/studioTypes.ts';

export function buildComposition(authority: StudioAuthorityBundle): string {
  const spreadRule = authority.permissions.allowHorizontalSpread
    ? 'Horizontal spread is permitted when needed for edge continuity.'
    : 'Horizontal spread is disabled.';
  const verticalRule = authority.permissions.allowVerticalDominance
    ? 'Vertical subject dominance is enabled.'
    : 'Vertical subject dominance is not forced.';

  return [
    `STUDIO_COMPOSITION_MODEL: ${authority.composition}.`,
    spreadRule,
    verticalRule,
    authority.permissions.allowVerticalDominance
      ? 'No lateral splash expansion allowed.'
      : 'Lateral splash expansion follows world constraints.',
  ].join(' ');
}
