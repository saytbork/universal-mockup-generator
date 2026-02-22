import React, { useState } from 'react';
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
  hasReferenceProduct?: boolean;
  contextPreset: string;
  wineLightingTone: string;
  wineMoodModifier: string;
  onWineActionChange: (action: WineAction) => void;
  onWinePourStyleChange: (style: WinePourStyle) => void;
  onWineTypeChange: (type: WineType) => void;
  onWineClosureTypeChange: (type: WineClosureType) => void;
  onWineBottleStateChange: (bottleState: WineBottleState) => void;
  onWineGlassModeChange: (glassMode: WineGlassMode) => void;
  onContextPresetChange: (preset: string) => void;
  onWineLightingToneChange: (tone: string) => void;
  onWineMoodModifierChange: (modifier: string) => void;
};

export function WineModule({
  wineAction,
  winePourStyle,
  contextPreset,
  wineLightingTone,
  wineMoodModifier,
  onWineActionChange,
  onWinePourStyleChange,
  onContextPresetChange,
  onWineLightingToneChange,
  onWineMoodModifierChange,
}: WineModuleProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between text-left"
      >
        <p className="text-xs uppercase tracking-[0.2em] font-extrabold text-gray-500">WINE MODULE</p>
        <span className="text-[11px] font-semibold text-gray-500">{isOpen ? 'Hide' : 'Show'}</span>
      </button>

      {isOpen && (
        <div className="mt-4 space-y-4">
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
      )}
    </div>
  );
}
