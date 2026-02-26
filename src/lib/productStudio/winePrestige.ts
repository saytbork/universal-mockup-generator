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
      return 'WINE_ENVIRONMENT: Vineyard Golden Hour. Golden hour vineyard landscape softly out of focus, long vine rows creating natural leading lines toward the horizon, warm backlight grazing the grape leaves, subtle atmospheric haze in the distance, shallow depth of field, natural lens compression, realistic sunlight bloom, slight organic imperfections in foliage, high-end commercial wine photography style.';
    case 'Oak Barrel Cellar':
      return 'WINE_ENVIRONMENT: Oak Barrel Cellar. Moody underground wine cellar environment, soft directional side lighting cutting across aged oak barrels, subtle dust particles suspended in the air, deep shadow falloff, textured stone surfaces barely visible in darkness, cinematic low-key lighting, natural color absorption from wood tones, premium editorial wine photography mood.';
    case 'Fine Dining Table':
      return 'WINE_ENVIRONMENT: Fine Dining Table. Refined fine-dining setting with shallow depth of field, dark walnut table surface with soft natural grain reflections, diffused ambient lighting from the side, elegant background bokeh from distant candlelight, subtle linen texture slightly out of focus, high-end restaurant commercial photography aesthetic.';
    case 'Dark Luxury Studio':
      return 'WINE_ENVIRONMENT: Dark Luxury Studio. High-end black studio setup with seamless backdrop, controlled softbox lighting creating gentle gradient falloff, subtle edge rim light defining bottle silhouette, deep shadows with smooth tonal transitions, realistic light reflections on glass surface, luxury product photography style, ultra-clean yet dimensional.';
    case 'Winery / Vineyard':
      return 'WINE_ENVIRONMENT: Winery / Vineyard. Golden hour vineyard landscape softly out of focus, long vine rows creating natural leading lines toward the horizon, warm backlight grazing the grape leaves, subtle atmospheric haze in the distance, shallow depth of field, natural lens compression, realistic sunlight bloom, high-end commercial wine photography style.';
    default:
      return 'WINE_ENVIRONMENT: Dark Luxury Studio. High-end black studio setup with seamless backdrop, controlled softbox lighting creating gentle gradient falloff, subtle edge rim light defining bottle silhouette, deep shadows with smooth tonal transitions, realistic light reflections on glass surface, luxury product photography style, ultra-clean yet dimensional.';
  }
}
