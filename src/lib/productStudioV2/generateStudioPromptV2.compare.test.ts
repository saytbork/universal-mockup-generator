// Comparative test for strict validation of modular vs. legacy generateStudioPromptV2
import { generateStudioPromptV2 } from './generateStudioPromptV2';
import { generateStudioPromptV2_legacy } from './generateStudioPromptV2.legacy';
import { getTestStates } from './testStates'; // Should provide real StudioUIState samples for Wine, Coffee, Generic
import crypto from 'crypto';

describe('generateStudioPromptV2 strict output validation', () => {
  const testStates = getTestStates();

  testStates.forEach(({ name, state }) => {
    it(`should produce identical output for ${name}`, () => {
      const legacyPrompt = generateStudioPromptV2_legacy(state);
      const modularPrompt = generateStudioPromptV2(state);
      expect(legacyPrompt).toEqual(modularPrompt);
      expect(legacyPrompt.length).toEqual(modularPrompt.length);
      expect(hash(legacyPrompt)).toEqual(hash(modularPrompt));
    });
  });
});

function hash(str: string) {
  return crypto.createHash('sha256').update(str).digest('hex');
}
