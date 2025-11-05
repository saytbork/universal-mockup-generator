import React from 'react';
import { Option } from '../types';

interface ChipSelectGroupProps {
  label: string;
  options: Option[];
  selectedValue: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const ChipSelectGroup: React.FC<ChipSelectGroupProps> = ({ label, options, selectedValue, onChange, disabled = false }) => {
  return (
    <div className="flex flex-col space-y-3">
      <label className="text-sm font-medium text-gray-400">{label}</label>
      <div>
        <div className="flex flex-nowrap lg:flex-wrap gap-2 py-2 overflow-x-auto lg:overflow-visible custom-scrollbar">
          {options.map((option) => (
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
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChipSelectGroup;