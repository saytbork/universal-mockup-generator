// Freeze guard: preserve deterministic segment ordering and final prompt integrity checks.
// Snapshot baseline and regression tests depend on this pipeline contract.
import {
  buildPalette,
  buildArtworkImmutability,
  buildIntent,
  buildProductCharacter,
  buildWorld,
  buildCameraOverrides,
  buildComposition,
  buildMotion,
  buildInteraction,
  buildPhysicalPresence,
  buildPhysics,
  buildModifiers,
  buildPhotoModeDynamic,
  buildLighting,
  buildMaterials,
  buildProductPhysical,
  buildGeometry,
  buildIngredients,
  buildAdvancedOverrideParts,
  buildProtectionLayer,
  sanitizePromptParts,
  finalizePromptFromSegments,
  resolveStudioAuthority,
  getAllowedStudioModifiers,
  buildProductOrientation,
} from '../index';
import type { StudioUIState } from '../index';
import { resolveIndustryProfileModule } from '../industryProfiles/registry';
import { buildVisualStyle } from '../builders/buildVisualStyle';
import { buildEnvironmentStyle } from '../builders/buildEnvironmentStyle';

type StudioStateDebug = StudioUIState & {
  environment?: string;
  environmentPreset?: string;
  contextPresetValue?: string;
  lighting?: string;
  lightingPreset?: string;
  lightingMode?: string;
  basicLighting?: string;
};

type CanonicalSegmentType =
  | 'camera'
  | 'composition'
  | 'photoMode'
  | 'world'
  | 'lighting'
  | 'materials'
  | 'placement'
  | 'guardrail';

type PipelinePromptSegmentType = 'physics' | 'world' | 'camera' | 'composition' | 'interaction' | 'guardrail' | 'output';

type PipelinePromptSegment = {
  type: PipelinePromptSegmentType;
  content: string;
};

const SEGMENT_WEIGHT: Record<CanonicalSegmentType, number> = {
  camera: 0,
  composition: 1,
  photoMode: 2,
  world: 3,
  lighting: 4,
  materials: 5,
  placement: 6,
  guardrail: 7,
};

