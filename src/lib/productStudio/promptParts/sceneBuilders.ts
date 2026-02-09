import type { Randomizer } from './randomizationRules';

export type PhotoModeKey =
  | 'HERO_NEUTRAL'
  | 'COLOR_POP_HERO'
  | 'BRAND_CAMPAIGN'
  | 'UGC_PREMIUM_SIM'
  | 'INGREDIENT_STACK'
  | 'INGREDIENT_FLAT_LAY'
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
  heroGradientStyle?: 'Soft' | 'Radial' | 'Vertical';
  heroNegativeSpace?: 'Tight' | 'Balanced' | 'Spacious';
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
    'polished acrylic',
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

export function buildColorPopHeroScene({ randomizer, palette }: SceneBuildInput): string {
  const structures = [
    'color-blocked alcove with layered planes',
    'bold architectural set with intersecting panels',
    'sculptural color field with dimensional depth',
  ];
  const amplifiers = [
    'reflections and gradients amplify the palette',
    'materials carry the palette through soft reflections',
    'color separation comes from layered materials and light',
  ];

  return [
    'Vibrant environment derived from the product color palette.',
    'High contrast but controlled, premium and refined.',
    `Set built as a ${randomizer.pick(structures)} ${paletteDescriptor(palette)}.`,
    randomizer.pick(amplifiers),
    'Background amplifies color through materials, reflections, or gradients.',
    'No flat solid backgrounds.'
  ].join(' ');
}

export function buildBrandCampaignScene({ randomizer }: SceneBuildInput): string {
  const setDesign = [
    'architectural hero set with layered monolithic planes',
    'premium campaign stage with sculptural geometry and deep perspective',
    'high-fashion advertising set with luxury structural forms',
  ];
  const styling = [
    'cinematic but brand-safe polish',
    'clean luxury styling with controlled drama',
    'high-end campaign tone with elevated visual hierarchy',
  ];

  return [
    'Flagship brand campaign environment with premium set design.',
    `Scene built as a ${randomizer.pick(setDesign)}.`,
    `Visual direction: ${randomizer.pick(styling)}.`,
    'The product is the undeniable hero, supported by upscale architecture and disciplined negative space.',
  ].join(' ');
}

export function buildUgcPremiumSimulationScene({ randomizer }: SceneBuildInput): string {
  const imperfections = [
    'micro texture variance on surfaces and subtle real-world wear cues',
    'delicate asymmetry in set alignment and natural lens breathing',
    'controlled non-perfect details while preserving commercial polish',
  ];
  const tone = [
    'premium realism with disciplined cleanliness',
    'credible lived-in precision without casual mess',
    'authentic high-end realism that avoids sterile CGI perfection',
  ];

  return [
    'Premium realism simulation inside a controlled studio environment.',
    `Introduce ${randomizer.pick(imperfections)}.`,
    `Aesthetic target: ${randomizer.pick(tone)}.`,
    'No casual personal context, no amateur framing, no domestic clutter.',
  ].join(' ');
}

