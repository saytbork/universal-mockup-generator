import type { ProductStateMotion } from '@/lib/productStudio/types';
import type { IndustryProfileModule } from '../types';

const COFFEE_FORBIDDEN_PROMPT_PATTERNS: RegExp[] = [
  /\bWINE_[A-Z0-9_]*\b/,
  /\bwine-prestige\b/i,
  /\bwine-glass-priority\b/i,
  /\bCORK_RENDERING\b/i,
  /\bBOTTLE_TILT_RULE\b/i,
  /\bwine translucency\b/i,
];

export const coffeeProfile: IndustryProfileModule = {
  id: 'coffee',
  allowedPhotoModes: [],
  resetState: () => ({
    coffeeMode: 'studio',
    coffeeAction: 'static',
    coffeeLightingTone: 'auto',
    coffeeMoodModifier: 'coffee-cinematic-luxury',
    coffeeSteamLevel: 'auto',
    coffeeLiquidPhysics: true,
  }),
  defaultInteraction: 'holding',
  truthLayer: () => [],
  physicalRules: () => '',
  industryProps: () => ({}),
  compositionRules: () => [],
  sanitizePrompt: (prompt) => {
    return String(prompt || '')
      .split(/(?<=[.!?])\s+/)
      .filter((sentence) => !COFFEE_FORBIDDEN_PROMPT_PATTERNS.some((pattern) => pattern.test(sentence)))
      .join(' ')
      .replace(/\s{2,}/g, ' ')
      .trim();
  },
  validatePrompt: (prompt) => {
    if (/\bWINE_|\bCLOSURE_|\bGLASS_|\bDECANTER_/.test(prompt)) {
      throw new Error('[INDUSTRY LEAK] wine tokens detected in coffee profile');
    }
  },
  resolveProductState: (state, resolvedCoffeeIntent): ProductStateMotion => {
    const intent = String(resolvedCoffeeIntent || 'editorial-ritual');
    const byIntent: Record<string, ProductStateMotion[]> = {
      'editorial-ritual': ['static'],
      campaign: ['static', 'opened'],
    };
    const allowed = byIntent[intent] || byIntent['editorial-ritual'];
    return allowed.includes(state.stateMotion) ? state.stateMotion : 'static';
  },
  resolvePackagingBehavior: () => '',
  resolveAllowedInteractions: (interactionWhitelist, resolvedCoffeeIntent) => {
    const intent = String(resolvedCoffeeIntent || 'editorial-ritual');
    if (intent === 'campaign') return interactionWhitelist;
    return ['none'];
  },
  getAllowedMotions: (_productType, resolvedIntent) => {
    const intent = String(resolvedIntent || 'editorial-ritual');
    if (intent === 'campaign') return ['static', 'opened', 'pouring'];
    return ['static'];
  },
  resolveStateMotionByCapability: (stateMotion, stateMotionCapability, resolvedIntent) => {
    if (stateMotionCapability !== 'limited' && stateMotionCapability !== 'extended') {
      return 'static';
    }
    const intent = String(resolvedIntent || 'editorial-ritual');
    if (intent === 'campaign') {
      return ['static', 'pouring'].includes(stateMotion) ? stateMotion : 'static';
    }
    return stateMotion;
  },
};
