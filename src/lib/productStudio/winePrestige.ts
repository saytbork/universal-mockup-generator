import type {
  ProductStudioState,
  WineAction,
  WineEnvironmentPreset,
  WineLightingTone,
  WineMoodModifier,
  WinePourStyle,
  WineStyleArchetype,
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
