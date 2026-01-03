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
          <p className="text-xs uppercase tracking-[0.3em] text-accent">Custom clothes</p>
          <p className="text-[11px] text-textSecondary">Upload a reference outfit or tap a preset to keep it raw and real.</p>
        </div>
        {uploadPreview && (
          <button
            type="button"
            onClick={onClearUpload}
            className="text-[11px] text-textSecondary hover:text-textPrimary"
          >
            Remove
          </button>
        )}
      </div>
      <label
        htmlFor={inputId}
        className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-borderSubtle bg-surfaceTint px-4 py-6 text-center text-xs text-textSecondary cursor-pointer hover:border-accent"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-textSecondary" viewBox="0 0 24 24" fill="none" stroke="currentColor">
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
        <div className="rounded-2xl border border-borderSubtle bg-surfaceTint p-3 text-xs text-textSecondary">
          <p className="mb-2 text-[11px] uppercase tracking-[0.3em] text-accent">Reference preview</p>
          <img src={uploadPreview} alt="Clothing reference" className="h-32 w-full rounded-xl object-cover" />
        </div>
      )}
      <div>
        <p className="mb-2 text-[11px] uppercase tracking-[0.3em] text-accent">Quick presets</p>
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
                    ? 'bg-accent text-white border-accent shadow-accent-glow scale-105 duration-500'
                    : 'border-borderSubtle bg-surfaceElevated text-textSecondary hover:border-accent hover:text-textPrimary'
                }`}
              >
                <div className="flex items-center gap-1 relative group">
                  <span>{preset.label}</span>
                  {preset.tooltip && (
                    <span className="text-xs text-textSecondary cursor-pointer group-hover:text-textPrimary">
                      ⓘ
                      <div className="absolute left-0 top-4 z-50 hidden group-hover:block bg-surface text-textPrimary text-xs p-2 rounded-apple border border-borderSubtle shadow-sm w-44">
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
