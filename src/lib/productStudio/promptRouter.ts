import type { IndustryProfile, ProductAsset, ProductStateMotion, ProductStudioState } from './types';
import { mapSceneToPrompt, type ScenePromptResult } from './mapSceneToPrompt';
import { generateStudioPromptV2, type StudioUIState } from '../productStudioV2/index';
import { resolveIndustryProfileModule } from '../productStudioV2/industryProfiles/registry';
import { industryRules } from './industryRules';
import { resolveCoffeeIndustryIntent, type CoffeeIndustryIntent } from './resolveCoffeeIntent';
import { getWineArchetypeNarrative } from './winePrestige';
import {
  getIndustryDefaultInteraction,
  getPhotoModeCapabilities,
  resolveCameraByCapability,
  getResolvedAllowedMotions,
  resolveAllowedInteractionsByCapability,
  resolveInteractionByCapability,
} from './capabilityResolver';

const normalize = (value: unknown): string => String(value || '').trim().toLowerCase();
const DEBUG_PROMPT_PIPELINE =
  import.meta.env.DEV || import.meta.env.VITE_DEBUG_PROMPT_PIPELINE === 'true';
const debugLog = (...args: unknown[]) => {
  if (DEBUG_PROMPT_PIPELINE) console.log(...args);
};

function isStudioV2Enabled(): boolean {
  const flag = import.meta.env.VITE_USE_STUDIO_V2;
  // If the flag is explicitly set to 'false', respect it. Otherwise default to v2.
  const enabled = flag !== 'false';
  debugLog(
    `[STUDIO ROUTER] flag v2=${flag ?? 'undefined'} source=vite enabled=${enabled}`
  );
  return enabled;
}

function assertIndustry(i: unknown): IndustryProfile {
  const normalized = String(i || '').trim().toLowerCase();
  if (normalized === 'wine' || normalized === 'wine-prestige') return 'wine';
  if (normalized === 'coffee') return 'coffee';
  return 'supplements';
}

function inferStudioWorld(state: ProductStudioState): StudioUIState['world'] | undefined {
  if (String(state.photoMode || '').trim() === 'Foam & Texture') return 'studio';
  const legacyState = state as Record<string, unknown>;
  const source = String((legacyState.environmentContext as { macro?: unknown } | undefined)?.macro || '').trim();
  if (!source) return undefined;
  if (source.includes('underwater')) return 'underwater';
  if (source.includes('splash') || source.includes('foam') || source.includes('pool water') || source.includes('tank')) {
    return 'splash-tank';
  }
  if (source.includes('studio')) return 'studio';
  return undefined;
}

function inferStudioComposition(state: ProductStudioState): StudioUIState['composition'] {
  const composition = normalize(state.composition);
  if (composition === 'flatlay') return 'flat-lay';
  if (composition === 'grid' || composition === 'grid-ready') return 'carousel';
  if (composition === 'macro') return 'macro';

  if (state.photoMode === 'Textured Bed / Scatter Base') return 'flat-lay';
  if (state.photoMode === 'Ingredient Flat Lay') return 'flat-lay';
  if (state.photoMode === 'Ingredient Stack') return 'ingredient-stack';
  if (state.photoMode === 'Macro Dew Label' || state.distance === 'macro') return 'macro';
  if (state.photoMode === 'Routine Carousel') return 'carousel';
  return 'hero';
}

function inferStudioMotionFromStateMotion(
  state: ProductStudioState,
  stateMotion: ProductStateMotion
): StudioUIState['motion'] {
  if (state.photoMode === 'Textured Bed / Scatter Base') {
    return 'static';
  }
  if (state.photoMode === 'Hands Application Clean') {
    const handPose = String(state.photoModeConfig?.dynamic?.['Hands Application Clean']?.handPose || '')
      .trim()
      .toLowerCase();
    if (handPose === 'applying' || handPose === 'opening') return 'dispensed';
  }
  if (stateMotion === 'opened') return 'opened';
  if (stateMotion === 'falling') return 'falling';
  if (stateMotion === 'dispensed') return 'dispensed';
  if (stateMotion === 'pouring' || stateMotion === 'spilled') return 'pouring';
  return 'static';
}

function inferStudioIntent(state: ProductStudioState): NonNullable<StudioUIState['creativeIntent']> {
  if (state.qualityProfile === 'clinical') return 'clinical';
  if (state.qualityProfile === 'luxury-brand') return 'luxury';
  if (state.visualIntent === 'campaign') return 'campaign';
  return 'conversion';
}

function inferSubjectOrientation(state: ProductStudioState): StudioUIState['subjectOrientation'] {
  const type = normalize(state.definition.type);
  if (type === 'drops' || type === 'skincare') return 'vertical';
  return 'square';
}

function inferLightingOverride(state: ProductStudioState): string | undefined {
  // lightingModelOverride is PRO-MODE ONLY — matches V1 behavior.
  // Basic lighting selector (natural-light / overcast / etc.) is handled via basicLighting field.
  // Do not merge the ambient/basic selector into the rig override or we end up with
  // contradictory prompts like "Prism Spotlight Duo; cozy-indoors".
  const isProMode =
    state.controlTier === 'pro' || state.advancedModeEnabled || state.proMode;
  if (!isProMode) return undefined;

  const rig = String(state.lightingRig || '').trim();
  // Only forward rig if it is a non-default value (user explicitly chose it)
  const DEFAULT_LIGHTING_RIGS = new Set(['Softbox Wrap', '']);
  if (!rig || DEFAULT_LIGHTING_RIGS.has(rig)) return undefined;

  if (rig) return rig;
  return undefined;
}

function inferRequestedModifiers(state: ProductStudioState): StudioUIState['requestedModifiers'] {
  const requested = new Set<string>();
  const photoMode = String(state.photoMode || '').trim();
  const propsText = String(state.props || '').toLowerCase();
  const selectedProps = Array.isArray(state.selectedProps)
    ? state.selectedProps.map((v: unknown) => String(v).toLowerCase())
    : [];
  const explicitEffects: string[] = Array.isArray(state.specialEffects)
    ? state.specialEffects.map((v: unknown) => String(v).trim())
    : [];
  const explicitEffectsLower = explicitEffects.map((value) => value.toLowerCase());
  const hasExplicit = (...names: string[]) =>
    names.some((name) => photoMode === name || explicitEffects.includes(name) || explicitEffectsLower.includes(name.toLowerCase()));
  const propsHaystack = [propsText, ...selectedProps].join(' | ');

  if (hasExplicit('Splash Shot', 'Beach Foam Splash', 'Pool Water', 'Underwater Split')) {
    requested.add('splash');
  }
  if (hasExplicit('Foam & Texture')) {
    requested.add('foam');
  }
  if (hasExplicit('Condensation Droplets')) {
    requested.add('condensation');
  }
  if (hasExplicit('Ice Cubes')) {
    requested.add('ice');
  }
  if (hasExplicit('Fruit Garnish / Citrus Accents') || /fruit|citrus|garnish/.test(propsHaystack)) {
    requested.add('fruit');
  }
  if (hasExplicit('Textured Bed / Scatter Base')) {
    requested.add('texturedBed');
  }
  if (hasExplicit('Floating Particles')) {
    requested.add('particles');
  }
  if (hasExplicit('Acrylic Blocks')) {
    requested.add('acrylic');
  }

  return Array.from(requested) as StudioUIState['requestedModifiers'];
}

const PRODUCT_TYPE_TO_LABEL: Record<ProductStudioState['definition']['type'], string> = {
  capsules: 'Capsules',
  gummies: 'Gummies',
  drops: 'Drops',
  powder: 'Powder',
  skincare: 'Skincare',
  device: 'Device',
  custom: 'Custom',
  dummy: 'Custom',
};

const VISUAL_STYLE_MODES = new Set([
  'Clinical Lab Counter',
  'Minimal Bathroom Vanity',
  'Dark Premium Studio',
  'Brand Campaign',
  'Creator Premium Simulation',
  'Tech Clean Studio',
  'Soft Wellness Morning',
  'Outdoor Energy Boost',
  'Sunlit Stone Editorial',
  'Golden Sunset Backlit',
  'Bathroom Daylight Clean',
  'Sky Float Minimal',
  'Wet Rock Ripples',
  'Sand Palm Shadows',
  'Botanical Water Garden',
  'Warm Window Wood',
]);

const PHOTO_MODES = new Set([
  'Hero Landing Page',
  'Routine Carousel',
  'Macro Dew Label',
  'Splash Shot',
  'Ingredient Stack',
  'Ingredient Flat Lay',
  'Foam & Texture',
  'Textured Bed / Scatter Base',
  'Gel Smear Editorial',
  'Pool Water',
  'Wine Macro Label',
  'Bottle + Glass',
  'Bottle + Glass Pour',
  'Hands Pouring Wine',
  'Wine Lineup Comparison',
  'Editorial Bottle Tabletop',
  'Bottle In Hand Cutout',
  'Rose Tasting Table',
  'Editorial Table',
  'Winery Scene',
  'Acrylic Blocks',
  'Glass Pedestal Studio',
  'Beach Foam Splash',
  'Cheers (Hands Clink)',
  'Ice Cubes',
  'Condensation Droplets',
  'Fruit Garnish / Citrus Accents',
  'Floating Particles',
  'Caustic Light Ripples',
  'Prism Rainbow Refractions',
  'Glass Refraction Panels',
  'Micro Mist Halo',
  'Shadow Pattern Projection',
  'Citrus Fresh Flat Lay',
  'Stones & Crystals Flat Lay',
  'Dried Citrus Earth',
  'Underwater Split',
  'Hands Application Clean',
]);

const CORE_PHOTO_MODES = new Set([
  'Hero Landing Page',
  'Routine Carousel',
  'Macro Dew Label',
  'Ingredient Stack',
  'Ingredient Flat Lay',
]);