function classifySegmentType(part: string): CanonicalSegmentType {
  const p = String(part || '').trim().toUpperCase();
  if (!p) return 'guardrail';

  if (
    p.startsWith('STUDIO_CAMERA_') ||
    p.startsWith('LENS_PROFILE:') ||
    p.startsWith('DISTORTION:') ||
    p.startsWith('DEPTH_STYLE:') ||
    p.startsWith('ROTATION:') ||
    p.startsWith('STUDIO_FRAMING_GUIDE:') ||
    p.startsWith('STUDIO_VIEWPOINT:') ||
    p === 'FRAMING: MACRO DETAIL.'
  ) {
    return 'camera';
  }

  if (
    p.startsWith('ARTWORK_IMMUTABILITY:') ||
    p.startsWith('STUDIO_VISUAL_INTENT:') ||
    p.startsWith('STUDIO_COMPOSITION_PROFILE:') ||
    p.startsWith('FRAME_CONSTRAINT:') ||
    p.startsWith('NEGATIVE_SPACE_POLICY:') ||
    p.startsWith('HERO_COMPOSITION_DISCIPLINE:') ||
    p.startsWith('FRAMING:') ||
    p.startsWith('COMPOSITION:') ||
    p.startsWith('RULE_OF_THIRDS_DEFAULT:') ||
    p.startsWith('ASYMMETRICAL_BALANCE:') ||
    p.startsWith('HORIZONTAL_BALANCE:') ||
    p.startsWith('VERTICAL_BALANCE:') ||
    p.startsWith('CENTER_SYMMETRY_LOCK:')
  ) {
    return 'composition';
  }

  if (
    p.startsWith('PHOTO_MODE_DYNAMIC_CONTROLS:') ||
    p.startsWith('PHOTO_MODE_ATMOSPHERE:') ||
    p.startsWith('MACRO_DEW_LABEL_MODE:') ||
    p.startsWith('MACRO_TIGHTNESS:') ||
    p.startsWith('DROPLET_MODE:') ||
    p.startsWith('DROPLET_DENSITY:') ||
    p.startsWith('HIGHLIGHT_CONTROL:') ||
    p.startsWith('SURFACE_WETNESS_RULE:') ||
    p.startsWith('MACRO_DEW_SCENE_RULE:') ||
    p.startsWith('MACRO_CAPTURE_RULE:') ||
    p.startsWith('LABEL_FIDELITY_RULE:') ||
    p.startsWith('DEW_PHYSICS_RULE:') ||
    p.startsWith('OPTICAL_MACRO_RULE:') ||
    p.startsWith('ROUTINE_CAROUSEL_MODE:') ||
    p.startsWith('FRAME_COUNT:') ||
    p.startsWith('ROUTINE_FLOW:') ||
    p.startsWith('CONSISTENCY:') ||
    p.startsWith('HERO_FRAME:') ||
    p.startsWith('CAROUSEL_STRUCTURE:') ||
    p.startsWith('FRAME_LAYOUT_RULE:') ||
    p.startsWith('FRAME_CONSISTENCY_RULE:') ||
    p.startsWith('FLOW_RULE:') ||
    p.startsWith('HERO_FRAME_RULE:') ||
    p.startsWith('GEL_SMEAR_EDITORIAL_SCENE:') ||
    p.startsWith('TEXTURED_BED_INGREDIENT_AUTHORITY:') ||
    p.startsWith('PHOTO_MODE_SETTING_WATERLEVEL:') ||
    p.startsWith('PHOTO_MODE_SETTING_WATERENERGY:') ||
    p.startsWith('INTERACTION_MODE:') ||
    p.startsWith('MATERIAL_MODE:') ||
    p.startsWith('TEXTURE_TYPE:') ||
    p.startsWith('TEXTURE_DENSITY:') ||
    p.startsWith('STUDIO_PHYSICS_MODEL:') ||
    p.startsWith('IMPACT_TYPE:') ||
    p.startsWith('IMPACT_ORIGIN:') ||
    p.startsWith('GRAVITY_VECTOR:') ||
    p.startsWith('FORBID_ENCLOSURE_SHAPES:') ||
    p.startsWith('FORBID_HOLLOW_WATER_RINGS:') ||
    p.startsWith('FORBID_FLOATING_DROPLETS:') ||
    p.startsWith('FLOW_DIRECTION:') ||
    p.startsWith('CONTACT_SURFACE:') ||
    p.startsWith('APPLICATION_ZONE:') ||
    p.startsWith('NO_SPLASH_POLICY:') ||
    p.startsWith('PRODUCT_GROUNDING:') ||
    p.startsWith('LOCAL_DEFORMATION:') ||
    p.startsWith('FLUID_REALISM_CONSTRAINT:') ||
    p.startsWith('VISUAL_SIMPLICITY_RULE:')
  ) {
    return 'photoMode';
  }

  if (
    p.startsWith('STUDIO_WORLD:') ||
    p.startsWith('PHOTO_MODE_SCENE:') ||
    p.startsWith('VISUAL_STYLE_MODE:') ||
    p.startsWith('VISUAL_STYLE_CATEGORY:') ||
    p.startsWith('VISUAL_STYLE_NAME:') ||
    p.startsWith('VISUAL_STYLE_SCENE:') ||
    p.startsWith('VISUAL_STYLE_AUTHORITY:') ||
    p.startsWith('ENVIRONMENT_STYLE_MODE:') ||
    p.startsWith('ENVIRONMENT_STYLE_NAME:') ||
    p.startsWith('ENVIRONMENT_CONTEXT:') ||
    p.startsWith('ENVIRONMENT_AUTHORITY:') ||
    p.startsWith('ENVIRONMENT_CONTEXT:') ||
    p.startsWith('BACKGROUND_CONTEXT:') ||
    p.startsWith('SURFACE_MATERIAL:') ||
    p.startsWith('AMBIENT_CONTEXT:') ||
    p.startsWith('SCENE_STYLE:') ||
    p.startsWith('NATURAL_MATERIAL_REALISM:') ||
    p.startsWith('NO_SYNTHETIC_RENDERING:') ||
    p.startsWith('SURFACE_MICRODETAIL:') ||
    p.startsWith('PHOTOGRAPHIC_LIGHT_RESPONSE:') ||
    p.startsWith('WINE_ENVIRONMENT:') ||
    p.startsWith('ENVIRONMENT_PHYSICS_OVERRIDE:') ||
    p.startsWith('WINE_STYLE_ARCHETYPE:') ||
    p.startsWith('WINE_AESTHETIC_PROFILE:')
  ) {
    return 'world';
  }

  if (
    p.startsWith('STUDIO_LIGHTING_PROFILE:') ||
    p.startsWith('LIGHTING_PROFILE:') ||
    p.startsWith('STUDIO_LIGHT_DIRECTION:') ||
    p.startsWith('STUDIO_SHADOW_STYLE:') ||
    p.startsWith('COFFEE_LIGHTING_PROFILE:') ||
    p.startsWith('HERO_STUDIO_LIGHTING:') ||
    p.startsWith('WINE_LIGHTING:') ||
    p.startsWith('LIGHTING:') ||
    p.startsWith('SHADOW_ROLLOFF:') ||
    p.startsWith('HIGHLIGHT_BEHAVIOR:')
  ) {
    return 'lighting';
  }

  if (
    p.startsWith('STUDIO_MATERIAL_PROFILE:') ||
    p.startsWith('MATERIALS:') ||
    p.startsWith('MATERIAL_BEHAVIOR:') ||
    p.startsWith('STUDIO_MATERIAL_MODEL:') ||
    p.startsWith('PRODUCT_CHARACTER_PROFILE:') ||
    p.startsWith('PRODUCT_TYPE_CHARACTER:') ||
    p.startsWith('PACKAGING_TYPE_CHARACTER:') ||
    p.startsWith('PRODUCT_VISUAL_PROFILE:') ||
    p.startsWith('WINE_MATERIALS:') ||
    p.startsWith('GLASS_MATERIAL_LOCK:') ||
    p.startsWith('MATERIAL_INTEGRITY:')
  ) {
    return 'materials';
  }

  if (
    p.startsWith('STUDIO_PRODUCT_MOTION:') ||
    p.startsWith('MOTION:') ||
    p.startsWith('PHYSICAL_PRESENCE:') ||
    p.startsWith('GROUNDING_MODE:') ||
    p.startsWith('PHYSICAL_PLACEMENT:') ||
    p.startsWith('PHYSICAL_PLACEMENT_CONTEXT:') ||
    p.startsWith('BOTTLE_ORIENTATION:') ||
    p.startsWith('INTERACTION_PROFILE:') ||
    p.startsWith('STUDIO_MODIFIER_') ||
    p.startsWith('STUDIO_MODIFIERS:')
  ) {
    return 'placement';
  }

  return 'guardrail';
}

