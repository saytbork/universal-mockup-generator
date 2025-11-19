import { ALL_PRODUCT_IDS, ProductId } from './bundles.config';

const FALLBACK_COMPANIONS: Record<ProductId, ProductId[]> = {
  breathe: ['sino_clear', 'mullein_tea'],
  sino_clear: ['breathe'],
  mullein_tea: ['breathe'],
};

const randomFrom = (pool: ProductId[], count: number): ProductId[] => {
  const copy = [...pool];
  const selection: ProductId[] = [];
  while (copy.length && selection.length < count) {
    const index = Math.floor(Math.random() * copy.length);
    const [chosen] = copy.splice(index, 1);
    selection.push(chosen);
  }
  return selection;
};

export function recommend(productId: string): ProductId[] {
  const normalized = productId as ProductId;
  if (FALLBACK_COMPANIONS[normalized]) {
    return FALLBACK_COMPANIONS[normalized];
  }
  const compatiblePool = ALL_PRODUCT_IDS.filter(id => id !== normalized);
  return randomFrom(compatiblePool, Math.min(2, compatiblePool.length));
}
