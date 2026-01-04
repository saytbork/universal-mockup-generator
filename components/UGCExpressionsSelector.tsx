import React from 'react';
import { normalizeOptions } from '../src/system/normalizeOptions';
import type { UGCExpressionPreset } from '../src/data/ugcPresets';

interface UGCExpressionsSelectorProps {
  presets: UGCExpressionPreset[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  disabled?: boolean;
}

const UGCExpressionsSelector: React.FC<UGCExpressionsSelectorProps> = ({
  presets,
  selectedId,
  onSelect,
  disabled = false,
}) => {
  const normalizedPresets = normalizeOptions(presets.map(preset => ({ ...preset, value: preset.id })));

  return (
    <div className={`space-y-3 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-indigo-600">UGC expressions</p>
          <p className="text-[11px] text-gray-600">Override perfect smiles with exhausted, messy expressions.</p>
        </div>
        {selectedId && (
          <button
            type="button"
            onClick={() => onSelect(null)}
            className="text-[11px] text-gray-600 hover:text-gray-900"
          >
            Clear
          </button>
        )}
      </div>
      <div className="flex flex-col gap-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
        {normalizedPresets.map(preset => {
          const isActive = preset.id === selectedId;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelect(isActive ? null : preset.id)}
              className={`rounded-xl border px-3 py-2 text-left text-sm transition ${
                isActive ? 'bg-accent text-white border-indigo-600 shadow-md shadow-md shadow-indigo-500/20 scale-105 duration-500' : 'border-gray-200 bg-whiteTint text-gray-900 hover:border-indigo-600'
              }`}
            >
              <div className="flex items-center gap-1 relative group">
                <span>{preset.label}</span>
                {preset.tooltip && (
                  <span className="text-xs text-gray-600 cursor-pointer group-hover:text-gray-900">
                    ⓘ
                    <div className="absolute left-0 top-4 z-50 hidden group-hover:block bg-white text-gray-900 text-xs p-2 rounded-2xl border border-gray-200 shadow-sm w-44">
                      {preset.tooltip}
                    </div>
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default UGCExpressionsSelector;
