import { test, expect } from 'playwright/test';
import { promptEngine } from '../src/lib/promptEngine/index';
import type { PromptOptions } from '../src/lib/promptEngine/types';

test('UGC high-angle capture activates selfie capture builder', () => {
  const options: PromptOptions = {
    contentStyle: 'ugc',
    creationIntent: 'ugc',
    creationMode: 'lifestyle',
    aspectRatio: '1:1',
    camera: 'front-facing smartphone camera',
    setting: 'Kitchen',
    lighting: 'Mixed domestic lighting',
    perspective: 'front',
    environmentOrder: 'normal',
    productPlane: 'mid',
    personIncluded: true,
    ugcRealModeActive: true,
    ugcCaptureStyleBase: ['high-angle'],
  };

  const prompt = promptEngine.build(options);
  expect(prompt).toContain('UGC SELFIE CAPTURE (FRONT CAMERA — HARD CONSTRAINT):');
  expect(prompt).toContain('High-angle vantage');
  expect(prompt).toContain('pitch between +6° to +10° OR −6° to −10°');
  expect(prompt).toContain('no background separation');
});
