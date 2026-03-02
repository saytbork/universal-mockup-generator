import { describe, it, expect } from 'vitest';
import type { CanonicalScene } from '../atmosphereResolver';
import { validateAtmosphere } from '../atmosphereValidator';

const baseScene: CanonicalScene = {
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

describe('world conflict matrix', () => {
  it('Underwater + Softbox -> critical', () => {
    const scene = { ...baseScene, visualWorld: 'underwater', photoMode: 'Underwater Split' };
    const prompt = 'ATMOSPHERE_RESOLUTION: Lighting authority: clinical softbox. PHYSICS_RULES (GLOBAL): no floating without shadow anchor; contact shadow coherence enforced; respect real-world scale.';
    const result = validateAtmosphere(scene, prompt);
    expect(result.errors.some(e => e.code === 'WORLD_LIGHTING_CONFLICT_UNDERWATER' && e.severity === 'critical')).toBe(true);
  });

  it('Studio + Underwater lighting -> critical', () => {
    const scene = { ...baseScene, visualWorld: 'studio' };
    const prompt = 'ATMOSPHERE_RESOLUTION: Lighting authority: underwater refracted directional light. PHYSICS_RULES (GLOBAL): no floating without shadow anchor; contact shadow coherence enforced; respect real-world scale.';
    const result = validateAtmosphere(scene, prompt);
    expect(result.errors.some(e => e.code === 'WORLD_LIGHTING_CONFLICT_STUDIO' && e.severity === 'critical')).toBe(true);
  });

  it('Outdoor + Clinical Softbox -> warning', () => {
    const scene = { ...baseScene, visualWorld: 'outdoor', photoType: 'Environment' };
    const prompt = 'ATMOSPHERE_RESOLUTION: Lighting authority: clinical softbox. PHYSICS_RULES (GLOBAL): no floating without shadow anchor; contact shadow coherence enforced; respect real-world scale.';
    const result = validateAtmosphere(scene, prompt);
    expect(result.errors.some(e => e.code === 'WORLD_LIGHTING_WARNING_OUTDOOR' && e.severity === 'warning')).toBe(true);
  });

  it('Device product + Fruit Garnish -> critical', () => {
    const scene = {
      ...baseScene,
      productStructure: 'device',
      specialEffects: ['Fruit Garnish / Citrus Accents'],
    };
    const prompt = 'ATMOSPHERE_RESOLUTION: SPECIAL_EFFECT: fruit garnish accent. PHYSICS_RULES (GLOBAL): no floating without shadow anchor; contact shadow coherence enforced; respect real-world scale.';
    const result = validateAtmosphere(scene, prompt);
    expect(result.errors.some(e => e.code === 'PRODUCT_TYPE_EFFECT_CONFLICT_DEVICE' && e.severity === 'critical')).toBe(true);
  });

  it('Powder + Underwater -> warning', () => {
    const scene = {
      ...baseScene,
      productStructure: 'powder',
      specialEffects: ['Underwater Split'],
    };
    const prompt = 'ATMOSPHERE_RESOLUTION: SPECIAL_EFFECT: clean waterline separation with realistic refraction and caustic light behavior. PHYSICS_RULES (GLOBAL): no floating without shadow anchor; contact shadow coherence enforced; respect real-world scale.';
    const result = validateAtmosphere(scene, prompt);
    expect(result.errors.some(e => e.code === 'PRODUCT_TYPE_EFFECT_WARNING_POWDER' && e.severity === 'warning')).toBe(true);
  });
});
