import type {
  ProductStudioState,
  WineAction,
  WineEnvironmentPreset,
  WineLightingTone,
  WineMoodModifier,
  WinePourStyle,
  WineStyleArchetype,
  WineEnvironmentV4,
  WineLuxuryIntensity,
  WineCompositionMode,
  WineMicroVariation,
} from './types';

export const WINE_ENVIRONMENT_PRESETS: WineEnvironmentPreset[] = [
  'Vineyard Golden Hour',
  'Oak Barrel Cellar',
  'Fine Dining Table',
  'Dark Luxury Studio',
];

export const WINE_LIGHTING_TONES: WineLightingTone[] = [
  'Warm Lateral',
  'Golden Ambient',
  'Cellar Dramatic',
  'Candle Intimate',
];

export const WINE_MODIFIERS: WineMoodModifier[] = [
  'None',
  'Vintage Film Grain',
  'Terroir Mood Tone',
  'Deep Burgundy Contrast Boost',
  'Soft Barrel Ambient Haze',
  'Elegant Reflection Layer',
];

export const WINE_ACTION_OPTIONS: WineAction[] = ['static-presentation', 'controlled-pour'];

export const WINE_POUR_STYLE_OPTIONS: WinePourStyle[] = [
  'slow-ribbon',
  'mid-flow-elegance',
  'peak-glass-impact',
];

const normalize = (value: unknown): string => String(value || '').trim().toLowerCase();

export function isWinePrestigeMode(state: Pick<ProductStudioState, 'category' | 'contextPreset' | 'visualProfile'>): boolean {
  const category = normalize(state.category);
  const contextPreset = normalize(state.contextPreset);
  const visualProfile = normalize(state.visualProfile);
  return (
    category === 'wine' ||
    contextPreset === 'winery / vineyard' ||
    visualProfile === 'wine-prestige'
  );
}

export function isWinePrestigeV2Mode(
  state: Pick<ProductStudioState, 'visualProfile' | 'wineAction'>
): boolean {
  return normalize(state.visualProfile) === 'wine-prestige' && normalize(state.wineAction) === 'controlled-pour';
}

export function getWineEnvironmentNarrative(preset: string): string {
  switch (preset) {
    case 'Vineyard Golden Hour':
      return 'WINE_ENVIRONMENT: Vineyard Golden Hour. Golden hour vineyard landscape softly out of focus, long vine rows creating natural leading lines toward the horizon, warm backlight grazing the grape leaves, subtle atmospheric haze in the distance, shallow depth of field, natural lens compression, realistic sunlight bloom, slight organic imperfections in foliage, high-end commercial wine photography style.';
    case 'Oak Barrel Cellar':
      return 'WINE_ENVIRONMENT: Oak Barrel Cellar. Moody underground wine cellar environment, soft directional side lighting cutting across aged oak barrels, subtle dust particles suspended in the air, deep shadow falloff, textured stone surfaces barely visible in darkness, cinematic low-key lighting, natural color absorption from wood tones, premium editorial wine photography mood.';
    case 'Fine Dining Table':
      return 'WINE_ENVIRONMENT: Fine Dining Table. Refined fine-dining setting with shallow depth of field, dark walnut table surface with soft natural grain reflections, diffused ambient lighting from the side, elegant background bokeh from distant candlelight, subtle linen texture slightly out of focus, high-end restaurant commercial photography aesthetic.';
    case 'Dark Luxury Studio':
      return 'WINE_ENVIRONMENT: Dark Luxury Studio. High-end black studio setup with seamless backdrop, controlled softbox lighting creating gentle gradient falloff, subtle edge rim light defining bottle silhouette, deep shadows with smooth tonal transitions, realistic light reflections on glass surface, luxury product photography style, ultra-clean yet dimensional.';
    case 'Winery / Vineyard':
      return 'WINE_ENVIRONMENT: Winery / Vineyard. Golden hour vineyard landscape softly out of focus, long vine rows creating natural leading lines toward the horizon, warm backlight grazing the grape leaves, subtle atmospheric haze in the distance, shallow depth of field, natural lens compression, realistic sunlight bloom, high-end commercial wine photography style.';
    default:
      return 'WINE_ENVIRONMENT: Dark Luxury Studio. High-end black studio setup with seamless backdrop, controlled softbox lighting creating gentle gradient falloff, subtle edge rim light defining bottle silhouette, deep shadows with smooth tonal transitions, realistic light reflections on glass surface, luxury product photography style, ultra-clean yet dimensional.';
  }
}

// ============================================================================
// WINE STYLE ARCHETYPE SYSTEM
// ============================================================================

export const WINE_STYLE_ARCHETYPES: WineStyleArchetype[] = [
  'Minimal Editorial Studio',
  'Ultra Minimal Black Luxury',
  'Backlit Premium Studio',
  'Moody Wood Editorial',
  'Macro Label Branding',
  'Action Pour Photography',
  'Cinematic Vineyard',
];

/**
 * Visual-only state patch applied when a style archetype is selected.
 * Physics fields (closure, carbonation, serveState, wineType) are NEVER included.
 * The caller must merge this over the current state — it does NOT replace.
 *
 * Fields that can conflict with Wine Engine physics rules are guarded at
 * application time via `isSafeToApplyArchetypeField()`.
 */
export type WineArchetypePatch = {
  contextPreset?: string;
  wineLightingTone?: WineLightingTone;
  wineMoodModifier?: WineMoodModifier;
  wineAction?: WineAction;
  composition?: string;
  lightStyle?: string;
  negativeSpace?: string;
  ambientLighting?: string;
  // Narrative-only enrichment injected at prompt-assembly time
  _archetypeNarrative: string;
};