const STUDIO_VISUAL_STYLES = new Set([
  'Clinical Lab Counter',
  'Minimal Bathroom Vanity',
  'Dark Premium Studio',
  'Tech Clean Studio',
]);

const BRAND_VISUAL_STYLES = new Set([
  'Brand Campaign',
  'Creator Premium Simulation',
]);

const LIFESTYLE_VISUAL_STYLES = new Set([
  'Soft Wellness Morning',
  'Outdoor Energy Boost',
  'Sunlit Stone Editorial',
  'Golden Sunset Backlit',
  'Bathroom Daylight Clean',
  'Sky Float Minimal',
  'Wet Rock Ripples',
  'Sand Palm Shadows',
  'Botanical Water Garden',
  'Warm Window Wood',
]);

function resolveVisualStyleCategory(
  visualStyle: string
): StudioUIState['visualStyleCategory'] | undefined {
  if (STUDIO_VISUAL_STYLES.has(visualStyle)) return 'studio';
  if (BRAND_VISUAL_STYLES.has(visualStyle)) return 'brand';
  if (LIFESTYLE_VISUAL_STYLES.has(visualStyle)) return 'lifestyle';
  return undefined;
}

function resolveVisualStyleFromState(state: ProductStudioState): string | undefined {
  const raw = String(state.visualStyle || '').trim();

  if (!raw) return undefined;
  if (raw === 'Monochrome Brand') {
    debugLog('[LEGACY STYLE NORMALIZED] Monochrome Brand -> cleared');
    return undefined;
  }
  if (VISUAL_STYLE_MODES.has(raw)) return raw;
  return undefined;
}

function resolveLegacyVisualStyleFromPhotoMode(state: ProductStudioState): string | undefined {
  const raw = String(state.photoMode || '').trim();
  if (!raw) return undefined;
  if (!VISUAL_STYLE_MODES.has(raw)) return undefined;
  debugLog('[LEGACY PHOTO MODE MIGRATED TO VISUAL STYLE]', raw);
  return raw;
}

function resolveEnvironmentFromState(
  state: ProductStudioState
): { value?: string; source: string; raw: string } {
  const candidates: Array<{ source: string; value: string }> = [
    { source: 'contextPreset', value: String(state.contextPreset || '').trim() },
    // Legacy aliases kept as runtime-only fallback for old Firestore documents
    { source: 'environmentContext.macro', value: String(((state as Record<string, unknown>).environmentContext as { macro?: unknown } | undefined)?.macro || '').trim() },
    { source: 'environmentPreset',        value: String(((state as Record<string, unknown>).environmentPreset as string | undefined) || '').trim() },
  ];

  const found = candidates.find((candidate) => candidate.value);
  return {
    value: found?.value,
    source: found?.source || '',
    raw: found?.value || '',
  };
}

function resolvePhotoModeFromState(state: ProductStudioState): ProductStudioState['photoMode'] | undefined {
  const raw = String(state.photoMode || '').trim();
  if (!raw) return undefined;
  if (raw === 'Color Pop Hero') {
    debugLog('[LEGACY MODE NORMALIZED] Color Pop Hero -> Hero Landing Page');
    return 'Hero Landing Page';
  }
  if (PHOTO_MODES.has(raw)) return raw as ProductStudioState['photoMode'];
  return undefined;
}

const SPECIAL_EFFECT_MODES = new Set([
  'Splash Shot',
  'Beach Foam Splash',
  'Pool Water',
  'Cheers (Hands Clink)',
  'Acrylic Blocks',
  'Foam & Texture',
  'Ice Cubes',
  'Condensation Droplets',
  'Fruit Garnish / Citrus Accents',
  'Textured Bed / Scatter Base',
  'Floating Particles',
  'Gel Smear Editorial',
  'Underwater Split',
]);

const INTERACTION_STATE_TO_CANONICAL_CANDIDATES: Record<string, string[]> = {
  none: ['none'],
  'capsule-display': ['capsule-display'],
  'applying-opening': ['applying-opening'],
  holding: ['holding'],
  'supported-hold': ['supported-hold'],
  'two-hand-hold': ['two-hand-hold', 'cheers'],
  presenting: ['presenting'],
  'passive-presence': ['passive-presence'],
  'resting-interaction': ['resting-interaction'],
  'framed-presentation': ['framed-presentation'],
  'cropped-hand': ['cropped-hand'],
  // Legacy camelCase aliases from V1
  capsuleDisplay: ['capsule-display'],
  applyingOpening: ['applying-opening'],
  supportedHold: ['supported-hold'],
  holdingBottle: ['holding'],
  glassForeground: ['two-hand-hold'],
  cheers: ['cheers'],
  cupHold: ['holding'],
  // Wine/coffee specific states — not hand interactions → none
  pouringWine: ['none'],
  pouringEspresso: ['none'],
  steam: ['none'],
  beansScatter: ['none'],
  spoonStir: ['none'],
};

const WINE_ENVIRONMENT_VARIATIONS: Array<
  NonNullable<StudioUIState['wineEnvironmentVariation']>
> = [
  'vineyard',
  'dark-cellar',
  'marble-bar',
  'minimal-gradient',
  'black-studio',
  'modern-kitchen',
  'luxury-dining',
  'moody-backlight',
  'sunlit-table',
  'architectural-shadow',
];

let lastWineEnvironmentIndex = -1;

function pickRandomWineEnvironment(): NonNullable<StudioUIState['wineEnvironmentVariation']> {
  if (WINE_ENVIRONMENT_VARIATIONS.length === 1) return WINE_ENVIRONMENT_VARIATIONS[0];
  let nextIndex = Math.floor(Math.random() * WINE_ENVIRONMENT_VARIATIONS.length);
  if (nextIndex === lastWineEnvironmentIndex) {
    nextIndex = (nextIndex + 1) % WINE_ENVIRONMENT_VARIATIONS.length;
  }
  lastWineEnvironmentIndex = nextIndex;
  return WINE_ENVIRONMENT_VARIATIONS[nextIndex];
}

function resolveWineEnvironmentVariation(
  selectedPreset: string
): {
  variation: NonNullable<StudioUIState['wineEnvironmentVariation']>;
  autoRandomize: boolean;
} {
  const normalized = normalize(selectedPreset);

  const presetMap: Array<[RegExp, NonNullable<StudioUIState['wineEnvironmentVariation']>]> = [
    [/vineyard|winery/, 'vineyard'],
    [/cellar|barrel/, 'dark-cellar'],
    [/marble|bar/, 'marble-bar'],
    [/minimal|gradient/, 'minimal-gradient'],
    [/black.*studio|dark luxury studio/, 'black-studio'],
    [/kitchen/, 'modern-kitchen'],
    [/dining|table/, 'luxury-dining'],
    [/moody|backlit|backlight/, 'moody-backlight'],
    [/sunlit/, 'sunlit-table'],
    [/architectural|shadow/, 'architectural-shadow'],
  ];

  if (!normalized || normalized === 'none') {
    return { variation: pickRandomWineEnvironment(), autoRandomize: true };
  }

  for (const [pattern, variation] of presetMap) {
    if (pattern.test(normalized)) {
      return { variation, autoRandomize: false };
    }
  }

  return { variation: pickRandomWineEnvironment(), autoRandomize: true };
}

function resolveWineMoodProfile(state: ProductStudioState): NonNullable<StudioUIState['wineMoodProfile']> {
  const moodModifier = normalize(state.wineMoodModifier);
  const visualIntent = normalize(state.visualIntent);
  const contextPreset = normalize(state.contextPreset);

  if (visualIntent === 'conversion') return 'ecommerce';
  if (moodModifier.includes('vintage') || moodModifier.includes('terroir')) return 'editorial';
  if (moodModifier.includes('burgundy') || moodModifier.includes('barrel') || contextPreset.includes('cellar')) {
    return 'dark-luxury';
  }
  if (moodModifier.includes('reflection') || contextPreset.includes('minimal')) return 'modern-minimal';
  return 'prestige';
}

const COFFEE_ENVIRONMENT_VARIATIONS: Array<
  NonNullable<StudioUIState['coffeeEnvironmentVariation']>
> = [
  'warm-wood-table',
  'stone-counter',
  'black-studio',
  'minimal-gradient',
  'sunlit-window',
  'modern-cafe',
  'dark-concrete',
  'architectural-shadow',
  'linen-surface',
  'marble-bar',
];

let lastCoffeeEnvironmentIndex = -1;

function pickRandomCoffeeEnvironment(): NonNullable<StudioUIState['coffeeEnvironmentVariation']> {
  if (COFFEE_ENVIRONMENT_VARIATIONS.length === 1) return COFFEE_ENVIRONMENT_VARIATIONS[0];
  let nextIndex = Math.floor(Math.random() * COFFEE_ENVIRONMENT_VARIATIONS.length);
  if (nextIndex === lastCoffeeEnvironmentIndex) {
    nextIndex = (nextIndex + 1) % COFFEE_ENVIRONMENT_VARIATIONS.length;
  }
  lastCoffeeEnvironmentIndex = nextIndex;
  return COFFEE_ENVIRONMENT_VARIATIONS[nextIndex];
}

function resolveCoffeeEnvironmentVariation(
  selectedPreset: string
): {
  variation: NonNullable<StudioUIState['coffeeEnvironmentVariation']>;
  autoRandomize: boolean;
} {
  const normalized = normalize(selectedPreset);
  const presetMap: Array<[RegExp, NonNullable<StudioUIState['coffeeEnvironmentVariation']>]> = [
    [/warm|wood|table/, 'warm-wood-table'],
    [/stone|counter/, 'stone-counter'],
    [/black.*studio/, 'black-studio'],
    [/minimal|gradient/, 'minimal-gradient'],
    [/sunlit|window|morning/, 'sunlit-window'],
    [/cafe|coffee shop/, 'modern-cafe'],
    [/dark|concrete/, 'dark-concrete'],
    [/architectural|shadow/, 'architectural-shadow'],
    [/linen|fabric/, 'linen-surface'],
    [/marble|bar/, 'marble-bar'],
  ];

  if (!normalized || normalized === 'none') {
    return { variation: pickRandomCoffeeEnvironment(), autoRandomize: true };
  }

  for (const [pattern, variation] of presetMap) {
    if (pattern.test(normalized)) return { variation, autoRandomize: false };
  }

  return { variation: pickRandomCoffeeEnvironment(), autoRandomize: true };
}

