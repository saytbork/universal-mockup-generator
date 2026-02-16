import { describe, it, expect } from 'vitest';
import { resolveAtmosphere, type CanonicalScene } from '../atmosphereResolver';

const scene: CanonicalScene = {
  outputProfile: 'ecommerce-conversion',
  photoType: 'Photo Studio',
  composition: 'centered hero',
  photoMode: 'Hero Landing Page',
  productStateMotion: 'static',
  productStructure: 'standard',
  environmentSettings: 'studio',
  physicalPlacement: 'grounded on physical support plane',
  physicalProperties: 'real materials',
  defaultIngredients: [],
  customIngredients: [],
  visualWorld: 'studio',
  lighting: 'clinical softbox',
  specialEffects: [],
  productInteraction: 'none',
  viewpointVantage: 'eye-level product view',
  cameraFraming: '45-degree hero angle; standard framing; centered hero composition',
  constraintSuffix: 'LABEL LOCK; PRODUCT LOCK; FRAME INTEGRITY LOCK.',
};

describe('background isolation', () => {
  it('includes explicit background isolation contract', () => {
    const prompt = resolveAtmosphere(scene);
    expect(prompt).toContain('BACKGROUND_ISOLATION:');
    expect(prompt).toContain('Input background removed.');
    expect(prompt).toContain('Product fully isolated before scene generation.');
    expect(prompt).toContain('no legacy environment blending');
  });
});
