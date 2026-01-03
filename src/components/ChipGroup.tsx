import React from 'react';

export interface ChipGroupProps {
  label?: string;
  options: string[];
  value: string;
  disabled?: boolean;
  onChange: (val: string) => void;
}

const ChipGroup: React.FC<ChipGroupProps> = ({ label, options, value, disabled = false, onChange }) => (
  <div className="space-y-2">
    {label && <p className="text-xs font-medium text-textSecondary uppercase tracking-[0.4em]">{label}</p>}
    <div className="flex flex-wrap gap-2">
      {options.map(option => {
        const isActive = option === value;
        const baseClass =
          'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors duration-200 ease-out hover:border-accent hover:text-textPrimary active:scale-[0.97]';
        const activeClass = 'bg-accent/10 text-accent border-accent shadow-accent-glow scale-105 duration-500';
        const inactiveClass = 'bg-surfaceElevated text-textSecondary border-borderSubtle';
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
