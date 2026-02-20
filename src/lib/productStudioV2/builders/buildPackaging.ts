import type { StudioUIState } from '../types/studioTypes.ts';

export function buildPackaging(state?: StudioUIState): string {
  if (state?.visualProfile === 'coffee') return '';
  const packagingBehavior = String(state?.packagingBehavior || '').trim();
  if (!packagingBehavior) return '';
  return `PACKAGING_BEHAVIOR: ${packagingBehavior}.`;
}