function resolveSupplementsAllowedProductStates(state: ProductStudioState): ProductStateMotion[] {
  const base: ProductStateMotion[] = ['static', 'opened', 'dispensed'];

  if (state.definition.type === 'capsules') {
    base.push('falling');
  }

  if (state.definition.type === 'powder') {
    base.push('spilled');
  }

  if (state.definition.type === 'drops') {
    base.push('pouring');
  }

  return base;
}

/**
 * Canonical keys for the coffee props tag-string protocol.
 * These are the single source of truth shared between CoffeePackagingModule (writer)
 * and resolveCoffeeIndustryLayer (reader). If a key needs renaming, change it here only.
 */
export const COFFEE_PROP_KEYS = {
  intent: 'intent',
  beans: 'beans',
  cup: 'cup',
  splash: 'splash',
  ice: 'ice',
  surface: 'surface',
  temp: 'temp',
  serveStyle: 'serve-style',
} as const;

function resolveCoffeeIndustryLayer(
  state: ProductStudioState
): {
  mode: 'studio' | 'ritual';
  motion: 'static' | 'controlled-pour';
  environment: string;
  lightingTone: string;
  mood: string;
  steam: 'none' | 'subtle' | 'visible';
  intent: CoffeeIndustryIntent;
  variant:
    | 'coffee-editorial-ritual'
    | 'coffee-premium-minimal'
    | 'coffee-color-pop-luxury'
    | 'coffee-cinematic-luxury';
  moodProfile: NonNullable<StudioUIState['coffeeMoodProfile']>;
  environmentVariation: NonNullable<StudioUIState['coffeeEnvironmentVariation']>;
  autoRandomizeEnvironment: boolean;
  temperatureProfile: NonNullable<StudioUIState['coffeeTemperatureProfile']>;
  steamVisibility: NonNullable<StudioUIState['coffeeSteamVisibility']>;
  espressoMode: boolean;
  lightingTemperatureProfile: string;
  shadowProfile: string;
  contrastProfile: string;
  compositionProfile: string;
  compositionCoverage: string;
  liquidPhysicsEnabled: boolean;
  packagingIntent:
    | 'pdp-clean'
    | 'premium-campaign'
    | 'dark-roast-luxury'
    | 'modern-minimal'
    | 'cold-brew-fresh'
    | 'bundle-hero';
  beansScatter: 'low' | 'medium' | 'high';
  cupAccent: 'none' | 'side' | 'behind-small';
  espressoSplash: 'off' | 'controlled';
  iceMode: 'off' | 'cold';
  surfaceStyle:
    | 'neutral-gradient'
    | 'dark-stone'
    | 'matte-wood'
    | 'concrete-minimal'
    | 'pure-white-pdp';
  temperatureFeel: 'warm-roast' | 'neutral-commercial' | 'cool-cold-brew';
  serveStyle: 'cup-only' | 'cup-and-bag' | 'espresso-machine';
} {
  // ── Prefer typed coffeeConfig; fall back to legacy props string parsing
  // for any state that pre-dates the migration.
  const typedConfig = state.coffeeConfig as import('./types').CoffeeConfig | undefined;
  const propsText = String(state.props || '');
  const extractCoffeeTag = (key: string, fallback: string): string => {
    const match = propsText.match(new RegExp(`coffee:${key}=([a-z0-9-]+)`, 'i'));
    return match?.[1]?.toLowerCase() || fallback;
  };

  const packagingIntent = (typedConfig?.intent ?? extractCoffeeTag(COFFEE_PROP_KEYS.intent, 'pdp-clean')) as
    | 'pdp-clean'
    | 'premium-campaign'
    | 'dark-roast-luxury'
    | 'modern-minimal'
    | 'cold-brew-fresh'
    | 'bundle-hero';
  const beansScatter = (typedConfig?.beansScatter ?? extractCoffeeTag(COFFEE_PROP_KEYS.beans, 'low')) as 'low' | 'medium' | 'high';
  const cupAccent = (typedConfig?.cupAccent ?? extractCoffeeTag(COFFEE_PROP_KEYS.cup, 'side')) as 'none' | 'side' | 'behind-small';
  const espressoSplash = (typedConfig?.espressoSplash ?? extractCoffeeTag(COFFEE_PROP_KEYS.splash, 'off')) as 'off' | 'controlled';
  const iceMode = (typedConfig?.iceMode ?? extractCoffeeTag(COFFEE_PROP_KEYS.ice, 'off')) as 'off' | 'cold';
  const surfaceStyle = (typedConfig?.surfaceStyle ?? extractCoffeeTag(COFFEE_PROP_KEYS.surface, 'neutral-gradient')) as
    | 'neutral-gradient'
    | 'dark-stone'
    | 'matte-wood'
    | 'concrete-minimal'
    | 'pure-white-pdp';
  const temperatureFeel = (typedConfig?.temperatureFeel ?? extractCoffeeTag(COFFEE_PROP_KEYS.temp, 'neutral-commercial')) as
    | 'warm-roast'
    | 'neutral-commercial'
    | 'cool-cold-brew';
  const selectedMoodModifier =
    state.coffeeMoodModifier && state.coffeeMoodModifier !== 'auto'
      ? state.coffeeMoodModifier
      : undefined;
  const cinematicLuxuryActive = selectedMoodModifier === 'coffee-cinematic-luxury';
  const serveStyleDefault = cinematicLuxuryActive ? 'cup-only' : 'cup-and-bag';
  const serveStyle = (typedConfig?.serveStyle ?? extractCoffeeTag(
    COFFEE_PROP_KEYS.serveStyle,
    serveStyleDefault
  )) as 'cup-only' | 'cup-and-bag' | 'espresso-machine';

  const mode: 'studio' | 'ritual' = state.coffeeMode === 'ritual' ? 'ritual' : 'studio';
  const intent: CoffeeIndustryIntent = resolveCoffeeIndustryIntent(state.photoMode || '', state.visualIntent);
  const environment = resolveCoffeeEnvironmentVariation(String(state.contextPreset || '').trim());
  const coffeeSignals = `${String(state.contextPreset || '')} ${String(state.props || '')} ${String(state.photoMode || '')}`.toLowerCase();
  const temperatureProfile: NonNullable<StudioUIState['coffeeTemperatureProfile']> =
    /\bice|iced|cold\b/.test(coffeeSignals) ? 'cold' : 'hot';
  const espressoMode = /\bespresso|ristretto|shot\b/.test(coffeeSignals);
  const selectedSteamLevel = state.coffeeSteamLevel;
  const steamVisibilityFromControl: NonNullable<StudioUIState['coffeeSteamVisibility']> | null =
    selectedSteamLevel === 'visible'
      ? 'high'
      : selectedSteamLevel === 'subtle'
        ? 'subtle'
        : selectedSteamLevel === 'none'
          ? 'none'
          : null;
  const steamVisibility: NonNullable<StudioUIState['coffeeSteamVisibility']> =
    cinematicLuxuryActive
      ? 'high'
      : steamVisibilityFromControl ??
        (temperatureProfile === 'hot'
          ? intent === 'editorial-ritual'
            ? 'medium'
            : intent === 'campaign'
              ? 'subtle'
              : 'subtle'
          : 'none');
  const selectedLightingTone = String(state.coffeeLightingTone || '').trim().toLowerCase();
  const liquidPhysicsEnabled = state.coffeeLiquidPhysics !== false;
  const resolvedEnvironmentVariation = cinematicLuxuryActive
    ? 'dark-concrete'
    : environment.variation;
  const lightingToneOverrides: Partial<{
    lightingTemperatureProfile: string;
    shadowProfile: string;
    contrastProfile: string;
  }> =
    cinematicLuxuryActive
      ? {
          lightingTemperatureProfile: 'warm-ritual',
          shadowProfile: 'deep-layered-soft',
          contrastProfile: 'cinematic-depth',
        }
      : selectedLightingTone === 'warm-ambient'
        ? {
            lightingTemperatureProfile: 'warm-ambient',
            shadowProfile: 'soft-deep',
            contrastProfile: 'medium',
          }
        : selectedLightingTone === 'high-contrast'
          ? {
              lightingTemperatureProfile: 'studio-color-separation',
              shadowProfile: 'refined-contrast',
              contrastProfile: 'high',
            }
          : selectedLightingTone === 'studio-balanced'
            ? {
                lightingTemperatureProfile: 'neutral-daylight',
                shadowProfile: 'controlled-soft',
                contrastProfile: 'medium-high',
              }
            : {};

  if (intent === 'campaign') {
    const cinematicCampaign = cinematicLuxuryActive;
    return {
      mode,
      motion: state.coffeeAction,
      environment: String(state.contextPreset || '').trim(),
      lightingTone: selectedLightingTone,
      mood: String(selectedMoodModifier || ''),
      steam: selectedSteamLevel === 'visible' ? 'visible' : selectedSteamLevel === 'none' ? 'none' : 'subtle',
      intent,
      variant: cinematicCampaign ? 'coffee-cinematic-luxury' : 'coffee-color-pop-luxury',
      moodProfile: (selectedMoodModifier || 'color-pop-luxury') as NonNullable<StudioUIState['coffeeMoodProfile']>,
      environmentVariation: resolvedEnvironmentVariation,
      autoRandomizeEnvironment: cinematicCampaign ? false : environment.autoRandomize,
      temperatureProfile,
      steamVisibility,
      espressoMode,
      lightingTemperatureProfile:
        lightingToneOverrides.lightingTemperatureProfile ||
        (cinematicCampaign ? 'warm-ritual' : 'studio-color-separation'),
      shadowProfile: lightingToneOverrides.shadowProfile || (cinematicCampaign ? 'deep-layered-soft' : 'refined-contrast'),
      contrastProfile: lightingToneOverrides.contrastProfile || (cinematicCampaign ? 'cinematic-depth' : 'high'),
      compositionProfile: cinematicCampaign ? 'cinematic-luxury' : 'color-pop-luxury',
      compositionCoverage: cinematicCampaign ? '88–92%' : '80–90%',
      liquidPhysicsEnabled,
      packagingIntent,
      beansScatter,
      cupAccent,
      espressoSplash,
      iceMode,
      surfaceStyle,
      temperatureFeel,
      serveStyle,
    };
  }

  if (intent === 'conversion') {
    const inferredMoodProfile: NonNullable<StudioUIState['coffeeMoodProfile']> =
      !environment.autoRandomize && environment.variation === 'minimal-gradient' ? 'modern-commercial' : 'premium-minimal';
    const moodProfile: NonNullable<StudioUIState['coffeeMoodProfile']> =
      (selectedMoodModifier || inferredMoodProfile) as NonNullable<StudioUIState['coffeeMoodProfile']>;
    const cinematicConversion = moodProfile === 'coffee-cinematic-luxury';
    return {
      mode,
      motion: state.coffeeAction,
      environment: String(state.contextPreset || '').trim(),
      lightingTone: selectedLightingTone,
      mood: String(selectedMoodModifier || ''),
      steam: selectedSteamLevel === 'visible' ? 'visible' : selectedSteamLevel === 'none' ? 'none' : 'subtle',
      intent,
      variant: cinematicConversion ? 'coffee-cinematic-luxury' : 'coffee-premium-minimal',
      moodProfile,
      environmentVariation: cinematicConversion ? 'dark-concrete' : resolvedEnvironmentVariation,
      autoRandomizeEnvironment: cinematicConversion ? false : environment.autoRandomize,
      temperatureProfile,
      steamVisibility: cinematicConversion ? 'high' : steamVisibility,
      espressoMode,
      lightingTemperatureProfile:
        lightingToneOverrides.lightingTemperatureProfile ||
        (cinematicConversion ? 'warm-ritual' : 'neutral-daylight'),
      shadowProfile: lightingToneOverrides.shadowProfile || (cinematicConversion ? 'deep-layered-soft' : 'controlled-soft'),
      contrastProfile: lightingToneOverrides.contrastProfile || (cinematicConversion ? 'cinematic-depth' : 'medium-high'),
      compositionProfile: cinematicConversion ? 'cinematic-luxury' : moodProfile === 'modern-commercial' ? 'commercial-clean' : 'product-forward',
      compositionCoverage: cinematicConversion ? '88–92%' : '75–85%',
      liquidPhysicsEnabled,
      packagingIntent,
      beansScatter,
      cupAccent,
      espressoSplash,
      iceMode,
      surfaceStyle,
      temperatureFeel,
      serveStyle,
    };
  }

  const inferredMoodProfile: NonNullable<StudioUIState['coffeeMoodProfile']> =
    cinematicLuxuryActive
      ? 'coffee-cinematic-luxury'
      : resolvedEnvironmentVariation === 'dark-concrete' || resolvedEnvironmentVariation === 'architectural-shadow'
        ? 'dark-architectural'
        : resolvedEnvironmentVariation === 'sunlit-window'
          ? 'morning-natural'
          : 'ritual-editorial';
  const moodProfile: NonNullable<StudioUIState['coffeeMoodProfile']> = (
    selectedMoodModifier || inferredMoodProfile
  ) as NonNullable<StudioUIState['coffeeMoodProfile']>;
  const cinematicEditorial = moodProfile === 'coffee-cinematic-luxury';

  return {
    mode,
    motion: state.coffeeAction,
    environment: String(state.contextPreset || '').trim(),
    lightingTone: selectedLightingTone,
    mood: String(selectedMoodModifier || ''),
    steam: selectedSteamLevel === 'visible' ? 'visible' : selectedSteamLevel === 'none' ? 'none' : 'subtle',
    intent: 'editorial-ritual',
    variant: cinematicEditorial ? 'coffee-cinematic-luxury' : 'coffee-editorial-ritual',
    moodProfile,
    environmentVariation: cinematicEditorial ? 'dark-concrete' : resolvedEnvironmentVariation,
    autoRandomizeEnvironment: cinematicEditorial ? false : environment.autoRandomize,
    temperatureProfile,
    steamVisibility: cinematicEditorial ? 'high' : steamVisibility,
    espressoMode,
    lightingTemperatureProfile:
      lightingToneOverrides.lightingTemperatureProfile || (cinematicEditorial ? 'warm-ritual' : 'warm-ambient'),
    shadowProfile: lightingToneOverrides.shadowProfile || (cinematicEditorial ? 'deep-layered-soft' : 'soft-deep'),
    contrastProfile: lightingToneOverrides.contrastProfile || (cinematicEditorial ? 'cinematic-depth' : 'medium'),
    compositionProfile: cinematicEditorial ? 'cinematic-luxury' : 'ritual-balance',
    compositionCoverage: cinematicEditorial ? '88–92%' : '60–70%',
    liquidPhysicsEnabled,
    packagingIntent,
    beansScatter,
    cupAccent,
    espressoSplash,
    iceMode,
    surfaceStyle,
    temperatureFeel,
    serveStyle,
  };
}

