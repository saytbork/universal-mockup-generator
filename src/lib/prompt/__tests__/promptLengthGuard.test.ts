import { describe, it, expect } from 'vitest';
import type { CanonicalScene } from '../atmosphereResolver';
import { validateAtmosphere } from '../atmosphereValidator';

const scene: CanonicalScene = {
  outputProfile: 'ecommerce-conversion',
  photoType: 'Photo Studio',
  composition: 'centered hero composition',
  photoMode: 'Hero Landing Page',
  productStateMotion: 'static',
  productStructure: 'standard',
  environmentSettings: 'studio',
  physicalPlacement: 'grounded on physical support plane',
  physicalProperties: 'real materials, scale fidelity',
  defaultIngredients: [],
  customIngredients: [],
  visualWorld: 'studio',
  lighting: 'clinical softbox',
  specialEffects: [],
  productInteraction: 'none',
  viewpointVantage: 'eye-level product view',
  cameraFraming: '45-degree hero angle; standard framing; centered hero composition',
  constraintSuffix: 'PRODUCT LOCK. LABEL LOCK. FRAME INTEGRITY LOCK.',
};

describe('prompt length guard and duplication guard', () => {
  it('warns when prompt length is over 5000 characters', () => {
    const prompt = `ATMOSPHERE_RESOLUTION: ${'x'.repeat(5100)} PHYSICS_RULES (GLOBAL): no floating without shadow anchor; contact shadow coherence enforced; respect real-world scale.`;
    const result = validateAtmosphere(scene, prompt);
    expect(result.errors.some(e => e.code === 'PROMPT_TOO_LONG' && e.severity === 'warning')).toBe(true);
  });

  it('flags duplicate ATMOSPHERE_RESOLUTION as critical', () => {
    const prompt = 'ATMOSPHERE_RESOLUTION: A ATMOSPHERE_RESOLUTION: B PHYSICS_RULES (GLOBAL): no floating without shadow anchor; contact shadow coherence enforced; respect real-world scale.';
    const result = validateAtmosphere(scene, prompt);
    expect(result.errors.some(e => e.code === 'DUPLICATE_ATMOSPHERE_BLOCK' && e.severity === 'critical')).toBe(true);
  });

  it('flags duplicate PHYSICS_RULES as critical', () => {
    const prompt = 'ATMOSPHERE_RESOLUTION: A PHYSICS_RULES (GLOBAL): no floating without shadow anchor; contact shadow coherence enforced; respect real-world scale. PHYSICS_RULES (GLOBAL): no floating without shadow anchor; contact shadow coherence enforced; respect real-world scale.';
    const result = validateAtmosphere(scene, prompt);
    expect(result.errors.some(e => e.code === 'DUPLICATE_PHYSICS_BLOCK' && e.severity === 'critical')).toBe(true);
  });

  it('flags duplicate INGREDIENT_RESOLUTION as critical', () => {
    const withIngredients = { ...scene, customIngredients: [{ name: 'mint' }] };
    const prompt = 'ATMOSPHERE_RESOLUTION: A INGREDIENT_RESOLUTION: one INGREDIENT_RESOLUTION: two PHYSICS_RULES (GLOBAL): no floating without shadow anchor; contact shadow coherence enforced; respect real-world scale.';
    const result = validateAtmosphere(withIngredients, prompt);
    expect(result.errors.some(e => e.code === 'DUPLICATE_INGREDIENT_BLOCK' && e.severity === 'critical')).toBe(true);
  });
});
