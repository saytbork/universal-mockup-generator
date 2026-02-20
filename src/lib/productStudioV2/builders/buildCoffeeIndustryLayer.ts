import type { StudioAuthorityBundle, StudioUIState } from '../types/studioTypes.ts';

function buildCoffeeMoodBlock(state: StudioUIState): string {
  const mood = state.coffeeMoodProfile || 'ritual-editorial';
  const moodMap: Record<NonNullable<StudioUIState['coffeeMoodProfile']>, string> = {
    'ritual-editorial':
      'COFFEE_MOOD_PROFILE: ritual-editorial. temperatureBias=warm-ambient. contrastDepth=medium. shadowSoftness=soft-deep. steamVisibilityLevel=medium. productDominanceRatio=60–70%.',
    'premium-minimal':
      'COFFEE_MOOD_PROFILE: premium-minimal. temperatureBias=neutral-warm. contrastDepth=medium-high. shadowSoftness=clean-soft. steamVisibilityLevel=subtle. productDominanceRatio=75–85%.',
    'color-pop-luxury':
      'COFFEE_MOOD_PROFILE: color-pop-luxury. temperatureBias=studio-balanced. contrastDepth=high. shadowSoftness=refined-contrast. steamVisibilityLevel=subtle. productDominanceRatio=80–90%.',
    'dark-architectural':
      'COFFEE_MOOD_PROFILE: dark-architectural. temperatureBias=warm-low-key. contrastDepth=high. shadowSoftness=deep-structured. steamVisibilityLevel=medium. productDominanceRatio=68–80%.',
    'morning-natural':
      'COFFEE_MOOD_PROFILE: morning-natural. temperatureBias=morning-neutral-warm. contrastDepth=medium. shadowSoftness=natural-soft. steamVisibilityLevel=subtle. productDominanceRatio=64–76%.',
    'modern-commercial':
      'COFFEE_MOOD_PROFILE: modern-commercial. temperatureBias=neutral-commercial. contrastDepth=controlled-high. shadowSoftness=clean-controlled. steamVisibilityLevel=none. productDominanceRatio=78–88%.',
  };
  return moodMap[mood];
}

function buildCoffeeEnvironmentBlock(state: StudioUIState): string {
  const variation = state.coffeeEnvironmentVariation || 'minimal-gradient';
  const variationMap: Record<NonNullable<StudioUIState['coffeeEnvironmentVariation']>, string> = {
    'warm-wood-table':
      'COFFEE_ENVIRONMENT_VARIATION: warm-wood-table. surface=warm wood table. background=soft warm interior. contextDepth=medium.',
    'stone-counter':
      'COFFEE_ENVIRONMENT_VARIATION: stone-counter. surface=stone counter. background=clean interior depth. contextDepth=medium.',
    'black-studio':
      'COFFEE_ENVIRONMENT_VARIATION: black-studio. surface=matte black. background=controlled black studio falloff. contextDepth=deep.',
    'minimal-gradient':
      'COFFEE_ENVIRONMENT_VARIATION: minimal-gradient. surface=neutral gradient plinth. background=minimal gradient. contextDepth=shallow.',
    'sunlit-window':
      'COFFEE_ENVIRONMENT_VARIATION: sunlit-window. surface=sunlit table. background=window depth cues. contextDepth=medium.',
    'modern-cafe':
      'COFFEE_ENVIRONMENT_VARIATION: modern-cafe. surface=cafe table plane. background=modern cafe context. contextDepth=deep.',
    'dark-concrete':
      'COFFEE_ENVIRONMENT_VARIATION: dark-concrete. surface=dark concrete slab. background=low-key architectural depth. contextDepth=deep.',
    'architectural-shadow':
      'COFFEE_ENVIRONMENT_VARIATION: architectural-shadow. surface=stone/mineral plane. background=architectural shadow geometry. contextDepth=deep.',
    'linen-surface':
      'COFFEE_ENVIRONMENT_VARIATION: linen-surface. surface=linen textile base. background=soft editorial depth. contextDepth=medium.',
    'marble-bar':
      'COFFEE_ENVIRONMENT_VARIATION: marble-bar. surface=polished marble. background=luxury bar ambience. contextDepth=medium.',
  };
  const auto = state.autoRandomizeCoffeeEnvironment
    ? 'autoRandomizeCoffeeEnvironment=true.'
    : 'autoRandomizeCoffeeEnvironment=false.';
  return `${variationMap[variation]} ${auto} COFFEE_ENVIRONMENT_SCOPE: controls only surface/background/context depth/spatial integration.`;
}

function buildSteamBlock(state: StudioUIState): string {
  const temp = state.coffeeTemperatureProfile || 'hot';
  if (temp !== 'hot') {
    return 'STEAM_BEHAVIOR: temperature is cold; visible steam suppressed.';
  }
  const visibility = state.coffeeSteamVisibility || 'subtle';
  return `STEAM_BEHAVIOR: temperature is hot; ${visibility} upward volumetric steam only. Never lateral drift. Never chaotic motion. Gravity compliant.`;
}

