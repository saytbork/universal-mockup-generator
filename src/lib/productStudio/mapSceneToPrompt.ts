import type { ProductAsset, ProductStudioState, PhotoMode } from './types';
import { buildBaseContext } from './promptParts/baseContext';
import { buildPhotoModePrompt } from '../promptEngine/photoModeResolver';
import {
  buildAcrylicBlocksScene,
  buildBrandCampaignScene,
  buildCandyGradientLabScene,
  buildClinicalLabCounterScene,
  buildColorPopHeroScene,
  buildFoamAndTextureScene,
  buildGoldenMistAuraScene,
  buildHeroNeutralScene,
  buildIngredientStackScene,
  buildRoutineCarouselScene,
  buildSplashShotScene,
  buildStudioHeroScene,
  buildUgcPremiumSimulationScene,
  type PhotoModeKey,
  type SceneBuildInput,
} from './promptParts/sceneBuilders';
import { buildLighting } from './promptParts/lightingBuilders';
import { buildCamera } from './promptParts/cameraBuilders';
import { buildMaterialsWithProfile } from './promptParts/materialsBuilders';
import { buildRandomizationRules, createRandomizer } from './promptParts/randomizationRules';
import { buildQualityEnforcers } from './promptParts/qualityEnforcers';
import { buildUltraRealStrictBlock } from './promptParts/ultraRealStrict';
import { resolvePlacement } from './placementResolver';
import { resolvePhysicsCoherence } from './physicsCoherenceResolver';

const titleCaseFromKebab = (value: string): string =>
  value
    .split('-')
    .map(part => (part ? part.charAt(0).toUpperCase() + part.slice(1) : part))
    .join(' ')
    .trim();

function buildEnvironmentScene(state: ProductStudioState, randomizer: ReturnType<typeof createRandomizer>): string {
  if (state.blankSpaceEnabled) return '';
  if (state.environmentContext == null) return '';

  const macroRaw = String(state.environmentContext.macro || '').trim();
  const macro = macroRaw.toLowerCase();
  if (!macro || macro === 'studio') return '';

  const microRaw = state.environmentContext.micro == null ? '' : String(state.environmentContext.micro).trim();
  const micro = microRaw.toLowerCase();

  const macroText = (() => {
    if (macro === 'custom') return String(state.customEnvironmentText || '').trim() || 'custom environment';
    if (macro === 'cgmp-facility') {
      return 'cGMP dietary supplement manufacturing facility (clean stainless steel production line, filling and packaging stations, spotless clean-room surfaces)';
    }
    const map: Record<string, string> = {
      'kitchen': 'Kitchen interior setting',
      'living-room': 'Living room interior setting',
      'bedroom': 'Bedroom interior setting',
      'bathroom': 'Bathroom vanity setting',
      'workspace': 'Workspace / home office setting',
      'hallway': 'Hallway interior setting',
      'home-gym': 'Home gym setting',
      'balcony-indoor-terrace': 'Balcony / indoor terrace setting',
      'urban-exterior': 'Urban exterior setting',
      'natural-exterior': 'Natural exterior setting',
      'parking-lot': 'Parking lot setting',
      'backyard-patio': 'Backyard / patio setting',
      'street-corner': 'Street corner setting',
    };
    return map[macro] || `${titleCaseFromKebab(macro)} setting`;
  })();

  const microText = (() => {
    if (!micro) return '';
    if (micro === 'custom') return String(state.customMicroPlaceText || '').trim() || 'custom surface placement';
    const map: Record<string, string> = {
      'countertop': 'countertop',
      'kitchen-island': 'kitchen island surface',
      'sink-ledge': 'sink ledge',
      'dining-table': 'dining table',
      'coffee-table': 'coffee table',
      'side-table': 'side table',
      'shelf': 'shelf surface',
      'nightstand': 'nightstand',
      'dresser-top': 'dresser top',
      'vanity': 'bathroom vanity counter',
      'shower-shelf': 'shower shelf',
      'desk-surface': 'desk surface',
      'keyboard-side': 'desk surface near keyboard',
      'notebook-area': 'desk surface near notebook',
      'console-table': 'console table',
      'bench': 'bench surface',
      'mat-edge': 'gym mat edge',
      'water-bottle-side': 'surface near a water bottle',
      'table': 'table surface',
      'railing-ledge': 'railing ledge',
      'outdoor-table': 'outdoor table surface',
      'chair-armrest': 'chair armrest',
      'concrete-ledge': 'concrete ledge',
      'stairs': 'stair edge',
      'low-wall': 'low wall ledge',
      'sidewalk-edge': 'sidewalk edge',
      'urban-bench': 'urban bench',
      'car-hood': 'car hood',
      'trunk-edge': 'car trunk edge',
      'rock': 'flat rock surface',
      'wooden-surface': 'wooden surface',
      'picnic-table': 'picnic table',
      'conveyor-belt': 'stainless steel conveyor belt',
      'filling-line': 'stainless steel filling line',
      'neutral-surface': 'neutral surface',
    };
    return map[micro] || titleCaseFromKebab(micro);
  })();

  const environmentAccents = {
    kitchen: ['minimal glass accent near the edge of frame', 'soft morning reflections on neutral surfaces', 'subtle countertop texture outside focus plane'],
    bathroom: ['minimal glass accent in background', 'subtle steam haze near tiles', 'clean neutral accent partially visible'],
    workspace: ['minimal notebook corner peeking in', 'soft desk lamp glow from side', 'muted stationery kept out of focus'],
    'cgmp-facility': ['stainless steel highlights and clean machinery surfaces', 'guide rails and clean line geometry', 'industrial clean-room reflections'],
    'urban-exterior': ['soft bokeh of buildings in distance', 'muted street texture far from product', 'subtle daylight reflections on concrete'],
    'natural-exterior': ['soft greenery bokeh in distance', 'natural surface texture outside focus plane', 'diffused sky light'],
  } as const;

  const hasExplicitProps =
    String(state.props || '').trim().length > 0 ||
    (Array.isArray((state as any).selectedProps) && (state as any).selectedProps.length > 0);
  const accentPool =
    (environmentAccents as any)[macro] ||
    ['subtle background context out of focus', 'realistic contact shadows and reflections', 'clean negative space preserved'];
  const blockedAccentTerms =
    state.photoMode !== 'Acrylic Blocks'
      ? ['acrylic', 'riser', 'pedestal']
      : [];
  const filteredAccents = accentPool.filter((item: string) =>
    blockedAccentTerms.every((term) => !item.toLowerCase().includes(term))
  );
  const accent = hasExplicitProps
    ? (filteredAccents[0] || accentPool[0])
    : 'No additional environmental props or decorative accents unless explicitly selected by user.';

  const parts: string[] = [];
  parts.push(`ENVIRONMENT (MANDATORY): macro=${macro}${micro ? `, micro=${micro}` : ''}.`);
  parts.push(`${macroText}.`);
  if (microText) parts.push(`Product placed on a ${microText}.`);
  parts.push(`${accent}.`);

  return parts.join(' ');
}

function sanitizePhotoModeTextForEnvironment(text: string): string {
  if (!text) return '';
  let next = text;

  // Studio-only hard constraints should not leak when a real environment is active.
  next = next.replace(/Strict Constraints:[\s\S]*$/i, '').trim();

  // Remove direct contradictions with environment mode.
  const contradictionPatterns = [
    /no environment[^,.]*[,.]?/gi,
    /no props[^,.]*[,.]?/gi,
    /no setting[^,.]*[,.]?/gi,
    /no interactions[^,.]*[,.]?/gi,
    /abstract studio[^,.]*[,.]?/gi,
    /studio advertising[^,.]*[,.]?/gi,
    /studio composition[^,.]*[,.]?/gi,
  ];
  for (const pattern of contradictionPatterns) {
    next = next.replace(pattern, ' ');
  }

  return next.replace(/\s+/g, ' ').replace(/\s+,/g, ',').trim();
}

function sanitizePhotoModeTextForStudioBranding(text: string): string {
  if (!text) return '';
  let next = text;

  // Avoid over-constraining material vocab that introduces irrelevant objects
  // (e.g. stone/concrete/metal props) in strict studio-branding product shots.
  next = next.replace(/Strict Constraints:[\s\S]*$/i, '').trim();

  const removePatterns = [
    /Rigid materials only:[^,.]*[,.]?/gi,
    /Secondary props:[^,.]*[,.]?/gi,
    /No environment props[^,.]*[,.]?/gi,
  ];
  for (const pattern of removePatterns) {
    next = next.replace(pattern, ' ');
  }

  return next.replace(/\s+/g, ' ').replace(/\s+,/g, ',').trim();
}

