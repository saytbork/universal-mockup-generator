import React from 'react';

export interface SliderControlProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  onChange: (val: number) => void;
}

const SliderControl: React.FC<SliderControlProps> = ({
  label,
  value,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  onChange,
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(event.target.value));
  };

  const wrapperClass = `mb-4 ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`;
  const printClass = 'text-xs font-medium text-textSecondary';
  const valueClass = 'text-xs text-textSecondary';
  const trackClass = 'w-full h-1.5 rounded-full bg-surfaceTint';
  const inputClass =
    'appearance-none w-full h-1.5 bg-transparent cursor-pointer focus:ring-2 focus:ring-accent transition-all duration-200 ease-out';

  return (
    <div className={wrapperClass}>
      <div className="flex justify-between items-center mb-1">
        <span className={printClass}>{label}</span>
        <span className={valueClass}>{value}</span>
      </div>
      <div className="relative">
        <div className={trackClass} />
        <input
          type="range"
          className={inputClass}
          style={{ accentColor: 'var(--accent)' }}
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          onChange={handleChange}
        />
      </div>
    </div>
  );
};

export default SliderControl;
