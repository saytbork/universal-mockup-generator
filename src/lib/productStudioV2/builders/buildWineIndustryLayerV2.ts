import type { StudioUIState } from '../types/studioTypes.ts';

function buildWineMoodProfile(state: StudioUIState): string {
  const mood = state.wineMoodProfile || 'prestige';
  const moodMap: Record<string, string> = {
    prestige:
      'WINE_MOOD_PROFILE: prestige. Real photographed wine bottle with warm restrained light, moderate shadow depth, and strong product dominance.',
    editorial:
      'WINE_MOOD_PROFILE: editorial. Neutral-to-warm light, medium contrast, light depth, and authentic tabletop behavior.',
    ecommerce:
      'WINE_MOOD_PROFILE: ecommerce. Neutral daylight, clean label clarity, moderate shadows, minimal atmosphere.',
    'dark-luxury':
      'WINE_MOOD_PROFILE: dark-luxury. Low-key real photography, deep but readable shadows, restrained atmosphere, no synthetic gloss.',
    'modern-minimal':
      'WINE_MOOD_PROFILE: modern-minimal. Clean neutral lighting, refined contrast, low atmosphere, simple real surfaces.',
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
    'WINE_LIQUID_PHYSICS: Natural wine translucency, believable meniscus, and realistic light absorption.',
    'WINE_GLASS_BEHAVIOR: Realistic refraction and natural liquid distortion through glass.',
    action === 'controlled-pour' || motion === 'opened'
      ? 'WINE_CORK_LOGIC: natural cork removal active. No beer caps. No synthetic closures unless explicitly defined.'
      : 'WINE_CORK_LOGIC: cork-secured presentation. No beer caps. No synthetic closures unless explicitly defined.',
    motion === 'spilled'
      ? 'GRAVITY_RULE: Liquid obeys gravity with controlled spill behavior. No chaotic splash system.'
      : 'GRAVITY_RULE: Liquid obeys gravity. No splash chaos.',
    buildWineMoodProfile(state),
    `WINE_ENVIRONMENT_VARIATION: ${environment}.`,
    `WINE_ENVIRONMENT_CONTEXT: ${buildWineEnvironmentContext(environment)} Keep environment secondary to bottle fidelity. No theatrical stylization.`,
  ].join(' ');
}
