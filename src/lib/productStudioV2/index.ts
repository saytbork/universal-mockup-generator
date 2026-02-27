export {
  applyWineDeterministicStateMachine,
  resolveDeterministicWineConfig,
  resolveWineEngineVersion,
  buildWineTruthLayerV4,
  buildWineTruthLayer,
  buildWineEnvironment,
  buildWineLighting,
  buildWorld,
  buildLighting,
  buildWineMaterials,
  buildWineModifiers,
  buildWineMinimalGuardrail,
  sanitizeWineV4Prompt,
  dedupeWineStructuralTokens,
  sanitizePromptLexicalGuard,
  finalizePromptFromSegments,
  buildCoffeeIndustryLayer,
  buildArtworkImmutability,
  buildIntent,
  buildCameraOverrides,
  buildComposition,
  buildMotion,
  buildPhysics,
  buildModifiers,
  buildMaterials,
  buildPackaging,
  buildGeometry,
  buildAdvancedOverrideParts,
  buildProtectionLayer,
  injectWineEngine,
  sanitizePromptParts,
  resolveStudioAuthority,
  getAllowedStudioModifiers
};
// import removed: isWineStrictSimulation no longer exported from winePromptHelpers
import { generateWineImage } from './generateWineImage';
import { resolveStudioAuthority } from './authority/studioAuthorityResolver.ts';
import { getAllowedStudioModifiers } from './modifiers/studioModifierRegistry.ts';
import { buildIntent } from './builders/buildIntent.ts';
import { buildArtworkImmutability } from './builders/buildArtworkImmutability.ts';
import { buildWorld } from './builders/buildWorld.ts';
import { buildCoffeeIndustryLayer } from './builders/buildCoffeeIndustryLayer.ts';
import { buildComposition } from './builders/buildComposition.ts';
import { buildCameraOverrides } from './builders/buildCameraOverrides.ts';
import { buildMotion } from './builders/buildMotion.ts';
import { buildPhysics } from './builders/buildPhysics.ts';
import { buildModifiers } from './builders/buildModifiers.ts';
import { buildLighting } from './builders/buildLighting.ts';
import { buildMaterials } from './builders/buildMaterials.ts';
import { buildPackaging } from './builders/buildPackaging.ts';
import { buildUltraReal } from './builders/buildUltraReal.ts';
import { buildGeometry } from './builders/buildGeometry.ts';
import { assembleStudioPrompt } from './assembler/studioAssembler.ts';
import { validateStudioPrompt } from './assembler/studioValidator.ts';
import {
  buildWineTruthLayer,
  type ResolvedWineConfig,
} from './wineConfigResolver.ts';
import { buildWineTruthLayerV4 } from './wineConfigResolverV4.ts';
import type { StudioAuthorityBundle, StudioUIState } from './types/studioTypes.ts';
import { profileRegistry } from './pipelines/profileRegistry';

const STRICT_GUARDRAILS =
  typeof import.meta !== 'undefined' &&
  typeof import.meta.env !== 'undefined' &&
  import.meta.env.VITE_STRICT_GUARDRAILS === 'true';

type PromptSegmentType =
  | 'physics'
  | 'world'
  | 'camera'
  | 'composition'
  | 'interaction'
  | 'guardrail'
  | 'output';

type PromptSegment = {
  type: PromptSegmentType;
  content: string;
};

const FORBIDDEN_TERMS = ['body', 'face'];

function buildProtectionLayer(authority: StudioAuthorityBundle, state?: StudioUIState): string[] {
  const isWineIndustry = String(state?.visualProfile || '').trim().toLowerCase() === 'wine';
  if (!STRICT_GUARDRAILS && !isWineIndustry) return [];
  return [buildUltraReal(authority)];
}

function sanitizePromptLexicalGuard(prompt: string): string {
  let next = String(prompt || '');
  for (const term of FORBIDDEN_TERMS) {
    const escaped = term.replace(/\s+/g, '\\s+');
    const regex = new RegExp(`(?<![\\w-])${escaped}(?![\\w-])`, 'gi');
    next = next.replace(regex, '');
  }
  return next.replace(/\s{2,}/g, ' ').trim();
}

