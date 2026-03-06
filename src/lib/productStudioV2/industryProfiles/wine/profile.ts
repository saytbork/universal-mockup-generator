import type { ProductStateMotion } from '@/lib/productStudio/types';
import type { IndustryProfileModule } from '../types';

const WINE_FORBIDDEN_PROMPT_PATTERNS: RegExp[] = [
  /\bINTERACTION_[A-Z0-9_]*\b/i,
  /\bHAND_POSITIONING\b/i,
  /\bFRAMING_BIAS\b/i,
  /\bHAND_[A-Z0-9_]*\b/i,
  /\bPOUR(?:ING)?\b/i,
  /\bSPILL(?:ED|ING)?\b/i,
  /\bFALL(?:ING)?\b/i,
  /\bDISPENS(?:E|ED|ING)\b/i,
  /\bGRAVITY\b/i,
];

export const wineProfile: IndustryProfileModule = {
  id: 'wine',
  allowedPhotoModes: [],
  resetState: () => ({
    wineType: undefined,
    carbonationLevel: undefined,
    wineBottleState: undefined,
    wineGlassMode: undefined,
    wineClosureType: undefined,
    wineServeAmount: undefined,
    serveVolumeMode: undefined,
    wineEngineVersion: undefined,
    wineStyleArchetype: null,
    wineAction: 'static-presentation',
    winePourStyle: 'mid-flow-elegance',
    wineMoodModifier: 'None',
  }),
  defaultInteraction: 'none',
  truthLayer: (state) => {
    const next: string[] = ['LIQUID_ENGINE: active', 'LIQUID_PHYSICS_SYSTEM: deterministic'];
    const wineAction = String(state.wineAction || '').trim().toLowerCase();
    if (wineAction === 'controlled-pour' || wineAction === 'controlled pour') {
      next.push('LIQUID_FLOW: gravitational arc');
      next.push('GLASS_VOLUME_CONSERVATION: enforced');
      next.push('MENISCUS: visible');
      next.push('HEADSPACE: realistic');
    }
    const glassMode = String((state as any).wineGlassMode || '').trim().toLowerCase();
    if (glassMode === 'filled') next.push('GLASS_LIQUID_SYNC: bottle-consistent');

    const closureType = String((state as any).wineClosureType || '').trim().toLowerCase();
    if (closureType && closureType !== 'from-reference' && closureType !== 'from reference') {
      next.push('CAP_PRESERVATION: strict');
    }
    return next;
  },
  physicalRules: () => '',
  industryProps: () => ({}),
  compositionRules: () => [],
  sanitizePrompt: (prompt) => {
    return String(prompt || '')
      .split(/(?<=[.!?])\s+/)
      .filter((sentence) => !WINE_FORBIDDEN_PROMPT_PATTERNS.some((pattern) => pattern.test(sentence)))
      .join(' ')
      .replace(/\s{2,}/g, ' ')
      .trim();
  },
  validatePrompt: (prompt) => {
    if (/\bCOFFEE_/.test(prompt)) {
      throw new Error('[INDUSTRY LEAK] coffee tokens detected in wine profile');
    }
  },
  resolveProductState: (state): ProductStateMotion => {
    return state.stateMotion === 'opened' ? 'opened' : 'static';
  },
  resolvePackagingBehavior: (_state, stateMotion) => {
    if (stateMotion === 'opened' || stateMotion === 'pouring') return 'wine-cork-removal';
    return 'wine-cork';
  },
  resolveCameraByCapability: (camera, options) => {
    const base = { ...camera };
    const warnings: string[] = [];
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

    return { ...base, warnings };
  },
  getAllowedMotions: () => ['static', 'opened'],
  forceInteractionNone: true,
};
