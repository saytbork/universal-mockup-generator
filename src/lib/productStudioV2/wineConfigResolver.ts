import type { StudioUIState } from './types/studioTypes.ts';

export type BottlePresentationMode =
  | 'sealed'
  | 'open'
  | 'open-glass-empty'
  | 'open-glass-served';

export type WineGlassFillLevel = 'none' | 'half';

export type ResolvedWineConfig = {
  bottlePresentationMode: BottlePresentationMode;
  bottleState: 'sealed' | 'open';
  glassMode: 'none' | 'present';
  glassFillLevel: WineGlassFillLevel;
  closurePlacement: 'in-neck' | 'on-surface';
  closureType: 'cork' | 'screwcap' | 'synthetic' | 'crown';
  allowGlassDependentLighting: boolean;
};

function normalize(value: unknown): string {
  return String(value || '').trim().toLowerCase();
}

function resolveClosureType(closureType?: string): ResolvedWineConfig['closureType'] {
  const normalized = normalize(closureType);
  if (normalized.includes('screw')) return 'screwcap';
  if (normalized.includes('synthetic')) return 'synthetic';
  if (normalized.includes('crown')) return 'crown';
  return 'cork';
}

function inferBottlePresentationMode(state: StudioUIState): BottlePresentationMode {
  const fromState = normalize((state as StudioUIState & { bottlePresentationMode?: string }).bottlePresentationMode);
  const wineAction = normalize(state.wineAction);

  if (wineAction === 'controlled-pour') return 'open-glass-served';
  switch (fromState) {
    case 'sealed':
      return 'sealed';
    case 'open':
      return 'open';
    case 'open-glass-empty':
      return 'open-glass-empty';
    case 'open-glass-served':
      return 'open-glass-served';
    default:
      return 'sealed';
  }
}

export function resolveDeterministicWineConfig(state: StudioUIState): ResolvedWineConfig {
  const mode = inferBottlePresentationMode(state);
  const closureType = resolveClosureType(state.wineClosureType);

  if (mode === 'sealed') {
    return {
      bottlePresentationMode: mode,
      bottleState: 'sealed',
      glassMode: 'none',
      glassFillLevel: 'none',
      closurePlacement: 'in-neck',
      closureType,
      allowGlassDependentLighting: false,
    };
  }

  if (mode === 'open') {
    return {
      bottlePresentationMode: mode,
      bottleState: 'open',
      glassMode: 'none',
      glassFillLevel: 'none',
      closurePlacement: 'on-surface',
      closureType,
      allowGlassDependentLighting: true,
    };
  }

  if (mode === 'open-glass-empty') {
    return {
      bottlePresentationMode: mode,
      bottleState: 'open',
      glassMode: 'present',
      glassFillLevel: 'none',
      closurePlacement: 'on-surface',
      closureType,
      allowGlassDependentLighting: true,
    };
  }

  return {
    bottlePresentationMode: mode,
    bottleState: 'open',
    glassMode: 'present',
    glassFillLevel: 'half',
    closurePlacement: 'on-surface',
    closureType,
    allowGlassDependentLighting: true,
  };
}

export function applyWineDeterministicStateMachine(state: StudioUIState): StudioUIState {
  const resolved = resolveDeterministicWineConfig(state);
  const derivedBottleState: NonNullable<StudioUIState['wineBottleState']> =
    resolved.bottleState === 'sealed' ? 'sealed' : 'opened-with-cork-nearby';
  const derivedGlassMode: NonNullable<StudioUIState['wineGlassMode']> =
    resolved.glassMode === 'none'
      ? 'none'
      : resolved.glassFillLevel === 'half'
        ? 'filled'
        : 'empty';
  return {
    ...state,
    wineBottleState: derivedBottleState,
    wineGlassMode: derivedGlassMode,
  };
}

export function buildWineConfigResolvedBlock(state: StudioUIState, config: ResolvedWineConfig): string {
  const wineType = String(state.wineType || 'red').trim();
  const closureType = String(state.wineClosureType || config.closureType).trim();
  const carbonationLevel = String(state.carbonationLevel || 'none').trim();
  return [
    'WINE_CONFIG_RESOLVED:',
    `wineType=${wineType};`,
    `closureType=${closureType};`,
    `bottlePresentationMode=${config.bottlePresentationMode};`,
    `bottleState=${config.bottleState};`,
    `glassMode=${config.glassMode};`,
    `glassFillLevel=${config.glassFillLevel};`,
    `carbonationLevel=${carbonationLevel}.`,
  ].join(' ');
}

