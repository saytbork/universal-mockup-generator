import { test, expect } from 'playwright/test';
import { mapSceneToPrompt } from '../src/lib/productStudio/mapSceneToPrompt';

const MARKER = 'STUDIO HARD ENVIRONMENT CONSTRAINT (CRITICAL):';

function beforeMarker(prompt: string): string {
  return prompt.split(MARKER)[0] ?? prompt;
}

test('Studio branding blocks environment-scope photo modes (no outdoor/wellness/domestic injection)', () => {
  const result = mapSceneToPrompt({
    sceneType: 'studio-branding',
    blankSpaceEnabled: true,
    environmentContext: null,
    customEnvironmentText: '',
    customMicroPlaceText: '',
    photoMode: 'Outdoor Energy Boost',
    props: 'folded towel',
    ingredientLayout: 'auto',
    definition: { type: 'Capsules' },
    photoModeConfig: { heroLandingPage: { gradientStyle: 'Soft', negativeSpace: 'Balanced' }, dynamic: {} },
    backgroundColor: '#ffffff',
    gradientEnabled: false,
    gradientStart: '#f7f7f7',
    gradientEnd: '#d9d9d9',
    gradientMid: '#eeeeee',
    lighting: 'clinical-softbox',
  } as any);

  expect(result.prompt).toContain(MARKER);
  const prefix = beforeMarker(result.prompt).toLowerCase();
  expect(prefix).not.toContain('outdoor');
  expect(prefix).not.toContain('wellness');
  expect(prefix).not.toContain('bathroom');
  expect(prefix).not.toContain('ugc');
  expect(prefix).not.toContain('handheld');
  expect(prefix).not.toContain('selfie');
  expect(prefix).not.toContain('towel');
  expect(prefix).not.toContain('linen');
});

test('UGC Premium Simulation is studio-safe in studio branding (no UGC language)', () => {
  const result = mapSceneToPrompt({
    sceneType: 'studio-branding',
    blankSpaceEnabled: true,
    environmentContext: null,
    customEnvironmentText: '',
    customMicroPlaceText: '',
    photoMode: 'UGC Premium Simulation',
    props: 'creator selfie handheld',
    ingredientLayout: 'auto',
    definition: { type: 'Capsules' },
    photoModeConfig: { heroLandingPage: { gradientStyle: 'Soft', negativeSpace: 'Balanced' }, dynamic: {} },
    backgroundColor: '#ffffff',
    gradientEnabled: false,
    gradientStart: '#f7f7f7',
    gradientEnd: '#d9d9d9',
    gradientMid: '#eeeeee',
    lighting: 'clinical-softbox',
  } as any);

  expect(result.prompt).toContain(MARKER);
  const prefix = beforeMarker(result.prompt).toLowerCase();
  expect(prefix).not.toContain('ugc');
  expect(prefix).not.toContain('handheld');
  expect(prefix).not.toContain('selfie');
});

test('Studio-scope photo modes always append studio hard constraint block', () => {
  const result = mapSceneToPrompt({
    sceneType: 'editorial-product',
    blankSpaceEnabled: true,
    environmentContext: null,
    customEnvironmentText: '',
    customMicroPlaceText: '',
    photoMode: 'Tech Clean Studio',
    props: '',
    ingredientLayout: 'auto',
    definition: { type: 'Capsules' },
    photoModeConfig: { heroLandingPage: { gradientStyle: 'Soft', negativeSpace: 'Balanced' }, dynamic: {} },
    backgroundColor: '#ffffff',
    gradientEnabled: false,
    gradientStart: '#f7f7f7',
    gradientEnd: '#d9d9d9',
    gradientMid: '#eeeeee',
    lighting: 'clinical-softbox',
  } as any);

  expect(result.prompt).toContain(MARKER);
});
