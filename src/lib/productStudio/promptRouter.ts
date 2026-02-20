import type { IndustryProfile, ProductAsset, ProductStudioState } from './types';
import { mapSceneToPrompt, type ScenePromptResult } from './mapSceneToPrompt';
import { generateStudioPromptV2, type StudioUIState } from '../productStudioV2/index';
import { isWinePrestigeMode, isWinePrestigeV2Mode } from './winePrestige';
import { industryRules } from './industryRules';

const normalize = (value: unknown): string => String(value || '').trim().toLowerCase();

function isStudioV2Enabled(): boolean {
  const flag = import.meta.env.VITE_USE_STUDIO_V2;
  const enabled = flag === 'true';
  console.log(
    `[STUDIO ROUTER] flag v2=${flag ?? 'undefined'} source=vite enabled=${enabled}`
  );
  return enabled;
}

function inferStudioWorld(state: ProductStudioState): StudioUIState['world'] | undefined {
  const explicitWorld = normalize((state as any).world);
  const explicitEnvironment = normalize((state as any).environment);
  const explicitEnvironmentContext =
    normalize((state as any).environmentContext?.macro) || normalize((state as any).environmentContext?.micro);
  const source = `${explicitWorld} ${explicitEnvironment} ${explicitEnvironmentContext}`.trim();

  if (!source) return undefined;
  if (source.includes('underwater')) return 'underwater';
  if (source.includes('splash') || source.includes('foam') || source.includes('pool water') || source.includes('tank')) {
    return 'splash-tank';
  }
  if (source.includes('studio')) return 'studio';
  return undefined;
}

function inferStudioComposition(state: ProductStudioState): StudioUIState['composition'] {
  const composition = normalize((state as any).composition);
  if (composition === 'flatlay') return 'flat-lay';
  if (composition === 'grid' || composition === 'grid-ready') return 'carousel';
  if (composition === 'macro') return 'macro';

  if (state.photoMode === 'Textured Bed / Scatter Base') return 'flat-lay';
  if (state.photoMode === 'Ingredient Flat Lay') return 'flat-lay';
  if (state.photoMode === 'Ingredient Stack') return 'ingredient-stack';
  if (state.photoMode === 'Macro Dew Label' || state.distance === 'macro') return 'macro';
  if (state.photoMode === 'Routine Carousel') return 'carousel';
  return 'hero';
}

function inferStudioMotion(state: ProductStudioState): StudioUIState['motion'] {
  if (state.photoMode === 'Textured Bed / Scatter Base') {
    return 'static';
  }
  if (state.photoMode === 'Hands Application Clean') {
    const handPose = String((state as any).photoModeConfig?.dynamic?.['Hands Application Clean']?.handPose || '')
      .trim()
      .toLowerCase();
    if (handPose === 'applying' || handPose === 'opening') return 'dispensed';
  }
  if (state.stateMotion === 'falling') return 'falling';
  if (state.stateMotion === 'dispensed') return 'dispensed';
  if (state.stateMotion === 'pouring' || state.stateMotion === 'spilled') return 'pouring';
  return 'static';
}

function inferStudioIntent(state: ProductStudioState): StudioUIState['creativeIntent'] {
  if (state.qualityProfile === 'clinical') return 'clinical';
  if (state.qualityProfile === 'luxury-brand') return 'luxury';
  if (state.visualIntent === 'campaign') return 'campaign';
  return 'conversion';
}

function inferSubjectOrientation(state: ProductStudioState): StudioUIState['subjectOrientation'] {
  const type = normalize(state.definition.type);
  if (type === 'drops' || type === 'skincare') return 'vertical';
  return 'square';
}

function inferLightingOverride(state: ProductStudioState): string | undefined {
  const rig = String((state as any).lightingRig || '').trim();
  const style = String((state as any).lighting || '').trim();
  if (rig && style) return `${rig}; ${style}`;
  if (rig) return rig;
  if (style) return style;
  return undefined;
}

function inferRequestedModifiers(state: ProductStudioState): StudioUIState['requestedModifiers'] {
  const requested = new Set<string>();

  const photoMode = String(state.photoMode || '').toLowerCase();
  const allText = [
    photoMode,
    String((state as any).props || '').toLowerCase(),
    ...(Array.isArray((state as any).selectedProps) ? (state as any).selectedProps.map((v: unknown) => String(v).toLowerCase()) : []),
    ...(Array.isArray((state as any).specialEffects) ? (state as any).specialEffects.map((v: unknown) => String(v).toLowerCase()) : []),
  ];
  const haystack = allText.join(' | ');

  if (haystack.includes('splash') || haystack.includes('pool water') || haystack.includes('underwater')) {
    requested.add('splash');
  }
  if (haystack.includes('foam')) {
    requested.add('foam');
  }
  if (haystack.includes('condensation')) {
    requested.add('condensation');
  }
  if (haystack.includes('ice')) {
    requested.add('ice');
  }
  if (haystack.includes('fruit') || haystack.includes('citrus') || haystack.includes('garnish')) {
    requested.add('fruit');
  }
  if (haystack.includes('textured bed') || haystack.includes('scatter base') || haystack.includes('stone') || haystack.includes('sand')) {
    requested.add('texturedBed');
  }
  if (haystack.includes('particle')) {
    requested.add('particles');
  }
  if (haystack.includes('acrylic')) {
    requested.add('acrylic');
  }

  return Array.from(requested) as StudioUIState['requestedModifiers'];
}

