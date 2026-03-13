import React, { useState } from 'react';
import { Chip } from '@/components/ui/Chip';
import type { ProductStudioState, ProductType } from '@/lib/productStudio/types';
import { useProductStudioStore } from '@/lib/productStudio/store';

const SUPPLEMENT_FORMAT_OPTIONS: Array<{ label: string; value: ProductType }> = [
  { label: 'Capsules', value: 'capsules' },
  { label: 'Gummies', value: 'gummies' },
  { label: 'Drops', value: 'drops' },
  { label: 'Powder', value: 'powder' },
  { label: 'Custom', value: 'custom' },
];

const PACKAGING_OPTIONS: Array<{
  label: string;
  value: ProductStudioState['packagingMode'];
}> = [
  { label: 'Without Box', value: 'without-box' },
  { label: 'With Box', value: 'with-box' },
];

export function SupplementsModule() {
  const productType    = useProductStudioStore((s) => s.definition.type);
  const packagingMode  = useProductStudioStore((s) => s.packagingMode);
  const setProductType = useProductStudioStore((s) => s.setProductType);
  const setPackagingMode = useProductStudioStore((s) => s.setPackagingMode);

  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between text-left"
      >
        <p className="text-xs uppercase tracking-[0.2em] font-extrabold text-emerald-700">SUPPLEMENTS SETUP</p>
        <span className="text-[11px] font-semibold text-emerald-700">{isOpen ? 'Hide' : 'Show'}</span>
      </button>

      {isOpen && (
        <div className="mt-4 space-y-4">
          <div>
            <p className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold mb-2">Format</p>
            <div className="flex flex-wrap gap-2">
              {SUPPLEMENT_FORMAT_OPTIONS.map((option) => (
                <Chip
                  key={option.value}
                  selected={productType === option.value}
                  onClick={() => setProductType(option.value)}
                >
                  {option.label}
                </Chip>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold mb-2">Packaging</p>
            <div className="flex flex-wrap gap-2">
              {PACKAGING_OPTIONS.map((option) => (
                <Chip
                  key={option.value}
                  selected={packagingMode === option.value}
                  onClick={() => setPackagingMode(option.value)}
                >
                  {option.label}
                </Chip>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
