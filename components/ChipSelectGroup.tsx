import React from 'react';
import { normalizeOptions } from '../src/system/normalizeOptions';
import { Option } from '../types';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

interface ChipSelectGroupProps {
  label: string;
  options: Option[];
  selectedValue: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  allowCustom?: boolean;
  customLabel?: string;
  customPlaceholder?: string;
  labelTooltip?: string;
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

  const chipBase =
    'rounded-full px-3 py-1.5 text-xs font-medium border transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-bg';
  const chipInactive =
    'bg-surface text-textSecondary border-borderSubtle hover:border-accent hover:text-textPrimary';
  const chipActive =
    'bg-accent text-white border-accent shadow-accent-glow scale-105 duration-500';
  const chipDisabled =
    'opacity-50 cursor-not-allowed pointer-events-none bg-surfaceTint text-textMuted border-borderSubtle';

  return (
    <div className="flex flex-col space-y-3">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-textSecondary">{label}</label>
        {labelTooltip && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="h-6 w-6 rounded-full border border-borderSubtle bg-surface text-xs font-semibold text-textSecondary transition hover:border-accent hover:text-textPrimary focus:outline-none focus:ring-2 focus:ring-accent"
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
      <div>
        <div className="flex flex-nowrap lg:flex-wrap gap-2 py-2 overflow-x-auto lg:overflow-visible custom-scrollbar">
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
                whitespace-nowrap flex-shrink-0
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
            className="mt-2 w-full rounded-apple border border-borderSubtle bg-surfaceElevated px-3 py-2 text-sm text-textPrimary placeholder:text-textMuted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-50"
          />
        )}
      </div>
    </div>
  );
};

export default ChipSelectGroup;
