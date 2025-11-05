
import React from 'react';
import { Option } from '../types';

interface OptionSelectProps {
  label: string;
  options: Option[];
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  disabled?: boolean;
}

const OptionSelect: React.FC<OptionSelectProps> = ({ label, options, value, onChange, disabled = false }) => {
  return (
    <div className="flex flex-col space-y-2">
      <label className="text-sm font-medium text-gray-400">{label}</label>
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="bg-gray-700 border border-gray-600 rounded-md p-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default OptionSelect;
