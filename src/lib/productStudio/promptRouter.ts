import type { IndustryProfile, ProductAsset, ProductStateMotion, ProductStudioState } from './types';
import { mapSceneToPrompt, type ScenePromptResult } from './mapSceneToPrompt';
import { generateStudioPromptV2, type StudioUIState } from '../productStudioV2/index';
import { industryRules } from './industryRules';
import { resolveCoffeeIndustryIntent, type CoffeeIndustryIntent } from './resolveCoffeeIntent';
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

function inferStudioWorld(state: ProductStudioState): StudioUIState['world'] | undefined {
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
  const rig = String((state as any).lightingRig || '').trim();
  const style = String((state as any).lighting || '').trim();
  if (rig && style) return `${rig}; ${style}`;
  if (rig) return rig;
  if (style) return style;
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
  'Monochrome Brand',
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
  'supported-hold': ['holding'],
  'two-hand-hold': ['two-hand-hold', 'cheers'],
  presenting: ['presenting'],
  'passive-presence': ['none'],
  'resting-interaction': ['none'],
  'framed-presentation': ['framed-presentation'],
  capsuleDisplay: ['capsule-display'],
  applyingOpening: ['applying-opening'],
  supportedHold: ['holding'],
  holdingBottle: ['holding'],
  glassForeground: ['two-hand-hold'],
  pouringWine: ['framed-presentation'],
  cheers: ['cheers'],
  cupHold: ['holding'],
  pouringEspresso: ['framed-presentation'],
  steam: ['framed-presentation'],
  beansScatter: ['framed-presentation'],
  spoonStir: ['framed-presentation'],
};

function resolveIndustryProfile(visualProfile: ProductStudioState['visualProfile']): IndustryProfile {
  if (visualProfile === 'wine-prestige') return 'wine';
  if (visualProfile === 'default') return 'supplements';
  return visualProfile as IndustryProfile;
}

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
  variant: 'coffee-editorial-ritual' | 'coffee-premium-minimal' | 'coffee-color-pop-luxury';
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
} {
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
    steamVisibilityFromControl ??
    (temperatureProfile === 'hot'
      ? intent === 'editorial-ritual'
        ? 'medium'
        : intent === 'campaign'
          ? 'subtle'
          : 'subtle'
      : 'none');
  const selectedLightingTone = String(state.coffeeLightingTone || '').trim().toLowerCase();
  const selectedMoodModifier =
    state.coffeeMoodModifier && state.coffeeMoodModifier !== 'auto'
      ? state.coffeeMoodModifier
      : undefined;
  const liquidPhysicsEnabled = state.coffeeLiquidPhysics !== false;
  const lightingToneOverrides: Partial<{
    lightingTemperatureProfile: string;
    shadowProfile: string;
    contrastProfile: string;
  }> =
    selectedLightingTone === 'warm-ambient'
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
    return {
      mode,
      motion: state.coffeeAction,
      environment: String(state.contextPreset || '').trim(),
      lightingTone: selectedLightingTone,
      mood: String(selectedMoodModifier || ''),
      steam: selectedSteamLevel === 'visible' ? 'visible' : selectedSteamLevel === 'none' ? 'none' : 'subtle',
      intent,
      variant: 'coffee-color-pop-luxury',
      moodProfile: (selectedMoodModifier || 'color-pop-luxury') as NonNullable<StudioUIState['coffeeMoodProfile']>,
      environmentVariation: environment.variation,
      autoRandomizeEnvironment: environment.autoRandomize,
      temperatureProfile,
      steamVisibility,
      espressoMode,
      lightingTemperatureProfile: lightingToneOverrides.lightingTemperatureProfile || 'studio-color-separation',
      shadowProfile: lightingToneOverrides.shadowProfile || 'refined-contrast',
      contrastProfile: lightingToneOverrides.contrastProfile || 'high',
      compositionProfile: 'color-pop-luxury',
      compositionCoverage: '80–90%',
      liquidPhysicsEnabled,
    };
  }

  if (intent === 'conversion') {
    const inferredMoodProfile: NonNullable<StudioUIState['coffeeMoodProfile']> =
      environment.variation === 'minimal-gradient' ? 'modern-commercial' : 'premium-minimal';
    const moodProfile: NonNullable<StudioUIState['coffeeMoodProfile']> =
      (selectedMoodModifier || inferredMoodProfile) as NonNullable<StudioUIState['coffeeMoodProfile']>;
    return {
      mode,
      motion: state.coffeeAction,
      environment: String(state.contextPreset || '').trim(),
      lightingTone: selectedLightingTone,
      mood: String(selectedMoodModifier || ''),
      steam: selectedSteamLevel === 'visible' ? 'visible' : selectedSteamLevel === 'none' ? 'none' : 'subtle',
      intent,
      variant: 'coffee-premium-minimal',
      moodProfile,
      environmentVariation: environment.variation,
      autoRandomizeEnvironment: environment.autoRandomize,
      temperatureProfile,
      steamVisibility,
      espressoMode,
      lightingTemperatureProfile: lightingToneOverrides.lightingTemperatureProfile || 'neutral-daylight',
      shadowProfile: lightingToneOverrides.shadowProfile || 'controlled-soft',
      contrastProfile: lightingToneOverrides.contrastProfile || 'medium-high',
      compositionProfile: moodProfile === 'modern-commercial' ? 'commercial-clean' : 'product-forward',
      compositionCoverage: '75–85%',
      liquidPhysicsEnabled,
    };
  }

  const inferredMoodProfile: NonNullable<StudioUIState['coffeeMoodProfile']> =
    environment.variation === 'dark-concrete' || environment.variation === 'architectural-shadow'
      ? 'dark-architectural'
      : environment.variation === 'sunlit-window'
        ? 'morning-natural'
        : 'ritual-editorial';
  const moodProfile: NonNullable<StudioUIState['coffeeMoodProfile']> = (
    selectedMoodModifier || inferredMoodProfile
  ) as NonNullable<StudioUIState['coffeeMoodProfile']>;

  return {
    mode,
    motion: state.coffeeAction,
    environment: String(state.contextPreset || '').trim(),
    lightingTone: selectedLightingTone,
    mood: String(selectedMoodModifier || ''),
    steam: selectedSteamLevel === 'visible' ? 'visible' : selectedSteamLevel === 'none' ? 'none' : 'subtle',
    intent: 'editorial-ritual',
    variant: 'coffee-editorial-ritual',
    moodProfile,
    environmentVariation: environment.variation,
    autoRandomizeEnvironment: environment.autoRandomize,
    temperatureProfile,
    steamVisibility,
    espressoMode,
    lightingTemperatureProfile: lightingToneOverrides.lightingTemperatureProfile || 'warm-ambient',
    shadowProfile: lightingToneOverrides.shadowProfile || 'soft-deep',
    contrastProfile: lightingToneOverrides.contrastProfile || 'medium',
    compositionProfile: 'ritual-balance',
    compositionCoverage: '60–70%',
    liquidPhysicsEnabled,
  };
}

