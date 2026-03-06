import { MaterialState, type StudioUIState } from '../types/studioTypes.ts';

/**
 * Per-photo-mode atmosphere descriptors emitted when no user dynamic settings are present.
 * These restore the visual richness layer that dynamic settings would otherwise provide.
 * Keyed by exact photoMode string (case-sensitive, must match PHOTO_MODE_SCENE_MAP keys).
 */
const PHOTO_MODE_ATMOSPHERE_FALLBACKS: Record<string, string> = {
  // Hero Landing Page and Color Pop Hero backgrounds are fully owned by buildStudioBackground
  // via buildWorld. Atmosphere entries here cover depth/lighting/separation only — no hex
  // colors, no gradient descriptions (those live exclusively in buildStudioBackground).
  'Hero Landing Page':
    'Soft atmospheric depth separation behind the product. Subtle falloff from center to edges emphasizing silhouette. Copy-safe negative space preserved for overlay text.',
  'Color Pop Hero':
    'Strong silhouette separation with radial atmospheric depth field. High-contrast studio lighting that isolates the product from the background. No environmental props or textures.',
  'Pool Water':
    'Product positioned near clear swimming pool water surface. Sunlight refracting through water creating natural caustic patterns on pool floor and product base. Subtle ripples and reflective highlights around the product. Clean turquoise water environment with realistic refraction, wet reflections, and natural light dispersion.',
};

/**
 * Per-mode setting sanitizers — override dangerous/incompatible values from UI controls
 * before they reach the prompt string.
 *
 * Pool Water is a calm-photography mode. Any energy/level values that imply dynamic splash
 * physics must be replaced with their calm equivalents. These overrides are deterministic:
 * they fire regardless of what value the user selected in the UI.
 */
const POOL_WATER_FORBIDDEN_ENERGY = new Set(['splashy', 'violent', 'dynamic', 'energetic', 'turbulent']);

function sanitizePoolWaterSettings(settings: Record<string, string>): Record<string, string> {
  const out = { ...settings };

  // waterEnergy: any value implying dynamics → Calm
  const energyKey = Object.keys(out).find((k) => k.toLowerCase() === 'waterenergy');
  if (energyKey) {
    if (POOL_WATER_FORBIDDEN_ENERGY.has(String(out[energyKey]).toLowerCase())) {
      out[energyKey] = 'Calm';
    }
  } else {
    // No waterEnergy set at all — inject the correct default
    out['waterEnergy'] = 'Calm';
  }

  // waterLevel: 'Split' implies the product cuts through the waterline like an underwater split
  // shot — wrong for Pool Water. Correct value is SurfaceContact (product resting at surface).
  const levelKey = Object.keys(out).find((k) => k.toLowerCase() === 'waterlevel');
  if (levelKey) {
    const val = String(out[levelKey]).toLowerCase();
    if (val === 'split' || val === 'impact' || val === 'submerged') {
      out[levelKey] = 'SurfaceContact';
    }
  } else {
    out['waterLevel'] = 'SurfaceContact';
  }

  return out;
}

