import React from 'react';
import { normalizeOptions } from '../src/system/normalizeOptions';
import { Option } from '../types';
import { Tooltip, TooltipTrigger, TooltipContent } from '../src/components/ui/tooltip';

interface ChipSelectGroupProps {
  label?: string;
  options: Option[];
  selectedValue: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  allowCustom?: boolean;
  customLabel?: string;
  customPlaceholder?: string;
  labelTooltip?: string;
  compact?: boolean;
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
  labelTooltip,
  compact = false,
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

  // Updated chip styles to match reference design
  const chipBase = compact
    ? 'rounded-xl border px-3 py-1 text-[10px] font-bold transition-all duration-400'
    : 'rounded-xl border px-4 py-2 text-[10px] font-bold transition-all duration-400';

  const chipInactive =
    'border-gray-200 dark:border-white/5 bg-white dark:bg-zinc-900/50 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-white/20';

  const chipActive =
    'border-indigo-600 bg-indigo-600 text-white shadow-lg';

  const chipDisabled =
    'opacity-50 cursor-not-allowed pointer-events-none bg-gray-100 dark:bg-zinc-800 text-gray-400 border-gray-200 dark:border-white/5';

  return (
    <div className="flex flex-col space-y-3">
      {label && (
        <div className="flex items-center gap-2">
          <label className="text-[10px] uppercase tracking-[0.2em] text-gray-500 dark:text-white/30 font-extrabold">{label}</label>
          {labelTooltip && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="h-5 w-5 rounded-full border border-gray-200 dark:border-white/10 bg-white dark:bg-zinc-900 text-[10px] font-semibold text-gray-400 transition hover:border-indigo-500 hover:text-indigo-500 focus:outline-none"
                  aria-label={`${label} info`}
                >
                  ?
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs text-sm opacity-90">
                {labelTooltip}
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      )}
      <div>
        <div className="flex flex-wrap gap-2">
          {normalizedOptions.map((option) => {
            const tooltip = option.tooltip || null;
            const isActive = selectedValue === option.value;
            const normalizedLabel = option.label;

            return (
              <Tooltip key={option.value}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    disabled={disabled}
                    className={[
                      chipBase,
                      disabled ? chipDisabled : (isActive ? chipActive : chipInactive),
                      disabled ? '' : 'cursor-pointer',
                    ].join(' ')}
                    onClick={() => onChange(option.value)}
                  >
                    {normalizedLabel}
                  </button>
                </TooltipTrigger>

                {tooltip && (
                  <TooltipContent side="right" className="max-w-xs text-sm opacity-90">
                    {tooltip}
                  </TooltipContent>
                )}
              </Tooltip>
            );
          })}
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
                ${chipBase}
                whitespace-nowrap
                ${(customActive || isCustomValue) ? chipActive : chipInactive}
                ${disabled ? '' : 'cursor-pointer'}
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
            className="mt-3 w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-gray-800 dark:text-white placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
          />
        )}
      </div>
    </div>
  );
};

export default ChipSelectGroup;
