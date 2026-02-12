import { describe, it, expect } from 'vitest';
import { resolveAtmosphere, type CanonicalScene } from '../atmosphereResolver';
import { validateAtmosphere } from '../atmosphereValidator';

const base: Omit<CanonicalScene, 'photoMode' | 'specialEffects'> = {
  outputProfile: 'ecommerce-conversion',
  photoType: 'Photo Studio',
  composition: 'centered hero composition',
  productStateMotion: 'pouring',
  productStructure: 'standard',
  environmentSettings: 'studio',
  physicalPlacement: 'grounded on physical support plane',
  physicalProperties: 'real materials, scale fidelity',
  defaultIngredients: [],
  customIngredients: [],
  visualWorld: 'studio',
  lighting: 'clinical softbox',
  productInteraction: 'none',
  viewpointVantage: 'eye-level product view',
  cameraFraming: '45-degree hero angle; standard framing; centered hero composition',
  constraintSuffix: 'PRODUCT LOCK. LABEL LOCK. FRAME INTEGRITY LOCK.',
};

describe('special effects physics enforcement', () => {
  it('Splash Shot includes gravity arc', () => {
    const scene: CanonicalScene = { ...base, photoMode: 'Splash Shot', specialEffects: ['Splash Shot'] };
    const prompt = resolveAtmosphere(scene);
    expect(prompt).toContain('gravity arc');
    const validation = validateAtmosphere(scene, prompt);
    expect(validation.errors.some(e => e.code === 'EFFECT_SPLASH_MISMATCH')).toBe(false);
  });

  it('Condensation includes cold-surface', () => {
    const scene: CanonicalScene = { ...base, photoMode: 'Condensation Droplets', specialEffects: ['Condensation Droplets'] };
    const prompt = resolveAtmosphere(scene);
    expect(prompt).toContain('cold-surface');
    const validation = validateAtmosphere(scene, prompt);
    expect(validation.errors.some(e => e.code === 'EFFECT_CONDENSATION_MISMATCH')).toBe(false);
  });

  it('Underwater Split includes waterline', () => {
    const scene: CanonicalScene = {
      ...base,
      photoMode: 'Underwater Split',
      visualWorld: 'underwater',
      environmentSettings: 'underwater',
      lighting: 'underwater refracted directional light',
      specialEffects: ['Underwater Split'],
    };
    const prompt = resolveAtmosphere(scene);
    expect(prompt).toContain('waterline');
    const validation = validateAtmosphere(scene, prompt);
    expect(validation.errors.some(e => e.code === 'EFFECT_UNDERWATER_MISMATCH')).toBe(false);
  });

  it('Pool Water includes ripple behavior', () => {
    const scene: CanonicalScene = { ...base, photoMode: 'Pool Water', specialEffects: ['Pool Water'] };
    const prompt = resolveAtmosphere(scene);
    expect(prompt.toLowerCase()).toContain('ripples');
    expect(prompt.toLowerCase()).toContain('bounded displacement');
  });

  it('Foam includes bubble tension behavior', () => {
    const scene: CanonicalScene = { ...base, photoMode: 'Foam & Texture', specialEffects: ['Foam'] };
    const prompt = resolveAtmosphere(scene);
    expect(prompt.toLowerCase()).toContain('bubble tension');
  });
});
