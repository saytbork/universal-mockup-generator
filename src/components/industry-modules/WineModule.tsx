import React, { useState } from 'react';
import { Chip } from '@/components/ui/Chip';
import {
  WINE_ACTION_OPTIONS,
  WINE_ENVIRONMENT_PRESETS,
  WINE_LIGHTING_TONES,
  WINE_MODIFIERS,
  WINE_POUR_STYLE_OPTIONS,
} from '@/lib/productStudio/winePrestige';
import type { WineAction, WinePourStyle } from '@/lib/productStudio/types';
import { useProductStudioStore } from '@/lib/productStudio/store';

type WineTypeUI =
  | 'auto'
  | 'white'
  | 'red'
  | 'rosé'
  | 'sparkling-white'
  | 'sparkling-rosé';

type WineClosureTypeUI =
  | 'from-reference'
  | 'natural-cork'
  | 'crown-cap'
  | 'screw-cap'
  | 'cork-with-cage'
  | 'synthetic-closure';

type WineGlassFillLevelUI = 'none' | 'quarter' | 'half' | 'three-quarters';
type WineCarbonationUI = 'none' | 'subtle' | 'visible';

const WINE_CLOSURE_OPTIONS: Array<{ value: WineClosureTypeUI; label: string }> = [
  { value: 'from-reference', label: 'From Reference' },
  { value: 'natural-cork', label: 'Cork' },
  { value: 'crown-cap', label: 'Crown' },
  { value: 'screw-cap', label: 'Screw' },
  { value: 'cork-with-cage', label: 'Champagne Wire Cork' },
  { value: 'synthetic-closure', label: 'Synthetic' },
];

const WINE_CARBONATION_OPTIONS: Array<{ value: WineCarbonationUI; label: string }> = [
  { value: 'none', label: 'None' },
  { value: 'subtle', label: 'Subtle' },
  { value: 'visible', label: 'Visible' },
];

const WINE_GLASS_FILL_OPTIONS: Array<{ value: WineGlassFillLevelUI; label: string }> = [
  { value: 'none', label: 'None' },
  { value: 'quarter', label: 'Quarter' },
  { value: 'half', label: 'Half' },
  { value: 'three-quarters', label: 'Three-Quarters' },
];

type WineModuleProps = {
  wineAction: WineAction;
  winePourStyle: WinePourStyle;
  contextPreset: string;
  wineLightingTone: string;
  wineMoodModifier: string;
  onWineActionChange: (action: WineAction) => void;
  onWinePourStyleChange: (style: WinePourStyle) => void;
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
  const wineType = (useProductStudioStore((s) => (s as any).wineType) || 'auto') as WineTypeUI;
  const wineClosureType = (useProductStudioStore((s) => (s as any).wineClosureType) || 'from-reference') as WineClosureTypeUI;
  const wineBottleState = (useProductStudioStore((s) => (s as any).wineBottleState) || 'opened-with-cork-nearby') as string;
  const wineGlassMode = (useProductStudioStore((s) => (s as any).wineGlassMode) || 'none') as string;
  const wineServeAmount = (useProductStudioStore((s) => (s as any).wineServeAmount) || 'standard') as string;
  const carbonationLevel = (useProductStudioStore((s) => (s as any).carbonationLevel) || 'none') as WineCarbonationUI;
  const wineEngineVersion = Number(useProductStudioStore((s) => (s as any).wineEngineVersion) || 3);

  const currentGlassFillLevel: WineGlassFillLevelUI =
    wineGlassMode !== 'filled'
      ? 'none'
      : wineServeAmount === 'taste'
        ? 'quarter'
        : wineServeAmount === 'generous'
          ? 'three-quarters'
          : 'half';

  const setWineUiState = (patch: Record<string, unknown>): void => {
    useProductStudioStore.setState(patch as any);
  };

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
          <div>
            <p className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold mb-2">Closure Type</p>
            <div className="flex flex-wrap gap-2">
              {WINE_CLOSURE_OPTIONS.map((option) => (
                <Chip
                  key={option.value}
                  selected={wineClosureType === option.value}
                  onClick={() => setWineUiState({ wineClosureType: option.value })}
                >
                  {option.label}
                </Chip>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold mb-2">Glass Fill Level</p>
            <div className="flex flex-wrap gap-2">
              {WINE_GLASS_FILL_OPTIONS.map((option) => (
                <Chip
                  key={option.value}
                  selected={currentGlassFillLevel === option.value}
                  onClick={() => {
                    if (option.value === 'none') {
                      setWineUiState({ wineGlassMode: 'none' });
                      return;
                    }
                    const serveAmount =
                      option.value === 'quarter'
                        ? 'taste'
                        : option.value === 'three-quarters'
                          ? 'generous'
                          : 'standard';
                    setWineUiState({
                      wineGlassMode: 'filled',
                      wineServeAmount: serveAmount,
                      wineBottleState:
                        wineBottleState === 'sealed' ? 'opened-with-cork-nearby' : wineBottleState,
                    });
                  }}
                >
                  {option.label}
                </Chip>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold mb-2">Sparkling</p>
            <div className="flex flex-wrap gap-2">
              {WINE_CARBONATION_OPTIONS.map((option) => (
                <Chip
                  key={option.value}
                  selected={carbonationLevel === option.value}
                  onClick={() => setWineUiState({ carbonationLevel: option.value })}
                >
                  {option.label}
                </Chip>
              ))}
            </div>
          </div>
          {wineEngineVersion >= 4 && (
            <div className="text-[11px] text-gray-500">
              Wine Engine v{wineEngineVersion} active
              {wineEngineVersion === 4 ? '.2' : ''}
            </div>
          )}
          <div className="hidden">{wineType}</div>
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
