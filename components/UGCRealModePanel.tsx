import React from 'react';
import CustomClothesSelector from './CustomClothesSelector';
import UGCExpressionsSelector from './UGCExpressionsSelector';
import ImperfectLightingControls from './ImperfectLightingControls';
import BlurGrainControls from './BlurGrainControls';
import { normalizeOptions } from '../src/system/normalizeOptions';
import type {
  UGCCustomClothingPreset,
  UGCRealityPreset,
  UGCHeroPersonaPreset,
  UGCExpressionPreset,
  UGCCameraFramingOption,
} from '../src/data/ugcPresets';

function cleanDescription(text = "") {
  return text
    .replace(/raw iphone/gi, "natural mobile style")
    .replace(/ugly|bad|wrong|messy|awful/gi, "")
    .replace(/pinterest|tiktok|instagram/gi, "")
    .replace(/moodboard|inspiration ref/gi, "")
    .replace(/reference/gi, "")
    .replace(/inspired by/gi, "")
    .replace(/hyper/gi, "high")
    .trim();
}

interface UGCRealModePanelProps {
  disabled: boolean;
  enabled: boolean;
  onToggle: (value: boolean) => void;
  clothingPresets: UGCCustomClothingPreset[];
  selectedClothingPresetIds: string[];
  onToggleClothingPreset: (id: string) => void;
  onUploadClothing: (file: File) => void;
  onClearClothing: () => void;
  clothingPreview: string | null;
  realityPresets: UGCRealityPreset[];
  selectedRealityPresetId: string;
  onSelectRealityPreset: (id: string) => void;
  heroPersonaPresets: UGCHeroPersonaPreset[];
  selectedHeroPersonaIds: string[];
  onToggleHeroPersona: (id: string) => void;
  expressionPresets: UGCExpressionPreset[];
  selectedExpressionId: string | null;
  onSelectExpression: (id: string | null) => void;
  blur: number;
  grain: number;
  onBlurChange: (value: number) => void;
  onGrainChange: (value: number) => void;
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
}

