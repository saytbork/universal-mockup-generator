import type { IndustryProfile } from './types';

export const industryPresets: Record<
  IndustryProfile,
  {
    visualIntent: string;
    lighting: string;
    composition: string;
    world: string;
    tilt: number;
  }
> = {
  supplements: {
    visualIntent: 'conversion',
    lighting: 'clinical-softbox',
    composition: 'centered',
    world: 'clinical-lab-counter',
    tilt: 0,
  },
  wine: {
    visualIntent: 'brand-prestige',
    lighting: 'warm-lateral',
    composition: 'thirds',
    world: 'dark-luxury-studio',
    tilt: 7,
  },
  coffee: {
    visualIntent: 'editorial-ritual',
    lighting: 'natural-light',
    composition: 'balanced',
    world: 'warm-window-editorial',
    tilt: 0,
  },
};
