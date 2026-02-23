import React, { useEffect, useState } from 'react';
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
  WineLightingTone,
  WineMoodModifier,
  WinePourStyle,
  WineServeAmount,
  WineType,
} from '@/lib/productStudio/types';

type WineModuleProps = {
  wineAction: WineAction;
  winePourStyle: WinePourStyle;
  wineType: WineType;
  wineClosureType: WineClosureType;
  wineBottleState: WineBottleState;
  wineGlassMode: WineGlassMode;
  wineServeAmount: WineServeAmount;
  hasReferenceProduct?: boolean;
  contextPreset: string;
  wineLightingTone: WineLightingTone;
  wineMoodModifier: WineMoodModifier;
  onWineActionChange: (action: WineAction) => void;
  onWinePourStyleChange: (style: WinePourStyle) => void;
  onWineTypeChange: (type: WineType) => void;
  onWineClosureTypeChange: (type: WineClosureType) => void;
  onWineBottleStateChange: (bottleState: WineBottleState) => void;
  onWineGlassModeChange: (glassMode: WineGlassMode) => void;
  onWineServeAmountChange: (amount: WineServeAmount) => void;
  onBottlePresentationModeChange?: (mode: BottlePresentationMode) => void;
  onContextPresetChange: (preset: string) => void;
  onWineLightingToneChange: (tone: WineLightingTone) => void;
  onWineMoodModifierChange: (modifier: WineMoodModifier) => void;
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

const WINE_TYPE_OPTIONS: Array<{ value: WineType; label: string }> = [
  { value: 'auto', label: 'Auto (From Reference)' },
  { value: 'white', label: 'White' },
  { value: 'red', label: 'Red' },
  { value: 'rosé', label: 'Rose' },
  { value: 'sparkling-white', label: 'Sparkling White' },
  { value: 'sparkling-rosé', label: 'Sparkling Rose' },
];

const WINE_CLOSURE_OPTIONS: Array<{ value: WineClosureType; label: string }> = [
  { value: 'from-reference', label: 'From Reference' },
  { value: 'crown-cap', label: 'Crown Cap' },
  { value: 'screw-cap', label: 'Screw Cap' },
  { value: 'natural-cork', label: 'Natural Cork' },
  { value: 'cork-with-cage', label: 'Cork + Cage' },
  { value: 'synthetic-closure', label: 'Synthetic' },
];

const SERVE_AMOUNT_OPTIONS: Array<{ value: WineServeAmount; label: string; hint: string }> = [
  { value: 'taste', label: 'Taste', hint: 'quarter glass' },
  { value: 'standard', label: 'Standard', hint: 'half glass' },
  { value: 'generous', label: 'Generous', hint: 'three-quarters' },
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

type WineChipButtonProps = {
  selected: boolean;
  disabled?: boolean;
  title?: string;
  onClick: () => void;
  className: string;
  children: React.ReactNode;
};

function WineChipButton({
  selected,
  disabled = false,
  title,
  onClick,
  className,
  children,
}: WineChipButtonProps): React.ReactElement {
  const baseClass =
    'inline-flex max-w-full items-center gap-1 rounded-full border transition-colors whitespace-nowrap text-xs font-semibold focus:outline-none min-w-0 px-4 py-2';
  // Match the default `Chip` active tone (Tailwind indigo-600) when studio accent is not set.
  const accentColor = 'var(--studio-accent, #4f46e5)';
  const style = selected && !disabled
    ? { backgroundColor: accentColor, borderColor: accentColor }
    : undefined;

  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      aria-pressed={selected}
      onClick={onClick}
      className={`${baseClass} ${className}`}
      style={style}
    >
      <span className="truncate max-w-full">{children}</span>
    </button>
  );
}

export function WineModule({
  wineAction,
  wineBottleState,
  wineGlassMode,
  winePourStyle,
  wineType,
  wineClosureType,
  wineServeAmount,
  contextPreset,
  wineLightingTone,
  wineMoodModifier,
  onWineActionChange,
  onWineBottleStateChange,
  onWineGlassModeChange,
  onBottlePresentationModeChange,
  onWinePourStyleChange,
  onWineTypeChange,
  onWineClosureTypeChange,
  onWineServeAmountChange,
  onContextPresetChange,
  onWineLightingToneChange,
  onWineMoodModifierChange,
}: WineModuleProps) {
  const [isOpen, setIsOpen] = useState(true);
  const bottlePresentationMode = resolveBottlePresentationMode(wineBottleState, wineGlassMode);
  const isPourStyleDisabled = false;
  const isLightingToneDisabled = false;

  // Keep both controls always eligible and always with a valid selection.
  useEffect(() => {
    if (!WINE_POUR_STYLE_OPTIONS.includes(winePourStyle)) {
      onWinePourStyleChange(WINE_POUR_STYLE_OPTIONS[0]);
    }
  }, [winePourStyle, onWinePourStyleChange]);

  useEffect(() => {
    if (!WINE_LIGHTING_TONES.includes(wineLightingTone)) {
      onWineLightingToneChange(WINE_LIGHTING_TONES[0]);
    }
  }, [wineLightingTone, onWineLightingToneChange]);

  useEffect(() => {
    if (!WINE_TYPE_OPTIONS.some((opt) => opt.value === wineType)) {
      onWineTypeChange('auto');
    }
  }, [onWineTypeChange, wineType]);

  useEffect(() => {
    if (!WINE_CLOSURE_OPTIONS.some((opt) => opt.value === wineClosureType)) {
      onWineClosureTypeChange('from-reference');
    }
  }, [onWineClosureTypeChange, wineClosureType]);

  useEffect(() => {
    if (!SERVE_AMOUNT_OPTIONS.some((opt) => opt.value === wineServeAmount)) {
      onWineServeAmountChange('standard');
    }
  }, [onWineServeAmountChange, wineServeAmount]);

  const chipClass = (selected: boolean, disabled = false): string => {
    if (disabled) return 'opacity-50 cursor-not-allowed bg-gray-50 border-gray-200 text-gray-400';
    // Selected color is handled by inline style in WineChipButton (with a fallback).
    // Avoid `!important` + CSS var classes here; if `--studio-accent` is unset it can make chips look invisible.
    return selected
      ? 'text-white'
      : 'bg-white border-gray-200 text-gray-600 hover:border-indigo-600';
  };

  const applyBottlePresentationMode = (mode: BottlePresentationMode): void => {
    if (onBottlePresentationModeChange) {
      onBottlePresentationModeChange(mode);
      return;
    }

    switch (mode) {
      case 'sealed':
        onWineGlassModeChange('none');
        onWineBottleStateChange('sealed');
        return;
      case 'open':
        onWineGlassModeChange('none');
        onWineBottleStateChange('opened-with-cork-nearby');
        return;
      case 'open-glass-empty':
        onWineGlassModeChange('empty');
        onWineBottleStateChange('opened-with-cork-nearby');
        return;
      case 'open-glass-served':
        onWineGlassModeChange('filled');
        onWineBottleStateChange('opened-with-cork-nearby');
        return;
      default:
        return;
    }
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
                <WineChipButton
                  key={option.value}
                  selected={bottlePresentationMode === option.value}
                  onClick={() => applyBottlePresentationMode(option.value)}
                  className={chipClass(bottlePresentationMode === option.value, false)}
                  disabled={false}
                  title={option.label}
                >
                  {option.label}
                </WineChipButton>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-600 mb-2">Wine Action</p>
            <div className="flex flex-wrap gap-2">
              {WINE_ACTION_OPTIONS.map((action) => (
                <WineChipButton
                  key={action}
                  selected={wineAction === action}
                  onClick={() => handleWineActionChange(action)}
                  className={chipClass(wineAction === action, false)}
                  disabled={false}
                  title={action === 'static-presentation' ? 'Static Presentation' : 'Controlled Pour'}
                >
                  {action === 'static-presentation' ? 'Static Presentation' : 'Controlled Pour'}
                </WineChipButton>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-600 mb-2">Environment Preset</p>
            <div className="flex flex-wrap gap-2">
              {WINE_ENVIRONMENT_PRESETS.map((preset) => (
                <WineChipButton
                  key={preset}
                  selected={String(contextPreset || '').trim() === preset}
                  onClick={() => onContextPresetChange(preset)}
                  className={chipClass(String(contextPreset || '').trim() === preset, false)}
                  disabled={false}
                  title={preset}
                >
                  {preset}
                </WineChipButton>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-600 mb-2">Wine Type</p>
            <div className="flex flex-wrap gap-2">
              {WINE_TYPE_OPTIONS.map((option) => (
                <WineChipButton
                  key={option.value}
                  selected={wineType === option.value}
                  onClick={() => onWineTypeChange(option.value)}
                  className={chipClass(wineType === option.value, false)}
                  disabled={false}
                  title={option.label}
                >
                  {option.label}
                </WineChipButton>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-600 mb-2">Closure Type</p>
            <div className="flex flex-wrap gap-2">
              {WINE_CLOSURE_OPTIONS.map((option) => (
                <WineChipButton
                  key={option.value}
                  selected={wineClosureType === option.value}
                  onClick={() => onWineClosureTypeChange(option.value)}
                  className={chipClass(wineClosureType === option.value, false)}
                  disabled={false}
                  title={option.label}
                >
                  {option.label}
                </WineChipButton>
              ))}
            </div>
          </div>
          {wineGlassMode === 'filled' && (
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-2">Serve Amount</p>
              <div className="flex flex-wrap gap-2">
                {SERVE_AMOUNT_OPTIONS.map((option) => (
                  <WineChipButton
                    key={option.value}
                    selected={wineServeAmount === option.value}
                    onClick={() => onWineServeAmountChange(option.value)}
                    className={chipClass(wineServeAmount === option.value, false)}
                    disabled={false}
                    title={`${option.label} (${option.hint})`}
                  >
                    {option.label}
                  </WineChipButton>
                ))}
              </div>
            </div>
          )}
          <div>
            <p className="text-xs font-semibold text-gray-600 mb-2">Pour Style</p>
            <div className="flex flex-wrap gap-2">
              {WINE_POUR_STYLE_OPTIONS.map((style) => (
                <WineChipButton
                  key={style}
                  selected={winePourStyle === style}
                  onClick={() => onWinePourStyleChange(style)}
                  disabled={isPourStyleDisabled}
                  className={chipClass(winePourStyle === style, isPourStyleDisabled)}
                >
                  {style === 'slow-ribbon'
                    ? 'Slow Ribbon'
                    : style === 'mid-flow-elegance'
                    ? 'Mid-flow Elegance'
                    : 'Peak Glass Impact'}
                </WineChipButton>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-600 mb-2">Lighting Tone</p>
            <div className="flex flex-wrap gap-2">
              {WINE_LIGHTING_TONES.map((tone) => (
                <WineChipButton
                  key={tone}
                  selected={wineLightingTone === tone}
                  onClick={() => onWineLightingToneChange(tone)}
                  disabled={isLightingToneDisabled}
                  className={chipClass(wineLightingTone === tone, isLightingToneDisabled)}
                >
                  {tone}
                </WineChipButton>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-600 mb-2">Mood Modifier</p>
            <div className="flex flex-wrap gap-2">
              {WINE_MODIFIERS.map((modifier) => (
                <WineChipButton
                  key={modifier}
                  selected={wineMoodModifier === modifier}
                  onClick={() => onWineMoodModifierChange(modifier)}
                  className={chipClass(wineMoodModifier === modifier, false)}
                  disabled={false}
                  title={modifier}
                >
                  {modifier}
                </WineChipButton>
              ))}
            </div>
          </div>
      </div>
    </div>
  );
}
