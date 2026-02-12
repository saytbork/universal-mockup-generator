import { describe, it, expect } from 'vitest';
import { resolveAtmosphere } from '../atmosphereResolver';

describe('product immutability contract', () => {
  it('always keeps immutable product constraints', () => {
    const prompt = resolveAtmosphere({
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
      constraintSuffix: 'LABEL LOCK. PRODUCT LOCK. FRAME INTEGRITY LOCK. square integrity.',
    });

    expect(prompt).toContain('BACKGROUND_ISOLATION');
    expect(prompt).toContain('Input background removed');
    expect(prompt).toContain('Product fully isolated before scene generation');
    expect(prompt).toContain('LABEL LOCK');
    expect(prompt).toContain('PRODUCT LOCK');
    expect(prompt).toContain('square integrity');
    expect(prompt).toContain('no clipping through product');
    expect(prompt).toContain('no surreal deformation');
  });
});
