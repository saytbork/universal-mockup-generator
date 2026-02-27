/**
 * forbiddenTermWholeWord.test.ts
 *
 * Verifies that all Studio forbidden-term validators use whole-word matching
 * and do not trigger on substrings, hyphenated compounds, or longer tokens.
 */

import { describe, expect, test } from 'vitest';
import { validateNoHumanLanguage } from '../../productStudio/promptBuilder';
import { validateProductModePrompt } from '../../promptEngine/mapProductModeToPromptOptions';
import { validateProductStudioState } from '../../productStudio/validator';
import type { ProductStudioState } from '../../productStudio/types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Minimal stub that satisfies validateForbiddenLanguage's field reads only */
function makeState(
  customEnvironmentText: string,
  customMicroPlaceText = '',
): ProductStudioState {
  return {
    // Enough to bypass validateProductEnvironment and validateLighting guards
    sceneType: 'studio-branding',
    definition: { type: 'custom' },
    lighting: 'studio-soft',
    environmentMacro: 'studio',
    stateMotion: 'static',
    motion: 'none',
    interaction: 'none',
    bundle: { enabled: false },
    // The fields validateForbiddenLanguage actually reads
    customEnvironmentText,
    customMicroPlaceText,
    selectedProps: [],
  } as unknown as ProductStudioState;
}

// ---------------------------------------------------------------------------
// validateNoHumanLanguage (promptBuilder.ts)
// ---------------------------------------------------------------------------

describe('validateNoHumanLanguage — whole-word guard', () => {
  // ✅ Safe: substring contains "model" but not as standalone word
  test('does not throw on "model-based lighting"', () => {
    expect(() => validateNoHumanLanguage('model-based lighting, soft fill', false)).not.toThrow();
  });

  test('does not throw on "Unreal-style rendering"', () => {
    expect(() => validateNoHumanLanguage('Unreal-style rendering with photorealistic textures', false)).not.toThrow();
  });

  test('does not throw on "remodeling"', () => {
    expect(() => validateNoHumanLanguage('surface remodeling with micro-texture detail', false)).not.toThrow();
  });

  test('does not throw on "modeling" (3D software context)', () => {
    expect(() => validateNoHumanLanguage('3D modeling approach with ray-traced lighting', false)).not.toThrow();
  });

  test('does not throw on "mannequin modeling" — wait, "mannequin" not in list', () => {
    expect(() => validateNoHumanLanguage('mannequin display stand on white surface', false)).not.toThrow();
  });

  // ❌ Blocked: standalone "model" is a human subject term
  test('throws on standalone "model" in a human context', () => {
    expect(() => validateNoHumanLanguage('photo model holding product against white background', false))
      .toThrow(/forbidden human language.*model/i);
  });

  test('throws on standalone "model" preceded and followed by spaces', () => {
    expect(() => validateNoHumanLanguage('the model stands next to the bottle', false))
      .toThrow(/forbidden human language.*model/i);
  });

  // Other human terms — should still fire on whole word
  test('throws on standalone "person"', () => {
    expect(() => validateNoHumanLanguage('a person holds the product', false))
      .toThrow(/forbidden human language.*person/i);
  });

  test('does not throw on "personal care" (substring of "person")', () => {
    expect(() => validateNoHumanLanguage('personal care product on marble surface', false)).not.toThrow();
  });

  test('does not throw on "human-grade" compound', () => {
    expect(() => validateNoHumanLanguage('human-grade ingredients in studio light', false)).not.toThrow();
  });

  test('throws on standalone "human" in text', () => {
    expect(() => validateNoHumanLanguage('a human stands behind the product', false))
      .toThrow(/forbidden human language.*human/i);
  });
});

// ---------------------------------------------------------------------------
// validateProductModePrompt (mapProductModeToPromptOptions.ts)
// ---------------------------------------------------------------------------

describe('validateProductModePrompt — whole-word guard', () => {
  test('returns true for "model-based lighting"', () => {
    expect(validateProductModePrompt('studio with model-based lighting approach')).toBe(true);
  });

  test('returns true for "Unreal-style"', () => {
    expect(validateProductModePrompt('Unreal-style product render on gradient background')).toBe(true);
  });

  test('returns true for "remodeling"', () => {
    expect(validateProductModePrompt('surface remodeling detail, macro lens')).toBe(true);
  });

  test('returns false for standalone "model"', () => {
    expect(validateProductModePrompt('photo model holding product against white background')).toBe(false);
  });

  test('returns false for standalone "person"', () => {
    expect(validateProductModePrompt('a person holding the bottle')).toBe(false);
  });

  test('returns true for "personal care" (substring of "person")', () => {
    expect(validateProductModePrompt('premium personal care product on white background')).toBe(true);
  });

  test('returns false for standalone "face"', () => {
    expect(validateProductModePrompt('show the face of the model')).toBe(false);
  });

  test('returns true for "interface" (substring of "face")', () => {
    expect(validateProductModePrompt('clean interface design aesthetic, minimal background')).toBe(true);
  });

  test('returns true for "lifestyle-inspired" (hyphenated)', () => {
    // "lifestyle" IS in the forbidden list — hyphenated should not fire
    expect(validateProductModePrompt('lifestyle-inspired color palette, product only')).toBe(true);
  });

  test('returns false for standalone "lifestyle"', () => {
    expect(validateProductModePrompt('a lifestyle scene with the product')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// validateProductStudioState (validator.ts) — custom text fields
// ---------------------------------------------------------------------------

describe('validateProductStudioState forbidden language — whole-word guard', () => {
  test('no error for "model-based" in customEnvironmentText', () => {
    const state = makeState('model-based lighting setup on marble surface');
    const result = validateProductStudioState(state);
    const modelErrors = result.errors.filter(e => e.includes('"model"'));
    expect(modelErrors).toHaveLength(0);
  });

  test('no error for "Unreal-style" in customEnvironmentText', () => {
    const state = makeState('Unreal-style environment, soft gradient background');
    const result = validateProductStudioState(state);
    expect(result.errors).toHaveLength(0);
  });

  test('no error for "remodeling" in customMicroPlaceText', () => {
    const state = makeState('', 'surface remodeling detail, micro-texture');
    const result = validateProductStudioState(state);
    expect(result.errors).toHaveLength(0);
  });

  test('error for standalone "model" in customEnvironmentText', () => {
    const state = makeState('a model stands next to the product');
    const result = validateProductStudioState(state);
    const modelErrors = result.errors.filter(e => e.includes('"model"'));
    expect(modelErrors.length).toBeGreaterThan(0);
  });

  test('error for standalone "person" in customEnvironmentText', () => {
    const state = makeState('a person holds the product on the table');
    const result = validateProductStudioState(state);
    const personErrors = result.errors.filter(e => e.includes('"person"'));
    expect(personErrors.length).toBeGreaterThan(0);
  });

  test('no error for "personal care" in customEnvironmentText', () => {
    const state = makeState('personal care product on marble slab');
    const result = validateProductStudioState(state);
    const personErrors = result.errors.filter(e => e.includes('"person"'));
    expect(personErrors).toHaveLength(0);
  });
});
