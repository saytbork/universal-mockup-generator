import React, { useMemo, useState } from 'react';
import { PREMADE_BUNDLES, PRODUCT_MEDIA_LIBRARY } from '../bundles.config';
import type { ProductId, ProductMediaLibrary } from '../bundles.config';

interface BundleSelectorProps {
  onGenerate: (bundleProducts: ProductId[]) => void;
  productMediaLibrary: ProductMediaLibrary;
  visibleProductIds: ProductId[];
  activeProductCount: number;
}

const BundleSelector: React.FC<BundleSelectorProps> = ({
  onGenerate,
  productMediaLibrary,
  visibleProductIds,
  activeProductCount: _activeProductCount,
}) => {
  const bundleEntries = useMemo(() => Object.entries(PREMADE_BUNDLES), []);
  const [activeKey, setActiveKey] = useState(bundleEntries[0]?.[0] ?? '');

  const activeBundle = activeKey ? PREMADE_BUNDLES[activeKey] : null;
  const filledSet = useMemo(
    () =>
      new Set(
        Object.entries(productMediaLibrary)
          .filter(([, meta]) => Boolean(meta?.imageUrl && meta.imageUrl.length > 0))
          .map(([id]) => id as ProductId)
      ),
    [productMediaLibrary]
  );
  const visibleProducts = activeBundle?.products.filter(id => filledSet.has(id)) ?? [];
  const needMoreProducts = filledSet.size < 2;
  const bundleDisabled = needMoreProducts || !visibleProducts.length;
  const slotProducts = useMemo(() => {
    if (!activeBundle) return [];
    return activeBundle.products.map(productId => ({
      id: productId,
      meta: productMediaLibrary[productId] ?? PRODUCT_MEDIA_LIBRARY[productId],
      filled: Boolean(productMediaLibrary[productId]?.imageUrl && productMediaLibrary[productId]?.imageUrl.length > 0),
    }));
  }, [activeBundle, productMediaLibrary]);

  const handleGenerate = () => {
    if (!activeBundle || bundleDisabled) return;
    onGenerate(visibleProducts);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <label className="text-xs uppercase tracking-[0.3em] text-gray-400">Pick a bundle</label>
        <select
          value={activeKey}
          onChange={event => setActiveKey(event.target.value)}
          className="rounded-lg border border-white/15 bg-gray-900/60 px-3 py-2 text-sm text-white focus:border-indigo-400 focus:outline-none"
        >
          {bundleEntries.map(([key, bundle]) => (
            <option key={key} value={key}>
              {bundle.name}
            </option>
          ))}
        </select>
      </div>

      {activeBundle && (
        <div className="rounded-2xl border border-white/10 bg-gray-900/60 p-4 space-y-3">
          <p className="text-sm font-semibold text-white">{activeBundle.name}</p>
          {bundleDisabled && (
            <p className="text-xs text-amber-200">
              {needMoreProducts
                ? 'Add another product to enable bundles.'
                : 'Upload matching product photos to use this bundle.'}
            </p>
          )}
          <div className="flex flex-wrap gap-3">
            {slotProducts.map(slot => {
              const productMeta = slot.meta;
              return (
                <div key={slot.id} className="w-28 text-center text-xs text-gray-300">
                  <div className="relative h-28 w-full overflow-hidden rounded-xl border border-white/10 bg-black/20">
                    {productMeta?.imageUrl && (
                      <img
                        src={productMeta.imageUrl}
                        className="h-full w-full object-cover"
                      />
                    )}
                    {!productMeta?.imageUrl && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-[10px] font-semibold text-amber-200">
                        Upload to fill
                      </div>
                    )}
                  </div>
                  <p className="mt-1 text-[11px]">{productMeta?.label || slot.id}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={handleGenerate}
        disabled={!activeBundle || bundleDisabled}
        className="w-full rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-900/50"
      >
        Generate Bundle Mockup
      </button>
    </div>
  );
};

export default BundleSelector;
