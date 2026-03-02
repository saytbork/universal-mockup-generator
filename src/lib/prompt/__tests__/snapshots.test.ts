import { describe, it, expect } from 'vitest';
import { resolveAtmosphere, type CanonicalScene } from '../atmosphereResolver';

const MODES = [
  'Hero Landing Page',
  'Color Pop Hero',
  'Ingredient Stack',
  'Ingredient Flat Lay',
  'Routine Carousel',
  'Clinical Lab Counter',
  'Minimal Bathroom Vanity',
  'Dark Premium Studio',
  'Monochrome Brand',
  'Brand Campaign',
  'Soft Wellness Morning',
  'Outdoor Energy Boost',
  'Sunlit Stone Editorial',
  'Golden Sunset Backlit',
  'Bathroom Daylight Clean',
  'Sky Float Minimal',
  'Wet Rock Ripples',
  'Sand Palm Shadows',
  'Botanical Water Garden',
  'Splash Shot',
  'Beach Foam Splash',
  'Pool Water',
  'Foam & Texture',
  'Underwater Split',
] as const;

const makeScene = (photoMode: string): CanonicalScene => ({
  outputProfile: photoMode === 'Clinical Lab Counter' ? 'clinical' : 'ecommerce-conversion',
  photoType: photoMode.includes('Outdoor') || photoMode.includes('Beach') || photoMode.includes('Botanical') ? 'Environment' : 'Photo Studio',
  composition: 'centered hero composition',
  photoMode,
  productStateMotion:
    photoMode.includes('Splash') || photoMode.includes('Foam') || photoMode.includes('Pool') || photoMode.includes('Underwater')
      ? 'pouring'
      : 'static',
  productStructure: 'standard',
  environmentSettings: photoMode.includes('Underwater') ? 'underwater' : 'studio',
  physicalPlacement: photoMode.includes('Underwater') ? 'submerged' : 'grounded on physical support plane',
  physicalProperties: 'real materials, scale fidelity',
  defaultIngredients: photoMode.includes('Ingredient') ? ['mint', 'lemon'] : [],
  customIngredients: [],
  visualWorld: photoMode.includes('Underwater') ? 'underwater' : 'studio',
  lighting: photoMode.includes('Underwater')
    ? 'underwater refracted directional light'
    : photoMode.includes('Outdoor')
      ? 'natural directional sunlight'
      : 'clinical softbox',
  specialEffects: [],
  productInteraction: 'none',
  viewpointVantage: 'eye-level product view',
  cameraFraming: '45-degree hero angle; standard framing; centered hero composition',
  constraintSuffix: 'PRODUCT LOCK. LABEL LOCK. FRAME INTEGRITY LOCK.',
});

describe('resolveAtmosphere snapshots', () => {
  for (const mode of MODES) {
    it(`snapshot: ${mode}`, () => {
      const prompt = resolveAtmosphere(makeScene(mode));
      expect(prompt).toMatchSnapshot();
    });
  }
});
