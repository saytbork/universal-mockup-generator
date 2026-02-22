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
  onBottlePresentationModeChange?: (mode: BottlePresentationMode) => void;
  onContextPresetChange: (preset: string) => void;
  onWineLightingToneChange: (tone: string) => void;
  onWineMoodModifierChange: (modifier: string) => void;
};

type BottlePresentationMode =
  | 'sealed'
  | 'open'
  | 'open-glass-empty'
  | 'open-glass-served';

const BOTTLE_PRESENTATION_OPTIONS: Array<{ value: BottlePresentationMode; label: string }> = [
  { value: 'sealed', label: 'Sealed' },
  { value: 'open', label: 'Open' },
  { value: 'open-glass-empty', label: 'Open + Empty Glass' },
  { value: 'open-glass-served', label: 'Served' },
];

function resolveBottlePresentationMode(
  bottleState: WineBottleState,
  glassMode: WineGlassMode
): BottlePresentationMode {
  if (bottleState === 'sealed') return 'sealed';
  if (glassMode === 'filled') return 'open-glass-served';
  if (glassMode === 'empty') return 'open-glass-empty';
  return 'open';
}

export function WineModule({
  wineAction,
  wineBottleState,
  wineGlassMode,
  winePourStyle,
  hasReferenceProduct,
  contextPreset,
  wineLightingTone,
  wineMoodModifier,
  onWineActionChange,
  onBottlePresentationModeChange,
  onWinePourStyleChange,
  onContextPresetChange,
  onWineLightingToneChange,
  onWineMoodModifierChange,
}: WineModuleProps) {
  const [isOpen, setIsOpen] = useState(true);
  const bottlePresentationMode = resolveBottlePresentationMode(wineBottleState, wineGlassMode);
  const pourStyleDisabled = wineAction !== 'controlled-pour' || bottlePresentationMode === 'sealed';
  const glassDependentControlsDisabled = bottlePresentationMode === 'sealed';
  const disabledTitle = 'Not compatible with current bottle state.';

  const chipClass = (selected: boolean, disabled = false): string => {
    if (disabled) return '!opacity-50 !cursor-not-allowed !bg-gray-50 !border-gray-200 !text-gray-400';
    return selected
      ? '!bg-[var(--studio-accent)] !border-[var(--studio-accent)] !text-white'
      : '!bg-white !border-gray-200 !text-gray-600 hover:!border-[var(--studio-accent)]';
  };

  const applyBottlePresentationMode = (mode: BottlePresentationMode): void => {
    onBottlePresentationModeChange?.(mode);
  };

  const handleWineActionChange = (action: WineAction): void => {
    onWineActionChange(action);
    if (action === 'controlled-pour' && bottlePresentationMode !== 'open-glass-served') {
      applyBottlePresentationMode('open-glass-served');
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between text-left"
      >
        <p className="text-xs uppercase tracking-[0.35em] font-semibold text-gray-500">WINE MODULE</p>
        <span className="text-[11px] font-semibold text-gray-500">{isOpen ? 'Hide' : 'Show'}</span>
      </button>

      <div className={`mt-4 space-y-4 ${isOpen ? '' : 'hidden'}`}>
          <div>
            <p className="text-xs font-semibold text-gray-600 mb-2">Bottle Presentation</p>
            <div className="flex flex-wrap gap-2">
              {BOTTLE_PRESENTATION_OPTIONS.map((option) => (
                (() => {
                  const isDisabled = !hasReferenceProduct;
                  return (
                <Chip
                  key={option.value}
                  selected={bottlePresentationMode === option.value}
                  onClick={() => applyBottlePresentationMode(option.value)}
                  className={chipClass(bottlePresentationMode === option.value, isDisabled)}
                  disabled={isDisabled}
                  title={isDisabled ? disabledTitle : undefined}
                >
                  {option.label}
                </Chip>
                  );
                })()
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-600 mb-2">Wine Action</p>
            <div className="flex flex-wrap gap-2">
              {WINE_ACTION_OPTIONS.map((action) => (
                (() => {
                  const isDisabled = false;
                  return (
                <Chip
                  key={action}
                  selected={wineAction === action}
                  onClick={() => handleWineActionChange(action)}
                  className={chipClass(wineAction === action, isDisabled)}
                  disabled={isDisabled}
                  title={isDisabled ? disabledTitle : undefined}
                >
                  {action === 'static-presentation' ? 'Static Presentation' : 'Controlled Pour'}
                </Chip>
                  );
                })()
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-600 mb-2">Environment Preset</p>
            <div className="flex flex-wrap gap-2">
              {WINE_ENVIRONMENT_PRESETS.map((preset) => (
                (() => {
                  const isDisabled = false;
                  return (
                <Chip
                  key={preset}
                  selected={String(contextPreset || '').trim() === preset}
                  onClick={() => onContextPresetChange(preset)}
                  className={chipClass(String(contextPreset || '').trim() === preset, isDisabled)}
                  disabled={isDisabled}
                  title={isDisabled ? disabledTitle : undefined}
                >
                  {preset}
                </Chip>
                  );
                })()
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-600 mb-2">Pour Style</p>
            <div className="flex flex-wrap gap-2">
              {WINE_POUR_STYLE_OPTIONS.map((style) => (
                (() => {
                  const isDisabled = pourStyleDisabled;
                  return (
                <Chip
                  key={style}
                  selected={winePourStyle === style}
                  onClick={() => onWinePourStyleChange(style)}
                  disabled={isDisabled}
                  className={chipClass(winePourStyle === style, isDisabled)}
                  title={isDisabled ? disabledTitle : undefined}
                >
                  {style === 'slow-ribbon'
                    ? 'Slow Ribbon'
                    : style === 'mid-flow-elegance'
                    ? 'Mid-flow Elegance'
                    : 'Peak Glass Impact'}
                </Chip>
                  );
                })()
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-600 mb-2">Lighting Tone</p>
            <div className="flex flex-wrap gap-2">
              {WINE_LIGHTING_TONES.map((tone) => (
                (() => {
                  const isDisabled = glassDependentControlsDisabled;
                  return (
                <Chip
                  key={tone}
                  selected={wineLightingTone === tone}
                  onClick={() => onWineLightingToneChange(tone)}
                  disabled={isDisabled}
                  className={chipClass(wineLightingTone === tone, isDisabled)}
                  title={isDisabled ? disabledTitle : undefined}
                >
                  {tone}
                </Chip>
                  );
                })()
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-600 mb-2">Mood Modifier</p>
            <div className="flex flex-wrap gap-2">
              {WINE_MODIFIERS.map((modifier) => (
                (() => {
                  const isDisabled = false;
                  return (
                <Chip
                  key={modifier}
                  selected={wineMoodModifier === modifier}
                  onClick={() => onWineMoodModifierChange(modifier)}
                  className={chipClass(wineMoodModifier === modifier, isDisabled)}
                  disabled={isDisabled}
                  title={isDisabled ? disabledTitle : undefined}
                >
                  {modifier}
                </Chip>
                  );
                })()
              ))}
            </div>
          </div>
      </div>
    </div>
  );
}
