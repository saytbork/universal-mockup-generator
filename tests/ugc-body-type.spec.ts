import { test, expect } from 'playwright/test';
import { mapLifestyleToPromptOptions } from '../src/lib/promptEngine/mapLifestyleToPromptOptions';
import { promptEngine } from '../src/lib/promptEngine/index';

test('UGC injects body type anchors (Plus size)', () => {
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
      environmentContext: { macro: 'Living Room', micro: 'Coffee table' },

      age: 30,
      gender: 'Female',
      bodyType: 'Plus size',

      timeOfDay: 'Afternoon',
      lightingStyle: 'Natural',
    } as any,
    {},
    false
  );

  const prompt = promptEngine.build(mapped as any);
  expect(prompt).toMatch(/BUILD ANCHOR: Subject must have a/i);
  expect(prompt).toMatch(/PHYSIQUE DETAILS: Plus-size figure/i);
  expect(prompt).toMatch(/BODY TYPE ANCHOR: Plus size/i);
  expect(prompt).not.toMatch(/\b(haze|mist|smoke|steam)\b/i);
});
