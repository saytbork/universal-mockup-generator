import type { StudioUIState } from '../types/studioTypes';

type VisualStyleCategory = NonNullable<StudioUIState['visualStyleCategory']>;

type VisualStyleDefinition = {
  name: string;
  category: VisualStyleCategory;
  scene: string;
};

const VISUAL_STYLE_DEFINITIONS: Record<string, VisualStyleDefinition> = {
  'Clinical Lab Counter': {
    name: 'clinical-lab-counter',
    category: 'studio',
    scene:
      'clean clinical counter environment, medical-grade surface styling, restrained sterile realism, neutral laboratory discipline, precise surface cleanliness, premium supplement photography with scientific credibility',
  },
  'Minimal Bathroom Vanity': {
    name: 'minimal-bathroom-vanity',
    category: 'studio',
    scene:
      'minimal bathroom vanity styling, premium self-care countertop, soft architectural surfaces, refined cosmetic realism, clean upscale residential bathroom atmosphere, elegant minimal object staging',
  },
  'Dark Premium Studio': {
    name: 'dark-premium-studio',
    category: 'studio',
    scene:
      'dark premium studio environment, deep charcoal tonal field, luxury product separation, controlled high-end reflections, cinematic shadow architecture, premium advertising polish',
  },
  'Tech Clean Studio': {
    name: 'tech-clean-studio',
    category: 'studio',
    scene:
      'clean technology studio aesthetic, precise neutral background, sleek commercial lighting, high-clarity industrial polish, minimal modern tech presentation, controlled reflection design',
  },
  'Monochrome Brand': {
    name: 'monochrome-brand',
    category: 'brand',
    scene:
      'monochrome brand world, reduced palette discipline, cohesive tonal branding, restrained premium composition, high consistency brand styling, minimal distraction around product',
  },
  'Brand Campaign': {
    name: 'brand-campaign',
    category: 'brand',
    scene:
      'campaign-grade branded environment, premium commercial storytelling, polished hero presentation, branded tonal coherence, conversion-aware art direction, elevated ad aesthetic',
  },
  'Creator Premium Simulation': {
    name: 'creator-premium-simulation',
    category: 'brand',
    scene:
      'premium creator-style branded set, polished social-commercial hybrid aesthetic, aspirational creator environment, soft premium realism, high-end UGC-meets-brand look',
  },
  'Soft Wellness Morning': {
    name: 'soft-wellness-morning',
    category: 'lifestyle',
    scene:
      'soft wellness morning atmosphere, airy natural calm, gentle premium light, healthy lifestyle realism, quiet editorial warmth, subtle freshness and morning ritual tone',
  },
  'Outdoor Energy Boost': {
    name: 'outdoor-energy-boost',
    category: 'lifestyle',
    scene:
      'outdoor energy atmosphere, bright active lifestyle tone, clean dynamic freshness, uplifting natural environment cues, vitality-oriented product presentation, energetic premium realism',
  },
};

function resolveVisualStyle(state?: StudioUIState): VisualStyleDefinition | null {
  const style = String(state?.visualStyle || '').trim();
  if (!style) return null;
  const definition = VISUAL_STYLE_DEFINITIONS[style];
  if (!definition) return null;

  const category = (state?.visualStyleCategory || definition.category) as VisualStyleCategory;
  return {
    ...definition,
    category,
  };
}

export function buildVisualStyle(state?: StudioUIState): string {
  const definition = resolveVisualStyle(state);
  if (!definition) return '';

  return [
    'VISUAL_STYLE_MODE: active.',
    `VISUAL_STYLE_CATEGORY: ${definition.category}.`,
    `VISUAL_STYLE_NAME: ${definition.name}.`,
    `VISUAL_STYLE_SCENE: ${definition.scene}`,
    'VISUAL_STYLE_AUTHORITY: Visual Style defines aesthetic world mood, surface language, tonal identity, and styling bias. It does not override product geometry, artwork fidelity, or physical truth constraints.',
  ].join(' ');
}

