import { describe, it, expect } from 'vitest';
import { resolveAtmosphere, type CanonicalScene } from '../atmosphereResolver';

const photoModes = [
  'Hero Landing Page',
  'Color Pop Hero',
  'Ingredient Stack',
  'Ingredient Flat Lay',
  'Acrylic Blocks',
  'Splash Shot',
  'Foam & Texture',
  'Routine Carousel',
  'Clinical Lab Counter',
  'Golden Mist Aura',
  'Candy Gradient Lab',
  'UGC Premium Simulation',
  'Underwater Split',
  'Beach Foam Splash',
] as const;

const makeScene = (photoMode: string): CanonicalScene => ({
  outputProfile: 'ecommerce-conversion',
  photoType: 'Photo Studio',
  composition: 'centered hero composition',
  photoMode,
  productStateMotion: photoMode.includes('Splash') || photoMode.includes('Foam') ? 'pouring' : 'static',
  productStructure: 'standard',
  environmentSettings: photoMode.includes('Underwater') ? 'underwater' : 'studio',
  physicalPlacement: 'grounded on physical support plane',
  physicalProperties: 'real materials, scale fidelity',
  defaultIngredients: [],
  customIngredients: [],
  visualWorld: photoMode.includes('Underwater') ? 'underwater' : 'studio',
  lighting: photoMode.includes('Underwater')
    ? 'underwater refracted directional light'
    : 'clinical softbox',
  specialEffects: [],
  productInteraction: 'none',
  viewpointVantage: 'eye-level product view',
  cameraFraming: '45-degree hero angle; standard framing; centered hero composition',
  constraintSuffix: 'PRODUCT LOCK. LABEL LOCK. FRAME INTEGRITY LOCK.',
});

describe('photoModes.massive', () => {
  for (const photoMode of photoModes) {
    it(`resolves required blocks for mode: ${photoMode}`, () => {
      const prompt = resolveAtmosphere(makeScene(photoMode));
      expect(prompt).toContain('ATMOSPHERE_RESOLUTION:');
      expect(prompt).toContain('PHYSICS_RULES');
      expect(prompt).toContain('BACKGROUND_ISOLATION');
    });
  }
});