function toPromptSegmentType(type: CanonicalSegmentType): PipelinePromptSegmentType {
  if (type === 'camera') return 'camera';
  if (type === 'composition') return 'composition';
  if (type === 'world') return 'world';
  if (type === 'guardrail') return 'guardrail';
  return 'interaction';
}

function toOrderedSegments(parts: string[]): PipelinePromptSegment[] {
  const ordered = parts.map((part, index) => ({
    canonicalType: classifySegmentType(part),
    content: String(part || ''),
    index,
  }));
  ordered.sort((a, b) => {
    const w = SEGMENT_WEIGHT[a.canonicalType] - SEGMENT_WEIGHT[b.canonicalType];
    if (w !== 0) return w;
    return a.index - b.index;
  });
  const seen = new Set<string>();

  const cleaned: PipelinePromptSegment[] = [];

  for (const segment of ordered) {
    const normalized = segment.content.replace(/\s+/g, ' ').trim();
    if (!normalized) continue;
    const key = `${segment.canonicalType}|${normalized}`;
    if (seen.has(key)) continue;
    seen.add(key);
    cleaned.push({
      type: toPromptSegmentType(segment.canonicalType),
      content: normalized,
    });
  }

  return cleaned;
}

export function __orderSegmentsForTest(parts: string[]): PipelinePromptSegment[] {
  return toOrderedSegments(parts);
}

function buildIndustrySegments(state: StudioUIState, base: string[]): string[] {
  const profile = resolveIndustryProfileModule(state.industryProfile);
  return [...base, ...profile.truthLayer(state), ...profile.compositionRules(state)];
}

