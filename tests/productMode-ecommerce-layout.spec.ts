import { test, expect } from 'playwright/test';
import { promptEngine } from '../src/lib/promptEngine/index';
import { mapProductModeToPromptOptions } from '../src/lib/promptEngine/mapProductModeToPromptOptions';

test('Product mode ecommerce canvas maps bg + side placement', () => {
  const mapped = mapProductModeToPromptOptions(
    {
      sceneIntent: 'ecommerce',
      creationIntent: 'product',
      noPerson: true,
      ugcRealMode: false,
      selfieMode: 'None',
      aspectRatio: '1:1 (Square)',
      sidePlacement: 'Left',
      ecommerceBackgroundMode: 'gradient',
      ecommerceGradientStart: '#f7f7f7',
      ecommerceGradientEnd: '#d9d9d9',
      ecommerceGradientAngle: '90',
    } as any,
    {}
  );

  const prompt = promptEngine.build(mapped as any);
  expect(prompt).toContain('Ecommerce blank-space');
  expect(prompt).toContain('Product anchored on the left side of the frame');
  expect(prompt).toContain('Background gradient: linear 90°');
  expect(prompt).not.toContain('MODEL REFERENCE OVERRIDE:');
  expect(prompt).not.toContain('year-old');
});