function dedupeWineStructuralTokens(prompt: string): string {
  let next = String(prompt || '');
  const dropOncePrefixes = ['ROTATION:', 'FRAMING:'];
  for (const prefix of dropOncePrefixes) {
    const pattern = new RegExp(`${prefix}\\s*[^.]*\\.`, 'gi');
    next = next.replace(pattern, '');
  }

  const keepLastPrefixes = ['FRAME_EDGE_POLICY:'];
  for (const prefix of keepLastPrefixes) {
    const escaped = prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`${escaped}\\s*[^.]*\\.`, 'g');
    const matches = next.match(pattern);
    if (!matches || matches.length < 2) continue;
    let seen = 0;
    const keepIndex = matches.length - 1;
    next = next.replace(pattern, (match) => {
      const keep = seen === keepIndex ? match : '';
      seen += 1;
      return keep;
    });
  }
  return next.replace(/\s{2,}/g, ' ').trim();
}

function pushSegment(segments: PromptSegment[], type: PromptSegmentType, content: string): void {
  const normalized = String(content || '').trim();
  if (!normalized) return;
  segments.push({ type, content: normalized });
}

function validateHumanPolicy(interactionLayer: string): void {
  const interaction = String(interactionLayer || '').trim().toLowerCase();
  if (!interaction) return;

  const forbiddenTerms = [
    'person',
    'people',
    'human',
    'model',
    'face',
    'body',
    'torso',
    'full figure',
    'woman',
    'man',
    'girl',
    'boy',
    'selfie',
    'ugc',
    'lifestyle',
  ];

  for (const term of forbiddenTerms) {
    const escaped = term.replace(/\s+/g, '\\s+');
    const regex = new RegExp(`(?<![\\w-])${escaped}(?![\\w-])`, 'i');
    if (regex.test(interaction)) {
      throw new Error(`Studio interaction policy rejected forbidden human term: "${term}"`);
    }
  }
}

function finalizePromptFromSegments(
  segments: PromptSegment[],
  authority: StudioAuthorityBundle
): string {
  const interactionLayer = segments
    .filter((segment) => segment.type === 'interaction')
    .map((segment) => segment.content)
    .join(' ');
  validateHumanPolicy(interactionLayer);

  // DISABLED: Minimal physical prompt early-return for wine served mode
  // This was preventing wine environment and proper world/composition blocks from injecting
  // Wine now goes through normal pipeline flow to get complete prompt structure
  
  const contents = segments.map((segment) => segment.content).filter(Boolean);

  const validationPrompt = assembleStudioPrompt(contents);
  const sanitizedValidationPrompt = sanitizeFinalPromptOutput(validationPrompt);
  validateStudioPrompt(sanitizedValidationPrompt, authority);

  const finalPrompt = contents.join(' ').replace(/\s{2,}/g, ' ').trim();
  return sanitizeFinalPromptOutput(finalPrompt);
}

function injectWineEngine(parts: string[], state: StudioUIState): string[] {
  const next = [...parts];
  next.push('LIQUID_ENGINE: active');
  // Avoid forbidden term "model" in Product Studio prompts.
  next.push('LIQUID_PHYSICS_SYSTEM: deterministic');

  const wineAction = String(state.wineAction || '').trim().toLowerCase();
  if (wineAction === 'controlled-pour' || wineAction === 'controlled pour') {
    next.push('LIQUID_FLOW: gravitational arc');
    next.push('GLASS_VOLUME_CONSERVATION: enforced');
    next.push('MENISCUS: visible');
    next.push('HEADSPACE: realistic');
  }

  const glassMode = String((state as any).wineGlassMode || '').trim().toLowerCase();
  if (glassMode === 'filled') {
    next.push('GLASS_LIQUID_SYNC: bottle-consistent');
  }

  const closureType = String((state as any).wineClosureType || '').trim().toLowerCase();
  if (closureType && closureType !== 'from-reference' && closureType !== 'from reference') {
    next.push('CAP_PRESERVATION: strict');
  }

  return next;
}

