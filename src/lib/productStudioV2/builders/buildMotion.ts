import type { StudioAuthorityBundle, StudioUIState } from '../types/studioTypes.ts';

export function buildMotion(authority: StudioAuthorityBundle, state?: StudioUIState): string {
  const resolvedMotion = state?.motion || authority.motion;
  const packagingBehavior = String(state?.packagingBehavior || '').trim();
  const packagingBlock = packagingBehavior ? ` PACKAGING_BEHAVIOR: ${packagingBehavior}.` : '';
  return `STUDIO_PRODUCT_MOTION: ${resolvedMotion}.${packagingBlock}`;
}
