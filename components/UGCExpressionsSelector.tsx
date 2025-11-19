import React from 'react';
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
        {presets.map(preset => {
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
              {preset.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default UGCExpressionsSelector;
