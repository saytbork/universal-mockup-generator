import React from 'react';
import { normalizeOptions } from '../src/system/normalizeOptions';
import { Option } from '../types';

interface ChipSelectGroupProps {
  label: string;
  options: Option[];
  selectedValue: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  allowCustom?: boolean;
  customLabel?: string;
  customPlaceholder?: string;
}

const ChipSelectGroup: React.FC<ChipSelectGroupProps> = ({
  label,
  options,
  selectedValue,
  onChange,
  disabled = false,
  allowCustom = false,
  customLabel = 'Custom',
  customPlaceholder = 'Describe your own option',
}) => {
  const optionValues = options.map(option => option.value);
  const isCustomValue = allowCustom && selectedValue && !optionValues.includes(selectedValue);
  const [customDraft, setCustomDraft] = React.useState(isCustomValue ? selectedValue : '');
  const [customActive, setCustomActive] = React.useState(isCustomValue);
  const normalizedOptions = normalizeOptions(options);

  React.useEffect(() => {
    if (isCustomValue) {
      setCustomDraft(selectedValue);
      setCustomActive(true);
    } else {
      setCustomActive(false);
    }
  }, [isCustomValue, selectedValue]);

  const handleCustomChange = (value: string) => {
    setCustomDraft(value);
    onChange(value);
  };

  return (
    <div className="flex flex-col space-y-3">
      <label className="text-sm font-medium text-gray-400">{label}</label>
      <div>
        <div className="flex flex-nowrap lg:flex-wrap gap-2 py-2 overflow-x-auto lg:overflow-visible custom-scrollbar">
          {normalizedOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => !disabled && onChange(option.value)}
              disabled={disabled}
              className={`
                px-3 py-1.5 text-sm font-medium rounded-full transition-all duration-200 ease-in-out
                border whitespace-nowrap flex-shrink-0
                ${selectedValue === option.value
                  ? 'bg-indigo-500 border-indigo-400 text-white shadow-md'
                  : 'bg-gray-700 border-gray-600 text-gray-300 hover:enabled:bg-gray-600 hover:enabled:border-gray-500'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
              aria-pressed={selectedValue === option.value}
            >
              <div className="flex items-center gap-1 relative group">
                <span>{option.label}</span>
                {option.tooltip && (
                  <span className="text-xs text-gray-400 cursor-pointer group-hover:text-white">
                    ⓘ
                    <div className="absolute left-0 top-4 z-50 hidden group-hover:block bg-black/90 text-white text-xs p-2 rounded shadow-lg w-44">
                      {option.tooltip}
                    </div>
                  </span>
                )}
              </div>
            </button>
          ))}
          {allowCustom && (
            <button
              onClick={() => {
                if (disabled) return;
                setCustomActive(true);
                if (!customDraft) {
                  onChange('');
                }
              }}
              disabled={disabled}
              className={`
                px-3 py-1.5 text-sm font-medium rounded-full transition-all duration-200 ease-in-out
                border whitespace-nowrap flex-shrink-0
                ${(customActive || isCustomValue)
                  ? 'bg-sky-500 border-sky-400 text-white shadow-md'
                  : 'bg-gray-700 border-gray-600 text-gray-300 hover:enabled:bg-gray-600 hover:enabled:border-gray-500'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              ✏️ {customLabel}
            </button>
          )}
        </div>
        {allowCustom && customActive && (
          <input
            type="text"
            value={customDraft}
            onChange={(event) => handleCustomChange(event.target.value)}
            placeholder={customPlaceholder}
            disabled={disabled}
            className="mt-2 w-full rounded-md border border-white/20 bg-gray-800 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 disabled:opacity-50"
          />
        )}
      </div>
    </div>
  );
};

export default ChipSelectGroup;
