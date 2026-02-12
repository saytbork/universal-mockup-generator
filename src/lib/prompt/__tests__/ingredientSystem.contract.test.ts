import { describe, it, expect } from 'vitest';
import { resolveAtmosphere, type CanonicalScene } from '../atmosphereResolver';
import { validateAtmosphere } from '../atmosphereValidator';

const baseScene: Omit<CanonicalScene, 'customIngredients' | 'defaultIngredients'> = {
  outputProfile: 'ecommerce-conversion',
  photoType: 'Photo Studio',
  composition: 'centered hero composition',
  photoMode: 'Ingredient Stack',
  productStateMotion: 'static',
  productStructure: 'standard',
  environmentSettings: 'studio',
  physicalPlacement: 'grounded on physical support plane',
  physicalProperties: 'real materials, scale fidelity',
  visualWorld: 'studio',
  lighting: 'clinical softbox',
  specialEffects: [],
  productInteraction: 'none',
  viewpointVantage: 'eye-level product view',
  cameraFraming: '45-degree hero angle; standard framing; centered hero composition',
  constraintSuffix: 'PRODUCT LOCK. LABEL LOCK. FRAME INTEGRITY LOCK.',
};

describe('ingredient system contract', () => {
  it('customIngredients override defaultIngredients', () => {
    const scene: CanonicalScene = {
      ...baseScene,
      defaultIngredients: ['default mint', 'default lemon'],
      customIngredients: [
        { name: 'fresh lime', density: 'balanced', placement: 'surround' },
        { name: 'sea salt', density: 'minimal', placement: 'base' },
      ],
    };

    const prompt = resolveAtmosphere(scene);
    expect(prompt).toContain('fresh lime');
    expect(prompt).toContain('sea salt');
    expect(prompt).not.toContain('default mint');
    expect(prompt).not.toContain('default lemon');
  });

  it('omits INGREDIENT_RESOLUTION when both ingredient sources are empty', () => {
    const scene: CanonicalScene = {
      ...baseScene,
      defaultIngredients: [],
      customIngredients: [],
    };

    const prompt = resolveAtmosphere(scene);
    expect(prompt).not.toContain('INGREDIENT_RESOLUTION:');
  });

  it('resolves ingredient density from custom ingredients', () => {
    const scene: CanonicalScene = {
      ...baseScene,
      defaultIngredients: ['default mint'],
      customIngredients: [{ name: 'fresh lime', density: 'abundant' }],
    };

    const prompt = resolveAtmosphere(scene);
    expect(prompt).toContain('Ingredient density authority: abundant.');
  });

  it('validator warns for duplicate custom ingredients', () => {
    const scene: CanonicalScene = {
      ...baseScene,
      defaultIngredients: [],
      customIngredients: [{ name: 'mint' }, { name: 'mint' }],
    };

    const prompt = resolveAtmosphere(scene);
    const result = validateAtmosphere(scene, prompt);
    expect(result.errors.some(e => e.code === 'INGREDIENT_DUPLICATE' && e.severity === 'warning')).toBe(true);
  });

  it('validator warns when ingredient count is greater than 6', () => {
    const scene: CanonicalScene = {
      ...baseScene,
      defaultIngredients: [],
      customIngredients: [
        { name: 'a' },
        { name: 'b' },
        { name: 'c' },
        { name: 'd' },
        { name: 'e' },
        { name: 'f' },
        { name: 'g' },
      ],
    };

    const prompt = resolveAtmosphere(scene);
    const result = validateAtmosphere(scene, prompt);
    expect(result.errors.some(e => e.code === 'INGREDIENT_LIMIT_EXCEEDED' && e.severity === 'warning')).toBe(true);
  });

  it('each ingredient appears inside prompt text', () => {
    const scene: CanonicalScene = {
      ...baseScene,
      defaultIngredients: [],
      customIngredients: [{ name: 'dragon fruit' }, { name: 'mint leaf' }],
    };

    const prompt = resolveAtmosphere(scene).toLowerCase();
    expect(prompt).toContain('dragon fruit');
    expect(prompt).toContain('mint leaf');
  });
});
