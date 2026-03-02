import { describe, it, expect } from 'vitest';
import { resolveAtmosphere, type CanonicalScene } from '../atmosphereResolver';
import { validateAtmosphere } from '../atmosphereValidator';

const makeScene = (overrides: Partial<CanonicalScene> = {}): CanonicalScene => ({
  outputProfile: 'ecommerce-conversion',
  photoType: 'Photo Studio',
  composition: 'centered hero',
  photoMode: 'Splash Shot',
  productStateMotion: 'pouring',
  productStructure: 'standard',
  environmentSettings: 'studio',
  physicalPlacement: 'grounded on physical support plane',
  physicalProperties: 'real materials',
  defaultIngredients: ['mint'],
  customIngredients: [],
  visualWorld: 'studio',
  lighting: 'clinical softbox',
  specialEffects: ['Splash Shot'],
  productInteraction: 'none',
  viewpointVantage: 'eye-level product view',
  cameraFraming: '45-degree hero angle; standard framing; centered hero composition',
  constraintSuffix: 'LABEL LOCK; PRODUCT LOCK; FRAME INTEGRITY LOCK.',
  ...overrides,
});

describe('atmosphereValidator', () => {
  it('returns valid for coherent atmosphere', () => {
    const scene = makeScene();
    const prompt = resolveAtmosphere(scene);
    const result = validateAtmosphere(scene, prompt);
    expect(result.valid).toBe(true);
    expect(result.errors.filter(e => e.severity === 'critical')).toHaveLength(0);
  });

  it('returns critical error for underwater + softbox conflict', () => {
    const scene = makeScene({ visualWorld: 'underwater', photoMode: 'Underwater Split' });
    const prompt = 'ATMOSPHERE_RESOLUTION: Lighting authority: Clinical softbox lighting. PHYSICS_RULES (GLOBAL): no floating without shadow anchor; contact shadow coherence enforced; respect real-world scale.';
    const result = validateAtmosphere(scene, prompt);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.code === 'WORLD_LIGHTING_CONFLICT_UNDERWATER' && e.severity === 'critical')).toBe(true);
  });

  it('returns warning for prompt length over 5000', () => {
    const scene = makeScene();
    const longPrompt = `ATMOSPHERE_RESOLUTION: ${'x'.repeat(5100)} PHYSICS_RULES (GLOBAL): no floating without shadow anchor; contact shadow coherence enforced; respect real-world scale.`;
    const result = validateAtmosphere(scene, longPrompt);
    expect(result.errors.some(e => e.code === 'PROMPT_TOO_LONG' && e.severity === 'warning')).toBe(true);
  });

  it('returns critical for duplicate PHYSICS_RULES block', () => {
    const scene = makeScene();
    const prompt = [
      'ATMOSPHERE_RESOLUTION:',
      'PHYSICS_RULES (GLOBAL): no floating without shadow anchor; contact shadow coherence enforced; respect real-world scale.',
      'PHYSICS_RULES (GLOBAL): no floating without shadow anchor; contact shadow coherence enforced; respect real-world scale.',
    ].join(' ');
    const result = validateAtmosphere(scene, prompt);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.code === 'DUPLICATE_PHYSICS_BLOCK' && e.severity === 'critical')).toBe(true);
  });
});
