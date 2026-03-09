import type { StudioUIState } from '../types/studioTypes';

const INDUSTRY_CHARACTER: Record<string, string> = {
  supplements: 'hyper-real professional supplement advertising with packaging fidelity, optical realism, and conversion-grade clarity',
  wine: 'wine bottle truth with closure integrity and liquid realism discipline',
  coffee: 'hyper-real professional coffee advertising with packaging truth, beverage-serving realism, and aroma-driven cues',
};

export function buildProductCharacter(state?: StudioUIState): string {
  const industry = String(state?.industryProfile || '').trim().toLowerCase();
  const productType = String(state?.productType || '').trim().toLowerCase();
  const packagingType = String(state?.packagingType || '').trim().toLowerCase();
  const visualProfile = String(state?.visualProfile || '').trim().toLowerCase();

  const industryRule =
    INDUSTRY_CHARACTER[industry] ||
    'product truth fidelity with strict packaging consistency and label preservation';

  const parts = [
    `PRODUCT_CHARACTER_PROFILE: ${industryRule}.`,
    productType ? `PRODUCT_TYPE_CHARACTER: ${productType}.` : '',
    packagingType ? `PACKAGING_TYPE_CHARACTER: ${packagingType}.` : '',
    visualProfile ? `PRODUCT_VISUAL_PROFILE: ${visualProfile}.` : '',
  ].filter(Boolean);

  return parts.join(' ');
}