const UGCRealModePanel: React.FC<UGCRealModePanelProps> = ({
  disabled,
  enabled,
  onToggle,
  clothingPresets,
  selectedClothingPresetIds,
  onToggleClothingPreset,
  onUploadClothing,
  onClearClothing,
  clothingPreview,
  realityPresets,
  selectedRealityPresetId,
  onSelectRealityPreset,
  heroPersonaPresets,
  selectedHeroPersonaIds,
  onToggleHeroPersona,
  expressionPresets,
  selectedExpressionId,
  onSelectExpression,
  blur,
  grain,
  onBlurChange,
  onGrainChange,
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
}) => {
  const panelDisabled = disabled && !enabled;
  const normalizedRealityPresets = normalizeOptions(
    realityPresets.map(preset => ({ ...preset, value: preset.id }))
  );
  const normalizedHeroPersonaPresets = normalizeOptions(
    heroPersonaPresets.map(preset => ({ ...preset, value: preset.id }))
  );
  const normalizedExpressions = normalizeOptions(
    expressionPresets.map(preset => ({ ...preset, value: preset.id }))
  );
  const normalizedClothing = normalizeOptions(
    clothingPresets.map(preset => ({ ...preset, value: preset.id }))
  );
  const normalizedFraming = normalizeOptions(
    framingOptions.map(option => ({ ...option, value: option.id }))
  );
  const normalizedOffCenter = normalizeOptions(
    offCenterOptions.map(option => ({ ...option, value: option.id }))
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-indigo-200">UGC Real Mode</p>
          <p className="text-sm text-gray-400">Switch to a raw, imperfect creator workspace.</p>
        </div>
        <button
          type="button"
          onClick={() => onToggle(!enabled)}
          disabled={panelDisabled}
          className={`relative h-6 w-11 rounded-full transition ${
            enabled ? 'bg-amber-400/80' : 'bg-gray-600'
          } ${panelDisabled ? 'opacity-40 cursor-not-allowed' : ''}`}
        >
          <span
            className={`absolute left-1 top-1 block h-4 w-4 rounded-full bg-white shadow transition ${
              enabled ? 'translate-x-5' : ''
            }`}
          />
        </button>
      </div>
      {!enabled && (
        <p className="text-[11px] text-gray-500">
          Turn this on to hide studio presets and embrace messy, authentic UGC aesthetics.
        </p>
      )}
      {enabled && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4 space-y-3">
            <p className="text-xs uppercase tracking-[0.3em] text-indigo-200">UGC reality presets</p>
            <div className="flex flex-col gap-2 max-h-40 overflow-y-auto custom-scrollbar pr-2">
              {normalizedRealityPresets.map(preset => {
                const isActive = preset.id === selectedRealityPresetId;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => onSelectRealityPreset(preset.id)}
                    className={`rounded-xl border px-3 py-2 text-left transition ${
                      isActive ? 'border-amber-300 bg-amber-500/10 text-white' : 'border-white/15 text-gray-200 hover:border-indigo-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-1 relative group">
                      <span className="text-sm font-semibold">{preset.label}</span>
                      {preset.tooltip && (
                        <span className="text-xs text-gray-400 cursor-pointer group-hover:text-white">
                          ⓘ
                          <div className="absolute left-0 top-4 z-50 hidden group-hover:block bg-black/80 text-white text-xs p-2 rounded shadow-lg w-48">
                            {preset.tooltip}
                          </div>
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-400">{cleanDescription(preset.description)}</p>
                  </button>
                );
              })}
            </div>
          </div>
          <CustomClothesSelector
            presets={normalizedClothing}
            selectedPresetIds={selectedClothingPresetIds}
            onTogglePreset={onToggleClothingPreset}
            onUpload={onUploadClothing}
            onClearUpload={onClearClothing}
            uploadPreview={clothingPreview}
          />
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4 space-y-3">
            <p className="text-xs uppercase tracking-[0.3em] text-indigo-200">Hero personas</p>
            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
              {normalizedHeroPersonaPresets.map(preset => {
                const isActive = selectedHeroPersonaIds.includes(preset.id);
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => onToggleHeroPersona(preset.id)}
                    className={`rounded-xl border px-3 py-2 text-left transition ${
                      isActive ? 'border-amber-300 bg-amber-500/10 text-white' : 'border-white/15 text-gray-200 hover:border-indigo-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-1 relative group">
                      <span className="text-sm font-semibold">{preset.label}</span>
                      {preset.tooltip && (
                        <span className="text-xs text-gray-400 cursor-pointer group-hover:text-white">
                          ⓘ
                          <div className="absolute left-0 top-4 z-50 hidden group-hover:block bg-black/80 text-white text-xs p-2 rounded shadow-lg w-48">
                            {preset.tooltip}
                          </div>
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-400">{cleanDescription(preset.description)}</p>
                  </button>
                );
              })}
            </div>
          </div>
          <UGCExpressionsSelector
            presets={normalizedExpressions}
            selectedId={selectedExpressionId}
            onSelect={onSelectExpression}
          />
          <ImperfectLightingControls
            lowResolution={lowResolution}
            onLowResolutionToggle={onLowResolutionToggle}
            imperfectLighting={imperfectLighting}
            onImperfectLightingToggle={onImperfectLightingToggle}
            offFocus={offFocus}
            onOffFocusToggle={onOffFocusToggle}
            tiltedPhone={tiltedPhone}
            onTiltedPhoneToggle={onTiltedPhoneToggle}
            offCenterOptions={normalizedOffCenter}
            selectedOffCenterId={selectedOffCenterId}
            onSelectOffCenter={onSelectOffCenter}
            framingOptions={normalizedFraming}
            selectedFramingId={selectedFramingId}
            onSelectFraming={onSelectFraming}
          />
          <BlurGrainControls
            blur={blur}
            grain={grain}
            onBlurChange={onBlurChange}
            onGrainChange={onGrainChange}
          />
        </div>
      )}
    </div>
  );
};

export default UGCRealModePanel;