const ARCHETYPE_PATCHES: Record<WineStyleArchetype, WineArchetypePatch> = {
  'Minimal Editorial Studio': {
    contextPreset: 'Dark Luxury Studio',
    wineLightingTone: 'Warm Lateral',
    wineMoodModifier: 'None',
    composition: 'centered',
    lightStyle: 'soft',
    negativeSpace: 'subtle',
    _archetypeNarrative:
      'WINE_STYLE_ARCHETYPE: Minimal Editorial Studio. ' +
      'Premium beige seamless background, soft lateral lighting with high-key but controlled exposure, ' +
      'clean pedestal or cube surface, warm editorial grading, eye-level camera, centered composition, ' +
      'medium-tight framing. Commercial wine photography — restrained, elegant, brand-forward.',
  },
  'Ultra Minimal Black Luxury': {
    contextPreset: 'Dark Luxury Studio',
    wineLightingTone: 'Warm Lateral',
    wineMoodModifier: 'Elegant Reflection Layer',
    composition: 'centered',
    lightStyle: 'contrast',
    negativeSpace: 'intentional',
    _archetypeNarrative:
      'WINE_STYLE_ARCHETYPE: Ultra Minimal Black Luxury. ' +
      'Deep charcoal seamless background, controlled directional light with high micro-contrast, ' +
      'crisp glass reflections, tight centered framing, neutral-cool grading. ' +
      'Modern premium winery aesthetic — architectural, precise, luxurious.',
  },
  'Backlit Premium Studio': {
    contextPreset: 'Dark Luxury Studio',
    wineLightingTone: 'Golden Ambient',
    wineMoodModifier: 'Terroir Mood Tone',
    composition: 'centered',
    lightStyle: 'shadow-play',
    negativeSpace: 'subtle',
    _archetypeNarrative:
      'WINE_STYLE_ARCHETYPE: Backlit Premium Studio. ' +
      'Strong backlight creating glow-through amber bottle effect, soft front fill, warm dark gradient background, ' +
      'emphasis on internal liquid luminosity, slight low-angle camera, medium framing. ' +
      'Translucent bottle photography with natural light diffusion through the glass.',
  },
  'Moody Wood Editorial': {
    contextPreset: 'Oak Barrel Cellar',
    wineLightingTone: 'Cellar Dramatic',
    wineMoodModifier: 'Vintage Film Grain',
    composition: 'flatlay',
    lightStyle: 'contrast',
    negativeSpace: 'none',
    _archetypeNarrative:
      'WINE_STYLE_ARCHETYPE: Moody Wood Editorial. ' +
      'Top-down camera angle, dark real wood surface with visible grain texture, hard lateral light, ' +
      'high contrast with deep shadows, minimal props, flat lay composition. ' +
      'Wine storytelling editorial — raw, textural, atmospheric.',
  },
  'Macro Label Branding': {
    contextPreset: 'Dark Luxury Studio',
    wineLightingTone: 'Warm Lateral',
    wineMoodModifier: 'None',
    composition: 'centered',
    lightStyle: 'clinical',
    negativeSpace: 'subtle',
    _archetypeNarrative:
      'WINE_STYLE_ARCHETYPE: Macro Label Branding. ' +
      'FRAMING: The COMPLETE wine bottle must be visible in frame from base to neck — no cropping. ' +
      'Camera is positioned at medium-close distance: the bottle fills approximately 70–80% of the frame height. ' +
      'The label zone is the visual focal point — sharp focus locked on the label, grazing side light revealing label texture and embossing. ' +
      'Shallow depth of field with soft background falloff, neutral clean background. ' +
      'ONE bottle, ONE closure (detached and lying flat if open), no duplicate objects. ' +
      'Label-first wine photography — typographic detail, brand clarity, premium packaging showcase.',
  },
  'Action Pour Photography': {
    contextPreset: 'Dark Luxury Studio',
    wineLightingTone: 'Cellar Dramatic',
    wineMoodModifier: 'Deep Burgundy Contrast Boost',
    composition: 'thirds',
    lightStyle: 'contrast',
    negativeSpace: 'subtle',
    _archetypeNarrative:
      'WINE_STYLE_ARCHETYPE: Action Pour Photography. ' +
      'Dynamic controlled-pour moment, high-speed crisp lighting look, shallow depth of field, ' +
      'high contrast between liquid and clean neutral background, motion-frozen wine arc. ' +
      'Premium action wine photography — energy, precision, drama.',
  },
  'Cinematic Vineyard': {
    contextPreset: 'Vineyard Golden Hour',
    wineLightingTone: 'Golden Ambient',
    wineMoodModifier: 'Terroir Mood Tone',
    composition: 'thirds',
    lightStyle: 'soft',
    negativeSpace: 'subtle',
    _archetypeNarrative:
      'WINE_STYLE_ARCHETYPE: Cinematic Vineyard. ' +
      'Golden hour vineyard backdrop, warm natural lighting with lens compression, ' +
      'soft cinematic grading, subtle organic props compatible with bottle scene, ' +
      'shallow depth of field preserving bottle sharpness against blurred landscape. ' +
      'Terroir-driven cinematic wine photography — place, warmth, provenance.',
  },
};

/**
 * Physics fields that must NEVER be overridden by archetype patches.
 * These are protected by Wine Engine V4 structural lock rules.
 */
const PHYSICS_PROTECTED_FIELDS = new Set([
  'wineClosureType',
  'carbonationLevel',
  'wineType',
  'wineBottleState',
  'wineGlassMode',
  'wineServeAmount',
  'serveVolumeMode',
  'wineEngineVersion',
]);

/**
 * Returns true if the given field name is safe to apply from an archetype patch.
 * Physics-protected fields always return false.
 */
export function isSafeToApplyArchetypeField(field: string): boolean {
  return !PHYSICS_PROTECTED_FIELDS.has(field);
}

/**
 * Returns the visual-only state patch for a given archetype.
 * Only includes fields that pass the physics safety check.
 * Returns null if archetype is unrecognized or null.
 */
export function getWineArchetypePatch(
  archetype: WineStyleArchetype | string | null | undefined
): WineArchetypePatch | null {
  if (!archetype) return null;
  const patch = ARCHETYPE_PATCHES[archetype as WineStyleArchetype];
  if (!patch) return null;

  // Filter out any physics-protected fields that might drift into the patch
  const safe: Partial<WineArchetypePatch> = {};
  for (const [k, v] of Object.entries(patch)) {
    if (k === '_archetypeNarrative' || isSafeToApplyArchetypeField(k)) {
      (safe as Record<string, unknown>)[k] = v;
    }
  }
  return safe as WineArchetypePatch;
}

/**
 * Returns the prompt narrative string for a given archetype, or empty string.
 * Used by the prompt router to append archetype context to the wine prompt.
 */
export function getWineArchetypeNarrative(
  archetype: WineStyleArchetype | string | null | undefined
): string {
  if (!archetype) return '';
  const patch = ARCHETYPE_PATCHES[archetype as WineStyleArchetype];
  return patch?._archetypeNarrative ?? '';
}

/**
 * For Action Pour Photography archetype: only apply wineAction='controlled-pour'
 * if the current wine physics state is compatible (not sealed, not crown-cap locked).
 * Returns true if the pour action may be safely set.
 */
export function isActionPourCompatible(
  state: Pick<ProductStudioState, 'wineBottleState' | 'wineClosureType'>
): boolean {
  const bottleState = normalize(state.wineBottleState ?? '');
  const closure = normalize(state.wineClosureType ?? '');
  // Crown-cap implies sparkling/carbonated — pour is physics-unsafe
  if (closure === 'crown-cap') return false;
  // A sealed bottle cannot pour
  if (bottleState === 'sealed') return false;
  return true;
}

// ============================================================================
// WINE AESTHETIC PROFILE SYSTEM
// Internal non-UI bias layer — prompt-only, no state fields.
// Values are 0–1 normalized unless otherwise noted.
// All values are soft biases only — manual camera/lighting overrides supersede.
// ============================================================================

export type WineAestheticProfile = {
  /** Surface and glass reflection intensity. 0=flat/matte, 1=maximum specular */
  reflectionIntensity?: number;
  /** Local contrast between fine details — label texture, glass edge, neck ring. 0=flat, 1=high micro-contrast */
  microContrast?: number;
  /** Label texture and embossing detail push. 0=default, 1=maximum texture reveal */
  labelTextureBoost?: number;
  /** Internal liquid luminosity / glow-through bias. 0=opaque, 1=maximum translucency glow */
  liquidGlowBias?: number;
  /** Background separation softness. 0=in-focus/flat, 1=maximum bokeh separation */
  depthOfFieldBias?: number;
  /** Shadow transition character. soft=gradual rolloff, neutral=standard, crisp=hard edge */
  shadowRollOff?: 'soft' | 'neutral' | 'crisp';
  /** Specular highlight sharpness on bottle/glass surface. 0=diffused, 1=pinpoint */
  highlightSharpness?: number;
  /** Edge vignette strength. 0=none, 1=heavy peripheral darkening */
  vignetteBias?: number;
};

const ARCHETYPE_AESTHETIC_PROFILES: Record<WineStyleArchetype, WineAestheticProfile> = {
  'Minimal Editorial Studio': {
    reflectionIntensity: 0.35,
    microContrast: 0.45,
    labelTextureBoost: 0.6,
    liquidGlowBias: 0.2,
    depthOfFieldBias: 0.25,
    shadowRollOff: 'soft',
    highlightSharpness: 0.4,
    vignetteBias: 0.1,
  },
  'Ultra Minimal Black Luxury': {
    reflectionIntensity: 0.75,
    microContrast: 0.85,
    labelTextureBoost: 0.7,
    liquidGlowBias: 0.15,
    depthOfFieldBias: 0.2,
    shadowRollOff: 'crisp',
    highlightSharpness: 0.9,
    vignetteBias: 0.35,
  },
  'Backlit Premium Studio': {
    reflectionIntensity: 0.5,
    microContrast: 0.4,
    labelTextureBoost: 0.3,
    liquidGlowBias: 0.9,
    depthOfFieldBias: 0.3,
    shadowRollOff: 'soft',
    highlightSharpness: 0.35,
    vignetteBias: 0.5,
  },
  'Moody Wood Editorial': {
    reflectionIntensity: 0.2,
    microContrast: 0.8,
    labelTextureBoost: 0.55,
    liquidGlowBias: 0.1,
    depthOfFieldBias: 0.15,
    shadowRollOff: 'crisp',
    highlightSharpness: 0.65,
    vignetteBias: 0.6,
  },
  'Macro Label Branding': {
    reflectionIntensity: 0.3,
    microContrast: 0.7,
    labelTextureBoost: 0.95,
    liquidGlowBias: 0.1,
    depthOfFieldBias: 0.7,
    shadowRollOff: 'neutral',
    highlightSharpness: 0.5,
    vignetteBias: 0.15,
  },
  'Action Pour Photography': {
    reflectionIntensity: 0.6,
    microContrast: 0.75,
    labelTextureBoost: 0.4,
    liquidGlowBias: 0.55,
    depthOfFieldBias: 0.5,
    shadowRollOff: 'crisp',
    highlightSharpness: 0.8,
    vignetteBias: 0.25,
  },
  'Cinematic Vineyard': {
    reflectionIntensity: 0.4,
    microContrast: 0.5,
    labelTextureBoost: 0.45,
    liquidGlowBias: 0.35,
    depthOfFieldBias: 0.75,
    shadowRollOff: 'soft',
    highlightSharpness: 0.3,
    vignetteBias: 0.4,
  },
};

