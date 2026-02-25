import { generateStudioPromptV2 as newGenerateStudioPromptV2 } from '../index';
import { oldGenerateStudioPromptV2 } from '../oldGenerateStudioPromptV2';
import crypto from 'crypto';

const wineV4State = {
  visualProfile: 'wine',
  wineEngineVersion: 4,
  winePrestigeMode: true,
  wineEnvironmentVariation: 'luxury-dining',
  wineGlassMode: 'filled',
  wineClosureType: 'cork',
  wineMoodModifier: 'luxury',
  world: 'studio',
  composition: 'hero',
  motion: 'static',
  advancedControls: true,
  lensOverride: '50mm',
  lightingRigOverride: 'luxury-soft',
  finishOverride: 'glossy',
  customLightColor: '#FFD700',
  accentLightIntensity: 80,
  referenceProductCategory: '',
};

const coffeeState = {
  visualProfile: 'coffee',
  coffeePackagingMode: 'editorial',
  coffeeGlassMode: 'filled',
  coffeeMoodModifier: 'editorial',
  world: 'studio',
  composition: 'hero',
  motion: 'static',
  advancedControls: true,
  lensOverride: '35mm',
  lightingRigOverride: 'editorial-soft',
  finishOverride: 'matte',
  customLightColor: '#A0522D',
  accentLightIntensity: 60,
  referenceProductCategory: '',
};

const genericState = {
  visualProfile: 'generic',
  world: 'studio',
  composition: 'hero',
  motion: 'static',
  advancedControls: true,
  lensOverride: '24mm',
  lightingRigOverride: 'neutral-soft',
  finishOverride: 'satin',
  customLightColor: '#FFFFFF',
  accentLightIntensity: 50,
  referenceProductCategory: '',
};

function hash(str: string) {
  return crypto.createHash('sha256').update(str).digest('hex');
}

describe('Prompt Pipeline Validation', () => {
  test('Wine V4 complex', () => {
    const oldPrompt = oldGenerateStudioPromptV2(wineV4State);
    const newPrompt = newGenerateStudioPromptV2(wineV4State);
    expect(oldPrompt).toBe(newPrompt);
    expect(oldPrompt.length).toBe(newPrompt.length);
    expect(hash(oldPrompt)).toBe(hash(newPrompt));
    console.log('Wine V4:', {
      promptEquality: oldPrompt === newPrompt,
      lengthEquality: oldPrompt.length === newPrompt.length,
      hashEquality: hash(oldPrompt) === hash(newPrompt),
    });
  });

  test('Coffee complex', () => {
    const oldPrompt = oldGenerateStudioPromptV2(coffeeState);
    const newPrompt = newGenerateStudioPromptV2(coffeeState);
    expect(oldPrompt).toBe(newPrompt);
    expect(oldPrompt.length).toBe(newPrompt.length);
    expect(hash(oldPrompt)).toBe(hash(newPrompt));
    console.log('Coffee:', {
      promptEquality: oldPrompt === newPrompt,
      lengthEquality: oldPrompt.length === newPrompt.length,
      hashEquality: hash(oldPrompt) === hash(newPrompt),
    });
  });

  test('Generic complex', () => {
    const oldPrompt = oldGenerateStudioPromptV2(genericState);
    const newPrompt = newGenerateStudioPromptV2(genericState);
    expect(oldPrompt).toBe(newPrompt);
    expect(oldPrompt.length).toBe(newPrompt.length);
    expect(hash(oldPrompt)).toBe(hash(newPrompt));
    console.log('Generic:', {
      promptEquality: oldPrompt === newPrompt,
      lengthEquality: oldPrompt.length === newPrompt.length,
      hashEquality: hash(oldPrompt) === hash(newPrompt),
    });
  });
});