const PRODUCT_TYPE_TO_LABEL: Record<ProductStudioState['definition']['type'], string> = {
  capsules: 'Capsules',
  gummies: 'Gummies',
  drops: 'Drops',
  powder: 'Powder',
  skincare: 'Skincare',
  device: 'Device',
  custom: 'Custom',
  dummy: 'Custom',
};

const VISUAL_STYLE_MODES = new Set([
  'Clinical Lab Counter',
  'Minimal Bathroom Vanity',
  'Dark Premium Studio',
  'Monochrome Brand',
  'Brand Campaign',
  'Creator Premium Simulation',
  'Tech Clean Studio',
  'Soft Wellness Morning',
  'Outdoor Energy Boost',
  'Sunlit Stone Editorial',
  'Golden Sunset Backlit',
  'Bathroom Daylight Clean',
  'Sky Float Minimal',
  'Wet Rock Ripples',
  'Sand Palm Shadows',
  'Botanical Water Garden',
  'Warm Window Wood',
]);

const SPECIAL_EFFECT_MODES = new Set([
  'Splash Shot',
  'Beach Foam Splash',
  'Pool Water',
  'Cheers (Hands Clink)',
  'Acrylic Blocks',
  'Foam & Texture',
  'Ice Cubes',
  'Condensation Droplets',
  'Fruit Garnish / Citrus Accents',
  'Textured Bed / Scatter Base',
  'Floating Particles',
  'Gel Smear Editorial',
  'Underwater Split',
  'Wet Rock Ripples',
]);

function resolveIndustryProfile(visualProfile: ProductStudioState['visualProfile']): IndustryProfile {
  if (visualProfile === 'wine-prestige') return 'wine';
  if (visualProfile === 'default') return 'supplements';
  return visualProfile as IndustryProfile;
}

function inferCameraSystemOverride(state: ProductStudioState): string {
  const byKey: Record<ProductStudioState['cameraSystem'], string> = {
    dslr_mirrorless: 'DSLR / mirrorless camera system',
    macro: 'Macro lens camera system',
    telephoto: 'Telephoto compression camera system',
  };
  const uiLabel = String(state.cameraUiSystemLabel || '').trim();
  return uiLabel || byKey[state.cameraSystem];
}

function inferAngleOverride(state: ProductStudioState): string {
  const byKey: Record<ProductStudioState['angle'], string> = {
    eye_level: 'Eye level',
    '45_hero': '45° hero',
    top_down: 'Top-down flat lay',
    low_angle: 'Low angle',
    high_angle: 'High angle',
    detail_closeup: 'Detail close-up',
  };
  const uiLabel = String(state.cameraUiAngleLabel || '').trim();
  return uiLabel || byKey[state.angle];
}

function inferDistanceOverride(state: ProductStudioState): string {
  const byKey: Record<ProductStudioState['distance'], string> = {
    wide: 'Wide',
    standard: 'Standard',
    tight: 'Tight',
    macro: 'Macro',
  };
  const uiLabel = String(state.cameraUiDistanceLabel || '').trim();
  return uiLabel || byKey[state.distance];
}

function inferRotationOverride(state: ProductStudioState): string {
  const uiLabel = String(state.cameraUiRotationLabel || '').trim();
  if (uiLabel) return uiLabel;
  return `${state.rotation}°`;
}

function inferFramingGuideOverride(state: ProductStudioState): string {
  const byKey: Record<ProductStudioState['framing'], string> = {
    centered_hero: 'Centered hero',
    rule_of_thirds: 'Rule of thirds',
    left_negative: 'Left negative space',
    right_negative: 'Right negative space',
    grid_ready: 'Grid-ready',
  };
  const uiLabel = String(state.cameraUiFramingLabel || '').trim();
  return uiLabel || byKey[state.framing];
}

