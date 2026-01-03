import React from 'react';
import { normalizeOptions } from '../src/system/normalizeOptions';
import type { UGCCameraFramingOption } from '../src/data/ugcPresets';

interface ImperfectLightingControlsProps {
  lowResolution: boolean;
  onLowResolutionToggle: (value: boolean) => void;
  imperfectLighting: boolean;
  onImperfectLightingToggle: (value: boolean) => void;
  offFocus: boolean;
  onOffFocusToggle: (value: boolean) => void;
  tiltedPhone: boolean;
  onTiltedPhoneToggle: (value: boolean) => void;
  offCenterOptions: UGCCameraFramingOption[];
  selectedOffCenterId: string;
  onSelectOffCenter: (id: string) => void;
  framingOptions: UGCCameraFramingOption[];
  selectedFramingId: string;
  onSelectFraming: (id: string) => void;
  disabled?: boolean;
}

const ToggleRow = ({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) => (
  <label className="flex items-center justify-between gap-3 rounded-xl border border-borderSubtle bg-surfaceElevated px-3 py-2">
    <div>
      <p className="text-sm text-textPrimary">{label}</p>
      <p className="text-[11px] text-textSecondary">{description}</p>
    </div>
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`relative h-6 w-11 rounded-full transition ${value ? 'bg-accent' : 'bg-surfaceTint'}`}
    >
      <span
        className={`absolute left-1 top-1 block h-4 w-4 rounded-full bg-surface border border-borderSubtle transition ${
          value ? 'translate-x-5' : ''
        }`}
      />
    </button>
  </label>
);

const ImperfectLightingControls: React.FC<ImperfectLightingControlsProps> = ({
  lowResolution,
  onLowResolutionToggle,
  imperfectLighting,
  onImperfectLightingToggle,
  offFocus,
  onOffFocusToggle,
  tiltedPhone,
  onTiltedPhoneToggle,
  offCenterOptions,
  selectedOffCenterId,
  onSelectOffCenter,
  framingOptions,
  selectedFramingId,
  onSelectFraming,
  disabled = false,
}) => {
  const normalizedOffCenterOptions = normalizeOptions(
    offCenterOptions.map(option => ({ ...option, value: option.id }))
  );
  const normalizedFramingOptions = normalizeOptions(
    framingOptions.map(option => ({ ...option, value: option.id }))
  );

  return (
    <div className={`space-y-4 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <ToggleRow
        label="Low resolution feel"
        description="Slight pixelation + softness"
        value={lowResolution}
        onChange={onLowResolutionToggle}
      />
      <ToggleRow
        label="Imperfect lighting"
        description="Let light fall unevenly"
        value={imperfectLighting}
        onChange={onImperfectLightingToggle}
      />
      <ToggleRow
        label="Off focus"
        description="Focus bleed + lens hunting"
        value={offFocus}
        onChange={onOffFocusToggle}
      />
      <ToggleRow
        label="Tilted phone angle"
        description="Crooked horizon, in-the-moment"
        value={tiltedPhone}
        onChange={onTiltedPhoneToggle}
      />
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-accent mb-2">Off-center composition</p>
        <div className="flex flex-wrap gap-2">
          {normalizedOffCenterOptions.map(option => (
            <button
              key={option.id}
              type="button"
              onClick={() => onSelectOffCenter(option.id)}
              className={`rounded-full border px-3 py-1 text-xs transition ${
                selectedOffCenterId === option.id
                  ? 'border-accent bg-accent/10 text-accent shadow-accent-glow scale-105 duration-500'
                  : 'border-borderSubtle bg-surfaceElevated text-textSecondary hover:border-accent hover:text-textPrimary'
              }`}
            >
              <div className="flex items-center gap-1 relative group">
                <span>{option.label}</span>
                {option.tooltip && (
                  <span className="text-xs text-textSecondary cursor-pointer group-hover:text-textPrimary">
                    ⓘ
                    <div className="absolute left-0 top-4 z-50 hidden group-hover:block bg-surface text-textPrimary text-xs p-2 rounded-apple border border-borderSubtle shadow-sm w-44">
                      {option.tooltip}
                    </div>
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-accent mb-2">Spontaneous framing</p>
        <div className="flex flex-wrap gap-2">
          {normalizedFramingOptions.map(option => (
            <button
              key={option.id}
              type="button"
              onClick={() => onSelectFraming(option.id)}
              className={`rounded-full border px-3 py-1 text-xs transition ${
                selectedFramingId === option.id
                  ? 'border-accent bg-accent/10 text-accent shadow-accent-glow scale-105 duration-500'
                  : 'border-borderSubtle bg-surfaceElevated text-textSecondary hover:border-accent hover:text-textPrimary'
              }`}
            >
              <div className="flex items-center gap-1 relative group">
                <span>{option.label}</span>
                {option.tooltip && (
                  <span className="text-xs text-textSecondary cursor-pointer group-hover:text-textPrimary">
                    ⓘ
                    <div className="absolute left-0 top-4 z-50 hidden group-hover:block bg-surface text-textPrimary text-xs p-2 rounded-apple border border-borderSubtle shadow-sm w-44">
                      {option.tooltip}
                    </div>
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImperfectLightingControls;
