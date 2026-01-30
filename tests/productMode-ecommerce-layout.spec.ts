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
      ecommerceSidePlacementFlag: true,
      sidePlacement: 'Left',
      ecommerceBackgroundMode: 'gradient',
      ecommerceGradientStart: '#f7f7f7',
      ecommerceGradientEnd: '#d9d9d9',
      ecommerceGradientAngle: '90',
    } as any,
    {}
  );

  expect(mapped.creationMode).toBe('ecom-blank');
  expect(mapped.compositionMode).toBe('Ecommerce Blank Space');
  expect(mapped.ecommerceBlankSpaceMode).toBe(true);
  expect(mapped.sidePlacement).toBe('left');
  expect(mapped.bgGradient).toEqual({ startColor: '#f7f7f7', endColor: '#d9d9d9', angle: 90 });
});

test('Product mode accepts raw aspect ratios (product studio output format)', () => {
  const mapped = mapProductModeToPromptOptions(
    {
      sceneIntent: 'ecommerce',
      creationIntent: 'product',
      noPerson: true,
      ugcRealMode: false,
      selfieMode: 'None',
      aspectRatio: '4:5',
      sidePlacement: 'Center',
      ecommerceBackgroundMode: 'white',
      ecommerceBackgroundColor: '#ffffff',
    } as any,
    {}
  );

  const prompt = promptEngine.build(mapped as any);
  expect(mapped.aspectRatio).toBe('4:5');
  expect(prompt).toContain('Aspect Ratio: 4:5');
});

test('Product mode accepts labeled landscape aspect ratio', () => {
  const mapped = mapProductModeToPromptOptions(
    {
      sceneIntent: 'ecommerce',
      creationIntent: 'product',
      noPerson: true,
      ugcRealMode: false,
      selfieMode: 'None',
      aspectRatio: '16:9 (Landscape)',
      sidePlacement: 'Center',
      ecommerceBackgroundMode: 'white',
      ecommerceBackgroundColor: '#ffffff',
    } as any,
    {}
  );

  const prompt = promptEngine.build(mapped as any);
  expect(mapped.aspectRatio).toBe('16:9');
  expect(prompt).toContain('Aspect Ratio: 16:9');
});
