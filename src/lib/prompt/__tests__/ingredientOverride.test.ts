import { describe, it, expect } from 'vitest';
import { resolveAtmosphere, type CanonicalScene } from '../atmosphereResolver';

describe('ingredient override', () => {
  it('uses customIngredients over defaultIngredients', () => {
    const scene: CanonicalScene = {
      outputProfile: 'ecommerce-conversion',
      photoType: 'Photo Studio',
      composition: 'centered hero',
      photoMode: 'Ingredient Stack',
      productStateMotion: 'static',
      productStructure: 'standard',
      environmentSettings: 'studio',
      physicalPlacement: 'grounded on physical support plane',
      physicalProperties: 'real materials',
      defaultIngredients: ['default mint', 'default lemon'],
      customIngredients: [
        { name: 'fresh lime', cutStyle: 'sliced', freshness: 'fresh', density: 'balanced', placement: 'surround' },
        { name: 'sea salt', cutStyle: 'powdered', freshness: 'dry', density: 'minimal', placement: 'base' },
      ],
      visualWorld: 'studio',
      lighting: 'clinical softbox',
      specialEffects: [],
      productInteraction: 'none',
      viewpointVantage: 'eye-level product view',
      cameraFraming: '45-degree hero angle; standard framing; centered hero composition',
      constraintSuffix: 'LABEL LOCK; PRODUCT LOCK; FRAME INTEGRITY LOCK.',
    };

    const prompt = resolveAtmosphere(scene);
    expect(prompt).toContain('INGREDIENT_RESOLUTION:');
    expect(prompt).toContain('fresh lime');
    expect(prompt).toContain('sea salt');
    expect(prompt).not.toContain('default mint');
    expect(prompt).not.toContain('default lemon');
  });
});
