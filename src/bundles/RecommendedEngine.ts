import { ALL_PRODUCT_IDS, ProductId } from './bundles.config';

const BASE_RULES: Record<string, ProductId[]> = {
  product_1: ['product_2', 'product_3'],
  product_2: ['product_1', 'product_3', 'product_4'],
  product_3: ['product_1', 'product_2', 'product_4'],
  product_4: ['product_2', 'product_3', 'product_5'],
  product_5: ['product_2', 'product_3', 'product_4', 'product_6'],
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

export function recommend(productId: ProductId, availableProducts: ProductId[]): ProductId[] {
  const normalized = productId;
  const pool = (availableProducts.length ? availableProducts : ALL_PRODUCT_IDS).filter(id => id !== normalized);
  if (!pool.length) return [];
  const ruleCandidates = BASE_RULES[normalized]?.filter(id => pool.includes(id)) ?? [];
  if (ruleCandidates.length >= 2) {
    return ruleCandidates.slice(0, 3);
  }
  const fallback = randomFrom(pool, Math.min(2, pool.length));
  return [...ruleCandidates, ...fallback].slice(0, Math.min(3, pool.length));
}