function finalizeWithIndustryValidation(prompt: string, state: StudioUIState): string {
  const profile = resolveIndustryProfileModule(state.industryProfile);
  const sanitized = profile.sanitizePrompt ? profile.sanitizePrompt(prompt) : prompt;
  if (profile.validatePrompt) profile.validatePrompt(sanitized);
  return sanitized;
}

function normalizeText(text: string): string {
  return String(text || '').replace(/\s+/g, ' ').trim();
}

function allowsEnvironmentalBackgroundHumans(prompt: string): boolean {
  const lower = normalizeText(prompt).toLowerCase();
  if (!lower.includes('environment_style_mode: active.') && !lower.includes('environment_context:')) {
    return false;
  }
  const markers = [
    ' kid',
    ' kids',
    ' child',
    ' children',
    ' family',
    ' families',
    ' swimmer',
    ' swimmers',
    ' crowd',
    ' guests',
    ' people',
    ' person',
  ];
  return markers.some((marker) => lower.includes(marker));
}

function extractPromptBlocks(prompt: string): string[] {
  const source = String(prompt || '').trim();
  if (!source) return [];
  if (source.includes('\n\n')) {
    return source
      .split('\n\n')
      .map((block) => normalizeText(block))
      .filter(Boolean);
  }
  const tokenPattern = /[A-Z][A-Z0-9_]+:/g;
  const matches = Array.from(source.matchAll(tokenPattern));
  if (matches.length === 0) return [normalizeText(source)];

  const blocks: string[] = [];
  for (let i = 0; i < matches.length; i += 1) {
    const start = matches[i].index ?? 0;
    const end = i + 1 < matches.length ? (matches[i + 1].index ?? source.length) : source.length;
    const block = normalizeText(source.slice(start, end));
    if (block) blocks.push(block);
  }
  return blocks;
}

