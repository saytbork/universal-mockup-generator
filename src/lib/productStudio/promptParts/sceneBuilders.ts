import type { Randomizer } from './randomizationRules';

export type PhotoModeKey =
  | 'HERO_NEUTRAL'
  | 'COLOR_POP_HERO'
  | 'INGREDIENT_STACK'
  | 'ACRYLIC_BLOCKS'
  | 'SPLASH_SHOT'
  | 'FOAM_AND_TEXTURE'
  | 'ROUTINE_CAROUSEL'
  | 'CLINICAL_LAB_COUNTER'
  | 'GOLDEN_MIST_AURA'
  | 'CANDY_GRADIENT_LAB';

export type PaletteInfo = {
  dominant?: string;
  secondary?: string;
  accent?: string;
};

export type SceneBuildInput = {
  randomizer: Randomizer;
  palette?: PaletteInfo;
  suggestedProps?: string;
  ingredientLayout?: 'auto' | 'grounded' | 'floating' | 'top-view';
  backgroundColor?: string;
  gradientEnabled?: boolean;
  gradientStart?: string;
  gradientEnd?: string;
  /** Optional 3rd stop for brand gradients (Hero Landing Page only). */
  gradientMid?: string;
  heroBackgroundType?: 'Solid' | 'Gradient';
  heroGradientStyle?: 'Soft' | 'Radial' | 'Vertical';
  heroNegativeSpace?: 'Tight' | 'Balanced' | 'Spacious';
  heroColorSource?: 'Brand Colors' | 'Custom Color';
  heroPaletteSource?: 'Product label colors' | 'Neutral brand tones' | 'Custom';
  heroContrastLevel?: 'Soft' | 'High';
  colorPopBackgroundType?: 'Solid' | 'Gradient';
  colorPopGradientStyle?: 'Soft' | 'Radial' | 'Vertical';
  colorPopColorSource?: 'Brand Colors' | 'Product Label Colors' | 'Custom Color';
  colorPopSaturationLevel?: 'Moderate' | 'High';
  colorPopContrastStrategy?: 'Soft' | 'High';
  colorPopNegativeSpace?: 'Tight' | 'Balanced' | 'Spacious';
};

export type SplashMode = 'IMPACT_SPLASH' | 'RISING_SPLASH' | 'SIDE_DISPLACEMENT_SPLASH';

const paletteDescriptor = (palette?: PaletteInfo): string => {
  if (!palette?.dominant && !palette?.secondary && !palette?.accent) {
    return 'derived from the product palette with premium tonal harmony';
  }
  const bits = [palette.dominant, palette.secondary, palette.accent].filter(Boolean);
  if (bits.length === 1) return `derived from the product palette (${bits[0]})`;
  return `derived from the product palette (${bits.join(', ')})`;
};

export function buildHeroNeutralScene({ randomizer, backgroundColor, gradientEnabled, gradientStart, gradientEnd }: SceneBuildInput): string {
  const depthSettings = [
    'minimalist architectural nook with subtle spatial depth',
    'clean counter vignette with a soft back wall and ambient falloff',
    'quiet premium set with layered planes and gentle gradients',
  ];
  const materials = [
    'matte plaster',
    'brushed stone',
    'soft ceramic',
    'linen-wrapped surface',
  ];
  const accents = [
    'subtle shadow gradients along the background plane',
    'soft ambient shadowing that creates depth',
    'delicate tonal transitions in the environment',
  ];

  const backgroundText = (() => {
    if (gradientEnabled && gradientStart && gradientEnd) {
      return `background is a smooth vertical gradient from ${gradientStart} to ${gradientEnd}`;
    }
    if (backgroundColor) {
      return `background is a solid minimal ${backgroundColor} surface`;
    }
    return 'Clean but deep environment with subtle gradients or ambient shadows';
  })();

  return [
    `${backgroundText}.`,
    'Minimalist premium setting with spatial depth.',
    `Environment built from ${randomizer.pick(materials)} and refined surfaces.`,
    `Scene anchored in a ${randomizer.pick(depthSettings)}.`,
    randomizer.pick(accents),
    'Environment supports the product without overpowering it.'
  ].join(' ');
}

