import { test, expect } from 'playwright/test';
import { promptEngine } from '../src/lib/promptEngine/index';
import { mapLifestyleToPromptOptions } from '../src/lib/promptEngine/mapLifestyleToPromptOptions';

test('Formulation Story uses selected person identity (no talent ref required)', () => {
  const mapped = mapLifestyleToPromptOptions(
    {
      sceneIntent: 'environment',
      creationIntent: 'brand',
      creationMode: 'Lifestyle UGC',
      compositionMode: '',
      noPerson: false,
      sameCreatorAcrossScenes: false,

      // Person identity (must be respected)
      age: 55,
      gender: 'Female',
      ethnicity: 'White / European descent',
      skinTone: 'Medium Neutral',
      bodyType: 'Plus size',
      eyeColor: 'Brown',
      hairLength: 'Short',
      hairTexture: 'Curly',
      hairColor: 'Black',
      hairState: 'natural',

      // Formulation story (expert persona)
      formulationStoryEnabled: true,
      expertRole: 'doctor',
      expertName: '',
      expertCredentials: '',
      expertAttire: 'white_medical_coat',
      expertBadgePreference: 'name_only',
      labVibe: 'Clean Lab',

      // Non-critical defaults
      ugcRealMode: false,
      environment: 'Kitchen',
      customEnvironment: '',
      timeOfDay: 'Afternoon',
      lightingStyle: 'Natural window',
      productInteraction: 'Holding',
      productStructure: 'single',
      props: 'None',
      hair: 'Medium',
      wardrobe: '',
      heroPersona: ''
    } as any,
    {},
    false
  );

  const prompt = promptEngine.build(mapped as any);

  expect(prompt).toContain('55-year-old');
  expect(prompt).toContain('Female');
  expect(prompt).toContain('White / European descent');
  expect(prompt).toContain('The expert is described as a medical doctor / physician (MD).');
});

test('Formulation Story respects Optional Talent Reference (model ref locks identity and injects override)', () => {
  const mapped = mapLifestyleToPromptOptions(
    {
      sceneIntent: 'environment',
      creationIntent: 'brand',
      creationMode: 'Lifestyle UGC',
      compositionMode: '',
      noPerson: false,
      sameCreatorAcrossScenes: false,

      // Person identity values should not override the reference
      age: 30,
      gender: 'Male',

      // Formulation story enabled
      formulationStoryEnabled: true,
      expertRole: 'doctor',
      expertName: '',
      expertCredentials: '',
      expertAttire: 'white_medical_coat',
      expertBadgePreference: 'name_only',
      labVibe: 'Clean Lab',

      // Non-critical defaults
      ugcRealMode: false,
      environment: 'Kitchen',
      timeOfDay: 'Afternoon',
      lightingStyle: 'Natural window',
      productInteraction: 'Holding',
      productStructure: 'single',
      props: 'None',
      heroPersona: ''
    } as any,
    {},
    true
  );

  const prompt = promptEngine.build(mapped as any);
  expect(prompt).toContain('MODEL REFERENCE OVERRIDE:');
  expect(prompt).not.toContain('[IDENTITY_VARIATION_TOKEN:');
});