/**
 * Returns the internal aesthetic bias profile for a given archetype.
 * Returns null if archetype is unrecognized or null.
 * This profile is NEVER exposed to UI — prompt-only.
 */
export function getWineAestheticProfile(
  archetype: WineStyleArchetype | string | null | undefined
): WineAestheticProfile | null {
  if (!archetype) return null;
  return ARCHETYPE_AESTHETIC_PROFILES[archetype as WineStyleArchetype] ?? null;
}

/**
 * Converts a WineAestheticProfile into a structured prompt segment string.
 *
 * Injection order contract:
 *   1. WINE_STYLE_ARCHETYPE narrative  (already in wineArchetypeNarrative)
 *   2. WINE_AESTHETIC_PROFILE          ← this function's output
 *   3. PHYSICAL_REALISM guardrail      (buildWineMinimalGuardrail)
 *   4. Wine V4 STRUCTURAL LOCK         (in physics block, assembled before this call)
 *
 * Manual camera/lighting overrides in v2State supersede all bias values because
 * they are applied to the physics/camera segments which the model treats as
 * hard constraints — this segment carries no constraint language.
 *
 * Returns empty string if profile is null or has no meaningful values.
 */
export function buildWineAestheticSegment(profile: WineAestheticProfile | null): string {
  if (!profile) return '';

  const parts: string[] = [];

  if (profile.liquidGlowBias !== undefined && profile.liquidGlowBias > 0.5) {
    parts.push(
      `liquid luminosity bias: ${profile.liquidGlowBias >= 0.8 ? 'strong internal glow, light transmitting through glass, backlit translucency' : 'moderate internal glow, slight liquid luminosity'}`
    );
  }

  if (profile.reflectionIntensity !== undefined) {
    if (profile.reflectionIntensity >= 0.7) {
      parts.push('surface reflections: high-intensity specular highlights, crisp glass and bottle reflections');
    } else if (profile.reflectionIntensity >= 0.4) {
      parts.push('surface reflections: controlled mid-intensity specular, natural glass sheen');
    } else {
      parts.push('surface reflections: minimal, restrained matte-leaning surface');
    }
  }

  if (profile.microContrast !== undefined) {
    if (profile.microContrast >= 0.75) {
      parts.push('micro-contrast: high local contrast on label edges, glass rim, and neck ring — fine detail acuity');
    } else if (profile.microContrast >= 0.45) {
      parts.push('micro-contrast: moderate local contrast, natural tonal separation');
    } else {
      parts.push('micro-contrast: low, smooth tonal transitions, painterly rendition');
    }
  }

  if (profile.labelTextureBoost !== undefined && profile.labelTextureBoost >= 0.5) {
    parts.push(
      profile.labelTextureBoost >= 0.85
        ? 'label texture: maximum detail — paper grain, embossing relief, foil texture all clearly rendered'
        : 'label texture: enhanced surface detail, subtle embossing and paper texture visible'
    );
  }

  if (profile.depthOfFieldBias !== undefined) {
    if (profile.depthOfFieldBias >= 0.65) {
      parts.push('depth of field: pronounced background bokeh, strong subject isolation, foreground elements soft');
    } else if (profile.depthOfFieldBias >= 0.3) {
      parts.push('depth of field: moderate separation, background recognizable but gently diffused');
    } else {
      parts.push('depth of field: deep focus, background rendered with clarity');
    }
  }

  if (profile.shadowRollOff) {
    const shadowMap: Record<NonNullable<WineAestheticProfile['shadowRollOff']>, string> = {
      soft: 'shadow rolloff: gradual — wide penumbra, smooth gradient from lit to shadow',
      neutral: 'shadow rolloff: standard falloff, natural shadow transition',
      crisp: 'shadow rolloff: hard-edge shadow terminator, minimal penumbra, graphic shadow definition',
    };
    parts.push(shadowMap[profile.shadowRollOff]);
  }

  if (profile.highlightSharpness !== undefined) {
    if (profile.highlightSharpness >= 0.75) {
      parts.push('highlights: pinpoint specular, tight catchlights, sharp specular pool on glass');
    } else if (profile.highlightSharpness >= 0.35) {
      parts.push('highlights: controlled softbox specular, oval catchlight, diffused edge');
    } else {
      parts.push('highlights: fully diffused, no specular hotspot, even surface luminance');
    }
  }

  if (profile.vignetteBias !== undefined && profile.vignetteBias > 0.1) {
    parts.push(
      profile.vignetteBias >= 0.45
        ? 'vignette: strong peripheral darkening, drawing attention to center subject'
        : 'vignette: subtle edge darkening, natural optical falloff'
    );
  }

  if (parts.length === 0) return '';

  return 'WINE_AESTHETIC_PROFILE: ' + parts.join('; ') + '.';
}

// ============================================================================
// WINE ARCHETYPE SYSTEM v4 — ENTERPRISE GENERATIVE ENGINE
// ============================================================================
// ARCHITECTURE PHILOSOPHY:
//   Layer 0 (PHYSICAL) — always wins. Bottle state is immutable.
//   Layer 1 (BRAND)    — label + geometry lock. Never overridden.
//   Layer 2 (LUXURY)   — intensity scaling: contrast, DOF, prop density, grading.
//   Layer 3 (ENV)      — 15 winery scenes with full optical model.
//   Layer 4 (CAMERA)   — focal length, hero angle, compression, mode.
//   Layer 5 (LIGHTING) — physically plausible. 8 rigs defined.
//   Layer 6 (MICRO)    — seasonal, surface, atmospheric, props. Entropy-controlled.
//   Layer 7 (ASSEMBLY) — strict hierarchy. No redundancy. No conflict.
// ============================================================================

// ─── LAYER 3: ENVIRONMENT ENGINE — 15 WINERY SCENES ───────────────────────

type EnvironmentSpec = {
  /** Short token used in WINE_ENV_V4 header */
  token: string;
  /** Natural light model present in this scene */
  lightModel: 'golden-directional' | 'blue-ambient' | 'diffused-soft' | 'low-key-cellar' | 'candlelight-point' | 'architectural-overhead' | 'controlled-softbox' | 'reflected-concrete' | 'marble-bounce' | 'backlight-glass';
  /** Primary surface/material context */
  materialContext: string;
  /** Background depth strategy */
  depthLogic: 'compressed-landscape' | 'bokeh-interior' | 'infinite-dark' | 'shallow-surface' | 'architectural-recede' | 'environmental-wrap';
  /** Atmospheric condition */
  atmosphere: 'clear' | 'haze' | 'mist' | 'dust-motes' | 'smoke' | 'none';
  /** Prestige intensity 0–1 (drives default luxury tier selection) */
  prestigeIntensity: number;
  /** Full narrative injected into prompt */
  narrative: string;
};

