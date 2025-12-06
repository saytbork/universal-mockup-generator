import React from 'react';
import { normalizeOptions } from '../src/system/normalizeOptions';
import type { UGCCustomClothingPreset } from '../src/data/ugcPresets';

interface CustomClothesSelectorProps {
  presets: UGCCustomClothingPreset[];
  selectedPresetIds: string[];
  onTogglePreset: (id: string) => void;
  onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClearUpload: () => void;
  uploadPreview: string | null;
  disabled?: boolean;
}

const CustomClothesSelector: React.FC<CustomClothesSelectorProps> = ({
  presets,
  selectedPresetIds,
  onTogglePreset,
  onUpload,
  onClearUpload,
  uploadPreview,
  disabled = false,
}) => {
  const inputId = 'custom-clothes-upload-input';
  const normalizedPresets = normalizeOptions(presets.map(preset => ({ ...preset, value: preset.id })));

  return (
    <div className={`space-y-3 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-indigo-200">Custom clothes</p>
          <p className="text-[11px] text-gray-400">Upload a reference outfit or tap a preset to keep it raw and real.</p>
        </div>
        {uploadPreview && (
          <button
            type="button"
            onClick={onClearUpload}
            className="text-[11px] text-red-300 hover:text-red-200"
          >
            Remove
          </button>
        )}
      </div>
      <label
        htmlFor={inputId}
        className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/20 bg-black/30 px-4 py-6 text-center text-xs text-gray-300 cursor-pointer hover:border-indigo-400"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 5v14m7-7H5" />
        </svg>
        <span>Upload clothing reference</span>
        <input
          id={inputId}
          type="file"
          accept="image/*"
          className="hidden"
          disabled={disabled}
          onChange={onUpload}
        />
      </label>
      {uploadPreview && (
        <div className="rounded-2xl border border-white/15 bg-black/30 p-3 text-xs text-gray-300">
          <p className="mb-2 text-[11px] uppercase tracking-[0.3em] text-indigo-200">Reference preview</p>
          <img src={uploadPreview} alt="Clothing reference" className="h-32 w-full rounded-xl object-cover" />
        </div>
      )}
      <div>
        <p className="mb-2 text-[11px] uppercase tracking-[0.3em] text-indigo-200">Quick presets</p>
        <div className="flex flex-wrap gap-2">
          {normalizedPresets.map(preset => {
            const isActive = selectedPresetIds.includes(preset.id);
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => onTogglePreset(preset.id)}
                className={`rounded-full border px-3 py-1 text-xs transition ${
                  isActive
                    ? 'border-amber-300 bg-amber-500/10 text-white'
                    : 'border-white/20 text-gray-300 hover:border-indigo-400 hover:text-white'
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
    </div>
  );
};

export default CustomClothesSelector;
