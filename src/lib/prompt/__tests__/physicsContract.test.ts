import { describe, it, expect } from 'vitest';
import { resolveAtmosphere, type CanonicalScene } from '../atmosphereResolver';

const makeScene = (overrides: Partial<CanonicalScene> = {}): CanonicalScene => ({
  outputProfile: 'ecommerce-conversion',
  photoType: 'Environment',
  composition: 'dynamic',
  photoMode: 'Beach Foam Splash',
  productStateMotion: 'pouring',
  productStructure: 'standard',
  environmentSettings: 'beach shoreline',
  physicalPlacement: 'surface contact',
  physicalProperties: 'wet reflective materials',
  defaultIngredients: ['citrus peel'],
  customIngredients: [],
  visualWorld: 'outdoor',
  lighting: 'natural directional sunlight',
  specialEffects: ['Foam', 'Splash Shot'],
  productInteraction: 'none',
  viewpointVantage: 'eye-level product view',
  cameraFraming: '45-degree hero angle; standard framing; centered hero composition',
  constraintSuffix: 'LABEL LOCK; PRODUCT LOCK; FRAME INTEGRITY LOCK.',
  ...overrides,
});

describe('physics contract', () => {
  it('enforces shadow anchor, gravity, contact shadow and no surreal deformation', () => {
    const prompt = resolveAtmosphere(makeScene());
    expect(prompt).toContain('no floating without shadow anchor');
    expect(prompt).toContain('contact shadow');
    expect(prompt).toContain('obey gravity');
    expect(prompt).toContain('no surreal deformation');
  });
});