export const WINE_ENVIRONMENT_V4: Record<WineEnvironmentV4, EnvironmentSpec> = {
  'Vineyard Golden Hour': {
    token: 'VINEYARD_GOLDEN_HOUR',
    lightModel: 'golden-directional',
    materialContext: 'vine rows, dry soil, oak foliage',
    depthLogic: 'compressed-landscape',
    atmosphere: 'haze',
    prestigeIntensity: 0.78,
    narrative:
      'WINE_ENV_V4: VINEYARD_GOLDEN_HOUR. ' +
      'Late-afternoon golden light raking at 15° angle across vine rows. ' +
      'Long vine corridor compressed by 85mm equivalent perspective. ' +
      'Warm orange-amber sky gradient. Atmospheric haze in mid-distance. ' +
      'Shallow depth — rows dissolve into soft bokeh at 8m. ' +
      'Soil surface reflects diffused gold. Organic foliage imperfections visible in foreground. ' +
      'Lens bloom on direct sun contact. No artificial light.',
  },
  'Vineyard Blue Hour': {
    token: 'VINEYARD_BLUE_HOUR',
    lightModel: 'blue-ambient',
    materialContext: 'vine rows, evening sky, residual warmth on foliage',
    depthLogic: 'compressed-landscape',
    atmosphere: 'clear',
    prestigeIntensity: 0.85,
    narrative:
      'WINE_ENV_V4: VINEYARD_BLUE_HOUR. ' +
      'Civil twilight — 15 minutes post-sunset. Deep indigo sky with last warmth on horizon. ' +
      'Vine rows in near-silhouette. Cool blue ambient wraps the bottle. ' +
      'Long-exposure quality — still, silent, suspended. No direct sun. ' +
      'Faint ambient fill from sky. Bottle edge catches last horizon warmth. ' +
      'Ultra-premium editorial mood. 5500K ambient, 2200K rim.',
  },
  'Vineyard Misty Dawn': {
    token: 'VINEYARD_MISTY_DAWN',
    lightModel: 'diffused-soft',
    materialContext: 'morning mist, dew-covered vines, low fog layer',
    depthLogic: 'environmental-wrap',
    atmosphere: 'mist',
    prestigeIntensity: 0.82,
    narrative:
      'WINE_ENV_V4: VINEYARD_MISTY_DAWN. ' +
      'Pre-dawn mist layer 30cm above ground. Diffused white-grey ambient, zero hard shadows. ' +
      'Dew on vine leaves. Soft fog wraps the base of the bottle. ' +
      'Ethereal, painterly quality. Cool 6500K ambient. ' +
      'Vine row structure barely readable through mist. Silent terroir mood.',
  },
  'Oak Barrel Cellar': {
    token: 'OAK_BARREL_CELLAR',
    lightModel: 'low-key-cellar',
    materialContext: 'aged oak barrels, stone floor, brick arch',
    depthLogic: 'bokeh-interior',
    atmosphere: 'dust-motes',
    prestigeIntensity: 0.88,
    narrative:
      'WINE_ENV_V4: OAK_BARREL_CELLAR. ' +
      'Underground barrel room. Single directional sidelight at 45° — source: small aperture wall sconce. ' +
      'Deep shadow falloff. Dust motes suspended in beam. ' +
      'Aged oak texture in mid-ground, stone floor with moisture reflection. ' +
      'High local contrast. Warm 2700K key. Ambient fill from stone bounce: 0.08 intensity. ' +
      'Bottles in background rack out of focus. Cinematic low-key heritage.',
  },
  'Stone Cave Cellar': {
    token: 'STONE_CAVE_CELLAR',
    lightModel: 'low-key-cellar',
    materialContext: 'carved rock walls, gravel floor, iron rack',
    depthLogic: 'environmental-wrap',
    atmosphere: 'smoke',
    prestigeIntensity: 0.91,
    narrative:
      'WINE_ENV_V4: STONE_CAVE_CELLAR. ' +
      'Natural carved cave cellar. Rough limestone walls. Faint single candle behind subject. ' +
      'Maximum dark — fill ratio 1:12. Stone texture barely visible in deep shadow. ' +
      'Extreme prestige: minimal light, maximum drama. ' +
      'Gravel floor with moisture. Iron rack silhouette in background. ' +
      'Candlelight 1800K rim. Color temperature split: warm key, cool shadow.',
  },
  'Cathedral Wine Cellar': {
    token: 'CATHEDRAL_CELLAR',
    lightModel: 'architectural-overhead',
    materialContext: 'arched brick vaulting, terracotta tile, iron chandelier',
    depthLogic: 'architectural-recede',
    atmosphere: 'dust-motes',
    prestigeIntensity: 0.93,
    narrative:
      'WINE_ENV_V4: CATHEDRAL_CELLAR. ' +
      'Grand arched cellar with 6m vaulted ceiling. Architectural overhead from iron chandelier: 3200K warm. ' +
      'Terracotta tile floor with polished reflection zone. Brick arch recedes to vanishing point. ' +
      'Heroic scale — bottle small relative to architecture. ' +
      'Multiple arches creating depth layers. Dust motes in chandelier beam. ' +
      'Heritage, palatial, ancient luxury.',
  },
  'Fine Dining Table': {
    token: 'FINE_DINING_TABLE',
    lightModel: 'candlelight-point',
    materialContext: 'dark walnut table, white linen, crystal glassware',
    depthLogic: 'bokeh-interior',
    atmosphere: 'none',
    prestigeIntensity: 0.80,
    narrative:
      'WINE_ENV_V4: FINE_DINING_TABLE. ' +
      'Fine-dining setting. Dark walnut table with soft natural grain. White linen napkin partially visible. ' +
      'Ambient from distant candlelight: soft bokeh warm circles in background. ' +
      'Controlled fill from 45° left softbox: diffused, 3500K. ' +
      'Table surface reflects bottle base cleanly. Crystal glassware partially visible in background, out of focus. ' +
      'Intimate yet commercial — hospitality luxury.',
  },
  'Outdoor Terrace Dining': {
    token: 'OUTDOOR_TERRACE',
    lightModel: 'golden-directional',
    materialContext: 'stone terrace table, wrought iron chair, vineyard view',
    depthLogic: 'compressed-landscape',
    atmosphere: 'clear',
    prestigeIntensity: 0.75,
    narrative:
      'WINE_ENV_V4: OUTDOOR_TERRACE. ' +
      'Mediterranean stone terrace. Late afternoon directional sun from right at 30°. ' +
      'White limestone table surface creates clean bright reflection. ' +
      'Vineyard slope visible in soft-focus background. ' +
      'Wrought iron chair back partially visible. Sky: clear blue to warm horizon. ' +
      'Lifestyle-luxury — place, sun, conviviality.',
  },
  'Private Wine Library': {
    token: 'WINE_LIBRARY',
    lightModel: 'architectural-overhead',
    materialContext: 'dark wood shelving, leather-bound books, Persian rug',
    depthLogic: 'bokeh-interior',
    atmosphere: 'none',
    prestigeIntensity: 0.90,
    narrative:
      'WINE_ENV_V4: WINE_LIBRARY. ' +
      'Private collector\'s library. Dark mahogany shelving walls with wine collection. ' +
      'Recessed downlight overhead: tight cone, 2800K. ' +
      'Persian rug on stone floor. Leather-bound volumes in soft background bokeh. ' +
      'Deep, collector, connoisseur aesthetic. Maximum literary prestige. ' +
      'Surface: polished dark wood with specular reflection strip.',
  },
  'Dark Luxury Studio': {
    token: 'DARK_LUXURY_STUDIO',
    lightModel: 'controlled-softbox',
    materialContext: 'seamless charcoal backdrop, polished surface',
    depthLogic: 'infinite-dark',
    atmosphere: 'none',
    prestigeIntensity: 0.87,
    narrative:
      'WINE_ENV_V4: DARK_LUXURY_STUDIO. ' +
      'Controlled studio: charcoal seamless backdrop, polished acrylic or glass surface. ' +
      'Primary: large octabox at 45° camera-left, 5600K. Fill: 0.12 intensity right reflector. ' +
      'Edge rim from behind: 4000K thin strip, bottle silhouette separation. ' +
      'Gradient from neutral to deep shadow bottom. ' +
      'Ultra-clean, maximum product resolution, no environmental noise.',
  },
  'Concrete Architectural Studio': {
    token: 'CONCRETE_ARCHITECTURAL',
    lightModel: 'reflected-concrete',
    materialContext: 'raw concrete wall, steel shelf, industrial pedestal',
    depthLogic: 'shallow-surface',
    atmosphere: 'none',
    prestigeIntensity: 0.86,
    narrative:
      'WINE_ENV_V4: CONCRETE_ARCHITECTURAL. ' +
      'Raw concrete walls, visible formwork texture. ' +
      'Architectural overhead: long LED strip at ceiling, 4000K neutral. ' +
      'Concrete bounce fill: cool, diffused. Steel industrial shelf as surface. ' +
      'Modern, anti-romantic, brutalist luxury. ' +
      'High local contrast from textured walls. No warmth, no softness, precision only.',
  },
  'White Marble Studio': {
    token: 'WHITE_MARBLE_STUDIO',
    lightModel: 'marble-bounce',
    materialContext: 'Carrara marble surface, white wall, feather-soft ambient',
    depthLogic: 'infinite-dark',
    atmosphere: 'none',
    prestigeIntensity: 0.82,
    narrative:
      'WINE_ENV_V4: WHITE_MARBLE_STUDIO. ' +
      'Carrara marble surface with subtle grey veining. White gradient background. ' +
      'Overhead soft diffused light: 5500K. Marble surface generates natural bounce fill. ' +
      'Maximum surface detail on marble — cool tonal key. ' +
      'Glass and bottle specular reads cleanly against white. ' +
      'Minimal, high-fashion editorial luxury.',
  },
  'Rustic Estate Kitchen': {
    token: 'RUSTIC_ESTATE_KITCHEN',
    lightModel: 'golden-directional',
    materialContext: 'worn oak table, terracotta tiles, linen cloth',
    depthLogic: 'bokeh-interior',
    atmosphere: 'none',
    prestigeIntensity: 0.68,
    narrative:
      'WINE_ENV_V4: RUSTIC_ESTATE_KITCHEN. ' +
      'Old estate kitchen. Worn oak farmhouse table. Morning natural light from left window: 5800K. ' +
      'Terracotta tile floor visible. Linen cloth surface. Rustic props: dried herbs, ceramic bowl. ' +
      'Warm, authentic, artisanal. Soft shadow from window frame on surface. ' +
      'Provençal heritage luxury — family, land, tradition.',
  },
  'Glass Winery Modern': {
    token: 'GLASS_WINERY_MODERN',
    lightModel: 'backlight-glass',
    materialContext: 'floor-to-ceiling glass wall, vineyard view, concrete floor',
    depthLogic: 'architectural-recede',
    atmosphere: 'clear',
    prestigeIntensity: 0.89,
    narrative:
      'WINE_ENV_V4: GLASS_WINERY_MODERN. ' +
      'Contemporary winery with floor-to-ceiling glass wall overlooking vineyard. ' +
      'Backlight dominant: natural exterior at 6000K floods from behind. ' +
      'Bottle backlit — liquid glow activated. Interior concrete floor. ' +
      'Modern architectural lines. Vine rows through glass: soft exterior bokeh. ' +
      'Clean, modernist, estate prestige.',
  },
  'Hillside Terroir Landscape': {
    token: 'HILLSIDE_TERROIR',
    lightModel: 'golden-directional',
    materialContext: 'hillside rock, dry grass, panoramic sky',
    depthLogic: 'compressed-landscape',
    atmosphere: 'haze',
    prestigeIntensity: 0.77,
    narrative:
      'WINE_ENV_V4: HILLSIDE_TERROIR. ' +
      'Exposed hillside: bare rock, dry terraced vineyard soil. ' +
      'Wide panoramic sky dominates upper half of frame. ' +
      'Late afternoon: raking golden sidelight at 20°. ' +
      'No human-made structures. Pure terroir landscape. ' +
      'Bottle placed on natural rock surface. ' +
      'Elemental, origin, place-driven luxury.',
  },
};

