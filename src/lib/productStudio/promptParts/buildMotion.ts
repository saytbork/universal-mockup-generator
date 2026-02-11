import type { ProductStateMotion } from '../types';

export function buildMotionAuthorityBlock(motion: ProductStateMotion): string {
  const base = `PRODUCT_STATE_MOTION: ${motion}.`;

  if (motion === 'static') {
    return [
      base,
      'Motion authority: static lock enabled. No dynamic motion clauses, no implied movement vectors, no splash trajectory directives.',
    ].join(' ');
  }

  if (motion === 'falling' || motion === 'pouring' || motion === 'spilled') {
    return [
      base,
      'Motion authority: dynamic vector enforced with gravity-consistent trajectory, coherent contact response, and physically plausible directionality.',
    ].join(' ');
  }

  if (motion === 'dispensed') {
    return [
      base,
      'Motion authority: controlled dispensing behavior only, with realistic fluid/material continuity and no contradictory static lock.',
    ].join(' ');
  }

  return [
    base,
    'Motion authority: active state constrained to physically coherent behavior with no contradictory motion instructions.',
  ].join(' ');
}
