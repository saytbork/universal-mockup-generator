import type { StudioUIState } from '../types/studioTypes.ts';

function normalize(value: unknown): string {
  return String(value || '').trim().toLowerCase();
}

function buildWineLiquidPhysics(state: StudioUIState): string {
  const wineType = String(state.wineType || '').trim().toLowerCase();
  const carbonation = normalize(state.carbonationLevel);

  // If we don't know wine type (especially when a reference image exists), never guess the liquid color.
  if (!wineType || wineType === 'auto') {
    return [
      'WINE_LIQUID_PHYSICS:',
      'Match the exact liquid color from the reference product.',
      'No hue shift. No saturation drift. No cinematic grading on liquid.',
      carbonation === 'high' ? 'If sparkling: visible bubbles + fine effervescence.' : 'No invented bubbles unless reference shows them.',
      'Natural meniscus and realistic light absorption.',
    ].join(' ');
  }

  const base =
    wineType === 'white'
      ? 'Pale straw-to-golden translucency. Clean clarity. Subtle edge luminosity. Natural meniscus.'
      : wineType === 'rosé'
        ? 'Pale salmon-to-rose translucency. Soft blush core. Natural meniscus.'
        : wineType === 'sparkling-white'
          ? 'Pale straw sparkling translucency. Fine effervescence. Bubble columns. Light foam ring at rim. Natural meniscus.'
          : wineType === 'sparkling-rosé'
            ? 'Pale rose sparkling translucency. Fine effervescence. Bubble columns. Light foam ring at rim. Natural meniscus.'
            : 'Deep burgundy translucency. Light absorption core. Edge luminosity near rim. Natural meniscus.';

  return `WINE_LIQUID_PHYSICS: ${base}`;
}

function buildClosureLogic(state: StudioUIState): string {
  const closure = normalize(state.wineClosureType);
  const bottleState = normalize(state.wineBottleState);
  const glassMode = normalize(state.wineGlassMode);
  const isOpen = bottleState !== 'sealed';

  const closureName =
    closure.includes('crown') ? 'metal crown cap' :
      closure.includes('screw') ? 'screw cap' :
        closure.includes('synthetic') ? 'synthetic closure' :
          closure.includes('cage') ? 'cork with cage' :
            closure === 'from-reference' || closure === 'from reference' || !closure ? 'reference closure' :
              'natural cork';

  if (!isOpen) {
    return `WINE_CORK_LOGIC: bottle sealed. Closure must remain on neck. closureType=${closureName}. Do not invent alternate closures.`;
  }

  const volumeRule = glassMode === 'filled'
    ? 'If glass contains liquid: bottle liquid level must be reduced proportionally. Forbid full bottle + filled glass.'
    : 'If glass is empty/none: bottle liquid level unchanged.';

  return [
    'WINE_CORK_LOGIC:',
    'bottle open presentation.',
    `Remove ${closureName} from neck.`,
    `Place the same ${closureName} on the surface nearby.`,
    'Neck must appear physically open (no attached closure artifacts).',
    volumeRule,
    'Do not invent cork if reference uses crown-cap or screw-cap.',
  ].join(' ');
}

function buildWineMoodProfile(state: StudioUIState): string {
  const mood = state.wineMoodProfile || 'prestige';
  const moodMap: Record<string, string> = {
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
  return moodMap[mood] || moodMap.prestige;
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

export function buildWineIndustryLayerV2(state?: StudioUIState): string {
  if (!state?.winePrestigeMode) return '';

  const motion = String(state.motion || 'static').trim().toLowerCase();
  const action = String(state.wineAction || 'static-presentation').trim();
  const environment = state.wineEnvironmentVariation || 'black-studio';

  return [
    'WINE_PHYSICS_PROFILE: enabled.',
    buildWineLiquidPhysics(state),
    'WINE_GLASS_BEHAVIOR: Realistic refraction. Micro-specular highlights. Natural liquid distortion through glass.',
    buildClosureLogic(state),
    motion === 'spilled'
      ? 'GRAVITY_RULE: Liquid obeys gravity with controlled spill behavior. No chaotic splash system.'
      : 'GRAVITY_RULE: Liquid obeys gravity. No splash chaos.',
    buildWineMoodProfile(state),
    `WINE_ENVIRONMENT_VARIATION: ${environment}.`,
    `WINE_ENVIRONMENT_CONTEXT: ${buildWineEnvironmentContext(environment)} Depth-field context and spatial integration only.`,
  ].join(' ');
}
