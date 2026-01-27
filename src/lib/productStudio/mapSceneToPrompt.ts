import type { ProductAsset, ProductStudioState } from './types';
import { buildBaseContext } from './promptParts/baseContext';
import {
  buildAcrylicBlocksScene,
  buildCandyGradientLabScene,
  buildClinicalLabCounterScene,
  buildColorPopHeroScene,
  buildCrownWellnessVanityScene,
  buildFoamAndTextureScene,
  buildGoldenMistAuraScene,
  buildHeroNeutralScene,
  buildIngredientStackScene,
  buildOutdoorEnergyBoostScene,
  buildPastelPicnicScene,
  buildRoutineCarouselScene,
  buildSplashShotScene,
  buildSunriseWellnessCounterScene,
  buildTileAndSpaScene,
  type PhotoModeKey,
  type SceneBuildInput,
} from './promptParts/sceneBuilders';
import { buildLighting } from './promptParts/lightingBuilders';
import { buildCamera } from './promptParts/cameraBuilders';
import { buildMaterials } from './promptParts/materialsBuilders';
import { buildRandomizationRules, createRandomizer } from './promptParts/randomizationRules';
import { buildQualityEnforcers } from './promptParts/qualityEnforcers';

export type ScenePromptResult = {
  prompt: string;
  mode: PhotoModeKey;
  splashMode?: string;
  randomSeed: string;
};

const PHOTO_MODE_MAP: Record<string, PhotoModeKey> = {
  'Hero Landing Page': 'HERO_NEUTRAL',
  'Hero Neutral': 'HERO_NEUTRAL',
  'Clear': 'HERO_NEUTRAL',
  'Color Pop Hero': 'COLOR_POP_HERO',
  'Ingredient Stack': 'INGREDIENT_STACK',
  'Acrylic Blocks': 'ACRYLIC_BLOCKS',
  'Splash Shot': 'SPLASH_SHOT',
  'Tile & Spa': 'TILE_AND_SPA',
  'Foam & Texture': 'FOAM_AND_TEXTURE',
  'Routine Carousel': 'ROUTINE_CAROUSEL',
  'Pastel Picnic': 'PASTEL_PICNIC',
  'Sunrise Wellness Counter': 'SUNRISE_WELLNESS_COUNTER',
  'Clinical Lab Counter': 'CLINICAL_LAB_COUNTER',
  'Golden Mist Aura': 'GOLDEN_MIST_AURA',
  'Outdoor Energy Boost': 'OUTDOOR_ENERGY_BOOST',
  'Crown Wellness Vanity': 'CROWN_WELLNESS_VANITY',
  'Candy Gradient Lab': 'CANDY_GRADIENT_LAB',
};

const SECONDARY_PROPS_BY_MODE: Partial<Record<PhotoModeKey, string[]>> = {
  HERO_NEUTRAL: ['minimal ceramic dish', 'clean linen fold', 'subtle glass accent'],
  COLOR_POP_HERO: ['geometric color blocks', 'polished acrylic accent', 'abstract color panel'],
  INGREDIENT_STACK: ['fresh botanicals', 'sliced citrus', 'herbal leaves', 'clean powders'],
  ACRYLIC_BLOCKS: ['additional acrylic risers', 'prismatic edge accents'],
  SPLASH_SHOT: ['minimal liquid surface ripples', 'controlled droplets around the base'],
  TILE_AND_SPA: ['rolled spa towel', 'small ceramic dish', 'soft steam cues'],
  FOAM_AND_TEXTURE: ['controlled foam clusters', 'gel ribbons', 'micro-bubbles'],
  ROUTINE_CAROUSEL: ['simple glassware', 'minimal ceramic tray', 'soft paper elements'],
  PASTEL_PICNIC: ['pastel textiles', 'fresh fruit slices', 'soft glassware'],
  SUNRISE_WELLNESS_COUNTER: ['warm ceramics', 'linen cloth', 'subtle breakfast accents'],
  CLINICAL_LAB_COUNTER: ['clean glassware silhouettes', 'stainless tools', 'measured droppers'],
  GOLDEN_MIST_AURA: ['soft golden haze', 'delicate reflective accents'],
  OUTDOOR_ENERGY_BOOST: ['sunlit foliage', 'natural stones', 'wind-swept fabric'],
  CROWN_WELLNESS_VANITY: ['mirror accents', 'metallic trays', 'luxury cosmetic tools'],
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

export function mapSceneToPrompt(state: ProductStudioState, product?: ProductAsset | null): ScenePromptResult {
  const randomizer = createRandomizer();
  const mode = normalizePhotoMode(state.photoMode);

  const palette = product?.palette
    ? {
      dominant: product.palette.dominant,
      secondary: product.palette.secondary,
      accent: product.palette.accent,
    }
    : undefined;

  const sceneInput: SceneBuildInput = {
    randomizer,
    palette,
    suggestedProps: state.props,
    ingredientLayout: state.ingredientLayout,
  };

  let scene = '';
  let splashMode: string | undefined;

  switch (mode) {
    case 'HERO_NEUTRAL':
      scene = buildHeroNeutralScene(sceneInput);
      break;
    case 'COLOR_POP_HERO':
      scene = buildColorPopHeroScene(sceneInput);
      break;
    case 'INGREDIENT_STACK':
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
    case 'TILE_AND_SPA':
      scene = buildTileAndSpaScene(sceneInput);
      break;
    case 'FOAM_AND_TEXTURE':
      scene = buildFoamAndTextureScene(sceneInput);
      break;
    case 'ROUTINE_CAROUSEL':
      scene = buildRoutineCarouselScene(sceneInput);
      break;
    case 'PASTEL_PICNIC':
      scene = buildPastelPicnicScene(sceneInput);
      break;
    case 'SUNRISE_WELLNESS_COUNTER':
      scene = buildSunriseWellnessCounterScene(sceneInput);
      break;
    case 'CLINICAL_LAB_COUNTER':
      scene = buildClinicalLabCounterScene(sceneInput);
      break;
    case 'GOLDEN_MIST_AURA':
      scene = buildGoldenMistAuraScene(sceneInput);
      break;
    case 'OUTDOOR_ENERGY_BOOST':
      scene = buildOutdoorEnergyBoostScene(sceneInput);
      break;
    case 'CROWN_WELLNESS_VANITY':
      scene = buildCrownWellnessVanityScene(sceneInput);
      break;
    case 'CANDY_GRADIENT_LAB':
      scene = buildCandyGradientLabScene(sceneInput);
      break;
    default:
      scene = buildHeroNeutralScene(sceneInput);
  }

  const parts = [
    buildBaseContext({ allowStudio: mode === 'ACRYLIC_BLOCKS' }),
    scene,
    buildSecondaryProps(mode, randomizer, state.props),
    buildLighting(mode, randomizer),
    buildCamera(mode, randomizer),
    buildMaterials(mode, randomizer),
    buildRandomizationRules(),
    buildQualityEnforcers(),
  ].filter(Boolean);

  return {
    prompt: parts.join(' '),
    mode,
    splashMode,
    randomSeed: randomizer.seed,
  };
}
