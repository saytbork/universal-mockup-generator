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
          <p className="text-xs uppercase tracking-[0.3em] text-indigo-200">UGC expressions</p>
          <p className="text-[11px] text-gray-400">Override perfect smiles with exhausted, messy expressions.</p>
        </div>
        {selectedId && (
          <button
            type="button"
            onClick={() => onSelect(null)}
            className="text-[11px] text-gray-400 hover:text-white"
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
                isActive ? 'border-amber-300 bg-amber-500/10 text-white' : 'border-white/15 text-gray-200 hover:border-indigo-400 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-1 relative group">
                <span>{preset.label}</span>
                {preset.tooltip && (
                  <span className="text-xs text-gray-400 cursor-pointer group-hover:text-white">
                    ⓘ
                    <div className="absolute left-0 top-4 z-50 hidden group-hover:block bg-black/90 text-white text-xs p-2 rounded shadow-lg w-44">
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