// ─── LAYER 4: CAMERA ENGINE ────────────────────────────────────────────────

type CameraSpec = {
  focalLengthEquivalent: string;
  angleDescription: string;
  heroPositioning: string;
  compressionNote: string;
  narrative: string;
};

/** Hero angle variations. All maintain bottle as dominant subject. */
const WINE_CAMERA_ANGLES: Record<string, CameraSpec> = {
  'eye-level-centered': {
    focalLengthEquivalent: '85mm',
    angleDescription: 'Lens exactly level with label zone',
    heroPositioning: 'Bottle fills 60–70% of frame height, centered',
    compressionNote: 'Moderate background compression',
    narrative: 'CAMERA: 85mm equivalent, eye-level, centered. Bottle 65% frame height. Slight background compression.',
  },
  'low-hero': {
    focalLengthEquivalent: '85mm',
    angleDescription: '15° below label, looking up at neck',
    heroPositioning: 'Bottle dominates frame, neck extends toward upper third',
    compressionNote: 'Sky or ceiling elevated, dramatic foreground presence',
    narrative: 'CAMERA: 85mm equivalent, low-hero angle — 15° upward tilt. Neck elevated into upper frame. Bottle monumentalized.',
  },
  'three-quarter-45': {
    focalLengthEquivalent: '85mm',
    angleDescription: '45° side rotation, slight elevation',
    heroPositioning: 'Bottle occupies left or right third, label reads at angle',
    compressionNote: 'Depth visible in bottle shoulder and neck taper',
    narrative: 'CAMERA: 85mm, 45° three-quarter view. Label readable. Shoulder and neck depth visible. Bottle in third.',
  },
  'macro-label': {
    focalLengthEquivalent: '100mm macro',
    angleDescription: 'Front-facing at label center, slight elevation',
    heroPositioning: 'Label fills 40–50% of frame. Full bottle visible.',
    compressionNote: 'Strong subject-background separation',
    narrative: 'CAMERA: 100mm macro, frontal label focus. Label zone is sharpest point. Background in strong bokeh. Full bottle in frame — no cropping.',
  },
  'flatlay-overhead': {
    focalLengthEquivalent: '50mm',
    angleDescription: 'Directly overhead, 90° top-down',
    heroPositioning: 'Bottle horizontal, label visible from above',
    compressionNote: 'No depth compression — purely two-dimensional read',
    narrative: 'CAMERA: 50mm, top-down flatlay. Bottle horizontal, full length visible from above. Surface context dominant.',
  },
  'compressed-landscape': {
    focalLengthEquivalent: '135mm',
    angleDescription: 'Long telephoto from 4m+ distance, landscape behind',
    heroPositioning: 'Bottle sharp in foreground, landscape layers compressed behind',
    compressionNote: 'Maximum background compression — landscape reads as painterly layer',
    narrative: 'CAMERA: 135mm telephoto. Shot from distance — landscape layers compressed. Bottle sharp, environment rendered as abstract depth.',
  },
  'vertical-prestige': {
    focalLengthEquivalent: '85mm',
    angleDescription: 'Portrait orientation, full bottle crown to base',
    heroPositioning: 'Bottle fills 80% of frame height in vertical crop',
    compressionNote: 'Negative space at top and bottom, clean vertical symmetry',
    narrative: 'CAMERA: 85mm, portrait crop. Full bottle — base to crown — 80% frame height. Negative space top and bottom. Vertical prestige mode.',
  },
  'lineup-collection': {
    focalLengthEquivalent: '85mm',
    angleDescription: 'Level, wide enough to include 2–4 bottles in frame',
    heroPositioning: 'All bottles in frame, primary bottle closest and largest',
    compressionNote: 'Slight depth stagger — back bottles progressively smaller',
    narrative: 'CAMERA: 85mm, collection lineup. All bottles in frame. Primary bottle dominant foreground. Depth stagger creates natural hierarchy.',
  },
};

