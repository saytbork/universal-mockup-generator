import React, { useState } from 'react';
import { Chip } from '@/components/ui/Chip';
import {
  WINE_ACTION_OPTIONS,
  WINE_LIGHTING_TONES,
  WINE_MODIFIERS,
  WINE_POUR_STYLE_OPTIONS,
  WINE_STYLE_ARCHETYPES,
} from '@/lib/productStudio/winePrestige';
import type { WineAction, WineGlassType, WineLightingTone, WineMoodModifier, WinePourStyle, WineStyleArchetype } from '@/lib/productStudio/types';
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

  type ServeStateUI = 'none' | 'served';
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

const SERVE_STATE_OPTIONS: Array<{ value: ServeStateUI; label: string; description: string }> = [
  { value: 'none', label: 'Closed', description: 'Sealed bottle, full, no glass' },
  { value: 'served', label: 'Served', description: 'Open bottle, half-full, cap on surface, glass with wine' },
];

const WINE_GLASS_TYPE_OPTIONS: Array<{ value: WineGlassType; label: string }> = [
  { value: 'auto', label: 'Auto' },
  { value: 'red-bowl', label: 'Red Bowl' },
  { value: 'white-stem', label: 'White Stem' },
  { value: 'sparkling-flute', label: 'Flute / Champagne' },
];

