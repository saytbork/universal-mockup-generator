import type { IndustryProfile } from '@/lib/productStudio/types';
import { supplementsProfile } from './supplements/profile';
import { wineProfile } from './wine/profile';
import { coffeeProfile } from './coffee/profile';
import type { IndustryProfileModule } from './types';

export const industryRegistry: Record<IndustryProfile, IndustryProfileModule> = {
  supplements: supplementsProfile,
  wine: wineProfile,
  coffee: coffeeProfile,
};

export function resolveIndustryProfileModule(
  industry: IndustryProfile | string | null | undefined
): IndustryProfileModule {
  const normalized = String(industry || '').trim() as IndustryProfile;
  if (normalized && industryRegistry[normalized]) {
    return industryRegistry[normalized];
  }
  return industryRegistry.supplements;
}
