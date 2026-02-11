import { generateStudioPromptV2 } from '../../src/lib/productStudioV2/index.ts';
import type { StudioUIState } from '../../src/lib/productStudioV2/index.ts';

type ManualCase = {
  label: string;
  state: StudioUIState;
};

const cases: ManualCase[] = [
  {
    label: 'A. Conversion static hero',
    state: {
      creativeIntent: 'conversion',
      world: 'studio',
      motion: 'static',
      composition: 'hero',
      aspectRatio: '4:5',
      subjectOrientation: 'vertical',
    },
  },
  {
    label: 'B. Splash pouring',
    state: {
      creativeIntent: 'conversion',
      world: 'splash-tank',
      motion: 'pouring',
      composition: 'hero',
      photoMode: 'Splash Shot',
      requestedModifiers: ['splash'],
    },
  },
  {
    label: 'C. Underwater split 1:1 vertical',
    state: {
      creativeIntent: 'conversion',
      world: 'underwater',
      motion: 'pouring',
      composition: 'hero',
      aspectRatio: '1:1',
      photoMode: 'Underwater Split',
      subjectOrientation: 'vertical',
      requestedModifiers: ['splash'],
    },
  },
  {
    label: 'D. Clinical pouring (no physics expected)',
    state: {
      creativeIntent: 'clinical',
      world: 'splash-tank',
      motion: 'pouring',
      composition: 'macro',
      photoMode: 'Splash Shot',
      requestedModifiers: ['splash'],
    },
  },
  {
    label: 'E. Requested splash modifier without authority',
    state: {
      creativeIntent: 'conversion',
      world: 'studio',
      motion: 'static',
      composition: 'hero',
      requestedModifiers: ['splash'],
    },
  },
  {
    label: 'F. Underwater blocks texturedBed even if requested',
    state: {
      creativeIntent: 'conversion',
      world: 'underwater',
      motion: 'pouring',
      composition: 'hero',
      aspectRatio: '1:1',
      photoMode: 'Underwater Split',
      subjectOrientation: 'vertical',
      requestedModifiers: ['texturedBed', 'splash'],
    },
  },
];

const separator = '-'.repeat(84);

for (const testCase of cases) {
  const prompt = generateStudioPromptV2(testCase.state);

  console.log(separator);
  console.log(`--- ${testCase.label} ---`);
  console.log(prompt);
  console.log(separator);
  console.log('');
}
