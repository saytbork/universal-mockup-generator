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
    kitchen: ['minimal glass accent near the edge of frame', 'soft morning reflections on neutral surfaces', 'subtle countertop texture outside focus plane'],
    bathroom: ['minimal glass accent in background', 'subtle steam haze near tiles', 'clean neutral accent partially visible'],
    workspace: ['minimal notebook corner peeking in', 'soft desk lamp glow from side', 'muted stationery kept out of focus'],
    'cgmp-facility': ['stainless steel highlights and clean machinery surfaces', 'guide rails and clean line geometry', 'industrial clean-room reflections'],
    'urban-exterior': ['soft bokeh of buildings in distance', 'muted street texture far from product', 'subtle daylight reflections on concrete'],
    'natural-exterior': ['soft greenery bokeh in distance', 'natural surface texture outside focus plane', 'diffused sky light'],
  } as const;

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
  const accent = randomizer.pick(filteredAccents.length > 0 ? filteredAccents : accentPool);

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
};

const SECONDARY_PROPS_BY_MODE: Partial<Record<PhotoModeKey, string[]>> = {
  HERO_NEUTRAL: ['minimal glass accent', 'clean neutral block', 'subtle matte support element'],
  COLOR_POP_HERO: ['geometric color blocks', 'abstract color panel', 'clean reflective panel'],
  BRAND_CAMPAIGN: ['luxury monolithic block', 'high-end reflective accent', 'architectural neutral plinth'],
  UGC_PREMIUM_SIM: ['subtle realistic texture cue', 'controlled asymmetrical accent', 'minimal tactile realism prop'],
  INGREDIENT_STACK: [],
  INGREDIENT_FLAT_LAY: [],
  ACRYLIC_BLOCKS: ['additional acrylic risers', 'prismatic edge accents'],
  SPLASH_SHOT: ['minimal liquid surface ripples', 'controlled droplets around the base'],
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
  const heroStudioLocked = isHeroLandingPage && !environmentModeActive;
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
    productState:
      state.stateMotion === 'opened'
        ? 'Opened'
        : state.stateMotion === 'dispensed'
          ? 'Dispensing'
          : state.stateMotion === 'pouring' || state.stateMotion === 'falling' || state.stateMotion === 'spilled'
            ? 'Pouring'
            : 'Static',
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
    : (strictStudioBranding
      ? sanitizePhotoModeTextForStudioBranding(photoModeResult.modifiers || '')
      : photoModeResult.modifiers);
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

  const effectiveAngleLabel = mode === 'INGREDIENT_FLAT_LAY' ? 'Top-down flat lay' : uiAngleLabel;
  const effectiveFramingLabel = mode === 'INGREDIENT_FLAT_LAY' ? 'Grid-ready' : uiFramingLabel;
  const effectiveDistanceLabel = mode === 'INGREDIENT_FLAT_LAY'
    ? (uiDistanceLabel === 'Macro' ? 'Macro' : 'Standard')
    : uiDistanceLabel;

  const cameraControlsTraceText = [
    'Camera controls selected:',
    `system=${uiSystemLabel};`,
    `angle=${effectiveAngleLabel};`,
    `distance=${effectiveDistanceLabel};`,
    `rotation=${uiRotationLabel};`,
    `framing=${effectiveFramingLabel}.`,
  ].join(' ');

  const forcedCameraAngle =
    mode === 'INGREDIENT_FLAT_LAY'
      ? 'top-down flat lay'
      : mapAngleToPrompt(state.angle, uiAngleLabel);
  const forcedCameraFraming =
    mode === 'INGREDIENT_FLAT_LAY'
      ? 'grid-ready composition'
      : mapFramingToPrompt(state.framing, uiFramingLabel);
  const forcedCameraDistance =
    mode === 'INGREDIENT_FLAT_LAY'
      ? (uiDistanceLabel === 'Macro' ? 'macro close-up' : 'standard framing')
      : mapDistanceToPrompt(state.distance, uiDistanceLabel);

  const parts = [
    buildBaseContext({ allowStudio: mode === 'ACRYLIC_BLOCKS', qualityProfile: state.qualityProfile }),
    photoModeEnvironmentAdaptationText,
    scene,
    buildPlacementDirective(state),
    viewpointDirectiveText,
    environmentModeActive ? '' : photoModeResult.modifiers,
    mode === 'INGREDIENT_STACK' || mode === 'INGREDIENT_FLAT_LAY' || strictStudioBranding
      ? ''
      : buildSecondaryProps(mode, randomizer, state.props),
    buildLighting(mode, randomizer, {
      qualityProfile: state.qualityProfile,
      ...(lightingOverrideText ? { override: { text: lightingOverrideText } } : {}),
    }),
    buildCamera(mode, randomizer, {
      qualityProfile: state.qualityProfile,
      ...(state.lens ? { forceLens: state.lens } : {}),
      forceCameraSystem: mapCameraSystemToPrompt(state.cameraSystem, uiSystemLabel),
      forceAngle: forcedCameraAngle,
      forceDistance: forcedCameraDistance,
      forceComposition: forcedCameraFraming,
      forceRotation: mapRotationToPrompt(state.rotation, uiRotationLabel),
      override: { text: cameraControlsTraceText },
    }),
    finishOverrideText,
    creativityOverrideText,
    strictStudioBranding ? '' : buildMaterialsWithProfile(mode, randomizer, state.qualityProfile),
    strictStudioBranding
      ? ''
      : buildRandomizationRules(
        mode === 'INGREDIENT_STACK' || mode === 'INGREDIENT_FLAT_LAY' ? 'ingredientStack' : 'default',
        state.qualityProfile,
        {
          lensLocked: Boolean(String((state as any).lens || '').trim()),
          lightingLocked: Boolean(String((state as any).lightingRig || '').trim()),
          finishLocked: Boolean(String((state as any).finish || '').trim()),
        }
      ),
    buildQualityEnforcers(state.qualityProfile),
  ].filter(Boolean);

  return {
    prompt: normalizePromptText(parts.join(' ')),
    mode,
    splashMode,
    randomSeed: randomizer.seed,
  };
}