function buildAdvancedOverrideParts(state: StudioUIState): string[] {
  const lensOverride = String(state.lensOverride || '').trim();
  const lightingRigOverride = String(state.lightingRigOverride || '').trim();
  const finishOverride = String(state.finishOverride || '').trim();
  const gelColor = String(state.customLightColor || '').trim().toUpperCase();
  const gelIntensity = Number(state.accentLightIntensity ?? 50);
  const hasAccentGel = Boolean(gelColor && gelColor !== '#FFFFFF' && /^#[0-9A-F]{6}$/.test(gelColor));
  const advancedOverrideActive = Boolean(
    state.advancedControls && (lensOverride || lightingRigOverride || finishOverride || hasAccentGel)
  );

  console.log('[ADVANCED_OVERRIDE_ACTIVE]', advancedOverrideActive);
  if (!advancedOverrideActive) {
    console.log('[RESOLVED_LENS]', '');
    console.log('[RESOLVED_LIGHTING]', '');
    console.log('[RESOLVED_FINISH]', '');
    return [];
  }

  let resolvedLens = '';
  let resolvedLighting = '';
  let resolvedFinish = '';

  if (lensOverride) {
    resolvedLens = lensOverride;
  }

  if (lightingRigOverride) {
    resolvedLighting = lightingRigOverride;
  }

  if (finishOverride) {
    resolvedFinish = finishOverride;
  }

  const advancedParts: string[] = [];
  if (resolvedLens) {
    advancedParts.push(`LENS_PROFILE: ${resolvedLens}.`);
  }
  if (resolvedLighting) {
    advancedParts.push(`STUDIO_LIGHTING_PROFILE: ${resolvedLighting}.`);
  }
  if (hasAccentGel && resolvedLighting && !/\bnatural-light\b/i.test(resolvedLighting)) {
    advancedParts.push(`ACCENT_LIGHT_GEL: ${gelColor} at ${gelIntensity}% attached to resolved lighting.`);
  }
  if (resolvedFinish) {
    advancedParts.push(`STUDIO_FINISH_PROFILE: ${resolvedFinish}.`);
  }

  const forbiddenKeys = new Set([
    'STUDIO_WORLD',
    'STUDIO_VISUAL_INTENT',
    'WINE_TYPE',
    'WINE_LIQUID_PHYSICS',
    'WINE_ENVIRONMENT_VARIATION',
    'WINE_ENVIRONMENT_CONTEXT',
  ]);
  for (const part of advancedParts) {
    const key = getPartKey(part);
    if (forbiddenKeys.has(key)) {
      throw new Error(`[ADVANCED_OVERRIDE_INVALID] Advanced overrides cannot inject ${key}`);
    }
  }

  console.log('[RESOLVED_LENS]', resolvedLens);
  console.log('[RESOLVED_LIGHTING]', resolvedLighting);
  console.log('[RESOLVED_FINISH]', resolvedFinish);

  return advancedParts;
}

function getPartKey(part: string): string {
  const idx = part.indexOf(':');
  if (idx <= 0) return part.trim().slice(0, 48);
  return part.slice(0, idx).trim().toUpperCase();
}

function countEnvironmentBlocks(parts: string[]): number {
  return parts.filter((part) => {
    const key = getPartKey(part);
    return (
      key === 'STUDIO_WORLD' ||
      key === 'WINE_ENVIRONMENT_VARIATION' ||
      key === 'WINE_ENVIRONMENT_CONTEXT' ||
      key === 'WINE_ENVIRONMENT'
    );
  }).length;
}

function sanitizePromptParts(parts: string[]): string[] {
  const output: string[] = [];
  const seen = new Set<string>();

  for (const raw of parts) {
    const part = String(raw || '').trim();
    if (!part) continue;
    const key = getPartKey(part);

    const dedupeKey = key || part;
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);
    output.push(part);
  }

  if (countEnvironmentBlocks(output) > 1) {
    throw new Error('Multiple environment injectors detected');
  }

  return output;
}

function sanitizeFinalPromptOutput(finalPrompt: string): string {
  const sanitized = finalPrompt.replace(/\bidentity\b/gi, 'integrity');
  if (/\bidentity\b/i.test(sanitized)) {
    console.error('[PROMPT SANITIZATION ERROR] identity token still present after replacement');
    throw new Error('Prompt output still contains forbidden token: identity');
  }
  return sanitized;
}

function normalizeWineValue(value: unknown): string {
  return String(value || '').trim().toLowerCase();
}

// Backwards-compatible mapping: derive a binary serveState from older UI fields.
function resolveServeState(state: StudioUIState): 'none' | 'served' {
  const amount = normalizeWineValue((state as StudioUIState & { wineServeAmount?: string }).wineServeAmount);
  const glassMode = normalizeWineValue(state.wineGlassMode);
  const bottleState = normalizeWineValue(state.wineBottleState) === 'sealed' ? 'sealed' : 'open';

  if (bottleState === 'sealed') return 'none';
  // Explicit filled mode or any declared serve amount implies served
  if (glassMode === 'filled') return 'served';
  if (amount) return 'served';
  return 'none';
}