function buildCoffeeProductPriorityBlock(state: StudioUIState): string {
  const hasProductReference = Boolean(state.productReferencePresent);
  const packagingIntent = state.coffeePackagingIntent || 'pdp-clean';
  const intentMap: Record<string, string> = {
    'pdp-clean':
      'COFFEE_INTENT_PROFILE: PDP Clean. productDominanceTarget=85–90%. contextDepth=shallow. background=clean minimal. beansMax=low.',
    'premium-campaign':
      'COFFEE_INTENT_PROFILE: Premium Campaign. productDominanceTarget=80–90%. contrast=higher. shadowDepth=deeper. beansMax=medium. cupMax=small.',
    'dark-roast-luxury':
      'COFFEE_INTENT_PROFILE: Dark Roast Luxury. productDominanceTarget=80–90%. background=dark. highlights=controlled. steam=subtle-allowed.',
    'modern-minimal':
      'COFFEE_INTENT_PROFILE: Modern Minimal. productDominanceTarget=80–88%. contextDepth=shallow. background=minimal.',
    'cold-brew-fresh':
      'COFFEE_INTENT_PROFILE: Cold Brew Fresh. productDominanceTarget=80–88%. allowIceCubes=true. allowCondensation=true. steam=off.',
    'bundle-hero':
      'COFFEE_INTENT_PROFILE: Bundle Hero. productDominanceTarget=78–88%. multi-product hierarchy with packaging dominance preserved.',
  };
  const beans = state.coffeeBeansScatter || 'low';
  const cup = state.coffeeCupAccent || 'side';
  const splash = state.coffeeEspressoSplash || 'off';
  const iceMode = state.coffeeIceMode || 'off';
  const surfaceStyle = state.coffeeSurfaceStyle || 'neutral-gradient';
  const temperatureFeel = state.coffeeTemperatureFeel || 'neutral-commercial';

  return [
    'COFFEE_PACKAGING_MODE: enforced.',
    'PRIMARY_SUBJECT_RULE: The uploaded product MUST be the dominant subject. Minimum visual dominance: 70%. In conversion mode: target 80–90%.',
    'CONTEXT_RULE: Coffee-related elements (beans, cups, steam, surfaces) are secondary accents only. Contextual elements may not exceed 30% visual dominance.',
    'PROHIBITIONS: Never render cup-only scene. Never replace packaging with beverage container. Never generate stock-style ritual composition. Never crop packaging out of frame. Never center the cup over the product.',
    'ACCENT_SCALE_RULE: Beans = decorative only. Cup = side support only. Steam = subtle and secondary.',
    'PRODUCT_ENFORCEMENT: true.',
    intentMap[packagingIntent] || intentMap['pdp-clean'],
    `COFFEE_ACCENTS: beansScatter=${beans}; cupAccent=${cup}; steamLevel=${state.coffeeSteamVisibility || 'subtle'}; espressoSplash=${splash}; iceMode=${iceMode}.`,
    `COFFEE_SURFACE_STYLE: ${surfaceStyle}.`,
    `COFFEE_TEMPERATURE_FEEL: ${temperatureFeel}.`,
    hasProductReference
      ? 'COFFEE_REFERENCE_LOCK: product reference exists; packaging context overrides beverage context and cup-dominant rendering is disabled.'
      : 'COFFEE_REFERENCE_LOCK: no product reference detected; beverage-only fallback remains disabled.',
    'COFFEE_BOUNDING_RULE: enforce product bounding-box centrality.',
  ].join(' ');
}

export function buildCoffeeIndustryLayer(
  authority: StudioAuthorityBundle,
  state?: StudioUIState
): string {
  if (state?.visualProfile !== 'coffee' || !state.coffeeIndustryLayer) return '';

  const variant = state.coffeeVariant || 'coffee-editorial-ritual';
  const coverage = String(state.coffeeCompositionCoverage || '').trim();
  const cremaBehavior = state.coffeeEspressoMode
    ? 'CREMA_BEHAVIOR: espresso mode active; micro-bubble crema texture with irregular natural foam distribution. No wine translucency.'
    : 'CREMA_BEHAVIOR: non-espresso mode; minimal crema emphasis with natural surface coherence.';

  const coffeeLiquidPhysicsEnabled = state.coffeeLiquidPhysicsEnabled !== false;

  return [
    `COFFEE_INDUSTRY_LAYER: ${variant}.`,
    buildCoffeeProductPriorityBlock(state),
    'COFFEE_PHYSICS_PROFILE: enabled.',
    coffeeLiquidPhysicsEnabled
      ? 'COFFEE_LIQUID_PHYSICS: Opaque dark brown absorption core. Minimal translucency. Soft edge highlight near surface. Subtle meniscus at cup rim.'
      : 'COFFEE_LIQUID_PHYSICS: disabled by user control.',
    cremaBehavior,
    buildSteamBlock(state),
    'NO_GLASS_PRIORITY: ceramic priority materials with matte reflection rolloff. No glass refraction dominance.',
    buildCoffeeMoodBlock(state),
    buildCoffeeEnvironmentBlock(state),
    'COFFEE_LENS_BIAS: 50mm natural perspective preferred; user camera selection remains authoritative.',
    `COFFEE_COMPOSITION_PROFILE: ${state.compositionProfile || 'ritual-balance'}.`,
    coverage ? `COFFEE_COMPOSITION_COVERAGE: ${coverage}.` : '',
    state.coffeeVariant === 'coffee-premium-minimal'
      ? 'COFFEE_MOTION_RULES: conversion mode allows static or dispensed only. No chaotic splash energy.'
      : state.coffeeVariant === 'coffee-color-pop-luxury'
        ? 'COFFEE_MOTION_RULES: campaign mode allows static or controlled-stream pouring only. No gravity violation and no floating particles.'
        : 'COFFEE_MOTION_RULES: editorial ritual allows static, dispensed, pouring, and subtle steam drift upward only. Steam must stay gravity compliant.',
    authority.world === 'splash-tank'
      ? 'COFFEE_WORLD_GUARD: do not apply wine splash physics or wine bottle behavior.'
      : '',
  ]
    .filter(Boolean)
    .join(' ');
}
