import React, { useState } from 'react';
import { ProductId, ProductMediaLibrary } from '../bundles.config';
import { useBundles } from '../useBundles';

interface CustomBundleBuilderProps {
  onGenerate: (bundleProducts: ProductId[]) => void;
  productMediaLibrary: ProductMediaLibrary;
  visibleProductIds: ProductId[];
}

const CustomBundleBuilder: React.FC<CustomBundleBuilderProps> = ({
  onGenerate,
  productMediaLibrary,
  visibleProductIds,
}) => {
  const { buildCustomBundle } = useBundles(visibleProductIds);
  const [selectedIds, setSelectedIds] = useState<ProductId[]>([]);

  React.useEffect(() => {
    setSelectedIds(prev => prev.filter(id => visibleProductIds.includes(id)));
  }, [visibleProductIds]);

  const toggleProduct = (productId: ProductId) => {
    setSelectedIds(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      }
      return [...prev, productId];
    });
  };

  const filteredSelection = selectedIds.filter(id => visibleProductIds.includes(id));
  const minSelection = Math.min(2, Math.max(1, visibleProductIds.length));
  const maxSelection = Math.max(minSelection, visibleProductIds.length || minSelection);
  const isValidSelection =
    filteredSelection.length >= minSelection && filteredSelection.length <= maxSelection;

  const handleGenerate = () => {
    if (!isValidSelection) return;
    const bundle = buildCustomBundle(filteredSelection);
    onGenerate(bundle);
  };

  return (
    <div className="space-y-4">
      <p className="text-xs uppercase tracking-[0.3em] text-gray-400">
        Choose {minSelection} to {maxSelection} products
      </p>
      {visibleProductIds.length === 0 ? (
        <p className="text-xs text-amber-200">
          Upload product photos to build your own bundle.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-3">
          {visibleProductIds.map(productId => {
            const meta = productMediaLibrary[productId];
            const isChecked = filteredSelection.includes(productId);
            return (
              <label
                key={productId}
                className={`flex flex-col gap-2 rounded-2xl border px-3 py-3 ${
                  isChecked
                  ? 'border-indigo-400 bg-indigo-500/10 text-white'
                  : 'border-white/10 bg-gray-900/40 text-gray-300'
              }`}
            >
              <div className="flex items-center gap-2 text-sm font-semibold">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleProduct(productId)}
                  className="h-4 w-4 rounded border-gray-400 text-indigo-500 focus:ring-indigo-400"
                />
                {meta?.label || productId}
              </div>
              {meta?.imageUrl ? (
                <img
                  src={meta.imageUrl}
                  alt={meta.label}
                  className="h-28 w-full rounded-xl object-cover"
                />
              ) : (
                <div className="flex h-28 items-center justify-center rounded-xl bg-gray-900/40 text-sm text-gray-500">
                  {meta?.label || productId}
                </div>
              )}
            </label>
          );
        })}
        </div>
      )}
      {filteredSelection.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-gray-900/40 p-3 space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-indigo-200">
            Selected bundle ({filteredSelection.length})
          </p>
          <div className="flex flex-wrap gap-2 text-xs">
            {filteredSelection.map(productId => (
              <span
                key={`summary-${productId}`}
                className="rounded-full border border-white/20 px-3 py-1 text-gray-100"
              >
                {productMediaLibrary[productId]?.label || productId}
              </span>
            ))}
          </div>
        </div>
      )}
      {!isValidSelection && visibleProductIds.length > 0 && (
        <p className="text-xs text-amber-200">
          Select between {minSelection} and {maxSelection} products to continue.
        </p>
      )}
      <button
        type="button"
        onClick={handleGenerate}
        disabled={!isValidSelection}
        className="w-full rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-900/50"
      >
        Generate Custom Bundle Mockup
      </button>
    </div>
  );
};

export default CustomBundleBuilder;
