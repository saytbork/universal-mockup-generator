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
    vineyard: 'background context: real vineyard rows or natural vine-area depth, softly photographed rather than volumetric; surface: natural soil, worn wood, or stone.',
    'dark-cellar': 'background context: authentic cellar depth with real barrel or stone cues, low light and tactile shadow falloff; surface: aged oak or rough stone.',
    'marble-bar': 'background context: real hospitality bar backdrop with restrained depth and believable reflections; surface: dark marble or polished stone.',
    'minimal-gradient': 'background context: photographed seamless backdrop with gentle tonal falloff, not CGI void; surface: clean neutral platform.',
    'black-studio': 'background context: matte black photographed backdrop with imperfect natural falloff; surface: matte black plane, not glossy render plinth.',
    'modern-kitchen': 'background context: lived-in modern kitchen cues with believable countertop depth; surface: polished stone or composite counter.',
    'luxury-dining': 'background context: refined dining room depth with real table setting cues, never theatrical stage design; surface: premium dining table.',
    'moody-backlight': 'background context: dark backlit room depth with natural falloff and restrained haze; surface: refined dark tabletop.',
    'sunlit-table': 'background context: real sunlit interior table scene with window-driven shadows; surface: warm wood table.',
    'architectural-shadow': 'background context: photographed wall or set with real shadow geometry and imperfect texture; surface: stone or mineral slab.',
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
    `WINE_ENVIRONMENT_CONTEXT: ${buildWineEnvironmentContext(environment)} Keep environment secondary to bottle fidelity. Real photographed surfaces only. No theatrical stylization. No CGI showroom depth. No render-engine polish.`,
  ].join(' ');
}
