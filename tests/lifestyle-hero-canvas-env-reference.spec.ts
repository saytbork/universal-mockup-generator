import { test, expect } from 'playwright/test';
import { promptEngine } from '../src/lib/promptEngine/index';
import { mapLifestyleToPromptOptions } from '../src/lib/promptEngine/mapLifestyleToPromptOptions';

test('Lifestyle hero canvas keeps selected environment as styling reference', () => {
  const sceneState: any = {
    sceneIntent: 'environment',
    noPerson: false,
    ugcRealMode: false,
    creationMode: 'Aesthetic Builder',
    creationIntent: 'brand',
    compositionMode: 'Lifestyle Showcase',
    environmentContext: { macro: 'Home Gym', micro: 'Workout area' },
    environment: 'Home Gym',
    ecommerceSidePlacementFlag: true,
    ecommerceBackgroundMode: 'white',
    ecommerceBackgroundColor: '#FFFFFF',
    ecommerceGradientStart: '#f7f7f7',
    ecommerceGradientEnd: '#d9d9d9',
    ecommerceGradientAngle: '90',
    sidePlacement: 'Left',
    timeOfDay: 'Afternoon',
    lightingStyle: 'Natural',
    age: 30,
    gender: 'Female',
    skinTone: 'Medium Neutral',
    ethnicity: 'Non-specific',
    bodyType: 'Average',
    hairLength: 'Shoulder',
    hairTexture: 'Wavy',
    hairColor: 'Dark brown',
    facialExpression: 'Calm & Serene',
    eyeDirection: 'Looking at camera',
    pose: 'Relaxed Portrait',
    aspectRatio: '1:1 (Square)',
  };

  const options = mapLifestyleToPromptOptions(sceneState, { productAssets: [{} as any] } as any, false);
  const prompt = promptEngine.build(options as any);

  expect(prompt).toContain('Ecommerce canvas overlay is active.');
  expect(prompt).toContain('Environment reference (styling only): Home Gym.');
});
