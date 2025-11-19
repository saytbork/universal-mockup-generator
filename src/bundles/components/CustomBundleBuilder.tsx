import React, { useState } from 'react';
import { ALL_PRODUCT_IDS, ProductId, ProductMediaLibrary } from '../bundles.config';
import { useBundles } from '../useBundles';

interface CustomBundleBuilderProps {
  onGenerate: (bundleProducts: ProductId[]) => void;
  productMediaLibrary: ProductMediaLibrary;
}

const MIN_SELECTION = 2;
const MAX_SELECTION = 5;

const CustomBundleBuilder: React.FC<CustomBundleBuilderProps> = ({ onGenerate, productMediaLibrary }) => {
  const { buildCustomBundle } = useBundles();
  const [selected, setSelected] = useState<Record<ProductId, boolean>>(() =>
    ALL_PRODUCT_IDS.reduce((acc, id) => {
      acc[id] = false;
      return acc;
    }, {} as Record<ProductId, boolean>)
  );

  const toggleProduct = (productId: ProductId) => {
    setSelected(prev => ({ ...prev, [productId]: !prev[productId] }));
  };

  const selectedIds = ALL_PRODUCT_IDS.filter(id => selected[id]);
  const isValidSelection =
    selectedIds.length >= MIN_SELECTION && selectedIds.length <= MAX_SELECTION;

  const handleGenerate = () => {
    if (!isValidSelection) return;
    const bundle = buildCustomBundle(selectedIds);
    onGenerate(bundle);
  };

  return (
    <div className="space-y-4">
      <p className="text-xs uppercase tracking-[0.3em] text-gray-400">
        Choose {MIN_SELECTION} to {MAX_SELECTION} products
      </p>
      <div className="grid gap-3 sm:grid-cols-3">
        {ALL_PRODUCT_IDS.map(productId => {
          const meta = productMediaLibrary[productId];
          const isChecked = selected[productId];
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
      {selectedIds.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-gray-900/40 p-3 space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-indigo-200">
            Selected bundle ({selectedIds.length})
          </p>
          <div className="flex flex-wrap gap-2 text-xs">
            {selectedIds.map(productId => (
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
      {!isValidSelection && (
        <p className="text-xs text-amber-200">
          Select between {MIN_SELECTION} and {MAX_SELECTION} products to continue.
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
