import type {
  StudioAuthorityBundle,
  StudioComposition,
  StudioCreativeIntent,
  StudioMotion,
  StudioUIState,
  StudioWorld,
} from '../types/studioTypes.ts';

const normalize = (value: unknown): string => String(value || '').trim().toLowerCase();
const isBeachFoamMode = (value: unknown): boolean => normalize(value) === 'beach foam splash';

const isDynamicMotion = (motion: StudioMotion): boolean =>
  motion === 'dispensed' || motion === 'pouring' || motion === 'falling';

const resolveWorld = (state: StudioUIState): StudioWorld => {
  if (state.world) return state.world;
  const mode = normalize(state.photoMode);
  if (isBeachFoamMode(mode)) return 'beach-daylight';
  if (mode.includes('underwater')) return 'underwater';
  if (mode.includes('splash') || mode.includes('foam') || mode.includes('pool water')) return 'splash-tank';
  return 'studio';
};

const resolveIntent = (state: StudioUIState): StudioCreativeIntent => state.creativeIntent;

const resolveComposition = (state: StudioUIState): StudioComposition => state.composition;

export function resolveStudioAuthority(state: StudioUIState): StudioAuthorityBundle {
  const creativeIntent = resolveIntent(state);
  const world = resolveWorld(state);
  const composition = resolveComposition(state);
  const motion = state.motion;

  const splitLevelUnderwaterSquareVertical =
    world === 'underwater' &&
    normalize(state.photoMode).includes('split') &&
    String(state.aspectRatio || '').trim() === '1:1' &&
    state.subjectOrientation === 'vertical';

  const allowSplash =
    creativeIntent !== 'clinical' &&
    motion !== 'static' &&
    (world === 'splash-tank' || world === 'underwater' || world === 'beach-daylight');

  const permissions = {
    allowSplash,
    allowAtmosphere: creativeIntent !== 'clinical',
    allowParticles: creativeIntent !== 'clinical',
    allowHorizontalSpread: !splitLevelUnderwaterSquareVertical,
    allowVerticalDominance: splitLevelUnderwaterSquareVertical,
  };

  if (world === 'splash-tank' && !isDynamicMotion(motion)) {
    permissions.allowSplash = false;
  }
  if (splitLevelUnderwaterSquareVertical) {
    permissions.allowHorizontalSpread = false;
    permissions.allowVerticalDominance = true;
  }

  return {
    creativeIntent,
    world,
    motion,
    composition,
    permissions,
  };
}

export const studioMotionIsDynamic = isDynamicMotion;