function buildTexturedBedContract(state?: StudioUIState, settings?: Record<string, string>): string {
  const ingredients = String(state?.ingredientObjects || '').trim();
  const depthRaw = String(settings?.depthLevel || '').trim().toLowerCase();

  const depthDirective =
    depthRaw === 'subtle'
      ? 'DEPTH_LEVEL_CONTROL: Subtle -> light immersion, shallow embedding, minimal wrap around base, with product fully visible and label unobstructed.'
      : depthRaw === 'immersive'
        ? 'DEPTH_LEVEL_CONTROL: Immersive -> deep immersion into the user ingredient with dense wrap around the lower body. Product must still remain clearly visible and readable; ingredient wrap is concentrated at the base/lower perimeter only.'
        : 'DEPTH_LEVEL_CONTROL: Balanced -> moderate immersion with visible ingredient wrap around base while preserving full product readability.';

  const ingredientAuthority = ingredients || '<MISSING_USER_DEFINED_INGREDIENTS>';

  const parts = [
    'REFERENCE_PRODUCT_LOCK: The uploaded product image is the single source of truth. Reproduce the exact same object with zero redesign. Preserve exact geometry, silhouette, cap shape, cap color, neck height, proportions, material finish, surface texture, label layout, typography, alignment, and color relationships. Do not reinterpret, regenerate, restyle, substitute category defaults, or redesign packaging.',
    'STUDIO_VISUAL_INTENT: Conversion-grade commercial clarity with strict label readability.',
    'TEXTURED_BED_REQUIREMENT: User-defined ingredients are mandatory. No default materials, no substitutions, no generic textures, and no category-based assumptions.',
    `TEXTURED_BED_INGREDIENT_AUTHORITY: The ingredient bed must be built exclusively from: ${ingredientAuthority}.`,
    'TEXTURED_BED_PROHIBITED_DEFAULTS: No coffee beans. No seeds. No sand. No stones. No crystals. No powders. No fillers. No decorative substitutes.',
    'TEXTURED_BED_CAMERA_LOCK: True top-down flat lay only (90 degrees overhead). Camera optical axis must be perpendicular to the surface. No perspective tilt. No hero angle. No eye-level viewpoint. Override any global camera angle settings.',
    'TEXTURED_BED_IMMERSION_RULE: Product must be visibly immersed into the ingredient bed. Base must sink into ingredients with natural perimeter wrap, visible compression, contact shadow, and ambient occlusion. No floating. No hovering. No artificial on-top placement.',
    depthDirective,
    'LABEL_CLEARANCE_RULE: Label zone must remain fully readable at all times. No ingredient obstruction over the primary label area.',
    'PRODUCT_CLEANLINESS: Container, cap, pump, and label must remain clean and dry. No residue, drips, foam, liquid streaks, or decorative attachments.',
    'VISUAL_DISCIPLINE: No clutter. No unrelated props. No visual noise. Keep composition clean and controlled.',
    'LIGHTING_PROFILE: Soft, even commercial top-light for flat lay with label-priority separation and natural shadow falloff.',
    'MATERIAL_BEHAVIOR: Ingredients must look real, tactile, and physically plausible. No synthetic CGI-like surfaces.',
    'COMPOSITION: Centered flat lay composition. Product fully visible, no cropping, and scene extends naturally to all frame edges.',
  ];

  if (!ingredients) {
    parts.push('TEXTURED_BED_VALIDATION: Missing user-defined ingredients. Do not generate this mode until ingredients are provided.');
  }

  return parts.join(' ');
}

function buildGelSmearEditorialContract(): string {
  return [
    'GEL_SMEAR_EDITORIAL_SCENE: Premium editorial composition featuring a tactile cosmetic gel smear on a clean stone surface.',
    'GEL_SMEAR_MATERIAL_TRUTH: Smear is a real material application, not a background texture. Must show physical thickness, visible edges, micro-air bubbles, glossy highlights, and subtle translucency.',
    'GEL_SMEAR_SHAPE_DISCIPLINE: Intentional aesthetic smear shape with smooth curved swipe, visible brush/spatula marks, and thicker edge ridges at the smear end.',
    'PRODUCT_PLACEMENT_RULE: Product placed adjacent to smear with controlled interaction only. Allowed placements: leaning near smear, resting beside smear, touching smear edge, or casting shadow over smear.',
    'PRODUCT_PROTECTION_RULE: Smear must not cover product label. No residue on container. No dripping from product.',
    'SURFACE_RULE: Neutral premium stone/concrete/cosmetic slab with subtle texture visibility. No background gradients.',
    'LIGHTING_RULE: Editorial cosmetic lighting with controlled specular highlights on gel surface and soft directional shaping for gloss/depth.',
    'COMPOSITION_RULE: Editorial beauty composition. Smear occupies one zone. Product occupies hero zone. Balanced negative space. No props. No clutter.',
  ].join(' ');
}

const MATERIAL_BEHAVIOR: Record<MaterialState, Record<string, string | boolean>> = {
  [MaterialState.FOAM]: {
    physics: 'volumetric bubbles',
    accumulation: true,
    wetSurface: true,
    bubbleVariation: true,
  },
  [MaterialState.CREAM]: {
    physics: 'viscous cosmetic mass',
    flow: 'slow',
    glossySurface: true,
  },
  [MaterialState.GEL]: {
    physics: 'translucent elastic material',
    refraction: true,
    smoothSurface: true,
  },
  [MaterialState.POWDER]: {
    physics: 'dry particles',
    scattering: true,
    matteSurface: true,
  },
};

