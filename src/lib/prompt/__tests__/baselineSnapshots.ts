import { describe, it, expect } from 'vitest';
import { resolveAtmosphere, type CanonicalScene } from '../atmosphereResolver';

const baseScene: Omit<CanonicalScene, 'photoMode'> = {
  outputProfile: 'ecommerce-conversion',
  photoType: 'Photo Studio',
  composition: 'centered hero composition',
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

const scenes: CanonicalScene[] = [
  { ...baseScene, photoMode: 'Hero Landing Page' },
  { ...baseScene, photoMode: 'Ingredient Stack', defaultIngredients: ['mint', 'lemon'] },
  { ...baseScene, photoMode: 'Splash Shot', specialEffects: ['Splash Shot'], productStateMotion: 'pouring' },
  { ...baseScene, photoMode: 'Underwater Split', visualWorld: 'underwater', environmentSettings: 'underwater', lighting: 'underwater refracted directional light' },
  { ...baseScene, photoMode: 'Clinical Lab Counter', outputProfile: 'clinical' },
];

describe('baselineSnapshots', () => {
  for (const scene of scenes) {
    it(`baseline: ${scene.photoMode}`, () => {
      const prompt = resolveAtmosphere(scene);
      console.log(`\\n--- ${scene.photoMode} ---\\n${prompt}\\n`);
      expect(prompt).toMatchSnapshot();
    });
  }
});