function assertFinalPromptIntegrity(prompt: string, state: StudioUIState): void {
  const debugState = state as StudioStateDebug;
  const normalizedPrompt = normalizeText(prompt);
  const lowerPrompt = normalizedPrompt.toLowerCase();
  const photoMode = String(state.photoMode || '').trim().toLowerCase();
  const environmentPreset = String(debugState.environmentPreset || '').trim().toLowerCase();
  const creativeIntent = String(state.creativeIntent || '').trim();
  const visualStyle = String(state.visualStyle || '').trim();
  const looksLikeAssembledPrompt =
    normalizedPrompt.includes('ARTWORK_IMMUTABILITY:') ||
    normalizedPrompt.includes('STUDIO_COMPOSITION_PROFILE:') ||
    normalizedPrompt.includes('PHOTO_MODE_SCENE:');
  const forbiddenHumanPatterns = [
    /\bperson\b/,
    /\bpeople\b/,
    /\bhuman\b/,
    /\bportrait\b/,
    /\bselfie\b/,
    /\btorso\b/,
    /\b(?:upper|lower|full)\s+body\b/,
    /\b(?:human|visible|cropped|close(?:-up)?|full|partial)\s+face\b/,
    /\bface\s+framing\b/,
    /\bfacial\b/,
    /\b(?:human|visible|cropped|full|partial)\s+head\b/,
    /\b(?:human|visible|cropped|full|partial)\s+body\b/,
    /\b(?:fashion|human)\s+model\b/,
    /\bmodel-first\b/,
  ];

  if (looksLikeAssembledPrompt && creativeIntent && !normalizedPrompt.includes('STUDIO_VISUAL_INTENT:')) {
    throw new Error('[PIPELINE_INTEGRITY_FAILURE:CREATIVE_DIRECTION_MISSING]');
  }

  if (looksLikeAssembledPrompt && String(state.physicalPresence || state.physicalPlacement || '').trim()) {
    if (!normalizedPrompt.includes('PHYSICAL_PRESENCE:') && !normalizedPrompt.includes('PHYSICAL_PLACEMENT_CONTEXT:')) {
      throw new Error('[PIPELINE_INTEGRITY_FAILURE:PHYSICAL_PRESENCE_MISSING]');
    }
  }

  if (looksLikeAssembledPrompt && (photoMode || String(state.motion || '').trim() || String(state.interaction || '').trim())) {
    if (
      !normalizedPrompt.includes('STUDIO_PRODUCT_MOTION:') &&
      !normalizedPrompt.includes('INTERACTION_MODE:') &&
      !normalizedPrompt.includes('INTERACTION_PROFILE:')
    ) {
      throw new Error('[PIPELINE_INTEGRITY_FAILURE:MOTION_INTERACTION_MISSING]');
    }
  }

  if (looksLikeAssembledPrompt && photoMode && environmentPreset) {
    if (!normalizedPrompt.includes('PHOTO_MODE_SCENE:') || !normalizedPrompt.includes('ENVIRONMENT_CONTEXT:')) {
      throw new Error('[PIPELINE_INTEGRITY_FAILURE:WORLD_ENVIRONMENT_MISSING]');
    }
  }

  if (looksLikeAssembledPrompt && visualStyle) {
    if (!normalizedPrompt.includes('VISUAL_STYLE_MODE:')) {
      throw new Error('[PIPELINE_INTEGRITY_FAILURE:VISUAL_STYLE_MISSING]');
    }
  }

  if (
    looksLikeAssembledPrompt &&
    String(state.cameraAngle || state.cameraDistance || state.cameraRotation || state.framingGuide || '').trim() &&
    !normalizedPrompt.includes('STUDIO_CAMERA_') &&
    !normalizedPrompt.includes('LENS_PROFILE:')
  ) {
    throw new Error('[PIPELINE_INTEGRITY_FAILURE:CINEMATOGRAPHY_MISSING]');
  }

  if (looksLikeAssembledPrompt && !photoMode && (visualStyle || environmentPreset) && normalizedPrompt.includes('PHOTO_MODE_SCENE: Clean studio hero composition')) {
    throw new Error('[PIPELINE_INTEGRITY_FAILURE:WRONG_HERO_FALLBACK]');
  }

  if (looksLikeAssembledPrompt) {
    // Strip the required closing anti-human disclaimer before scanning for forbidden patterns.
    // The disclaimer itself contains "human", "people", etc. as negation language —
    // these must not trigger the guard. Only positive human language injected by a builder is forbidden.
    const closingDisclaimers = [
      'the scene must contain only the product and environmental elements. no people, no visible human anatomical elements, no human presence unless explicitly defined by product interaction.',
      'the scene must keep the product as the clear foreground hero. background human activity is allowed only when explicitly defined by environment and must remain distant, subordinate, and non-interactive with the product. no human contact with the product and no foreground human dominance unless explicitly defined by product interaction.',
    ];
    const scrubbedForHumanCheck = closingDisclaimers.reduce(
      (acc, disclaimer) => acc.split(disclaimer).join(' '),
      lowerPrompt
    );
    const allowBackgroundHumans = allowsEnvironmentalBackgroundHumans(normalizedPrompt);
    const effectiveForbiddenPatterns = allowBackgroundHumans
      ? forbiddenHumanPatterns.filter((pattern) => {
          const source = pattern.source;
          return source !== '\\bperson\\b' && source !== '\\bpeople\\b' && source !== '\\bhuman\\b';
        })
      : forbiddenHumanPatterns;
    for (const pattern of effectiveForbiddenPatterns) {
      if (pattern.test(scrubbedForHumanCheck)) {
        throw new Error('[PIPELINE_INTEGRITY_FAILURE:FORBIDDEN_HUMAN_LANGUAGE]');
      }
    }
  }

  if (photoMode === 'splash shot') {
    if (!normalizedPrompt.includes('STUDIO_PHYSICS_MODEL:')) {
      throw new Error('[PIPELINE_INTEGRITY_FAILURE:SPLASH_PHYSICS_MODEL_MISSING]');
    }
    if (!normalizedPrompt.includes('IMPACT_TYPE: liquid_splash')) {
      throw new Error('[PIPELINE_INTEGRITY_FAILURE:SPLASH_IMPACT_TYPE_MISSING]');
    }
    const forbiddenSplashLexemes = [
      'splash tank environment',
      'bounded liquid containment',
      'water tank',
      'bowl',
      'hollow ring',
      'hollow loop',
    ];
    for (const token of forbiddenSplashLexemes) {
      if (lowerPrompt.includes(token)) {
        throw new Error('[PIPELINE_INTEGRITY_FAILURE:SPLASH_ENCLOSURE_LANGUAGE_LEAK]');
      }
    }
  }

  if (environmentPreset === 'nature elements') {
    const anchors = [
      'NATURAL_MATERIAL_REALISM:',
      'NO_SYNTHETIC_RENDERING:',
      'SURFACE_MICRODETAIL:',
      'PHOTOGRAPHIC_LIGHT_RESPONSE:',
    ];
    for (const anchor of anchors) {
      if (!normalizedPrompt.includes(anchor)) {
        throw new Error(`[PIPELINE_INTEGRITY_FAILURE:NATURE_ANCHOR_MISSING:${anchor.replace(':', '')}]`);
      }
    }
  }

  if (environmentPreset) {
    const requiredEnvironmentTokens = ['ENVIRONMENT_STYLE_MODE:', 'ENVIRONMENT_STYLE_NAME:', 'ENVIRONMENT_CONTEXT:'];
    for (const token of requiredEnvironmentTokens) {
      if (!normalizedPrompt.includes(token)) {
        throw new Error('[PIPELINE_INTEGRITY_FAILURE:ENVIRONMENT_CONTRACT_MISSING]');
      }
    }
  }

  if (photoMode === 'wine macro label') {
    const hasInteraction = normalizedPrompt.includes('INTERACTION_MODE:');
    const hasLabelZone = normalizedPrompt.includes('APPLICATION_ZONE: front label.');
    if (!hasInteraction && !hasLabelZone) {
      throw new Error('[PIPELINE_INTEGRITY_FAILURE:WINE_MACRO_INTERACTION_MISSING]');
    }
  }

  if (photoMode === 'routine carousel') {
    const required = [
      'ROUTINE_CAROUSEL_MODE:',
      'FRAME_COUNT:',
      'ROUTINE_FLOW:',
      'CONSISTENCY:',
      'HERO_FRAME:',
      'CAROUSEL_STRUCTURE:',
    ];
    for (const token of required) {
      if (!normalizedPrompt.includes(token)) {
        throw new Error('[PIPELINE_INTEGRITY_FAILURE:ROUTINE_CAROUSEL_CONTRACT_MISSING]');
      }
    }
  }

  if (photoMode === 'macro dew label') {
    const required = [
      'MACRO_DEW_LABEL_MODE:',
      'MACRO_TIGHTNESS:',
      'DROPLET_MODE:',
      'DROPLET_DENSITY:',
      'HIGHLIGHT_CONTROL:',
      'STUDIO_CAMERA_DISTANCE: Macro.',
      'LENS_PROFILE: 100mm macro equivalent.',
      'STUDIO_FRAMING_GUIDE: Macro detail.',
    ];
    for (const token of required) {
      if (!normalizedPrompt.includes(token)) {
        throw new Error('[PIPELINE_INTEGRITY_FAILURE:MACRO_DEW_LABEL_CONTRACT_MISSING]');
      }
    }

    const forbidden = [
      'STUDIO_CAMERA_ANGLE: 45° hero.',
      'STUDIO_CAMERA_DISTANCE: Standard.',
      'LENS_PROFILE: 50mm equivalent.',
      'STUDIO_FRAMING_GUIDE: Centered hero.',
      'STUDIO_COMPOSITION_PROFILE: hero-45.',
    ];
    for (const token of forbidden) {
      if (normalizedPrompt.includes(token)) {
        throw new Error('[PIPELINE_INTEGRITY_FAILURE:MACRO_DEW_LABEL_HERO_FALLBACK_LEAK]');
      }
    }

    if (normalizedPrompt.includes('DROPLET_MODE: clean.')) {
      const cleanForbidden = [
        'DROPLET_MODE: drops',
        'visible droplets',
        'dew droplets attached',
        'condensation beads',
        'droplet-defined',
        'realistic surface tension',
      ];
      for (const token of cleanForbidden) {
        if (lowerPrompt.includes(token.toLowerCase())) {
          throw new Error('[PIPELINE_INTEGRITY_FAILURE:MACRO_CLEAN_DROPLET_LEAK]');
        }
      }
      if (!normalizedPrompt.includes('SURFACE_WETNESS_RULE: dry-clean.')) {
        throw new Error('[PIPELINE_INTEGRITY_FAILURE:MACRO_CLEAN_RULE_MISSING]');
      }
    }
  }

  if (visualStyle) {
    const required = [
      'VISUAL_STYLE_MODE:',
      'VISUAL_STYLE_CATEGORY:',
      'VISUAL_STYLE_NAME:',
      'VISUAL_STYLE_SCENE:',
    ];
    for (const token of required) {
      if (!normalizedPrompt.includes(token)) {
        throw new Error('[PIPELINE_INTEGRITY_FAILURE:VISUAL_STYLE_CONTRACT_MISSING]');
      }
    }

    const expectedName = normalizeVisualStyleName(visualStyle);
    if (!expectedName || !normalizedPrompt.includes(`VISUAL_STYLE_NAME: ${expectedName}.`)) {
      throw new Error('[PIPELINE_INTEGRITY_FAILURE:VISUAL_STYLE_NAME_MISMATCH]');
    }
  }

  const blocks = extractPromptBlocks(prompt);
  const seen = new Set<string>();
  for (const block of blocks) {
    if (seen.has(block)) {
      throw new Error('[PIPELINE_INTEGRITY_FAILURE:DUPLICATE_NORMALIZED_BLOCK]');
    }
    seen.add(block);
  }
}