type MaterialSceneConfig = {
  sceneEnvironment: string;
  surfaceMaterial: string;
  materialState: MaterialState;
};

function resolveMaterialState(state?: StudioUIState, settings?: Record<string, string>): MaterialState {
  const rawMaterial = String(state?.materialState || settings?.materialState || '').trim().toLowerCase();
  const rawTextureType = String(settings?.textureType || '').trim().toLowerCase();
  const raw = rawMaterial || rawTextureType;
  if (raw === MaterialState.CREAM) return MaterialState.CREAM;
  if (raw === MaterialState.GEL) return MaterialState.GEL;
  if (raw === MaterialState.POWDER) return MaterialState.POWDER;
  return MaterialState.FOAM;
}

function getFoamPreset(preset = 'cosmetic'): string {
  if (preset === 'shower') {
    return [
      'STUDIO_WORLD: shower foam environment.',
      'ENVIRONMENT_CONTEXT: wet ceramic surface.',
      'FOAM_MATERIAL: rich shampoo foam accumulating on wet ceramic surfaces with dense bubble clusters.',
      'FOAM_DENSITY: heavy.',
      'FOAM_STRUCTURE: thick foam piles with layered bubble networks.',
      'FOAM_VARIATION: mixed macro and micro bubble structures with visible surface tension.',
      'FOAM_PLACEMENT: foam spreads across the wet surface forming natural clusters around product base.',
      'WET_SURFACE_DETAIL: visible water droplets and wet reflections.',
      'PRODUCT_GROUNDING: product rests within dense foam accumulation.',
      'PHYSICAL_BEHAVIOR: foam obeys gravity and natural liquid residue behavior.',
    ].join(' ');
  }

  if (preset === 'macro') {
    return [
      'STUDIO_WORLD: macro foam texture environment.',
      'ENVIRONMENT_CONTEXT: close-in cosmetic set.',
      'SURFACE_TYPE: premium cosmetic slab.',
      'FOAM_MATERIAL: macro bubble foam structures with visible surface tension and large bubble clusters.',
      'FOAM_DENSITY: medium.',
      'FOAM_STRUCTURE: large bubble clusters with cohesive foam bridges.',
      'FOAM_VARIATION: macro and micro bubble mixing with realistic clustering.',
      'FOAM_PLACEMENT: foam accumulation around product base with controlled spread.',
      'PRODUCT_GROUNDING: product rests naturally within foam clusters.',
      'FOAM_CONTACT: foam touches product base without covering label.',
      'FOCUS_DISTANCE: macro.',
      'PHYSICAL_BEHAVIOR: foam maintains cohesive bubble structures under gravity and surface tension.',
    ].join(' ');
  }

  return [
    'STUDIO_WORLD: premium cosmetic foam environment.',
    'ENVIRONMENT_CONTEXT: luxury bathroom vanity or ceramic sink basin.',
    'SURFACE_TYPE: marble vanity or ceramic surface.',
    'FOAM_MATERIAL: dense cosmetic foam with creamy bubble clusters.',
    'FOAM_DENSITY: medium-to-heavy accumulation.',
    'FOAM_STRUCTURE: layered foam mounds with clustered bubbles and soft peaks.',
    'FOAM_VARIATION: mixed macro and micro bubble sizes with visible surface tension.',
    'FOAM_PLACEMENT: foam accumulates naturally around the product base and spreads across surrounding surfaces.',
    'WET_SURFACE_DETAIL: subtle moisture and reflective wetness allowed.',
    'PRODUCT_GROUNDING: product rests naturally embedded within the foam layer.',
    'FOAM_CONTACT: foam surrounds the product base while keeping the label fully visible.',
    'PHYSICAL_BEHAVIOR: foam obeys gravity and surface tension forming natural accumulation patterns.',
    'FOAM_REALISM_CONSTRAINTS: foam accumulates in clusters, forms soft peaks, shows bubble-size variation, gathers in surface recesses, and never appears as flat noise texture.',
  ].join(' ');
}

