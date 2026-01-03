import React from 'react';

type ChipOption = {
  label: string;
  value: string;
  disabled?: boolean;
};

type ChipSelectProps = {
  options: ChipOption[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

const getChipTextSize = (label: string) => {
  const wordCount = label.trim().split(/\s+/).filter(Boolean).length;
  return wordCount > 2 ? 'text-xs sm:text-sm' : 'text-xs';
};

const getChipClassName = (isSelected: boolean, label: string, isDisabled: boolean) => {
  const base = `rounded-full px-3 py-1.5 ${getChipTextSize(label)} font-medium border transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-bg`;
  const inactive = 'bg-bg/40 text-textSecondary border-borderSubtle hover:border-accent hover:text-textPrimary';
  const active = 'bg-accent text-white border-accent hover:bg-accent/90 scale-105 duration-500';
  const disabled = 'opacity-50 cursor-not-allowed pointer-events-none bg-bg/30 text-textMuted border-borderSubtle';
  return [base, isDisabled ? disabled : (isSelected ? active : inactive)].join(' ');
};

export default function ChipSelect({ options, value, onChange, disabled = false }: ChipSelectProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(option => {
        const isDisabled = disabled || Boolean(option.disabled);
        const isSelected = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            disabled={isDisabled}
            className={getChipClassName(isSelected, option.label, isDisabled)}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