export function buildColorPopHeroScene({
  colorPopBackgroundType = 'Solid',
  colorPopGradientStyle = 'Soft',
  colorPopColorSource = 'Brand Colors',
  colorPopSaturationLevel = 'Moderate',
  colorPopContrastStrategy = 'Soft',
  colorPopNegativeSpace = 'Balanced',
}: SceneBuildInput): string {
  const backgroundTypeInjection =
    colorPopBackgroundType === 'Gradient'
      ? 'Bold gradient background with smooth color transitions and no visible banding.'
      : 'Solid high-saturation studio background with perfectly uniform color field.';

  const gradientStyleInjection = colorPopBackgroundType === 'Gradient'
    ? (colorPopGradientStyle === 'Radial'
      ? 'Radial gradient centered behind the product to enhance focal dominance.'
      : colorPopGradientStyle === 'Vertical'
        ? 'Vertical gradient with top-to-bottom tonal flow for visual energy.'
        : 'Soft gradient with subtle tonal transition and premium smoothness.')
    : '';

  const colorSourceInjection = (() => {
    switch (colorPopColorSource) {
      case 'Product Label Colors':
        return 'Color palette derived directly from the product label hues.';
      case 'Custom Color':
        return 'Custom user-defined color used as primary background tone.';
      case 'Brand Colors':
      default:
        return 'Color palette strictly derived from brand-defined colors.';
    }
  })();

  const saturationInjection =
    colorPopSaturationLevel === 'High'
      ? 'Highly saturated colors designed to aggressively stop scroll.'
      : 'Moderately saturated colors with premium restraint.';

  const contrastInjection =
    colorPopContrastStrategy === 'High'
      ? 'Strong contrast between product and background for maximum separation.'
      : 'Controlled contrast preserving color harmony and legibility.';

  const negativeSpaceInjection = (() => {
    switch (colorPopNegativeSpace) {
      case 'Tight':
        return 'Compact framing with minimal negative space to amplify visual punch.';
      case 'Spacious':
        return 'Generous negative space reserved for headline and CTA overlays.';
      case 'Balanced':
      default:
        return 'Balanced negative space allowing clarity without reducing impact.';
    }
  })();

  return [
    'Color pop hero advertising photography.',
    'High-impact color-driven hero composition designed to stop scroll and maximize brand recall.',
    'Color-driven composition only.',
    backgroundTypeInjection,
    gradientStyleInjection,
    colorSourceInjection,
    saturationInjection,
    contrastInjection,
    negativeSpaceInjection,
    'Clean studio environment with perfectly smooth color surfaces.',
    'Professional commercial lighting optimized for accurate color reproduction and visual punch.',
    'Hero or straight-on camera angle with strong visual hierarchy.',
    'Single product focal point only.',
    'Mandatory clean negative space for headline and CTA placement.',
    'No people, no hands, no human anatomical elements.',
    'No real-world usage context, no UGC artifacts.',
    'No flat lay.',
    'No props of any kind.',
    'No geometric set pieces.',
    'No ingredients.',
    'No fabrics, no towels, no linens.',
    'No reused color schemes from previous generations.',
    'Shot by a professional creative team.',
    'Editorial-grade, modern advertising quality with bold color execution.'
  ].filter(Boolean).join(' ');
}

export function buildIngredientStackScene({ randomizer, suggestedProps, ingredientLayout }: SceneBuildInput): string {
  const ingredientList = suggestedProps?.trim()
    ? `Ingredients: ${suggestedProps}.`
    : 'Ingredients limited to powders (measured mounds), extracts, seeds, roots, capsules, or minimal contained liquids.';

  return [
    'Exploded ingredient stack advertising photography.',
    'High-impact vertical composition designed to communicate formulation strength and complexity.',
    'Ingredients are vertically separated along a central axis, floating with deliberate spacing and a clear hierarchy.',
    'Each layer is visually distinct, aligned with the product below.',
    'The product anchors the base of the composition.',
    'Clean studio or soft gradient background with no narrative surface.',
    'Professional studio lighting with soft directional key and subtle grounding shadows.',
    'No flat lay. No radial or surrounding layouts.',
    'No decorative wellness styling. No lifestyle or kitchen cues. No props.',
    ingredientList,
    'Floating feels intentional and controlled; no chaotic scatter.',
    'Premium advertising photography with strong energy and clarity.'
  ].join(' ');
}

export function buildAcrylicBlocksScene({ randomizer }: SceneBuildInput): string {
  const structures = [
    'stacked acrylic plinths of varied heights',
    'precision-cut acrylic blocks with crisp refraction',
    'layered acrylic pedestals with prismatic edges',
  ];
  const reflections = [
    'clean refraction and realistic thickness',
    'controlled reflections with visible edge highlights',
    'subtle internal reflections and glassy depth',
  ];

  return [
    'Professional studio setup using real acrylic blocks.',
    `Set built from ${randomizer.pick(structures)} with ${randomizer.pick(reflections)}.`,
    'High-end commercial product photography with controlled geometry.',
    'Studio lighting is allowed only for this mode; still premium and dimensional.'
  ].join(' ');
}

