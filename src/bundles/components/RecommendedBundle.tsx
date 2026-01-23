import React, { useMemo } from 'react';
import { ProductId, ProductMediaLibrary } from '../bundles.config';
import { useBundles } from '../useBundles';

interface RecommendedBundleProps {
  productId: ProductId;
  onGenerate: (bundleProducts: ProductId[]) => void;
  productMediaLibrary: ProductMediaLibrary;
  visibleProductIds: ProductId[];
}

const RecommendedBundle: React.FC<RecommendedBundleProps> = ({
  productId,
  onGenerate,
  productMediaLibrary,
  visibleProductIds,
}) => {
  console.log('DEBUG productMediaLibrary (recommended):', productMediaLibrary);
  const { getRecommendedBundle } = useBundles(visibleProductIds);
  const visibleSet = useMemo(() => new Set(visibleProductIds), [visibleProductIds]);
  const recommendedProducts = useMemo(
    () => getRecommendedBundle(productId).filter(id => visibleSet.has(id)),
    [getRecommendedBundle, productId, visibleSet]
  );
  const bundleDisabled = recommendedProducts.length === 0;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-200 bg-whiteTint p-4">
        <p className="text-sm font-semibold text-white">Recommended companions</p>
        <p className="text-xs text-gray-600">Pairs perfectly with the selected hero product.</p>
        {bundleDisabled && (
          <p className="text-xs text-gray-500">Upload more products to view recommendations.</p>
        )}
        <div className="mt-3 flex flex-wrap gap-3">
          {recommendedProducts.map(product => {
            const meta = productMediaLibrary[product];
            console.log('DEBUG productMeta (recommended):', meta);
            return (
              <div key={product} className="w-28 text-center text-xs text-gray-600">
                <div className="relative h-28 w-full overflow-hidden rounded-xl border border-gray-200 bg-whiteTint">
                  {meta?.imageUrl && (
                    <img
                      src={meta.imageUrl}
                      className="h-full w-full object-cover"
                    />
                  )}
                  {!meta?.imageUrl && (
                    <div className="absolute inset-0 flex items-center justify-center bg-whiteTint text-[10px] font-semibold text-gray-500">
                      Upload to fill
                    </div>
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
        disabled={bundleDisabled}
        className="w-full rounded-xl bg-indigo-600 text-white px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-600 text-white disabled:cursor-not-allowed disabled:bg-whiteTint"
      >
        Generate Recommended Bundle Mockup
      </button>
    </div>
  );
};

export default RecommendedBundle;