function normalizeVisualStyleName(visualStyle: string): string {
  const map: Record<string, string> = {
    'Clinical Lab Counter': 'clinical-lab-counter',
    'Minimal Bathroom Vanity': 'minimal-bathroom-vanity',
    'Dark Premium Studio': 'dark-premium-studio',
    'Tech Clean Studio': 'tech-clean-studio',
    'Brand Campaign': 'brand-campaign',
    'Creator Premium Simulation': 'creator-premium-simulation',
    'Soft Wellness Morning': 'soft-wellness-morning',
    'Outdoor Energy Boost': 'outdoor-energy-boost',
    'Sunlit Stone Editorial': 'sunlit-stone-editorial',
    'Golden Sunset Backlit': 'golden-sunset-backlit',
    'Bathroom Daylight Clean': 'bathroom-daylight-clean',
    'Sky Float Minimal': 'sky-float-minimal',
    'Wet Rock Ripples': 'wet-rock-ripples',
    'Sand Palm Shadows': 'sand-palm-shadows',
    'Botanical Water Garden': 'botanical-water-garden',
    'Warm Window Wood': 'warm-window-wood',
  };
  return map[String(visualStyle || '').trim()] || '';
}

export function __validateFinalPromptForTest(prompt: string, state: StudioUIState): void {
  assertFinalPromptIntegrity(prompt, state);
}

