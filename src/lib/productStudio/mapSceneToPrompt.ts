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
import { resolveAuthorities } from './promptParts/authorityResolver';
import { buildMotionAuthorityBlock } from './promptParts/buildMotion';
import { buildProductStateBlock } from './promptParts/buildProductState';
import { buildCompositionAuthorityBlock } from './promptParts/buildCompositionRules';
import { buildSplashPhysicsModel, isSplashPhysicsContext } from './promptParts/buildSplashPhysics';
import { assemblePrompt } from './promptParts/promptAssembler';
import { resolvePlacement } from './placementResolver';
import { resolvePhysicsCoherence } from './physicsCoherenceResolver';
import { resolveAtmosphere, type CanonicalScene, type CanonicalSceneIngredient } from '../prompt/atmosphereResolver';
import { validateAtmosphere } from '../prompt/atmosphereValidator';
import { buildAtmosphereDebugTree } from '../prompt/atmosphereDebugTree';
import { getWineEnvironmentNarrative, isWinePrestigeMode, isWinePrestigeV2Mode } from './winePrestige';

const titleCaseFromKebab = (value: string): string =>
  value
    .split('-')
    .map(part => (part ? part.charAt(0).toUpperCase() + part.slice(1) : part))
    .join(' ')
    .trim();

const parseCustomIngredientsText = (raw: string): CanonicalSceneIngredient[] => {
  return String(raw || '')
    .split(/[\n,|;]/g)
    .map(token => token.trim())
    .filter(Boolean)
    .map(name => ({
      name,
      cutStyle: 'auto',
      freshness: 'auto',
      density: 'auto',
      placement: 'auto',
    }));
};

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

type EnergyLevelResolved = 'low' | 'medium' | 'high';

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