export function buildWineEngineStatusBlock(): string {
  return 'WINE_ENGINE_STATUS: active. deterministic. vertical-isolation=on.';
}

function buildClosureTypeRule(closureType: ResolvedWineConfig['closureType']): string {
  if (closureType === 'screwcap') return 'If screwcap -> same screwcap model only.';
  if (closureType === 'synthetic') return 'If synthetic -> preserve synthetic closure.';
  if (closureType === 'crown') return 'If crown -> metal crown only.';
  return 'If cork -> natural cork only.';
}

function buildCarbonationRule(carbonationLevel?: StudioUIState['carbonationLevel']): string {
  return normalize(carbonationLevel) === 'high'
    ? 'CARBONATION_RULE: If carbonationLevel = high: Must show visible bubbles. Must use appropriate sparkling glass silhouette.'
    : 'CARBONATION_RULE: If carbonationLevel = none: No bubbles allowed.';
}

export function buildWineTruthLockBlock(state: StudioUIState, config: ResolvedWineConfig): string {
  const openStateRule =
    config.bottlePresentationMode === 'sealed'
      ? 'OPEN_STATE_COHERENCE: If bottleState = closed: No cork outside bottle.'
      : config.bottlePresentationMode === 'open'
        ? 'OPEN_STATE_COHERENCE: If bottleState = open: closure must be removed from neck. closure must be placed on surface. closure type must match reference. no duplicate closures allowed.'
        : config.bottlePresentationMode === 'open-glass-empty'
          ? 'OPEN_STATE_COHERENCE: If bottleState = open-glass-empty: closure placed on surface. bottle liquid level unchanged.'
          : 'OPEN_STATE_COHERENCE: If bottleState = open-glass-served: closure placed on surface. bottle liquid level reduced proportionally. forbid full bottle + filled glass scenario.';

  const closurePlacementRule =
    config.bottlePresentationMode === 'sealed'
      ? 'When bottle is sealed: closure must remain on neck, no loose closure visible.'
      : 'When bottle is open: Remove closure from neck. Place identical closure on surface. Preserve scale, material, branding. No invented closures. No duplication.';

  return [
    'WINE_TRUTH_LOCK:',
    'PRODUCT_WINE_COLOR_LOCK: Bottle liquid color must match reference exactly.',
    'LIQUID_MATCH_RULE: If glass is present, liquid color in glass MUST match bottle liquid exactly.',
    'LIQUID_ABSOLUTE_LOCK: Bottle liquid color must match reference exactly. Glass liquid color must match bottle liquid exactly. No hue shift. No reinterpretation. No brightness shift. No saturation drift.',
    'WINE_SPECTRAL_COLOR_LOCK: The liquid chroma must be derived directly from the reference image. Preserve original hue band within +-2 deg hue tolerance. Preserve original saturation within +-5%. Preserve original luminance density profile inside bottle core. Glass refraction must not alter perceived liquid color identity. No reinterpretation due to lighting bias. No warming, cooling, cinematic grading, or environmental color contamination. Wine color must remain spectrally stable across bottle and glass. If lighting introduces color bias, the liquid must resist global color cast.',
    'REFRACTION_COLOR_INTEGRITY: Glass distortion may alter shape but not hue. Edge glow may increase luminance but must not shift chroma. Core color must match reference center density.',
    'ENVIRONMENT_COLOR_ISOLATION: Background warmth, vineyard haze, or ambient lighting must not tint the wine liquid. Liquid color is immune to environmental grading.',
    'WINE_MOOD_PROFILE_COLOR_BIAS_LOCK: Warm lighting may affect environment only. Liquid color must remain reference-accurate.',
    'PRODUCT_CLOSURE_LOCK: Closure type must match detected reference closure.',
    buildClosureTypeRule(config.closureType),
    openStateRule,
    buildCarbonationRule(state.carbonationLevel),
    'CLOSURE_TRANSFER_RULE: Detect closure type from reference image.',
    buildClosureTypeRule(config.closureType),
    closurePlacementRule,
    'VOLUME_CONSISTENCY_RULE: If glassFillLevel != none: Bottle liquid height must be visibly reduced. Volume transfer must be physically plausible. No full bottle + filled glass state. Meniscus must match liquid density.',
    'MENISCUS_HEIGHT_LOCK: If bottlePresentationMode != sealed: Bottle liquid meniscus must appear below the reference sealed liquid height. The reduction must be visually measurable. No full-height liquid allowed when glass contains liquid.',
  ].join(' ');
}
