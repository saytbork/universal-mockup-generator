import type { ProductAsset, ProductStudioState } from './types';
import { mapSceneToPrompt, type ScenePromptResult } from './mapSceneToPrompt';
import { generateStudioPromptV2, type StudioUIState } from '../productStudioV2/index';

const normalize = (value: unknown): string => String(value || '').trim().toLowerCase();

function isStudioV2Enabled(): boolean {
  const flag = import.meta.env.VITE_USE_STUDIO_V2;
  const enabled = flag === 'true';
  console.log(
    `[STUDIO ROUTER] flag v2=${flag ?? 'undefined'} source=vite enabled=${enabled}`
  );
  return enabled;
}

function inferStudioWorld(state: ProductStudioState): StudioUIState['world'] {
  const mode = normalize(state.photoMode);
  if (mode.includes('underwater')) return 'underwater';
  if (mode.includes('splash') || mode.includes('foam') || mode.includes('pool water')) return 'splash-tank';
  return 'studio';
}

function inferStudioComposition(state: ProductStudioState): StudioUIState['composition'] {
  if (state.photoMode === 'Ingredient Flat Lay') return 'flat-lay';
  if (state.photoMode === 'Ingredient Stack') return 'ingredient-stack';
  if (state.photoMode === 'Macro Dew Label' || state.distance === 'macro') return 'macro';
  if (state.photoMode === 'Routine Carousel') return 'carousel';
  return 'hero';
}

function inferStudioMotion(state: ProductStudioState): StudioUIState['motion'] {
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

function toStudioV2State(state: ProductStudioState): StudioUIState {
  return {
    creativeIntent: inferStudioIntent(state),
    world: inferStudioWorld(state),
    motion: inferStudioMotion(state),
    composition: inferStudioComposition(state),
    aspectRatio: state.aspectRatio,
    photoMode: state.photoMode,
    subjectOrientation: inferSubjectOrientation(state),
    // Keep V2 strict: no modifiers are auto-injected.
    requestedModifiers: [],
  };
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
  const v2Prompt = generateStudioPromptV2(v2State);
  return mapV2ToScenePromptResult(v2Prompt);
}

export { isStudioV2Enabled };
