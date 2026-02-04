import { test, expect } from 'playwright/test';
import { promptEngine } from '../src/lib/promptEngine/index';
import { mapLifestyleToPromptOptions } from '../src/lib/promptEngine/mapLifestyleToPromptOptions';

test('UGC selfie pipeline injects Custom Clothes when enabled', () => {
  const mapped = mapLifestyleToPromptOptions(
    {
      sceneIntent: 'environment',
      creationIntent: 'ugc',
      creationMode: 'Lifestyle UGC',
      compositionMode: '',
      noPerson: false,
      sameCreatorAcrossScenes: false,

      ugcRealMode: true,
      ugcCaptureStyleBase: ['torso-level-handheld'],
      environmentContext: { macro: 'Home Gym', micro: 'Workout area' },

      customClothesEnabled: true,
      customClothesGarmentType: 'Hoodie',
      customClothesPrimaryColor: '#FF00AA',
      customClothesFit: 'Oversized',
      customClothesStyle: 'Streetwear',
      customClothesMaterial: 'Cotton',
      customClothesDetail: 'small patch on the sleeve',

      age: 30,
      gender: 'Female',
      timeOfDay: 'Afternoon',
      lightingStyle: 'Natural',
    } as any,
    {},
    false
  );

  const prompt = promptEngine.build(mapped as any);
  expect(prompt).toMatch(/The person is wearing/i);
  expect(prompt).toContain('custom color #FF00AA');
  expect(prompt).toContain('Oversized Hoodie');
  expect(prompt).toContain('in a Streetwear style');
  expect(prompt).toContain('made of Cotton');
});

