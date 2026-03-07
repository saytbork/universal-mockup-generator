import type { StudioUIState } from '../types/studioTypes';

type VisualStyleCategory = NonNullable<StudioUIState['visualStyleCategory']>;

type VisualStyleDefinition = {
  name: string;
  category: VisualStyleCategory;
  scene: string;
};

const GOLDEN_SUNSET_BG_VARIANTS: Array<{ name: string; scene: string }> = [
  {
    name: 'sea-horizon-glow',
    scene:
      'sunset sea horizon background with intense amber sky gradient, low sun bloom, and soft reflective water bokeh',
  },
  {
    name: 'desert-heat-haze',
    scene:
      'sunset desert background with warm orange haze, subtle heat shimmer, and smooth distant dune silhouette',
  },
  {
    name: 'city-rooftop-sunset',
    scene:
      'urban sunset skyline background with golden haze, distant soft high-rise silhouettes, and atmospheric backlight diffusion',
  },
  {
    name: 'coastal-rock-sunset',
    scene:
      'coastal rock sunset background with warm flare bloom, glowing horizon band, and soft foreground bokeh rolloff',
  },
  {
    name: 'open-sky-sunset-wash',
    scene:
      'open sunset sky background with strong golden wash, radial light falloff, and minimal horizon depth separation',
  },
];

function pickRandom<T>(values: T[]): T {
  return values[Math.floor(Math.random() * values.length)];
}

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
  'Sunlit Stone Editorial': {
    name: 'sunlit-stone-editorial',
    category: 'lifestyle',
    scene:
      'sunlit stone editorial atmosphere, architectural hard-light shadows, premium warm-neutral tonal control, product-first composition with tactile mineral surfaces',
  },
  'Golden Sunset Backlit': {
    name: 'golden-sunset-backlit',
    category: 'lifestyle',
    scene:
      'golden sunset backlit mood, warm edge glow, controlled flare behavior, premium aspirational energy, readable product silhouette',
  },
  'Bathroom Daylight Clean': {
    name: 'bathroom-daylight-clean',
    category: 'lifestyle',
    scene:
      'bathroom daylight clean aesthetic, soft natural window illumination, minimal self-care styling, premium cleanliness and restrained context',
  },
  'Warm Window Wood': {
    name: 'warm-window-wood',
    category: 'lifestyle',
    scene:
      'warm window wood lifestyle mood, natural sunlight warmth, soft interior shadowing, premium domestic realism with controlled product focus',
  },
};

function resolveVisualStyle(state?: StudioUIState): VisualStyleDefinition | null {
  const rawStyle = String(state?.visualStyle || '').trim();
  const style = rawStyle === 'Golden Sunset Backlit Atmosphere' ? 'Golden Sunset Backlit' : rawStyle;
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

  const isGoldenSunset = definition.name === 'golden-sunset-backlit';
  const goldenVariant = isGoldenSunset ? pickRandom(GOLDEN_SUNSET_BG_VARIANTS) : null;
  const sceneText = goldenVariant ? `${definition.scene}, ${goldenVariant.scene}` : definition.scene;

  return [
    'VISUAL_STYLE_MODE: active.',
    `VISUAL_STYLE_CATEGORY: ${definition.category}.`,
    `VISUAL_STYLE_NAME: ${definition.name}.`,
    `VISUAL_STYLE_SCENE: ${sceneText}`,
    ...(goldenVariant
      ? [
          'GOLDEN_SUNSET_BACKLIT_ATMOSPHERE: active.',
          'GOLDEN_SUNSET_BG_RANDOMIZATION: always-on.',
          `GOLDEN_SUNSET_BG_VARIANT: ${goldenVariant.name}.`,
        ]
      : []),
    'VISUAL_STYLE_AUTHORITY: Visual Style defines aesthetic world mood, surface language, tonal identity, and styling bias. It does not override product geometry, artwork fidelity, or physical truth constraints.',
  ].join(' ');
}
