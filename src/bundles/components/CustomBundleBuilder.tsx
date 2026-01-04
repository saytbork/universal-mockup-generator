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
  console.log('DEBUG productMediaLibrary (custom):', productMediaLibrary);
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
      <p className="text-xs uppercase tracking-[0.3em] text-gray-600">
        Choose {minSelection} to {maxSelection} products
      </p>
      {visibleProductIds.length === 0 ? (
        <p className="text-xs text-gray-500">
          Upload product photos to build your own bundle.
        </p>
      ) : (
          <div className="grid gap-3 sm:grid-cols-3">
            {visibleProductIds.map(productId => {
              const meta = productMediaLibrary[productId];
              console.log('DEBUG productMeta (custom):', meta);
              const isChecked = filteredSelection.includes(productId);
            return (
              <label
                key={productId}
                className={`flex flex-col gap-2 rounded-2xl border px-3 py-3 ${
                  isChecked
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20 scale-105 duration-500'
                  : 'border-gray-200 bg-gray-50 text-gray-600'
              }`}
            >
              <div className="flex items-center gap-2 text-sm font-semibold">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleProduct(productId)}
                  className="h-4 w-4 rounded border-gray-200 text-indigo-600 focus:ring-indigo-500"
                />
                {meta?.label || productId}
              </div>
              <div className="relative h-28 w-full overflow-hidden rounded-xl bg-gray-50">
                {meta?.imageUrl && (
                  <img
                    src={meta.imageUrl}
                    className="h-full w-full object-cover"
                  />
                )}
                {!meta?.imageUrl && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-50 text-[10px] font-semibold text-gray-500">
                    Upload to fill
                  </div>
                )}
              </div>
            </label>
          );
        })}
        </div>
      )}
      {filteredSelection.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-3 space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-indigo-600">
            Selected bundle ({filteredSelection.length})
          </p>
          <div className="flex flex-wrap gap-2 text-xs">
            {filteredSelection.map(productId => (
              <span
                key={`summary-${productId}`}
                className="rounded-full border border-gray-200 px-3 py-1 text-gray-900"
              >
                {productMediaLibrary[productId]?.label || productId}
              </span>
            ))}
          </div>
        </div>
      )}
      {!isValidSelection && visibleProductIds.length > 0 && (
        <p className="text-xs text-gray-500">
          Select between {minSelection} and {maxSelection} products to continue.
        </p>
      )}
      <button
        type="button"
        onClick={handleGenerate}
        disabled={!isValidSelection}
        className="w-full rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-50"
      >
        Generate Custom Bundle Mockup
      </button>
    </div>
  );
};

export default CustomBundleBuilder;
