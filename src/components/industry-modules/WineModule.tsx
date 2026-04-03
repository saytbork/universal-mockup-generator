import React, { useEffect, useState } from 'react';
import { Chip } from '@/components/ui/Chip';
import {
  WINE_LIGHTING_TONES,
  WINE_MODIFIERS,
  WINE_POUR_STYLE_OPTIONS,
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
  { value: 'just-opened', label: 'Full', description: 'Bottle looks full or nearly full' },
  { value: 'partially-served', label: 'Half', description: 'Bottle shows visible liquid reduction' },
];

const WINE_BOTTLE_STATE_OPTIONS: Array<{
  value: 'sealed' | 'opened-with-cork-nearby';
  label: string;
  description: string;
}> = [
  { value: 'sealed', label: 'Closed', description: 'Retail-closed bottle with no visible opening' },
  { value: 'opened-with-cork-nearby', label: 'Open', description: 'Bottle is open and ready for service' },
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
  { value: 'Social Table Served', label: 'Social Table', description: 'Bottle-first shared table scene with glasses, food, and real hospitality context' },
  { value: 'Outdoor Toast', label: 'Outdoor Toast', description: 'Bottle-led outdoor setup with toast action, cropped people, and natural daylight' },
  { value: 'Hosting Pour', label: 'Hosting Pour', description: 'Bottle hero during a real pour, with cropped arms or hands only' },
  { value: 'Dinner Pairing', label: 'Dinner Pairing', description: 'Bottle-led dining scene with plates, snacks, or charcuterie on table' },
  { value: 'Picnic Gathering', label: 'Picnic Gathering', description: 'Picnic blanket or board scene with bottle, glass, and relaxed outdoor context' },
  { value: 'Celebration Chill', label: 'Celebration Chill', description: 'Chilled bottle service with bucket, condensation, glassware, or cool-table setup' },
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

const WINE_STUDIO_ENVIRONMENTS: WineEnvironmentV4[] = [
  'Dark Luxury Studio',
  'Concrete Architectural Studio',
  'White Marble Studio',
  'Oak Barrel Cellar',
  'Stone Cave Cellar',
  'Cathedral Wine Cellar',
  'Private Wine Library',
];

const WINE_LIFESTYLE_ENVIRONMENTS: WineEnvironmentV4[] = [
  'Vineyard Golden Hour',
  'Vineyard Blue Hour',
  'Vineyard Misty Dawn',
  'Fine Dining Table',
  'Outdoor Terrace Dining',
  'Rustic Estate Kitchen',
  'Glass Winery Modern',
  'Hillside Terroir Landscape',
];

const WINE_STUDIO_ARCHETYPES: WineStyleArchetype[] = [
  'Minimal Editorial Studio',
  'Ultra Minimal Black Luxury',
  'Backlit Premium Studio',
  'Moody Wood Editorial',
  'Macro Label Branding',
  'Game Night Editorial',
  'Grounded Vineyard Flatlay',
];

const WINE_LIFESTYLE_ARCHETYPES: WineStyleArchetype[] = [
  'Action Pour Photography',
  'Cinematic Vineyard',
  'Warm Tasting Room',
  'Rustic Pairing Table',
  'Outdoor Social Toast',
  'Ice Bucket Chill',
  'Bottle Inspection Handheld',
];

const DEFAULT_WINE_ENVIRONMENT_BY_FAMILY: Record<'studio' | 'lifestyle', WineEnvironmentV4> = {
  studio: 'Dark Luxury Studio',
  lifestyle: 'Fine Dining Table',
};

const ARCHETYPE_ALLOWED_ENVIRONMENTS: Partial<Record<WineStyleArchetype, WineEnvironmentV4[]>> = {
  'Cinematic Vineyard': [
    'Vineyard Golden Hour',
    'Vineyard Blue Hour',
    'Vineyard Misty Dawn',
    'Hillside Terroir Landscape',
  ],
  'Warm Tasting Room': [
    'Glass Winery Modern',
    'Fine Dining Table',
    'Outdoor Terrace Dining',
    'Rustic Estate Kitchen',
  ],
  'Rustic Pairing Table': [
    'Fine Dining Table',
    'Outdoor Terrace Dining',
    'Rustic Estate Kitchen',
  ],
  'Outdoor Social Toast': [
    'Vineyard Golden Hour',
    'Vineyard Blue Hour',
    'Vineyard Misty Dawn',
    'Outdoor Terrace Dining',
    'Hillside Terroir Landscape',
  ],
  'Ice Bucket Chill': [
    'Glass Winery Modern',
    'Fine Dining Table',
    'Outdoor Terrace Dining',
  ],
  'Grounded Vineyard Flatlay': [
    'Vineyard Golden Hour',
    'Vineyard Blue Hour',
    'Vineyard Misty Dawn',
    'Hillside Terroir Landscape',
  ],
  'Bottle Inspection Handheld': [
    'Glass Winery Modern',
    'Fine Dining Table',
    'Outdoor Terrace Dining',
    'Rustic Estate Kitchen',
  ],
};

export function WineModule() {
  const [isOpen, setIsOpen] = useState(true);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const wineType         = (useProductStudioStore((s) => s.wineType)         ?? 'auto')                    as WineTypeUI;
  const wineClosureType  = (useProductStudioStore((s) => s.wineClosureType)  ?? 'from-reference')          as WineClosureTypeUI;
  const wineServeMode    = (useProductStudioStore((s) => s.wineServeMode)    ?? 'bottle-only')             as WineServeMode;
  const wineBottleFillMode = (useProductStudioStore((s) => s.wineBottleFillMode) ?? 'just-opened')         as WineBottleFillMode;
  const wineBottleState = useProductStudioStore((s) => s.wineBottleState) ?? 'sealed';
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
  const currentBottleState: 'sealed' | 'opened-with-cork-nearby' =
    currentServeMode === 'served' || currentServeMode === 'pouring'
      ? 'opened-with-cork-nearby'
      : wineBottleState === 'opened-with-cork-nearby'
        ? 'opened-with-cork-nearby'
        : 'sealed';
  const currentBottleFillMode: WineBottleFillMode =
    currentServeMode === 'served'
      ? wineBottleFillMode
      : currentServeMode === 'pouring'
        ? 'partially-served'
        : currentBottleState === 'opened-with-cork-nearby'
          ? wineBottleFillMode
        : 'just-opened';

  const setWineUiState = (patch: Partial<ProductStudioState>): void => {
    useProductStudioStore.setState(patch);
  };

  const wineSceneFamily: 'studio' | 'lifestyle' =
    WINE_LIFESTYLE_SCENE_OPTIONS.some(option => option.value === photoMode) ? 'lifestyle' : 'studio';
  const visibleWineSceneOptions =
    wineSceneFamily === 'lifestyle' ? WINE_LIFESTYLE_SCENE_OPTIONS : WINE_STUDIO_SCENE_OPTIONS;
  const visibleWineArchetypes =
    wineSceneFamily === 'lifestyle' ? WINE_LIFESTYLE_ARCHETYPES : WINE_STUDIO_ARCHETYPES;
  const visibleWineEnvironments =
    wineSceneFamily === 'lifestyle' ? WINE_LIFESTYLE_ENVIRONMENTS : WINE_STUDIO_ENVIRONMENTS;

  const getArchetypeDisabledReason = (archetype: WineStyleArchetype): string | null => {
    if (archetype === 'Action Pour Photography' && currentServeMode !== 'pouring') {
      return 'Requires a pouring scene.';
    }
    if (archetype === 'Bottle Inspection Handheld' && photoMode !== 'Bottle In Hand Cutout') {
      return 'Requires a hand-held bottle scene.';
    }
    const allowedEnvironments = ARCHETYPE_ALLOWED_ENVIRONMENTS[archetype];
    if (allowedEnvironments && !allowedEnvironments.includes(wineEnvironment)) {
      return `Conflicts with ${wineEnvironment}.`;
    }
    return null;
  };

  const setWineSceneFamily = (family: 'studio' | 'lifestyle') => {
    const store = useProductStudioStore.getState();
    store.setMode(family === 'lifestyle' ? 'lifestyle-real' : 'studio');
    store.setSceneType(family === 'lifestyle' ? 'lifestyle-real' : 'studio-branding');

    if (family === 'studio') {
      if (!WINE_STUDIO_SCENE_OPTIONS.some(option => option.value === photoMode)) {
        store.setPhotoMode('Hero Landing Page');
      }
      return;
    }

    if (!WINE_LIFESTYLE_SCENE_OPTIONS.some(option => option.value === photoMode)) {
      store.setPhotoMode('Social Table Served');
    }
  };

  useEffect(() => {
    const store = useProductStudioStore.getState();

    if (wineStyleArchetype && !visibleWineArchetypes.includes(wineStyleArchetype)) {
      store.setWineStyleArchetype(null);
    }

    if (!visibleWineEnvironments.includes(wineEnvironment)) {
      const fallbackEnvironment = DEFAULT_WINE_ENVIRONMENT_BY_FAMILY[wineSceneFamily];
      store.setWineEnvironment(fallbackEnvironment);
      store.setContextPreset(fallbackEnvironment);
    }

    if (wineStyleArchetype && getArchetypeDisabledReason(wineStyleArchetype)) {
      store.setWineStyleArchetype(null);
    }
  }, [wineSceneFamily, wineStyleArchetype, wineEnvironment, visibleWineArchetypes, visibleWineEnvironments, getArchetypeDisabledReason]);

  const setWineServeMode = (mode: WineServeMode) => {
    if (mode === 'bottle-only') {
      setWineUiState({
        wineServeMode: 'bottle-only',
        wineBottleFillMode:
          currentBottleState === 'opened-with-cork-nearby' ? currentBottleFillMode : 'just-opened',
        wineGlassMode: 'none',
        wineBottleState: currentBottleState,
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

  const setBottleState = (nextBottleState: 'sealed' | 'opened-with-cork-nearby') => {
    if (currentServeMode === 'served' || currentServeMode === 'pouring') return;
    setWineUiState({
      wineServeMode: 'bottle-only',
      wineBottleState: nextBottleState,
      wineBottleFillMode: nextBottleState === 'sealed' ? 'just-opened' : currentBottleFillMode,
      wineGlassMode: 'none',
      wineAction: 'static-presentation',
      wineServeAmount: 'none',
    });
  };

  const setBottleFill = (nextFillMode: WineBottleFillMode) => {
    if (currentServeMode === 'pouring') return;
    if (currentServeMode === 'served') {
      setWineUiState({
        wineServeMode: 'served',
        wineBottleFillMode: nextFillMode,
        wineBottleState: 'opened-with-cork-nearby',
        wineGlassMode: 'filled',
        wineAction: 'static-presentation',
        wineServeAmount: nextFillMode,
      });
      return;
    }

    setWineUiState({
      wineServeMode: 'bottle-only',
      wineBottleFillMode: nextFillMode,
      wineBottleState: 'opened-with-cork-nearby',
      wineGlassMode: 'none',
      wineAction: 'static-presentation',
      wineServeAmount: 'none',
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
          <div>
            <p className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold mb-1">Scene</p>
            <p className="text-[11px] text-gray-400 mb-2">Choose whether this wine render lives in studio or product-in-context lifestyle.</p>
            <div className="flex flex-wrap gap-2">
              <Chip
                selected={wineSceneFamily === 'studio'}
                onClick={() => setWineSceneFamily('studio')}
                title="Product-first wine scenes"
              >
                Wine Studio
              </Chip>
              <Chip
                selected={wineSceneFamily === 'lifestyle'}
                onClick={() => setWineSceneFamily('lifestyle')}
                title="Product-in-context wine moments"
              >
                Wine Lifestyle
              </Chip>
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold mb-1">
              {wineSceneFamily === 'lifestyle' ? 'Wine Lifestyle' : 'Scene'}
            </p>
            <p className="text-[11px] text-gray-400 mb-2">
              {wineSceneFamily === 'lifestyle'
                ? 'Product-led wine context scenes. Real action and hospitality cues are allowed, but the bottle stays the hero and people stay incidental.'
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
            <p className="text-[11px] text-gray-400 mb-2">
              Visual treatment only. Filtered to the current wine family so the UI stays coherent.
            </p>
            <div className="flex flex-wrap gap-2">
              {visibleWineArchetypes.map((archetype) => (
                (() => {
                  const disabledReason = getArchetypeDisabledReason(archetype);
                  return (
                    <Chip
                      key={archetype}
                      selected={wineStyleArchetype === archetype}
                      disabled={Boolean(disabledReason)}
                      tooltip={disabledReason ?? undefined}
                      onClick={() => {
                        if (disabledReason) return;
                        const next = wineStyleArchetype === archetype ? null : archetype;
                        useProductStudioStore.getState().setWineStyleArchetype(next);
                      }}
                    >
                      {archetype}
                    </Chip>
                  );
                })()
              ))}
            </div>
            {visibleWineArchetypes.some((archetype) => getArchetypeDisabledReason(archetype)) && (
              <p className="text-[11px] text-gray-400 mt-1">
                Presets that conflict with the current scene stay disabled instead of being silently ignored.
              </p>
            )}
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold mb-2">Environment</p>
            <p className="text-[11px] text-gray-400 mb-3">
              Physical place and surface for the wine scene. Curated per family so studio and lifestyle do not mix blindly.
            </p>
            <div className="flex flex-wrap gap-2">
              {visibleWineEnvironments.map((environment) => (
                <Chip
                  key={environment}
                  selected={wineEnvironment === environment}
                  onClick={() => {
                    const store = useProductStudioStore.getState();
                    store.setWineEnvironment(environment);
                    store.setContextPreset(environment);
                  }}
                >
                  {environment}
                </Chip>
              ))}
            </div>
          </div>
          {/* ── WINE TYPE ──────────────────────────────────────── */}
          <div className="rounded-2xl border border-rose-200/70 bg-white/80 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold mb-1">Advanced Controls</p>
                <p className="text-[11px] text-gray-400">
                  Service physics, glassware, closure, finish, and micro-detail overrides.
                </p>
              </div>
              <Chip
                selected={advancedOpen}
                onClick={() => setAdvancedOpen((prev) => !prev)}
                title={advancedOpen ? 'Hide advanced wine controls' : 'Show advanced wine controls'}
              >
                {advancedOpen ? 'Hide Advanced' : 'Show Advanced'}
              </Chip>
            </div>
          </div>
          {advancedOpen && (
          <>
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
            <p className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold mb-2">Scene</p>
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
            <p className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold mb-2">Bottle</p>
            {currentServeMode !== 'bottle-only' && (
              <p className="text-[11px] text-violet-500 mb-1 font-medium">
                ✦ {currentServeMode === 'pouring' ? 'Pouring' : 'Served'} forces an opened bottle
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              {WINE_BOTTLE_STATE_OPTIONS.map((option) => (
                <Chip
                  key={option.value}
                  selected={currentBottleState === option.value}
                  disabled={currentServeMode !== 'bottle-only'}
                  onClick={() => setBottleState(option.value)}
                  title={option.description}
                >
                  {option.label}
                </Chip>
              ))}
            </div>
            <p className="text-[11px] text-gray-400 mt-1">
              {currentBottleState === 'sealed'
                ? 'Closed bottle for unopened hero or bottle-only scenes.'
                : 'Open bottle. Required for scenes with glass service or pouring.'}
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
          {(currentServeMode === 'served' || currentBottleState === 'opened-with-cork-nearby') && !isMacroLabelMode && (
            <div>
              <p className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold mb-2">Fill</p>
              <div className="flex flex-wrap gap-2">
                {WINE_BOTTLE_FILL_OPTIONS.map((option) => (
                  <Chip
                    key={option.value}
                    selected={currentBottleFillMode === option.value}
                    disabled={currentServeMode === 'pouring'}
                    onClick={() => setBottleFill(option.value)}
                    title={option.description}
                  >
                    {option.label}
                  </Chip>
                ))}
              </div>
              <p className="text-[11px] text-gray-400 mt-1">
                {currentServeMode === 'served'
                  ? currentBottleFillMode === 'just-opened'
                    ? 'Opened bottle in a served scene that still reads full.'
                    : 'Opened bottle in a served scene with reduced liquid.'
                  : currentBottleFillMode === 'just-opened'
                    ? 'Opened bottle-only scene that still reads full.'
                    : 'Opened bottle-only scene with reduced liquid.'}
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
            <p className="text-[11px] text-gray-400 mt-1">
              Use sparingly. This is an override layer, not the main scene definition.
            </p>
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
          </>
          )}
        </div>
      )}
    </div>
  );
}
