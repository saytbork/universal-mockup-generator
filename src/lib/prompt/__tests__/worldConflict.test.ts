import { describe, it, expect } from 'vitest';
import type { CanonicalScene } from '../atmosphereResolver';
import { validateAtmosphere } from '../atmosphereValidator';

const baseScene: CanonicalScene = {
  outputProfile: 'ecommerce-conversion',
  photoType: 'Environment',
  composition: 'dynamic',
  photoMode: 'Underwater Split',
  productStateMotion: 'pouring',
  productStructure: 'standard',
  environmentSettings: 'underwater',
  physicalPlacement: 'submerged',
  physicalProperties: 'refractive',
  defaultIngredients: [],
  customIngredients: [],
  visualWorld: 'underwater',
  lighting: 'clinical softbox',
  specialEffects: ['Underwater Split'],
  productInteraction: 'none',
  viewpointVantage: 'eye-level product view',
  cameraFraming: '45-degree hero angle; standard framing; centered hero composition',
  constraintSuffix: 'LABEL LOCK; PRODUCT LOCK; FRAME INTEGRITY LOCK.',
};

describe('world conflict detection', () => {
  it('fails with critical WORLD_LIGHTING_CONFLICT_UNDERWATER', () => {
    const prompt = [
      'ATMOSPHERE_RESOLUTION:',
      'Lighting authority: clinical softbox lighting with clean reflections.',
      'PHYSICS_RULES (GLOBAL): no floating without shadow anchor; contact shadow coherence enforced; ingredients obey gravity; respect real-world scale.',
    ].join(' ');

    const result = validateAtmosphere(baseScene, prompt);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.code === 'WORLD_LIGHTING_CONFLICT_UNDERWATER' && e.severity === 'critical')).toBe(true);
  });
});