function resolveWineClosureType(state: StudioUIState): string {
  const normalized = normalizeWineValue(state.wineClosureType);
  if (!normalized || normalized === 'from-reference' || normalized === 'from reference') return 'from-reference';
  if (normalized.includes('crown')) return 'crown-cap';
  if (normalized.includes('screw')) return 'screw-cap';
  if (normalized.includes('synthetic')) return 'synthetic-closure';
  if (normalized.includes('cork')) return 'natural-cork';
  return 'from-reference';
}

function resolveDeterministicWineConfig(state: StudioUIState): ResolvedWineConfig {
  const serveState = resolveServeState(state);
  
  // HARD ENFORCEMENT: if serveState='served', bottle MUST be open (never sealed)
  const bottleState = serveState === 'served' 
    ? 'open' 
    : (normalizeWineValue(state.wineBottleState) === 'sealed' ? 'sealed' : 'open');
  
  const bottleFillState = serveState === 'served' ? 'clearly-partially-consumed' : 'retail-full';

  return {
    closureType: resolveWineClosureType(state),
    bottleState,
    serveState,
    bottleFillState,
  };
}

function resolveWineEngineVersion(state: StudioUIState): number {
  const version = Number(state.wineEngineVersion || 3);
  return Number.isFinite(version) ? version : 3;
}

function applyWineDeterministicStateMachine(state: StudioUIState): StudioUIState {
  const config = resolveDeterministicWineConfig(state);
  const wineBottleState = config.bottleState === 'sealed' ? 'sealed' : 'opened-with-cork-nearby';
  const wineGlassMode =
    config.serveState === 'none'
      ? normalizeWineValue(state.wineGlassMode) === 'none'
        ? 'none'
        : 'empty'
      : 'filled';

  return {
    ...state,
    wineBottleState,
    wineGlassMode,
  };
}

function buildWineEnvironment(state: StudioUIState): string {
  const variation = String(state.wineEnvironmentVariation || '').trim();
  if (!variation) return '';

  const narrativeMap: Record<string, string> = {
    vineyard:
      'Vineyard at golden hour. Long parallel rows of grapevines receding into the distance. Warm amber-orange sunlight from low angle. Bokeh depth — background recognizably vineyard, slightly soft but NOT fully blurred. Earthy tones, golden haze in the air. Wooden surface in foreground. Sunlight catches bottle and glass edges.',
    'dark-cellar':
      'Aged oak barrel cellar. Stone walls with moss texture. Wooden barrel staves visible in the background, clearly identifiable. Moody warm amber side light. Background moderately soft but barrels recognizable. Candlelight-warm tones. Moist cellar atmosphere with subtle depth haze.',
    'marble-bar':
      'Luxury marble bar counter. White and grey veined marble surface. Polished black background with dim overhead spotlights. Background slightly soft but marble texture still visible. Premium bar atmosphere. Cool neutral-warm light blend. Reflections on polished surface.',
    'minimal-gradient':
      'Minimal gradient backdrop. Soft warm gradient from deep charcoal to warm grey. Clean studio floor line. No distracting elements. Background fully in focus as it is flat. Subtle vignette at edges.',
    'black-studio':
      'Dark premium studio. Matte black backdrop. Controlled directional key light from upper-left. Deep shadows on right side. Dramatic subject separation. Background fully in focus as it is flat. Stone or slate surface under the bottle.',
    'modern-kitchen':
      'Modern kitchen countertop. Light marble or quartz counter surface. Kitchen cabinets visible in background, slightly soft but recognizable. Natural window light from the side. Clean and editorial.',
    'luxury-dining':
      'Fine dining table. Dark polished wood surface. Linen texture visible. Candlelight and warm pendant lights in background, slightly soft but recognizable warm orbs. White tablecloth. Intimate restaurant atmosphere.',
    'moody-backlight':
      'Moody backlit scene. Strong backlight creating a rim glow around bottle and glass. Dark foreground. Background extremely dark with subtle atmospheric haze. Cinematic tone.',
    'sunlit-table':
      'Sunlit outdoor table. Warm natural daylight. Stone or weathered wood table surface. Green foliage in the background, slightly soft but color clearly present. Soft shadow cast by bottle.',
    'architectural-shadow':
      'Architectural shadow scene. Geometric shadow lines across the surface. Neutral concrete or plaster background. Strong directional natural light creating graphic shadow patterns.',
  };

  const narrative = narrativeMap[variation] || narrativeMap['black-studio'];
  const envBlock = `WINE_ENVIRONMENT: ${narrative}`;

  // CRITICAL: When served, the environment is BACKGROUND ONLY.
  // The bottle physical state (open, half-empty, cap on surface, glass with wine) is ALREADY FIXED
  // and must NOT be altered by the background/environment preset.
  // Outdoor/natural environments (vineyard, sunlit-table) are especially prone to trigger
  // the model's "closed bottle in field" advertising pattern — this anchor prevents that.
  const serveStateVal = String((state as any).serveState || '').toLowerCase();
  if (serveStateVal === 'served') {
    return envBlock + ' ENVIRONMENT_PHYSICS_OVERRIDE: The background setting described above is ONLY the backdrop. It does NOT change the bottle state. The bottle remains open and half-empty with a wine glass filled with wine next to it. The closure has already been removed (exactly one detached closure is on the surface). Do not apply any advertising/closed-bottle pattern based on the background scene.';
  }

  return envBlock;
}