function resolveEnvironmentLabel(state: StudioStateDebug): string {
  return String(state.environmentPreset || state.environment || state.contextPresetValue || '');
}

function resolveLightingLabel(state: StudioStateDebug): string {
  return String(state.lighting || state.lightingPreset || state.lightingMode || state.basicLighting || '');
}

export function __buildOrderedSegmentsForTest(state: StudioUIState): PipelinePromptSegment[] {
  const debugState = state as StudioStateDebug;
  const authority = resolveStudioAuthority(state);
  const modifiers = getAllowedStudioModifiers(authority, state);
  const protectionLayer = buildProtectionLayer(authority, state);
  const profile = resolveIndustryProfileModule(state.industryProfile);
  // eslint-disable-next-line no-console
  console.log('[STUDIO V2 STATE]', {
    ...state,
    environment: debugState.environment,
    environmentPreset: debugState.environmentPreset,
    lighting: debugState.lighting,
    lightingPreset: debugState.lightingPreset,
  });
  // eslint-disable-next-line no-console
  console.log('[ENVIRONMENT RESOLVED]', resolveEnvironmentLabel(debugState));
  // eslint-disable-next-line no-console
  console.log('[LIGHTING RESOLVED]', resolveLightingLabel(debugState));

  const studioBlocks = [
    buildPalette(state),
    buildIntent(authority, state),
    buildProductCharacter(state),
    buildArtworkImmutability(),
    buildCameraOverrides(state),
    buildComposition(authority, state),
    buildPhotoModeDynamic(state),
    buildWorld(authority, state.world, state),
    buildEnvironmentStyle(state),
    buildVisualStyle(state),
    buildLighting(authority, state),
    buildMotion(authority, state),
    buildInteraction(authority, state),
    buildPhysics(authority, state),
    buildPhysicalPresence(state),
    buildModifiers(modifiers, state),
    buildMaterials(authority, state),
    buildProductPhysical(state, profile),
    buildGeometry(authority, state),
    buildProductOrientation(state),
    buildIngredients(state),
    ...protectionLayer,
    ...buildAdvancedOverrideParts(state),
  ];

  const industryInjected = buildIndustrySegments(state, studioBlocks);
  const sanitizedParts = sanitizePromptParts(industryInjected);
  const segments = toOrderedSegments(sanitizedParts);

  // eslint-disable-next-line no-console
  console.log('[INDUSTRY ACTIVE]', state.industryProfile);
  // eslint-disable-next-line no-console
  console.log('[ACTIVE BUILDERS]', segments.map((s) => s.type));
  // eslint-disable-next-line no-console
  console.log('[PROMPT PARTS COUNT]', sanitizedParts.length);
  return segments;
}