function resolveIndustryProductState(
  state: ProductStudioState,
  industryProfile: IndustryProfile,
  resolvedCoffeeIntent?: CoffeeIndustryIntent
): ProductStateMotion {
  const profile = resolveIndustryProfileModule(industryProfile);
  if (profile.resolveProductState) {
    return profile.resolveProductState(state, resolvedCoffeeIntent);
  }
  const allowed = resolveSupplementsAllowedProductStates(state);
  return allowed.includes(state.stateMotion) ? state.stateMotion : 'static';
}

function resolvePackagingBehavior(
  industryProfile: IndustryProfile,
  stateMotion: ProductStateMotion,
  state: ProductStudioState
): string {
  const profile = resolveIndustryProfileModule(industryProfile);
  if (profile.resolvePackagingBehavior) {
    return profile.resolvePackagingBehavior(state, stateMotion);
  }
  return '';
}

function inferCameraSystemOverride(state: ProductStudioState): string {
  const byKey: Record<ProductStudioState['cameraSystem'], string> = {
    dslr_mirrorless: 'DSLR / mirrorless camera system',
    macro: 'Macro lens camera system',
    telephoto: 'Telephoto compression camera system',
  };
  const uiLabel = String(state.cameraUiSystemLabel || '').trim();
  return uiLabel || byKey[state.cameraSystem];
}

function inferAngleOverride(state: ProductStudioState): string {
  const byKey: Record<ProductStudioState['angle'], string> = {
    eye_level: 'Eye level',
    '45_hero': '45° hero',
    top_down: 'Top-down flat lay',
    low_angle: 'Low angle',
    high_angle: 'High angle',
    detail_closeup: 'Detail close-up',
  };
  const uiLabel = String(state.cameraUiAngleLabel || '').trim();
  return uiLabel || byKey[state.angle];
}

function inferDistanceOverride(state: ProductStudioState): string {
  const byKey: Record<ProductStudioState['distance'], string> = {
    wide: 'Wide',
    standard: 'Standard',
    tight: 'Tight',
    macro: 'Macro',
  };
  const uiLabel = String(state.cameraUiDistanceLabel || '').trim();
  return uiLabel || byKey[state.distance];
}

function inferRotationOverride(state: ProductStudioState): string {
  const uiLabel = String(state.cameraUiRotationLabel || '').trim();
  if (uiLabel) return uiLabel;
  return `${state.rotation}°`;
}

function inferFramingGuideOverride(state: ProductStudioState): string {
  const byKey: Record<ProductStudioState['framing'], string> = {
    centered_hero: 'Centered hero',
    rule_of_thirds: 'Rule of thirds',
    left_negative: 'Left negative space',
    right_negative: 'Right negative space',
    grid_ready: 'Grid-ready',
  };
  const uiLabel = String(state.cameraUiFramingLabel || '').trim();
  return uiLabel || byKey[state.framing];
}

function normalizeCreativeDirection(state: ProductStudioState): {
  creativeIntent: NonNullable<StudioUIState['creativeIntent']>;
  visualIntent: string;
} {
  return {
    creativeIntent: inferStudioIntent(state),
    visualIntent: String(state.visualIntent || '').trim() || 'conversion',
  };
}

function normalizePhysicalPresence(state: ProductStudioState): {
  physicalPresence: string;
  placementContext: string;
  groundingMode: string;
} {
  const placement = String(state.placement || '').trim().toLowerCase();
  const physicalPresence =
    placement === 'held'
      ? 'held'
      : placement === 'air-suspended'
        ? 'suspended'
        : placement === 'supported'
          ? 'supported'
          : 'surface';

  const placementContext =
    physicalPresence === 'held'
      ? 'hand-supported hold with natural ergonomic contact'
      : physicalPresence === 'suspended'
        ? 'air-suspended placement with no base contact'
        : physicalPresence === 'supported'
          ? 'supported lean or prop contact on a stable base'
          : 'grounded base contact on a stable surface';

  const groundingMode =
    physicalPresence === 'suspended'
      ? 'controlled-floating'
      : physicalPresence === 'held'
        ? 'hand-grounded'
        : 'surface-grounded';

  return { physicalPresence, placementContext, groundingMode };
}