function sanitizeDynamicSettingText(raw: string): string {
  return String(raw || '')
    .replace(/\bcreator\b/gi, 'premium')
    .replace(/\bugc\b/gi, 'premium')
    .replace(/\bidentity\b/gi, 'style')
    .replace(/\binfluencer\b/gi, 'premium')
    .replace(/\blifestyle\b/gi, 'environment')
    .replace(/\bphone\b/gi, 'camera')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizePromptText(prompt: string): string {
  return String(prompt || '')
    .replace(/,\s*\./g, '.')
    .replace(/\.\s*,/g, '. ')
    .replace(/,\s*,/g, ', ')
    .replace(/\s+/g, ' ')
    .replace(/\s+,/g, ',')
    .trim();
}

type VisualIntentResolved = 'conversion' | 'campaign';
type EnergyLevelResolved = 'low' | 'medium' | 'high';

function resolveVisualIntent(state: ProductStudioState): VisualIntentResolved {
  const raw = String((state as any).visualIntent || 'conversion').trim().toLowerCase();
  return raw === 'campaign' ? 'campaign' : 'conversion';
}

function resolveEnergyLevel(state: ProductStudioState): EnergyLevelResolved {
  const raw = String((state as any).energyLevel || 'low').trim().toLowerCase();
  if (raw === 'high') return 'high';
  if (raw === 'medium') return 'medium';
  return 'low';
}

function sanitizeCampaignConstraintText(text: string): string {
  if (!text) return '';
  // In campaign mode, strip whole strict-tail sections inherited from conversion templates.
  let next = text.replace(/Strict Constraints:[\s\S]*$/i, '').trim();
  const patterns = [
    /No chaotic crossing splash arcs[,.]?/gi,
    /Keep foam minimal and controlled[^,.]*[,.]?/gi,
    /Clinical softbox lighting[,.]?/gi,
    /Centered hero composition[,.]?/gi,
    /Creativity level:\s*Low[,.]?/gi,
    /Subtle variation only;?[^.]*\./gi,
    /conversion-first[^.]*\./gi,
    /ecommerce[^.]*\./gi,
    /commercial campaign \+ ecommerce hero asset[^.]*\./gi,
  ];
  for (const pattern of patterns) {
    next = next.replace(pattern, ' ');
  }
  return next.replace(/\s+/g, ' ').replace(/\s+,/g, ',').trim();
}

export type ScenePromptResult = {
  prompt: string;
  mode: PhotoModeKey;
  splashMode?: string;
  randomSeed: string;
};

const PHOTO_MODE_MAP: Record<string, PhotoModeKey> = {
  'Hero Landing Page': 'HERO_NEUTRAL',
  'Color Pop Hero': 'COLOR_POP_HERO',
  'Ingredient Stack': 'INGREDIENT_STACK',
  'Ingredient Flat Lay': 'INGREDIENT_FLAT_LAY',
  'Acrylic Blocks': 'ACRYLIC_BLOCKS',
  'Splash Shot': 'SPLASH_SHOT',
  'Foam & Texture': 'FOAM_AND_TEXTURE',
  'Routine Carousel': 'ROUTINE_CAROUSEL',
  'Clinical Lab Counter': 'CLINICAL_LAB_COUNTER',
  'Golden Mist Aura': 'GOLDEN_MIST_AURA',
  'Candy Gradient Lab': 'CANDY_GRADIENT_LAB',
  'Glass Pedestal Studio': 'HERO_NEUTRAL',
  'Minimal Bathroom Vanity': 'HERO_NEUTRAL',
  'Dark Premium Studio': 'HERO_NEUTRAL',
  'Monochrome Brand': 'COLOR_POP_HERO',
  'Brand Campaign': 'BRAND_CAMPAIGN',
  'Creator Premium Simulation': 'UGC_PREMIUM_SIM',
  'UGC Premium Simulation': 'UGC_PREMIUM_SIM',
  'Tech Clean Studio': 'HERO_NEUTRAL',
  'Luxury Editorial Tabletop': 'HERO_NEUTRAL',
  'Soft Wellness Morning': 'HERO_NEUTRAL',
  'Golden Hour Lifestyle': 'HERO_NEUTRAL',
  'Outdoor Energy Boost': 'HERO_NEUTRAL',
  'Pastel Picnic': 'HERO_NEUTRAL',
  'Sunlit Stone Editorial': 'HERO_NEUTRAL',
  'Golden Sunset Backlit': 'BRAND_CAMPAIGN',
  'Bathroom Daylight Clean': 'HERO_NEUTRAL',
  'Sky Float Minimal': 'HERO_NEUTRAL',
  'Wet Rock Ripples': 'SPLASH_SHOT',
  'Hands Application Clean': 'UGC_PREMIUM_SIM',
  'Underwater Split': 'SPLASH_SHOT',
  'Sand Palm Shadows': 'HERO_NEUTRAL',
  'Botanical Water Garden': 'SPLASH_SHOT',
  'Macro Dew Label': 'FOAM_AND_TEXTURE',
  'Warm Window Wood': 'HERO_NEUTRAL',
  'Gel Smear Editorial': 'FOAM_AND_TEXTURE',
  'Citrus Fresh Flat Lay': 'INGREDIENT_FLAT_LAY',
  'Stones & Crystals Flat Lay': 'INGREDIENT_FLAT_LAY',
  'Dried Citrus Earth': 'INGREDIENT_FLAT_LAY',
  'Beach Foam Splash': 'SPLASH_SHOT',
  'Pool Water': 'HERO_NEUTRAL',
  'Cheers (Hands Clink)': 'UGC_PREMIUM_SIM',
  'Ice Cubes': 'HERO_NEUTRAL',
  'Condensation Droplets': 'HERO_NEUTRAL',
  'Fruit Garnish / Citrus Accents': 'HERO_NEUTRAL',
  'Textured Bed / Scatter Base': 'HERO_NEUTRAL',
  'Floating Particles': 'HERO_NEUTRAL',
};

const SECONDARY_PROPS_BY_MODE: Partial<Record<PhotoModeKey, string[]>> = {
  HERO_NEUTRAL: ['minimal glass accent', 'clean neutral block', 'subtle matte support element'],
  COLOR_POP_HERO: ['geometric color blocks', 'abstract color panel', 'clean reflective panel'],
  BRAND_CAMPAIGN: ['luxury monolithic block', 'high-end reflective accent', 'architectural neutral plinth'],
  UGC_PREMIUM_SIM: ['subtle realistic texture cue', 'controlled asymmetrical accent', 'minimal tactile realism prop'],
  INGREDIENT_STACK: [],
  INGREDIENT_FLAT_LAY: [],
  ACRYLIC_BLOCKS: ['additional acrylic risers', 'prismatic edge accents'],
  SPLASH_SHOT: ['single directional splash arc', 'clean high-speed droplets around the hero', 'subtle reflective waterline at base'],
  FOAM_AND_TEXTURE: ['controlled foam clusters', 'gel ribbons', 'micro-bubbles'],
  ROUTINE_CAROUSEL: ['simple glassware', 'clean tray', 'soft paper elements'],
  CLINICAL_LAB_COUNTER: ['clean glassware silhouettes', 'stainless tools', 'measured droppers'],
  GOLDEN_MIST_AURA: ['soft golden haze', 'delicate reflective accents'],
  CANDY_GRADIENT_LAB: ['transparent lab forms', 'gradient panels', 'polished geometric props'],
};

function normalizePhotoMode(photoMode: string | null | undefined): PhotoModeKey {
  const key = String(photoMode || '').trim();
  return PHOTO_MODE_MAP[key] ?? 'HERO_NEUTRAL';
}

function parsePropsInput(input: string | undefined | null): {
  freeText: string;
  effects: string[];
  fruit: string;
  bed: string;
} {
  const parts = String(input ?? '')
    .split('|')
    .map((p) => p.trim())
    .filter(Boolean);

  const freeTextParts: string[] = [];
  let effects: string[] = [];
  let fruit = '';
  let bed = '';

  for (const part of parts) {
    const lower = part.toLowerCase();
    if (lower.startsWith('effects:')) {
      const raw = part.slice('effects:'.length).trim();
      const parsed = raw
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      effects = parsed;
      continue;
    }
    if (lower.startsWith('fruit:')) {
      fruit = part.slice('fruit:'.length).trim();
      continue;
    }
    if (lower.startsWith('bed:')) {
      bed = part.slice('bed:'.length).trim();
      continue;
    }
    freeTextParts.push(part);
  }

  return { freeText: freeTextParts.join(' | '), effects, fruit, bed };
}

function buildEffectsDirective(effects: string[], randomizer: ReturnType<typeof createRandomizer>, extras: { fruit: string; bed: string }): string {
  if (!effects || effects.length === 0) return '';

  const effectTextFor = (label: string): string => {
    const key = String(label || '').trim().toLowerCase();
    if (!key) return '';

    if (key === 'splash shot') {
      const classic = randomizer.pick([
        'classic ad splash with one clean directional sheet and crisp droplet scatter around the product',
        'diagonal splash sheet mostly behind the product with frozen droplets and clear label visibility',
        'base-impact splash wrapping around the lower body of the product with coherent droplet separation',
      ]);
      return [
        `SPLASH (CLASSIC): ${classic}.`,
        'High-speed flash look: frozen motion, razor-sharp droplets, physically coherent refraction.',
        'Keep label/logo zone readable: do not cover the typography with water or foam.',
        'No CGI splash rings, no chaotic foam clutter, no melted-looking liquid blobs.',
        'No random jet streams crossing the frame; one dominant splash direction only.',
      ].join(' ');
    }

    if (key === 'beach foam splash') {
      return [
        'BEACH FOAM: controlled sea-foam interaction near the base on wet sand with thin retreating foam contours.',
        'Keep it premium and minimal; do not bury the product in foam.',
        'No tall water plumes, no chaotic jet streams, no label-crossing splash arcs.',
      ].join(' ');
    }

    if (key === 'pool water') {
      return [
        'POOL WATER: clear turquoise water context with ripples and subtle caustic highlights.',
        'Add a few suspended droplets; keep product sharp and readable.',
      ].join(' ');
    }

    if (key === 'cheers (hands clink)') {
      return [
        'CHEERS: two hands clinking the product (hands only, no faces), flash-frozen droplets and natural grip/contact.',
        'No identity details; focus stays on product branding and label truth.',
      ].join(' ');
    }

    if (key === 'ice cubes') {
      return [
        'ICE: realistic ice cubes with wet reflections, meltwater droplets, and physically plausible translucency.',
        'Avoid fake glassy cubes or plastic-looking ice.',
      ].join(' ');
    }

    if (key === 'condensation droplets') {
      return [
        'CONDENSATION: micro-droplets and streaks on the container and nearby surface, with realistic specular highlights.',
        'Do not distort or blur label typography.',
      ].join(' ');
    }

    if (key === 'fruit garnish / citrus accents') {
      const detail = String(extras.fruit || '').trim();
      return detail
        ? `GARNISH: ${detail}. Keep garnish secondary and physically plausible (fresh cut, natural moisture, correct scale).`
        : 'GARNISH: citrus or fruit accents as secondary styling (slices, peels, wedges), premium and minimal.';
    }

    if (key === 'textured bed / scatter base') {
      const detail = String(extras.bed || '').trim();
      return detail
        ? `SCATTER BED: ${detail}. Keep it controlled, premium, and not overpowering the product.`
        : 'SCATTER BED: a controlled textured bed/scatter around the base (e.g., ice + droplets, beans, sand/shells, stones), not overpowering the product.';
    }

    if (key === 'floating particles') {
      return 'FLOATING PARTICLES: subtle suspended particles/bokeh sparkle (mist, spray micro-droplets, dust motes), premium and controlled.';
    }

    if (key === 'acrylic blocks') {
      return 'ACRYLIC: add minimal acrylic risers/pedestals with crisp refraction, clean edges, and premium reflections.';
    }

    if (key === 'gel smear') {
      return 'GEL SMEAR: editorial glossy gel smear as a controlled styling accent on the surface/background; product remains clean and readable.';
    }

    if (key === 'foam texture' || key === 'foam & texture') {
      return 'FOAM TEXTURE: controlled foam/bubble texture accents; keep it minimal and physically coherent, never obscuring label.';
    }

    return `EFFECT: ${label}.`;
  };

  const lines = effects.map(effectTextFor).filter(Boolean);
  if (lines.length === 0) return '';
  return `SPECIAL EFFECTS: ${lines.join(' ')}`;
}

function buildSecondaryProps(mode: PhotoModeKey, randomizer: ReturnType<typeof createRandomizer>, suggestedProps?: string): string {
  if (suggestedProps && suggestedProps.trim().length > 0) {
    const parsed = parsePropsInput(suggestedProps);
    const effectsDirective = buildEffectsDirective(parsed.effects, randomizer, { fruit: parsed.fruit, bed: parsed.bed });
    const parts = [
      parsed.freeText ? `Secondary props: ${parsed.freeText}.` : '',
      effectsDirective,
    ].filter(Boolean);
    return parts.join(' ');
  }
  const options = SECONDARY_PROPS_BY_MODE[mode];
  if (!options || options.length === 0) return '';
  const picks = randomizer.pickMany(options, Math.min(2, options.length));
  return `Secondary props: ${picks.join(', ')}.`;
}

function extractModeSpecificDynamicSettings(state: ProductStudioState): Record<string, string> | undefined {
  const mode = state.photoMode as PhotoMode;
  const cfg = state.photoModeConfig;
  const dynamic: Record<string, string> = {};

  const add = (key: string, value: unknown) => {
    const v = sanitizeDynamicSettingText(String(value ?? '').trim());
    if (!v) return;
    dynamic[key] = v;
  };

  if (!cfg) return undefined;

  switch (mode) {
    case 'Hero Landing Page':
      add('backgroundType', cfg.heroLandingPage.backgroundType);
      add('gradientStyle', cfg.heroLandingPage.gradientStyle);
      add('colorSource', cfg.heroLandingPage.colorSource);
      add('paletteSource', cfg.heroLandingPage.paletteSource);
      add('negativeSpace', cfg.heroLandingPage.negativeSpace);
      add('contrastLevel', cfg.heroLandingPage.contrastLevel);
      break;
    case 'Color Pop Hero':
      add('backgroundType', cfg.colorPopHero.backgroundType);
      add('gradientStyle', cfg.colorPopHero.gradientStyle);
      add('colorSource', cfg.colorPopHero.colorSource);
      add('saturationLevel', cfg.colorPopHero.saturationLevel);
      add('contrastStrategy', cfg.colorPopHero.contrastStrategy);
      add('negativeSpace', cfg.colorPopHero.negativeSpace);
      break;
    case 'Ingredient Stack':
      add('ingredientFocus', cfg.ingredientStack.ingredientFocus);
      add('stackStyle', cfg.ingredientStack.stackStyle);
      add('ingredientPresence', cfg.ingredientStack.ingredientPresence);
      add('labelPriority', cfg.ingredientStack.labelPriority);
      if (cfg.ingredientStack.backgroundEnabled) {
        add('backgroundType', cfg.ingredientStack.backgroundType);
        add('gradientStyle', cfg.ingredientStack.gradientStyle);
        add('colorSource', cfg.ingredientStack.colorSource);
      }
      break;
    case 'Acrylic Blocks':
      add('blockShape', cfg.acrylicBlocks.blockShape);
      add('materialFinish', cfg.acrylicBlocks.materialFinish);
      add('reflectionLevel', cfg.acrylicBlocks.reflectionLevel);
      add('elevation', cfg.acrylicBlocks.elevation);
      break;
    case 'Splash Shot':
      add('splashMedium', cfg.splashShot.splashMedium);
      add('motionIntensity', cfg.splashShot.motionIntensity);
      add('freezeMoment', cfg.splashShot.freezeMoment);
      add('productStability', cfg.splashShot.productStability);
      break;
    case 'Foam & Texture':
      add('textureType', cfg.foamAndTexture.textureType);
      add('textureDensity', cfg.foamAndTexture.textureDensity);
      add('focusDistance', cfg.foamAndTexture.focusDistance);
      add('cleanliness', cfg.foamAndTexture.cleanliness);
      break;
    case 'Routine Carousel':
      add('frameCount', cfg.routineCarousel.frameCount);
      add('routineFlow', cfg.routineCarousel.routineFlow);
      add('consistency', cfg.routineCarousel.consistency);
      add('heroFrame', cfg.routineCarousel.heroFrame);
      break;
    case 'Clinical Lab Counter':
      add('clinicalTone', cfg.clinicalLabCounter.clinicalTone);
      add('labElements', cfg.clinicalLabCounter.labElements);
      add('surfaceType', cfg.clinicalLabCounter.surfaceType);
      add('trustLevel', cfg.clinicalLabCounter.trustLevel);
      break;
    case 'Golden Mist Aura':
      add('glowStrength', cfg.goldenMistAura.glowStrength);
      add('mistStyle', cfg.goldenMistAura.mistStyle);
      add('mood', cfg.goldenMistAura.mood);
      add('contrast', cfg.goldenMistAura.contrast);
      break;
    case 'Candy Gradient Lab':
      add('gradientStyle', cfg.candyGradientLab.gradientStyle);
      add('colorCount', cfg.candyGradientLab.colorCount);
      add('edgeStyle', cfg.candyGradientLab.edgeStyle);
      add('playfulness', cfg.candyGradientLab.playfulness);
      break;
    default:
      break;
  }

  return Object.keys(dynamic).length > 0 ? dynamic : undefined;
}

export function mapSceneToPrompt(state: ProductStudioState, product?: ProductAsset | null): ScenePromptResult {
  const randomizer = createRandomizer();
  const visualIntent = resolveVisualIntent(state);
  const energyLevel = resolveEnergyLevel(state);
  const isCampaignIntent = visualIntent === 'campaign';
  const controlTier = String((state as any).controlTier || '').trim().toLowerCase() === 'pro' ? 'pro' : 'basic';
  const isProTier = controlTier === 'pro';
  const isBasicTier = !isProTier;
  const isProModeActive = isProTier;
  const isConversionSquareOptimized = !isCampaignIntent && String(state.aspectRatio || '').trim() === '1:1';
  console.log('VISUAL_INTENT_ACTIVE =', visualIntent);
  console.log('CONTROL_TIER_ACTIVE =', controlTier);
  console.log('ADVANCED_CONTROLS_ACTIVE =', isProModeActive);
  console.log('CONVERSION_SQUARE_OPTIMIZED =', isConversionSquareOptimized);
  const beachFoamProfile =
    state.photoMode === 'Beach Foam Splash'
      ? (isCampaignIntent ? 'BeachFoam_Campaign' : 'BeachFoam_Conversion')
      : null;

  const getSafePhotoModeLabel = (raw: string): string => {
    return String(raw || '')
      .replace(/\bcreator\b/gi, 'premium')
      .replace(/\bugc\b/gi, 'premium')
      .replace(/\blifestyle\b/gi, 'environment')
      .replace(/\bphone\b/gi, 'camera')
      .replace(/\bpremium\s+premium\b/gi, 'premium')
      .trim();
  };

  const uiSystemLabel =
    String((state as any).cameraUiSystemLabel || '').trim() ||
    (state.cameraSystem === 'mirrorless' ? 'Mirrorless' : 'DSLR / mirrorless');
  const uiAngleLabel =
    String((state as any).cameraUiAngleLabel || '').trim() ||
    (state.angle === 'top' ? 'Top-down flat lay' : state.angle === 'detail' ? 'Detail close-up' : state.angle === 'front' ? 'Eye level product' : '45° hero');
  const uiDistanceLabel =
    String((state as any).cameraUiDistanceLabel || '').trim() ||
    (state.distance === 'macro' ? 'Macro' : state.distance === 'close' ? 'Tight' : 'Standard');
  const uiRotationLabel =
    String((state as any).cameraUiRotationLabel || '').trim() ||
    (state.rotation === 'slight' ? '5°' : '0°');
  const uiFramingLabel =
    String((state as any).cameraUiFramingLabel || '').trim() ||
    (state.framing === 'rule-of-thirds' ? 'Rule of thirds' : 'Centered hero');

  const mapCameraSystemToPrompt = (system: ProductStudioState['cameraSystem'], systemLabel: string): string => {
    const normalized = systemLabel.toLowerCase();
    if (normalized.includes('macro lens')) return 'professional macro lens camera setup';
    if (normalized.includes('telephoto')) return 'professional telephoto compression camera setup';
    if (system === 'mirrorless') return 'professional mirrorless camera';
    return 'professional DSLR / mirrorless camera';
  };

  const mapAngleToPrompt = (angle: ProductStudioState['angle'], angleLabel: string): string => {
    const byLabel: Record<string, string> = {
      'Eye level product': 'eye-level product view',
      '45° hero': '45-degree hero angle',
      'Top-down flat lay': 'top-down flat lay',
      'Low angle power': 'low angle hero view',
      'High angle overview': 'high angle overview',
      'Detail close-up': 'detail close-up',
    };
    if (byLabel[angleLabel]) return byLabel[angleLabel];
    const byState: Record<ProductStudioState['angle'], string> = {
      front: 'eye-level product view',
      '45': '45-degree hero angle',
      top: 'top-down flat lay',
      detail: 'detail close-up',
    };
    return byState[angle] || '45-degree hero angle';
  };

  const mapDistanceToPrompt = (distance: ProductStudioState['distance'], distanceLabel: string): string => {
    const byLabel: Record<string, string> = {
      Wide: 'wide framing',
      Standard: 'standard framing',
      Tight: 'tight hero crop',
      Macro: 'macro close-up',
    };
    if (byLabel[distanceLabel]) return byLabel[distanceLabel];
    const byState: Record<ProductStudioState['distance'], string> = {
      macro: 'macro close-up',
      close: 'tight hero crop',
      medium: 'standard framing',
    };
    return byState[distance] || 'standard framing';
  };

  const mapFramingToPrompt = (framing: ProductStudioState['framing'], framingLabel: string): string => {
    const byLabel: Record<string, string> = {
      'Centered hero': 'centered hero composition',
      'Rule of thirds': 'rule-of-thirds composition',
      'Left aligned + negative space': 'left-aligned composition with negative space',
      'Right aligned + negative space': 'right-aligned composition with negative space',
      'Grid-ready': 'grid-ready composition',
    };
    if (byLabel[framingLabel]) return byLabel[framingLabel];
    const byState: Record<ProductStudioState['framing'], string> = {
      centered: 'centered hero composition',
      'rule-of-thirds': 'rule-of-thirds composition',
    };
    return byState[framing] || 'centered hero composition';
  };

  const mapRotationToPrompt = (rotation: ProductStudioState['rotation'], rotationLabel: string): string => {
    if (rotationLabel) return rotationLabel.replace(/\s+/g, '').endsWith('°') ? rotationLabel : `${rotationLabel}°`;
    if (rotation === 'slight') return '5°';
    return '0°';
  };

  // CRITICAL: Hero Landing Page gets exclusive sceneType routing in pure studio only.
  const isHeroLandingPage = state.photoMode === 'Hero Landing Page';

  const studioLikeScene = state.sceneType === 'studio-branding' || state.sceneType === 'ecommerce-pdp';

  const environmentModeActive =
    studioLikeScene === false &&
    state.blankSpaceEnabled === false &&
    state.environmentContext != null &&
    String(state.environmentContext.macro || '').trim() !== '' &&
    String(state.environmentContext.macro || '').trim().toLowerCase() !== 'studio';
  const heroStudioLocked = isHeroLandingPage && !environmentModeActive && !isCampaignIntent;
  const strictStudioBranding = state.sceneType === 'studio-branding' && !environmentModeActive;

  // Keep the selected Photo Mode active even when Environment is enabled.
  // Environment should drive the scene context, not erase mode-specific camera/lighting/material logic.
  const mode = normalizePhotoMode(state.photoMode);

  const palette = product?.palette
    ? {
      dominant: product.palette.dominant,
      secondary: product.palette.secondary,
      accent: product.palette.accent,
    }
    : undefined;

  const ingredientStackBgOptions = (() => {
    if (state.photoMode !== 'Ingredient Stack' && state.photoMode !== 'Ingredient Flat Lay') return null;
    const cfg = state.photoModeConfig?.ingredientStack as any;
    if (!cfg?.backgroundEnabled) return null;

    const backgroundType: 'solid' | 'gradient' = cfg.backgroundType === 'Gradient' ? 'gradient' : 'solid';
    const gradientStyle = cfg.gradientStyle as 'Soft' | 'Radial' | 'Vertical' | undefined;

    const paletteColors =
      cfg.colorSource === 'Brand Colors'
        ? backgroundType === 'solid'
          ? { primary: palette?.dominant }
          : { primary: palette?.dominant, secondary: palette?.secondary || palette?.accent || palette?.dominant }
        : backgroundType === 'solid'
          ? { primary: state.backgroundColor || '#FFFFFF' }
          : {
              primary: state.gradientStart || state.backgroundColor || '#FFFFFF',
              secondary: state.gradientEnd || state.gradientStart || state.backgroundColor || '#FFFFFF',
            };

    if (!paletteColors.primary) return null;
    if (backgroundType === 'gradient' && !paletteColors.secondary) return null;

    return { backgroundEnabled: true, backgroundType, paletteColors, gradientStyle };
  })();

  const dynamicSettings = (() => {
    const modeSpecific = extractModeSpecificDynamicSettings(state) || {};
    const uiDynamicRaw = state.photoModeConfig.dynamic?.[state.photoMode as PhotoMode] || {};
    const uiDynamic = { ...uiDynamicRaw } as Record<string, string>;
    Object.keys(uiDynamic).forEach((key) => {
      const safeKey = sanitizeDynamicSettingText(key);
      const safeValue = sanitizeDynamicSettingText(uiDynamic[key]);
      delete uiDynamic[key];
      if (!safeKey || !safeValue) return;
      uiDynamic[safeKey] = safeValue;
    });
    // Custom ingredients are injected via suggestedProps to avoid generic key/value phrasing.
    if ('customIngredients' in uiDynamic) {
      delete (uiDynamic as any).customIngredients;
    }
    if (state.photoMode === 'Ingredient Stack' && 'layoutStyle' in uiDynamic) {
      // Legacy duplicate: "Layout Style" must not coexist with the "Stack Style" control.
      delete (uiDynamic as any).layoutStyle;
    }
    const merged = {
      ...modeSpecific,
      ...uiDynamic,
    };
    if (beachFoamProfile === 'BeachFoam_Conversion') {
      merged.shoreline = merged.shoreline || 'Backwash';
      merged.spray = merged.spray || 'Low';
    }
    if (beachFoamProfile === 'BeachFoam_Campaign') {
      merged.shoreline = merged.shoreline || 'Wave break';
      merged.spray = merged.spray || (energyLevel === 'high' ? 'High' : 'Medium');
      merged.sand = merged.sand || 'Wet';
      merged.wave_profile = 'dynamic wave break';
    }
    if (isCampaignIntent) {
      merged.environment_variation = 'natural environmental variation permitted';
      merged.energy_level = energyLevel;
    }
    return Object.keys(merged).length > 0 ? merged : undefined;
  })();

  const customIngredientsText = sanitizeDynamicSettingText(
    String(state.photoModeConfig.dynamic?.[state.photoMode as PhotoMode]?.customIngredients || '')
  );
  const supportsCustomIngredientsMode =
    state.photoMode === 'Ingredient Stack' ||
    state.photoMode === 'Ingredient Flat Lay' ||
    state.photoMode === 'Citrus Fresh Flat Lay' ||
    state.photoMode === 'Stones & Crystals Flat Lay' ||
    state.photoMode === 'Dried Citrus Earth' ||
    state.photoMode === 'Beach Foam Splash' ||
    state.photoMode === 'Pool Water' ||
    state.photoMode === 'Ice Cubes' ||
    state.photoMode === 'Condensation Droplets' ||
    state.photoMode === 'Fruit Garnish / Citrus Accents' ||
    state.photoMode === 'Textured Bed / Scatter Base';
  const effectiveSuggestedProps =
    supportsCustomIngredientsMode && customIngredientsText
      ? [state.props, customIngredientsText].filter(Boolean).join(' | ')
      : state.props;
  const placementPhotoType = environmentModeActive ? 'environment' : 'photo-studio';
  const initialPlacementResolution = resolvePlacement(
    placementPhotoType,
    String(state.photoMode || ''),
    state.placement || 'surface'
  );
  if (initialPlacementResolution.corrected) {
    console.log('[PLACEMENT] AUTO_CORRECTED =', `${initialPlacementResolution.requestedPlacement} -> ${initialPlacementResolution.resolvedPlacement}`);
  }
  const physicsResolution = resolvePhysicsCoherence({
    ...state,
    placement: initialPlacementResolution.resolvedPlacement,
  });
  if (physicsResolution.corrected) {
    console.log('[PHYSICS] AUTO_CORRECTED', physicsResolution.reason);
  }
  const resolvedPlacementForPrompt = physicsResolution.correctedPlacement || initialPlacementResolution.resolvedPlacement;
  const placementResolution = resolvePlacement(
    placementPhotoType,
    String(state.photoMode || ''),
    resolvedPlacementForPrompt
  );

  const isWaterStabilityMode =
    state.photoMode === 'Beach Foam Splash' || state.photoMode === 'Pool Water';
  const resolvedProductState =
    isCampaignIntent
      ? 'Static'
      : isWaterStabilityMode &&
    (state.stateMotion === 'dispensed' || state.stateMotion === 'pouring' || state.stateMotion === 'falling' || state.stateMotion === 'spilled')
      ? 'Static'
      : state.stateMotion === 'opened'
        ? 'Opened'
        : state.stateMotion === 'dispensed'
          ? 'Dispensing'
          : state.stateMotion === 'pouring' || state.stateMotion === 'falling' || state.stateMotion === 'spilled'
            ? 'Pouring'
            : 'Static';

  const isBundleMacroGuardActive = Boolean(state.bundle?.enabled);
  const effectivePhotoModeForPrompt: PhotoMode =
    isBundleMacroGuardActive && state.photoMode === 'Macro Dew Label'
      ? ('Brand Campaign' as PhotoMode)
      : (state.photoMode as PhotoMode);

  const photoModeResult = buildPhotoModePrompt(effectivePhotoModeForPrompt, {
    suggestedProps: effectiveSuggestedProps,
    ingredientLayout: state.ingredientLayout,
    dynamicSettings,
    productType: state.definition.type as any,
    productState: resolvedProductState as any,
    ...(ingredientStackBgOptions ?? {}),
  });

  const sceneInput: SceneBuildInput = {
    randomizer,
    palette,
    suggestedProps: effectiveSuggestedProps,
    ingredientLayout: state.ingredientLayout,
    backgroundColor: state.backgroundColor,
    gradientEnabled: state.gradientEnabled,
    gradientStart: state.gradientStart,
    gradientEnd: state.gradientEnd,
    gradientMid: state.gradientMid,
    heroGradientStyle: state.photoModeConfig.heroLandingPage.gradientStyle,
    heroNegativeSpace: state.photoModeConfig.heroLandingPage.negativeSpace,
  };

  let scene = '';
  let splashMode: string | undefined;

  // Hero Landing Page (locked): deterministic studio hero module.
  // No random camera/lighting/materials. No props. No environment. No creative randomization rules.
  if (heroStudioLocked) {
    scene = buildStudioHeroScene(sceneInput);
    const profileLine =
      state.qualityProfile === 'ecommerce-conversion'
        ? 'OUTPUT PROFILE: Ecommerce Conversion. Prioritize label readability and clean conversion-focused hierarchy.'
        : state.qualityProfile === 'editorial'
          ? 'OUTPUT PROFILE: Editorial. Preserve premium storytelling while keeping product truth and clarity.'
          : 'OUTPUT PROFILE: Luxury Brand. Preserve campaign-grade polish and premium material rendering.';
    const parts = [
      'HERO LANDING PAGE (LOCKED): Brand-first studio advertising hero module.',
      'Background is derived from the product brand colors with zero creative randomness.',
      'No environment. No props. No interactions. No bundles.',
      profileLine,
      scene,
      photoModeResult.modifiers,
      'Controlled studio lighting with clean shadows and high clarity.',
      'Label remains fully readable and centered toward the camera.',
      'No texture noise, no patterns, no scenery, no staging objects.',
    ].filter(Boolean);

    return {
      prompt: normalizePromptText(parts.join(' ')),
      mode: 'HERO_NEUTRAL',
      splashMode: undefined,
      randomSeed: 'hero-locked',
    };
  }

  // CRITICAL: Hero Landing Page uses exclusive studio-hero scene builder
  if (environmentModeActive) {
    scene = buildEnvironmentScene(state, randomizer);
  } else if (photoModeResult.isValid && photoModeResult.basePrompt) {
    scene = photoModeResult.basePrompt;
  } else {
    switch (mode) {
      case 'HERO_NEUTRAL':
        scene = buildHeroNeutralScene(sceneInput);
        break;
      case 'COLOR_POP_HERO':
        scene = buildColorPopHeroScene(sceneInput);
        break;
      case 'BRAND_CAMPAIGN':
        scene = buildBrandCampaignScene(sceneInput);
        break;
      case 'UGC_PREMIUM_SIM':
        scene = buildUgcPremiumSimulationScene(sceneInput);
        break;
      case 'INGREDIENT_STACK':
        scene = buildIngredientStackScene(sceneInput);
        break;
      case 'INGREDIENT_FLAT_LAY':
        scene = buildIngredientStackScene({ ...sceneInput, ingredientLayout: 'top-view' });
        break;
      case 'ACRYLIC_BLOCKS':
        scene = buildAcrylicBlocksScene(sceneInput);
        break;
      case 'SPLASH_SHOT': {
        const splash = buildSplashShotScene(sceneInput);
        scene = splash.scene;
        splashMode = splash.splashMode;
        break;
      }
      case 'FOAM_AND_TEXTURE':
        scene = buildFoamAndTextureScene(sceneInput);
        break;
      case 'ROUTINE_CAROUSEL':
        scene = buildRoutineCarouselScene(sceneInput);
        break;
      case 'CLINICAL_LAB_COUNTER':
        scene = buildClinicalLabCounterScene(sceneInput);
        break;
      case 'GOLDEN_MIST_AURA':
        scene = buildGoldenMistAuraScene(sceneInput);
        break;
      case 'CANDY_GRADIENT_LAB':
        scene = buildCandyGradientLabScene(sceneInput);
        break;
      default:
        scene = buildHeroNeutralScene(sceneInput);
    }
  }

  if (isCampaignIntent) {
    scene = scene
      .replace(/restrained directional backwash/gi, 'organic, directional, environment-driven backwash')
      .replace(/shallow sea foam and clean micro-droplets only near the base/gi, 'wind-influenced foam and directional spray with irregular shoreline behavior')
      .replace(/one dominant splash sheet wrapping behind\/around the product/gi, 'directional splash sheets with crossing arcs driven by environmental flow');
  }

  const lightingStyleOverrideText = (() => {
    if (isCampaignIntent) {
      return [
        'Natural directional sunlight with environmental bounce and specular rim highlights.',
        'Allow environmental contrast shaping and natural atmosphere depth layering.',
      ].join(' ');
    }
    // Conversion strict fallback
    return 'Clinical softbox lighting with clean reflections and neutral color.';
  })();

  const userLightingStyleText = (() => {
    const lighting = String((state as any).lighting || '').trim();
    if (!lighting) return '';
    const map: Record<string, string> = {
      'natural-light': 'Natural light with soft diffusion and realistic shadow falloff.',
      'sunny-day': 'Bright natural daylight with defined but not harsh shadows.',
      'golden-hour': 'Golden hour light with warm tones and long, soft shadows.',
      'overcast': 'Overcast daylight with very soft shadows and low contrast.',
      'cozy-indoors': 'Warm indoor ambient light with mixed household sources and gentle shadows.',
      'ring-light': 'Ring light style illumination with even frontal fill; keep product reflections controlled and premium.',
      'mood-lighting': 'Moody low-key lighting with selective highlights; label remains fully readable.',
      'night-mode': 'Nighttime interior lighting with practical sources; controlled highlights and deep shadows.',
      'flash-photo': 'Direct on-camera flash look with crisp shadows; avoid blown highlights on label.',
      'clinical-softbox': 'Clinical softbox lighting with clean reflections and neutral color.',
    };
    return map[lighting] || '';
  })();

  const lightingRigOverrideText = (() => {
    if (isCampaignIntent) return '';
    const rig = String((state as any).lightingRig || '').trim();
    if (!rig) return '';
    const rigCues: Record<string, string> = {
      'Prism Spotlight Duo':
        'Two controlled prism spot sources with crisp directional falloff, visible split highlights on glass edges, and subtle refraction caustics near transparent boundaries. Prism effect must be visibly present in the final frame (not optional).',
      '3-Point Beauty Dish':
        'Classic three-point beauty setup with clean key/fill/back separation and polished commercial skin-safe reflections.',
      'Softbox Wrap':
        'Large softbox wrap with broad diffuse highlights and smooth edge transitions.',
      'Hard Edge Gels':
        'Directional hard-light edges with controlled gel accents and high-contrast shadow geometry.',
      'Backlit Acrylic':
        'Backlit translucent planes with clean edge glow and controlled specular response.',
      'High-Speed Splash Rig':
        'High-speed strobe freeze behavior with crisp droplets and minimal motion blur.',
      'Gradient Cyclorama':
        'Seamless cyclorama gradient wash with clean tonal rolloff and no banding.',
    };
    const cue = rigCues[rig] || '';
    return [`Lighting rig: ${rig}. Use this rig as the authoritative lighting setup.`, cue].filter(Boolean).join(' ');
  })();

  const strictLightingRigLock =
    !isCampaignIntent &&
    isProModeActive &&
    Boolean(lightingRigOverrideText);
  const lightingOverrideText = (() => {
    if (isBasicTier) {
      return [
        lightingStyleOverrideText,
        isCampaignIntent ? '' : userLightingStyleText,
      ].filter(Boolean).join(' ');
    }
    return strictLightingRigLock
      ? lightingRigOverrideText
      : [
        lightingStyleOverrideText,
        isCampaignIntent ? '' : userLightingStyleText,
        lightingRigOverrideText,
      ].filter(Boolean).join(' ');
  })();

  const finishOverrideText = (() => {
    if (!isProModeActive) return '';
    const finish = String((state as any).finish || '').trim();
    if (!finish) return '';
    return `Finish / Treatment: ${finish}. Keep this treatment consistent across the whole scene.`;
  })();

  const proPhotographerLockText = (() => {
    if (isCampaignIntent) return '';
    if (!isProModeActive) return '';
    const rig = String((state as any).lightingRig || '').trim();
    const finish = String((state as any).finish || '').trim();
    if (!rig && !finish) return '';
    return [
      'ADVANCED CONTROLS (LOCKED):',
      rig ? `Lighting Rig=${rig};` : '',
      finish ? `Finish=${finish};` : '',
      'Treat these as locked user selections and do not substitute alternative lens, rig, or finish choices.'
    ].filter(Boolean).join(' ');
  })();

  const creativityOverrideText = (() => {
    if (!isCampaignIntent) {
      return 'Creativity level: Low. Subtle variation only; preserve product-first clarity.';
    }
    if (energyLevel === 'high') {
      return 'Creativity level: Medium-High. Natural environmental variation permitted while preserving product readability.';
    }
    return 'Creativity level: Medium. Natural environmental variation permitted while preserving product readability.';
  })();

  const legacyCreativityTraceText = (() => {
    const level = Number((state as any).creativityLevel);
    if (Number.isNaN(level)) return '';
    return `Legacy creativity input: ${level}.`;
  })();

  const adaptedPhotoModeBasePromptRaw = environmentModeActive
    ? sanitizePhotoModeTextForEnvironment(photoModeResult.basePrompt || '')
    : '';
  const adaptedPhotoModeBasePrompt = isCampaignIntent
    ? sanitizeCampaignConstraintText(adaptedPhotoModeBasePromptRaw)
    : adaptedPhotoModeBasePromptRaw;
  const adaptedPhotoModeModifiersRaw = environmentModeActive
    ? sanitizePhotoModeTextForEnvironment(photoModeResult.modifiers || '')
    : (strictStudioBranding
      ? sanitizePhotoModeTextForStudioBranding(photoModeResult.modifiers || '')
      : photoModeResult.modifiers);
  const adaptedPhotoModeModifiers = isCampaignIntent
    ? sanitizeCampaignConstraintText(adaptedPhotoModeModifiersRaw)
    : adaptedPhotoModeModifiersRaw;
  const photoModeEnvironmentAdaptationText = environmentModeActive
    ? [
      `PHOTO MODE (${getSafePhotoModeLabel(state.photoMode)}) ADAPTED TO ENVIRONMENT: preserve the selected mode's visual style while keeping a real-world location.`,
      isHeroLandingPage
        ? 'Keep hero-level product prominence, clean negative space, and conversion-first readability while preserving environment realism.'
        : 'Do not switch to abstract studio or blank set logic; environment remains physically present and coherent.',
      adaptedPhotoModeBasePrompt ? `Mode style cues: ${adaptedPhotoModeBasePrompt}.` : '',
      adaptedPhotoModeModifiers ? `Mode settings: ${adaptedPhotoModeModifiers}.` : '',
    ].filter(Boolean).join(' ')
    : '';

  const viewpointDirectiveText = (() => {
    if (mode === 'INGREDIENT_FLAT_LAY') {
      return 'VIEWPOINT: Overhead physical vantage from directly above the product plane (flat-lay lock).';
    }
    if (mode === 'INGREDIENT_STACK') {
      return 'VIEWPOINT: Slightly elevated product-level vantage for grounded ingredient depth.';
    }
    const viewpoint = String((state as any).viewpoint || '').trim().toLowerCase();
    if (!viewpoint) return '';
    const map: Record<string, string> = {
      'eye-level': 'VIEWPOINT: Eye-level physical vantage relative to the product.',
      'top-down': 'VIEWPOINT: Overhead physical vantage from above the product plane.',
      'human-pov': 'VIEWPOINT: Natural eye-height POV framing without visible anatomy.',
      suspended: 'VIEWPOINT: Suspended vantage with coherent gravity and depth cues.',
      'display-view': 'VIEWPOINT: Front display vantage optimized for product readability.',
    };
    return map[viewpoint] || '';
  })();

  const correctedAngleState = physicsResolution.correctedCameraAngle;
  const effectiveAngleState = correctedAngleState || state.angle;
  const correctedUiAngleLabel = (() => {
    if (!correctedAngleState) return uiAngleLabel;
    const byState: Record<typeof correctedAngleState, string> = {
      front: 'Eye level product',
      '45': '45° hero',
      top: 'Top-down flat lay',
      detail: 'Detail close-up',
    };
    return byState[correctedAngleState];
  })();
  const effectiveAngleLabel = mode === 'INGREDIENT_FLAT_LAY' ? 'Top-down flat lay' : correctedUiAngleLabel;
  const effectiveMacroMode = !isBundleMacroGuardActive && state.photoMode === 'Macro Dew Label';
  const bundleMacroDistanceGuardActive = Boolean(state.bundle?.enabled) && uiDistanceLabel === 'Macro';
  const effectiveUiDistanceLabel = bundleMacroDistanceGuardActive ? 'Standard' : uiDistanceLabel;
  const effectiveAngleLabelResolvedBase = effectiveMacroMode ? 'Detail close-up' : effectiveAngleLabel;
  const effectiveFramingLabelBase = mode === 'INGREDIENT_FLAT_LAY'
    ? 'Grid-ready'
    : effectiveMacroMode
      ? 'Full-bleed macro crop'
      : uiFramingLabel;
  const effectiveDistanceLabelBase = mode === 'INGREDIENT_FLAT_LAY'
    ? (effectiveUiDistanceLabel === 'Macro' ? 'Macro' : 'Standard')
    : effectiveMacroMode
      ? 'Macro'
      : effectiveUiDistanceLabel;

  const campaignLens = (() => {
    if (!isCampaignIntent) return '';
    if (energyLevel === 'high') return randomizer.pick(['35mm Product Prime', '50mm Product Prime', '70mm Product Prime']);
    if (energyLevel === 'medium') return randomizer.pick(['35mm Product Prime', '50mm Product Prime', '70mm Product Prime']);
    return randomizer.pick(['50mm Product Prime', '70mm Product Prime']);
  })();

  const campaignRotation = (() => {
    if (!isCampaignIntent) return '';
    if (energyLevel === 'high') return randomizer.pick(['-10°', '-8°', '-6°', '-4°', '4°', '6°', '8°', '10°']);
    if (energyLevel === 'medium') return randomizer.pick(['-8°', '-6°', '-4°', '-2°', '2°', '4°', '6°', '8°']);
    return randomizer.pick(['-4°', '-2°', '2°', '4°']);
  })();

  const campaignAngle = (() => {
    if (!isCampaignIntent) return '';
    if (energyLevel === 'high') {
      return randomizer.pick(['eye-level product view with dynamic horizon bias', 'low angle hero view', 'high angle overview']);
    }
    if (energyLevel === 'medium') {
      return randomizer.pick(['eye-level product view', 'low angle hero view', 'high angle overview']);
    }
    return randomizer.pick(['eye-level product view', 'high angle overview']);
  })();

  const campaignFraming = (() => {
    if (!isCampaignIntent) return '';
    if (energyLevel === 'high') {
      return randomizer.pick(['rule-of-thirds composition', 'off-center hero placement', 'dynamic diagonal alignment']);
    }
    if (energyLevel === 'medium') {
      return randomizer.pick(['rule-of-thirds composition', 'off-center hero placement']);
    }
    return 'rule-of-thirds composition';
  })();

  const effectiveAngleLabelResolved = isCampaignIntent ? effectiveAngleLabelResolvedBase : '45° hero';
  const proLens = isProModeActive ? String((state as any).lens || '').trim() : '';
  const effectiveFramingLabel = isCampaignIntent
    ? (effectiveFramingLabelBase === 'Centered hero' ? 'Rule of thirds' : effectiveFramingLabelBase)
    : (isConversionSquareOptimized ? 'Centered dominance with mild crop bias' : 'Centered hero');
  const effectiveDistanceLabel = isCampaignIntent
    ? effectiveDistanceLabelBase
    : (isConversionSquareOptimized ? 'Slightly Closer' : 'Standard');
  const effectiveLensLabel = proLens
    ? proLens
    : (
      isCampaignIntent
        ? campaignLens
        : (
          isConversionSquareOptimized
            ? '45mm equivalent behavior'
            : '50mm Product Prime'
        )
    );
  const effectiveRotationLabel = isCampaignIntent ? campaignRotation : '0°';
  const environmentalSpread = isConversionSquareOptimized;

  const forcedCameraAngle =
    correctedAngleState
      ? mapAngleToPrompt(effectiveAngleState, correctedUiAngleLabel)
      : !isCampaignIntent
      ? '45-degree hero angle'
      : mode === 'INGREDIENT_FLAT_LAY'
      ? 'top-down flat lay'
      : state.photoMode === 'Macro Dew Label'
        ? 'detail close-up'
      : campaignAngle;
  const forcedCameraFraming =
    !isCampaignIntent
      ? (isConversionSquareOptimized
        ? 'centered dominance with mild crop bias and controlled horizontal environmental spread; avoid narrow vertical subject bias and artificial lateral emptiness'
        : 'centered hero composition')
      : mode === 'INGREDIENT_FLAT_LAY'
      ? 'grid-ready composition'
      : effectiveMacroMode
        ? 'full-bleed macro crop with natural edge detail, no side-fill extension'
      : campaignFraming;
  const forcedCameraDistance =
    !isCampaignIntent
      ? (isConversionSquareOptimized ? 'slightly closer framing' : 'standard framing')
      : mode === 'INGREDIENT_FLAT_LAY'
      ? (effectiveUiDistanceLabel === 'Macro' ? 'macro close-up' : 'standard framing')
      : effectiveMacroMode
        ? 'macro close-up'
      : (bundleMacroDistanceGuardActive
        ? 'standard framing'
        : mapDistanceToPrompt(state.distance, effectiveUiDistanceLabel));
  const forcedLens = isProModeActive
    ? proLens
    : (isCampaignIntent ? campaignLens : '');
  const forcedRotation = effectiveRotationLabel;

  const prismRefractionText = (() => {
    const definitionType = String(state.definition?.type || '').toLowerCase();
    const photoMode = String(effectivePhotoModeForPrompt || '');
    const likelyTranslucentContainer =
      definitionType === 'drops' || definitionType === 'skincare';
    const lightSensitiveMode =
      photoMode === 'Macro Dew Label' ||
      photoMode === 'Underwater Split' ||
      photoMode === 'Wet Rock Ripples' ||
      photoMode === 'Sky Float Minimal' ||
      photoMode === 'Sand Palm Shadows' ||
      photoMode === 'Warm Window Wood' ||
      photoMode === 'Acrylic Blocks';

    if (!likelyTranslucentContainer && !lightSensitiveMode) return '';

    return [
      'Optical glass realism: introduce subtle prism dispersion and physically correct luminous refractions where strong light crosses transparent edges.',
      'Keep dispersion controlled and premium; no rainbow artifacts, no fake CGI glow, and no loss of label readability.'
    ].join(' ');
  })();

  const macroFullBleedLockText = effectiveMacroMode
    ? [
      'MACRO FRAME LOCK (MANDATORY): full-bleed native macro composition with no side-fill artifacts.',
      'Do not create blurred side bands, mirrored edges, pillarbox/letterbox bars, white margins, black margins, or duplicated vertical strips.'
      ,
      'Never deliver a narrow centered subject on a synthetically extended background. Generate native full-width scene detail across the entire 16:9 frame.'
    ].join(' ')
    : '';

  const explicitSecondaryPropsText = (() => {
    const manual = String(effectiveSuggestedProps || '').trim();
    return manual;
  })();

  const visualIntentDirectiveText = (() => {
    if (!isCampaignIntent) {
      return [
        'VISUAL INTENT: Conversion Strict Mode.',
        'Use Softbox Wrap as authoritative lighting behavior with controlled reflections.',
        isConversionSquareOptimized
          ? (isBasicTier
            ? 'For 1:1 output, keep centered product dominance with mild crop bias and controlled horizontal environmental spread to avoid narrow vertical subject bias and artificial side emptiness.'
            : 'For 1:1 output, keep centered product dominance with mild crop bias and controlled horizontal environmental spread to avoid narrow vertical subject bias and artificial side emptiness; maintain 45-degree hero camera, slightly closer distance, and 0-degree rotation. Respect user-selected pro lens when provided.')
          : (isBasicTier
            ? 'Keep centered product dominance with stable hero perspective and controlled reflections.'
            : 'Keep centered hero composition, 45-degree hero camera, and 0-degree rotation. Respect user-selected pro lens when provided.'),
        'Enforce strict splash minimalism, clinical reflection control, and conservative variation density.',
      ].join(' ');
    }
    return [
      'VISUAL INTENT: Campaign Energy Mode.',
      'Natural directional sunlight with environmental bounce and specular rim highlights.',
      'Dynamic framing is allowed; non-centered compositions are preferred where physically coherent.',
      'Motion style: organic, directional, environment-driven motion. Allow crossing splash arcs, irregular foam shapes, and wind interaction.',
      'Atmosphere tools enabled: lens micro droplets, sun flare, foreground blur, environmental depth layering.',
      'HARD LOCKS (MANDATORY): LABEL LOCK, PRODUCT DESIGN LOCK, PRODUCT_STATE_MOTION static.',
      'FRAME INTEGRITY LOCK (MANDATORY): no letterbox/pillarbox bars, no mirrored edge extension, no duplicated side panels, and no blurred side-fill bands.',
    ].join(' ');
  })();

  const beachFoamProfileText = (() => {
    if (!beachFoamProfile) return '';
    if (beachFoamProfile === 'BeachFoam_Conversion') {
      return [
        'BeachFoam_Conversion profile:',
        'minimal foam, softbox-driven polish, centered hero bias, controlled backwash, strict readability.',
      ].join(' ');
    }
    return [
      'BeachFoam_Campaign profile:',
      'golden-hour optional sunlight, wind-influenced foam, irregular shoreline behavior, dynamic wave break, environmental depth layering, non-centered framing allowed.',
    ].join(' ');
  })();

  const energyDirectiveText = (() => {
    if (!isCampaignIntent) return '';
    if (energyLevel === 'low') {
      return 'Energy Level: Low. Subtle motion, light environmental activity, restrained directional arcs.';
    }
    if (energyLevel === 'high') {
      return 'Energy Level: High. Aggressive directional splash, strong rim light, pronounced foreground blur.';
    }
    return 'Energy Level: Medium. Visible splash arcs, stronger contrast shaping, dynamic composition.';
  })();
  const gravitationalBlock = `
GRAVITATIONAL VECTOR CONSISTENCY:
All objects must obey real-world gravity unless placement explicitly defines suspension or buoyancy.
Contact shadows must align with gravitational direction.
No contradictory shadow direction allowed.
`;
  const lightCoherenceBlock = `
LIGHT SOURCE COHERENCE:
Lighting direction must align with camera angle and placement.
No backlight contradicting frontal camera dominance.
No impossible highlight orientation.
Specular reflections must follow real physical light source direction.
`;
  const underwaterRefractionBlock = String(state.photoMode || '').toLowerCase().includes('underwater')
    ? `
UNDERWATER OPTICAL COHERENCE:
Refraction distortion must follow camera axis.
Water caustics must respond to depth and surface angle.
No flat overlay water effects.
No studio-style suspension shadows underwater.
`
    : '';

  const parts = [
    buildBaseContext({
      allowStudio: mode === 'ACRYLIC_BLOCKS',
      qualityProfile: isCampaignIntent ? 'editorial' : state.qualityProfile,
      visualIntent: isCampaignIntent ? 'campaign' : 'conversion',
    }),
    visualIntentDirectiveText,
    energyDirectiveText,
    beachFoamProfileText,
    photoModeEnvironmentAdaptationText,
    scene,
    placementResolution.promptFragment,
    physicsResolution.promptFragment,
    gravitationalBlock,
    viewpointDirectiveText,
    environmentModeActive ? '' : adaptedPhotoModeModifiers,
    mode === 'INGREDIENT_STACK' ||
      mode === 'INGREDIENT_FLAT_LAY' ||
      state.photoMode === 'Macro Dew Label' ||
      !explicitSecondaryPropsText
      ? ''
      : buildSecondaryProps(mode, randomizer, explicitSecondaryPropsText),
    buildCamera(mode, randomizer, {
      qualityProfile: isCampaignIntent ? 'editorial' : state.qualityProfile,
      forceLens: forcedLens || undefined,
      disableAutoLens: isProModeActive,
      forceCameraSystem: isProModeActive
        ? (isCampaignIntent
          ? mapCameraSystemToPrompt(state.cameraSystem, uiSystemLabel)
          : 'professional DSLR / mirrorless camera')
        : undefined,
      forceAngle: forcedCameraAngle,
      forceDistance: forcedCameraDistance,
      forceComposition: forcedCameraFraming,
      forceRotation: isProModeActive ? forcedRotation : undefined,
      override: undefined,
      compactMetadata: isBasicTier && !isCampaignIntent,
    }),
    buildLighting(mode, randomizer, {
      qualityProfile: isCampaignIntent ? 'editorial' : state.qualityProfile,
      ...(lightingOverrideText ? { override: { text: lightingOverrideText } } : {}),
      strictRigLock: strictLightingRigLock,
    }),
    lightCoherenceBlock,
    underwaterRefractionBlock,
    proPhotographerLockText,
    finishOverrideText,
    creativityOverrideText,
    legacyCreativityTraceText,
    strictStudioBranding ? '' : buildMaterialsWithProfile(mode, randomizer, isCampaignIntent ? 'editorial' : state.qualityProfile),
    prismRefractionText,
    isCampaignIntent ? '' : buildUltraRealStrictBlock(Boolean(state.ultraRealStrict), state.qualityProfile),
    macroFullBleedLockText,
    strictStudioBranding
      ? ''
      : buildRandomizationRules(
        mode === 'INGREDIENT_STACK' || mode === 'INGREDIENT_FLAT_LAY' ? 'ingredientStack' : 'default',
        isCampaignIntent ? 'editorial' : state.qualityProfile,
        {
          lensLocked: isCampaignIntent ? false : (isProModeActive && Boolean(String((state as any).lens || '').trim())),
          lightingLocked: isCampaignIntent ? false : (isProModeActive && Boolean(String((state as any).lightingRig || '').trim())),
          finishLocked: isCampaignIntent ? false : (isProModeActive && Boolean(String((state as any).finish || '').trim())),
          propsLocked: isCampaignIntent ? false : !explicitSecondaryPropsText,
        }
      ),
    isCampaignIntent ? '' : buildQualityEnforcers(state.qualityProfile),
  ].filter(Boolean);

  const assembledPrompt = normalizePromptText(parts.join(' '));
  const finalPrompt = assembledPrompt
    .replace(/(Physics coherence adjustment applied\.)+/g, 'Physics coherence adjustment applied.')
    .replace(
      /(Clinical softbox lighting with clean reflections and neutral color\.\s*){2,}/g,
      'Clinical softbox lighting with clean reflections and neutral color.'
    );

  return {
    prompt: finalPrompt,
    mode,
    splashMode,
    randomSeed: randomizer.seed,
  };
}
