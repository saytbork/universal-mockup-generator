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
};

const PHOTO_MODE_CAPABILITIES: Partial<Record<PhotoMode, CapabilityConfig>> = {
  'Hero Landing Page': { interactionCapability: 'optional', stateMotionCapability: 'limited' },
  'Color Pop Hero': { interactionCapability: 'optional', stateMotionCapability: 'limited' },
  'Ingredient Stack': { interactionCapability: 'none', stateMotionCapability: 'static-only' },
  'Ingredient Flat Lay': { interactionCapability: 'none', stateMotionCapability: 'static-only' },
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

export function getIndustryDefaultInteraction(
  industryProfile: IndustryProfile,
  allowed: ProductStudioState['interaction'][]
): ProductStudioState['interaction'] {
  const preferredByIndustry: Record<IndustryProfile, ProductStudioState['interaction']> = {
    supplements: 'holding',
    wine: 'none',
    coffee: 'holding',
    beauty: 'holding',
    luxury: 'holding',
    tech: 'holding',
    general: 'holding',
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
  options?: { coffeeIntent?: 'conversion' | 'editorial-ritual' }
): ProductStateMotion {
  if (stateMotionCapability === 'static-only') return 'static';
  if (
    industryProfile === 'coffee' &&
    options?.coffeeIntent === 'editorial-ritual'
  ) {
    return stateMotion;
  }
  if (stateMotionCapability === 'extended') return stateMotion;

  const limitedByIndustry: Record<IndustryProfile, ProductStateMotion[]> = {
    wine: ['static', 'opened'],
    coffee: ['static', 'dispensed'],
    supplements: ['static', 'opened', 'dispensed'],
    beauty: ['static', 'opened', 'dispensed'],
    luxury: ['static', 'opened', 'dispensed'],
    tech: ['static', 'opened', 'dispensed'],
    general: ['static', 'opened', 'dispensed'],
  };
  const allowed = limitedByIndustry[industryProfile] || ['static'];
  if (allowed.includes(stateMotion)) return stateMotion;
  return allowed.includes('static') ? 'static' : allowed[0];
}

export function getIndustryAllowedMotions(
  industryProfile: IndustryProfile,
  productType: ProductType,
  coffeeIntent?: 'conversion' | 'editorial-ritual'
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

  return (industryRules[industryProfile]?.productStateWhitelist || ['static']) as ProductStateMotion[];
}

export function getResolvedAllowedMotions(
  photoMode: PhotoMode,
  industryProfile: IndustryProfile,
  productType: ProductType,
  coffeeIntent?: 'conversion' | 'editorial-ritual'
): ProductStateMotion[] {
  const { stateMotionCapability } = getPhotoModeCapabilities(photoMode);
  const industryAllowed = getIndustryAllowedMotions(industryProfile, productType, coffeeIntent);

  const limitedEnvelope: ProductStateMotion[] = ['static', 'opened', 'dispensed'];
  const extendedEnvelope: ProductStateMotion[] = ['static', 'opened', 'dispensed', 'pouring', 'spilled', 'falling'];

  if (stateMotionCapability === 'static-only') return ['static'];
  if (stateMotionCapability === 'limited') {
    const filtered = industryAllowed.filter((motion) => limitedEnvelope.includes(motion));
    return filtered.length > 0 ? filtered : ['static'];
  }

  const filtered = industryAllowed.filter((motion) => extendedEnvelope.includes(motion));
  return filtered.length > 0 ? filtered : ['static'];
}
