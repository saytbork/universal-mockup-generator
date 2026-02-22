import type { StudioUIState } from './types/studioTypes.ts';

export type BottlePresentationMode =
  | 'sealed'
  | 'open'
  | 'open-glass-empty'
  | 'open-glass-served';

export type WineGlassFillLevel = 'none' | 'half';

export type ResolvedWineConfig = {
  bottlePresentationMode: BottlePresentationMode;
  bottleState: NonNullable<StudioUIState['wineBottleState']>;
  glassMode: NonNullable<StudioUIState['wineGlassMode']>;
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
  const bottleState = normalize(state.wineBottleState);
  const glassMode = normalize(state.wineGlassMode);
  const wineAction = normalize(state.wineAction);

  if (wineAction === 'controlled-pour') return 'open-glass-served';
  if (bottleState === 'sealed') return 'sealed';
  if (glassMode === 'filled') return 'open-glass-served';
  if (glassMode === 'empty') return 'open-glass-empty';
  return 'open';
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
      bottleState: 'opened-with-cork-nearby',
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
      bottleState: 'opened-with-cork-nearby',
      glassMode: 'empty',
      glassFillLevel: 'none',
      closurePlacement: 'on-surface',
      closureType,
      allowGlassDependentLighting: true,
    };
  }

  return {
    bottlePresentationMode: mode,
    bottleState: 'opened-with-cork-nearby',
    glassMode: 'filled',
    glassFillLevel: 'half',
    closurePlacement: 'on-surface',
    closureType,
    allowGlassDependentLighting: true,
  };
}

export function applyWineDeterministicStateMachine(state: StudioUIState): StudioUIState {
  const resolved = resolveDeterministicWineConfig(state);
  return {
    ...state,
    wineBottleState: resolved.bottleState,
    wineGlassMode: resolved.glassMode,
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
    'PRODUCT_CLOSURE_LOCK: Closure type must match detected reference closure.',
    buildClosureTypeRule(config.closureType),
    openStateRule,
    buildCarbonationRule(state.carbonationLevel),
    'CLOSURE_TRANSFER_RULE: Detect closure type from reference image.',
    buildClosureTypeRule(config.closureType),
    closurePlacementRule,
    'VOLUME_CONSISTENCY_RULE: If glassFillLevel != none: Bottle liquid height must be visibly reduced. Volume transfer must be physically plausible. No full bottle + filled glass state. Meniscus must match liquid density.',
  ].join(' ');
}
