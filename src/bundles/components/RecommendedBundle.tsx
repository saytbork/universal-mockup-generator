import React, { useMemo } from 'react';
import { PRODUCT_MEDIA_LIBRARY, ProductId } from '../bundles.config';
import { useBundles } from '../useBundles';

interface RecommendedBundleProps {
  productId: ProductId;
  onGenerate: (bundleProducts: ProductId[]) => void;
}

const RecommendedBundle: React.FC<RecommendedBundleProps> = ({ productId, onGenerate }) => {
  const { getRecommendedBundle } = useBundles();
  const recommendedProducts = useMemo(() => getRecommendedBundle(productId), [getRecommendedBundle, productId]);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/10 bg-gray-900/50 p-4">
        <p className="text-sm font-semibold text-white">Recommended companions</p>
        <p className="text-xs text-gray-400">Pairs perfectly with the selected hero product.</p>
        <div className="mt-3 flex flex-wrap gap-3">
          {recommendedProducts.map(product => {
            const meta = PRODUCT_MEDIA_LIBRARY[product];
            return (
              <div key={product} className="w-28 text-center text-xs text-gray-300">
                <div className="h-28 w-full overflow-hidden rounded-xl border border-white/10 bg-black/20">
                  <img src={meta.imageUrl} alt={meta.label} className="h-full w-full object-cover" />
                </div>
                <p className="mt-1">{meta.label}</p>
              </div>
            );
          })}
        </div>
      </div>
      <button
        type="button"
        onClick={() => onGenerate(recommendedProducts)}
        className="w-full rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
      >
        Generate Recommended Bundle Mockup
      </button>
    </div>
  );
};

export default RecommendedBundle;