function resolveIndustryProductState(
  state: ProductStudioState,
  industryProfile: IndustryProfile,
  resolvedCoffeeIntent?: CoffeeIndustryIntent
): ProductStateMotion {
  if (industryProfile === 'wine') {
    return state.stateMotion === 'opened' ? 'opened' : 'static';
  }

  if (industryProfile === 'coffee') {
    const allowed = (industryRules.coffee.productStateWhitelistByIntent?.[resolvedCoffeeIntent || 'editorial-ritual'] ||
      industryRules.coffee.productStateWhitelist ||
      ['static']) as ProductStateMotion[];
    return allowed.includes(state.stateMotion) ? state.stateMotion : 'static';
  }

  if (industryProfile === 'supplements') {
    const allowed = resolveSupplementsAllowedProductStates(state);
    return allowed.includes(state.stateMotion) ? state.stateMotion : 'static';
  }

  const genericAllowed = (industryRules[industryProfile]?.productStateWhitelist || ['static']) as ProductStateMotion[];
  return genericAllowed.includes(state.stateMotion) ? state.stateMotion : 'static';
}

function resolvePackagingBehavior(
  industryProfile: IndustryProfile,
  stateMotion: ProductStateMotion,
  state: ProductStudioState
): string {
  if (industryProfile === 'wine') {
    if (stateMotion === 'opened' || stateMotion === 'pouring') return 'wine-cork-removal';
    return 'wine-cork';
  }

  if (industryProfile === 'supplements') {
    if (state.definition.type === 'capsules') return 'supplement-plastic-cap';
    if (state.definition.type === 'drops') return 'dropper-pipette';
    if (state.definition.type === 'powder') return 'generic-screw-cap';
    return 'generic-screw-cap';
  }

  if (industryProfile === 'coffee') {
    if (state.definition.type === 'powder') return 'coffee-heat-seal';
    return 'generic-screw-cap';
  }

  return 'generic-screw-cap';
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
  const requestedModifiers = inferRequestedModifiers(state);
  const industryProfile = resolveIndustryProfile(state.visualProfile);
  const coffeeLayer =
    industryProfile === 'coffee' ? resolveCoffeeIndustryLayer(state) : null;
  const photoModeCapabilities = getPhotoModeCapabilities(state.photoMode);
  const resolvedAllowedMotions = getResolvedAllowedMotions(
    state.photoMode,
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
      wineCorkRemovalActive:
        industryProfile === 'wine' &&
        (capabilityResolvedProductState === 'opened' || capabilityResolvedProductState === 'pouring'),
      distortionRiskThreshold: 0.75,
    }
  );
  for (const warning of resolvedCamera.warnings) {
    console.warn(`[CAMERA SAFETY] ${warning}`);
  }
  const shouldAssignWineFields = industryProfile === 'wine';
  const splashMotionIntensity = String(state.photoModeConfig?.splashShot?.motionIntensity || '').trim();
  const splashFreezeMoment = String(state.photoModeConfig?.splashShot?.freezeMoment || '').trim();
  const splashAdMode =
    String(state.photoMode || '').trim() === 'Splash Shot' &&
    splashMotionIntensity === 'Explosive';
  const winePrestigeMode = industryProfile === 'wine';
  const winePrestigeV2Mode = false;
  const wineEnvironment = winePrestigeMode
    ? resolveWineEnvironmentVariation(String(state.contextPreset || '').trim())
    : null;
  const wineMoodProfile = winePrestigeMode ? resolveWineMoodProfile(state) : undefined;
  const v2State: StudioUIState = {
    creativeIntent: inferStudioIntent(state),
    visualIntent: industryProfile === 'coffee' ? coffeeLayer?.intent : state.visualIntent,
    visualProfile: industryProfile,
    world: inferStudioWorld(state),
    motion: inferStudioMotionFromStateMotion(state, capabilityResolvedProductState),
    composition: inferStudioComposition(state),
    ...(advancedControls ? { advancedControls: true } : {}),
    lightingModelOverride: inferLightingOverride(state),
    aspectRatio: state.aspectRatio,
    photoMode: state.photoMode,
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
          wineAction: 'static-presentation',
          ...(state.winePourStyle ? { winePourStyle: state.winePourStyle } : {}),
        }
      : {}),
    ...(advancedControls
      ? {
          cameraSystemOverride: resolvedCamera.cameraSystem,
          angleOverride: resolvedCamera.cameraAngle,
          distanceOverride: resolvedCamera.cameraDistance,
          rotationOverride: resolvedCamera.cameraRotation,
          framingGuideOverride: resolvedCamera.framingGuide,
        }
      : {}),
    productType: PRODUCT_TYPE_TO_LABEL[state.definition.type],
    specialEffect: SPECIAL_EFFECT_MODES.has(state.photoMode) ? state.photoMode : undefined,
    visualStyle: VISUAL_STYLE_MODES.has(state.photoMode) ? state.photoMode : undefined,
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
        }
      : {}),
  } as StudioUIState;

  const rules = industryRules[industryProfile];
  let allowedInteractions = ['none'];

  if (rules?.allowedPhotoModes && !rules.allowedPhotoModes.includes(v2State.photoMode || '')) {
    v2State.photoMode = rules.allowedPhotoModes[0];
  }

  if (rules?.allowedProductTypes && !rules.allowedProductTypes.includes(v2State.productType || '')) {
    if (industryProfile === 'wine' && v2State.productType !== 'Custom') {
      console.warn('Wine profile forcing Custom product type');
    }
    v2State.productType = rules.allowedProductTypes[0];
  }

  if (rules?.allowedSpecialEffects && v2State.specialEffect && !rules.allowedSpecialEffects.includes(v2State.specialEffect)) {
    v2State.specialEffect = undefined;
  }

  if (rules?.allowedVisualStyles && v2State.visualStyle && !rules.allowedVisualStyles.includes(v2State.visualStyle)) {
    v2State.visualStyle = rules.allowedVisualStyles[0];
  }

  if (industryProfile === 'coffee') {
    const resolvedIntent = coffeeLayer?.intent || 'editorial-ritual';
    v2State.visualIntent = resolvedIntent;
    v2State.lightingTemperatureProfile = coffeeLayer?.lightingTemperatureProfile;
    v2State.shadowProfile = coffeeLayer?.shadowProfile;
    v2State.contrastProfile = coffeeLayer?.contrastProfile;
    v2State.compositionProfile = coffeeLayer?.compositionProfile;

    allowedInteractions = rules?.interactionWhitelistByIntent?.[resolvedIntent] || ['none'];
  } else if (industryProfile === 'wine') {
    allowedInteractions = rules?.interactionWhitelist || ['none'];
  } else if (industryProfile === 'supplements') {
    allowedInteractions = rules?.interactionWhitelist || ['none'];
  } else {
    allowedInteractions = rules?.interactionWhitelist || ['none'];
  }

  const capabilityAllowedInteractions = resolveAllowedInteractionsByCapability(
    allowedInteractions as ProductStudioState['interaction'][],
    photoModeCapabilities.interactionCapability
  );
  const defaultInteraction = getIndustryDefaultInteraction(
    industryProfile,
    capabilityAllowedInteractions
  );
  const resolvedInteractionInput = industryProfile === 'wine' ? 'none' : state.interaction;
  const interactionKey = String(resolvedInteractionInput || '').trim();
  const interactionCandidates = INTERACTION_STATE_TO_CANONICAL_CANDIDATES[interactionKey] || [interactionKey || 'none'];
  const preferredCandidate =
    interactionCandidates.find((candidate) => capabilityAllowedInteractions.includes(candidate as ProductStudioState['interaction'])) ||
    (interactionCandidates[0] as ProductStudioState['interaction']) ||
    'none';
  const sanitizedInteractionCanonical = industryProfile === 'wine'
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
  if (!interactionAllowed && industryProfile !== 'wine') {
    console.warn(`Industry interaction enforcement: profile=${industryProfile} forcing interaction to none`);
  }
  v2State.interaction = sanitizedInteractionCanonical;
  v2State.packagingBehavior = packagingBehavior;

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

