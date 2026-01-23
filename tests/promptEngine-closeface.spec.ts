import { test, expect } from 'playwright/test';
import { promptEngine } from '../src/lib/promptEngine/index';
import type { PromptOptions } from '../src/lib/promptEngine/types';

test('UGC close-face selfie blocks lifestyle framing leakage', () => {
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
    personDetails: {
      age: 30,
      productInteraction: 'Holding',
      selfieMode: 'close-face',
      selfieType: 'close-face'
    },
    selfieMode: 'close-face',
    ugcRealModeActive: true,
    ugcCaptureStyleBase: ['close-face'],
    productAssets: [
      {
        id: 'p1',
        heightUnit: 'cm'
      }
    ]
  };

  const prompt = promptEngine.build(options);
  const lower = prompt.toLowerCase();
  expect(prompt).toContain('CLOSE-FACE SELFIE (MANDATORY)');
  expect(prompt).toContain('Face occupies 75–90%');

  const forbidden = [
    // Structural leakage (positive instructions), not "BLOCKED:" lists
    'medium framing from mid-torso up',
    'lifestyle showcase layout',
    'environment-first lifestyle composition'
  ];

  const violations = forbidden.filter(term => lower.includes(term));
  const violationsText = `${violations.length > 0 ? violations.join('\n') : 'NONE'}\n`;
  expect(violationsText).toMatchSnapshot('ugc-selfie-close-face-violations.txt');
});
