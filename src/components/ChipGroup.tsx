import React from 'react';

export interface ChipGroupProps {
  label?: string;
  options: string[];
  value: string;
  disabled?: boolean;
  onChange: (val: string) => void;
}

const ChipGroup: React.FC<ChipGroupProps> = ({ label, options, value, disabled = false, onChange }) => (
  <div className="space-y-3 animate-slide-up">
    {label && <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 dark:text-white/30 font-extrabold mb-1">{label}</p>}
    <div className="flex flex-wrap gap-2">
      {options.map(option => {
        const isActive = option === value;
        const baseClass =
          'rounded-xl border px-4 py-2 text-[10px] font-bold transition-all duration-400';
        const activeClass = 'border-indigo-600 bg-indigo-600 text-white shadow-lg';
        const inactiveClass = 'border-gray-200 dark:border-white/5 bg-white dark:bg-zinc-900/50 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-white/20';
        const disabledClass = 'opacity-40 cursor-not-allowed pointer-events-none';
        return (
          <button
            key={option}
            type="button"
            className={`${baseClass} ${isActive ? activeClass : inactiveClass} ${disabled ? disabledClass : ''}`}
            onClick={() => !disabled && onChange(option)}
          >
            {option}
          </button>
        );
      })}
    </div>
  </div>
);

export default ChipGroup;
