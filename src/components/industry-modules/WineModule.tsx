import React, { useState } from 'react';
import { Chip } from '@/components/ui/Chip';
import {
  WINE_LIGHTING_TONES,
  WINE_MODIFIERS,
  WINE_POUR_STYLE_OPTIONS,
  WINE_STYLE_ARCHETYPES,
  ALL_WINE_ENVIRONMENTS_V4,
} from '@/lib/productStudio/winePrestige';
import type {
  ProductStudioState,
  PhotoMode,
  WineGlassType,
  WineStyleArchetype,
  WineMicroVariation,
  WineEnvironmentV4,
  WineServeMode,
  WineBottleFillMode,
} from '@/lib/productStudio/types';
import { useProductStudioStore } from '@/lib/productStudio/store';

type WineTypeUI = 'auto' | 'white' | 'red' | 'rosé' | 'sparkling-white' | 'sparkling-rosé';
type WineClosureTypeUI = 'from-reference' | 'natural-cork' | 'crown-cap' | 'screw-cap' | 'cork-with-cage' | 'synthetic-closure';
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

const WINE_GLASS_TYPE_OPTIONS: Array<{ value: WineGlassType; label: string }> = [
  { value: 'auto', label: 'Auto' },
  { value: 'red-bowl', label: 'Red Bowl' },
  { value: 'white-stem', label: 'White Stem' },
  { value: 'sparkling-flute', label: 'Sparkling Flute' },
];

const WINE_SERVE_MODE_OPTIONS: Array<{ value: WineServeMode; label: string; description: string }> = [
  { value: 'bottle-only', label: 'Bottle Only', description: 'Sealed bottle, no glass' },
  { value: 'served', label: 'Served', description: 'Bottle plus glass, no pour-in-progress' },
  { value: 'pouring', label: 'Pouring', description: 'Active pour with bottle and glass' },
];

const WINE_BOTTLE_FILL_OPTIONS: Array<{ value: WineBottleFillMode; label: string; description: string }> = [
  { value: 'just-opened', label: 'Just Opened', description: 'Bottle is opened and nearly full' },
  { value: 'partially-served', label: 'Partially Served', description: 'Bottle shows visible liquid reduction' },
];

const WINE_TYPE_OPTIONS: Array<{ value: WineTypeUI; label: string }> = [
  { value: 'auto', label: 'Auto' },
  { value: 'white', label: 'White' },
  { value: 'red', label: 'Red' },
  { value: 'rosé', label: 'Rosé' },
  { value: 'sparkling-white', label: 'Sparkling White' },
  { value: 'sparkling-rosé', label: 'Sparkling Rosé' },
];

const WINE_STUDIO_SCENE_OPTIONS: Array<{ value: PhotoMode; label: string; description: string }> = [
  { value: 'Hero Landing Page', label: 'Hero Landing', description: 'Single-bottle hero with clean product-first framing' },
  { value: 'Wine Macro Label', label: 'Macro Label', description: 'Extreme label-detail framing' },
  { value: 'Bottle + Glass', label: 'Bottle + Glass', description: 'Served bottle with glass beside it' },
  { value: 'Bottle + Glass Pour', label: 'Bottle + Glass Pour', description: 'Active bottle-to-glass pour' },
  { value: 'Hands Pouring Wine', label: 'Hands Pouring', description: 'Cropped-hands hospitality pour' },
  { value: 'Wine Lineup Comparison', label: 'Lineup', description: 'Multiple bottles in one clean comparison scene' },
  { value: 'Editorial Bottle Tabletop', label: 'Editorial Tabletop', description: 'Still-life tabletop editorial' },
  { value: 'Editorial Table', label: 'Editorial Table', description: 'Broader premium tabletop scene' },
  { value: 'Bottle In Hand Cutout', label: 'Bottle In Hand', description: 'Cropped hand holding bottle' },
  { value: 'Rose Tasting Table', label: 'Tasting Table', description: 'Bright served tasting scene' },
  { value: 'Winery Scene', label: 'Winery Scene', description: 'Cellar or winery environment' },
];

