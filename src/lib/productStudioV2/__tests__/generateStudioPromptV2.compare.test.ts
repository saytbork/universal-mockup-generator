// Comparative test for strict validation of modular vs. legacy generateStudioPromptV2
import { generateStudioPromptV2 } from '../index';
import { generateStudioPromptV2_legacy } from '../generateStudioPromptV2.legacy';
import { getTestStates } from '../testStates'; // Should provide real StudioUIState samples for Wine, Coffee, Generic
import crypto from 'crypto';

describe('generateStudioPromptV2 strict output validation', () => {
  const testStates = getTestStates();

  testStates.forEach(({ name, state }) => {
    it(`should produce identical output for ${name}`, () => {
      const legacyPrompt = generateStudioPromptV2_legacy(state);
      const modularPrompt = generateStudioPromptV2(state);
      // Instrumentation for debugging
      // eslint-disable-next-line no-console
      console.log(`PROFILE: ${state.visualProfile}`);
      // eslint-disable-next-line no-console
      console.log(`LEGACY LENGTH: ${legacyPrompt.length}`);
      // eslint-disable-next-line no-console
      console.log(`MODULAR LENGTH: ${modularPrompt.length}`);
      expect(legacyPrompt).toEqual(modularPrompt);
      expect(legacyPrompt.length).toEqual(modularPrompt.length);
      expect(hash(legacyPrompt)).toEqual(hash(modularPrompt));
    });
  });
});

function hash(str: string) {
  return crypto.createHash('sha256').update(str).digest('hex');
}