const COFFEE_FORBIDDEN_PROMPT_PATTERNS: RegExp[] = [
  /\bWINE_[A-Z0-9_]*\b/,
  /\bwine-prestige\b/i,
  /\bwine-glass-priority\b/i,
  /\bCORK_RENDERING\b/i,
  /\bBOTTLE_TILT_RULE\b/i,
  /\bwine translucency\b/i,
];

const WINE_FORBIDDEN_PROMPT_PATTERNS: RegExp[] = [
  /\bINTERACTION_[A-Z0-9_]*\b/i,
  /\bHAND_POSITIONING\b/i,
  /\bFRAMING_BIAS\b/i,
  /\bHAND_[A-Z0-9_]*\b/i,
  /\bPOUR(?:ING)?\b/i,
  /\bSPILL(?:ED|ING)?\b/i,
  /\bFALL(?:ING)?\b/i,
  /\bDISPENS(?:E|ED|ING)\b/i,
  /\bGRAVITY\b/i,
];

function sanitizePromptForIndustry(prompt: string, industryProfile: IndustryProfile): string {
  if (industryProfile !== 'coffee' && industryProfile !== 'wine') return prompt;

  const forbiddenPatterns =
    industryProfile === 'coffee' ? COFFEE_FORBIDDEN_PROMPT_PATTERNS : WINE_FORBIDDEN_PROMPT_PATTERNS;

  const sanitized = prompt
    .split(/(?<=[.!?])\s+/)
    .filter((sentence) => !forbiddenPatterns.some((pattern) => pattern.test(sentence)))
    .join(' ')
    .replace(/\s{2,}/g, ' ')
    .trim();

  return sanitized;
}

export function routeStudioScenePrompt(state: ProductStudioState, product?: ProductAsset | null): ScenePromptResult {
  if (!isStudioV2Enabled()) {
    console.log('[STUDIO ROUTER] engine=legacy');
    return mapSceneToPrompt(state, product);
  }

  console.log('[STUDIO ROUTER] engine=v2');
  const v2State = toStudioV2State(state);
  console.log('[STUDIO ROUTER] v2-state', v2State);
  const v2Prompt = generateStudioPromptV2(v2State);
  const prompt = sanitizePromptForIndustry(v2Prompt, v2State.visualProfile as IndustryProfile);
  return mapV2ToScenePromptResult(prompt);
}

export { isStudioV2Enabled };
