import React, { useMemo, useState } from 'react';
import { PREMADE_BUNDLES, PRODUCT_MEDIA_LIBRARY } from '../bundles.config';
import type { ProductId } from '../bundles.config';

interface BundleSelectorProps {
  onGenerate: (bundleProducts: ProductId[]) => void;
}

const BundleSelector: React.FC<BundleSelectorProps> = ({ onGenerate }) => {
  const bundleEntries = useMemo(() => Object.entries(PREMADE_BUNDLES), []);
  const [activeKey, setActiveKey] = useState(bundleEntries[0]?.[0] ?? '');

  const activeBundle = activeKey ? PREMADE_BUNDLES[activeKey] : null;

  const handleGenerate = () => {
    if (!activeBundle) return;
    onGenerate(activeBundle.products);
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
          <div className="flex flex-wrap gap-3">
            {activeBundle.products.map(productId => {
              const meta = PRODUCT_MEDIA_LIBRARY[productId];
              return (
                <div key={productId} className="w-28 text-center text-xs text-gray-300">
                  <div className="h-28 w-full overflow-hidden rounded-xl border border-white/10 bg-black/20">
                    <img
                      src={meta.imageUrl}
                      alt={meta.label}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <p className="mt-1">{meta.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={handleGenerate}
        disabled={!activeBundle}
        className="w-full rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-900/50"
      >
        Generate Bundle Mockup
      </button>
    </div>
  );
};

export default BundleSelector;
