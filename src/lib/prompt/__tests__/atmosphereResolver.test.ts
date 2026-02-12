import { describe, it, expect } from 'vitest';
import { resolveAtmosphere, type CanonicalScene } from '../atmosphereResolver';

const makeScene = (overrides: Partial<CanonicalScene> = {}): CanonicalScene => ({
  outputProfile: 'ecommerce-conversion',
  photoType: 'Photo Studio',
  composition: 'centered hero',
  photoMode: 'Hero Landing Page',
  productStateMotion: 'static',
  productStructure: 'standard',
  environmentSettings: 'studio',
  physicalPlacement: 'grounded on physical support plane',
  physicalProperties: 'real materials',
  defaultIngredients: ['citrus zest'],
  customIngredients: [],
  visualWorld: 'studio',
  lighting: 'clinical softbox',
  specialEffects: [],
  productInteraction: 'none',
  viewpointVantage: 'eye-level product view',
  cameraFraming: '45-degree hero angle; standard framing; centered hero composition',
  constraintSuffix: 'LABEL LOCK; PRODUCT LOCK; FRAME INTEGRITY LOCK.',
  ...overrides,
});

describe('atmosphereResolver', () => {
  it('includes deterministic core physics and label safety lines', () => {
    const prompt = resolveAtmosphere(makeScene());
    expect(prompt).toContain('PHYSICS_RULES');
    expect(prompt).toContain('no floating without shadow anchor');
    expect(prompt).toContain('respect real-world scale');
    expect(prompt).toContain('label protection');
    expect(prompt).toContain('label visibility');
  });

  it('does not duplicate core blocks', () => {
    const prompt = resolveAtmosphere(makeScene());
    expect(prompt.match(/ATMOSPHERE_RESOLUTION:/g)?.length).toBe(1);
    expect(prompt.match(/PHYSICS_RULES/g)?.length).toBe(1);
    expect(prompt.match(/INGREDIENT_RESOLUTION:/g)?.length).toBe(1);
  });

  it('skips INGREDIENT_RESOLUTION when there are no ingredients', () => {
    const prompt = resolveAtmosphere(
      makeScene({
        defaultIngredients: [],
        customIngredients: [],
      })
    );
    expect(prompt).not.toContain('INGREDIENT_RESOLUTION:');
  });

  it('infers Splash Shot effect from photoMode when specialEffects is empty', () => {
    const prompt = resolveAtmosphere(
      makeScene({
        photoMode: 'Splash Shot',
        specialEffects: [],
      })
    );
    expect(prompt).toContain('gravity arc');
  });
});