function buildFoamWorld(settings?: Record<string, string>): string {
  const preset = String(settings?.foamPreset || '').trim().toLowerCase();
  if (preset === 'shower') return getFoamPreset('shower');
  if (preset === 'macro') return getFoamPreset('macro');
  return getFoamPreset('cosmetic');
}

function buildMaterialStateWorld(config: MaterialSceneConfig): string {
  const behavior = MATERIAL_BEHAVIOR[config.materialState];
  return [
    `SCENE_ENVIRONMENT: ${config.sceneEnvironment}.`,
    `SURFACE_MATERIAL: ${config.surfaceMaterial}.`,
    `MATERIAL_STATE: ${config.materialState}.`,
    `MATERIAL_BEHAVIOR_PROFILE: ${JSON.stringify(behavior)}.`,
  ].join(' ');
}

/**
 * Injects Photo Mode dynamic sub-settings (macroTightness, dropletMode, etc.)
 * into the V2 prompt. These come from the user's per-Photo-Mode controls in the UI.
 * Each key→value pair is emitted as a PHOTO_MODE_SETTING_<KEY>: <value> block.
 * Last-selection-wins: if the same key appears multiple times, the last write wins (guaranteed
 * by the Record<string,string> deduplication in toStudioV2State).
 *
 * When no user settings exist, emits a per-mode atmosphere fallback to preserve visual richness.
 * Pool Water settings are sanitized to prevent CGI-style splash artifacts.
 */
