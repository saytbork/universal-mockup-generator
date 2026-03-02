import type { ProductStudioState, ProductStateMotion } from '../types';

export type ActiveVisualIntent = 'conversion' | 'campaign' | 'clinical' | 'luxury';
export type ActiveEnvironment = 'studio' | 'underwater' | 'bathroom' | 'splash-tank' | 'outdoor';
export type ActiveLighting =
  | 'clinical-softbox'
  | 'natural-sunlight'
  | 'underwater-directional'
  | 'luxury-sculpted'
  | 'pro-rig';

export type CompositionAuthority = {
  isSquare: boolean;
  isConversionSquareOptimized: boolean;
  allowHorizontalSpread: boolean;
  allowVerticalDominance: boolean;
  forbidNeutralSideFill: boolean;
};

export type AuthorityResolution = {
  visualIntent: ActiveVisualIntent;
  motion: ProductStateMotion;
  lighting: ActiveLighting;
  environment: ActiveEnvironment;
  composition: CompositionAuthority;
};

const normalize = (value: unknown): string => String(value || '').trim().toLowerCase();
const isBeachFoamMode = (photoMode: string): boolean => normalize(photoMode) === 'beach foam splash';

const isUnderwaterMode = (photoMode: string): boolean => normalize(photoMode).includes('underwater');
const isSplashMode = (photoMode: string): boolean => {
  const normalized = normalize(photoMode);
  return normalized.includes('splash') || normalized.includes('foam') || normalized.includes('pool water');
};

export function getActiveVisualIntent(state: ProductStudioState): ActiveVisualIntent {
  const explicit = normalize((state as any).visualIntent);
  if (explicit === 'campaign') return 'campaign';
  if (state.qualityProfile === 'clinical') return 'clinical';
  if (state.qualityProfile === 'luxury-brand') return 'luxury';
  return 'conversion';
}

export function getActiveEnvironment(state: ProductStudioState): ActiveEnvironment {
  const photoMode = String(state.photoMode || '');
  if (isBeachFoamMode(photoMode)) return 'outdoor';
  if (isUnderwaterMode(photoMode)) return 'underwater';
  if (isSplashMode(photoMode)) return 'splash-tank';

  const macro = normalize(state.environmentContext?.macro);
  if (!macro || macro === 'studio') return 'studio';
  if (macro.includes('bathroom')) return 'bathroom';
  return 'outdoor';
}

export function getActiveMotion(state: ProductStudioState, environment: ActiveEnvironment): ProductStateMotion {
  const requested = state.stateMotion;

  if (environment === 'underwater' && (requested === 'falling' || requested === 'pouring')) {
    return 'static';
  }
  if (environment === 'studio' && requested === 'falling') {
    return 'static';
  }
  return requested;
}

export function getActiveLighting(state: ProductStudioState, resolution: Pick<AuthorityResolution, 'visualIntent' | 'environment'>): ActiveLighting {
  if (isBeachFoamMode(String(state.photoMode || ''))) return 'natural-sunlight';
  const isProRigActive = state.controlTier === 'pro' && Boolean(String((state as any).lightingRig || '').trim());
  if (isProRigActive && resolution.visualIntent !== 'campaign') return 'pro-rig';

  if (resolution.environment === 'underwater') return 'underwater-directional';
  if (resolution.visualIntent === 'campaign') return 'natural-sunlight';
  if (resolution.visualIntent === 'clinical' || resolution.visualIntent === 'conversion') return 'clinical-softbox';
  return 'luxury-sculpted';
}

export function getActiveComposition(
  state: ProductStudioState,
  resolution: Pick<AuthorityResolution, 'visualIntent' | 'environment'>
): CompositionAuthority {
  const isSquare = String(state.aspectRatio || '').trim() === '1:1';
  const isVerticalDominantSubject = ['drops', 'skincare'].includes(normalize(state.definition?.type));
  const splitLevelUnderwater = normalize(state.photoMode) === 'underwater split';

  const disableHorizontalSpread =
    isSquare &&
    splitLevelUnderwater &&
    isVerticalDominantSubject;

  return {
    isSquare,
    isConversionSquareOptimized: isSquare && resolution.visualIntent === 'conversion',
    allowHorizontalSpread: isSquare && resolution.visualIntent === 'conversion' && !disableHorizontalSpread,
    allowVerticalDominance: disableHorizontalSpread,
    forbidNeutralSideFill: disableHorizontalSpread,
  };
}

export function resolveAuthorities(state: ProductStudioState): AuthorityResolution {
  const visualIntent = getActiveVisualIntent(state);
  const environment = getActiveEnvironment(state);
  const motion = getActiveMotion(state, environment);
  const lighting = getActiveLighting(state, { visualIntent, environment });
  const composition = getActiveComposition(state, { visualIntent, environment });

  return {
    visualIntent,
    environment,
    motion,
    lighting,
    composition,
  };
}