export function buildSplashShotScene({ randomizer }: SceneBuildInput): { scene: string; splashMode: SplashMode } {
  const splashMode = randomizer.pick<SplashMode>([
    'IMPACT_SPLASH',
    'RISING_SPLASH',
    'SIDE_DISPLACEMENT_SPLASH'
  ]);

  const modeDescriptions: Record<SplashMode, string> = {
    IMPACT_SPLASH: 'Product impacting a liquid surface causing an upward explosive splash with physically accurate droplets.',
    RISING_SPLASH: 'Product emerging from liquid with an upward wrapping splash and natural asymmetry.',
    SIDE_DISPLACEMENT_SPLASH: 'Product displacing liquid laterally with dynamic movement and directional force.'
  };

  return {
    splashMode,
    scene: [
      'Dynamic splash environment with real physical liquid behavior.',
      modeDescriptions[splashMode],
      'Physics must make sense; no circular decorative splash allowed.',
      'Surface and surrounding elements remain premium and controlled.'
    ].join(' ')
  };
}

export function buildTileAndSpaScene({ randomizer }: SceneBuildInput): string {
  const tiles = ['glossy white tiles', 'soft matte stone tiles', 'warm neutral spa tiles'];
  const accents = ['subtle moisture droplets', 'soft vapor in the air', 'gentle steam interacting with light'];

  return [
    'Real spa environment with tiles, moisture, and subtle vapor.',
    `Set includes ${randomizer.pick(tiles)} with clean grout lines.`,
    `Atmosphere includes ${randomizer.pick(accents)}.`,
    'Luxury wellness magazine aesthetic.'
  ].join(' ');
}

export function buildFoamAndTextureScene({ randomizer }: SceneBuildInput): string {
  const textures = ['foam clusters', 'bubble textures', 'gel ribbons', 'creamy swatches'];
  const framing = ['macro or semi-macro editorial look', 'tight framing with material detail', 'close composition emphasizing textures'];

  return [
    'Foam, bubbles, or textures used as design elements.',
    'Product remains clean, readable, and untouched by residue.',
    randomizer.pick(textures),
    randomizer.pick(framing),
    'Surface plane visible with realistic depth cues.'
  ].join(' ');
}

export function buildRoutineCarouselScene({ randomizer }: SceneBuildInput): string {
  const scenes = [
    'everyday wellness routine on a clean counter',
    'morning ritual setup with minimal props',
    'repeatable routine scene with consistent surfaces',
  ];
  const props = ['folded linen', 'simple glassware', 'minimal ceramic dish', 'soft paper elements'];

  return [
    'Everyday wellness routine scene with natural composition.',
    randomizer.pick(scenes),
    `Supporting props include ${randomizer.pick(props)}.`,
    'Designed for repeatable carousel outputs with consistent spacing.'
  ].join(' ');
}

export function buildPastelPicnicScene({ randomizer }: SceneBuildInput): string {
  const textiles = ['pastel textile layers', 'soft picnic blanket textures', 'muted gingham fabric'];
  const props = ['fresh fruit slices', 'delicate glassware', 'sunlit petals'];

  return [
    'Outdoor pastel environment with soft textiles and natural props.',
    `Set includes ${randomizer.pick(textiles)} and ${randomizer.pick(props)}.`,
    'Diffused daylight with premium editorial styling.'
  ].join(' ');
}

export function buildSunriseWellnessCounterScene({ randomizer }: SceneBuildInput): string {
  const materials = ['stone', 'wood', 'ceramic', 'brushed metal'];
  const accents = ['subtle steam', 'morning glow', 'long soft shadows'];

  return [
    'Interior counter scene with sunrise light.',
    `Warm materials like ${randomizer.pick(materials)} define the space.`,
    `Atmosphere includes ${randomizer.pick(accents)}.`,
    'Premium, quiet morning energy.'
  ].join(' ');
}

export function buildClinicalLabCounterScene({ randomizer }: SceneBuildInput): string {
  const labProps = ['clean glassware silhouettes', 'stainless accents', 'sterile lab tools'];
  const surfaces = ['white lab counter', 'cool-toned stone surface', 'matte clinical bench'];

  return [
    'Realistic clinical laboratory environment with professional credibility.',
    `Set includes ${randomizer.pick(labProps)} and a ${randomizer.pick(surfaces)}.`,
    'No sci-fi elements; grounded, real-world lab aesthetic.'
  ].join(' ');
}