function buildWineLighting(state?: StudioUIState): string {
  const tone = String((state as any)?.wineLightingTone || '').trim();
  const toneMap: Record<string, string> = {
    'Warm Lateral': 'Warm lateral key light from the side. Soft falloff. Controlled glass highlights.',
    'Golden Ambient': 'Diffused golden ambient light. Warm all-around glow. Soft lens flare. Glowing atmosphere around bottle.',
    'Cellar Dramatic': 'Dramatic low-key side light. Deep shadows on opposite side. Strong subject separation. Theatrical contrast.',
    // NOTE: "Soft glow on label" removed — lighting descriptions must not reference label content
    'Candle Intimate': 'Intimate warm candlelight. Flickering orange-amber tones. Warm bottle surface tone. Dark surroundings.',
  };
  const description = toneMap[tone] || toneMap['Warm Lateral'];
  return `WINE_LIGHTING: ${description}`;
}

function buildWineModifiers(_state: StudioUIState): string {
  // WINE_MOOD and aesthetic modifier injection eliminated — Step 1 conflict cleanup.
  // Mood tokens (Film Grain, Terroir Tone, Reflection Layer) caused synthetic/CGI
  // aesthetic stacking. Physical realism is enforced via REAL_WORLD_PHOTOGRAPHY_MODE
  // and the BAN_LIST in buildWineRealismCore(). Returning empty string always.
  return '';
}

function buildWineMinimalGuardrail(): string {
  return [
    'PHOTOGRAPHIC_AUTHENTICITY:',
    'Natural real-world capture.',
    'Subtle sensor noise in midtones.',
    'Tiny optical imperfections.',
    'Lens breathing micro-distortion.',
    'Imperfect highlight bloom.',
    'No render-engine polish.',
    'No CGI precision.',
    'Gravity consistency.',
  ].join(' ');
}

/**
 * REAL_WORLD_PHOTOGRAPHY_MODE block — Step 3 realism rebuild.
 * Inserted after LABEL_FINAL_ANCHOR in the prompt hierarchy.
 * Single authoritative block covering camera, light, environment, material, grade, and ban list.
 * Must not be duplicated. Must not be overridden by aesthetic layers.
 */
export function buildWineRealismCore(): string {
  return [
    'REAL_WORLD_PHOTOGRAPHY_MODE: enabled.',
    'CAMERA: Captured on professional full-frame camera. 85mm lens. f/2.8 aperture. Natural depth falloff. Slight edge softness. No hyper-digital clarity. No extreme depth manipulation. No artificial tilt.',
    'LIGHT_SOURCE: Single directional warm key light. Natural falloff — not perfectly smooth. Slight color temperature variance across the scene. Non-uniform highlight intensity. No artificial halo. No volumetric glow. No studio-grade evenness. No Unreal-style lighting.',
    'GLASS_MATERIAL: Slight micro waviness in glass surface. Subtle refractive distortion at bottle edges. Non-uniform highlight intensity across glass body. Very subtle surface scuffs or cleaning marks. No perfectly symmetrical highlight strips. No plastic-looking specular.',
    'LABEL_MATERIAL: Microscopic paper texture visible under raking light. Slight edge lift or micro-shadow along label border. Very subtle print ink variation. Label surface preserved from reference — no material reinterpretation.',
    'SURFACE_MATERIAL: Tiny dust particles on table surface. Slight uneven wood grain or stone irregularity. Real texture, not procedural smoothness.',
    'SHADOW_QUALITY: Soft irregular shadow edges. Natural penumbra variation. Not mathematically perfect falloff.',
    'COLOR_GRADING: Subtle cinematic grade. No oversaturation. No heavy vignette. No synthetic bloom. Natural tonal contrast only.',
    'BAN_LIST: No CGI plastic reflections. No hyper-polished render look. No perfectly uniform glass thickness. No symmetrical highlight strips. No noise-free shadow gradients. No render-engine precision. No Blender/Unreal/3D render aesthetic. No volumetric god rays. No gradient studio backdrop. No Film Grain filter. No Terroir Mood overlay. No Elegant Reflection Layer. No clinical-softbox bloom.',
  ].join(' ');
}

