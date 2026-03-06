import type {
  EnvironmentPhotoModeSchema,
  IndustryProfile,
  PhotoMode,
  ProductType,
  ProductStateMotion,
  ProductStudioState,
} from './types';
import { industryRules } from './industryRules';

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
  'Clinical Lab Counter': { interactionCapability: 'none' },
  'Minimal Bathroom Vanity': { interactionCapability: 'none' },
  'Dark Premium Studio': { interactionCapability: 'optional' },
  'Tech Clean Studio': { interactionCapability: 'none' },
  'Monochrome Brand': { interactionCapability: 'optional' },
  'Brand Campaign': { interactionCapability: 'optional' },
  'Creator Premium Simulation': { interactionCapability: 'required' },
  'Soft Wellness Morning': { interactionCapability: 'optional' },
  'Outdoor Energy Boost': { interactionCapability: 'optional' },
  'Sunlit Stone Editorial': { interactionCapability: 'optional' },
  'Golden Sunset Backlit': { interactionCapability: 'optional' },
  'Bathroom Daylight Clean': { interactionCapability: 'none' },
  'Warm Window Wood': { interactionCapability: 'optional' },
  'Sky Float Minimal': { interactionCapability: 'none' },
  'Wet Rock Ripples': { interactionCapability: 'none' },
  'Sand Palm Shadows': { interactionCapability: 'optional' },
  'Botanical Water Garden': { interactionCapability: 'none' },
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
  'Clinical Lab Counter': { cameraCapability: 'restricted' },
  'Minimal Bathroom Vanity': { cameraCapability: 'restricted' },
  'Tech Clean Studio': { cameraCapability: 'restricted' },
  'Sky Float Minimal': { cameraCapability: 'restricted' },
  'Botanical Water Garden': { cameraCapability: 'restricted' },
  'Textured Bed / Scatter Base': { cameraCapability: 'restricted' },
  'Hero Landing Page': { cameraCapability: 'guided' },
  'Color Pop Hero': { cameraCapability: 'guided' },
  'Routine Carousel': { cameraCapability: 'guided' },
  'Hands Application Clean': { cameraCapability: 'guided' },
  'Dark Premium Studio': { cameraCapability: 'guided' },
  'Monochrome Brand': { cameraCapability: 'guided' },
  'Brand Campaign': { cameraCapability: 'guided' },
  'Creator Premium Simulation': { cameraCapability: 'guided' },
  'Soft Wellness Morning': { cameraCapability: 'guided' },
  'Outdoor Energy Boost': { cameraCapability: 'guided' },
  'Sunlit Stone Editorial': { cameraCapability: 'guided' },
  'Golden Sunset Backlit': { cameraCapability: 'guided' },
  'Warm Window Wood': { cameraCapability: 'guided' },
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

  const warnings: string[] = [];
  if (industryProfile === 'wine') {
    const corkRemovalActive = Boolean(options?.wineCorkRemovalActive);
    const distortionRiskThreshold = Number(options?.distortionRiskThreshold ?? 0.75);
    const normalizedDistance = String(base.cameraDistance || '').toLowerCase();
    const normalizedAngle = String(base.cameraAngle || '').toLowerCase();
    const normalizedRotation = String(base.cameraRotation || '').toLowerCase();

    const numericRotation = Number(normalizedRotation.replace(/[^\d.-]/g, '')) || 0;
    const wideRisk = /wide/.test(normalizedDistance);
    const tiltRisk = numericRotation > 10 ? 0.35 : 0;
    const angleRisk = /low angle|high angle/.test(normalizedAngle) ? 0.25 : 0;
    const distortionRisk = (wideRisk ? 0.6 : 0) + tiltRisk + angleRisk;

    if (corkRemovalActive && /top-?down/i.test(normalizedAngle)) {
      base.cameraAngle = 'High angle';
      warnings.push('Wine safety: top-down blocked during cork-removal action. Clamped angle to High angle.');
    }
    if (distortionRisk > distortionRiskThreshold && /wide/.test(normalizedDistance)) {
      base.cameraDistance = 'Standard';
      warnings.push('Wine safety: wide distance exceeded distortion threshold. Clamped distance to Standard.');
    }
  }

  return { ...base, warnings };
}

export function getIndustryDefaultInteraction(
  industryProfile: IndustryProfile,
  allowed: ProductStudioState['interaction'][]
): ProductStudioState['interaction'] {
  const preferredByIndustry: Record<IndustryProfile, ProductStudioState['interaction']> = {
    supplements: 'holding',
    wine: 'none',
    coffee: 'holding',
  };
  const preferred = preferredByIndustry[industryProfile] || 'holding';
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
  if (stateMotionCapability !== 'limited' && stateMotionCapability !== 'extended') {
    return 'static';
  }
  if (
    industryProfile === 'coffee' &&
    options?.coffeeIntent === 'editorial-ritual'
  ) {
    return stateMotion;
  }
  if (industryProfile === 'coffee' && options?.coffeeIntent === 'campaign') {
    return ['static', 'pouring'].includes(stateMotion) ? stateMotion : 'static';
  }
  if (stateMotionCapability === 'extended') return stateMotion;

  const limitedByIndustry: Record<IndustryProfile, ProductStateMotion[]> = {
    wine: ['static', 'opened'],
    coffee: ['static', 'dispensed'],
    supplements: ['static', 'opened', 'dispensed'],
  };
  const allowed = limitedByIndustry[industryProfile] || ['static'];
  if (allowed.includes(stateMotion)) return stateMotion;
  return allowed.includes('static') ? 'static' : allowed[0];
}

export function getIndustryAllowedMotions(
  industryProfile: IndustryProfile,
  productType: ProductType,
  coffeeIntent?: 'conversion' | 'editorial-ritual' | 'campaign'
): ProductStateMotion[] {
  if (industryProfile === 'wine') return ['static', 'opened'];

  if (industryProfile === 'coffee') {
    return (
      industryRules.coffee.productStateWhitelistByIntent?.[coffeeIntent || 'editorial-ritual'] ||
      industryRules.coffee.productStateWhitelist ||
      ['static']
    ) as ProductStateMotion[];
  }

  if (industryProfile === 'supplements') {
    const allowed: ProductStateMotion[] = ['static', 'opened', 'dispensed'];
    if (productType === 'capsules') allowed.push('falling');
    if (productType === 'powder') allowed.push('spilled');
    if (productType === 'drops') allowed.push('pouring');
    return allowed;
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
    const envelope =
      industryProfile === 'coffee' && (coffeeIntent === 'editorial-ritual' || coffeeIntent === 'campaign')
        ? [...limitedEnvelope, 'pouring']
        : limitedEnvelope;
    const filtered = industryAllowed.filter((motion) => envelope.includes(motion));
    return filtered.length > 0 ? filtered : ['static'];
  }

  const filtered = industryAllowed.filter((motion) => extendedEnvelope.includes(motion));
  return filtered.length > 0 ? filtered : ['static'];
}