export function WineModule() {
  const [isOpen, setIsOpen] = useState(true);
  const wineType = (useProductStudioStore((s) => (s as any).wineType) || 'auto') as WineTypeUI;
  const wineClosureType = (useProductStudioStore((s) => (s as any).wineClosureType) || 'from-reference') as WineClosureTypeUI;
  const wineBottleState = (useProductStudioStore((s) => (s as any).wineBottleState) || 'opened-with-cork-nearby') as string;
  const wineGlassMode = (useProductStudioStore((s) => (s as any).wineGlassMode) || 'none') as string;
  const wineGlassType = (useProductStudioStore((s) => (s as any).wineGlassType) || 'auto') as WineGlassType;
  const wineServeAmount = (useProductStudioStore((s) => (s as any).wineServeAmount) || 'standard') as string;
  const wineAction = (useProductStudioStore((s) => (s as any).wineAction) || 'static-presentation') as WineAction;
  const winePourStyle = (useProductStudioStore((s) => (s as any).winePourStyle) || 'slow-ribbon') as WinePourStyle;
  const wineLightingTone = (useProductStudioStore((s) => (s as any).wineLightingTone) || 'Warm Lateral') as WineLightingTone;
  const wineMoodModifier = (useProductStudioStore((s) => (s as any).wineMoodModifier) || 'None') as WineMoodModifier;
  const carbonationLevel = (useProductStudioStore((s) => (s as any).carbonationLevel) || 'none') as WineCarbonationUI;
  const wineStyleArchetype = (useProductStudioStore((s) => (s as any).wineStyleArchetype) ?? null) as WineStyleArchetype | null;
  const photoMode = (useProductStudioStore((s) => (s as any).photoMode) || '') as string;

  // ── Derived coherence flags ────────────────────────────────────────────
  const isBottleAndGlassMode = photoMode === 'Bottle + Glass';
  const isMacroLabelMode = photoMode === 'Wine Macro Label';

  // RULE 5: Sparkling visible only when wineType resolves to sparkling
  // OR closure is champagne wire (cork-with-cage implies sparkling physics)
  const isSparklingRelevant =
    wineType === 'sparkling-white' ||
    wineType === 'sparkling-rosé' ||
    wineClosureType === 'cork-with-cage';

  const currentServeState: ServeStateUI = wineGlassMode !== 'filled' ? 'none' : 'served';

  const setWineUiState = (patch: Record<string, unknown>): void => {
    useProductStudioStore.setState(patch as any);
  };

  return (
    <div className="rounded-2xl border border-rose-200 bg-rose-50/40 p-4">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between text-left"
      >
        <p className="text-xs uppercase tracking-[0.2em] font-extrabold text-rose-700">WINE SETUP</p>
        <span className="text-[11px] font-semibold text-rose-700">{isOpen ? 'Hide' : 'Show'}</span>
      </button>

      {isOpen && (
        <div className="mt-4 space-y-4">
          {/* ── WINE STYLE ARCHETYPE ─────────────────────────────── */}
          <div>
            <p className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold mb-1">Style Preset</p>
            <p className="text-[11px] text-gray-400 mb-2">Visual preset. Manual controls override.</p>
            <div className="flex flex-wrap gap-2">
              {WINE_STYLE_ARCHETYPES.map((archetype) => (
                <Chip
                  key={archetype}
                  selected={wineStyleArchetype === archetype}
                  onClick={() => {
                    const next = wineStyleArchetype === archetype ? null : archetype;
                    useProductStudioStore.getState().setWineStyleArchetype(next);
                  }}
                >
                  {archetype}
                </Chip>
              ))}
            </div>
          </div>
          {/* ── WINE ACTION ──────────────────────────────────────── */}
          <div>
            <p className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold mb-2">Serve Style</p>
            <div className="flex flex-wrap gap-2">
              {WINE_ACTION_OPTIONS.map((action) => (
                <Chip
                  key={action}
                  selected={wineAction === action}
                  onClick={() => setWineUiState({ wineAction: action })}
                >
                  {action === 'static-presentation' ? 'Static Presentation' : 'Controlled Pour'}
                </Chip>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold mb-2">Closure</p>
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
            <p className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold mb-2">Bottle State</p>
            {isBottleAndGlassMode && (
              <p className="text-[11px] text-violet-500 mb-1 font-medium">
                ✦ Bottle + Glass mode — Served is enforced automatically
              </p>
            )}
            {isMacroLabelMode && (
              <p className="text-[11px] text-amber-500 mb-1 font-medium">
                ✦ Macro Label mode — serve state is not applicable
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              {SERVE_STATE_OPTIONS.map((option) => {
                // RULE 3: Bottle + Glass forces Served — Closed is locked out
                const isDisabled =
                  (isBottleAndGlassMode && option.value === 'none') ||
                  isMacroLabelMode;
                return (
                  <Chip
                    key={option.value}
                    selected={isBottleAndGlassMode ? option.value === 'served' : currentServeState === option.value}
                    disabled={isDisabled}
                    onClick={() => {
                      if (isDisabled) return;
                      if (option.value === 'none') {
                        setWineUiState({
                          wineGlassMode: 'none',
                          wineServeAmount: 'standard',
                          wineBottleState: 'sealed',
                        });
                        return;
                      }
                      setWineUiState({
                        wineGlassMode: 'filled',
                        wineServeAmount: 'standard',
                        wineBottleState: 'opened-with-cork-nearby',
                      });
                    }}
                    title={option.description}
                  >
                    {option.label}
                  </Chip>
                );
              })}
            </div>
            <p className="text-[11px] text-gray-400 mt-1">
              {isBottleAndGlassMode
                ? 'Open bottle · Half-empty · Cap on surface · Glass with wine'
                : currentServeState === 'none'
                ? 'Sealed bottle · Full · No glass'
                : wineStyleArchetype
                  ? `Open bottle · Half-empty · Cap on surface · Glass with wine · ${wineStyleArchetype} lighting`
                  : 'Open bottle · Half-empty · Cap on surface · Glass with wine'}
            </p>
          </div>
          {currentServeState === 'served' && !isMacroLabelMode && (
            <div>
              <p className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold mb-2">Glass</p>
              <div className="flex flex-wrap gap-2">
                {WINE_GLASS_TYPE_OPTIONS.map((option) => (
                  <Chip
                    key={option.value}
                    selected={wineGlassType === option.value}
                    onClick={() => setWineUiState({ wineGlassType: option.value })}
                  >
                    {option.label}
                  </Chip>
                ))}
              </div>
              <p className="text-[11px] text-gray-400 mt-1">
                Auto derives the right glass from the wine type. Use Flute / Champagne for sparkling scenes.
              </p>
            </div>
          )}
          {/* RULE 5: Sparkling only visible when wineType resolves to sparkling
               or closure implies champagne/sparkling physics */}
          {isSparklingRelevant && (
          <div>
            <p className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold mb-2">Bubbles</p>
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
          )}
          {wineAction === 'controlled-pour' && (
            <div>
              <p className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold mb-2">Pour Style</p>
              <div className="flex flex-wrap gap-2">
                {WINE_POUR_STYLE_OPTIONS.map((style) => (
                  <Chip
                    key={style}
                    selected={winePourStyle === style}
                    onClick={() => setWineUiState({ winePourStyle: style })}
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
                  onClick={() => setWineUiState({ wineLightingTone: tone })}
                >
                  {tone}
                </Chip>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold mb-2">Mood Finish</p>
            <div className="flex flex-wrap gap-2">
              {WINE_MODIFIERS.map((modifier) => (
                <Chip
                  key={modifier}
                  selected={wineMoodModifier === modifier}
                  onClick={() => setWineUiState({ wineMoodModifier: modifier })}
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