function buildWinePrestigeLegacyPrompt(state: ProductStudioState): ScenePromptResult {
  const hasReference = Array.isArray((state as any).products) &&
    (state as any).products.some((p: any) =>
      Boolean(
        String(p?.base64 || '').trim() ||
        String(p?.imageUrl || '').trim() ||
        String(p?.url || '').trim() ||
        String(p?.src || '').trim() ||
        String(p?.previewUrl || '').trim()
      )
    );
  const environmentNarrative = getWineEnvironmentNarrative(
    String(state.contextPreset || '').trim() || 'Dark Luxury Studio'
  );
  const moodModifier = String((state as any).wineMoodModifier || '').trim();
  const lightingTone = String((state as any).wineLightingTone || '').trim() || 'Warm Lateral';
  const winePrestigeV2Mode = isWinePrestigeV2Mode(state);
  const wineAction = String((state as any).wineAction || 'static-presentation').trim();
  const isDynamicWineAction = wineAction === 'controlled-pour' || wineAction === 'pour';
  const pourStyle = String((state as any).winePourStyle || 'mid-flow-elegance').trim();
  const manualWineType = String((state as any).wineType || '').trim().toLowerCase();
  const manualWineClosure = String((state as any).wineClosureType || '').trim().toLowerCase();
  const manualWineConfigured =
    (manualWineType !== '' && manualWineType !== 'auto') ||
    (manualWineClosure !== '' && manualWineClosure !== 'from-reference');
  const isRealWorldSunlitTable =
    String((state as any).contextPreset || '').trim().toLowerCase().includes('sunlit-table');
  const whiteWineSignal = `${String(state.contextPreset || '')} ${String((state as any).wineMoodModifier || '')} ${String(state.photoMode || '')}`
    .toLowerCase()
    .includes('white');

  const parts = [
    'SCENE TYPE: wine-prestige.',
    'CONTENT STYLE: premium.',
    'CREATION INTENT: brand-prestige.',
    'WINE PRESTIGE NARRATIVE BASE: Premium wine presentation. Atmosphere-driven composition. Emphasize depth, texture, silence, and material richness. The bottle is integrated naturally within a refined environment. Preserve exact label fidelity and geometry. Use cinematic lens compression and warm lateral lighting. Avoid commercial splash energy. Focus on elegance, mood, and premium brand perception.',
    environmentNarrative,
    winePrestigeV2Mode
      ? 'WINE_PRESTIGE_VERSION: V2 Cinematic Pour Edition.'
      : 'WINE_PRESTIGE_VERSION: V1 Static Presentation.',
    winePrestigeV2Mode
      ? 'WINE_PRESTIGE_V2_NARRATIVE: Premium wine presentation with controlled cinematic pouring action. Emphasize elegance, depth, and refined atmosphere. The wine flows smoothly from the bottle in a continuous ribbon with natural gravity-driven motion. No explosive splash behavior. Focus on material richness, glass refraction, liquid translucency, and warm lateral lighting. Preserve exact label fidelity and bottle geometry. The composition should feel sophisticated, intimate, and premium.'
      : '',
    `WINE_ACTION: ${wineAction}.`,
    winePrestigeV2Mode ? `POUR_STYLE: ${pourStyle}.` : '',
    `COMPOSITION: Product First composition. Rule of thirds default. Asymmetrical balance allowed. Elegant negative space and lateral breathing room are required. ${
      isDynamicWineAction
        ? 'Dynamic pour action allows bottle tilt between 5° and 12° max.'
        : 'Static presentation requires vertical bottle orientation (0° tilt, perfectly upright).'
    } Glass can be foreground or midground. Never force rigid center unless explicitly selected.`,
    'CAMERA SYSTEM OVERRIDE (SAFE VERSION): LENS_PROFILE = "short telephoto premium prime (85–100mm equivalent)"; DISTORTION = 0; DEPTH_STYLE = "cinematic optical falloff"; BACKGROUND_BLUR = "natural optical depth, not artificial blur". Top-down camera forbidden. Ultra-wide lens forbidden.',
    isRealWorldSunlitTable
      ? 'LIGHTING MODEL: natural-window-light model. Real-world sunlit-table environment: soft directional daylight, natural highlight roll-off, and organic shadow transitions. clinical-softbox is disabled.'
      : `LIGHTING MODEL: ${lightingTone}. Warm lateral key light, low-intensity rim highlight, soft fill shadow recovery, controlled specular highlights on the liquid stream, highlight tracking along the flowing wine, slight warmth bias, deep shadow preservation, and no overexposed label. Priority: liquid glow > bottle silhouette > label.`,
    hasReference
      ? 'LIQUID_COLOR_REFERENCE_LOCK: Preserve exact liquid hue family from reference. NO_HUE_SHIFT_ON_LIQUID=true. Lighting may only affect specular intensity and shadow depth.'
      : whiteWineSignal
        ? 'LIQUID_RENDERING: pale golden translucency, increased internal glow, lower opacity density, slight meniscus at glass contact, and realistic refractive distortion.'
        : 'LIQUID_RENDERING: deep burgundy translucency, light absorption at the core, edge luminosity near the surface, slight meniscus at glass contact, and realistic refractive distortion.',
    winePrestigeV2Mode
      ? [
        'WINE_POUR_MODEL: Origin at bottle neck.',
        'Flow type laminar fluid stream with continuous ribbon flow.',
        'No fragmentation unless impact occurs.',
        'Strict gravity vector, slightly elevated viscosity, and visible surface tension.',
        'When stream hits glass: internal wave formation and micro splash inside glass only.',
        'No external droplets, no chaotic splash, no outward explosion.',
        pourStyle === 'peak-glass-impact'
          ? 'Peak glass impact: internal glass turbulence only; never external splash.'
          : '',
      ].filter(Boolean).join(' ')
      : '',
    isRealWorldSunlitTable
      ? 'MATERIAL MODEL: organic photographic model. Disable studio material model. Use natural glass response, realistic table reflections, and non-clinical specular behavior.'
      : (hasReference
        ? 'MATERIAL ENGINE: glass-priority rendering with realistic refraction and internal liquid density visibility. CLOSURE_FROM_REFERENCE_ONLY: no cork/cage/cap substitution.'
        : 'MATERIAL ENGINE: glass-priority rendering with realistic refraction, micro-specular highlights, natural edge glow, subtle bottle-thickness distortion, and internal liquid density visibility. If cork is visible, preserve natural cork grain with subtle imperfections.'),
    !manualWineConfigured && moodModifier && moodModifier !== 'None' ? `PREMIUM MODIFIER: ${moodModifier}.` : '',
    manualWineConfigured ? 'AUTO_WINE_ARCHETYPE_FORCE_DISABLED: Manual wine configuration is active. Disable STUDIO_VISUAL_INTENT wine-premium auto force, disable WINE_PRESTIGE_MODIFIER auto injection, disable auto cork inference, disable auto sparkling archetype inference.' : '',
    'HARD DISABLES: splash engine disabled, studio product motion disabled, splash physics engine disabled, radial splash spread disabled, droplet fragmentation logic disabled, ecommerce compression framing disabled, aggressive conversion square crop disabled, hyper-clinical lighting disabled, and splash-shot fallback disabled.',
    'LOCKS: GEOMETRY_LOCK=true. LABEL_LOCK=true. TEXT_PRESERVATION=strict. Preserve exact product proportions and label fidelity.',
  ].filter(Boolean);

  return {
    prompt: normalizePromptText(parts.join(' ')),
    mode: 'HERO_NEUTRAL',
    splashMode: undefined,
    randomSeed: 'wine-prestige',
  };
}

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
        'base-impact splash wrapping around the lower section of the product with coherent droplet separation',
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
        'BEACH FOAM: tropical Caribbean daylight scene with turquoise seawater and clean white sand.',
        'Product is grounded on wet white sand near shoreline with thin retreating foam contours and crisp micro-droplets.',
        'Keep it premium and minimal; do not bury the product in foam and never block the label zone.',
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
        'CHEERS_HAND_REALISM: hands must look real with natural skin texture, believable knuckles/fingernails, and physically plausible finger contact.',
        'Reject doll-like, mannequin-like, waxy, or CGI-looking hands.',
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
        ? `SCATTER BED: ${detail}. Build a dense ingredient bed where the product sits partially embedded (not hovering), with realistic compression/contact zones. Keep it premium and controlled, and keep the label area unobstructed.`
        : 'SCATTER BED: dense textured ingredient bed (e.g., beans, seeds, sand/shells, crystals, stones) with the product partially embedded into it; bed wraps around the lower base with realistic contact shadows/compression; no hovering, no messy clutter, label unobstructed.';
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