function normalizeMotionAndInteraction(
  state: ProductStudioState,
  resolvedPhotoMode: ProductStudioState['photoMode'] | undefined,
  capabilityResolvedProductState: ProductStateMotion
): {
  photoMode?: ProductStudioState['photoMode'];
  motion: NonNullable<StudioUIState['motion']>;
  interactionProfile: string;
  splashMedium: string;
  motionIntensity: string;
  freezeMoment: string;
  productStability: string;
  macroTightness: string;
  dropletMode: string;
  dropletDensity: string;
  highlightControl: string;
} {
  const photoModeDynamic = (state.photoModeConfig?.dynamic?.[String(resolvedPhotoMode || '')] || {}) as Record<string, unknown>;

  return {
    photoMode: resolvedPhotoMode,
    motion: inferStudioMotionFromStateMotion(state, capabilityResolvedProductState),
    interactionProfile: String(state.interaction || '').trim() || 'none',
    splashMedium: String(photoModeDynamic.splashMedium || '').trim() || 'water',
    motionIntensity: String(state.photoModeConfig?.splashShot?.motionIntensity || '').trim() || 'static',
    freezeMoment: String(state.photoModeConfig?.splashShot?.freezeMoment || '').trim() || 'peak',
    productStability: 'grounded',
    macroTightness: String(photoModeDynamic.macroTightness || '').trim() || 'Extreme',
    dropletMode:
      String(photoModeDynamic.dropletMode || '').trim() ||
      'Clean',
    dropletDensity: String(photoModeDynamic.dropletDensity || '').trim() || 'Balanced',
    highlightControl:
      String(photoModeDynamic.highlightControl || '').trim() || 'Balanced',
  };
}

function normalizeWorldAndAtmosphere(
  state: ProductStudioState,
  resolvedEnvironment: { value?: string; source: string; raw: string },
  resolvedVisualStyle: string | undefined
): {
  environmentPreset?: string;
  visualStyle?: string;
  visualStyleCategory?: StudioUIState['visualStyleCategory'];
  atmosphereMode: string;
} {
  return {
    environmentPreset: resolvedEnvironment.value,
    visualStyle: resolvedVisualStyle,
    visualStyleCategory: resolvedVisualStyle ? resolveVisualStyleCategory(resolvedVisualStyle) : undefined,
    atmosphereMode: 'neutral',
  };
}

function normalizeProductCharacter(
  state: ProductStudioState,
  industryProfile: IndustryProfile
): {
  industryProfile: IndustryProfile;
  visualProfile: string;
  productType: string;
  packagingType: string;
} {
  return {
    industryProfile,
    visualProfile: industryProfile,
    productType: PRODUCT_TYPE_TO_LABEL[state.definition.type],
    packagingType: String(state.packagingMode || '').trim() || 'standard',
  };
}

function normalizeCinematography(
  state: ProductStudioState,
  resolvedPhotoMode: ProductStudioState['photoMode'] | undefined,
  industryProfile: IndustryProfile,
  packagingBehavior: string
): {
  camera: ReturnType<typeof resolveCameraByCapability>;
  composition: StudioUIState['composition'];
} {
  const userSelection = {
    cameraSystem: inferCameraSystemOverride(state),
    cameraAngle: inferAngleOverride(state),
    cameraDistance: inferDistanceOverride(state),
    cameraRotation: inferRotationOverride(state),
    framingGuide: inferFramingGuideOverride(state),
  };
  const resolvedCamera = resolvedPhotoMode
    ? resolveCameraByCapability(
        resolvedPhotoMode,
        userSelection,
        industryProfile,
        {
          wineCorkRemovalActive: packagingBehavior === 'wine-cork-removal',
          distortionRiskThreshold: 0.75,
        }
      )
    : {
        cameraSystem: userSelection.cameraSystem || 'DSLR / mirrorless camera system',
        cameraAngle: userSelection.cameraAngle || 'Eye level',
        cameraDistance: userSelection.cameraDistance || 'Standard',
        cameraRotation: userSelection.cameraRotation || '0°',
        framingGuide: userSelection.framingGuide || 'Centered product',
        warnings: [] as string[],
      };

  return {
    camera: resolvedCamera,
    composition: inferStudioComposition(state),
  };
}