export function buildIngredientStackScene({ randomizer, suggestedProps, ingredientLayout }: SceneBuildInput): string {
  const surfaces = ['warm stone surface', 'matte ceramic counter', 'brushed wood slab', 'clean mineral surface'];
  const layoutHint: Record<NonNullable<SceneBuildInput['ingredientLayout']>, string> = {
    auto: 'Ingredients arranged in a controlled, natural layout around the product.',
    grounded: 'Ingredients rest on the same surface with grounded contact shadows.',
    floating: 'Ingredients float at varied depths with realistic motion and depth cues.',
    'top-view': 'Top-down arrangement on a clean surface with organized spacing.'
  };

  return [
    'Realistic ingredients placed manually around the product.',
    'Ingredients interact physically with the surface and product scale.',
    'Editorial wellness composition with precise styling.',
    `Scene staged on a ${randomizer.pick(surfaces)}.`,
    suggestedProps ? `Ingredients: ${suggestedProps}.` : 'Use botanicals, fruits, and formulation ingredients that feel authentic to the product.',
    layoutHint[ingredientLayout ?? 'auto']
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
    IMPACT_SPLASH: 'Hero product impacts liquid with a single dominant upward arc and frozen high-speed droplets.',
    RISING_SPLASH: 'Hero product emerges from liquid with a controlled wrapping splash and campaign-grade asymmetry.',
    SIDE_DISPLACEMENT_SPLASH: 'Hero product displaces liquid laterally with directional force and clean droplet separation.'
  };

  return {
    splashMode,
    scene: [
      'Premium advertising splash setup with physically coherent liquid behavior.',
      modeDescriptions[splashMode],
      'Physics must make sense; no circular decorative splash rings and no chaotic foam clutter.',
      'Label and logo zone remain readable and unobstructed.',
      'Surface and surrounding elements remain premium, minimal, and controlled.'
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
  const props = ['simple glassware', 'clean tray', 'soft paper elements', 'neutral support element'];

  return [
    'Everyday wellness routine scene with natural composition.',
    randomizer.pick(scenes),
    `Supporting props include ${randomizer.pick(props)}.`,
    'Designed for repeatable carousel outputs with consistent spacing.'
  ].join(' ');
}

export function buildPastelPicnicScene({ randomizer }: SceneBuildInput): string {
  const setPieces = ['pastel color panels', 'soft gradient planes', 'muted geometric blocks'];
  const props = ['fresh fruit slices', 'delicate glassware', 'sunlit petals'];

  return [
    'Outdoor pastel environment with clean, brand-safe set styling.',
    `Set includes ${randomizer.pick(setPieces)} and ${randomizer.pick(props)}.`,
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
  backgroundColor,
  gradientEnabled,
  gradientStart,
  gradientEnd,
  gradientMid,
  heroGradientStyle = 'Soft',
  heroNegativeSpace = 'Balanced',
}: SceneBuildInput): string {
  const negativeSpaceLine = (() => {
    switch (heroNegativeSpace) {
      case 'Tight':
        return 'Negative space is tight and controlled; minimal margins with a small copy-safe area.';
      case 'Spacious':
        return 'Negative space is spacious and intentional; large copy-safe area reserved for overlays.';
      case 'Balanced':
      default:
        return 'Negative space is balanced; clear copy-safe area reserved for overlays.';
    }
  })();

  const third = String(gradientMid || '').trim();
  const hasThird = third.length > 0 && third.toUpperCase() !== String(gradientStart || '').trim().toUpperCase() && third.toUpperCase() !== String(gradientEnd || '').trim().toUpperCase();

  if (gradientEnabled && gradientStart && gradientEnd) {
    const gradientLine = (() => {
      if (hasThird) {
        if (heroGradientStyle === 'Radial') {
          return `Radial three-color gradient background transitioning ${gradientStart} → ${third} → ${gradientEnd}.`;
        }
        if (heroGradientStyle === 'Vertical') {
          return `Vertical three-color gradient background transitioning ${gradientStart} → ${third} → ${gradientEnd}.`;
        }
        return `Soft three-color gradient background blending ${gradientStart}, ${third}, and ${gradientEnd}.`;
      }
      if (heroGradientStyle === 'Radial') {
        return `Radial gradient background blending ${gradientStart} and ${gradientEnd}.`;
      }
      if (heroGradientStyle === 'Vertical') {
        return `Vertical gradient background from ${gradientStart} to ${gradientEnd}.`;
      }
      return `Soft gradient background blending ${gradientStart} and ${gradientEnd}.`;
    })();
    return [
      'Clean studio hero composition.',
      gradientLine,
      'No environment, no props, no setting.',
      'Subtle studio gradient only.',
      negativeSpaceLine,
      'Product isolated and positioned for hero landing page.'
    ].join(' ');
  }

  const color = backgroundColor || '#FFFFFF';
  return [
    'Clean studio hero composition.',
    `Seamless solid background in color ${color}.`,
    'No environment, no props, no setting.',
    'Flat studio background with subtle depth only.',
    negativeSpaceLine,
    'Product isolated and positioned for hero landing page.'
  ].join(' ');
}
