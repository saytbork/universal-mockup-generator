import type { StudioUIState } from '../types/studioTypes.ts';

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
      ? 'DEPTH_LEVEL_CONTROL: Subtle -> light immersion, shallow embedding, minimal wrap around base.'
      : depthRaw === 'immersive'
        ? 'DEPTH_LEVEL_CONTROL: Immersive -> deep immersion with dense wrap partially surrounding the lower body of the product.'
        : 'DEPTH_LEVEL_CONTROL: Balanced -> moderate immersion with visible ingredient wrap around base.';

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
  // eslint-disable-next-line no-console
  console.log('[DEBUG][buildPhotoModeDynamic] EXECUTED. photoMode=', photoMode, '| photoModeDynamicSettings=', JSON.stringify(settings));

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
      return result;
    }
    if (isTexturedBed) {
      return buildTexturedBedContract(state, {});
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
      return result;
    }
    if (isTexturedBed) {
      return buildTexturedBedContract(state, {});
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
  return result;
}
