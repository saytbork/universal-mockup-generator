import type {
  ProductStudioState,
  WineAction,
  WineEnvironmentPreset,
  WineLightingTone,
  WineMoodModifier,
  WinePourStyle,
} from './types';

export const WINE_ENVIRONMENT_PRESETS: WineEnvironmentPreset[] = [
  'Vineyard Golden Hour',
  'Oak Barrel Cellar',
  'Fine Dining Table',
  'Dark Luxury Studio',
];

export const WINE_LIGHTING_TONES: WineLightingTone[] = [
  'Warm Lateral',
  'Golden Ambient',
  'Cellar Dramatic',
  'Candle Intimate',
];

export const WINE_MODIFIERS: WineMoodModifier[] = [
  'None',
  'Vintage Film Grain',
  'Terroir Mood Tone',
  'Deep Burgundy Contrast Boost',
  'Soft Barrel Ambient Haze',
  'Elegant Reflection Layer',
];

export const WINE_ACTION_OPTIONS: WineAction[] = ['static-presentation', 'controlled-pour'];

export const WINE_POUR_STYLE_OPTIONS: WinePourStyle[] = [
  'slow-ribbon',
  'mid-flow-elegance',
  'peak-glass-impact',
];

const normalize = (value: unknown): string => String(value || '').trim().toLowerCase();

export function isWinePrestigeMode(state: Pick<ProductStudioState, 'category' | 'contextPreset' | 'visualProfile'>): boolean {
  const category = normalize(state.category);
  const contextPreset = normalize(state.contextPreset);
  const visualProfile = normalize(state.visualProfile);
  return (
    category === 'wine' ||
    contextPreset === 'winery / vineyard' ||
    visualProfile === 'wine-prestige'
  );
}

export function isWinePrestigeV2Mode(
  state: Pick<ProductStudioState, 'visualProfile' | 'wineAction'>
): boolean {
  return normalize(state.visualProfile) === 'wine-prestige' && normalize(state.wineAction) === 'controlled-pour';
}

export function getWineEnvironmentNarrative(preset: string): string {
  switch (preset) {
    case 'Vineyard Golden Hour':
      return 'WINE_ENVIRONMENT: Vineyard Golden Hour. Long rows of vines, warm sunset light, soft background depth, and subtle wind realism.';
    case 'Oak Barrel Cellar':
      return 'WINE_ENVIRONMENT: Oak Barrel Cellar. Wooden barrels, warm directional side light, subtle dust particles, and moist cellar atmosphere.';
    case 'Fine Dining Table':
      return 'WINE_ENVIRONMENT: Fine Dining Table. Dark table surface, crystal glassware, intimate candle glow, and refined ambience.';
    case 'Dark Luxury Studio':
      return 'WINE_ENVIRONMENT: Dark Luxury Studio. Matte black background, stone or marble base, dramatic spotlight, and controlled reflections.';
    case 'Winery / Vineyard':
      return 'WINE_ENVIRONMENT: Winery / Vineyard. Vineyard rows with warm golden-hour atmosphere and cinematic depth.';
    default:
      return 'WINE_ENVIRONMENT: Dark Luxury Studio. Matte black background, stone or marble base, dramatic spotlight, and controlled reflections.';
  }
}
