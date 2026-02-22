import React from 'react';
import { Chip } from '@/components/ui/Chip';
import {
  WINE_ACTION_OPTIONS,
  WINE_ENVIRONMENT_PRESETS,
  WINE_LIGHTING_TONES,
  WINE_MODIFIERS,
  WINE_POUR_STYLE_OPTIONS,
} from '@/lib/productStudio/winePrestige';
import type {
  WineAction,
  WineBottleState,
  WineClosureType,
  WineGlassMode,
  WinePourStyle,
  WineType,
} from '@/lib/productStudio/types';

type WineModuleProps = {
  wineAction: WineAction;
  winePourStyle: WinePourStyle;
  wineType: WineType;
  wineClosureType: WineClosureType;
  wineBottleState: WineBottleState;
  wineGlassMode: WineGlassMode;
  hasReferenceProduct: boolean;
  contextPreset: string;
  wineLightingTone: string;
  wineMoodModifier: string;
  onWineActionChange: (action: WineAction) => void;
  onWinePourStyleChange: (style: WinePourStyle) => void;
  onWineTypeChange: (type: WineType) => void;
  onWineClosureTypeChange: (type: WineClosureType) => void;
  onWineBottleStateChange: (state: WineBottleState) => void;
  onWineGlassModeChange: (mode: WineGlassMode) => void;
  onContextPresetChange: (preset: string) => void;
  onWineLightingToneChange: (tone: string) => void;
  onWineMoodModifierChange: (modifier: string) => void;
};

export function WineModule({
  wineAction,
  winePourStyle,
  wineType,
  wineClosureType,
  wineBottleState,
  wineGlassMode,
  hasReferenceProduct,
  contextPreset,
  wineLightingTone,
  wineMoodModifier,
  onWineActionChange,
  onWinePourStyleChange,
  onWineTypeChange,
  onWineClosureTypeChange,
  onWineBottleStateChange,
  onWineGlassModeChange,
  onContextPresetChange,
  onWineLightingToneChange,
  onWineMoodModifierChange,
}: WineModuleProps) {
  return (
    <div className="space-y-4">
      <p className="text-xs uppercase tracking-[0.2em] font-extrabold text-gray-500">WINE SETTINGS</p>

      <div>
        <p className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold mb-2">
          Wine Type {!hasReferenceProduct && <span className="text-[10px] text-red-500">Required</span>}
        </p>
        <div className="flex flex-wrap gap-2">
          {([
            { value: 'red', label: 'Red' },
            { value: 'white', label: 'White' },
            { value: 'rosé', label: 'Rosé' },
            { value: 'sparkling-white', label: 'Sparkling White' },
            { value: 'sparkling-rosé', label: 'Sparkling Rosé' },
          ] as const).map((option) => (
            <Chip
              key={option.value}
              selected={wineType === option.value}
              onClick={() => onWineTypeChange(option.value)}
            >
              {option.label}
            </Chip>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold mb-2">Closure Type</p>
        <div className="flex flex-wrap gap-2">
          {([
            { value: 'from-reference', label: 'From Reference' },
            { value: 'natural-cork', label: 'Natural Cork' },
            { value: 'crown-cap', label: 'Crown Cap' },
            { value: 'screw-cap', label: 'Screw Cap' },
            { value: 'cork-with-cage', label: 'Cork with Cage' },
          ] as const).map((option) => (
            <Chip
              key={option.value}
              selected={wineClosureType === option.value}
              onClick={() => onWineClosureTypeChange(option.value)}
            >
              {option.label}
            </Chip>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold mb-2">Bottle State</p>
        <div className="flex flex-wrap gap-2">
          {([
            { value: 'sealed', label: 'Sealed' },
            { value: 'opened-with-cork-out', label: 'Opened' },
            { value: 'opened-with-cork-nearby', label: 'Opened with Cork Nearby' },
          ] as const).map((option) => (
            <Chip
              key={option.value}
              selected={wineBottleState === option.value}
              onClick={() => {
                onWineBottleStateChange(option.value);
                if (option.value === 'sealed' && wineGlassMode === 'filled') {
                  onWineGlassModeChange('empty');
                }
              }}
            >
              {option.label}
            </Chip>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold mb-2">Glass Mode</p>
        <div className="flex flex-wrap gap-2">
          {([
            { value: 'none', label: 'None' },
            { value: 'empty', label: 'Empty' },
            { value: 'filled', label: 'Filled' },
          ] as const).map((option) => (
            <Chip
              key={option.value}
              selected={wineGlassMode === option.value}
              onClick={() => {
                onWineGlassModeChange(option.value);
                if (option.value === 'filled' && wineBottleState === 'sealed') {
                  onWineBottleStateChange('opened-with-cork-out');
                }
              }}
            >
              {option.label}
            </Chip>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold mb-2">Wine Action</p>
        <div className="flex flex-wrap gap-2">
          {WINE_ACTION_OPTIONS.map((action) => (
            <Chip
              key={action}
              selected={wineAction === action}
              onClick={() => onWineActionChange(action)}
            >
              {action === 'static-presentation' ? 'Static Presentation' : 'Controlled Pour'}
            </Chip>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold mb-2">Environment Preset</p>
        <div className="flex flex-wrap gap-2">
          {WINE_ENVIRONMENT_PRESETS.map((preset) => (
            <Chip
              key={preset}
              selected={String(contextPreset || '').trim() === preset}
              onClick={() => onContextPresetChange(preset)}
            >
              {preset}
            </Chip>
          ))}
        </div>
      </div>

      {wineAction === 'controlled-pour' && (
        <div>
          <p className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold mb-2">Pour Style</p>
          <div className="flex flex-wrap gap-2">
            {WINE_POUR_STYLE_OPTIONS.map((style) => (
              <Chip
                key={style}
                selected={winePourStyle === style}
                onClick={() => onWinePourStyleChange(style)}
              >
                {style === 'slow-ribbon'
                  ? 'Slow Ribbon'
                  : style === 'mid-flow-elegance'
                  ? 'Mid-flow Elegance'
                  : 'Peak Glass Impact'}
              </Chip>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold mb-2">Lighting Tone</p>
        <div className="flex flex-wrap gap-2">
          {WINE_LIGHTING_TONES.map((tone) => (
            <Chip
              key={tone}
              selected={wineLightingTone === tone}
              onClick={() => onWineLightingToneChange(tone)}
            >
              {tone}
            </Chip>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold mb-2">Mood Modifier</p>
        <div className="flex flex-wrap gap-2">
          {WINE_MODIFIERS.map((modifier) => (
            <Chip
              key={modifier}
              selected={wineMoodModifier === modifier}
              onClick={() => onWineMoodModifierChange(modifier)}
            >
              {modifier}
            </Chip>
          ))}
        </div>
      </div>
    </div>
  );
}
