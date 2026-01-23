
import React from 'react';
import { normalizeOptions } from '../src/system/normalizeOptions';
import { Option } from '../types';

interface OptionSelectProps {
  label: string;
  options: Option[];
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  disabled?: boolean;
}

const OptionSelect: React.FC<OptionSelectProps> = ({ label, options, value, onChange, disabled = false }) => {
  const normalizedOptions = normalizeOptions(options);
  const selectedOption = normalizedOptions.find(option => option.value === value);

  return (
    <div className="flex flex-col space-y-2">
      <label className="text-sm font-medium text-gray-600">
        <div className="flex items-center gap-1 relative group">
          <span>{label}</span>
          {selectedOption?.tooltip && (
            <span className="text-xs text-gray-600 cursor-pointer group-hover:text-gray-900">
              ⓘ
              <div className="absolute left-0 top-4 z-50 hidden group-hover:block bg-white text-gray-900 text-xs p-2 rounded-2xl border border-gray-200 shadow-sm w-44">
                {selectedOption.tooltip}
              </div>
            </span>
          )}
        </div>
      </label>
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="bg-whiteGlass border border-gray-200 rounded-2xl p-2 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-600 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {normalizedOptions.map((option) => (
          <option key={option.value} value={option.value} title={option.tooltip || option.label}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default OptionSelect;