// ─── LAYER 5: LIGHTING ENGINE — 8 PHYSICALLY PLAUSIBLE RIGS ──────────────

type LightingRig = {
  token: string;
  colorTemp: string;
  keyFillRatio: string;
  shadowCharacter: string;
  narrative: string;
};

export const WINE_LIGHTING_RIGS: Record<string, LightingRig> = {
  'natural-luxury': {
    token: 'NATURAL_LUX',
    colorTemp: '5500–6000K',
    keyFillRatio: '4:1',
    shadowCharacter: 'soft gradual rolloff, wide penumbra',
    narrative:
      'LIGHTING: NATURAL_LUX. Indirect natural light from north window or overcast. 5800K. 4:1 key-fill. Wide-penumbra shadows — no hard edge. Natural highlight on glass shoulder. No artificial sources.',
  },
  'architectural-winery': {
    token: 'ARCH_WINERY',
    colorTemp: '3200K key + 6000K ambient',
    keyFillRatio: '6:1',
    shadowCharacter: 'architectural hard-edge with controlled fill bounce',
    narrative:
      'LIGHTING: ARCH_WINERY. Architectural overhead from recessed downlight. 3200K warm key, narrow cone. Cold 6000K ambient fill from concrete or stone bounce. 6:1 ratio. Hard shadow terminator. Split tonal palette: warm top, cool shadow.',
  },
  'barrel-cellar-candlelight': {
    token: 'CELLAR_CANDLE',
    colorTemp: '1800K primary + 2200K secondary',
    keyFillRatio: '12:1',
    shadowCharacter: 'extreme falloff, near-black shadow zones',
    narrative:
      'LIGHTING: CELLAR_CANDLE. Point-source candlelight. 1800K primary. Secondary ambient 2200K from stone bounce — barely registered. 12:1 ratio. Flame flicker frozen. Deep shadow zone consumes 60% of frame. Maximum drama, minimum fill.',
  },
  'golden-hour-cinematic': {
    token: 'GOLDEN_CINEMATIC',
    colorTemp: '2800–3200K',
    keyFillRatio: '5:1',
    shadowCharacter: 'long shadow at grazing angle, warm edge glow',
    narrative:
      'LIGHTING: GOLDEN_CINEMATIC. Directional late-afternoon sun: 2800K. 5:1 ratio. Long lateral shadow at 45° across surface. Orange-amber edge glow on bottle silhouette. Sky fill: 5600K cool contrast from shadow side. Cinematic split.',
  },
  'diffused-overcast-premium': {
    token: 'DIFFUSED_OVERCAST',
    colorTemp: '6500K',
    keyFillRatio: '2:1',
    shadowCharacter: 'featherlight shadow, near-shadowless, even tonal distribution',
    narrative:
      'LIGHTING: DIFFUSED_OVERCAST. Full overcast sky simulation. 6500K flat ambient. 2:1 subtle wrap. Near-shadowless — pure tonal gradients from form. Maximum label readability. No specular hotspot. Clean for e-commerce grade.',
  },
  'modern-concrete-luxury': {
    token: 'CONCRETE_LUX',
    colorTemp: '4000K',
    keyFillRatio: '7:1',
    shadowCharacter: 'sharp architectural shadow, clean terminator',
    narrative:
      'LIGHTING: CONCRETE_LUX. Long overhead LED batten: 4000K neutral. 7:1 ratio. Sharp shadow line on concrete surface. Cold fill from wall bounce. Minimal warmth. Graphic, precise. Modern architectural luxury response.',
  },
  'sculptural-studio-luxury': {
    token: 'SCULPTURAL_STUDIO',
    colorTemp: '5600K key + 3200K rim',
    keyFillRatio: '8:1',
    shadowCharacter: 'crisp side shadow, warm rim catchlight',
    narrative:
      'LIGHTING: SCULPTURAL_STUDIO. Large octabox camera-left: 5600K, 8:1. Warm 3200K rim from behind-right: bottle silhouette separation. Zero fill right side — pure falloff. Pinpoint specular on shoulder and neck. Bottle reads as sculpture.',
  },
  'backlit-liquid-glow': {
    token: 'BACKLIT_GLOW',
    colorTemp: '6000K back + 3000K front fill',
    keyFillRatio: '3:1 (back dominant)',
    shadowCharacter: 'no surface shadow — halo + transmission light',
    narrative:
      'LIGHTING: BACKLIT_GLOW. Primary light behind bottle: 6000K, slightly below bottle level — drives liquid internal luminosity. Front fill: 3000K 0.3 intensity. Bottle radiates internal glow. Amber/burgundy liquid translucency maximized. No hard shadow.',
  },
};

// ─── LAYER 6: MICRO VARIATION ENGINE ─────────────────────────────────────

/** Converts a WineMicroVariation config into a prompt token block */
export function buildMicroVariationBlock(mv: WineMicroVariation | null | undefined): string {
  if (!mv) return '';
  const parts: string[] = [];

  if (mv.season && mv.season !== 'none') {
    const seasonMap: Record<NonNullable<WineMicroVariation['season']>, string> = {
      spring: 'Scene micro-season: spring — fresh vine buds, soft green undertones, cool-warm light transition',
      summer: 'Scene micro-season: summer — full canopy, warm saturated tones, strong directional sun',
      autumn: 'Scene micro-season: autumn — amber and burgundy foliage, harvest atmosphere, golden warmth',
      winter: 'Scene micro-season: winter — bare vines, cool grey-blue tones, stark clarity',
      none: '',
    };
    if (seasonMap[mv.season]) parts.push(seasonMap[mv.season]);
  }

  if (mv.dewOnGlass) {
    parts.push('Glass micro-detail: fine condensation dew on exterior glass surface — microdroplets, not heavy water. Realistic surface tension.');
  }

  if (mv.atmosphericHaze && mv.atmosphericHaze !== 'none') {
    const hazeMap: Record<NonNullable<WineMicroVariation['atmosphericHaze']>, string> = {
      subtle: 'Atmospheric micro-haze: barely perceptible soft diffusion in mid-distance. Does not obscure subject.',
      moderate: 'Atmospheric haze: visible soft veil in background. Environmental depth cue. No foreground impact.',
      none: '',
    };
    if (hazeMap[mv.atmosphericHaze]) parts.push(hazeMap[mv.atmosphericHaze]);
  }

  if (mv.floralProps) {
    parts.push('Micro-prop: single stem fresh flower (white or cream — never red, never busy). Placed at base, not competing with bottle label.');
  }

  if (mv.microProps && mv.microProps !== 'none') {
    const propMap: Record<NonNullable<WineMicroVariation['microProps']>, string> = {
      'none': '',
      'cork-and-corkscrew': 'Micro-prop: single natural cork and sommelier corkscrew, placed at bottle base — small, secondary, non-competing.',
      'vine-leaves': 'Micro-prop: 2–3 natural vine leaves on surface, subtle, dried or fresh depending on season.',
      'cheese-board': 'Micro-prop: partial view of artisan cheese board at corner of frame — partially out of focus.',
      'linen-napkin': 'Micro-prop: folded linen napkin corner visible at bottle base. Texture: cream or warm white.',
    };
    if (propMap[mv.microProps]) parts.push(propMap[mv.microProps]);
  }

  if (mv.backgroundDepthBoost) {
    parts.push('Background depth: add one additional out-of-focus depth layer behind primary environment. Creates three-plane depth: subject / mid / background.');
  }

  if (parts.length === 0) return '';
  return 'WINE_MICRO_VARIATION: ' + parts.join(' | ') + '.';
}

// ─── LAYER 2: LUXURY INTENSITY SCALING ───────────────────────────────────

type LuxuryIntensitySpec = {
  contrastMultiplier: number;  // 0.5 = flat, 2.0 = very high contrast
  depthOfFieldBias: number;    // 0 = deep focus, 1 = maximum separation
  propDensity: 'none' | 'minimal' | 'curated' | 'rich';
  gradingDescriptor: string;
  compositionStrictness: 'relaxed' | 'standard' | 'strict' | 'surgical';
  narrative: string;
};

