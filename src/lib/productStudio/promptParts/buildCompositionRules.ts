import type { CompositionAuthority } from './authorityResolver';

export function buildCompositionAuthorityBlock(composition: CompositionAuthority): string {
  if (!composition.isSquare) {
    return 'COMPOSITION AUTHORITY: standard aspect behavior. Maintain product dominance without contradictory framing rules.';
  }

  if (composition.allowVerticalDominance) {
    return [
      'COMPOSITION AUTHORITY: square vertical-dominance exception active.',
      'Allow vertical subject dominance.',
      'Do not artificially expand horizontal environment.',
      'Water and atmosphere must extend naturally to all edges.',
      'No neutral side fill, no white lateral bands, no artificial padding.',
    ].join(' ');
  }

  if (composition.allowHorizontalSpread) {
    return [
      'COMPOSITION AUTHORITY: square conversion optimization active.',
      'Apply controlled horizontal environmental spread to avoid narrow vertical bias and artificial lateral emptiness while preserving hero readability.',
    ].join(' ');
  }

  return 'COMPOSITION AUTHORITY: square framing with centered product dominance and no contradictory spread directives.';
}
