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
  const base = `rounded-xl px-4 py-2 text-[10px] font-bold border transition-all duration-400 focus:outline-none`;
  const inactive = 'border-gray-200 dark:border-white/5 bg-white dark:bg-zinc-900/50 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-white/20';
  const active = 'border-indigo-600 bg-indigo-600 text-white shadow-lg';
  const disabled = 'opacity-50 cursor-not-allowed pointer-events-none bg-gray-100 dark:bg-zinc-800 text-gray-400 border-gray-200 dark:border-white/5';
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