export const WINE_LUXURY_TIERS: Record<WineLuxuryIntensity, LuxuryIntensitySpec> = {
  'Editorial': {
    contrastMultiplier: 1.0,
    depthOfFieldBias: 0.35,
    propDensity: 'curated',
    gradingDescriptor: 'natural, editorial tonality — slight desaturation, matte mid-tones, clean highlights',
    compositionStrictness: 'standard',
    narrative: 'LUXURY_TIER: EDITORIAL. Natural contrast, moderate DOF, curated props. Editorial grading: matte highlights, natural saturation. Commercial quality, accessible luxury feel.',
  },
  'Premium': {
    contrastMultiplier: 1.3,
    depthOfFieldBias: 0.5,
    propDensity: 'minimal',
    gradingDescriptor: 'elevated contrast, clean specular, slight cool-neutral grade',
    compositionStrictness: 'strict',
    narrative: 'LUXURY_TIER: PREMIUM. Elevated contrast (+30%), pronounced DOF separation, minimal props only. Cool-neutral grade. Clean specular. Refined, polished, commercial premium.',
  },
  'Ultra Premium': {
    contrastMultiplier: 1.6,
    depthOfFieldBias: 0.7,
    propDensity: 'minimal',
    gradingDescriptor: 'high micro-contrast, pinpoint specular, deep shadow retention, desaturated jewel tones',
    compositionStrictness: 'surgical',
    narrative: 'LUXURY_TIER: ULTRA_PREMIUM. High micro-contrast, pinpoint specular highlights, maximum DOF isolation, shadow zones held deep. Desaturated jewel-tone grade. Zero tolerance for accidental props or visual noise.',
  },
  'Heritage Luxury': {
    contrastMultiplier: 1.4,
    depthOfFieldBias: 0.55,
    propDensity: 'curated',
    gradingDescriptor: 'warm amber-sepia tonality, antique richness, deep saturated darks, golden highlights',
    compositionStrictness: 'strict',
    narrative: 'LUXURY_TIER: HERITAGE_LUXURY. Warm amber-sepia grade. Golden highlights. Rich dark shadow retention. Curated heritage props. Antique material quality. Old-world prestige, timeless craft.',
  },
  'Modern Architectural Luxury': {
    contrastMultiplier: 1.7,
    depthOfFieldBias: 0.4,
    propDensity: 'none',
    gradingDescriptor: 'cool neutral — no warmth, high local contrast, graphic shadow lines, ultra-clean',
    compositionStrictness: 'surgical',
    narrative: 'LUXURY_TIER: MODERN_ARCH_LUXURY. Cool neutral grade, no warmth. Maximum local contrast. Hard graphic shadow lines. Zero props. Architecture is the prop. Brutalist precision luxury.',
  },
};

// ─── MULTI-SKU COMPOSITION ENGINE ─────────────────────────────────────────

type CompositionSpec = {
  cameraAngle: keyof typeof WINE_CAMERA_ANGLES;
  negativeSpaceRule: string;
  lightingAdaptation: string;
  subjectHierarchy: string;
  narrative: string;
};

export const WINE_COMPOSITION_MODES: Record<WineCompositionMode, CompositionSpec> = {
  'single-hero': {
    cameraAngle: 'eye-level-centered',
    negativeSpaceRule: 'Balanced negative space — left/right equal. Bottom 15% foreground surface.',
    lightingAdaptation: 'Any rig. Single bottle: full lighting precision available.',
    subjectHierarchy: 'One bottle. No secondary subjects.',
    narrative: 'COMPOSITION: SINGLE_HERO. One bottle, centered, eye-level. Full lighting precision. Balanced negative space. The bottle is the complete subject.',
  },
  'bottle-and-glass': {
    cameraAngle: 'three-quarter-45',
    negativeSpaceRule: 'Bottle left of center. Glass right. Small negative space right edge.',
    lightingAdaptation: 'Lighting must flatter both bottle and glass. Avoid specular conflict between surfaces.',
    subjectHierarchy: 'Bottle is primary (60% visual weight). Glass is secondary (40%). Neither crops the other.',
    narrative: 'COMPOSITION: BOTTLE_AND_GLASS. Bottle left-center, glass right. Neither subject obscures the other. Label fully readable. Glass: 1/3 fill with matching wine. Both subjects in sharp focus.',
  },
  'horizontal-editorial': {
    cameraAngle: 'flatlay-overhead',
    negativeSpaceRule: 'Surface texture at 40% of frame. Bottle + props within 60%.',
    lightingAdaptation: 'Top-down lighting required. Even surface illumination. No vertical rig preferred.',
    subjectHierarchy: 'Bottle horizontal-center. Surface and minimal props provide context.',
    narrative: 'COMPOSITION: HORIZONTAL_EDITORIAL. Top-down flatlay. Bottle horizontal, label readable from above. Surface quality dominant. Minimal props at edges. Editorial magazine aesthetic.',
  },
  'premium-lineup': {
    cameraAngle: 'lineup-collection',
    negativeSpaceRule: 'No dead space. Bottles fill frame with consistent spacing.',
    lightingAdaptation: 'All bottles must receive equal lighting treatment. No hero-bias light.',
    subjectHierarchy: 'Primary bottle: foreground, 20% larger. Secondary bottles: staggered depth behind.',
    narrative: 'COMPOSITION: PREMIUM_LINEUP. 2–4 bottles in lineup. Consistent spacing. Primary bottle foreground dominant. Depth stagger. All labels readable. Equal lighting across lineup. Collection editorial.',
  },
  'gift-celebration': {
    cameraAngle: 'low-hero',
    negativeSpaceRule: 'Bottle dominant. Gift elements occupy bottom 25% only.',
    lightingAdaptation: 'Warm lighting preferred. Ribbon and tissue add texture — must not compete with label.',
    subjectHierarchy: 'Bottle primary. Gift packaging elements secondary. No label obstruction.',
    narrative: 'COMPOSITION: GIFT_CELEBRATION. Bottle hero. Gift context elements (ribbon, box, tissue) at base only. Label fully visible. Warm celebratory lighting. Premium gifting aesthetic.',
  },
  'macro-label': {
    cameraAngle: 'macro-label',
    negativeSpaceRule: 'Label fills center. Bottle shoulder and base partially visible — no hard crop.',
    lightingAdaptation: 'Grazing side light reveals label texture and embossing. No flat-on fill.',
    subjectHierarchy: 'Label is subject. Bottle geometry frames it. Background: maximum bokeh.',
    narrative: 'COMPOSITION: MACRO_LABEL. Label is primary subject. Full bottle visible — no cropping. 100mm macro focal length. Grazing side light reveals texture. Background in strong bokeh isolation.',
  },
};

// ─── ANTI-REPETITION ENGINE ────────────────────────────────────────────────

/** Lightweight hash for tracking recently used scene combinations */
export type WineSceneHash = string;

export function computeWineSceneHash(params: {
  environment: WineEnvironmentV4;
  lightingRig: string;
  cameraAngle: string;
  luxuryTier: WineLuxuryIntensity;
  microVariation?: WineMicroVariation | null;
}): WineSceneHash {
  const mv = params.microVariation;
  const mvKey = mv
    ? `${mv.season ?? 'none'}:${mv.dewOnGlass ? 'dew' : 'dry'}:${mv.microProps ?? 'none'}`
    : 'nomv';
  return `${params.environment}|${params.lightingRig}|${params.cameraAngle}|${params.luxuryTier}|${mvKey}`;
}

/**
 * Combination exclusion rules — pairs that MUST NOT be used together.
 * Returns true if the combination is valid (allowed).
 */
