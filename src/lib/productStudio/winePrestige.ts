import type {
  ProductStudioState,
  WineAction,
  WineEnvironmentPreset,
  WineLightingTone,
  WineMoodModifier,
  WinePourStyle,
  WineStyleArchetype,
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

// ============================================================================
// WINE STYLE ARCHETYPE SYSTEM
// ============================================================================

export const WINE_STYLE_ARCHETYPES: WineStyleArchetype[] = [
  'Minimal Editorial Studio',
  'Ultra Minimal Black Luxury',
  'Backlit Premium Studio',
  'Moody Wood Editorial',
  'Macro Label Branding',
  'Action Pour Photography',
  'Cinematic Vineyard',
];

/**
 * Visual-only state patch applied when a style archetype is selected.
 * Physics fields (closure, carbonation, serveState, wineType) are NEVER included.
 * The caller must merge this over the current state — it does NOT replace.
 *
 * Fields that can conflict with Wine Engine physics rules are guarded at
 * application time via `isSafeToApplyArchetypeField()`.
 */
export type WineArchetypePatch = {
  contextPreset?: string;
  wineLightingTone?: WineLightingTone;
  wineMoodModifier?: WineMoodModifier;
  wineAction?: WineAction;
  composition?: string;
  lightStyle?: string;
  negativeSpace?: string;
  ambientLighting?: string;
  // Narrative-only enrichment injected at prompt-assembly time
  _archetypeNarrative: string;
};

const ARCHETYPE_PATCHES: Record<WineStyleArchetype, WineArchetypePatch> = {
  'Minimal Editorial Studio': {
    contextPreset: 'Dark Luxury Studio',
    wineLightingTone: 'Warm Lateral',
    wineMoodModifier: 'None',
    composition: 'centered',
    lightStyle: 'soft',
    negativeSpace: 'subtle',
    _archetypeNarrative:
      'WINE_STYLE_ARCHETYPE: Minimal Editorial Studio. ' +
      'Premium beige seamless background, soft lateral lighting with high-key but controlled exposure, ' +
      'clean pedestal or cube surface, warm editorial grading, eye-level camera, centered composition, ' +
      'medium-tight framing. Commercial wine photography — restrained, elegant, brand-forward.',
  },
  'Ultra Minimal Black Luxury': {
    contextPreset: 'Dark Luxury Studio',
    wineLightingTone: 'Warm Lateral',
    wineMoodModifier: 'Elegant Reflection Layer',
    composition: 'centered',
    lightStyle: 'contrast',
    negativeSpace: 'intentional',
    _archetypeNarrative:
      'WINE_STYLE_ARCHETYPE: Ultra Minimal Black Luxury. ' +
      'Deep charcoal seamless background, controlled directional light with high micro-contrast, ' +
      'crisp glass reflections, tight centered framing, neutral-cool grading. ' +
      'Modern premium winery aesthetic — architectural, precise, luxurious.',
  },
  'Backlit Premium Studio': {
    contextPreset: 'Dark Luxury Studio',
    wineLightingTone: 'Golden Ambient',
    wineMoodModifier: 'Terroir Mood Tone',
    composition: 'centered',
    lightStyle: 'shadow-play',
    negativeSpace: 'subtle',
    _archetypeNarrative:
      'WINE_STYLE_ARCHETYPE: Backlit Premium Studio. ' +
      'Strong backlight creating glow-through amber bottle effect, soft front fill, warm dark gradient background, ' +
      'emphasis on internal liquid luminosity, slight low-angle camera, medium framing. ' +
      'Translucent bottle photography with natural light diffusion through the glass.',
  },
  'Moody Wood Editorial': {
    contextPreset: 'Oak Barrel Cellar',
    wineLightingTone: 'Cellar Dramatic',
    wineMoodModifier: 'Vintage Film Grain',
    composition: 'flatlay',
    lightStyle: 'contrast',
    negativeSpace: 'none',
    _archetypeNarrative:
      'WINE_STYLE_ARCHETYPE: Moody Wood Editorial. ' +
      'Top-down camera angle, dark real wood surface with visible grain texture, hard lateral light, ' +
      'high contrast with deep shadows, minimal props, flat lay composition. ' +
      'Wine storytelling editorial — raw, textural, atmospheric.',
  },
  'Macro Label Branding': {
    contextPreset: 'Dark Luxury Studio',
    wineLightingTone: 'Warm Lateral',
    wineMoodModifier: 'None',
    composition: 'centered',
    lightStyle: 'clinical',
    negativeSpace: 'subtle',
    _archetypeNarrative:
      'WINE_STYLE_ARCHETYPE: Macro Label Branding. ' +
      'Macro distance with focus locked on label zone, grazing side light revealing label texture and embossing, ' +
      'shallow depth of field with soft background falloff, neutral clean background. ' +
      'Label-first wine photography — typographic detail, brand clarity, premium packaging showcase.',
  },
  'Action Pour Photography': {
    contextPreset: 'Dark Luxury Studio',
    wineLightingTone: 'Cellar Dramatic',
    wineMoodModifier: 'Deep Burgundy Contrast Boost',
    composition: 'thirds',
    lightStyle: 'contrast',
    negativeSpace: 'subtle',
    _archetypeNarrative:
      'WINE_STYLE_ARCHETYPE: Action Pour Photography. ' +
      'Dynamic controlled-pour moment, high-speed crisp lighting look, shallow depth of field, ' +
      'high contrast between liquid and clean neutral background, motion-frozen wine arc. ' +
      'Premium action wine photography — energy, precision, drama.',
  },
  'Cinematic Vineyard': {
    contextPreset: 'Vineyard Golden Hour',
    wineLightingTone: 'Golden Ambient',
    wineMoodModifier: 'Terroir Mood Tone',
    composition: 'thirds',
    lightStyle: 'soft',
    negativeSpace: 'subtle',
    _archetypeNarrative:
      'WINE_STYLE_ARCHETYPE: Cinematic Vineyard. ' +
      'Golden hour vineyard backdrop, warm natural lighting with lens compression, ' +
      'soft cinematic grading, subtle organic props compatible with bottle scene, ' +
      'shallow depth of field preserving bottle sharpness against blurred landscape. ' +
      'Terroir-driven cinematic wine photography — place, warmth, provenance.',
  },
};

/**
 * Physics fields that must NEVER be overridden by archetype patches.
 * These are protected by Wine Engine V4 structural lock rules.
 */
const PHYSICS_PROTECTED_FIELDS = new Set([
  'wineClosureType',
  'carbonationLevel',
  'wineType',
  'wineBottleState',
  'wineGlassMode',
  'wineServeAmount',
  'serveVolumeMode',
  'wineEngineVersion',
]);

/**
 * Returns true if the given field name is safe to apply from an archetype patch.
 * Physics-protected fields always return false.
 */
export function isSafeToApplyArchetypeField(field: string): boolean {
  return !PHYSICS_PROTECTED_FIELDS.has(field);
}

/**
 * Returns the visual-only state patch for a given archetype.
 * Only includes fields that pass the physics safety check.
 * Returns null if archetype is unrecognized or null.
 */
export function getWineArchetypePatch(
  archetype: WineStyleArchetype | string | null | undefined
): WineArchetypePatch | null {
  if (!archetype) return null;
  const patch = ARCHETYPE_PATCHES[archetype as WineStyleArchetype];
  if (!patch) return null;

  // Filter out any physics-protected fields that might drift into the patch
  const safe: Partial<WineArchetypePatch> = {};
  for (const [k, v] of Object.entries(patch)) {
    if (k === '_archetypeNarrative' || isSafeToApplyArchetypeField(k)) {
      (safe as Record<string, unknown>)[k] = v;
    }
  }
  return safe as WineArchetypePatch;
}

/**
 * Returns the prompt narrative string for a given archetype, or empty string.
 * Used by the prompt router to append archetype context to the wine prompt.
 */
export function getWineArchetypeNarrative(
  archetype: WineStyleArchetype | string | null | undefined
): string {
  if (!archetype) return '';
  const patch = ARCHETYPE_PATCHES[archetype as WineStyleArchetype];
  return patch?._archetypeNarrative ?? '';
}

/**
 * For Action Pour Photography archetype: only apply wineAction='controlled-pour'
 * if the current wine physics state is compatible (not sealed, not crown-cap locked).
 * Returns true if the pour action may be safely set.
 */
export function isActionPourCompatible(
  state: Pick<ProductStudioState, 'wineBottleState' | 'wineClosureType'>
): boolean {
  const bottleState = normalize(state.wineBottleState ?? '');
  const closure = normalize(state.wineClosureType ?? '');
  // Crown-cap implies sparkling/carbonated — pour is physics-unsafe
  if (closure === 'crown-cap') return false;
  // A sealed bottle cannot pour
  if (bottleState === 'sealed') return false;
  return true;
}
