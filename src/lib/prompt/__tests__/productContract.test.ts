import { describe, it, expect } from 'vitest';
import { resolveAtmosphere } from '../atmosphereResolver';

describe('product contract', () => {
  it('always includes immutable product contract markers', () => {
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
      constraintSuffix: 'PRODUCT LOCK. LABEL LOCK. FRAME INTEGRITY LOCK.',
    });

    expect(prompt).toContain('PRODUCT LOCK');
    expect(prompt).toContain('LABEL LOCK');
    expect(prompt).toContain('FRAME INTEGRITY LOCK');
    expect(prompt).toContain('BACKGROUND_ISOLATION');
  });
});
