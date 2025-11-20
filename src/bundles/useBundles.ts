import { useMemo } from 'react';
import { PREMADE_BUNDLES, ALL_PRODUCT_IDS, ProductId } from './bundles.config';
import { recommend } from './RecommendedEngine';

export interface BundlesHook {
  preMadeBundles: typeof PREMADE_BUNDLES;
  allProducts: ProductId[];
  buildCustomBundle: (selectedProducts: string[]) => ProductId[];
  getRecommendedBundle: (productId: string) => ProductId[];
}

const sanitizeProducts = (selectedProducts: string[], allowedProducts: ProductId[]): ProductId[] => {
  const allowed = new Set<ProductId>(allowedProducts.length ? allowedProducts : ALL_PRODUCT_IDS);
  const unique: ProductId[] = [];
  selectedProducts.forEach(product => {
    const normalized = product as ProductId;
    if (allowed.has(normalized) && !unique.includes(normalized)) {
      unique.push(normalized);
    }
  });
  return unique;
};

export function useBundles(availableProducts: ProductId[] = []): BundlesHook {
  const preMadeBundles = useMemo(() => PREMADE_BUNDLES, []);
  const allProducts = useMemo(() => (availableProducts.length ? availableProducts : ALL_PRODUCT_IDS), [availableProducts]);

  const buildCustomBundle = (selectedProducts: string[]) => sanitizeProducts(selectedProducts, allProducts);
  const getRecommendedBundle = (productId: string) => recommend(productId as ProductId, allProducts);

  return {
    preMadeBundles,
    allProducts,
    buildCustomBundle,
    getRecommendedBundle,
  };
}
