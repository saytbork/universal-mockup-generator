import type { StudioUIState } from '../types/studioTypes.ts';
import type { IndustryProfileModule } from '../industryProfiles/types';
import { resolveIndustryProfileModule } from '../industryProfiles/registry';

/**
 * Delegates product physical prompt blocks to the active industry profile module.
 */
export function buildProductPhysical(
  state?: StudioUIState,
  profileModule?: IndustryProfileModule
): string {
  if (!state) return '';
  const profile = profileModule || resolveIndustryProfileModule(state.industryProfile);
  return profile.physicalRules(state);
}
