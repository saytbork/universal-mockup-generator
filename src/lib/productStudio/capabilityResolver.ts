import type {
  EnvironmentPhotoModeSchema,
  IndustryProfile,
  PhotoMode,
  ProductType,
  ProductStateMotion,
  ProductStudioState,
} from './types';
import { resolveIndustryProfileModule } from '../productStudioV2/industryProfiles/registry';

export type InteractionCapability = 'none' | 'optional' | 'required';
export type StateMotionCapability = 'static-only' | 'limited' | 'extended';

type CapabilityConfig = {
  interactionCapability?: InteractionCapability;
  stateMotionCapability?: StateMotionCapability;
  cameraCapability?: 'restricted' | 'guided' | 'free';
  defaultCamera?: {
    cameraSystem: string;
    cameraAngle: string;
    cameraDistance: string;
    cameraRotation: string;
    framingGuide: string;
  };
};

const PHOTO_MODE_CAPABILITIES: Partial<Record<PhotoMode, CapabilityConfig>> = {
  'Hero Landing Page': { interactionCapability: 'optional', stateMotionCapability: 'limited' },
  'Color Pop Hero': { interactionCapability: 'optional', stateMotionCapability: 'limited' },
  'Ingredient Stack': { interactionCapability: 'optional', stateMotionCapability: 'static-only' },
  'Ingredient Flat Lay': { interactionCapability: 'optional', stateMotionCapability: 'static-only' },
  'Routine Carousel': { interactionCapability: 'optional', stateMotionCapability: 'limited' },
  'Hands Application Clean': { interactionCapability: 'required', stateMotionCapability: 'limited' },
  'Macro Dew Label': { interactionCapability: 'none', stateMotionCapability: 'static-only' },
  'Splash Shot': { stateMotionCapability: 'extended' },
  'Beach Foam Splash': { stateMotionCapability: 'extended' },
  'Pool Water': { stateMotionCapability: 'extended' },
  'Cheers (Hands Clink)': { interactionCapability: 'required' },
  'Foam & Texture': { stateMotionCapability: 'limited' },
  'Textured Bed / Scatter Base': { stateMotionCapability: 'static-only' },
};

const PHOTO_MODE_CAMERA_CAPABILITIES: Partial<Record<PhotoMode, CapabilityConfig>> = {
  'Ingredient Stack': { cameraCapability: 'restricted' },
  'Ingredient Flat Lay': { cameraCapability: 'restricted' },
  'Macro Dew Label': { cameraCapability: 'restricted' },
  'Textured Bed / Scatter Base': { cameraCapability: 'restricted' },
  'Hero Landing Page': { cameraCapability: 'guided' },
  'Color Pop Hero': { cameraCapability: 'guided' },
  'Routine Carousel': { cameraCapability: 'guided' },
  'Hands Application Clean': { cameraCapability: 'guided' },
  'Splash Shot': { cameraCapability: 'free' },
  'Beach Foam Splash': { cameraCapability: 'free' },
  'Pool Water': { cameraCapability: 'free' },
};

const DEFAULT_CAMERA = {
  cameraSystem: 'DSLR / mirrorless camera system',
  cameraAngle: '45° hero',
  cameraDistance: 'Standard',
  cameraRotation: '0°',
  framingGuide: 'Centered hero',
};

function unique<T>(values: T[]): T[] {
  return Array.from(new Set(values));
}

export function getPhotoModeCapabilities(
  photoMode: PhotoMode,
  schema?: EnvironmentPhotoModeSchema
): { interactionCapability: InteractionCapability; stateMotionCapability: StateMotionCapability } {
  const fromMap = PHOTO_MODE_CAPABILITIES[photoMode] || {};
  return {
    interactionCapability: fromMap.interactionCapability || schema?.interactionCapability || 'optional',
    stateMotionCapability: fromMap.stateMotionCapability || schema?.stateMotionCapability || 'limited',
  };
}

export function getPhotoModeCameraCapability(photoMode: PhotoMode): 'restricted' | 'guided' | 'free' {
  return PHOTO_MODE_CAMERA_CAPABILITIES[photoMode]?.cameraCapability || 'guided';
}

export function resolveCameraByCapability(
  photoMode: PhotoMode,
  userSelection: {
    cameraSystem?: string;
    cameraAngle?: string;
    cameraDistance?: string;
    cameraRotation?: string;
    framingGuide?: string;
  },
  industryProfile: IndustryProfile,
  options?: {
    wineCorkRemovalActive?: boolean;
    distortionRiskThreshold?: number;
  }
): {
  cameraSystem: string;
  cameraAngle: string;
  cameraDistance: string;
  cameraRotation: string;
  framingGuide: string;
  warnings: string[];
} {
  const capability = getPhotoModeCameraCapability(photoMode);
  const merged = {
    cameraSystem: userSelection.cameraSystem || DEFAULT_CAMERA.cameraSystem,
    cameraAngle: userSelection.cameraAngle || DEFAULT_CAMERA.cameraAngle,
    cameraDistance: userSelection.cameraDistance || DEFAULT_CAMERA.cameraDistance,
    cameraRotation: userSelection.cameraRotation || DEFAULT_CAMERA.cameraRotation,
    framingGuide: userSelection.framingGuide || DEFAULT_CAMERA.framingGuide,
  };

  const base =
    capability === 'restricted'
      ? { ...DEFAULT_CAMERA }
      : capability === 'guided'
        ? { ...DEFAULT_CAMERA, ...merged }
        : merged;

  const profile = resolveIndustryProfileModule(industryProfile);
  if (profile.resolveCameraByCapability) {
    return profile.resolveCameraByCapability(base, options);
  }

  return { ...base, warnings: [] };
}