const WINE_LIFESTYLE_SCENE_OPTIONS: Array<{ value: PhotoMode; label: string; description: string }> = [
  { value: 'Social Table Served', label: 'Social Table', description: 'Shared-table hospitality moment with bottle clearly visible' },
  { value: 'Outdoor Toast', label: 'Outdoor Toast', description: 'Natural daylight toast with bottle visible in the setup' },
  { value: 'Hosting Pour', label: 'Hosting Pour', description: 'Real hosting/service pour in a social setting' },
  { value: 'Dinner Pairing', label: 'Dinner Pairing', description: 'Bottle with plated food and refined dining context' },
  { value: 'Picnic Gathering', label: 'Picnic Gathering', description: 'Relaxed outdoor wine gathering with picnic cues' },
  { value: 'Celebration Chill', label: 'Celebration Chill', description: 'Cold-service wine celebration with chilled hospitality context' },
];

const WINE_MICRO_VARIATIONS_OPTIONS = {
  season: [
    { value: 'none', label: 'None' },
    { value: 'spring', label: 'Spring' },
    { value: 'summer', label: 'Summer' },
    { value: 'autumn', label: 'Autumn' },
    { value: 'winter', label: 'Winter' },
  ],
  dewOnGlass: [
    { value: false, label: 'No Dew' },
    { value: true, label: 'Dew Drops' },
  ],
  atmosphericHaze: [
    { value: 'none', label: 'Clear' },
    { value: 'subtle', label: 'Subtle Haze' },
    { value: 'moderate', label: 'Atmospheric' },
  ],
  floralProps: [
    { value: false, label: 'No Flowers' },
    { value: true, label: 'Floral Accents' },
  ],
  microProps: [
    { value: 'none', label: 'None' },
    { value: 'cork-and-corkscrew', label: 'Cork & Corkscrew' },
    { value: 'vine-leaves', label: 'Vine Leaves' },
    { value: 'cheese-board', label: 'Cheese Board' },
    { value: 'linen-napkin', label: 'Linen Napkin' },
  ],
  backgroundDepthBoost: [
    { value: false, label: 'Standard' },
    { value: true, label: 'Deep Background' },
  ],
};

