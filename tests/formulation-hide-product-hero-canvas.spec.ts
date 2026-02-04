import { test, expect } from 'playwright/test';
import { promptEngine } from '../src/lib/promptEngine/index';
import { mapLifestyleToPromptOptions } from '../src/lib/promptEngine/mapLifestyleToPromptOptions';

test('Formulation Story + Product Visible OFF: no product language, honors 9:16, supports hero canvas background', () => {
  const mapped = mapLifestyleToPromptOptions(
    {
      sceneIntent: 'environment',
      creationIntent: 'brand',
      creationMode: 'Lifestyle UGC',
      compositionMode: '',
      noPerson: false,
      sameCreatorAcrossScenes: false,

      // Environment + hero canvas
      environmentContext: { macro: 'kitchen', micro: 'countertop' },
      ecommerceSidePlacementFlag: true,
      ecommerceBackgroundMode: 'white',
      ecommerceBackgroundColor: '#123456',
      sidePlacement: 'Center',

      // Output
      aspectRatio: '9:16 (Story)',

      // Formulation story (enabled) + hide product
      formulationStoryEnabled: true,
      formulationProductVisible: false,
      expertRole: 'doctor',
      expertName: '',
      expertCredentials: '',
      expertAttire: 'white_medical_coat',
      expertBadgePreference: 'name_only',
      labVibe: 'Clean Lab',

      // Non-critical defaults
      ugcRealMode: false,
      timeOfDay: 'Afternoon',
      lightingStyle: 'Natural window',
      productInteraction: 'Holding',
      productStructure: 'single',
      props: 'None',
    } as any,
    {
      // Simulate uploaded product image being present: product must still be hidden.
      productAssets: [{ id: 'p1' }],
    } as any,
    false
  );

  const prompt = promptEngine.build(mapped as any);
  const lower = prompt.toLowerCase();

  expect(prompt).toContain('ASPECT RATIO: 9:16');
  expect(lower).toContain('no black bars');
  expect(prompt).toContain('Background: neutral solid #123456');

  // Product must be fully suppressed (no prompt contract about preserving uploaded product).
  expect(lower).toContain('no product visible anywhere in frame');
  expect(lower).not.toContain('use the uploaded product image');
  expect(lower).not.toContain('label lock');
  expect(lower).not.toContain('product integrity');
  expect(lower).not.toContain('sharp focus on the subject (product)');
  expect(lower).not.toContain('holding the product');
  expect(lower).not.toContain('product is the primary subject');
  expect(lower).not.toContain('product placement:');
});
