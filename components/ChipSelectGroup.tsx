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

  const chipBase = compact
    ? 'rounded-full px-3 py-1.5 text-xs font-medium border transition-colors focus:outline-none'
    : 'rounded-full px-3 py-1.5 text-xs sm:text-sm font-medium border transition-colors focus:outline-none';

  const chipInactive =
    'bg-white text-gray-600 border-gray-200 hover:border-gray-400 ' +
    'dark:bg-white/5 dark:text-white/60 dark:border-white/10 dark:hover:border-white/30';

  const chipActive =
    'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-500 dark:bg-indigo-500 dark:border-indigo-500 dark:text-white';

  const chipDisabled =
    'opacity-50 cursor-not-allowed pointer-events-none bg-gray-50 text-gray-400 border-gray-200 ' +
    'dark:bg-white/5 dark:text-white/30 dark:border-white/10';

  return (
    <div className="flex flex-col space-y-3">
      {label && (
        <div className="flex items-center gap-2">
          <label className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-extrabold">
            {label}
          </label>
          {labelTooltip && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="h-5 w-5 rounded-full border border-gray-200 bg-white text-[10px] font-semibold text-gray-500 transition hover:border-indigo-600 hover:text-indigo-600 focus:outline-none dark:bg-gray-900/40 dark:border-gray-700"
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
	            const nativeTitle = tooltip || normalizedLabel;

	            return (
	              <Tooltip key={option.value}>
	                <TooltipTrigger asChild>
	                  <button
	                    type="button"
	                    disabled={disabled}
	                    title={nativeTitle}
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
            className="mt-3 w-full rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-white disabled:opacity-50 dark:bg-gray-900/40 dark:border-gray-700 dark:focus:ring-offset-black"
          />
        )}
      </div>
    </div>
  );
};

export default ChipSelectGroup;
