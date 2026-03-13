import type { StudioAuthorityBundle, StudioUIState } from '../types/studioTypes.ts';

const COFFEE_PREMIUM_MOOD_PROFILES: Record<NonNullable<StudioUIState['coffeeMoodProfile']>, string> = {
  'coffee-cinematic-luxury':
    'COFFEE_MOOD_PROFILE: coffee-cinematic-luxury.',
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

function buildCoffeeMoodBlock(state: StudioUIState): string {
  const mood = state.coffeeMoodProfile || 'ritual-editorial';
  return COFFEE_PREMIUM_MOOD_PROFILES[mood];
}

function buildCoffeeEnvironmentBlock(state: StudioUIState): string {
  if (state.coffeeMoodProfile === 'coffee-cinematic-luxury') {
    return [
      'COFFEE_ENVIRONMENT_VARIATION: Dark wood ritual surface.',
      'Warm bar ambience.',
      'Depth falloff background.',
      'Soft blur layering.',
      'autoRandomizeCoffeeEnvironment=false.',
      'COFFEE_ENVIRONMENT_SCOPE: controls only surface/background/context depth/spatial integration.',
    ].join(' ');
  }

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
  // PDP-clean and conversion-intent modes must never randomize environment — lock to false
  const isPdpOrConversion = state.visualIntent === 'conversion' || state.coffeePackagingIntent === 'pdp-clean';
  const auto = (!isPdpOrConversion && state.autoRandomizeCoffeeEnvironment)
    ? 'autoRandomizeCoffeeEnvironment=true.'
    : 'autoRandomizeCoffeeEnvironment=false.';
  return `${variationMap[variation]} ${auto} COFFEE_ENVIRONMENT_SCOPE: controls only surface/background/context depth/spatial integration.`;
}

function buildSteamBlock(state: StudioUIState): string {
  const temp = state.coffeeTemperatureProfile || 'hot';
  if (temp !== 'hot') {
    return 'STEAM_BEHAVIOR: temperature is cold; visible steam suppressed.';
  }
  const cinematic = state.coffeeMoodProfile === 'coffee-cinematic-luxury';
  const visibility = cinematic ? 'volumetric-backlit' : state.coffeeSteamVisibility || 'subtle';
  return [
    `COFFEE_STEAM_VISIBILITY: ${visibility}.`,
    'STEAM_BEHAVIOR: Volumetric upward diffusion.',
    'Backlit rim interaction.',
    'Soft density gradient.',
    'No chaotic turbulence.',
    'Subtle atmospheric glow.',
    cinematic
      ? 'STEAM_LIGHTING_RESPONSE: steam scattering follows COFFEE_LIGHTING_PROFILE cinematic-directional-warm and warm rim backlight cues.'
      : `STEAM_LIGHTING_RESPONSE: steam scattering follows coffee lighting profile ${state.lightingTemperatureProfile || 'neutral-daylight'}.`,
  ].join(' ');
}

function buildCoffeeProductPriorityBlock(state: StudioUIState): string {
  const hasProductReference = Boolean(state.productReferencePresent);
  const cinematic = state.coffeeMoodProfile === 'coffee-cinematic-luxury';
  // visualIntent=conversion always forces PDP-clean behaviour regardless of coffeePackagingIntent
  const isPdpCleanIntent = state.visualIntent === 'conversion' || state.coffeePackagingIntent === 'pdp-clean';
  // Effective intent used for intentMap lookup: if conversion mode overrides, always resolve to 'pdp-clean'
  const packagingIntent = isPdpCleanIntent ? 'pdp-clean' : (state.coffeePackagingIntent || 'pdp-clean');
  const intentMap: Record<string, string> = {
    'pdp-clean':
      'COFFEE_INTENT_PROFILE: PDP Clean. productDominanceTarget=85–90%. contextDepth=shallow. background=clean minimal. beansMax=low. STUDIO_PRODUCT_MOTION: static. ACCENT_POLICY: beansScatter=low. cupAccent=behind-small or off. steamLevel=subtle or off. espressoSplash=off. iceMode=off. MODIFIERS: none. TEXTURED_BED: disabled. POURING: disabled. SPLASH: disabled. COMPOSITION_RULE: front-facing or 45° hero. Clean minimal background. Shallow context depth. No aggressive art-direction. Maximum packaging readability.',
    'premium-campaign':
      'COFFEE_INTENT_PROFILE: Campaign. productDominanceTarget=80–90%. contrast=higher. shadowDepth=deeper. beansMax=medium. cupMax=small. STUDIO_PRODUCT_MOTION: static OR controlled-stream pouring only. Never chaotic splash. ACCENT_POLICY: beansScatter=controlled. cupAccent=side or behind-small. steamLevel=subtle. espressoSplash=controlled (never covering packaging). iceMode=only if cold-brew intent. ACCENT_SCALE_RULE: Beans = decorative only. Cup = side support only. Steam = subtle and secondary. Splash must never touch label zone. CONTEXT_LIMIT: Context never exceeds 30% visual dominance.',
    'dark-roast-luxury':
      'COFFEE_INTENT_PROFILE: Campaign. Dark Roast Luxury. productDominanceTarget=80–90%. background=dark. highlights=controlled. steam=subtle-allowed. STUDIO_PRODUCT_MOTION: static OR controlled-stream pouring only. Never chaotic splash. CONTEXT_LIMIT: Context never exceeds 30% visual dominance.',
    'modern-minimal':
      'COFFEE_INTENT_PROFILE: Campaign. Modern Minimal. productDominanceTarget=80–88%. contextDepth=shallow. background=minimal. STUDIO_PRODUCT_MOTION: static OR controlled-stream pouring only.',
    'cold-brew-fresh':
      'COFFEE_INTENT_PROFILE: Campaign. Cold Brew Fresh. productDominanceTarget=80–88%. allowIceCubes=true. allowCondensation=true. steam=off. STUDIO_PRODUCT_MOTION: static OR controlled-stream pouring only.',
    'bundle-hero':
      'COFFEE_INTENT_PROFILE: Campaign. Bundle Hero. productDominanceTarget=78–88%. multi-product hierarchy with packaging dominance preserved. STUDIO_PRODUCT_MOTION: static OR controlled-stream pouring only.',
  };
  const beans = state.coffeeBeansScatter || 'low';
  const cup = state.coffeeCupAccent || 'side';
  const splash = state.coffeeEspressoSplash || 'off';
  const iceMode = state.coffeeIceMode || 'off';
  const surfaceStyle = state.coffeeSurfaceStyle || 'neutral-gradient';
  const temperatureFeel = state.coffeeTemperatureFeel || 'neutral-commercial';
  const serveStyle = state.coffeeServeStyle || (cinematic ? 'cup-only' : 'cup-and-bag');

  return [
    'COFFEE_VISUAL_INTENT_BIAS: campaign.',
    'COFFEE_INDUSTRY_LAYER: coffee-packaging-system.',
    'COFFEE_PACKAGING_MODE: enforced.',
    'PRIMARY_SUBJECT_RULE: The uploaded product packaging MUST be the dominant subject. Minimum visual dominance: 75%. In PDP / conversion mode: target 85–90%.',
    'CONTEXT_RULE: Coffee-related elements (beans, cups, steam, kettle, ice, splashes, surfaces) are strictly secondary accents. Contextual elements may not exceed 25% visual dominance.',
    'PROHIBITIONS: Never render cup-only scene. Never replace packaging with beverage container. Never generate stock-style ritual composition. Never crop packaging out of frame. Never center a cup in front of the product. Never allow contextual elements to overpower packaging. Never restyle the product into a different SKU variation.',
    'PACKAGING_STRUCTURE_LOCK: The uploaded packaging must remain structurally identical to the reference image. Do NOT add spouts, valves, caps, pumps, closures, or top mechanisms. Do NOT modify seal type, zipper type, pouch geometry, material finish, packaging proportions, label layout, label typography, or closure system. If a structural detail is unclear, preserve the original silhouette exactly and never invent physical features.',
    'STRUCTURAL_MUTATION_PROHIBITION: true.',
    'COFFEE_GEOMETRY_LOCK: Maintain exact width-to-height proportions. Never stretch, compress, or reinterpret packaging geometry.',
    isPdpCleanIntent
      ? 'PDP_CLEAN_MODE: ecommerce-ready packaging-first execution enabled.'
      : 'CAMPAIGN_MODE: creative packaging-first execution enabled.',
    'ACCENT_SCALE_RULE: Beans = decorative only. Cup = side support only. Steam = subtle and secondary.',
    'PRODUCT_ENFORCEMENT: true.',
    intentMap[packagingIntent] || intentMap['pdp-clean'],
    `COFFEE_ACCENTS: beansScatter=${beans}; cupAccent=${cup}; steamLevel=${state.coffeeSteamVisibility || 'subtle'}; espressoSplash=${splash}; iceMode=${iceMode}.`,
    `COFFEE_SURFACE_STYLE: ${surfaceStyle}.`,
    `COFFEE_TEMPERATURE_FEEL: ${temperatureFeel}.`,
    'COFFEE_SERVE_STYLE_OPTIONS: cup-only | cup-and-bag | espresso-machine.',
    `COFFEE_SERVE_STYLE: ${serveStyle}.`,
    cinematic ? 'COFFEE_CONTEXT_DEPTH: high.' : '',
    cinematic ? 'COFFEE_FALLOFF_STYLE: dark-to-warm-gradient.' : '',
    hasProductReference
      ? 'COFFEE_REFERENCE_LOCK: product reference exists; packaging context overrides beverage context and cup-dominant rendering is disabled.'
      : 'COFFEE_REFERENCE_LOCK: no product reference detected; beverage-only fallback remains disabled.',
    'COFFEE_BOUNDING_RULE: enforce product bounding-box centrality.',
    'CRITICAL: The exact uploaded product packaging must appear in the final image. It must remain structurally identical to the reference. No physical alterations are allowed. Do not invent new packaging features. Do not change closure systems. Do not modify the top seal. Do not reinterpret the packaging design.',
  ].join(' ');
}

export function buildCoffeeIndustryLayer(
  authority: StudioAuthorityBundle,
  state?: StudioUIState
): string {
  if (state?.visualProfile !== 'coffee' || !state.coffeeIndustryLayer) return '';

  // Resolve effective variant using the same override priority as buildComposition:
  // coffeeMoodProfile=cinematic-luxury wins first, then visualIntent overrides,
  // then state.coffeeVariant, then fallback.
  const effectiveVariant: string = (() => {
    if (state.coffeeMoodProfile === 'coffee-cinematic-luxury' || state.coffeeVariant === 'coffee-cinematic-luxury') {
      return 'coffee-cinematic-luxury';
    }
    if (state.visualIntent === 'conversion' || state.coffeeVariant === 'coffee-premium-minimal') {
      return 'coffee-premium-minimal';
    }
    if (state.visualIntent === 'campaign' || state.coffeeVariant === 'coffee-color-pop-luxury') {
      return 'coffee-color-pop-luxury';
    }
    return state.coffeeVariant || 'coffee-editorial-ritual';
  })();

  const coverage = String(state.coffeeCompositionCoverage || '').trim();
  const cinematic = effectiveVariant === 'coffee-cinematic-luxury';
  const cremaBehavior = state.coffeeEspressoMode
    ? 'CREMA_BEHAVIOR: espresso mode active; micro-bubble crema texture with irregular natural foam distribution. No wine translucency.'
    : 'CREMA_BEHAVIOR: non-espresso mode; minimal crema emphasis with natural surface coherence.';

  const coffeeLiquidPhysicsEnabled = state.coffeeLiquidPhysicsEnabled !== false;

  const motionRules = effectiveVariant === 'coffee-cinematic-luxury'
    ? 'COFFEE_MOTION_RULES: cinematic luxury allows static or controlled-stream ritual pouring only. No chaotic splash energy.'
    : effectiveVariant === 'coffee-premium-minimal'
    ? 'COFFEE_MOTION_RULES: conversion mode allows static or dispensed only. No chaotic splash energy.'
    : effectiveVariant === 'coffee-color-pop-luxury'
      ? 'COFFEE_MOTION_RULES: campaign mode allows static or controlled-stream pouring only. No gravity violation and no floating particles.'
      : 'COFFEE_MOTION_RULES: editorial ritual allows static, dispensed, pouring, and subtle steam drift upward only. Steam must stay gravity compliant.';

  return [
    '### COFFEE_PACKAGING_STRUCTURAL_PRIORITY_BLOCK',
    'PRIORITY_LEVEL: ABSOLUTE',
    'PRECEDENCE: 0',
    'STRUCTURAL_DOMINANCE_REQUIRED: TRUE',
    'COFFEE_REALISM_TARGET: Hyper-real professional coffee product advertising. Premium campaign polish with true photographic capture behavior. No CGI, no synthetic render finish, and no stock-cafe look.',
    buildCoffeeProductPriorityBlock(state),
    `COFFEE_INDUSTRY_VARIANT: ${effectiveVariant}.`,
    'COFFEE_PHYSICS_PROFILE: enabled.',
    coffeeLiquidPhysicsEnabled
      ? 'COFFEE_LIQUID_PHYSICS: Opaque dark brown absorption core. Minimal translucency. Soft edge highlight near surface. Subtle meniscus at cup rim.'
      : 'COFFEE_LIQUID_PHYSICS: disabled by user control.',
    cremaBehavior,
    buildSteamBlock(state),
    'NO_GLASS_PRIORITY: ceramic priority materials with controlled reflective response. No glass refraction dominance.',
    buildCoffeeMoodBlock(state),
    buildCoffeeEnvironmentBlock(state),
    cinematic
      ? 'COFFEE_LENS_BIAS: 50mm or 70mm slight compression.'
      : 'COFFEE_LENS_BIAS: 50mm natural perspective preferred; user camera selection remains authoritative.',
    cinematic ? 'COFFEE_CAMERA_ANGLE: 35–45° ritual hero.' : '',
    cinematic ? 'DEPTH_STYLE: shallow foreground separation.' : '',
    `COFFEE_COMPOSITION_PROFILE: ${state.compositionProfile || 'ritual-balance'}.`,
    coverage ? `COFFEE_COMPOSITION_COVERAGE: ${coverage}.` : '',
    motionRules,
    authority.world === 'splash-tank'
      ? 'COFFEE_WORLD_GUARD: do not apply wine splash physics or wine bottle behavior.'
      : '',
  ]
    .filter(Boolean)
    .join(' ');
}