export function getIndustryDefaultInteraction(
  industryProfile: IndustryProfile,
  allowed: ProductStudioState['interaction'][]
): ProductStudioState['interaction'] {
  const profile = resolveIndustryProfileModule(industryProfile);
  const preferred = (profile.defaultInteraction || 'holding') as ProductStudioState['interaction'];
  if (allowed.includes(preferred)) return preferred;
  if (allowed.includes('none')) return 'none';
  return allowed[0] || 'none';
}

export function resolveAllowedInteractionsByCapability(
  industryAllowed: ProductStudioState['interaction'][],
  interactionCapability: InteractionCapability
): ProductStudioState['interaction'][] {
  if (interactionCapability === 'none') return ['none'] as ProductStudioState['interaction'][];
  const normalized = unique(
    industryAllowed.length > 0
      ? industryAllowed
      : (['none'] as ProductStudioState['interaction'][])
  ) as ProductStudioState['interaction'][];
  if (interactionCapability === 'required') {
    const requiredOnly = normalized.filter((value) => value !== 'none');
    return requiredOnly.length > 0 ? requiredOnly : ['none'];
  }
  return normalized;
}

export function getResolvedAllowedInteractions(
  photoMode: PhotoMode,
  industryAllowed: ProductStudioState['interaction'][]
): ProductStudioState['interaction'][] {
  const { interactionCapability } = getPhotoModeCapabilities(photoMode);
  return resolveAllowedInteractionsByCapability(industryAllowed, interactionCapability);
}

export function resolveInteractionByCapability(
  requested: ProductStudioState['interaction'],
  allowed: ProductStudioState['interaction'][],
  interactionCapability: InteractionCapability,
  defaultInteraction: ProductStudioState['interaction']
): ProductStudioState['interaction'] {
  if (interactionCapability === 'none') return 'none';
  if (interactionCapability === 'required' && requested === 'none') {
    return allowed.includes(defaultInteraction) ? defaultInteraction : allowed[0] || 'none';
  }
  if (allowed.includes(requested)) return requested;
  if (interactionCapability === 'required') {
    return allowed.includes(defaultInteraction) ? defaultInteraction : allowed[0] || 'none';
  }
  if (allowed.includes('none')) return 'none';
  return allowed[0] || 'none';
}

export function resolveStateMotionByCapability(
  industryProfile: IndustryProfile,
  stateMotion: ProductStateMotion,
  stateMotionCapability: StateMotionCapability,
  options?: { coffeeIntent?: 'conversion' | 'editorial-ritual' | 'campaign' }
): ProductStateMotion {
  const profile = resolveIndustryProfileModule(industryProfile);
  if (profile.resolveStateMotionByCapability) {
    return profile.resolveStateMotionByCapability(stateMotion, stateMotionCapability, options?.coffeeIntent);
  }
  if (stateMotionCapability !== 'limited' && stateMotionCapability !== 'extended') {
    return 'static';
  }
  if (stateMotionCapability === 'extended') return stateMotion;
  const allowed = profile.getAllowedMotions
    ? profile.getAllowedMotions('custom', options?.coffeeIntent)
    : (['static'] as ProductStateMotion[]);
  if (allowed.includes(stateMotion)) return stateMotion;
  return allowed.includes('static') ? 'static' : allowed[0];
}

export function getIndustryAllowedMotions(
  industryProfile: IndustryProfile,
  productType: ProductType,
  coffeeIntent?: 'conversion' | 'editorial-ritual' | 'campaign'
): ProductStateMotion[] {
  const profile = resolveIndustryProfileModule(industryProfile);
  if (profile.getAllowedMotions) {
    return profile.getAllowedMotions(productType, coffeeIntent);
  }
  return ['static'];
}

export function getResolvedAllowedMotions(
  photoMode: PhotoMode,
  industryProfile: IndustryProfile,
  productType: ProductType,
  coffeeIntent?: 'conversion' | 'editorial-ritual' | 'campaign'
): ProductStateMotion[] {
  const { stateMotionCapability } = getPhotoModeCapabilities(photoMode);
  const industryAllowed = getIndustryAllowedMotions(industryProfile, productType, coffeeIntent);

  const limitedEnvelope: ProductStateMotion[] = ['static', 'opened', 'dispensed', 'pouring', 'spilled', 'falling'];
  const extendedEnvelope: ProductStateMotion[] = ['static', 'opened', 'dispensed', 'pouring', 'spilled', 'falling'];

  if (stateMotionCapability !== 'limited' && stateMotionCapability !== 'extended') {
    return ['static'];
  }
  if (stateMotionCapability === 'limited') {
    const profile = resolveIndustryProfileModule(industryProfile);
    const relaxedEnvelope = profile.resolveStateMotionByCapability
      ? profile.resolveStateMotionByCapability('pouring', 'limited', coffeeIntent) === 'pouring'
      : false;
    const envelope = relaxedEnvelope ? [...limitedEnvelope, 'pouring'] : limitedEnvelope;
    const filtered = industryAllowed.filter((motion) => envelope.includes(motion));
    return filtered.length > 0 ? filtered : ['static'];
  }

  const filtered = industryAllowed.filter((motion) => extendedEnvelope.includes(motion));
  return filtered.length > 0 ? filtered : ['static'];
}
