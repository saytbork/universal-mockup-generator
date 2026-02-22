import type { StudioUIState } from '../types/studioTypes.ts';

function buildWineMoodProfile(state: StudioUIState): string {
  const mood = String(state.wineMoodProfile || '').trim().toLowerCase() || 'neutral';
  const moodMap: Record<string, string> = {
    neutral:
      'WINE_MOOD_PROFILE: neutral-hero. Clean studio lighting. Balanced dynamic range. Commercial clarity bias.',
    prestige:
      'WINE_MOOD_PROFILE: prestige. Warm lateral lighting bias. Deep shadow preservation. Cinematic compression preferred. Ambient silence tone. productDominanceRatio=80–90%.',
    editorial:
      'WINE_MOOD_PROFILE: editorial. Neutral-to-warm lighting bias. Medium contrast. Soft shadow depth. Light atmospheric density. productDominanceRatio=65–75%.',
    ecommerce:
      'WINE_MOOD_PROFILE: ecommerce. Neutral daylight bias. Controlled contrast for label clarity. Moderate shadows. Minimal atmosphere density. productDominanceRatio=75–85%.',
    'dark-luxury':
      'WINE_MOOD_PROFILE: dark-luxury. Warm low-key bias. High contrast with deep shadows. Dense atmosphere control. productDominanceRatio=70–82%.',
    'modern-minimal':
      'WINE_MOOD_PROFILE: modern-minimal. Clean neutral bias. Refined medium contrast. Shallow shadow depth. Very low atmosphere density. productDominanceRatio=72–84%.',
  };
  return moodMap[mood] || moodMap.neutral;
}

function buildWineEnvironmentContext(variation: NonNullable<StudioUIState['wineEnvironmentVariation']>): string {
  const map: Record<NonNullable<StudioUIState['wineEnvironmentVariation']>, string> = {
    vineyard: 'background context: vineyard rows with warm distance haze; surface: natural stone or wood.',
    'dark-cellar': 'background context: dark cellar with barrel depth; surface: aged oak.',
    'marble-bar': 'background context: luxury bar backdrop; surface: dark marble.',
    'minimal-gradient': 'background context: minimal gradient backdrop; surface: clean neutral platform.',
    'black-studio': 'background context: black studio void with controlled falloff; surface: matte black plinth.',
    'modern-kitchen': 'background context: modern kitchen depth cues; surface: polished countertop.',
    'luxury-dining': 'background context: fine dining atmosphere; surface: premium dining table.',
    'moody-backlight': 'background context: moody backlit depth; surface: refined dark plane.',
    'sunlit-table': 'background context: sunlit interior table scene; surface: warm wood table.',
    'architectural-shadow': 'background context: architectural shadow geometry; surface: stone/mineral slab.',
  };
  return map[variation];
}

type ResolvedWineType = NonNullable<StudioUIState['wineType']>;

export function resolveWineType(state: StudioUIState): ResolvedWineType {
  const explicit = String(state.wineType || '').trim().toLowerCase();
  if (
    explicit === 'red' ||
    explicit === 'white' ||
    explicit === 'rosé' ||
    explicit === 'sparkling-white' ||
    explicit === 'sparkling-rosé'
  ) {
    return explicit as ResolvedWineType;
  }
  throw new Error('[WINE_RESOLVER] wineType is missing or invalid for wine profile.');
}

export function resolveLiquidProfile(wineType: ResolvedWineType): string {
  switch (wineType) {
    case 'red':
      return 'Deep burgundy translucency. Light absorption core. Edge luminosity near rim. Natural meniscus.';
    case 'white':
      return 'Pale gold translucency. Bright clarity core. Subtle straw highlights near rim. Natural meniscus.';
    case 'rosé':
      return 'Soft pink luminosity. Medium translucency. Refined rose-toned rim highlights. Natural meniscus.';
    case 'sparkling-white':
      return 'Pale gold translucency with fine carbonation bubbles and subtle vertical effervescence.';
    case 'sparkling-rosé':
      return 'Rosé hue with active carbonation and fine vertical bubble streams.';
    default:
      throw new Error(`[WINE_RESOLVER] liquid profile unresolved for wineType=${String(wineType)}.`);
  }
}

export function buildWineIndustryLayerV2(state?: StudioUIState): string {
  if (!state) return '';
  if (!(state.winePrestigeMode || state.visualProfile === 'wine')) return '';

  const wineType = resolveWineType(state);
  const liquidProfile = resolveLiquidProfile(wineType);
  const motion = String(state.motion || 'static').trim().toLowerCase();
  const action = String(state.wineAction || 'static-presentation').trim();
  const environment = state.wineEnvironmentVariation;
  const environmentBlocks = environment
    ? [
        `WINE_ENVIRONMENT_VARIATION: ${environment}.`,
        `WINE_ENVIRONMENT_CONTEXT: ${buildWineEnvironmentContext(environment)} Depth-field context and spatial integration only.`,
      ]
    : [];

  return [
    'WINE_PHYSICS_PROFILE: enabled.',
    `WINE_TYPE: ${wineType}.`,
    `WINE_LIQUID_PHYSICS: ${liquidProfile}`,
    'WINE_GLASS_BEHAVIOR: Realistic refraction. Micro-specular highlights. Natural liquid distortion through glass.',
    action === 'controlled-pour' || motion === 'opened'
      ? 'WINE_CORK_LOGIC: natural cork removal active. No beer caps. No synthetic closures unless explicitly defined.'
      : 'WINE_CORK_LOGIC: cork-secured presentation. No beer caps. No synthetic closures unless explicitly defined.',
    motion === 'spilled'
      ? 'GRAVITY_RULE: Liquid obeys gravity with controlled spill behavior. No chaotic splash system.'
      : 'GRAVITY_RULE: Liquid obeys gravity. No splash chaos.',
    buildWineMoodProfile(state),
    ...environmentBlocks,
  ].join(' ');
}
