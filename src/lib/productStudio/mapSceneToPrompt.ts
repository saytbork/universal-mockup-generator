import type { ProductAsset, ProductStudioState, PhotoMode } from './types';
import { PHOTO_MODE_SCHEMAS } from './photoModeSchema';
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
    kitchen: ['minimal glass accent near the edge of frame', 'clean acrylic riser nearby', 'soft morning reflections on stone'],
    bathroom: ['minimal glass accent in background', 'subtle steam haze near tiles', 'clean stone accent partially visible'],
    workspace: ['minimal notebook corner peeking in', 'soft desk lamp glow from side', 'muted stationery kept out of focus'],
    'cgmp-facility': ['stainless steel highlights and clean machinery surfaces', 'guide rails and clean line geometry', 'industrial clean-room reflections'],
    'urban-exterior': ['soft bokeh of buildings in distance', 'muted street texture far from product', 'subtle daylight reflections on concrete'],
    'natural-exterior': ['soft greenery bokeh in distance', 'natural stone texture outside focus plane', 'diffused sky light'],
  } as const;

  const accentPool =
    (environmentAccents as any)[macro] ||
    ['subtle background context out of focus', 'realistic contact shadows and reflections', 'clean negative space preserved'];
  const accent = randomizer.pick(accentPool);

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
  'Acrylic Blocks': 'ACRYLIC_BLOCKS',
  'Splash Shot': 'SPLASH_SHOT',
  'Foam & Texture': 'FOAM_AND_TEXTURE',
  'Routine Carousel': 'ROUTINE_CAROUSEL',
  'Clinical Lab Counter': 'CLINICAL_LAB_COUNTER',
  'Golden Mist Aura': 'GOLDEN_MIST_AURA',
  'Candy Gradient Lab': 'CANDY_GRADIENT_LAB',
  'Ingredient Flat Lay': 'INGREDIENT_STACK',
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
};

const SECONDARY_PROPS_BY_MODE: Partial<Record<PhotoModeKey, string[]>> = {
  HERO_NEUTRAL: ['minimal glass accent', 'clean acrylic riser', 'small stone block'],
  COLOR_POP_HERO: ['geometric color blocks', 'polished acrylic accent', 'abstract color panel'],
  BRAND_CAMPAIGN: ['architectural hero pedestal', 'luxury monolithic block', 'high-end reflective accent'],
  UGC_PREMIUM_SIM: ['subtle realistic texture cue', 'controlled asymmetrical accent', 'minimal tactile realism prop'],
  INGREDIENT_STACK: [],
  ACRYLIC_BLOCKS: ['additional acrylic risers', 'prismatic edge accents'],
  SPLASH_SHOT: ['minimal liquid surface ripples', 'controlled droplets around the base'],
  FOAM_AND_TEXTURE: ['controlled foam clusters', 'gel ribbons', 'micro-bubbles'],
  ROUTINE_CAROUSEL: ['simple glassware', 'clean acrylic tray', 'soft paper elements'],
  CLINICAL_LAB_COUNTER: ['clean glassware silhouettes', 'stainless tools', 'measured droppers'],
  GOLDEN_MIST_AURA: ['soft golden haze', 'delicate reflective accents'],
  CANDY_GRADIENT_LAB: ['transparent lab forms', 'gradient panels', 'polished geometric props'],
};

function normalizePhotoMode(photoMode: string | null | undefined): PhotoModeKey {
  const key = String(photoMode || '').trim();
  return PHOTO_MODE_MAP[key] ?? 'HERO_NEUTRAL';
}

function buildSecondaryProps(mode: PhotoModeKey, randomizer: ReturnType<typeof createRandomizer>, suggestedProps?: string): string {
  if (suggestedProps && suggestedProps.trim().length > 0) {
    return `Secondary props: ${suggestedProps}.`;
  }
  const options = SECONDARY_PROPS_BY_MODE[mode];
  if (!options || options.length === 0) return '';
  const picks = randomizer.pickMany(options, Math.min(2, options.length));
  return `Secondary props: ${picks.join(', ')}.`;
}

