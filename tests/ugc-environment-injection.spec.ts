import { test, expect } from 'playwright/test';
import { mapLifestyleToPromptOptions } from '../src/lib/promptEngine/mapLifestyleToPromptOptions';

test('Raw Domestic UGC honors selected environment even without environmentContext', () => {
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
      environment: 'Kitchen',
      customEnvironment: '',

      age: 30,
      gender: 'Female',
      timeOfDay: 'Afternoon',
      lightingStyle: 'Natural window',
    } as any,
    {},
    false
  ) as any;

  expect(mapped.setting).toBe('Kitchen');
  expect(mapped.sceneEnvironmentDescriptor).toMatch(/Kitchen/i);
  expect(mapped.sceneEnvironmentDescriptor).toMatch(/captured incidentally/i);
});