export function toStudioV2State(state: ProductStudioState): StudioUIState {
  const requestedModifiers = inferRequestedModifiers(state);
  const advancedControls =
    state.controlTier === 'pro' || state.advancedModeEnabled || state.proMode;
  const shouldAssignWineFields = state.visualProfile === 'wine';
  const splashMotionIntensity = String(state.photoModeConfig?.splashShot?.motionIntensity || '').trim();
  const splashFreezeMoment = String(state.photoModeConfig?.splashShot?.freezeMoment || '').trim();
  const splashAdMode =
    String(state.photoMode || '').trim() === 'Splash Shot' &&
    splashMotionIntensity === 'Explosive';
  const winePrestigeMode = isWinePrestigeMode(state);
  const winePrestigeV2Mode = isWinePrestigeV2Mode(state);
  const v2State: StudioUIState = {
    creativeIntent: inferStudioIntent(state),
    world: inferStudioWorld(state),
    motion: inferStudioMotion(state),
    composition: inferStudioComposition(state),
    ...(advancedControls ? { advancedControls: true } : {}),
    lightingModelOverride: inferLightingOverride(state),
    aspectRatio: state.aspectRatio,
    photoMode: state.photoMode,
    subjectOrientation: inferSubjectOrientation(state),
    requestedModifiers,
    // Bundle state (for framing logic)
    ...(state.bundle?.enabled && state.bundle.primaryProductId
      ? { bundle: { enabled: true, primaryProductId: state.bundle.primaryProductId } }
      : {}),
    // Pro Mode light color controls
    ...(state.customLightColor ? { customLightColor: state.customLightColor } : {}),
    ...(state.lightColorTemp ? { lightColorTemp: state.lightColorTemp } : {}),
    ...(state.accentLightIntensity !== undefined ? { accentLightIntensity: state.accentLightIntensity } : {}),
    ...(splashMotionIntensity ? { splashMotionIntensity } : {}),
    ...(splashFreezeMoment ? { splashFreezeMoment } : {}),
    ...(splashAdMode ? { splashAdMode: true } : {}),
    ...(winePrestigeMode ? { winePrestigeMode: true } : {}),
    ...(winePrestigeV2Mode ? { winePrestigeV2Mode: true } : {}),
    ...(shouldAssignWineFields
      ? {
          ...(state.contextPreset ? { wineContextPreset: state.contextPreset } : {}),
          ...(state.wineLightingTone ? { wineLightingTone: state.wineLightingTone } : {}),
          ...(state.wineMoodModifier ? { wineMoodModifier: state.wineMoodModifier } : {}),
          ...(state.wineAction ? { wineAction: state.wineAction } : {}),
          ...(state.winePourStyle ? { winePourStyle: state.winePourStyle } : {}),
        }
      : {}),
    ...(advancedControls
      ? {
          cameraSystemOverride: inferCameraSystemOverride(state),
          angleOverride: inferAngleOverride(state),
          distanceOverride: inferDistanceOverride(state),
          rotationOverride: inferRotationOverride(state),
          framingGuideOverride: inferFramingGuideOverride(state),
        }
      : {}),
    productType: PRODUCT_TYPE_TO_LABEL[state.definition.type],
    specialEffect: SPECIAL_EFFECT_MODES.has(state.photoMode) ? state.photoMode : undefined,
    visualStyle: VISUAL_STYLE_MODES.has(state.photoMode) ? state.photoMode : undefined,
  } as StudioUIState;

  const industryProfile = resolveIndustryProfile(state.visualProfile);
  const rules = industryRules[industryProfile];

  if (rules?.allowedPhotoModes && !rules.allowedPhotoModes.includes(v2State.photoMode || '')) {
    v2State.photoMode = rules.allowedPhotoModes[0];
  }

  if (rules?.allowedProductTypes && !rules.allowedProductTypes.includes(v2State.productType || '')) {
    if (industryProfile === 'wine' && v2State.productType !== 'Custom') {
      console.warn('Wine profile forcing Custom product type');
    }
    v2State.productType = rules.allowedProductTypes[0];
  }

  if (rules?.allowedSpecialEffects && v2State.specialEffect && !rules.allowedSpecialEffects.includes(v2State.specialEffect)) {
    v2State.specialEffect = undefined;
  }

  if (rules?.allowedVisualStyles && v2State.visualStyle && !rules.allowedVisualStyles.includes(v2State.visualStyle)) {
    v2State.visualStyle = rules.allowedVisualStyles[0];
  }

  return v2State;
}

function mapV2ToScenePromptResult(prompt: string): ScenePromptResult {
  return {
    prompt,
    mode: 'HERO_NEUTRAL',
    splashMode: undefined,
    randomSeed: 'studio-v2',
  };
}

export function routeStudioScenePrompt(state: ProductStudioState, product?: ProductAsset | null): ScenePromptResult {
  if (!isStudioV2Enabled()) {
    console.log('[STUDIO ROUTER] engine=legacy');
    return mapSceneToPrompt(state, product);
  }

  console.log('[STUDIO ROUTER] engine=v2');
  const v2State = toStudioV2State(state);
  console.log('[STUDIO ROUTER] v2-state', v2State);
  const v2Prompt = generateStudioPromptV2(v2State);
  return mapV2ToScenePromptResult(v2Prompt);
}

export { isStudioV2Enabled };
