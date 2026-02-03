import React from 'react';
import CustomClothesSelector from './CustomClothesSelector';
import UGCExpressionsSelector from './UGCExpressionsSelector';
import ImperfectLightingControls from './ImperfectLightingControls';
import BlurGrainControls from './BlurGrainControls';
import { normalizeOptions } from '../src/system/normalizeOptions';
import type {
  UGCCustomClothingPreset,
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
  onUploadClothing: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClearClothing: () => void;
  clothingPreview: string | null;
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
          <p className="text-xs uppercase tracking-[0.3em] text-indigo-600">UGC Real Mode</p>
          <p className="text-sm text-gray-600">Switch to a raw, imperfect creator workspace.</p>
        </div>
        <button
          type="button"
          onClick={() => onToggle(!enabled)}
          disabled={panelDisabled}
          className={`relative h-6 w-11 rounded-full transition ${enabled ? 'bg-indigo-600 text-white' : 'bg-whiteTint'
            } ${panelDisabled ? 'opacity-40 cursor-not-allowed' : ''}`}
        >
          <span
            className={`absolute left-1 top-1 block h-4 w-4 rounded-full bg-white shadow transition ${enabled ? 'translate-x-5' : ''
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
          <CustomClothesSelector
            presets={normalizedClothing}
            selectedPresetIds={selectedClothingPresetIds}
            onTogglePreset={onToggleClothingPreset}
            onUpload={onUploadClothing}
            onClearUpload={onClearClothing}
            uploadPreview={clothingPreview}
          />
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