export function buildPhotoModeDynamic(state?: StudioUIState): string {
  const settings = state?.photoModeDynamicSettings;
  const photoMode = String(state?.photoMode || '').trim();
  const isPoolWater = photoMode === 'Pool Water';
  const isTexturedBed = photoMode === 'Textured Bed / Scatter Base';
  const isGelSmearEditorial = photoMode === 'Gel Smear Editorial';
  const isFoamTexture = photoMode === 'Foam & Texture';
  // eslint-disable-next-line no-console
  console.log('[DEBUG][buildPhotoModeDynamic] EXECUTED. photoMode=', photoMode, '| photoModeDynamicSettings=', JSON.stringify(settings));

  if (isFoamTexture) {
    const settingsMap =
      settings && typeof settings === 'object'
        ? (Object.fromEntries(
            Object.entries(settings).filter(([, v]) => String(v).trim())
          ) as Record<string, string>)
        : {};
    const materialState = resolveMaterialState(state, settingsMap);
    const sceneConfig: MaterialSceneConfig = {
      sceneEnvironment: materialState === MaterialState.FOAM ? 'bathroom vanity' : 'cosmetic studio set',
      surfaceMaterial: materialState === MaterialState.FOAM ? 'marble' : 'premium cosmetic slab',
      materialState,
    };
    const baseScene = buildMaterialStateWorld(sceneConfig);
    const materialScene =
      materialState === MaterialState.FOAM
        ? buildFoamWorld(settingsMap)
        : [
            'STUDIO_WORLD: material-driven cosmetic environment.',
            `ENVIRONMENT_CONTEXT: ${sceneConfig.sceneEnvironment}.`,
            `SURFACE_TYPE: ${sceneConfig.surfaceMaterial}.`,
            `MATERIAL_STATE: ${materialState}.`,
            'PRODUCT_GROUNDING: product remains grounded with physically plausible contact and no floating.',
            `PHYSICAL_BEHAVIOR: ${String(MATERIAL_BEHAVIOR[materialState].physics)}.`,
          ].join(' ');
    const result = [baseScene, materialScene].join(' ');
    // eslint-disable-next-line no-console
    console.log('[DEBUG][buildPhotoModeDynamic] emitted (foam texture mode):', JSON.stringify(result));
    return result;
  }

  if (!settings || typeof settings !== 'object') {
    if (isPoolWater) {
      // Pool Water with no user settings: inject correct calm defaults + atmosphere
      const sanitized = sanitizePoolWaterSettings({});
      const settingParts = Object.entries(sanitized).map(([key, value]) => {
        const safeKey = key.toUpperCase().replace(/\s+/g, '_').replace(/[^A-Z0-9_]/g, '');
        return `PHOTO_MODE_SETTING_${safeKey}: ${String(value).trim()}.`;
      });
      const atmosphere = PHOTO_MODE_ATMOSPHERE_FALLBACKS['Pool Water'];
      const result = [`PHOTO_MODE_DYNAMIC_CONTROLS: ${settingParts.join(' ')}`, `PHOTO_MODE_ATMOSPHERE: ${atmosphere}`].join(' ');
      // eslint-disable-next-line no-console
      console.log('[DEBUG][buildPhotoModeDynamic] emitted (pool water defaults):', JSON.stringify(result));
      return result;
    }
    // No user-set UI controls — emit atmosphere fallback for modes that need it
    const fallback = PHOTO_MODE_ATMOSPHERE_FALLBACKS[photoMode];
    if (fallback) {
      const result = `PHOTO_MODE_ATMOSPHERE: ${fallback}`;
      // eslint-disable-next-line no-console
      console.log('[DEBUG][buildPhotoModeDynamic] emitted (atmosphere fallback):', JSON.stringify(result));
      if (isTexturedBed) {
        return [result, buildTexturedBedContract(state, {})].join(' ');
      }
      if (isGelSmearEditorial) {
        return [result, buildGelSmearEditorialContract()].join(' ');
      }
      return result;
    }
    if (isTexturedBed) {
      return buildTexturedBedContract(state, {});
    }
    if (isGelSmearEditorial) {
      return buildGelSmearEditorialContract();
    }
    return '';
  }

  const rawEntries = Object.entries(settings).filter(([, v]) => String(v).trim());

  if (rawEntries.length === 0) {
    if (isPoolWater) {
      const sanitized = sanitizePoolWaterSettings({});
      const settingParts = Object.entries(sanitized).map(([key, value]) => {
        const safeKey = key.toUpperCase().replace(/\s+/g, '_').replace(/[^A-Z0-9_]/g, '');
        return `PHOTO_MODE_SETTING_${safeKey}: ${String(value).trim()}.`;
      });
      const atmosphere = PHOTO_MODE_ATMOSPHERE_FALLBACKS['Pool Water'];
      const result = [`PHOTO_MODE_DYNAMIC_CONTROLS: ${settingParts.join(' ')}`, `PHOTO_MODE_ATMOSPHERE: ${atmosphere}`].join(' ');
      // eslint-disable-next-line no-console
      console.log('[DEBUG][buildPhotoModeDynamic] emitted (pool water defaults, empty settings):', JSON.stringify(result));
      return result;
    }
    // Settings object present but empty — same fallback logic
    const fallback = PHOTO_MODE_ATMOSPHERE_FALLBACKS[photoMode];
    if (fallback) {
      const result = `PHOTO_MODE_ATMOSPHERE: ${fallback}`;
      // eslint-disable-next-line no-console
      console.log('[DEBUG][buildPhotoModeDynamic] emitted (atmosphere fallback, empty settings):', JSON.stringify(result));
      if (isTexturedBed) {
        return [result, buildTexturedBedContract(state, {})].join(' ');
      }
      if (isGelSmearEditorial) {
        return [result, buildGelSmearEditorialContract()].join(' ');
      }
      return result;
    }
    if (isTexturedBed) {
      return buildTexturedBedContract(state, {});
    }
    if (isGelSmearEditorial) {
      return buildGelSmearEditorialContract();
    }
    return '';
  }

  // Build settings map, then sanitize for Pool Water before emitting
  const settingsMap: Record<string, string> = Object.fromEntries(rawEntries);
  const finalSettings = isPoolWater ? sanitizePoolWaterSettings(settingsMap) : settingsMap;

  const parts = Object.entries(finalSettings).map(([key, value]) => {
    const safeKey = key.toUpperCase().replace(/\s+/g, '_').replace(/[^A-Z0-9_]/g, '');
    const safeValue = String(value).trim();
    return `PHOTO_MODE_SETTING_${safeKey}: ${safeValue}.`;
  });

  const result = `PHOTO_MODE_DYNAMIC_CONTROLS: ${parts.join(' ')}`;
  // eslint-disable-next-line no-console
  console.log('[DEBUG][buildPhotoModeDynamic] emitted:', JSON.stringify(result));
  if (isTexturedBed) {
    return [result, buildTexturedBedContract(state, finalSettings)].join(' ');
  }
  if (isGelSmearEditorial) {
    return [result, buildGelSmearEditorialContract()].join(' ');
  }
  return result;
}