export function __buildPromptForTest(state: StudioUIState): string {
  const authority = resolveStudioAuthority(state);
  const finalPrompt = finalizePromptFromSegments(__buildOrderedSegmentsForTest(state), authority);
  assertFinalPromptIntegrity(finalPrompt, state);
  return finalPrompt;
}

export const __buildSegmentsForTest = __buildOrderedSegmentsForTest;

export const genericPipeline = {
  build(state: StudioUIState): string {
    /*
     * Protected baseline coverage:
     * - segment ordering
     * - splash ownership
     * - nature anchors
     * - lighting priority
     * - assembler block boundaries
     * - protected baseline snapshots
     */
    const debugState = state as StudioStateDebug;
    const authority = resolveStudioAuthority(state);
    const modifiers = getAllowedStudioModifiers(authority, state);
    const protectionLayer = buildProtectionLayer(authority, state);
    const profile = resolveIndustryProfileModule(state.industryProfile);
    // eslint-disable-next-line no-console
    console.log('[STUDIO V2 STATE]', {
      ...state,
      environment: debugState.environment,
      environmentPreset: debugState.environmentPreset,
      lighting: debugState.lighting,
      lightingPreset: debugState.lightingPreset,
    });
    // eslint-disable-next-line no-console
    console.log('[ENVIRONMENT RESOLVED]', resolveEnvironmentLabel(debugState));
    // eslint-disable-next-line no-console
    console.log('[LIGHTING RESOLVED]', resolveLightingLabel(debugState));

    const studioBlocks = [
      buildPalette(state),
      buildIntent(authority, state),
      buildProductCharacter(state),
      buildArtworkImmutability(),
      buildCameraOverrides(state),
      buildComposition(authority, state),
      buildPhotoModeDynamic(state),
      buildWorld(authority, state.world, state),
      buildEnvironmentStyle(state),
      buildVisualStyle(state),
      buildLighting(authority, state),
      buildMotion(authority, state),
      buildInteraction(authority, state),
      buildPhysics(authority, state),
      buildPhysicalPresence(state),
      buildModifiers(modifiers, state),
      buildMaterials(authority, state),
      buildProductPhysical(state, profile),
      buildGeometry(authority, state),
      buildProductOrientation(state),
      buildIngredients(state),
      ...protectionLayer,
      ...buildAdvancedOverrideParts(state),
    ];

    const industryInjected = buildIndustrySegments(state, studioBlocks);
    const sanitizedParts = sanitizePromptParts(industryInjected);
    const segments = toOrderedSegments(sanitizedParts);

    // eslint-disable-next-line no-console
    console.log('[INDUSTRY ACTIVE]', state.industryProfile);
    // eslint-disable-next-line no-console
    console.log('[ACTIVE BUILDERS]', segments.map((s) => s.type));
    // eslint-disable-next-line no-console
    console.log('[PROMPT PARTS COUNT]', sanitizedParts.length);

    const finalPrompt = finalizePromptFromSegments(segments, authority);
    assertFinalPromptIntegrity(finalPrompt, state);
    return finalizeWithIndustryValidation(finalPrompt, state);
  },
};