export function isValidSceneCombination(
  environment: WineEnvironmentV4,
  lightingRig: string,
  cameraAngle: string
): boolean {
  // Flatlay only makes sense for surface-based environments
  if (cameraAngle === 'flatlay-overhead') {
    const surfaceEnvironments: WineEnvironmentV4[] = [
      'Fine Dining Table', 'Rustic Estate Kitchen', 'Dark Luxury Studio',
      'White Marble Studio', 'Concrete Architectural Studio',
    ];
    if (!surfaceEnvironments.includes(environment)) return false;
  }
  // Backlit-liquid-glow requires a backlit-capable environment
  if (lightingRig === 'backlit-liquid-glow') {
    const backlitEnvironments: WineEnvironmentV4[] = [
      'Glass Winery Modern', 'Dark Luxury Studio', 'Concrete Architectural Studio',
    ];
    if (!backlitEnvironments.includes(environment)) return false;
  }
  // Candlelight only in cellar/dining environments
  if (lightingRig === 'barrel-cellar-candlelight') {
    const cellarEnvironments: WineEnvironmentV4[] = [
      'Oak Barrel Cellar', 'Stone Cave Cellar', 'Cathedral Wine Cellar',
      'Private Wine Library', 'Fine Dining Table',
    ];
    if (!cellarEnvironments.includes(environment)) return false;
  }
  // lineup-collection requires a studio or controlled environment
  if (cameraAngle === 'lineup-collection') {
    const controlledEnvironments: WineEnvironmentV4[] = [
      'Dark Luxury Studio', 'White Marble Studio', 'Concrete Architectural Studio',
      'Fine Dining Table', 'Private Wine Library',
    ];
    if (!controlledEnvironments.includes(environment)) return false;
  }
  return true;
}

/**
 * Weighted selection from array with exclusion list.
 * Items in recentHashes are weighted down — not fully excluded (controlled diversity).
 * Pure function — deterministic given seed.
 */
export function weightedSelectFromPool<T extends string>(
  pool: T[],
  recentlyUsed: T[],
  seed: number
): T {
  const recentSet = new Set(recentlyUsed.slice(-3)); // track last 3
  const weights = pool.map(item => recentSet.has(item) ? 0.1 : 1.0);
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let cursor = (seed % 1000) / 1000 * totalWeight;
  for (let i = 0; i < pool.length; i++) {
    cursor -= weights[i];
    if (cursor <= 0) return pool[i];
  }
  return pool[pool.length - 1];
}

// ─── FULL V4 PROMPT ASSEMBLY ───────────────────────────────────────────────

export type WineV4AssemblyParams = {
  /** Physical state — always provided, always wins */
  physicsBlock: string;
  /** Label lock — always provided, never overridden */
  labelBlock: string;
  /** Selected luxury tier */
  luxuryTier: WineLuxuryIntensity;
  /** Selected environment */
  environment: WineEnvironmentV4;
  /** Selected lighting rig key */
  lightingRig: keyof typeof WINE_LIGHTING_RIGS;
  /** Selected camera angle key */
  cameraAngle: keyof typeof WINE_CAMERA_ANGLES;
  /** Composition mode */
  compositionMode: WineCompositionMode;
  /** Optional micro variation */
  microVariation?: WineMicroVariation | null;
  /** Optional archetype narrative (from existing v3 system — compatible) */
  archetypeNarrative?: string;
  /** Optional aesthetic segment (from buildWineAestheticSegment) */
  aestheticSegment?: string;
  /** Output constraint token */
  outputConstraint?: string;
};

/**
 * Assembles all layers into a production-ready prompt string.
 * Layer order is the control hierarchy — earlier = higher priority.
 *
 * Hierarchy:
 *   [0] Engine status
 *   [1] Physical product (IMMUTABLE — never overridden by any layer)
 *   [2] Brand integrity / label lock (IMMUTABLE)
 *   [3] Luxury intensity tier
 *   [4] Environment selection
 *   [5] Lighting rig
 *   [6] Camera angle
 *   [7] Composition mode
 *   [8] Micro variation (entropy-controlled)
 *   [9] Archetype narrative (visual-only bias)
 *   [10] Aesthetic profile segment
 *   [11] Output constraints
 */
export function assembleWineV4Prompt(params: WineV4AssemblyParams): string {
  const env = WINE_ENVIRONMENT_V4[params.environment];
  const lightRig = WINE_LIGHTING_RIGS[params.lightingRig];
  const camera = WINE_CAMERA_ANGLES[params.cameraAngle];
  const luxTier = WINE_LUXURY_TIERS[params.luxuryTier];
  const comp = WINE_COMPOSITION_MODES[params.compositionMode];

  const segments: string[] = [
    'WINE_ENGINE_V4: active. hierarchy-controlled. deterministic.',
    params.physicsBlock,
    params.labelBlock,
    luxTier.narrative,
    env.narrative,
    lightRig.narrative,
    camera.narrative,
    comp.narrative,
    buildMicroVariationBlock(params.microVariation ?? null),
    params.archetypeNarrative ?? '',
    params.aestheticSegment ?? '',
    params.outputConstraint ?? 'OUTPUT: Single photographic image. No text overlays. No watermarks. No UI elements. No composite artifacts.',
  ].filter(Boolean);

  return segments.join(' ');
}

/**
 * Returns the environment spec for use in pipeline routing decisions.
 */
export function getWineEnvironmentV4Spec(env: WineEnvironmentV4): EnvironmentSpec {
  return WINE_ENVIRONMENT_V4[env];
}

/**
 * Returns the luxury tier spec.
 */
export function getWineLuxuryTierSpec(tier: WineLuxuryIntensity): LuxuryIntensitySpec {
  return WINE_LUXURY_TIERS[tier];
}

/**
 * Resolves the best default luxury tier for a given environment, based on prestige intensity.
 */
export function resolveDefaultLuxuryTier(env: WineEnvironmentV4): WineLuxuryIntensity {
  const { prestigeIntensity } = WINE_ENVIRONMENT_V4[env];
  if (prestigeIntensity >= 0.91) return 'Heritage Luxury';
  if (prestigeIntensity >= 0.86) return 'Ultra Premium';
  if (prestigeIntensity >= 0.78) return 'Premium';
  if (prestigeIntensity >= 0.68) return 'Editorial';
  return 'Editorial';
}

/**
 * Returns all WineEnvironmentV4 keys as an array — useful for UI selectors and variation pools.
 */
export const ALL_WINE_ENVIRONMENTS_V4: WineEnvironmentV4[] = Object.keys(
  WINE_ENVIRONMENT_V4
) as WineEnvironmentV4[];

/**
 * Returns all lighting rig keys.
 */
export const ALL_WINE_LIGHTING_RIGS = Object.keys(WINE_LIGHTING_RIGS) as (keyof typeof WINE_LIGHTING_RIGS)[];

/**
 * Returns all camera angle keys.
 */
export const ALL_WINE_CAMERA_ANGLES = Object.keys(WINE_CAMERA_ANGLES) as (keyof typeof WINE_CAMERA_ANGLES)[];

// ─── EDGE CASE HANDLERS ───────────────────────────────────────────────────

/**
 * Resolves composition mode conflicts when serve state changes.
 * Served mode: bottle-and-glass takes priority if current mode is single-hero.
 * If mode is already a valid multi-subject mode, preserve it.
 */
export function resolveCompositionForServeState(
  currentMode: WineCompositionMode,
  serveState: 'none' | 'served'
): WineCompositionMode {
  if (serveState === 'served' && currentMode === 'single-hero') return 'bottle-and-glass';
  return currentMode;
}

/**
 * Ensures camera angle is compatible with composition mode.
 * Returns corrected angle if conflict detected.
 */
export function resolveCameraForCompositionMode(
  angle: keyof typeof WINE_CAMERA_ANGLES,
  mode: WineCompositionMode
): keyof typeof WINE_CAMERA_ANGLES {
  if (mode === 'horizontal-editorial' && angle !== 'flatlay-overhead') return 'flatlay-overhead';
  if (mode === 'premium-lineup' && angle !== 'lineup-collection') return 'lineup-collection';
  if (mode === 'macro-label' && angle !== 'macro-label') return 'macro-label';
  return angle;
}