function buildPlacementDirective(state: ProductStudioState): string {
  const requiredPlacement = PHOTO_MODE_SCHEMAS[state.photoMode as PhotoMode]?.requiredPlacement;
  const effectivePlacement =
    requiredPlacement && requiredPlacement !== 'any'
      ? requiredPlacement
      : (state.placement || 'surface');
  const placement = String(effectivePlacement);
  if (placement === 'supported') {
    return [
      'PLACEMENT (MANDATORY): Supported.',
      'Product is on a visible stand, tray, pedestal, or support structure.',
      'Support must read as physically real with contact shadows and stable balance.',
      'No invisible levitation. No hand-held pose unless interaction explicitly requires it.'
    ].join(' ');
  }
  if (placement === 'air') {
    return [
      'PLACEMENT (MANDATORY): Air / Suspended.',
      'Product is suspended in controlled air composition with realistic gravity cues.',
      'No surface contact and no accidental tabletop grounding.',
      'Use physically plausible anchor shadows and coherent perspective.'
    ].join(' ');
  }
  if (placement === 'held') {
    return [
      'PLACEMENT (MANDATORY): Held.',
      'Product must be clearly held by hand(s) with realistic contact and grip pressure.',
      'No unsupported floating product state.'
    ].join(' ');
  }
  return [
    'PLACEMENT (MANDATORY): Surface.',
    'Product rests on a real surface with grounded contact and physically coherent shadows.'
  ].join(' ');
}