export function WineModule() {
  const [isOpen, setIsOpen] = useState(true);
  const wineType         = (useProductStudioStore((s) => s.wineType)         ?? 'auto')                    as WineTypeUI;
  const wineClosureType  = (useProductStudioStore((s) => s.wineClosureType)  ?? 'from-reference')          as WineClosureTypeUI;
  const wineServeMode    = (useProductStudioStore((s) => s.wineServeMode)    ?? 'bottle-only')             as WineServeMode;
  const wineBottleFillMode = (useProductStudioStore((s) => s.wineBottleFillMode) ?? 'just-opened')         as WineBottleFillMode;
  const wineGlassType    =  useProductStudioStore((s) => s.wineGlassType)    ?? 'auto';
  const winePourStyle    =  useProductStudioStore((s) => s.winePourStyle);
  const wineLightingTone =  useProductStudioStore((s) => s.wineLightingTone);
  const wineMoodModifier =  useProductStudioStore((s) => s.wineMoodModifier);
  const carbonationLevel = (useProductStudioStore((s) => s.carbonationLevel) ?? 'none')                    as WineCarbonationUI;
  const wineStyleArchetype = useProductStudioStore((s) => s.wineStyleArchetype) ?? null;
  const wineMicroVariation = useProductStudioStore((s) => s.wineMicroVariation) ?? {
    season: 'none',
    dewOnGlass: false,
    atmosphericHaze: 'none',
    floralProps: false,
    microProps: 'none',
    backgroundDepthBoost: false,
  } as WineMicroVariation;
  const wineEnvironment = useProductStudioStore((s) => s.wineEnvironment) ?? 'Dark Luxury Studio' as WineEnvironmentV4;
  const photoMode        =  useProductStudioStore((s) => s.photoMode);
  const sceneType        =  useProductStudioStore((s) => s.sceneType);

  // ── Derived coherence flags ────────────────────────────────────────────
  const isBottleAndGlassMode = photoMode === 'Bottle + Glass';
  const isBottleAndGlassPourMode = photoMode === 'Bottle + Glass Pour';
  const isHandsPouringMode = photoMode === 'Hands Pouring Wine';
  const isRoseTastingMode = photoMode === 'Rose Tasting Table';
  const isMacroLabelMode = photoMode === 'Wine Macro Label';

  // RULE 5: Sparkling visible only when wineType resolves to sparkling
  // OR closure is champagne wire (cork-with-cage implies sparkling physics)
  const isSparklingRelevant =
    wineType === 'sparkling-white' ||
    wineType === 'sparkling-rosé' ||
    wineClosureType === 'cork-with-cage';

  const forcedServeMode: WineServeMode | null = isBottleAndGlassPourMode || isHandsPouringMode
    ? 'pouring'
    : isBottleAndGlassMode || isRoseTastingMode
      ? 'served'
      : null;
  const currentServeMode: WineServeMode = forcedServeMode ?? wineServeMode;
  const currentBottleFillMode: WineBottleFillMode =
    currentServeMode === 'served'
      ? wineBottleFillMode
      : currentServeMode === 'pouring'
        ? 'partially-served'
        : 'just-opened';

  const setWineUiState = (patch: Partial<ProductStudioState>): void => {
    useProductStudioStore.setState(patch);
  };

  const wineSceneFamily: 'studio' | 'lifestyle' = sceneType === 'lifestyle-real' ? 'lifestyle' : 'studio';
  const visibleWineSceneOptions =
    wineSceneFamily === 'lifestyle' ? WINE_LIFESTYLE_SCENE_OPTIONS : WINE_STUDIO_SCENE_OPTIONS;

  const setWineServeMode = (mode: WineServeMode) => {
    if (mode === 'bottle-only') {
      setWineUiState({
        wineServeMode: 'bottle-only',
        wineBottleFillMode: 'just-opened',
        wineGlassMode: 'none',
        wineBottleState: 'sealed',
        wineAction: 'static-presentation',
        wineServeAmount: 'none',
      });
      return;
    }
    if (mode === 'pouring') {
      setWineUiState({
        wineServeMode: 'pouring',
        wineBottleFillMode: 'partially-served',
        wineGlassMode: 'filled',
        wineBottleState: 'opened-with-cork-nearby',
        wineAction: 'controlled-pour',
        wineServeAmount: 'partially-served',
      });
      return;
    }
    setWineUiState({
      wineServeMode: 'served',
      wineBottleFillMode: currentBottleFillMode,
      wineGlassMode: 'filled',
      wineBottleState: 'opened-with-cork-nearby',
      wineAction: 'static-presentation',
      wineServeAmount: currentBottleFillMode,
    });
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
          {wineSceneFamily === 'studio' && (
            <div>
              <p className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold mb-1">Scene Family</p>
              <p className="text-[11px] text-gray-400 mb-2">Choose whether this wine render lives in product-first studio or social lifestyle.</p>
              <div className="flex flex-wrap gap-2">
                <Chip
                  selected
                  onClick={() => useProductStudioStore.getState().setSceneType('studio-branding')}
                  title="Product-first wine scenes"
                >
                  Wine Studio
                </Chip>
                <Chip
                  selected={false}
                  onClick={() => useProductStudioStore.getState().setSceneType('lifestyle-real')}
                  title="Social and hospitality wine moments"
                >
                  Wine Lifestyle
                </Chip>
              </div>
            </div>
          )}

          <div>
            <p className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold mb-1">
              {wineSceneFamily === 'lifestyle' ? 'Wine Lifestyle' : 'Scene'}
            </p>
            <p className="text-[11px] text-gray-400 mb-2">
              {wineSceneFamily === 'lifestyle'
                ? 'Wine-specific social moments. Hospitality context is allowed, but the bottle must stay commercially legible.'
                : 'Wine-specific shot selection. This is the primary scene authority for wine.'}
            </p>
            <div className="flex flex-wrap gap-2">
              {visibleWineSceneOptions.map((option) => (
                <Chip
                  key={option.value}
                  selected={photoMode === option.value}
                  onClick={() => useProductStudioStore.getState().setPhotoMode(option.value)}
                  title={option.description}
                >
                  {option.label}
                </Chip>
              ))}
            </div>
          </div>
          {/* ── WINE STYLE ARCHETYPE ─────────────────────────────── */}
          <div>
            <p className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold mb-1">Look Preset</p>
            <p className="text-[11px] text-gray-400 mb-2">Visual treatment only. Does not override the selected environment.</p>
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
          {/* ── WINE TYPE ──────────────────────────────────────── */}
          <div>
            <p className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold mb-2">Wine Type</p>
            <div className="flex flex-wrap gap-2">
              {WINE_TYPE_OPTIONS.map((option) => (
                <Chip
                  key={option.value}
                  selected={wineType === option.value}
                  onClick={() => setWineUiState({ wineType: option.value })}
                >
                  {option.label}
                </Chip>
              ))}
            </div>
            <p className="text-[11px] text-gray-400 mt-1">
              Auto derives from reference. Manual override for specific wine type styling.
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold mb-2">Scene Service</p>
            {(forcedServeMode === 'served' || forcedServeMode === 'pouring') && (
              <p className="text-[11px] text-violet-500 mb-1 font-medium">
                ✦ {photoMode} enforces {forcedServeMode === 'pouring' ? 'Pouring' : 'Served'}
              </p>
            )}
            {isMacroLabelMode && (
              <p className="text-[11px] text-amber-500 mb-1 font-medium">
                ✦ Macro Label mode disables service presentation controls
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              {WINE_SERVE_MODE_OPTIONS.map((option) => (
                <Chip
                  key={option.value}
                  selected={currentServeMode === option.value}
                  disabled={Boolean(forcedServeMode) || isMacroLabelMode}
                  onClick={() => {
                    if (forcedServeMode || isMacroLabelMode) return;
                    setWineServeMode(option.value);
                  }}
                  title={option.description}
                >
                  {option.label}
                </Chip>
              ))}
            </div>
            <p className="text-[11px] text-gray-400 mt-1">
              {currentServeMode === 'bottle-only'
                ? 'Bottle only. No glass in frame.'
                : currentServeMode === 'pouring'
                  ? 'Bottle plus glass with active pour physics.'
                  : 'Bottle plus glass without active pour.'}
            </p>
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
          {currentServeMode === 'served' && !isMacroLabelMode && (
            <div>
              <p className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold mb-2">Bottle Fill</p>
              <div className="flex flex-wrap gap-2">
                {WINE_BOTTLE_FILL_OPTIONS.map((option) => (
                  <Chip
                    key={option.value}
                    selected={currentBottleFillMode === option.value}
                    onClick={() =>
                      setWineUiState({
                        wineServeMode: 'served',
                        wineBottleFillMode: option.value,
                        wineGlassMode: 'filled',
                        wineBottleState: 'opened-with-cork-nearby',
                        wineAction: 'static-presentation',
                        wineServeAmount: option.value,
                      })
                    }
                    title={option.description}
                  >
                    {option.label}
                  </Chip>
                ))}
              </div>
              <p className="text-[11px] text-gray-400 mt-1">
                {currentBottleFillMode === 'just-opened'
                  ? 'Open bottle, nearly full, with a filled glass beside it.'
                  : 'Open bottle with visible liquid reduction, plus filled glass.'}
              </p>
            </div>
          )}
          {(currentServeMode === 'served' || currentServeMode === 'pouring') && !isMacroLabelMode && (
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
          {currentServeMode === 'pouring' && (
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
          {/* ── MICRO VARIATIONS ────────────────────────────────── */}
          <div>
            <p className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold mb-2">Micro Details</p>
            <p className="text-[11px] text-gray-400 mb-3">Fine-tune atmospheric and prop details.</p>
            
            <div className="space-y-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.1em] text-gray-400 font-semibold mb-1">Season</p>
                <div className="flex flex-wrap gap-2">
                  {WINE_MICRO_VARIATIONS_OPTIONS.season.map((option) => (
                    <Chip
                      key={option.value}
                      selected={wineMicroVariation.season === option.value}
                      onClick={() => setWineUiState({ 
                        wineMicroVariation: { ...wineMicroVariation, season: option.value as WineMicroVariation['season'] } 
                      })}
                    >
                      {option.label}
                    </Chip>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-[0.1em] text-gray-400 font-semibold mb-1">Glass Effect</p>
                <div className="flex flex-wrap gap-2">
                  {WINE_MICRO_VARIATIONS_OPTIONS.dewOnGlass.map((option) => (
                    <Chip
                      key={String(option.value)}
                      selected={wineMicroVariation.dewOnGlass === option.value}
                      onClick={() => setWineUiState({ 
                        wineMicroVariation: { ...wineMicroVariation, dewOnGlass: option.value } 
                      })}
                    >
                      {option.label}
                    </Chip>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-[0.1em] text-gray-400 font-semibold mb-1">Atmosphere</p>
                <div className="flex flex-wrap gap-2">
                  {WINE_MICRO_VARIATIONS_OPTIONS.atmosphericHaze.map((option) => (
                    <Chip
                      key={option.value}
                      selected={wineMicroVariation.atmosphericHaze === option.value}
                      onClick={() => setWineUiState({ 
                        wineMicroVariation: { ...wineMicroVariation, atmosphericHaze: option.value as WineMicroVariation['atmosphericHaze'] } 
                      })}
                    >
                      {option.label}
                    </Chip>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-[0.1em] text-gray-400 font-semibold mb-1">Floral Props</p>
                <div className="flex flex-wrap gap-2">
                  {WINE_MICRO_VARIATIONS_OPTIONS.floralProps.map((option) => (
                    <Chip
                      key={String(option.value)}
                      selected={wineMicroVariation.floralProps === option.value}
                      onClick={() => setWineUiState({ 
                        wineMicroVariation: { ...wineMicroVariation, floralProps: option.value } 
                      })}
                    >
                      {option.label}
                    </Chip>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-[0.1em] text-gray-400 font-semibold mb-1">Micro Props</p>
                <div className="flex flex-wrap gap-2">
                  {WINE_MICRO_VARIATIONS_OPTIONS.microProps.map((option) => (
                    <Chip
                      key={option.value}
                      selected={wineMicroVariation.microProps === option.value}
                      onClick={() => setWineUiState({ 
                        wineMicroVariation: { ...wineMicroVariation, microProps: option.value as WineMicroVariation['microProps'] } 
                      })}
                    >
                      {option.label}
                    </Chip>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-[0.1em] text-gray-400 font-semibold mb-1">Background Depth</p>
                <div className="flex flex-wrap gap-2">
                  {WINE_MICRO_VARIATIONS_OPTIONS.backgroundDepthBoost.map((option) => (
                    <Chip
                      key={String(option.value)}
                      selected={wineMicroVariation.backgroundDepthBoost === option.value}
                      onClick={() => setWineUiState({ 
                        wineMicroVariation: { ...wineMicroVariation, backgroundDepthBoost: option.value } 
                      })}
                    >
                      {option.label}
                    </Chip>
                  ))}
                </div>
              </div>
            </div>
          </div>
          {/* ── WINE ENVIRONMENT ────────────────────────────────── */}
          <div>
            <p className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold mb-2">Environment</p>
            <p className="text-[11px] text-gray-400 mb-3">Physical place and surface for the wine scene. This should work with any look preset.</p>
            <div className="flex flex-wrap gap-2">
              {ALL_WINE_ENVIRONMENTS_V4.map((environment) => (
                <Chip
                  key={environment}
                  selected={wineEnvironment === environment}
                  onClick={() => setWineUiState({ wineEnvironment: environment })}
                >
                  {environment}
                </Chip>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
