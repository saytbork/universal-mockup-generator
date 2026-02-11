import type { ProductStateMotion } from '../types';

export function buildProductStateBlock(motion: ProductStateMotion): string {
  const stateLabel = motion === 'opened' ? 'Opened' : motion === 'static' ? 'Closed/Static' : 'Active';
  return `PRODUCT STATE AUTHORITY: ${stateLabel}. Preserve packaging integrity, label legibility, and geometry lock under this state.`;
}
