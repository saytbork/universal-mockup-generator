import React from 'react';

interface BlurGrainControlsProps {
  blur: number;
  grain: number;
  onBlurChange: (value: number) => void;
  onGrainChange: (value: number) => void;
  disabled?: boolean;
}

const Slider = ({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}) => (
  <div className="flex flex-col gap-1">
    <div className="flex items-center justify-between text-xs text-textSecondary">
      <span>{label}</span>
      <span className="text-textPrimary">{value}</span>
    </div>
    <input
      type="range"
      min={0}
      max={100}
      value={value}
      disabled={disabled}
      onChange={event => onChange(Number(event.target.value))}
      className="w-full accent-accent"
    />
  </div>
);

const BlurGrainControls: React.FC<BlurGrainControlsProps> = ({
  blur,
  grain,
  onBlurChange,
  onGrainChange,
  disabled = false,
}) => {
  return (
    <div className={`rounded-2xl border border-borderSubtle bg-surfaceTint p-4 space-y-3 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <p className="text-xs uppercase tracking-[0.3em] text-accent">Blur & grain</p>
      <Slider label="Focus blur" value={blur} onChange={onBlurChange} disabled={disabled} />
      <Slider label="Grain" value={grain} onChange={onGrainChange} disabled={disabled} />
      <p className="text-[11px] text-textSecondary">Push blur/grain for raw smartphone energy.</p>
    </div>
  );
};

export default BlurGrainControls;