function extractModeSpecificDynamicSettings(state: ProductStudioState): Record<string, string> | undefined {
  const mode = state.photoMode as PhotoMode;
  const cfg = state.photoModeConfig;
  const dynamic: Record<string, string> = {};

  const add = (key: string, value: unknown) => {
    const v = String(value ?? '').trim();
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

  // CRITICAL: Hero Landing Page gets exclusive sceneType routing in pure studio only.
  const isHeroLandingPage = state.photoMode === 'Hero Landing Page';

  const studioLikeScene = state.sceneType === 'studio-branding' || state.sceneType === 'ecommerce-pdp';

  const environmentModeActive =
    studioLikeScene === false &&
    state.blankSpaceEnabled === false &&
    state.environmentContext != null &&
    String(state.environmentContext.macro || '').trim() !== '' &&
    String(state.environmentContext.macro || '').trim().toLowerCase() !== 'studio';
  const heroStudioLocked = isHeroLandingPage && !environmentModeActive;

  // When "Environment" is enabled in the UI, Photo Mode becomes irrelevant (it's hidden).
  // Force a neutral baseline so lighting/camera/material pools stay coherent, while the scene itself is environment-driven.
  const mode = environmentModeActive ? 'HERO_NEUTRAL' : normalizePhotoMode(state.photoMode);

  const palette = product?.palette
    ? {
      dominant: product.palette.dominant,
      secondary: product.palette.secondary,
      accent: product.palette.accent,
    }
    : undefined;

  const ingredientStackBgOptions = (() => {
    if (state.photoMode !== 'Ingredient Stack') return null;
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
    if (state.photoMode === 'Ingredient Stack' && 'layoutStyle' in uiDynamic) {
      // Legacy duplicate: "Layout Style" must not coexist with the "Stack Style" control.
      delete (uiDynamic as any).layoutStyle;
    }
    const merged = {
      ...modeSpecific,
      ...uiDynamic,
    };
    return Object.keys(merged).length > 0 ? merged : undefined;
  })();

  const photoModeResult = buildPhotoModePrompt(state.photoMode as PhotoMode, {
    suggestedProps: state.props,
    ingredientLayout: state.ingredientLayout,
    dynamicSettings,
    productType: state.definition.type as any,
    ...(ingredientStackBgOptions ?? {}),
  });

  const sceneInput: SceneBuildInput = {
    randomizer,
    palette,
    suggestedProps: state.props,
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
      prompt: parts.join(' '),
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
        // CRITICAL: Dynamic user ingredients must not use stack scene builder
        if (state.props && state.props.trim().length > 0) {
          // downgrade to neutral surround behavior
          scene = buildHeroNeutralScene(sceneInput);
          break;
        }
        scene = buildIngredientStackScene(sceneInput);
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

  const lightingStyleOverrideText = (() => {
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
    const rig = String((state as any).lightingRig || '').trim();
    if (!rig) return '';
    return `Lighting rig: ${rig}.`;
  })();

  const lightingOverrideText = [lightingStyleOverrideText, lightingRigOverrideText]
    .filter(Boolean)
    .join(' ');

  const finishOverrideText = (() => {
    const finish = String((state as any).finish || '').trim();
    if (!finish) return '';
    return `Finish / Treatment: ${finish}. Keep this treatment consistent across the whole scene.`;
  })();

  const creativityOverrideText = (() => {
    const level = Number((state as any).creativityLevel);
    if (Number.isNaN(level)) return '';
    if (level <= 0) {
      return 'Creativity level: Locked. Keep composition conservative and brand-safe.';
    }
    if (level === 1) {
      return 'Creativity level: Low. Subtle variation only; preserve product-first clarity.';
    }
    if (level === 2) {
      return 'Creativity level: Medium. Allow moderate variation while keeping clear commercial readability.';
    }
    return 'Creativity level: High. Allow bold styling variation without reducing product legibility.';
  })();

  const adaptedPhotoModeBasePrompt = environmentModeActive
    ? sanitizePhotoModeTextForEnvironment(photoModeResult.basePrompt || '')
    : '';
  const adaptedPhotoModeModifiers = environmentModeActive
    ? sanitizePhotoModeTextForEnvironment(photoModeResult.modifiers || '')
    : photoModeResult.modifiers;
  const photoModeEnvironmentAdaptationText = environmentModeActive
    ? [
      `PHOTO MODE (${state.photoMode}) ADAPTED TO ENVIRONMENT: preserve the selected mode's visual style while keeping a real-world location.`,
      isHeroLandingPage
        ? 'Keep hero-level product prominence, clean negative space, and conversion-first readability while preserving environment realism.'
        : 'Do not switch to abstract studio or blank set logic; environment remains physically present and coherent.',
      adaptedPhotoModeBasePrompt ? `Mode style cues: ${adaptedPhotoModeBasePrompt}.` : '',
      adaptedPhotoModeModifiers ? `Mode settings: ${adaptedPhotoModeModifiers}.` : '',
    ].filter(Boolean).join(' ')
    : '';

  const parts = [
    buildBaseContext({ allowStudio: mode === 'ACRYLIC_BLOCKS', qualityProfile: state.qualityProfile }),
    photoModeEnvironmentAdaptationText,
    scene,
    buildPlacementDirective(state),
    environmentModeActive ? '' : photoModeResult.modifiers,
    mode === 'INGREDIENT_STACK' ? '' : buildSecondaryProps(mode, randomizer, state.props),
    buildLighting(mode, randomizer, {
      qualityProfile: state.qualityProfile,
      ...(lightingOverrideText ? { override: { text: lightingOverrideText } } : {}),
    }),
    buildCamera(mode, randomizer, {
      qualityProfile: state.qualityProfile,
      ...(state.lens ? { forceLens: state.lens } : {}),
    }),
    finishOverrideText,
    creativityOverrideText,
    buildMaterialsWithProfile(mode, randomizer, state.qualityProfile),
    buildRandomizationRules(mode === 'INGREDIENT_STACK' ? 'ingredientStack' : 'default', state.qualityProfile),
    buildQualityEnforcers(state.qualityProfile),
  ].filter(Boolean);

  return {
    prompt: parts.join(' '),
    mode,
    splashMode,
    randomSeed: randomizer.seed,
  };
}
