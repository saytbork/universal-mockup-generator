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

const titleCaseFromKebab = (value: string): string =>
  value
    .split('-')
    .map(part => (part ? part.charAt(0).toUpperCase() + part.slice(1) : part))
    .join(' ')
    .trim();

function buildEnvironmentScene(state: ProductStudioState, randomizer: ReturnType<typeof createRandomizer>): string {
  if (state.blankSpaceEnabled) return '';
  if (state.environmentContext == null) return '';

  const macro = String(state.environmentContext.macro || '').trim();
  if (!macro || macro === 'studio') return '';

  const micro = state.environmentContext.micro == null ? '' : String(state.environmentContext.micro).trim();

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
    kitchen: ['clean ceramic dish near the edge of frame', 'subtle linen cloth folded nearby', 'soft morning reflections on stone'],
    bathroom: ['clean folded towel texture in background', 'subtle steam haze near tiles', 'ceramic tray partially visible'],
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
  parts.push(`${macroText}.`);
  if (microText) parts.push(`Product placed on a ${microText}.`);
  parts.push(`${accent}.`);

  return parts.join(' ');
}

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
  const environmentModeActive =
    state.blankSpaceEnabled === false &&
    state.environmentContext != null &&
    String(state.environmentContext.macro || '').trim() !== '' &&
    String(state.environmentContext.macro || '').trim() !== 'studio';

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

  const sceneInput: SceneBuildInput = {
    randomizer,
    palette,
    suggestedProps: state.props,
    ingredientLayout: state.ingredientLayout,
  };

  let scene = '';
  let splashMode: string | undefined;

  if (environmentModeActive) {
    scene = buildEnvironmentScene(state, randomizer);
  } else {
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
  }

  const lightingOverrideText = (() => {
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

  const parts = [
    buildBaseContext({ allowStudio: mode === 'ACRYLIC_BLOCKS' }),
    scene,
    buildSecondaryProps(mode, randomizer, state.props),
    buildLighting(mode, randomizer, lightingOverrideText ? { override: { text: lightingOverrideText } } : undefined),
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