export function buildGoldenMistAuraScene({ randomizer }: SceneBuildInput): string {
  const accents = ['soft golden mist', 'subtle atmospheric glow', 'gentle haloing around the set'];

  return [
    'Soft golden mist surrounding the product with subtle atmospheric glow.',
    randomizer.pick(accents),
    'Premium wellness feeling with controlled haze.'
  ].join(' ');
}

export function buildOutdoorEnergyBoostScene({ randomizer }: SceneBuildInput): string {
  const surfaces = ['clean stone slab', 'textured concrete ledge', 'natural wood surface'];
  const accents = ['dynamic wind movement in the background', 'sunlit foliage', 'energetic daylight highlights'];

  return [
    'Outdoor real-world environment with strong natural daylight.',
    `Product staged on a ${randomizer.pick(surfaces)}.`,
    randomizer.pick(accents),
    'Dynamic energy and movement.'
  ].join(' ');
}

export function buildCrownWellnessVanityScene({ randomizer }: SceneBuildInput): string {
  const materials = ['marble', 'brushed metal', 'polished stone', 'soft mirror glass'];
  const accents = ['luxury vanity reflections', 'subtle metallic highlights', 'high-end beauty styling'];

  return [
    'Luxury vanity setup with mirrors and refined accents.',
    `Materials include ${randomizer.pick(materials)} with ${randomizer.pick(accents)}.`,
    'High-end editorial beauty look.'
  ].join(' ');
}

export function buildCandyGradientLabScene({ randomizer }: SceneBuildInput): string {
  const gradients = ['controlled candy-like gradients', 'experimental color transitions', 'playful but premium color fields'];
  const elements = ['clean geometric forms', 'transparent lab surfaces', 'polished reflective accents'];

  return [
    'Creative lab environment with controlled gradients.',
    randomizer.pick(gradients),
    `Set includes ${randomizer.pick(elements)}.`,
    'Experimental but premium, with physical realism preserved.'
  ].join(' ');
}

export function buildStudioHeroScene({
  gradientEnabled,
  heroBackgroundType = gradientEnabled ? 'Gradient' : 'Solid',
  heroGradientStyle = 'Soft',
  heroNegativeSpace = 'Balanced',
  heroColorSource = 'Brand Colors',
  heroPaletteSource = 'Product label colors',
  heroContrastLevel = 'Soft',
}: SceneBuildInput): string {
  const backgroundInjection =
    heroBackgroundType === 'Gradient'
      ? 'Smooth studio gradient background with controlled tonal transition.'
      : 'Solid studio background with uniform tone and no visible gradients.';

  const colorInjection =
    heroColorSource === 'Custom Color'
      ? 'Background color defined by custom user-selected tone, applied uniformly.'
      : 'Background color derived strictly from brand color palette.';

  const gradientStyleInjection = heroBackgroundType === 'Gradient'
    ? (heroGradientStyle === 'Radial'
      ? 'Radial gradient centered behind the product to enhance focal emphasis.'
      : heroGradientStyle === 'Vertical'
        ? 'Vertical gradient with top-to-bottom tonal transition.'
        : 'Soft gradient with subtle tonal shift and no visible edges.')
    : '';

  const paletteSourceInjection = (() => {
    switch (heroPaletteSource) {
      case 'Neutral brand tones':
        return 'Neutral brand-aligned tones with low chroma and high legibility.';
      case 'Custom':
        return 'Custom-defined palette explicitly provided by user input.';
      case 'Product label colors':
      default:
        return 'Color palette sampled directly from the product label tones.';
    }
  })();

  const negativeSpaceInjection = (() => {
    switch (heroNegativeSpace) {
      case 'Tight':
        return 'Compact negative space with minimal margins around the product.';
      case 'Spacious':
        return 'Generous negative space designed for headline and CTA overlay.';
      case 'Balanced':
      default:
        return 'Balanced negative space allowing clear separation between product and background.';
    }
  })();

  const contrastLevelInjection =
    heroContrastLevel === 'High'
      ? 'High-contrast lighting with clear separation between product and background.'
      : 'Low-contrast lighting with smooth tonal transitions and gentle highlights.';

  return [
    backgroundInjection,
    colorInjection,
    gradientStyleInjection,
    paletteSourceInjection,
    negativeSpaceInjection,
    contrastLevelInjection,
  ].filter(Boolean).join(' ');
}
