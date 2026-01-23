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
  <label className="flex items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-900/40">
    <div>
      <p className="text-sm text-gray-900 dark:text-gray-100">{label}</p>
      <p className="text-[11px] text-gray-600 dark:text-gray-400">{description}</p>
    </div>
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`relative h-6 w-11 rounded-full border border-gray-200 transition dark:border-gray-700 ${
        value
          ? 'bg-indigo-600 text-white border-indigo-600 dark:bg-indigo-500 dark:border-indigo-500'
          : 'bg-gray-200 dark:bg-gray-700'
      }`}
    >
      <span
        className={`absolute left-1 top-1 block h-4 w-4 rounded-full bg-white border border-gray-200 transition ${
          value ? 'translate-x-5' : ''
        } dark:bg-gray-100 dark:border-gray-700`}
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
        <p className="text-xs uppercase tracking-[0.3em] text-indigo-600 mb-2">Off-center composition</p>
        <div className="flex flex-wrap gap-2">
          {normalizedOffCenterOptions.map(option => (
            <button
              key={option.id}
              type="button"
              onClick={() => onSelectOffCenter(option.id)}
              className={`rounded-full border px-3 py-1 text-xs transition ${
                selectedOffCenterId === option.id
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20 scale-105 duration-500'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-indigo-600 hover:text-gray-900 dark:bg-gray-900/40 dark:border-gray-700 dark:text-gray-300'
              }`}
            >
              <div className="flex items-center gap-1 relative group">
                <span>{option.label}</span>
                {option.tooltip && (
                  <span className="text-xs text-gray-500 cursor-pointer group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-gray-100">
                    ⓘ
                    <div className="absolute left-0 top-4 z-50 hidden group-hover:block bg-white text-gray-900 text-xs p-2 rounded-2xl border border-gray-200 shadow-sm w-44 dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700">
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
        <p className="text-xs uppercase tracking-[0.3em] text-indigo-600 mb-2">Spontaneous framing</p>
        <div className="flex flex-wrap gap-2">
          {normalizedFramingOptions.map(option => (
            <button
              key={option.id}
              type="button"
              onClick={() => onSelectFraming(option.id)}
              className={`rounded-full border px-3 py-1 text-xs transition ${
                selectedFramingId === option.id
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20 scale-105 duration-500'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-indigo-600 hover:text-gray-900 dark:bg-gray-900/40 dark:border-gray-700 dark:text-gray-300'
              }`}
            >
              <div className="flex items-center gap-1 relative group">
                <span>{option.label}</span>
                {option.tooltip && (
                  <span className="text-xs text-gray-500 cursor-pointer group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-gray-100">
                    ⓘ
                    <div className="absolute left-0 top-4 z-50 hidden group-hover:block bg-white text-gray-900 text-xs p-2 rounded-2xl border border-gray-200 shadow-sm w-44 dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700">
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