/**
 * TEXT_INTEGRITY_CONSTRAINT — terminal segment injected at end of all wine prompts.
 * Prevents generative text drift on label, neck foil, back label, or any bottle surface.
 * Must be the last segment before the final guardrail so it overrides any upstream text hints.
 * Do NOT describe label content in any other segment.
 */
export function buildWineTextIntegrityConstraint(): string {
  return [
    'TEXT_INTEGRITY_CONSTRAINT:',
    'No new text may appear anywhere on the product.',
    'No alteration of brand name, product name, varietal, vintage year, or any label text.',
    'No invented typography. No replacement of words. No added slogans. No removed text.',
    'All visible text on the bottle — front label, back label, neck foil, capsule — must match the reference image exactly.',
    'Text reproduction must be character-accurate, not paraphrased or approximated.',
    'If text cannot be reproduced with full fidelity, the reference image label region must be preserved unchanged.',
  ].join(' ');
}

function buildWineMaterials(serveState?: string): string {
  const isServed = String(serveState || '').toLowerCase() === 'served';
  if (isServed) {
    return [
      'MATERIALS:',
      'Authentic glass with natural surface micro-imperfections.',
      'Natural liquid translucency with organic color variation.',
      'No plastic CGI sheen. No hyper-clean bottle surface.',
    ].join(' ');
  }
  return [
    'MATERIALS:',
    'Authentic glass with natural surface micro-imperfections.',
    'Natural liquid translucency with organic color variation.',
    'No plastic CGI sheen. No hyper-clean bottle surface.',
    // Label is a locked photographic surface — not a material to describe or regenerate
    'Label surface: preserve from reference exactly. No material reinterpretation of label.',
  ].join(' ');
}

function sanitizeWineV4Prompt(prompt: string): string {
  return String(prompt || '')
    .replace(/STUDIO_VISUAL_INTENT:[^.]*\./gi, ' ')
    .replace(/STUDIO_CAMERA_SYSTEM:[^.]*\./gi, ' ')
    .replace(/STUDIO_CAMERA_DISTANCE:[^.]*\./gi, ' ')
    .replace(/LENS_PROFILE:[^.]*\./gi, ' ')
    .replace(/DISTORTION:[^.]*\./gi, ' ')
    .replace(/DEPTH_STYLE:[^.]*\./gi, ' ')
    .replace(/STUDIO_FRAMING_GUIDE:[^.]*\./gi, ' ')
    .replace(/STUDIO_CAMERA_\s*/g, ' ')
    .replace(/STUDIO_PRODUCT_MOTION:[^.]*\./gi, ' ')
    .replace(/STUDIO_MODIFIERS:\s*wine-prestige\./gi, ' ')
    .replace(/STUDIO_COMPOSITION_MODEL:[^.]*\./gi, ' ')
    .replace(/FRAME_EDGE_POLICY:[^.]*\./gi, ' ')
    .replace(/PHOTO_TYPE:[^.]*\./gi, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export function generateStudioPromptV2(state: StudioUIState): string {
  // Match legacy: do NOT throw for Wine strict simulation here
  const profile = state.visualProfile || 'generic';
  const pipeline = profileRegistry[profile as keyof typeof profileRegistry] || profileRegistry.generic;
  return pipeline.build(state);
}

export type {
  StudioUIState,
  StudioAuthorityBundle,
  StudioCreativeIntent,
  StudioWorld,
  StudioMotion,
  StudioComposition,
} from './types/studioTypes.ts';

export type { StudioModifier } from './modifiers/studioModifierRegistry.ts';