function resolveSplashShotConfig(state: ProductStudioState): ProductStudioState['photoModeConfig']['splashShot'] {
  const splashShot = state.photoModeConfig?.splashShot;
  if (!splashShot) {
    return {
      splashMedium: 'Liquid',
      motionIntensity: 'Dynamic',
      freezeMoment: 'Mid-splash',
      productStability: 'Slight interaction',
    };
  }
  const motionIntensity = String(splashShot.motionIntensity || '').trim();
  const splashAdMode = motionIntensity === 'Explosive';
  if (splashAdMode) {
    if (splashShot.productStability !== 'Fully grounded') {
      console.warn('[SPLASH_AD] ProductStability override: forcing Fully grounded for Explosive Splash Shot.');
    }
    return {
      ...splashShot,
      productStability: 'Fully grounded',
    };
  }
  const dynamicSplashMode = motionIntensity === 'Dynamic';
  if (!dynamicSplashMode || splashShot.productStability !== 'Fully grounded') {
    return splashShot;
  }
  return {
    ...splashShot,
    productStability: 'Slight interaction',
  };
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
      {
        const splash = resolveSplashShotConfig(state);
        const splashAdMode = splash.motionIntensity === 'Explosive';
        const splashAdPeakMode = splashAdMode && splash.freezeMoment === 'Peak';
        add('splashMedium', splash.splashMedium);
        add('motionIntensity', splash.motionIntensity);
        add('freezeMoment', splash.freezeMoment);
        add('productStability', splash.productStability);
        add('splashAdProfile', splashAdMode ? 'SPLASH_AD' : 'Standard Splash');
        add('maxVerticalDisplacement', splashAdPeakMode ? '15% frame height' : '10% frame height');
        add('splashFlow', 'Single dominant directional flow');
      }
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
  if (isWinePrestigeMode(state)) {
    return buildWinePrestigeLegacyPrompt(state);
  }

  const randomizer = createRandomizer();
  const splashShotConfig = resolveSplashShotConfig(state);
  const splashAdMode =
    String(state.photoMode || '').trim() === 'Splash Shot' &&
    splashShotConfig.motionIntensity === 'Explosive';
  const splashAdPeakMode = splashAdMode && splashShotConfig.freezeMoment === 'Peak';
  const authorities = resolveAuthorities(state);
  const visualIntent = authorities.visualIntent === 'clinical' || authorities.visualIntent === 'luxury'
    ? 'conversion'
    : authorities.visualIntent;
  const energyLevel = resolveEnergyLevel(state);
  const isCampaignIntent = authorities.visualIntent === 'campaign';
  const controlTier = String((state as any).controlTier || '').trim().toLowerCase() === 'pro' ? 'pro' : 'basic';
  const isProTier = controlTier === 'pro';
  const isBasicTier = !isProTier;
  const isProModeActive = isProTier;
  const isConversionSquareOptimized = authorities.composition.isConversionSquareOptimized;
  console.log('VISUAL_INTENT_ACTIVE =', authorities.visualIntent);
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
    (state.cameraSystem === 'macro' ? 'Macro lens' : 'DSLR / mirrorless');
  const uiAngleLabel =
    String((state as any).cameraUiAngleLabel || '').trim() ||
    (state.angle === 'top_down' ? 'Top-down flat lay' : state.angle === 'detail_closeup' ? 'Detail close-up' : state.angle === 'eye_level' ? 'Eye level product' : '45° hero');
  const uiDistanceLabel =
    String((state as any).cameraUiDistanceLabel || '').trim() ||
    (state.distance === 'macro' ? 'Macro' : state.distance === 'tight' ? 'Tight' : 'Standard');
  const uiRotationLabel =
    String((state as any).cameraUiRotationLabel || '').trim() ||
    (state.rotation > 0 ? `${state.rotation}°` : '0°');
  const uiFramingLabel =
    String((state as any).cameraUiFramingLabel || '').trim() ||
    (state.framing === 'rule_of_thirds' ? 'Rule of thirds' : 'Centered hero');

  const mapCameraSystemToPrompt = (system: ProductStudioState['cameraSystem'], systemLabel: string): string => {
    const normalized = systemLabel.toLowerCase();
    if (normalized.includes('macro lens')) return 'professional macro lens camera setup';
    if (normalized.includes('telephoto')) return 'professional telephoto compression camera setup';
    if (system === 'macro') return 'professional macro lens camera';
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
      eye_level: 'eye-level product view',
      '45_hero': '45-degree hero angle',
      top_down: 'top-down flat lay',
      detail_closeup: 'detail close-up',
      low_angle: 'low angle hero view',
      high_angle: 'high angle overview',
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
      tight: 'tight hero crop',
      standard: 'standard framing',
      wide: 'wide framing',
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
      centered_hero: 'centered hero composition',
      rule_of_thirds: 'rule-of-thirds composition',
      left_negative: 'left-aligned composition with negative space',
      right_negative: 'right-aligned composition with negative space',
      grid_ready: 'grid-ready composition',
    };
    return byState[framing] || 'centered hero composition';
  };

  const mapRotationToPrompt = (rotation: ProductStudioState['rotation'], rotationLabel: string): string => {
    if (rotationLabel) return rotationLabel.replace(/\s+/g, '').endsWith('°') ? rotationLabel : `${rotationLabel}°`;
    if (rotation > 0) return `${rotation}°`;
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
      merged.sand = merged.sand || 'Clean';
      merged.water_color = merged.water_color || 'turquoise';
      merged.atmosphere = merged.atmosphere || 'sunny tropical Caribbean';
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
  const customIngredientsStructured =
    Array.isArray((state as any).customIngredients) && (state as any).customIngredients.length > 0
      ? ((state as any).customIngredients as CanonicalSceneIngredient[])
      : parseCustomIngredientsText(customIngredientsText);
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

  const resolvedMotion = authorities.motion;
  const resolvedProductState =
    resolvedMotion === 'opened'
      ? 'Opened'
      : resolvedMotion === 'dispensed'
        ? 'Dispensing'
        : resolvedMotion === 'pouring' || resolvedMotion === 'falling' || resolvedMotion === 'spilled'
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
        : state.qualityProfile === 'clinical'
          ? 'OUTPUT PROFILE: Clinical. Preserve sterile precision, strict clarity, and product truth.'
          : 'OUTPUT PROFILE: Luxury Campaign. Preserve campaign-grade polish and premium material rendering.';
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
        if (state.photoMode === 'Underwater Split') {
          splashMode = 'UNDERWATER_SPLIT';
          scene = [
            'Split-level underwater composition with a physically coherent waterline crossing the product body.',
            'Upper section remains in bright clean daylight air; lower section is clearly submerged in luminous aqua water.',
            'Realistic meniscus and refraction at the waterline, with clear optical transition between above-water and underwater zones.',
            'Underwater caustics on the lower environment, subtle volumetric rays, and crisp bubbles clustered near submerged product edges.',
            'Keep water clean and premium (no murk, no green cast, no cloudy haze) and preserve label readability as perspective allows.',
          ].join(' ');
        } else {
          const splash = buildSplashShotScene(sceneInput);
          scene = splash.scene;
          splashMode = splash.splashMode;
        }
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
      .replace(/restrained directional backwash/gi, 'controlled directional backwash with source-defined vectors')
      .replace(/shallow sea foam and clean micro-droplets only near the base/gi, 'coherent foam mass and physically grouped droplets near the liquid source')
      .replace(/one dominant splash sheet wrapping behind\/around the product/gi, 'controlled splash mass originating from a defined impact plane with collision-resolved flow');
  }
  if (/(splash|foam|pool water|underwater)/i.test(String(state.photoMode || ''))) {
    scene = scene
      .replace(/one dominant splash sheet wrapping behind\/around the product/gi, 'controlled splash mass originating from a defined impact plane with bounded displacement')
      .replace(/directional splash sheet with high-speed droplet separation/gi, 'source-defined splash flow with collision-resolved droplet dispersion');
  }

  const lightingStyleOverrideText = (() => {
    if (state.photoMode === 'Underwater Split') {
      return [
        'Bright split-level daylight is mandatory: clean sunlit air above water and luminous aqua underwater light below.',
        'Underwater zone must show natural caustics and soft volumetric rays; avoid dark/deep-sea mood and avoid clinical studio softbox look.',
      ].join(' ');
    }
    if (state.photoMode === 'Beach Foam Splash') {
      return [
        'Bright tropical sun daylight is mandatory: directional sun, vivid turquoise-water bounce, and warm white-sand fill.',
        'No clinical softbox look, no flat studio-neutral light, preserve lively coastal atmosphere.',
      ].join(' ');
    }
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
    if (state.photoMode === 'Beach Foam Splash' && lighting === 'clinical-softbox') return '';
    if (state.photoMode === 'Underwater Split' && lighting === 'clinical-softbox') return '';
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
        'Two controlled prism spot sources with crisp directional falloff, visible split highlights on glass edges, and subtle refraction caustics near transparent boundaries. Prism effect must be visibly present in the final frame (not optional). CRITICAL: The light sources themselves (spotlights, rings, stands) must remain OFF-CAMERA and invisible. Only their lighting effects should be visible.',
      '3-Point Beauty Dish':
        'Classic three-point beauty setup with clean key/fill/back separation and polished commercial skin-safe reflections. CRITICAL: Lighting equipment must remain OFF-CAMERA and invisible.',
      'Softbox Wrap':
        'Large softbox wrap with broad diffuse highlights and smooth edge transitions. CRITICAL: Softbox hardware must remain OFF-CAMERA and invisible.',
      'Hard Edge Gels':
        'Directional hard-light edges with controlled gel accents and high-contrast shadow geometry. CRITICAL: Light sources must remain OFF-CAMERA and invisible.',
      'Backlit Acrylic':
        'Backlit translucent planes with clean edge glow and controlled specular response. CRITICAL: Lighting hardware must remain OFF-CAMERA and invisible.',
      'High-Speed Splash Rig':
        'High-speed strobe freeze behavior with crisp droplets and minimal motion blur. CRITICAL: Strobe lights must remain OFF-CAMERA and invisible.',
      'Gradient Cyclorama':
        'Seamless cyclorama gradient wash with clean tonal rolloff and no banding. CRITICAL: Lighting equipment must remain OFF-CAMERA and invisible.',
    };
    const cue = rigCues[rig] || '';
    return [`Lighting rig: ${rig}. Use this rig as the authoritative lighting setup. NEVER render the physical lighting equipment (spotlights, softboxes, ring lights, light stands) in the frame - only their lighting effects on the product and scene.`, cue].filter(Boolean).join(' ');
  })();

  const lightColorTempText = (() => {
    if (isCampaignIntent || !isProModeActive) return '';
    
    // Check for custom accent/gel light color first
    const customColor = String((state as any).customLightColor || '').trim().toUpperCase();
    const intensity = Number((state as any).accentLightIntensity ?? 50);
    if (customColor && customColor !== '#FFFFFF' && /^#[0-9A-F]{6}$/.test(customColor)) {
      const intensityDesc = intensity <= 20 ? 'subtle' : intensity <= 40 ? 'moderate' : intensity <= 60 ? 'strong' : intensity <= 80 ? 'dramatic' : 'intense';
      return `Accent light gel: ${customColor} at ${intensity}% intensity (${intensityDesc}). Add colored edge/rim lighting with this gel color on the product edges and contours, creating ${intensityDesc} colored highlights and atmospheric glow. Main key light remains neutral. CRITICAL: The gel light sources must remain OFF-CAMERA and invisible - only their colored lighting effects should appear on the product.`;
    }
    
    // Temperature presets removed - only gel colors supported
    return '';
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
      ? [lightingRigOverrideText, lightColorTempText].filter(Boolean).join(' ')
      : [
        lightingStyleOverrideText,
        isCampaignIntent ? '' : userLightingStyleText,
        lightingRigOverrideText,
        lightColorTempText,
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
      eye_level: 'Eye level product',
      '45_hero': '45° hero',
      top_down: 'Top-down flat lay',
      detail_closeup: 'Detail close-up',
      low_angle: 'Low angle power',
      high_angle: 'High angle overview',
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
  const disableSquareLateralSpreadForSplitWater = authorities.composition.allowVerticalDominance;
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
    splashAdMode
      ? 'product-first asymmetric splash composition with one dominant directional flow; disable centered symmetry; preserve hero readability with breathing room for lateral energy'
      :
    !isCampaignIntent
      ? (disableSquareLateralSpreadForSplitWater
        ? 'centered dominance with vertical subject emphasis and natural edge-to-edge water continuation; no neutral side fill, no white lateral bands, no artificial padding'
        : isConversionSquareOptimized
        ? 'centered dominance with mild crop bias and controlled horizontal environmental spread; avoid narrow vertical subject bias and artificial lateral emptiness'
        : 'centered hero composition')
      : mode === 'INGREDIENT_FLAT_LAY'
      ? 'grid-ready composition'
      : effectiveMacroMode
        ? 'full-bleed macro crop with natural edge detail, no side-fill extension'
      : campaignFraming;
  const forcedCameraDistance =
    splashAdMode
      ? 'standard framing with additional breathing room for splash propagation'
      :
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
    const effectDrivenConversionMode =
      mode === 'SPLASH_SHOT' ||
      mode === 'FOAM_AND_TEXTURE' ||
      state.photoMode === 'Gel Smear Editorial' ||
      state.photoMode === 'Beach Foam Splash' ||
      state.photoMode === 'Underwater Split' ||
      state.photoMode === 'Pool Water' ||
      state.photoMode === 'Citrus Fresh Flat Lay' ||
      state.photoMode === 'Stones & Crystals Flat Lay' ||
      state.photoMode === 'Dried Citrus Earth' ||
      state.photoMode === 'Cheers (Hands Clink)';

    if (authorities.visualIntent === 'campaign') {
      return [
        'VISUAL INTENT: Campaign Energy Mode.',
        'Natural directional sunlight with environmental bounce and specular rim highlights.',
        'Dynamic framing is allowed; non-centered compositions are preferred where physically coherent.',
        'Motion style: physically coherent directional motion with defined source vectors and collision-resolved liquid behavior.',
        'Atmosphere tools enabled: lens micro droplets, sun flare, foreground blur, environmental depth layering.',
        'HARD LOCKS (MANDATORY): LABEL LOCK, PRODUCT DESIGN LOCK, PRODUCT_STATE_MOTION static.',
        'FRAME INTEGRITY LOCK (MANDATORY): no letterbox/pillarbox bars, no mirrored edge extension, no duplicated side panels, and no blurred side-fill bands.',
      ].join(' ');
    }
    if (authorities.visualIntent === 'clinical') {
      return [
        'VISUAL INTENT: Clinical Precision Mode.',
        'Use sterile controlled lighting behavior, evidence-grade legibility, and strict geometry consistency.',
        'Preserve label readability and product truth with physically coherent optical behavior.',
      ].join(' ');
    }
    if (authorities.visualIntent === 'luxury') {
      return [
        'VISUAL INTENT: Luxury Campaign Mode.',
        'Use premium campaign art direction with controlled expressiveness, atmospheric depth layering, and physically coherent realism.',
        'Preserve hero dominance and label readability while allowing refined variation.',
      ].join(' ');
    }
    if (state.photoMode === 'Beach Foam Splash') {
      return [
        'VISUAL INTENT: Conversion Strict Mode.',
        'Use bright tropical sun daylight as authoritative lighting behavior (not softbox), with white-sand bounce and turquoise-water reflections.',
        'Maintain centered hero dominance while preserving natural beach atmosphere and premium realism.',
        'Enforce strict readability, bounded foam behavior, and physically coherent shoreline interaction.',
      ].join(' ');
    }
    if (state.photoMode === 'Underwater Split') {
      return [
        'VISUAL INTENT: Conversion Strict Mode.',
        'Use split-level daylight water optics as authoritative behavior: bright air above surface, luminous aqua underwater below, coherent waterline refraction.',
        'Maintain centered hero dominance while preserving energetic hydration atmosphere and premium realism.',
        'Enforce strict readability, bounded bubble density, and physically coherent caustic behavior.',
      ].join(' ');
    }
    {
      return [
        'VISUAL INTENT: Conversion Strict Mode.',
        effectDrivenConversionMode
          ? 'Use premium ad-grade lighting behavior with vibrant but controlled contrast, tactile highlights, and energetic depth.'
          : 'Use Softbox Wrap as authoritative lighting behavior with controlled reflections.',
        isConversionSquareOptimized
          ? (disableSquareLateralSpreadForSplitWater
            ? 'Square composition rule: allow vertical subject dominance. Do not artificially expand horizontal environment. Water and atmosphere must extend naturally to all edges. No neutral side fill, no white lateral bands, no artificial padding.'
            : isBasicTier
            ? 'For 1:1 output, keep centered product dominance with mild crop bias and controlled horizontal environmental spread to avoid narrow vertical subject bias and artificial side emptiness.'
            : 'For 1:1 output, keep centered product dominance with mild crop bias and controlled horizontal environmental spread to avoid narrow vertical subject bias and artificial side emptiness; maintain 45-degree hero camera, slightly closer distance, and 0-degree rotation. Respect user-selected pro lens when provided.')
          : (isBasicTier
            ? 'Keep centered product dominance with stable hero perspective and controlled reflections.'
            : 'Keep centered hero composition, 45-degree hero camera, and 0-degree rotation. Respect user-selected pro lens when provided.'),
        effectDrivenConversionMode
          ? 'Allow controlled expressive atmosphere, richer micro-contrast, and premium tactile realism while preserving clean label readability and physical coherence.'
          : 'Enforce strict splash minimalism, clinical reflection control, and conservative variation density.',
      ].join(' ');
    }
  })();

  const beachFoamProfileText = (() => {
    if (!beachFoamProfile) return '';
    if (beachFoamProfile === 'BeachFoam_Conversion') {
      return [
        'BeachFoam_Conversion profile:',
        'sunny Caribbean daytime is mandatory: turquoise water, clean white sand, lively coastal atmosphere, controlled backwash, strict readability.',
      ].join(' ');
    }
    return [
      'BeachFoam_Campaign profile:',
      'golden-hour optional sunlight, source-defined foam behavior, coherent shoreline interaction, dynamic wave break with bounded spread, environmental depth layering, non-centered framing allowed.',
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
  const splashPhysicsBlock =
    isSplashPhysicsContext(String(state.photoMode || ''), authorities)
      ? buildSplashPhysicsModel(authorities, {
        splashAdMode,
        freezeMoment: splashShotConfig.freezeMoment,
      })
      : '';
  const resolvedSpecialEffects = (() => {
    const provided = Array.isArray((state as any).specialEffects)
      ? ((state as any).specialEffects as string[]).filter(effect => String(effect || '').trim().length > 0)
      : [];
    if (provided.length > 0) return provided;
    const modeKey = String(state.photoMode || '').trim().toLowerCase();
    if (modeKey === 'splash shot') return ['Splash Shot'];
    if (modeKey === 'condensation droplets') return ['Condensation Droplets'];
    if (modeKey === 'underwater split') return ['Underwater Split'];
    if (modeKey === 'pool water') return ['Pool Water'];
    if (modeKey.includes('foam')) return ['Foam'];
    return [];
  })();

  const effectHyperProDirectiveText = (() => {
    const effectDrivenMode =
      mode === 'SPLASH_SHOT' ||
      mode === 'FOAM_AND_TEXTURE' ||
      state.photoMode === 'Gel Smear Editorial' ||
      state.photoMode === 'Beach Foam Splash' ||
      state.photoMode === 'Underwater Split' ||
      state.photoMode === 'Pool Water' ||
      state.photoMode === 'Textured Bed / Scatter Base';
    const hasEffects = resolvedSpecialEffects.length > 0;
    if (!effectDrivenMode && !hasEffects) return '';

    return [
      'EFFECT ART DIRECTION (HYPER-PRO AD): premium commercial impact is mandatory.',
      'Build a high-end advertising look with deliberate visual energy, clean depth layering, and strong but controlled highlight/contrast shaping.',
      'Effects must feel art-directed (not random): one dominant motion/vector language, coherent secondary accents, and clear hero product dominance.',
      'Preserve tactile micro-detail in liquid/foam/texture edges, keep scene lively and cinematic, and avoid flat lifeless lighting.',
      'No chaotic clutter, no generic stock look, no CGI/plastic artifacts, and never sacrifice label readability.',
    ].join(' ');
  })();

  const referenceLookDirectiveText = (() => {
    const photoMode = String(state.photoMode || '').trim();
    if (!photoMode) return '';

    if (photoMode === 'Beach Foam Splash') {
      return [
        'REFERENCE LOOK LOCK: tropical ad-campaign beach still.',
        'Clean white sand, bright turquoise water horizon, sculpted sea-foam mounds near product base, and crisp high-noon sunlight.',
        'Keep product planted and hero-centered with energetic but controlled summer vibe.',
      ].join(' ');
    }

    if (photoMode === 'Underwater Split') {
      return [
        'REFERENCE LOOK LOCK: premium split-waterline skincare ad.',
        'Upper air zone bright and minimal; underwater zone luminous cyan-blue with clear caustics and elegant bubbles.',
        'Waterline crossing the product must be the visual anchor, with photoreal refraction and clean label legibility.',
      ].join(' ');
    }

    if (photoMode === 'Splash Shot') {
      return [
        'REFERENCE LOOK LOCK: high-speed beverage splash campaign still.',
        'Single dominant liquid burst, frozen droplets with crystal edge acuity, premium neutral/pastel backdrop, and aggressive product hero focus.',
      ].join(' ');
    }

    if (photoMode === 'Citrus Fresh Flat Lay') {
      return [
        'REFERENCE LOOK LOCK: citrus-led commercial flat lay.',
        'Saturated fresh orange/lemon slices, controlled droplet accents, clean top-down rhythm, and bright premium color contrast.',
      ].join(' ');
    }

    if (photoMode === 'Cheers (Hands Clink)') {
      return [
        'REFERENCE LOOK LOCK: summer lifestyle cheers moment.',
        'Cropped hands only, shallow pool/beach context, flash-frozen clink droplets, and brand-first framing with vibrant vacation energy.',
        'Hands must be real-photo quality: natural asymmetry, natural skin micro-texture, correct finger count, and realistic grip pressure on the container.',
      ].join(' ');
    }

    if (photoMode === 'Sand Palm Shadows' || photoMode === 'Sunlit Stone Editorial') {
      return [
        'REFERENCE LOOK LOCK: sunlit editorial still-life with architectural shadows.',
        'Hard directional sunlight, sculptural palm/shape shadows, tactile mineral/sand textures, and clean premium composition.',
      ].join(' ');
    }

    if (photoMode === 'Warm Window Wood') {
      return [
        'REFERENCE LOOK LOCK: warm golden-hour window scene.',
        'Natural sunlight through glass, soft dust sparkle, warm wood texture, and intimate premium lifestyle realism.',
      ].join(' ');
    }

    if (photoMode === 'Gel Smear Editorial') {
      return [
        'REFERENCE LOOK LOCK: minimalist editorial serum smear shot.',
        'One intentional smear with tactile depth and premium specular control, on a clean textured surface with strong product contrast.',
      ].join(' ');
    }

    if (photoMode === 'Stones & Crystals Flat Lay') {
      return [
        'REFERENCE LOOK LOCK: calm wellness flat lay with natural stones/crystals.',
        'Neutral linen/stone base, curated spacing, soft premium light, and tactile grounded material realism.',
      ].join(' ');
    }

    if (photoMode === 'Dried Citrus Earth') {
      return [
        'REFERENCE LOOK LOCK: earthy citrus botanical ad still.',
        'Sun-baked warm base, dried citrus and leaves as curated accents, hard sunlight shadows, and clean commercial styling.',
      ].join(' ');
    }

    if (photoMode === 'Pool Water') {
      return [
        'REFERENCE LOOK LOCK: luxury poolside refresh visual.',
        'Clear aqua water, crisp reflections/caustics, bright summer light, and controlled droplets for a clean energetic hydration feel.',
      ].join(' ');
    }

    return '';
  })();

  const canonicalScene: CanonicalScene = {
    outputProfile: state.qualityProfile,
    photoType: environmentModeActive ? 'Environment' : 'Photo Studio',
    composition: forcedCameraFraming,
    photoMode: String(state.photoMode || ''),
    productStateMotion: String(authorities.motion || 'static'),
    productStructure: String(state.definition?.physical?.kind || 'standard'),
    environmentSettings: environmentModeActive
      ? `${String(state.environmentContext?.macro || '').trim()} ${String(state.environmentContext?.micro || '').trim()}`.trim()
      : 'studio',
    physicalPlacement: placementResolution.resolvedPlacement,
    physicalProperties: `${state.physicalScaleLabel || 'medium-tabletop'} / packaging ${state.packagingMode || 'without-box'}`,
    defaultIngredients: String(effectiveSuggestedProps || '')
      .split('|')
      .map(part => part.trim())
      .filter(Boolean),
    customIngredients: customIngredientsStructured,
    visualWorld: mode,
    lighting: lightingOverrideText || lightingStyleOverrideText,
    specialEffects: resolvedSpecialEffects,
    productInteraction: String(state.interaction || 'none'),
    viewpointVantage: viewpointDirectiveText || mapAngleToPrompt(effectiveAngleState, effectiveAngleLabelResolved),
    cameraFraming: `${forcedCameraAngle}; ${forcedCameraDistance}; ${forcedCameraFraming}`,
    constraintSuffix: 'Preserve existing constraint engine, locked compositions, label lock, product lock, square integrity, and physical properties.',
  };
  const atmosphere = resolveAtmosphere(canonicalScene);
  const validation = validateAtmosphere(canonicalScene, atmosphere);
  const criticalValidationErrors = validation.errors.filter(error => error.severity === 'critical');
  const warningValidationErrors = validation.errors.filter(error => error.severity === 'warning');
  if (criticalValidationErrors.length > 0) {
    console.error('Atmosphere validation failed (critical)', criticalValidationErrors);
    throw new Error(criticalValidationErrors.map(error => error.code).join(','));
  }
  if (warningValidationErrors.length > 0) {
    console.warn('Atmosphere validation warnings', warningValidationErrors);
  }
  if (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_STUDIO_DEBUG === 'true') {
    const debugTree = buildAtmosphereDebugTree(canonicalScene, atmosphere);
    console.log('STUDIO_DEBUG_TREE', JSON.stringify(debugTree, null, 2));
  }

  const parts = [
    buildBaseContext({
      allowStudio: mode === 'ACRYLIC_BLOCKS',
      qualityProfile: state.qualityProfile,
      visualIntent: authorities.visualIntent === 'campaign' ? 'campaign' : 'conversion',
    }),
    visualIntentDirectiveText,
    energyDirectiveText,
    beachFoamProfileText,
    effectHyperProDirectiveText,
    referenceLookDirectiveText,
    photoModeEnvironmentAdaptationText,
    scene,
    placementResolution.promptFragment,
    physicsResolution.promptFragment,
    buildCompositionAuthorityBlock(authorities.composition),
    buildMotionAuthorityBlock(authorities.motion),
    splashPhysicsBlock,
    splashAdMode
      ? 'SPLASH_AD_VISUAL_PRIORITY: Kinetic authority, directional dominance, volumetric contrast, and energy hierarchy take precedence. Keep label readable without compressing splash energy.'
      : '',
    buildProductStateBlock(authorities.motion),
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
      qualityProfile: state.qualityProfile,
      authority: authorities,
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
      qualityProfile: state.qualityProfile,
      authority: authorities,
      ...(lightingOverrideText ? { override: { text: lightingOverrideText } } : {}),
      ...(splashAdMode ? { splashAdMode: true, splashAdPeakMode } : {}),
      strictRigLock: strictLightingRigLock,
    }),
    lightCoherenceBlock,
    underwaterRefractionBlock,
    proPhotographerLockText,
    finishOverrideText,
    creativityOverrideText,
    legacyCreativityTraceText,
    strictStudioBranding ? '' : buildMaterialsWithProfile(mode, randomizer, state.qualityProfile, authorities),
    prismRefractionText,
    isCampaignIntent ? '' : buildUltraRealStrictBlock(Boolean(state.ultraRealStrict), state.qualityProfile, authorities),
    atmosphere,
    macroFullBleedLockText,
    strictStudioBranding
      ? ''
      : buildRandomizationRules(
        mode === 'INGREDIENT_STACK' || mode === 'INGREDIENT_FLAT_LAY' ? 'ingredientStack' : 'default',
        state.qualityProfile,
        {
          lensLocked: isCampaignIntent ? false : (isProModeActive && Boolean(String((state as any).lens || '').trim())),
          lightingLocked: isCampaignIntent ? false : (isProModeActive && Boolean(String((state as any).lightingRig || '').trim())),
          finishLocked: isCampaignIntent ? false : (isProModeActive && Boolean(String((state as any).finish || '').trim())),
          propsLocked: isCampaignIntent ? false : !explicitSecondaryPropsText,
        },
        authorities
      ),
    isCampaignIntent ? '' : buildQualityEnforcers(state.qualityProfile),
  ].filter(Boolean);

  const { prompt: finalPrompt } = assemblePrompt(parts);

  return {
    prompt: finalPrompt,
    mode,
    splashMode,
    randomSeed: randomizer.seed,
  };
}
