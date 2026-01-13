import React from 'react';
import { Chip } from './Chip';

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

export default function ChipSelect({ options, value, onChange, disabled = false }: ChipSelectProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(option => {
        const isDisabled = disabled || Boolean(option.disabled);
        const isSelected = value === option.value;
        return (
          <Chip
            key={option.value}
            disabled={isDisabled}
            selected={isSelected}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </Chip>
        );
      })}
    </div>
  );
}
