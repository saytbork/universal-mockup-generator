import React, { useMemo } from 'react';
import { ProductId, ProductMediaLibrary } from '../bundles.config';
import { useBundles } from '../useBundles';

interface RecommendedBundleProps {
  productId: ProductId;
  onGenerate: (bundleProducts: ProductId[]) => void;
  productMediaLibrary: ProductMediaLibrary;
}

const RecommendedBundle: React.FC<RecommendedBundleProps> = ({ productId, onGenerate, productMediaLibrary }) => {
  const { getRecommendedBundle } = useBundles();
  const recommendedProducts = useMemo(() => getRecommendedBundle(productId), [getRecommendedBundle, productId]);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/10 bg-gray-900/50 p-4">
        <p className="text-sm font-semibold text-white">Recommended companions</p>
        <p className="text-xs text-gray-400">Pairs perfectly with the selected hero product.</p>
        <div className="mt-3 flex flex-wrap gap-3">
          {recommendedProducts.map(product => {
            const meta = productMediaLibrary[product];
            return (
              <div key={product} className="w-28 text-center text-xs text-gray-300">
                <div className="h-28 w-full overflow-hidden rounded-xl border border-white/10 bg-black/20">
                  {meta?.imageUrl ? (
                    <img src={meta.imageUrl} alt={meta.label} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-500">{meta?.label || product}</div>
                  )}
                </div>
                <p className="mt-1">{meta?.label || product}</p>
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
