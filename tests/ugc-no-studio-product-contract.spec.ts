import { test, expect } from 'playwright/test';
import { promptEngine } from '../src/lib/promptEngine/index';
import { mapLifestyleToPromptOptions } from '../src/lib/promptEngine/mapLifestyleToPromptOptions';

test('UGC must not include Product Studio deterministic contract', () => {
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
      environment: 'Home Gym',
      customEnvironment: '',

      age: 47,
      gender: 'Male',
      timeOfDay: 'Afternoon',
      lightingStyle: 'Natural',
    } as any,
    {},
    false
  );

  const prompt = promptEngine.build(mapped as any);

  expect(prompt).not.toContain('GLOBAL MODE');
  expect(prompt).not.toContain('Product Mode: PRODUCT ONLY');
  expect(prompt).not.toContain('No people, no full human presence');
  expect(prompt).not.toContain('The product is always the hero');
});