export function toStudioV2State(state: ProductStudioState): StudioUIState {
  const photoModeRaw = String(state.photoMode || '').trim();
  const legacyVisualStyle = resolveLegacyVisualStyleFromPhotoMode(state);
  const preResolvedPhotoMode = legacyVisualStyle ? undefined : resolvePhotoModeFromState(state);
  const requestedModifiers = inferRequestedModifiers(state);
  const industryProfile = assertIndustry(
    state.industryProfile || state.visualProfile
  );
  const industryModule = resolveIndustryProfileModule(industryProfile);
  const layerByIndustry: Partial<Record<IndustryProfile, ReturnType<typeof resolveCoffeeIndustryLayer>>> = {
    coffee: resolveCoffeeIndustryLayer(state),
  };
  const coffeeLayer = layerByIndustry[industryProfile] || null;
  const resolvedVisualStyle = resolveVisualStyleFromState(state) || legacyVisualStyle;
  const resolvedPhotoMode =
    resolvedVisualStyle && preResolvedPhotoMode && CORE_PHOTO_MODES.has(preResolvedPhotoMode)
      ? undefined
      : preResolvedPhotoMode;
  const photoModeCapabilities = resolvedPhotoMode
    ? getPhotoModeCapabilities(resolvedPhotoMode)
    : { interactionCapability: 'optional' as const, stateMotionCapability: 'limited' as const };
  const resolvedAllowedMotions = resolvedPhotoMode
    ? getResolvedAllowedMotions(
        resolvedPhotoMode,
        industryProfile,
        state.definition.type,
        coffeeLayer?.intent
      )
    : getResolvedAllowedMotions(
        'Hero Landing Page',
        industryProfile,
        state.definition.type,
        coffeeLayer?.intent
      );
  const capabilityResolvedProductState = resolvedAllowedMotions.includes(state.stateMotion)
    ? state.stateMotion
    : 'static';
  const packagingBehavior = resolvePackagingBehavior(
    industryProfile,
    capabilityResolvedProductState,
    state
  );
  const normalizedCreativeDirection = normalizeCreativeDirection(state);
  const normalizedPhysicalPresence = normalizePhysicalPresence(state);
  const normalizedMotionInteraction = normalizeMotionAndInteraction(
    state,
    resolvedPhotoMode,
    capabilityResolvedProductState
  );
  const advancedControls =
    state.controlTier === 'pro' || state.advancedModeEnabled || state.proMode;
  const normalizedCinematography = normalizeCinematography(
    state,
    resolvedPhotoMode,
    industryProfile,
    packagingBehavior
  );
  const resolvedCamera = normalizedCinematography.camera;
  for (const warning of resolvedCamera.warnings) {
    console.warn(`[CAMERA SAFETY] ${warning}`);
  }
  const wineEnabledProfiles = new Set<IndustryProfile>(['wine']);
  const shouldAssignWineFields = wineEnabledProfiles.has(industryProfile);
  const isExplicitWineIndustry = String(state.industryProfile || '').trim().toLowerCase() === 'wine';
  const isWineHeroLanding =
    isExplicitWineIndustry && industryProfile === 'wine' && resolvedPhotoMode === 'Hero Landing Page';
  const isWinePourMode =
    industryProfile === 'wine' &&
    (resolvedPhotoMode === 'Bottle + Glass Pour' || resolvedPhotoMode === 'Hands Pouring Wine');
  const isWineGlassMode =
    industryProfile === 'wine' &&
    (resolvedPhotoMode === 'Bottle + Glass' ||
      resolvedPhotoMode === 'Bottle + Glass Pour' ||
      resolvedPhotoMode === 'Hands Pouring Wine' ||
      resolvedPhotoMode === 'Rose Tasting Table');
  const isWineServedPresentationMode =
    industryProfile === 'wine' &&
    (resolvedPhotoMode === 'Bottle + Glass' ||
      resolvedPhotoMode === 'Bottle + Glass Pour' ||
      resolvedPhotoMode === 'Hands Pouring Wine' ||
      resolvedPhotoMode === 'Rose Tasting Table');
  const resolvedWineAction =
    isWinePourMode ? 'controlled-pour' : 'static-presentation';
  const resolvedWineGlassMode =
    isWineHeroLanding ? 'none' : isWineGlassMode ? 'filled' : state.wineGlassMode;
  const resolvedWineBottleState =
    isWineHeroLanding
      ? 'sealed'
      : isWineServedPresentationMode
        ? 'opened-with-cork-nearby'
        : state.wineBottleState;
  const splashMotionIntensity = String(state.photoModeConfig?.splashShot?.motionIntensity || '').trim();
  const splashFreezeMoment = String(state.photoModeConfig?.splashShot?.freezeMoment || '').trim();
  const splashAdMode =
    resolvedPhotoMode === 'Splash Shot' &&
    splashMotionIntensity === 'Explosive';
  const winePrestigeMode = wineEnabledProfiles.has(industryProfile);
  const winePrestigeV2Mode = false;
  const wineEnvironment = winePrestigeMode
    ? resolveWineEnvironmentVariation(String(state.contextPreset || '').trim())
    : null;
  const effectiveWineEnvironment =
    winePrestigeMode && resolvedPhotoMode === 'Winery Scene'
      ? {
          variation: 'dark-cellar' as NonNullable<StudioUIState['wineEnvironmentVariation']>,
          autoRandomize: false,
        }
      : wineEnvironment;
  const wineMoodProfile = winePrestigeMode ? resolveWineMoodProfile(state) : undefined;
  const wineArchetypeNarrative = winePrestigeMode
    ? getWineArchetypeNarrative(state.wineStyleArchetype ?? null)
    : '';
  const resolvedEnvironment = resolveEnvironmentFromState(state);
  const normalizedWorldAtmosphere = normalizeWorldAndAtmosphere(
    state,
    resolvedEnvironment,
    resolvedVisualStyle
  );
  const normalizedProductCharacter = normalizeProductCharacter(state, industryProfile);
  debugLog('[PHOTO MODE RAW]', photoModeRaw);
  debugLog('[PHOTO MODE RESOLVED]', resolvedPhotoMode || '');
  debugLog('[VISUAL STYLE RAW]', resolvedVisualStyle || '');
  debugLog('[VISUAL STYLE RESOLVED]', resolvedVisualStyle || '');
  debugLog('[VISUAL STYLE CATEGORY]', normalizedWorldAtmosphere.visualStyleCategory || '');
  debugLog('[ENVIRONMENT RAW]', resolvedEnvironment.raw || '');
  debugLog('[ENVIRONMENT FIELD SOURCE]', resolvedEnvironment.source || '');
  debugLog('[CREATIVE DIRECTION RESOLVED]', normalizedCreativeDirection);
  debugLog('[PHYSICAL PRESENCE RESOLVED]', normalizedPhysicalPresence);
  debugLog('[MOTION & INTERACTION RESOLVED]', normalizedMotionInteraction);
  debugLog('[WORLD & ATMOSPHERE RESOLVED]', normalizedWorldAtmosphere);
  debugLog('[PRODUCT CHARACTER RESOLVED]', normalizedProductCharacter);
  debugLog('[CINEMATOGRAPHY RESOLVED]', {
    cameraAngle: resolvedCamera.cameraAngle,
    cameraDistance: resolvedCamera.cameraDistance,
    cameraRotation: resolvedCamera.cameraRotation,
    framingGuide: resolvedCamera.framingGuide,
    composition: normalizedCinematography.composition,
  });
  const v2State: StudioUIState = {
    industryProfile,
    creativeIntent: normalizedCreativeDirection.creativeIntent,
    visualIntent:
      ({ coffee: coffeeLayer?.intent } as Partial<Record<IndustryProfile, string | undefined>>)[industryProfile] ||
      normalizedCreativeDirection.visualIntent,
    visualProfile: normalizedProductCharacter.visualProfile,
    coffeeIndustryLayer: false,
    autoRandomizeCoffeeEnvironment: false,
    world: inferStudioWorld(state),
    motion: normalizedMotionInteraction.motion,
    composition: normalizedCinematography.composition,
    ...(advancedControls ? { advancedControls: true } : {}),
    lightingModelOverride: inferLightingOverride(state),
    aspectRatio: state.aspectRatio,
    photoMode: normalizedMotionInteraction.photoMode,
    subjectOrientation: inferSubjectOrientation(state),
    cameraSystem: resolvedCamera.cameraSystem,
    cameraAngle: resolvedCamera.cameraAngle,
    cameraDistance: resolvedCamera.cameraDistance,
    cameraRotation: resolvedCamera.cameraRotation,
    framingGuide: resolvedCamera.framingGuide,
    requestedModifiers,
    // Bundle state (for framing logic)
    ...(state.bundle?.enabled && state.bundle.primaryProductId
      ? { bundle: { enabled: true, primaryProductId: state.bundle.primaryProductId } }
      : {}),
    // Pro Mode light color controls
    ...(state.customLightColor ? { customLightColor: state.customLightColor } : {}),
    ...(state.lightColorTemp ? { lightColorTemp: state.lightColorTemp } : {}),
    ...(state.accentLightIntensity !== undefined ? { accentLightIntensity: state.accentLightIntensity } : {}),
    ...(splashMotionIntensity ? { splashMotionIntensity } : {}),
    ...(splashFreezeMoment ? { splashFreezeMoment } : {}),
    ...(splashAdMode ? { splashAdMode: true } : {}),
    ...(winePrestigeMode ? { winePrestigeMode: true } : {}),
    ...(winePrestigeV2Mode ? { winePrestigeV2Mode: true } : {}),
    ...(effectiveWineEnvironment
      ? {
          wineEnvironmentVariation: effectiveWineEnvironment.variation,
          autoRandomizeWineEnvironment: effectiveWineEnvironment.autoRandomize,
        }
      : {}),
    ...(wineMoodProfile ? { wineMoodProfile } : {}),
    ...(shouldAssignWineFields
      ? {
          ...(isWineHeroLanding
            ? {
                wineGlassMode: 'none',
                wineBottleState: 'sealed',
              }
            : {}),
          ...(state.contextPreset ? { wineContextPreset: state.contextPreset } : {}),
          ...(state.wineLightingTone ? { wineLightingTone: state.wineLightingTone } : {}),
          ...(state.wineMoodModifier ? { wineMoodModifier: state.wineMoodModifier } : {}),
          wineEngineVersion: state.wineEngineVersion,
          wineAction: resolvedWineAction,
          ...(state.winePourStyle ? { winePourStyle: state.winePourStyle } : {}),
          wineGlassMode: resolvedWineGlassMode,
          ...(state.wineGlassType ? { wineGlassType: state.wineGlassType } : {}),
          wineClosureType: state.wineClosureType,
          wineType: state.wineType,
          wineBottleState: resolvedWineBottleState,
          carbonationLevel: state.carbonationLevel,
          ...(state.wineStyleArchetype ? { wineStyleArchetype: state.wineStyleArchetype } : {}),
          ...(wineArchetypeNarrative ? { wineArchetypeNarrative } : {}),
        }
      : {}),
    ...(advancedControls
      ? {
          cameraSystemOverride: resolvedCamera.cameraSystem,
          angleOverride: resolvedCamera.cameraAngle,
          distanceOverride: resolvedCamera.cameraDistance,
          rotationOverride: resolvedCamera.cameraRotation,
          framingGuideOverride: resolvedCamera.framingGuide,
          ...(state.lens ? { lensOverride: state.lens } : {}),
          ...(state.lightingRig ? { lightingRigOverride: state.lightingRig } : {}),
          ...(state.finish ? { finishOverride: state.finish } : {}),
        }
      : {}),
    productType: normalizedProductCharacter.productType,
    packagingType: normalizedProductCharacter.packagingType,
    physicalPresence: normalizedPhysicalPresence.physicalPresence,
    placementContext: normalizedPhysicalPresence.placementContext,
    groundingMode: normalizedPhysicalPresence.groundingMode,
    interactionProfile: normalizedMotionInteraction.interactionProfile,
    splashMedium: normalizedMotionInteraction.splashMedium,
    motionIntensity: normalizedMotionInteraction.motionIntensity,
    freezeMoment: normalizedMotionInteraction.freezeMoment,
    productStability: normalizedMotionInteraction.productStability,
    macroTightness: normalizedMotionInteraction.macroTightness,
    dropletMode: normalizedMotionInteraction.dropletMode,
    dropletDensity: normalizedMotionInteraction.dropletDensity,
    highlightControl: normalizedMotionInteraction.highlightControl,
    specialEffect: resolvedPhotoMode && SPECIAL_EFFECT_MODES.has(resolvedPhotoMode) ? resolvedPhotoMode : undefined,
    visualStyle: normalizedWorldAtmosphere.visualStyle,
    ...(normalizedWorldAtmosphere.visualStyleCategory
      ? { visualStyleCategory: normalizedWorldAtmosphere.visualStyleCategory }
      : {}),
    atmosphereMode: normalizedWorldAtmosphere.atmosphereMode,
    ...(normalizedWorldAtmosphere.environmentPreset
      ? {
          environmentPreset: normalizedWorldAtmosphere.environmentPreset,
          environment: normalizedWorldAtmosphere.environmentPreset,
        }
      : {}),
    ...(coffeeLayer
      ? {
          coffeeIndustryLayer: true,
          coffeeVariant: coffeeLayer.variant,
          coffeeMode: coffeeLayer.mode,
          coffeeMotion: coffeeLayer.motion,
          coffeeEnvironment: coffeeLayer.environment,
          coffeeLightingTone: coffeeLayer.lightingTone,
          coffeeMood: coffeeLayer.mood,
          coffeeSteam: coffeeLayer.steam,
          coffeeLiquidPhysics: coffeeLayer.liquidPhysicsEnabled,
          coffeeMoodProfile: coffeeLayer.moodProfile,
          coffeeEnvironmentVariation: coffeeLayer.environmentVariation,
          autoRandomizeCoffeeEnvironment: coffeeLayer.autoRandomizeEnvironment,
          coffeeTemperatureProfile: coffeeLayer.temperatureProfile,
          coffeeSteamVisibility: coffeeLayer.steamVisibility,
          coffeeLiquidPhysicsEnabled: coffeeLayer.liquidPhysicsEnabled,
          coffeeEspressoMode: coffeeLayer.espressoMode,
          coffeeCompositionCoverage: coffeeLayer.compositionCoverage,
          coffeePackagingIntent: coffeeLayer.packagingIntent,
          coffeeBeansScatter: coffeeLayer.beansScatter,
          coffeeCupAccent: coffeeLayer.cupAccent,
          coffeeEspressoSplash: coffeeLayer.espressoSplash,
          coffeeIceMode: coffeeLayer.iceMode,
          coffeeSurfaceStyle: coffeeLayer.surfaceStyle,
          coffeeTemperatureFeel: coffeeLayer.temperatureFeel,
          coffeeServeStyle: coffeeLayer.serveStyle,
          productReferencePresent: Array.isArray(state.products) && state.products.length > 0,
        }
      : {}),
    // ── Menu option injections (last-selection-wins, read directly from state) ──
    ...(() => {
      const extras: Record<string, string> = {};
      const currentPhotoMode = resolvedPhotoMode || undefined;
      const dynamicRaw = currentPhotoMode
        ? (state.photoModeConfig?.dynamic as Record<string, unknown> | undefined)?.[currentPhotoMode]
        : undefined;
      // Legacy Firestore fields — not in ProductStudioState, read via runtime cast
      const ls = state as Record<string, unknown>;
      const environmentPreset = String(ls.environmentPreset || '').trim();
      if (environmentPreset) extras.environmentPreset = environmentPreset;
      const environmentMode = String(ls.environmentMode || '').trim();
      if (environmentMode) extras.environmentMode = environmentMode;
      const environment = String(ls.environment || '').trim();
      if (environment) extras.environment = environment;
      const lightingPreset = String(ls.lightingPreset || '').trim();
      if (lightingPreset) extras.lightingPreset = lightingPreset;
      const lightingMode = String(ls.lightingMode || '').trim();
      if (lightingMode) extras.lightingMode = lightingMode;
      const lightingRaw = String(ls.lighting || '').trim();
      if (lightingRaw) extras.lighting = lightingRaw;
      // Basic lighting selector (natural-light / overcast / cozy-indoors / ring-light)
      const basicLighting = String(ls.lighting || ls.lightingPreset || ls.lightingMode || '').trim();
      if (basicLighting) extras.basicLighting = basicLighting;
      // Viewpoint (eye-level / top-down / human-pov / suspended / display-view)
      const viewpoint = String(ls.viewpoint || '').trim();
      if (viewpoint) extras.viewpoint = viewpoint;
      // Physical placement (surface / held / supported / air-suspended)
      const physicalPlacement = String(state.placement || '').trim();
      if (physicalPlacement) extras.physicalPlacement = physicalPlacement;
      // Physical Presence sub-options
      const productMaterial = String(ls.productMaterial || '').trim();
      if (productMaterial) extras.productMaterial = productMaterial;
      const productColor = String(ls.productColor || '').trim();
      if (productColor) extras.productColor = productColor;
      const productFormScale = String(ls.productFormScale || ls.productScale || '').trim();
      if (productFormScale) extras.productFormScale = productFormScale;
      // Foam & Texture controls are read from root state in V2 builder.
      const textureType = String(ls.textureType || '').trim();
      if (textureType) extras.textureType = textureType;
      const textureDensity = String(ls.textureDensity || '').trim();
      if (textureDensity) extras.textureDensity = textureDensity;
      const focusDistance = String(ls.focusDistance || '').trim();
      if (focusDistance) extras.focusDistance = focusDistance;
      const cleanliness = String(ls.cleanliness || '').trim();
      if (cleanliness) extras.cleanliness = cleanliness;
      // Ingredient objects:
      // Primary source is state.props. For Textured Bed, also accept dynamic customIngredients
      // so V2 does not fail invariant when user entered ingredients in the mode sub-control.
      const propsIngredientObjects = String(state.props || '').trim();
      const texturedBedDynamicIngredients =
        currentPhotoMode === 'Textured Bed / Scatter Base'
          ? String((dynamicRaw as Record<string, unknown> | undefined)?.customIngredients || '').trim()
          : '';
      const ingredientObjects = propsIngredientObjects || texturedBedDynamicIngredients;
      if (ingredientObjects) extras.ingredientObjects = ingredientObjects;
      const ingredientLayout = String(ls.ingredientLayout || '').trim();
      if (ingredientLayout) extras.ingredientLayout = ingredientLayout;
      return extras;
    })(),
    // ── Photo Mode dynamic sub-settings (last-selection-wins) ──
    ...(() => {
      const currentPhotoMode = resolvedPhotoMode || undefined;
      if (!currentPhotoMode) return {};
      const dynamicRaw = (state.photoModeConfig?.dynamic as Record<string, unknown> | undefined)?.[currentPhotoMode];
      const cleaned: Record<string, string> = {};
      const normalizeMaterialState = (raw: string): string => {
        const value = raw.trim().toLowerCase();
        if (value === 'foam') return 'foam';
        if (value === 'cream') return 'cream';
        if (value === 'gel') return 'gel';
        if (value === 'powder') return 'powder';
        return '';
      };
      if (dynamicRaw && typeof dynamicRaw === 'object') {
        // Sanitize: strip empty values and customIngredients (handled separately)
        for (const [k, v] of Object.entries(dynamicRaw)) {
          if (k === 'customIngredients') continue;
          const key = String(k).trim().replace(/[^a-zA-Z0-9_\- ]/g, '');
          const val = String(v ?? '').trim();
          if (key && val) cleaned[key] = val;
        }
      }
      // ── ingredientStack sub-properties forwarding ──
      // These live outside dynamic[mode] so must be explicitly forwarded here.
      if (currentPhotoMode === 'Ingredient Stack') {
        const cfg = state.photoModeConfig?.ingredientStack;
        if (cfg) {
          if (cfg.ingredientFocus)    cleaned['ingredientFocus']    = String(cfg.ingredientFocus);
          if (cfg.stackStyle)         cleaned['stackStyle']         = String(cfg.stackStyle);
          if (cfg.ingredientPresence) cleaned['ingredientPresence'] = String(cfg.ingredientPresence);
          if (cfg.labelPriority)      cleaned['labelPriority']      = String(cfg.labelPriority);
          cleaned['backgroundEnabled'] = String(cfg.backgroundEnabled ?? false);
          if (cfg.backgroundEnabled) {
            if (cfg.backgroundType)   cleaned['backgroundType']     = String(cfg.backgroundType);
            if (cfg.gradientStyle)    cleaned['gradientStyle']      = String(cfg.gradientStyle);
            if (cfg.colorSource)      cleaned['colorSource']        = String(cfg.colorSource);
          }
        }
      }
      const materialStateFromDynamic = normalizeMaterialState(String(cleaned.materialState || ''));
      const materialStateFromTextureType = normalizeMaterialState(String(cleaned.textureType || ''));
      const resolvedMaterialState = materialStateFromDynamic || materialStateFromTextureType;

      if (!Object.keys(cleaned).length && !resolvedMaterialState) return {};
      return {
        photoModeDynamicSettings: cleaned,
        ...(resolvedMaterialState
          ? { materialState: resolvedMaterialState as StudioUIState['materialState'] }
          : {}),
      };
    })(),
    // ── Supplement / product type physical definition ──
    ...(() => {
      const physical = state.definition?.physical;
      if (!physical || !physical.kind || physical.kind === 'dummy') return {};
      return {
        productPhysicalDef: {
          kind: physical.kind,
          v: physical.v as Record<string, unknown>,
        },
      };
    })(),
    // ── Context preset (studio environment / world context) ──
    ...(() => {
      const ls = state as Record<string, unknown>;
      const contextPreset = String(state.contextPreset || ls.contextPreset || '').trim();
      const environmentPreset = String(ls.environmentPreset || '').trim();
      const environmentMode = String(ls.environmentMode || '').trim();
      const environment = String(ls.environment || '').trim();
      const resolved =
        resolvedEnvironment.value || contextPreset || environmentPreset || environmentMode || environment;
      return resolved ? { contextPresetValue: resolved } : {};
    })(),
    // ── V2 product palette injection (buildPalette reads these) ──
    // Maps V1 store palette fields → V2 StudioUIState palette fields.
    ...(() => {
      // Minimal hex sanitizer: accepts #RGB and #RRGGBB only. Returns '' for invalid values.
      const sanitizeHex = (raw: unknown): string => {
        const s = String(raw || '').trim();
        if (/^#[0-9A-Fa-f]{3}$/.test(s) || /^#[0-9A-Fa-f]{6}$/.test(s)) return s;
        // Try to repair missing '#'
        if (/^[0-9A-Fa-f]{3}$/.test(s) || /^[0-9A-Fa-f]{6}$/.test(s)) return `#${s}`;
        return '';
      };
      const parseHex = (hex: string): [number, number, number] | null => {
        const h = hex.replace('#', '');
        if (h.length !== 6) return null;
        const r = parseInt(h.slice(0, 2), 16);
        const g = parseInt(h.slice(2, 4), 16);
        const b = parseInt(h.slice(4, 6), 16);
        if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return null;
        return [r, g, b];
      };
      const toHex = (r: number, g: number, b: number): string =>
        `#${[r, g, b]
          .map((n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0'))
          .join('')}`;
      const lighten = (hex: string, amount = 15): string => {
        const rgb = parseHex(hex);
        if (!rgb) return hex;
        const t = amount / 100;
        return toHex(rgb[0] + (255 - rgb[0]) * t, rgb[1] + (255 - rgb[1]) * t, rgb[2] + (255 - rgb[2]) * t);
      };
      const darken = (hex: string, amount = 15): string => {
        const rgb = parseHex(hex);
        if (!rgb) return hex;
        const t = amount / 100;
        return toHex(rgb[0] * (1 - t), rgb[1] * (1 - t), rgb[2] * (1 - t));
      };

      const activeProduct = Array.isArray(state.products)
        ? state.products.find((p) => p.id === state.activeProductId) ?? state.products[0]
        : undefined;
      const rawDominant = sanitizeHex(activeProduct?.palette?.dominant);
      const rawSecondary = sanitizeHex(activeProduct?.palette?.secondary);
      const rawAccent = sanitizeHex(activeProduct?.palette?.accent);

      // Promote any available extracted tone to A so V2 never discards product palette
      // due to a missing dominant field.
      const labelDominant = rawDominant || rawSecondary || rawAccent;
      const labelSecondary = rawSecondary || (labelDominant ? darken(labelDominant) : '');
      const labelAccent = rawAccent || (labelDominant ? lighten(labelDominant) : '');
      const hasLabelColors = !!labelDominant;

      const paletteBlock: Record<string, unknown> = {};
      const heroPaletteSource = String(state.photoModeConfig?.heroLandingPage?.paletteSource || '').trim();
      const resolvedPaletteSource =
        heroPaletteSource === 'Custom'
          ? 'Custom'
          : heroPaletteSource === 'Neutral brand tones'
            ? 'Brand Colors'
            : hasLabelColors
              ? 'Use product label colors'
              : undefined;

      if (resolvedPaletteSource) paletteBlock.productPaletteSource = resolvedPaletteSource;

      if (resolvedPaletteSource === 'Use product label colors' && hasLabelColors) {
        paletteBlock.productPaletteA = labelDominant;
        if (labelSecondary) paletteBlock.productPaletteB = labelSecondary;
        if (labelAccent) paletteBlock.productPaletteC = labelAccent;
      } else if (resolvedPaletteSource === 'Custom') {
        const customPrimary = sanitizeHex(state.gradientStart || state.backgroundColor);
        const customSecondary = sanitizeHex(state.gradientEnd);
        const customAccent = sanitizeHex(state.gradientMid);

        if (customPrimary) paletteBlock.productPaletteA = customPrimary;
        if (customSecondary) paletteBlock.productPaletteB = customSecondary;
        if (customAccent) paletteBlock.productPaletteC = customAccent;
      } else if (resolvedPaletteSource === 'Brand Colors') {
        const brandPrimary = sanitizeHex(state.palette?.primaryColor);
        const brandSecondary = sanitizeHex(state.palette?.secondaryColor);
        const brandAccent = sanitizeHex(state.palette?.accentColor);

        if (brandPrimary || brandSecondary || brandAccent) {
          paletteBlock.brandPalette = {
            ...(brandPrimary ? { primaryColor: brandPrimary } : {}),
            ...(brandSecondary ? { secondaryColor: brandSecondary } : {}),
            ...(brandAccent ? { accentColor: brandAccent } : {}),
          };
        }
      }

      debugLog(
        '[extractProductPalette]\n' +
        `A ${labelDominant || '#f9fafb'}\n` +
        `B ${labelSecondary || '#f3f4f6'}\n` +
        `C ${labelAccent || '#e5e7eb'}`
      );

      // Forward heroLandingPage.backgroundType to V2 photoModeConfig
      const heroBackgroundType = state.photoModeConfig?.heroLandingPage?.backgroundType;
      const isLegacyColorPopHero = photoModeRaw === 'Color Pop Hero';
      if (heroBackgroundType || isLegacyColorPopHero) {
        paletteBlock.photoModeConfig = {
          heroLandingPage: {
            ...(heroBackgroundType ? { backgroundType: heroBackgroundType } : {}),
            ...(isLegacyColorPopHero ? { legacyColorPopHero: true } : {}),
          },
        };
      }

      return paletteBlock;
    })(),
  } as StudioUIState;

  const rules = industryRules[industryProfile];
  let allowedInteractions = ['none'];

  if (v2State.photoMode && rules?.allowedPhotoModes && !rules.allowedPhotoModes.includes(v2State.photoMode)) {
    v2State.photoMode = rules.allowedPhotoModes[0];
  }

  if (rules?.allowedProductTypes && !rules.allowedProductTypes.includes(v2State.productType || '')) {
    if (wineEnabledProfiles.has(industryProfile) && v2State.productType !== 'Custom') {
      console.warn('Wine profile forcing Custom product type');
    }
    v2State.productType = rules.allowedProductTypes[0];
  }

  if (rules?.allowedSpecialEffects && v2State.specialEffect && !rules.allowedSpecialEffects.includes(v2State.specialEffect)) {
    v2State.specialEffect = undefined;
  }

  if (rules?.allowedVisualStyles && v2State.visualStyle && !rules.allowedVisualStyles.includes(v2State.visualStyle)) {
    v2State.visualStyle = rules.allowedVisualStyles[0];
    v2State.visualStyleCategory = resolveVisualStyleCategory(v2State.visualStyle);
  }

  const resolvedIntent = String(coffeeLayer?.intent || 'editorial-ritual');
  const runtimePatchByIndustry: Partial<Record<IndustryProfile, Partial<StudioUIState>>> = {
    coffee: {
      visualIntent: resolvedIntent,
      lightingTemperatureProfile: coffeeLayer?.lightingTemperatureProfile,
      shadowProfile: coffeeLayer?.shadowProfile,
      contrastProfile: coffeeLayer?.contrastProfile,
      compositionProfile: coffeeLayer?.compositionProfile,
    },
  };
  Object.assign(v2State, runtimePatchByIndustry[industryProfile] || {});

  const interactionWhitelistByIndustry: Record<IndustryProfile, string[]> = {
    coffee: rules?.interactionWhitelistByIntent?.[resolvedIntent] || ['none'],
    wine: rules?.interactionWhitelist || ['none'],
    supplements: rules?.interactionWhitelist || ['none'],
  };
  const rawInteractionWhitelist = interactionWhitelistByIndustry[industryProfile] || ['none'];
  allowedInteractions = industryModule.resolveAllowedInteractions
    ? industryModule.resolveAllowedInteractions(rawInteractionWhitelist, resolvedIntent)
    : rawInteractionWhitelist;

  const capabilityAllowedInteractions = resolveAllowedInteractionsByCapability(
    allowedInteractions as ProductStudioState['interaction'][],
    photoModeCapabilities.interactionCapability
  );
  const defaultInteraction = getIndustryDefaultInteraction(
    industryProfile,
    capabilityAllowedInteractions
  );
  // Priority: productStudioInteraction (from UI Physical Presence selector) > productInteraction
  // (new unified field) > state.interaction (V1 legacy field).
  // productStudioInteraction is what the Step3 UI emits — it is NOT automatically synced to
  // state.interaction by the store, so we must read it explicitly here.
  const ls = state as Record<string, unknown>;
  const productStudioInteractionRaw =
    String(ls.productStudioInteraction || '').trim() ||
    String(ls.productInteraction || '').trim();
  const forceNoInteraction = Boolean(industryModule.forceInteractionNone);
  const resolvedInteractionInput =
    forceNoInteraction ? 'none' : productStudioInteractionRaw || state.interaction;
  const interactionKey = String(resolvedInteractionInput || '').trim();
  const interactionCandidates = INTERACTION_STATE_TO_CANONICAL_CANDIDATES[interactionKey] || [interactionKey || 'none'];
  const preferredCandidate =
    interactionCandidates.find((candidate) => capabilityAllowedInteractions.includes(candidate as ProductStudioState['interaction'])) ||
    (interactionCandidates[0] as ProductStudioState['interaction']) ||
    'none';
  const sanitizedInteractionCanonical = forceNoInteraction
    ? 'none'
    : resolveInteractionByCapability(
        preferredCandidate as ProductStudioState['interaction'],
        capabilityAllowedInteractions,
        photoModeCapabilities.interactionCapability,
        defaultInteraction
      );
  const interactionAllowed =
    interactionCandidates.some((candidate) =>
      capabilityAllowedInteractions.includes(candidate as ProductStudioState['interaction'])
    ) && sanitizedInteractionCanonical === preferredCandidate;
  if (!interactionAllowed && !forceNoInteraction) {
    console.warn(`Industry interaction enforcement: profile=${industryProfile} forcing interaction to none`);
  }
  v2State.interaction = sanitizedInteractionCanonical;
  v2State.packagingBehavior = packagingBehavior;
  debugLog('[ENVIRONMENT RESOLVED]', v2State.environmentPreset || '');

  return v2State;
}

function mapV2ToScenePromptResult(prompt: string): ScenePromptResult {
  return {
    prompt,
    mode: 'HERO_NEUTRAL',
    splashMode: undefined,
    randomSeed: 'studio-v2',
  };
}

function applyIndustryPromptPolicy(prompt: string, industryProfile: IndustryProfile): string {
  const profile = resolveIndustryProfileModule(industryProfile);
  const sanitized = profile.sanitizePrompt ? profile.sanitizePrompt(prompt) : prompt;
  if (profile.validatePrompt) profile.validatePrompt(sanitized);
  return sanitized;
}

export function routeStudioScenePrompt(state: ProductStudioState, product?: ProductAsset | null): ScenePromptResult {
  // DISABLED: Wine engine isolation - now wine uses productStudioV2 pipeline
  // This allows wine to benefit from proper environment injection and photo mode blocking
  // if (state.visualProfile === 'wine') {
  //   const { buildWinePrompt } = require('../lib/wineEngine/wineEngine');
  //   const prompt = buildWinePrompt(state);
  //   return {
  //     prompt,
  //     mode: 'HERO_NEUTRAL',
  //     splashMode: undefined,
  //     randomSeed: 'wine-engine-v4',
  //   };
  // }

  if (!isStudioV2Enabled()) {
    debugLog('[STUDIO ROUTER] engine=legacy');
    return mapSceneToPrompt(state, product);
  }

  debugLog('[STUDIO ROUTER] engine=v2');
  const resolvedIndustryProfile = assertIndustry(
    state.industryProfile || state.visualProfile
  );
  resolveIndustryProfileModule(resolvedIndustryProfile);
  const v2State = toStudioV2State(state);
  debugLog('[STUDIO ROUTER] v2-state', v2State);
  debugLog('[STUDIO ROUTER] v2State.photoMode =', JSON.stringify(v2State.photoMode));
  debugLog('[STUDIO ROUTER] raw state.photoMode =', JSON.stringify(state.photoMode));
  const v2Prompt = generateStudioPromptV2(v2State);

  // Sanitize for industry-specific forbidden patterns (wine/coffee).
  const prompt = applyIndustryPromptPolicy(v2Prompt, resolvedIndustryProfile);

  debugLog('[INDUSTRY ACTIVE]', state.industryProfile);

  if (v2State.visualProfile === 'coffee' && !/\bCOFFEE_PACKAGING_MODE\b/.test(prompt)) {
    console.warn('[COFFEE PACKAGING GUARD MISSING]');
  }
  return mapV2ToScenePromptResult(prompt);
}

export { isStudioV2Enabled };
