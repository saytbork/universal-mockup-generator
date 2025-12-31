import { test, expect } from 'playwright/test';
import { promptEngine } from '../src/lib/promptEngine/index';
import { mapLifestyleToPromptOptions } from '../src/lib/promptEngine/mapLifestyleToPromptOptions';

test('Lifestyle ecommerce canvas coexists with environment options (bg replace + placement)', () => {
  const mapped = mapLifestyleToPromptOptions(
    {
      sceneIntent: 'environment',
      creationIntent: 'ugc',
      creationMode: 'Lifestyle UGC',
      compositionMode: '',
      noPerson: false,
      sameCreatorAcrossScenes: false,
      ugcRealMode: false,

      // Person
      age: 30,
      gender: 'Female',

      // Environment inputs exist but should be suppressed by canvas
      environment: 'Kitchen',
      timeOfDay: 'Afternoon',
      lightingStyle: 'Natural window',

      // Ecommerce canvas overlay
      ecommerceSidePlacementFlag: true,
      sidePlacement: 'Right',
      ecommerceBackgroundMode: 'gradient',
      ecommerceGradientStart: '#f7f7f7',
      ecommerceGradientEnd: '#d9d9d9',
      ecommerceGradientAngle: '90',
      ecommerceBackgroundColor: '#ffffff',
    } as any,
    {},
    false
  );

  const prompt = promptEngine.build(mapped as any);
  expect(prompt).toContain('Background replacement mode');
  expect(prompt).toContain('Product and person placement: right side.');
  expect(prompt).toContain('Background gradient: linear 90°');
  expect(prompt).not.toContain('Environment:');
  expect(prompt).not.toContain('inside a kitchen');
  expect(prompt).not.toContain('Active Insert Mode');
  expect(prompt).not.toContain('inside this environment');
});
