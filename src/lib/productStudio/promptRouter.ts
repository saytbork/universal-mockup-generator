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

function isStudioV2Enabled(): boolean {
  const flag = import.meta.env.VITE_USE_STUDIO_V2;
  const enabled = flag !== 'false';
  console.log(
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
  const explicitWorld = normalize((state as any).world);
  const explicitEnvironment = normalize((state as any).environment);
  const explicitEnvironmentContext =
    normalize((state as any).environmentContext?.macro) || normalize((state as any).environmentContext?.micro);
  const source = `${explicitWorld} ${explicitEnvironment} ${explicitEnvironmentContext}`.trim();

  if (!source) return undefined;
  if (source.includes('underwater')) return 'underwater';
  if (source.includes('splash') || source.includes('foam') || source.includes('pool water') || source.includes('tank')) {
    return 'splash-tank';
  }
  if (source.includes('studio')) return 'studio';
  return undefined;
}

function inferStudioComposition(state: ProductStudioState): StudioUIState['composition'] {
  const composition = normalize((state as any).composition);
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
    const handPose = String((state as any).photoModeConfig?.dynamic?.['Hands Application Clean']?.handPose || '')
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

function inferStudioIntent(state: ProductStudioState): StudioUIState['creativeIntent'] {
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
  const isProMode =
    state.controlTier === 'pro' || state.advancedModeEnabled || state.proMode;
  if (!isProMode) return undefined;

  const rig = String((state as any).lightingRig || '').trim();
  // Only forward rig if it is a non-default value (user explicitly chose it)
  const DEFAULT_LIGHTING_RIGS = new Set(['Softbox Wrap', '']);
  if (!rig || DEFAULT_LIGHTING_RIGS.has(rig)) return undefined;

  // style (lighting) is a different field than rig — only used in PRO mode here
  const style = String((state as any).lighting || '').trim();
  if (rig && style) return `${rig}; ${style}`;
  if (rig) return rig;
  return undefined;
}

function inferRequestedModifiers(state: ProductStudioState): StudioUIState['requestedModifiers'] {
  const requested = new Set<string>();

  const photoMode = String(state.photoMode || '').toLowerCase();
  const allText = [
    photoMode,
    String((state as any).props || '').toLowerCase(),
    ...(Array.isArray((state as any).selectedProps) ? (state as any).selectedProps.map((v: unknown) => String(v).toLowerCase()) : []),
    ...(Array.isArray((state as any).specialEffects) ? (state as any).specialEffects.map((v: unknown) => String(v).toLowerCase()) : []),
  ];
  const haystack = allText.join(' | ');

  if (haystack.includes('splash') || haystack.includes('pool water') || haystack.includes('underwater')) {
    requested.add('splash');
  }
  if (haystack.includes('foam')) {
    requested.add('foam');
  }
  if (haystack.includes('condensation')) {
    requested.add('condensation');
  }
  if (haystack.includes('ice')) {
    requested.add('ice');
  }
  if (haystack.includes('fruit') || haystack.includes('citrus') || haystack.includes('garnish')) {
    requested.add('fruit');
  }
  if (haystack.includes('textured bed') || haystack.includes('scatter base') || haystack.includes('stone') || haystack.includes('sand')) {
    requested.add('texturedBed');
  }
  if (haystack.includes('particle')) {
    requested.add('particles');
  }
  if (haystack.includes('acrylic')) {
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
  'Acrylic Blocks',
  'Glass Pedestal Studio',
  'Beach Foam Splash',
  'Cheers (Hands Clink)',
  'Ice Cubes',
  'Condensation Droplets',
  'Fruit Garnish / Citrus Accents',
  'Floating Particles',
  'Citrus Fresh Flat Lay',
  'Stones & Crystals Flat Lay',
  'Dried Citrus Earth',
  'Underwater Split',
  'Hands Application Clean',
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
  const raw = String(
    (state as any).visualStyle ||
      (state as any).selectedVisualStyle ||
      (state as any).visualStylePreset ||
      (state as any).worldStyle ||
      (state as any).styleWorld ||
      (state as any).visualWorld ||
      (state as any).creativeWorld ||
      (state as any).studioWorldPreset ||
      (state as any).brandWorldPreset ||
      (state as any).lifestyleWorldPreset ||
      ''
  ).trim();

  if (!raw) return undefined;
  if (raw === 'Monochrome Brand') {
    // eslint-disable-next-line no-console
    console.log('[LEGACY STYLE NORMALIZED] Monochrome Brand -> cleared');
    return undefined;
  }
  if (VISUAL_STYLE_MODES.has(raw)) return raw;
  return undefined;
}

function resolveEnvironmentFromState(
  state: ProductStudioState
): { value?: string; source: string; raw: string } {
  const candidates: Array<{ source: string; value: string }> = [
    { source: 'environmentContext.macro', value: String((state as any).environmentContext?.macro || '').trim() },
    { source: 'contextPreset', value: String((state as any).contextPreset || '').trim() },
    { source: 'environmentPreset', value: String((state as any).environmentPreset || '').trim() },
    { source: 'environmentMode', value: String((state as any).environmentMode || '').trim() },
    { source: 'environment', value: String((state as any).environment || '').trim() },
    { source: 'selectedEnvironment', value: String((state as any).selectedEnvironment || '').trim() },
    { source: 'worldEnvironment', value: String((state as any).worldEnvironment || '').trim() },
    { source: 'studioEnvironment', value: String((state as any).studioEnvironment || '').trim() },
    { source: 'contextPresetValue', value: String((state as any).contextPresetValue || '').trim() },
    { source: 'worldPreset', value: String((state as any).worldPreset || '').trim() },
    { source: 'environmentStyle', value: String((state as any).environmentStyle || '').trim() },
    { source: 'sceneEnvironment', value: String((state as any).sceneEnvironment || '').trim() },
  ];

  const found = candidates.find((candidate) => candidate.value);
  return {
    value: found?.value,
    source: found?.source || '',
    raw: found?.value || '',
  };
}

function resolvePhotoModeFromState(state: ProductStudioState): ProductStudioState['photoMode'] {
  const raw = String(state.photoMode || '').trim();
  if (!raw) return 'Hero Landing Page';
  if (raw === 'Color Pop Hero') {
    // eslint-disable-next-line no-console
    console.log('[LEGACY MODE NORMALIZED] Color Pop Hero -> Hero Landing Page');
    return 'Hero Landing Page';
  }
  if (PHOTO_MODES.has(raw)) return raw as ProductStudioState['photoMode'];
  return 'Hero Landing Page';
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
  'Wet Rock Ripples',
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
  const propsText = String((state as any).props || '');
  const extractCoffeeTag = (key: string, fallback: string): string => {
    const match = propsText.match(new RegExp(`coffee:${key}=([a-z0-9-]+)`, 'i'));
    return match?.[1]?.toLowerCase() || fallback;
  };

  const packagingIntent = extractCoffeeTag('intent', 'pdp-clean') as
    | 'pdp-clean'
    | 'premium-campaign'
    | 'dark-roast-luxury'
    | 'modern-minimal'
    | 'cold-brew-fresh'
    | 'bundle-hero';
  const beansScatter = extractCoffeeTag('beans', 'low') as 'low' | 'medium' | 'high';
  const cupAccent = extractCoffeeTag('cup', 'side') as 'none' | 'side' | 'behind-small';
  const espressoSplash = extractCoffeeTag('splash', 'off') as 'off' | 'controlled';
  const iceMode = extractCoffeeTag('ice', 'off') as 'off' | 'cold';
  const surfaceStyle = extractCoffeeTag('surface', 'neutral-gradient') as
    | 'neutral-gradient'
    | 'dark-stone'
    | 'matte-wood'
    | 'concrete-minimal'
    | 'pure-white-pdp';
  const temperatureFeel = extractCoffeeTag('temp', 'neutral-commercial') as
    | 'warm-roast'
    | 'neutral-commercial'
    | 'cool-cold-brew';
  const selectedMoodModifier =
    state.coffeeMoodModifier && state.coffeeMoodModifier !== 'auto'
      ? state.coffeeMoodModifier
      : undefined;
  const cinematicLuxuryActive = selectedMoodModifier === 'coffee-cinematic-luxury';
  const serveStyle = extractCoffeeTag(
    'serve-style',
    cinematicLuxuryActive ? 'cup-only' : 'cup-and-bag'
  ) as 'cup-only' | 'cup-and-bag' | 'espresso-machine';

  const mode: 'studio' | 'ritual' = state.coffeeMode === 'ritual' ? 'ritual' : 'studio';
  const intent: CoffeeIndustryIntent = resolveCoffeeIndustryIntent(state.photoMode || '', state.visualIntent);
  const environment = resolveCoffeeEnvironmentVariation(String(state.contextPreset || '').trim());
  const coffeeSignals = `${String(state.contextPreset || '')} ${String((state as any).props || '')} ${String(state.photoMode || '')}`.toLowerCase();
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

export function toStudioV2State(state: ProductStudioState): StudioUIState {
  const photoModeRaw = String(state.photoMode || '').trim();
  const resolvedPhotoMode = resolvePhotoModeFromState(state);
  const requestedModifiers = inferRequestedModifiers(state);
  const industryProfile = assertIndustry(
    state.industryProfile || state.visualProfile
  );
  const industryModule = resolveIndustryProfileModule(industryProfile);
  const layerByIndustry: Partial<Record<IndustryProfile, ReturnType<typeof resolveCoffeeIndustryLayer>>> = {
    coffee: resolveCoffeeIndustryLayer(state),
  };
  const coffeeLayer = layerByIndustry[industryProfile] || null;
  const photoModeCapabilities = getPhotoModeCapabilities(resolvedPhotoMode);
  const resolvedAllowedMotions = getResolvedAllowedMotions(
    resolvedPhotoMode,
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
  const advancedControls =
    state.controlTier === 'pro' || state.advancedModeEnabled || state.proMode;
  const resolvedCamera = resolveCameraByCapability(
    state.photoMode,
    {
      cameraSystem: inferCameraSystemOverride(state),
      cameraAngle: inferAngleOverride(state),
      cameraDistance: inferDistanceOverride(state),
      cameraRotation: inferRotationOverride(state),
      framingGuide: inferFramingGuideOverride(state),
    },
    industryProfile,
    {
      wineCorkRemovalActive: packagingBehavior === 'wine-cork-removal',
      distortionRiskThreshold: 0.75,
    }
  );
  for (const warning of resolvedCamera.warnings) {
    console.warn(`[CAMERA SAFETY] ${warning}`);
  }
  const wineEnabledProfiles = new Set<IndustryProfile>(['wine']);
  const shouldAssignWineFields = wineEnabledProfiles.has(industryProfile);
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
  const wineMoodProfile = winePrestigeMode ? resolveWineMoodProfile(state) : undefined;
  const wineArchetypeNarrative = winePrestigeMode
    ? getWineArchetypeNarrative((state as any).wineStyleArchetype ?? null)
    : '';
  const visualStyleRaw = String(
    (state as any).visualStyle ||
      (state as any).selectedVisualStyle ||
      (state as any).visualStylePreset ||
      (state as any).worldStyle ||
      (state as any).styleWorld ||
      (state as any).visualWorld ||
      (state as any).creativeWorld ||
      (state as any).studioWorldPreset ||
      (state as any).brandWorldPreset ||
      (state as any).lifestyleWorldPreset ||
      ''
  ).trim();
  const resolvedVisualStyle = resolveVisualStyleFromState(state);
  const resolvedVisualStyleCategory = resolvedVisualStyle
    ? resolveVisualStyleCategory(resolvedVisualStyle)
    : undefined;
  const resolvedEnvironment = resolveEnvironmentFromState(state);
  // eslint-disable-next-line no-console
  console.log('[PHOTO MODE RAW]', photoModeRaw);
  // eslint-disable-next-line no-console
  console.log('[PHOTO MODE RESOLVED]', resolvedPhotoMode || '');
  // eslint-disable-next-line no-console
  console.log('[VISUAL STYLE RAW]', visualStyleRaw);
  // eslint-disable-next-line no-console
  console.log('[VISUAL STYLE RESOLVED]', resolvedVisualStyle || '');
  // eslint-disable-next-line no-console
  console.log('[VISUAL STYLE CATEGORY]', resolvedVisualStyleCategory || '');
  // eslint-disable-next-line no-console
  console.log('[ENVIRONMENT RAW]', resolvedEnvironment.raw || '');
  // eslint-disable-next-line no-console
  console.log('[ENVIRONMENT FIELD SOURCE]', resolvedEnvironment.source || '');
  const v2State: StudioUIState = {
    industryProfile,
    creativeIntent: inferStudioIntent(state),
    visualIntent:
      ({ coffee: coffeeLayer?.intent } as Partial<Record<IndustryProfile, string | undefined>>)[industryProfile] ||
      state.visualIntent,
    visualProfile: industryProfile,
    coffeeIndustryLayer: false,
    autoRandomizeCoffeeEnvironment: false,
    world: inferStudioWorld(state),
    motion: inferStudioMotionFromStateMotion(state, capabilityResolvedProductState),
    composition: inferStudioComposition(state),
    ...(advancedControls ? { advancedControls: true } : {}),
    lightingModelOverride: inferLightingOverride(state),
    aspectRatio: state.aspectRatio,
    photoMode: resolvedPhotoMode,
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
    ...(wineEnvironment
      ? {
          wineEnvironmentVariation: wineEnvironment.variation,
          autoRandomizeWineEnvironment: wineEnvironment.autoRandomize,
        }
      : {}),
    ...(wineMoodProfile ? { wineMoodProfile } : {}),
    ...(shouldAssignWineFields
      ? {
          ...(state.contextPreset ? { wineContextPreset: state.contextPreset } : {}),
          ...(state.wineLightingTone ? { wineLightingTone: state.wineLightingTone } : {}),
          ...(state.wineMoodModifier ? { wineMoodModifier: state.wineMoodModifier } : {}),
          wineEngineVersion: state.wineEngineVersion,
          wineAction: 'static-presentation',
          ...(state.winePourStyle ? { winePourStyle: state.winePourStyle } : {}),
          wineGlassMode: state.wineGlassMode,
          wineClosureType: state.wineClosureType,
          wineType: state.wineType,
          wineBottleState: state.wineBottleState,
          carbonationLevel: state.carbonationLevel,
          ...((state as any).wineStyleArchetype ? { wineStyleArchetype: (state as any).wineStyleArchetype } : {}),
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
    productType: PRODUCT_TYPE_TO_LABEL[state.definition.type],
    specialEffect: SPECIAL_EFFECT_MODES.has(resolvedPhotoMode) ? resolvedPhotoMode : undefined,
    visualStyle: resolvedVisualStyle,
    ...(resolvedVisualStyleCategory ? { visualStyleCategory: resolvedVisualStyleCategory } : {}),
    ...(resolvedEnvironment.value
      ? {
          environmentPreset: resolvedEnvironment.value,
          environment: resolvedEnvironment.value,
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
        ? (state.photoModeConfig as any)?.dynamic?.[currentPhotoMode]
        : undefined;
      const environmentPreset = String((state as any).environmentPreset || '').trim();
      if (environmentPreset) extras.environmentPreset = environmentPreset;
      const environmentMode = String((state as any).environmentMode || '').trim();
      if (environmentMode) extras.environmentMode = environmentMode;
      const environment = String((state as any).environment || '').trim();
      if (environment) extras.environment = environment;
      const lightingPreset = String((state as any).lightingPreset || '').trim();
      if (lightingPreset) extras.lightingPreset = lightingPreset;
      const lightingMode = String((state as any).lightingMode || '').trim();
      if (lightingMode) extras.lightingMode = lightingMode;
      const lightingRaw = String((state as any).lighting || '').trim();
      if (lightingRaw) extras.lighting = lightingRaw;
      // Basic lighting selector (natural-light / overcast / cozy-indoors / ring-light)
      const basicLighting = String(
        (state as any).lighting || (state as any).lightingPreset || (state as any).lightingMode || ''
      ).trim();
      if (basicLighting) extras.basicLighting = basicLighting;
      // Viewpoint (eye-level / top-down / human-pov / suspended / display-view)
      const viewpoint = String((state as any).viewpoint || '').trim();
      if (viewpoint) extras.viewpoint = viewpoint;
      // Physical placement (surface / held / supported / air-suspended)
      const physicalPlacement = String((state as any).placement || (state as any).physicalPlacement || '').trim();
      if (physicalPlacement) extras.physicalPlacement = physicalPlacement;
      // Physical Presence sub-options
      const productMaterial = String((state as any).productMaterial || '').trim();
      if (productMaterial) extras.productMaterial = productMaterial;
      const productColor = String((state as any).productColor || '').trim();
      if (productColor) extras.productColor = productColor;
      const productFormScale = String((state as any).productFormScale || (state as any).productScale || '').trim();
      if (productFormScale) extras.productFormScale = productFormScale;
      // Foam & Texture controls are read from root state in V2 builder.
      const textureType = String((state as any).textureType || '').trim();
      if (textureType) extras.textureType = textureType;
      const textureDensity = String((state as any).textureDensity || '').trim();
      if (textureDensity) extras.textureDensity = textureDensity;
      const focusDistance = String((state as any).focusDistance || '').trim();
      if (focusDistance) extras.focusDistance = focusDistance;
      const cleanliness = String((state as any).cleanliness || '').trim();
      if (cleanliness) extras.cleanliness = cleanliness;
      // Ingredient objects:
      // Primary source is state.props. For Textured Bed, also accept dynamic customIngredients
      // so V2 does not fail invariant when user entered ingredients in the mode sub-control.
      const propsIngredientObjects = String((state as any).props || '').trim();
      const texturedBedDynamicIngredients =
        currentPhotoMode === 'Textured Bed / Scatter Base'
          ? String((dynamicRaw as any)?.customIngredients || '').trim()
          : '';
      const ingredientObjects = propsIngredientObjects || texturedBedDynamicIngredients;
      if (ingredientObjects) extras.ingredientObjects = ingredientObjects;
      const ingredientLayout = String((state as any).ingredientLayout || '').trim();
      if (ingredientLayout) extras.ingredientLayout = ingredientLayout;
      return extras;
    })(),
    // ── Photo Mode dynamic sub-settings (last-selection-wins) ──
    ...(() => {
      const currentPhotoMode = resolvedPhotoMode || undefined;
      if (!currentPhotoMode) return {};
      const dynamicRaw = (state.photoModeConfig as any)?.dynamic?.[currentPhotoMode];
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
      const contextPreset = String((state as any).contextPreset || '').trim();
      const environmentPreset = String((state as any).environmentPreset || '').trim();
      const environmentMode = String((state as any).environmentMode || '').trim();
      const environment = String((state as any).environment || '').trim();
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

      // V2 background color source is product image palette only.
      const productPaletteSource: 'Use product label colors' | undefined = hasLabelColors
        ? 'Use product label colors'
        : undefined;

      const paletteBlock: Record<string, unknown> = {};
      if (productPaletteSource) paletteBlock.productPaletteSource = productPaletteSource;

      if (productPaletteSource === 'Use product label colors' && hasLabelColors) {
        paletteBlock.productPaletteA = labelDominant;
        if (labelSecondary) paletteBlock.productPaletteB = labelSecondary;
        if (labelAccent) paletteBlock.productPaletteC = labelAccent;
      }

      // eslint-disable-next-line no-console
      console.log(
        '[extractProductPalette]\n' +
        `A ${labelDominant || '#f9fafb'}\n` +
        `B ${labelSecondary || '#f3f4f6'}\n` +
        `C ${labelAccent || '#e5e7eb'}`
      );

      // Forward heroLandingPage.backgroundType to V2 photoModeConfig
      const heroBackgroundType = state.photoModeConfig?.heroLandingPage?.backgroundType;
      if (heroBackgroundType) {
        paletteBlock.photoModeConfig = {
          heroLandingPage: { backgroundType: heroBackgroundType },
        };
      }

      return paletteBlock;
    })(),
  } as StudioUIState;

  const rules = industryRules[industryProfile];
  let allowedInteractions = ['none'];

  if (rules?.allowedPhotoModes && !rules.allowedPhotoModes.includes(v2State.photoMode || '')) {
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
  const productStudioInteractionRaw =
    String((state as any).productStudioInteraction || '').trim() ||
    String((state as any).productInteraction || '').trim();
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
  // eslint-disable-next-line no-console
  console.log('[ENVIRONMENT RESOLVED]', v2State.environmentPreset || '');

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
    console.log('[STUDIO ROUTER] engine=legacy');
    return mapSceneToPrompt(state, product);
  }

  console.log('[STUDIO ROUTER] engine=v2');
  const resolvedIndustryProfile = assertIndustry(
    state.industryProfile || state.visualProfile
  );
  resolveIndustryProfileModule(resolvedIndustryProfile);
  const v2State = toStudioV2State(state);
  console.log('[STUDIO ROUTER] v2-state', v2State);
  console.log('[STUDIO ROUTER] v2State.photoMode =', JSON.stringify(v2State.photoMode));
  console.log('[STUDIO ROUTER] raw state.photoMode =', JSON.stringify(state.photoMode));
  const v2Prompt = generateStudioPromptV2(v2State);

  // Sanitize for industry-specific forbidden patterns (wine/coffee).
  const prompt = applyIndustryPromptPolicy(v2Prompt, resolvedIndustryProfile);

  console.log('[INDUSTRY ACTIVE]', state.industryProfile);

  if (v2State.visualProfile === 'coffee' && !/\bCOFFEE_PACKAGING_MODE\b/.test(prompt)) {
    console.warn('[COFFEE PACKAGING GUARD MISSING]');
  }
  return mapV2ToScenePromptResult(prompt);
}

export { isStudioV2Enabled };
