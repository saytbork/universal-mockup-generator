import { test, expect } from 'playwright/test';
import { promptEngine } from '../src/lib/promptEngine/index';
import { mapLifestyleToPromptOptions } from '../src/lib/promptEngine/mapLifestyleToPromptOptions';

test('Lifestyle 9:16 removes head-to-toe language and enforces vertical fill', () => {
  const mapped = mapLifestyleToPromptOptions(
    {
      sceneIntent: 'environment',
      creationIntent: 'brand',
      creationMode: 'Aesthetic Builder',
      compositionMode: 'Lifestyle Showcase',
      noPerson: false,
      sameCreatorAcrossScenes: false,
      ugcRealMode: false,

      // Person (kept minimal; not testing identity logic)
      age: 30,
      gender: 'Female',

      // 9:16
      aspectRatio: '9:16 (Story)',

      // This previously forced head-to-toe language
      shotType: 'Full body',
      framing: 'Centered',

      environment: 'Living Room',
      timeOfDay: 'Afternoon',
      lightingStyle: 'Natural',
    } as any,
    {},
    false
  );

  const prompt = promptEngine.build(mapped as any);

  expect(prompt).not.toContain('head to toe');
  expect(prompt).not.toContain('head-to-toe');
  expect(prompt).not.toContain('full-length framing from head to toe');
  expect(prompt).toContain('VERTICAL FILL RULE (CRITICAL):');
  expect(prompt).toContain('85–90%');
});

test('Lifestyle 9:16 hero canvas does not shrink the subject for negative space', () => {
  const mapped = mapLifestyleToPromptOptions(
    {
      sceneIntent: 'environment',
      creationIntent: 'brand',
      creationMode: 'Aesthetic Builder',
      compositionMode: 'Lifestyle Showcase',
      noPerson: false,
      sameCreatorAcrossScenes: false,
      ugcRealMode: false,

      age: 30,
      gender: 'Female',

      aspectRatio: '9:16 (Story)',
      shotType: 'Full body',
      framing: 'Centered',

      environment: 'Kitchen',
      timeOfDay: 'Afternoon',
      lightingStyle: 'Natural window',

      ecommerceSidePlacementFlag: true,
      sidePlacement: 'Right',
      ecommerceBackgroundMode: 'white',
      ecommerceBackgroundColor: '#ffffff',
    } as any,
    {},
    false
  );

  const prompt = promptEngine.build(mapped as any);

  expect(prompt).toContain('HERO CANVAS OVERRIDE (9:16):');
  expect(prompt).toContain('VERTICAL FILL RULE (CRITICAL):');
  expect(prompt).not.toContain('head to toe');
});

